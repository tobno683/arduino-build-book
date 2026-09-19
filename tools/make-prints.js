#!/usr/bin/env node
/* ==========================================================================
   tools/make-prints.js

   Turns assets/data/prints.js into the files behind the "Prints to
   download" section of basics/printing.html:

     assets/prints/<file>.stl      binary STL, what you slice
     assets/prints/<id>.scad       the same part in OpenSCAD, to change it
     assets/prints/<file>.mesh.js  the mesh the page draws as the picture
     assets/prints/index.js        sizes, volumes and file sizes for the page

       node tools/make-prints.js           write them
       node tools/make-prints.js --check   compare with what is on disk

   No dependencies, like the rest of the site. Every print here is a stack
   of flat layers - a plate, then standoffs on it, then a wall - so a part
   is described as layers of closed 2D outlines, and this builds the
   solid from those directly instead of needing a CSG library:

     - each outline in a layer becomes a vertical wall
     - where two layers meet, whatever is solid below and open above
       becomes an upward face, and the reverse a downward one

   That only works if outlines never cross or touch - they are either the
   same outline in both layers or clear of each other - and the code checks
   exactly that rather than assuming it. Then it checks the result is a
   closed, consistently wound solid, every edge shared by exactly two
   triangles, before writing anything. A slicer will usually repair a mesh
   that is not; this refuses to ship one.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const OUT_REL = 'assets/prints';
const SEG = 48;          // segments in a full circle - the same as $fn in the .scad files
const Q = 1e4;           // 2D points are rounded to 0.1 micron, so shared edges match exactly
const MIN_GAP = 0.2;     // outlines closer than this count as touching
const SITE = 'https://tobno683.github.io/arduino-build-book/basics/printing.html#prints';

const r4 = v => Math.round(v * Q) / Q;
const pt = (x, y) => [r4(x), r4(y)];

/* --- 2D outlines --------------------------------------------------------- */

function circle(cx, cy, d) {
  const out = [];
  for (let i = 0; i < SEG; i++) {
    const a = 2 * Math.PI * i / SEG;
    out.push(pt(cx + d / 2 * Math.cos(a), cy + d / 2 * Math.sin(a)));
  }
  return out;
}

function rect(x0, y0, x1, y1) {
  return [pt(x0, y0), pt(x1, y0), pt(x1, y1), pt(x0, y1)];
}

