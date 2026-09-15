/* PIR + MOSFET driving a 12 V LED strip, with an ambient-light cutoff. */
AB.addProject({
slug: 'motion-activated-lights',
title: 'Motion-activated cupboard light',
cat: 'smart-home',
level: 2,
time: '90 minutes',
solder: true,
board: 'Nano',
tags: ['pir', 'mosfet', 'led strip', 'ldr', 'nano', 'fade', 'under-cabinet'],
blurb: 'Walk up, the light fades on. Walk away, it fades off. Stays off in daylight. The most genuinely useful hour of soldering in this book.',

skills: ['MOSFET switching', 'PWM fading', 'PIR sensors', 'Light thresholds', 'Non-blocking timers'],

intro: `
<p>Under a kitchen cabinet, inside a wardrobe, down a hallway at 3&nbsp;am, at the top of the stairs: this is the
project people actually keep. It is cheap, it is safe - nothing here touches mains - and the fade makes it feel
far more expensive than it is.</p>
<p>It is also the cleanest possible introduction to switching real current with a MOSFET, which is the
technique behind half the remaining projects on this site.</p>`,

what: [
  'Fade a 12 V LED strip up over about half a second when the PIR sees movement.',
  'Hold it on while there is still movement, then fade out after a settable delay.',
  'Stay off entirely when the room is already bright, so it does not waste power in daylight.',
  'Draw almost nothing while idle.'
],

how: `
<p>An LED strip at 12&nbsp;V and half an amp is 250 times what an Arduino pin can supply, so the pin does not
power it - it <em>controls</em> something that does.</p>
<p>A <strong>MOSFET</strong> is a voltage-controlled switch with three legs: gate, drain and source. Put a
voltage on the gate and current flows from drain to source; the gate itself draws essentially no current at
all, which is why a 20&nbsp;mA pin can control a 20&nbsp;A device. We wire it as a <em>low-side switch</em>:
the strip's positive goes straight to +12&nbsp;V, its negative goes to the MOSFET's drain, and the source goes
to ground. The MOSFET completes or breaks the return path.</p>
<p>The <strong>"logic level"</strong> in IRLZ44N is the part that matters. An ordinary IRF540 needs about
10&nbsp;V on its gate to turn fully on; give it 5&nbsp;V and it turns partly on, drops a couple of volts across
itself, and converts the difference into heat. The IRLZ44N is designed to be fully on at 5&nbsp;V. Buying the
wrong one is the single most common failure of this build.</p>
<p>The <strong>fade</strong> is PWM: <code>analogWrite()</code> switches the gate on and off at about
490&nbsp;Hz, and the strip averages it. Walking the value from 0 to 255 over half a second is the whole
effect.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'A Nano is the right size. An Uno works identically if you have one.' },
  { id: 'pir', qty: 1, note: 'HC-SR501. Set the jumper to H and the delay pot to minimum - the sketch does the timing.' },
  { id: 'mosfet', qty: 1, note: 'IRLZ44N. Logic level. An IRF540 will get hot and work badly.' },
  { id: 'res10k', qty: 1, note: 'Gate pull-down, so the light cannot glow while the board boots.' },
  { id: 'res220', qty: 1, note: 'In series with the gate, to tame the switching edge.' },
  { id: 'ldr', qty: 1 },
  { id: 'res10k', qty: 1, as: '10 k resistor (LDR divider)' },
  { id: 'ledstrip12v', qty: 1, note: 'Single colour, NOT addressable - this project switches the whole strip at once.' },
  { id: 'psu12v2a', qty: 1, note: 'Size it for your strip: a 60 LED/m warm white strip is about 0.5 A per metre.' },
  { id: 'perfboard', qty: 1 },
  { id: 'screwterm', qty: 2 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'box-abs', qty: 1 }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',        at: [0, 0] },
    { id: 'pir',  comp: 'pir',         at: [-44, -52], ry: 180 },
    { id: 'q1',   comp: 'mosfet',      at: [36, -44] },
    { id: 'ldr',  comp: 'ldr',         at: [4, -46] },
    { id: 'strip', comp: 'ws2812strip', at: [0, -100], opt: { n: 10 }, label: '12 V LED strip' }
  ],
  wires: [
    { from: 'pir.VCC',   to: 'nano.5V',   color: 'red',    note: 'PIR power' },
    { from: 'pir.GND',   to: 'nano.GND',  color: 'black',  note: 'PIR ground' },
    { from: 'pir.OUT',   to: 'nano.D2',   color: 'blue',   note: 'Goes HIGH on movement' },
    { from: 'ldr.A',     to: 'nano.5V',   color: 'red',    note: 'LDR to 5 V, forming the top of a divider' },
    { from: 'ldr.B',     to: 'nano.A0',   color: 'yellow', note: 'Junction of the LDR and the 10 k resistor' },
    { from: 'q1.G',      to: 'nano.D9',   color: 'orange', note: 'Gate, through a 220 ohm resistor. D9 is a PWM pin' },
    { from: 'q1.S',      to: 'nano.GND2', color: 'black',  note: 'Source to ground - and this must be the SAME ground as the 12 V supply' },
    { from: 'q1.D',      to: 'strip.GND', color: 'brown',  note: 'Drain to the strip negative. The MOSFET breaks the return path' },
    { from: 'strip.5V',  to: 'nano.VIN',  color: 'red',    note: '+12 V feeds both the strip and the Nano VIN pin' }
  ]
},

wireIntro: `<p>Nine connections. The MOSFET is the only part that needs thinking about, and the thing to hold
on to is that it sits in the <em>negative</em> side of the strip, not the positive.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Which leg is which on a TO-220</span>
<p>Hold the IRLZ44N with the metal tab away from you and the legs pointing down. Left to right the pins are
<strong>Gate, Drain, Source</strong>. The drain is also connected to the metal tab - so if you bolt it to
anything metal, that metal is at the strip's negative potential.</p></div>

<div class="note warn"><span class="t">The 10 k gate pull-down is not optional</span>
<p>Between the gate and ground. While the Nano is booting, D9 is an undriven input and the gate floats - and a
floating gate on a MOSFET holds whatever charge it last had, so the strip flickers or glows at every power-up.
The pull-down drags it to a definite off.</p>
<p>The 220&nbsp;&Omega; in series with the gate limits the current spike into the gate capacitance at each
switching edge. The circuit works without it; it just puts a nasty little spike on your 5&nbsp;V rail
490 times a second.</p></div>

<div class="note danger"><span class="t">One ground, shared</span>
<p>The 12&nbsp;V supply's negative, the MOSFET's source and the Nano's GND must all be the same point. If the
grounds are separate, the "5&nbsp;V" the Nano puts on the gate is measured against a different zero and the
MOSFET does something unpredictable. Common ground, always.</p></div>

<div class="note tip"><span class="t">Powering the Nano from the same 12 V</span>
<p>The Nano's VIN pin takes 7-12&nbsp;V and feeds its onboard regulator, so one supply runs everything. That
regulator is linear and drops the difference as heat - at 12&nbsp;V in and 20&nbsp;mA drawn it is only about
0.15&nbsp;W, which is fine. Do not also plug in USB at the same time.</p></div>`,

solderSteps: [
  { h: 'Female sockets for the Nano',
    body: `<p>Two 15-pin strips. Use the Nano itself as a spacing jig: push the headers onto its pins, drop the
    whole assembly into the perfboard, solder one corner pin of each strip, then pull the Nano out before doing
    the rest. Tack, check square from the side, complete.</p>` },
  { h: 'The MOSFET, with room around it',
    body: `<p>Push the three legs through and bend the tab back so it lies flat, or leave it upright with space
    for a heatsink. Solder all three legs generously - this is the one part carrying real current.</p>
    <p>At half an amp an IRLZ44N dissipates a tiny fraction of a watt and needs no heatsink. Above about
    3&nbsp;A, fit one.</p>` },
  { h: 'Gate resistor and pull-down, right at the MOSFET',
    body: `<p>The 220&nbsp;&Omega; goes between the Nano's D9 pin and the gate leg. The 10&nbsp;k goes from the
    gate leg to the ground rail. Keep both close to the MOSFET rather than close to the Nano - it is the gate
    that needs protecting from stray charge.</p>
    <p>Bend one resistor lead through the adjacent hole and solder to the same pad as the gate. No patch wire
    needed.</p>` },
  { h: 'The LDR divider',
    body: `<p>LDR from the 5&nbsp;V rail to a spare hole; the 10&nbsp;k from that same hole to ground; a wire
    from that hole to A0. The LDR has no polarity, so either way round is fine.</p>
    <p>Mount the LDR so it faces the room, not the strip. An LDR that can see the light it is controlling
    creates an oscillator: on, bright, off, dark, on. It is funny once.</p>` },
  { h: 'Screw terminals for 12 V in and strip out',
    body: `<p>Two 2-pin blocks at the board edge, openings outward. Make these joints properly full - they carry
    all the current.</p>
    <p>Do not tin the wire ends that go into them. Solder creeps under the screw pressure and the terminal
    works loose over months.</p>` },
  { h: 'Buzz it out before power',
    body: `<p>Continuity: 12&nbsp;V terminal to GND - <strong>no beep</strong>. Gate to ground should read about
    10&nbsp;k on the resistance range, not zero. Source to the Nano's GND - beep.</p>
    <p>Then power up with the strip disconnected and check D9 does nothing alarming.</p>` },
  { h: 'Solder the strip leads',
    body: `<p>LED strip pads are large and the adhesive backing melts, so work fast: tin both pads first, tin
    both wire ends, then one second each to join. Red to +, black to -, marked on the strip itself.</p>
    <p>If you cut the strip, cut exactly on the printed line through the middle of the copper pads, or you will
    have half a pad to solder to.</p>` }
],

assembly: [
  { h: 'Breadboard it with just the PIR first',
    body: `<p>PIR to D2, and a <code>Serial.println(digitalRead(2))</code> in a loop. Wave at it. Nothing else
    should be connected until you can see it triggering reliably.</p>` },
  { h: 'Add the MOSFET and the strip, on the bench',
    body: `<p>Confirm the strip fades smoothly in both directions. If it steps or flickers, check the gate
    resistor and the pull-down.</p>` },
  { h: 'Calibrate the darkness threshold',
    body: `<p>Covered in calibration below - it takes two minutes and it is the difference between "clever" and
    "annoying".</p>` },
  { h: 'Mount the strip',
    body: `<p>Aluminium channel if you have it; the strip's own adhesive if not, cleaned with alcohol first.
    Point it at the work surface, not at your eyes, and hide the strip itself behind a lip.</p>` },
  { h: 'Mount the PIR where it sees an approach, not a room',
    body: `<p>PIRs detect movement <em>across</em> their field far better than movement towards them. Mounted
    pointing straight down a corridor, a person walking at you triggers it late; angled across the approach, it
    catches them immediately.</p>
    <p>The dome must not be behind glass or clear plastic - both block the infrared it needs.</p>` }
],

libraries: [],

code: [{
  name: 'motion_light.ino',
  intro: `<p>No libraries at all. Four settings at the top.</p>`,
  code: `/* ------------------------------------------------------------------
   Motion-activated light
   PIR on D2, logic-level MOSFET gate on D9 (PWM), LDR divider on A0.
   ------------------------------------------------------------------ */

// ---- settings --------------------------------------------------------
const int  PIR_PIN      = 2;
const int  GATE_PIN     = 9;     // must be a PWM pin: 3,5,6,9,10,11
const int  LDR_PIN      = A0;

const unsigned long HOLD_MS   = 25000;  // stay on this long after the last movement
const int  FADE_IN_MS         = 500;
const int  FADE_OUT_MS        = 1200;
const int  MAX_BRIGHTNESS     = 255;    // drop to ~120 for a night light
const int  DARK_THRESHOLD     = 350;    // below this reading = dark enough. 0 disables
const bool LDR_RISES_IN_LIGHT = true;   // see the calibration notes
// ----------------------------------------------------------------------

int  brightness = 0;
int  target     = 0;
unsigned long lastMotion = 0;
unsigned long lastStep   = 0;
unsigned long lastPrint  = 0;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(GATE_PIN, OUTPUT);
  analogWrite(GATE_PIN, 0);
  Serial.begin(9600);
  Serial.println(F("warming up the PIR (60s of nonsense is normal)"));
}

void loop() {
  bool motion = digitalRead(PIR_PIN) == HIGH;
  if (motion) lastMotion = millis();

  bool darkEnough = isDark();
  bool wantOn = motion || (millis() - lastMotion < HOLD_MS);

  target = (wantOn && darkEnough) ? MAX_BRIGHTNESS : 0;

  stepFade();
  report();
}

/* --- is the room dark? ------------------------------------------------ */
bool isDark() {
  if (DARK_THRESHOLD <= 0) return true;        // feature switched off
  int v = analogRead(LDR_PIN);
  return LDR_RISES_IN_LIGHT ? (v < DARK_THRESHOLD) : (v > DARK_THRESHOLD);
}

/* --- move one step towards the target, without blocking --------------- */
void stepFade() {
  if (brightness == target) return;

  // how long each 1/255 step should take, for the chosen fade duration
  int totalMs = (target > brightness) ? FADE_IN_MS : FADE_OUT_MS;
  unsigned long stepMs = max(1UL, (unsigned long)totalMs / 255UL);

  if (millis() - lastStep < stepMs) return;
  lastStep = millis();

  brightness += (target > brightness) ? 1 : -1;

  // Perceived brightness is not linear: the eye sees the bottom of the
  // range much more finely. Squaring makes the fade look even.
  int pwm = (int)((long)brightness * brightness / 255L);
  analogWrite(GATE_PIN, pwm);
}

/* --- something to look at while calibrating --------------------------- */
void report() {
  if (millis() - lastPrint < 500) return;
  lastPrint = millis();
  Serial.print(F("ldr="));
  Serial.print(analogRead(LDR_PIN));
  Serial.print(F("  dark="));
  Serial.print(isDark() ? F("yes") : F("no "));
  Serial.print(F("  pir="));
  Serial.print(digitalRead(PIR_PIN));
  Serial.print(F("  level="));
  Serial.println(brightness);
}`,
  after: `<p>The gamma-correction line is worth noticing. A linear ramp from 0 to 255 looks wrong: it appears to
  shoot up to near-full almost immediately and then crawl. Squaring the value spreads the visible change evenly
  across the fade, and it costs one multiply.</p>`
}],

upload: `
<p>Nano selected, correct port, upload. If it fails with a timeout, try
<strong>Tools &rarr; Processor &rarr; ATmega328P (Old Bootloader)</strong> - most clones need it.</p>
<p>Open the Serial Monitor at 9600. You will see the LDR reading, whether it thinks it is dark, and the PIR
state, twice a second. That readout is the whole calibration tool.</p>`,

tune: [
  { h: 'Find out which way your LDR divider goes',
    body: `<p>Watch the <code>ldr=</code> number and cover the sensor with your hand. If the number goes
    <em>down</em> when you cover it, leave <code>LDR_RISES_IN_LIGHT</code> as <code>true</code>. If it goes up,
    set it to <code>false</code>. Which way round it behaves depends on whether the LDR is the top or bottom
    half of the divider, and both wirings are common.</p>` },
  { h: 'Set the threshold from real readings',
    body: `<p>Note the reading with the room lit the way it is when you would <em>not</em> want the light, and
    again when you would. Put <code>DARK_THRESHOLD</code> roughly halfway between. There is usually a large gap,
    so this is forgiving.</p>
    <p>Set it to 0 to disable the light check completely - right for a wardrobe that is always dark inside.</p>` },
  { h: 'Set the hold time',
    body: `<p>25 seconds suits a cupboard. A hallway wants 60-90. Remember the PIR re-triggers while you are
    still moving, so the hold only starts counting from the last movement it saw.</p>` },
  { h: 'PIR jumper and pots',
    body: `<p>Jumper to <strong>H</strong> (repeat trigger). Delay pot fully anticlockwise - the sketch handles
    timing. Sensitivity mid-way to start, then adjust while watching <code>pir=</code> in the monitor.</p>` },
  { h: 'Night-light mode',
    body: `<p>Drop <code>MAX_BRIGHTNESS</code> to about 60 and lengthen <code>FADE_IN_MS</code> to 1500. At
    3&nbsp;am a strip at full brightness is genuinely unpleasant.</p>` }
],

trouble: [
  { q: 'Strip glows faintly all the time',
    a: `The gate pull-down is missing, the wrong value, or not actually connected. Measure gate to ground: it
    should read about 10&nbsp;k with the power off.` },
  { q: 'MOSFET gets hot',
    a: `You have an IRF540 or another non-logic-level part, and it is only partly on. Check the printing on the
    tab. The second possibility is that the strip draws far more than you think - measure it.` },
  { q: 'Light comes on and stays on forever',
    a: `The PIR is re-triggering continuously. Something warm is moving in its view - a vent, a window, a
    monitor. Or the sensitivity is too high. Watch <code>pir=</code> with the strip disconnected to see it
    clearly.` },
  { q: 'Never comes on',
    a: `Three checks, in order: does <code>pir=</code> ever read 1? Does <code>dark=</code> say yes? Does
    <code>level=</code> climb? Each answer points at a different third of the circuit.` },
  { q: 'Fires spuriously in the first minute after power-up',
    a: `Normal. HC-SR501 sensors need 30-60 seconds to stabilise.` },
  { q: 'Flickers instead of fading',
    a: `You are on a non-PWM pin, or the supply is sagging. On a Nano only 3, 5, 6, 9, 10 and 11 do PWM.` },
  { q: 'Nano resets when the strip turns on',
    a: `Inrush on the shared supply. Add a 470&nbsp;&micro;F capacitor across the 12&nbsp;V input, and use
    thicker wire from the supply.` },
  { q: 'Works on the bench, not on the wall',
    a: `Long wires to the PIR pick up noise. Keep them under a metre, or add a 100&nbsp;nF capacitor between the
    PIR's OUT and GND right at the sensor.` }
],

next: `
<ul>
  <li><strong>Make it addressable</strong>: swap the plain strip for WS2812B and you can do a sweep that
  follows you down the hall. See the <a href="project.html?p=ambient-tv-backlight">backlight project</a> for
  the WS2812 side.</li>
  <li><strong>Two zones</strong>: a second PIR and a second MOSFET on another PWM pin, lighting whichever end
  of the corridor you are in.</li>
  <li><strong>Put it on the network</strong> by swapping the Nano for an ESP32 and publishing motion events to
  MQTT - then the same sensor can also trigger other things.</li>
  <li><strong>Add a manual override</strong> button that forces the light on for ten minutes regardless of the
  light level. The most requested feature, every time.</li>
</ul>`,

safety: `<p>Nothing here touches mains - the 12&nbsp;V supply is a sealed commercial unit and everything you
build is on its low-voltage side. Do check the supply is rated for the strip: a 5&nbsp;m run of 60&nbsp;LED/m
strip is around 2.5&nbsp;A, and an undersized supply runs hot. Leave the supply itself in free air, not buried
in a cupboard under a towel.</p>`
});
