/* SIM7080G with PSM: a cellular device that sleeps at microamps for years. */
AB.addProject({
slug: 'nbiot-field-sensor',
title: 'NB-IoT sensor that lasts years',
cat: 'cellular',
level: 4,
time: '8 hours',
solder: true,
board: 'ESP32',
tags: ['nb-iot', 'lte-m', 'sim7080g', 'psm', 'edrx', 'deep sleep', 'battery', 'udp', 'coap'],
blurb: 'A cellular sensor on a battery for three years. The trick is not sleeping the Arduino - it is telling the mobile network to stop expecting you.',

skills: ['NB-IoT and LTE-M', 'Power Saving Mode', 'eDRX', 'Coverage enhancement', 'UDP telemetry', 'Multi-year power budgets'],

intro: `
<p>The <a href="project.html?p=lte-remote-monitor">Cat-1 monitor</a> needs mains power. An attached LTE modem
draws 20-50&nbsp;mA just staying registered, because the network expects to be able to reach it at any moment
and it has to keep listening for paging messages. Sleep the microcontroller all you like; the modem is the
load.</p>
<p><strong>Power Saving Mode is the answer, and it is a network feature rather than a device one.</strong> The
device tells the network "I am going to sleep for two hours - do not try to reach me, and keep my registration
alive while I am gone". The network agrees, stores the state, and the modem shuts almost everything down. When
it wakes, it does not have to re-attach: it is still registered, and it can send immediately.</p>
<p>That is the difference between 25&nbsp;mA and about 10&nbsp;microamps - a factor of two thousand - and it
turns a cellular sensor from a mains-powered device into something you bolt to a gatepost with a battery and
forget for three years.</p>
<p>This is the most genuinely clever thing in this theme, and it is entirely invisible unless you know to ask
for it.</p>`,

what: [
  'Report a sensor reading over NB-IoT or LTE-M from anywhere with mobile coverage.',
  'Sleep between reports at microamps, with the network holding your registration open.',
  'Run three years or more on a pair of lithium cells, with the arithmetic shown rather than claimed.',
  'Reach places 2G and Cat-1 cannot - NB-IoT gets about 20 dB of extra link budget, which is a basement or a manhole.',
  'Send over UDP rather than MQTT, because on a sleepy device a connection you have to re-establish is pure cost.',
  'Report its own coverage class, so you know whether the link is comfortable or scraping through.'
],

how: `
<p><strong>NB-IoT and LTE-M, and how to choose.</strong> Both are LTE variants designed for things rather
than phones. They differ in ways that matter:</p>
<table>
  <thead><tr><th></th><th>LTE-M (Cat-M1)</th><th>NB-IoT (Cat-NB1/2)</th></tr></thead>
  <tbody>
    <tr><td>Bandwidth</td><td>~1 Mbps</td><td>~30 kbps</td></tr>
    <tr><td>Extra link budget</td><td>~15 dB</td><td>~20 dB</td></tr>
    <tr><td>Moves between cells</td><td>yes, handover</td><td>no - reselect only, when idle</td></tr>
    <tr><td>Voice</td><td>possible</td><td>no</td></tr>
    <tr><td>Latency</td><td>100 ms - 1 s</td><td>1.5 - 10 s</td></tr>
    <tr><td>Best for</td><td>anything that moves</td><td>a fixed thing in a hole</td></tr>
  </tbody>
</table>
<p>For a sensor bolted to a post, NB-IoT. For anything on a vehicle, LTE-M - NB-IoT has no handover, so a
moving device drops the connection at every cell boundary. The SIM7080G does both, so you can try each and
measure.</p>

<p><strong>Coverage enhancement, which is how it reaches a basement.</strong> That 20&nbsp;dB is not magic -
it is repetition. NB-IoT sends the same data many times and the tower combines the copies, pulling the signal
out of noise the way LoRa and GPS do. It costs time and energy: a message that takes half a second in good
coverage can take fifteen seconds at the edge, using thirty times the energy.</p>
<p>This has a real consequence for battery life. A device in poor coverage does not simply report less
reliably - it reports at many times the energy cost. Two identical sensors, one in a field and one in a
concrete chamber, can differ by a factor of five in battery life. <strong>Check coverage before you install,
not after.</strong></p>

<p><strong>PSM in detail.</strong> The device negotiates two timers with the network:</p>
<ul>
  <li><strong>T3412 (TAU)</strong> - how long until it must check in again to stay registered. Ask for two
  hours to three days.</li>
  <li><strong>T3324 (Active)</strong> - how long it stays reachable after a transmission before sleeping. Ask
  for a few seconds; this is the window in which the network can push anything to you.</li>
</ul>
<p>You request; the network decides. It may grant less. Always read back what you actually got - a device
designed around a 24-hour TAU that was granted 30 minutes has a very different battery life from the one in
your spreadsheet.</p>

<p><strong>UDP, not MQTT, not TLS.</strong> On a device that sleeps between messages, a connection is a
liability: MQTT needs a TCP handshake plus a CONNECT, and TLS adds 4-6&nbsp;KB and several seconds of radio
time, every single wake.</p>
<p>A UDP datagram is one packet. No handshake, no session, no teardown. You lose delivery guarantees - so the
payload carries a sequence number and the server notices gaps. For telemetry where a missing sample is a gap
in a chart rather than a disaster, that is the right trade, and it is roughly a tenth of the energy.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Deep sleep at about 10 uA on a bare module. See the notes - a DevKit board will not get near that and it dominates everything.' },
  { id: 'sim7080g', qty: 1, note: 'Does both NB-IoT and LTE-M, global bands. This is the chip that makes the project possible; a Cat-1 module cannot do PSM properly.' },
  { id: 'iot-sim', qty: 1, note: 'Must be on a tariff that supports NB-IoT or LTE-M - not all do, and a consumer SIM usually does not. 1NCE, Soracom and Hologram all do.' },
  { id: 'lte-ant', qty: 1, note: 'NB-IoT runs in the low bands (B8, B20, B28) where antennas are physically bigger. A stubby antenna cut for 2.4 GHz is useless here.' },
  { id: 'bme280', qty: 1, note: 'About 3 uA in sleep, which at this power budget actually matters.' },
  { id: '18650', qty: 2, note: 'Two in series through a buck converter, or two in parallel at 3.7 V. Lithium primary cells (LiSOCl2) are the real answer for a three-year install - see the tuning notes.' },
  { id: 'buck', qty: 1, note: 'Choose one with LOW QUIESCENT CURRENT. A typical LM2596 burns 6 mA doing nothing, which is six hundred times the sleep current of everything else combined.' },
  { id: 'cap1000', qty: 2, note: 'At the module. Transmit peaks are lower than GSM but the battery’s internal resistance is higher when cold.' },
  { id: 'tp4056', qty: 1, note: 'Only if you are using rechargeable cells and solar. Primary cells must never be charged.' },
  { id: 'solar6v', qty: 1, note: 'Optional. At this consumption a very small panel is enough, and in many installs no panel is simpler than a badly sited one.' },
  { id: 'box-ip65', qty: 1, note: 'Years outdoors. Vents underneath, cable glands, drip loops.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'bb-400', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', note: 'A meter that reads microamps. This project cannot be built without one - the entire design is a current measurement.' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',        at: [0, 52] },
    { id: 'bb',   comp: 'bb400',        at: [0, -8] },
    { id: 'lte',  comp: 'lte',          at: [-44, -64] },
    { id: 'bme',  comp: 'bme280',       at: [44, -60] },
    { id: 'buck', comp: 'buck',         at: [0, -100] },
    { id: 'batt', comp: 'battery18650', at: [58, -100] }
  ],
  wires: [
    { from: 'batt.+',    to: 'buck.IN+',  color: 'red',    note: 'Cells into the converter. Pick a LOW quiescent one or it dominates the whole budget' },
    { from: 'batt.-',    to: 'buck.IN-',  color: 'black',  note: 'Battery negative' },
    { from: 'buck.OUT+', to: 'bb.T+2',    color: 'red',    note: '3.9 V rail - suits the modem directly and the ESP32 through its own regulator' },
    { from: 'buck.OUT-', to: 'bb.T-2',    color: 'black',  note: 'Common ground for everything' },
    { from: 'mcu.VIN',   to: 'bb.T+6',    color: 'red',    note: 'ESP32 supply' },
    { from: 'mcu.GND',   to: 'bb.T-6',    color: 'black',  note: 'ESP32 ground' },
    { from: 'lte.VCC',   to: 'bb.T+10',   color: 'brown',  note: 'Modem supply, with both capacitors at the module' },
    { from: 'lte.GND',   to: 'bb.T-10',   color: 'black',  note: 'Modem ground, starred at the capacitors' },
    { from: 'lte.TXD',   to: 'mcu.D16',   color: 'green',  note: 'Modem to ESP32 Serial2 RX' },
    { from: 'lte.RXD',   to: 'mcu.D17',   color: 'orange', note: 'ESP32 Serial2 TX to modem' },
    { from: 'lte.PWR',   to: 'mcu.D4',    color: 'purple', note: 'PWRKEY. Pulse to start - and this is also how you wake it from PSM' },
    { from: 'lte.DTR',   to: 'mcu.D25',   color: 'white',  note: 'DTR. Holding this low keeps the modem awake; releasing it lets PSM take hold' },
    { from: 'lte.STA',   to: 'mcu.D34',   color: 'blue',   note: 'STATUS, HIGH while running. Tells the sketch whether the modem is actually asleep' },
    { from: 'bme.VIN',   to: 'bb.T+16',   color: 'red',    note: 'Sensor power' },
    { from: 'bme.GND',   to: 'bb.T-16',   color: 'black',  note: 'Sensor ground' },
    { from: 'bme.SDA',   to: 'mcu.D21',   color: 'blue',   note: 'I2C data' },
    { from: 'bme.SCL',   to: 'mcu.D22',   color: 'yellow', note: 'I2C clock' },
    { from: 'mcu.D35',   to: 'bb.T+22',   color: 'brown',  note: 'Battery sense divider midpoint. See the notes - it needs a switch' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Every microamp counts, and three things will eat your budget</span>
<p>The design target is about 10&nbsp;uA asleep. At that level, components you would normally ignore become
the entire load:</p>
<ul>
  <li><strong>The buck converter's quiescent current.</strong> A common LM2596 module burns 6&nbsp;mA doing
  nothing - six hundred times your target, and it alone would flatten the battery in weeks. Use a
  low-quiescent part (TPS62740, MCP1700, HT7333) or run the modem directly from cells and skip the converter
  entirely.</li>
  <li><strong>The ESP32 DevKit's regulator and USB chip.</strong> 10-20&nbsp;mA whatever your sketch does.
  A bare ESP32-WROOM module with a low-quiescent regulator is the only way to reach microamps. This is not
  optional here the way it was in the LoRa projects.</li>
  <li><strong>The battery sense divider.</strong> Two 10&nbsp;k across the cells is 200&nbsp;uA - twenty times
  your sleep budget, drawn permanently. Use 1&nbsp;M resistors, or better, switch the divider with a MOSFET
  and only power it while measuring.</li>
</ul>
<p>Measure, do not assume. A meter on the microamp range, in series with the battery, is the only way to know
which of these is costing you.</p></div>

<div class="note warn"><span class="t">DTR and PWRKEY do different jobs</span>
<p><strong>PWRKEY</strong> turns the modem on and off. A pulse starts it from cold.</p>
<p><strong>DTR</strong> controls sleep on a running modem. With <code>AT+CSCLK=1</code> set, holding DTR low
keeps the modem awake and available; releasing it lets the modem enter its sleep state. Pulling DTR low again
wakes it without losing registration.</p>
<p>Getting these confused means either a modem that never sleeps, or one that has to re-attach every wake -
which costs several seconds and a lot of energy, and defeats the point.</p></div>

<div class="note danger"><span class="t">Primary lithium cells must never be charged</span>
<p>For a genuine multi-year install the right cell is a lithium thionyl chloride primary (LiSOCl2) - an
ER18505 or similar. 3.6&nbsp;V, very low self-discharge, and it will still be at 90% in ten years.</p>
<p><strong>They are not rechargeable.</strong> Connecting one to a TP4056 or a solar charger can cause it to
vent or rupture. If you fit primary cells, remove the charging circuit entirely - do not leave it wired and
unused.</p>
<p>They also have high internal resistance, so a transmit burst sags the voltage badly. The capacitors at the
module are what makes them work at all, and a hybrid layer capacitor is the proper engineering answer.</p></div>

<div class="note warn"><span class="t">Low-band antennas are physically larger</span>
<p>NB-IoT lives in bands 8, 20 and 28 - roughly 700-900&nbsp;MHz. A quarter wave there is 80-100&nbsp;mm, not
the 30&nbsp;mm of a 2.4&nbsp;GHz stub.</p>
<p>A small antenna sold for Wi-Fi will appear to work in good coverage and fail entirely where you actually
need the extra 20&nbsp;dB. Buy an antenna specified for the low LTE bands, and give it space away from the
battery and the enclosure's metalwork.</p></div>`,

solderSteps: [
  { h: 'Decide the power architecture before soldering anything',
    body: `<p>Two honest options:</p>
    <p><strong>Simplest:</strong> two 18650s in parallel at 3.7&nbsp;V, feeding the modem directly and the
    ESP32 through its own regulator. No converter, no quiescent current, and the voltage stays in the modem's
    3.4-4.2&nbsp;V window for most of the discharge curve.</p>
    <p><strong>Longest-lived:</strong> a LiSOCl2 primary cell at 3.6&nbsp;V with a hybrid layer capacitor
    across it, direct to everything. No charging, no converter, and ten-year shelf life.</p>
    <p>The buck converter in the parts list is for the case where you already have a higher-voltage supply.
    If you can avoid it, avoid it.</p>` },
  { h: 'Capacitors at the module, and size them up for cold',
    body: `<p>Two 1000&nbsp;uF at the modem's supply pins. Cells have much higher internal resistance at
    -10&nbsp;&deg;C than at 20, so a device that works on the bench can brown out on the first frost.</p>
    <p>If the install will be genuinely cold, add a hybrid layer capacitor or a supercapacitor across the
    supply. This is the standard fix for primary cells and it is worth doing before you seal the box.</p>` },
  { h: 'Switch the battery divider',
    body: `<p>A permanent divider is a permanent load. Two 10&nbsp;k is 200&nbsp;uA, which at this budget is
    the largest thing in the device.</p>
    <p>Either use 1&nbsp;M resistors (2&nbsp;uA, at the cost of needing a slower ADC read), or put a
    small N-channel MOSFET in the low leg driven by a GPIO, so the divider only exists while you are
    measuring. The MOSFET version is better and costs 60 cents.</p>` },
  { h: 'Build on a bare module, not a DevKit',
    body: `<p>Prototype on the DevKit, then move the final build to a bare ESP32-WROOM-32 with an HT7333
    regulator. The DevKit's regulator and CP2102 draw 10-20&nbsp;mA permanently and no amount of software
    fixes it.</p>
    <p>You need a USB-serial adapter to flash a bare module, and the boot strapping pins wired correctly. It
    is the difference between a device that lasts three weeks and one that lasts three years.</p>` },
  { h: 'Antenna on a bulkhead connector, outside the box',
    body: `<p>Low-band antennas are large and want space. An SMA bulkhead in the lid with a u.FL pigtail
    inside is the tidy answer, and it lets you swap antennas at the site if coverage is marginal.</p>` },
  { h: 'Measure the sleep current before the lid goes on',
    body: `<p>Meter in series with the battery, on the microamp range, device asleep.</p>
    <p>Target: under 50&nbsp;uA total. If it reads milliamps, work through the list in the wiring notes - and
    do it now, because this measurement is the whole project and it is very hard to take once the box is
    sealed on a post in a field.</p>` }
],

assembly: [
  { h: 'Confirm your SIM and network actually support NB-IoT',
    body: `<p>This is not universal. Many consumer tariffs do not carry NB-IoT at all, and some countries have
    LTE-M but not NB-IoT or the reverse.</p>
    <p>Check with your SIM provider, and check the coverage map for the specific technology. A SIM that works
    perfectly on Cat-1 may never attach as NB-IoT.</p>` },
  { h: 'Drive it by hand and choose the mode',
    body: `<p>Passthrough sketch, then:</p>
    <ul>
      <li><code>AT+CFUN=0</code> - radio off while configuring</li>
      <li><code>AT+CNMP=38</code> - LTE only</li>
      <li><code>AT+CMNB=2</code> - 1 is LTE-M, 2 is NB-IoT, 3 is both</li>
      <li><code>AT+CGDCONT=1,"IP","your.apn"</code></li>
      <li><code>AT+CFUN=1</code> - radio back on</li>
      <li><code>AT+CEREG?</code> - wait for <code>,1</code> or <code>,5</code></li>
    </ul>
    <p>First NB-IoT attach can take <strong>several minutes</strong>. It is genuinely slow. Leave it.</p>` },
  { h: 'Read your coverage class before committing to a location',
    body: `<p><code>AT+CPSI?</code> gives you the cell, band and signal figures. What matters is RSRP:</p>
    <ul>
      <li><strong>Above -95 dBm</strong>: excellent. Messages go quickly and cheaply.</li>
      <li><strong>-95 to -105</strong>: good.</li>
      <li><strong>-105 to -115</strong>: workable, with repetitions starting to cost you.</li>
      <li><strong>Below -115</strong>: deep coverage enhancement. It will work, and each message costs many
      times the energy.</li>
    </ul>
    <p>Take this reading at the exact installation point. It is the single best predictor of battery
    life.</p>` },
  { h: 'Negotiate PSM and read back what you got',
    body: `<p><code>AT+CPSMS=1,,,"00100100","00000001"</code> requests a TAU and an active time, encoded as
    binary strings - the format is awkward and the code section explains it.</p>
    <p>Then query <code>AT+CPSMS?</code> and, more importantly, watch the <code>+CEREG</code> unsolicited
    response, which reports the values the network <em>granted</em>.</p>
    <p>You will not always get what you asked for. A device designed around a 24-hour TAU that was granted
    30 minutes has 48 times the wake-ups and a fraction of the battery life.</p>` },
  { h: 'Send a UDP packet by hand',
    body: `<p><code>AT+CAOPEN</code>, <code>AT+CASEND</code>, <code>AT+CACLOSE</code>. Point it at a listener
    on a machine you control - <code>nc -u -l 5005</code> on Linux or macOS will do.</p>
    <p>Watching a datagram arrive from a device on a mobile network is the moment this project becomes
    real.</p>` },
  { h: 'Measure the energy of one report cycle',
    body: `<p>This is the measurement everything else depends on. With a meter (or better, a
    current-logging tool) capture one complete wake-transmit-sleep cycle.</p>
    <p>You want: how long awake, what average current, and therefore how many milliamp-hours per report.
    Typical good coverage is around 0.05&nbsp;mAh; poor coverage can be 0.5.</p>
    <p>Multiply by reports per year and compare with the battery. The code section does this arithmetic.</p>` },
  { h: 'Run it for a week before installing',
    body: `<p>On the bench, at the real reporting interval, logging battery voltage. Extrapolate.</p>
    <p>A week of data tells you far more than any calculation, and it is very much cheaper to find a problem
    now than after the box is on a post.</p>` },
  { h: 'Install, and record everything',
    body: `<p>Photograph the installation, record the RSRP, the granted PSM timers, the battery voltage and
    the date. In two years you will want to know what changed.</p>` }
],

libraries: [
  { name: 'Adafruit BME280', by: 'Adafruit', why: 'The sensor, in forced mode so it sleeps between readings.' },
  { name: 'ESP32 board package', by: 'Espressif', how: 'Boards Manager: "esp32"', why: 'Deep sleep and RTC memory.' },
  { name: 'No modem library', by: '-', why: 'PSM configuration and the granted-timer readback are exactly the things wrapper libraries do not expose. Raw AT is the only honest way to do this.' }
],

code: [
{
  h: 'The field sensor',
  intro: `<p>Wakes, reads, sends one UDP datagram, negotiates PSM, and sleeps. The PSM timer encoding is the
  fiddly part and is explained in the comments.</p>`,
  name: 'nbiot_sensor.ino',
  code: `/* ------------------------------------------------------------------
   NB-IoT field sensor with Power Saving Mode.

   Wake -> read -> one UDP datagram -> PSM -> deep sleep.

   The whole design rests on PSM: the network agrees to stop paging
   us and to hold our registration open, so waking does not mean
   re-attaching. Without it this is a two-week device.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_BME280.h>

#define MODEM_RX    16
#define MODEM_TX    17
#define MODEM_PWR    4
#define MODEM_DTR   25
#define MODEM_STA   34
#define VBAT_PIN    35
#define VBAT_EN     26          // MOSFET enabling the sense divider

const char APN[]     = "iot.1nce.net";
const char SERVER[]  = "203.0.113.10";     // <-- your listener
const int  PORT      = 5005;

#define REPORT_MINUTES   120
#define uS_PER_MIN  60000000ULL

/* --- PSM timer encoding -----------------------------------------------
   3GPP encodes these as 8-bit strings: 3 unit bits then 5 value bits.

   T3412 (TAU) units:  000=10min 001=1h 010=10h 011=2s 100=30s 101=1min
   T3324 (active):     000=2s    001=1min 010=6min  111=disabled

   "00100100" = 001 (1 hour) x 00100 (4)  = 4 hours
   "00000001" = 000 (2 s)    x 00001 (1)  = 2 seconds active

   Four hours between mandatory check-ins, two seconds of reachability
   after each send. Ask for more TAU than your reporting interval, or
   the network wakes you anyway and you pay for it.
   ------------------------------------------------------------------ */
const char TAU_BITS[]    = "00100100";     // 4 hours
const char ACTIVE_BITS[] = "00000001";     // 2 seconds

Adafruit_BME280 bme;

RTC_DATA_ATTR uint16_t seq = 0;
RTC_DATA_ATTR bool everAttached = false;

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, MODEM_RX, MODEM_TX);
  delay(50);
  seq++;

  unsigned long t0 = millis();
  Serial.print(F("\\n--- wake #")); Serial.println(seq);

  pinMode(MODEM_PWR, OUTPUT);
  pinMode(MODEM_DTR, OUTPUT);
  pinMode(MODEM_STA, INPUT);
  pinMode(VBAT_EN, OUTPUT);

  // DTR low = stay awake while we work.
  digitalWrite(MODEM_DTR, LOW);

  Wire.begin(21, 22);
  if (!bme.begin(0x76)) bme.begin(0x77);
  bme.setSampling(Adafruit_BME280::MODE_FORCED,
                  Adafruit_BME280::SAMPLING_X1,
                  Adafruit_BME280::SAMPLING_X1,
                  Adafruit_BME280::SAMPLING_X1,
                  Adafruit_BME280::FILTER_OFF);
  bme.takeForcedMeasurement();

  float tC = bme.readTemperature();
  float rh = bme.readHumidity();
  float hPa = bme.readPressure() / 100.0;
  uint16_t mv = readBatteryMv();

  if (!modemUp()) {
    Serial.println(F("modem did not come up"));
    sleepNow();
  }

  if (!everAttached) {
    // First boot only: choose the radio technology and the APN. These
    // persist in the modem's own NVRAM, so later wakes skip it.
    configureRadio();
    everAttached = true;
  }

  if (!waitForRegistration(180)) {
    Serial.println(F("not registered"));
    sleepNow();
  }

  reportCoverage();

  char payload[120];
  snprintf(payload, sizeof(payload),
           "{\\"n\\":%u,\\"t\\":%.2f,\\"h\\":%.1f,\\"p\\":%.1f,\\"v\\":%u}",
           seq, tC, rh, hPa, mv);

  sendUdp(payload);

  enablePsm();

  Serial.print(F("awake for ")); Serial.print(millis() - t0);
  Serial.println(F(" ms"));
  sleepNow();
}

void loop() { }

/* --- modem -------------------------------------------------------------- */
bool modemUp() {
  if (at("AT", "OK", 1000)) return true;        // already awake (PSM wake)

  digitalWrite(MODEM_PWR, HIGH);
  delay(1200);
  digitalWrite(MODEM_PWR, LOW);

  for (byte i = 0; i < 20; i++) {
    if (at("AT", "OK", 1000)) { at("ATE0", "OK", 1000); return true; }
    delay(500);
  }
  return false;
}

void configureRadio() {
  Serial.println(F("first boot: configuring radio"));

  at("AT+CFUN=0", "OK", 10000);        // radio off to configure
  at("AT+CNMP=38", "OK", 5000);        // LTE only
  at("AT+CMNB=2", "OK", 5000);         // 1=LTE-M 2=NB-IoT 3=both

  char cmd[80];
  snprintf(cmd, sizeof(cmd), "AT+CGDCONT=1,\\"IP\\",\\"%s\\"", APN);
  at(cmd, "OK", 5000);

  at("AT+CEREG=4", "OK", 2000);        // verbose registration reporting
  at("AT+CFUN=1", "OK", 10000);        // radio on
}

bool waitForRegistration(int seconds) {
  // First NB-IoT attach is genuinely slow - minutes, not seconds.
  for (int i = 0; i < seconds; i++) {
    Serial2.println("AT+CEREG?");
    String r = collect(1000);
    if (r.indexOf(",1") > 0 || r.indexOf(",5") > 0) {
      Serial.print(F("registered after ")); Serial.print(i); Serial.println(F(" s"));
      return true;
    }
    delay(1000);
  }
  return false;
}

void reportCoverage() {
  // RSRP is what predicts battery life. Below -115 dBm the modem is
  // using heavy repetition and each message costs many times more.
  Serial2.println("AT+CPSI?");
  String r = collect(2000);
  Serial.print(F("coverage: ")); Serial.println(r);
}

/* --- UDP ---------------------------------------------------------------
   One datagram. No handshake, no session, no teardown - which on a
   device that sleeps between messages is roughly a tenth of the
   energy of an MQTT-over-TLS publish. */
bool sendUdp(const char *payload) {
  char cmd[120];

  at("AT+CNACT=0,1", "+APP PDP: 0,ACTIVE", 30000);      // bring up data

  snprintf(cmd, sizeof(cmd), "AT+CAOPEN=0,0,\\"UDP\\",\\"%s\\",%d", SERVER, PORT);
  if (!at(cmd, "+CAOPEN: 0,0", 20000)) {
    Serial.println(F("could not open socket"));
    return false;
  }

  snprintf(cmd, sizeof(cmd), "AT+CASEND=0,%d", strlen(payload));
  if (!at(cmd, ">", 5000)) return false;

  Serial2.print(payload);
  bool ok = waitFor("OK", 20000);

  at("AT+CACLOSE=0", "OK", 5000);
  Serial.println(ok ? F("sent") : F("send failed"));
  return ok;
}

/* --- PSM ---------------------------------------------------------------- */
void enablePsm() {
  char cmd[80];
  snprintf(cmd, sizeof(cmd), "AT+CPSMS=1,,,\\"%s\\",\\"%s\\"", TAU_BITS, ACTIVE_BITS);
  at(cmd, "OK", 5000);

  /* Read back what the NETWORK granted, which is not necessarily what
     we asked for. A device designed around a 4-hour TAU that was given
     30 minutes has eight times the wake-ups and a fraction of the
     battery life - and nothing else will tell you. */
  Serial2.println("AT+CPSMS?");
  Serial.print(F("PSM granted: "));
  Serial.println(collect(2000));

  at("AT+CSCLK=1", "OK", 2000);        // allow DTR-controlled sleep

  // Releasing DTR lets the modem drop into PSM.
  digitalWrite(MODEM_DTR, HIGH);
  delay(100);
}

void sleepNow() {
  Serial.print(F("sleeping ")); Serial.print(REPORT_MINUTES); Serial.println(F(" min"));
  Serial.flush();

  digitalWrite(MODEM_DTR, HIGH);
  digitalWrite(VBAT_EN, LOW);

  esp_sleep_enable_timer_wakeup(REPORT_MINUTES * uS_PER_MIN);
  esp_deep_sleep_start();
}

/* --- battery, measured only while we need it ---------------------------- */
uint16_t readBatteryMv() {
  digitalWrite(VBAT_EN, HIGH);         // switch the divider on
  delay(10);
  analogSetPinAttenuation(VBAT_PIN, ADC_11db);
  uint32_t sum = 0;
  for (byte i = 0; i < 16; i++) { sum += analogRead(VBAT_PIN); delay(2); }
  digitalWrite(VBAT_EN, LOW);          // and off again

  return (uint16_t)((sum / 16.0) / 4095.0 * 3.3 * 2.0 * 1000);
}

/* --- AT plumbing --------------------------------------------------------- */
bool at(const char *cmd, const char *expect, unsigned long timeoutMs) {
  while (Serial2.available()) Serial2.read();
  Serial.print(F(">> ")); Serial.println(cmd);
  Serial2.println(cmd);
  return waitFor(expect, timeoutMs);
}

bool waitFor(const char *expect, unsigned long timeoutMs) {
  unsigned long deadline = millis() + timeoutMs;
  String got = "";
  while (millis() < deadline) {
    while (Serial2.available()) {
      char c = Serial2.read();
      Serial.write(c);
      got += c;
      if (got.indexOf(expect) >= 0) return true;
      if (got.indexOf("ERROR") >= 0) return false;
      if (got.length() > 400) got = got.substring(200);
    }
    delay(1);
  }
  return false;
}

String collect(unsigned long ms) {
  unsigned long deadline = millis() + ms;
  String out = "";
  while (millis() < deadline) {
    while (Serial2.available()) { char c = Serial2.read(); Serial.write(c); out += c; }
  }
  return out;
}`,
  after: `<p><strong>The arithmetic, so you can check your own design.</strong> Per report in good coverage:
  about 8 seconds awake at an average 40&nbsp;mA, which is 0.09&nbsp;mAh. Twelve reports a day is
  1.1&nbsp;mAh/day. Sleep at 30&nbsp;uA is 0.72&nbsp;mAh/day. Total about 1.8&nbsp;mAh/day, so
  <strong>660&nbsp;mAh a year</strong>.</p>
  <p>A 3400&nbsp;mAh 18650 gives about five years on paper - call it three after self-discharge, cold weather
  and the occasional failed attach. A LiSOCl2 primary at 3600&nbsp;mAh with almost no self-discharge gets
  genuinely close to the paper figure.</p>
  <p>In poor coverage the awake time can be 30 seconds rather than 8, which takes you to under a year. That is
  why the RSRP reading at the installation point matters more than any component choice.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note warn"><span class="t">First NB-IoT attach takes minutes</span>
<p>Not seconds. The modem scans bands, finds a cell, and NB-IoT's attach procedure is slow by design. Three
minutes on a first cold attach is normal and the sketch allows for it.</p>
<p>Once attached with PSM negotiated, later wakes are fast because registration is still valid.</p></div>
<div class="note danger"><span class="t">A sleeping device is hard to reprogram</span>
<p>Two hours of deep sleep gives the IDE almost no window. Hold BOOT while starting the upload and tap EN.</p>
<p>While developing set <code>REPORT_MINUTES</code> to 2, and put it back before installing.</p></div>
<div class="note tip"><span class="t">Listen for the datagrams</span>
<p><code>nc -u -l 5005</code> on any machine with a public address, or use a cheap VPS. Add a timestamp:
<code>nc -u -l 5005 | while read l; do echo "$(date -Is) $l"; done</code></p></div>`,

tune: [
  { h: 'Match the TAU to your reporting interval',
    body: `<p>If you report every two hours, ask for a TAU longer than that - four hours - so the network's
    mandatory check-in never lands between your own reports. A TAU shorter than your interval means extra
    wake-ups you gain nothing from.</p>
    <p>Always read back what was granted. Networks commonly cap TAU well below the maximum the standard
    allows, and some operators do not support PSM at all.</p>` },
  { h: 'If PSM is not granted, use eDRX instead',
    body: `<p>Some networks refuse PSM. eDRX (<code>AT+CEDRXS</code>) is the weaker alternative: the modem
    stays registered but only listens for paging every few seconds to a few minutes, rather than continuously.
    Current drops to a few milliamps rather than microamps.</p>
    <p>Much worse than PSM and much better than nothing. Check <code>AT+CEDRXRDP</code> for what was
    granted.</p>` },
  { h: 'LTE-M if anything moves',
    body: `<p><code>AT+CMNB=1</code>. NB-IoT has no handover: a moving device loses the connection at every
    cell boundary and has to reselect, which is slow and expensive.</p>
    <p>LTE-M also has much lower latency and more bandwidth, at the cost of about 5&nbsp;dB less coverage
    enhancement. For anything on a vehicle or an animal, LTE-M every time.</p>` },
  { h: 'Getting to genuine microamps',
    body: `<p>In descending order of how much they save:</p>
    <ul>
      <li>Bare ESP32-WROOM instead of a DevKit, with an HT7333 - saves 10-20&nbsp;mA.</li>
      <li>A switched or 1&nbsp;M battery divider - saves 200&nbsp;uA.</li>
      <li>Remove or bypass any buck converter with high quiescent draw - saves up to 6&nbsp;mA.</li>
      <li>BME280 in forced mode - saves about 3&nbsp;mA of continuous measurement.</li>
    </ul>
    <p>Measure after each change. Assumptions are how a three-year design becomes a three-week one.</p>` },
  { h: 'Batch several readings into one message',
    body: `<p>Radio energy is dominated by the attach and the transmission setup, not by the payload size.
    Sampling every 20 minutes but transmitting once every two hours - six readings in one datagram - costs
    almost exactly the same energy as transmitting one.</p>
    <p>Six times the data resolution for free is the best trade available in this project.</p>` },
  { h: 'CoAP if you want acknowledgements',
    body: `<p>UDP is fire-and-forget. CoAP adds confirmable messages - a small acknowledgement from the server
    - for about 20 bytes and one extra round trip.</p>
    <p>Worth it when a missing reading matters. Not worth it for a temperature chart, where the sequence
    number already tells you what was lost.</p>` },
  { h: 'Cold weather and internal resistance',
    body: `<p>A lithium cell's internal resistance can triple at -20&nbsp;&deg;C. The transmit burst then sags
    the voltage enough to reset the modem - a device that works all autumn and fails in January.</p>
    <p>The fix is capacitance: a hybrid layer capacitor or a large supercapacitor across the supply, charged
    slowly between bursts. This is standard practice for primary-cell cellular devices and it is the
    difference between a design that works in a lab and one that works on a hillside.</p>` }
],

trouble: [
  { q: 'It never attaches as NB-IoT',
    a: `Three candidates, in order: your SIM's tariff does not include NB-IoT; there is no NB-IoT coverage at
    that location even though there is LTE; or the band is wrong. Try <code>AT+CMNB=3</code> to allow both
    NB-IoT and LTE-M and see which it picks, and check <code>AT+CPSI?</code> for the band.` },
  { q: 'Sleep current is milliamps, not microamps',
    a: `Measure each part in turn. Almost always the ESP32 DevKit's regulator and USB chip (10-20&nbsp;mA),
    a buck converter's quiescent current (up to 6&nbsp;mA), or a permanently connected battery divider
    (200&nbsp;uA). All three are hardware, not software.` },
  { q: 'PSM does not seem to be working',
    a: `Read back <code>AT+CPSMS?</code> and the granted values in <code>+CEREG</code>. The network may have
    refused, or granted much shorter timers than requested. Also check DTR is actually being released - the
    modem will not sleep while DTR is held low.` },
  { q: 'It re-attaches on every wake',
    a: `Registration is being lost, which means PSM is not holding it. Either the network did not grant PSM,
    or the TAU expired between wakes - if your reporting interval is longer than the granted TAU, that is
    exactly what happens. Report more often, or ask for a longer TAU.` },
  { q: 'Battery dies far sooner than the calculation',
    a: `Check the coverage at the installation point. RSRP below -115&nbsp;dBm means heavy repetition and each
    message can cost five times the energy. The calculation is probably right for good coverage and your site
    is not good coverage.` },
  { q: 'It works at 20 degrees and fails in winter',
    a: `Cell internal resistance rises sharply in the cold, so the transmit burst sags the supply enough to
    reset the modem. Add capacitance at the module - a hybrid layer capacitor is the proper fix.` },
  { q: 'The UDP packets never arrive',
    a: `Check the server is reachable from the internet, not behind NAT, and that the port is open. Many IoT
    SIMs put devices on a private APN with no route to the public internet at all - check whether yours needs
    a VPN or a specific endpoint.` },
  { q: 'It attached once and now will not again',
    a: `Some networks rate-limit repeated attach attempts from a device, and a few temporarily bar a SIM that
    attaches too often. Slow down, and check <code>AT+CEER</code> for the last error cause - it gives a
    numeric reason the generic responses do not.` }
],

next: `
<ul>
  <li><strong>Mains power and more bandwidth</strong> - the
  <a href="project.html?p=lte-remote-monitor">LTE Cat-1 monitor</a> uses MQTT and a proper dashboard, without
  the power constraints.</li>
  <li><strong>Learn AT commands cheaply</strong> - the <a href="project.html?p=gsm-sms-alarm">SMS alarm</a> is
  the $15 version of the same interface.</li>
  <li><strong>No operator at all</strong> - the <a href="project.html?p=lora-remote-sensor">LoRa sensor</a>
  gets similar battery life with no SIM and no subscription, if you can put a base station within range.</li>
  <li><strong>Add position</strong> - the SIM7080G has GNSS built in. <code>AT+CGNSPWR=1</code> and
  <code>AT+CGNSINF</code> give you a fix without a second module, which makes this an
  <a href="project.html?p=gps-lora-tracker">asset tracker</a> that works anywhere.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Primary lithium cells</span>
<ul>
  <li><strong>LiSOCl2 cells must never be charged.</strong> Not by a TP4056, not by a solar panel, not by
  accident. They can vent, rupture or catch fire. If you fit primary cells, remove the charging circuit
  entirely rather than leaving it connected and unused.</li>
  <li><strong>They must not be short-circuited or heated.</strong> They hold a lot of energy in a small
  package and behave badly when abused.</li>
  <li><strong>Do not mix cell types</strong> or put primary and rechargeable cells in the same holder.</li>
  <li><strong>Dispose of them properly.</strong> They are classed as hazardous waste in most places and not
  general recycling.</li>
</ul>
</div>
<div class="note warn"><span class="t">Unattended for years</span>
<ul>
  <li><strong>Build it to a standard you are happy leaving alone.</strong> No bare cells, proper strain relief,
  a real enclosure, and vents on the underside so it does not fill with condensation.</li>
  <li><strong>Never power a transmitter without its antenna.</strong></li>
  <li><strong>Watch the roaming.</strong> An IoT SIM near a border can attach to a foreign operator at a much
  higher rate, and a device that reports for three years unattended will bill for three years.</li>
  <li><strong>Set an alert for silence.</strong> The most important message a multi-year sensor sends is the
  one that does not arrive. A dashboard that only shows readings will not tell you it died.</li>
</ul>
</div>`
});