function arc(out, cx, cy, r, a0, a1) {
  const n = Math.round(SEG * Math.abs(a1 - a0) / 360);
  for (let i = 0; i <= n; i++) {
    const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
    out.push(pt(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  return out;
}

function roundedRect(x0, y0, x1, y1, r) {
  const out = [];
  arc(out, x1 - r, y0 + r, r, -90, 0);
  arc(out, x1 - r, y1 - r, r, 0, 90);
  arc(out, x0 + r, y1 - r, r, 90, 180);
  arc(out, x0 + r, y0 + r, r, 180, 270);
  return out;
}

function area(loop) {                        // > 0 means counter-clockwise
  let s = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i], b = loop[(i + 1) % loop.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

// Always a copy: callers reverse the result, and the layer outlines are shared.
function ccw(loop) { return area(loop) > 0 ? loop.slice() : loop.slice().reverse(); }

function inLoop(p, loop) {
  let inside = false;
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const xi = loop[i][0], yi = loop[i][1], xj = loop[j][0], yj = loop[j][1];
    if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

// Solid wherever an odd number of a layer's outlines enclose the point.
function inRegion(p, loops) {
  let n = 0;
  for (const l of loops) if (inLoop(p, l)) n++;
  return n % 2 === 1;
}

// A point just to the left of the loop's first edge.
function leftOfFirstEdge(loop) {
  const a = loop[0], b = loop[1];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  return [(a[0] + b[0]) / 2 - dy / len * 1e-3, (a[1] + b[1]) / 2 + dx / len * 1e-3];
}

const key = loop => loop.map(p => p[0] + ',' + p[1]).join(' ');

function bbox(loop) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of loop) {
    if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
    if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
  }
  return [x0, y0, x1, y1];
}

function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function orient(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }

function segsCross(a, b, c, d) {
  const d1 = orient(c, d, a), d2 = orient(c, d, b), d3 = orient(a, b, c), d4 = orient(a, b, d);
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
}

/* Outlines in one set must be simple, and each pair must be clearly apart -
   not crossing, not touching, and no closer than MIN_GAP. */
function checkLoops(loops, where) {
  loops.forEach((l, i) => {
    if (l.length < 3) throw new Error(`${where}: outline ${i} has ${l.length} points`);
    for (let k = 0; k < l.length; k++) {
      const a = l[k], b = l[(k + 1) % l.length];
      if (a[0] === b[0] && a[1] === b[1]) throw new Error(`${where}: outline ${i} repeats a point`);
    }
    if (Math.abs(area(l)) < 1e-6) throw new Error(`${where}: outline ${i} has no area`);
  });
  const boxes = loops.map(bbox);
  for (let i = 0; i < loops.length; i++) {
    for (let j = i + 1; j < loops.length; j++) {
      const A = boxes[i], B = boxes[j];
      if (A[0] > B[2] + MIN_GAP || B[0] > A[2] + MIN_GAP || A[1] > B[3] + MIN_GAP || B[1] > A[3] + MIN_GAP) continue;
      const P = loops[i], R = loops[j];
      for (let a = 0; a < P.length; a++) {
        const p0 = P[a], p1 = P[(a + 1) % P.length];
        for (let b = 0; b < R.length; b++) {
          const q0 = R[b], q1 = R[(b + 1) % R.length];
          if (segsCross(p0, p1, q0, q1) || segDist(p0, q0, q1) < MIN_GAP || segDist(q0, p0, p1) < MIN_GAP) {
            throw new Error(`${where}: outlines ${i} and ${j} touch or cross near (${p0[0].toFixed(2)}, ${p0[1].toFixed(2)})`);
          }
        }
      }
    }
  }
}

/* --- triangulation -------------------------------------------------------
   Ear clipping with hole bridging, following mapbox/earcut: the same
   algorithm, without the z-order speed-ups and without the repair passes
   for self-intersecting input. Everything fed to it here is a clean
   polygon with clean holes, so if it ever stalls it throws rather than
   guessing. Two changes, both explained where they are made: it runs on
   integer coordinates, and it never drops a point for being in line with
   its neighbours.

   earcut is under the ISC licence:

     Copyright (c) 2016, Mapbox

     Permission to use, copy, modify, and/or distribute this software for any
     purpose with or without fee is hereby granted, provided that the above
     copyright notice and this permission notice appear in all copies.

     THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   ------------------------------------------------------------------------- */
function earcut(data, holeIndices) {
  const outerLen = holeIndices.length ? holeIndices[0] * 2 : data.length;
  let outer = linkedList(data, 0, outerLen, true);
  const tris = [];
  if (!outer || outer.next === outer.prev) return tris;
  if (holeIndices.length) outer = eliminateHoles(data, holeIndices, outer);
  earcutLinked(outer, tris, 0);
  return tris;
}

function linkedList(data, start, end, clockwise) {
  let last;
  if (clockwise === (signedArea(data, start, end) > 0)) {
    for (let i = start; i < end; i += 2) last = insertNode(i / 2, data[i], data[i + 1], last);
  } else {
    for (let i = end - 2; i >= start; i -= 2) last = insertNode(i / 2, data[i], data[i + 1], last);
  }
  if (last && equals(last, last.next)) { removeNode(last); last = last.next; }
  return last;
}

/* Earcut also drops points that sit in a straight line with their
   neighbours. Here that is wrong: a point in the middle of a straight run
   can still be the corner of a wall - the labels on the fit test are rows
   of segments whose edges line up - and dropping it leaves the face with
   one long edge where the wall has two short ones, a gap in the mesh. So
   only exact duplicates go. */
function filterPoints(start, end) {
  if (!start) return start;
  if (!end) end = start;
  let p = start, again;
  do {
    again = false;
    if (equals(p, p.next)) {
      removeNode(p);
      p = end = p.prev;
      if (p === p.next) break;
      again = true;
    } else {
      p = p.next;
    }
  } while (again || p !== end);
  return end;
}

function earcutLinked(ear, tris, pass) {
  if (!ear) return;
  let stop = ear;
  while (ear.prev !== ear.next) {
    const prev = ear.prev, next = ear.next;
    if (isEar(ear)) {
      tris.push(prev.i, ear.i, next.i);
      removeNode(ear);
      ear = next.next;
      stop = next.next;
      continue;
    }
    ear = next;
    if (ear === stop) {
      if (!pass) earcutLinked(filterPoints(ear), tris, 1);
      else throw new Error('triangulation stalled - the outline is not a clean polygon');
      break;
    }
  }
}

function isEar(ear) {
  const a = ear.prev, b = ear, c = ear.next;
  if (triArea(a, b, c) >= 0) return false;
  const x0 = Math.min(a.x, b.x, c.x), y0 = Math.min(a.y, b.y, c.y);
  const x1 = Math.max(a.x, b.x, c.x), y1 = Math.max(a.y, b.y, c.y);
  let p = c.next;
  while (p !== a) {
    if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 &&
        !(p.x === a.x && p.y === a.y) &&
        pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
        triArea(p.prev, p, p.next) >= 0) return false;
    p = p.next;
  }
  return true;
}

function eliminateHoles(data, holeIndices, outer) {
  const queue = [];
  for (let i = 0; i < holeIndices.length; i++) {
    const start = holeIndices[i] * 2;
    const end = i < holeIndices.length - 1 ? holeIndices[i + 1] * 2 : data.length;
    queue.push(getLeftmost(linkedList(data, start, end, false)));
  }
  queue.sort((a, b) => {
    let r = a.x - b.x;
    if (r === 0) {
      r = a.y - b.y;
      if (r === 0) r = (a.next.y - a.y) / (a.next.x - a.x) - (b.next.y - b.y) / (b.next.x - b.x);
    }
    return r;
  });
  for (const hole of queue) {
    const bridge = findHoleBridge(hole, outer);
    if (!bridge) throw new Error('could not connect a hole to its outline');
    const back = splitPolygon(bridge, hole);
    filterPoints(back, back.next);
    outer = filterPoints(bridge, bridge.next);
  }
  return outer;
}

function findHoleBridge(hole, outer) {
  let p = outer, qx = -Infinity, m;
  const hx = hole.x, hy = hole.y;
  if (equals(hole, p)) return p;
  do {
    if (equals(hole, p.next)) return p.next;
    if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
      const x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
      if (x <= hx && x > qx) {
        qx = x;
        m = p.x < p.next.x ? p : p.next;
        if (x === hx) return m;
      }
    }
    p = p.next;
  } while (p !== outer);
  if (!m) return null;

  const stop = m, mx = m.x, my = m.y;
  let tanMin = Infinity;
  p = m;
  do {
    if (hx >= p.x && p.x >= mx && hx !== p.x &&
        pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
      const tan = Math.abs(hy - p.y) / (hx - p.x);
      if (locallyInside(p, hole) &&
          (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
        m = p;
        tanMin = tan;
      }
    }
    p = p.next;
  } while (p !== stop);
  return m;
}

function sectorContainsSector(m, p) {
  return triArea(m.prev, m, p.prev) < 0 && triArea(p.next, m, m.next) < 0;
}

function getLeftmost(start) {
  let p = start, left = start;
  do {
    if (p.x < left.x || (p.x === left.x && p.y < left.y)) left = p;
    p = p.next;
  } while (p !== start);
  return left;
}

function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
  return (cx - px) * (ay - py) >= (ax - px) * (cy - py) &&
         (ax - px) * (by - py) >= (bx - px) * (ay - py) &&
         (bx - px) * (cy - py) >= (cx - px) * (by - py);
}

function triArea(p, q, r) { return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y); }
function equals(p1, p2) { return p1.x === p2.x && p1.y === p2.y; }

