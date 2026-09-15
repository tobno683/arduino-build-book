/* Word clock: 11x11 WS2812 grid behind a letter stencil, DS3231 timekeeping. */
AB.addProject({
slug: 'word-clock',
title: 'Word clock',
cat: 'display',
level: 4,
time: 'A weekend',
solder: true,
board: 'Nano',
feature: true,
tags: ['ws2812b', 'ds3231', 'fastled', 'word clock', 'stencil', 'light bleed'],
blurb: 'IT IS TWENTY PAST THREE, spelled out in light on a grid of letters. The most-admired thing in this book, and the one where the woodwork matters more than the code.',

skills: ['LED grid addressing', 'Serpentine layout', 'Time-to-words logic', 'Light bleed control', 'RTC timekeeping'],

intro: `
<p>A word clock shows the time as a sentence: a grid of letters with the relevant words lit and the rest dark.
It reads as language rather than numbers, which makes it the one piece of home electronics that visitors
actually stop and look at.</p>
<p>The electronics is genuinely easy - a Nano, a clock chip and a grid of WS2812Bs, all of which you have met
elsewhere in this book. <strong>The build is the hard part</strong>, and specifically one thing: stopping light
from one letter leaking into its neighbours. A word clock with light bleed looks like a blurry mess; the same
clock with proper dividers looks like it cost four hundred pounds. This guide spends most of its length
there.</p>`,

what: [
  'Show the time in five-minute steps as English words, on an 11x11 grid of letters.',
  'Light four corner LEDs for the one to four minutes in between, so it is never more than a minute wrong.',
  'Keep time to about a minute a year on a DS3231, through power cuts.',
  'Dim itself automatically at night, so it is readable in daylight and not blinding at 3 am.',
  'Offer a few colour modes, including one where the colour drifts slowly through the day.'
],

how: `
<p><strong>The grid.</strong> 121 WS2812Bs in an 11&times;11 square behind a stencil of letters. Each LED sits
behind exactly one letter. Because WS2812Bs are chained, LED number 0 is one corner and 120 is the far one -
and the physical path usually <em>snakes</em>: left to right along the first row, right to left along the
second, and so on. That is called a <strong>serpentine</strong> layout, and every odd row is therefore
backwards. One helper function that converts an (x, y) position into an LED index handles it, and after that
you can forget about it.</p>
<p><strong>The words.</strong> The standard English layout fits everything into 11&times;11:</p>
<pre style="font-family:var(--mono);font-size:.8rem;line-height:1.5;margin:14px 0;overflow-x:auto">I T L I S A S A M P M
A C Q U A R T E R D C
T W E N T Y F I V E X
H A L F S T E N F T O
P A S T E R U N I N E
O N E S I X T H R E E
F O U R F I V E T W O
E I G H T E L E V E N
S E V E N T W E L V E
T E N S E O C L O C K</pre>
<p>(That is ten rows; the eleventh is four corner LEDs for the extra minutes, or a blank row depending on the
face you buy.) Each word is a run of LEDs - a start position, a row and a length - so the whole vocabulary is a
small table, and telling the time becomes "light these four words".</p>
<p><strong>The rounding.</strong> A word clock works in five-minute steps, and past 32 minutes the phrasing
flips from "past" to "to" and the hour advances. Getting <em>twenty five to four</em> right at 15:35 is the
piece of logic worth reading carefully - it catches everybody.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'An ESP32 is worth considering if you want NTP time instead of an RTC - the LED code is identical.' },
  { id: 'ws2812-strip', qty: 3, as: 'WS2812B strip, 60 LED/m - 3 m', note: 'Cut into eleven rows of eleven. Buy 3 m of 60 LED/m: 121 LEDs at 16.6 mm spacing is about 2.1 m, and you will waste some at the cuts.' },
  { id: 'ds3231', qty: 1, note: 'DS3231, not DS1307. The 1307 drifts a minute a fortnight, which on a clock is unforgivable.' },
  { id: 'rtc-cell', qty: 1, own: true },
  { id: 'wc-face', qty: 1, note: 'Laser cut, or printed on acetate and backed with black card. This is the part that decides how good it looks.' },
  { id: 'diffuser', qty: 1, note: 'White acrylic or a sheet of drafting film behind the letters, so each one glows evenly rather than showing a dot.' },
  { id: 'photoframe', qty: 1, note: 'A deep box frame, at least 35 mm inside. The grid, the dividers and the diffuser all have to fit.' },
  { id: 'psu5v3a', qty: 1, note: '121 LEDs at full white is 7 A, which you will never use. The sketch caps it at 2 A and a 3 A supply is comfortable.' },
  { id: 'cap1000', qty: 1 },
  { id: 'res220', qty: 1, note: 'In the data line, at the first LED.' },
  { id: 'ldr', qty: 1, note: 'For the automatic dimming.' },
  { id: 'res10k', qty: 1, note: 'The other half of the LDR divider.' },
  { id: 'button', qty: 2, note: 'Set the time and change the colour mode.' },
  { id: 'hookup', qty: 1, own: true, note: '22 AWG solid core for the row-to-row jumpers. You will make twenty of them.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'glasses' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',       at: [0, 0] },
    { id: 'grid', comp: 'ws2812grid', at: [0, -140], opt: { cols: 11, rows: 11, pitch: 16.6 } },
    { id: 'rtc',  comp: 'ds3231',     at: [-56, 46], ry: 180 },
    { id: 'ldr',  comp: 'ldr',        at: [30, -48] },
    { id: 'b1',   comp: 'button',     at: [48, 40] },
    { id: 'b2',   comp: 'button',     at: [66, 40] }
  ],
  wires: [
    { from: 'grid.5V',  to: 'nano.5V',   color: 'red',    note: '5 V to the grid, from the supply directly - not through the Nano' },
    { from: 'grid.GND', to: 'nano.GND',  color: 'black',  note: 'Ground. Inject at both ends of the grid as well' },
    { from: 'grid.DIN', to: 'nano.D6',   color: 'green',  note: 'Data in, through a 220 ohm resistor at the first LED' },
    { from: 'rtc.VCC',  to: 'nano.5V',   color: 'red',    note: 'Clock power' },
    { from: 'rtc.GND',  to: 'nano.GND2', color: 'black',  note: 'Clock ground' },
    { from: 'rtc.SDA',  to: 'nano.A4',   color: 'blue',   note: 'I2C data' },
    { from: 'rtc.SCL',  to: 'nano.A5',   color: 'yellow', note: 'I2C clock' },
    { from: 'ldr.A',    to: 'nano.5V',   color: 'red',    note: 'LDR to 5 V, top of a divider' },
    { from: 'ldr.B',    to: 'nano.A0',   color: 'white',  note: 'Divider junction, with a 10 k to ground' },
    { from: 'b1.1A',    to: 'nano.D2',   color: 'orange', note: 'Hour button' },
    { from: 'b1.2A',    to: 'nano.GND2', color: 'black',  note: 'To ground' },
    { from: 'b2.1A',    to: 'nano.D3',   color: 'purple', note: 'Minute button, and a long hold changes colour mode' },
    { from: 'b2.2A',    to: 'nano.GND2', color: 'black',  note: 'To ground' }
  ]
},

wireIntro: `<p>Electrically this is the simplest project in the second half of the book - twelve connections and
nothing unusual. The grid in the model is shown as a single component; in reality it is eleven strips of eleven
LEDs that you cut and join yourself, which is the next section.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Power the grid from the supply, not through the Nano</span>
<p>121 LEDs is up to 7&nbsp;A at full white. The sketch's power limiter keeps it near 2&nbsp;A in practice, but
that is still ten times what a Nano's traces are meant to carry.</p>
<p>Take 5&nbsp;V and ground from the supply to a distribution point, and feed the grid <em>and</em> the Nano's
5V pin from there. Inject power at both ends of the LED chain - a single feed at one corner leaves the far
corner noticeably dimmer and pinker.</p></div>

<div class="note tip"><span class="t">Data in at one specific corner</span>
<p>The strip has arrows. Data flows the way they point, so the DIN end of the first row is LED 0. Decide now
which physical corner that is and write it on the back of the frame - every letter position in the sketch
depends on it, and getting it wrong means a clock that spells nonsense.</p></div>

<div class="note"><span class="t">Put the LDR where it sees the room</span>
<p>Not where it can see the clock's own light, or you get a feedback loop: bright clock, bright reading, dimmer
clock, dark reading, bright clock. Mount it on the side or the back of the frame facing outwards.</p></div>`,

solderIntro: `<p>This build has roughly <strong>sixty soldered joints</strong>, and they are all the same joint
repeated. It is an excellent way to get genuinely good at soldering - by joint forty you will be quick and
tidy. Work through it in one sitting if you can, because your hands learn the rhythm.</p>`,

solderSteps: [
  { h: 'Cut eleven strips of eleven LEDs',
    body: `<p>Cut <strong>exactly on the printed line</strong> through the middle of the copper pads, so each
    side keeps a full half-pad. Cut anywhere else and you have a sliver to solder to, which is genuinely
    difficult.</p>
    <p>Count twice. A row of ten or twelve will not be obvious until the whole thing is assembled and the words
    are one letter out.</p>` },
  { h: 'Lay them out serpentine, before soldering anything',
    body: `<p>Row 1 with its arrows pointing right. Row 2 directly below with its arrows pointing
    <em>left</em>. Row 3 right again. And so on - the data has to snake continuously from the end of one row to
    the start of the next.</p>
    <p>Stick them down on the backboard with their own adhesive, on a 16.6&nbsp;mm grid, before you solder. A
    pencil grid drawn on the board first is five minutes well spent.</p>` },
  { h: 'The twenty jumpers, three wires each',
    body: `<p>At the end of each row, DOUT, 5&nbsp;V and GND jump to the start of the next. Cut sixty short
    lengths of 22&nbsp;AWG solid core - about 25&nbsp;mm, in red, black and green - and strip 3&nbsp;mm off
    each end.</p>
    <p>The technique: tin the pad (iron on for one second, touch solder, remove), tin the wire, then hold the
    wire on the pad and touch the iron for one second. They merge instantly. <strong>Do not hover</strong> -
    the strip's adhesive melts and the pad lifts.</p>
    <p>Iron at 350&nbsp;&deg;C, not 320. Hotter and faster is gentler on the strip than cooler and slower.</p>` },
  { h: 'Test after every three rows',
    body: `<p>Run the chase test sketch with <code>NUM_LEDS</code> set to however many you have joined so far.
    A single bad joint stops everything after it - and finding it among three rows takes a minute, while finding
    it among eleven takes an hour.</p>
    <p>This is the single most useful piece of advice on this page.</p>` },
  { h: 'Inject power at the far end',
    body: `<p>When all eleven rows are joined, run a second pair of thicker wires from the supply to the
    5&nbsp;V and GND pads at the <em>last</em> LED. Not the data line - only power.</p>` },
  { h: 'The 220 ohm and the capacitor',
    body: `<p>Resistor in the data line, soldered inline as close to LED 0 as you can, sleeved in heat-shrink.
    1000&nbsp;&micro;F across 5&nbsp;V and GND at the injection point, stripe to ground.</p>` },
  { h: 'Strain-relieve every wire leaving the grid',
    body: `<p>Hot glue over the incoming data and power joints. This assembly gets picked up, turned over and
    put in a frame several times, and a lifted pad on LED 0 means starting again.</p>` },
  { h: 'Buzz it out',
    body: `<p>5&nbsp;V to GND across the whole grid: <strong>no beep</strong>. Continuity from the supply to both
    ends of the chain: beep. Then power up at low brightness before you commit it to the frame.</p>` }
],

assembly: [
  { h: 'Build the light-tight dividers - this is the whole project',
    body: `<p>Without dividers between the letters, every lit LED glows into its four neighbours and the clock
    reads as a smudge. With them, each letter is crisp and the thing looks manufactured.</p>
    <p>Make a grid of 11&times;11 cells, 16.6&nbsp;mm square and about 20&nbsp;mm deep, from thin black card or
    3&nbsp;mm foamboard. Cut twenty strips, notch each one halfway through at 16.6&nbsp;mm intervals, and slot
    them together like an egg-box divider - ten notched one way, ten the other.</p>
    <p>Everything inside must be matt black. Any white edge is a light path.</p>` },
  { h: 'Diffuser in front of the LEDs',
    body: `<p>A sheet of white acrylic, drafting film, or even baking parchment, sitting between the LEDs and
    the letter face. Without it you see a bright dot in the middle of each letter; with it the whole letter
    glows evenly.</p>
    <p>It goes at the <em>front</em> of the divider cells, right behind the face.</p>` },
  { h: 'Stack it up',
    body: `<p>Back to front: backboard, LED grid, divider grid, diffuser, letter face, glass. Everything snug,
    with no gaps at the edges for light to escape sideways.</p>
    <p>Black tape round the whole perimeter once it is together.</p>` },
  { h: 'Set the clock',
    body: `<p>Upload the time-setter from the <a href="project.html?p=desk-clock">desk clock project</a> once,
    then flash the word clock sketch. Leaving the setter on the board resets the time at every power-up, which
    on a clock is a memorable bug.</p>` },
  { h: 'Check every word lights correctly',
    body: `<p>The sketch has a test mode that walks through all 288 five-minute times in sequence. Watch the
    whole cycle once. It takes two minutes and it is the only way to catch a word whose start position is one
    LED out - which will otherwise show up at some random time next Tuesday.</p>` },
  { h: 'Hang it',
    body: `<p>At eye height, and not opposite a window - the letters are easier to read when the face is not
    reflecting daylight.</p>` }
],

libraries: [
  { name: 'FastLED', by: 'Daniel Garcia / Mark Kriegsman', why: 'The grid, HSV colour and the power limiter.' },
  { name: 'RTClib', by: 'Adafruit', why: 'The DS3231.' },
  { name: 'EEPROM', by: 'Arduino', how: 'Built in', why: 'Remembers the colour mode.' }
],

code: [
{
  h: 'First: a chase, to find bad joints',
  name: 'grid_chase.ino',
  intro: `<p>Run this after every few rows. Set <code>NUM_LEDS</code> to how many you have joined so far.</p>`,
  code: `#include <FastLED.h>

#define LED_PIN    6
#define NUM_LEDS  121          // set to what you have soldered SO FAR

CRGB leds[NUM_LEDS];

void setup() {
  Serial.begin(9600);
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, 1500);
  FastLED.setBrightness(40);
}

void loop() {
  for (int i = 0; i < NUM_LEDS; i++) {
    fill_solid(leds, NUM_LEDS, CRGB::Black);
    leds[i] = CRGB::White;
    FastLED.show();
    Serial.println(i);         // the number it stops at is the bad joint
    delay(45);
  }
}`,
  after: `<p>The dot travels along the chain in wiring order, so you can also use it to confirm the serpentine
  is going the way you think. If the dot stops, the last number printed is the LED just before your bad joint -
  reflow that one.</p>`
},
{
  h: 'The word clock',
  name: 'word_clock.ino',
  code: `/* ------------------------------------------------------------------
   Word clock
   11x11 WS2812B grid on D6, DS3231 on I2C, LDR on A0,
   hour button on D2, minute button on D3.

   Grid layout assumed (row 0 at the TOP, LED 0 at the top-LEFT,
   serpentine so odd rows run right-to-left):

     row 0   I T L I S A S A M P M
     row 1   A C Q U A R T E R D C
     row 2   T W E N T Y F I V E X
     row 3   H A L F S T E N F T O
     row 4   P A S T E R U N I N E
     row 5   O N E S I X T H R E E
     row 6   F O U R F I V E T W O
     row 7   E I G H T E L E V E N
     row 8   S E V E N T W E L V E
     row 9   T E N S E O C L O C K
     row 10  . . . . . . . . . . .   (corner minute dots)
   ------------------------------------------------------------------ */

#include <FastLED.h>
#include <Wire.h>
#include <RTClib.h>
#include <EEPROM.h>

// ---- settings --------------------------------------------------------
#define LED_PIN       6
#define WIDTH        11
#define HEIGHT       11
#define NUM_LEDS    (WIDTH * HEIGHT)
#define LDR_PIN      A0
#define BTN_HOUR      2
#define BTN_MIN       3

#define MAX_MILLIAMPS 2000
#define SERPENTINE    true      // false if your rows all run the same way
#define TEST_MODE     false     // true = walk every five-minute time

const uint8_t DAY_BRIGHT   = 160;
const uint8_t NIGHT_BRIGHT = 18;
const int LDR_DARK   = 120;     // your reading in a dark room
const int LDR_BRIGHT = 700;     // your reading in daylight
// ----------------------------------------------------------------------

CRGB leds[NUM_LEDS];
RTC_DS3231 rtc;

uint8_t colourMode = 0;         // 0 warm white, 1 fixed hue, 2 drift, 3 per-word
uint8_t hue = 140;
int smoothedLight = 400;
unsigned long lastDraw = 0, pressStart = 0;
bool hWas = false, mWas = false;

/* --- the vocabulary ---------------------------------------------------
   Each word is { row, startColumn, length }. Reading these off your own
   face and correcting them is the one place you will spend time. */
struct Word { uint8_t row, col, len; };

const Word W_IT      = { 0, 0, 2 };
const Word W_IS      = { 0, 3, 2 };
const Word W_QUARTER = { 1, 2, 7 };
const Word W_TWENTY  = { 2, 0, 6 };
const Word W_FIVEM   = { 2, 6, 4 };    // FIVE in the minutes row
const Word W_HALF    = { 3, 0, 4 };
const Word W_TENM    = { 3, 5, 3 };    // TEN in the minutes row
const Word W_TO      = { 3, 9, 2 };
const Word W_PAST    = { 4, 0, 4 };
const Word W_OCLOCK  = { 9, 5, 6 };

/* The hours, index 1 to 12. */
const Word HOURS[13] = {
  { 0, 0, 0 },          // unused
  { 5, 0, 3 },          // ONE
  { 6, 8, 3 },          // TWO
  { 5, 6, 5 },          // THREE
  { 6, 0, 4 },          // FOUR
  { 6, 4, 4 },          // FIVE
  { 5, 3, 3 },          // SIX
  { 8, 0, 5 },          // SEVEN
  { 7, 0, 5 },          // EIGHT
  { 4, 6, 4 },          // NINE
  { 9, 0, 3 },          // TEN
  { 7, 5, 6 },          // ELEVEN
  { 8, 5, 6 }           // TWELVE
};

void setup() {
  Serial.begin(9600);
  pinMode(BTN_HOUR, INPUT_PULLUP);
  pinMode(BTN_MIN, INPUT_PULLUP);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_MILLIAMPS);
  FastLED.setBrightness(DAY_BRIGHT);
  FastLED.setCorrection(TypicalLEDStrip);

  if (EEPROM.read(60) == 0x5C) {
    colourMode = EEPROM.read(61) % 4;
    hue = EEPROM.read(62);
  }

  if (!rtc.begin()) {
    Serial.println(F("no DS3231"));
    fill_solid(leds, NUM_LEDS, CRGB::Red);
    FastLED.show();
    for (;;) { }
  }
  if (rtc.lostPower()) Serial.println(F("RTC lost power - set the time"));

  startupWipe();
}

