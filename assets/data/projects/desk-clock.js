/* DS3231 + TM1637 desk clock with LDR auto-dimming and an alarm. */
AB.addProject({
slug: 'desk-clock',
title: 'Desk clock that dims itself',
cat: 'display',
level: 2,
time: '2 hours',
solder: true,
board: 'Nano',
tags: ['ds3231', 'tm1637', 'rtc', 'ldr', 'alarm', 'clock', 'nano'],
blurb: 'Big red digits, accurate to a minute a year, that fade down at night instead of burning a hole in your bedroom ceiling.',

skills: ['RTC chips', '7-segment drivers', 'Brightness control', 'Button menus', 'EEPROM settings'],

intro: `
<p>Every cheap digital clock has the same fault: it is either too dim to read across a room or bright enough to
read a book by at 3&nbsp;am. This one measures the room light and sets its own brightness, from full daylight
down to one step above off.</p>
<p>It also keeps time properly. A DS3231 is temperature-compensated and drifts about a minute a year; the
DS1307 that most kits ship drifts that much in a fortnight, and an Arduino keeping time on its own crystal
drifts it in a day.</p>`,

what: [
  'Show the time on a four-digit display with a blinking colon, in 24- or 12-hour format.',
  'Set its own brightness from an LDR, in eight steps, with smoothing so a passing shadow does not flicker it.',
  'Show the temperature for three seconds every minute, read from the clock chip itself.',
  'Keep one alarm, set with two buttons, stored in EEPROM so it survives a power cut.',
  'Keep the time through a power cut too, on a coin cell that lasts years.'
],

how: `
<p>The <strong>DS3231</strong> contains a crystal oscillator, a temperature sensor and a small correction
table. As a quartz crystal warms it runs slightly slow; the DS3231 measures its own temperature every 64
seconds and adjusts, which is the whole reason it holds a minute a year rather than a minute a week. That
temperature reading is also readable over I2C, which is why this clock can show the room temperature with no
extra sensor.</p>
<p>The <strong>TM1637</strong> drives four 7-segment digits over a two-wire protocol that looks like I2C but
is not - it has no addressing and no acknowledgement scheme, so it cannot share the bus with the clock. It also
has a hardware brightness control, eight steps, which is what makes the auto-dimming smooth rather than a PWM
flicker.</p>
<p>The <strong>LDR</strong> is one half of a voltage divider. What matters here is that human perception of
brightness is logarithmic while the LDR's response is roughly logarithmic too - so a simple mapping from the
analog reading to the eight brightness steps actually feels right, which is unusually convenient.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'ds3231', qty: 1, note: 'DS3231, not DS1307. Check the coin cell is included and is not already flat.' },
  { id: 'rtc-cell', qty: 1, own: true },
  { id: 'tm1637', qty: 1, note: 'The 0.56 inch four-digit module with a colon. Red is the classic; white and blue exist and are dimmer.' },
  { id: 'ldr', qty: 1 },
  { id: 'res10k', qty: 1, note: 'Bottom half of the LDR divider.' },
  { id: 'button', qty: 3, note: 'Mode, up, down.' },
  { id: 'buzzer', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'box-abs', qty: 1 },
  { id: 'psu5v3a', qty: 1, own: true, note: 'Any USB charger. The clock draws under 100 mA.' },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',   at: [0, 0] },
    { id: 'disp', comp: 'tm1637', at: [0, -54], ry: 180 },
    { id: 'rtc',  comp: 'ds3231', at: [-52, 38], ry: 180 },
    { id: 'ldr',  comp: 'ldr',    at: [34, -24] },
    { id: 'b1',   comp: 'button', at: [40, 32] },
    { id: 'b2',   comp: 'button', at: [52, 32] },
    { id: 'b3',   comp: 'button', at: [64, 32] },
    { id: 'buz',  comp: 'buzzer', at: [16, 44] }
  ],
  wires: [
    { from: 'disp.VCC', to: 'nano.5V',   color: 'red',    note: 'Display power' },
    { from: 'disp.GND', to: 'nano.GND',  color: 'black',  note: 'Display ground' },
    { from: 'disp.CLK', to: 'nano.D2',   color: 'green',  note: 'TM1637 clock. Any digital pin - not the I2C ones' },
    { from: 'disp.DIO', to: 'nano.D3',   color: 'blue',   note: 'TM1637 data' },
    { from: 'rtc.VCC',  to: 'nano.5V',   color: 'red',    note: 'Clock power' },
    { from: 'rtc.GND',  to: 'nano.GND2', color: 'black',  note: 'Clock ground' },
    { from: 'rtc.SDA',  to: 'nano.A4',   color: 'yellow', note: 'I2C data' },
    { from: 'rtc.SCL',  to: 'nano.A5',   color: 'orange', note: 'I2C clock' },
    { from: 'ldr.A',    to: 'nano.5V',   color: 'red',    note: 'LDR to 5 V, top of the divider' },
    { from: 'ldr.B',    to: 'nano.A0',   color: 'white',  note: 'Divider junction, with a 10 k to ground' },
    { from: 'b1.1A',    to: 'nano.D5',   color: 'purple', note: 'MODE button, internal pull-up' },
    { from: 'b1.2A',    to: 'nano.GND2', color: 'black',  note: 'To ground' },
    { from: 'b2.1A',    to: 'nano.D6',   color: 'purple', note: 'UP button' },
    { from: 'b2.2A',    to: 'nano.GND2', color: 'black',  note: 'To ground' },
    { from: 'b3.1A',    to: 'nano.D7',   color: 'purple', note: 'DOWN button' },
    { from: 'b3.2A',    to: 'nano.GND2', color: 'black',  note: 'To ground' },
    { from: 'buz.+',    to: 'nano.D9',   color: 'grey',   note: 'Alarm buzzer' },
    { from: 'buz.-',    to: 'nano.GND2', color: 'black',  note: 'Buzzer ground' }
  ]
},

wireNotes: `
<div class="note tip"><span class="t">The TM1637 does not go on the I2C bus</span>
<p>It uses two wires and they are called CLK and DIO, which makes it look like I2C. It is not - there are no
addresses and no acknowledge bits, so it cannot share the bus with the DS3231. Give it two ordinary digital
pins, as here.</p></div>

<div class="note"><span class="t">Buttons need no resistors</span>
<p>One leg to the pin, one to ground, and <code>INPUT_PULLUP</code> in the sketch. A tactile button's four legs
are two pairs already joined internally - put the wires on legs that are diagonally opposite and you can never
get the pairing wrong.</p></div>

<div class="note warn"><span class="t">Keep the LDR away from the display</span>
<p>If the LDR can see its own digits, it brightens the display, which brightens the LDR, which brightens the
display. Mount it on the back or side of the enclosure, facing the room.</p></div>`,

solderSteps: [
  { h: 'Sockets for the Nano and the two modules',
    body: `<p>Two 15-pin strips for the Nano, a 4-pin for the display, a 6-pin for the clock. Use the module
    itself as the alignment jig each time, tack the end pins, check square from the side, then complete.</p>` },
  { h: 'Display on flying leads, or on the board?',
    body: `<p>The display wants to be behind a window in the front of the box; the rest wants to be at the back.
    Four wires of 120&nbsp;mm, twisted into a small loom, is much easier to build than trying to get a
    board-mounted display to line up with a hole.</p>
    <p>Tin both ends of each wire before soldering, and sleeve the display-end joints.</p>` },
  { h: 'LDR divider',
    body: `<p>LDR from 5&nbsp;V to a spare hole, 10&nbsp;k from that hole to ground, a wire from the hole to A0.
    The LDR has no polarity. Mount it on two long legs so it can poke through a 5&nbsp;mm hole in the case.</p>` },
  { h: 'Three buttons in a row',
    body: `<p>Space them at least 10&nbsp;mm apart, or your thumb will press two. Solder one leg of each to a
    shared ground rail and the diagonal leg to its own signal wire.</p>
    <p>Tactile buttons sit flush against the board; if one is not, reheat a leg and press it down.</p>` },
  { h: 'Buzzer',
    body: `<p>Polarised - the marked or longer leg to D9.</p>` },
  { h: 'Check and power',
    body: `<p>5&nbsp;V to GND: no beep. Each button pin to ground: no beep until pressed, then beep. Then power
    up: the display should light immediately, even before the clock is set.</p>` }
],

assembly: [
  { h: 'Set the time once',
    body: `<p>Upload the setter sketch, run it, confirm the Serial Monitor shows the right time, then upload the
    clock sketch. Do not leave the setter on the board.</p>` },
  { h: 'Check the display address and the digit order',
    body: `<p>Some TM1637 modules number their digits right to left. If the time shows backwards, the library
    has a display-flip option, or you can simply reverse the four digits when you build the array.</p>` },
  { h: 'Calibrate the light steps',
    body: `<p>See the tuning section - two readings, two numbers.</p>` },
  { h: 'Build the box around the display',
    body: `<p>Cut a rectangular window and glue a piece of dark red acrylic or a strip of theatre gel behind it.
    A red filter over red LEDs raises the contrast enormously and hides the dark segments, which is the whole
    reason old clock radios look the way they do.</p>` },
  { h: 'Leave it on for a week and then check it',
    body: `<p>Against your phone. A DS3231 should be within a couple of seconds. If it has drifted by minutes,
    it is a DS1307 with a DS3231 sticker, which is a genuinely common thing to be sold.</p>` }
],

libraries: [
  { name: 'RTClib', by: 'Adafruit', why: 'Talks to the DS3231, including its temperature register.' },
  { name: 'TM1637Display', by: 'Avishay Orpaz', why: 'The seven-segment driver. Search for "TM1637" and pick the one by Avishay Orpaz.' },
  { name: 'EEPROM', by: 'Arduino', how: 'Built in', why: 'Stores the alarm.' }
],

code: [
{
  h: 'Set the time - run once',
  name: 'clock_set.ino',
  code: `#include <Wire.h>
#include <RTClib.h>

RTC_DS3231 rtc;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  if (!rtc.begin()) { Serial.println(F("no DS3231")); while (1) { } }

  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));

  // Uncomment to set an exact time instead:
  // rtc.adjust(DateTime(2026, 9, 14, 21, 30, 0));

  Serial.println(F("set - now upload the clock sketch"));
}

