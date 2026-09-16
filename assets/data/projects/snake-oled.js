/* Snake on a 128x64 OLED: a game loop, and why the naive version gets slower as you score. */
AB.addProject({
slug: 'snake-oled',
title: 'Snake on an OLED',
cat: 'games',
level: 1,
time: '2 hours',
solder: false,
board: 'Nano',
tags: ['snake', 'game loop', 'oled', 'ring buffer', 'joystick', 'eeprom', 'no soldering'],
blurb: 'The game everyone had on a Nokia, on eight dollars of parts. A perfect first game because the whole thing is one clean idea - and one subtle mistake that everybody makes first.',

skills: ['Game loops', 'Ring buffers', 'Collision detection', 'Input debouncing', 'EEPROM high scores'],

intro: `
<p>Snake is the right first game to write. There is no physics, no animation, no sprites - just a list of
coordinates that gets one longer each time you eat something, and a fixed tick that moves it.</p>
<p>It also contains one genuinely instructive trap. The obvious implementation stores the snake as an array
and shifts every segment along on each move, which is fine at length 5 and noticeably slow at length 80 - the
game gets sluggish precisely as you get good at it. The fix is a ring buffer, and once you have seen why, you
will reach for one for the rest of your life.</p>`,

what: [
  'Play Snake with a joystick, at a speed that increases as you score.',
  'Store the snake in a ring buffer, so a long snake moves exactly as fast as a short one.',
  'Detect collisions with the walls and with itself.',
  'Keep a high score through a power cut, in EEPROM.',
  'Show score, high score and a game-over screen.',
  'Wrap round the edges or not, as a mode you can toggle.'
],

how: `
<p><strong>The game loop.</strong> A fixed tick: read the input, move, check for collisions, draw. The tick
interval is the difficulty - 200&nbsp;ms is gentle, 80&nbsp;ms is hard.</p>
<p>Note that input is read <em>every</em> pass, not once per tick. A joystick sampled only at the tick misses
a quick flick, and the game feels unresponsive in a way that is hard to diagnose because the tick rate looks
fine.</p>

<p><strong>The ring buffer, which is the point of the project.</strong> The naive snake is an array where
segment 0 is the head:</p>
<p><code>for (i = length; i &gt; 0; i--) body[i] = body[i-1];</code> then set the new head.</p>
<p>That copies the whole snake every tick. At length 10 it is nothing; at length 100 it is a hundred copies
sixty times a second, on a chip doing 16 million instructions per second. The game visibly slows down as you
win.</p>
<p>The ring buffer never moves anything. Keep an index for the head and one for the tail. To move: write the
new head position at <code>head</code>, advance <code>head</code>; if the snake did not grow, advance
<code>tail</code> as well. Both wrap round modulo the array size.</p>
<p><strong>Constant time regardless of length.</strong> One write and two increments per move, whether the
snake is 3 long or 300.</p>

<p><strong>Collision detection, done the same way.</strong> Walking the whole body to check for a self-hit is
O(n) and that is genuinely unavoidable - but at 200 segments on an Uno it is still only 200 comparisons,
which is nothing. The cost that mattered was the copying, not the checking.</p>
<p>The food placement has a subtle version of the same problem: picking a random square and retrying if it is
on the snake takes longer and longer as the board fills. On a 32x16 grid with a 200-segment snake, most random
squares are occupied. The sketch caps the retries and falls back to a linear scan, which is the honest fix.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'An Uno works identically. This runs comfortably on an ATmega328P.' },
  { id: 'oled13', qty: 1, note: 'SSD1306 128x64 over I2C. The 1.3 inch SH1106 is nicer to play on and needs one line changed.' },
  { id: 'joystick', qty: 1, note: 'The two-axis thumbstick with a push switch. A D-pad of four buttons works too and is arguably better for Snake.' },
  { id: 'buzzer', qty: 1, note: 'Eating and dying. A game with no sound feels unfinished.' },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'box-abs', qty: 1, note: 'Optional. It makes a decent desk toy once it works.' }
],

tools: [],

build: {
  parts: [
    { id: 'nano', comp: 'nano',     at: [0, 44] },
    { id: 'bb',   comp: 'bb400',    at: [0, -12] },
    { id: 'oled', comp: 'oled13',   at: [0, -64], ry: 180 },
    { id: 'joy',  comp: 'joystick', at: [-46, -62] },
    { id: 'buz',  comp: 'buzzer',   at: [44, -60] }
  ],
  wires: [
    { from: 'nano.5V',  to: 'bb.T+2',  color: 'red',    note: '5 V rail' },
    { from: 'nano.GND', to: 'bb.T-2',  color: 'black',  note: 'Ground rail' },
    { from: 'oled.VCC', to: 'bb.T+6',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-6',  color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'nano.A4', color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL', to: 'nano.A5', color: 'yellow', note: 'I2C clock' },
    { from: 'joy.VCC',  to: 'bb.T+10', color: 'red',    note: 'Joystick power' },
    { from: 'joy.GND',  to: 'bb.T-10', color: 'black',  note: 'Joystick ground' },
    { from: 'joy.VRx',  to: 'nano.A0', color: 'green',  note: 'X axis, analogue' },
    { from: 'joy.VRy',  to: 'nano.A1', color: 'green',  note: 'Y axis, analogue' },
    { from: 'joy.SW',   to: 'nano.D2', color: 'purple', note: 'Push switch - pause and restart. Internal pull-up' },
    { from: 'buz.+',    to: 'nano.D9', color: 'orange', note: 'Buzzer. D9 has a hardware timer, which tone() likes' },
    { from: 'buz.-',    to: 'bb.T-16', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireNotes: `
<div class="note tip"><span class="t">The joystick centre is never 512</span>
<p>The thumbstick's two potentiometers sit around the middle of their travel, and "the middle" is typically
490-530 rather than exactly 512. Different sticks differ, and the same stick differs between axes.</p>
<p>The sketch reads the resting position at startup and calibrates to it. Without that, a stick that rests at
545 registers as a permanent "right" and the snake drives into the wall the moment you power up.</p></div>

<div class="note tip"><span class="t">The push switch needs a pull-up</span>
<p><code>pinMode(SW, INPUT_PULLUP)</code>. The joystick module's switch just shorts to ground and has no
resistor of its own - on many boards the pin floats without one and the game pauses at random.</p></div>

<div class="note warn"><span class="t">SSD1306 or SH1106 - they are not the same</span>
<p>0.96&nbsp;inch modules are usually SSD1306; 1.3&nbsp;inch ones are usually SH1106. They use different
libraries and an SH1106 driven as an SSD1306 shows the image offset by two pixels with a stripe down the
side.</p>
<p>If that is what you see, the panel is an SH1106. Use the U8g2 library, which handles both.</p></div>`,

solderSteps: [
  { h: 'Nothing here needs soldering',
    body: `<p>Everything has headers. This is a breadboard project and it stays a good one - it is the
    easiest build in the book and a genuinely fun result.</p>` },
  { h: 'If you box it as a handheld',
    body: `<p>The joystick module's mounting holes take M3. Cut a window for the OLED rather than leaving it
    behind clear plastic, which reflects badly under a lamp.</p>
    <p>Two AA cells will not run a Nano properly - use three, or a LiPo with a boost converter.</p>` }
],

assembly: [
  { h: 'Get the display working first',
    body: `<p>Run the library's own example. If nothing appears, the address is usually 0x3C and occasionally
    0x3D - an I2C scanner sketch tells you in ten seconds.</p>
    <p>A blank screen with the backlight-less OLED looks identical to no power, so check the module gets
    5&nbsp;V before assuming software.</p>` },
  { h: 'Print the joystick values and watch them',
    body: `<p>A four-line sketch printing <code>analogRead(A0)</code> and <code>A1</code>. Push the stick to
    each extreme and note the range - usually about 0 to 1023 - and note the resting value.</p>
    <p>That resting value is what the calibration uses. Some sticks also have a small dead zone at the
    extremes and never quite reach 0 or 1023, which does not matter here.</p>` },
  { h: 'Build the naive version first, deliberately',
    body: `<p>Genuinely worth doing. Write the array-shifting version, play it, and get to 60 or 70 segments.
    You will feel it slow down.</p>
    <p>Then swap in the ring buffer and feel it stop slowing down. Ten minutes, and the lesson sticks in a way
    that reading about it does not.</p>` },
  { h: 'Tune the grid size',
    body: `<p>128x64 pixels at 4 pixels per cell gives a 32x16 grid, which is the classic Snake feel. At 2
    pixels per cell you get 64x32, which is a much longer game and harder to see.</p>
    <p>Four is right for a first version.</p>` },
  { h: 'Tune the speed curve',
    body: `<p>Starting at 200&nbsp;ms per tick and dropping 6&nbsp;ms per apple, with a floor of 70, gives a
    game that is gentle for the first ten and genuinely hard by thirty.</p>
    <p>Play it a dozen times and adjust. A game that is too hard at the start is one nobody plays twice.</p>` },
  { h: 'Add the high score last',
    body: `<p>Two bytes in EEPROM. Check the magic byte so a fresh chip does not report a high score of
    31,573 from whatever was in the flash.</p>` }
],

libraries: [
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The display, plus Adafruit GFX. Use U8g2 instead if yours is an SH1106.' },
  { name: 'EEPROM', by: 'Arduino', how: 'Built in', why: 'The high score.' }
],

code: [
{
  h: 'Snake',
  intro: `<p>The ring buffer is the part to read. Everything else is straightforward.</p>`,
  name: 'snake.ino',
  code: `/* ------------------------------------------------------------------
   Snake.

   The snake lives in a RING BUFFER. The naive version shifts every
   segment along on each move, which is O(n) per tick - so the game
   visibly slows down exactly as you get good at it. This one does
   one write and two increments regardless of length.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <EEPROM.h>

#define JOY_X    A0
#define JOY_Y    A1
#define JOY_SW    2
#define BUZZER    9

#define CELL      4                  // pixels per grid square
#define GRID_W   (128 / CELL)        // 32
#define GRID_H   ((64 - 10) / CELL)  // 13, leaving 10 px for the score bar
#define MAX_LEN  256                 // must be a power of two - see below

#define START_MS  200
#define SPEED_UP    6
#define MIN_MS     70

#define EE_MAGIC_ADDR  0
#define EE_SCORE_ADDR  1
#define EE_MAGIC    0x53

Adafruit_SSD1306 oled(128, 64, &Wire, -1);

/* One byte per axis is enough for a 32x13 grid and keeps the whole
   snake in 512 bytes, which fits an ATmega328P's 2 KB of RAM. */
uint8_t bodyX[MAX_LEN], bodyY[MAX_LEN];
uint16_t head = 0, tail = 0, length = 3;

int8_t dirX = 1, dirY = 0;
int8_t nextX = 1, nextY = 0;         // buffered, applied at the tick

uint8_t foodX, foodY;
uint16_t score = 0, highScore = 0;
uint16_t tickMs = START_MS;
bool wrapWalls = false;
bool alive = true;
unsigned long lastTick = 0;

int joyCentreX = 512, joyCentreY = 512;

void setup() {
  Serial.begin(115200);
  pinMode(JOY_SW, INPUT_PULLUP);

  if (!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("no OLED at 0x3C - try 0x3D"));
    while (1);
  }
  oled.setTextColor(SSD1306_WHITE);

  /* The stick's resting position is never exactly 512. Reading it at
     startup means a stick that rests at 545 does not register as a
     permanent "right" and drive the snake into the wall. */
  delay(200);
  long sx = 0, sy = 0;
  for (int i = 0; i < 32; i++) { sx += analogRead(JOY_X); sy += analogRead(JOY_Y); delay(3); }
  joyCentreX = sx / 32;
  joyCentreY = sy / 32;

  if (EEPROM.read(EE_MAGIC_ADDR) == EE_MAGIC) {
    EEPROM.get(EE_SCORE_ADDR, highScore);
  } else {
    // A fresh chip holds 0xFF everywhere, which reads as a high score
    // of 65535 and is dispiriting.
    EEPROM.update(EE_MAGIC_ADDR, EE_MAGIC);
    highScore = 0;
    EEPROM.put(EE_SCORE_ADDR, highScore);
  }

  randomSeed(analogRead(A3));
  splash();
  reset();
}

void loop() {
  // Input is read EVERY pass, not once per tick. A stick sampled only
  // at the tick misses a quick flick and the game feels unresponsive.
  readInput();

  if (!alive) {
    if (!digitalRead(JOY_SW)) { delay(200); reset(); }
    return;
  }

  if (millis() - lastTick < tickMs) return;
  lastTick = millis();

  step();
  draw();
}

/* --- input --------------------------------------------------------------
   The next direction is buffered and applied at the tick, so pressing
   two directions between ticks cannot turn the snake back on itself
   in one move. */
void readInput() {
  int x = analogRead(JOY_X) - joyCentreX;
  int y = analogRead(JOY_Y) - joyCentreY;
  const int DEAD = 250;

  if (x > DEAD && dirX == 0)       { nextX = 1;  nextY = 0; }
  else if (x < -DEAD && dirX == 0) { nextX = -1; nextY = 0; }
  else if (y > DEAD && dirY == 0)  { nextX = 0;  nextY = 1; }
  else if (y < -DEAD && dirY == 0) { nextX = 0;  nextY = -1; }
}

/* --- the move, in constant time ---------------------------------------- */
void step() {
  dirX = nextX; dirY = nextY;

  int8_t nx = bodyX[(head + MAX_LEN - 1) & (MAX_LEN - 1)] + dirX;
  int8_t ny = bodyY[(head + MAX_LEN - 1) & (MAX_LEN - 1)] + dirY;

  if (wrapWalls) {
    if (nx < 0) nx = GRID_W - 1;
    if (nx >= GRID_W) nx = 0;
    if (ny < 0) ny = GRID_H - 1;
    if (ny >= GRID_H) ny = 0;
  } else if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) {
    die();
    return;
  }

  if (hitsBody(nx, ny)) { die(); return; }

  bool ate = (nx == foodX && ny == foodY);

  /* THE RING BUFFER. Write the new head, advance head. If we did not
     eat, advance tail too - which "removes" the last segment without
     moving anything. One write, two increments, whatever the length.

     MAX_LEN is a power of two so the wrap is a bitwise AND rather
     than a modulo, which on an 8-bit chip without a divider is the
     difference between one instruction and about forty. */
  bodyX[head] = nx;
  bodyY[head] = ny;
  head = (head + 1) & (MAX_LEN - 1);

  if (ate) {
    length++;
    score++;
    if (tickMs > MIN_MS) tickMs -= SPEED_UP;
    tone(BUZZER, 1800, 40);
    placeFood();
  } else {
    tail = (tail + 1) & (MAX_LEN - 1);
  }
}