void loop() {
  if (TEST_MODE) { walkAllTimes(); return; }

  handleButtons();
  updateBrightness();

  if (millis() - lastDraw > 1000) {
    lastDraw = millis();
    DateTime now = rtc.now();
    showTime(now.hour(), now.minute());
  }
  FastLED.show();
  delay(20);
}

/* --- turning a time into words ----------------------------------------
   Five-minute resolution. At 32 minutes past and beyond, the phrasing
   flips to "to" and the hour advances - which is the bit that catches
   everybody. */
void showTime(uint8_t h24, uint8_t m) {
  FastLED.clear();

  light(W_IT);
  light(W_IS);

  uint8_t slot = (m + 2) / 5;          // round to the nearest five minutes
  if (slot > 12) slot = 12;

  uint8_t hour12 = h24 % 12;
  if (hour12 == 0) hour12 = 12;

  bool toNextHour = (slot > 6);
  if (toNextHour) {
    hour12 = (h24 + 1) % 12;
    if (hour12 == 0) hour12 = 12;
  }

  switch (slot) {
    case 0:  break;                                        // o'clock
    case 1:  light(W_FIVEM);   light(W_PAST); break;
    case 2:  light(W_TENM);    light(W_PAST); break;
    case 3:  light(W_QUARTER); light(W_PAST); break;
    case 4:  light(W_TWENTY);  light(W_PAST); break;
    case 5:  light(W_TWENTY);  light(W_FIVEM); light(W_PAST); break;
    case 6:  light(W_HALF);    light(W_PAST); break;
    case 7:  light(W_TWENTY);  light(W_FIVEM); light(W_TO); break;
    case 8:  light(W_TWENTY);  light(W_TO); break;
    case 9:  light(W_QUARTER); light(W_TO); break;
    case 10: light(W_TENM);    light(W_TO); break;
    case 11: light(W_FIVEM);   light(W_TO); break;
    case 12: break;                                        // o'clock, next hour
  }

  light(HOURS[hour12]);
  if (slot == 0 || slot == 12) light(W_OCLOCK);

  // the one to four extra minutes, as corner dots on the bottom row
  uint8_t extra = m % 5;
  for (uint8_t i = 0; i < extra; i++) {
    leds[xyToIndex(i, HEIGHT - 1)] = wordColour(99);
  }
}

