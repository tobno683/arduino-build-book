/* Tags that carry their own meaning, so the reader needs no database. */
AB.addProject({
slug: 'nfc-tag-automation',
title: 'NFC tags that run your house',
cat: 'rfid',
level: 2,
time: '4 hours',
solder: false,
board: 'ESP32',
tags: ['nfc', 'ndef', 'pn532', 'mqtt', 'home assistant', 'ntag215', 'automation', 'esp32'],
blurb: 'A tag by the door that sets the house to "out", one by the bed for "goodnight", one on a jar that adds it to the shopping list. The tags carry the instruction themselves, so adding one needs no code change.',

skills: ['NDEF records', 'Writing tags rather than reading IDs', 'MQTT automation', 'Data on the tag vs in a lookup table', 'Tag types and capacity', 'Designing for people'],

intro: `
<p>The <a href="project.html?p=rfid-door-lock">RFID lock</a> reads a card's serial number and looks it up in a
list. That is the standard approach, and it means every new card needs a code change and a reflash.</p>
<p>NFC can do better. NTAG215 tags hold about 500 bytes of structured data in a standard format called NDEF,
and phones can write them. So the tag can carry <em>the instruction itself</em> - "publish
<code>house/mode</code> = <code>away</code>" - and the reader just does what it is told.</p>
<p>Now adding a new automation is writing a tag with your phone. No recompiling, no lookup table, and anyone in
the house can make one.</p>`,

what: [
  'Read NDEF messages from NFC tags rather than just their serial numbers.',
  'Publish whatever the tag says over MQTT, so any automation system can act on it.',
  'Let a phone write new tags, so adding one needs no code at all.',
  'Confirm with a sound and a light, because a silent tap is indistinguishable from a failed one.',
  'Refuse to act twice when a tag is left sitting on the reader.'
],

how: `
<p><strong>NDEF is the format that makes tags portable.</strong> It is a small structured container - a
sequence of records, each with a type and a payload. A text record holds a string; a URI record holds a URL; a
MIME record holds anything with a type attached.</p>
<p>Because it is a standard, a tag written by an Android phone is readable by an iPhone, by this project, and
by anything else that speaks NFC. That interoperability is the entire reason to use NDEF rather than writing
raw bytes to a sector.</p>

<p><strong>Data on the tag, not in the reader.</strong> The usual design keeps a table mapping serial numbers
to actions. It works and it centralises everything - which sounds good until you want a new tag while away from
your computer.</p>
<p>Putting the action on the tag inverts that. The reader parses a text record like
<code>house/mode=away</code> and publishes it. Adding a tag is thirty seconds with a phone app.</p>
<p>The trade is real and worth stating: anyone who can write a tag can make the reader publish anything. On a
home network that is fine. For anything that unlocks a door, use the serial-number-and-allowlist approach
instead - see the <a href="project.html?p=rfid-door-lock">lock</a>, which does exactly that for exactly this
reason.</p>

<p><strong>PN532, not RC522.</strong> The RC522 used elsewhere in this book reads MIFARE Classic and is fine
for serial numbers. The PN532 handles NTAG and NDEF properly, and it can also read a phone directly. For a few
dollars more it is the right chip for this job.</p>

<p><strong>Tag types matter.</strong> NTAG213 holds 144 bytes, NTAG215 holds 504, NTAG216 holds 888. For short
commands 213 is plenty; buy 215 anyway because the price difference is negligible and running out of space
later is annoying.</p>
<p>Avoid MIFARE Classic for this. It can hold NDEF but it needs sector keys and it is not the same experience
from a phone.</p>

<p><strong>Debounce the presence, not the read.</strong> A tag left on the reader will be read continuously.
The rule is to act on a tag only when it was not there a moment ago, and to require it to be properly removed
before acting again.</p>
<p>A short cooldown after each action is not enough on its own - somebody leaving a tag on the reader would
trigger every few seconds. Track presence and act on the transition.</p>

<p><strong>Feedback is not decoration.</strong> A tap with no response is indistinguishable from a tap that
missed. A short beep on a successful read and a different one on a failure means nobody stands there tapping
repeatedly. This is the difference between a thing people use and a thing people give up on.</p>`,

bom: [
  { id: 'pn532', qty: 1, note: 'Not the RC522 - the PN532 handles NTAG and NDEF properly, and can read phones as well as tags.' },
  { id: 'rfid-tags', qty: 1, note: 'NTAG215 stickers or discs. Buy the round sticker kind: they go on the back of a light switch, inside a cupboard door, under a shelf.' },
  { id: 'esp32', qty: 1, note: 'Wi-Fi for MQTT.' },
  { id: 'ws2812-ring', qty: 1, note: 'A ring behind the reader as a confirmation glow. Green for success, red for a tag it could not parse.' },
  { id: 'buzzer', qty: 1, note: 'The beep. Small part, disproportionate effect on whether the thing gets used.' },
  { id: 'res220', qty: 1 },
  { id: 'bb-400', qty: 1 },
  { id: 'psu5v3a', qty: 1 },
  { id: 'box-abs', qty: 1, note: 'Non-metallic, and thin where the tag touches. Metal near the antenna kills the read range.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',      at: [0, 62] },
    { id: 'bb',   comp: 'bb400',      at: [0, -2] },
    { id: 'nfc',  comp: 'pn532',      at: [-52, -56] },
    { id: 'ring', comp: 'ws2812ring', at: [26, -58] },
    { id: 'buz',  comp: 'buzzer',     at: [66, -24] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'nfc.VCC',  to: 'bb.T+5',  color: 'red',    note: 'Reader power' },
    { from: 'nfc.GND',  to: 'bb.T-5',  color: 'black',  note: 'Reader ground' },
    { from: 'nfc.SDA',  to: 'mcu.D21', color: 'green',  note: 'I2C data - set the DIP switches on the module to I2C mode' },
    { from: 'nfc.SCL',  to: 'mcu.D22', color: 'blue',   note: 'I2C clock' },
    { from: 'nfc.IRQ',  to: 'mcu.D32', color: 'yellow', note: 'Interrupt - optional, but it saves constant polling' },
    { from: 'nfc.RST',  to: 'mcu.D33', color: 'white',  note: 'Reset, so the sketch can recover a wedged reader' },
    { from: 'ring.5V',  to: 'bb.T+12', color: 'red',    note: 'Ring power' },
    { from: 'ring.GND', to: 'bb.T-12', color: 'black',  note: 'Ring ground' },
    { from: 'ring.DI',  to: 'bb.e18',  color: 'green',  note: 'Data through the 220 ohm resistor' },
    { from: 'bb.a18',   to: 'mcu.D25', color: 'green',  note: 'Resistor to the ESP32' },
    { from: 'buz.+',    to: 'mcu.D26', color: 'purple', note: 'Buzzer' },
    { from: 'buz.-',    to: 'bb.T-22', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireIntro: `<p>Eight wires, no soldering. The one thing to check before wiring is the DIP switches on the PN532
module - it supports three interfaces and ships set to whichever the factory felt like.</p>`,

wireNotes: `
<div class="note warn"><span class="t">Set the PN532 to I2C mode first</span>
<p>The common red breakout has two small DIP switches selecting UART, SPI or I2C. For I2C, switch 1 is ON and
switch 2 is OFF.</p>
<p>In the wrong mode the module powers up, looks fine, and simply does not appear on the bus. This catches
everybody, and it is the first thing to check if <code>begin()</code> fails.</p></div>

<div class="note tip"><span class="t">Nothing metal near the antenna</span>
<p>The PN532 antenna is the coil printed on the board. A metal enclosure, a metal back plate, or a screw
through the wrong place will detune it and cut the range to nothing.</p>
<p>Plastic or wood, and keep the tag side thin - 3&nbsp;mm or less is ideal.</p></div>

<div class="note"><span class="t">Range is short, and that is fine</span>
<p>Expect 2-4&nbsp;cm. NFC is deliberately short range - it is a security property, not a limitation. Design
the enclosure so it is obvious where to tap, and people will tap there.</p></div>`,

assembly: [
  { h: 'Confirm the reader appears on the bus',
    body: `<p>Run an I2C scanner. The PN532 should show at 0x24. If nothing appears, it is the DIP switches
    before anything else.</p>` },
  { h: 'Read a tag\u2019s serial number first',
    body: `<p>The simplest possible sketch. Once a tag reads reliably, you know the hardware is right and
    everything after that is software.</p>` },
  { h: 'Write a tag with your phone',
    body: `<p>NFC Tools on Android or iOS. Write a text record containing <code>house/mode=away</code>. Then
    read it back with the phone to confirm it took.</p>
    <p>Do this before writing any parsing code, so you know the tag is good.</p>` },
  { h: 'Then parse NDEF on the ESP32',
    body: `<p>Print the raw bytes first. NDEF has a small header before the text - a status byte and a language
    code - and seeing <code>\\x02en</code> in front of your string explains immediately why a naive parse
    produces odd results.</p>` },
  { h: 'Mount it where people will actually tap',
    body: `<p>By the door at hand height, not behind it. On the bedside table where a phone already goes. The
    physical placement decides whether this gets used, and it is worth moving it a few times.</p>` },
  { h: 'Label the tags, or at least colour them',
    body: `<p>An unmarked white sticker is indistinguishable from any other unmarked white sticker. This becomes
    a problem faster than you expect.</p>` }
],

libraries: [
  { name: 'Adafruit PN532', by: 'Adafruit', why: 'The reader, including NTAG page reads.' },
  { name: 'PubSubClient', by: 'Nick O\u2019Leary', why: 'MQTT, which is how this reaches Home Assistant, Node-RED or anything else.' },
  { name: 'Adafruit NeoPixel', by: 'Adafruit', why: 'The confirmation ring.' }
],

code: [{
  name: 'nfc_automation.ino',
  code: `/* ------------------------------------------------------------------
   NFC tag automation - ESP32 + PN532

   Tags carry their own instruction as an NDEF text record, like
   "house/mode=away". The reader publishes it and does nothing else.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_PN532.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_NeoPixel.h>

#define PN532_IRQ  32
#define PN532_RST  33
#define LED_PIN    25
#define BUZZER     26

Adafruit_PN532 nfc(PN532_IRQ, PN532_RST, &Wire);
Adafruit_NeoPixel ring(12, LED_PIN, NEO_GRB + NEO_KHZ800);
WiFiClient net;
PubSubClient mqtt(net);

uint8_t lastUid[7];
uint8_t lastUidLen = 0;
unsigned long lastSeen = 0;
bool tagPresent = false;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  ring.begin();
  ring.setBrightness(40);
  glow(0, 0, 20);

  nfc.begin();
  if (!nfc.getFirmwareVersion()) {
    Serial.println("No PN532 - check the DIP switches are set to I2C");
    glow(40, 0, 0);
    while (1) delay(1000);
  }
  nfc.SAMConfig();

  WiFi.begin("your-network", "your-password");
  while (WiFi.status() != WL_CONNECTED) delay(300);
  mqtt.setServer("192.168.1.10", 1883);

  glow(0, 0, 12);
}

void loop() {
  if (!mqtt.connected()) mqtt.connect("nfc-reader");
  mqtt.loop();

  uint8_t uid[7], uidLen;

  // 80 ms timeout: long enough to catch a tag, short enough to stay
  // responsive.
  bool found = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLen, 80);

  if (!found) {
    // Require a clean gap before accepting anything again, so a tag left
    // sitting on the reader does not fire every second.
    if (tagPresent && millis() - lastSeen > 700) {
      tagPresent = false;
      lastUidLen = 0;
    }
    return;
  }

  lastSeen = millis();

  // Same tag still sitting there - do nothing.
  if (tagPresent && uidLen == lastUidLen && memcmp(uid, lastUid, uidLen) == 0) return;

  tagPresent = true;
  memcpy(lastUid, uid, uidLen);
  lastUidLen = uidLen;

  char payload[128];
  if (readNdefText(payload, sizeof(payload))) {
    handleCommand(payload);
  } else {
    Serial.println("Tag read, but no NDEF text record");
    glow(40, 12, 0);
    tone(BUZZER, 300, 200);
    delay(400);
    glow(0, 0, 12);
  }
}

/* NTAG user memory starts at page 4. The NDEF message sits inside a TLV
   wrapper: 0x03, a length, then the message. Inside a text record there
   is a status byte and a language code ("en") before the actual text -
   which is why a naive parse gives you "\\x02enhouse/mode=away". */
bool readNdefText(char* out, size_t maxLen) {
  uint8_t data[64];

  for (uint8_t page = 4; page < 20; page += 4) {
    if (!nfc.ntag2xx_ReadPage(page, data + (page - 4) * 4)) return false;
  }

  int i = 0;
  while (i < 60 && data[i] != 0x03) i++;      // find the NDEF TLV
  if (i >= 60) return false;

  int msgLen = data[i + 1];
  int p = i + 2;

  uint8_t header = data[p];
  uint8_t typeLen = data[p + 1];
  uint8_t payloadLen = data[p + 2];
  (void)header;
  (void)msgLen;

  int typeAt = p + 3;
  if (data[typeAt] != 'T') return false;      // not a text record

  int payloadAt = typeAt + typeLen;
  uint8_t status = data[payloadAt];
  int langLen = status & 0x3F;                // low bits are the language length

  int textAt = payloadAt + 1 + langLen;
  int textLen = payloadLen - 1 - langLen;
  if (textLen <= 0 || textLen >= (int)maxLen) return false;

  memcpy(out, data + textAt, textLen);
  out[textLen] = 0;
  return true;
}

/* "house/mode=away" -> publish "away" to topic "house/mode".
   The tag carries the instruction, so adding a new automation is writing
   a tag with a phone rather than changing this sketch. */
void handleCommand(const char* text) {
  Serial.printf("tag says: %s\\n", text);

  char buf[128];
  strlcpy(buf, text, sizeof(buf));
  char* eq = strchr(buf, '=');

  if (!eq) {
    glow(40, 12, 0);
    tone(BUZZER, 300, 200);
    delay(400);
    glow(0, 0, 12);
    return;
  }

  *eq = 0;
  const char* topic = buf;
  const char* value = eq + 1;

  mqtt.publish(topic, value);
  Serial.printf("published %s = %s\\n", topic, value);

  // Confirm. A silent tap is indistinguishable from one that missed, and
  // that is what makes people give up on a reader.
  glow(0, 40, 0);
  tone(BUZZER, 1800, 60);
  delay(80);
  tone(BUZZER, 2400, 60);
  delay(500);
  glow(0, 0, 12);
}

void glow(uint8_t r, uint8_t g, uint8_t b) {
  for (int i = 0; i < 12; i++) ring.setPixelColor(i, r, g, b);
  ring.show();
}`
}],

trouble: [
  { q: 'No PN532 found',
    a: `DIP switches. For I2C, switch 1 ON and switch 2 OFF. This is the first thing to check and it is right
    most of the time.` },
  { q: 'Tags read but the text comes out as gibberish with a couple of odd characters at the front',
    a: `You are reading the raw payload including the status byte and language code. The low six bits of the
    status byte give the language length - skip that many bytes plus one.` },
  { q: 'Range is under a centimetre',
    a: `Something metal near the antenna, or the enclosure is too thick. The antenna is the printed coil on the
    board and it is easily detuned.` },
  { q: 'The same tag fires repeatedly',
    a: `Presence is not being tracked. Act on the transition from absent to present, and require a clean gap
    before accepting again.` },
  { q: 'A tag written by a phone does not read',
    a: `It may be a MIFARE Classic rather than an NTAG. The page-read approach in this sketch is NTAG specific.
    Check what you bought - NTAG213, 215 and 216 all work.` },
  { q: 'It works with one phone and not another',
    a: `Some phones write an Android Application Record alongside the text record. The parse here finds the
    first text record, so an extra record before it will confuse it - skip records until you find type
    'T'.` },
  { q: 'MQTT publishes but nothing happens',
    a: `The topic in the tag does not match what your automation listens on. Subscribe to <code>#</code> with a
    MQTT client and watch what actually arrives.` },
  { q: 'The reader stops responding after a few days',
    a: `The PN532 occasionally wedges. That is why RST is wired - call <code>nfc.begin()</code> again if no
    successful read has happened in a long time.` }
],

safety: `
<div class="note warn"><span class="t">Anyone who can write a tag can publish anything</span>
<p>That is inherent to putting the instruction on the tag rather than in the reader, and it is the trade this
design makes deliberately. On a home network, publishing <code>house/mode=away</code> is not a security
boundary and this is fine.</p>
<p>Do not extend it to anything that unlocks a door, disarms an alarm or moves money. For those, use the
serial-number-and-allowlist approach in the <a href="project.html?p=rfid-door-lock">RFID lock</a>, where the
tag proves identity and the reader decides what that identity is allowed to do.</p>
<p>NFC tags are trivially cloneable. A tag is a convenient thing to tap, not a credential.</p></div>`,

next: `
<ul>
  <li><strong>A tag in the car dashboard</strong> that puts the house into "arriving" ten minutes early. Tapping
  a phone against it works too, since phones read NFC.</li>
  <li><strong>Shopping list tags</strong> on the inside of cupboard doors - tap the one on the coffee jar when
  it runs out.</li>
  <li><strong>A second reader</strong> elsewhere, publishing to the same broker with a different client ID.
  They need no knowledge of each other.</li>
  <li><strong>Write tags from the ESP32</strong> rather than a phone, with a small web page listing your
  automations. Then a tag can be made without an app at all.</li>
  <li><strong>Combine with the <a href="project.html?p=nfc-jukebox">jukebox</a></strong> - the same reader, and
  a tag that both plays an album and dims the lights.</li>
</ul>`
});