function locallyInside(a, b) {
  return triArea(a.prev, a, a.next) < 0 ?
    triArea(a, b, a.next) >= 0 && triArea(a, a.prev, b) >= 0 :
    triArea(a, b, a.prev) < 0 || triArea(a, a.next, b) < 0;
}

function splitPolygon(a, b) {
  const a2 = { i: a.i, x: a.x, y: a.y, prev: null, next: null };
  const b2 = { i: b.i, x: b.x, y: b.y, prev: null, next: null };
  const an = a.next, bp = b.prev;
  a.next = b; b.prev = a;
  a2.next = an; an.prev = a2;
  b2.next = a2; a2.prev = b2;
  bp.next = b2; b2.prev = bp;
  return b2;
}

function insertNode(i, x, y, last) {
  const p = { i, x, y, prev: null, next: null };
  if (!last) { p.prev = p; p.next = p; }
  else { p.next = last.next; p.prev = last; last.next.prev = p; last.next = p; }
  return p;
}

function removeNode(p) { p.next.prev = p.prev; p.prev.next = p.next; }

function signedArea(data, start, end) {
  let sum = 0;
  for (let i = start, j = end - 2; i < end; i += 2) {
    sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
    j = i;
  }
  return sum;
}

/* Triangulate one face - an outline with holes - and prove the result
   covers exactly that area, using every point it was given. */
function face(outer, holes, z, up, out, where) {
  const pts = [], holeIdx = [];
  ccw(outer).forEach(p => pts.push(p));
  holes.forEach(h => { holeIdx.push(pts.length); ccw(h).reverse().forEach(p => pts.push(p)); });
  const data = [];
  // Integers - every point is a whole number of 0.1 micron steps - so every
  // left/right test is exact. In floating point, three hole tops that lie
  // exactly in a line came out a hair off it, and were cut as a flat ear.
  pts.forEach(p => data.push(Math.round(p[0] * Q), Math.round(p[1] * Q)));
  const idx = earcut(data, holeIdx);

  const want = Math.abs(area(outer)) - holes.reduce((s, h) => s + Math.abs(area(h)), 0);
  let got = 0;
  const used = new Set(idx);
  for (let t = 0; t < idx.length; t += 3) {
    const a = pts[idx[t]], b = pts[idx[t + 1]], c = pts[idx[t + 2]];
    const s = area([a, b, c]);
    if (s <= 0) throw new Error(`${where}: a triangle came out flat or reversed: ${JSON.stringify([a, b, c])} area ${s}`);
    got += s;
    const A = [a[0], a[1], z], B = [b[0], b[1], z], C = [c[0], c[1], z];
    out.push(up ? [A, B, C] : [A, C, B]);
  }
  if (Math.abs(got - want) > 1e-6 * Math.max(1, want)) {
    throw new Error(`${where}: faces cover ${got.toFixed(4)} mm2, outline is ${want.toFixed(4)}`);
  }
  if (used.size !== pts.length) {
    throw new Error(`${where}: ${pts.length - used.size} outline points were left out of the faces`);
  }
}

/* --- layers to solid ------------------------------------------------------ */

