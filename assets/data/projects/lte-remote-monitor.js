/* A7670 LTE Cat-1: real data to a real broker, from anywhere with a mast. */
AB.addProject({
slug: 'lte-remote-monitor',
title: 'LTE remote monitor',
cat: 'cellular',
level: 3,
time: '6 hours',
solder: true,
board: 'ESP32',
feature: true,
tags: ['lte', 'cat-1', 'a7670', 'mqtt', 'iot sim', 'telemetry', 'at commands', 'dashboard', 'no wifi'],
blurb: 'A sensor with no Wi-Fi and no base station of yours, posting to a dashboard you can open from anywhere. The tower is already built and paid for; you rent a few megabytes of it.',

skills: ['LTE Cat-1', 'MQTT over cellular', 'IoT SIMs and APNs', 'AT command state machines', 'Reconnection strategy', 'Data budgeting'],

intro: `
<p>The <a href="project.html?p=lora-remote-sensor">LoRa sensor</a> reaches kilometres and needs a base station
you build, install and maintain. That is the right answer when you own both ends and the sites are near each
other. It is the wrong answer for one sensor in one field forty miles away.</p>
<p>Cellular inverts that. Someone has already built the infrastructure, tested it, and put engineers on call
for it. You put a SIM in a module and your sensor is on the internet from anywhere with a signal, which in most
countries is very nearly anywhere. There is no gateway to fail, no antenna on your roof, and no line of
sight.</p>
<p>What you pay is money - a few dollars a year on an IoT tariff - and power. A cellular modem is not a
microamp device, and this project is honest about that: mains or a decent solar setup, not a coin cell. The
<a href="project.html?p=nbiot-field-sensor">NB-IoT project</a> is the one that runs for years on a
battery.</p>`,

what: [
  'Publish sensor readings to an MQTT broker over LTE, from anywhere with coverage.',
  'See them on a dashboard - Home Assistant, Node-RED, Grafana, or a free hosted broker.',
  'Reconnect on its own after a dropout, a tower handover, or a network outage, without a watchdog reset.',
  'Report its own signal strength, operator and cell, so a coverage problem is diagnosable remotely.',
  'Stay inside a data budget you can actually afford - under 5 MB a year at ten-minute reporting.',
  'Accept commands back over MQTT, so the device can be reconfigured without visiting it.'
],

how: `
<p><strong>Cat-1, and why not something faster.</strong> LTE comes in categories. Cat-4 is phone-grade -
150&nbsp;Mbps down, and the module costs more, draws more and gets hot. Cat-1 is about 10&nbsp;Mbps down and
5 up, which for a sensor posting 200 bytes is roughly ten thousand times more than required.</p>
<p>Cat-1 is the sweet spot for this job: cheap modules, no 2G fallback needed, supported on every LTE network
worldwide, and - unlike Cat-M1 and NB-IoT - it works on plain consumer LTE without the operator having to
enable anything special. That last point matters more than the specifications, because Cat-M1 coverage is
patchy and you cannot tell from a coverage map.</p>

<p><strong>The module has its own TCP stack, and you should use it.</strong> There are two ways to get data
out of a cellular modem. You can run PPP and let the host be a full IP node - flexible, and it needs an IP
stack the ESP32 must dedicate memory to. Or you can use the module's built-in stack through AT commands:
<code>AT+CMQTTCONNECT</code>, <code>AT+CMQTTPUB</code> and so on.</p>
<p>The built-in stack is the right choice here. The modem does TLS, DNS, reconnection and keepalives in its
own firmware, the host sends a handful of AT commands, and the whole thing fits comfortably alongside sensor
code. The cost is that you are limited to what the module's firmware implements.</p>

<p><strong>The APN, which is the thing that blocks everyone once.</strong> Before any data flows the module
needs the Access Point Name - the operator's label for which network gateway to attach to. Consumer SIMs use
things like <code>internet</code> or <code>everywhere</code>; IoT SIMs have their own
(<code>hologram</code>, <code>soracom.io</code>, <code>iot.1nce.net</code>).</p>
<p>Wrong APN means the module registers perfectly, reports excellent signal, and cannot open a single
connection. It looks like a broken module and is a one-line configuration error. Your SIM provider documents
theirs.</p>

<p><strong>Data budgeting, which is real money on IoT tariffs.</strong></p>
<ul>
  <li>An MQTT publish of a small JSON payload: roughly 150-250 bytes with overhead.</li>
  <li>Every ten minutes: about 144 publishes a day, so 30&nbsp;KB a day, <strong>11&nbsp;MB a year</strong>.</li>
  <li>Reconnections cost much more - a TLS handshake is 4-6&nbsp;KB. Ten a day is another 20&nbsp;MB a year.</li>
</ul>
<p>So the reconnection strategy matters more to your bill than the reporting interval does. A device that
drops and reconnects every few minutes because of a poor backoff can burn a year's allowance in a fortnight -
which is why the sketch backs off exponentially and holds the connection open rather than reconnecting per
message.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: '3.3 V logic matches the module, and it has three hardware UARTs so the modem gets a real serial port.' },
  { id: 'a7670', qty: 1, note: 'Buy the regional variant: A7670E for Europe, A7670SA for South America, A7670G for global roaming. The wrong bands means no service at all.' },
  { id: 'iot-sim', qty: 1, note: 'An IoT SIM is the right tool. 1NCE sells 500 MB for ten years for about $11, which for this project is a lifetime. Disable the PIN before it goes in.' },
  { id: 'lte-ant', qty: 1, note: 'Main AND diversity. Fitting only the main antenna loses you several dB of receive, which at the edge of a cell is the whole link.' },
  { id: 'bme280', qty: 1, note: 'The thing being measured. Any sensor works - this project is about the transport.' },
  { id: 'cap1000', qty: 2, note: 'Across the module’s supply, at the module. LTE bursts are gentler than GSM but still hundreds of milliamps.' },
  { id: 'buck', qty: 1, note: 'To 3.8 V for the module if you are running from 12 V or a higher supply. Many A7670 breakouts already have one - check yours first.' },
  { id: 'psu5v3a', qty: 1, note: 'Must deliver 2 A honestly. LTE attach is the peak and it happens at the worst moment - boot.' },
  { id: 'oled13', qty: 1, note: 'Local status. Worth it: an unreachable device with no display is very hard to diagnose on site.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2 },
  { id: 'box-ip65', qty: 1, note: 'If it lives outdoors. Antennas outside the box or on bulkhead connectors.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'bb-400', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',  at: [0, 54] },
    { id: 'bb',   comp: 'bb400',  at: [0, -6] },
    { id: 'lte',  comp: 'lte',    at: [-44, -62] },
    { id: 'bme',  comp: 'bme280', at: [42, -58] },
    { id: 'oled', comp: 'oled13', at: [42, -92], ry: 180 }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+2',   color: 'red',    note: '3.3 V rail for the sensor and display' },
    { from: 'mcu.GND',  to: 'bb.T-2',   color: 'black',  note: 'Ground rail. The modem must share this' },
    { from: 'lte.VCC',  to: 'bb.T+6',   color: 'brown',  note: 'Modem power - 3.4-4.2 V, from its own regulator, with the capacitors at the module' },
    { from: 'lte.GND',  to: 'bb.T-6',   color: 'black',  note: 'Modem ground, star-connected at the capacitors' },
    { from: 'lte.TXD',  to: 'mcu.D16',  color: 'green',  note: 'Modem to ESP32 Serial2 RX' },
    { from: 'lte.RXD',  to: 'mcu.D17',  color: 'orange', note: 'ESP32 Serial2 TX to modem. Both are 3.3 V - no divider needed' },
    { from: 'lte.PWR',  to: 'mcu.D4',   color: 'purple', note: 'PWRKEY. A pulse here turns the modem on - it does not start with power alone' },
    { from: 'lte.STA',  to: 'mcu.D35',  color: 'white',  note: 'STATUS output, HIGH when the modem is running. Input-only pin is fine' },
    { from: 'bme.VIN',  to: 'bb.T+12',  color: 'red',    note: 'Sensor power' },
    { from: 'bme.GND',  to: 'bb.T-12',  color: 'black',  note: 'Sensor ground' },
    { from: 'bme.SDA',  to: 'mcu.D21',  color: 'blue',   note: 'I2C data, shared with the display' },
    { from: 'bme.SCL',  to: 'mcu.D22',  color: 'yellow', note: 'I2C clock' },
    { from: 'oled.VCC', to: 'bb.T+16',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-16',  color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21',  color: 'blue',   note: 'Same I2C bus, different address' },
    { from: 'oled.SCL', to: 'mcu.D22',  color: 'yellow', note: 'Same I2C clock' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">PWRKEY: the modem does not start just because it has power</span>
<p>This catches everyone exactly once. Applying voltage to an A7670 or SIM7600 does nothing visible - it sits
there. The module starts when <strong>PWRKEY is pulled low for about a second</strong> and then released.</p>
<p>Some breakouts have an auto-start jumper or do it in hardware; many do not. Wire PWRKEY to a GPIO and pulse
it in <code>setup()</code>, which also means the sketch can power-cycle a wedged modem without a person
present - worth far more than the one pin it costs.</p>
<p>Check STATUS afterwards: it goes HIGH when the modem is genuinely running.</p></div>

<div class="note danger"><span class="t">Fit both antennas</span>
<p>LTE uses receive diversity - two antennas on the downlink, combined to pull a usable signal out of
multipath. It is not a spare.</p>
<p>Running with only the main antenna typically costs several dB of receive sensitivity. In good coverage you
will not notice; at the edge of a cell, which is where a remote sensor usually lives, it is the difference
between a connection and none.</p>
<p>Keep them 50&nbsp;mm or more apart, and outside any metal enclosure.</p></div>

<div class="note warn"><span class="t">Power: 2 A peaks at attach, and attach happens at boot</span>
<p>LTE is gentler than GSM's 2&nbsp;A bursts but still pulls several hundred milliamps steadily and peaks
higher during attach and handover - and attach is the first thing it does, while your capacitors are still
charging from cold.</p>
<p>1000&nbsp;uF at the module, thick short supply wires, and a supply rated well above what you measure.
A device that boots, attaches, and resets is nearly always this.</p></div>

<div class="note tip"><span class="t">Both sides are 3.3 V, so no dividers</span>
<p>The ESP32 and the modem both use 3.3&nbsp;V logic, which is one of the reasons this project is not a Nano.
Straight wires between them, and a real hardware UART on Serial2 rather than SoftwareSerial - which matters
once you are moving kilobytes rather than AT commands.</p></div>`,

solderSteps: [
  { h: 'Capacitors at the module, as always',
    body: `<p>Two 1000&nbsp;uF across the modem's VCC and GND, on the module. Positive leg to VCC, striped
    side to ground, laid flat so they survive being moved.</p>` },
  { h: 'Check whether your breakout already regulates',
    body: `<p>Many A7670 and SIM7600 breakouts include a regulator and accept 5&nbsp;V or more. Some are bare
    and want 3.4-4.2&nbsp;V.</p>
    <p>Read the silkscreen and measure before connecting. If it has a wide input range marked, feed it
    5&nbsp;V and leave the buck converter out; if not, set the buck to 3.8&nbsp;V unloaded, first.</p>` },
  { h: 'Heavy supply wiring, starred at the capacitors',
    body: `<p>22&nbsp;AWG or thicker from the supply to the module, as short as the layout allows. Bring the
    ESP32's ground to the same point as the capacitors rather than through the module.</p>` },
  { h: 'Bulkhead antenna connectors if it is going in a box',
    body: `<p>Two SMA bulkheads, as far apart as the lid allows, with the u.FL pigtails inside. Drill before
    anything is fitted.</p>
    <p>An LTE antenna inside a sealed metal box is a non-starter. In a plastic box internal antennas work but
    cost you a few dB - fine in town, not at the edge of coverage.</p>` },
  { h: 'Socket everything',
    body: `<p>Female headers for the ESP32 and the modem. You will swap SIMs, and modem firmware occasionally
    needs a module changed.</p>` },
  { h: 'Power up in stages and measure',
    body: `<p>Supply alone, measured. Then the modem with the ESP32 out of its socket - pulse PWRKEY by hand
    with a jumper and watch the status LED and the current draw. Then the whole thing.</p>` }
],

assembly: [
  { h: 'Get the SIM working in a phone first',
    body: `<p>Put it in a phone, disable the PIN, and confirm it gets data. Note the <strong>APN</strong> the
    phone is using, or get it from your SIM provider's documentation.</p>
    <p>This ten-minute check eliminates half the possible failures before you have written a line.</p>` },
  { h: 'Drive the modem by hand',
    body: `<p>Passthrough sketch, then work through it manually:</p>
    <ul>
      <li><code>AT</code> &rarr; <code>OK</code></li>
      <li><code>AT+CPIN?</code> &rarr; <code>READY</code>, or the SIM has a PIN still set</li>
      <li><code>AT+CSQ</code> &rarr; signal, first number 0-31</li>
      <li><code>AT+CREG?</code> and <code>AT+CGREG?</code> &rarr; <code>,1</code> or <code>,5</code></li>
      <li><code>AT+COPS?</code> &rarr; which operator it found</li>
      <li><code>AT+CGDCONT=1,"IP","your.apn"</code> &rarr; set the APN</li>
      <li><code>AT+CGACT=1,1</code> then <code>AT+CGPADDR</code> &rarr; you should get an IP address</li>
    </ul>
    <p>An IP address at the end of that list means the hard part is done. Everything after it is protocol.</p>` },
  { h: 'Set up a broker to publish to',
    body: `<p>Easiest to start: a free public test broker like <code>test.mosquitto.org</code> on port 1883,
    unencrypted, no account. Good for proving the path and completely public - do not send anything you mind
    strangers reading.</p>
    <p>For real use: Mosquitto on a Pi at home, HiveMQ Cloud's free tier, or Home Assistant's built-in broker.
    Use TLS on port 8883 and a username and password.</p>` },
  { h: 'Publish one message by hand',
    body: `<p>The A7670's MQTT commands, in order: <code>AT+CMQTTSTART</code>,
    <code>AT+CMQTTACCQ</code>, <code>AT+CMQTTCONNECT</code>, then topic and payload, then
    <code>AT+CMQTTPUB</code>.</p>
    <p>Have <code>mosquitto_sub</code> running on your laptop subscribed to the topic. Watching the first
    message arrive is the moment the project works.</p>` },
  { h: 'Run the sketch and leave it a day',
    body: `<p>The interesting number after 24 hours is not the readings - it is the reconnection count. A
    healthy device reconnects zero to two times a day. Ten or more means something is wrong and it is
    costing you data.</p>` },
  { h: 'Check your data usage against the estimate',
    body: `<p>Most IoT SIM dashboards show usage per device. Compare it with what you expected - the sketch
    prints its own estimate at boot.</p>
    <p>If actual is far above estimated, it is almost always reconnections rather than payload size.</p>` },
  { h: 'Build the dashboard',
    body: `<p>Home Assistant will auto-discover it if you publish to the right topics, Node-RED will chart it
    in ten minutes, and Grafana with an MQTT source gives you the nicest history.</p>
    <p>Whatever you use, set an alert for "no message in two hours" - the most important thing a remote sensor
    can tell you is that it has stopped.</p>` },
  { h: 'Install it, then check the signal from the final location',
    body: `<p>Coverage varies over tens of metres. <code>AT+CSQ</code> from where it will actually live,
    before the lid goes on and the ladder goes away.</p>
    <p>Below 10 and you should move the antenna or accept unreliability.</p>` }
],

libraries: [
  { name: 'ArduinoJson', by: 'Benoit Blanchon', why: 'Builds the payload. Worth it for correct escaping and for keeping the message small.' },
  { name: 'Adafruit BME280', by: 'Adafruit', why: 'The sensor.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The status display.' },
  { name: 'No modem library', by: '-', why: 'TinyGSM is good and worth knowing about. This guide drives AT commands directly, because when a cellular link misbehaves the only useful debugging is seeing the raw exchange - and a wrapper hides exactly that.' }
],

code: [
{
  h: 'The monitor',
  intro: `<p>An AT-driven MQTT publisher with a proper reconnection strategy. The backoff is the part that
  protects your data allowance.</p>`,
  name: 'lte_monitor.ino',
  code: `/* ------------------------------------------------------------------
   LTE remote monitor - publishes sensor data over MQTT.

   Set APN, BROKER and TOPIC below. The APN comes from your SIM
   provider and is the single most common thing to get wrong.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_BME280.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---- pins ------------------------------------------------------------
#define MODEM_RX   16        // ESP32 receives here
#define MODEM_TX   17
#define MODEM_PWR   4        // PWRKEY
#define MODEM_STA  35        // STATUS, input only

// ---- network ---------------------------------------------------------
const char APN[]      = "iot.1nce.net";     // <-- from your SIM provider
const char BROKER[]   = "tcp://test.mosquitto.org:1883";
const char CLIENT_ID[] = "buildbook-lte-1";
const char TOPIC[]    = "buildbook/monitor/1";

#define PUBLISH_EVERY_MS  600000UL      // 10 minutes
#define AT_TIMEOUT          10000UL

Adafruit_BME280 bme;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

bool mqttUp = false;
unsigned long lastPublish = 0;
uint32_t published = 0, reconnects = 0, failures = 0;

/* Exponential backoff. This matters to the bill, not just to tidiness:
   a TLS handshake is 4-6 KB, so a device that retries every 5 s
   through a two-hour outage spends more data failing than it would
   in a year of succeeding. */
uint32_t backoffMs = 5000;
#define BACKOFF_MAX 900000UL            // cap at 15 minutes

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, MODEM_RX, MODEM_TX);

  Wire.begin(21, 22);
  if (oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) oled.setTextColor(SSD1306_WHITE);
  if (!bme.begin(0x76)) bme.begin(0x77);

  pinMode(MODEM_PWR, OUTPUT);
  pinMode(MODEM_STA, INPUT);

  status("powering modem");
  modemPowerOn();

  status("attaching");
  if (!modemAttach()) {
    status("ATTACH FAILED");
    Serial.println(F("could not attach - check APN, SIM, antenna"));
  }

  Serial.print(F("estimated data use: "));
  Serial.print(220UL * (86400000UL / PUBLISH_EVERY_MS) * 365 / 1024);
  Serial.println(F(" KB/year at this interval"));
}

void loop() {
  if (!mqttUp) {
    static unsigned long nextTry = 0;
    if (millis() < nextTry) return;

    status("connecting");
    if (mqttConnect()) {
      mqttUp = true;
      backoffMs = 5000;                 // reset on success
      reconnects++;
      status("connected");
    } else {
      failures++;
      nextTry = millis() + backoffMs;
      backoffMs = min(backoffMs * 2, BACKOFF_MAX);
      Serial.print(F("connect failed, next try in "));
      Serial.print(backoffMs / 1000); Serial.println(F(" s"));
      status("retry backoff");
    }
    return;
  }

  if (millis() - lastPublish < PUBLISH_EVERY_MS && lastPublish) return;
  lastPublish = millis();

  if (!publishReading()) {
    // One failure is a glitch; treat it as a dropped connection and
    // let the backoff logic handle the reconnect rather than hammering.
    Serial.println(F("publish failed - assuming link is down"));
    mqttUp = false;
    at("AT+CMQTTDISC=0,120", "OK", 5000);
    at("AT+CMQTTREL=0", "OK", 5000);
    at("AT+CMQTTSTOP", "OK", 5000);
  }
}

/* --- modem bring-up ---------------------------------------------------- */
void modemPowerOn() {
  // Power alone does not start these modules. PWRKEY low for ~1 s does.
  if (digitalRead(MODEM_STA)) { Serial.println(F("modem already on")); return; }

  digitalWrite(MODEM_PWR, HIGH);
  delay(1200);
  digitalWrite(MODEM_PWR, LOW);

  // Give it time, then prove it is listening.
  for (byte i = 0; i < 30; i++) {
    if (at("AT", "OK", 1000)) { Serial.println(F("modem responding")); return; }
    delay(1000);
  }
  Serial.println(F("modem never answered AT"));
}

bool modemAttach() {
  at("ATE0", "OK", 2000);                       // echo off

  if (!at("AT+CPIN?", "READY", 5000)) {
    Serial.println(F("SIM not ready - PIN still set, or not seated"));
    return false;
  }

  // Wait for registration. Cold attach genuinely takes 30-60 s.
  for (byte i = 0; i < 60; i++) {
    if (at("AT+CGREG?", ",1", 2000) || at("AT+CGREG?", ",5", 2000)) break;
    delay(1000);
    if (i == 59) { Serial.println(F("never registered")); return false; }
  }

  Serial.print(F("signal: ")); Serial.println(signalStrength());

  char cmd[80];
  snprintf(cmd, sizeof(cmd), "AT+CGDCONT=1,\\"IP\\",\\"%s\\"", APN);
  at(cmd, "OK", 5000);

  if (!at("AT+CGACT=1,1", "OK", 30000)) {
    // This is the APN failing, nine times out of ten.
    Serial.println(F("PDP activation failed - check the APN"));
    return false;
  }

  at("AT+CGPADDR", "OK", 5000);                 // prints our IP
  return true;
}

/* --- MQTT, via the modem's own stack ------------------------------------ */
bool mqttConnect() {
  char cmd[160];

  if (!at("AT+CMQTTSTART", "+CMQTTSTART: 0", 20000)) return false;

  snprintf(cmd, sizeof(cmd), "AT+CMQTTACCQ=0,\\"%s\\",0", CLIENT_ID);
  if (!at(cmd, "OK", 5000)) return false;

  // 60 s keepalive, clean session. Keepalive costs 2 bytes each way
  // per interval, which is nothing - and it is what lets the broker
  // notice a dead device rather than holding a zombie session.
  snprintf(cmd, sizeof(cmd), "AT+CMQTTCONNECT=0,\\"%s\\",60,1", BROKER);
  return at(cmd, "+CMQTTCONNECT: 0,0", 30000);
}

bool publishReading() {
  char payload[160];
  snprintf(payload, sizeof(payload),
    "{\\"t\\":%.2f,\\"h\\":%.1f,\\"p\\":%.1f,\\"csq\\":%d,\\"up\\":%lu,\\"n\\":%lu}",
    bme.readTemperature(), bme.readHumidity(), bme.readPressure() / 100.0,
    signalStrength(), millis() / 60000UL, published);

  Serial.print(F("publish: ")); Serial.println(payload);

  char cmd[64];

  snprintf(cmd, sizeof(cmd), "AT+CMQTTTOPIC=0,%d", strlen(TOPIC));
  if (!at(cmd, ">", 5000)) return false;
  Serial2.print(TOPIC);
  if (!waitFor("OK", 5000)) return false;

  snprintf(cmd, sizeof(cmd), "AT+CMQTTPAYLOAD=0,%d", strlen(payload));
  if (!at(cmd, ">", 5000)) return false;
  Serial2.print(payload);
  if (!waitFor("OK", 5000)) return false;

  // QoS 1: the broker acknowledges. QoS 0 is cheaper and you never
  // find out whether anything arrived, which for a remote sensor is
  // the wrong trade.
  if (!at("AT+CMQTTPUB=0,1,60", "+CMQTTPUB: 0,0", 20000)) return false;

  published++;
  status("published");
  return true;
}

int signalStrength() {
  Serial2.println("AT+CSQ");
  String r = collect(2000);
  int i = r.indexOf("+CSQ:");
  return i < 0 ? 99 : r.substring(i + 6).toInt();
}

/* --- AT plumbing -------------------------------------------------------- */
bool at(const char *cmd, const char *expect, unsigned long timeoutMs) {
  while (Serial2.available()) Serial2.read();     // clear stale bytes
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
}

/* --- local display ------------------------------------------------------ */
void status(const char *msg) {
  Serial.print(F("[status] ")); Serial.println(msg);

  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println(F("LTE monitor"));
  oled.drawFastHLine(0, 9, 128, SSD1306_WHITE);

  oled.setCursor(0, 14);
  oled.println(msg);

  oled.setCursor(0, 28);
  oled.print(F("csq  ")); oled.println(signalStrength());
  oled.setCursor(0, 38);
  oled.print(F("pub  ")); oled.println(published);
  oled.setCursor(0, 48);
  oled.print(F("recon ")); oled.print(reconnects);
  oled.print(F("  fail ")); oled.println(failures);
  oled.setCursor(0, 58);
  oled.print(F("up   ")); oled.print(millis() / 60000UL); oled.print(F(" min"));

  oled.display();
}`,
  after: `<p>The exponential backoff is the part to copy into anything that talks to a network over a metered
  link. A naive retry loop at five-second intervals through a two-hour tower outage makes 1,440 connection
  attempts; at 4&nbsp;KB of handshake each that is nearly 6&nbsp;MB - more than a year's normal traffic, spent
  entirely on failure.</p>
  <p><strong>Holding the connection open</strong> rather than connecting per message is the other big saving.
  The MQTT session stays up between publishes and costs only a keepalive; reconnecting each time would
  multiply the data by twenty.</p>
  <p>The reconnect and failure counters on the display are the diagnostics that matter. Readings tell you
  about the world; those two tell you about the device.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>. The sketch echoes
every AT exchange, which is exactly what you want while it is new.</p>
<div class="note warn"><span class="t">First attach takes 30-60 seconds. Let it.</span>
<p>A cold LTE attach - scanning bands, finding a cell, authenticating the SIM, activating the PDP context -
genuinely takes up to a minute, and longer on a weak signal. The sketch waits deliberately.</p>
<p>Judging it after ten seconds will tell you nothing except that LTE is not instant.</p></div>
<div class="note danger"><span class="t">The APN is the thing that will block you</span>
<p>Wrong APN: registers fine, excellent signal, <code>AT+CGACT</code> fails, no data ever. It looks like
broken hardware and it is one string.</p>
<p>Get it from your SIM provider. <code>iot.1nce.net</code> for 1NCE, <code>hologram</code> for Hologram,
<code>soracom.io</code> for Soracom, and whatever your mobile operator documents for a consumer SIM.</p></div>`,

tune: [
  { h: 'Reporting interval against data cost',
    body: `<p>Roughly 220 bytes per publish. Ten minutes is 11&nbsp;MB a year; one minute is 115&nbsp;MB;
    ten seconds is 700&nbsp;MB.</p>
    <p>A 1NCE SIM is 500&nbsp;MB for ten years, so ten-minute reporting uses about a quarter of a decade-long
    allowance in a year. Pick the interval from the tariff, not from what feels responsive.</p>` },
  { h: 'Report by exception',
    body: `<p>The largest saving available. Publish only when a reading has changed by more than a threshold,
    plus a heartbeat every hour so silence still means something.</p>
    <p>A temperature sensor indoors might genuinely need ten messages a day rather than a hundred and
    forty.</p>` },
  { h: 'TLS, and what it costs',
    body: `<p>Port 8883 with <code>AT+CMQTTSSLCFG</code> and a CA certificate. Do it for anything that
    matters - an unencrypted broker on the public internet is readable and writable by anyone.</p>
    <p>Budget for it: the handshake is 4-6&nbsp;KB per connection. With a stable link that is a few times a
    day and irrelevant; with a flaky one it is the dominant cost, which is another reason the backoff
    matters.</p>` },
  { h: 'Subscribe as well as publish',
    body: `<p><code>AT+CMQTTSUB</code> lets the device take commands - change the interval, request an
    immediate reading, reboot. For a device you cannot reach without a ladder this is worth the effort.</p>
    <p>Keep the command set small and make every command idempotent. A device that receives a duplicate
    command after a reconnect should do the same thing twice harmlessly.</p>` },
  { h: 'Lock the bands to speed up attach',
    body: `<p><code>AT+CNBP</code> or <code>AT+CBANDCFG</code> restricts which LTE bands the module scans. If
    you know your operator uses band 20 and 3, telling the modem that cuts cold attach from a minute to a few
    seconds.</p>
    <p>Only do this for a fixed installation. A device that moves needs the full scan.</p>` },
  { h: 'Running it on solar',
    body: `<p>A Cat-1 modem attached and idle is 20-50&nbsp;mA, with peaks to 2&nbsp;A. That is roughly a watt
    - far more than a LoRa node and far less than a Pi.</p>
    <p>Practical approach: detach between reports. <code>AT+CFUN=0</code> puts the radio to sleep, and the
    ESP32 deep sleeps alongside it. Attach costs a few seconds and a burst of current, so this is worth it
    for intervals of fifteen minutes or more and not below.</p>` },
  { h: 'Watch for the roaming trap',
    body: `<p>An IoT SIM that roams will attach to whichever operator is strongest - which near a border can
    be one in another country at a much higher rate. <code>AT+COPS=1,2,"23410"</code> forces a specific
    operator by numeric code.</p>
    <p>Check <code>AT+COPS?</code> after installation to see who you actually attached to.</p>` }
],

trouble: [
  { q: 'The modem never responds to <code>AT</code>',
    a: `PWRKEY. These modules do not start on power alone - pulse PWRKEY low for about a second. Check the
    STATUS pin goes HIGH. If it does and AT still fails, check TX/RX are not swapped and that the baud rate is
    115200.` },
  { q: '<code>AT+CPIN?</code> does not return READY',
    a: `The SIM has a PIN set, or is not seated, or is in backwards. Put it in a phone, disable the PIN,
    confirm it works, and look carefully at the holder's orientation diagram.` },
  { q: 'Registered with good signal, but <code>AT+CGACT</code> fails',
    a: `The APN. This is the single most common failure in cellular projects and it looks exactly like broken
    hardware. Get the correct APN from your SIM provider and set it with <code>AT+CGDCONT</code>. A consumer
    SIM's APN is whatever your phone uses.` },
  { q: 'It attaches, then drops every few minutes',
    a: `Usually power. Attach and handover pull the most current, and a marginal supply survives idle and
    fails under load. Check the capacitors are at the module and the supply is genuinely rated for 2&nbsp;A.
    Second candidate: only one antenna fitted, so the link is marginal.` },
  { q: 'MQTT connect fails but the PDP context is up',
    a: `Broker address format, or the broker refusing you. The A7670 wants a full URL with scheme:
    <code>tcp://host:1883</code>, not a bare hostname. Test the same broker from your laptop with
    <code>mosquitto_pub</code> to rule it out.` },
  { q: 'Data usage is far higher than expected',
    a: `Reconnections, almost certainly. Check the reconnect counter on the display. A TLS handshake is
    several kilobytes and a device retrying tightly through an outage can spend a year's allowance in days -
    which is what the exponential backoff prevents.` },
  { q: 'Works at home, no service at the installation site',
    a: `Coverage. Check <code>AT+CSQ</code> from the actual location. Below about 10 is unreliable. Options:
    a better antenna, more height, or a directional antenna pointed at the mast. <code>AT+COPS=?</code> lists
    every operator visible, which tells you whether anyone serves that spot.` },
  { q: 'Wrong LTE bands - it will not attach anywhere',
    a: `You have the wrong regional variant. A7670E is Europe, A7670SA South America, A7670G global. The
    modules look identical and the bands are not. Check <code>ATI</code> for the exact model.` },
  { q: 'The module gets very hot',
    a: `Normal under load for Cat-4; less so for Cat-1. Sustained transmission at the edge of a cell means
    maximum transmit power. Make sure there is airflow, and check it is not running at full power because the
    antenna is missing or badly placed.` }
],

next: `
<ul>
  <li><strong>Years on a battery instead of weeks</strong> - the
  <a href="project.html?p=nbiot-field-sensor">NB-IoT field sensor</a> uses PSM and eDRX to sleep at microamps
  between reports, which Cat-1 cannot do.</li>
  <li><strong>Learn AT commands cheaply first</strong> - the
  <a href="project.html?p=gsm-sms-alarm">SMS alarm</a> is $15 and teaches the same interface.</li>
  <li><strong>Send pictures, not numbers</strong> - the
  <a href="project.html?p=lte-camera-uploader">LTE camera uploader</a>.</li>
  <li><strong>Skip the operator entirely</strong> - the
  <a href="project.html?p=lora-remote-sensor">LoRa sensor</a> costs nothing to run and needs your own base
  station. Building both is the clearest way to understand which problem each one solves.</li>
  <li><strong>Control something remotely</strong> - the
  <a href="project.html?p=lte-remote-switch">LTE remote switch</a> takes commands rather than sending
  readings.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Power and antennas</span>
<ul>
  <li><strong>Check your breakout's input range before connecting anything.</strong> Some regulate and take
  5&nbsp;V; some are bare and want 3.4-4.2&nbsp;V. Five volts onto a bare module destroys it.</li>
  <li><strong>Never power a transmitter without antennas.</strong> Fit both before the first power-up.</li>
  <li><strong>Undersized supplies cause the hardest faults to diagnose</strong> - a device that attaches and
  then resets under load looks like software and is not.</li>
</ul>
</div>
<div class="note warn"><span class="t">It is on the internet, and it costs money</span>
<ul>
  <li><strong>An unencrypted broker is public.</strong> Anyone can read your data and publish to your topics.
  Use TLS and credentials for anything beyond a test.</li>
  <li><strong>Set a data cap at the SIM provider</strong> if they offer one. A software bug that publishes in
  a tight loop is a real possibility and a metered SIM will happily bill for it.</li>
  <li><strong>Check where it roamed to.</strong> Near a border a roaming IoT SIM can attach to a foreign
  operator at a much higher rate. <code>AT+COPS?</code> after installation.</li>
  <li><strong>This is not a monitored system.</strong> It reports when it has power, signal, credit and a
  working broker. Set an alert for silence, and do not let it be the only thing watching something that
  matters.</li>
</ul>
</div>`
});
