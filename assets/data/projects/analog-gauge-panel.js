/* Moving-coil meters showing digital data. A PWM and a filter, and it looks like 1962. */
AB.addProject({
slug: 'analog-gauge-panel',
title: 'Analogue gauge panel',
cat: 'display',
level: 2,
time: '5 hours',
solder: true,
board: 'ESP32',
tags: ['analog meter', 'pwm', 'rc filter', 'mqtt', 'esp32', 'dashboard', 'retro'],
blurb: 'Four moving-coil needles twitching away on a walnut panel, showing CPU load, the weather, unread email, whatever you like. Physical dials are readable from across a room in a way a screen never is.',

skills: ['PWM as a DAC', 'RC filtering', 'Calibrating an analogue instrument', 'Non-linear scaling', 'MQTT subscribe', 'Damping and why it matters'],

intro: `
<p>A 1&nbsp;mA moving-coil meter is a coil in a magnetic field with a spring and a needle. Push current through
it and the needle deflects in proportion. They cost a few dollars, they have been made the same way for a
century, and they are the single most satisfying output device you can bolt to a microcontroller.</p>
<p>The engineering here is small but genuinely interesting: a microcontroller has no analogue output, so you
fake one with PWM and a filter, and then you discover that a needle which responds instantly to every update
looks nervous and cheap, while one that is slightly damped looks like an instrument.</p>`,

what: [
  'Drive four analogue meters from one ESP32, each showing a different number.',
  'Turn a digital value into a needle position, with a filter that makes it move like a real instrument.',
  'Subscribe to MQTT, so anything on your network can move a needle.',
  'Calibrate each meter so full scale really is full scale, which they never are out of the box.',
  'Handle non-linear scales, because the interesting ranges are rarely linear.'
],

how: `
<p><strong>PWM plus a resistor and capacitor is a DAC.</strong> The ESP32 has no true analogue output. What it
has is PWM: a square wave that is high for some fraction of each cycle. Average that square wave over time and
you get a DC voltage proportional to the duty cycle - and a moving-coil meter is already an averaging device,
because the needle physically cannot follow a 5&nbsp;kHz square wave.</p>
<p>So in principle you could connect the meter straight to a PWM pin. In practice you add an RC filter anyway,
because it stops the coil buzzing audibly and it gives you somewhere to set the damping.</p>

<p><strong>Choosing the series resistor.</strong> A 1&nbsp;mA meter with roughly 100&nbsp;ohm coil resistance
needs about 3.3&nbsp;k in series to reach full scale on a 3.3&nbsp;V rail: 3.3&nbsp;V / 0.001&nbsp;A =
3300&nbsp;ohm, minus the coil, near enough. Use a 2.2&nbsp;k fixed resistor and a 2&nbsp;k trimmer in series,
so each meter can be trimmed to hit exactly full scale.</p>
<p>Get this wrong in the low direction and you will drive far more than 1&nbsp;mA through a coil wound from
wire the thickness of a hair. Meters die quietly and permanently this way. <strong>Always power up with the
trimmer at maximum resistance</strong> and wind it down while watching the needle.</p>

<p><strong>Damping is the difference between a toy and an instrument.</strong> Feed a meter raw values and the
needle snaps between positions and overshoots. Real instruments are damped - the needle moves smoothly and
settles without hunting.</p>
<p>You get this for free with an exponential moving average in software: <code>shown += (target - shown) *
0.08</code> every 20&nbsp;ms. Vary that coefficient and you can dial in anything from twitchy to stately. The RC
filter's capacitor adds a little more. This is the single change that makes people ask where you bought it.</p>

<p><strong>Non-linear scales.</strong> Most interesting quantities are not linear. Wi-Fi signal strength in dBm
runs from about -30 (excellent) to -90 (unusable) and the useful detail is all at the top. Audio level is
logarithmic. Take the log, or map in segments, before it reaches the needle - and print the scale to match,
which is half the fun of building your own.</p>

<p><strong>Print your own scales.</strong> The cheap meters come marked 0-1&nbsp;mA or 0-100&nbsp;uA, which
tells your visitors nothing. Most open with two screws; photograph the original, draw over it, print on matte
paper, cut, refit. This takes an evening and is what turns the project into an object.</p>`,

bom: [
  { id: 'panel-meter', qty: 4, note: '1 mA full-scale moving coil. Check the coil resistance with a meter before calculating your series resistor - they vary from 50 to 300 ohm.' },
  { id: 'esp32', qty: 1, note: 'Wi-Fi for MQTT, and plenty of PWM channels - it has 16, so four meters is nothing.' },
  { id: 'res1k', qty: 4, note: 'Part of the series resistance. See the write-up for the arithmetic; you want about 3.3 k total per meter including the trimmer.' },
  { id: 'pot10k', qty: 4, note: 'Used as a trimmer for calibration. A multi-turn trimmer is easier to set precisely if you have one.' },
  { id: 'cap10', qty: 4, note: 'RC filter, one per meter. 10 uF with the series resistance gives a gentle roll-off that kills the PWM buzz.' },
  { id: 'psu5v3a', qty: 1, note: 'It runs continuously. Meters draw almost nothing - this is really just for the ESP32.' },
  { id: 'perfboard', qty: 1 },
  { id: 'box-abs', qty: 1, note: 'Or a piece of hardwood, which honestly looks better. The panel is most of the appeal.' },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'mcu', comp: 'esp32',      at: [0, 76] },
    { id: 'bb',  comp: 'bb830',      at: [0, 10] },
    { id: 'm1',  comp: 'panelmeter', at: [-72, -62] },
    { id: 'm2',  comp: 'panelmeter', at: [-24, -62] },
    { id: 'm3',  comp: 'panelmeter', at: [24, -62] },
    { id: 'm4',  comp: 'panelmeter', at: [72, -62] }
  ],
  wires: [
    { from: 'mcu.3V3', to: 'bb.T+1',  color: 'red',    note: '3.3 V rail - the meters are driven from 3.3 V logic levels' },
    { from: 'mcu.GND', to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'mcu.D25', to: 'bb.e4',   color: 'green',  note: 'Meter 1 PWM, into its series resistor and trimmer' },
    { from: 'bb.a4',   to: 'm1.+',    color: 'green',  note: 'Filtered output to meter 1 positive' },
    { from: 'm1.-',    to: 'bb.T-4',  color: 'black',  note: 'Meter 1 return' },
    { from: 'mcu.D26', to: 'bb.e10',  color: 'blue',   note: 'Meter 2 PWM' },
    { from: 'bb.a10',  to: 'm2.+',    color: 'blue',   note: 'Filtered output to meter 2' },
    { from: 'm2.-',    to: 'bb.T-10', color: 'black',  note: 'Meter 2 return' },
    { from: 'mcu.D27', to: 'bb.e16',  color: 'yellow', note: 'Meter 3 PWM' },
    { from: 'bb.a16',  to: 'm3.+',    color: 'yellow', note: 'Filtered output to meter 3' },
    { from: 'm3.-',    to: 'bb.T-16', color: 'black',  note: 'Meter 3 return' },
    { from: 'mcu.D14', to: 'bb.e22',  color: 'orange', note: 'Meter 4 PWM' },
    { from: 'bb.a22',  to: 'm4.+',    color: 'orange', note: 'Filtered output to meter 4' },
    { from: 'm4.-',    to: 'bb.T-22', color: 'black',  note: 'Meter 4 return' }
  ]
},