bool hitsBody(int8_t x, int8_t y) {
  /* This one IS O(n) and that is fine - 200 comparisons on a 16 MHz
     chip is about 50 microseconds. It was the COPYING that mattered,
     not the checking. Worth being clear about which is which. */
  for (uint16_t i = tail; i != head; i = (i + 1) & (MAX_LEN - 1)) {
    if (bodyX[i] == x && bodyY[i] == y) return true;
  }
  return false;
}

void placeFood() {
  /* Random-and-retry gets slower as the board fills - with a
     200-segment snake on a 32x13 grid, most squares are occupied and
     this could spin for a long time. Cap the retries and fall back to
     a scan, which is bounded. */
  for (uint8_t tries = 0; tries < 60; tries++) {
    uint8_t fx = random(GRID_W), fy = random(GRID_H);
    if (!hitsBody(fx, fy)) { foodX = fx; foodY = fy; return; }
  }

  for (uint8_t y = 0; y < GRID_H; y++) {
    for (uint8_t x = 0; x < GRID_W; x++) {
      if (!hitsBody(x, y)) { foodX = x; foodY = y; return; }
    }
  }
  // Board completely full: the player has won.
  die();
}

void die() {
  alive = false;
  tone(BUZZER, 300, 400);

  if (score > highScore) {
    highScore = score;
    EEPROM.put(EE_SCORE_ADDR, highScore);
  }
  drawGameOver();
}

