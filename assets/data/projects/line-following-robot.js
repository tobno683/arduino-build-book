/* Line follower with a 3-channel IR array and proportional steering. */
AB.addProject({
slug: 'line-following-robot',
title: 'Line-following robot',
cat: 'robotics',
level: 3,
time: '3 hours',
solder: true,
board: 'Nano',
tags: ['tcrt5000', 'line follower', 'l298n', 'pid', 'proportional', 'robot'],
blurb: 'Follows a black line at speed, corners without falling off, and finds the line again when it loses it. The first project where control theory earns its keep.',

skills: ['Reflectance sensors', 'Calibration', 'Proportional control', 'Differential steering', 'Recovery behaviour'],

intro: `
<p>A line follower with three sensors and <code>if</code> statements works at walking pace and falls off every
corner above that. The reason is that bang-bang control - full left, full right, nothing in between - always
overshoots, and overshoot at speed means leaving the line.</p>
<p>The fix is <strong>proportional</strong> control: measure <em>how far off</em> the line you are, and correct
by an amount proportional to that error. It is about fifteen lines of code and it roughly triples the speed at
which the thing still works. This project is really about that idea; the robot is the excuse.</p>`,

what: [
  'Follow a 20 mm black line on a pale floor at a settable speed.',
  'Steer proportionally, so small deviations get small corrections and the robot stops weaving.',
  'Calibrate itself on your actual tape and floor at startup, rather than using hard-coded thresholds.',
  'Remember which way the line went when it loses it, and sweep that way to find it again.',
  'Stop cleanly at a finish marker - a broad band of black across the track.'
],

how: `
<p>A <strong>TCRT5000</strong> is an infrared LED and a phototransistor side by side. The LED shines down, and
how much comes back depends on what is underneath: white paper reflects a lot, black tape reflects almost
nothing. The module gives you an analog voltage, and the three-channel boards give you three.</p>
<p><strong>The error term</strong> is the whole trick. With sensors left, centre and right, compute a weighted
position: multiply each reading by its offset (&minus;1, 0, +1), divide by the total, and you get a number from
&minus;1 to +1 that says where the line is under the robot. Zero is centred. That is a continuous measure, not
three discrete cases, and it is what makes proportional steering possible.</p>
<p>Then <code>correction = Kp * error</code>, and you add it to one motor and subtract it from the other. One
constant to tune, and the behaviour changes completely as you turn it.</p>
<p><strong>Calibration matters more than the code.</strong> Black electrical tape on white paper gives a huge
difference; black tape on a grey office carpet gives almost none. Reading the actual minimum and maximum at
startup, on the actual surface, is the difference between a robot that works in your kitchen and one that only
worked in somebody's video.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'car-chassis', qty: 1, note: 'The 2WD acrylic kit. Two TT motors, wheels, castor, battery box.' },
  { id: 'l298n', qty: 1, note: 'Or a TB6612FNG, which wastes less of the battery.' },
  { id: 'linesensor', qty: 1, note: 'A 3-channel TCRT5000 array with analog outputs. The digital-only boards with one pot per channel are harder to calibrate well.' },
  { id: 'batt-aa6', qty: 1, note: 'Or a 2S LiPo. Six AA cells give 9 V.' },
  { id: 'switch', qty: 1 },
  { id: 'button', qty: 1, note: 'Start/stop, and it triggers the calibration sweep.' },
  { id: 'led5', qty: 1, note: 'Shows calibration and running state.' },
  { id: 'res220', qty: 1 },
  { id: 'cap1000', qty: 1 },
  { id: 'cap100n', qty: 2, note: 'One across each motor, for noise suppression.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'standoffs', qty: 1, note: 'To hold the sensor array at a fixed height.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'zip', qty: 1 }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'cutters' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',       at: [0, 0] },
    { id: 'drv',  comp: 'l298n',      at: [0, 72], ry: 180 },
    { id: 'arr',  comp: 'linesensor', at: [0, -62], ry: 180 },
    { id: 'ml',   comp: 'ttmotor',    at: [-92, 30], ry: 180 },
    { id: 'mr',   comp: 'ttmotor',    at: [-92, 106] },
    { id: 'btn',  comp: 'button',     at: [54, -20] }
  ],
  wires: [
    { from: 'arr.VCC', to: 'nano.5V',   color: 'red',    note: 'Sensor array power' },
    { from: 'arr.GND', to: 'nano.GND',  color: 'black',  note: 'Sensor array ground' },
    { from: 'arr.L',   to: 'nano.A0',   color: 'blue',   note: 'Left sensor, analog' },
    { from: 'arr.C',   to: 'nano.A1',   color: 'green',  note: 'Centre sensor, analog' },
    { from: 'arr.R',   to: 'nano.A2',   color: 'yellow', note: 'Right sensor, analog' },
    { from: 'drv.ENA', to: 'nano.D5',   color: 'orange', note: 'Left speed, PWM' },
    { from: 'drv.IN1', to: 'nano.D7',   color: 'white',  note: 'Left direction A' },
    { from: 'drv.IN2', to: 'nano.D8',   color: 'white',  note: 'Left direction B' },
    { from: 'drv.IN3', to: 'nano.D9',   color: 'grey',   note: 'Right direction A' },
    { from: 'drv.IN4', to: 'nano.D11',  color: 'grey',   note: 'Right direction B' },
    { from: 'drv.ENB', to: 'nano.D6',   color: 'orange', note: 'Right speed, PWM' },
    { from: 'drv.5V',  to: 'nano.VIN',  color: 'red',    note: 'The driver regulator powers the Nano' },
    { from: 'drv.GND', to: 'nano.GND2', color: 'black',  note: 'COMMON GROUND' },
    { from: 'drv.OUT1', to: 'ml.+',     color: 'brown',  note: 'Left motor' },
    { from: 'drv.OUT2', to: 'ml.-',     color: 'brown',  note: 'Left motor' },
    { from: 'drv.OUT3', to: 'mr.+',     color: 'brown',  note: 'Right motor' },
    { from: 'drv.OUT4', to: 'mr.-',     color: 'brown',  note: 'Right motor' },
    { from: 'btn.1A',  to: 'nano.D2',   color: 'purple', note: 'Start / stop, internal pull-up' },
    { from: 'btn.2A',  to: 'nano.GND2', color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">Sensor height is a mechanical setting, not a code one</span>
<p>TCRT5000s want to be <strong>3 to 8&nbsp;mm above the floor</strong>. Too high and the contrast collapses;
too low and they saturate and see nothing but their own glow.</p>
<p>Mount the array on nylon standoffs at the front of the chassis, ahead of the wheels, and get this right
before you write a line of code. It is the single biggest determinant of how well the robot works.</p></div>

<div class="note warn"><span class="t">Motor noise into analog inputs</span>
<p>Brushed motors put a lot of electrical hash on the supply, and the sensor array is feeding analog values
into the same board. Fit a 100&nbsp;nF capacitor across each motor's terminals, and route the sensor cable away
from the motor leads.</p>
<p>The symptom of skipping this is a robot that follows the line beautifully with the motors off and wanders
randomly with them on.</p></div>

<div class="note tip"><span class="t">Analog, not digital</span>
<p>Many sensor arrays have both an analog output and a digital one with a comparator and a trimmer pot. Use the
analog outputs. The digital ones throw away exactly the information - <em>how much</em> line is under each
sensor - that proportional control needs.</p></div>`,

solderSteps: [
  { h: 'Motor leads and suppression capacitors, before assembly',
    body: `<p>Red and black to each motor, 150&nbsp;mm. Then solder a 100&nbsp;nF ceramic directly across the
    two tabs of each motor.</p>
    <p>Do this while the motors are loose. Reaching a motor tab inside an assembled chassis is miserable, and
    the capacitors are what make the analog readings usable.</p>` },
  { h: 'Sleeve and route',
    body: `<p>Heat-shrink over each motor joint. Cable-tie the leads along the chassis, away from where the
    sensor cable will run.</p>` },
  { h: 'Main switch in the battery positive',
    body: `<p>Cut the pack's red lead, solder both ends to the switch, sleeve. You will use it constantly while
    tuning.</p>` },
  { h: 'Sensor array on a short cable, straight to the Nano',
    body: `<p>Five wires, as short as the geometry allows, twisted. Keep them on the opposite side of the
    chassis from the motor leads.</p>` },
  { h: 'Perfboard with sockets',
    body: `<p>Nano socket, a 5-pin socket for the sensor cable, a header for the button. The 1000&nbsp;&micro;F
    across the 5&nbsp;V rail.</p>` },
  { h: 'Check directions before the first run',
    body: `<p>Wheels off the ground, motors powered. Run the test sketch and confirm each motor turns forwards
    when told to. Fix any that is backwards in the code, not by unsoldering.</p>` }
],

assembly: [
  { h: 'Make a track first',
    body: `<p>19&nbsp;mm black electrical tape on white paper or a pale hard floor. Lay a loop with gentle
    curves - a radius of at least 200&nbsp;mm - and no corners sharper than about 90&nbsp;degrees.</p>
    <p>Tight corners are a tuning problem, not a starting point. Add them once it works.</p>` },
  { h: 'Set the sensor height',
    body: `<p>5&nbsp;mm is a good default. Put the robot on the line, unpowered, and check all three sensors
    clear the floor evenly - a tilted array reads one side permanently darker and the robot drifts.</p>` },
  { h: 'Calibrate on the actual track',
    body: `<p>Press the button and sweep the robot slowly side to side across the line for a few seconds, so
    every sensor sees both black and white. The LED flashes during calibration and goes solid when done.</p>
    <p>Recalibrate whenever you change floor, tape or lighting. It takes five seconds.</p>` },
  { h: 'Start slow and tune Kp',
    body: `<p><code>BASE_SPEED</code> at 90 and <code>KP</code> at 60 is a safe starting point. Get it following
    reliably, then raise the speed until it starts to weave, then raise Kp until it stops. Repeat.</p>` },
  { h: 'Then make the track harder',
    body: `<p>Tighter corners, a crossing, a gap. Each one will expose a different limitation, which is the fun
    of it.</p>` }
],

libraries: [],

code: [
{
  h: 'Sensor test - run this first',
  name: 'line_sensor_test.ino',
  intro: `<p>Open the Serial Plotter and move the robot across the line by hand. You want three traces that
  separate clearly.</p>`,
  code: `void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.print(analogRead(A0)); Serial.print(' ');
  Serial.print(analogRead(A1)); Serial.print(' ');
  Serial.println(analogRead(A2));
  delay(40);
}`,
  after: `<p>On white you should read one extreme, on black the other, with at least 300 counts between them. If
  the gap is under 150, adjust the sensor height before doing anything else - no amount of code fixes a sensor
  that cannot see the line.</p>
  <p>Note that on most TCRT5000 boards, <strong>black reads higher</strong> (less reflection means the
  phototransistor conducts less). The sketch below normalises this automatically, so it does not matter which
  way round yours behaves.</p>`
},
{
  h: 'The line follower',
  name: 'line_follower.ino',
  code: `/* ------------------------------------------------------------------
   Line-following robot
   3-channel analog sensor array on A0-A2, L298N on D5-D11,
   button on D2, status LED on D3.

   Proportional steering with runtime calibration.
   ------------------------------------------------------------------ */

// ---- pins ------------------------------------------------------------
#define S_LEFT   A0
#define S_MID    A1
#define S_RIGHT  A2
#define ENA  5
#define IN1  7
#define IN2  8
#define IN3  9
#define IN4 11
#define ENB  6
#define BUTTON  2
#define LED     3

// ---- tuning ----------------------------------------------------------
int   BASE_SPEED = 90;      // 0-255. TT motors will not start below ~85
float KP         = 60.0;    // how hard it corrects. THE number to tune
float KD         = 25.0;    // damping - set to 0 to see why it helps
#define MAX_SPEED       200
#define LOST_MS         220  // no line for this long -> start searching
#define FINISH_MS       120  // all three dark for this long -> stop
// ----------------------------------------------------------------------

int minVal[3] = { 1023, 1023, 1023 };
int maxVal[3] = { 0, 0, 0 };
bool calibrated = false;
bool running = false;

float lastError = 0;
int lastDirection = 1;              // which way the line went last
unsigned long lostSince = 0, darkSince = 0;
bool wasDown = false;

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  stop();
  Serial.println(F("press the button to calibrate"));
}

void loop() {
  handleButton();

  if (!running) { stop(); digitalWrite(LED, calibrated); return; }

  float n[3];
  readNormalised(n);

  // All three dark = a finish band across the track.
  if (n[0] > 0.7 && n[1] > 0.7 && n[2] > 0.7) {
    if (!darkSince) darkSince = millis();
    if (millis() - darkSince > FINISH_MS) {
      Serial.println(F("finish"));
      running = false;
      stop();
      celebrate();
      return;
    }
  } else {
    darkSince = 0;
  }

  float total = n[0] + n[1] + n[2];

  if (total < 0.25) {                       // nothing under any sensor
    if (!lostSince) lostSince = millis();
    if (millis() - lostSince > LOST_MS) { search(); return; }
  } else {
    lostSince = 0;

    // Weighted position: -1 is hard left, +1 is hard right.
    float error = (-1.0 * n[0] + 0.0 * n[1] + 1.0 * n[2]) / total;

    // Remember which way it was heading, for the search behaviour.
    if (error < -0.35) lastDirection = -1;
    if (error >  0.35) lastDirection =  1;

    float derivative = error - lastError;
    lastError = error;

    float correction = KP * error + KD * derivative;

    int left  = BASE_SPEED + (int)correction;
    int right = BASE_SPEED - (int)correction;

    drive(constrain(left, -MAX_SPEED, MAX_SPEED),
          constrain(right, -MAX_SPEED, MAX_SPEED));
  }

  delay(4);                                  // ~200 corrections a second
}

/* --- sensors ---------------------------------------------------------- */
/* Returns 0.0 (no line) to 1.0 (fully on the line) per sensor, using the
   calibration, and handling either polarity of sensor board. */
void readNormalised(float* out) {
  int raw[3] = { analogRead(S_LEFT), analogRead(S_MID), analogRead(S_RIGHT) };

  for (int i = 0; i < 3; i++) {
    int lo = minVal[i], hi = maxVal[i];
    if (hi - lo < 40) { out[i] = 0; continue; }       // not calibrated
    float v = (float)(raw[i] - lo) / (float)(hi - lo);
    out[i] = constrain(v, 0.0f, 1.0f);
  }
}

void calibrate() {
  Serial.println(F("sweep the robot across the line for 5 seconds"));
  for (int i = 0; i < 3; i++) { minVal[i] = 1023; maxVal[i] = 0; }

  unsigned long t0 = millis();
  while (millis() - t0 < 5000) {
    int raw[3] = { analogRead(S_LEFT), analogRead(S_MID), analogRead(S_RIGHT) };
    for (int i = 0; i < 3; i++) {
      if (raw[i] < minVal[i]) minVal[i] = raw[i];
      if (raw[i] > maxVal[i]) maxVal[i] = raw[i];
    }
    digitalWrite(LED, (millis() / 120) % 2);
    delay(6);
  }
  digitalWrite(LED, HIGH);

  for (int i = 0; i < 3; i++) {
    Serial.print(F("sensor "));
    Serial.print(i);
    Serial.print(F(": "));
    Serial.print(minVal[i]);
    Serial.print(F(" - "));
    Serial.println(maxVal[i]);
    if (maxVal[i] - minVal[i] < 150) {
      Serial.println(F("  WEAK CONTRAST - check the sensor height"));
    }
  }
  calibrated = true;
  Serial.println(F("press again to run"));
}

/* --- recovery --------------------------------------------------------- */
void search() {
  // Spin the way the line was last seen going. Widening sweeps would be
  // fancier; this catches almost everything and is three lines.
  Serial.println(F("lost - searching"));
  drive(lastDirection * 120, lastDirection * -120);
  delay(60);

  float n[3];
  readNormalised(n);
  if (n[0] + n[1] + n[2] > 0.4) {
    lostSince = 0;
    Serial.println(F("found"));
  }
}

/* --- motors ----------------------------------------------------------- */
void drive(int left, int right) {
  if (left >= 0) { digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); }
  else           { digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH); left = -left; }

  if (right >= 0) { digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW); }
  else            { digitalWrite(IN3, LOW);  digitalWrite(IN4, HIGH); right = -right; }

  analogWrite(ENA, constrain(left, 0, 255));
  analogWrite(ENB, constrain(right, 0, 255));
}

void stop() {
  analogWrite(ENA, 0); analogWrite(ENB, 0);
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}

/* --- button ----------------------------------------------------------- */
void handleButton() {
  bool down = digitalRead(BUTTON) == LOW;
  if (down && !wasDown) {
    delay(30);
    if (digitalRead(BUTTON) != LOW) { wasDown = down; return; }

    if (!calibrated) {
      delay(700);                 // time to put it down and take your hand away
      calibrate();
    } else {
      running = !running;
      Serial.println(running ? F("running") : F("stopped"));
      if (!running) stop();
      lastError = 0;
      lostSince = 0;
    }
  }
  wasDown = down;
}

void celebrate() {
  for (int i = 0; i < 6; i++) {
    digitalWrite(LED, HIGH); delay(90);
    digitalWrite(LED, LOW);  delay(90);
  }
}`,
  after: `<p>The <code>KD</code> term is worth understanding, because it is the difference between a robot that
  weaves and one that tracks. Proportional alone always overshoots: by the time the error is zero the robot is
  still turning, so it crosses over and has to come back. The derivative term looks at how fast the error is
  <em>changing</em> and pushes back against the swing, which damps it out.</p>
  <p>Set <code>KD</code> to 0 and watch the robot snake down a straight line. Then put it back. That five-second
  experiment teaches PD control better than any explanation.</p>`
}],

upload: `
<p>Nano, correct port. If the upload times out, try
<strong>Tools &rarr; Processor &rarr; ATmega328P (Old Bootloader)</strong>.</p>
<p>First press of the button calibrates - sweep the robot across the line while the LED flashes. Second press
starts it. Press again to stop.</p>
<div class="note warn"><span class="t">Unplug USB before running on battery</span>
<p>Two supplies in parallel. It usually survives; it is still a bad habit.</p></div>`,

tune: [
  { h: 'Tune KP first, with KD at zero',
    body: `<p>Raise <code>KP</code> until the robot follows a gentle curve without falling off, then keep raising
    it until it starts to oscillate visibly. Back off about 30&nbsp;%.</p>
    <p>Too low: it drifts off on corners. Too high: it snakes violently down a straight line.</p>` },
  { h: 'Then add KD',
    body: `<p>Raise <code>KD</code> until the oscillation damps out. Typically somewhere between a third and a
    half of <code>KP</code>. Too much and the steering becomes sluggish and twitchy at the same time.</p>` },
  { h: 'Then raise the speed, and retune',
    body: `<p>Speed and gains interact - a tuning that works at 90 will oscillate at 160. Raise
    <code>BASE_SPEED</code> in steps of 20 and retune each time. This is what the tuning actually is.</p>` },
  { h: 'Sharper corners',
    body: `<p>A 90-degree corner needs one wheel to reverse, which happens naturally once
    <code>correction</code> exceeds <code>BASE_SPEED</code> - the <code>drive()</code> function handles
    negative speeds. If it still cannot make the corner, raise <code>KP</code> or slow down for the corner by
    reducing the base speed when the error is large.</p>` },
  { h: 'Wider or narrower tape',
    body: `<p>The sensor spacing should be roughly the tape width, so that in the worst case at least one sensor
    sees the line. 19&nbsp;mm tape with sensors about 15&nbsp;mm apart works well. Much wider tape and the
    outer sensors never see white; much narrower and the line can fall between sensors.</p>` }
],

trouble: [
  { q: 'Follows the line with motors off, wanders with them on',
    a: `Motor noise in the analog readings. Fit the 100&nbsp;nF capacitors across the motors and move the sensor
    cable away from the motor leads.` },
  { q: '<code>WEAK CONTRAST</code> at calibration',
    a: `Sensor height, or the surface. Aim for 5&nbsp;mm. Matt black tape on white paper is the easy case; shiny
    tape on a grey floor is nearly impossible.` },
  { q: 'Drives straight off the line on every corner',
    a: `<code>KP</code> too low, or too fast for the tuning. Halve the speed and try again.` },
  { q: 'Snakes down a straight line',
    a: `<code>KP</code> too high or <code>KD</code> too low. Classic proportional overshoot.` },
  { q: 'Turns the wrong way',
    a: `Sensors reversed - the left one is on A2. Either swap the wires or swap the weights in the error
    calculation.` },
  { q: 'Robot spins on the spot at startup',
    a: `It thinks it has lost the line. Check calibration actually ran and that the readings separate.` },
  { q: 'One wheel always faster',
    a: `Motors are never identical. Add a trim factor: <code>analogWrite(ENB, right * 0.92)</code>.` },
  { q: 'Stops randomly mid-run',
    a: `Either a brownout from the motors - add the 1000&nbsp;&micro;F and check the battery under load - or it
    is seeing a finish band. A dark patch on the floor or a shadow can trigger it; raise the
    <code>0.7</code> threshold.` }
],

next: `
<ul>
  <li><strong>Five sensors</strong> instead of three. More resolution in the error term, much better at speed,
  and the weighting extends to &minus;2, &minus;1, 0, +1, +2.</li>
  <li><strong>Add the I term</strong> for full PID. It corrects a persistent bias - a robot that always sits
  slightly left of the line - but it also winds up on corners, so it needs a clamp.</li>
  <li><strong>Encoders on the wheels</strong>, so the correction can be in real wheel speed rather than in PWM
  values that mean different things as the battery drains.</li>
  <li><strong>Combine with obstacle avoidance</strong>: the same chassis with an
  <a href="project.html?p=obstacle-avoiding-robot">ultrasonic head</a>, so it follows the line and stops for
  things on it.</li>
</ul>`
});
