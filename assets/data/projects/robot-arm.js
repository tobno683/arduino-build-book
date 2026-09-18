/* Four-servo robot arm on a PCA9685, with joysticks and move recording. */
AB.addProject({
slug: 'robot-arm',
title: 'Robot arm that remembers',
cat: 'robotics',
level: 3,
time: 'A weekend',
printed: true,
solder: true,
board: 'Nano',
tags: ['pca9685', 'servo', 'joystick', 'eeprom', 'playback', 'i2c', 'robot arm'],
blurb: 'Four servos, two thumbsticks, and a record button. Teach it a sequence by moving it by hand, then press play and watch it repeat it forever.',

skills: ['PCA9685 servo driver', 'Servo power', 'Motion smoothing', 'Recording and playback', 'EEPROM sequences'],

intro: `
<p>A robot arm is the project that makes the whole hobby click for a lot of people, because the output is
physical and obvious. This one has four axes - base rotation, shoulder, elbow and gripper - and the feature
that makes it genuinely fun: <strong>teach and repeat</strong>. Drive it through a sequence with the sticks,
press record, and it plays the whole thing back on a loop.</p>
<p>The engineering content is servo power. Four servos moving at once is well over an amp in bursts, and an
arm's shoulder servo works against gravity continuously. Every "my robot arm twitches randomly" post online is
this, and the PCA9685 driver plus a separate supply is the answer.</p>`,

what: [
  'Drive four servos from two analog thumbsticks, smoothly, with no jitter when you let go.',
  'Enforce per-axis limits in software, so the arm cannot drive itself into its own frame.',
  'Record up to 40 positions with a button, and store them in EEPROM so they survive a power cut.',
  'Play the sequence back with eased movement between points, so it looks deliberate rather than snapping.',
  'Return to a safe parked pose on startup, rather than slamming to wherever the servos were last.'
],

how: `
<p>A <strong>hobby servo</strong> takes a pulse every 20&nbsp;ms whose width sets the angle - roughly
1000&nbsp;&micro;s at one extreme, 1500 at centre, 2000 at the other. Inside, a potentiometer on the output
shaft tells a controller where the arm actually is, and it drives the motor until they agree. That feedback
loop is why a servo holds position against a load, and why it draws current continuously while something pushes
back.</p>
<p>The <strong>PCA9685</strong> generates sixteen of those pulse trains in hardware, on its own crystal, and
you talk to it over I2C. That matters for three reasons: the Arduino's <code>Servo</code> library can only do a
handful of channels and fights with other timers; the PCA9685 keeps perfect timing while your code is busy; and
crucially it has a <strong>separate power terminal for the servos</strong>, so servo current never goes near
the microcontroller.</p>
<p>The PCA9685 works in 12-bit "ticks" out of 4096 rather than microseconds. At the standard 50&nbsp;Hz, one
period is 20&nbsp;ms, so one tick is about 4.88&nbsp;&micro;s - and a 1500&nbsp;&micro;s centre pulse is about
307 ticks. The sketch converts for you.</p>
<p><strong>Easing</strong> is what makes playback look good. Moving from one recorded pose to the next in a
straight line at constant speed looks robotic in the bad sense. Interpolating with a smoothstep curve - slow at
the start, fast in the middle, slow at the end - costs one line and transforms it.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'pca9685', qty: 1, note: 'The 16-channel breakout with a screw terminal for servo power. That terminal is the whole reason to use it.' },
  { id: 'mg996r', qty: 2, note: 'Metal gear, for the base and shoulder where the load is. Plastic-gear servos strip here within a week.' },
  { id: 'sg90', qty: 2, note: 'For the elbow and the gripper, which carry much less.' },
  { id: 'joystick', qty: 2, note: 'One for base and shoulder, one for elbow and gripper.' },
  { id: 'button', qty: 3, note: 'Record a point, play/stop, and clear the sequence.' },
  { id: 'led5', qty: 2, note: 'Recording indicator and playing indicator.' },
  { id: 'res220', qty: 2 },
  { id: 'psu5v3a', qty: 1, note: 'For the servos ONLY. 3 A minimum - four MG996Rs stalling together is well over that, and the limits in the sketch exist partly to avoid finding out.' },
  { id: 'cap1000', qty: 2, note: 'One across the servo supply at the PCA9685, one across the 5 V logic.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 1 },
  { id: 'standoffs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'usb-meter' }],

build: {
  parts: [
    { id: 'nano',  comp: 'nano',     at: [0, 0] },
    { id: 'drv',   comp: 'pca9685',  at: [0, -66], ry: 180 },
    { id: 'base',  comp: 'servo',    at: [-88, -120], ry: 90 },
    { id: 'shldr', comp: 'servo',    at: [-88, -66], ry: 90 },
    { id: 'elbow', comp: 'servo',    at: [-88, -14], ry: 90 },
    { id: 'grip',  comp: 'servo',    at: [-88, 38], ry: 90 },
    { id: 'joy1',  comp: 'joystick', at: [58, 42], ry: 180 },
    { id: 'joy2',  comp: 'joystick', at: [58, -14], ry: 180 },
    { id: 'psu',   comp: 'block',    at: [0, 74], opt: { w: 72, h: 24, d: 46, c: '#2b2f34' }, label: '5 V 3 A servo supply' }
  ],
  wires: [
    { from: 'psu.n',     to: 'drv.V+',    color: 'red',    note: 'Servo supply into the PCA9685 screw terminal. This is the high-current path' },
    { from: 'psu.f',     to: 'drv.GND',   color: 'black',  note: 'Servo supply negative' },
    { from: 'drv.VCC',   to: 'nano.5V',   color: 'red',    note: 'Logic power for the driver chip - separate from V+' },
    { from: 'drv.GND',   to: 'nano.GND',  color: 'black',  note: 'COMMON GROUND between the two supplies' },
    { from: 'drv.SDA',   to: 'nano.A4',   color: 'blue',   note: 'I2C data' },
    { from: 'drv.SCL',   to: 'nano.A5',   color: 'green',  note: 'I2C clock' },
    { from: 'base.SIG',  to: 'drv.CH0',    color: 'orange', note: 'Base servo into PCA9685 channel 0' },
    { from: 'shldr.SIG', to: 'drv.CH1',    color: 'yellow', note: 'Shoulder servo into channel 1' },
    { from: 'elbow.SIG', to: 'drv.CH2',    color: 'white',  note: 'Elbow servo into channel 2' },
    { from: 'grip.SIG',  to: 'drv.CH3',    color: 'grey',   note: 'Gripper servo into channel 3' },
    { from: 'joy1.VCC',  to: 'nano.5V',   color: 'red',    note: 'Joystick power - they draw microamps' },
    { from: 'joy1.GND',  to: 'nano.GND2', color: 'black',  note: 'Joystick ground' },
    { from: 'joy1.VRx',  to: 'nano.A0',   color: 'blue',   note: 'Base rotation' },
    { from: 'joy1.VRy',  to: 'nano.A1',   color: 'green',  note: 'Shoulder' },
    { from: 'joy1.SW',   to: 'nano.D4',   color: 'purple', note: 'Record a point' },
    { from: 'joy2.VCC',  to: 'nano.5V',   color: 'red',    note: 'Second joystick power' },
    { from: 'joy2.GND',  to: 'nano.GND2', color: 'black',  note: 'Second joystick ground' },
    { from: 'joy2.VRx',  to: 'nano.A2',   color: 'blue',   note: 'Elbow' },
    { from: 'joy2.VRy',  to: 'nano.A3',   color: 'green',  note: 'Gripper' },
    { from: 'joy2.SW',   to: 'nano.D5',   color: 'purple', note: 'Play / stop' }
  ]
},

wireIntro: `<p>The four servo leads plug into the PCA9685's own 3-pin headers - channel 0 through 3, with the
brown or black wire on the outside edge - so they are shown here as single connections rather than three wires
each.</p>`,

wireNotes: `
<div class="note danger"><span class="t">V+ and VCC are not the same thing</span>
<p>The PCA9685 has two power inputs and confusing them is the classic mistake:</p>
<ul>
  <li><strong>V+</strong> (the screw terminal, and the pin next to it) is the <em>servo</em> supply. This is
  where your 3&nbsp;A goes. It feeds the servo headers and nothing else.</li>
  <li><strong>VCC</strong> is the <em>logic</em> supply for the chip itself, a few milliamps, from the Nano's
  5&nbsp;V.</li>
</ul>
<p>Powering V+ from the Nano browns out the board the moment two servos move. Powering VCC from the servo
supply usually works and removes the isolation you built the thing for.</p>
<p>The two grounds <strong>must</strong> be joined - that is the shared reference the signals need.</p></div>

<div class="note warn"><span class="t">Servo lead orientation</span>
<p>Brown or black is ground and goes on the outside edge of the board, nearest the PCB edge. Red is in the
middle, orange or yellow is signal on the inside. Almost every servo follows this, and the PCA9685 silkscreens
it - but check, because a reversed lead puts 5&nbsp;V on the signal line.</p></div>

<div class="note warn"><span class="t">Two capacitors, and they do different jobs</span>
<p>1000&nbsp;&micro;F across V+ and GND right at the PCA9685's terminal, to absorb the current step when servos
start. Another across the Nano's 5&nbsp;V, so a sag on the servo rail cannot reach the logic through the
shared ground.</p>
<p>Stripe to ground on both. This is the difference between an arm that moves and an arm that resets.</p></div>

<div class="note tip"><span class="t">Address 0x40, and the OE pin</span>
<p>The PCA9685 is at <code>0x40</code> by default, with six solder jumpers to change it if you ever chain
boards. Its <strong>OE</strong> (output enable) pin is active low and pulled low on the board, so outputs are
on. Pull it high to kill every servo instantly - which is worth wiring to a panic button on a bigger arm.</p></div>`,

solderSteps: [
  { h: 'Headers on the PCA9685',
    body: `<p>It ships bare. You need the 6-pin control header and the 4&times;16 servo headers. That is a lot of
    joints, and they are all identical - it is good practice.</p>
    <p>Use a breadboard as a jig for the control header. For the servo headers, tack one pin at each end of the
    strip, check it is square from the side, then run the rest. Three seconds each at 340&nbsp;&deg;C, wiping
    the tip every five joints.</p>` },
  { h: 'Fit the screw terminal',
    body: `<p>Two large pads. They will soak up heat - if the solder is not flowing within three seconds, turn
    the iron up 20&nbsp;&deg;C rather than holding it there longer. Fill them properly; all the servo current
    goes through here.</p>
    <p>Terminal openings facing outwards off the board edge.</p>` },
  { h: 'Sockets on the perfboard',
    body: `<p>Two 15-pin strips for the Nano and a 6-pin for the PCA9685's control header. Use each module as
    its own spacing jig.</p>` },
  { h: 'Two separate power paths',
    body: `<p>Bring the 5&nbsp;V servo supply in on its own screw terminal and run <strong>thick</strong> wire
    - 20&nbsp;AWG - straight to the PCA9685's V+ terminal. Do not route it through the perfboard's thin traces
    or through any header pin.</p>
    <p>The logic 5&nbsp;V is a separate thin wire from the Nano. The two grounds meet at exactly one point.</p>` },
  { h: 'The two capacitors',
    body: `<p>1000&nbsp;&micro;F across V+ at the terminal, 1000&nbsp;&micro;F across the logic 5&nbsp;V.
    Stripe to ground on both - backwards, an electrolytic vents, loudly.</p>` },
  { h: 'Joysticks and buttons on flying leads',
    body: `<p>Five wires per joystick, twisted into a loom, long enough to reach a comfortable controller
    position. Sleeve the joints.</p>` },
  { h: 'Check before any servo is plugged in',
    body: `<p>Continuity: V+ to ground open, logic 5&nbsp;V to ground open, V+ to logic 5&nbsp;V
    <strong>open</strong> - if that last one beeps you have joined the supplies and the whole point is lost.
    Servo ground to Nano ground: beep.</p>
    <p>Then power up with no servos connected and confirm the PCA9685 answers at 0x40 on an I2C scan.</p>` }
],

assembly: [
  { h: 'Centre every servo before you build the arm',
    body: `<p>This is the step that decides whether your arm has its full range or half of it. Upload the centre
    sketch below, plug each servo into its channel one at a time, let it move, and only then fit its horn and
    the arm section.</p>
    <p>Build the arm around servos that are already at 90 degrees. Skip this and you will find the shoulder can
    lift 20 degrees and drop 160.</p>` },
  { h: 'Build the mechanics',
    body: `<p>Laser-cut acrylic kits, 3D printed designs and even stiff cardboard all work. What matters:
    the base servo carries everything, so it wants to be the MG996R; the shoulder works against gravity
    constantly and wants the other one.</p>
    <p>Keep the arm short. Every extra centimetre multiplies the torque the shoulder has to hold, and an arm
    that is too long simply sags and buzzes.</p>` },
  { h: 'Find the real mechanical limits by hand',
    body: `<p>Power off, move each joint gently through its travel, and note where it binds or where the arm
    hits its own frame. Convert to degrees and put them into the <code>LIMIT_MIN</code> and
    <code>LIMIT_MAX</code> arrays.</p>
    <p>A servo driven into a stop stalls, draws its full current continuously, gets hot and strips its gears.
    On an MG996R that is 2.5&nbsp;A and a smell you will remember.</p>` },
  { h: 'Set the parked pose',
    body: `<p><code>PARK[]</code> is where it goes at power-up: a pose where the arm is folded and stable, and
    where nothing is straining. The arm should be able to sit there all day without a servo getting warm.</p>` },
  { h: 'Teach it something',
    body: `<p>Drive the arm to a position, press the left stick to record it, move, record, and so on. Press the
    right stick to play. Start with four or five points - a short pick-and-place - before attempting anything
    elaborate.</p>` }
],

libraries: [
  { name: 'Adafruit PWM Servo Driver Library', by: 'Adafruit', why: 'Talks to the PCA9685. Search "Adafruit PWM Servo" in the Library Manager.' },
  { name: 'EEPROM', by: 'Arduino', how: 'Built in', why: 'Stores the recorded sequence.' }
],

code: [
{
  h: 'Centre the servos - run this before building',
  name: 'servo_centre.ino',
  code: `#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

#define SERVO_MIN_US  600
#define SERVO_MAX_US 2400

void setup() {
  Serial.begin(9600);
  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(50);                    // standard hobby servo rate
  delay(20);

  // Every channel to 90 degrees. Plug servos in one at a time.
  for (uint8_t ch = 0; ch < 4; ch++) writeAngle(ch, 90);
  Serial.println(F("all channels at 90 degrees - fit the horns now"));
}

void loop() { }

void writeAngle(uint8_t ch, int deg) {
  deg = constrain(deg, 0, 180);
  int us = map(deg, 0, 180, SERVO_MIN_US, SERVO_MAX_US);
  // The PCA9685 counts in 4096ths of a 20 ms period at 50 Hz,
  // so one tick is about 4.88 us.
  pwm.setPWM(ch, 0, us * 4096L / 20000L);
}`,
  after: `<p>Plug servos in <strong>one at a time</strong> while this runs. Four unbuilt servos all snapping to
  90 degrees at once is a big current step, and you have no arm to stop them flailing yet.</p>`
},
{
  h: 'The arm',
  name: 'robot_arm.ino',
  code: `/* ------------------------------------------------------------------
   Four-axis robot arm with teach and repeat
   PCA9685 at 0x40 on I2C. Servos on channels 0-3.
   Joystick 1: A0 base, A1 shoulder, switch D4 = record
   Joystick 2: A2 elbow, A3 gripper,  switch D5 = play/stop
   Button on D6 (hold 2 s) = clear the sequence
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <EEPROM.h>

// ---- settings --------------------------------------------------------
#define AXES         4
#define MAX_POINTS  40
#define BTN_RECORD   4
#define BTN_PLAY     5
#define BTN_CLEAR    6
#define LED_RECORD   7
#define LED_PLAY     8

#define SERVO_MIN_US  600
#define SERVO_MAX_US 2400

const uint8_t JOY_PIN[AXES] = { A0, A1, A2, A3 };
const bool    INVERT[AXES]  = { false, true, false, false };

// Measure YOUR arm. These are degrees.
const uint8_t LIMIT_MIN[AXES] = {  10,  25,  20,  35 };
const uint8_t LIMIT_MAX[AXES] = { 170, 150, 160, 110 };
const uint8_t PARK[AXES]      = {  90,  60,  90,  60 };

const int   DEAD_ZONE      = 70;     // counts either side of centre
const float MAX_DEG_PER_S  = 70;     // full-stick speed
const int   PLAY_STEP_MS   = 20;
const int   MOVE_TIME_MS   = 900;    // time between recorded points
// ----------------------------------------------------------------------

#define EE_MAGIC_ADDR 100
#define EE_COUNT_ADDR 101
#define EE_DATA_ADDR  102
#define EE_MAGIC      0x7A

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

float pos[AXES];                     // current commanded angle
int   rest[AXES];                    // joystick resting values
uint8_t seq[MAX_POINTS][AXES];
uint8_t pointCount = 0;

bool playing = false;
unsigned long lastTick = 0;
bool recWas = false, playWas = false;
unsigned long clearStart = 0;

void setup() {
  Serial.begin(9600);
  pinMode(BTN_RECORD, INPUT_PULLUP);
  pinMode(BTN_PLAY, INPUT_PULLUP);
  pinMode(BTN_CLEAR, INPUT_PULLUP);
  pinMode(LED_RECORD, OUTPUT);
  pinMode(LED_PLAY, OUTPUT);

  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(50);
  delay(20);

  // Learn where each stick sits at rest. They are never exactly 512,
  // and the error is different on every unit.
  delay(300);
  for (uint8_t a = 0; a < AXES; a++) {
    long s = 0;
    for (uint8_t i = 0; i < 48; i++) { s += analogRead(JOY_PIN[a]); delay(2); }
    rest[a] = s / 48;
  }

  loadSequence();

  // Move to the parked pose gently, not instantly.
  for (uint8_t a = 0; a < AXES; a++) pos[a] = PARK[a];
  for (uint8_t a = 0; a < AXES; a++) writeAngle(a, pos[a]);

  Serial.print(F("ready. stored points: "));
  Serial.println(pointCount);
  lastTick = millis();
}

void loop() {
  handleButtons();

  if (playing) playback();
  else         manualDrive();

  digitalWrite(LED_PLAY, playing);
  delay(12);
}

/* --- driving by hand -------------------------------------------------- */
void manualDrive() {
  unsigned long now = millis();
  float dt = (now - lastTick) / 1000.0;
  if (dt < 0.015) return;
  lastTick = now;

  for (uint8_t a = 0; a < AXES; a++) {
    int delta = analogRead(JOY_PIN[a]) - rest[a];
    float rate = rateFor(delta);
    if (INVERT[a]) rate = -rate;

    pos[a] += rate * dt;
    pos[a] = constrain(pos[a], (float)LIMIT_MIN[a], (float)LIMIT_MAX[a]);
    writeAngle(a, pos[a]);
  }
}

/* Stick deflection sets SPEED, not position. Squared, so small
   movements are fine and large ones are fast - and a stick at rest
   means a speed of zero, which removes jitter entirely. */
float rateFor(int delta) {
  if (abs(delta) <= DEAD_ZONE) return 0;
  int sign = delta > 0 ? 1 : -1;
  float d = (abs(delta) - DEAD_ZONE) / (512.0f - DEAD_ZONE);
  d = constrain(d, 0.0f, 1.0f);
  return sign * d * d * MAX_DEG_PER_S;
}

/* --- playback --------------------------------------------------------- */
void playback() {
  static uint8_t fromIdx = 0, toIdx = 1;
  static unsigned long legStart = 0;

  if (pointCount < 2) { playing = false; return; }
  if (legStart == 0) legStart = millis();

  unsigned long elapsed = millis() - legStart;
  float t = (float)elapsed / MOVE_TIME_MS;

  if (t >= 1.0) {
    t = 1.0;
    fromIdx = toIdx;
    toIdx = (toIdx + 1) % pointCount;
    legStart = millis();
  }

  // Smoothstep: slow at both ends, fast in the middle. One line, and
  // it is the whole difference between "robotic" and "deliberate".
  float e = t * t * (3.0 - 2.0 * t);

  for (uint8_t a = 0; a < AXES; a++) {
    float from = seq[fromIdx][a];
    float to   = seq[toIdx][a];
    pos[a] = from + (to - from) * e;
    writeAngle(a, pos[a]);
  }
}

/* --- recording -------------------------------------------------------- */
void recordPoint() {
  if (pointCount >= MAX_POINTS) {
    Serial.println(F("sequence full"));
    blink(LED_RECORD, 4, 80);
    return;
  }
  for (uint8_t a = 0; a < AXES; a++) seq[pointCount][a] = (uint8_t)(pos[a] + 0.5);
  pointCount++;
  saveSequence();

  Serial.print(F("recorded point "));
  Serial.print(pointCount);
  Serial.print(F(":  "));
  for (uint8_t a = 0; a < AXES; a++) {
    Serial.print(seq[pointCount - 1][a]);
    Serial.print(' ');
  }
  Serial.println();
  blink(LED_RECORD, 1, 160);
}

void clearSequence() {
  pointCount = 0;
  saveSequence();
  playing = false;
  Serial.println(F("sequence cleared"));
  blink(LED_RECORD, 3, 120);
}

/* --- storage ---------------------------------------------------------- */
void loadSequence() {
  if (EEPROM.read(EE_MAGIC_ADDR) != EE_MAGIC) { clearSequenceQuiet(); return; }
  pointCount = EEPROM.read(EE_COUNT_ADDR);
  if (pointCount > MAX_POINTS) { clearSequenceQuiet(); return; }
  for (uint8_t p = 0; p < pointCount; p++) {
    for (uint8_t a = 0; a < AXES; a++) {
      seq[p][a] = EEPROM.read(EE_DATA_ADDR + p * AXES + a);
    }
  }
}

void saveSequence() {
  EEPROM.update(EE_MAGIC_ADDR, EE_MAGIC);
  EEPROM.update(EE_COUNT_ADDR, pointCount);
  for (uint8_t p = 0; p < pointCount; p++) {
    for (uint8_t a = 0; a < AXES; a++) {
      EEPROM.update(EE_DATA_ADDR + p * AXES + a, seq[p][a]);
    }
  }
}

void clearSequenceQuiet() {
  pointCount = 0;
  EEPROM.update(EE_MAGIC_ADDR, EE_MAGIC);
  EEPROM.update(EE_COUNT_ADDR, 0);
}

/* --- buttons ---------------------------------------------------------- */
void handleButtons() {
  bool rec  = digitalRead(BTN_RECORD) == LOW;
  bool play = digitalRead(BTN_PLAY) == LOW;

  if (rec && !recWas)  { delay(25); if (digitalRead(BTN_RECORD) == LOW) recordPoint(); }
  if (play && !playWas) {
    delay(25);
    if (digitalRead(BTN_PLAY) == LOW) {
      playing = !playing;
      Serial.println(playing ? F("playing") : F("stopped"));
    }
  }
  recWas = rec;
  playWas = play;

  if (digitalRead(BTN_CLEAR) == LOW) {
    if (!clearStart) clearStart = millis();
    else if (millis() - clearStart > 2000) { clearSequence(); clearStart = 0;
      while (digitalRead(BTN_CLEAR) == LOW) { } }
  } else {
    clearStart = 0;
  }
}

/* --- output ----------------------------------------------------------- */
void writeAngle(uint8_t ch, float deg) {
  deg = constrain(deg, (float)LIMIT_MIN[ch], (float)LIMIT_MAX[ch]);
  int us = map((int)(deg * 10), 0, 1800, SERVO_MIN_US, SERVO_MAX_US);
  pwm.setPWM(ch, 0, (int)((long)us * 4096L / 20000L));
}

void blink(uint8_t pin, uint8_t times, int ms) {
  for (uint8_t i = 0; i < times; i++) {
    digitalWrite(pin, HIGH); delay(ms);
    digitalWrite(pin, LOW);  delay(ms);
  }
}`,
  after: `<p>The <code>constrain()</code> inside <code>writeAngle()</code> is deliberately belt-and-braces -
  the limits are applied when the position is calculated <em>and</em> again at the moment of output. On a
  machine that can damage itself, a limit enforced in one place is a limit that a future bug can route around.
  This is cheap insurance and it is worth the duplication.</p>`
}],

upload: `
<p>Nano, correct port. Run an I2C scanner first and confirm <code>0x40</code> appears - if it does not, nothing
else in this project will work.</p>
<p>Then the centre sketch, fit the horns, build the arm, and finally this one. Serial Monitor at 9600 prints
every recorded point so you can see exactly what it stored.</p>`,

tune: [
  { h: 'Set the limits from the actual arm',
    body: `<p>Power off, move each joint by hand, find where it binds, and set <code>LIMIT_MIN</code> and
    <code>LIMIT_MAX</code> a few degrees inside that. Do this before you let it move on its own.</p>
    <p>A stalled MG996R draws 2.5&nbsp;A and strips its gears in under a minute.</p>` },
  { h: 'Speed and feel',
    body: `<p><code>MAX_DEG_PER_S</code> at 70 is controllable. Faster feels twitchy on an arm with any reach;
    slower is better for precise placement. The squared response in <code>rateFor()</code> is what gives you
    fine control near centre and speed at the extremes.</p>` },
  { h: 'Playback timing',
    body: `<p><code>MOVE_TIME_MS</code> is how long it takes between recorded points, regardless of how far
    apart they are. That means a big move and a small move take the same time, which looks fine in practice and
    is much simpler than computing per-leg durations.</p>
    <p>If you want distance-proportional timing, scale <code>MOVE_TIME_MS</code> by the largest per-axis
    difference between the two points - about four lines.</p>` },
  { h: 'Stopping the shoulder buzzing at rest',
    body: `<p>A servo holding a load against gravity hums continuously, and that is current. Options: shorten
    the arm, counterbalance it with a weight behind the shoulder pivot, or fit a spring. Mechanical fixes beat
    electrical ones here every time.</p>
    <p>You can also call <code>pwm.setPWM(ch, 0, 4096)</code> to fully disable a channel's output when parked -
    but then it stops holding position and the arm falls, so only for a pose that is stable unpowered.</p>` },
  { h: 'Servo pulse range',
    body: `<p><code>SERVO_MIN_US</code> and <code>SERVO_MAX_US</code> at 600 and 2400 give a wide range that
    most servos handle. If yours buzzes at the extremes, it is hitting its internal stop - narrow to 700 and
    2300.</p>` }
],

trouble: [
  { q: 'Nano resets whenever servos move',
    a: `V+ and VCC are joined, or the servo supply is undersized. Measure across V+ while the arm moves - if it
    dips below about 4.6&nbsp;V, the supply or the wiring is the problem. Thick wire, big capacitor, real
    3&nbsp;A supply.` },
  { q: 'Servos twitch randomly',
    a: `Almost always power. The 1000&nbsp;&micro;F at the V+ terminal, and check the common ground is a solid
    single connection, not a chain through three jumper wires.` },
  { q: 'Nothing moves at all',
    a: `Run an I2C scanner. No 0x40 means the PCA9685 is not talking - check SDA/SCL and that VCC has
    5&nbsp;V. If it scans fine but nothing moves, V+ has no power: the chip will happily generate signals with
    no servo supply at all.` },
  { q: 'One servo buzzes and gets hot',
    a: `It is stalled against a mechanical limit, or carrying too much. Fix the limits first; if it is still
    hot, the arm is too long or too heavy for that servo.` },
  { q: 'Only about half the expected travel',
    a: `The horn was fitted with the servo off-centre. Take it off, run the centre sketch, refit.` },
  { q: 'An axis moves the wrong way',
    a: `Flip its entry in the <code>INVERT[]</code> array. Do not rewire.` },
  { q: 'The arm drifts when the sticks are released',
    a: `Dead zone too small, or the resting position was learned while you were touching a stick. Let go before
    powering up, and raise <code>DEAD_ZONE</code>.` },
  { q: 'Playback jumps instead of gliding',
    a: `The smoothstep needs enough intermediate frames. Check <code>MOVE_TIME_MS</code> is well above the loop
    period - 900&nbsp;ms against a 12&nbsp;ms loop gives about 75 steps, which is plenty.` },
  { q: 'Recorded sequence lost after power-off',
    a: `EEPROM addresses clashing with another sketch's data. The magic byte guards against garbage, but if you
    changed <code>EE_DATA_ADDR</code>, the old magic byte is still at the old address.` }
],

next: `
<ul>
  <li><strong>Add inverse kinematics</strong> so you command an (x, y, z) point and the sketch works out the
  joint angles. It is trigonometry rather than magic, and it turns a puppet into a machine.</li>
  <li><strong>Put a camera on it</strong> - an <a href="project.html?p=esp32cam-wifi-camera">ESP32-CAM</a> on
  the gripper, and you can drive it from another room.</li>
  <li><strong>Drive it from a computer</strong> over serial, so a script can generate sequences rather than you
  teaching every point by hand.</li>
  <li><strong>Sixteen channels are available.</strong> The same PCA9685 will run a hexapod's legs, a
  pan-tilt-roll head, or a whole set of animatronics - see the
  <a href="project.html?p=pan-tilt-camera">pan-tilt head</a> for a simpler two-axis version.</li>
</ul>`,

safety: `
<p>An arm with metal-gear servos can pinch hard enough to hurt and will happily swipe a mug off a desk. Three
sensible habits:</p>
<ul>
  <li><strong>Clear the area before pressing play</strong>, especially the first time a new sequence runs.</li>
  <li><strong>Keep the power switch within reach</strong>, and know where it is without looking. The PCA9685's
  OE pin wired to a button is an even better panic stop.</li>
  <li><strong>Do not let children operate the gripper</strong> unsupervised - an MG996R closing on a finger is
  more force than you would expect from something this small.</li>
</ul>`
});
