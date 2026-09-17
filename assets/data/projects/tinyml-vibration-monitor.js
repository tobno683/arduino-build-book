/* Predictive maintenance: an FFT, a baseline, and the honesty to admit what it cannot tell you. */
AB.addProject({
slug: 'tinyml-vibration-monitor',
title: 'Motor fault detection from vibration',
cat: 'ai',
level: 3,
time: '5 hours, plus a week of baselining',
solder: true,
board: 'ESP32',
tags: ['vibration', 'fft', 'mpu6050', 'predictive maintenance', 'anomaly detection', 'esp32', 'mqtt', 'bearings'],
blurb: 'Bolt an accelerometer to a motor and it learns what healthy sounds like. When a bearing starts to go, the frequency signature changes weeks before you could hear it - and the frequency it changes at tells you which part is failing.',

skills: ['FFT on a microcontroller', 'Sampling rate and aliasing', 'Bearing fault frequencies', 'Baselining', 'Anomaly thresholds', 'Mechanical mounting'],

intro: `
<p>A rotating machine vibrates in a pattern set by its geometry. Shaft speed produces one frequency, the
number of fan blades another, and the ball count and race diameters of each bearing produce several more.
When something starts to wear, energy appears at that component's specific frequency - long before anything
is audible or obvious.</p>
<p>This is how industrial condition monitoring works, and the interesting part for a hobby project is that it
is not really about machine learning. An FFT and a baseline gets you most of the way. The learning is what
turns "this spectrum is different" into "this spectrum is different in the way a failing bearing is
different".</p>
<p>The <a href="project.html?p=tinyml-machine-listener">machine listener</a> does the same job with a
microphone. Vibration is the better sensor: it is not fooled by the radio being on, and it tells you which
machine, because it is bolted to that one.</p>`,

what: [
  'Sample vibration at a rate high enough to see the frequencies that matter.',
  'Compute an FFT on the board and reduce it to a handful of band energies.',
  'Learn a baseline from a week of healthy running, including how much it normally varies.',
  'Flag a deviation, with the frequency band it happened in - which is the part that points at a cause.',
  'Publish to MQTT so a week of history is somewhere you can look at it.'
],

how: `
<p><strong>Sampling rate decides what you can see.</strong> Nyquist: to see a frequency you must sample at more
than twice it. Bearing defect frequencies for small motors typically land between 50&nbsp;Hz and 1&nbsp;kHz, so
sample at 2&nbsp;kHz and you can see up to 1&nbsp;kHz.</p>
<p>The trap is that an MPU6050's internal low-pass filter defaults to about 44&nbsp;Hz. Sample it at
2&nbsp;kHz with that filter in place and you get a beautifully smooth signal containing none of the information
you wanted. Set <code>DLPF_CFG</code> to its widest setting, or the whole project quietly measures nothing.</p>

<p><strong>Aliasing is worse than missing data.</strong> Anything above half your sampling rate does not
disappear - it folds back and appears as a false low frequency. A 2,400&nbsp;Hz component sampled at
2&nbsp;kHz shows up at 400&nbsp;Hz, indistinguishable from a real signal there. This is why the sensor's
analogue filter should be set just below Nyquist, not wide open.</p>

<p><strong>Sample at a steady rate, or the FFT is meaningless.</strong> An FFT assumes evenly spaced samples.
Read the sensor in a loop with other work in it and the interval jitters, which smears every peak. Use a
hardware timer to trigger the reads, and check the actual rate before trusting anything.</p>

<p><strong>What the bands mean.</strong> Rather than a 256-point spectrum, reduce to about eight bands and
track those. The useful ones for a small motor:</p>
<ul>
  <li><strong>1x shaft speed</strong> - rises with imbalance. A fan with something stuck to a blade.</li>
  <li><strong>2x shaft speed</strong> - misalignment, or a bent shaft.</li>
  <li><strong>Blade pass</strong> (blades x shaft speed) - airflow obstruction.</li>
  <li><strong>High frequency, 500&nbsp;Hz and up</strong> - bearing wear. This is the band that matters, and it
  is where the early warning lives.</li>
</ul>
<p>A rise in one band is diagnostic. A rise everywhere usually means the mounting has loosened, which is the
commonest false alarm in the whole field.</p>

<p><strong>Baselining takes a week, not an hour.</strong> Machines vary with load, ambient temperature and time
of day. A fridge compressor's spectrum differs between summer and winter. Collect a week of healthy data,
store the mean and standard deviation per band, and flag on <code>|value - mean| > 3 * sigma</code>.</p>
<p>Using a fixed threshold instead is the classic mistake: it either alarms every time the machine works
harder, or never alarms at all.</p>

<p><strong>What this honestly cannot do.</strong> It tells you something changed and roughly where in the
spectrum. It does not tell you the bearing has 200 hours left. Real remaining-useful-life prediction needs
run-to-failure data from many identical machines, which you do not have and cannot get. Anyone selling you
that on a hobby budget is guessing.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Fast enough for a 256-point FFT in a few milliseconds, and it has Wi-Fi for the history.' },
  { id: 'mpu6050', qty: 1, note: 'Cheap and adequate. Its noise floor limits how early you see a fault, but the physics is all visible.' },
  { id: 'oled13', qty: 1, note: 'Local readout, so you can see the spectrum while positioning the sensor.' },
  { id: 'magnet', qty: 1, note: 'The mounting. A magnet against a machine casing couples vibration far better than tape - see the notes.' },
  { id: 'box-abs', qty: 1, note: 'It lives on a machine. Something will knock it eventually.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',   at: [0, 60] },
    { id: 'bb',   comp: 'bb400',   at: [0, -4] },
    { id: 'imu',  comp: 'mpu6050', at: [-46, -58] },
    { id: 'oled', comp: 'oled13',  at: [36, -56] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'imu.VCC',  to: 'bb.T+5',  color: 'red',    note: 'IMU power' },
    { from: 'imu.GND',  to: 'bb.T-5',  color: 'black',  note: 'IMU ground' },
    { from: 'imu.SDA',  to: 'mcu.D21', color: 'green',  note: 'I2C data, shared with the display' },
    { from: 'imu.SCL',  to: 'mcu.D22', color: 'blue',   note: 'I2C clock, shared' },
    { from: 'imu.INT',  to: 'mcu.D19', color: 'white',  note: 'Data-ready interrupt - this is what keeps the sample interval even' },
    { from: 'oled.VCC', to: 'bb.T+12', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-12', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21', color: 'green',  note: 'Same I2C bus - different address, no conflict' },
    { from: 'oled.SCL', to: 'mcu.D22', color: 'blue',   note: 'Same I2C clock' }
  ]
},

wireIntro: `<p>One I2C bus with two devices on it. The only wire that needs thought is the interrupt line, and
it is the one that makes the FFT trustworthy.</p>`,

wireNotes: `
<div class="note warn"><span class="t">The sensor cable must be short and stiff</span>
<p>A long flexible cable between the sensor and the board has its own resonances, and they will appear in your
spectrum as peaks that have nothing to do with the machine. Keep it under 20&nbsp;cm, and secure it so it
cannot flap.</p>
<p>If you need distance, move the whole box closer and run the USB cable instead.</p></div>

<div class="note tip"><span class="t">Mount it with a magnet, not tape</span>
<p>How the sensor is attached determines what it can hear. Double-sided tape is compliant and acts as a
low-pass filter, rolling off exactly the high frequencies where bearing faults live. A magnet on clean bare
metal is stiff and passes them.</p>
<p>Whatever you choose, never change it mid-baseline. Remounting shifts every number and looks precisely like
a developing fault.</p></div>

<div class="note"><span class="t">Two devices, one bus</span>
<p>The MPU6050 is at 0x68 and the OLED at 0x3C, so they coexist. If the IMU does not appear, check AD0 - tied
high it moves to 0x69.</p></div>`,

solderIntro: `<p>The soldering is to make the sensor connection rigid and permanent. A breadboard on a
vibrating machine works loose within a day, and an intermittent connection reads as a fault.</p>`,

solderSteps: [
  { h: 'Solder the IMU onto its own small board',
    body: `<p>Cut a piece of perfboard barely larger than the module and solder the module flat to it, not on
    header pins. Height above the mounting surface is compliance, and compliance filters out the frequencies
    you came for.</p>` },
  { h: 'Short stiff wires, strain relieved',
    body: `<p>Four wires plus the interrupt. Solid core rather than stranded, kept short, and anchored with a
    cable tie at both ends so vibration is not working the joints.</p>
    <p>A cracked solder joint on a vibrating machine is the classic failure of this project, and it presents as
    intermittent nonsense readings.</p>` },
  { h: 'Glue the magnet to the sensor board',
    body: `<p>Epoxy, flat, centred. The magnet is now the mechanical path from machine to sensor and it needs
    to be rigid - a magnet on a blob of hot glue is a spring.</p>` },
  { h: 'Everything else on the main board',
    body: `<p>ESP32, display and connectors on a separate piece of perfboard in the box. Only the sensor
    assembly goes on the machine.</p>` }
],

libraries: [
  { name: 'arduinoFFT', by: 'Enrique Condes', why: 'The FFT. Well tested and fast enough for 256 points on an ESP32 many times a second.' },
  { name: 'Adafruit MPU6050', by: 'Adafruit', why: 'Sensor driver. You will still write the low-pass filter register directly - see the sketch.' },
  { name: 'PubSubClient', by: 'Nick O’Leary', why: 'Publishing band energies to MQTT so you have a history to look at.' }
],

code: [{
  name: 'vibration_monitor.ino',
  code: `/* ------------------------------------------------------------------
   Motor vibration monitor - ESP32 + MPU6050

   Samples at 2 kHz, 256-point FFT, eight bands, baseline and 3-sigma
   alarm. Publishes band energies to MQTT.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <arduinoFFT.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define SAMPLES      256
#define SAMPLE_HZ    2000        // so we can see up to 1 kHz
#define BANDS        8
#define MPU_ADDR     0x68

double vReal[SAMPLES];
double vImag[SAMPLES];
ArduinoFFT<double> FFT(vReal, vImag, SAMPLES, SAMPLE_HZ);

float bandNow[BANDS];
float bandMean[BANDS];
float bandM2[BANDS];             // for a running standard deviation
long  baselineCount = 0;
bool  baselining = true;

WiFiClient net;
PubSubClient mqtt(net);

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.setClock(400000);

  mpuInit();

  WiFi.begin("your-network", "your-password");
  mqtt.setServer("192.168.1.10", 1883);

  Serial.println("Baselining. Leave the machine running normally.");
}

void loop() {
  sampleWindow();

  FFT.windowing(FFTWindow::Hamming, FFTDirection::Forward);
  FFT.compute(FFTDirection::Forward);
  FFT.complexToMagnitude();

  computeBands();

  if (baselining) {
    updateBaseline();
    // A week of real running, not an hour. Machines vary with load and
    // ambient temperature and the baseline has to contain that variation.
    if (baselineCount > 200000L) {
      baselining = false;
      Serial.println("Baseline locked. Monitoring.");
    }
  } else {
    checkForAnomaly();
  }

  publish();
  delay(500);
}

// ---- sensor ----------------------------------------------------------
void mpuInit() {
  writeReg(0x6B, 0x00);          // wake up

  /* THE important register. DLPF_CFG defaults to a ~44 Hz low pass,
     which removes every frequency this project is looking for. 0 sets
     the widest bandwidth (260 Hz accel), so the analogue filter is
     just below our 1 kHz Nyquist rather than far below it. */
  writeReg(0x1A, 0x00);

  writeReg(0x1C, 0x10);          // +/- 8 g - machine vibration clips at 2 g
}

void writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg); Wire.write(val);
  Wire.endTransmission();
}

