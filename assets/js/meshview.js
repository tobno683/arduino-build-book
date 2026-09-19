/* ==========================================================================
   meshview.js - draws the downloadable prints, pixel by pixel.

   build3d.js sorts whole faces back to front, which is exact for its
   scenes of separate boxes on a bench. A print is one solid with holes and
   posts in it: a long thin triangle of a plate can be partly behind a post
   and partly in front of it, and no face order gets that right. So this
   keeps a depth buffer and draws every pixel from the nearest triangle,
   which is always right. It is only used for prints - a few thousand
   triangles each - so doing it in plain JavaScript costs a few ms a frame.

   The mesh it draws is written by tools/make-prints.js in the same run as
   the STL you download, so the picture is the file.
   ========================================================================== */
window.AB = window.AB || {};
AB.meshes = AB.meshes || {};

(function () {
  var waiting = {};

  /* Mesh files are plain scripts that call this, so they load from file://
     where fetch() cannot. */
  AB.addMesh = function (id, m) {
    AB.meshes[id] = m;
    (waiting[id] || []).forEach(function (fn) { fn(m); });
    delete waiting[id];
  };

  AB.loadMesh = function (id, src, cb) {
    if (AB.meshes[id]) { cb(AB.meshes[id]); return; }
    if (waiting[id]) { waiting[id].push(cb); return; }
    waiting[id] = [cb];
    var s = document.createElement('script');
    s.src = src;
    s.onerror = function () {
      (waiting[id] || []).forEach(function (fn) { fn(null); });
      delete waiting[id];
    };
    document.head.appendChild(s);
  };

  var LIGHT = norm([-0.45, -0.6, 0.66]);
  var FOV = 0.3;                              // half-angle - narrow, nearly a drawing
  var HOME_AZ = -0.55, HOME_EL = 0.62;        // three-quarter view from the front left

  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  AB.MeshView = function (canvas, opts) {
    opts = opts || {};
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.az = HOME_AZ;
    this.el = HOME_EL;
    this.rgb = opts.rgb || [222, 128, 52];
    this.mesh = null;
    this._bind();
  };

  AB.MeshView.prototype = {

    setMesh: function (m) {
      var n = m.v.length, P = new Float32Array(n), i;
      for (i = 0; i < n; i++) P[i] = m.v[i] * m.s;
      var F = new Uint32Array(m.f), nf = F.length / 3, N = new Float32Array(nf * 3);
      var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
      for (i = 0; i < n; i += 3) {
        for (var k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], P[i + k]); hi[k] = Math.max(hi[k], P[i + k]); }
      }
      for (i = 0; i < nf; i++) {
        var a = F[i * 3] * 3, b = F[i * 3 + 1] * 3, c = F[i * 3 + 2] * 3;
        var nn = norm(cross([P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]],
                            [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]]));
        N[i * 3] = nn[0]; N[i * 3 + 1] = nn[1]; N[i * 3 + 2] = nn[2];
      }
      this.mesh = { P: P, F: F, N: N, lo: lo, hi: hi,
        c: [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2],
        r: Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2 };
      this.draw();
    },

    reset: function () { this.az = HOME_AZ; this.el = HOME_EL; this.draw(); },

    _bind: function () {
      var self = this, last = null, raf = 0;
      function redraw() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; self.draw(); }); }
      this.cv.addEventListener('pointerdown', function (e) {
        last = [e.clientX, e.clientY];
        try { self.cv.setPointerCapture(e.pointerId); } catch (err) { /* old browsers */ }
      });
      this.cv.addEventListener('pointermove', function (e) {
        if (!last) return;
        self.az -= (e.clientX - last[0]) * 0.011;
        self.el = Math.max(0.08, Math.min(1.5, self.el + (e.clientY - last[1]) * 0.009));
        last = [e.clientX, e.clientY];
        redraw();
      });
      function up() { last = null; }
      this.cv.addEventListener('pointerup', up);
      this.cv.addEventListener('pointercancel', up);
      this.cv.addEventListener('dblclick', function () { self.reset(); });
      if (window.ResizeObserver) new ResizeObserver(redraw).observe(this.cv);
      else window.addEventListener('resize', redraw);
      new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    },

    draw: function () {
      var m = this.mesh;
      if (!m) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = Math.max(1, Math.round(this.cv.clientWidth * dpr));
      var H = Math.max(1, Math.round(this.cv.clientHeight * dpr));
      if (this.cv.width !== W || this.cv.height !== H) { this.cv.width = W; this.cv.height = H; }
      if (!this.img || this.img.width !== W || this.img.height !== H) {
        this.img = this.ctx.createImageData(W, H);
        this.px = new Uint32Array(this.img.data.buffer);
        this.zb = new Float32Array(W * H);
        this.id = new Int32Array(W * H);
        this.off = document.createElement('canvas');
        this.off.width = W; this.off.height = H;
      }
      var px = this.px, zb = this.zb, id = this.id;
      px.fill(0); zb.fill(0); id.fill(-1);

      // Camera orbiting the middle of the part, Z up.
      var P = m.P, nv = P.length / 3, dist = m.r / Math.sin(FOV) * 1.04;
      function camera(az, el) {
        var ce = Math.cos(el), se = Math.sin(el);
        var dir = [ce * Math.sin(az), -ce * Math.cos(az), se];
        var f = [-dir[0], -dir[1], -dir[2]], r = norm(cross(f, [0, 0, 1]));
        return { eye: [m.c[0] + dir[0] * dist, m.c[1] + dir[1] * dist, m.c[2] + dir[2] * dist], f: f, r: r, u: cross(r, f) };
      }
      /* How much the part can be magnified and still fit, taken over the
         home, top and two side views. Fitting the bounding sphere wastes
         most of the frame on a flat plate; fitting the current view makes
         the part swell and shrink as you turn it. This fits them all. */
      if (!m.fit || m.fitW !== W || m.fitH !== H) {
        var K1 = Infinity;
        [[HOME_AZ, HOME_EL], [HOME_AZ, 1.5], [0, 0.1], [Math.PI / 2, 0.1]].forEach(function (v) {
          var cm = camera(v[0], v[1]), mx = 1e-9, my = 1e-9;
          for (var q = 0; q < nv; q++) {
            var ex = P[q * 3] - cm.eye[0], ey = P[q * 3 + 1] - cm.eye[1], ez = P[q * 3 + 2] - cm.eye[2];
            var zz = ex * cm.f[0] + ey * cm.f[1] + ez * cm.f[2];
            // the camera looks at the middle of the part, which lands at the centre of the frame
            mx = Math.max(mx, Math.abs((ex * cm.r[0] + ey * cm.r[1] + ez * cm.r[2]) / zz));
            my = Math.max(my, Math.abs((ex * cm.u[0] + ey * cm.u[1] + ez * cm.u[2]) / zz));
          }
          K1 = Math.min(K1, W * 0.45 / mx, H * 0.42 / my);
        });
        m.fit = K1; m.fitW = W; m.fitH = H;
      }
      var cam = camera(this.az, this.el), eye = cam.eye, f = cam.f, r = cam.r, u = cam.u, K = m.fit;

      var sx = new Float32Array(nv), sy = new Float32Array(nv), iz = new Float32Array(nv), i;
      for (i = 0; i < nv; i++) {
        var dx = P[i * 3] - eye[0], dy = P[i * 3 + 1] - eye[1], dz = P[i * 3 + 2] - eye[2];
        var z = dx * f[0] + dy * f[1] + dz * f[2];
        sx[i] = W / 2 + K * (dx * r[0] + dy * r[1] + dz * r[2]) / z;
        sy[i] = H / 2 - K * (dx * u[0] + dy * u[1] + dz * u[2]) / z;
        iz[i] = 1 / z;
      }

      var F = m.F, N = m.N, nf = F.length / 3, base = this.rgb;
      for (var t = 0; t < nf; t++) {
        var a = F[t * 3], b = F[t * 3 + 1], c = F[t * 3 + 2];
        var nx = N[t * 3], ny = N[t * 3 + 1], nz = N[t * 3 + 2];
        // facing away from the eye: the far side of a closed solid
        if (nx * (eye[0] - P[a * 3]) + ny * (eye[1] - P[a * 3 + 1]) + nz * (eye[2] - P[a * 3 + 2]) <= 0) continue;
        var lam = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
        var k = 0.46 + 0.54 * lam;
        var col = (255 << 24) | (Math.min(255, base[2] * k) << 16) | (Math.min(255, base[1] * k) << 8) | Math.min(255, base[0] * k);

        var x0 = sx[a], y0 = sy[a], x1 = sx[b], y1 = sy[b], x2 = sx[c], y2 = sy[c];
        var area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
        if (area === 0) continue;
        var minX = Math.max(0, Math.floor(Math.min(x0, x1, x2))), maxX = Math.min(W - 1, Math.ceil(Math.max(x0, x1, x2)));
        var minY = Math.max(0, Math.floor(Math.min(y0, y1, y2))), maxY = Math.min(H - 1, Math.ceil(Math.max(y0, y1, y2)));
        var s = area > 0 ? 1 : -1, inv = 1 / area, za = iz[a], zbv = iz[b], zc = iz[c];
        for (var y = minY; y <= maxY; y++) {
          var py = y + 0.5, row = y * W;
          for (var x = minX; x <= maxX; x++) {
            var qx = x + 0.5;
            var w0 = ((x2 - x1) * (py - y1) - (y2 - y1) * (qx - x1)) * s;
            if (w0 < 0) continue;
            var w1 = ((x0 - x2) * (py - y2) - (y0 - y2) * (qx - x2)) * s;
            if (w1 < 0) continue;
            var w2 = ((x1 - x0) * (py - y0) - (y1 - y0) * (qx - x0)) * s;
            if (w2 < 0) continue;
            var d = (w0 * za + w1 * zbv + w2 * zc) * inv * s;
            var o = row + x;
            if (d > zb[o]) { zb[o] = d; px[o] = col; id[o] = t; }
          }
        }
      }

      /* Outline the silhouette and the creases, the way a drawing would:
         a pixel whose neighbour is empty, or a different face at a sharp
         angle, or where the depth steps. Flat shading alone loses the top
         of a standoff against the plate behind it.

         A step is found from the second difference of 1/z, not from the
         difference itself: 1/z is exactly linear across a flat face on
         screen, so its second difference is zero on any plane however
         steeply it is seen, and large only where the surface jumps. A fixed
         depth difference outlined the whole far half of a plate, where one
         pixel spans nearly a millimetre of depth. */
      var edge = new Uint8Array(W * H);
      var STEP = 0.5;                                       // mm
      for (var y2i = 1; y2i < H - 1; y2i++) {
        for (var x2i = 1; x2i < W - 1; x2i++) {
          var p = y2i * W + x2i, fa = id[p];
          if (fa < 0) continue;
          var nbs = [p + 1, p + W, p - 1, p - W];
          for (var j = 0; j < 4; j++) {
            var q = nbs[j], fb = id[q];
            if (fb < 0) { edge[p] = 1; break; }
            if (fb !== fa && N[fa * 3] * N[fb * 3] + N[fa * 3 + 1] * N[fb * 3 + 1] + N[fa * 3 + 2] * N[fb * 3 + 2] < 0.9) {
              edge[p] = 1; break;
            }
          }
          if (edge[p]) continue;
          var zp = 1 / zb[p], z2 = zp * zp;
          if (Math.abs(zb[p - 1] - 2 * zb[p] + zb[p + 1]) * z2 > STEP ||
              Math.abs(zb[p - W] - 2 * zb[p] + zb[p + W]) * z2 > STEP) edge[p] = 1;
        }
      }
      for (i = 0; i < W * H; i++) {
        if (!edge[i]) continue;
        var v = px[i];
        px[i] = (255 << 24) | (((v >> 16 & 255) * 0.5) << 16) | (((v >> 8 & 255) * 0.5) << 8) | ((v & 255) * 0.5);
      }

      // The build plate: a 10 mm grid under the part, drawn first.
      var ctx = this.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var rule = getComputedStyle(document.documentElement).getPropertyValue('--rule').trim() || '#ddd9d0';
      ctx.strokeStyle = rule;
      ctx.lineWidth = dpr;
      var g0x = Math.floor((m.lo[0] - 10) / 10) * 10, g1x = Math.ceil((m.hi[0] + 10) / 10) * 10;
      var g0y = Math.floor((m.lo[1] - 10) / 10) * 10, g1y = Math.ceil((m.hi[1] + 10) / 10) * 10;
      function proj(x, y) {
        var dx = x - eye[0], dy = y - eye[1], dz = -eye[2];
        var z = dx * f[0] + dy * f[1] + dz * f[2];
        return [W / 2 + K * (dx * r[0] + dy * r[1] + dz * r[2]) / z, H / 2 - K * (dx * u[0] + dy * u[1] + dz * u[2]) / z];
      }
      ctx.beginPath();
      for (var gx = g0x; gx <= g1x; gx += 10) { var A = proj(gx, g0y), B = proj(gx, g1y); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); }
      for (var gy = g0y; gy <= g1y; gy += 10) { var C = proj(g0x, gy), D = proj(g1x, gy); ctx.moveTo(C[0], C[1]); ctx.lineTo(D[0], D[1]); }
      ctx.stroke();

      this.off.getContext('2d').putImageData(this.img, 0, 0);
      ctx.drawImage(this.off, 0, 0);
    }
  };
}());
