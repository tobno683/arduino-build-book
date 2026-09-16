/* WS2812 bike light with accelerometer brake detection, on a LiPo. */
AB.addProject({
slug: 'smart-bike-light',
title: 'Bike light that knows you are braking',
cat: 'light',
level: 4,
time: '5 hours',
solder: true,
board: 'Nano',
tags: ['ws2812b', 'mpu6050', 'lipo', 'tp4056', 'accelerometer', 'bike', 'wearable'],
blurb: 'A rear light that flares bright red when you slow down, flashes amber when you signal, and charges over USB. Brake lights, on a bicycle.',

skills: ['Accelerometer filtering', 'Detecting deceleration', 'LiPo power', 'Low-power design', 'Weatherproofing'],

intro: `
<p>Cars have had brake lights for a century. Bicycles mostly have not, because until recently detecting
deceleration meant a sensor on the brake lever. An MPU-6050 costs two dollars and measures acceleration
directly - so the light can simply notice that you are slowing down, however you did it.</p>
<p>This is a level-4 build not because any single part is hard but because it combines lithium power,
weatherproofing and a thing that has to be reliable on a road at night. Read the safety notes, and keep a
conventional light as well until you trust it.</p>`,

what: [
  'Run a steady or pulsing rear light at a sensible everyday brightness.',
  'Flare to full brightness for a second whenever it detects real deceleration.',
  'Flash the left or right half amber when you press an indicator button.',
  'Charge over USB, show the battery state on power-up, and warn when it is low.',
  'Run six to ten hours on a 2000 mAh cell in normal mode.'
],

how: `
<p>The <strong>MPU-6050</strong> measures acceleration on three axes. Mounted on a bike it reads gravity
(about 1&nbsp;g downwards) plus whatever else is happening - and braking shows up as a sustained negative
acceleration along the direction of travel, typically 0.2&nbsp;g for gentle braking and over 0.5&nbsp;g for
hard.</p>
<p>The difficulty is that a bicycle on a road is a very noisy place. Every pothole, every pedal stroke and every
gust produces acceleration spikes far larger than braking. Three things separate signal from noise:</p>
<ul>
  <li><strong>A low-pass filter.</strong> Braking lasts a second or more; a pothole lasts 20&nbsp;ms. Averaging
  over roughly 200&nbsp;ms removes the bumps and keeps the braking.</li>
  <li><strong>A duration requirement.</strong> The deceleration has to persist for several consecutive readings
  before it counts.</li>
  <li><strong>A gravity reference taken at rest.</strong> The bike is not level and the mount is not square, so
  "forwards" is not neatly along one axis. Measuring the resting orientation at power-up and subtracting it
  means the mount angle stops mattering.</li>
</ul>
<p>That third point is what makes the difference between a light that works on your bike and one that works in
a video.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'A Nano is fine and cheap. A 3.3 V board avoids a level shifter but needs more care with the LED data line.' },
  { id: 'ws2812-strip', qty: 1, as: 'WS2812B strip, 16 LEDs', note: 'Cut a 16-LED length from a 60/m strip. IP65 or IP67 - this lives outdoors.' },
  { id: 'mpu6050', qty: 1 },
  { id: 'lipo2000', qty: 1, note: 'A flat pouch cell fits a saddlebag better than an 18650.' },
  { id: 'tp4056', qty: 1, note: 'Protected version. This is the charger and the low-voltage cutoff.' },
  { id: 'boost', qty: 1, note: 'A LiPo is 3.0-4.2 V; WS2812Bs want 5 V. A boost converter steps up - a buck cannot.' },
  { id: 'button', qty: 2, note: 'Left and right indicators. Bar-mounted momentary switches if you can find them.' },
  { id: 'switch', qty: 1, note: 'Main power.' },
  { id: 'res220', qty: 1 },
  { id: 'cap1000', qty: 1 },
  { id: 'res10k', qty: 2, note: 'Battery voltage divider.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'box-ip65', qty: 1, note: 'Small. A clear or red lid, or cut a window and glue red acrylic behind it.' },
  { id: 'heatshrink', qty: 1, own: true },
  { id: 'zip', qty: 1 }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'cutters' }, { id: 'dmm' }, { id: 'usb-meter' }],

build: {
  parts: [
    { id: 'nano',  comp: 'nano',        at: [0, 0] },
    { id: 'imu',   comp: 'mpu6050',     at: [-48, -40], ry: 180 },
    { id: 'strip', comp: 'ws2812strip', at: [0, -84], opt: { n: 8 } },
    { id: 'boost', comp: 'buck',        at: [50, 36], ry: 180 },
    { id: 'chg',   comp: 'tp4056',      at: [-40, 44] },
    { id: 'b1',    comp: 'button',      at: [40, -30] },
    { id: 'b2',    comp: 'button',      at: [56, -30] },
    { id: 'batt',  comp: 'block',       at: [0, 84], opt: { w: 62, h: 10, d: 44, c: '#3a4148' }, label: 'LiPo 2000 mAh' }
  ],
  wires: [
    { from: 'batt.n',    to: 'chg.B+',     color: 'red',    note: 'Cell into the charger battery terminals' },
    { from: 'batt.f',    to: 'chg.B-',     color: 'black',  note: 'Cell negative' },
    { from: 'chg.OUT+',  to: 'boost.IN+',  color: 'red',    note: 'Protected output, through the main switch, to the boost converter' },
    { from: 'chg.OUT-',  to: 'boost.IN-',  color: 'black',  note: 'Ground' },
    { from: 'boost.OUT+', to: 'nano.5V',   color: 'red',    note: 'Regulated 5 V. Feed the 5V pin, NOT VIN - the regulator would drop it again' },
    { from: 'boost.OUT-', to: 'nano.GND',  color: 'black',  note: 'Ground' },
    { from: 'boost.OUT+', to: 'strip.5V',  color: 'red',    note: 'Same 5 V straight to the LEDs' },
    { from: 'boost.OUT-', to: 'strip.GND', color: 'black',  note: 'LED ground' },
    { from: 'strip.DIN', to: 'nano.D6',    color: 'green',  note: 'Data, through a 220 ohm resistor at the strip' },
    { from: 'imu.VCC',   to: 'nano.5V',    color: 'red',    note: 'The breakout has a regulator, so 5 V is fine' },
    { from: 'imu.GND',   to: 'nano.GND2',  color: 'black',  note: 'IMU ground' },
    { from: 'imu.SDA',   to: 'nano.A4',    color: 'blue',   note: 'I2C data' },
    { from: 'imu.SCL',   to: 'nano.A5',    color: 'yellow', note: 'I2C clock' },
    { from: 'b1.1A',     to: 'nano.D2',    color: 'orange', note: 'Left indicator, internal pull-up' },
    { from: 'b1.2A',     to: 'nano.GND2',  color: 'black',  note: 'To ground' },
    { from: 'b2.1A',     to: 'nano.D3',    color: 'purple', note: 'Right indicator' },
    { from: 'b2.2A',     to: 'nano.GND2',  color: 'black',  note: 'To ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Load on OUT+/OUT-, cell on B+/B-</span>
<p>On the TP4056, the cell goes to <strong>B+/B-</strong> and everything you build goes to
<strong>OUT+/OUT-</strong>. Wiring the load to B+/B- bypasses the protection circuit, and an unprotected LiPo
taken below about 2.5&nbsp;V is damaged and can be dangerous to recharge.</p>
<p>On a bike, which gets left in a shed for a month, that protection is the difference between a flat battery
and a fire.</p></div>

<div class="note warn"><span class="t">Boost, not buck</span>
<p>A LiPo runs 4.2&nbsp;V down to 3.0. WS2812Bs and a Nano want 5. That needs a <strong>boost</strong>
converter (MT3608 or similar), not the buck modules most guides use.</p>
<p>Set its output to 5.0&nbsp;V with a multimeter before connecting anything - these ship at arbitrary voltages
and a few ship at 12.</p>
<p>Feed the Nano's <strong>5V</strong> pin directly. Feeding VIN sends it through the onboard regulator, which
needs 7&nbsp;V to work and will simply drop out.</p></div>

<div class="note warn"><span class="t">Sixteen LEDs is nearly a full amp</span>
<p>At full white, 16 WS2812Bs draw about 960&nbsp;mA at 5&nbsp;V - which at 3.7&nbsp;V from the cell is over
1.3&nbsp;A through the boost converter. Red only is about a third of that. The sketch's power limit keeps this
honest, and it is also why the light is far dimmer in normal mode than in brake mode.</p></div>`,

solderSteps: [
  { h: 'Set the boost converter output first, with nothing connected',
    body: `<p>Power it from the cell, multimeter on OUT+ and OUT-, and turn the multi-turn trimmer until it
    reads exactly 5.0&nbsp;V. It may take fifteen turns before anything moves.</p>
    <p>Do this before anything expensive is attached. A converter left at 12&nbsp;V will destroy the Nano, the
    IMU and every LED at once.</p>` },
  { h: 'Strip end first, and strain-relieve it hard',
    body: `<p>Tin the three pads, tin the wires, one second each. Then hot glue over all three joints and a
    piece of heat-shrink over the whole end.</p>
    <p>This is on a bicycle. Vibration will find any joint you did not secure, and it will find it on a dark
    road.</p>` },
  { h: 'The 220 ohm in the data line, at the strip',
    body: `<p>Solder it inline in the data wire, as close to the strip as possible, and sleeve it.</p>` },
  { h: 'Main switch in the OUT+ line',
    body: `<p>Between the charger's OUT+ and the boost converter's IN+. Sleeve both joints - a shorted switch
    here shorts a lithium cell.</p>` },
  { h: 'Battery divider for the fuel gauge',
    body: `<p>Two 10&nbsp;k from the cell positive (after the switch) to ground, midpoint to A0. Note that at
    4.2&nbsp;V the midpoint is 2.1&nbsp;V, which is safe for a 5&nbsp;V Nano input.</p>` },
  { h: 'Indicator buttons on a long loom',
    body: `<p>Four wires up to the handlebars, twisted, with plenty of slack for the bars to turn. Use proper
    strain relief where the cable leaves the box.</p>
    <p>Honestly, consider a wireless pair instead - a cable running the length of a bike is a snag hazard and
    will eventually fail at the bars.</p>` },
  { h: 'Reservoir capacitor and the check',
    body: `<p>1000&nbsp;&micro;F across the 5&nbsp;V rail at the strip end. Then: 5&nbsp;V to GND no beep, cell
    positive to ground no beep, and the boost output reading 5.0&nbsp;V under load.</p>` },
  { h: 'Weatherproofing',
    body: `<p>Everything inside the IP65 box. Cable gland where the wires leave, pointing <em>down</em>. A
    sachet of silica gel inside. Silicone round the window.</p>
    <p>The LEDs can be inside the box behind a red window, which is much easier to seal than bringing the strip
    outside.</p>` }
],

assembly: [
  { h: 'Bench-test everything before it goes on a bike',
    body: `<p>Wave the whole assembly and confirm the brake flare triggers when you decelerate it by hand. Press
    both buttons. Watch the battery reading.</p>` },
  { h: 'Mount the IMU rigidly',
    body: `<p>Glued or screwed to the box, not floating on its wires. An accelerometer that can move relative to
    the bike measures its own wobble.</p>
    <p>Orientation does not matter - the sketch learns it at startup - but it must not change afterwards.</p>` },
  { h: 'Mount the light and let it calibrate',
    body: `<p>Fit the box to the seatpost or a rack, get the bike upright and still, and switch on. It spends
    two seconds learning which way gravity points; do not move the bike during that.</p>
    <p>If you change the mounting angle, power-cycle it.</p>` },
  { h: 'Ride a calibration loop',
    body: `<p>Somewhere safe and traffic-free. Ride at a normal pace, brake gently, brake hard, go over a bump.
    A friend watching from behind - or a phone recording - tells you whether the flare fires when it should and
    stays off when it should not.</p>` },
  { h: 'Keep your old light',
    body: `<p>Until this has done a dozen rides without a fault. A home-made light is a supplement to a
    conventional one, not a replacement.</p>` }
],

libraries: [
  { name: 'FastLED', by: 'Daniel Garcia / Mark Kriegsman', why: 'The LEDs and the power limiter.' },
  { name: 'Adafruit MPU6050', by: 'Adafruit', why: 'The accelerometer. Pulls in Adafruit Unified Sensor and Adafruit BusIO.' },
  { name: 'Adafruit Unified Sensor', by: 'Adafruit', why: 'Dependency.' }
],

code: [{
  name: 'bike_light.ino',
  code: `/* ------------------------------------------------------------------
   Bike light with brake detection
   WS2812B x16 on D6, MPU-6050 on I2C, indicator buttons on D2 and D3,
   battery divider on A0.
   ------------------------------------------------------------------ */

#include <FastLED.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// ---- settings --------------------------------------------------------
#define LED_PIN     6
#define NUM_LEDS   16
#define BTN_LEFT    2
#define BTN_RIGHT   3
#define BATT_PIN   A0

#define MAX_MILLIAMPS   700     // keep the boost converter comfortable
#define RUN_BRIGHTNESS   70     // everyday level
#define BRAKE_BRIGHTNESS 255

const float BRAKE_G      = 0.18;   // deceleration that counts as braking
const byte  BRAKE_FRAMES = 4;      // consecutive readings needed
const unsigned long BRAKE_HOLD_MS = 900;
const unsigned long INDICATE_MS   = 6000;
const float BATT_SCALE   = 0.00967;  // calibrate: realVolts / rawReading
const float BATT_LOW     = 3.45;
// ----------------------------------------------------------------------

CRGB leds[NUM_LEDS];
Adafruit_MPU6050 mpu;

// The resting gravity vector, learned at startup. Subtracting it means
// the mounting angle does not matter.
float gx0 = 0, gy0 = 0, gz0 = 0;

float filtered = 0;              // low-passed forward acceleration
byte  brakeCount = 0;
unsigned long brakingUntil = 0;
unsigned long indicateUntil = 0;
int indicateDir = 0;             // -1 left, +1 right
bool lowBattery = false;
unsigned long lastBatt = 0;

void setup() {
  Serial.begin(115200);
  pinMode(BTN_LEFT, INPUT_PULLUP);
  pinMode(BTN_RIGHT, INPUT_PULLUP);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_MILLIAMPS);
  FastLED.setBrightness(RUN_BRIGHTNESS);

  if (!mpu.begin()) {
    Serial.println(F("No MPU6050 - running as a plain light"));
    fill_solid(leds, NUM_LEDS, CRGB::Red);
    FastLED.show();
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    learnGravity();
  }

  showBattery();
}

void loop() {
  readButtons();
  if (millis() - lastBatt > 30000) { lastBatt = millis(); checkBattery(); }

  detectBraking();
  render();
  FastLED.show();
  delay(16);
}

/* --- learn which way is down ------------------------------------------ */
void learnGravity() {
  Serial.println(F("hold still - learning orientation"));
  // a slow amber sweep while it measures
  float sx = 0, sy = 0, sz = 0;
  const int N = 120;
  for (int i = 0; i < N; i++) {
    sensors_event_t a, g, t;
    mpu.getEvent(&a, &g, &t);
    sx += a.acceleration.x;
    sy += a.acceleration.y;
    sz += a.acceleration.z;

    fill_solid(leds, NUM_LEDS, CRGB::Black);
    leds[(i / 7) % NUM_LEDS] = CRGB(140, 60, 0);
    FastLED.show();
    delay(14);
  }
  gx0 = sx / N;  gy0 = sy / N;  gz0 = sz / N;
  Serial.printf("gravity %.2f %.2f %.2f\\n", gx0, gy0, gz0);
}

/* --- is the bike slowing down? ---------------------------------------- */
void detectBraking() {
  sensors_event_t a, g, t;
  if (!mpu.getEvent(&a, &g, &t)) return;

  // Acceleration with gravity removed, in m/s^2.
  float dx = a.acceleration.x - gx0;
  float dy = a.acceleration.y - gy0;
  float dz = a.acceleration.z - gz0;

  // The forward axis is whichever horizontal axis is largest at rest -
  // but simpler and more robust: use the magnitude of the horizontal
  // change, signed by the dominant axis.
  float horizontal = sqrt(dx * dx + dy * dy + dz * dz);
  float dominant = (fabs(dx) > fabs(dy)) ? dx : dy;
  float signedAccel = (dominant < 0) ? -horizontal : horizontal;

  // Low-pass: braking lasts a second, a pothole lasts 20 ms.
  filtered = filtered * 0.85 + signedAccel * 0.15;

  float inG = filtered / 9.81;

  if (inG < -BRAKE_G) {
    if (++brakeCount >= BRAKE_FRAMES) {
      brakingUntil = millis() + BRAKE_HOLD_MS;
      brakeCount = BRAKE_FRAMES;
    }
  } else {
    brakeCount = 0;
  }
}

/* --- buttons ---------------------------------------------------------- */
void readButtons() {
  static bool lw = false, rw = false;
  bool l = digitalRead(BTN_LEFT) == LOW;
  bool r = digitalRead(BTN_RIGHT) == LOW;

  if (l && !lw) { indicateDir = -1; indicateUntil = millis() + INDICATE_MS; }
  if (r && !rw) { indicateDir =  1; indicateUntil = millis() + INDICATE_MS; }
  if (l && r)   { indicateUntil = 0; indicateDir = 0; }   // both = cancel

  lw = l; rw = r;
}

/* --- battery ---------------------------------------------------------- */
float batteryVolts() {
  long sum = 0;
  for (int i = 0; i < 16; i++) { sum += analogRead(BATT_PIN); delay(1); }
  return (sum / 16.0) * BATT_SCALE;
}

void checkBattery() {
  float v = batteryVolts();
  lowBattery = v < BATT_LOW;
  Serial.print(F("battery "));
  Serial.println(v, 2);
}

void showBattery() {
  float v = batteryVolts();
  int pct = constrain((int)((v - 3.3) / 0.9 * NUM_LEDS), 0, NUM_LEDS);
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  for (int i = 0; i < pct; i++) leds[i] = CRGB(0, 60, 0);
  FastLED.show();
  delay(1200);
  Serial.print(F("battery at boot: "));
  Serial.println(v, 2);
}

/* --- what the light actually shows ------------------------------------ */
void render() {
  bool braking = millis() < brakingUntil;
  bool indicating = millis() < indicateUntil;

  if (braking) {
    FastLED.setBrightness(BRAKE_BRIGHTNESS);
    fill_solid(leds, NUM_LEDS, CRGB::Red);
    return;
  }

  FastLED.setBrightness(RUN_BRIGHTNESS);

  if (indicating) {
    // amber flashing on the indicated half, red on the other
    bool on = (millis() / 220) % 2;
    for (int i = 0; i < NUM_LEDS; i++) {
      bool thisSide = (indicateDir < 0) ? (i < NUM_LEDS / 2) : (i >= NUM_LEDS / 2);
      if (thisSide) leds[i] = on ? CRGB(255, 110, 0) : CRGB::Black;
      else          leds[i] = CRGB(120, 0, 0);
    }
    return;
  }

  if (lowBattery) {
    // a slow double-blink, so you notice without it being a hazard
    unsigned long p = millis() % 3000;
    bool on = (p < 90) || (p > 200 && p < 290);
    fill_solid(leds, NUM_LEDS, on ? CRGB(140, 0, 0) : CRGB(40, 0, 0));
    return;
  }

  // Normal: a slow breathing red. Steady is legal everywhere; flashing
  // is not legal everywhere, which is why this is gentle rather than
  // a strobe. Check your local rules.
  uint8_t b = beatsin8(14, 120, 255);
  fill_solid(leds, NUM_LEDS, CRGB(b, 0, 0));
}`,
  after: `<p>The <code>learnGravity()</code> function is the part worth stealing. Any accelerometer project on
  a thing that is not perfectly level has this problem, and measuring the resting vector at startup and
  subtracting it solves it in ten lines - far simpler than trying to work out mounting angles, and it copes
  with someone remounting the light at a different angle next week.</p>`
}],

upload: `
<p>Nano, correct port. Watch the Serial Monitor at 115200 - it prints the learned gravity vector and the
battery voltage. Then decelerate the whole thing by hand and watch for the flare.</p>
<div class="note warn"><span class="t">Upload with the battery disconnected</span>
<p>USB and the boost converter both feeding 5&nbsp;V is two supplies in parallel. Switch the light off while
programming.</p></div>`,

tune: [
  { h: 'Calibrate the battery reading',
    body: `<p>Measure the cell with a multimeter, note the raw value, and set
    <code>BATT_SCALE = measured / raw</code>. Do it with a part-used cell - that end of the range is where it
    matters.</p>` },
  { h: 'Braking threshold',
    body: `<p><code>BRAKE_G</code> at 0.18 catches most deliberate braking. Lower and every bump triggers it;
    higher and only hard stops register. Ride with the Serial Monitor recording, or add a line that prints the
    filtered value, and look at what your actual braking produces.</p>` },
  { h: 'Filter strength',
    body: `<p>The <code>0.85 / 0.15</code> split is about a 200&nbsp;ms time constant. More filtering (0.92 /
    0.08) rejects bumps better and adds lag - and lag on a brake light is exactly what you do not want. This
    is a genuine trade, and 0.85 is a reasonable middle.</p>` },
  { h: 'Brightness and battery life',
    body: `<p><code>RUN_BRIGHTNESS</code> at 70 on 16 red LEDs is about 150&nbsp;mA, so roughly ten hours from a
    2000&nbsp;mAh cell allowing for converter losses. At 255 it is three times that. Measure it with a USB meter
    rather than trusting the arithmetic.</p>` },
  { h: 'Steady versus flashing',
    body: `<p>Rules differ by country, and in several - Germany among them - a flashing rear light is not legal
    on a bicycle, while in others it is required to also have a steady one. The sketch breathes rather than
    strobes, which is a reasonable default. Check what applies where you ride.</p>` }
],

trouble: [
  { q: 'Brake flare triggers on every bump',
    a: `Filter too weak or threshold too low. Increase the filter coefficient towards 0.92 and raise
    <code>BRAKE_G</code>. Also check the IMU is rigidly mounted - one that can move measures its own
    movement.` },
  { q: 'Never triggers',
    a: `Threshold too high, or the gravity learning happened while the bike was moving. Power-cycle with it
    still. Print the filtered value and see what your braking actually reads.` },
  { q: 'LEDs flicker or show wrong colours',
    a: `5&nbsp;V rail sagging, or the boost converter set wrongly. Measure it under load - it should hold
    5.0&nbsp;V while the LEDs are at full brightness.` },
  { q: 'Everything dies after a few minutes',
    a: `The boost converter is hitting its current limit, or the cell's protection is tripping. Lower
    <code>MAX_MILLIAMPS</code> and check the converter is rated for at least 2&nbsp;A input.` },
  { q: 'No MPU6050 found',
    a: `Address 0x69 rather than 0x68 - the AD0 pin is pulled high. Run an I2C scanner; the Adafruit library
    takes an address argument in <code>begin()</code>.` },
  { q: 'Works on the bench, unreliable on the bike',
    a: `Vibration on a solder joint or a dupont connector. Everything on a bicycle should be soldered and
    strain-relieved. This is the most common failure by a distance.` },
  { q: 'Water inside after one wet ride',
    a: `The gland is pointing up, or the window seal is incomplete. Glands point down; silicone everything; add
    silica gel.` },
  { q: 'Battery flat after a week of not riding',
    a: `Something is still drawing. The main switch should be in the OUT+ line so the whole circuit is
    disconnected - if it is after the boost converter, the converter itself keeps drawing.` }
],

next: `
<ul>
  <li><strong>Wireless indicator buttons</strong> with a pair of nRF24L01s. Removes the cable to the bars,
  which is the weakest part of this build.</li>
  <li><strong>Automatic brightness</strong> with an LDR - full brightness in daylight where you need to be seen
  against a bright sky, lower at night where it would dazzle.</li>
  <li><strong>A front light</strong> on the same idea, with a high-power LED and a constant-current driver -
  and note that a front light that dazzles oncoming traffic is worse than no light.</li>
  <li><strong>Log the rides</strong>: the accelerometer plus a GPS module gives you speed, braking events and a
  route. See the <a href="project.html?p=fridge-freezer-logger">logger</a> for the SD side.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">This is a road safety device. Treat it as one.</span>
<ul>
  <li><strong>Keep a conventional light too</strong>, at least until this has proved itself over many rides. A
  home-made light that fails does so silently, and you will not know from the saddle.</li>
  <li><strong>Check your local law.</strong> Many countries specify the colour, the position, the steady-versus-
  flashing behaviour and sometimes the approval mark of bicycle lights. A red rear light is universal; the
  amber indicator halves are not, and in some places adding amber to the rear of a bicycle is not permitted.</li>
  <li><strong>Lithium cells and bicycles</strong>: a crash can crush a pouch cell. Mount it where it is
  protected, in a rigid box, and inspect it after any impact. A cell that has been dented or has puffed goes
  to recycling, not back on the bike.</li>
  <li><strong>Never charge an unattended LiPo</strong>, and never charge one that has been out in the cold
  until it has warmed up.</li>
  <li><strong>Do not make it a strobe.</strong> Very fast flashing is disorienting for people behind you and is
  illegal in several jurisdictions.</li>
  <li><strong>Waterproof it properly.</strong> Water into a lithium circuit is a fire risk, not just a
  failure.</li>
</ul>
</div>`
});
