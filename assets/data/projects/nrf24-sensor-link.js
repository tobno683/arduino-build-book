/* Two nRF24L01+ nodes: the cheapest honest wireless link, and the capacitor that makes it work. */
AB.addProject({
slug: 'nrf24-sensor-link',
title: 'Wireless sensor link on 2.4 GHz',
cat: 'radio',
level: 2,
time: '3 hours',
solder: false,
board: 'Nano x2',
tags: ['nrf24l01', '2.4ghz', 'wireless', 'spi', 'sensor node', 'acknowledgement', 'no soldering', 'bme280'],
blurb: 'Three dollars of radio, a sensor in the garden and a display indoors. Also the project where you learn why almost everyone\'s first nRF24 does not work.',

skills: ['SPI', 'Radio addressing', 'Auto-acknowledgement', 'Supply decoupling', 'Packet structures', 'Link diagnostics'],

intro: `
<p>The nRF24L01+ is the cheapest way to move data between two microcontrollers without a wire, and at about
$1.50 a module it is cheaper than the connector you would have used instead. Two of them talk to each other
across a house.</p>
<p>It is also, by a wide margin, the module in this book with the worst reputation - and almost all of that
reputation comes from one fixable problem. The forums are full of people whose radio works for ten packets
and then stops, or works on the bench and fails in the enclosure, or works with one Arduino and not another.
The cause is nearly always a missing capacitor, and this guide puts it in the parts list rather than in the
troubleshooting section.</p>
<p>What you get for the effort is a genuinely useful building block. Once two boards can talk, a sensor can
live where it needs to live rather than where the cable reaches.</p>`,

what: [
  'Send temperature, humidity and pressure from a battery-powered node to a display node.',
  'Get hardware acknowledgements back, so the sender knows whether each packet actually arrived.',
  'Retry automatically on failure, with the radio chip doing the work rather than your code.',
  'Show live readings, signal quality and time-since-last-packet on an OLED.',
  'Address several nodes separately, so you can add a second and third sensor later.',
  'Diagnose a bad link properly, with a script that tells you which of the four usual causes it is.'
],

how: `
<p><strong>What the module is.</strong> A Nordic nRF24L01+ transceiver: 2.4&nbsp;GHz, GFSK modulation, 125
channels spaced 1&nbsp;MHz apart from 2400 to 2525&nbsp;MHz. It talks to the Arduino over SPI and handles the
radio protocol itself.</p>

<p><strong>Enhanced ShockBurst, which is the good part.</strong> The chip does far more than send bytes. When
you transmit, it adds a CRC, waits for the receiver's automatic acknowledgement, and retries on its own if
none arrives - up to fifteen times, with a configurable gap. All of that happens in hardware in under a
millisecond and your sketch simply gets back <code>true</code> or <code>false</code>.</p>
<p>That single boolean is worth a lot. A radio link that silently loses packets is miserable to debug; one
that tells you the moment a packet did not land is straightforward.</p>

<p><strong>Addresses, which are not really addresses.</strong> Each pipe has a 5-byte address, and the
receiver only raises an interrupt for packets whose address matches. It is a filter rather than a network -
there is no routing, no collision avoidance and no security. Anyone within range with the same address and
channel hears everything.</p>
<p>Pick addresses that are not all one repeated byte. <code>"1Node"</code> and <code>"2Node"</code> from the
examples are fine; <code>0xE7E7E7E7E7</code> is the power-on default that half the world is also using.</p>

<p><strong>The power problem, in detail.</strong> This is the thing.</p>
<p>The module runs on 3.3&nbsp;V and draws around 12&nbsp;mA while transmitting - modest on average, but it
draws it in sharp bursts as the transmitter keys up, and the PA+LNA versions with the external antenna pull
well over 100&nbsp;mA in those bursts.</p>
<p>An Arduino Uno or Nano makes its 3.3&nbsp;V with a small regulator that can supply about 50&nbsp;mA
steadily and responds slowly to a sudden step. The result is a voltage dip at exactly the moment the radio
needs to be stable, so the chip browns out mid-packet. Symptoms: it works at first and then stops, or works
only at short range, or works until you put it in a box.</p>
<p><strong>A 10&nbsp;uF capacitor soldered directly across the module's VCC and GND pins fixes it.</strong>
Not on the breadboard a few centimetres away - on the module. It supplies the burst locally so the regulator
never has to. This is not a refinement; it is the difference between a working radio and a fortnight of
confusion.</p>

<p><strong>The 5 V question.</strong> VCC must be 3.3&nbsp;V and 5&nbsp;V will destroy the module. The
<em>signal</em> pins, however, are 5&nbsp;V tolerant - which is unusual and convenient, and means an Uno or
Nano can drive SPI directly with no level shifter.</p>`,

bom: [
  { id: 'nano', qty: 2, note: 'One per node. An Uno works equally well for the receiver if you prefer the bigger board.' },
  { id: 'nrf24', qty: 1, note: 'Sold in pairs, which is exactly what this project needs. The bare-PCB-antenna version is right for indoor range; the PA+LNA version with the screw antenna needs a much better supply.' },
  { id: 'cap10', qty: 2, note: 'READ THE WIRING NOTES. One soldered across each module is the single most important component in this project. Anything from 4.7 to 100 uF works.' },
  { id: 'bme280', qty: 1, note: 'Temperature, humidity and pressure over I2C. A DHT22 works with three lines changed if you already have one.' },
  { id: 'oled13', qty: 1, note: 'On the receiver. Shows the readings plus the link statistics, which matter more than you would expect.' },
  { id: 'batt-aa2', qty: 1, note: 'For the sensor node. Two AAs into VIN, or see the tuning section for how to get months out of it.' },
  { id: 'bb-400', qty: 2, note: 'One per node.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'box-abs', qty: 1, note: 'For the sensor node if it is going somewhere damp. Ventilated, or the humidity reading is of the inside of a box.' }
],

tools: [{ id: 'iron', note: 'Only for the two capacitors. Everything else is plug-together.' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'tx',    comp: 'nano',   at: [-74, 44] },
    { id: 'txbb',  comp: 'bb400',  at: [-74, -16] },
    { id: 'txrf',  comp: 'nrf24',  at: [-112, -58], ry: 180 },
    { id: 'bme',   comp: 'bme280', at: [-44, -58] },
    { id: 'rx',    comp: 'nano',   at: [74, 44] },
    { id: 'rxbb',  comp: 'bb400',  at: [74, -16] },
    { id: 'rxrf',  comp: 'nrf24',  at: [36, -58], ry: 180 },
    { id: 'oled',  comp: 'oled13', at: [104, -58], ry: 180 }
  ],
  wires: [
    { from: 'tx.3V3',  to: 'txbb.T+2',  color: 'red',    note: 'SENDER: 3.3 V rail. The radio is a 3.3 V part - 5 V destroys it' },
    { from: 'tx.GND',  to: 'txbb.T-2',  color: 'black',  note: 'SENDER: ground rail' },
    { from: 'txrf.VCC', to: 'txbb.T+6', color: 'red',    note: 'SENDER: radio power, with the 10 uF capacitor soldered across it' },
    { from: 'txrf.GND', to: 'txbb.T-6', color: 'black',  note: 'SENDER: radio ground' },
    { from: 'txrf.CE',  to: 'tx.D9',    color: 'green',  note: 'SENDER: chip enable - switches between listening and sending' },
    { from: 'txrf.CSN', to: 'tx.D10',   color: 'orange', note: 'SENDER: SPI chip select' },
    { from: 'txrf.SCK', to: 'tx.D13',   color: 'yellow', note: 'SENDER: SPI clock' },
    { from: 'txrf.MOSI', to: 'tx.D11',  color: 'blue',   note: 'SENDER: SPI data out' },
    { from: 'txrf.MISO', to: 'tx.D12',  color: 'purple', note: 'SENDER: SPI data in' },
    { from: 'bme.VIN', to: 'txbb.T+12', color: 'red',    note: 'SENDER: sensor power, 3.3 V' },
    { from: 'bme.GND', to: 'txbb.T-12', color: 'black',  note: 'SENDER: sensor ground' },
    { from: 'bme.SDA', to: 'tx.A4',     color: 'blue',   note: 'SENDER: I2C data to the sensor' },
    { from: 'bme.SCL', to: 'tx.A5',     color: 'yellow', note: 'SENDER: I2C clock' },

    { from: 'rx.3V3',  to: 'rxbb.T+2',  color: 'red',    note: 'RECEIVER: 3.3 V rail' },
    { from: 'rx.GND',  to: 'rxbb.T-2',  color: 'black',  note: 'RECEIVER: ground rail' },
    { from: 'rxrf.VCC', to: 'rxbb.T+6', color: 'red',    note: 'RECEIVER: radio power, capacitor across it here too' },
    { from: 'rxrf.GND', to: 'rxbb.T-6', color: 'black',  note: 'RECEIVER: radio ground' },
    { from: 'rxrf.CE',  to: 'rx.D9',    color: 'green',  note: 'RECEIVER: chip enable' },
    { from: 'rxrf.CSN', to: 'rx.D10',   color: 'orange', note: 'RECEIVER: SPI chip select' },
    { from: 'rxrf.SCK', to: 'rx.D13',   color: 'yellow', note: 'RECEIVER: SPI clock' },
    { from: 'rxrf.MOSI', to: 'rx.D11',  color: 'blue',   note: 'RECEIVER: SPI data out' },
    { from: 'rxrf.MISO', to: 'rx.D12',  color: 'purple', note: 'RECEIVER: SPI data in' },
    { from: 'oled.VCC', to: 'rxbb.T+12', color: 'red',   note: 'RECEIVER: display power' },
    { from: 'oled.GND', to: 'rxbb.T-12', color: 'black', note: 'RECEIVER: display ground' },
    { from: 'oled.SDA', to: 'rx.A4',    color: 'blue',   note: 'RECEIVER: I2C data' },
    { from: 'oled.SCL', to: 'rx.A5',    color: 'yellow', note: 'RECEIVER: I2C clock' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">The capacitor. If you read nothing else, read this.</span>
<p>Solder a <strong>10&nbsp;uF electrolytic directly across the module's VCC and GND pins</strong>, on the
module itself. Positive leg to VCC, the striped negative leg to GND.</p>
<p>Without it the radio browns out during transmit bursts, and the failure is intermittent and
distance-dependent - which is exactly the kind of fault that sends people looking for software bugs. This is
the single most common nRF24 complaint and it has one cause.</p>
<p>Do both modules. The receiver draws bursts too.</p></div>

<div class="note danger"><span class="t">VCC is 3.3 V only. The signal pins are 5 V tolerant.</span>
<p>Five volts on VCC destroys the module, usually not instantly, which makes it confusing. Use the Nano's
<strong>3V3</strong> pin.</p>
<p>The SPI pins are a happy exception: they <em>are</em> 5&nbsp;V tolerant, so an Uno or Nano can drive CE,
CSN, SCK and MOSI directly with no level shifting. You will find guides insisting on a level shifter here -
it does no harm and it is not needed.</p></div>

<div class="note warn"><span class="t">Two boards, two breadboards, no wires between them</span>
<p>The model above shows both nodes on one bench because they are the same project, but nothing connects
them. That is the point. Build the sender on the left, the receiver on the right, and keep them at least a
metre apart while testing - two radios touching each other can actually overload the receiver and behave
worse than they do across a room.</p></div>

<div class="note tip"><span class="t">Watch the pin order on the module</span>
<p>The nRF24 has an 8-pin 2x4 block, and it is easy to get 180 degrees out. With the antenna trace pointing
away from you and the pins facing down, the bottom-left pin is <strong>GND</strong>. VCC is next to it. Get
those two backwards and the module is gone.</p>
<p>Check twice. This is the only irreversible mistake in the project.</p></div>`,

solderSteps: [
  { h: 'Solder the capacitor onto each module - the whole soldering job',
    body: `<p>Take the 10&nbsp;uF electrolytic. Its long leg is positive, and the striped side is negative.</p>
    <p>On the underside of the nRF24 module, find the VCC and GND pins. Bend the capacitor's legs so it lies
    flat along the module rather than sticking up, trim them short, and solder the positive leg to VCC and the
    negative to GND.</p>
    <p>Two seconds per joint. The pins are close together, so inspect for a bridge afterwards with a
    magnifier - a bridge here is a dead short across your supply.</p>` },
  { h: 'Check it before you plug anything in',
    body: `<p>Multimeter on continuity, across the capacitor's legs. It should beep briefly and then stop as
    the capacitor charges, then read open. A continuous beep means a solder bridge or a capacitor fitted
    backwards and already damaged.</p>
    <p>Then check VCC to GND on the module: no beep.</p>` },
  { h: 'If you would rather not solder at all',
    body: `<p>Push the capacitor's legs into the breadboard in the same rows as the module's VCC and GND
    pins, as close as the layout allows. It is measurably worse than soldering it to the module - a few
    centimetres of breadboard has real inductance - but it works for indoor range and it gets you started.</p>
    <p>If your link is flaky and the capacitor is on the breadboard, move it to the module before you change
    anything else.</p>` }
],

assembly: [
  { h: 'Build one node and prove the radio before adding sensors',
    body: `<p>Wire the sender's Nano and radio only. No sensor, no display.</p>
    <p>Upload the diagnostic sketch below. It prints the radio's own register contents, which tells you
    immediately whether the Arduino can talk to the chip at all. Everything else depends on this.</p>` },
  { h: 'Build the second node and run the ping test',
    body: `<p>Same wiring on the receiver. Upload the ping sketches - one sends, one replies - and watch the
    round-trip times on the serial monitor.</p>
    <p>You should see a reply in roughly 1-3&nbsp;ms and no failures at all on a desk. If you are seeing
    failures at one metre, stop and fix that now; it will not improve with distance.</p>` },
  { h: 'Walk the link out and find its real range',
    body: `<p>Leave the sender running on a battery and carry the receiver, watching the failure count.</p>
    <p>Expect roughly 20-30&nbsp;m indoors through a couple of walls for the bare module, and rather more
    outdoors. If you got a PA+LNA version with a screw-on antenna, expect more range and more supply
    trouble.</p>
    <p>Note where it stops working. That number is your actual budget for where the sensor can live, and it
    is better to learn it now than after you have mounted something in a shed.</p>` },
  { h: 'Add the sensor to the sending node',
    body: `<p>BME280 on I2C, at address 0x76 or 0x77 - the libraries usually try both. Confirm it reads
    sensible numbers over serial before the radio is involved.</p>
    <p>Room temperature should be roughly right. If it reads 20 degrees too high, the sensor is self-heating
    because it is mounted against something warm, which will matter later.</p>` },
  { h: 'Add the display to the receiving node',
    body: `<p>OLED on the same I2C pins. The receiver now has a radio on SPI and a display on I2C, which
    coexist without any trouble.</p>` },
  { h: 'Run the real sketches and leave it a day',
    body: `<p>Sender transmits every thirty seconds; receiver displays and counts.</p>
    <p>The interesting number on the display is <strong>time since last packet</strong>. A link that is 99%
    reliable looks perfect for an hour and drops a packet every few minutes, and you only see that by
    watching the gap rather than the readings.</p>` },
  { h: 'Put the sender where it needs to be',
    body: `<p>Greenhouse, shed, loft, fridge, garden. Somewhere a cable would have been annoying, which is
    the whole point.</p>
    <p>If it goes outdoors, ventilate the box properly - humidity inside a sealed box is not the humidity
    outside it, and the pressure reading will be fine but the other two will be fiction.</p>` }
],

libraries: [
  { name: 'RF24', by: 'TMRh20', why: 'The maintained nRF24L01+ library. Make sure you get TMRh20\'s - there are several older forks with the same name and worse behaviour.' },
  { name: 'SPI', by: 'Arduino', how: 'Built in', why: 'The bus. No installation.' },
  { name: 'Adafruit BME280', by: 'Adafruit', why: 'The sensor. Pulls in Adafruit Unified Sensor with it.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The display, plus Adafruit GFX.' },
  { name: 'LowPower', by: 'Rocket Scream', why: 'Only for the battery version in the tuning section. Turns months of battery life into a real option.' }
],

code: [
{
  h: 'Step 1: is the radio even there?',
  intro: `<p>Before any transmitting. This dumps the chip's configuration registers, and reading them back
  correctly proves the SPI wiring is right.</p>`,
  name: 'nrf24_check.ino',
  code: `/* ------------------------------------------------------------------
   nRF24L01+ presence check.

   printPrettyDetails() reads the chip's registers back over SPI. If
   the wiring is wrong you get all zeros or all ones - which is the
   fastest possible answer to "why is nothing working".
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <RF24.h>

#define CE_PIN   9
#define CSN_PIN 10

RF24 radio(CE_PIN, CSN_PIN);

void setup() {
  Serial.begin(115200);
  while (!Serial);

  Serial.println(F("nRF24 check"));

  if (!radio.begin()) {
    Serial.println(F("radio.begin() FAILED"));
    Serial.println(F("  - check CE and CSN pins"));
    Serial.println(F("  - check SPI: 11 MOSI, 12 MISO, 13 SCK"));
    Serial.println(F("  - check VCC is 3.3 V, NOT 5 V"));
    while (1);
  }

  Serial.println(F("radio.begin() ok - now check the register dump\\n"));
  radio.printPrettyDetails();

  Serial.println(F("\\nWhat you want to see:"));
  Serial.println(F("  Channel        : 76 (or whatever you set)"));
  Serial.println(F("  Data Rate      : 1 MBPS"));
  Serial.println(F("  Model          : nRF24L01+"));
  Serial.println(F("  CRC Length     : 16 bits"));
  Serial.println(F("  Power Amplifier: PA_LOW / PA_HIGH / PA_MAX"));
  Serial.println();
  Serial.println(F("If Model says 'nRF24L01' with no plus, you have an"));
  Serial.println(F("older clone. It still works; set setDataRate(RF24_1MBPS)"));
  Serial.println(F("because 250 kbps does not exist on the non-plus part."));
}

void loop() {}`,
  after: `<p>Three outcomes, and each points somewhere specific:</p>
  <ul>
    <li><strong>Everything reads 0x00 or 0xFF.</strong> The Arduino is not talking to the chip. Wiring -
    almost always CE and CSN swapped, or MISO and MOSI swapped.</li>
    <li><strong><code>Model: nRF24L01</code></strong> with no plus. A clone of the older chip. It works, but
    it has no 250&nbsp;kbps mode, so call <code>setDataRate(RF24_1MBPS)</code> explicitly.</li>
    <li><strong>Sensible values.</strong> The hard part is done. Both modules should read the same.</li>
  </ul>
  <p>Run this on <em>both</em> nodes before going further. Two working radios is a much better starting
  position than one working radio and one unknown.</p>`
},
{
  h: 'Step 2: the sender',
  intro: `<p>Reads the sensor and transmits a packed struct. Note how little code the reliability takes -
  the chip does the acknowledging and retrying.</p>`,
  name: 'sensor_sender.ino',
  code: `/* ------------------------------------------------------------------
   Sensor node - transmits temperature, humidity and pressure.

   Sends every SEND_EVERY_MS, gets a hardware acknowledgement back,
   and reports whether each packet landed.
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <RF24.h>
#include <Wire.h>
#include <Adafruit_BME280.h>

#define CE_PIN    9
#define CSN_PIN  10
#define SEND_EVERY_MS  30000UL

RF24 radio(CE_PIN, CSN_PIN);
Adafruit_BME280 bme;

// Addresses are a filter, not a network. Avoid the all-one-byte
// default that every untouched example in the world is also using.
const byte ADDR_TO_BASE[6] = "1Node";

/* A packed struct, not a string. 12 bytes instead of ~40, which at
   250 kbps is four times less airtime and four times less battery.
   Both sketches must declare this IDENTICALLY - if the compilers
   disagree about padding you get garbage that looks like a radio
   fault. */
struct Packet {
  uint8_t  nodeId;
  uint16_t seq;
  int16_t  tempC100;      // degrees x 100, so 21.37 C is 2137
  uint16_t humidity100;   // percent x 100
  uint16_t pressure10;    // hPa x 10
  uint16_t vbat;          // millivolts
} __attribute__((packed));

Packet pkt;
unsigned long lastSend = 0;
unsigned long sent = 0, failed = 0;

void setup() {
  Serial.begin(115200);

  if (!radio.begin()) { Serial.println(F("radio failed")); while (1); }

  // PA_LOW while testing on a desk. Two radios at maximum power 30 cm
  // apart can overload each other's receivers - counter-intuitive,
  // and a real cause of "works at distance, fails on the bench".
  radio.setPALevel(RF24_PA_LOW);

  // 250 kbps is slower and reaches noticeably further. For 12 bytes
  // every 30 seconds, speed is worth nothing and range is worth a lot.
  radio.setDataRate(RF24_250KBPS);

  // Channel 76 is the library default and sits in the middle of the
  // Wi-Fi band. Above channel 100 you are above 2.5 GHz and clear of
  // nearly all of it. See the tuning section.
  radio.setChannel(108);

  radio.setRetries(5, 15);          // 1.5 ms apart, 15 attempts
  radio.enableDynamicPayloads();
  radio.openWritingPipe(ADDR_TO_BASE);
  radio.stopListening();            // this node only transmits

  if (!bme.begin(0x76) && !bme.begin(0x77)) {
    Serial.println(F("BME280 not found"));
    while (1);
  }

  pkt.nodeId = 1;
  pkt.seq = 0;
  Serial.println(F("sender ready"));
}

void loop() {
  if (millis() - lastSend < SEND_EVERY_MS && lastSend != 0) return;
  lastSend = millis();

  pkt.seq++;
  pkt.tempC100    = (int16_t)(bme.readTemperature() * 100.0);
  pkt.humidity100 = (uint16_t)(bme.readHumidity() * 100.0);
  pkt.pressure10  = (uint16_t)(bme.readPressure() / 10.0);
  pkt.vbat        = readVcc();

  bool ok = radio.write(&pkt, sizeof(pkt));
  sent++;
  if (!ok) failed++;

  Serial.print(F("#")); Serial.print(pkt.seq);
  Serial.print(F("  ")); Serial.print(pkt.tempC100 / 100.0, 2); Serial.print(F(" C  "));
  Serial.print(pkt.humidity100 / 100.0, 1); Serial.print(F(" %  "));
  Serial.print(pkt.pressure10 / 10.0, 1); Serial.print(F(" hPa  "));
  Serial.print(pkt.vbat); Serial.print(F(" mV  "));
  Serial.print(ok ? F("ACK") : F("*** NO ACK ***"));
  Serial.print(F("   fail ")); Serial.print(failed);
  Serial.print('/');           Serial.println(sent);
}

/* Measures the chip's own supply by comparing it against the internal
   1.1 V reference - no divider, no extra pin, and it is the number
   you actually want for a battery node. */
long readVcc() {
  ADMUX = _BV(REFS0) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  delay(2);
  ADCSRA |= _BV(ADSC);
  while (bit_is_set(ADCSRA, ADSC));
  long result = ADCL | (ADCH << 8);
  return 1125300L / result;        // 1.1 * 1023 * 1000
}`,
  after: `<p>The <code>ACK</code> on each line is the hardware acknowledgement, and it is the most useful
  output in the project. A sender that reports every packet acknowledged and a receiver that shows nothing
  means you have two different addresses or channels - the radio is working perfectly, it is just talking to
  nobody.</p>
  <p><strong>Scaled integers rather than floats</strong> is deliberate. Temperature as
  <code>int16_t</code> hundredths covers -327 to +327&nbsp;&deg;C in two bytes where a float takes four,
  and there is no float formatting on either end.</p>`
},
{
  h: 'Step 3: the receiver',
  intro: `<p>Listens, displays, and - importantly - tracks how long it has been since anything arrived.</p>`,
  name: 'sensor_receiver.ino',
  code: `/* ------------------------------------------------------------------
   Base node - receives, displays, and watches the link quality.
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <RF24.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define CE_PIN    9
#define CSN_PIN  10
#define STALE_MS  90000UL         // 3 missed sends = something is wrong

RF24 radio(CE_PIN, CSN_PIN);
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

const byte ADDR_TO_BASE[6] = "1Node";

// MUST be byte-for-byte identical to the sender's declaration.
struct Packet {
  uint8_t  nodeId;
  uint16_t seq;
  int16_t  tempC100;
  uint16_t humidity100;
  uint16_t pressure10;
  uint16_t vbat;
} __attribute__((packed));

Packet pkt;
unsigned long lastRx = 0;
unsigned long received = 0;
uint16_t lastSeq = 0, missed = 0;

void setup() {
  Serial.begin(115200);

  if (!radio.begin()) { Serial.println(F("radio failed")); while (1); }
  radio.setPALevel(RF24_PA_LOW);
  radio.setDataRate(RF24_250KBPS);
  radio.setChannel(108);            // must match the sender exactly
  radio.enableDynamicPayloads();
  radio.openReadingPipe(1, ADDR_TO_BASE);
  radio.startListening();

  if (!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("no OLED at 0x3C"));
  }
  oled.setTextColor(SSD1306_WHITE);

  Serial.println(F("listening"));
  draw();
}

void loop() {
  if (radio.available()) {
    radio.read(&pkt, sizeof(pkt));
    lastRx = millis();
    received++;

    /* Sequence numbers make losses visible. Without this you cannot
       tell a link that drops 5% of packets from one that drops none,
       because both look identical on a display that just shows the
       latest reading. */
    if (lastSeq && pkt.seq > lastSeq + 1) missed += pkt.seq - lastSeq - 1;
    lastSeq = pkt.seq;

    Serial.print(F("#")); Serial.print(pkt.seq);
    Serial.print(F("  ")); Serial.print(pkt.tempC100 / 100.0, 2);
    Serial.print(F(" C  ")); Serial.print(pkt.humidity100 / 100.0, 1);
    Serial.print(F(" %  ")); Serial.print(pkt.pressure10 / 10.0, 1);
    Serial.print(F(" hPa  bat ")); Serial.print(pkt.vbat);
    Serial.print(F(" mV   missed ")); Serial.println(missed);

    draw();
  }

  // Redraw once a second anyway, so the "seconds ago" counter moves
  // and a dead link is visible rather than looking like fresh data.
  static unsigned long lastDraw = 0;
  if (millis() - lastDraw > 1000) { lastDraw = millis(); draw(); }
}

void draw() {
  oled.clearDisplay();

  if (!lastRx) {
    oled.setTextSize(1);
    oled.setCursor(0, 28);
    oled.println(F("waiting for node 1..."));
    oled.display();
    return;
  }

  unsigned long age = (millis() - lastRx) / 1000;
  bool stale = (millis() - lastRx) > STALE_MS;

  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(pkt.tempC100 / 100.0, 1);
  oled.print((char)247);                 // degree symbol
  oled.println('C');

  oled.setTextSize(1);
  oled.setCursor(0, 20);
  oled.print(pkt.humidity100 / 100.0, 1); oled.print(F("% RH   "));
  oled.print(pkt.pressure10 / 10.0, 1);   oled.println(F(" hPa"));

  oled.setCursor(0, 34);
  oled.print(F("bat ")); oled.print(pkt.vbat / 1000.0, 2); oled.println(F(" V"));

  oled.setCursor(0, 46);
  oled.print(F("rx ")); oled.print(received);
  oled.print(F("  lost ")); oled.println(missed);

  oled.setCursor(0, 56);
  if (stale) {
    // Inverted, because a stale reading that looks normal is worse
    // than no reading at all.
    oled.fillRect(0, 54, 128, 10, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
    oled.print(F(" NO SIGNAL - "));
    oled.print(age);
    oled.print(F("s"));
    oled.setTextColor(SSD1306_WHITE);
  } else {
    oled.print(age); oled.println(F("s ago"));
  }

  oled.display();
}`,
  after: `<p>The stale-data handling is the part worth copying into other projects. A wireless sensor display
  that keeps showing the last value it received looks completely normal when the battery died three days ago,
  and that is a genuinely misleading failure. Inverting the bar makes it impossible to miss.</p>`
}],

upload: `
<p>Two Nanos, two sketches, two serial ports. Open both serial monitors at <strong>115200</strong> - the IDE
will run two windows if you open a second IDE instance.</p>
<div class="note tip"><span class="t">Old Nano clones want the old bootloader</span>
<p>If uploading fails with <code>avrdude: stk500_recv(): programmer is not responding</code>, switch Tools
&rarr; Processor to <strong>ATmega328P (Old Bootloader)</strong>. Most cheap clones need it, and it is not a
fault.</p></div>
<div class="note warn"><span class="t">Keep the two nodes a metre apart while testing</span>
<p>Two radios at high power right next to each other genuinely work worse than at three metres - the
receiver's front end saturates. If your bench test fails and a walk down the hall fixes it, that is what
happened. Use <code>RF24_PA_LOW</code> while developing.</p></div>`,

tune: [
  { h: 'Get off the Wi-Fi channels',
    body: `<p>The nRF24's 125 channels run 2400 to 2525&nbsp;MHz. Wi-Fi occupies roughly 2400 to
    2484&nbsp;MHz, so channels 0-84 sit inside the busiest slice of spectrum in most homes.</p>
    <p><strong>Channels 100-125 are above Wi-Fi entirely.</strong> Moving there is free and is usually the
    single biggest reliability improvement available - which is why this project uses 108 rather than the
    library default of 76.</p>` },
  { h: 'Trade speed for range',
    body: `<p><code>RF24_250KBPS</code> has about 10&nbsp;dB better receiver sensitivity than
    <code>RF24_2MBPS</code>, which is roughly triple the range. Narrower bandwidth means less noise gets in.</p>
    <p>For a sensor sending 12 bytes twice a minute, the slower rate costs nothing you will ever notice.
    Reach for the faster rates only when you are actually streaming.</p>` },
  { h: 'Turn the power up last, not first',
    body: `<p><code>RF24_PA_MAX</code> is the obvious lever and the wrong first one. On a bare module it adds
    a few dB; on a PA+LNA module it multiplies the current burst, which makes the supply problem much worse.</p>
    <p>Fix the capacitor, move off Wi-Fi, and drop to 250&nbsp;kbps first. Then raise the power if you still
    need it - and if a PA+LNA module misbehaves at maximum power, give it its own 3.3&nbsp;V regulator rather
    than the Arduino's.</p>` },
  { h: 'Months on two AA cells',
    body: `<p>The sender currently sits awake doing nothing for thirty seconds at a time, which is most of its
    energy budget.</p>
    <p>With the LowPower library, <code>LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF)</code> four times gives
    you a 32-second cycle at roughly 30&nbsp;uA between sends. Call <code>radio.powerDown()</code> before
    sleeping and <code>radio.powerUp()</code> after - the radio idles at 900&nbsp;uA otherwise, which would
    dominate everything.</p>
    <p>That turns a week of battery life into the better part of a year. Remove the power LED from the Nano
    for another 2-3&nbsp;mA, which at these levels is the largest remaining load.</p>` },
  { h: 'Add more nodes',
    body: `<p>The chip has six receive pipes. Give each sender a different address, open them as pipes 1 to 5
    on the base, and use <code>radio.available(&amp;pipeNum)</code> to find out which one spoke.</p>
    <p>The <code>nodeId</code> field is already in the packet for exactly this, so the base can tell nodes
    apart even on a shared pipe.</p>` },
  { h: 'Acknowledge with data',
    body: `<p><code>enableAckPayload()</code> lets the receiver attach up to 32 bytes to its acknowledgement.
    The sender gets a reply for free, in the same transaction, with no extra airtime.</p>
    <p>Useful for sending the node a new reporting interval, or telling it the base is fine and it can go back
    to sleep for longer. It is the cheapest two-way communication the chip offers.</p>` }
],

trouble: [
  { q: 'Works for a few packets, then stops until reset',
    a: `The capacitor, nine times out of ten. Solder 10&nbsp;uF directly across the module's VCC and GND pins
    - on the module, not the breadboard. If it is already there, check the joint and check you have not fitted
    it backwards.` },
  { q: '<code>radio.begin()</code> fails or the register dump is all zeros/ones',
    a: `SPI wiring. CE and CSN swapped is the most common; MISO and MOSI swapped is next. Confirm CE is on the
    pin your sketch says and that the module is the right way round - with the pins down and the antenna trace
    away from you, bottom-left is GND.` },
  { q: 'Sender says ACK on everything, receiver shows nothing',
    a: `That combination is impossible on a real link - an acknowledgement comes from the receiver. It means
    something else with the same address is replying, or (much more likely) your sender is not actually
    checking: confirm you are reading <code>radio.write()</code>'s return value. Then check channel and
    address match exactly on both sides, including the trailing byte of the address array.` },
  { q: 'Receiver gets packets but the numbers are nonsense',
    a: `The <code>Packet</code> struct differs between the two sketches, or you left off
    <code>__attribute__((packed))</code> on one of them and the compiler inserted padding. Copy the struct
    from one file to the other rather than retyping it.` },
  { q: 'Works at 5 metres, fails on the desk',
    a: `Receiver saturation - the two radios are too close at too much power. Use
    <code>RF24_PA_LOW</code> for bench testing. This is real and it catches everyone once.` },
  { q: 'Range is far worse than expected',
    a: `In order: you are on a Wi-Fi channel (move above 100), you are at 1 or 2&nbsp;Mbps (drop to 250 kbps),
    the module is inside a metal box, or the PCB antenna is lying against something conductive. The antenna
    trace needs a few centimetres of clear air around it.` },
  { q: 'One module works and the identical one does not',
    a: `Clone quality varies enormously, and a proportion arrive dead or with a counterfeit chip. Run the
    check sketch on both - if one reports <code>nRF24L01</code> without the plus while the other reports the
    plus, they are different chips and 250 kbps will only work on one.` },
  { q: 'Everything works on USB and fails on the battery',
    a: `Two AA cells give 3&nbsp;V, which is below what a Nano's regulator needs on VIN. Either use three
    cells into VIN, or feed 3.3&nbsp;V straight to the Nano's 3V3 pin and accept running the ATmega
    out of spec at 16&nbsp;MHz - see the power basics before doing that on something you care about.` },
  { q: 'Humidity reads 99% in the box and 60% outside it',
    a: `Not a radio fault. A sealed enclosure with a warm board in it becomes its own microclimate. Drill
    vents on two opposite faces, and keep the sensor away from the Arduino's regulator.` }
],

next: `
<ul>
  <li><strong>Go much further.</strong> The <a href="project.html?p=lora-remote-sensor">LoRa remote sensor</a>
  does the same job across a valley instead of across a house, and the trade it makes - kilometres in exchange
  for bytes per minute - is the most important idea in this theme.</li>
  <li><strong>Control something from a phone instead.</strong>
  <a href="project.html?p=hc05-bluetooth-control">Bluetooth serial</a> costs the same and solves the opposite
  problem.</li>
  <li><strong>Log it properly.</strong> Point the receiver at an
  <a href="project.html?p=fridge-freezer-logger">SD card</a> or swap it for an ESP32 and push to a
  dashboard.</li>
  <li><strong>Build a real sensor network.</strong> Six pipes and a node id gets you as far as five senders
  and one base without any routing. Beyond that you want a mesh, and RF24Network is the usual next step.</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">Low voltage throughout, with three things worth knowing</span>
<ul>
  <li><strong>VCC is 3.3 V and 5 V kills the module.</strong> The only irreversible mistake here. Check the
  orientation of the 8-pin block before the first power-up.</li>
  <li><strong>The capacitor is polarised.</strong> An electrolytic fitted backwards heats up and vents, which
  is unpleasant and smells worse. Striped side to ground.</li>
  <li><strong>2.4 GHz is a licence-free band worldwide</strong> and these modules are low-power devices, so
  there is nothing to register and no licence needed. That is genuinely not true of every band - see the
  duty cycle notes in the <a href="project.html?p=lora-remote-sensor">LoRa project</a>, where it matters a
  great deal.</li>
  <li><strong>There is no security of any kind here.</strong> No encryption, no authentication. Anyone within
  range on the same channel and address reads everything and can send whatever they like. That is fine for
  greenhouse temperature and not fine for anything that opens a door.</li>
</ul>
</div>`
});
