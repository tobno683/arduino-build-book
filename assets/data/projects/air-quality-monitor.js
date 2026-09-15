/* PMS5003 particulate + BME280 on an ESP32 with a colour TFT. */
AB.addProject({
slug: 'air-quality-monitor',
title: 'Indoor air quality monitor',
cat: 'environment',
level: 3,
time: '3 hours',
solder: true,
board: 'ESP32',
tags: ['pms5003', 'bme280', 'pm2.5', 'tft', 'esp32', 'air quality', 'mqtt'],
blurb: 'Real PM2.5 and PM10 numbers on a colour screen, with a plain-English verdict and a 24-hour chart. Cooking will surprise you.',

skills: ['UART sensors', 'Checksums', 'I2C', 'SPI displays', 'Rolling averages', 'AQI maths'],

intro: `
<p>Most "air quality" gadgets under $60 measure a proxy - volatile organic compounds, or a resistance that
drifts - and print a colour. The PMS5003 is different: it is a laser particle counter. It shines a laser
through a stream of air, photographs the scattering, and counts particles by size. It costs about $18 and the
numbers it gives you are real.</p>
<p>The first time you run one in a kitchen you will find out that frying something takes an ordinary room from
5&nbsp;&micro;g/m&sup3; to 300 in ninety seconds, and that it takes forty minutes to come back down. That is
the value of this build: it makes an invisible thing legible.</p>`,

what: [
  'Show PM1.0, PM2.5 and PM10 in micrograms per cubic metre, updated every few seconds.',
  'Show temperature, humidity and barometric pressure from a BME280 on the same screen.',
  'Convert PM2.5 to a plain-English verdict against the WHO guideline, with a colour.',
  'Draw a rolling chart of the last few hours so you can see events, not just the current number.',
  'Optionally publish everything to MQTT for Home Assistant.'
],

how: `
<p>Inside the <strong>PMS5003</strong> a small fan pulls air past a laser diode. Particles crossing the beam
scatter light onto a photodiode, and the size and shape of each pulse tells the onboard processor how big that
particle was. It bins them and reports mass concentrations for three size classes.</p>
<p>It talks over a plain <strong>9600 baud serial</strong> link, unprompted, about once a second, in 32-byte
frames that start with the bytes <code>0x42 0x4D</code>. Each frame ends with a checksum - the sum of the
preceding 30 bytes. Checking it is not optional: a frame read slightly out of sync produces numbers that look
plausible and are nonsense.</p>
<p><strong>PM2.5</strong> means particles under 2.5&nbsp;&micro;m, which is the size that gets deep into lungs.
The WHO's 2021 guideline is an annual mean of 5&nbsp;&micro;g/m&sup3; and a 24-hour mean of 15 - much stricter
than most national standards, and worth knowing when your monitor reads 20 and a cheap app calls that
"good".</p>
<p><strong>Why an ESP32</strong>: the Uno has one hardware serial port and it is wired to the USB connection.
You can use SoftwareSerial at 9600 and it works, but the ESP32 has three real UARTs and enough RAM to keep a
chart history, so it is the better fit.</p>`,

bom: [
  { id: 'esp32', qty: 1 },
  { id: 'pms5003', qty: 1, note: 'Comes with a short ribbon and a breakout connector. Check the listing includes the adapter cable - some do not.' },
  { id: 'bme280', qty: 1, note: 'The 4-pin I2C version. Check it is a BME and not a BMP - the BMP has no humidity.' },
  { id: 'tft18', qty: 1, note: 'ST7735 1.8 inch, 128x160, SPI.' },
  { id: 'psu5v3a', qty: 1, note: 'The fan and laser need a real 5 V. This is not a USB-port project.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'cap1000', qty: 1, own: true },
  { id: 'box-abs', qty: 1, note: 'Needs two large openings for the sensor inlet and outlet, and they must not be next to each other.' },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'esp', comp: 'esp32',  at: [0, 0] },
    { id: 'pms', comp: 'block',  at: [-62, -48], opt: { w: 50, h: 22, d: 38, c: '#3a4148' }, label: 'PMS5003 particle sensor' },
    { id: 'bme', comp: 'bme280', at: [30, -44], ry: 180 },
    { id: 'tft', comp: 'tft18',  at: [4, 72], ry: 180 }
  ],
  wires: [
    { from: 'pms.r',   to: 'esp.VIN',   color: 'red',    note: '5 V. The fan and the laser will not run on 3.3 V' },
    { from: 'pms.n',   to: 'esp.GND',   color: 'black',  note: 'Ground' },
    { from: 'pms.f',   to: 'esp.D16',   color: 'blue',   note: 'Sensor TX to ESP32 RX2. Its output is 3.3 V logic already' },
    { from: 'bme.VIN', to: 'esp.3V3',   color: 'red',    note: 'BME280 power' },
    { from: 'bme.GND', to: 'esp.GND2',  color: 'black',  note: 'Ground' },
    { from: 'bme.SCL', to: 'esp.D22',   color: 'green',  note: 'I2C clock - the ESP32 default SCL' },
    { from: 'bme.SDA', to: 'esp.D21',   color: 'yellow', note: 'I2C data - the ESP32 default SDA' },
    { from: 'tft.VCC', to: 'esp.3V3',   color: 'red',    note: 'Display power' },
    { from: 'tft.GND', to: 'esp.GND2',  color: 'black',  note: 'Display ground' },
    { from: 'tft.SCK', to: 'esp.D18',   color: 'green',  note: 'SPI clock' },
    { from: 'tft.SDA', to: 'esp.D23',   color: 'orange', note: 'SPI data in (MOSI)' },
    { from: 'tft.CS',  to: 'esp.D5',    color: 'purple', note: 'Chip select' },
    { from: 'tft.DC',  to: 'esp.D2',    color: 'white',  note: 'Data/command select' },
    { from: 'tft.RESET', to: 'esp.D4',  color: 'grey',   note: 'Display reset' },
    { from: 'tft.LED', to: 'esp.3V3',   color: 'red',    note: 'Backlight, always on. Move to a PWM pin to dim it' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">The PMS5003 needs 5 V power and speaks 3.3 V logic</span>
<p>An awkward but convenient combination: feed <strong>VCC</strong> from 5&nbsp;V (the fan will not spin
otherwise) while its TX pin swings only to 3.3&nbsp;V, so it connects straight to an ESP32 input with no level
shifter. Do not connect the ESP32's TX to the sensor's RX unless you intend to send it sleep commands - and
if you do, that direction <em>does</em> need thought.</p></div>

<div class="note tip"><span class="t">The ribbon connector pinout</span>
<p>Pin 1 is marked on the sensor body. In order: <code>VCC, VCC, GND, GND, RESET, NC, SET, NC, TX, RX</code>.
The adapter cable usually breaks out only VCC, GND, TX and RX, which is all this project uses. If your cable
has RESET and SET, leave both unconnected - they idle high internally.</p></div>

<div class="note warn"><span class="t">Two openings, far apart</span>
<p>The sensor draws air in one side and blows it out the other. If your enclosure lets the outlet air reach the
inlet, the sensor measures its own exhaust and the readings collapse to near zero. Put the inlet and outlet on
different faces of the box, and never block either.</p></div>`,

solderSteps: [
  { h: 'Sockets for everything',
    body: `<p>Two 15-pin strips for the ESP32, a 4-pin for the BME280, an 8-pin for the display. All four modules
    are worth keeping removable.</p>
    <p>Tack the end pin of each strip, check square from the side, complete. Do the ESP32's two strips using the
    board itself as the spacer or they will not line up.</p>` },
  { h: 'Mount the display so it faces out',
    body: `<p>Decide now whether the screen is on the same board as everything else or on flying leads. Flying
    leads make the box far easier - eight wires of 150&nbsp;mm, twisted into a loom, and the display screwed to
    the lid.</p>
    <p>SPI at the speeds this display runs is tolerant of that. Keep the loom under 200&nbsp;mm.</p>` },
  { h: 'Power bus first',
    body: `<p>5&nbsp;V from the input terminal to the ESP32 VIN and to the sensor's VCC. 3.3&nbsp;V from the
    ESP32's 3V3 pin to the BME280 and the display. Ground everywhere, run as a single bus down the board edge.</p>
    <p>Solder the 1000&nbsp;&micro;F across the 5&nbsp;V input - the fan starting is a real step load.</p>` },
  { h: 'Then the signal wires, one at a time',
    body: `<p>Fifteen connections is enough to lose track of. Do one wire, tick it off the table above, do the
    next. Solid core, bent flat.</p>` },
  { h: 'Check before power',
    body: `<p>5&nbsp;V to GND: no beep. 3.3&nbsp;V to GND: no beep. 5&nbsp;V to 3.3&nbsp;V: no beep. Then each
    signal pin to its destination: beep.</p>` }
],

assembly: [
  { h: 'Test the sensor alone first',
    body: `<p>Upload the raw frame dumper below with only the PMS5003 connected. You should see numbers within
    ten seconds of power-up, and the fan is audible if you hold it to your ear.</p>` },
  { h: 'Add the BME280 and find its address',
    body: `<p>Run an I2C scanner. It will be <code>0x76</code> or <code>0x77</code> - both are common, and the
    sketch has a constant for it.</p>` },
  { h: 'Then the display',
    body: `<p>If the colours look wrong or there is a coloured border, that is a panel variant - see
    calibration.</p>` },
  { h: 'Let it run for 30 minutes before judging it',
    body: `<p>The sensor is stable within a minute, but your <em>expectations</em> are not. Watch what the number
    does when nothing is happening, so you have a baseline before you start interpreting events.</p>` },
  { h: 'Box it with the airflow in mind',
    body: `<p>Inlet on one face, outlet on another, neither obstructed and neither pointed at a wall. Do not
    mount it in a corner, over a radiator, or next to a window.</p>` }
],

libraries: [
  { name: 'Adafruit BME280 Library', by: 'Adafruit', why: 'Temperature, humidity and pressure.' },
  { name: 'Adafruit Unified Sensor', by: 'Adafruit', why: 'Dependency of the above.' },
  { name: 'Adafruit ST7735 and ST7789 Library', by: 'Adafruit', why: 'The colour display.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Drawing primitives and fonts.' }
],

code: [
{
  h: 'First: prove the particle sensor is talking',
  name: 'pms_dump.ino',
  code: `/* Reads PMS5003 frames on Serial2 and prints them.
   ESP32: RX2 is GPIO 16. Connect the sensor's TX there. */

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);   // RX=16, TX=17
  Serial.println("Waiting for frames (up to 10 s while the fan spins up)...");
}

void loop() {
  static uint8_t buf[32];
  static int n = 0;

  while (Serial2.available()) {
    uint8_t b = Serial2.read();

    // frames always start 0x42 0x4D - resynchronise on that
    if (n == 0 && b != 0x42) continue;
    if (n == 1 && b != 0x4D) { n = 0; continue; }

    buf[n++] = b;
    if (n < 32) continue;
    n = 0;

    uint16_t sum = 0;
    for (int i = 0; i < 30; i++) sum += buf[i];
    uint16_t given = (buf[30] << 8) | buf[31];
    if (sum != given) { Serial.println("checksum failed"); continue; }

    uint16_t pm1  = (buf[10] << 8) | buf[11];
    uint16_t pm25 = (buf[12] << 8) | buf[13];
    uint16_t pm10 = (buf[14] << 8) | buf[15];

    Serial.printf("PM1.0 %3u   PM2.5 %3u   PM10 %3u  ug/m3\\n", pm1, pm25, pm10);
  }
}`,
  after: `<p>Bytes 10-15 are the "atmospheric environment" values, which is what you want indoors. Bytes 4-9 are
  the factory calibration values measured in a standard particle chamber; they usually read the same or slightly
  higher and are not the ones to quote.</p>`
},
{
  h: 'The monitor',
  name: 'air_quality_monitor.ino',
  code: `/* ------------------------------------------------------------------
   Indoor air quality monitor
   PMS5003 on Serial2 (RX 16), BME280 on I2C, ST7735 TFT on SPI.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <Adafruit_BME280.h>

// ---- pins ------------------------------------------------------------
#define TFT_CS    5
#define TFT_DC    2
#define TFT_RST   4
#define PMS_RX   16
#define BME_ADDR 0x76        // or 0x77 - run an I2C scanner

Adafruit_ST7735 tft(TFT_CS, TFT_DC, TFT_RST);
Adafruit_BME280 bme;

bool haveBme = false;

uint16_t pm1 = 0, pm25 = 0, pm10 = 0;
float tempC = 0, humid = 0, hPa = 0;

// rolling history for the chart: one sample a minute
#define HIST 100
uint8_t hist[HIST];
int histCount = 0;
unsigned long lastHist = 0, lastEnv = 0, lastDraw = 0;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, PMS_RX, 17);

  tft.initR(INITR_BLACKTAB);     // try INITR_GREENTAB if you get a border
  tft.setRotation(1);            // 160x128 landscape
  tft.fillScreen(ST77XX_BLACK);
  tft.setTextColor(ST77XX_WHITE);
  tft.setCursor(8, 56);
  tft.print("warming up...");

  haveBme = bme.begin(BME_ADDR);
  if (!haveBme) Serial.println("No BME280 - carrying on without it");
}

void loop() {
  readPms();

  if (haveBme && millis() - lastEnv > 4000) {
    lastEnv = millis();
    tempC = bme.readTemperature();
    humid = bme.readHumidity();
    hPa   = bme.readPressure() / 100.0F;
  }

  if (millis() - lastHist > 60000UL) {
    lastHist = millis();
    pushHistory(pm25);
  }

  if (millis() - lastDraw > 1000) {
    lastDraw = millis();
    draw();
  }
}

/* --- the sensor ------------------------------------------------------- */
void readPms() {
  static uint8_t buf[32];
  static int n = 0;

  while (Serial2.available()) {
    uint8_t b = Serial2.read();
    if (n == 0 && b != 0x42) continue;
    if (n == 1 && b != 0x4D) { n = 0; continue; }
    buf[n++] = b;
    if (n < 32) continue;
    n = 0;

    uint16_t sum = 0;
    for (int i = 0; i < 30; i++) sum += buf[i];
    if (sum != (uint16_t)((buf[30] << 8) | buf[31])) continue;

    pm1  = (buf[10] << 8) | buf[11];
    pm25 = (buf[12] << 8) | buf[13];
    pm10 = (buf[14] << 8) | buf[15];
  }
}

void pushHistory(uint16_t v) {
  if (histCount < HIST) {
    hist[histCount++] = min((uint16_t)255, v);
  } else {
    memmove(hist, hist + 1, HIST - 1);
    hist[HIST - 1] = min((uint16_t)255, v);
  }
}

/* --- verdict against the WHO 24-hour guideline of 15 ug/m3 ------------ */
const char* verdict(uint16_t v) {
  if (v <= 5)   return "EXCELLENT";
  if (v <= 15)  return "GOOD";
  if (v <= 35)  return "MODERATE";
  if (v <= 55)  return "POOR";
  if (v <= 150) return "BAD";
  return "VERY BAD";
}

uint16_t verdictColour(uint16_t v) {
  if (v <= 5)   return ST77XX_GREEN;
  if (v <= 15)  return ST77XX_GREEN;
  if (v <= 35)  return ST77XX_YELLOW;
  if (v <= 55)  return ST77XX_ORANGE;
  if (v <= 150) return ST77XX_RED;
  return ST77XX_MAGENTA;
}

/* --- the screen ------------------------------------------------------- */
void draw() {
  tft.fillScreen(ST77XX_BLACK);

  // big PM2.5 number
  tft.setTextColor(verdictColour(pm25));
  tft.setTextSize(4);
  tft.setCursor(4, 4);
  tft.print(pm25);
  tft.setTextSize(1);
  tft.print(" ug/m3");

  tft.setCursor(4, 36);
  tft.print(verdict(pm25));

  // the other two sizes
  tft.setTextColor(ST77XX_WHITE);
  tft.setTextSize(1);
  tft.setCursor(100, 8);
  tft.print("PM1 ");
  tft.print(pm1);
  tft.setCursor(100, 20);
  tft.print("PM10 ");
  tft.print(pm10);

  // environment line
  if (haveBme) {
    tft.setCursor(4, 50);
    tft.print(tempC, 1);
    tft.print("C  ");
    tft.print(humid, 0);
    tft.print("%  ");
    tft.print(hPa, 0);
    tft.print("hPa");
  }

  drawChart(4, 64, 152, 56);
}

void drawChart(int x, int y, int w, int h) {
  tft.drawRect(x, y, w, h, 0x39E7);           // mid grey

  // a line at the WHO 24-hour guideline, so the chart has a reference
  int guideY = y + h - map(min(15, 60), 0, 60, 0, h - 2) - 1;
  for (int i = x + 2; i < x + w - 2; i += 4) tft.drawPixel(i, guideY, 0x7BEF);

  if (histCount < 2) return;

  int step = max(1, HIST / (w - 4));
  for (int i = 1; i < histCount; i++) {
    int x0 = x + 2 + (i - 1) * (w - 4) / HIST;
    int x1 = x + 2 + i * (w - 4) / HIST;
    int y0 = y + h - 2 - map(min(hist[i - 1], (uint8_t)60), 0, 60, 0, h - 4);
    int y1 = y + h - 2 - map(min(hist[i],     (uint8_t)60), 0, 60, 0, h - 4);
    tft.drawLine(x0, y0, x1, y1, verdictColour(hist[i]));
  }
  (void)step;
}`,
  after: `<p>The chart is clipped at 60&nbsp;&micro;g/m&sup3; on purpose. Cooking spikes reach 300 and would
  flatten everything else into a line along the bottom; the interesting information is in the 0-60 range where
  you actually live.</p>`
}],

upload: `
<p>Board: ESP32 Dev Module. Upload, then open the Serial Monitor at 115200 - the sketch prints nothing much,
but the absence of boot-loop messages is what you are checking for.</p>
<p>The fan takes a few seconds to come up to speed and the first frames appear about ten seconds after power.</p>`,

tune: [
  { h: 'Fix the display variant',
    body: `<p><code>initR(INITR_BLACKTAB)</code> suits most 1.8&nbsp;inch red-PCB modules. If you get a
    coloured border or a 2-pixel offset, try <code>INITR_GREENTAB</code> or <code>INITR_REDTAB</code>. If the
    colours are inverted, add <code>tft.invertDisplay(true)</code>.</p>` },
  { h: 'Sanity-check the sensor against something',
    body: `<p>Light a match near it - PM2.5 should shoot up in seconds. Open a window on a still day in a clean
    area and it should settle to single figures. If it reads zero always, it is not reading frames; if it reads
    hundreds always, check the airflow is not recirculating.</p>` },
  { h: 'Understand the humidity artefact',
    body: `<p>Optical particle counters over-read in high humidity, because water condenses onto particles and
    they scatter more light. Above about 70&nbsp;% RH treat the numbers as indicative. That is also why having
    the BME280 on the same screen is useful rather than decorative.</p>` },
  { h: 'Make it last',
    body: `<p>The fan and laser are rated for about 8,000 hours of continuous running - under a year. If you
    want this permanently installed, use the SET pin to sleep the sensor between measurements: run it for 30
    seconds every 5 minutes and it lasts a decade.</p>` },
  { h: 'Add MQTT',
    body: `<p>Six lines using PubSubClient, exactly as in the <a href="project.html?p=smart-plug-relay">Wi-Fi
    switch</a>. Publish <code>home/air/pm25</code> and friends every minute. Home Assistant has a native
    <code>pm25</code> device class that charts it properly.</p>` }
],

trouble: [
  { q: 'No frames at all',
    a: `TX and RX crossed, or the sensor is on 3.3&nbsp;V. Hold it to your ear - if the fan is not running, it
    is a power problem. Then confirm the sensor's TX goes to GPIO 16, not the other way round.` },
  { q: '<code>checksum failed</code> repeatedly',
    a: `Baud rate wrong (it is always 9600), or a noisy long cable. Shorten the lead and twist TX with GND.` },
  { q: 'Reads 0 for everything, fan running',
    a: `Almost always recirculation - the outlet is feeding the inlet. Take it out of the box and see if the
    numbers come alive.` },
  { q: 'Screen stays white or black',
    a: `Wrong <code>initR</code> tab, or the reset pin is not connected. White usually means the controller
    never got initialised; check CS, DC and RST.` },
  { q: 'BME280 not found',
    a: `Address is 0x77 rather than 0x76. Run an I2C scanner and change <code>BME_ADDR</code>. If nothing
    answers, check you have it on 3.3&nbsp;V and on GPIO 21/22.` },
  { q: 'Temperature reads 2-3 degrees high',
    a: `The BME280 is sitting in the warm air of your own electronics. Move it to the other end of the box, or
    onto flying leads outside it. This is a real and very common error.` },
  { q: 'Numbers jump around by 50 %',
    a: `Normal at low concentrations - the sensor is counting discrete particles and at 3&nbsp;&micro;g/m&sup3;
    there are not many. Average over 30 seconds before drawing conclusions.` }
],

next: `
<ul>
  <li><strong>Log to an SD card</strong> and chart a month. The weekly rhythm of a household is very visible.</li>
  <li><strong>Add a CO2 sensor</strong> - an SCD40 is true NDIR CO2 for about $25 and tells you about
  ventilation, which particulates do not.</li>
  <li><strong>Trigger something.</strong> A relay and an air purifier, switched when PM2.5 goes over 25 and
  switched off twenty minutes after it drops below 10.</li>
  <li><strong>Put it outside</strong> in a weatherproof housing and compare with your nearest public monitor -
  most countries publish station data you can chart alongside yours.</li>
</ul>`
});
