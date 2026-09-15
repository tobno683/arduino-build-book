/* RGB mood lamp: WS2812 ring, one pot, one button. No soldering. */
AB.addProject({
slug: 'rgb-mood-lamp',
title: 'RGB mood lamp',
cat: 'light',
level: 1,
time: '45 minutes',
solder: false,
board: 'Nano',
tags: ['ws2812b', 'fastled', 'potentiometer', 'hsv', 'no soldering', 'first project'],
blurb: 'One knob picks any colour in the spectrum, one button cycles through six moods. The gentlest possible introduction to addressable LEDs.',

skills: ['WS2812B basics', 'FastLED', 'HSV colour', 'Reading a potentiometer', 'Power budgeting'],

intro: `
<p>Addressable LEDs look intimidating and are not. A WS2812B has a tiny controller built into every LED, so a
whole ring of sixteen needs exactly one data wire - and a library that does the hard part in one line.</p>
<p>This is the smallest thing you can build that uses them properly, with no soldering, and it ends up as an
object you actually keep on a shelf. It also introduces <strong>HSV colour</strong>, which is the reason
turning one knob can sweep through every colour there is.</p>`,

what: [
  'Set any hue in the spectrum from a single knob - red through orange, green, blue and back to red.',
  'Cycle six modes with a button: solid, slow fade, candle flicker, breathing, rainbow and a soft white.',
  'Remember the mode and colour through a power cut.',
  'Hold a hard current limit, so it cannot ask for more than your supply can give.',
  'Sit happily on a bookshelf running from a phone charger.'
],

how: `
<p>Each <strong>WS2812B</strong> is a red, a green and a blue LED plus a controller in one 5&nbsp;mm package.
Data goes into the first one; it keeps the first 24 bits for itself and passes everything after that out to the
next. So a whole strip or ring needs a single data pin, regardless of length.</p>
<p>The protocol is a stream of pulses where a long pulse is a 1 and a short one a 0, with tolerances measured
in hundreds of nanoseconds. That is far too tight for <code>digitalWrite()</code>, which is why FastLED exists
- it bit-bangs the timing in hand-written assembly.</p>
<p><strong>HSV instead of RGB</strong> is the idea worth taking away. RGB describes a colour as three amounts of
light, which is how the hardware works and not how people think. HSV describes it as
<strong>hue</strong> (which colour, 0-255 around a wheel), <strong>saturation</strong> (how vivid) and
<strong>value</strong> (how bright). Turning one knob sweeps the hue and you get a rainbow; doing the same in
RGB would need three coordinated changes.</p>
<p>The <strong>potentiometer</strong> is a resistor with a sliding contact. Wire the two outer legs to 5&nbsp;V
and ground and the middle leg gives you a voltage between the two, which <code>analogRead()</code> turns into
0-1023. Divide by four and you have 0-255 - exactly a hue.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'An Uno works identically. A Nano just fits inside a smaller lamp.' },
  { id: 'ws2812-ring', qty: 1, note: '16-LED ring. The 12 and 24 LED rings work too - change one number in the sketch.' },
  { id: 'pot10k', qty: 1, note: 'Fit a knob if you can. It makes an enormous difference to how it feels to use.' },
  { id: 'button', qty: 1 },
  { id: 'res220', qty: 1, note: 'In the data line, close to the ring.' },
  { id: 'cap1000', qty: 1, note: 'Across the ring 5 V and ground. Not strictly required at this size, and good practice.' },
  { id: 'bb-830', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'psu5v3a', qty: 1, own: true, note: 'A phone charger. 16 LEDs at full white is under 1 A, and this sketch limits it well below that.' },
  { id: 'diffuser', qty: 1, note: 'Optional but transformative - a frosted jar, a glass block or a sheet of white acrylic turns 16 dots into a glow.' }
],

tools: [],

build: {
  parts: [
    { id: 'nano', comp: 'nano',       at: [0, 0] },
    { id: 'bb',   comp: 'bb830',      at: [0, -70] },
    { id: 'ring', comp: 'ws2812ring', at: [-46, -128] },
    { id: 'pot',  comp: 'pot10k',     at: [30, -124] },
    { id: 'btn',  comp: 'button',     at: [58, -122] }
  ],
  wires: [
    { from: 'nano.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V onto the lower red rail' },
    { from: 'nano.GND',  to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+10',   to: 'bb.T+10', color: 'red',    note: 'Bridge the two red rails - they are separate strips' },
    { from: 'bb.B-10',   to: 'bb.T-10', color: 'black',  note: 'Bridge the two blue rails' },
    { from: 'ring.5V',   to: 'bb.T+3',  color: 'red',    note: 'Ring power' },
    { from: 'ring.GND',  to: 'bb.T-3',  color: 'black',  note: 'Ring ground' },
    { from: 'ring.DI',   to: 'nano.D6', color: 'green',  note: 'Data in, through a 220 ohm resistor. Note DI, not DO' },
    { from: 'pot.1',     to: 'bb.T-14', color: 'black',  note: 'Pot outer leg to ground' },
    { from: 'pot.W',     to: 'nano.A0', color: 'yellow', note: 'Pot middle leg - the wiper' },
    { from: 'pot.3',     to: 'bb.T+14', color: 'red',    note: 'Pot other outer leg to 5 V' },
    { from: 'btn.1A',    to: 'nano.D2', color: 'blue',   note: 'Mode button, using the internal pull-up' },
    { from: 'btn.2A',    to: 'bb.T-20', color: 'black',  note: 'Button to ground' }
  ]
},

wireIntro: `<p>Twelve connections, no soldering. The only one that needs care is the ring's data pin - it has
both a <strong>DI</strong> (data in) and a <strong>DO</strong> (data out) pad, and only DI works.</p>`,

wireNotes: `
<div class="note warn"><span class="t">DI, not DO</span>
<p>Look at the back of the ring: the pads are labelled <code>5V</code>, <code>GND</code>, <code>DI</code> and
<code>DO</code>. Data flows in at DI and out at DO, so the next ring in a chain could be fed from it. Connect
to DO and absolutely nothing happens, with no other clue as to why.</p></div>

<div class="note tip"><span class="t">The 220 ohm resistor in the data line</span>
<p>As close to the ring as you can get it. A WS2812B's data input is sensitive to the sharp edge of a 5&nbsp;V
signal, and the resistor softens it. Plenty of people skip it and get away with it; the ones who do not get a
first pixel that shows the wrong colour.</p></div>

<div class="note"><span class="t">A potentiometer has no polarity</span>
<p>The two outer legs go to 5&nbsp;V and ground, and it does not matter which way round. If turning it
clockwise runs the colours backwards, just swap them - no code change needed.</p>
<p>The middle leg is the wiper and must go to the analog pin.</p></div>

<div class="note warn"><span class="t">Sixteen LEDs is nearly an amp at full white</span>
<p>Each WS2812B at full white is three LEDs at 20&nbsp;mA, so 60&nbsp;mA. Sixteen of them is 960&nbsp;mA - more
than a laptop USB port will give you. The sketch sets a hard limit of 500&nbsp;mA, which is comfortably inside
what any phone charger supplies and is still plenty bright for a lamp.</p></div>`,

solderIntro: `<p>No soldering needed. When you want to build it into a real lamp, these are the joints.</p>`,

solderSteps: [
  { h: 'Optional: solder the ring leads properly',
    body: `<p>The ring's pads are small and on a thin board. Tin each pad first - iron on the pad for one
    second, feed a touch of solder, remove - then tin the wire end, then hold the two together and touch for one
    second. They merge instantly.</p>
    <p>Do not hover. If you hold the iron there for five seconds the pad lifts off the board and it is
    permanent.</p>` },
  { h: 'Hot glue over the joints',
    body: `<p>A blob over all three. The pads tear off very easily if a wire is ever pulled, and a lamp gets
    picked up.</p>` },
  { h: 'The resistor inline in the data wire',
    body: `<p>Rather than putting it on a board, cut the data wire, strip both ends, and solder the resistor
    between them. Slide heat-shrink over it first, then shrink it once the joint is made.</p>` },
  { h: 'Pot and button on flying leads',
    body: `<p>Three wires to the pot, two to the button, long enough to reach the outside of whatever the lamp
    lives in. Twist each group together so they stay tidy.</p>` },
  { h: 'Check before power',
    body: `<p>Multimeter on continuity: 5&nbsp;V to ground must be silent. Then power up.</p>` }
],

assembly: [
  { h: 'Power rails and the two bridges first',
    body: `<p>Then plug in USB, confirm the Nano lights up, and unplug. Always.</p>` },
  { h: 'Install FastLED before you wire the ring',
    body: `<p><strong>Sketch &rarr; Include Library &rarr; Manage Libraries</strong>, search FastLED, Install.
    It is one of the best-maintained libraries in the whole ecosystem.</p>` },
  { h: 'Ring next, and test it alone',
    body: `<p>Three wires. Upload the test sketch below - all sixteen should go red, then green, then blue. If
    only the first lights, the data line is the problem; if none light, it is power or you are on DO.</p>` },
  { h: 'Then the pot and the button',
    body: `<p>Upload the real sketch. Turn the knob and the colour should sweep smoothly through the
    spectrum.</p>` },
  { h: 'Put it inside something',
    body: `<p>This is where it becomes a lamp rather than a breadboard. A frosted jam jar, a glass block, a
    cylinder of white acrylic, a paper lantern, a 3D printed shade - anything that diffuses. Sixteen visible
    dots look like electronics; the same sixteen behind frosted glass look like a lamp.</p>
    <p>Leave the knob and the button reachable.</p>` }
],

libraries: [
  { name: 'FastLED', by: 'Daniel Garcia / Mark Kriegsman', why: 'Handles the nanosecond-accurate WS2812B timing, HSV colour, and the power limiter.' },
  { name: 'EEPROM', by: 'Arduino', how: 'Built in', why: 'Remembers the mode and colour through a power cut.' }
],

code: [
{
  h: 'First: prove the ring works',
  name: 'ring_test.ino',
  code: `#include <FastLED.h>

#define LED_PIN   6
#define NUM_LEDS 16

CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, 500);
  FastLED.setBrightness(60);
}

