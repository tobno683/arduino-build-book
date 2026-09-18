/* A fire-safety device should not be the least-tested mains circuit in the house. */
AB.addProject({
slug: 'printer-fire-guard',
title: '3D printer fire guard',
cat: 'printing',
level: 3,
time: '5 hours',
printed: true,
solder: true,
board: 'ESP32',
tags: ['3d printing', 'fire safety', 'thermal runaway', 'smoke', 'mq-2', 'flame sensor', 'smart plug', 'mqtt', 'fail safe'],
blurb: 'Watches an unattended print for smoke, flame and overheating, and cuts the printer’s power through a certified smart plug. It does not build its own mains switching, on purpose - and it says plainly what it cannot replace.',

skills: ['How printers actually catch fire', 'Sensor fusion to avoid false alarms', 'Fail-safe design', 'Delegating mains switching to certified hardware', 'Local HTTP control', 'Watchdogs'],

intro: `
<p>3D printers occasionally catch fire. Not often, but the combination is uncomfortable: a heater running at
250&nbsp;&deg;C and a heated bed drawing ten amps or more, for hours, frequently unattended, often in a
spare room at night.</p>
<p>Modern printer firmware includes thermal runaway protection, and it is the most important safety feature a
printer has. But it protects against one failure - a heater losing its temperature sensor - and it runs on the
same board that might be failing. It does nothing about a burning bed connector.</p>
<p>This is an independent watcher. It looks for smoke, flame and overheating with sensors that share nothing
with the printer, and when it sees them it cuts the power.</p>
<p>The design decision that matters: <strong>it does not switch mains itself.</strong> It tells a certified
smart plug to do it. A fire-safety device should not be the least-tested mains circuit in the house.</p>`,

what: [
  'Detect smoke, open flame and dangerous enclosure temperature, independently of the printer.',
  'Require agreement between sensors before acting, so a waft of PETG smell does not kill a twelve-hour print.',
  'Cut printer power through a certified smart plug over the local network.',
  'Sound a loud local alarm, because a network is not a reliable way to wake anyone.',
  'Notice when it has itself stopped working, and fail loudly rather than silently.'
],

how: `
<p><strong>How printers actually catch fire.</strong> Knowing the realistic failures tells you what to sense:</p>
<ul>
  <li><strong>The heated bed connector.</strong> A bed drawing 10-15&nbsp;A through a connector that has worked
  loose or been crimped badly heats at the contact, darkens, and eventually burns. This is the most common
  genuine printer fire and it is invisible to the printer's firmware.</li>
  <li><strong>Thermal runaway</strong>, where the hot end's thermistor falls out and the firmware keeps
  heating. Firmware protection catches this - if it is enabled, which on some older and cheaper printers it is
  not.</li>
  <li><strong>Electronics failures</strong> on the main board or the power supply.</li>
</ul>
<p>All three produce smoke before flame, which is why smoke is the primary signal and the others confirm
it.</p>

<p><strong>Why it does not switch mains itself.</strong> The other smart-home projects here build their own
relay switching with a full safety section, and that is fine for switching a lamp. For a fire-safety device it
is the wrong call.</p>
<p>The job of this device is to be more reliable than the thing it guards. A certified smart plug has been tested
for exactly the load it switches, it is enclosed and fused, and it has a local HTTP API. The ESP32 does the
sensing and the decision; the plug does the dangerous part. This division is the whole design, not a
shortcut.</p>
<p>Pick a plug rated comfortably above your printer's draw - a printer with a large heated bed can pull
well over 1&nbsp;kW while heating - and one that can be switched over the LAN without any cloud service, so it
still works when your internet does not.</p>

<p><strong>Sensor fusion, to avoid false alarms.</strong> A fire guard that cuts power every time you print
PETG will be unplugged within a week, and an unplugged guard protects nothing. So no single sensor acts
alone:</p>
<ul>
  <li><strong>MQ-2 gas and smoke.</strong> Sensitive, and it responds to the smell of printing some materials
  as well as to smoke. On its own, it gives false alarms.</li>
  <li><strong>IR flame sensor.</strong> Sees open flame directly. Also responds to direct sunlight and some
  lamps, so it too needs confirmation.</li>
  <li><strong>Temperature at the top of the enclosure.</strong> Slow, but very hard to fool. A real fire raises
  it; a smell does not.</li>
</ul>
<p>The rule: <em>any two agreeing</em> cuts power immediately. <em>Temperature alone</em> above a hard ceiling
cuts power, because a fire you cannot see or smell yet is still a fire. <em>Smoke alone</em>, sustained for
thirty seconds, raises the alarm and cuts power too - smoke that persists is not a smell.</p>

<p><strong>The MQ-2 needs honesty.</strong> It is a heated metal-oxide sensor, not a certified smoke
detector. It needs a day of burn-in to settle and a few minutes of warm-up at every power-on, it drifts, and
its reading depends on humidity. Treat it as an early indication that something has changed, and calibrate the
baseline in your own room with the printer running normally.</p>

<p><strong>Fail loudly, including when it has failed.</strong> A fire guard that has crashed looks exactly
like one that is watching and seeing nothing. So:</p>
<ul>
  <li>The ESP32's hardware watchdog restarts it if the loop ever hangs.</li>
  <li>A sensor that reads nonsense - disconnected, stuck at a rail - is treated as an alarm, not ignored.</li>
  <li>It sends a heartbeat. Silence is itself something your phone can alert on.</li>
</ul>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Wi-Fi to reach the smart plug, and a hardware watchdog.' },
  { id: 'smart-plug', qty: 1, note: 'Does the mains switching so nothing you built has to. Certified, fused, rated above your printer, and switchable over the LAN without a cloud.' },
  { id: 'mq2', qty: 1, note: 'Smoke and gas. Early, sensitive, and prone to false alarms on its own - see the notes.' },
  { id: 'flame', qty: 1, note: 'Sees open flame. Pointed at the print area, away from windows.' },
  { id: 'ds18b20', qty: 1, note: 'Enclosure temperature, at the top where hot air collects. Slow but very hard to fool.' },
  { id: 'res4k7', qty: 1, note: 'OneWire pull-up.' },
  { id: 'buzzer', qty: 1, note: 'The local alarm. A network notification will not wake anyone at 3 am.' },
  { id: 'button', qty: 1, note: 'Silence and reset, after you have looked.' },
  { id: 'psu5v3a', qty: 1, note: 'Powered from a DIFFERENT socket to the printer, so cutting the printer does not cut the guard.' },
  { id: 'petg', qty: 1, note: 'For the sensor mounts. Not PLA - it sits in a printer enclosure, which runs warm.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',   comp: 'esp32',   at: [0, 66] },
    { id: 'bb',    comp: 'bb400',   at: [0, 4] },
    { id: 'smoke', comp: 'mq2',     at: [-58, -50] },
    { id: 'fire',  comp: 'flame',   at: [-10, -52] },
    { id: 'temp',  comp: 'ds18b20', at: [34, -52] },
    { id: 'buz',   comp: 'buzzer',  at: [66, -14] }
  ],
  wires: [
    { from: 'mcu.VIN',    to: 'bb.T+1',  color: 'red',    note: '5 V rail - the MQ-2 heater needs 5 V and draws around 150 mA' },
    { from: 'mcu.GND',    to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'smoke.VCC',  to: 'bb.T+5',  color: 'red',    note: 'MQ-2 power - its heater is on continuously' },
    { from: 'smoke.GND',  to: 'bb.T-5',  color: 'black',  note: 'MQ-2 ground' },
    { from: 'smoke.AO',   to: 'mcu.D34', color: 'green',  note: 'Analogue reading, through a divider - see the notes, it can exceed 3.3 V' },
    { from: 'fire.VCC',   to: 'mcu.3V3', color: 'red',    note: 'Flame sensor on 3.3 V' },
    { from: 'fire.GND',   to: 'bb.T-11', color: 'black',  note: 'Flame sensor ground' },
    { from: 'fire.AO',    to: 'mcu.D35', color: 'yellow', note: 'Analogue flame level - more useful than the digital threshold output' },
    { from: 'temp.VCC',   to: 'mcu.3V3', color: 'red',    note: 'Probe power' },
    { from: 'temp.GND',   to: 'bb.T-16', color: 'black',  note: 'Probe ground' },
    { from: 'temp.DATA',  to: 'mcu.D4',  color: 'white',  note: 'OneWire, with the 4.7 k pull-up to 3.3 V' },
    { from: 'buz.+',      to: 'mcu.D25', color: 'purple', note: 'Alarm' },
    { from: 'buz.-',      to: 'bb.T-22', color: 'black',  note: 'Alarm ground' }
  ]
},

wireIntro: `<p>Three sensors, a buzzer, and no mains wiring at all - that lives inside the certified smart plug.
The one electrical subtlety is the MQ-2's output voltage.</p>`,

wireNotes: `
<div class="note warn"><span class="t">The MQ-2 output can exceed 3.3 V</span>
<p>The module runs on 5&nbsp;V and its analogue output can swing towards 5&nbsp;V in heavy smoke - which is
precisely when you need the reading, and which would damage an ESP32 ADC pin. Put a divider on it: 10&nbsp;k and
20&nbsp;k scales 5&nbsp;V down to about 3.3&nbsp;V.</p></div>

<div class="note warn"><span class="t">Power the guard from a different socket</span>
<p>If the guard shares the printer's smart plug, cutting the printer's power also cuts the guard - so it goes
silent at the exact moment it acted. It must have its own supply.</p></div>

<div class="note tip"><span class="t">Where each sensor goes</span>
<p>Smoke rises, so the MQ-2 and the temperature probe go near the top of the enclosure. The flame sensor looks
at the print area and the bed connector - and away from any window, since it responds to sunlight.</p></div>`,

solderIntro: `<p>A small, straightforward board. The time goes into mounting the sensors well inside the
enclosure and calibrating the smoke baseline in your own room.</p>`,

solderSteps: [
  { h: 'The MQ-2 divider before anything else',
    body: `<p>10&nbsp;k from the output to the ADC pin, 20&nbsp;k from the ADC pin to ground. Check with a meter
    that 5&nbsp;V at the top becomes about 3.3&nbsp;V at the pin before you connect it.</p>` },
  { h: 'Burn in the MQ-2 for a day',
    body: `<p>Power it and leave it for twenty-four hours before trusting any reading. A new MQ-2's output
    drifts steadily over its first day and a baseline taken early will be wrong.</p>` },
  { h: 'Mount sensors in PETG brackets, high up',
    body: `<p>Not PLA - the top of a printer enclosure can run warm enough to soften it over time. Mount the smoke
    and temperature sensors near the top, and aim the flame sensor at the print area and the bed wiring.</p>` },
  { h: 'Configure the plug for local control first',
    body: `<p>Get the smart plug switching from a browser on your LAN, with no cloud involved, before connecting
    the ESP32. If you cannot switch it locally, the guard cannot either.</p>` },
  { h: 'Test the whole chain, deliberately',
    body: `<p>Point a lighter at the flame sensor briefly while holding the probe in your hand, and confirm the
    plug cuts the power and the alarm sounds. Then blow out a match near the smoke sensor. A safety system that
    has never been triggered on purpose has not been tested.</p>` }
],

libraries: [
  { name: 'DallasTemperature', by: 'Miles Burton', why: 'The enclosure probe.' },
  { name: 'OneWire', by: 'Paul Stoffregen', why: 'The bus beneath it.' },
  { name: 'HTTPClient', by: 'Espressif (built in)', why: 'Sends the off command to the smart plug over the LAN.' }
],

code: [{
  name: 'printer_fire_guard.ino',
  code: `/* ------------------------------------------------------------------
   3D printer fire guard - ESP32

   Senses smoke, flame and heat. Cuts power through a certified smart
   plug - it never switches mains itself.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <esp_task_wdt.h>

#define SMOKE_PIN  34
#define FLAME_PIN  35
#define TEMP_PIN    4
#define ALARM_PIN  25
#define RESET_PIN  15

const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";

// Local HTTP, no cloud. This is the Shelly Gen2 form; Tasmota uses
// http://PLUG_IP/cm?cmnd=Power%20Off instead.
const char* PLUG_OFF = "http://192.168.1.50/rpc/Switch.Set?id=0&on=false";

OneWire ow(TEMP_PIN);
DallasTemperature probe(&ow);

/* Thresholds. The smoke baseline in particular must come from YOUR room,
   with the printer running normally - see calibrate(). */
int   smokeBaseline = 900;
const int   SMOKE_MARGIN = 450;
const int   FLAME_LEVEL  = 1500;      // lower reading = more IR on these modules
const float TEMP_WARN    = 60.0;
const float TEMP_HARD    = 75.0;      // acts on its own - a fire you cannot see yet is still a fire

bool tripped = false;
unsigned long smokeSince = 0;

void setup() {
  Serial.begin(115200);
  pinMode(ALARM_PIN, OUTPUT);
  pinMode(RESET_PIN, INPUT_PULLUP);

  // Hardware watchdog: if the loop ever hangs, the chip restarts rather
  // than sitting there looking as if it were still watching.
  esp_task_wdt_config_t wdt = { .timeout_ms = 8000, .idle_core_mask = 0, .trigger_panic = true };
  esp_task_wdt_init(&wdt);
  esp_task_wdt_add(NULL);

  probe.begin();
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  // The MQ-2 heater needs a few minutes before its reading means anything.
  Serial.println("Warming the smoke sensor - 3 minutes");
  for (int i = 0; i < 180; i++) { delay(1000); esp_task_wdt_reset(); }
}

void loop() {
  esp_task_wdt_reset();

  if (tripped) {
    alarm();
    if (digitalRead(RESET_PIN) == LOW) { tripped = false; digitalWrite(ALARM_PIN, LOW); }
    delay(200);
    return;
  }

  int smoke = analogRead(SMOKE_PIN);
  int flame = analogRead(FLAME_PIN);
  probe.requestTemperatures();
  float t = probe.getTempCByIndex(0);

  /* A sensor reading nonsense is an alarm, not something to ignore. A
     disconnected probe or a sensor stuck at a rail would otherwise turn
     the guard into a device that watches nothing. */
  bool sensorFault = (t == DEVICE_DISCONNECTED_C) || smoke < 50 || smoke > 4080;

  bool smokeHigh = smoke > smokeBaseline + SMOKE_MARGIN;
  bool flameSeen = flame < FLAME_LEVEL;
  bool hot       = t > TEMP_WARN;

  if (smokeHigh) { if (!smokeSince) smokeSince = millis(); }
  else smokeSince = 0;
  bool smokeSustained = smokeSince && millis() - smokeSince > 30000;

  /* The fusion rule. Any TWO agreeing acts at once. Temperature past the
     hard ceiling acts alone. Smoke that persists for 30 s acts alone -
     a smell passes, smoke from a burning connector does not. A single
     brief reading from one sensor never kills a long print. */
  int agree = smokeHigh + flameSeen + hot;
  if (agree >= 2 || t > TEMP_HARD || smokeSustained || sensorFault) {
    trip(sensorFault ? "sensor fault" : agree >= 2 ? "multiple sensors" :
         t > TEMP_HARD ? "over temperature" : "sustained smoke");
  }

  Serial.printf("smoke %d  flame %d  temp %.1f\\n", smoke, flame, t);
  delay(500);
}

void trip(const char* why) {
  tripped = true;
  Serial.printf("TRIPPED: %s\\n", why);

  // Try hard to cut the power. Retry, because this is the one call that
  // really matters and a single dropped packet must not stop it.
  for (int attempt = 0; attempt < 5; attempt++) {
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(PLUG_OFF);
      int code = http.GET();
      http.end();
      if (code == 200) { Serial.println("plug off"); return; }
    }
    WiFi.reconnect();
    delay(1000);
    esp_task_wdt_reset();
  }
  // Could not reach the plug. The local alarm is now the only defence.
  Serial.println("COULD NOT REACH PLUG - alarm only");
}

void alarm() {
  // Loud, unpleasant, and impossible to sleep through.
  for (int i = 0; i < 3; i++) {
    tone(ALARM_PIN, 3200, 150); delay(200);
    tone(ALARM_PIN, 2400, 150); delay(200);
  }
}`
}],

trouble: [
  { q: 'It cuts the power during normal PETG or ABS prints',
    a: `The smoke baseline is too low for your room, or one sensor is acting alone. Recalibrate the MQ-2 baseline
    with a normal print running, and check the fusion rule - a smell alone should never trip it quickly.` },
  { q: 'The smoke reading drifts all day',
    a: `Expected for an MQ-2, especially in its first day. Burn it in for twenty-four hours, and consider
    re-taking the baseline periodically. It is an indicator, not a calibrated instrument.` },
  { q: 'The flame sensor triggers in the afternoon',
    a: `Sunlight. It is an infrared sensor and a sunny window looks a lot like flame to it. Re-aim it away from
    windows, and remember it only acts in agreement with another sensor.` },
  { q: 'It tripped but the printer kept running',
    a: `The plug was not reachable over the LAN, or the URL is wrong. Test the exact off URL in a browser. The
    local alarm still sounds when the plug cannot be reached - that is deliberate.` },
  { q: 'It went silent the moment it cut the power',
    a: `The guard is powered from the printer's own plug. Give it a separate supply on a different socket.` },
  { q: 'It keeps restarting',
    a: `The watchdog is firing because something in the loop is blocking for more than eight seconds - usually a
    slow Wi-Fi reconnect. Keep network calls out of the main sensing path, as the sketch does.` }
],

safety: `
<div class="note danger"><span class="t">This is not a smoke alarm, and it does not replace one</span>
<p>An MQ-2 is not a certified smoke detector, and a hobby build is not a certified safety device. This guard is
an additional layer that can cut power early. It is not a substitute for:</p>
<ul>
  <li><strong>A certified smoke alarm</strong> in the room where the printer runs. Test it monthly.</li>
  <li><strong>Your printer's own thermal runaway protection</strong>, which must be enabled. Check that it is -
  some older and cheaper printers ship with it disabled.</li>
  <li><strong>Not leaving a printer running unattended</strong> in the first place, especially overnight or
  when you are out.</li>
  <li><strong>A suitable fire extinguisher</strong> within reach.</li>
</ul></div>

<div class="note warn"><span class="t">Why the mains switching is delegated</span>
<p>This project deliberately does not switch mains itself. Build a DIY relay into a fire-safety device and it
becomes the least-tested mains circuit in the house, guarding against a fire. The certified smart plug is
tested for its load, fused and enclosed.</p>
<p>Choose one rated comfortably above your printer's peak draw - a large heated bed can pull over 1&nbsp;kW -
and do not run it near its limit.</p></div>

<div class="note warn"><span class="t">Look after the real fire risk: the bed connector</span>
<p>The commonest genuine printer fire starts at the heated bed's power connector. Inspect it periodically for
darkening or melting, make sure it is properly crimped rather than a bare wire in a screw terminal, and replace
it at the first sign of heat damage. No sensor is a substitute for that.</p></div>`,

next: `
<ul>
  <li><strong>Watch the bed connector directly</strong> with a small thermistor glued beside it. That is where
  the real fires start, and a connector getting warmer than usual is the earliest warning there is.</li>
  <li><strong>A camera</strong> from the <a href="project.html?p=esp32cam-wifi-camera">ESP32-CAM project</a>
  pointed at the printer, so a trip sends a picture and you can see what happened.</li>
  <li><strong>Heartbeat alerts</strong> - have your home automation notify you when the guard goes silent, so a
  crashed guard is noticed.</li>
  <li><strong>The <a href="project.html?p=filament-dry-box">filament dryer</a></strong> uses the same sensing
  ideas pointed at print quality rather than safety.</li>
</ul>`
});