void loop() {
  DateTime n = rtc.now();
  Serial.printf("%02d:%02d:%02d  %.1f C\\n", n.hour(), n.minute(), n.second(),
                rtc.getTemperature());
  delay(1000);
}`,
  after: `<p><code>__DATE__</code> and <code>__TIME__</code> are the moment the sketch was <em>compiled</em>, so
  the clock ends up a few seconds behind - roughly the upload time. Good enough for a desk clock; use the
  explicit form if you want it exact.</p>`
},
{
  h: 'The clock',
  name: 'desk_clock.ino',
  code: `/* ------------------------------------------------------------------
   Desk clock with automatic brightness
   DS3231 on I2C, TM1637 on D2/D3, LDR on A0, three buttons, buzzer on D9.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <RTClib.h>
#include <TM1637Display.h>
#include <EEPROM.h>

// ---- pins ------------------------------------------------------------
#define CLK_PIN     2
#define DIO_PIN     3
#define BTN_MODE    5
#define BTN_UP      6
#define BTN_DOWN    7
#define BUZZER_PIN  9
#define LDR_PIN    A0

// ---- behaviour -------------------------------------------------------
#define TWENTY_FOUR_HOUR  true
#define SHOW_TEMP_EVERY   60000UL    // show the temperature once a minute
#define TEMP_FOR          3000UL
#define LDR_DARK          80         // your reading in a dark room
#define LDR_BRIGHT        700        // your reading in daylight
#define ALARM_MINUTES     60         // how long the alarm sounds
// ----------------------------------------------------------------------

#define EE_MAGIC 0x3C
#define EE_ADDR   0

RTC_DS3231 rtc;
TM1637Display display(CLK_PIN, DIO_PIN);

enum Mode { SHOW_TIME, SET_HOUR, SET_MIN, SET_ALARM_H, SET_ALARM_M, TOGGLE_ALARM };
Mode mode = SHOW_TIME;

byte alarmHour = 7, alarmMin = 0;
bool alarmOn = false;
bool alarmFiring = false;
unsigned long alarmStarted = 0;
unsigned long lastTempShow = 0, modeEntered = 0;
int smoothedLight = 400;

void setup() {
  Serial.begin(9600);
  pinMode(BTN_MODE, INPUT_PULLUP);
  pinMode(BTN_UP,   INPUT_PULLUP);
  pinMode(BTN_DOWN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);

  display.setBrightness(4);
  display.showNumberDecEx(0, 0b01000000, true);

  if (!rtc.begin()) {
    Serial.println(F("no RTC"));
    display.setSegments((uint8_t[]){ 0x79, 0x50, 0x50, 0x00 });   // "Err"
    while (1) { }
  }

  if (EEPROM.read(EE_ADDR) == EE_MAGIC) {
    alarmHour = EEPROM.read(EE_ADDR + 1);
    alarmMin  = EEPROM.read(EE_ADDR + 2);
    alarmOn   = EEPROM.read(EE_ADDR + 3);
  }
}

void loop() {
  handleButtons();
  updateBrightness();

  DateTime now = rtc.now();
  checkAlarm(now);

  switch (mode) {
    case SHOW_TIME:    showTimeOrTemp(now); break;
    case SET_HOUR:     blinkPair(now.hour(), now.minute(), true);  break;
    case SET_MIN:      blinkPair(now.hour(), now.minute(), false); break;
    case SET_ALARM_H:  blinkPair(alarmHour, alarmMin, true);  break;
    case SET_ALARM_M:  blinkPair(alarmHour, alarmMin, false); break;
    case TOGGLE_ALARM: showAlarmState(); break;
  }

  if (alarmFiring) soundAlarm();
  delay(40);
}

/* --- display ---------------------------------------------------------- */
void showTimeOrTemp(DateTime now) {
  if (millis() - lastTempShow > SHOW_TEMP_EVERY) {
    if (millis() - lastTempShow < SHOW_TEMP_EVERY + TEMP_FOR) {
      int t = (int)(rtc.getTemperature() * 10);
      display.showNumberDecEx(t, 0b00100000, false);   // decimal point
      return;
    }
    lastTempShow = millis();
  }

  int h = now.hour();
  if (!TWENTY_FOUR_HOUR) { h = h % 12; if (h == 0) h = 12; }

  // colon on for the first half of each second
  uint8_t dots = (now.second() % 2 == 0) ? 0b01000000 : 0;
  display.showNumberDecEx(h * 100 + now.minute(), dots, TWENTY_FOUR_HOUR);
}

