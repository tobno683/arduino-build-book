/* A battery sensor that sleeps for months and wakes on a flap. */
AB.addProject({
slug: 'letterbox-notifier',
title: 'Letterbox notifier',
cat: 'smart-home',
level: 2,
time: '3 hours',
solder: true,
board: 'ESP8266',
tags: ['deep sleep', 'reed switch', 'battery', 'notification', 'interrupt wake', 'esp8266', 'low power'],
blurb: 'Tells your phone when the post arrives. Genuinely useful if your letterbox is at the end of a drive, and the best small lesson in interrupt-driven deep sleep in this book.',

skills: ['Interrupt wake from sleep', 'Reset-pin wake on ESP8266', 'Battery budgeting', 'Debounce in hardware', 'Push notifications'],

intro: `
<p>A small project with one genuinely instructive idea: the device is <em>completely off</em> until something
physical happens, and the thing that turns it on is the letterbox flap.</p>
<p>Not sleeping and polling. Not waking every ten minutes to check. Off - drawing a few microamps - until a
magnet moves past a reed switch and pulls the reset pin low. Then it boots, connects, sends a message and
switches itself off again. Eight seconds of work, and months between them.</p>
<p>That pattern is the right answer for a whole class of sensors: doors, gates, mousetraps, water butts,
anything that is an event rather than a measurement. Once you have built it once you will use it
repeatedly.</p>`,

what: [
  'Send a phone notification within about ten seconds of the letterbox opening.',
  'Draw almost nothing between events - months on a pair of AA cells.',
  'Wake on the flap itself rather than by polling.',
  'Debounce a mechanical switch that will otherwise report five deliveries for one.',
  'Report its own battery voltage with each message, so you know when to change the cells.',
  'Send a weekly heartbeat, so a silent sensor is distinguishable from a quiet week.'
],

how: `
<p><strong>Deep sleep on an ESP8266 is different from an ESP32.</strong> The ESP32 has several wake sources
and a proper RTC domain. The ESP8266 has essentially one useful mechanism: the RTC timer pulls
<strong>GPIO16</strong> low, and GPIO16 is wired to <strong>RST</strong>. The chip resets and the sketch runs
from the top.</p>
<p>That gives you a timer wake, which is not what we want. But it also tells you how to get an <em>external</em>
wake: anything that pulls RST low wakes it. A reed switch from RST to ground is the entire mechanism.</p>
<p>So the design is: <code>ESP.deepSleep(0)</code> - sleep forever, no timer - and a switch on the reset pin.
Current drops to about 20&nbsp;uA. The flap closes the switch, the chip resets, and <code>setup()</code>
runs.</p>

<p><strong>Why a reed switch rather than a microswitch.</strong> A reed switch is a sealed glass capsule with
two contacts that close near a magnet. No moving parts exposed to weather, nothing to wear, nothing for a
spider to jam. A magnet glued to the flap and the reed on the frame.</p>
<p>A microswitch works and is a mechanical part in a letterbox, which is somewhere cold, damp and full of
grit.</p>

<p><strong>Debouncing a switch that resets the chip.</strong> Mechanical contacts bounce for a few
milliseconds, and a magnet swinging past can close the switch several times. Each one is a reset.</p>
<p>You cannot debounce in software, because the software is not running - each bounce is a fresh boot. So it
has to be hardware: a capacitor across the switch, and a series resistor so the capacitor cannot dump its
charge straight into the reset pin.</p>
<p>The sketch also tracks the last wake time in RTC memory, which survives deep sleep, and ignores an event
within 60 seconds of the previous one. Between the two, one delivery produces one message.</p>

<p><strong>Where the time goes.</strong> About eight seconds awake: two to boot, four to associate with
Wi-Fi, one to send, one to shut down. At roughly 80&nbsp;mA that is 0.18&nbsp;mAh per event.</p>
<p>Two deliveries a day is 0.36&nbsp;mAh, plus sleep at 20&nbsp;uA which is 0.48&nbsp;mAh a day. So the
<em>sleeping</em> costs more than the events. A pair of AA cells at 2500&nbsp;mAh is around eight months,
and the limiting factor is the self-discharge of the cells rather than the circuit.</p>`,

bom: [
  { id: 'esp8266', qty: 1, note: 'A bare ESP-12F is much better than a D1 Mini here - see the tuning notes. The D1 Mini’s regulator and USB chip are most of the sleep current.' },
  { id: 'reed', qty: 1, note: 'Normally-open, with a magnet. The glass ones are fragile until mounted - handle the leads gently and do not bend them at the glass.' },
  { id: 'magnet', qty: 1, note: 'A small neodymium disc, glued to the flap. Anything that gets within 10 mm of the reed works.' },
  { id: 'cap100n', qty: 1, note: 'Across the reed switch, for the bounce. This one is doing real work.' },
  { id: 'res10k', qty: 3, note: 'One in series with the reset line, two for the battery divider.' },
  { id: 'batt-aa2', qty: 1, note: 'Two AA cells. Lithium AAs cost more and work at -20 C, which a letterbox reaches.' },
  { id: 'ams1117', qty: 1, note: 'Only if your cells go above 3.6 V. Two alkaline AAs at 3.0 V feed an ESP-12F directly, which is far better than regulating.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'box-abs', qty: 1, note: 'Small, and it lives in a letterbox. Somewhere the post will not land on it.' },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', note: 'Microamp range. The whole project is a current measurement.' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp8266', at: [0, 36] },
    { id: 'bb',   comp: 'bb400',   at: [0, -20] },
    { id: 'reed', comp: 'reed',    at: [-40, -70] },
    { id: 'batt', comp: 'batt2aa', at: [34, -72] }
  ],
  wires: [
    { from: 'batt.+',  to: 'bb.T+2',   color: 'red',    note: 'Two AA cells straight to the rail - 3.0 V suits an ESP-12F with no regulator' },
    { from: 'batt.-',  to: 'bb.T-2',   color: 'black',  note: 'Battery negative' },
    { from: 'mcu.3V3', to: 'bb.T+6',   color: 'red',    note: 'Module supply' },
    { from: 'mcu.GND', to: 'bb.T-6',   color: 'black',  note: 'Module ground' },
    { from: 'reed.A',  to: 'mcu.RST',  color: 'green',  note: 'THE WAKE MECHANISM. Reed closing pulls RST low and the chip boots. 10 k in series' },
    { from: 'reed.B',  to: 'bb.T-12',  color: 'black',  note: 'Other side of the reed to ground, with 100 nF across the switch for the bounce' },
    { from: 'mcu.A0',  to: 'bb.T+16',  color: 'brown',  note: 'Battery sense from a divider. The ESP8266 ADC reads 0-1 V, so size it accordingly' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">A resistor in series with the reset line. Not a bare switch.</span>
<p>A switch directly from RST to ground works, and the 100&nbsp;nF debounce capacitor then discharges through
the reset pin every time the contacts close. That current spike is out of spec and damages the pin over
months.</p>
<p><strong>10&nbsp;k in series</strong> between the switch and RST limits it. The internal pull-up on RST is
around 12&nbsp;k, so 10&nbsp;k still pulls the pin well below the reset threshold.</p></div>

<div class="note warn"><span class="t">Debounce in hardware, because software is not running</span>
<p>100&nbsp;nF across the reed switch. Every bounce is a separate reset and a separate notification, and
there is no sketch alive to filter them - the sketch <em>is</em> the thing being restarted.</p>
<p>The capacitor holds the line through the bounce. The 60-second lockout in RTC memory catches what the
capacitor misses, and you need both.</p></div>

<div class="note warn"><span class="t">GPIO16 must NOT be connected to RST here</span>
<p>The standard ESP8266 deep-sleep wiring joins GPIO16 to RST so the RTC timer can wake the chip. This project
uses <code>deepSleep(0)</code> - sleep forever - and wakes on the external switch instead.</p>
<p>If GPIO16 is wired to RST as well, it will also work, and you lose nothing. But if you are using a D1 Mini
with that link already fitted, be aware the timer is available and the sketch does not use it.</p></div>

<div class="note tip"><span class="t">Two alkaline AAs feed an ESP-12F directly</span>
<p>3.0&nbsp;V fresh, down to about 2.4&nbsp;V flat. The ESP8266 wants 3.0-3.6&nbsp;V and works down to about
2.7.</p>
<p>So no regulator - which removes its quiescent current entirely, and a regulator's quiescent draw is often
larger than the whole sleep budget. You lose the last of the cells' capacity below 2.7&nbsp;V, which is a good
trade.</p></div>`,

solderSteps: [
  { h: 'Reed switch leads, handled gently',
    body: `<p>The glass capsule cracks if you bend the leads at the seal. Hold the lead with pliers between
    the glass and the bend, and bend beyond the pliers.</p>
    <p>Solder to stranded wire long enough to reach the frame, heatshrink each joint, and sleeve the pair.</p>` },
  { h: 'The debounce capacitor at the switch',
    body: `<p>100&nbsp;nF directly across the reed switch's own terminals, before the wires. Putting it at the
    board instead leaves the lead inductance in the path and works less well.</p>` },
  { h: 'Series resistor at the board',
    body: `<p>10&nbsp;k between the incoming reed wire and the module's RST pin. Short lead, on the board.</p>` },
  { h: 'Battery divider sized for a 1 V ADC',
    body: `<p>The ESP8266's ADC reads 0-1&nbsp;V, not 0-3.3. A D1 Mini has a divider fitted already; a bare
    ESP-12F does not.</p>
    <p>For a 3.3&nbsp;V maximum: 220&nbsp;k and 100&nbsp;k gives about 1.03&nbsp;V at full scale, and draws
    10&nbsp;uA - which at this power budget is significant, so use the largest values that still read
    stably.</p>` },
  { h: 'Measure the sleep current before it goes in the box',
    body: `<p>Meter in series with the battery, microamp range, device asleep.</p>
    <p>A bare ESP-12F should read 15-25&nbsp;uA. A D1 Mini will read 300&nbsp;uA or more because of its
    regulator and USB chip. Find this out now, not in six weeks.</p>` },
  { h: 'Mount it where the post will not land on it',
    body: `<p>Magnet on the flap, reed on the frame, gap under 10&nbsp;mm when closed. The electronics in a
    small box screwed to the side or above, not in the path of anything coming through.</p>` }
],

assembly: [
  { h: 'Prove the wake mechanism with nothing else connected',
    body: `<p>Module, battery, reed switch. A sketch that does nothing but print "awake" and sleep forever.</p>
    <p>Wave the magnet past. It should print "awake" once per pass. If it prints three times, the debounce
    capacitor is missing or too small.</p>` },
  { h: 'Set up the notification service',
    body: `<p>Pushover, Telegram or ntfy.sh - all take a single HTTPS request with no account infrastructure of
    your own. ntfy.sh is the simplest: one POST to a topic URL you invent.</p>
    <p>Test it with curl from a laptop first.</p>` },
  { h: 'Measure how long it stays awake',
    body: `<p>The sketch prints elapsed milliseconds before sleeping. You want under ten seconds.</p>
    <p>Almost all of it is Wi-Fi association. The tuning section has the fix, and it is worth the effort -
    it roughly halves the awake time and therefore the battery cost per event.</p>` },
  { h: 'Fit the magnet and the reed, and check the gap',
    body: `<p>Magnet on the moving flap, reed on the fixed frame, aligned so they are closest when the flap is
    shut. Most reeds close within 10-15&nbsp;mm of a small neodymium disc.</p>
    <p>Test by opening the flap slowly and watching for the wake. You want it to trigger reliably at the point
    the flap starts moving.</p>` },
  { h: 'Live with it for a week',
    body: `<p>What you are checking: one notification per delivery, none spurious, and the battery voltage in
    each message barely moving.</p>
    <p>A letterbox that reports three times per post needs a bigger debounce capacitor or a longer lockout.</p>` }
],

libraries: [
  { name: 'ESP8266WiFi', by: 'Espressif', how: 'Part of the board package', why: 'The network.' },
  { name: 'ESP8266HTTPClient', by: 'Espressif', how: 'Part of the board package', why: 'The notification POST.' }
],

code: [
{
  h: 'The notifier',
  intro: `<p>Short. The interesting parts are the static IP - which halves the awake time - and the RTC memory
  lockout.</p>`,
  name: 'letterbox.ino',
  code: `/* ------------------------------------------------------------------
   Letterbox notifier.

   Sleeps forever. The reed switch pulls RST low, the chip boots,
   setup() runs, a notification goes out, and it sleeps again.

   There is no loop() worth having - the whole program is a boot.
   ------------------------------------------------------------------ */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

const char *WIFI_SSID = "your-ssid";
const char *WIFI_PASS = "your-password";

/* A static IP saves 2-4 SECONDS of awake time per event, because DHCP
   is most of the association delay. At 80 mA that is most of the
   energy cost of a notification. */
IPAddress ip(192, 168, 1, 77);
IPAddress gw(192, 168, 1, 1);
IPAddress mask(255, 255, 255, 0);
IPAddress dns(192, 168, 1, 1);

const char *NTFY_URL = "http://ntfy.sh/your-unique-topic-name";

#define LOCKOUT_S        60      // ignore a second event within this
#define HEARTBEAT_HOURS 168      // weekly "I am alive"

/* RTC memory survives deep sleep. Anything not in here is lost, and
   the sketch has no other way to remember the previous event. */
struct State {
  uint32_t magic;
  uint32_t lastEventS;
  uint32_t lastBeatS;
  uint32_t uptimeS;
  uint16_t events;
};
State st;

#define MAGIC 0x4C425831

void setup() {
  unsigned long t0 = millis();
  Serial.begin(74880);           // the ESP8266's native boot rate
  Serial.println(F("\\nawake"));

  ESP.rtcUserMemoryRead(0, (uint32_t *)&st, sizeof(st));
  if (st.magic != MAGIC) {
    st = { MAGIC, 0, 0, 0, 0 };
    Serial.println(F("first boot"));
  }

  /* We have no real clock, so time is accumulated across sleeps: each
     wake adds its own awake time. It drifts, and for a lockout and a
     weekly heartbeat that is entirely good enough. */
  uint32_t nowS = st.uptimeS;

  bool heartbeat = (nowS - st.lastBeatS) > HEARTBEAT_HOURS * 3600UL;
  bool locked    = (nowS - st.lastEventS) < LOCKOUT_S;

  if (locked && !heartbeat) {
    // A bounce, or the flap swinging back. One delivery, one message.
    Serial.println(F("within lockout - ignoring"));
    finish(t0);
  }

  st.lastEventS = nowS;
  if (!heartbeat) st.events++;

  float vbat = readBattery();
  Serial.print(F("battery ")); Serial.println(vbat, 2);

  if (connectWifi()) {
    char msg[140];
    if (heartbeat) {
      st.lastBeatS = nowS;
      snprintf(msg, sizeof(msg),
               "Letterbox sensor alive. %u deliveries, battery %.2f V.",
               st.events, vbat);
    } else {
      snprintf(msg, sizeof(msg),
               "Post has arrived. (%u this period, battery %.2f V)",
               st.events, vbat);
    }
    notify(msg);

    // Warn once while there is still time to do something about it.
    if (vbat < 2.6) notify("Letterbox sensor battery is low.");
  }

  finish(t0);
}

void loop() { }                  // never runs

bool connectWifi() {
  // Static config BEFORE begin(), or it does DHCP anyway.
  WiFi.config(ip, gw, mask, dns);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  for (int i = 0; i < 100; i++) {          // 10 s maximum
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print(F("wifi in ")); Serial.print(i * 100); Serial.println(F(" ms"));
      return true;
    }
    delay(100);
  }
  Serial.println(F("no wifi"));
  return false;
}

void notify(const char *text) {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, NTFY_URL);
  http.addHeader("Title", "Letterbox");
  http.addHeader("Priority", "default");
  int code = http.POST((uint8_t *)text, strlen(text));
  Serial.print(F("notify -> ")); Serial.println(code);
  http.end();
}

float readBattery() {
  // ESP8266 ADC is 0-1 V. With 220k/100k from the cells, full scale
  // is about 3.3 V. Calibrate against a meter once and adjust.
  int raw = analogRead(A0);
  return raw / 1024.0 * 3.3;
}

void finish(unsigned long t0) {
  uint32_t awake = (millis() - t0) / 1000;
  st.uptimeS += (awake > 0 ? awake : 1);
  ESP.rtcUserMemoryWrite(0, (uint32_t *)&st, sizeof(st));

  Serial.print(F("awake for ")); Serial.print(millis() - t0);
  Serial.println(F(" ms - sleeping"));
  Serial.flush();

  /* Zero means sleep indefinitely. The only thing that will wake this
     chip now is something pulling RST low - which is the reed switch
     on the letterbox flap. */
  WiFi.disconnect(true);
  ESP.deepSleep(0);
}`,
  after: `<p><strong>The static IP is the single biggest saving.</strong> DHCP takes two to four seconds and
  that is most of the awake time - so most of the energy per event. Configuring a fixed address roughly halves
  the battery cost of a notification, for three lines.</p>
  <p><strong>Time is accumulated in RTC memory</strong> because there is no clock. Each wake adds its own
  awake duration, which drifts badly over months - and for a 60-second lockout and a roughly-weekly heartbeat,
  that does not matter at all. Knowing which inaccuracies are acceptable is most of low-power design.</p>
  <p><strong>The heartbeat is what makes silence meaningful.</strong> Without it, "no messages" could be a
  quiet week or a flat battery, and you find out which when you stop getting post.</p>`
}],

upload: `
<p>Board: <strong>LOLIN(WEMOS) D1 R2 &amp; mini</strong>, or <strong>Generic ESP8266 Module</strong> for a
bare ESP-12F. Serial Monitor at <strong>74880</strong> - the ESP8266's native boot rate, which also shows you
the bootloader messages.</p>
<div class="note warn"><span class="t">A sleeping ESP8266 cannot be flashed</span>
<p>It is in deep sleep with no timer wake. To reprogram it, trigger the reed switch and start the upload
immediately - the IDE has the eight-second awake window.</p>
<p>Easier: fit a small button across the reed switch contacts, on the board, for exactly this.</p></div>
<div class="note tip"><span class="t">Set the static IP outside your DHCP range</span>
<p>Or reserve it in the router. A static address that the router later hands to a laptop causes an
intermittent failure that is genuinely hard to find.</p></div>`,

tune: [
  { h: 'A bare ESP-12F rather than a D1 Mini',
    body: `<p>The single biggest change. A D1 Mini sleeps at 300&nbsp;uA or more because of its regulator and
    CH340 USB chip; a bare ESP-12F fed directly from two AA cells sleeps at about 20.</p>
    <p>That is eight months instead of three weeks. You need a USB-serial adapter to flash it and the boot
    strapping pins wired correctly - GPIO0 and GPIO2 high, GPIO15 low, CH_PD high.</p>` },
  { h: 'Shortening the awake time further',
    body: `<p>After the static IP, the next win is <code>WiFi.begin(ssid, pass, channel, bssid)</code> -
    telling the chip exactly which channel and access point to use skips the scan entirely.</p>
    <p>Store the channel and BSSID in RTC memory on the first successful connection and reuse them. Typically
    another second saved, and it falls back to a normal scan if the stored values stop working.</p>` },
  { h: 'Lithium AAs for a letterbox',
    body: `<p>A letterbox reaches -10&nbsp;&deg;C in winter, where an alkaline cell's capacity falls sharply
    and its internal resistance rises enough to brown out the Wi-Fi burst.</p>
    <p>Lithium AAs cost three times as much, work to -40, weigh less and self-discharge at about 1% a year.
    For a sensor you want to forget about, they are the right cell.</p>` },
  { h: 'The same pattern, different switch',
    body: `<p>This design is a template. A reed on a gate, a float switch in a water butt, a microswitch on a
    mousetrap, a tilt switch on a bin lid - anything that is an event rather than a measurement.</p>
    <p>Change the switch and the message. Everything else is identical.</p>` },
  { h: 'Tell the difference between post and a flyer',
    body: `<p>You cannot, with one switch. Two reed switches - one on the flap and one on a flap at the back of
    the box - and the order of the two tells you whether something actually landed.</p>
    <p>Each needs its own wake path, which on an ESP8266 means diodes into RST and reading the switch states
    at boot.</p>` }
],

trouble: [
  { q: 'It never wakes',
    a: `Check the reed actually closes with the magnet - a meter on continuity while you wave it past. Then
    check the series resistor is 10&nbsp;k rather than something much larger, and that the other side of the
    switch really reaches ground.` },
  { q: 'It wakes three times per delivery',
    a: `Contact bounce. Increase the debounce capacitor to 220&nbsp;nF or 1&nbsp;uF, and raise
    <code>LOCKOUT_S</code>. Check the capacitor is at the switch, not at the board.` },
  { q: 'It wakes at random with nothing happening',
    a: `Usually a brownout resetting the chip, which looks identical to a switch wake. Measure the battery
    under load - if it dips below about 2.7&nbsp;V during the Wi-Fi burst, the cells are tired or too cold.
    A 470&nbsp;uF capacitor across the supply helps.` },
  { q: 'Battery lasts three weeks, not eight months',
    a: `Measure the sleep current. If it is hundreds of microamps you are on a development board and its
    regulator and USB chip are the load. A bare ESP-12F is the fix and nothing in software substitutes.` },
  { q: 'It takes fifteen seconds to send',
    a: `DHCP, or a Wi-Fi scan. Set a static IP, and store the channel and BSSID. Check the signal at the
    letterbox too - a weak connection retries and each retry is awake time.` },
  { q: 'Cannot reflash it',
    a: `It is asleep. Trigger the reed and start the upload within the awake window, or fit a button across
    the reed contacts.` },
  { q: 'The battery reading is nonsense',
    a: `The ESP8266 ADC reads 0-1&nbsp;V. A D1 Mini has an internal divider and a bare ESP-12F does not, so
    the maths differs between them. Calibrate against a meter and adjust the constant.` }
],

next: `
<ul>
  <li><strong>Same pattern, more places</strong> - the
  <a href="project.html?p=door-window-sensor">door and window sensor</a> uses the same wake mechanism for
  security rather than post.</li>
  <li><strong>No Wi-Fi at the letterbox</strong> - if it is at the end of a drive, an
  <a href="project.html?p=nrf24-sensor-link">nRF24 link</a> to a base indoors reaches further than Wi-Fi and
  uses less power.</li>
  <li><strong>Add a photo</strong> - an <a href="project.html?p=esp32cam-motion-trap">ESP32-CAM</a> woken the
  same way tells you what arrived, not just that something did.</li>
  <li><strong>Really remote</strong> - the
  <a href="project.html?p=nbiot-field-sensor">NB-IoT sensor</a> pattern works for a letterbox on a different
  property entirely.</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">Nothing dangerous, three practical points</span>
<ul>
  <li><strong>Do not obstruct the letterbox.</strong> Post has to come through it and a postal worker should
  not be pushing letters past electronics. Mount to the side or above.</li>
  <li><strong>Neodymium magnets are stronger than they look.</strong> Keep them away from pacemakers, cards
  with magnetic stripes, and small children - swallowed magnets are a serious medical emergency.</li>
  <li><strong>Alkaline cells leak</strong> when fully discharged and left. The low-battery warning exists so
  you change them before that; a leaked cell in a letterbox in January is unpleasant.</li>
  <li><strong>Check your notification service's privacy.</strong> A public ntfy.sh topic is readable by anyone
  who guesses the name - which for "when is this house's post delivered" is worth a moment's thought. Use a
  long random topic name or a service with authentication.</li>
</ul>
</div>`
});
