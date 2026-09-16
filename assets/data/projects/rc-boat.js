/* A boat: where failsafe means "drifts away" and water gets into everything. */
AB.addProject({
slug: 'rc-boat',
title: 'RC boat with a bilge alarm',
cat: 'drones',
level: 3,
time: '8 hours',
solder: true,
board: 'ESP32',
tags: ['rc boat', 'brushed esc', 'waterproofing', 'bilge', 'failsafe', 'telemetry', 'rudder', 'flooding'],
blurb: 'A boat has two problems no other vehicle has: water gets in, and when it stops it drifts away rather than staying put. Both are solvable and both need designing for.',

skills: ['Waterproofing electronics', 'Brushed ESCs', 'Rudder control', 'Flooding detection', 'Recovery planning', 'Water cooling'],

intro: `
<p>An RC boat is the easiest vehicle in this theme to build and the easiest to lose. A quadcopter that fails
lands - badly, but somewhere you can walk to. A rover that fails stops. <strong>A boat that fails keeps
moving</strong>, downwind, away from you, until it reaches something you cannot get to.</p>
<p>So this project spends its effort on the two things specific to water: keeping it out, and getting the boat
back when something goes wrong. The propulsion is deliberately simple - a brushed motor and a $7 ESC - because
the interesting problems are elsewhere.</p>
<p>It is also a lovely thing to have. A boat is quieter than anything else here, needs no licence, and a pond
is easier to find than an airfield.</p>`,

what: [
  'Drive a brushed motor forwards and in reverse, with a rudder servo for steering.',
  'Detect water inside the hull before it reaches anything expensive, and shout about it.',
  'Fail toward recovery rather than away from it - a slow circle back, not a stop in open water.',
  'Report battery, motor temperature and bilge state to the handset as telemetry.',
  'Survive being splashed, which everything on a boat eventually is.',
  'Cool the motor with the water it is floating in, which is free and effective.'
],

how: `
<p><strong>Failsafe on water is a different problem.</strong> Everywhere else in this book, the safe state is
"stop". On a boat, stopping in the middle of a lake means the boat drifts with the wind until it reaches the
far bank, the reeds, or a duck.</p>
<p>The better behaviour is a <strong>slow circle</strong>: quarter throttle, full rudder. The boat stays
roughly where it is, which keeps it in radio range - so the link often recovers and you can drive it home. If
it does not, the boat is still in the middle rather than in the reeds.</p>
<p>The sketch does that for 30 seconds, then stops and sounds the alarm - because a boat circling forever on a
dead radio is a boat with a flat battery in the middle of a lake, which is worse.</p>

<p><strong>Waterproofing, in layers, because one layer always fails.</strong></p>
<ul>
  <li><strong>The hull</strong> keeps most of it out and will leak at the shaft.</li>
  <li><strong>A sealed box</strong> inside the hull for the electronics, with the lid facing up and cable
  glands or silicone where wires enter.</li>
  <li><strong>Conformal coating</strong> on the boards themselves - a thin acrylic spray, masked off the
  connectors. This is what saves you when the box leaks.</li>
  <li><strong>A bilge sensor</strong>, at the lowest point, to tell you the first three have failed while
  there is still time.</li>
</ul>
<p>Silica gel packets in the box absorb condensation, which forms every time a warm boat hits cold water and
is the failure people do not expect.</p>

<p><strong>The stuffing tube, which is where the water comes in.</strong> The propeller shaft has to pass
through the hull, and that hole is the boat's main weakness. A brass stuffing tube packed with marine grease
does the job: the grease is the seal, and it is a consumable.</p>
<p>Re-grease before every session. A dry stuffing tube leaks and the shaft wears, and both are slow problems
that become sudden ones.</p>

<p><strong>Water cooling, which is free.</strong> A pickup facing backwards near the propeller forces water
through a coil round the motor and out of the hull. The boat's own motion pumps it. This is standard practice
on RC boats and it lets a small motor run at loads that would cook it in air.</p>
<p>Check water is coming out of the outlet within a few seconds of moving off. A blocked pickup means no
cooling and you will not notice until the motor is ruined.</p>

<p><strong>Brushed, not brushless, and deliberately.</strong> A brushed motor and a $7 ESC give you reverse and
braking out of the box, tolerate being wet far better, and have no timing to get wrong. The boat is slower and
much simpler. When you want speed, the <a href="project.html?p=rc-rover-brushless">rover project's</a>
brushless setup transfers directly.</p>`,

bom: [
  { id: 'esc-brushed', qty: 1, note: 'Bidirectional with braking out of the box. The "320 A" rating is fiction - treat it as 30 A continuous.' },
  { id: 'motor540', qty: 1, note: 'The standard RC size. A TT gearmotor works for a hull under about 400 mm; anything bigger wants a proper 540.' },
  { id: 'mg996r', qty: 1, note: 'Rudder servo. Metal gears - a rudder takes real load and a plastic servo strips.' },
  { id: 'esp32', qty: 1, note: 'CRSF, telemetry, and the bilge logic.' },
  { id: 'rx-elrs', qty: 1, note: 'ExpressLRS. Mount the antennas high and vertical - water absorbs 2.4 GHz well, and a receiver in a wet bilge has poor range.' },
  { id: 'rc-txrx', qty: 1 },
  { id: 'lipo3s', qty: 1, note: '3S. Read the LiPo safety section.' },
  { id: 'lipo-charger', qty: 1 },
  { id: 'lipo-bag', qty: 1 },
  { id: 'xt60', qty: 2 },
  { id: 'water-sens', qty: 2, note: 'Bilge sensors, at the lowest point. Powered only while reading - see the leak alarm project for why.' },
  { id: 'ds18b20', qty: 1, note: 'Motor temperature, taped to the can. A boat motor with a blocked cooling pickup overheats silently.' },
  { id: 'res4k7', qty: 1, note: '1-Wire pull-up.' },
  { id: 'ina219', qty: 1, note: 'Battery telemetry.' },
  { id: 'buzzer', qty: 1, note: 'Loud. A boat drifting fifty metres away needs to be audible.' },
  { id: 'ws2812-strip', qty: 1, as: 'WS2812B strip, 8 LEDs', note: 'Navigation lights, and a bright flash on failsafe so you can see which boat is yours.' },
  { id: 'box-ip65', qty: 1, note: 'The electronics box inside the hull. Lid up, glands for every wire.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'heatshrink', qty: 1, own: true },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',     at: [0, 50] },
    { id: 'bb',   comp: 'bb400',     at: [0, -8] },
    { id: 'rx',   comp: 'rxelrs',    at: [-48, -56] },
    { id: 'esc',  comp: 'esc',       at: [46, -48] },
    { id: 'motor', comp: 'ttmotor',  at: [46, -104] },
    { id: 'srv',  comp: 'servo',     at: [-44, -100] },
    { id: 'ina',  comp: 'ina219',    at: [0, -58] },
    { id: 'bilge', comp: 'watersens', at: [-6, -106] },
    { id: 'temp', comp: 'ds18b20',   at: [20, -104] },
    { id: 'batt', comp: 'lipo4s',    at: [0, -146] }
  ],
  wires: [
    { from: 'batt.XT+',  to: 'ina.VIN+',  color: 'brown',  note: 'Battery through the current sensor' },
    { from: 'ina.VIN-',  to: 'esc.B+',    color: 'brown',  note: 'To the ESC. 14 AWG' },
    { from: 'batt.XT-',  to: 'esc.B-',    color: 'black',  note: 'Battery negative' },
    { from: 'esc.A',     to: 'motor.+',   color: 'brown',  note: 'Brushed motor, two wires. Swap them to reverse the propeller direction' },
    { from: 'esc.B',     to: 'motor.-',   color: 'brown',  note: 'Motor negative' },
    { from: 'esc.SIG',   to: 'mcu.D25',   color: 'orange', note: 'Throttle. 1500 us neutral, above forward, below reverse' },
    { from: 'esc.BEC',   to: 'mcu.VIN',   color: 'red',    note: '5 V from the ESC' },
    { from: 'esc.GND',   to: 'bb.T-2',    color: 'black',  note: 'Common ground rail' },
    { from: 'srv.SIG',   to: 'mcu.D26',   color: 'purple', note: 'Rudder servo' },
    { from: 'srv.VCC',   to: 'bb.T+6',    color: 'red',    note: 'Servo 5 V' },
    { from: 'srv.GND',   to: 'bb.T-6',    color: 'black',  note: 'Servo ground' },
    { from: 'rx.5V',     to: 'bb.T+10',   color: 'red',    note: 'Receiver power' },
    { from: 'rx.GND',    to: 'bb.T-10',   color: 'black',  note: 'Receiver ground' },
    { from: 'rx.TX',     to: 'mcu.D16',   color: 'green',  note: 'CRSF in' },
    { from: 'rx.RX',     to: 'mcu.D17',   color: 'orange', note: 'Telemetry out' },
    { from: 'ina.VCC',   to: 'bb.T+14',   color: 'red',    note: 'Current sensor power' },
    { from: 'ina.GND',   to: 'bb.T-14',   color: 'black',  note: 'Current sensor ground' },
    { from: 'ina.SDA',   to: 'mcu.D21',   color: 'blue',   note: 'I2C data' },
    { from: 'ina.SCL',   to: 'mcu.D22',   color: 'yellow', note: 'I2C clock' },
    { from: 'bilge.VCC', to: 'mcu.D33',   color: 'purple', note: 'Bilge probe power, SWITCHED - constant DC dissolves the electrodes' },
    { from: 'bilge.GND', to: 'bb.T-18',   color: 'black',  note: 'Bilge probe ground' },
    { from: 'bilge.SIG', to: 'mcu.D32',   color: 'green',  note: 'Bilge reading, with a 10 k pull-up' },
    { from: 'temp.VCC',  to: 'bb.T+22',   color: 'red',    note: 'Motor temperature sensor power' },
    { from: 'temp.GND',  to: 'bb.T-22',   color: 'black',  note: 'Sensor ground' },
    { from: 'temp.DATA', to: 'mcu.D27',   color: 'yellow', note: '1-Wire, with the 4.7 k pull-up. Taped to the motor can' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Failsafe should circle, not stop</span>
<p>Everywhere else in this theme the safe state is "stop". On water, stopping means drifting downwind until
the boat reaches the far bank, the reeds, or something worse.</p>
<p>The sketch does quarter throttle with full rudder for 30 seconds - a slow circle that keeps the boat
roughly where it is, and therefore in radio range, so the link often recovers.</p>
<p>Then it stops and sounds the alarm, because a boat circling on a dead radio until the pack is flat is a
boat you are swimming for.</p></div>

<div class="note danger"><span class="t">Waterproof in layers, because one layer always fails</span>
<ul>
  <li><strong>Conformal coating on the boards.</strong> A thin acrylic spray, connectors masked off. This is
  the layer that saves everything when the box leaks, and it costs $8.</li>
  <li><strong>A sealed box</strong> inside the hull, lid facing up, with glands or silicone where every wire
  enters.</li>
  <li><strong>Silica gel</strong> in the box. Condensation forms every time a warm boat hits cold water and it
  is the failure nobody expects.</li>
  <li><strong>The battery in its own bag</strong> or compartment. A wet LiPo is a fire risk and salt water is
  much worse than fresh.</li>
</ul>
<p>Assume water will get in. Design for the day it does rather than for the day it does not.</p></div>

<div class="note danger"><span class="t">The stuffing tube is the main leak and it is a consumable</span>
<p>The propeller shaft passes through the hull, and the seal is marine grease packed into a brass tube. It
works well and it wears out.</p>
<p>Re-grease before every session. A dry stuffing tube leaks steadily and wears the shaft, and both go from
slow problems to sudden ones.</p>
<p>After every outing: open the hull, check for water, dry it out. Every time.</p></div>

<div class="note warn"><span class="t">Power the bilge probes only while reading them</span>
<p>Exactly as in the <a href="project.html?p=water-leak-alarm">leak alarm</a>: constant DC across two
electrodes sitting in water is an electroplating cell, and one track dissolves within months.</p>
<p>Drive the probe supply from a GPIO, energise for 2&nbsp;ms, read, switch off. A 0.2% duty cycle, and probes
that last.</p>
<p>On a boat this matters more than anywhere else, because the probes are permanently damp.</p></div>

<div class="note warn"><span class="t">Antennas up, out of the bilge</span>
<p>Water absorbs 2.4&nbsp;GHz well. A receiver antenna lying in a damp bilge has a fraction of its range, and
range is what keeps the boat recoverable.</p>
<p>Mount the antennas vertically, as high in the hull as possible, away from the battery and the motor. If the
hull is carbon or has a metallic finish, they need to be outside it.</p></div>`,

solderSteps: [
  { h: 'Conformal coat the boards before assembly',
    body: `<p>Mask the connectors, headers and the USB port with tape. Spray a thin even coat, let it dry, do
    a second. Then peel the masking.</p>
    <p>Do this before anything is mounted. Coating a fitted board is much harder and you will miss the
    underside.</p>` },
  { h: 'Every wire into the box through a gland or silicone',
    body: `<p>Drill for cable glands, or make a hole slightly undersized, pass the wire, and fill with neutral-cure
    silicone from both sides.</p>
    <p><strong>Leave a drip loop</strong> on every cable outside the box, so water runs to the bottom of the
    loop and drips off rather than following the cable into the hole.</p>` },
  { h: 'Motor connections, sealed',
    body: `<p>Solder and heatshrink with adhesive-lined tubing. The motor lives in the wettest part of the
    hull and a bare joint corrodes within a season.</p>
    <p>Two wires, no polarity that matters - swap them to reverse the propeller direction.</p>` },
  { h: 'The water cooling coil',
    body: `<p>Copper tube wound round the motor can, a pickup facing backwards near the propeller, and an
    outlet through the hull above the waterline.</p>
    <p>The boat's own motion pumps it. Check water comes out of the outlet within a few seconds of moving off
    - a blocked pickup means no cooling and a ruined motor, and there is no warning.</p>
    <p>The DS18B20 taped to the can under the coil is the warning.</p>` },
  { h: 'Bilge probes at the lowest point',
    body: `<p>Where water actually collects, which on most hulls is right at the stern near the stuffing tube.
    Two probes, one slightly higher than the other, so you get "damp" and "flooding" as separate states.</p>
    <p>Keep the joints above the probes - a solder joint sitting in the bilge is a corrosion site.</p>` },
  { h: 'Float test before anything electrical goes in',
    body: `<p>Hull in a bath or a sink, with weights standing in for the electronics. Leave it for twenty
    minutes and look for water inside.</p>
    <p>Then check the trim - the boat should sit level and at the designed waterline. Finding out it is
    stern-heavy after everything is glued in is a bad afternoon.</p>` }
],

assembly: [
  { h: 'Build and test everything on the bench, dry',
    body: `<p>Throttle, reverse, rudder, arming, all three failsafe cases, telemetry. Propeller off, or the
    boat on a stand.</p>
    <p>Debugging on the water involves a swim.</p>` },
  { h: 'Set the ESC neutral and check it',
    body: `<p>A brushed car ESC uses 1500&nbsp;microseconds for neutral, and most need calibrating to the
    transmitter's endpoints once - usually by holding full throttle at power-up and following the beeps.</p>
    <p>Read your ESC's instructions. Then confirm the boat does nothing at power-up with the stick centred,
    before it goes near water.</p>` },
  { h: 'Set the rudder endpoints',
    body: `<p>Full rudder either way without the servo straining against the linkage. If you can hear it
    buzzing at full lock, narrow the endpoints.</p>
    <p>Then centre it so the boat runs straight, which will need adjusting on the water anyway.</p>` },
  { h: 'Test the bilge alarm with actual water',
    body: `<p>A few drops on the probe. It should report within a second or two.</p>
    <p>Then check the telemetry reaches the handset - a bilge alarm the boat knows about and you do not is
    useless.</p>` },
  { h: 'Float test with everything in',
    body: `<p>Full boat, in a bath, for twenty minutes, motor running briefly. Look for water, check the trim,
    check the cooling outlet flows.</p>
    <p>This is much easier than finding the same problems at the far side of a pond.</p>` },
  { h: 'First outing: small pond, downwind bank behind you',
    body: `<p>Stand on the <strong>downwind</strong> side. That way a boat that fails drifts <em>toward</em>
    you rather than away, which is the single most useful habit in this hobby.</p>
    <p>Short runs first. Bring it in, open it up, check for water, check the motor temperature.</p>` },
  { h: 'Have a recovery plan before you need one',
    body: `<p>A length of line and something to throw, a long pole, or a second boat. Decide before the first
    outing, not while watching yours drift.</p>
    <p>Do not swim for it. A cold pond is genuinely dangerous and an RC boat is not worth it.</p>` },
  { h: 'Check the motor temperature after every run',
    body: `<p>Telemetry gives you it live; a finger on the can confirms it. Warm is fine, too hot to hold means
    the cooling is blocked or the propeller is too large for the motor.</p>` }
],

libraries: [
  { name: 'AlfredoCRSF', by: 'Alfredo Systems', why: 'Channels in, telemetry out.' },
  { name: 'ESP32Servo', by: 'Kevin Harrington', why: 'ESC and rudder servo.' },
  { name: 'Adafruit INA219', by: 'Adafruit', why: 'Battery telemetry.' },
  { name: 'OneWire / DallasTemperature', by: 'Stoffregen / Burton', why: 'Motor temperature.' },
  { name: 'FastLED', by: 'Daniel Garcia', why: 'Navigation lights and the failsafe flash.' }
],

code: [
{
  h: 'The boat',
  intro: `<p>The failsafe circle and the bilge monitoring are the parts specific to water.</p>`,
  name: 'rc_boat.ino',
  code: `/* ------------------------------------------------------------------
   RC boat with bilge and temperature monitoring.

   Failsafe CIRCLES rather than stopping, because a stopped boat
   drifts away and a circling one stays in radio range - so the link
   often recovers and you can drive it home.
   ------------------------------------------------------------------ */

#include <AlfredoCRSF.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <FastLED.h>

#define ESC_PIN      25
#define RUDDER_PIN   26
#define BILGE_POWER  33
#define BILGE_SIG    32
#define TEMP_PIN     27
#define BUZZER       12
#define LED_PIN      14
#define NUM_LEDS      8
#define RX_PIN       16
#define TX_PIN       17

#define ESC_NEUTRAL  1500
#define ESC_FWD_MAX  1900
#define ESC_REV_MAX  1100

#define RUDDER_CENTRE 1500
#define RUDDER_LEFT   1200
#define RUDDER_RIGHT  1800

#define SILENCE_MS      300
#define CIRCLE_MS     30000     // circle this long, then give up
#define CIRCLE_THROTTLE  1600   // gentle - enough to hold station
#define MOTOR_WARN_C     70.0

AlfredoCRSF crsf;
Servo esc, rudder;
Adafruit_INA219 ina;
OneWire oneWire(TEMP_PIN);
DallasTemperature temps(&oneWire);
CRGB leds[NUM_LEDS];

bool linkUp = false, armed = false;
bool bilgeWet = false;
float volts = 0, amps = 0, motorC = 0;
unsigned long lastFrame = 0, failsafeAt = 0;

void setup() {
  Serial.begin(115200);

  esc.attach(ESC_PIN, 1000, 2000);
  esc.writeMicroseconds(ESC_NEUTRAL);          // neutral FIRST
  rudder.attach(RUDDER_PIN, 1000, 2000);
  rudder.writeMicroseconds(RUDDER_CENTRE);

  pinMode(BILGE_POWER, OUTPUT);
  digitalWrite(BILGE_POWER, LOW);              // probes OFF by default
  pinMode(BILGE_SIG, INPUT);
  pinMode(BUZZER, OUTPUT);

  Serial2.begin(420000, SERIAL_8N1, RX_PIN, TX_PIN);
  crsf.begin(Serial2);

  Wire.begin(21, 22);
  ina.begin();
  ina.setCalibration_32V_2A();
  temps.begin();
  temps.setResolution(11);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(80);

  Serial.println(F("boat ready"));
  tone(BUZZER, 2000, 120);
}

void loop() {
  crsf.update();
  if (crsf.isLinkUp()) lastFrame = millis();

  bool up = crsf.isLinkUp() && (millis() - lastFrame < SILENCE_MS);
  if (up != linkUp) {
    linkUp = up;
    if (!linkUp) { failsafeAt = millis(); Serial.println(F("*** FAILSAFE ***")); }
  }

  updateSensors();

  if (!linkUp) { failsafe(); return; }

  bool wantArm = crsf.getChannel(5) > 1500;
  if (wantArm && !armed && fabs(stick(crsf.getChannel(3))) < 0.05) {
    armed = true; tone(BUZZER, 2500, 150);
  }
  if (!wantArm) armed = false;

  if (armed) {
    float t = stick(crsf.getChannel(3));
    int us = (t >= 0) ? ESC_NEUTRAL + t * (ESC_FWD_MAX - ESC_NEUTRAL)
                      : ESC_NEUTRAL + t * (ESC_NEUTRAL - ESC_REV_MAX);
    esc.writeMicroseconds(constrain(us, ESC_REV_MAX, ESC_FWD_MAX));
  } else {
    esc.writeMicroseconds(ESC_NEUTRAL);
  }

  steer(stick(crsf.getChannel(1)));
  navLights();
  checkAlarms();

  static unsigned long lastTelem = 0;
  if (millis() - lastTelem > 400) { lastTelem = millis(); sendTelemetry(); }
}

/* --- failsafe: circle, then give up ------------------------------------
   A stopped boat drifts downwind until it reaches the far bank. A
   circling boat stays roughly where it is - and therefore stays in
   radio range, so the link often recovers. */
void failsafe() {
  armed = false;
  unsigned long since = millis() - failsafeAt;

  if (since < CIRCLE_MS) {
    esc.writeMicroseconds(CIRCLE_THROTTLE);
    rudder.writeMicroseconds(RUDDER_RIGHT);
  } else {
    /* Give up eventually. A boat circling on a dead radio until the
       pack is flat ends up adrift with no way to signal - which is
       worse than being adrift with a working buzzer. */
    esc.writeMicroseconds(ESC_NEUTRAL);
    rudder.writeMicroseconds(RUDDER_CENTRE);
  }

  // Bright white flash - visible across a pond, and it tells you
  // which of the three boats out there is yours.
  bool on = (millis() / 250) % 2;
  fill_solid(leds, NUM_LEDS, on ? CRGB::White : CRGB::Black);
  FastLED.show();

  if (since > 3000) {
    static unsigned long lastBeep = 0;
    if (millis() - lastBeep > 900) { lastBeep = millis(); tone(BUZZER, 2700, 300); }
  }
}

/* --- sensors ------------------------------------------------------------ */
void updateSensors() {
  static unsigned long last = 0;
  if (millis() - last < 500) return;
  last = millis();

  /* Probes powered for 2 ms only. Constant DC across two electrodes
     in water dissolves one of them - and on a boat they are
     permanently damp, so this matters more than anywhere else. */
  digitalWrite(BILGE_POWER, HIGH);
  delayMicroseconds(2000);
  bool wet = (digitalRead(BILGE_SIG) == LOW);
  digitalWrite(BILGE_POWER, LOW);

  if (wet && !bilgeWet) Serial.println(F("*** WATER IN THE HULL ***"));
  bilgeWet = wet;

  volts = ina.getBusVoltage_V();
  amps = ina.getCurrent_mA() / 1000.0;
  if (amps < 0) amps = 0;

  temps.requestTemperatures();
  float c = temps.getTempCByIndex(0);
  if (c > -50) motorC = c;
}

void checkAlarms() {
  if (bilgeWet) {
    static unsigned long lastBeep = 0;
    if (millis() - lastBeep > 600) {
      lastBeep = millis();
      tone(BUZZER, 3000, 200);
    }
  }
  if (motorC > MOTOR_WARN_C) {
    static unsigned long lastWarn = 0;
    if (millis() - lastWarn > 3000) {
      lastWarn = millis();
      Serial.print(F("! motor hot: ")); Serial.println(motorC, 0);
      tone(BUZZER, 1500, 400);
    }
  }
}

void navLights() {
  // Red to port, green to starboard, white astern - the actual
  // convention, and it makes the boat's heading readable at distance.
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  leds[0] = CRGB::Red;
  leds[1] = CRGB::Red;
  leds[NUM_LEDS - 2] = CRGB::Green;
  leds[NUM_LEDS - 1] = CRGB::Green;
  leds[NUM_LEDS / 2] = CRGB::White;

  if (bilgeWet) {
    // Override everything - a flooding boat should look wrong.
    bool on = (millis() / 200) % 2;
    if (on) fill_solid(leds, NUM_LEDS, CRGB::Orange);
  }
  FastLED.show();
}

void steer(float unit) {
  int us = (unit >= 0)
    ? RUDDER_CENTRE + unit * (RUDDER_RIGHT - RUDDER_CENTRE)
    : RUDDER_CENTRE + unit * (RUDDER_CENTRE - RUDDER_LEFT);
  rudder.writeMicroseconds(constrain(us, RUDDER_LEFT, RUDDER_RIGHT));
}

void sendTelemetry() {
  if (!linkUp) return;

  crsf_sensor_battery_t b = { 0 };
  b.voltage = htobe16((uint16_t)(volts * 10));
  b.current = htobe16((uint16_t)(amps * 10));
  // Abuse the "remaining" field to shout about the bilge - it is the
  // field the handset displays most prominently, and a flooding boat
  // deserves the most prominent field.
  b.remaining = bilgeWet ? 0 : constrain((int)((volts / 3 - 3.3) / 0.9 * 100), 0, 100);

  crsf.queuePacket(CRSF_SYNC_BYTE, CRSF_FRAMETYPE_BATTERY_SENSOR, &b, sizeof(b));
}

float stick(int raw) {
  if (abs(raw - 992) < 15) return 0;
  return constrain((raw - 992) / 819.0, -1.0, 1.0);
}`,
  after: `<p><strong>The circling failsafe is the one genuinely water-specific idea here.</strong> Everywhere else
  "safe" means stop; on a pond, stopping is how you lose the boat. A slow circle holds station, which keeps it
  in radio range, which is how most lost-link events end with the boat driving itself home.</p>
  <p><strong>Giving up after 30 seconds matters too.</strong> A boat circling indefinitely on a dead radio ends
  up adrift with a flat pack and no buzzer - worse than adrift with a working one.</p>
  <p><strong>Reporting the bilge as 0% battery</strong> is a deliberate abuse of the telemetry field, because
  it is the one the handset shows most prominently and sounds its own alarm on. A flooding boat deserves the
  loudest channel available.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note warn"><span class="t">Propeller off, or the boat on a stand</span>
<p>A propeller in air is less dangerous than an aircraft one and it will still take skin off. Test on a stand
with the propeller clear of everything.</p></div>
<div class="note danger"><span class="t">Check ESC neutral before the boat touches water</span>
<p>1500&nbsp;microseconds. A boat that motors off at full throttle the instant you connect the battery is a
boat in the middle of a pond before you have picked up the transmitter.</p></div>`,

tune: [
  { h: 'Which way the failsafe circles',
    body: `<p>Full rudder one way gives a tight circle. Try both on the water - on some hulls one direction
    circles much more tightly than the other because of propeller torque.</p>
    <p>Pick the tighter one. A smaller circle means less drift while the link is down.</p>` },
  { h: 'Propeller size against motor temperature',
    body: `<p>A larger propeller is faster and loads the motor harder. If the motor runs above about
    70&nbsp;&deg;C, go smaller - a cooked motor is a more expensive lesson than a slower boat.</p>
    <p>The temperature telemetry is there so you find this out on the first run rather than the tenth.</p>` },
  { h: 'Check the cooling flow every time',
    body: `<p>Water should come out of the outlet within a few seconds of moving off. A pickup blocked by weed
    is common and there is no other warning.</p>
    <p>If you want to automate it, a second DS18B20 in the cooling outlet water tells you whether flow has
    stopped before the motor notices.</p>` },
  { h: 'Add GPS for real recovery',
    body: `<p>A boat that reports its position when the link drops is a boat you can find, even if it has
    drifted into reeds. The <a href="project.html?p=gps-lora-tracker">tracker project</a> transfers
    directly.</p>
    <p>On a big lake this is the difference between an inconvenience and a lost boat.</p>` },
  { h: 'Self-righting, if the hull allows',
    body: `<p>Some hulls can be ballasted to self-right after a capsize. Weight low, buoyancy high, and a
    sealed deck.</p>
    <p>It costs top speed and it means a capsize is a delay rather than a loss.</p>` },
  { h: 'Brushless when you want speed',
    body: `<p>The <a href="project.html?p=rc-rover-brushless">rover project's</a> brushless setup transfers
    straight over - water-cooled brushless is standard on fast RC boats and the cooling problem is already
    solved.</p>
    <p>Do it after the hull has proven it stays dry.</p>` }
],

trouble: [
  { q: 'Water in the hull after every run',
    a: `The stuffing tube, almost always. Re-pack it with marine grease. Then check the rudder post seal and
    every wire entry. A little water is normal on many hulls; a lot means a specific leak you can find by
    filling the hull in a bath.` },
  { q: 'It motors off when the battery is connected',
    a: `ESC neutral wrong, or the ESC needs calibrating to the transmitter endpoints. Check the sketch writes
    1500 first, and follow your ESC's calibration procedure.` },
  { q: 'The motor overheats',
    a: `Blocked cooling pickup, or too large a propeller. Check water flows from the outlet. Then go down a
    propeller size.` },
  { q: 'Range is poor on the water',
    a: `Antenna in the bilge or lying flat. Water absorbs 2.4&nbsp;GHz well. Mount both antennas vertically
    and as high in the hull as possible, away from the battery.` },
  { q: 'The bilge alarm triggers with no water',
    a: `Condensation bridging the probes, which is normal on a cold day. Raise the probes slightly, or require
    two consecutive wet readings as in the leak alarm project.` },
  { q: 'The bilge probes stopped working after a season',
    a: `Electrolysis. Check the probe supply really is being switched - a meter on the pin should read near
    zero between reads. Permanently damp probes with constant DC dissolve within months.` },
  { q: 'It circles the wrong way on failsafe',
    a: `Swap <code>RUDDER_RIGHT</code> for <code>RUDDER_LEFT</code> in the failsafe. Try both on the water -
    one direction usually circles tighter.` },
  { q: 'Steering is reversed',
    a: `Either flip the channel in the handset, or negate the stick value. The handset is easier and does not
    need a reflash at the pond.` },
  { q: 'Everything works dry and fails on the water',
    a: `Condensation or a leak reaching a board. This is what the conformal coating is for. Open it up, dry
    it thoroughly, add silica gel, and find the leak.` }
],

next: `
<ul>
  <li><strong>Learn the radio first</strong> - the
  <a href="project.html?p=rc-receiver-decoder">receiver decoder</a> covers CRSF and failsafe on a bench.</li>
  <li><strong>The leak detection, done properly</strong> - the
  <a href="project.html?p=water-leak-alarm">water leak alarm</a> explains the electrode corrosion problem in
  full.</li>
  <li><strong>Faster</strong> - the <a href="project.html?p=rc-rover-brushless">brushless rover's</a>
  drivetrain transfers directly, once the hull has proven it stays dry.</li>
  <li><strong>Find it when you lose it</strong> - the
  <a href="project.html?p=gps-lora-tracker">GPS tracker</a> in a boat is the difference between a delay and a
  lost boat.</li>
  <li><strong>Make it useful</strong> - a bait boat, a depth sounder on a transducer, or a water sampler.
  An RC boat that does a job is much easier to justify than one that does not.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Water and lithium</span>
<ul>
  <li><strong>A wet LiPo is a fire risk.</strong> Salt water far more so than fresh. If a pack gets wet,
  disconnect it, dry it, put it somewhere safe outside and watch it for an hour before deciding what to do.
  Never charge a pack that has been submerged.</li>
  <li><strong>Battery in its own sealed compartment or bag</strong> inside the hull.</li>
  <li><strong>Everything else from the <a href="project.html?p=brushless-thrust-bench">thrust bench</a>
  safety section</strong> still applies - balance charging, bags, storage voltage.</li>
</ul>
</div>
<div class="note danger"><span class="t">Do not go in after it</span>
<ul>
  <li><strong>Never swim for a boat.</strong> Cold water shock is genuinely dangerous and kills people every
  year, in water that does not look cold. A boat costs far less than that.</li>
  <li><strong>Have a recovery plan before the first outing</strong> - a line and a float to throw, a long
  pole, or a friend with a second boat.</li>
  <li><strong>Stand on the downwind side</strong> so a failed boat drifts toward you. The single most useful
  habit in the hobby.</li>
  <li><strong>Know the water.</strong> Depth, weed, current, and whether there is anything you cannot reach.</li>
</ul>
</div>
<div class="note warn"><span class="t">Where you sail it, and who else is there</span>
<ul>
  <li><strong>Check that model boats are allowed.</strong> Many parks, reservoirs and nature reserves prohibit
  them, and some require a permit or club membership.</li>
  <li><strong>Keep well away from wildlife.</strong> A fast boat among nesting birds is genuinely harmful and
  is the fastest way to get model boating banned from a site.</li>
  <li><strong>Give swimmers, anglers and real boats a wide berth</strong>, and keep out of any marked
  channel.</li>
  <li><strong>Propellers still cut.</strong> Disarm before handling the boat at the bank, and keep fingers
  clear when lifting it out.</li>
</ul>
</div>`
});
