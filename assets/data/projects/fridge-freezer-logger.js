/* Multi-probe DS18B20 logger with RTC timestamps to an SD card. */
AB.addProject({
slug: 'fridge-freezer-logger',
title: 'Fridge and freezer logger',
cat: 'environment',
level: 3,
time: '3 hours',
solder: true,
board: 'Uno',
tags: ['ds18b20', 'onewire', 'sd card', 'ds3231', 'csv', 'logging', 'alarm'],
blurb: 'Three waterproof probes on one wire, a timestamped CSV on an SD card, and a buzzer when something warms up. Also proves your fridge door is not sealing.',

skills: ['1-Wire bus', 'Device addressing', 'RTC timekeeping', 'CSV logging', 'File append safety'],

intro: `
<p>A fridge should sit between 3 and 5&nbsp;&deg;C and a freezer below &minus;18. Most do not, and the ones that
do not are invisible until food spoils. This build puts three probes where they matter, writes a line a minute
to an SD card, and sounds an alarm if anything stays out of range.</p>
<p>The technically interesting part is the <strong>1-Wire</strong> bus: all three probes share a single data
wire, because each DS18B20 has a unique 64-bit address burned in at the factory. One pin, one pull-up resistor,
as many sensors as you like on a single run of cable.</p>`,

what: [
  'Read three DS18B20 probes at once - fridge, freezer and room - to 0.1 degree.',
  'Write a timestamped CSV line every minute that opens straight into a spreadsheet.',
  'Keep real dates and times through power cuts, from a DS3231 with a coin cell.',
  'Sound an alarm if a probe stays out of range for more than the compressor cycle, so a normal defrost does not trip it.',
  'Show all three temperatures and the alarm state on a 16x2 LCD.'
],

how: `
<p>The <strong>DS18B20</strong> is a complete thermometer in a three-pin package: it converts internally and
reports degrees, so there is no analog reading and no calibration curve. Accuracy is &plusmn;0.5&nbsp;&deg;C
from &minus;10 to +85, which is exactly the range this project cares about.</p>
<p><strong>1-Wire</strong> is a single bidirectional data line with a 4.7&nbsp;k&Omega; pull-up to 5&nbsp;V.
The master pulls it low to signal; the sensors let go or hold it down to answer. Because every device has a
unique address, the master can enumerate the bus and then talk to each in turn. The practical consequence for
you: the three probes twist together into one three-conductor cable, and you can run it several metres.</p>
<p>The <strong>alarm logic</strong> is the part that makes it useful rather than annoying. A fridge warms by
several degrees during every defrost cycle, and the door being open for thirty seconds does the same. So the
alarm only fires if a probe is out of range <em>continuously</em> for longer than a normal cycle - fifteen
minutes by default.</p>`,

bom: [
  { id: 'uno', qty: 1 },
  { id: 'ds18b20', qty: 3, note: 'The waterproof stainless probes on a lead. Get 2 m or 3 m leads - fridges are further from a socket than you think.' },
  { id: 'res4k7', qty: 1, note: 'The 1-Wire pull-up. A 10 k works on short runs; on a long cable it does not.' },
  { id: 'ds3231', qty: 1, note: 'DS3231, not DS1307. And check the coin cell is present.' },
  { id: 'rtc-cell', qty: 1, own: true },
  { id: 'sdcard', qty: 1 },
  { id: 'sdcard-8gb', qty: 1, own: true },
  { id: 'lcd1602', qty: 1, note: 'With the I2C backpack, so it shares two wires with the clock.' },
  { id: 'buzzer', qty: 1 },
  { id: 'button', qty: 1, note: 'Silences the alarm for an hour.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2, note: 'For the probe cables, so they can be unplugged when you move the fridge.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'box-abs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'heatshrink' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'uno',  comp: 'uno',     at: [0, 84] },
    { id: 'p1',   comp: 'ds18b20', at: [-70, -18], ry: 180 },
    { id: 'rtc',  comp: 'ds3231',  at: [24, 6], ry: 180 },
    { id: 'sd',   comp: 'sdcard',  at: [24, -40], ry: 180 },
    { id: 'lcd',  comp: 'lcd1602', at: [-16, -86] },
    { id: 'buz',  comp: 'buzzer',  at: [62, -46] },
    { id: 'btn',  comp: 'button',  at: [62, -18] }
  ],
  wires: [
    { from: 'p1.VCC',  to: 'uno.5V',   color: 'red',    note: 'All three probes: red wires together to 5 V' },
    { from: 'p1.GND',  to: 'uno.GND1', color: 'black',  note: 'All three probes: black wires together to ground' },
    { from: 'p1.DATA', to: 'uno.D2',   color: 'yellow', note: 'All three yellow wires to D2, with one 4.7 k pull-up to 5 V' },
    { from: 'rtc.VCC', to: 'uno.5V',   color: 'red',    note: 'Clock power' },
    { from: 'rtc.GND', to: 'uno.GND2', color: 'black',  note: 'Clock ground' },
    { from: 'rtc.SDA', to: 'uno.A4',   color: 'blue',   note: 'I2C data, shared with the LCD' },
    { from: 'rtc.SCL', to: 'uno.A5',   color: 'green',  note: 'I2C clock, shared with the LCD' },
    { from: 'lcd.VCC', to: 'uno.5V',   color: 'red',    note: 'Display power' },
    { from: 'lcd.GND', to: 'uno.GND2', color: 'black',  note: 'Display ground' },
    { from: 'lcd.SDA', to: 'uno.A4',   color: 'blue',   note: 'Same two I2C wires as the clock' },
    { from: 'lcd.SCL', to: 'uno.A5',   color: 'green',  note: 'Same two I2C wires as the clock' },
    { from: 'sd.VCC',  to: 'uno.5V',   color: 'red',    note: 'The module has a regulator and a level shifter, so 5 V is right' },
    { from: 'sd.GND',  to: 'uno.GND3', color: 'black',  note: 'Card ground' },
    { from: 'sd.MISO', to: 'uno.D12',  color: 'white',  note: 'SPI in' },
    { from: 'sd.MOSI', to: 'uno.D11',  color: 'orange', note: 'SPI out' },
    { from: 'sd.SCK',  to: 'uno.D13',  color: 'purple', note: 'SPI clock' },
    { from: 'sd.CS',   to: 'uno.D10',  color: 'grey',   note: 'Chip select' },
    { from: 'buz.+',   to: 'uno.D8',   color: 'orange', note: 'Alarm buzzer' },
    { from: 'buz.-',   to: 'uno.GND3', color: 'black',  note: 'Buzzer ground' },
    { from: 'btn.1A',  to: 'uno.D7',   color: 'yellow', note: 'Silence button, internal pull-up' },
    { from: 'btn.2A',  to: 'uno.GND3', color: 'black',  note: 'Button to ground' }
  ]
},

wireIntro: `<p>The model shows one probe for clarity. All three wire to exactly the same three points - that
is the entire appeal of 1-Wire.</p>`,

wireNotes: `
<div class="note warn"><span class="t">One pull-up for the whole bus, not one per probe</span>
<p>A single 4.7&nbsp;k&Omega; resistor from the data line to 5&nbsp;V. Three of them in parallel is
1.6&nbsp;k&Omega;, which is too strong and makes the bus unreliable in a way that looks like a faulty sensor.</p>
<p>On cable runs over about 5&nbsp;m, drop to 2.2&nbsp;k&Omega; and use twisted cable with the data conductor
twisted against ground.</p></div>

<div class="note tip"><span class="t">Probe wire colours are not always standard</span>
<p>Most waterproof DS18B20 probes are red = VCC, black = GND, yellow = DATA. Some are red/blue/yellow, and a
few cheap ones swap black and yellow. If yours disagrees, a multimeter on the bare chip end will not help -
buy from a listing that shows the colours, or test one probe at a time.</p>
<p>Getting VCC and GND backwards gets the sensor hot within seconds. If a probe warms up in your hand the
moment you power it, disconnect immediately.</p></div>

<div class="note"><span class="t">D10 to D13 are spoken for</span>
<p>The SD card uses the Uno's hardware SPI, which is fixed at D11, D12 and D13, plus a chip select you choose
(D10 here). That leaves D2-D9 for everything else, which is why the probes are on D2 and the buzzer on D8.</p></div>`,

solderSteps: [
  { h: 'Sockets for the three modules',
    body: `<p>6-pin for the clock, 6-pin for the SD module, 4-pin for the LCD's backpack. All removable.</p>` },
  { h: 'The pull-up resistor, near the Uno end',
    body: `<p>4.7&nbsp;k&Omega; from the D2 node to the 5&nbsp;V rail. Put it at the board, not out at a probe -
    it needs to be at one end of the bus, and this is the end you can reach.</p>` },
  { h: 'Screw terminals for the probes',
    body: `<p>Two 2-pin blocks side by side gives you four ways; you need three for the bus (5&nbsp;V, ground,
    data) and one spare. Wire all three probes into the same three terminals.</p>
    <p>Do not tin the probe wire ends - screw terminals and solder do not mix.</p>` },
  { h: 'Join the three probe cables outside the box',
    body: `<p>Strip each of the nine conductors 5&nbsp;mm. Twist the three reds together, tin them as one
    bundle, and sleeve. Same for the blacks and the yellows. Three fat tinned bundles go into the screw
    terminals - or, better, solder each bundle to a short tail and put the tail in the terminal.</p>
    <p>Heat-shrink over each bundle. These joints live behind a fridge and get bumped.</p>` },
  { h: 'Buzzer and button',
    body: `<p>Both trivial. The buzzer is polarised - the longer leg or the one marked <code>+</code> goes to
    D8. Getting it backwards makes it quieter rather than broken, confusingly.</p>` },
  { h: 'Buzz the whole thing out',
    body: `<p>5&nbsp;V to GND: no beep. Data line to 5&nbsp;V should read about 4.7&nbsp;k on the resistance
    range. Each SPI pin to its socket: beep.</p>` },
  { h: 'Test one probe at a time',
    body: `<p>Connect one, run the address scanner, note its address. Add the second, scan again, note which
    address is new. Then the third. Writing down which physical probe has which address is the only way to know
    which is which later, and it takes two minutes now versus an hour of guessing later.</p>` }
],

assembly: [
  { h: 'Set the clock once',
    body: `<p>Upload the time-setting sketch below, run it, then <strong>re-upload the main sketch</strong>.
    If you leave the time-setting sketch on the board, every reset resets the clock to the moment you compiled
    it, which is a genuinely confusing bug to chase.</p>` },
  { h: 'Enumerate the probes and label them',
    body: `<p>Run the scanner, copy the three addresses into the main sketch in the order fridge, freezer, room.
    Put a piece of tape on each probe lead with its position.</p>` },
  { h: 'Format the card FAT32 and check it mounts',
    body: `<p>The main sketch prints <code>SD ok</code> at boot. If it does not, nothing gets logged and you
    will not find out for a week.</p>` },
  { h: 'Route the probes',
    body: `<p>Modern fridge door seals are magnetic and will close over a thin cable without losing their seal -
    run the lead through the hinge side and check the door still shuts flush. Put the fridge probe in a glass of
    water on the middle shelf, not taped to the wall: you want the temperature of the <em>food</em>, which is
    much steadier than the air.</p>
    <p>The freezer probe goes in a tub of frozen water for the same reason.</p>` },
  { h: 'Let it run a week before you touch the thresholds',
    body: `<p>The first day of data will surprise you. Do not adjust anything until you have seen a full week,
    including a weekly shop and a defrost cycle.</p>` }
],

libraries: [
  { name: 'OneWire', by: 'Paul Stoffregen', why: 'The bus protocol.' },
  { name: 'DallasTemperature', by: 'Miles Burton', why: 'Turns the bus into readTemperature() calls.' },
  { name: 'RTClib', by: 'Adafruit', why: 'The DS3231.' },
  { name: 'LiquidCrystal I2C', by: 'Frank de Brabander', why: 'The 16x2 display over I2C.' },
  { name: 'SD', by: 'Arduino', how: 'Built in', why: 'The card.' }
],

code: [
{
  h: 'Find the probe addresses',
  name: 'onewire_scan.ino',
  code: `#include <OneWire.h>
#include <DallasTemperature.h>

OneWire bus(2);
DallasTemperature probes(&bus);

void setup() {
  Serial.begin(9600);
  probes.begin();

  int n = probes.getDeviceCount();
  Serial.print(F("Devices on the bus: "));
  Serial.println(n);
  if (n == 0) {
    Serial.println(F("None. Check the 4.7k pull-up, the data wire, and the probe colours."));
    return;
  }

  for (int i = 0; i < n; i++) {
    DeviceAddress a;
    if (!probes.getAddress(a, i)) continue;
    Serial.print(F("  probe "));
    Serial.print(i);
    Serial.print(F(" = { "));
    for (uint8_t b = 0; b < 8; b++) {
      Serial.print(F("0x"));
      if (a[b] < 16) Serial.print('0');
      Serial.print(a[b], HEX);
      if (b < 7) Serial.print(F(", "));
    }
    Serial.println(F(" }"));
  }
}

void loop() {
  probes.requestTemperatures();
  for (int i = 0; i < probes.getDeviceCount(); i++) {
    Serial.print(probes.getTempCByIndex(i), 2);
    Serial.print(F("  "));
  }
  Serial.println();
  delay(1500);
}`,
  after: `<p>Warm one probe in your hand while this runs and note which column moves. That tells you which index
  is which physical probe - and the index order is not the order you plugged them in, it is sorted by address.
  This is exactly why the main sketch addresses them explicitly rather than by index.</p>`
},
{
  h: 'Set the clock - run once, then replace',
  name: 'set_clock.ino',
  code: `#include <Wire.h>
#include <RTClib.h>

RTC_DS3231 rtc;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  if (!rtc.begin()) {
    Serial.println(F("No DS3231 found"));
    while (1) { }
  }
  // Sets the clock to the moment this sketch was COMPILED, which is
  // close enough for logging. Upload it once, then flash the real sketch.
  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  Serial.println(F("Clock set. Now upload the logger sketch."));
}

void loop() {
  DateTime n = rtc.now();
  Serial.print(n.year()); Serial.print('-');
  Serial.print(n.month()); Serial.print('-');
  Serial.print(n.day()); Serial.print(' ');
  Serial.print(n.hour()); Serial.print(':');
  Serial.println(n.minute());
  delay(2000);
}`
},
{
  h: 'The logger',
  name: 'fridge_logger.ino',
  code: `/* ------------------------------------------------------------------
   Fridge / freezer logger
   Three DS18B20 probes on D2, DS3231 + 16x2 LCD on I2C, SD card on SPI.
   Writes /TEMPLOG.CSV, one line a minute, and alarms on sustained range
   violations.
   ------------------------------------------------------------------ */

#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <RTClib.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
#include <SD.h>

// ---- pins ------------------------------------------------------------
#define ONE_WIRE_PIN  2
#define SD_CS        10
#define BUZZER_PIN    8
#define BUTTON_PIN    7
#define LCD_ADDR   0x27      // some backpacks are 0x3F

// ---- probe addresses, from the scanner sketch ------------------------
DeviceAddress PROBE_FRIDGE  = { 0x28, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };
DeviceAddress PROBE_FREEZER = { 0x28, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01 };
DeviceAddress PROBE_ROOM    = { 0x28, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02 };

// ---- alarm limits ----------------------------------------------------
const float FRIDGE_MAX  =  7.0;
const float FREEZER_MAX = -15.0;
const unsigned long GRACE_MS   = 15UL * 60UL * 1000UL;   // defrost tolerance
const unsigned long SILENCE_MS = 60UL * 60UL * 1000UL;   // button mutes an hour
const unsigned long LOG_MS     = 60UL * 1000UL;
// ----------------------------------------------------------------------

OneWire bus(ONE_WIRE_PIN);
DallasTemperature probes(&bus);
RTC_DS3231 rtc;
LiquidCrystal_I2C lcd(LCD_ADDR, 16, 2);

float tFridge = NAN, tFreezer = NAN, tRoom = NAN;
unsigned long fridgeBadSince = 0, freezerBadSince = 0;
unsigned long silencedUntil = 0, lastLog = 0, lastRead = 0;
bool sdOk = false;

void setup() {
  Serial.begin(9600);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  lcd.init();
  lcd.backlight();
  lcd.print(F("starting..."));

  probes.begin();
  probes.setResolution(12);          // 12 bits = 0.0625 C, 750 ms a reading

  if (!rtc.begin()) Serial.println(F("no RTC"));
  if (rtc.lostPower()) Serial.println(F("RTC lost power - times will be wrong"));

  sdOk = SD.begin(SD_CS);
  Serial.println(sdOk ? F("SD ok") : F("SD FAILED"));

  if (sdOk && !SD.exists("TEMPLOG.CSV")) {
    File f = SD.open("TEMPLOG.CSV", FILE_WRITE);
    if (f) {
      f.println(F("datetime,fridge_c,freezer_c,room_c,alarm"));
      f.close();
    }
  }
  lastRead = millis() - 5000;
}

void loop() {
  if (millis() - lastRead > 5000) {
    lastRead = millis();
    readProbes();
    checkAlarms();
    draw();
  }

  if (millis() - lastLog > LOG_MS) {
    lastLog = millis();
    logLine();
  }

  if (digitalRead(BUTTON_PIN) == LOW) {
    silencedUntil = millis() + SILENCE_MS;
    noTone(BUZZER_PIN);
    lcd.setCursor(0, 1);
    lcd.print(F("alarm silenced  "));
    delay(400);
  }

  soundAlarm();
}

/* ---------------------------------------------------------------------- */
void readProbes() {
  probes.requestTemperatures();
  tFridge  = probes.getTempC(PROBE_FRIDGE);
  tFreezer = probes.getTempC(PROBE_FREEZER);
  tRoom    = probes.getTempC(PROBE_ROOM);
}

bool valid(float t) { return t > -60 && t < 90; }   // -127 means "not found"

void checkAlarms() {
  unsigned long now = millis();

  if (valid(tFridge) && tFridge > FRIDGE_MAX) {
    if (!fridgeBadSince) fridgeBadSince = now;
  } else {
    fridgeBadSince = 0;
  }

  if (valid(tFreezer) && tFreezer > FREEZER_MAX) {
    if (!freezerBadSince) freezerBadSince = now;
  } else {
    freezerBadSince = 0;
  }
}

bool alarming() {
  unsigned long now = millis();
  bool f = fridgeBadSince  && (now - fridgeBadSince  > GRACE_MS);
  bool z = freezerBadSince && (now - freezerBadSince > GRACE_MS);
  return f || z;
}

void soundAlarm() {
  if (!alarming() || millis() < silencedUntil) { noTone(BUZZER_PIN); return; }
  // two short chirps every four seconds - noticeable, not maddening
  unsigned long phase = millis() % 4000;
  if (phase < 120 || (phase > 250 && phase < 370)) tone(BUZZER_PIN, 2400);
  else noTone(BUZZER_PIN);
}

/* ---------------------------------------------------------------------- */
void logLine() {
  if (!sdOk) return;
  DateTime n = rtc.now();

  File f = SD.open("TEMPLOG.CSV", FILE_WRITE);
  if (!f) { sdOk = false; return; }

  char stamp[20];
  snprintf(stamp, sizeof(stamp), "%04d-%02d-%02d %02d:%02d:%02d",
           n.year(), n.month(), n.day(), n.hour(), n.minute(), n.second());

  f.print(stamp);           f.print(',');
  f.print(tFridge, 2);      f.print(',');
  f.print(tFreezer, 2);     f.print(',');
  f.print(tRoom, 2);        f.print(',');
  f.println(alarming() ? 1 : 0);
  f.close();                // close every time: a power cut mid-write
                            // otherwise loses everything since boot

  Serial.print(stamp);
  Serial.print(F("  "));
  Serial.print(tFridge, 1);
  Serial.print(F(" / "));
  Serial.println(tFreezer, 1);
}

void draw() {
  lcd.setCursor(0, 0);
  lcd.print(F("F"));
  printTemp(tFridge);
  lcd.print(F(" Z"));
  printTemp(tFreezer);
  lcd.print(F("   "));

  lcd.setCursor(0, 1);
  if (!sdOk)             lcd.print(F("SD CARD FAILED  "));
  else if (alarming())   lcd.print(F("** TOO WARM **  "));
  else if (fridgeBadSince || freezerBadSince) lcd.print(F("warming (grace) "));
  else {
    lcd.print(F("room "));
    lcd.print(tRoom, 1);
    lcd.print(F("C      "));
  }
}

void printTemp(float t) {
  if (!valid(t)) { lcd.print(F("--.-")); return; }
  if (t >= 0 && t < 10) lcd.print(' ');
  lcd.print(t, 1);
}`,
  after: `<p>Opening and closing the file on every single line looks wasteful, and it is - about 40&nbsp;ms a
  minute. It is also the difference between losing one line to a power cut and losing everything since the last
  reboot, because data sits in the card's buffer until the file is closed. For a logger that runs for months
  unattended, that trade is obviously right.</p>`
}],

upload: `
<p>Uno, correct port. Upload the scanner first, then the clock setter, then the logger - in that order, and
remember to move off the clock setter.</p>
<p>At boot the Serial Monitor should print <code>SD ok</code> and then a timestamped line every minute.</p>`,

tune: [
  { h: 'Set thresholds from your own data, not from a book',
    body: `<p>Run it for a week first. Look at the CSV in a spreadsheet and chart the fridge column - you will
    see the compressor cycle as a sawtooth, and the door openings as spikes. Set <code>FRIDGE_MAX</code> above
    the normal peaks, not above the average.</p>` },
  { h: 'Tune the grace period to your defrost cycle',
    body: `<p>Most fridges defrost every 6-12 hours for 20-30 minutes. If the chart shows a regular warm
    excursion, set <code>GRACE_MS</code> longer than it. Fifteen minutes suits most; frost-free freezers can
    need thirty.</p>` },
  { h: 'Put probes in liquid, not air',
    body: `<p>A probe in a glass of water reads the thermal mass the food actually has. A probe in air reads
    every door opening as a crisis. This single change removes most false alarms.</p>` },
  { h: 'Resolution versus speed',
    body: `<p><code>setResolution(12)</code> gives 0.0625&nbsp;&deg;C and takes 750&nbsp;ms per conversion.
    Drop to 10 bits (0.25&nbsp;&deg;C, 190&nbsp;ms) if you want faster updates; for a fridge, 12 bits every
    five seconds is fine and the precision is nice in the chart.</p>` },
  { h: 'Charting the CSV',
    body: `<p>Open it in a spreadsheet, select all four columns, insert a line chart. If the date column comes
    in as text, use a text-to-columns import and tell it the format - the <code>YYYY-MM-DD HH:MM:SS</code>
    format is chosen because almost everything parses it.</p>` }
],

trouble: [
  { q: 'Scanner finds zero devices',
    a: `No pull-up, wrong pin, or the probe's wire colours are not what you assumed. Measure: the data line
    should sit at about 5&nbsp;V when idle. If it sits at 0&nbsp;V, the pull-up is missing or the data wire is
    actually ground.` },
  { q: 'All probes read -127',
    a: `That is the library's "not found" value. The bus has broken since <code>begin()</code> - usually a
    screw terminal that has worked loose, or a probe unplugged.` },
  { q: 'Finds 3 devices but one reads 85.0 exactly',
    a: `85.00 is the DS18B20 power-on default: it has been asked for a temperature before it finished
    converting. Give it more time between <code>requestTemperatures()</code> and reading, or check it has a
    solid 5&nbsp;V - probes at the end of a long thin cable brown out.` },
  { q: 'Works with one probe, fails with three',
    a: `Pull-up too weak for the combined capacitance. Drop to 2.2&nbsp;k&Omega;. Also check you did not fit
    three pull-ups.` },
  { q: 'SD card writes for an hour, then stops',
    a: `Card full of a huge file, a flaky card, or the 5&nbsp;V sagging when the card writes (they pull
    100&nbsp;mA in bursts). Add a 100&nbsp;&micro;F capacitor at the module.` },
  { q: 'Timestamps are all 2000-01-01',
    a: `The RTC lost power and its coin cell is dead or missing. Replace the CR2032 and re-run the clock
    setter.` },
  { q: 'LCD shows blocks or nothing',
    a: `Wrong I2C address - try <code>0x3F</code> - or the contrast pot on the back of the backpack is at one
    end. Turn the little blue screw until the text appears.` },
  { q: 'Alarm goes off every night',
    a: `That is the defrost cycle, and your grace period is too short. Look at the CSV to confirm before
    changing anything - if it is not a regular interval, the fridge may genuinely have a problem.` }
],

next: `
<ul>
  <li><strong>Send the alarm somewhere.</strong> Swap the Uno for an ESP32 and push a notification - a warm
  freezer at 2&nbsp;am is exactly the case where a buzzer in the kitchen helps nobody.</li>
  <li><strong>Add a door sensor</strong> (a reed switch on the fridge door) and log it alongside, so you can
  separate "door left open" from "compressor failed" in the data.</li>
  <li><strong>Watch a heating system instead</strong>: the same three probes on a boiler flow, return and room
  will tell you more about your heating than any smart thermostat's app.</li>
  <li><strong>Add power monitoring</strong> with the <a href="project.html?p=mains-energy-monitor">energy
  monitor</a> and you can see the compressor cycling in the current draw.</li>
</ul>`
});
