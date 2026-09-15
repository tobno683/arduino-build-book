/* Two-wheel robot: L298N, TT motors, HC-SR04 on a scanning servo. */
AB.addProject({
slug: 'obstacle-avoiding-robot',
title: 'Obstacle-avoiding robot',
cat: 'robotics',
level: 3,
time: '4 hours',
solder: true,
board: 'Uno',
feature: true,
tags: ['l298n', 'tt motor', 'hc-sr04', 'servo', 'robot', 'chassis', 'pwm'],
blurb: 'Drives forward, sweeps its head left and right when something is in the way, and turns towards whichever side has more room.',

skills: ['H-bridges', 'PWM speed control', 'Ultrasonic ranging', 'Servo scanning', 'Separate motor supplies', 'Simple decision logic'],

intro: `
<p>This is the classic first robot, and the classic first robot usually disappoints because of two things
nobody warns you about: the motors brown out the Arduino, and a single fixed ultrasonic sensor cannot see
anything that is not directly in front of it. Both are solved here - one with a separate battery, one with a
servo that turns the sensor into a scanner.</p>
<p>The behaviour is deliberately simple: drive, and when something gets close, stop, look left, look right, and
go whichever way has more space. That is enough to wander a room for an hour, and it is a much better base to
build on than a black box.</p>`,

what: [
  'Drive forward at a settable speed on two geared motors.',
  'Measure the distance ahead ten times a second, with a median filter so one bad echo does not make it panic.',
  'On an obstacle: stop, reverse a little, sweep the sensor to both sides, compare, and turn towards the open one.',
  'Refuse to drive if it is stuck against something, rather than grinding the motors.',
  'Run about 45 minutes on six AA cells.'
],

how: `
<p>An <strong>H-bridge</strong> is four switches around a motor. Close the top-left and bottom-right and
current runs one way; close the other diagonal and it runs the other way. That is how you reverse a motor
electrically. The L298N contains two of them, which is why one board drives two motors.</p>
<p>Each side has two <em>direction</em> pins and one <em>enable</em> pin. Direction decides forwards or
backwards; the enable pin takes PWM and decides how fast. That is the entire interface.</p>
<p>The L298N is an old bipolar design and drops about 2&nbsp;V across itself. Feed it 9&nbsp;V and the motors
see 7. That matters on battery, and it is why the more modern TB6612FNG is worth considering - it drops around
0.5&nbsp;V and is the same price.</p>
<p><strong>The HC-SR04</strong> sends a 40&nbsp;kHz burst when you pulse TRIG for 10&nbsp;&micro;s, then holds
ECHO high for as long as the sound takes to come back. Distance in cm is
<code>microseconds / 58</code>, because sound travels about 343&nbsp;m/s and the trip is there and back.</p>
<p>Its weaknesses are worth knowing: it cannot see anything closer than 2&nbsp;cm, soft things absorb the pulse
and read as "nothing there", and an angled surface bounces the echo away like a mirror. That last one is why
robots drive confidently into the corner of a table leg.</p>`,

bom: [
  { id: 'uno', qty: 1 },
  { id: 'car-chassis', qty: 1, note: 'The acrylic 2WD kit with two TT motors, two wheels, a castor and a battery box. Everything pre-drilled.' },
  { id: 'l298n', qty: 1, note: 'Or a TB6612FNG for better efficiency - the code changes by three lines.' },
  { id: 'hcsr04', qty: 1 },
  { id: 'sg90', qty: 1, note: 'To sweep the sensor. Buy two if you want to add a tilt later.' },
  { id: 'batt-aa6', qty: 1, note: 'Six AA cells give 9 V, which after the L298N drop is about 7 V at the motors. A 2S LiPo also works.' },
  { id: 'switch', qty: 1, note: 'Main power switch. You will use it constantly.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'cap1000', qty: 1, note: 'Across the motor supply. Not optional on a motor project.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'zip', qty: 1 },
  { id: 'standoffs', qty: 1 }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'cutters' }, { id: 'dmm' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'uno',  comp: 'uno',     at: [0, 0] },
    { id: 'drv',  comp: 'l298n',   at: [-4, -76], ry: 180 },
    { id: 'srv',  comp: 'servo',   at: [62, -70], ry: 90 },
    { id: 'son',  comp: 'hcsr04',  at: [62, -112] },
    { id: 'ml',   comp: 'ttmotor', at: [-92, -96], ry: 180 },
    { id: 'mr',   comp: 'ttmotor', at: [-92, -20] },
    { id: 'batt', comp: 'block',   at: [0, 78], opt: { w: 78, h: 22, d: 58, c: '#3a3f45' }, label: '6x AA battery pack' }
  ],
  wires: [
    { from: 'batt.n',  to: 'drv.12V',  color: 'red',    note: '9 V from the pack into the driver, through the main switch' },
    { from: 'batt.f',  to: 'drv.GND',  color: 'black',  note: 'Battery negative' },
    { from: 'drv.5V',  to: 'uno.5V',   color: 'red',    note: 'The L298N regulator powers the Uno. Only valid below 12 V in' },
    { from: 'drv.GND', to: 'uno.GND1', color: 'black',  note: 'COMMON GROUND. Nothing works without this' },
    { from: 'drv.ENA', to: 'uno.D5',   color: 'orange', note: 'Left speed, PWM' },
    { from: 'drv.IN1', to: 'uno.D7',   color: 'blue',   note: 'Left direction A' },
    { from: 'drv.IN2', to: 'uno.D8',   color: 'blue',   note: 'Left direction B' },
    { from: 'drv.IN3', to: 'uno.D9',   color: 'green',  note: 'Right direction A' },
    { from: 'drv.IN4', to: 'uno.D11',  color: 'green',  note: 'Right direction B' },
    { from: 'drv.ENB', to: 'uno.D6',   color: 'orange', note: 'Right speed, PWM' },
    { from: 'drv.OUT1', to: 'ml.+',    color: 'brown',  note: 'Left motor' },
    { from: 'drv.OUT2', to: 'ml.-',    color: 'brown',  note: 'Left motor' },
    { from: 'drv.OUT3', to: 'mr.+',    color: 'brown',  note: 'Right motor' },
    { from: 'drv.OUT4', to: 'mr.-',    color: 'brown',  note: 'Right motor' },
    { from: 'son.VCC', to: 'uno.5V',   color: 'red',    note: 'Sonar power' },
    { from: 'son.GND', to: 'uno.GND2', color: 'black',  note: 'Sonar ground' },
    { from: 'son.TRIG', to: 'uno.D12', color: 'yellow', note: 'Trigger pulse out' },
    { from: 'son.ECHO', to: 'uno.D13', color: 'white',  note: 'Echo pulse back' },
    { from: 'srv.VCC', to: 'uno.5V',   color: 'red',    note: 'Servo power - see the note about this' },
    { from: 'srv.GND', to: 'uno.GND2', color: 'black',  note: 'Servo ground' },
    { from: 'srv.SIG', to: 'uno.D10',  color: 'purple', note: 'Servo signal' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">The grounds must be joined</span>
<p>Battery negative, L298N ground and Arduino ground are one node. If they are not, the direction signals have
no common reference and the motors do unpredictable things - usually one works and the other twitches. This is
the most common fault on a first robot.</p></div>

<div class="note warn"><span class="t">Remove the 5 V jumper if you use more than 12 V</span>
<p>The L298N has a jumper that enables its onboard 5&nbsp;V regulator. With it fitted, the board powers the
Arduino from the motor battery - convenient, and fine up to about 12&nbsp;V input. Above that the regulator
overheats. Remove the jumper and power the Arduino separately.</p></div>

<div class="note warn"><span class="t">The servo on the Arduino's 5 V is a compromise</span>
<p>An SG90 pulls 150-700&nbsp;mA while it moves. The L298N's regulator can supply about 500&nbsp;mA total, and
the Uno and the sonar want some of that. It works because the servo only moves during a scan, when the motors
are stopped - which is exactly why the sketch stops before it looks.</p>
<p>If yours resets during a scan, add a 470&nbsp;&micro;F capacitor across the 5&nbsp;V rail, or give the servo
its own regulator.</p></div>

<div class="note tip"><span class="t">Pin 13 has the built-in LED on it</span>
<p>Using D13 for ECHO is fine - it is an input, and the LED just flickers. But if you ever see the LED glowing
dimly and the readings are wrong, move ECHO to another pin.</p></div>`,

solderSteps: [
  { h: 'Motor leads first, before anything is assembled',
    body: `<p>TT motors arrive bare. Solder a red and a black lead to each, about 150&nbsp;mm long. The tabs are
    thin metal and will take heat well, so this is quick - but they also bend, so support the tab with a finger
    (not on the hot side) while you solder.</p>
    <p>Do this <strong>before</strong> you bolt the motors into the chassis. Reaching a motor tab through an
    assembled acrylic frame is miserable.</p>` },
  { h: 'Add a suppression capacitor across each motor',
    body: `<p>A 100&nbsp;nF ceramic soldered directly across the two motor tabs. Brushed motors generate a lot
    of electrical noise as the brushes make and break contact, and that noise resets microcontrollers and
    corrupts ultrasonic readings.</p>
    <p>Two five-cent capacitors, and they solve a class of bug that otherwise looks like a software fault.</p>` },
  { h: 'Sleeve and route',
    body: `<p>Heat-shrink over the motor tabs - the joint is exposed and the chassis is metal-screwed. Route the
    leads through the chassis slots, not over the wheels, and cable-tie them.</p>` },
  { h: 'Main switch in the battery positive',
    body: `<p>Cut the battery pack's red lead, strip both ends, solder them to the two outer pins of the slide
    switch, and sleeve. Now you can stop the robot without pulling a battery out, which you will want within
    about four minutes.</p>` },
  { h: 'Perfboard for the sonar and servo connections',
    body: `<p>A small board with a 4-pin socket for the sonar and a 3-pin for the servo, plus a shared 5&nbsp;V
    and ground bus. Solder the 1000&nbsp;&micro;F across that 5&nbsp;V bus - stripe to ground.</p>` },
  { h: 'Mount the sonar on the servo horn',
    body: `<p>The chassis kit usually includes a small bracket. If not, hot glue or double-sided foam tape onto
    the horn works. What matters is that the sensor's two cylinders face forward and stay <em>level</em> - a
    sensor tilted down reads the floor at about 30&nbsp;cm and the robot stops constantly.</p>` },
  { h: 'Check before the first drive',
    body: `<p>Wheels off the ground. Battery positive to ground: no beep. Then power on and confirm each motor
    turns the right way before you let it touch the floor.</p>` }
],

assembly: [
  { h: 'Build the chassis first, alone',
    body: `<p>Peel the protective paper off the acrylic (both sides - everybody misses one). Bolt the motors in,
    fit the wheels, fit the castor. Check the wheels spin freely by hand.</p>` },
  { h: 'Centre the servo before you attach the horn',
    body: `<p>Upload a two-line sketch that writes 90 degrees, then push the horn on so the sensor points
    straight ahead. Attaching the horn first and then discovering the servo's centre is 30&nbsp;degrees off is
    the standard mistake.</p>` },
  { h: 'Check the motor directions and fix them in code, not in wiring',
    body: `<p>Upload the test sketch below, with the wheels off the ground. If a motor runs backwards, swap
    <code>LEFT_FWD</code>/<code>LEFT_BWD</code> in the sketch rather than unsoldering anything.</p>` },
  { h: 'Then check the sonar alone',
    body: `<p>Print distances to the Serial Monitor and wave a book at it. You want stable readings from
    5&nbsp;cm to about 150&nbsp;cm. If it reads 0 or a huge number constantly, check TRIG and ECHO are not
    swapped.</p>` },
  { h: 'First drive, on a clear floor',
    body: `<p>Hard floor, no rugs, nothing fragile. A robot on carpet needs noticeably more power and turns much
    less predictably.</p>` }
],

libraries: [
  { name: 'Servo', by: 'Arduino', how: 'Built in', why: 'The scanning head.' }
],

code: [
{
  h: 'Motor and sensor test',
  name: 'robot_test.ino',
  intro: `<p>Wheels off the ground. This proves every connection before you write any logic.</p>`,
  code: `#include <Servo.h>

#define ENA 5
#define IN1 7
#define IN2 8
#define IN3 9
#define IN4 11
#define ENB 6
#define TRIG 12
#define ECHO 13
#define SERVO_PIN 10

Servo head;

void setup() {
  Serial.begin(9600);
  int pins[] = { ENA, IN1, IN2, IN3, IN4, ENB, TRIG };
  for (int p : pins) pinMode(p, OUTPUT);
  pinMode(ECHO, INPUT);

  head.attach(SERVO_PIN);
  head.write(90);
  delay(500);

  Serial.println(F("LEFT forward"));
  analogWrite(ENA, 180); digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  delay(1500); analogWrite(ENA, 0);

  Serial.println(F("RIGHT forward"));
  analogWrite(ENB, 180); digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  delay(1500); analogWrite(ENB, 0);

  Serial.println(F("head sweep"));
  for (int a = 30; a <= 150; a += 5) { head.write(a); delay(30); }
  head.write(90);

  Serial.println(F("now printing distance"));
}

void loop() {
  Serial.print(readCm());
  Serial.println(F(" cm"));
  delay(300);
}

long readCm() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(3);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000UL);   // 30 ms cap = about 5 m
  if (us == 0) return 400;                  // nothing came back
  return us / 58;
}`,
  after: `<p>The 30&nbsp;ms timeout on <code>pulseIn</code> matters. Without it, a missing echo blocks for a
  full second and the robot becomes unresponsive every time it faces an open room.</p>`
},
{
  h: 'The robot',
  name: 'obstacle_robot.ino',
  code: `/* ------------------------------------------------------------------
   Obstacle-avoiding robot
   L298N on D5-D11, HC-SR04 on D12/D13, scanning servo on D10.
   ------------------------------------------------------------------ */

#include <Servo.h>

// ---- pins ------------------------------------------------------------
#define ENA  5
#define IN1  7
#define IN2  8
#define IN3  9
#define IN4 11
#define ENB  6
#define TRIG 12
#define ECHO 13
#define SERVO_PIN 10

// ---- behaviour -------------------------------------------------------
const int CRUISE_SPEED = 170;   // 0-255. Below ~110 a TT motor will not start
const int TURN_SPEED   = 190;   // turning needs more than driving straight
const int STOP_CM      = 25;    // start avoiding at this distance
const int PANIC_CM     = 12;    // reverse first if this close
const int TURN_MS      = 420;   // roughly a 90 degree turn - measure yours
const int HEAD_CENTRE  = 90;
const int HEAD_LEFT    = 150;
const int HEAD_RIGHT   = 30;
// ----------------------------------------------------------------------

Servo head;
int stuckCount = 0;

void setup() {
  Serial.begin(9600);
  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);

  head.attach(SERVO_PIN);
  head.write(HEAD_CENTRE);
  delay(600);
  Serial.println(F("go"));
}

