/* WS2812B ring between a mirror and a half-silvered pane. */
AB.addProject({
slug: 'infinity-mirror',
title: 'Infinity mirror',
cat: 'light',
level: 3,
time: '4 hours',
solder: true,
board: 'Nano',
tags: ['ws2812b', 'fastled', 'mirror', 'ring', 'effects', 'rotary encoder'],
blurb: 'A tunnel of light that is not there. Two sheets of glass, a ring of LEDs, and the most disproportionate effort-to-impressiveness ratio in this book.',

skills: ['WS2812B', 'FastLED effects', 'Rotary encoders', 'Optical assembly', 'Enclosure work'],

intro: `
<p>An infinity mirror is a physical trick, not an electronic one. A ring of LEDs sits between an ordinary
mirror at the back and a half-silvered pane at the front. Light bounces between the two, and each bounce lets
a little escape towards you - so you see the ring, then a dimmer copy behind it, then a dimmer one behind that,
receding apparently forever.</p>
<p>The electronics is a Nano, a ring of WS2812Bs and an encoder. The craft is entirely in the optical sandwich,
and this guide spends most of its length there, because that is where the result is won or lost.</p>`,

what: [
  'Show eight effects on a 16-LED ring: solid, comet, rainbow, breathing, sparkle, fire, two-colour chase and a slow fade.',
  'Change effect by pressing the encoder, and colour or speed by turning it.',
  'Remember the last setting in EEPROM.',
  'Look considerably more expensive than $25 of parts.'
],

how: `
<p>The optics are three layers, and the order is not negotiable:</p>
<ol>
  <li><strong>A normal mirror at the back</strong>, reflective side facing forward.</li>
  <li><strong>The LED ring in between</strong>, facing forward, with a gap of 10-25&nbsp;mm.</li>
  <li><strong>A half-silvered (one-way) pane at the front</strong>, with the film on the <em>inside</em>
  facing the LEDs.</li>
</ol>
<p>Light from an LED hits the half-silvered pane. Most of it reflects back to the rear mirror, which sends it
forward again, and a fraction escapes through the front at each pass. Each escaping copy has travelled twice
the gap further, so it appears further away and dimmer - hence a tunnel.</p>
<p>The depth you see depends on the <strong>transmission of the front pane</strong>. A film that passes
30&nbsp;% gives a bright but shallow tunnel of four or five copies; one that passes 10&nbsp;% gives a dim and
very deep one. Around 15-20&nbsp;% is the sweet spot, and it is the single most important thing you buy.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'ws2812-ring', qty: 1, note: '16 LEDs. 24 or 60 LED rings look even better and need a bigger frame and more current.' },
  { id: 'mirror-kit', qty: 1, note: 'One-way mirror film plus a sheet of acrylic. Buy film rated 15-20 % transmission.' },
  { id: 'photoframe', qty: 1, note: 'A deep box frame, 20 cm square, with a real glass front and at least 25 mm of depth inside.' },
  { id: 'rotary', qty: 1, note: 'KY-040. Turn for colour, press for effect.' },
  { id: 'res220', qty: 1, note: 'In series with the LED data line.' },
  { id: 'cap1000', qty: 1, note: 'Across the ring supply.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'tape', qty: 1 }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm' }, { id: 'strippers' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',        at: [0, 30] },
    { id: 'ring', comp: 'ws2812ring',  at: [0, -50] },
    { id: 'enc',  comp: 'rotary',      at: [52, 20], ry: 180 }
  ],
  wires: [
    { from: 'ring.5V',  to: 'nano.5V',   color: 'red',    note: 'Ring power. 16 LEDs at full white is under 1 A' },
    { from: 'ring.GND', to: 'nano.GND',  color: 'black',  note: 'Ring ground' },
    { from: 'ring.DI',  to: 'nano.D6',   color: 'green',  note: 'Data in, through a 220 ohm resistor at the ring end' },
    { from: 'enc.VCC',  to: 'nano.5V',   color: 'red',    note: 'Encoder power' },
    { from: 'enc.GND',  to: 'nano.GND2', color: 'black',  note: 'Encoder ground' },
    { from: 'enc.CLK',  to: 'nano.D2',   color: 'blue',   note: 'Encoder A. D2 is an interrupt pin' },
    { from: 'enc.DT',   to: 'nano.D3',   color: 'yellow', note: 'Encoder B. D3 is the other interrupt pin' },
    { from: 'enc.SW',   to: 'nano.D4',   color: 'orange', note: 'The push switch in the encoder shaft' }
  ]
},

wireNotes: `
<div class="note tip"><span class="t">Why the encoder is on D2 and D3</span>
<p>Those are the Uno and Nano's only external interrupt pins. Reading an encoder by polling works if nothing
else is happening, but this sketch spends most of its time driving LEDs - and FastLED disables interrupts
briefly while it does, which is exactly when a fast turn gets missed. Interrupts plus a short handler is the
reliable arrangement.</p></div>

<div class="note warn"><span class="t">Power the ring from the supply, not through the Nano</span>
<p>16 LEDs at full white is 960&nbsp;mA. The Nano's 5&nbsp;V pin and its traces are not meant to carry that.
Run 5&nbsp;V and ground from the supply to a small distribution point, and feed both the ring and the Nano from
there.</p></div>

<div class="note"><span class="t">The 220 ohm and the capacitor</span>
<p>Resistor in series with the data line, as close to the ring's DI pad as you can. 1000&nbsp;&micro;F across
5&nbsp;V and GND at the ring, stripe to ground. Both are in every FastLED guide because both prevent real
problems.</p></div>`,

solderSteps: [
  { h: 'Three wires to the ring, before it goes anywhere near the frame',
    body: `<p>The ring's pads are marked <code>5V</code>, <code>GND</code>, <code>DI</code> and
    <code>DO</code>. You use the first three; leave DO alone.</p>
    <p>These pads are small and on a thin PCB. Tin each pad first (one second), tin the wire end, then hold and
    touch for a second. Do not hover - you will lift the pad.</p>` },
  { h: 'Route the wires through the back, not the side',
    body: `<p>Decide now where the wires leave the frame. Out through a hole in the backboard is invisible; out
    through the side is not. Drill it before you assemble anything.</p>
    <p>Leave 200&nbsp;mm of slack - you will want to lift the ring out again at least twice.</p>` },
  { h: 'Strain-relieve the ring joints',
    body: `<p>A blob of hot glue over all three, or a strip of tape. The ring will be handled while you work out
    the spacing, and those pads tear off the flexible-ish PCB very easily.</p>` },
  { h: 'Encoder on flying leads',
    body: `<p>Five wires, 150&nbsp;mm, so the encoder can be mounted through the side or back of the frame where
    a hand can reach it. Twist them into a loom.</p>
    <p>The KY-040 module has its own pull-up resistors, so no extra parts.</p>` },
  { h: 'Small distribution board',
    body: `<p>Nano socket, a screw terminal for the 5&nbsp;V in, the 1000&nbsp;&micro;F, and the
    220&nbsp;&Omega; in the data line. Solder the resistor in line rather than using a patch wire, so you cannot
    forget it.</p>` },
  { h: 'Test the whole electronics assembly before any glass',
    body: `<p>Run it on the bench, cycle every effect, turn the encoder. Fixing a cold joint after the mirror is
    glued in is a genuinely bad afternoon.</p>` }
],

assembly: [
  { h: 'Apply the one-way film to the acrylic or the frame glass',
    body: `<p>This is the fiddly bit and it is worth doing slowly.</p>
    <ul>
      <li>Clean the pane obsessively - any speck becomes a permanent bubble.</li>
      <li>Spray the pane generously with water with one drop of washing-up liquid in it.</li>
      <li>Peel the film's backing while spraying the sticky side too, so it never touches itself.</li>
      <li>Lay it on, then squeegee from the centre outwards, firmly, overlapping strokes.</li>
      <li>Trim the edge with a fresh blade against a straight edge.</li>
    </ul>
    <p>Small bubbles clear over a day or two as the water evaporates. Big ones do not - push them out now.</p>` },
  { h: 'Work out the gap by holding it, before you fix anything',
    body: `<p>Rest the mirror on the bench, hold the lit ring above it, and hold the filmed pane above that.
    Move the pane up and down. You will see the tunnel appear, deepen and then dim.</p>
    <p>10&nbsp;mm gives a tight, deep tunnel; 25&nbsp;mm gives a wide, shallow one. Pick what you like before
    you build the spacer.</p>` },
  { h: 'Build the sandwich',
    body: `<p>Back to front: rear mirror (reflective side forward), spacer, LED ring facing forward, spacer,
    filmed pane with the <strong>film facing inward</strong>.</p>
    <p>The film must face the LEDs. Facing outward it still works optically but scratches within a week, and the
    tunnel is noticeably duller.</p>` },
  { h: 'Black out everything that is not a mirror',
    body: `<p>Matt black paint or black card on every internal surface - the spacers, the inside edges, the back
    of the ring, the gap around the frame. Any pale surface inside the sandwich shows up as a bright smear and
    ruins the illusion.</p>
    <p>This step does more for the final look than any code you write.</p>` },
  { h: 'Seal the edges from stray light',
    body: `<p>Black tape round the whole sandwich. Room light leaking in from the side washes out the deeper
    reflections.</p>` },
  { h: 'Mount the encoder and close it up',
    body: `<p>A hole in the side or the back of the frame. Then hang it somewhere with a dark background - an
    infinity mirror against a bright wall looks like a lamp; against a dark one it looks like a hole.</p>` }
],

libraries: [
  { name: 'FastLED', by: 'Daniel Garcia / Mark Kriegsman', why: 'WS2812B timing, HSV colour and the noise functions the fire effect uses.' },
  { name: 'EEPROM', by: 'Arduino', how: 'Built in', why: 'Remembers the effect and colour.' }
],

code: [{
  name: 'infinity_mirror.ino',
  code: `/* ------------------------------------------------------------------
   Infinity mirror
   16-LED WS2812B ring on D6, KY-040 encoder on D2/D3 with its switch on D4.
   Turn = colour (or speed, on effects that have no colour).
   Press = next effect.  Hold = brightness mode.
   ------------------------------------------------------------------ */

#include <FastLED.h>
#include <EEPROM.h>

#define LED_PIN     6
#define NUM_LEDS   16
#define ENC_A       2
#define ENC_B       3
#define ENC_SW      4

#define MAX_MILLIAMPS 900
#define EFFECT_COUNT   8
#define EE_MAGIC_ADDR 20
#define EE_MAGIC    0x1F

CRGB leds[NUM_LEDS];

volatile int8_t encDelta = 0;
volatile uint8_t encState = 0;

uint8_t effect = 0;
uint8_t hue = 0;
uint8_t brightness = 90;
bool brightnessMode = false;
uint8_t counter = 0;

unsigned long lastPress = 0, pressStart = 0;
bool wasDown = false;

void setup() {
  Serial.begin(9600);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_MILLIAMPS);

  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  pinMode(ENC_SW, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), encoderISR, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_B), encoderISR, CHANGE);

  if (EEPROM.read(EE_MAGIC_ADDR) == EE_MAGIC) {
    effect     = EEPROM.read(EE_MAGIC_ADDR + 1) % EFFECT_COUNT;
    hue        = EEPROM.read(EE_MAGIC_ADDR + 2);
    brightness = max((uint8_t)10, EEPROM.read(EE_MAGIC_ADDR + 3));
  }
  FastLED.setBrightness(brightness);
}