void loop() {
  fill_solid(leds, NUM_LEDS, CRGB::Red);   FastLED.show(); delay(700);
  fill_solid(leds, NUM_LEDS, CRGB::Green); FastLED.show(); delay(700);
  fill_solid(leds, NUM_LEDS, CRGB::Blue);  FastLED.show(); delay(700);
}`,
  after: `<p>If red shows as green, your ring uses a different colour order - change <code>GRB</code> to
  <code>RGB</code> in the <code>addLeds</code> line. That is the single most common WS2812 surprise and it is a
  one-word fix.</p>`
},
{
  h: 'The mood lamp',
  name: 'mood_lamp.ino',
  code: `/* ------------------------------------------------------------------
   RGB mood lamp
   WS2812B ring on D6, potentiometer on A0, mode button on D2.
   Turn the knob for colour. Press the button for the next mode.
   ------------------------------------------------------------------ */

#include <FastLED.h>
#include <EEPROM.h>

// ---- settings --------------------------------------------------------
#define LED_PIN        6
#define NUM_LEDS      16
#define POT_PIN       A0
#define BUTTON_PIN     2
#define MAX_MILLIAMPS 500     // be honest about your supply
#define BRIGHTNESS    140     // 0-255
#define MODE_COUNT      6
// ----------------------------------------------------------------------

