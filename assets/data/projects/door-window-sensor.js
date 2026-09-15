/* Battery door sensor: reed switch wakes an ESP8266, posts to MQTT, sleeps. */
AB.addProject({
slug: 'door-window-sensor',
title: 'Battery door and window sensor',
cat: 'smart-home',
level: 3,
time: '2 hours',
solder: true,
board: 'D1 Mini',
tags: ['esp8266', 'reed switch', 'mqtt', 'deep sleep', 'battery', 'home assistant'],
blurb: 'A magnet, a reed switch and an ESP8266 that sleeps at microamps and only wakes when the door moves. Months on a pair of AA cells.',

skills: ['Reed switches', 'ESP8266 deep sleep', 'MQTT', 'Battery voltage measurement', 'Sleep current'],

intro: `
<p>Commercial door sensors cost $25 and phone home to somebody else's cloud. This one costs about $8, runs on
your own broker, and teaches the most useful trick in battery-powered electronics: doing nothing well.</p>
<p>The design choice that matters is that the device does not poll. It has no loop. Opening the door
<em>physically completes a circuit that powers the board up</em>, it publishes one message, and it switches
itself off. Between events it consumes nothing at all - not microamps, actually nothing, because it is not
connected.</p>`,

what: [
  'Publish <code>open</code> to MQTT within about four seconds of the door moving.',
  'Publish <code>closed</code> when it shuts again.',
  'Report its own battery voltage with each message so you know when to change cells.',
  'Appear in Home Assistant automatically as a door sensor.',
  'Run six months or more on two AA cells, because it only draws current while it is actually sending.'
],

how: `
<p>A <strong>reed switch</strong> is two ferrous contacts sealed in a glass tube. Bring a magnet near and they
attract each other and touch. No power, no wear, no electronics - the same idea as a fridge light, and they
last for decades.</p>
<p>The clever part is what the switch is wired to. Rather than having the ESP8266 sleep and watch the pin, we
use the reed switch to drive the board's <strong>RST</strong> line. A D1 Mini put into
<code>ESP.deepSleep(0)</code> sleeps forever and only ever wakes on a reset pulse. So:</p>
<ol>
  <li>Board wakes because RST was pulled low by the door moving.</li>
  <li>It reads which state the door is in, connects to Wi-Fi, publishes, and calls <code>deepSleep(0)</code>.</li>
  <li>It is then drawing about 20&nbsp;&micro;A until the door moves again.</li>
</ol>
<p>The cost is the four seconds of Wi-Fi association each time, at around 80&nbsp;mA. That is 0.1&nbsp;mAh per
event. A door opened forty times a day costs 4&nbsp;mAh, so a 2000&nbsp;mAh pair of AAs is limited by the sleep
current and self-discharge, not by the door.</p>`,

bom: [
  { id: 'esp8266', qty: 1, note: 'Wemos D1 Mini. Small, cheap, and its deep sleep is well behaved.' },
  { id: 'reed', qty: 1, note: 'Normally-open reed switch plus its magnet. The cased "door sensor" pairs with screw tabs are the easiest to mount.' },
  { id: 'res10k', qty: 2, note: 'One pull-up for the state pin, and the top half of the battery divider.' },
  { id: 'res1k', qty: 1, note: 'Bottom half of the battery divider. Ratio matters more than exact values.' },
  { id: 'cap100n', qty: 1, note: 'Across the reed switch, to absorb contact bounce on the reset line.' },
  { id: 'batt-aa2', qty: 1, note: 'Two AA cells give 3.0 V, which the D1 Mini runs on directly through its 3V3 pin. A holder with a switch is handy.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'box-abs', qty: 1, note: 'A small one. This wants to be discreet on a door frame.' },
  { id: 'magnet', qty: 1, own: true },
  { id: 'tape', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'dmm' }, { id: 'cutters' }],

build: {
  parts: [
    { id: 'esp',  comp: 'esp8266',      at: [0, 0] },
    { id: 'reed', comp: 'reed',         at: [-2, -48], ry: 90 },
    { id: 'batt', comp: 'battery18650', at: [0, 52], label: '2x AA holder' }
  ],
  wires: [
    { from: 'batt.+',  to: 'esp.3V3',  color: 'red',    note: '3.0 V from two AA cells straight onto the 3V3 pin' },
    { from: 'batt.-',  to: 'esp.GND',  color: 'black',  note: 'Ground' },
    { from: 'reed.A',  to: 'esp.RST',  color: 'yellow', note: 'Reed switch pulls RST low, which wakes the board' },
    { from: 'reed.B',  to: 'esp.GND',  color: 'black',  note: 'Other side of the reed to ground' },
    { from: 'reed.A',  to: 'esp.D7',   color: 'blue',   note: 'Same node read as an input, so the board knows which way the door went' }
  ]
},

wireIntro: `<p>Five connections, and one of them is doing something unusual: the reed switch is wired to both
the reset pin and an ordinary input at the same time. That is deliberate.</p>`,

wireNotes: `
<div class="note tip"><span class="t">Why the reed switch is on RST as well as D7</span>
<p>RST is what gets the board out of an indefinite deep sleep - nothing else will. D7 is how the freshly-woken
sketch finds out whether the switch is currently closed or open, so it can publish the right state rather than
just "something happened".</p>
<p>D7 needs a 10&nbsp;k pull-up to 3.3&nbsp;V so it reads HIGH when the reed is open. RST already has a
pull-up inside the module.</p></div>

<div class="note warn"><span class="t">Feed the 3V3 pin, not the 5V pin</span>
<p>Two alkaline AA cells give 3.0&nbsp;V fresh and about 2.4&nbsp;V flat. Fed into the D1 Mini's
<strong>3V3</strong> pin they bypass the onboard regulator entirely, which saves its quiescent current - and
that quiescent current is otherwise most of your sleep budget.</p>
<p>Do not do this with a 9&nbsp;V battery or anything above 3.6&nbsp;V. There is no regulator in the path.</p></div>

<div class="note warn"><span class="t">The capacitor across the reed switch</span>
<p>Reed contacts bounce for a millisecond or two, which on a reset line means several resets in a row and
several duplicate MQTT messages. A 100&nbsp;nF ceramic across the switch soaks that up.</p></div>

<div class="note"><span class="t">D0 to RST is the other deep sleep wire - and you do not want it here</span>
<p>Most ESP8266 deep-sleep tutorials tell you to connect D0 to RST. That is for <em>timed</em> wake-ups. Here
the wake source is the door, so leave D0 alone - and if you have that wire fitted from a previous project,
remove it, or the board will wake on its own schedule and flatten the batteries.</p></div>`,

solderSteps: [
  { h: 'Female sockets for the D1 Mini',
    body: `<p>Two 8-pin strips. The module as its own jig, tack the corners, check square, complete. Sixteen
    joints, three seconds each.</p>` },
  { h: 'The pull-up and the divider',
    body: `<p>10&nbsp;k from D7 to 3V3. Then the battery divider: 10&nbsp;k from the battery positive to A0,
    and 1&nbsp;k from A0 to ground.</p>
    <p>That divider matters because the D1 Mini already has a 220&nbsp;k/100&nbsp;k divider on its A0 pin to
    give a 0-3.2&nbsp;V range. Adding to it changes the ratio, which is why the sketch has a single
    <code>VOLT_SCALE</code> constant you calibrate by measurement rather than by arithmetic.</p>` },
  { h: 'Reed switch leads',
    body: `<p>Glass-bodied reed switches are fragile - the seal is at the wire exit and bending the lead right
    at the glass cracks it. Grip each lead with pliers <em>between</em> the glass and your bend, so the strain
    never reaches the body.</p>
    <p>Better: buy the pre-cased door-sensor pair, which has flying leads and screw tabs already.</p>` },
  { h: 'Capacitor across the switch',
    body: `<p>100&nbsp;nF ceramic, no polarity, soldered directly across the two reed leads at the board end.</p>` },
  { h: 'Battery leads last, with the switch off',
    body: `<p>Holder red to the 3V3 socket pin, black to GND. Sleeve both.</p>
    <p>Before inserting cells: continuity from 3V3 to GND must not beep.</p>` },
  { h: 'Measure the sleep current',
    body: `<p>Multimeter set to microamps, in series with the battery positive. With the board asleep you want
    something in the tens of microamps. If you read milliamps, the board is not sleeping - the usual cause is a
    D0-to-RST wire left in place, or a sketch that crashed before reaching <code>deepSleep</code>.</p>` }
],

assembly: [
  { h: 'Get it publishing on the bench first',
    body: `<p>USB power, Serial Monitor at 74880 baud (the ESP8266's odd boot rate - it also prints boot
    messages there). Short the reed leads with a jumper and watch it wake, connect and publish.</p>` },
  { h: 'Calibrate the battery reading',
    body: `<p>Measure the actual cell voltage with a multimeter, note the raw A0 value the sketch prints, and
    set <code>VOLT_SCALE</code> so the two agree. It is one division.</p>` },
  { h: 'Fit the two halves',
    body: `<p>Switch body on the frame, magnet on the door, with under 10&nbsp;mm between them when the door is
    shut. Most reed switches release at around 15-20&nbsp;mm, so a wide gap gives you a sensor that thinks the
    door is always open.</p>
    <p>Align the marks on the two cases - they are not arbitrary; the magnet's field is directional.</p>` },
  { h: 'Test the gap before you commit the adhesive',
    body: `<p>Hold both parts in place with tape and open and shut the door ten times, watching the MQTT topic.
    Then stick them down.</p>` },
  { h: 'Add it to Home Assistant',
    body: `<p>With discovery enabled it appears on its own as a binary sensor in the door device class, with a
    battery percentage attached.</p>` }
],

libraries: [
  { name: 'esp8266 board package', by: 'ESP8266 Community', how: 'Boards Manager, with the URL http://arduino.esp8266.com/stable/package_esp8266com_index.json', why: 'ESP8266WiFi and the sleep API.' },
  { name: 'PubSubClient', by: 'Nick O\'Leary', why: 'MQTT.' }
],

code: [{
  name: 'door_sensor.ino',
  intro: `<p>There is nothing in <code>loop()</code>, because the board never gets there twice. Everything
  happens once in <code>setup()</code> and then it sleeps forever.</p>`,
  code: `/* ------------------------------------------------------------------
   Battery door sensor
   Reed switch on D7 (and on RST, which is what wakes the board).
   Publishes open/closed plus battery voltage, then sleeps indefinitely.
   Board: LOLIN(WEMOS) D1 R2 & mini
   ------------------------------------------------------------------ */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// ---- change these ----------------------------------------------------
const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";
const char* MQTT_HOST = "192.168.1.10";
const int   MQTT_PORT = 1883;
const char* MQTT_USER = "";
const char* MQTT_PASS = "";

const char* DEVICE_ID   = "frontdoor";
const char* DEVICE_NAME = "Front door";

// Measure the cells with a multimeter, read the raw value this sketch
// prints, then set:  VOLT_SCALE = realVolts / rawValue
const float VOLT_SCALE = 0.00415;
// ----------------------------------------------------------------------

#define REED_PIN  D7

WiFiClient   net;
PubSubClient mqtt(net);

void setup() {
  Serial.begin(74880);          // the ESP8266 boot ROM uses this rate too
  Serial.println();

  pinMode(REED_PIN, INPUT_PULLUP);

  // Read the door state immediately, before Wi-Fi has a chance to
  // take 4 seconds and let someone close the door again.
  delay(5);
  bool closed = (digitalRead(REED_PIN) == LOW);   // magnet near = contact made
  int  raw = analogRead(A0);
  float volts = raw * VOLT_SCALE;

  Serial.printf("door %s   raw %d  (%.2f V)\\n", closed ? "CLOSED" : "OPEN", raw, volts);

  if (connectWifi() && connectMqtt()) {
    char topic[64], payload[16];

    snprintf(topic, sizeof(topic), "home/%s/state", DEVICE_ID);
    mqtt.publish(topic, closed ? "closed" : "open", true);

    snprintf(topic, sizeof(topic), "home/%s/battery", DEVICE_ID);
    dtostrf(volts, 4, 2, payload);
    mqtt.publish(topic, payload, true);

    publishDiscovery();

    mqtt.loop();
    delay(60);                  // let the packets actually leave
    mqtt.disconnect();
    Serial.println("published");
  } else {
    Serial.println("could not publish - sleeping anyway to save the battery");
  }

  sleepForever();
}

void loop() { }                 // never reached

/* -------------------------------------------------------------------- */
bool connectWifi() {
  WiFi.forceSleepWake();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - t0 > 8000) return false;   // give up rather than drain
    delay(50);
  }
  Serial.print("wifi ");
  Serial.println(WiFi.localIP());
  return true;
}

bool connectMqtt() {
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  bool ok = strlen(MQTT_USER)
    ? mqtt.connect(DEVICE_ID, MQTT_USER, MQTT_PASS)
    : mqtt.connect(DEVICE_ID);
  return ok;
}

void publishDiscovery() {
  char topic[96];
  snprintf(topic, sizeof(topic), "homeassistant/binary_sensor/%s/config", DEVICE_ID);

  String cfg = String("{\\"name\\":\\"") + DEVICE_NAME +
    "\\",\\"uniq_id\\":\\"" + DEVICE_ID +
    "\\",\\"stat_t\\":\\"home/" + DEVICE_ID + "/state" +
    "\\",\\"pl_on\\":\\"open\\",\\"pl_off\\":\\"closed\\"," +
    "\\"dev_cla\\":\\"door\\"}";

  mqtt.publish(topic, cfg.c_str(), true);
}

void sleepForever() {
  Serial.flush();
  // 0 means "until something resets me" - which is the reed switch.
  ESP.deepSleep(0, WAKE_RF_DEFAULT);
  delay(100);                   // deepSleep is not instantaneous
}`,
  after: `<p>Reading the door state in the first five milliseconds, before Wi-Fi, is deliberate. Association
  takes several seconds, and a door that is opened and shut quickly would otherwise be reported as "closed"
  because that is what the pin says by the time the message goes out.</p>
  <p>The eight-second Wi-Fi timeout is equally deliberate: if the router is down, the worst outcome is a missed
  message. Retrying forever would flatten the batteries in a night.</p>`
}],

upload: `
<p>Board: <strong>LOLIN(WEMOS) D1 R2 &amp; mini</strong>. Upload over USB with the batteries disconnected.</p>
<div class="note warn"><span class="t">Deep sleep and uploading fight each other</span>
<p>A board asleep is not listening to the serial port. If uploads start failing after you flash this sketch,
short the reed leads (or press RST) at the moment the IDE says <code>Connecting</code>. Easier: keep a jumper
across the reed contacts while you are developing, so it resets constantly.</p></div>`,

tune: [
  { h: 'Calibrate the battery scale',
    body: `<p>Measure the pack with a multimeter. The sketch prints <code>raw</code>. Divide:
    <code>VOLT_SCALE = measured / raw</code>. Re-upload.</p>
    <p>Do it with cells that are part-used rather than brand new - the reading matters most near the end of
    their life.</p>` },
  { h: 'Measure the real sleep current',
    body: `<p>Multimeter on the &micro;A range, in series with the battery. Under 100&nbsp;&micro;A is good,
    under 30 is excellent. Anything in milliamps means it is not sleeping.</p>
    <p>Battery life in days &asymp; capacity in mAh &divide; (sleep current in mA &times; 24). At
    50&nbsp;&micro;A and 2000&nbsp;mAh that is over three years in theory - alkaline self-discharge and the
    wake events bring it back to six to twelve months in practice.</p>` },
  { h: 'Get the magnet gap right',
    body: `<p>Under 10&nbsp;mm closed. If the door sags or the frame is uneven, use a stronger neodymium magnet
    rather than moving the switch - a bigger magnet widens the working range at both ends.</p>` },
  { h: 'Handle the double-publish',
    body: `<p>If one door movement produces two messages, the capacitor across the reed is missing or too small.
    Try 1&nbsp;&micro;F. MQTT retained messages mean a duplicate is harmless, but it costs battery.</p>` }
],

trouble: [
  { q: 'Never wakes',
    a: `The reed switch is not actually connected to RST, or it is a normally-closed type. Test by briefly
    shorting RST to GND with a wire - if the board wakes, the fault is the switch or its wiring.` },
  { q: 'Wakes continuously, batteries flat in a day',
    a: `A D0-to-RST wire left in from another project, or the reed switch chattering. Also check the sketch
    actually reaches <code>ESP.deepSleep()</code> - if it hangs waiting for Wi-Fi forever, it never sleeps.` },
  { q: 'Reports the wrong state',
    a: `Normally-open versus normally-closed reed. Invert the test: <code>bool closed = (digitalRead(REED_PIN) == HIGH);</code>` },
  { q: 'Works on USB, does nothing on batteries',
    a: `Two AA cells at 3.0&nbsp;V is near the bottom of what an ESP8266 will transmit on, and Wi-Fi bursts
    pull the voltage down further. Fresh cells, a 470&nbsp;&micro;F capacitor across the 3V3 pin, and short
    battery leads. If it still fails, use three AA cells through a small LDO regulator instead.` },
  { q: 'Battery voltage reads nonsense',
    a: `A0 on a D1 Mini already has a divider on it and only accepts 0-3.2&nbsp;V at the pin. Check your extra
    divider is not overloading it, and recalibrate <code>VOLT_SCALE</code>.` },
  { q: 'Home Assistant shows it as unavailable',
    a: `Expected between events - it is asleep and not connected. Retained MQTT messages mean the last state is
    still correct. Do not add an availability topic with a last-will message, because the will fires every time
    it sleeps.` },
  { q: 'Messages take ten seconds',
    a: `Wi-Fi association. A static IP instead of DHCP saves a second or two:
    <code>WiFi.config(ip, gateway, subnet, dns)</code> before <code>begin()</code>.` }
],

next: `
<ul>
  <li><strong>A second reed switch</strong> on another pin lets one board watch a door and a window.</li>
  <li><strong>Add a tamper switch</strong> - a microswitch held closed by the case - and publish an alert when
  the box is opened.</li>
  <li><strong>Vibration instead of a magnet</strong>: an SW-420 tilt sensor on the reset line turns this into a
  postbox or a letterbox alert.</li>
  <li><strong>Swap MQTT for a webhook</strong> if you have no broker - one HTTPS POST to a push notification
  service does the same job with more latency.</li>
</ul>`
});
