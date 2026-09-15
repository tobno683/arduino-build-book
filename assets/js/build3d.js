/* ==========================================================================
   build3d.js - a very small 3D renderer, written for this site.

   Why not three.js? Because every scene here is boxes, cylinders and wires
   sitting on a bench, none of which intersect each other. That is exactly
   the case where a painter's-algorithm renderer looks identical to a real
   one, at about 12 KB instead of 600 KB, with no CDN and no build step.

   Model: a scene is a flat list of faces. A face is
     { p:[[x,y,z],...], c:'#rrggbb', both:true?, flat:true?, lod:1?, own:'name' }
   Units are millimetres, Y is up, the bench is the plane y = 0.
   ========================================================================== */
window.AB = window.AB || {};

/* --- vector helpers ----------------------------------------------------- */
var V = AB.V = {
  sub: function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },
  add: function (a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; },
  mul: function (a, s) { return [a[0] * s, a[1] * s, a[2] * s]; },
  cross: function (a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  },
  dot: function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
  len: function (a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); },
  norm: function (a) { var l = V.len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: function (a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
};

/* --- colour helpers ----------------------------------------------------- */
function hex2rgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(rgb, k) {
  return 'rgb(' + Math.min(255, rgb[0] * k | 0) + ',' + Math.min(255, rgb[1] * k | 0) +
         ',' + Math.min(255, rgb[2] * k | 0) + ')';
}

/* --- geometry builders --------------------------------------------------
   All builders emit into local space. `place()` then rotates about Y and
   translates the whole component onto the bench.
   ------------------------------------------------------------------------ */
var G = AB.G = {

  /* Box centred on x/z, sitting with its bottom face at y = by. */
  box: function (x, by, z, w, h, d, c, o) {
    o = o || {};
    var x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, y0 = by, y1 = by + h;
    var top = o.top || c, side = o.side || c;
    var f = [
      { p: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], c: top },   // top
      { p: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]], c: side },  // bottom
      { p: [[x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [x1, y0, z1]], c: side },  // front (+z)
      { p: [[x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z0]], c: side },  // back
      { p: [[x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [x1, y0, z0]], c: side },  // right
      { p: [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], c: side }   // left
    ];
    if (o.own) f.forEach(function (q) { q.own = o.own; });
    if (o.lod) f.forEach(function (q) { q.lod = o.lod; });
    return f;
  },

  /* Flat quad lying on the y plane - used for silkscreen, holes, labels. */
  pad: function (x, y, z, w, d, c, o) {
    o = o || {};
    var q = {
      p: [[x - w / 2, y, z - d / 2], [x + w / 2, y, z - d / 2],
          [x + w / 2, y, z + d / 2], [x - w / 2, y, z + d / 2]],
      c: c, both: true, flat: true
    };
    if (o.own) q.own = o.own;
    if (o.lod) q.lod = o.lod;
    return [q];
  },

  /* Cylinder standing on the Y axis. */
  cyl: function (x, by, z, r, h, c, o) {
    o = o || {};
    var n = o.sides || 10, out = [], i, a0, a1, top = [], bot = [];
    for (i = 0; i < n; i++) {
      a0 = i / n * Math.PI * 2; a1 = (i + 1) / n * Math.PI * 2;
      var p0 = [x + Math.cos(a0) * r, by, z + Math.sin(a0) * r];
      var p1 = [x + Math.cos(a1) * r, by, z + Math.sin(a1) * r];
      out.push({ p: [p0, [p0[0], by + h, p0[2]], [p1[0], by + h, p1[2]], p1], c: c });
      top.push([p0[0], by + h, p0[2]]);
      bot.unshift(p0);
    }
    out.push({ p: top, c: o.top || c });
    out.push({ p: bot, c: o.bottom || c });
    if (o.own) out.forEach(function (q) { q.own = o.own; });
    if (o.lod) out.forEach(function (q) { q.lod = o.lod; });
    return out;
  },

  /* Cylinder lying along X (resistor bodies, wheels, axial caps).
     End caps included, or a cylinder seen end-on is a hollow shell. */
  cylX: function (x, y, z, r, len, c, o) {
    o = o || {};
    var n = o.sides || 8, out = [], i, left = [], right = [];
    for (i = 0; i < n; i++) {
      var a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
      var y0 = y + Math.cos(a0) * r, z0 = z + Math.sin(a0) * r;
      var y1 = y + Math.cos(a1) * r, z1 = z + Math.sin(a1) * r;
      out.push({ p: [[x - len / 2, y0, z0], [x + len / 2, y0, z0], [x + len / 2, y1, z1], [x - len / 2, y1, z1]], c: c });
      right.push([x + len / 2, y0, z0]);
      left.unshift([x - len / 2, y0, z0]);
    }
    out.push({ p: right, c: o.cap || c });
    out.push({ p: left, c: o.cap || c });
    if (o.own) out.forEach(function (q) { q.own = o.own; });
    return out;
  },

  /* A jumper wire: an arc from a to b, swept as a low-poly tube.
     Real jumper wires bow upward, and drawing that bow is what makes a
     wiring picture readable - straight lines all overlap. */
  wire: function (a, b, c, o) {
    o = o || {};
    var segs = o.segs || 9, sides = o.sides || 5, r = o.r || 0.72;
    var lift = o.lift != null ? o.lift : Math.min(26, 5 + V.len(V.sub(b, a)) * 0.24);
    var c1 = [a[0], a[1] + lift, a[2]], c2 = [b[0], b[1] + lift, b[2]];
    var pts = [], i, t, mt;
    for (i = 0; i <= segs; i++) {
      t = i / segs; mt = 1 - t;
      pts.push([
        mt * mt * mt * a[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t * t * t * b[0],
        mt * mt * mt * a[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t * t * t * b[1],
        mt * mt * mt * a[2] + 3 * mt * mt * t * c1[2] + 3 * mt * t * t * c2[2] + t * t * t * b[2]
      ]);
    }
    return G.tube(pts, r, c, sides, o.own, o.exA, o.exB);
  },

  /* Sweep a circle of radius r along a polyline. exA/exB let the two ends
     of a wire rise by different amounts, so "explode" keeps wires attached
     to the parts they run between instead of leaving them floating. */
  tube: function (pts, r, c, sides, own, exA, exB) {
    sides = sides || 5;
    var rings = [], i, j;
    for (i = 0; i < pts.length; i++) {
      var dir = V.norm(V.sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)]));
      if (!V.len(dir)) dir = [0, 0, 1];
      var up = Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
      var rt = V.norm(V.cross(dir, up)), u2 = V.norm(V.cross(rt, dir));
      var ring = [];
      for (j = 0; j < sides; j++) {
        var a = j / sides * Math.PI * 2;
        ring.push(V.add(pts[i], V.add(V.mul(rt, Math.cos(a) * r), V.mul(u2, Math.sin(a) * r))));
      }
      rings.push(ring);
    }
    var out = [], grad = (exA != null || exB != null), n = rings.length - 1;
    var eA = exA || 0, eB = exB || 0;
    for (i = 0; i < n; i++) {
      var e0 = eA + (eB - eA) * (i / n), e1 = eA + (eB - eA) * ((i + 1) / n);
      for (j = 0; j < sides; j++) {
        var k = (j + 1) % sides;
        var q = { p: [rings[i][j], rings[i + 1][j], rings[i + 1][k], rings[i][k]], c: c, own: own };
        if (grad) q.exv = [e0, e1, e1, e0];
        out.push(q);
      }
    }
    return out;
  },

  /* Rotate a face list about Y then translate it - how components are placed. */
  place: function (faces, x, z, ry, dy) {
    var s = Math.sin(ry || 0), co = Math.cos(ry || 0);
    return faces.map(function (f) {
      return {
        p: f.p.map(function (q) {
          return [q[0] * co - q[2] * s + x, q[1] + (dy || 0), q[0] * s + q[2] * co + z];
        }),
        c: f.c, both: f.both, flat: f.flat, lod: f.lod, own: f.own, exv: f.exv, kind: f.kind
      };
    });
  },

  /* Same transform, for a single point (used to resolve pin positions). */
  placePt: function (p, x, z, ry, dy) {
    var s = Math.sin(ry || 0), co = Math.cos(ry || 0);
    return [p[0] * co - p[2] * s + x, p[1] + (dy || 0), p[0] * s + p[2] * co + z];
  }
};

