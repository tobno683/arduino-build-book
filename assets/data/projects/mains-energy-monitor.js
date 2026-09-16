/* SCT-013 clamp CT reading whole-house current, with an OLED and MQTT. */
AB.addProject({
slug: 'mains-energy-monitor',
title: 'Whole-house energy monitor',
cat: 'power',
level: 4,
time: '4 hours',
solder: true,
board: 'ESP32',
tags: ['sct-013', 'current transformer', 'rms', 'energy', 'mqtt', 'esp32', 'non-contact'],
blurb: 'A clamp that goes round one cable without touching it, and tells you what the house is drawing, in watts, live. No mains contact anywhere in the build.',

skills: ['Current transformers', 'RMS calculation', 'Analog biasing', 'Energy accumulation', 'MQTT'],

intro: `
<p>This is the one mains-related project in the book where you never touch a conductor. A clamp current
transformer works by induction: it goes <em>around</em> a cable, the magnetic field from the current in that
cable induces a proportional current in the clamp's coil, and you measure that. There is no electrical
connection at all.</p>
<p>That said, the clamp has to go round a live conductor, which means opening a consumer unit or working at a
meter tail. That part is electrical work, and the safety section is not optional reading.</p>`,

what: [
  'Measure RMS current on one circuit or the whole house, updated once a second.',
  'Show amps, estimated watts, and accumulated kilowatt-hours on an OLED.',
  'Track today\'s total and reset it at midnight.',
  'Publish everything to MQTT so Home Assistant charts it.',
  'Work without any electrical connection to the mains.'
],

how: `
<p>An <strong>SCT-013-030</strong> clamps around one conductor. The alternating current in that conductor
creates an alternating magnetic field; the clamp's core concentrates it, and the coil inside produces a
proportional signal. The "-030" variant has a burden resistor built in and outputs <strong>1&nbsp;V RMS at
30&nbsp;A</strong>, which is the version to buy - the -000 variant outputs current and needs you to add a
burden resistor yourself.</p>
<p>The output is an AC signal swinging above and below zero. An ADC cannot read below zero, so the signal is
<strong>biased</strong> to the middle of the range with two equal resistors forming a divider from 3.3&nbsp;V
to ground, with a capacitor to hold that midpoint steady. The clamp's signal then rides on 1.65&nbsp;V.</p>
<p><strong>RMS</strong> is the number that matters, because it is the equivalent DC value that would do the
same work. You cannot just average an AC waveform - it averages to zero. Instead: sample fast for several full
cycles, subtract the midpoint, square each sample, average the squares, and take the square root. Root of the
mean of the squares.</p>
<p><strong>Watts is an estimate, not a measurement.</strong> Real power is voltage times current times the
power factor, and this build measures only current. Multiplying by a nominal 230 or 120&nbsp;V assumes a power
factor of 1, which is true for kettles and heaters and wrong for motors and cheap LED drivers. The number is
useful for spotting what is on; it is not a billing-grade meter, and this guide will not pretend otherwise.</p>`,

bom: [
  { id: 'esp32', qty: 1 },
  { id: 'sct013', qty: 1, note: 'Get the SCT-013-030: 30 A range, 1 V output, burden resistor built in. The -000 needs extra components.' },
  { id: 'res10k', qty: 2, note: 'The bias divider. They must be reasonably matched - use two from the same strip.' },
  { id: 'cap10', qty: 1, note: 'From the divider midpoint to ground, to keep the bias steady.' },
  { id: 'oled13', qty: 1 },
  { id: 'screwterm', qty: 1, note: 'Or a 3.5 mm socket, which is what the clamp actually has on its lead.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'psu5v3a', qty: 1 },
  { id: 'box-abs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm' }, { id: 'usb-meter' }],

build: {
  parts: [
    { id: 'esp',   comp: 'esp32',  at: [0, 0] },
    { id: 'clamp', comp: 'sct013', at: [-62, -46], ry: 180 },
    { id: 'oled',  comp: 'oled13', at: [32, -52], ry: 180 }
  ],
  wires: [
    { from: 'clamp.TIP',    to: 'esp.D34',  color: 'yellow', note: 'Clamp signal into an ADC pin, riding on the 1.65 V bias' },
    { from: 'clamp.SLEEVE', to: 'esp.GND',  color: 'black',  note: 'Clamp return to ground' },
    { from: 'oled.VCC',     to: 'esp.3V3',  color: 'red',    note: 'Screen power' },
    { from: 'oled.GND',     to: 'esp.GND2', color: 'black',  note: 'Screen ground' },
    { from: 'oled.SDA',     to: 'esp.D21',  color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL',     to: 'esp.D22',  color: 'green',  note: 'I2C clock' }
  ]
},

wireIntro: `<p>The bias network is not drawn as wires because it is three components sitting on the board
between 3.3&nbsp;V, GPIO 34 and ground. It is described in full below, and getting it right is the whole
electrical content of this project.</p>`,

wireNotes: `
<div class="note warn"><span class="t">The bias network, in words</span>
<p>Three components, all on the board:</p>
<ul>
  <li><strong>10&nbsp;k&Omega;</strong> from <code>3V3</code> to the <strong>GPIO 34</strong> node.</li>
  <li><strong>10&nbsp;k&Omega;</strong> from that same node to <code>GND</code>.</li>
  <li><strong>10&nbsp;&micro;F</strong> from that node to <code>GND</code> (negative stripe to ground).</li>
</ul>
<p>That holds GPIO 34 at 1.65&nbsp;V with nothing connected. The clamp's tip then connects to the same node and
its sleeve to ground, so the AC signal swings either side of 1.65&nbsp;V and never goes negative.</p>
<p>Without the bias, the negative half of every cycle is clipped away at 0&nbsp;V, your RMS calculation is
wrong by a factor you cannot predict, and the ADC's protection diodes are conducting on every cycle.</p></div>

<div class="note warn"><span class="t">GPIO 34 is input-only, and that is why it is used</span>
<p>GPIO 34-39 on an ESP32 are input-only pins with no internal pull-ups or pull-downs to fight your bias
network. They are also on ADC1, which - unlike ADC2 - keeps working while Wi-Fi is active. Using an ADC2 pin
here gives you readings that stop the moment the radio connects, which is a memorably confusing bug.</p></div>

<div class="note tip"><span class="t">The clamp ends in a 3.5 mm plug</span>
<p>Fit a 3.5&nbsp;mm socket rather than cutting the lead - then the clamp stays usable for other things. Tip is
the signal, sleeve is the return. On a stereo socket, join ring and sleeve.</p></div>`,

solderSteps: [
  { h: 'Build the bias network first and measure it',
    body: `<p>Two 10&nbsp;k resistors and the capacitor, all meeting at one node on the perfboard. Solder them,
    then power the board and put a multimeter between that node and ground.</p>
    <p>You want <strong>1.6 to 1.7&nbsp;V</strong>, steady. If it reads 3.3 or 0, one resistor is not connected;
    if it wanders, the capacitor is missing or backwards.</p>
    <p>Do not go further until this reads right - everything downstream depends on it.</p>` },
  { h: 'Keep the analog node small',
    body: `<p>The junction of the two resistors, the capacitor, the socket tip and GPIO 34 should be one
    physically compact point on the board. A long wandering analog node picks up noise, and you will see it as a
    reading that never settles to zero.</p>` },
  { h: 'The 3.5 mm socket',
    body: `<p>Three tags: tip, ring, sleeve. Solder tip to the bias node, and ring and sleeve together to
    ground. Test with a multimeter and the clamp plugged in - tip to sleeve should read a few tens of ohms
    through the coil.</p>` },
  { h: 'ESP32 and OLED sockets',
    body: `<p>Two 15-pin strips and a 4-pin. Keep the OLED's I2C wires away from the analog node - digital
    switching next to an analog input is exactly the noise source you are trying to avoid.</p>` },
  { h: 'Check before the clamp goes anywhere near a consumer unit',
    body: `<p>Power the board on the bench, plug in the clamp, leave it round nothing, and run the sketch. It
    should read close to 0&nbsp;A, with a little jitter.</p>
    <p>Then clamp it round the flex of a kettle (see the tuning section for why that is safe) and watch it jump.
    Prove the whole thing works on a kettle lead before you open anything.</p>` }
],

assembly: [
  { h: 'Bench-test with a known load',
    body: `<p>A kettle is ideal: it is resistive, so power factor is 1 and the watts figure should be close to
    the rating on its base.</p>
    <p>See the safety section for how to clamp a single conductor of a mains flex safely - you do not split
    the flex, you use a purpose-made adapter or the appliance's own separated conductors if it has them.</p>` },
  { h: 'Calibrate against something you trust',
    body: `<p>Compare against a plug-in energy meter, or use the kettle's rating. Adjust <code>CAL</code> until
    they agree. One number.</p>` },
  { h: 'Set the mains voltage',
    body: `<p><code>MAINS_VOLTS</code> to 230 in Europe, 120 in North America. Being 5&nbsp;% out here makes the
    watts 5&nbsp;% out, which for a trend monitor is irrelevant.</p>` },
  { h: 'Install the clamp',
    body: `<p>Around <strong>one</strong> conductor - the live meter tail, or the live of the circuit you care
    about. Around both live and neutral together it reads zero, because the currents cancel. That is the single
    most common installation mistake and it looks exactly like a broken build.</p>
    <p>Read the safety section before opening anything.</p>` },
  { h: 'Leave it a week',
    body: `<p>With MQTT going into Home Assistant you get a chart, and the chart is the point. You will
    identify the fridge cycling, the immersion heater, and the standby baseline that never goes away.</p>` }
],

libraries: [
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The screen.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Drawing.' },
  { name: 'PubSubClient', by: 'Nick O\'Leary', why: 'MQTT. Leave MQTT_HOST empty to skip it.' }
],

code: [{
  name: 'energy_monitor.ino',
  code: `/* ------------------------------------------------------------------
   Whole-house energy monitor
   SCT-013-030 into GPIO 34, biased to 1.65 V. OLED on I2C.
   Board: ESP32 Dev Module
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <PubSubClient.h>

// ---- change these ----------------------------------------------------
const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";
const char* MQTT_HOST = "";          // "" disables MQTT
const int   MQTT_PORT = 1883;
const char* DEVICE_ID = "energy";

#define MAINS_VOLTS   230.0          // 230 in Europe, 120 in North America
#define CAL            30.0          // amps at 1 V RMS - tune this
// ----------------------------------------------------------------------

#define CT_PIN          34
#define SAMPLES       1480           // about 6 full 50 Hz cycles
#define NOISE_FLOOR_A   0.06         // below this, call it zero

Adafruit_SSD1306 display(128, 64, &Wire, -1);
WiFiClient net;
PubSubClient mqtt(net);

double amps = 0, watts = 0;
double kWhTotal = 0, kWhToday = 0;
double peakWatts = 0;
int midpointRaw = 2048;
unsigned long lastCalc = 0, lastPub = 0, dayStarted = 0;

void setup() {
  Serial.begin(115200);

  analogReadResolution(12);
  analogSetPinAttenuation(CT_PIN, ADC_11db);     // full 0-3.3 V range

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("no screen"));
    for (;;) { }
  }
  display.setTextColor(SSD1306_WHITE);
  display.clearDisplay();
  display.setCursor(10, 28);
  display.print(F("measuring bias..."));
  display.display();

  // Learn the actual bias point rather than assuming 2048. Resistor
  // tolerance and the ESP32's ADC offset both push it around.
  long sum = 0;
  for (int i = 0; i < 4000; i++) { sum += analogRead(CT_PIN); delayMicroseconds(120); }
  midpointRaw = sum / 4000;
  Serial.print(F("bias raw "));
  Serial.println(midpointRaw);

  if (strlen(MQTT_HOST)) {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    unsigned long t0 = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - t0 < 12000) delay(250);
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println(WiFi.localIP());
      mqtt.setServer(MQTT_HOST, MQTT_PORT);
    }
  }

  dayStarted = millis();
  lastCalc = millis();
}

void loop() {
  measure();

  if (millis() - dayStarted > 86400000UL) {
    dayStarted = millis();
    kWhToday = 0;
    peakWatts = 0;
  }

  if (strlen(MQTT_HOST) && WiFi.status() == WL_CONNECTED) {
    if (!mqtt.connected()) mqtt.connect(DEVICE_ID);
    mqtt.loop();
    if (millis() - lastPub > 5000) {
      lastPub = millis();
      publish();
    }
  }

  draw();
}

/* --- root mean square ------------------------------------------------- */
void measure() {
  double sumSquares = 0;
  long sumRaw = 0;

  for (int i = 0; i < SAMPLES; i++) {
    int raw = analogRead(CT_PIN);
    sumRaw += raw;
    double centred = raw - midpointRaw;
    sumSquares += centred * centred;
  }

  // slowly follow any drift in the bias point
  midpointRaw = (midpointRaw * 31 + (int)(sumRaw / SAMPLES)) / 32;

  double rmsCounts = sqrt(sumSquares / SAMPLES);
  double rmsVolts  = rmsCounts * 3.3 / 4095.0;
  double a = rmsVolts * CAL;

  if (a < NOISE_FLOOR_A) a = 0;

  // gentle smoothing - the raw figure jumps around by a few percent
  amps = amps * 0.7 + a * 0.3;
  watts = amps * MAINS_VOLTS;
  if (watts > peakWatts) peakWatts = watts;

  // accumulate energy: watts * hours
  unsigned long now = millis();
  double hours = (now - lastCalc) / 3600000.0;
  lastCalc = now;
  double kwh = watts * hours / 1000.0;
  kWhTotal += kwh;
  kWhToday += kwh;
}

/* --- output ----------------------------------------------------------- */
void publish() {
  char buf[16];
  char topic[64];

  snprintf(topic, sizeof(topic), "home/%s/amps", DEVICE_ID);
  dtostrf(amps, 4, 2, buf);
  mqtt.publish(topic, buf, true);

  snprintf(topic, sizeof(topic), "home/%s/watts", DEVICE_ID);
  dtostrf(watts, 6, 0, buf);
  mqtt.publish(topic, buf, true);

  snprintf(topic, sizeof(topic), "home/%s/kwh_today", DEVICE_ID);
  dtostrf(kWhToday, 6, 3, buf);
  mqtt.publish(topic, buf, true);
}

void draw() {
  display.clearDisplay();

  display.setTextSize(3);
  display.setCursor(0, 0);
  if (watts < 1000) {
    display.print((int)watts);
    display.setTextSize(1);
    display.print(F("W"));
  } else {
    display.print(watts / 1000.0, 2);
    display.setTextSize(1);
    display.print(F("kW"));
  }

  display.setTextSize(1);
  display.setCursor(0, 26);
  display.print(amps, 2);
  display.print(F(" A"));

  display.setCursor(64, 26);
  display.print(F("peak "));
  display.print((int)peakWatts);

  display.setCursor(0, 40);
  display.print(F("today  "));
  display.print(kWhToday, 3);
  display.print(F(" kWh"));

  display.setCursor(0, 52);
  display.print(F("total  "));
  display.print(kWhTotal, 3);
  display.print(F(" kWh"));

  display.display();
}`,
  after: `<p>The slow bias tracking - <code>(midpointRaw * 31 + measured) / 32</code> - matters more than it
  looks. The ESP32's ADC drifts a little with temperature, and the bias divider drifts with supply. Re-learning
  the midpoint on every measurement, slowly, means a build that is still reading zero at zero load six months
  later.</p>`
}],

upload: `
<p>Board: ESP32 Dev Module. At boot the Serial Monitor prints the measured bias in raw ADC counts - it should
be close to 2048 and, more importantly, stable between reboots.</p>
<p>With no clamp connected, or the clamp around nothing, it should read 0&nbsp;A.</p>`,

tune: [
  { h: 'Calibrate against a known load',
    body: `<p>A kettle's rating is printed on it. Run it, read the watts, and adjust <code>CAL</code> by the
    ratio: if it should be 2200&nbsp;W and reads 1900, multiply <code>CAL</code> by 2200/1900.</p>
    <p>A resistive load is essential for this - a kettle, a heater, an incandescent lamp. Do not calibrate
    against a laptop charger or an LED bulb; their power factor is not 1 and you will bake the error in.</p>` },
  { h: 'Set the noise floor',
    body: `<p>Watch the reading with the clamp round nothing. Whatever it wanders up to, set
    <code>NOISE_FLOOR_A</code> a little above. Too low and the house appears to use 30&nbsp;W of nothing; too
    high and you cannot see small loads.</p>` },
  { h: 'How many samples',
    body: `<p><code>SAMPLES</code> should cover a whole number of mains cycles, or the RMS wobbles. At roughly
    the ESP32's sampling rate, 1480 is about six 50&nbsp;Hz cycles. For 60&nbsp;Hz use about 1230. Exactness
    does not matter much - covering several cycles does.</p>` },
  { h: 'Understanding the watts number',
    body: `<p>It assumes power factor 1. For resistive loads it is accurate to a few percent. For a fridge
    compressor or a cheap LED driver it can read 30&nbsp;% high. For measuring <em>change</em> - which is what
    you actually want - that hardly matters.</p>
    <p>A true power measurement needs a voltage reference too, which means an AC-AC transformer plugged into a
    socket. The EmonLib library does exactly that, and it is the right next step if you want billing-grade
    numbers.</p>` },
  { h: 'Bigger clamps',
    body: `<p>SCT-013 comes in 30&nbsp;A, 50&nbsp;A and 100&nbsp;A versions. Set <code>CAL</code> to the amps
    figure of whichever you have. A 100&nbsp;A clamp on a 2&nbsp;A load has poor resolution - use the smallest
    clamp that covers your maximum.</p>` }
],

trouble: [
  { q: 'Reads a large number with the clamp round nothing',
    a: `The bias is wrong. Measure GPIO 34 to ground with a multimeter: it must be about 1.65&nbsp;V and steady.
    Check both resistors and the capacitor.` },
  { q: 'Reads zero even with a big load',
    a: `Almost always the clamp is around both live and neutral together, so the fields cancel. It must be
    around ONE conductor. Second possibility: the plug is not fully in the socket.` },
  { q: 'Readings stop the moment Wi-Fi connects',
    a: `You are on an ADC2 pin. Move to GPIO 32-36, which are ADC1 and unaffected by the radio.` },
  { q: 'Reading wanders up and down by 20 %',
    a: `Noise on the analog node, or too few samples. Shorten the analog wiring, add a 100&nbsp;nF from the
    node to ground, and raise <code>SAMPLES</code>.` },
  { q: 'Watts is consistently 20 % out',
    a: `Calibration, or power factor. Calibrate on a kettle; if it is right for the kettle and wrong for the
    house, that is power factor and it is a limitation of current-only measurement.` },
  { q: 'kWh climbs when nothing is on',
    a: `The noise floor is too low, so a small false current is being integrated all day. Raise it.` },
  { q: 'ESP32 will not boot with the clamp connected',
    a: `A strapping pin is being pulled. GPIO 34 is input-only and has no boot role, so if you moved the input
    pin, move it back.` }
],

next: `
<ul>
  <li><strong>Add true power</strong> with an AC-AC voltage adapter and EmonLib. That gives real watts,
  power factor and apparent power, and it is the honest version of this project.</li>
  <li><strong>Three clamps</strong> for a three-phase supply, or for measuring individual circuits at the
  consumer unit. GPIO 32, 33 and 35 are all ADC1.</li>
  <li><strong>Chart it properly</strong>: InfluxDB and Grafana via MQTT will show you a year of half-hourly
  consumption and make the standby load impossible to ignore.</li>
  <li><strong>Pair it with the <a href="project.html?p=smart-plug-relay">Wi-Fi switch</a></strong> and you can
  measure the effect of switching something off, which is far more persuasive than guessing.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">The clamp is safe. Getting it into position may not be.</span>
<p>Nothing you build here is electrically connected to the mains - that is the whole appeal of a current
transformer. The risk is entirely in the installation.</p>
<ul>
  <li><strong>Never split a mains flex to get at one conductor.</strong> Cutting into a cable to separate live
  from neutral is how people get hurt. For appliance testing, buy a ready-made "line splitter" adapter, which
  is designed exactly for this and separates the conductors safely inside a moulded housing.</li>
  <li><strong>A consumer unit is not a hobby space.</strong> Fitting a clamp around a meter tail or a circuit
  live means opening a live panel. In most countries that is work for a qualified electrician, and in the UK it
  falls under Part P. An electrician will fit a clamp in five minutes for a small fee, and it is the right
  call.</li>
  <li><strong>Switch off at the main isolator before opening anything</strong>, and be aware that the meter
  tails on the supply side of the isolator stay live even then. Those are the utility's property and are often
  sealed.</li>
  <li><strong>Clamp one conductor only.</strong> Around both, it reads zero - which is annoying, not dangerous.
  Around a conductor whose insulation is damaged, it is dangerous.</li>
  <li><strong>Route the clamp lead so it cannot be pinched</strong> by the panel cover, and so nothing pulls on
  it.</li>
  <li><strong>Do not use this as a safety device.</strong> It is a monitor. It has no role in protection, and
  nothing in your house should depend on it being right.</li>
</ul>
<p>The completely safe version of this project: clamp a purpose-made line splitter on an appliance flex on your
desk, and never open a panel at all. You lose the whole-house view and keep everything else.</p>
</div>`
});