#define EE_ADDR   30
#define EE_MAGIC  0x6C

CRGB leds[NUM_LEDS];

uint8_t mode = 0;
uint8_t hue = 0;
uint8_t smoothedHue = 0;
bool wasDown = false;
unsigned long lastSave = 0;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_MILLIAMPS);
  FastLED.setBrightness(BRIGHTNESS);

  if (EEPROM.read(EE_ADDR) == EE_MAGIC) {
    mode = EEPROM.read(EE_ADDR + 1) % MODE_COUNT;
  }

  smoothedHue = analogRead(POT_PIN) / 4;
  Serial.print(F("mode "));
  Serial.println(mode);
}

void loop() {
  readKnob();
  readButton();
  render();
  FastLED.show();
  FastLED.delay(14);           // about 70 frames a second
}

/* --- the knob ---------------------------------------------------------
   analogRead gives 0-1023; divide by four for a 0-255 hue. The
   smoothing stops a cheap pot's last-bit jitter making the colour
   shimmer when nobody is touching it. */
void readKnob() {
  uint8_t raw = analogRead(POT_PIN) / 4;
  // move at most a little way towards the new reading each frame
  int diff = (int)raw - (int)smoothedHue;
  if (diff > 127) diff -= 256;          // wrap the short way round
  if (diff < -127) diff += 256;
  smoothedHue += diff / 6;
  hue = smoothedHue;
}

