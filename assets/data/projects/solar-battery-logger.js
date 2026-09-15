/* Solar panel + TP4056 + INA219 pair, logging harvest and draw to SD. */
AB.addProject({
slug: 'solar-battery-logger',
title: 'Solar harvest logger',
cat: 'power',
level: 4,
time: '4 hours',
solder: true,
board: 'ESP32',
tags: ['solar', 'ina219', 'tp4056', '18650', 'csv', 'deep sleep', 'energy budget'],
blurb: 'Two current sensors, one cell and an SD card: how much a small panel really harvests, how much your project really uses, and whether it can run forever.',

skills: ['Two I2C devices, one bus', 'Energy budgeting', 'LiPo charging', 'Deep sleep', 'CSV logging'],

intro: `
<p>"Just add a solar panel" is the most common piece of bad advice in this hobby. A 6&nbsp;V 1&nbsp;W panel in
a British winter, behind a window, at the wrong angle, harvests a tiny fraction of its rating - and the number
that matters is not the panel's label but the milliamp-hours it actually delivers over a week.</p>
<p>This build measures both sides: what comes in from the panel, and what goes out to the load. Run it for a
fortnight and you will know, rather than hope, whether your outdoor project can run indefinitely.</p>`,

what: [
  'Measure charge current from the panel and discharge current to the load, separately and continuously.',
  'Track the cell voltage and estimate its state of charge.',
  'Accumulate harvested and consumed milliamp-hours, and reset the daily totals at midnight.',
  'Log a CSV line every minute so you can chart a week of sun and cloud.',
  'Show the running balance on an OLED - positive means the battery is gaining.'
],

how: `
<p>Two <strong>INA219</strong> sensors on one I2C bus, at different addresses. The chip has two address
jumpers, A0 and A1, giving 0x40, 0x41, 0x44 and 0x45. Bridge A0 on the second board and it becomes 0x41, and
now one bus carries both.</p>
<p>Sensor one sits between the <strong>panel and the charger</strong>, so it reads harvest. Sensor two sits
between the <strong>charger output and the load</strong>, so it reads consumption. The difference is what the
cell is gaining or losing.</p>
<p>The <strong>TP4056</strong> is a constant-current, constant-voltage lithium charger: it pushes a set current
(1&nbsp;A by default, set by a resistor) until the cell reaches 4.2&nbsp;V, then holds 4.2&nbsp;V while the
current tapers off. The protected variant adds a second chip that disconnects the cell at about 2.4&nbsp;V to
stop it being destroyed, and at high current to stop a short.</p>
<p>A TP4056 is <em>not</em> a solar charge controller. It has no maximum power point tracking, so a panel whose
voltage sags under load will simply deliver less. It works, it is cheap, and a proper MPPT controller would
harvest perhaps 20&nbsp;% more - worth knowing, not worth starting with.</p>
<p><strong>State of charge from voltage</strong> is rough. A lithium cell sits near 3.7&nbsp;V for most of its
discharge, so voltage tells you little in the middle and a lot at the ends. Coulomb counting - adding up the
current in and out - is much better between those points, and that is what the accumulated figures are for.</p>`,

bom: [
  { id: 'esp32', qty: 1 },
  { id: 'ina219', qty: 2, note: 'One stays at 0x40; bridge the A0 jumper on the other to make it 0x41.' },
  { id: 'tp4056', qty: 1, note: 'The protected version. Two extra chips near the USB socket.' },
  { id: '18650', qty: 1, note: 'Cell and holder. A protected cell as well as the protected board is belt and braces, and cheap.' },
  { id: 'solar6v', qty: 1, note: 'One 2 W panel is the sensible starting size. Two in parallel doubles the harvest and the cost.' },
  { id: 'diode', qty: 1, note: 'Schottky in series with the panel, to stop the cell discharging back through it at night.' },
  { id: 'oled13', qty: 1 },
  { id: 'sdcard', qty: 1 },
  { id: 'sdcard-8gb', qty: 1, own: true },
  { id: 'ds3231', qty: 1, note: 'For real timestamps in the log.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 3 },
  { id: 'box-ip65', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'usb-meter' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'esp',   comp: 'esp32',       at: [0, 0] },
    { id: 'inaIn', comp: 'ina219',      at: [-58, -48], ry: 180 },
    { id: 'inaOut',comp: 'ina219',      at: [-58, 46], ry: 180 },
    { id: 'chg',   comp: 'tp4056',      at: [-4, -60] },
    { id: 'batt',  comp: 'battery18650',at: [0, 96] },
    { id: 'oled',  comp: 'oled13',      at: [50, -54], ry: 180 },
    { id: 'sd',    comp: 'sdcard',      at: [54, 30], ry: 180 },
    { id: 'rtc',   comp: 'ds3231',      at: [54, 76], ry: 180 },
    { id: 'panel', comp: 'block',       at: [-64, -112], opt: { w: 80, h: 6, d: 54, c: '#1b2a3a' }, label: 'Solar panel 6 V' }
  ],
  wires: [
    { from: 'panel.f',    to: 'inaIn.VIN+',  color: 'red',    note: 'Panel positive, through a Schottky diode, into sensor 1' },
    { from: 'inaIn.VIN-', to: 'chg.B+',      color: 'red',    note: 'Measured harvest current into the charger input' },
    { from: 'panel.n',    to: 'chg.B-',      color: 'black',  note: 'Panel negative to the common ground' },
    { from: 'chg.OUT+',   to: 'inaOut.VIN+', color: 'red',    note: 'Protected cell output into sensor 2' },
    { from: 'inaOut.VIN-',to: 'esp.VIN',     color: 'red',    note: 'Measured load current feeds the ESP32' },
    { from: 'chg.OUT-',   to: 'esp.GND',     color: 'black',  note: 'Common ground' },
    { from: 'batt.+',     to: 'chg.B+',      color: 'red',    note: 'Cell positive to the charger battery terminal' },
    { from: 'batt.-',     to: 'chg.B-',      color: 'black',  note: 'Cell negative' },
    { from: 'inaIn.VCC',  to: 'esp.3V3',     color: 'red',    note: 'Sensor 1 logic power' },
    { from: 'inaIn.GND',  to: 'esp.GND2',    color: 'black',  note: 'Sensor 1 ground' },
    { from: 'inaIn.SCL',  to: 'esp.D22',     color: 'green',  note: 'Shared I2C clock' },
    { from: 'inaIn.SDA',  to: 'esp.D21',     color: 'blue',   note: 'Shared I2C data' },
    { from: 'inaOut.VCC', to: 'esp.3V3',     color: 'red',    note: 'Sensor 2 logic power' },
    { from: 'inaOut.GND', to: 'esp.GND2',    color: 'black',  note: 'Sensor 2 ground' },
    { from: 'inaOut.SCL', to: 'esp.D22',     color: 'green',  note: 'Same I2C bus, address 0x41' },
    { from: 'inaOut.SDA', to: 'esp.D21',     color: 'blue',   note: 'Same I2C bus' },
    { from: 'oled.VCC',   to: 'esp.3V3',     color: 'red',    note: 'Screen power' },
    { from: 'oled.GND',   to: 'esp.GND3',    color: 'black',  note: 'Screen ground' },
    { from: 'oled.SDA',   to: 'esp.D21',     color: 'blue',   note: 'Same I2C bus' },
    { from: 'oled.SCL',   to: 'esp.D22',     color: 'green',  note: 'Same I2C bus' },
    { from: 'rtc.VCC',    to: 'esp.3V3',     color: 'red',    note: 'Clock power' },
    { from: 'rtc.GND',    to: 'esp.GND3',    color: 'black',  note: 'Clock ground' },
    { from: 'rtc.SDA',    to: 'esp.D21',     color: 'blue',   note: 'Same I2C bus' },
    { from: 'rtc.SCL',    to: 'esp.D22',     color: 'green',  note: 'Same I2C bus' },
    { from: 'sd.VCC',     to: 'esp.VIN',     color: 'red',    note: 'SD module - the board has a regulator, so 5 V is right' },
    { from: 'sd.GND',     to: 'esp.GND3',    color: 'black',  note: 'Card ground' },
    { from: 'sd.MISO',    to: 'esp.D19',     color: 'white',  note: 'SPI in' },
    { from: 'sd.MOSI',    to: 'esp.D23',     color: 'orange', note: 'SPI out' },
    { from: 'sd.SCK',     to: 'esp.D18',     color: 'purple', note: 'SPI clock' },
    { from: 'sd.CS',      to: 'esp.D5',      color: 'grey',   note: 'Chip select' }
  ]
},

wireIntro: `<p>The power chain is the thing to get right, and it goes in one direction only:
<strong>panel &rarr; diode &rarr; sensor 1 &rarr; charger &rarr; cell</strong>, and separately
<strong>charger output &rarr; sensor 2 &rarr; load</strong>.</p>`,

wireNotes: `
<div class="note danger"><span class="t">B+/B- is the cell. OUT+/OUT- is your circuit.</span>
<p>On a TP4056, the panel goes to the <code>IN+</code>/<code>IN-</code> pads (or the USB socket), the cell to
<code>B+</code>/<code>B-</code>, and your load to <code>OUT+</code>/<code>OUT-</code>.</p>
<p>Connecting the load to B+/B- bypasses the protection circuit entirely. The cell then has nothing stopping it
being discharged to 2&nbsp;V, which destroys it and can make recharging genuinely dangerous.</p></div>

<div class="note danger"><span class="t">Lithium cells are not like other batteries</span>
<ul>
  <li>Never charge below 0&nbsp;&deg;C. Charging a cold lithium cell plates metallic lithium inside it and can
  cause an internal short later. If this lives outdoors, either add a temperature check that inhibits charging,
  or accept that it should not run through a hard winter.</li>
  <li>Never puncture, crush or short one. A shorted 18650 delivers tens of amps and will set fire to whatever
  it is touching.</li>
  <li>Use a holder with the correct polarity marked, and check it - a cell fitted backwards into a TP4056 is a
  bad afternoon.</li>
  <li>Charge the first time where you can see it.</li>
</ul></div>

<div class="note warn"><span class="t">The Schottky diode in the panel line</span>
<p>At night a solar panel is a load, not a source, and without a blocking diode the cell slowly discharges back
through it. A Schottky (1N5819) drops about 0.3&nbsp;V rather than a silicon diode's 0.7, which matters when
your panel only makes 6.</p>
<p>Some TP4056 modules already include one - look for a diode symbol near the input. Adding a second is
harmless except for the extra drop.</p></div>

<div class="note tip"><span class="t">Setting the second sensor's address</span>
<p>The INA219 breakout has two solder jumpers marked A0 and A1. Bridge <strong>A0</strong> with a blob of
solder on one board and it moves from 0x40 to 0x41. Run an I2C scanner afterwards to confirm both appear.</p></div>`,

solderSteps: [
  { h: 'Set the second INA219 address first',
    body: `<p>Find the A0 jumper - two small pads with a gap. Heat both and let a blob of solder bridge them.
    Then scan the bus and confirm you see 0x40 and 0x41 before anything else is built.</p>
    <p>Doing this after the board is assembled means working with an iron next to a lithium cell, which is
    exactly what you do not want.</p>` },
  { h: 'Heavy wire in both measured paths',
    body: `<p>The VIN+/VIN- paths carry all the current. 20&nbsp;AWG, short and direct. Anything thinner adds
    resistance in series with a 0.1&nbsp;&Omega; shunt and corrupts the very numbers you are building this to
    collect.</p>` },
  { h: 'Diode with the stripe towards the charger',
    body: `<p>Cathode - the banded end - points towards the TP4056 input, so current can flow from the panel in
    but not back out. Tin both legs, solder inline, sleeve in heat-shrink.</p>
    <p>Backwards, nothing charges at all, which is at least an unambiguous symptom.</p>` },
  { h: 'Screw terminals for the panel and the cell',
    body: `<p>Three 2-pin blocks: panel in, cell, load out. You want to be able to disconnect the cell without
    desoldering, always.</p>
    <p>Do not tin the wire ends going into the screw terminals.</p>` },
  { h: 'The rest on sockets',
    body: `<p>ESP32, two sensors, screen, clock and SD module all on female headers. That is a lot of sockets
    and it is worth every minute when one module misbehaves.</p>` },
  { h: 'Check the whole chain before the cell goes in',
    body: `<p>With no cell fitted: continuity from B+ to OUT+ (should be open or high resistance - the
    protection FETs are off), panel input to ground (open), and each I2C line to ground (open).</p>
    <p>Then fit the cell, and measure OUT+ to OUT- - it should read the cell voltage.</p>` },
  { h: 'First charge, watched',
    body: `<p>Connect the panel in sunlight, or a 5&nbsp;V USB supply to the TP4056's input. The red LED means
    charging, blue means done. Feel the board after ten minutes: warm is normal, hot is not.</p>` }
],

assembly: [
  { h: 'Verify both sensors read independently',
    body: `<p>Upload a short sketch that prints both. Put a load on one path and confirm only that sensor
    moves. Sensors reading identical numbers means both are at the same address and you are talking to one
    chip twice.</p>` },
  { h: 'Set the clock',
    body: `<p>Use the setter from the <a href="project.html?p=desk-clock">desk clock</a>, then flash the logger.</p>` },
  { h: 'Mount the panel properly',
    body: `<p>Angle matters enormously. Rule of thumb: tilt equal to your latitude, facing the equator. In
    northern Europe that is a steep 50-60&nbsp;degrees, which also sheds rain and snow.</p>
    <p>Behind glass costs you 10-15&nbsp;%. In partial shade costs you far more than the shaded fraction,
    because cells in series are limited by the worst one.</p>` },
  { h: 'Weatherproof it',
    body: `<p>IP65 box, cable glands, and mount it so the glands point down. Silica gel inside. The panel's own
    leads are usually the weak point - support them so nothing pulls.</p>` },
  { h: 'Then leave it alone for two weeks',
    body: `<p>That is the whole experiment. One sunny day tells you nothing useful; a fortnight including bad
    weather tells you whether the budget closes.</p>` }
],

libraries: [
  { name: 'Adafruit INA219', by: 'Adafruit', why: 'Both sensors.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The screen.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Drawing.' },
  { name: 'RTClib', by: 'Adafruit', why: 'Timestamps.' },
  { name: 'SD', by: 'Arduino', how: 'Built in', why: 'The card.' }
],

code: [{
  name: 'solar_logger.ino',
  code: `/* ------------------------------------------------------------------
   Solar harvest logger
   INA219 at 0x40 (panel -> charger) and 0x41 (charger -> load),
   SSD1306 and DS3231 on the same I2C bus, SD card on SPI.
   Board: ESP32 Dev Module
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_INA219.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <RTClib.h>
#include <SPI.h>
#include <SD.h>

#define SD_CS       5
#define OLED_ADDR   0x3C
#define LOG_MS      60000UL

Adafruit_INA219 inaIn(0x40);     // harvest
Adafruit_INA219 inaOut(0x41);    // consumption
Adafruit_SSD1306 display(128, 64, &Wire, -1);
RTC_DS3231 rtc;

float inV = 0, inA = 0, outV = 0, outA = 0;
double mAhIn = 0, mAhOut = 0;
double mAhInToday = 0, mAhOutToday = 0;
unsigned long lastSample = 0, lastLog = 0, lastDraw = 0;
int lastDay = -1;
bool sdOk = false, haveRtc = false;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("no screen"));
  }
  display.setTextColor(SSD1306_WHITE);

  if (!inaIn.begin())  Serial.println(F("no INA219 at 0x40"));
  if (!inaOut.begin()) Serial.println(F("no INA219 at 0x41 - did you bridge A0?"));

  // A small panel and a sleeping load are both low-current. The 1 A
  // range gives four times the resolution of the 2 A default.
  inaIn.setCalibration_32V_1A();
  inaOut.setCalibration_32V_1A();

  haveRtc = rtc.begin();
  if (!haveRtc) Serial.println(F("no RTC - timestamps will be uptime"));

  sdOk = SD.begin(SD_CS);
  Serial.println(sdOk ? F("SD ok") : F("SD FAILED"));
  if (sdOk && !SD.exists("/SOLAR.CSV")) {
    File f = SD.open("/SOLAR.CSV", FILE_WRITE);
    if (f) {
      f.println(F("datetime,panel_v,panel_ma,batt_v,load_ma,mah_in_today,mah_out_today"));
      f.close();
    }
  }

  lastSample = millis();
}

void loop() {
  sample();

  if (millis() - lastLog > LOG_MS) {
    lastLog = millis();
    logLine();
  }
  if (millis() - lastDraw > 500) {
    lastDraw = millis();
    draw();
  }
}

/* --- measure and integrate -------------------------------------------- */
void sample() {
  unsigned long now = millis();
  unsigned long dt = now - lastSample;
  if (dt < 200) return;
  lastSample = now;

  inV  = inaIn.getBusVoltage_V();
  inA  = inaIn.getCurrent_mA();
  outV = inaOut.getBusVoltage_V();
  outA = inaOut.getCurrent_mA();

  if (inA  < 0.5) inA  = 0;          // below the noise floor, call it zero
  if (outA < 0.5) outA = 0;

  double hours = dt / 3600000.0;
  mAhIn  += inA  * hours;  mAhInToday  += inA  * hours;
  mAhOut += outA * hours;  mAhOutToday += outA * hours;

  if (haveRtc) {
    int d = rtc.now().day();
    if (lastDay < 0) lastDay = d;
    if (d != lastDay) {
      lastDay = d;
      Serial.printf("day rolled: in %.1f mAh, out %.1f mAh\\n", mAhInToday, mAhOutToday);
      mAhInToday = mAhOutToday = 0;
    }
  }
}

/* Very rough state of charge from resting voltage. Useful at the ends of
   the range, nearly useless in the middle - which is why the mAh
   counters are the number to trust while it is running. */
int stateOfCharge(float v) {
  if (v >= 4.15) return 100;
  if (v >= 4.05) return 90;
  if (v >= 3.95) return 80;
  if (v >= 3.87) return 70;
  if (v >= 3.80) return 60;
  if (v >= 3.75) return 50;
  if (v >= 3.70) return 40;
  if (v >= 3.65) return 30;
  if (v >= 3.60) return 20;
  if (v >= 3.50) return 10;
  if (v >= 3.30) return 5;
  return 0;
}

/* --- log -------------------------------------------------------------- */
void logLine() {
  if (!sdOk) return;

  char stamp[24];
  if (haveRtc) {
    DateTime n = rtc.now();
    snprintf(stamp, sizeof(stamp), "%04d-%02d-%02d %02d:%02d:%02d",
             n.year(), n.month(), n.day(), n.hour(), n.minute(), n.second());
  } else {
    snprintf(stamp, sizeof(stamp), "uptime_%lu", millis() / 1000UL);
  }

  File f = SD.open("/SOLAR.CSV", FILE_APPEND);
  if (!f) { sdOk = false; return; }

  f.printf("%s,%.2f,%.1f,%.3f,%.1f,%.2f,%.2f\\n",
           stamp, inV, inA, outV, outA, mAhInToday, mAhOutToday);
  f.close();                       // close every line: a flat battery
                                   // must not cost you the whole day

  Serial.printf("%s  in %.0f mA  out %.0f mA  batt %.2f V\\n",
                stamp, inA, outA, outV);
}

/* --- screen ----------------------------------------------------------- */
void draw() {
  display.clearDisplay();

  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("PANEL "));
  display.print(inV, 1);
  display.print(F("V "));
  display.print(inA, 0);
  display.print(F("mA"));

  display.setCursor(0, 11);
  display.print(F("LOAD       "));
  display.print(outA, 0);
  display.print(F("mA"));

  // the number that actually matters
  float net = inA - outA;
  display.setTextSize(2);
  display.setCursor(0, 24);
  if (net >= 0) display.print('+');
  display.print(net, 0);
  display.setTextSize(1);
  display.print(F(" mA net"));

  display.setCursor(0, 44);
  display.print(F("batt "));
  display.print(outV, 2);
  display.print(F("V  "));
  display.print(stateOfCharge(outV));
  display.print(F("%"));

  display.setCursor(0, 55);
  display.print(F("today +"));
  display.print(mAhInToday, 0);
  display.print(F(" -"));
  display.print(mAhOutToday, 0);
  display.print(F(" mAh"));

  if (!sdOk) {
    display.setCursor(96, 55);
    display.print(F("NOSD"));
  }

  display.display();
}`,
  after: `<p>The "net mA" figure on the screen is the whole project in one number. Positive means the cell is
  gaining; negative means it is losing. Watch it across a day and you will see it swing from +180 at noon to
  &minus;40 overnight - and whether the day closes positive is the only question that matters.</p>`
}],

upload: `
<p>Board: ESP32 Dev Module. Run an I2C scanner first and confirm you see <code>0x3C</code>, <code>0x40</code>,
<code>0x41</code> and <code>0x68</code>. If 0x41 is missing, the A0 jumper is not bridged.</p>`,

tune: [
  { h: 'Calibration range',
    body: `<p><code>setCalibration_32V_1A()</code> gives 40&nbsp;&micro;A steps up to 1&nbsp;A, which suits a
    small panel and a sleeping load. If your panel delivers more than an amp, use the 2&nbsp;A calibration and
    accept coarser steps at the bottom.</p>` },
  { h: 'Noise floor',
    body: `<p>The <code>< 0.5 mA</code> cut-off stops a tiny offset being integrated into a phantom
    100&nbsp;mAh a day. Watch the readings with the panel covered and the load off, and set it just above
    whatever you see.</p>` },
  { h: 'Reading the log',
    body: `<p>Open the CSV in a spreadsheet and chart <code>mah_in_today</code> and
    <code>mah_out_today</code> against date. If the daily harvest exceeds the daily draw on the <em>worst</em>
    week of the year, the system closes. If it only closes in June, it does not.</p>` },
  { h: 'Sizing from the data',
    body: `<p>Once you know the average daily harvest, size the cell for about five days of autonomy - long
    enough to ride out a dark week. A load of 30&nbsp;mAh a day and a harvest of 45 needs maybe a
    1000&nbsp;mAh cell; the same load with a harvest of 32 needs a much bigger one and is marginal.</p>` },
  { h: 'Cold weather',
    body: `<p>Add a temperature check before allowing charge - the DS3231 reports its own temperature, which is
    close enough to ambient inside a box. Below 0&nbsp;&deg;C, inhibit charging by switching a MOSFET in the
    panel line. Worth doing on anything left outdoors through a winter.</p>` }
],

trouble: [
  { q: 'Both sensors read identical values',
    a: `They are at the same address, so you are reading one chip twice. Bridge A0 on the second board and
    confirm with an I2C scanner.` },
  { q: 'Panel current reads zero in bright sun',
    a: `The diode is backwards, the panel is wired to the wrong INA219 terminals, or the cell is already full
    and the TP4056 has tapered off. Check the charger's LED - blue means done, and zero current is then
    correct.` },
  { q: 'Charging never completes',
    a: `A 1&nbsp;W panel into an 18650 can take days, and any cloud resets the tapering. That is normal, and it
    is exactly the thing this logger exists to quantify.` },
  { q: 'TP4056 gets hot',
    a: `It is a linear charger, so it burns the difference between input and cell voltage as heat. A 6&nbsp;V
    panel into a 3.6&nbsp;V cell at 500&nbsp;mA is over a watt. Warm is normal; too hot to touch means reduce
    the charge current by changing the programming resistor.` },
  { q: 'Cell voltage drops fast overnight',
    a: `Either the load is bigger than you think - look at the log - or the blocking diode is missing and it is
    discharging back through the panel.` },
  { q: 'SD writes stop after a while',
    a: `Card, or brownout during a write. Add a capacitor at the card module and check the cell is not at the
    protection cut-off.` },
  { q: 'mAh totals drift up with nothing happening',
    a: `Noise floor too low.` },
  { q: 'Everything dies and will not restart',
    a: `The protection circuit has cut off an over-discharged cell. Many TP4056 boards will not resume until
    the cell sees a charge voltage - connect a USB supply to the input and it should wake. If it does not, the
    cell may be below recovery, and a cell that has been deeply discharged should be recycled, not revived.` }
],

next: `
<ul>
  <li><strong>Use the data to add deep sleep</strong> to whatever the load is. Going from always-on to waking
  once a minute typically cuts the daily draw by 90&nbsp;% and turns a marginal budget into a comfortable one.</li>
  <li><strong>Try a real MPPT controller</strong> (a CN3791 board is about $4) and log the difference. On a
  cloudy day it is worth 20&nbsp;% or more.</li>
  <li><strong>Publish to MQTT</strong> and chart it in Home Assistant alongside the weather, so you can see
  harvest against cloud cover.</li>
  <li><strong>Add a load switch</strong>: cut the load with a MOSFET below 3.4&nbsp;V rather than relying on
  the protection board, so the cell is never taken to its cut-off at all. Cells last far longer that way.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Lithium cells</span>
<p>An 18650 stores about 10&nbsp;kJ and can deliver it in seconds if shorted. Treat it with the respect you
would give a small petrol can.</p>
<ul>
  <li>Use a protected charger board, and ideally a protected cell as well.</li>
  <li>Never charge below freezing.</li>
  <li>Never leave a first charge unattended.</li>
  <li>Check polarity twice before fitting the cell - reversed, a TP4056 fails immediately and sometimes
  dramatically.</li>
  <li>Do not use recovered laptop cells of unknown history for anything left unattended outdoors.</li>
  <li>A cell that has puffed, is damaged, or has been deeply discharged goes to a recycling point, not back
  into service.</li>
</ul>
</div>`
});
