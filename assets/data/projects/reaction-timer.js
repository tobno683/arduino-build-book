/* Two-player reaction timer: LEDs, buttons, TM1637 and a buzzer. */
AB.addProject({
slug: 'reaction-timer',
title: 'Two-player reaction timer',
cat: 'games',
level: 1,
time: '1 hour',
solder: false,
board: 'Uno',
tags: ['game', 'buttons', 'tm1637', 'millis', 'debounce', 'no soldering', 'first project'],
blurb: 'A random wait, then a light. Whoever hits their button first wins, and it shows the time in milliseconds. Brutally addictive.',

skills: ['millis() precision', 'Debouncing', 'Random numbers', 'Game state machines', 'Reading two inputs at once'],

intro: `
<p>A perfect second project. No soldering, six parts, and a result that makes people queue up to have a go.
Human reaction time to a light is around 250&nbsp;milliseconds and almost nobody believes that until they see
their own number.</p>
<p>Behind the fun it teaches the thing every later project needs: how to watch several inputs at once and
measure time accurately, without ever calling <code>delay()</code> while something matters.</p>`,

what: [
  'Wait a random 2 to 6 seconds, then light the go LED.',
  'Measure to the millisecond which player pressed first, and by how much.',
  'Catch a false start - press before the light and you lose the round immediately.',
  'Keep score across rounds and show it between games.',
  'Show everything on a four-digit display, with a different beep for win, lose and false start.'
],

how: `
<p><strong>millis()</strong> returns milliseconds since the board powered up. Store it when the light comes on,
subtract it when a button is pressed, and you have the reaction time. Accuracy is about one millisecond, which
is far better than any human, so the number you see really is yours.</p>
<p>The reason the sketch never uses <code>delay()</code> during a round is exactly this: while the board is in
a delay it cannot see a button, and a false start pressed during a delay would be missed entirely. Instead the
loop runs thousands of times a second checking the clock and both buttons.</p>
<p><strong>The random wait matters more than it looks.</strong> If it were a fixed three seconds, people would
learn the rhythm and anticipate. Randomising between 2 and 6 seconds means the only strategy is to actually
react.</p>
<p><code>random()</code> on an Arduino is deterministic - the same sequence every power-up - unless you seed it
from something unpredictable. Reading an unconnected analog pin picks up electrical noise and does the job.</p>`,

bom: [
  { id: 'uno', qty: 1 },
  { id: 'bb-830', qty: 1 },
  { id: 'tm1637', qty: 1, note: 'Four-digit display. A 16x2 LCD works too - swap the display calls.' },
  { id: 'button', qty: 2, note: 'Big ones are more fun. The 12 mm square buttons are worth the extra 20 cents here.' },
  { id: 'led5', qty: 3, note: 'One red (get ready), one green (GO), one yellow (false start).' },
  { id: 'res220', qty: 3 },
  { id: 'buzzer', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [],

build: {
  parts: [
    { id: 'uno',  comp: 'uno',    at: [0, 86] },
    { id: 'bb',   comp: 'bb830',  at: [0, 0] },
    { id: 'disp', comp: 'tm1637', at: [0, -58], ry: 180 },
    { id: 'b1',   comp: 'button', at: [-62, -52] },
    { id: 'b2',   comp: 'button', at: [62, -52] },
    { id: 'buz',  comp: 'buzzer', at: [40, -56] }
  ],
  wires: [
    { from: 'uno.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V onto the lower red rail' },
    { from: 'uno.GND1', to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+10',  to: 'bb.T+10', color: 'red',    note: 'Bridge the two red rails' },
    { from: 'bb.B-10',  to: 'bb.T-10', color: 'black',  note: 'Bridge the two blue rails' },
    { from: 'disp.VCC', to: 'bb.T+4',  color: 'red',    note: 'Display power' },
    { from: 'disp.GND', to: 'bb.T-4',  color: 'black',  note: 'Display ground' },
    { from: 'disp.CLK', to: 'uno.D2',  color: 'green',  note: 'TM1637 clock' },
    { from: 'disp.DIO', to: 'uno.D3',  color: 'blue',   note: 'TM1637 data' },
    { from: 'b1.1A',    to: 'uno.D4',  color: 'yellow', note: 'Player 1 button' },
    { from: 'b1.2A',    to: 'bb.T-16', color: 'black',  note: 'Player 1 button to ground' },
    { from: 'b2.1A',    to: 'uno.D5',  color: 'orange', note: 'Player 2 button' },
    { from: 'b2.2A',    to: 'bb.T-20', color: 'black',  note: 'Player 2 button to ground' },
    { from: 'uno.D6',   to: 'bb.d20',  color: 'red',    note: 'Red "get ready" LED, through 220 ohm' },
    { from: 'uno.D7',   to: 'bb.d26',  color: 'green',  note: 'Green "GO" LED, through 220 ohm' },
    { from: 'uno.D8',   to: 'bb.d32',  color: 'yellow', note: 'Yellow "false start" LED, through 220 ohm' },
    { from: 'bb.a20',   to: 'bb.B-24', color: 'black',  note: 'All three LED cathodes to the ground rail' },
    { from: 'buz.+',    to: 'uno.D9',  color: 'purple', note: 'Buzzer' },
    { from: 'buz.-',    to: 'bb.B-30', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireIntro: `<p>No soldering at all. Everything plugs into the breadboard, and the three LEDs each need a
220&nbsp;&Omega; resistor in series with their long leg.</p>`,

wireNotes: `
<div class="note tip"><span class="t">How to seat an LED and its resistor on a breadboard</span>
<p>Put the LED's long leg (anode) in one row and its short leg (cathode) in the row next to it. Bridge the
anode's row to a free row with the 220&nbsp;&Omega; resistor, and run the jumper from the Arduino pin to that
free row. The cathode row gets a jumper to the blue ground rail.</p>
<p>Rows of five holes are connected across the board, so anything in the same row is the same electrical
point.</p></div>

<div class="note"><span class="t">Buttons need no resistors here</span>
<p><code>INPUT_PULLUP</code> switches on a resistor inside the chip. So one leg of each button goes to its
Arduino pin and the other straight to ground, and pressing reads <code>LOW</code>.</p>
<p>A tactile button's four legs are two pairs already joined. Use legs that are diagonally opposite and you
cannot get it wrong.</p></div>

<div class="note warn"><span class="t">Passive buzzer, not active</span>
<p><code>tone()</code> only works on a passive buzzer. An active one contains its own oscillator, plays one
fixed note, and ignores the frequency entirely.</p></div>`,

assembly: [
  { h: 'Rails first, always',
    body: `<p>5&nbsp;V and ground onto the bottom rails, then the two bridge wires to the top rails. Plug in
    USB, confirm the Uno's power LED lights, unplug. Four wires, thirty seconds, and it means every later fault
    is not a power fault.</p>` },
  { h: 'The display',
    body: `<p>Four wires. It should light up as soon as the sketch runs, even before you press anything.</p>` },
  { h: 'The three LEDs',
    body: `<p>Spread them out - red, green, yellow, left to right - each with its resistor. Get the leg
    orientation right: long leg towards the resistor and the Arduino pin, short leg to ground.</p>
    <p>An LED in backwards simply does not light. It is not damaged, and this is by far the most common reason
    a beginner LED "does not work".</p>` },
  { h: 'Two buttons, far apart',
    body: `<p>Put them at opposite ends of the breadboard so two people can actually play. If you have long
    jumper leads, run them off the board entirely and tape a button to each side of a table.</p>` },
  { h: 'Buzzer, then play',
    body: `<p>Upload and go. Best of five is the usual format, and the first surprise is how much worse
    everybody gets when they try harder.</p>` }
],

libraries: [
  { name: 'TM1637Display', by: 'Avishay Orpaz', why: 'The four-digit display. Search "TM1637" in the Library Manager.' }
],

code: [{
  name: 'reaction_timer.ino',
  code: `/* ------------------------------------------------------------------
   Two-player reaction timer
   TM1637 on D2/D3, buttons on D4/D5, LEDs on D6/D7/D8, buzzer on D9.
   ------------------------------------------------------------------ */

#include <TM1637Display.h>

// ---- pins ------------------------------------------------------------
#define CLK_PIN   2
#define DIO_PIN   3
#define BTN_1     4
#define BTN_2     5
#define LED_READY 6     // red
#define LED_GO    7     // green
#define LED_FOUL  8     // yellow
#define BUZZER    9

// ---- behaviour -------------------------------------------------------
const unsigned long WAIT_MIN = 2000;
const unsigned long WAIT_MAX = 6000;
const unsigned long SHOW_MS  = 3000;
const int WIN_SCORE = 5;
// ----------------------------------------------------------------------

TM1637Display display(CLK_PIN, DIO_PIN);

enum State { IDLE, ARMED, WAITING, GO, RESULT };
State state = IDLE;

unsigned long stateEntered = 0;
unsigned long waitFor = 0;
unsigned long goAt = 0;
int score1 = 0, score2 = 0;

const uint8_t SEG_BLANK[] = { 0, 0, 0, 0 };
const uint8_t SEG_PLAY[]  = { 0x73, 0x38, 0x77, 0x6E };   // PLAY
const uint8_t SEG_FOUL[]  = { 0x71, 0x3F, 0x3E, 0x38 };   // FOUL

void setup() {
  Serial.begin(9600);
  pinMode(BTN_1, INPUT_PULLUP);
  pinMode(BTN_2, INPUT_PULLUP);
  pinMode(LED_READY, OUTPUT);
  pinMode(LED_GO, OUTPUT);
  pinMode(LED_FOUL, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  display.setBrightness(5);
  display.setSegments(SEG_PLAY);

  // Without this, random() gives the same sequence after every reset.
  randomSeed(analogRead(A0) + analogRead(A3) * 31);

  enter(IDLE);
}

void loop() {
  bool p1 = digitalRead(BTN_1) == LOW;
  bool p2 = digitalRead(BTN_2) == LOW;

  switch (state) {

    case IDLE:
      // either button starts a round
      if (p1 || p2) {
        while (digitalRead(BTN_1) == LOW || digitalRead(BTN_2) == LOW) { }
        delay(30);
        enter(ARMED);
      }
      break;

    case ARMED:
      // short pause so the starter can let go of the button
      if (millis() - stateEntered > 700) {
        waitFor = random(WAIT_MIN, WAIT_MAX);
        digitalWrite(LED_READY, HIGH);
        enter(WAITING);
      }
      break;

    case WAITING:
      // a press now is a false start
      if (p1 || p2) {
        foul(p1 ? 1 : 2);
        break;
      }
      if (millis() - stateEntered >= waitFor) {
        digitalWrite(LED_READY, LOW);
        digitalWrite(LED_GO, HIGH);
        tone(BUZZER, 1800, 60);
        goAt = millis();
        enter(GO);
      }
      break;

    case GO: {
      if (!p1 && !p2) break;
      unsigned long reaction = millis() - goAt;
      int winner = p1 ? 1 : 2;

      digitalWrite(LED_GO, LOW);
      display.showNumberDec(reaction, false);

      if (winner == 1) score1++; else score2++;

      Serial.print(F("player "));
      Serial.print(winner);
      Serial.print(F("  "));
      Serial.print(reaction);
      Serial.println(F(" ms"));

      // a high note for player 1, a low one for player 2
      tone(BUZZER, winner == 1 ? 2400 : 1200, 220);
      enter(RESULT);
      break;
    }

    case RESULT:
      if (millis() - stateEntered > SHOW_MS) {
        if (score1 >= WIN_SCORE || score2 >= WIN_SCORE) {
          celebrate(score1 > score2 ? 1 : 2);
          score1 = score2 = 0;
        } else {
          showScore();
        }
        display.setSegments(SEG_PLAY);
        enter(IDLE);
      }
      break;
  }
}

/* ---------------------------------------------------------------------- */
void enter(State s) {
  state = s;
  stateEntered = millis();
}

void foul(int who) {
  digitalWrite(LED_READY, LOW);
  digitalWrite(LED_FOUL, HIGH);
  display.setSegments(SEG_FOUL);

  tone(BUZZER, 300, 500);
  Serial.print(F("false start by player "));
  Serial.println(who);

  // the other player takes the point
  if (who == 1) score2++; else score1++;

  delay(1400);
  digitalWrite(LED_FOUL, LOW);
  showScore();
  display.setSegments(SEG_PLAY);
  enter(IDLE);
}

void showScore() {
  // score as "1  3" - player 1 on the left, player 2 on the right
  uint8_t seg[4];
  seg[0] = display.encodeDigit(score1 % 10);
  seg[1] = 0;
  seg[2] = 0;
  seg[3] = display.encodeDigit(score2 % 10);
  display.setSegments(seg);
  delay(2000);
}

void celebrate(int who) {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_GO, HIGH);
    tone(BUZZER, who == 1 ? 2000 + i * 300 : 900 + i * 200, 140);
    delay(180);
    digitalWrite(LED_GO, LOW);
    delay(120);
  }
  showScore();
}`,
  after: `<p>The <code>enum State</code> plus a <code>switch</code> is a <strong>state machine</strong>, and it
  is the pattern that makes this readable. Each pass through <code>loop()</code> asks "what am I doing, and has
  anything changed?" rather than trying to hold the whole sequence in nested delays. Every project that has more
  than one thing going on ends up looking like this.</p>`
}],

upload: `<p>Uno, correct port, upload. The display should show <code>PLAY</code>. Press either button to start
a round.</p>
<p>Watch the Serial Monitor at 9600 while you play - it prints every reaction time, which is more satisfying
than it has any right to be.</p>`,

tune: [
  { h: 'Make it harder',
    body: `<p>Widen the wait: <code>WAIT_MIN 1500</code>, <code>WAIT_MAX 12000</code>. Twelve seconds of waiting
    is genuinely difficult - the temptation to twitch becomes overwhelming, which is the point.</p>` },
  { h: 'Add a feint',
    body: `<p>Blink the red LED once at a random moment during the wait. Pressing on the feint counts as a false
    start. It is a two-line change and it transforms the game.</p>` },
  { h: 'Single player mode',
    body: `<p>Ignore the second button and track a best-of-ten average instead of a score. Print the average to
    the display between rounds. Most adults land between 220 and 280&nbsp;ms; under 200 is genuinely fast.</p>` },
  { h: 'Sound instead of light',
    body: `<p>Drop the GO LED and use only the buzzer. Auditory reaction time is about 40&nbsp;ms faster than
    visual, which people find hard to believe until they measure it themselves.</p>` },
  { h: 'Check your own timing accuracy',
    body: `<p>Short the button pin to ground with a wire at the exact moment the LED lights and you will read
    single-digit milliseconds. That is the floor of the measurement, and it confirms the numbers are real.</p>` }
],

trouble: [
  { q: 'Display stays blank',
    a: `CLK and DIO swapped, or the module is not getting 5&nbsp;V. The library reports no errors, so a blank
    display is your only symptom.` },
  { q: 'Digits appear backwards',
    a: `Some TM1637 modules number digits right to left. Reverse the array you pass to
    <code>setSegments</code>, or use the library's flip option.` },
  { q: 'A round starts by itself immediately',
    a: `A button pin is floating - check <code>INPUT_PULLUP</code> is set and that the button's other leg really
    reaches ground. Measure: the pin should read 5&nbsp;V unpressed.` },
  { q: 'One button registers as the other',
    a: `You are on the wrong pair of legs on the tactile switch. The four legs are two pairs joined internally;
    use diagonally opposite ones.` },
  { q: 'Every round is a false start',
    a: `A button is stuck down, or its two used legs are an internally-joined pair, so it reads as permanently
    pressed. Measure continuity across the two legs you are using with the button released - it should be open.` },
  { q: 'LEDs do not light',
    a: `Backwards. The long leg goes towards the resistor and the Arduino pin. Flip it.` },
  { q: 'Buzzer clicks instead of beeping',
    a: `Active buzzer instead of passive. Active ones ignore <code>tone()</code>.` },
  { q: 'The same random waits every time you reset',
    a: `<code>randomSeed()</code> is reading a pin that is actually connected to something. Use a genuinely
    floating analog pin.` }
],

next: `
<ul>
  <li><strong>Four players</strong>: four buttons, four LEDs, one array and a loop. The code barely grows.</li>
  <li><strong>Simon Says</strong> uses exactly this hardware plus one more LED - see the
  <a href="project.html?p=simon-says">next project</a>.</li>
  <li><strong>Log the results</strong> to an SD card and chart whether you get faster over a week, or slower
  after a late night. You will get slower after a late night.</li>
  <li><strong>Build it into a box</strong> with two arcade buttons on top. That is the version people actually
  queue for.</li>
</ul>`
});
