/* ESP32 + relay switching a mains lamp, with a web page and MQTT. */
AB.addProject({
slug: 'smart-plug-relay',
title: 'Wi-Fi switch for a mains lamp',
cat: 'smart-home',
level: 4,
time: '4 hours',
solder: true,
board: 'ESP32',
feature: true,
tags: ['esp32', 'relay', 'mains', 'mqtt', 'home assistant', 'web server', 'wifi'],
blurb: 'Switch a real lamp from your phone, from a wall button, or from Home Assistant. The project where the wiring genuinely matters.',

skills: ['ESP32 Wi-Fi', 'Web server', 'MQTT', 'Relay isolation', 'Mains safety', 'Debouncing'],

intro: `
<p>This is the project that turns a hobby into a thing your household uses. It is also the one where a mistake
has consequences beyond a dead component, so the safety section is not boilerplate - please read it before you
buy anything.</p>
<p>There is a completely legitimate version of this build that never touches mains wiring: put the relay in a
<strong>12&nbsp;V lamp circuit</strong> instead, or control an off-the-shelf smart plug over MQTT. If you are
not confident, take that route. Everything in the code below is identical.</p>`,

what: [
  'Serve a page on your network with an on/off button and the current state.',
  'Publish state to MQTT and accept commands, so Home Assistant discovers it automatically.',
  'Take a physical push button as well, because a light that only works when the Wi-Fi is up is a bad light.',
  'Remember its last state through a power cut.',
  'Keep working locally even when the broker or the internet is down.'
],

how: `
<p>A <strong>relay</strong> is an electromagnet pulling a metal contact across a gap. The coil side runs at
5&nbsp;V and a few tens of milliamps; the contact side is a mechanically separate piece of metal that can carry
mains. There is no electrical connection between them - the isolation is an air gap and a plastic bobbin,
which is exactly why relays are the right answer for this job.</p>
<p>A decent relay <em>module</em> adds two more things: an <strong>optocoupler</strong>, so even the control
signal crosses an optical gap rather than a wire, and a <strong>flyback diode</strong> across the coil to
absorb the spike when it switches off. Both are why this build specifies a module and not a bare relay.</p>
<p>On the software side, the ESP32 runs two things at once: a tiny HTTP server for the browser, and an MQTT
client that connects out to a broker. MQTT is the reason this integrates with Home Assistant in about thirty
seconds - the device announces itself on a discovery topic and Home Assistant creates the entity for you.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'A DevKit V1. Do not use a bare ESP-01 here - you want the regulator and the extra pins.' },
  { id: 'relay1', qty: 1, note: 'MUST be opto-isolated and rated for the load. Check the relay body: 10 A 250 VAC is typical, and treat that as 3 A in reality.' },
  { id: 'psu5v3a', qty: 1, note: 'A sealed USB supply. Do NOT build your own mains-to-5 V section for a first project.' },
  { id: 'button', qty: 1, note: 'A proper panel-mount momentary switch if it is going in a box.' },
  { id: 'led5', qty: 1 },
  { id: 'res220', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'box-abs', qty: 1, note: 'Must fully enclose everything, with no exposed metal, and be closed with screws rather than clips.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'heatshrink', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'cutters' }],

build: {
  parts: [
    { id: 'esp', comp: 'esp32',  at: [0, 0] },
    { id: 'rly', comp: 'relay1', at: [0, -62], ry: 180 },
    { id: 'btn', comp: 'button', at: [-42, 44] },
    { id: 'led', comp: 'led5',   at: [34, 44], opt: { c: '#3fbf6a' } },
    { id: 'lamp', comp: 'block', at: [58, -104], opt: { w: 44, h: 30, d: 40, c: '#d8cfa8' }, label: 'Lamp (mains)' }
  ],
  wires: [
    { from: 'rly.VCC', to: 'esp.VIN',  color: 'red',    note: '5 V for the relay coil, from the ESP32 board VIN pin' },
    { from: 'rly.GND', to: 'esp.GND',  color: 'black',  note: 'Ground' },
    { from: 'rly.IN',  to: 'esp.D26',  color: 'blue',   note: 'Control. LOW energises most of these modules' },
    { from: 'btn.1A',  to: 'esp.D27',  color: 'yellow', note: 'Wall button, using the internal pull-up' },
    { from: 'btn.2A',  to: 'esp.GND2', color: 'black',  note: 'Other side of the button straight to ground' },
    { from: 'led.A',   to: 'esp.D2',   color: 'green',  note: 'Status LED through a 220 ohm resistor' },
    { from: 'led.K',   to: 'esp.GND2', color: 'black',  note: 'LED cathode' },
    { from: 'rly.NO',  to: 'lamp.n',   color: 'brown',  note: 'MAINS. Switched live out to the lamp. See the safety section' }
  ]
},

wireIntro: `<p>The low-voltage side is seven wires and completely ordinary. The eighth - the brown one - is
mains, and it obeys different rules.</p>`,

wireNotes: `
<div class="note danger"><span class="t">How the mains side is wired, if you do it at all</span>
<p>The relay goes in the <strong>live</strong> conductor only, and it breaks the connection between the supply
and the appliance:</p>
<ul>
  <li>Incoming <strong>live</strong> (brown in the EU, black in the US) &rarr; relay <strong>COM</strong> terminal.</li>
  <li>Relay <strong>NO</strong> terminal &rarr; the lamp's live wire.</li>
  <li><strong>Neutral</strong> passes straight through, never through the relay.</li>
  <li><strong>Earth</strong> passes straight through, and is never switched, never cut, and never omitted from
  a metal-bodied appliance.</li>
</ul>
<p>Switching neutral instead of live is a classic and dangerous mistake: the lamp goes out, and its live
conductor is still live.</p></div>

<div class="note warn"><span class="t">Power the ESP32 from VIN, not from the relay board</span>
<p>The VIN pin on a DevKit takes 5&nbsp;V and feeds the onboard regulator. Feed the relay coil from the same
5&nbsp;V. Do <strong>not</strong> try to run the relay coil from the ESP32's 3.3&nbsp;V pin - a 5&nbsp;V relay
will chatter or half-pull, and a half-pulled relay contact arcs and welds.</p></div>

<div class="note tip"><span class="t">Avoid the strapping pins</span>
<p>GPIO 0, 2, 5, 12 and 15 are read at boot to decide how the ESP32 starts. Anything pulling them the wrong way
can stop the board booting. That is why the relay is on GPIO 26 and the button on 27 - both are ordinary pins
with no boot role. If you move them, stay away from that list.</p></div>`,

solderSteps: [
  { h: 'Sockets, not soldered-down modules',
    body: `<p>Solder two 15-pin female header strips to the perfboard so the ESP32 plugs in and can be pulled
    out. The same for the relay's 3-pin header. You will want to reprogramme, replace, or repurpose these
    parts, and desoldering a 30-pin board is an hour you will not enjoy.</p>
    <p>Use the ESP32 itself to space the two strips: push the headers onto its pins, place the whole assembly
    into the perfboard, and solder the outermost pin of each strip. Then remove the ESP32 and do the rest.</p>` },
  { h: 'Tack, check, complete',
    body: `<p>One pin at each end of each strip first. Look from the side - both strips must be perpendicular
    and at the same height, or the board will not seat. Adjust by reheating a single tack joint.</p>
    <p>Then the remaining 26 joints, three seconds each, wiping the tip every five.</p>` },
  { h: 'Status LED with its resistor',
    body: `<p>220&nbsp;&Omega; in series with the anode. Bend the resistor leg through the adjacent hole and
    solder both together - no patch wire needed.</p>` },
  { h: 'Button leads long enough to reach the box wall',
    body: `<p>Two wires, 150&nbsp;mm, stranded. Tin both ends. Sleeve the joints at the button in heat-shrink,
    slid on before you solder.</p>` },
  { h: 'Ground bus, then power, then signals',
    body: `<p>Solid core 22&nbsp;AWG bent flat. Keep the low-voltage wiring to one side of the board and leave
    the whole area around the relay's screw terminals clear - nothing of yours should be within 8&nbsp;mm of a
    mains terminal.</p>` },
  { h: 'Inspect, buzz, and only then think about mains',
    body: `<p>Rake light along the rows. Continuity: 5&nbsp;V to GND must not beep; 3.3&nbsp;V to GND must not
    beep. Power it from USB alone and confirm the relay clicks on command with nothing connected to its screw
    terminals.</p>` },
  { h: 'The mains joints, if you are doing them',
    body: `<p><strong>Not soldered.</strong> Mains conductors go into screw terminals or crimped ferrules,
    never a soldered joint - solder cold-flows under clamping pressure and the connection loosens over months,
    which is how fires start.</p>
    <p>Strip 6&nbsp;mm, do not tin, insert fully so no bare copper shows outside the terminal, tighten firmly,
    and tug-test each one. Add a cable gland or a strain relief tie so a pull on the flex cannot reach the
    terminals.</p>` }
],

assembly: [
  { h: 'Build and test the whole thing on 12 V or on nothing at all',
    body: `<p>Wire it up, upload the sketch, and prove the relay clicks from the web page, from MQTT and from
    the button, with the screw terminals completely empty. Listen for the click.</p>
    <p>Everything you need to debug happens at this stage. Do not connect mains to a circuit you are still
    debugging.</p>` },
  { h: 'Set the Wi-Fi and MQTT details',
    body: `<p>Six lines at the top of the sketch. If you have no broker, leave <code>MQTT_HOST</code> empty -
    the sketch skips MQTT entirely and the web page still works.</p>` },
  { h: 'Find it on the network',
    body: `<p>Serial Monitor at 115200 prints the IP. Give it a DHCP reservation in the router so it never
    moves.</p>` },
  { h: 'Home Assistant',
    body: `<p>With MQTT configured and the discovery topic enabled, the switch appears by itself under
    Settings &rarr; Devices &rarr; MQTT within a few seconds of boot. No YAML.</p>` },
  { h: 'Box it so nothing can be touched',
    body: `<p>Everything inside a closed plastic enclosure. Screws, not clips. A cable gland where the flex
    enters. No metal fixings passing through the box near the mains section. The only things outside the box
    are the button and the LED.</p>` }
],

libraries: [
  { name: 'esp32 board package', by: 'Espressif', how: 'Boards Manager', why: 'WiFi, WebServer and Preferences.' },
  { name: 'PubSubClient', by: 'Nick O\'Leary', why: 'A small, reliable MQTT client. Only needed if you use MQTT.' }
],

code: [{
  name: 'wifi_mains_switch.ino',
  intro: `<p>Works with or without a broker. If <code>MQTT_HOST</code> is left empty it simply never tries.</p>`,
  code: `/* ------------------------------------------------------------------
   Wi-Fi mains switch
     - web page with an on/off button
     - MQTT with Home Assistant auto-discovery
     - a physical button that works regardless of the network
     - remembers its state across a power cut
   Board: ESP32 Dev Module
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <PubSubClient.h>

// ---- change these ----------------------------------------------------
const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";

const char* MQTT_HOST = "";            // "" disables MQTT entirely
const int   MQTT_PORT = 1883;
const char* MQTT_USER = "";
const char* MQTT_PASS = "";

const char* DEVICE_ID   = "lamp1";
const char* DEVICE_NAME = "Living room lamp";
// ----------------------------------------------------------------------

#define RELAY_PIN   26
#define BUTTON_PIN  27
#define LED_PIN      2
#define RELAY_ACTIVE_LOW  true
#define DEBOUNCE_MS  40

WebServer   web(80);
WiFiClient  net;
PubSubClient mqtt(net);
Preferences prefs;

bool relayOn = false;
bool lastReading = HIGH, lastStable = HIGH;
unsigned long lastChange = 0, lastMqttTry = 0;

String topicState, topicCmd, topicDisco;

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  prefs.begin("switch", false);
  relayOn = prefs.getBool("on", false);
  applyRelay();

  topicState = String("home/") + DEVICE_ID + "/state";
  topicCmd   = String("home/") + DEVICE_ID + "/set";
  topicDisco = String("homeassistant/switch/") + DEVICE_ID + "/config";

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("wifi");
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
    delay(300); Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("http://");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("no wifi - button still works");
  }

  web.on("/", handleRoot);
  web.on("/on",     [] { setRelay(true);      redirect(); });
  web.on("/off",    [] { setRelay(false);     redirect(); });
  web.on("/toggle", [] { setRelay(!relayOn);  redirect(); });
  web.on("/state",  [] { web.send(200, "text/plain", relayOn ? "ON" : "OFF"); });
  web.begin();

  if (strlen(MQTT_HOST)) {
    mqtt.setServer(MQTT_HOST, MQTT_PORT);
    mqtt.setCallback(onMqtt);
  }
}

void loop() {
  web.handleClient();
  readButton();

  if (strlen(MQTT_HOST) && WiFi.status() == WL_CONNECTED) {
    if (!mqtt.connected() && millis() - lastMqttTry > 5000) {
      lastMqttTry = millis();
      connectMqtt();
    }
    mqtt.loop();
  }
}

/* --- the relay -------------------------------------------------------- */
void applyRelay() {
  digitalWrite(RELAY_PIN, (relayOn == RELAY_ACTIVE_LOW) ? LOW : HIGH);
  digitalWrite(LED_PIN, relayOn ? HIGH : LOW);
}

void setRelay(bool on) {
  if (on == relayOn) return;
  relayOn = on;
  applyRelay();
  prefs.putBool("on", relayOn);
  Serial.println(relayOn ? "ON" : "OFF");
  if (mqtt.connected()) mqtt.publish(topicState.c_str(), relayOn ? "ON" : "OFF", true);
}

/* --- the physical button --------------------------------------------- */
void readButton() {
  bool reading = digitalRead(BUTTON_PIN);
  if (reading != lastReading) {
    lastChange = millis();
    lastReading = reading;
  }
  if (millis() - lastChange > DEBOUNCE_MS && reading != lastStable) {
    lastStable = reading;
    if (lastStable == LOW) setRelay(!relayOn);     // pressed
  }
}

/* --- MQTT ------------------------------------------------------------- */
void connectMqtt() {
  Serial.print("mqtt...");
  bool ok = strlen(MQTT_USER)
    ? mqtt.connect(DEVICE_ID, MQTT_USER, MQTT_PASS)
    : mqtt.connect(DEVICE_ID);
  if (!ok) { Serial.println(" failed"); return; }
  Serial.println(" connected");

  mqtt.subscribe(topicCmd.c_str());
  mqtt.publish(topicState.c_str(), relayOn ? "ON" : "OFF", true);

  // Home Assistant auto-discovery. Retained, so HA finds it on restart.
  String cfg = String("{\\"name\\":\\"") + DEVICE_NAME +
    "\\",\\"uniq_id\\":\\"" + DEVICE_ID +
    "\\",\\"cmd_t\\":\\"" + topicCmd +
    "\\",\\"stat_t\\":\\"" + topicState +
    "\\",\\"pl_on\\":\\"ON\\",\\"pl_off\\":\\"OFF\\"}";
  mqtt.publish(topicDisco.c_str(), cfg.c_str(), true);
}

void onMqtt(char* topic, byte* payload, unsigned int len) {
  String msg;
  for (unsigned int i = 0; i < len; i++) msg += (char)payload[i];
  msg.toUpperCase();
  if (msg == "ON")       setRelay(true);
  else if (msg == "OFF") setRelay(false);
  else if (msg == "TOGGLE") setRelay(!relayOn);
}

/* --- the web page ----------------------------------------------------- */
void redirect() {
  web.sendHeader("Location", "/");
  web.send(303);
}

void handleRoot() {
  String html = F(
    "<!doctype html><html><head><meta name=viewport content='width=device-width,initial-scale=1'>"
    "<title>Switch</title><style>"
    "body{font:17px system-ui;margin:0;display:grid;place-items:center;height:100vh;background:#15171a;color:#eee}"
    "a{display:block;padding:26px 54px;border-radius:18px;text-decoration:none;font-weight:600;font-size:22px}"
    ".on{background:#2f9e56;color:#fff}.off{background:#3a3f45;color:#ccc}"
    "p{opacity:.6;font-size:14px}</style></head><body><div style='text-align:center'>");
  html += "<h2>";
  html += DEVICE_NAME;
  html += "</h2>";
  html += relayOn
    ? "<a class='on' href='/off'>ON &mdash; tap to switch off</a>"
    : "<a class='off' href='/on'>OFF &mdash; tap to switch on</a>";
  html += "<p>";
  html += DEVICE_ID;
  html += " &middot; ";
  html += WiFi.localIP().toString();
  html += "</p></div></body></html>";

  web.send(200, "text/html", html);
}`,
  after: `<p><code>Preferences</code> is the ESP32's replacement for the Uno's EEPROM library - it stores
  key/value pairs in a wear-levelled flash partition. Saving the relay state there means a power cut does not
  leave your hall light in a surprising mood.</p>`
}],

upload: `
<p>Board: ESP32 Dev Module. If the upload fails at <code>Connecting....</code>, hold the BOOT button while the
dots appear and release once it starts.</p>
<p>Then: Serial Monitor at 115200, note the IP, open it in a browser, press the button on the page, and listen
for the relay to click. Press the physical button and watch the page state follow.</p>`,

tune: [
  { h: 'If the relay is inverted',
    body: `<p>Flip <code>RELAY_ACTIVE_LOW</code>. Some modules are active high; most cheap blue ones are active
    low.</p>` },
  { h: 'Make it survive a broker restart',
    body: `<p>The code retries every 5&nbsp;seconds forever and publishes a retained state message each time it
    connects, so Home Assistant is correct again within seconds of the broker coming back. Nothing to change -
    just be aware that is why the reconnect logic looks the way it does.</p>` },
  { h: 'Add a hold-to-reset',
    body: `<p>Hold the physical button for five seconds to clear stored Wi-Fi credentials and restart. Useful
    once the device is sealed in a box and you have moved house.</p>` },
  { h: 'Use GPIO 33 instead of 2 for the LED',
    body: `<p>GPIO 2 is a strapping pin and also drives the onboard blue LED on many boards. It works, but if
    you see odd boot behaviour, move the status LED.</p>` }
],

trouble: [
  { q: 'ESP32 will not boot, or boots into flash mode by itself',
    a: `Something is holding a strapping pin (0, 2, 5, 12, 15) at boot. The relay module's IN pin can do this
    if you used one of those. Move to GPIO 26/27 as specified.` },
  { q: 'Relay clicks but the lamp does not come on',
    a: `With the mains disconnected, put the multimeter on continuity across COM and NO and switch it - it
    should beep when on. If it does, the fault is in the mains wiring or the lamp. If it does not, the relay
    contacts have failed or you are on NC instead of NO.` },
  { q: 'Board resets every time the relay switches',
    a: `Coil inrush pulling down the shared 5&nbsp;V. Add a 470&nbsp;&micro;F capacitor across the 5&nbsp;V rail
    at the relay board, and use a supply with real headroom. If it persists, power the relay module from its own
    5&nbsp;V supply and remove the JD-VCC jumper so only the optocoupler is shared.` },
  { q: 'Web page loads but MQTT never connects',
    a: `Broker address, port, or credentials. Watch the Serial Monitor - <code>mqtt... failed</code> repeating
    means it reached the point of trying. Check the broker allows anonymous connections if you left user and
    password empty.` },
  { q: 'Home Assistant does not find it',
    a: `MQTT discovery must be enabled in the HA MQTT integration, and the topic prefix must be
    <code>homeassistant</code>. Use MQTT Explorer to confirm the retained config message is actually on the
    broker.` },
  { q: 'Button triggers several times per press',
    a: `Raise <code>DEBOUNCE_MS</code> to 80. A long cable to a panel button picks up noise; a 100&nbsp;nF
    capacitor across the button contacts helps too.` },
  { q: 'Works for hours then stops responding',
    a: `Wi-Fi dropped and never came back. Add a check in <code>loop()</code>: if
    <code>WiFi.status() != WL_CONNECTED</code> for more than 60 seconds, call <code>ESP.restart()</code>.
    Crude and completely effective.` }
],

next: `
<ul>
  <li><strong>Measure what it is switching</strong> by adding a current clamp - see the
  <a href="project.html?p=mains-energy-monitor">energy monitor</a>.</li>
  <li><strong>Add a schedule</strong> using NTP time, so the lamp comes on at sunset without any home
  automation server at all.</li>
  <li><strong>Four channels</strong>: swap for a 4-channel relay board and four GPIOs, and publish four
  discovery topics in a loop.</li>
  <li><strong>Flash ESPHome or Tasmota instead</strong> of this sketch once you have understood it - both give
  you OTA updates, a proper config system, and integrations you do not have to maintain.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Mains electricity kills people. Read all of this.</span>
<p>230&nbsp;V (or 120&nbsp;V) at the currents available from a wall socket will stop a heart. It is not like the
rest of this site. If any of the following is not comfortably true for you, build the 12&nbsp;V version or use
a commercial smart plug instead:</p>
<ul>
  <li><strong>Never work on it plugged in.</strong> Unplug at the wall, and verify with a non-contact tester
  <em>and</em> a multimeter before touching anything.</li>
  <li><strong>Check the relay's rating against the load.</strong> A module marked 10&nbsp;A 250&nbsp;VAC is
  realistically good for about 3&nbsp;A resistive. A kettle or a heater is far beyond it. Lamps and small
  appliances only.</li>
  <li><strong>Switch live, never neutral.</strong> Switching neutral leaves the appliance live when "off".</li>
  <li><strong>Earth is never switched and never omitted.</strong> Pass it straight through to any
  metal-bodied appliance.</li>
  <li><strong>Screw terminals and ferrules, not solder.</strong> Soldered mains joints creep and loosen.</li>
  <li><strong>Everything in a closed plastic box</strong>, with a cable gland and strain relief. No exposed
  conductors, no metal fixings near mains terminals, screws not clips.</li>
  <li><strong>Maintain clearance.</strong> Keep at least 8&nbsp;mm between mains tracks and anything
  low-voltage. Do not run mains through a breadboard, a dupont connector, or perfboard tracks.</li>
  <li><strong>Plug it into an RCD/GFCI-protected circuit</strong> while testing, and ideally forever.</li>
  <li><strong>Do not put it in a wall.</strong> Fixed wiring is regulated in most countries - Part P in England
  and Wales, NEC-based codes in the US - and a home-built device in a wall box will not be covered by your
  insurance. A plug-in box on a flex is a different matter.</li>
  <li><strong>Never leave it running unattended</strong> until it has run supervised for a good while.</li>
</ul>
<p>The honest summary: the low-voltage half of this project is a lovely afternoon. The mains half is
electrical work, and there is no shame at all in stopping at the relay's screw terminals and having a qualified
electrician do the rest - or in switching a 12&nbsp;V LED strip instead and getting the same satisfaction with
none of the risk.</p>
</div>`
});