/* Even sampling matters more than exact sampling. An FFT assumes equally
   spaced samples; jitter smears every peak into a hill. */
void sampleWindow() {
  const unsigned long periodUs = 1000000UL / SAMPLE_HZ;
  unsigned long next = micros();

  for (int i = 0; i < SAMPLES; i++) {
    while ((long)(micros() - next) < 0) { /* wait */ }
    next += periodUs;

    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3F);            // ACCEL_ZOUT_H - one axis is enough
    Wire.endTransmission(false);
    Wire.requestFrom(MPU_ADDR, 2, true);
    int16_t z = (Wire.read() << 8) | Wire.read();

    vReal[i] = (double)z;
    vImag[i] = 0.0;
  }

  // Remove DC - gravity is a constant 1 g and would dominate bin 0.
  double mean = 0;
  for (int i = 0; i < SAMPLES; i++) mean += vReal[i];
  mean /= SAMPLES;
  for (int i = 0; i < SAMPLES; i++) vReal[i] -= mean;
}

// ---- bands -----------------------------------------------------------
/* Eight logarithmic-ish bands. Reducing 128 usable bins to 8 numbers is
   what makes a baseline practical - you cannot learn the normal range of
   128 bins from a week of data, but you can learn eight. */
void computeBands() {
  const int edges[BANDS + 1] = {2, 6, 12, 22, 38, 60, 90, 128, 129};
  for (int b = 0; b < BANDS; b++) {
    double sum = 0;
    for (int i = edges[b]; i < edges[b + 1]; i++) sum += vReal[i];
    bandNow[b] = sum / (edges[b + 1] - edges[b]);
  }
}

