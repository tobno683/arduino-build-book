/* PID against a very slow plant. Mains, water, and a real safety section. */
AB.addProject({
slug: 'sous-vide-controller',
title: 'Sous vide controller',
cat: 'kitchen',
level: 3,
time: '6 hours',
solder: true,
board: 'ESP32',
tags: ['pid', 'sous vide', 'ssr', 'mains', 'ds18b20', 'thermal lag', 'autotune', 'cooking'],
blurb: 'Holds a pot of water at 54.5 degrees for three hours without drifting. It is the clearest demonstration of PID control you can build, and the only one whose output you can eat.',
feature: true,

skills: ['PID control', 'Thermal lag and why it breaks naive control', 'Solid state relays', 'Mains safety', 'Time-proportional output', 'Sensor placement'],

intro: `
<p>Sous vide is cooking in water held at exactly the temperature you want the food to reach. Steak at
54.5&nbsp;degrees is medium rare all the way through, edge to edge, and it cannot overcook because nothing in
the pot is hotter than that.</p>
<p>Commercial circulators cost between $100 and $300. This does the same job with a $9 solid state relay, a
$3 temperature sensor and a slow cooker you already own - and unlike the commercial one, you can see exactly
why it works.</p>
<p>Water is a beautifully awkward thing to control. It has enormous thermal mass, the heater is slow, and the
sensor reads what happened thirty seconds ago. That is precisely what makes it the best PID teaching project
there is: a naive controller oscillates visibly, and you can watch each term fix it.</p>`,

what: [
  'Hold a water bath within about 0.2 degrees of a set point for hours.',
  'Get there without overshooting, which is the whole difficulty.',
  'Switch a mains heater safely with a solid state relay and time-proportional control.',
  'Autotune the PID constants rather than guessing them.',
  'Warn you when the water is low, the lid is off, or the target will never be reached.'
],

how: `
<p><strong>Why on-off control does not work here.</strong> A thermostat turns the heater on below the target
and off above it. In a fast system that is fine. In a pot of water it is not, because when the sensor reaches
54.5 the heating element is much hotter than the water and keeps dumping heat in after you switch off.</p>
<p>The result is overshoot to 57, a long slow fall to 52, and a cycle of several degrees that never settles.
That is thermal lag, and it is the problem PID exists to solve.</p>

<p><strong>The three terms, in this system.</strong></p>
<ul>
  <li><strong>P</strong> - proportional to the error now. Drives most of the heating. Alone it settles below
  the target, because as the error shrinks so does the power, and at some point the power equals the heat lost
  to the room and it stops climbing.</li>
  <li><strong>I</strong> - the accumulated error over time. This is what removes that permanent offset: while
  you are half a degree short, the integral keeps growing and adds the extra power. In a water bath, I is doing
  most of the useful work.</li>
  <li><strong>D</strong> - the rate of change. Sees the temperature rising fast and backs off before the
  target, which is what kills overshoot. It is also extremely sensitive to sensor noise, so it stays small.</li>
</ul>

<p><strong>Time-proportional output.</strong> PID wants to output 37% power. A mains heater is on or off. The
answer is a slow window - say 5 seconds - and switching on for 1.85 of every 5 seconds.</p>
<p>The window must be slow because you are switching mains. An SSR switches at the zero crossing, so it can do
this all day, but a mechanical relay would wear out in hours and should never be used here.</p>

<p><strong>Integral windup, which will catch you.</strong> Start with cold water and the error is 30 degrees.
The integral term accumulates enormously over the twenty minutes it takes to heat up, and by the time you reach
the target it is demanding full power and takes ages to unwind - so you overshoot badly on the first
approach.</p>
<p>Two standard fixes, and the sketch uses both: clamp the integral to a sensible maximum, and do not
accumulate at all while the output is saturated.</p>

<p><strong>Sensor placement changes everything.</strong> Near the heater it reads high and you undercook. In a
still corner it lags badly. It wants to be in moving water, away from the element, at the depth the food sits
at.</p>
<p>Which is also why circulation matters: a pot without a pump can be three degrees warmer at the top than the
bottom, and no controller can fix a bath that is not one temperature.</p>

<p><strong>Autotune beats guessing.</strong> The relay method deliberately oscillates the system with on-off
control, measures the period and amplitude, and computes the PID constants from them. Ten minutes, and it gets
closer than an afternoon of fiddling.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Wi-Fi so you can watch the curve from the sofa, which is genuinely useful during a long cook.' },
  { id: 'ssr25', qty: 1, note: 'With a heatsink, fitted. Not a mechanical relay - this switches every few seconds for hours and would destroy one.' },
  { id: 'ds18b20', qty: 2, note: 'Waterproof stainless probes. Two: one in the bath, one as a sanity check, because a single sensor that drifts is a cook you throw away.' },
  { id: 'res4k7', qty: 1, note: 'OneWire pull-up. Without it the bus reads nothing at all.' },
  { id: 'oled13', qty: 1, note: 'Current temperature, target, and percentage power - watching the power number is how you learn what PID is doing.' },
  { id: 'rotary', qty: 1, note: 'Setting a target to a tenth of a degree with buttons is miserable; an encoder makes it pleasant.' },
  { id: 'pump', qty: 1, note: 'Circulation. A small submersible pump makes the bath one temperature instead of several.' },
  { id: 'buzzer', qty: 1, note: 'Preheated, and cook finished.' },
  { id: 'box-abs', qty: 1, note: 'Must have a lid. Mains inside.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'heatshrink', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',   at: [0, 78] },
    { id: 'bb',   comp: 'bb400',   at: [-8, 12] },
    { id: 'ssr',  comp: 'ssr',     at: [62, -50] },
    { id: 't1',   comp: 'ds18b20', at: [-70, -30] },
    { id: 'oled', comp: 'oled13',  at: [-14, -58] },
    { id: 'enc',  comp: 'rotary',  at: [30, -58] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 't1.VCC',   to: 'bb.T+5',  color: 'red',    note: 'Probe power' },
    { from: 't1.GND',   to: 'bb.T-5',  color: 'black',  note: 'Probe ground' },
    { from: 't1.DATA',  to: 'mcu.D4',  color: 'yellow', note: 'OneWire data, with the 4.7 k pull-up to 3.3 V' },
    { from: 'bb.e5',    to: 'bb.T+8',  color: 'red',    note: '4.7 k pull-up from the data line to 3.3 V - the bus is dead without it' },
    { from: 'oled.VCC', to: 'bb.T+12', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-12', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'oled.SCL', to: 'mcu.D22', color: 'blue',   note: 'I2C clock' },
    { from: 'enc.VCC',  to: 'bb.T+18', color: 'red',    note: 'Encoder power' },
    { from: 'enc.GND',  to: 'bb.T-18', color: 'black',  note: 'Encoder ground' },
    { from: 'enc.CLK',  to: 'mcu.D18', color: 'green',  note: 'Encoder A' },
    { from: 'enc.DT',   to: 'mcu.D19', color: 'blue',   note: 'Encoder B' },
    { from: 'enc.SW',   to: 'mcu.D5',  color: 'white',  note: 'Encoder push - confirms the target' },
    { from: 'ssr.IN+',  to: 'mcu.D25', color: 'brown',  note: 'SSR control - brown, because the other side of this part is mains' },
    { from: 'ssr.IN-',  to: 'bb.T-24', color: 'black',  note: 'SSR control return' }
  ]
},

wireIntro: `<p>Everything in the model is low voltage. The SSR's control side is what you wire; its output side
switches mains and is covered in the safety section, which you should read first.</p>`,

wireNotes: `
<div class="note danger"><span class="t">The SSR has a mains side. Read the safety section before wiring anything.</span>
<p>The two terminals on the model are the control input, at 3&nbsp;V. The other two carry live mains. They must
be inside an enclosure, on properly rated cable, with the earth continuous through to the heater.</p></div>

<div class="note warn"><span class="t">4.7 k pull-up, or the sensor does not exist</span>
<p>OneWire is an open-drain bus. Without a 4.7&nbsp;k resistor from the data line to 3.3&nbsp;V, the library
finds no devices at all and reports -127. This is the commonest DS18B20 problem and it looks like a dead
sensor.</p></div>

<div class="note tip"><span class="t">Two probes, and use the disagreement</span>
<p>A single sensor that has drifted gives you a confident wrong answer, and with food that matters more than
usual. Two probes reading 0.4&nbsp;degrees apart is a warning to recalibrate; two reading 4 apart means one has
failed or come out of the water.</p>
<p>Check both in an ice bath before the first cook - it should read 0.0, and whatever offset you see is the
correction to apply.</p></div>`,

solderIntro: `<p>Low-voltage soldering on perfboard, then the mains side, which is not soldered at all - it is
screw terminals and proper cable. If the mains section is not something you are comfortable with, use the
12&nbsp;V variant described at the end instead.</p>`,

solderSteps: [
  { h: 'Low-voltage board first, and test it completely',
    body: `<p>ESP32, display, encoder, probes and the SSR control line. Run the whole controller with an LED
    standing in for the heater and confirm the PID behaves before mains is anywhere near it.</p>
    <p>You can develop the entire project like this. Do.</p>` },
  { h: 'The 4.7 k pull-up, close to the board',
    body: `<p>One resistor from the OneWire data line to 3.3&nbsp;V. Put it at the board rather than at the
    probe, so the run to the probe is just three wires.</p>` },
  { h: 'Probe cables, strain relieved and sealed',
    body: `<p>These go into water. Seal where the cable enters the enclosure with a gland, and never let a
    joint sit below the water line. Heatshrink with adhesive lining is worth the extra here.</p>` },
  { h: 'Mount the SSR on its heatsink, with thermal paste',
    body: `<p>Bare, an SSR rated 25&nbsp;A handles about 5 before it cooks itself. With the heatsink and a thin
    film of thermal paste it does what it says. It should be warm in use, not hot.</p>` },
  { h: 'Mains last, enclosure open, unplugged',
    body: `<p>Live in through a fused inlet, through the SSR, out to the socket the cooker plugs into. Neutral
    straight through. <strong>Earth continuous and unbroken</strong> from inlet to outlet.</p>
    <p>Ferrules on every stranded conductor, no copper visible outside a terminal, and a tug test on each
    one.</p>` },
  { h: 'Close it before it is ever plugged in',
    body: `<p>Lid on, screws in. Then test with nothing in the socket, then with a lamp, and only then with a
    cooker.</p>` }
],

libraries: [
  { name: 'DallasTemperature', by: 'Miles Burton', why: 'DS18B20 driver.' },
  { name: 'OneWire', by: 'Paul Stoffregen', why: 'The bus underneath it.' },
  { name: 'PID', by: 'Brett Beauregard', why: 'The reference Arduino PID implementation, with the anti-windup handling done properly.' },
  { name: 'U8g2', by: 'oliver', why: 'The display.' }
],

code: [{
  name: 'sous_vide.ino',
  code: `/* ------------------------------------------------------------------
   Sous vide controller - ESP32, DS18B20, SSR

   Time-proportional PID over a 5 second window.
   ------------------------------------------------------------------ */

#include <OneWire.h>
#include <DallasTemperature.h>
#include <PID_v1.h>
#include <U8g2lib.h>

#define ONE_WIRE   4
#define SSR_PIN    25
#define BUZZER     26

OneWire oneWire(ONE_WIRE);
DallasTemperature sensors(&oneWire);
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);

double setPoint = 54.5;      // steak, medium rare, edge to edge
double input    = 20.0;
double output   = 0.0;

/* Starting points for about 8 litres in a covered pot with a 700 W
   element. Run the autotune for your own setup - these will be wrong for
   a different volume, and volume matters more than anything else. */
double Kp = 55.0, Ki = 0.35, Kd = 220.0;

PID pid(&input, &output, &setPoint, Kp, Ki, Kd, DIRECT);

/* Five seconds. Slow enough that an SSR lasts forever, fast enough that
   water - which has huge thermal mass - cannot tell the difference. */
const unsigned long WINDOW_MS = 5000;
unsigned long windowStart = 0;

float lastTemp = 0;
unsigned long lastRead = 0;
bool preheated = false;

void setup() {
  Serial.begin(115200);
  pinMode(SSR_PIN, OUTPUT);
  digitalWrite(SSR_PIN, LOW);
  pinMode(BUZZER, OUTPUT);

  sensors.begin();
  sensors.setResolution(12);          // 12-bit: 0.0625 C, 750 ms per read
  oled.begin();

  pid.SetOutputLimits(0, WINDOW_MS);
  pid.SetSampleTime(1000);
  pid.SetMode(AUTOMATIC);
  windowStart = millis();
}

void loop() {
  readTemperature();
  pid.Compute();
  driveHeater();
  draw();
}

// ---- sensing ---------------------------------------------------------
void readTemperature() {
  // A 12-bit conversion takes 750 ms, so asking faster than once a second
  // just returns the previous value.
  if (millis() - lastRead < 1000) return;
  lastRead = millis();

  sensors.requestTemperatures();
  float a = sensors.getTempCByIndex(0);
  float b = sensors.getTempCByIndex(1);

  // -127 means the bus found nothing: almost always the 4.7 k pull-up.
  if (a == DEVICE_DISCONNECTED_C) {
    Serial.println("Probe 1 missing - check the 4.7k pull-up");
    digitalWrite(SSR_PIN, LOW);       // fail safe: heater off
    return;
  }

  /* Two probes disagreeing badly means one is out of the water or has
     failed. Keep heating on the lower reading - undercooked is a
     recoverable mistake and boiling the bath dry is not. */
  if (b != DEVICE_DISCONNECTED_C && fabs(a - b) > 2.0) {
    Serial.printf("Probes disagree: %.2f vs %.2f\\n", a, b);
    input = min(a, b);
  } else {
    input = a;
  }

  // Rising fast with the heater off means the probe is against the
  // element rather than in open water.
  if (output == 0 && input - lastTemp > 1.0) {
    Serial.println("Temperature climbing with no power - move the probe");
  }
  lastTemp = input;

  if (!preheated && input >= setPoint - 0.3) {
    preheated = true;
    beep(3);
  }
}

// ---- output ----------------------------------------------------------
/* Time proportioning: PID asks for a number between 0 and WINDOW_MS, and
   the heater is on for that many milliseconds out of every window. */
void driveHeater() {
  unsigned long now = millis();
  if (now - windowStart > WINDOW_MS) windowStart += WINDOW_MS;
  digitalWrite(SSR_PIN, (output > now - windowStart) ? HIGH : LOW);
}

// ---- display ---------------------------------------------------------
void draw() {
  static unsigned long last = 0;
  if (millis() - last < 250) return;
  last = millis();

  char line[24];
  oled.clearBuffer();

  oled.setFont(u8g2_font_helvB18_tr);
  snprintf(line, sizeof(line), "%.1f", input);
  oled.drawStr(0, 24, line);

  oled.setFont(u8g2_font_6x10_tf);
  snprintf(line, sizeof(line), "target %.1f", setPoint);
  oled.drawStr(0, 40, line);

  // Power is the interesting number. Watching it fall as the bath
  // approaches the target is watching PID work.
  snprintf(line, sizeof(line), "power %3d%%", (int)(output * 100 / WINDOW_MS));
  oled.drawStr(0, 52, line);

  oled.drawStr(0, 63, preheated ? "ready - add food" : "heating");
  oled.sendBuffer();
}

void beep(int n) {
  for (int i = 0; i < n; i++) {
    tone(BUZZER, 2200, 120);
    delay(200);
  }
}

/* ---- autotune -------------------------------------------------------
   Relay method. Drive on-off around the set point, let it oscillate, and
   measure the period and amplitude. Ziegler-Nichols then gives constants
   that are far closer than guessing. Run this once, for your pot, with
   the volume of water you actually cook with.

   Call instead of the normal loop, note the printed values, paste them
   into Kp/Ki/Kd above.
--------------------------------------------------------------------- */
void autotune() {
  const double band = 0.5;
  double high = 0, low = 999;
  unsigned long lastCross = 0, period = 0;
  bool heating = true;
  int crossings = 0;

  Serial.println("Autotuning - about 20 minutes. Do not open the lid.");

  while (crossings < 8) {
    readTemperature();
    high = max(high, input);
    low  = min(low, input);

    bool wantHeat = input < setPoint;
    if (wantHeat != heating) {
      heating = wantHeat;
      unsigned long now = millis();
      if (lastCross) period = now - lastCross;
      lastCross = now;
      crossings++;
      high = low = input;
    }
    digitalWrite(SSR_PIN, heating ? HIGH : LOW);
    delay(200);
  }

  digitalWrite(SSR_PIN, LOW);
  double amplitude = (high - low) / 2.0;
  double Ku = (4.0 * 1.0) / (PI * amplitude);
  double Tu = period * 2.0 / 1000.0;

  Serial.printf("Ku=%.2f Tu=%.1fs\\n", Ku, Tu);
  Serial.printf("Kp=%.2f Ki=%.4f Kd=%.2f\\n",
                0.6 * Ku, 1.2 * Ku / Tu, 0.075 * Ku * Tu);
}`
}],

trouble: [
  { q: 'Temperature reads -127',
    a: `The 4.7&nbsp;k pull-up is missing or the data wire is broken. -127 is the OneWire library saying it
    found no device at all, not a temperature.` },
  { q: 'It overshoots badly on the first heat-up, then settles fine',
    a: `Integral windup. The error was large for twenty minutes and the integral term is still unwinding. The
    PID library clamps to the output limits, which mostly handles it; you can also hold the PID in manual until
    within a few degrees, then switch to automatic.` },
  { q: 'It oscillates by two or three degrees and never settles',
    a: `Kp too high, or Kd too low for the lag. Run the autotune. If it oscillates only with food in, the bath
    is not circulating - add the pump.` },
  { q: 'It settles half a degree below the target and stays there',
    a: `Ki too small. That permanent offset is exactly what the integral term removes.` },
  { q: 'The SSR is hot enough to smell',
    a: `No heatsink, or no thermal paste, or you are switching more current than it is rated for. Stop and fix
    it - a failed SSR usually fails on, which means a heater that cannot be turned off.` },
  { q: 'Temperature varies depending where the probe is',
    a: `Correct, and it is telling you something true: the bath is stratified. A pump fixes it. Without one,
    put the probe where the food is.` },
  { q: 'It never reaches the target',
    a: `Not enough power for the volume, or too much heat escaping. Cover the pot - a lid is worth several
    hundred watts. Insulate the sides too.` },
  { q: 'Wi-Fi drops during long cooks',
    a: `It should not affect control at all, because the PID runs locally. If a dropped connection stalls the
    loop, your reconnect code is blocking - it must not be.` }
],

safety: `
<div class="note danger"><span class="t">Mains electricity and water in the same project</span>
<p>This switches a mains heater and sits next to a pot of water. Both halves of that need respecting.</p>
<ul>
  <li><strong>Everything mains stays inside a closed enclosure.</strong> A fused inlet, properly rated cable,
  ferrules on stranded conductors, and no exposed copper anywhere.</li>
  <li><strong>Earth must be continuous.</strong> From the inlet, through the enclosure if it is metal, to the
  outlet. Do not switch earth or neutral - only live goes through the SSR.</li>
  <li><strong>Plug it into an RCD or GFCI protected socket.</strong> In a kitchen, with water, this is not
  optional. If your consumer unit does not provide it, use a plug-in RCD adaptor.</li>
  <li><strong>Never work on it plugged in</strong>, and keep the lid on whenever it is.</li>
  <li><strong>The SSR needs its heatsink.</strong> Overheated SSRs fail short - meaning the heater is on
  permanently and the controller cannot stop it. That is the dangerous failure mode of this design.</li>
  <li><strong>Add an independent thermal cutout</strong> if you leave it unattended. A mechanical thermostat in
  series with the heater, set at 90&nbsp;degrees, costs a few dollars and is the only thing that protects you
  when the software or the SSR fails.</li>
</ul>
<p><strong>A safer variant:</strong> use a 12&nbsp;V immersion heater and a MOSFET instead. Much less power so
it heats slowly and is impractical for large volumes, but there is no mains anywhere and the control problem -
which is what this project is really about - is identical.</p></div>

<div class="note warn"><span class="t">Food safety is separate from electrical safety</span>
<p>Sous vide works in a temperature range where pasteurisation depends on both temperature <em>and</em> time.
Below about 54&nbsp;degrees, bacteria are not reliably killed however long you wait, and holding food in the
danger zone for hours is how people get ill.</p>
<p>Use published time-and-temperature tables rather than guessing, do not go below 54&nbsp;degrees for meat,
and calibrate your probes in an ice bath before trusting them. A controller that holds 52 while reporting 55 is
worse than no controller.</p>
<p>Use bags intended for cooking. Ordinary plastic bags are not all rated for hours at temperature.</p></div>`,

next: `
<ul>
  <li><strong>Run the autotune</strong> for your own pot and volume. The constants in the sketch are a starting
  point for eight litres and will be wrong for four.</li>
  <li><strong>Log the whole cook</strong> and plot it. The first heat-up curve tells you more about your system
  than any amount of reading, and you will see the overshoot you fixed.</li>
  <li><strong>Feedforward for adding food</strong>: dropping cold steak in is a known disturbance, so a button
  that pre-emptively adds power handles it far better than waiting for the error to appear.</li>
  <li><strong>The same controller, different plant</strong>: a fermentation chamber, a reflow oven, a
  proofing box. PID does not care what it is heating, and swapping the plant is the best way to understand
  what the constants mean.</li>
</ul>`
});