void loop() {
  long ahead = distanceCm();

  if (ahead > STOP_CM) {
    forward(CRUISE_SPEED);
    stuckCount = 0;
    delay(40);
    return;
  }

  // something in the way
  stop();
  delay(150);

  if (ahead < PANIC_CM) {
    backward(CRUISE_SPEED);
    delay(400);
    stop();
    delay(100);
  }

  // look both ways - the motors are stopped, so the servo has the current
  head.write(HEAD_LEFT);
  delay(350);
  long left = distanceCm();

  head.write(HEAD_RIGHT);
  delay(600);
  long right = distanceCm();

  head.write(HEAD_CENTRE);
  delay(300);

  Serial.print(F("ahead ")); Serial.print(ahead);
  Serial.print(F("  left ")); Serial.print(left);
  Serial.print(F("  right ")); Serial.println(right);

  if (left < STOP_CM && right < STOP_CM) {
    // boxed in - turn around
    stuckCount++;
    turnLeft(TURN_MS * 2);
    if (stuckCount > 3) {
      Serial.println(F("stuck - stopping"));
      stop();
      delay(4000);
      stuckCount = 0;
    }
  } else if (left > right) {
    turnLeft(TURN_MS);
  } else {
    turnRight(TURN_MS);
  }
  stop();
}