/* --- drawing ---------------------------------------------------------- */
void light(const Word& w) {
  static uint8_t wordIndex = 0;
  wordIndex++;
  for (uint8_t i = 0; i < w.len; i++) {
    leds[xyToIndex(w.col + i, w.row)] = wordColour(wordIndex);
  }
}

CRGB wordColour(uint8_t idx) {
  switch (colourMode) {
    case 0:  return CHSV(32, 120, 255);                  // warm white
    case 1:  return CHSV(hue, 230, 255);                 // fixed colour
    case 2:  return CHSV(hue + (millis() / 2000), 220, 255);  // slow drift
    default: return CHSV(hue + idx * 38, 230, 255);      // a hue per word
  }
}

/* Serpentine: every odd row runs right to left, because that is how the
   strip physically snakes. One function, and the rest of the sketch can
   think in plain x and y. */
uint16_t xyToIndex(uint8_t x, uint8_t y) {
  if (x >= WIDTH || y >= HEIGHT) return 0;
  if (SERPENTINE && (y & 1)) x = WIDTH - 1 - x;
  return y * WIDTH + x;
}

/* --- brightness ------------------------------------------------------- */
void updateBrightness() {
  int raw = analogRead(LDR_PIN);
  smoothedLight = (smoothedLight * 31 + raw) / 32;    // slow, so it never flickers
  int b = map(smoothedLight, LDR_DARK, LDR_BRIGHT, NIGHT_BRIGHT, DAY_BRIGHT);
  FastLED.setBrightness(constrain(b, NIGHT_BRIGHT, DAY_BRIGHT));
}

