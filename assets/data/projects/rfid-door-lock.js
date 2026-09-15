/* RC522 RFID reader driving a 12 V solenoid lock through a relay. */
AB.addProject({
slug: 'rfid-door-lock',
title: 'RFID card lock',
cat: 'rfid',
level: 3,
time: '4 hours',
solder: true,
board: 'Uno',
feature: true,
tags: ['rc522', 'rfid', 'solenoid', 'relay', 'eeprom', 'access control', 'mifare'],
blurb: 'Tap a card, the bolt retracts. Cards are enrolled by holding a master card, stored in EEPROM, and survive a power cut.',

skills: ['SPI', 'MIFARE UIDs', 'EEPROM storage', 'Relay switching', 'Separate supplies', 'State machines'],

intro: `
<p>An RFID lock is the first project where the electronics does something with real physical consequence, and
it is a genuinely useful thing to own - on a workshop cabinet, a shed, a drawer of sharp tools or a games
console.</p>
<p>It is also a good place to be honest about security. The 20-cent MIFARE Classic cards in the kit can be
cloned by anyone with a $30 reader and ten seconds near your card. This is a convenience lock: it is exactly as
secure as a key you can photocopy, which for a shed is fine and for a front door is not.</p>`,

what: [
  'Read any 13.56 MHz MIFARE card or fob and compare it against a stored list.',
  'Retract a 12 V solenoid bolt for three seconds on a match, then re-lock.',
  'Enrol new cards by tapping a designated master card first, with no computer attached.',
  'Delete a card the same way - tap master, tap the card to remove it.',
  'Remember everything through a power cut, in EEPROM.',
  'Green LED for granted, red for denied, and a short beep for each.'
],

how: `
<p><strong>The RC522</strong> is a 13.56&nbsp;MHz reader. It energises a coil, and a card brought near it
harvests power from that field - the cards have no battery - and answers back by modulating the load on the
field. The chip handles all of that; your Arduino talks to it over SPI and asks "is there a card, and what is
its UID?"</p>
<p>The <strong>UID</strong> is a 4 or 7 byte serial number burned into the card. That is all this project uses.
MIFARE Classic cards also have 1&nbsp;KB of writable sectors behind a weak encryption scheme that was broken in
2008, so storing a "secret" in a sector adds effort without adding much security. Comparing UIDs is honest
about what it is.</p>
<p><strong>The solenoid</strong> is an electromagnet pulling a spring-loaded bolt. It needs 12&nbsp;V at
roughly 500-800&nbsp;mA - hundreds of times what an Arduino pin can supply - so a relay does the switching. The
relay's coil gets its own 5&nbsp;V and its contacts carry the 12&nbsp;V, with no electrical path between them
at all.</p>
<p>These are <em>fail-secure</em> locks: no power means locked. That is the right choice for a cabinet and the
wrong choice for anything a person could be shut behind.</p>`,

bom: [
  { id: 'uno', qty: 1 },
  { id: 'rc522', qty: 1, note: 'Comes with one card and one fob. That is your master card and your first user.' },
  { id: 'rfid-tags', qty: 4, note: 'Blank MIFARE Classic 1K cards for everyone else.' },
  { id: 'relay1', qty: 1, note: 'Opto-isolated, with the flyback diode already on the board. Do not use a bare relay here.' },
  { id: 'sol-lock', qty: 1, note: '12 V fail-secure solenoid. Measure the current draw before you size the supply - some want more than a full amp.' },
  { id: 'psu12v2a', qty: 1, note: 'Powers the solenoid AND, through the Uno barrel jack, the Arduino.' },
  { id: 'led5', qty: 2, note: 'One green, one red.' },
  { id: 'res220', qty: 2 },
  { id: 'buzzer', qty: 1 },
  { id: 'bb-830', qty: 1, own: true, note: 'For the prototype. The final version goes on perfboard.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'box-abs', qty: 1 }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'uno',  comp: 'uno',      at: [0, 78] },
    { id: 'rfid', comp: 'rc522',    at: [-52, -12], ry: 180 },
    { id: 'rly',  comp: 'relay1',   at: [46, -14], ry: 180 },
    { id: 'lock', comp: 'solenoid', at: [46, -82] },
    { id: 'buz',  comp: 'buzzer',   at: [-4, -70] },
    { id: 'lg',   comp: 'led5',     at: [-22, -72], opt: { c: '#3fbf6a' } },
    { id: 'lr',   comp: 'led5',     at: [-13, -72], opt: { c: '#e0483c' } }
  ],
  wires: [
    { from: 'rfid.3V3',  to: 'uno.3V3',   color: 'red',    note: '3.3 V ONLY. Five volts kills this module' },
    { from: 'rfid.GND',  to: 'uno.GND1',  color: 'black',  note: 'Ground' },
    { from: 'rfid.RST',  to: 'uno.D9',    color: 'white',  note: 'Reset line' },
    { from: 'rfid.SDA',  to: 'uno.D10',   color: 'orange', note: 'SPI chip select (labelled SDA, confusingly)' },
    { from: 'rfid.MOSI', to: 'uno.D11',   color: 'blue',   note: 'SPI data to the reader' },
    { from: 'rfid.MISO', to: 'uno.D12',   color: 'green',  note: 'SPI data from the reader' },
    { from: 'rfid.SCK',  to: 'uno.D13',   color: 'yellow', note: 'SPI clock' },
    { from: 'rly.VCC',   to: 'uno.5V',    color: 'red',    note: 'Relay coil supply' },
    { from: 'rly.GND',   to: 'uno.GND2',  color: 'black',  note: 'Relay ground' },
    { from: 'rly.IN',    to: 'uno.D3',    color: 'purple', note: 'Drives the relay. LOW turns most of these modules ON' },
    { from: 'rly.NO',    to: 'lock.W1',   color: 'brown',  note: 'Switched 12 V out to the solenoid. COM takes 12 V in from the supply' },
    { from: 'lg.A',      to: 'uno.D5',    color: 'green',  note: 'Green LED through a 220 ohm resistor' },
    { from: 'lg.K',      to: 'uno.GND3',  color: 'black',  note: 'Green LED cathode' },
    { from: 'lr.A',      to: 'uno.D6',    color: 'red',    note: 'Red LED through a 220 ohm resistor' },
    { from: 'lr.K',      to: 'uno.GND3',  color: 'black',  note: 'Red LED cathode' },
    { from: 'buz.+',     to: 'uno.D4',    color: 'orange', note: 'Piezo buzzer' },
    { from: 'buz.-',     to: 'uno.GND3',  color: 'black',  note: 'Buzzer ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">The RC522 is a 3.3 V part. This is the one that kills modules.</span>
<p>Its power pin goes to the Uno's <strong>3V3</strong> pin, never to 5&nbsp;V. There is no regulator on the
module and no protection. Five volts will destroy it, usually not instantly but over a few minutes, which
makes the fault confusing when it appears.</p>
<p>The SPI <em>signal</em> lines are a different question. Strictly, the Uno's 5&nbsp;V outputs are out of spec
for the RC522's inputs, and thousands of people connect them directly anyway and get away with it for years.
If you want to do it properly, put a 1&nbsp;k&Omega; / 2&nbsp;k&Omega; divider in each of MOSI, SCK and SS, or
use a level-shifter module. MISO is the reader driving the Uno and needs nothing.</p></div>

<div class="note warn"><span class="t">The 12 V side never touches the Arduino</span>
<p>The supply's 12&nbsp;V goes to the relay's <strong>COM</strong> screw terminal and from <strong>NO</strong>
to one solenoid wire. The solenoid's other wire goes back to the supply's negative. The Arduino is only
connected to the relay's low-voltage header - VCC, GND and IN. Keep it that way.</p></div>

<div class="note tip"><span class="t">Most relay modules are active LOW</span>
<p><code>digitalWrite(RELAY, LOW)</code> energises the coil on the common blue boards. The sketch has a
<code>RELAY_ACTIVE_LOW</code> flag at the top - if your lock opens when it should be shut, flip it.</p></div>`,

solderSteps: [
  { h: 'Headers on the RC522',
    body: `<p>It ships with a loose 8-pin strip. Pins point down from the component side. Breadboard as a jig,
    tack pin 1 and pin 8, check it is square from the side, then do the middle six. Three seconds each at
    340&nbsp;&deg;C.</p>
    <p>The board is a large ground plane and will pull heat away. If a joint is not flowing after three
    seconds, turn the iron up rather than waiting longer - waiting is what lifts pads.</p>` },
  { h: 'Lay out the perfboard before you solder anything to it',
    body: `<p>Push the female header sockets, the LEDs, the resistors and the screw terminals into the board
    dry, and look at it. Leave room for the wires. Mark which holes you are using with a pencil. Ten minutes
    here saves an hour of desoldering.</p>` },
  { h: 'Female sockets for the RC522 and the relay',
    body: `<p>Do not solder those modules down permanently - they are the parts most likely to fail or be
    reused. Cut an 8-pin and a 3-pin length of female header, tack the end pins of each, check they are square,
    then complete them.</p>` },
  { h: 'The LEDs, with their resistors in the legs',
    body: `<p>Put the 220&nbsp;&Omega; resistor in series with the anode <em>on the board</em> rather than
    using a separate patch: bend one resistor leg down through the hole next to the LED's long leg, solder
    both, and trim.</p>
    <p>Remember which leg is which before you trim them - long leg anode, short leg cathode, flat on the rim.
    Once they are cut you are reading it off the flat spot with a magnifier.</p>` },
  { h: 'Screw terminals for the 12 V and the solenoid',
    body: `<p>Two 2-pin blocks, openings facing outward off the edge of the board. These are the only parts
    that carry any real current, so make the joints generous - fill the pad properly.</p>
    <p><strong>Do not tin the wires</strong> that go into the screw terminals themselves. Solder cold-flows
    under the clamping pressure and the screw works loose over months.</p>` },
  { h: 'Run the ground first, then power, then signals',
    body: `<p>Solid-core 22&nbsp;AWG, bent flat against the board. A shared ground rail down one edge of the
    perfboard, then 5&nbsp;V, then the individual signal wires. Keep the colours honest: black for ground, red
    for 5&nbsp;V.</p>` },
  { h: 'Inspect and buzz it out',
    body: `<p>Rake light across the board and look along the rows for bridges. Then, with everything unpowered:
    continuity from every ground point to the Arduino's GND (beep), from 5&nbsp;V to the Uno's 5&nbsp;V pin
    (beep), and 5&nbsp;V to ground (<strong>no beep</strong>). Also 3.3&nbsp;V to 5&nbsp;V: no beep.</p>` },
  { h: 'Only now connect the 12 V',
    body: `<p>Power the logic from USB first and test card reading with the solenoid completely disconnected.
    Bring the 12&nbsp;V in last, once you are sure the relay is clicking at the right times.</p>` }
],

assembly: [
  { h: 'Breadboard it first, exactly as in the model',
    body: `<p>Do not go straight to perfboard. Get the reader working, get the UIDs printing, get the relay
    clicking, and only then commit it to solder.</p>` },
  { h: 'Read your cards and note the UIDs',
    body: `<p>Upload the UID dumper sketch below and tap each card. Write the UIDs on the cards themselves with
    a fine marker - in six months you will not remember which is which.</p>` },
  { h: 'Pick the master card',
    body: `<p>The blue fob is a good choice because it is physically distinct. Copy its UID into
    <code>MASTER_UID</code> in the main sketch.</p>` },
  { h: 'Upload the lock sketch and enrol a card',
    body: `<p>Tap master. The LEDs alternate to show enrol mode. Tap a new card - three quick beeps and it is
    stored. Tap master again to leave enrol mode (or wait ten seconds).</p>
    <p>Tap an already-stored card while in enrol mode and it is <em>removed</em> - one long beep.</p>` },
  { h: 'Mount the lock properly',
    body: `<p>The solenoid body screws to the frame; the strike plate goes on the door. The bolt must slide
    freely into the strike with a couple of millimetres of play - a solenoid that has to fight a misaligned
    strike will stall, get hot and eventually burn its coil.</p>
    <p>Test it twenty times with the door closed before you trust it.</p>` },
  { h: 'A manual override that does not depend on any of this',
    body: `<p>Fit a physical key, a bolt on the inside, or leave a way in through another door. An
    intermittent jumper wire should never be the thing between you and your own tools.</p>` }
],

libraries: [
  { name: 'MFRC522', by: 'GithubCommunity / Miguel Balboa', why: 'Talks to the RC522 over SPI and gives you card UIDs.' },
  { name: 'SPI', by: 'Arduino', how: 'Built in', why: 'The bus itself. No installation needed.' },
  { name: 'EEPROM', by: 'Arduino', how: 'Built in', why: 'Stores the card list through power cuts.' }
],

code: [
{
  h: 'First: find out what your cards say',
  intro: `<p>Upload this, open the Serial Monitor at 9600, and tap each card. It prints the UID in the exact
  format the main sketch wants.</p>`,
  name: 'uid_dumper.ino',
  code: `#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  10
#define RST_PIN  9

MFRC522 reader(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  reader.PCD_Init();
  delay(50);

  // Prints the antenna gain and firmware version. If this shows
  // 0x00 or 0xFF, the reader is not talking - check wiring and 3.3 V.
  reader.PCD_DumpVersionToSerial();
  Serial.println(F("Tap a card."));
}

void loop() {
  if (!reader.PICC_IsNewCardPresent()) return;
  if (!reader.PICC_ReadCardSerial())   return;

  Serial.print(F("UID ("));
  Serial.print(reader.uid.size);
  Serial.print(F(" bytes):  "));

  for (byte i = 0; i < reader.uid.size; i++) {
    if (reader.uid.uidByte[i] < 0x10) Serial.print('0');
    Serial.print(reader.uid.uidByte[i], HEX);
    if (i < reader.uid.size - 1) Serial.print(' ');
  }
  Serial.println();

  Serial.print(F("  paste this: "));
  Serial.print(F("{"));
  for (byte i = 0; i < reader.uid.size; i++) {
    Serial.print(F("0x"));
    if (reader.uid.uidByte[i] < 0x10) Serial.print('0');
    Serial.print(reader.uid.uidByte[i], HEX);
    if (i < reader.uid.size - 1) Serial.print(F(", "));
  }
  Serial.println(F("}"));

  MFRC522::PICC_Type t = reader.PICC_GetType(reader.uid.sak);
  Serial.print(F("  type: "));
  Serial.println(reader.PICC_GetTypeName(t));
  Serial.println();

  reader.PICC_HaltA();
  delay(600);
}`,
  after: `<p><code>PCD_DumpVersionToSerial()</code> is the single most useful diagnostic here. A healthy module
  prints <code>Firmware Version: 0x92 = v2.0</code>. If it prints <code>0x00</code> or <code>0xFF</code>, the
  Arduino is not communicating with the reader at all and no amount of card-tapping will help - go back to the
  wiring, and check the 3.3&nbsp;V.</p>`
},
{
  h: 'The lock itself',
  name: 'rfid_door_lock.ino',
  code: `/* ------------------------------------------------------------------
   RFID card lock

   Tap a known card  -> relay closes for UNLOCK_MS, green LED, one beep
   Tap an unknown    -> red LED, two beeps
   Tap the master    -> enrol mode: next card is added, or removed if
                        it is already known
   Cards live in EEPROM and survive power loss.
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <MFRC522.h>
#include <EEPROM.h>

// ---- pins ------------------------------------------------------------
#define SS_PIN       10
#define RST_PIN       9
#define RELAY_PIN     3
#define BUZZER_PIN    4
#define LED_GREEN     5
#define LED_RED       6

// ---- behaviour -------------------------------------------------------
#define RELAY_ACTIVE_LOW  true     // most blue relay modules: LOW = on
#define UNLOCK_MS         3000UL
#define ENROL_TIMEOUT_MS  10000UL
#define UID_LEN           4        // MIFARE Classic 1K is 4 bytes
#define MAX_CARDS         20

// Paste your master card's UID here, from the dumper sketch.
const byte MASTER_UID[UID_LEN] = { 0xDE, 0xAD, 0xBE, 0xEF };

// EEPROM layout: [0] = magic, [1] = count, then MAX_CARDS * UID_LEN
#define EE_MAGIC_ADDR  0
#define EE_COUNT_ADDR  1
#define EE_CARDS_ADDR  2
#define EE_MAGIC       0x5A

MFRC522 reader(SS_PIN, RST_PIN);

bool enrolMode = false;
unsigned long enrolStarted = 0;

void setup() {
  Serial.begin(9600);
  SPI.begin();
  reader.PCD_Init();

  pinMode(RELAY_PIN, OUTPUT);
  lockNow();                       // make sure we start locked

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);

  if (EEPROM.read(EE_MAGIC_ADDR) != EE_MAGIC) {
    EEPROM.update(EE_MAGIC_ADDR, EE_MAGIC);
    EEPROM.update(EE_COUNT_ADDR, 0);
    Serial.println(F("First run - card list cleared."));
  }

  Serial.print(F("Ready. Cards stored: "));
  Serial.println(cardCount());
  blink(LED_GREEN, 2, 80);
}

void loop() {
  if (enrolMode && millis() - enrolStarted > ENROL_TIMEOUT_MS) {
    enrolMode = false;
    Serial.println(F("Enrol mode timed out."));
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);
    blink(LED_RED, 1, 200);
  }
  if (enrolMode) {
    // alternate the LEDs so it is obvious we are in a different mode
    bool on = (millis() / 250) % 2;
    digitalWrite(LED_GREEN, on);
    digitalWrite(LED_RED, !on);
  }

  if (!reader.PICC_IsNewCardPresent()) return;
  if (!reader.PICC_ReadCardSerial())   return;

  byte uid[UID_LEN];
  for (byte i = 0; i < UID_LEN; i++) uid[i] = reader.uid.uidByte[i];
  printUid(uid);

  if (sameUid(uid, MASTER_UID)) {
    enrolMode = !enrolMode;
    enrolStarted = millis();
    Serial.println(enrolMode ? F("-> enrol mode ON") : F("-> enrol mode OFF"));
    beep(2, 60);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);

  } else if (enrolMode) {
    int slot = findCard(uid);
    if (slot >= 0) {
      removeCard(slot);
      Serial.println(F("-> card REMOVED"));
      beep(1, 500);
    } else if (cardCount() >= MAX_CARDS) {
      Serial.println(F("-> list full"));
      beep(4, 80);
    } else {
      addCard(uid);
      Serial.println(F("-> card ADDED"));
      beep(3, 70);
    }
    enrolMode = false;
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);

  } else if (findCard(uid) >= 0) {
    Serial.println(F("-> granted"));
    grant();

  } else {
    Serial.println(F("-> DENIED"));
    deny();
  }

  reader.PICC_HaltA();
  reader.PCD_StopCrypto1();
  delay(250);                       // stops one tap reading three times
}

/* --- the lock --------------------------------------------------------- */
void unlockNow() { digitalWrite(RELAY_PIN, RELAY_ACTIVE_LOW ? LOW : HIGH); }
void lockNow()   { digitalWrite(RELAY_PIN, RELAY_ACTIVE_LOW ? HIGH : LOW); }

void grant() {
  digitalWrite(LED_GREEN, HIGH);
  beep(1, 120);
  unlockNow();
  delay(UNLOCK_MS);
  lockNow();
  digitalWrite(LED_GREEN, LOW);
}

void deny() {
  digitalWrite(LED_RED, HIGH);
  beep(2, 120);
  delay(700);
  digitalWrite(LED_RED, LOW);
}

/* --- the stored card list --------------------------------------------- */
byte cardCount() { return EEPROM.read(EE_COUNT_ADDR); }

int findCard(const byte* uid) {
  byte n = cardCount();
  for (byte i = 0; i < n; i++) {
    bool match = true;
    for (byte b = 0; b < UID_LEN; b++) {
      if (EEPROM.read(EE_CARDS_ADDR + i * UID_LEN + b) != uid[b]) { match = false; break; }
    }
    if (match) return i;
  }
  return -1;
}

void addCard(const byte* uid) {
  byte n = cardCount();
  for (byte b = 0; b < UID_LEN; b++) {
    EEPROM.update(EE_CARDS_ADDR + n * UID_LEN + b, uid[b]);
  }
  EEPROM.update(EE_COUNT_ADDR, n + 1);
}

void removeCard(int slot) {
  byte n = cardCount();
  // shuffle the last card into the gap - order does not matter
  for (byte b = 0; b < UID_LEN; b++) {
    byte last = EEPROM.read(EE_CARDS_ADDR + (n - 1) * UID_LEN + b);
    EEPROM.update(EE_CARDS_ADDR + slot * UID_LEN + b, last);
  }
  EEPROM.update(EE_COUNT_ADDR, n - 1);
}

/* --- odds and ends ---------------------------------------------------- */
bool sameUid(const byte* a, const byte* b) {
  for (byte i = 0; i < UID_LEN; i++) if (a[i] != b[i]) return false;
  return true;
}

void printUid(const byte* uid) {
  Serial.print(F("card "));
  for (byte i = 0; i < UID_LEN; i++) {
    if (uid[i] < 0x10) Serial.print('0');
    Serial.print(uid[i], HEX);
    Serial.print(' ');
  }
}

void beep(byte times, int ms) {
  for (byte i = 0; i < times; i++) {
    tone(BUZZER_PIN, 2200, ms);
    delay(ms + 60);
  }
}

void blink(byte pin, byte times, int ms) {
  for (byte i = 0; i < times; i++) {
    digitalWrite(pin, HIGH); delay(ms);
    digitalWrite(pin, LOW);  delay(ms);
  }
}`,
  after: `<p>Two design decisions worth explaining:</p>
  <ul>
    <li><strong><code>EEPROM.update()</code>, not <code>EEPROM.write()</code>.</strong> Update only writes if
    the byte has actually changed. EEPROM cells wear out after about 100,000 writes, and update turns most
    writes into nothing.</li>
    <li><strong>The magic byte.</strong> A fresh ATmega's EEPROM is all <code>0xFF</code>, so without a marker
    the sketch would think it had 255 cards stored. Writing <code>0x5A</code> at address 0 and checking for it
    is the standard way to tell "initialised" from "never used".</li>
  </ul>`
}],

upload: `
<p>Uno, the right port, upload. Then, in order:</p>
<ol>
  <li>Serial Monitor at 9600. You should see <code>Ready. Cards stored: 0</code>.</li>
  <li>Tap the master card. <code>-&gt; enrol mode ON</code>, and the LEDs start alternating.</li>
  <li>Tap a blank card. <code>-&gt; card ADDED</code>, three beeps.</li>
  <li>Tap that card again. <code>-&gt; granted</code>, and the relay clicks.</li>
</ol>
<div class="note warn"><span class="t">Pin 13 is the SPI clock and the built-in LED</span>
<p>On an Uno, <code>D13</code> does double duty. That is harmless here, but it means the onboard LED flickers
during SPI traffic, and it means you cannot use D13 as a status light in this project.</p></div>`,

tune: [
  { h: 'Fix the read range',
    body: `<p>Typical range is 2-4&nbsp;cm and it feels short. Things that reduce it: mounting the reader on or
    near metal, long jumper wires to the reader, and a weak 3.3&nbsp;V supply.</p>
    <p>The library can raise the antenna gain:
    <code>reader.PCD_SetAntennaGain(MFRC522::RxGain_max);</code> in <code>setup()</code>. That typically buys
    another centimetre.</p>` },
  { h: 'Stop double reads',
    body: `<p>If one tap registers twice, increase the <code>delay(250)</code> at the end of
    <code>loop()</code>. 400&nbsp;ms is comfortable and still feels instant.</p>` },
  { h: 'Tune the unlock time',
    body: `<p><code>UNLOCK_MS</code>. Three seconds is right for a cabinet you are standing at. Six for a door
    you have to walk to. Do not go much above ten - most cheap solenoids are rated for intermittent duty and
    get hot if energised continuously.</p>` },
  { h: 'Handle 7-byte UIDs',
    body: `<p>Newer MIFARE Ultralight and NTAG cards - including the ones inside phones - have 7-byte UIDs.
    This sketch compares 4 bytes, so two such cards could theoretically collide. If you want to use them, set
    <code>UID_LEN</code> to 7 and reduce <code>MAX_CARDS</code> so the list still fits in the 1&nbsp;KB of
    EEPROM.</p>` }
],

trouble: [
  { q: '<code>Firmware Version: 0x00</code> or <code>0xFF</code>',
    a: `The Arduino cannot talk to the reader. In order of likelihood: the module is on 5&nbsp;V and is now
    dead, a SPI wire is on the wrong pin, the headers are not soldered properly, or MISO and MOSI are swapped.
    Reflow the header joints - poorly soldered RC522 headers are extremely common because the ground plane
    soaks up heat.` },
  { q: 'Version reads fine but no card is ever detected',
    a: `Range. Hold the card flat against the middle of the board, not at the edge. Try the fob - it often
    reads better than the card. Then raise the antenna gain.` },
  { q: 'Reads intermittently, then stops until reset',
    a: `Usually the 3.3&nbsp;V supply. The Uno's regulator only offers about 50&nbsp;mA on that pin and the
    RC522 pulls 26&nbsp;mA in bursts. Add a 10&nbsp;&micro;F capacitor across the module's 3.3&nbsp;V and GND
    pins, or feed it from a dedicated AMS1117 board.` },
  { q: 'Relay clicks but the solenoid does not move',
    a: `Measure 12&nbsp;V across the solenoid terminals while the relay is on. If it is there, the bolt is
    mechanically jammed or the strike is misaligned. If it is not, check the COM/NO wiring and the supply -
    a 1&nbsp;A supply will collapse under a solenoid that wants 800&nbsp;mA plus an inrush.` },
  { q: 'The lock opens when the Arduino resets',
    a: `<code>RELAY_ACTIVE_LOW</code> is set wrongly, and the pin is floating low during reset. Beyond flipping
    the flag, add a 10&nbsp;k&Omega; pull-up from the relay IN pin to 5&nbsp;V so the relay is definitely off
    while the board boots.` },
  { q: 'Arduino resets every time the relay fires',
    a: `The solenoid's back-EMF or inrush is dragging the shared supply down. Power the Arduino from USB or a
    separate supply and keep only the relay contacts on the 12&nbsp;V, or add a large capacitor across the
    12&nbsp;V rail.` },
  { q: 'Cards forget themselves after a power cut',
    a: `You are writing to RAM somewhere, or the magic byte check is failing. Print <code>cardCount()</code> at
    boot to see what EEPROM actually holds.` },
  { q: 'Everything works on the breadboard and fails on perfboard',
    a: `A cold joint. Reflow every joint on the SPI lines - they are the most timing-sensitive. Use the tug
    test on each component.` }
],

next: `
<ul>
  <li><strong>Log every tap</strong> to an SD card with a DS3231 timestamp - that is the
  <a href="project.html?p=rfid-attendance-logger">attendance logger</a>, and it shares most of this wiring.</li>
  <li><strong>Add a keypad</strong> so entry needs a card <em>and</em> a PIN. Two factors, one of which cannot
  be cloned from a pocket.</li>
  <li><strong>Swap the Uno for an ESP32</strong> and push a notification when the door opens, or manage the
  card list from a web page.</li>
  <li><strong>Use a PN532 instead</strong> and you can tap a phone rather than a card.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Read this before you fit it to a door</span>
<ul>
  <li><strong>Never fit this to a door someone could be shut behind.</strong> It is fail-secure: a power cut
  leaves it locked. On a room with one exit that is a fire hazard and, in most countries, illegal.</li>
  <li><strong>Keep a physical override.</strong> A key, a bolt on the inside, another door.</li>
  <li><strong>These cards are trivially cloneable.</strong> MIFARE Classic's encryption was broken in 2008 and
  a cheap handheld cloner copies a card in seconds. Treat this as a convenient key, not as security.</li>
  <li><strong>12 V solenoids get hot.</strong> Most are rated for intermittent duty only. A bug that leaves the
  relay on can cook the coil in minutes - the <code>UNLOCK_MS</code> timeout exists for that reason.</li>
</ul>
</div>`
});
