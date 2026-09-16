/* GPS over LoRa: position without a SIM card, and a hard line about what you point it at. */
AB.addProject({
slug: 'gps-lora-tracker',
title: 'GPS tracker over LoRa',
cat: 'radio',
level: 4,
time: '10 hours',
solder: true,
board: 'ESP32 + Nano',
tags: ['gps', 'lora', 'tracker', 'geofence', 'deep sleep', 'solar', 'asset tracking', 'neo-6m', 'sx1276'],
blurb: 'Where is the boat, the beehive, the trailer? Position reported over kilometres with no SIM and no subscription - and a clear statement of what this must never be used for.',

skills: ['Position encoding', 'GPS power management', 'Motion-triggered wake', 'Geofencing', 'Adaptive reporting', 'Solar power budgets'],

intro: `
<p>Commercial GPS trackers work over the mobile network, which means a SIM, a monthly fee, and no coverage
exactly where you most want it - a mooring, a hill farm, a wood. This one uses LoRa instead: the tracker
reports to a base station you own, over a link you control, with no ongoing cost and no third party.</p>
<p>The trade is the one that runs through this whole theme. You get kilometres of range and a battery that
lasts months, and in exchange you may send about fourteen bytes every minute or two. A position fix is
fourteen bytes. It is a remarkably good fit.</p>
<p>The engineering problem here is not the radio - after the <a href="project.html?p=lora-remote-sensor">LoRa
sensor project</a> that part is solved. It is the GPS, which draws 45&nbsp;mA and needs to keep listening to
maintain a fix, and would flatten a battery in two days if you simply left it on. Most of this build is about
being clever with when the receiver is awake.</p>
<p>There is also a section at the end about what this must not be used for, and it is not boilerplate. Please
read it before you build.</p>`,

what: [
  'Report position, speed, heading and battery over LoRa, from kilometres away.',
  'Sleep at microamps and wake on movement, so a stationary asset costs almost nothing to watch.',
  'Report often while moving and rarely while parked, automatically.',
  'Raise an immediate alert if the asset leaves a geofence you set.',
  'Show position, distance and bearing from home on a base station display.',
  'Run for months on a LiPo, or indefinitely with a small solar panel.'
],

how: `
<p><strong>Packing a position into fourteen bytes.</strong> A latitude as a <code>double</code> is eight bytes
and wildly more precision than anyone needs. Scaled integers do far better:</p>
<ul>
  <li><strong>int32 at 1e-7 degrees</strong>: 4 bytes, about 11&nbsp;mm of resolution. More than enough.</li>
  <li><strong>int32 at 1e-6 degrees</strong>: still 4 bytes, about 11&nbsp;cm.</li>
  <li>Speed as a single byte in km/h covers 0-255. Heading fits in a byte at 2-degree steps.</li>
</ul>
<p>So: 4 + 4 for position, 1 for speed, 1 for heading, 2 for battery millivolts, plus id and sequence - about
fourteen bytes. At SF9 that is roughly 200&nbsp;ms of airtime, which under the EU 1% duty cycle means a
minimum gap of about twenty seconds. Reporting once a minute while moving is comfortably legal.</p>

<p><strong>The GPS is the power problem, and it has an awkward shape.</strong></p>
<p>A NEO-6M draws about 45&nbsp;mA acquiring and 35&nbsp;mA tracking. Left on continuously that is a
2000&nbsp;mAh battery gone in about two and a half days.</p>
<p>But you cannot simply switch it off between fixes, because a cold start takes minutes - during which it is
drawing the full 45&nbsp;mA anyway. Power-cycling naively can use <em>more</em> energy than leaving it on.</p>
<p>The way out is the module's backup battery. With the RTC and stored ephemeris kept alive - a few microamps
- the receiver can get a <strong>hot start in one to two seconds</strong>. So the cycle becomes: wake the GPS,
get a hot fix in a couple of seconds, transmit, power the GPS down, sleep. Two seconds of 45&nbsp;mA once a
minute averages about 1.5&nbsp;mA, which is a completely different proposition.</p>
<p>This is why the backup battery, which was a convenience in the
<a href="project.html?p=gps-bike-computer">bike computer</a>, is load-bearing here. If it is dead, this
project does not work.</p>

<p><strong>Adaptive reporting.</strong> A parked trailer does not need a position every minute; it needs one
every few hours, and an immediate one the moment it moves.</p>
<p>So an accelerometer becomes the primary wake source. The MPU-6050's motion-detection interrupt draws about
10&nbsp;uA and pulls a pin low when it is disturbed. The ESP32 sleeps until either that interrupt fires or a
long timer expires.</p>
<p>The result: parked, it costs almost nothing and reports a heartbeat every few hours. Moved, it wakes
instantly and starts reporting every minute. That behaviour - not the radio - is what makes the battery life
useful.</p>

<p><strong>Geofencing, done on the tracker.</strong> The tracker stores a home position and a radius, and
computes its own distance from it. Crossing the boundary triggers an immediate report with an alert flag
rather than waiting for the next scheduled one.</p>
<p>Doing this on the tracker rather than the base matters: the base might be out of range, asleep, or
switched off, and the decision that something is wrong should not depend on the link working at that
moment.</p>`,

bom: [
  { id: 'esp32', qty: 2, note: 'One for the tracker, one for the base. Deep sleep and 3.3 V native logic, which the SX1276 requires.' },
  { id: 'gps', qty: 1, note: 'NEO-6M. CHECK THE BACKUP BATTERY - this project depends on hot starts, and a dead cell makes every fix a two-minute cold start. See the assembly notes.' },
  { id: 'lora', qty: 2, note: 'Matched pair in your region’s band.' },
  { id: 'ant-868', qty: 2, note: 'Proper antennas. The tracker’s must be vertical and outside any metal.' },
  { id: 'mpu6050', qty: 1, note: 'Motion wake. Its interrupt draws about 10 uA and is what lets the tracker sleep for hours without missing a theft.' },
  { id: 'oled13', qty: 1, note: 'On the base. Position, distance, bearing and signal quality.' },
  { id: 'lipo2000', qty: 1, note: 'The tracker. Months if the sleep current is right, days if it is not.' },
  { id: 'tp4056', qty: 1, note: 'The protected version with the DW01 chip. Not the bare charger.' },
  { id: 'solar6v', qty: 1, note: 'Makes it indefinite. Read the cold-charging warning in the safety section before fitting one outdoors.' },
  { id: 'box-ip65', qty: 1, note: 'The tracker lives outdoors. The GPS antenna must face up through plastic, and the LoRa antenna must be vertical.' },
  { id: 'res10k', qty: 2, note: 'Battery sense divider on the tracker.' },
  { id: 'cap10', qty: 2, note: 'Across each radio module’s supply.' },
  { id: 'mosfet', qty: 1, note: 'Switches GPS power so it can be turned fully off between fixes. A logic-level part - an IRLZ44N or a small P-channel on the high side.' },
  { id: 'perfboard', qty: 2 },
  { id: 'headers-f', qty: 2 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'bb-400', qty: 2, own: true, note: 'Prototype both ends first.' }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', note: 'Essential here. Sleep current is the whole design and you cannot tune what you cannot measure.' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',   at: [0, 56] },
    { id: 'bb',   comp: 'bb400',   at: [0, -6] },
    { id: 'lora', comp: 'lora',    at: [-54, -56], ry: 180 },
    { id: 'gps',  comp: 'gps',     at: [48, -56] },
    { id: 'imu',  comp: 'mpu6050', at: [-4, -56] },
    { id: 'chg',  comp: 'tp4056',  at: [0, -96] }
  ],
  wires: [
    { from: 'mcu.3V3',   to: 'bb.T+2',   color: 'red',    note: '3.3 V rail. Everything here is 3.3 V' },
    { from: 'mcu.GND',   to: 'bb.T-2',   color: 'black',  note: 'Ground rail' },
    { from: 'lora.VCC',  to: 'bb.T+6',   color: 'red',    note: 'Radio power - the SX1276 is 3.3 V and not 5 V tolerant anywhere' },
    { from: 'lora.GND',  to: 'bb.T-6',   color: 'black',  note: 'Radio ground' },
    { from: 'lora.NSS',  to: 'mcu.D5',   color: 'orange', note: 'SPI chip select' },
    { from: 'lora.SCK',  to: 'mcu.D18',  color: 'yellow', note: 'SPI clock' },
    { from: 'lora.MISO', to: 'mcu.D19',  color: 'purple', note: 'SPI data in' },
    { from: 'lora.MOSI', to: 'mcu.D23',  color: 'blue',   note: 'SPI data out' },
    { from: 'lora.RST',  to: 'mcu.D27',  color: 'white',  note: 'Radio reset' },
    { from: 'lora.DIO0', to: 'mcu.D26',  color: 'green',  note: 'Transmit-done interrupt' },
    { from: 'gps.VCC',   to: 'bb.T+14',  color: 'red',    note: 'GPS power, switched through the MOSFET so it can be fully off between fixes' },
    { from: 'gps.GND',   to: 'bb.T-14',  color: 'black',  note: 'GPS ground' },
    { from: 'gps.TX',    to: 'mcu.D16',  color: 'green',  note: 'GPS to Serial2 RX - a real hardware port, no SoftwareSerial here' },
    { from: 'gps.RX',    to: 'mcu.D17',  color: 'orange', note: 'Serial2 TX, for sending power-save commands to the module' },
    { from: 'mcu.D4',    to: 'bb.T+18',  color: 'purple', note: 'GPS power control. HIGH wakes the module, LOW kills it entirely' },
    { from: 'imu.VCC',   to: 'bb.T+22',  color: 'red',    note: 'Accelerometer power. Stays on - its motion interrupt is the wake source' },
    { from: 'imu.GND',   to: 'bb.T-22',  color: 'black',  note: 'Accelerometer ground' },
    { from: 'imu.SDA',   to: 'mcu.D21',  color: 'blue',   note: 'I2C data' },
    { from: 'imu.SCL',   to: 'mcu.D22',  color: 'yellow', note: 'I2C clock' },
    { from: 'imu.INT',   to: 'mcu.D33',  color: 'green',  note: 'Motion interrupt - this pin is what wakes the ESP32 from deep sleep' },
    { from: 'chg.OUT+',  to: 'mcu.VIN',  color: 'red',    note: 'Battery through the protection board to VIN, never straight to 3V3' },
    { from: 'chg.OUT-',  to: 'bb.T-28',  color: 'black',  note: 'Battery negative via the protection board' },
    { from: 'mcu.D35',   to: 'bb.T+30',  color: 'brown',  note: 'Battery sense: two 10 k across the cell, midpoint here' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">This model shows the TRACKER. The base is simpler.</span>
<p>The base station is an ESP32, a LoRa module and an OLED - the same receiving half as the
<a href="project.html?p=lora-remote-sensor">LoRa sensor project</a>, with different display code. No GPS, no
accelerometer, no battery management.</p>
<p>Build the base first. It is an hour's work and it gives you somewhere to see the tracker's output while you
debug the hard end.</p></div>

<div class="note danger"><span class="t">Antenna before power, and two antennas that must not fight</span>
<p>Transmitting into no antenna destroys the SX1276. Fit it first, always.</p>
<p>This build has two antennas in one box and they want different things. The <strong>GPS patch must face
up</strong> through plastic with a clear view. The <strong>LoRa whip must stand vertical</strong>. Keep them
at least 50&nbsp;mm apart - a LoRa transmitter right beside a GPS front end will desensitise it during
transmission, and the fix will suffer exactly when you need it.</p>
<p>The sketch transmits after the GPS fix is complete and the receiver is powered down, which sidesteps most
of this. Physical separation handles the rest.</p></div>

<div class="note danger"><span class="t">Switch the GPS power, do not just idle it</span>
<p>The MOSFET on the GPS supply is what makes the battery life possible. "Sleep" modes on these modules still
draw milliamps; fully removing power draws nothing, and the backup battery keeps the ephemeris alive so the
next start is still hot.</p>
<p>Use a logic-level part. If you switch the low side, the GPS ground floats when off and its serial lines can
back-feed the module through the ESP32's pins - so the tidy answer is a P-channel MOSFET on the high side, or
an N-channel low-side switch with the serial lines also driven low before power-down. The sketch drives the
serial pins low before cutting power for exactly this reason.</p></div>

<div class="note warn"><span class="t">Hardware serial, not SoftwareSerial</span>
<p>The ESP32 has three hardware UARTs. The GPS goes on Serial2 (D16/D17). This is one of the real reasons this
project is not a Nano - at 9600 baud with an interrupt-driven sleep cycle, SoftwareSerial drops characters and
every dropped character costs a whole sentence.</p></div>

<div class="note tip"><span class="t">The MPU-6050 stays powered. That is fine.</span>
<p>Its motion-detection interrupt mode draws about 10&nbsp;uA - less than the battery's own self-discharge.
Leaving it awake to watch for movement is the cheapest part of the whole design.</p>
<p>Wire INT to an RTC-capable pin (D33 is one) so it can wake the ESP32 from deep sleep. Not every GPIO can
do this: the RTC-capable pins are 0, 2, 4, 12-15, 25-27 and 32-39.</p></div>`,

solderSteps: [
  { h: 'Check the GPS backup battery before anything else',
    body: `<p>Power the module for an hour, then measure across the small cell or supercapacitor. Healthy is
    2.5-3&nbsp;V.</p>
    <p>If it is flat, replace it before you build - an ML1220 rechargeable coin cell. <strong>This project
    depends on hot starts.</strong> With a dead backup cell every fix is a two-minute cold start at
    45&nbsp;mA, which is roughly forty times the energy per report and turns months of battery life into
    days.</p>
    <p>Prove it works: get a fix, remove power for a minute, reapply, and time the second fix. Under five
    seconds and you are ready.</p>` },
  { h: 'Antennas on both radios',
    body: `<p>86&nbsp;mm quarter-wave wire for 868&nbsp;MHz, or the proper antenna and pigtail. Before power,
    on both modules.</p>` },
  { h: 'The GPS power switch',
    body: `<p>A P-channel MOSFET on the high side is the clean way: source to 3.3&nbsp;V, drain to the GPS
    VCC, gate pulled up to 3.3&nbsp;V through 10&nbsp;k and driven low by the ESP32 through a small
    N-channel or directly (inverted in software).</p>
    <p>A logic-level N-channel on the low side is simpler and acceptable here, and the sketch drives the
    serial pins low before cutting power so nothing back-feeds.</p>
    <p>Measure it: with the pin off, the current into the GPS should be zero, not "a bit less".</p>` },
  { h: 'Sockets for everything',
    body: `<p>ESP32, LoRa module, GPS and accelerometer all on female headers. This build goes in a box
    outdoors and comes back in for changes more than once.</p>` },
  { h: 'Battery, charger and solar in the right order',
    body: `<p>Cell to TP4056 <strong>B+/B-</strong>. Load off <strong>OUT+/OUT-</strong>. Solar panel to the
    charger input.</p>
    <p>Taking the load from B+/B- bypasses the protection chip, which is the entire point of buying the
    protected board. Check the cell's JST polarity with a meter first - suppliers are inconsistent and
    reversing a lithium cell is the genuinely dangerous mistake here.</p>` },
  { h: 'Weatherproofing that still lets signals through',
    body: `<p>IP65 box, vents on the <strong>underside only</strong> so it breathes without letting rain in.
    A fully sealed box condenses inside itself on every daily temperature cycle.</p>
    <p>The GPS patch goes hard against the inside of the lid, face up. The LoRa antenna vertical, well away
    from it. Cable glands and a drip loop on anything entering.</p>` },
  { h: 'Measure the sleep current before you close the lid',
    body: `<p>Meter in series with the battery, tracker asleep. You are aiming for well under a milliamp;
    with a bare ESP32 module you can reach tens of microamps.</p>
    <p>If it reads 15&nbsp;mA, that is the DevKit's regulator and USB chip, not your sketch - see the tuning
    section. Find this out now, not in three weeks when the battery is flat.</p>` }
],

assembly: [
  { h: 'Build the base station first',
    body: `<p>ESP32, LoRa, OLED. It is the receiving half of the sensor project with different display code,
    and it gives you a window into the tracker while you work on it.</p>` },
  { h: 'Prove the radio link with a stub packet',
    body: `<p>Before the GPS exists. Have the tracker send a fixed, made-up position once a second and confirm
    the base displays it, with sensible RSSI.</p>
    <p>Debugging "no position" is much easier when you already know the radio works.</p>` },
  { h: 'Add the GPS and get a fix on hardware serial',
    body: `<p>Serial2 on D16/D17 at 9600. Print raw NMEA first, outdoors, and confirm a fix.</p>
    <p>Then time a hot start: fix, power down for thirty seconds, power up, time to fix. Under five seconds
    means the backup battery is doing its job and the power design will work.</p>` },
  { h: 'Add the accelerometer and tune the motion threshold',
    body: `<p>Set the MPU-6050's motion interrupt, then experiment. Too sensitive and wind or a passing lorry
    wakes it; too coarse and someone can lift the asset gently without triggering it.</p>
    <p>Test the actual failure case: have someone pick the thing up the way a thief would, and see whether it
    fires.</p>` },
  { h: 'Set the geofence from a real fix',
    body: `<p>Let it sit at its home location for ten minutes, take the median position, and put that in
    <code>HOME_LAT</code> / <code>HOME_LON</code>.</p>
    <p>Set the radius generously - 100&nbsp;m or more. GPS wanders, and a geofence tight enough to catch a
    theft immediately is also tight enough to cry wolf every night.</p>` },
  { h: 'Walk the radio link before you commit to a location',
    body: `<p>Same procedure as the sensor project: carry the tracker, watch RSSI at the base, and map where
    it works. A tracker that cannot reach the base from where the asset lives is decoration.</p>
    <p>Leave 10-15&nbsp;dB of margin. Summer foliage and rain both take a few dB.</p>` },
  { h: 'Run the whole thing for a week on the bench',
    body: `<p>Battery voltage logged at the base tells you the real drain. Extrapolate before you fit it
    anywhere inconvenient.</p>
    <p>Move it occasionally to check the motion wake, and leave it still to check the heartbeat.</p>` },
  { h: 'Install it, and be honest about what it is for',
    body: `<p>On your own property, tracking your own asset. The safety section is not decoration - please
    read it before this goes anywhere.</p>` }
],

libraries: [
  { name: 'TinyGPSPlus', by: 'Mikal Hart', why: 'NMEA parsing with checksum validation.' },
  { name: 'LoRa', by: 'Sandeep Mistry', why: 'Point-to-point SX127x.' },
  { name: 'MPU6050_light', by: 'rfetick', why: 'Small and quick to start - important when the sketch runs for two seconds at a time. The full Jeff Rowberg library also works and takes longer to initialise.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The base station display.' },
  { name: 'ESP32 board package', by: 'Espressif', how: 'Boards Manager: "esp32"', why: 'Deep sleep, RTC memory and ext0 wake sources.' }
],

code: [
{
  h: 'The tracker',
  intro: `<p>Wakes on movement or on a long timer, gets a hot fix, decides how urgent it is, transmits, and
  goes back to sleep. Most of the interesting code is about not being awake.</p>`,
  name: 'lora_tracker.ino',
  code: `/* ------------------------------------------------------------------
   GPS tracker over LoRa.

   Wake source decides the behaviour:
     motion interrupt -> moving: fix, report, short sleep
     timer            -> parked: fix, heartbeat report, long sleep

   Geofence is evaluated ON THE TRACKER, so leaving the boundary
   raises an alert even if the base is out of range at that moment.
   ------------------------------------------------------------------ */

#include <TinyGPSPlus.h>
#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <MPU6050_light.h>

// ---- identity and radio ---------------------------------------------
#define TRACKER_ID   1
#define LORA_SS       5
#define LORA_RST     27
#define LORA_DIO0    26
#define LORA_FREQ  868E6
#define LORA_SF        9
#define LORA_BW    125E3
#define LORA_CR        5
#define LORA_POWER    14
#define LORA_SYNC   0xF3

// ---- pins ------------------------------------------------------------
#define GPS_POWER_PIN  4        // MOSFET gate - HIGH = GPS on
#define GPS_RX_PIN    16        // Serial2
#define GPS_TX_PIN    17
#define IMU_INT_PIN   33        // must be an RTC-capable pin
#define VBAT_PIN      35

// ---- behaviour -------------------------------------------------------
#define FIX_TIMEOUT_MS      90000UL   // give up if no fix in 90 s
#define MOVING_SLEEP_S         60     // report every minute while moving
#define PARKED_SLEEP_S       7200     // heartbeat every 2 hours
#define MOVING_SPEED_KMH        3.0

// Geofence: set these from a real fix at the home location.
#define HOME_LAT     55.6050
#define HOME_LON     13.0038
#define FENCE_RADIUS_M  150.0

#define FLAG_MOVING   0x01
#define FLAG_FENCE    0x02
#define FLAG_LOWBAT   0x04
#define FLAG_NOFIX    0x08

struct Position {
  uint8_t  id;
  uint8_t  flags;
  uint16_t seq;
  int32_t  lat;          // degrees x 1e7  -> ~11 mm, 4 bytes
  int32_t  lon;
  uint8_t  speedKmh;
  uint8_t  headingDeg2;  // degrees / 2, so 0-179 covers the circle
  uint16_t vbatMv;
} __attribute__((packed));   // 14 bytes

TinyGPSPlus gps;
MPU6050 imu(Wire);

RTC_DATA_ATTR uint16_t seq = 0;
RTC_DATA_ATTR bool wasOutsideFence = false;

void setup() {
  Serial.begin(115200);
  delay(50);
  seq++;

  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
  bool wokeOnMotion = (cause == ESP_SLEEP_WAKEUP_EXT0);

  Serial.print(F("\\n#")); Serial.print(seq);
  Serial.println(wokeOnMotion ? F(" woke: MOTION") : F(" woke: timer"));

  Position p = { TRACKER_ID, 0, seq, 0, 0, 0, 0, 0 };
  p.vbatMv = readBatteryMv();
  if (p.vbatMv < 3400) p.flags |= FLAG_LOWBAT;

  bool gotFix = acquireFix(&p);

  if (gotFix) {
    double dist = TinyGPSPlus::distanceBetween(
        p.lat / 1e7, p.lon / 1e7, HOME_LAT, HOME_LON);

    bool outside = dist > FENCE_RADIUS_M;
    if (outside) p.flags |= FLAG_FENCE;
    if (p.speedKmh >= MOVING_SPEED_KMH) p.flags |= FLAG_MOVING;

    Serial.print(F("  ")); Serial.print(p.lat / 1e7, 6);
    Serial.print(F(", "));  Serial.print(p.lon / 1e7, 6);
    Serial.print(F("  ")); Serial.print(p.speedKmh); Serial.print(F(" km/h"));
    Serial.print(F("  ")); Serial.print(dist, 0); Serial.print(F(" m from home"));
    Serial.println(outside ? F("  *** OUTSIDE FENCE ***") : F(""));

    /* Crossing the fence is the event worth shouting about. Send it
       three times - there is no acknowledgement in this design, and
       the one report that matters most should not be the one that
       gets lost. */
    if (outside && !wasOutsideFence) {
      Serial.println(F("  fence breach - sending x3"));
      for (uint8_t i = 0; i < 3; i++) {
        transmit(&p);
        delay(2000);            // well inside the duty cycle at SF9
      }
    } else {
      transmit(&p);
    }
    wasOutsideFence = outside;

  } else {
    // No fix is itself worth reporting: a tracker in a metal van, or
    // underground, or with a broken antenna, should say so rather
    // than go silent and look like a flat battery.
    p.flags |= FLAG_NOFIX;
    Serial.println(F("  no fix - reporting anyway"));
    transmit(&p);
  }

  // Moving assets get watched closely; parked ones get a heartbeat.
  uint32_t sleepSeconds = (p.flags & (FLAG_MOVING | FLAG_FENCE))
                            ? MOVING_SLEEP_S : PARKED_SLEEP_S;
  goToSleep(sleepSeconds);
}

void loop() { }        // never reached

/* --- GPS -------------------------------------------------------------- */
bool acquireFix(Position *p) {
  pinMode(GPS_POWER_PIN, OUTPUT);
  digitalWrite(GPS_POWER_PIN, HIGH);              // GPS on
  Serial2.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  unsigned long start = millis();
  bool got = false;

  while (millis() - start < FIX_TIMEOUT_MS) {
    while (Serial2.available()) gps.encode(Serial2.read());

    if (gps.location.isValid() && gps.location.isUpdated() &&
        gps.satellites.value() >= 4 &&
        (!gps.hdop.isValid() || gps.hdop.hdop() < 5.0)) {

      p->lat = (int32_t)(gps.location.lat() * 1e7);
      p->lon = (int32_t)(gps.location.lng() * 1e7);
      p->speedKmh = (uint8_t)constrain(
          gps.speed.isValid() ? gps.speed.kmph() : 0, 0, 255);
      p->headingDeg2 = (uint8_t)((gps.course.isValid() ? gps.course.deg() : 0) / 2);

      got = true;
      Serial.print(F("  fix in "));
      Serial.print((millis() - start) / 1000.0, 1);
      Serial.print(F(" s, "));
      Serial.print(gps.satellites.value());
      Serial.println(F(" sats"));
      break;
    }
    delay(10);
  }

  /* Drive the serial pins low BEFORE removing power. Left high, they
     back-feed the module's protection diodes and it stays half alive
     drawing milliamps - which silently destroys the power budget and
     is very hard to spot without a meter. */
  Serial2.end();
  pinMode(GPS_RX_PIN, INPUT);
  pinMode(GPS_TX_PIN, OUTPUT);
  digitalWrite(GPS_TX_PIN, LOW);
  digitalWrite(GPS_POWER_PIN, LOW);               // GPS fully off

  return got;
}

/* --- radio ------------------------------------------------------------ */
void transmit(Position *p) {
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQ)) { Serial.println(F("  radio failed")); return; }

  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BW);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setTxPower(LORA_POWER);
  LoRa.setSyncWord(LORA_SYNC);

  LoRa.beginPacket();
  LoRa.write((uint8_t *)p, sizeof(Position));
  LoRa.endPacket();

  LoRa.sleep();
}