wireIntro: `<p>Four identical channels. Each is a PWM pin, a fixed resistor, a trimmer, a capacitor to ground,
and the meter. Nothing here is fast or fussy.</p>`,

wireNotes: `
<div class="note danger"><span class="t">Start every trimmer at maximum resistance</span>
<p>A 1&nbsp;mA movement is wound from extremely fine wire. Connect it to 3.3&nbsp;V with too little series
resistance and it will pass tens of milliamps, which burns the coil out in seconds and cannot be repaired.</p>
<p>Wind each trimmer fully to maximum before the first power-up, then wind down slowly while watching the
needle. If it reaches full scale before you expect it to, stop.</p></div>

<div class="note tip"><span class="t">Measure your meter first</span>
<p>Put a multimeter on resistance across the terminals. Anything from 50 to 300&nbsp;ohm is normal, and it
changes the series resistor you need. Meters sold as "1 mA" are also sometimes 500&nbsp;uA or 5&nbsp;mA - check
before assuming.</p></div>

<div class="note"><span class="t">Polarity</span>
<p>A moving-coil meter is polarised. Backwards, the needle pins against the left stop and stays there. It is not
damaged by this at sensible currents, but it will not read either.</p></div>`,

solderIntro: `<p>Four identical RC networks on a small piece of perfboard, with flying leads out to each meter.
Straightforward soldering, and a good project to practise tidy repeated layout on.</p>`,

