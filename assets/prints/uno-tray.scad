// Uno bumper tray - The Build Book
// https://tobno683.github.io/arduino-build-book/basics/printing.html#prints
//
// Open at the board's x = 0 end, where the USB and power jacks overhang.
// Hole centres are measured from that corner of the board.
//
// Millimetres. Change the numbers at the top and render (F6); everything
// below follows from them. Written by tools/make-prints.js from the same
// numbers as the STL next to it.

/* [Board] */
board = [68.58, 53.34];
holes = [[13.97, 2.54], [15.24, 50.8], [66.04, 7.62], [66.04, 35.56]];

/* [Tray] */
clearance = 1;   // gap between the board edge and the wall
wall = 2;
ledge = 1;       // the floor reaches this far past the wall
corner_r = 3;
floor_t = 2;
wall_h = 10;     // above the floor - keep it below the header tops so jumper wires still plug in

/* [Standoffs] */
standoff_d = 5.6;
standoff_h = 5;   // above the floor
standoff_hole = 2.5;   // M3 screws cutting their own thread

/* [Hidden] */
$fn = 48;

c0 = ledge + wall + clearance;   // where the board's corner sits
outer = [board[0] + 2 * c0, board[1] + 2 * c0];

module rounded_rect(size, r) {
  translate([r, r]) offset(r = r) square([size[0] - 2 * r, size[1] - 2 * r]);
}

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
