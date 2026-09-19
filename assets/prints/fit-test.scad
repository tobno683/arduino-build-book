// M3 fit test - The Build Book
// https://tobno683.github.io/arduino-build-book/basics/printing.html#prints
//
// Top row: M3 clearance holes. Bottom row: holes for M3 heat-set inserts.
// The raised number next to each is its modelled diameter.
//
// Millimetres. Change the numbers at the top and render (F6); everything
// below follows from them. Written by tools/make-prints.js from the same
// numbers as the STL next to it.

/* [Plate] */
plate = [84, 40];
plate_t = 2.4;
corner_r = 3;

/* [Clearance holes] */
clear = [3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6];
clear_x0 = 9;
clear_pitch = 11;
clear_y = 6;

/* [Insert holes] */
insert = [3.8, 4, 4.2, 4.4];
insert_x0 = 15;
insert_pitch = 18;
insert_y = 25;
boss_d = 8;
boss_h = 6;       // above the plate, and the depth of the insert holes

label_h = 0.6;    // height of the raised numbers

/* [Hidden] */
$fn = 48;

// Seven-segment numbers: they print the same everywhere and need no font.
dw = 3.4; dh = 6; st = 0.8; gp = 0.25;
vh = dh / 2 - 1.5 * st - 2 * gp;
segs = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];

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

module rounded_rect(size, r) {
  translate([r, r]) offset(r = r) square([size[0] - 2 * r, size[1] - 2 * r]);
}

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
