/* Leak detection with a valve on the end: the one home project that pays for itself. */
AB.addProject({
slug: 'water-leak-alarm',
title: 'Water leak alarm and cutoff',
cat: 'smart-home',
level: 3,
time: '5 hours',
solder: true,
board: 'ESP32',
tags: ['water leak', 'solenoid valve', 'alarm', 'mqtt', 'failsafe', 'corrosion', 'insurance'],
blurb: 'Probes under the washing machine, the boiler and the sink. Water bridges the tracks, a valve shuts, and a notification arrives - before the ceiling comes down.',

skills: ['Conductivity sensing', 'Electrode corrosion', 'Solenoid valve drive', 'Failsafe selection', 'Latching alarms', 'Battery backup'],

intro: `
<p>Escape of water is the most common household insurance claim in most countries and the most expensive
category after fire. A washing machine hose that fails at three in the morning empties into a kitchen for
hours.</p>
<p>The detection is trivially easy: two exposed conductors, and water shorts them. The engineering is in
everything around it - keeping the electrodes from dissolving, deciding what the valve should do when the
power fails, and making sure a device with no lights on is distinguishable from a device that is fine.</p>
<p>This is probably the highest value-per-dollar project in this book, and it is one where getting the
failure behaviour right matters more than getting the feature list long.</p>`,

what: [
  'Watch several places at once - under the sink, behind the washing machine, by the boiler.',
  'Shut a mains water valve within a couple of seconds of detecting water.',
  'Sound a loud local alarm and send a notification, and keep doing both until someone acknowledges.',
  'Survive a power cut long enough to close the valve and shout about it.',
  'Not destroy its own probes through electrolysis, which is what kills most home-built versions in months.',
  'Test itself weekly so you find out it is broken before the leak does.'
],

how: `
<p><strong>Conductivity sensing, and the corrosion problem.</strong> Two tracks on a board, a pull-up, and an
input pin. Water conducts, the pin goes low. Ten cents of hardware.</p>
<p>The trap: leave DC across two electrodes in water and you have built an electroplating cell. One track
dissolves and plates onto the other, and within a few months the probe is a piece of bare fibreglass. Every
home-made leak detector that has quietly stopped working did this.</p>
<p><strong>The fix is to power the probe only while measuring.</strong> Drive the probe's supply from a GPIO
pin, energise it for a couple of milliseconds, read, and switch it off again. Duty cycle of about 0.1%,
corrosion reduced by roughly the same factor, and a probe that lasts years instead of months.</p>

<p><strong>Choosing the valve, which is a failsafe decision.</strong></p>
<ul>
  <li><strong>Normally-closed solenoid</strong> - needs power to stay open. Power fails, water stops. Safest
  for leaks, and it means the valve is energised whenever the water is on, which wastes a few watts
  continuously and makes the coil warm.</li>
  <li><strong>Normally-open solenoid</strong> - needs power to close. Zero standby power, and a power cut
  leaves the water on.</li>
  <li><strong>Motorised ball valve</strong> - motor drives it either way and it stays where it is left. No
  standby power, holds its position through a power cut, and is what most commercial leak systems use. More
  expensive and slower - five to ten seconds to close.</li>
</ul>
<p>The motorised ball valve is the right answer for a real installation. The solenoid in the parts list is
cheaper and fine for learning, and the sketch drives either.</p>
<p><strong>Also check the pressure rating and whether the valve is direct-acting.</strong> Servo-assisted
solenoid valves use line pressure to close and will not shut properly below about 0.3&nbsp;bar - which is
exactly the situation after a pipe has burst.</p>

<p><strong>Latching, because a leak does not un-happen.</strong> When water is detected the alarm latches on
and stays on until a person presses the button. A detector that clears itself when the puddle evaporates has
told you nothing - you come home, everything is quiet, and the floor is ruined.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Wi-Fi for the notification, and enough pins for several probes.' },
  { id: 'water-sens', qty: 4, note: 'One per location. See the wiring notes - these are powered only while being read, or they corrode away.' },
  { id: 'valve12v', qty: 1, note: 'Read the valve section before buying. A motorised ball valve is the better choice for a real install; this is the cheap way to learn.' },
  { id: 'relay1', qty: 1, note: 'Drives the valve. A motorised ball valve needs two relays for open and close - see the tuning notes.' },
  { id: 'float-sw', qty: 1, note: 'Optional. A float switch in a drip tray is far more reliable than a conductivity probe and does not corrode at all.' },
  { id: 'buzzer', qty: 1, note: 'A loud one. The point is to wake someone.' },
  { id: 'button', qty: 1, note: 'Acknowledge and reset. The alarm latches until this is pressed.' },
  { id: 'led5', qty: 2, note: 'Armed and alarm.' },
  { id: 'res220', qty: 2 },
  { id: 'res10k', qty: 4, note: 'Pull-ups for the probe inputs.' },
  { id: 'psu12v2a', qty: 1, note: '12 V for the valve, with 5 V for the logic from a small converter.' },
  { id: 'buck', qty: 1, note: '12 V down to 5 V for the ESP32.' },
  { id: '18650', qty: 1, note: 'Backup. Enough to close the valve and sound the alarm through a power cut.' },
  { id: 'tp4056', qty: 1, note: 'Keeps the backup cell charged. Protected version.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 4, note: 'One per probe lead, plus the valve.' },
  { id: 'box-abs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',     at: [0, 52] },
    { id: 'bb',   comp: 'bb400',     at: [0, -8] },
    { id: 'p1',   comp: 'watersens', at: [-52, -66] },
    { id: 'p2',   comp: 'watersens', at: [-22, -66] },
    { id: 'rly',  comp: 'relay1',    at: [42, -56] },
    { id: 'valve', comp: 'solenoid', at: [42, -100] },
    { id: 'buz',  comp: 'buzzer',    at: [6, -56] },
    { id: 'btn',  comp: 'button',    at: [14, -96] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+2',   color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',  to: 'bb.T-2',   color: 'black',  note: 'Ground rail' },
    { from: 'mcu.D25',  to: 'p1.VCC',   color: 'purple', note: 'PROBE POWER, switched. Held low except during a reading - this is what stops the electrodes dissolving' },
    { from: 'mcu.D25',  to: 'p2.VCC',   color: 'purple', note: 'Same switched supply feeds every probe' },
    { from: 'p1.GND',   to: 'bb.T-8',   color: 'black',  note: 'Probe 1 ground' },
    { from: 'p1.SIG',   to: 'mcu.D32',  color: 'green',  note: 'Probe 1 reading, with a 10 k pull-up to 3.3 V' },
    { from: 'p2.GND',   to: 'bb.T-12',  color: 'black',  note: 'Probe 2 ground' },
    { from: 'p2.SIG',   to: 'mcu.D33',  color: 'green',  note: 'Probe 2 reading, with its own pull-up' },
    { from: 'rly.VCC',  to: 'bb.T+16',  color: 'red',    note: 'Relay coil, 5 V' },
    { from: 'rly.GND',  to: 'bb.T-16',  color: 'black',  note: 'Relay ground' },
    { from: 'rly.IN',   to: 'mcu.D26',  color: 'blue',   note: 'Valve drive. Pull-up so the valve state is defined during boot' },
    { from: 'rly.NO',   to: 'valve.W1', color: 'brown',  note: '12 V switched to the valve coil. COM takes 12 V from the supply' },
    { from: 'valve.W2', to: 'bb.T-20',  color: 'black',  note: 'Valve return to the 12 V supply negative' },
    { from: 'buz.+',    to: 'mcu.D27',  color: 'orange', note: 'Alarm buzzer' },
    { from: 'buz.-',    to: 'bb.T-24',  color: 'black',  note: 'Buzzer ground' },
    { from: 'btn.1A',   to: 'mcu.D14',  color: 'yellow', note: 'Acknowledge button, internal pull-up' },
    { from: 'btn.2A',   to: 'bb.T-28',  color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Power the probes only while reading them</span>
<p>This is the difference between a detector that works for years and one that quietly dies in four months.</p>
<p>Two electrodes with a constant DC voltage across them, sitting in occasionally damp air, form an
electrolytic cell. One track dissolves. The probe stops conducting and the detector stops detecting - and
nothing tells you.</p>
<p>Drive the probes' VCC from a GPIO pin. Set it high, wait 2&nbsp;ms, read every probe, set it low again.
Once a second, that is a 0.2% duty cycle and the corrosion rate falls with it.</p>
<p>One pin can supply several probes - they take microamps.</p></div>

<div class="note danger"><span class="t">Decide what the valve does with no power</span>
<p>There is no neutral option and the choice is in the hardware you buy:</p>
<ul>
  <li><strong>Normally-closed solenoid:</strong> power cut stops the water. Safest, and it burns a few watts
  continuously to hold the water on, so the coil is permanently warm.</li>
  <li><strong>Normally-open solenoid:</strong> no standby power, and a power cut leaves the water on.</li>
  <li><strong>Motorised ball valve:</strong> stays where it was left. No standby power, survives a power cut
  in whatever state it was in, and closes in 5-10 seconds rather than instantly. This is what commercial
  systems use.</li>
</ul>
<p>The battery backup exists so that a power cut does not leave the system unable to act. Decide this
deliberately and write it on the label.</p></div>

<div class="note danger"><span class="t">The relay must be in a known state during boot</span>
<p>The ESP32's pins float during reset. With a normally-closed valve held open by the relay, a reboot means
the water shuts off for two seconds - annoying. With a normally-open valve, a reboot could close it.</p>
<p>Pull-up or pull-down on the relay IN pin so the valve state is defined from the instant power appears, and
verify it by power-cycling ten times.</p></div>

<div class="note warn"><span class="t">Where the probes go</span>
<ul>
  <li><strong>On the floor, at the lowest point.</strong> Water finds the low spot and a probe 50&nbsp;mm away
  on a level floor will never see it.</li>
  <li><strong>Behind the washing machine and the dishwasher</strong> - the hoses are the single most common
  failure.</li>
  <li><strong>Under the boiler and in the airing cupboard.</strong></li>
  <li><strong>In a drip tray</strong> if there is one, which is where a float switch works better than a
  conductivity probe.</li>
  <li><strong>Not where someone mops.</strong> A probe in a doorway will alarm every week and then be
  ignored.</li>
</ul></div>`,

solderSteps: [
  { h: 'Pull-ups on every probe input',
    body: `<p>10&nbsp;k from each probe signal to 3.3&nbsp;V. Dry means the input is pulled high; water pulls
    it low through the probe.</p>
    <p>Do not use the ESP32's internal pull-ups here - they are weak and imprecise, and a long probe lead
    picks up enough noise to fool them.</p>` },
  { h: 'Probe leads with proper strain relief',
    body: `<p>Three-core to each probe, as long as needed to reach the floor position. Solder and heatshrink
    each conductor, sleeve the bundle, and anchor it so a foot catching the cable pulls on the anchor rather
    than the probe.</p>
    <p>Keep the joints off the floor - a joint in a puddle is a probe in the wrong place.</p>` },
  { h: 'Valve wiring, on screw terminals',
    body: `<p>12&nbsp;V to the relay COM, NO to one valve wire, the other valve wire back to the supply
    negative.</p>
    <p>A solenoid coil is inductive. Most relay modules include the flyback diode; if yours does not, fit a
    1N4007 across the coil, banded end to the positive side.</p>` },
  { h: 'Battery backup, wired so it takes over automatically',
    body: `<p>The TP4056 keeps the cell charged from the 5&nbsp;V rail. Its OUT+ feeds the ESP32 through a
    Schottky diode, and the main 5&nbsp;V feeds it through another - so whichever is higher supplies the
    board and the changeover is automatic.</p>
    <p>Test it: pull the mains supply and check the device stays alive, the alarm still sounds and the valve
    still moves.</p>` },
  { h: 'Label everything, inside and out',
    body: `<p>Which probe is which, what the valve does on power loss, and a phone number. Somebody else may
    have to deal with this at three in the morning.</p>` }
],

assembly: [
  { h: 'Test a probe in a saucer before installing anything',
    body: `<p>Probe on the bench, a saucer of water, and watch the serial output as you dip it.</p>
    <p>Tap water conducts well. Distilled water barely conducts at all - which is a useful reminder that this
    detects <em>tap</em> water, and that a very clean leak might be slower to register.</p>` },
  { h: 'Find the threshold with a real puddle',
    body: `<p>Put the probe flat on a worktop and drip water next to it until it triggers. That tells you how
    much water it takes.</p>
    <p>You want it triggering on a thin film, not needing to be submerged. If it needs a puddle, the tracks
    may be dirty - clean them with isopropyl alcohol.</p>` },
  { h: 'Fit the valve where you can reach it',
    body: `<p>On the incoming main, after the stopcock, before everything else. Somewhere accessible - you
    will want to bypass it one day.</p>
    <p><strong>Leave the manual stopcock in place and working.</strong> The electronic valve is an addition,
    never a replacement.</p>
    <p>Plumbing this is real plumbing. If you are not confident with compression fittings on a mains
    pressure pipe, this is the part to have done properly.</p>` },
  { h: 'Test the valve closing against real pressure',
    body: `<p>Trigger it and check the water actually stops at a tap. A servo-assisted solenoid can click
    convincingly and not seal.</p>
    <p>Then check how long it takes. A solenoid is instant; a ball valve is 5-10 seconds. Both are fast enough
    against a burst hose, and you should know which you have.</p>` },
  { h: 'Set up the notification and test it from another room',
    body: `<p>MQTT to Home Assistant, or a Telegram message. Then trigger a probe and confirm the message
    arrives on a phone that is not in the same room.</p>
    <p>A local buzzer is the primary alarm; the notification is for when nobody is home, which is exactly when
    this matters most.</p>` },
  { h: 'Turn on the weekly self-test and let one run',
    body: `<p>The sketch pulses each probe's power and confirms the input goes high - proving the pull-up, the
    wiring and the lead are intact.</p>
    <p>It cannot prove the tracks have not corroded away, which is why they are only powered while being
    read.</p>` },
  { h: 'Put it in your calendar to test properly, twice a year',
    body: `<p>Actual water on an actual probe, and confirm the valve closes. A detector nobody has tested in
    three years is a decoration.</p>` }
],

libraries: [
  { name: 'PubSubClient', by: 'Nick O\'Leary', why: 'MQTT notification to Home Assistant.' },
  { name: 'WiFi', by: 'Espressif', how: 'Built in', why: 'The network, for the notification only - the alarm and the valve work offline.' }
],

code: [
{
  h: 'The leak alarm',
  intro: `<p>Short, and the two things that matter are the switched probe power and the latching alarm.</p>`,
  name: 'leak_alarm.ino',
  code: `/* ------------------------------------------------------------------
   Water leak alarm and cutoff.

   Probes are powered ONLY while being read - a few milliseconds a
   second - because constant DC across two electrodes in water
   dissolves one of them within months.

   The alarm LATCHES. A leak does not un-happen, and a detector that
   clears itself when the puddle dries has told you nothing.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <PubSubClient.h>

#define PROBE_POWER   25          // switched supply for ALL probes
#define VALVE_PIN     26
#define BUZZER_PIN    27
#define BUTTON_PIN    14
#define LED_ARMED     12
#define LED_ALARM     13

const int PROBE_PINS[] = { 32, 33, 34, 35 };
const char *PROBE_NAMES[] = { "kitchen sink", "washing machine",
                              "boiler", "bathroom" };
const int NUM_PROBES = sizeof(PROBE_PINS) / sizeof(PROBE_PINS[0]);

/* Valve polarity. Set this from the valve you actually bought, and
   write it on the label inside the lid. */
#define VALVE_CLOSED_LEVEL  HIGH   // level that SHUTS the water

#define SETTLE_US        2000      // probe settling time before reading
#define CONFIRM_READS       3      // consecutive wet reads to believe it
#define SELFTEST_HOURS    168      // weekly

const char *MQTT_HOST = "192.168.1.10";
const char *TOPIC     = "home/leak";

WiFiClient net;
PubSubClient mqtt(net);

bool alarmLatched = false;
int  alarmProbe = -1;
uint8_t wetCount[4] = { 0, 0, 0, 0 };
unsigned long lastSelfTest = 0;
unsigned long alarmSince = 0;

void setup() {
  Serial.begin(115200);

  pinMode(PROBE_POWER, OUTPUT);
  digitalWrite(PROBE_POWER, LOW);        // probes OFF by default

  pinMode(VALVE_PIN, OUTPUT);
  setValve(false);                       // water on, at boot
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_ARMED, OUTPUT);
  pinMode(LED_ALARM, OUTPUT);

  for (int i = 0; i < NUM_PROBES; i++) pinMode(PROBE_PINS[i], INPUT);

  WiFi.begin("your-ssid", "your-password");
  mqtt.setServer(MQTT_HOST, 1883);

  digitalWrite(LED_ARMED, HIGH);
  Serial.println(F("armed"));
  publish("armed", -1);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED && !mqtt.connected()) {
    if (mqtt.connect("leak-alarm")) publish("reconnected", -1);
  }
  mqtt.loop();

  pollButton();

  if (alarmLatched) { soundAlarm(); return; }

  checkProbes();

  if (millis() - lastSelfTest > SELFTEST_HOURS * 3600000UL) {
    lastSelfTest = millis();
    selfTest();
  }

  delay(1000);
}

/* --- reading, with the probes powered for two milliseconds ----------- */
void checkProbes() {
  digitalWrite(PROBE_POWER, HIGH);
  delayMicroseconds(SETTLE_US);

  for (int i = 0; i < NUM_PROBES; i++) {
    // Pulled high by a 10 k when dry; water pulls it down.
    bool wet = (digitalRead(PROBE_PINS[i]) == LOW);

    /* Require several consecutive wet reads. A single low is noise on
       a long probe lead; three in a row a second apart is water. */
    if (wet) {
      if (++wetCount[i] >= CONFIRM_READS) { trigger(i); break; }
    } else {
      wetCount[i] = 0;
    }
  }

  digitalWrite(PROBE_POWER, LOW);        // off again immediately
}

void trigger(int probe) {
  alarmLatched = true;
  alarmProbe = probe;
  alarmSince = millis();

  setValve(true);                        // shut the water FIRST

  digitalWrite(LED_ALARM, HIGH);
  digitalWrite(LED_ARMED, LOW);

  Serial.print(F("*** LEAK: "));
  Serial.println(PROBE_NAMES[probe]);

  publish("LEAK", probe);
}

void setValve(bool closed) {
  digitalWrite(VALVE_PIN, closed ? VALVE_CLOSED_LEVEL : !VALVE_CLOSED_LEVEL);
}

/* --- the alarm, which does not stop on its own ----------------------- */
void soundAlarm() {
  // Two-tone, loud, forever. Someone has to press the button.
  static unsigned long last = 0;
  static bool high = false;
  if (millis() - last > 400) {
    last = millis();
    high = !high;
    tone(BUZZER_PIN, high ? 2400 : 1800, 380);
    digitalWrite(LED_ALARM, high);
  }

  // Re-notify every ten minutes. The first message may arrive while
  // the phone is face-down on a table at 3 am.
  static unsigned long lastNotify = 0;
  if (millis() - lastNotify > 600000UL) {
    lastNotify = millis();
    publish("LEAK ongoing", alarmProbe);
  }
}

void pollButton() {
  static unsigned long lastPress = 0;
  if (digitalRead(BUTTON_PIN) || millis() - lastPress < 500) return;
  lastPress = millis();

  if (!alarmLatched) return;

  /* Acknowledging silences the alarm and re-arms detection. It does
     NOT reopen the valve - that is a deliberate second action, taken
     by someone who has looked at the leak. */
  noTone(BUZZER_PIN);
  alarmLatched = false;
  alarmProbe = -1;
  for (int i = 0; i < NUM_PROBES; i++) wetCount[i] = 0;
  digitalWrite(LED_ALARM, LOW);
  digitalWrite(LED_ARMED, HIGH);

  Serial.println(F("acknowledged - valve still CLOSED"));
  publish("acknowledged, valve still closed", -1);

  // Hold the button for five seconds to also reopen the valve.
  unsigned long held = millis();
  while (!digitalRead(BUTTON_PIN)) {
    if (millis() - held > 5000) {
      setValve(false);
      Serial.println(F("valve reopened by long press"));
      publish("valve reopened", -1);
      tone(BUZZER_PIN, 1200, 200);
      break;
    }
  }
}

/* --- weekly self-test -------------------------------------------------
   Proves the pull-ups, the wiring and the leads. It cannot prove the
   electrodes have not corroded - which is why they are only powered
   while being read. */
void selfTest() {
  Serial.println(F("self-test"));
  digitalWrite(PROBE_POWER, HIGH);
  delayMicroseconds(SETTLE_US);

  bool ok = true;
  for (int i = 0; i < NUM_PROBES; i++) {
    if (digitalRead(PROBE_PINS[i]) != HIGH) {
      Serial.print(F("  probe ")); Serial.print(i);
      Serial.println(F(" reads LOW when it should be dry"));
      ok = false;
    }
  }
  digitalWrite(PROBE_POWER, LOW);

  publish(ok ? "self-test ok" : "SELF-TEST FAILED", -1);
  for (int i = 0; i < (ok ? 1 : 4); i++) { tone(BUZZER_PIN, 2000, 80); delay(200); }
}

void publish(const char *what, int probe) {
  if (!mqtt.connected()) return;
  char msg[120];
  snprintf(msg, sizeof(msg), "{\\"status\\":\\"%s\\",\\"where\\":\\"%s\\"}",
           what, probe >= 0 ? PROBE_NAMES[probe] : "-");
  mqtt.publish(TOPIC, msg, true);        // retained: state, not a command
}`,
  after: `<p><strong>Acknowledging does not reopen the valve.</strong> That is deliberate. Silencing an alarm is
  something you do half-asleep; restoring the water supply after a leak should require a second, explicit
  action from someone who has actually looked. Hence the five-second hold.</p>
  <p><strong>The valve closes before anything else happens</strong> in <code>trigger()</code> - before the
  LEDs, before the serial print, before the MQTT publish. Network calls can block for seconds and the water is
  running the whole time.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note warn"><span class="t">Set VALVE_CLOSED_LEVEL from the valve you bought</span>
<p>Get this backwards and the device shuts the water off permanently and opens it when it finds a leak. Test
it with the valve on the bench and a hose before it goes on a pipe.</p></div>
<div class="note tip"><span class="t">D34 and D35 are input-only, which is fine here</span>
<p>Probes 3 and 4 use input-only pins. They have no internal pull-ups at all, which is another reason the
external 10&nbsp;k resistors are not optional.</p></div>`,

tune: [
  { h: 'A motorised ball valve is the better hardware',
    body: `<p>Two relays - one for open, one for close - and a pulse of a few seconds on each. It holds
    position with no power, survives a power cut in whatever state it was in, and handles mains pressure
    properly.</p>
    <p>Most have limit switches so you can confirm it actually reached the end stop, which a solenoid cannot
    tell you.</p>` },
  { h: 'Float switches where there is a tray',
    body: `<p>A float switch in a drip tray is mechanical: no electrodes, no corrosion, no threshold to tune,
    and a twenty-year life. Where there is somewhere for water to collect, it is strictly better than a
    conductivity probe.</p>
    <p>Wire it exactly like a probe with a permanent pull-up - it has no electrodes to protect.</p>` },
  { h: 'Add temperature for freeze warning',
    body: `<p>The other way pipes fail. A DS18B20 in the loft or under the floor, alarming below
    3&nbsp;&deg;C, catches the problem before it becomes a leak rather than after.</p>` },
  { h: 'Flow monitoring finds slow leaks',
    body: `<p>A pulse flow meter on the main, and an alarm if water flows continuously for more than, say, 30
    minutes, catches a running toilet or a dripping joint - which a floor probe never will and which wastes
    more water over a year than most bursts.</p>` },
  { h: 'Make the notification reliable',
    body: `<p>The local buzzer works with no network. The notification is what matters when nobody is home, so
    make it not depend on your broker being up: a direct Telegram or Pushover call is fewer moving parts than
    MQTT to a server in a cupboard that might also be flooded.</p>` },
  { h: 'Tell your insurer',
    body: `<p>Several insurers reduce premiums for a fitted leak detection system. A home-built one may not
    qualify, and it is worth asking - and worth knowing whether a home-built device affects a claim before you
    need to make one.</p>` }
],

trouble: [
  { q: 'Probes stop working after a few months',
    a: `Electrolysis. Confirm <code>PROBE_POWER</code> really is being held low between reads - put a meter on
    it. A probe with a constant supply will lose a track within months and the corrosion is visible as one
    track looking eaten.` },
  { q: 'False alarms overnight',
    a: `Condensation, or a long probe lead picking up noise. Raise <code>CONFIRM_READS</code>, shield or
    shorten the lead, and check the probe is not somewhere that gets damp without leaking - under a cold pipe
    in summer, for instance.` },
  { q: 'It does not trigger on a real spill',
    a: `The probe is not at the low point. Water goes where the floor slopes. Put a drop of water directly on
    the tracks to prove the probe works, then move it to where water would actually collect.` },
  { q: 'The valve clicks but the water does not stop',
    a: `Servo-assisted solenoid valves need line pressure to seal and will not close reliably at low pressure.
    Use a direct-acting solenoid or a motorised ball valve. Also check the valve is fitted the right way round
    - most are directional and marked with an arrow.` },
  { q: 'The valve gets hot',
    a: `Normal for a normally-closed solenoid, which is energised whenever the water is on. If it is too hot
    to hold, it is the wrong valve for continuous duty - which is another argument for a motorised ball
    valve.` },
  { q: 'The alarm stops by itself',
    a: `The latch is not latching. <code>alarmLatched</code> must only be cleared by the button, never by the
    probe going dry.` },
  { q: 'Everything dies in a power cut',
    a: `The backup is not taking over. Check the Schottky diodes are the right way round and that the TP4056
    is actually charging the cell - measure it after the device has been running a day.` }
],

next: `
<ul>
  <li><strong>Catch it before it leaks</strong> - a
  <a href="project.html?p=fridge-freezer-logger">temperature logger</a> in the loft warns of freezing pipes,
  which is the cause rather than the symptom.</li>
  <li><strong>Find the slow ones</strong> - a flow meter on the main catches a running toilet, which wastes
  more over a year than most bursts.</li>
  <li><strong>Somewhere with no Wi-Fi</strong> - the
  <a href="project.html?p=lora-remote-sensor">LoRa link</a> reaches an outbuilding or a cellar the house
  network does not.</li>
  <li><strong>Nobody home for weeks</strong> - the
  <a href="project.html?p=gsm-sms-alarm">SMS alarm</a> reaches you with no internet at the property at
  all.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Plumbing and water</span>
<ul>
  <li><strong>Fitting a valve to a mains water pipe is plumbing.</strong> If you are not confident with
  compression fittings at mains pressure, have it done. A failed joint causes exactly the damage this project
  exists to prevent.</li>
  <li><strong>Keep the manual stopcock</strong> working and accessible. The electronic valve is in addition to
  it, never instead of it.</li>
  <li><strong>Check the valve's pressure rating</strong> against your supply, and check whether it is
  direct-acting - a servo-assisted valve will not close at low pressure, which is exactly the condition after
  a burst.</li>
  <li><strong>Keep all electronics above any possible water level</strong>, and away from the pipe itself.</li>
</ul>
</div>
<div class="note warn"><span class="t">It is a hobby device guarding something expensive</span>
<ul>
  <li><strong>Test it twice a year with real water.</strong> An untested detector is a decoration.</li>
  <li><strong>Decide the power-loss behaviour deliberately</strong> and write it on the label.</li>
  <li><strong>Tell everyone in the house</strong> that it exists, what the alarm sounds like, and how to
  reopen the valve.</li>
  <li><strong>Check your insurance position.</strong> Some insurers require certified equipment; some offer a
  discount for a fitted system. Ask before you need to claim.</li>
  <li><strong>This does not replace turning the water off when you go away</strong> for more than a few
  days.</li>
</ul>
</div>`
});