void reset() {
  head = tail = 0;
  length = 3;
  score = 0;
  tickMs = START_MS;
  dirX = nextX = 1;
  dirY = nextY = 0;
  alive = true;

  for (uint8_t i = 0; i < 3; i++) {
    bodyX[head] = 4 + i;
    bodyY[head] = GRID_H / 2;
    head = (head + 1) & (MAX_LEN - 1);
  }
  placeFood();
  lastTick = millis();
}

/* --- drawing ------------------------------------------------------------ */
void draw() {
  oled.clearDisplay();

  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.print(F("SCORE ")); oled.print(score);
  oled.setCursor(74, 0);
  oled.print(F("BEST ")); oled.print(highScore);
  oled.drawFastHLine(0, 9, 128, SSD1306_WHITE);

  for (uint16_t i = tail; i != head; i = (i + 1) & (MAX_LEN - 1)) {
    oled.fillRect(bodyX[i] * CELL, 10 + bodyY[i] * CELL,
                  CELL - 1, CELL - 1, SSD1306_WHITE);
  }

  // Food as a hollow square, so it is distinguishable from the snake
  // at four pixels.
  oled.drawRect(foodX * CELL, 10 + foodY * CELL, CELL, CELL, SSD1306_WHITE);

  oled.display();
}

void drawGameOver() {
  oled.fillRect(14, 16, 100, 34, SSD1306_BLACK);
  oled.drawRect(14, 16, 100, 34, SSD1306_WHITE);

  oled.setTextSize(1);
  oled.setCursor(30, 22);
  oled.print(F("GAME OVER"));
  oled.setCursor(26, 34);
  oled.print(F("score "));
  oled.print(score);
  if (score == highScore && score > 0) oled.print(F("  NEW!"));
  oled.setCursor(22, 42);
  oled.print(F("press to play"));

  oled.display();
}