function solid(layers, name) {
  const tris = [];
  layers.forEach((L, i) => {
    L.z0 = r4(L.z0); L.z1 = r4(L.z1);
    if (!(L.z1 > L.z0)) throw new Error(`${name}: layer ${i} has no height`);
    if (i && layers[i - 1].z1 !== L.z0) throw new Error(`${name}: layer ${i} does not start where layer ${i - 1} ends`);
    checkLoops(L.loops, `${name}: layer ${i}`);
    L.keys = L.loops.map(key);
  });

  // Walls: each outline, run so the solid is on its left, faces to its right.
  for (const L of layers) {
    for (const loop of L.loops) {
      const o = inRegion(leftOfFirstEdge(loop), L.loops) ? loop : loop.slice().reverse();
      for (let k = 0; k < o.length; k++) {
        const p = o[k], q = o[(k + 1) % o.length];
        const p0 = [p[0], p[1], L.z0], q0 = [q[0], q[1], L.z0];
        const p1 = [p[0], p[1], L.z1], q1 = [q[0], q[1], L.z1];
        tris.push([p0, q0, q1], [p0, q1, p1]);
      }
    }
  }

  // Horizontal faces, at the bottom, between each pair of layers, and on top.
  const levels = [[null, layers[0], layers[0].z0]];
  for (let i = 0; i + 1 < layers.length; i++) levels.push([layers[i], layers[i + 1], layers[i].z1]);
  levels.push([layers[layers.length - 1], null, layers[layers.length - 1].z1]);

  for (const [A, B, z] of levels) {
    const where = `${name}: z = ${z}`;
    const aKeys = new Set(A ? A.keys : []), bKeys = new Set(B ? B.keys : []);
    const loops = [];
    if (A) A.loops.forEach((l, i) => {
      if (!bKeys.has(A.keys[i])) { loops.push(l); return; }
      // The same outline in both layers is one continuous wall - but only
      // if the solid is on the same side of it above and below.
      const s = leftOfFirstEdge(l);
      if (inRegion(s, A.loops) !== inRegion(s, B.loops)) throw new Error(`${where}: an outline changes sides between layers`);
    });
    if (B) B.loops.forEach((l, i) => { if (!aKeys.has(B.keys[i])) loops.push(l); });
    checkLoops(loops, where);

    // Each outline bounds one region: inside it, outside the outlines
    // directly inside it. Solid below and open above faces up; the
    // reverse faces down; anything else is not a surface.
    const c = loops.map(ccw);
    const areas = c.map(l => Math.abs(area(l)));
    const parent = c.map((l, j) => {
      let best = -1;
      c.forEach((m, i) => {
        if (i !== j && areas[i] > areas[j] && inLoop(l[0], m) && (best < 0 || areas[i] < areas[best])) best = i;
      });
      return best;
    });
    c.forEach((l, i) => {
      const s = leftOfFirstEdge(l);
      const below = A ? inRegion(s, A.loops) : false;
      const above = B ? inRegion(s, B.loops) : false;
      if (below === above) return;
      const holes = c.filter((_, j) => parent[j] === i);
      face(l, holes, z, below, tris, where);
    });
  }
  return tris;
}

/* A closed solid: every edge used exactly once in each direction, no
   flat triangles, positive volume. Returns the welded mesh and its stats. */
function verify(tris, name) {
  const index = new Map(), verts = [], faces = [];
  const id = p => {
    const k = p[0] + ',' + p[1] + ',' + p[2];
    let i = index.get(k);
    if (i === undefined) { i = verts.length; verts.push(p); index.set(k, i); }
    return i;
  };
  let vol = 0;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const t of tris) {
    const f = t.map(id);
    if (f[0] === f[1] || f[1] === f[2] || f[0] === f[2]) throw new Error(`${name}: degenerate triangle`);
    const [a, b, c] = t;
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    if (Math.hypot(n[0], n[1], n[2]) < 1e-9) throw new Error(`${name}: flat triangle`);
    vol += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
    for (const p of t) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); }
    faces.push(f);
  }
  const edges = new Set();
  for (const f of faces) {
    for (let k = 0; k < 3; k++) {
      const e = f[k] + '>' + f[(k + 1) % 3];
      if (edges.has(e)) {
        const p = verts[f[k]], q = verts[f[(k + 1) % 3]];
        throw new Error(`${name}: the edge (${p.join(', ')}) - (${q.join(', ')}) is shared by two triangles facing the same way`);
      }
      edges.add(e);
    }
  }
  for (const e of edges) {
    const [a, b] = e.split('>');
    if (!edges.has(b + '>' + a)) {
      const p = verts[+a];
      throw new Error(`${name}: open edge near (${p.map(v => v.toFixed(2)).join(', ')}) - the mesh is not closed`);
    }
  }
  if (!(vol > 0)) throw new Error(`${name}: volume is ${vol} - the mesh is inside out`);
  return { verts, faces, vol, lo, hi };
}

/* --- the parts ------------------------------------------------------------ */

const corners = (W, D, inset) => [[inset, inset], [W - inset, inset], [inset, D - inset], [W - inset, D - inset]];

