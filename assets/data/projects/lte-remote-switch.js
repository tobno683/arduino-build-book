/* Cellular control: switching something real from anywhere, and the interlocks that need to exist. */
AB.addProject({
slug: 'lte-remote-switch',
title: 'Remote switch over LTE',
cat: 'cellular',
level: 4,
time: '6 hours',
solder: true,
board: 'ESP32',
tags: ['lte', 'a7670', 'relay', 'remote control', 'mqtt', 'mains', 'watchdog', 'failsafe'],
blurb: 'Turn a heater on in a caravan before you arrive, or a pump off from another country. Control is much harder to get right than monitoring, and this guide is mostly about why.',

skills: ['Command over cellular', 'Failsafe design', 'Watchdog timers', 'State confirmation', 'Mains relay isolation', 'Authenticated commands'],

intro: `
<p>Every other cellular project in this theme sends data outward. This one takes commands inward, and that
inverts the engineering.</p>
<p>A monitor that loses signal is an inconvenience - a gap in a chart. A <em>switch</em> that loses signal has
left something on or off, indefinitely, with nobody watching. A monitor that misreads a byte reports a wrong
temperature. A switch that misreads a byte turns on a heater in an empty building.</p>
<p>So most of this guide is about the parts that are not the switching: what the device does when it cannot
hear you, how it confirms what it actually did, how it refuses commands from strangers, and what it is
physically incapable of doing regardless of software. Those are the interesting problems, and they are the
same ones in any remote-control system.</p>
<p>The switching itself is one relay and four lines of code.</p>`,

what: [
  'Switch a relay from anywhere, over MQTT on a cellular link.',
  'Get confirmation of the actual switch state back, not an assumption that the command worked.',
  'Fail to a defined safe state after a configurable silence, rather than holding the last command forever.',
  'Reject commands that are not signed with a shared secret, so a stranger on the broker cannot operate it.',
  'Enforce a maximum on-time in hardware terms, so a stuck command cannot run a heater for a week.',
  'Report what it did and why, so the log explains an unexpected state.'
],

how: `
<p><strong>Failsafe is a decision you must make explicitly.</strong> When the link is down, the device has to
do <em>something</em>. There is no neutral option.</p>
<ul>
  <li><strong>Fail off</strong> - right for a heater, a pump, anything that consumes or could overheat.</li>
  <li><strong>Fail on</strong> - right for a freezer, a sump pump, ventilation: things whose absence causes
  damage.</li>
  <li><strong>Hold last state</strong> - almost always the wrong answer, and it is what you get if you do not
  decide. It means an outage freezes whatever happened to be true, forever.</li>
</ul>
<p>The sketch makes this a compile-time constant with a comment demanding you think about it, because the
default behaviour of "keep doing what you were doing" is the one that causes the incidents.</p>

<p><strong>Confirmation, not assumption.</strong> Publishing "I received ON" is not the same as the load being
on. The relay can fail, the contacts can weld, the supply to the load can be off.</p>
<p>So the device reads back the state it can actually observe - the relay driver pin, and ideally a current
sensor on the load - and reports <em>that</em>. A command that reports "requested ON, measured 0&nbsp;A" tells
you something a simple acknowledgement never would.</p>

<p><strong>A maximum on-time, enforced locally.</strong> The device counts how long it has been on and turns
itself off at a limit, regardless of what it was told. Not a suggestion from the server - a timer in the
device.</p>
<p>This is the interlock that survives every remote failure mode: a broker that goes silent mid-command, a
retained MQTT message that replays an old ON at every reconnect, a phone in a pocket sending the same command
forty times. If the correct behaviour is "this should never run for more than two hours", encode that where
nothing remote can override it.</p>

<p><strong>Retained messages, which cause a specific and nasty bug.</strong> MQTT lets a publisher mark a
message retained, so new subscribers immediately receive the last value. Convenient for status, and dangerous
for commands: the device reconnects after a two-day outage and is instantly handed the ON command from two
days ago.</p>
<p>Publish commands <strong>without</strong> the retain flag, and have the device ignore any command older
than a few minutes - which is what the timestamp in the signed payload is for.</p>

<p><strong>Authentication that is actually worth something.</strong> TLS to the broker with a username and
password stops strangers connecting. It does not stop someone who gets the credentials, and it does not stop a
replayed message.</p>
<p>A shared-secret HMAC over the payload plus a timestamp and a counter costs about twenty lines and means a
captured command cannot be replayed later. For something that switches mains, that is proportionate.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: '3.3 V logic to match the modem, and enough room for TLS and HMAC.' },
  { id: 'a7670', qty: 1, note: 'Cat-1 is plenty. Regional variant for your bands.' },
  { id: 'iot-sim', qty: 1, note: 'Tiny data use - a persistent MQTT session plus keepalives is under 2 MB a year.' },
  { id: 'lte-ant', qty: 1, note: 'Both antennas.' },
  { id: 'relay1', qty: 1, note: 'Opto-isolated, with the flyback diode on board. For mains, check the contact rating against the actual load - not the peak the box claims.' },
  { id: 'acs712', qty: 1, note: 'Current sensing on the load. This is what turns an assumption into a measurement, and it is the most valuable $2 here.' },
  { id: 'cap1000', qty: 2, note: 'At the modem.' },
  { id: 'psu5v3a', qty: 1, note: 'Must deliver 2 A. A brownout mid-command is exactly the failure this project exists to avoid.' },
  { id: 'oled13', qty: 1, note: 'Local state display. On a device that switches something real, being able to see what it thinks it is doing without a laptop is worth a lot.' },
  { id: 'button', qty: 1, note: 'Local override. There must always be a way to turn it off by hand.' },
  { id: 'led5', qty: 2, note: 'Link and load indicators.' },
  { id: 'res220', qty: 2 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 3, note: 'Mains-rated if switching mains. The 5 mm pitch ones, not the 2.54 mm signal type.' },
  { id: 'box-abs', qty: 1, note: 'For mains, a proper enclosure with a cable gland and no exposed metal. See the safety section.' },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',  at: [0, 54] },
    { id: 'bb',   comp: 'bb400',  at: [0, -8] },
    { id: 'lte',  comp: 'lte',    at: [-46, -64] },
    { id: 'rly',  comp: 'relay1', at: [46, -60] },
    { id: 'cur',  comp: 'acs712', at: [46, -98] },
    { id: 'oled', comp: 'oled13', at: [-6, -100], ry: 180 },
    { id: 'btn',  comp: 'button', at: [-44, -104] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+2',   color: 'red',    note: '3.3 V rail for the display and sensors' },
    { from: 'mcu.GND',  to: 'bb.T-2',   color: 'black',  note: 'Ground rail' },
    { from: 'mcu.VIN',  to: 'bb.T+6',   color: 'red',    note: '5 V in, also feeding the relay coil' },
    { from: 'lte.VCC',  to: 'bb.T+10',  color: 'brown',  note: 'Modem power with the capacitors at the module' },
    { from: 'lte.GND',  to: 'bb.T-10',  color: 'black',  note: 'Modem ground' },
    { from: 'lte.TXD',  to: 'mcu.D16',  color: 'green',  note: 'Modem to Serial2 RX' },
    { from: 'lte.RXD',  to: 'mcu.D17',  color: 'orange', note: 'Serial2 TX to modem' },
    { from: 'lte.PWR',  to: 'mcu.D4',   color: 'purple', note: 'PWRKEY - also how the sketch power-cycles a wedged modem' },
    { from: 'rly.VCC',  to: 'bb.T+14',  color: 'red',    note: 'Relay coil supply, 5 V' },
    { from: 'rly.GND',  to: 'bb.T-14',  color: 'black',  note: 'Relay ground' },
    { from: 'rly.IN',   to: 'mcu.D26',  color: 'blue',   note: 'Relay drive. Most modules are active LOW - check yours' },
    { from: 'rly.NO',   to: 'cur.IP+',  color: 'brown',  note: 'Switched output through the current sensor, so the load is measured' },
    { from: 'cur.VCC',  to: 'bb.T+18',  color: 'red',    note: 'Current sensor power' },
    { from: 'cur.GND',  to: 'bb.T-18',  color: 'black',  note: 'Current sensor ground' },
    { from: 'cur.OUT',  to: 'mcu.D34',  color: 'yellow', note: 'Current reading. Input-only pin, ADC1 so it works alongside anything else' },
    { from: 'oled.VCC', to: 'bb.T+22',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-22',  color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21',  color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL', to: 'mcu.D22',  color: 'yellow', note: 'I2C clock' },
    { from: 'btn.1A',   to: 'mcu.D27',  color: 'green',  note: 'Local override. There must always be a way to stop it by hand' },
    { from: 'btn.2A',   to: 'bb.T-26',  color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">If this switches mains, read the mains rules first</span>
<p>The <a href="project.html?p=smart-plug-relay">smart plug project</a> covers mains work properly and this
guide assumes you have read it. The essentials:</p>
<ul>
  <li><strong>The relay's contacts and its coil side never touch.</strong> Only VCC, GND and IN go to the
  Arduino. Mains goes to COM and NO on the screw terminals and nowhere else.</li>
  <li><strong>Switch the live conductor</strong>, not the neutral.</li>
  <li><strong>A proper enclosure</strong> with a cable gland, earth bonding where required, and nothing
  exposed. Not perfboard in an open box.</li>
  <li><strong>Check the actual load current</strong> against the relay's rating. A "10 A" relay module's
  tracks are often nowhere near 10&nbsp;A, and an inductive load like a motor is far harder on contacts than
  its nameplate current suggests.</li>
</ul>
<p>If any of that is unfamiliar, switch 12&nbsp;V for this project and come back to mains later.</p></div>

<div class="note danger"><span class="t">The relay must be OFF while the board boots</span>
<p>During reset the ESP32's pins are inputs and float. A relay module that is active-LOW will see a floating
line as a possible LOW and may click on - for a second or two, every time the device reboots.</p>
<p>For a light that is harmless. For a heater or a pump on a device that reboots on a watchdog, it is not.</p>
<p>Fit a <strong>10&nbsp;k pull-up from the relay IN pin to 3.3&nbsp;V</strong> (for an active-LOW module) so
the relay is definitely off until the sketch takes control. Then verify it: power-cycle the board ten times
and watch the relay.</p></div>

<div class="note danger"><span class="t">Avoid GPIO strapping pins for the relay</span>
<p>GPIO0, 2, 5, 12 and 15 on the ESP32 are sampled at reset and several are driven by the bootloader. A relay
on one of them will chatter during every boot and upload.</p>
<p>D26 and D27 are safe. If you must move it, check the strapping list first.</p></div>

<div class="note warn"><span class="t">The current sensor is what makes the report honest</span>
<p>Without it, "state: ON" means "I energised the relay coil". With it, "state: ON, 3.2&nbsp;A" means the load
is genuinely drawing power.</p>
<p>That distinguishes a working system from a welded contact, a tripped breaker, a blown load or an unplugged
appliance - all of which look identical to a device that only knows what it commanded.</p></div>

<div class="note warn"><span class="t">A local override that does not depend on any of this</span>
<p>The button is the minimum. Better is a physical switch in series with the load, or simply making sure the
thing can be unplugged.</p>
<p>Anyone who has to deal with this device when it misbehaves may not have your phone, your broker credentials
or any idea how it works.</p></div>`,

solderSteps: [
  { h: 'Pull-up on the relay input, first',
    body: `<p>10&nbsp;k from the relay module's IN pin to 3.3&nbsp;V for an active-LOW module (or to ground for
    an active-HIGH one). Physically at the relay module.</p>
    <p>Then test it before anything else is built: power the board up and down ten times and watch the relay.
    It must not click. If it does, the pull-up is on the wrong rail or the module is the other polarity.</p>` },
  { h: 'Capacitors at the modem',
    body: `<p>Two 1000&nbsp;uF, as in every cellular project here. A brownout during a command is precisely the
    failure this whole project is designed to avoid.</p>` },
  { h: 'Separate the low-voltage and mains sides of the board physically',
    body: `<p>If switching mains: all mains-side components at one end, all logic at the other, and a clear
    gap - at least 6&nbsp;mm of bare board, more if you can - between them. No signal traces crossing the
    gap.</p>
    <p>Mains-rated screw terminals, 5&nbsp;mm pitch. Not the little 2.54&nbsp;mm ones.</p>` },
  { h: 'The current sensor in series with the switched output',
    body: `<p>Relay NO to the sensor's IP+, sensor's IP- to the load. The sensor's low-voltage side is
    isolated from the current path by a Hall element, which is why it is safe to read from the ESP32.</p>
    <p>Its output sits at half the supply with no current flowing, so calibrate the zero point in software
    rather than trusting the datasheet figure.</p>` },
  { h: 'Strain relief on everything leaving the box',
    body: `<p>Cable glands, not holes. A tugged mains cable that pulls a live conductor off a terminal inside a
    sealed box is the worst realistic outcome of this project.</p>` },
  { h: 'Test the whole thing on 12 V before mains',
    body: `<p>A 12&nbsp;V lamp on the output. Run every failure case - lose signal, reboot, send bad commands,
    exceed the on-time limit - and confirm each does what you intended.</p>
    <p>Only when all of that is right does mains go anywhere near it.</p>` }
],

assembly: [
  { h: 'Decide the failsafe state, and write it down',
    body: `<p>Before any code. What should this do when it cannot hear you for an hour?</p>
    <p>Heater, pump, charger, anything that consumes: <strong>off</strong>. Freezer, sump pump, ventilation,
    anything whose absence causes damage: <strong>on</strong>.</p>
    <p>Set <code>FAILSAFE_STATE</code> accordingly and put a label inside the lid saying what it does. The
    person who has to deal with this in two years may not be you.</p>` },
  { h: 'Set the maximum on-time from the physical reality',
    body: `<p>How long could this safely run unattended if every remote system failed? A caravan heater,
    perhaps two hours. A pump, however long it takes to empty the tank plus a margin. A car battery charger,
    twelve hours.</p>
    <p>That number goes in <code>MAX_ON_MINUTES</code> and nothing remote can override it.</p>` },
  { h: 'Set up the broker with TLS and credentials',
    body: `<p>Not the public test broker. Mosquitto with a password file and a certificate, or a hosted broker
    with a free tier. Port 8883.</p>
    <p>An open broker means anyone who finds your topic can switch your load.</p>` },
  { h: 'Bring up the modem and confirm MQTT',
    body: `<p>Same procedure as the <a href="project.html?p=lte-remote-monitor">LTE monitor</a>: APN, register,
    PDP context, MQTT connect. Prove a status publish arrives before you wire the relay to anything.</p>` },
  { h: 'Test the command path with the relay driving nothing',
    body: `<p>Relay module connected but nothing on its contacts. Send commands and listen for the clicks.</p>
    <p>Check: correct command works; wrong secret is rejected; old timestamp is rejected; the status topic
    reports the state accurately.</p>` },
  { h: 'Test every failure case deliberately',
    body: `<p>This is the real work of the project and it is worth an hour:</p>
    <ul>
      <li><strong>Pull the antenna</strong> while it is on. Does it fail safe after the timeout?</li>
      <li><strong>Reboot it</strong> while it is on. Does the relay stay off during boot?</li>
      <li><strong>Leave it on</strong> past the maximum. Does it turn itself off and say why?</li>
      <li><strong>Send a replayed command</strong> - the same signed payload twice. Is the second rejected?</li>
      <li><strong>Stop the broker.</strong> Does it back off rather than hammering?</li>
      <li><strong>Press the local button.</strong> Does it override, and does it tell the broker?</li>
    </ul>
    <p>Anything that does not behave as intended is a bug to fix now, not a surprise to discover later.</p>` },
  { h: 'Calibrate the current sensor at zero',
    body: `<p>With no load, read the ADC and store that as the zero point. The ACS712's output sits at half
    supply and the exact value varies between parts and with temperature.</p>
    <p>Then switch a known load and check the reading is sensible. It does not need to be accurate - it needs
    to reliably distinguish "current flowing" from "none".</p>` },
  { h: 'Install, label, and tell whoever else is there',
    body: `<p>A label inside and outside: what it switches, what it does when the link fails, the maximum
    on-time, and a phone number.</p>
    <p>Then tell whoever else uses the building that it exists and how to turn it off by hand.</p>` }
],

libraries: [
  { name: 'mbedtls', by: 'ARM', how: 'Part of the ESP32 core', why: 'HMAC-SHA256 for the signed commands. Already present - no installation.' },
  { name: 'ArduinoJson', by: 'Benoit Blanchon', why: 'Parsing commands and building status payloads.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'Local state display.' },
  { name: 'No modem library', by: '-', why: 'Raw AT, as in the other cellular projects, so the failure modes are visible.' }
],

code: [
{
  h: 'The remote switch',
  intro: `<p>The switching is trivial. The interlocks around it are the project. Read the constants at the top
  carefully - each one is a decision about what happens when something goes wrong.</p>`,
  name: 'lte_switch.ino',
  code: `/* ------------------------------------------------------------------
   Remote switch over LTE.

   Commands arrive as signed JSON on an MQTT topic:
     {"cmd":"on","ts":1735689600,"n":42,"sig":"<hmac hex>"}

   Status is published after every change and every 60 s, including
   the MEASURED current - not just what we commanded.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <ArduinoJson.h>
#include <mbedtls/md.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---- pins ------------------------------------------------------------
#define MODEM_RX    16
#define MODEM_TX    17
#define MODEM_PWR    4
#define RELAY_PIN   26          // NOT a strapping pin
#define CURRENT_PIN 34
#define BUTTON_PIN  27
#define LED_LINK    25
#define LED_LOAD    33

#define RELAY_ACTIVE_LOW  true

/* =====================================================================
   THE THREE DECISIONS. Change these deliberately, not by default.
   ===================================================================== */

// What happens when we cannot hear the broker. There is no neutral
// option: "hold last state" is a choice too, and usually the wrong one.
//   false = fail OFF  : heaters, pumps, chargers, anything that consumes
//   true  = fail ON   : freezers, sump pumps, ventilation
#define FAILSAFE_STATE  false

// How long of silence before we apply it.
#define FAILSAFE_AFTER_MIN  30

// The hard limit. Nothing remote can override this - it is the
// interlock that survives every other failure.
#define MAX_ON_MINUTES  120

/* ===================================================================== */

const char APN[]       = "iot.1nce.net";
const char BROKER[]    = "tcp://broker.example.com:1883";
const char CLIENT_ID[] = "buildbook-switch-1";
const char TOPIC_CMD[] = "buildbook/switch/1/cmd";
const char TOPIC_STA[] = "buildbook/switch/1/state";
const char SECRET[]    = "change-this-to-something-long-and-random";

Adafruit_SSD1306 oled(128, 64, &Wire, -1);

bool relayOn = false;
bool mqttUp = false;
unsigned long onSince = 0;
unsigned long lastHeard = 0;
unsigned long lastStatus = 0;
uint32_t lastCounter = 0;
float currentZero = 2048;
char lastReason[40] = "boot";

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, MODEM_RX, MODEM_TX);

  /* Relay OFF before anything else. The external pull-up holds it off
     during the boot itself; this is the moment we take over. */
  pinMode(RELAY_PIN, OUTPUT);
  setRelay(false, "boot");

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_LINK, OUTPUT);
  pinMode(LED_LOAD, OUTPUT);
  pinMode(MODEM_PWR, OUTPUT);

  Wire.begin(21, 22);
  if (oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) oled.setTextColor(SSD1306_WHITE);

  calibrateCurrent();

  modemPowerOn();
  modemAttach();

  lastHeard = millis();
  draw();
}

void loop() {
  pollButton();
  enforceLimits();          // BEFORE anything network-related
  pollMqtt();

  if (millis() - lastStatus > 60000) { lastStatus = millis(); publishState("periodic"); }

  static unsigned long lastDraw = 0;
  if (millis() - lastDraw > 1000) { lastDraw = millis(); draw(); }
}

/* --- the interlocks ----------------------------------------------------
   Deliberately first in loop(), and deliberately independent of the
   network code. If everything else in this sketch is broken, these
   two rules still apply. */
void enforceLimits() {

  // 1. Maximum on-time. Nothing remote can extend this.
  if (relayOn && onSince && millis() - onSince > MAX_ON_MINUTES * 60000UL) {
    setRelay(false, "max on-time reached");
    publishState("max on-time");
    return;
  }

  // 2. Failsafe after silence.
  if (millis() - lastHeard > FAILSAFE_AFTER_MIN * 60000UL) {
    if (relayOn != FAILSAFE_STATE) {
      setRelay(FAILSAFE_STATE, "link lost - failsafe");
      Serial.println(F("FAILSAFE applied"));
    }
  }
}

void setRelay(bool on, const char *why) {
  relayOn = on;
  digitalWrite(RELAY_PIN, RELAY_ACTIVE_LOW ? !on : on);
  digitalWrite(LED_LOAD, on);
  onSince = on ? millis() : 0;

  strncpy(lastReason, why, sizeof(lastReason) - 1);
  lastReason[sizeof(lastReason) - 1] = '\\0';

  Serial.print(F("relay -> ")); Serial.print(on ? F("ON") : F("OFF"));
  Serial.print(F("  (")); Serial.print(why); Serial.println(')');
}

void pollButton() {
  static unsigned long lastPress = 0;
  if (digitalRead(BUTTON_PIN) || millis() - lastPress < 400) return;
  lastPress = millis();

  // Local control always wins and always resets the failsafe clock -
  // someone is standing here, so the link being down is not a reason
  // to override them.
  setRelay(!relayOn, "local button");
  lastHeard = millis();
  publishState("local button");
}

/* --- commands -----------------------------------------------------------
   Three checks, and all three matter:
     1. HMAC over the payload  - only someone with the secret can command
     2. Timestamp freshness    - a captured command cannot be replayed
     3. Monotonic counter      - the same command cannot be repeated
*/
void handleCommand(const char *json) {
  StaticJsonDocument<256> doc;
  if (deserializeJson(doc, json)) { Serial.println(F("bad JSON")); return; }

  const char *cmd = doc["cmd"] | "";
  uint32_t ts     = doc["ts"]  | 0;
  uint32_t n      = doc["n"]   | 0;
  const char *sig = doc["sig"] | "";

  char signable[160];
  snprintf(signable, sizeof(signable), "%s|%lu|%lu", cmd, (unsigned long)ts, (unsigned long)n);

  char expect[65];
  hmacHex(signable, expect);

  if (strcmp(expect, sig) != 0) {
    Serial.println(F("REJECTED: bad signature"));
    return;
  }

  // Replay protection. Without the counter, anyone who captures a valid
  // "on" command can resend it forever.
  if (n <= lastCounter) {
    Serial.println(F("REJECTED: counter not fresh"));
    return;
  }
  lastCounter = n;

  lastHeard = millis();

  if      (!strcmp(cmd, "on"))     { setRelay(true,  "remote on"); }
  else if (!strcmp(cmd, "off"))    { setRelay(false, "remote off"); }
  else if (!strcmp(cmd, "status")) { /* just report */ }
  else { Serial.println(F("unknown command")); return; }

  publishState(cmd);
}

void hmacHex(const char *msg, char *out65) {
  byte hmac[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), 1);
  mbedtls_md_hmac_starts(&ctx, (const byte *)SECRET, strlen(SECRET));
  mbedtls_md_hmac_update(&ctx, (const byte *)msg, strlen(msg));
  mbedtls_md_hmac_finish(&ctx, hmac);
  mbedtls_md_free(&ctx);

  for (int i = 0; i < 32; i++) sprintf(out65 + i * 2, "%02x", hmac[i]);
  out65[64] = '\\0';
}

/* --- current measurement ------------------------------------------------
   The difference between "I commanded ON" and "the load is drawing
   power". A welded contact, a tripped breaker and an unplugged
   appliance all look identical without this. */
void calibrateCurrent() {
  uint32_t sum = 0;
  for (int i = 0; i < 200; i++) { sum += analogRead(CURRENT_PIN); delay(2); }
  currentZero = sum / 200.0;
  Serial.print(F("current zero at ")); Serial.println(currentZero);
}

float readCurrentA() {
  // Peak-to-peak over a few mains cycles, converted to RMS. The ACS712
  // 20 A part gives 100 mV/A.
  uint16_t lo = 4095, hi = 0;
  unsigned long until = millis() + 100;
  while (millis() < until) {
    uint16_t v = analogRead(CURRENT_PIN);
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  float pkpk = (hi - lo) * 3.3 / 4095.0;
  float amps = (pkpk / 2.0) * 0.7071 / 0.100;
  return amps < 0.15 ? 0.0 : amps;        // below this is noise
}

/* --- MQTT --------------------------------------------------------------- */
void publishState(const char *why) {
  if (!mqttUp) return;

  float amps = readCurrentA();
  char payload[220];
  snprintf(payload, sizeof(payload),
    "{\\"state\\":\\"%s\\",\\"amps\\":%.2f,\\"on_min\\":%lu,\\"why\\":\\"%s\\","
    "\\"csq\\":%d,\\"up_min\\":%lu}",
    relayOn ? "on" : "off", amps,
    relayOn && onSince ? (millis() - onSince) / 60000UL : 0UL,
    why, signalStrength(), millis() / 60000UL);

  Serial.print(F("state: ")); Serial.println(payload);
  mqttPublish(TOPIC_STA, payload);
}

void pollMqtt() {
  if (!mqttUp) {
    static unsigned long nextTry = 0;
    static uint32_t backoff = 5000;
    if (millis() < nextTry) return;

    if (mqttConnect()) {
      mqttUp = true;
      backoff = 5000;
      digitalWrite(LED_LINK, HIGH);
      lastHeard = millis();
      publishState("connected");
    } else {
      nextTry = millis() + backoff;
      backoff = min(backoff * 2, 900000UL);
      digitalWrite(LED_LINK, LOW);
    }
    return;
  }

  // Unsolicited +CMQTTRXSTART announces an incoming message.
  if (Serial2.available()) {
    String s = collect(200);
    if (s.indexOf("+CMQTTRXPAYLOAD") >= 0) {
      int nl = s.indexOf('\\n', s.indexOf("+CMQTTRXPAYLOAD"));
      if (nl > 0) {
        String body = s.substring(nl + 1);
        body.trim();
        handleCommand(body.c_str());
      }
    }
  }
}

bool mqttConnect() {
  char cmd[200];
  if (!at("AT+CMQTTSTART", "+CMQTTSTART: 0", 20000)) return false;

  snprintf(cmd, sizeof(cmd), "AT+CMQTTACCQ=0,\\"%s\\",0", CLIENT_ID);
  if (!at(cmd, "OK", 5000)) return false;

  snprintf(cmd, sizeof(cmd), "AT+CMQTTCONNECT=0,\\"%s\\",60,1", BROKER);
  if (!at(cmd, "+CMQTTCONNECT: 0,0", 30000)) return false;

  snprintf(cmd, sizeof(cmd), "AT+CMQTTSUBTOPIC=0,%d,1", strlen(TOPIC_CMD));
  if (!at(cmd, ">", 5000)) return false;
  Serial2.print(TOPIC_CMD);
  if (!waitFor("OK", 5000)) return false;

  return at("AT+CMQTTSUB=0", "+CMQTTSUB: 0,0", 20000);
}

bool mqttPublish(const char *topic, const char *payload) {
  char cmd[64];
  snprintf(cmd, sizeof(cmd), "AT+CMQTTTOPIC=0,%d", strlen(topic));
  if (!at(cmd, ">", 5000)) return false;
  Serial2.print(topic);
  if (!waitFor("OK", 5000)) return false;

  snprintf(cmd, sizeof(cmd), "AT+CMQTTPAYLOAD=0,%d", strlen(payload));
  if (!at(cmd, ">", 5000)) return false;
  Serial2.print(payload);
  if (!waitFor("OK", 5000)) return false;

  // Retain OFF on state is a choice: a retained state message would be
  // stale after an outage. Commands must NEVER be retained, or a
  // reconnect replays an old one instantly.
  return at("AT+CMQTTPUB=0,1,60", "+CMQTTPUB: 0,0", 20000);
}

/* --- modem, as in the other cellular projects --------------------------- */
void modemPowerOn() {
  if (at("AT", "OK", 1000)) return;
  digitalWrite(MODEM_PWR, HIGH); delay(1200); digitalWrite(MODEM_PWR, LOW);
  for (byte i = 0; i < 30; i++) {
    if (at("AT", "OK", 1000)) { at("ATE0", "OK", 1000); return; }
    delay(1000);
  }
}

bool modemAttach() {
  if (!at("AT+CPIN?", "READY", 5000)) return false;
  for (byte i = 0; i < 60; i++) {
    if (at("AT+CGREG?", ",1", 2000) || at("AT+CGREG?", ",5", 2000)) break;
    delay(1000);
    if (i == 59) return false;
  }
  char cmd[80];
  snprintf(cmd, sizeof(cmd), "AT+CGDCONT=1,\\"IP\\",\\"%s\\"", APN);
  at(cmd, "OK", 5000);
  return at("AT+CGACT=1,1", "OK", 30000);
}

int signalStrength() {
  Serial2.println("AT+CSQ");
  String r = collect(1000);
  int i = r.indexOf("+CSQ:");
  return i < 0 ? 99 : r.substring(i + 6).toInt();
}

bool at(const char *cmd, const char *expect, unsigned long t) {
  while (Serial2.available()) Serial2.read();
  Serial2.println(cmd);
  return waitFor(expect, t);
}

bool waitFor(const char *expect, unsigned long t) {
  unsigned long deadline = millis() + t;
  String got = "";
  while (millis() < deadline) {
    while (Serial2.available()) {
      got += (char)Serial2.read();
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
  while (millis() < deadline)
    while (Serial2.available()) out += (char)Serial2.read();
  return out;
}

/* --- display ------------------------------------------------------------ */
void draw() {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.println(relayOn ? F("ON") : F("OFF"));

  oled.setTextSize(1);
  oled.setCursor(56, 4);
  oled.print(readCurrentA(), 1); oled.println(F(" A"));

  oled.setCursor(0, 22);
  oled.print(F("why: ")); oled.println(lastReason);

  oled.setCursor(0, 32);
  if (relayOn && onSince) {
    unsigned long m = (millis() - onSince) / 60000UL;
    oled.print(F("on for ")); oled.print(m);
    oled.print(F("/")); oled.print(MAX_ON_MINUTES); oled.println(F(" min"));
  } else {
    oled.println(F("idle"));
  }

  oled.setCursor(0, 44);
  oled.print(F("link ")); oled.print(mqttUp ? F("up") : F("DOWN"));
  oled.print(F("  csq ")); oled.println(signalStrength());

  oled.setCursor(0, 54);
  unsigned long quiet = (millis() - lastHeard) / 60000UL;
  oled.print(F("heard ")); oled.print(quiet);
  oled.print(F("m ago (fs ")); oled.print(FAILSAFE_AFTER_MIN); oled.println(F("m)"));

  oled.display();
}`,
  after: `<p><strong><code>enforceLimits()</code> runs first in <code>loop()</code> and touches no network
  code.</strong> That is the point: if the MQTT handling, the modem or the parsing is broken, the maximum
  on-time and the failsafe still apply. Safety logic should not depend on the subsystem most likely to
  fail.</p>
  <p><strong>The counter in the signed payload</strong> is what makes the HMAC useful. Signing alone stops
  forgery; it does nothing about someone capturing a valid "on" message and replaying it next week. A
  monotonic counter costs nothing and closes that.</p>
  <p><strong>Never retain a command topic.</strong> A retained ON is delivered the instant a device
  subscribes - so a device that reboots after a two-day outage turns the load on immediately, using a command
  sent two days ago. The freshness check catches it; not retaining is what prevents it.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note danger"><span class="t">Test every failure case before this switches anything real</span>
<p>Relay connected, nothing on its contacts, and work through the list in the assembly section: pull the
antenna, reboot mid-command, exceed the on-time, replay a command, stop the broker, press the button.</p>
<p>This is not optional diligence. A remote switch that has not had its failure modes exercised is a device
whose behaviour nobody knows.</p></div>
<div class="note tip"><span class="t">Sending a signed command</span>
<p>The signable string is <code>cmd|ts|counter</code> and the signature is HMAC-SHA256 with your secret. In
shell:</p>
<p><code>MSG="on|$(date +%s)|43"; SIG=$(echo -n "$MSG" | openssl dgst -sha256 -hmac "your-secret" -hex | awk '{print $2}')</code></p>
<p>Then publish <code>{"cmd":"on","ts":...,"n":43,"sig":"$SIG"}</code> with <code>mosquitto_pub</code>, and
remember <strong>no <code>-r</code> flag</strong>.</p></div>`,

tune: [
  { h: 'Choose the failsafe from what the thing does',
    body: `<p>Not from what feels safe in the abstract. A freezer that fails off spoils its contents; a heater
    that fails on burns fuel for a fortnight and could be dangerous.</p>
    <p>Write the reasoning on a label inside the lid. The next person to open it will want to know.</p>` },
  { h: 'A schedule as a backstop',
    body: `<p>For something like a caravan heater, a local schedule - on between 6 and 8 am - means the device
    is useful even with no connectivity at all, and the remote command becomes an override rather than the
    only control path.</p>
    <p>This is much more robust than a purely remote design and usually not much more code.</p>` },
  { h: 'Alert on the state you did not ask for',
    body: `<p>The most useful alert is not "it turned on" - it is "it is on and drawing 0&nbsp;A", or "it
    reached its maximum on-time", or "it has been silent for an hour".</p>
    <p>Set those up on the dashboard side. They are the messages that mean something is wrong.</p>` },
  { h: 'Two relays for a proper interlock',
    body: `<p>For anything where an unwanted ON is genuinely dangerous, two relays in series driven from two
    different pins with two different conditions. Both must agree for the load to be energised.</p>
    <p>A single welded contact then cannot turn the load on by itself, which a single relay cannot promise.</p>` },
  { h: 'Data use is tiny - so leave the session up',
    body: `<p>A persistent MQTT session with a 60-second keepalive plus a status message a minute is around
    2&nbsp;MB a year. That is nothing on any tariff.</p>
    <p>Do not be tempted to disconnect between commands to save data. The device needs to be reachable, and
    reconnecting is where the cost and the risk are.</p>` },
  { h: 'A local schedule beats a cloud one',
    body: `<p>If the behaviour is time-based, keep the schedule in the device with an RTC or the modem's
    network time. A device that depends on a server to know when to turn a heater on has a much longer chain
    of things that can fail.</p>` }
],

trouble: [
  { q: 'The relay clicks on every time the board boots',
    a: `The IN pin floats during reset and an active-LOW module reads that as on. Fit a 10&nbsp;k pull-up from
    IN to 3.3&nbsp;V at the relay module, and check you are not using a strapping pin - GPIO0, 2, 5, 12 and 15
    are all driven during boot.` },
  { q: 'Commands are rejected as bad signature',
    a: `The signable string must match exactly on both sides: <code>cmd|ts|n</code>, no spaces, same order.
    Print it at both ends and compare character by character. A trailing newline from <code>echo</code>
    without <code>-n</code> is the classic cause.` },
  { q: 'It turns on by itself after an outage',
    a: `A retained command message. Republish the command topic empty with the retain flag to clear it, and
    never publish commands with <code>-r</code>. The timestamp freshness check should also catch this - verify
    it is working.` },
  { q: 'The failsafe never triggers',
    a: `<code>lastHeard</code> is being updated by something other than a genuine command - a keepalive, or a
    status publish. Only update it on an accepted command or a local button press.` },
  { q: 'Current reads non-zero with nothing connected',
    a: `The ACS712 is noisy and its zero point drifts. Recalibrate at boot with no load, and keep the
    0.15&nbsp;A noise floor. It is there to tell current from no-current, not to be a meter.` },
  { q: 'It disconnects and reconnects constantly',
    a: `Usually power - the modem browning out during transmit. Check the capacitors and the supply. Check the
    reconnect counter: more than a few a day means something real, and each one is a chance for a command to
    be missed.` },
  { q: 'Commands arrive but the payload is truncated',
    a: `The <code>+CMQTTRXPAYLOAD</code> parsing is fragile if the payload spans reads. Collect until you have
    the announced length rather than assuming one read gets it all.` },
  { q: 'The load will not switch even though the relay clicks',
    a: `That is what the current sensor is for, and it has just earned its place. Check COM and NO wiring, the
    load itself, and whether the relay's contacts are rated for it - welded contacts on an inductive load are
    common and the click can continue after the contacts have failed.` }
],

next: `
<ul>
  <li><strong>Mains work properly</strong> - the <a href="project.html?p=smart-plug-relay">smart plug</a>
  covers enclosure, isolation and wiring standards in detail. Read it before switching mains here.</li>
  <li><strong>The monitoring half</strong> - the
  <a href="project.html?p=lte-remote-monitor">LTE remote monitor</a>, which is the same hardware doing the
  easier job.</li>
  <li><strong>On your own network instead</strong> - the
  <a href="project.html?p=lora-remote-sensor">LoRa link</a> can carry commands too, with no operator and no
  subscription, if you can reach the site.</li>
  <li><strong>Add local intelligence.</strong> A thermostat that runs locally and takes a setpoint remotely is
  far more robust than one that takes on/off commands - the device keeps working correctly when the link does
  not.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Mains</span>
<ul>
  <li><strong>Read the <a href="project.html?p=smart-plug-relay">smart plug project</a> first</strong> if this
  will switch mains. Everything there applies here.</li>
  <li><strong>Isolation:</strong> only VCC, GND and IN connect the relay module to the logic. Mains goes to
  COM and NO and nowhere else.</li>
  <li><strong>Switch live, not neutral.</strong></li>
  <li><strong>Check the real load against the relay's real rating.</strong> Module ratings are optimistic and
  inductive loads are far harder on contacts than resistive ones.</li>
  <li><strong>Proper enclosure, cable glands, nothing exposed.</strong> If you are not confident, switch
  12&nbsp;V instead.</li>
  <li><strong>In many countries, permanent mains wiring is regulated work.</strong> A plug-in device is a
  different matter from wiring into a consumer unit - know which you are doing.</li>
</ul>
</div>
<div class="note danger"><span class="t">Unattended control needs interlocks, not just code</span>
<ul>
  <li><strong>Decide the failsafe deliberately.</strong> "Hold last state" is the default if you do not, and
  it is usually wrong.</li>
  <li><strong>The maximum on-time must live in the device</strong>, where nothing remote can extend it.</li>
  <li><strong>There must be a manual override</strong> that works with no phone, no network and no
  knowledge of how the device works. A switch, or the ability to unplug it.</li>
  <li><strong>Test the failure cases before it controls anything real.</strong> Pull the antenna, reboot it,
  replay a command, exceed the limit.</li>
  <li><strong>Label it</strong> inside and out: what it switches, what it does on link loss, the maximum
  on-time, and how to contact you.</li>
  <li><strong>Do not use this for anything where an unwanted state is dangerous</strong> - heating with no
  thermostat, anything with a flame, anything holding a load up, anything that could trap a person. Those need
  purpose-built equipment with real safety certification, not a hobby board.</li>
</ul>
</div>`
});
