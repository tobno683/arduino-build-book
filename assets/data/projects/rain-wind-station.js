/* Counting pulses from two reed switches, outdoors, for years. Harder than it sounds. */
AB.addProject({
slug: 'rain-wind-station',
title: 'Rain gauge and wind station',
cat: 'environment',
level: 3,
time: '7 hours',
solder: true,
board: 'ESP32',
tags: ['weather', 'rain gauge', 'anemometer', 'reed switch', 'interrupts', 'debounce', 'deep sleep', 'outdoor'],
blurb: 'A tipping bucket and a spinning cup, counting pulses in the rain for years at a time. The hardware is two reed switches. Everything difficult is about counting them correctly and surviving outdoors.',

skills: ['Interrupt-driven counting', 'Hardware vs software debounce', 'Calibration by measurement', 'Gust vs average', 'Deep sleep with wake sources', 'Outdoor enclosure design'],

intro: `
<p>The <a href="project.html?p=desk-weather-station">desk weather station</a> measures temperature, pressure
and humidity from one chip. Rain and wind are different: there is no chip, only mechanisms.</p>
<p>A tipping bucket is a tiny seesaw that fills, tips, empties and closes a reed switch. An anemometer is three
cups on a spindle with a magnet passing a reed switch once per turn. Both produce nothing but pulses, and both
have been made this way for over a century because it works.</p>
<p>So the electronics is two switches. The project is everything around that: counting reliably when the wind
is producing twenty pulses a second, not counting twice when a contact bounces, running for a year on a
battery, and building something that survives being rained on continuously.</p>`,

what: [
  'Count rainfall in millimetres, with a resolution set by your bucket size.',
  'Measure wind speed, and separately the gust - which is what actually matters.',
  'Not miscount, either by missing fast pulses or by counting bounces twice.',
  'Run for a season on batteries, waking only when something happens.',
  'Report over LoRa or Wi-Fi to somewhere indoors.'
],

how: `
<p><strong>A tipping bucket measures volume, not depth.</strong> Each tip is a fixed volume of water, and to
turn that into millimetres you need the collector's area. A typical hobby gauge is 0.2794&nbsp;mm per tip -
that oddly specific number is 0.011 inches, because the mechanism was designed in imperial units.</p>
<p>Do not trust the spec. Measure it: pour a known volume through slowly and count the tips. Pouring
100&nbsp;ml through a 55&nbsp;mm diameter funnel should give you a specific number, and if it does not, your
calibration constant is now a measured value rather than a hopeful one.</p>
<p>Pour slowly. Fast pouring overfills the bucket while it is tipping and under-counts, which is also the
gauge's genuine error mode in torrential rain.</p>

<p><strong>Contact bounce, and why it matters differently for each sensor.</strong> A reed switch closing
chatters for a millisecond or two. For rain, one tip should be one count, so bounces must be suppressed - a
20&nbsp;ms lockout after each pulse is plenty, since buckets cannot physically tip faster than a few times a
second.</p>
<p>For wind, you cannot use a lockout that long. At 100&nbsp;km/h a cup anemometer spins at over 20 revolutions
per second, so pulses are 50&nbsp;ms apart and a 20&nbsp;ms blanking is uncomfortably close. Use a shorter
window - 3&nbsp;ms - or an RC filter in hardware.</p>
<p>Getting this backwards is the classic bug: a debounce tuned for rain silently caps your wind readings at the
top of the range, and you only find out in a storm.</p>

<p><strong>Interrupts, and the one rule about them.</strong> Both sensors must be counted by interrupt, because
polling misses pulses while the board is doing anything else. The handler must do almost nothing - increment a
counter, note the time, return. Anything involving Serial, Wi-Fi or floating point does not belong there.</p>
<p>The counters must be <code>volatile</code>, and reading a multi-byte counter while an interrupt might fire
needs the interrupt briefly disabled or you can read a half-updated value.</p>

<p><strong>Average wind and gust are different measurements.</strong> Meteorologically, wind speed is a
ten-minute average and a gust is the highest three-second average within that period. Reporting only the
average hides the thing that takes fence panels off.</p>
<p>So keep a short rolling window for gusts and a long one for the average, from the same pulse stream.</p>

<p><strong>Rain resets at a boundary, wind does not.</strong> Rainfall is cumulative and conventionally
resets at 9 am local time, not midnight. Wind is instantaneous. That difference shapes how you store them:
rain as a running total plus daily buckets, wind as a series of recent samples.</p>

<p><strong>Deep sleep with two wake sources.</strong> The ESP32 can sleep at around 10&nbsp;uA and wake on a
pin change. Wake on a rain tip, count it, sleep again. Wind needs a different approach - wake on a timer every
few minutes, count for thirty seconds, sleep - because waking for every pulse in a gale would never sleep at
all.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Deep sleep with pin wake, and enough interrupts. A board with a low-quiescent regulator matters more than the chip here.' },
  { id: 'raingauge', qty: 1, note: 'Tipping bucket with a reed switch output. Calibrate it yourself rather than trusting the figure on the box.' },
  { id: 'anemometer', qty: 1, note: 'Cup anemometer and wind vane. The vane is a resistor network - eight directions, eight resistances.' },
  { id: 'bme280', qty: 1, note: 'Temperature, pressure and humidity, so this is a complete station rather than half of one.' },
  { id: 'lora', qty: 1, note: 'Reaches the house from the bottom of a garden, which Wi-Fi generally does not.' },
  { id: 'ant-868', qty: 1 },
  { id: 'res10k', qty: 2, note: 'Pull-ups for the two reed switches.' },
  { id: 'cap100n', qty: 2, note: 'Across each reed switch - hardware debounce, and it costs almost nothing.' },
  { id: 'solar6v', qty: 1, note: 'It lives outdoors in daylight. A season on batteries is possible; indefinite on solar is better.' },
  { id: 'tp4056', qty: 1 },
  { id: 'lipo2000', qty: 1, note: 'See the safety note about lithium cells outdoors in winter.' },
  { id: 'box-ip65', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'heatshrink', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',  at: [0, 70] },
    { id: 'bb',   comp: 'bb400',  at: [0, 4] },
    { id: 'rain', comp: 'reed',   at: [-62, -52] },
    { id: 'wind', comp: 'reed',   at: [-20, -52] },
    { id: 'env',  comp: 'bme280', at: [22, -54] },
    { id: 'rad',  comp: 'lora',   at: [64, -50] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'rain.A',   to: 'mcu.D33',  color: 'green',  note: 'Rain reed switch - an RTC-capable pin, so it can wake the board from deep sleep' },
    { from: 'rain.B',   to: 'bb.T-6',  color: 'black',  note: 'Rain switch to ground' },
    { from: 'bb.e6',    to: 'bb.T+6',  color: 'red',    note: '10 k pull-up and 100 nF to ground on the rain line' },
    { from: 'wind.A',   to: 'mcu.D27', color: 'blue',   note: 'Anemometer reed switch' },
    { from: 'wind.B',   to: 'bb.T-12', color: 'black',  note: 'Anemometer switch to ground' },
    { from: 'bb.e12',   to: 'bb.T+12', color: 'red',    note: '10 k pull-up and 100 nF on the wind line' },
    { from: 'env.VIN',  to: 'bb.T+17', color: 'red',    note: 'BME280 power' },
    { from: 'env.GND',  to: 'bb.T-17', color: 'black',  note: 'BME280 ground' },
    { from: 'env.SDA',  to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'env.SCL',  to: 'mcu.D22', color: 'blue',   note: 'I2C clock' },
    { from: 'rad.VCC',  to: 'bb.T+22', color: 'red',    note: 'Radio power' },
    { from: 'rad.GND',  to: 'bb.T-22', color: 'black',  note: 'Radio ground' },
    { from: 'rad.SCK',  to: 'mcu.D18', color: 'blue',   note: 'SPI clock' },
    { from: 'rad.MISO', to: 'mcu.D19', color: 'green',  note: 'SPI data in' },
    { from: 'rad.MOSI', to: 'mcu.D23', color: 'white',  note: 'SPI data out' },
    { from: 'rad.NSS',  to: 'mcu.D5',  color: 'purple', note: 'Radio chip select' },
    { from: 'rad.RST',  to: 'mcu.D14', color: 'grey',   note: 'Radio reset' },
    { from: 'rad.DIO0', to: 'mcu.D26', color: 'yellow', note: 'Transmit-done interrupt' }
  ]
},

wireIntro: `<p>Two switches, a sensor and a radio. Each switch needs a pull-up and a small capacitor, and the
rain switch specifically needs to be on a pin that can wake the board from deep sleep.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Only some pins can wake from deep sleep</span>
<p>On an ESP32, deep-sleep wake on a pin needs an RTC-capable GPIO - 0, 2, 4, 12-15, 25-27, 32-39. The rain
switch is on 33 for this reason.</p>
<p>Put it on an ordinary pin and everything works on the bench and the station never wakes in the field.</p></div>

<div class="note tip"><span class="t">Hardware debounce is nearly free</span>
<p>A 100&nbsp;nF capacitor across each reed switch, with the 10&nbsp;k pull-up, gives a time constant of about
a millisecond. That removes most of the chatter before the software sees it, which means the software filter
can be shorter - and a shorter filter is what keeps high wind speeds accurate.</p></div>

<div class="note"><span class="t">Wire the vane's resistor network carefully</span>
<p>A wind vane is eight reed switches with different resistors, read as a voltage divider. Adjacent directions
can both close at once, giving a ninth and tenth value. Measure all sixteen possible voltages on your own vane
and build the lookup table from that, not from a datasheet.</p></div>`,

solderIntro: `<p>The soldering is simple. The outdoor construction is not, and it is what decides whether this
lasts one winter or ten.</p>`,

solderSteps: [
  { h: 'Pull-ups and capacitors at the board',
    body: `<p>Both filters mounted at the board end rather than at the sensor. Then the long runs outdoors are
    just two wires each and the filtering is somewhere you can reach.</p>` },
  { h: 'Every outdoor joint heatshrunk and sealed',
    body: `<p>Adhesive-lined heatshrink over every soldered joint on the sensor cables. Water will find any
    joint that is not sealed, and a corroded reed switch connection produces phantom counts - which look like
    rain that did not happen.</p>` },
  { h: 'Cable entries from below, always',
    body: `<p>Glands on the underside of the enclosure. A cable entering from the top is a funnel. Leave a drip
    loop so water runs off the cable before it reaches the gland.</p>` },
  { h: 'Vent the enclosure',
    body: `<p>A small hole on the underside, or a proper vent membrane. A sealed box heats in the sun, cools at
    night and condenses inside - which is how sealed boxes end up wetter than vented ones.</p>` },
  { h: 'Mount the anemometer clear of everything',
    body: `<p>Standard practice is ten metres, which nobody has. What matters is being clear of buildings, walls
    and trees by several times their height - readings taken in a building's wind shadow are consistently and
    unfixably low.</p>` },
  { h: 'Level the rain gauge, properly',
    body: `<p>Use a spirit level. A tilted tipping bucket needs different amounts of water for each side of the
    seesaw, so it over-counts in one direction and under-counts in the other, and the error is invisible.</p>` }
],

libraries: [
  { name: 'Adafruit BME280', by: 'Adafruit', why: 'Temperature, pressure, humidity.' },
  { name: 'LoRa', by: 'Sandeep Mistry', why: 'The radio link indoors.' }
],

code: [{
  name: 'weather_station.ino',
  code: `/* ------------------------------------------------------------------
   Rain gauge and wind station - ESP32

   Rain wakes the board from deep sleep. Wind is sampled on a timer,
   because waking for every pulse in a gale would never sleep at all.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <SPI.h>
#include <LoRa.h>
#include <Adafruit_BME280.h>

#define RAIN_PIN  33            // must be RTC-capable to wake from sleep
#define WIND_PIN  27
#define VANE_PIN  35

// Measure this yourself by pouring a known volume through. The figure on
// the box is a nominal value and yours will differ by a few percent.
const float MM_PER_TIP = 0.2794;

/* One pulse per revolution. 2.4 km/h per Hz is the common figure for the
   standard plastic cup assembly - again, worth checking against a car
   window on a still day if you want it right. */
const float KMH_PER_HZ = 2.4;

Adafruit_BME280 bme;

// Survives deep sleep. Anything not marked RTC_DATA_ATTR is lost.
RTC_DATA_ATTR uint32_t tipCount = 0;
RTC_DATA_ATTR uint32_t bootCount = 0;

volatile uint32_t windPulses = 0;
volatile uint32_t lastWindUs = 0;

void IRAM_ATTR onWindPulse() {
  uint32_t now = micros();
  /* 3 ms, not 20. At 100 km/h the cups turn 20 times a second, so pulses
     are 50 ms apart - a rain-sized debounce would silently cap the top
     of the wind range, and you would only find out in a storm. */
  if (now - lastWindUs < 3000) return;
  lastWindUs = now;
  windPulses++;
}

void setup() {
  Serial.begin(115200);
  bootCount++;

  pinMode(RAIN_PIN, INPUT_PULLUP);
  pinMode(WIND_PIN, INPUT_PULLUP);

  esp_sleep_wakeup_cause_t why = esp_sleep_get_wakeup_cause();

  if (why == ESP_SLEEP_WAKEUP_EXT0) {
    // Woken by a bucket tip. Count it and go straight back to sleep -
    // no radio, no sensors, a few milliseconds awake.
    tipCount++;
    Serial.printf("tip %u\\n", tipCount);
    sleepNow(false);
  }

  // Timer wake, or first boot: take a full reading.
  Wire.begin();
  if (!bme.begin(0x76)) bme.begin(0x77);

  LoRa.setPins(5, 14, 26);
  LoRa.begin(868E6);
  LoRa.setSpreadingFactor(10);

  measureAndSend();
  sleepNow(true);
}

void loop() { /* never reached - everything happens in setup */ }

void measureAndSend() {
  attachInterrupt(WIND_PIN, onWindPulse, FALLING);
  windPulses = 0;

  /* Sample wind for 30 s and track the fastest 3 s window inside it.
     Average wind and gust are different measurements: the average is what
     the day felt like, the gust is what takes fence panels off. */
  uint32_t start = millis();
  uint32_t lastMark = 0, marksAt = 0;
  float gustHz = 0;

  while (millis() - start < 30000) {
    if (millis() - marksAt >= 3000) {
      uint32_t inWindow = windPulses - lastMark;
      float hz = inWindow / 3.0f;
      if (hz > gustHz) gustHz = hz;
      lastMark = windPulses;
      marksAt = millis();
    }
    delay(20);
  }
  detachInterrupt(WIND_PIN);

  float avgHz = windPulses / 30.0f;
  float avgKmh  = avgHz * KMH_PER_HZ;
  float gustKmh = gustHz * KMH_PER_HZ;
  float rainMm  = tipCount * MM_PER_TIP;

  char packet[96];
  snprintf(packet, sizeof(packet),
           "R%.2f,W%.1f,G%.1f,D%d,T%.1f,H%.0f,P%.0f",
           rainMm, avgKmh, gustKmh, windDirection(),
           bme.readTemperature(), bme.readHumidity(),
           bme.readPressure() / 100.0f);

  LoRa.beginPacket();
  LoRa.print(packet);
  LoRa.endPacket();
  Serial.println(packet);
}

/* The vane is eight reed switches with different resistors in a divider.
   Adjacent pairs can close together, giving sixteen usable values -
   measure yours and build this table from real readings. */
int windDirection() {
  int raw = analogRead(VANE_PIN);
  const struct { int adc; int deg; } table[] = {
    {  310,   0}, {  460,  45}, {  620,  90}, {  900, 135},
    { 1450, 180}, { 2100, 225}, { 2900, 270}, { 3500, 315}
  };
  int best = 0, bestDiff = 99999;
  for (auto &e : table) {
    int d = abs(raw - e.adc);
    if (d < bestDiff) { bestDiff = d; best = e.deg; }
  }
  return best;
}

void sleepNow(bool timed) {
  // Wake on the rain switch going low - one tip, one wake.
  esp_sleep_enable_ext0_wakeup((gpio_num_t)RAIN_PIN, 0);
  if (timed) esp_sleep_enable_timer_wakeup(5ULL * 60 * 1000000);  // 5 min
  Serial.flush();
  esp_deep_sleep_start();
}`
}],

trouble: [
  { q: 'Rainfall recorded on a dry night',
    a: `Water in a connector, or a corroded reed switch contact. Both produce intermittent closures. Also check
    the gauge is not somewhere that drips - under a tree or a gutter overhang is enough.` },
  { q: 'Wind speed never exceeds a certain value',
    a: `The debounce window is too long, so pulses above that rate are filtered out. This is the classic bug,
    and it presents as a station that never records a gust. 3&nbsp;ms is the right order.` },
  { q: 'Board never wakes on a rain tip',
    a: `The switch is on a pin that is not RTC-capable. Only 0, 2, 4, 12-15, 25-27 and 32-39 can wake an
    ESP32 from deep sleep.` },
  { q: 'Rain count resets every wake',
    a: `The counter is not marked <code>RTC_DATA_ATTR</code>. Everything else in RAM is lost across deep
    sleep.` },
  { q: 'Wind direction jumps between two adjacent values',
    a: `The vane is genuinely between two positions and both switches are closing. That is normal; average over
    several readings, or use the intermediate values which is what the vane is designed to give.` },
  { q: 'Rainfall reads consistently low in heavy rain',
    a: `Inherent to tipping buckets - water continues to enter while the bucket is mid-tip and is not counted.
    All tipping gauges do this. Nothing in software fixes it.` },
  { q: 'Condensation inside the enclosure',
    a: `Sealed rather than vented. A drain hole on the underside is better than perfect sealing, because no
    sealing is ever perfect and the box needs a way to dry out.` },
  { q: 'Battery flat after a week',
    a: `Something is keeping the board awake, or a regulator has a high quiescent current. Measure the sleep
    current - it should be tens of microamps. Milliamps means something is still powered.` }
],

safety: `
<div class="note warn"><span class="t">Lithium cells outdoors</span>
<p>Consistent with the other battery projects here: a lithium cell must not be charged below 0&nbsp;degrees.
Charging a cold cell plates metallic lithium onto the anode, which is permanent and can cause an internal
short later.</p>
<p>A solar-charged station outdoors in winter will absolutely try to charge at -5&nbsp;degrees on a sunny
morning. Either use a charger with a temperature cutoff and a thermistor against the cell, or use LiFePO4,
which tolerates cold charging far better and suits this application well.</p>
<p>Mount the mast so that it cannot fall onto anything, and remember that a metal pole in an open garden is
worth thinking about in a thunderstorm.</p></div>`,

next: `
<ul>
  <li><strong>Calibrate against the Met Office</strong> or your nearest official station over a wet month. You
  will find your gauge reads a few percent low, and then you will know by how much.</li>
  <li><strong>Feed it to the <a href="project.html?p=epaper-dashboard">wall dashboard</a></strong> - rainfall
  today and the current gust is a genuinely useful thing to have by the door.</li>
  <li><strong>Publish to Weather Underground or the Met Office WOW network</strong>. Both accept amateur
  stations and it makes the data useful to somebody else.</li>
  <li><strong>Add a soil moisture probe</strong> and compare it to rainfall. The lag between the two is
  surprisingly long and immediately changes how you water a garden.</li>
</ul>`
});