const BUILD = {
  plate(p) {
    const W = p.board[0] + 2 * p.margin, D = p.board[1] + 2 * p.margin;
    const at = h => [p.margin + h[0], p.margin + h[1]];
    const ids = p.holes.map(h => circle(...at(h), p.standoff_hole));
    const ods = p.holes.map(h => circle(...at(h), p.standoff_d));
    const mounts = corners(W, D, p.mount_inset).map(c => circle(c[0], c[1], p.mount_hole));
    return [
      { z0: 0, z1: p.plate_t, loops: [roundedRect(0, 0, W, D, p.corner_r), ...ids, ...mounts] },
      { z0: p.plate_t, z1: p.plate_t + p.standoff_h, loops: [...ods, ...ids] }
    ];
  },

  tray(p) {
    const c0 = p.ledge + p.wall + p.clearance;
    const W = p.board[0] + 2 * c0, D = p.board[1] + 2 * c0;
    const e = p.ledge, w = p.ledge + p.wall, r = p.corner_r - p.ledge;
    if (!(p.wall_h > p.standoff_h)) throw new Error('tray: the wall has to be taller than the standoffs');
    // A wall on three sides, open at x = 0 where the Uno's jacks overhang.
    const u = [pt(w, e)];
    arc(u, W - e - r, e + r, r, -90, 0);
    arc(u, W - e - r, D - e - r, r, 0, 90);
    u.push(pt(w, D - e), pt(w, D - w), pt(W - w, D - w), pt(W - w, w), pt(w, w));
    const at = h => [c0 + h[0], c0 + h[1]];
    const ids = p.holes.map(h => circle(...at(h), p.standoff_hole));
    const ods = p.holes.map(h => circle(...at(h), p.standoff_d));
    return [
      { z0: 0, z1: p.floor_t, loops: [roundedRect(0, 0, W, D, p.corner_r), ...ids] },
      { z0: p.floor_t, z1: p.floor_t + p.standoff_h, loops: [u, ...ods, ...ids] },
      { z0: p.floor_t + p.standoff_h, z1: p.floor_t + p.wall_h, loops: [u] }
    ];
  },

  carrier(p) {
    const [W, D] = p.plate;
    const len = p.pins * p.pitch + p.slot_extra;
    const slots = [-1, 1].map(s => rect(W / 2 - len / 2, D / 2 + s * p.rows / 2 - p.slot_w / 2,
                                        W / 2 + len / 2, D / 2 + s * p.rows / 2 + p.slot_w / 2));
    const feet = corners(W, D, p.foot_inset);
    const holes = feet.map(c => circle(c[0], c[1], p.foot_hole));
    const ods = feet.map(c => circle(c[0], c[1], p.foot_d));
    return [
      { z0: 0, z1: p.plate_t, loops: [roundedRect(0, 0, W, D, p.corner_r), ...slots, ...holes] },
      { z0: p.plate_t, z1: p.plate_t + p.foot_h, loops: [...ods, ...holes] }
    ];
  },

  fittest(p) {
    const [W, D] = p.plate;
    const cx = i => p.clear_x0 + i * p.clear_pitch, ix = i => p.insert_x0 + i * p.insert_pitch;
    const clear = p.clear.map((d, i) => circle(cx(i), p.clear_y, d));
    const ods = p.insert.map((d, i) => circle(ix(i), p.insert_y, p.boss_d));
    const ids = p.insert.map((d, i) => circle(ix(i), p.insert_y, d));
    const labels = [].concat(
      ...p.clear.map((v, i) => label(v, cx(i), p.clear_y + 4)),
      ...p.insert.map((v, i) => label(v, ix(i), p.insert_y + p.boss_d / 2 + 2))
    );
    return [
      { z0: 0, z1: p.plate_t, loops: [roundedRect(0, 0, W, D, p.corner_r), ...clear] },
      { z0: p.plate_t, z1: p.plate_t + p.label_h, loops: [...labels, ...ods, ...ids] },
      { z0: p.plate_t + p.label_h, z1: p.plate_t + p.boss_h, loops: [...ods, ...ids] }
    ];
  }
};

/* Seven-segment numbers, so the labels print the same in every slicer and
   the .scad file needs no font. The segments stand apart by GP so each
   one is its own outline. */
const DW = 3.4, DH = 6, ST = 0.8, GP = 0.25;
const DIGITS = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
const VH = DH / 2 - 1.5 * ST - 2 * GP;
const SEGS = {
  a: [0, DH - ST, DW, ST], g: [0, DH / 2 - ST / 2, DW, ST], d: [0, 0, DW, ST],
  f: [0, DH / 2 + ST / 2 + GP, ST, VH], b: [DW - ST, DH / 2 + ST / 2 + GP, ST, VH],
  e: [0, ST + GP, ST, VH], c: [DW - ST, ST + GP, ST, VH]
};

function label(v, cx, y0) {
  const a = Math.floor(v + 0.001), b = Math.round((v - a) * 10);
  const x0 = cx - (2 * DW + ST + 0.8) / 2, out = [];
  const box = (x, y, w, h) => out.push(rect(x, y, x + w, y + h));
  const digit = (n, x) => DIGITS[n].split('').forEach(s => { const r = SEGS[s]; box(x + r[0], y0 + r[1], r[2], r[3]); });
  digit(a, x0);
  box(x0 + DW + 0.4, y0, ST, ST);
  digit(b, x0 + DW + ST + 0.8);
  return out;
}

/* --- OpenSCAD sources ----------------------------------------------------
   Written from the same parameters as the STL. They are the editable
   version: change a number at the top and render.
   ------------------------------------------------------------------------- */
const v = x => JSON.stringify(x).replace(/,/g, ', ');

const ROUNDED = `module rounded_rect(size, r) {
  translate([r, r]) offset(r = r) square([size[0] - 2 * r, size[1] - 2 * r]);
}`;