/* --- sleep ------------------------------------------------------------ */
void goToSleep(uint32_t seconds) {
  Serial.print(F("  sleeping "));
  Serial.print(seconds);
  Serial.println(F(" s (or until moved)"));
  Serial.flush();

  setupMotionWake();

  // Two wake sources at once: the accelerometer for theft, the timer
  // for a heartbeat. Whichever comes first.
  esp_sleep_enable_ext0_wakeup((gpio_num_t)IMU_INT_PIN, 0);   // 0 = low
  esp_sleep_enable_timer_wakeup((uint64_t)seconds * 1000000ULL);
  esp_deep_sleep_start();
}

void setupMotionWake() {
  Wire.begin(21, 22);
  imu.begin();

  /* Register-level setup for the MPU-6050's motion interrupt. The
     library does not wrap this, and it is what lets the part sit at
     ~10 uA watching for movement.
       0x1F  motion threshold, 2 mg per count
       0x20  duration in ms the threshold must be exceeded
       0x38  interrupt enable, bit 6 = motion
       0x37  interrupt is active LOW, open drain               */
  writeReg(0x6B, 0x00);       // wake the device
  writeReg(0x1C, 0x00);       // accel range +/- 2 g
  writeReg(0x1F, 20);         // ~40 mg. Raise if wind wakes it.
  writeReg(0x20, 40);         // must persist 40 ms
  writeReg(0x37, 0xA0);       // INT active low, open drain
  writeReg(0x38, 0x40);       // enable motion interrupt
  writeReg(0x6C, 0x07);       // gyro off, accel only - saves current
}

void writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(0x68);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

uint16_t readBatteryMv() {
  analogSetPinAttenuation(VBAT_PIN, ADC_11db);
  uint32_t sum = 0;
  for (uint8_t i = 0; i < 16; i++) { sum += analogRead(VBAT_PIN); delay(2); }
  return (uint16_t)((sum / 16.0) / 4095.0 * 3.3 * 2.0 * 1000);
}`,
  after: `<p>Three details do most of the work here:</p>
  <ul>
    <li><strong>Driving the GPS serial pins low before cutting its power.</strong> Left high, they feed
    current into the module through its input protection diodes and it sits half-powered drawing milliamps.
    The symptom is a battery that lasts a week instead of months, with nothing visibly wrong. This costs three
    lines and is invisible unless you measure.</li>
    <li><strong>Reporting a failed fix rather than going quiet.</strong> A tracker that says nothing is
    ambiguous - flat battery, out of range, or stolen and in a metal van? The <code>FLAG_NOFIX</code> report
    distinguishes them.</li>
    <li><strong>Two wake sources at once.</strong> <code>ext0</code> on the accelerometer plus a timer. The
    timer is the heartbeat that proves the tracker is alive; the interrupt is what makes it useful.</li>
  </ul>
  <p><code>wasOutsideFence</code> lives in RTC memory so the tracker remembers, across deep sleeps, that it
  has already raised the alarm - otherwise every single report from outside the fence would be a fresh triple
  transmission, and the duty cycle would be gone in minutes.</p>`
},
{
  h: 'The base station',
  intro: `<p>Receives, decodes the packed position, and shows distance and bearing from home - which is
  considerably more useful on a small screen than raw coordinates.</p>`,
  name: 'tracker_base.ino',
  code: `/* ------------------------------------------------------------------
   Tracker base station.

   Distance and bearing from home, not latitude and longitude. On a
   128x64 screen "340 m NE" is instantly useful and "55.607412" is
   not - though both are shown, because you will want to type the
   coordinates into a map.
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <TinyGPSPlus.h>

#define LORA_SS     5
#define LORA_RST   27
#define LORA_DIO0  26
#define LORA_FREQ 868E6
#define LORA_SF       9
#define LORA_BW   125E3
#define LORA_CR       5
#define LORA_SYNC  0xF3

#define HOME_LAT   55.6050
#define HOME_LON   13.0038
#define BUZZER     17
#define STALE_MS   10800000UL        // 3 hours: more than one heartbeat

#define FLAG_MOVING  0x01
#define FLAG_FENCE   0x02
#define FLAG_LOWBAT  0x04
#define FLAG_NOFIX   0x08

struct Position {
  uint8_t  id, flags;
  uint16_t seq;
  int32_t  lat, lon;
  uint8_t  speedKmh, headingDeg2;
  uint16_t vbatMv;
} __attribute__((packed));

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
Position p;
bool havePos = false;
int  lastRssi = 0;
float lastSnr = 0;
unsigned long lastRx = 0;
uint16_t lastSeq = 0, missed = 0;
bool alerted = false;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pinMode(BUZZER, OUTPUT);

  if (oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) oled.setTextColor(SSD1306_WHITE);

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQ)) { Serial.println(F("radio failed")); while (1) delay(1000); }
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BW);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setSyncWord(LORA_SYNC);
  LoRa.receive();

  Serial.println(F("base listening"));
  draw();
}

void loop() {
  if (LoRa.parsePacket() == sizeof(Position)) {
    LoRa.readBytes((uint8_t *)&p, sizeof(p));
    lastRssi = LoRa.packetRssi();
    lastSnr  = LoRa.packetSnr();
    lastRx = millis();
    havePos = true;

    if (lastSeq && p.seq > lastSeq + 1) missed += p.seq - lastSeq - 1;
    lastSeq = p.seq;

    double dist = TinyGPSPlus::distanceBetween(p.lat / 1e7, p.lon / 1e7,
                                               HOME_LAT, HOME_LON);
    Serial.print(F("#")); Serial.print(p.seq);
    Serial.print(F("  ")); Serial.print(p.lat / 1e7, 6);
    Serial.print(F(", ")); Serial.print(p.lon / 1e7, 6);
    Serial.print(F("  ")); Serial.print(dist, 0); Serial.print(F(" m"));
    Serial.print(F("  ")); Serial.print(p.speedKmh); Serial.print(F(" km/h"));
    Serial.print(F("  RSSI ")); Serial.print(lastRssi);
    Serial.print(F("  bat ")); Serial.println(p.vbatMv);

    // Alert once per breach, not on every report from outside - an
    // alarm that will not stop gets muted and then ignored.
    if ((p.flags & FLAG_FENCE) && !alerted) {
      alerted = true;
      for (uint8_t i = 0; i < 6; i++) { tone(BUZZER, 2600, 200); delay(300); }
    }
    if (!(p.flags & FLAG_FENCE)) alerted = false;

    draw();
    LoRa.receive();
  }

  static unsigned long lastDraw = 0;
  if (millis() - lastDraw > 1000) { lastDraw = millis(); draw(); }
}

void draw() {
  oled.clearDisplay();
  oled.setTextSize(1);

  if (!havePos) {
    oled.setCursor(0, 28);
    oled.println(F("waiting for tracker..."));
    oled.display();
    return;
  }

  bool stale = (millis() - lastRx) > STALE_MS;

  if (p.flags & FLAG_NOFIX) {
    oled.setCursor(0, 0);
    oled.println(F("TRACKER: NO GPS FIX"));
    oled.setCursor(0, 12);
    oled.println(F("indoors, obstructed"));
    oled.setCursor(0, 22);
    oled.println(F("or antenna fault"));
  } else {
    double dist = TinyGPSPlus::distanceBetween(p.lat / 1e7, p.lon / 1e7,
                                               HOME_LAT, HOME_LON);
    double brg = TinyGPSPlus::courseTo(HOME_LAT, HOME_LON,
                                       p.lat / 1e7, p.lon / 1e7);

    oled.setTextSize(2);
    oled.setCursor(0, 0);
    if (dist < 1000) { oled.print(dist, 0); oled.print(F("m")); }
    else             { oled.print(dist / 1000.0, 2); oled.print(F("km")); }

    oled.setTextSize(1);
    oled.setCursor(84, 4);
    oled.print(cardinal(brg));

    oled.setCursor(0, 20);
    oled.print(p.lat / 1e7, 5); oled.print(F(", "));
    oled.println(p.lon / 1e7, 5);

    oled.setCursor(0, 30);
    oled.print(p.speedKmh); oled.print(F(" km/h  hdg "));
    oled.print(p.headingDeg2 * 2);
  }

  oled.setCursor(0, 42);
  oled.print(F("bat ")); oled.print(p.vbatMv / 1000.0, 2);
  oled.print(F("V  rssi ")); oled.print(lastRssi);

  oled.setCursor(0, 52);
  if (p.flags & FLAG_FENCE)  oled.print(F("OUTSIDE FENCE "));
  else if (p.flags & FLAG_MOVING) oled.print(F("moving "));
  else oled.print(F("parked "));
  if (p.flags & FLAG_LOWBAT) oled.print(F("LOWBAT "));

  if (stale) {
    oled.fillRect(0, 56, 128, 8, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
    oled.setCursor(2, 57);
    oled.print(F("NO REPORT "));
    oled.print((millis() - lastRx) / 60000);
    oled.print(F(" min"));
    oled.setTextColor(SSD1306_WHITE);
  }

  oled.display();
}

const char *cardinal(double deg) {
  const char *d[] = { "N", "NE", "E", "SE", "S", "SW", "W", "NW" };
  return d[(int)((deg + 22.5) / 45.0) % 8];
}`,
  after: `<p>Showing distance and bearing rather than coordinates is the small decision that makes this
  usable. "340&nbsp;m NE" answers the question you actually have; a pair of six-decimal numbers requires a
  map and a minute. Both are on screen, but the useful one is in large type.</p>
  <p>The stale banner matters more here than in the sensor project. A tracker that has stopped reporting is
  exactly the situation you built it for, and a display still showing a three-hour-old position as though it
  were current is worse than a blank screen.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong> for both. Serial Monitor at <strong>115200</strong>.</p>
<div class="note warn"><span class="t">A sleeping tracker is hard to reprogram</span>
<p>Once it is sleeping for two hours at a time, the IDE has almost no chance of catching it. Hold BOOT while
starting the upload and tap EN - it will sit in the bootloader.</p>
<p>While developing, set <code>PARKED_SLEEP_S</code> to 60 so there are frequent opportunities, and put it
back before installing.</p></div>
<div class="note danger"><span class="t">Test outdoors, and set HOME from a real fix</span>
<p>The geofence is meaningless until <code>HOME_LAT</code> and <code>HOME_LON</code> come from the actual
location. Let it sit there, watch ten minutes of fixes, take the middle one.</p>
<p>And set <code>FENCE_RADIUS_M</code> generously. GPS wanders by metres even with a good fix, and a 20&nbsp;m
fence will alarm at three in the morning for no reason at all - after which you will stop believing it.</p></div>`,

tune: [
  { h: 'Where the battery actually goes',
    body: `<p>Measure, do not estimate. With the meter in series: deep sleep should be under a milliamp, the
    GPS fix burst about 45&nbsp;mA for a couple of seconds, and the LoRa transmit about 120&nbsp;mA for
    200&nbsp;ms.</p>
    <p>If sleep reads 15&nbsp;mA it is the DevKit's AMS1117 regulator and CP2102 USB chip. Cutting the power
    LED trace saves 2-3&nbsp;mA; replacing the regulator with an HT7333 saves most of the rest; building on a
    bare ESP32-WROOM module gets you to tens of microamps. That single change is the difference between weeks
    and months.</p>` },
  { h: 'The GPS fix is the energy cost per report',
    body: `<p>Two seconds at 45&nbsp;mA is 25&nbsp;uAh. A cold start of two minutes is 1,500&nbsp;uAh - sixty
    times more.</p>
    <p>So everything that protects hot starts is worth doing: a healthy backup battery, reporting often enough
    that the ephemeris stays valid (it is good for about four hours), and never letting the backup cell run
    flat while the tracker is stored.</p>
    <p>If the tracker will sit unused for weeks, that is an argument for a supercapacitor rather than a coin
    cell, or for accepting cold starts after long idle periods.</p>` },
  { h: 'Tuning the motion threshold with real attacks',
    body: `<p>Register 0x1F is the threshold in 2&nbsp;mg counts, 0x20 the duration in milliseconds. 20 and 40
    is a reasonable start.</p>
    <p>Test it properly: have someone lift the asset slowly and carefully, the way a person taking it would -
    not by shaking it. Then leave it out in wind, or beside a road, and check it does not wake constantly. The
    gap between those two is your working range, and on a boat it can be narrow.</p>` },
  { h: 'Solar sizing, honestly',
    body: `<p>A tracker averaging about 1&nbsp;mA needs roughly 24&nbsp;mAh a day. A 1&nbsp;W 6&nbsp;V panel
    produces that in a few minutes of good light - which sounds absurdly oversized and is correct, because you
    are sizing for December, overcast, at a bad angle, possibly under leaves.</p>
    <p>Tilt it steeply so rain washes it and low winter sun strikes it squarely. Keep the cell out of direct
    sun and away from the panel's heat.</p>` },
  { h: 'Adaptive reporting, taken further',
    body: `<p>The sketch has two rates. Three is better: moving fast (every 30&nbsp;s), moving slowly (every
    2&nbsp;min), parked (every 2&nbsp;hours).</p>
    <p>Keep an eye on the duty cycle as you speed things up. At SF9 a 14-byte packet is about 200&nbsp;ms, so
    the EU 1% rule allows one every 20&nbsp;seconds - 30&nbsp;s is legal, 10&nbsp;s is not.</p>` },
  { h: 'Push it onto a map',
    body: `<p>The base is an ESP32, so it already has Wi-Fi. A few lines of MQTT and the positions land in
    Home Assistant, which will draw them on a map and keep history without any more work.</p>
    <p>Keep the OLED as well - a base station that only works when the network does is a base station that
    fails at the wrong moment.</p>` },
  { h: 'Encryption, and what it does and does not buy',
    body: `<p>Positions are sent in clear. Anyone within range with a matching radio can read them, and can
    also transmit fake ones.</p>
    <p>The ESP32 has hardware AES. Encrypting the 14-byte payload is straightforward and stops casual
    eavesdropping. It does not stop replay without a rolling counter, and it does nothing about someone simply
    jamming the band. If the value of what you are tracking makes you think seriously about an adversary, this
    project is not the right tool.</p>` }
],

trouble: [
  { q: 'Reports arrive but never a fix - <code>FLAG_NOFIX</code> every time',
    a: `The GPS is not getting sky, or the power switch is not actually powering it. Measure the voltage at
    the module's VCC with the pin HIGH. Then test outdoors with a clear view. Then check the antenna
    connector - the U.FL lead works loose easily.` },
  { q: 'Every fix takes 60-90 seconds',
    a: `Cold starts. The backup battery is dead or is being disconnected along with the main power. Measure
    it: 2.5-3&nbsp;V is healthy. This is the single most important thing in the project's power budget.` },
  { q: 'Battery lasts a week instead of months',
    a: `Measure sleep current. Three usual causes: the DevKit's regulator and USB chip (10-20&nbsp;mA), the
    GPS not being fully off because its serial pins are back-feeding it, or the accelerometer left in normal
    mode rather than motion-detect. All three are measurable and all three are invisible without a meter.` },
  { q: 'It wakes constantly and flattens the battery in a day',
    a: `Motion threshold too sensitive. Raise register 0x1F from 20 towards 40, and 0x20 towards 80&nbsp;ms.
    Wind, traffic vibration and rain on a box all trigger a sensitive setting.` },
  { q: 'It never wakes on movement',
    a: `Check the INT pin is on an RTC-capable GPIO - 0, 2, 4, 12-15, 25-27, 32-39. Then check the polarity:
    the MPU-6050 is configured active-low here, so <code>esp_sleep_enable_ext0_wakeup(pin, 0)</code>. Confirm
    with a meter that INT actually goes low when you tap it.` },
  { q: 'Geofence alerts at random overnight',
    a: `The radius is too tight for GPS wander, or fixes with poor HDOP are being accepted. Raise
    <code>FENCE_RADIUS_M</code> to 150&nbsp;m or more, and tighten the HDOP filter in
    <code>acquireFix()</code>. Requiring two consecutive outside fixes before alerting removes almost all
    remaining false alarms.` },
  { q: 'Position is received but is wildly wrong',
    a: `Struct mismatch between tracker and base, or an int32 overflow in the scaling. Print the raw
    <code>lat</code> and <code>lon</code> integers at both ends - at 1e7 scaling a latitude of 55.605 should
    be 556050000, comfortably inside int32.` },
  { q: 'The link works on the bench and not once installed',
    a: `Almost always the antenna. Inside a metal box, lying flat, or too close to the GPS patch. Both
    antennas vertical is wrong for the GPS - it wants to face up - so they need separating physically, at
    least 50&nbsp;mm apart.` },
  { q: 'It stopped reporting entirely',
    a: `Flat battery, out of range, or the asset is gone - which is why the heartbeat exists. Check the last
    reported battery voltage at the base. If it was healthy, the tracker is out of range or has been found.` }
],

next: `
<ul>
  <li><strong>Understand the radio first</strong> - the <a href="project.html?p=lora-remote-sensor">LoRa
  sensor</a> covers spreading factors, duty cycle and link budgets with far less to go wrong.</li>
  <li><strong>Understand the GPS first</strong> - the <a href="project.html?p=gps-bike-computer">bike
  computer</a> covers fixes, HDOP and NMEA on a build you can test in an afternoon.</li>
  <li><strong>Add messaging</strong> - the <a href="project.html?p=lora-offgrid-messenger">off-grid
  messenger</a> shares the radio design, and a tracker that can also be asked "report now" is more useful
  than one that only speaks when it chooses.</li>
  <li><strong>Send it through public infrastructure.</strong> A LoRaWAN stack and The Things Network removes
  the need for your own base station entirely, at the cost of depending on someone else's gateways.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">What this must not be used for</span>
<p>A GPS tracker is a surveillance device. It receives silently, transmits briefly, and is easy to hide - and
those properties are exactly why the law in most countries treats it seriously.</p>
<ul>
  <li><strong>Do not place a tracker on a person, or on a vehicle or belongings you do not own,
  without their knowledge and consent.</strong> In the UK, most of the EU, and most US states this is
  variously stalking, harassment, or an offence under data protection law, and courts have treated it as
  such. It is also, separately from the law, a serious harm to do to someone.</li>
  <li><strong>"It is my partner's car" is not an exception.</strong> Covert tracking of a partner or family
  member is one of the most common uses of devices like this and one of the most damaging. If you are
  considering it, that is worth stopping and thinking about rather than building.</li>
  <li><strong>Tracking employees or a work vehicle</strong> requires - in most jurisdictions - written notice,
  a documented reason, and limits on out-of-hours monitoring. Check before, not after.</li>
  <li><strong>What this is for:</strong> your own boat, trailer, beehives, machinery, livestock, drone,
  luggage, or a vehicle you own and drive. Things, that belong to you.</li>
</ul>
<p>Build it for the asset you are worried about. Not for a person.</p>
</div>
<div class="note danger"><span class="t">Radio rules</span>
<ul>
  <li><strong>Never transmit without an antenna.</strong> It destroys the module.</li>
  <li><strong>Respect the duty cycle.</strong> 1% in the EU 868.0-868.6&nbsp;MHz sub-band. At SF9 with a
  14-byte packet that means no more often than about every 20 seconds, and the triple-send on a fence breach
  is already spaced for it.</li>
  <li><strong>Use your own region's band</strong> and power limit. 14&nbsp;dBm at 868&nbsp;MHz in Europe.</li>
</ul>
</div>
<div class="note danger"><span class="t">Lithium cells outdoors, unattended, for months</span>
<ul>
  <li><strong>Protected charger board only</strong> - the TP4056 with the DW01 chip. Load from OUT+/OUT-,
  never B+/B-.</li>
  <li><strong>Never charge a lithium cell below 0 &deg;C.</strong> It plates lithium inside the cell, causes
  permanent capacity loss, and can create an internal short that fails later. An outdoor solar tracker in a
  cold climate needs a temperature cut-off - this is the most commonly ignored rule in hobby solar work and
  the one with the worst outcome.</li>
  <li><strong>Check the JST polarity with a meter</strong> before connecting a cell. Suppliers are not
  consistent.</li>
  <li><strong>Keep the cell shaded</strong> and away from the panel. A black box in summer sun gets hot enough
  to age a LiPo quickly.</li>
  <li><strong>This will be unattended for months.</strong> Build it to a standard you are comfortable leaving
  alone on someone's property - which means a proper enclosure, strain relief on every cable, and no bare
  lithium cell anywhere.</li>
</ul>
</div>`
});
