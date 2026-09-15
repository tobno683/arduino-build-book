/* Capacitive soil sensor + relay + submersible pump. */
AB.addProject({
slug: 'automatic-plant-waterer',
title: 'Automatic plant waterer',
cat: 'smart-home',
level: 2,
time: '2 hours',
solder: true,
board: 'Nano',
tags: ['soil moisture', 'pump', 'relay', 'oled', 'plants', 'nano'],
blurb: 'Reads the soil, runs a little pump for a few seconds when it gets dry, then waits. Will not flood your plant, because it is written not to.',

skills: ['Capacitive sensing', 'Calibration', 'Pump control', 'Safety interlocks', 'Hysteresis'],

intro: `
<p>Every version of this project online has the same bug: it checks the soil, waters, checks again a second
later, sees the water has not soaked in yet, and waters again. The plant drowns, the pot overflows, and the
build gets quietly unplugged.</p>
<p>This one has three interlocks against that - a settle time after every dose, a maximum number of doses per
day, and hysteresis so it does not oscillate around the threshold. That is the actual engineering content of
the project, and it is more interesting than the wiring.</p>`,

what: [
  'Read soil moisture every minute and show it as a percentage on an OLED.',
  'Run the pump for a fixed few seconds when the soil drops below a dry threshold.',
  'Then refuse to water again for at least 30 minutes, so the water can spread.',
  'Stop entirely after a settable number of doses per day, and say so on the screen, in case the sensor has fallen out of the pot.',
  'Show when it last watered and how many doses it has given today.'
],

how: `
<p><strong>Capacitive</strong> soil sensors measure the dielectric constant of what is around them - and water
has a dielectric constant of about 80 while dry soil is around 4, so the sensor's oscillator frequency shifts
dramatically with moisture. It reports that as an analog voltage. Crucially, the electrodes are behind a solder
mask and never touch the soil electrically.</p>
<p>The resistive sensors with two exposed metal prongs work by passing a DC current through the soil. That
electroplates the prongs, they corrode visibly within weeks, and the readings drift the whole time. Do not buy
one. If yours has bare metal prongs, that is what you have.</p>
<p>The reading is <strong>backwards</strong>: wetter soil gives a <em>lower</em> analog value. Roughly 300 in a
glass of water and 600 in dry air on a 5&nbsp;V Nano, though every sensor differs, which is why calibration is
a required step rather than a nicety.</p>
<p><strong>Hysteresis</strong> is the fix for oscillation: water when it drops below 30&nbsp;%, but do not stop
considering it "watered" until it rises above 45&nbsp;%. The gap between the two numbers is what stops a sensor
wobbling by one percent from cycling the pump.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'soil', qty: 1, note: 'Capacitive, v1.2 or v2.0. If the listing shows two bare metal prongs, it is the wrong kind.' },
  { id: 'pump', qty: 1, note: '5 V submersible. Comes with a short spout - you supply the tube.' },
  { id: 'tubing', qty: 1 },
  { id: 'relay1', qty: 1, note: 'Or a MOSFET. A relay is simpler here and the pump only runs for seconds at a time.' },
  { id: 'oled13', qty: 1 },
  { id: 'button', qty: 1, note: 'Manual "water now" override.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 1 },
  { id: 'diode', qty: 1, note: 'Flyback across the pump, in case you use a bare relay or a MOSFET.' },
  { id: 'box-abs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',   at: [0, 0] },
    { id: 'soil', comp: 'soil',   at: [-62, -6], ry: 90 },
    { id: 'oled', comp: 'oled13', at: [22, -58], ry: 180 },
    { id: 'rly',  comp: 'relay1', at: [60, 22], ry: 180 },
    { id: 'pump', comp: 'pump5v', at: [64, 84] },
    { id: 'btn',  comp: 'button', at: [-20, 44] }
  ],
  wires: [
    { from: 'soil.VCC',  to: 'nano.5V',   color: 'red',    note: 'Sensor power' },
    { from: 'soil.GND',  to: 'nano.GND',  color: 'black',  note: 'Sensor ground' },
    { from: 'soil.AOUT', to: 'nano.A0',   color: 'yellow', note: 'Analog moisture reading. Lower means wetter' },
    { from: 'oled.VCC',  to: 'nano.5V',   color: 'red',    note: 'Screen power' },
    { from: 'oled.GND',  to: 'nano.GND2', color: 'black',  note: 'Screen ground' },
    { from: 'oled.SDA',  to: 'nano.A4',   color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL',  to: 'nano.A5',   color: 'green',  note: 'I2C clock' },
    { from: 'rly.VCC',   to: 'nano.5V',   color: 'red',    note: 'Relay coil supply' },
    { from: 'rly.GND',   to: 'nano.GND2', color: 'black',  note: 'Relay ground' },
    { from: 'rly.IN',    to: 'nano.D7',   color: 'purple', note: 'Pump control' },
    { from: 'rly.NO',    to: 'pump.W1',   color: 'brown',  note: 'Switched 5 V to the pump. COM takes 5 V from the supply' },
    { from: 'btn.1A',    to: 'nano.D4',   color: 'orange', note: 'Manual water button, internal pull-up' },
    { from: 'btn.2A',    to: 'nano.GND2', color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">Power the pump from the supply, not through the Nano</span>
<p>A 5&nbsp;V submersible pump pulls 200-400&nbsp;mA and starts with a bigger inrush than that. Run the
supply's 5&nbsp;V to the relay's COM terminal directly, and the Nano from the same supply in parallel - not in
series through the board's regulator. The Nano's 5&nbsp;V pin is not a power distribution point.</p></div>

<div class="note tip"><span class="t">Why not just a MOSFET?</span>
<p>You can, and it is quieter. Gate to D7 through 220&nbsp;&Omega;, 10&nbsp;k gate pull-down, drain to the
pump's negative, source to ground, and a 1N4007 across the pump with its stripe to the positive side. The relay
version is here because it is harder to get wrong, and the pump runs for four seconds a day.</p></div>

<div class="note warn"><span class="t">Keep the electronics above the water</span>
<p>The sensor is designed to be pushed into soil, but only up to the marked line - above that is the
electronics and it is not sealed. The reservoir, the tube and the pot are all things that can overflow. Put the
board in a box, on a shelf, above everything wet.</p></div>`,

solderSteps: [
  { h: 'Sockets for the Nano and the OLED',
    body: `<p>Two 15-pin female strips for the Nano, one 4-pin for the screen. Use the modules themselves as
    jigs, tack the end pins, check everything is square from the side, then complete.</p>` },
  { h: 'Screw terminal for the incoming 5 V',
    body: `<p>One 2-pin block at the edge. Everything else takes its power from here: a short run of solid core
    to the Nano's 5&nbsp;V socket pin, another to the relay's COM.</p>
    <p>Fill these pads properly - all the pump current goes through them.</p>` },
  { h: 'Extend the sensor leads',
    body: `<p>The sensor comes with a short 3-pin cable. If you need it longer, cut, strip, tin, splice with a
    lineman\'s twist and sleeve each in heat-shrink - slid on first. Keep the three conductors the same length
    and twisted together; a long analog line picks up noise.</p>
    <p>Do not go much beyond a metre. Past that the reading starts to wander with anything electrical nearby.</p>` },
  { h: 'Pump leads to the relay',
    body: `<p>Red from the supply to relay COM, relay NO to the pump\'s red. Pump black straight back to the
    supply negative. Sleeve every joint.</p>
    <p>If you use a bare relay rather than a module, solder a 1N4007 across the pump terminals, stripe to the
    positive side. A module already has one on the coil, but the pump also wants one.</p>` },
  { h: 'Check before you get anything wet',
    body: `<p>Continuity: 5&nbsp;V to GND, no beep. Power up with the pump out of the water and the tube in a
    sink, and trigger a manual dose with the button. Watch where the water actually goes before you point it at
    a plant.</p>` }
],

assembly: [
  { h: 'Calibrate the sensor first',
    body: `<p>Do this before anything else - the numbers go into the sketch. Full instructions in the
    calibration section.</p>` },
  { h: 'Set up the reservoir',
    body: `<p>Any jar or bottle that the pump sits at the bottom of. The pump must stay submerged: these little
    pumps are cooled by the water they move and will burn out in a couple of minutes running dry.</p>
    <p>Keep the reservoir <em>below</em> the pot, or at least not above it, so that if the pump leaks it does
    not siphon the whole jar into the plant.</p>` },
  { h: 'Route the tube',
    body: `<p>Push the silicone tube onto the pump spout and secure the far end to the side of the pot so it
    cannot flick out. Aim it at the soil near the edge, not at the stem.</p>` },
  { h: 'Push the sensor in to the line',
    body: `<p>Vertically, to the marked maximum depth, about two-thirds of the way between the stem and the rim.
    Not touching the tube outlet - if it sits where the water lands it will read soaked while the rest of the
    pot is dry.</p>` },
  { h: 'Watch it for a full day before trusting it',
    body: `<p>The screen shows the reading and the dose count. Check the soil by finger at the end of the day
    and compare with what the sketch decided. Adjust the thresholds once, then leave it alone.</p>` }
],

libraries: [
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The screen.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Drawing into the screen buffer.' }
],

code: [
{
  h: 'Calibration sketch - run this first',
  name: 'soil_calibrate.ino',
  intro: `<p>Prints the raw reading twice a second. You need two numbers from it: the value in air, and the
  value in a glass of water.</p>`,
  code: `void setup() {
  Serial.begin(9600);
  Serial.println(F("Soil sensor calibration"));
  Serial.println(F("1. Hold it in the air         -> note the number (DRY)"));
  Serial.println(F("2. Stand it in a glass of water"));
  Serial.println(F("   up to the line only        -> note the number (WET)"));
}

void loop() {
  long sum = 0;
  for (int i = 0; i < 16; i++) { sum += analogRead(A0); delay(5); }
  Serial.println(sum / 16);       // averaged: a single read is noisy
  delay(400);
}`,
  after: `<p>Typical values on a 5&nbsp;V board are around 600 in air and 300 in water, but yours will differ by
  fifty or more either way. Averaging sixteen reads is not decoration - a single <code>analogRead()</code> on a
  long sensor lead can wobble by 20 counts.</p>`
},
{
  h: 'The waterer',
  name: 'plant_waterer.ino',
  code: `/* ------------------------------------------------------------------
   Automatic plant waterer
   Capacitive soil sensor on A0, relay on D7, OLED on I2C, button on D4.

   Three interlocks stop it drowning the plant:
     1. after watering it will not water again for SETTLE_MINUTES
     2. no more than MAX_DOSES_PER_DAY
     3. hysteresis - dry at DRY_PCT, but not "wet" again until WET_PCT
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---- from the calibration sketch -------------------------------------
const int RAW_DRY = 600;      // reading in air
const int RAW_WET = 300;      // reading in water
// ---- behaviour -------------------------------------------------------
const int  DRY_PCT           = 30;    // water below this
const int  WET_PCT           = 45;    // considered watered above this
const unsigned long PUMP_MS        = 4000UL;
const unsigned long SETTLE_MINUTES = 30;
const int  MAX_DOSES_PER_DAY = 6;
const bool RELAY_ACTIVE_LOW  = true;
// ----------------------------------------------------------------------

#define SOIL_PIN   A0
#define RELAY_PIN   7
#define BUTTON_PIN  4
#define OLED_ADDR 0x3C

Adafruit_SSD1306 display(128, 64, &Wire, -1);

int  moisture = 0;
bool thirsty  = false;          // latched dry state, for hysteresis
int  dosesToday = 0;
unsigned long lastWater = 0;
unsigned long dayStarted = 0;
unsigned long lastRead = 0;
bool everWatered = false;

void setup() {
  Serial.begin(9600);
  pinMode(RELAY_PIN, OUTPUT);
  pumpOff();
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("no screen"));
    for (;;) { }
  }
  display.setTextColor(SSD1306_WHITE);

  dayStarted = millis();
  moisture = readMoisture();
  thirsty = moisture < DRY_PCT;
}

void loop() {
  // roll the dose counter over once a day
  if (millis() - dayStarted > 86400000UL) {
    dayStarted = millis();
    dosesToday = 0;
  }

  if (millis() - lastRead > 20000UL || lastRead == 0) {
    lastRead = millis();
    moisture = readMoisture();

    // hysteresis: two different thresholds, not one
    if (moisture < DRY_PCT) thirsty = true;
    if (moisture > WET_PCT) thirsty = false;

    Serial.print(F("moisture "));
    Serial.print(moisture);
    Serial.print(F("%  thirsty="));
    Serial.println(thirsty);
  }

  if (buttonPressed()) {
    Serial.println(F("manual dose"));
    water();
  } else if (thirsty && canWater()) {
    Serial.println(F("automatic dose"));
    water();
  }

  draw();
  delay(80);
}

/* --- reading ---------------------------------------------------------- */
int readMoisture() {
  long sum = 0;
  for (int i = 0; i < 16; i++) { sum += analogRead(SOIL_PIN); delay(4); }
  int raw = sum / 16;

  // RAW_WET is the LOWER number, so the map is inverted on purpose
  int pct = map(raw, RAW_DRY, RAW_WET, 0, 100);
  return constrain(pct, 0, 100);
}

/* --- the interlocks --------------------------------------------------- */
bool canWater() {
  if (dosesToday >= MAX_DOSES_PER_DAY) return false;
  if (everWatered && millis() - lastWater < SETTLE_MINUTES * 60000UL) return false;
  return true;
}

void water() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(14, 24);
  display.print(F("watering"));
  display.display();

  pumpOn();
  delay(PUMP_MS);
  pumpOff();

  lastWater = millis();
  everWatered = true;
  dosesToday++;
}

void pumpOn()  { digitalWrite(RELAY_PIN, RELAY_ACTIVE_LOW ? LOW : HIGH); }
void pumpOff() { digitalWrite(RELAY_PIN, RELAY_ACTIVE_LOW ? HIGH : LOW); }

bool buttonPressed() {
  if (digitalRead(BUTTON_PIN) == HIGH) return false;
  delay(30);
  if (digitalRead(BUTTON_PIN) == HIGH) return false;
  while (digitalRead(BUTTON_PIN) == LOW) { }    // wait for release
  return true;
}

/* --- the screen ------------------------------------------------------- */
void draw() {
  display.clearDisplay();

  display.setTextSize(3);
  display.setCursor(0, 0);
  display.print(moisture);
  display.setTextSize(1);
  display.print(F("%"));

  display.setTextSize(1);
  display.setCursor(74, 2);
  display.print(thirsty ? F("DRY") : F("OK"));
  display.setCursor(74, 13);
  display.print(dosesToday);
  display.print('/');
  display.print(MAX_DOSES_PER_DAY);

  // moisture bar with the two thresholds marked on it
  display.drawRect(0, 30, 128, 10, SSD1306_WHITE);
  display.fillRect(2, 32, (int)(moisture * 1.24), 6, SSD1306_WHITE);
  display.drawFastVLine((int)(DRY_PCT * 1.24) + 2, 28, 14, SSD1306_WHITE);
  display.drawFastVLine((int)(WET_PCT * 1.24) + 2, 28, 14, SSD1306_WHITE);

  display.setCursor(0, 46);
  if (dosesToday >= MAX_DOSES_PER_DAY) {
    display.print(F("daily limit reached"));
  } else if (!everWatered) {
    display.print(F("not watered yet"));
  } else {
    unsigned long mins = (millis() - lastWater) / 60000UL;
    display.print(F("watered "));
    if (mins < 60) { display.print(mins); display.print(F("m ago")); }
    else           { display.print(mins / 60); display.print(F("h ago")); }
  }

  display.setCursor(0, 56);
  if (thirsty && !canWater()) display.print(F("dry - waiting to settle"));
  else if (thirsty)           display.print(F("dry - will water"));
  else                        display.print(F("soil is fine"));

  display.display();
}`,
  after: `<p>The screen deliberately shows <em>why</em> it is not watering, not just that it is not. "Dry -
  waiting to settle" and "daily limit reached" are the two states that would otherwise look identical to
  "broken", and being able to tell them apart at a glance is what stops you second-guessing the thing and
  watering the plant by hand anyway.</p>`
}],

upload: `<p>Nano, correct port, upload. Run the calibration sketch first and put its two numbers into
<code>RAW_DRY</code> and <code>RAW_WET</code> before you upload the main one.</p>`,

tune: [
  { h: 'Calibrate in air and water, not in soil',
    body: `<p>Air and water are the two repeatable extremes. Soil is neither - it varies with compaction,
    type and temperature. Calibrate at the extremes, then judge the thresholds by how the plant actually
    responds.</p>
    <p>Only submerge the sensor to the marked line. The board above it is not waterproof.</p>` },
  { h: 'Set the thresholds by plant, not by number',
    body: `<p>Most houseplants: water below 30&nbsp;%. Succulents and cacti: 15&nbsp;% or lower, and reduce
    <code>MAX_DOSES_PER_DAY</code> to 1. Ferns and anything that wilts: 45&nbsp;%.</p>
    <p>Keep at least 10 points between <code>DRY_PCT</code> and <code>WET_PCT</code> or the hysteresis stops
    doing its job.</p>` },
  { h: 'Measure the dose, do not guess it',
    body: `<p>Point the tube into a measuring jug and press the manual button. Whatever comes out is what your
    plant gets per dose. Adjust <code>PUMP_MS</code> until it is a sensible amount for the pot size -
    50&nbsp;ml for a small pot, 200&nbsp;ml for a big one.</p>` },
  { h: 'Lengthen the settle time for big pots',
    body: `<p>Water takes time to spread through soil and reach the sensor. 30 minutes suits a small pot; a
    large one may need 90. If you see it water twice in a row, this is the number to increase.</p>` },
  { h: 'Use the daily limit as an alarm',
    body: `<p>If it reaches the limit regularly, something is wrong: the sensor has worked loose, the tube has
    slipped out of the pot, or the reservoir is empty. Do not raise the limit - go and look.</p>` }
],

trouble: [
  { q: 'Moisture reads 0 % or 100 % constantly',
    a: `The calibration values are wrong or swapped. Remember <code>RAW_WET</code> is the <em>lower</em> raw
    number. Re-run the calibration sketch and check the two figures are at least 150 counts apart - if they are
    not, the sensor is faulty or it is a resistive one.` },
  { q: 'Reading drifts over days',
    a: `Normal to a degree - soil compacts and the sensor settles. A large, steady drift usually means the
    sensor has been pushed in past the line and moisture has reached the electronics.` },
  { q: 'Pump runs but no water comes out',
    a: `It is not submerged, or it is airlocked. Tip it under water to release the bubble. These pumps have no
    priming ability at all.` },
  { q: 'Pump makes a noise and does not turn',
    a: `Not enough current. Check the supply is a real 2&nbsp;A and that the 5&nbsp;V is coming from the supply,
    not through the Nano.` },
  { q: 'Waters twice in quick succession',
    a: `The settle time is too short, or the sensor is directly under the tube outlet. Move the sensor, then
    increase <code>SETTLE_MINUTES</code>.` },
  { q: 'Nano resets when the pump starts',
    a: `Inrush. Add a 470&nbsp;&micro;F capacitor across the 5&nbsp;V rail and use thicker supply wires. If it
    persists, run the pump from a separate 5&nbsp;V supply with the grounds joined.` },
  { q: 'Screen freezes on "watering"',
    a: `That screen is drawn before a blocking <code>delay(PUMP_MS)</code>, so it is genuinely frozen for four
    seconds by design. If it stays there longer, the sketch has crashed - most likely a brownout.` },
  { q: 'Everything works but the plant still dies',
    a: `Overwatering is the most common way to kill a houseplant, and automation makes it easier, not harder.
    Start with a lower <code>DRY_PCT</code> and one dose a day, and watch for a fortnight.` }
],

next: `
<ul>
  <li><strong>Water level sensor in the reservoir</strong> so it refuses to run the pump dry and tells you to
  refill. The single most worthwhile addition.</li>
  <li><strong>Four pots</strong>: four sensors on A0-A3, four channels of a relay board, one loop over an
  array.</li>
  <li><strong>Put it online</strong> with an ESP32 and get a notification when the reservoir is low or the
  soil has not responded to watering.</li>
  <li><strong>Log it</strong> to an SD card and you will learn more about how your plant actually dries out in
  a fortnight than in a year of guessing.</li>
</ul>`
});