/* --- the button ------------------------------------------------------- */
void readButton() {
  bool down = digitalRead(BUTTON_PIN) == LOW;

  if (down && !wasDown) {
    delay(25);                          // debounce
    if (digitalRead(BUTTON_PIN) == LOW) {
      mode = (mode + 1) % MODE_COUNT;
      Serial.print(F("mode "));
      Serial.println(mode);
      lastSave = millis();
      flashConfirm();
    }
  }
  wasDown = down;

  // save a little after the last press, not on every press
  if (lastSave && millis() - lastSave > 1500) {
    lastSave = 0;
    EEPROM.update(EE_ADDR, EE_MAGIC);
    EEPROM.update(EE_ADDR + 1, mode);
  }
}

void flashConfirm() {
  fill_solid(leds, NUM_LEDS, CRGB(30, 30, 30));
  FastLED.show();
  delay(60);
}

/* --- the six moods ---------------------------------------------------- */
void render() {
  switch (mode) {

    case 0:                                    // solid, knob picks colour
      fill_solid(leds, NUM_LEDS, CHSV(hue, 240, 255));
      break;

    case 1: {                                  // slow fade round the wheel
      uint8_t h = hue + (millis() / 80);
      fill_solid(leds, NUM_LEDS, CHSV(h, 235, 255));
      break;
    }

    case 2:                                    // candle
      for (uint8_t i = 0; i < NUM_LEDS; i++) {
        // smooth noise, not random() - random looks like a fault,
        // noise looks like a flame
        uint8_t n = inoise8(i * 50, millis() / 6);
        leds[i] = CHSV(20 + (n >> 5), 230, qadd8(100, n));
      }
      break;

    case 3: {                                  // breathing
      uint8_t v = beatsin8(10, 25, 255);       // 10 breaths a minute
      fill_solid(leds, NUM_LEDS, CHSV(hue, 240, v));
      break;
    }

    case 4:                                    // rainbow round the ring
      fill_rainbow(leds, NUM_LEDS, hue + millis() / 40, 255 / NUM_LEDS);
      break;

    case 5: {                                  // warm to cool white
      // the knob becomes a colour-temperature dial
      uint8_t sat = map(hue, 0, 255, 90, 0);
      fill_solid(leds, NUM_LEDS, CHSV(32, sat, 255));
      break;
    }
  }
}`,
  after: `<p>Three things in there come back in every later LED project:</p>
  <ul>
    <li><strong><code>CHSV</code> rather than <code>CRGB</code>.</strong> One number for colour. That is the
    whole reason a single knob works.</li>
    <li><strong><code>setMaxPowerInVoltsAndMilliamps</code>.</strong> FastLED scales every frame down before
    sending it so the calculated draw never exceeds your figure. It turns "the lamp browned out and went white
    and flickery" into "the lamp is slightly dimmer than I asked".</li>
    <li><strong><code>inoise8()</code> for the candle.</strong> Perlin noise is smooth and correlated over
    time, so it looks like a flame. <code>random8()</code> is uncorrelated and looks like a broken
    connection.</li>
  </ul>`
}],

upload: `<p>Nano, correct port, upload. If it fails with a timeout, try
<strong>Tools &rarr; Processor &rarr; ATmega328P (Old Bootloader)</strong> - most Nano clones need it.</p>
<p>Turn the knob. The colour should sweep smoothly all the way round and back again.</p>`,

tune: [
  { h: 'Brightness',
    body: `<p><code>BRIGHTNESS</code> at 140 is a comfortable indoor lamp. 255 is a lot for 16 LEDs at close
    range, and 40 is a good night light. Note this is separate from the power limit - brightness scales what
    you ask for, and the limiter caps what actually gets sent.</p>` },
  { h: 'If the colour shimmers when you let go of the knob',
    body: `<p>Pot jitter. Increase the smoothing by changing <code>diff / 6</code> to <code>diff / 12</code> -
    it responds a little more slowly and sits perfectly still.</p>` },
  { h: 'A bigger ring or a strip',
    body: `<p>Change <code>NUM_LEDS</code>. Everything else works unchanged. Remember the power: a 60-LED strip
    at full white is 3.6&nbsp;A, so raise <code>MAX_MILLIAMPS</code> only as far as your supply genuinely
    allows.</p>` },
  { h: 'Add your own mood',
    body: `<p>Add a <code>case 6:</code> and raise <code>MODE_COUNT</code>. Everything in FastLED's
    <code>DemoReel100</code> example drops straight in - it is worth opening just to read.</p>` },
  { h: 'Getting a good white',
    body: `<p>Mode 5 uses hue 32 with low saturation, which reads as warm white. A true <code>CRGB::White</code>
    on a cheap ring usually looks slightly green; <code>FastLED.setCorrection(TypicalLEDStrip)</code> in
    <code>setup()</code> compensates.</p>` }
],

trouble: [
  { q: 'Nothing lights at all',
    a: `You are connected to <strong>DO</strong> instead of DI. Check the label on the back of the ring. After
    that, check it has 5&nbsp;V.` },
  { q: 'Only the first LED lights, usually white',
    a: `Classic sign of a data signal the ring does not understand. Add the 220&nbsp;&Omega; resistor if it is
    missing, and shorten the data jumper.` },
  { q: 'Red shows as green',
    a: `Colour order. Change <code>GRB</code> to <code>RGB</code> in the <code>addLeds</code> line.` },
  { q: 'Flickers or the Nano resets at high brightness',
    a: `Not enough current. Lower <code>MAX_MILLIAMPS</code>, use a proper phone charger rather than a laptop
    port, and add the 1000&nbsp;&micro;F capacitor across the ring's 5&nbsp;V and ground.` },
  { q: 'Colour jumps rather than sweeping',
    a: `A worn or dirty potentiometer. Print <code>analogRead(A0)</code> and turn it slowly - you should see a
    smooth climb from near 0 to near 1023. Jumps mean the pot, not the code.` },
  { q: 'Knob works backwards',
    a: `Swap the two outer legs of the pot.` },
  { q: 'Mode is forgotten on power-up',
    a: `The save happens 1.5 seconds after the last press, to avoid wearing out the EEPROM. Give it a moment
    before pulling the plug.` },
  { q: 'Compile error: FastLED.h not found',
    a: `The library is not installed. Sketch &rarr; Include Library &rarr; Manage Libraries, search FastLED.` }
],

next: `
<ul>
  <li><strong>Add a second knob</strong> for brightness on A1. Two knobs is a genuinely nice interface.</li>
  <li><strong>Make it sound-reactive</strong> with a microphone - see the
  <a href="project.html?p=sound-reactive-led">spectrum strip</a>.</li>
  <li><strong>Build the <a href="project.html?p=infinity-mirror">infinity mirror</a></strong> - same ring, same
  library, a far more impressive object.</li>
  <li><strong>Put it on Wi-Fi</strong>: swap the Nano for an ESP32 and you can control it from a phone, as in
  the <a href="project.html?p=ambient-tv-backlight">TV backlight</a>.</li>
</ul>`
});