/* --- distance, with a median filter ----------------------------------- */
long distanceCm() {
  long a = ping(), b = ping(), c = ping();
  // median of three: one bad echo cannot make the robot swerve
  if (a > b) { long t = a; a = b; b = t; }
  if (b > c) { long t = b; b = c; c = t; }
  if (a > b) { long t = a; a = b; b = t; }
  return b;
}

long ping() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(3);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 25000UL);
  delay(12);                       // the sensor needs a gap between pings
  if (us == 0) return 400;
  return us / 58;
}

/* --- driving ---------------------------------------------------------- */
void forward(int s) {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
  analogWrite(ENA, s);     analogWrite(ENB, s);
}

void backward(int s) {
  digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);  digitalWrite(IN4, HIGH);
  analogWrite(ENA, s);     analogWrite(ENB, s);
}

void turnLeft(int ms) {
  digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH);   // left wheel back
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);    // right wheel forward
  analogWrite(ENA, TURN_SPEED); analogWrite(ENB, TURN_SPEED);
  delay(ms);
  stop();
}

void turnRight(int ms) {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);  digitalWrite(IN4, HIGH);
  analogWrite(ENA, TURN_SPEED); analogWrite(ENB, TURN_SPEED);
  delay(ms);
  stop();
}

void stop() {
  analogWrite(ENA, 0); analogWrite(ENB, 0);
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}`,
  after: `<p>The median-of-three filter is three lines and removes almost all the erratic behaviour people
  associate with cheap ultrasonic sensors. A single bad reading - from an angled surface, a soft object, or the
  robot's own motor noise - would otherwise send it swerving for no visible reason.</p>`
}],