void blinkPair(int h, int m, bool blinkHours) {
  bool on = (millis() / 350) % 2;
  if ((blinkHours && on) || (!blinkHours && !on)) {
    display.showNumberDecEx(h * 100 + m, 0b01000000, true);
  } else if (blinkHours) {
    display.showNumberDecEx(m, 0b01000000, true);      // hours blanked
  } else {
    display.showNumberDecEx(h * 100, 0b01000000, true);
  }
}

void showAlarmState() {
  // "on " / "oFF"
  if (alarmOn) display.setSegments((uint8_t[]){ 0x00, 0x3F, 0x54, 0x00 });
  else         display.setSegments((uint8_t[]){ 0x00, 0x3F, 0x71, 0x71 });
}

/* --- brightness ------------------------------------------------------- */
void updateBrightness() {
  int raw = analogRead(LDR_PIN);
  // heavy smoothing: a hand passing over should not make it flicker
  smoothedLight = (smoothedLight * 15 + raw) / 16;

  int level = map(smoothedLight, LDR_DARK, LDR_BRIGHT, 0, 7);
  level = constrain(level, 0, 7);
  display.setBrightness(level, true);
}

/* --- buttons ---------------------------------------------------------- */
bool pressed(byte pin) {
  if (digitalRead(pin) == HIGH) return false;
  delay(25);
  if (digitalRead(pin) == HIGH) return false;
  unsigned long t0 = millis();
  while (digitalRead(pin) == LOW && millis() - t0 < 2000) { }
  return true;
}

