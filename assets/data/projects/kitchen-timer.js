/* Kitchen timer: TM1637 display, rotary encoder, buzzer. No soldering. */
AB.addProject({
slug: 'kitchen-timer',
title: 'Kitchen timer with a real knob',
cat: 'display',
level: 1,
time: '1 hour',
solder: false,
board: 'Nano',
tags: ['tm1637', 'rotary encoder', 'timer', 'interrupts', 'no soldering', 'first project', 'kitchen'],
blurb: 'Turn the knob to set, press to start, press to pause. Four big digits you can read across a kitchen, and three presets for the things you always time.',

skills: ['Rotary encoders', 'Interrupts', 'Seven-segment displays', 'State machines', 'Non-blocking timing'],

intro: `
<p>Phone timers are fine until your hands are covered in flour. A physical knob you can turn with a knuckle and
digits you can read from the other side of the room is genuinely better, and it is a tidy first project: two
modules, one knob, no soldering.</p>
<p>The reason it earns a place here is the <strong>rotary encoder</strong>. Almost every beginner reads one
badly, gets skipped steps and double counts, and concludes the part is rubbish. Doing it properly takes about
six lines and an interrupt, and once you have those six lines you can put a good knob on anything.</p>`,

what: [
  'Set any time from 10 seconds to 99 minutes by turning the knob, in sensible steps that get coarser as the number gets bigger.',
  'Start, pause and resume with the knob\'s own push switch.',
  'Hold to reset, and hold longer for three presets you can set to whatever you always time.',
  'Count down on four big digits with a blinking colon, and flash the last ten seconds.',
  'Alarm with an escalating beep, and stop when you press the knob.'
],

how: `
<p>A <strong>rotary encoder</strong> is not a potentiometer. It has no ends and no absolute position - it has
two switches, A and B, arranged so that turning the shaft closes and opens them slightly out of step with each
other. From the <em>order</em> in which they change, you can tell which way it turned.</p>
<p>The naive way to read it - wait for A to fall, then look at B - misses steps whenever your code is busy
elsewhere, and double-counts on contact bounce. It works in a demo sketch that does nothing else and falls
apart in a real one.</p>
<p>The reliable way is a <strong>lookup table on both pins, in an interrupt</strong>. Every time either pin
changes, the handler shifts the previous and current states into a 4-bit number and looks up which direction
that transition means. Invalid transitions - which is what bounce produces - look up to zero and are discarded
for free. Six lines, no missed steps.</p>
<p>The <strong>TM1637</strong> drives four 7-segment digits over two wires. It looks like I2C and is not - no
addresses, no acknowledgement - so it needs two ordinary digital pins and cannot share a bus. It also has a
hardware brightness control, which is why the display can dim smoothly rather than flicker.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'An Uno works identically.' },
  { id: 'tm1637', qty: 1, note: 'The 0.56 inch four-digit module with a colon in the middle. Red is easiest to read at a distance.' },
  { id: 'rotary', qty: 1, note: 'KY-040. It has its own pull-up resistors on the board, which saves you two parts.' },
  { id: 'buzzer', qty: 1, note: 'Passive, so the alarm can escalate rather than just being on.' },
  { id: 'bb-400', qty: 1, note: 'A half-size board is plenty for this one.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'psu5v3a', qty: 1, own: true, note: 'Any USB charger. It draws about 40 mA.' },
  { id: 'box-abs', qty: 1, note: 'Optional. A wipe-clean box matters more in a kitchen than anywhere else.' }
],

tools: [],

build: {
  parts: [
    { id: 'nano', comp: 'nano',   at: [0, 46] },
    { id: 'bb',   comp: 'bb400',  at: [0, -22] },
    { id: 'disp', comp: 'tm1637', at: [-22, -82], ry: 180 },
    { id: 'enc',  comp: 'rotary', at: [34, -78], ry: 180 },
    { id: 'buz',  comp: 'buzzer', at: [64, -76] }
  ],
  wires: [
    { from: 'nano.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V onto the lower red rail' },
    { from: 'nano.GND',  to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+8',    to: 'bb.T+8',  color: 'red',    note: 'Bridge the two red rails' },
    { from: 'bb.B-8',    to: 'bb.T-8',  color: 'black',  note: 'Bridge the two blue rails' },
    { from: 'disp.VCC',  to: 'bb.T+3',  color: 'red',    note: 'Display power' },
    { from: 'disp.GND',  to: 'bb.T-3',  color: 'black',  note: 'Display ground' },
    { from: 'disp.CLK',  to: 'nano.D4', color: 'green',  note: 'TM1637 clock. Any digital pin - NOT the I2C ones' },
    { from: 'disp.DIO',  to: 'nano.D5', color: 'blue',   note: 'TM1637 data' },
    { from: 'enc.VCC',   to: 'bb.T+14', color: 'red',    note: 'Encoder power' },
    { from: 'enc.GND',   to: 'bb.T-14', color: 'black',  note: 'Encoder ground' },
    { from: 'enc.CLK',   to: 'nano.D2', color: 'yellow', note: 'Encoder A. D2 is an interrupt pin - this matters' },
    { from: 'enc.DT',    to: 'nano.D3', color: 'orange', note: 'Encoder B. D3 is the other interrupt pin' },
    { from: 'enc.SW',    to: 'nano.D6', color: 'purple', note: 'The push switch inside the knob' },
    { from: 'buz.+',     to: 'nano.D9', color: 'grey',   note: 'Alarm buzzer' },
    { from: 'buz.-',     to: 'bb.T-20', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireIntro: `<p>Fifteen connections, none soldered. The two that matter are the encoder's CLK and DT - they have
to be on D2 and D3, and the reason is worth understanding.</p>`,

wireNotes: `
<div class="note warn"><span class="t">The encoder must be on D2 and D3</span>
<p>Those are the only two pins on an Uno or Nano that can trigger an external interrupt. An interrupt means the
chip drops whatever it is doing the instant a pin changes, runs a few lines, and goes back - so a quick turn is
never missed, even while the display is being updated.</p>
<p>Polling the pins in <code>loop()</code> instead works right up until you add something slow, and then the
knob starts feeling broken for reasons that have nothing to do with the knob.</p></div>

<div class="note tip"><span class="t">The TM1637 does not go on the I2C pins</span>
<p>Its two wires are called CLK and DIO, which makes it look like I2C. It is not - there is no addressing and
no acknowledgement scheme, so it cannot share a bus with anything. Give it two ordinary digital pins, as
here.</p></div>

<div class="note"><span class="t">The KY-040 has its pull-ups fitted</span>
<p>The bare encoder needs two 10&nbsp;k resistors to 5&nbsp;V; the KY-040 module has them on the board already,
which is most of why it is worth the extra thirty cents. Its SW pin still needs
<code>INPUT_PULLUP</code> in software, because that one is usually not fitted.</p></div>`,

solderIntro: `<p>No soldering to build it. To put it in a box on a kitchen wall, these are the joints.</p>`,

solderSteps: [
  { h: 'Panel-mount the encoder through the lid',
    body: `<p>The KY-040 has a threaded bush and a nut. Drill a 7&nbsp;mm hole, push the shaft through, and
    tighten the nut from the front. Fit a proper knob - this is a thing you will turn with wet hands and the
    knob is the whole interface.</p>` },
  { h: 'Five wires to the encoder, twisted',
    body: `<p>150&nbsp;mm, twisted into a loom so they stay tidy. Tin each end before soldering to the module's
    pins - one second on the pad, one second on the wire, then hold them together and touch.</p>` },
  { h: 'A window for the display',
    body: `<p>Cut a rectangle in the lid and glue a strip of dark red acrylic or theatre gel behind it. A red
    filter over red LEDs raises the contrast enormously and hides the unlit segments, which is exactly why
    every clock radio ever made looks like that.</p>` },
  { h: 'Four wires to the display',
    body: `<p>Same technique. Keep them shortish - under 200&nbsp;mm - because the TM1637 protocol has no error
    checking and a long noisy run shows up as flickering digits.</p>` },
  { h: 'Sleeve every joint',
    body: `<p>Heat-shrink, slid on before you solder. In a kitchen there will eventually be steam.</p>` },
  { h: 'Check before power',
    body: `<p>Continuity: 5&nbsp;V to ground must be silent. Then power up - the display should light
    immediately, before you touch anything.</p>` }
],

assembly: [
  { h: 'Power rails and the bridges first',
    body: `<p>Four wires. Plug in USB, confirm the Nano's LED, unplug. Then build on top of a power supply you
    have already proved.</p>` },
  { h: 'The display on its own',
    body: `<p>Four wires, upload the real sketch, and confirm you get <code>00:00</code>. If the digits appear
    backwards, see the calibration notes - some modules number their digits right to left.</p>` },
  { h: 'Then the encoder',
    body: `<p>Five wires. Turn the knob and the number should climb smoothly, one step per detent. If it jumps
    by two or goes the wrong way, that is covered below and both are one-line fixes.</p>` },
  { h: 'Buzzer last',
    body: `<p>Marked or longer leg to D9.</p>` },
  { h: 'Set your three presets and put it in the kitchen',
    body: `<p>Change <code>PRESETS</code> to the things you actually time. Mine are 3 minutes for a soft egg,
    12 for pasta, and 25 for a pomodoro - yours will be different, which is the point of a timer you built.</p>` }
],

libraries: [
  { name: 'TM1637Display', by: 'Avishay Orpaz', why: 'The four-digit display. Search "TM1637" in the Library Manager and pick the one by Avishay Orpaz.' }
],

code: [{
  name: 'kitchen_timer.ino',
  code: `/* ------------------------------------------------------------------
   Kitchen timer
   TM1637 on D4/D5, KY-040 encoder on D2/D3 with its switch on D6,
   passive buzzer on D9.

   Turn      - set the time
   Press     - start, then pause, then resume
   Hold 1 s  - reset to zero
   Hold 2.5s - cycle the presets
   ------------------------------------------------------------------ */

#include <TM1637Display.h>

// ---- pins ------------------------------------------------------------
#define CLK_PIN    4
#define DIO_PIN    5
#define ENC_A      2      // must be an interrupt pin
#define ENC_B      3      // must be an interrupt pin
#define ENC_SW     6
#define BUZZER     9

// ---- behaviour -------------------------------------------------------
#define MAX_SECONDS  (99 * 60)
#define HOLD_RESET   1000UL
#define HOLD_PRESET  2500UL
#define ALARM_MAX    (5 * 60000UL)     // give up after five minutes
const unsigned int PRESETS[3] = { 3 * 60, 12 * 60, 25 * 60 };
// ----------------------------------------------------------------------

TM1637Display display(CLK_PIN, DIO_PIN);

enum State { SETTING, RUNNING, PAUSED, ALARMING };
State state = SETTING;

volatile int8_t encDelta = 0;
volatile uint8_t encState = 0;

long setSeconds = 0;              // what the knob is showing
long remaining = 0;               // milliseconds left when running
unsigned long lastTick = 0;
unsigned long alarmStart = 0;
unsigned long pressStart = 0;
bool wasDown = false;
bool handled = false;
byte presetIndex = 0;

void setup() {
  Serial.begin(9600);
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  pinMode(ENC_SW, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);

  attachInterrupt(digitalPinToInterrupt(ENC_A), encoderISR, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_B), encoderISR, CHANGE);

  display.setBrightness(5);
  startupAnimation();
  draw();
}

void loop() {
  handleKnob();
  handleButton();

  if (state == RUNNING) {
    unsigned long now = millis();
    remaining -= (long)(now - lastTick);
    lastTick = now;
    if (remaining <= 0) {
      remaining = 0;
      state = ALARMING;
      alarmStart = millis();
      Serial.println(F("time up"));
    }
  }

  if (state == ALARMING) {
    soundAlarm();
    if (millis() - alarmStart > ALARM_MAX) {
      noTone(BUZZER);
      state = SETTING;
    }
  }

  draw();
  delay(15);
}

/* --- the encoder ------------------------------------------------------
   Both pins interrupt on CHANGE. The handler shifts the old and new
   states into a 4-bit index and looks up the direction. Invalid
   transitions - which is what contact bounce produces - map to 0 and
   are discarded, so no debouncing is needed at all. */
void encoderISR() {
  static const int8_t TABLE[16] = {
    0, -1, 1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, -1, 0
  };
  encState = ((encState << 2) | (digitalRead(ENC_A) << 1) | digitalRead(ENC_B)) & 0x0F;
  encDelta += TABLE[encState];
}

void handleKnob() {
  noInterrupts();
  int8_t d = encDelta;
  encDelta = 0;
  interrupts();
  if (!d) return;

  // A KY-040 gives four state changes per click, so divide down.
  static int8_t accum = 0;
  accum += d;
  int8_t clicks = accum / 4;
  if (!clicks) return;
  accum -= clicks * 4;

  if (state == ALARMING) { stopAlarm(); return; }
  if (state == RUNNING || state == PAUSED) return;   // no fiddling mid-run

  setSeconds += clicks * stepFor(setSeconds);
  setSeconds = constrain(setSeconds, 0, (long)MAX_SECONDS);
  tone(BUZZER, 2400, 4);            // a tiny tick per click
}

/* Coarser steps as the number gets bigger, so you can dial 45 minutes
   without turning the knob four hundred times. */
int stepFor(long secs) {
  if (secs < 60)    return 10;      // 10 second steps under a minute
  if (secs < 600)   return 30;      // 30 second steps under ten minutes
  return 60;                        // then whole minutes
}

/* --- the button ------------------------------------------------------- */
void handleButton() {
  bool down = digitalRead(ENC_SW) == LOW;

  if (down && !wasDown) {
    pressStart = millis();
    handled = false;
  }

  // act on the long holds while still held, so they are discoverable
  if (down && !handled) {
    unsigned long held = millis() - pressStart;
    if (held > HOLD_PRESET) {
      setSeconds = PRESETS[presetIndex];
      presetIndex = (presetIndex + 1) % 3;
      state = SETTING;
      handled = true;
      tone(BUZZER, 1800, 90);
      Serial.print(F("preset "));
      Serial.println(setSeconds);
    }
  }

  if (!down && wasDown) {
    unsigned long held = millis() - pressStart;
    wasDown = false;
    if (handled || held < 30) return;

    if (held > HOLD_RESET) {
      setSeconds = 0;
      state = SETTING;
      tone(BUZZER, 600, 120);
      Serial.println(F("reset"));
      return;
    }

    switch (state) {
      case SETTING:
        if (setSeconds <= 0) { tone(BUZZER, 400, 120); break; }
        remaining = setSeconds * 1000L;
        lastTick = millis();
        state = RUNNING;
        tone(BUZZER, 2000, 60);
        Serial.println(F("start"));
        break;
      case RUNNING:
        state = PAUSED;
        tone(BUZZER, 1200, 60);
        break;
      case PAUSED:
        lastTick = millis();
        state = RUNNING;
        tone(BUZZER, 2000, 60);
        break;
      case ALARMING:
        stopAlarm();
        break;
    }
  }
  wasDown = down;
}

void stopAlarm() {
  noTone(BUZZER);
  state = SETTING;
  setSeconds = 0;
  Serial.println(F("alarm stopped"));
}

/* --- the alarm -------------------------------------------------------- */
void soundAlarm() {
  // Beeps get closer together the longer it is ignored.
  unsigned long elapsed = millis() - alarmStart;
  unsigned long gap = max(300UL, 1400UL - elapsed / 30);
  unsigned long phase = millis() % gap;
  if (phase < 110) tone(BUZZER, 2600);
  else             noTone(BUZZER);
}

/* --- the display ------------------------------------------------------ */
void draw() {
  long secs;
  bool colon = true;

  switch (state) {
    case SETTING:
      secs = setSeconds;
      break;
    case RUNNING:
      secs = (remaining + 999) / 1000;      // round up, so it ends at 1 not 0
      colon = (millis() / 500) % 2;         // blink while counting
      break;
    case PAUSED:
      secs = (remaining + 999) / 1000;
      colon = (millis() / 250) % 2;         // faster blink = paused
      break;
    case ALARMING:
      // flash the whole display
      if ((millis() / 250) % 2) { display.clear(); return; }
      secs = 0;
      break;
  }

  int mins = secs / 60;
  int rem  = secs % 60;

  // The last ten seconds get brighter, so it is obvious across a room.
  if (state == RUNNING && secs <= 10) display.setBrightness(7);
  else if (state == ALARMING)         display.setBrightness(7);
  else                                display.setBrightness(5);

  display.showNumberDecEx(mins * 100 + rem, colon ? 0b01000000 : 0, true);
}

void startupAnimation() {
  for (int i = 0; i <= 4; i++) {
    uint8_t seg[4] = { 0, 0, 0, 0 };
    for (int j = 0; j < i; j++) seg[j] = 0b00111111;   // a zero
    display.setSegments(seg);
    delay(110);
  }
  display.clear();
  delay(150);
}`,
  after: `<p>The <code>(remaining + 999) / 1000</code> is a small but important detail. Plain integer division
  would show <code>0:00</code> for the whole final second, so a timer set to ten seconds appears to spend two
  seconds at zero. Rounding up means it shows <code>0:01</code> until the moment it actually fires - which is
  what every timer you have ever used does, and you would notice immediately if it did not.</p>`
}],

upload: `<p>Nano, correct port, upload. If it fails with a timeout, try
<strong>Tools &rarr; Processor &rarr; ATmega328P (Old Bootloader)</strong>.</p>
<p>You should see four zeros appear one at a time, then <code>00:00</code>. Turn the knob and the number climbs
in ten-second steps.</p>`,

tune: [
  { h: 'If the knob counts double, or half',
    body: `<p>Encoders vary in how many state changes they produce per physical click - usually four, sometimes
    two. Change the <code>/ 4</code> and <code>* 4</code> in <code>handleKnob()</code> to match. If one detent
    moves the number by two steps, use 2; if it takes two detents to move once, you already have it right at
    4.</p>` },
  { h: 'If it turns the wrong way',
    body: `<p>Swap the CLK and DT wires, or negate: <code>setSeconds -= clicks * stepFor(setSeconds);</code>.</p>` },
  { h: 'Your own presets',
    body: `<p>The <code>PRESETS</code> array, in seconds. Three is a good number - enough to be useful, few
    enough to remember which is which. Hold the knob to cycle them.</p>` },
  { h: 'Step sizes',
    body: `<p><code>stepFor()</code> decides how coarse the knob is at each range. If you mostly time short
    things, make the first step 5 seconds. If you mostly time long things, start at 60. The principle - coarser
    steps for bigger numbers - is what makes a single knob workable across a 99-minute range.</p>` },
  { h: 'Digits appear backwards',
    body: `<p>Some TM1637 modules number their digits right to left. The library has a flip option, or you can
    reverse the four bytes you pass to <code>setSegments</code>. It is a known quirk, not a fault.</p>` }
],

trouble: [
  { q: 'Display stays blank',
    a: `CLK and DIO swapped, or no 5&nbsp;V at the module. The library reports no errors at all, so a blank
    display is the only symptom you get - check with a multimeter.` },
  { q: 'Knob does nothing',
    a: `Check CLK and DT are on D2 and D3 specifically. On any other pins the interrupts are never attached and
    the knob is genuinely dead.` },
  { q: 'Knob skips steps or jumps around',
    a: `That is what the lookup table exists to prevent, so suspect the wiring first: a loose DT wire gives
    exactly this. Then check both <code>attachInterrupt</code> lines are present - with only one, you get half
    the resolution and erratic direction.` },
  { q: 'Number creeps on its own',
    a: `Electrical noise on a long encoder cable. Keep it under 200&nbsp;mm, twist the wires, and add a
    100&nbsp;nF capacitor from each of CLK and DT to ground right at the encoder.` },
  { q: 'The push switch does nothing',
    a: `SW needs <code>INPUT_PULLUP</code> - the module usually does not fit a pull-up on that pin even though
    it does on the other two. Measure D6: it should read 5&nbsp;V and drop to 0 when pressed.` },
  { q: 'Timer drifts by a few seconds over an hour',
    a: `The Nano's ceramic resonator is good to about 0.5&nbsp;%, which is 18 seconds an hour. Fine for pasta.
    For anything better you need a DS3231 - see the <a href="project.html?p=desk-clock">desk clock</a>.` },
  { q: 'Buzzer clicks instead of beeping',
    a: `Active buzzer instead of passive.` },
  { q: 'Alarm will not stop',
    a: `Press or turn the knob. It also gives up by itself after five minutes - that is
    <code>ALARM_MAX</code>.` }
],

next: `
<ul>
  <li><strong>Three timers at once</strong>, which is what a real kitchen needs. A 20&times;4 LCD and the knob
  selecting which one you are setting.</li>
  <li><strong>Make it a clock too</strong>: add a DS3231 and show the time when no timer is running. See the
  <a href="project.html?p=desk-clock">desk clock</a>, which shares most of this wiring.</li>
  <li><strong>Louder alarm</strong>: swap the piezo for a small speaker with a 100&nbsp;&Omega; resistor, or
  drive a DFPlayer and have it announce what has finished - see the
  <a href="project.html?p=mp3-doorbell">MP3 doorbell</a>.</li>
  <li><strong>Reuse the encoder code everywhere.</strong> Those six lines are the good way to read a knob, and
  they drop straight into any project that wants one.</li>
</ul>`
});