upload: `<p>Uno, correct port. Upload with the robot on a stand and the wheels free. Only put it on the floor
once the Serial Monitor output makes sense.</p>
<div class="note warn"><span class="t">Unplug USB before running on battery</span>
<p>Powering from USB and from the battery at the same time puts two supplies in parallel. It usually survives,
and it is a bad habit. Upload, unplug, switch on.</p></div>`,

tune: [
  { h: 'Measure your turn time',
    body: `<p><code>TURN_MS</code> of 420 is a guess. Put the robot on the floor, mark its heading, and let it
    do one <code>turnLeft(TURN_MS)</code>. Adjust until it turns about 90&nbsp;degrees.</p>
    <p>It will differ on carpet and on wood, and it changes as the batteries drain - which is a good lesson
    about why open-loop timing is a weak way to control position.</p>` },
  { h: 'Find the minimum speed that actually moves',
    body: `<p>TT motors will not start below about 100-110 PWM under load. If the robot hums and does not move,
    raise <code>CRUISE_SPEED</code>. If one wheel starts before the other, they are just different - add a trim
    offset to one side.</p>` },
  { h: 'Fix a robot that drives in a curve',
    body: `<p>Two motors are never identical. Add a constant:
    <code>analogWrite(ENB, s * 0.92)</code> and tune the factor until it tracks straight over three metres.</p>` },
  { h: 'Tilt the sensor correctly',
    body: `<p>Level, or a degree or two up. A downward tilt makes the robot see the floor. Check by putting it
    on the floor facing an open room - it should read over 100&nbsp;cm.</p>` },
  { h: 'Stop distance versus speed',
    body: `<p>At speed 200 a TT-motor robot takes about 15&nbsp;cm to stop. <code>STOP_CM</code> must be
    comfortably more than that, or it will nose into things before it reacts.</p>` }
],

