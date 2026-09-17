/* Electronic dice: seven LEDs in the real pip pattern, one button. */
AB.addProject({
slug: 'electronic-dice',
title: 'Electronic dice',
cat: 'games',
level: 1,
time: '45 minutes',
solder: false,
board: 'Uno',
tags: ['leds', 'button', 'arrays', 'random', 'no soldering', 'first project', 'board games'],
blurb: 'Seven LEDs laid out like a real die face, a tumble animation, and a statistics mode that shows whether your random numbers are actually fair.',

/* --- Swedish -----------------------------------------------------------
   Anything present here replaces the English above when the reader is in
   Swedish; anything missing falls back to English. Code, part ids and
   pin names are deliberately NOT translated - they are the same in both
   languages and translating them would break the sketch.
   --------------------------------------------------------------------- */
sv: {
title: 'Elektronisk tärning',
blurb: 'Sju lysdioder utlagda som en riktig tärning, en rullande animation, och ett statistikläge som visar om dina slumptal faktiskt är rättvisa.',
time: '45 minuter',

skills: ['Vektorer och bitmönster', 'Slumptal och fröning', 'Avstudsning', 'Animationstiming', 'EEPROM-räknare'],

intro: `
<p>Sju lysdioder i tärningens mönster, en knapp och en Arduino. Det låter enkelt, och det är det - men det är
ett av de bästa andra projekten som finns, eftersom det innehåller fyra saker varje senare projekt behöver:
bitmönster i vektorer, avstudsning av en knapp, timing utan <code>delay()</code>, och slumptal som faktiskt är
slumpmässiga.</p>
<p>Statistikläget är det som gör det intressant. Det räknar varje slag i EEPROM och blinkar tillbaka
fördelningen. Efter några hundra slag ser du om din tärning är rättvis - och första gången du kör den utan
ordentlig fröning ser du att den inte är det.</p>`,

what: [
  'Slå en tärning med ett tryck: en kort rullande animation, sedan ett ansikte som står still.',
  'Slå två tärningar med ett långt tryck, visade efter varandra med summan på prickarna.',
  'Räkna varje slag i EEPROM och blinka tillbaka fördelningen på begäran.',
  'Fröa sig själv från din egen reaktionstid, så att det inte blir samma sekvens vid varje start.',
  'Drivas från en USB-laddare eller ett batteri och stå på bordet under ett brädspel.'
],

trouble: [
  { q: 'En prick tänds aldrig',
    a: `Lysdioden sitter bakvänd, eller så är motståndet inte anslutet. Det långa benet går mot motståndet och
    Arduino-stiftet. En bakvänd lysdiod tar ingen skada - den lyser bara inte.` },
  { q: 'Fel prickar tänds för varje siffra',
    a: `Bitmönstren i vektorn stämmer inte med hur du kopplade lysdioderna. Enklast är att ändra vektorn
    snarare än att koppla om - skriv ut vilket stift som styr vilken prick och rätta mönstren mot det.` },
  { q: 'Alla prickar lyser svagt, och svagare när fler är tända',
    a: `Du driver dem genom ett gemensamt motstånd. Varje lysdiod behöver sitt eget, annars delar de på
    strömmen och ljusstyrkan beror på hur många som lyser.` },
  { q: 'Samma slagsekvens efter varje omstart',
    a: `<code>random()</code> på en Arduino är förutsägbar om den inte fröas från något oförutsägbart. Att läsa
    ett oanslutet analogt stift fungerar, men bäst är att fröa från hur länge du höll knappen - det är
    verkligen slumpmässigt.` },
  { q: 'Knappen ger två slag per tryck',
    a: `Kontaktstuds. En mekanisk knapp studsar i någon millisekund och koden ser flera tryck. Ignorera nya
    tryck inom 25 ms.` },
  { q: 'Långt tryck registreras aldrig',
    a: `Tröskeln är för lång, eller så nollställs tidtagningen av studsfiltret. Skriv ut hur länge knappen
    faktiskt hölls nere och justera därefter.` },
  { q: 'Statistiken visar 65535 på ett nytt kort',
    a: `Oskrivet EEPROM är 0xFF överallt, vilket blir 65535 som heltal. Nollställ räknarna första gången, och
    skriv ett litet magiskt tal bredvid dem så att koden vet att de har initierats.` },
  { q: 'Summern klickar i stället för att ticka',
    a: `Aktiv summer i stället för passiv. En aktiv har en egen oscillator, spelar en fast ton och struntar i
    frekvensen du skickar.` }
],

next: `
<ul>
  <li><strong>Slå tusen gånger och titta på fördelningen.</strong> Det är den verkliga behållningen - du får se
  med egna ögon om din fröning duger.</li>
  <li><strong>Fler tärningar</strong>, eller en tjugosidig. Mönstervektorn växer, resten av koden gör det
  knappt.</li>
  <li><strong>Bygg in det i en låda</strong> med en stor knapp ovanpå. Det är versionen som faktiskt ligger
  framme på spelbordet.</li>
</ul>`
},

skills: ['Arrays and bit patterns', 'Randomness and seeding', 'Debouncing', 'Animation timing', 'EEPROM counters'],

intro: `
<p>Seven LEDs arranged like the pips on a die can show all six faces, because the pattern is beautifully
regular: the centre pip is on for odd numbers, the corners come in pairs, and the middle two only appear at
six. Encoding that is six lines of table, and it is the clearest possible introduction to why arrays exist.</p>
<p>The version here adds two things the usual one lacks: a tumble animation so a roll feels like a roll, and a
statistics mode that counts every result you have ever rolled and shows whether the distribution is flat. That
second one turns a toy into a small experiment about what "random" actually means on a chip that has no random
numbers in it at all.</p>`,

what: [
  'Roll a die on a press: a short tumble animation, then a face held steady.',
  'Roll two dice with a long press, showing them one after the other with the total on the pips.',
  'Count every roll in EEPROM and blink the distribution back to you on demand.',
  'Seed itself from your own reaction time, so it is not the same sequence every power-up.',
  'Run from a USB charger or a battery and sit on the table during a board game.'
],

how: `
<p>A die face is a <strong>bit pattern</strong>. Number the LEDs 0 to 6:</p>
<pre style="font-family:var(--mono);font-size:.85rem;line-height:1.5;margin:14px 0">  0     3
  1  6  4
  2     5</pre>
<p>Then a 1 is just LED 6. A 2 is LEDs 0 and 5. A 3 is 0, 6 and 5. Each face is a list of which LEDs are on,
and the whole of the display logic becomes "look up the face, light those LEDs". That is what an array is
<em>for</em> - replacing six near-identical blocks of code with one table and one loop.</p>
<p><strong>Randomness</strong> is the interesting part. An Arduino has no source of randomness.
<code>random()</code> is a deterministic sequence, so without seeding it you get exactly the same "random"
rolls after every reset - which people notice within about four games.</p>
<p><code>randomSeed()</code> fixes it, but only if you seed it with something genuinely unpredictable. Reading
an unconnected analog pin picks up electrical noise and is the usual trick; better still is seeding from
<code>micros()</code> at the moment a human presses the button, because no two presses ever land on the same
microsecond. This sketch does both.</p>`,

bom: [
  { id: 'uno', qty: 1, note: 'A Nano works identically and fits a smaller box.' },
  { id: 'led5', qty: 7, note: 'All the same colour looks best - white or red. Buy an assortment pack.' },
  { id: 'res220', qty: 7, note: 'One per LED. Never share one between several.' },
  { id: 'button', qty: 1, note: 'A big 12 mm one if you have it - this gets pressed a lot.' },
  { id: 'buzzer', qty: 1, note: 'Optional. A tick during the tumble makes it feel much better.' },
  { id: 'bb-830', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true },
  { id: 'box-abs', qty: 1, note: 'Optional. Drill seven 5 mm holes in the lid in the die pattern and it becomes a real object.' }
],

tools: [],

build: {
  parts: [
    { id: 'uno', comp: 'uno',    at: [0, 92] },
    { id: 'bb',  comp: 'bb830',  at: [0, 8] },
    { id: 'd0',  comp: 'led5',   at: [-40, -46] },
    { id: 'd1',  comp: 'led5',   at: [-40, -62] },
    { id: 'd2',  comp: 'led5',   at: [-40, -78] },
    { id: 'd3',  comp: 'led5',   at: [-8, -46] },
    { id: 'd4',  comp: 'led5',   at: [-8, -62] },
    { id: 'd5',  comp: 'led5',   at: [-8, -78] },
    { id: 'd6',  comp: 'led5',   at: [-24, -62] },
    { id: 'btn', comp: 'button', at: [34, -58] },
    { id: 'buz', comp: 'buzzer', at: [62, -56] }
  ],
  wires: [
    { from: 'uno.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V onto the lower red rail' },
    { from: 'uno.GND1', to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+12',  to: 'bb.T+12', color: 'red',    note: 'Bridge the two red rails' },
    { from: 'bb.B-12',  to: 'bb.T-12', color: 'black',  note: 'Bridge the two blue rails' },
    { from: 'd0.A', to: 'uno.D2', color: 'white',  note: 'LED 0 - top left pip, via 220 ohm' },
    { from: 'd1.A', to: 'uno.D3', color: 'white',  note: 'LED 1 - middle left pip' },
    { from: 'd2.A', to: 'uno.D4', color: 'white',  note: 'LED 2 - bottom left pip' },
    { from: 'd3.A', to: 'uno.D5', color: 'white',  note: 'LED 3 - top right pip' },
    { from: 'd4.A', to: 'uno.D6', color: 'white',  note: 'LED 4 - middle right pip' },
    { from: 'd5.A', to: 'uno.D7', color: 'white',  note: 'LED 5 - bottom right pip' },
    { from: 'd6.A', to: 'uno.D8', color: 'white',  note: 'LED 6 - the centre pip' },
    { from: 'd0.K', to: 'bb.T-4',  color: 'black', note: 'All seven cathodes go to the ground rail' },
    { from: 'd6.K', to: 'bb.T-8',  color: 'black', note: 'Centre pip cathode to ground' },
    { from: 'btn.1A', to: 'uno.D10', color: 'blue',  note: 'Roll button, internal pull-up' },
    { from: 'btn.2A', to: 'bb.T-18', color: 'black', note: 'Button to ground' },
    { from: 'buz.+',  to: 'uno.D9',  color: 'orange',note: 'Tick and fanfare buzzer' },
    { from: 'buz.-',  to: 'bb.T-22', color: 'black', note: 'Buzzer ground' }
  ]
},

wireIntro: `<p>The model shows two of the seven cathode wires for clarity - in reality all seven short legs go
to the blue ground rail, which is exactly what a rail is for.</p>
<p>Lay the LEDs out in the die pattern on the breadboard as you go. It makes the wiring obvious and the
finished thing readable.</p>`,

wireNotes: `
<div class="note tip"><span class="t">The pip layout, and why the pin order matters</span>
<p>Physically arrange them like this, and wire them to D2 through D8 in this order:</p>
<pre style="font-family:var(--mono);font-size:.85rem;line-height:1.5;margin:10px 0">  D2        D5
  D3   D8   D6
  D4        D7</pre>
<p>Keeping the physical layout and the pin order matched is what lets the sketch be a table and a loop. Muddle
them and everything still works, but the wrong pips light and you will be renumbering things for an hour.</p></div>

<div class="note warn"><span class="t">Seven LEDs, seven resistors</span>
<p>One resistor per LED, in series with the long leg. It is tempting to put a single resistor on the shared
ground rail instead - do not. With one shared resistor, lighting six pips makes them all six times dimmer than
lighting one, so a six would be barely visible and a one would be blinding.</p></div>

<div class="note"><span class="t">An LED in backwards just does not light</span>
<p>It is not damaged. Long leg (anode) towards the resistor and the Arduino pin; short leg (cathode) to
ground. If a pip never lights, that is the first thing to check, and with seven of them the odds are good that
at least one is in backwards.</p></div>`,

solderIntro: `<p>No soldering required. If you want to build it into a box with the pips showing through the
lid, these are the steps.</p>`,

solderSteps: [
  { h: 'Mark the die pattern on the lid first',
    body: `<p>Seven 5&nbsp;mm holes, in the pattern above, about 20&nbsp;mm apart. Drill them before you solder
    anything - it is much easier to fit the electronics to the box than the box to the electronics.</p>` },
  { h: 'Push the LEDs into the lid, then solder from behind',
    body: `<p>Friction usually holds a 5&nbsp;mm LED in a 5&nbsp;mm hole; a spot of hot glue makes it certain.
    With all seven in place and pointing the same way, you are soldering to a fixed jig rather than juggling
    loose parts.</p>
    <p>Check every one has its long leg on the same side before you commit.</p>` },
  { h: 'Bend all seven cathodes together into a ring',
    body: `<p>The short legs are all going to ground. Bend each one over to touch its neighbour, and solder
    along the chain - you end up with one tidy ring of wire and a single lead going off to ground.</p>
    <p>This is a proper technique, not a bodge. Three seconds per joint at 340&nbsp;&deg;C.</p>` },
  { h: 'A resistor on each anode',
    body: `<p>Solder a 220&nbsp;&Omega; directly to each long leg, then a wire from the far end of the resistor
    to the Arduino. Slide a short piece of heat-shrink over each resistor so the bare leads cannot touch each
    other - with seven of them packed into a lid, they will.</p>` },
  { h: 'Tug-test everything',
    body: `<p>Pull gently on each wire. A good joint does not move at all. With seven near-identical joints,
    one cold one is very easy to miss by eye and very obvious to a tug.</p>` },
  { h: 'Check before power',
    body: `<p>Multimeter on continuity: 5&nbsp;V to ground silent, and the cathode ring continuous all the way
    round.</p>` }
],

assembly: [
  { h: 'Power rails and the bridges, then test',
    body: `<p>Four wires, plug in USB, confirm the board lights, unplug. Every time.</p>` },
  { h: 'Place the seven LEDs in the die pattern',
    body: `<p>Three down the left, three down the right, one in the middle. Give yourself a couple of rows
    between them so the resistors have somewhere to go.</p>` },
  { h: 'Wire them one at a time, in order',
    body: `<p>D2 to the top left and work down, then D5 to the top right and down, then D8 to the centre. Do one
    completely - resistor, jumper, ground - before starting the next. Seven half-finished LEDs is confusing;
    six finished ones and one to go is not.</p>` },
  { h: 'Button and buzzer',
    body: `<p>Button to D10 and ground, on diagonal legs. Buzzer's marked leg to D9.</p>` },
  { h: 'Upload and roll it fifty times',
    body: `<p>Partly because it is fun, mostly because it is the fastest way to spot a pip that never lights.</p>` }
],

libraries: [
  { name: 'EEPROM', by: 'Arduino', how: 'Built in', why: 'Keeps the roll statistics through a power cut.' }
],

code: [{
  name: 'electronic_dice.ino',
  intro: `<p>Short press rolls one die. Long press rolls two. Hold for three seconds to blink out the
  statistics; hold for six to reset them.</p>`,
  code: `/* ------------------------------------------------------------------
   Electronic dice
   Seven LEDs on D2-D8 in the pip pattern, button on D10, buzzer on D9.

   LED numbering, matching the physical layout:
        0        3
        1   6    4
        2        5
   ------------------------------------------------------------------ */

#include <EEPROM.h>

// ---- pins ------------------------------------------------------------
const byte PIPS[7] = { 2, 3, 4, 5, 6, 7, 8 };
#define BUTTON  10
#define BUZZER   9

// ---- behaviour -------------------------------------------------------
#define TUMBLE_MS      900     // how long the roll animation runs
#define LONG_PRESS_MS  450     // longer than this = two dice
#define STATS_MS      3000     // hold this long to see the statistics
#define RESET_MS      6000     // hold this long to clear them
#define EE_ADDR        40
#define EE_MAGIC     0x64
// ----------------------------------------------------------------------

/* Which pips are lit for each face. Index 0 is unused so that
   FACES[3] really is a three - worth the one wasted row. */
const byte FACES[7] = {
  0,                                              // unused
  0b1000000,   // 1 - centre only
  0b0100001,   // 2 - top left, bottom right
  0b1100001,   // 3 - plus centre
  0b0100111,   // 4 - four corners
  0b1100111,   // 5 - four corners plus centre
  0b0111111    // 6 - all six outer pips
};

unsigned int rolls[7];        // how many of each face, index 1-6

void setup() {
  Serial.begin(9600);
  for (byte i = 0; i < 7; i++) pinMode(PIPS[i], OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);

  loadStats();

  // A weak seed to start with - improved from the first button press.
  randomSeed(analogRead(A0) * 31 + analogRead(A3));

  startupSweep();
  showFace(0);
}

void loop() {
  if (digitalRead(BUTTON) != LOW) return;

  // A human press is genuinely unpredictable at microsecond resolution.
  randomSeed(micros());

  unsigned long pressedAt = millis();
  while (digitalRead(BUTTON) == LOW) {
    unsigned long held = millis() - pressedAt;
    // give feedback while they hold, so a long press is discoverable
    if (held > RESET_MS)      showFace(6);
    else if (held > STATS_MS) showFace(3);
    else if (held > LONG_PRESS_MS) showFace(2);
  }
  unsigned long held = millis() - pressedAt;
  delay(25);                                    // debounce the release

  if (held > RESET_MS)        { resetStats(); }
  else if (held > STATS_MS)   { showStats(); }
  else if (held > LONG_PRESS_MS) { rollTwo(); }
  else                        { rollOne(); }
}

/* --- rolling ---------------------------------------------------------- */
byte rollOne() {
  tumble();
  byte value = random(1, 7);                    // 1 to 6 inclusive
  showFace(value);
  rolls[value]++;
  saveStats();

  tone(BUZZER, 1600, 70);
  Serial.print(F("rolled "));
  Serial.println(value);
  return value;
}

void rollTwo() {
  byte a = rollOne();
  delay(700);
  byte b = rollOne();

  delay(700);
  byte total = a + b;
  Serial.print(F("total "));
  Serial.println(total);

  // Show the total by blinking the centre pip that many times - a
  // seven-pip display cannot draw an 11.
  showFace(0);
  delay(300);
  for (byte i = 0; i < total; i++) {
    digitalWrite(PIPS[6], HIGH);
    tone(BUZZER, 2000, 40);
    delay(170);
    digitalWrite(PIPS[6], LOW);
    delay(140);
  }
  delay(400);
  showFace(a + b > 6 ? 6 : a + b);
}

/* The tumble: random faces, slowing down. Starts fast and ends slow,
   which is what makes it feel like a die settling rather than a
   counter stopping. */
void tumble() {
  unsigned long start = millis();
  int gap = 35;
  while (millis() - start < TUMBLE_MS) {
    showFace(random(1, 7));
    tone(BUZZER, 900 + random(400), 8);
    delay(gap);
    gap += 6;                                   // slow down as it goes
  }
}

/* --- display ---------------------------------------------------------- */
void showFace(byte value) {
  byte pattern = (value >= 1 && value <= 6) ? FACES[value] : 0;
  for (byte i = 0; i < 7; i++) {
    digitalWrite(PIPS[i], (pattern >> i) & 1);
  }
}

void startupSweep() {
  for (byte i = 0; i < 7; i++) {
    digitalWrite(PIPS[i], HIGH);
    delay(90);
    digitalWrite(PIPS[i], LOW);
  }
}

/* --- statistics -------------------------------------------------------
   Blinks each face, then its count in tens and units. Crude, and it
   answers a real question: is random() actually flat? */
void showStats() {
  unsigned long total = 0;
  for (byte f = 1; f <= 6; f++) total += rolls[f];

  Serial.println(F("--- roll counts ---"));
  for (byte f = 1; f <= 6; f++) {
    Serial.print(f);
    Serial.print(F(": "));
    Serial.print(rolls[f]);
    if (total) {
      Serial.print(F("  ("));
      Serial.print(rolls[f] * 100.0 / total, 1);
      Serial.println(F("%)"));
    } else {
      Serial.println();
    }
  }
  Serial.print(F("total rolls: "));
  Serial.println(total);

  for (byte f = 1; f <= 6; f++) {
    showFace(f);
    delay(700);
    blinkCount(rolls[f]);
    showFace(0);
    delay(400);
  }
  showFace(0);
}

void blinkCount(unsigned int n) {
  // tens on the top-left pip, units on the centre pip
  for (unsigned int t = 0; t < n / 10 && t < 20; t++) {
    digitalWrite(PIPS[0], HIGH); delay(260);
    digitalWrite(PIPS[0], LOW);  delay(200);
  }
  delay(280);
  for (unsigned int u = 0; u < n % 10; u++) {
    digitalWrite(PIPS[6], HIGH); delay(130);
    digitalWrite(PIPS[6], LOW);  delay(160);
  }
}

/* --- storage ---------------------------------------------------------- */
void loadStats() {
  if (EEPROM.read(EE_ADDR) != EE_MAGIC) { resetStats(); return; }
  for (byte f = 1; f <= 6; f++) {
    EEPROM.get(EE_ADDR + 1 + (f - 1) * 2, rolls[f]);
  }
}

void saveStats() {
  EEPROM.update(EE_ADDR, EE_MAGIC);
  for (byte f = 1; f <= 6; f++) {
    // EEPROM.put only writes bytes that actually changed, so this
    // does not chew through the chip's 100,000 write endurance.
    EEPROM.put(EE_ADDR + 1 + (f - 1) * 2, rolls[f]);
  }
}

void resetStats() {
  for (byte f = 0; f < 7; f++) rolls[f] = 0;
  saveStats();
  Serial.println(F("statistics cleared"));
  for (byte i = 0; i < 3; i++) {
    showFace(6); tone(BUZZER, 400, 80); delay(150);
    showFace(0); delay(120);
  }
}`,
  after: `<p>Two ideas worth keeping:</p>
  <ul>
    <li><strong>The <code>FACES</code> table.</strong> Six faces in seven bytes, and one loop displays any of
    them. The alternative is six <code>if</code> blocks of seven <code>digitalWrite()</code> calls each, which
    is 42 lines that all look alike and where a typo is invisible.</li>
    <li><strong>Deliberately wasting index 0.</strong> <code>FACES[3]</code> being a three - rather than
    <code>FACES[2]</code> - removes an off-by-one from every single place the table is used. One wasted byte
    against a whole category of bug is an easy trade.</li>
  </ul>`
}],

upload: `<p>Uno, correct port, upload. The pips sweep once at power-up, which confirms all seven are wired
before you roll anything.</p>
<p>Open the Serial Monitor at 9600 and roll fifty times - it prints each result and the running percentages
when you ask for statistics.</p>`,

tune: [
  { h: 'Is it actually fair?',
    body: `<p>Roll a hundred times and hold the button for the statistics. Each face should be somewhere near
    16.7&nbsp;%. With only a hundred rolls, anything between about 10&nbsp;% and 24&nbsp;% is entirely normal
    variation - that is the real lesson, and it is why a hundred rolls proves much less than people expect.</p>
    <p>A face that is at 2&nbsp;% or 40&nbsp;% after five hundred rolls is a bug, not luck.</p>` },
  { h: 'Tumble feel',
    body: `<p><code>TUMBLE_MS</code> and the <code>gap += 6</code> line. Longer and slower feels weightier;
    faster feels arcade-y. The gradual slow-down is what sells it - a constant-speed flicker that stops dead
    feels like a fault.</p>` },
  { h: 'Quieter',
    body: `<p>Comment out the <code>tone()</code> in <code>tumble()</code> and keep the one at the end. The tick
    is great in a noisy game and grating at bedtime.</p>` },
  { h: 'A D20 instead',
    body: `<p>Seven pips cannot draw a twenty, but they can blink it. Change <code>random(1, 7)</code> to
    <code>random(1, 21)</code> and use <code>blinkCount()</code> to show the result. A 4-digit TM1637 display
    is the better answer - see the <a href="project.html?p=reaction-timer">reaction timer</a>.</p>` },
  { h: 'Battery power',
    body: `<p>It draws about 70&nbsp;mA with six pips lit. A USB power bank runs it for days; a 9&nbsp;V PP3
    into the barrel jack runs it for a few hours and gets warm, because the regulator burns the extra
    4&nbsp;V as heat.</p>` }
],

trouble: [
  { q: 'One pip never lights',
    a: `It is in backwards - long leg towards the resistor and the pin. With seven LEDs the odds of getting one
    wrong are high, and it is not damaged.` },
  { q: 'The wrong pips light for each number',
    a: `The physical layout does not match the pin order. Either rearrange the LEDs to match the diagram, or
    reorder the <code>PIPS[]</code> array to match your wiring - the array exists precisely so you can fix this
    in software.` },
  { q: 'All the pips are dim, and dimmer when more are lit',
    a: `One shared resistor on the ground rail instead of seven individual ones. Each LED needs its own.` },
  { q: 'Same sequence of rolls after every reset',
    a: `<code>randomSeed()</code> is being called with something predictable. The sketch reseeds from
    <code>micros()</code> at each press, so if you still see repeats, check that line survived.` },
  { q: 'Button gives two rolls per press',
    a: `The sketch waits for release, so this should not happen. If it does, raise the <code>delay(25)</code>
    after the release to 50.` },
  { q: 'Long press never registers',
    a: `You are letting go too early. <code>LONG_PRESS_MS</code> is 450&nbsp;ms, which is longer than it feels
    - the pips change to a two while you hold, which is the cue.` },
  { q: 'Statistics are 65535 on a new board',
    a: `Unwritten EEPROM reads as 0xFF everywhere. The magic-byte check in <code>loadStats()</code> handles it;
    if you changed <code>EE_ADDR</code>, the old magic byte is still at the old address.` },
  { q: 'Buzzer clicks instead of ticking',
    a: `Active buzzer instead of passive. Active ones ignore <code>tone()</code>.` }
],

next: `
<ul>
  <li><strong>Add a second set of seven LEDs</strong> and roll both dice at once, which is what you actually
  want for most board games.</li>
  <li><strong>Shake to roll</strong>: an MPU-6050 accelerometer instead of the button, triggering on a sharp
  movement. Same sensor as the <a href="project.html?p=smart-bike-light">bike light</a>.</li>
  <li><strong>Build <a href="project.html?p=simon-says">Simon</a></strong> - four of these LEDs, four buttons,
  and a game that is genuinely hard.</li>
  <li><strong>Put it in a clear acrylic cube</strong> with the LEDs facing outwards. It is a lovely object and
  the wiring is identical.</li>
</ul>`
});
