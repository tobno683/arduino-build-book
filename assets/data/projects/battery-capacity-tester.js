/* Battery capacity tester: INA219, MOSFET, power resistor, OLED. */
AB.addProject({
slug: 'battery-capacity-tester',
title: 'Battery capacity tester',
cat: 'power',
level: 2,
time: '90 minutes',
solder: false,
board: 'Nano',
tags: ['ina219', 'mosfet', 'load resistor', '18650', 'mah', 'discharge curve', 'no soldering'],
blurb: 'Discharges a cell through a resistor, counts the milliamp-hours, and cuts off safely. Finds out which of your 18650s are actually 3000 mAh and which are 700.',

skills: ['Coulomb counting', 'Constant-load discharge', 'Cut-off voltage', 'Heat management', 'CSV logging'],

intro: `
<p>Every recovered 18650 claims 3000&nbsp;mAh and a startling number of them manage 600. Every power bank
claims 20,000 and delivers 12,000. The only way to know is to discharge a cell at a known load and count what
comes out - which is exactly what this does, and it is a tool you will use for years.</p>
<p>It is also the most satisfying way to learn what "capacity" actually means, because the answer depends on
the current you draw. The same cell tested at 0.5&nbsp;A and 2&nbsp;A gives two different numbers, and both are
correct.</p>`,

what: [
  'Discharge one cell through a 10 ohm power resistor at roughly 350 mA.',
  'Measure current and voltage many times a second and accumulate milliamp-hours and watt-hours.',
  'Stop at a settable cut-off voltage and hold the load off, so it can never over-discharge the cell.',
  'Show live voltage, current, elapsed time and accumulated capacity on an OLED.',
  'Print a CSV line every ten seconds so you can chart the whole discharge curve.'
],

how: `
<p><strong>Capacity</strong> is current integrated over time. Measure the current every few milliseconds,
multiply by how long has passed, and add it up - that is coulomb counting, and it is how a phone estimates its
battery percentage.</p>
<p>The <strong>INA219</strong> measures current honestly: a precise 0.1&nbsp;&Omega; resistor sits in the
current path and the chip measures the voltage across it. One amp through 0.1&nbsp;&Omega; is 100&nbsp;mV,
which is a comfortable thing to measure accurately. It reads the bus voltage too, so power comes for free.</p>
<p>The <strong>load</strong> is a 10&nbsp;&Omega; wirewound resistor, switched by a logic-level MOSFET. At
3.7&nbsp;V that is 370&nbsp;mA and about 1.4&nbsp;W of heat - which is why the resistor is a 10&nbsp;W part and
why it needs to sit in free air. It is a <em>constant resistance</em> load, not a constant current one, so the
current falls as the cell empties. That is fine: the sketch measures what actually flows rather than assuming
anything.</p>
<p>The <strong>cut-off voltage</strong> is the safety-critical part. A lithium cell taken below about
2.5&nbsp;V is damaged, and below 2&nbsp;V it can become genuinely hazardous to recharge. The sketch stops at
3.0&nbsp;V by default, which is conservative, loses you perhaps 2&nbsp;% of the measured capacity, and is the
right trade.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'ina219', qty: 1, note: 'The common breakout with a 0.1 ohm shunt. Default address 0x40.' },
  { id: 'powerres', qty: 1, note: '10 ohm 10 W wirewound. It gets hot - see the safety notes.' },
  { id: 'mosfet', qty: 1, note: 'IRLZ44N. Logic level, so it turns fully on from a 5 V pin and stays cool.' },
  { id: 'res10k', qty: 1, note: 'Gate pull-down, so the load cannot switch on while the board boots.' },
  { id: 'res220', qty: 1, note: 'In series with the gate.' },
  { id: 'oled13', qty: 1 },
  { id: 'button', qty: 1, note: 'Start and stop.' },
  { id: '18650', qty: 1, note: 'A holder with wire leads. The cells under test are whatever you already have.' },
  { id: 'bb-830', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true, note: 'The Nano runs from USB, not from the cell under test - that keeps the measurement honest.' }
],

tools: [
  { id: 'dmm', why: 'To check the cell voltage independently, at least the first few times, until you trust the readings.' }
],

build: {
  parts: [
    { id: 'nano', comp: 'nano',        at: [0, 46] },
    { id: 'bb',   comp: 'bb830',       at: [0, -26] },
    { id: 'ina',  comp: 'ina219',      at: [-54, -88], ry: 180 },
    { id: 'oled', comp: 'oled13',      at: [-8, -90], ry: 180 },
    { id: 'q1',   comp: 'mosfet',      at: [28, -84] },
    { id: 'load', comp: 'powerres',    at: [62, -84] },
    { id: 'cell', comp: 'battery18650',at: [0, 112] },
    { id: 'btn',  comp: 'button',      at: [54, 34] }
  ],
  wires: [
    { from: 'nano.5V',    to: 'bb.B+1',  color: 'red',    note: '5 V for the logic, from USB' },
    { from: 'nano.GND',   to: 'bb.B-1',  color: 'black',  note: 'Ground rail' },
    { from: 'bb.B+12',    to: 'bb.T+12', color: 'red',    note: 'Bridge the red rails' },
    { from: 'bb.B-12',    to: 'bb.T-12', color: 'black',  note: 'Bridge the blue rails' },
    { from: 'ina.VCC',    to: 'bb.T+3',  color: 'red',    note: 'Sensor logic power - NOT the measured path' },
    { from: 'ina.GND',    to: 'bb.T-3',  color: 'black',  note: 'Sensor ground' },
    { from: 'ina.SDA',    to: 'nano.A4', color: 'blue',   note: 'I2C data' },
    { from: 'ina.SCL',    to: 'nano.A5', color: 'green',  note: 'I2C clock' },
    { from: 'cell.+',     to: 'ina.VIN+',color: 'red',    note: 'Cell positive INTO the sensor - all the current flows through here' },
    { from: 'ina.VIN-',   to: 'load.A',  color: 'brown',  note: 'Out of the sensor into the load resistor' },
    { from: 'load.B',     to: 'q1.D',    color: 'brown',  note: 'Resistor to the MOSFET drain' },
    { from: 'q1.S',       to: 'bb.T-20', color: 'black',  note: 'MOSFET source to ground' },
    { from: 'cell.-',     to: 'bb.B-20', color: 'black',  note: 'Cell negative to the SAME ground. This is essential' },
    { from: 'q1.G',       to: 'nano.D9', color: 'orange', note: 'Gate, through a 220 ohm resistor' },
    { from: 'oled.VCC',   to: 'bb.T+7',  color: 'red',    note: 'Screen power' },
    { from: 'oled.GND',   to: 'bb.T-7',  color: 'black',  note: 'Screen ground' },
    { from: 'oled.SDA',   to: 'nano.A4', color: 'blue',   note: 'Same I2C pair' },
    { from: 'oled.SCL',   to: 'nano.A5', color: 'green',  note: 'Same I2C pair' },
    { from: 'btn.1A',     to: 'nano.D3', color: 'purple', note: 'Start / stop button' },
    { from: 'btn.2A',     to: 'bb.B-24', color: 'black',  note: 'Button to ground' }
  ]
},

wireIntro: `<p>The current path is the thing to get right, and it is a single loop:
<strong>cell + &rarr; INA219 VIN+ &rarr; VIN- &rarr; resistor &rarr; MOSFET drain &rarr; source &rarr; ground
&rarr; cell &minus;</strong>. Everything else is logic hanging off the side of it.</p>`,

wireNotes: `
<div class="note warn"><span class="t">VIN+ and VIN- are the measured path, not the chip's power</span>
<p>The current being measured flows <em>through</em> the module, in at VIN+ and out at VIN-. The chip's own
power comes from the separate VCC and GND pins, which here come from the Nano's 5&nbsp;V.</p>
<p>Wiring the cell to VCC and expecting a current reading is the classic first mistake - it powers the chip and
measures nothing.</p></div>

<div class="note danger"><span class="t">The grounds must be joined</span>
<p>The cell's negative, the MOSFET's source and the Nano's ground are one node. Without that, the gate voltage
is measured against a different zero and the MOSFET does something unpredictable - which in this circuit means
a load that may not switch off when told to.</p></div>

<div class="note warn"><span class="t">Power the Nano from USB, not from the cell</span>
<p>Two reasons. The measurement stays honest - you are counting what the load takes, not what the load plus
your own electronics take. And the tester keeps running and keeps its totals even as the cell approaches
cut-off.</p></div>

<div class="note danger"><span class="t">The resistor gets hot. Plan for it.</span>
<p>1.4&nbsp;W in a 10&nbsp;W wirewound is comfortable for the resistor and still reaches 70-80&nbsp;&deg;C. It
must sit in free air, not on the breadboard, not touching the cell, not on anything that melts.</p>
<p>Mount it on a scrap of wood or a ceramic tile, with its leads reaching over to the breadboard. Never leave a
discharge running unattended in the first few tests.</p></div>`,

solderIntro: `<p>No soldering to build it. Since this is a bench tool you will keep, here is the version worth
making permanent.</p>`,

solderSteps: [
  { h: 'Sockets for the Nano, the sensor and the screen',
    body: `<p>Two 15-pin strips, a 4-pin and a 4-pin. Use each module as its own alignment jig, tack the end
    pins, check square from the side, then complete.</p>` },
  { h: 'Heavy wire in the measured path',
    body: `<p>20&nbsp;AWG or thicker from the cell holder to VIN+, from VIN- to the resistor, and from the
    MOSFET source back to ground. Anything thinner adds resistance in series with the 0.1&nbsp;&Omega; shunt
    and quietly corrupts the readings - which is a particularly annoying way to be misled by your own
    instrument.</p>
    <p>Keep those runs short and direct.</p>` },
  { h: 'The resistor on standoffs, away from everything',
    body: `<p>Mount it above the board on tall nylon standoffs, or off the board entirely on a ceramic tile.
    Leave 10&nbsp;mm of air all round. Solder its leads with the resistor held in a vice - the body is ceramic
    and the leads conduct heat away fast, so this joint takes longer than most.</p>` },
  { h: 'MOSFET with its two resistors folded in',
    body: `<p>220&nbsp;&Omega; from D9 to the gate, 10&nbsp;k from the gate to ground, both soldered directly to
    the gate pad rather than run as patch wires.</p>` },
  { h: 'Screw terminals for the cell holder',
    body: `<p>A 2-pin block, clearly marked + and &minus;. You will connect and disconnect cells constantly, and
    a reversed cell on a soldered joint is much harder to undo in a hurry.</p>` },
  { h: 'Check before any cell goes in',
    body: `<p>Continuity: VIN+ to ground must be open. Gate to ground about 10&nbsp;k. Then power the Nano from
    USB with no cell fitted and confirm the screen says <code>no cell</code> - that proves the sensor is alive
    and reading zero before you trust it with a real one.</p>` }
],

assembly: [
  { h: 'Build it with no cell connected',
    body: `<p>Everything except the battery. Power from USB, confirm the screen comes up and the sensor is
    found at 0x40.</p>` },
  { h: 'Test the load switch with the bench supply, not a cell',
    body: `<p>If you have a 5&nbsp;V supply, feed it into VIN+ through the resistor and check the sketch reads
    about 500&nbsp;mA when it switches the load on. That proves the whole current path before a lithium cell is
    anywhere near it.</p>` },
  { h: 'Then a cell you do not care about',
    body: `<p>Fit it the right way round - check twice - press start, and stay with it. Feel the resistor after
    two minutes: warm is right, untouchable is not.</p>` },
  { h: 'Let a full discharge run',
    body: `<p>A 2000&nbsp;mAh cell at 350&nbsp;mA takes about six hours. Leave the Serial Monitor recording if
    you want the curve.</p>` },
  { h: 'Charge it again before you judge anything',
    body: `<p>A capacity figure only means something from a fully charged start. Charge to 4.2&nbsp;V, rest for
    an hour, then test - otherwise you are measuring where the cell happened to be.</p>` }
],

libraries: [
  { name: 'Adafruit INA219', by: 'Adafruit', why: 'Reads the shunt and bus voltage.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The screen.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Drawing.' }
],

code: [{
  name: 'capacity_tester.ino',
  code: `/* ------------------------------------------------------------------
   Battery capacity tester
   INA219 at 0x40 and SSD1306 on I2C, MOSFET gate on D9, button on D3.

   Press to start. It discharges through the load resistor until the
   cell reaches CUTOFF_V, then switches the load off and holds the
   result on screen.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_INA219.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---- settings --------------------------------------------------------
#define GATE_PIN     9
#define BUTTON_PIN   3
#define OLED_ADDR    0x3C

const float CUTOFF_V    = 3.00;   // stop here. Do NOT raise much above 3.2
                                  // or lower below 2.8 for lithium.
const float NO_CELL_V   = 1.50;   // below this, assume nothing is connected
const float MAX_TEMP_MINUTES = 900;   // give up after 15 hours, whatever happens
const unsigned long LOG_EVERY = 10000UL;
// ----------------------------------------------------------------------

Adafruit_INA219 ina;
Adafruit_SSD1306 display(128, 64, &Wire, -1);

enum State { IDLE, RUNNING, DONE, NO_CELL };
State state = IDLE;

float volts = 0, milliamps = 0;
double mAh = 0, mWh = 0;
float startVolts = 0, minVolts = 9;
unsigned long startedAt = 0, lastSample = 0, lastLog = 0, lastDraw = 0;
bool wasDown = false;

void setup() {
  Serial.begin(115200);
  pinMode(GATE_PIN, OUTPUT);
  loadOff();                       // before anything else
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("no screen"));
    for (;;) { }
  }
  display.setTextColor(SSD1306_WHITE);

  if (!ina.begin()) {
    display.clearDisplay();
    display.setCursor(4, 28);
    display.print(F("no INA219 at 0x40"));
    display.display();
    for (;;) { }
  }
  // 1 A range: four times the resolution of the 2 A default, and this
  // load never goes near an amp.
  ina.setCalibration_32V_1A();

  Serial.println(F("ready. seconds,volts,mA,mAh"));
}

void loop() {
  sample();
  handleButton();

  if (state == RUNNING) {
    if (volts < NO_CELL_V) {
      // cell removed mid-test
      stopTest();
      state = NO_CELL;
    } else if (volts <= CUTOFF_V) {
      stopTest();
      state = DONE;
      Serial.print(F("# finished: "));
      Serial.print(mAh, 1);
      Serial.println(F(" mAh"));
    } else if ((millis() - startedAt) / 60000UL > MAX_TEMP_MINUTES) {
      stopTest();
      state = DONE;
    }

    if (millis() - lastLog > LOG_EVERY) {
      lastLog = millis();
      logLine();
    }
  }

  if (millis() - lastDraw > 250) {
    lastDraw = millis();
    draw();
  }
}

/* --- measuring -------------------------------------------------------- */
void sample() {
  unsigned long now = millis();
  unsigned long dt = now - lastSample;
  if (dt < 20) return;
  lastSample = now;

  volts = ina.getBusVoltage_V();
  milliamps = ina.getCurrent_mA();
  if (milliamps < 0) milliamps = 0;

  if (state == RUNNING) {
    double hours = dt / 3600000.0;
    mAh += milliamps * hours;
    mWh += milliamps * volts * hours;
    if (volts < minVolts) minVolts = volts;
  }
}

/* --- control ---------------------------------------------------------- */
void loadOn()  { digitalWrite(GATE_PIN, HIGH); }
void loadOff() { digitalWrite(GATE_PIN, LOW); }

void startTest() {
  if (volts < NO_CELL_V) { state = NO_CELL; return; }
  if (volts <= CUTOFF_V) { state = DONE; return; }   // already flat

  mAh = mWh = 0;
  startVolts = volts;
  minVolts = volts;
  startedAt = millis();
  lastSample = millis();
  lastLog = millis();
  state = RUNNING;
  loadOn();

  Serial.println(F("# start"));
  Serial.print(F("# resting voltage "));
  Serial.println(startVolts, 3);
}

void stopTest() {
  loadOff();
  Serial.println(F("# stop"));
}

void handleButton() {
  bool down = digitalRead(BUTTON_PIN) == LOW;
  if (down && !wasDown) {
    delay(30);
    if (digitalRead(BUTTON_PIN) == LOW) {
      if (state == RUNNING) { stopTest(); state = DONE; }
      else                  { startTest(); }
      while (digitalRead(BUTTON_PIN) == LOW) { }
    }
  }
  wasDown = down;
}

void logLine() {
  Serial.print((millis() - startedAt) / 1000UL);
  Serial.print(',');
  Serial.print(volts, 3);
  Serial.print(',');
  Serial.print(milliamps, 1);
  Serial.print(',');
  Serial.println(mAh, 2);
}

/* --- the screen ------------------------------------------------------- */
void draw() {
  display.clearDisplay();

  if (state == NO_CELL || (state == IDLE && volts < NO_CELL_V)) {
    display.setTextSize(2);
    display.setCursor(16, 24);
    display.print(F("no cell"));
    display.display();
    return;
  }

  // big capacity figure - the answer you are here for
  display.setTextSize(3);
  display.setCursor(0, 0);
  display.print(mAh, 0);
  display.setTextSize(1);
  display.print(F("mAh"));

  display.setCursor(88, 2);
  display.print(volts, 2);
  display.print(F("V"));
  display.setCursor(88, 13);
  display.print(milliamps, 0);
  display.print(F("mA"));

  display.setTextSize(1);
  display.setCursor(0, 28);
  display.print(mWh / 1000.0, 3);
  display.print(F(" Wh"));

  // elapsed
  display.setCursor(64, 28);
  unsigned long secs = (state == IDLE) ? 0 : (millis() - startedAt) / 1000UL;
  display.print(secs / 3600);
  display.print(':');
  if ((secs / 60) % 60 < 10) display.print('0');
  display.print((secs / 60) % 60);
  display.print(':');
  if (secs % 60 < 10) display.print('0');
  display.print(secs % 60);

  // a rough progress bar between the start voltage and the cut-off
  if (state == RUNNING && startVolts > CUTOFF_V) {
    int pct = (int)((startVolts - volts) / (startVolts - CUTOFF_V) * 100.0);
    pct = constrain(pct, 0, 100);
    display.drawRect(0, 40, 128, 9, SSD1306_WHITE);
    display.fillRect(2, 42, pct * 124 / 100, 5, SSD1306_WHITE);
  }

  display.setCursor(0, 54);
  switch (state) {
    case IDLE:    display.print(F("press to start"));      break;
    case RUNNING: display.print(F("discharging... cut "));
                  display.print(CUTOFF_V, 2);              break;
    case DONE:    display.print(F("DONE - press to redo")); break;
    default:      break;
  }

  display.display();
}`,
  after: `<p><code>loadOff()</code> is called as the very first thing in <code>setup()</code>, before the screen
  or the sensor. That ordering is deliberate: if anything later fails and halts, the load is already off. A
  tester that leaves a cell connected to a resistor because the display was not found is not a tool you want on
  your bench.</p>`
}],

upload: `
<p>Nano, correct port. With no cell fitted the screen should say <code>no cell</code>. Fit one and it shows
its resting voltage; press the button to start.</p>
<p>Serial Monitor at 115200 prints a CSV line every ten seconds:
<code>seconds,volts,mA,mAh</code>. Copy that into a spreadsheet and chart volts against mAh - that is the
discharge curve, and it tells you far more than the single capacity number.</p>`,

tune: [
  { h: 'Pick the right cut-off',
    body: `<p>3.0&nbsp;V is conservative and right for cells you intend to keep. 2.8&nbsp;V squeezes out a few
    more milliamp-hours and shortens the cell's life a little. Below 2.5&nbsp;V you are damaging it.</p>
    <p>For NiMH, use 1.0&nbsp;V per cell instead. For lead acid, 1.75&nbsp;V per cell.</p>` },
  { h: 'Change the discharge current',
    body: `<p>Current is roughly cell voltage divided by the resistance, so 10&nbsp;&Omega; gives about
    370&nbsp;mA at 3.7&nbsp;V. Two 10&nbsp;&Omega; resistors in parallel gives 5&nbsp;&Omega; and 740&nbsp;mA,
    and four times the heat - which needs two 10&nbsp;W resistors, not one.</p>
    <p>Higher current gives a lower measured capacity. That is not an error; it is a real property of the cell,
    and it is why datasheets always quote a test rate.</p>` },
  { h: 'Verify against something known',
    body: `<p>Test a brand-new, reputable cell whose rating you trust. If a genuine 3000&nbsp;mAh cell measures
    2800 at a modest current, your rig is honest. If it measures 1500, something is wrong - most likely thin
    wire in the current path adding resistance.</p>` },
  { h: 'Reading the curve',
    body: `<p>A healthy lithium cell holds 3.6-3.7&nbsp;V across most of its discharge and then falls off a
    cliff at the end. A tired one sags immediately and slopes down all the way - its internal resistance has
    risen. The <em>shape</em> often tells you more than the total.</p>` },
  { h: 'Testing power banks',
    body: `<p>A power bank outputs 5&nbsp;V, so the same 10&nbsp;&Omega; load draws 500&nbsp;mA and there is no
    cut-off to worry about - it switches itself off. Note the figure you get is at 5&nbsp;V, while the bank's
    advertised rating is at the cell's 3.7&nbsp;V, so multiply your mAh by about 1.35 before comparing. Most
    banks come out 30&nbsp;% below their printed number.</p>` }
],

trouble: [
  { q: 'Current reads zero with the load on',
    a: `The cell is not in the VIN+/VIN- path - most likely it is wired to VCC. Current must physically flow
    through the sensor module.` },
  { q: 'Current reads negative',
    a: `VIN+ and VIN- are swapped. Harmless. Swap them.` },
  { q: 'Capacity comes out far too low',
    a: `Thin wire or a poor connection in the current path. The shunt is 0.1&nbsp;&Omega;, so 30&nbsp;m&Omega;
    of bad joint is a 30&nbsp;% error. Use thick wire and check every connection.` },
  { q: 'Voltage reads about 0.5 V low while running',
    a: `That is real - it is the drop across your own wiring and the MOSFET. The INA219 measures at its own
    terminals, so keep the leads to the cell short and thick, and take the cut-off decision seriously since it
    is based on this reading.` },
  { q: 'The load will not switch off',
    a: `Stop immediately and disconnect the cell. Then check: is the MOSFET logic-level? Is the 10&nbsp;k
    pull-down fitted? Are the legs Gate-Drain-Source as you assumed? A MOSFET wired with drain and source
    swapped conducts permanently through its body diode.` },
  { q: 'Resistor is too hot to touch',
    a: `Expected at 1.4&nbsp;W - wirewounds run hot. Too hot to be near anything else is the problem to solve:
    give it air, and never let it rest against the breadboard or the cell.` },
  { q: 'Test stops after a few minutes',
    a: `The cell hit the cut-off, which means it is genuinely nearly flat, or its internal resistance is so
    high that it sags under load. Both are real findings about that cell.` },
  { q: 'Screen says no cell with a cell fitted',
    a: `Reversed, or the holder's contacts are not making. Measure the cell directly with a multimeter.` }
],

next: `
<ul>
  <li><strong>Test four cells at once</strong>: four INA219s at 0x40, 0x41, 0x44 and 0x45 on the same I2C bus,
  four MOSFETs, four resistors. Matching cells for a pack is exactly what this is for.</li>
  <li><strong>Make it constant-current</strong> instead of constant-resistance by PWM-ing the MOSFET to hold a
  target current. Much more comparable between cells, and a good introduction to closed-loop control.</li>
  <li><strong>Log to an SD card</strong> so you get the curve without leaving a laptop attached for six hours -
  see the <a href="project.html?p=fridge-freezer-logger">logger</a>.</li>
  <li><strong>Use it on the <a href="project.html?p=solar-battery-logger">solar logger</a></strong>: knowing a
  cell's true capacity is what turns that project's daily figures into a real prediction.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Lithium cells and a hot resistor</span>
<ul>
  <li><strong>Never discharge below 2.5&nbsp;V.</strong> The cut-off is set to 3.0&nbsp;V and there is no good
  reason to lower it. A cell taken flat is damaged, and recharging a deeply discharged lithium cell is where
  the genuinely dangerous failures come from.</li>
  <li><strong>Check polarity before every test.</strong> A cell fitted backwards puts the full cell voltage
  across the MOSFET's body diode and will get hot fast.</li>
  <li><strong>The resistor reaches 70-80&nbsp;&deg;C.</strong> Free air, on something non-flammable, not
  touching the cell, the breadboard or the wiring. This is the part that starts fires if you put it somewhere
  thoughtless.</li>
  <li><strong>Do not leave early tests unattended</strong>, and never run one overnight until you have watched
  several complete normally.</li>
  <li><strong>Never test a damaged cell.</strong> Puffed, dented, leaking or hot cells go to a recycling point.
  A cell that gets warm during a modest discharge has high internal resistance and is on its way out.</li>
  <li><strong>Test on a hard, non-flammable surface</strong> - a tile or a metal tray - not on carpet, paper or
  a wooden desk with things on it.</li>
</ul>
</div>`
});
