/* A shadow board that knows what is missing. Several readers on one bus. */
AB.addProject({
slug: 'rfid-tool-board',
title: 'Tool board that knows what is missing',
cat: 'rfid',
level: 3,
time: '7 hours',
solder: true,
board: 'ESP32',
tags: ['rfid', 'rc522', 'spi', 'shadow board', 'workshop', 'presence', 'multiple readers', 'antenna'],
blurb: 'A shadow board with a reader behind every outline. It shows at a glance what is out and who has it, which is the difference between a workshop and a search party.',

skills: ['Several SPI devices on one bus', 'RFID read range and what limits it', 'Antenna detuning', 'Presence vs event detection', 'State machines', 'Power budgeting'],

intro: `
<p>A shadow board is a sheet with the outline of every tool painted on it, so a gap is visible from across the
room. It is one of the genuinely good ideas in workshop organisation, and its only weakness is that it tells
you something is missing without telling you where it went.</p>
<p>Put an RC522 reader behind each outline and a tag on each tool, and the board knows. Take a tool, the LED by
its outline turns amber. Tap your own card first and it knows who has it.</p>
<p>The engineering interest is in running eight readers from one board, and in the fact that RFID read range is
almost entirely about the antenna's environment rather than the reader.</p>`,

what: [
  'Track up to eight tools, continuously, without anyone pressing anything.',
  'Show at the board which are out, using an LED at each position.',
  'Record who took what, if they tapped their card.',
  'Cope with the fact that a tool laid down slightly off-centre must still read.',
  'Run several SPI readers from one microcontroller without them interfering.'
],

how: `
<p><strong>Several SPI devices, one bus, separate chip selects.</strong> SPI is designed for this: clock, data
out and data in are shared, and each device gets its own chip-select line. Pull one low and only that device
listens.</p>
<p>The RC522 also has a reset pin. You can tie all of them together to one GPIO, which saves seven pins and
means a reset resets everything - which is what you want anyway.</p>
<p>So eight readers costs three shared SPI pins, eight chip selects and one reset: twelve pins, which an ESP32
has.</p>

<p><strong>Presence, not events.</strong> A door lock asks "was a card just presented". A tool board asks "is
the card still there", every second, forever. That is a different question and it changes the code: you poll
each reader in turn and build a picture of what is currently present, rather than reacting to arrivals.</p>
<p>The subtlety is that a read can fail even when a tag is sitting still - collisions, interference, a tag at a
bad angle. A single failed read must not report a tool as taken. Require three consecutive failures before
changing state, and the false alarms disappear.</p>

<p><strong>Read range is an antenna problem, not a reader problem.</strong> An RC522 at 13.56&nbsp;MHz manages
2-5&nbsp;cm with a standard card and rather less with a small tag. Three things cut it further:</p>
<ul>
  <li><strong>Metal.</strong> The tool itself. A steel spanner against a tag detunes the antenna and can kill
  the read entirely. This is why tags for metal tools have a ferrite backing layer - buy on-metal tags, or the
  project simply will not work.</li>
  <li><strong>Distance and alignment.</strong> The field is strongest directly over the coil. A tag 3&nbsp;cm
  away and off to one side may not read at all.</li>
  <li><strong>Other readers.</strong> Two RC522 antennas within about 10&nbsp;cm interfere. Space them out, or
  power only one at a time.</li>
</ul>
<p>Practically: readers behind a thin plywood front, on-metal tags, one reader per tool position, and 15&nbsp;cm
between reader centres.</p>

<p><strong>Polling costs power and time.</strong> Eight readers polled once a second each is fine. Polling all
eight continuously as fast as possible generates heat, interference between adjacent antennas, and no benefit -
a tool does not move quickly.</p>

<p><strong>Who took it is a second, optional layer.</strong> A person's card tapped at a dedicated reader
before removing a tool attributes the next removal to them. It is worth keeping optional, because a system that
refuses to work unless you badge in gets bypassed within a week.</p>`,

bom: [
  { id: 'rc522', qty: 4, note: 'One per tool position. Start with four and confirm the spacing works before ordering eight.' },
  { id: 'rfid-tags', qty: 1, note: 'ON-METAL tags specifically. Ordinary cards will not read through a steel tool - this is the part people get wrong.' },
  { id: 'esp32', qty: 1, note: 'Enough pins for the chip selects, and Wi-Fi for the log.' },
  { id: 'ws2812-strip', qty: 1, note: 'One LED per position, cut to length. Addressable means one data pin for all of them.' },
  { id: 'res220', qty: 1, note: 'On the LED data line.' },
  { id: 'cap1000', qty: 1, note: 'Across the LED strip power.' },
  { id: 'oled13', qty: 1, note: 'Shows what is out and who has it.' },
  { id: 'psu5v3a', qty: 1, note: 'Four readers plus LEDs is more than USB will comfortably give.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',      at: [0, 76] },
    { id: 'bb',   comp: 'bb830',      at: [0, 10] },
    { id: 'r1',   comp: 'rc522',      at: [-66, -52] },
    { id: 'r2',   comp: 'rc522',      at: [-8, -52] },
    { id: 'r3',   comp: 'rc522',      at: [50, -52] },
    { id: 'leds', comp: 'ws2812strip',at: [0, -96] },
    { id: 'oled', comp: 'oled13',     at: [66, -14] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V for the readers - an RC522 is NOT 5 V tolerant' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'mcu.VIN',  to: 'bb.T+30', color: 'red',    note: '5 V rail, for the LED strip only' },
    { from: 'r1.3V3',   to: 'bb.T+5',  color: 'red',    note: 'Reader 1 power' },
    { from: 'r1.GND',   to: 'bb.T-5',  color: 'black',  note: 'Reader 1 ground' },
    { from: 'r1.SCK',   to: 'mcu.D18', color: 'blue',   note: 'SPI clock - shared by every reader' },
    { from: 'r1.MOSI',  to: 'mcu.D23', color: 'white',  note: 'SPI data out - shared' },
    { from: 'r1.MISO',  to: 'mcu.D19', color: 'green',  note: 'SPI data in - shared' },
    { from: 'r1.RST',   to: 'mcu.D22', color: 'grey',   note: 'Reset - shared by every reader' },
    { from: 'r1.SDA',   to: 'mcu.D5',  color: 'yellow', note: 'Reader 1 chip select - its own pin' },
    { from: 'r2.3V3',   to: 'bb.T+11', color: 'red',    note: 'Reader 2 power' },
    { from: 'r2.GND',   to: 'bb.T-11', color: 'black',  note: 'Reader 2 ground' },
    { from: 'r2.SCK',   to: 'mcu.D18', color: 'blue',   note: 'Same clock' },
    { from: 'r2.MOSI',  to: 'mcu.D23', color: 'white',  note: 'Same data out' },
    { from: 'r2.MISO',  to: 'mcu.D19', color: 'green',  note: 'Same data in' },
    { from: 'r2.RST',   to: 'mcu.D22', color: 'grey',   note: 'Same reset' },
    { from: 'r2.SDA',   to: 'mcu.D17', color: 'orange', note: 'Reader 2 chip select' },
    { from: 'r3.3V3',   to: 'bb.T+17', color: 'red',    note: 'Reader 3 power' },
    { from: 'r3.GND',   to: 'bb.T-17', color: 'black',  note: 'Reader 3 ground' },
    { from: 'r3.SCK',   to: 'mcu.D18', color: 'blue',   note: 'Same clock' },
    { from: 'r3.MOSI',  to: 'mcu.D23', color: 'white',  note: 'Same data out' },
    { from: 'r3.MISO',  to: 'mcu.D19', color: 'green',  note: 'Same data in' },
    { from: 'r3.RST',   to: 'mcu.D22', color: 'grey',   note: 'Same reset' },
    { from: 'r3.SDA',   to: 'mcu.D16', color: 'purple', note: 'Reader 3 chip select' },
    { from: 'leds.5V',  to: 'bb.T+26', color: 'red',    note: 'LED strip on 5 V, with the 1000 uF across it' },
    { from: 'leds.GND', to: 'bb.T-26', color: 'black',  note: 'LED ground - common with everything else' },
    { from: 'leds.DIN', to: 'bb.e22',  color: 'green',  note: 'Data through the 220 ohm resistor' },
    { from: 'bb.a22',   to: 'mcu.D25', color: 'green',  note: 'Resistor to the ESP32' },
    { from: 'oled.VCC', to: 'bb.T+21', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-21', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'oled.SCL', to: 'mcu.D26', color: 'blue',   note: 'I2C clock' }
  ]
},

wireIntro: `<p>Three readers shown; the rest are identical. Every reader shares clock, data and reset, and has
its own chip select - that single difference is what makes a shared bus work.</p>`,

wireNotes: `
<div class="note danger"><span class="t">The RC522 is a 3.3 V part</span>
<p>Its power pin is marked 3.3&nbsp;V and it means it. Feeding it 5&nbsp;V destroys it, sometimes immediately
and sometimes after a week of working fine. The ESP32 is 3.3&nbsp;V throughout, so take power from
<code>3V3</code> and never from <code>VIN</code>.</p></div>

<div class="note warn"><span class="t">Keep reader antennas 15 cm apart</span>
<p>Two RC522 coils close together couple into each other and both lose range, or read intermittently. Fifteen
centimetres between centres is a safe minimum; closer than 10 and you will chase phantom faults.</p>
<p>If your tools need to be closer than that, power one reader at a time using the reset lines instead of
polling them all.</p></div>

<div class="note tip"><span class="t">On-metal tags, or this does not work</span>
<p>A standard RFID tag stuck to a steel tool will not read. The metal detunes the antenna and absorbs the
field. Tags sold as "on-metal" or "anti-metal" have a ferrite layer that isolates them, and they cost a little
more.</p>
<p>This is the single most common reason a tool-tracking project fails, and it is worth testing with one tag
and one tool before buying forty.</p></div>`,

solderIntro: `<p>Repetitive rather than difficult. The layout of the board matters more than the soldering
does.</p>`,

solderSteps: [
  { h: 'Prove two readers on one bus first',
    body: `<p>Before building anything, wire two readers on a breadboard with separate chip selects and confirm
    both read independently. This is the part of the design that can fail, and finding out on a breadboard is
    much better than finding out after mounting eight behind plywood.</p>` },
  { h: 'Shared bus as a proper loom',
    body: `<p>Clock, MOSI, MISO and reset run to every reader. Make them a neat four-wire bus with short stubs
    to each board rather than eight separate runs.</p>
    <p>Keep the total bus length under about 30&nbsp;cm - SPI at a few megahertz over long unshielded wire gets
    unreliable, and the symptom is a reader that works intermittently.</p>` },
  { h: 'Chip selects as a labelled ribbon',
    body: `<p>Eight individual wires, labelled at both ends. This is the loom you will be checking when reader
    six does not respond.</p>` },
  { h: 'Mount readers behind the front panel',
    body: `<p>3-6&nbsp;mm plywood or acrylic. The antenna reads through it fine; do not use anything with metal
    in it, and that includes some MDF with metal-bearing paint.</p>
    <p>Centre each reader exactly under where the tool's tag will sit, and mark the outline so tools get put
    back in the same place.</p>` },
  { h: 'LED strip behind the outlines',
    body: `<p>One LED per position, cut from the strip and rejoined with short wires, or a continuous strip
    with the unused LEDs simply left dark. The second is far less soldering.</p>` },
  { h: 'Test each position with the actual tool',
    body: `<p>Not with a test card - with the real tool and its real tag, laid down the way someone in a hurry
    will lay it down. Adjust reader position until that works every time.</p>` }
],

libraries: [
  { name: 'MFRC522', by: 'GithubCommunity', why: 'The standard RC522 driver. Supports multiple instances with separate chip selects, which is the feature this project needs.' },
  { name: 'Adafruit NeoPixel', by: 'Adafruit', why: 'The position LEDs.' },
  { name: 'U8g2', by: 'oliver', why: 'The display.' }
],

code: [{
  name: 'tool_board.ino',
  code: `/* ------------------------------------------------------------------
   Shadow board with RFID tool tracking - ESP32

   Several RC522 readers on one SPI bus, each with its own chip select.
   Polls for presence rather than reacting to events.
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <MFRC522.h>
#include <Adafruit_NeoPixel.h>
#include <U8g2lib.h>

#define RST_PIN   22          // shared by every reader
#define LED_PIN   25
#define N_TOOLS    4

const int CS_PIN[N_TOOLS] = {5, 17, 16, 4};
const char* TOOL_NAME[N_TOOLS] = {"10mm spanner", "Torque wrench", "Calipers", "Multimeter"};

MFRC522 reader[N_TOOLS] = {
  MFRC522(CS_PIN[0], RST_PIN), MFRC522(CS_PIN[1], RST_PIN),
  MFRC522(CS_PIN[2], RST_PIN), MFRC522(CS_PIN[3], RST_PIN)
};

Adafruit_NeoPixel leds(N_TOOLS, LED_PIN, NEO_GRB + NEO_KHZ800);
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0, 26, 21);

bool present[N_TOOLS];
int  misses[N_TOOLS];
unsigned long tookAt[N_TOOLS];

/* Three consecutive failures before believing a tool has gone. A single
   read can fail with the tag sitting perfectly still - a collision, a bad
   angle, interference - and one miss must not raise an alarm. */
const int MISS_THRESHOLD = 3;

void setup() {
  Serial.begin(115200);
  SPI.begin();

  for (int i = 0; i < N_TOOLS; i++) {
    reader[i].PCD_Init();
    present[i] = true;
    misses[i] = 0;

    // Maximum antenna gain. Costs nothing and buys a centimetre or two,
    // which matters when somebody puts a tool back carelessly.
    reader[i].PCD_SetAntennaGain(MFRC522::RxGain_max);
  }

  leds.begin();
  oled.begin();
}

void loop() {
  for (int i = 0; i < N_TOOLS; i++) {
    bool seen = tagPresent(i);

    if (seen) {
      misses[i] = 0;
      if (!present[i]) {
        present[i] = true;
        Serial.printf("%s returned\\n", TOOL_NAME[i]);
      }
    } else if (present[i]) {
      if (++misses[i] >= MISS_THRESHOLD) {
        present[i] = false;
        tookAt[i] = millis();
        Serial.printf("%s taken\\n", TOOL_NAME[i]);
      }
    }
    // A tool does not move quickly. Polling hard gains nothing and makes
    // adjacent antennas interfere.
    delay(120);
  }

  updateLeds();
  draw();
}

/* PICC_IsNewCardPresent only fires on arrival, which is the wrong
   question here - we want to know whether the tag is STILL there. Waking
   the card explicitly asks exactly that. */
bool tagPresent(int i) {
  byte bufferATQA[2];
  byte bufferSize = sizeof(bufferATQA);

  reader[i].PCD_WriteRegister(MFRC522::TxModeReg, 0x00);
  reader[i].PCD_WriteRegister(MFRC522::RxModeReg, 0x00);
  reader[i].PCD_WriteRegister(MFRC522::ModWidthReg, 0x26);

  MFRC522::StatusCode s = reader[i].PICC_WakeupA(bufferATQA, &bufferSize);
  bool ok = (s == MFRC522::STATUS_OK || s == MFRC522::STATUS_COLLISION);
  reader[i].PICC_HaltA();
  return ok;
}

void updateLeds() {
  for (int i = 0; i < N_TOOLS; i++) {
    leds.setPixelColor(i, present[i] ? leds.Color(0, 24, 0)      // dim green
                                     : leds.Color(70, 30, 0));   // amber
  }
  leds.show();
}

void draw() {
  static unsigned long last = 0;
  if (millis() - last < 500) return;
  last = millis();

  oled.clearBuffer();
  oled.setFont(u8g2_font_6x10_tf);

  int out = 0;
  for (int i = 0; i < N_TOOLS; i++) if (!present[i]) out++;

  char line[26];
  snprintf(line, sizeof(line), "%d of %d out", out, N_TOOLS);
  oled.drawStr(0, 10, line);

  int y = 24;
  for (int i = 0; i < N_TOOLS && y < 64; i++) {
    if (present[i]) continue;
    unsigned long mins = (millis() - tookAt[i]) / 60000;
    snprintf(line, sizeof(line), "%.14s %lum", TOOL_NAME[i], mins);
    oled.drawStr(0, y, line);
    y += 12;
  }

  if (out == 0) oled.drawStr(0, 32, "all present");
  oled.sendBuffer();
}`
}],

trouble: [
  { q: 'A tag will not read when stuck to a steel tool',
    a: `Ordinary tags do not work on metal - the metal detunes the antenna. You need on-metal tags with a
    ferrite backing. This is the single commonest reason this project fails.` },
  { q: 'Only the first reader works',
    a: `Chip selects tied together, or all readers initialised with the same CS pin. Each needs its own, and
    each <code>MFRC522</code> instance must be constructed with it.` },
  { q: 'Readers work individually but not together',
    a: `Antennas too close - they couple and detune each other. Fifteen centimetres between centres, or power
    one at a time via the reset lines.` },
  { q: 'Intermittent reads that get worse as you add readers',
    a: `Supply sag or SPI bus length. Each RC522 draws up to 100&nbsp;mA while transmitting; eight of them is
    most of what a dev board's regulator can give. Use the external supply.` },
  { q: 'Tools show as taken and returned repeatedly',
    a: `The miss threshold is too low, or the tag is right at the edge of range. Move the reader closer to
    where the tag sits, and raise <code>MISS_THRESHOLD</code>.` },
  { q: 'Range is only a centimetre',
    a: `Check the antenna gain is set to maximum, check nothing metal is behind the reader, and check the front
    panel is not thicker than about 6&nbsp;mm.` },
  { q: 'A reader stops responding after a while',
    a: `RC522 modules are known for this. A periodic <code>PCD_Init()</code> - say every few minutes - resets
    them and costs nothing.` },
  { q: 'Everything reads as present even with tools removed',
    a: `Wake-up is returning STATUS_COLLISION constantly, which the sketch treats as present. That usually
    means two tags are within range of one reader.` }
],

next: `
<ul>
  <li><strong>Log to a web page</strong> so the board is checkable from a phone, and a week of history shows
  which tools actually get used.</li>
  <li><strong>Add a person reader</strong> at the side. Tap in, take a tool, and the log attributes it. Keep it
  optional - a system that blocks work gets bypassed.</li>
  <li><strong>An end-of-day check</strong>: if anything is out at 6 pm, flash its LED and send a message. That
  is when a missing tool is still findable.</li>
  <li><strong>Scale up with a multiplexer.</strong> Beyond about eight readers, a 74HC138 generating the chip
  selects from three pins gets you to sixteen without running out.</li>
  <li><strong>The same idea elsewhere</strong> - a key cabinet, a camera kit, a first-aid box. Anything where
  what matters is noticing something is missing before you need it.</li>
</ul>`
});
