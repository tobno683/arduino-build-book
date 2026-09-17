/* A scale that has to be fast and accurate at once, which are opposites. */
AB.addProject({
slug: 'espresso-scale',
title: 'Espresso scale with flow rate',
cat: 'kitchen',
level: 2,
time: '5 hours',
solder: true,
board: 'ESP32',
tags: ['load cell', 'hx711', 'coffee', 'calibration', 'drift', 'filtering', 'latency', 'esp32'],
blurb: 'Weighs a shot to a tenth of a gram and shows how fast it is pouring. The engineering problem is that accuracy and speed pull in opposite directions, and espresso needs both.',

skills: ['Load cells and strain gauges', 'Two-point calibration', 'Drift and tare', 'Filtering vs latency', 'Derivatives from noisy data', 'Auto-start detection'],

intro: `
<p>Espresso is a ratio. Eighteen grams of coffee in, thirty-six grams out, in about thirty seconds. Miss any
of those and the shot is sour or bitter, and the only way to hit them is to weigh the cup while it fills.</p>
<p>Commercial coffee scales cost $70 to $150 and the good ones are good because of their software, not their
hardware. The load cell inside is the same $3 part you can buy.</p>
<p>What makes this more interesting than a kitchen scale is the conflict at the centre of it. To read a tenth
of a gram you must average away the noise, and averaging adds delay. To show a useful flow rate you need to
know what happened in the last quarter second. The whole project is finding a defensible place between
those.</p>`,

what: [
  'Weigh to 0.1 g, stably, without the last digit flickering.',
  'Show flow rate in grams per second, which is what tells you the grind is wrong.',
  'Start timing by itself when the first drop lands, so you are not fumbling for a button.',
  'Tare reliably, including the drift that appears when a hot cup sits on it.',
  'Calibrate properly, with a two-point calibration rather than one.'
],

how: `
<p><strong>A load cell is four resistors that barely change.</strong> Strain gauges bonded to a metal beam form
a Wheatstone bridge. Bend the beam and two gauges stretch while two compress, and the bridge goes very slightly
out of balance - about 1&nbsp;mV per volt of excitation at full load. At 5&nbsp;V excitation and 1&nbsp;kg that
is 5&nbsp;mV for the whole range, and a tenth of a gram is half a microvolt.</p>
<p>That is why the HX711 exists: a 24-bit converter with a built-in low-noise amplifier, made for exactly this
and nothing else.</p>

<p><strong>Use a 1 kg cell, not a 5 kg one.</strong> Resolution is a fraction of full scale, so the same
converter gives five times finer readings on a 1&nbsp;kg cell. A cup and a double shot is under 400&nbsp;g.
Fitting the range to the job is free accuracy.</p>

<p><strong>Two-point calibration, because zero is not free.</strong> One-point calibration assumes the reading
at no load is the true zero and scales from there. It is not - there is an offset from the cell's own weight and
the bridge's imbalance.</p>
<p>Read the raw value empty, read it with a known mass, and compute both the scale factor and the offset. A
200&nbsp;g calibration weight costs a few dollars; a well-known alternative is that a European 2-euro coin is
8.5&nbsp;g and a US nickel is exactly 5.000&nbsp;g by mint specification.</p>

<p><strong>Filtering against latency, which is the real design decision.</strong> The HX711 gives 10 or
80&nbsp;samples per second. Raw, the last digit dances by several tenths. Average 16 samples at 80&nbsp;Hz and
it is rock steady - but now it is 200&nbsp;ms behind, and at 2&nbsp;g/s that is 0.4&nbsp;g of error at the
moment you need to stop the pour.</p>
<p>The answer is two filters from the same data. A heavily smoothed one for the displayed weight, where
stability matters and a fifth of a second does not. A lightly smoothed one for flow rate and for the stop
trigger, where responsiveness matters more than the last digit.</p>

<p><strong>Flow rate is a derivative, and derivatives amplify noise.</strong> Subtracting two consecutive
readings gives a wildly jumping number. Instead fit a slope over a window of about half a second - least
squares over the last dozen samples - which is enormously more stable for very little work.</p>

<p><strong>Drift is mostly thermal.</strong> A hot portafilter or cup warms the beam, the metal expands, and
the reading wanders by a gram over a minute. Good cells are temperature compensated; cheap ones are not.</p>
<p>Practical answer: re-tare immediately before each shot, and treat a slow drift with nothing on the scale as
a signal to tare again rather than something to correct.</p>`,

bom: [
  { id: 'loadcell1k', qty: 1, note: '1 kg with its HX711. The 5 kg cell used elsewhere in this book is the wrong choice here - see the write-up.' },
  { id: 'esp32', qty: 1, note: 'Fast enough that the filtering costs nothing, and Wi-Fi if you want to log shots.' },
  { id: 'oled13b', qty: 1, note: '1.3 inch. The weight needs to be readable at a glance while your hands are busy.' },
  { id: 'button', qty: 2, note: 'Tare and timer reset.' },
  { id: 'tp4056', qty: 1, note: 'Charging, so it lives on the counter without a cable.' },
  { id: 'lipo2000', qty: 1, note: 'It idles at a few milliamps between shots.' },
  { id: 'box-abs', qty: 1, note: 'It gets wet. Recessed buttons and a lid that actually closes.' },
  { id: 'standoffs', qty: 1, note: 'The cell must be bolted at one end and loaded at the other - see the assembly notes.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',    at: [0, 70] },
    { id: 'bb',   comp: 'bb400',    at: [0, 8] },
    { id: 'hx',   comp: 'hx711',    at: [-56, -44] },
    { id: 'cell', comp: 'loadcell', at: [-56, -84] },
    { id: 'oled', comp: 'oled13b',  at: [30, -50] },
    { id: 'b1',   comp: 'button',   at: [66, -20] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'hx.VCC',   to: 'bb.T+5',  color: 'red',    note: 'HX711 power - from the same clean 3.3 V as everything else' },
    { from: 'hx.GND',   to: 'bb.T-5',  color: 'black',  note: 'HX711 ground' },
    { from: 'hx.DT',    to: 'mcu.D16', color: 'green',  note: 'HX711 data' },
    { from: 'hx.SCK',   to: 'mcu.D4',  color: 'blue',   note: 'HX711 clock' },
    { from: 'cell.RED', to: 'hx.E+',   color: 'red',    note: 'Bridge excitation +' },
    { from: 'cell.BLK', to: 'hx.E-',   color: 'black',  note: 'Bridge excitation -' },
    { from: 'cell.WHT', to: 'hx.A-',   color: 'white',  note: 'Bridge signal -' },
    { from: 'cell.GRN', to: 'hx.A+',   color: 'green',  note: 'Bridge signal +' },
    { from: 'oled.VCC', to: 'bb.T+12', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-12', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'oled.SCL', to: 'mcu.D22', color: 'blue',   note: 'I2C clock' },
    { from: 'b1.1A',    to: 'mcu.D15', color: 'yellow', note: 'Tare button, internal pull-up' },
    { from: 'b1.2A',    to: 'bb.T-18', color: 'black',  note: 'Button to ground' }
  ]
},

wireIntro: `<p>Four wires from the cell to the HX711 in a fixed colour order, two wires from the HX711 to the
board, and the display. The cell's colours are a standard - red and black are excitation, white and green are
signal.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Swapped signal wires read backwards</span>
<p>Get white and green the wrong way round and the scale counts down as you add weight. It is harmless and
instantly obvious - swap them, or negate in software if they are already soldered.</p>
<p>Swapping red and black is different: that reverses the bridge excitation and gives nonsense. Check those
twice.</p></div>

<div class="note tip"><span class="t">Keep the cell wires short and away from the display</span>
<p>The signal is microvolts. The I2C lines to the display are switching at 400&nbsp;kHz a few centimetres
away. Keep them apart, keep the cell wires short, and twist the signal pair if you can.</p>
<p>A scale whose reading jumps only while the display refreshes is exactly this problem.</p></div>

<div class="note"><span class="t">80 Hz, not 10</span>
<p>The HX711 has a rate pin. Tied low it runs at 10&nbsp;samples per second, which is too slow to filter well
and still respond quickly. Many breakout boards have a solder jumper for 80&nbsp;Hz - use it.</p></div>`,

solderIntro: `<p>The mechanical part matters more than the soldering. A load cell measures the bending of its
beam, so how it is mounted determines whether it measures weight or your enclosure flexing.</p>`,

solderSteps: [
  { h: 'Mount the cell properly - this is the whole build',
    body: `<p>A bar load cell is bolted rigidly at one end to the base, and the platform is bolted to the
    <strong>other</strong> end only. The middle must touch nothing. The arrow on the side shows the direction
    of load.</p>
    <p>If both ends are fixed, or the platform touches the case anywhere, the beam cannot bend freely and the
    readings will be nonlinear and unrepeatable. Almost every bad load cell build is this mistake.</p>` },
  { h: 'Spacers at both ends',
    body: `<p>The cell needs clearance to flex. Washers or printed spacers at each mounting point, a millimetre
    or two, so the beam is suspended between its two fixings.</p>` },
  { h: 'Solder the four cell wires with the colours written down',
    body: `<p>Red E+, black E-, white A-, green A+. Some cells use yellow for a shield - connect that to ground
    at the HX711 end only, not both.</p>` },
  { h: 'HX711 close to the cell, not close to the ESP32',
    body: `<p>The microvolt side should be short and the digital side can be long. Mount the HX711 within a
    few centimetres of the cell and run the two digital wires to the board.</p>` },
  { h: 'Waterproof the top',
    body: `<p>Coffee gets everywhere. A silicone mat over the platform, buttons recessed, and no opening on the
    top face. Charge through a port on the side or underneath.</p>` }
],

libraries: [
  { name: 'HX711', by: 'Bogdan Necula', why: 'Reliable driver with a straightforward tare and scale API.' },
  { name: 'U8g2', by: 'oliver', why: 'Display, with a font large enough to read while pulling a shot.' }
],

code: [{
  name: 'espresso_scale.ino',
  code: `/* ------------------------------------------------------------------
   Espresso scale - ESP32 + HX711 + 1 kg load cell

   Two filters from one data stream: a slow one for the number you read,
   a fast one for flow rate and the stop trigger.
   ------------------------------------------------------------------ */

#include <HX711.h>
#include <U8g2lib.h>

#define DT_PIN   16
#define SCK_PIN  4
#define TARE_BTN 15

HX711 cell;
U8G2_SH1106_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);

/* From your own two-point calibration. Do NOT use these numbers - every
   cell differs by several percent. See calibrate(). */
float scaleFactor = 419.8f;
long  zeroOffset  = 0;

// Two smoothed views of the same signal.
float slowWeight = 0;      // what the display shows: stable
float fastWeight = 0;      // what flow rate uses: responsive

const float SLOW_ALPHA = 0.10f;
const float FAST_ALPHA = 0.45f;

#define HIST 12
float  histW[HIST];
unsigned long histT[HIST];
int histIdx = 0;

bool timing = false;
unsigned long startMs = 0;
float startWeight = 0;

void setup() {
  Serial.begin(115200);
  pinMode(TARE_BTN, INPUT_PULLUP);

  oled.begin();
  cell.begin(DT_PIN, SCK_PIN);
  cell.set_scale(scaleFactor);

  delay(400);
  cell.tare(20);
  Serial.println("Ready. Hold TARE at boot for calibration.");

  if (digitalRead(TARE_BTN) == LOW) calibrate();
}

void loop() {
  if (!cell.is_ready()) return;

  float raw = cell.get_units(1);

  // Exponential smoothing, twice, with different time constants.
  slowWeight += (raw - slowWeight) * SLOW_ALPHA;
  fastWeight += (raw - fastWeight) * FAST_ALPHA;

  histW[histIdx] = fastWeight;
  histT[histIdx] = millis();
  histIdx = (histIdx + 1) % HIST;

  float flow = flowRate();
  autoStartStop(flow);
  draw(flow);

  if (digitalRead(TARE_BTN) == LOW) {
    cell.tare(20);
    slowWeight = fastWeight = 0;
    timing = false;
    delay(300);
  }
}

/* Least-squares slope over the last ~0.5 s. Subtracting two consecutive
   readings would also give a rate, and it would be unusable - a
   derivative multiplies whatever noise is left after filtering. */
float flowRate() {
  float sx = 0, sy = 0, sxy = 0, sxx = 0;
  int n = 0;
  unsigned long t0 = histT[(histIdx + 1) % HIST];

  for (int i = 0; i < HIST; i++) {
    if (histT[i] == 0) continue;
    float x = (histT[i] - t0) / 1000.0f;
    float y = histW[i];
    sx += x; sy += y; sxy += x * y; sxx += x * x;
    n++;
  }
  if (n < 4) return 0;

  float denom = n * sxx - sx * sx;
  if (fabs(denom) < 1e-6) return 0;
  return (n * sxy - sx * sy) / denom;          // grams per second
}

/* Start on the first drop, not on a button. 0.3 g/s is well above drift
   and well below any real pour, so it does not false-trigger on someone
   leaning on the counter. */
void autoStartStop(float flow) {
  if (!timing && flow > 0.3f && fastWeight > 0.5f) {
    timing = true;
    startMs = millis();
    startWeight = fastWeight;
  }
  if (timing && flow < 0.1f && millis() - startMs > 5000) {
    timing = false;
  }
}

void draw(float flow) {
  static unsigned long last = 0;
  if (millis() - last < 100) return;
  last = millis();

  char line[24];
  oled.clearBuffer();

  // One decimal place. The hardware can resolve more; showing more just
  // gives you a digit that never sits still.
  oled.setFont(u8g2_font_helvB24_tr);
  snprintf(line, sizeof(line), "%.1f", slowWeight);
  oled.drawStr(0, 30, line);
  oled.setFont(u8g2_font_helvB12_tr);
  oled.drawStr(78, 30, "g");

  oled.setFont(u8g2_font_6x10_tf);
  snprintf(line, sizeof(line), "%.1f g/s", flow);
  oled.drawStr(0, 48, line);

  if (timing) {
    snprintf(line, sizeof(line), "%.1f s", (millis() - startMs) / 1000.0f);
    oled.drawStr(70, 48, line);
  }

  // The ratio is the thing you are actually aiming for.
  snprintf(line, sizeof(line), "1:%.1f from 18 g", slowWeight / 18.0f);
  oled.drawStr(0, 62, line);

  oled.sendBuffer();
}

/* ---- two-point calibration -----------------------------------------
   Reads the empty offset AND the scale factor. One-point calibration
   assumes the empty reading is the true zero, and it is not - the cell
   has its own weight and the bridge its own imbalance.
--------------------------------------------------------------------- */
void calibrate() {
  oled.clearBuffer();
  oled.setFont(u8g2_font_6x10_tf);
  oled.drawStr(0, 20, "Empty the scale");
  oled.drawStr(0, 34, "then press TARE");
  oled.sendBuffer();
  waitForPress();

  cell.set_scale(1.0);
  long empty = cell.read_average(30);

  oled.clearBuffer();
  oled.drawStr(0, 20, "Place 200 g");
  oled.drawStr(0, 34, "then press TARE");
  oled.sendBuffer();
  waitForPress();

  long loaded = cell.read_average(30);

  const float KNOWN_G = 200.0f;
  scaleFactor = (loaded - empty) / KNOWN_G;
  zeroOffset = empty;

  cell.set_scale(scaleFactor);
  cell.set_offset(zeroOffset);

  Serial.printf("scaleFactor = %.2f  zeroOffset = %ld\\n", scaleFactor, zeroOffset);
  Serial.println("Paste these into the sketch.");
}

void waitForPress() {
  while (digitalRead(TARE_BTN) == HIGH) delay(10);
  delay(300);
  while (digitalRead(TARE_BTN) == LOW) delay(10);
}`
}],

trouble: [
  { q: 'Weight counts down as you add load',
    a: `White and green swapped. Swap them, or negate the scale factor.` },
  { q: 'Readings are wildly unstable, jumping by grams',
    a: `Almost always mechanical. The platform is touching the case, or the cell is bolted at both ends, or a
    wire is pulling on the beam. Nothing in software fixes a cell that cannot flex freely.` },
  { q: 'The last digit jumps only when the display updates',
    a: `I2C noise coupling into the microvolt side. Move the cell wires away from the display wires, shorten
    them, and make sure the HX711 sits near the cell rather than near the ESP32.` },
  { q: 'It drifts by a gram over a minute',
    a: `Thermal, usually from a hot cup or portafilter. Re-tare immediately before each shot. Some drift is
    unavoidable on an uncompensated cheap cell.` },
  { q: 'Accurate at 20 g and wrong at 200 g',
    a: `One-point calibration, or the cell is being loaded off-centre. Run the two-point calibration, and check
    the platform puts the load in the middle of the cell's rated position.` },
  { q: 'Flow rate is nonsense while the weight looks fine',
    a: `You are differencing consecutive samples somewhere rather than fitting a slope. That is what
    <code>flowRate()</code> avoids.` },
  { q: 'Timer starts when nothing is happening',
    a: `Threshold too low for your noise floor. Raise the 0.3&nbsp;g/s trigger, or increase the fast filter
    slightly.` },
  { q: 'HX711 never becomes ready',
    a: `Clock and data swapped, or the module is not powered. It is also worth checking the rate jumper - some
    boards ship with it unsoldered and float the pin.` }
],

next: `
<ul>
  <li><strong>Stop the pump automatically</strong> at the target weight, using a relay into the machine's brew
  switch. The latency discussion becomes real money: stop at the target and you overshoot by whatever is still
  in the group head, so you learn to stop about a gram early.</li>
  <li><strong>Log every shot</strong> over Wi-Fi - dose, yield, time, flow curve. The flow curve is where the
  information is, and a channelling shot looks obviously different from a good one.</li>
  <li><strong>A second cell under the grinder</strong> so the dose is weighed too. Both ends of the ratio, and
  that is most of what a $1,500 machine gives you.</li>
  <li><strong>Try the same code as a kitchen scale</strong> with a 5 kg cell to see the resolution trade in
  practice.</li>
</ul>`
});