// Welford's method: mean and variance in one pass, no history stored.
void updateBaseline() {
  baselineCount++;
  for (int b = 0; b < BANDS; b++) {
    float d = bandNow[b] - bandMean[b];
    bandMean[b] += d / baselineCount;
    bandM2[b]   += d * (bandNow[b] - bandMean[b]);
  }
}

void checkForAnomaly() {
  int raised = 0, worst = -1;
  float worstSigma = 0;

  for (int b = 0; b < BANDS; b++) {
    float sigma = sqrt(bandM2[b] / baselineCount);
    if (sigma < 1.0f) sigma = 1.0f;          // do not divide by near-zero
    float z = fabs(bandNow[b] - bandMean[b]) / sigma;
    if (z > 3.0f) {
      raised++;
      if (z > worstSigma) { worstSigma = z; worst = b; }
    }
  }

  if (raised == 0) return;

  /* Every band up at once is almost always the mounting coming loose,
     not the machine failing. Saying so is more useful than crying wolf. */
  if (raised >= BANDS - 1) {
    Serial.println("ALL BANDS UP - check the sensor mounting first");
    mqtt.publish("buildbook/vibration/alert", "mounting?");
    return;
  }

  int centreHz = (int)((worst + 0.5f) * (SAMPLE_HZ / 2) / BANDS);
  Serial.printf("ANOMALY band %d (~%d Hz) at %.1f sigma\\n", worst, centreHz, worstSigma);

  char msg[64];
  snprintf(msg, sizeof(msg), "band=%d hz=%d sigma=%.1f", worst, centreHz, worstSigma);
  mqtt.publish("buildbook/vibration/alert", msg);
}

