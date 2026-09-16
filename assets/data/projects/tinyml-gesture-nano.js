/* Nano 33 BLE Sense Rev2 running a neural network on the accelerometer. */
AB.addProject({
slug: 'tinyml-gesture-nano',
title: 'Gesture recognition with TinyML',
cat: 'ai',
level: 2,
time: '4 hours (plus training time)',
solder: false,
board: 'Nano 33 BLE Sense',
tags: ['tinyml', 'edge impulse', 'machine learning', 'nano 33 ble', 'bmi270', 'accelerometer', 'neural network', 'no soldering'],
blurb: 'Wave the board and it knows which gesture you made. A real neural network, trained on your own data, running in 20 kB on a microcontroller with no internet connection.',

skills: ['Data collection', 'Edge Impulse', 'Neural networks', 'Quantisation', 'IMU sampling', 'Inference on an MCU'],

intro: `
<p>This is the cheapest honest way into machine learning on hardware, and it is worth being clear about what
that means. There is no cloud API here. There is no Raspberry Pi phoning home. Once the model is flashed, the
board is a sealed object that has learned something, and you could drop it down a mineshaft and it would keep
working.</p>
<p>The gestures are yours. You will record yourself doing them a few dozen times, a service will train a small
network on that recording, and you will get back a file that runs on a 64&nbsp;MHz chip in about 12
milliseconds. The whole model is smaller than a JPEG of the board.</p>
<p>It is also the project where the phrase "machine learning" stops being mysterious. You will watch the
accuracy number go up as you add data, watch it go <em>down</em> when you add bad data, and find out that the
hard part was never the network - it was recording a clean dataset.</p>`,

what: [
  'Record your own gesture data straight off the board, over USB, into a browser.',
  'Train a small neural network on it without writing any training code.',
  'Run that network on the board itself - no network connection, no phone, no computer attached.',
  'Classify four gestures plus "idle" in about 12 ms, with a confidence score for each.',
  'Light a different LED per gesture and print the full score table over serial.',
  'Understand exactly how big the model is, how long it takes, and where it fails.'
],

how: `
<p><strong>The board.</strong> The Nano 33 BLE Sense Rev2 is an nRF52840: a 64&nbsp;MHz Cortex-M4F with
1&nbsp;MB of flash and 256&nbsp;KB of RAM. By microcontroller standards that is roomy, and it is roughly a
thousand times less than the machine you are reading this on. It also carries a pile of sensors on board - the
one we want is the <strong>BMI270</strong> accelerometer and gyroscope.</p>

<p><strong>What a gesture actually is, to a computer.</strong> Sample the accelerometer at 100&nbsp;Hz for one
second and you have 100 readings of three numbers - X, Y and Z acceleration. Flatten that and it is a list of
300 numbers. Every gesture you make produces a different list. The whole problem is: given 300 numbers, which
of five labels is this?</p>

<p>You could try to write that by hand. People did, for years, and it is miserable - "if X peaks above 8 and
then Z dips within 200&nbsp;ms and the total magnitude..." falls apart the moment someone else holds the
board. A network learns the rule from examples instead, and the examples are much easier to produce than the
rule.</p>

<p><strong>The training happens elsewhere.</strong> Training needs far more compute than the board has, so it
happens on a server - in this guide, Edge Impulse, which is free for personal use and does the tedious parts
well. The board's only job afterwards is <em>inference</em>: run the finished network forward, once, on one
new sample.</p>

<p><strong>Why it fits at all.</strong> Two reasons. The network is small - a couple of dense layers, a few
thousand weights. And it is <em>quantised</em>: the weights are stored as 8-bit integers rather than 32-bit
floats, which cuts the model to a quarter of its size and lets the Cortex-M4 do the arithmetic with integer
instructions. You lose a sliver of accuracy and gain the ability to run at all.</p>

<p><strong>What comes back.</strong> Not an answer - a set of probabilities, one per label, summing to 1. The
sketch decides what counts as confident enough. That threshold is a real design decision and the project gives
you a knob for it.</p>`,

bom: [
  { id: 'nano33ble', qty: 1, note: 'It must be the Sense, and for this guide the Rev2 - the Rev2 changed the IMU from the LSM9DS1 to the BMI270, which means a different library. Check the silkscreen.' },
  { id: 'usb-cable', qty: 1, note: 'Micro-USB, and it must be a data cable. A charge-only cable gives you a board that powers up and never appears as a port.' },
  { id: 'led5', qty: 4, note: 'One per gesture. Any colours - different ones make the demo readable from across a room.' },
  { id: 'res220', qty: 4 },
  { id: 'oled13', qty: 1, note: 'Optional but worth it: shows the winning label and its confidence without a computer attached.' },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'lipo2000', qty: 1, note: 'Optional. Once it runs untethered, the demo becomes convincing in a way the USB version never is.' }
],

tools: [{ id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'nano', comp: 'nano33', at: [0, 52] },
    { id: 'bb',   comp: 'bb400',  at: [0, -8] },
    { id: 'oled', comp: 'oled13', at: [0, -60], ry: 180 },
    { id: 'l1',   comp: 'led5',   at: [-33, -34], opt: { c: '#e0483c' } },
    { id: 'l2',   comp: 'led5',   at: [-11, -34], opt: { c: '#e8c44a' } },
    { id: 'l3',   comp: 'led5',   at: [11, -34],  opt: { c: '#3fbf6a' } },
    { id: 'l4',   comp: 'led5',   at: [33, -34],  opt: { c: '#4a8fe0' } }
  ],
  wires: [
    { from: 'nano.3V3',  to: 'bb.T+2',  color: 'red',    note: '3.3 V rail. This board has no 5 V logic anywhere' },
    { from: 'nano.GND',  to: 'bb.T-2',  color: 'black',  note: 'Ground rail' },
    { from: 'oled.VCC',  to: 'bb.T+8',  color: 'red',    note: 'OLED power, 3.3 V' },
    { from: 'oled.GND',  to: 'bb.T-8',  color: 'black',  note: 'OLED ground' },
    { from: 'oled.SDA',  to: 'nano.A4', color: 'blue',   note: 'I2C data - A4 is SDA on the Nano footprint' },
    { from: 'oled.SCL',  to: 'nano.A5', color: 'yellow', note: 'I2C clock' },
    { from: 'l1.A',      to: 'nano.D2', color: 'orange', note: 'Gesture 1 LED, through 220 ohm' },
    { from: 'l1.K',      to: 'bb.T-14', color: 'black',  note: 'Cathode to ground' },
    { from: 'l2.A',      to: 'nano.D3', color: 'orange', note: 'Gesture 2 LED, through 220 ohm' },
    { from: 'l2.K',      to: 'bb.T-16', color: 'black',  note: 'Cathode to ground' },
    { from: 'l3.A',      to: 'nano.D4', color: 'orange', note: 'Gesture 3 LED, through 220 ohm' },
    { from: 'l3.K',      to: 'bb.T-18', color: 'black',  note: 'Cathode to ground' },
    { from: 'l4.A',      to: 'nano.D5', color: 'orange', note: 'Gesture 4 LED, through 220 ohm' },
    { from: 'l4.K',      to: 'bb.T-20', color: 'black',  note: 'Cathode to ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">3.3 V board. Nothing here is 5 V tolerant.</span>
<p>The nRF52840 runs at 3.3&nbsp;V and its pins are <strong>not</strong> 5&nbsp;V tolerant, unlike a classic
Nano. Do not connect a 5&nbsp;V sensor's output straight to a pin, do not feed 5&nbsp;V into the 3V3 pin, and
be careful about reusing a breadboard layout from an Uno project.</p>
<p>The <code>VIN</code> pin will take 5-18&nbsp;V through the on-board regulator. The <code>3V3</code> pin is
an <em>output</em>, good for about 200&nbsp;mA total.</p></div>

<div class="note tip"><span class="t">The IMU is already on the board</span>
<p>There is nothing to wire for the actual machine learning. The LEDs and the OLED are output for your benefit;
a completely bare board with nothing but a USB cable does the whole project. Build the bare version first, get
it classifying over serial, and add the display afterwards.</p></div>

<div class="note warn"><span class="t">LED current on a 3.3 V board</span>
<p>220&nbsp;&Omega; from 3.3&nbsp;V through a red LED gives about 7&nbsp;mA, which is visible but not bright.
That is deliberate: the nRF52840 is happiest well under its 15&nbsp;mA per-pin limit, and four LEDs lit at once
on a board you may later run from a LiPo adds up. If you want them brighter use 150&nbsp;&Omega;, not 100.</p>
</div>`,

solderSteps: [
  { h: 'Only if your board came without headers',
    body: `<p>Most Nano 33 BLE Sense boards ship with headers already fitted. If yours did not, this is the
    easiest header job in the book: push both 15-pin strips into a breadboard, drop the board on top, and the
    breadboard holds everything square for you.</p>
    <p>Tack one corner pin on each strip. Look along the board from the side - it should sit parallel to the
    breadboard, not tilted. Reheat and nudge if not. Then do the remaining 28 pins, about two seconds each at
    330&nbsp;&deg;C.</p>` },
  { h: 'Do not use much heat near the sensors',
    body: `<p>The sensor cluster sits on the top face near one end. They are reflow-soldered parts and a
    soldering iron parked on a nearby pin for ten seconds will conduct enough heat to matter. Two to three
    seconds per joint, then move on. If a joint is not flowing, the iron is too cold - not the dwell too
    short.</p>` }
],

assembly: [
  { h: 'Install the board support package first',
    body: `<p>Tools &rarr; Board &rarr; Boards Manager, search for <strong>Arduino Mbed OS Nano Boards</strong>
    and install it. Then Tools &rarr; Board &rarr; Arduino Mbed OS Nano Boards &rarr; <strong>Arduino Nano 33
    BLE</strong>. There is no separate "Sense" or "Rev2" entry - one board definition covers all of them.</p>
    <p>It is a large download and it has to happen before anything else works.</p>` },
  { h: 'Prove the board and the IMU work before you go near machine learning',
    body: `<p>Upload the raw-data sketch below. It prints three columns of numbers at 100&nbsp;Hz. Tilt the
    board and watch them change: flat on the desk should read roughly <code>0, 0, 1</code> - one g straight
    down.</p>
    <p>If that does not work, stop here. Every problem after this point is ten times harder to diagnose with a
    sensor of unknown health underneath it.</p>` },
  { h: 'Pick four gestures that are actually different',
    body: `<p>This is the most important decision in the project and it takes thirty seconds of thought.</p>
    <p>Good set: <strong>punch</strong> forward, <strong>flex</strong> (a sharp wrist twist), <strong>circle</strong>
    (draw one in the air), <strong>shake</strong> (side to side). Plus <strong>idle</strong> - the board sitting
    still or being carried normally.</p>
    <p>Bad set: "circle clockwise" and "circle anticlockwise". They differ in one axis' sign for a fraction of
    the window, and you will spend an evening wondering why the model is at 60%.</p>
    <p><strong>Always include an idle class.</strong> Without one the network has no way to say "nothing is
    happening", so it will confidently report a gesture every single second, forever.</p>` },
  { h: 'Create an Edge Impulse project and connect the board',
    body: `<p>Sign up at <a href="https://edgeimpulse.com" target="_blank" rel="noopener">edgeimpulse.com</a>
    and create a project. Then install the CLI, which needs Node.js:</p>
    <p>The tool that matters is <code>edge-impulse-data-forwarder</code>. It reads comma-separated numbers off
    the serial port and uploads them as labelled samples - which means the raw-data sketch you already
    uploaded <em>is</em> your data collection firmware. You do not flash anything special.</p>` },
  { h: 'Record the data. This is the whole project.',
    body: `<p>In the Edge Impulse web UI, go to <strong>Data acquisition</strong>. Your board appears as a
    connected device. Set the label, set the sample length to 2000&nbsp;ms, and hit Start sampling.</p>
    <p>Record <strong>at least 30 samples of each gesture</strong>, and 50 is better. That sounds like a lot.
    It is about ten minutes per gesture and it is the difference between a model that works and one that
    nearly works.</p>
    <p>Vary it deliberately while recording: fast and slow, large and small, board held in different grips,
    and - if anyone else is around - get them to do a handful too. A dataset recorded by one person sitting
    still in one chair produces a model that only works for that person in that chair.</p>
    <p>For idle, record a few minutes of the board on the desk, in a pocket, being picked up and put down.</p>` },
  { h: 'Split off a test set, honestly',
    body: `<p>Edge Impulse will offer to split roughly 80/20 into training and test. Let it, and then
    <strong>do not look at the test results until the end</strong>. If you tune the model against the test set
    you have quietly trained on it, and the accuracy it reports stops meaning anything.</p>` },
  { h: 'Design the impulse',
    body: `<p><strong>Create impulse</strong>: window size 1000&nbsp;ms, window increase 250&nbsp;ms, frequency
    100&nbsp;Hz. Add a <strong>Spectral Analysis</strong> processing block and a
    <strong>Classification</strong> learning block.</p>
    <p>Spectral analysis is doing real work here: instead of handing 300 raw numbers to the network, it
    extracts frequency and power features from each axis, which cuts the input to a few dozen values and makes
    the model dramatically smaller. A shake and a punch differ hugely in frequency content.</p>
    <p>On the Spectral features page, click <strong>Generate features</strong> and look at the scatter plot. If
    your gesture clusters are visibly separate there, the network's job is easy. If they are one blob, no
    amount of training will fix it - go back and record better data, or pick more distinct gestures.</p>` },
  { h: 'Train it',
    body: `<p>Classifier page, 100 training cycles, learning rate 0.0005, and press Start training. It takes a
    minute or two.</p>
    <p>You want validation accuracy above 90%. The confusion matrix below it is more useful than the single
    number - it shows you <em>which</em> gestures are being mixed up, which usually points straight at two
    classes that are too similar.</p>` },
  { h: 'Check it against the test set, once',
    body: `<p><strong>Model testing</strong> &rarr; Classify all. This is the number that counts, because the
    model has never seen this data. Expect it to be a few points below the validation figure. If it is twenty
    points below, the model memorised the training set and you need more, and more varied, data.</p>` },
  { h: 'Deploy as an Arduino library',
    body: `<p><strong>Deployment</strong> &rarr; Arduino library &rarr; and make sure
    <strong>Quantized (int8)</strong> is selected, not Unoptimized (float32). The page shows you the estimated
    on-device inference time and RAM use for each - read those numbers, they are the point of the exercise.</p>
    <p>Build, and you get a .zip. In the Arduino IDE: Sketch &rarr; Include Library &rarr; <strong>Add .ZIP
    Library</strong> and select it.</p>` },
  { h: 'Flash the classifier and wave at it',
    body: `<p>Open the inference sketch below, change the <code>#include</code> at the top to your project's
    header name (the library folder tells you what it is), set the label names, and upload.</p>
    <p>Serial Monitor at 115200. It prints a score for each label about four times a second. Make a gesture and
    watch one column jump.</p>` }
],

libraries: [
  { name: 'Arduino_BMI270_BMM150', by: 'Arduino', why: 'The IMU driver for the Rev2 board. If your board is a Rev1 you need Arduino_LSM9DS1 instead, and the function names differ.' },
  { name: 'Your Edge Impulse library', by: 'generated', how: 'Sketch > Include Library > Add .ZIP Library', why: 'Contains your trained model, the inference engine, and the DSP block. Regenerate and re-add it every time you retrain.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The optional OLED. Pulls in Adafruit GFX with it.' },
  { name: 'Edge Impulse CLI', by: 'Edge Impulse', how: 'npm install -g edge-impulse-cli', why: 'Command-line tools. Only edge-impulse-data-forwarder is needed for this project.' }
],

code: [
{
  h: 'Step 1: raw data, and your data collection firmware',
  intro: `<p>This does two jobs. It proves the IMU is alive, and it is the exact firmware the Edge Impulse
  data forwarder reads from - three comma-separated values at a steady 100&nbsp;Hz. Upload it once and leave
  it on the board for the whole data collection phase.</p>`,
  name: 'imu_raw_100hz.ino',
  code: `/* ------------------------------------------------------------------
   Nano 33 BLE Sense Rev2 - raw accelerometer at a steady 100 Hz.

   Prints:  x,y,z   in g, three decimals, one line per sample.

   This is both the "is my board alive" test and the firmware that
   edge-impulse-data-forwarder reads during data collection.
   ------------------------------------------------------------------ */

#include <Arduino_BMI270_BMM150.h>

#define SAMPLE_HZ      100
#define INTERVAL_US    (1000000 / SAMPLE_HZ)

unsigned long nextSample = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);   // don't hang if run untethered

  if (!IMU.begin()) {
    Serial.println("IMU failed to start.");
    while (1) {                          // fast blink = dead sensor
      digitalWrite(LED_BUILTIN, HIGH); delay(80);
      digitalWrite(LED_BUILTIN, LOW);  delay(80);
    }
  }

  // Sanity numbers, printed once. Flat on a desk you want ~0, 0, 1.
  Serial.print("# accel sample rate: ");
  Serial.print(IMU.accelerationSampleRate());
  Serial.println(" Hz");

  nextSample = micros();
}

void loop() {
  /* A fixed-interval loop, not delay(). The forwarder infers the
     sample rate from the timing of these lines, so jitter here turns
     into a dataset that does not match what the model later sees. */
  if ((long)(micros() - nextSample) < 0) return;
  nextSample += INTERVAL_US;

  float x, y, z;
  if (!IMU.accelerationAvailable()) return;
  IMU.readAcceleration(x, y, z);

  Serial.print(x, 3); Serial.print(',');
  Serial.print(y, 3); Serial.print(',');
  Serial.println(z, 3);
}`,
  after: `<p>Open the Serial Plotter (Tools &rarr; Serial Plotter, 115200) and tilt the board. You should see
  three traces swapping places as gravity moves between the axes. That is the single best proof that the
  sensor, the bus and the timing are all healthy.</p>
  <p>If <code>IMU.begin()</code> fails, the usual cause is the wrong library: <code>Arduino_LSM9DS1</code> on
  a Rev2 board compiles perfectly and then fails at runtime, because the Rev2 has a different chip on a
  different address.</p>`
},
{
  h: 'Step 2: point the forwarder at it',
  intro: `<p>Run this in a terminal with the board plugged in and the Arduino Serial Monitor
  <strong>closed</strong> - only one program can hold a serial port.</p>`,
  name: 'collect.sh',
  lang: 'Shell',
  code: `# One-time: the CLI needs Node.js 14 or newer
npm install -g edge-impulse-cli

# Point the board at your project. It will ask for your login and
# which project to use, then detect the sample rate from the data.
edge-impulse-data-forwarder

# It should say something like:
#   Detecting data frequency... 100Hz
#   3 sensor axes detected. What do you want to call them? accX,accY,accZ
#   What name do you want to give this device? nano33

# If you ever need to point it somewhere else:
edge-impulse-data-forwarder --clean`,
  after: `<p>Once it says the device is connected, go to <strong>Data acquisition</strong> in the web UI and
  the board is there. Record from the browser; the forwarder just pipes the numbers.</p>
  <p><code>--clean</code> forgets the saved project and credentials, which is what you want when you start a
  second project and the forwarder keeps uploading into the first one.</p>`
},
{
  h: 'Step 3: the classifier',
  intro: `<p>Change the <code>#include</code> to match your own project's generated header - look in the
  library folder Arduino created, it is named after your project. Then set the <code>LABELS</code> array to
  your labels in the same order Edge Impulse lists them.</p>`,
  name: 'gesture_classifier.ino',
  code: `/* ------------------------------------------------------------------
   Gesture classifier - Nano 33 BLE Sense Rev2

   Continuously samples the accelerometer into a 1-second ring buffer,
   runs the Edge Impulse model on it four times a second, and lights
   one LED per recognised gesture.

   Change the include below to YOUR project's header.
   ------------------------------------------------------------------ */

#include <my_gesture_project_inferencing.h>   // <-- YOURS
#include <Arduino_BMI270_BMM150.h>

/* ---- these must match your impulse ---------------------------------
   EI_CLASSIFIER_* come from the generated library, so they are always
   correct for the model you actually built. Never hardcode them. */
#define SAMPLE_HZ        100
#define INTERVAL_US      (1000000 / SAMPLE_HZ)
#define INFER_EVERY_MS   250        // window increase: 4 predictions/sec

/* Label order must match the model. Print ei_classifier_inferencing_categories
   once if you are unsure - see the note under this sketch. */
const char *LABELS[] = { "circle", "flex", "idle", "punch", "shake" };
const int   LED_FOR[] = {    2,      3,     -1,      4,       5   };

#define CONFIDENCE  0.70f          // below this, report nothing

static float buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE];
static size_t bufPos = 0;
static bool   bufFull = false;

unsigned long nextSample = 0;
unsigned long lastInfer  = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  for (int i = 0; i < EI_CLASSIFIER_LABEL_COUNT; i++) {
    if (LED_FOR[i] >= 0) { pinMode(LED_FOR[i], OUTPUT); digitalWrite(LED_FOR[i], LOW); }
  }

  if (!IMU.begin()) {
    Serial.println("IMU failed.");
    while (1);
  }

  Serial.println("--- model ---");
  Serial.print("window    : "); Serial.print(EI_CLASSIFIER_RAW_SAMPLE_COUNT); Serial.println(" samples");
  Serial.print("axes      : "); Serial.println(EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME);
  Serial.print("labels    : "); Serial.println(EI_CLASSIFIER_LABEL_COUNT);
  Serial.println("Ready. Make a gesture.");

  nextSample = micros();
}

void loop() {
  /* --- 1. keep the ring buffer fed at exactly 100 Hz --------------- */
  if ((long)(micros() - nextSample) >= 0) {
    nextSample += INTERVAL_US;

    if (IMU.accelerationAvailable()) {
      float x, y, z;
      IMU.readAcceleration(x, y, z);
      buffer[bufPos++] = x;
      buffer[bufPos++] = y;
      buffer[bufPos++] = z;
      if (bufPos >= EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE) { bufPos = 0; bufFull = true; }
    }
  }

  /* --- 2. classify on a slower clock ------------------------------ */
  if (!bufFull) return;
  if (millis() - lastInfer < INFER_EVERY_MS) return;
  lastInfer = millis();

  classifyNow();
}

void classifyNow() {
  signal_t signal;
  int err = numpy::signal_from_buffer(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);
  if (err != 0) {
    Serial.print("signal_from_buffer failed: "); Serial.println(err);
    return;
  }

  ei_impulse_result_t result = { 0 };
  EI_IMPULSE_ERROR r = run_classifier(&signal, &result, false);
  if (r != EI_IMPULSE_OK) {
    Serial.print("run_classifier failed: "); Serial.println(r);
    return;
  }

  /* --- 3. find the winner ----------------------------------------- */
  int   best = 0;
  float bestScore = 0.0f;
  for (int i = 0; i < EI_CLASSIFIER_LABEL_COUNT; i++) {
    if (result.classification[i].value > bestScore) {
      bestScore = result.classification[i].value;
      best = i;
    }
  }

  /* --- 4. show it -------------------------------------------------- */
  for (int i = 0; i < EI_CLASSIFIER_LABEL_COUNT; i++) {
    if (LED_FOR[i] >= 0) digitalWrite(LED_FOR[i], LOW);
  }

  if (bestScore >= CONFIDENCE && LED_FOR[best] >= 0) {
    digitalWrite(LED_FOR[best], HIGH);
  }

  /* Print every score, not just the winner. Watching the runners-up is
     how you find out which two gestures the model confuses. */
  for (int i = 0; i < EI_CLASSIFIER_LABEL_COUNT; i++) {
    Serial.print(result.classification[i].label);
    Serial.print(':');
    Serial.print(result.classification[i].value, 2);
    Serial.print("  ");
  }
  Serial.print("| dsp ");
  Serial.print(result.timing.dsp);
  Serial.print("ms  nn ");
  Serial.print(result.timing.classification);
  Serial.println("ms");
}`,
  after: `<p>The timing line at the end is the most interesting output in this project. On a Nano 33 you
  should see something like <code>dsp 7ms nn 2ms</code> - and notice that the signal processing costs more
  than the neural network does. That is normal for spectral features and it surprises everyone.</p>
  <p><strong>If your labels come out in the wrong order</strong>, do not guess. The generated library defines
  them; add <code>Serial.println(ei_classifier_inferencing_categories[i]);</code> in a loop in
  <code>setup()</code> and read the true order off the serial port.</p>`
},
{
  h: 'Optional: put the result on the OLED',
  intro: `<p>Drop these two functions into the sketch above and call <code>showResult()</code> at the end of
  <code>classifyNow()</code>. Now the board is a self-contained object again.</p>`,
  name: 'oled_display.ino',
  code: `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 oled(128, 64, &Wire, -1);

void oledBegin() {
  if (!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("No OLED at 0x3C - try 0x3D");
    return;
  }
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(1);
  oled.setCursor(0, 28);
  oled.println("waiting...");
  oled.display();
}

void showResult(const char *label, float score) {
  oled.clearDisplay();

  // The label, big, centred-ish
  oled.setTextSize(2);
  oled.setCursor(0, 8);
  oled.println(score >= CONFIDENCE ? label : "-");

  // The confidence as a number and a bar
  oled.setTextSize(1);
  oled.setCursor(0, 34);
  oled.print(int(score * 100));
  oled.println('%');

  oled.drawRect(0, 46, 128, 10, SSD1306_WHITE);
  oled.fillRect(0, 46, int(score * 128), 10, SSD1306_WHITE);

  // A tick mark where the confidence threshold sits, so you can see
  // how close a rejected gesture came.
  oled.drawFastVLine(int(CONFIDENCE * 128), 43, 16, SSD1306_WHITE);

  oled.display();
}`,
  after: `<p>Call <code>oledBegin()</code> at the end of <code>setup()</code> and
  <code>showResult(result.classification[best].label, bestScore);</code> at the end of
  <code>classifyNow()</code>.</p>
  <p>The tick mark at the threshold is worth keeping. Watching a gesture reach 65% against a 70% threshold
  tells you far more than a blank screen does.</p>`
}],

upload: `
<p>Board: <strong>Arduino Nano 33 BLE</strong>, under Arduino Mbed OS Nano Boards. Serial Monitor at
<strong>115200</strong>.</p>
<p>The classifier sketch is large - expect a 30 to 60 second compile the first time, and a noticeable upload.
That is the model and the inference engine, and it is normal.</p>
<div class="note tip"><span class="t">If the port vanishes, double-tap the reset button</span>
<p>The nRF52840 uses a soft USB stack, so a crashing sketch can take the serial port down with it and the IDE
will say "no device found". Double-tap the reset button quickly: the orange LED breathes slowly, the board
appears as a bootloader drive, and you can upload again. This will happen to you at least once.</p></div>
<div class="note warn"><span class="t">Close the Serial Monitor before running the forwarder</span>
<p>The Arduino Serial Monitor and <code>edge-impulse-data-forwarder</code> both want exclusive access to the
port. Whichever gets there second fails with a confusing error about the device being busy or not found.</p>
</div>`,

tune: [
  { h: 'The confidence threshold is a real decision',
    body: `<p><code>CONFIDENCE</code> at 0.70 is a starting point, not a truth. Lower it and the board responds
    eagerly and fires on things you did not mean; raise it and it ignores sloppy gestures.</p>
    <p>Which way to err depends entirely on what the gesture does. A gesture that changes an LED colour should
    be eager. A gesture that unlocks a door should not.</p>` },
  { h: 'Require agreement across several windows',
    body: `<p>A single 250&nbsp;ms window firing once is noisy. Keep a small history and only act when the same
    label wins two or three windows in a row:</p>
    <p><code>if (best == lastBest) { streak++; } else { streak = 1; lastBest = best; }</code> and act on
    <code>streak >= 3</code>. It adds half a second of latency and removes almost all the spurious
    triggers.</p>` },
  { h: 'More data beats more training cycles, every time',
    body: `<p>If accuracy is stuck around 80%, the instinct is to train for 200 cycles instead of 100. That
    almost never helps and often overfits.</p>
    <p>Record 20 more samples of your two worst classes instead - the confusion matrix tells you which they
    are. Half an hour of recording routinely buys ten points that no amount of hyperparameter fiddling
    will.</p>` },
  { h: 'Add the gyroscope if two gestures stay confused',
    body: `<p>Rotation is invisible to an accelerometer at constant speed. If your model cannot separate two
    twisting gestures, add the three gyro axes: read them with <code>IMU.readGyroscope()</code>, push six
    values per sample instead of three, and tell Edge Impulse there are six axes. Model size roughly doubles;
    on this board that is affordable.</p>` },
  { h: 'Run it from a battery',
    body: `<p>The demo changes character completely when there is no cable. A 2000&nbsp;mAh LiPo on VIN gives
    a couple of days of continuous inference. To go much longer you need to stop classifying four times a
    second and instead wake on the BMI270's own motion interrupt - the board then sleeps at microamps and only
    thinks when something moves.</p>` }
],

trouble: [
  { q: '<code>IMU failed to start</code>',
    a: `Almost always the wrong library for your board revision. <code>Arduino_LSM9DS1</code> is for Rev1;
    <code>Arduino_BMI270_BMM150</code> is for Rev2. Both compile fine on either board, and only fail at
    runtime, which makes this confusing. Check the silkscreen for "Rev2".` },
  { q: 'The sketch will not compile - missing header',
    a: `The <code>#include</code> at the top must match your own generated library, not the placeholder. Look
    in your Arduino <code>libraries</code> folder for the folder Edge Impulse created; the header inside it is
    named <code>&lt;yourproject&gt;_inferencing.h</code>.` },
  { q: '<code>region of memory overflowed</code> or it compiles but crashes immediately',
    a: `The model does not fit. Go back to Deployment and make sure you selected <strong>Quantized
    (int8)</strong> rather than float32 - it is roughly a quarter of the size. If it still will not fit,
    reduce the window to 500&nbsp;ms or drop a layer in the classifier.` },
  { q: 'Everything classifies as one label, always',
    a: `Usually a missing or tiny idle class, so the network was never shown what "nothing" looks like.
    Sometimes it is label order: <code>LABELS[]</code> in the sketch not matching the model's own order, so
    you are lighting the wrong LED for a correct prediction. Print
    <code>ei_classifier_inferencing_categories</code> to check.` },
  { q: '95% in training, useless in the room',
    a: `The classic overfit, and it is a data problem rather than a model problem. Your samples were all
    recorded by one person, in one grip, at one speed, in one sitting. Re-record with deliberate variation and
    get someone else to contribute. Check the test-set number rather than the validation number - the gap
    between them is the size of the problem.` },
  { q: 'The forwarder detects the wrong frequency',
    a: `Your loop is not keeping time. <code>delay(10)</code> gives you noticeably less than 100&nbsp;Hz once
    the Serial prints are counted, which is why the sketch uses a <code>micros()</code> deadline instead. If
    the forwarder says 87&nbsp;Hz, fix the firmware rather than accepting it - the model will be trained at a
    rate the board cannot reproduce.` },
  { q: 'Predictions lag about a second behind the gesture',
    a: `That is the window, working as designed: the model cannot classify a one-second gesture until a
    second of it exists. Shorten the window to 500&nbsp;ms if your gestures are quick, and retrain - you
    cannot change the window in the sketch alone.` },
  { q: 'The board disappears from the IDE after uploading',
    a: `Double-tap reset to get the bootloader, then upload again. If it happens every time, something in
    your sketch is crashing during <code>setup()</code> before USB comes up - usually a library that blocks
    forever waiting for hardware that is not there.` }
],

next: `
<ul>
  <li><strong>Listen to a machine instead of a hand</strong> - the same board, the same workflow, applied to
  vibration and sound: <a href="project.html?p=tinyml-machine-listener">the machine listener</a>.</li>
  <li><strong>Send the gesture over BLE.</strong> The nRF52840 has a full Bluetooth Low Energy radio sitting
  idle. Use ArduinoBLE to advertise the recognised gesture as a characteristic and you have a wireless remote
  that no phone app needs to understand.</li>
  <li><strong>Drive something real.</strong> The classifier's output is just an integer - point it at a
  <a href="project.html?p=smart-plug-relay">relay</a> or a
  <a href="project.html?p=rgb-mood-lamp">light</a>.</li>
  <li><strong>Move up to vision.</strong> Gestures are the easy end of the same idea. When you want the board
  to recognise <em>objects</em>, a microcontroller is no longer enough - that is
  <a href="project.html?p=uno-q-object-detection">the UNO Q object detector</a>, and the jump in what is
  required is instructive.</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">Nothing here is dangerous. Two things are worth knowing anyway.</span>
<ul>
  <li><strong>The board is 3.3 V and not 5 V tolerant.</strong> The most likely way to destroy this project is
  to wire a 5&nbsp;V sensor to it out of habit.</li>
  <li><strong>If you fit a LiPo</strong>, read the LiPo notes in the
  <a href="basics/power.html">power basics</a> first. A pouch cell with no protection board, charged from
  the wrong thing, is the one genuinely hazardous component in this book.</li>
  <li><strong>Your training data leaves the room.</strong> Edge Impulse is a cloud service and your recordings
  are uploaded to it. For accelerometer wiggles that is nothing; be more thoughtful before you point the same
  workflow at a microphone in your house. The finished model runs entirely offline - it is only the training
  that is remote.</li>
</ul>
</div>`
});
