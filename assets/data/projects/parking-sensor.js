/* Garage parking sensor: HC-SR04, three LEDs and a buzzer. No soldering. */
AB.addProject({
slug: 'parking-sensor',
title: 'Garage parking sensor',
cat: 'robotics',
level: 1,
time: '40 minutes',
solder: false,
board: 'Uno',
tags: ['hc-sr04', 'ultrasonic', 'leds', 'buzzer', 'no soldering', 'first project', 'garage'],
blurb: 'Green, amber, red and a beep that gets faster as you get closer. Stops you putting the bumper through the back wall, and it is your first useful build.',

skills: ['Ultrasonic ranging', 'Mapping a range to behaviour', 'Median filtering', 'Non-blocking beeps', 'Calibration'],

intro: `
<p>The commercial ones cost forty pounds and are the same three parts. This is a genuinely useful object you
can build in an evening with no soldering at all, and it teaches the single most reusable skill in this hobby:
turning a messy continuous measurement into a clean decision.</p>
<p>It is also the project where you learn that a cheap sensor lies occasionally, and what to do about it -
which comes back in the robot, the water tank monitor and everything else that measures the world.</p>`,

what: [
  'Measure the distance to your car ten times a second.',
  'Show green when you have room, amber as you approach, and red at your stopping point.',
  'Beep slowly at amber, faster as you close, and hold a solid tone when you should stop.',
  'Ignore the occasional bad reading instead of flashing red at nothing.',
  'Go quiet and dark when nothing has moved for a minute, so it is not beeping at an empty garage.'
],

how: `
<p>The <strong>HC-SR04</strong> has two cylinders: one is a 40&nbsp;kHz speaker, the other a microphone. You
pulse the TRIG pin high for 10&nbsp;microseconds; it emits a short burst and then holds ECHO high for exactly
as long as the sound takes to come back.</p>
<p>Sound travels about 343&nbsp;metres per second, so 1&nbsp;cm takes 29&nbsp;microseconds - and the sound
makes the trip <em>twice</em>, out and back. So <strong>distance in cm = microseconds / 58</strong>. That is
the whole calculation, and it is why you see 58 in every ultrasonic sketch ever written.</p>
<p>The sensor's weaknesses matter here. Its beam is a cone of roughly 15&nbsp;degrees, so it reports the nearest
thing anywhere in that cone - a wheelie bin at the side counts. Soft or angled surfaces bounce the sound away
and read as "nothing there". And roughly one reading in fifty comes back wrong for no reason at all.</p>
<p>The fix for that last one is a <strong>median filter</strong>: take three readings, sort them, use the
middle one. A single bad reading can never be the middle of three, so it is thrown away automatically. Three
lines of code, and it is the difference between a stable display and one that flickers red at random.</p>`,

bom: [
  { id: 'uno', qty: 1, note: 'A Nano is smaller and cheaper if you have one - the pins are named the same.' },
  { id: 'hcsr04', qty: 1 },
  { id: 'led5', qty: 3, note: 'One green, one yellow, one red. Buy an assortment - you will use them forever.' },
  { id: 'res220', qty: 3, note: 'One per LED. 220 ohm is the everyday default.' },
  { id: 'buzzer', qty: 1, note: 'Passive, so the sketch can change the pitch. An active buzzer plays one fixed note.' },
  { id: 'bb-830', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'psu5v3a', qty: 1, own: true, note: 'Any USB phone charger. It draws under 60 mA.' },
  { id: 'box-abs', qty: 1, note: 'Optional. A cardboard box works for the first month and often forever.' }
],

tools: [],

build: {
  parts: [
    { id: 'uno', comp: 'uno',    at: [0, 84] },
    { id: 'bb',  comp: 'bb830',  at: [0, 0] },
    { id: 'son', comp: 'hcsr04', at: [-34, -58], ry: 180 },
    { id: 'lg',  comp: 'led5',   at: [20, -54], opt: { c: '#3fbf6a' } },
    { id: 'ly',  comp: 'led5',   at: [32, -54], opt: { c: '#e0c030' } },
    { id: 'lr',  comp: 'led5',   at: [44, -54], opt: { c: '#e0483c' } },
    { id: 'buz', comp: 'buzzer', at: [66, -52] }
  ],
  wires: [
    { from: 'uno.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V onto the lower red rail' },
    { from: 'uno.GND1', to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+10',  to: 'bb.T+10', color: 'red',    note: 'Bridge: the top and bottom red rails are separate strips' },
    { from: 'bb.B-10',  to: 'bb.T-10', color: 'black',  note: 'Bridge for the blue rails, same reason' },
    { from: 'son.VCC',  to: 'bb.T+3',  color: 'red',    note: 'Sensor power' },
    { from: 'son.GND',  to: 'bb.T-3',  color: 'black',  note: 'Sensor ground' },
    { from: 'son.TRIG', to: 'uno.D9',  color: 'yellow', note: 'Arduino tells the sensor to send a ping' },
    { from: 'son.ECHO', to: 'uno.D10', color: 'white',  note: 'Sensor tells the Arduino how long the echo took' },
    { from: 'lg.A',     to: 'uno.D4',  color: 'green',  note: 'Green LED, through a 220 ohm resistor' },
    { from: 'lg.K',     to: 'bb.T-16', color: 'black',  note: 'Green LED short leg to ground' },
    { from: 'ly.A',     to: 'uno.D5',  color: 'yellow', note: 'Amber LED, through a 220 ohm resistor' },
    { from: 'ly.K',     to: 'bb.T-19', color: 'black',  note: 'Amber LED short leg to ground' },
    { from: 'lr.A',     to: 'uno.D6',  color: 'red',    note: 'Red LED, through a 220 ohm resistor' },
    { from: 'lr.K',     to: 'bb.T-22', color: 'black',  note: 'Red LED short leg to ground' },
    { from: 'buz.+',    to: 'uno.D8',  color: 'orange', note: 'Buzzer, on any digital pin' },
    { from: 'buz.-',    to: 'bb.T-26', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireIntro: `<p>Sixteen connections, none of them soldered. Do the four power wires first and check the board
lights up before you add anything else - that habit will save you hours on every project you ever build.</p>`,

wireNotes: `
<div class="note tip"><span class="t">How an LED and its resistor sit on a breadboard</span>
<p>Rows of five holes are joined <em>across</em> the board. So:</p>
<ul>
  <li>LED long leg (the anode) into one row, short leg into the next row.</li>
  <li>One end of the 220&nbsp;&Omega; resistor into the long leg's row, the other end into a free row.</li>
  <li>A jumper from that free row to the Arduino pin.</li>
  <li>A jumper from the short leg's row to the blue ground rail.</li>
</ul>
<p>An LED put in backwards simply does not light. It is not damaged, and this is by far the most common reason
a first project "does not work".</p></div>

<div class="note warn"><span class="t">The two bridge wires are not optional</span>
<p>A full-size breadboard has <strong>four</strong> power rails, not two: the pair along the top edge and the
pair along the bottom are separate strips of metal with no connection between them. Wire 5&nbsp;V to the
bottom, plug the sensor into the top, and nothing powers up.</p></div>

<div class="note"><span class="t">Passive buzzer, not active</span>
<p>The sketch changes the pitch as you get closer, and only a passive buzzer can do that. An active one has its
own oscillator inside and plays one fixed note no matter what you send it. If yours has a sticker on top, peel
it off - that is just a manufacturing seal.</p></div>`,

solderIntro: `<p>This build needs no soldering. The steps below are for when it has lived on your garage wall
for a month and you want it to stop falling apart - which is the right moment to learn, because by then you
know it works.</p>`,

solderSteps: [
  { h: 'Optional: move it onto perfboard',
    body: `<p>Buy a 5&times;7&nbsp;cm perfboard and a strip of female header. Cut a 4-pin length for the sensor
    by scoring between the pins with a craft knife and snapping it - that becomes a socket, so the sensor stays
    removable.</p>` },
  { h: 'Tack one pin at each end first',
    body: `<p>Push the header through from the top and turn the board over; its own weight holds it in place.
    Heat the pad <em>and</em> the pin together with the iron at 340&nbsp;&deg;C, count one second, feed in about
    2&nbsp;mm of solder, count one more, take the solder away, then the iron.</p>
    <p>Now look from the side: is the plastic flat against the board? If not, reheat one joint and press it
    down. Two joints are easy to fix; four are not.</p>` },
  { h: 'Then the middle pins',
    body: `<p>Same three seconds each. A finished joint looks like a small shiny volcano climbing a third of the
    way up the pin - not a ball sitting on top, which means the pad never got hot.</p>` },
  { h: 'LEDs with the resistor folded into the leg',
    body: `<p>Push the LED through, then bend one leg of the resistor down through the hole beside the long leg
    and solder both to the same pad. No patch wire needed. Trim the excess with flush cutters - wear the safety
    glasses, because clipped legs genuinely fly.</p>` },
  { h: 'A ground bus down one edge',
    body: `<p>All three LED short legs and the buzzer go to ground. Run one length of solid-core wire down the
    board and solder each to it, rather than running five separate wires back to the Arduino.</p>` },
  { h: 'Buzz it out before power',
    body: `<p>Multimeter on continuity. 5&nbsp;V to ground must be <strong>silent</strong>. Every ground point
    to the Arduino's GND must beep. Then plug it in.</p>` }
],

assembly: [
  { h: 'Power rails first, then stop',
    body: `<p>5&nbsp;V and ground onto the bottom rails, then the two bridges to the top rails. Plug in the USB
    cable. The Uno's green <span class="pin">ON</span> LED should light and nothing should get warm. Unplug.</p>
    <p>Four wires, thirty seconds. You have now proved your power distribution before anything is attached to
    it.</p>` },
  { h: 'Add the sensor on its own',
    body: `<p>Four wires. Upload the test sketch below and watch the Serial Monitor - you should see a distance
    that changes sensibly as you move your hand. Get this right before the LEDs exist.</p>` },
  { h: 'Add the three LEDs',
    body: `<p>Green, amber, red, left to right, each with its own 220&nbsp;&Omega; resistor. Long leg towards
    the resistor and the Arduino pin.</p>` },
  { h: 'Add the buzzer and upload the real sketch',
    body: `<p>Marked or longer leg to D8.</p>` },
  { h: 'Mount it and calibrate against the actual car',
    body: `<p>On the wall, at about bumper height, pointing squarely at where the car will be. Then park the car
    where you want it to stop and read the distance off the Serial Monitor - that number goes into
    <code>STOP_CM</code>. Everything else follows from it.</p>` }
],

libraries: [],

code: [
{
  h: 'First: check the sensor reads sensibly',
  name: 'distance_test.ino',
  code: `/* Prints the distance twice a second. Wave your hand at the sensor. */

#define TRIG_PIN  9
#define ECHO_PIN 10

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println(F("Move your hand in front of the sensor."));
}

void loop() {
  // A 10 microsecond pulse tells the sensor to send a ping.
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(3);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // ECHO stays high for as long as the sound takes to come back.
  // The 25 ms cap stops it waiting a whole second when nothing echoes.
  long us = pulseIn(ECHO_PIN, HIGH, 25000UL);

  if (us == 0) {
    Serial.println(F("nothing in range"));
  } else {
    Serial.print(us / 58);        // 58 us per cm, there and back
    Serial.println(F(" cm"));
  }

  delay(500);
}`,
  after: `<p>You should get stable readings from about 4&nbsp;cm out to a couple of metres. If it reads 0 or
  "nothing in range" constantly, TRIG and ECHO are almost certainly swapped.</p>`
},
{
  h: 'The parking sensor',
  name: 'parking_sensor.ino',
  code: `/* ------------------------------------------------------------------
   Garage parking sensor
   HC-SR04 on D9/D10, LEDs on D4/D5/D6, passive buzzer on D8.
   ------------------------------------------------------------------ */

// ---- pins ------------------------------------------------------------
#define TRIG_PIN   9
#define ECHO_PIN  10
#define LED_GREEN  4
#define LED_AMBER  5
#define LED_RED    6
#define BUZZER     8

// ---- set these to your garage ---------------------------------------
const int STOP_CM   = 30;    // where you want the bumper to end up
const int CLOSE_CM  = 80;    // amber from here in
const int FAR_CM    = 200;   // ignore anything further than this
const int TOO_CLOSE = 15;    // solid tone: you have gone too far

const unsigned long SLEEP_AFTER_MS = 60000UL;   // quiet if nothing moves
const int MOVED_CM = 8;                         // what counts as movement
// ----------------------------------------------------------------------

int lastDistance = 0;
unsigned long lastMovement = 0;
unsigned long lastBeep = 0;
bool beepOn = false;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_AMBER, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  selfTest();
  lastMovement = millis();
}

void loop() {
  int cm = distanceCm();

  // Has anything actually moved? If not, go quiet after a while.
  if (abs(cm - lastDistance) > MOVED_CM) lastMovement = millis();
  lastDistance = cm;

  bool asleep = (millis() - lastMovement > SLEEP_AFTER_MS);

  if (asleep || cm > FAR_CM) {
    allOff();
    noTone(BUZZER);
  } else if (cm <= TOO_CLOSE) {
    lights(false, false, true);
    tone(BUZZER, 1800);                  // solid: stop, you have overshot
  } else if (cm <= STOP_CM) {
    lights(false, false, true);
    beepAt(90);                          // urgent
  } else if (cm <= CLOSE_CM) {
    lights(false, true, false);
    // gap shrinks from 700 ms down to 120 ms as you approach
    int gap = map(cm, STOP_CM, CLOSE_CM, 120, 700);
    beepAt(gap);
  } else {
    lights(true, false, false);
    noTone(BUZZER);
    beepOn = false;
  }

  report(cm, asleep);
  delay(90);
}

/* --- distance, with a median filter -----------------------------------
   Three readings, sorted, take the middle. A single bad reading can
   never be the middle of three, so it is discarded automatically. */
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

  long us = pulseIn(ECHO_PIN, HIGH, 25000UL);
  delay(12);                    // the sensor needs a gap between pings
  if (us == 0) return 999;      // nothing came back
  return (int)(us / 58);
}

/* --- beeping without stopping everything ------------------------------
   delay() would freeze the sensor while the buzzer is on. Looking at
   the clock instead keeps the distance updating between beeps. */
void beepAt(int gapMs) {
  if (millis() - lastBeep < (unsigned long)gapMs) return;
  lastBeep = millis();
  beepOn = !beepOn;
  if (beepOn) tone(BUZZER, 2200);
  else        noTone(BUZZER);
}

/* --- lights ----------------------------------------------------------- */
void lights(bool g, bool a, bool r) {
  digitalWrite(LED_GREEN, g);
  digitalWrite(LED_AMBER, a);
  digitalWrite(LED_RED, r);
}

void allOff() { lights(false, false, false); }

void selfTest() {
  // Each LED in turn, then a chirp. Proves the wiring at every power-up.
  int pins[] = { LED_GREEN, LED_AMBER, LED_RED };
  for (int i = 0; i < 3; i++) {
    digitalWrite(pins[i], HIGH);
    delay(220);
    digitalWrite(pins[i], LOW);
  }
  tone(BUZZER, 2000, 90);
  delay(200);
  noTone(BUZZER);
}

void report(int cm, bool asleep) {
  static unsigned long last = 0;
  if (millis() - last < 400) return;
  last = millis();
  Serial.print(cm);
  Serial.print(F(" cm"));
  if (asleep) Serial.print(F("  (idle)"));
  Serial.println();
}`,
  after: `<p>Two ideas in there are worth carrying to every later project:</p>
  <ul>
    <li><strong>The self test.</strong> Three LEDs and a chirp at every power-up. It costs a second and tells
    you the wiring is intact before you trust the thing with your bumper.</li>
    <li><strong>Beeping with <code>millis()</code> instead of <code>delay()</code>.</strong> A
    <code>delay(200)</code> between beeps would stop the sensor reading for 200&nbsp;ms at a time - so as you
    got closer and the beeps got faster, the distance would update <em>less</em> often. Exactly backwards.</li>
  </ul>`
}],

upload: `
<ol>
  <li>Plug the Uno in. <strong>Tools &rarr; Board</strong> &rarr; Arduino Uno.</li>
  <li><strong>Tools &rarr; Port</strong> &rarr; the one that appears and disappears when you unplug the board.</li>
  <li>Press the arrow. The LEDs should sweep green-amber-red and chirp.</li>
  <li>Open the Serial Monitor at 9600 and wave your hand at the sensor.</li>
</ol>
<div class="note warn"><span class="t">No port listed?</span>
<p>Either a charge-only USB cable (try another - this is astonishingly common), or a clone that needs the CH340
driver installed. Search "CH340 driver" for your operating system.</p></div>`,

tune: [
  { h: 'Set STOP_CM from the actual car',
    body: `<p>Park it exactly where you want it, read the distance from the Serial Monitor, and put that number
    in <code>STOP_CM</code>. Everything else is relative to it.</p>
    <p>Do it with the car you park most often - a sensor calibrated on a hatchback will stop an estate a foot
    too late.</p>` },
  { h: 'Mount height and aim',
    body: `<p>Point it at the middle of the bumper, square on. A sensor aimed at an angle reads the distance
    along its own axis, which is longer than the straight-line distance, so you stop short.</p>
    <p>Bonnet height on a car, higher for a van. Avoid aiming at a number plate - flat and reflective is
    actually ideal, so that part is easy.</p>` },
  { h: 'If it flickers between colours',
    body: `<p>Something is in the beam cone at the edge - a bin, a bike, a shelf. The cone is about
    15&nbsp;degrees, so at 2&nbsp;m it is half a metre wide. Move the obstruction, or move the sensor.</p>` },
  { h: 'Beep speed',
    body: `<p>The <code>map(cm, STOP_CM, CLOSE_CM, 120, 700)</code> line. Lower numbers are faster. If you find
    it stressful, widen it to 200-900; if you want it more urgent, 80-400.</p>` },
  { h: 'Turn the noise off entirely',
    body: `<p>Comment out the <code>tone()</code> calls and keep the lights. In a garage attached to a house at
    11&nbsp;pm this is often the right answer, and the LEDs alone work perfectly well.</p>` }
],

trouble: [
  { q: 'Always reads 999 or "nothing in range"',
    a: `TRIG and ECHO swapped - that is the answer nine times out of ten. Otherwise the sensor has no
    5&nbsp;V: measure between its VCC and GND pins.` },
  { q: 'Always reads 0',
    a: `<code>pulseIn</code> returned immediately, which usually means ECHO is not connected to anything.` },
  { q: 'Readings jump between sensible and huge',
    a: `The median filter handles the occasional bad one. If it is jumping constantly, the sensor is seeing
    something soft or angled - a curtain, a car cover, a wall at 45 degrees - which bounces the sound away
    instead of back.` },
  { q: 'An LED never lights',
    a: `It is in backwards. Long leg towards the resistor and the Arduino pin, short leg to ground. Flip it -
    it is not damaged.` },
  { q: 'All three LEDs are dim',
    a: `You have used one shared resistor on the ground rail instead of one per LED. They are dividing the
    current between them.` },
  { q: 'Buzzer clicks instead of beeping',
    a: `It is an active buzzer. Active ones ignore <code>tone()</code> and play one fixed note. You need a
    passive one.` },
  { q: 'It beeps at an empty garage',
    a: `Something is in the beam at under <code>FAR_CM</code>. Either reduce <code>FAR_CM</code>, or re-aim.
    The idle timeout will silence it after a minute regardless.` },
  { q: 'Works on the bench, wrong distances in the garage',
    a: `Sound speed changes with temperature - about 0.6&nbsp;% per degree. Between a warm room and a cold
    garage that is a couple of centimetres at 2&nbsp;m. Calibrate in the garage, not indoors.` }
],

next: `
<ul>
  <li><strong>Add a second sensor</strong> for the side of the car, or for a second parking space.</li>
  <li><strong>Swap the LEDs for a strip</strong> - a WS2812B bar that fills up as you approach is much easier
  to read at a glance. See the <a href="project.html?p=ambient-tv-backlight">backlight project</a>.</li>
  <li><strong>Use the same code to measure a water tank</strong>: point it down from the lid and the distance
  to the surface tells you how full it is.</li>
  <li><strong>Put it on a robot</strong> - the <a href="project.html?p=obstacle-avoiding-robot">obstacle
  avoider</a> uses this exact sensor and the same median filter.</li>
</ul>`
});
