/* Two LoRa handhelds: messaging with no network, and the power cost of listening. */
AB.addProject({
slug: 'lora-offgrid-messenger',
title: 'Off-grid messenger',
cat: 'radio',
level: 3,
time: '8 hours for the pair',
solder: true,
board: 'ESP32 x2',
tags: ['lora', 'sx1276', 'messaging', 'off grid', 'handheld', 'acknowledgement', 'oled', 'lipo', 'duty cycle'],
blurb: 'Two pocket units that text each other across a valley with no phone signal, no network and no account. Preset messages, delivery confirmation, and an honest reckoning with how slow it has to be.',

skills: ['Two-way LoRa protocols', 'Acknowledgements and retries', 'Receive-mode power budgets', 'Menu interfaces', 'Duty cycle management', 'Handheld construction'],

intro: `
<p>A pair of these will pass short messages between two people a few kilometres apart with no infrastructure
of any kind. No cell tower, no Wi-Fi, no subscription, nothing to fail but the two objects in your hands.
That is genuinely useful on a hill, in a wood, on a boat, or anywhere the phone network stops.</p>
<p>It is also, unavoidably, slow and terse. The
<a href="project.html?p=lora-remote-sensor">LoRa sensor project</a> explains why: at long-range settings a
twenty-byte message takes one and a half seconds of airtime, and European duty cycle rules then require two
and a half minutes of silence. So this is not a chat application. It is closer to a pager, or to sending
telegrams - and building it teaches you more about why radio protocols look the way they do than any amount
of reading.</p>
<p>The design decision that follows from all of this is <strong>preset messages</strong>. Typing free text on
a four-button handheld is miserable, and free text is long, and long is expensive. A curated list of twenty
useful phrases sends in a fraction of the airtime and takes one button press. Real off-grid messaging devices
work this way for the same reasons.</p>`,

what: [
  'Send and receive short messages between two handheld units, kilometres apart.',
  'Choose from a scrollable list of preset messages, with one button to send.',
  'Get a delivery confirmation - or a clear failure - for every message, with automatic retries.',
  'See the signal strength of every packet, so you know whether you are about to walk out of range.',
  'Run a link test that pings continuously while you walk, so you can map your coverage.',
  'Understand exactly why a device that listens has a completely different battery life from one that sleeps.'
],

how: `
<p><strong>Listening is the expensive part, and that changes everything.</strong> The sensor node in the
previous project sleeps at microamps and wakes for two seconds every ten minutes. A messenger cannot do that,
because a message that arrives while it is asleep is simply lost.</p>
<p>An SX1276 in receive mode draws around <strong>12&nbsp;mA continuously</strong>. Add the ESP32 awake and an
OLED lit and you are at 60-90&nbsp;mA. A 2000&nbsp;mAh cell gives you roughly a day, not a year.</p>
<p>That single fact drives the whole design: the screen sleeps aggressively, the ESP32 idles rather than
spinning, and there is a duty-cycled receive mode for when you are prepared to trade responsiveness for
runtime. Knowing <em>why</em> a walkie-talkie has a battery life measured in hours is worth the build on its
own.</p>

<p><strong>Acknowledgements, which matter here in a way they do not for a sensor.</strong> A missing
temperature reading is a gap in a chart. A message that did not arrive is a person standing on a hill
believing they have been heard.</p>
<p>So the protocol is: send the message with a sequence number; the receiver immediately sends back a tiny
acknowledgement quoting that number; if none arrives within a timeout, retry. Three attempts, then report
failure clearly.</p>
<p>The acknowledgement is deliberately six bytes rather than a text reply. At SF9 that is about 100&nbsp;ms
of airtime against 210 for the message, so acknowledging costs the receiving unit half as much duty cycle as
sending costs the sender. On a two-way link both ends are transmitters and both ends have a budget.</p>

<p><strong>Addressing, minimally.</strong> Each unit has a one-byte id set in the sketch. Every packet carries
a sender and a destination, and a unit ignores anything not addressed to it or to the broadcast address.</p>
<p>This is not security - anyone with a radio on your frequency and sync word reads everything, and there is
no encryption anywhere in this project. It is just enough structure that three or four units can share a
frequency without confusion.</p>

<p><strong>The retry timing, which is subtler than it looks.</strong> The sender must wait long enough for the
receiver to hear the message, turn its radio round and transmit an acknowledgement. At SF9 that is roughly
210&nbsp;ms out, a few milliseconds to switch, and 100&nbsp;ms back - so about 400&nbsp;ms minimum, and the
sketch waits 1200 to be comfortable.</p>
<p>Set the timeout too short and you retransmit over the acknowledgement that was already on its way, which
wastes airtime and makes the link worse the busier it gets. This failure mode has a name - congestion
collapse - and it is why the retry gap grows a little each attempt.</p>`,

bom: [
  { id: 'esp32', qty: 2, note: 'One per unit. 3.3 V native, which the SX1276 requires, and its light-sleep modes are what make the battery last a day rather than an afternoon.' },
  { id: 'lora', qty: 2, note: 'Matched pair in your region’s band. 868 MHz Europe, 915 North America and Australia, 433 parts of Asia.' },
  { id: 'ant-868', qty: 2, note: 'A real antenna on a short pigtail, mounted so it stands vertical when the unit is held. This matters more than anything else you will do.' },
  { id: 'oled13', qty: 2, note: 'The whole interface. 0.96 inch is readable in the hand and cheap enough to have two.' },
  { id: 'button', qty: 8, note: 'Four per unit: up, down, send, and back/acknowledge. Tactile switches with real travel - you will be pressing these with cold fingers.' },
  { id: 'buzzer', qty: 2, note: 'One short chirp on a received message. The reason you will notice a reply at all when the unit is in a pocket.' },
  { id: 'lipo2000', qty: 2, note: 'About a day of continuous listening. See the tuning section for how to stretch it.' },
  { id: 'tp4056', qty: 2, note: 'The protected version, with the DW01 chip. Charges over USB.' },
  { id: 'switch', qty: 2, note: 'A real power switch. A handheld that can only be turned off by opening it is a handheld you leave on.' },
  { id: 'res10k', qty: 2, note: 'Battery sense divider, one per unit. Two 10 k in series across the cell, midpoint to an ADC pin.' },
  { id: 'cap10', qty: 2, note: 'Across each radio module’s supply.' },
  { id: 'perfboard', qty: 2 },
  { id: 'headers-f', qty: 2, note: 'Socket the ESP32 and the radio in both units.' },
  { id: 'box-abs', qty: 2, note: 'Hand-sized. Plastic, never metal - a metal case around a LoRa antenna is a Faraday cage.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'bb-400', qty: 2, own: true, note: 'Build both on breadboard first. Debugging a two-way protocol inside two sealed boxes is a bad evening.' }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',  at: [0, 52] },
    { id: 'bb',   comp: 'bb400',  at: [0, -10] },
    { id: 'lora', comp: 'lora',   at: [-52, -60], ry: 180 },
    { id: 'oled', comp: 'oled13', at: [44, -60], ry: 180 },
    { id: 'bUp',  comp: 'button', at: [-30, -96] },
    { id: 'bDn',  comp: 'button', at: [-10, -96] },
    { id: 'bSnd', comp: 'button', at: [10, -96] },
    { id: 'bBk',  comp: 'button', at: [30, -96] },
    { id: 'buz',  comp: 'buzzer', at: [58, -96] }
  ],
  wires: [
    { from: 'mcu.3V3',   to: 'bb.T+2',   color: 'red',    note: '3.3 V rail. Everything in this unit is 3.3 V' },
    { from: 'mcu.GND',   to: 'bb.T-2',   color: 'black',  note: 'Ground rail' },
    { from: 'lora.VCC',  to: 'bb.T+6',   color: 'red',    note: 'Radio power, 3.3 V only - the SX1276 is not 5 V tolerant anywhere' },
    { from: 'lora.GND',  to: 'bb.T-6',   color: 'black',  note: 'Radio ground' },
    { from: 'lora.NSS',  to: 'mcu.D5',   color: 'orange', note: 'SPI chip select' },
    { from: 'lora.SCK',  to: 'mcu.D18',  color: 'yellow', note: 'SPI clock' },
    { from: 'lora.MISO', to: 'mcu.D19',  color: 'purple', note: 'SPI data in' },
    { from: 'lora.MOSI', to: 'mcu.D23',  color: 'blue',   note: 'SPI data out' },
    { from: 'lora.RST',  to: 'mcu.D27',  color: 'white',  note: 'Radio reset' },
    { from: 'lora.DIO0', to: 'mcu.D26',  color: 'green',  note: 'Receive-done interrupt - this is what wakes the unit on an incoming message' },
    { from: 'oled.VCC',  to: 'bb.T+12',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND',  to: 'bb.T-12',  color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA',  to: 'mcu.D21',  color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL',  to: 'mcu.D22',  color: 'yellow', note: 'I2C clock' },
    { from: 'bUp.1A',    to: 'mcu.D32',  color: 'green',  note: 'UP button. Internal pull-up, so the button pulls the pin to ground' },
    { from: 'bUp.2A',    to: 'bb.T-18',  color: 'black',  note: 'UP button to ground' },
    { from: 'bDn.1A',    to: 'mcu.D33',  color: 'green',  note: 'DOWN button' },
    { from: 'bDn.2A',    to: 'bb.T-20',  color: 'black',  note: 'DOWN button to ground' },
    { from: 'bSnd.1A',   to: 'mcu.D25',  color: 'orange', note: 'SEND button' },
    { from: 'bSnd.2A',   to: 'bb.T-22',  color: 'black',  note: 'SEND button to ground' },
    { from: 'bBk.1A',    to: 'mcu.D13',  color: 'orange', note: 'BACK / clear button' },
    { from: 'bBk.2A',    to: 'bb.T-24',  color: 'black',  note: 'BACK button to ground' },
    { from: 'buz.+',     to: 'mcu.D17',  color: 'purple', note: 'Buzzer, one chirp on a received message' },
    { from: 'buz.-',     to: 'bb.T-28',  color: 'black',  note: 'Buzzer ground' },
    { from: 'mcu.D35',   to: 'bb.T+30',  color: 'brown',  note: 'Battery sense: midpoint of two 10 k across the cell. Input-only pin, which is fine for an ADC' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">This model shows ONE unit. Build two identical ones.</span>
<p>Both handhelds are the same hardware and the same sketch - only the <code>MY_ID</code> define differs.
Build the first, get it working, then build the second as a copy.</p>
<p>You cannot test any of this with one unit, which is worth knowing before you start: budget for the pair.</p></div>

<div class="note danger"><span class="t">Antenna before power, every time</span>
<p>Transmitting into no antenna destroys the power amplifier. Solder the antenna or a quarter-wave wire whip
(86&nbsp;mm at 868&nbsp;MHz) before the module is ever powered.</p>
<p>In a handheld this is easy to get wrong during assembly, when the radio is temporarily out of the case.
Make it a rule: the antenna is the last thing you remove and the first thing you fit.</p></div>

<div class="note danger"><span class="t">Plastic case, antenna vertical and clear</span>
<p>A metal enclosure will destroy your range. Plastic only.</p>
<p>Mount the antenna so it stands <strong>vertical when the unit is held normally</strong>. Two vertical
antennas are aligned; one held sideways loses about 20&nbsp;dB, which is most of the difference between the
shortest and longest spreading factors. People hold things at odd angles, so design the grip so the natural
way to hold it is also the right way.</p>
<p>Keep the antenna away from the LiPo pouch and your hand. A hand wrapped around an antenna detunes it
measurably - this is the same effect that made a famous phone drop calls.</p></div>

<div class="note warn"><span class="t">D34, D35, D36, D39 are input-only</span>
<p>The battery sense goes to D35, which is one of the ESP32's input-only pins. That is correct here - it is an
analogue input - but it is worth knowing that these four pins have no output driver at all, so a button or an
LED on them silently does nothing.</p>
<p>Also note that ADC2 pins do not work while Wi-Fi is active. This sketch never enables Wi-Fi, but if you add
it later, keep battery sensing on an ADC1 pin (32-39).</p></div>

<div class="note tip"><span class="t">Buttons use internal pull-ups, so they only need one wire each</span>
<p><code>pinMode(pin, INPUT_PULLUP)</code> and the button shorts to ground. No external resistors.</p>
<p>Tactile switches have four legs in two connected pairs - 1A/1B are one side, 2A/2B the other. Get the pairs
wrong and the button appears permanently pressed. If you are unsure, buzz it out with a meter: the pair that
beeps <em>without</em> the button pressed are the ones already joined.</p></div>`,

solderSteps: [
  { h: 'Antenna first, both modules',
    body: `<p>86&nbsp;mm of solid core for 868&nbsp;MHz, 78 for 915, 164 for 433, soldered to the ANT pad -
    or fit the IPEX pigtail and a proper whip, which is better and worth the $5.</p>
    <p>If you are using a bulkhead SMA connector on the case, mount it now and check the pigtail is long
    enough to reach with the board seated. Discovering it is 10&nbsp;mm short after everything else is
    soldered is a real annoyance.</p>` },
  { h: 'Plan the front panel before anything else',
    body: `<p>Lay the OLED and four buttons on the lid and move them around until it feels right in the hand.
    Mark through the holes. The ergonomics of four buttons matter far more than they sound - you will be
    using this without looking.</p>
    <p>Suggested layout: OLED at the top, then up and down on the left, send and back on the right. Make send
    physically distinct - a different colour cap, or set slightly apart - so it cannot be pressed by
    accident.</p>` },
  { h: 'Drill the case, then keep the swarf away from everything',
    body: `<p>OLED window, four button holes, USB access for charging, power switch, and the antenna exit.
    Drill all of them with the electronics nowhere near.</p>
    <p>For the OLED, a rectangular window is much easier to cut with a series of small drilled holes joined
    with a scalpel than with any single tool. Take your time; this is the part people see.</p>` },
  { h: 'Female headers for the ESP32 and the radio',
    body: `<p>Socket both. You will reflash this repeatedly while tuning the protocol, and you may well damage
    a radio module at some point.</p>
    <p>Tack corner pins with the boards seated as jigs, remove the boards, finish the rest.</p>` },
  { h: 'Buttons, with short leads and strain relief',
    body: `<p>If the buttons mount in the lid and the board is in the base, their wires flex every time you
    open it. Use stranded wire, not solid, leave a service loop, and anchor the bundle to the board with a zip
    tie so flexing happens in the middle of the run rather than at a solder joint.</p>
    <p>One wire per button to its GPIO, and a shared ground wire daisy-chained along all four.</p>` },
  { h: 'The battery divider',
    body: `<p>Two 10&nbsp;k resistors in series directly across the cell, midpoint to D35. That is a
    permanent 200&nbsp;uA drain, which over a week is a few percent of the cell - acceptable, and the reason
    not to use 1&nbsp;k resistors here.</p>
    <p>Put it on the switched side of the power switch if you can, so a unit left in a drawer for a month does
    not flatten itself.</p>` },
  { h: 'Charging and protection, in the right order',
    body: `<p>Cell to the TP4056's <strong>B+/B-</strong>. Everything else off <strong>OUT+/OUT-</strong>,
    through the power switch, to the ESP32's VIN and ground.</p>
    <p>Taking the load from B+/B- instead bypasses the protection chip entirely, and the whole reason for
    buying the protected version was that chip.</p>
    <p>Check the cell's JST polarity with a meter first. Suppliers are genuinely inconsistent about it.</p>` },
  { h: 'Test both units on the bench before closing either',
    body: `<p>Send in both directions, confirm acknowledgements, check the buzzer, check the battery reading
    against a meter. Then close them.</p>
    <p>A protocol bug found with two open boards on a desk takes ten minutes. The same bug found on a hill
    with two sealed boxes takes the afternoon.</p>` }
],

assembly: [
  { h: 'Build both units on breadboard first',
    body: `<p>Two ESP32s, two radios, two OLEDs, buttons loose. Ugly and completely adequate.</p>
    <p>Get messages flowing in both directions here. Everything after this is packaging.</p>` },
  { h: 'Set MY_ID and PEER_ID differently on each',
    body: `<p>Unit A: <code>MY_ID 1</code>, <code>PEER_ID 2</code>. Unit B: the reverse.</p>
    <p>Both units running the same id is the classic first mistake - they ignore each other's messages
    because neither is addressed to them, and the radios look broken while working perfectly.</p>` },
  { h: 'Start at SF7 while developing',
    body: `<p>Round trips take under 200&nbsp;ms at SF7 instead of over three seconds at SF12, so you iterate
    far faster. Move up only when you go outside.</p>` },
  { h: 'Write the message list for the job',
    body: `<p>The default list is a starting point. Write your own, and keep them short - every character is
    airtime.</p>
    <p>Good messages are <em>actionable</em>: "on my way", "running late", "at the top", "need a hand", "all
    fine", "turning back", "found it", "call me when you can". Bad ones are conversational, because the reply
    takes another two and a half minutes.</p>
    <p>Put the two or three you will use most at the top of the list. Scrolling costs time when it is cold and
    raining.</p>` },
  { h: 'Walk the link with the tester',
    body: `<p>Link-test mode pings once every few seconds and shows RSSI and success rate. Leave one unit at
    home and carry the other.</p>
    <p>Map where it works. Pay attention to hills rather than distance - LoRa goes a surprisingly long way in
    line of sight and stops abruptly behind terrain. A ridge between you costs far more than another
    kilometre.</p>` },
  { h: 'Choose the spreading factor from the walk',
    body: `<p>Pick the lowest SF that holds up across the area you actually want to cover, with margin. At
    SF9 you can send a message every twenty seconds or so; at SF12 it is one every two and a half minutes,
    which in a conversation is painful.</p>
    <p>Consider making SF selectable from the menu: SF9 normally, SF12 when you lose contact. That is what
    the "long range" toggle in the tuning section does.</p>` },
  { h: 'Close them up and carry them for a day',
    body: `<p>The things you learn only by carrying it: whether the buzzer is audible in a pocket, whether the
    buttons can be pressed with gloves, whether the screen is readable in sunlight, and how long the battery
    actually lasts.</p>
    <p>Expect around a day. If that is not enough, the tuning section has the duty-cycled receive mode.</p>` }
],

libraries: [
  { name: 'LoRa', by: 'Sandeep Mistry', how: 'Library Manager: "LoRa"', why: 'Point-to-point SX127x. Exposes RSSI and SNR, and supports callback-based receive.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The OLED, plus Adafruit GFX.' },
  { name: 'SPI / Wire', by: 'Arduino', how: 'Built in', why: 'Radio and display buses.' },
  { name: 'ESP32 board package', by: 'Espressif', how: 'Boards Manager: "esp32"', why: 'The board support, and the light sleep functions used in the tuning section.' }
],

code: [
{
  h: 'The messenger',
  intro: `<p>One sketch, both units - change <code>MY_ID</code> and <code>PEER_ID</code> and nothing else. The
  protocol is at the top and is worth reading before the rest.</p>`,
  name: 'lora_messenger.ino',
  code: `/* ------------------------------------------------------------------
   Off-grid LoRa messenger.

   PROTOCOL
     Message : [MAGIC][type=MSG][from][to][seq][index]      6 bytes
     Ack     : [MAGIC][type=ACK][from][to][seq][0]          6 bytes

   Sending a message index rather than the text itself is the whole
   design. Both units hold the same phrase list, so "on my way"
   costs one byte instead of nine - and at SF12 every byte is about
   50 ms of airtime and a slice of your duty cycle.

   SET THESE DIFFERENTLY ON THE TWO UNITS:
       Unit A:  MY_ID 1, PEER_ID 2
       Unit B:  MY_ID 2, PEER_ID 1
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---- identity --------------------------------------------------------
#define MY_ID       1
#define PEER_ID     2
#define BROADCAST 255

// ---- radio -----------------------------------------------------------
#define LORA_SS     5
#define LORA_RST   27
#define LORA_DIO0  26
#define LORA_FREQ   868E6
#define LORA_SF        9        // 7 while developing, 9-12 in the field
#define LORA_BW    125E3
#define LORA_CR        5
#define LORA_POWER    14
#define LORA_SYNC   0xF3       // never 0x34 - that is reserved for LoRaWAN

// ---- pins ------------------------------------------------------------
#define BTN_UP     32
#define BTN_DOWN   33
#define BTN_SEND   25
#define BTN_BACK   13
#define BUZZER     17
#define VBAT_PIN   35

// ---- protocol --------------------------------------------------------
#define MAGIC      0xA7
#define TYPE_MSG   0x01
#define TYPE_ACK   0x02
#define TYPE_PING  0x03

/* Long enough for the message out, the radio to turn round, and the
   ack back. At SF9 that is ~210 + ~100 ms, so 1200 is comfortable.
   Too short and you retransmit over an ack already in flight, which
   makes a busy link worse rather than better. */
#define ACK_TIMEOUT_MS  1200
#define MAX_RETRIES        3

#define SCREEN_SLEEP_MS  20000UL

// ---- the phrase list -------------------------------------------------
// IDENTICAL on both units - the index is what travels.
const char *MESSAGES[] = {
  "On my way",
  "Running late",
  "All fine here",
  "Need a hand",
  "Turning back",
  "At the top",
  "Found it",
  "Stopping for a bit",
  "Call when you can",
  "Heading home",
  "Yes",
  "No",
  "Wait there",
  "Where are you?",
  "Battery low",
  "Emergency - come now"
};
const uint8_t NUM_MESSAGES = sizeof(MESSAGES) / sizeof(MESSAGES[0]);

struct Frame {
  uint8_t magic, type, from, to, seq, index;
} __attribute__((packed));

Adafruit_SSD1306 oled(128, 64, &Wire, -1);

uint8_t cursor = 0;
uint8_t txSeq = 0;
int8_t  lastRxIndex = -1;
uint8_t lastRxFrom = 0;
int     lastRssi = 0;
float   lastSnr = 0;
unsigned long lastRxTime = 0;
unsigned long lastActivity = 0;
bool    screenOn = true;
char    statusLine[24] = "ready";

void setup() {
  Serial.begin(115200);

  pinMode(BTN_UP, INPUT_PULLUP);
  pinMode(BTN_DOWN, INPUT_PULLUP);
  pinMode(BTN_SEND, INPUT_PULLUP);
  pinMode(BTN_BACK, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);

  Wire.begin(21, 22);
  if (!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("no OLED"));
  }
  oled.setTextColor(SSD1306_WHITE);

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQ)) {
    oled.clearDisplay();
    oled.setCursor(0, 28);
    oled.println(F("RADIO FAILED"));
    oled.display();
    while (1) delay(1000);
  }
  applyRadioSettings();
  LoRa.receive();

  lastActivity = millis();
  chirp(2, 60);
  draw();
}

void applyRadioSettings() {
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BW);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setTxPower(LORA_POWER);
  LoRa.setSyncWord(LORA_SYNC);
}

void loop() {
  pollRadio();
  pollButtons();

  // The screen is a large share of the power budget. Blank it after
  // 20 s of no activity; any button or any message wakes it.
  if (screenOn && millis() - lastActivity > SCREEN_SLEEP_MS) {
    screenOn = false;
    oled.clearDisplay();
    oled.display();
  }
}

/* --- receiving -------------------------------------------------------- */
void pollRadio() {
  int size = LoRa.parsePacket();
  if (size != sizeof(Frame)) {
    if (size > 0) LoRa.receive();       // not ours; keep listening
    return;
  }

  Frame f;
  LoRa.readBytes((uint8_t *)&f, sizeof(f));
  lastRssi = LoRa.packetRssi();
  lastSnr  = LoRa.packetSnr();

  if (f.magic != MAGIC) return;
  if (f.to != MY_ID && f.to != BROADCAST) return;   // not for us

  if (f.type == TYPE_MSG) {
    lastRxIndex = f.index < NUM_MESSAGES ? f.index : -1;
    lastRxFrom = f.from;
    lastRxTime = millis();

    // Acknowledge IMMEDIATELY, before drawing anything. The sender
    // is sitting in a timeout, and the OLED takes ~30 ms to update.
    sendFrame(TYPE_ACK, f.from, f.seq, 0);

    wake();
    chirp(3, 80);
    snprintf(statusLine, sizeof(statusLine), "from %d  %d dBm", f.from, lastRssi);
    draw();

    Serial.print(F("rx from ")); Serial.print(f.from);
    Serial.print(F(": "));       Serial.print(MESSAGES[lastRxIndex]);
    Serial.print(F("  RSSI "));  Serial.print(lastRssi);
    Serial.print(F("  SNR "));   Serial.println(lastSnr, 1);

  } else if (f.type == TYPE_PING) {
    sendFrame(TYPE_ACK, f.from, f.seq, 0);
  }

  LoRa.receive();
}

/* --- sending ---------------------------------------------------------- */
void sendFrame(uint8_t type, uint8_t to, uint8_t seq, uint8_t index) {
  Frame f = { MAGIC, type, MY_ID, to, seq, index };
  LoRa.beginPacket();
  LoRa.write((uint8_t *)&f, sizeof(f));
  LoRa.endPacket();
  LoRa.receive();
}

bool sendWithAck(uint8_t index) {
  txSeq++;

  for (uint8_t attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    snprintf(statusLine, sizeof(statusLine), "sending %d/%d...", attempt, MAX_RETRIES);
    draw();

    sendFrame(TYPE_MSG, PEER_ID, txSeq, index);

    // Back off a little further each try. A fixed retry interval
    // means two units that collide once collide again identically.
    unsigned long deadline = millis() + ACK_TIMEOUT_MS * attempt;

    while (millis() < deadline) {
      if (LoRa.parsePacket() == sizeof(Frame)) {
        Frame f;
        LoRa.readBytes((uint8_t *)&f, sizeof(f));
        lastRssi = LoRa.packetRssi();
        lastSnr  = LoRa.packetSnr();

        if (f.magic == MAGIC && f.type == TYPE_ACK &&
            f.to == MY_ID && f.seq == txSeq) {
          snprintf(statusLine, sizeof(statusLine), "delivered  %d dBm", lastRssi);
          chirp(1, 40);
          draw();
          return true;
        }
      }
      delay(5);
    }
  }

  // Say so plainly. A messenger that fails quietly is worse than no
  // messenger, because you walk away believing you were heard.
  snprintf(statusLine, sizeof(statusLine), "NOT DELIVERED");
  chirp(4, 150);
  draw();
  return false;
}

/* --- buttons ---------------------------------------------------------- */
void pollButtons() {
  static unsigned long lastPress = 0;
  if (millis() - lastPress < 180) return;      // debounce

  if (!digitalRead(BTN_UP)) {
    lastPress = millis();
    wake();
    cursor = (cursor + NUM_MESSAGES - 1) % NUM_MESSAGES;
    draw();

  } else if (!digitalRead(BTN_DOWN)) {
    lastPress = millis();
    wake();
    cursor = (cursor + 1) % NUM_MESSAGES;
    draw();

  } else if (!digitalRead(BTN_SEND)) {
    lastPress = millis();
    wake();
    sendWithAck(cursor);
    lastPress = millis();                      // re-arm after the send

  } else if (!digitalRead(BTN_BACK)) {
    lastPress = millis();
    wake();
    lastRxIndex = -1;                          // clear the inbox
    strncpy(statusLine, "cleared", sizeof(statusLine));
    draw();
  }
}

void wake() {
  lastActivity = millis();
  screenOn = true;
}

void chirp(uint8_t times, uint16_t ms) {
  for (uint8_t i = 0; i < times; i++) {
    tone(BUZZER, 2400, ms);
    delay(ms + 50);
  }
}

/* --- display ---------------------------------------------------------- */
void draw() {
  if (!screenOn) return;
  oled.clearDisplay();
  oled.setTextSize(1);

  // Top line: unit id and battery
  oled.setCursor(0, 0);
  oled.print(F("U")); oled.print(MY_ID);
  oled.print(F(" -> ")); oled.print(PEER_ID);
  oled.setCursor(84, 0);
  oled.print(batteryV(), 2); oled.println(F("V"));
  oled.drawFastHLine(0, 9, 128, SSD1306_WHITE);

  // Inbox: the most recent message received
  oled.setCursor(0, 13);
  if (lastRxIndex >= 0) {
    oled.print(F("< "));
    oled.println(MESSAGES[lastRxIndex]);
    oled.setCursor(0, 23);
    oled.print(F("  "));
    oled.print((millis() - lastRxTime) / 1000);
    oled.print(F("s ago, "));
    oled.print(lastRssi);
    oled.println(F("dBm"));
  } else {
    oled.println(F("< (nothing new)"));
  }
  oled.drawFastHLine(0, 33, 128, SSD1306_WHITE);

  // Outbox: three entries of the list, current one inverted
  for (int8_t row = -1; row <= 1; row++) {
    uint8_t idx = (cursor + row + NUM_MESSAGES) % NUM_MESSAGES;
    int16_t y = 37 + (row + 1) * 9;

    if (row == 0) {
      oled.fillRect(0, y - 1, 128, 9, SSD1306_WHITE);
      oled.setTextColor(SSD1306_BLACK);
    }
    oled.setCursor(2, y);
    oled.println(MESSAGES[idx]);
    if (row == 0) oled.setTextColor(SSD1306_WHITE);
  }

  // Status
  oled.setCursor(0, 57);
  oled.print(statusLine);

  oled.display();
}

float batteryV() {
  uint32_t sum = 0;
  for (uint8_t i = 0; i < 8; i++) sum += analogRead(VBAT_PIN);
  // x2 for the 10k/10k divider. The ESP32 ADC is only good to a few
  // percent, which is all a battery indicator needs.
  return (sum / 8.0) / 4095.0 * 3.3 * 2.0;
}`,
  after: `<p>Three things in there are the difference between a demo and something you would carry:</p>
  <ul>
    <li><strong>The acknowledgement is sent before the screen updates.</strong> An OLED refresh is about
    30&nbsp;ms and the sender is sitting in a timeout. Do the radio work first, always.</li>
    <li><strong>Retry backoff grows with each attempt.</strong> Two units that collide once with a fixed
    retry interval collide again in exactly the same way. Growing the gap breaks the lockstep.</li>
    <li><strong>Failure is loud.</strong> Four long beeps and "NOT DELIVERED" on screen. The worst possible
    behaviour for a messenger is to fail quietly, because the whole value of the object is knowing whether
    you were heard.</li>
  </ul>
  <p>Sending an <em>index</em> rather than text is what keeps the frame at six bytes. At SF12 that is about
  a second of airtime instead of two and a half seconds for the same phrase as characters - which directly
  doubles how often you are allowed to speak.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note danger"><span class="t">Change MY_ID and PEER_ID between the two uploads</span>
<p>Unit A gets <code>MY_ID 1</code> / <code>PEER_ID 2</code>; unit B gets <code>MY_ID 2</code> /
<code>PEER_ID 1</code>. Flash both units with the same sketch and they will politely ignore each other
forever, because nothing is ever addressed to them.</p>
<p>Label the outside of each case. You will not remember.</p></div>
<div class="note tip"><span class="t">Develop at SF7</span>
<p>Round trips are under 200&nbsp;ms instead of several seconds, so protocol bugs surface immediately.
Raise <code>LORA_SF</code> to 9 or 12 only when you take it outside - and remember both units must
match.</p></div>`,

tune: [
  { h: 'Making the battery last more than a day',
    body: `<p>Continuous receive is about 12&nbsp;mA for the radio plus the ESP32 idling, and the OLED adds
    10-20&nbsp;mA when lit. Roughly a day from 2000&nbsp;mAh.</p>
    <p>The cheapest win is already in the sketch: the screen blanks after twenty seconds. Beyond that, put
    the ESP32 into light sleep between radio interrupts - <code>esp_light_sleep_start()</code> with DIO0
    configured as a wake source keeps the radio listening while the processor sleeps at under a milliamp, and
    incoming messages still arrive instantly. That roughly triples the runtime.</p>` },
  { h: 'Duty-cycled receive, for multi-day trips',
    body: `<p>The radio can be put to sleep for, say, 9 seconds in every 10, and the sender told to repeat
    each message for 12 seconds. Average receive current drops by 90%.</p>
    <p>The cost is that every message now takes twelve seconds of airtime to send, which at SF9 blows most of
    an hour's duty cycle for one message. It is a genuine trade and only worth it when runtime matters more
    than message rate - which on a multi-day walk it might.</p>` },
  { h: 'A long-range toggle',
    body: `<p>Add a fifth message list entry that switches <code>LORA_SF</code> between 9 and 12 at runtime by
    calling <code>LoRa.setSpreadingFactor()</code> again.</p>
    <p>The catch is that both units must change together, and if you have already lost contact you cannot
    tell the other one. The usual solution is a convention rather than a protocol: "if you lose me, switch to
    long range and wait" - agreed in advance, out of band, like people have always done with radios.</p>` },
  { h: 'More than two units',
    body: `<p>The <code>from</code> and <code>to</code> fields already support it. Add a peer selector to the
    menu, and use <code>BROADCAST</code> (255) for messages to everyone - but note that broadcasts cannot be
    acknowledged sensibly, since several units would all reply at once and collide.</p>
    <p>For a group of three or more, have broadcast messages go unacknowledged and say so on screen.</p>` },
  { h: 'Free text, if you insist',
    body: `<p>A 4x4 keypad and multi-tap entry works, and it is genuinely unpleasant to use. A better
    compromise is a small set of editable presets you load over USB before a trip - the phrases that matter
    for <em>that</em> trip.</p>
    <p>If you do add free text, cap it hard at about 30 characters and show the airtime cost on screen as the
    user types. Watching the number climb is the most effective explanation of the constraint there is.</p>` },
  { h: 'Add position without a GPS on every unit',
    body: `<p>A single GPS on one unit, sending coordinates in the spare bytes, gives you a "here is where I
    am" message for very little extra airtime - four bytes of latitude and four of longitude at reduced
    precision is enough for about a metre.</p>
    <p>The <a href="project.html?p=gps-lora-tracker">tracker project</a> covers the encoding and the
    considerably more serious privacy questions that come with it.</p>` },
  { h: 'Encryption, and being honest about it',
    body: `<p>There is none here. Anyone with a $7 radio on your frequency and sync word reads every message,
    and can send messages that appear to come from your peer.</p>
    <p>AES-128 on the six-byte payload is straightforward with the ESP32's hardware support and stops casual
    eavesdropping. It does not stop replay attacks without a counter, and it is not a serious security system.
    Do not build something whose misuse would matter on top of this.</p>` }
],

trouble: [
  { q: 'Both units run, neither ever receives anything',
    a: `Check <code>MY_ID</code> and <code>PEER_ID</code> are swapped between them and not identical. Then
    check all five radio settings match: frequency, SF, bandwidth, coding rate, sync word.` },
  { q: 'Messages arrive but never get acknowledged',
    a: `The receiver is acknowledging and the sender is not hearing it. Most likely the sender is not back in
    receive mode - every transmit must be followed by <code>LoRa.receive()</code>, which is why
    <code>sendFrame()</code> ends with it. Also check <code>ACK_TIMEOUT_MS</code> is long enough for your
    spreading factor: at SF12 the round trip alone is over three seconds.` },
  { q: 'Sometimes delivered, sometimes not, at the same distance',
    a: `You are near the edge of the link. Check RSSI - if it is below about -120&nbsp;dBm you are on the
    margin and anything will tip it. Raise the spreading factor, raise the antenna, or accept the range.` },
  { q: 'The unit reboots when sending',
    a: `Brownout during the transmit burst. The SX1276 pulls about 120&nbsp;mA at 14&nbsp;dBm. Check the
    10&nbsp;uF capacitor is across the radio module, check the battery is not nearly flat, and check the
    wiring from the protection board can carry it.` },
  { q: 'Buttons trigger by themselves or repeat',
    a: `Missing <code>INPUT_PULLUP</code>, or the wrong pair of legs on the tactile switch. Buzz the switch
    out: the two legs that beep with the button <em>not</em> pressed are internally joined, so use one from
    each pair.` },
  { q: 'Range is much worse than the sensor project got',
    a: `Almost always the antenna orientation or your hand. A handheld gets held at all angles, and a hand
    wrapped around an antenna detunes it. Try holding it up and away from your body and watch the RSSI - the
    difference is often 10&nbsp;dB.` },
  { q: 'The screen is unreadable in sunlight',
    a: `Inherent to a small OLED. They are excellent in the dark and poor in direct sun. A shade above the
    window helps; a different display technology is the real answer if this matters.` },
  { q: 'Battery dies in a few hours',
    a: `Measure the current. If it is 80&nbsp;mA or more, the screen is not blanking - check
    <code>SCREEN_SLEEP_MS</code> and that <code>draw()</code> honours <code>screenOn</code>. If it is
    40-60&nbsp;mA, that is the expected always-listening figure and light sleep is the fix.` },
  { q: 'It works on the bench and fails outdoors at the same distance',
    a: `Ground reflections and terrain. Radio indoors bounces off everything and reaches places it should
    not; outdoors it is far more line-of-sight. Two metres of height on either end is usually worth more
    than anything else you can change.` }
],

next: `
<ul>
  <li><strong>Understand the radio properly first</strong> - the
  <a href="project.html?p=lora-remote-sensor">LoRa sensor</a> covers spreading factors, link budgets and duty
  cycle in depth, with only one end to debug.</li>
  <li><strong>Add position</strong> with the <a href="project.html?p=gps-lora-tracker">GPS tracker</a>, which
  sends coordinates over this same link.</li>
  <li><strong>Add a proper keyboard.</strong> A BLE keyboard paired to the ESP32, or an I2C QWERTY module,
  turns this into something you could write with - at the cost of everything the preset list was protecting
  you from.</li>
  <li><strong>Join a mesh.</strong> Meshtastic is an open-source project that does all of this and routes
  messages through intermediate nodes, and it runs on this exact hardware. If you want the finished product
  rather than the understanding, that is where to go - and having built this one, its design decisions will
  all make sense.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Do not rely on this in an emergency</span>
<ul>
  <li><strong>This is a hobby project, not safety equipment.</strong> No certification, no redundancy, no
  coverage guarantee, and a battery that lasts about a day. It has an "Emergency" preset because the message
  is useful, not because the device is dependable.</li>
  <li><strong>Carry a real means of calling for help</strong> in genuinely remote country - a PLB or satellite
  messenger, which talk to search and rescue and are built and tested for it.</li>
  <li><strong>Agree what you will do if contact is lost</strong> before you rely on the link at all, exactly
  as you would with any radio. The plan matters more than the hardware.</li>
</ul>
</div>
<div class="note danger"><span class="t">Radio and battery rules</span>
<ul>
  <li><strong>Never transmit without an antenna.</strong> It destroys the module.</li>
  <li><strong>Respect the duty cycle.</strong> 1% in the EU 868.0-868.6&nbsp;MHz sub-band, and a two-way
  conversation means both ends are transmitting. Nothing in the hardware enforces it.</li>
  <li><strong>Use your own region's band.</strong> 868 in Europe, 915 in North America and Australia.
  Transmitting on the wrong one is unlicensed use of someone else's spectrum.</li>
  <li><strong>Protected charging board</strong> for the LiPo, never a bare TP4056, and take the load from
  OUT+/OUT- rather than B+/B-.</li>
  <li><strong>Never charge a lithium cell below 0 &deg;C.</strong> If this lives in a rucksack in winter, let
  it warm up indoors before plugging it in.</li>
  <li><strong>A LiPo in a pocket needs a case.</strong> Puncture or crush damage on a lithium pouch cell can
  cause a fire. That is the real reason for the enclosure, not the tidiness.</li>
</ul>
</div>
<div class="note warn"><span class="t">No privacy, at all</span>
<p>Every message is sent in clear. Anyone within range with a $7 module, your frequency and your sync word
reads all of it, and can send messages that look like they came from your peer. Assume anything you send is
public.</p></div>`
});
