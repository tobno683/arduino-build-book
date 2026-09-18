/* Relative humidity lies to you while you are heating. Absolute humidity does not. */
AB.addProject({
slug: 'filament-dry-box',
title: 'Filament dryer that knows when it is actually working',
cat: 'printing',
level: 2,
time: '4 hours',
printed: true,
solder: true,
board: 'Nano',
tags: ['3d printing', 'filament', 'humidity', 'absolute humidity', 'dew point', 'ptc heater', 'mosfet', 'petg', 'tpu'],
blurb: 'Wet filament strings, pops and prints weak parts. This dries it - and unlike most dryers, it can tell whether water is really leaving, because the humidity number on every other dryer is misleading you the moment it turns the heater on.',

skills: ['Relative versus absolute humidity', 'Why heating makes RH lie', 'Self-regulating heaters', 'MOSFET switching a real load', 'Designing for heat inside plastic', 'Venting moisture'],

intro: `
<p>Most filaments absorb water from the air. PLA a little, PETG more, TPU and nylon a lot. Wet filament boils
as it passes through the hot end, which makes it pop, string, leave rough surfaces and print noticeably weaker
parts. If your prints have suddenly got worse and nothing else has changed, damp filament is a strong
suspect.</p>
<p>The fix is to warm the spool in a closed box. Commercial dryers do this and show you a humidity reading.
The trouble is that the number they show is the wrong one - it drops the moment the heater starts whether or
not any water has left - and this project explains why and measures the right thing instead.</p>`,

what: [
  'Heat a spool to a set temperature for its material, and hold it there.',
  'Circulate the air so the whole spool dries rather than just the side facing the heater.',
  'Measure absolute humidity, which tells you whether water is actually leaving.',
  'Stop by itself when the air has stopped getting drier, rather than on a guessed timer.',
  'Stay safe with a heater inside a plastic box, which is the design constraint that matters most.'
],

how: `
<p><strong>Relative humidity is relative to temperature, and that is the whole trap.</strong> RH is how much
water the air holds compared to the most it <em>could</em> hold at that temperature - and warm air can hold far
more. Heat a sealed box from 20 to 50&nbsp;&deg;C without removing a single gram of water and the RH falls from,
say, 60% to under 15%.</p>
<p>So a dryer showing "RH 15%" after twenty minutes has told you nothing about whether the filament is dry. It
has told you the air got warmer.</p>

<p><strong>Absolute humidity is what you want.</strong> Grams of water per cubic metre of air. It does not
change with temperature, only with how much water is actually in the air. Compute it from temperature and RH
with the Magnus formula - a few lines, shown in the sketch.</p>
<p>Now the behaviour makes sense. When you first heat the box, absolute humidity <em>rises</em>, because water
is coming out of the filament into the air. That rise is the proof it is working. Then, as you vent the moist
air, it falls back and levels off. When it has been flat for an hour, the filament has given up what it is
going to give up at that temperature.</p>

<p><strong>Water has to leave the box, or you are just moving it around.</strong> A sealed box heated and then
cooled puts the water straight back into the filament. The box needs a small vent - or you periodically swap
the air, or a bag of desiccant does the absorbing. The sketch treats the absolute humidity trend as the thing
to watch, which makes it obvious whether your venting is working.</p>

<p><strong>Temperature by material, and the limit is usually the box.</strong> Roughly:</p>
<ul>
  <li>PLA: 45-50&nbsp;&deg;C. Any hotter and the spool deforms on the reel.</li>
  <li>PETG: 60-65&nbsp;&deg;C.</li>
  <li>TPU: 50-55&nbsp;&deg;C.</li>
  <li>Nylon: 70&nbsp;&deg;C and upwards, which most plastic boxes cannot take.</li>
</ul>
<p>Which leads to the real constraint: the box. A cheap polypropylene food box softens around 70-80&nbsp;&deg;C.
A PLA-printed box softens at 55. If you print parts for the dryer, print them in ASA or PETG - printing a dryer's
heater mount in PLA and then running it at PETG temperature is a very common and slightly embarrassing
failure.</p>

<p><strong>A PTC heater is the safe choice in a plastic box.</strong> A positive temperature coefficient
element's resistance climbs steeply at its rated temperature, so it draws less power as it heats and simply
cannot run away. Pick one rated at or just above your target and it becomes very hard to overheat the box
even if the controller fails with the heater on.</p>
<p>A resistor or nichrome heater has no such limit. If the controller sticks on, it keeps going until
something melts.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'Its 5 V output drives the MOSFET gate fully on - an ESP32’s 3.3 V only half-enhances an IRLZ44N and the MOSFET runs hot.' },
  { id: 'ptc-heater', qty: 1, note: '12 V, rated near your target temperature. Self-regulating, so a stuck controller cannot run it away.' },
  { id: 'bme280', qty: 1, note: 'Temperature and relative humidity together, from which the sketch computes absolute humidity.' },
  { id: 'mosfet', qty: 1, note: 'Switches the heater. Logic-level, which matters - see the Nano note.' },
  { id: 'fan40', qty: 1, note: 'Circulation. Without it the side of the spool facing the heater dries and the far side does not.' },
  { id: 'res10k', qty: 1, note: 'Gate pull-down, so the heater is OFF while the Nano is booting or unplugged.' },
  { id: 'res220', qty: 1, note: 'Gate resistor.' },
  { id: 'oled13', qty: 1, note: 'Temperature, relative humidity, and - the useful one - the absolute humidity trend.' },
  { id: 'psu12v2a', qty: 1, note: 'For the heater. The Nano runs off the same supply through its regulator.' },
  { id: 'asa', qty: 1, note: 'For any printed parts inside the box. PLA softens below the temperatures this reaches.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'nano',      at: [0, 64] },
    { id: 'bb',   comp: 'bb400',     at: [0, 4] },
    { id: 'heat', comp: 'ptcheater', at: [-56, -52] },
    { id: 'q1',   comp: 'mosfet',    at: [-8, -48] },
    { id: 'env',  comp: 'bme280',    at: [34, -52] },
    { id: 'fan',  comp: 'fan',       at: [66, -14] },
    { id: 'oled', comp: 'oled13',    at: [66, 40] }
  ],
  wires: [
    { from: 'mcu.VIN',  to: 'bb.T+1',  color: 'red',    note: '12 V rail from the supply - the Nano regulates its own 5 V from this' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'heat.A',   to: 'bb.T+5',  color: 'brown',  note: 'Heater to 12 V - brown, this is the high-current path' },
    { from: 'heat.B',   to: 'q1.D',    color: 'brown',  note: 'Heater low side to the MOSFET drain' },
    { from: 'q1.S',     to: 'bb.T-5',  color: 'black',  note: 'MOSFET source to ground' },
    { from: 'q1.G',     to: 'mcu.D9',  color: 'green',  note: 'Gate, through 220 ohm, with 10 k to ground so it is off at boot' },
    { from: 'fan.+',    to: 'mcu.5V',  color: 'red',    note: 'Circulation fan on 5 V' },
    { from: 'fan.-',    to: 'bb.T-12', color: 'black',  note: 'Fan ground' },
    { from: 'env.VIN',  to: 'mcu.5V',  color: 'red',    note: 'BME280 power' },
    { from: 'env.GND',  to: 'bb.T-16', color: 'black',  note: 'BME280 ground' },
    { from: 'env.SDA',  to: 'mcu.A4',  color: 'green',  note: 'I2C data' },
    { from: 'env.SCL',  to: 'mcu.A5',  color: 'blue',   note: 'I2C clock' },
    { from: 'oled.VCC', to: 'mcu.5V',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-20', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.A4',  color: 'green',  note: 'Same I2C bus' },
    { from: 'oled.SCL', to: 'mcu.A5',  color: 'blue',   note: 'Same clock' }
  ]
},

wireIntro: `<p>A MOSFET switching a 12&nbsp;V heater, a sensor, a fan and a display. The heater circuit is the
one to get right - it is the only part here carrying real current, and the only part that can cause harm if it
fails on.</p>`,

wireNotes: `
<div class="note warn"><span class="t">The gate pull-down is a safety part</span>
<p>While the Nano is booting, or unplugged from USB, its pins float. A floating MOSFET gate can drift high and
turn the heater on with nothing controlling it. A 10&nbsp;k resistor from gate to ground holds it off until the
sketch deliberately turns it on.</p>
<p>It costs nothing and it is the difference between "off unless commanded" and "possibly on".</p></div>

<div class="note tip"><span class="t">Why a Nano rather than an ESP32 here</span>
<p>An IRLZ44N is "logic level", but its datasheet guarantees full turn-on at 5&nbsp;V on the gate, not
3.3&nbsp;V. Driven from an ESP32 it only partly turns on, runs hot, and wastes power. A 5&nbsp;V Nano drives it
properly. If you want an ESP32 for the network, use a MOSFET specified for 3.3&nbsp;V gate drive instead.</p></div>

<div class="note"><span class="t">Put the sensor in the air, not on the heater</span>
<p>Mount the BME280 where the circulating air passes, away from the heater surface. On the heater it reads the
heater; tucked in a corner it lags badly and the control loop overshoots.</p></div>`,

solderIntro: `<p>Straightforward perfboard work. Use thicker wire on the heater path, and make every heater
joint properly - a high-resistance joint carrying a couple of amps is its own small heater.</p>`,

solderSteps: [
  { h: 'Heater path first, in thick wire',
    body: `<p>12&nbsp;V to the heater, heater to the MOSFET drain, source to ground. 20&nbsp;AWG or thicker. A
    PTC heater pulls a few amps when cold, and thin wire or a poor joint gets warm at exactly the moment the box
    is warming too.</p>` },
  { h: 'Gate resistor and pull-down at the MOSFET',
    body: `<p>220&nbsp;ohm in series to the Nano pin, 10&nbsp;k from gate to source. Both close to the MOSFET.</p>
    <p>Before connecting the heater, measure: with the Nano unplugged, the gate should read 0&nbsp;V. That is the
    pull-down doing its job.</p>` },
  { h: 'Test the heater switching with a lamp',
    body: `<p>A 12&nbsp;V bulb in place of the heater lets you check the switching visibly and safely before a
    real heater goes in.</p>` },
  { h: 'Mount the heater on something that will not melt',
    body: `<p>An aluminium bracket, or an ASA or PETG printed mount - never PLA. Leave an air gap between the
    heater and any plastic wall of the box.</p>` },
  { h: 'A small vent',
    body: `<p>A few millimetres of opening, or a bag of desiccant inside. Without somewhere for the water to go,
    it goes back into the filament as the box cools.</p>` }
],

libraries: [
  { name: 'Adafruit BME280', by: 'Adafruit', why: 'Temperature and relative humidity.' },
  { name: 'U8g2', by: 'oliver', why: 'The display.' }
],

code: [{
  name: 'filament_dryer.ino',
  code: `/* ------------------------------------------------------------------
   Filament dryer - Nano, BME280, PTC heater via MOSFET

   Watches ABSOLUTE humidity, not relative. RH falls the moment the
   heater starts whether or not any water has left; absolute humidity
   only changes when water actually moves.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_BME280.h>
#include <U8g2lib.h>
#include <math.h>

#define HEATER 9

Adafruit_BME280 bme;
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);

/* Target by material. The practical ceiling is usually the BOX, not the
   filament - a PP food box softens around 70-80 C, PLA-printed parts at
   about 55. */
const float TARGET_C = 60.0;          // PETG
const float HYST     = 1.5;
const float CUTOFF_C = 72.0;          // hard limit, whatever the target

#define HIST 30                        // 30 minutes at one a minute
float ahHist[HIST];
int   ahCount = 0;
bool  done = false;

void setup() {
  Serial.begin(115200);
  pinMode(HEATER, OUTPUT);
  digitalWrite(HEATER, LOW);           // off until we know what is going on

  if (!bme.begin(0x76) && !bme.begin(0x77)) {
    // No sensor means no control. Leave the heater OFF.
    while (1) delay(1000);
  }
  oled.begin();
}

void loop() {
  float t  = bme.readTemperature();
  float rh = bme.readHumidity();

  // A failed sensor must fail towards OFF, never towards heating.
  if (isnan(t) || isnan(rh) || t > CUTOFF_C) {
    digitalWrite(HEATER, LOW);
    draw(t, rh, 0, "SAFETY CUTOFF");
    delay(2000);
    return;
  }

  if (!done) {
    // Simple thermostat with hysteresis is plenty - the PTC element
    // self-limits anyway, and the box has lots of thermal mass.
    if (t < TARGET_C - HYST) digitalWrite(HEATER, HIGH);
    if (t > TARGET_C)        digitalWrite(HEATER, LOW);
  } else {
    digitalWrite(HEATER, LOW);
  }

  float ah = absoluteHumidity(t, rh);
  logMinute(ah);
  draw(t, rh, ah, done ? "dry - done" : trendText());
  delay(2000);
}

/* Grams of water per cubic metre. Unlike RH it does not change with
   temperature - only with how much water is actually in the air. Magnus
   formula for saturation vapour pressure, then the ideal gas law. */
float absoluteHumidity(float tC, float rhPct) {
  float es = 6.112 * exp((17.67 * tC) / (tC + 243.5));   // hPa
  float e  = es * rhPct / 100.0;
  return 216.7 * e / (tC + 273.15);                      // g/m3
}

void logMinute(float ah) {
  static unsigned long last = 0;
  if (millis() - last < 60000UL && ahCount > 0) return;
  last = millis();

  if (ahCount < HIST) ahHist[ahCount++] = ah;
  else { memmove(ahHist, ahHist + 1, (HIST - 1) * sizeof(float)); ahHist[HIST - 1] = ah; }

  /* Done when absolute humidity has been flat for the whole window.
     Early on it RISES - water leaving the filament into the air - and that
     rise is the proof it is working. Flat means nothing more is coming out
     at this temperature. */
  if (ahCount == HIST) {
    float lo = ahHist[0], hi = ahHist[0];
    for (int i = 1; i < HIST; i++) { lo = min(lo, ahHist[i]); hi = max(hi, ahHist[i]); }
    if (hi - lo < 0.3) done = true;
  }
}

const char* trendText() {
  if (ahCount < 3) return "warming up";
  float d = ahHist[ahCount - 1] - ahHist[ahCount - 3];
  if (d > 0.2)  return "water coming out";
  if (d < -0.2) return "venting";
  return "levelling off";
}

void draw(float t, float rh, float ah, const char* status) {
  char line[24];
  oled.clearBuffer();
  oled.setFont(u8g2_font_helvB12_tr);
  snprintf(line, sizeof(line), "%.1fC  %.0f%%", t, rh);
  oled.drawStr(0, 16, line);

  // The number that actually means something.
  oled.setFont(u8g2_font_6x10_tf);
  snprintf(line, sizeof(line), "abs %.1f g/m3", ah);
  oled.drawStr(0, 34, line);
  oled.drawStr(0, 50, status);
  oled.drawStr(0, 63, digitalRead(HEATER) ? "heater on" : "heater off");
  oled.sendBuffer();
}`
}],

trouble: [
  { q: 'RH dropped to 10% in twenty minutes but prints still string',
    a: `That is the trap this project exists to explain. RH falls because the air got warmer, not because the
    filament dried. Watch absolute humidity instead - and give it hours, not minutes. PETG commonly needs four to
    six.` },
  { q: 'Absolute humidity rises and never falls',
    a: `The water has nowhere to go. Add a small vent or a bag of desiccant - otherwise the water leaves the
    filament, sits in the air, and goes back in when the box cools.` },
  { q: 'The heater never switches off',
    a: `MOSFET failed short, or the gate is floating high. Check the 10&nbsp;k pull-down, and measure the gate
    voltage. This is also exactly why a PTC heater is used - even stuck on, it self-limits near its rating.` },
  { q: 'The MOSFET gets hot',
    a: `Not fully turned on. Almost always because it is being driven from 3.3&nbsp;V. A Nano's 5&nbsp;V drives an
    IRLZ44N properly.` },
  { q: 'The spool or a printed part warped',
    a: `Target too high for the material, or a printed part inside the box was PLA. PLA spools deform above about
    50&nbsp;&deg;C, and PLA parts soften around 55.` },
  { q: 'Temperature overshoots by several degrees',
    a: `The sensor is too far from the air stream, or on a wall. Move it into the circulating air, and make sure
    the fan is actually moving air across the spool.` }
],

safety: `
<div class="note warn"><span class="t">A heater inside a plastic box</span>
<p>This is the whole safety question for this project, and the design answers it in layers:</p>
<ul>
  <li><strong>A PTC element</strong>, which self-limits near its rated temperature, so a controller stuck on
  cannot run it away the way a resistor heater would.</li>
  <li><strong>A gate pull-down</strong>, so the heater is off whenever the Nano is not actively driving it.</li>
  <li><strong>A hard cut-off in software</strong> at 72&nbsp;&deg;C, and a failed sensor treated as "heater
  off".</li>
  <li><strong>A box rated above the temperature you run it at.</strong> Polypropylene is typically fine to
  around 80&nbsp;&deg;C; printed parts inside should be ASA or PETG.</li>
</ul>
<p>Still: do not leave it running unattended for long periods until you have watched it through several
complete cycles, and keep it away from anything flammable. An inline thermal fuse rated a little above your
cut-off, on the heater supply, is a cheap last line of defence that does not depend on any software.</p></div>`,

next: `
<ul>
  <li><strong>Feed it straight to the printer</strong> - a PTFE tube out through the lid so the filament stays
  in the dry box while it prints. That is how most people end up using these.</li>
  <li><strong>Log a whole drying run</strong> and watch the absolute humidity rise and fall. It is a genuinely
  satisfying curve and it tells you how wet the spool was.</li>
  <li><strong>Storage mode</strong>: once dry, hold at a low temperature with desiccant and just monitor. Most of
  the value is in keeping filament dry, not drying it.</li>
  <li><strong>Pair it with the <a href="project.html?p=printer-fire-guard">printer fire guard</a></strong> -
  the same sensing ideas, pointed at safety instead of print quality.</li>
</ul>`
});
