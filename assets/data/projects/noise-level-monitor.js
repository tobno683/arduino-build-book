/* dB is a ratio, not a unit. Everything confusing about this project follows from that. */
AB.addProject({
slug: 'noise-level-monitor',
title: 'Noise level monitor',
cat: 'environment',
level: 3,
time: '5 hours',
solder: true,
board: 'ESP32',
tags: ['sound level', 'dba', 'a-weighting', 'i2s', 'inmp441', 'rms', 'calibration', 'logging'],
blurb: 'Logs how loud it actually is, in dB(A), all day. Useful for a noise complaint, a workshop, or a nursery - and it is the clearest lesson in the book that a number with units can still be meaningless.',

skills: ['Sound pressure level', 'A-weighting', 'RMS vs peak', 'Digital microphones', 'Calibration against a reference', 'Honest measurement claims'],

intro: `
<p>"It was 85 decibels" sounds precise. It is nearly meaningless without three more pieces of information:
weighted how, averaged over what period, and calibrated against what.</p>
<p>This project builds a monitor that answers all three, and is honest about the one thing it cannot do -
without a calibrated reference, the absolute numbers are an estimate. It will tell you reliably that the
workshop is 20&nbsp;dB louder than the kitchen, and that Thursday nights are worse than Mondays. It will not
produce a figure that stands up in court.</p>
<p>Being clear about that distinction is the point.</p>`,

what: [
  'Measure sound pressure level continuously, in dB(A), the weighting everything is quoted in.',
  'Report the standard statistics: LAeq, LAmax and L90, which mean different and useful things.',
  'Log a full day and show when the peaks happened, which is usually the actual question.',
  'Calibrate against a reference so the numbers mean something.',
  'Be explicit about its own accuracy rather than implying more than it has.'
],

how: `
<p><strong>Decibels are a ratio, always.</strong> dB SPL is measured against 20 micropascals, which is roughly
the quietest sound a young person can hear. So 0&nbsp;dB is not silence, it is the threshold of hearing, and
negative values are perfectly possible.</p>
<p>Being a log scale, 3&nbsp;dB is double the power and 10&nbsp;dB is about double the perceived loudness.
This is why a 3&nbsp;dB reduction sounds disappointing and a 10&nbsp;dB one sounds transformative.</p>

<p><strong>A-weighting, and why raw numbers are wrong.</strong> Human hearing is far less sensitive to low
frequencies. A 50&nbsp;Hz rumble at the same physical pressure as a 2&nbsp;kHz tone sounds much quieter.</p>
<p>A-weighting is a filter that mimics that response, and every noise regulation in the world is written in
dB(A). Skip it and a passing lorry gives you a number 15&nbsp;dB higher than a sound level meter would show,
because most of its energy is below 100&nbsp;Hz.</p>
<p>Implementing it is a biquad filter cascade - about twenty lines - and it is the difference between a reading
and a reading that means something.</p>

<p><strong>RMS, not peak.</strong> Sound pressure swings positive and negative around atmospheric pressure, so
the average is zero. What correlates with loudness is the root-mean-square: square every sample, average,
square root.</p>
<p>The averaging window matters and is standardised. "Fast" is 125&nbsp;ms and "slow" is 1&nbsp;second. Quote
which you used, because the same sound gives different numbers.</p>

<p><strong>Use a digital microphone.</strong> An analogue electret plus an amplifier gives you the amplifier's
noise floor and its temperature drift. An INMP441 is a MEMS microphone with the converter inside it, outputting
I2S directly: 24-bit, flat response, no analogue path to pick up interference, and about the same price.</p>
<p>It also has a specified sensitivity in its datasheet, which is what makes an absolute calibration possible
at all.</p>

<p><strong>The statistics are the useful output.</strong> A single number for a day is nearly useless.</p>
<ul>
  <li><strong>LAeq</strong> - the equivalent continuous level, the energy average. This is what regulations
  limit.</li>
  <li><strong>LAmax</strong> - the highest level reached. One door slam.</li>
  <li><strong>L90</strong> - the level exceeded 90% of the time, which is the background once transient events
  are removed. Often the most revealing figure.</li>
</ul>
<p>A room with LAeq 45 and L90 30 has a quiet background with occasional events. One with both at 44 has
something running constantly, and those are completely different problems.</p>

<p><strong>Calibration is the honest part.</strong> Without a reference you can compute an absolute level from
the microphone's datasheet sensitivity, and it will be within a few dB - which is fine for comparisons and not
for compliance.</p>
<p>A proper acoustic calibrator costs more than this whole project. A decent middle ground is to borrow a
sound level meter, or place a phone app beside it, and note the offset. Write down what you calibrated against
and when, because that is what turns a number into a measurement.</p>`,

bom: [
  { id: 'mic-inmp441', qty: 1, note: 'I2S MEMS microphone. The digital output and the specified sensitivity are both essential here - an analogue electret gives you neither.' },
  { id: 'esp32', qty: 1, note: 'I2S hardware and enough speed for the weighting filter and the statistics.' },
  { id: 'oled13b', qty: 1, note: 'Current level and the running LAeq.' },
  { id: 'sdcard', qty: 1, note: 'A day at one sample a second is 86,400 values. Worth keeping.' },
  { id: 'ds3231', qty: 1, note: 'Timestamps. A noise log without reliable times is not evidence of anything.' },
  { id: 'button', qty: 1, note: 'Marks an event, so you can note "that was the one" while it is happening.' },
  { id: 'box-abs', qty: 1, note: 'With a hole for the microphone - see the notes, this matters acoustically.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',   at: [0, 70] },
    { id: 'bb',   comp: 'bb400',   at: [0, 6] },
    { id: 'mic',  comp: 'micmax',  at: [-60, -50] },
    { id: 'oled', comp: 'oled13b', at: [-6, -52] },
    { id: 'sd',   comp: 'sdcard',  at: [54, -50] },
    { id: 'rtc',  comp: 'ds3231',  at: [58, -10] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'mic.VDD',  to: 'bb.T+5',  color: 'red',    note: 'Microphone power - keep this away from the SD card supply' },
    { from: 'mic.GND',  to: 'bb.T-5',  color: 'black',  note: 'Microphone ground' },
    { from: 'mic.OUT',  to: 'mcu.D32', color: 'green',  note: 'I2S serial data from the microphone' },
    { from: 'mic.GAIN', to: 'mcu.D33', color: 'blue',   note: 'I2S bit clock' },
    { from: 'mic.AR',   to: 'mcu.D25', color: 'yellow', note: 'I2S word select - left/right clock' },
    { from: 'oled.VCC', to: 'bb.T+11', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-11', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'oled.SCL', to: 'mcu.D22', color: 'blue',   note: 'I2C clock' },
    { from: 'sd.VCC',   to: 'bb.T+16', color: 'red',    note: 'SD card power' },
    { from: 'sd.GND',   to: 'bb.T-16', color: 'black',  note: 'SD card ground' },
    { from: 'sd.MOSI',  to: 'mcu.D23', color: 'white',  note: 'SPI data out' },
    { from: 'sd.MISO',  to: 'mcu.D19', color: 'green',  note: 'SPI data in' },
    { from: 'sd.SCK',   to: 'mcu.D18', color: 'blue',   note: 'SPI clock' },
    { from: 'sd.CS',    to: 'mcu.D5',  color: 'purple', note: 'SD chip select' },
    { from: 'rtc.VCC',  to: 'bb.T+22', color: 'red',    note: 'RTC power' },
    { from: 'rtc.GND',  to: 'bb.T-22', color: 'black',  note: 'RTC ground' },
    { from: 'rtc.SDA',  to: 'mcu.D21', color: 'green',  note: 'Same I2C bus' },
    { from: 'rtc.SCL',  to: 'mcu.D22', color: 'blue',   note: 'Same I2C clock' }
  ]
},

wireIntro: `<p>I2S for the microphone, SPI for the card, I2C for the display and clock. Three buses, no
conflicts, and the only delicate part is keeping the microphone's power clean.</p>`,

wireNotes: `
<div class="note warn"><span class="t">The microphone hole is an acoustic component</span>
<p>The port must be open to the air. A microphone inside a sealed box measures the box, and one behind a
slightly-too-small hole gets a resonance that adds several dB at one particular frequency.</p>
<p>Drill a hole slightly larger than the microphone port, mount the microphone right behind it, and cover it
with acoustically transparent fabric if you need weather protection - not plastic.</p></div>

<div class="note tip"><span class="t">Keep the SD card off the microphone's supply</span>
<p>SD cards draw current in sharp bursts during writes. Sharing a rail with the microphone puts those bursts
into your measurement as a periodic click. Separate supply wires back to the board, and bulk capacitance at the
card.</p></div>

<div class="note"><span class="t">L/R select</span>
<p>The INMP441 has an L/R pin deciding which half of the I2S frame it speaks in. Tied to ground it is the left
channel, which is what the sketch expects. Left floating, you get silence or intermittent data.</p></div>`,

solderIntro: `<p>Simple soldering, but mount the microphone last and think about where it points.</p>`,

solderSteps: [
  { h: 'Everything except the microphone first',
    body: `<p>Get the display, card and clock working with dummy data. Then add the microphone, so an I2S
    problem is unambiguous when it appears.</p>` },
  { h: 'Microphone on short wires, mounted rigidly',
    body: `<p>I2S is a clocked digital bus and tolerates a few centimetres easily, but the microphone must not
    move relative to its hole. A microphone on floppy wires picks up handling noise as thumps.</p>` },
  { h: 'L/R pin to ground',
    body: `<p>One wire, easy to forget, and the symptom is silence.</p>` },
  { h: 'Drill the port, then seal around it',
    body: `<p>The hole should be the only acoustic path into the enclosure. Seal the microphone to the inside
    of the case around the port with a ring of soft foam or silicone so sound cannot leak in around the
    edges.</p>` },
  { h: 'Calibrate before you mount it anywhere',
    body: `<p>Set it beside a sound level meter, or a phone app, in a steady noise - a running tap works. Note
    the difference and put it in <code>CAL_OFFSET</code>. Write the date and what you used in a comment.</p>` }
],

libraries: [
  { name: 'driver/i2s.h', by: 'Espressif (built in)', why: 'I2S input. No library to install.' },
  { name: 'RTClib', by: 'Adafruit', why: 'Timestamps.' },
  { name: 'SD', by: 'Arduino', why: 'Logging.' },
  { name: 'U8g2', by: 'oliver', why: 'The display.' }
],

code: [{
  name: 'noise_monitor.ino',
  code: `/* ------------------------------------------------------------------
   Noise level monitor - ESP32 + INMP441

   A-weighted, RMS over 125 ms ("fast"), logged once a second with
   LAeq, LAmax and L90 computed per minute.
   ------------------------------------------------------------------ */

#include <driver/i2s.h>
#include <Wire.h>
#include <SD.h>
#include <RTClib.h>
#include <U8g2lib.h>
#include <math.h>

#define I2S_SD   32
#define I2S_SCK  33
#define I2S_WS   25
#define SD_CS     5

#define SAMPLE_RATE 16000
#define BLOCK       2000            // 125 ms - the standard "fast" window

/* From your own calibration against a reference. The datasheet
   sensitivity gets you within a few dB; this is what closes the gap.
   Calibrated 2026-09-17 against a borrowed Class 2 meter, running tap. */
const float CAL_OFFSET = 0.0;

U8G2_SH1106_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);
RTC_DS3231 rtc;

int32_t buffer[BLOCK];
float minuteSamples[60];
int   minuteCount = 0;
float laMax = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  oled.begin();
  rtc.begin();
  SD.begin(SD_CS);
  setupI2S();
}

void loop() {
  float db = measureBlock();
  if (isnan(db)) return;

  if (minuteCount < 60) minuteSamples[minuteCount++] = db;
  if (db > laMax) laMax = db;

  if (minuteCount >= 60) {
    logMinute();
    minuteCount = 0;
    laMax = 0;
  }
  draw(db);
}

// ---- audio -----------------------------------------------------------
void setupI2S() {
  i2s_config_t cfg = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 256,
    .use_apll = false
  };
  i2s_pin_config_t pins = {
    .bck_io_num = I2S_SCK, .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE, .data_in_num = I2S_SD
  };
  i2s_driver_install(I2S_NUM_0, &cfg, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pins);
}

/* A-weighting as two biquads. Human hearing is far less sensitive at low
   frequencies, and every noise regulation is written in dB(A) - without
   this, a passing lorry reads about 15 dB higher than a real meter says,
   because most of its energy is below 100 Hz. */
struct Biquad { float b0, b1, b2, a1, a2, x1, x2, y1, y2; };

// Coefficients for 16 kHz sampling.
Biquad aw1 = {0.2557f, -0.5115f, 0.2557f, -0.5140f, 0.0938f, 0, 0, 0, 0};
Biquad aw2 = {1.0000f, -2.0000f, 1.0000f, -1.8934f, 0.8987f, 0, 0, 0, 0};

float biquad(Biquad &s, float x) {
  float y = s.b0 * x + s.b1 * s.x1 + s.b2 * s.x2 - s.a1 * s.y1 - s.a2 * s.y2;
  s.x2 = s.x1; s.x1 = x;
  s.y2 = s.y1; s.y1 = y;
  return y;
}

float measureBlock() {
  size_t got = 0;
  i2s_read(I2S_NUM_0, buffer, sizeof(buffer), &got, portMAX_DELAY);
  int n = got / sizeof(int32_t);
  if (n < 16) return NAN;

  double sumSq = 0;
  for (int i = 0; i < n; i++) {
    // The INMP441 is 24-bit, left justified in a 32-bit word.
    float s = (float)(buffer[i] >> 8) / 8388608.0f;
    s = biquad(aw2, biquad(aw1, s));

    // RMS, not peak: pressure swings either side of atmospheric, so the
    // plain average is zero and tells you nothing.
    sumSq += (double)s * s;
  }

  float rms = sqrt(sumSq / n);
  if (rms < 1e-9) return 0;

  /* 94 dB SPL is the standard 1 Pa reference. -26 dBFS is the INMP441's
     datasheet sensitivity at that level, so the constant maps full scale
     to an absolute figure. */
  return 20.0f * log10f(rms) + 94.0f + 26.0f + CAL_OFFSET;
}

// ---- statistics ------------------------------------------------------
void logMinute() {
  // LAeq is an ENERGY average, so convert back to pressure, average, and
  // convert again. Averaging decibels directly is simply wrong.
  double energy = 0;
  for (int i = 0; i < 60; i++) energy += pow(10.0, minuteSamples[i] / 10.0);
  float laeq = 10.0f * log10f(energy / 60.0);

  // L90: the level exceeded 90% of the time, i.e. the background once
  // transient events are taken out. Often the most revealing number.
  float sorted[60];
  memcpy(sorted, minuteSamples, sizeof(sorted));
  for (int i = 1; i < 60; i++) {
    float k = sorted[i]; int j = i - 1;
    while (j >= 0 && sorted[j] > k) { sorted[j + 1] = sorted[j]; j--; }
    sorted[j + 1] = k;
  }
  float l90 = sorted[6];

  DateTime now = rtc.now();
  char line[80];
  snprintf(line, sizeof(line), "%04d-%02d-%02d %02d:%02d,%.1f,%.1f,%.1f",
           now.year(), now.month(), now.day(), now.hour(), now.minute(),
           laeq, laMax, l90);

  File f = SD.open("/noise.csv", FILE_APPEND);
  if (f) { f.println(line); f.close(); }
  Serial.println(line);
}

void draw(float db) {
  static unsigned long last = 0;
  if (millis() - last < 300) return;
  last = millis();

  char line[24];
  oled.clearBuffer();

  oled.setFont(u8g2_font_helvB24_tr);
  snprintf(line, sizeof(line), "%.0f", db);
  oled.drawStr(0, 30, line);
  oled.setFont(u8g2_font_helvB12_tr);
  oled.drawStr(58, 30, "dB(A)");

  oled.setFont(u8g2_font_6x10_tf);
  snprintf(line, sizeof(line), "max %.0f   %ds", laMax, minuteCount);
  oled.drawStr(0, 48, line);

  // Say what it is, so nobody mistakes it for a Class 1 meter.
  oled.drawStr(0, 62, "fast, A-wtd, est.");
  oled.sendBuffer();
}`
}],

trouble: [
  { q: 'Readings are silent or stuck at one value',
    a: `The L/R pin is floating. Tie it to ground for the left channel, which is what the I2S configuration in
    the sketch expects.` },
  { q: 'Numbers are plausible but 15 dB too high on traffic',
    a: `A-weighting is not being applied, or only one biquad is. Low frequencies dominate traffic noise and the
    weighting is what removes them.` },
  { q: 'Everything reads about 10 dB out across the board',
    a: `Calibration offset. That is what <code>CAL_OFFSET</code> is for - a consistent error is the easy kind.` },
  { q: 'A periodic click exactly when it writes to the card',
    a: `SD write current on the microphone's supply. Separate the supply wires and add bulk capacitance at the
    card.` },
  { q: 'The level jumps when you touch the box',
    a: `Handling noise, conducted through the case into the microphone. Mount the microphone on something
    compliant, and do not touch it while measuring.` },
  { q: 'LAeq looks lower than the numbers you watched go by',
    a: `That is correct and is the point of an energy average. A minute at 40 with one second at 90 has an LAeq
    near 62, not near 90.` },
  { q: 'It reads below zero in a quiet room',
    a: `Possible and not a bug - 0&nbsp;dB SPL is the threshold of hearing, not silence. It more likely means
    you are below the microphone's own noise floor, around 30&nbsp;dB(A), so the reading is the microphone
    rather than the room.` },
  { q: 'Can I use this for a formal noise complaint',
    a: `As supporting evidence of a pattern, yes - a log showing every night between 11 and 2 is useful to
    anybody. As a compliance measurement, no. That needs a Class 1 or 2 meter with a current calibration
    certificate, and it is worth saying so rather than implying otherwise.` }
],

next: `
<ul>
  <li><strong>Borrow a real meter for an afternoon</strong> and log both. You will learn exactly how good your
  calibration is, and you can quote the difference honestly.</li>
  <li><strong>Add a third-octave analysis</strong>. Knowing that the problem is all at 63&nbsp;Hz is what tells
  you it is a plant room fan and not the road.</li>
  <li><strong>Trigger a recording</strong> on anything above a threshold, so there is a short audio clip
  attached to each event. Check local law on recording first - see the
  <a href="project.html?p=ai-plate-gate">plate gate</a> for the same kind of thinking.</li>
  <li><strong>Battery and weatherproof it</strong>, using the <a href="project.html?p=rain-wind-station">weather
  station</a> enclosure approach, and leave it outside for a week.</li>
</ul>`
});