void splash() {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(30, 16);
  oled.println(F("SNAKE"));
  oled.setTextSize(1);
  oled.setCursor(18, 42);
  oled.print(F("best "));
  oled.print(highScore);
  oled.display();
  delay(1500);
}`,
  after: `<p><strong><code>MAX_LEN</code> is 256 because it is a power of two.</strong> That lets the wrap be
  <code>(i + 1) &amp; 255</code> instead of <code>(i + 1) % 256</code>. On an ATmega328P, which has no
  hardware divider, a modulo is around forty cycles and a bitwise AND is one. In a loop that runs over every
  segment, that matters.</p>
  <p><strong>Buffering the direction until the tick</strong> fixes a bug you would otherwise spend an evening
  on: between two ticks a player can flick up and then left, and if each is applied immediately the snake
  reverses into itself and dies for no visible reason.</p>
  <p><strong>The food placement fallback</strong> is the kind of edge case that only appears when someone is
  genuinely good at the game. With a 200-segment snake most random squares are occupied, and unbounded
  retrying freezes the game at the moment of the player's greatest triumph.</p>`
}],

upload: `
<p>Ordinary Nano upload. Serial Monitor at <strong>115200</strong> if you want to see the joystick
calibration.</p>
<div class="note tip"><span class="t">Leave the stick alone at power-up</span>
<p>The first 200&nbsp;ms reads the resting position. Holding the stick over while it boots calibrates the
wrong centre, and the snake then drives itself in that direction.</p></div>
<div class="note warn"><span class="t">Offset image with a stripe down one side</span>
<p>Your panel is an SH1106, not an SSD1306. Switch to the U8g2 library, which supports both, or use an
SH1106-specific library. The 1.3&nbsp;inch modules are usually SH1106.</p></div>`,