trouble: [
  { q: 'One motor runs, the other does nothing',
    a: `Check ENB is on a PWM pin and is actually being written. Then swap the two motors' connections at the
    L298N: if the fault follows the motor, it is the motor or its wiring; if it stays with the channel, it is
    the driver.` },
  { q: 'Both motors run but the Arduino resets constantly',
    a: `Brownout from motor inrush. Add the 1000&nbsp;&micro;F across the motor supply and the 100&nbsp;nF
    across each motor. If it persists, power the Arduino from its own battery with grounds joined.` },
  { q: 'Distance reads 0 or 400 always',
    a: `TRIG and ECHO swapped, or the sensor is not getting 5&nbsp;V. 400 is the sketch's "nothing came back"
    value; 0 means <code>pulseIn</code> returned instantly, which usually means ECHO is not connected.` },
  { q: 'Readings jump wildly while driving',
    a: `Motor noise. Motor suppression capacitors, and keep the sonar's wires away from the motor leads. Twist
    the sonar's 5&nbsp;V and GND together.` },
  { q: 'Robot drives into table legs and chair legs',
    a: `A thin vertical object reflects almost nothing back on axis, and the beam is about 15&nbsp;degrees wide
    so it can miss it entirely between scans. This is a genuine limitation. Adding a second sensor, or sweeping
    continuously rather than only when blocked, both help.` },
  { q: 'Stops and reverses in the middle of an empty floor',
    a: `The sensor is tilted down and seeing the floor, or a soft rug is absorbing the echo and reading as
    "close". Level the sensor first.` },
  { q: 'Servo jitters constantly',
    a: `Power. The servo and the motors are sharing a regulator that cannot do both. The sketch stops the motors
    before scanning for this reason - if you changed that, change it back.` },
  { q: 'Runs for two minutes then slows down',
    a: `Alkaline AA cells sag badly under a 1&nbsp;A load. Use rechargeable NiMH or a 2S LiPo; the voltage holds
    up far better under load even at the same nominal figure.` }
],

next: `
<ul>
  <li><strong>Add line following</strong>: a three-channel IR sensor array underneath and it can follow a black
  line as well as avoid things.</li>
  <li><strong>Sweep continuously</strong> rather than only when blocked, and keep a small map of the last
  twenty readings. The behaviour becomes noticeably smarter for about thirty lines of code.</li>
  <li><strong>Add encoders</strong> to the wheels and you can turn a measured number of degrees instead of a
  guessed number of milliseconds - the single biggest upgrade available here.</li>
  <li><strong>Put a camera on it</strong>: an <a href="project.html?p=esp32cam-wifi-camera">ESP32-CAM</a> and
  you can drive it from a browser while watching where it is going.</li>
</ul>`
});