/* --- the viewer --------------------------------------------------------- */
AB.Viewer = function (canvas, scene, opts) {
  opts = opts || {};
  this.cv = canvas;
  this.ctx = canvas.getContext('2d');
  this.scene = scene;                       // { faces:[], labels:[], bounds:{} }
  this.az = opts.az != null ? opts.az : -0.62;
  this.el = opts.el != null ? opts.el : 0.55;
  this.dist = opts.dist || 0;
  this.target = opts.target || [0, 8, 0];
  this.showLabels = opts.labels !== false;
  this.showWires = true;
  this.explode = 0;
  this.explodeTarget = 0;
  this.dragging = false;
  this.hover = null;
  this.dpr = Math.min(window.devicePixelRatio || 1, 2);
  this.onhover = opts.onhover || null;

  if (!this.dist) {
    var b = scene.bounds, span = Math.max(b.w, b.d, 40);
    this.dist = span * 1.22 + 34;
    this.target = [(b.x0 + b.x1) / 2, Math.max(6, b.h * 0.4), (b.z0 + b.z1) / 2];
  }
  this.home = { az: this.az, el: this.el, dist: this.dist };
  this._bind();
  this.resize();
};

AB.Viewer.prototype = {

  resize: function () {
    var w = this.cv.clientWidth || 700;
    var h = Math.round(Math.max(300, Math.min(520, w * 0.58)));
    this.cv.style.height = h + 'px';
    this.cv.width = Math.round(w * this.dpr);
    this.cv.height = Math.round(h * this.dpr);
    this.W = w; this.H = h;
    this.draw();
  },

  _bind: function () {
    var self = this, last = null;

    function pos(e) {
      var r = self.cv.getBoundingClientRect();
      var t = e.touches ? e.touches[0] : e;
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function down(e) {
      self.dragging = true; last = pos(e);
      if (e.cancelable) e.preventDefault();
    }
    function move(e) {
      var p = pos(e);
      if (self.dragging && last) {
        self.az -= (p[0] - last[0]) * 0.0095;
        self.el += (p[1] - last[1]) * 0.0075;
        self.el = Math.max(0.06, Math.min(1.48, self.el));
        last = p;
        self.draw();
        if (e.cancelable) e.preventDefault();
      } else if (!('touches' in e)) {
        self._hoverAt(p);
      }
    }
    function up() { self.dragging = false; last = null; self.draw(); }

    this.cv.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    this.cv.addEventListener('touchstart', down, { passive: false });
    this.cv.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    this.cv.addEventListener('mouseleave', function () { self._hoverAt(null); });
    this.cv.addEventListener('wheel', function (e) {
      e.preventDefault();
      self.dist *= e.deltaY > 0 ? 1.09 : 0.92;
      self.dist = Math.max(45, Math.min(1400, self.dist));
      self.draw();
    }, { passive: false });
    window.addEventListener('resize', function () { self.resize(); });
  },

  setView: function (name) {
    var v = { iso: [-0.62, 0.55], top: [-0.0001, 1.45], front: [0, 0.16], side: [-1.57, 0.3] }[name];
    if (!v) return;
    this.az = v[0]; this.el = v[1];
    this.dist = this.home.dist;
    this.draw();
  },

  setExplode: function (on) {
    var self = this;
    this.explodeTarget = on ? 1 : 0;
    if (this._anim) return;
    this._anim = setInterval(function () {
      self.explode += (self.explodeTarget - self.explode) * 0.22;
      if (Math.abs(self.explodeTarget - self.explode) < 0.004) {
        self.explode = self.explodeTarget;
        clearInterval(self._anim); self._anim = null;
      }
      self.draw();
    }, 16);
  },

  /* camera basis for the current orbit position */
  _cam: function () {
    var t = this.target, ce = Math.cos(this.el), se = Math.sin(this.el);
    var eye = [t[0] + this.dist * ce * Math.sin(this.az),
               t[1] + this.dist * se,
               t[2] + this.dist * ce * Math.cos(this.az)];
    var f = V.norm(V.sub(t, eye));
    var r = V.norm(V.cross(f, [0, 1, 0]));
    var u = V.cross(r, f);
    return { eye: eye, f: f, r: r, u: u, k: (this.H / 2) / Math.tan(0.42) };
  },

  _project: function (p, cam) {
    var d = V.sub(p, cam.eye);
    var z = V.dot(d, cam.f);
    if (z < 1) return null;
    return [this.W / 2 + cam.k * V.dot(d, cam.r) / z, this.H / 2 - cam.k * V.dot(d, cam.u) / z, z];
  },

  _hoverAt: function (p) {
    var name = null;
    if (p && this._drawn) {
      for (var i = this._drawn.length - 1; i >= 0; i--) {
        var f = this._drawn[i];
        if (!f.own) continue;
        if (pointInPoly(p, f.s)) { name = f.own; break; }
      }
    }
    if (name !== this.hover) {
      this.hover = name;
      if (this.onhover) this.onhover(name, p);
      this.draw();
    }
  },

  draw: function () {
    var ctx = this.ctx, cam = this._cam(), self = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);

    var light = V.norm([-0.42, 0.86, 0.3]);
    var lite = this.dragging;                       // drop the fine detail while spinning
    var list = [];

    var faces = this.scene.faces;
    for (var i = 0; i < faces.length; i++) {
      var f = faces[i];
      if (lite && f.lod) continue;
      if (!this.showWires && f.kind === 'wire') continue;

      var ex = this.explode;
      var lift = ex * (f.ex || 0);
      var pts = f.p, n = pts.length, cs = new Array(n), sp = new Array(n);
      var ok = true, depth = 0;
      for (var j = 0; j < n; j++) {
        var dy = f.exv ? ex * f.exv[j] : lift;
        var wp = dy ? [pts[j][0], pts[j][1] + dy, pts[j][2]] : pts[j];
        var s = this._project(wp, cam);
        if (!s) { ok = false; break; }
        sp[j] = s; cs[j] = wp; depth += s[2];
      }
      if (!ok) continue;
      depth /= n;

      // screen-space winding tells us which way the face points
      var area = 0;
      for (j = 0; j < n; j++) {
        var a = sp[j], b = sp[(j + 1) % n];
        area += a[0] * b[1] - b[0] * a[1];
      }
      if (!f.both && area > 0) continue;            // back face of a closed solid

      var nr = V.norm(V.cross(V.sub(cs[1], cs[0]), V.sub(cs[2], cs[0])));
      if (area > 0) nr = V.mul(nr, -1);
      var lam = Math.max(0, V.dot(nr, light));
      var k = 0.58 + 0.46 * lam;
      if (f.flat) k = 0.86 + 0.16 * lam;

      list.push({ s: sp, z: depth, c: f.c, k: k, own: f.own, flat: f.flat, ground: f.ground });
    }

    /* The bench is one very large quad, so its centroid can easily be
       nearer the camera than a small component sitting far out on it -
       and a painter's-algorithm sort would then paint the bench over the
       component. Nothing is ever behind the ground, so take it out of the
       sort and draw it first. */
    list.sort(function (a, b) {
      if (a.ground !== b.ground) return a.ground ? -1 : 1;
      return b.z - a.z;
    });

    for (i = 0; i < list.length; i++) {
      var q = list[i], rgb = hex2rgb(q.c), boost = (q.own && q.own === this.hover) ? 1.17 : 1;
      ctx.beginPath();
      ctx.moveTo(q.s[0][0], q.s[0][1]);
      for (j = 1; j < q.s.length; j++) ctx.lineTo(q.s[j][0], q.s[j][1]);
      ctx.closePath();
      ctx.fillStyle = shade(rgb, q.k * boost);
      ctx.fill();
      if (!q.flat && !lite) {
        ctx.strokeStyle = shade(rgb, q.k * 0.72);
        ctx.lineWidth = 0.55;
        ctx.stroke();
      }
    }
    this._drawn = list;

    if (this.showLabels && !lite) this._drawLabels(cam);
  },

  _drawLabels: function (cam) {
    var ctx = this.ctx, out = [], L = this.scene.labels || [], i;
    for (i = 0; i < L.length; i++) {
      var s = this._project(L[i].p, cam);
      if (!s) continue;
      out.push({ s: s, t: L[i].t, c: L[i].c || '#1d1f1c' });
    }
    out.sort(function (a, b) { return b.s[2] - a.s[2]; });

    ctx.font = '600 9.5px ui-monospace,Menlo,Consolas,monospace';
    ctx.textBaseline = 'middle';

    /* Pin labels cluster badly on a breadboard, where a dozen holes land
       within a few pixels of each other. Nudge each new label upward until
       it clears the ones already placed. */
    var placed = [];
    function free(x, y, w) {
      for (var k = 0; k < placed.length; k++) {
        var r = placed[k];
        if (Math.abs(x - r.x) < (w + r.w) / 2 + 2 && Math.abs(y - r.y) < 16) return false;
      }
      return true;
    }

    for (i = 0; i < out.length; i++) {
      var o = out[i], w = ctx.measureText(o.t).width + 9;
      var x = o.s[0], y = o.s[1] - 14, tries = 0;
      while (!free(x, y, w) && tries < 9) { y -= 15; tries++; }
      placed.push({ x: x, y: y, w: w });
      ctx.beginPath(); ctx.arc(o.s[0], o.s[1], 1.9, 0, 6.3);
      ctx.fillStyle = o.c; ctx.fill();
      ctx.beginPath(); ctx.moveTo(o.s[0], o.s[1]); ctx.lineTo(x, y + 6);
      ctx.strokeStyle = o.c; ctx.lineWidth = 0.7; ctx.stroke();
      roundRect(ctx, x - w / 2, y - 7.5, w, 15, 4);
      ctx.fillStyle = 'rgba(255,255,255,.93)'; ctx.fill();
      ctx.strokeStyle = o.c; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = o.c;
      ctx.textAlign = 'center';
      ctx.fillText(o.t, x, y);
    }
  }
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function pointInPoly(p, poly) {
  var inside = false;
  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

/* --- scene assembly -----------------------------------------------------
   Takes a project's `build` block and turns it into faces + labels by
   looking every component up in AB.comp and resolving every wire endpoint
   to a real 3D coordinate on a real pin.
   ------------------------------------------------------------------------ */
AB.buildScene = function (build) {
  var faces = [], labels = [], inst = {}, i;
  var items = build.parts || [];

  for (i = 0; i < items.length; i++) {
    var it = items[i], def = AB.comp[it.comp];
    if (!def) { console.warn('3D: unknown component "' + it.comp + '"'); continue; }
    var ry = (it.ry || 0) * Math.PI / 180;
    var own = it.label || def.name;
    var local = def.build(it.opt || {});
    var ex = it.ex != null ? it.ex : (def.ex || 0);
    var placed = G.place(local, it.at[0], it.at[1], ry, 0);
    placed.forEach(function (f) { if (!f.own) f.own = own; f.ex = ex; });
    faces = faces.concat(placed);
    inst[it.id] = { def: def, at: it.at, ry: ry, ex: ex, own: own };
  }

  function resolve(ref) {
    var d = ref.indexOf('.');
    if (d < 0) return null;
    var id = ref.slice(0, d), pinName = ref.slice(d + 1), o = inst[id];
    if (!o) { console.warn('3D: unknown part id "' + id + '" in "' + ref + '"'); return null; }
    var lp = o.def.pins ? o.def.pins[pinName] : null;
    if (!lp && o.def.pin) lp = o.def.pin(pinName);
    if (!lp) { console.warn('3D: unknown pin "' + ref + '"'); return null; }
    return { p: G.placePt(lp, o.at[0], o.at[1], o.ry, 0), ex: o.ex };
  }

  var wires = build.wires || [];
  for (i = 0; i < wires.length; i++) {
    var w = wires[i], a = resolve(w.from), b = resolve(w.to);
    if (!a || !b) continue;
    var col = AB.wireColors[w.color] || w.color || '#3a7bd5';
    var wf = G.wire(a.p, b.p, col, { lift: w.lift, exA: a.ex, exB: b.ex });
    wf.forEach(function (f) { f.kind = 'wire'; f.own = w.note || (w.from + ' → ' + w.to); });
    faces = faces.concat(wf);
    if (w.from.indexOf('.') > 0) labels.push({ p: a.p, t: w.from.split('.')[1], c: col });
    if (w.to.indexOf('.') > 0) labels.push({ p: b.p, t: w.to.split('.')[1], c: col });
  }

  // de-duplicate labels that land on the same pin
  var seen = {}, L = [];
  labels.forEach(function (l) {
    var k = l.p.map(function (v) { return v.toFixed(1); }).join(',');
    if (!seen[k]) { seen[k] = 1; L.push(l); }
  });

  // bench + bounds
  var x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, hy = 0;
  faces.forEach(function (f) {
    f.p.forEach(function (p) {
      if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
      if (p[2] < z0) z0 = p[2]; if (p[2] > z1) z1 = p[2];
      if (p[1] > hy) hy = p[1];
    });
  });
  var pad = 16;
  var bench = G.pad((x0 + x1) / 2, -0.8, (z0 + z1) / 2, (x1 - x0) + pad * 2, (z1 - z0) + pad * 2, '#c4bdad');
  bench[0].own = null;
  bench[0].ground = true;
  faces = bench.concat(faces);

  return {
    faces: faces,
    bench: bench[0],
    labels: L,
    bounds: { x0: x0, x1: x1, z0: z0, z1: z1, w: x1 - x0, d: z1 - z0, h: hy }
  };
};

/* Standard wire colours, so "red" means the same thing on every page. */
AB.wireColors = {
  red: '#d6413b', black: '#26262a', blue: '#2f6fd0', green: '#2e9e56',
  yellow: '#e8b62c', orange: '#e07b28', white: '#eceae2', grey: '#8b8f93',
  purple: '#8552c4', brown: '#7a5233', pink: '#e07ba9'
};

/* --- mounting a viewer into the page ------------------------------------ */
AB.mountViewer = function (host, build, opts) {
  opts = opts || {};
  var scene;
  try {
    scene = AB.buildScene(build);
  } catch (err) {
    host.innerHTML = '<p class="empty">The 3D view could not be built for this project.</p>';
    console.error(err);
    return null;
  }

  host.innerHTML =
    '<div class="viewer">' +
      '<div class="viewer-stage">' +
        '<canvas></canvas>' +
        '<div class="viewer-tip"></div>' +
      '</div>' +
      '<div class="viewer-bar">' +
        '<button class="vbtn" data-v="iso" aria-pressed="true">3/4 view</button>' +
        '<button class="vbtn" data-v="top">Top</button>' +
        '<button class="vbtn" data-v="front">Front</button>' +
        '<button class="vbtn" data-v="side">Side</button>' +
        '<button class="vbtn" data-t="labels" aria-pressed="true">Pin labels</button>' +
        '<button class="vbtn" data-t="wires" aria-pressed="true">Wires</button>' +
        '<button class="vbtn" data-t="explode" aria-pressed="false">Explode</button>' +
        '<span class="hint">drag to orbit &middot; scroll to zoom</span>' +
      '</div>' +
    '</div>';

  var cv = host.querySelector('canvas');
  var tip = host.querySelector('.viewer-tip');

  /* The bench and the label text follow the page theme. */
  function retheme() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (scene.bench) scene.bench.c = dark ? '#3a3f36' : '#c4bdad';
    AB.labelInk = dark ? '#0d0f0c' : '#1d1f1c';
    if (host._v) host._v.draw();
  }
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  retheme();

  var v = new AB.Viewer(cv, scene, {
    onhover: function (name, p) {
      if (name && p) {
        tip.textContent = name;
        tip.style.left = p[0] + 'px';
        tip.style.top = p[1] + 'px';
        tip.classList.add('on');
      } else {
        tip.classList.remove('on');
      }
    }
  });

  host._v = v;

  host.querySelectorAll('[data-v]').forEach(function (b) {
    b.addEventListener('click', function () {
      host.querySelectorAll('[data-v]').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      v.setView(b.dataset.v);
    });
  });
  host.querySelectorAll('[data-t]').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (b.dataset.t === 'labels') { v.showLabels = on; v.draw(); }
      if (b.dataset.t === 'wires') { v.showWires = on; v.draw(); }
      if (b.dataset.t === 'explode') { v.setExplode(on); }
    });
  });

  if (opts.legend !== false) {
    var used = {};
    (build.wires || []).forEach(function (w) { if (w.color) used[w.color] = 1; });
    /* Group by meaning, not by colour - otherwise a scene with six signal
       colours renders "Signal" six times. */
    var groups = {};
    Object.keys(used).forEach(function (k) {
      var label = AB.wireLegend[k] || 'Signal';
      (groups[label] = groups[label] || []).push(k);
    });
    var labels = Object.keys(groups);
    if (labels.length) {
      var el = document.createElement('div');
      el.className = 'viewer-legend';
      el.innerHTML = labels.map(function (label) {
        var swatches = groups[label].map(function (k) {
          return '<i class="swatch" style="background:' + (AB.wireColors[k] || k) + '"></i>';
        }).join('');
        return '<span>' + swatches + label + '</span>';
      }).join('');
      host.querySelector('.viewer').appendChild(el);
    }
  }
  return v;
};

AB.wireLegend = {
  red: 'Power', black: 'Ground', brown: 'Load / high current',
  blue: 'Signal', green: 'Signal', yellow: 'Signal', orange: 'Signal',
  white: 'Signal', purple: 'Signal', grey: 'Signal', pink: 'Signal'
};