void publish() {
  if (!mqtt.connected()) { mqtt.connect("vibration"); return; }
  mqtt.loop();
  char buf[128]; int n = 0;
  for (int b = 0; b < BANDS; b++)
    n += snprintf(buf + n, sizeof(buf) - n, "%s%.1f", b ? "," : "", bandNow[b]);
  mqtt.publish("buildbook/vibration/bands", buf);
}`
}],

trouble: [
  { q: 'The spectrum is almost flat with everything near zero',
    a: `The MPU6050's digital low-pass filter is still at its default, removing everything above about
    44&nbsp;Hz. Register 0x1A must be set to 0. This is the single commonest mistake in this project.` },
  { q: 'A large peak that does not move when the machine speeds up',
    a: `Not from the machine. Either it is aliased from something above 1&nbsp;kHz, or it is a resonance in the
    sensor cable or mounting. Real machine frequencies scale with shaft speed - that is how you tell.` },
  { q: 'Everything alarms after you moved the sensor',
    a: `Expected, and correct behaviour. Remounting changes the coupling and therefore every band. Re-baseline
    after any mechanical change.` },
  { q: 'Peaks are smeared across several bins',
    a: `Sample interval jitter. Check the real rate by timing a window - if it is not close to 2&nbsp;kHz,
    something in the loop is stealing time. Wi-Fi activity during sampling is a common culprit.` },
  { q: 'Readings clip at a fixed value',
    a: `The accelerometer range is too small. Machine vibration exceeds 2&nbsp;g easily on a hard mount;
    register 0x1C set to 0x10 gives 8&nbsp;g.` },
  { q: 'MPU6050 not found on the bus',
    a: `AD0 tied high moves it from 0x68 to 0x69. Run an I2C scanner - you should see both the IMU and the
    display.` },
  { q: 'Baseline never finishes',
    a: `200,000 windows at two per second is about a day of continuous running, and a week is better. That is
    deliberate. Shorten it for testing, but a short baseline produces a monitor that alarms whenever the load
    changes.` },
  { q: 'It never alarms at all',
    a: `Either nothing is wrong, or your baseline was collected while the fault was already present - in which
    case the fault is the normal. Baseline on a machine you have reason to believe is healthy.` }
],

next: `
<ul>
  <li><strong>Work out your actual bearing frequencies.</strong> They follow from the ball count, ball diameter
  and pitch diameter, and every bearing manufacturer publishes the formulas. Then a band edge can sit exactly
  on the defect frequency instead of near it.</li>
  <li><strong>Add a temperature sensor.</strong> Bearing temperature rising alongside high-frequency vibration
  is much stronger evidence than either alone.</li>
  <li><strong>Log to the <a href="project.html?p=epaper-dashboard">wall dashboard</a></strong> so a month of
  trend is visible without opening anything.</li>
  <li><strong>A real TinyML model</strong> instead of the statistical baseline - the same Edge Impulse workflow
  as the <a href="project.html?p=tinyml-wake-word">wake word</a>, with band energies as the input. It is more
  sensitive, and it needs examples of actual faults, which is the hard part.</li>
  <li><strong>Several machines, one dashboard.</strong> The comparison between two identical machines is often
  more informative than either one's history.</li>
</ul>`
});
