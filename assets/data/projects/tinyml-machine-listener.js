/* Nano 33 BLE Sense doing anomaly detection on a machine's sound and vibration. */
AB.addProject({
slug: 'tinyml-machine-listener',
title: 'Machine listener: anomaly detection',
cat: 'ai',
level: 3,
time: '5 hours (plus a day of recording)',
solder: true,
board: 'Nano 33 BLE Sense',
tags: ['tinyml', 'anomaly detection', 'edge impulse', 'predictive maintenance', 'mfcc', 'pdm microphone', 'vibration', 'nano 33 ble'],
blurb: 'Stick it to a pump, a fan or a 3D printer. It learns what healthy sounds like, then tells you when that changes - without ever being shown a fault.',

skills: ['Anomaly detection', 'Unsupervised learning', 'MFCC audio features', 'PDM microphones', 'Vibration sensing', 'Thresholds and false alarms'],

intro: `
<p>Every classifier in the previous project needed examples of each thing it should recognise. That works for
gestures, because you can perform a gesture fifty times on demand. It does not work for machine faults,
because to record a failing bearing you need a failing bearing, and the entire point is to catch the failure
before you have one.</p>
<p>Anomaly detection sidesteps this. You train it on <em>nothing but healthy data</em>. The model learns the
shape of normal, and then reports how far each new moment sits from that shape. It never learns what "broken"
means and it does not need to - it only needs to notice that today does not sound like every other day.</p>
<p>This is the technique behind a large slice of industrial condition monitoring, and it is the most
practically useful thing in this theme. A $55 board taped to a circulation pump can give you three weeks of
warning before a bearing seizes, and it does it by listening.</p>`,

what: [
  'Record hours of a machine running normally, hands-off, straight to a laptop.',
  'Train an anomaly model on that healthy data alone - no fault examples needed, ever.',
  'Report a continuous anomaly score rather than a yes/no, so you can watch a trend develop.',
  'Combine sound (16 kHz microphone) and vibration (three accelerometer axes) in one judgement.',
  'Light green, amber and red, and beep once when it crosses from amber to red.',
  'Keep a rolling baseline so a machine that is simply warming up does not trigger it.'
],

how: `
<p><strong>Two senses, both already on the board.</strong> The Nano 33 BLE Sense carries an MP34DT06JTR PDM
microphone and a BMI270 accelerometer. Sound catches things that are happening fast - bearing chatter, a belt
slipping, cavitation in a pump. Vibration catches things that are happening slowly - imbalance, a mount
working loose, a fan blade picking up dust on one side. Most faults show up in one before the other, and which
one depends on the machine.</p>

<p><strong>MFCCs, and why raw audio is hopeless.</strong> At 16&nbsp;kHz, one second of sound is 16,000
numbers. No microcontroller is going to run a network over that, and it would be a waste anyway, because
almost none of those numbers matter.</p>
<p>The standard answer is <strong>MFCC</strong> - mel-frequency cepstral coefficients. It chops the audio into
short overlapping frames, takes the spectrum of each, groups the frequency bins onto a <em>mel</em> scale
(which spaces bands the way human hearing does - fine detail low down, coarse up high), and reduces each frame
to around 13 coefficients. One second of audio becomes a small grid of numbers describing its timbre over
time. That grid is what the model sees, and it is a few hundred values instead of sixteen thousand.</p>
<p>MFCCs were invented for speech, and they work here for the same reason: they describe the shape of a sound
rather than its exact waveform, so two recordings of the same pump a minute apart look almost identical even
though not one sample matches.</p>

<p><strong>K-means, which is the actual anomaly detector.</strong> Edge Impulse's anomaly block is
deliberately simple, and the simplicity is a feature. Take all your healthy feature vectors and find, say, 32
cluster centres among them - that is K-means, and it is old, fast and has no opinions. For a new sample,
measure the distance to the nearest centre. Close to a centre means "this looks like something I have seen
thousands of times". Far from every centre means "I have never seen anything like this", which is the only
claim the model is actually entitled to make.</p>
<p>It cannot tell you what is wrong. It can only tell you that something is. In practice that is enough,
because you are the one who walks over and listens.</p>

<p><strong>What the score means.</strong> Roughly, the squared distance to the nearest cluster centre. Values
under about 0.3 are comfortably inside the training distribution. Above 1.0 is genuinely unusual. But these
numbers are relative to <em>your</em> machine and <em>your</em> data, so the project spends a session
establishing what normal looks like before it draws any lines.</p>`,

bom: [
  { id: 'nano33ble', qty: 1, note: 'The Sense, Rev2. The plain Nano 33 BLE has no microphone and no IMU, which removes both senses this project uses.' },
  { id: 'usb-cable', qty: 1, note: 'Micro-USB data cable.' },
  { id: 'oled13', qty: 1, note: 'Shows the live score and the trend. On a machine in a plant room this is the whole interface.' },
  { id: 'led5', qty: 3, note: 'Green, amber, red.' },
  { id: 'res220', qty: 3 },
  { id: 'buzzer', qty: 1, note: 'One beep on the amber-to-red transition. Resist the urge to make it continuous.' },
  { id: 'perfboard', qty: 1, note: 'This one wants to be permanent. It is going to live on a machine for months.' },
  { id: 'headers-f', qty: 1, note: 'Socket the board rather than soldering it down - you will want to reflash it.' },
  { id: 'box-abs', qty: 1, note: 'Needs a hole for the microphone. See the assembly notes - this matters more than it sounds.' },
  { id: 'magnet', qty: 1, note: 'For mounting to anything ferrous. A rigid mount is essential for the vibration half to mean anything.' },
  { id: 'tape', qty: 1, own: true, note: 'Double-sided VHB for non-magnetic machines. Not foam mounting tape - foam is a vibration isolator, which is exactly wrong here.' },
  { id: 'psu5v3a', qty: 1, note: 'It runs continuously, so it lives on a charger rather than a battery.' },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano33', at: [0, 50] },
    { id: 'bb',   comp: 'bb400',  at: [0, -10] },
    { id: 'oled', comp: 'oled13', at: [0, -62], ry: 180 },
    { id: 'lg',   comp: 'led5',   at: [-30, -36], opt: { c: '#3fbf6a' } },
    { id: 'la',   comp: 'led5',   at: [-10, -36], opt: { c: '#e8a33a' } },
    { id: 'lr',   comp: 'led5',   at: [10, -36],  opt: { c: '#e0483c' } },
    { id: 'buz',  comp: 'buzzer', at: [36, -34] }
  ],
  wires: [
    { from: 'nano.3V3', to: 'bb.T+2',  color: 'red',    note: '3.3 V rail. This board is 3.3 V throughout' },
    { from: 'nano.GND', to: 'bb.T-2',  color: 'black',  note: 'Ground rail' },
    { from: 'oled.VCC', to: 'bb.T+8',  color: 'red',    note: 'OLED power' },
    { from: 'oled.GND', to: 'bb.T-8',  color: 'black',  note: 'OLED ground' },
    { from: 'oled.SDA', to: 'nano.A4', color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL', to: 'nano.A5', color: 'yellow', note: 'I2C clock' },
    { from: 'lg.A',     to: 'nano.D2', color: 'green',  note: 'Green LED through 220 ohm - score is normal' },
    { from: 'lg.K',     to: 'bb.T-12', color: 'black',  note: 'Cathode to ground' },
    { from: 'la.A',     to: 'nano.D3', color: 'orange', note: 'Amber LED through 220 ohm - drifting' },
    { from: 'la.K',     to: 'bb.T-14', color: 'black',  note: 'Cathode to ground' },
    { from: 'lr.A',     to: 'nano.D4', color: 'red',    note: 'Red LED through 220 ohm - anomalous' },
    { from: 'lr.K',     to: 'bb.T-16', color: 'black',  note: 'Cathode to ground' },
    { from: 'buz.+',    to: 'nano.D5', color: 'purple', note: 'Buzzer, one beep on entering red' },
    { from: 'buz.-',    to: 'bb.T-20', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">3.3 V board, and it will be near a machine</span>
<p>The nRF52840's pins are not 5&nbsp;V tolerant. That matters more here than in a project on your desk,
because the temptation on a machine is to grab 5 or 12&nbsp;V from something nearby. Give it its own USB
supply from a socket, and keep it electrically separate from whatever it is listening to.</p></div>

<div class="note warn"><span class="t">Do not put the microphone behind a solid box wall</span>
<p>The PDM microphone is a tiny hole on the top face of the board. Enclose it in a sealed ABS box and you have
built a very effective low-pass filter - the high-frequency content that carries most bearing and cavitation
information disappears, and the model becomes almost useless.</p>
<p>Drill a 3&nbsp;mm hole in the lid directly over the microphone, and cover it on the inside with a single
layer of acoustically transparent fabric if you need dust protection. Get this wrong and you will train a
perfectly good model on muffled audio, then wonder why it never notices anything.</p></div>

<div class="note warn"><span class="t">The mount is part of the instrument</span>
<p>For the vibration half, how you attach the board <em>is</em> the sensor design. A magnet or VHB tape
directly onto metal transmits vibration faithfully. Foam mounting tape, a rubber grommet, or a box that rattles
around a screw all act as mechanical filters, and they filter out exactly the frequencies you want.</p>
<p>Mount it the same way for data collection as for deployment. Move it two centimetres and you have changed
the instrument, and your trained model will start flagging anomalies immediately.</p></div>

<div class="note tip"><span class="t">Socket the board, do not solder it down</span>
<p>You will retrain this three or four times before the thresholds are right, and each retrain means a new
upload. Female headers on the perfboard cost 35 cents and save you from carrying a soldering iron into a plant
room.</p></div>`,

solderSteps: [
  { h: 'Plan the perfboard around the microphone',
    body: `<p>Before anything else, work out which way the board will face in the box, and put the female
    headers so that the microphone end points at the lid hole. Everything else can move; that cannot.</p>
    <p>Dry-fit the whole thing - sockets, LEDs, buzzer, OLED - and mark the holes in pencil.</p>` },
  { h: 'Female headers first',
    body: `<p>Two 15-pin lengths of female header at 0.6&nbsp;inch spacing. Cut them by counting holes, not by
    measuring - cutting through a hole rather than between them leaves a ragged end.</p>
    <p>Push them into the perfboard, drop the Nano into them to hold the spacing, and tack one pin at each
    corner. Check the Nano sits flat. Then solder the remaining 26.</p>
    <p><strong>Do not leave the Nano in place</strong> while you solder the rest of the pins on a cheap socket -
    the plastic softens and the board can end up permanently gripped. Tack the corners with it in, pull it out,
    finish the rest.</p>` },
  { h: 'LEDs with their resistors folded into the legs',
    body: `<p>Three LEDs in a row, resistor in each anode leg on the board itself. Bend one resistor leg down
    into the adjacent hole, solder, trim.</p>
    <p>Mark which is which before you trim the legs. Green, amber, red left to right, and write it on the
    board in marker - in three months the LED colours will look identical through a dusty lid.</p>` },
  { h: 'The buzzer, watching its polarity',
    body: `<p>Active buzzers are polarised - long leg or <code>+</code> mark to the signal pin. A backwards
    buzzer is silent rather than damaged, which makes it a confusing fault to chase later.</p>` },
  { h: 'Ground rail, then 3.3 V, then signals',
    body: `<p>Solid-core 22&nbsp;AWG bent flat against the board. One black rail down the edge with every
    ground stitched onto it, then the 3.3&nbsp;V, then the individual signal wires.</p>
    <p>Keep the I2C pair short and together. It is only 100&nbsp;kHz and forgiving, but a machine room is
    electrically noisy and long unpaired runs there are asking for trouble.</p>` },
  { h: 'Inspect, then buzz it out',
    body: `<p>Rake a light across the board and look for bridges along the rows. Then with the multimeter and
    nothing powered: every ground point to the Nano's GND socket (beep), 3.3&nbsp;V to the 3V3 socket (beep),
    and 3.3&nbsp;V to ground (<strong>no beep</strong>).</p>` },
  { h: 'Drill the box before you fit anything into it',
    body: `<p>Three holes: 3&nbsp;mm over the microphone, three 5&nbsp;mm for the LEDs, one for the USB cable
    with a strain relief knot inside. Drill them all with the electronics out of the box - swarf inside a
    finished build is miserable to remove.</p>
    <p>Debur the microphone hole properly. A ragged edge whistles.</p>` }
],

assembly: [
  { h: 'Choose the machine before you build anything',
    body: `<p>The best candidates run at a constant load for long periods and make a steady noise: a
    circulation pump, an extractor fan, a fridge compressor, a 3D printer's part-cooling fan, a small
    compressor, a pond pump.</p>
    <p>Bad candidates are anything whose normal behaviour varies wildly - a washing machine has a dozen
    completely different normal states, and you would need training data covering every one of them or it will
    scream through the spin cycle forever.</p>` },
  { h: 'Mount it, and commit to that mounting',
    body: `<p>Magnet or VHB directly onto metal, as close to the bearing or motor as heat allows. Check the
    surface temperature first - the board is rated to 85&nbsp;&deg;C but the LiPo connector and the plastic are
    not, and the readings will drift with temperature anyway.</p>
    <p>Take a photo of the mounting. When you retrain in six months you will want to put it back exactly.</p>` },
  { h: 'Record healthy data, and record far more than feels necessary',
    body: `<p>Upload the raw-sample sketch, run <code>edge-impulse-data-forwarder</code>, and record while the
    machine does its normal job.</p>
    <p>Target <strong>at least 30 minutes</strong> of audio and vibration, spread across different conditions:
    cold start, warmed up, under light load, under heavy load, and - importantly - with whatever else normally
    happens in that room happening. A model trained only on a quiet afternoon will flag every time someone
    runs a tap.</p>
    <p>Label everything <code>normal</code>. There is only one class in an anomaly project, which feels wrong
    the first time and is correct.</p>` },
  { h: 'Record a small amount of deliberate abnormal, for testing only',
    body: `<p>You do not train on this - you test with it. Safe ways to make a machine sound wrong:</p>
    <ul>
      <li>Rest a finger lightly on the housing to add damping.</li>
      <li>Partially block an air intake with a piece of card.</li>
      <li>Put a small weight on one side of a fan guard to add imbalance.</li>
      <li>Run it with a panel removed if it normally has one on.</li>
    </ul>
    <p>Label these <code>anomaly</code> and put them in the test set. They give you something to check the
    threshold against without waiting for a real fault.</p>` },
  { h: 'Build two impulses, not one',
    body: `<p>Audio and vibration want different processing, and trying to force both through one block gives
    you the worst of each.</p>
    <p><strong>Audio impulse</strong>: window 1000&nbsp;ms, increase 500&nbsp;ms, 16&nbsp;kHz, an
    <strong>MFE</strong> block (mel-filterbank energy - better than MFCC for machine noise, which is not
    speech), then a <strong>K-means Anomaly Detection</strong> block.</p>
    <p><strong>Vibration impulse</strong>: window 2000&nbsp;ms, increase 1000&nbsp;ms, 100&nbsp;Hz, a
    <strong>Spectral Analysis</strong> block, then K-means anomaly again.</p>
    <p>In Edge Impulse these are two projects. Deploy both libraries and run them in the same sketch.</p>` },
  { h: 'Pick the cluster count by looking at the feature explorer',
    body: `<p>The anomaly block asks for a cluster count - 32 is the default. Fewer clusters means a coarser
    idea of normal and more false alarms; more clusters wraps the training data so tightly that real anomalies
    slip inside it.</p>
    <p>32 is a good start for a machine with one operating mode. Go to 48 or 64 if your feature explorer shows
    several distinct blobs, which usually means the machine has several normal states.</p>` },
  { h: 'Establish the baseline before you set any threshold',
    body: `<p>Flash the monitor sketch with the thresholds set absurdly high so nothing ever triggers, and let
    it run on the healthy machine for <strong>a full day</strong>, printing scores.</p>
    <p>Then look at the numbers. Take the highest score you saw over that day and set amber at roughly 1.5x it,
    red at 2.5x it. Anything tighter and you will be chasing false alarms all week.</p>
    <p>This step is why the project takes a day rather than an evening, and skipping it is the single most
    common way to end up with a monitor nobody trusts.</p>` },
  { h: 'Test it with your deliberate anomalies',
    body: `<p>Block the intake, add the weight, damp the housing. The score should climb clearly above your
    amber line. If it does not move, your mounting is isolating vibration or the microphone hole is blocked -
    both are physical problems and no retraining will fix either.</p>` },
  { h: 'Leave it alone and check the trend',
    body: `<p>The real output of this project is not the LED, it is the slow drift. A score that sits at 0.2
    for a month and starts sitting at 0.45 is telling you something even though it never went red.</p>` }
],

libraries: [
  { name: 'PDM', by: 'Arduino', how: 'Built in', why: 'Reads the on-board pulse-density microphone. Part of the Mbed core - no installation.' },
  { name: 'Arduino_BMI270_BMM150', by: 'Arduino', why: 'The Rev2 IMU, for the vibration half.' },
  { name: 'Your two Edge Impulse libraries', by: 'generated', how: 'Sketch > Include Library > Add .ZIP Library', why: 'One audio anomaly model, one vibration anomaly model. Both include their own DSP block.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The OLED. Pulls in Adafruit GFX.' }
],

code: [
{
  h: 'Step 1: prove the microphone works',
  intro: `<p>Before any of the machine learning, confirm the PDM microphone is running and get a feel for the
  levels. This prints a peak amplitude figure you can watch in the Serial Plotter.</p>`,
  name: 'pdm_level_meter.ino',
  code: `/* ------------------------------------------------------------------
   PDM microphone level meter - Nano 33 BLE Sense

   Prints a peak amplitude per block. Clap and watch it spike.
   This is the "is the mic alive and is the hole in the box big
   enough" test, and it is worth doing before and after boxing it up.
   ------------------------------------------------------------------ */

#include <PDM.h>

// The PDM library hands us 16-bit signed samples in blocks.
static const int   SAMPLE_RATE = 16000;
static const int   CHANNELS    = 1;
short   sampleBuffer[512];
volatile int samplesRead = 0;

void onPDMdata() {
  // Called from interrupt context. Do the minimum: copy and flag.
  int bytesAvailable = PDM.available();
  PDM.read(sampleBuffer, bytesAvailable);
  samplesRead = bytesAvailable / 2;
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  PDM.onReceive(onPDMdata);

  // Gain: 0-80ish. The default of 20 is quiet for machine work.
  // Set it BEFORE begin() on some core versions and after on others,
  // so this sketch does both - it is harmless.
  PDM.setGain(40);

  if (!PDM.begin(CHANNELS, SAMPLE_RATE)) {
    Serial.println("PDM failed to start.");
    while (1);
  }
  PDM.setGain(40);

  Serial.println("# peak amplitude per block, 0-32767");
}

void loop() {
  if (samplesRead == 0) return;

  int n = samplesRead;
  samplesRead = 0;                     // release the buffer early

  long peak = 0;
  long sumSq = 0;
  for (int i = 0; i < n; i++) {
    long v = sampleBuffer[i];
    if (v < 0) v = -v;
    if (v > peak) peak = v;
    sumSq += (long)sampleBuffer[i] * sampleBuffer[i];
  }

  // RMS is the better measure of a steady sound; peak catches clicks.
  long rms = (long)sqrt((double)sumSq / n);

  Serial.print(peak);
  Serial.print(',');
  Serial.println(rms);
}`,
  after: `<p>A quiet room should read a few hundred. A clap should slam it to five figures. If the peak sits
  near 32767 with the machine running, the gain is too high and you are clipping - drop
  <code>PDM.setGain()</code> to 20 and re-check.</p>
  <p><strong>Clipping is the worst thing you can do to this project.</strong> A clipped recording throws away
  exactly the structure the MFE block needs, and it does it silently. Run this meter with the machine on,
  through the box, before you record a single training sample.</p>`
},
{
  h: 'Step 2: the vibration forwarder',
  intro: `<p>Same fixed-rate loop as the gesture project, because the forwarder infers the sample rate from
  the timing. Use this sketch to collect the vibration dataset.</p>`,
  name: 'vibration_forward.ino',
  code: `#include <Arduino_BMI270_BMM150.h>

#define SAMPLE_HZ    100
#define INTERVAL_US  (1000000 / SAMPLE_HZ)

unsigned long nextSample = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);
  if (!IMU.begin()) { Serial.println("IMU failed."); while (1); }
  nextSample = micros();
}

void loop() {
  if ((long)(micros() - nextSample) < 0) return;
  nextSample += INTERVAL_US;

  float x, y, z;
  if (!IMU.accelerationAvailable()) return;
  IMU.readAcceleration(x, y, z);

  /* Subtracting gravity is tempting here and is a mistake: the DC
     offset per axis tells the model how the board is oriented, and a
     board that has worked loose and rotated IS an anomaly worth
     catching. Send the raw values. */
  Serial.print(x, 4); Serial.print(',');
  Serial.print(y, 4); Serial.print(',');
  Serial.println(z, 4);
}`,
  after: `<p>Record the audio dataset and the vibration dataset in separate Edge Impulse projects, with the
  board mounted exactly as it will be deployed. Swapping the firmware between the two is fine - the mounting
  is what must stay constant.</p>`
},
{
  h: 'Step 3: the monitor',
  intro: `<p>This runs both models, keeps a rolling average so a single odd second does not trigger anything,
  and drives the LEDs. Change the two includes to your own generated headers.</p>`,
  name: 'machine_listener.ino',
  code: `/* ------------------------------------------------------------------
   Machine listener - anomaly monitor

   Runs two Edge Impulse anomaly models (audio + vibration), smooths
   each score, and reports the worse of the two.

   Green  : both scores comfortably normal
   Amber  : drifting - worth a look
   Red    : well outside anything seen in training

   IMPORTANT: run this with THRESH_AMBER/THRESH_RED set very high for
   a full day first, read the scores off serial, and only then set
   real thresholds. See the assembly notes.
   ------------------------------------------------------------------ */

#include <my_machine_audio_inferencing.h>       // <-- YOURS (audio)
#include <Arduino_BMI270_BMM150.h>
#include <PDM.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---- pins ------------------------------------------------------------
#define LED_GREEN   2
#define LED_AMBER   3
#define LED_RED     4
#define BUZZER      5

// ---- thresholds ------------------------------------------------------
// Start at 999 for the baseline run. Then set these from real data.
#define THRESH_AMBER   999.0f
#define THRESH_RED     999.0f

// How much of the old average to keep. 0.95 over ~2 predictions/sec
// gives roughly a 10 second time constant - slow enough that a door
// slam cannot trigger it, fast enough to be useful.
#define SMOOTHING      0.95f

Adafruit_SSD1306 oled(128, 64, &Wire, -1);

// ---- audio capture ---------------------------------------------------
static signed short  audioBuf[EI_CLASSIFIER_RAW_SAMPLE_COUNT];
static volatile int  audioPos = 0;
static volatile bool audioReady = false;
static short         pdmBuf[1024];

float smoothed = 0.0f;
bool  haveSmoothed = false;
bool  wasRed = false;

void onPDMdata() {
  int bytes = PDM.available();
  PDM.read(pdmBuf, bytes);
  int n = bytes / 2;

  if (audioReady) return;              // still classifying the last one

  for (int i = 0; i < n && audioPos < EI_CLASSIFIER_RAW_SAMPLE_COUNT; i++) {
    audioBuf[audioPos++] = pdmBuf[i];
  }
  if (audioPos >= EI_CLASSIFIER_RAW_SAMPLE_COUNT) {
    audioReady = true;
    audioPos = 0;
  }
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_AMBER, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  if (!IMU.begin()) { Serial.println("IMU failed."); while (1); }

  PDM.onReceive(onPDMdata);
  PDM.setGain(40);
  if (!PDM.begin(1, EI_CLASSIFIER_FREQUENCY)) {
    Serial.println("PDM failed.");
    while (1);
  }

  if (oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oled.clearDisplay();
    oled.setTextColor(SSD1306_WHITE);
    oled.display();
  }

  Serial.println("# millis,anomaly,smoothed,state");
  digitalWrite(LED_GREEN, HIGH);
}

void loop() {
  if (!audioReady) return;

  /* --- run the audio anomaly model -------------------------------- */
  signal_t signal;
  signal.total_length = EI_CLASSIFIER_RAW_SAMPLE_COUNT;
  signal.get_data = &audioSignalGetData;

  ei_impulse_result_t result = { 0 };
  EI_IMPULSE_ERROR r = run_classifier(&signal, &result, false);
  audioReady = false;                  // let the ISR refill

  if (r != EI_IMPULSE_OK) {
    Serial.print("classifier error "); Serial.println(r);
    return;
  }

  /* An anomaly-only impulse fills in result.anomaly. A value near 0
     means "this is like the training data". There is no upper bound,
     which is why the thresholds have to come from your own machine. */
  float score = result.anomaly;

  /* --- smooth it --------------------------------------------------- */
  if (!haveSmoothed) { smoothed = score; haveSmoothed = true; }
  else smoothed = SMOOTHING * smoothed + (1.0f - SMOOTHING) * score;

  /* --- decide ------------------------------------------------------ */
  int state = 0;                                   // 0 green 1 amber 2 red
  if (smoothed >= THRESH_RED)        state = 2;
  else if (smoothed >= THRESH_AMBER) state = 1;

  digitalWrite(LED_GREEN, state == 0);
  digitalWrite(LED_AMBER, state == 1);
  digitalWrite(LED_RED,   state == 2);

  // One beep on the transition into red, then silence. A monitor that
  // screams continuously gets unplugged, and then monitors nothing.
  if (state == 2 && !wasRed) {
    tone(BUZZER, 2000, 400);
  }
  wasRed = (state == 2);

  /* --- report ------------------------------------------------------ */
  Serial.print(millis());   Serial.print(',');
  Serial.print(score, 3);   Serial.print(',');
  Serial.print(smoothed, 3); Serial.print(',');
  Serial.println(state);

  drawScreen(score, smoothed, state);
}

/* Edge Impulse asks for data in chunks rather than all at once, so it
   can stream the DSP without a second full copy of the buffer. */
int audioSignalGetData(size_t offset, size_t length, float *out) {
  numpy::int16_to_float(&audioBuf[offset], out, length);
  return 0;
}

void drawScreen(float score, float smooth, int state) {
  static float history[64];
  static int   hp = 0;
  history[hp] = smooth;
  hp = (hp + 1) % 64;

  oled.clearDisplay();

  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(smooth, 2);

  oled.setTextSize(1);
  oled.setCursor(76, 0);
  oled.println(state == 2 ? "ALERT" : (state == 1 ? "watch" : "ok"));
  oled.setCursor(76, 10);
  oled.print("now ");
  oled.println(score, 1);

  // A 64-point trend, auto-scaled. The shape matters more than the
  // numbers - a flat line that starts climbing is the real signal.
  float mx = 0.01f;
  for (int i = 0; i < 64; i++) if (history[i] > mx) mx = history[i];
  for (int i = 0; i < 64; i++) {
    int idx = (hp + i) % 64;
    int h = (int)(history[idx] / mx * 30.0f);
    oled.drawFastVLine(i * 2, 62 - h, h, SSD1306_WHITE);
  }
  oled.drawFastHLine(0, 62, 128, SSD1306_WHITE);

  oled.display();
}`,
  after: `<p>The <code>SMOOTHING</code> constant is doing quiet but important work. Machine noise is bursty -
  a pump cavitates for half a second, someone drops a spanner - and an unsmoothed score fires on all of it.
  Ten seconds of averaging removes essentially every false alarm while still catching a genuine change in
  under a minute.</p>
  <p>If you want the vibration model too, add its header, give it its own <code>signal_t</code> over the IMU
  ring buffer, and take the higher of the two smoothed scores. Keeping the two scores separate rather than
  averaging them matters: a fault that shows up strongly in one and not the other should still trigger.</p>`
}],

upload: `
<p>Board: <strong>Arduino Nano 33 BLE</strong>. Serial Monitor at <strong>115200</strong>.</p>
<p>Two Edge Impulse libraries plus the OLED is a lot of flash. If you run out, drop the vibration model first -
audio catches more fault types on most machines - or remove the OLED and run headless with the LEDs only.</p>
<div class="note tip"><span class="t">Log the baseline run to a file, not to the Serial Monitor</span>
<p>You need a day of scores and the Arduino Serial Monitor does not save them. On Linux or macOS:</p>
<p><code>cat /dev/ttyACM0 &gt; baseline.csv</code></p>
<p>On Windows, PuTTY with session logging enabled, or the <code>Get-Content</code>-free approach of using the
Arduino CLI's <code>arduino-cli monitor -p COM5 &gt; baseline.csv</code>. Then open the CSV in a spreadsheet
and look at the distribution - that is how you pick thresholds honestly.</p></div>`,

tune: [
  { h: 'Setting thresholds from the baseline, properly',
    body: `<p>Sort your day of scores. Take the 99th percentile - the value that 99% of healthy readings sit
    below. Amber goes at roughly 1.5x that, red at 2.5x.</p>
    <p>Using the absolute maximum instead is tempting and slightly worse, because one freak reading from
    someone slamming a door sets your threshold for the year.</p>` },
  { h: 'False alarms mean the training data was too narrow',
    body: `<p>Every false alarm is the model telling you it has seen something it was not trained on. Usually
    that thing is legitimate - a different load, a cold start, a season.</p>
    <p>The fix is to record the condition that caused it, add it to the training set as normal, and retrain.
    Over a few months the model converges on a genuinely complete picture of the machine, and that is the
    version worth keeping.</p>` },
  { h: 'Raising the microphone gain for quiet machines',
    body: `<p><code>PDM.setGain()</code> takes roughly 0-80. Use the level meter sketch: with the machine
    running you want RMS somewhere in the low thousands - well clear of the noise floor and well clear of
    clipping.</p>
    <p>Set the gain before you record training data and never change it afterwards. Changing the gain changes
    every feature the model sees, and invalidates the training.</p>` },
  { h: 'Catching slow drift rather than sudden change',
    body: `<p>The smoothed score is a short-term view. For genuine predictive maintenance, keep a daily
    average too - a simple running mean written to flash once an hour - and compare this week to last month.
    A bearing that is failing does not jump; it creeps.</p>` },
  { h: 'Add temperature, it is free',
    body: `<p>The board has an HS3003 temperature and humidity sensor on it. Motor temperature is a
    genuinely useful second channel and costs nothing to add. It is too slow to be a feature in the audio
    model, but as a separate simple threshold - "this motor has never been above 62&nbsp;&deg;C" - it catches
    a class of problems that sound does not.</p>` },
  { h: 'Report over BLE instead of walking over to look',
    body: `<p>The nRF52840's radio is sitting idle. ArduinoBLE can advertise the current score as a
    characteristic, so a phone in the doorway reads it without you opening a plant room door. This is the
    single most useful addition to the project.</p>` }
],

trouble: [
  { q: 'The score is enormous from the first second, on a healthy machine',
    a: `Something changed between recording and deployment. In order of likelihood: the board is mounted
    differently, the box is now on and the microphone hole is wrong or missing, the PDM gain is different, or
    you deployed the wrong project's library. Check the mounting and the box first - those are physical and
    no retraining will fix them.` },
  { q: 'The score never moves, even when I block the intake',
    a: `Either the microphone is not actually being read - run the level meter sketch through the closed box
    and confirm it responds - or your training data was so varied that the model considers everything normal.
    A K-means model trained on 30 minutes of chaos has clusters everywhere and no anomalies are possible.` },
  { q: '<code>PDM failed to start</code>',
    a: `Usually a sample rate the hardware cannot do. The PDM block supports 16000 and 41667 Hz on this core;
    <code>EI_CLASSIFIER_FREQUENCY</code> should already be 16000 if you built the impulse at 16&nbsp;kHz. If
    you built it at 8&nbsp;kHz, rebuild it at 16.` },
  { q: 'It compiles but the board resets in a loop',
    a: `Out of RAM. Two models plus a 16,000-sample audio buffer plus the OLED's 1&nbsp;KB framebuffer is
    tight in 256&nbsp;KB. Drop the vibration model, or shorten the audio window to 500&nbsp;ms and retrain.` },
  { q: 'Audio samples are all clipped at the extremes',
    a: `Gain too high. This ruins a dataset invisibly - the MFE block still produces features, they are just
    features of a square wave. Drop <code>PDM.setGain()</code> to 20, verify with the level meter, and
    <strong>re-record the training data</strong>. You cannot fix this after the fact.` },
  { q: 'It goes red every morning and recovers by lunchtime',
    a: `You trained on a warm machine. Cold start genuinely sounds different - stiffer grease, different
    clearances - and the model is correctly reporting that it has not seen it. Record a few cold starts as
    normal and retrain.` },
  { q: 'Scores drift upward over weeks with no fault',
    a: `Three candidates: the mount has worked loose (check it), the microphone hole has filled with dust
    (check it), or the machine really is changing. Rule out the first two physically before you assume the
    third - but do not dismiss the third, because catching it is the entire point.` },
  { q: 'Two models will not fit in flash',
    a: `Expected. Deploy the audio model with EON Compiler enabled in the Deployment page - it typically saves
    25-40% of both flash and RAM for the same model. If that is not enough, run audio only.` }
],

next: `
<ul>
  <li><strong>Start with gestures if this is your first TinyML project</strong> -
  <a href="project.html?p=tinyml-gesture-nano">the gesture recogniser</a> uses the same tools with a dataset
  you can record in an afternoon.</li>
  <li><strong>Log the trend somewhere permanent.</strong> An ESP32 alongside it, or BLE to a Pi, turns a
  local LED into a chart you can actually look back through - and the chart is where predictive maintenance
  really lives.</li>
  <li><strong>Add current sensing.</strong> An <a href="project.html?p=mains-energy-monitor">SCT-013 clamp</a>
  on the motor's supply gives you load as a fourth channel, which separates "sounds wrong" from "sounds
  wrong because it is working harder".</li>
  <li><strong>Watch it as well as listen.</strong> A camera and a real model can spot a belt walking off a
  pulley, which no microphone will ever catch -
  <a href="project.html?p=uno-q-object-detection">the UNO Q object detector</a> is the next step up.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">You are putting electronics next to a working machine</span>
<ul>
  <li><strong>Never mount anything on a machine that is running.</strong> Isolate it, lock it off if it can be
  started remotely, and confirm it is dead before your hands go near it.</li>
  <li><strong>Keep the cable out of everything that moves.</strong> A USB lead into a belt, a fan or a
  coupling is the realistic hazard in this project. Route it away, secure it, and leave no loose loop.</li>
  <li><strong>Check the surface temperature before you stick a lithium battery to it.</strong> If you fit a
  LiPo instead of USB power, the mounting surface must stay below about 45&nbsp;&deg;C. Many motor housings do
  not.</li>
  <li><strong>This is not a safety device.</strong> It is a hint. Do not use it in place of a thermal cutout,
  a pressure relief valve, a guard or an interlock, and do not let it be the only thing between a machine and
  a fire. It is a $55 board running a statistical model that has never seen a fault.</li>
  <li><strong>Do not wire it to cut power to anything.</strong> The temptation to add a relay that stops the
  machine on red is strong and wrong - a false positive then becomes an unplanned shutdown, and a false
  negative becomes a device you wrongly trusted.</li>
</ul>
</div>`
});
