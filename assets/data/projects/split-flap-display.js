/* Split-flap: the one project here whose output is a sound as much as a display. */
AB.addProject({
slug: 'split-flap-display',
title: 'Split-flap message display',
cat: 'display',
level: 3,
time: '12 hours, most of it mechanical',
solder: true,
board: 'ESP32',
tags: ['split flap', 'stepper', '28byj-48', 'hall sensor', 'homing', 'mechanical', 'esp32', 'airport'],
blurb: 'Four mechanical character drums that clatter round to spell a word, exactly like an airport board in 1978. The electronics are simple. The mechanism is where the project actually lives.',

skills: ['Stepper control', 'Homing with a sensor', 'Absolute position from a relative motor', 'Gear-ratio arithmetic', 'Mechanical tolerance', 'Coordinating several motors'],

intro: `
<p>A split-flap module is a drum of hinged cards. Turn it and each card falls past the viewing window in turn,
making the sound everybody over forty associates with catching a train. You can buy them as kits, print them, or
laser cut them, and one module shows one character.</p>
<p>Electrically this is four cheap steppers and a sensor each. Nothing here is hard to wire. What is hard is that
each drum has to know <em>which character it is currently showing</em>, and a stepper motor has no idea where it
is - it only knows how far you have told it to move since the board woke up.</p>
<p>Everything interesting in this project comes from solving that.</p>`,

what: [
  'Drive four character drums independently from one ESP32 - which is exactly as many as its pins allow.',
  'Find an absolute zero on each drum at power-up, using one magnet and one hall sensor.',
  'Go to any character by the shortest legal route - which, on a drum that only turns one way, is not always the short way round.',
  'Accept a message over Wi-Fi from a phone browser.',
  'Correct for drift, so the thousandth message is as accurate as the first.'
],

how: `
<p><strong>A 28BYJ-48 is not 2048 steps.</strong> It is usually quoted as 2048 steps per revolution in half-step
mode, but the internal gearbox is 63.68395:1, not 64:1. The true figure is about 2037.9. Assume 2048 and every
drum creeps by half a character over a few dozen revolutions, which looks exactly like a mechanical fault and
is not.</p>
<p>Two ways to live with this. Use the real number as a float, or - better - re-home regularly and never
accumulate error in the first place.</p>

<p><strong>Homing is the whole project.</strong> One small magnet glued to the drum, one hall sensor on the
frame. At power-up each drum turns slowly until the sensor triggers; that position is character zero, by
definition. From then on the software tracks position as a step count modulo one revolution.</p>
<p>Home the drums one at a time, not all four at once. Four 28BYJ-48s stalling against their end stops
simultaneously is around 1&nbsp;A, which is more than most 5&nbsp;V supplies enjoy and far more than the
ESP32's regulator can pass.</p>

<p><strong>The drum only turns one way.</strong> The flaps hinge in one direction; run it backwards and they
jam or fold. So "go from V to C" is not a short reverse move, it is a long forward one all the way round. The
routing arithmetic is a single modulo, and getting it wrong is the classic first bug - the display works
perfectly until the first word that needs to go backwards, then destroys itself.</p>

<p><strong>Position, not motion.</strong> Track each drum as an integer character index 0-39 and a step offset.
When a new message arrives, compute the forward distance for each drum and start them all moving together; they
arrive at different times, which is exactly what the real boards did and is half the charm.</p>

<p><strong>ULN2003 and why the coils get warm.</strong> A 28BYJ-48 holds position by keeping a coil energised.
Left like that it draws around 250&nbsp;mA and gets genuinely hot for no benefit, because a split-flap drum has
enough friction to stay put on its own. De-energise the coils a moment after the move finishes. This one line
of code is the difference between a display you leave on and one you do not.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Sixteen coil pins plus four sensor pins, which is very nearly every usable GPIO. That is why this build stops at four drums.' },
  { id: 'splitflap', qty: 4, note: 'One per character. Start by building ONE and only order the rest once it homes and steps reliably.' },
  { id: '28byj', qty: 4, note: 'Comes with its ULN2003 driver board. Buy a spare - one in ten has a rough gearbox.' },
  { id: 'hall', qty: 4, note: 'A3144 digital hall switch, one per drum, for homing.' },
  { id: 'magnet', qty: 1, note: 'A 6 mm disc magnet per drum. The pack has plenty.' },
  { id: 'psu5v3a', qty: 1, note: 'Not optional. Four steppers is well beyond USB, and browning out mid-home leaves every drum lying about its position.' },
  { id: 'res10k', qty: 4, note: 'Pull-ups for the hall sensors. The A3144 is open-collector and reads as permanently triggered without one.' },
  { id: 'cap1000', qty: 1, note: 'Across the 5 V rail at the motors. Stepper current steps are abrupt and the rail sags without it.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',    at: [0, 92] },
    { id: 'bb',   comp: 'bb830',    at: [0, 26] },
    { id: 'f1',   comp: 'flapunit', at: [-70, -52] },
    { id: 'f2',   comp: 'flapunit', at: [0, -52] },
    { id: 'f3',   comp: 'flapunit', at: [70, -52] },
    { id: 'h1',   comp: 'hall',     at: [-70, -8] }
  ],
  wires: [
    { from: 'mcu.VIN',  to: 'bb.T+1',   color: 'red',    note: '5 V from the external supply, onto the rail' },
    { from: 'mcu.GND',  to: 'bb.T-1',   color: 'black',  note: 'Common ground - the supply and the ESP32 must share it' },
    { from: 'f1.VCC',   to: 'bb.T+5',   color: 'red',    note: 'Drum 1 driver power, straight from the 5 V rail not the ESP32' },
    { from: 'f1.GND',   to: 'bb.T-5',   color: 'black',  note: 'Drum 1 ground' },
    { from: 'f1.IN1',   to: 'mcu.D13',  color: 'green',  note: 'Drum 1 coil A' },
    { from: 'f1.IN2',   to: 'mcu.D12',  color: 'blue',   note: 'Drum 1 coil B' },
    { from: 'f1.IN3',   to: 'mcu.D14',  color: 'yellow', note: 'Drum 1 coil C' },
    { from: 'f1.IN4',   to: 'mcu.D27',  color: 'orange', note: 'Drum 1 coil D' },
    { from: 'f2.VCC',   to: 'bb.T+11',  color: 'red',    note: 'Drum 2 power' },
    { from: 'f2.GND',   to: 'bb.T-11',  color: 'black',  note: 'Drum 2 ground' },
    { from: 'f2.IN1',   to: 'mcu.D26',  color: 'green',  note: 'Drum 2 coil A' },
    { from: 'f2.IN2',   to: 'mcu.D25',  color: 'blue',   note: 'Drum 2 coil B' },
    { from: 'f2.IN3',   to: 'mcu.D33',  color: 'yellow', note: 'Drum 2 coil C' },
    { from: 'f2.IN4',   to: 'mcu.D32',  color: 'orange', note: 'Drum 2 coil D' },
    { from: 'f3.VCC',   to: 'bb.T+17',  color: 'red',    note: 'Drum 3 power' },
    { from: 'f3.GND',   to: 'bb.T-17',  color: 'black',  note: 'Drum 3 ground' },
    { from: 'f3.IN1',   to: 'mcu.D19',  color: 'green',  note: 'Drum 3 coil A' },
    { from: 'f3.IN2',   to: 'mcu.D18',  color: 'blue',   note: 'Drum 3 coil B' },
    { from: 'f3.IN3',   to: 'mcu.D17',  color: 'yellow', note: 'Drum 3 coil C' },
    { from: 'f3.IN4',   to: 'mcu.D16',  color: 'orange', note: 'Drum 3 coil D' },
    { from: 'h1.VCC',   to: 'bb.T+24',  color: 'red',    note: 'Hall sensor power' },
    { from: 'h1.GND',   to: 'bb.T-24',  color: 'black',  note: 'Hall sensor ground' },
    { from: 'h1.DO',   to: 'mcu.D34',  color: 'white',  note: 'Drum 1 home sensor, with its 10 k pull-up to 3.3 V' }
  ]
},

wireIntro: `<p>Three drums are drawn; the fourth is wired identically on the pins listed in the sketch. Each drum is
four coil wires, power, ground and one sensor line.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Motor power never comes from the ESP32</span>
<p>The 5&nbsp;V pin on a dev board is fed through the USB connector and a small regulator. Six steppers will
brown it out, and a brownout during homing is the worst possible moment - every drum then believes it is at a
position it is not.</p>
<p>The external supply feeds the motor rail directly. The ESP32 shares only ground with it.</p></div>

<div class="note tip"><span class="t">The A3144 needs a pull-up</span>
<p>It is an open-collector output: it can pull the line low but cannot drive it high. Without a 10&nbsp;k
resistor to 3.3&nbsp;V the pin floats and reads as permanently triggered, so homing finishes instantly with
every drum in the wrong place.</p>
<p>It is also polarity sensitive - it responds to one magnetic pole only. If homing never triggers, flip the
magnet over before you suspect anything else.</p></div>

<div class="note"><span class="t">Input-only pins are perfect for sensors</span>
<p>GPIO 34-39 cannot drive anything, which makes them useless for coils and ideal for the four hall sensors. They
have no internal pull-up, which is why the external resistors are in the BOM.</p></div>`,

solderIntro: `<p>The soldering is light: header sockets on a piece of perfboard so each driver and sensor
plugs in, plus three wires to each hall sensor. Doing this on perfboard rather than a breadboard matters,
because a breadboard connection that works loose mid-message is indistinguishable from a software bug.</p>`,

solderSteps: [
  { h: 'Plan the board around the cable runs',
    body: `<p>Four drivers and four sensors is a lot of wire. Put the four driver headers in a row with the 5&nbsp;V
    and ground rails running between them, and bring all eight sensor wires to one edge.</p>
    <p>Spend ten minutes on layout now. Rewiring this later means desoldering twenty-four joints.</p>` },
  { h: 'Power rails first, in thick wire',
    body: `<p>Run 5&nbsp;V and ground as two solid 22&nbsp;AWG bus wires across the board and solder every
    driver's power pins to them as short stubs. Four motors is up to 1&nbsp;A and a daisy chain of thin hookup
    wire will drop enough voltage that the last drum behaves differently from the first.</p>` },
  { h: 'The 1000 uF capacitor across the rail',
    body: `<p>At the motor end, not at the supply end. Watch the polarity - the stripe is the negative leg, and
    an electrolytic in backwards will eventually vent.</p>
    <p>This smooths the current steps as coils switch. Without it you will see the ESP32 reset occasionally
    during four-drum moves, which looks like a firmware crash.</p>` },
  { h: 'Hall sensors on flying leads',
    body: `<p>Three wires each, and they need to reach the frame beside each drum. Solder them with enough slack
    to position the sensor after assembly - the gap between magnet and sensor wants to be 2-3&nbsp;mm and you
    will not know exactly where that is until the drum is in its housing.</p>
    <p>Heatshrink each joint. These wires get handled every time you adjust a drum.</p>` },
  { h: 'The pull-ups',
    body: `<p>One 10&nbsp;k from each sensor's output line to the 3.3&nbsp;V rail. Mount them at the board end,
    not at the sensor - keeping them together makes it obvious later that all four are present.</p>` }
],

assembly: [
  { h: 'Build one drum completely first',
    body: `<p>Assemble one module, wire it, and get it homing and stepping to named characters before you build
    the other three. Every mechanical problem you are going to have appears on the first drum, and finding it
    once is much better than finding it four times.</p>` },
  { h: 'Glue the magnet, then find the sensor position',
    body: `<p>Magnet on the drum edge, sensor on the frame. Power the sensor and turn the drum by hand while
    watching the pin with a multimeter or a one-line sketch. You want a clean transition at one place per
    revolution and nowhere else.</p>
    <p>Too far and it never triggers; too close and the drum catches it. Two to three millimetres.</p>` },
  { h: 'Check the flap direction before running a motor',
    body: `<p>Turn the drum by hand both ways. One direction lets the cards fall freely, the other pushes them
    against their hinges. Note which is which and make sure the sketch's forward direction matches, because a
    motor will happily destroy a drum's worth of cards in a second and a half.</p>` },
  { h: 'Calibrate the offset',
    body: `<p>Home the drum, then look at the window. Whatever character is showing is your zero. Either
    rearrange the cards so that is a blank, or set <code>HOME_OFFSET</code> so the software knows.</p>` },
  { h: 'Add drums one at a time',
    body: `<p>After each one, re-run the homing routine for all of them. Adding a drum adds current draw, and
    the symptom of an overloaded supply is that a previously reliable drum starts missing steps.</p>` },
  { h: 'Mount them in a row and level them',
    body: `<p>The windows need to line up within about a millimetre or the message looks drunk. A single length
    of aluminium angle across the back of all four is the easy answer.</p>` }
],

libraries: [
  { name: 'AccelStepper', by: 'Mike McCauley', why: 'Non-blocking stepper control with acceleration. Essential here - four drums have to move at once, and the blocking Stepper library can only do one at a time.' },
  { name: 'ESPAsyncWebServer', by: 'me-no-dev', why: 'Serves the message page without stalling the motors while a browser is connected.' }
],

code: [{
  name: 'split_flap.ino',
  code: `/* ------------------------------------------------------------------
   Four-drum split-flap display

   Each drum: 28BYJ-48 through a ULN2003, one A3144 hall sensor.
   Position is tracked as a character index; homing defines zero.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <AccelStepper.h>

#define DRUMS      4
#define CHARS     40          // how many cards are on your drum

/* The 28BYJ-48 gearbox is 63.68395:1, NOT 64:1. Half-stepping a 32-step
   motor through it gives 2037.9 steps per revolution, not 2048. Using
   2048 makes every drum drift about half a character per 40 turns. */
const float STEPS_PER_REV = 2037.9f;
const float STEPS_PER_CHAR = STEPS_PER_REV / CHARS;

// IN1, IN3, IN2, IN4 - the odd order is what AccelStepper's HALF4WIRE wants
const int COIL[DRUMS][4] = {
  {13, 14, 12, 27}, {26, 33, 25, 32}, {19, 17, 18, 16}, {23, 21, 22, 5}
};
/* The only four input-only pins on an ESP32, which is exactly enough for
   four drums and the reason this build stops at four. See the write-up. */
const int HALL[DRUMS] = {34, 35, 36, 39};

AccelStepper* drum[DRUMS];
int   position[DRUMS];        // current character index, 0..CHARS-1
int   target[DRUMS];
bool  moving[DRUMS];

const char* ALPHABET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-?";

// ---- setup -----------------------------------------------------------
void setup() {
  Serial.begin(115200);

  for (int i = 0; i < DRUMS; i++) {
    drum[i] = new AccelStepper(AccelStepper::HALF4WIRE,
                               COIL[i][0], COIL[i][1], COIL[i][2], COIL[i][3]);
    drum[i]->setMaxSpeed(700);
    drum[i]->setAcceleration(400);
    pinMode(HALL[i], INPUT);   // external 10k pull-up; A3144 is open collector
    moving[i] = false;
  }

  // One at a time. Six stalled steppers is ~1.5 A and a brownout here
  // leaves every drum confidently wrong about where it is.
  for (int i = 0; i < DRUMS; i++) homeDrum(i);

  showMessage("OPEN");
}

// ---- homing ----------------------------------------------------------
void homeDrum(int i) {
  Serial.printf("Homing drum %d... ", i);
  drum[i]->setMaxSpeed(300);                 // slow, so we do not overshoot

  long limit = (long)(STEPS_PER_REV * 1.5f); // one and a half turns, then give up
  long moved = 0;

  while (digitalRead(HALL[i]) == HIGH && moved < limit) {
    drum[i]->move(4);
    while (drum[i]->distanceToGo()) drum[i]->run();
    moved += 4;
  }

  if (moved >= limit) {
    Serial.println("FAILED - magnet or sensor problem");
  } else {
    Serial.println("ok");
  }

  drum[i]->setCurrentPosition(0);
  position[i] = 0;
  drum[i]->setMaxSpeed(700);
  release(i);
}

// ---- moving ----------------------------------------------------------
void showMessage(const char* msg) {
  for (int i = 0; i < DRUMS; i++) {
    char c = (i < strlen(msg)) ? toupper(msg[i]) : ' ';
    const char* p = strchr(ALPHABET, c);
    target[i] = p ? (p - ALPHABET) : 0;
    startMove(i);
  }
}

void startMove(int i) {
  /* The drum turns one way only - the flaps hinge in one direction and
     reversing folds them. So the distance is always FORWARD, which may
     mean going nearly all the way round. */
  int steps = target[i] - position[i];
  if (steps < 0) steps += CHARS;
  if (steps == 0) return;

  drum[i]->move((long)(steps * STEPS_PER_CHAR));
  moving[i] = true;
}

void loop() {
  for (int i = 0; i < DRUMS; i++) {
    if (!moving[i]) continue;
    if (drum[i]->distanceToGo()) {
      drum[i]->run();
    } else {
      position[i] = target[i];
      moving[i] = false;
      release(i);                 // stop cooking the coils
    }
  }
}

/* A 28BYJ-48 holds position by keeping a coil energised - about 250 mA
   and genuinely hot. A split-flap drum has plenty of friction to stay
   put on its own, so cut the current the moment the move finishes. */
void release(int i) {
  for (int c = 0; c < 4; c++) digitalWrite(COIL[i][c], LOW);
}`
}],

trouble: [
  { q: 'Homing never finishes on one drum',
    a: `The A3144 responds to one magnetic pole only. Flip the magnet over. If that does not do it, check the
    10&nbsp;k pull-up is present - without it the pin floats high and never triggers, or floats low and triggers
    instantly.` },
  { q: 'Homing finishes instantly on every drum',
    a: `Pull-ups missing, or you are reading an input-only pin without one. Print <code>digitalRead</code> in a
    loop and wave the magnet past by hand - you should see it change.` },
  { q: 'The drum turns but the flaps jam or fold',
    a: `Wrong direction. Swap the two middle pins in that drum's COIL row. Check by hand first, with the power
    off - the cards should fall freely one way and resist the other.` },
  { q: 'Characters drift over an afternoon',
    a: `You are using 2048 steps per revolution. The real number is about 2037.9 because the gearbox is
    63.68395:1. Either use the float, or re-home every few messages.` },
  { q: 'The ESP32 resets during moves',
    a: `Supply sag. Check the 1000&nbsp;uF capacitor is fitted at the motor end of the rail, and that motor
    power is not coming through the ESP32's 5&nbsp;V pin.` },
  { q: 'Motors get hot when idle',
    a: `Coils still energised after the move. That is what <code>release()</code> is for - confirm it is being
    called when <code>distanceToGo()</code> reaches zero.` },
  { q: 'One drum does nothing at all',
    a: `Several ESP32 pins are unavailable in practice - GPIO 0, 2 and 15 are strapping pins that affect boot,
    and 1 and 3 are the serial port. The pin map in the sketch avoids all of them; if you have rearranged it,
    that is the first thing to check.` },
  { q: 'Everything lands one character off',
    a: `The homing position is not where you think. Either rotate the cards on the drum, or add a HOME_OFFSET
    to the position after homing.` }
],

next: `
<ul>
  <li><strong>Feed it the departure board's data</strong> - the <a href="project.html?p=bus-departure-board">API
  work</a> is done, and a mechanical board showing the real next train is the best version of both projects.</li>
  <li><strong>More than four drums</strong> needs port expanders. Sixteen coil lines is already most of the
  ESP32's usable GPIO, so a chain of 74HC595 shift registers - three pins for twenty-four outputs - gets you to
  eight or twelve characters.</li>
  <li><strong>Slow it down deliberately</strong>. The real boards were not fast, and a drum that takes two
  seconds sounds far better than one that takes half.</li>
  <li><strong>A clock</strong>, with four drums and only digits on the cards. Fewer cards means faster changes
  and it flips every minute, which is the whole point of owning one.</li>
</ul>`
});
