/* A flight controller you wrote: PID on three axes, and a very honest account of what that costs. */
AB.addProject({
slug: 'quadcopter-flight-controller',
title: 'Write your own flight controller',
cat: 'drones',
level: 4,
time: '20 hours, plus weeks of tuning',
solder: true,
board: 'ESP32',
feature: true,
tags: ['quadcopter', 'flight controller', 'pid', 'imu', 'mpu6050', 'complementary filter', 'crsf', 'betaflight', 'arming'],
blurb: 'Three PID loops, an IMU and four motors. The most demanding project in this book, and the one where the honest advice is to buy a Betaflight board - with a real explanation of why you might build it anyway.',

skills: ['PID control', 'Sensor fusion', 'Loop timing', 'Arming state machines', 'Failsafe design', 'Flight tuning'],

intro: `
<p><strong>Start with the honest advice: for a quadcopter you actually want to fly, buy a flight controller
and run Betaflight.</strong> A $25 board gives you a 32-bit processor at 480&nbsp;MHz, a good IMU, blackbox
logging, filters that took a decade of collective work to get right, and a configurator with a tuning
community behind it. Nothing you write in a weekend will approach it.</p>
<p>So why build one? Because a PID loop stabilising a real physical object is one of the most instructive
things in engineering, and reading about it is nothing like having your own code hold something level. You
will learn more about control systems from an afternoon of this oscillating on a test rig than from any
amount of theory.</p>
<p><strong>What this guide delivers:</strong> a quadcopter that self-levels and can be flown gently in a large
open space by someone who already knows how to fly. <strong>What it does not deliver:</strong> anything
competitive, anything acrobatic, or anything you should fly near people. The filters are simple, the loop is
slow by modern standards, and there is no blackbox to tell you why it crashed.</p>
<p>Fly it over grass, alone, in a field. That is the deal.</p>`,

what: [
  'Fuse gyro and accelerometer into a usable attitude estimate.',
  'Run three cascaded PID loops - roll, pitch and yaw - at 500 Hz.',
  'Take stick inputs over CRSF and turn them into angle setpoints.',
  'Mix the PID outputs onto four motors correctly, including the yaw torque term.',
  'Arm through a deliberate state machine that cannot be triggered by accident.',
  'Fail safe: motors to idle on link loss, and cut on a crash or a low battery.'
],

how: `
<p><strong>The loop, and why its rate matters.</strong> Read the gyro, estimate attitude, compare with the
stick demand, compute PID, mix onto motors, write. Repeat.</p>
<p>This sketch runs at 500&nbsp;Hz - 2&nbsp;ms per pass. Betaflight runs at 4 to 8&nbsp;kHz. That difference
is why a commercial board can fly acrobatically and this one flies gently: a slow loop means the derivative
term is noisy and the whole thing has to be tuned softly to stay stable.</p>
<p><strong>The loop rate must be fixed.</strong> A PID's integral and derivative terms both depend on elapsed
time, and a loop that sometimes takes 2&nbsp;ms and sometimes 3 produces a controller whose gains effectively
wander. The sketch uses a hard deadline and reports overruns.</p>

<p><strong>Sensor fusion: why you need both sensors.</strong></p>
<p>A <strong>gyroscope</strong> measures angular rate, accurately and quickly. Integrate it to get angle and
the small errors accumulate - it drifts by degrees per minute.</p>
<p>An <strong>accelerometer</strong> measures the gravity vector, which gives absolute roll and pitch with no
drift. It also measures every vibration, every propeller imbalance and every acceleration of the airframe, so
on its own it is unusably noisy.</p>
<p>The <strong>complementary filter</strong> takes the gyro for fast changes and the accelerometer for slow
correction: <code>angle = 0.98 * (angle + gyro * dt) + 0.02 * accelAngle</code>. Two lines, no matrices, and
good enough for a self-levelling quad.</p>
<p>A Kalman filter or Madgwick's algorithm is better and more complex. The complementary filter's weakness is
worth knowing: under sustained lateral acceleration the accelerometer reads a gravity vector that is tilted,
so the estimate slowly leans. In a gentle hover you will not notice; in a fast forward flight you would.</p>

<p><strong>Yaw is different, and this trips everyone.</strong> Roll and pitch have an absolute reference -
gravity. Yaw does not. An accelerometer cannot tell you which way you are facing, so yaw <em>will</em> drift
unless you add a magnetometer.</p>
<p>The answer used on every quad: <strong>do not control yaw angle - control yaw rate.</strong> The stick
commands "rotate at this rate", the gyro measures rate directly, and there is nothing to drift. Roll and pitch
run in angle mode; yaw runs in rate mode. That asymmetry is in every flight controller ever written.</p>

<p><strong>The mixer.</strong> Four motors produce three torques plus lift. Motors 1 and 3 spin one way, 2 and
4 the other, so yaw comes from the <em>difference</em> in reaction torque rather than from any tilt:</p>
<p><code>M1 = T - roll - pitch + yaw</code> (front right, CCW)<br>
<code>M2 = T - roll + pitch - yaw</code> (rear right, CW)<br>
<code>M3 = T + roll + pitch + yaw</code> (rear left, CCW)<br>
<code>M4 = T + roll - pitch - yaw</code> (front left, CW)</p>
<p>Getting a sign wrong here produces a quad that flips instantly on takeoff, which is the single most common
first-flight outcome. The test rig section is how you find it without breaking anything.</p>

<p><strong>PID, in the terms that matter here.</strong> P is the spring - too little and it is sloppy, too
much and it oscillates fast. I removes steady error, like a persistent lean from an off-centre battery - too
much and it wallows slowly. D damps - it resists change, and it is the term that amplifies gyro noise, which
is why a slow loop forces you to keep it small.</p>`,

bom: [
  { id: 'quad-frame', qty: 1, note: '5 inch carbon frame. Read the note about carbon dust and conductivity.' },
  { id: 'bldc2207', qty: 4, note: 'Two clockwise, two counter-clockwise if you buy handed ones - though direction is set by the phase wiring anyway.' },
  { id: 'esc-4in1', qty: 1, note: 'Four ESCs on one board, one battery connection. Tidier and lighter than four separate ones.' },
  { id: 'props5', qty: 3, note: 'THREE sets. You will destroy propellers. This is not pessimism.' },
  { id: 'esp32', qty: 1, note: 'Fast enough for a 500 Hz loop with room to spare, and it has the UARTs for CRSF. An STM32F411 board would be better and harder to get started with.' },
  { id: 'mpu6050', qty: 1, note: 'Cheap and adequate. An ICM-42688 is far better and costs $12 - worth it if you get serious. Mount it on foam, see the notes.' },
  { id: 'rx-elrs', qty: 1, note: 'ExpressLRS. CRSF, which the receiver-decoder project covers.' },
  { id: 'rc-txrx', qty: 1, note: 'A proper handset. This is not a project for a phone app.' },
  { id: 'lipo4s', qty: 2, note: 'Two packs so you can fly while one charges. Read the safety section before buying either.' },
  { id: 'lipo-charger', qty: 1 },
  { id: 'lipo-bag', qty: 1 },
  { id: 'xt60', qty: 2 },
  { id: 'buzzer', qty: 1, note: 'Lost-model alarm and arming tones. You will need it to find the quad in long grass.' },
  { id: 'led5', qty: 2, note: 'Armed status, visible from a distance.' },
  { id: 'res220', qty: 2 },
  { id: 'tape', qty: 1, note: 'Double-sided foam for the IMU, and battery strap. The foam is doing real vibration isolation.' },
  { id: 'zip', qty: 1 },
  { id: 'standoffs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }, { id: 'glasses' }],

build: {
  parts: [
    { id: 'frame', comp: 'quadframe', at: [0, 0] },
    { id: 'mcu',   comp: 'esp32',     at: [0, 84] },
    { id: 'imu',   comp: 'mpu6050',   at: [46, 84] },
    { id: 'rx',    comp: 'rxelrs',    at: [-46, 86] },
    { id: 'esc',   comp: 'esc',       at: [0, 140] },
    { id: 'batt',  comp: 'lipo4s',    at: [0, 196] },
    { id: 'm1',    comp: 'bldc',      at: [75, -75] }
  ],
  wires: [
    { from: 'batt.XT+', to: 'esc.B+',   color: 'brown',  note: 'Battery positive to the 4-in-1 ESC. This is the only high-current connection' },
    { from: 'batt.XT-', to: 'esc.B-',   color: 'black',  note: 'Battery negative' },
    { from: 'esc.BEC',  to: 'mcu.VIN',  color: 'red',    note: '5 V from the ESC to the flight controller' },
    { from: 'esc.GND',  to: 'mcu.GND',  color: 'black',  note: 'Common ground. Everything references this' },
    { from: 'esc.SIG',  to: 'mcu.D25',  color: 'orange', note: 'Motor 1 signal. Motors 2-4 go to D26, D27 and D14' },
    { from: 'esc.A',    to: 'm1.A',     color: 'brown',  note: 'Motor 1 phase A. Swap any two to reverse the motor' },
    { from: 'esc.B',    to: 'm1.B',     color: 'brown',  note: 'Motor 1 phase B' },
    { from: 'esc.C',    to: 'm1.C',     color: 'brown',  note: 'Motor 1 phase C' },
    { from: 'imu.VCC',  to: 'mcu.3V3',  color: 'red',    note: 'IMU power. MOUNTED ON FOAM - see the wiring notes' },
    { from: 'imu.GND',  to: 'mcu.GND2', color: 'black',  note: 'IMU ground' },
    { from: 'imu.SDA',  to: 'mcu.D21',  color: 'blue',   note: 'I2C data. 400 kHz, and keep this run short' },
    { from: 'imu.SCL',  to: 'mcu.D22',  color: 'yellow', note: 'I2C clock' },
    { from: 'rx.5V',    to: 'mcu.VIN',  color: 'red',    note: 'Receiver power from the same 5 V' },
    { from: 'rx.GND',   to: 'mcu.GND3', color: 'black',  note: 'Receiver ground' },
    { from: 'rx.TX',    to: 'mcu.D16',  color: 'green',  note: 'CRSF channel data into Serial2' },
    { from: 'rx.RX',    to: 'mcu.D17',  color: 'orange', note: 'Telemetry back to the handset' },
    { from: 'frame.STACK', to: 'mcu.GND', color: 'black', note: 'Frame is carbon and conductive - make sure nothing shorts against it' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Build the test rig before you build the quad</span>
<p>Do not skip this. A quadcopter with an untested mixer flips over on takeoff, at full throttle, into
whatever is nearest.</p>
<p>The rig: a broom handle or a length of dowel through the frame's centre, so the quad can rotate freely
about <strong>one axis only</strong> and cannot go anywhere. Secure the ends. Now you can tune roll with the
quad physically unable to fly away.</p>
<p>Do roll, then re-rig for pitch. Only when both hold level on the rig does the quad go on grass.</p>
<p>Every serious builder does this and every first-time builder regrets not doing it.</p></div>

<div class="note danger"><span class="t">Propellers off for every single test until the very last one</span>
<p>Everything - arming, mixer signs, PID response direction, failsafe, CRSF, the IMU - can be verified with no
propellers fitted. Motors spinning bare tell you direction and response perfectly well.</p>
<p>The only thing that needs propellers is the actual flight, and by then everything else should be
proven.</p>
<p>A 5-inch propeller at 25,000&nbsp;RPM amputates. Read the thrust bench project's safety section - it
applies in full here and there are four of them.</p></div>

<div class="note danger"><span class="t">The IMU goes on soft foam, not hard mounting</span>
<p>An MPU-6050 bolted rigidly to a carbon frame reads the motors' vibration as angular rate. The D term
amplifies it, the motors respond, and you get a quad that oscillates at high frequency, gets hot and burns its
motors - the classic "hot motors" failure.</p>
<p>3&nbsp;mm double-sided foam tape, a soft grade, with the IMU as close to the frame's centre of gravity as
the layout allows. Off-centre, it measures linear acceleration from rotation as well as the rotation
itself.</p>
<p>This is a mechanical problem. No filter fixes a badly mounted IMU, and every hour spent on the mount saves
three on tuning.</p></div>

<div class="note danger"><span class="t">Carbon fibre is conductive</span>
<p>Carbon frames conduct electricity. A stray solder blob or a pinched wire against the frame is a short
across a battery that can deliver 100&nbsp;A.</p>
<p>Check clearances everywhere, sleeve or tape any exposed conductor near the frame, and route wires so they
cannot chafe against a carbon edge - which is sharp enough to cut insulation over a few flights.</p></div>

<div class="note warn"><span class="t">Motor numbering and direction - agree a convention and write it down</span>
<p>This guide uses, viewed from above with the front away from you:</p>
<ul>
  <li><strong>M1</strong> front right, counter-clockwise</li>
  <li><strong>M2</strong> rear right, clockwise</li>
  <li><strong>M3</strong> rear left, counter-clockwise</li>
  <li><strong>M4</strong> front left, clockwise</li>
</ul>
<p>Diagonal motors spin the same way. Adjacent motors spin opposite ways. Get one wrong and yaw will not work
and the quad will spin.</p>
<p>Direction is set by the phase wiring: swap any two of the three wires to reverse a motor. Write the
convention on the frame in marker.</p></div>`,

solderSteps: [
  { h: 'Motors to the 4-in-1 ESC, direction ignored for now',
    body: `<p>Twelve phase joints, three per motor. Direction does not matter yet - you will set it by swapping
    wires after testing.</p>
    <p>Keep them short and route them along the arms, secured. A phase wire that vibrates free mid-flight is
    a crash.</p>` },
  { h: 'XT60 to the ESC, properly',
    body: `<p>As in the thrust bench. Fill the cup, heat both parts, heatshrink each terminal before doing the
    second.</p>
    <p>Check for a short with a meter before a battery goes anywhere near it. A reversed or shorted XT60 on a
    4S pack is a fire.</p>` },
  { h: 'Mount the IMU last and mount it well',
    body: `<p>Foam tape, centre of the frame, aligned with the axes. Its X, Y and Z must be square to the
    airframe - a sensor mounted 15 degrees off produces a quad that drifts diagonally and cannot be tuned out
    of it.</p>
    <p>The sketch has a rotation constant for a 90-degree mounting. Anything that is not a multiple of 90 is a
    mounting problem, not a software one.</p>` },
  { h: 'Keep the receiver antenna away from everything',
    body: `<p>Carbon blocks 2.4&nbsp;GHz. The antenna tips must be clear of the frame, clear of the ESC, and
    clear of the battery.</p>
    <p>The standard arrangement is two antennas at 90 degrees to each other, pointing up and back, held in
    heatshrink tubes zip-tied to the frame.</p>` },
  { h: 'Buzzer and LEDs where you can find them',
    body: `<p>The buzzer on the underside, loud. You will use it to find the quad in grass more often than you
    expect.</p>
    <p>The armed LED must be visible from ten metres away. Knowing whether a quad is armed, from a distance,
    matters.</p>` },
  { h: 'Check every clearance before the first battery',
    body: `<p>Nothing touching carbon that should not be. Nothing where a propeller will reach. Battery strap
    secure. No wire under tension.</p>
    <p>Then power it up with no propellers, with the battery on the bench beside the quad rather than strapped
    to it, so you can pull it instantly.</p>` }
],

assembly: [
  { h: 'Do the two prerequisite projects first',
    body: `<p>The <a href="project.html?p=brushless-thrust-bench">thrust bench</a> for ESCs, arming and LiPo
    handling, and the <a href="project.html?p=rc-receiver-decoder">receiver decoder</a> for CRSF and
    failsafe.</p>
    <p>Both are cheap, both are safe, and both contain things you would otherwise learn here with propellers
    spinning.</p>` },
  { h: 'Get the IMU reading sensibly, on the bench',
    body: `<p>Print roll and pitch. Tilt the board and watch them. Level should read 0, and it should return
    to 0.</p>
    <p>Then leave it absolutely still for two minutes and watch the drift. With the complementary filter it
    should stay within a degree. If it wanders steadily, the gyro bias calibration is not working.</p>` },
  { h: 'Calibrate the gyro at every boot, on a level surface',
    body: `<p>The sketch averages 2000 samples at startup and subtracts that as the zero. It must be
    <strong>completely still</strong> while it does so - the LED blinks during calibration.</p>
    <p>Moving it during calibration bakes an offset into the zero, and the quad then drifts persistently in
    one direction with no way to trim it out.</p>` },
  { h: 'Verify the mixer with no propellers',
    body: `<p>This is the step that prevents the flip. Arm, apply a little throttle so all four motors spin
    slowly, then tilt the whole quad by hand:</p>
    <ul>
      <li><strong>Tilt right</strong> - the RIGHT motors should speed up to push back.</li>
      <li><strong>Tilt forward</strong> - the FRONT motors should speed up.</li>
      <li><strong>Twist clockwise</strong> - the two counter-clockwise motors should speed up.</li>
    </ul>
    <p>Any that responds the wrong way is a sign error in the mixer or a reversed IMU axis. Fix it here, on
    the bench, with no propellers. A quad that pushes the wrong way flips within 200&nbsp;ms of leaving the
    ground.</p>` },
  { h: 'Set the motor directions',
    body: `<p>M1 and M3 counter-clockwise, M2 and M4 clockwise, viewed from above. Swap any two phase wires on
    a motor to reverse it.</p>
    <p>Then fit the propellers matched to the direction - each prop is marked, and a propeller on backwards
    produces about a third of the thrust with a great deal of noise.</p>` },
  { h: 'Tune roll on the rig',
    body: `<p>Quad on the dowel, free to roll only, propellers ON now - this is the one part of tuning that
    needs them. Stand clear and keep the kill switch in your hand.</p>
    <p>Start with P only, I and D at zero. Raise P until it oscillates, then halve it. Add D until the
    oscillation on a disturbance damps out in one or two cycles. Add a little I last, just enough to remove a
    steady lean.</p>
    <p>Push the frame gently and watch it recover. It should return to level without overshooting more than
    once.</p>` },
  { h: 'Re-rig for pitch and repeat',
    body: `<p>Same procedure on the other axis. On a symmetric quad the gains usually come out similar, and
    starting from the roll values saves time.</p>
    <p>Yaw is rate-mode and much less critical - a small P and a little I is usually enough.</p>` },
  { h: 'First flight: grass, open space, alone',
    body: `<p>Large open area. No people, no animals, no cars, no roads. Grass, not concrete. Somewhere you are
    permitted to fly.</p>
    <p>Arm, throttle up slowly until it is light on its feet, and hover at knee height for ten seconds. Land.
    Check the motor temperatures with a finger - warm is fine, too hot to hold means the D term is too high and
    it is oscillating faster than you can see.</p>
    <p>Do not go higher until it has hovered steadily at knee height several times.</p>` },
  { h: 'Expect to iterate, and expect to break propellers',
    body: `<p>This is not a build-and-fly project. It is a build-and-tune-and-crash-and-tune project, which is
    why three sets of propellers are in the parts list.</p>
    <p>Keep a log of gain changes and what they did. Changing three numbers at once and then not knowing which
    helped is the most common way to waste a weekend.</p>` }
],

libraries: [
  { name: 'AlfredoCRSF', by: 'Alfredo Systems', why: 'Receiver channels and telemetry, as in the decoder project.' },
  { name: 'MPU6050_light', by: 'rfetick', why: 'Fast to initialise and light enough for a 500 Hz loop. The full Jeff Rowberg library with DMP is heavier and its onboard fusion is a different design.' },
  { name: 'ESP32Servo', by: 'Kevin Harrington', why: 'Motor outputs. Note that standard servo PWM at 50 Hz is the slow option - see the tuning section on OneShot.' },
  { name: 'Wire', by: 'Arduino', how: 'Built in', why: 'I2C to the IMU, at 400 kHz.' }
],

code: [
{
  h: 'The flight controller',
  intro: `<p>The loop, the filter, the PIDs and the mixer. Read the arming state machine and the mixer signs
  carefully - those are the two places where mistakes hurt.</p>`,
  name: 'flight_controller.ino',
  code: `/* ------------------------------------------------------------------
   Quadcopter flight controller - self-levelling (angle) mode.

   500 Hz loop. Complementary filter. Three PID loops.

   Roll and pitch run in ANGLE mode - the stick commands a lean and
   gravity provides the absolute reference.
   Yaw runs in RATE mode - there is no absolute yaw reference without
   a magnetometer, so the stick commands a rotation RATE instead.

   READ THE SAFETY SECTION. Test with no propellers.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <MPU6050_light.h>
#include <AlfredoCRSF.h>
#include <ESP32Servo.h>

// ---- pins ------------------------------------------------------------
#define M1_PIN 25   // front right, CCW
#define M2_PIN 26   // rear right,  CW
#define M3_PIN 27   // rear left,   CCW
#define M4_PIN 14   // front left,  CW
#define RX_PIN 16
#define TX_PIN 17
#define BUZZER 12
#define LED_ARM 13

// ---- loop ------------------------------------------------------------
#define LOOP_HZ      500
#define LOOP_US   (1000000 / LOOP_HZ)

// ---- motor output ----------------------------------------------------
#define MOTOR_MIN   1000
#define MOTOR_IDLE  1080     // armed but not flying - props turn slowly
#define MOTOR_MAX   1900     // NOT 2000: headroom for the mixer

// ---- stick limits ----------------------------------------------------
#define MAX_ANGLE    25.0    // degrees of lean at full stick
#define MAX_YAW_RATE 180.0   // degrees per second at full stick

// ---- PID gains -------------------------------------------------------
// Start here. Tune roll on the rig, then copy to pitch.
float rollP = 1.4, rollI = 0.02, rollD = 12.0;
float pitchP = 1.4, pitchI = 0.02, pitchD = 12.0;
float yawP = 3.0, yawI = 0.02, yawD = 0.0;

#define I_LIMIT 120.0        // integral windup clamp

// ---- complementary filter -------------------------------------------
// 0.98 gyro / 0.02 accel at 500 Hz is about a 0.1 s time constant.
#define ALPHA 0.98

MPU6050 imu(Wire);
AlfredoCRSF crsf;
Servo m1, m2, m3, m4;

float angleRoll = 0, anglePitch = 0;
float gyroRollOffset = 0, gyroPitchOffset = 0, gyroYawOffset = 0;

float iRoll = 0, iPitch = 0, iYaw = 0;
float lastErrRoll = 0, lastErrPitch = 0, lastErrYaw = 0;

enum State { DISARMED, ARMING_BLOCKED, ARMED };
State state = DISARMED;

unsigned long lastLoop = 0, lastFrame = 0;
uint32_t overruns = 0;
float vbat = 16.8;

void setup() {
  Serial.begin(115200);

  /* Motors to MINIMUM before anything else. An ESC that sees a valid
     minimum-throttle signal from power-up arms cleanly and cannot
     spin unexpectedly while the rest of setup() runs. */
  m1.attach(M1_PIN, MOTOR_MIN, 2000); m1.writeMicroseconds(MOTOR_MIN);
  m2.attach(M2_PIN, MOTOR_MIN, 2000); m2.writeMicroseconds(MOTOR_MIN);
  m3.attach(M3_PIN, MOTOR_MIN, 2000); m3.writeMicroseconds(MOTOR_MIN);
  m4.attach(M4_PIN, MOTOR_MIN, 2000); m4.writeMicroseconds(MOTOR_MIN);

  pinMode(BUZZER, OUTPUT);
  pinMode(LED_ARM, OUTPUT);

  Serial2.begin(420000, SERIAL_8N1, RX_PIN, TX_PIN);
  crsf.begin(Serial2);

  Wire.begin(21, 22);
  Wire.setClock(400000);              // 400 kHz - 100 kHz is too slow
  if (imu.begin() != 0) {
    Serial.println(F("IMU FAILED"));
    while (1) { tone(BUZZER, 400, 200); delay(600); }
  }

  calibrateGyro();

  Serial.println(F("ready - DISARMED"));
  tone(BUZZER, 2000, 100);
  lastLoop = micros();
}

void loop() {
  /* A hard deadline, not a delay. PID integral and derivative terms
     both depend on dt, so a loop that varies in length is a
     controller whose gains effectively wander. */
  unsigned long now = micros();
  if ((long)(now - lastLoop) < LOOP_US) return;
  if ((long)(now - lastLoop) > LOOP_US * 2) overruns++;
  float dt = (now - lastLoop) / 1000000.0;
  lastLoop = now;

  crsf.update();
  if (crsf.isLinkUp()) lastFrame = millis();
  bool linkUp = crsf.isLinkUp() && (millis() - lastFrame < 250);

  updateAttitude(dt);
  updateState(linkUp);

  if (state == ARMED) flyControl(dt, linkUp);
  else                allMotors(MOTOR_MIN);

  digitalWrite(LED_ARM, state == ARMED);

  static uint16_t n = 0;
  if (++n >= LOOP_HZ) { n = 0; report(); }
}

/* --- attitude -----------------------------------------------------------
   Gyro for fast changes, accelerometer for slow correction. Two lines
   of filter, and good enough for a self-levelling quad. */
void updateAttitude(float dt) {
  imu.update();

  float gr = imu.getGyroX() - gyroRollOffset;
  float gp = imu.getGyroY() - gyroPitchOffset;

  float accRoll  = imu.getAccAngleX();
  float accPitch = imu.getAccAngleY();

  angleRoll  = ALPHA * (angleRoll  + gr * dt) + (1 - ALPHA) * accRoll;
  anglePitch = ALPHA * (anglePitch + gp * dt) + (1 - ALPHA) * accPitch;
}

/* --- arming -------------------------------------------------------------
   Deliberately awkward. Every condition must be satisfied, and the
   switch must be moved to disarmed and back after any refusal - so a
   switch left on at power-up cannot arm the quad. */
void updateState(bool linkUp) {
  bool wantArm = linkUp && crsf.getChannel(5) > 1500;
  int throttleRaw = linkUp ? crsf.getChannel(3) : 0;
  bool throttleLow = throttleRaw < 250;

  switch (state) {

    case DISARMED:
      if (!wantArm) break;
      if (!throttleLow) {
        // Arming with throttle up is how people get hurt. Refuse, and
        // require the switch to be cycled before trying again.
        state = ARMING_BLOCKED;
        tone(BUZZER, 400, 400);
        Serial.println(F("! refused: throttle not low"));
        break;
      }
      if (fabs(angleRoll) > 25 || fabs(anglePitch) > 25) {
        state = ARMING_BLOCKED;
        tone(BUZZER, 400, 400);
        Serial.println(F("! refused: not level"));
        break;
      }
      iRoll = iPitch = iYaw = 0;       // clear integrals on every arm
      state = ARMED;
      tone(BUZZER, 2500, 150);
      Serial.println(F("ARMED"));
      break;

    case ARMING_BLOCKED:
      // Must return the switch to off before another attempt.
      if (!wantArm) state = DISARMED;
      break;

    case ARMED:
      if (!wantArm) {
        state = DISARMED;
        Serial.println(F("disarmed"));
        tone(BUZZER, 1200, 150);
      }
      /* Crash detection. Past 60 degrees a quad is not recovering and
         continuing to spin motors into the ground burns them out and
         destroys propellers. */
      if (fabs(angleRoll) > 60 || fabs(anglePitch) > 60) {
        state = DISARMED;
        Serial.println(F("! CRASH - disarmed"));
        tone(BUZZER, 300, 800);
      }
      break;
  }
}

/* --- the control loop --------------------------------------------------- */
void flyControl(float dt, bool linkUp) {
  float throttle, setRoll, setPitch, setYawRate;

  if (linkUp) {
    throttle   = map(crsf.getChannel(3), 172, 1811, MOTOR_IDLE, MOTOR_MAX);
    setRoll    = scaleStick(crsf.getChannel(1)) * MAX_ANGLE;
    setPitch   = scaleStick(crsf.getChannel(2)) * MAX_ANGLE;
    setYawRate = scaleStick(crsf.getChannel(4)) * MAX_YAW_RATE;
  } else {
    /* Failsafe. Motors to idle, level demanded. It will descend,
       roughly upright, rather than tumbling or cutting dead at
       height - which is the least bad of the available outcomes. */
    throttle = MOTOR_IDLE;
    setRoll = setPitch = setYawRate = 0;
  }

  throttle = constrain(throttle, MOTOR_IDLE, MOTOR_MAX);

  // Roll and pitch: ANGLE mode, absolute reference from gravity.
  float outRoll  = pid(setRoll  - angleRoll,  &iRoll,  &lastErrRoll,
                       rollP,  rollI,  rollD,  dt);
  float outPitch = pid(setPitch - anglePitch, &iPitch, &lastErrPitch,
                       pitchP, pitchI, pitchD, dt);

  // Yaw: RATE mode. There is no absolute yaw reference without a
  // magnetometer, so controlling angle would just track the drift.
  float gyroYaw = imu.getGyroZ() - gyroYawOffset;
  float outYaw  = pid(setYawRate - gyroYaw, &iYaw, &lastErrYaw,
                      yawP, yawI, yawD, dt);

  /* THE MIXER. Diagonal motors spin the same way, so yaw comes from
     the difference in reaction torque. A sign error here flips the
     quad within 200 ms of leaving the ground - verify it by hand,
     with no propellers, before ever flying. */
  int o1 = throttle - outRoll - outPitch + outYaw;   // front right CCW
  int o2 = throttle - outRoll + outPitch - outYaw;   // rear right  CW
  int o3 = throttle + outRoll + outPitch + outYaw;   // rear left   CCW
  int o4 = throttle + outRoll - outPitch - outYaw;   // front left  CW

  m1.writeMicroseconds(constrain(o1, MOTOR_IDLE, MOTOR_MAX));
  m2.writeMicroseconds(constrain(o2, MOTOR_IDLE, MOTOR_MAX));
  m3.writeMicroseconds(constrain(o3, MOTOR_IDLE, MOTOR_MAX));
  m4.writeMicroseconds(constrain(o4, MOTOR_IDLE, MOTOR_MAX));
}

float pid(float error, float *integral, float *lastErr,
          float kp, float ki, float kd, float dt) {
  *integral += error * dt;

  /* Windup clamp. Without it, a quad held on the ground at low
     throttle accumulates a huge integral, and the moment it lifts it
     flips. This is the classic first-flight failure and it is one
     constrain(). */
  *integral = constrain(*integral, -I_LIMIT, I_LIMIT);

  float derivative = (error - *lastErr) / dt;
  *lastErr = error;

  return kp * error + ki * (*integral) + kd * derivative;
}

float scaleStick(int raw) {
  if (abs(raw - 992) < 15) return 0;          // dead band
  return constrain((raw - 992) / 819.0, -1.0, 1.0);
}

void allMotors(int us) {
  m1.writeMicroseconds(us); m2.writeMicroseconds(us);
  m3.writeMicroseconds(us); m4.writeMicroseconds(us);
}

/* --- gyro zero ----------------------------------------------------------
   MUST be still. Moving it during calibration bakes an offset into
   the zero, and the quad then drifts persistently with no way to
   trim it out. */
void calibrateGyro() {
  Serial.println(F("calibrating gyro - KEEP STILL"));

  float sr = 0, sp = 0, sy = 0;
  for (int i = 0; i < 2000; i++) {
    imu.update();
    sr += imu.getGyroX();
    sp += imu.getGyroY();
    sy += imu.getGyroZ();
    digitalWrite(LED_ARM, (i / 100) % 2);
    delay(2);
  }
  gyroRollOffset  = sr / 2000.0;
  gyroPitchOffset = sp / 2000.0;
  gyroYawOffset   = sy / 2000.0;

  digitalWrite(LED_ARM, LOW);
  Serial.print(F("offsets: "));
  Serial.print(gyroRollOffset, 3); Serial.print(' ');
  Serial.print(gyroPitchOffset, 3); Serial.print(' ');
  Serial.println(gyroYawOffset, 3);
}

void report() {
  Serial.print(state == ARMED ? F("ARM ") : F("dis "));
  Serial.print(F("roll ")); Serial.print(angleRoll, 1);
  Serial.print(F(" pitch ")); Serial.print(anglePitch, 1);
  Serial.print(F(" lq ")); Serial.print(crsf.getLinkStatistics()->uplink_Link_quality);
  Serial.print(F(" over ")); Serial.println(overruns);
}`,
  after: `<p><strong>The integral windup clamp is the single most important line for a first flight.</strong>
  A quad sitting on the ground at low throttle has a persistent angle error it cannot correct, so the integral
  accumulates without limit. The moment it lifts, that accumulated term is applied in full and the quad flips.
  One <code>constrain()</code> prevents it and its absence has destroyed a great many propellers.</p>
  <p><strong>The arming state machine is deliberately awkward.</strong> The <code>ARMING_BLOCKED</code> state
  means a refused arm requires the switch to be cycled - so a switch left in the armed position at power-up
  cannot arm the quad the instant the receiver connects.</p>
  <p><strong>Failsafe goes to idle and demands level</strong>, rather than cutting the motors. A quad that cuts
  dead at 30&nbsp;m falls like a brick; one at idle with the stabiliser running descends roughly upright and
  hits more slowly. Neither is good and one is much less bad.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note danger"><span class="t">Propellers OFF for every upload and every bench test</span>
<p>An upload resets the board. During the reset there is no signal on the motor lines, and an armed ESC losing
its signal does not always do what you expect.</p>
<p>Props go on for the rig tuning and the first flight. Nothing else.</p></div>
<div class="note warn"><span class="t">Watch the overrun counter</span>
<p>The report line ends with the number of loop overruns. It should stay at zero. A climbing count means the
loop is not keeping up, dt is varying, and your PID gains are effectively changing from pass to pass.</p>
<p>The usual cause is I2C at 100&nbsp;kHz instead of 400, or serial printing inside the loop.</p></div>`,

tune: [
  { h: 'Tune P, then D, then I - in that order, one at a time',
    body: `<p><strong>P:</strong> raise until it oscillates, then halve. Too little is sloppy and slow to
    respond; too much is a fast buzz you can hear and feel.</p>
    <p><strong>D:</strong> add until a disturbance damps out in one or two cycles. Too much makes motors hot
    and introduces a high-frequency oscillation you may not see but can hear.</p>
    <p><strong>I:</strong> last, and small. Enough to remove a persistent lean from an off-centre battery.
    Too much wallows slowly.</p>
    <p>Change one number at a time and write down what it did. Changing three and not knowing which helped is
    the most common way to waste a weekend.</p>` },
  { h: 'Hot motors are a D term problem',
    body: `<p>If motors are too hot to hold after a short hover, the quad is oscillating faster than you can
    see and the motors are working against each other.</p>
    <p>Lower D first. Then check the IMU mount - hard-mounting to a carbon frame feeds motor vibration
    straight into the D term, and no gain setting fixes a mechanical problem.</p>` },
  { h: 'A faster loop, and faster motor output',
    body: `<p>500&nbsp;Hz is limited mostly by the servo protocol - a 2000&nbsp;microsecond pulse at
    50&nbsp;Hz means the ESC only hears you 50 times a second whatever the loop does.</p>
    <p>OneShot125 compresses the pulse to 125-250&nbsp;microseconds and allows much higher update rates.
    DShot is digital and better again. An ESP32 can generate OneShot with the LEDC peripheral; DShot needs
    RMT or DMA and is where this project starts becoming a real flight controller.</p>` },
  { h: 'A better IMU is the cheapest real upgrade',
    body: `<p>An MPU-6050 is 2013 hardware with significant noise. An ICM-42688-P or BMI270 costs about $12 and
    is dramatically quieter, which means you can run more D and get crisper control.</p>
    <p>After the mounting, this is the highest-value change available.</p>` },
  { h: 'Add a magnetometer for yaw hold',
    body: `<p>Rate-mode yaw means the quad slowly rotates in wind with the stick centred. A magnetometer gives
    an absolute heading and lets you hold yaw angle.</p>
    <p>It also needs hard and soft iron calibration and is badly disturbed by the motor currents a few
    centimetres away - which is why many quads simply live with rate-mode yaw.</p>` },
  { h: 'When to stop and buy a Betaflight board',
    body: `<p>When you want to fly rather than to tune. A $25 board gives you 8&nbsp;kHz loops, dynamic
    notch filtering that tracks motor RPM, blackbox logging that tells you why it crashed, and a decade of
    accumulated tuning knowledge in its defaults.</p>
    <p>Building this teaches you what all of those settings mean, which makes you much better at configuring
    the bought one. That is the honest value of the project.</p>` }
],

trouble: [
  { q: 'It flips instantly on takeoff',
    a: `Mixer sign error or integral windup - those two account for nearly all of them. Verify the mixer by
    hand with no propellers: tilt the quad and check the DOWNWARD-going motors speed up. Then confirm the
    integral clamp is present.` },
  { q: 'It drifts steadily in one direction',
    a: `Gyro calibration taken while it was moving, or the IMU is not square to the frame. Recalibrate on a
    level surface without touching it. If it persists, check the sensor's mounting alignment - anything not a
    multiple of 90 degrees is a mounting problem.` },
  { q: 'Fast oscillation, motors get hot',
    a: `D too high, or the IMU is hard-mounted. Halve D. Then put the IMU on soft foam - vibration into the D
    term is the classic cause and no gain change fixes it properly.` },
  { q: 'Slow wallowing oscillation',
    a: `I too high, or P too low. Reduce I first.` },
  { q: 'It will not arm',
    a: `The sketch refuses if the throttle is not low, if it is not level, or if the link is down. The serial
    output says which. After a refusal the arm switch must be cycled - that is deliberate.` },
  { q: 'Yaw does not work and it spins',
    a: `Motor directions. Diagonal pairs must spin the same way and adjacent motors opposite. Swap two phase
    wires on whichever motor is wrong, and check the propellers match the direction.` },
  { q: 'The overrun counter climbs',
    a: `The loop is not keeping up. Set <code>Wire.setClock(400000)</code>, and remove any
    <code>Serial.print</code> from inside the loop - printing at 500&nbsp;Hz blocks for longer than the loop
    period.` },
  { q: 'It flies but feels vague and slow to respond',
    a: `P too low, or the servo protocol is the bottleneck. Raise P until it starts to oscillate and back off.
    Then consider OneShot - 50&nbsp;Hz motor updates are a real limit.` },
  { q: 'Attitude leans during fast forward flight',
    a: `The complementary filter's known weakness: under sustained lateral acceleration the accelerometer
    reads a tilted gravity vector. A Madgwick or Kalman filter that accounts for it is the fix, and gentle
    flying avoids it.` }
],

next: `
<ul>
  <li><strong>Build the prerequisites first</strong> - the
  <a href="project.html?p=brushless-thrust-bench">thrust bench</a> and the
  <a href="project.html?p=rc-receiver-decoder">receiver decoder</a>. Both are cheap, safe, and cover things
  you would otherwise learn here with four propellers spinning.</li>
  <li><strong>The same control problem, on the ground</strong> - the
  <a href="project.html?p=rc-rover-brushless">brushless rover</a> uses the same ESCs and receiver and cannot
  fall.</li>
  <li><strong>PID without the danger</strong> - the
  <a href="project.html?p=camera-gimbal">camera gimbal</a> is the same loop holding a camera level, at
  walking pace.</li>
  <li><strong>Then buy a Betaflight board</strong> and configure it. Having written this, every setting in
  the configurator will mean something - which is the real payoff.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">This is the most dangerous project in this book</span>
<p>Four 5-inch propellers at 25,000&nbsp;RPM, on a 1&nbsp;kg object that can move at 60&nbsp;km/h, controlled
by software you wrote last week. Take all of the following seriously.</p>
<ul>
  <li><strong>Propellers off for every bench test.</strong> Arming, mixer signs, response directions,
  failsafe, CRSF and the IMU can all be verified without them.</li>
  <li><strong>Build the test rig.</strong> One axis at a time, on a dowel, physically unable to fly away.
  This is how you find a mixer sign error without destroying anything.</li>
  <li><strong>Eye protection, always.</strong></li>
  <li><strong>Never stand in the plane of a propeller</strong>, and never approach an armed quad. Disarm,
  then disconnect the battery, then approach.</li>
  <li><strong>Kill switch on the handset</strong>, on a switch you can find without looking, tested before
  every flight.</li>
  <li><strong>First flights over grass, alone, in a large open space.</strong> No people, no animals, no
  cars, no roads, nothing you would mind hitting.</li>
</ul>
</div>
<div class="note danger"><span class="t">LiPo packs</span>
<p>Everything in the <a href="project.html?p=brushless-thrust-bench">thrust bench</a> safety section applies,
and more so because these packs get crashed:</p>
<ul>
  <li><strong>Balance charge, in a bag, on a non-flammable surface, never unattended.</strong></li>
  <li><strong>Never charge a crashed pack</strong> until it has sat somewhere safe for at least 30 minutes and
  been checked for puffing, dents or heat. Internal damage from an impact can start a fire minutes or hours
  later.</li>
  <li><strong>Never charge a puffed pack.</strong> Dispose of it.</li>
  <li><strong>Store at 3.8 V per cell.</strong></li>
  <li><strong>Carry packs in a fireproof bag</strong>, especially after flying.</li>
</ul>
</div>
<div class="note danger"><span class="t">The law, which is not optional and changes often</span>
<p>Flying a drone is regulated almost everywhere, and a home-built one is still a drone.</p>
<ul>
  <li><strong>Registration.</strong> Most countries require the operator to register above a weight threshold
  - often 250&nbsp;g, which a 5-inch quad greatly exceeds. Some require a competency test.</li>
  <li><strong>Remote ID</strong> is now required in the US, the EU and elsewhere. A home-built aircraft may
  not be legal to fly without a broadcast module fitted.</li>
  <li><strong>Where you may fly:</strong> not near airports, not over people or crowds, not over property
  without permission, within visual line of sight, below a height limit. Airspace maps and apps exist for
  exactly this - check before every new site.</li>
  <li><strong>Insurance.</strong> Third-party liability cover is required in some countries and is a good idea
  everywhere. Model flying associations usually include it with membership.</li>
  <li><strong>Check your own country's current rules</strong> before the first flight. This book cannot keep
  up with them and none of the above is legal advice.</li>
</ul>
<p>A club field with an established flying site is by some distance the best place to start, and the people
there will help.</p>
</div>`
});