solderSteps: [
  { h: 'One channel first, and calibrate it',
    body: `<p>Build a single channel completely, including the trimmer, and get the needle hitting exactly full
    scale on a PWM duty of 255. Only then build the other three to match.</p>
    <p>Doing all four blind means calibrating four channels that might each have a different mistake in
    them.</p>` },
  { h: 'Lay the four channels out identically',
    body: `<p>Same orientation, same spacing, resistor-trimmer-capacitor in the same order. It takes no longer
    and it makes a fault obvious at a glance, because the wrong one will look different.</p>` },
  { h: 'Trimmers where you can reach them',
    body: `<p>Mount them at the edge of the board with their adjustment screws facing out. You will want to
    retouch the calibration after the panel is assembled, and reaching a trimmer buried under wiring is
    miserable.</p>` },
  { h: 'Flying leads long enough to work on',
    body: `<p>Each meter needs two wires. Leave enough slack that the board can sit on the bench beside the
    open panel while you test - short leads mean assembling everything before you can find out if it
    works.</p>` },
  { h: 'Drill the panel, then fit the meters',
    body: `<p>Most panel meters want a round hole plus two small screw holes. Measure from the meter itself
    rather than a datasheet; the cheap ones vary. Drill undersize and open up with a round file for a clean
    fit.</p>` },
  { h: 'Scales last',
    body: `<p>Once everything is calibrated and working, take the fronts off and fit your printed scales. Doing
    it earlier means printing them twice, because the calibration will change what full scale means.</p>` }
],

libraries: [
  { name: 'PubSubClient', by: 'Nick O’Leary', why: 'MQTT. If you already run Home Assistant or Node-RED, this is how anything on your network moves a needle.' }
],

