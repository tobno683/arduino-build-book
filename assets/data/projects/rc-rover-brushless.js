/* All the drone hardware, on the ground, where a failure is a stop rather than a fall. */
AB.addProject({
slug: 'rc-rover-brushless',
title: 'Brushless RC rover',
cat: 'drones',
level: 3,
time: '8 hours',
solder: true,
board: 'ESP32',
tags: ['rc car', 'brushless', 'esc', 'crsf', 'telemetry', 'failsafe', 'traction', 'reverse'],
blurb: 'A fast ground vehicle using the same motor, ESC and radio as a quadcopter - with telemetry on the handset and a failsafe that means "stop" rather than "fall". The sensible middle step.',

skills: ['Brushless on the ground', 'Bidirectional ESCs', 'Steering servos', 'Telemetry over CRSF', 'Traction and gearing', 'Speed limiting'],

intro: `
<p>Between the <a href="project.html?p=brushless-thrust-bench">thrust bench</a> and the
<a href="project.html?p=quadcopter-flight-controller">flight controller</a> there is a project that uses all
the same hardware and cannot fall out of the sky. That is this one.</p>
<p>You get brushless power, a real RC link, telemetry back to the handset, and a failsafe that matters - and
when something goes wrong the vehicle coasts to a stop on grass instead of descending from thirty metres. It
is also, on its own terms, more fun than most quadcopters: a 2207 motor in a small chassis produces an
absurd amount of acceleration.</p>
<p>The interesting differences from a drone are all about the ground. Wheels need reverse, which an aircraft
ESC does not do by default. Traction limits how much of that power you can use. And the failsafe has to
consider that a rover at 40&nbsp;km/h takes some distance to stop.</p>`,

what: [
  'Drive a brushless motor forwards and in reverse from an RC transmitter.',
  'Steer with a servo, with adjustable endpoints and a centre trim.',
  'Limit speed in software, with a switch on the handset for a low-speed mode.',
  'Send battery voltage, current and speed back to the handset as telemetry.',
  'Stop safely on link loss - braking, not coasting, and not holding the last throttle.',
  'Log speed and current so you can see where the traction limit actually is.'
],

how: `
<p><strong>Reverse, which an aircraft ESC will not do.</strong> A drone ESC is unidirectional: 1000 is stop,
2000 is full, and there is nothing below stop. Wheels need reverse, and there are three ways to get it:</p>
<ul>
  <li><strong>A car ESC</strong> - bidirectional out of the box, with 1500&nbsp;microseconds as neutral, above
  it forward and below it reverse. Simplest, and it usually includes a proper brake.</li>
  <li><strong>BLHeli in bidirectional mode</strong> - a setting in BLHeliSuite turns a drone ESC into a
  3D-mode one with the same 1500 neutral. Free if you already have the ESC.</li>
  <li><strong>Forward only</strong>, and accept it. Fine for a first build and annoying the first time you
  drive into a hedge.</li>
</ul>
<p>This project uses bidirectional mode, because it costs nothing and the parts are identical to the drone
build.</p>

<p><strong>Traction is the real limit, not power.</strong> A 2207 motor on 4S will happily deliver enough
torque to spin the wheels from standstill on any surface, which produces noise and no acceleration.</p>
<p>The useful consequence: <strong>a throttle curve is worth more than more power</strong>. Mapping the first
half of the stick to the first quarter of the available torque makes the rover dramatically easier to drive
and measurably faster, because the wheels are gripping instead of spinning.</p>

<p><strong>Braking, and why it matters more here.</strong> A drone ESC coasts when you cut throttle. A rover
that coasts at 40&nbsp;km/h into a wall is a rover you are collecting in pieces.</p>
<p>Bidirectional ESCs brake by driving the motor against its own rotation, which is far more effective than
coasting and puts energy back into the pack. The sketch brakes on failsafe rather than simply going to
neutral, and it is the correct behaviour: a stopped rover is findable, a coasting one is in the road.</p>

<p><strong>Telemetry closes the loop.</strong> CRSF sends data back, so the handset shows battery voltage and
sounds its own alarm. That is far more useful than any display on the vehicle, because it is the thing in your
hands - and because a rover running out of battery a hundred metres away is a walk.</p>`,

bom: [
  { id: 'car-chassis', qty: 1, note: 'Or any 1:10 or 1:12 RC chassis with a steering servo. Something with real suspension is worth the money once the motor is this powerful.' },
  { id: 'bldc2207', qty: 1, note: 'The same motor as the quad build. Mount it to the chassis with a pinion gear, or use a proper car motor if your chassis has a standard mount.' },
  { id: 'esc30', qty: 1, note: 'Flashed to bidirectional mode, or buy a car ESC which does reverse and braking out of the box.' },
  { id: 'mg996r', qty: 1, note: 'Steering. Metal gears - a plastic-geared servo strips the first time a wheel hits a kerb.' },
  { id: 'esp32', qty: 1, note: 'CRSF, telemetry and the speed limiting.' },
  { id: 'rx-elrs', qty: 1, note: 'ExpressLRS receiver, as in the decoder project.' },
  { id: 'rc-txrx', qty: 1, note: 'The handset. Shared with every other project in this theme.' },
  { id: 'lipo3s', qty: 1, note: '3S is plenty for a rover and gentler on the drivetrain than 4S. Read the LiPo safety notes.' },
  { id: 'lipo-charger', qty: 1 },
  { id: 'lipo-bag', qty: 1 },
  { id: 'xt60', qty: 2 },
  { id: 'ina219', qty: 1, note: 'Battery telemetry. Get the 0.01 ohm version - the standard module saturates at 3 A.' },
  { id: 'hall', qty: 1, note: 'Speed sensor: a magnet on the drive shaft and a hall sensor. Gives you real speed for the telemetry.' },
  { id: 'magnet', qty: 1, note: 'Small neodymium disc for the speed sensor.' },
  { id: 'buzzer', qty: 1, note: 'Lost-vehicle alarm. A rover in long grass is remarkably hard to find.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2 },
  { id: 'box-abs', qty: 1, note: 'The electronics need protecting from grit and water. A rover finds both.' },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'mcu',   comp: 'esp32',   at: [0, 50] },
    { id: 'bb',    comp: 'bb400',   at: [0, -8] },
    { id: 'rx',    comp: 'rxelrs',  at: [-48, -58] },
    { id: 'esc',   comp: 'esc',     at: [48, -46] },
    { id: 'motor', comp: 'bldc',    at: [48, -102] },
    { id: 'srv',   comp: 'servo',   at: [-42, -100] },
    { id: 'ina',   comp: 'ina219',  at: [0, -60] },
    { id: 'batt',  comp: 'lipo4s',  at: [0, -140] },
    { id: 'spd',   comp: 'hall',    at: [-6, -104] }
  ],
  wires: [
    { from: 'batt.XT+', to: 'ina.VIN+', color: 'brown',  note: 'Battery positive through the current sensor. This is the telemetry shunt' },
    { from: 'ina.VIN-', to: 'esc.B+',   color: 'brown',  note: 'Out to the ESC. 14 AWG - this carries the full motor current' },
    { from: 'batt.XT-', to: 'esc.B-',   color: 'black',  note: 'Battery negative' },
    { from: 'esc.A',    to: 'motor.A',  color: 'brown',  note: 'Motor phase A. Swap any two to reverse the motor direction' },
    { from: 'esc.B',    to: 'motor.B',  color: 'brown',  note: 'Motor phase B' },
    { from: 'esc.C',    to: 'motor.C',  color: 'brown',  note: 'Motor phase C' },
    { from: 'esc.SIG',  to: 'mcu.D25',  color: 'orange', note: 'Throttle. 1500 us is neutral in bidirectional mode, NOT 1000' },
    { from: 'esc.BEC',  to: 'mcu.VIN',  color: 'red',    note: '5 V from the ESC to everything else' },
    { from: 'esc.GND',  to: 'bb.T-2',   color: 'black',  note: 'Common ground rail' },
    { from: 'srv.SIG',  to: 'mcu.D26',  color: 'purple', note: 'Steering servo' },
    { from: 'srv.VCC',  to: 'bb.T+6',   color: 'red',    note: 'Servo 5 V. An MG996R can pull 2 A stalled - check the BEC rating' },
    { from: 'srv.GND',  to: 'bb.T-6',   color: 'black',  note: 'Servo ground' },
    { from: 'rx.5V',    to: 'bb.T+10',  color: 'red',    note: 'Receiver power' },
    { from: 'rx.GND',   to: 'bb.T-10',  color: 'black',  note: 'Receiver ground' },
    { from: 'rx.TX',    to: 'mcu.D16',  color: 'green',  note: 'CRSF channels in' },
    { from: 'rx.RX',    to: 'mcu.D17',  color: 'orange', note: 'Telemetry back to the handset' },
    { from: 'ina.VCC',  to: 'bb.T+14',  color: 'red',    note: 'Current sensor power' },
    { from: 'ina.GND',  to: 'bb.T-14',  color: 'black',  note: 'Current sensor ground' },
    { from: 'ina.SDA',  to: 'mcu.D21',  color: 'blue',   note: 'I2C data' },
    { from: 'ina.SCL',  to: 'mcu.D22',  color: 'yellow', note: 'I2C clock' },
    { from: 'spd.VCC',  to: 'bb.T+18',  color: 'red',    note: 'Speed sensor power' },
    { from: 'spd.GND',  to: 'bb.T-18',  color: 'black',  note: 'Speed sensor ground' },
    { from: 'spd.DO',   to: 'mcu.D27',  color: 'green',  note: 'One pulse per shaft revolution, on an interrupt pin' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Neutral is 1500, not 1000 - and getting it wrong means full reverse at power-up</span>
<p>In bidirectional mode the ESC treats 1500&nbsp;microseconds as stop, above as forward, below as reverse.</p>
<p>A sketch that outputs 1000 at startup - the correct value for an aircraft ESC - is commanding
<strong>full reverse</strong>. On a rover on a bench with the wheels off the ground that is startling; on the
floor it is a vehicle across the room.</p>
<p>The sketch writes 1500 as the first statement in <code>setup()</code>. Check yours does the same before
the first battery connection, and do that first connection with the wheels off the ground.</p></div>

<div class="note danger"><span class="t">Wheels off the ground for everything until the failsafe is proven</span>
<p>Chassis on a box, wheels free. Test throttle, reverse, steering, arming and all three failsafe cases there.</p>
<p>A rover is far safer than a quadcopter and it is still a heavy object that accelerates hard. Nobody's
ankles, and nothing you mind hitting.</p></div>

<div class="note warn"><span class="t">Check the BEC can feed the steering servo</span>
<p>An MG996R pulls well over an amp when it hits a stop, and a small ESC's BEC may only supply 1&nbsp;A. The
symptom is the ESP32 browning out and resetting every time the wheel hits a kerb - which looks like a radio
problem and is not.</p>
<p>If the BEC is marginal, give the servo its own 5&nbsp;V regulator from the pack, grounds commoned.</p></div>

<div class="note warn"><span class="t">Grit and water</span>
<p>A rover finds both. Box the electronics, put the receiver antenna somewhere it will not be sheared off, and
route wires above the level of the chassis plate.</p>
<p>The ESC needs airflow - it will get hotter here than on a quad, because there is no propeller wash and the
loads are more sustained.</p></div>`,

solderSteps: [
  { h: 'Power wiring exactly as the thrust bench',
    body: `<p>XT60s done properly, 14&nbsp;AWG, short runs, and the current sensor in the positive line.</p>
    <p>Everything in the thrust bench's soldering section applies - this is the same power system in a
    different shape.</p>` },
  { h: 'Bullet connectors on the motor',
    body: `<p>3.5&nbsp;mm bullets rather than soldering directly, so you can swap two wires to reverse the
    motor without a soldering iron on the workbench.</p>
    <p>You will do that at least once, because "forward" depends on which way the pinion drives.</p>` },
  { h: 'The speed sensor, with the magnet on the shaft',
    body: `<p>A small neodymium disc glued to the drive shaft or a spur gear, and the hall sensor a couple of
    millimetres away on a bracket.</p>
    <p>One pulse per revolution is enough. Write down the gear ratio and wheel diameter - the sketch needs both
    to turn pulses into speed.</p>
    <p>Keep the sensor's lead away from the phase wires, which are switching tens of amps a few centimetres
    away.</p>` },
  { h: 'Mount the ESC where air moves over it',
    body: `<p>Not buried under the body shell. A rover ESC works harder for longer than a drone one and has no
    propeller blowing on it.</p>
    <p>Check it by hand after the first proper run. Warm is fine; too hot to hold means it needs airflow or a
    taller gear ratio.</p>` }
],

assembly: [
  { h: 'Do the receiver-decoder project first',
    body: `<p>The <a href="project.html?p=rc-receiver-decoder">decoder</a> covers CRSF, channel scaling and
    failsafe on a bench with a servo. All of it is reused here, and debugging it on a moving vehicle is much
    less pleasant.</p>` },
  { h: 'Flash the ESC to bidirectional mode',
    body: `<p>BLHeliSuite or BLHeli_32 Suite over the signal wire, with the ESC powered. Find "Motor Direction"
    and set it to Bidirectional (sometimes "Bidirectional 3D").</p>
    <p>Note the ESC now expects 1500 as neutral. Also set the brake strength while you are there - it is what
    makes the rover controllable.</p>
    <p>If your ESC cannot be reflashed, a $7 car ESC does all of this out of the box.</p>` },
  { h: 'Wheels off the ground, no load, first power-up',
    body: `<p>Chassis on a box. Battery connected with the sketch already running and outputting 1500.</p>
    <p>Listen for the arming tones, then move the throttle stick gently either side of centre. The wheels
    should turn both ways and stop at centre.</p>
    <p>If it runs at power-up without the stick moving, the neutral point is wrong - stop and fix it.</p>` },
  { h: 'Set the steering endpoints',
    body: `<p>Steering servos and chassis geometry vary. Find the microsecond values at which the wheels reach
    full lock without the servo straining, and put those in the sketch as the endpoints.</p>
    <p>A servo buzzing against a mechanical stop will strip its gears and flatten the battery. If you can hear
    it at full lock, the endpoints are too wide.</p>
    <p>Then set the centre trim so the rover runs straight with the stick centred.</p>` },
  { h: 'Test all three failsafe cases before it touches the ground',
    body: `<ul>
      <li><strong>Transmitter off</strong> - it must brake to a stop.</li>
      <li><strong>Out of range</strong>, using the handset's range-check mode.</li>
      <li><strong>Receiver signal wire unplugged</strong> - the case the protocol flag cannot catch.</li>
    </ul>
    <p>All three, wheels off the ground, before the first drive.</p>` },
  { h: 'First drive in low-speed mode',
    body: `<p>The sketch has a switch-selected speed limit. Start at 30%.</p>
    <p>Somewhere open, with a surface you do not mind, and nothing you mind hitting. A brushless rover
    accelerates much harder than any toy RC car and the first thirty seconds are a surprise.</p>` },
  { h: 'Find the traction limit and tune the throttle curve',
    body: `<p>Log current and speed. On a hard acceleration you will see current spike while speed barely
    moves - that is wheelspin, and it is the useful measurement.</p>
    <p>Then apply a throttle curve that maps the first half of the stick into the first quarter of the torque.
    The rover becomes easier to drive and genuinely faster, because the tyres are gripping.</p>` },
  { h: 'Check the telemetry on the handset',
    body: `<p>Battery voltage, current and speed should appear on the handset screen. Set the low-voltage alarm
    at 3.5&nbsp;V per cell.</p>
    <p>That alarm is the thing that stops you walking to fetch a rover with a flat pack, and it is why the
    telemetry wire is worth connecting.</p>` }
],

libraries: [
  { name: 'AlfredoCRSF', by: 'Alfredo Systems', why: 'Channels in, telemetry out.' },
  { name: 'ESP32Servo', by: 'Kevin Harrington', why: 'Both the ESC and the steering servo.' },
  { name: 'Adafruit INA219', by: 'Adafruit', why: 'Battery voltage and current for the telemetry.' }
],

code: [
{
  h: 'The rover',
  intro: `<p>Neutral handling, the throttle curve and the braking failsafe are the parts that matter.</p>`,
  name: 'rc_rover.ino',
  code: `/* ------------------------------------------------------------------
   Brushless RC rover.

   Bidirectional ESC: 1500 us is NEUTRAL, above forward, below
   reverse. An aircraft ESC's 1000 us minimum is FULL REVERSE here -
   which is why the very first statement in setup() writes 1500.
   ------------------------------------------------------------------ */

#include <AlfredoCRSF.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <Adafruit_INA219.h>

#define ESC_PIN     25
#define STEER_PIN   26
#define SPEED_PIN   27
#define BUZZER      12
#define RX_PIN      16
#define TX_PIN      17

// ---- ESC, bidirectional ----------------------------------------------
#define ESC_NEUTRAL  1500
#define ESC_FWD_MAX  1900
#define ESC_REV_MAX  1100

// ---- steering: measure YOUR chassis ----------------------------------
#define STEER_CENTRE 1500
#define STEER_LEFT   1150
#define STEER_RIGHT  1850

// ---- speed sensor ----------------------------------------------------
#define WHEEL_DIAM_MM   85.0
#define GEAR_RATIO       4.5     // motor turns per wheel turn
#define MAGNETS           1      // pulses per shaft revolution

#define SILENCE_MS      250
#define BRAKE_MS        800      // hold brake this long on failsafe

AlfredoCRSF crsf;
Servo esc, steer;
Adafruit_INA219 ina;

volatile uint32_t pulses = 0;
float speedKmh = 0, volts = 0, amps = 0;
bool linkUp = false, armed = false;
unsigned long lastFrame = 0, failsafeAt = 0;

void IRAM_ATTR onPulse() { pulses++; }

void setup() {
  Serial.begin(115200);

  /* FIRST. On a bidirectional ESC, anything below 1500 is reverse -
     so the aircraft convention of writing 1000 at startup commands
     full reverse. Do this before anything that could fail or block. */
  esc.attach(ESC_PIN, 1000, 2000);
  esc.writeMicroseconds(ESC_NEUTRAL);

  steer.attach(STEER_PIN, 1000, 2000);
  steer.writeMicroseconds(STEER_CENTRE);

  pinMode(BUZZER, OUTPUT);
  pinMode(SPEED_PIN, INPUT_PULLUP);
  attachInterrupt(SPEED_PIN, onPulse, FALLING);

  Serial2.begin(420000, SERIAL_8N1, RX_PIN, TX_PIN);
  crsf.begin(Serial2);

  Wire.begin(21, 22);
  if (!ina.begin()) Serial.println(F("no INA219"));
  ina.setCalibration_32V_2A();

  Serial.println(F("rover ready - DISARMED"));
  tone(BUZZER, 2000, 120);
}

void loop() {
  crsf.update();
  if (crsf.isLinkUp()) lastFrame = millis();

  bool up = crsf.isLinkUp() && (millis() - lastFrame < SILENCE_MS);
  if (up != linkUp) {
    linkUp = up;
    if (!linkUp) {
      Serial.println(F("*** FAILSAFE ***"));
      failsafeAt = millis();
    }
  }

  updateSensors();

  if (!linkUp) { failsafe(); return; }

  // Arm switch on channel 5. A rover should not move because the
  // receiver connected with the throttle stick somewhere odd.
  bool wantArm = crsf.getChannel(5) > 1500;
  if (wantArm && !armed && fabs(stickUnit(crsf.getChannel(3))) < 0.05) {
    armed = true;
    tone(BUZZER, 2500, 150);
    Serial.println(F("ARMED"));
  }
  if (!wantArm && armed) {
    armed = false;
    tone(BUZZER, 1200, 150);
    Serial.println(F("disarmed"));
  }

  if (armed) drive();
  else       esc.writeMicroseconds(ESC_NEUTRAL);

  steerTo(stickUnit(crsf.getChannel(1)));

  static unsigned long lastTelem = 0;
  if (millis() - lastTelem > 300) { lastTelem = millis(); sendTelemetry(); }

  static unsigned long lastLog = 0;
  if (millis() - lastLog > 250) { lastLog = millis(); logLine(); }
}

/* --- driving ------------------------------------------------------------ */
void drive() {
  float t = stickUnit(crsf.getChannel(3));      // -1 .. +1

  /* Speed limit from a handset switch. 30% for learning the vehicle,
     60% for normal, full for open space. A brushless rover has far
     more torque than the tyres can use, so this costs nothing real. */
  float limit = 1.0;
  int mode = crsf.getChannel(6);
  if (mode < 700)       limit = 0.30;
  else if (mode < 1300) limit = 0.60;

  /* Throttle curve. Cubing the stick maps the first half of its
     travel into the first eighth of the torque. Counter-intuitively
     this makes the rover FASTER, because the tyres grip instead of
     spinning. */
  float curved = t * t * t;
  curved = constrain(curved * limit, -1.0, 1.0);

  int us;
  if (curved >= 0) us = ESC_NEUTRAL + curved * (ESC_FWD_MAX - ESC_NEUTRAL);
  else             us = ESC_NEUTRAL + curved * (ESC_NEUTRAL - ESC_REV_MAX);

  esc.writeMicroseconds(constrain(us, ESC_REV_MAX, ESC_FWD_MAX));
}

void steerTo(float unit) {
  int us = (unit >= 0)
    ? STEER_CENTRE + unit * (STEER_RIGHT - STEER_CENTRE)
    : STEER_CENTRE + unit * (STEER_CENTRE - STEER_LEFT);
  steer.writeMicroseconds(constrain(us, STEER_LEFT, STEER_RIGHT));
}

/* --- failsafe: brake, then neutral ---------------------------------------
   Not "hold last throttle", and not simply coast. A rover at speed
   coasts a long way, and a stopped rover is one you can find. */
void failsafe() {
  armed = false;
  steer.writeMicroseconds(STEER_CENTRE);

  unsigned long since = millis() - failsafeAt;

  if (since < BRAKE_MS && speedKmh > 2.0) {
    // Brief reverse against the motion is a real brake on a
    // bidirectional ESC. Brief, because holding it would drive the
    // rover backwards once it has stopped.
    esc.writeMicroseconds(ESC_NEUTRAL - 120);
  } else {
    esc.writeMicroseconds(ESC_NEUTRAL);
  }

  // Lost-vehicle alarm. A rover in long grass is remarkably hard to
  // find and this is the reason the buzzer is in the parts list.
  if (since > 5000) {
    static unsigned long lastBeep = 0;
    if (millis() - lastBeep > 1200) {
      lastBeep = millis();
      tone(BUZZER, 2700, 250);
    }
  }
}

/* --- sensors ------------------------------------------------------------ */
void updateSensors() {
  static unsigned long lastCalc = 0;
  unsigned long now = millis();
  if (now - lastCalc < 200) return;

  noInterrupts();
  uint32_t p = pulses;
  pulses = 0;
  interrupts();

  float shaftRevs = (float)p / MAGNETS;
  float wheelRevs = shaftRevs / GEAR_RATIO;
  float metres = wheelRevs * PI * WHEEL_DIAM_MM / 1000.0;
  speedKmh = metres / ((now - lastCalc) / 1000.0) * 3.6;
  lastCalc = now;

  volts = ina.getBusVoltage_V();
  amps = ina.getCurrent_mA() / 1000.0;
  if (amps < 0) amps = 0;
}

void sendTelemetry() {
  if (!linkUp) return;

  crsf_sensor_battery_t b = { 0 };
  b.voltage = htobe16((uint16_t)(volts * 10));
  b.current = htobe16((uint16_t)(amps * 10));
  b.capacity = htobe16(0);
  b.remaining = constrain((int)((volts / 3 - 3.3) / (4.2 - 3.3) * 100), 0, 100);

  crsf.queuePacket(CRSF_SYNC_BYTE, CRSF_FRAMETYPE_BATTERY_SENSOR,
                   &b, sizeof(b));
}

float stickUnit(int raw) {
  if (abs(raw - 992) < 15) return 0;
  return constrain((raw - 992) / 819.0, -1.0, 1.0);
}

void logLine() {
  Serial.print(armed ? F("ARM ") : F("dis "));
  Serial.print(speedKmh, 1); Serial.print(F(" km/h  "));
  Serial.print(volts, 2);    Serial.print(F(" V  "));
  Serial.print(amps, 1);     Serial.print(F(" A  lq "));
  Serial.println(linkUp ? crsf.getLinkStatistics()->uplink_Link_quality : 0);
}`,
  after: `<p><strong>The cubed throttle curve is the change people least expect to help.</strong> It maps the
  first half of the stick into the first eighth of the torque, which feels like it should make the rover
  slower. It makes it faster, because a brushless motor on a light chassis has far more torque than the tyres
  can transmit, and wheelspin is acceleration you are not getting.</p>
  <p><strong>The brake pulse on failsafe is deliberately brief.</strong> A bidirectional ESC driven in reverse
  against the motion is a genuine brake - but hold it and the rover simply drives backwards once it has
  stopped, which is a worse outcome than coasting.</p>
  <p><strong>Neutral is 1500 and it is the first line of <code>setup()</code>.</strong> Every other project in
  this theme writes 1000 there. Copying that habit onto a bidirectional ESC commands full reverse from the
  instant the battery goes on.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note danger"><span class="t">Wheels off the ground for every upload</span>
<p>An upload resets the ESP32, which momentarily removes the signal from the ESC. An armed bidirectional ESC
losing its signal does not reliably go to neutral.</p>
<p>Chassis on a box for anything involving a USB cable.</p></div>
<div class="note warn"><span class="t">Check the neutral before the first battery</span>
<p>Scope or serial-print the first value the sketch writes. It must be 1500. A rover that lurches into
reverse the instant you connect a battery is startling on a bench and dangerous on a floor.</p></div>`,

tune: [
  { h: 'Gearing beats power',
    body: `<p>A taller pinion gives more top speed and less acceleration, and runs the motor and ESC cooler at
    speed. A shorter one is the opposite.</p>
    <p>If the ESC is getting hot, gear taller before anything else - a motor labouring at low RPM against a
    short gear is where the heat comes from.</p>` },
  { h: 'Tune the throttle curve on the surface you actually drive on',
    body: `<p>Grass, tarmac and carpet have completely different traction. The cubic curve is a good default;
    on a very grippy surface a squared curve gives better response, and on loose gravel you may want a fourth
    power.</p>
    <p>The current log tells you: a spike in current with no rise in speed is wheelspin.</p>` },
  { h: 'Add traction control, since you have the sensors',
    body: `<p>You already measure wheel speed and current. If current is high and acceleration is low, the
    wheels are spinning - back the throttle off until they grip.</p>
    <p>A crude version is twenty lines and works surprisingly well. A second speed sensor on an undriven wheel
    makes it properly effective, because then you can compare driven to ground speed.</p>` },
  { h: 'Steering endpoints and expo',
    body: `<p>Limit the endpoints so the servo never strains against a mechanical stop, and add expo -
    a softened response near centre - which makes high-speed straight-line driving far less twitchy.</p>
    <p>Most handsets can apply expo themselves, which is easier than doing it in code.</p>` },
  { h: 'More telemetry means fewer walks',
    body: `<p>Speed, current, and a GPS position if you add one. A rover that reports where it stopped is a
    rover you can find.</p>
    <p>The handset's low-voltage alarm is the single most useful piece of telemetry - set it at 3.5&nbsp;V per
    cell and trust it.</p>` },
  { h: 'Then take it off-road',
    body: `<p>A 1:10 chassis with real suspension and this drivetrain is a genuinely capable vehicle. Waterproof
    the electronics properly, protect the receiver antenna, and expect to find the traction limit
    repeatedly.</p>` }
],

trouble: [
  { q: 'It runs at full speed the moment the battery is connected',
    a: `Neutral is wrong. A bidirectional ESC wants 1500; writing 1000 commands full reverse. Check the first
    value the sketch outputs.` },
  { q: 'No reverse',
    a: `The ESC is not in bidirectional mode. Reflash it with BLHeliSuite and set Motor Direction to
    Bidirectional, or fit a car ESC.` },
  { q: 'The ESP32 resets when the steering hits a stop',
    a: `The servo stalling and pulling the BEC down. Narrow the steering endpoints so it never reaches the
    mechanical stop, and if that is not enough give the servo its own regulator.` },
  { q: 'It spins the wheels and goes nowhere',
    a: `Traction, not a fault. Apply a throttle curve, gear taller, or add weight over the driven axle. This
    is the normal condition for brushless on a light chassis.` },
  { q: 'The ESC gets very hot',
    a: `Gear ratio too short, so the motor is labouring. Gear taller. Also check airflow - a rover ESC has no
    propeller blowing over it and works harder for longer than a drone one.` },
  { q: 'Speed reads zero or nonsense',
    a: `Magnet too far from the hall sensor, or the wrong polarity - most hall sensors only respond to one
    pole. Flip the magnet. Then check the gear ratio and wheel diameter constants.` },
  { q: 'Telemetry does not appear on the handset',
    a: `The TX line from the ESP32 to the receiver must be connected, and telemetry enabled for that model in
    the handset. Both are easy to miss.` },
  { q: 'It keeps driving after the transmitter is switched off',
    a: `The failsafe is only checking the protocol flag, or <code>SILENCE_MS</code> is too long. Test all
    three cases - transmitter off, out of range, signal wire unplugged.` }
],

next: `
<ul>
  <li><strong>Learn the hardware safely first</strong> - the
  <a href="project.html?p=brushless-thrust-bench">thrust bench</a> and the
  <a href="project.html?p=rc-receiver-decoder">receiver decoder</a>.</li>
  <li><strong>The same parts, in the air</strong> - the
  <a href="project.html?p=quadcopter-flight-controller">flight controller</a>, once this is second
  nature.</li>
  <li><strong>On the water</strong> - the <a href="project.html?p=rc-boat">RC boat</a>, where a failsafe is
  much more inconvenient.</li>
  <li><strong>Let it drive itself</strong> - the
  <a href="project.html?p=5g-teleoperated-rover">teleoperated rover</a> replaces the handset with a browser
  and a camera, and the
  <a href="project.html?p=obstacle-avoiding-robot">obstacle avoider</a> removes the driver entirely.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">A brushless rover is fast and heavy</span>
<ul>
  <li><strong>Wheels off the ground</strong> for every test, every upload, and until all three failsafe cases
  are proven.</li>
  <li><strong>Check the ESC neutral before the first battery.</strong> 1500, not 1000. Getting this wrong
  sends the vehicle across the room at full reverse.</li>
  <li><strong>Start in low-speed mode.</strong> A 2207 on 3S in a light chassis accelerates harder than any
  toy RC car, and the first thirty seconds are a genuine surprise.</li>
  <li><strong>Drive it somewhere open</strong>, away from people, animals, roads and anything you would mind
  hitting. A rover at 40&nbsp;km/h does real damage to ankles and to itself.</li>
  <li><strong>Arm deliberately</strong>, on a switch, and disarm before approaching the vehicle.</li>
  <li><strong>Check the motor and ESC temperature</strong> after each run. Too hot to hold means gear taller
  or improve airflow.</li>
</ul>
</div>
<div class="note danger"><span class="t">LiPo packs</span>
<p>Everything in the <a href="project.html?p=brushless-thrust-bench">thrust bench</a> safety section applies:
balance charge, in a bag, never unattended, never a puffed or crashed pack, and store at 3.8&nbsp;V per
cell.</p>
<p>A rover crashes into things. Inspect the pack after any significant impact and give it half an hour
somewhere safe before charging - internal damage can start a fire well after the event.</p>
</div>
<div class="note warn"><span class="t">Where you drive it</span>
<ul>
  <li><strong>Not on public roads</strong>, and not on pavements where people walk. In most countries a
  powered model vehicle on a public highway is an offence regardless of size.</li>
  <li><strong>Private land with permission</strong>, or a club track.</li>
  <li><strong>Keep it in sight.</strong> A rover that disappears into undergrowth at 40&nbsp;km/h with a LiPo
  aboard is worth finding promptly - which is what the lost-vehicle buzzer is for.</li>
</ul>
</div>`
});