tune: [
  { h: 'Difficulty is three numbers',
    body: `<p><code>START_MS</code> sets how gentle the opening is, <code>SPEED_UP</code> how fast it gets
    harder, <code>MIN_MS</code> where it stops.</p>
    <p>200 / 6 / 70 gives a playable curve. Under 60&nbsp;ms per tick the display refresh starts to matter and
    it feels laggy rather than fast.</p>` },
  { h: 'Wrap-around walls',
    body: `<p><code>wrapWalls = true</code> and the snake passes through the edges. It is a much gentler game
    and a good option for younger players.</p>
    <p>Make it a menu option on the splash screen rather than a recompile.</p>` },
  { h: 'A D-pad instead of a stick',
    body: `<p>Four buttons on four pins with internal pull-ups. Arguably better for Snake - a thumbstick's
    diagonal is a constant source of accidental turns, and a D-pad has none.</p>
    <p>It also frees the two analogue pins.</p>` },
  { h: 'Faster drawing with U8g2 page mode',
    body: `<p>Adafruit's library keeps a 1&nbsp;KB framebuffer, which is half an ATmega328P's RAM. U8g2 in
    page mode draws in strips and uses about 128 bytes.</p>
    <p>That buys you room for a much longer <code>MAX_LEN</code>, or for a second game on the same
    hardware.</p>` },
  { h: 'Two-player on one screen',
    body: `<p>A second ring buffer, a second joystick, and each snake checks collision against both bodies.
    The structure supports it directly - which is the sign of a data layout that was right.</p>` },
  { h: 'Add the other classics',
    body: `<p>The same hardware runs Pong, Tetris, Breakout and Simon. A menu on the splash screen turns this
    into a small console, and every one of them reuses the game loop you have already written.</p>` }
],

