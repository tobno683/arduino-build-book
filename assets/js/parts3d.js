/* ==========================================================================
   parts3d.js - the component library the 3D views are built from.

   Every entry knows its real size in millimetres and where its pins are, so
   a wire drawn from "uno.D2" to "bb.e10" lands on the actual pin and the
   actual breadboard hole. Dimensions are taken from the usual datasheets
   and module outlines; they are close enough that a part printed at this
   size would fit.
   ========================================================================== */
window.AB = window.AB || {};

(function () {
  var G = AB.G;
  var P = 2.54;                       // the 0.1 inch grid everything lives on

  var C = {
    pcbTeal:  '#0d8489', pcbBlue: '#2a63a8', pcbBlack: '#212429', pcbRed: '#9d2b2b',
    pcbPurple:'#4f3a86', pcbGreen: '#116b42', pcbWhite: '#dcdad2',
    hdr:      '#16181b', pinGold: '#d9b45f', pinTin: '#c9ccd1',
    chip:     '#2a2d32', metal: '#b4b8bd', gloss: '#3a3f45',
    bbBody:   '#eae7de', bbHole: '#6e695e', bbChan: '#d5d1c6',
    red:      '#cf3b34', blue: '#2f6fd0', white: '#f2f0ea', silver: '#c2c6ca',
    brown:    '#6b4423', clear: '#cfe4e8', glass: '#1a2b33'
  };
  AB.C3 = C;

  /* ---------------------------------------------------------------------
     mod() - the generic breakout-board factory.
     cfg = {
       name, w, d, h,            outline in mm (h = pcb thickness)
       color,                    pcb colour
       rows: [{ names:[...], z, cx, step, dir }]   pin headers
       deco: [ ... ]             extra lumps that make it recognisable
     }
     --------------------------------------------------------------------- */
  function mod(cfg) {
    var pcbH = cfg.h || 1.6;
    var hdrH = cfg.hdrH != null ? cfg.hdrH : 8.5;
    var pins = {};

    (cfg.rows || []).forEach(function (row) {
      var step = row.step || P;
      var n = row.names.length;
      var cx = row.cx != null ? row.cx : 0;
      var x0 = cx - (n - 1) * step / 2;
      row.names.forEach(function (nm, i) {
        if (!nm) return;
        var x = row.vertical ? cx : x0 + i * step;
        var z = row.vertical ? (row.z - (n - 1) * step / 2 + i * step) : row.z;
        pins[nm] = [x, pcbH + (row.flush ? 0.4 : hdrH), z];
      });
    });
    (cfg.extraPins || []).forEach(function (p) { pins[p[0]] = [p[1], p[2], p[3]]; });

    return {
      name: cfg.name,
      w: cfg.w, d: cfg.d,
      ex: cfg.ex != null ? cfg.ex : 26,
      pins: pins,
      build: function () {
        var f = G.box(0, 0, 0, cfg.w, pcbH, cfg.d, cfg.color || C.pcbBlue,
                      { top: cfg.top || cfg.color || C.pcbBlue });

        (cfg.rows || []).forEach(function (row) {
          if (row.flush) return;
          var step = row.step || P, n = row.names.length;
          var cx = row.cx != null ? row.cx : 0;
          var len = n * step;
          if (row.vertical) {
            f = f.concat(G.box(cx, pcbH, row.z, 2.4, hdrH - 0.6, len, C.hdr));
          } else {
            f = f.concat(G.box(cx, pcbH, row.z, len, hdrH - 0.6, 2.4, C.hdr));
          }
          var x0 = cx - (n - 1) * step / 2;
          row.names.forEach(function (nm, i) {
            if (!nm) return;
            var x = row.vertical ? cx : x0 + i * step;
            var z = row.vertical ? (row.z - (n - 1) * step / 2 + i * step) : row.z;
            f = f.concat(G.box(x, pcbH + hdrH - 0.6, z, 0.72, 0.9, 0.72, C.pinGold));
          });
        });

        (cfg.deco || []).forEach(function (d) { f = f.concat(decor(d, pcbH)); });
        return f;
      }
    };
  }

  /* a lump on a board: chip, connector, dome, lens, screw block, LED ... */
  function decor(d, base) {
    var y = base + (d.y || 0);
    switch (d.t) {
      case 'box':  return G.box(d.x || 0, y, d.z || 0, d.w, d.h, d.d, d.c || C.chip);
      case 'cyl':  return G.cyl(d.x || 0, y, d.z || 0, d.r, d.h, d.c || C.metal, { sides: d.sides || 12 });
      case 'pad':  return G.pad(d.x || 0, base + 0.12, d.z || 0, d.w, d.d, d.c || C.pcbWhite);
      case 'dome': return G.cyl(d.x || 0, y, d.z || 0, d.r, d.h * 0.55, d.c || C.pcbWhite, { sides: 16 })
                     .concat(G.cyl(d.x || 0, y + d.h * 0.55, d.z || 0, d.r * 0.72, d.h * 0.45, d.c || C.pcbWhite, { sides: 16 }));
      case 'usb':  return G.box(d.x || 0, y, d.z || 0, d.w || 12, d.h || 6.5, d.d || 11, C.metal);
      default:     return [];
    }
  }

  /* ---------------------------------------------------------------------
     hdr40() - the 40-pin Raspberry Pi header, as carried by the Ventuno Q
     and the Jetson Orin Nano carrier. Fills `pins` with P1..P40 laid out
     the way the silkscreen numbers them: odd pins along the row nearest
     `z`, even pins one 0.1" row further in, P1 at `x0`. The named aliases
     are the ones a guide will actually refer to.

     Existing keys are left alone, so a board that also has Arduino headers
     keeps its own 5V/GND meaning them.
     --------------------------------------------------------------------- */
  function hdr40(pins, x0, y, z) {
    for (var i = 0; i < 20; i++) {
      pins['P' + (i * 2 + 1)] = [x0 + i * P, y, z];
      pins['P' + (i * 2 + 2)] = [x0 + i * P, y, z + P];
    }
    var alias = {
      '3V3': 'P1', '5V': 'P2', 'SDA': 'P3', 'SCL': 'P5', 'GND': 'P6',
      'TX': 'P8', 'RX': 'P10', 'GPIO17': 'P11', 'GPIO18': 'P12',
      'GPIO27': 'P13', 'GPIO22': 'P15', 'GPIO23': 'P16', 'GPIO24': 'P18',
      'MOSI': 'P19', 'MISO': 'P21', 'GPIO25': 'P22', 'SCLK': 'P23', 'CE0': 'P24',
      'GND2': 'P9', 'GND3': 'P14', 'GND4': 'P20', 'GND5': 'P25'
    };
    Object.keys(alias).forEach(function (k) {
      if (!pins[k]) pins[k] = pins[alias[k]];
    });
  }

  AB.comp = {};

  /* =====================================================================
     BREADBOARDS
     Row order across the board, outer edge first:
       T-  T+ | j i h g f | channel | e d c b a | B+  B-
     Holes are on the 2.54 mm grid; columns are numbered 1..63 (or 1..30).
     ===================================================================== */
  function breadboard(cols, wmm, dmm, name) {
    var H = 9.4;
    var rowZ = {};                                   // letter -> z offset
    var order = ['T-', 'T+', null, 'j', 'i', 'h', 'g', 'f', null, null, 'e', 'd', 'c', 'b', 'a', null, 'B+', 'B-'];
    order.forEach(function (r, i) { if (r) rowZ[r] = (i - 8.5) * P; });
    var colX = function (c) { return (c - (cols + 1) / 2) * P; };

    // rail holes: 10 groups of 5, offset one column in from the ends
    var railCols = [];
    for (var i = 0; i < Math.floor(cols / 6) * 5; i++) {
      railCols.push(2 + Math.floor(i / 5) * 6 + (i % 5));
    }

    return {
      name: name, w: wmm, d: dmm, ex: 0,
      pin: function (nm) {
        var m = /^([a-j])(\d+)$/.exec(nm);
        if (m) return [colX(+m[2]), H, rowZ[m[1]]];
        var r = /^([TB][-+])(\d+)$/.exec(nm);
        if (r && rowZ[r[1]] != null) {
          var idx = Math.max(1, Math.min(railCols.length, +r[2]));
          return [colX(railCols[idx - 1]), H, rowZ[r[1]]];
        }
        return null;
      },
      build: function () {
        var f = G.box(0, 0, 0, wmm, H, dmm, C.bbBody, { top: C.bbBody });
        // centre channel
        f = f.concat(G.pad(0, H + 0.05, 0, wmm - 3, P * 2.2, C.bbChan));
        // rail stripes
        [['T-', C.blue, -0.8], ['T+', C.red, 0.8], ['B+', C.red, -0.8], ['B-', C.blue, 0.8]].forEach(function (s) {
          f = f.concat(G.pad(0, H + 0.06, rowZ[s[0]] + s[2] * 1.5, wmm - 6, 0.9, s[1]));
        });
        // holes
        var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], c, L;
        for (c = 1; c <= cols; c++) {
          for (L = 0; L < 10; L++) {
            f = f.concat(G.pad(colX(c), H + 0.1, rowZ[letters[L]], 1.25, 1.25, C.bbHole, { lod: 1 }));
          }
        }
        ['T-', 'T+', 'B+', 'B-'].forEach(function (r) {
          railCols.forEach(function (cc) {
            f = f.concat(G.pad(colX(cc), H + 0.1, rowZ[r], 1.25, 1.25, C.bbHole, { lod: 1 }));
          });
        });
        return f;
      }
    };
  }
  AB.comp.bb830 = breadboard(63, 165.1, 54.5, 'Breadboard, 830 points');
  AB.comp.bb400 = breadboard(30, 83.5, 54.5, 'Breadboard, 400 points');

  /* =====================================================================
     ARDUINO UNO R3
     Headers, left to right along the top edge:
       SCL SDA AREF GND 13 12 11 10 9 8 | 0.16" gap | 7 6 5 4 3 2 1 0
     and along the bottom edge:
       NC IOREF RESET 3V3 5V GND GND VIN | gap | A0 A1 A2 A3 A4 A5
     ===================================================================== */
  (function () {
    var W = 68.6, D = 53.4, T = 1.6, HH = 8.6;
    var topZ = 50.8 - D / 2, botZ = 2.54 - D / 2;
    var pins = {}, f0;

    var digHi = ['SCL', 'SDA', 'AREF', 'GND3', 'D13', 'D12', 'D11', 'D10', 'D9', 'D8'];
    var digLo = ['D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0'];
    var pwr   = ['NC', 'IOREF', 'RESET', '3V3', '5V', 'GND1', 'GND2', 'VIN'];
    var ana   = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

    digHi.forEach(function (n, i) { pins[n] = [17.78 + i * P - W / 2, T + HH, topZ]; });
    digLo.forEach(function (n, i) { pins[n] = [44.70 + i * P - W / 2, T + HH, topZ]; });
    pwr.forEach(function (n, i) { pins[n] = [17.78 + i * P - W / 2, T + HH, botZ]; });
    ana.forEach(function (n, i) { pins[n] = [40.64 + i * P - W / 2, T + HH, botZ]; });
    pins.GND = pins.GND1;                       // the one people actually type
    pins.A4_SDA = pins.A4; pins.A5_SCL = pins.A5;
    pins.USB = [-W / 2 + 4, T + 5, D / 2 - 15];  // the USB-B jack, so a host link can be drawn

    AB.comp.uno = {
      name: 'Arduino Uno R3', w: W, d: D, ex: 0, pins: pins,
      build: function () {
        var f = G.box(0, 0, 0, W, T, D, C.pcbTeal, { top: C.pcbTeal });
        f = f.concat(G.box(17.78 + 4.5 * P - W / 2, T, topZ, 10 * P, HH - 0.7, 2.6, C.hdr));
        f = f.concat(G.box(44.70 + 3.5 * P - W / 2, T, topZ, 8 * P, HH - 0.7, 2.6, C.hdr));
        f = f.concat(G.box(17.78 + 3.5 * P - W / 2, T, botZ, 8 * P, HH - 0.7, 2.6, C.hdr));
        f = f.concat(G.box(40.64 + 2.5 * P - W / 2, T, botZ, 6 * P, HH - 0.7, 2.6, C.hdr));
        Object.keys(pins).forEach(function (k) {
          if (k === 'GND' || k === 'A4_SDA' || k === 'A5_SCL') return;
          var p = pins[k];
          f = f.concat(G.pad(p[0], T + HH - 0.65, p[2], 1.3, 1.3, '#0b0d10'));
        });
        // USB-B jack, barrel jack, the big DIP chip, reset button, crystal
        f = f.concat(G.box(-W / 2 + 4, T, D / 2 - 15, 16, 11, 12.5, C.metal));
        f = f.concat(G.box(-W / 2 + 6, T, -D / 2 + 10, 14, 11, 9.5, '#1a1c1f'));
        f = f.concat(G.box(2, T, -4, 36, 4.2, 15.2, C.chip));
        f = f.concat(G.box(-W / 2 + 14, T, D / 2 - 4, 6.4, 3.6, 6.4, '#8e9297'));
        f = f.concat(G.cyl(-6, T, 14, 2.2, 3.4, C.metal, { sides: 10 }));
        return f;
      }
    };
  }());

  /* =====================================================================
     ARDUINO NANO  (45 x 18 mm, two 15-pin rows 0.6" apart)
     ===================================================================== */
  AB.comp.nano = (function () {
    var W = 45, D = 18, T = 1.6, HH = 8.5, rz = 7.62;
    var A = ['D13', '3V3', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', '5V', 'RST2', 'GND', 'VIN'];
    var B = ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'GND2', 'RST', 'RX0', 'TX1'];
    var pins = {};
    A.forEach(function (n, i) { pins[n] = [-W / 2 + 3.3 + i * P, T + HH, -rz]; });
    B.forEach(function (n, i) { pins[n] = [-W / 2 + 3.3 + i * P, T + HH, rz]; });
    pins.A4_SDA = pins.A4; pins.A5_SCL = pins.A5;
    return {
      name: 'Arduino Nano', w: W, d: D, ex: 22, pins: pins,
      build: function () {
        var f = G.box(0, 0, 0, W, T, D, C.pcbBlack, { top: C.pcbBlack });
        [-rz, rz].forEach(function (z) { f = f.concat(G.box(-W / 2 + 3.3 + 7 * P, T, z, 15 * P, HH - 0.6, 2.4, C.hdr)); });
        [A, B].forEach(function (row, ri) {
          row.forEach(function (n, i) {
            f = f.concat(G.box(-W / 2 + 3.3 + i * P, T + HH - 0.6, ri ? rz : -rz, 0.7, 0.9, 0.7, C.pinGold));
          });
        });
        f = f.concat(G.box(-W / 2 + 3.5, T, 0, 8, 4, 7.5, C.metal));     // mini-USB
        f = f.concat(G.box(4, T, 0, 22, 2.6, 7, C.chip));                // the 328P
        f = f.concat(G.box(-6, T, 0, 8, 1.6, 6, C.chip));                // CH340
        return f;
      }
    };
  }());

  /* =====================================================================
     ESP32 DevKit V1, 30 pins (25.4 x 51.4 mm, rows 0.9" apart)
     ===================================================================== */
  AB.comp.esp32 = (function () {
    var W = 51.4, D = 25.4, T = 1.6, HH = 8.5, rz = 11.43;
    var L = ['EN', 'VP', 'VN', 'D34', 'D35', 'D32', 'D33', 'D25', 'D26', 'D27', 'D14', 'D12', 'D13', 'GND', 'VIN'];
    var R = ['3V3', 'GND2', 'D15', 'D2', 'D4', 'RX2', 'TX2', 'D5', 'D18', 'D19', 'D21', 'RX0', 'TX0', 'D22', 'D23'];
    var pins = {};
    L.forEach(function (n, i) { pins[n] = [-W / 2 + 4.5 + i * P, T + HH, -rz]; });
    R.forEach(function (n, i) { pins[n] = [-W / 2 + 4.5 + i * P, T + HH, rz]; });
    pins.GND3 = pins.GND2; pins.D16 = pins.RX2; pins.D17 = pins.TX2;
    return {
      name: 'ESP32 DevKit V1', w: W, d: D, ex: 22, pins: pins,
      build: function () {
        var f = G.box(0, 0, 0, W, T, D, C.pcbBlack, { top: C.pcbBlack });
        [-rz, rz].forEach(function (z) { f = f.concat(G.box(-W / 2 + 4.5 + 7 * P, T, z, 15 * P, HH - 0.6, 2.4, C.hdr)); });
        [L, R].forEach(function (row, ri) {
          row.forEach(function (n, i) {
            f = f.concat(G.box(-W / 2 + 4.5 + i * P, T + HH - 0.6, ri ? rz : -rz, 0.7, 0.9, 0.7, C.pinGold));
          });
        });
        f = f.concat(G.box(-W / 2 + 4, T, 0, 8.5, 3.2, 7.5, C.metal));            // micro-USB
        f = f.concat(G.box(4, T, 0, 18, 3.1, 16, C.metal));                       // the shielded module
        f = f.concat(G.pad(4, T + 3.3, 0, 16, 6, '#3c4148'));                     // antenna keep-out
        f = f.concat(G.box(W / 2 - 5, T, 0, 6, 2.4, 14, '#2b2f34'));
        return f;
      }
    };
  }());

  /* =====================================================================
     ESP32-CAM (27 x 40.5 mm) with the OV2640 sticking up off the front
     ===================================================================== */
  AB.comp.esp32cam = (function () {
    var W = 40.5, D = 27, T = 1.6, HH = 8.5, rz = 11.5;
    var L = ['5V', 'GND', 'IO12', 'IO13', 'IO15', 'IO14', 'IO2', 'IO4'];
    var R = ['3V3', 'IO16', 'IO0', 'GND2', 'VCC', 'U0R', 'U0T', 'GND3'];
    var pins = {};
    L.forEach(function (n, i) { pins[n] = [-W / 2 + 4 + i * P, T + HH, -rz]; });
    R.forEach(function (n, i) { pins[n] = [-W / 2 + 4 + i * P, T + HH, rz]; });
    return {
      name: 'ESP32-CAM', w: W, d: D, ex: 24, pins: pins,
      build: function () {
        var f = G.box(0, 0, 0, W, T, D, C.pcbBlack, { top: C.pcbBlack });
        [-rz, rz].forEach(function (z) { f = f.concat(G.box(-W / 2 + 4 + 3.5 * P, T, z, 8 * P, HH - 0.6, 2.4, C.hdr)); });
        [L, R].forEach(function (row, ri) {
          row.forEach(function (n, i) {
            f = f.concat(G.box(-W / 2 + 4 + i * P, T + HH - 0.6, ri ? rz : -rz, 0.7, 0.9, 0.7, C.pinGold));
          });
        });
        f = f.concat(G.box(6, T, 0, 18, 2.6, 16, C.metal));                        // ESP32-S module
        f = f.concat(G.box(-W / 2 + 10, T, 0, 10, 2, 12, '#1b1e22'));              // camera socket
        f = f.concat(G.box(-W / 2 + 10, T + 2, 0, 8.5, 5.5, 8.5, '#232830'));      // OV2640 body
        f = f.concat(G.cyl(-W / 2 + 10, T + 7.5, 0, 3.4, 2.2, '#11161c', { sides: 16, top: C.glass }));
        f = f.concat(G.box(W / 2 - 4, T, 0, 5, 3, 15, '#2b2f34'));                 // SD slot
        return f;
      }
    };
  }());

  /* =====================================================================
     SMALL BREAKOUTS - all built from mod()
     ===================================================================== */
  var M = {

    oled13: mod({
      name: 'OLED 128x64, 0.96" (SSD1306)', w: 27, d: 27.5, color: C.pcbBlue,
      rows: [{ names: ['GND', 'VCC', 'SCL', 'SDA'], z: -11.5 }],
      deco: [{ t: 'box', x: 0, z: 3, w: 25, h: 1.6, d: 15, c: '#0b0d11' },
             { t: 'pad', x: 0, z: 3, w: 21.7, d: 10.9, c: '#15181d' }]
    }),

    oled13b: mod({
      name: 'OLED 128x64, 1.3" (SH1106)', w: 35, d: 33, color: C.pcbBlue,
      rows: [{ names: ['GND', 'VCC', 'SCL', 'SDA'], z: -14 }],
      deco: [{ t: 'box', x: 0, z: 3, w: 33, h: 1.6, d: 19, c: '#0b0d11' },
             { t: 'pad', x: 0, z: 3, w: 29.4, d: 14.7, c: '#15181d' }]
    }),

    lcd1602: mod({
      name: '16x2 LCD with I2C backpack', w: 80, d: 36, h: 1.6, color: C.pcbGreen,
      rows: [{ names: ['GND', 'VCC', 'SDA', 'SCL'], z: 14.5, cx: -26 }],
      deco: [{ t: 'box', x: 0, z: -1, w: 71.5, h: 7, d: 24, c: '#8a9a4a' },
             { t: 'pad', x: 0, z: -1, w: 64.5, d: 16, c: '#a9c24f' },
             { t: 'box', x: 30, z: 12, w: 14, h: 3, d: 8, c: C.chip }]
    }),

    lcd2004: mod({
      name: '20x4 LCD with I2C backpack', w: 98, d: 60, color: C.pcbGreen,
      rows: [{ names: ['GND', 'VCC', 'SDA', 'SCL'], z: 26, cx: -34 }],
      deco: [{ t: 'box', x: 0, z: -2, w: 84, h: 7, d: 40, c: '#8a9a4a' },
             { t: 'pad', x: 0, z: -2, w: 76, d: 26, c: '#a9c24f' }]
    }),

    rc522: mod({
      name: 'RC522 RFID reader', w: 60, d: 39, color: C.pcbRed,
      rows: [{ names: ['SDA', 'SCK', 'MOSI', 'MISO', 'IRQ', 'GND', 'RST', '3V3'], z: -16.5, cx: -18 }],
      deco: [{ t: 'pad', x: 4, z: 1, w: 46, d: 30, c: '#b8453f' },
             { t: 'box', x: 18, z: 12, w: 9, h: 1.2, d: 9, c: C.chip }]
    }),

    dht22: mod({
      name: 'DHT22 / AM2302', w: 15.1, d: 25, color: C.pcbWhite, top: '#e8e6df',
      rows: [{ names: ['VCC', 'DATA', 'GND'], z: -10, cx: 0 }],
      deco: [{ t: 'box', x: 0, z: 2, w: 14, h: 5.5, d: 14, c: '#f2f0ea' },
             { t: 'pad', x: 0, z: 2, w: 9, d: 9, c: '#d9d6cc' }]
    }),

    dht11: mod({
      name: 'DHT11 module', w: 15.5, d: 24, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'DATA', 'GND'], z: -9.5 }],
      deco: [{ t: 'box', x: 0, z: 2.5, w: 12, h: 5.5, d: 12, c: '#3e78c0' }]
    }),

    bme280: mod({
      name: 'BME280 breakout', w: 16, d: 12.5, color: C.pcbPurple,
      rows: [{ names: ['VIN', 'GND', 'SCL', 'SDA'], z: -4.5 }],
      deco: [{ t: 'box', x: 3, z: 2, w: 3, h: 1.1, d: 3, c: C.metal }]
    }),

    hcsr04: mod({
      name: 'HC-SR04 ultrasonic', w: 45, d: 20, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'TRIG', 'ECHO', 'GND'], z: -7.5 }],
      deco: [{ t: 'cyl', x: -10, z: 2.5, r: 8, h: 12, c: C.silver, sides: 16, },
             { t: 'cyl', x: 10, z: 2.5, r: 8, h: 12, c: C.silver, sides: 16 },
             { t: 'box', x: 0, z: 4, w: 8, h: 2, d: 8, c: C.chip }]
    }),

    pir: mod({
      name: 'HC-SR501 PIR motion sensor', w: 32, d: 24, color: C.pcbGreen,
      rows: [{ names: ['VCC', 'OUT', 'GND'], z: -9, cx: 0 }],
      deco: [{ t: 'dome', x: 0, z: 2, r: 11.5, h: 9, c: C.pcbWhite },
             { t: 'cyl', x: -12, z: -6, r: 3, h: 4, c: '#e0a030', sides: 10 },
             { t: 'cyl', x: 12, z: -6, r: 3, h: 4, c: '#e0a030', sides: 10 }]
    }),

    relay1: mod({
      name: '1-channel relay module', w: 50, d: 26, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'GND', 'IN'], z: -9.5, cx: -16 }],
      extraPins: [['NO', 16, 12, 0], ['COM', 16, 12, -6], ['NC', 16, 12, 6]],
      deco: [{ t: 'box', x: -2, z: 2, w: 16, h: 15, d: 15, c: '#2a52a8' },
             { t: 'box', x: 16, z: 0, w: 15, h: 11, d: 20, c: '#3a6ebf' },
             { t: 'cyl', x: -16, z: 6, r: 2, h: 2.5, c: '#d04a3a', sides: 8 }]
    }),

    relay4: mod({
      name: '4-channel relay module', w: 75, d: 55, color: C.pcbBlue,
      rows: [{ names: ['GND', 'IN1', 'IN2', 'IN3', 'IN4', 'VCC'], z: -23, cx: -18 }],
      deco: [[0], [1], [2], [3]].map(function (r, i) {
        return { t: 'box', x: -26 + i * 17, z: 4, w: 16, h: 15, d: 15, c: '#2a52a8' };
      })
    }),

    ds3231: mod({
      name: 'DS3231 real-time clock', w: 38, d: 22, color: C.pcbBlue,
      rows: [{ names: ['32K', 'SQW', 'SCL', 'SDA', 'VCC', 'GND'], z: -8, cx: -5 }],
      deco: [{ t: 'cyl', x: 10, z: 3, r: 10, h: 3.4, c: C.silver, sides: 18 },
             { t: 'box', x: -10, z: 3, w: 8, h: 1.4, d: 6, c: C.chip }]
    }),

    sdcard: mod({
      name: 'Micro SD card module', w: 42, d: 24, color: C.pcbBlue,
      rows: [{ names: ['GND', 'VCC', 'MISO', 'MOSI', 'SCK', 'CS'], z: -9, cx: -3 }],
      deco: [{ t: 'box', x: 2, z: 4, w: 30, h: 3, d: 14, c: C.metal },
             { t: 'box', x: -16, z: 2, w: 6, h: 1.4, d: 6, c: C.chip }]
    }),

    mpu6050: mod({
      name: 'MPU-6050 accel + gyro', w: 21, d: 16, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'GND', 'SCL', 'SDA', 'XDA', 'XCL', 'AD0', 'INT'], z: -6 }],
      deco: [{ t: 'box', x: 0, z: 3, w: 4.2, h: 1.1, d: 4.2, c: C.chip }]
    }),

    soil: mod({
      name: 'Capacitive soil moisture sensor', w: 23, d: 98, color: '#1d6e4a',
      rows: [{ names: ['VCC', 'GND', 'AOUT'], z: -44 }],
      deco: [{ t: 'pad', x: 0, z: 14, w: 18, d: 60, c: '#17603f' },
             { t: 'box', x: -6, z: -34, w: 6, h: 1.3, d: 5, c: C.chip }]
    }),

    ldr: {
      name: 'LDR photoresistor', w: 5.5, d: 5.5, ex: 18,
      pins: { A: [-1.27, 0, 0], B: [1.27, 0, 0] },
      build: function () {
        return G.cyl(0, 6, 0, 2.6, 2, '#d9c98a', { sides: 14, top: '#c8b86f' })
          .concat(G.box(-1.27, 0, 0, 0.6, 6, 0.6, C.pinTin))
          .concat(G.box(1.27, 0, 0, 0.6, 6, 0.6, C.pinTin));
      }
    },

    led5: {
      name: '5 mm LED', w: 5, d: 5, ex: 18,
      pins: { A: [1.27, 0, 0], K: [-1.27, 0, 0] },
      build: function (o) {
        var c = o.c || '#d83c33';
        return G.cyl(0, 7, 0, 2.5, 4.5, c, { sides: 14 })
          .concat(G.cyl(0, 11.5, 0, 2.0, 1.6, c, { sides: 14 }))
          .concat(G.box(1.27, 0, 0, 0.55, 7.2, 0.55, C.pinTin))
          .concat(G.box(-1.27, 0, 0, 0.55, 6.4, 0.55, C.pinTin));
      }
    },

    resistor: {
      name: 'Resistor', w: 12, d: 3, ex: 16,
      pins: { A: [-6.35, 0, 0], B: [6.35, 0, 0] },
      build: function (o) {
        var bands = o.bands || ['#d14b2a', '#111', '#a8873c'];
        var f = G.cylX(0, 7, 0, 1.6, 6.4, '#d9c8a4', { sides: 10 });
        bands.forEach(function (b, i) { f = f.concat(G.cylX(-2 + i * 1.6, 7, 0, 1.75, 0.7, b, { sides: 10 })); });
        f = f.concat(G.box(-4.6, 0, 0, 0.5, 7, 0.5, C.pinTin));
        f = f.concat(G.box(4.6, 0, 0, 0.5, 7, 0.5, C.pinTin));
        f = f.concat(G.cylX(-5.4, 7, 0, 0.25, 1.7, C.pinTin, { sides: 6 }));
        f = f.concat(G.cylX(5.4, 7, 0, 0.25, 1.7, C.pinTin, { sides: 6 }));
        return f;
      }
    },

    button: {
      name: 'Tactile push button', w: 6, d: 6, ex: 16,
      pins: { '1A': [-3.1, 0, -2.5], '1B': [-3.1, 0, 2.5], '2A': [3.1, 0, -2.5], '2B': [3.1, 0, 2.5] },
      build: function () {
        var f = G.box(0, 0, 0, 6, 3.4, 6, '#23262a');
        f = f.concat(G.cyl(0, 3.4, 0, 1.75, 1.8, '#c8c4bc', { sides: 12 }));
        [[-3.1, -2.5], [-3.1, 2.5], [3.1, -2.5], [3.1, 2.5]].forEach(function (p) {
          f = f.concat(G.box(p[0], 0, p[1], 1.4, 0.4, 0.5, C.pinTin));
        });
        return f;
      }
    },

    pot10k: mod({
      name: '10 k potentiometer', w: 12, d: 12, hdrH: 5, color: '#2b6ca3',
      rows: [{ names: ['1', 'W', '3'], z: -6, flush: true }],
      deco: [{ t: 'cyl', x: 0, z: 1, r: 5.5, h: 6, c: '#1e5c8a', sides: 14 },
             { t: 'cyl', x: 0, z: 1, y: 6, r: 2.6, h: 9, c: '#e3e0d8', sides: 12 }]
    }),

    buzzer: {
      name: 'Passive piezo buzzer', w: 12, d: 12, ex: 18,
      pins: { '+': [2.5, 0, 0], '-': [-2.5, 0, 0] },
      build: function () {
        return G.cyl(0, 0, 0, 6, 9, '#1c1e22', { sides: 18, top: '#2a2d32' })
          .concat(G.cyl(0, 9, 0, 1.1, 0.3, '#3a3f45', { sides: 8 }))
          .concat(G.box(2.5, -6, 0, 0.5, 6, 0.5, C.pinTin))
          .concat(G.box(-2.5, -6, 0, 0.5, 6, 0.5, C.pinTin));
      }
    },

    servo: {
      name: 'SG90 micro servo', w: 32.5, d: 12.5, ex: 30,
      pins: { SIG: [-13, 8, -8], VCC: [-13, 8, -5.5], GND: [-13, 8, -3] },
      build: function () {
        var f = G.box(0, 0, 0, 22.8, 22.5, 12.2, '#2e86c8');
        f = f.concat(G.box(0, 15.5, 0, 32.2, 2.5, 12.2, '#2e86c8'));       // mounting ears
        f = f.concat(G.cyl(-5.7, 22.5, 0, 5.8, 4, '#2578b8', { sides: 14 }));
        f = f.concat(G.cyl(-5.7, 26.5, 0, 2.4, 3, C.pcbWhite, { sides: 12 }));
        f = f.concat(G.box(-5.7, 29.5, 0, 22, 1.6, 3.5, C.pcbWhite));      // horn
        [['#e0a030', -8], ['#d04a3a', -5.5], ['#26262a', -3]].forEach(function (w) {
          f = f.concat(G.box(-13, 7.4, w[1], 6, 1.2, 1.6, w[0]));
        });
        return f;
      }
    },

    ws2812ring: {
      name: 'WS2812B ring, 16 LED', w: 46, d: 46, ex: 22,
      pins: { '5V': [-18, 2.2, -12], GND: [-18, 2.2, -7], DI: [-18, 2.2, -2], DO: [-18, 2.2, 3] },
      build: function () {
        var f = G.cyl(0, 0, 0, 23, 1.6, C.pcbBlack, { sides: 28, top: C.pcbBlack });
        for (var i = 0; i < 16; i++) {
          var a = i / 16 * Math.PI * 2;
          f = f.concat(G.box(Math.cos(a) * 17.5, 1.6, Math.sin(a) * 17.5, 5, 1.6, 5, '#f4f2ec'));
        }
        return f;
      }
    },

    ws2812strip: {
      name: 'WS2812B strip', w: 200, d: 10, ex: 20,
      pins: { '5V': [-96, 2.6, -3], DIN: [-96, 2.6, 0], GND: [-96, 2.6, 3] },
      build: function (o) {
        var n = o.n || 12, len = n * 16.6;
        var f = G.box(0, 0, 0, len, 1.4, 10, C.pcbBlack, { top: C.pcbBlack });
        for (var i = 0; i < n; i++) {
          f = f.concat(G.box(-len / 2 + 8.3 + i * 16.6, 1.4, 0, 5, 1.6, 5, '#f6f4ee'));
        }
        return f;
      }
    },

    l298n: mod({
      name: 'L298N motor driver', w: 43, d: 43, color: C.pcbBlue,
      rows: [{ names: ['ENA', 'IN1', 'IN2', 'IN3', 'IN4', 'ENB'], z: -18, cx: 4 }],
      extraPins: [['OUT1', -14, 12, 20], ['OUT2', -6, 12, 20], ['OUT3', 6, 12, 20], ['OUT4', 14, 12, 20],
                  ['12V', -16, 12, -20], ['GND', -8, 12, -20], ['5V', 0, 12, -20]],
      deco: [{ t: 'box', x: 0, z: 8, w: 24, h: 24, d: 6, c: C.metal },
             { t: 'box', x: 0, z: 2, w: 20, h: 6, d: 4, c: '#23262a' },
             { t: 'cyl', x: 16, z: -2, r: 5, h: 10, c: '#1b1e22', sides: 12 }]
    }),

    tm1637: mod({
      name: 'TM1637 4-digit display', w: 42, d: 24, color: C.pcbBlue,
      rows: [{ names: ['CLK', 'DIO', 'VCC', 'GND'], z: -9 }],
      deco: [{ t: 'box', x: 0, z: 3, w: 38, h: 3, d: 13, c: '#12151a' },
             { t: 'pad', x: 0, z: 3, w: 32, d: 9, c: '#5a1512' }]
    }),

    /* IN-12 nixie: a glass envelope on a small socket board. The cathode
       pins are real - each digit is its own wire back to the driver. */
    i2sdac: mod({
      name: 'PCM5102A I2S DAC', w: 34, d: 24, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'GND', 'BCK', 'DIN', 'LCK', 'SCK'], z: -8, step: 5.2 },
             { names: ['LOUT', 'ROUT', 'AGND'], z: 9, step: 7 }],
      deco: [{ t: 'box', x: -4, z: 2, w: 9, h: 2, d: 9, c: C.chip },
             { t: 'cyl', x: 10, z: 2, r: 3, h: 5, c: '#1b1f26', sides: 12 }]
    }),

    ssr: mod({
      name: 'Solid state relay 25 A', w: 58, d: 45, color: '#0e1114', h: 3,
      rows: [{ names: ['IN+', 'IN-'], z: 17, step: 11, flush: true },
             { names: ['L1', 'T1'], z: -17, step: 16, flush: true }],
      deco: [{ t: 'box', x: 0, z: 0, w: 52, h: 22, d: 36, c: '#15181d' },
             { t: 'pad', x: 0, z: 4, w: 30, d: 12, c: '#c9c4b6' }]
    }),

    max31855: mod({
      name: 'MAX31855 thermocouple amp', w: 26, d: 20, color: C.pcbBlack,
      rows: [{ names: ['VIN', '3V3', 'GND', 'DO', 'CS', 'CLK'], z: -7 }],
      deco: [{ t: 'box', x: 0, z: 3, w: 8, h: 2, d: 6, c: C.chip },
             { t: 'pad', x: -8, z: 4, w: 6, d: 8, c: '#b8860b' },
             { t: 'pad', x: 8, z: 4, w: 6, d: 8, c: '#b8860b' }]
    }),

    nixie: mod({
      name: 'IN-12 nixie tube', w: 30, d: 30, color: C.pcbBlack,
      rows: [{ names: ['AN', 'K0', 'K1', 'K2', 'K3', 'K4'], z: -12, step: 4.2 },
             { names: ['K5', 'K6', 'K7', 'K8', 'K9'], z: 12, step: 4.2 }],
      deco: [{ t: 'cyl', x: 0, z: 0, r: 13, h: 40, c: '#cfd6de', sides: 20 },
             { t: 'cyl', x: 0, z: 0, r: 9, h: 14, c: '#ff8a3d', sides: 16 }]
    }),

    nixiehv: mod({
      name: '170 V nixie supply', w: 40, d: 26, color: C.pcbGreen,
      rows: [{ names: ['VIN', 'GND'], z: -10, cx: -13 },
             { names: ['HV+', 'HV-'], z: -10, cx: 13 }],
      deco: [{ t: 'cyl', x: -8, z: 4, r: 6, h: 11, c: '#1b1f26', sides: 14 },
             { t: 'box', x: 9, z: 4, w: 12, h: 6, d: 10, c: '#3a2a12' }]
    }),

    panelmeter: mod({
      name: 'Analogue panel meter', w: 52, d: 46, color: '#0d0f12', h: 3,
      rows: [{ names: ['+', '-'], z: 20, step: 12, flush: true }],
      deco: [{ t: 'box', x: 0, z: -2, w: 46, h: 22, d: 34, c: '#e8e3d6' },
             { t: 'box', x: 0, z: -2, w: 2, h: 24, d: 22, c: '#b3372d' }]
    }),

    flapunit: mod({
      name: 'Split-flap module', w: 60, d: 54, color: C.pcbBlack,
      rows: [{ names: ['IN1', 'IN2', 'IN3', 'IN4'], z: -22 },
             { names: ['VCC', 'GND', 'HALL'], z: 22, cx: -8 }],
      deco: [{ t: 'cyl', x: 0, z: 2, r: 20, h: 26, c: '#f3efe6', sides: 18 },
             { t: 'box', x: -24, z: 2, w: 10, h: 18, d: 18, c: '#2a2f38' }]
    }),

    max7219: mod({
      name: 'MAX7219 8x8 matrix, 4-in-1', w: 128, d: 32, color: C.pcbBlack,
      rows: [{ names: ['VCC', 'GND', 'DIN', 'CS', 'CLK'], z: -13, cx: -48 }],
      deco: [0, 1, 2, 3].map(function (i) {
        return { t: 'box', x: -48 + i * 32, z: 4, w: 31, h: 4.5, d: 31, c: '#17191d' };
      })
    }),

    keypad4x4: {
      name: '4x4 membrane keypad', w: 70, d: 77, ex: 20,
      pins: (function () {
        var p = {}, n = ['R1', 'R2', 'R3', 'R4', 'C1', 'C2', 'C3', 'C4'];
        n.forEach(function (k, i) { p[k] = [-8.9 + i * P, 1.2, -46]; });
        return p;
      }()),
      build: function () {
        var f = G.box(0, 0, 0, 70, 1, 77, '#1f2126', { top: '#24272c' });
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
          f = f.concat(G.pad(-24 + c * 16, 1.15, -24 + r * 16, 13, 13, '#32363c'));
        }
        f = f.concat(G.box(0, 0, -44, 22, 0.6, 12, '#2b2e33'));
        return f;
      }
    },

    irrecv: {
      name: 'IR receiver (VS1838B)', w: 7, d: 6, ex: 18,
      pins: { OUT: [-2.54, 0, 0], GND: [0, 0, 0], VCC: [2.54, 0, 0] },
      build: function () {
        var f = G.box(0, 5, 1, 7, 7.5, 3.2, '#1a1c20');
        f = f.concat(G.cyl(0, 5, -0.6, 2.6, 4.2, '#23262b', { sides: 14 }));
        [-2.54, 0, 2.54].forEach(function (x) { f = f.concat(G.box(x, 0, 1, 0.5, 5, 0.5, C.pinTin)); });
        return f;
      }
    },

    nrf24: mod({
      name: 'nRF24L01+ radio', w: 29, d: 15.5, color: C.pcbBlue,
      rows: [{ names: ['GND', 'VCC', 'CE', 'CSN'], z: -4.5, cx: -8.9, step: P },
             { names: ['SCK', 'MOSI', 'MISO', 'IRQ'], z: -4.5 + P, cx: -8.9, step: P }],
      deco: [{ t: 'box', x: 4, z: 0, w: 15, h: 1.6, d: 12, c: C.metal },
             { t: 'pad', x: 12, z: 0, w: 6, d: 10, c: '#d8c98a' }]
    }),

    /* Ra-02 style SX1276 breakout. Real modules vary in pin order more
       than almost anything else in this book - check YOUR silkscreen
       before wiring, the labels here are the common Ai-Thinker layout. */
    lora: mod({
      name: 'SX1276 LoRa module', w: 30, d: 18, color: C.pcbBlue,
      rows: [{ names: ['GND', 'MISO', 'MOSI', 'SCK', 'NSS', 'RST', 'DIO0'], z: -6.5, step: P },
             { names: ['VCC', 'DIO1', 'DIO2', 'DIO3', 'DIO4', 'DIO5', 'GND2'], z: -6.5 + P, step: P }],
      extraPins: [['ANT', 11, 5.5, 5]],
      deco: [{ t: 'box', x: -3, z: 3.5, w: 16, h: 1.8, d: 9, c: C.metal },
             { t: 'box', x: 11, z: 5, w: 4.5, h: 3.5, d: 4.5, c: '#c8ccd0' }]
    }),

    /* HC-05: the blue board on a carrier, with the EN pin people forget
       and the state LED that tells you which mode it is in. */
    hc05: mod({
      name: 'HC-05 Bluetooth serial', w: 37, d: 16, color: C.pcbBlue,
      rows: [{ names: ['EN', 'VCC', 'GND', 'TXD', 'RXD', 'STATE'], z: -5, cx: -4, step: P }],
      deco: [{ t: 'box', x: 8, z: 1.5, w: 17, h: 1.6, d: 11, c: '#2f4f8f' },
             { t: 'pad', x: 15.5, z: 1.5, w: 4, d: 9, c: '#d8c98a' },
             { t: 'box', x: -14, z: 4, w: 3, h: 1.6, d: 2, c: '#cf3b34' }]
    }),

    /* SIM800L: the small blue board with the SIM socket on the back and
       a notoriously hungry 2 A transmit burst. */
    sim800l: mod({
      name: 'SIM800L GSM module', w: 25, d: 23, color: C.pcbBlue,
      rows: [{ names: ['NET', 'VCC', 'RST', 'RXD', 'TXD', 'GND'], z: -8, step: P },
             { names: ['RING', 'DTR', 'MIC+', 'MIC-', 'SPK+', 'SPK-'], z: 8, step: P }],
      extraPins: [['ANT', 10, 4, 0]],
      deco: [{ t: 'box', x: -2, z: 0, w: 15, h: 1.4, d: 13, c: '#2b3138' },
             { t: 'pad', x: 6, z: -2, w: 11, d: 13, c: '#c0c4c8' },
             { t: 'box', x: 10, z: 0, w: 3, h: 2.5, d: 3, c: '#c8ccd0' }]
    }),

    /* SIM7080G / A7670 class LTE breakout - bigger board, SIM holder,
       two u.FL pads for main and diversity antennas. */
    lte: mod({
      name: 'LTE module breakout', w: 48, d: 34, color: C.pcbBlack,
      rows: [{ names: ['VCC', 'GND', 'TXD', 'RXD', 'PWR', 'RST', 'DTR', 'STA'], z: -13, step: P }],
      extraPins: [['ANT', 20, 4.5, 8], ['DIV', 20, 4.5, -2], ['SIM', -14, 3, 8]],
      deco: [{ t: 'box', x: 2, z: -2, w: 22, h: 2.2, d: 18, c: '#2b3138' },
             { t: 'pad', x: 2, z: -2, w: 19, d: 15, c: '#8d9096' },
             { t: 'box', x: -14, z: 8, w: 16, h: 2.4, d: 14, c: C.metal },
             { t: 'box', x: 20, z: 8, w: 3.5, h: 2.5, d: 3.5, c: '#c8ccd0' },
             { t: 'box', x: 20, z: -2, w: 3.5, h: 2.5, d: 3.5, c: '#c8ccd0' }]
    }),

    /* An M.2 Key-B 5G module on its carrier: the card is 30 x 52 mm and
       the four antenna connectors along its edge are the whole story. */
    m2mod: {
      name: '5G NR module on M.2 carrier', w: 72, d: 62, ex: 0,
      pins: {
        ANT0: [26, 5, -18], ANT1: [26, 5, -6], ANT2: [26, 5, 6], ANT3: [26, 5, 18],
        USB: [-34, 6, 0], PWR: [-34, 6, 20], SIM: [-18, 4, -24]
      },
      build: function () {
        var f = G.box(0, 0, 0, 72, 1.6, 62, '#1d3552', { top: '#1d3552' });
        // the module card itself, standing off the carrier
        f = f.concat(G.box(2, 1.6, 0, 52, 3, 30, '#141719'));
        f = f.concat(G.pad(2, 4.7, 0, 46, 24, '#22272c'));
        f = f.concat(G.box(-14, 4.7, 0, 16, 1.2, 16, '#3a3f45'));   // the SoC
        // four u.FL antenna connectors down one edge
        for (var i = 0; i < 4; i++) {
          f = f.concat(G.box(26, 4.7, -18 + i * 12, 4, 2.5, 4, '#c8ccd0'));
        }
        f = f.concat(G.box(-34, 1.6, 0, 14, 5, 12, C.metal));       // USB 3
        f = f.concat(G.box(-34, 1.6, 20, 9, 3.5, 8, '#1a1c1f'));    // barrel jack
        f = f.concat(G.box(-18, 1.6, -24, 18, 2.4, 14, C.metal));   // SIM holder
        return f;
      }
    },

    /* --- sensors and modules for the later themes --------------------- */

    ld2410: mod({
      name: 'LD2410C mmWave presence sensor', w: 20, d: 32, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'GND', 'TX', 'RX', 'OUT'], z: -13, step: P }],
      deco: [{ t: 'pad', x: 0, z: 5, w: 15, d: 15, c: '#c9a227' },
             { t: 'box', x: 0, z: -4, w: 6, h: 1.2, d: 6, c: C.chip }]
    }),

    amg8833: mod({
      name: 'AMG8833 thermal camera', w: 25, d: 20, color: C.pcbBlack,
      rows: [{ names: ['VIN', '3V3', 'GND', 'SCL', 'SDA', 'INT'], z: -7, step: P }],
      deco: [{ t: 'box', x: 0, z: 4, w: 12, h: 3.2, d: 12, c: '#c0c4c8' },
             { t: 'cyl', x: 0, z: 4, r: 4, h: 3.6, c: '#2a2f36', sides: 12 }]
    }),

    ltr390: mod({
      name: 'LTR390 UV sensor', w: 18, d: 16, color: C.pcbPurple,
      rows: [{ names: ['VIN', '3V3', 'GND', 'SCL', 'SDA'], z: -5, step: P }],
      deco: [{ t: 'box', x: 0, z: 3, w: 3, h: 1, d: 3, c: C.clear }]
    }),

    mcp4725: mod({
      name: 'MCP4725 12-bit DAC', w: 20, d: 14, color: C.pcbBlue,
      rows: [{ names: ['OUT', 'GND', 'SCL', 'SDA', 'VCC'], z: -4, step: P }],
      deco: [{ t: 'box', x: 2, z: 2, w: 5, h: 1.1, d: 4, c: C.chip }]
    }),

    watersens: {
      name: 'Water leak probe', w: 20, d: 60, ex: 24,
      pins: { VCC: [-P, 4, -26], GND: [0, 4, -26], SIG: [P, 4, -26] },
      build: function () {
        var f = G.box(0, 0, 0, 20, 1.2, 60, C.pcbBlue, { top: C.pcbBlue });
        // interleaved exposed tracks - the part that corrodes if left powered
        for (var i = 0; i < 9; i++) {
          f = f.concat(G.pad(-6 + (i % 2) * 12, 1.3, -10 + i * 4, 11, 2, C.pinGold));
        }
        f = f.concat(G.box(0, 1.2, -26, 3 * P, 7.9, 2.4, C.hdr));
        return f;
      }
    },

    seg7big: {
      name: '7-segment digit, 1.8 in', w: 26, d: 46, ex: 20,
      pins: { A: [-9, 3, -20], B: [-3, 3, -20], C: [3, 3, -20], D: [9, 3, -20],
              E: [-9, 3, 20], F: [-3, 3, 20], G: [3, 3, 20], CC: [9, 3, 20] },
      build: function () {
        var f = G.box(0, 0, 0, 26, 3, 46, '#1a1c1f', { top: '#1a1c1f' });
        var on = '#b8302a';
        // seven bars laid out as a figure eight
        f = f.concat(G.pad(0, 3.1, -16, 14, 3.5, on));     // A
        f = f.concat(G.pad(8, 3.1, -8.5, 3.5, 12, on));    // B
        f = f.concat(G.pad(8, 3.1, 8.5, 3.5, 12, on));     // C
        f = f.concat(G.pad(0, 3.1, 16, 14, 3.5, on));      // D
        f = f.concat(G.pad(-8, 3.1, 8.5, 3.5, 12, on));    // E
        f = f.concat(G.pad(-8, 3.1, -8.5, 3.5, 12, on));   // F
        f = f.concat(G.pad(0, 3.1, 0, 14, 3.5, on));       // G
        f = f.concat(G.cyl(11, 3.1, 18, 1.6, 0.4, on, { sides: 8 }));
        return f;
      }
    },

    laser: {
      name: 'Laser diode module', w: 12, d: 32, ex: 22,
      pins: { '+': [-2, 3, 15], '-': [2, 3, 15] },
      build: function () {
        var f = G.cylX(0, 6, 0, 6, 26, C.metal, { sides: 14 });
        f = f.concat(G.cylX(15, 6, 0, 3.2, 4, '#8d9096', { sides: 12 }));
        f = f.concat(G.box(-2, 0, 15, 6, 2, 6, '#c03030'));
        return f;
      }
    },

    nema17: {
      name: 'NEMA 17 stepper', w: 42.3, d: 42.3, ex: 0,
      pins: { A1: [-14, 4, 21], A2: [-5, 4, 21], B1: [5, 4, 21], B2: [14, 4, 21] },
      build: function () {
        var f = G.box(0, 0, 0, 42.3, 40, 42.3, '#3a3f45');
        f = f.concat(G.pad(0, 40.1, 0, 38, 38, '#2b3138'));
        f = f.concat(G.cyl(0, 40, 0, 11, 2, C.metal, { sides: 16 }));
        f = f.concat(G.cyl(0, 42, 0, 2.5, 22, C.metal, { sides: 12 }));
        for (var i = 0; i < 4; i++) {
          var x = (i % 2 ? 1 : -1) * 15.5, z = (i < 2 ? -1 : 1) * 15.5;
          f = f.concat(G.cyl(x, 40, z, 1.5, 1, '#1a1c1f', { sides: 8, lod: 1 }));
        }
        f = f.concat(G.box(0, 4, 21, 3 * P + 6, 6, 3, C.hdr));
        return f;
      }
    },

    a4988: mod({
      name: 'A4988 stepper driver', w: 20, d: 15, color: '#1d5c3a',
      rows: [{ names: ['EN', 'MS1', 'MS2', 'MS3', 'RST', 'SLP', 'STEP', 'DIR'], z: -5, step: P, cx: -1 },
             { names: ['VMOT', 'GND2', '2B', '2A', '1A', '1B', 'VDD', 'GND'], z: 5, step: P, cx: -1 }],
      deco: [{ t: 'box', x: 0, z: 0, w: 5, h: 1.4, d: 5, c: C.chip },
             { t: 'box', x: 0, z: 0, w: 9, h: 3, d: 9, c: '#9aa0a6' }]
    }),

    tcs34725: mod({
      name: 'TCS34725 colour sensor', w: 19, d: 16, color: C.pcbPurple,
      rows: [{ names: ['VIN', '3V3', 'GND', 'SCL', 'SDA', 'INT', 'LED'], z: -5, step: P }],
      deco: [{ t: 'box', x: 0, z: 3, w: 3.5, h: 1, d: 3.5, c: C.clear },
             { t: 'box', x: 6, z: 3, w: 2.5, h: 1, d: 2, c: C.white }]
    }),

    hall: mod({
      name: 'Hall effect sensor module', w: 16, d: 30, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'GND', 'DO'], z: -11, step: P }],
      deco: [{ t: 'box', x: 0, z: 9, w: 4, h: 1.5, d: 3, c: '#1a1c1f' }]
    }),

    loadcell: {
      name: 'Load cell, 5 kg bar', w: 80, d: 13, ex: 26,
      pins: { RED: [-34, 7, 0], BLK: [-34, 7, 3], WHT: [-34, 7, -3], GRN: [-34, 7, 6] },
      build: function () {
        var f = G.box(0, 0, 0, 80, 12.7, 12.7, '#b9bdc2');
        f = f.concat(G.cyl(-12, 6, 0, 5, 12.8, '#9aa0a6', { sides: 14 }));
        f = f.concat(G.cyl(12, 6, 0, 5, 12.8, '#9aa0a6', { sides: 14 }));
        f = f.concat(G.pad(2, 12.8, 0, 16, 9, '#d8d2c4'));
        return f;
      }
    },

    /* AA holders - a cell is 14.5 mm across and 50.5 mm long, and the
       holder adds a couple of millimetres of plastic each way. */
    batt2aa: (function () {
      return {
        name: '2x AA battery holder', w: 58, d: 34, ex: 0,
        pins: { '+': [29, 8, -9], '-': [29, 8, 9] },
        build: function () {
          var f = G.box(0, 0, 0, 58, 6, 34, '#1a1c1f');
          [-9, 9].forEach(function (z) {
            f = f.concat(G.cylX(0, 13, z, 7.25, 50.5, '#2f3439', { sides: 14 }));
            f = f.concat(G.pad(0, 20.4, z, 34, 9, '#c8ccd0'));
            f = f.concat(G.cylX(-26, 13, z, 3, 2, C.metal, { sides: 10 }));
          });
          f = f.concat(G.box(29, 6, -9, 3, 3, 4, '#cf3b34'));
          f = f.concat(G.box(29, 6, 9, 3, 3, 4, '#26262a'));
          return f;
        }
      };
    }()),

    batt4aa: {
      name: '4x AA battery holder', w: 58, d: 66, ex: 0,
      pins: { '+': [29, 8, -24], '-': [29, 8, 24] },
      build: function () {
        var f = G.box(0, 0, 0, 58, 6, 66, '#1a1c1f');
        [-24, -8, 8, 24].forEach(function (z) {
          f = f.concat(G.cylX(0, 13, z, 7.25, 50.5, '#2f3439', { sides: 12 }));
          f = f.concat(G.pad(0, 20.4, z, 34, 8, '#c8ccd0'));
        });
        f = f.concat(G.box(29, 6, -24, 3, 3, 4, '#cf3b34'));
        f = f.concat(G.box(29, 6, 24, 3, 3, 4, '#26262a'));
        return f;
      }
    },

    /* --- brushless hardware ------------------------------------------
       A 2207 motor is 27 mm across the bell and 32 mm tall with the
       shaft. Three wires, no connector - you solder them. */
    bldc: {
      name: '2207 brushless motor', w: 28, d: 28, ex: 0,
      pins: { A: [-5, 3, 14], B: [0, 3, 14], C: [5, 3, 14] },
      build: function () {
        var f = G.cyl(0, 0, 0, 14, 4, '#2b3138', { sides: 18 });     // base
        f = f.concat(G.cyl(0, 4, 0, 13.5, 16, '#b4442e', { sides: 18, top: '#8f3524' }));
        // the vents in the bell, which is what these actually look like
        for (var i = 0; i < 9; i++) {
          var a = i / 9 * Math.PI * 2;
          f = f.concat(G.box(Math.cos(a) * 10, 19, Math.sin(a) * 10, 4, 1.2, 4, '#6f2a1c'));
        }
        f = f.concat(G.cyl(0, 20, 0, 2.5, 9, C.metal, { sides: 10 }));  // shaft
        f = f.concat(G.cyl(0, 20, 0, 6, 2, '#c8ccd0', { sides: 12 }));  // prop nut seat
        [-5, 0, 5].forEach(function (x, i) {
          f = f.concat(G.box(x, 1, 14, 2, 2, 8, ['#cf3b34', '#26262a', '#d8d2c4'][i]));
        });
        return f;
      }
    },

    /* A bare ESC: a small PCB in heatshrink with fat wires one end and
       a servo lead the other. */
    esc: {
      name: '30 A brushless ESC', w: 26, d: 40, ex: 22,
      pins: {
        'B+': [-6, 3, -20], 'B-': [6, 3, -20],
        A: [-8, 3, 20], B: [0, 3, 20], C: [8, 3, 20],
        SIG: [-9, 4, 14], GND: [-4, 4, 14], BEC: [1, 4, 14]
      },
      build: function () {
        var f = G.box(0, 0, 0, 26, 5, 40, '#141719', { top: '#1b1f22' });
        f = f.concat(G.pad(0, 5.1, -6, 20, 16, '#2b3138'));
        f = f.concat(G.box(0, 5, 8, 14, 3.5, 9, '#3a3f45'));      // the FETs
        f = f.concat(G.cyl(-7, 5, -12, 4, 7, '#1d3552', { sides: 12 }));  // bulk cap
        return f;
      }
    },

    /* A 5 inch three-blade propeller, seen from above. */
    prop5: {
      name: '5 inch propeller', w: 127, d: 127, ex: 0,
      pins: { HUB: [0, 4, 0] },
      build: function () {
        var f = G.cyl(0, 0, 0, 7, 5, '#2b3138', { sides: 12 });
        for (var b = 0; b < 3; b++) {
          var a = b / 3 * Math.PI * 2;
          for (var seg = 0; seg < 6; seg++) {
            var r = 9 + seg * 9;
            var w = 13 - seg * 1.2;
            f = f.concat(G.box(Math.cos(a) * r, 3.2 + seg * 0.15,
                               Math.sin(a) * r, w, 1.1, w, '#cfd3d8', { lod: 1 }));
          }
        }
        return f;
      }
    },

    /* A 4S LiPo pack: a soft brick with an XT60 and a balance lead. */
    lipo4s: {
      name: '4S LiPo pack', w: 76, d: 36, ex: 0,
      pins: { 'XT+': [-38, 10, -8], 'XT-': [-38, 10, 8], BAL: [-38, 16, 0] },
      build: function () {
        var f = G.box(0, 0, 0, 76, 30, 36, '#2a2f36', { top: '#343a42' });
        f = f.concat(G.pad(0, 30.1, 0, 60, 26, '#b4662b'));
        f = f.concat(G.box(-40, 6, 0, 8, 10, 16, '#f0d000'));      // XT60 body
        f = f.concat(G.box(-44, 16, 0, 6, 2, 10, '#d8d2c4'));      // balance lead
        return f;
      }
    },

    /* A tiny ELRS receiver: a stamp-sized board with a wire antenna. */
    rxelrs: mod({
      name: 'ExpressLRS receiver', w: 14, d: 18, color: C.pcbBlack,
      rows: [{ names: ['5V', 'GND', 'TX', 'RX'], z: -6, step: 2.0 }],
      extraPins: [['ANT', 0, 3, 8]],
      deco: [{ t: 'box', x: 0, z: 0, w: 7, h: 1.3, d: 7, c: C.chip },
             { t: 'box', x: 0, z: 8, w: 1.4, h: 0.8, d: 14, c: '#d8d2c4' }]
    }),

    /* A quadcopter frame seen from above - the arms and the stack plate. */
    quadframe: {
      name: '5 inch quad frame', w: 210, d: 210, ex: 0,
      pins: {
        M1: [-75, 5, -75], M2: [75, 5, -75], M3: [75, 5, 75], M4: [-75, 5, 75],
        STACK: [0, 5, 0]
      },
      build: function () {
        var f = G.box(0, 0, 0, 60, 4, 70, '#1a1c1f', { top: '#26292d' });
        // four arms, each a plate running out to a motor mount
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (d) {
          for (var i = 0; i < 7; i++) {
            var t = i / 6;
            f = f.concat(G.box(d[0] * (25 + t * 52), 1, d[1] * (25 + t * 52),
                               16, 4, 16, '#202326', { lod: 1 }));
          }
          f = f.concat(G.cyl(d[0] * 75, 4, d[1] * 75, 13, 3, '#2b2f34', { sides: 14 }));
        });
        f = f.concat(G.pad(0, 4.2, 0, 34, 34, '#3a3f45'));
        return f;
      }
    },

    as5600: mod({
      name: 'AS5600 magnetic encoder', w: 18, d: 20, color: C.pcbPurple,
      rows: [{ names: ['VCC', 'GND', 'SDA', 'SCL', 'DIR', 'OUT'], z: -7, step: 2.0 }],
      deco: [{ t: 'box', x: 0, z: 3, w: 4.5, h: 1.1, d: 4.5, c: C.chip },
             { t: 'cyl', x: 0, z: 3, r: 1.2, h: 1.4, c: '#8d9096', sides: 8 }]
    }),

    hx711: mod({
      name: 'HX711 load-cell amplifier', w: 34, d: 21, color: C.pcbRed,
      rows: [{ names: ['GND', 'DT', 'SCK', 'VCC'], z: -8, cx: 8 },
             { names: ['E+', 'E-', 'A-', 'A+'], z: 8, cx: -8 }],
      deco: [{ t: 'box', x: 0, z: 0, w: 8, h: 1.3, d: 5, c: C.chip }]
    }),

    ds18b20: {
      name: 'DS18B20 waterproof probe', w: 60, d: 6, ex: 18,
      pins: { VCC: [-28, 3, -2.54], DATA: [-28, 3, 0], GND: [-28, 3, 2.54] },
      build: function () {
        var f = G.cylX(10, 3, 0, 3, 40, C.silver, { sides: 14 });
        f = f.concat(G.cylX(-18, 3, 0, 2, 16, '#1a1c20', { sides: 10 }));
        [['#d04a3a', -2.54], ['#e0c030', 0], ['#26262a', 2.54]].forEach(function (w) {
          f = f.concat(G.box(-28, 2.4, w[1], 10, 1.2, 1.4, w[0]));
        });
        return f;
      }
    },

    mq2: mod({
      name: 'MQ-2 gas sensor', w: 32, d: 20, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'GND', 'DO', 'AO'], z: -7.5, cx: -6 }],
      deco: [{ t: 'cyl', x: 8, z: 2, r: 9, h: 13, c: C.silver, sides: 16 }]
    }),

    rotary: mod({
      name: 'KY-040 rotary encoder', w: 26, d: 19, color: C.pcbBlue,
      rows: [{ names: ['CLK', 'DT', 'SW', 'VCC', 'GND'], z: -7 }],
      deco: [{ t: 'box', x: 0, z: 3, w: 12.4, h: 6.5, d: 13.2, c: C.metal },
             { t: 'cyl', x: 0, z: 3, y: 6.5, r: 3, h: 12, c: '#c8c4bc', sides: 12 }]
    }),

    joystick: mod({
      name: 'Analog joystick module', w: 38, d: 26, color: C.pcbBlue,
      rows: [{ names: ['GND', 'VCC', 'VRx', 'VRy', 'SW'], z: -11, cx: 0 }],
      deco: [{ t: 'box', x: 0, z: 3, w: 25, h: 10, d: 21, c: '#23262a' },
             { t: 'cyl', x: 0, z: 3, y: 10, r: 8, h: 8, c: '#1a1c20', sides: 16 }]
    }),

    ina219: mod({
      name: 'INA219 current monitor', w: 22, d: 20, color: C.pcbGreen,
      rows: [{ names: ['VCC', 'GND', 'SCL', 'SDA'], z: -7.5, cx: -2 }],
      extraPins: [['VIN+', -6, 12, 8], ['VIN-', 4, 12, 8]],
      deco: [{ t: 'box', x: 4, z: 6, w: 10, h: 9, d: 7, c: '#2b6ca3' }]
    }),

    tp4056: mod({
      name: 'TP4056 LiPo charger', w: 26, d: 18, color: C.pcbBlue,
      rows: [{ names: ['B+', 'B-'], z: 7, cx: 8 }, { names: ['OUT+', 'OUT-'], z: 7, cx: -8 }],
      deco: [{ t: 'box', x: -9, z: -6, w: 8, h: 3, d: 6, c: C.metal },
             { t: 'box', x: 4, z: 0, w: 4, h: 1.1, d: 3, c: C.chip }]
    }),

    buck: mod({
      name: 'Buck converter (LM2596)', w: 43, d: 21, color: C.pcbBlue,
      rows: [{ names: ['IN+', 'IN-'], z: -7, cx: -14 }, { names: ['OUT+', 'OUT-'], z: -7, cx: 14 }],
      deco: [{ t: 'cyl', x: -6, z: 4, r: 4, h: 11, c: '#1b1e22', sides: 12 },
             { t: 'cyl', x: 8, z: 4, r: 4, h: 11, c: '#1b1e22', sides: 12 },
             { t: 'box', x: 0, z: -2, w: 9, h: 5, d: 6, c: C.chip }]
    }),

    dfplayer: mod({
      name: 'DFPlayer Mini MP3', w: 20, d: 20, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'RX', 'TX', 'DACR', 'DACL', 'SPK2', 'GND', 'SPK1'], z: -7.5, vertical: true, cx: -7.5 }],
      deco: [{ t: 'box', x: 4, z: 0, w: 12, h: 3, d: 14, c: C.metal }]
    }),

    pca9685: mod({
      name: 'PCA9685 16-ch servo driver', w: 62, d: 25, color: C.pcbBlue,
      rows: [{ names: ['GND', 'OE', 'SCL', 'SDA', 'VCC', 'V+'], z: -10, cx: -20 }],
      /* The sixteen 3-pin servo headers along the back edge. Only the
         first few are ever wired in these projects, so name those. */
      extraPins: [['CH0', -6, 12, 8], ['CH1', 0, 12, 8], ['CH2', 6, 12, 8],
                  ['CH3', 12, 12, 8], ['CH4', 18, 12, 8], ['CH5', 24, 12, 8]],
      deco: [{ t: 'box', x: 8, z: 0, w: 40, h: 8, d: 8, c: C.hdr },
             { t: 'box', x: -16, z: 4, w: 9, h: 1.3, d: 9, c: C.chip }]
    }),

    fingerprint: {
      name: 'R307 fingerprint reader', w: 40, d: 40, ex: 24,
      pins: { VCC: [-20, 4, -3.8], TX: [-20, 4, -1.3], RX: [-20, 4, 1.3], GND: [-20, 4, 3.8] },
      build: function () {
        var f = G.cyl(0, 0, 0, 14, 10, '#23262b', { sides: 20, top: '#2b2f35' });
        f = f.concat(G.cyl(0, 10, 0, 10.5, 1.2, '#1b3a4a', { sides: 20, top: '#2a5a6e' }));
        [['#d04a3a', -3.8], ['#e0c030', -1.3], ['#4a8fd0', 1.3], ['#26262a', 3.8]].forEach(function (w) {
          f = f.concat(G.box(-20, 3.4, w[1], 14, 1.1, 1.4, w[0]));
        });
        return f;
      }
    },

    solenoid: {
      name: '12 V solenoid lock', w: 55, d: 42, ex: 26,
      pins: { 'W1': [-27, 14, -4], 'W2': [-27, 14, 4] },
      build: function () {
        var f = G.box(0, 0, 0, 55, 28, 42, C.silver, { top: '#cbcfd4' });
        f = f.concat(G.box(24, 6, 0, 16, 12, 12, '#9aa0a6'));
        [['#d04a3a', -4], ['#26262a', 4]].forEach(function (w) {
          f = f.concat(G.box(-27, 13.4, w[1], 12, 1.4, 1.8, w[0]));
        });
        return f;
      }
    },

    pump5v: {
      name: '5 V submersible pump', w: 46, d: 24, ex: 24,
      pins: { 'W1': [-23, 14, -3], 'W2': [-23, 14, 3] },
      build: function () {
        var f = G.cyl(0, 0, 0, 12, 24, '#23262b', { sides: 18, top: '#2b2f35' });
        f = f.concat(G.cylX(16, 18, 0, 4, 16, '#2b2f35', { sides: 12 }));
        [['#d04a3a', -3], ['#26262a', 3]].forEach(function (w) {
          f = f.concat(G.box(-23, 13.4, w[1], 12, 1.3, 1.6, w[0]));
        });
        return f;
      }
    },

    battery18650: {
      name: '18650 cell holder', w: 78, d: 22, ex: 18,
      pins: { '+': [38, 9, 0], '-': [-38, 9, 0] },
      build: function () {
        var f = G.box(0, 0, 0, 78, 6, 22, '#1d2024');
        f = f.concat(G.cylX(0, 15, 0, 9.2, 65, '#2f6fa8', { sides: 16 }));
        return f;
      }
    },

    mosfet: {
      name: 'IRLZ44N MOSFET (TO-220)', w: 10.2, d: 4.5, ex: 16,
      pins: { G: [-2.54, 0, 0], D: [0, 0, 0], S: [2.54, 0, 0] },
      build: function () {
        var f = G.box(0, 5, 0, 10.2, 15, 4.5, '#1c1e22');
        f = f.concat(G.box(0, 15, 0, 10.2, 5, 1.4, C.metal));
        [-2.54, 0, 2.54].forEach(function (x) { f = f.concat(G.box(x, 0, 0, 0.8, 5, 0.6, C.pinTin)); });
        return f;
      }
    },

    esp01: mod({
      name: 'ESP-01S Wi-Fi module', w: 24.8, d: 14.3, color: C.pcbBlue,
      rows: [{ names: ['GND', 'GPIO2', 'GPIO0', 'RX'], z: -5, cx: -2.5 },
             { names: ['VCC', 'RST', 'CH_PD', 'TX'], z: 2.6, cx: -2.5 }],
      deco: [{ t: 'box', x: -5, z: -1, w: 12, h: 1.8, d: 10, c: C.metal },
             { t: 'pad', x: 8, z: 0, w: 8, d: 12, c: '#d8c98a' }]
    }),

    gps: mod({
      name: 'NEO-6M GPS module', w: 36, d: 26, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'RX', 'TX', 'GND'], z: -11 }],
      deco: [{ t: 'box', x: 2, z: 2, w: 16, h: 2.6, d: 12, c: C.metal },
             { t: 'box', x: -12, z: 4, w: 5, h: 5, d: 5, c: '#c8b050' }]
    }),

    vl53l0x: mod({
      name: 'VL53L0X laser rangefinder', w: 21, d: 13, color: C.pcbPurple,
      rows: [{ names: ['VIN', 'GND', 'SCL', 'SDA', 'GPIO', 'XSHUT'], z: -4.5 }],
      deco: [{ t: 'box', x: 2, z: 2.5, w: 4.4, h: 1, d: 2.4, c: '#1b1e22' }]
    }),

    micmax: mod({
      name: 'MAX9814 microphone', w: 18, d: 22, color: C.pcbBlack,
      rows: [{ names: ['GND', 'VDD', 'GAIN', 'AR', 'OUT'], z: -8.5 }],
      deco: [{ t: 'cyl', x: 0, z: 4, r: 4.8, h: 2.6, c: C.metal, sides: 14 }]
    }),

    ftdi: mod({
      name: 'USB-to-serial adapter', w: 36, d: 18, color: C.pcbRed,
      rows: [{ names: ['DTR', 'RX', 'TX', 'VCC', 'CTS', 'GND'], z: -6, cx: 4 }],
      deco: [{ t: 'box', x: -13, z: 0, w: 9, h: 4, d: 12, c: C.metal },
             { t: 'box', x: 2, z: 3, w: 7, h: 1.2, d: 5, c: C.chip }]
    }),

    /* Wemos D1 mini - 34.2 x 25.6 mm, two 8-pin rows */
    esp8266: (function () {
      var W = 34.2, D = 25.6, T = 1.2, HH = 8.5, rz = 11.3;
      var L = ['RST', 'A0', 'D0', 'D5', 'D6', 'D7', 'D8', '3V3'];
      var R = ['TX', 'RX', 'D1', 'D2', 'D3', 'D4', 'GND', '5V'];
      var pins = {};
      L.forEach(function (n, i) { pins[n] = [-W / 2 + 4 + i * P, T + HH, -rz]; });
      R.forEach(function (n, i) { pins[n] = [-W / 2 + 4 + i * P, T + HH, rz]; });
      return {
        name: 'Wemos D1 Mini (ESP8266)', w: W, d: D, ex: 22, pins: pins,
        build: function () {
          var f = G.box(0, 0, 0, W, T, D, C.pcbBlue, { top: C.pcbBlue });
          [-rz, rz].forEach(function (z) { f = f.concat(G.box(-W / 2 + 4 + 3.5 * P, T, z, 8 * P, HH - 0.6, 2.4, C.hdr)); });
          [L, R].forEach(function (row, ri) {
            row.forEach(function (n, i) {
              f = f.concat(G.box(-W / 2 + 4 + i * P, T + HH - 0.6, ri ? rz : -rz, 0.7, 0.9, 0.7, C.pinGold));
            });
          });
          f = f.concat(G.box(-W / 2 + 3.5, T, 0, 8, 3, 7.5, C.metal));
          f = f.concat(G.box(4, T, 0, 16, 2.6, 13, C.metal));
          return f;
        }
      };
    }()),

    tft18: mod({
      name: 'ST7735 TFT 1.8 inch', w: 34, d: 56, color: C.pcbRed,
      rows: [{ names: ['LED', 'SCK', 'SDA', 'DC', 'RESET', 'CS', 'GND', 'VCC'], z: -25 }],
      deco: [{ t: 'box', x: 0, z: 4, w: 32, h: 2.6, d: 40, c: '#15181d' },
             { t: 'pad', x: 0, z: 4, w: 28, d: 35, c: '#1d2733' }]
    }),

    tft28: mod({
      name: 'ILI9341 TFT 2.8 inch', w: 50, d: 86, color: C.pcbRed,
      rows: [{ names: ['VCC', 'GND', 'CS', 'RESET', 'DC', 'SDI', 'SCK', 'LED', 'SDO'], z: -40 }],
      deco: [{ t: 'box', x: 0, z: 6, w: 48, h: 3, d: 66, c: '#15181d' },
             { t: 'pad', x: 0, z: 6, w: 43, d: 57, c: '#1d2733' }]
    }),

    epaper: mod({
      name: '2.9 inch e-paper display', w: 37, d: 89, color: C.pcbBlack,
      rows: [{ names: ['BUSY', 'RST', 'DC', 'CS', 'CLK', 'DIN', 'GND', 'VCC'], z: -41 }],
      deco: [{ t: 'box', x: 0, z: 6, w: 36, h: 1.2, d: 66, c: '#e8e6e0' },
             { t: 'pad', x: 0, z: 6, w: 29, d: 60, c: '#f4f2ec' }]
    }),

    acs712: mod({
      name: 'ACS712 current sensor', w: 31, d: 22, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'OUT', 'GND'], z: -8, cx: -8 }],
      extraPins: [['IP+', 8, 12, 9], ['IP-', 17, 12, 9]],
      deco: [{ t: 'box', x: 12, z: 5, w: 14, h: 11, d: 11, c: '#1b8a4a' },
             { t: 'box', x: -6, z: 2, w: 6, h: 1.2, d: 5, c: C.chip }]
    }),

    linesensor: mod({
      name: '3-channel IR line sensor', w: 60, d: 22, color: C.pcbBlack,
      rows: [{ names: ['VCC', 'GND', 'L', 'C', 'R'], z: -8, cx: -12 }],
      deco: [-20, 0, 20].map(function (x) {
        return { t: 'box', x: x, z: 6, w: 8, h: 4, d: 5, c: '#1b1e22' };
      })
    }),

    pam8403: mod({
      name: 'PAM8403 stereo amplifier', w: 22, d: 19, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'GND', 'L-IN', 'R-IN'], z: -7, cx: -2 }],
      extraPins: [['L+', -7, 12, 8], ['L-', -1, 12, 8], ['R+', 5, 12, 8], ['R-', 10, 12, 8]],
      deco: [{ t: 'box', x: 0, z: 1, w: 6, h: 1.3, d: 5, c: C.chip }]
    }),

    speaker: {
      name: 'Speaker', w: 40, d: 40, ex: 22,
      pins: { '+': [-20, 6, -4], '-': [-20, 6, 4] },
      build: function (o) {
        var r = (o.r || 20);
        var f = G.cyl(0, 0, 0, r, 6, '#23262b', { sides: 22, top: '#2b2f35' });
        f = f.concat(G.cyl(0, 6, 0, r * 0.55, 1.5, '#15181c', { sides: 18 }));
        [['#d04a3a', -4], ['#26262a', 4]].forEach(function (w) {
          f = f.concat(G.box(-r, 5.4, w[1], 10, 1.2, 1.5, w[0]));
        });
        return f;
      }
    },

    stepper28: {
      name: '28BYJ-48 stepper motor', w: 42, d: 32, ex: 26,
      pins: { W: [-19, 16, 0] },
      build: function () {
        var f = G.cyl(0, 0, 0, 14, 19, C.silver, { sides: 20, top: '#c8ccd1' });
        f = f.concat(G.cyl(0, 19, 0, 3, 8, '#9aa0a6', { sides: 12 }));
        f = f.concat(G.box(-2, 0, 0, 36, 3, 8, '#b6babf'));
        f = f.concat(G.box(-17, 4, 0, 10, 8, 14, '#2e6ec4'));
        return f;
      }
    },

    uln2003: mod({
      name: 'ULN2003 stepper driver', w: 35, d: 32, color: C.pcbGreen,
      rows: [{ names: ['IN1', 'IN2', 'IN3', 'IN4', '-', '+'], z: -13, cx: -2 }],
      extraPins: [['MOTOR', 12, 12, 8]],
      deco: [{ t: 'box', x: -2, z: 2, w: 20, h: 3.6, d: 7, c: C.chip },
             { t: 'box', x: 12, z: 9, w: 12, h: 6, d: 8, c: '#f2f0ea' }]
    }),

    ttmotor: {
      name: 'TT gear motor + wheel', w: 70, d: 66, ex: 0,
      pins: { '+': [-30, 12, -4], '-': [-30, 12, 4] },
      build: function () {
        var f = G.box(-8, 0, 0, 42, 22, 22, '#e8b62c');
        f = f.concat(G.cylX(20, 11, 0, 4, 22, C.silver, { sides: 10 }));
        f = f.concat(G.cylX(30, 33, 0, 33, 7, '#23262b', { sides: 24 }));   // wheel
        [['#d04a3a', -4], ['#26262a', 4]].forEach(function (w) {
          f = f.concat(G.box(-30, 11.4, w[1], 10, 1.2, 1.5, w[0]));
        });
        return f;
      }
    },

    sct013: {
      name: 'SCT-013 clamp CT', w: 44, d: 30, ex: 20,
      pins: { TIP: [-22, 10, -2], SLEEVE: [-22, 10, 2] },
      build: function () {
        var f = G.box(0, 0, 0, 44, 20, 30, '#1f2226');
        f = f.concat(G.cyl(4, 20, 0, 9, 2, '#2b2f34', { sides: 16 }));
        [['#e0c030', -2], ['#26262a', 2]].forEach(function (w) {
          f = f.concat(G.box(-22, 9.4, w[1], 12, 1.2, 1.5, w[0]));
        });
        return f;
      }
    },

    pn532: mod({
      name: 'PN532 NFC reader', w: 43, d: 41, color: C.pcbBlue,
      rows: [{ names: ['VCC', 'GND', 'SDA', 'SCL', 'IRQ', 'RST'], z: -17, cx: -6 }],
      deco: [{ t: 'pad', x: 2, z: 3, w: 33, d: 26, c: '#2f6fa8' },
             { t: 'box', x: -14, z: 12, w: 8, h: 1.2, d: 8, c: C.chip }]
    }),

    /* --- AI boards ------------------------------------------------------

       Two of these carry the 40-pin header that started on the Raspberry Pi
       and has since become the de-facto standard for single-board Linux.
       Pins are numbered the way the silkscreen numbers them - odd down one
       row, even down the other, P1 nearest the board edge - and the handful
       of names people actually type are aliased on top. Existing keys are
       never overwritten, so a board that also has Arduino headers keeps its
       own 5V and GND.

       The UNO Q keeps the classic UNO headers and footprint, so the pin
       positions below are the same grid as AB.comp.uno - only the board
       colour, the USB-C jack, the Qualcomm SoC and the Qwiic connector
       differ. That compatibility is the whole point of the board. */
    unoq: (function () {
      var W = 68.6, D = 53.4, T = 1.6, HH = 8.6;
      var topZ = 50.8 - D / 2, botZ = 2.54 - D / 2;
      var pins = {};
      var digHi = ['SCL', 'SDA', 'AREF', 'GND3', 'D13', 'D12', 'D11', 'D10', 'D9', 'D8'];
      var digLo = ['D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0'];
      var pwr   = ['NC', 'IOREF', 'RESET', '3V3', '5V', 'GND1', 'GND2', 'VIN'];
      var ana   = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

      digHi.forEach(function (n, i) { pins[n] = [17.78 + i * P - W / 2, T + HH, topZ]; });
      digLo.forEach(function (n, i) { pins[n] = [44.70 + i * P - W / 2, T + HH, topZ]; });
      pwr.forEach(function (n, i) { pins[n] = [17.78 + i * P - W / 2, T + HH, botZ]; });
      ana.forEach(function (n, i) { pins[n] = [40.64 + i * P - W / 2, T + HH, botZ]; });
      pins.GND = pins.GND1;
      pins.QWIIC = [W / 2 - 6, T + 3, -D / 2 + 9];    // Qwiic I2C connector
      pins.USB = [-W / 2 + 3, T + 2, D / 2 - 16];     // the USB-C jack

      return {
        name: 'Arduino UNO Q', w: W, d: D, ex: 0, pins: pins,
        build: function () {
          var f = G.box(0, 0, 0, W, T, D, '#1b2733', { top: '#1b2733' });
          f = f.concat(G.box(17.78 + 4.5 * P - W / 2, T, topZ, 10 * P, HH - 0.7, 2.6, C.hdr));
          f = f.concat(G.box(44.70 + 3.5 * P - W / 2, T, topZ, 8 * P, HH - 0.7, 2.6, C.hdr));
          f = f.concat(G.box(17.78 + 3.5 * P - W / 2, T, botZ, 8 * P, HH - 0.7, 2.6, C.hdr));
          f = f.concat(G.box(40.64 + 2.5 * P - W / 2, T, botZ, 6 * P, HH - 0.7, 2.6, C.hdr));
          Object.keys(pins).forEach(function (k) {
            if (k === 'GND' || k === 'QWIIC' || k === 'CSI') return;
            var q = pins[k];
            f = f.concat(G.pad(q[0], T + HH - 0.65, q[2], 1.3, 1.3, '#0b0d10'));
          });
          // USB-C, the Dragonwing SoC under its shield, eMMC, Qwiic
          f = f.concat(G.box(-W / 2 + 3, T, D / 2 - 16, 9, 3.2, 8.5, C.metal));
          f = f.concat(G.box(2, T, -2, 20, 1.6, 18, C.metal));
          f = f.concat(G.pad(2, T + 1.7, -2, 17, 15, '#2b3138'));
          f = f.concat(G.box(-18, T, 8, 9, 1.1, 7, C.chip));
          f = f.concat(G.box(W / 2 - 6, T, -D / 2 + 9, 4.5, 3, 7, '#111'));
          return f;
        }
      };
    }()),

    /* 160 x 100 mm, so roughly two and a half UNOs. UNO headers on one
       side, a 40-pin Raspberry Pi header on the other. */
    ventunoq: (function () {
      var W = 160, D = 100, T = 1.6, HH = 8.6;
      var pins = {};
      var uno = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'];
      uno.forEach(function (n, i) { pins[n] = [-W / 2 + 20 + i * P, T + HH, -D / 2 + 8]; });
      ['VIN', '5V', '3V3', 'GND', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'].forEach(function (n, i) {
        pins[n] = [-W / 2 + 20 + i * P, T + HH, -D / 2 + 16];
      });
      pins.A4_SDA = pins.A4; pins.A5_SCL = pins.A5;
      hdr40(pins, -W / 2 + 26, T + HH, D / 2 - 10);
      pins.QWIIC = [W / 2 - 10, T + 3, 0];
      pins.CSI0 = [W / 2 - 22, T + 2, -D / 2 + 22];
      pins.ETH = [-W / 2 + 14, T + 7, D / 2 - 26];
      pins.USB = [-W / 2 + 14, T + 5, D / 2 - 48];   // the USB stack

      return {
        name: 'Arduino Ventuno Q', w: W, d: D, ex: 0, pins: pins,
        build: function () {
          var f = G.box(0, 0, 0, W, T, D, '#12202c', { top: '#12202c' });
          f = f.concat(G.box(-W / 2 + 20 + 6.5 * P, T, -D / 2 + 8, 14 * P, HH - 0.7, 2.6, C.hdr));
          f = f.concat(G.box(-W / 2 + 20 + 4.5 * P, T, -D / 2 + 16, 10 * P, HH - 0.7, 2.6, C.hdr));
          f = f.concat(G.box(-W / 2 + 26 + 9.5 * P, T, D / 2 - 10 + P / 2, 20 * P, HH - 0.7, 2 * P, C.hdr));
          // SoC under a heatsink, RAM, eMMC, M.2, Ethernet, USB stack, LED matrix
          f = f.concat(G.box(6, T, -6, 34, 10, 34, '#8f949a'));
          for (var k = 0; k < 7; k++) {
            f = f.concat(G.box(-9 + k * 5, T + 10, -6, 2.2, 5, 32, '#9aa0a6'));
          }
          f = f.concat(G.box(-34, T, -8, 14, 1.4, 12, C.chip));
          f = f.concat(G.box(44, T, 12, 22, 2, 42, '#2b3138'));
          f = f.concat(G.box(-W / 2 + 14, T, D / 2 - 26, 16, 13, 16, C.metal));
          f = f.concat(G.box(-W / 2 + 14, T, D / 2 - 48, 16, 8, 18, C.metal));
          f = f.concat(G.pad(W / 2 - 30, T + 0.2, D / 2 - 30, 26, 10, '#b4662b'));
          f = f.concat(G.box(W / 2 - 10, T, 0, 4.5, 3, 7, '#111'));
          return f;
        }
      };
    }()),

    /* Jetson Orin Nano Developer Kit: a 100 x 79 mm carrier with the module
       and its fan stacked on top, and a 40-pin header down one edge. */
    jetson: (function () {
      var W = 100, D = 79, T = 1.8;
      var pins = {};
      hdr40(pins, -W / 2 + 14, T + 8.6, -D / 2 + 7);
      pins.CSI0 = [W / 2 - 12, T + 2, -14];
      pins.CSI1 = [W / 2 - 12, T + 2, 8];
      pins.USB = [-W / 2 + 8, T + 8, 18];

      return {
        name: 'Jetson Orin Nano Dev Kit', w: W, d: D, ex: 0, pins: pins,
        build: function () {
          var f = G.box(0, 0, 0, W, T, D, '#1d4d2b', { top: '#1d4d2b' });
          f = f.concat(G.box(-W / 2 + 14 + 9.5 * P, T, -D / 2 + 7 + P / 2, 20 * P, 8, 2 * P, C.hdr));
          // the module, its heatsink and the fan on top
          f = f.concat(G.box(2, T, 4, 70, 4, 45, '#23262b'));
          f = f.concat(G.box(2, T + 4, 4, 68, 12, 43, '#9aa0a6'));
          for (var k = 0; k < 11; k++) {
            f = f.concat(G.box(-30 + k * 6, T + 16, 4, 2.4, 6, 41, '#a8aeb4'));
          }
          f = f.concat(G.box(2, T + 22, 4, 40, 9, 40, '#2b2f34'));
          f = f.concat(G.cyl(2, T + 31, 4, 18, 1.2, '#1a1c20', { sides: 20 }));
          for (var a = 0; a < 7; a++) {
            var ang = a / 7 * Math.PI * 2;
            f = f.concat(G.box(2 + Math.cos(ang) * 11, T + 31.5, 4 + Math.sin(ang) * 11, 10, 0.9, 5, '#3a3f45'));
          }
          // I/O along the edges
          f = f.concat(G.box(-W / 2 + 8, T, 18, 15, 8, 14, C.metal));
          f = f.concat(G.box(-W / 2 + 8, T, 34, 15, 13, 14, C.metal));
          f = f.concat(G.box(W / 2 - 12, T, -14, 4, 2.6, 18, '#23262b'));
          f = f.concat(G.box(W / 2 - 12, T, 8, 4, 2.6, 18, '#23262b'));
          return f;
        }
      };
    }()),

    /* A CSI camera on its ribbon - the lens block plus the little PCB. */
    csicam: {
      name: 'CSI camera module', w: 25, d: 24, ex: 22,
      pins: { RIBBON: [0, 1, 12] },
      build: function () {
        var f = G.box(0, 0, 0, 25, 1.2, 24, '#1b5e35', { top: '#1b5e35' });
        f = f.concat(G.box(0, 1.2, -1, 8.5, 5.5, 8.5, '#22262b'));
        f = f.concat(G.cyl(0, 6.7, -1, 3.6, 2.4, '#11161c', { sides: 16, top: C.glass }));
        f = f.concat(G.box(0, 1.2, 11, 20, 1.2, 2.4, '#d8d2c4'));   // ribbon stub
        return f;
      }
    },

    /* A USB webcam: barrel body on a folding clip, with its lead. A CSI
       camera looks nothing like this, so the two are separate shapes
       rather than one standing in for the other. */
    webcam: {
      name: 'USB webcam', w: 58, d: 32, ex: 24,
      pins: { USB: [0, 14, 14] },
      build: function () {
        var f = G.box(0, 0, 2, 52, 5, 16, '#23262b');            // the folding clip foot
        f = f.concat(G.box(0, 5, 0, 44, 3, 10, '#2b2f34'));      // hinge block
        // Body: a barrel lying along X. G.cyl is always vertical, so a
        // horizontal one needs cylX - there is no arbitrary axis.
        f = f.concat(G.cylX(0, 15, -2, 9.5, 46, '#1c1f24', { sides: 18 }));
        // Lens pointing up, the same convention the other cameras in
        // this library use - these scenes are drawn looking down.
        f = f.concat(G.cyl(0, 22, -2, 6.5, 3.5, '#15181d', { sides: 18 }));
        f = f.concat(G.cyl(0, 25, -2, 4.2, 1.2, '#0b0e12', { sides: 16, top: C.glass }));
        f = f.concat(G.box(-15, 23, -2, 3, 1.6, 2.5, '#3a3f45'));    // status LED
        f = f.concat(G.box(0, 1, 12, 7, 2, 8, '#d8d2c4'));           // cable stub
        return f;
      }
    },

    /* Nano 33 BLE Sense Rev2 - the classic 45 x 18 mm Nano footprint, so it
       drops into the same breadboard rows, but 3.3 V only and with the
       sensor cluster (IMU, mic, pressure, humidity, proximity) on top. */
    nano33: (function () {
      var W = 45, D = 18, T = 1.6, HH = 8.5, rz = 7.62;
      var A = ['D13', '3V3', 'AREF', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'VUSB', 'RST2', 'GND', 'VIN'];
      var B = ['D12', 'D11', 'D10', 'D9', 'D8', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'GND2', 'RST', 'RX0', 'TX1'];
      var pins = {};
      A.forEach(function (n, i) { pins[n] = [-W / 2 + 3.3 + i * P, T + HH, -rz]; });
      B.forEach(function (n, i) { pins[n] = [-W / 2 + 3.3 + i * P, T + HH, rz]; });
      pins.A4_SDA = pins.A4; pins.A5_SCL = pins.A5;

      return {
        name: 'Arduino Nano 33 BLE Sense Rev2', w: W, d: D, ex: 22, pins: pins,
        build: function () {
          var f = G.box(0, 0, 0, W, T, D, C.pcbBlack, { top: C.pcbBlack });
          [-rz, rz].forEach(function (z) {
            f = f.concat(G.box(-W / 2 + 3.3 + 7 * P, T, z, 15 * P, HH - 0.6, 2.4, C.hdr));
          });
          [A, B].forEach(function (row, ri) {
            row.forEach(function (n, i) {
              f = f.concat(G.box(-W / 2 + 3.3 + i * P, T + HH - 0.6, ri ? rz : -rz, 0.7, 0.9, 0.7, C.pinGold));
            });
          });
          f = f.concat(G.box(-W / 2 + 4, T, 0, 8.5, 3.2, 7.5, C.metal));    // micro-USB
          f = f.concat(G.box(3, T, 0, 16, 2.4, 10, C.metal));               // the NINA module
          f = f.concat(G.pad(3, T + 2.6, 0, 14, 5, '#3c4148'));             // antenna keep-out
          // the sensor cluster: IMU, mic, and the gesture/proximity window
          f = f.concat(G.box(15, T, -3.5, 3, 1, 3, C.chip));
          f = f.concat(G.box(15, T, 1, 2.6, 0.9, 2.6, '#4a4f56'));
          f = f.concat(G.box(19, T, -2, 2.4, 0.8, 2.4, '#1c1f24'));
          return f;
        }
      };
    }()),

    scd40: mod({
      name: 'SCD40 CO2 sensor', w: 25, d: 22, color: C.pcbBlack,
      rows: [{ names: ['VIN', 'GND', 'SCL', 'SDA'], z: -8 }],
      deco: [{ t: 'box', x: 0, z: 3, w: 10.5, h: 6.5, d: 10.5, c: '#3a4148' },
             { t: 'pad', x: 0, z: 3, w: 7, d: 7, c: '#22262b' }]
    }),

    /* A 10 W wirewound - deliberately drawn fat, because it gets hot and
       wants to be somewhere by itself. */
    powerres: {
      name: '10 ohm 10 W resistor', w: 50, d: 10, ex: 16,
      pins: { A: [-24, 0, 0], B: [24, 0, 0] },
      build: function () {
        var f = G.box(0, 5, 0, 40, 9, 9, '#e8e4da');
        f = f.concat(G.box(-24, 0, 0, 0.8, 6, 0.8, C.pinTin));
        f = f.concat(G.box(24, 0, 0, 0.8, 6, 0.8, C.pinTin));
        f = f.concat(G.cylX(-21, 5, 0, 0.4, 6, C.pinTin, { sides: 6 }));
        f = f.concat(G.cylX(21, 5, 0, 0.4, 6, C.pinTin, { sides: 6 }));
        return f;
      }
    },

    fan: {
      name: '40 mm fan', w: 40, d: 40, ex: 22,
      pins: { '+': [-20, 6, -4], '-': [-20, 6, 4] },
      build: function () {
        var f = G.box(0, 0, 0, 40, 10, 40, '#23262b');
        f = f.concat(G.cyl(0, 10, 0, 17, 0.6, '#1a1c20', { sides: 20 }));
        f = f.concat(G.cyl(0, 10, 0, 6, 1.6, '#2e3238', { sides: 14 }));
        for (var i = 0; i < 7; i++) {
          var a = i / 7 * Math.PI * 2;
          f = f.concat(G.box(Math.cos(a) * 11, 10.4, Math.sin(a) * 11, 9, 0.8, 5, '#3a3f45'));
        }
        [['#d04a3a', -4], ['#26262a', 4]].forEach(function (w) {
          f = f.concat(G.box(-20, 5.4, w[1], 10, 1.2, 1.5, w[0]));
        });
        return f;
      }
    },

    /* 5 mm RGB LED, common cathode: R / G / B anodes plus one cathode. */
    rgbled: {
      name: '5 mm RGB LED', w: 6, d: 6, ex: 18,
      pins: { R: [-3.81, 0, 0], K: [-1.27, 0, 0], G: [1.27, 0, 0], B: [3.81, 0, 0] },
      build: function () {
        var f = G.cyl(0, 7, 0, 2.5, 4.5, '#e6e9ec', { sides: 14 });
        f = f.concat(G.cyl(0, 11.5, 0, 2.0, 1.6, '#e6e9ec', { sides: 14 }));
        [-3.81, -1.27, 1.27, 3.81].forEach(function (x, i) {
          f = f.concat(G.box(x, 0, 0, 0.55, i === 1 ? 7.4 : 6.6, 0.55, C.pinTin));
        });
        return f;
      }
    },

    /* A grid of WS2812Bs - the word clock face, and any matrix build.
       opt: { cols, rows, pitch } */
    ws2812grid: {
      name: 'WS2812B grid', w: 180, d: 180, ex: 20,
      pins: { '5V': [-88, 2.4, 88], DIN: [-82, 2.4, 88], GND: [-76, 2.4, 88] },
      build: function (o) {
        var cols = o.cols || 11, rows = o.rows || 11, p = o.pitch || 16.6;
        var w = cols * p, d = rows * p;
        var f = G.box(0, 0, 0, w, 1.6, d, C.pcbBlack, { top: C.pcbBlack });
        for (var r = 0; r < rows; r++) {
          for (var c = 0; c < cols; c++) {
            f = f.concat(G.box(-w / 2 + p / 2 + c * p, 1.6,
                               -d / 2 + p / 2 + r * p, 5, 1.6, 5, '#f6f4ee', { lod: 1 }));
          }
        }
        return f;
      }
    },

    reed: {
      name: 'Reed switch + magnet', w: 44, d: 16, ex: 18,
      pins: { A: [-20, 5, 0], B: [20, 5, 0] },
      build: function () {
        var f = G.cylX(0, 5, 0, 2.2, 15, '#cfe4e8', { sides: 12 });
        f = f.concat(G.cylX(-4, 5, 0, 0.9, 6, C.metal, { sides: 8 }));
        f = f.concat(G.cylX(4, 5, 0, 0.9, 6, C.metal, { sides: 8 }));
        f = f.concat(G.cylX(-13.5, 5, 0, 0.35, 12, C.pinTin, { sides: 6 }));
        f = f.concat(G.cylX(13.5, 5, 0, 0.35, 12, C.pinTin, { sides: 6 }));
        f = f.concat(G.box(0, 0, 11, 22, 8, 7, '#8d9096'));      // the magnet
        return f;
      }
    },

    hcsr501: null   // alias placeholder, see pir
  };

  Object.keys(M).forEach(function (k) { if (M[k]) AB.comp[k] = M[k]; });
  AB.comp.hcsr501 = AB.comp.pir;
  AB.comp.led = AB.comp.led5;
  AB.comp.res = AB.comp.resistor;

  /* A generic labelled block for things that have no interesting shape
     (a lamp, a door, a plant pot) so scenes can show context. */
  AB.comp.block = {
    name: 'Block', w: 40, d: 40, ex: 0,
    /* n = near edge, f = far edge, l/r = sides. Enough to hang a wire off. */
    pins: { n: [0, 8, -14], f: [0, 8, 14], l: [-14, 8, 0], r: [14, 8, 0], t: [0, 18, 0] },
    build: function (o) {
      return G.box(0, 0, 0, o.w || 40, o.h || 20, o.d || 40, o.c || '#9aa0a6');
    }
  };
}());