void loop() {
  handleEncoder();
  handleButton();
  render();
  FastLED.show();
  FastLED.delay(14);
  counter++;
}

/* --- encoder ---------------------------------------------------------- */
/* Quadrature decoding in a table. Both pins interrupt on CHANGE, the
   handler builds a 4-bit history, and the table says which way it moved.
   This is far more reliable than reading B when A falls. */
void encoderISR() {
  static const int8_t TABLE[16] = {
    0, -1, 1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, -1, 0
  };
  encState = ((encState << 2) | (digitalRead(ENC_A) << 1) | digitalRead(ENC_B)) & 0x0F;
  encDelta += TABLE[encState];
}

void handleEncoder() {
  noInterrupts();
  int8_t d = encDelta;
  encDelta = 0;
  interrupts();
  if (!d) return;

  // four state changes per detent on a KY-040
  if (brightnessMode) {
    int b = brightness + d * 3;
    brightness = constrain(b, 8, 255);
    FastLED.setBrightness(brightness);
  } else {
    hue += d * 2;
  }
  save();
}

void handleButton() {
  bool down = digitalRead(ENC_SW) == LOW;

  if (down && !wasDown) {
    pressStart = millis();
    wasDown = true;
  }

  if (!down && wasDown) {
    wasDown = false;
    unsigned long held = millis() - pressStart;
    if (held < 40) return;                  // bounce

    if (held > 700) {
      brightnessMode = !brightnessMode;
      blink(brightnessMode ? CRGB::White : CRGB::Black);
    } else {
      effect = (effect + 1) % EFFECT_COUNT;
      Serial.print(F("effect "));
      Serial.println(effect);
    }
    save();
  }
}

