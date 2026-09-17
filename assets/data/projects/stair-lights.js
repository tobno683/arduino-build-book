/* Lighting stairs in the dark without waking anyone. Direction matters. */
AB.addProject({
slug: 'stair-lights',
title: 'Stair lights that follow you up',
cat: 'light',
level: 2,
time: '6 hours',
solder: true,
board: 'ESP32',
tags: ['stairs', 'ws2812', 'pir', 'tof', 'direction', 'animation', 'night light', 'esp32'],
blurb: 'Steps light one after another as you climb, and go out behind you. It works out which way you are going from two sensors, which is the only part of this with any real thinking in it.',

skills: ['Direction detection from two sensors', 'Non-blocking animation', 'Sensor placement', 'Ambient light gating', 'Long LED runs', 'Designing around false triggers'],

intro: `
<p>Stairs in the dark are where people fall. A light at the top and bottom solves it, and nobody uses them
because the switch is at the wrong end and turning on a landing light at 3 am wakes the house.</p>
<p>So: a sensor at each end, a strip on each step, and a cascade that follows you. Dim enough not to wake
anybody, bright enough to see the edge of every tread.</p>
<p>The interesting problem is direction. One sensor tells you somebody is there. Two tell you which way they
are going - but only if you handle the case where both fire, or the second never does because they stopped
halfway.</p>`,

what: [
  'Light each step in turn, in the direction of travel, then fade out behind.',
  'Work out direction from which sensor triggered first.',
  'Only run when it is actually dark, because doing this in daylight is pointless and annoying.',
  'Handle the awkward cases - two people, someone stopping, someone turning round.',
  'Be dim enough at night not to wake anybody, and brighter in the evening.'
],

how: `
<p><strong>Direction from two sensors is a small state machine.</strong> Bottom fires first, then top: going
up. Top first: going down. That is the easy case and it is the only one most tutorials handle.</p>
<p>The cases that actually happen:</p>
<ul>
  <li><strong>Someone stops halfway.</strong> The second sensor never fires. You need a timeout that ends the
  animation and fades out gracefully rather than leaving the stairs lit all night.</li>
  <li><strong>Someone turns round.</strong> The same sensor fires twice with no crossing. Treat a repeat of the
  entry sensor as a cancel.</li>
  <li><strong>Two people, opposite directions.</strong> Both sensors fire nearly together. There is no correct
  answer here - light everything, and stop trying to be clever.</li>
</ul>

<p><strong>PIR is the wrong sensor at the top of stairs.</strong> A PIR has a wide cone and a slow recovery.
On a landing it sees you moving anywhere in the room, so it fires while you are still brushing your teeth. It
also cannot tell how far away you are.</p>
<p>A time-of-flight sensor across the stairwell is much better: a narrow beam, a definite range, and it either
sees something in the beam or it does not. Mount it across the top and bottom step so it breaks when a foot
lands there.</p>
<p>PIR is fine at the bottom of an enclosed staircase where there is nowhere else to be.</p>

<p><strong>Animation must not block.</strong> A cascade with <code>delay()</code> between steps means the board
is deaf during the animation - so it misses the second sensor and cannot handle anything. Drive it from
<code>millis()</code> with a per-step start time, and the loop stays responsive throughout.</p>

<p><strong>One long strip, addressed in groups.</strong> Wiring each step separately means fourteen cables to
the controller. A single strip run up the side of the staircase, with the LEDs on each tread treated as a
group, needs one data wire and one power pair.</p>
<p>The complication is voltage drop. Fourteen steps is maybe five metres, and 5&nbsp;V strips lose enough over
that distance for the top to be noticeably dim and pink. Either inject power at both ends, or use a 12&nbsp;V
addressable strip, which drops proportionally far less.</p>

<p><strong>Ambient light gating is what makes it liveable.</strong> Running in daylight is pointless and makes
the house feel haunted. An LDR that disables everything above a threshold costs almost nothing, and a second
threshold that dims it further after midnight is what stops it being too bright at 3 am.</p>`,

bom: [
  { id: 'ws2812-strip', qty: 3, note: 'Three metres of 60/m covers about fourteen steps. See the notes on voltage drop before deciding where to feed it.' },
  { id: 'esp32', qty: 1 },
  { id: 'vl53l0x', qty: 2, note: 'One at each end. Narrow beam and a definite range, which a PIR gives you neither of.' },
  { id: 'ldr', qty: 1, note: 'Ambient light gating. This is the part that makes it liveable rather than irritating.' },
  { id: 'res10k', qty: 1, note: 'LDR divider.' },
  { id: 'res220', qty: 1, note: 'LED data line.' },
  { id: 'cap1000', qty: 2, note: 'One at each power injection point.' },
  { id: 'psu5v3a', qty: 1, note: 'Even dim, three metres of strip wants a real supply. At full white it would want far more - which is a reason to keep it dim.' },
  { id: 'diffuser', qty: 1, note: 'Aluminium channel with a diffuser is what makes this look built-in rather than stuck on.' },
  { id: 'box-abs', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',   comp: 'esp32',      at: [0, 70] },
    { id: 'bb',    comp: 'bb400',      at: [0, 6] },
    { id: 'tof1',  comp: 'vl53l0x',    at: [-62, -48] },
    { id: 'tof2',  comp: 'vl53l0x',    at: [-16, -48] },
    { id: 'strip', comp: 'ws2812strip',at: [30, -62] },
    { id: 'ldr',   comp: 'ldr',        at: [62, -20] }
  ],
  wires: [
    { from: 'mcu.VIN',   to: 'bb.T+1',  color: 'red',    note: '5 V from the supply' },
    { from: 'mcu.GND',   to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'tof1.VIN',  to: 'bb.T+5',  color: 'red',    note: 'Bottom sensor power' },
    { from: 'tof1.GND',  to: 'bb.T-5',  color: 'black',  note: 'Bottom sensor ground' },
    { from: 'tof1.SDA',  to: 'mcu.D21', color: 'green',  note: 'I2C data - shared' },
    { from: 'tof1.SCL',  to: 'mcu.D22', color: 'blue',   note: 'I2C clock - shared' },
    { from: 'tof1.XSHUT',to: 'mcu.D16', color: 'white',  note: 'Shutdown - used to give this sensor a different address at boot' },
    { from: 'tof2.VIN',  to: 'bb.T+11', color: 'red',    note: 'Top sensor power' },
    { from: 'tof2.GND',  to: 'bb.T-11', color: 'black',  note: 'Top sensor ground' },
    { from: 'tof2.SDA',  to: 'mcu.D21', color: 'green',  note: 'Same I2C bus' },
    { from: 'tof2.SCL',  to: 'mcu.D22', color: 'blue',   note: 'Same clock' },
    { from: 'tof2.XSHUT',to: 'mcu.D17', color: 'white',  note: 'Shutdown for the second sensor' },
    { from: 'strip.5V',  to: 'bb.T+18', color: 'red',    note: 'Strip power, with a 1000 uF here' },
    { from: 'strip.GND', to: 'bb.T-18', color: 'black',  note: 'Strip ground' },
    { from: 'strip.DIN', to: 'bb.e24',  color: 'green',  note: 'Data through the 220 ohm resistor' },
    { from: 'bb.a24',    to: 'mcu.D25', color: 'green',  note: 'Resistor to the ESP32' },
    { from: 'ldr.A',     to: 'bb.T+28', color: 'red',    note: 'LDR to 5 V' },
    { from: 'ldr.B',     to: 'mcu.D34', color: 'yellow', note: 'LDR junction to an ADC pin' },
    { from: 'bb.e28',    to: 'bb.T-28', color: 'black',  note: '10 k from the junction to ground' }
  ]
},

wireIntro: `<p>Two sensors on one I2C bus, one data line to the strip, and a light sensor. The only subtlety is
that both VL53L0X modules power up at the same I2C address and have to be told apart.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Two VL53L0X sensors need the XSHUT dance</span>
<p>Every VL53L0X wakes at address 0x29. Two on one bus is a direct conflict.</p>
<p>The fix: hold both in shutdown via XSHUT, release one, change its address in software, then release the
other. The library supports this and the sketch does it in <code>setup()</code>. It must happen every boot,
because the address change is not persistent.</p></div>

<div class="note warn"><span class="t">Voltage drop over five metres</span>
<p>A 5&nbsp;V strip loses enough over three metres that the far end is visibly dimmer and pink - the red LEDs
need the least voltage so they survive longest.</p>
<p>Inject power at both ends of the run, or at the middle. A 12&nbsp;V addressable strip drops proportionally
far less and is worth considering for a long staircase.</p></div>

<div class="note tip"><span class="t">Sensor placement is most of the reliability</span>
<p>Aim the beam across the tread, a few centimetres above it, so it breaks when a foot lands. Aimed along the
stairs it sees the far wall and triggers on anything in the hall.</p>
<p>Check what is behind the beam. A ToF sensor pointed at a dark carpet at an angle sometimes gets no return at
all and reads as maximum range.</p></div>`,

solderIntro: `<p>The soldering is simple. The installation is the work - running a strip neatly up a staircase
without it looking like a cable is what takes the time.</p>`,

solderSteps: [
  { h: 'Bench-test the whole thing before installing any of it',
    body: `<p>Get the two sensors addressing correctly, the cascade running in both directions, and the
    timeouts working, all on a table. Debugging a state machine while lying on a staircase is unpleasant.</p>` },
  { h: 'Power injection points',
    body: `<p>Solder a second power pair to the far end of the strip and run it back to the supply, separate
    from the data. Doing this now is far easier than after the strip is in a channel.</p>` },
  { h: 'Strip into the aluminium channel',
    body: `<p>The channel is what makes this look deliberate. Cut to length, strip in, diffuser clipped on,
    then mounted along the side of the staircase under the nosing so the LEDs are not directly visible.</p>
    <p>Seeing the light and not the source is the whole aesthetic.</p>` },
  { h: 'Sensors last, and adjust them in the dark',
    body: `<p>Mount roughly, then walk the stairs a dozen times at night adjusting angle until it triggers
    reliably on a foot and never on someone walking past the bottom.</p>` },
  { h: 'Set the ambient threshold from real readings',
    body: `<p>Print the LDR value at various times of day and pick a threshold from what you actually see. A
    guessed number is either always on or never on.</p>` }
],

libraries: [
  { name: 'Adafruit VL53L0X', by: 'Adafruit', why: 'Ranging, including the address-change support two sensors need.' },
  { name: 'Adafruit NeoPixel', by: 'Adafruit', why: 'The strip.' }
],

code: [{
  name: 'stair_lights.ino',
  code: `/* ------------------------------------------------------------------
   Stair lights that follow you - ESP32

   Two VL53L0X sensors give direction; a non-blocking cascade animates.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_VL53L0X.h>
#include <Adafruit_NeoPixel.h>

#define LED_PIN     25
#define XSHUT_BOT   16
#define XSHUT_TOP   17
#define LDR_PIN     34

#define STEPS       14
#define LEDS_PER    12
#define N_LEDS      (STEPS * LEDS_PER)

#define TRIGGER_MM  600        // something in the beam this close counts
#define STEP_MS     120        // how fast the cascade climbs
#define HOLD_MS     8000       // lit time if the far sensor never fires

Adafruit_VL53L0X bottom, top;
Adafruit_NeoPixel strip(N_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

enum Mode { IDLE, GOING_UP, GOING_DOWN, ALL_ON, FADING };
Mode mode = IDLE;
unsigned long modeStart = 0;
uint8_t level = 40;

void setup() {
  Serial.begin(115200);
  strip.begin();
  strip.clear();
  strip.show();

  /* Both sensors boot at 0x29, so they must be separated. Hold both in
     shutdown, bring up one, move it, then bring up the other. This has to
     happen every boot - the new address is not persistent. */
  pinMode(XSHUT_BOT, OUTPUT);
  pinMode(XSHUT_TOP, OUTPUT);
  digitalWrite(XSHUT_BOT, LOW);
  digitalWrite(XSHUT_TOP, LOW);
  delay(20);

  digitalWrite(XSHUT_BOT, HIGH);
  delay(20);
  if (!bottom.begin(0x30)) Serial.println("bottom sensor failed");

  digitalWrite(XSHUT_TOP, HIGH);
  delay(20);
  if (!top.begin(0x31)) Serial.println("top sensor failed");
}

void loop() {
  int ambient = analogRead(LDR_PIN);

  // Pointless and irritating in daylight. Dimmer after midnight.
  if (ambient > 1800 && mode == IDLE) { delay(200); return; }
  level = (ambient < 300) ? 18 : 60;

  bool bot = seesSomething(bottom);
  bool tp  = seesSomething(top);

  switch (mode) {
    case IDLE:
      if (bot && tp)      setMode(ALL_ON);      // two people, do not guess
      else if (bot)       setMode(GOING_UP);
      else if (tp)        setMode(GOING_DOWN);
      break;

    case GOING_UP:
      animate(true);
      // Reached the top: hold briefly, then fade.
      if (tp) setMode(FADING);
      // Or they stopped halfway and the far sensor never fires.
      if (millis() - modeStart > HOLD_MS) setMode(FADING);
      // Or they turned round - same sensor again with no crossing.
      if (bot && millis() - modeStart > 1500) setMode(FADING);
      break;

    case GOING_DOWN:
      animate(false);
      if (bot) setMode(FADING);
      if (millis() - modeStart > HOLD_MS) setMode(FADING);
      if (tp && millis() - modeStart > 1500) setMode(FADING);
      break;

    case ALL_ON:
      fillAll(level);
      if (millis() - modeStart > HOLD_MS) setMode(FADING);
      break;

    case FADING:
      if (!fadeOut()) setMode(IDLE);
      break;
  }
  delay(20);
}

void setMode(Mode m) { mode = m; modeStart = millis(); }

bool seesSomething(Adafruit_VL53L0X &s) {
  VL53L0X_RangingMeasurementData_t m;
  s.rangingTest(&m, false);
  // Status 4 is "no valid return", which is not the same as "nothing
  // there" - a dark carpet at an angle gives no return at all.
  return (m.RangeStatus != 4) && (m.RangeMilliMeter < TRIGGER_MM);
}

/* Non-blocking cascade. Using delay() between steps would make the board
   deaf for the whole animation, so it would miss the far sensor and never
   handle anything. */
void animate(bool upwards) {
  unsigned long elapsed = millis() - modeStart;
  int reached = elapsed / STEP_MS;

  for (int s = 0; s < STEPS; s++) {
    int idx = upwards ? s : (STEPS - 1 - s);
    uint8_t v = (s <= reached) ? level : 0;
    setStep(idx, v);
  }
  strip.show();
}

void setStep(int step, uint8_t v) {
  // Warm white: full red, less green, little blue. Cold white at 3 am is
  // unpleasant and wakes you properly.
  for (int i = 0; i < LEDS_PER; i++) {
    strip.setPixelColor(step * LEDS_PER + i, v, v * 0.7, v * 0.35);
  }
}

void fillAll(uint8_t v) {
  for (int s = 0; s < STEPS; s++) setStep(s, v);
  strip.show();
}

bool fadeOut() {
  static uint8_t v = 0;
  if (millis() - modeStart < 50) v = level;
  if (v == 0) return false;
  v = (v > 2) ? v - 2 : 0;
  fillAll(v);
  delay(30);
  return true;
}`
}],

trouble: [
  { q: 'Only one sensor is found',
    a: `The XSHUT sequence is not working. Both boot at 0x29, so one must be held in shutdown while the other
    is readdressed. Check the XSHUT pins are actually connected - some breakouts have them pulled high.` },
  { q: 'It triggers when someone walks past the bottom of the stairs',
    a: `The beam is aimed along the hallway rather than across the tread. Aim it across, a few centimetres
    above the step.` },
  { q: 'It triggers constantly at night',
    a: `The sensor sees no return from a dark carpet and reports maximum range with status 4 - the sketch
    checks for that, so confirm you have not removed the status test.` },
  { q: 'The top of the strip is dim and pink',
    a: `Voltage drop. Inject power at the far end, or move to a 12&nbsp;V addressable strip.` },
  { q: 'The animation stutters',
    a: `Something is blocking - usually a <code>delay()</code> that crept in, or a ranging call that is waiting
    for a timeout. Keep the loop fast.` },
  { q: 'The lights stay on after somebody stops halfway',
    a: `That is what <code>HOLD_MS</code> is for. If it still happens, the far sensor is triggering
    spuriously and restarting the timer.` },
  { q: 'It never turns on at night',
    a: `The ambient threshold is wrong for your LDR and divider. Print the raw value in the dark and pick a
    number from that rather than using the one in the sketch.` },
  { q: 'Too bright at 3 am',
    a: `Lower the night level. 18 out of 255 sounds like nothing and is plenty on a dark staircase - the whole
    point is seeing the treads without waking up properly.` }
],

safety: `
<div class="note warn"><span class="t">It is a staircase</span>
<p>Anything fitted to stairs must not become a trip hazard or reduce the usable width of the tread. Keep the
channel under the nosing or against the stringer, and run cables where nobody can catch a foot.</p>
<p>Make sure the stairs are still safe with the system dead. A light that fails off must leave a staircase no
worse than it was before you started - so do not remove or disable the existing landing light.</p>
<p>If you are fitting this in a rented or shared building, check what is allowed before drilling anything.</p></div>`,

next: `
<ul>
  <li><strong>A third sensor on the landing</strong>, so it can distinguish someone arriving at the top from
  someone walking past it.</li>
  <li><strong>Pressure mats instead of ToF</strong> if the geometry is awkward. Much more definite, and much
  more work to install.</li>
  <li><strong>Tie it into the house</strong> over MQTT so it lights automatically when the front door opens
  after dark - see the <a href="project.html?p=door-window-sensor">door sensor</a>.</li>
  <li><strong>Slow the cascade right down</strong> and use it as a night light on a timer. Dim amber on the
  bottom two steps all night is a small thing that gets used constantly.</li>
</ul>`
});
