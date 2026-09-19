// Uno mounting plate - The Build Book
// https://tobno683.github.io/arduino-build-book/basics/printing.html#prints
//
// Hole centres are measured from the corner of the board nearest the origin.
//
// Millimetres. Change the numbers at the top and render (F6); everything
// below follows from them. Written by tools/make-prints.js from the same
// numbers as the STL next to it.

/* [Board] */
board = [68.58, 53.34];   // outline of the board itself
holes = [[13.97, 2.54], [15.24, 50.8], [66.04, 7.62], [66.04, 35.56]];   // hole centres, from the board's corner

/* [Plate] */
margin = 8;        // how far the plate reaches past the board on every side
plate_t = 3;
corner_r = 5;
mount_hole = 3.4;    // corner holes, M3 clearance - use your fit-test result
mount_inset = 5;    // corner hole centres, in from the plate edges

/* [Standoffs] */
standoff_d = 6;
standoff_h = 6;      // above the plate
standoff_hole = 2.5;  // M3 screws cutting their own thread. For heat-set inserts: your fit-test size, and standoff_d = 8

/* [Hidden] */
$fn = 48;

plate = [board[0] + 2 * margin, board[1] + 2 * margin];

module rounded_rect(size, r) {
  translate([r, r]) offset(r = r) square([size[0] - 2 * r, size[1] - 2 * r]);
}

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
