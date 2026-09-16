/* LD2410 mmWave: the sensor that knows you are still there when you stop moving. */
AB.addProject({
slug: 'presence-detector',
title: 'mmWave presence sensor',
cat: 'smart-home',
level: 2,
time: '3 hours',
solder: false,
board: 'ESP8266',
tags: ['mmwave', 'ld2410', 'presence', 'radar', 'occupancy', 'home assistant', 'no soldering', 'doppler'],
blurb: 'The reason your lights go off while you are sitting reading. A PIR sees movement; this sees a person breathing, and it costs four dollars.',

skills: ['mmWave radar', 'Presence vs motion', 'Gate-based zone config', 'Serial configuration protocols', 'Home Assistant integration'],

intro: `
<p>Every motion-activated light has the same flaw. You walk in, it comes on. You sit down to read, and four
minutes later you are in the dark waving an arm at the ceiling.</p>
<p>That is not a bug in the timeout - it is the sensor. A PIR detects <em>changes</em> in infrared across its
field of view, so a person who has stopped moving is invisible to it. No amount of software fixes a sensor
that cannot see you.</p>
<p>A 24&nbsp;GHz mmWave module works differently: it transmits a radio signal and measures the phase of the
reflection. The chest movement of breathing - a few millimetres - shifts that phase measurably. So it reports
a person sitting perfectly still, reading, asleep.</p>
<p>These were expensive industrial parts five years ago. The LD2410C is four dollars, and it is the single
biggest improvement available to anyone with motion-activated anything.</p>`,

what: [
  'Detect a person who is present but stationary, which a PIR fundamentally cannot.',
  'Distinguish "moving" from "still but present" and report both.',
  'Report the distance to the target, in centimetres.',
  'Configure per-distance sensitivity, so a corridor outside the door does not trigger the room.',
  'Publish to Home Assistant as an occupancy sensor with no soldering at all.',
  'Understand where mmWave is worse than a PIR, because it genuinely is in places.'
],

how: `
<p><strong>How it sees a stationary person.</strong> The module transmits a 24&nbsp;GHz FMCW signal and
examines the reflection. Distance comes from the frequency difference between transmitted and received;
movement comes from phase change between successive sweeps.</p>
<p>A chest rising and falling moves a few millimetres. At 24&nbsp;GHz the wavelength is about 12&nbsp;mm, so a
few millimetres of movement is a large fraction of a wavelength - an enormous phase shift. Breathing is,
to this sensor, a loud signal.</p>
<p>That is the whole difference. A PIR needs a warm object to cross between its detection zones. mmWave needs
you to be alive.</p>

<p><strong>Gates, which is how you shape the detection zone.</strong> The LD2410 divides its range into eight
"gates", each about 75&nbsp;cm deep, out to roughly 6&nbsp;m. Each gate has its own sensitivity threshold for
moving targets and another for stationary ones.</p>
<p>This is more useful than it sounds, because it lets you shape the zone in software: turn the far gates
right down and the sensor stops seeing the corridor through the doorway, while still seeing the armchair. A
PIR gives you a lens and some tape.</p>

<p><strong>Where mmWave is worse.</strong> Worth knowing before you replace every PIR in the house:</p>
<ul>
  <li><strong>It sees through walls</strong>, at least thin ones. Plasterboard is nearly transparent at
  24&nbsp;GHz, so a sensor on an internal wall can detect the person in the next room. This is the most common
  complaint and it is solved with the gate sensitivities, not with placement alone.</li>
  <li><strong>It sees fans, curtains and pets.</strong> Anything that moves is a target. A ceiling fan will
  hold the room permanently occupied.</li>
  <li><strong>It uses more power</strong> - around 70-100&nbsp;mA against a PIR's 50&nbsp;uA. This is not a
  coin-cell sensor.</li>
  <li><strong>It is a transmitter</strong>, so there are regional rules about the band. 24&nbsp;GHz ISM is
  licence-exempt in most places at these powers, and the modules are certified - but check if you are
  somewhere unusual.</li>
</ul>
<p>The honest summary: mmWave for rooms people sit in, PIR for corridors, cupboards and anywhere that needs to
run on a battery.</p>

<p><strong>Two ways to read it.</strong> The module has a simple OUT pin that goes high when anything is
detected - one wire, no code, works immediately. It also has a serial interface that reports moving distance,
stationary distance, and per-gate energy levels, and lets you write the configuration.</p>
<p>Start with the OUT pin to prove the thing works. Move to serial when you want to tune it.</p>`,

bom: [
  { id: 'ld2410', qty: 1, note: 'LD2410C is the common one. Buy two - once one works you will want the next room done. The LD2410B has Bluetooth configuration, which is genuinely useful for tuning it on a wall with a phone app.' },
  { id: 'esp8266', qty: 1, note: 'A Wemos D1 Mini is plenty and costs $3. An ESP32 gives you a second hardware serial port, which is tidier.' },
  { id: 'led5', qty: 1, note: 'Local indication while you tune it. Much easier than watching a dashboard.' },
  { id: 'res220', qty: 1 },
  { id: 'psu5v3a', qty: 1, own: true, note: 'Any USB supply. About 120 mA total.' },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'box-abs', qty: 1, note: 'Plastic only, and thin. A thick or metallised enclosure attenuates 24 GHz badly.' }
],

tools: [{ id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp8266', at: [0, 40] },
    { id: 'bb',   comp: 'bb400',   at: [0, -16] },
    { id: 'rad',  comp: 'ld2410',  at: [0, -70] },
    { id: 'led',  comp: 'led5',    at: [38, -66], opt: { c: '#3fbf6a' } }
  ],
  wires: [
    { from: 'mcu.5V',   to: 'bb.T+2',  color: 'red',    note: '5 V rail. The LD2410 wants 5 V, not 3.3' },
    { from: 'mcu.GND',  to: 'bb.T-2',  color: 'black',  note: 'Ground rail' },
    { from: 'rad.VCC',  to: 'bb.T+6',  color: 'red',    note: 'Radar power, 5 V. It draws about 80 mA - more than a PIR by three orders of magnitude' },
    { from: 'rad.GND',  to: 'bb.T-6',  color: 'black',  note: 'Radar ground' },
    { from: 'rad.OUT',  to: 'mcu.D5',  color: 'green',  note: 'Simple presence output, 3.3 V logic. This alone is a working sensor' },
    { from: 'rad.TX',   to: 'mcu.D6',  color: 'blue',   note: 'Serial out - distances and per-gate energy. 256000 baud' },
    { from: 'rad.RX',   to: 'mcu.D7',  color: 'orange', note: 'Serial in, for writing the configuration' },
    { from: 'led.A',    to: 'mcu.D1',  color: 'purple', note: 'Local presence LED through 220 ohm - invaluable while tuning' },
    { from: 'led.K',    to: 'bb.T-12', color: 'black',  note: 'Cathode to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">5 V supply, 3.3 V logic</span>
<p>The LD2410 needs 5&nbsp;V on VCC - it will not start reliably on 3.3. Its TX and OUT pins are 3.3&nbsp;V
logic, so they connect directly to an ESP8266 or ESP32 with no level shifting in that direction.</p>
<p>Its RX is also 3.3&nbsp;V, and both ESPs output 3.3&nbsp;V, so nothing needs dividing. This is one of the
rare modules where the levels just work.</p></div>

<div class="note danger"><span class="t">It sees through plasterboard, and that surprises people</span>
<p>24&nbsp;GHz passes through plasterboard, wood and most furniture with little attenuation. A sensor on an
internal wall will happily detect the person in the next room, and your lights will come on when nobody is
there.</p>
<p>Three things help, in order:</p>
<ul>
  <li><strong>Turn down the far gates.</strong> If the room is 4&nbsp;m deep, set gates 6, 7 and 8 to minimum
  sensitivity and the wall behind stops mattering.</li>
  <li><strong>Point it into the room</strong>, not along a wall and not at a doorway.</li>
  <li><strong>Metal behind it.</strong> A sheet of foil or a tin lid behind the module blocks the rear lobe,
  which is cruder and effective.</li>
</ul></div>

<div class="note warn"><span class="t">Fans, curtains and pets are targets</span>
<p>The module detects movement, and it does not care what is moving. A ceiling fan holds a room permanently
occupied. A curtain over a radiator does the same. A cat is a small person as far as this is concerned.</p>
<p>Mount it so the fan is not in its field, or reduce the sensitivity of the gates the fan sits in. There is
no software filter that distinguishes a fan from a person by movement alone.</p></div>

<div class="note tip"><span class="t">Serial runs at 256000 baud</span>
<p>Not a typo and not a standard rate. <code>SoftwareSerial</code> cannot do it reliably - use hardware
serial, which on an ESP8266 means either the single UART (and losing your debug output) or an ESP32 with
three.</p>
<p>The simple OUT pin needs no serial at all, which is why the project starts there.</p></div>`,

solderSteps: [
  { h: 'Nothing here needs soldering',
    body: `<p>The LD2410C comes with a JST connector or a header already fitted, the ESP8266 has headers, and
    everything goes in a breadboard.</p>
    <p>If yours has the bare JST lead, either buy the matching socket or cut the connector off and tin the
    ends - four wires and a breadboard.</p>` },
  { h: 'Mounting, and what to keep away from it',
    body: `<p>Thin plastic in front, nothing metal within 50&nbsp;mm of the front face. A thick ABS box,
    a metallised sticker or a steel backplate all attenuate 24&nbsp;GHz noticeably.</p>
    <p>The module's own antennas are the two patch arrays visible on the PCB - keep fingers, glue and tape off
    them.</p>` }
],

assembly: [
  { h: 'Start with the OUT pin and an LED',
    body: `<p>VCC, GND and OUT to an LED through a resistor. Nothing else. Power it up.</p>
    <p>Walk in front of it: the LED comes on. Now <strong>sit down and stay completely still</strong>. On a
    PIR the LED would go out within seconds. Here it stays on.</p>
    <p>That moment is the whole point of the project and it is worth doing before any code exists.</p>` },
  { h: 'Find its real range in your room',
    body: `<p>Walk away from it slowly and note where the LED drops out. Then stand still at various
    distances and note where the <em>stationary</em> detection stops - it is shorter than the moving range,
    typically 4-5&nbsp;m against 6.</p>
    <p>Write both numbers down. They determine everything about the configuration.</p>` },
  { h: 'Find out what it sees through the walls',
    body: `<p>Leave it running, go into the next room, and watch the LED from the doorway. In most houses it
    will detect you through plasterboard at two or three metres.</p>
    <p>This is the thing that makes people give up on mmWave, and it is entirely fixable with the gate
    settings - but you have to know it is happening.</p>` },
  { h: 'Read the serial data',
    body: `<p>Upload the reader sketch. You now get moving distance, stationary distance, and an energy value
    for each of the eight gates.</p>
    <p>Watch the gate energies while someone walks around. You will see the target move from gate to gate,
    and you will see which gates light up when nobody is in the room - which tells you exactly which ones to
    turn down.</p>` },
  { h: 'Set the gate sensitivities',
    body: `<p>For a 4&nbsp;m room, gates 0-5 cover it. Set 6, 7 and 8 to minimum sensitivity - the sketch has
    a function that writes the configuration permanently to the module.</p>
    <p>Then walk into the next room again and check the detection has stopped. Adjust and repeat. Twenty
    minutes of this is what separates a sensor that works from one you unplug.</p>` },
  { h: 'Set the absence timeout',
    body: `<p>The module holds "occupied" for a configurable time after the last detection. Five seconds is
    the default and is too twitchy; 30 to 60 seconds is comfortable for a living room.</p>
    <p>Set it in the module rather than in your automation - it debounces before the data ever reaches you.</p>` },
  { h: 'Publish it to Home Assistant',
    body: `<p>MQTT discovery as an occupancy binary sensor, plus the distance as a number. Then use it in
    exactly the automations that used to use a PIR.</p>
    <p>The change you will notice immediately is that the lights stop going off while you sit still.</p>` },
  { h: 'Live with it for a week before mounting it permanently',
    body: `<p>Tape it to the wall and leave it. You are looking for false occupancy - a fan, a curtain, a
    heating pipe that ticks, the neighbour through the party wall.</p>
    <p>All of those are fixable, and all of them are much easier to find before the box is screwed up.</p>` }
],

libraries: [
  { name: 'ld2410', by: 'ncmreynolds', why: 'Parses the module\'s binary protocol and exposes the gate configuration. Saves implementing the frame format yourself.' },
  { name: 'PubSubClient', by: 'Nick O\'Leary', why: 'MQTT to Home Assistant.' },
  { name: 'ESP8266WiFi', by: 'Espressif', how: 'Part of the board package', why: 'The network.' }
],

code: [
{
  h: 'Reading and configuring the radar',
  intro: `<p>Publishes occupancy and distance, and includes the configuration function that shapes the
  detection zone - which is where the value is.</p>`,
  name: 'presence.ino',
  code: `/* ------------------------------------------------------------------
   mmWave presence sensor.

   Reports three things a PIR cannot:
     - someone is present but STATIONARY
     - how far away they are
     - which distance gates are seeing energy

   The gate configuration is what stops it detecting through walls,
   and it is the reason this sketch is worth more than the OUT pin.
   ------------------------------------------------------------------ */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ld2410.h>

#define LED_PIN     5           // D1
#define OUT_PIN     14          // D5, the module's simple presence output

/* The module talks at 256000 baud - not a standard rate, and far too
   fast for SoftwareSerial. On an ESP8266 that means using the one
   hardware UART and giving up Serial for debug, so debug goes out on
   Serial1 (TX only, GPIO2). */
#define RADAR_BAUD  256000

const char *WIFI_SSID = "your-ssid";
const char *WIFI_PASS = "your-password";
const char *MQTT_HOST = "192.168.1.10";
const char *TOPIC     = "home/presence/lounge";

ld2410 radar;
WiFiClient net;
PubSubClient mqtt(net);

bool lastPresence = false;
unsigned long lastPublish = 0;

void setup() {
  Serial1.begin(115200);           // debug out on GPIO2
  Serial1.println(F("\\npresence sensor"));

  Serial.begin(RADAR_BAUD);        // the radar, on the real UART
  radar.begin(Serial);

  pinMode(LED_PIN, OUTPUT);
  pinMode(OUT_PIN, INPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  for (int i = 0; i < 30 && WiFi.status() != WL_CONNECTED; i++) delay(300);
  mqtt.setServer(MQTT_HOST, 1883);

  delay(500);
  if (radar.isConnected()) {
    Serial1.println(F("radar connected"));
    // configureGates();           // <-- uncomment ONCE to write settings
    reportConfig();
  } else {
    Serial1.println(F("no radar - check 5 V and the baud rate"));
  }
}

void loop() {
  radar.read();

  if (WiFi.status() == WL_CONNECTED && !mqtt.connected())
    mqtt.connect("presence-lounge");
  mqtt.loop();

  if (!radar.isConnected()) return;

  bool moving     = radar.movingTargetDetected();
  bool stationary = radar.stationaryTargetDetected();
  bool present    = moving || stationary;

  digitalWrite(LED_PIN, present);

  // Publish on change immediately, and every 30 s regardless so a
  // silent sensor is distinguishable from an empty room.
  if (present != lastPresence || millis() - lastPublish > 30000) {
    lastPresence = present;
    lastPublish = millis();
    publish(present, moving, stationary);
  }

  delay(50);
}

void publish(bool present, bool moving, bool stationary) {
  int dist = moving ? radar.movingTargetDistance()
                    : (stationary ? radar.stationaryTargetDistance() : 0);

  Serial1.print(present ? F("PRESENT ") : F("empty   "));
  Serial1.print(moving ? F("moving ") : F("       "));
  Serial1.print(stationary ? F("still ") : F("      "));
  Serial1.print(dist); Serial1.println(F(" cm"));

  if (!mqtt.connected()) return;

  char payload[160];
  snprintf(payload, sizeof(payload),
    "{\\"occupancy\\":\\"%s\\",\\"moving\\":%s,\\"stationary\\":%s,\\"distance\\":%d}",
    present ? "ON" : "OFF",
    moving ? "true" : "false",
    stationary ? "true" : "false",
    dist);
  mqtt.publish(TOPIC, payload, true);
}

/* --- shaping the detection zone ----------------------------------------
   Each gate is roughly 75 cm deep. Setting the far gates to minimum
   sensitivity is what stops the sensor detecting through the wall
   behind it - which is the single most common mmWave complaint.

   Sensitivity is 0-100; higher is more sensitive. 100 effectively
   disables a gate.

   This writes to the module's own flash, so it only needs running
   once - hence the commented-out call in setup().
   ----------------------------------------------------------------------- */
void configureGates() {
  Serial1.println(F("writing gate configuration"));

  radar.requestConfigurationModeBegin();

  /* For a room about 4 m deep:
       gates 0-1  very near - keep low, or furniture and the sensor's
                  own mounting rattle trigger it
       gates 2-5  the room  - normal sensitivity
       gates 6-8  beyond the far wall - minimum
     The stationary threshold is separately settable and should be
     LESS sensitive than the moving one, or draughts read as people. */
  uint8_t moveSens[9]  = { 50, 50, 40, 40, 40, 40, 100, 100, 100 };
  uint8_t stillSens[9] = { 60, 60, 45, 45, 45, 45, 100, 100, 100 };

  for (uint8_t gate = 0; gate <= 8; gate++) {
    radar.setGateSensitivityThreshold(gate, moveSens[gate], stillSens[gate]);
    delay(50);
  }

  // Maximum gates to consider, and how long to hold "occupied" after
  // the last detection. 5 s is the default and is far too twitchy for
  // a living room; 45 s stops the lights flickering when you lean
  // out of view to pick something up.
  radar.setMaxValues(5, 5, 45);

  radar.requestConfigurationModeEnd();
  radar.requestRestart();

  Serial1.println(F("configuration written - comment out this call"));
}

void reportConfig() {
  if (!radar.requestCurrentConfiguration()) return;

  Serial1.println(F("\\ncurrent configuration:"));
  Serial1.print(F("  max moving gate    : "));
  Serial1.println(radar.maxMovingDistanceGate());
  Serial1.print(F("  max stationary gate: "));
  Serial1.println(radar.maxStationaryDistanceGate());
  Serial1.print(F("  hold time          : "));
  Serial1.print(radar.sensorIdleTimeInSeconds()); Serial1.println(F(" s"));

  Serial1.println(F("  gate  move  still"));
  for (uint8_t g = 0; g <= 8; g++) {
    Serial1.print(F("   ")); Serial1.print(g);
    Serial1.print(F("     ")); Serial1.print(radar.movingThreshold(g));
    Serial1.print(F("    "));  Serial1.println(radar.stationaryThreshold(g));
  }
  Serial1.println();
}`,
  after: `<p><strong>Run <code>configureGates()</code> exactly once</strong>, then comment it out. It writes to
  the module's own flash, so the settings survive power cycles - and rewriting them on every boot both wastes
  flash endurance and makes it impossible to tune with the Bluetooth app.</p>
  <p><strong>The stationary threshold should be less sensitive than the moving one.</strong> That is
  counter-intuitive and correct: a draught moving a curtain looks like slight movement, and the stationary
  detector is the one that will latch onto it and hold a room occupied all night.</p>
  <p>The periodic publish every 30 seconds even when nothing changed is what lets you tell "the room is empty"
  from "the sensor has crashed".</p>`
}],

upload: `
<p>Board: <strong>LOLIN(WEMOS) D1 R2 &amp; mini</strong>. Note that the debug output is on
<strong>Serial1</strong> (GPIO2, TX only) at 115200, because the radar has the real UART.</p>
<div class="note warn"><span class="t">Unplug the radar TX before flashing</span>
<p>The radar shares the ESP8266's programming UART. Its serial output will fight the bootloader and the upload
fails.</p>
<p>A jumper in the radar's TX line makes this painless, exactly as in the cellular projects.</p></div>
<div class="note tip"><span class="t">The LD2410B has a Bluetooth app</span>
<p>If you buy the B variant, HLKRadarTool on a phone gives you a live graph of per-gate energy and sliders for
the thresholds. Tuning on the wall with a phone is enormously easier than reflashing.</p>
<p>Turn the Bluetooth off once tuned - it is an open, unauthenticated interface.</p></div>`,

tune: [
  { h: 'Gate tuning is the whole job',
    body: `<p>Watch the per-gate energies with the room empty, then with someone in it. The gates that show
    energy when the room is empty are the ones seeing through walls or seeing a fan - turn those to 100 and
    they stop mattering.</p>
    <p>Twenty minutes here is worth more than anything else you can do.</p>` },
  { h: 'The hold time belongs in the module',
    body: `<p><code>setMaxValues()</code>'s third argument. 30-60 seconds for a living room, 10-15 for a
    hallway, 120+ for a bathroom where someone might be in a shower behind a curtain.</p>
    <p>Setting it in the module rather than in your automation means it is debounced before the data leaves
    the sensor, which keeps the MQTT traffic and the automation logic simple.</p>` },
  { h: 'Combine with a PIR for the best of both',
    body: `<p>A PIR is fast and never triggers through a wall. mmWave is slow to confirm and sees stationary
    people.</p>
    <p>Use the PIR to turn lights <em>on</em> instantly and the mmWave to decide when to turn them
    <em>off</em>. That combination is what expensive commercial occupancy sensors actually do.</p>` },
  { h: 'Mounting height and angle',
    body: `<p>On a wall at 1.5-2&nbsp;m pointing into the room is the general-purpose answer. On the ceiling
    pointing down gives a tighter, more predictable zone and much less through-wall detection - at the cost of
    a smaller footprint.</p>
    <p>Ceiling mounting is the better choice if you can run power there.</p>` },
  { h: 'Multiple sensors do not interfere much',
    body: `<p>Two LD2410s in the same room generally coexist - they use different chirp timings and the
    protocol is tolerant. If you do see cross-talk, separate them or point them away from each other.</p>` },
  { h: 'Power, and why this is not a battery sensor',
    body: `<p>80-100&nbsp;mA continuously. A PIR is 50&nbsp;microamps. That is a factor of two thousand and it
    means mmWave is a mains-powered sensor.</p>
    <p>If you need battery occupancy sensing, use a PIR and accept its limitation, or duty-cycle the mmWave
    module - which loses the stationary detection that was the point.</p>` }
],

trouble: [
  { q: 'It detects people in the next room',
    a: `Expected - 24&nbsp;GHz passes through plasterboard. Turn the far gates to 100, point it into the room
    rather than at a wall, and if necessary put metal behind the module.` },
  { q: 'The room is permanently occupied',
    a: `Something is moving. A ceiling fan, a curtain over a radiator, a hanging plant in a draught. Watch the
    gate energies to find which distance it is at, then turn that gate down or move the sensor.` },
  { q: 'No serial data at all',
    a: `Baud rate - it is 256000, and SoftwareSerial cannot do it. Use hardware serial. Also check VCC is
    5&nbsp;V, not 3.3 - the module starts but behaves oddly at 3.3.` },
  { q: 'It detects movement but never stationary presence',
    a: `The stationary thresholds are too high (less sensitive). Lower them a little - but not below the
    moving thresholds, or draughts will hold the room occupied.` },
  { q: 'Detection range is much shorter than 6 m',
    a: `Something in front of it. A thick enclosure, a metallised sticker, or a painted surface with metallic
    pigment. Test it with nothing in front and compare.` },
  { q: 'It triggers on the cat',
    a: `It will. A cat is a moving target and the module has no concept of size. Raising thresholds enough to
    exclude a cat usually also excludes a stationary person, which defeats the purpose. Ceiling mounting with
    a narrow zone helps most.` },
  { q: 'Upload fails',
    a: `The radar is holding the programming UART. Disconnect its TX line before flashing.` },
  { q: 'Settings revert after a power cycle',
    a: `<code>requestConfigurationModeEnd()</code> was not called, so the module never committed them. The
    sequence is begin, write, end, restart.` }
],

next: `
<ul>
  <li><strong>Drive lights properly</strong> - the
  <a href="project.html?p=motion-activated-lights">motion-activated lights</a> project with this sensor
  instead of a PIR is the upgrade that makes the whole idea work.</li>
  <li><strong>Heat the room that is occupied</strong> - feed it into the
  <a href="project.html?p=smart-thermostat">thermostat</a> so the schedule is a fallback rather than the only
  input.</li>
  <li><strong>Count people rather than detect them</strong> - the
  <a href="project.html?p=jetson-orin-vision">vision counter</a> does what radar cannot, at a hundred times
  the price and with the privacy questions that come with a camera.</li>
  <li><strong>Somewhere with no Wi-Fi</strong> - swap the ESP8266 for an
  <a href="project.html?p=lora-remote-sensor">LoRa node</a> for an outbuilding.</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">Low voltage, and two things worth knowing</span>
<ul>
  <li><strong>It is a 24 GHz transmitter</strong>, at around 10&nbsp;mW - roughly a thousandth of a mobile
  phone. The modules are certified for the licence-exempt 24&nbsp;GHz ISM band in most countries. Nothing to
  worry about at these powers, and worth knowing it is transmitting rather than just listening.</li>
  <li><strong>It sees through walls, which is a privacy consideration as well as a false-trigger one.</strong>
  A sensor that reports whether the neighbour is at home is a different object from one that reports whether
  your lounge is occupied. Tune the gates so it only covers your own space.</li>
  <li><strong>It is not a security sensor.</strong> No alarm certification, no tamper detection, and a
  detection zone that is easy to get wrong. Use it for lights and heating.</li>
  <li><strong>Do not put it in a bathroom without thinking about it.</strong> A sensor that reliably detects a
  stationary person behind a shower curtain is useful for lighting and is also a sensor in a bathroom - worth
  telling people about rather than just installing.</li>
</ul>
</div>`
});
