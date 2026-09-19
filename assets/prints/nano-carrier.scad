// Nano header carrier - The Build Book
// https://tobno683.github.io/arduino-build-book/basics/printing.html#prints
//
// Printed plate-down. Turned over, the corner posts are its feet.
// Press a female header strip into each slot, flush with the underside.
//
// Millimetres. Change the numbers at the top and render (F6); everything
// below follows from them. Written by tools/make-prints.js from the same
// numbers as the STL next to it.

/* [Board] */
pins = 15;        // per row
pitch = 2.54;
rows = 15.24;     // centre to centre across the two pin rows - MEASURE YOURS

/* [Carrier] */
slot_w = 2.7;      // a female header is about 2.5 mm wide, and printed slots come out narrow
slot_extra = 0.4;  // added to the slot length
plate = [58, 30];
plate_t = 3;
corner_r = 4;
foot_d = 7;
foot_h = 8;       // room under the carrier for the header pins and wiring
foot_hole = 3.4;  // M3 clearance - use your fit-test result
foot_inset = 5;

/* [Hidden] */
$fn = 48;

slot_len = pins * pitch + slot_extra;

module rounded_rect(size, r) {
  translate([r, r]) offset(r = r) square([size[0] - 2 * r, size[1] - 2 * r]);
}

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
