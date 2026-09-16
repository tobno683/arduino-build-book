/* The safe way to learn brushless: a motor bolted down, measuring its own thrust. */
AB.addProject({
slug: 'brushless-thrust-bench',
title: 'Brushless motor thrust bench',
cat: 'drones',
level: 2,
time: '5 hours',
solder: true,
board: 'Nano',
tags: ['brushless', 'bldc', 'esc', 'thrust', 'load cell', 'hx711', 'calibration', 'lipo'],
blurb: 'Bolt a motor to a stand and measure what it actually produces - grams of thrust, amps, watts, grams per watt. The right first brushless project, because nothing is trying to fly away from you.',

skills: ['BLDC motors and ESCs', 'ESC arming and calibration', 'Load cell measurement', 'Current sensing', 'Efficiency and thrust-to-weight', 'Propeller safety'],

intro: `
<p>Brushless motors are the most dangerous components in this book, by a clear margin. A 2207 motor on a 4S
pack reaches about 30,000&nbsp;RPM, and a 5-inch propeller at that speed will remove a fingertip rather than
cut it. That is not a figure of speech - it is the most common injury in this hobby and it happens to
experienced people on a bench, not beginners in the air.</p>
<p>So the first brushless project should be one where the motor is bolted to something heavy, pointing away
from you, and the only thing it can do is push against a load cell. You learn ESCs, arming, calibration,
current draw and the relationship between throttle and thrust, with nothing trying to leave.</p>
<p>It is also genuinely useful. A thrust bench answers questions no datasheet does: what does this motor and
propeller combination actually produce on your battery, at what current, and at what efficiency? Every later
project in this theme is sized from numbers you measure here.</p>`,

what: [
  'Measure thrust in grams against throttle, for any motor and propeller combination.',
  'Measure current and voltage at the same time, so you get watts and grams-per-watt.',
  'Run an automatic throttle sweep and log the whole curve to serial.',
  'Arm and calibrate an ESC properly, and understand what those beeps mean.',
  'Calculate thrust-to-weight for a build before you commit to buying the parts.',
  'Work with brushless hardware safely, which is the real content of this guide.'
],

how: `
<p><strong>What an ESC actually does.</strong> A brushless motor has no brushes and no commutator, so
something has to switch the three phases in the right order at the right moment. That is the electronic speed
controller's whole job: six MOSFETs, switching three phases, timed from the motor's own back-EMF.</p>
<p>This is why a brushless motor cannot be driven from a battery directly and why the three wires have no
polarity in the usual sense. <strong>Swap any two of the three and the motor runs backwards</strong> - which
is the standard way to reverse one, and a thing you will do on every second build.</p>

<p><strong>The servo protocol, and why a motor controller speaks it.</strong> A conventional ESC takes the
same signal as a hobby servo: a pulse every 20&nbsp;ms, 1000&nbsp;microseconds for stop and 2000 for full.
That is a historical accident - ESCs were built to plug into existing RC receivers - and it means
<code>Servo.h</code> drives an ESC perfectly.</p>
<p>It is also slow and coarse. Modern flight controllers use DShot, a digital protocol with a checksum, at up
to 600&nbsp;kbit/s. For a thrust bench the old protocol is fine and far simpler, and it is what this project
uses.</p>

<p><strong>Arming, which is a safety feature and looks like a fault.</strong> An ESC will not run until it has
seen a minimum-throttle signal for a second or two. Plug in a battery with the throttle at half and it beeps
angrily and refuses.</p>
<p>That is deliberate: it stops a motor spinning up the instant power is applied because a receiver was still
booting. Every ESC in this book behaves this way and the sequence is always: signal first at minimum, then
battery, then wait for the arming tones.</p>
<p>The tones themselves are informative. Most BLHeli ESCs play a rising three-note sequence for cell count
detection - count the beeps and you know what voltage it thinks it has - then a long tone when armed.</p>

<p><strong>Thrust measurement.</strong> The motor pushes on an arm; the arm pushes on a load cell; an HX711
turns the cell's tiny resistance change into a number. It is the same hardware as a kitchen scale and the same
calibration procedure: zero it empty, then apply a known weight.</p>
<p><strong>The lever ratio matters.</strong> If the motor is 100&nbsp;mm from the pivot and the load cell is
50&nbsp;mm, the cell sees twice the force. Measure both distances and divide - getting this wrong is the
commonest reason a bench reports thrust figures that look impossible.</p>

<p><strong>Grams per watt is the number that matters.</strong> Peak thrust tells you whether a build will
leave the ground. Efficiency tells you how long it stays up. Most motor and propeller combinations are most
efficient at 40-60% throttle, and a build that hovers at 50% will fly far longer than one that hovers at
75%.</p>`,

bom: [
  { id: 'bldc2207', qty: 1, note: 'Or whatever motor you want to characterise - the bench does not care. 2207 at 1800-2400 kV is the current 5-inch standard.' },
  { id: 'esc30', qty: 1, note: 'Well above the motor’s peak draw. A 2207 on 4S peaks around 25 A, so a 30 A ESC is sensible and a 45 A one is better.' },
  { id: 'props5', qty: 1, note: 'A set, because you will want to compare them, and because you will damage some.' },
  { id: 'lipo4s', qty: 1, note: 'Read the safety section before buying this. It is the single most hazardous component in this book.' },
  { id: 'lipo-charger', qty: 1, note: 'Balance charger. Not optional on a multi-cell pack.' },
  { id: 'lipo-bag', qty: 1, note: 'For charging and storage. Buy it at the same time as the battery, not later.' },
  { id: 'xt60', qty: 2, note: 'One pair for the ESC, one spare. Solder them properly - see the notes.' },
  { id: 'loadcell', qty: 1, note: 'The 5 kg bar cell, which comes with its HX711 amplifier. More than enough range - a 5-inch setup produces 1-1.5 kg per motor.' },
  { id: 'ina219', qty: 1, note: 'Current and voltage. Check the range - the standard module shunt is good to about 3 A, and you need the 0.01 ohm version or an external shunt for 30.' },
  { id: 'nano', qty: 1, note: 'Plenty. It is reading two sensors and writing one PWM output.' },
  { id: 'oled13', qty: 1, note: 'Live thrust, current and efficiency while you turn the knob. Much better than watching a serial monitor.' },
  { id: 'pot10k', qty: 1, note: 'Manual throttle. A knob is far safer than typing numbers, because you can wind it down without looking.' },
  { id: 'button', qty: 2, note: 'Arm, and start the automatic sweep.' },
  { id: 'switch', qty: 1, note: 'A physical kill switch in the battery line. See the safety section - this is not optional.' },
  { id: 'thrust-frame', qty: 1, note: 'Or plywood and threaded rod. Heavier and stronger than you think it needs to be.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }, { id: 'glasses', note: 'Genuinely required here, not a formality. A propeller failure throws carbon fibre at eye height.' }],

build: {
  parts: [
    { id: 'nano',  comp: 'nano',     at: [0, 56] },
    { id: 'bb',    comp: 'bb400',    at: [0, 0] },
    { id: 'motor', comp: 'bldc',     at: [-70, -78] },
    { id: 'esc',   comp: 'esc',      at: [-70, -18] },
    { id: 'batt',  comp: 'lipo4s',   at: [66, -84] },
    { id: 'cell',  comp: 'loadcell', at: [0, -110] },
    { id: 'hx',    comp: 'hx711',    at: [44, -46] },
    { id: 'ina',   comp: 'ina219',   at: [66, -14] },
    { id: 'oled',  comp: 'oled13',   at: [-18, -52], ry: 180 },
    { id: 'pot',   comp: 'pot10k',   at: [22, -52] }
  ],
  wires: [
    { from: 'batt.XT+',  to: 'ina.VIN+',  color: 'brown',  note: 'Battery positive into the current sensor. THROUGH THE KILL SWITCH - see the notes' },
    { from: 'ina.VIN-',  to: 'esc.B+',    color: 'brown',  note: 'Out of the sensor to the ESC. This wire carries 25 A - use 14 AWG' },
    { from: 'batt.XT-',  to: 'esc.B-',    color: 'black',  note: 'Battery negative straight to the ESC' },
    { from: 'esc.A',     to: 'motor.A',   color: 'brown',  note: 'Motor phase A. Swap any two of these three to reverse the motor' },
    { from: 'esc.B',     to: 'motor.B',   color: 'brown',  note: 'Motor phase B' },
    { from: 'esc.C',     to: 'motor.C',   color: 'brown',  note: 'Motor phase C' },
    { from: 'esc.SIG',   to: 'nano.D9',   color: 'orange', note: 'Throttle signal, standard servo pulse. D9 has a hardware timer' },
    { from: 'esc.GND',   to: 'bb.T-2',    color: 'black',  note: 'ESC ground - the common reference between the power and logic sides' },
    { from: 'esc.BEC',   to: 'bb.T+2',    color: 'red',    note: '5 V from the ESC. Powers the Nano - do NOT also connect USB, see the notes' },
    { from: 'nano.5V',   to: 'bb.T+2',    color: 'red',    note: '5 V rail' },
    { from: 'nano.GND',  to: 'bb.T-2',    color: 'black',  note: 'Ground rail' },
    { from: 'cell.RED',  to: 'hx.E+',     color: 'red',    note: 'Load cell excitation +' },
    { from: 'cell.BLK',  to: 'hx.E-',     color: 'black',  note: 'Load cell excitation -' },
    { from: 'cell.WHT',  to: 'hx.A-',     color: 'white',  note: 'Load cell signal -' },
    { from: 'cell.GRN',  to: 'hx.A+',     color: 'green',  note: 'Load cell signal +' },
    { from: 'hx.VCC',    to: 'bb.T+8',    color: 'red',    note: 'HX711 power' },
    { from: 'hx.GND',    to: 'bb.T-8',    color: 'black',  note: 'HX711 ground' },
    { from: 'hx.DT',     to: 'nano.D4',   color: 'blue',   note: 'HX711 data' },
    { from: 'hx.SCK',    to: 'nano.D5',   color: 'yellow', note: 'HX711 clock' },
    { from: 'ina.VCC',   to: 'bb.T+12',   color: 'red',    note: 'Current sensor power' },
    { from: 'ina.GND',   to: 'bb.T-12',   color: 'black',  note: 'Current sensor ground' },
    { from: 'ina.SDA',   to: 'nano.A4',   color: 'blue',   note: 'I2C data, shared with the display' },
    { from: 'ina.SCL',   to: 'nano.A5',   color: 'yellow', note: 'I2C clock' },
    { from: 'oled.VCC',  to: 'bb.T+16',   color: 'red',    note: 'Display power' },
    { from: 'oled.GND',  to: 'bb.T-16',   color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA',  to: 'nano.A4',   color: 'blue',   note: 'Same I2C bus' },
    { from: 'oled.SCL',  to: 'nano.A5',   color: 'yellow', note: 'Same I2C clock' },
    { from: 'pot.1',     to: 'bb.T+20',   color: 'red',    note: 'Throttle pot, top of track' },
    { from: 'pot.3',     to: 'bb.T-20',   color: 'black',  note: 'Throttle pot, bottom of track' },
    { from: 'pot.W',     to: 'nano.A0',   color: 'green',  note: 'Throttle wiper. A knob you can wind down without looking' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Read this before you buy a propeller</span>
<p>A 5-inch propeller at 25,000&nbsp;RPM has blade tips moving at around 170&nbsp;m/s - about 600&nbsp;km/h.
It will amputate, not cut. Carbon and polycarbonate props are both perfectly capable of it.</p>
<ul>
  <li><strong>Do the first power-up with NO propeller fitted.</strong> Everything in this build can be tested
  and calibrated on a bare motor - you only need a prop for the actual thrust numbers.</li>
  <li><strong>Never stand in the plane of the propeller.</strong> If a blade lets go it goes sideways at
  enormous speed. Stand behind or above, never level with it.</li>
  <li><strong>Eye protection, every time.</strong> Not a formality.</li>
  <li><strong>Nothing loose anywhere near it</strong> - cable ties, sleeves, hair, the multimeter leads you
  left on the bench.</li>
  <li><strong>Throttle to zero and battery disconnected</strong> before your hands go anywhere near the
  motor. Every single time, including the time you are only moving it two centimetres.</li>
</ul></div>

<div class="note danger"><span class="t">A kill switch in the battery line, within reach</span>
<p>Not a software stop, not a button the Arduino reads. A physical switch or an XT60 you can pull, in the main
battery lead, positioned where you can reach it without leaning over the propeller.</p>
<p>The failure you are protecting against is a runaway - a corrupted signal, a crashed sketch, an ESC in an
odd state - and in that situation a software stop is the thing that has already failed.</p>
<p>Rated for the current, and switched with the throttle at zero rather than under load.</p></div>

<div class="note danger"><span class="t">Never power the Nano from USB and the ESC BEC at the same time</span>
<p>The ESC provides 5&nbsp;V on its BEC line. USB provides 5&nbsp;V through the Nano's regulator. Connect both
and the two sources fight, current flows back into whichever is lower, and you can damage the Nano, the ESC,
or your laptop's USB port.</p>
<p>While programming: BEC disconnected, USB connected. While running: USB disconnected, BEC connected. A
jumper in the BEC line makes this a one-second change and is worth fitting.</p></div>

<div class="note danger"><span class="t">The power wiring carries 25 amps</span>
<ul>
  <li><strong>14 AWG minimum</strong> for the battery and phase wires, and as short as the layout allows.</li>
  <li><strong>Solder XT60s properly.</strong> A dry joint at 25&nbsp;A is a heat source, and these connectors
  are a common cause of melted plugs. Fill the cup, heat the wire as well as the terminal.</li>
  <li><strong>Get the polarity right</strong> and check it with a meter before the battery goes on. An ESC
  connected backwards is destroyed instantly and sometimes spectacularly.</li>
  <li><strong>Watch for the spark.</strong> Connecting a LiPo to an ESC produces a bright spark as the ESC's
  capacitors charge. That is normal. An anti-spark XT90 or a series resistor lead avoids it pitting the
  contacts.</li>
</ul></div>

<div class="note warn"><span class="t">Arm before the battery, always</span>
<p>The sequence is: Arduino powered and outputting minimum throttle &rarr; <em>then</em> connect the battery
&rarr; wait for the ESC's arming tones.</p>
<p>Connecting the battery first, with an undefined signal or none at all, is how a motor spins up unexpectedly.
The sketch outputs minimum throttle in <code>setup()</code> before anything else for this reason.</p></div>

<div class="note warn"><span class="t">Measure your lever ratio</span>
<p>Motor arm length and load cell arm length, from the pivot, in millimetres. The thrust is the cell reading
multiplied by (cell distance / motor distance).</p>
<p>Guessing this is the most common reason a bench reports 3&nbsp;kg from a motor rated for 1.2.</p></div>`,

solderSteps: [
  { h: 'XT60 connectors, done properly',
    body: `<p>These carry the whole current and a bad one is a hazard rather than an annoyance.</p>
    <p>Hold the connector in a vice, cup upward. Pre-tin the cup and the wire separately. Then bring them
    together with the iron on the outside of the cup, and feed a little more solder until it flows into the
    strands. The wire should not wick solder more than a few millimetres up - stiff wire at the entry to a
    connector cracks.</p>
    <p><strong>Heatshrink each terminal before the second one is soldered</strong>, or you cannot get it on.
    Then check with a meter for a short between the two before it ever sees a battery.</p>` },
  { h: 'Motor to ESC: bullet connectors or solder',
    body: `<p>Three phase wires, no polarity. Either solder directly - tidy, lighter, permanent - or fit 3.5&nbsp;mm
    bullets, which let you swap motors and reverse direction by unplugging.</p>
    <p>For a bench, bullets are worth it. You will be testing several motors.</p>
    <p>Heatshrink each one individually. Three bare phase connections touching each other is a dead ESC.</p>` },
  { h: 'The current sensor goes in the positive line',
    body: `<p>Battery positive into VIN+, VIN- out to the ESC. The sensor measures the drop across its own
    shunt.</p>
    <p><strong>Check the shunt rating.</strong> A standard INA219 module has a 0.1&nbsp;ohm shunt good for
    about 3.2&nbsp;A, which a brushless motor will exceed instantly and destroy. You need the 0.01&nbsp;ohm
    version, or to replace the shunt and adjust the calibration - the tuning section covers it.</p>` },
  { h: 'Load cell wiring, which has a colour convention',
    body: `<p>Red is excitation+, black excitation-, white signal-, green signal+. Some cells use blue for
    green. If the reading goes negative when you push down, swap white and green.</p>
    <p>Keep the cell's leads away from the phase wires - they carry a few millivolts and the phases are
    switching tens of amps.</p>` },
  { h: 'Mount the motor so the thrust pushes on the cell',
    body: `<p>Motor on an arm, arm on a pivot, cell taking the load at a known distance. The motor should push
    <em>down</em> onto the cell or pull up against it - not sideways, which a bar cell measures badly.</p>
    <p>Everything bolted, nothing relying on friction, and the whole stand clamped or screwed to the bench.
    A 1.5&nbsp;kg thrust on a light stand will walk it across the table.</p>` },
  { h: 'A jumper in the BEC line',
    body: `<p>Two-pin header in the ESC's red BEC wire. Pull it to program over USB, replace it to run on
    battery. Five minutes, and it stops you destroying a USB port.</p>` }
],

assembly: [
  { h: 'Build the stand first, and overbuild it',
    body: `<p>Before any electronics. Motor mount, pivot, load cell, base. Clamp it to the bench.</p>
    <p>Then push the motor mount by hand as hard as you can and see whether anything flexes or lifts. A
    2207 on 4S produces well over a kilogram, in a direction designed to lift things.</p>` },
  { h: 'Calibrate the scale before the motor exists',
    body: `<p>HX711 and load cell only. Run the calibration sketch: zero it empty, then hang a known weight -
    a 500&nbsp;g bag of sugar is ideal - and note the scale factor.</p>
    <p>Then check it reads correctly with a different weight. A cell that is right at 500&nbsp;g and wrong at
    1000 is mounted badly, usually with the load partly going through the mounting rather than the cell.</p>` },
  { h: 'Measure the lever arms and write them on the stand',
    body: `<p>Pivot to motor centre, and pivot to load cell contact point, in millimetres. Multiply the cell
    reading by (cell distance / motor distance) to get real thrust.</p>
    <p>Write both numbers on the stand in marker. You will forget them and the results will be quietly
    wrong.</p>` },
  { h: 'Bare motor, no propeller, first power-up',
    body: `<p>Motor bolted down, no prop, throttle at zero, BEC jumper in, USB out.</p>
    <p>Connect the battery and listen. You should get the ESC's start-up tones - usually a musical rising
    sequence, then beeps counting the cells, then a long tone when it sees minimum throttle and arms.</p>
    <p>Then bring the knob up slowly. The motor should spin smoothly and quietly. A motor that stutters,
    screeches or gets hot at low throttle has a phase problem or a damaged ESC - stop and investigate.</p>` },
  { h: 'Check the direction, still with no propeller',
    body: `<p>Note which way it spins. To reverse it, swap any two of the three phase wires - that is the whole
    procedure, and it is why the wires have no markings.</p>
    <p>For a thrust bench, spin direction only matters once the prop is on: a propeller fitted the wrong way
    round produces roughly a third of the thrust and a great deal of noise, and people waste hours on it.</p>` },
  { h: 'Now fit the propeller, and read the safety notes again',
    body: `<p>Prop nuts have a direction - most are reverse-threaded on one side so the motor's own rotation
    tightens them. Match the marking on the prop to the motor's direction.</p>
    <p>Then: everything clear, eye protection on, standing out of the propeller plane, kill switch in reach.
    Bring the throttle up slowly.</p>` },
  { h: 'Take a manual reading curve',
    body: `<p>10% steps, ten seconds at each, noting thrust, current and voltage. Let it settle at each step -
    the battery sags and the reading changes over the first few seconds.</p>
    <p>Do not sit at full throttle for more than a few seconds. Motors and ESCs get hot fast in still air,
    and a bench has none of the cooling airflow a moving aircraft does.</p>` },
  { h: 'Then run the automatic sweep',
    body: `<p>The sweep steps the throttle, waits, averages, logs, and returns to zero. Copy the serial output
    into a spreadsheet and plot thrust against watts.</p>
    <p>The interesting curve is grams per watt, and its peak is usually at 40-60% throttle. That is where an
    aircraft should hover.</p>` },
  { h: 'Use the numbers',
    body: `<p>Total thrust from four motors, divided by all-up weight, is thrust-to-weight. Below 2:1 is
    sluggish and unpleasant; 3:1 is a good sport quad; above 8:1 is a racing machine you will not enjoy
    learning on.</p>
    <p>Hover throttle should land near 40-50%. If your build hovers at 70%, it is too heavy or underpropped
    and the flight time will be poor.</p>` }
],

libraries: [
  { name: 'Servo', by: 'Arduino', how: 'Built in', why: 'Generates the 1000-2000 microsecond pulses an ESC expects. An ESC speaks the servo protocol for historical reasons.' },
  { name: 'HX711', by: 'Bogdan Necula', why: 'The load cell amplifier. Handles the bit-banged 24-bit protocol and the averaging.' },
  { name: 'Adafruit INA219', by: 'Adafruit', why: 'Current and bus voltage over I2C.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The display, plus Adafruit GFX.' }
],

code: [
{
  h: 'Step 1: calibrate the scale',
  intro: `<p>Load cell and HX711 only, no motor anywhere near it. You need the scale factor before any thrust
  number means anything.</p>`,
  name: 'scale_calibrate.ino',
  code: `/* ------------------------------------------------------------------
   Load cell calibration.

   1. Run it with nothing on the cell and let it tare.
   2. Put a KNOWN weight on - 500 g is ideal.
   3. Type the weight in grams into the serial monitor.
   4. It prints the scale factor. Put that in the main sketch.
   ------------------------------------------------------------------ */

#include "HX711.h"

#define DT_PIN  4
#define SCK_PIN 5

HX711 scale;

void setup() {
  Serial.begin(115200);
  scale.begin(DT_PIN, SCK_PIN);

  if (!scale.is_ready()) {
    Serial.println(F("HX711 not responding - check DT and SCK"));
    while (1) delay(500);
  }

  Serial.println(F("Remove all weight. Taring..."));
  delay(2000);
  scale.set_scale();              // raw readings for now
  scale.tare(20);                 // average 20 readings for the zero
  Serial.println(F("Tared.\\n"));

  Serial.println(F("Put a known weight on the cell, then type its"));
  Serial.println(F("mass in grams and press enter."));
}

void loop() {
  if (Serial.available()) {
    float known = Serial.parseFloat();
    if (known <= 0) return;

    /* Average heavily. A single HX711 reading is noisy at the level
       that matters here, and the calibration constant inherits every
       bit of that noise. */
    long raw = scale.get_value(50);
    float factor = raw / known;

    Serial.print(F("\\nraw average : ")); Serial.println(raw);
    Serial.print(F("known mass  : ")); Serial.print(known); Serial.println(F(" g"));
    Serial.print(F("SCALE FACTOR: ")); Serial.println(factor, 4);
    Serial.println(F("\\nPut that in CALIBRATION_FACTOR in the main sketch."));
    Serial.println(F("Now check it with a DIFFERENT weight:"));

    scale.set_scale(factor);
    while (1) {
      Serial.print(scale.get_units(10), 1);
      Serial.println(F(" g"));
      delay(500);
    }
  }

  Serial.print(F("raw: "));
  Serial.println(scale.get_value(5));
  delay(400);
}`,
  after: `<p><strong>Check it with a second, different weight.</strong> A cell that reads 500&nbsp;g correctly
  and 1000&nbsp;g as 1150 is not linear, which almost always means the load is partly bypassing the cell
  through the mounting.</p>
  <p>A bar cell must be mounted with one end fixed and the other end free to deflect, with the load applied
  at the free end. Bolting both ends down rigidly turns it into a strain gauge on a bracket and it reads
  nonsense.</p>`
},
{
  h: 'Step 2: the bench',
  intro: `<p>Manual throttle on the knob, automatic sweep on a button. The arming sequence at the top is the
  part to read.</p>`,
  name: 'thrust_bench.ino',
  code: `/* ------------------------------------------------------------------
   Brushless thrust bench.

   Knob    : manual throttle
   Button 1: arm / disarm
   Button 2: automatic sweep, logged to serial as CSV

   SAFETY: this sketch outputs minimum throttle before anything else
   happens, and refuses to leave minimum until you arm deliberately.
   ------------------------------------------------------------------ */

#include <Servo.h>
#include <Wire.h>
#include "HX711.h"
#include <Adafruit_INA219.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define ESC_PIN     9
#define HX_DT       4
#define HX_SCK      5
#define POT_PIN    A0
#define BTN_ARM     2
#define BTN_SWEEP   3

// ---- from the calibration sketch -------------------------------------
#define CALIBRATION_FACTOR  -430.0

/* Lever ratio. Measure BOTH distances from the pivot, in mm, and
   write them on the stand. Getting this wrong is the commonest
   reason a bench reports impossible thrust figures. */
#define ARM_MOTOR_MM   120.0
#define ARM_CELL_MM     60.0
#define LEVER (ARM_CELL_MM / ARM_MOTOR_MM)

// ---- ESC pulse widths -------------------------------------------------
#define THROTTLE_MIN  1000
#define THROTTLE_MAX  2000

/* Never go straight to full. This cap is here so a knob knocked
   across its travel does not produce maximum thrust on a stand that
   might not be bolted down as well as you think. Raise it
   deliberately once you trust the stand. */
#define THROTTLE_CEILING  1900

#define SWEEP_STEP_US     50
#define SWEEP_SETTLE_MS  2500
#define SWEEP_MAX_US    1900

Servo esc;
HX711 scale;
Adafruit_INA219 ina;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

bool armed = false;
int throttle = THROTTLE_MIN;
float thrustG = 0, amps = 0, volts = 0;
float peakThrust = 0, peakWatts = 0;

void setup() {
  Serial.begin(115200);

  /* FIRST thing, before anything that could fail or block. An ESC
     that sees a valid minimum-throttle signal from the instant it
     powers up will arm cleanly and cannot spin unexpectedly. */
  esc.attach(ESC_PIN, THROTTLE_MIN, THROTTLE_MAX);
  esc.writeMicroseconds(THROTTLE_MIN);

  pinMode(BTN_ARM, INPUT_PULLUP);
  pinMode(BTN_SWEEP, INPUT_PULLUP);

  Wire.begin();
  if (oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) oled.setTextColor(SSD1306_WHITE);

  scale.begin(HX_DT, HX_SCK);
  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare(20);

  if (!ina.begin()) Serial.println(F("no INA219"));
  // 32 V, 2 A is the default and far too low. See the tuning notes
  // about the shunt if you are drawing more than about 3 A.
  ina.setCalibration_32V_2A();

  Serial.println(F("bench ready - DISARMED"));
  Serial.println(F("throttle_us,thrust_g,volts,amps,watts,g_per_w"));
  draw();
}

void loop() {
  readSensors();
  pollButtons();

  if (armed) {
    int raw = analogRead(POT_PIN);
    throttle = map(raw, 0, 1023, THROTTLE_MIN, THROTTLE_CEILING);
  } else {
    throttle = THROTTLE_MIN;
  }
  esc.writeMicroseconds(throttle);

  static unsigned long lastDraw = 0;
  if (millis() - lastDraw > 150) { lastDraw = millis(); draw(); }
}

void readSensors() {
  // get_units averages internally; 3 samples is a good balance
  // between noise and keeping the loop responsive.
  thrustG = scale.get_units(3) * LEVER;
  if (thrustG < 0) thrustG = 0;

  volts = ina.getBusVoltage_V();
  amps  = ina.getCurrent_mA() / 1000.0;
  if (amps < 0) amps = 0;

  float w = volts * amps;
  if (thrustG > peakThrust) peakThrust = thrustG;
  if (w > peakWatts) peakWatts = w;
}

void pollButtons() {
  static unsigned long last = 0;
  if (millis() - last < 300) return;

  if (!digitalRead(BTN_ARM)) {
    last = millis();

    /* Refuse to arm unless the knob is at the bottom. Arming with the
       throttle up is exactly how people get hurt, and the ESC's own
       arming check will not save you because the signal was valid. */
    if (!armed && analogRead(POT_PIN) > 20) {
      Serial.println(F("! throttle not at zero - cannot arm"));
      flashMessage("KNOB NOT AT ZERO");
      return;
    }

    armed = !armed;
    Serial.println(armed ? F("ARMED") : F("disarmed"));
  }

  if (!digitalRead(BTN_SWEEP) && armed) {
    last = millis();
    sweep();
  }
}

/* --- automatic sweep ----------------------------------------------------
   Steps up, settles, logs, and ALWAYS returns to minimum - including
   if you abort it. */
void sweep() {
  Serial.println(F("\\n--- sweep ---"));
  Serial.println(F("throttle_us,thrust_g,volts,amps,watts,g_per_w"));

  for (int us = THROTTLE_MIN; us <= SWEEP_MAX_US; us += SWEEP_STEP_US) {
    esc.writeMicroseconds(us);

    // The battery sags and the reading moves for the first second or
    // two. Logging before it settles gives you an optimistic curve.
    unsigned long until = millis() + SWEEP_SETTLE_MS;
    while (millis() < until) {
      readSensors();
      draw();

      // Abort on either button, and go straight to minimum.
      if (!digitalRead(BTN_ARM) || !digitalRead(BTN_SWEEP)) {
        esc.writeMicroseconds(THROTTLE_MIN);
        Serial.println(F("! sweep aborted"));
        delay(400);
        return;
      }
    }

    float w = volts * amps;
    Serial.print(us);            Serial.print(',');
    Serial.print(thrustG, 1);    Serial.print(',');
    Serial.print(volts, 2);      Serial.print(',');
    Serial.print(amps, 2);       Serial.print(',');
    Serial.print(w, 1);          Serial.print(',');
    Serial.println(w > 0.1 ? thrustG / w : 0, 2);

    // Stop early if the pack is sagging badly - a 4S under 13.2 V is
    // at about 3.3 V per cell and should not be loaded further.
    if (volts < 13.2) {
      Serial.println(F("! pack voltage low - stopping sweep"));
      break;
    }
  }

  esc.writeMicroseconds(THROTTLE_MIN);
  Serial.println(F("--- sweep complete, throttle at minimum ---\\n"));
}

/* --- display ------------------------------------------------------------ */
void draw() {
  oled.clearDisplay();

  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(thrustG, 0);
  oled.setTextSize(1);
  oled.print(F(" g"));

  oled.setTextSize(1);
  oled.setCursor(76, 0);
  oled.print(volts, 2); oled.println(F("V"));
  oled.setCursor(76, 10);
  oled.print(amps, 1); oled.println(F("A"));

  float w = volts * amps;
  oled.setCursor(0, 22);
  oled.print(w, 0); oled.print(F(" W   "));
  oled.print(w > 0.1 ? thrustG / w : 0, 2); oled.println(F(" g/W"));

  oled.setCursor(0, 34);
  int pct = map(throttle, THROTTLE_MIN, THROTTLE_MAX, 0, 100);
  oled.print(F("throttle ")); oled.print(pct); oled.println(F("%"));
  oled.drawRect(0, 44, 128, 7, SSD1306_WHITE);
  oled.fillRect(0, 44, pct * 128 / 100, 7, SSD1306_WHITE);

  oled.setCursor(0, 55);
  if (armed) {
    oled.fillRect(0, 54, 40, 10, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
    oled.print(F(" ARMED"));
    oled.setTextColor(SSD1306_WHITE);
  } else {
    oled.print(F("safe"));
  }
  oled.setCursor(52, 55);
  oled.print(F("peak ")); oled.print(peakThrust, 0); oled.print(F("g"));

  oled.display();
}

void flashMessage(const char *msg) {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setCursor(4, 28);
  oled.print(msg);
  oled.display();
  delay(1200);
}`,
  after: `<p><strong><code>esc.attach()</code> and minimum throttle are the first two statements in
  <code>setup()</code></strong>, before the display, the scale or the current sensor. Any of those can fail or
  block, and an ESC that comes up seeing no signal at all - or a signal that appears late - is an ESC that may
  do something you did not ask for.</p>
  <p><strong>Refusing to arm with the knob up</strong> is the interlock that matters most. The ESC's own arming
  check only requires a <em>valid</em> minimum signal at power-up; once armed, it will happily obey a
  full-throttle command from a knob someone left at maximum.</p>
  <p><strong>The sweep always returns to minimum</strong>, including on abort. Any code path that can leave a
  brushless motor spinning is a bug, not a feature.</p>`
}],

upload: `
<p>Ordinary Nano upload. Serial Monitor at <strong>115200</strong>.</p>
<div class="note danger"><span class="t">Pull the BEC jumper before connecting USB</span>
<p>The ESC's 5&nbsp;V BEC and your laptop's USB fighting each other damages things. Jumper out to program,
jumper in to run.</p>
<p>And take the propeller off before plugging in USB. A sketch upload resets the Nano, which for a moment
means no signal on the ESC line - and an armed ESC losing its signal does not always do what you expect.</p></div>
<div class="note warn"><span class="t">Copy the CSV into a spreadsheet</span>
<p>The sweep output is comma-separated with a header row. Select it in the serial monitor, paste into a
spreadsheet, and plot thrust against watts and grams-per-watt against throttle.</p>
<p>The second of those is the interesting one and it is not obvious from the numbers alone.</p></div>`,

tune: [
  { h: 'The INA219 shunt is the first thing to fix',
    body: `<p>A stock INA219 module has a 0.1&nbsp;ohm shunt and measures to about 3.2&nbsp;A. A brushless
    motor will pass 25, which both saturates the reading and dissipates 60&nbsp;W in a tiny resistor - it will
    be destroyed.</p>
    <p>Buy the 0.01&nbsp;ohm version, or replace the shunt with a 0.001&nbsp;ohm and adjust the calibration
    registers. An external hall-effect sensor like the one in the
    <a href="project.html?p=mains-energy-monitor">energy monitor</a> avoids the problem entirely and is what
    commercial benches use.</p>` },
  { h: 'Reading grams per watt properly',
    body: `<p>Plot it against throttle and you get a curve that rises, peaks somewhere around 40-60%, and
    falls away toward full throttle.</p>
    <p>That peak is where an aircraft should hover. A build hovering at 70% throttle is operating past the
    efficient part of the curve and will have poor flight times no matter what battery you fit.</p>` },
  { h: 'Compare propellers, not just motors',
    body: `<p>The propeller changes the numbers more than the motor does. A tri-blade produces more thrust and
    worse efficiency than a bi-blade of the same diameter; more pitch gives more top speed and more
    current.</p>
    <p>This bench is the only honest way to compare them, and the differences are much larger than
    marketing suggests.</p>` },
  { h: 'Temperature matters and you cannot see it',
    body: `<p>A bench has none of the cooling airflow an aircraft in motion does. Motors and ESCs that are fine
    in flight will get uncomfortably hot at high throttle on a stand.</p>
    <p>Add a thermistor or a DS18B20 taped to the motor bell and stop the sweep above about 80&nbsp;&deg;C.
    Short runs and a fan pointed at the setup are the simpler answer.</p>` },
  { h: 'RPM, with a $2 optical sensor',
    body: `<p>A photodiode and a piece of reflective tape on the bell gives you RPM, which lets you check the
    motor's actual kV against its rating and spot a propeller that is stalling.</p>
    <p>Count pulses per revolution carefully - a two-blade prop interrupts a beam twice per turn.</p>` },
  { h: 'DShot instead of the servo protocol',
    body: `<p>The old protocol is 1000-2000&nbsp;microseconds, which is about 11 bits of resolution at
    50&nbsp;Hz. DShot600 is digital, checksummed, and updates at up to 8&nbsp;kHz, and it supports telemetry
    back from the ESC - RPM, temperature and current from the ESC itself.</p>
    <p>An AVR cannot generate it reliably; an ESP32 or STM32 can. Worth knowing about, and not needed for a
    bench.</p>` }
],

trouble: [
  { q: 'The ESC beeps continuously and will not arm',
    a: `It is not seeing a valid minimum-throttle signal. Check the signal wire is on the right pin, that the
    ESC's ground is common with the Arduino's, and that the sketch is writing 1000&nbsp;microseconds. Try
    disconnecting the battery, confirming the signal with the sketch running, then reconnecting.` },
  { q: 'A repeating pattern of beeps and nothing else',
    a: `Most BLHeli ESCs report cell count as beeps at power-up, then a specific pattern for faults. Three
    rising tones then silence usually means no signal; a continuous fast beep often means low input voltage.
    Check the pack.` },
  { q: 'The motor stutters or screeches at low throttle',
    a: `Desync, or a damaged phase. Try a different ESC. If it persists, check all three phase connections
    are solid and that no two are touching. A motor that has been run with a damaged ESC can also have a
    shorted winding - check phase-to-phase resistance, which should be equal and very low on all three
    pairs.` },
  { q: 'The motor spins the wrong way',
    a: `Swap any two of the three phase wires. That is the entire procedure and it is completely normal to
    need it.` },
  { q: 'Thrust readings are wildly too high',
    a: `The lever ratio. Measure pivot-to-motor and pivot-to-cell in millimetres and check the arithmetic. A
    bench reporting three times the expected thrust usually has the ratio inverted.` },
  { q: 'Thrust reads negative',
    a: `Swap the white and green load cell wires, or negate the calibration factor. Either works.` },
  { q: 'The reading drifts upward as it runs',
    a: `Thermal drift in the load cell, or the stand warming and flexing. Tare between runs, and let the whole
    thing settle for a minute after moving it.` },
  { q: 'Current reads a fixed maximum regardless of throttle',
    a: `The INA219 is saturated - its stock shunt maxes out around 3.2&nbsp;A. You need the 0.01&nbsp;ohm
    version. It may also already be damaged.` },
  { q: 'The Nano resets when the motor spins up',
    a: `The BEC sagging under the switching noise, or a ground loop. Add a 470&nbsp;uF capacitor across the
    5&nbsp;V rail, keep the signal and ground wires to the ESC twisted together, and keep them away from the
    phase wires.` },
  { q: 'The prop nut works loose',
    a: `Wrong prop direction for the thread, or the prop is not seated flat. Most nuts are handed so the
    motor's rotation tightens them - check the marking. A loose prop at 25,000&nbsp;RPM is the worst outcome
    available in this project.` }
],

next: `
<ul>
  <li><strong>Drive it from an RC transmitter</strong> - the
  <a href="project.html?p=rc-receiver-decoder">receiver decoder</a> replaces the knob with a real radio, and
  is the bridge to every other project in this theme.</li>
  <li><strong>Put the motors on the ground first</strong> - the
  <a href="project.html?p=rc-rover-brushless">brushless rover</a> uses all of this and cannot fall out of the
  sky.</li>
  <li><strong>Then, if you are sure</strong> - the
  <a href="project.html?p=quadcopter-flight-controller">flight controller</a>, which is where the numbers you
  measured here become a thrust-to-weight ratio and a hover throttle.</li>
  <li><strong>Measure everything else too</strong> - the
  <a href="project.html?p=usb-power-meter">power meter</a> and
  <a href="project.html?p=battery-capacity-tester">capacity tester</a> are the same instincts applied to
  smaller things.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Propellers. This is the one that hurts people.</span>
<p>A 5-inch propeller at 25,000&nbsp;RPM has tip speeds around 600&nbsp;km/h. It does not cut - it amputates.
Fingertip injuries are the most common injury in this hobby and they happen to experienced people, on a
bench, while doing something they have done a hundred times.</p>
<ul>
  <li><strong>Test with no propeller wherever possible.</strong> Arming, direction, calibration and the
  current sensor can all be checked on a bare motor.</li>
  <li><strong>Never stand in the plane of the propeller.</strong> A failed blade leaves sideways at enormous
  speed. Stand behind or above it.</li>
  <li><strong>Eye protection every single time.</strong></li>
  <li><strong>Battery disconnected before hands go near the motor.</strong> Not throttle at zero - battery
  disconnected. Every time, including when you are only adjusting something for a second.</li>
  <li><strong>Nothing loose within a metre</strong> - sleeves, hair, cable ties, leads, paper.</li>
  <li><strong>Never run a damaged propeller.</strong> A chip is an imbalance and an imbalance at
  25,000&nbsp;RPM becomes a failure. They cost a dollar; bin them freely.</li>
  <li><strong>Bolt the stand down.</strong> 1.5&nbsp;kg of thrust will move an unsecured stand, and a stand
  that tips while the motor is running is a propeller loose in the room.</li>
</ul>
</div>
<div class="note danger"><span class="t">LiPo packs, which are the other serious hazard</span>
<p>A 4S 1500&nbsp;mAh pack stores about 22&nbsp;Wh and will deliver over 100&nbsp;A into a short circuit
without any protection circuit to stop it. A LiPo fire is self-oxidising - it cannot be smothered and water
makes it worse.</p>
<ul>
  <li><strong>Balance charge only</strong>, with a proper charger, in a LiPo bag, on a non-flammable surface,
  and <strong>never unattended</strong>.</li>
  <li><strong>Never charge a puffed, damaged or crashed pack.</strong> Puffing means the cell is already
  failing. Dispose of it - salt water discharge then a recycling point.</li>
  <li><strong>Store at storage voltage</strong> - about 3.8&nbsp;V per cell. A pack left fully charged for
  months degrades and can puff.</li>
  <li><strong>Never short the leads.</strong> Keep the terminals covered, work with one lead at a time, and
  never leave a bare XT60 on a metal bench.</li>
  <li><strong>Check polarity with a meter</strong> before connecting anything new. Reverse polarity destroys
  an ESC instantly and can ignite it.</li>
  <li><strong>Know what you would do</strong> if a pack ignited on your bench right now. If the answer is
  nothing, do not charge it indoors.</li>
</ul>
</div>
<div class="note warn"><span class="t">Currents that melt things</span>
<ul>
  <li><strong>25 A through an undersized wire</strong> gets hot enough to melt insulation. 14&nbsp;AWG
  minimum.</li>
  <li><strong>A poorly soldered XT60</strong> is a resistive heat source at full load. Do them properly and
  check them by feel after a run.</li>
  <li><strong>The spark on connection is normal</strong> - the ESC's capacitors charging. It pits the contacts
  over time; an anti-spark connector or a resistor lead avoids it.</li>
  <li><strong>Motors and ESCs get genuinely hot</strong> on a bench, which has none of an aircraft's cooling
  airflow. Short runs, and a fan.</li>
</ul>
</div>`
});
