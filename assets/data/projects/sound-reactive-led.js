/* MAX9814 microphone driving a WS2812B strip as a live spectrum. */
AB.addProject({
slug: 'sound-reactive-led',
title: 'Sound-reactive light strip',
cat: 'audio',
level: 3,
time: '3 hours',
solder: true,
feature: true,
board: 'Nano',
tags: ['max9814', 'ws2812b', 'fft', 'fastled', 'spectrum', 'vu meter', 'music'],
blurb: 'A strip that actually follows the music - a real spectrum analyser with automatic gain, not a VU meter that just flickers at the beat.',

skills: ['Analog audio', 'Sampling', 'FFT', 'Auto-gain', 'FastLED', 'Noise floors'],

intro: `
<p>Most "sound reactive" projects measure how loud it is and light that many LEDs. The result flickers
convincingly for about a minute and then you notice it does the same thing for a bass drum and a hi-hat, which
is not what music looks like.</p>
<p>This one does a real FFT: it samples the microphone 9,000 times a second, splits the signal into frequency
bands, and lights each section of the strip from its own band. Bass moves one end, cymbals move the other. It
is genuinely the same idea as the display on a stereo, running on a $4 board.</p>`,

what: [
  'Sample audio and compute an 8- or 16-band spectrum many times a second.',
  'Map the bands across a WS2812B strip, with colour by frequency and height by level.',
  'Adapt automatically to the room volume, so it works at conversation level and at party level without touching anything.',
  'Hold peaks briefly, so fast transients are visible rather than a blur.',
  'Fall to a slow idle animation when the room goes quiet.'
],

how: `
<p>The <strong>MAX9814</strong> is an electret microphone with an amplifier and, crucially, automatic gain
control. It centres its output at about half the supply - so silence is roughly 1.65&nbsp;V, not 0&nbsp;V -
and swings either side. That DC offset is why the code subtracts a measured midpoint rather than assuming zero.</p>
<p>The <strong>FFT</strong> takes a block of samples in time and tells you how much energy is at each
frequency. 128 samples at 9&nbsp;kHz gives 64 usable bins, each about 70&nbsp;Hz wide, covering up to
4.5&nbsp;kHz. That is not hi-fi, and it is plenty - almost all the visible energy in music is below 4&nbsp;kHz.</p>
<p><strong>Logarithmic grouping</strong> is what makes it look right. Human hearing is logarithmic, so equal
linear bins would put almost everything in the first two bands. Grouping bins as 1-2, 3-4, 5-8, 9-16 and so on
spreads bass, mids and treble across the strip the way your ear expects.</p>
<p><strong>Auto-gain</strong> in software sits on top of the microphone's own: track the loudest thing seen in
the last few seconds and scale to that. Without it, the strip is either always full or always dark, depending
on the room.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'An ATmega328P does a 128-point integer FFT in about 3 ms, which is 20 frames a second. Fine. An ESP32 does 256 points in a fraction of that.' },
  { id: 'mic-max9814', qty: 1, note: 'With the AGC. The bare electret plus a transistor version needs a lot more work for a worse result.' },
  { id: 'ws2812-strip', qty: 1, note: '1 m of 60 LED/m. Cut to length; the sketch takes any count.' },
  { id: 'res220', qty: 1 },
  { id: 'cap1000', qty: 1 },
  { id: 'cap100n', qty: 1, note: 'Across the microphone supply, right at the module.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'button', qty: 1, note: 'Cycles the display mode.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'nano',  comp: 'nano',        at: [0, 0] },
    { id: 'mic',   comp: 'micmax',      at: [-54, -42], ry: 180 },
    { id: 'strip', comp: 'ws2812strip', at: [0, -96], opt: { n: 14 } },
    { id: 'btn',   comp: 'button',      at: [44, 34] }
  ],
  wires: [
    { from: 'mic.VDD',   to: 'nano.5V',   color: 'red',    note: 'Microphone power. Keep this clean - it is an analog part' },
    { from: 'mic.GND',   to: 'nano.GND',  color: 'black',  note: 'Microphone ground' },
    { from: 'mic.OUT',   to: 'nano.A0',   color: 'yellow', note: 'Audio, centred at about half the supply' },
    { from: 'strip.5V',  to: 'nano.5V',   color: 'red',    note: '5 V to the strip, from the supply rather than through the Nano' },
    { from: 'strip.GND', to: 'nano.GND2', color: 'black',  note: 'Strip ground' },
    { from: 'strip.DIN', to: 'nano.D6',   color: 'green',  note: 'Data, through a 220 ohm resistor at the strip end' },
    { from: 'btn.1A',    to: 'nano.D4',   color: 'blue',   note: 'Mode button, internal pull-up' },
    { from: 'btn.2A',    to: 'nano.GND2', color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">Keep the microphone away from the LED supply</span>
<p>This is the one thing that determines whether the project works well or badly. WS2812Bs switch hard and put
noise on the 5&nbsp;V rail; the microphone is an analog part reading millivolts. Symptoms of getting it wrong
are a strip that reacts to itself and never settles.</p>
<ul>
  <li>Run the microphone's 5&nbsp;V and ground as their own pair back to the supply, not tapped off the strip.</li>
  <li>100&nbsp;nF across the microphone's VDD and GND, right at the module.</li>
  <li>Physically separate: microphone at least 100&nbsp;mm from the strip and its wires.</li>
</ul></div>

<div class="note tip"><span class="t">The GAIN pin</span>
<p>The MAX9814 has a GAIN pin you can leave floating (60&nbsp;dB), tie to ground (50&nbsp;dB) or tie to VDD
(40&nbsp;dB). Floating is right for a room; if you are putting it next to a speaker, tie it to VDD or the AGC
will spend all its time backing off.</p></div>`,

solderSteps: [
  { h: 'Microphone on its own short flying lead',
    body: `<p>Three wires, 150&nbsp;mm, twisted together. Twisting the signal with its ground is not decoration -
    it cancels induced noise, and on an analog line that matters.</p>
    <p>Solder the 100&nbsp;nF directly across the module's VDD and GND pads before you attach the wires.</p>` },
  { h: 'Strip end: resistor first, then wires',
    body: `<p>Tin the three pads, tin the wires, one second each to join. The 220&nbsp;&Omega; goes in the data
    wire as close to the strip as you can - solder it inline and sleeve it in heat-shrink.</p>
    <p>Hot glue over all three joints when done; strip pads tear off easily.</p>` },
  { h: 'Distribution board with separate analog and LED grounds',
    body: `<p>Bring the supply in on a screw terminal. From that single point, run one pair to the strip and a
    separate pair to the microphone. They meet only at the terminal.</p>
    <p>This is a "star ground", and it is the difference between a clean spectrum and a strip that dances to its
    own power supply.</p>` },
  { h: 'The reservoir capacitor at the strip end',
    body: `<p>1000&nbsp;&micro;F across 5&nbsp;V and GND where the strip connects, stripe to ground.</p>` },
  { h: 'Check, then listen',
    body: `<p>5&nbsp;V to GND: no beep. Then power up and run the microphone test sketch before touching the
    LEDs - a mic that reads a flat line will never produce a spectrum, and it is much easier to see that on its
    own.</p>` }
],

assembly: [
  { h: 'Test the microphone alone first',
    body: `<p>Upload the mic test below and open the Serial Plotter. You should see a line hovering around 500
    that spreads into a fat band when you talk. If it is a flat line, the microphone is not wired or not
    powered.</p>` },
  { h: 'Note the quiet midpoint',
    body: `<p>The test sketch prints it. It will be somewhere near 512 but rarely exactly - the main sketch
    measures it at boot, so just confirm it is stable and in the 400-600 range.</p>` },
  { h: 'Then the strip',
    body: `<p>Set <code>NUM_LEDS</code> to your actual count. Play something with obvious bass and watch whether
    the low end of the strip moves with the kick drum.</p>` },
  { h: 'Position it',
    body: `<p>Microphone pointing into the room, away from the speakers if you can - a microphone right in front
    of a woofer sees nothing but bass and the AGC clamps everything else.</p>
    <p>A metre or two from the source, at head height, gives the most musical-looking result.</p>` }
],

libraries: [
  { name: 'FastLED', by: 'Daniel Garcia / Mark Kriegsman', why: 'The strip.' },
  { name: 'arduinoFFT', by: 'Enrique Condes', why: 'The frequency transform. Search "arduinoFFT" in the Library Manager.' }
],

code: [
{
  h: 'Microphone test',
  name: 'mic_test.ino',
  intro: `<p>Open <strong>Tools &rarr; Serial Plotter</strong>, not the Monitor. You want to see the waveform.</p>`,
  code: `void setup() {
  Serial.begin(115200);
}

void loop() {
  // 50 ms window: enough to see the shape of speech
  int lo = 1023, hi = 0;
  long sum = 0;
  const int N = 400;

  for (int i = 0; i < N; i++) {
    int v = analogRead(A0);
    if (v < lo) lo = v;
    if (v > hi) hi = v;
    sum += v;
    delayMicroseconds(110);
  }

  Serial.print(lo);
  Serial.print(' ');
  Serial.print(hi);
  Serial.print(' ');
  Serial.println(sum / N);      // the quiet midpoint
}`,
  after: `<p>Three traces: minimum, maximum and average. In silence all three sit together near 500. When you
  talk, the min and max separate and the average stays put. If the min and max never separate, the microphone
  is not working; if they are always far apart, it is picking up electrical noise - check the star ground.</p>`
},
{
  h: 'The spectrum analyser',
  name: 'sound_reactive.ino',
  code: `/* ------------------------------------------------------------------
   Sound-reactive light strip
   MAX9814 on A0, WS2812B on D6, mode button on D4.

   Samples at ~9 kHz, 128-point FFT, 8 logarithmic bands across the strip.
   ------------------------------------------------------------------ */

#include <FastLED.h>
#include <arduinoFFT.h>

// ---- settings --------------------------------------------------------
#define LED_PIN      6
#define NUM_LEDS    60
#define MIC_PIN     A0
#define MODE_PIN     4
#define MAX_MILLIAMPS 1800

#define SAMPLES     128          // must be a power of two
#define SAMPLE_HZ  9000
#define BANDS         8
// ----------------------------------------------------------------------

CRGB leds[NUM_LEDS];

double vReal[SAMPLES];
double vImag[SAMPLES];
ArduinoFFT<double> FFT(vReal, vImag, SAMPLES, SAMPLE_HZ);

// Logarithmic band edges, in FFT bin numbers. Bin n is about
// n * SAMPLE_HZ / SAMPLES = n * 70 Hz.
const uint8_t BAND_START[BANDS] = { 1,  2,  4,  6,  9, 14, 22, 36 };
const uint8_t BAND_END[BANDS]   = { 2,  4,  6,  9, 14, 22, 36, 63 };

float bandLevel[BANDS];
float bandPeak[BANDS];
float autoGain = 1.0;
float loudest = 40;

uint16_t midpoint = 512;
uint8_t mode = 0;
unsigned long lastSound = 0;
bool wasDown = false;

void setup() {
  Serial.begin(115200);
  pinMode(MODE_PIN, INPUT_PULLUP);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_MILLIAMPS);
  FastLED.setBrightness(120);

  // Measure the quiet DC midpoint - the MAX9814 centres on about half
  // the supply, and it is never exactly 512.
  long sum = 0;
  for (int i = 0; i < 512; i++) { sum += analogRead(MIC_PIN); delayMicroseconds(200); }
  midpoint = sum / 512;
  Serial.print(F("midpoint "));
  Serial.println(midpoint);

  // Faster ADC: the default prescaler gives ~9 kHz max, and we want
  // every microsecond. This sets the prescaler to 16 (~77 kHz).
  ADCSRA = (ADCSRA & 0xF8) | 0x04;
}

void loop() {
  checkButton();
  sample();
  computeBands();
  draw();
  FastLED.show();
}

/* --- sampling --------------------------------------------------------- */
void sample() {
  unsigned long period = 1000000UL / SAMPLE_HZ;
  unsigned long next = micros();

  for (int i = 0; i < SAMPLES; i++) {
    while (micros() < next) { }
    next += period;
    vReal[i] = (double)(analogRead(MIC_PIN) - midpoint);
    vImag[i] = 0.0;
  }
}

void computeBands() {
  FFT.windowing(FFTWindow::Hamming, FFTDirection::Forward);
  FFT.compute(FFTDirection::Forward);
  FFT.complexToMagnitude();

  float frameMax = 0;

  for (uint8_t b = 0; b < BANDS; b++) {
    double sum = 0;
    uint8_t n = 0;
    for (uint8_t bin = BAND_START[b]; bin <= BAND_END[b] && bin < SAMPLES / 2; bin++) {
      sum += vReal[bin];
      n++;
    }
    float v = n ? (float)(sum / n) : 0;

    // Low bands carry far more energy - tilt to compensate, or the
    // strip is all bass and nothing else ever moves.
    v *= 1.0 + b * 0.35;

    if (v > frameMax) frameMax = v;

    // fall slowly, rise instantly: what makes it look like music
    if (v > bandLevel[b]) bandLevel[b] = v;
    else                  bandLevel[b] = bandLevel[b] * 0.80 + v * 0.20;

    if (bandLevel[b] > bandPeak[b]) bandPeak[b] = bandLevel[b];
    else                            bandPeak[b] *= 0.96;
  }

  // auto gain: track the loudest thing in the last few seconds
  if (frameMax > loudest) loudest = frameMax;
  else                    loudest = loudest * 0.998 + frameMax * 0.002;
  if (loudest < 30) loudest = 30;               // noise floor
  autoGain = 1.0 / loudest;

  if (frameMax > loudest * 0.25) lastSound = millis();
}

/* --- drawing ---------------------------------------------------------- */
void draw() {
  if (millis() - lastSound > 6000) { idle(); return; }

  fadeToBlackBy(leds, NUM_LEDS, 90);
  uint8_t perBand = NUM_LEDS / BANDS;

  for (uint8_t b = 0; b < BANDS; b++) {
    float norm = constrain(bandLevel[b] * autoGain, 0.0f, 1.0f);
    uint8_t lit = (uint8_t)(norm * perBand + 0.5);
    uint8_t hue = (mode == 0) ? map(b, 0, BANDS - 1, 0, 190)
                              : map(b, 0, BANDS - 1, 160, 255);

    for (uint8_t i = 0; i < lit; i++) {
      uint8_t idx = b * perBand + i;
      if (idx < NUM_LEDS) leds[idx] = CHSV(hue, 235, 255);
    }

    // peak marker in white, so fast hits stay visible
    uint8_t pk = (uint8_t)(constrain(bandPeak[b] * autoGain, 0.0f, 1.0f) * (perBand - 1));
    uint8_t pidx = b * perBand + pk;
    if (pidx < NUM_LEDS && pk > 0) leds[pidx] = CRGB(90, 90, 90);
  }
}

void idle() {
  // slow drift, so a quiet room does not mean a dead strip
  uint8_t h = millis() / 90;
  for (uint8_t i = 0; i < NUM_LEDS; i++) {
    leds[i] = CHSV(h + i * 2, 200, 40);
  }
}

void checkButton() {
  bool down = digitalRead(MODE_PIN) == LOW;
  if (down && !wasDown) {
    delay(30);
    if (digitalRead(MODE_PIN) == LOW) {
      mode = (mode + 1) % 2;
      Serial.print(F("mode "));
      Serial.println(mode);
    }
  }
  wasDown = down;
}`,
  after: `<p>Three lines that do most of the work, and are worth stealing:</p>
  <ul>
    <li><strong>Rise instantly, fall slowly.</strong> A level that tracks both directions equally looks like
    noise. Attack fast and release slow is how every VU meter ever made behaves, and it is one
    <code>if</code>.</li>
    <li><strong>The <code>1.0 + b * 0.35</code> tilt.</strong> Music has vastly more energy at low frequencies.
    Without a tilt, the bass band pins and the treble bands never light.</li>
    <li><strong>The <code>ADCSRA</code> line.</strong> The Arduino's ADC prescaler defaults to a slow, accurate
    setting. Dropping it to 16 gets you to about 77&nbsp;kHz, which is what makes 9&nbsp;kHz sampling
    comfortable. It costs a little accuracy you do not need here.</li>
  </ul>`
}],

upload: `<p>Nano, correct port. Watch the Serial Monitor at 115200 for the measured midpoint, then play
something with a clear kick drum and watch the low end of the strip.</p>`,

tune: [
  { h: 'If the strip barely moves',
    body: `<p>Lower the noise floor (<code>if (loudest < 30)</code>) to 15, and check the microphone's GAIN pin
    is floating for maximum sensitivity.</p>` },
  { h: 'If it is always full',
    body: `<p>Raise the noise floor, or tie GAIN to VDD for 40&nbsp;dB. A microphone right next to a speaker
    needs the lower gain setting.</p>` },
  { h: 'Rebalancing the bands',
    body: `<p>The <code>1.0 + b * 0.35</code> tilt is the control. More tilt lifts the treble; less lets the
    bass dominate. Adjust while watching something you know well.</p>` },
  { h: 'More bands, or fewer',
    body: `<p><code>BANDS</code> must divide <code>NUM_LEDS</code> reasonably. 60 LEDs works nicely with 6, 10
    or 12 bands as well as 8 - extend the <code>BAND_START</code>/<code>BAND_END</code> tables to match, keeping
    the spacing roughly logarithmic.</p>` },
  { h: 'More resolution',
    body: `<p>256 samples doubles the frequency resolution and halves the frame rate - on a Nano that is about
    10&nbsp;fps, which starts to look sluggish. This is the point at which an ESP32 is worth the swap: it will
    do 512 points at 60&nbsp;fps without breathing hard.</p>` }
],

trouble: [
  { q: 'The strip reacts to itself, not the music',
    a: `Electrical noise from the LEDs getting into the microphone. Star ground, separate supply pairs, the
    100&nbsp;nF at the microphone, and physical separation. This is the fault, far more often than any
    other.` },
  { q: 'Only the first band ever lights',
    a: `No band tilt, or the FFT is seeing mostly DC because the midpoint is wrong. Print the midpoint and
    confirm it matches what the test sketch showed.` },
  { q: 'Flat line in the Serial Plotter',
    a: `Microphone not powered, or OUT not on A0. Measure the OUT pin with a multimeter - it should read about
    half the supply.` },
  { q: 'Everything flickers at the same time',
    a: `That is a VU meter, not a spectrum - the FFT is not running or all bands are reading the same bin.
    Check the library installed is arduinoFFT and that <code>SAMPLES</code> is a power of two.` },
  { q: 'Compile error about FFTWindow or FFTDirection',
    a: `Older arduinoFFT versions used a different API (<code>FFT.Windowing(vReal, SAMPLES, FFT_WIN_TYP_HAMMING, FFT_FORWARD)</code>).
    Either update the library to 2.x or use the old call style.` },
  { q: 'Frame rate is visibly slow',
    a: `The FFT on a Nano is about 3&nbsp;ms and the sampling is 14&nbsp;ms, so about 40&nbsp;fps is the
    ceiling. If it is much slower, the strip is long - <code>FastLED.show()</code> takes 30&nbsp;&micro;s per
    LED.` },
  { q: 'Nano resets when the strip is bright',
    a: `Power. Feed the strip from the supply directly and lower <code>MAX_MILLIAMPS</code>.` }
],

next: `
<ul>
  <li><strong>Put it on a matrix</strong> and you have a proper spectrum display, with frequency across and
  level up. An 8x32 WS2812 panel and the same band code.</li>
  <li><strong>Beat detection</strong>: watch the low band for a sudden rise above a running average and flash
  the whole strip. Crude, effective, and much better than level alone.</li>
  <li><strong>Use it with the <a href="project.html?p=infinity-mirror">infinity mirror</a></strong> - a
  spectrum receding into a tunnel is a genuinely good object.</li>
  <li><strong>Move to an ESP32</strong> and use an INMP441 I2S microphone: digital audio, no analog noise
  problem at all, and enough speed for a 512-point transform.</li>
</ul>`
});
