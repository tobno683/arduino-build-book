/* RC522 + DS3231 + SD card: a tap-in/tap-out attendance log. */
AB.addProject({
slug: 'rfid-attendance-logger',
title: 'RFID attendance logger',
cat: 'rfid',
level: 3,
time: '3 hours',
solder: true,
board: 'Uno',
tags: ['rc522', 'sd card', 'ds3231', 'csv', 'attendance', 'names', 'logging'],
blurb: 'Tap in, tap out, and a CSV on an SD card knows who was where and for how long. For a workshop, a club, a classroom or a tool crib.',

skills: ['SPI with two devices', 'Chip select discipline', 'RTC timestamps', 'CSV design', 'Name lookup tables'],

intro: `
<p>This is the same reader as the <a href="project.html?p=rfid-door-lock">card lock</a>, doing something less
dramatic and considerably more useful. It also introduces a genuinely instructive problem: two SPI devices on
one bus, which is where most people's first multi-module project quietly falls apart.</p>
<p>The output is a CSV that opens straight into a spreadsheet, with names rather than hex UIDs, and a
calculated duration for every completed session.</p>`,

what: [
  'Recognise a card and show the person\'s name on the LCD rather than a hex number.',
  'Toggle between tap-in and tap-out automatically, and show how long they were in.',
  'Write a timestamped CSV line for every event, plus the calculated duration on tap-out.',
  'Show an unknown card\'s UID on screen so you can add it to the name table.',
  'Keep working - and keep logging - with no computer attached.'
],

how: `
<p>Two devices, one <strong>SPI</strong> bus. SPI is designed for this: MOSI, MISO and SCK are shared, and each
device gets its own <em>chip select</em> line. Only the device whose CS is pulled low pays attention; the others
must release the MISO line entirely.</p>
<p>The problem in practice is that the RC522 library and the SD library both assume they own the bus. The RC522
in particular does not always let go of MISO cleanly. The fix, and the reason this project is worth building,
is discipline: explicitly deselect one device before you talk to the other, every single time. The sketch has
two one-line helpers that do exactly that, and they are the difference between a build that works and one that
reads cards until you write to the card and then never again.</p>
<p>The <strong>name table</strong> is a simple array of UID-and-name pairs in flash. For a dozen people that is
the right answer; for more, keep a <code>people.csv</code> on the SD card and read it at boot.</p>`,

bom: [
  { id: 'uno', qty: 1 },
  { id: 'rc522', qty: 1, note: '3.3 V only. Read the warning in the wiring section.' },
  { id: 'rfid-tags', qty: 10, note: 'One per person. Write the name on each with a fine permanent marker.' },
  { id: 'sdcard', qty: 1 },
  { id: 'sdcard-8gb', qty: 1, own: true },
  { id: 'ds3231', qty: 1 },
  { id: 'rtc-cell', qty: 1, own: true },
  { id: 'lcd1602', qty: 1, note: 'With the I2C backpack.' },
  { id: 'buzzer', qty: 1 },
  { id: 'led5', qty: 2, note: 'Green for in, red for out.' },
  { id: 'res220', qty: 2 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'psu5v3a', qty: 1 },
  { id: 'box-abs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'uno',  comp: 'uno',     at: [0, 80] },
    { id: 'rfid', comp: 'rc522',   at: [-54, -8], ry: 180 },
    { id: 'sd',   comp: 'sdcard',  at: [46, 4], ry: 180 },
    { id: 'rtc',  comp: 'ds3231',  at: [46, -44], ry: 180 },
    { id: 'lcd',  comp: 'lcd1602', at: [-14, -80] },
    { id: 'buz',  comp: 'buzzer',  at: [56, -78] },
    { id: 'lg',   comp: 'led5',    at: [30, -76], opt: { c: '#3fbf6a' } },
    { id: 'lr',   comp: 'led5',    at: [40, -76], opt: { c: '#e0483c' } }
  ],
  wires: [
    { from: 'rfid.3V3',  to: 'uno.3V3',   color: 'red',    note: '3.3 V ONLY - 5 V destroys this module' },
    { from: 'rfid.GND',  to: 'uno.GND1',  color: 'black',  note: 'Ground' },
    { from: 'rfid.RST',  to: 'uno.D9',    color: 'white',  note: 'Reader reset' },
    { from: 'rfid.SDA',  to: 'uno.D8',    color: 'orange', note: 'Reader chip select (the pin is labelled SDA)' },
    { from: 'rfid.MOSI', to: 'uno.D11',   color: 'blue',   note: 'Shared SPI data out' },
    { from: 'rfid.MISO', to: 'uno.D12',   color: 'green',  note: 'Shared SPI data in' },
    { from: 'rfid.SCK',  to: 'uno.D13',   color: 'yellow', note: 'Shared SPI clock' },
    { from: 'sd.VCC',    to: 'uno.5V',    color: 'red',    note: 'The SD module has its own regulator and level shifter' },
    { from: 'sd.GND',    to: 'uno.GND2',  color: 'black',  note: 'Ground' },
    { from: 'sd.MOSI',   to: 'uno.D11',   color: 'blue',   note: 'Same SPI bus' },
    { from: 'sd.MISO',   to: 'uno.D12',   color: 'green',  note: 'Same SPI bus' },
    { from: 'sd.SCK',    to: 'uno.D13',   color: 'yellow', note: 'Same SPI bus' },
    { from: 'sd.CS',     to: 'uno.D10',   color: 'purple', note: 'Card chip select - a DIFFERENT pin from the reader' },
    { from: 'rtc.VCC',   to: 'uno.5V',    color: 'red',    note: 'Clock power' },
    { from: 'rtc.GND',   to: 'uno.GND2',  color: 'black',  note: 'Clock ground' },
    { from: 'rtc.SDA',   to: 'uno.A4',    color: 'grey',   note: 'I2C, shared with the LCD' },
    { from: 'rtc.SCL',   to: 'uno.A5',    color: 'brown',  note: 'I2C, shared with the LCD' },
    { from: 'lcd.VCC',   to: 'uno.5V',    color: 'red',    note: 'Display power' },
    { from: 'lcd.GND',   to: 'uno.GND3',  color: 'black',  note: 'Display ground' },
    { from: 'lcd.SDA',   to: 'uno.A4',    color: 'grey',   note: 'Same I2C pair' },
    { from: 'lcd.SCL',   to: 'uno.A5',    color: 'brown',  note: 'Same I2C pair' },
    { from: 'lg.A',      to: 'uno.D5',    color: 'green',  note: 'Green LED via 220 ohm' },
    { from: 'lg.K',      to: 'uno.GND3',  color: 'black',  note: 'Green cathode' },
    { from: 'lr.A',      to: 'uno.D6',    color: 'red',    note: 'Red LED via 220 ohm' },
    { from: 'lr.K',      to: 'uno.GND3',  color: 'black',  note: 'Red cathode' },
    { from: 'buz.+',     to: 'uno.D4',    color: 'orange', note: 'Buzzer' },
    { from: 'buz.-',     to: 'uno.GND3',  color: 'black',  note: 'Buzzer ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">RC522 power is 3.3 V. Every time.</span>
<p>There is no regulator on the module. Feeding it 5&nbsp;V kills it - often slowly, so the symptom is a reader
that worked yesterday and does not today.</p>
<p>The Uno's 3.3&nbsp;V pin supplies only about 50&nbsp;mA, and the RC522 wants 26&nbsp;mA in bursts. It works,
but add a 10&nbsp;&micro;F capacitor across the module's 3.3&nbsp;V and GND pins if reads become
intermittent.</p></div>

<div class="note warn"><span class="t">Two chip selects, and they must be different pins</span>
<p>Reader CS on D8, card CS on D10. Both devices share D11, D12 and D13. If you give them the same CS pin, both
answer at once, both drive MISO, and you get garbage from both.</p>
<p>D10 is also the ATmega's hardware SS pin and must be an output for SPI to work as a master - which the SD
library handles, but it is why D10 is the conventional choice for the card.</p></div>

<div class="note tip"><span class="t">The two buses do not clash</span>
<p>The LCD and the clock are on I2C (A4/A5); the reader and the card are on SPI (D11-D13). Completely separate
sets of wires, and they do not interfere with each other. This is why so many projects end up using both.</p></div>`,

solderSteps: [
  { h: 'Headers on the RC522 first',
    body: `<p>Eight pins, pointing down. Use a breadboard as the jig. The board has a big ground plane that
    sucks heat - if a joint is not flowing in three seconds, turn the iron up to 360&nbsp;&deg;C rather than
    holding it there longer.</p>
    <p>Poor joints here are the single most common cause of a reader that "does not work", so tug-test each
    pin.</p>` },
  { h: 'Plan the perfboard around the SPI bus',
    body: `<p>Run three parallel wires down the board - MOSI, MISO, SCK - and tap off them for each device. It
    is tidier than star wiring and it is how the bus is meant to be laid out.</p>
    <p>Keep those three runs short. SPI at 4&nbsp;MHz over 200&nbsp;mm of loose wire is where the intermittent
    faults come from.</p>` },
  { h: 'Sockets for all four modules',
    body: `<p>8-pin for the reader, 6-pin for the card module, 6-pin for the clock, 4-pin for the LCD backpack.
    Every one of these is worth being able to pull out and test on its own.</p>` },
  { h: 'LEDs with resistors in the legs',
    body: `<p>220&nbsp;&Omega; bent through the adjacent hole and soldered to the same pad as the anode. Green
    on D5, red on D6.</p>` },
  { h: 'Mount the reader where a card can reach it',
    body: `<p>The reader wants to be flat behind a thin non-metallic panel, 2-3&nbsp;mm at most. Metal anywhere
    near the antenna kills the range. Use nylon standoffs, not steel screws through the board.</p>
    <p>Flying leads of 100-150&nbsp;mm are fine for SPI; longer and it becomes unreliable.</p>` },
  { h: 'Check both chip selects',
    body: `<p>With everything unpowered: continuity from D8 to the reader's SDA pin (beep), D10 to the card's CS
    (beep), and D8 to D10 (<strong>no beep</strong>). Then 3.3&nbsp;V to 5&nbsp;V: no beep.</p>` }
],

assembly: [
  { h: 'Get the reader working alone',
    body: `<p>Upload the UID dumper from the <a href="project.html?p=rfid-door-lock">card lock project</a> with
    the SD module unplugged. Confirm <code>Firmware Version: 0x92</code> and that cards read.</p>` },
  { h: 'Then the card alone',
    body: `<p>Arduino IDE: <strong>File &rarr; Examples &rarr; SD &rarr; CardInfo</strong>, with
    <code>chipSelect = 10</code>. Confirm it reports the card type and volume.</p>
    <p>Doing these one at a time is the whole trick. Debugging two SPI devices at once is much harder than
    debugging one, twice.</p>` },
  { h: 'Set the clock, then move off the setter sketch',
    body: `<p>Use the clock setter from the <a href="project.html?p=desk-clock">desk clock</a>. Leaving it
    installed resets the time on every reboot.</p>` },
  { h: 'Collect the UIDs and build the name table',
    body: `<p>Tap every card in turn with the dumper running, copy the four bytes for each into the
    <code>people[]</code> array, and put the person's name next to it. Write the name on the card too.</p>` },
  { h: 'Mount it at the door',
    body: `<p>Reader at about 1.1&nbsp;m, LCD at eye level, and the LEDs where they can be seen from a metre
    away. People need immediate feedback or they tap three times.</p>` }
],

libraries: [
  { name: 'MFRC522', by: 'GithubCommunity', why: 'The reader.' },
  { name: 'SD', by: 'Arduino', how: 'Built in', why: 'The card.' },
  { name: 'RTClib', by: 'Adafruit', why: 'The DS3231.' },
  { name: 'LiquidCrystal I2C', by: 'Frank de Brabander', why: 'The display.' }
],

code: [{
  name: 'attendance_logger.ino',
  code: `/* ------------------------------------------------------------------
   RFID attendance logger
   RC522 (CS D8, RST D9) and SD card (CS D10) share SPI on D11-D13.
   DS3231 and 16x2 LCD share I2C on A4/A5.

   Writes /ATTEND.CSV:
     datetime,name,uid,direction,minutes
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <MFRC522.h>
#include <SD.h>
#include <Wire.h>
#include <RTClib.h>
#include <LiquidCrystal_I2C.h>

// ---- pins ------------------------------------------------------------
#define RFID_CS   8
#define RFID_RST  9
#define SD_CS    10
#define BUZZER    4
#define LED_IN    5
#define LED_OUT   6
#define LCD_ADDR 0x27

#define MAX_PEOPLE 12
#define UID_LEN     4

MFRC522 reader(RFID_CS, RFID_RST);
RTC_DS3231 rtc;
LiquidCrystal_I2C lcd(LCD_ADDR, 16, 2);

// ---- the name table. Fill this in from the UID dumper ----------------
struct Person {
  byte uid[UID_LEN];
  const char* name;
};

const Person people[] = {
  { { 0xDE, 0xAD, 0xBE, 0xEF }, "Alex"    },
  { { 0x12, 0x34, 0x56, 0x78 }, "Sam"     },
  { { 0xAB, 0xCD, 0xEF, 0x01 }, "Robin"   }
};
const byte PEOPLE_COUNT = sizeof(people) / sizeof(people[0]);

// who is currently in, and since when
bool     isIn[MAX_PEOPLE];
uint32_t inSince[MAX_PEOPLE];

bool sdOk = false;

void setup() {
  Serial.begin(9600);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_IN, OUTPUT);
  pinMode(LED_OUT, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.print(F("starting..."));

  SPI.begin();

  // Bring BOTH chip selects high before either library initialises,
  // so neither device is listening while the other sets itself up.
  pinMode(RFID_CS, OUTPUT); digitalWrite(RFID_CS, HIGH);
  pinMode(SD_CS,   OUTPUT); digitalWrite(SD_CS,   HIGH);

  useReader();
  reader.PCD_Init();
  delay(50);
  byte ver = reader.PCD_ReadRegister(MFRC522::VersionReg);
  Serial.print(F("RC522 version 0x"));
  Serial.println(ver, HEX);

  useCard();
  sdOk = SD.begin(SD_CS);
  Serial.println(sdOk ? F("SD ok") : F("SD FAILED"));

  if (sdOk && !SD.exists("ATTEND.CSV")) {
    File f = SD.open("ATTEND.CSV", FILE_WRITE);
    if (f) { f.println(F("datetime,name,uid,direction,minutes")); f.close(); }
  }

  if (!rtc.begin()) Serial.println(F("no RTC"));

  useReader();
  lcd.clear();
  lcd.print(F("Tap your card"));
  beep(1, 80);
}

void loop() {
  useReader();

  if (!reader.PICC_IsNewCardPresent()) return;
  if (!reader.PICC_ReadCardSerial())   return;

  byte uid[UID_LEN];
  for (byte i = 0; i < UID_LEN; i++) uid[i] = reader.uid.uidByte[i];

  int who = findPerson(uid);
  DateTime now = rtc.now();

  if (who < 0) {
    unknownCard(uid);
  } else if (isIn[who]) {
    tapOut(who, now);
  } else {
    tapIn(who, now);
  }

  reader.PICC_HaltA();
  reader.PCD_StopCrypto1();
  delay(1200);                        // long enough to read the screen
  lcd.clear();
  lcd.print(F("Tap your card"));
}

/* --- the two lines that make two SPI devices behave ------------------- */
void useReader() { digitalWrite(SD_CS, HIGH);   digitalWrite(RFID_CS, HIGH); }
void useCard()   { digitalWrite(RFID_CS, HIGH); }

/* ---------------------------------------------------------------------- */
int findPerson(const byte* uid) {
  for (byte p = 0; p < PEOPLE_COUNT && p < MAX_PEOPLE; p++) {
    bool same = true;
    for (byte i = 0; i < UID_LEN; i++) {
      if (people[p].uid[i] != uid[i]) { same = false; break; }
    }
    if (same) return p;
  }
  return -1;
}

void tapIn(int who, DateTime now) {
  isIn[who] = true;
  inSince[who] = now.unixtime();

  digitalWrite(LED_IN, HIGH);
  lcd.clear();
  lcd.print(F("Welcome"));
  lcd.setCursor(0, 1);
  lcd.print(people[who].name);
  beep(1, 120);

  writeLine(now, who, "IN", -1);
  delay(900);
  digitalWrite(LED_IN, LOW);
}

void tapOut(int who, DateTime now) {
  isIn[who] = false;
  long minutes = (now.unixtime() - inSince[who]) / 60L;

  digitalWrite(LED_OUT, HIGH);
  lcd.clear();
  lcd.print(F("Bye "));
  lcd.print(people[who].name);
  lcd.setCursor(0, 1);
  lcd.print(minutes);
  lcd.print(F(" minutes"));
  beep(2, 90);

  writeLine(now, who, "OUT", minutes);
  delay(900);
  digitalWrite(LED_OUT, LOW);
}

void unknownCard(const byte* uid) {
  digitalWrite(LED_OUT, HIGH);
  lcd.clear();
  lcd.print(F("Unknown card"));
  lcd.setCursor(0, 1);
  for (byte i = 0; i < UID_LEN; i++) {
    if (uid[i] < 0x10) lcd.print('0');
    lcd.print(uid[i], HEX);
    lcd.print(' ');
  }
  beep(3, 70);

  Serial.print(F("unknown: "));
  for (byte i = 0; i < UID_LEN; i++) {
    Serial.print(F("0x"));
    if (uid[i] < 0x10) Serial.print('0');
    Serial.print(uid[i], HEX);
    if (i < UID_LEN - 1) Serial.print(F(", "));
  }
  Serial.println();

  delay(2200);
  digitalWrite(LED_OUT, LOW);
}

/* --- the log ---------------------------------------------------------- */
void writeLine(DateTime now, int who, const char* dir, long minutes) {
  if (!sdOk) return;

  useCard();
  File f = SD.open("ATTEND.CSV", FILE_WRITE);
  if (!f) { sdOk = false; useReader(); return; }

  char stamp[20];
  snprintf(stamp, sizeof(stamp), "%04d-%02d-%02d %02d:%02d:%02d",
           now.year(), now.month(), now.day(),
           now.hour(), now.minute(), now.second());

  f.print(stamp);              f.print(',');
  f.print(people[who].name);   f.print(',');
  for (byte i = 0; i < UID_LEN; i++) {
    if (people[who].uid[i] < 0x10) f.print('0');
    f.print(people[who].uid[i], HEX);
  }
  f.print(',');
  f.print(dir);                f.print(',');
  if (minutes >= 0) f.print(minutes);
  f.println();
  f.close();

  Serial.print(stamp);
  Serial.print(F("  "));
  Serial.print(people[who].name);
  Serial.print(F("  "));
  Serial.println(dir);

  // Hand the bus back. This line is the one people forget, and without
  // it the reader stops responding after the first card is logged.
  useReader();
  reader.PCD_Init();
}

void beep(byte times, int ms) {
  for (byte i = 0; i < times; i++) {
    tone(BUZZER, 2200, ms);
    delay(ms + 70);
  }
}`,
  after: `<p>The <code>reader.PCD_Init()</code> after every SD write looks like superstition and is not. The SD
  library reconfigures the SPI bus speed and mode for its own use, and the RC522 does not always survive that
  cleanly. Re-initialising the reader costs a couple of milliseconds and eliminates the "works once, then never
  again" failure entirely.</p>`
}],

upload: `
<p>Uno, correct port. Watch the Serial Monitor at 9600 for the boot sequence - you want
<code>RC522 version 0x92</code> and <code>SD ok</code> before anything else makes sense.</p>
<div class="note warn"><span class="t">If the version reads 0x00 or 0xFF</span>
<p>The reader is not talking. Unplug the SD module entirely and try again - if it works without the card, the
problem is bus sharing, and the chip-select discipline in the sketch is what to look at.</p></div>`,

tune: [
  { h: 'Adding people',
    body: `<p>Tap an unknown card and the UID appears on the LCD and in the Serial Monitor, already formatted
    for pasting into the <code>people[]</code> array. Add the line, re-upload.</p>
    <p>Above about a dozen people, move the table to a <code>people.csv</code> on the SD card and read it at
    boot - it is about thirty lines and means you never reflash to add someone.</p>` },
  { h: 'Surviving a power cut mid-session',
    body: `<p>The <code>isIn[]</code> array lives in RAM, so a reboot forgets who is in. For a workshop this is
    usually fine. To fix it properly, read the tail of the CSV at boot and reconstruct the state - or write the
    in/out flags to EEPROM as they change.</p>` },
  { h: 'Read range',
    body: `<p><code>reader.PCD_SetAntennaGain(MFRC522::RxGain_max);</code> after <code>PCD_Init()</code> buys
    about a centimetre. Keeping metal away from the antenna buys more.</p>` },
  { h: 'Stopping accidental double taps',
    body: `<p>The <code>delay(1200)</code> after each read handles it. If people still manage to tap twice,
    add a per-person cooldown: ignore the same UID for thirty seconds.</p>` },
  { h: 'Making the CSV nicer to analyse',
    body: `<p>The current format has one row per event. If you would rather have one row per session, write
    only on tap-out and include both timestamps. Which is better depends entirely on whether you care about
    people who forget to tap out - and they will.</p>` }
],

trouble: [
  { q: 'Reader works until the first card is logged, then never again',
    a: `The SD library has left the bus in a state the RC522 does not like. This is exactly what the
    <code>useReader()</code> plus <code>PCD_Init()</code> at the end of <code>writeLine()</code> is for -
    make sure both are present.` },
  { q: 'SD card fails to initialise when the reader is connected',
    a: `The RC522 is holding MISO. Confirm both CS pins are driven HIGH before <code>SD.begin()</code>, as in
    <code>setup()</code>.` },
  { q: '<code>RC522 version 0x00</code>',
    a: `No communication. Check the 3.3&nbsp;V, reflow the header joints, and confirm CS is on D8 not D10.` },
  { q: 'Every card shows as unknown',
    a: `The UIDs in the table do not match. Print what the reader actually sees and compare byte for byte - it
    is easy to transpose two hex digits.` },
  { q: 'Durations are nonsense or negative',
    a: `The RTC lost power, so <code>unixtime()</code> jumped. Replace the coin cell and re-run the clock
    setter.` },
  { q: 'LCD shows blocks',
    a: `Wrong I2C address (try 0x3F) or the contrast pot on the backpack needs turning.` },
  { q: 'Reads are intermittent',
    a: `Long SPI leads or a marginal 3.3&nbsp;V. Shorten the leads to under 150&nbsp;mm and add a
    10&nbsp;&micro;F capacitor at the reader.` },
  { q: 'CSV has a partial last line after a power cut',
    a: `Expected - the file is closed after every write, so at worst you lose the line in progress. That is the
    trade being made deliberately.` }
],

next: `
<ul>
  <li><strong>Read the name table from the card</strong> so adding a person does not need a laptop.</li>
  <li><strong>Add a small keypad</strong> and require a PIN for anything that matters - a card alone is a token
  anyone can borrow.</li>
  <li><strong>Put it on the network</strong> with an ESP32 and push each event to a Google Sheet or a database,
  with the SD card as the offline fallback.</li>
  <li><strong>Combine it with the <a href="project.html?p=rfid-door-lock">card lock</a></strong> so the same tap
  both opens the door and records who went through it.</li>
</ul>`,

safety: `<p>You are keeping a record of where identifiable people were and when. In the EU and UK that is
personal data under GDPR even for a small club: tell people it exists, say what it is for, keep it no longer
than you need, and do not leave the SD card in a drawer for three years. For a workshop tool crib this is a
two-sentence notice on the wall; for anything involving employees or children, it deserves a proper
conversation first.</p>`
});