/* --- buttons ---------------------------------------------------------- */
void handleButtons() {
  bool h = digitalRead(BTN_HOUR) == LOW;
  bool m = digitalRead(BTN_MIN) == LOW;

  if (h && !hWas) {
    DateTime n = rtc.now();
    rtc.adjust(DateTime(n.year(), n.month(), n.day(), (n.hour() + 1) % 24, n.minute(), 0));
    Serial.println(F("hour +1"));
    delay(180);
  }

  if (m && !mWas) pressStart = millis();
  if (!m && mWas) {
    unsigned long held = millis() - pressStart;
    if (held > 800) {
      colourMode = (colourMode + 1) % 4;
      EEPROM.update(60, 0x5C);
      EEPROM.update(61, colourMode);
      Serial.print(F("colour mode "));
      Serial.println(colourMode);
    } else if (held > 30) {
      DateTime n = rtc.now();
      rtc.adjust(DateTime(n.year(), n.month(), n.day(), n.hour(), (n.minute() + 1) % 60, 0));
      Serial.println(F("minute +1"));
    }
  }

  hWas = h;
  mWas = m;
}

/* --- helpers ---------------------------------------------------------- */
void startupWipe() {
  for (uint8_t y = 0; y < HEIGHT; y++) {
    for (uint8_t x = 0; x < WIDTH; x++) leds[xyToIndex(x, y)] = CHSV(32, 100, 255);
    FastLED.show();
    delay(60);
  }
  delay(300);
  FastLED.clear();
  FastLED.show();
}

