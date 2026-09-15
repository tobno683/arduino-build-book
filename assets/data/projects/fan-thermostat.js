/* Temperature-controlled fan: DHT22, MOSFET, 5 V fan, OLED. No soldering. */
AB.addProject({
slug: 'fan-thermostat',
title: 'Thermostat for a fan',
cat: 'smart-home',
level: 2,
time: '1 hour',
solder: false,
board: 'Nano',
tags: ['dht22', 'mosfet', 'fan', 'pwm', 'hysteresis', 'no soldering', 'thermostat'],
blurb: 'Reads the temperature and speeds a fan up as it climbs, instead of banging on and off. For a cupboard full of network gear, a 3D printer, or a greenhouse.',

skills: ['Proportional control', 'Hysteresis', 'MOSFET switching', 'PWM', 'Minimum start speed'],

intro: `
<p>The first version of this everybody writes is <code>if (temp &gt; 25) fanOn();</code> and it is
unsatisfying: the fan hammers on and off every few seconds around the threshold, which is noisy and wears out
the bearing.</p>
<p>Two ideas fix it, and both come back constantly in later projects. <strong>Hysteresis</strong> means using
two thresholds instead of one - switch on at 26, do not switch off until 24 - so it cannot oscillate.
<strong>Proportional control</strong> means the fan speed rises with the temperature rather than jumping to
full, so most of the time it runs quietly at 30&nbsp;% and you never notice it.</p>`,

what: [
  'Read temperature and humidity every two seconds and show them on a small OLED.',
  'Hold the fan off below a set temperature, then ramp its speed smoothly up to full across a settable band.',
  'Kick the fan briefly to full when starting, because a PWM-driven fan will not start from a slow duty cycle.',
  'Use two thresholds so it cannot chatter around the switching point.',
  'Show the fan speed as a percentage and a bar, so you can see it working.'
],

how: `
<p>A 5&nbsp;V fan pulls 150-250&nbsp;mA - about ten times what an Arduino pin will give you. So the pin does
not power it; it controls a <strong>MOSFET</strong>, which is a switch operated by voltage rather than current.
Put a voltage on its gate and current flows from drain to source, and the gate itself draws essentially
nothing.</p>
<p>The MOSFET goes in the <em>negative</em> side of the fan - the fan's positive goes straight to 5&nbsp;V, its
negative to the MOSFET's drain, and the source to ground. That is a <strong>low-side switch</strong>, and it is
the easy arrangement because the gate voltage is then measured against the same ground as the Arduino.</p>
<p>The word <strong>logic level</strong> in IRLZ44N is the part that matters: it turns fully on with 5&nbsp;V
on its gate. An ordinary IRF540 needs about 10&nbsp;V, so from a 5&nbsp;V pin it only half-turns-on, drops a
couple of volts across itself and converts the difference into heat. Buying the wrong one is the commonest
failure of this circuit.</p>
<p><strong>Speed control</strong> is PWM: <code>analogWrite()</code> switches the gate on and off about 490
times a second, and the fan's inertia averages it. Below roughly 30&nbsp;% duty most small fans will not start
turning at all - they will sit there humming - which is why the sketch kicks them to full for a moment
first.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'dht22', qty: 1, note: 'The 3-pin breakout, which has the pull-up resistor fitted. A DS18B20 probe works too if you want to measure somewhere the board is not.' },
  { id: 'fan40', qty: 1, note: 'Any 5 V fan. A 40 mm one moves enough air for a cupboard; 80 mm is quieter for the same airflow.' },
  { id: 'mosfet', qty: 1, note: 'IRLZ44N. LOGIC LEVEL - an IRF540 will get hot and work badly.' },
  { id: 'res10k', qty: 1, note: 'Gate pull-down, so the fan cannot spin up while the board is booting.' },
  { id: 'res220', qty: 1, note: 'In series with the gate.' },
  { id: 'diode', qty: 1, note: 'Flyback diode across the fan. A fan is a motor, and motors kick back when switched off.' },
  { id: 'oled13', qty: 1 },
  { id: 'bb-830', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'psu5v3a', qty: 1, note: 'Needs to run the fan as well as the board - a phone charger is fine, a laptop USB port is marginal.' }
],

tools: [
  { id: 'dmm', why: 'Optional. Useful for confirming the gate really is at 0 V when the fan should be off.' }
],

build: {
  parts: [
    { id: 'nano', comp: 'nano',   at: [0, 40] },
    { id: 'bb',   comp: 'bb830',  at: [0, -34] },
    { id: 'dht',  comp: 'dht22',  at: [-58, -96], ry: 180 },
    { id: 'oled', comp: 'oled13', at: [-14, -98], ry: 180 },
    { id: 'q1',   comp: 'mosfet', at: [26, -92] },
    { id: 'fan',  comp: 'fan',    at: [64, -94] }
  ],
  wires: [
    { from: 'nano.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V onto the lower red rail' },
    { from: 'nano.GND',  to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+12',   to: 'bb.T+12', color: 'red',    note: 'Bridge the two red rails' },
    { from: 'bb.B-12',   to: 'bb.T-12', color: 'black',  note: 'Bridge the two blue rails' },
    { from: 'dht.VCC',   to: 'bb.T+3',  color: 'red',    note: 'Sensor power' },
    { from: 'dht.GND',   to: 'bb.T-3',  color: 'black',  note: 'Sensor ground' },
    { from: 'dht.DATA',  to: 'nano.D2', color: 'yellow', note: 'The DHT22 single-wire data line' },
    { from: 'oled.VCC',  to: 'bb.T+7',  color: 'red',    note: 'Screen power' },
    { from: 'oled.GND',  to: 'bb.T-7',  color: 'black',  note: 'Screen ground' },
    { from: 'oled.SDA',  to: 'nano.A4', color: 'blue',   note: 'I2C data. On a Nano this is fixed to A4' },
    { from: 'oled.SCL',  to: 'nano.A5', color: 'green',  note: 'I2C clock. Fixed to A5' },
    { from: 'q1.G',      to: 'nano.D9', color: 'orange', note: 'Gate, through a 220 ohm resistor. D9 does PWM' },
    { from: 'q1.S',      to: 'bb.T-18', color: 'black',  note: 'Source to ground' },
    { from: 'q1.D',      to: 'fan.-',   color: 'brown',  note: 'Drain to the fan NEGATIVE. The MOSFET breaks the return path' },
    { from: 'fan.+',     to: 'bb.T+18', color: 'red',    note: 'Fan positive straight to 5 V' }
  ]
},

wireIntro: `<p>Fifteen connections. The MOSFET is the only part that needs thought, and the thing to hold on to
is that it sits in the fan's <em>negative</em> lead, not the positive.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Which leg is which on a TO-220</span>
<p>Hold the IRLZ44N with the metal tab facing away from you and the three legs pointing down. Left to right
they are <strong>Gate, Drain, Source</strong>.</p>
<p>The tab is internally connected to the drain, so if you ever bolt one to something metal, that metal is at
the drain's potential.</p></div>

<div class="note warn"><span class="t">The 10 k gate pull-down is not optional</span>
<p>From the gate to ground. While the Nano boots, D9 is an undriven input and the gate floats - and a floating
MOSFET gate holds whatever charge it last had, so the fan twitches or runs at every power-up.</p>
<p>The 220&nbsp;&Omega; in series limits the current spike into the gate's capacitance at each switching edge.
It works without it; it just puts a spike on your 5&nbsp;V rail 490 times a second.</p></div>

<div class="note warn"><span class="t">The flyback diode across the fan</span>
<p>A fan is a motor, and a motor is a coil. Cut the current and the collapsing magnetic field produces a
voltage spike in the opposite direction, which is what kills the switching device.</p>
<p>A 1N4007 goes across the fan's two leads <strong>backwards</strong>: the striped end (cathode) to the
positive side. In normal running it does nothing at all; at the moment of switch-off it gives the spike a
harmless loop to dump into.</p></div>

<div class="note tip"><span class="t">Keep the sensor away from the board</span>
<p>The Nano's regulator and the fan both make heat. A DHT22 sitting next to them reads its own microclimate,
which is a surprisingly stubborn source of "why is it always two degrees high". Put it on longer wires, at the
far end of whatever you are cooling.</p></div>`,

solderIntro: `<p>No soldering to build it. When it moves into a cupboard permanently, these are the joints.</p>`,

solderSteps: [
  { h: 'Female sockets for the Nano and the screen',
    body: `<p>Two 15-pin strips and a 4-pin. Use the module itself as the spacing jig: push the headers onto its
    pins, drop the assembly into the perfboard, solder one corner pin of each strip, then remove the module and
    do the rest.</p>` },
  { h: 'The MOSFET with its two resistors folded in',
    body: `<p>Push the three legs through. Bend one leg of the 220&nbsp;&Omega; through the hole next to the
    gate and solder both to the same pad; do the same with the 10&nbsp;k between the gate and the ground rail.
    No patch wires needed.</p>
    <p>Keep both resistors physically close to the MOSFET - it is the gate that needs protecting from stray
    charge, not the Arduino.</p>` },
  { h: 'A screw terminal for the fan',
    body: `<p>A 2-pin block at the board edge. Fans get swapped, and unscrewing beats desoldering. Solder the
    1N4007 directly across those two terminals, stripe towards the positive one.</p>
    <p>Do not tin the fan's wire ends before putting them in a screw terminal - solder cold-flows under the
    clamping pressure and the screw works loose over months.</p>` },
  { h: 'Sensor on a long lead',
    body: `<p>Three wires, as long as you need, twisted together. Tin both ends of each before soldering.
    Heat-shrink over each joint, slid on first.</p>` },
  { h: 'Buzz it out before power',
    body: `<p>Continuity: 5&nbsp;V to ground silent. Gate to ground should read about 10&nbsp;k on the
    resistance range, not zero - if it reads zero, the pull-down is shorted and the fan will never run.</p>` }
],

assembly: [
  { h: 'Power rails first, then stop and test',
    body: `<p>Four wires, plug in, confirm the Nano lights, unplug.</p>` },
  { h: 'Sensor and screen before the fan',
    body: `<p>Get the temperature appearing on the OLED with nothing else connected. That is two thirds of the
    project and it is much easier to debug without a fan spinning.</p>
    <p>If the screen stays dark, run an I2C scanner - the address is 0x3C or 0x3D and you need to know
    which.</p>` },
  { h: 'Then the MOSFET and the fan',
    body: `<p>Wire the gate resistor, the pull-down, the MOSFET and the fan. Power up with
    <code>TEST_MODE</code> set to true - the sketch then ramps the fan from 0 to 100&nbsp;% and back, so you can
    hear exactly where it starts turning.</p>` },
  { h: 'Note the minimum speed that actually spins',
    body: `<p>During that ramp, listen for the point where it goes from humming to turning. Put that number in
    <code>MIN_PWM</code>. It is usually somewhere between 70 and 110 for a small fan, and it varies between
    fans of the same model.</p>` },
  { h: 'Set the thresholds and install it',
    body: `<p>Sensor at the top of the cupboard where the heat collects, fan positioned to pull air <em>out</em>
    rather than push it in - exhausting works better than blowing, because it draws cool air in through every
    gap rather than just stirring the hot air around.</p>` }
],

libraries: [
  { name: 'DHT sensor library', by: 'Adafruit', why: 'Decodes the DHT22.' },
  { name: 'Adafruit Unified Sensor', by: 'Adafruit', why: 'Dependency of the above - the IDE will offer to install it.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The screen.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Drawing.' }
],

code: [{
  name: 'fan_thermostat.ino',
  intro: `<p>Set <code>TEST_MODE</code> to <code>true</code> for the first run - it ignores the sensor and just
  ramps the fan, which is how you find <code>MIN_PWM</code>.</p>`,
  code: `/* ------------------------------------------------------------------
   Thermostat for a fan
   DHT22 on D2, SSD1306 on I2C, logic-level MOSFET gate on D9.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// ---- settings --------------------------------------------------------
#define DHT_PIN     2
#define DHT_TYPE    DHT22
#define GATE_PIN    9        // must be a PWM pin: 3,5,6,9,10,11
#define OLED_ADDR   0x3C

const float ON_ABOVE_C   = 26.0;   // start the fan above this
const float OFF_BELOW_C  = 24.0;   // do not stop until it drops below this
const float FULL_SPEED_C = 32.0;   // full speed at and above this

const int  MIN_PWM       = 90;     // slowest duty that actually spins - MEASURE IT
const int  KICK_MS       = 350;    // full power for this long when starting
const bool TEST_MODE     = false;  // true = ignore the sensor, just ramp
// ----------------------------------------------------------------------

Adafruit_SSD1306 display(128, 64, &Wire, -1);
DHT dht(DHT_PIN, DHT_TYPE);

float tempC = NAN, humid = NAN;
int   fanPwm = 0;
bool  fanWanted = false;           // the latched on/off state (hysteresis)
unsigned long lastRead = 0, lastDraw = 0;
unsigned long runningSince = 0;

void setup() {
  Serial.begin(9600);
  pinMode(GATE_PIN, OUTPUT);
  analogWrite(GATE_PIN, 0);

  dht.begin();

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("No screen at that address - run an I2C scanner."));
    for (;;) { }
  }
  display.setTextColor(SSD1306_WHITE);
  display.clearDisplay();
  display.setCursor(18, 28);
  display.print(F("warming up..."));
  display.display();

  lastRead = millis() - 2000;
}

void loop() {
  if (TEST_MODE) { rampTest(); return; }

  // The DHT22 refuses to be read more often than every two seconds.
  if (millis() - lastRead >= 2000) {
    lastRead = millis();
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    if (!isnan(h) && !isnan(t)) { humid = h; tempC = t; }
    else Serial.println(F("DHT read failed"));
    decide();
  }

  if (millis() - lastDraw > 200) {
    lastDraw = millis();
    draw();
  }
}

/* --- the control logic ------------------------------------------------ */
void decide() {
  if (isnan(tempC)) return;

  // Hysteresis: two thresholds, not one. Without this the fan chatters
  // on and off every few seconds whenever the temperature sits near the
  // switching point - which is exactly where it will sit.
  if (tempC >= ON_ABOVE_C)  fanWanted = true;
  if (tempC <= OFF_BELOW_C) fanWanted = false;

  if (!fanWanted) {
    setFan(0);
    return;
  }

  // Proportional: ramp from MIN_PWM at the switch-on point up to full
  // at FULL_SPEED_C. Most of the time it sits near the bottom and is
  // inaudible, which is the whole point.
  int pwm = map((int)(tempC * 10),
                (int)(ON_ABOVE_C * 10), (int)(FULL_SPEED_C * 10),
                MIN_PWM, 255);
  setFan(constrain(pwm, MIN_PWM, 255));
}

void setFan(int pwm) {
  // Starting from stopped: a small fan will not begin turning at 35 %
  // duty, it just hums. Kick it to full for a moment, then settle.
  if (pwm > 0 && fanPwm == 0) {
    analogWrite(GATE_PIN, 255);
    runningSince = millis();
    delay(KICK_MS);
    Serial.println(F("fan kick-started"));
  }

  fanPwm = pwm;
  analogWrite(GATE_PIN, fanPwm);

  if (pwm == 0) runningSince = 0;

  Serial.print(tempC, 1);
  Serial.print(F(" C  fan "));
  Serial.print(percent());
  Serial.println(F("%"));
}

int percent() {
  if (fanPwm == 0) return 0;
  return map(fanPwm, 0, 255, 0, 100);
}

/* --- the screen ------------------------------------------------------- */
void draw() {
  display.clearDisplay();

  if (isnan(tempC)) {
    display.setTextSize(1);
    display.setCursor(18, 28);
    display.print(F("no sensor"));
    display.display();
    return;
  }

  display.setTextSize(3);
  display.setCursor(0, 0);
  display.print(tempC, 1);
  display.setTextSize(1);
  display.print(F("C"));

  display.setCursor(90, 2);
  display.print(humid, 0);
  display.print(F("% RH"));

  display.setCursor(90, 14);
  display.print(fanWanted ? F("ON ") : F("OFF"));

  // fan speed as a number and a bar
  display.setTextSize(2);
  display.setCursor(0, 30);
  display.print(percent());
  display.setTextSize(1);
  display.print(F("%"));

  display.drawRect(46, 31, 82, 12, SSD1306_WHITE);
  if (fanPwm) display.fillRect(48, 33, percent() * 78 / 100, 8, SSD1306_WHITE);

  // the two thresholds, written out so the behaviour is never a mystery
  display.setCursor(0, 50);
  display.print(F("on "));
  display.print(ON_ABOVE_C, 0);
  display.print(F("  off "));
  display.print(OFF_BELOW_C, 0);
  display.print(F("  max "));
  display.print(FULL_SPEED_C, 0);

  if (runningSince) {
    unsigned long mins = (millis() - runningSince) / 60000UL;
    display.setCursor(104, 50);
    display.print(mins);
    display.print(F("m"));
  }

  display.display();
}

/* --- first-run helper -------------------------------------------------
   Ramps the fan 0 to 100 and back, printing the duty. Listen for where
   it starts turning - that number goes in MIN_PWM. */
void rampTest() {
  for (int pwm = 0; pwm <= 255; pwm += 5) {
    analogWrite(GATE_PIN, pwm);
    display.clearDisplay();
    display.setTextSize(2);
    display.setCursor(10, 20);
    display.print(F("PWM "));
    display.print(pwm);
    display.display();
    Serial.println(pwm);
    delay(400);
  }
  for (int pwm = 255; pwm >= 0; pwm -= 5) {
    analogWrite(GATE_PIN, pwm);
    delay(120);
  }
  delay(1500);
}`,
  after: `<p>The kick-start is the detail that makes this feel finished. Ask a stopped 40&nbsp;mm fan for
  35&nbsp;% duty and it will sit there buzzing and drawing current without turning - which sounds exactly like a
  broken fan. Giving it full power for a third of a second and then dropping to the speed you actually wanted
  costs nothing and removes the whole problem.</p>`
}],

upload: `
<p>Nano, correct port. Run once with <code>TEST_MODE = true</code> and note where the fan starts turning, put
that in <code>MIN_PWM</code>, then set it back to <code>false</code> and re-upload.</p>
<p>Serial Monitor at 9600 prints the temperature and fan percentage on every reading.</p>`,

tune: [
  { h: 'Find MIN_PWM properly',
    body: `<p>It is the single number that decides whether this feels well made. Run the ramp test and listen -
    the fan goes from silent, to a hum, to actually turning. Use the turning point plus about 10.</p>
    <p>It differs between fans of the same model, and it creeps up as a fan ages and its bearing stiffens.</p>` },
  { h: 'Set the three temperatures',
    body: `<p><code>ON_ABOVE_C</code> and <code>OFF_BELOW_C</code> should be at least 2&nbsp;degrees apart - the
    gap is the hysteresis, and a narrower gap brings the chattering back.</p>
    <p><code>FULL_SPEED_C</code> sets how aggressive the ramp is. Close to the on-point means it jumps to full
    quickly; far away means a long gentle ramp. For a network cupboard, on at 28, off at 25, full at 35 works
    well.</p>` },
  { h: 'Quieter, or more airflow',
    body: `<p>A bigger fan turning slowly moves the same air as a small one turning fast, and is much quieter,
    because noise goes up steeply with tip speed. If it is audible and it bothers you, an 80&nbsp;mm fan is the
    answer rather than any change to the code.</p>` },
  { h: 'PWM whine',
    body: `<p>The default 490&nbsp;Hz is right in the audible range, and some fans sing at it. Two fixes: run
    the fan on or off only (bang-bang with hysteresis), or raise the PWM frequency above hearing with a timer
    register change - <code>TCCR1B = (TCCR1B &amp; 0b11111000) | 0x01;</code> puts pins 9 and 10 at
    31&nbsp;kHz.</p>
    <p>That register line also affects <code>delay()</code> on some boards, so test it before you rely on it.</p>` },
  { h: 'Measure somewhere else',
    body: `<p>Swap the DHT22 for a DS18B20 probe and you can measure inside a printer enclosure or at the top of
    a rack while the board stays somewhere convenient. Same logic, different three lines of reading code - see
    the <a href="project.html?p=fridge-freezer-logger">fridge logger</a>.</p>` }
],

trouble: [
  { q: 'Fan runs at full speed all the time',
    a: `The gate is stuck high. Check the 10&nbsp;k pull-down is actually between gate and ground, and that D9
    is the pin you wired. Measure the gate with a multimeter: it should read near 0&nbsp;V when the fan should
    be off.` },
  { q: 'Fan never runs',
    a: `In order: is the MOSFET in the negative lead, not the positive? Are the legs Gate-Drain-Source as you
    assumed? Is <code>MIN_PWM</code> too low for this fan to start? Run the ramp test - it answers all three.` },
  { q: 'Fan hums but does not turn',
    a: `Classic under-duty. Raise <code>MIN_PWM</code>, and make sure the kick-start code is present.` },
  { q: 'MOSFET gets hot',
    a: `It is an IRF540 or similar non-logic-level part, only half turning on. Check the printing on the tab.
    A logic-level MOSFET switching a 200&nbsp;mA fan should stay stone cold.` },
  { q: 'Fan clicks on and off every few seconds',
    a: `Not enough hysteresis. Widen the gap between <code>ON_ABOVE_C</code> and <code>OFF_BELOW_C</code>.` },
  { q: 'Temperature reads 2-3 degrees high',
    a: `The sensor is in the warm air from the Nano's regulator or the fan's exhaust. Move it away on longer
    wires - this is the most common complaint and it is almost never the sensor.` },
  { q: 'Readings are nan',
    a: `Wrong <code>DHT_TYPE</code> - a DHT11 in a sketch set to DHT22 fails exactly like this. Otherwise check
    the DATA wire is on D2 and the sensor has 5&nbsp;V.` },
  { q: 'Nano resets when the fan starts',
    a: `The kick to full is a current step. Use a proper supply rather than a laptop USB port, and add a
    470&nbsp;&micro;F capacitor across the 5&nbsp;V rail.` },
  { q: 'Screen is blank',
    a: `Address. Run an I2C scanner and change <code>OLED_ADDR</code> to what it prints.` }
],

next: `
<ul>
  <li><strong>Put it on the network</strong>: swap the Nano for an ESP32 and publish temperature and fan speed
  to MQTT, so you can chart whether the cupboard is actually staying cool. See the
  <a href="project.html?p=smart-plug-relay">Wi-Fi switch</a> for the MQTT half.</li>
  <li><strong>Two zones</strong>: a second sensor and a second MOSFET on another PWM pin.</li>
  <li><strong>Add a tacho input.</strong> Four-wire PC fans have a tachometer output - read it on an interrupt
  pin and you can display real RPM and alarm if the fan has seized.</li>
  <li><strong>Drive a heater instead</strong> with a relay, and you have a greenhouse thermostat. The control
  logic is identical with the comparison reversed.</li>
</ul>`
});
