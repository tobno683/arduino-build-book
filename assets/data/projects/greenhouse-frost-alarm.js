/* Predicting frost, not reporting it. By the time you measure it, the plants are gone. */
AB.addProject({
slug: 'greenhouse-frost-alarm',
title: 'Greenhouse frost alarm',
cat: 'environment',
level: 2,
time: '4 hours',
solder: true,
board: 'ESP32',
tags: ['frost', 'greenhouse', 'dew point', 'radiative cooling', 'prediction', 'lora', 'deep sleep', 'ds18b20'],
blurb: 'Wakes you at 2 am when the greenhouse is heading for freezing - an hour before it gets there. Reporting frost is useless; by then it has already happened. This predicts it, and the physics for doing that is genuinely interesting.',

skills: ['Dew point and frost point', 'Radiative cooling', 'Extrapolating a trend', 'Multiple sensor placement', 'Low-power design', 'Alarming without crying wolf'],

intro: `
<p>A late frost kills seedlings in a night. The difference between losing them and not is usually a fleece
cover thrown over at 11 pm, which requires knowing at 11 pm that it is going to happen.</p>
<p>A thermometer that says "it is now -1" is too late. What you want is "at this rate, and given the humidity
and the clear sky, this greenhouse reaches zero at about 3 am" - and that is a prediction you can make with two
temperature sensors and a humidity reading.</p>
<p>The physics is the interesting bit, and it is why a clear still night is far more dangerous than a cloudy
windy one at the same temperature.</p>`,

what: [
  'Measure inside and outside temperature, plus humidity.',
  'Predict when zero will be reached, an hour or more ahead.',
  'Understand why a clear night is dangerous and a cloudy one is not.',
  'Alarm once, loudly, indoors - and not again every five minutes.',
  'Run all winter on batteries in a shed with no mains.'
],

how: `
<p><strong>Dew point sets the floor, until it does not.</strong> As air cools it eventually reaches the
temperature at which its moisture condenses. Condensation releases latent heat, which slows the cooling
dramatically - so the temperature tends to stall near the dew point for a while.</p>
<p>If the dew point is 4&nbsp;degrees, frost tonight is unlikely. If it is -2, the air is dry, there is little
latent heat to release, and the temperature will sail through zero. <strong>Dew point is a better frost
predictor than the current temperature.</strong></p>
<p>Below freezing it is the frost point rather than the dew point, and the arithmetic differs slightly - but
the Magnus formula is close enough over the range that matters here.</p>

<p><strong>Radiative cooling is why clear nights are dangerous.</strong> Every surface radiates heat to the
sky. On a cloudy night, clouds radiate much of it back and the ground barely cools. On a clear night that
energy goes to space, and surfaces can fall several degrees <em>below</em> air temperature.</p>
<p>This is why frost forms on car roofs when the air never dropped below 2, and why a greenhouse with a glass
roof is not the protection people assume - glass is fairly transparent to the infrared doing the escaping.</p>
<p>You cannot measure cloud directly with these parts, but you can infer it: a fast, steady fall in temperature
after sunset means clear skies. A slow or erratic one means cloud.</p>

<p><strong>Extrapolate, carefully.</strong> Fit a slope to the last 90 minutes and project it forward. A
straight line is wrong - cooling slows as the ground cools and stalls near the dew point - so the honest thing
is to project and then clamp the prediction at the dew point, which is where the curve will flatten.</p>
<p>Ninety minutes is a compromise: short enough to catch a change in conditions, long enough not to be
dominated by noise.</p>

<p><strong>Two sensors, and the difference is the information.</strong> Inside and outside. The inside one
tells you about the plants; the difference tells you how much thermal protection the structure is actually
providing tonight, which varies enormously with wind and cloud.</p>
<p>A greenhouse typically holds 1-3 degrees over outside on a still night, and almost nothing in wind. Knowing
your own number is what makes the prediction useful.</p>

<p><strong>Alarming well is a design problem.</strong> An alarm that fires repeatedly gets muted, and a muted
alarm is worse than none. One loud alarm, acknowledged with a button, then silence unless conditions get
significantly worse. Predicting an hour ahead is what makes a single alarm enough.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Deep sleep between readings. It only needs to wake every ten minutes all winter.' },
  { id: 'ds18b20', qty: 2, note: 'Inside and outside. Waterproof, and they share one data pin on the OneWire bus.' },
  { id: 'bme280', qty: 1, note: 'Humidity, which is what makes the dew point calculation possible. The temperature and pressure are a bonus.' },
  { id: 'res4k7', qty: 1, note: 'OneWire pull-up. Without it there is no bus at all.' },
  { id: 'lora', qty: 2, note: 'Greenhouses rarely have Wi-Fi. One in the greenhouse, one indoors.' },
  { id: 'ant-868', qty: 2 },
  { id: 'nano', qty: 1, note: 'The indoor receiver, which only has to listen and make a noise.' },
  { id: 'buzzer', qty: 1, note: 'Loud enough to wake you. This is the entire purpose of the indoor unit.' },
  { id: 'oled13', qty: 1, note: 'Indoor display - current temperature and the predicted time to zero.' },
  { id: 'button', qty: 1, note: 'Acknowledge. One alarm, then quiet.' },
  { id: 'batt-aa6', qty: 1, note: 'Alkaline AAs rather than lithium - see the safety note. They survive a shed in winter far better.' },
  { id: 'box-ip65', qty: 1 },
  { id: 'perfboard', qty: 2 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'heatshrink', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',   at: [0, 64] },
    { id: 'bb',   comp: 'bb400',   at: [0, 0] },
    { id: 't1',   comp: 'ds18b20', at: [-64, -48] },
    { id: 't2',   comp: 'ds18b20', at: [-22, -48] },
    { id: 'env',  comp: 'bme280',  at: [20, -50] },
    { id: 'rad',  comp: 'lora',    at: [62, -46] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 't1.VCC',   to: 'bb.T+5',  color: 'red',    note: 'Inside probe power' },
    { from: 't1.GND',   to: 'bb.T-5',  color: 'black',  note: 'Inside probe ground' },
    { from: 't1.DATA',  to: 'mcu.D4',  color: 'yellow', note: 'OneWire data - both probes share this one pin' },
    { from: 't2.VCC',   to: 'bb.T+9',  color: 'red',    note: 'Outside probe power' },
    { from: 't2.GND',   to: 'bb.T-9',  color: 'black',  note: 'Outside probe ground' },
    { from: 't2.DATA',  to: 'mcu.D4',  color: 'yellow', note: 'Same OneWire bus - each probe has a unique address' },
    { from: 'bb.e5',    to: 'bb.T+13', color: 'red',    note: '4.7 k pull-up from the data line to 3.3 V' },
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
    { from: 'rad.DIO0', to: 'mcu.D26', color: 'orange', note: 'Transmit done' }
  ]
},

wireIntro: `<p>Two temperature probes on one OneWire bus, a humidity sensor on I2C, and the radio on SPI. The
only unusual thing is that both probes genuinely share a single data wire.</p>`,

wireNotes: `
<div class="note tip"><span class="t">Two sensors, one wire, because each has a unique address</span>
<p>Every DS18B20 has a 64-bit serial number burned in at the factory. The bus is addressed, so both probes sit
on the same pin and the library asks each one by name.</p>
<p>Read the addresses once with an example sketch and hard-code them, or the "inside" and "outside" probes can
swap round on the bus after a reboot - which produces a station that occasionally reports the wrong one and is
maddening to diagnose.</p></div>

<div class="note warn"><span class="t">Shield the outside sensor from the sky</span>
<p>A bare sensor under a clear sky radiates heat exactly like everything else and reads several degrees below
the actual air temperature. That is a real effect, not an error, but it is not what you want to measure.</p>
<p>Put it in a small ventilated shield - even an upturned plant pot with the bottom cut out - so it sees air
and not sky.</p></div>

<div class="note"><span class="t">4.7 k pull-up</span>
<p>Same as every OneWire project. Without it the bus finds no devices and both probes read -127.</p></div>`,

solderIntro: `<p>Two small boards, both simple. The outdoor one needs sealing properly because it sits in a
greenhouse all winter with condensation running down the inside of the glass.</p>`,

solderSteps: [
  { h: 'Read the probe addresses before anything else',
    body: `<p>Wire one probe, run an address-scanning sketch, note the 64-bit address. Then the other. Label
    the cables physically, and put the addresses in the sketch.</p>
    <p>Do this first - it is much harder once both are sealed into an enclosure.</p>` },
  { h: 'Pull-up at the board',
    body: `<p>One 4.7&nbsp;k from the data line to 3.3&nbsp;V, mounted on the board rather than at a probe.</p>` },
  { h: 'Seal the probe cable entries',
    body: `<p>Glands from below, drip loops, and adhesive heatshrink on any joint. A greenhouse is a
    condensation machine and it will find anything unsealed.</p>` },
  { h: 'Battery holder with a switch',
    body: `<p>Six AAs and a switch you can reach without opening the box. Being able to power-cycle it in the
    dark without tools is worth the extra part.</p>` },
  { h: 'Indoor receiver, kept simple',
    body: `<p>Nano, radio, display, buzzer, acknowledge button. Put it where you will hear it, which is
    probably not where it looks nicest.</p>` },
  { h: 'Measure the sleep current before deploying',
    body: `<p>It should be tens of microamps. Anything in the milliamps means something stays powered, and six
    AAs will last weeks rather than the whole winter.</p>` }
],

libraries: [
  { name: 'DallasTemperature', by: 'Miles Burton', why: 'DS18B20 driver, with addressed reads.' },
  { name: 'OneWire', by: 'Paul Stoffregen', why: 'The bus.' },
  { name: 'Adafruit BME280', by: 'Adafruit', why: 'Humidity, for the dew point.' },
  { name: 'LoRa', by: 'Sandeep Mistry', why: 'The link indoors.' }
],

code: [{
  name: 'frost_alarm.ino',
  code: `/* ------------------------------------------------------------------
   Greenhouse frost alarm - transmitter

   Wakes every ten minutes, keeps a 90 minute history in RTC memory,
   and predicts when the inside temperature reaches zero.
   ------------------------------------------------------------------ */

#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <SPI.h>
#include <LoRa.h>
#include <Adafruit_BME280.h>
#include <math.h>

#define ONE_WIRE 4

// Read these once with an address scanner and hard-code them, or the two
// probes can swap places on the bus after a reboot.
DeviceAddress INSIDE  = {0x28, 0xFF, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66};
DeviceAddress OUTSIDE = {0x28, 0xFF, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF};

OneWire wire(ONE_WIRE);
DallasTemperature probes(&wire);
Adafruit_BME280 bme;

#define HIST 9                      // 90 minutes at one every 10
RTC_DATA_ATTR float  histT[HIST];
RTC_DATA_ATTR int    histN = 0;
RTC_DATA_ATTR bool   alarmSent = false;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  probes.begin();
  probes.setResolution(12);
  if (!bme.begin(0x76)) bme.begin(0x77);

  LoRa.setPins(5, 14, 26);
  LoRa.begin(868E6);
  LoRa.setSpreadingFactor(10);

  probes.requestTemperatures();
  float inside  = probes.getTempC(INSIDE);
  float outside = probes.getTempC(OUTSIDE);
  float rh      = bme.readHumidity();

  if (inside == DEVICE_DISCONNECTED_C) {
    Serial.println("Inside probe missing - check the 4.7k pull-up");
    sleep();
  }

  // Roll the history
  if (histN < HIST) {
    histT[histN++] = inside;
  } else {
    memmove(histT, histT + 1, (HIST - 1) * sizeof(float));
    histT[HIST - 1] = inside;
  }

  float dew   = dewPoint(outside, rh);
  float slope = slopePerHour();
  float hours = hoursToZero(inside, slope, dew);

  /* Fire once, an hour or more ahead, and then stay quiet. An alarm that
     repeats gets muted, and a muted alarm is worse than none. Predicting
     ahead is what makes one alarm enough. */
  bool danger = (hours > 0 && hours < 2.0f) || inside < 1.0f;
  if (danger && !alarmSent) alarmSent = true;
  if (inside > 4.0f) alarmSent = false;        // conditions recovered

  char packet[96];
  snprintf(packet, sizeof(packet), "I%.1f,O%.1f,D%.1f,S%.2f,H%.1f,A%d",
           inside, outside, dew, slope, hours, danger && alarmSent ? 1 : 0);

  LoRa.beginPacket();
  LoRa.print(packet);
  LoRa.endPacket();
  Serial.println(packet);

  sleep();
}

void loop() {}

/* Magnus formula. Below freezing this is really the frost point and the
   constants differ slightly, but not enough to matter over the range
   this alarm cares about. */
float dewPoint(float tempC, float rh) {
  if (isnan(rh) || rh <= 0) return -99;
  const float a = 17.27f, b = 237.7f;
  float alpha = ((a * tempC) / (b + tempC)) + logf(rh / 100.0f);
  return (b * alpha) / (a - alpha);
}

// Least squares over the history, in degrees per hour.
float slopePerHour() {
  if (histN < 4) return 0;
  float sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (int i = 0; i < histN; i++) {
    float x = i / 6.0f;                        // 10 min samples -> hours
    sx += x; sy += histT[i]; sxy += x * histT[i]; sxx += x * x;
  }
  float d = histN * sxx - sx * sx;
  return fabs(d) < 1e-6 ? 0 : (histN * sxy - sx * sy) / d;
}

/* Project the trend forward, then clamp at the dew point.

   A straight line is wrong: as air cools to its dew point, condensation
   releases latent heat and the fall stalls there. So if the dew point is
   above zero, the temperature is unlikely to reach zero at all - which is
   the single most useful thing this alarm knows. */
float hoursToZero(float now, float slope, float dew) {
  if (slope >= -0.05f) return -1;              // not falling meaningfully
  if (dew > 0.5f) return -1;                   // it will stall above zero
  return (0.0f - now) / slope;
}

void sleep() {
  esp_sleep_enable_timer_wakeup(10ULL * 60 * 1000000);
  Serial.flush();
  esp_deep_sleep_start();
}`
}],

trouble: [
  { q: 'Both probes read -127',
    a: `No 4.7&nbsp;k pull-up, or the data wire is broken. -127 means the bus found nothing at all.` },
  { q: 'Inside and outside readings swap occasionally',
    a: `You are reading by index rather than by address. Hard-code the 64-bit addresses - the bus order is not
    guaranteed across reboots.` },
  { q: 'Outside reads several degrees below the forecast on clear nights',
    a: `Radiative cooling of the sensor itself, which is real physics. Shield it from the sky so it measures
    air rather than its own view of space.` },
  { q: 'It alarms every single night',
    a: `The dew point clamp is not working, or humidity is reading wrong. Check the BME280 - some cheap modules
    are actually BMP280s with no humidity sensor at all, and return a constant.` },
  { q: 'It never alarms, including on a night that froze',
    a: `The history is not persisting across deep sleep. It must be <code>RTC_DATA_ATTR</code> or it is wiped
    on every wake and the slope is always zero.` },
  { q: 'Predicted time jumps around',
    a: `Normal early in the evening when the trend is not established. The sketch returns -1 for slopes shallower
    than 0.05&nbsp;degrees per hour for this reason.` },
  { q: 'Batteries flat in a fortnight',
    a: `Sleep current too high. Measure it - it should be tens of microamps. A voltage regulator with a
    milliamp of quiescent draw will do this on its own.` },
  { q: 'Radio does not reach the house',
    a: `Raise the spreading factor, and get the antenna away from the greenhouse frame. A metal-framed
    greenhouse is a reasonably effective cage.` }
],

safety: `
<div class="note warn"><span class="t">Alkaline, not lithium, for an unheated shed</span>
<p>Consistent with the other battery projects in this book: lithium cells must not be charged below
0&nbsp;degrees, and their capacity collapses in the cold even when only discharging.</p>
<p>A greenhouse in February is exactly the wrong place for a lithium cell. Six alkaline AAs are cheaper, safer
and work better at -5&nbsp;degrees. If you want rechargeable, LiFePO4 handles cold far better than
lithium-ion.</p>
<p>If you later add a heater to this - and it is the obvious next step - that is mains in a damp glass building
and is a different level of risk. Read the mains section of the
<a href="project.html?p=sous-vide-controller">sous vide controller</a>, use an RCD without exception, and use
a heater designed for greenhouses rather than one improvised.</p></div>`,

next: `
<ul>
  <li><strong>Log a whole winter</strong> and find out what your greenhouse is actually worth. The answer is
  often less than people assume, and it is worth knowing before trusting seedlings to it.</li>
  <li><strong>Add a light sensor</strong>. Cloud cover is the single biggest factor in overnight cooling, and
  measuring how fast the light fell at dusk is a decent proxy for it.</li>
  <li><strong>Switch a heater</strong> on the prediction rather than the temperature, so it comes on before the
  frost instead of after. Much less energy for a better result.</li>
  <li><strong>Compare against a forecast API</strong> using the <a href="project.html?p=bus-departure-board">API
  techniques</a> - a local prediction plus a regional forecast beats either alone.</li>
</ul>`
});
