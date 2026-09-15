/* Two servos, a joystick, and an ESP32-CAM you can aim from a browser. */
AB.addProject({
slug: 'pan-tilt-camera',
title: 'Pan-tilt camera head',
cat: 'robotics',
level: 2,
time: '2 hours',
solder: true,
board: 'Nano',
tags: ['servo', 'joystick', 'pan tilt', 'esp32cam', 'smoothing', 'sweep'],
blurb: 'Two servos on a bracket, a thumbstick to aim them, and an automatic patrol mode. Put a camera on it and you have a $20 PTZ.',

skills: ['Servo control', 'Analog joysticks', 'Dead zones and smoothing', 'Separate servo supplies', 'Mechanical limits'],

intro: `
<p>A pan-tilt head is the most useful mechanical thing you can build for twenty dollars. Put a camera on it and
you can look around a room; put a laser or a light on it and you have a follow-spot; put a sensor on it and
you can scan.</p>
<p>It is also the clearest possible lesson in why servos need their own power supply. An SG90 pulls
700&nbsp;mA when it stalls, and two of them moving at once will reset an Arduino every single time if they are
sharing its 5&nbsp;V pin. That is the content of this project as much as the servos are.</p>`,

what: [
  'Aim two servos from an analog thumbstick, smoothly, with no jitter when you let go.',
  'Stop at software limits so the bracket never drives itself into its own end stops.',
  'Switch to an automatic patrol that sweeps slowly across a settable arc.',
  'Centre instantly on a button press.',
  'Carry an ESP32-CAM, a small light, or a sensor.'
],

how: `
<p>A <strong>hobby servo</strong> is not controlled by voltage. It expects a pulse every 20&nbsp;ms, and the
<em>width</em> of that pulse sets the angle: roughly 1000&nbsp;&micro;s for one extreme, 1500 for centre, 2000
for the other. Inside, a potentiometer on the output shaft tells a small controller where it actually is, and
it drives the motor until the two agree. That feedback loop is why a servo holds position against a force -
and why it draws current continuously when something pushes back.</p>
<p>The <code>Servo</code> library generates those pulses on a hardware timer, so your code just calls
<code>write(angle)</code>.</p>
<p><strong>The joystick</strong> is two potentiometers at right angles plus a push switch. Each gives 0-1023
with about 512 at centre - but never exactly 512, and never exactly the same twice. That is why the sketch
measures the resting position at boot and applies a dead zone around it. Without a dead zone the head creeps
constantly, which looks like a fault and is really just an honest reading of a cheap potentiometer.</p>
<p><strong>Rate control, not position control,</strong> is the other important choice. Mapping the stick
directly to an angle means the head snaps and jitters. Using the stick's deflection as a <em>speed</em> - push
right, it pans right at a rate proportional to how far you push - feels immediately natural and removes jitter
entirely, because a stick at rest means a speed of zero.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'sg90', qty: 2, note: 'Two SG90s are fine for a camera. For anything heavier use MG996R metal-gear servos and a bigger supply.' },
  { id: 'pantilt', qty: 1, note: 'The two-servo bracket kit. Includes the plastic parts, screws and usually the horns.' },
  { id: 'joystick', qty: 1 },
  { id: 'psu5v3a', qty: 1, note: 'For the servos. This is the point of the project - they get their own supply.' },
  { id: 'cap1000', qty: 1, note: 'Across the servo supply, right at the servos.' },
  { id: 'button', qty: 1, note: 'Or just use the joystick\'s own push switch, which the sketch reads.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'esp32cam', qty: 1, own: true, note: 'Optional payload. See the Wi-Fi camera project for that half.' }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm' }, { id: 'strippers' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',     at: [0, 0] },
    { id: 'pan',  comp: 'servo',    at: [-64, -46], ry: 90 },
    { id: 'tilt', comp: 'servo',    at: [-64, -96], ry: 90 },
    { id: 'joy',  comp: 'joystick', at: [50, -48], ry: 180 },
    { id: 'psu',  comp: 'block',    at: [0, 62], opt: { w: 70, h: 24, d: 44, c: '#2b2f34' }, label: '5 V servo supply' }
  ],
  wires: [
    { from: 'psu.n',    to: 'pan.VCC',   color: 'red',    note: 'Servo supply straight to the servos, NOT through the Nano' },
    { from: 'psu.l',    to: 'pan.GND',   color: 'black',  note: 'Servo supply negative' },
    { from: 'psu.r',    to: 'tilt.VCC',  color: 'red',    note: 'Same supply for the second servo' },
    { from: 'psu.f',    to: 'nano.GND',  color: 'black',  note: 'COMMON GROUND between the servo supply and the Nano' },
    { from: 'pan.SIG',  to: 'nano.D9',   color: 'orange', note: 'Pan servo signal' },
    { from: 'tilt.SIG', to: 'nano.D10',  color: 'yellow', note: 'Tilt servo signal' },
    { from: 'tilt.GND', to: 'nano.GND2', color: 'black',  note: 'Tilt servo ground, joined to the common ground' },
    { from: 'joy.VCC',  to: 'nano.5V',   color: 'red',    note: 'Joystick power from the Nano is fine - it draws microamps' },
    { from: 'joy.GND',  to: 'nano.GND2', color: 'black',  note: 'Joystick ground' },
    { from: 'joy.VRx',  to: 'nano.A0',   color: 'blue',   note: 'Pan axis' },
    { from: 'joy.VRy',  to: 'nano.A1',   color: 'green',  note: 'Tilt axis' },
    { from: 'joy.SW',   to: 'nano.D2',   color: 'purple', note: 'The stick\'s push switch - centres the head' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Servos do not share the Arduino's 5 V. Ever.</span>
<p>An SG90 is specified at about 150&nbsp;mA moving and 700&nbsp;mA stalled. Two of them starting at once is
well over an amp, in a step. The Uno's regulator gives about 450&nbsp;mA, and the USB port behind it about 500.
The result is a board that resets every time you move the stick.</p>
<p>Give them their own 5&nbsp;V supply, and join <strong>only the grounds</strong> between the two systems. The
signal wire from the Nano then has a meaningful reference and everything works.</p></div>

<div class="note warn"><span class="t">The 1000 uF capacitor is doing real work here</span>
<p>Across the servo supply's 5&nbsp;V and ground, physically at the servos rather than at the supply. A servo
starting is a sharp current step, and the wire between the supply and the servo has enough inductance to make
that step into a voltage dip. The capacitor is a local reservoir.</p>
<p>Symptom of not fitting it: the servos twitch when the other one moves.</p></div>

<div class="note tip"><span class="t">Servo wire colours</span>
<p>Almost universally: <strong>brown or black = ground, red = power, orange or yellow = signal</strong>. The
ground is always on the edge of the connector, next to the case. If in doubt, ground is the one that beeps to
the servo's metal gear housing on a continuity test - though on an all-plastic SG90 that trick does not
help.</p></div>`,

solderSteps: [
  { h: 'Servo sockets, not soldered leads',
    body: `<p>Solder two 3-pin male headers to the perfboard so the servo plugs push straight on. Servos get
    swapped, and a servo soldered in permanently is a servo you will curse.</p>
    <p>Mark which row is signal with a dot of paint or a marker - plugging one on backwards puts 5&nbsp;V on the
    signal pin, which usually survives and is not worth risking.</p>` },
  { h: 'Power distribution: two separate rails',
    body: `<p>One screw terminal for the servo supply, one for the Nano supply (or just use USB for the Nano
    while you build). The two <strong>grounds join at one point</strong> on the board - a single link between
    the two ground rails.</p>
    <p>Do not join the two 5&nbsp;V rails. That is the whole design.</p>` },
  { h: 'Capacitor at the servo end',
    body: `<p>1000&nbsp;&micro;F across the servo rail, stripe to ground, as close to the servo headers as
    physically possible.</p>` },
  { h: 'Joystick on a five-wire loom',
    body: `<p>150&nbsp;mm, twisted. The two analog lines are the only sensitive ones and they are slow, so this
    is forgiving.</p>` },
  { h: 'Check before the servos go on the bracket',
    body: `<p>Servo 5&nbsp;V to servo ground: no beep. Nano 5&nbsp;V to servo 5&nbsp;V: <strong>no beep</strong>
    - if that beeps, you have joined the rails. Nano ground to servo ground: beep.</p>` }
],

assembly: [
  { h: 'Centre both servos BEFORE you build the bracket',
    body: `<p>This is the step that determines whether the finished head has its full range or half of it.</p>
    <p>Upload a sketch that does nothing but <code>servo.write(90)</code>, plug each servo in, and let it move.
    Only then push the horn on and assemble the bracket around it, with the arm in the middle of its travel.</p>
    <p>Skip this and you will find the head can look 20&nbsp;degrees left and 160 right.</p>` },
  { h: 'Build the bracket',
    body: `<p>The kits vary but the pattern is the same: the pan servo is the base, its horn drives a platform,
    and the tilt servo sits on that platform. Screw the horns on with the small self-tappers included - they cut
    their own thread into the plastic horn, so do not over-tighten.</p>` },
  { h: 'Find the real mechanical limits by hand',
    body: `<p>With power off, move the bracket gently by hand through its travel and note where it binds.
    Convert to angles and put them into <code>PAN_MIN</code>, <code>PAN_MAX</code> and so on.</p>
    <p>A servo driven into a mechanical stop stalls, draws its full 700&nbsp;mA continuously, gets hot and
    strips its nylon gears. The software limits are not a nicety.</p>` },
  { h: 'Fit the payload and re-check balance',
    body: `<p>An ESP32-CAM weighs almost nothing and an SG90 handles it easily. Anything heavier and the tilt
    servo will buzz continuously trying to hold position - that buzzing is it drawing current, and it will not
    stop until you counterbalance or upgrade the servo.</p>` },
  { h: 'Route the payload cable through the axis',
    body: `<p>Leave a generous service loop so panning does not pull on the camera. A cable that tightens at one
    end of the sweep will eventually pull a connector off.</p>` }
],

libraries: [
  { name: 'Servo', by: 'Arduino', how: 'Built in', why: 'Generates the pulse train on a hardware timer.' }
],

code: [
{
  h: 'Centre the servos - run this before assembling',
  name: 'servo_centre.ino',
  code: `#include <Servo.h>

Servo pan, tilt;

void setup() {
  pan.attach(9);
  tilt.attach(10);
  pan.write(90);
  tilt.write(90);
}

void loop() { }`,
  after: `<p>Leave it running, plug each servo in, let it settle, then push the horn on so the bracket sits in
  the middle of its travel. Thirty seconds now saves an hour later.</p>`
},
{
  h: 'The pan-tilt head',
  name: 'pan_tilt.ino',
  code: `/* ------------------------------------------------------------------
   Pan-tilt camera head
   Servos on D9 (pan) and D10 (tilt), joystick on A0/A1 with its
   switch on D2.

   Stick position controls SPEED, not angle - which is what makes it
   feel natural and removes jitter entirely.
   ------------------------------------------------------------------ */

#include <Servo.h>

// ---- pins ------------------------------------------------------------
#define PAN_PIN    9
#define TILT_PIN  10
#define JOY_X     A0
#define JOY_Y     A1
#define JOY_SW     2

// ---- mechanical limits - measure YOUR bracket ------------------------
const int PAN_MIN  = 15,  PAN_MAX  = 165;
const int TILT_MIN = 40,  TILT_MAX = 150;

// ---- feel ------------------------------------------------------------
const int   DEAD_ZONE   = 60;      // counts either side of centre
const float MAX_DEG_PER_SEC = 90;  // how fast a fully-deflected stick moves
const bool  INVERT_TILT = false;   // true for "aircraft" style
const unsigned long PATROL_AFTER = 25000UL;  // idle this long, start sweeping
// ----------------------------------------------------------------------

Servo pan, tilt;

float panAngle = 90, tiltAngle = 90;
int restX = 512, restY = 512;
unsigned long lastMove = 0, lastTick = 0;
bool patrolling = false;
int patrolDir = 1;
bool swWasDown = false;

void setup() {
  Serial.begin(9600);
  pinMode(JOY_SW, INPUT_PULLUP);

  pan.attach(PAN_PIN);
  tilt.attach(TILT_PIN);
  pan.write((int)panAngle);
  tilt.write((int)tiltAngle);

  // Learn where this particular stick sits at rest. They are never
  // exactly 512, and the error is different on every unit.
  delay(300);
  long sx = 0, sy = 0;
  for (int i = 0; i < 64; i++) { sx += analogRead(JOY_X); sy += analogRead(JOY_Y); delay(3); }
  restX = sx / 64;
  restY = sy / 64;
  Serial.print(F("rest "));
  Serial.print(restX);
  Serial.print(' ');
  Serial.println(restY);

  lastTick = millis();
  lastMove = millis();
}

void loop() {
  unsigned long now = millis();
  float dt = (now - lastTick) / 1000.0;
  if (dt < 0.02) return;                    // 50 Hz is plenty for a servo
  lastTick = now;

  handleButton();

  int dx = analogRead(JOY_X) - restX;
  int dy = analogRead(JOY_Y) - restY;

  bool moving = (abs(dx) > DEAD_ZONE) || (abs(dy) > DEAD_ZONE);

  if (moving) {
    patrolling = false;
    lastMove = now;

    panAngle  += rate(dx) * dt;
    float ty = rate(dy) * dt;
    tiltAngle += INVERT_TILT ? -ty : ty;

  } else if (now - lastMove > PATROL_AFTER) {
    if (!patrolling) { patrolling = true; Serial.println(F("patrol")); }
    panAngle += patrolDir * 12.0 * dt;      // slow sweep
    if (panAngle >= PAN_MAX - 2) patrolDir = -1;
    if (panAngle <= PAN_MIN + 2) patrolDir = 1;
  }

  panAngle  = constrain(panAngle,  (float)PAN_MIN,  (float)PAN_MAX);
  tiltAngle = constrain(tiltAngle, (float)TILT_MIN, (float)TILT_MAX);

  pan.write((int)(panAngle + 0.5));
  tilt.write((int)(tiltAngle + 0.5));
}

/* Deflection beyond the dead zone becomes degrees per second, squared
   so that small movements are fine and large ones are fast. */
float rate(int delta) {
  if (abs(delta) <= DEAD_ZONE) return 0;

  int sign = delta > 0 ? 1 : -1;
  float d = (abs(delta) - DEAD_ZONE) / (512.0f - DEAD_ZONE);
  d = constrain(d, 0.0f, 1.0f);
  return sign * d * d * MAX_DEG_PER_SEC;
}

void handleButton() {
  bool down = digitalRead(JOY_SW) == LOW;
  if (down && !swWasDown) {
    delay(25);
    if (digitalRead(JOY_SW) == LOW) {
      panAngle = 90;
      tiltAngle = 90;
      patrolling = false;
      lastMove = millis();
      Serial.println(F("centred"));
    }
  }
  swWasDown = down;
}`,
  after: `<p>The <code>d * d</code> in <code>rate()</code> is the detail that makes it feel good. A linear
  response means either the head is too slow for big moves or too twitchy for small ones. Squaring gives fine
  control near the centre and full speed at the extremes, which is how every decent gimbal controller behaves.</p>`
}],

upload: `<p>Nano, correct port. Servos powered from their own supply, Nano on USB while you test. Watch the
Serial Monitor for the measured rest position.</p>`,

tune: [
  { h: 'Set the limits from the actual bracket',
    body: `<p>Power off, move it by hand, find where it binds, and set the four constants a few degrees inside
    that. A servo pressed against a stop is a servo cooking itself.</p>` },
  { h: 'Dead zone',
    body: `<p>If the head creeps with the stick released, increase <code>DEAD_ZONE</code>. If it feels
    unresponsive, decrease it. 40 to 80 covers most sticks.</p>` },
  { h: 'Speed',
    body: `<p><code>MAX_DEG_PER_SEC</code> at 90 is brisk. For camera work 40 feels much more controlled; for a
    scanning sensor, 150 is fine.</p>` },
  { h: 'If an axis works backwards',
    body: `<p>Negate it: <code>panAngle -= rate(dx) * dt;</code>, or set <code>INVERT_TILT</code>. Do not
    rewire.</p>` },
  { h: 'Stopping servo buzz at rest',
    body: `<p>A servo that hums while holding is fighting a load. Either counterbalance the payload, or call
    <code>pan.detach()</code> after a few seconds of no movement and <code>attach()</code> again when the stick
    moves. Detached, it draws almost nothing - but it also stops holding position, so it is only right for a
    light payload.</p>` }
],

trouble: [
  { q: 'Nano resets whenever a servo moves',
    a: `Shared supply. Give the servos their own 5&nbsp;V and join only the grounds. This is the single most
    common failure of this build and no amount of code will fix it.` },
  { q: 'Servos twitch continuously',
    a: `Missing capacitor, a bad ground connection, or a signal wire running alongside the power leads. Take
    them in that order.` },
  { q: 'Head creeps when the stick is released',
    a: `Dead zone too small, or the rest position was measured while you were touching the stick. Let go before
    powering up.` },
  { q: 'Only about 90 degrees of movement',
    a: `The horn was fitted with the servo off-centre. Take the horn off, centre the servo with the test
    sketch, and refit.` },
  { q: 'A servo buzzes and gets hot',
    a: `It is stalled - driven into a mechanical limit, or carrying too much weight. Set the software limits
    properly and check the payload.` },
  { q: 'One servo does not move at all',
    a: `Swap the two plugs. If the fault follows the servo, the servo is dead; if it stays with the channel,
    check that pin and its solder joint.` },
  { q: 'Both axes respond to one stick direction',
    a: `VRx and VRy are on the same pin, or one analog wire is not connected and is floating. Print both raw
    values and move the stick one axis at a time.` },
  { q: 'Movement is jerky in steps',
    a: `<code>Servo.write()</code> takes whole degrees, so 1-degree steps are the floor. For smoother motion
    use <code>writeMicroseconds()</code>, which gives roughly ten times the resolution.` }
],

next: `
<ul>
  <li><strong>Put an <a href="project.html?p=esp32cam-wifi-camera">ESP32-CAM</a> on it</strong> and add two
  more URLs to that sketch, so you can pan and tilt from the same browser page.</li>
  <li><strong>Make it track</strong>: an ultrasonic or time-of-flight sensor on the head plus a scan-and-follow
  loop, and it will keep pointing at the nearest moving thing.</li>
  <li><strong>Control it over Wi-Fi</strong> with an ESP32 instead of a joystick, and drive it from a phone.</li>
  <li><strong>Add a third axis</strong> with a PCA9685 driver, which also solves the power problem properly
  because it has its own servo power input.</li>
</ul>`
});
