/* Simon: four LEDs, four buttons, a buzzer and a growing sequence. */
AB.addProject({
slug: 'simon-says',
title: 'Simon says',
cat: 'games',
level: 2,
time: '90 minutes',
solder: true,
feature: true,
board: 'Nano',
tags: ['game', 'leds', 'buttons', 'tone', 'eeprom', 'memory game'],
blurb: 'Four colours, four notes, a sequence that grows by one every round. Survives being dropped, and remembers the high score.',

skills: ['Arrays', 'Game loops', 'tone() melodies', 'Debouncing', 'EEPROM high scores'],

intro: `
<p>Simon has been the standard electronics teaching project since 1978, and it is still the best one, because
the whole game is four LEDs, four buttons and an array. There is no library, no module and no protocol - the
difficulty is entirely in the logic, which is exactly what makes it worth writing.</p>
<p>The version here adds the things the classic lacks: it speeds up as you get further, it plays a distinct
note per colour so you can play by ear, and it keeps the high score in EEPROM so it survives being unplugged.</p>`,

what: [
  'Play a growing sequence of colours and notes, one longer each round.',
  'Speed up gradually, so round 15 is genuinely hard even if your memory is fine.',
  'Play a sad descending tone on a wrong press, and show the round you reached.',
  'Keep the all-time high score through power cuts.',
  'Have a two-player mode where you take turns adding to the sequence.'
],

how: `
<p>The whole game is one array of bytes and two indices. <code>sequence[]</code> holds the colours; each round
appends a new random one and replays the lot. The player's presses are compared one at a time against the same
array, and the first mismatch ends the game.</p>
<p><strong>Playing by ear</strong> is the detail that makes it feel like the real thing. The original Simon
used four notes that form a pleasant chord - roughly E, C#, A and E an octave down. Each colour always plays
its own note, so after a few rounds you stop watching the lights and start remembering the tune, which is a
different and much more effective kind of memory.</p>
<p><strong>The speed-up</strong> matters too. A fixed tempo means the game is purely a memory test and tops out
wherever your memory does. Shortening the note as the sequence grows adds a perception element and keeps it
difficult for everyone.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'led5', qty: 4, note: 'Red, green, blue and yellow. The classic Simon colours.' },
  { id: 'res220', qty: 4 },
  { id: 'button', qty: 4, note: 'Bigger is better. 12 mm square tactile switches, or arcade buttons if you are making a nice one.' },
  { id: 'buzzer', qty: 1, note: 'Passive. An active buzzer plays one note and ruins the whole idea.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'box-abs', qty: 1 },
  { id: 'usb-cable', qty: 1, own: true },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',   at: [0, 0] },
    { id: 'l1',   comp: 'led5',   at: [-42, -48], opt: { c: '#e0483c' } },
    { id: 'l2',   comp: 'led5',   at: [-14, -48], opt: { c: '#3fbf6a' } },
    { id: 'l3',   comp: 'led5',   at: [14, -48],  opt: { c: '#4a8fd0' } },
    { id: 'l4',   comp: 'led5',   at: [42, -48],  opt: { c: '#e0c030' } },
    { id: 'b1',   comp: 'button', at: [-42, -76] },
    { id: 'b2',   comp: 'button', at: [-14, -76] },
    { id: 'b3',   comp: 'button', at: [14, -76] },
    { id: 'b4',   comp: 'button', at: [42, -76] },
    { id: 'buz',  comp: 'buzzer', at: [0, 44] }
  ],
  wires: [
    { from: 'l1.A', to: 'nano.D2', color: 'red',    note: 'Red LED anode via 220 ohm' },
    { from: 'l1.K', to: 'nano.GND', color: 'black', note: 'Red LED cathode' },
    { from: 'l2.A', to: 'nano.D3', color: 'green',  note: 'Green LED anode via 220 ohm' },
    { from: 'l2.K', to: 'nano.GND', color: 'black', note: 'Green LED cathode' },
    { from: 'l3.A', to: 'nano.D4', color: 'blue',   note: 'Blue LED anode via 220 ohm' },
    { from: 'l3.K', to: 'nano.GND', color: 'black', note: 'Blue LED cathode' },
    { from: 'l4.A', to: 'nano.D5', color: 'yellow', note: 'Yellow LED anode via 220 ohm' },
    { from: 'l4.K', to: 'nano.GND', color: 'black', note: 'Yellow LED cathode' },
    { from: 'b1.1A', to: 'nano.D6', color: 'red',    note: 'Red button, internal pull-up' },
    { from: 'b1.2A', to: 'nano.GND2', color: 'black', note: 'To ground' },
    { from: 'b2.1A', to: 'nano.D7', color: 'green',  note: 'Green button' },
    { from: 'b2.2A', to: 'nano.GND2', color: 'black', note: 'To ground' },
    { from: 'b3.1A', to: 'nano.D8', color: 'blue',   note: 'Blue button' },
    { from: 'b3.2A', to: 'nano.GND2', color: 'black', note: 'To ground' },
    { from: 'b4.1A', to: 'nano.D9', color: 'yellow', note: 'Yellow button' },
    { from: 'b4.2A', to: 'nano.GND2', color: 'black', note: 'To ground' },
    { from: 'buz.+', to: 'nano.D11', color: 'orange', note: 'Passive buzzer' },
    { from: 'buz.-', to: 'nano.GND2', color: 'black', note: 'Buzzer ground' }
  ]
},

wireNotes: `
<div class="note tip"><span class="t">Keep the pin order matching the colour order</span>
<p>LEDs on D2-D5, buttons on D6-D9, in the same colour order. Then the whole game becomes two arrays and a
loop, and colour 0 is red on both, always. Muddling the order is the single most annoying bug in this build,
because everything works and the wrong light comes on.</p></div>

<div class="note"><span class="t">Every LED needs its own resistor</span>
<p>Not one shared resistor on the ground rail. With a shared one, lighting two LEDs at once makes both dimmer -
and while this game only lights one at a time, the startup animation does not, and you would spend an hour
wondering why.</p></div>`,

solderSteps: [
  { h: 'Lay it out before you solder anything',
    body: `<p>Put the four LEDs and four buttons into the perfboard dry, in a square or a row, and look at it
    from the front. This is a thing people will hold, so the spacing matters more than the wiring does.</p>
    <p>Buttons need at least 15&nbsp;mm between centres for adult thumbs.</p>` },
  { h: 'LEDs with their resistors folded in',
    body: `<p>Long leg (anode) through one hole, short leg (cathode) through the next. Bend a 220&nbsp;&Omega;
    resistor leg through the hole beside the anode and solder both to that pad. The other resistor leg becomes
    the wire to the Arduino pin.</p>
    <p>Trim after soldering, wearing safety glasses - clipped legs fly.</p>` },
  { h: 'A ground bus down one edge',
    body: `<p>All four LED cathodes and all four button legs go to ground. Run one length of bare or tinned
    solid-core wire down the board and solder each to it, rather than eight separate wires to the Nano.</p>
    <p>This is what makes the underside readable instead of a nest.</p>` },
  { h: 'Buttons on diagonal legs',
    body: `<p>A tactile switch's four legs are two pairs already joined internally. Use diagonally opposite legs
    and you cannot accidentally pick a pair that is permanently closed.</p>
    <p>Press each one down flush before soldering the second leg - a button soldered at an angle will not press
    properly through a panel.</p>` },
  { h: 'Buzzer and the Nano socket',
    body: `<p>Buzzer polarity: marked or longer leg to D11. Two 15-pin female strips for the Nano, tacked at the
    corners and checked square before completing.</p>` },
  { h: 'Buzz it out and test',
    body: `<p>5&nbsp;V to GND: no beep. Each button leg to ground: open until pressed. Each LED anode pad to
    ground: should read a few hundred ohms through the resistor and the LED, not zero.</p>` },
  { h: 'Panel mounting, if you are making it nice',
    body: `<p>Drill 5&nbsp;mm holes for the LEDs and the button caps in the box lid, and mount the board on
    standoffs underneath so the parts poke through. Colour the holes with a marker or use coloured caps - the
    game is much better when the buttons are the colours they represent.</p>` }
],

assembly: [
  { h: 'Breadboard it first',
    body: `<p>Four LEDs, four resistors, four buttons and a buzzer is a busy breadboard but it fits on an 830.
    Get the game working before you commit it to solder.</p>` },
  { h: 'Check every colour maps correctly',
    body: `<p>Press each button and confirm the matching LED lights and the right note plays. If red's button
    lights green, swap two entries in the arrays rather than rewiring.</p>` },
  { h: 'Play it up to round 10',
    body: `<p>Which will take a few attempts. That is the point at which the timing and the note choice either
    feel right or do not.</p>` },
  { h: 'Then box it',
    body: `<p>Anything from a project box to a biscuit tin. A flat lid with four large buttons is the classic
    layout for a reason.</p>` }
],

libraries: [
  { name: 'EEPROM', by: 'Arduino', how: 'Built in', why: 'Stores the high score.' }
],

code: [{
  name: 'simon_says.ino',
  code: `/* ------------------------------------------------------------------
   Simon says
   LEDs on D2-D5, buttons on D6-D9, passive buzzer on D11.
   Colour order is the same in both arrays: red, green, blue, yellow.
   ------------------------------------------------------------------ */

#include <EEPROM.h>

// ---- pins, in colour order -------------------------------------------
const byte LED_PINS[4]    = { 2, 3, 4, 5 };
const byte BUTTON_PINS[4] = { 6, 7, 8, 9 };
const byte BUZZER = 11;

// The original Simon's four notes - they form a pleasant chord, which is
// why the game is playable by ear once you have heard the sequence twice.
const int NOTES[4] = { 330, 262, 220, 165 };   // E4, C4, A3, E3

// ---- behaviour -------------------------------------------------------
#define MAX_ROUNDS   64
#define START_TONE_MS 420
#define MIN_TONE_MS   160
#define INPUT_TIMEOUT 5000UL
#define EE_MAGIC_ADDR  10
#define EE_SCORE_ADDR  11
#define EE_MAGIC     0x51
// ----------------------------------------------------------------------

byte sequence[MAX_ROUNDS];
byte round_ = 0;
byte highScore = 0;

void setup() {
  Serial.begin(9600);
  for (byte i = 0; i < 4; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    pinMode(BUTTON_PINS[i], INPUT_PULLUP);
  }
  pinMode(BUZZER, OUTPUT);

  if (EEPROM.read(EE_MAGIC_ADDR) == EE_MAGIC) {
    highScore = EEPROM.read(EE_SCORE_ADDR);
  } else {
    EEPROM.update(EE_MAGIC_ADDR, EE_MAGIC);
    EEPROM.update(EE_SCORE_ADDR, 0);
  }

  Serial.print(F("high score: "));
  Serial.println(highScore);

  startupAnimation();
}

void loop() {
  waitForAnyButton();
  playGame();
}

/* --- one whole game --------------------------------------------------- */
void playGame() {
  // Seed from the time the player took to press. Two players never
  // press at exactly the same microsecond, so this is genuinely random.
  randomSeed(micros());

  round_ = 0;
  delay(500);

  while (round_ < MAX_ROUNDS) {
    sequence[round_] = random(4);
    round_++;

    showSequence();

    if (!readSequence()) {
      gameOver();
      return;
    }

    // a small pause and a rising chirp between rounds
    delay(300);
    tone(BUZZER, 880, 60);
    delay(400);
  }
  win();
}

void showSequence() {
  int toneMs = toneLength();
  for (byte i = 0; i < round_; i++) {
    flash(sequence[i], toneMs);
    delay(toneMs / 3);
  }
}

/* Returns false the moment the player gets one wrong or times out. */
bool readSequence() {
  for (byte i = 0; i < round_; i++) {
    int pressed = waitForButton(INPUT_TIMEOUT);
    if (pressed < 0) return false;             // ran out of time
    flash(pressed, 160);
    if (pressed != sequence[i]) return false;  // wrong colour
  }
  return true;
}

/* Sequence gets faster as it gets longer. */
int toneLength() {
  int t = START_TONE_MS - (round_ * 12);
  return max(MIN_TONE_MS, t);
}

/* --- input ------------------------------------------------------------ */
int waitForButton(unsigned long timeoutMs) {
  unsigned long start = millis();
  while (millis() - start < timeoutMs) {
    for (byte i = 0; i < 4; i++) {
      if (digitalRead(BUTTON_PINS[i]) == LOW) {
        delay(25);                             // debounce
        if (digitalRead(BUTTON_PINS[i]) != LOW) continue;
        while (digitalRead(BUTTON_PINS[i]) == LOW) { }   // wait for release
        delay(25);
        return i;
      }
    }
  }
  return -1;
}

void waitForAnyButton() {
  // idle: sweep the LEDs so it is obvious the thing is alive
  byte i = 0;
  while (waitForButtonQuick() < 0) {
    digitalWrite(LED_PINS[i], HIGH);
    delay(90);
    digitalWrite(LED_PINS[i], LOW);
    i = (i + 1) % 4;
  }
}

int waitForButtonQuick() {
  for (byte i = 0; i < 4; i++) {
    if (digitalRead(BUTTON_PINS[i]) == LOW) {
      delay(25);
      if (digitalRead(BUTTON_PINS[i]) != LOW) continue;
      while (digitalRead(BUTTON_PINS[i]) == LOW) { }
      return i;
    }
  }
  return -1;
}

/* --- output ----------------------------------------------------------- */
void flash(byte colour, int ms) {
  digitalWrite(LED_PINS[colour], HIGH);
  tone(BUZZER, NOTES[colour], ms);
  delay(ms);
  digitalWrite(LED_PINS[colour], LOW);
  noTone(BUZZER);
}

void gameOver() {
  byte reached = round_ - 1;

  Serial.print(F("game over at round "));
  Serial.println(reached);

  // all four on, and a descending raspberry
  for (byte i = 0; i < 4; i++) digitalWrite(LED_PINS[i], HIGH);
  for (int f = 400; f > 110; f -= 12) { tone(BUZZER, f, 22); delay(18); }
  noTone(BUZZER);
  delay(400);
  for (byte i = 0; i < 4; i++) digitalWrite(LED_PINS[i], LOW);

  if (reached > highScore) {
    highScore = reached;
    EEPROM.update(EE_SCORE_ADDR, highScore);
    Serial.println(F("NEW HIGH SCORE"));
    celebrate();
  }

  blinkCount(reached);
  delay(600);
}

void win() {
  for (int i = 0; i < 8; i++) {
    for (byte c = 0; c < 4; c++) flash(c, 90);
  }
}

void celebrate() {
  const int fanfare[] = { 523, 659, 784, 1047 };
  for (byte i = 0; i < 4; i++) {
    digitalWrite(LED_PINS[i], HIGH);
    tone(BUZZER, fanfare[i], 160);
    delay(180);
  }
  delay(300);
  for (byte i = 0; i < 4; i++) digitalWrite(LED_PINS[i], LOW);
  noTone(BUZZER);
}

/* Blink the score out on the red LED, in tens then units. */
void blinkCount(byte n) {
  delay(500);
  for (byte t = 0; t < n / 10; t++) {
    digitalWrite(LED_PINS[3], HIGH); delay(320);
    digitalWrite(LED_PINS[3], LOW);  delay(220);
  }
  delay(300);
  for (byte u = 0; u < n % 10; u++) {
    digitalWrite(LED_PINS[0], HIGH); delay(150);
    digitalWrite(LED_PINS[0], LOW);  delay(180);
  }
}

void startupAnimation() {
  for (int pass = 0; pass < 2; pass++) {
    for (byte i = 0; i < 4; i++) flash(i, 110);
  }
  blinkCount(highScore);
}`,
  after: `<p><code>randomSeed(micros())</code> called at the moment the player presses start is worth
  understanding. Seeding in <code>setup()</code> from a fixed value gives the same game every time you power
  up - genuinely disappointing when you notice. Seeding from how long a human took to do something is
  unpredictable in exactly the way you need.</p>`
}],

upload: `<p>Nano, correct port. The LEDs sweep while it waits for you; press any button to start. Watch the
Serial Monitor at 9600 to see the round you reached printed.</p>`,

tune: [
  { h: 'Difficulty',
    body: `<p><code>START_TONE_MS</code> sets the opening tempo and the <code>round_ * 12</code> term sets how
    fast it speeds up. For children, use 500 and <code>* 6</code>. For an unwinnable version, 300 and
    <code>* 20</code>.</p>` },
  { h: 'The timeout',
    body: `<p>Five seconds per press is generous. Three makes it much harder in a way that feels fair; one is
    cruel. Note that the timeout runs per press, not per sequence.</p>` },
  { h: 'Different notes',
    body: `<p>The four in the sketch are the original's. Any four notes from one chord work; four notes from a
    scale sound worse, because consecutive repeats clash. Try 392, 330, 262, 196 for a lower, warmer set.</p>` },
  { h: 'Two-player mode',
    body: `<p>Instead of <code>random(4)</code>, let the current player choose the next colour by pressing it,
    then hand over. Twenty lines, and it becomes a completely different and much more social game.</p>` },
  { h: 'Resetting the high score',
    body: `<p>Hold all four buttons at power-up and write 0 to EEPROM. Five lines in <code>setup()</code>, and
    it saves you re-flashing when someone posts an unbeatable 31.</p>` }
],

trouble: [
  { q: 'Wrong LED lights for a button',
    a: `The two arrays are out of order. Fix it in the arrays, not the wiring - that is the whole reason the
    pin numbers live in arrays.` },
  { q: 'An LED never lights',
    a: `Backwards. Long leg towards the resistor and the pin. It is not damaged.` },
  { q: 'Buzzer clicks instead of playing notes',
    a: `Active buzzer instead of passive. Active ones ignore <code>tone()</code> entirely.` },
  { q: 'A button registers several presses',
    a: `The <code>while</code> loop waiting for release should prevent that. If it persists, raise the
    debounce delay from 25 to 50&nbsp;ms.` },
  { q: 'A button seems permanently pressed',
    a: `You are on an internally-joined pair of legs. Use diagonally opposite ones.` },
  { q: 'The same sequence every game',
    a: `<code>randomSeed()</code> is being called with a constant, or not at all. It must be seeded from
    something unpredictable - <code>micros()</code> at a human key press is ideal.` },
  { q: 'High score is 255 on a new board',
    a: `Fresh EEPROM reads 0xFF. The magic-byte check in <code>setup()</code> handles it - make sure both the
    read and the initialising write are present.` },
  { q: 'Notes sound wrong or the timing stutters',
    a: `<code>tone()</code> uses Timer2 on a Nano, which also affects some PWM pins. Not an issue here, but
    worth knowing before you add <code>analogWrite()</code> on pins 3 or 11.` }
],

next: `
<ul>
  <li><strong>Add a screen</strong> so the round is a number rather than a blinking count. A TM1637 is four
  wires - see the <a href="project.html?p=reaction-timer">reaction timer</a>.</li>
  <li><strong>Make it two-player</strong>, taking turns extending the sequence. The best version of this game.</li>
  <li><strong>Use WS2812s instead</strong> of discrete LEDs and you get one data pin plus the ability to fade
  and pulse rather than just blink.</li>
  <li><strong>Build it big.</strong> Four arcade buttons with LEDs in them, in a wooden box, is a genuinely
  lovely object and costs about $25 more.</li>
</ul>`
});
