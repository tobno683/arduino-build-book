/* Two probes, a long radio link, and the stall - which is physics, not a fault. */
AB.addProject({
slug: 'bbq-thermometer',
title: 'Wireless BBQ and roast thermometer',
cat: 'kitchen',
level: 3,
time: '6 hours',
solder: true,
board: 'ESP32',
tags: ['thermocouple', 'max31855', 'lora', 'bbq', 'cold junction', 'the stall', 'prediction', 'esp32'],
blurb: 'One probe in the meat, one in the air, and a radio link that reaches the far end of the garden. It also predicts when dinner will be ready, and explains why that prediction goes badly wrong for two hours in the middle.',

skills: ['Thermocouples and cold junction compensation', 'Probe placement', 'LoRa links', 'Rate-of-change prediction', 'Evaporative cooling', 'Low-power radio design'],

intro: `
<p>A large piece of meat takes eight hours and the difference between good and ruined is a few degrees. You
cannot keep opening the lid to look, because every time you do you lose twenty minutes of heat.</p>
<p>So: a thermocouple in the meat, another measuring the pit air, and a radio link to a receiver indoors. The
build is straightforward. The interesting parts are why a thermocouple needs to know its own temperature to
tell you anything, and why every time-remaining prediction you make will be confidently wrong in the
middle.</p>`,

what: [
  'Measure meat and pit temperature over a range no ordinary sensor survives.',
  'Send readings 100 metres or more, through a house wall, on a coin-cell-scale power budget.',
  'Alarm on a target temperature, and on the pit running hot or cold.',
  'Estimate time remaining, and be honest about when that estimate is meaningless.',
  'Detect and report the stall, which is the thing that panics everybody the first time.'
],

how: `
<p><strong>A thermocouple measures a difference, not a temperature.</strong> Two dissimilar metals joined
produce a voltage proportional to the difference in temperature between that junction and the other end of the
wires. So the reading tells you how much hotter the tip is than the connector - and to get an absolute number
you must also know the connector's temperature.</p>
<p>That is <strong>cold junction compensation</strong>, and it is why the MAX31855 has its own temperature
sensor on the chip. It is also why the amplifier should not sit next to the barbecue: if the chip is at
60&nbsp;degrees and thinks it is at 25, every reading is 35 degrees wrong.</p>

<p><strong>Why a thermocouple and not a DS18B20.</strong> The digital sensors used elsewhere in this book top
out around 125&nbsp;degrees. Pit air in a smoker is 110-150 and a searing grill is 300 plus. A K-type
thermocouple reads to 1,200&nbsp;degrees and does not care.</p>
<p>The trade is resolution and noise: a thermocouple is good to about half a degree where a DS18B20 manages a
sixteenth. For meat, half a degree is far more than enough.</p>

<p><strong>Probe placement decides everything.</strong> The meat probe goes in the thickest part, avoiding
bone and fat. Bone conducts heat faster and reads high; a fat pocket insulates and reads low. Touch either and
you will take the meat off ten degrees early or late.</p>
<p>The pit probe goes at grate level beside the meat, not in the dome. The dome thermometer on most
barbecues reads 20-30 degrees hotter than the air where the food actually is, which is why everyone's first
smoke cooks faster on top than underneath.</p>

<p><strong>LoRa rather than Wi-Fi.</strong> A barbecue is in the garden and the cook is indoors. Wi-Fi would
work if the garden had coverage, which gardens generally do not. LoRa at 868&nbsp;MHz covers hundreds of metres
through walls at a fraction of the power, and the data rate - a few bytes a minute - is trivial for it.</p>
<p>Duty cycle is the constraint: EU 868&nbsp;MHz allows 1% airtime. At one short packet every 30 seconds you
are nowhere near it, but it is the reason not to send every second.</p>

<p><strong>The stall, which is real physics.</strong> Somewhere around 65-70&nbsp;degrees internal, a large cut
stops rising. It can sit there for hours while the pit stays at 110. The first time this happens everyone
assumes the thermometer has failed.</p>
<p>It has not. Moisture is evaporating from the surface fast enough that the cooling exactly balances the heat
going in - it is a wet-bulb effect, the same reason you feel cold getting out of a pool. It ends when the
surface dries.</p>
<p>Which is also why any naive "time remaining" calculation breaks: extrapolate the rate during the stall and
you get an answer of never. The sketch detects the stall and says so rather than showing an absurd
number.</p>`,

bom: [
  { id: 'max31855', qty: 2, note: 'One per probe. Cold junction compensated, which matters more than any other spec here.' },
  { id: 'thermo-k', qty: 2, note: 'Food-grade sealed stainless. The braided-fibre ones wick juices up the insulation and cannot be washed.' },
  { id: 'esp32', qty: 1, note: 'The transmitter, at the barbecue.' },
  { id: 'lora', qty: 2, note: 'One at each end. 868 MHz in Europe, 915 in the US - buy the right band for where you live.' },
  { id: 'ant-868', qty: 2, note: 'Never power a LoRa module without an antenna connected - it can damage the output stage.' },
  { id: 'nano', qty: 1, note: 'The indoor receiver. It needs no Wi-Fi and no cleverness.' },
  { id: 'oled13b', qty: 1, note: 'Receiver display.' },
  { id: 'buzzer', qty: 1, note: 'The alarm. This is the entire point of the receiver.' },
  { id: 'lipo2000', qty: 1, note: 'Transmitter power. A long smoke is twelve hours.' },
  { id: 'tp4056', qty: 1 },
  { id: 'box-ip65', qty: 1, note: 'The transmitter lives outdoors beside something hot and occasionally rains.' },
  { id: 'box-abs', qty: 1, note: 'The receiver.' },
  { id: 'perfboard', qty: 2 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'heatshrink', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',    at: [0, 72] },
    { id: 'bb',   comp: 'bb400',    at: [0, 6] },
    { id: 'amp1', comp: 'max31855', at: [-58, -48] },
    { id: 'amp2', comp: 'max31855', at: [-10, -48] },
    { id: 'rad',  comp: 'lora',     at: [52, -52] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail - the LoRa module is NOT 5 V tolerant' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'amp1.VIN', to: 'bb.T+5',  color: 'red',    note: 'Meat probe amplifier power' },
    { from: 'amp1.GND', to: 'bb.T-5',  color: 'black',  note: 'Ground' },
    { from: 'amp1.CLK', to: 'mcu.D18', color: 'blue',   note: 'SPI clock, shared between both amplifiers' },
    { from: 'amp1.DO',  to: 'mcu.D19', color: 'green',  note: 'SPI data in, shared' },
    { from: 'amp1.CS',  to: 'mcu.D5',  color: 'yellow', note: 'Meat probe chip select - its own pin' },
    { from: 'amp2.VIN', to: 'bb.T+11', color: 'red',    note: 'Pit probe amplifier power' },
    { from: 'amp2.GND', to: 'bb.T-11', color: 'black',  note: 'Ground' },
    { from: 'amp2.CLK', to: 'mcu.D18', color: 'blue',   note: 'Same SPI clock' },
    { from: 'amp2.DO',  to: 'mcu.D19', color: 'green',  note: 'Same SPI data' },
    { from: 'amp2.CS',  to: 'mcu.D17', color: 'orange', note: 'Pit probe chip select - its own pin' },
    { from: 'rad.VCC',  to: 'bb.T+17', color: 'red',    note: 'Radio power' },
    { from: 'rad.GND',  to: 'bb.T-17', color: 'black',  note: 'Radio ground' },
    { from: 'rad.SCK',  to: 'mcu.D18', color: 'blue',   note: 'Same SPI bus again' },
    { from: 'rad.MISO', to: 'mcu.D19', color: 'green',  note: 'Same SPI data in' },
    { from: 'rad.MOSI', to: 'mcu.D23', color: 'white',  note: 'SPI data out - only the radio needs this' },
    { from: 'rad.NSS',  to: 'mcu.D16', color: 'purple', note: 'Radio chip select' },
    { from: 'rad.RST',  to: 'mcu.D14', color: 'grey',   note: 'Radio reset' },
    { from: 'rad.DIO0', to: 'mcu.D26', color: 'yellow', note: 'Transmit-done interrupt' }
  ]
},

wireIntro: `<p>The transmitter is shown. Three SPI devices share one bus with separate chip-select lines - the
standard arrangement, and the reason each device needs its own CS pin and nothing else.</p>`,

wireNotes: `
<div class="note danger"><span class="t">Never power the radio without an antenna</span>
<p>A transmitter with no antenna has nowhere to send its power, and it reflects back into the output stage.
Fit the antenna before the module is ever powered. This kills more LoRa modules than anything else.</p></div>

<div class="note warn"><span class="t">Keep the amplifier away from the heat</span>
<p>Cold junction compensation depends on the MAX31855 knowing its own temperature. Mount it in the enclosure,
away from the barbecue, with the thermocouple wire running out to the probe.</p>
<p>A hot amplifier produces readings that are wrong by however much it has heated up, and nothing about the
display will suggest anything is amiss.</p></div>

<div class="note tip"><span class="t">Thermocouple polarity matters</span>
<p>K-type wire is colour coded - in the IEC scheme green is positive and white negative; the American ANSI
scheme uses yellow and red. Reversed, the reading falls as the probe heats. Note which convention your probe
follows.</p></div>`,

solderIntro: `<p>Two boards. The transmitter needs care because it lives outdoors next to something hot; the
receiver is an evening's easy work.</p>`,

solderSteps: [
  { h: 'Transmitter board, amplifiers first',
    body: `<p>Both MAX31855s on the shared SPI bus with separate CS lines. Test each one individually with a
    probe in iced water - it should read 0.0 - before adding the radio.</p>` },
  { h: 'Screw terminals for the probes, not soldered joints',
    body: `<p>Thermocouple wire is an alloy chosen for its thermoelectric properties, and soldering it
    introduces two new junctions of different metals right where you least want them. Use the screw terminals
    on the amplifier board, which are designed for this.</p>` },
  { h: 'Radio, with the antenna fitted first',
    body: `<p>Antenna connected before power, every time. Then check you can send and receive over a metre
    before worrying about garden range.</p>` },
  { h: 'Waterproof the transmitter, and vent it',
    body: `<p>Glands for the probe cables, vents on the underside. A sealed box in the sun becomes an oven and
    the cold junction compensation suffers.</p>` },
  { h: 'Receiver: radio, display, buzzer',
    body: `<p>Simpler. The only thing that matters is that the buzzer is loud enough to hear from another
    room, because that is what the receiver is for.</p>` },
  { h: 'Range test before you cook anything',
    body: `<p>Walk to the end of the garden with the receiver and confirm packets still arrive. Finding out
    mid-cook that the signal does not reach the kitchen is a bad evening.</p>` }
],

libraries: [
  { name: 'Adafruit MAX31855', by: 'Adafruit', why: 'Thermocouple amplifier, including the fault bits that tell you the probe is open circuit.' },
  { name: 'LoRa', by: 'Sandeep Mistry', why: 'Simple and reliable SX127x driver.' },
  { name: 'U8g2', by: 'oliver', why: 'Receiver display.' }
],

code: [{
  name: 'bbq_transmitter.ino',
  code: `/* ------------------------------------------------------------------
   BBQ thermometer - transmitter

   Two K-type probes, one LoRa packet every 30 seconds.
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <Adafruit_MAX31855.h>
#include <LoRa.h>

#define CS_MEAT   5
#define CS_PIT   17
#define LORA_SS  16
#define LORA_RST 14
#define LORA_DIO 26

Adafruit_MAX31855 meatProbe(CS_MEAT);
Adafruit_MAX31855 pitProbe(CS_PIT);

#define HIST 40                    // 20 minutes at one every 30 s
float meatHist[HIST];
int   histCount = 0;

void setup() {
  Serial.begin(115200);
  SPI.begin();

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO);
  if (!LoRa.begin(868E6)) {        // 915E6 in the US
    Serial.println("LoRa failed - check the antenna is fitted");
    while (1) delay(1000);
  }
  LoRa.setSpreadingFactor(9);      // range vs airtime, comfortably legal here
  LoRa.setTxPower(17);

  delay(500);
}

void loop() {
  double meat = meatProbe.readCelsius();
  double pit  = pitProbe.readCelsius();

  // NaN means a fault, and the chip tells you which kind.
  if (isnan(meat)) {
    uint8_t e = meatProbe.readError();
    Serial.printf("Meat probe fault: %s\\n",
      (e & MAX31855_FAULT_OPEN)   ? "open circuit"  :
      (e & MAX31855_FAULT_SHORT_GND) ? "short to GND" :
      (e & MAX31855_FAULT_SHORT_VCC) ? "short to VCC" : "unknown");
  }

  if (!isnan(meat)) {
    if (histCount < HIST) {
      meatHist[histCount++] = meat;
    } else {
      memmove(meatHist, meatHist + 1, (HIST - 1) * sizeof(float));
      meatHist[HIST - 1] = meat;
    }
  }

  float rate = riseRate();            // degrees per hour
  int8_t state = cookState(meat, rate);

  char packet[48];
  snprintf(packet, sizeof(packet), "M%.1f,P%.1f,R%.1f,S%d", meat, pit, rate, state);

  LoRa.beginPacket();
  LoRa.print(packet);
  LoRa.endPacket();
  Serial.println(packet);

  // 30 s. Nowhere near the EU 1% duty cycle limit, and fast enough that
  // nothing in a twelve-hour cook is missed.
  delay(30000);
}

/* Degrees per hour over the last twenty minutes. Anything shorter is
   dominated by noise; anything longer is too slow to notice the stall
   ending. */
float riseRate() {
  if (histCount < 8) return 0;
  int n = min(histCount, HIST);
  float span = (meatHist[n - 1] - meatHist[0]);
  float hours = (n - 1) * 30.0f / 3600.0f;
  return hours > 0 ? span / hours : 0;
}

/* 0 = normal, 1 = stalled, 2 = done.

   The stall: somewhere around 65-70 C a large cut stops rising for hours
   because evaporation from the surface is removing heat as fast as the
   pit is adding it. It is not a fault, and any time-remaining figure
   computed during it is meaningless - so we say "stalled" instead of
   extrapolating to a silly number. */
int8_t cookState(float meat, float rate) {
  if (isnan(meat)) return -1;
  if (meat >= 93.0f) return 2;
  if (meat > 60.0f && meat < 80.0f && rate < 2.0f) return 1;
  return 0;
}`
}, {
  name: 'bbq_receiver.ino',
  code: `/* ------------------------------------------------------------------
   BBQ thermometer - indoor receiver
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <LoRa.h>
#include <U8g2lib.h>

#define LORA_SS  10
#define LORA_RST  9
#define LORA_DIO  2
#define BUZZER    6

U8G2_SH1106_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);

float meat = 0, pit = 0, rate = 0;
int state = 0;
unsigned long lastPacket = 0;

const float TARGET = 93.0;       // pulled pork
const float PIT_LOW = 100.0, PIT_HIGH = 135.0;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  oled.begin();

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO);
  if (!LoRa.begin(868E6)) { oled.clearBuffer();
    oled.drawStr(0, 20, "No radio"); oled.sendBuffer(); while (1) delay(1000); }
  LoRa.setSpreadingFactor(9);
}

void loop() {
  int sz = LoRa.parsePacket();
  if (sz) {
    char buf[64]; int i = 0;
    while (LoRa.available() && i < 63) buf[i++] = LoRa.read();
    buf[i] = 0;
    sscanf(buf, "M%f,P%f,R%f,S%d", &meat, &pit, &rate, &state);
    lastPacket = millis();
  }

  checkAlarms();
  draw();
}

void checkAlarms() {
  static bool done = false, pitWarned = false;

  if (!done && meat >= TARGET) { done = true; alarm(6); }
  if (!pitWarned && (pit < PIT_LOW || pit > PIT_HIGH)) { pitWarned = true; alarm(2); }
  if (pit >= PIT_LOW && pit <= PIT_HIGH) pitWarned = false;
}

void draw() {
  char line[26];
  oled.clearBuffer();

  oled.setFont(u8g2_font_helvB18_tr);
  snprintf(line, sizeof(line), "%.0fC", meat);
  oled.drawStr(0, 24, line);

  oled.setFont(u8g2_font_6x10_tf);
  snprintf(line, sizeof(line), "pit %.0fC", pit);
  oled.drawStr(72, 22, line);

  if (state == 1) {
    // Say what is happening rather than showing an absurd prediction.
    oled.drawStr(0, 42, "STALLED - normal");
    oled.drawStr(0, 54, "wait it out");
  } else if (state == 2) {
    oled.drawStr(0, 42, "DONE - take it off");
  } else if (rate > 1.0f) {
    float hrs = (TARGET - meat) / rate;
    snprintf(line, sizeof(line), "%.0f C/h  ~%.1f h left", rate, hrs);
    oled.drawStr(0, 42, line);
  } else {
    oled.drawStr(0, 42, "settling...");
  }

  // Silence is ambiguous on a radio link: no packet could mean "fine" or
  // "the transmitter is dead". Say which.
  unsigned long age = (millis() - lastPacket) / 1000;
  snprintf(line, sizeof(line), age > 120 ? "NO SIGNAL %lus" : "ok %lus ago", age);
  oled.drawStr(0, 63, line);

  oled.sendBuffer();
  delay(500);
}

void alarm(int n) {
  for (int i = 0; i < n; i++) {
    tone(BUZZER, 2400, 250); delay(350);
  }
}`
}],

trouble: [
  { q: 'Readings are consistently 20-40 degrees too high',
    a: `The amplifier is hot. Cold junction compensation assumes the chip is at ambient - move it away from
    the barbecue and insulate the enclosure from radiant heat.` },
  { q: 'Temperature falls as the probe heats up',
    a: `Thermocouple polarity reversed. Swap the two wires at the screw terminals.` },
  { q: 'readCelsius returns NaN',
    a: `The chip reports the reason - open circuit means a broken probe or a loose terminal, which is by far
    the commonest. The sketch prints which fault bit is set.` },
  { q: 'Both probes read the same value',
    a: `Chip selects are on the same pin, or one CS is not connected. Every SPI device needs its own.` },
  { q: 'The meat temperature stops rising for hours',
    a: `That is the stall and it is normal - see the write-up. It ends on its own. Wrapping in foil shortens it
    considerably by stopping the evaporation.` },
  { q: 'Time remaining says twelve hours, then forty minutes',
    a: `Extrapolation during the stall. The sketch suppresses the estimate when it detects one, which is the
    honest answer - during a stall there genuinely is no reliable prediction.` },
  { q: 'Packets stop when you go indoors',
    a: `Raise the spreading factor to 10 or 11 for more range at the cost of airtime, check the antenna
    orientation - they are vertically polarised, so both ends should be upright - and get the transmitter
    antenna away from the metal barbecue body.` },
  { q: 'Range is poor even in the open',
    a: `Wrong frequency band for your module, or the antenna is for a different band. An 868 MHz antenna on a
    915 MHz module loses most of its output.` }
],

safety: `
<div class="note warn"><span class="t">Hot things and lithium batteries</span>
<p>The transmitter contains a lithium cell and sits beside a barbecue. Keep the enclosure off the hot surfaces
and out of direct radiant heat - lithium cells vent above about 60&nbsp;degrees and a sealed box in the sun
next to a smoker gets there easily.</p>
<p>Consistent with every other lithium project in this book: do not charge below 0&nbsp;degrees, do not charge
unattended, and if a cell ever puffs up, stop using it.</p>
<p>Thermocouple probes reach cooking temperatures and stay hot for a long time afterwards. The sheath gives no
warning that it is at 200&nbsp;degrees.</p></div>

<div class="note"><span class="t">Food safety is not the thermometer's job</span>
<p>The thermometer tells you a temperature. Whether that temperature is safe for what you are cooking, and for
how long it has been held, is a separate question with published answers - use them. Poultry in particular has
a target that is not negotiable.</p>
<p>Calibrate in iced water before you rely on it: crushed ice with a little water, stirred, is 0.0&nbsp;degrees
to within a tenth. Any offset you see there is present at every other temperature too.</p></div>`,

next: `
<ul>
  <li><strong>A third probe.</strong> Large cuts are not one temperature, and two meat probes at different
  depths tell you far more than one.</li>
  <li><strong>Control the pit</strong>, not just watch it: a fan and a damper servo driven by the
  <a href="project.html?p=sous-vide-controller">PID controller</a> holds a charcoal smoker steadier than any
  human can.</li>
  <li><strong>Log the whole cook</strong> and overlay several. The stall shows up beautifully, and so does the
  effect of wrapping.</li>
  <li><strong>Push to a phone</strong> via the <a href="project.html?p=lora-offgrid-messenger">LoRa
  messenger</a> gateway, so the alarm reaches you anywhere rather than only in the kitchen.</li>
</ul>`
});
