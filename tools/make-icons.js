#!/usr/bin/env node
/* ==========================================================================
   tools/make-icons.js

   Writes the PWA icon set as real PNGs, with no image library.

   Node has zlib built in, which is the hard half of a PNG encoder. The rest
   is a chunk layout, a CRC32 table and a rasteriser - and since the artwork
   is rounded rectangles and bars, drawing it into an RGBA buffer by hand is
   about forty lines. Everything is rendered at 3x and averaged down, which
   is enough supersampling to keep the curves clean.

   Run it after changing the artwork:   node tools/make-icons.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.resolve(__dirname, '..', 'assets', 'icons');

/* --- colours, matching assets/favicon.svg ------------------------------- */
const INK    = [0x12, 0x14, 0x0f, 255];   // near-black background
const COPPER = [0xb4, 0x66, 0x2b, 255];
const LIGHT  = [0xe2, 0x95, 0x5a, 255];

/* --- a tiny RGBA canvas ------------------------------------------------- */
function canvas(w, h) {
  return { w: w, h: h, px: new Uint8Array(w * h * 4) };
}

function blend(c, x, y, col) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  c.px[i] = col[0]; c.px[i + 1] = col[1]; c.px[i + 2] = col[2]; c.px[i + 3] = col[3];
}

/* Signed distance to a rounded rectangle, so filling and outlining are the
   same function with a different test. */
function roundRectSDF(x, y, cx, cy, hw, hh, r) {
  const qx = Math.abs(x - cx) - (hw - r);
  const qy = Math.abs(y - cy) - (hh - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function fillRoundRect(c, cx, cy, hw, hh, r, col) {
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      if (roundRectSDF(x + 0.5, y + 0.5, cx, cy, hw, hh, r) <= 0) blend(c, x, y, col);
    }
  }
}

/* An outline is the region between two nested rounded rects. */
function strokeRoundRect(c, cx, cy, hw, hh, r, width, col) {
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const d = roundRectSDF(x + 0.5, y + 0.5, cx, cy, hw, hh, r);
      if (d <= 0 && d >= -width) blend(c, x, y, col);
    }
  }
}

/* A bar with rounded ends - used for the + and - marks. */
function capsule(c, x0, y0, x1, y1, radius, col) {
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const px = x + 0.5, py = y + 0.5;
      const dx = x1 - x0, dy = y1 - y0;
      const len2 = dx * dx + dy * dy;
      let t = len2 ? ((px - x0) * dx + (py - y0) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const qx = px - (x0 + t * dx), qy = py - (y0 + t * dy);
      if (Math.sqrt(qx * qx + qy * qy) <= radius) blend(c, x, y, col);
    }
  }
}

/* --- the artwork -------------------------------------------------------- */
/* `inset` shrinks the glyph for maskable icons, where the outer 10% of each
   edge can be cropped away by the launcher's mask. */
function draw(size, opts) {
  const ss = 3;                       // supersample factor
  const S = size * ss;
  const c = canvas(S, S);

  const bgRadius = opts.square ? 0 : S * 0.22;
  fillRoundRect(c, S / 2, S / 2, S / 2, S / 2, bgRadius, INK);

  const scale = opts.inset || 1;
  const cx = S / 2, cy = S / 2;
  const hw = S * 0.34 * scale;
  const hh = S * 0.20 * scale;
  const r  = hh * 0.92;
  const stroke = S * 0.052 * scale;

  strokeRoundRect(c, cx, cy, hw, hh, r, stroke, COPPER);

  // "+" on the left, "-" on the right: the board-with-pins glyph
  const armLen = S * 0.075 * scale;
  const barR   = S * 0.026 * scale;
  const leftX  = cx - S * 0.145 * scale;
  const rightX = cx + S * 0.145 * scale;

  capsule(c, leftX - armLen, cy, leftX + armLen, cy, barR, LIGHT);
  capsule(c, leftX, cy - armLen, leftX, cy + armLen, barR, LIGHT);
  capsule(c, rightX - armLen, cy, rightX + armLen, cy, barR, LIGHT);

  return downsample(c, ss);
}

function downsample(c, f) {
  const w = c.w / f, h = c.h / f;
  const out = canvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < f; dy++) {
        for (let dx = 0; dx < f; dx++) {
          const i = ((y * f + dy) * c.w + (x * f + dx)) * 4;
          r += c.px[i]; g += c.px[i + 1]; b += c.px[i + 2]; a += c.px[i + 3];
        }
      }
      const n = f * f, o = (y * w + x) * 4;
      out.px[o] = r / n; out.px[o + 1] = g / n; out.px[o + 2] = b / n; out.px[o + 3] = a / n;
    }
  }
  return out;
}

/* --- PNG encoding ------------------------------------------------------- */
const CRC_TABLE = (function () {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
}());

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(c) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.w, 0);
  ihdr.writeUInt32BE(c.h, 4);
  ihdr[8] = 8;      // bit depth
  ihdr[9] = 6;      // colour type: RGBA
  ihdr[10] = 0;     // deflate
  ihdr[11] = 0;     // adaptive filtering
  ihdr[12] = 0;     // no interlace

  // Each scanline is prefixed with its filter byte. Filter 0 (none) keeps
  // this simple; zlib still compresses these flat-colour images to a few KB.
  const raw = Buffer.alloc(c.h * (c.w * 4 + 1));
  for (let y = 0; y < c.h; y++) {
    const rowStart = y * (c.w * 4 + 1);
    raw[rowStart] = 0;
    Buffer.from(c.px.buffer, y * c.w * 4, c.w * 4).copy(raw, rowStart + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* --- go ----------------------------------------------------------------- */
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  { file: 'icon-192.png',          size: 192, opts: {} },
  { file: 'icon-512.png',          size: 512, opts: {} },
  { file: 'icon-maskable-192.png', size: 192, opts: { inset: 0.72, square: true } },
  { file: 'icon-maskable-512.png', size: 512, opts: { inset: 0.72, square: true } },
  { file: 'apple-touch-icon.png',  size: 180, opts: { square: true } }
];

for (const j of jobs) {
  const png = encodePng(draw(j.size, j.opts));
  fs.writeFileSync(path.join(OUT, j.file), png);
  console.log(`  ${j.file.padEnd(26)} ${j.size}x${j.size}  ${(png.length / 1024).toFixed(1)} KB`);
}
console.log('\nIcons written to assets/icons/');