trouble: [
  { q: 'The snake moves on its own at start-up',
    a: `The joystick was not at rest during calibration, or the dead zone is too small. Let go of the stick
    while it boots, and raise <code>DEAD</code> to 300 if a resting stick still registers.` },
  { q: 'It dies immediately for no reason',
    a: `The direction was applied twice between ticks and the snake reversed into itself. Check the direction
    is buffered in <code>nextX/nextY</code> and only copied to <code>dirX/dirY</code> inside
    <code>step()</code>.` },
  { q: 'Nothing on the display',
    a: `Address. 0x3C usually, 0x3D sometimes. Run an I2C scanner. Then check the module has 5&nbsp;V - an
    OLED with no power looks identical to one showing a black screen.` },
  { q: 'Image offset with a stripe on one side',
    a: `SH1106 panel driven as an SSD1306. Use U8g2.` },
  { q: 'The game slows down as the snake grows',
    a: `You are on the array-shifting version. That is the whole point of the ring buffer - and it is worth
    having seen it happen before you fix it.` },
  { q: 'High score is 65535 on a new board',
    a: `Fresh EEPROM reads 0xFF. The magic byte check handles it - make sure you did not skip it.` },
  { q: 'It freezes when the snake gets very long',
    a: `Food placement spinning on random retries with a nearly-full board. The capped retries and linear
    scan fallback fix it.` },
  { q: 'Sound is very quiet',
    a: `Passive buzzers need <code>tone()</code>; active ones just need a HIGH. If yours clicks rather than
    beeps it is active - drive it with <code>digitalWrite</code> instead.` }
],

next: `
<ul>
  <li><strong>The same hardware, a harder game</strong> - <a href="project.html?p=tetris-handheld">Tetris</a>
  uses the same display and stick and introduces rotation and line clearing.</li>
  <li><strong>Two players</strong> - <a href="project.html?p=oled-pong">Pong</a> is on the same parts.</li>
  <li><strong>Memory rather than reflexes</strong> -
  <a href="project.html?p=simon-says">Simon</a> needs only LEDs and a buzzer.</li>
  <li><strong>Make it a real handheld</strong> - a LiPo, a boost converter and a 3D-printed case turns this
  into something you would actually carry.</li>
</ul>`,

safety: `
<div class="note tip"><span class="t">Nothing to be careful of here</span>
<p>Five volts, a few tens of milliamps, and no moving parts. This is the safest project in the book and a
good one to build with someone who has not soldered before - there is nothing to solder.</p>
<p>The only note worth making: if you box it up with a LiPo later, the usual lithium rules apply - a protected
charging board, and no charging below 0&nbsp;&deg;C. See the <a href="basics/power.html">power basics</a>.</p>
</div>`
});