void handleButtons() {
  if (alarmFiring && (pressed(BTN_MODE) || pressed(BTN_UP) || pressed(BTN_DOWN))) {
    alarmFiring = false;
    noTone(BUZZER_PIN);
    return;
  }

  if (pressed(BTN_MODE)) {
    mode = (Mode)((mode + 1) % 6);
    modeEntered = millis();
    if (mode == SHOW_TIME) saveAlarm();
    return;
  }

  int delta = 0;
  if (pressed(BTN_UP))   delta = 1;
  if (pressed(BTN_DOWN)) delta = -1;
  if (!delta) {
    // drop back to the clock if nobody touches it for 15 seconds
    if (mode != SHOW_TIME && millis() - modeEntered > 15000) {
      saveAlarm();
      mode = SHOW_TIME;
    }
    return;
  }
  modeEntered = millis();

  DateTime n = rtc.now();
  switch (mode) {
    case SET_HOUR:
      rtc.adjust(DateTime(n.year(), n.month(), n.day(),
                          (n.hour() + 24 + delta) % 24, n.minute(), 0));
      break;
    case SET_MIN:
      rtc.adjust(DateTime(n.year(), n.month(), n.day(),
                          n.hour(), (n.minute() + 60 + delta) % 60, 0));
      break;
    case SET_ALARM_H:  alarmHour = (alarmHour + 24 + delta) % 24; break;
    case SET_ALARM_M:  alarmMin  = (alarmMin  + 60 + delta) % 60; break;
    case TOGGLE_ALARM: alarmOn = !alarmOn; break;
    default: break;
  }
}