function header(pr, lines, noStl) {
  return [
    `// ${pr.title} - The Build Book`,
    `// ${SITE}`,
    '//',
    ...lines.map(l => '// ' + l),
    '//',
    '// Millimetres. Change the numbers at the top and render (F6); everything',
    '// below follows from them.' + (noStl ? '' : ' Written by tools/make-prints.js from the same'),
    ...(noStl ? [] : ['// numbers as the STL next to it.']),
    ''
  ].join('\n');
}

const SCAD = {
  plate(pr, p, measured) {
    const hole = p.standoff_hole < 2 ? 'M2 screws cutting their own thread' : 'M3 screws cutting their own thread. For heat-set inserts: your fit-test size, and standoff_d = 8';
    return header(pr, measured ? [
      'For a board whose hole positions are not published - measure your own.',
      'Hole centres and the outline are measured from one corner of the board.'
    ] : ['Hole centres are measured from the corner of the board nearest the origin.'], measured) + `
/* [Board] */
board = ${v(p.board)};   // outline of the board itself
holes = ${v(p.holes)};   // hole centres, from the board's corner

/* [Plate] */
margin = ${p.margin};        // how far the plate reaches past the board on every side
plate_t = ${p.plate_t};
corner_r = ${p.corner_r};
mount_hole = ${p.mount_hole};    // corner holes, M3 clearance - use your fit-test result
mount_inset = ${p.mount_inset};    // corner hole centres, in from the plate edges

/* [Standoffs] */
standoff_d = ${p.standoff_d};
standoff_h = ${p.standoff_h};      // above the plate
standoff_hole = ${p.standoff_hole};  // ${hole}

/* [Hidden] */
$fn = ${SEG};
${measured ? `
assert(board[0] > 0 && board[1] > 0, "Measure your board: put its outline in board = [width, depth]");
assert(len(holes) > 0, "Measure your board: put the hole centres in holes = [[x, y], ...]");
` : ''}
plate = [board[0] + 2 * margin, board[1] + 2 * margin];

${ROUNDED}

difference() {
  union() {
    linear_extrude(plate_t) rounded_rect(plate, corner_r);
    for (h = holes)
      translate([margin + h[0], margin + h[1], 0])
        cylinder(d = standoff_d, h = plate_t + standoff_h);
  }
  for (h = holes)
    translate([margin + h[0], margin + h[1], -1])
      cylinder(d = standoff_hole, h = plate_t + standoff_h + 2);
  for (x = [mount_inset, plate[0] - mount_inset], y = [mount_inset, plate[1] - mount_inset])
    translate([x, y, -1]) cylinder(d = mount_hole, h = plate_t + 2);
}
`;
  },

  tray(pr, p) {
    return header(pr, [
      'Open at the board\'s x = 0 end, where the USB and power jacks overhang.',
      'Hole centres are measured from that corner of the board.'
    ]) + `
/* [Board] */
board = ${v(p.board)};
holes = ${v(p.holes)};

/* [Tray] */
clearance = ${p.clearance};   // gap between the board edge and the wall
wall = ${p.wall};
ledge = ${p.ledge};       // the floor reaches this far past the wall
corner_r = ${p.corner_r};
floor_t = ${p.floor_t};
wall_h = ${p.wall_h};     // above the floor - keep it below the header tops so jumper wires still plug in

/* [Standoffs] */
standoff_d = ${p.standoff_d};
standoff_h = ${p.standoff_h};   // above the floor
standoff_hole = ${p.standoff_hole};   // M3 screws cutting their own thread

/* [Hidden] */
$fn = ${SEG};

c0 = ledge + wall + clearance;   // where the board's corner sits
outer = [board[0] + 2 * c0, board[1] + 2 * c0];

${ROUNDED}

difference() {
  union() {
    linear_extrude(floor_t) rounded_rect(outer, corner_r);
    translate([0, 0, floor_t]) linear_extrude(wall_h) difference() {
      translate([ledge, ledge]) rounded_rect([outer[0] - 2 * ledge, outer[1] - 2 * ledge], corner_r - ledge);
      translate([ledge + wall, ledge + wall]) square([outer[0] - 2 * (ledge + wall), outer[1] - 2 * (ledge + wall)]);
      translate([-1, -1]) square([ledge + wall + 1, outer[1] + 2]);   // the open end
    }
    for (h = holes)
      translate([c0 + h[0], c0 + h[1], 0]) cylinder(d = standoff_d, h = floor_t + standoff_h);
  }
  for (h = holes)
    translate([c0 + h[0], c0 + h[1], -1]) cylinder(d = standoff_hole, h = floor_t + standoff_h + 2);
}
`;
  },

  carrier(pr, p) {
    return header(pr, [
      'Printed plate-down. Turned over, the corner posts are its feet.',
      'Press a female header strip into each slot, flush with the underside.'
    ]) + `
/* [Board] */
pins = ${p.pins};        // per row
pitch = ${p.pitch};
rows = ${p.rows};     // centre to centre across the two pin rows - MEASURE YOURS

/* [Carrier] */
slot_w = ${p.slot_w};      // a female header is about 2.5 mm wide, and printed slots come out narrow
slot_extra = ${p.slot_extra};  // added to the slot length
plate = ${v(p.plate)};
plate_t = ${p.plate_t};
corner_r = ${p.corner_r};
foot_d = ${p.foot_d};
foot_h = ${p.foot_h};       // room under the carrier for the header pins and wiring
foot_hole = ${p.foot_hole};  // M3 clearance - use your fit-test result
foot_inset = ${p.foot_inset};

/* [Hidden] */
$fn = ${SEG};

slot_len = pins * pitch + slot_extra;

${ROUNDED}

difference() {
  union() {
    linear_extrude(plate_t) rounded_rect(plate, corner_r);
    for (x = [foot_inset, plate[0] - foot_inset], y = [foot_inset, plate[1] - foot_inset])
      translate([x, y, 0]) cylinder(d = foot_d, h = plate_t + foot_h);
  }
  for (s = [-1, 1])
    translate([plate[0] / 2 - slot_len / 2, plate[1] / 2 + s * rows / 2 - slot_w / 2, -1])
      cube([slot_len, slot_w, plate_t + 2]);
  for (x = [foot_inset, plate[0] - foot_inset], y = [foot_inset, plate[1] - foot_inset])
    translate([x, y, -1]) cylinder(d = foot_hole, h = plate_t + foot_h + 2);
}
`;
  },

  fittest(pr, p) {
    return header(pr, [
      'Top row: M3 clearance holes. Bottom row: holes for M3 heat-set inserts.',
      'The raised number next to each is its modelled diameter.'
    ]) + `
/* [Plate] */
plate = ${v(p.plate)};
plate_t = ${p.plate_t};
corner_r = ${p.corner_r};

/* [Clearance holes] */
clear = ${v(p.clear)};
clear_x0 = ${p.clear_x0};
clear_pitch = ${p.clear_pitch};
clear_y = ${p.clear_y};

/* [Insert holes] */
insert = ${v(p.insert)};
insert_x0 = ${p.insert_x0};
insert_pitch = ${p.insert_pitch};
insert_y = ${p.insert_y};
boss_d = ${p.boss_d};
boss_h = ${p.boss_h};       // above the plate, and the depth of the insert holes

label_h = ${p.label_h};    // height of the raised numbers

/* [Hidden] */
$fn = ${SEG};

// Seven-segment numbers: they print the same everywhere and need no font.
dw = ${DW}; dh = ${DH}; st = ${ST}; gp = ${GP};
vh = dh / 2 - 1.5 * st - 2 * gp;
segs = ${v(DIGITS)};

module seg(c) {
  if (c == "a") translate([0, dh - st]) square([dw, st]);
  if (c == "g") translate([0, dh / 2 - st / 2]) square([dw, st]);
  if (c == "d") square([dw, st]);
  if (c == "f") translate([0, dh / 2 + st / 2 + gp]) square([st, vh]);
  if (c == "b") translate([dw - st, dh / 2 + st / 2 + gp]) square([st, vh]);
  if (c == "e") translate([0, st + gp]) square([st, vh]);
  if (c == "c") translate([dw - st, st + gp]) square([st, vh]);
}

module digit(n) { s = segs[n]; for (i = [0 : len(s) - 1]) seg(s[i]); }

module label(v) {
  a = floor(v + 0.001);
  b = round((v - a) * 10);
  translate([-(2 * dw + st + 0.8) / 2, 0]) {
    digit(a);
    translate([dw + 0.4, 0]) square([st, st]);
    translate([dw + st + 0.8, 0]) digit(b);
  }
}

${ROUNDED}

difference() {
  union() {
    linear_extrude(plate_t) rounded_rect(plate, corner_r);
    for (i = [0 : len(insert) - 1])
      translate([insert_x0 + i * insert_pitch, insert_y, 0]) cylinder(d = boss_d, h = plate_t + boss_h);
    for (i = [0 : len(clear) - 1])
      translate([clear_x0 + i * clear_pitch, clear_y + 4, plate_t]) linear_extrude(label_h) label(clear[i]);
    for (i = [0 : len(insert) - 1])
      translate([insert_x0 + i * insert_pitch, insert_y + boss_d / 2 + 2, plate_t]) linear_extrude(label_h) label(insert[i]);
  }
  for (i = [0 : len(clear) - 1])
    translate([clear_x0 + i * clear_pitch, clear_y, -1]) cylinder(d = clear[i], h = plate_t + 2);
  for (i = [0 : len(insert) - 1])
    translate([insert_x0 + i * insert_pitch, insert_y, plate_t]) cylinder(d = insert[i], h = boss_h + 1);
}
`;
  }
};

