/* A machine that must not fail, feeding something that cannot complain. */
AB.addProject({
slug: 'pet-feeder',
title: 'Automatic pet feeder',
cat: 'robotics',
level: 3,
time: '8 hours',
solder: true,
board: 'ESP32',
tags: ['auger', 'stepper', 'load cell', 'jam detection', 'rtc', 'fail safe', 'portion control', 'esp32'],
blurb: 'Dispenses a weighed portion twice a day, and tells you when it did not. The interesting design constraint is that the thing it feeds cannot tell you it went hungry, so every failure has to announce itself.',

skills: ['Auger dispensing', 'Closed-loop portioning', 'Jam detection and recovery', 'Fail-safe design', 'Reliable scheduling', 'Designing for an animal'],

intro: `
<p>An automatic feeder looks like a trivial project: a motor, a timer, some food falls out. Building one that
you would actually trust while away for a weekend is a different exercise, and it is a good introduction to
designing something that must not fail quietly.</p>
<p>Almost every cheap commercial feeder works open loop - run the motor for two seconds and hope. They jam,
they over-dispense when the hopper is full and under-dispense when it is nearly empty, and they fail silently.
The one thing they are meant to do, they cannot confirm.</p>
<p>This one weighs what comes out, detects a jam, retries, and if it still cannot feed, it tells you.</p>`,

what: [
  'Dispense a portion by weight rather than by motor run time.',
  'Feed on a schedule that survives a power cut and a Wi-Fi outage.',
  'Detect a jam, reverse, retry, and give up loudly rather than quietly.',
  'Know when the hopper is running low, before it is empty.',
  'Report every meal, and every failure, so you find out from your phone and not from the cat.'
],

how: `
<p><strong>An auger is the right dispenser, and it jams.</strong> A rotating screw in a tube moves kibble
steadily and meters it reasonably well by rotation. Its failure mode is a piece of kibble wedged between the
flight and the tube wall, and once wedged it will not clear by pushing harder.</p>
<p>The fix is to reverse briefly and go again. Two or three attempts clears almost every jam. What matters is
noticing there is one.</p>

<p><strong>Weight is the only honest measure.</strong> Run-time dispensing varies with how full the hopper is,
how the kibble has settled, and what shape that particular bag is. The same two seconds can give 15&nbsp;g or
40.</p>
<p>A load cell under the bowl closes the loop: dispense until the bowl gains 40&nbsp;g, then stop. Now the
portion is the portion, regardless of everything else.</p>
<p>It also gives you jam detection for free - if the auger is turning and the weight is not rising, something
is wrong.</p>

<p><strong>The bowl is not empty when you start.</strong> Cats do not finish. So the target is "add
40&nbsp;g", measured as a delta from the weight at the start of the meal, not "fill to 40&nbsp;g". Getting this
backwards means a cat that leaves half its breakfast gets no dinner.</p>

<p><strong>Fail loudly, in three ways.</strong> The animal cannot tell you. So:</p>
<ul>
  <li><strong>Local</strong> - an LED and a repeating chirp, so anybody in the house notices.</li>
  <li><strong>Remote</strong> - an MQTT message, and a heartbeat so silence is itself a signal.</li>
  <li><strong>Historical</strong> - log every meal with its actual weight, so you can see a feeder that has
  been under-dispensing for a week.</li>
</ul>
<p>The heartbeat matters more than it sounds. A feeder that has crashed sends no error - it sends nothing.
Something that expects a message every hour turns silence into an alert.</p>

<p><strong>The schedule must survive everything.</strong> A power cut at 3 am must not mean a missed breakfast.
A DS3231 keeps time on its own coin cell, and the schedule lives in flash rather than RAM.</p>
<p>And on boot, check whether a meal was missed while the power was off - if it is 08:30 and breakfast was due
at 08:00 and did not happen, feed now. A feeder that only fires exactly on the minute misses any meal that
coincides with a reboot.</p>

<p><strong>Do not over-feed on retry.</strong> The dangerous bug in a weight-controlled feeder is a load cell
that fails reading zero: the controller sees no weight gain, keeps dispensing, and empties the hopper into the
bowl. Cap the dispense by rotation count as well as by weight, so a sensor failure cannot become a
dangerous overfeed.</p>`,

bom: [
  { id: '28byj', qty: 1, note: 'With its ULN2003 driver. Geared down enough to turn an auger, and it holds position when off.' },
  { id: 'loadcell1k', qty: 1, note: '1 kg with HX711. A bowl and a meal is well under that, and the finer resolution is worth having.' },
  { id: 'esp32', qty: 1, note: 'Wi-Fi for reporting. The reporting is half the project.' },
  { id: 'ds3231', qty: 1, note: 'Keeps time through a power cut on its own cell. Without it, a power cut means the schedule is lost.' },
  { id: 'vl53l0x', qty: 1, note: 'Hopper level. Pointing down inside the hopper it tells you when food is low, days before it runs out.' },
  { id: 'oled13', qty: 1, note: 'Next meal, last portion, any fault.' },
  { id: 'buzzer', qty: 1, note: 'The local alarm. Deliberately annoying.' },
  { id: 'led5', qty: 1, note: 'Fault light, so a problem is visible from across the room.' },
  { id: 'res220', qty: 1 },
  { id: 'button', qty: 1, note: 'Feed now, and acknowledge a fault.' },
  { id: 'psu5v3a', qty: 1, note: 'The stepper wants more than USB will give.' },
  { id: 'cap1000', qty: 1, note: 'Across the motor supply.' },
  { id: 'box-abs', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',    at: [0, 74] },
    { id: 'bb',   comp: 'bb400',    at: [0, 8] },
    { id: 'drv',  comp: 'uln2003',  at: [-56, -48] },
    { id: 'hx',   comp: 'hx711',    at: [-4, -50] },
    { id: 'cell', comp: 'loadcell', at: [-4, -88] },
    { id: 'tof',  comp: 'vl53l0x',  at: [46, -52] },
    { id: 'rtc',  comp: 'ds3231',   at: [64, -14] }
  ],
  wires: [
    { from: 'mcu.VIN',  to: 'bb.T+1',  color: 'red',    note: '5 V from the supply - the motor is on this rail, not the ESP32' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail, common to everything' },
    { from: 'drv.+',    to: 'bb.T+5',  color: 'red',    note: 'Motor driver power, with the 1000 uF across it' },
    { from: 'drv.-',    to: 'bb.T-5',  color: 'black',  note: 'Motor driver ground' },
    { from: 'drv.IN1',  to: 'mcu.D13', color: 'green',  note: 'Coil A' },
    { from: 'drv.IN2',  to: 'mcu.D12', color: 'blue',   note: 'Coil B' },
    { from: 'drv.IN3',  to: 'mcu.D14', color: 'yellow', note: 'Coil C' },
    { from: 'drv.IN4',  to: 'mcu.D27', color: 'orange', note: 'Coil D' },
    { from: 'hx.VCC',   to: 'bb.T+11', color: 'red',    note: 'HX711 power' },
    { from: 'hx.GND',   to: 'bb.T-11', color: 'black',  note: 'HX711 ground' },
    { from: 'hx.DT',    to: 'mcu.D16', color: 'green',  note: 'Load cell data' },
    { from: 'hx.SCK',   to: 'mcu.D4',  color: 'blue',   note: 'Load cell clock' },
    { from: 'cell.RED', to: 'hx.E+',   color: 'red',    note: 'Bridge excitation +' },
    { from: 'cell.BLK', to: 'hx.E-',   color: 'black',  note: 'Bridge excitation -' },
    { from: 'cell.WHT', to: 'hx.A-',   color: 'white',  note: 'Bridge signal -' },
    { from: 'cell.GRN', to: 'hx.A+',   color: 'green',  note: 'Bridge signal +' },
    { from: 'tof.VIN',  to: 'bb.T+17', color: 'red',    note: 'Hopper level sensor power' },
    { from: 'tof.GND',  to: 'bb.T-17', color: 'black',  note: 'Hopper sensor ground' },
    { from: 'tof.SDA',  to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'tof.SCL',  to: 'mcu.D22', color: 'blue',   note: 'I2C clock' },
    { from: 'rtc.VCC',  to: 'bb.T+22', color: 'red',    note: 'RTC power' },
    { from: 'rtc.GND',  to: 'bb.T-22', color: 'black',  note: 'RTC ground' },
    { from: 'rtc.SDA',  to: 'mcu.D21', color: 'green',  note: 'Same I2C bus' },
    { from: 'rtc.SCL',  to: 'mcu.D22', color: 'blue',   note: 'Same clock' }
  ]
},

wireIntro: `<p>A stepper on four pins, a load cell on two, and two I2C devices. The only thing that needs care is
keeping motor current out of the load cell's ground path.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Motor current and a microvolt sensor do not share a ground wire</span>
<p>The load cell signal is measured in microvolts. The stepper draws a few hundred milliamps in abrupt steps.
Share a ground path and those steps appear in your weight reading as jumps exactly when the motor runs - which
is precisely when you are trying to measure.</p>
<p>Run separate ground wires from the motor driver and from the HX711 back to one point at the supply.</p></div>

<div class="note tip"><span class="t">Weigh between steps, not during</span>
<p>Even with good grounding, the simplest fix is to stop the motor, wait 150&nbsp;ms, then read. Dispensing in
short bursts with a weigh between each is slower and far more accurate, and it is how the sketch works.</p></div>

<div class="note"><span class="t">The bowl must sit on the cell and nothing else</span>
<p>Same rule as the <a href="project.html?p=espresso-scale">scale</a>: the load cell is bolted at one end, the
platform at the other, and nothing else touches. A bowl that also rests on the enclosure weighs
nothing.</p></div>`,

solderIntro: `<p>Straightforward soldering. The mechanical build - hopper, auger, tube - is the larger part of
the work and is mostly printing or improvising.</p>`,

solderSteps: [
  { h: 'Separate grounds from the start',
    body: `<p>Two ground wires back to the supply: one for the motor driver, one for everything else. Joining
    them at the board is what puts motor noise into the load cell.</p>` },
  { h: 'Load cell mounted properly',
    body: `<p>Bolted rigidly at one end, bowl platform at the other, spacers at both so the beam can flex.
    Test by pressing the bowl and watching the reading - it should be smooth and repeatable.</p>` },
  { h: 'Auger and tube',
    body: `<p>A printed auger in a tube with a few millimetres of clearance. Too tight and it jams constantly;
    too loose and kibble leaks past without being metered.</p>
    <p>Print one, test with actual food, adjust. This is the part that takes the iterations.</p>` },
  { h: 'Hopper angle steeper than you think',
    body: `<p>Kibble bridges. A hopper with gently sloping sides forms an arch above the outlet and stops
    feeding while still half full. Sixty degrees or steeper, and a smooth interior.</p>` },
  { h: 'ToF sensor looking down the hopper',
    body: `<p>At the top, pointing straight down at the food surface. It reads the distance to the pile, which
    rises as the hopper empties.</p>` },
  { h: 'Calibrate the scale with a known weight',
    body: `<p>Same two-point calibration as the espresso scale. A kitchen scale and a bowl of water is enough
    to get a reference.</p>` },
  { h: 'Test with the animal watching',
    body: `<p>They will investigate. Find out now whether a cat can knock the bowl off, tip the hopper, or
    reach into the auger - because they will try all three.</p>` }
],

libraries: [
  { name: 'HX711', by: 'Bogdan Necula', why: 'Load cell.' },
  { name: 'RTClib', by: 'Adafruit', why: 'Timekeeping through a power cut.' },
  { name: 'Adafruit VL53L0X', by: 'Adafruit', why: 'Hopper level.' },
  { name: 'PubSubClient', by: 'Nick O’Leary', why: 'Reporting, and the heartbeat.' },
  { name: 'U8g2', by: 'oliver', why: 'The display.' }
],

code: [{
  name: 'pet_feeder.ino',
  code: `/* ------------------------------------------------------------------
   Automatic pet feeder - ESP32

   Dispenses by weight with jam detection, and reports every meal and
   every failure. The animal cannot complain, so the machine must.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <HX711.h>
#include <RTClib.h>
#include <Adafruit_VL53L0X.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define COIL1 13
#define COIL2 12
#define COIL3 14
#define COIL4 27
#define HX_DT 16
#define HX_SCK 4
#define BUZZER 26
#define FAULT_LED 25
#define FEED_BTN 15

HX711 scale;
RTC_DS3231 rtc;
Adafruit_VL53L0X hopper;
WiFiClient net;
PubSubClient mqtt(net);

struct Meal { uint8_t hour, minute; float grams; };
Meal schedule[] = { {8, 0, 40.0}, {18, 30, 40.0} };
const int N_MEALS = sizeof(schedule) / sizeof(schedule[0]);

int lastFedDay[N_MEALS];
bool faulted = false;
unsigned long lastHeartbeat = 0;

const int STEPS_PER_BURST = 256;
const int MAX_BURSTS = 40;        // hard cap - see dispense()

void setup() {
  Serial.begin(115200);
  pinMode(COIL1, OUTPUT); pinMode(COIL2, OUTPUT);
  pinMode(COIL3, OUTPUT); pinMode(COIL4, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(FAULT_LED, OUTPUT);
  pinMode(FEED_BTN, INPUT_PULLUP);

  Wire.begin();
  rtc.begin();
  hopper.begin();
  scale.begin(HX_DT, HX_SCK);
  scale.set_scale(419.8f);        // from your own calibration

  WiFi.begin("your-network", "your-password");
  mqtt.setServer("192.168.1.10", 1883);

  for (int i = 0; i < N_MEALS; i++) lastFedDay[i] = -1;

  /* A power cut at 3 am must not mean a missed breakfast. On boot, check
     whether a meal was due earlier today and has not happened - if so,
     feed now rather than waiting until tomorrow. */
  catchUpMissedMeals();
}

void loop() {
  if (!mqtt.connected()) mqtt.connect("feeder");
  mqtt.loop();

  DateTime now = rtc.now();

  for (int i = 0; i < N_MEALS; i++) {
    if (lastFedDay[i] == now.day()) continue;
    if (now.hour() == schedule[i].hour && now.minute() >= schedule[i].minute) {
      feed(schedule[i].grams, i);
    }
  }

  if (digitalRead(FEED_BTN) == LOW) {
    if (faulted) { faulted = false; digitalWrite(FAULT_LED, LOW); }
    else feed(schedule[0].grams, -1);
    delay(400);
  }

  /* Heartbeat. A crashed feeder does not send an error - it sends
     nothing. Something expecting a message every hour turns that silence
     into an alert, which is the only way a total failure gets noticed. */
  if (millis() - lastHeartbeat > 3600000UL) {
    lastHeartbeat = millis();
    char buf[48];
    snprintf(buf, sizeof(buf), "alive,hopper=%d", hopperPercent());
    mqtt.publish("feeder/heartbeat", buf);
  }

  if (faulted) { tone(BUZZER, 2000, 120); delay(3000); }
  delay(500);
}

void feed(float grams, int mealIndex) {
  /* Target is a DELTA, not a fill level. Cats do not finish, and "fill
     the bowl to 40 g" means a cat that left half its breakfast gets no
     dinner. */
  float startWeight = readWeight();
  float target = startWeight + grams;

  Serial.printf("Feeding %.0f g (bowl has %.0f g)\\n", grams, startWeight);

  int bursts = 0, jams = 0;
  float lastWeight = startWeight;

  while (readWeight() < target && bursts < MAX_BURSTS) {
    turnAuger(STEPS_PER_BURST, true);
    delay(150);                       // let the cell settle before reading
    float now = readWeight();

    // Turning but not gaining weight: the auger is jammed.
    if (now - lastWeight < 0.5f) {
      jams++;
      Serial.printf("jam %d - reversing\\n", jams);
      turnAuger(STEPS_PER_BURST / 2, false);
      delay(200);
      if (jams >= 3) break;
    } else {
      jams = 0;
    }

    lastWeight = now;
    bursts++;
  }

  releaseCoils();
  float delivered = readWeight() - startWeight;

  char msg[96];
  if (delivered < grams * 0.7f) {
    /* Either jammed, out of food, or the load cell has failed. Say so
       rather than recording a successful meal that did not happen. */
    faulted = true;
    digitalWrite(FAULT_LED, HIGH);
    snprintf(msg, sizeof(msg), "FAILED,wanted=%.0f,got=%.0f,hopper=%d",
             grams, delivered, hopperPercent());
    mqtt.publish("feeder/alert", msg);
    Serial.println(msg);
  } else {
    if (mealIndex >= 0) lastFedDay[mealIndex] = rtc.now().day();
    snprintf(msg, sizeof(msg), "fed,g=%.0f,hopper=%d", delivered, hopperPercent());
    mqtt.publish("feeder/meal", msg);
    Serial.println(msg);
  }
}

float readWeight() {
  if (!scale.is_ready()) return -1;
  return scale.get_units(3);
}

/* Half-step sequence. The auger is geared down hard, so speed does not
   matter and torque does. */
const int SEQ[8][4] = {
  {1,0,0,0},{1,1,0,0},{0,1,0,0},{0,1,1,0},
  {0,0,1,0},{0,0,1,1},{0,0,0,1},{1,0,0,1}
};

void turnAuger(int steps, bool forward) {
  static int phase = 0;
  for (int i = 0; i < steps; i++) {
    phase = forward ? (phase + 1) % 8 : (phase + 7) % 8;
    digitalWrite(COIL1, SEQ[phase][0]);
    digitalWrite(COIL2, SEQ[phase][1]);
    digitalWrite(COIL3, SEQ[phase][2]);
    digitalWrite(COIL4, SEQ[phase][3]);
    delayMicroseconds(1600);
  }
}

// Coils energised at rest draw 250 mA and get hot for no benefit.
void releaseCoils() {
  digitalWrite(COIL1, LOW); digitalWrite(COIL2, LOW);
  digitalWrite(COIL3, LOW); digitalWrite(COIL4, LOW);
}

int hopperPercent() {
  VL53L0X_RangingMeasurementData_t m;
  hopper.rangingTest(&m, false);
  if (m.RangeStatus == 4) return -1;
  // 40 mm from the sensor is full, 260 mm is empty. Measure yours.
  int pct = map(constrain(m.RangeMilliMeter, 40, 260), 260, 40, 0, 100);
  return pct;
}

void catchUpMissedMeals() {
  DateTime now = rtc.now();
  int minsNow = now.hour() * 60 + now.minute();
  for (int i = 0; i < N_MEALS; i++) {
    int minsMeal = schedule[i].hour * 60 + schedule[i].minute;
    // Within two hours of a missed meal, feed it. Beyond that, let it go
    // rather than double-feeding after a long outage.
    if (minsNow > minsMeal && minsNow - minsMeal < 120) {
      Serial.println("Catching up a missed meal");
      feed(schedule[i].grams, i);
    }
  }
}`
}],

trouble: [
  { q: 'Weight jumps around while the motor runs',
    a: `Shared ground between the motor driver and the HX711. Separate the ground wires back to the supply, and
    weigh between bursts rather than during them.` },
  { q: 'It dispenses far too much',
    a: `The load cell is reading zero or not changing, so the controller never sees the target reached. That is
    what <code>MAX_BURSTS</code> exists to cap - check the scale independently before trusting it.` },
  { q: 'It jams constantly',
    a: `Auger clearance too tight, or the kibble is larger than the gap between flights. Print a slightly
    smaller auger, or use a different food - some shapes simply do not auger well.` },
  { q: 'It stops feeding with the hopper half full',
    a: `Bridging - the kibble has formed an arch above the outlet. Steepen the hopper walls, smooth the inside,
    or add a stirrer on the same shaft.` },
  { q: 'It feeds twice some days',
    a: `The day check is being reset, or the RTC lost time and jumped. Confirm the DS3231 has a good coin cell
    - a dead one means it restarts from the compile time on every power cut.` },
  { q: 'Nothing happens after a power cut',
    a: `<code>catchUpMissedMeals()</code> is not running, or the outage was longer than the two-hour window it
    allows. That window is deliberate - feeding four meals at once after a day-long outage is worse than
    missing them.` },
  { q: 'The motor gets hot between meals',
    a: `Coils still energised. <code>releaseCoils()</code> must be called after every dispense.` },
  { q: 'The cat has defeated it',
    a: `They will. Weight the base, make the hopper lid positively latched, and put the auger outlet where a
    paw cannot reach. This is an iterative process and you will lose several rounds.` }
],

safety: `
<div class="note warn"><span class="t">An animal depends on this</span>
<p>That is the whole design constraint. Some rules that follow from it:</p>
<ul>
  <li><strong>Never rely on it alone for a trip longer than a day</strong> without somebody checking. Not
  because this design is bad, but because no single unattended machine should be the only thing between an
  animal and going hungry.</li>
  <li><strong>Always leave a bowl of food out as well</strong> when away. A feeder that fails with a full
  backup bowl is an inconvenience; one that fails without is not.</li>
  <li><strong>Test the alerts before you need them.</strong> Jam it deliberately and confirm the message
  arrives on your phone. An alerting system nobody has tested is not an alerting system.</li>
  <li><strong>The heartbeat is the important one.</strong> A crashed feeder cannot report its own failure - only
  the absence of an expected message reveals it.</li>
  <li><strong>Keep the auger inaccessible.</strong> A geared stepper has enough torque to hurt a paw or a nose,
  and animals investigate.</li>
  <li><strong>Portion sizes are a vet question</strong>, not an engineering one. Free-feeding and scheduled
  feeding suit different animals, and some conditions make automatic feeding a bad idea entirely.</li>
</ul>
<p>Water must never be automated this way as the sole supply. A blocked or failed water dispenser is dangerous
in hours rather than days - always leave a normal bowl.</p></div>`,

next: `
<ul>
  <li><strong>Test the failure path first.</strong> Before trusting it, block the auger and confirm you get an
  alert. That single test is worth more than any amount of successful feeding.</li>
  <li><strong>Log bowl weight continuously</strong>, not just at mealtimes. How fast the bowl empties is
  genuinely useful information about an animal's health, and a change in that pattern is worth noticing.</li>
  <li><strong>Add the <a href="project.html?p=rfid-door-lock">RFID</a> approach</strong> so a collar tag opens a
  flap - a feeder that only feeds one of two cats solves a real and common problem.</li>
  <li><strong>A camera</strong> from the <a href="project.html?p=esp32cam-wifi-camera">ESP32-CAM project</a>, so
  you can confirm the food arrived and was eaten.</li>
  <li><strong>Second hopper, second auger</strong> for two animals with different diets, sharing the scale and
  the schedule.</li>
</ul>`
});
