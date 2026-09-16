/* NEO-6M + OLED: the radio receiver you already own, explained. */
AB.addProject({
slug: 'gps-bike-computer',
title: 'GPS bike computer',
cat: 'radio',
level: 2,
time: '4 hours',
solder: false,
board: 'Nano',
tags: ['gps', 'neo-6m', 'nmea', 'tinygps', 'speed', 'hdop', 'satellites', 'no soldering', 'cycling'],
blurb: 'Speed, distance, heading and a clock set from orbit, on a $20 build. Also the clearest way to understand what a GPS fix actually is and why it takes so long the first time.',

skills: ['NMEA sentences', 'GPS fixes and HDOP', 'Doppler speed', 'Haversine distance', 'SoftwareSerial', 'Signal acquisition'],

intro: `
<p>A GPS module is a radio receiver listening to transmitters 20,000&nbsp;km away that are moving at
14,000&nbsp;km/h, carrying atomic clocks, and radiating about as much power as a car headlight. By the time
that signal reaches your handlebars it is <em>below the noise floor</em> - roughly a hundred times weaker than
the background static - and the receiver digs it out by correlation, the same trick LoRa uses.</p>
<p>It then works out where it is by measuring how long each signal took to arrive, which requires knowing the
time to within a few nanoseconds, which it does not - so it solves for its own clock error as a fourth unknown
alongside latitude, longitude and altitude. That is why you need four satellites and not three.</p>
<p>All of that costs $7 and fits on a bicycle. This project builds a cycle computer around one, and along the
way makes visible the things the phone in your pocket hides: how long a cold start really takes, what HDOP
means, why altitude is so much worse than position, and why it will never work indoors.</p>`,

what: [
  'Show speed, trip distance, average speed, heading and time, updated once a second.',
  'Set the clock from orbit - no RTC, no drift, correct to the nanosecond and automatically right on the day the clocks change.',
  'Display fix quality honestly: satellite count and HDOP, so you know whether to trust the numbers.',
  'Track trip distance by accumulating the ground covered between fixes.',
  'Cycle through screens with one button, and reset the trip with a long press.',
  'Understand what your module is actually doing during the two minutes before it gets a fix.'
],

how: `
<p><strong>NMEA, which is just text.</strong> The module needs no driver and no commands. Power it up and it
starts emitting lines of comma-separated ASCII at 9600 baud, once a second, forever. You can watch them in the
Serial Monitor before writing a line of code.</p>
<p>The two that matter:</p>
<ul>
  <li><strong>$GPGGA</strong> - time, latitude, longitude, fix quality, satellites used, HDOP, altitude.</li>
  <li><strong>$GPRMC</strong> - time, date, latitude, longitude, ground speed, course, and a validity flag.</li>
</ul>
<p>Each line ends with a <code>*</code> and a checksum. TinyGPSPlus parses all of it, discards anything whose
checksum fails, and hands you typed values - but it is worth looking at the raw text once, because everything
the module knows is visible in it.</p>

<p><strong>Cold, warm and hot starts.</strong> This is the part people assume is broken.</p>
<p>To use a satellite the receiver needs its <em>ephemeris</em> - a precise description of that satellite's
orbit, which the satellite itself broadcasts, slowly, over 30 seconds, on repeat. A receiver with no stored
data has to lie there and listen.</p>
<ul>
  <li><strong>Cold start</strong> (no data at all): typically <strong>30 seconds to several minutes</strong>,
  and a bad sky view makes it far worse.</li>
  <li><strong>Warm start</strong> (stale almanac, no ephemeris): around 30 seconds.</li>
  <li><strong>Hot start</strong> (valid ephemeris, used within the last couple of hours):
  <strong>1-2 seconds</strong>.</li>
</ul>
<p>The difference is the little backup battery or supercapacitor on the module, which keeps the RTC and the
stored ephemeris alive with the main power off. <strong>On cheap NEO-6M clones that cell is very often dead
on arrival</strong>, so every start is a cold start and the module appears to take minutes every single
time. It is the most common complaint about these modules and it is a $0.50 battery, not a fault in your
code.</p>

<p><strong>HDOP, which tells you whether to believe the position.</strong> Horizontal Dilution of Precision
describes satellite <em>geometry</em>, not signal strength. Satellites spread across the whole sky give
sharply intersecting position lines; satellites clustered in one patch give lines that cross at a shallow
angle, so a small timing error becomes a large position error.</p>
<table>
  <thead><tr><th>HDOP</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td>&lt; 1</td><td>Ideal. Rare outside open country.</td></tr>
    <tr><td>1 - 2</td><td>Excellent. Trust it.</td></tr>
    <tr><td>2 - 5</td><td>Good. Normal on a road with buildings.</td></tr>
    <tr><td>5 - 10</td><td>Moderate. Position is wandering.</td></tr>
    <tr><td>&gt; 10</td><td>Poor. Do not accumulate distance from this.</td></tr>
  </tbody>
</table>
<p>Eight satellites at HDOP 1.2 is a far better fix than twelve at HDOP 6. Satellite count alone is the number
everyone displays and the less useful of the two.</p>

<p><strong>Speed is better than you expect. Altitude is worse.</strong></p>
<p>GPS speed does not come from comparing positions - it comes from the <em>Doppler shift</em> of the carrier
frequency, measured directly. It is startlingly accurate, typically better than 0.1&nbsp;m/s, and it is good
at low speed where position differencing would be dominated by noise.</p>
<p>Altitude is the opposite. Satellites are all above you and none below, so the vertical geometry is
inherently one-sided and vertical error is roughly 1.5 to 3 times the horizontal. Add the geoid model and a
GPS altitude that reads 30&nbsp;m off is behaving normally. If you want altitude, add the
<a href="project.html?p=desk-weather-station">barometric sensor</a> - it is far better at <em>changes</em> in
height, which is what a cyclist cares about.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'Plenty for this. See the tuning notes before adding an SD card - the Nano is tight on RAM once the OLED buffer is in.' },
  { id: 'gps', qty: 1, note: 'NEO-6M with the ceramic patch antenna on a lead. Check the backup battery when it arrives - see the assembly notes, because a dead one makes every start a cold start.' },
  { id: 'oled13', qty: 1, note: 'Readable on the move. An SH1106 1.3 inch is easier to read at a glance if you have one.' },
  { id: 'button', qty: 1, note: 'Screen cycling and trip reset. Something you can press with a gloved thumb.' },
  { id: 'res10k', qty: 2, note: 'Only if you want to send configuration commands to the module - a divider on its RX pin. Not needed just to read from it.' },
  { id: 'lipo2000', qty: 1, note: 'About 15 hours. The GPS is most of the draw.' },
  { id: 'tp4056', qty: 1, note: 'The protected version. USB charging.' },
  { id: 'switch', qty: 1, note: 'A real power switch, reachable without opening the case.' },
  { id: 'box-abs', qty: 1, note: 'The antenna must sit under a plastic lid facing the sky - never metal, and never under a carbon fibre anything.' },
  { id: 'zip', qty: 1, note: 'Handlebar mounting. Two zip ties and a strip of inner tube grips better than most bought mounts.' },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'dmm', own: true, note: 'Mainly for checking the module’s backup battery, which is the one measurement that saves real time here.' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',   at: [0, 48] },
    { id: 'bb',   comp: 'bb400',  at: [0, -10] },
    { id: 'gps',  comp: 'gps',    at: [-46, -58] },
    { id: 'oled', comp: 'oled13', at: [42, -58], ry: 180 },
    { id: 'btn',  comp: 'button', at: [0, -92] }
  ],
  wires: [
    { from: 'nano.5V',   to: 'bb.T+2',   color: 'red',    note: '5 V rail. The GPS module has its own regulator and is happy on 5 V' },
    { from: 'nano.GND',  to: 'bb.T-2',   color: 'black',  note: 'Ground rail' },
    { from: 'gps.VCC',   to: 'bb.T+6',   color: 'red',    note: 'GPS power. It draws ~45 mA while acquiring, which is most of this build' },
    { from: 'gps.GND',   to: 'bb.T-6',   color: 'black',  note: 'GPS ground' },
    { from: 'gps.TX',    to: 'nano.D4',  color: 'green',  note: 'GPS talks, Arduino listens. This one wire is all a read-only build needs' },
    { from: 'gps.RX',    to: 'bb.T+12',  color: 'orange', note: 'Only for configuring the module - via a divider, since its RX is 3.3 V' },
    { from: 'nano.D3',   to: 'bb.T+16',  color: 'orange', note: 'Arduino TX into the top of the divider' },
    { from: 'bb.T-16',   to: 'bb.T-12',  color: 'black',  note: 'Divider lower leg to ground' },
    { from: 'oled.VCC',  to: 'bb.T+20',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND',  to: 'bb.T-20',  color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA',  to: 'nano.A4',  color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL',  to: 'nano.A5',  color: 'yellow', note: 'I2C clock' },
    { from: 'btn.1A',    to: 'nano.D2',  color: 'purple', note: 'Mode button, internal pull-up. D2 is an interrupt pin if you want one later' },
    { from: 'btn.2A',    to: 'bb.T-26',  color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">The antenna needs to see the sky, and only the sky</span>
<p>The ceramic patch antenna is directional. Its flat face must point <strong>up</strong>, with nothing
conductive above it.</p>
<p>That means: plastic case lid only. Not metal, and not carbon fibre - carbon is conductive and a carbon
handlebar bag will block it completely. Not under a phone, not in a pannier, not flat against the frame.</p>
<p>Indoors it will almost certainly never get a fix. This is not a fault. Test outdoors, or at the very least
on a windowsill with a clear view of open sky, and give it five minutes.</p></div>

<div class="note tip"><span class="t">Reading the GPS needs exactly one signal wire</span>
<p>The module talks and never needs to be spoken to. GPS TX to Arduino D4 and you are done.</p>
<p>The RX side and its divider are only for sending configuration commands - changing the update rate, turning
off unused sentences, saving settings. Build without them first; add them if the tuning section tempts
you.</p></div>

<div class="note warn"><span class="t">D0 and D1 are the USB port - use SoftwareSerial</span>
<p>Putting the GPS on the Nano's hardware serial means it fights the bootloader on every upload and you lose
the Serial Monitor for debugging. SoftwareSerial on D4 is fine at 9600 baud.</p>
<p>It is <em>not</em> fine at 115200, and it is not fine if you later raise the GPS update rate to 10&nbsp;Hz.
Both are reasons to move to an ESP32, which has three real hardware serial ports.</p></div>

<div class="note tip"><span class="t">Check the backup battery before you build anything</span>
<p>Put a meter across the small cell or supercapacitor on the module. It should read 2.5-3&nbsp;V after the
module has been powered for a few minutes.</p>
<p>If it reads near zero, the cell is dead - very common on cheap clones - and every single start will be a
cold start taking minutes. It is a rechargeable ML1220 or a supercap and replacing it is a five-minute job
that transforms how the finished thing feels to use.</p></div>`,

solderSteps: [
  { h: 'Nothing here needs soldering',
    body: `<p>The GPS module comes with headers fitted and an antenna on a U.FL lead. The OLED has a header.
    The button goes in a breadboard. This is deliberately a plug-together build.</p>` },
  { h: 'Replacing a dead backup battery, if yours is dead',
    body: `<p>This is the one soldering job worth doing, and it is small. The cell is usually an ML1220
    rechargeable coin or a supercapacitor on the top of the board.</p>
    <p>Desolder the old one carefully - the pads are small and lift easily if you linger. Fit the replacement
    with the same polarity. Then power the module for a couple of hours to charge it, and test: get a fix,
    remove power for a minute, reapply, and time the second fix. Under five seconds means it worked.</p>
    <p>Going from a three-minute start to a three-second one is the single biggest improvement available in
    this project.</p>` },
  { h: 'When you make it permanent',
    body: `<p>Socket everything on perfboard rather than soldering modules down. Keep the GPS antenna lead
    away from the Nano's crystal and the OLED's ribbon - both radiate, and a GPS front end is by design
    extremely sensitive.</p>` }
],

assembly: [
  { h: 'Watch the raw NMEA first',
    body: `<p>Before TinyGPSPlus, before the display. Upload the passthrough sketch and watch the sentences
    arrive.</p>
    <p>Even with no fix you should see lines appearing once a second, with empty fields. That tells you the
    wiring and the baud rate are right and the rest is a matter of waiting for satellites - which is a much
    better position to be in than staring at a blank screen.</p>` },
  { h: 'Go outside and wait properly',
    body: `<p>Take it outside, put the antenna face-up with a clear view, and leave it for five minutes. Do
    not conclude anything in the first ninety seconds.</p>
    <p>Watch the fix indicator in $GPGGA go from 0 to 1, and the satellite count climb. The first time is the
    slow one; after that the backup battery should make it quick.</p>` },
  { h: 'Learn to read the sentence',
    body: `<p>Find a $GPGGA line and read it field by field against the reference in the code section. Being
    able to read one of these by eye is genuinely useful, and it makes every later problem legible.</p>
    <p>The fix quality field is the one to find: 0 is no fix, 1 is GPS, 2 is differential.</p>` },
  { h: 'Add the display and the button',
    body: `<p>OLED on A4/A5, button on D2 with the internal pull-up. Test each before combining.</p>` },
  { h: 'Run the bike computer sketch, stationary',
    body: `<p>Standing still, speed should read 0.0 and not wander much. Trip distance should stay near zero -
    if it climbs while you stand still, the position filter is not working and the tuning section covers
    why.</p>
    <p>Check the clock. It is UTC, so set <code>TZ_OFFSET</code> for your timezone.</p>` },
  { h: 'Calibrate nothing, but check against something',
    body: `<p>There is nothing to calibrate - the satellites do that. But ride a known distance, a measured
    loop or a stretch of road you can check on a map, and compare.</p>
    <p>Expect to be within about 1%. If the trip distance is consistently 5-10% high, the distance filter is
    accumulating noise while you are stopped at junctions.</p>` },
  { h: 'Mount it so the antenna faces up',
    body: `<p>On the stem or the bars, lid uppermost, with nothing over it. Two zip ties through the case and
    a strip of old inner tube underneath for grip works better than it sounds and survives potholes.</p>
    <p>Keep the USB port reachable for charging without dismantling anything.</p>` },
  { h: 'Ride with it, and watch HDOP',
    body: `<p>The interesting screen on a real ride is the status one. Watch HDOP climb under trees, in a
    cutting, or between tall buildings, and watch the speed get noisier as it does. That is the whole system
    made visible, and it is why the display shows fix quality rather than hiding it.</p>` }
],

libraries: [
  { name: 'TinyGPSPlus', by: 'Mikal Hart', why: 'Parses NMEA, validates checksums, and hands you typed values. The standard, and deservedly.' },
  { name: 'SoftwareSerial', by: 'Arduino', how: 'Built in', why: 'A second serial port on D4 so the USB console stays free. Fine at 9600 and not much above.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The display, plus Adafruit GFX. See the tuning section about its 1 KB buffer.' }
],

code: [
{
  h: 'Step 1: look at the raw sentences',
  intro: `<p>Do this first. It proves the wiring and shows you what the module actually says.</p>`,
  name: 'gps_passthrough.ino',
  code: `/* ------------------------------------------------------------------
   Raw NMEA viewer.

   A typical fixed line looks like:

   $GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47
          |      |          |          | |  |   |
          |      |          |          | |  |   +-- HDOP
          |      |          |          | |  +------ satellites used
          |      |          |          | +--------- fix: 0 none, 1 GPS, 2 DGPS
          |      |          +----------+----------- lat, lon (ddmm.mmm)
          +------------------------------------------ UTC time hhmmss

   With no fix the same line arrives with those fields empty. Seeing
   EMPTY sentences is good news: the module is alive and looking.
   ------------------------------------------------------------------ */

#include <SoftwareSerial.h>

SoftwareSerial gps(4, 3);        // RX from module TX, TX to module RX

void setup() {
  Serial.begin(115200);
  gps.begin(9600);               // NEO-6M default
  Serial.println(F("raw NMEA. Go outside."));
}

void loop() {
  while (gps.available()) Serial.write(gps.read());
  while (Serial.available()) gps.write(Serial.read());
}`,
  after: `<p><strong>Nothing at all?</strong> Check the GPS TX goes to Arduino D4 (not D3), check power, and
  check the baud rate - a few modules ship at 38400.</p>
  <p><strong>Garbage characters?</strong> Baud mismatch. Try 38400 and 4800.</p>
  <p><strong>Sentences with empty fields?</strong> Everything is working. You do not have a fix yet. Go
  outside, point the antenna at the sky, and wait five minutes without touching it.</p>`
},
{
  h: 'Step 2: the bike computer',
  intro: `<p>Four screens on one button. Distance accumulates between fixes, with the filtering that keeps a
  stationary bike from clocking up kilometres.</p>`,
  name: 'bike_computer.ino',
  code: `/* ------------------------------------------------------------------
   GPS bike computer.

   Short press  : next screen
   Long press   : reset trip

   Screens: SPEED | TRIP | CLOCK | STATUS
   ------------------------------------------------------------------ */

#include <TinyGPSPlus.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define GPS_RX_PIN   4
#define GPS_TX_PIN   3
#define BUTTON_PIN   2
#define TZ_OFFSET    1          // hours from UTC. No DST handling.

/* --- the filters that make trip distance honest ---------------------
   A stationary receiver's reported position wanders by a few metres.
   Accumulate every one of those and a bike parked overnight records
   a considerable ride. Three guards, all needed: */
#define MIN_HDOP        5.0     // ignore fixes with poor geometry
#define MIN_SPEED_KMH   1.5     // below this, treat as stopped
#define MIN_MOVE_M      2.0     // ignore steps smaller than the noise

TinyGPSPlus gps;
SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

double tripMeters = 0;
double lastLat = 0, lastLon = 0;
bool   havePrev = false;

double maxSpeed = 0;
unsigned long movingMs = 0;
unsigned long lastFixMs = 0;

uint8_t screen = 0;
const uint8_t NUM_SCREENS = 4;

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  if (!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("no OLED"));
  }
  oled.setTextColor(SSD1306_WHITE);
  oled.clearDisplay();
  oled.setCursor(0, 28);
  oled.println(F("waiting for sky..."));
  oled.display();
}

void loop() {
  feedGps();
  pollButton();

  static unsigned long lastDraw = 0;
  if (millis() - lastDraw > 250) { lastDraw = millis(); draw(); }
}

/* --- reading the module ----------------------------------------------
   SoftwareSerial has no buffer worth the name, so this must be called
   constantly. Anything that blocks for more than a few milliseconds
   loses characters, and a lost character fails a checksum and throws
   away the whole sentence. */
void feedGps() {
  while (gpsSerial.available()) {
    if (gps.encode(gpsSerial.read())) onNewSentence();
  }
}

void onNewSentence() {
  if (!gps.location.isValid() || !gps.location.isUpdated()) return;
  if (gps.hdop.isValid() && gps.hdop.hdop() > MIN_HDOP) return;

  double lat = gps.location.lat();
  double lon = gps.location.lng();
  double kmh = gps.speed.isValid() ? gps.speed.kmph() : 0;

  unsigned long now = millis();
  if (lastFixMs && kmh >= MIN_SPEED_KMH) movingMs += now - lastFixMs;
  lastFixMs = now;

  if (kmh > maxSpeed) maxSpeed = kmh;

  if (havePrev) {
    double d = TinyGPSPlus::distanceBetween(lastLat, lastLon, lat, lon);

    // Both guards, not either. The speed check catches a bike at a
    // traffic light; the distance check catches the residual jitter
    // that survives it.
    if (kmh >= MIN_SPEED_KMH && d >= MIN_MOVE_M) {
      tripMeters += d;
      lastLat = lat; lastLon = lon;
    }
  } else {
    lastLat = lat; lastLon = lon;
    havePrev = true;
  }
}

/* --- button ------------------------------------------------------------ */
void pollButton() {
  static bool wasDown = false;
  static unsigned long downAt = 0;

  bool down = !digitalRead(BUTTON_PIN);

  if (down && !wasDown) { downAt = millis(); wasDown = true; }

  if (!down && wasDown) {
    unsigned long held = millis() - downAt;
    wasDown = false;

    if (held > 1200) {
      tripMeters = 0;
      maxSpeed = 0;
      movingMs = 0;
      havePrev = false;
      screen = 1;                       // jump to the trip screen
    } else if (held > 40) {             // 40 ms of debounce
      screen = (screen + 1) % NUM_SCREENS;
    }
  }
}

/* --- display ----------------------------------------------------------- */
void draw() {
  oled.clearDisplay();

  bool fix = gps.location.isValid() && gps.satellites.isValid() &&
             gps.satellites.value() >= 4;

  if (!fix) { drawSearching(); oled.display(); return; }

  switch (screen) {
    case 0: drawSpeed();  break;
    case 1: drawTrip();   break;
    case 2: drawClock();  break;
    case 3: drawStatus(); break;
  }

  // A small satellite count in the corner on every screen, so fix
  // quality is never more than a glance away.
  oled.setTextSize(1);
  oled.setCursor(108, 0);
  oled.print(gps.satellites.value());

  oled.display();
}

void drawSearching() {
  oled.setTextSize(1);
  oled.setCursor(0, 8);
  oled.println(F("SEARCHING"));
  oled.setCursor(0, 24);
  oled.print(F("sats seen : "));
  oled.println(gps.satellites.isValid() ? gps.satellites.value() : 0);
  oled.setCursor(0, 34);
  oled.print(F("chars     : "));
  oled.println(gps.charsProcessed());

  oled.setCursor(0, 48);
  // charsProcessed staying at 0 is a wiring fault, not a sky problem.
  // Saying which is the difference between waiting and debugging.
  if (gps.charsProcessed() < 10) oled.println(F("no data - check wiring"));
  else                            oled.println(F("need clear sky, 4+ sats"));
}

void drawSpeed() {
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println(F("SPEED"));

  oled.setTextSize(3);
  oled.setCursor(0, 16);
  oled.print(gps.speed.kmph(), 1);

  oled.setTextSize(1);
  oled.setCursor(0, 46);
  oled.print(F("km/h   max "));
  oled.print(maxSpeed, 1);

  oled.setCursor(0, 56);
  oled.print(F("hdg "));
  oled.print(gps.course.isValid() ? gps.course.deg() : 0, 0);
  oled.print(F(" "));
  oled.print(gps.course.isValid() ? cardinal(gps.course.deg()) : "--");
}

void drawTrip() {
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println(F("TRIP"));

  oled.setTextSize(3);
  oled.setCursor(0, 16);
  oled.print(tripMeters / 1000.0, 2);

  oled.setTextSize(1);
  oled.setCursor(0, 46);
  oled.print(F("km    moving "));
  oled.print(movingMs / 60000);
  oled.println(F("m"));

  oled.setCursor(0, 56);
  oled.print(F("avg "));
  // Average over MOVING time, not elapsed - otherwise a coffee stop
  // halves your average and the number stops meaning anything.
  double hrs = movingMs / 3600000.0;
  oled.print(hrs > 0.001 ? (tripMeters / 1000.0) / hrs : 0.0, 1);
  oled.print(F(" km/h   (hold=reset)"));
}

void drawClock() {
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println(F("TIME"));

  int h = (gps.time.hour() + TZ_OFFSET + 24) % 24;

  oled.setTextSize(3);
  oled.setCursor(0, 16);
  if (h < 10) oled.print('0');
  oled.print(h); oled.print(':');
  if (gps.time.minute() < 10) oled.print('0');
  oled.print(gps.time.minute());

  oled.setTextSize(1);
  oled.setCursor(0, 46);
  oled.print(gps.date.day()); oled.print('/');
  oled.print(gps.date.month()); oled.print('/');
  oled.println(gps.date.year());

  oled.setCursor(0, 56);
  oled.print(F("set from orbit, UTC+"));
  oled.print(TZ_OFFSET);
}

void drawStatus() {
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println(F("STATUS"));

  oled.setCursor(0, 12);
  oled.print(F("sats  "));
  oled.println(gps.satellites.value());

  oled.setCursor(0, 22);
  oled.print(F("hdop  "));
  double h = gps.hdop.isValid() ? gps.hdop.hdop() : 99;
  oled.print(h, 1);
  oled.print(F("  "));
  // The verdict matters more than the number to most readers.
  if      (h < 2)  oled.println(F("excellent"));
  else if (h < 5)  oled.println(F("good"));
  else if (h < 10) oled.println(F("moderate"));
  else             oled.println(F("poor"));

  oled.setCursor(0, 32);
  oled.print(F("alt   "));
  oled.print(gps.altitude.isValid() ? gps.altitude.meters() : 0, 0);
  oled.println(F(" m (+/-30)"));

  oled.setCursor(0, 42);
  oled.print(gps.location.lat(), 5);
  oled.setCursor(0, 52);
  oled.print(gps.location.lng(), 5);

  oled.setCursor(74, 52);
  oled.print(F("fail "));
  oled.print(gps.failedChecksum());
}

const char *cardinal(double deg) {
  const char *dirs[] = { "N", "NE", "E", "SE", "S", "SW", "W", "NW" };
  return dirs[(int)((deg + 22.5) / 45.0) % 8];
}`,
  after: `<p>The three distance filters are the part worth understanding, because without them the project
  produces confidently wrong numbers.</p>
  <p>A stationary GPS reports a position that wanders by a few metres as the satellite geometry shifts. Add
  every one of those steps and a bike locked up overnight records fifteen kilometres. The speed check handles
  being stopped at lights; the minimum-distance check catches the jitter that survives it; the HDOP check
  throws away fixes taken under a bridge. All three, not one.</p>
  <p><code>gps.failedChecksum()</code> on the status screen is a quietly useful diagnostic. A count that
  climbs steadily means characters are being dropped - almost always SoftwareSerial losing bytes while
  something else blocks.</p>`
}],

upload: `
<p>Ordinary Nano. Serial Monitor at <strong>115200</strong> for the sketch's own output; the GPS itself runs
at 9600 on the software port.</p>
<div class="note warn"><span class="t">Test outdoors. This is not optional.</span>
<p>GPS signals are around -130&nbsp;dBm at the antenna - below the noise floor. A roof, and often a window
frame, is enough to stop a fix entirely.</p>
<p>Take it outside, lay it face-up, and leave it alone for five minutes on the first run. Judging the build
from a desk indoors will tell you only that you are indoors.</p></div>
<div class="note tip"><span class="t">The status screen tells you which problem you have</span>
<p><code>chars</code> climbing with no fix means the wiring is right and you need sky. <code>chars</code>
stuck at 0 means the module is not talking - wiring or baud rate. Two very different problems that look
identical without that number.</p></div>`,

tune: [
  { h: 'Replace the backup battery - the biggest single improvement',
    body: `<p>Measure the cell on the module after it has been powered for a while. If it reads under about
    2&nbsp;V it is dead, and every start is a cold start.</p>
    <p>A fresh ML1220 takes it from two or three minutes to two or three seconds. On a device you switch on at
    the start of a ride, that is the difference between useful and irritating - and it costs $0.50.</p>` },
  { h: 'Turn off the sentences you do not use',
    body: `<p>By default the module sends GGA, GSA, GSV, RMC, VTG and GLL every second. GSV alone can be four
    lines listing every satellite in view, and at 9600 baud into SoftwareSerial that is a lot of characters to
    not drop.</p>
    <p>Disabling everything except GGA and RMC with UBX configuration commands roughly halves the character
    load and noticeably reduces failed checksums. This is what the RX divider is for.</p>` },
  { h: 'Raising the update rate, and why you probably should not on a Nano',
    body: `<p>The NEO-6M will do 5&nbsp;Hz. But five times the sentences at 9600 baud through SoftwareSerial
    will drop characters, and every dropped character fails a checksum and discards a whole sentence.</p>
    <p>If you want a faster rate: trim the sentences first, then raise the module's baud to 38400, and
    realistically move to an ESP32 with hardware serial. At 1&nbsp;Hz on a bicycle you are fine as built.</p>` },
  { h: 'Logging, and the RAM problem',
    body: `<p>An SD card is the obvious addition and the Nano makes it awkward: the SSD1306 library keeps a
    full 1&nbsp;KB framebuffer, the SD library wants about 0.5&nbsp;KB of its own, and the ATmega328P has
    2&nbsp;KB total. Add TinyGPSPlus and SoftwareSerial buffers and you are out.</p>
    <p>Three ways out, in increasing order of sense: switch to U8g2 in page mode (draws in strips, uses about
    128 bytes); drop the display while logging; or use an ESP32, which has 320&nbsp;KB and hardware serial and
    costs a dollar more.</p>
    <p>Write GPX or plain CSV, open one file per ride, and <code>flush()</code> after each line - a card
    yanked mid-write loses whatever is still buffered.</p>` },
  { h: 'Better altitude, with a $4 sensor',
    body: `<p>GPS altitude is poor. A BMP280 or BME280 measures pressure, and pressure tracks height change
    very well over short periods - good to about a metre, where GPS is good to thirty.</p>
    <p>Use the GPS altitude once to set the reference, then accumulate climb from the barometer. That is
    exactly how bike computers that report "total ascent" do it, and it is why they have a hole in the
    case.</p>` },
  { h: 'Power, and the GPS is most of it',
    body: `<p>The module is 45&nbsp;mA while acquiring and around 35&nbsp;mA tracking - far more than the
    Nano. 2000&nbsp;mAh gives roughly 15 hours.</p>
    <p>For longer, there is no clever trick: the receiver has to keep listening to keep a fix, and power
    cycling it means a new acquisition each time. The honest answer is a bigger battery, or accepting that
    this is a day-ride device.</p>` }
],

trouble: [
  { q: 'No characters at all - <code>chars</code> stays at 0',
    a: `Wiring or baud. GPS TX must go to Arduino D4, not D3 - two transmitters wired together produce
    silence. Check power at the module, and try 38400 and 4800 in case yours is not a 9600 default.` },
  { q: 'Sentences arrive but never a fix',
    a: `Sky. Go outside, antenna face-up, nothing above it, five minutes untouched. A window is often not
    enough, and a metal or carbon case is definitely not. If the module has a dead backup battery this takes
    minutes every single time.` },
  { q: 'It takes three minutes to get a fix, every time',
    a: `Dead backup battery, almost certainly. Measure it: healthy is 2.5-3&nbsp;V. That cell stores the
    ephemeris between sessions and without it every start is cold.` },
  { q: 'Trip distance climbs while the bike is parked',
    a: `The filters are not doing their job. Check all three are present - HDOP, minimum speed and minimum
    move. Raise <code>MIN_SPEED_KMH</code> to 2.5 and <code>MIN_MOVE_M</code> to 3 if it persists; noisy
    urban environments need more filtering than open road.` },
  { q: '<code>failedChecksum()</code> climbs steadily',
    a: `Characters are being dropped because something blocks between calls to <code>feedGps()</code>. The
    OLED update is the usual culprit. Draw less often, or trim the NMEA sentences so there are fewer
    characters to lose.` },
  { q: 'Speed reads 2-3 km/h while standing still',
    a: `Poor HDOP. Check the status screen - under trees or between buildings the geometry degrades and the
    Doppler solution gets noisy. In open sky it should sit at 0.0 rock steady. If it does not even there, the
    antenna is obstructed.` },
  { q: 'The clock is an hour out twice a year',
    a: `Working as designed. GPS time is UTC and this sketch applies a fixed offset with no daylight saving
    handling. Proper DST needs a rules table for your region - or just change <code>TZ_OFFSET</code> twice a
    year, which is what most builds do.` },
  { q: 'Altitude is 30 m wrong',
    a: `Normal. Vertical geometry is one-sided because all the satellites are above you, so vertical error is
    roughly twice horizontal, plus geoid model differences. Add a barometric sensor if altitude matters.` },
  { q: 'It worked yesterday and today it will not fix',
    a: `Check the antenna connector - the U.FL lead is fragile and works loose. Then check the sky: heavy
    tree cover in leaf, a new building, or simply a different parking spot all matter more than they seem.` }
],

next: `
<ul>
  <li><strong>Send the position somewhere.</strong> The
  <a href="project.html?p=gps-lora-tracker">LoRa GPS tracker</a> takes these coordinates and transmits them
  kilometres, and deals with the privacy questions that come with doing so.</li>
  <li><strong>Log the ride.</strong> An SD card and GPX output makes it a real cycle computer - read the RAM
  note in the tuning section first.</li>
  <li><strong>Add real altitude</strong> with the barometric sensor from the
  <a href="project.html?p=desk-weather-station">weather station</a>.</li>
  <li><strong>Add a light that knows when you stop.</strong> The
  <a href="project.html?p=smart-bike-light">smart bike light</a> shares the battery and the handlebar, and
  GPS speed is a far better brake-detection signal than an accelerometer.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">It goes on a bicycle, so the mounting is the safety issue</span>
<ul>
  <li><strong>Nothing may enter the steering or the wheels.</strong> Route and secure every cable. A lead
  into a front wheel at speed is the realistic hazard here and it is a serious one.</li>
  <li><strong>Do not look at it while riding.</strong> Same rule as a phone. Configure it before you set off,
  and glance at it the way you would a speedometer - or not at all in traffic.</li>
  <li><strong>Protect the LiPo.</strong> A pouch cell on a bicycle takes vibration, impacts and weather. It
  needs a rigid case, not a cable tie. Crushed or punctured lithium cells catch fire.</li>
  <li><strong>Never charge a lithium cell below 0 &deg;C.</strong> A unit that has been out in winter should
  warm up indoors before it goes on the charger.</li>
  <li><strong>Waterproof it or take it off.</strong> The case needs to keep rain out, and the antenna must
  still see the sky through plastic. If in doubt, take it inside.</li>
</ul>
</div>
<div class="note tip"><span class="t">Receiving is invisible</span>
<p>Unlike everything else in this theme, a GPS module only listens. It transmits nothing, so there is no duty
cycle, no band allocation and no licensing question at all. It is also, for the same reason, completely
undetectable - which is a point the <a href="project.html?p=gps-lora-tracker">tracker project</a> takes
seriously.</p></div>`
});
