/* A wake word in 256 KB of RAM. The constraint is the entire lesson. */
AB.addProject({
slug: 'tinyml-wake-word',
title: 'Wake word on a coin-cell budget',
cat: 'ai',
level: 3,
time: '6 hours, plus recording time',
solder: false,
board: 'Nano 33 BLE Sense',
tags: ['tinyml', 'wake word', 'keyword spotting', 'mfcc', 'edge impulse', 'nano 33', 'low power', 'quantisation'],
blurb: 'Say one word and a board the size of a stick of gum wakes up. No network, no cloud, no Linux - a neural network running in 256 KB of RAM on a microcontroller that sips microamps between words.',

skills: ['Keyword spotting', 'MFCC features', 'Int8 quantisation', 'Dataset collection', 'False accept vs false reject', 'Measuring real power draw'],

intro: `
<p>Every smart speaker does this, and it is the one part of them that never leaves the device: a tiny model
listening for a single word, so that the big expensive model only wakes up when it should.</p>
<p>The <a href="project.html?p=uno-q-voice-control">UNO Q voice project</a> does speech recognition on a Linux
board with a gigabyte of RAM. This one does the wake-word half on a microcontroller with <strong>256 KB</strong>,
and that difference is the entire point. You cannot run a general speech model here. You can run a model that
answers one question - was that the word? - very well and for almost no power.</p>
<p>The Nano 33 BLE Sense has a microphone on the board already, so the hardware is genuinely just the board.</p>`,

what: [
  'Recognise one chosen wake word, spoken by anybody, in a normal room.',
  'Ignore everything else - conversation, television, the washing machine - which is much harder than recognising the word.',
  'Run continuously, drawing little enough that a coin cell is a sensible power source.',
  'Record and label your own dataset, which is most of the work and all of the difference.',
  'Measure how often it fires when it should not, and tune that deliberately rather than hoping.'
],

how: `
<p><strong>You do not feed audio to the network.</strong> A one-second clip at 16&nbsp;kHz is 16,000 numbers,
and a network taking that directly would be far too big and would have to learn what "sound" is from scratch.</p>
<p>Instead you compute <strong>MFCCs</strong> - Mel-Frequency Cepstral Coefficients. The short version: chop
the second into 30&nbsp;ms overlapping windows, take the frequency spectrum of each, squash it onto a scale
that matches how human hearing spaces pitches, and take the log. You end up with roughly a 49 x 13 grid of
numbers - about 640 values instead of 16,000, and they encode the shape of the sound rather than its
waveform.</p>
<p>That grid is an image, more or less, and a small convolutional network is very good at classifying small
images. This is why keyword spotting fits on a microcontroller at all.</p>

<p><strong>Three classes, not one.</strong> The obvious design has one output: "is it the word". It does not
work. Train it on your word and nothing else and it will fire at every similar-sounding syllable, because it
has never been shown what "not the word" means.</p>
<p>You need at least three classes: <strong>your word</strong>, <strong>other speech</strong> (any other words,
lots of them), and <strong>noise</strong> (the room with nobody talking - traffic, fridge hum, silence). The
noise class is the one beginners leave out and it is the one that stops it firing at the extractor fan.</p>

<p><strong>Pick the word carefully.</strong> Two or three syllables, unusual phonetics, and nothing that occurs
in normal conversation. "Computer" works. "Go" does not - too short, too common, and it lives inside dozens of
other words. Length gives the model more to distinguish; rarity means fewer false accepts when you are just
talking.</p>

<p><strong>Int8 quantisation is what makes it fit.</strong> Trained weights are 32-bit floats. Convert to
8-bit integers and the model becomes a quarter the size and several times faster, because the Cortex-M4 has
integer DSP instructions and no fast float unit for this.</p>
<p>Accuracy drops slightly - typically a fraction of a percent for this kind of model. You are trading a tiny
amount of accuracy for the ability to run at all.</p>

<p><strong>False accepts and false rejects trade against each other.</strong> One threshold controls both. Set
it low and it wakes at the television; set it high and you say the word three times in a row. There is no
setting that fixes both, so decide which annoys you more.</p>
<p>The trick most commercial devices use is <strong>consecutive detections</strong>: require the model to be
confident in two or three overlapping windows in a row. A burst of noise rarely fools it twice running, but a
real spoken word spans several windows naturally. This cuts false accepts hard for almost no cost in
responsiveness.</p>`,

bom: [
  { id: 'nano33ble', qty: 1, note: 'The microphone, the accelerometer and the Cortex-M4 with DSP instructions are all on the board. This project is genuinely just this part.' },
  { id: 'led5', qty: 2, note: 'One to show it is listening, one to flash on a detection. Useful during tuning - you want to see the false accepts happen.' },
  { id: 'res220', qty: 2 },
  { id: 'bb-400', qty: 1 },
  { id: 'batt-aa2', qty: 1, note: 'For the power measurement at the end. Running it from USB tells you nothing about battery life.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [{ id: 'dmm', own: true, note: 'To measure current draw - the interesting number in this project.' }],

build: {
  parts: [
    { id: 'mcu', comp: 'nano33', at: [0, 30] },
    { id: 'bb',  comp: 'bb400', at: [0, -34] },
    { id: 'l1',  comp: 'led5',  at: [-40, -60] },
    { id: 'l2',  comp: 'led5',  at: [40, -60] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail - the Nano 33 is a 3.3 V board throughout' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'mcu.D2',   to: 'bb.e6',   color: 'green',  note: 'Listening LED, through 220 ohm' },
    { from: 'l1.A',     to: 'bb.a6',   color: 'green',  note: 'LED anode to the resistor' },
    { from: 'l1.K',     to: 'bb.T-6',  color: 'black',  note: 'LED cathode to ground' },
    { from: 'mcu.D3',   to: 'bb.e14',  color: 'yellow', note: 'Detection LED, through 220 ohm' },
    { from: 'l2.A',     to: 'bb.a14',  color: 'yellow', note: 'LED anode to the resistor' },
    { from: 'l2.K',     to: 'bb.T-14', color: 'black',  note: 'LED cathode to ground' }
  ]
},

wireIntro: `<p>Two LEDs and nothing else. The microphone is already on the board, which is most of why this
board exists.</p>`,

wireNotes: `
<div class="note tip"><span class="t">3.3 V board - do not feed it 5 V logic</span>
<p>The Nano 33 BLE Sense is 3.3&nbsp;V and, unlike a classic Nano, its pins are <strong>not</strong>
5&nbsp;V tolerant. If you later connect it to anything driven from an Uno, that needs a level shifter.</p></div>

<div class="note"><span class="t">Why two LEDs and not one</span>
<p>The listening LED tells you the board has not crashed - a hung inference loop looks identical to silence
otherwise. The detection LED is what you watch during a film to count false accepts, which is the only honest
way to measure them.</p></div>`,

assembly: [
  { h: 'Record your dataset before writing any code',
    body: `<p>This is the project. Aim for at least 50 recordings of your wake word, ideally from several
    people, plus a few hundred samples of other speech and a few minutes of room noise.</p>
    <p>Edge Impulse can record straight from the board over USB, which keeps the microphone and the sample rate
    identical between training and deployment. That matters more than it sounds - a model trained on phone
    recordings performs noticeably worse on a different microphone.</p>` },
  { h: 'Record the awkward cases deliberately',
    body: `<p>Say the word quietly. Say it from across the room. Say it with the television on. Say it while
    turned away from the board.</p>
    <p>A dataset of fifty crisp recordings made twelve inches from the microphone produces a model that works
    beautifully at twelve inches and nowhere else.</p>` },
  { h: 'Build the noise class from your actual room',
    body: `<p>Not a noise dataset from the internet - your room, your fridge, your street. Ten minutes of it.
    This is the class that prevents most false accepts and it costs nothing but leaving the board recording
    while you make dinner.</p>` },
  { h: 'Train, then look at the confusion matrix and not the accuracy',
    body: `<p>Overall accuracy is dominated by the noise class, which is easy, so it will look wonderful.
    What matters is the row for your wake word: how often is it classified as speech, and how often is speech
    classified as your word?</p>
    <p>The second number is your false accept rate and it is the one that decides whether you can live
    with it.</p>` },
  { h: 'Deploy quantised, and check it still works',
    body: `<p>Export as an Arduino library with int8 quantisation. Edge Impulse reports the estimated RAM and
    latency for the target - if RAM is over about 200&nbsp;KB you will need fewer MFCC coefficients or a
    smaller network.</p>` },
  { h: 'Test it against television for an hour',
    body: `<p>Leave it running with a film on and count the detection LED. This is the measurement that
    matters and no amount of validation accuracy substitutes for it.</p>` },
  { h: 'Then measure the current',
    body: `<p>Meter in series with the battery. Continuous inference is around 10-15&nbsp;mA, which is days
    rather than months on AA cells. The last section covers what to do about that.</p>` }
],

libraries: [
  { name: 'Your Edge Impulse library', by: 'exported from your project', why: 'Training produces a .zip you add through Sketch > Include Library > Add .ZIP Library. It contains the model and the MFCC front end together.' },
  { name: 'PDM', by: 'Arduino (built in)', why: 'Reads the board’s on-board microphone. Already installed with the mbed board package.' }
],

code: [{
  name: 'wake_word.ino',
  code: `/* ------------------------------------------------------------------
   Wake word on a Nano 33 BLE Sense

   Replace the include with your own exported Edge Impulse library.
   Everything else is the plumbing around it.
   ------------------------------------------------------------------ */

#include <PDM.h>
#include <my_wake_word_inferencing.h>   // <- your exported model

#define LED_LISTEN 2
#define LED_DETECT 3

// How sure, and how many windows in a row. See the write-up: requiring
// consecutive detections is what kills false accepts from short noises.
const float CONFIDENCE = 0.80f;
const int   NEEDED_IN_A_ROW = 2;

static signed short sampleBuffer[2048];
static volatile int samplesRead = 0;
static bool recording = false;

typedef struct {
  int16_t *buffer;
  uint8_t buf_ready;
  uint32_t buf_count;
  uint32_t n_samples;
} inference_t;

static inference_t inference;
static int hits = 0;

// ---- setup -----------------------------------------------------------
void setup() {
  Serial.begin(115200);
  pinMode(LED_LISTEN, OUTPUT);
  pinMode(LED_DETECT, OUTPUT);

  if (!microphoneSetup(EI_CLASSIFIER_RAW_SAMPLE_COUNT)) {
    Serial.println("Microphone failed");
    while (1) { digitalWrite(LED_DETECT, HIGH); delay(200);
                digitalWrite(LED_DETECT, LOW);  delay(200); }
  }

  Serial.printf("Window %d ms, %d classes\\n",
                EI_CLASSIFIER_RAW_SAMPLE_COUNT / (EI_CLASSIFIER_FREQUENCY / 1000),
                EI_CLASSIFIER_LABEL_COUNT);
  digitalWrite(LED_LISTEN, HIGH);
}

// ---- main loop -------------------------------------------------------
void loop() {
  if (!recordWindow()) return;

  signal_t signal;
  signal.total_length = EI_CLASSIFIER_RAW_SAMPLE_COUNT;
  signal.get_data = &getData;

  ei_impulse_result_t result = {0};
  EI_IMPULSE_ERROR r = run_classifier(&signal, &result, false);
  if (r != EI_IMPULSE_OK) return;

  // Find the best class this window
  float bestScore = 0;
  const char* bestLabel = "";
  for (size_t i = 0; i < EI_CLASSIFIER_LABEL_COUNT; i++) {
    if (result.classification[i].value > bestScore) {
      bestScore = result.classification[i].value;
      bestLabel = result.classification[i].label;
    }
  }

  /* Consecutive-window gate. A cupboard door or a cough can score high
     once; a real spoken word spans several overlapping windows, so it
     scores high two or three times running. This is nearly free and it
     removes most false accepts. */
  bool isWake = (strcmp(bestLabel, "wake") == 0) && (bestScore >= CONFIDENCE);

  if (isWake) {
    hits++;
    if (hits >= NEEDED_IN_A_ROW) {
      onWake(bestScore);
      hits = 0;
    }
  } else {
    hits = 0;
  }

  // Useful during tuning: watch which class is winning when it is quiet.
  Serial.printf("%-8s %.2f\\n", bestLabel, bestScore);
}

void onWake(float score) {
  Serial.printf(">>> WAKE  (%.2f)\\n", score);
  digitalWrite(LED_DETECT, HIGH);
  delay(600);
  digitalWrite(LED_DETECT, LOW);
  // Here is where a real device would start its big model, or wake a
  // second board over serial.
}

// ---- microphone ------------------------------------------------------
static void onPDMdata() {
  int bytes = PDM.available();
  PDM.read((char*)&sampleBuffer[0], bytes);
  if (!recording) return;

  for (int i = 0; i < bytes >> 1; i++) {
    inference.buffer[inference.buf_count++] = sampleBuffer[i];
    if (inference.buf_count >= inference.n_samples) {
      inference.buf_count = 0;
      inference.buf_ready = 1;
      break;
    }
  }
}

static bool microphoneSetup(uint32_t n_samples) {
  inference.buffer = (int16_t*)malloc(n_samples * sizeof(int16_t));
  if (!inference.buffer) return false;
  inference.buf_count = 0;
  inference.n_samples = n_samples;
  inference.buf_ready = 0;

  PDM.onReceive(&onPDMdata);
  PDM.setBufferSize(4096);
  if (!PDM.begin(1, EI_CLASSIFIER_FREQUENCY)) return false;
  PDM.setGain(80);
  return true;
}

static bool recordWindow() {
  inference.buf_ready = 0;
  inference.buf_count = 0;
  recording = true;
  while (inference.buf_ready == 0) delay(1);
  recording = false;
  return true;
}

static int getData(size_t offset, size_t length, float *out) {
  numpy::int16_to_float(&inference.buffer[offset], out, length);
  return 0;
}`
}],

trouble: [
  { q: 'It fires at the television constantly',
    a: `Your noise and other-speech classes are too small or not from your room. Add several more minutes of
    real background, retrain, and raise <code>NEEDED_IN_A_ROW</code> to 3.` },
  { q: 'It only works if you lean over the board',
    a: `The dataset was recorded close up. Re-record a third of it from two or three metres away and at
    different angles.` },
  { q: 'It works for you and nobody else',
    a: `A single-speaker dataset produces a single-speaker model. Get three or four people to record twenty
    samples each - this is the single biggest improvement available.` },
  { q: 'Out of memory when the model runs',
    a: `A Cortex-M4 with 256&nbsp;KB cannot hold an arbitrary model. Reduce the MFCC coefficients from 13 to 10,
    shorten the window to 800&nbsp;ms, or drop a convolutional layer. Edge Impulse shows the RAM estimate
    before you export.` },
  { q: 'Compiles but every window classifies as the same class',
    a: `The model was exported for a different frequency than the microphone is running at. The sketch uses
    <code>EI_CLASSIFIER_FREQUENCY</code> for exactly this reason - do not hardcode 16000.` },
  { q: 'Serial shows plausible labels but the LED never lights',
    a: `Your class is not called "wake". The label string must match what you named it during training,
    exactly, including case.` },
  { q: 'Detections lag about a second behind the word',
    a: `Normal, and it is the window length. The model cannot decide until it has heard the whole word.
    Overlapping windows help; a shorter window helps more but costs accuracy.` },
  { q: 'The current draw is much higher than expected',
    a: `Continuous inference on this board is 10-15&nbsp;mA and there is no way around that while it is
    listening. The saving comes from what happens after detection - see below.` }
],

next: `
<ul>
  <li><strong>Actually get the power down.</strong> Continuous listening is 10-15&nbsp;mA. Running inference on
  a duty cycle, or gating on a sound-level threshold so the model only runs when something is loud enough to
  possibly be speech, takes the average down by an order of magnitude.</li>
  <li><strong>Two words</strong> - "on" and "off" as separate classes. The structure is identical and it
  becomes a useful controller rather than a demonstration.</li>
  <li><strong>Wake the big model</strong>: this board on BLE, waking the
  <a href="project.html?p=uno-q-voice-control">UNO Q voice project</a> only when needed. That is exactly the
  architecture every commercial smart speaker uses, and it is the reason this project exists.</li>
  <li><strong>Try it on the accelerometer instead</strong>. The same MFCC-and-small-CNN approach works on
  vibration - see the <a href="project.html?p=tinyml-vibration-monitor">motor fault monitor</a>.</li>
</ul>`
});
