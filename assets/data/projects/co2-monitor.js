/* SCD40 true CO2 monitor with a traffic-light verdict and a trend chart. */
AB.addProject({
slug: 'co2-monitor',
title: 'CO2 and ventilation monitor',
cat: 'environment',
level: 2,
time: '2 hours',
solder: false,
board: 'Nano',
tags: ['scd40', 'co2', 'ndir', 'oled', 'ventilation', 'no soldering', 'air quality'],
blurb: 'Real CO2 in parts per million, not a guess. Tells you when to open a window, and will change how you think about meeting rooms.',

skills: ['NDIR sensing', 'I2C', 'Calibration', 'Rolling charts', 'Thresholds that mean something'],

intro: `
<p>CO2 is the best single proxy for how stale a room is, because people are the main source of it indoors. If
the CO2 is low, the air you are breathing is mostly fresh; if it is high, you are re-breathing what everyone
else has already used - along with whatever else they exhaled.</p>
<p>Outdoor air is around 420&nbsp;ppm. A closed bedroom with two people reaches 2,500 by morning. A meeting
room with six people and the door shut passes 1,500 within half an hour, which is the level where measurable
cognitive effects start showing up in studies. Almost nobody believes any of this until they watch the number
climb.</p>`,

what: [
  'Show CO2 in ppm, plus temperature and humidity, updated every five seconds.',
  'Give a plain-English verdict with a traffic-light band, against the levels that actually matter.',
  'Draw a rolling chart of the last two hours so you can see a room filling up and a window working.',
  'Beep once when it crosses 1,400 ppm, and not again until it has come back down.',
  'Calibrate itself properly, which matters more on this sensor than on anything else in the book.'
],

how: `
<p>The <strong>SCD40</strong> is a true NDIR sensor - nondispersive infrared. CO2 molecules absorb infrared
light at a specific wavelength, so the sensor shines an IR source down a small chamber, measures how much
arrives at the far end, and works out the concentration from the shortfall. It is measuring CO2 itself, not
inferring it.</p>
<p>That is worth stressing, because most cheap "CO2" sensors are not. An MQ-135 measures total volatile
compounds and a chip guesses a CO2-equivalent number from it - which tracks nicely when someone sprays
deodorant and not at all when a room slowly fills with people. Anything under about $12 claiming ppm is doing
this. The SCD40 costs more because the physics costs more.</p>
<p>It talks I2C at address <code>0x62</code> and takes a measurement every five seconds, which is as fast as
it can heat and read its chamber. It also reports temperature and humidity, because it needs both to correct
its own readings.</p>
<p><strong>Self-calibration</strong> is the part people get wrong. The SCD40 has an automatic mode that assumes
it sees genuinely fresh air - 400&nbsp;ppm - at some point in every week, and quietly re-zeroes itself to that
minimum. In a room that is ventilated daily, that is exactly right. In a sensor that lives permanently in a
stuffy office, it is badly wrong, because it will decide that 900&nbsp;ppm <em>is</em> fresh air and subtract
500 from everything forever.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'An ESP32 is the better choice if you want it on the network - the code is nearly identical.' },
  { id: 'scd40', qty: 1, note: 'True NDIR. This is most of the cost of the project and there is no cheap substitute that works.' },
  { id: 'oled13b', qty: 1, note: 'The 1.3 inch SH1106 is easier to read across a room. The 0.96 inch SSD1306 works with one line changed.' },
  { id: 'buzzer', qty: 1, note: 'Optional. One beep at the threshold is useful; a continuous alarm is not.' },
  { id: 'button', qty: 1, note: 'Silences the beep and triggers a manual calibration.' },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'psu5v3a', qty: 1, own: true, note: 'Any USB charger. It draws about 50 mA average.' },
  { id: 'box-abs', qty: 1, note: 'Needs generous ventilation holes on at least two sides - see the notes.' }
],

tools: [],

build: {
  parts: [
    { id: 'nano', comp: 'nano',    at: [0, 40] },
    { id: 'bb',   comp: 'bb400',   at: [0, -28] },
    { id: 'co2',  comp: 'scd40',   at: [-46, -92], ry: 180 },
    { id: 'oled', comp: 'oled13b', at: [6, -96], ry: 180 },
    { id: 'btn',  comp: 'button',  at: [48, -88] },
    { id: 'buz',  comp: 'buzzer',  at: [72, -86] }
  ],
  wires: [
    { from: 'nano.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V onto the lower red rail' },
    { from: 'nano.GND',  to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+8',    to: 'bb.T+8',  color: 'red',    note: 'Bridge the two red rails' },
    { from: 'bb.B-8',    to: 'bb.T-8',  color: 'black',  note: 'Bridge the two blue rails' },
    { from: 'co2.VIN',   to: 'bb.T+3',  color: 'red',    note: 'Sensor power. The breakout has a regulator, so 5 V is fine' },
    { from: 'co2.GND',   to: 'bb.T-3',  color: 'black',  note: 'Sensor ground' },
    { from: 'co2.SDA',   to: 'nano.A4', color: 'blue',   note: 'I2C data. Fixed to A4 on a Nano' },
    { from: 'co2.SCL',   to: 'nano.A5', color: 'green',  note: 'I2C clock. Fixed to A5' },
    { from: 'oled.VCC',  to: 'bb.T+14', color: 'red',    note: 'Screen power' },
    { from: 'oled.GND',  to: 'bb.T-14', color: 'black',  note: 'Screen ground' },
    { from: 'oled.SDA',  to: 'nano.A4', color: 'blue',   note: 'Same two I2C wires - that is the point of a bus' },
    { from: 'oled.SCL',  to: 'nano.A5', color: 'green',  note: 'Same two I2C wires' },
    { from: 'btn.1A',    to: 'nano.D3', color: 'yellow', note: 'Button, internal pull-up' },
    { from: 'btn.2A',    to: 'bb.T-20', color: 'black',  note: 'Button to ground' },
    { from: 'buz.+',     to: 'nano.D8', color: 'orange', note: 'Buzzer' },
    { from: 'buz.-',     to: 'bb.T-24', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireIntro: `<p>Sixteen connections and no soldering. The sensor and the screen share the same two I2C wires,
which is exactly what I2C is for - they have different addresses (0x62 and 0x3C) so they never collide.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Airflow is part of the wiring</span>
<p>An NDIR sensor measures the air actually inside its chamber, and that air gets in by diffusion alone - there
is no fan. Seal it in a box and it will faithfully report the CO2 level inside that box, which lags the room by
half an hour and never quite catches up.</p>
<p>Drill generous holes on at least two opposite faces so air can move through rather than just sit. Do not
mount the sensor at the bottom of a deep enclosure.</p></div>

<div class="note danger"><span class="t">Do not breathe on it</span>
<p>Exhaled breath is about 40,000&nbsp;ppm - a hundred times a stuffy room. Breathing on the sensor pins it to
its 40,000 maximum and it then takes ten minutes to recover. Everyone does it once to see what happens; just
know that the next ten minutes of readings are worthless.</p>
<p>Keep it away from where people's faces are, too. A monitor on a desk 30&nbsp;cm from someone's mouth reads
their breath, not the room.</p></div>

<div class="note tip"><span class="t">Two devices, one bus, no conflict</span>
<p>The SCD40 is at 0x62 and the OLED at 0x3C. Both sit on A4 and A5 and the Nano addresses each in turn. If
either goes missing, run an I2C scanner first - it is the fastest way to tell "not wired" from "wired but
misbehaving".</p></div>`,

solderIntro: `<p>No soldering to build it. For a permanent wall-mounted version, these are the joints.</p>`,

solderSteps: [
  { h: 'Sockets for all three modules',
    body: `<p>Two 15-pin strips for the Nano, a 4-pin for the sensor, a 4-pin for the screen. The sensor
    especially - it is the expensive part and you will want to move it to a later project.</p>
    <p>Tack the end pin of each strip, check square from the side, then complete. Three seconds a joint at
    340&nbsp;&deg;C.</p>` },
  { h: 'Put the sensor on flying leads, outside the box',
    body: `<p>This is the one build where that is worth doing. Four wires of 150&nbsp;mm, twisted, with the
    sensor mounted in open air on the outside of the enclosure or right behind a large vent.</p>
    <p>Everything else can be sealed away; the sensor cannot.</p>` },
  { h: 'Screen on flying leads too',
    body: `<p>Four wires to the lid, so the display sits behind its window and the board sits behind that.</p>` },
  { h: 'Buzzer and button',
    body: `<p>Buzzer's marked leg to D8. Button to D3 and ground on diagonal legs.</p>` },
  { h: 'Sleeve and check',
    body: `<p>Heat-shrink over each joint, slid on before soldering. Then continuity: 5&nbsp;V to ground must be
    silent.</p>` }
],

assembly: [
  { h: 'Run an I2C scanner first',
    body: `<p>You should see <code>0x3C</code> (the screen) and <code>0x62</code> (the sensor). If 0x62 is
    missing, nothing else in this project will work, and no amount of sketch-fiddling will help.</p>
    <p>The scanner sketch is in the <a href="project.html?p=desk-weather-station">desk weather station</a>.</p>` },
  { h: 'Let it warm up before judging anything',
    body: `<p>The first reading arrives about five seconds after power-up, but an SCD40 needs a couple of
    minutes to settle and is not at its rated accuracy for the first hour. Do not conclude it is broken because
    the first number looks odd.</p>` },
  { h: 'Do the outdoor calibration',
    body: `<p>Covered in detail below. It takes three minutes and it is the difference between a monitor you can
    trust and a random number generator with good graphics.</p>` },
  { h: 'Put it where the people are',
    body: `<p>At roughly head height, in the part of the room that gets used, away from windows and doors and
    away from anyone's face. A monitor in a corner by an open window reports the corner by the open window.</p>` },
  { h: 'Watch it for a day',
    body: `<p>Then watch what opening a window does. The speed of the drop tells you more about your
    ventilation than any number does.</p>` }
],

libraries: [
  { name: 'Sensirion I2C SCD4x', by: 'Sensirion', why: 'The official driver for the SCD40 and SCD41. Search "Sensirion SCD4x" in the Library Manager.' },
  { name: 'Sensirion Core', by: 'Sensirion', why: 'Dependency of the above - the IDE will offer to install it.' },
  { name: 'Adafruit SH110X', by: 'Adafruit', why: 'The 1.3 inch SH1106 screen. Use Adafruit SSD1306 instead for the 0.96 inch one.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Drawing.' }
],

code: [{
  name: 'co2_monitor.ino',
  code: `/* ------------------------------------------------------------------
   CO2 and ventilation monitor
   SCD40 at 0x62 and SH1106 OLED at 0x3C, both on I2C.
   Button on D3, buzzer on D8.

   For a 0.96" SSD1306 instead: swap the two includes and the display
   object for Adafruit_SSD1306, and change display.begin() to
   display.begin(SSD1306_SWITCHCAPVCC, 0x3C).
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <SensirionI2CScd4x.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// ---- settings --------------------------------------------------------
#define BUTTON_PIN  3
#define BUZZER      8
#define OLED_ADDR   0x3C

const uint16_t ALERT_PPM   = 1400;    // beep once above this
const uint16_t CLEAR_PPM   = 1100;    // and not again until it drops below
const float    ALTITUDE_M  = 0;       // your height above sea level
const bool     AUTO_CALIBRATE = true; // see the calibration section
#define HISTORY 120                   // samples for the chart, one per 5 s
// ----------------------------------------------------------------------

SensirionI2CScd4x scd4x;
Adafruit_SH1106G display = Adafruit_SH1106G(128, 64, &Wire, -1);

uint16_t co2 = 0;
float tempC = 0, humid = 0;
uint16_t hist[HISTORY];
uint8_t histCount = 0;
bool alerted = false;
bool haveReading = false;
unsigned long lastRead = 0, lastHist = 0;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);

  Wire.begin();

  display.begin(OLED_ADDR, true);
  display.setTextColor(SH110X_WHITE);
  display.clearDisplay();
  display.setCursor(14, 28);
  display.print(F("warming up..."));
  display.display();

  scd4x.begin(Wire);

  // The sensor may already be measuring from a previous run. Stop it
  // before changing any settings, or the commands are ignored.
  scd4x.stopPeriodicMeasurement();
  delay(500);

  uint16_t err;
  char msg[64];

  err = scd4x.setSensorAltitude((uint16_t)ALTITUDE_M);
  if (err) { errorToSerial(F("setSensorAltitude"), err); }

  err = scd4x.setAutomaticSelfCalibration(AUTO_CALIBRATE ? 1 : 0);
  if (err) { errorToSerial(F("setAutomaticSelfCalibration"), err); }

  err = scd4x.startPeriodicMeasurement();
  if (err) {
    errorToSerial(F("startPeriodicMeasurement"), err);
    display.clearDisplay();
    display.setCursor(4, 28);
    display.print(F("no SCD40 at 0x62"));
    display.display();
    for (;;) { }
  }

  Serial.println(F("ppm,tempC,rh"));
  (void)msg;
}

void loop() {
  handleButton();

  // The sensor produces a new value every five seconds and not faster.
  if (millis() - lastRead > 1000) {
    lastRead = millis();
    readSensor();
  }

  if (haveReading && millis() - lastHist > 5000) {
    lastHist = millis();
    pushHistory(co2);
  }

  draw();
  delay(40);
}

/* --- the sensor ------------------------------------------------------- */
void readSensor() {
  bool ready = false;
  uint16_t err = scd4x.getDataReadyFlag(ready);
  if (err || !ready) return;

  uint16_t c;
  float t, h;
  err = scd4x.readMeasurement(c, t, h);
  if (err) { errorToSerial(F("readMeasurement"), err); return; }
  if (c == 0) return;                 // sensor not settled yet

  co2 = c;
  tempC = t;
  humid = h;
  haveReading = true;

  Serial.print(co2);   Serial.print(',');
  Serial.print(tempC, 1); Serial.print(',');
  Serial.println(humid, 0);

  checkAlert();
}

/* Beep once on the way up, and re-arm only after it has properly
   cleared. Hysteresis again - without it, a reading hovering at the
   threshold beeps every five seconds all afternoon. */
void checkAlert() {
  if (!alerted && co2 >= ALERT_PPM) {
    alerted = true;
    for (int i = 0; i < 3; i++) { tone(BUZZER, 2200, 110); delay(180); }
    Serial.println(F("# open a window"));
  }
  if (alerted && co2 <= CLEAR_PPM) {
    alerted = false;
  }
}

void pushHistory(uint16_t v) {
  if (histCount < HISTORY) {
    hist[histCount++] = v;
  } else {
    memmove(hist, hist + 1, (HISTORY - 1) * sizeof(uint16_t));
    hist[HISTORY - 1] = v;
  }
}

/* --- what the number means --------------------------------------------
   Outdoor air is about 420 ppm. These bands are the ones used in
   ventilation guidance, not invented for this project. */
const __FlashStringHelper* verdict(uint16_t ppm) {
  if (ppm < 600)  return F("FRESH");
  if (ppm < 900)  return F("FINE");
  if (ppm < 1200) return F("STUFFY");
  if (ppm < 1600) return F("OPEN A WINDOW");
  if (ppm < 2500) return F("BAD - VENTILATE");
  return F("VERY BAD");
}

/* --- the screen ------------------------------------------------------- */
void draw() {
  display.clearDisplay();

  if (!haveReading) {
    display.setTextSize(1);
    display.setCursor(14, 28);
    display.print(F("warming up..."));
    display.display();
    return;
  }

  // the number, large
  display.setTextSize(3);
  display.setCursor(0, 0);
  display.print(co2);
  display.setTextSize(1);
  display.print(F("ppm"));

  display.setCursor(0, 26);
  display.print(verdict(co2));

  // temperature and humidity, small, on the right
  display.setTextSize(1);
  display.setCursor(92, 2);
  display.print(tempC, 1);
  display.print(F("C"));
  display.setCursor(92, 13);
  display.print(humid, 0);
  display.print(F("%"));

  drawChart(0, 38, 128, 26);
  display.display();
}

void drawChart(int x, int y, int w, int h) {
  display.drawFastHLine(x, y + h, w, SH110X_WHITE);

  // a dotted reference line at the alert level
  int alertY = y + h - map(min((int)ALERT_PPM, 2000), 400, 2000, 0, h);
  for (int i = x; i < x + w; i += 4) display.drawPixel(i, alertY, SH110X_WHITE);

  if (histCount < 2) return;

  for (uint8_t i = 1; i < histCount; i++) {
    int x0 = x + (i - 1) * w / HISTORY;
    int x1 = x + i * w / HISTORY;
    int y0 = y + h - map(constrain((int)hist[i - 1], 400, 2000), 400, 2000, 0, h);
    int y1 = y + h - map(constrain((int)hist[i],     400, 2000), 400, 2000, 0, h);
    display.drawLine(x0, y0, x1, y1, SH110X_WHITE);
  }
}

/* --- button: short press silences, long press calibrates -------------- */
void handleButton() {
  if (digitalRead(BUTTON_PIN) != LOW) return;
  unsigned long start = millis();
  while (digitalRead(BUTTON_PIN) == LOW) {
    if (millis() - start > 5000) { forceCalibration(); return; }
  }
  alerted = true;            // treat a short press as "yes, I know"
  noTone(BUZZER);
}

/* Manual calibration. ONLY do this outdoors, after 3+ minutes of
   stable readings in genuinely fresh air. */
void forceCalibration() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(2, 20);
  display.print(F("calibrating to 420ppm"));
  display.setCursor(2, 34);
  display.print(F("ONLY valid outdoors"));
  display.display();

  scd4x.stopPeriodicMeasurement();
  delay(500);

  uint16_t correction;
  uint16_t err = scd4x.performForcedRecalibration(420, correction);
  if (err) {
    errorToSerial(F("forcedRecalibration"), err);
  } else {
    Serial.print(F("# calibrated, correction was "));
    Serial.println((int)correction - 32768);
  }

  scd4x.startPeriodicMeasurement();
  haveReading = false;
  histCount = 0;
  tone(BUZZER, 1800, 300);
  delay(1500);
}

void errorToSerial(const __FlashStringHelper* what, uint16_t err) {
  char buf[64];
  Serial.print(what);
  Serial.print(F(": "));
  errorToString(err, buf, sizeof(buf));
  Serial.println(buf);
}`,
  after: `<p>Note <code>stopPeriodicMeasurement()</code> before changing any setting. The SCD40 silently ignores
  configuration commands while it is measuring, so a sketch that sets the altitude without stopping first
  appears to work and does nothing at all. It is the single most common SCD40 support question.</p>`
}],

upload: `
<p>Nano, correct port. The screen shows <em>warming up...</em> and the first real number appears within about
ten seconds.</p>
<p>Serial Monitor at 115200 prints <code>ppm,tempC,rh</code> - paste that into a spreadsheet and you have a
day's chart.</p>
<div class="note tip"><span class="t">Sanity check it immediately</span>
<p>Take it outside. It should settle to somewhere around 400-450&nbsp;ppm within a few minutes. If it reads
900&nbsp;ppm outdoors, it needs calibrating - which is the next section, and it is the most important part of
this project.</p></div>`,

tune: [
  { h: 'Calibrate outdoors - this is the important one',
    body: `<p>Take the whole thing outside, away from traffic, people and buildings. Let it run for at least
    three minutes until the reading is stable. Then hold the button for five seconds.</p>
    <p>It forces the current reading to be 420&nbsp;ppm and prints the correction it applied. A correction of a
    few tens of ppm is normal; several hundred means it badly needed doing.</p>
    <p>Do not do this indoors. Calibrating to 420 in a room that is really at 800 makes every future reading
    380&nbsp;ppm too low, permanently, and it will look entirely plausible.</p>` },
  { h: 'Decide about automatic self-calibration',
    body: `<p><code>AUTO_CALIBRATE</code> makes the sensor assume the lowest reading it has seen over the past
    week is fresh air at 400&nbsp;ppm, and re-zero to that.</p>
    <p><strong>Leave it on</strong> for a room that gets properly aired at least weekly - a normal home. It
    keeps the sensor honest for years with no effort.</p>
    <p><strong>Turn it off</strong> for a room that is never fully ventilated - a cellar, a permanently occupied
    office, a greenhouse - and calibrate manually outdoors every six months instead. Left on in such a room, it
    will slowly convince itself that stale air is fresh.</p>` },
  { h: 'Set your altitude',
    body: `<p><code>ALTITUDE_M</code>, in metres. Air pressure affects an NDIR reading by roughly 2&nbsp;% per
    100&nbsp;m, so at 500&nbsp;m this is a 10&nbsp;% error if you leave it at zero. It only needs setting
    once.</p>` },
  { h: 'What the numbers mean',
    body: `<p>Outdoor air is 420&nbsp;ppm and rising a couple of ppm a year. Under 800 in a room is good.
    Over 1,000 is the level most ventilation standards target as a maximum. Over 1,500 is where studies start
    finding measurable effects on concentration and decision-making. Over 2,500 and people report headaches
    and drowsiness.</p>
    <p>Bedrooms with the door shut routinely hit 2,000-3,000 by morning, which surprises almost everyone.</p>` },
  { h: 'Temperature reads high',
    body: `<p>The SCD40 has a small heater inside it and sits next to your electronics, so it typically reads
    1-2&nbsp;degrees above the room. The library has a temperature offset setting
    (<code>setTemperatureOffset</code>) - measure against a thermometer you trust and set the difference.</p>` }
],

trouble: [
  { q: 'Screen says "no SCD40 at 0x62"',
    a: `Run an I2C scanner. If the sensor does not appear at all, check it has power and that SDA and SCL are
    not swapped. If it appears but commands fail, you may be on a board that needs slower I2C - add
    <code>Wire.setClock(50000);</code> after <code>Wire.begin()</code>.` },
  { q: 'Reads 0 forever',
    a: `The sensor is not ready. <code>readMeasurement</code> returns 0 until its first conversion completes,
    which takes about five seconds, and the sketch skips zeros deliberately. If it persists past a minute,
    <code>startPeriodicMeasurement()</code> is failing - check the Serial Monitor for the error.` },
  { q: 'Reads 40,000 and will not come down',
    a: `Somebody breathed on it. Give it ten minutes in moving air. If it is genuinely stuck at maximum after
    that, something in the room is producing CO2 - a gas appliance, dry ice, fermentation.` },
  { q: 'Reads 900 ppm outdoors',
    a: `It needs the forced calibration. That is exactly what the five-second button hold is for, and doing it
    outdoors is the whole point.` },
  { q: 'Reads lower than it should indoors',
    a: `Automatic self-calibration has been running in a room that never gets fresh air, so it has re-zeroed to
    a stale baseline. Turn <code>AUTO_CALIBRATE</code> off and recalibrate outdoors.` },
  { q: 'Number barely moves when the room fills up',
    a: `Airflow. The sensor is in a sealed box, or in a dead corner. It needs air to reach it by diffusion.` },
  { q: 'Screen is blank but the Serial Monitor works',
    a: `Wrong display library or address. The 1.3 inch panel is usually SH1106, the 0.96 inch is SSD1306, and
    they are not interchangeable - an SSD1306 driver on an SH1106 gives a scrambled or offset image rather than
    a blank one, so a truly blank screen is more likely the address.` },
  { q: 'Beeps constantly',
    a: `The hysteresis should prevent that. Check <code>CLEAR_PPM</code> is comfortably below
    <code>ALERT_PPM</code> - at least 200&nbsp;ppm apart.` }
],

next: `
<ul>
  <li><strong>Put it on the network.</strong> An ESP32 and twenty lines of MQTT and Home Assistant will chart
  every room - see the <a href="project.html?p=smart-plug-relay">Wi-Fi switch</a> for that half.</li>
  <li><strong>Make it act.</strong> Drive a bathroom-style extractor fan through a relay above 1,200&nbsp;ppm.
  The <a href="project.html?p=fan-thermostat">fan thermostat</a> is the same idea with a different input.</li>
  <li><strong>Add particulates</strong> with a PMS5003 and you have the full picture - see the
  <a href="project.html?p=air-quality-monitor">air quality monitor</a>. CO2 tells you about ventilation;
  PM2.5 tells you about cooking and outdoor air. They are different questions.</li>
  <li><strong>Log a school term or a winter</strong> to an SD card. The weekly and daily rhythms are
  striking, and the data is genuinely persuasive when you want a window opened.</li>
</ul>`
});