/* --- writers --------------------------------------------------------------- */

function stl(tris, name) {
  const buf = Buffer.alloc(84 + tris.length * 50);
  buf.write(('The Build Book - ' + name + ' - millimetres').padEnd(80, ' ').slice(0, 80), 0, 'ascii');
  buf.writeUInt32LE(tris.length, 80);
  let o = 84;
  for (const [a, b, c] of tris) {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const l = Math.hypot(n[0], n[1], n[2]);
    for (const p of [[n[0] / l, n[1] / l, n[2] / l], a, b, c]) {
      for (let k = 0; k < 3; k++) { buf.writeFloatLE(p[k], o); o += 4; }
    }
    buf.writeUInt16LE(0, o); o += 2;
  }
  return buf;
}

/* The picture: the same welded mesh, vertices in hundredths of a mm. */
function meshJs(file, m) {
  const v = [];
  m.verts.forEach(p => v.push(Math.round(p[0] * 100), Math.round(p[1] * 100), Math.round(p[2] * 100)));
  const f = [];
  m.faces.forEach(t => f.push(t[0], t[1], t[2]));
  return '/* GENERATED by tools/make-prints.js - do not edit. The mesh behind ' + file + '.stl. */\n' +
         'AB.addMesh(' + JSON.stringify(file) + ', {s:0.01,v:[' + v.join(',') + '],f:[' + f.join(',') + ']});\n';
}