/* Walks all 288 five-minute times. Watch it once, all the way through,
   before you close the frame. */
void walkAllTimes() {
  for (uint8_t h = 0; h < 24; h++) {
    for (uint8_t m = 0; m < 60; m += 5) {
      showTime(h, m);
      FastLED.show();
      Serial.print(h); Serial.print(':');
      if (m < 10) Serial.print('0');
      Serial.println(m);
      delay(400);
    }
  }
}`,
  after: `<p>The <code>(m + 2) / 5</code> rounding is the neat bit. Plain <code>m / 5</code> would show
  "quarter past" from :15 all the way to :19, so the clock spends most of its life running up to four minutes
  slow. Adding 2 before dividing rounds to the <em>nearest</em> five minutes, so it is never more than two and a
  half minutes out - and the corner dots cover the rest.</p>`
}],

upload: `
<p>Nano, correct port. Set the time once with the setter sketch from the
<a href="project.html?p=desk-clock">desk clock</a>, then flash this one and use the two buttons to trim it.</p>
<p>Run once with <code>TEST_MODE = true</code> and watch all 288 times go past. Two minutes, and it is the only
reliable way to catch a word table entry that is one column out.</p>`,

tune: [
  { h: 'Correcting the word table',
    body: `<p>Faces vary, and the one you buy may not match the layout above exactly. Count the letters on your
    own face, row by row from the top, starting each row at column 0, and edit the <code>Word</code> entries.
    <code>{ row, startColumn, length }</code>.</p>
    <p>Work through it with <code>TEST_MODE</code> on and fix them as you spot them.</p>` },
  { h: 'If the words are mirrored on alternate rows',
    body: `<p>Your grid is not serpentine - some kits wire every row the same way with a long return jumper.
    Set <code>SERPENTINE</code> to <code>false</code>.</p>
    <p>If <em>all</em> the text is mirrored, your LED 0 is at the top right rather than the top left. Either
    rotate the panel or change <code>xyToIndex</code> to <code>x = WIDTH - 1 - x</code> unconditionally.</p>` },
  { h: 'Brightness',
    body: `<p>Print <code>analogRead(A0)</code> and note the values in a dark room and in daylight; those go in
    <code>LDR_DARK</code> and <code>LDR_BRIGHT</code>.</p>
    <p><code>NIGHT_BRIGHT</code> at 18 is readable in a dark room without lighting it up. Anything above about
    40 is too much at 3&nbsp;am, which you will discover at 3&nbsp;am.</p>` },
  { h: 'Colour',
    body: `<p>Warm white (mode 0) is what most people settle on - it reads best and looks least like a toy. A
    hue per word (mode 3) is genuinely useful because it makes the sentence structure obvious at a glance.</p>` },
  { h: 'Power',
    body: `<p><code>MAX_MILLIAMPS</code> at 2000 is right for a 3&nbsp;A supply. A word clock only ever lights
    fifteen or twenty LEDs at once, so it never comes close - the limiter is there for the startup wipe and for
    peace of mind.</p>` }
],

trouble: [
  { q: 'The chain stops partway along',
    a: `A bad joint at that LED, or a dead LED. The chase sketch tells you exactly which one - the last number
    it printed. Reflow that joint; if it still stops, cut out that LED and bridge the three pads across the
    gap.` },
  { q: 'Every other row is backwards',
    a: `<code>SERPENTINE</code> is set wrongly for your wiring.` },
  { q: 'The whole face is mirrored',
    a: `LED 0 is at the wrong corner. Rotate the panel 180 degrees, or invert x in <code>xyToIndex</code>.` },
  { q: 'One word lights one letter short or long',
    a: `That word's <code>len</code> or <code>col</code> in the table. Count on the physical face rather than
    trusting the layout printed above - faces differ.` },
  { q: 'Letters bleed into their neighbours',
    a: `The dividers are missing, too shallow, or not black. This is the one fault that no amount of code will
    fix, and it is the difference between a good word clock and a poor one. Make them at least 15&nbsp;mm deep
    and matt black.` },
  { q: 'Each letter shows a bright dot rather than glowing',
    a: `No diffuser, or it is too close to the LED. Move it forward, right behind the face.` },
  { q: 'The far corner is dimmer and pinker',
    a: `Voltage drop along the chain. Inject 5&nbsp;V and ground at the far end as well.` },
  { q: 'Time resets whenever the power goes off',
    a: `The DS3231's coin cell is dead, missing or in backwards - the wide flat face goes up. Or you left the
    time-setter sketch on the board.` },
  { q: 'Clock drifts by minutes',
    a: `You have a DS1307 with a DS3231 label. A real DS3231 has no separate silver crystal next to the chip;
    a DS1307 does.` },
  { q: 'Brightness hunts up and down',
    a: `The LDR can see the clock. Move it to the side or back of the frame.` }
],

next: `
<ul>
  <li><strong>Drop the RTC for an ESP32 and NTP</strong> and it sets itself, handles daylight saving, and never
  needs a button. The trade is that a Wi-Fi outage stops your clock.</li>
  <li><strong>Another language.</strong> German, Dutch, French and Swedish faces all exist and the sketch
  structure is identical - only the word table changes. Some languages need a 12&times;12 grid.</li>
  <li><strong>Add an alarm or a birthday mode</strong>: light particular words, or run a rainbow across the
  whole grid, on a date.</li>
  <li><strong>Reuse the grid.</strong> <code>xyToIndex()</code> turns the same hardware into a scrolling text
  display, a pixel-art frame or a Conway's Life board.</li>
</ul>`
});
