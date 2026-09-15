/* Pong on a 128x64 OLED with two potentiometer paddles. */
AB.addProject({
slug: 'oled-pong',
title: 'Pong on an OLED',
cat: 'games',
level: 2,
time: '90 minutes',
solder: false,
board: 'Nano',
tags: ['oled', 'game', 'potentiometer', 'physics', 'ai', 'no soldering'],
blurb: 'Two knobs, a 0.96 inch screen, and the 1972 original. Includes a computer opponent that is beatable on purpose.',

skills: ['Frame buffers', 'Collision detection', 'Game physics', 'Simple AI', 'Fixed frame rates'],

intro: `
<p>Pong is the right second or third project because it is entirely logic. There is no module to misbehave and
no library to misconfigure: an OLED, two potentiometers, and a ball that has to bounce correctly. Every bug is
yours, which is exactly what you want at this stage.</p>
<p>It also teaches the frame-buffer model that every graphical project uses afterwards - you draw into memory,
then push the whole thing to the screen at once.</p>`,

what: [
  'Play two-player Pong with a knob each, at a steady 40 frames a second.',
  'Or one player against a computer opponent with an adjustable, deliberately imperfect reaction.',
  'Make the ball speed up as a rally goes on, and leave the paddle at an angle that changes the bounce.',
  'Play to 7, show the score, and a winner screen.',
  'Fit comfortably in an Uno\'s memory, with the 1 KB screen buffer included.'
],

how: `
<p>An SSD1306 does not have a "draw a rectangle" command you can call from outside. You keep a
<strong>frame buffer</strong> in the Arduino's RAM - 128&times;64 pixels, one bit each, so 1024 bytes - draw
into it, and then call <code>display()</code> to shift the whole thing across I2C. On a board with 2&nbsp;KB of
RAM that buffer is half your memory, which is why this sketch keeps its state in a handful of integers.</p>
<p><strong>Collision</strong> with a paddle is one comparison: has the ball crossed the paddle's x, and is its
y within the paddle's span? The interesting part is what happens next. Reversing <code>vx</code> alone makes a
dull game where every rally is identical. Instead, where the ball hits the paddle changes <code>vy</code> -
hit near the end and it flies off at a steeper angle. That single rule is what makes Pong a game rather than a
demo.</p>
<p><strong>The computer opponent</strong> is deliberately imperfect. A paddle that tracks the ball exactly is
unbeatable and no fun. Giving it a maximum speed slower than the ball, and a small random error in where it
thinks the ball is going, produces an opponent that loses occasionally and feels like an opponent.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'Or an Uno. Identical code.' },
  { id: 'oled13', qty: 1, note: '128x64 I2C. The 1.3 inch SH1106 works with a different library - see the troubleshooting.' },
  { id: 'pot10k', qty: 2, note: 'With knobs if you can. A knob makes an enormous difference to how it plays.' },
  { id: 'button', qty: 1, note: 'Start and mode select.' },
  { id: 'buzzer', qty: 1, note: 'Passive. The bleeps are half the appeal.' },
  { id: 'bb-830', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [],

build: {
  parts: [
    { id: 'nano', comp: 'nano',   at: [0, 60] },
    { id: 'bb',   comp: 'bb830',  at: [0, -6] },
    { id: 'oled', comp: 'oled13', at: [0, -66], ry: 180 },
    { id: 'p1',   comp: 'pot10k', at: [-58, -60] },
    { id: 'p2',   comp: 'pot10k', at: [58, -60] },
    { id: 'btn',  comp: 'button', at: [30, -58] },
    { id: 'buz',  comp: 'buzzer', at: [-30, -58] }
  ],
  wires: [
    { from: 'nano.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V onto the lower red rail' },
    { from: 'nano.GND',  to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+12',   to: 'bb.T+12', color: 'red',    note: 'Bridge the two red rails' },
    { from: 'bb.B-12',   to: 'bb.T-12', color: 'black',  note: 'Bridge the two blue rails' },
    { from: 'oled.VCC',  to: 'bb.T+4',  color: 'red',    note: 'Screen power' },
    { from: 'oled.GND',  to: 'bb.T-4',  color: 'black',  note: 'Screen ground' },
    { from: 'oled.SDA',  to: 'nano.A4', color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL',  to: 'nano.A5', color: 'green',  note: 'I2C clock' },
    { from: 'p1.1',      to: 'bb.T-8',  color: 'black',  note: 'Left pot, outer leg to ground' },
    { from: 'p1.W',      to: 'nano.A0', color: 'yellow', note: 'Left pot wiper' },
    { from: 'p1.3',      to: 'bb.T+8',  color: 'red',    note: 'Left pot, other outer leg to 5 V' },
    { from: 'p2.1',      to: 'bb.T-20', color: 'black',  note: 'Right pot, outer leg to ground' },
    { from: 'p2.W',      to: 'nano.A1', color: 'orange', note: 'Right pot wiper' },
    { from: 'p2.3',      to: 'bb.T+20', color: 'red',    note: 'Right pot, other outer leg to 5 V' },
    { from: 'btn.1A',    to: 'nano.D2', color: 'purple', note: 'Start button, internal pull-up' },
    { from: 'btn.2A',    to: 'bb.T-24', color: 'black',  note: 'Button to ground' },
    { from: 'buz.+',     to: 'nano.D8', color: 'grey',   note: 'Buzzer' },
    { from: 'buz.-',     to: 'bb.T-28', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireNotes: `
<div class="note tip"><span class="t">A potentiometer is a voltage divider you can turn</span>
<p>Three legs: the two outer ones go to 5&nbsp;V and ground (either way round), and the middle one - the wiper -
gives you a voltage between them. <code>analogRead()</code> turns that into 0-1023.</p>
<p>If the paddle moves the wrong way, swap the two outer legs. No code change needed.</p></div>

<div class="note"><span class="t">Only four wires reach the Nano from the breadboard</span>
<p>A4, A5, A0, A1, D2 and D8 plus the rails. Everything else is on the breadboard. Wiring the rails first and
testing them before adding anything is worth thirty seconds, every single time.</p></div>`,

assembly: [
  { h: 'Power rails and the two bridges',
    body: `<p>5&nbsp;V and ground onto the bottom rails, then bridge to the top pair. Plug in USB, confirm the
    Nano's LED lights, unplug.</p>` },
  { h: 'The screen',
    body: `<p>Four wires. Run an I2C scanner first if you have not used this screen before - you need to know
    whether it is 0x3C or 0x3D.</p>` },
  { h: 'The two potentiometers',
    body: `<p>Push them into the breadboard at opposite ends so two people can sit either side. Outer legs to
    the rails, wipers to A0 and A1.</p>
    <p>Test before the game: a two-line sketch printing both <code>analogRead()</code> values should sweep
    smoothly from near 0 to near 1023. A pot that jumps is dirty or faulty - try another.</p>` },
  { h: 'Button and buzzer',
    body: `<p>Button to D2 and ground, buzzer to D8 and ground with its marked leg on D8.</p>` },
  { h: 'Play it',
    body: `<p>Press to start. Press during a game to switch between one and two players. It is more fun than it
    has any right to be, and considerably more fun with knobs fitted to the pots.</p>` }
],

libraries: [
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The screen driver and frame buffer.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Rectangles, circles and text.' }
],

code: [{
  name: 'oled_pong.ino',
  code: `/* ------------------------------------------------------------------
   Pong
   SSD1306 128x64 on I2C, pots on A0 and A1, button on D2, buzzer on D8.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---- settings --------------------------------------------------------
#define OLED_ADDR   0x3C
#define POT_LEFT    A0
#define POT_RIGHT   A1
#define BUTTON       2
#define BUZZER       8

#define W          128
#define H           64
#define PADDLE_H    14
#define PADDLE_W     3
#define WIN_SCORE    7
#define FRAME_MS    25       // 40 frames a second
// ----------------------------------------------------------------------

Adafruit_SSD1306 display(W, H, &Wire, -1);

enum State { TITLE, PLAYING, POINT, GAMEOVER };
State state = TITLE;

float ballX, ballY, vx, vy;
int leftY = 25, rightY = 25;
int scoreL = 0, scoreR = 0;
bool onePlayer = true;
float aiTarget = 25;
unsigned long stateAt = 0, lastFrame = 0;
byte rallyHits = 0;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("no screen - run an I2C scanner"));
    for (;;) { }
  }
  display.setTextColor(SSD1306_WHITE);
  randomSeed(analogRead(A3) * 31 + analogRead(A2));
  serve(1);
  stateAt = millis();
}

void loop() {
  // Fixed frame rate. Without this the game runs at whatever speed the
  // board manages, which changes when you add a line of code.
  if (millis() - lastFrame < FRAME_MS) return;
  lastFrame = millis();

  readPaddles();
  if (pressed()) handlePress();

  switch (state) {
    case TITLE:    drawTitle();    break;
    case PLAYING:  stepBall();     drawGame(); break;
    case POINT:    drawGame();
                   if (millis() - stateAt > 900) { serve(ballX < W / 2 ? 1 : -1); state = PLAYING; }
                   break;
    case GAMEOVER: drawGameOver(); break;
  }
}

/* --- input ------------------------------------------------------------ */
void readPaddles() {
  // The pot cannot quite reach either end, so map with a little margin
  // and clamp - otherwise the paddle never touches the top or bottom.
  int l = map(analogRead(POT_LEFT), 20, 1003, 0, H - PADDLE_H);
  leftY = constrain(l, 0, H - PADDLE_H);

  if (!onePlayer) {
    int r = map(analogRead(POT_RIGHT), 20, 1003, 0, H - PADDLE_H);
    rightY = constrain(r, 0, H - PADDLE_H);
  } else {
    stepAi();
  }
}

bool pressed() {
  static bool was = false;
  bool down = digitalRead(BUTTON) == LOW;
  bool hit = down && !was;
  was = down;
  if (hit) delay(20);
  return hit;
}

void handlePress() {
  if (state == TITLE) {
    scoreL = scoreR = 0;
    serve(random(2) ? 1 : -1);
    state = PLAYING;
  } else if (state == GAMEOVER) {
    state = TITLE;
  } else {
    onePlayer = !onePlayer;          // switch mode mid-game
    beep(1600, 40);
  }
  stateAt = millis();
}

/* --- the computer opponent -------------------------------------------- */
void stepAi() {
  // Only bother tracking when the ball is coming this way, and aim at a
  // slightly wrong place. A perfect paddle is unbeatable and no fun.
  if (vx > 0) {
    float predicted = ballY + vy * ((W - ballX) / max(0.4f, vx));
    // fold the prediction back off the walls
    while (predicted < 0 || predicted > H) {
      if (predicted < 0) predicted = -predicted;
      if (predicted > H) predicted = 2 * H - predicted;
    }
    aiTarget = predicted - PADDLE_H / 2 + random(-7, 8);
  } else {
    aiTarget = H / 2 - PADDLE_H / 2;   // drift back to the middle
  }

  float want = constrain(aiTarget, 0, H - PADDLE_H);
  float maxStep = 2.4;                 // slower than the ball, on purpose
  if (want > rightY + maxStep)      rightY += maxStep;
  else if (want < rightY - maxStep) rightY -= maxStep;
  else                              rightY = want;
}

/* --- physics ---------------------------------------------------------- */
void serve(int dir) {
  ballX = W / 2;
  ballY = random(16, H - 16);
  vx = dir * 1.6;
  vy = (random(2) ? 1 : -1) * (0.5 + random(80) / 100.0);
  rallyHits = 0;
}

void stepBall() {
  ballX += vx;
  ballY += vy;

  // top and bottom walls
  if (ballY <= 1)      { ballY = 1;     vy = -vy; beep(900, 12); }
  if (ballY >= H - 2)  { ballY = H - 2; vy = -vy; beep(900, 12); }

  // left paddle
  if (vx < 0 && ballX <= PADDLE_W + 1 && ballX > 0) {
    if (ballY >= leftY - 1 && ballY <= leftY + PADDLE_H + 1) {
      bounce(leftY);
      ballX = PADDLE_W + 1;
    }
  }

  // right paddle
  if (vx > 0 && ballX >= W - PADDLE_W - 2 && ballX < W) {
    if (ballY >= rightY - 1 && ballY <= rightY + PADDLE_H + 1) {
      bounce(rightY);
      ballX = W - PADDLE_W - 2;
    }
  }

  // point scored
  if (ballX < -2) { scoreR++; point(); }
  if (ballX > W + 2) { scoreL++; point(); }
}

/* Where on the paddle it lands decides the angle. This one rule is the
   difference between Pong and a screensaver. */
void bounce(int paddleY) {
  float hit = (ballY - paddleY) / (float)PADDLE_H;   // 0 at top, 1 at bottom
  hit = constrain(hit, 0.0f, 1.0f);

  vy = (hit - 0.5) * 3.4;
  vx = -vx;

  rallyHits++;
  if (rallyHits % 4 == 0) vx *= 1.12;                // speed up the rally
  vx = constrain(vx, -4.6f, 4.6f);

  beep(1500, 16);
}

void point() {
  beep(220, 220);
  state = (scoreL >= WIN_SCORE || scoreR >= WIN_SCORE) ? GAMEOVER : POINT;
  stateAt = millis();
}

/* --- drawing ---------------------------------------------------------- */
void drawGame() {
  display.clearDisplay();

  // dotted centre line
  for (int y = 2; y < H; y += 6) display.drawFastVLine(W / 2, y, 3, SSD1306_WHITE);

  display.fillRect(0, leftY, PADDLE_W, PADDLE_H, SSD1306_WHITE);
  display.fillRect(W - PADDLE_W, (int)rightY, PADDLE_W, PADDLE_H, SSD1306_WHITE);
  display.fillRect((int)ballX, (int)ballY, 2, 2, SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(W / 2 - 26, 2);
  display.print(scoreL);
  display.setCursor(W / 2 + 12, 2);
  display.print(scoreR);

  display.setTextSize(1);
  display.setCursor(W / 2 + 6, H - 9);
  display.print(onePlayer ? F("CPU") : F("P2"));

  display.display();
}

void drawTitle() {
  display.clearDisplay();
  display.setTextSize(3);
  display.setCursor(28, 8);
  display.print(F("PONG"));
  display.setTextSize(1);
  display.setCursor(10, 40);
  display.print(F("press to start"));
  display.setCursor(6, 52);
  display.print(onePlayer ? F("1 player - press to swap")
                          : F("2 player - press to swap"));
  display.display();
}

void drawGameOver() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(14, 10);
  display.print(scoreL > scoreR ? F("LEFT WINS") : F("RIGHT WINS"));
  display.setTextSize(1);
  display.setCursor(44, 36);
  display.print(scoreL);
  display.print(F(" - "));
  display.print(scoreR);
  display.setCursor(24, 52);
  display.print(F("press for menu"));
  display.display();
}

void beep(int hz, int ms) { tone(BUZZER, hz, ms); }`,
  after: `<p>Two things here are the general lesson:</p>
  <ul>
    <li><strong>The fixed frame rate.</strong> Without <code>FRAME_MS</code>, the game runs as fast as the board
    can manage - so it speeds up the moment you delete a line and slows down when you add one. Every game needs
    a clock.</li>
    <li><strong>The paddle-position bounce.</strong> Three lines, and it is the entire difference between a
    playable game and a demo. Worth remembering whenever something feels lifeless: the fix is usually in what
    varies, not in what moves.</li>
  </ul>`
}],

upload: `<p>Nano or Uno, correct port. If the screen stays black, the address is probably 0x3D - change
<code>OLED_ADDR</code>. Run an I2C scanner if you are not sure.</p>`,

tune: [
  { h: 'Difficulty of the computer player',
    body: `<p>Three knobs in <code>stepAi()</code>: <code>maxStep</code> is how fast the paddle can move
    (2.4 is beatable, 4.0 is hard, 6.0 is unbeatable), the <code>random(-7, 8)</code> is how wrong its aim is,
    and whether it tracks at all while the ball is moving away.</p>` },
  { h: 'Ball speed and rally acceleration',
    body: `<p>The initial <code>vx = dir * 1.6</code> and the <code>* 1.12</code> every four hits. Raising the
    acceleration makes long rallies dramatic; the <code>constrain</code> at 4.6 stops the ball tunnelling
    through a paddle entirely, which it will do above about 3 pixels per frame at this paddle width.</p>` },
  { h: 'If the ball passes through a paddle',
    body: `<p>It moved more than the paddle's width in one frame. Either cap <code>vx</code> lower, make the
    paddle wider, or do proper swept collision - checking the line between the old and new position rather than
    just the new one.</p>` },
  { h: 'Paddle travel',
    body: `<p>If the paddle will not quite reach the top or bottom, widen the <code>map(..., 20, 1003, ...)</code>
    range. Print the raw <code>analogRead()</code> at both extremes of your pot and use those numbers.</p>` },
  { h: 'Frame rate',
    body: `<p>25&nbsp;ms is 40&nbsp;fps and the screen can just about keep up over I2C at 400&nbsp;kHz. If it
    tears or stutters, add <code>Wire.setClock(400000);</code> after <code>display.begin()</code> - the default
    100&nbsp;kHz is the usual culprit.</p>` }
],

trouble: [
  { q: 'Screen is black',
    a: `Address. Run an I2C scanner; change <code>OLED_ADDR</code> to whatever it prints.` },
  { q: 'Display is scrambled or shifted by two pixels',
    a: `You have an SH1106 panel (usually the 1.3&nbsp;inch). Install <code>Adafruit_SH110X</code> and use
    <code>Adafruit_SH1106G</code> - the rest of the sketch is unchanged.` },
  { q: 'Paddle moves the wrong way',
    a: `Swap the pot's two outer legs, or reverse the map: <code>map(analogRead(POT_LEFT), 1003, 20, 0, H - PADDLE_H)</code>.` },
  { q: 'Paddle jitters by a pixel or two',
    a: `Analog noise on a cheap pot. Average four reads, or add a 100&nbsp;nF capacitor from the wiper to
    ground.` },
  { q: 'Game runs in slow motion',
    a: `<code>display.display()</code> over I2C at 100&nbsp;kHz takes about 25&nbsp;ms on its own. Add
    <code>Wire.setClock(400000)</code>.` },
  { q: 'Buzzer clicks instead of beeping',
    a: `Active buzzer instead of passive.` },
  { q: 'Board restarts randomly during play',
    a: `Out of RAM. The screen buffer is 1&nbsp;KB of the Uno\'s 2&nbsp;KB. Check what the IDE reports after
    compiling, and wrap any string literals in <code>F()</code>.` },
  { q: 'Button does nothing',
    a: `Check it is on diagonal legs of the tactile switch, and that <code>INPUT_PULLUP</code> is set.` }
],

next: `
<ul>
  <li><strong>Breakout.</strong> One paddle, a wall of bricks, the same collision code. About forty lines more.</li>
  <li><strong>Snake.</strong> Even simpler physics, and a good exercise in managing an array of positions in
  very little RAM.</li>
  <li><strong>Build it into a handheld</strong>: a Nano, a LiPo, a TP4056 charger and two small pots in a 3D
  printed or cardboard case.</li>
  <li><strong>Better controls</strong>: the <a href="project.html?p=simon-says">Simon</a> buttons, or a rotary
  encoder, which feels remarkably good for a paddle.</li>
</ul>`
});