void blink(CRGB c) {
  fill_solid(leds, NUM_LEDS, c);
  FastLED.show();
  delay(120);
}

void save() {
  if (millis() - lastPress < 800) return;   // do not hammer the EEPROM
  lastPress = millis();
  EEPROM.update(EE_MAGIC_ADDR, EE_MAGIC);
  EEPROM.update(EE_MAGIC_ADDR + 1, effect);
  EEPROM.update(EE_MAGIC_ADDR + 2, hue);
  EEPROM.update(EE_MAGIC_ADDR + 3, brightness);
}

/* --- the effects ------------------------------------------------------ */
void render() {
  switch (effect) {

    case 0:                                        // solid colour
      fill_solid(leds, NUM_LEDS, CHSV(hue, 230, 255));
      break;

    case 1: {                                      // comet
      fadeToBlackBy(leds, NUM_LEDS, 48);
      uint8_t pos = (millis() / 55) % NUM_LEDS;
      leds[pos] = CHSV(hue, 220, 255);
      break;
    }

    case 2:                                        // rainbow round the ring
      fill_rainbow(leds, NUM_LEDS, hue + millis() / 40, 255 / NUM_LEDS);
      break;

    case 3: {                                      // breathing
      uint8_t b = beatsin8(12, 20, 255);
      fill_solid(leds, NUM_LEDS, CHSV(hue, 230, b));
      break;
    }

    case 4:                                        // sparkle
      fadeToBlackBy(leds, NUM_LEDS, 28);
      if (random8() < 70) leds[random16(NUM_LEDS)] = CHSV(hue + random8(40), 200, 255);
      break;

    case 5:                                        // fire
      for (uint8_t i = 0; i < NUM_LEDS; i++) {
        uint8_t n = inoise8(i * 60, millis() / 5);
        leds[i] = CHSV(18 + (n >> 4), 240, qadd8(90, n));
      }
      break;

    case 6: {                                      // two-colour chase
      uint8_t pos = (millis() / 70) % NUM_LEDS;
      for (uint8_t i = 0; i < NUM_LEDS; i++) {
        uint8_t d = (i + NUM_LEDS - pos) % NUM_LEDS;
        leds[i] = (d < NUM_LEDS / 2) ? CHSV(hue, 230, 255)
                                     : CHSV(hue + 128, 230, 255);
      }
      break;
    }

    case 7: {                                      // very slow colour drift
      uint8_t h = hue + (millis() / 400);
      for (uint8_t i = 0; i < NUM_LEDS; i++) leds[i] = CHSV(h + i * 2, 220, 255);
      break;
    }
  }
}`,
  after: `<p>The quadrature lookup table is worth keeping. The naive way to read an encoder - wait for A to
  fall, then read B - misses steps when the code is busy and double-counts on contact bounce. Building a 4-bit
  history of both pins and looking up the transition catches every step and rejects every bounce, in two lines
  inside the interrupt.</p>`
}],

upload: `<p>Nano, correct port. Test the effects on the bench before the glass goes together - press to cycle,
turn to change colour, hold for brightness mode.</p>`,

tune: [
  { h: 'Getting the tunnel right is optical, not electrical',
    body: `<p>If the depth disappoints, in order of impact: the film's transmission is too high (buy 15&nbsp;%),
    the interior is not black enough, the gap is too small, or room light is leaking in at the edges.</p>` },
  { h: 'Brightness and depth trade against each other',
    body: `<p>A brighter ring shows more reflections, up to a point - then the front pane glares and you lose
    the far end. Around brightness 80-120 usually looks deepest.</p>` },
  { h: 'Encoder direction and step size',
    body: `<p>If turning clockwise goes the wrong way, swap CLK and DT. If one detent changes the colour too
    much, reduce the <code>d * 2</code> multiplier.</p>` },
  { h: 'A bigger ring',
    body: `<p>24 and 60-LED rings look far better because the tunnel becomes a continuous circle rather than
    dots. Change <code>NUM_LEDS</code> and raise <code>MAX_MILLIAMPS</code> - a 60-LED ring is 3.6&nbsp;A at
    full white, so a bigger supply is needed.</p>` },
  { h: 'Adding effects',
    body: `<p>Everything in FastLED's <code>DemoReel100</code> example drops straight in. Add a case, raise
    <code>EFFECT_COUNT</code>.</p>` }
],

trouble: [
  { q: 'No tunnel, just a ring of lights',
    a: `The film is on the wrong pane or facing the wrong way, or the rear mirror is missing. The sandwich only
    works with a real mirror at the back and the half-silvered pane at the front, film inward.` },
  { q: 'Tunnel is only two or three deep',
    a: `Film transmission too high, or the interior is not black. Both are fixable after the fact - blacking
    out the inside is usually the bigger win.` },
  { q: 'You can see the frame, the wires and your own hand',
    a: `Light leaking in at the edges. Black tape round the whole sandwich, and hang it against a dark
    background.` },
  { q: 'First LED is a different colour from the rest',
    a: `Data line problem. Add or move the 220&nbsp;&Omega; resistor closer to the DI pad, and shorten the
    lead.` },
  { q: 'Colours are wrong - red shows as green',
    a: `Colour order. Change <code>GRB</code> to <code>RGB</code> in the <code>addLeds</code> line.` },
  { q: 'Encoder skips or jumps around',
    a: `Interrupts not attached to both pins, or a very long unshielded lead. Both pins must be on D2 and D3
    with <code>CHANGE</code>.` },
  { q: 'Settings not remembered',
    a: `The <code>save()</code> throttle means a change is only written 800&nbsp;ms after the last one. Give it
    a second before you cut the power.` },
  { q: 'Bubbles under the film',
    a: `Not enough soapy water, or dust. Small ones clear in a few days; large ones need the film peeling back
    and re-laying, which usually works if you are quick.` }
],

next: `
<ul>
  <li><strong>Make it a clock.</strong> A DS3231 and the ring becomes hour, minute and second markers. The
  tunnel makes it read like a much more expensive object.</li>
  <li><strong>Make it react to sound</strong> with a MAX9814 - see the
  <a href="project.html?p=sound-reactive-led">sound-reactive lights</a>.</li>
  <li><strong>Go rectangular</strong> with a strip round the inside of a deep frame rather than a ring. Harder
  to get the corners right, and a much bigger object.</li>
  <li><strong>Two-way infinity</strong>: half-silvered on both sides and the tunnel goes in both directions.
  Genuinely disorientating and worth doing once.</li>
</ul>`
});
