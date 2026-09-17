/* The one where the electronics stop being the hard part. */
AB.addProject({
slug: 'reaction-wheel-cube',
title: 'Cube that balances on its corner',
cat: 'robotics',
level: 5,
time: 'Weeks. Genuinely.',
solder: true,
board: 'ESP32',
tags: ['reaction wheel', 'cubli', 'lqr', 'foc', 'simplefoc', 'inverted pendulum', 'state space', 'angular momentum', 'balance'],
blurb: 'A cube that stands on one corner, stays there, and can throw itself upright from lying flat by braking a spinning flywheel. It is the hardest thing in this book by a wide margin, and when it works it does not look like it should be possible.',
feature: true,

skills: ['State-space control', 'LQR', 'Sensor fusion', 'Field-oriented control', 'Angular momentum transfer', 'Mechanical balancing', 'Systematic tuning'],

intro: `
<p>Inside the cube are three brass flywheels, each on a brushless motor, on three perpendicular axes. Spin one
up and the cube twists the other way - conservation of angular momentum, the same reason a cat rights itself
falling and a satellite turns without thrusters.</p>
<p>Run that fast enough and you can hold the cube balanced on a single corner, correcting a thousand times a
second against a fall that takes about a third of a second to become unrecoverable. Spin a wheel to fifteen
thousand rpm and <em>brake it</em> and the momentum dumps into the body hard enough to throw the whole cube
upright from lying flat.</p>
<p>This is a copy of the Cubli, built at ETH Zurich in 2012, and it is the most spectacular thing you can build
from parts on this site.</p>
<p><strong>It is also, honestly, the hardest.</strong> Every other project here works when the wiring is right.
This one has correct wiring, correct code and does not balance, for weeks, and the reason is a flywheel that is
three grams out of true or an estimator that lags by eight milliseconds. That is what level five means.</p>`,

what: [
  'Balance on one edge, which is the one-dimensional version and hard enough on its own.',
  'Balance on a single corner, which needs all three wheels working against each other in 3D.',
  'Jump up from flat onto an edge by braking a spinning wheel.',
  'Recover when nudged, within a few degrees.',
  'Shut itself down safely when it falls, rather than flinging a flywheel across the room.'
],

how: `
<p><strong>Why this is not a PID problem.</strong> The
<a href="project.html?p=quadcopter-flight-controller">flight controller</a> gets away with three independent
PID loops because its three axes barely interact. Here they interact constantly: tilting the cube changes which
way "down" is for all three wheels at once, and each wheel's reaction torque has components on the other two
axes.</p>
<p>You also care about four things simultaneously per axis - body angle, body angular rate, wheel speed and
accumulated wheel speed - and PID controls one error. So it is a <strong>state-space</strong> problem, and the
standard answer is <strong>LQR</strong>: linear quadratic regulator.</p>

<p><strong>What LQR actually is.</strong> Write the system as <code>x_dot = Ax + Bu</code>, where x is the state
vector and u the motor torque. Then say how much you dislike each state being non-zero (matrix Q) and how much
you dislike using control effort (matrix R). LQR solves for the gain matrix K that minimises the total cost,
and the control law is one line: <code>u = -Kx</code>.</p>
<p>The useful part is that you tune Q and R, which are <em>meaningful</em> - "I care ten times more about angle
than wheel speed" - rather than tuning gains that mean nothing on their own. The solver does the rest, in
Octave, Python or MATLAB, offline. You paste four numbers into the sketch.</p>

<p><strong>Why the wheel speed is in the state vector.</strong> This is the part that surprises people. To hold
an angle the wheel must accelerate continuously, so it saturates - and a saturated wheel produces no more
torque and the cube falls.</p>
<p>Including wheel speed in the state, with a small weight, makes the controller gently "unwind" the wheel back
towards zero while still balancing. The cube leans imperceptibly into the unwind. Leave this term out and it
balances beautifully for eight seconds and then falls over every single time.</p>

<p><strong>The estimator has to be fast, not accurate.</strong> A complementary filter is fine, and the time
constant matters more than the maths. At 200&nbsp;Hz, ten milliseconds of estimator lag is two degrees of phase
at the frequencies that matter, and two degrees of phase is the difference between stable and a growing
oscillation.</p>
<p>Use the gyro for the fast path with the accelerometer only trimming the long-term drift - a filter
coefficient around 0.995 at 500&nbsp;Hz. Do not filter the gyro heavily to make the trace look nice. A clean
signal that arrives late is worse than a noisy one that arrives now.</p>

<p><strong>Field-oriented control, and why not an ESC.</strong> A hobby ESC does open-loop trapezoidal drive and
is built for spinning a propeller one way, fast. You need <em>torque</em>, in both directions, at any speed
including zero, with millisecond response.</p>
<p>That is FOC, and it needs the rotor angle - hence a magnetic encoder on every motor shaft. SimpleFOC does the
maths. Gimbal motors are the right choice because they have many poles and low KV, which means high torque at
low speed and smooth control near zero.</p>

<p><strong>The jump-up is a different kind of control entirely.</strong> Balancing is continuous. The jump is a
single discrete event:</p>
<ol>
  <li>Spin the wheel to its maximum, which takes several seconds.</li>
  <li>Brake it as hard as the driver allows - short the phases, or command maximum reverse torque.</li>
  <li>All that angular momentum transfers to the body in about 50&nbsp;milliseconds.</li>
  <li>The cube rotates up. If you timed it right, it arrives at the balance point with almost no residual
  velocity and the balance controller catches it.</li>
</ol>
<p>The braking torque is far larger than anything the motor can produce continuously, which is the whole trick.
And the catch has a window of perhaps 30&nbsp;milliseconds - too slow and it falls back, too fast and it goes
straight over.</p>

<p><strong>Mechanical tolerance is most of the difficulty.</strong> An unbalanced flywheel at 10,000&nbsp;rpm
shakes the frame at 167&nbsp;Hz. Your IMU sees that vibration, your estimator tries to correct for it, and the
whole thing buzzes itself apart.</p>
<p>The wheels must be balanced, the frame must be stiff, and the IMU must be mounted on something that is not
ringing. Expect to spend more time on this than on the control code. This is the honest reason the project
takes weeks.</p>`,

bom: [
  { id: 'bldc-gimbal', qty: 3, note: 'GM2804 class - many poles, low KV, high torque at low speed. A drone motor is exactly wrong here: it wants to spin fast and has almost no torque near zero.' },
  { id: 'reaction-wheel', qty: 3, note: 'Mass at the rim. A brass ring stores several times the momentum of a printed disc of the same weight, and momentum is the entire budget of this project.' },
  { id: 'foc-driver', qty: 3, note: 'DRV8313 or SimpleFOC Mini. One per motor - there is no sharing.' },
  { id: 'as5600', qty: 3, note: 'Rotor angle for FOC. A diametrically magnetised magnet glued to each shaft end - an ordinary magnet will not work, see the notes.' },
  { id: 'tca9548', qty: 1, note: 'All three AS5600s live at 0x36 and the address cannot be changed. This is not optional.' },
  { id: 'mpu6050', qty: 1, note: 'Adequate, and its noise is genuinely a limiting factor. An ICM-42688 is a real upgrade if the budget stretches.' },
  { id: 'esp32', qty: 1, note: 'Two cores at 240 MHz with hardware floating point. Read the code notes on loop rate - this board is close to its limit here.' },
  { id: 'lipo3s', qty: 1, note: '11.1 V. The gimbal motors want the voltage for torque, and the jump needs the current.' },
  { id: 'buck', qty: 1, note: '11.1 V down to 5 V for the logic. Keep it well away from the motor wiring.' },
  { id: 'xt60', qty: 1 },
  { id: 'cap1000', qty: 3, note: 'One across each driver’s supply, physically at the driver. Braking a flywheel dumps energy back into the rail.' },
  { id: 'standoffs', qty: 2, note: 'M3, and use thread lock on everything. Vibration undoes fasteners, and this vibrates.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'glasses', qty: 1, note: 'Not optional and not a formality. Read the safety section.' },
  { id: 'hookup', qty: 1, own: true },
  { id: 'dmm', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping', own: true }, { id: 'heatshrink', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',    at: [0, 92] },
    { id: 'mux',  comp: 'tca9548',  at: [62, 44] },
    { id: 'imu',  comp: 'mpu6050',  at: [-58, 44] },
    { id: 'bb',   comp: 'bb400',    at: [0, 24] },
    { id: 'd1',   comp: 'focdrv',   at: [-66, -30] },
    { id: 'd2',   comp: 'focdrv',   at: [0, -30] },
    { id: 'd3',   comp: 'focdrv',   at: [66, -30] },
    { id: 'm1',   comp: 'bldc',     at: [-66, -78] },
    { id: 'e1',   comp: 'as5600',   at: [-24, -84] },
    { id: 'w1',   comp: 'flywheel', at: [46, -92] },
    { id: 'batt', comp: 'lipo4s',   at: [0, 132] }
  ],
  wires: [
    { from: 'batt.XT+', to: 'bb.T+1',  color: 'brown',  note: '11.1 V pack positive - brown, because this rail can deliver tens of amps' },
    { from: 'batt.XT-', to: 'bb.T-1',  color: 'black',  note: 'Pack negative, and the common ground for everything' },
    { from: 'mcu.3V3',  to: 'bb.T+26', color: 'red',    note: '3.3 V logic rail for the sensors' },
    { from: 'mcu.GND',  to: 'bb.T-26', color: 'black',  note: 'Logic ground, joined to power ground at ONE point' },
    { from: 'd1.VM',    to: 'bb.T+5',  color: 'brown',  note: 'Driver 1 motor supply, with its 1000 uF right here' },
    { from: 'd1.GND',   to: 'bb.T-5',  color: 'black',  note: 'Driver 1 ground' },
    { from: 'd1.IN1',   to: 'mcu.D25', color: 'green',  note: 'Driver 1 phase A PWM' },
    { from: 'd1.IN2',   to: 'mcu.D26', color: 'blue',   note: 'Driver 1 phase B PWM' },
    { from: 'd1.IN3',   to: 'mcu.D27', color: 'yellow', note: 'Driver 1 phase C PWM' },
    { from: 'd1.EN',    to: 'mcu.D12', color: 'white',  note: 'Driver 1 enable - this is the kill switch, see safety' },
    { from: 'd1.A',     to: 'm1.A',    color: 'brown',  note: 'Motor 1 phase A' },
    { from: 'd1.B',     to: 'm1.B',    color: 'brown',  note: 'Motor 1 phase B' },
    { from: 'd1.C',     to: 'm1.C',    color: 'brown',  note: 'Motor 1 phase C' },
    { from: 'd2.VM',    to: 'bb.T+11', color: 'brown',  note: 'Driver 2 motor supply' },
    { from: 'd2.GND',   to: 'bb.T-11', color: 'black',  note: 'Driver 2 ground' },
    { from: 'd2.IN1',   to: 'mcu.D14', color: 'green',  note: 'Driver 2 phase A' },
    { from: 'd2.IN2',   to: 'mcu.D13', color: 'blue',   note: 'Driver 2 phase B' },
    { from: 'd2.IN3',   to: 'mcu.D33', color: 'yellow', note: 'Driver 2 phase C' },
    { from: 'd2.EN',    to: 'mcu.D32', color: 'white',  note: 'Driver 2 enable' },
    { from: 'd3.VM',    to: 'bb.T+17', color: 'brown',  note: 'Driver 3 motor supply' },
    { from: 'd3.GND',   to: 'bb.T-17', color: 'black',  note: 'Driver 3 ground' },
    { from: 'd3.IN1',   to: 'mcu.D19', color: 'green',  note: 'Driver 3 phase A' },
    { from: 'd3.IN2',   to: 'mcu.D18', color: 'blue',   note: 'Driver 3 phase B' },
    { from: 'd3.IN3',   to: 'mcu.D5',  color: 'yellow', note: 'Driver 3 phase C' },
    { from: 'd3.EN',    to: 'mcu.D17', color: 'white',  note: 'Driver 3 enable' },
    { from: 'mux.VIN',  to: 'bb.T+29', color: 'red',    note: 'Multiplexer power' },
    { from: 'mux.GND',  to: 'bb.T-29', color: 'black',  note: 'Multiplexer ground' },
    { from: 'mux.SDA',  to: 'mcu.D21', color: 'green',  note: 'Main I2C data, from the ESP32' },
    { from: 'mux.SCL',  to: 'mcu.D22', color: 'blue',   note: 'Main I2C clock' },
    { from: 'mux.SD0',  to: 'e1.SDA',  color: 'green',  note: 'Branch 0 to encoder 1 - each encoder gets its own branch' },
    { from: 'mux.SC0',  to: 'e1.SCL',  color: 'blue',   note: 'Branch 0 clock' },
    { from: 'e1.VCC',   to: 'bb.T+32', color: 'red',    note: 'Encoder 1 power' },
    { from: 'e1.GND',   to: 'bb.T-32', color: 'black',  note: 'Encoder 1 ground' },
    { from: 'imu.VCC',  to: 'bb.T+22', color: 'red',    note: 'IMU power' },
    { from: 'imu.GND',  to: 'bb.T-22', color: 'black',  note: 'IMU ground' },
    { from: 'imu.SDA',  to: 'mcu.D21', color: 'green',  note: 'IMU on the main bus, upstream of the mux' },
    { from: 'imu.SCL',  to: 'mcu.D22', color: 'blue',   note: 'IMU clock' },
    { from: 'w1.HUB',   to: 'm1.A',    color: 'grey',   note: 'Flywheel bolted to the motor rotor - mechanical, not electrical' }
  ]
},

wireIntro: `<p>One motor chain is drawn in full; the other two are identical on the pins listed. The wiring is
not the hard part of this project and is shown mainly so the pin budget is visible - it uses almost every
usable GPIO on an ESP32.</p>`,

wireNotes: `
<div class="note danger"><span class="t">The enable pins are the kill switch, and they must fail safe</span>
<p>All three EN lines must be pulled LOW by resistors, so that a board reset, a crash or a loose wire stops the
motors rather than leaving them at whatever the last command was.</p>
<p>A 10&nbsp;k from each EN pin to ground costs nothing. Without it, an ESP32 that reboots mid-balance leaves
three flywheels spinning under no control.</p></div>

<div class="note danger"><span class="t">Three AS5600s cannot share a bus</span>
<p>Every AS5600 answers at address 0x36 and there is no address pin. Three on one bus means all three answer at
once and you get nonsense - and nonsense rotor angles in an FOC loop means full current into a stalled phase.</p>
<p>The multiplexer is not a convenience. Verify each branch reads a sensible angle independently before you
enable a single driver.</p></div>

<div class="note warn"><span class="t">The magnet must be diametrically magnetised</span>
<p>A normal disc magnet is magnetised through its thickness - north on one face, south on the other. The AS5600
needs one magnetised across its diameter, so the field rotates as the shaft turns.</p>
<p>With the wrong magnet the sensor reads a value that barely changes, and FOC on a bad angle is how drivers
die. They are sold specifically as "diametric" and cost about a dollar.</p></div>

<div class="note warn"><span class="t">Star grounding, seriously</span>
<p>Braking a flywheel pushes current backwards through the driver into the supply. Share a ground path between
that and the IMU and the current spikes appear as phantom angular rates - so the controller reacts to a
disturbance that never happened.</p>
<p>Power ground and logic ground meet at one point, at the battery. Nowhere else.</p></div>`,

solderIntro: `<p>Build this in stages that each work on their own. One motor, one wheel, one axis, balancing on
an edge. Only when that is solid do you build the other two. Building all three first means debugging three
interacting unknowns, which is not debugging - it is guessing.</p>`,

solderSteps: [
  { h: 'Balance the flywheels before anything else',
    body: `<p>Put each wheel on a shaft between two level knife edges and let it settle. It will roll to put its
    heavy spot at the bottom. Remove material from that spot, or add a small weight opposite, and repeat until
    it sits anywhere you leave it.</p>
    <p>This is called static balancing, it takes about twenty minutes per wheel, and skipping it is the single
    most common reason one of these never works. An unbalanced wheel at 10,000&nbsp;rpm shakes the frame at
    167&nbsp;Hz and your estimator will chase it.</p>` },
  { h: 'Magnet on the shaft, square and centred',
    body: `<p>The diametric magnet glues to the end of the motor shaft, centred within about 0.2&nbsp;mm, with
    the sensor 1-3&nbsp;mm away and parallel.</p>
    <p>Off-centre gives an angle error that varies through the rotation, which produces a torque ripple you will
    later mistake for a control problem.</p>` },
  { h: 'One driver, one motor, no wheel',
    body: `<p>Run SimpleFOC’s alignment sketch. It finds the pole pairs and the sensor offset and prints
    them. If it cannot align, nothing further will work, and the cause is nearly always the magnet or the
    encoder gap.</p>
    <p>Hard-code the values it prints. Re-aligning at every boot wastes seconds and occasionally gets a
    different answer.</p>` },
  { h: 'Now the wheel, and listen',
    body: `<p>Bolt a wheel on and spin it up slowly by command. It should be almost silent and you should be
    able to rest a hand on the frame without feeling a beat.</p>
    <p>If it buzzes, go back and balance it again. Do not proceed. Everything downstream gets harder with a
    vibrating frame.</p>` },
  { h: 'Capacitors at the drivers, not at the battery',
    body: `<p>1000&nbsp;uF across each driver’s VM and GND, physically adjacent. Braking dumps energy back
    into the rail and a long wire to a distant capacitor does nothing about it.</p>
    <p>Watch the polarity. An electrolytic in backwards on an 11.1&nbsp;V rail vents.</p>` },
  { h: 'IMU on the stiffest point, decoupled',
    body: `<p>Centre of the frame, on the most rigid part, on a small piece of foam or double-sided tape rather
    than bolted rigidly to a panel that can ring.</p>
    <p>Then orient it so one axis lines up with the balance edge and write down which is which. You will be
    reasoning about signs for days.</p>` },
  { h: 'Build the frame stiff and square',
    body: `<p>Printed corner brackets with aluminium extrusion, or a fully printed frame with thick walls.
    Diagonal stiffness matters most - a frame that can parallelogram by a millimetre introduces a flexible mode
    right in the middle of your control bandwidth.</p>
    <p>Thread lock on every fastener. This vibrates for hours at a time and plain nuts walk off.</p>` },
  { h: 'Edge balancing first, and stay there a while',
    body: `<p>One axis, one wheel, cube on an edge, with a hand ready. Get this genuinely solid - nudge it,
    let it unwind, leave it running for five minutes - before you add axis two.</p>
    <p>Most of what you learn about tuning happens here, where only one thing can be wrong.</p>` }
],

libraries: [
  { name: 'SimpleFOC', by: 'Antun Skuric and contributors', why: 'Field-oriented control, encoder handling and motor alignment. Doing FOC yourself is a project in its own right and this is excellent.' },
  { name: 'Adafruit MPU6050', by: 'Adafruit', why: 'The IMU. Configure it for the widest bandwidth - see the code.' },
  { name: 'Octave or Python (control)', by: 'offline, on your computer', why: 'Solving for the LQR gains. `scipy.linalg.solve_continuous_are` or Octave’s `lqr()`. You run this once and paste four numbers into the sketch.' }
],

code: [{
  name: 'reaction_wheel_cube.ino',
  code: `/* ------------------------------------------------------------------
   Reaction wheel cube - single axis (edge balancing)

   Build this version first and live with it. The three-axis version is
   this, three times, with a coupled state vector - and it is not worth
   attempting until this one balances for five minutes unattended.
   ------------------------------------------------------------------ */

#include <SimpleFOC.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>

#define EN_PIN 12          // ALSO pulled to ground by a 10k resistor

BLDCMotor motor = BLDCMotor(11);                     // 11 pole pairs, GM2804
BLDCDriver3PWM driver = BLDCDriver3PWM(25, 26, 27, EN_PIN);
MagneticSensorI2C sensor = MagneticSensorI2C(AS5600_I2C);
Adafruit_MPU6050 mpu;

/* ---- LQR gains -------------------------------------------------------
   Solved offline for the linearised system. Do NOT copy these - they
   encode YOUR cube's mass, wheel inertia and centre of gravity, and a
   cube 10 mm larger needs different numbers.

   In Octave, with A and B from your own measurements:
     Q = diag([100, 1, 0.02, 0.001]);   % angle, rate, wheel, integral
     R = 1;
     K = lqr(A, B, Q, R)

   The point of LQR is that Q is meaningful: "I care 100x more about
   angle than wheel speed" is a sentence you can reason about, unlike a
   raw PID gain.
--------------------------------------------------------------------- */
const float K_ANGLE      = 62.0f;    // body angle, radians
const float K_RATE       =  6.8f;    // body angular rate
const float K_WHEEL      =  0.42f;   // wheel speed - the term people omit
const float K_WHEEL_INT  =  0.015f;  // accumulated wheel speed

const float BALANCE_POINT = 0.0f;    // set by the calibration routine
const float FALL_LIMIT    = 0.16f;   // ~9 degrees; past this, give up
const float MAX_TORQUE    = 0.9f;

float angle = 0, rate = 0;
float wheelInt = 0;
bool running = false;
unsigned long lastUs = 0;

void setup() {
  Serial.begin(115200);

  // Hold everything off until we are ready. The 10k to ground does this
  // in hardware too - this is belt and braces.
  pinMode(EN_PIN, OUTPUT);
  digitalWrite(EN_PIN, LOW);

  Wire.begin();
  Wire.setClock(400000);

  if (!mpu.begin()) { Serial.println("No IMU"); while (1) delay(100); }
  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);

  /* Widest bandwidth, deliberately. A heavily filtered gyro looks lovely
     on a plot and arrives late, and late is what turns a stable loop into
     a growing oscillation. Noise you can live with; phase lag you cannot. */
  mpu.setFilterBandwidth(MPU6050_BAND_260_HZ);

  sensor.init();
  motor.linkSensor(&sensor);

  driver.voltage_power_supply = 11.1;
  driver.init();
  motor.linkDriver(&driver);

  // Torque mode. Not velocity, not position - the LQR output IS a torque.
  motor.torque_controller = TorqueControlType::voltage;
  motor.controller = MotionControlType::torque;
  motor.voltage_limit = 6.0;

  motor.init();
  motor.initFOC();

  Serial.println("Ready. Hold it near balance to arm.");
  lastUs = micros();
}

void loop() {
  motor.loopFOC();                 // must run as fast as possible

  unsigned long now = micros();
  float dt = (now - lastUs) * 1e-6f;
  if (dt < 0.002f) return;         // 500 Hz control loop
  lastUs = now;

  updateEstimator(dt);

  float err = angle - BALANCE_POINT;

  /* Arm only when someone is holding it close to the balance point, and
     disarm the moment it is clearly falling. A cube that tries to catch
     itself from 40 degrees just flings a flywheel. */
  if (!running && fabs(err) < 0.03f) {
    running = true;
    wheelInt = 0;
    digitalWrite(EN_PIN, HIGH);
    Serial.println("armed");
  }
  if (running && fabs(err) > FALL_LIMIT) {
    running = false;
    digitalWrite(EN_PIN, LOW);
    motor.move(0);
    Serial.println("fallen - disarmed");
    return;
  }
  if (!running) { motor.move(0); return; }

  float wheelSpeed = motor.shaft_velocity;

  /* Wheel speed is in the state vector, and this is the term everyone
     leaves out. Without it the controller holds angle by accelerating the
     wheel forever, the wheel saturates, torque goes to zero and the cube
     falls - reliably, after about eight seconds of beautiful balancing. */
  wheelInt += wheelSpeed * dt;
  wheelInt = constrain(wheelInt, -400.0f, 400.0f);

  float u = -(K_ANGLE * err
            + K_RATE  * rate
            + K_WHEEL * wheelSpeed
            + K_WHEEL_INT * wheelInt);

  motor.move(constrain(u, -MAX_TORQUE, MAX_TORQUE) * motor.voltage_limit);
}

/* Complementary filter. The gyro provides the fast, phase-accurate path;
   the accelerometer only trims its drift over seconds. 0.998 at 500 Hz is
   a time constant of about a second. */
void updateEstimator(float dt) {
  sensors_event_t a, g, t;
  mpu.getEvent(&a, &g, &t);

  rate = g.gyro.x;                                   // rad/s about the edge
  float accAngle = atan2(a.acceleration.y, a.acceleration.z);

  const float ALPHA = 0.998f;
  angle = ALPHA * (angle + rate * dt) + (1.0f - ALPHA) * accAngle;
}

/* ---- jump up ---------------------------------------------------------
   Not called from loop(). Trigger it deliberately, from a button or the
   serial console, with the cube lying flat and nothing near it.

   Spin the wheel up over several seconds, then brake as hard as the
   driver allows. The braking torque is far higher than the motor can
   produce continuously, and that asymmetry is the entire trick.
--------------------------------------------------------------------- */
void jumpUp() {
  Serial.println("spinning up - stand clear");
  digitalWrite(EN_PIN, HIGH);

  motor.controller = MotionControlType::velocity;
  motor.move(1400);                        // rad/s, about 13,000 rpm
  unsigned long t0 = millis();
  while (millis() - t0 < 6000) motor.loopFOC(), motor.move();

  Serial.println("brake");
  motor.controller = MotionControlType::torque;
  motor.move(-motor.voltage_limit);        // maximum reverse torque

  /* The catch window is roughly 30 ms wide. Too slow and it falls back,
     too fast and it goes straight over the balance point. This number is
     found experimentally for YOUR cube - film it at 240 fps and count. */
  delay(55);

  motor.move(0);
  running = false;                         // let loop() re-arm and catch it
  wheelInt = 0;
}`
}],

trouble: [
  { q: 'It balances beautifully for about eight seconds, then falls',
    a: `Wheel speed is missing from your state vector, or its gain is far too small. The controller is holding
    the angle by accelerating the wheel indefinitely; when the wheel saturates there is no torque left. This is
    the single most common failure of this project and the symptom is unmistakable - it is always about the
    same number of seconds.` },
  { q: 'It oscillates at a few hertz, growing until it falls',
    a: `Too much phase lag. Raise the loop rate, widen the IMU filter bandwidth, and check nothing slow is
    running inside the control loop. Reducing the angle gain hides it rather than fixing it.` },
  { q: 'It buzzes loudly and the frame shakes',
    a: `Unbalanced wheel. Go back and balance it on knife edges. No control change fixes a mechanical problem,
    and the vibration is being fed straight into your estimator.` },
  { q: 'A motor gets very hot and the driver shuts down',
    a: `The encoder angle is wrong, so FOC is putting current into the wrong phase - full current, no torque,
    all heat. Check the magnet is diametric, centred and at the right gap, and that the multiplexer branch is
    selected for the motor you think it is.` },
  { q: 'Angles read nonsense from all three encoders',
    a: `All three AS5600s are answering at 0x36 simultaneously. The multiplexer is not switching, or you are
    not selecting a channel before each read.` },
  { q: 'It drifts slowly off vertical and corrects the wrong way',
    a: `Your balance point is wrong - the cube’s centre of gravity is not where you assumed. Run the
    calibration: let it hang from the edge and record the resting angle.` },
  { q: 'The jump-up throws it right over',
    a: `Too much stored momentum or too long a brake. Reduce the spin-up speed by ten percent at a time. Film
    it at high frame rate - this is genuinely the only practical way to tune the timing.` },
  { q: 'The jump-up barely lifts it',
    a: `Not enough momentum. Higher wheel speed, or more mass at the wheel rim. A printed disc rarely has
    enough - this is where brass earns its place.` },
  { q: 'The ESP32 resets when a wheel brakes',
    a: `Regenerative energy pushing the rail up, or a brownout from the current spike. Capacitors at each
    driver, and check the buck converter is not sharing a ground path with the motor returns.` },
  { q: 'Edge balancing works and corner balancing does not',
    a: `Expected. Corner balancing is genuinely much harder - the axes are coupled, so three independent
    single-axis controllers will fight each other. You need the full 3D state model, and the wheels must be
    matched in inertia to within a few percent.` },
  { q: 'It works, then stops working after an hour of tinkering',
    a: `A fastener has vibrated loose, a magnet has shifted, or a solder joint has cracked. Check the mechanics
    before the code. On this project that is the right order about four times out of five.` }
],

safety: `
<div class="note danger"><span class="t">A spinning flywheel stores real energy. This is the most dangerous thing in this book.</span>
<p>An 80&nbsp;mm brass wheel at 13,000&nbsp;rpm holds on the order of a hundred joules. That is comparable to a
pistol round, and unlike anything else on this site it is stored continuously and released instantly if
something fails.</p>
<ul>
  <li><strong>Safety glasses, every session, no exceptions.</strong> They are in the bill of materials for this
  reason.</li>
  <li><strong>Never spin a wheel that is not bolted down.</strong> Check the fastener and the thread lock
  before every run. A wheel that leaves a shaft at that speed goes through plasterboard.</li>
  <li><strong>Contain it.</strong> Test inside a cardboard box, or behind polycarbonate. First runs especially -
  that is when the mounting is least proven.</li>
  <li><strong>Keep fingers away from a spinning wheel</strong>, and remember it stays dangerous for a long time
  after you cut power, because there is nothing to slow it down.</li>
  <li><strong>The jump-up is the highest-risk moment.</strong> Maximum stored energy, sudden release, and an
  untested mechanical joint. Stand clear and have nothing fragile nearby.</li>
  <li><strong>Pull the enable pins low with resistors</strong> so a crash or reset stops the motors. A rebooting
  controller with three wheels spinning under no control is the failure you are designing against.</li>
  <li><strong>Have a physical disconnect within reach</strong> - the XT60 or a switch. Software you are actively
  debugging is not a safety system.</li>
</ul>
<p>Balance every wheel properly. An unbalanced wheel is not only a control problem: it fatigues the shaft and
the mount, and fatigue failures happen without warning at the worst moment.</p></div>

<div class="note warn"><span class="t">Lithium, as everywhere else in this book</span>
<p>A 3S pack delivering tens of amps into a shorted phase is a fire. Fuse the pack, use an XT60 rather than
bare wire, and never leave it charging unattended. Do not charge below 0&nbsp;degrees. Store at storage
charge.</p>
<p>The motors will get hot during tuning. Hot motors, a lithium pack and a frame you keep re-drilling is a
combination worth respecting - keep the pack physically away from the motors.</p></div>`,

next: `
<ul>
  <li><strong>Get to corner balancing.</strong> Edge is one axis; corner is three coupled ones and a genuinely
  different problem. This is the real finish line.</li>
  <li><strong>Walking.</strong> Once it can jump onto an edge, jumping from edge to edge is a sequence of the
  same trick, and the cube walks across a table. This is what made the original Cubli famous.</li>
  <li><strong>Swap the estimator for a proper Kalman filter</strong> and compare. You will be able to measure
  the difference in achievable loop gain, which is a satisfying thing to be able to say.</li>
  <li><strong>Model it first, next time.</strong> Measure the inertias, build the state-space model, simulate
  in Python, and only then touch hardware. It is how this is done properly and it is much faster than tuning
  on the bench.</li>
  <li><strong>Log everything over Wi-Fi</strong> at full rate. Being able to plot angle, rate and wheel speed
  for the second before a fall is worth more than any amount of watching it.</li>
  <li><strong>Then go back to the <a href="project.html?p=quadcopter-flight-controller">flight
  controller</a></strong> and notice how much easier its three independent PID loops look now.</li>
</ul>`
});
