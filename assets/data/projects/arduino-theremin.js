/* Ultrasonic theremin: pitch from one hand, volume from an LDR. */
AB.addProject({
slug: 'arduino-theremin',
title: 'Ultrasonic theremin',
cat: 'audio',
level: 1,
time: '45 minutes',
solder: false,
board: 'Uno',
tags: ['hc-sr04', 'tone', 'ldr', 'music', 'no soldering', 'first project', 'scales'],
blurb: 'Wave one hand for pitch, shade a sensor for volume. Includes a scale mode so it sounds like music rather than a car alarm.',

skills: ['Ultrasonic ranging', 'tone() and frequency', 'Mapping ranges', 'Musical scales', 'Smoothing noisy inputs'],

intro: `
<p>A real theremin senses the capacitance of your hand near an antenna. This one measures the distance to your
hand with sound, which is not the same thing at all, but produces something recognisably in the same family for
about six dollars and no soldering.</p>
<p>The version everybody builds maps distance directly to frequency and sounds like a reversing lorry. The
addition here is a <strong>scale mode</strong>: instead of a continuous sweep, the distance snaps to the nearest
note of a chosen scale. Suddenly it is playable, and anything you do sounds vaguely intentional.</p>`,

what: [
  'Turn the distance from your hand into pitch, over about two octaves.',
  'Snap to a pentatonic, major or chromatic scale - or run continuous, like a real theremin.',
  'Control volume by shading an LDR with your other hand.',
  'Go silent when your hand leaves the playing range, rather than screaming at the ceiling.',
  'Show the note name on the Serial Monitor so you can learn where the notes are.'
],

how: `
<p>The <strong>HC-SR04</strong> sends a 40&nbsp;kHz burst and times the echo. Distance in centimetres is
<code>microseconds / 58</code>. It reads reliably from about 4&nbsp;cm to a metre or so, which is a good
playing range for a hand.</p>
<p>Its weaknesses shape this project. A flat palm reflects beautifully; fingers do not. The beam is about
15&nbsp;degrees wide, so it sees whatever is nearest in a cone. And readings occasionally come back wrong,
which is why the sketch takes three and uses the median.</p>
<p><code>tone()</code> generates a square wave on a pin using a hardware timer. It is not a sine wave - a square
wave contains all the odd harmonics, which is why it sounds harsh and buzzy rather than pure. That is a
limitation of the method and part of the character.</p>
<p><strong>Volume</strong> is the awkward part. <code>tone()</code> has no volume control at all - it is a
square wave at full amplitude or nothing. The trick used here is to put the LDR in series with the buzzer, so
shading it raises the resistance and physically reduces the current. It is crude, it works, and it is the same
principle as a volume knob.</p>
<p><strong>Snapping to a scale</strong> is the musical idea. A chromatic scale has twelve notes per octave, all
of which sound fine together. A pentatonic has five, chosen so that <em>any</em> two of them sound consonant -
which is why it is what xylophones for children are tuned to, and why it makes a bad instrument sound good.</p>`,

bom: [
  { id: 'uno', qty: 1, note: 'Or a Nano. Identical.' },
  { id: 'hcsr04', qty: 1 },
  { id: 'ldr', qty: 1 },
  { id: 'res10k', qty: 1, note: 'For the LDR divider that reads the light level.' },
  { id: 'buzzer', qty: 1, note: 'Passive. An active one plays one note and nothing else.' },
  { id: 'speaker8', qty: 1, note: 'Optional - much louder and less shrill than the piezo. Use it in place of the buzzer with a 100 ohm resistor in series.' },
  { id: 'res220', qty: 1, note: 'In series with the speaker, if you use one.' },
  { id: 'button', qty: 1, note: 'Cycles between scales.' },
  { id: 'bb-830', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [],

build: {
  parts: [
    { id: 'uno', comp: 'uno',    at: [0, 80] },
    { id: 'bb',  comp: 'bb830',  at: [0, 0] },
    { id: 'son', comp: 'hcsr04', at: [-40, -56], ry: 180 },
    { id: 'ldr', comp: 'ldr',    at: [24, -52] },
    { id: 'buz', comp: 'buzzer', at: [52, -56] },
    { id: 'btn', comp: 'button', at: [6, -52] }
  ],
  wires: [
    { from: 'uno.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V onto the lower red rail' },
    { from: 'uno.GND1', to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+10',  to: 'bb.T+10', color: 'red',    note: 'Bridge the two red rails' },
    { from: 'bb.B-10',  to: 'bb.T-10', color: 'black',  note: 'Bridge the two blue rails' },
    { from: 'son.VCC',  to: 'bb.T+3',  color: 'red',    note: 'Sonar power' },
    { from: 'son.GND',  to: 'bb.T-3',  color: 'black',  note: 'Sonar ground' },
    { from: 'son.TRIG', to: 'uno.D9',  color: 'yellow', note: 'Trigger pulse out' },
    { from: 'son.ECHO', to: 'uno.D10', color: 'white',  note: 'Echo pulse back' },
    { from: 'ldr.A',    to: 'bb.T+16', color: 'red',    note: 'LDR to 5 V' },
    { from: 'ldr.B',    to: 'uno.A0',  color: 'blue',   note: 'Divider junction, with a 10 k to ground' },
    { from: 'buz.+',    to: 'uno.D8',  color: 'orange', note: 'Buzzer, on a tone-capable pin' },
    { from: 'buz.-',    to: 'bb.T-20', color: 'black',  note: 'Buzzer ground' },
    { from: 'btn.1A',   to: 'uno.D2',  color: 'purple', note: 'Scale button, internal pull-up' },
    { from: 'btn.2A',   to: 'bb.T-24', color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note tip"><span class="t">Two ways to do volume, and they are different</span>
<p>The sketch reads the LDR on A0 and uses it to decide <em>whether</em> to play - a software gate. That is what
the wiring above does, and it is the reliable version.</p>
<p>The analog version puts the LDR physically <strong>in series</strong> between the buzzer's negative leg and
ground, so shading it reduces the current and the volume continuously. You can do both: read A0 for the gate
and put a second LDR in the audio path. That gives a genuine continuous volume that no amount of code can
match.</p></div>

<div class="note warn"><span class="t">Do not drive a speaker directly from a pin</span>
<p>An 8&nbsp;ohm speaker across 5&nbsp;V would draw over 600&nbsp;mA and destroy the pin. Always put at least
100&nbsp;&Omega; in series. A piezo buzzer is a capacitive load and draws almost nothing, which is why it needs
no resistor.</p></div>

<div class="note"><span class="t">tone() and pins 3 and 11</span>
<p>On an Uno, <code>tone()</code> uses Timer2, which also generates PWM on pins 3 and 11. While a tone is
playing, <code>analogWrite()</code> on those two pins will not work. Not an issue here - just remember it when
you add an LED that will not fade.</p></div>`,

assembly: [
  { h: 'Rails first',
    body: `<p>5&nbsp;V and ground onto the bottom rails, then the two bridges. Plug in USB, check the Uno's LED,
    unplug. Thirty seconds, and every later fault is not a power fault.</p>` },
  { h: 'The sonar, aimed upwards or outwards',
    body: `<p>Push it into the breadboard so the two cylinders face the way you will wave your hand. Facing
    upwards is the classic theremin pose; facing outwards across a table works better if you want to see what
    you are doing.</p>
    <p>Nothing should be within a metre in front of it - a wall at 40&nbsp;cm means the instrument plays that
    note constantly.</p>` },
  { h: 'LDR divider',
    body: `<p>LDR from the 5&nbsp;V rail to a free row, 10&nbsp;k from that row to ground, jumper from that row
    to A0. No polarity.</p>
    <p>Position it where you can shade it with your other hand without blocking the sonar.</p>` },
  { h: 'Buzzer and button',
    body: `<p>Buzzer's marked leg to D8. Button to D2 and ground.</p>` },
  { h: 'Calibrate and play',
    body: `<p>Upload, open the Serial Monitor at 9600, and watch the distance and note name while you move your
    hand. Adjust <code>NEAR_CM</code> and <code>FAR_CM</code> to suit your reach.</p>` }
],

libraries: [],

code: [{
  name: 'theremin.ino',
  intro: `<p>No libraries. Press the button to cycle: pentatonic, major, chromatic, continuous.</p>`,
  code: `/* ------------------------------------------------------------------
   Ultrasonic theremin
   HC-SR04 on D9/D10, LDR on A0, passive buzzer on D8, button on D2.
   ------------------------------------------------------------------ */

// ---- pins ------------------------------------------------------------
#define TRIG_PIN  9
#define ECHO_PIN 10
#define BUZZER    8
#define LDR_PIN  A0
#define BUTTON    2

// ---- playing range ---------------------------------------------------
const int NEAR_CM = 5;      // closest useful distance
const int FAR_CM  = 55;     // furthest - beyond this it goes silent
const int LIGHT_THRESHOLD = 300;   // below this reading, mute
// ----------------------------------------------------------------------

// Note frequencies, two octaves of C major starting at C4.
// Index 0 = C4, 12 = C5, 24 = C6.
const int CHROMATIC[25] = {
  262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494,
  523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988,
  1047
};

const char* NAMES[12] = { "C", "C#", "D", "D#", "E", "F", "F#",
                          "G", "G#", "A", "A#", "B" };

// Which semitones of the chromatic scale each mode uses
const byte MAJOR[]      = { 0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24 };
const byte PENTATONIC[] = { 0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24 };

enum Mode { PENTA, MAJOR_SCALE, CHROMATIC_SCALE, CONTINUOUS };
Mode mode = PENTA;
const char* MODE_NAMES[] = { "pentatonic", "major", "chromatic", "continuous" };

int lastNote = -1;
bool wasDown = false;
unsigned long lastPrint = 0;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);

  Serial.println(F("Ultrasonic theremin"));
  Serial.print(F("mode: "));
  Serial.println(MODE_NAMES[mode]);

  startupSweep();
}

void loop() {
  checkButton();

  int cm = distanceCm();
  int light = analogRead(LDR_PIN);

  // Out of range, or the volume hand is covering the LDR: silence.
  if (cm < NEAR_CM || cm > FAR_CM || light < LIGHT_THRESHOLD) {
    noTone(BUZZER);
    lastNote = -1;
    report(cm, light, -1);
    delay(18);
    return;
  }

  int freq = frequencyFor(cm);
  tone(BUZZER, freq);
  report(cm, light, freq);

  delay(18);          // about 55 updates a second: responsive, not jittery
}

/* --- distance, median of three ---------------------------------------- */
int distanceCm() {
  int a = ping(), b = ping(), c = ping();
  if (a > b) { int t = a; a = b; b = t; }
  if (b > c) { int t = b; b = c; c = t; }
  if (a > b) { int t = a; a = b; b = t; }
  return b;
}

int ping() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(3);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // 12 ms cap: a hand is never more than 2 m away, and a long timeout
  // makes the instrument feel laggy whenever nothing is in range.
  long us = pulseIn(ECHO_PIN, HIGH, 12000UL);
  if (us == 0) return 999;
  return (int)(us / 58);
}

/* --- distance to pitch ------------------------------------------------ */
int frequencyFor(int cm) {
  if (mode == CONTINUOUS) {
    // a smooth glide, like a real theremin
    return map(cm, NEAR_CM, FAR_CM, 1047, 262);
  }

  // Otherwise pick a step from the chosen scale. Near = high.
  const byte* scale;
  byte len;
  if (mode == PENTA)            { scale = PENTATONIC; len = sizeof(PENTATONIC); }
  else if (mode == MAJOR_SCALE) { scale = MAJOR;      len = sizeof(MAJOR); }
  else                          { scale = NULL;       len = 25; }

  int idx = map(cm, FAR_CM, NEAR_CM, 0, len - 1);
  idx = constrain(idx, 0, len - 1);

  int semitone = scale ? scale[idx] : idx;
  return CHROMATIC[semitone];
}

/* --- mode button ------------------------------------------------------ */
void checkButton() {
  bool down = digitalRead(BUTTON) == LOW;
  if (down && !wasDown) {
    delay(30);
    if (digitalRead(BUTTON) == LOW) {
      mode = (Mode)((mode + 1) % 4);
      noTone(BUZZER);
      Serial.print(F("mode: "));
      Serial.println(MODE_NAMES[mode]);
      confirmBeep();
    }
  }
  wasDown = down;
}

/* --- feedback --------------------------------------------------------- */
void report(int cm, int light, int freq) {
  if (millis() - lastPrint < 150) return;
  lastPrint = millis();

  Serial.print(cm);
  Serial.print(F(" cm  light "));
  Serial.print(light);
  if (freq > 0) {
    Serial.print(F("  "));
    Serial.print(freq);
    Serial.print(F(" Hz  "));
    Serial.print(noteName(freq));
  } else {
    Serial.print(F("  --"));
  }
  Serial.println();
}

/* Find the nearest entry in the table and name it. */
const char* noteName(int freq) {
  int best = 0, bestErr = 30000;
  for (int i = 0; i < 25; i++) {
    int err = abs(CHROMATIC[i] - freq);
    if (err < bestErr) { bestErr = err; best = i; }
  }
  return NAMES[best % 12];
}

void confirmBeep() {
  tone(BUZZER, 1400, 60);
  delay(80);
  noTone(BUZZER);
}

void startupSweep() {
  for (int i = 0; i < 25; i += 2) {
    tone(BUZZER, CHROMATIC[i], 45);
    delay(55);
  }
  noTone(BUZZER);
}`,
  after: `<p>The scale tables are the whole musical idea, and they are two arrays. A pentatonic scale leaves out
  the two notes that can clash, so every position sounds acceptable and moving between any two positions sounds
  deliberate. Switch to continuous mode and you will hear immediately what that is worth.</p>`
}],

upload: `<p>Uno, correct port. It plays a rising sweep at boot, which confirms the buzzer works before you
start wondering about the sonar.</p>`,

tune: [
  { h: 'Set the playing range to your reach',
    body: `<p><code>NEAR_CM</code> and <code>FAR_CM</code>. Below 4&nbsp;cm the HC-SR04 cannot measure at all;
    beyond about 60&nbsp;cm a hand is a poor reflector and readings get unreliable. 5 to 55 is a comfortable
    arm's sweep.</p>` },
  { h: 'Light threshold',
    body: `<p>Watch the <code>light</code> figure in the Serial Monitor with your hand over the LDR and away
    from it. Put <code>LIGHT_THRESHOLD</code> between the two. Note it depends on the room - recalibrate if you
    move it.</p>` },
  { h: 'If the pitch jumps around',
    body: `<p>Your hand is at an angle. A flat palm parallel to the sensor reflects much better than fingers.
    Also check nothing is in the beam behind your hand - the sensor reports the <em>nearest</em> thing, and a
    sleeve counts.</p>` },
  { h: 'A different key',
    body: `<p>The tables start at C4. To play in G, add 7 to every entry in <code>MAJOR</code> and
    <code>PENTATONIC</code> and extend <code>CHROMATIC</code> upwards. Or just transpose the whole thing by
    multiplying every frequency by 1.5.</p>` },
  { h: 'Making it louder and less shrill',
    body: `<p>Swap the piezo for an 8&nbsp;ohm speaker with a 100-220&nbsp;&Omega; resistor in series. Much
    fuller, and the resistor keeps the pin safe. For real volume, feed a PAM8403 amplifier from the pin through
    a 1&nbsp;&micro;F capacitor and a 10&nbsp;k resistor to ground.</p>` }
],

trouble: [
  { q: 'Constant tone that never changes',
    a: `The sonar is seeing a fixed object - a wall, the desk, or the breadboard itself. Move it, or aim it
    upwards.` },
  { q: 'No sound at all',
    a: `Active buzzer instead of passive, buzzer backwards, or the LDR is reading below the threshold so the
    sketch is muting. The Serial Monitor tells you which.` },
  { q: 'Distance reads 999 always',
    a: `That is the sketch's "no echo" value. TRIG and ECHO are swapped, or the sensor has no 5&nbsp;V.` },
  { q: 'Distance reads 0',
    a: `<code>pulseIn</code> returned instantly - usually ECHO not connected at all.` },
  { q: 'Pitch is backwards',
    a: `Swap <code>FAR_CM</code> and <code>NEAR_CM</code> in the <code>map()</code> call inside
    <code>frequencyFor()</code>.` },
  { q: 'Notes crackle between steps',
    a: `Normal - <code>tone()</code> restarts the timer on each change. Increase the delay in the loop
    slightly, or smooth the distance over several readings before mapping it.` },
  { q: 'Volume control does nothing',
    a: `In the wiring above, the LDR gates the sound rather than fading it. For continuous volume, put a second
    LDR physically in series with the buzzer.` },
  { q: 'It works, but it sounds terrible',
    a: `Square waves do. Press the button until you are in pentatonic mode - that helps enormously - and use a
    speaker rather than a piezo.` }
],

next: `
<ul>
  <li><strong>Two sensors</strong>, one for pitch and one for volume, which is much closer to how a real
  theremin is played.</li>
  <li><strong>Record and loop</strong>: store a sequence of notes and play them back underneath what you are
  playing.</li>
  <li><strong>MIDI out</strong>: an ATmega32U4 board (a Pro Micro) can present itself as a USB MIDI device, so
  the theremin drives a real synthesiser and sounds like anything you want.</li>
  <li><strong>Add lights</strong> - a WS2812 strip whose colour follows the pitch makes it a performance
  object. See the <a href="project.html?p=sound-reactive-led">sound-reactive strip</a>.</li>
</ul>`
});