function loadPrints() {
  const s = {};
  s.window = s;
  vm.createContext(s);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/data/prints.js'), 'utf8'), s, { filename: 'prints.js' });
  return s.AB.prints || [];
}

/* Everything, in memory: { 'assets/prints/x.stl': Buffer, ... } */
function build(prints) {
  prints = prints || loadPrints();
  const out = {}, stats = {};
  for (const pr of prints) {
    const kind = pr.kind === 'measured' ? 'plate' : pr.kind;
    if (!SCAD[kind]) throw new Error(`${pr.id}: unknown kind "${pr.kind}"`);
    out[`${OUT_REL}/${pr.id}.scad`] = SCAD[kind](pr, pr.params, pr.kind === 'measured');
    const entry = stats[pr.id] = { scad: pr.id + '.scad', stl: [] };
    if (pr.kind === 'measured') continue;       // no invented holes, so no STL

    const variants = pr.variants || [{ file: pr.id, label: '', params: {} }];
    for (const va of variants) {
      const p = Object.assign({}, pr.params, va.params);
      const tris = solid(BUILD[kind](p), va.file);
      const m = verify(tris, va.file);
      const bin = stl(tris, va.file);
      out[`${OUT_REL}/${va.file}.stl`] = bin;
      out[`${OUT_REL}/${va.file}.mesh.js`] = meshJs(va.file, m);
      entry.stl.push({
        file: va.file, label: va.label || '',
        bytes: bin.length, tris: tris.length,
        size: [0, 1, 2].map(k => +(m.hi[k] - m.lo[k]).toFixed(1)),
        vol: +(m.vol / 1000).toFixed(2),                  // cm3
        sha: crypto.createHash('sha1').update(bin).digest('hex').slice(0, 10)
      });
    }
  }
  out[`${OUT_REL}/index.js`] =
    '/* GENERATED by tools/make-prints.js from assets/data/prints.js - do not edit.\n' +
    '   Sizes and volumes are measured off the generated meshes, not typed in. */\n' +
    'window.AB = window.AB || {};\n' +
    'AB.printFiles = ' + JSON.stringify(stats, null, 1) + ';\n';
  return out;
}

const norm = x => Buffer.isBuffer(x) ? x : Buffer.from(String(x).replace(/\r\n/g, '\n'), 'utf8');

/* Compare with disk. Returns a list of problems, empty when up to date. */
function check(prints) {
  const out = build(prints), problems = [];
  for (const rel of Object.keys(out)) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) { problems.push(`${rel} is missing`); continue; }
    const disk = fs.readFileSync(abs);
    const want = norm(out[rel]);
    const have = Buffer.isBuffer(out[rel]) ? disk : norm(disk.toString('utf8'));
    if (!want.equals(have)) problems.push(`${rel} is out of date`);
  }
  const dir = path.join(ROOT, OUT_REL);
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (!out[`${OUT_REL}/${f}`]) problems.push(`${OUT_REL}/${f} is not produced by any print - remove it`);
    }
  }
  return problems;
}

// build and check are the interface; the rest is exported so the geometry can be tested on its own.
module.exports = { build, check, loadPrints, solid, verify, BUILD, earcut };

if (require.main === module) {
  if (process.argv.includes('--check')) {
    const problems = check();
    if (problems.length) {
      problems.forEach(p => console.error('  x ' + p));
      console.error('Run: node tools/make-prints.js');
      process.exit(1);
    }
    console.log('Prints are up to date.');
  } else {
    const out = build();
    fs.mkdirSync(path.join(ROOT, OUT_REL), { recursive: true });
    const dir = path.join(ROOT, OUT_REL);
    for (const f of fs.readdirSync(dir)) {
      if (!out[`${OUT_REL}/${f}`]) { fs.unlinkSync(path.join(dir, f)); console.log('  removed ' + f); }
    }
    for (const [rel, body] of Object.entries(out)) fs.writeFileSync(path.join(ROOT, rel), body);
    const stats = vm.runInNewContext(out[`${OUT_REL}/index.js`] + ';AB.printFiles', { window: {}, AB: {} });
    for (const [id, s] of Object.entries(stats)) {
      if (!s.stl.length) { console.log(`  ${id.padEnd(20)} source only - no STL`); continue; }
      s.stl.forEach(f => console.log(`  ${f.file.padEnd(20)} ${String(f.tris).padStart(5)} triangles  ` +
        `${f.size.join(' x ')} mm  ${f.vol} cm3  ${(f.bytes / 1024).toFixed(0)} KB`));
    }
    console.log(`Wrote ${Object.keys(out).length} files to ${OUT_REL}/.`);
  }
}
