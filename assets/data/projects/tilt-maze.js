/* A ball, a maze, and the discovery that games need physics rather than positions. */
AB.addProject({
slug: 'tilt-maze',
title: 'Tilt maze in your hands',
cat: 'games',
level: 2,
time: '3 hours',
solder: false,
board: 'Nano',
tags: ['game', 'mpu6050', 'physics', 'collision', 'oled', 'accelerometer', 'integration', 'no soldering'],
blurb: 'Tilt the box and a ball rolls through a maze on the screen. Simple to build, and the moment it goes from "moves when tilted" to "feels like a real ball" is one line of physics.',

skills: ['Reading an accelerometer', 'Velocity from acceleration', 'Collision detection', 'Damping and restitution', 'Frame timing', 'Making something feel right'],

intro: `
<p>A wooden tilt maze is a board with walls and a steel ball, and it has been sold in toy shops for a century.
This is that, on a small screen, with the tilt sensed by an accelerometer.</p>
<p>It is an easy build - four wires and no soldering. What makes it worth doing is that the naive version is
unsatisfying in a way that is immediately obvious, and fixing it teaches the single most useful idea in game
physics: <strong>tilt should control acceleration, not position</strong>.</p>
<p>That one change turns a cursor that follows your hand into a ball with weight.</p>`,

what: [
  'Roll a ball around a maze by tilting the whole thing.',
  'Bounce off walls in a way that feels right rather than merely correct.',
  'Time each maze, so it becomes competitive within about ninety seconds of being finished.',
  'Handle several mazes, stored compactly enough to fit in a Nano.',
  'Feel like a physical object, which is entirely down to three constants you will spend an hour tuning.'
],

how: `
<p><strong>Acceleration, not position.</strong> The obvious approach maps tilt angle directly to ball position:
tilt 10 degrees right, ball moves right. It works, and it feels like dragging a cursor - the ball stops dead
when you level off and has no momentum at all.</p>
<p>A real ball on a tilted surface <em>accelerates</em> down the slope. So tilt should set acceleration, which
changes velocity, which changes position:</p>
<pre><code>vx += ax * dt;
x  += vx * dt;</code></pre>
<p>Now the ball builds speed on a long slope, keeps rolling when you level off, and has to be actively slowed.
That is the whole difference, and it is two lines.</p>

<p><strong>Damping, or it never stops.</strong> With no friction the ball accelerates forever and ricochets
endlessly. Multiply velocity by about 0.98 each frame and it behaves like a ball on wood. Lower values feel
like rolling through treacle; higher feel like ice.</p>
<p>This constant, the acceleration scale, and the wall bounce factor are the three numbers that decide whether
the game feels good, and no amount of correct code substitutes for sitting and tuning them.</p>

<p><strong>Collision: check the axes separately.</strong> The temptation is to move the ball and then check
whether it is inside a wall. That works until it is moving fast, when it can pass straight through a thin wall
between frames.</p>
<p>The robust approach for a grid maze is to test each axis independently: try moving in x, and if that lands
in a wall, undo it and reverse <code>vx</code>. Then the same for y. This also gives correct behaviour sliding
along a wall - you keep your speed parallel to it and lose only the perpendicular component, which is exactly
what a real ball does.</p>

<p><strong>Restitution below 1.</strong> Reverse the velocity exactly and the ball bounces forever between two
walls. Multiply by about 0.5 on impact and it settles, which is what a steel ball in a wooden maze does.</p>

<p><strong>Frame timing matters more than frame rate.</strong> If <code>dt</code> is assumed constant but the
loop actually varies - because drawing a fuller screen takes longer - the physics speeds up and slows down
subtly. Measure the real elapsed time each frame and use it. Cap it too, or a single slow frame teleports the
ball across the maze.</p>

<p><strong>Store the maze as bits.</strong> A 16x8 grid as one byte per column is 16 bytes. As a byte per cell
it is 128. On a Nano with 2&nbsp;KB of RAM that difference is the difference between four mazes and
thirty.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'Plenty fast enough. This is a good project for a board you already have.' },
  { id: 'mpu6050', qty: 1, note: 'Accelerometer and gyro. Only the accelerometer is needed here - tilt relative to gravity.' },
  { id: 'oled13', qty: 1, note: '128x64 SSD1306. The resolution sets the maze size, and 128x64 is a good fit for 16x8 cells.' },
  { id: 'bb-400', qty: 1 },
  { id: 'button', qty: 2, note: 'Next maze and restart.' },
  { id: 'buzzer', qty: 1, note: 'A click on wall hits and a tune on completion. Small thing, large difference.' },
  { id: 'batt-aa2', qty: 1, note: 'It has to be held and tilted, so a cable is the enemy.' },
  { id: 'box-abs', qty: 1, note: 'Something rigid you can hold. The feel of the enclosure is part of the game.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [],

build: {
  parts: [
    { id: 'mcu',  comp: 'nano',    at: [0, 56] },
    { id: 'bb',   comp: 'bb400',   at: [0, -6] },
    { id: 'imu',  comp: 'mpu6050', at: [-50, -58] },
    { id: 'oled', comp: 'oled13',  at: [6, -58] },
    { id: 'b1',   comp: 'button',  at: [58, -30] },
    { id: 'buz',  comp: 'buzzer',  at: [58, -66] }
  ],
  wires: [
    { from: 'mcu.5V',   to: 'bb.T+1',  color: 'red',    note: '5 V rail - both modules have their own regulators' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'imu.VCC',  to: 'bb.T+5',  color: 'red',    note: 'IMU power' },
    { from: 'imu.GND',  to: 'bb.T-5',  color: 'black',  note: 'IMU ground' },
    { from: 'imu.SDA',  to: 'mcu.A4',  color: 'green',  note: 'I2C data - A4 on a Nano' },
    { from: 'imu.SCL',  to: 'mcu.A5',  color: 'blue',   note: 'I2C clock - A5 on a Nano' },
    { from: 'oled.VCC', to: 'bb.T+11', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-11', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.A4',  color: 'green',  note: 'Same I2C bus, different address' },
    { from: 'oled.SCL', to: 'mcu.A5',  color: 'blue',   note: 'Same clock' },
    { from: 'b1.1A',    to: 'mcu.D2',  color: 'yellow', note: 'Next maze, internal pull-up' },
    { from: 'b1.2A',    to: 'bb.T-16', color: 'black',  note: 'Button to ground' },
    { from: 'buz.+',    to: 'mcu.D9',  color: 'purple', note: 'Buzzer' },
    { from: 'buz.-',    to: 'bb.T-20', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireIntro: `<p>Two I2C devices, a button and a buzzer. No soldering, and the whole thing plugs together in
fifteen minutes.</p>`,

wireNotes: `
<div class="note tip"><span class="t">Mount the IMU square to the screen</span>
<p>The accelerometer's axes have to line up with the display's, or tilting right moves the ball diagonally. If
the module ends up rotated, it is easier to swap and negate the axes in software than to remount it - but
decide which and write it down, because getting it wrong is confusing rather than obviously broken.</p></div>

<div class="note"><span class="t">Both on one bus</span>
<p>MPU6050 at 0x68, SSD1306 at 0x3C. No conflict. If the IMU is missing, AD0 is tied high and it has moved to
0x69.</p></div>

<div class="note warn"><span class="t">Passive buzzer</span>
<p><code>tone()</code> needs a passive buzzer. An active one has its own oscillator, plays one fixed note and
ignores the frequency, which makes the wall-hit click and the victory tune identical.</p></div>`,

assembly: [
  { h: 'Get the display working first',
    body: `<p>Run the library example. Everything else assumes it works, and a blank screen while also
    debugging physics is twice the problem.</p>` },
  { h: 'Print the raw accelerometer values and tilt the board',
    body: `<p>Confirm which axis is which and which direction is positive. Two minutes now saves a confusing
    half hour when the ball goes the wrong way.</p>` },
  { h: 'Draw a ball that just follows tilt, first',
    body: `<p>Position mapped directly from angle, no physics. It will work, and it will feel like nothing.
    Keeping this version around for comparison is genuinely instructive.</p>` },
  { h: 'Then add velocity, and feel the difference',
    body: `<p>Two lines. The change is dramatic and immediate, and it is the whole point of the project.</p>` },
  { h: 'Tune the three constants for an hour',
    body: `<p>Acceleration scale, damping, bounce. There are no correct values, only ones that feel right in
    your hands, and this is time well spent rather than time wasted.</p>` },
  { h: 'Box it so it is nice to hold',
    body: `<p>Rigid, with the screen flush and the battery inside. A game you hold is judged partly on how it
    feels to hold, and a breadboard with wires hanging off it is not the same object.</p>` }
],

libraries: [
  { name: 'Adafruit MPU6050', by: 'Adafruit', why: 'Accelerometer. Also pulls in the Unified Sensor library.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The display, with a full frame buffer so drawing is flicker-free.' }
],

code: [{
  name: 'tilt_maze.ino',
  code: `/* ------------------------------------------------------------------
   Tilt maze - Nano + MPU6050 + SSD1306

   Tilt sets ACCELERATION, not position. That is the whole project.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_SSD1306.h>

#define NEXT_BTN 2
#define BUZZER   9

#define COLS 16
#define ROWS  8
#define CELL  8                 // pixels - 16x8 cells fills 128x64

Adafruit_MPU6050 mpu;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

/* One byte per column, one bit per row. Sixteen bytes a maze instead of
   128 - on a Nano with 2 KB that is the difference between four mazes
   and thirty. */
const uint8_t MAZES[][COLS] PROGMEM = {
  {0xFF,0x81,0xBD,0xA1,0xAF,0xA9,0xE9,0x0B,
   0xFB,0x83,0xBF,0xA0,0xAE,0xAA,0x82,0xFF},
  {0xFF,0x01,0x7D,0x45,0x55,0x55,0x5D,0x41,
   0x7F,0x03,0x7B,0x4B,0x5B,0x43,0x7F,0xFF}
};
const int N_MAZES = sizeof(MAZES) / sizeof(MAZES[0]);
int maze = 0;

// Ball state, in pixels and pixels per second.
float x, y, vx, vy;
unsigned long startMs, lastFrame;
bool won = false;

/* The three numbers that decide whether this feels good. There are no
   correct values - sit and tune them. */
const float ACCEL_SCALE = 90.0f;   // how hard gravity pulls
const float DAMPING     = 0.98f;   // friction per frame; 1.0 never stops
const float BOUNCE      = 0.5f;    // wall restitution; 1.0 bounces forever

void setup() {
  Serial.begin(115200);
  pinMode(NEXT_BTN, INPUT_PULLUP);

  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  if (!mpu.begin()) {
    oled.clearDisplay();
    oled.setCursor(0, 24);
    oled.println(F("No MPU6050"));
    oled.display();
    while (1) delay(100);
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  resetBall();
  lastFrame = millis();
}

void loop() {
  if (digitalRead(NEXT_BTN) == LOW) {
    maze = (maze + 1) % N_MAZES;
    resetBall();
    delay(250);
  }

  /* Measure the real elapsed time. Assuming a fixed dt makes the physics
     speed up and slow down as the drawing load changes, and capping it
     stops one slow frame teleporting the ball across the maze. */
  unsigned long now = millis();
  float dt = (now - lastFrame) / 1000.0f;
  lastFrame = now;
  if (dt > 0.05f) dt = 0.05f;

  if (!won) { physics(dt); checkWin(); }
  draw();
}

void resetBall() {
  x = CELL * 1.5f; y = CELL * 1.5f;
  vx = vy = 0;
  won = false;
  startMs = millis();
}

void physics(float dt) {
  sensors_event_t a, g, t;
  mpu.getEvent(&a, &g, &t);

  // Tilt sets ACCELERATION. Mapping it to position instead gives you a
  // cursor that follows your hand and stops dead - no weight at all.
  float ax =  a.acceleration.x * ACCEL_SCALE;
  float ay = -a.acceleration.y * ACCEL_SCALE;

  vx += ax * dt;
  vy += ay * dt;

  vx *= DAMPING;                  // without this it never stops
  vy *= DAMPING;

  /* Axis at a time. Moving then testing lets a fast ball pass through a
     thin wall between frames; separating the axes also gives correct
     sliding along a wall - you keep the parallel component and lose only
     the perpendicular one, which is what a real ball does. */
  float nx = x + vx * dt;
  if (blocked(nx, y)) { vx = -vx * BOUNCE; click(); } else { x = nx; }

  float ny = y + vy * dt;
  if (blocked(x, ny)) { vy = -vy * BOUNCE; click(); } else { y = ny; }

  x = constrain(x, 2, 126);
  y = constrain(y, 2, 62);
}

bool blocked(float px, float py) {
  // Test the ball's edges, not just its centre, or it sinks into walls.
  const float R = 2.0f;
  for (int dx = -1; dx <= 1; dx += 2) {
    for (int dy = -1; dy <= 1; dy += 2) {
      int c = (int)((px + dx * R) / CELL);
      int r = (int)((py + dy * R) / CELL);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
      if (wallAt(c, r)) return true;
    }
  }
  return false;
}

bool wallAt(int col, int row) {
  uint8_t bits = pgm_read_byte(&MAZES[maze][col]);
  return bits & (1 << row);
}

void checkWin() {
  // Bottom-right cell is the goal.
  if (x > (COLS - 2) * CELL && y > (ROWS - 2) * CELL) {
    won = true;
    for (int i = 0; i < 3; i++) { tone(BUZZER, 880 + i * 220, 120); delay(150); }
  }
}

void click() {
  // Only click on a real impact - otherwise it chatters while resting
  // against a wall.
  if (fabs(vx) + fabs(vy) > 20) tone(BUZZER, 1400, 8);
}

void draw() {
  oled.clearDisplay();

  for (int c = 0; c < COLS; c++)
    for (int r = 0; r < ROWS; r++)
      if (wallAt(c, r)) oled.fillRect(c * CELL, r * CELL, CELL, CELL, SSD1306_WHITE);

  oled.fillCircle((int)x, (int)y, 2, SSD1306_WHITE);

  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE, SSD1306_BLACK);
  oled.setCursor(92, 0);
  oled.print((millis() - startMs) / 1000.0f, 1);

  if (won) {
    oled.setCursor(36, 28);
    oled.print(F("DONE!"));
  }
  oled.display();
}`
}],

trouble: [
  { q: 'The ball follows my hand but has no weight',
    a: `You are setting position from tilt rather than acceleration. That is the one change this whole project
    exists to demonstrate.` },
  { q: 'The ball never stops moving',
    a: `Damping is 1.0 or missing. 0.98 per frame behaves like wood; 0.999 like ice.` },
  { q: 'It bounces between two walls forever',
    a: `Restitution is 1.0. Multiply by about 0.5 on impact and it settles.` },
  { q: 'The ball passes through walls when moving fast',
    a: `Testing after moving both axes at once. Move and test one axis at a time, and test the ball's edges
    rather than only its centre.` },
  { q: 'Tilting right moves it diagonally',
    a: `The IMU is not square to the display. Swap or negate the axes in <code>physics()</code>.` },
  { q: 'The game speeds up when the maze is simpler',
    a: `Fixed <code>dt</code>. Measure the real frame time - simpler mazes draw faster, so the loop runs more
    often and the physics runs faster with it.` },
  { q: 'Constant buzzing when resting against a wall',
    a: `The click fires on every frame the collision test is true. Gate it on impact speed, as the sketch
    does.` },
  { q: 'It jitters when held still',
    a: `Accelerometer noise integrating into velocity. Lower the filter bandwidth, or apply a small deadband so
    tiny accelerations are ignored.` }
],

next: `
<ul>
  <li><strong>Holes to fall into</strong>, which is what the wooden version actually has. One more bit per cell
  and a restart on contact.</li>
  <li><strong>Draw your own mazes</strong> - the bit-per-cell format means a maze is sixteen numbers, and
  sketching one on squared paper takes five minutes.</li>
  <li><strong>Best times in EEPROM</strong>, so they survive a power cut and the competition becomes
  permanent.</li>
  <li><strong>Use the gyro too</strong>, which the MPU6050 already has. Fusing it with the accelerometer gives
  a much steadier angle - the same complementary filter as the
  <a href="project.html?p=quadcopter-flight-controller">flight controller</a>.</li>
  <li><strong>Two players over <a href="project.html?p=nrf24-sensor-link">nRF24</a></strong>, racing the same
  maze side by side.</li>
</ul>`
});
