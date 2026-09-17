/* Watching dough rise with a laser. Slow data, and the derivative is the answer. */
AB.addProject({
slug: 'fermentation-monitor',
title: 'Sourdough and fermentation monitor',
cat: 'kitchen',
level: 2,
time: '4 hours',
solder: false,
board: 'ESP32',
tags: ['sourdough', 'fermentation', 'vl53l0x', 'time of flight', 'esp32', 'logging', 'derivative', 'q10'],
blurb: 'A laser rangefinder over a jar of starter, measuring the rise to the millimetre. It tells you when the dough is ready - which is a question about the shape of a curve, not about how many hours have passed.',

skills: ['Time-of-flight ranging', 'Logging slow data', 'Finding a peak in real time', 'Temperature coefficients', 'Baselining', 'Web serving from a microcontroller'],

intro: `
<p>Every sourdough recipe says "prove for four to six hours". The range is that wide because the real answer
depends on temperature, on how active the starter is and on the flour, and four hours in a warm kitchen is a
very different thing from four hours in a cold one.</p>
<p>The bakers' answer is to watch the dough rather than the clock: it is ready when it has roughly doubled and
the rise is slowing. That is a measurement, and a $3 laser rangefinder makes it an easy one.</p>
<p>What is interesting here is that the useful signal is not the height. It is the <strong>rate of change of
the height</strong>, and specifically the moment that rate starts falling - because that is the peak, and past
the peak the structure is already collapsing.</p>`,

what: [
  'Measure the height of a starter or dough to about a millimetre, every minute.',
  'Track temperature and humidity, which is what sets the speed of everything.',
  'Report rise as a percentage of the starting height, which is what recipes actually mean.',
  'Detect the peak as it happens, rather than showing you afterwards that you missed it.',
  'Serve a chart from the board, so you can check on it from a phone without any cloud service.'
],

how: `
<p><strong>Time-of-flight, not ultrasound.</strong> A VL53L0X fires an infrared laser and times the return.
Over 3-15&nbsp;cm it is accurate to a couple of millimetres, it has a narrow field of view, and it is
unaffected by the humidity inside a covered jar - all of which ultrasound is not. An HC-SR04 has a 30-degree
cone that will see the jar walls, and its speed-of-sound calculation changes with temperature and humidity,
which is exactly the environment you are measuring in.</p>

<p><strong>Measure downward from a fixed point.</strong> The sensor looks down from the lid. Distance to the
dough <em>decreases</em> as it rises, so height is <code>sensorToBase - reading</code>. Fixing the sensor
rigidly matters more than sensor accuracy - if the lid can shift by 5&nbsp;mm, nothing else you do will
help.</p>

<p><strong>The surface is awkward.</strong> Dough is matte and pale, which is fine, but it is not flat - it
domes, and bubbles break on the surface. Single readings jump by several millimetres.</p>
<p>Take a burst of about ten readings, use the <strong>median</strong> rather than the mean, and average that
over a minute. The median matters: a bubble bursting gives one wild reading, and a median ignores it entirely
while a mean does not.</p>

<p><strong>Finding the peak in real time is the interesting bit.</strong> In hindsight the peak is obvious. As
it happens you have a noisy rising curve and have to decide whether the last three flat readings are the top or
a pause.</p>
<p>What works: fit a slope over the last 30 minutes, and declare the peak when that slope has been below about
10% of its maximum value for three consecutive windows. Requiring persistence is what prevents calling the peak
during a normal plateau early on.</p>

<p><strong>Temperature sets everything.</strong> Fermentation roughly follows a Q10 of about 2 over normal
kitchen temperatures - every 10&nbsp;degrees warmer roughly doubles the rate. A starter that peaks in 4 hours
at 26&nbsp;degrees takes 8 at 16.</p>
<p>So logging temperature alongside height is not decoration. It is what lets you predict tonight's timing from
last week's data, and it is why "four hours" was never going to work.</p>

<p><strong>Slow data is easy data.</strong> One sample a minute is 1,440 a day. Two days of height, temperature
and humidity fits comfortably in the ESP32's RAM with no SD card and no database - and it can serve its own
chart as a single HTML page.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Wi-Fi to serve the chart, and enough RAM to hold two days of samples without any storage.' },
  { id: 'vl53l0x', qty: 1, note: 'The rangefinder. A narrow beam and immune to humidity, both of which matter inside a covered jar.' },
  { id: 'bme280', qty: 1, note: 'Temperature and humidity. Temperature is the important one - it sets the speed of the whole process.' },
  { id: 'oled13', qty: 1, note: 'Height, rise percentage and temperature at the jar.' },
  { id: 'bb-400', qty: 1 },
  { id: 'psu5v3a', qty: 1, note: 'It runs for days at a time.' },
  { id: 'standoffs', qty: 1, note: 'To build the rigid bracket that holds the sensor over the jar. Rigidity is the whole measurement.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',   at: [0, 64] },
    { id: 'bb',   comp: 'bb400',   at: [0, 0] },
    { id: 'tof',  comp: 'vl53l0x', at: [-56, -54] },
    { id: 'env',  comp: 'bme280',  at: [-6, -56] },
    { id: 'oled', comp: 'oled13',  at: [48, -54] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail - all three sensors are 3.3 V parts' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'tof.VIN',  to: 'bb.T+5',  color: 'red',    note: 'Rangefinder power' },
    { from: 'tof.GND',  to: 'bb.T-5',  color: 'black',  note: 'Rangefinder ground' },
    { from: 'tof.SDA',  to: 'mcu.D21', color: 'green',  note: 'I2C data - all three devices share this bus' },
    { from: 'tof.SCL',  to: 'mcu.D22', color: 'blue',   note: 'I2C clock' },
    { from: 'env.VIN',  to: 'bb.T+11', color: 'red',    note: 'BME280 power' },
    { from: 'env.GND',  to: 'bb.T-11', color: 'black',  note: 'BME280 ground' },
    { from: 'env.SDA',  to: 'mcu.D21', color: 'green',  note: 'Same I2C bus, different address' },
    { from: 'env.SCL',  to: 'mcu.D22', color: 'blue',   note: 'Same clock' },
    { from: 'oled.VCC', to: 'bb.T+17', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-17', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21', color: 'green',  note: 'Same bus again' },
    { from: 'oled.SCL', to: 'mcu.D22', color: 'blue',   note: 'Same clock' }
  ]
},

wireIntro: `<p>Three devices on one I2C bus and nothing else. No soldering at all - the difficulty in this
project is entirely mechanical and entirely about holding the sensor still.</p>`,

wireNotes: `
<div class="note warn"><span class="t">The bracket is the measurement</span>
<p>Everything is measured relative to where the sensor is. If the bracket flexes, or the jar can slide under
it, or the lid is placed slightly differently each time, your millimetre-accurate sensor produces
centimetre-accurate results.</p>
<p>Build something rigid that locates the jar positively - a hole in a board that the jar sits in, with the
sensor on a fixed arm above.</p></div>

<div class="note tip"><span class="t">Three devices, three addresses</span>
<p>VL53L0X at 0x29, BME280 at 0x76 or 0x77, SSD1306 at 0x3C. No conflicts. Run an I2C scanner first and confirm
you see all three before writing any logic - it takes two minutes and saves an hour.</p></div>

<div class="note"><span class="t">Condensation on the sensor</span>
<p>A covered jar of fermenting dough is at 100% humidity, and the sensor window will fog. A small piece of
clear acrylic angled slightly, or simply leaving the cover not quite sealed, avoids it. A fogged sensor reads
short and looks exactly like a dough that rose suddenly.</p></div>`,

assembly: [
  { h: 'Scan the bus first',
    body: `<p>Run an I2C scanner and confirm three addresses. If the BME280 is missing, it is at 0x77 rather
    than 0x76 - both are common and the library defaults to one of them.</p>` },
  { h: 'Build the bracket, then measure the empty jar',
    body: `<p>With the jar in place and empty, record the distance to its base. That number is the reference for
    every height calculation, so write it on the bracket.</p>
    <p>Re-measure whenever you change jars. A different jar is a different baseline.</p>` },
  { h: 'Check the sensor against a ruler',
    body: `<p>Put a flat card at 50&nbsp;mm and confirm the reading. VL53L0X modules are accurate but not
    perfectly calibrated, and a consistent few-millimetre offset is worth knowing about rather than
    discovering later.</p>` },
  { h: 'Mark the start height, not the start time',
    body: `<p>Press the button when the dough goes in. The percentage rise is relative to that moment, and it is
    the number recipes mean when they say "doubled".</p>` },
  { h: 'Run it through one full cycle before trusting it',
    body: `<p>Let a starter go from feed to peak to collapse while logging. That single curve teaches you more
    about your own starter than any recipe, and it is how you find out whether the peak detection thresholds
    suit it.</p>` }
],

libraries: [
  { name: 'Adafruit VL53L0X', by: 'Adafruit', why: 'The rangefinder.' },
  { name: 'Adafruit BME280', by: 'Adafruit', why: 'Temperature and humidity.' },
  { name: 'U8g2', by: 'oliver', why: 'The display.' },
  { name: 'WebServer', by: 'Espressif (built in)', why: 'Serves the chart. No install needed.' }
],

code: [{
  name: 'fermentation_monitor.ino',
  code: `/* ------------------------------------------------------------------
   Sourdough monitor - ESP32, VL53L0X, BME280

   One sample a minute. Serves its own chart at the board's IP address.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Adafruit_VL53L0X.h>
#include <Adafruit_BME280.h>
#include <U8g2lib.h>

Adafruit_VL53L0X tof;
Adafruit_BME280 bme;
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);
WebServer server(80);

// Distance from the sensor to the base of the empty jar, in mm.
// Measure yours and put it here.
const float JAR_BASE_MM = 180.0;

#define SLOTS 2880              // 48 hours at one a minute
float  hHist[SLOTS];
int8_t tHist[SLOTS];
int    nSamples = 0;
unsigned long lastSample = 0;

float startHeight = 0;
bool  peaked = false;
float maxSlope = 0;
int   slowWindows = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  oled.begin();

  if (!tof.begin())            Serial.println("No VL53L0X");
  if (!bme.begin(0x76) && !bme.begin(0x77)) Serial.println("No BME280");

  WiFi.begin("your-network", "your-password");
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) delay(300);
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.begin();

  startHeight = measureHeight();
}

void loop() {
  server.handleClient();

  if (millis() - lastSample > 60000UL || nSamples == 0) {
    lastSample = millis();
    takeSample();
  }
  draw();
}

// ---- measurement -----------------------------------------------------
/* Median of a burst, not the mean. A bubble bursting on the surface
   gives one wild reading; a median ignores it completely and a mean
   does not. */
float measureHeight() {
  const int N = 11;
  float r[N];

  for (int i = 0; i < N; i++) {
    VL53L0X_RangingMeasurementData_t m;
    tof.rangingTest(&m, false);
    r[i] = (m.RangeStatus != 4) ? m.RangeMilliMeter : NAN;
    delay(30);
  }

  // Sort, ignoring failed readings
  int n = 0;
  for (int i = 0; i < N; i++) if (!isnan(r[i])) r[n++] = r[i];
  if (n == 0) return NAN;
  for (int i = 1; i < n; i++) {
    float k = r[i]; int j = i - 1;
    while (j >= 0 && r[j] > k) { r[j + 1] = r[j]; j--; }
    r[j + 1] = k;
  }

  // Distance shrinks as the dough rises, so height is base minus reading.
  return JAR_BASE_MM - r[n / 2];
}

void takeSample() {
  float h = measureHeight();
  if (isnan(h)) return;

  if (nSamples < SLOTS) {
    hHist[nSamples] = h;
    tHist[nSamples] = (int8_t)round(bme.readTemperature());
    nSamples++;
  }
  checkForPeak();
}

/* Slope over the last 30 minutes. The peak is not the highest reading -
   by the time you know that, it has passed. It is the point where the
   rate of rise has collapsed, and requiring three consecutive slow
   windows stops a normal mid-rise plateau triggering it. */
void checkForPeak() {
  if (peaked || nSamples < 40) return;

  int w = 30;
  float slope = (hHist[nSamples - 1] - hHist[nSamples - 1 - w]) / (float)w;
  if (slope > maxSlope) maxSlope = slope;

  if (maxSlope > 0.05f && slope < maxSlope * 0.10f) {
    if (++slowWindows >= 3) {
      peaked = true;
      Serial.println("PEAK - use it now");
    }
  } else {
    slowWindows = 0;
  }
}

// ---- display ---------------------------------------------------------
void draw() {
  static unsigned long last = 0;
  if (millis() - last < 1000 || nSamples == 0) return;
  last = millis();

  float h = hHist[nSamples - 1];
  float rise = startHeight > 1 ? (h / startHeight) * 100.0f : 0;

  char line[24];
  oled.clearBuffer();

  oled.setFont(u8g2_font_helvB18_tr);
  snprintf(line, sizeof(line), "%.0f%%", rise);
  oled.drawStr(0, 24, line);

  oled.setFont(u8g2_font_6x10_tf);
  snprintf(line, sizeof(line), "%.0f mm  %.1fC", h, bme.readTemperature());
  oled.drawStr(0, 40, line);

  snprintf(line, sizeof(line), "%d h %d m", nSamples / 60, nSamples % 60);
  oled.drawStr(0, 52, line);

  oled.drawStr(0, 63, peaked ? "PEAKED - use now" : "rising");
  oled.sendBuffer();
}

// ---- web -------------------------------------------------------------
void handleData() {
  String s = "[";
  for (int i = 0; i < nSamples; i++) {
    if (i) s += ",";
    s += "[" + String(hHist[i], 1) + "," + String(tHist[i]) + "]";
  }
  s += "]";
  server.send(200, "application/json", s);
}

void handleRoot() {
  // Deliberately tiny: one canvas, one fetch, no libraries, no cloud.
  server.send(200, "text/html",
    "<!doctype html><meta name=viewport content='width=device-width'>"
    "<style>body{font:14px system-ui;margin:16px}canvas{width:100%;height:220px}</style>"
    "<h3>Fermentation</h3><canvas id=c></canvas><script>"
    "fetch('/data').then(r=>r.json()).then(d=>{"
    "const c=document.getElementById('c'),x=c.getContext('2d');"
    "c.width=c.clientWidth;c.height=220;"
    "const m=Math.max(...d.map(p=>p[0]))||1;"
    "x.beginPath();d.forEach((p,i)=>{"
    "const px=i/d.length*c.width,py=c.height-(p[0]/m)*c.height*0.9;"
    "i?x.lineTo(px,py):x.moveTo(px,py)});"
    "x.strokeStyle='#b4662b';x.lineWidth=2;x.stroke();});"
    "</script>");
}`
}],

trouble: [
  { q: 'Height readings jump around by a centimetre',
    a: `The bracket is moving, or the jar is. Everything is relative to the sensor position - fix that first
    and nothing else will matter.` },
  { q: 'Readings slowly drop while the dough is clearly rising',
    a: `Condensation on the sensor window. A fogged VL53L0X reads short, which looks like the dough getting
    closer. Ventilate slightly or shield the window.` },
  { q: 'Range status errors most of the time',
    a: `Too close. The VL53L0X has a minimum of about 3&nbsp;cm and reports an error below it. Raise the
    bracket.` },
  { q: 'It declares the peak an hour too early',
    a: `A plateau mid-rise. Increase the number of consecutive slow windows required, or widen the slope
    window from 30 minutes to 45.` },
  { q: 'It never declares a peak',
    a: `<code>maxSlope</code> never got above the 0.05 threshold, which means the rise was very slow - a cold
    kitchen or a sluggish starter. Lower the threshold, and check the temperature log.` },
  { q: 'BME280 not found',
    a: `It is at 0x77 rather than 0x76. The sketch tries both, but some clone modules use a chip that is
    actually a BMP280 with no humidity at all.` },
  { q: 'The web page is blank',
    a: `Fetch the <code>/data</code> endpoint directly in a browser. If that returns an empty array, no samples
    have been taken yet - the first is a minute after boot.` },
  { q: 'It reboots after a day or two',
    a: `Memory. 2,880 samples of a float and a byte is about 14&nbsp;KB and fine; building the JSON string as
    one big String is not. For long runs, stream it in chunks instead.` }
],

next: `
<ul>
  <li><strong>Predict the peak</strong> rather than announcing it. Once you have a few curves at different
  temperatures, a Q10 of about 2 lets you estimate the remaining time from the current temperature and how far
  along the curve you are.</li>
  <li><strong>Control the temperature</strong> instead of just measuring it - a seedling mat and the
  <a href="project.html?p=sous-vide-controller">PID controller</a> gives a proofing box that hits the same
  timing every day.</li>
  <li><strong>Notify a phone</strong> at the peak. This is the version that changes how you bake, because the
  peak often lands at 2 am.</li>
  <li><strong>Kombucha, yoghurt, beer</strong>. Different signals - pH, specific gravity, CO2 - but the same
  shape of problem: a slow curve where the derivative is the interesting part.</li>
</ul>`
});
