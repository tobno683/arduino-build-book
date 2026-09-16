/* A thermostat that is honest about hysteresis, which is the whole problem. */
AB.addProject({
slug: 'smart-thermostat',
title: 'Programmable thermostat',
cat: 'smart-home',
level: 3,
time: '5 hours',
solder: true,
board: 'ESP32',
tags: ['thermostat', 'heating', 'hysteresis', 'relay', 'schedule', 'mqtt', 'home assistant', 'ds18b20'],
blurb: 'Replaces a dial on a wall with something that knows what day it is. The interesting part is not the relay - it is stopping the boiler cycling on and off every ninety seconds.',

skills: ['Hysteresis and anti-cycling', 'Schedules and setpoints', 'Sensor placement', 'Relay switching', 'MQTT integration', 'Failsafe heating logic'],

intro: `
<p>A thermostat is a comparison and a relay. Write that naively - <code>if (temp &lt; target) heatOn()</code>
- and you get a boiler that fires, warms the sensor by half a degree in ninety seconds, switches off, cools,
and fires again. Forty times an hour. Boilers are not designed for that and it wrecks them.</p>
<p>Everything interesting in this project is the machinery that prevents it: hysteresis, minimum run times,
minimum off times, and a sensor placed somewhere that represents the room rather than the radiator.</p>
<p>What you get in return for the effort is a thermostat that knows about weekdays, can be adjusted from your
phone, logs what it did, and does something sensible when the network disappears.</p>`,

what: [
  'Hold a room at a setpoint without short-cycling the boiler.',
  'Run a weekly schedule - different setpoints for morning, day, evening and night, weekday and weekend.',
  'Accept a temporary override that expires by itself rather than being forgotten.',
  'Publish state and accept setpoint changes over MQTT, so Home Assistant sees it as a real thermostat.',
  'Keep working on its schedule with no network at all.',
  'Show the room temperature, the setpoint, and whether the boiler is on - from across the room.'
],

how: `
<p><strong>Hysteresis, and why one number is not enough.</strong> A thermostat needs two thresholds, not one:
turn on below <code>target - hysteresis</code>, turn off above <code>target + hysteresis</code>. With
0.3&nbsp;&deg;C either side, the room swings 0.6&nbsp;&deg;C and the boiler runs in sensible blocks.</p>
<p>Tighter hysteresis is not better. It means shorter cycles and more wear for a difference nobody can
feel - the human threshold for noticing a temperature change is around 0.5&nbsp;&deg;C, and most commercial
thermostats use 0.5 to 1.0.</p>

<p><strong>Minimum run and minimum off times.</strong> Hysteresis alone is not enough, because a draught from
an opened door can swing the sensor through the whole band in seconds.</p>
<p>So: once the boiler starts, it runs for at least <code>MIN_RUN_MIN</code> whatever the sensor says. Once it
stops, it stays off for at least <code>MIN_OFF_MIN</code>. Ten and five minutes are sensible. These two
constraints do more for boiler life than the hysteresis does.</p>

<p><strong>Where the sensor goes matters more than its accuracy.</strong> A DS18B20 is good to
&plusmn;0.5&nbsp;&deg;C, which is plenty. Where you put it is worth several degrees:</p>
<ul>
  <li><strong>Not above a radiator</strong>, or on the wall directly above one - you will heat the sensor and
  not the room.</li>
  <li><strong>Not in direct sun</strong>, or the heating goes off at 10&nbsp;am in February.</li>
  <li><strong>Not on an outside wall</strong>, which sits colder than the room.</li>
  <li><strong>Not in a draught</strong> from a door or a letterbox.</li>
  <li><strong>About 1.5&nbsp;m up, on an interior wall, in the room you actually occupy.</strong></li>
</ul>
<p>And keep it away from the ESP32, which dissipates enough to read one to two degrees high in a small
enclosure. A sensor on a short lead outside the box is the standard fix.</p>

<p><strong>Boiler wiring is a switch closure, not power.</strong> Almost all boilers and heating controllers
take a volt-free contact: two terminals that need connecting together to call for heat. Your relay closes
them. Nothing of yours carries mains.</p>
<p>That said, the wiring centre beside them usually does, and in many countries that work is regulated. The
safety section is specific about this.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Wi-Fi for the integration, and enough room for the schedule and MQTT.' },
  { id: 'ds18b20', qty: 2, note: 'One for the room on a lead, one spare. 1-Wire, so several share two wires if you want multiple rooms.' },
  { id: 'res4k7', qty: 1, note: 'The 1-Wire pull-up.' },
  { id: 'relay1', qty: 1, note: 'Opto-isolated. For a volt-free boiler input this is switching nothing dangerous - but see the safety section about the wiring centre.' },
  { id: 'oled13', qty: 1, note: 'Temperature, setpoint, and whether it is calling for heat.' },
  { id: 'rotary-enc', qty: 1, note: 'Turn to adjust, press to confirm. Much better than buttons for a setpoint.' },
  { id: 'ds3231', qty: 1, note: 'The schedule needs to survive a power cut and a network outage. NTP is not enough on its own.' },
  { id: 'rtc-cell', qty: 1, note: 'For the RTC.' },
  { id: 'led5', qty: 2, note: 'Calling for heat, and network status.' },
  { id: 'res220', qty: 2 },
  { id: 'psu5v3a', qty: 1, note: 'Any USB supply. Total draw is under 200 mA.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2, note: 'For the boiler contact and the sensor lead.' },
  { id: 'box-abs', qty: 1, note: 'Ventilated. A sealed box reads high because the ESP32 warms it.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'bb-400', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',   at: [0, 50] },
    { id: 'bb',   comp: 'bb400',   at: [0, -10] },
    { id: 'oled', comp: 'oled13',  at: [-44, -60], ry: 180 },
    { id: 'enc',  comp: 'rotary',  at: [6, -60] },
    { id: 'rtc',  comp: 'ds3231',  at: [48, -58] },
    { id: 'rly',  comp: 'relay1',  at: [48, -96] },
    { id: 'temp', comp: 'ds18b20', at: [-44, -98] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+2',   color: 'red',    note: '3.3 V rail for the display, encoder and clock' },
    { from: 'mcu.GND',  to: 'bb.T-2',   color: 'black',  note: 'Ground rail' },
    { from: 'mcu.VIN',  to: 'bb.T+6',   color: 'red',    note: '5 V in, also feeding the relay coil' },
    { from: 'oled.VCC', to: 'bb.T+10',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-10',  color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21',  color: 'blue',   note: 'I2C data, shared with the clock' },
    { from: 'oled.SCL', to: 'mcu.D22',  color: 'yellow', note: 'I2C clock' },
    { from: 'rtc.VCC',  to: 'bb.T+14',  color: 'red',    note: 'RTC power' },
    { from: 'rtc.GND',  to: 'bb.T-14',  color: 'black',  note: 'RTC ground' },
    { from: 'rtc.SDA',  to: 'mcu.D21',  color: 'blue',   note: 'Same I2C bus, address 0x68' },
    { from: 'rtc.SCL',  to: 'mcu.D22',  color: 'yellow', note: 'Same I2C clock' },
    { from: 'enc.VCC',  to: 'bb.T+18',  color: 'red',    note: 'Encoder power' },
    { from: 'enc.GND',  to: 'bb.T-18',  color: 'black',  note: 'Encoder ground' },
    { from: 'enc.CLK',  to: 'mcu.D32',  color: 'green',  note: 'Encoder A. Both encoder lines want interrupt handling' },
    { from: 'enc.DT',   to: 'mcu.D33',  color: 'green',  note: 'Encoder B' },
    { from: 'enc.SW',   to: 'mcu.D25',  color: 'purple', note: 'Encoder push switch' },
    { from: 'temp.VCC', to: 'bb.T+22',  color: 'red',    note: 'Sensor power, on a lead OUTSIDE the box' },
    { from: 'temp.GND', to: 'bb.T-22',  color: 'black',  note: 'Sensor ground' },
    { from: 'temp.DATA', to: 'mcu.D27', color: 'yellow', note: '1-Wire data, with the 4.7 k pull-up to 3.3 V' },
    { from: 'rly.VCC',  to: 'bb.T+26',  color: 'red',    note: 'Relay coil, 5 V' },
    { from: 'rly.GND',  to: 'bb.T-26',  color: 'black',  note: 'Relay ground' },
    { from: 'rly.IN',   to: 'mcu.D26',  color: 'blue',   note: 'Relay drive. 10 k pull-up so it is off while the board boots' },
    { from: 'rly.COM',  to: 'bb.T-30',  color: 'brown',  note: 'To the boiler call-for-heat terminal - a volt-free contact' },
    { from: 'rly.NO',   to: 'bb.T-32',  color: 'brown',  note: 'The other boiler terminal. Closing these two calls for heat' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">The relay must be off while the board boots</span>
<p>During reset the ESP32's pins float, and an active-LOW relay module can read that as ON - so the boiler
fires for a second or two on every reboot.</p>
<p>10&nbsp;k from the relay IN pin to 3.3&nbsp;V, at the relay module. Then test it: power-cycle ten times and
watch the relay. It must not click.</p>
<p>Use D26 or D27. GPIO0, 2, 5, 12 and 15 are strapping pins and are driven during boot.</p></div>

<div class="note danger"><span class="t">Most boilers want a volt-free contact - check yours</span>
<p>A conventional boiler or heating controller has two terminals that need shorting together to call for
heat. Your relay closes them and carries no mains.</p>
<p><strong>Confirm this before connecting anything.</strong> Some systems switch a live 230&nbsp;V feed to the
boiler instead, and that is mains work with all that implies. Look at the existing thermostat's wiring, and
if there are three wires and one is permanently live, stop and read the safety section.</p></div>

<div class="note warn"><span class="t">The sensor goes outside the box, on a lead</span>
<p>An ESP32 dissipates enough to warm a small enclosure by one to two degrees. A sensor inside the box reads
the box, not the room, and the heating turns off early every time.</p>
<p>Run the DS18B20 on 300&nbsp;mm of three-core, out of the enclosure, and mount it away from the board. The
4.7&nbsp;k pull-up stays on the board.</p></div>

<div class="note tip"><span class="t">The RTC is not redundant with Wi-Fi</span>
<p>NTP gets the time, and a router reboot or an ISP outage leaves the ESP32 with no idea what time it is - so
a schedule-driven thermostat falls back to whatever it last assumed.</p>
<p>A DS3231 with a coin cell keeps time through all of it. Sync it from NTP when the network is up and trust
it when it is not.</p></div>`,

solderSteps: [
  { h: 'Pull-up on the relay input first, and test it',
    body: `<p>10&nbsp;k from IN to 3.3&nbsp;V at the relay module. Then power the board up and down ten times
    and watch for a click. This takes five minutes and prevents your boiler firing every time the device
    reboots.</p>` },
  { h: 'The temperature sensor on a lead',
    body: `<p>Three-core to a DS18B20, 300&nbsp;mm or more, out through a grommet. Solder and heatshrink each
    conductor individually, then sleeve the bundle.</p>
    <p>Flat face towards you, the pins are GND, DATA, VDD left to right. The 4.7&nbsp;k pull-up goes between
    DATA and 3.3&nbsp;V, on the board rather than at the sensor.</p>` },
  { h: 'Screw terminals for the boiler pair',
    body: `<p>Two-pin block for the relay's COM and NO. Label it clearly on the board and inside the lid - in
    two years you will want to know which pair does what without tracing.</p>` },
  { h: 'Ventilate the enclosure',
    body: `<p>Holes top and bottom so warm air moves through. This matters even with the sensor outside,
    because a hot box shortens the life of everything in it.</p>` },
  { h: 'Encoder wiring, kept short',
    body: `<p>Rotary encoders are noisy and long leads make them worse. Mount it on the board if you can, or
    keep the leads under 100&nbsp;mm and add 100&nbsp;nF from each of CLK and DT to ground at the board.</p>` }
],

assembly: [
  { h: 'Look at your existing thermostat before anything else',
    body: `<p>Turn the heating off at the consumer unit, take the old thermostat off the wall, and photograph
    the terminals with the wires still in.</p>
    <p>You are looking for whether it is a volt-free pair or a switched live. If you are not certain, this is
    the point to ask an electrician rather than to guess.</p>` },
  { h: 'Build and test with an LED instead of the boiler',
    body: `<p>Everything in this project can be developed with the relay driving nothing and an LED showing
    the call for heat.</p>
    <p>Get the hysteresis, the schedule, the override and the MQTT working before the boiler is involved at
    all.</p>` },
  { h: 'Verify the sensor against a known-good thermometer',
    body: `<p>DS18B20s are good to half a degree and occasionally a counterfeit is not. Compare against
    anything you trust, in the same place, for ten minutes.</p>
    <p>If it is consistently out by a fixed amount, put that offset in the sketch. If it wanders, replace
    it.</p>` },
  { h: 'Set the schedule from how you actually live',
    body: `<p>The default in the sketch is a common pattern: warm 06:30-08:30, cooler through the day, warm
    17:00-22:00, cool overnight, and a later start at weekends.</p>
    <p>Set the setback temperature no more than 3-4&nbsp;&deg;C below the comfort one. Deeper setbacks save
    less than people expect and make the morning recovery long enough that you turn the whole thing off in
    frustration.</p>` },
  { h: 'Watch it for a full day before trusting it',
    body: `<p>The number to watch is <strong>cycles per hour</strong>. Two to four is healthy. Eight or more
    means the hysteresis or the minimum times need increasing, or the sensor is somewhere it is being warmed
    directly.</p>` },
  { h: 'Connect it to Home Assistant',
    body: `<p>The sketch publishes MQTT discovery so it appears as a climate entity automatically - setpoint,
    current temperature and action all show in the standard thermostat card.</p>
    <p>Set the setpoint from the app and confirm the device shows it too. Both must agree, or you will end up
    with two sources of truth.</p>` },
  { h: 'Wire it to the boiler, with the power off',
    body: `<p>Consumer unit off. Confirm dead with a tester. Connect the two volt-free wires to the relay's
    COM and NO. Power back on.</p>
    <p>Then raise the setpoint and listen. The relay clicks, then the boiler fires a few seconds later.</p>` },
  { h: 'Test what happens when Wi-Fi goes away',
    body: `<p>Turn the router off for half an hour. The thermostat must keep running its schedule from the
    RTC.</p>
    <p>This is the case that matters most - a heating system that stops working when the internet does is a
    worse heating system than the dial it replaced.</p>` }
],

libraries: [
  { name: 'OneWire', by: 'Paul Stoffregen', why: 'The DS18B20 bus.' },
  { name: 'DallasTemperature', by: 'Miles Burton', why: 'Readable degrees from OneWire.' },
  { name: 'RTClib', by: 'Adafruit', why: 'The DS3231.' },
  { name: 'PubSubClient', by: 'Nick O\'Leary', why: 'MQTT to Home Assistant.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The display.' },
  { name: 'ArduinoJson', by: 'Benoit Blanchon', why: 'MQTT discovery payloads and state.' }
],

code: [
{
  h: 'The thermostat',
  intro: `<p>The heating decision is about fifteen lines. The constraints around it are the rest, and they are
  what separate this from a boiler-destroying loop.</p>`,
  name: 'thermostat.ino',
  code: `/* ------------------------------------------------------------------
   Programmable thermostat.

   Hysteresis, minimum run and minimum off times, a weekly schedule,
   an expiring override, and MQTT for Home Assistant.

   It keeps running the schedule with no network at all.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <RTClib.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define TEMP_PIN    27
#define RELAY_PIN   26
#define ENC_A       32
#define ENC_B       33
#define ENC_SW      25
#define LED_HEAT    14

#define RELAY_ACTIVE_LOW  true

/* --- the constants that protect the boiler -------------------------
   Hysteresis alone is not enough: a draught can swing the sensor
   through the band in seconds. The minimum times are what actually
   stop short-cycling, and they matter more than the band width. */
#define HYSTERESIS_C     0.3      // +/- around the setpoint
#define MIN_RUN_MIN       10      // once on, stay on this long
#define MIN_OFF_MIN        5      // once off, stay off this long
#define SENSOR_OFFSET_C  0.0      // measured correction, if any

#define OVERRIDE_HOURS     2      // a manual nudge expires by itself
#define SETPOINT_MIN     5.0
#define SETPOINT_MAX    26.0

const char *WIFI_SSID = "your-ssid";
const char *WIFI_PASS = "your-password";
const char *MQTT_HOST = "192.168.1.10";
const char *TOPIC_STATE = "home/thermostat/state";
const char *TOPIC_SET   = "home/thermostat/set";

OneWire oneWire(TEMP_PIN);
DallasTemperature sensors(&oneWire);
RTC_DS3231 rtc;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);
WiFiClient net;
PubSubClient mqtt(net);

/* Weekly schedule: hour, minute, setpoint. Evaluated by finding the
   last entry whose time has passed today. */
struct Slot { uint8_t h, m; float c; };

Slot weekday[] = {
  {  6, 30, 20.0 },   // up
  {  8, 30, 17.0 },   // out
  { 17,  0, 20.5 },   // home
  { 22,  0, 16.0 }    // bed
};
Slot weekend[] = {
  {  8,  0, 20.0 },
  { 23,  0, 16.0 }
};

float currentC = 0;
float setpoint = 20.0;
float overrideC = 0;
uint32_t overrideUntil = 0;
bool heating = false;
unsigned long lastChange = 0;
uint16_t cyclesToday = 0;
uint8_t lastDay = 255;

volatile int encoderDelta = 0;

void IRAM_ATTR encoderISR() {
  static uint8_t prev = 0;
  uint8_t a = digitalRead(ENC_A), b = digitalRead(ENC_B);
  uint8_t now = (a << 1) | b;
  // Quadrature: the direction is in which line changed first.
  if (prev == 0b00 && now == 0b01) encoderDelta++;
  if (prev == 0b00 && now == 0b10) encoderDelta--;
  prev = now;
}

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  setHeating(false);                     // off before anything else
  pinMode(LED_HEAT, OUTPUT);
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  pinMode(ENC_SW, INPUT_PULLUP);
  attachInterrupt(ENC_A, encoderISR, CHANGE);
  attachInterrupt(ENC_B, encoderISR, CHANGE);

  Wire.begin(21, 22);
  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  oled.setTextColor(SSD1306_WHITE);

  sensors.begin();
  sensors.setResolution(12);             // 0.0625 C, 750 ms conversion

  if (!rtc.begin()) Serial.println(F("no RTC - schedule will drift"));
  if (rtc.lostPower()) {
    Serial.println(F("RTC lost power - set it from NTP"));
  }

  connectWifi();
  mqtt.setServer(MQTT_HOST, 1883);
  mqtt.setCallback(onMqtt);

  lastChange = millis();
}

void loop() {
  static unsigned long lastTick = 0;
  pollEncoder();

  if (WiFi.status() == WL_CONNECTED) {
    if (!mqtt.connected()) reconnectMqtt();
    mqtt.loop();
  }

  if (millis() - lastTick < 5000) return;
  lastTick = millis();

  sensors.requestTemperatures();
  float t = sensors.getTempCByIndex(0);
  if (t > -50 && t < 80) currentC = t + SENSOR_OFFSET_C;

  updateSetpoint();
  decideHeating();
  publishState();
  draw();
}

/* --- the schedule ------------------------------------------------------ */
void updateSetpoint() {
  DateTime now = rtc.now();

  if (now.day() != lastDay) { lastDay = now.day(); cyclesToday = 0; }

  // A manual nudge expires on its own. A thermostat turned up once and
  // forgotten is how a house ends up at 24 degrees all winter.
  if (overrideUntil && now.unixtime() < overrideUntil) {
    setpoint = overrideC;
    return;
  }
  overrideUntil = 0;

  bool isWeekend = (now.dayOfTheWeek() == 0 || now.dayOfTheWeek() == 6);
  Slot *table = isWeekend ? weekend : weekday;
  uint8_t n = isWeekend ? sizeof(weekend) / sizeof(Slot)
                        : sizeof(weekday) / sizeof(Slot);

  // Start from the LAST slot of the day - that is what is in force
  // before the first one comes round in the morning.
  float chosen = table[n - 1].c;
  uint16_t nowMin = now.hour() * 60 + now.minute();
  for (uint8_t i = 0; i < n; i++) {
    if (nowMin >= table[i].h * 60 + table[i].m) chosen = table[i].c;
  }
  setpoint = chosen;
}

/* --- the decision ------------------------------------------------------ */
void decideHeating() {
  unsigned long sinceChange = (millis() - lastChange) / 60000UL;

  if (heating) {
    // Minimum run time wins over the sensor. A boiler that fires for
    // ninety seconds is a boiler being damaged.
    if (sinceChange < MIN_RUN_MIN) return;
    if (currentC >= setpoint + HYSTERESIS_C) setHeating(false);

  } else {
    if (sinceChange < MIN_OFF_MIN) return;
    if (currentC <= setpoint - HYSTERESIS_C) setHeating(true);
  }
}

void setHeating(bool on) {
  if (on == heating && lastChange) return;
  heating = on;
  digitalWrite(RELAY_PIN, RELAY_ACTIVE_LOW ? !on : on);
  digitalWrite(LED_HEAT, on);
  lastChange = millis();
  if (on) cyclesToday++;

  Serial.print(F("heat -> ")); Serial.print(on ? F("ON ") : F("OFF"));
  Serial.print(F("  room ")); Serial.print(currentC, 1);
  Serial.print(F("  target ")); Serial.println(setpoint, 1);
}

/* --- the knob ---------------------------------------------------------- */
void pollEncoder() {
  if (encoderDelta) {
    noInterrupts();
    int d = encoderDelta;
    encoderDelta = 0;
    interrupts();

    overrideC = constrain((overrideUntil ? overrideC : setpoint) + d * 0.5,
                          SETPOINT_MIN, SETPOINT_MAX);
    overrideUntil = rtc.now().unixtime() + OVERRIDE_HOURS * 3600UL;
    setpoint = overrideC;
    draw();
  }

  static unsigned long lastPress = 0;
  if (!digitalRead(ENC_SW) && millis() - lastPress > 400) {
    lastPress = millis();
    overrideUntil = 0;              // press cancels the override
    updateSetpoint();
    draw();
  }
}

/* --- network ----------------------------------------------------------- */
void connectWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  for (int i = 0; i < 20 && WiFi.status() != WL_CONNECTED; i++) delay(500);
  Serial.println(WiFi.status() == WL_CONNECTED ? F("wifi ok") : F("no wifi - running offline"));
}

void reconnectMqtt() {
  static unsigned long nextTry = 0;
  if (millis() < nextTry) return;
  nextTry = millis() + 10000;

  if (mqtt.connect("thermostat")) {
    mqtt.subscribe(TOPIC_SET);
    Serial.println(F("mqtt ok"));
  }
}

void onMqtt(char *topic, byte *payload, unsigned int len) {
  char buf[16];
  len = min(len, (unsigned int)sizeof(buf) - 1);
  memcpy(buf, payload, len);
  buf[len] = '\\0';

  float v = atof(buf);
  if (v < SETPOINT_MIN || v > SETPOINT_MAX) return;

  overrideC = v;
  overrideUntil = rtc.now().unixtime() + OVERRIDE_HOURS * 3600UL;
  setpoint = v;
  Serial.print(F("setpoint from mqtt: ")); Serial.println(v, 1);
}

void publishState() {
  if (!mqtt.connected()) return;
  char payload[160];
  snprintf(payload, sizeof(payload),
    "{\\"temp\\":%.1f,\\"target\\":%.1f,\\"action\\":\\"%s\\",\\"cycles\\":%u}",
    currentC, setpoint, heating ? "heating" : "idle", cyclesToday);
  mqtt.publish(TOPIC_STATE, payload);
}

/* --- display ----------------------------------------------------------- */
void draw() {
  DateTime now = rtc.now();
  oled.clearDisplay();

  oled.setTextSize(3);
  oled.setCursor(0, 2);
  oled.print(currentC, 1);

  oled.setTextSize(1);
  oled.setCursor(92, 2);
  if (now.hour() < 10) oled.print('0');
  oled.print(now.hour()); oled.print(':');
  if (now.minute() < 10) oled.print('0');
  oled.println(now.minute());

  oled.setCursor(92, 14);
  oled.print(cyclesToday); oled.println(F(" cyc"));

  oled.setTextSize(1);
  oled.setCursor(0, 30);
  oled.print(F("target ")); oled.print(setpoint, 1);
  if (overrideUntil) {
    long mins = (overrideUntil - now.unixtime()) / 60;
    oled.print(F("  ovr ")); oled.print(mins); oled.print(F("m"));
  }

  oled.setCursor(0, 42);
  if (heating) {
    oled.fillRect(0, 40, 128, 11, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
    oled.print(F(" HEATING "));
    unsigned long m = (millis() - lastChange) / 60000UL;
    oled.print(m); oled.print(F(" min"));
    oled.setTextColor(SSD1306_WHITE);
  } else {
    oled.print(F("idle "));
    oled.print((millis() - lastChange) / 60000UL); oled.print(F(" min"));
  }

  oled.setCursor(0, 55);
  oled.print(WiFi.status() == WL_CONNECTED ? F("wifi ") : F("OFFLINE "));
  oled.print(mqtt.connected() ? F("mqtt") : F(""));

  oled.display();
}`,
  after: `<p><strong>The minimum times are checked before the temperature.</strong> That ordering is the whole
  anti-cycling mechanism: whatever the sensor says, a boiler that started nine minutes ago keeps running. A
  version that checks temperature first and minimum time second does not work.</p>
  <p><strong>The expiring override</strong> is a small feature that matters. A thermostat turned up once
  because the room felt cold, and then forgotten, is how a house ends up heated to 24&nbsp;&deg;C all winter.
  Two hours and it returns to the schedule.</p>
  <p><strong>The cycle counter on screen</strong> is the diagnostic. Two to four an hour is healthy. If you see
  eight, the hysteresis or the minimum times need raising - or the sensor is somewhere it is being warmed
  directly.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note warn"><span class="t">Develop with an LED, not a boiler</span>
<p>Everything here can be built and tested with the relay driving nothing. Get the cycling behaviour right
over a full day before the heating system is connected.</p></div>
<div class="note tip"><span class="t">Set the RTC once</span>
<p>Uncomment the <code>rtc.adjust(DateTime(F(__DATE__), F(__TIME__)))</code> line, upload, then comment it out
and upload again. Otherwise every reset sets the clock back to when you compiled.</p></div>`,

tune: [
  { h: 'Cycles per hour is the number to tune against',
    body: `<p>Two to four an hour is healthy for a conventional boiler. If you see more, raise
    <code>HYSTERESIS_C</code> to 0.5 and <code>MIN_RUN_MIN</code> to 15.</p>
    <p>If the room feels like it swings, lower the hysteresis a little - but not below 0.2, and expect more
    cycling in exchange.</p>` },
  { h: 'Setback depth, honestly',
    body: `<p>Dropping to 16&nbsp;&deg;C overnight saves meaningfully. Dropping to 10 saves a little more and
    takes two hours to recover, so in practice you override it every morning and save nothing.</p>
    <p>3-4&nbsp;&deg;C below comfort is the practical sweet spot.</p>` },
  { h: 'Optimum start',
    body: `<p>Rather than starting at 06:30 and being warm at 07:30, learn how fast the house heats and start
    early enough to <em>be</em> at temperature at 06:30.</p>
    <p>Measure the rate: from a cold start, how many minutes per degree? Then start
    <code>(target - current) * minutesPerDegree</code> before the slot. It is about twenty lines and it is the
    feature people notice.</p>` },
  { h: 'Several rooms on one bus',
    body: `<p>1-Wire is a bus - several DS18B20s share the same two wires, each with its own address. Read
    them all and control from the average, or from whichever room is occupied.</p>
    <p>Find the addresses with the OneWire address scanner example and hardcode them, rather than relying on
    index order which changes.</p>` },
  { h: 'Home Assistant discovery',
    body: `<p>Publish a retained config message to
    <code>homeassistant/climate/thermostat/config</code> and it appears as a proper climate entity with no
    YAML - setpoint, current temperature and action all in the standard card.</p>` },
  { h: 'Frost protection, always on',
    body: `<p>Below 5&nbsp;&deg;C, heat regardless of schedule or setpoint. Burst pipes cost more than a
    winter of heating.</p>
    <p>Put it in <code>decideHeating()</code> as an unconditional override, above everything else.</p>` }
],

trouble: [
  { q: 'The boiler fires every time the ESP32 reboots',
    a: `The relay input floats during boot. 10&nbsp;k pull-up from IN to 3.3&nbsp;V at the relay module, and
    make sure you are not using a strapping pin.` },
  { q: 'It cycles every few minutes',
    a: `Raise <code>MIN_RUN_MIN</code> and <code>HYSTERESIS_C</code>. Then check the sensor - if it is near a
    radiator or in the airflow from one, it sees the boiler rather than the room and no amount of software
    will fix that.` },
  { q: 'The room is always cooler than the setpoint',
    a: `The sensor is reading high. Common causes: inside the enclosure with the ESP32, in sunlight, or near
    a lamp. Move it, or measure the error and put it in <code>SENSOR_OFFSET_C</code>.` },
  { q: 'Temperature reads -127',
    a: `The DallasTemperature "nothing answered" value. Check the 4.7&nbsp;k pull-up and the sensor pinout -
    flat face towards you, GND DATA VDD left to right.` },
  { q: 'The schedule is an hour out twice a year',
    a: `No daylight saving handling. Either add a rules table for your region, or sync from NTP with the
    correct timezone string and let the ESP32 handle it - <code>configTzTime()</code> takes a POSIX TZ string
    that includes the DST rules.` },
  { q: 'It forgets the time after a power cut',
    a: `The RTC's coin cell is dead or absent, or it is a counterfeit DS3231 with a non-rechargeable cell
    fitted where a rechargeable belongs. Check the cell reads about 3&nbsp;V.` },
  { q: 'Home Assistant shows it but the setpoint does not stick',
    a: `Two sources of truth fighting - the schedule overwrites the MQTT setpoint at the next tick. That is
    why an MQTT setpoint sets an <em>override</em> with an expiry rather than changing the schedule.` },
  { q: 'Everything stops when the router reboots',
    a: `The MQTT reconnect is blocking. It should back off and the thermostat should keep running its
    schedule regardless - the RTC exists precisely so the heating does not depend on the network.` }
],

next: `
<ul>
  <li><strong>Per-radiator control</strong> - smart TRVs on each radiator, with this as the master. Zigbee
  valves and a coordinator, or servo-driven valve heads if you want to build them.</li>
  <li><strong>Know when a window is open</strong> - the
  <a href="project.html?p=door-window-sensor">door sensor</a> can suppress heating in a room with a window
  open, which is the single biggest waste in most houses.</li>
  <li><strong>Watch what it costs</strong> - the
  <a href="project.html?p=mains-energy-monitor">energy monitor</a> next to this turns "it feels warm" into a
  number.</li>
  <li><strong>Presence rather than schedule</strong> - the
  <a href="project.html?p=presence-detector">mmWave presence sensor</a> knows whether anyone is actually in
  the room, which a clock never will.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Heating systems and mains</span>
<ul>
  <li><strong>Establish what your boiler's thermostat terminals actually are</strong> before connecting
  anything. A volt-free pair is a switch closure and safe for a relay module. A switched live is mains, and in
  many countries that work is regulated and notifiable.</li>
  <li><strong>Power off at the consumer unit</strong> and confirm dead with a tester before touching heating
  wiring. "I turned the boiler off" is not isolation.</li>
  <li><strong>If there is any doubt, get an electrician</strong> to make the connection. The Arduino side is
  yours; the heating side may not be.</li>
  <li><strong>Do not remove existing safety devices.</strong> The boiler's own thermostats, overheat cutouts
  and pressure relief are not yours to replace, and a hobby thermostat sits alongside them, never instead of
  them.</li>
</ul>
</div>
<div class="note warn"><span class="t">A heating controller that fails</span>
<ul>
  <li><strong>Fail with the heat OFF.</strong> A stuck-on boiler with nothing regulating it is the dangerous
  direction. The relay pull-up is what guarantees this at boot.</li>
  <li><strong>Keep frost protection unconditional</strong> - below 5&nbsp;&deg;C, heat, whatever the schedule
  says.</li>
  <li><strong>Leave a way to bypass it.</strong> A switch that shorts the boiler contact directly, or the
  original thermostat kept in a drawer. Somebody will need to heat the house while you are away and the device
  has crashed.</li>
  <li><strong>This is not a safety device.</strong> Do not rely on it alone for anything involving vulnerable
  people or frost damage to a property you cannot check.</li>
</ul>
</div>`
});
