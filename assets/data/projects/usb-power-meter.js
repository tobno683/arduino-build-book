/* INA219 USB power meter with an OLED, min/max and mAh counting. */
AB.addProject({
slug: 'usb-power-meter',
title: 'USB power meter',
cat: 'power',
level: 2,
time: '2 hours',
solder: true,
feature: true,
board: 'Nano',
tags: ['ina219', 'oled', 'current', 'mah', 'i2c', 'measurement', 'battery'],
blurb: 'Volts, amps, watts and accumulated milliamp-hours on a little screen. The tool that answers "why does my project keep resetting?"',

skills: ['Shunt measurement', 'I2C', 'Coulomb counting', 'Averaging', 'Building a tool'],

intro: `
<p>Half the difficult bugs in this hobby are power bugs, and they all look like something else: a board that
resets when a servo moves, a camera that fails to boot, a battery that lasts a tenth as long as the arithmetic
said. A multimeter measures current badly - you have to break the circuit, and it cannot show you a
50&nbsp;millisecond spike.</p>
<p>This is a bench tool that lives in line with whatever you are testing and tells you what is really
happening. Build it early, and every project after it gets easier.</p>`,

what: [
  'Show bus voltage, current, and power, updated ten times a second.',
  'Track the maximum current seen, including short spikes that a multimeter would miss.',
  'Count accumulated milliamp-hours and watt-hours since it was reset, so you can measure a battery discharge properly.',
  'Show a rolling graph of the last minute of current.',
  'Reset its counters with a button.'
],

how: `
<p>The <strong>INA219</strong> measures current the honest way: it puts a very small, very precise resistor
(0.1&nbsp;&Omega; on the common breakout) in the path and measures the voltage across it. Ohm's law does the
rest - 1&nbsp;A through 0.1&nbsp;&Omega; is 100&nbsp;mV, which is a comfortable thing to measure accurately.</p>
<p>What makes it more than a resistor and a voltmeter is that it is a <em>high-side</em> monitor: the shunt
sits in the positive rail, and the chip's differential input can measure the tiny difference between two
points that are both at 5&nbsp;V. Low-side monitors put the shunt in the ground return, which is easier to
build and lifts your circuit's ground off zero, which causes its own problems.</p>
<p>It also reads the bus voltage, so it can calculate power itself, and it talks I2C so the whole thing is two
wires.</p>
<p><strong>Milliamp-hours</strong> are just current integrated over time. Every reading, multiply the current
by how long it has been since the last reading and add it up. That is coulomb counting, and it is exactly how a
phone estimates its battery percentage.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'ina219', qty: 1, note: 'The common breakout has a 0.1 ohm shunt and reads up to 3.2 A. There is a 0.01 ohm variant for higher currents with less precision.' },
  { id: 'oled13', qty: 1 },
  { id: 'button', qty: 1, note: 'Resets the accumulated totals.' },
  { id: 'screwterm', qty: 2, note: 'In and out. Or solder a USB socket and a USB plug on for a proper in-line meter.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'box-abs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true, note: 'Cut one in half to make the in-line leads. The red and black wires are the ones you need.' }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',   at: [0, 0] },
    { id: 'ina',  comp: 'ina219', at: [-44, -44], ry: 180 },
    { id: 'oled', comp: 'oled13', at: [24, -50], ry: 180 },
    { id: 'btn',  comp: 'button', at: [40, 36] },
    { id: 'load', comp: 'block',  at: [-46, -104], opt: { w: 44, h: 20, d: 32, c: '#3a4148' }, label: 'Thing under test' }
  ],
  wires: [
    { from: 'ina.VCC',  to: 'nano.5V',   color: 'red',    note: 'Sensor power - NOT the measured rail' },
    { from: 'ina.GND',  to: 'nano.GND',  color: 'black',  note: 'Ground' },
    { from: 'ina.SDA',  to: 'nano.A4',   color: 'blue',   note: 'I2C data' },
    { from: 'ina.SCL',  to: 'nano.A5',   color: 'green',  note: 'I2C clock' },
    { from: 'ina.VIN+', to: 'load.f',    color: 'brown',  note: 'Supply comes IN here' },
    { from: 'ina.VIN-', to: 'load.n',    color: 'brown',  note: 'And OUT here to the thing being measured' },
    { from: 'oled.VCC', to: 'nano.5V',   color: 'red',    note: 'Screen power' },
    { from: 'oled.GND', to: 'nano.GND2', color: 'black',  note: 'Screen ground' },
    { from: 'oled.SDA', to: 'nano.A4',   color: 'blue',   note: 'Same I2C pair as the sensor' },
    { from: 'oled.SCL', to: 'nano.A5',   color: 'green',  note: 'Same I2C pair as the sensor' },
    { from: 'btn.1A',   to: 'nano.D3',   color: 'yellow', note: 'Reset the totals' },
    { from: 'btn.2A',   to: 'nano.GND2', color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">VIN+ and VIN- are the measured path, not power for the chip</span>
<p>The current you are measuring flows <strong>through</strong> the module, in at VIN+ and out at VIN-. The
chip's own power comes from the separate VCC and GND pins, which here come from the Nano.</p>
<p>Wiring your supply to VCC and expecting a reading is the classic first mistake - it powers the chip and
measures nothing.</p></div>

<div class="note warn"><span class="t">Grounds must be common</span>
<p>The ground of the circuit being measured, the INA219's ground and the Nano's ground are all one node. This
is a high-side monitor: only the positive rail passes through the shunt.</p></div>

<div class="note tip"><span class="t">Two ways to power the meter itself</span>
<p>Simplest: power the Nano over USB from a laptop while it measures something else. Cleaner: take the meter's
own 5&nbsp;V from the input side, so one supply runs everything. Then the meter measures the load
<em>plus</em> a constant 25&nbsp;mA of its own - note that figure and subtract it, or move the meter's power tap
to before VIN+.</p></div>`,

solderSteps: [
  { h: 'Sockets for the Nano, the sensor and the screen',
    body: `<p>Two 15-pin strips, one 4-pin and one 4-pin. All three modules removable; the INA219 especially,
    because you may want to swap it for the 0.01&nbsp;&Omega; version later.</p>` },
  { h: 'Heavy wire for the measured path',
    body: `<p>The current under test flows through VIN+ and VIN-. Use 20&nbsp;AWG or thicker for those two
    connections - anything thinner adds resistance in series with the shunt and makes your readings wrong,
    which is a particularly annoying way to be misled by your own instrument.</p>
    <p>Keep those two runs short and direct from the screw terminals to the module.</p>` },
  { h: 'Screw terminals at the edge',
    body: `<p>One 2-pin for "supply in", one for "load out". Label them with a marker - and get them the right
    way round, because reversed the readings come out negative, which is confusing rather than harmful.</p>` },
  { h: 'Or make it a real in-line USB meter',
    body: `<p>Cut a USB cable in half. In each half, find the red and black wires (the green and white data pair
    you leave joined, or just twist them through). Red from the plug side goes to VIN+; red from the socket
    side to VIN-. Black passes straight through and joins the common ground.</p>
    <p>Sleeve every joint. Then the meter plugs in between a charger and whatever you are testing.</p>` },
  { h: 'Button and check',
    body: `<p>One leg to D3, the other to ground. Then: continuity from VIN+ to VIN- must show near-zero
    resistance (through the 0.1&nbsp;&Omega; shunt), and VIN+ to ground must be open.</p>` }
],

assembly: [
  { h: 'Test with something known first',
    body: `<p>A single LED and a 220&nbsp;&Omega; resistor on 5&nbsp;V should read about 13&nbsp;mA. If it
    reads 0 or something wild, the load is wired to the wrong pins.</p>` },
  { h: 'Check the I2C address',
    body: `<p>Default is <code>0x40</code>. The module has two solder jumpers, A0 and A1, that shift it to 0x41,
    0x44 or 0x45 - useful if you ever want two meters on one bus. Run an I2C scanner if it is not found.</p>` },
  { h: 'Note the meter\'s own consumption',
    body: `<p>Power it and read the current with nothing connected to the output. That figure - typically around
    25&nbsp;mA for a Nano plus an OLED - is your offset if the meter powers itself from the measured rail.</p>` },
  { h: 'Then go and use it on something',
    body: `<p>The best first test is an ESP32 connecting to Wi-Fi. You will see the current jump from 80 to
    400&nbsp;mA in bursts, which is the thing every ESP32 brownout article is really about, made visible.</p>` }
],

libraries: [
  { name: 'Adafruit INA219', by: 'Adafruit', why: 'Reads the shunt and bus voltage and does the conversions.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The screen.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Drawing.' }
],

code: [{
  name: 'usb_power_meter.ino',
  code: `/* ------------------------------------------------------------------
   USB power meter
   INA219 and SSD1306 on I2C, reset button on D3.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_INA219.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define BUTTON_PIN 3
#define OLED_ADDR  0x3C
#define GRAPH_W   128

Adafruit_INA219 ina;
Adafruit_SSD1306 display(128, 64, &Wire, -1);

float volts = 0, milliamps = 0, watts = 0;
float peakmA = 0, minVolts = 99;
double mAh = 0, mWh = 0;

unsigned long lastSample = 0, lastDraw = 0, lastGraph = 0, startedAt = 0;
uint8_t graph[GRAPH_W];
uint8_t graphHead = 0;
float graphMax = 100;                  // autoscaling upper bound, in mA

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("no screen"));
    for (;;) { }
  }
  display.setTextColor(SSD1306_WHITE);
  display.clearDisplay();
  display.setCursor(20, 28);
  display.print(F("power meter"));
  display.display();

  if (!ina.begin()) {
    display.clearDisplay();
    display.setCursor(6, 28);
    display.print(F("no INA219 at 0x40"));
    display.display();
    for (;;) { }
  }

  // 32V / 2A is the best resolution for anything USB-powered.
  // Use setCalibration_32V_1A() for even finer steps under 1 A.
  ina.setCalibration_32V_2A();

  resetTotals();
}

void loop() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(30);
    if (digitalRead(BUTTON_PIN) == LOW) {
      resetTotals();
      while (digitalRead(BUTTON_PIN) == LOW) { }
    }
  }

  sample();

  if (millis() - lastGraph > 470) {          // ~1 minute across the screen
    lastGraph = millis();
    pushGraph();
  }

  if (millis() - lastDraw > 120) {
    lastDraw = millis();
    draw();
  }
}

/* --- measure, and integrate ------------------------------------------- */
void sample() {
  unsigned long now = millis();
  unsigned long dt = now - lastSample;
  if (dt < 25) return;                        // ~40 samples a second
  lastSample = now;

  volts     = ina.getBusVoltage_V();
  milliamps = ina.getCurrent_mA();
  if (milliamps < 0) milliamps = 0;           // reversed leads read negative
  watts     = volts * milliamps / 1000.0;

  if (milliamps > peakmA) peakmA = milliamps;
  if (volts < minVolts && volts > 0.3) minVolts = volts;

  // coulomb counting: mA * hours
  double hours = dt / 3600000.0;
  mAh += milliamps * hours;
  mWh += milliamps * volts * hours;
}

void resetTotals() {
  mAh = mWh = 0;
  peakmA = 0;
  minVolts = 99;
  startedAt = millis();
  lastSample = millis();
  for (int i = 0; i < GRAPH_W; i++) graph[i] = 0;
  graphHead = 0;
  graphMax = 100;
}

void pushGraph() {
  // autoscale: follow the peak of what is on screen, with a floor
  float scale = max(50.0f, peakmA);
  graphMax = graphMax * 0.9 + scale * 0.1;
  uint8_t v = (uint8_t)constrain(milliamps * 22.0 / graphMax, 0, 22);
  graph[graphHead] = v;
  graphHead = (graphHead + 1) % GRAPH_W;
}

/* --- the screen ------------------------------------------------------- */
void draw() {
  display.clearDisplay();

  // line 1: volts and amps, big
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print(volts, 2);
  display.setTextSize(1);
  display.print(F("V"));

  display.setTextSize(2);
  display.setCursor(62, 0);
  if (milliamps < 1000) {
    display.print(milliamps, 0);
    display.setTextSize(1);
    display.print(F("mA"));
  } else {
    display.print(milliamps / 1000.0, 2);
    display.setTextSize(1);
    display.print(F("A"));
  }

  // line 2: power and peak
  display.setTextSize(1);
  display.setCursor(0, 18);
  display.print(watts, 2);
  display.print(F("W  peak "));
  display.print(peakmA, 0);
  display.print(F("mA"));

  // line 3: accumulated
  display.setCursor(0, 28);
  display.print(mAh, mAh < 10 ? 2 : 1);
  display.print(F("mAh  "));
  display.print(mWh / 1000.0, 3);
  display.print(F("Wh"));

  // line 4: elapsed and minimum volts
  display.setCursor(0, 38);
  unsigned long secs = (millis() - startedAt) / 1000UL;
  display.print(secs / 3600); display.print(':');
  if ((secs / 60) % 60 < 10) display.print('0');
  display.print((secs / 60) % 60); display.print(':');
  if (secs % 60 < 10) display.print('0');
  display.print(secs % 60);
  if (minVolts < 90) {
    display.print(F("   min "));
    display.print(minVolts, 2);
    display.print(F("V"));
  }

  drawGraph();
  display.display();
}

void drawGraph() {
  display.drawFastHLine(0, 63, 128, SSD1306_WHITE);
  for (int x = 0; x < GRAPH_W; x++) {
    uint8_t i = (graphHead + x) % GRAPH_W;
    uint8_t h = graph[i];
    if (h) display.drawFastVLine(x, 62 - h, h, SSD1306_WHITE);
  }
}`,
  after: `<p>The <code>minVolts</code> reading is the one that solves brownouts. A supply that reads 5.05&nbsp;V
  at idle and dips to 4.1&nbsp;V for 40&nbsp;milliseconds when a motor starts will reset an Arduino, and no
  multimeter will ever show you that dip. This meter catches it because it samples forty times a second and
  keeps the minimum.</p>`
}],

upload: `<p>Nano, correct port. The screen shows "power meter", then live readings. Press the button to zero
the totals.</p>`,

tune: [
  { h: 'Pick the right calibration range',
    body: `<p><code>setCalibration_32V_2A()</code> gives 100&nbsp;&micro;A resolution up to 2&nbsp;A - the right
    default. <code>setCalibration_32V_1A()</code> gives 40&nbsp;&micro;A up to 1&nbsp;A, which is better for
    sleep-current work. <code>setCalibration_16V_400mA()</code> goes down to 10&nbsp;&micro;A.</p>
    <p>You cannot measure both a 50&nbsp;&micro;A sleep current and a 500&nbsp;mA transmit burst accurately at
    the same time - that is a genuine limitation of a fixed-shunt design, not a fault.</p>` },
  { h: 'Check it against a known load',
    body: `<p>A 100&nbsp;&Omega; resistor across 5&nbsp;V should read 50&nbsp;mA. If yours is consistently out
    by a few percent, that is the tolerance of the shunt resistor - note the factor and trust it.</p>` },
  { h: 'Measuring a battery discharge',
    body: `<p>Put it between the battery and the load, press reset, and leave it. The mAh figure when the load
    stops working is your battery's real capacity under that load - almost always well below the printed
    figure, and the gap grows with current.</p>` },
  { h: 'Catching short spikes',
    body: `<p>The sketch samples every 25&nbsp;ms, so it will catch a servo stall but can miss a 2&nbsp;ms Wi-Fi
    burst. For those, raise the sample rate and drop the display rate - or accept that a proper current probe
    and an oscilloscope is the right tool.</p>` },
  { h: 'If you power the meter from the measured rail',
    body: `<p>Subtract the meter's own consumption. Measure it with no load, note it, and subtract it in the
    <code>sample()</code> function with a clear comment saying why.</p>` }
],

trouble: [
  { q: 'Current always reads 0',
    a: `The load is not in the VIN+/VIN- path - most likely it is wired to VCC. Current must physically flow
    through the module.` },
  { q: 'Current reads negative',
    a: `VIN+ and VIN- are swapped. Harmless. Swap them, or take the absolute value.` },
  { q: 'Voltage reads correctly, current is nonsense',
    a: `Thin wires in the measured path adding resistance, or a bad joint. The shunt is 0.1&nbsp;&Omega; -
    30&nbsp;m&Omega; of cold solder joint is a 30&nbsp;% error.` },
  { q: '<code>no INA219 at 0x40</code>',
    a: `Address jumpers are bridged, or SDA/SCL are swapped. Run an I2C scanner - it will tell you the real
    address.` },
  { q: 'Readings jump around',
    a: `Normal at low currents with a 0.1&nbsp;&Omega; shunt. Average several samples before displaying, or use
    a lower calibration range.` },
  { q: 'mAh climbs when nothing is connected',
    a: `Small offset error being integrated. Add a deadband: ignore anything under 1&nbsp;mA when accumulating.` },
  { q: 'Screen and sensor both on I2C, one stops working',
    a: `Address clash or too many pull-ups. Both modules have their own pull-ups; three or four modules on one
    bus can make the combined resistance too low. Remove the pull-ups from all but one.` }
],

next: `
<ul>
  <li><strong>Log it.</strong> Add an SD card and write a CSV - then you can chart a full battery discharge
  curve, which is the only honest way to compare cells.</li>
  <li><strong>Two channels</strong>: a second INA219 at 0x41 measures input and output at once, so you can
  calculate a regulator's efficiency directly.</li>
  <li><strong>Put it online</strong> with an ESP32 and watch a project's consumption from another room over
  days.</li>
  <li><strong>Use it on the <a href="project.html?p=solar-battery-logger">solar logger</a></strong>, which is
  the same chip doing a bigger job.</li>
</ul>`
});