code: [{
  name: 'gauge_panel.ino',
  code: `/* ------------------------------------------------------------------
   Four analogue meters driven by PWM, fed over MQTT.

   Publish a number 0-100 to buildbook/gauge/0 .. /3 and the matching
   needle moves there, smoothly.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <PubSubClient.h>

const char* WIFI_SSID  = "your-network";
const char* WIFI_PASS  = "your-password";
const char* MQTT_HOST  = "192.168.1.10";

const int METER_PIN[4] = {25, 26, 27, 14};

/* Calibration: the PWM duty that puts each needle exactly at full scale.
   Set these by running the sweep test and trimming until the needle just
   touches the end of the scale, then note the number. They will differ. */
int fullScale[4] = {255, 255, 255, 255};

float target[4] = {0, 0, 0, 0};    // where the needle should be, 0..1
float shown[4]  = {0, 0, 0, 0};    // where it currently is

WiFiClient net;
PubSubClient mqtt(net);

void setup() {
  Serial.begin(115200);

  for (int i = 0; i < 4; i++) {
    /* 5 kHz is far above anything the needle can follow, and above the
       audible range so the coil does not sing. 8-bit resolution is plenty
       - a needle cannot resolve 1/256 of full scale anyway. */
    ledcAttach(METER_PIN[i], 5000, 8);
    ledcWrite(METER_PIN[i], 0);
  }

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);

  mqtt.setServer(MQTT_HOST, 1883);
  mqtt.setCallback(onMessage);

  sweep();                          // proves all four move, and looks good
}

void loop() {
  if (!mqtt.connected()) reconnect();
  mqtt.loop();

  /* Exponential smoothing. This is the whole trick: a needle that jumps
     straight to its value looks cheap, one that eases in looks like an
     instrument. 0.08 at 20 ms is about a second to settle - raise it for
     something twitchier, lower it for something stately. */
  for (int i = 0; i < 4; i++) {
    shown[i] += (target[i] - shown[i]) * 0.08f;
    ledcWrite(METER_PIN[i], (int)(shown[i] * fullScale[i]));
  }
  delay(20);
}

void onMessage(char* topic, byte* payload, unsigned int len) {
  int idx = topic[strlen(topic) - 1] - '0';
  if (idx < 0 || idx > 3) return;

  char buf[12];
  len = min(len, (unsigned int)sizeof(buf) - 1);
  memcpy(buf, payload, len);
  buf[len] = 0;

  target[idx] = constrain(atof(buf) / 100.0f, 0.0f, 1.0f);
}

void reconnect() {
  while (!mqtt.connected()) {
    if (mqtt.connect("gauge-panel")) {
      mqtt.subscribe("buildbook/gauge/+");
    } else {
      delay(2000);
    }
  }
}

/* Full sweep on both power-up and demand. Do this before soldering the
   scales on - it is also how you find the fullScale numbers. */
void sweep() {
  for (int v = 0; v <= 255; v += 3) {
    for (int i = 0; i < 4; i++) ledcWrite(METER_PIN[i], v);
    delay(12);
  }
  delay(400);
  for (int v = 255; v >= 0; v -= 3) {
    for (int i = 0; i < 4; i++) ledcWrite(METER_PIN[i], v);
    delay(12);
  }
}

/* Wi-Fi signal is a good example of a non-linear scale. -30 dBm is
   excellent, -90 is unusable, and all the detail you care about is at the
   top - so map it deliberately rather than linearly. */
float rssiToScale(int dbm) {
  if (dbm > -50) return 1.0f;
  if (dbm < -90) return 0.0f;
  return (dbm + 90) / 40.0f;
}`
}],

trouble: [
  { q: 'The needle pins hard against the right stop',
    a: `Series resistance far too low. Power down immediately - a pinned needle means the coil is passing well
    over its rating and you have minutes at most before it burns out. Wind the trimmer to maximum and start
    again.` },
  { q: 'The needle sits against the left stop and will not move',
    a: `Polarity reversed. Swap the two wires to that meter.` },
  { q: 'The meter buzzes audibly',
    a: `PWM frequency too low, or the filter capacitor is missing. 5&nbsp;kHz is above hearing; some libraries
    default to 1&nbsp;kHz, which is not.` },
  { q: 'The needle never reaches full scale',
    a: `Trimmer still too high, or your meter is a 500&nbsp;uA movement rather than 1&nbsp;mA. Measure the
    actual current at full duty with a meter in series.` },
  { q: 'Needles jitter constantly',
    a: `The source data is noisy, not the hardware. Lower the smoothing coefficient, or filter at the sending
    end. A needle that never quite settles is more annoying than one that lags slightly.` },
  { q: 'One meter reads consistently high compared to the others',
    a: `Different coil resistance - they genuinely vary between units even in the same batch. That is what the
    per-meter <code>fullScale</code> array and the trimmers are for.` },
  { q: 'MQTT connects then drops repeatedly',
    a: `Two clients using the same client ID, which is often the case if you copied this sketch for a second
    panel. Give each one a unique name.` }
],

next: `
<ul>
  <li><strong>Backlight them</strong> with a warm white LED behind the scale. Old instruments glowed and it
  transforms the panel in a dark room.</li>
  <li><strong>A VU meter</strong> off the <a href="project.html?p=sound-reactive-led">audio input</a> work -
  ballistics matter here, and real VU meters have a specified 300&nbsp;ms rise time you can implement
  exactly.</li>
  <li><strong>Weather</strong>: temperature, pressure, humidity and wind on four dials, fed from the
  <a href="project.html?p=desk-weather-station">weather station</a>.</li>
  <li><strong>A needle that flicks</strong> to full scale and back when something happens - a doorbell, an
  email. Physical notification, no screen involved.</li>
</ul>`
});