void saveAlarm() {
  EEPROM.update(EE_ADDR,     EE_MAGIC);
  EEPROM.update(EE_ADDR + 1, alarmHour);
  EEPROM.update(EE_ADDR + 2, alarmMin);
  EEPROM.update(EE_ADDR + 3, alarmOn);
}

/* --- alarm ------------------------------------------------------------ */
void checkAlarm(DateTime now) {
  static int lastMinute = -1;
  if (now.minute() == lastMinute) return;
  lastMinute = now.minute();

  if (alarmOn && now.hour() == alarmHour && now.minute() == alarmMin) {
    alarmFiring = true;
    alarmStarted = millis();
  }
  if (alarmFiring && millis() - alarmStarted > ALARM_MINUTES * 60000UL) {
    alarmFiring = false;
    noTone(BUZZER_PIN);
  }
}

void soundAlarm() {
  // rising urgency: short beeps that get closer together
  unsigned long elapsed = millis() - alarmStarted;
  unsigned long gap = max(300UL, 1500UL - elapsed / 40);
  if (millis() % gap < 90) tone(BUZZER_PIN, 2600);
  else noTone(BUZZER_PIN);
}`,
  after: `<p>The <code>setBrightness(level, true)</code> second argument is the display on/off flag. Level 0 is
  the dimmest the hardware will go and is still visible in a dark room; if that is too bright for a bedroom,
  pass <code>false</code> below a threshold to blank it entirely and let the colon alone show the clock is
  alive.</p>`
}],

upload: `<p>Nano, correct port. Setter sketch first, then the clock. If the upload times out, try
<strong>Tools &rarr; Processor &rarr; ATmega328P (Old Bootloader)</strong>.</p>`,

tune: [
  { h: 'Calibrate the two light values',
    body: `<p>Add <code>Serial.println(analogRead(A0));</code> temporarily. Note the value in a dark room and
    the value in daylight, and put them into <code>LDR_DARK</code> and <code>LDR_BRIGHT</code>. Getting these
    right is the whole difference between a clock that feels expensive and one that flickers.</p>` },
  { h: 'If it hunts between brightness levels',
    body: `<p>Increase the smoothing: change <code>(smoothedLight * 15 + raw) / 16</code> to
    <code>* 31 + raw) / 32</code>. That is a longer time constant, so the display takes a few seconds to
    respond, which is what you want.</p>` },
  { h: 'Twelve-hour mode',
    body: `<p>Set <code>TWENTY_FOUR_HOUR</code> to <code>false</code>. Note the leading-zero flag in
    <code>showNumberDecEx</code> uses the same constant, so 9:05 shows as <code>9:05</code> rather than
    <code>09:05</code>, which is the convention people expect.</p>` },
  { h: 'The temperature reads high',
    body: `<p>The DS3231 measures its own die, which sits in your warm enclosure next to a Nano. Two degrees
    high is normal. Subtract a fixed offset if it bothers you, and write down why in a comment.</p>` },
  { h: 'A gentler alarm',
    body: `<p>Replace the buzzer with a small speaker and play a rising scale with <code>tone()</code>, or
    fade the display up over ten minutes before the alarm as a light cue. Both are more civilised than a
    2600&nbsp;Hz piezo.</p>` }
],

trouble: [
  { q: 'Display shows nothing',
    a: `Check CLK and DIO are not swapped, and that the module has 5&nbsp;V. Note some TM1637 boards want
    3.3&nbsp;V - check the silkscreen. The library does not report errors, so a blank display is the only
    symptom you get.` },
  { q: 'Digits appear in the wrong order',
    a: `Some modules number their digits from the right. Either use the library's flip option or reverse the
    array you pass to <code>setSegments</code>.` },
  { q: 'Time resets to the compile time on every power-up',
    a: `You left the setter sketch on the board, or the coin cell is dead or inserted backwards. The cell's
    positive face is the wide flat one, and it goes upwards on almost every DS3231 module.` },
  { q: 'Time drifts minutes per week',
    a: `You have a DS1307. Look at the chip marking through a magnifier. DS3231 modules have a rectangular
    crystal-free chip and a temperature sensor built in; DS1307 boards have a visible silver crystal next to
    the chip.` },
  { q: 'Display flickers between two brightness levels',
    a: `Not enough smoothing, or the LDR can see the display. Fix the mounting first.` },
  { q: 'Buttons trigger twice or do nothing',
    a: `The <code>pressed()</code> function waits for release with a 2-second cap. If your buttons are noisy,
    raise the 25&nbsp;ms debounce to 50. If they do nothing, check you are on diagonal legs of the tactile
    switch.` },
  { q: 'Alarm goes off at the right minute, 60 times',
    a: `The <code>lastMinute</code> guard should stop that. If you have changed the loop timing, make sure
    <code>checkAlarm</code> is still called with a real <code>DateTime</code> and the static variable has not
    been moved.` }
],

next: `
<ul>
  <li><strong>Go bigger</strong>: four 1.2 inch seven-segment digits driven by a MAX7219 make a clock readable
  from the other end of the house.</li>
  <li><strong>Get the time from the internet</strong> with an ESP8266 and NTP, and you can drop the RTC
  entirely - though then a Wi-Fi outage stops your clock, which is a real trade.</li>
  <li><strong>Add a second alarm</strong> and a weekday/weekend distinction. The EEPROM layout already has room.</li>
  <li><strong>Word clock</strong>: the same DS3231 driving a grid of WS2812s behind a laser-cut stencil. A
  weekend project with a beautiful result.</li>
</ul>`
});
