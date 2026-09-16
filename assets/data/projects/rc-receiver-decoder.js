/* Reading a real RC transmitter: PWM, PPM, SBUS and CRSF, and why they keep replacing each other. */
AB.addProject({
slug: 'rc-receiver-decoder',
title: 'Decode an RC receiver',
cat: 'drones',
level: 2,
time: '4 hours',
solder: false,
board: 'ESP32',
tags: ['rc', 'sbus', 'crsf', 'ppm', 'expresslrs', 'receiver', 'failsafe', 'no soldering'],
blurb: 'Take sixteen channels off a proper RC transmitter into your own code. The bridge between hobby radio gear and everything you build - and the project where failsafe stops being a word.',

skills: ['RC protocols', 'Inverted serial', 'Channel scaling', 'Failsafe detection', 'Link quality', 'Interrupt timing'],

intro: `
<p>An RC transmitter is a genuinely excellent input device: sixteen channels, proportional sticks with real
gimbals, switches you can find without looking, kilometres of range, and a failsafe system designed by people
whose mistakes fell out of the sky.</p>
<p>All of that is available to an Arduino for the cost of a $12 receiver, and once you can decode one, every
other project in this theme becomes controllable. This guide covers the four protocols you will meet and why
the industry keeps replacing them.</p>
<p>It also covers the thing that separates RC gear from a hobby remote: <strong>failsafe is a protocol
feature, not something you bolt on</strong>. The receiver knows when it has lost the transmitter and says so,
and your code has to act on it. A rover that keeps its last throttle command after the radio dies is a rover
in a hedge.</p>`,

what: [
  'Read up to sixteen proportional channels from a modern RC receiver.',
  'Handle SBUS, CRSF, PPM and plain PWM, and know which to use when.',
  'Detect a lost link reliably and immediately, rather than by guessing at stale data.',
  'Read link quality and RSSI back from the receiver, on protocols that carry it.',
  'Scale stick positions to whatever your project needs, with a dead band and endpoints.',
  'Send telemetry back to the transmitter, so battery voltage shows on the radio screen.'
],

how: `
<p><strong>Four protocols, in the order they were invented.</strong></p>
<p><strong>PWM</strong> is the original: one wire per channel, a pulse of 1000-2000&nbsp;microseconds every
20&nbsp;ms. Eight channels means eight wires. Simple, universal, and the reason old receivers are covered in
servo leads. Read it with <code>pulseIn()</code>, which blocks - an annoyance that gets worse with each
channel.</p>
<p><strong>PPM</strong> puts all the channels on one wire as a train of pulses, separated by gaps whose length
encodes each value, with a long gap to mark the frame start. Eight channels on one pin. Read it with an
interrupt and a <code>micros()</code> timestamp. Still analogue in spirit, and slow at 50&nbsp;Hz.</p>
<p><strong>SBUS</strong> is Futaba's digital protocol and the first sensible one: 16 channels of 11-bit
resolution in a 25-byte frame at 100&nbsp;kHz, every 7 to 14&nbsp;ms. It is a UART protocol - and an awkward
one, because it runs at <strong>100000 baud, 8E2, inverted</strong>.</p>
<p><strong>CRSF</strong> (Crossfire, and what ExpressLRS uses) is the current answer: 420&nbsp;kbaud, not
inverted, bidirectional, 16 channels, and it carries telemetry back to the transmitter on the same wire. Link
quality and RSSI come as ordinary packets. If you are buying new, buy ExpressLRS and use CRSF.</p>

<p><strong>Inverted serial, which is SBUS's one real difficulty.</strong> SBUS idles low and its bits are
inverted relative to normal UART. Three ways round it:</p>
<ul>
  <li><strong>An ESP32</strong>, whose UARTs can invert in hardware - one line of configuration. This is why
  the project uses one.</li>
  <li><strong>An inverter</strong> - one transistor and two resistors, or a 74HC14.</li>
  <li><strong>An "SBUS non-inverted" pad</strong>, which many receivers have. Check yours before building a
  circuit.</li>
</ul>
<p>CRSF is not inverted, which is one of several reasons it is pleasanter to work with.</p>

<p><strong>Failsafe, properly.</strong> Every RC protocol carries an explicit failsafe flag - the receiver
setting it when it has not heard from the transmitter for a defined time. SBUS has a dedicated bit; CRSF stops
sending channel packets entirely.</p>
<p>Two things must both be handled. <strong>The flag</strong>, which means the receiver knows the link is
gone. And <strong>silence</strong>, which means the receiver itself has failed, been unplugged, or its wire
has come off - and which the flag cannot tell you about because no frames are arriving to carry it.</p>
<p>The sketch treats both as the same condition, because from your vehicle's point of view they are.</p>`,

bom: [
  { id: 'rc-txrx', qty: 1, note: 'ExpressLRS is the sensible current choice. A RadioMaster or Jumper handset with an internal ELRS module plus a receiver is around $80-120 and will outlast several projects.' },
  { id: 'rx-elrs', qty: 1, note: 'Spare, or if your set did not include one. Check the frequency - 2.4 GHz and 915/868 MHz variants do not interoperate.' },
  { id: 'esp32', qty: 1, note: 'Chosen specifically because its UARTs can invert in hardware, which makes SBUS a one-line problem instead of a transistor.' },
  { id: 'oled13', qty: 1, note: 'Live channel bars. Watching the sticks move on screen is how you confirm everything at a glance.' },
  { id: 'sg90', qty: 1, note: 'Something to drive with a channel, so the output is visible rather than a number.' },
  { id: 'led5', qty: 2, note: 'Link good, and failsafe.' },
  { id: 'res220', qty: 2 },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'psu5v3a', qty: 1, own: true }
],

tools: [{ id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',  at: [0, 48] },
    { id: 'bb',   comp: 'bb400',  at: [0, -10] },
    { id: 'rx',   comp: 'rxelrs', at: [-46, -60] },
    { id: 'oled', comp: 'oled13', at: [30, -60], ry: 180 },
    { id: 'srv',  comp: 'servo',  at: [-30, -98] },
    { id: 'l1',   comp: 'led5',   at: [16, -96], opt: { c: '#3fbf6a' } },
    { id: 'l2',   comp: 'led5',   at: [28, -96], opt: { c: '#e0483c' } }
  ],
  wires: [
    { from: 'mcu.VIN',  to: 'bb.T+2',  color: 'red',    note: '5 V rail from VIN. Most receivers take 5 V; a few are 3.3 V only - check yours' },
    { from: 'mcu.GND',  to: 'bb.T-2',  color: 'black',  note: 'Ground rail' },
    { from: 'rx.5V',    to: 'bb.T+6',  color: 'red',    note: 'Receiver power' },
    { from: 'rx.GND',   to: 'bb.T-6',  color: 'black',  note: 'Receiver ground' },
    { from: 'rx.TX',    to: 'mcu.D16', color: 'green',  note: 'Receiver TX to ESP32 Serial2 RX. This is the channel data' },
    { from: 'rx.RX',    to: 'mcu.D17', color: 'orange', note: 'ESP32 TX to receiver RX - only needed for CRSF telemetry back to the handset' },
    { from: 'oled.VCC', to: 'bb.T+10', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-10', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21', color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL', to: 'mcu.D22', color: 'yellow', note: 'I2C clock' },
    { from: 'srv.SIG',  to: 'mcu.D25', color: 'purple', note: 'Test servo, driven from a channel' },
    { from: 'srv.VCC',  to: 'bb.T+14', color: 'red',    note: 'Servo power. One small servo can share the rail' },
    { from: 'srv.GND',  to: 'bb.T-14', color: 'black',  note: 'Servo ground' },
    { from: 'l1.A',     to: 'mcu.D26', color: 'green',  note: 'Link-good LED through 220 ohm' },
    { from: 'l1.K',     to: 'bb.T-18', color: 'black',  note: 'Cathode to ground' },
    { from: 'l2.A',     to: 'mcu.D27', color: 'red',    note: 'Failsafe LED through 220 ohm' },
    { from: 'l2.K',     to: 'bb.T-20', color: 'black',  note: 'Cathode to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">SBUS is inverted. CRSF is not.</span>
<p>SBUS runs at 100000 baud, 8 data bits, <strong>even parity, two stop bits</strong>, and the whole signal is
inverted - it idles low where a normal UART idles high.</p>
<p>On an ESP32 that is one line: <code>uart_set_line_inverse()</code>, or the <code>invert</code> argument to
<code>Serial2.begin()</code> depending on your core version. On an AVR you need an external inverter - one
NPN transistor and two resistors will do it.</p>
<p>Many receivers also expose a non-inverted SBUS pad. Look for it before building anything.</p>
<p>CRSF is 420000 baud, 8N1, not inverted, and simply works. It is the reason to buy ExpressLRS.</p></div>

<div class="note warn"><span class="t">Check your receiver's voltage before powering it</span>
<p>Most RC receivers take 5&nbsp;V. Some ExpressLRS receivers are 5&nbsp;V tolerant on the power pin and
3.3&nbsp;V on the signal pins; a few are 3.3&nbsp;V only throughout and 5&nbsp;V destroys them.</p>
<p>Read the product page. They are $12 and they are easy to kill.</p>
<p>Signal levels are 3.3&nbsp;V on essentially all of them, which suits an ESP32 directly.</p></div>

<div class="note danger"><span class="t">Bind and range-check before this controls anything</span>
<p>Binding pairs a receiver to one transmitter. Until that is done and verified, the receiver may be
listening to nothing, or - on older protocols - to someone else's transmitter.</p>
<p>Then do a range check: most handsets have a mode that reduces power so you can walk 30&nbsp;m and confirm
the link holds. Do it before the receiver is attached to anything that moves.</p></div>

<div class="note tip"><span class="t">The receiver's own LED tells you the state</span>
<p>Typically: fast blink for bind mode, slow blink for searching, solid for connected. Learn the pattern for
your model - it answers "is the radio side working" without any code at all, which is the first question every
time.</p></div>`,

solderSteps: [
  { h: 'Nothing here needs soldering',
    body: `<p>ELRS receivers come with a short pigtail or bare pads. If yours has pads, solder three or four
    fine wires - use 30&nbsp;AWG silicone wire and a fine tip, because the pads are about 1&nbsp;mm and the
    board is tiny.</p>
    <p>Strain-relieve them with a dab of hot glue over the joints. The wires are thinner than the antenna and
    will be the thing that breaks.</p>` },
  { h: 'Do not cut or coil the antenna',
    body: `<p>The receiver's antenna is cut to length. Shortening it detunes it badly, and coiling it around
    the board costs most of your range.</p>
    <p>Keep the last 30&nbsp;mm - the active tip - straight, clear of carbon, metal and battery packs, and
    ideally at 90 degrees to a second antenna if the receiver has two.</p>` }
],

assembly: [
  { h: 'Bind the receiver before anything else',
    body: `<p>Power the receiver in bind mode - usually by power-cycling it twice quickly, or holding a button.
    Then put the handset into bind. The receiver's LED goes solid when it has worked.</p>
    <p>On ExpressLRS, <strong>the transmitter and receiver firmware versions must match</strong>. Mismatched
    versions refuse to bind and the error is not obvious. Both are flashed from the ExpressLRS Configurator.</p>` },
  { h: 'Set the packet rate sensibly',
    body: `<p>ExpressLRS offers 50&nbsp;Hz up to 1000&nbsp;Hz. Higher is lower latency and shorter range;
    lower reaches much further.</p>
    <p>250&nbsp;Hz is a good default. 50&nbsp;Hz is for long range and feels noticeably laggy on anything
    fast. This is a genuine trade and the handset lets you change it between flights.</p>` },
  { h: 'Watch raw bytes before parsing anything',
    body: `<p>Run the raw sketch and look at the hex. CRSF frames start with the sync byte <code>0xC8</code>;
    SBUS frames start with <code>0x0F</code> and end with <code>0x00</code>.</p>
    <p>Seeing the right sync byte appear at a steady rate proves the wiring, the baud rate and the inversion
    all at once, and it takes two minutes.</p>` },
  { h: 'Decode the channels and watch them on screen',
    body: `<p>Run the decoder. Move each stick and switch in turn and watch the bars.</p>
    <p>Note which channel each control is - AETR (aileron, elevator, throttle, rudder) is the usual order but
    handsets differ, and your switches could be anywhere from channel 5 up.</p>` },
  { h: 'Find the real endpoints',
    body: `<p>CRSF channel values are nominally 172 to 1811, with 992 as centre. In practice a handset with
    non-default endpoints will give you something else.</p>
    <p>Push each stick to its extremes and note the actual numbers, then put those in the scaling. Assuming the
    nominal values gives you a control that never quite reaches full.</p>` },
  { h: 'Test the failsafe properly, three ways',
    body: `<p>This is the important step and it takes five minutes:</p>
    <ul>
      <li><strong>Turn the transmitter off.</strong> The failsafe flag should set within a few hundred
      milliseconds.</li>
      <li><strong>Walk out of range</strong> with the handset in range-check mode.</li>
      <li><strong>Unplug the receiver's signal wire.</strong> No frames at all - the flag cannot help you
      here, and the silence timeout must catch it.</li>
    </ul>
    <p>All three must produce the same safe state. The third is the one people forget.</p>` },
  { h: 'Send telemetry back',
    body: `<p>CRSF is bidirectional. Send a battery packet and the voltage appears on the handset screen, with
    its own low-voltage alarm.</p>
    <p>That alarm is far more useful than anything on the vehicle, because it is the thing in your hands.</p>` }
],

libraries: [
  { name: 'AlfredoCRSF', by: 'Alfredo Systems', why: 'Clean CRSF implementation for ESP32 and Teensy, including telemetry back to the handset.' },
  { name: 'sbus', by: 'Bolder Flight Systems', why: 'SBUS decoding, and it handles the inversion configuration on ESP32.' },
  { name: 'ESP32Servo', by: 'Kevin Harrington', why: 'Servo output on an ESP32, which the standard Servo library does not support.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The channel display.' }
],

code: [
{
  h: 'Step 1: raw bytes',
  intro: `<p>Before any parsing. If the sync bytes are not appearing, nothing else will work and no amount of
  decoder debugging will tell you why.</p>`,
  name: 'rc_raw.ino',
  code: `/* ------------------------------------------------------------------
   Raw receiver bytes.

   CRSF : 420000 baud, 8N1, NOT inverted. Frames start 0xC8.
   SBUS : 100000 baud, 8E2, INVERTED.     Frames start 0x0F, end 0x00.

   Change the two lines below to match what you have.
   ------------------------------------------------------------------ */

#define RX_PIN 16
#define TX_PIN 17

// --- CRSF (ExpressLRS, Crossfire) ---
#define BAUD    420000
#define CONFIG  SERIAL_8N1
#define INVERT  false

// --- SBUS (Futaba, FrSky) - comment out the block above and use this
// #define BAUD    100000
// #define CONFIG  SERIAL_8E2
// #define INVERT  true

void setup() {
  Serial.begin(115200);
  delay(300);

  /* The inversion argument is why this project uses an ESP32. On an
     AVR, SBUS needs an external inverter - one transistor and two
     resistors. Here it is the last parameter. */
  Serial2.begin(BAUD, CONFIG, RX_PIN, TX_PIN, INVERT);

  Serial.println(F("raw receiver bytes"));
  Serial.print(F("looking for sync: "));
  Serial.println(INVERT ? F("0x0F (SBUS)") : F("0xC8 (CRSF)"));
}

void loop() {
  static int col = 0;
  while (Serial2.available()) {
    uint8_t b = Serial2.read();

    // Start a new line on the sync byte, so frames are visible as
    // frames rather than as an undifferentiated stream.
    if ((!INVERT && b == 0xC8) || (INVERT && b == 0x0F)) {
      Serial.println();
      col = 0;
    }

    if (b < 0x10) Serial.print('0');
    Serial.print(b, HEX);
    Serial.print(' ');

    if (++col > 28) { Serial.println(); col = 0; }
  }
}`,
  after: `<p><strong>Nothing at all?</strong> In order: the receiver is not bound (check its LED), the TX and RX
  are swapped, the baud rate is wrong, or - for SBUS - the inversion is wrong.</p>
  <p><strong>Bytes but no recognisable sync?</strong> Almost always baud rate or inversion. Try the other
  protocol's settings; it costs thirty seconds and usually resolves it.</p>`
},
{
  h: 'Step 2: the decoder',
  intro: `<p>Channels, failsafe, link quality, and telemetry back. The failsafe handling is the part worth
  copying into everything else in this theme.</p>`,
  name: 'rc_decode.ino',
  code: `/* ------------------------------------------------------------------
   RC receiver decoder (CRSF / ExpressLRS).

   Channels on screen, a servo on one of them, and a failsafe that
   catches BOTH the receiver saying the link is gone AND the receiver
   saying nothing at all.
   ------------------------------------------------------------------ */

#include <AlfredoCRSF.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define RX_PIN      16
#define TX_PIN      17
#define SERVO_PIN   25
#define LED_LINK    26
#define LED_FAILSAFE 27

/* CRSF nominal endpoints. Measure YOURS - a handset with adjusted
   endpoints will not produce these, and assuming them gives you a
   control that never quite reaches full travel. */
#define CH_MIN   172
#define CH_MID   992
#define CH_MAX  1811

/* If no valid frame arrives for this long, treat it as a lost link.
   This catches the case the protocol's own failsafe flag cannot: an
   unplugged signal wire, or a dead receiver. No frames means no flag
   either. */
#define SILENCE_MS  300

AlfredoCRSF crsf;
Servo testServo;
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

bool linkUp = false;
unsigned long lastFrame = 0;
uint32_t frames = 0, failsafes = 0;

void setup() {
  Serial.begin(115200);

  Serial2.begin(420000, SERIAL_8N1, RX_PIN, TX_PIN);
  crsf.begin(Serial2);

  pinMode(LED_LINK, OUTPUT);
  pinMode(LED_FAILSAFE, OUTPUT);

  testServo.attach(SERVO_PIN, 1000, 2000);
  testServo.writeMicroseconds(1500);

  Wire.begin(21, 22);
  if (oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) oled.setTextColor(SSD1306_WHITE);

  Serial.println(F("waiting for link"));
}

void loop() {
  crsf.update();

  if (crsf.isLinkUp()) {
    lastFrame = millis();
    frames++;
  }

  /* BOTH conditions. The protocol flag means "the receiver knows the
     transmitter is gone". Silence means "the receiver itself is gone".
     From the vehicle's point of view those are the same emergency, and
     only handling the first is the classic mistake. */
  bool nowUp = crsf.isLinkUp() && (millis() - lastFrame < SILENCE_MS);

  if (nowUp != linkUp) {
    linkUp = nowUp;
    if (!linkUp) {
      failsafes++;
      Serial.println(F("*** FAILSAFE ***"));
      goSafe();
    } else {
      Serial.println(F("link up"));
    }
    digitalWrite(LED_LINK, linkUp);
    digitalWrite(LED_FAILSAFE, !linkUp);
  }

  if (linkUp) applyChannels();

  static unsigned long lastDraw = 0;
  if (millis() - lastDraw > 100) { lastDraw = millis(); draw(); }

  static unsigned long lastTelem = 0;
  if (millis() - lastTelem > 500) { lastTelem = millis(); sendTelemetry(); }
}

void applyChannels() {
  // Channel 1 to the test servo, full travel.
  int ch1 = crsf.getChannel(1);
  testServo.writeMicroseconds(scaleToUs(ch1));
}

void goSafe() {
  // Whatever "safe" means for the vehicle. Here: servo centred.
  // On the rover it is throttle zero; on the boat it is throttle zero
  // and rudder centred. Always an explicit, defined state.
  testServo.writeMicroseconds(1500);
}

/* --- scaling ------------------------------------------------------------
   A dead band around centre, because a stick that never quite returns
   to the same place otherwise produces a permanent small command. */
int scaleToUs(int raw) {
  if (abs(raw - CH_MID) < 12) return 1500;
  return map(constrain(raw, CH_MIN, CH_MAX), CH_MIN, CH_MAX, 1000, 2000);
}

float scaleToUnit(int raw) {
  if (abs(raw - CH_MID) < 12) return 0.0;
  if (raw > CH_MID) return (float)(raw - CH_MID) / (CH_MAX - CH_MID);
  return -(float)(CH_MID - raw) / (CH_MID - CH_MIN);
}

/* --- telemetry back to the handset --------------------------------------
   The handset's own low-battery alarm is far more useful than one on
   the vehicle, because it is the thing in your hands. */
void sendTelemetry() {
  if (!linkUp) return;

  crsf_sensor_battery_t battery = { 0 };
  battery.voltage = htobe16((uint16_t)(12.6 * 10));   // dV
  battery.current = htobe16((uint16_t)(3.2 * 10));    // dA
  battery.capacity = htobe16(1500);                   // mAh used
  battery.remaining = 72;                             // percent

  crsf.queuePacket(CRSF_SYNC_BYTE, CRSF_FRAMETYPE_BATTERY_SENSOR,
                   &battery, sizeof(battery));
}

/* --- display ------------------------------------------------------------ */
void draw() {
  oled.clearDisplay();
  oled.setTextSize(1);

  oled.setCursor(0, 0);
  if (linkUp) {
    oled.print(F("LINK  LQ "));
    oled.print(crsf.getLinkStatistics()->uplink_Link_quality);
    oled.print(F("%  "));
    oled.print((int8_t)crsf.getLinkStatistics()->uplink_RSSI_1);
    oled.println(F("dBm"));
  } else {
    oled.fillRect(0, 0, 128, 9, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
    oled.print(F(" *** FAILSAFE *** "));
    oled.setTextColor(SSD1306_WHITE);
  }
  oled.drawFastHLine(0, 10, 128, SSD1306_WHITE);

  // Six channels as centre-origin bars - much easier to read than
  // numbers when you are checking stick directions.
  for (int c = 1; c <= 6; c++) {
    int y = 13 + (c - 1) * 8;
    float v = linkUp ? scaleToUnit(crsf.getChannel(c)) : 0;

    oled.setCursor(0, y);
    oled.print(F("C")); oled.print(c);

    oled.drawFastVLine(76, y - 1, 7, SSD1306_WHITE);   // centre mark
    oled.drawRect(16, y - 1, 120, 7, SSD1306_WHITE);
    int w = (int)(v * 58);
    if (w >= 0) oled.fillRect(76, y - 1, w, 7, SSD1306_WHITE);
    else        oled.fillRect(76 + w, y - 1, -w, 7, SSD1306_WHITE);
  }

  oled.setCursor(0, 56);
  oled.print(F("frames ")); oled.print(frames / 100);
  oled.print(F("00  fs ")); oled.print(failsafes);

  oled.display();
}`,
  after: `<p><strong>The two failsafe conditions are the point of this sketch.</strong> Almost every hobby
  implementation handles the protocol's failsafe flag and stops there - which works perfectly when you switch
  the transmitter off, and not at all when the receiver's signal wire vibrates loose in flight. No frames
  means no flag either, and the vehicle carries on with its last command.</p>
  <p><strong>The dead band</strong> around centre matters more than it looks. A gimbal that returns to 991
  rather than 992 produces a permanent slight command, and on a rover that is a machine that slowly creeps
  across the room whenever you let go.</p>
  <p><strong>Link quality (LQ) is the number to watch, not RSSI.</strong> RSSI tells you how strong the signal
  is; LQ tells you what fraction of packets actually arrived. A link at 100% LQ and -95&nbsp;dBm is healthy;
  one at 60% LQ is dropping four packets in ten and about to fail regardless of what RSSI says.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note warn"><span class="t">Bind before you debug</span>
<p>An unbound receiver produces no data and looks exactly like a wiring fault. Check its LED first - solid
means bound and connected on most models.</p>
<p>On ExpressLRS, transmitter and receiver firmware must be the same version. Mismatched versions will not
bind and say nothing useful about why.</p></div>
<div class="note tip"><span class="t">Range-check on the ground, always</span>
<p>Most handsets have a range-check mode that drops transmit power by around 30&nbsp;dB. Walk 30&nbsp;m with
it and watch LQ. If it holds there, full power will hold at a kilometre.</p>
<p>Do this before the receiver is bolted to anything with a motor.</p></div>`,

tune: [
  { h: 'Packet rate is a genuine trade',
    body: `<p>ExpressLRS runs from 50&nbsp;Hz to 1000&nbsp;Hz. Every doubling of rate costs roughly 3&nbsp;dB
    of link budget - meaningful range.</p>
    <p>250&nbsp;Hz suits most things. 500 or 1000 for something fast and close. 50&nbsp;Hz for maximum range,
    where the 20&nbsp;ms between packets is noticeable on the sticks.</p>` },
  { h: 'Set the failsafe on the receiver as well',
    body: `<p>Belt and braces. Most receivers can be configured to output defined values on failsafe - throttle
    low, surfaces centred - rather than holding the last position.</p>
    <p>Then your code handles it too. Two independent mechanisms, because this is the one that matters.</p>` },
  { h: 'Use the switches',
    body: `<p>A three-position switch gives you three discrete values on one channel, which is ideal for modes.
    A two-position switch on an arming channel is how every RC vehicle should be armed - one deliberate,
    physical action.</p>
    <p>Test the switch positions and hardcode the thresholds rather than assuming they are evenly spaced; they
    often are not.</p>` },
  { h: 'More telemetry',
    body: `<p>CRSF carries GPS, attitude, flight mode, battery and custom sensors. Anything you send appears
    on the handset screen and can trigger its alarms.</p>
    <p>Battery voltage and link quality are the two worth having. A handset that vibrates at 3.5&nbsp;V per
    cell is the most useful low-battery warning there is.</p>` },
  { h: 'SBUS on an AVR, if you must',
    body: `<p>One NPN transistor: signal to the base through 10&nbsp;k, collector to the Arduino's RX with a
    10&nbsp;k pull-up to 5&nbsp;V, emitter to ground. That inverts it.</p>
    <p>Then you still need 100000 baud 8E2, which <code>Serial.begin(100000, SERIAL_8E2)</code> handles on a
    Mega but not on a software serial port. An ESP32 remains the easier answer.</p>` },
  { h: 'Driving ESCs directly from channels',
    body: `<p>The obvious next step, and worth one warning: map the channel to the ESC through your own arming
    logic rather than passing it through. A vehicle that spins its motors the instant the receiver connects -
    because the throttle stick happens to be up - is a vehicle that has hurt someone.</p>` }
],

trouble: [
  { q: 'No data at all',
    a: `Check the receiver's LED first - if it is not solid, it is not bound and nothing else matters. Then
    TX/RX not swapped, then baud rate, then inversion.` },
  { q: 'Bytes arrive but nothing decodes',
    a: `Wrong protocol. CRSF sync is 0xC8, SBUS is 0x0F. Look at the raw output and see which you are actually
    getting - some receivers default to a protocol you did not expect.` },
  { q: 'Channels jump around at random',
    a: `Usually baud rate slightly off, or a noisy supply. Check the receiver is getting clean 5&nbsp;V. On
    SBUS, a marginal inverter produces exactly this.` },
  { q: 'It will not bind',
    a: `On ExpressLRS, firmware version mismatch between handset and receiver is the most common cause. Flash
    both from the same Configurator version. Also check they are the same frequency band - 2.4&nbsp;GHz and
    915&nbsp;MHz hardware cannot talk to each other.` },
  { q: 'Range is much worse than expected',
    a: `Antenna. Do not cut it, do not coil it, keep the tip straight and away from carbon, metal and
    batteries. Then check the packet rate - 1000&nbsp;Hz has far less range than 250.` },
  { q: 'Failsafe does not trigger when I unplug the signal wire',
    a: `You are only checking the protocol flag. No frames means no flag - the silence timeout is what catches
    this, and it is the case people forget.` },
  { q: 'The servo twitches with the stick centred',
    a: `No dead band, and the gimbal does not return to exactly the same value. A 12-count dead band around
    centre fixes it.` },
  { q: 'LQ is 100% but the controls feel laggy',
    a: `Low packet rate. 50&nbsp;Hz is 20&nbsp;ms between updates and feels noticeably soft. Raise it if range
    allows.` },
  { q: 'Telemetry does not appear on the handset',
    a: `The TX line from the ESP32 to the receiver must be connected - telemetry is the return path and it is
    easy to leave off when you only care about channels. Check the handset has telemetry enabled for that
    model too.` }
],

next: `
<ul>
  <li><strong>Now drive something with it</strong> - the
  <a href="project.html?p=rc-rover-brushless">brushless rover</a> puts these channels onto motors, on the
  ground, where a failsafe means stopping rather than falling.</li>
  <li><strong>Understand the motors first</strong> - the
  <a href="project.html?p=brushless-thrust-bench">thrust bench</a> is the safe way to learn ESCs.</li>
  <li><strong>On the water</strong> - the <a href="project.html?p=rc-boat">RC boat</a>, where failsafe has a
  different and more annoying meaning.</li>
  <li><strong>The full thing</strong> - the
  <a href="project.html?p=quadcopter-flight-controller">flight controller</a> takes these same channels and
  turns them into attitude commands.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Failsafe is the whole point of this project</span>
<ul>
  <li><strong>Handle both conditions</strong> - the protocol's failsafe flag AND silence. Only the first is
  the common mistake, and it is the one that leaves a vehicle running after a wire comes loose.</li>
  <li><strong>Define what "safe" means</strong> for each vehicle explicitly. Throttle zero and surfaces
  centred for most things. Never "hold last command".</li>
  <li><strong>Configure the receiver's own failsafe too.</strong> Two independent mechanisms.</li>
  <li><strong>Test it three ways</strong> before every vehicle flies or drives: transmitter off, out of range,
  signal wire unplugged.</li>
  <li><strong>Arm deliberately.</strong> A switch on the handset, checked in software, so a vehicle cannot
  start moving the moment the link comes up with the throttle stick somewhere it should not be.</li>
</ul>
</div>
<div class="note warn"><span class="t">Radio and regulation</span>
<ul>
  <li><strong>2.4 GHz RC gear is licence-exempt</strong> nearly everywhere and the equipment is certified.
  915/868&nbsp;MHz ELRS is not universally permitted at RC power levels - check your country before buying the
  long-range hardware.</li>
  <li><strong>Never transmit without the antenna</strong> connected, on the handset or the receiver.</li>
  <li><strong>Range-check on the ground</strong> before trusting a link with anything that moves.</li>
</ul>
</div>`
});
