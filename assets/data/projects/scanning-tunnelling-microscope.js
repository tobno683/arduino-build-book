/* Imaging atoms on a kitchen table. Everything about this is a scale problem. */
AB.addProject({
slug: 'scanning-tunnelling-microscope',
title: 'Scanning tunnelling microscope',
cat: 'power',
level: 5,
time: 'Months. The electronics take a weekend.',
solder: true,
board: 'ESP32',
tags: ['stm', 'tunnelling', 'piezo', 'transimpedance', 'femtoamp', 'vibration isolation', 'hopg', 'atoms'],
blurb: 'Images individual carbon atoms, on a table, in air, for about $150. Nothing else you can build is this far outside ordinary experience - and nothing else fails for so many weeks before it works.',

skills: ['Quantum tunnelling as a measurement', 'Transimpedance amplification at nanoamps', 'Piezo positioning', 'Vibration isolation', 'Feedback at the limits of stability', 'Knowing when you are looking at an artefact'],

intro: `
<p>Bring a sharp metal tip within about a nanometre of a conducting surface, put 0.1&nbsp;volts across the gap,
and a current flows through vacuum. Classically it cannot - the electrons do not have the energy to cross. They
cross anyway, because at that distance the wavefunction has not finished decaying, and that is quantum
tunnelling.</p>
<p>The useful part is how violently that current depends on distance: <strong>it changes by a factor of ten for
every 0.1&nbsp;nanometre</strong>. Move the tip one atom closer and the current goes up tenfold. That
exponential is what turns a crude mechanical rig into an instrument that resolves individual atoms, because a
measurement that sensitive does not need precision - it needs feedback.</p>
<p>People have built these on kitchen tables since the 1990s. The parts here come to about $150 and the
electronics is an afternoon.</p>
<p><strong>Then it does not work for two months.</strong> Not because anything is wrong - because a lorry
passed, or your tip has two atoms at the end instead of one, or the op-amp you chose leaks more current than
you are trying to measure. That is what level five means, and this project is the clearest example of it in the
book.</p>`,

what: [
  'Measure a tunnelling current of about one nanoamp and hold it constant.',
  'Scan a tip across a surface in a raster, in steps of about 0.02 nanometres.',
  'Produce a height map where the bumps are individual atoms.',
  'Resolve the 0.246 nanometre lattice of graphite, which is the standard first result.',
  'Tell the difference between an atomic image and the several things that convincingly imitate one.'
],

how: `
<p><strong>The exponential is the whole instrument.</strong> Tunnelling current falls by roughly a decade per
angstrom. That has two consequences and both are load-bearing:</p>
<ul>
  <li><strong>Only the last atom of the tip matters.</strong> The second-nearest atom is perhaps 0.2&nbsp;nm
  further back and therefore carries a hundredth of the current. So a crudely cut tip still images atoms,
  provided one atom happens to stick out furthest. This is why cutting Pt/Ir wire with scissors works.</li>
  <li><strong>A 0.01&nbsp;nm change is a 25% change in current.</strong> You are not measuring distance
  precisely; you are measuring a current that screams when distance changes at all.</li>
</ul>

<p><strong>Constant-current mode.</strong> You do not measure the current and plot it. You run a feedback loop
that moves the tip in Z to <em>hold</em> the current at a setpoint, and plot the Z voltage. The image is a
record of what the feedback had to do.</p>
<p>That matters because it keeps the tip at a constant height above the surface - so it does not crash into a
step, and the loop stays in its linear range.</p>
<p>The loop is a slow integrator, not a PID. Gain too low and the tip crashes on the first step; too high and
it oscillates and you see the oscillation rather than the surface. Getting this right is a week on its own.</p>

<p><strong>The preamplifier is the single most important component.</strong> One nanoamp through a
100&nbsp;megohm feedback resistor gives 0.1&nbsp;V - a transimpedance amplifier, which is just an op-amp with
the current going into the inverting input.</p>
<p>The catch: the op-amp's own input bias current flows through that same resistor and is indistinguishable
from signal. A TL071 leaks around 30&nbsp;pA, which is 3% of your signal and drifts with temperature. An
LM358 is far worse. An electrometer-grade part - LMP7721, OPA129 - leaks a few <em>femto</em>amps, a millionth
of the signal.</p>
<p>This one substitution is the difference between an image and a warm fog. It is also why the preamp must sit
within a centimetre of the tip, in a metal box, with the input trace kept off the board on an air wire - a
100&nbsp;megohm path through slightly damp fibreglass is a real resistor in parallel with yours.</p>

<p><strong>Piezos do the moving.</strong> A piezoelectric disc changes dimension by a few nanometres per volt.
Score a 27&nbsp;mm buzzer disc into quadrants and you have X, Y and Z: opposite quadrants push and pull to
bend it laterally, all four together move it vertically.</p>
<p>Range is small - a micrometre or so - which is why a <strong>coarse approach</strong> mechanism is needed to
get from "somewhere near the sample" to "within the piezo's range" without crashing. A fine screw driven
carefully by hand, or a stepper with a lever reduction, moving in steps smaller than the piezo's range.</p>
<p>Approaching is the moment the tip dies most often. Do it while watching the current, one step at a time,
retracting the piezo fully between steps.</p>

<p><strong>Vibration is what actually defeats people.</strong> A building moves by micrometres. You are trying
to hold a gap stable to a hundredth of a nanometre - five orders of magnitude smaller. Without isolation you
are not close to imaging anything.</p>
<p>The classic answer is a stack: heavy metal plates separated by Viton O-rings, the whole stack hung on bungee
cord. Each stage is a low-pass filter, and stages multiply. Hang it from the ceiling, work at night, and do not
walk about.</p>
<p>Acoustic coupling matters too. Talking near an unenclosed STM shows up in the image.</p>

<p><strong>Graphite, because it cheats in your favour.</strong> HOPG cleaves with sticky tape to give an
atomically flat surface, in air, every time. It does not oxidise meaningfully, so it stays imageable on a
bench. Every first STM images graphite for these reasons and you should too.</p>
<p>Its lattice spacing is 0.246&nbsp;nm, which is your calibration standard: if your image says 0.246, your
piezo constants are right.</p>

<p><strong>Knowing when you are fooling yourself.</strong> This is the hardest part and it is a skill, not a
circuit. Several things produce convincing periodic patterns that are not atoms:</p>
<ul>
  <li><strong>A double tip</strong> - two atoms both tunnelling - gives a doubled or smeared lattice.</li>
  <li><strong>Feedback oscillation</strong> gives beautiful regular stripes at the loop's resonant frequency,
  which move when you change the scan speed. Real atoms do not care about your scan speed.</li>
  <li><strong>Mains hum</strong> at 50 or 60&nbsp;Hz gives diagonal stripes that shift when you rotate the scan.</li>
</ul>
<p>The test: change the scan speed and the scan angle. A real lattice keeps its spacing and rotates with the
sample. An artefact does neither.</p>`,

bom: [
  { id: 'electrometer', qty: 1, note: 'The most important part in the list. Femtoamp input bias - an ordinary op-amp leaks more than the whole signal.' },
  { id: 'res100m', qty: 1, note: 'Transimpedance feedback. Handle by the body only; skin oil across it is a lower resistance than the part.' },
  { id: 'ptir-wire', qty: 1, note: 'The tip. Cut at a shallow angle while pulling - see the assembly notes, the technique matters more than the tool.' },
  { id: 'hopg', qty: 1, note: 'The sample, and the calibration standard at 0.246 nm. Cleave with sticky tape before each session.' },
  { id: 'piezo-disc', qty: 2, note: 'One to score into quadrants as the scanner, one spare for when you crack the first one scoring it.' },
  { id: 'hv-piezo', qty: 1, note: 'Piezos want tens of volts. A 12-bit DAC into this gives roughly 0.02 nm steps.' },
  { id: 'mcp4725', qty: 3, note: 'X, Y and Z setpoints. 12 bits across the piezo range is about 0.02 nm per step, which is finer than you need.' },
  { id: 'esp32', qty: 1, note: 'Runs the feedback loop and the raster, and streams the image out over Wi-Fi. A 12-bit ADC reading the preamp is adequate.' },
  { id: 'viton', qty: 1, note: 'The isolation stack. Viton damps; nitrile bounces, which is worse than nothing.' },
  { id: 'nema17', qty: 1, note: 'Coarse approach, through a lever reduction. A fine screw turned by hand also works and is quieter.' },
  { id: 'a4988', qty: 1 },
  { id: 'box-abs', qty: 2, note: 'One shielding the preamp, one for the digital side. The preamp box must be metal or metallised - see the notes.' },
  { id: 'psu12v2a', qty: 1 },
  { id: 'standoffs', qty: 1 },
  { id: 'perfboard', qty: 1, note: 'For the digital side only. The preamp is built dead-bug on a copper ground plane.' },
  { id: 'hookup', qty: 1, own: true },
  { id: 'dmm', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping', own: true }, { id: 'flux', own: true }],

build: {
  parts: [
    { id: 'mcu',   comp: 'esp32',        at: [0, 96] },
    { id: 'bb',    comp: 'bb400',        at: [0, 32] },
    { id: 'dacz',  comp: 'mcp4725',      at: [-62, -14] },
    { id: 'hv',    comp: 'hvpiezo',      at: [16, -22] },
    { id: 'pre',   comp: 'electrometer', at: [-58, -70] },
    { id: 'pz',    comp: 'piezo',        at: [22, -78] },
    { id: 'appr',  comp: 'a4988',        at: [72, 30] }
  ],
  wires: [
    { from: 'mcu.3V3',   to: 'bb.T+1',   color: 'red',    note: '3.3 V logic rail' },
    { from: 'mcu.GND',   to: 'bb.T-1',   color: 'black',  note: 'Ground rail - see the note about a single star point' },
    { from: 'dacz.VCC',  to: 'bb.T+5',   color: 'red',    note: 'Z setpoint DAC power' },
    { from: 'dacz.GND',  to: 'bb.T-5',   color: 'black',  note: 'DAC ground' },
    { from: 'dacz.SDA',  to: 'mcu.D21',  color: 'green',  note: 'I2C data - the X and Y DACs share this bus on other addresses' },
    { from: 'dacz.SCL',  to: 'mcu.D22',  color: 'blue',   note: 'I2C clock' },
    { from: 'dacz.OUT',  to: 'hv.ZIN',   color: 'yellow', note: 'Z setpoint, 0-3.3 V, into the high-voltage amplifier' },
    { from: 'hv.VCC',    to: 'bb.T+12',  color: 'red',    note: 'HV driver supply' },
    { from: 'hv.GND',    to: 'bb.T-12',  color: 'black',  note: 'HV driver ground' },
    { from: 'hv.ZO',     to: 'pz.Z',     color: 'brown',  note: 'Z drive to the piezo - brown, because this is tens of volts' },
    { from: 'hv.XO',     to: 'pz.X',     color: 'brown',  note: 'X quadrant drive' },
    { from: 'hv.YO',     to: 'pz.Y',     color: 'brown',  note: 'Y quadrant drive' },
    { from: 'hv.AGND',   to: 'pz.GND',   color: 'black',  note: 'Piezo common - the brass backing disc' },
    { from: 'pre.V+',    to: 'bb.T+18',  color: 'red',    note: 'Preamp positive supply' },
    { from: 'pre.V-',    to: 'bb.T-18',  color: 'black',  note: 'Preamp negative supply' },
    { from: 'pre.GND',   to: 'bb.T-22',  color: 'black',  note: 'Preamp ground, star-connected at one point only' },
    { from: 'pre.IN',    to: 'pz.GND',   color: 'white',  note: 'The tip. This single wire carries one nanoamp - see the notes' },
    { from: 'pre.OUT',   to: 'mcu.D34',  color: 'green',  note: 'Amplified current to the ADC' },
    { from: 'appr.VDD',  to: 'bb.T+28',  color: 'red',    note: 'Coarse approach driver logic' },
    { from: 'appr.GND',  to: 'bb.T-28',  color: 'black',  note: 'Driver ground' },
    { from: 'appr.STEP', to: 'mcu.D25',  color: 'green',  note: 'One step, then retract and look. Never free-run this' },
    { from: 'appr.DIR',  to: 'mcu.D26',  color: 'blue',   note: 'Approach or retract' },
    { from: 'appr.EN',   to: 'mcu.D27',  color: 'white',  note: 'Disabled except during an approach step' }
  ]
},

wireIntro: `<p>Electrically this is a small instrument: three DACs, an amplifier and a stepper driver. The model
shows it plainly because the difficulty is not here. It is in the one white wire between the tip and the
preamp input, and in what is holding the whole thing still.</p>`,

wireNotes: `
<div class="note danger"><span class="t">The tip wire is the entire measurement</span>
<p>That single connection carries one nanoamp. Everything it touches competes with it:</p>
<ul>
  <li><strong>Keep it in air.</strong> Solder the input to the op-amp pin directly, not to a pad. A
  100&nbsp;megohm leakage path across slightly damp board is a resistor in parallel with yours, and the board
  wins on humid days.</li>
  <li><strong>Under 20&nbsp;mm long, and rigid.</strong> A moving wire is a changing capacitance, which is a
  current. Cable movement appears in your image.</li>
  <li><strong>Shielded and grounded at one end only.</strong> The preamp lives in a metal box; the tip enters
  through a hole and nothing else does.</li>
  <li><strong>Clean the board with isopropyl and let it dry.</strong> Flux residue is conductive enough to
  matter at these currents.</li>
</ul></div>

<div class="note danger"><span class="t">Tens of volts on the piezo lines</span>
<p>The HV driver puts out up to &plusmn;72&nbsp;V. It is current-limited and far less dangerous than the
<a href="project.html?p=nixie-clock">nixie clock</a>, but it will give you a memorable belt and it will destroy
the preamp instantly if it finds its way to the input.</p>
<p>Keep the HV wiring physically separated from the tip wire. Discharge the piezo before handling it - it is a
capacitor and it holds charge.</p></div>

<div class="note warn"><span class="t">One star ground, and mains hum is the test</span>
<p>Every ground meets at one point at the preamp. If you see 50 or 60&nbsp;Hz in the image - diagonal stripes
that shift as you change scan speed - you have a ground loop, and no amount of shielding fixes a loop.</p></div>

<div class="note tip"><span class="t">Score the piezo, do not cut it</span>
<p>Scratch through the silver electrode on the top face with a scalpel, dividing it into four quadrants. You
are cutting the metallisation, not the ceramic - a millimetre-wide scratch is enough, and pressing hard cracks
the disc.</p>
<p>The brass backing stays whole and is the common connection.</p></div>`,

solderIntro: `<p>Two completely different builds. The digital side is ordinary perfboard work. The preamp is
built dead-bug on a copper ground plane, in a metal box, with the critical node in mid-air - and the care you
take there sets the noise floor of the whole instrument.</p>`,

solderSteps: [
  { h: 'The preamp, dead-bug, input in mid-air',
    body: `<p>Op-amp upside down on a piece of copper-clad, legs in the air, ground pins soldered straight to
    the plane. The 100&nbsp;megohm resistor bridges the inverting input to the output <strong>through
    air</strong>, touching nothing else.</p>
    <p>Do not use a socket, do not use perfboard, and do not route the input on copper. Every one of those adds
    a leakage path in parallel with a 100&nbsp;megohm resistor, and they all win eventually.</p>` },
  { h: 'Test the preamp with no tip at all',
    body: `<p>Power it with the input open and watch the output. It should sit within a few tens of millivolts
    of zero and drift slowly.</p>
    <p>If it slams to a rail, the input is floating in a way it does not like, or there is leakage. Breathe on
    the board - if the output moves, you have a humidity-sensitive leakage path and you need to clean and
    re-do it.</p>` },
  { h: 'Calibrate with a known tiny current',
    body: `<p>A 1&nbsp;gigohm resistor from a 1&nbsp;V source gives exactly 1&nbsp;nA. Confirm 0.1&nbsp;V out.
    Now you know your gain, and you know the amplifier works before the mechanics can be blamed.</p>` },
  { h: 'Score the piezo and wire its quadrants',
    body: `<p>Four quadrants on top, brass backing common. Thin flexible wire, and strain-relieve every one -
    a wire pulling on the piezo is a displacement, and displacement is your signal.</p>` },
  { h: 'Cut a tip: pull and cut at the same time',
    body: `<p>Hold the Pt/Ir wire in pliers, cut at about 30 degrees with sharp side cutters, and
    <strong>pull as the blades close</strong> so it tears rather than shears. The tear leaves a ragged end, and
    ragged is what you want - somewhere on it, one atom sticks out furthest.</p>
    <p>Cut ten. You will use them all. A tip is consumable and crashing one is routine.</p>` },
  { h: 'Build the vibration stack',
    body: `<p>Three or four heavy steel or aluminium plates, Viton O-rings between them, the whole stack hung
    on bungee cord from a frame. Aim for a hanging resonance under 1&nbsp;Hz - if it swings slowly, that is
    correct.</p>
    <p>This is not optional and it is not a refinement. Without it you are not close.</p>` },
  { h: 'Coarse approach, deliberately awkward',
    body: `<p>The mechanism must move in steps smaller than the piezo's full range - under a micrometre. A fine
    screw with a lever reduction, or a stepper on a long lever arm.</p>
    <p>Make it slow and make it single-step. An approach that can run continuously will drive the tip into the
    sample, and it does so faster than you can react.</p>` },
  { h: 'Shield, then enclose, then wait for night',
    body: `<p>Preamp in its metal box, the whole instrument under a boxed cover to stop air currents and sound.
    Then try at 2 am, which is not a joke - the difference between daytime and night-time noise in a normal
    building is larger than most of the improvements you can make deliberately.</p>` }
],

libraries: [
  { name: 'Adafruit MCP4725', by: 'Adafruit', why: 'The three setpoint DACs. All on one I2C bus at different addresses.' },
  { name: 'AccelStepper', by: 'Mike McCauley', why: 'Single-stepping the coarse approach under control.' },
  { name: 'ESPAsyncWebServer', by: 'me-no-dev', why: 'Streams the height map to a browser as it scans, which is far more useful than storing it.' }
],

code: [{
  name: 'stm.ino',
  code: `/* ------------------------------------------------------------------
   Scanning tunnelling microscope - ESP32

   Constant-current mode: hold the tunnelling current at a setpoint by
   moving Z, and record what Z had to do. The image IS the feedback.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_MCP4725.h>

Adafruit_MCP4725 dacX, dacY, dacZ;

#define PRE_ADC      34
#define STEP_PIN     25
#define DIR_PIN      26
#define APPROACH_EN  27

// 1 nA through 100 Mohm = 0.1 V. In 12-bit ADC counts on 3.3 V:
const int SETPOINT_COUNTS = 124;        // about 1 nA
const int CRASH_COUNTS    = 900;        // far too much current - retract NOW

#define SCAN_PIXELS 128
uint16_t image[SCAN_PIXELS][SCAN_PIXELS];

uint16_t zNow = 2048;                   // mid-range of the Z DAC
bool engaged = false;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.setClock(400000);

  dacX.begin(0x62); dacY.begin(0x63); dacZ.begin(0x60);
  dacX.setVoltage(2048, false);
  dacY.setVoltage(2048, false);
  dacZ.setVoltage(zNow, false);

  pinMode(STEP_PIN, OUTPUT);
  pinMode(DIR_PIN, OUTPUT);
  pinMode(APPROACH_EN, OUTPUT);
  digitalWrite(APPROACH_EN, HIGH);      // stepper OFF - active low enable

  analogReadResolution(12);
  analogSetPinAttenuation(PRE_ADC, ADC_11db);

  Serial.println("Ready. 'a' to approach, 's' to scan, 'r' to retract.");
}

void loop() {
  if (!Serial.available()) { if (engaged) holdCurrent(); return; }
  char c = Serial.read();
  if (c == 'a') approach();
  if (c == 's') scan();
  if (c == 'r') { retract(); engaged = false; }
}

// ---- the feedback loop ----------------------------------------------
/* A slow integrator, not a PID. The plant is exponential - current
   changes by a decade per angstrom - so proportional gain that suits a
   1 nA setpoint is wildly wrong at 10 nA. Integrating away the error
   slowly is stable across the whole range, and slow is fine because the
   surface is not going anywhere. */
void holdCurrent() {
  int current = analogRead(PRE_ADC);

  if (current > CRASH_COUNTS) {
    // Tip is touching. Retract immediately - a crashed tip is a new tip.
    retract();
    engaged = false;
    Serial.println("CRASH - retracted");
    return;
  }

  long error = (long)current - SETPOINT_COUNTS;

  // Small, deliberately. Too much gain and the loop oscillates and you
  // photograph the oscillation instead of the surface.
  zNow -= error / 8;
  zNow = constrain(zNow, 200, 3900);
  dacZ.setVoltage(zNow, false);
}

// ---- approach --------------------------------------------------------
/* The moment tips die. One step, then retract the piezo fully and look
   for current, then repeat. Never free-run the stepper: it will drive
   the tip into the sample faster than you can react. */
void approach() {
  Serial.println("Approaching. Do not touch the bench.");
  digitalWrite(APPROACH_EN, LOW);
  digitalWrite(DIR_PIN, HIGH);

  for (int step = 0; step < 4000; step++) {
    // Extend Z fully and look for current on the way out.
    for (uint16_t z = 200; z < 3900; z += 20) {
      dacZ.setVoltage(z, false);
      delayMicroseconds(400);
      if (analogRead(PRE_ADC) > SETPOINT_COUNTS) {
        zNow = z;
        engaged = true;
        digitalWrite(APPROACH_EN, HIGH);
        Serial.printf("Tunnelling at step %d, z=%u\\n", step, z);
        return;
      }
    }
    dacZ.setVoltage(200, false);       // fully retracted before moving

    digitalWrite(STEP_PIN, HIGH); delayMicroseconds(3);
    digitalWrite(STEP_PIN, LOW);
    delay(40);                          // let everything stop ringing
  }

  digitalWrite(APPROACH_EN, HIGH);
  Serial.println("No tunnelling found - tip is probably blunt or the sample is not connected");
}

void retract() {
  dacZ.setVoltage(200, false);
  digitalWrite(APPROACH_EN, HIGH);
}

// ---- scanning --------------------------------------------------------
void scan() {
  if (!engaged) { Serial.println("Not engaged"); return; }
  Serial.println("Scanning");

  const uint16_t lo = 1400, hi = 2700;   // a small patch, well inside range
  const uint16_t stepXY = (hi - lo) / SCAN_PIXELS;

  for (int row = 0; row < SCAN_PIXELS; row++) {
    dacY.setVoltage(lo + row * stepXY, false);

    /* Boustrophedon - alternate direction each row. Scanning always the
       same way makes the piezo's hysteresis show up as a shear in the
       image, and every row would carry the same flyback transient. */
    for (int i = 0; i < SCAN_PIXELS; i++) {
      int col = (row & 1) ? (SCAN_PIXELS - 1 - i) : i;
      dacX.setVoltage(lo + col * stepXY, false);

      // Let the loop settle at this point before recording Z.
      for (int k = 0; k < 8; k++) { holdCurrent(); delayMicroseconds(150); }
      image[row][col] = zNow;

      if (!engaged) { Serial.println("Aborted"); return; }
    }
    Serial.printf("row %d\\n", row);
  }
  dumpImage();
}

void dumpImage() {
  // Plain CSV of Z values. Plot it anywhere - the units are DAC counts,
  // and the calibration comes from graphite's known 0.246 nm lattice.
  for (int r = 0; r < SCAN_PIXELS; r++) {
    for (int c = 0; c < SCAN_PIXELS; c++) {
      Serial.print(image[r][c]);
      Serial.print(c == SCAN_PIXELS - 1 ? '\\n' : ',');
    }
  }
}`
}],

trouble: [
  { q: 'The preamp output drifts all over the place with no tip connected',
    a: `Leakage, almost always. Clean the board with isopropyl and dry it thoroughly, keep the input node in
    air, and check you are not using a socket. Breathe on it - if the output moves, that is your answer.` },
  { q: 'No tunnelling current is ever found during approach',
    a: `Three candidates, in order: the sample is not electrically connected (check continuity from the bias
    wire to the graphite surface), the tip is blunt, or the coarse approach is stepping further than the piezo
    range so it steps straight past the tunnelling distance into a crash.` },
  { q: 'It finds current and immediately crashes',
    a: `Approach step too large, or the feedback gain is too low to keep up. Retract fully between steps, and
    reduce the step size until the approach takes minutes rather than seconds.` },
  { q: 'Beautiful regular stripes that look like atoms',
    a: `Probably feedback oscillation. Change the scan speed - if the stripe spacing changes, it is your loop,
    not the surface. Real atoms do not care how fast you scan.` },
  { q: 'Diagonal stripes at a fixed angle',
    a: `Mains hum, at 50 or 60&nbsp;Hz. Look for a ground loop before adding shielding - a loop is not fixed by
    a box.` },
  { q: 'The image shifts every time someone walks past',
    a: `Working as designed, unfortunately. That is the instrument telling you the isolation is not good
    enough. Add a stage, hang it lower, and try at night.` },
  { q: 'The lattice is doubled or smeared',
    a: `Double tip - two atoms tunnelling at once. Cut a new tip. You can also sometimes fix it in place by
    pulsing the bias voltage a few volts for a moment, which rearranges the apex.` },
  { q: 'The image shears - features lean over',
    a: `Piezo hysteresis, plus scanning in one direction only. Scan alternate rows in alternate directions as
    the sketch does, and compare a forward and reverse scan of the same area - a real feature appears in both.` },
  { q: 'Everything worked yesterday and nothing works today',
    a: `Humidity, or the tip has picked something up. Cleave the graphite again with tape, cut a new tip, and
    try again. This is normal and it is most of what operating an STM consists of.` },
  { q: 'The measured lattice spacing is not 0.246 nm',
    a: `That is your piezo calibration and graphite is the standard. Scale your constants so it reads 0.246 -
    now everything else you image is calibrated too.` }
],

safety: `
<div class="note warn"><span class="t">High voltage, low current</span>
<p>The piezo driver puts out up to &plusmn;72&nbsp;V. That is enough for an unpleasant shock and it is more
than enough to destroy the preamp instantly. Keep it physically separated from the tip wiring, and discharge
the piezo before handling it - it is a capacitor and it stays charged.</p>
<p>Nothing here is mains-derived beyond a sealed supply, which is why this is a warning rather than the
treatment the <a href="project.html?p=nixie-clock">nixie clock</a> gets.</p></div>

<div class="note warn"><span class="t">Platinum-iridium and graphite</span>
<p>Cut tips are genuinely sharp and small, and they go everywhere. Cut them over a tray, and account for all of
them - a 0.25&nbsp;mm Pt/Ir splinter in a fingertip is hard to find and harder to remove. Safety glasses while
cutting: the offcut leaves at speed.</p>
<p>HOPG is graphite and harmless, but the flakes are conductive and will happily short something on your bench.
Cleave it away from the electronics.</p></div>

<div class="note"><span class="t">A note on expectations</span>
<p>This is the one project in this book where the honest advice is to expect months rather than weeks, and to
expect the failure mode to be "no signal at all" rather than something diagnosable.</p>
<p>Build the preamp first and calibrate it against a known current. Then you at least know the electronics is
right, and everything after that is mechanics and patience - which is the correct division of the
problem.</p></div>`,

next: `
<ul>
  <li><strong>Calibrate against graphite</strong> and then image something else - a gold-coated surface, a
  cleaved crystal, a DVD's pit structure at lower magnification.</li>
  <li><strong>Spectroscopy.</strong> Hold the tip still, sweep the bias voltage and record current. The shape
  of that curve is the local density of electronic states - genuine physics from a home-built instrument.</li>
  <li><strong>A better coarse approach.</strong> A slip-stick piezo walker removes the only mechanical part
  that is still crude, and it is the standard answer in commercial instruments.</li>
  <li><strong>Log the noise floor</strong> over 24 hours with the tip retracted. You will find out exactly when
  your building is quiet, and it will change when you work.</li>
  <li><strong>Then try an AFM</strong>, which images non-conductors and is harder again.</li>
</ul>`
});
