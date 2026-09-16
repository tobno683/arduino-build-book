/* HC-05 Bluetooth serial: a wireless cable, and an honest word about iPhones. */
AB.addProject({
slug: 'hc05-bluetooth-control',
title: 'Bluetooth control from a phone',
cat: 'radio',
level: 2,
time: '3 hours',
solder: false,
board: 'Nano',
tags: ['hc-05', 'bluetooth', 'spp', 'serial', 'at commands', 'phone control', 'android', 'no soldering', 'ws2812'],
blurb: 'Three dollars turns your USB cable into a wireless one. Type a command on your phone, the lamp changes colour, and the temperature comes back the other way.',

skills: ['Bluetooth SPP', 'AT command configuration', 'SoftwareSerial', 'Voltage dividers', 'Command parsers', 'Two-way protocols'],

intro: `
<p>The most useful way to think about an HC-05 is that it is a wireless serial cable. Everything you already
know about <code>Serial.print()</code> keeps working; the bytes simply arrive at a phone instead of a laptop.
That is a small idea with a large payoff, because it means any project with a serial interface becomes a
project with a phone interface for three dollars and no app development.</p>
<p>The honest limitation, stated at the top rather than buried: <strong>this will not work with an
iPhone.</strong> The HC-05 speaks Bluetooth Classic SPP, and Apple does not allow general apps to open
Classic serial connections - that path is reserved for licensed MFi hardware. On Android it works with any of
a dozen free terminal apps. On iOS you need a BLE module instead, and the last section explains which one and
what changes.</p>
<p>Everything else about this module is straightforward except its configuration mode, which is genuinely
fiddly and where most people get stuck. That part gets a section of its own.</p>`,

what: [
  'Pair a phone with your Arduino and open a serial terminal to it.',
  'Send single-line commands to set colours, brightness and effects on an LED strip.',
  'Get live temperature and status back on the same connection.',
  'Rename the module and change its PIN, so you are not pairing with the fourth "HC-05" on the street.',
  'Change the baud rate properly, using AT mode, without bricking the link.',
  'Understand exactly why the RX pin needs two resistors and the TX pin does not.'
],

how: `
<p><strong>SPP, the Serial Port Profile.</strong> Bluetooth defines profiles for different jobs - A2DP for
audio, HID for keyboards, SPP for a plain bidirectional byte stream. SPP is the oldest and simplest: it
emulates an RS-232 cable. Once paired, the phone opens a socket, and bytes written at one end come out the
other in order.</p>
<p>There is no packet structure, no addressing and no acknowledgement visible to you. If you want to know
whether a command arrived, your own protocol has to say so - which is why the sketch below echoes an
acknowledgement for every command.</p>

<p><strong>Two modes, and the pin that picks between them.</strong> The module normally sits in <em>data
mode</em>: anything it receives over Bluetooth goes out of its TXD pin, and anything arriving on RXD goes over
Bluetooth. It never looks at the content.</p>
<p>Pull the <strong>EN</strong> pin (sometimes labelled KEY) high <em>before</em> power is applied, and it
starts in <em>AT mode</em> instead, where it interprets what arrives on RXD as configuration commands. The
onboard LED tells you which you are in: fast blinking is data mode, a slow two-second blink is AT mode.</p>
<p>The trap is the baud rate. Data mode defaults to 9600. <strong>AT mode is 38400.</strong> Trying to
configure a module at 9600 gets you silence, and silence looks exactly like broken wiring.</p>

<p><strong>The RX divider, and why TX needs nothing.</strong> The HC-05 board has a regulator, so VCC happily
takes 3.6 to 6&nbsp;V. The <em>module inside</em> runs at 3.3&nbsp;V, and on most carrier boards the RXD pin
goes straight to the chip with no level shifting.</p>
<p>So: Arduino TX (5&nbsp;V) into HC-05 RXD needs dividing down to about 3.3&nbsp;V. Two resistors do it - the
signal through one, another to ground, and the junction is your 3.3&nbsp;V.</p>
<p>The other direction needs nothing. HC-05 TXD puts out 3.3&nbsp;V, and an Arduino reading a 5&nbsp;V input
counts anything above about 3.0&nbsp;V as HIGH. It has margin, though not a lot - which is worth knowing if
you ever see flaky receive on a 5&nbsp;V board with a long wire.</p>
<p>Plenty of guides skip the divider and report that it works. It often does, for a while. It is two
resistors.</p>

<p><strong>Why SoftwareSerial.</strong> The Nano's hardware serial pins (D0, D1) are shared with USB. Put the
Bluetooth module there and you cannot use the Serial Monitor to debug, and every upload fights the module for
the pins. SoftwareSerial on D2 and D3 keeps the USB console free, which during development is worth far more
than the small timing cost.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'Any 5 V Arduino. On a 3.3 V board like an ESP32 you can skip the divider entirely - and get proper hardware serial too.' },
  { id: 'hc05', qty: 1, note: 'Get the HC-05, not the HC-06. The 06 is slave-only and has a cut-down AT set; the 05 costs the same and does everything the 06 does.' },
  { id: 'res10k', qty: 3, note: 'The RX divider: one in series, two in series to ground for 20 k. See the wiring notes - 10 k / 20 k is a high-impedance divider and is fine at 9600 baud.' },
  { id: 'ws2812-strip', qty: 1, as: 'WS2812B strip, 16 LEDs', note: 'Cut a 16-LED length from a 60/m strip. It is the thing the commands act on, so it should be visible from across a room.' },
  { id: 'res220', qty: 1, note: 'In series with the strip data line, at the strip end.' },
  { id: 'cap1000', qty: 1, note: 'Across the strip power, at the strip end.' },
  { id: 'ds18b20', qty: 1, note: 'The telemetry that comes back the other way. One wire, one resistor, and it makes the link feel two-way.' },
  { id: 'res-kit', qty: 1, own: true, note: 'For the 4.7 k the DS18B20 needs. A 10 k works on a short lead.' },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'psu5v3a', qty: 1, own: true, note: 'Any USB charger once it is off the laptop.' }
],

tools: [{ id: 'dmm', own: true, note: 'Genuinely useful here - measuring the divider output is how you confirm it before connecting anything.' }],

build: {
  parts: [
    { id: 'nano',  comp: 'nano',        at: [0, 50] },
    { id: 'bb',    comp: 'bb400',       at: [0, -8] },
    { id: 'bt',    comp: 'hc05',        at: [-44, -58] },
    { id: 'strip', comp: 'ws2812strip', at: [0, -92] },
    { id: 'temp',  comp: 'ds18b20',     at: [46, -58] }
  ],
  wires: [
    { from: 'nano.5V',   to: 'bb.T+2',   color: 'red',    note: '5 V rail' },
    { from: 'nano.GND',  to: 'bb.T-2',   color: 'black',  note: 'Ground rail' },
    { from: 'bt.VCC',    to: 'bb.T+6',   color: 'red',    note: 'HC-05 power. The board has its own regulator, so 5 V here is correct' },
    { from: 'bt.GND',    to: 'bb.T-6',   color: 'black',  note: 'HC-05 ground' },
    { from: 'bt.TXD',    to: 'nano.D2',  color: 'green',  note: 'Module TX to Arduino RX. 3.3 V into a 5 V input - no divider needed this way' },
    { from: 'bt.RXD',    to: 'bb.T+14',  color: 'orange', note: 'Module RX from the DIVIDER midpoint, never straight from D3' },
    { from: 'nano.D3',   to: 'bb.T+18',  color: 'orange', note: 'Arduino TX into the top of the divider - 10 k in series from here' },
    { from: 'bb.T-18',   to: 'bb.T-14',  color: 'black',  note: 'Divider lower leg: 20 k (two 10 k in series) from the midpoint to ground' },
    { from: 'bt.EN',     to: 'bb.T+22',  color: 'purple', note: 'EN/KEY. Leave unconnected for normal use; to 3.3 V at power-up for AT mode' },
    { from: 'nano.D6',   to: 'strip.DIN', color: 'blue',  note: 'WS2812 data, through 220 ohm at the strip' },
    { from: 'strip.5V',  to: 'bb.T+26',  color: 'red',    note: 'Strip power. 16 LEDs is under an amp at the brightness this sketch uses' },
    { from: 'strip.GND', to: 'bb.T-26',  color: 'black',  note: 'Strip ground - common with the Arduino or the data line has no reference' },
    { from: 'temp.VCC',  to: 'bb.T+30',  color: 'red',    note: 'DS18B20 power' },
    { from: 'temp.GND',  to: 'bb.T-30',  color: 'black',  note: 'DS18B20 ground' },
    { from: 'temp.DATA', to: 'nano.D4',  color: 'yellow', note: '1-Wire data, with a 4.7 k pull-up to 5 V' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">The divider goes on RXD. Never feed it 5 V directly.</span>
<p>Arduino D3 &rarr; 10&nbsp;k&Omega; &rarr; <strong>junction</strong> &rarr; 20&nbsp;k&Omega; &rarr; GND. The
HC-05's RXD pin connects to the junction.</p>
<p>That gives 5 &times; 20/(10+20) = 3.33&nbsp;V, which is what the module wants. Measure it with a meter
before you connect the module: set D3 HIGH in a two-line sketch and probe the junction. It should read
3.2-3.4&nbsp;V.</p>
<p>The 20&nbsp;k leg is two 10&nbsp;k resistors in series, because this book's parts list has 10&nbsp;k and
not 20&nbsp;k. A 1&nbsp;k/2&nbsp;k pair from a resistor kit is electrically nicer - lower impedance, crisper
edges - and either is fine at 9600 baud.</p></div>

<div class="note warn"><span class="t">EN / KEY: leave it alone unless you are configuring</span>
<p>For normal use the EN pin stays <strong>unconnected</strong>. The module powers up in data mode and gets on
with it.</p>
<p>For AT mode it must be HIGH <em>as power is applied</em> - not pulled high afterwards. The usual method is
a jumper from EN to the 3.3&nbsp;V rail, then plug the USB in. Some boards have a tiny button on top that does
the same thing; hold it while powering up.</p>
<p>Pulling EN high on an already-running module does nothing on most boards, which is the most common reason
people conclude their module has no AT mode.</p></div>

<div class="note warn"><span class="t">Unplug the module before uploading, if you put it on D0/D1</span>
<p>This build uses D2 and D3 through SoftwareSerial precisely to avoid that. If you move it to the hardware
serial pins for speed, you must physically disconnect it for every upload - the bootloader and the module will
otherwise both try to drive the same line and the upload fails with a verification error.</p></div>

<div class="note tip"><span class="t">The strip needs its own ground path to the Arduino</span>
<p>Standard WS2812 practice, repeated because it catches people every time: common ground, a 220&nbsp;&Omega;
resistor in the data line at the strip end, and a capacitor across the strip's power. Sixteen LEDs at the
brightness this sketch uses will run from the Nano's 5&nbsp;V pin; sixty will not.</p></div>`,

solderSteps: [
  { h: 'Nothing here needs soldering',
    body: `<p>The HC-05 comes on a carrier board with a header, the strip has a flying lead, and the DS18B20
    is three legs into a breadboard. This is a plug-together project by design - the difficulty is in the
    configuration, not the construction.</p>` },
  { h: 'If you do make it permanent',
    body: `<p>Put the divider resistors on the perfboard rather than trailing off the module, and socket the
    HC-05 with female header. You will want to pull it out to reconfigure it, and desoldering a module to
    rename it is a bad afternoon.</p>` }
],

assembly: [
  { h: 'Wire the divider first and measure it',
    body: `<p>Before the HC-05 goes anywhere near the board. Upload a sketch that does nothing but
    <code>pinMode(3, OUTPUT); digitalWrite(3, HIGH);</code> and put the meter on the divider junction.</p>
    <p>3.2 to 3.4&nbsp;V and you are right. 5&nbsp;V means you have the module tapping the wrong side of the
    series resistor. 1.7&nbsp;V means the two resistors are the wrong way round.</p>` },
  { h: 'Power it up and check the LED',
    body: `<p>Connect VCC, GND, TXD and RXD. The onboard LED should blink rapidly - roughly twice a second.
    That is data mode, unpaired, advertising.</p>
    <p>No LED at all means no power. A slow two-second blink means it came up in AT mode, which means EN is
    high when it should not be.</p>` },
  { h: 'Configure it before you build anything on top',
    body: `<p>Do the AT-mode session now: rename it, set a PIN, confirm the baud rate. It is much easier with
    a bare board than with a strip and a sensor in the way, and once done it is permanent - the settings
    survive power cycles.</p>
    <p>This is the step people put off and then have to unpick a working build to do.</p>` },
  { h: 'Pair the phone',
    body: `<p>Android Bluetooth settings, scan, find the name you just set, pair with your PIN. It will pair
    and then show as "paired but not connected" - that is correct. SPP only connects when an app opens the
    socket.</p>
    <p>Install any serial terminal - "Serial Bluetooth Terminal" is the usual free one - and connect to the
    device from inside the app.</p>` },
  { h: 'Run the echo test',
    body: `<p>Upload the echo sketch. Type into the phone terminal and the characters appear in the Arduino
    Serial Monitor; type in the Serial Monitor and they appear on the phone.</p>
    <p>Get this working before anything else. It proves wiring, baud rate, pairing and app all at once, and
    every later problem is either the parser or the hardware being controlled.</p>` },
  { h: 'Add the strip and the sensor',
    body: `<p>Strip on D6 with its resistor and capacitor, DS18B20 on D4 with its 4.7&nbsp;k pull-up. Test
    each with its own library example before combining.</p>` },
  { h: 'Run the control sketch and learn the commands',
    body: `<p><code>help</code> lists them. Try <code>color ff8800</code>, <code>bright 120</code>,
    <code>rainbow</code>, <code>temp</code>, <code>status</code>.</p>
    <p>In your terminal app, set the line ending to <strong>newline</strong> - most default to none, and a
    parser waiting for a newline that never arrives looks exactly like a dead link.</p>` },
  { h: 'Save the commands as buttons',
    body: `<p>Serial Bluetooth Terminal and most similar apps let you assign a string to an on-screen macro
    button. Ten minutes of setup turns a typing exercise into something that feels like an app, with no app
    written.</p>` }
],

libraries: [
  { name: 'SoftwareSerial', by: 'Arduino', how: 'Built in', why: 'Bit-bangs a second serial port on D2/D3 so the USB console stays free for debugging.' },
  { name: 'FastLED', by: 'Daniel Garcia', why: 'The WS2812 strip. Handles the 800 kHz timing.' },
  { name: 'OneWire', by: 'Paul Stoffregen', why: 'The DS18B20 bus.' },
  { name: 'DallasTemperature', by: 'Miles Burton', why: 'Turns OneWire into readable degrees.' }
],

code: [
{
  h: 'Step 1: configure the module (AT mode)',
  intro: `<p>Upload this, then follow the procedure in the comment at the top. This is the fiddly part of the
  project and it is worth doing carefully once.</p>`,
  name: 'hc05_at_config.ino',
  code: `/* ------------------------------------------------------------------
   HC-05 AT command console.

   PROCEDURE - the order matters:
     1. Disconnect power from the HC-05.
     2. Jumper its EN (or KEY) pin to 3.3 V.
     3. Reconnect power. The LED should blink SLOWLY, about once
        every two seconds. That is AT mode. Fast blinking means it
        came up in data mode - EN was not high in time, try again.
     4. Open the Serial Monitor at 9600, line ending "Both NL & CR".
     5. Type  AT  and press enter. It should answer  OK.
     6. Configure it (commands listed below).
     7. Power off, remove the EN jumper, power on.

   AT mode runs at 38400 regardless of the data-mode baud rate. That
   catches everyone once.
   ------------------------------------------------------------------ */

#include <SoftwareSerial.h>

#define BT_RX_PIN  2      // Arduino receives here <- module TXD
#define BT_TX_PIN  3      // Arduino sends here   -> module RXD (via divider)

SoftwareSerial bt(BT_RX_PIN, BT_TX_PIN);

void setup() {
  Serial.begin(9600);
  while (!Serial);

  // 38400 is the AT-mode rate and is NOT configurable. The data-mode
  // rate you set later is a different setting entirely.
  bt.begin(38400);

  Serial.println(F("HC-05 AT console"));
  Serial.println(F("Set line ending to 'Both NL & CR'."));
  Serial.println();
  Serial.println(F("Useful commands:"));
  Serial.println(F("  AT                     -> OK   (the sanity check)"));
  Serial.println(F("  AT+VERSION?            firmware version"));
  Serial.println(F("  AT+NAME=BenchLamp      rename it (do this)"));
  Serial.println(F("  AT+PSWD=\\"4821\\"         set the pairing PIN"));
  Serial.println(F("  AT+UART=9600,0,0       data-mode baud, 1 stop, no parity"));
  Serial.println(F("  AT+ROLE=0              0 = slave (what we want)"));
  Serial.println(F("  AT+ADDR?               its Bluetooth address"));
  Serial.println(F("  AT+ORGL                factory reset, if you get lost"));
  Serial.println();
  Serial.println(F("Note: older firmware wants AT+PSWD=4821 with no quotes."));
  Serial.println(F("If the quoted form returns ERROR, try it bare."));
  Serial.println();
}

void loop() {
  // A plain two-way pipe between the USB console and the module.
  if (bt.available())     Serial.write(bt.read());
  if (Serial.available()) bt.write(Serial.read());
}`,
  after: `<p><strong>If <code>AT</code> returns nothing at all</strong>, work through these in order, because
  each one is a different fault:</p>
  <ul>
    <li>Is the LED blinking <em>slowly</em>? If it is blinking fast you are in data mode, not AT mode, and
    the module is faithfully sending "AT" over Bluetooth to nobody.</li>
    <li>Is the line ending set to "Both NL &amp; CR"? The module needs both. This is the single most common
    cause.</li>
    <li>Is <code>bt.begin(38400)</code> right? Some clones use 9600 in AT mode. Try it.</li>
    <li>Are RX and TX crossed? Module TXD goes to the Arduino's receive pin. Two transmitters connected
    together is silent, not smoky.</li>
  </ul>
  <p><strong>Rename it.</strong> Leaving it as "HC-05" is fine until you are in a room with three of them, and
  a lot of people leave the default PIN of 1234 as well.</p>`
},
{
  h: 'Step 2: the echo test',
  intro: `<p>The smallest thing that proves the whole chain. Do not skip it.</p>`,
  name: 'bt_echo.ino',
  code: `/* ------------------------------------------------------------------
   Bidirectional echo. Type on the phone, see it on the laptop, and
   the other way round.

   Remove the EN jumper before running this - we want data mode now.
   ------------------------------------------------------------------ */

#include <SoftwareSerial.h>

SoftwareSerial bt(2, 3);     // RX, TX

void setup() {
  Serial.begin(9600);
  bt.begin(9600);            // data mode - must match AT+UART
  Serial.println(F("echo test. Type in either window."));
  bt.println(F("Arduino here. Say something."));
}

void loop() {
  while (bt.available()) {
    char c = bt.read();
    Serial.write(c);         // phone -> laptop
  }
  while (Serial.available()) {
    char c = Serial.read();
    bt.write(c);             // laptop -> phone
  }
}`,
  after: `<p>If characters flow both ways, everything below is software. If they flow one way only, the
  direction that fails tells you which wire to look at: nothing reaching the phone means the divider or D3;
  nothing reaching the laptop means the module's TXD or D2.</p>
  <p><strong>Garbage characters</strong> rather than silence means a baud mismatch. The module is at whatever
  <code>AT+UART</code> set, which is 9600 unless you changed it.</p>`
},
{
  h: 'Step 3: the control sketch',
  intro: `<p>A line-based command parser, a strip to control and a sensor to report back. The parser is worth
  reading - it is the same shape every serial protocol in this book uses.</p>`,
  name: 'bt_control.ino',
  code: `/* ------------------------------------------------------------------
   Bluetooth control panel.

   Commands (one per line, from the phone):
     help                 list commands
     color <rrggbb>       solid colour, e.g.  color ff8800
     bright <0-255>       brightness
     rainbow              animated rainbow
     off                  all off
     temp                 read the sensor
     status               everything at once

   Every command answers, including a complaint for ones it does not
   recognise. SPP gives you no delivery confirmation of its own, so
   the acknowledgement IS the protocol.
   ------------------------------------------------------------------ */

#include <SoftwareSerial.h>
#include <FastLED.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define BT_RX     2
#define BT_TX     3
#define TEMP_PIN  4
#define LED_PIN   6
#define NUM_LEDS 16

// 16 LEDs at full white would be about 950 mA. This cap keeps the
// whole thing inside what a Nano's 5 V pin will pass.
#define MAX_BRIGHT 100

SoftwareSerial bt(BT_RX, BT_TX);
CRGB leds[NUM_LEDS];
OneWire oneWire(TEMP_PIN);
DallasTemperature sensors(&oneWire);

byte brightness = 60;
CRGB solid = CRGB::Black;
bool rainbow = false;
byte hue = 0;

char line[40];
byte linePos = 0;
unsigned long commands = 0;

void setup() {
  Serial.begin(9600);
  bt.begin(9600);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(brightness);
  FastLED.clear(true);

  sensors.begin();
  sensors.setResolution(11);     // 11 bits: 0.125 C, ~375 ms. Plenty.

  say(F("ready. type 'help'"));
}

void loop() {
  readBluetooth();

  if (rainbow) {
    fill_rainbow(leds, NUM_LEDS, hue++, 6);
    FastLED.show();
    delay(25);
  }
}

/* --- input ------------------------------------------------------------
   Accumulate until a newline. Never block waiting for a whole line:
   a phone can disconnect mid-command and a blocking read would hang
   the sketch until reset. */
void readBluetooth() {
  while (bt.available()) {
    char c = bt.read();

    if (c == '\\n' || c == '\\r') {
      if (linePos) { line[linePos] = '\\0'; handle(line); linePos = 0; }
      continue;
    }
    if (linePos < sizeof(line) - 1) line[linePos++] = c;
  }
}

void handle(char *cmd) {
  commands++;
  Serial.print(F("[bt] ")); Serial.println(cmd);

  // Split the command word from its argument at the first space.
  char *arg = strchr(cmd, ' ');
  if (arg) { *arg = '\\0'; arg++; }

  if      (!strcasecmp(cmd, "help"))    doHelp();
  else if (!strcasecmp(cmd, "color") ||
           !strcasecmp(cmd, "colour"))  doColor(arg);
  else if (!strcasecmp(cmd, "bright"))  doBright(arg);
  else if (!strcasecmp(cmd, "rainbow")) doRainbow();
  else if (!strcasecmp(cmd, "off"))     doOff();
  else if (!strcasecmp(cmd, "temp"))    doTemp();
  else if (!strcasecmp(cmd, "status"))  doStatus();
  else {
    bt.print(F("? unknown: "));
    bt.println(cmd);
  }
}

/* --- commands --------------------------------------------------------- */
void doHelp() {
  bt.println(F("color <rrggbb>  bright <0-255>"));
  bt.println(F("rainbow  off  temp  status"));
}

void doColor(char *arg) {
  if (!arg) { bt.println(F("! usage: color ff8800")); return; }

  long rgb = strtol(arg, NULL, 16);
  solid = CRGB((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF);
  rainbow = false;
  fill_solid(leds, NUM_LEDS, solid);
  FastLED.show();

  bt.print(F("ok colour ")); bt.println(arg);
}

void doBright(char *arg) {
  if (!arg) { bt.println(F("! usage: bright 120")); return; }

  int v = atoi(arg);
  // Clamped rather than rejected: a phone is a clumsy input device
  // and "bright 900" should mean "as bright as you go", not an error.
  brightness = constrain(v, 0, MAX_BRIGHT);
  FastLED.setBrightness(brightness);
  FastLED.show();

  bt.print(F("ok bright ")); bt.print(brightness);
  if (v > MAX_BRIGHT) bt.print(F(" (capped)"));
  bt.println();
}

void doRainbow() { rainbow = true;  bt.println(F("ok rainbow")); }

void doOff() {
  rainbow = false;
  solid = CRGB::Black;
  FastLED.clear(true);
  bt.println(F("ok off"));
}

void doTemp() {
  sensors.requestTemperatures();
  float c = sensors.getTempCByIndex(0);

  // -127 is the library's "nothing answered on the bus" value, not a
  // temperature. Reporting it as one would be actively misleading.
  if (c <= -100) { bt.println(F("! no sensor on the 1-wire bus")); return; }

  bt.print(c, 2); bt.println(F(" C"));
}

void doStatus() {
  sensors.requestTemperatures();
  float c = sensors.getTempCByIndex(0);

  bt.print(F("mode    : ")); bt.println(rainbow ? F("rainbow") : F("solid"));
  bt.print(F("colour  : "));
  if (solid.r < 16) bt.print('0'); bt.print(solid.r, HEX);
  if (solid.g < 16) bt.print('0'); bt.print(solid.g, HEX);
  if (solid.b < 16) bt.print('0'); bt.println(solid.b, HEX);
  bt.print(F("bright  : ")); bt.println(brightness);
  bt.print(F("temp    : "));
  if (c <= -100) bt.println(F("--")); else { bt.print(c, 1); bt.println(F(" C")); }
  bt.print(F("uptime  : ")); bt.print(millis() / 1000); bt.println(F(" s"));
  bt.print(F("commands: ")); bt.println(commands);
}

void say(const __FlashStringHelper *msg) {
  bt.println(msg);
  Serial.println(msg);
}`,
  after: `<p>Two details worth carrying into other projects:</p>
  <ul>
    <li><strong>Every command answers.</strong> SPP tells you nothing about delivery, so without a reply a
    user cannot distinguish "command ignored" from "phone disconnected". Even <code>? unknown</code> is useful
    - it proves the link is alive.</li>
    <li><strong>Clamp, do not reject.</strong> <code>bright 900</code> giving maximum brightness with a
    "(capped)" note is better behaviour than an error, because the intent was obvious.</li>
  </ul>
  <p><code>strcasecmp</code> means <code>COLOR</code>, <code>Color</code> and <code>color</code> all work,
  which matters more than you would think on a phone keyboard with autocapitalisation on.</p>`
}],

upload: `
<p>Ordinary Nano upload. Serial Monitor at <strong>9600</strong> for the sketches above - note that is not the
115200 most projects in this book use, because SoftwareSerial is unreliable at high rates and it is simpler to
keep both ports the same.</p>
<div class="note warn"><span class="t">Set your terminal app's line ending to newline</span>
<p>The parser acts on <code>\\n</code>. Most Android terminal apps default to sending no line ending at all,
so commands accumulate forever and nothing happens. In Serial Bluetooth Terminal it is under Settings &rarr;
Send &rarr; Newline.</p>
<p>This is the most common "it paired but nothing works" cause, and it is not a fault in anything.</p></div>
<div class="note tip"><span class="t">Pairing is not connecting</span>
<p>Android pairs at the system level and then shows the device as "paired, not connected". That is correct and
expected - an SPP link only opens when an app asks for it. Connect from inside the terminal app, not from
Bluetooth settings.</p></div>`,

tune: [
  { h: 'iPhone: what actually works',
    body: `<p>The HC-05 cannot talk to an iPhone, and no app fixes that - Apple restricts Bluetooth Classic
    SPP to licensed MFi accessories.</p>
    <p>The fix is a different radio, not different software: an <strong>HM-10</strong> or similar BLE module,
    which iOS talks to freely through apps like LightBlue or nRF Connect. It costs about $5, wires up
    identically (and is also 3.3&nbsp;V on RX), and presents a serial-like characteristic instead of SPP. The
    sketch above needs no changes at all beyond the module swap.</p>
    <p>An ESP32 is the other answer, since it does both Classic and BLE and has proper hardware serial.</p>` },
  { h: 'Move to hardware serial when you need speed',
    body: `<p>SoftwareSerial is bit-banged and starts dropping characters above about 38400, especially while
    FastLED has interrupts off. If you need a faster link, move the module to D0/D1 and use
    <code>Serial</code>.</p>
    <p>The cost is real: you lose the USB console, and you must unplug the module for every upload. Worth it
    for streaming data, not worth it for a command parser.</p>` },
  { h: 'Use the STATE pin to know when someone is connected',
    body: `<p>The module's STATE pin goes HIGH while an SPP connection is open. Wire it to a spare input and
    the sketch knows whether anyone is listening - useful for dimming the strip when nobody is connected, or
    for reverting to a default after a disconnect.</p>
    <p>It is the only genuine connection indicator you get.</p>` },
  { h: 'Make the phone side feel like an app',
    body: `<p>Macro buttons in the terminal app get you most of the way. Beyond that, MIT App Inventor builds
    a real Android app with a BluetoothClient component in an afternoon and no Java - it is the standard route
    for exactly this and it produces something you can hand to someone else.</p>` },
  { h: 'Security, such as it is',
    body: `<p>Bluetooth 2.x pairing with a four-digit PIN is weak, and the default of 1234 is not security at
    all. Change it, and pick something that is not a year.</p>
    <p>For anything that matters, add your own layer: a short shared secret that must precede commands, or
    simply do not put a Bluetooth module on something whose misuse would be expensive. This is the right radio
    for a lamp and the wrong one for a lock.</p>` },
  { h: 'Range and what affects it',
    body: `<p>A Class 2 HC-05 is about 10&nbsp;m in open air and considerably less through walls - it shares
    2.4&nbsp;GHz with every Wi-Fi network around it.</p>
    <p>The module's chip antenna needs clear space; lying against a battery pack or inside a metal box costs
    you most of the range. If you need more than a room, this is the wrong technology and
    <a href="project.html?p=lora-remote-sensor">LoRa</a> is the right one.</p>` }
],

trouble: [
  { q: '<code>AT</code> returns nothing in AT mode',
    a: `In order: the LED must be blinking <em>slowly</em> (if it is fast you are in data mode); line ending
    must be "Both NL &amp; CR"; the AT-mode baud rate is 38400 not 9600; and TXD must go to the Arduino's
    receive pin. Four causes, and it is nearly always the line ending.` },
  { q: 'It never enters AT mode',
    a: `EN must be HIGH <em>as power is applied</em>, not pulled high afterwards. Power down completely,
    fit the jumper, then power up. If the board has a small button, hold it while connecting power.` },
  { q: 'Paired but the terminal app will not connect',
    a: `Pairing and connecting are separate. Connect from inside the app, not from Android's Bluetooth
    settings. If the app says "connection failed", the module is often still holding a socket open from a
    previous session - power-cycle it.` },
  { q: 'Connected, but typing does nothing',
    a: `Line ending. The parser waits for a newline and the app is sending none. Settings &rarr; Send &rarr;
    Newline. Confirm with the echo sketch, which does not care about line endings.` },
  { q: 'Characters arrive as garbage',
    a: `Baud mismatch between <code>bt.begin()</code> and whatever <code>AT+UART</code> set. If you do not
    know what it is set to, go back into AT mode and ask with <code>AT+UART?</code>.` },
  { q: 'Works, then drops out after a few minutes',
    a: `Usually supply. The module draws bursts during transmission, and a Nano powered from a weak USB port
    with a LED strip attached can dip below what it needs. Give the strip its own supply, or add a
    100&nbsp;uF capacitor across the module's VCC and GND.` },
  { q: 'The LED strip flickers when Bluetooth data arrives',
    a: `SoftwareSerial and FastLED are fighting over interrupts - FastLED disables them while writing the
    strip, so incoming bits get missed, and SoftwareSerial's own interrupt work disturbs the strip timing.
    Keep the strip short, avoid updating it in a tight loop, and if it matters move the radio to hardware
    serial.` },
  { q: 'Temperature reads -127',
    a: `Not a Bluetooth problem - that is the DallasTemperature "no device answered" value. Check the
    4.7&nbsp;k pull-up between the data line and 5&nbsp;V, and check the sensor's pinout: flat face towards
    you, the pins are GND, DQ, VDD left to right.` },
  { q: 'My iPhone cannot see it at all',
    a: `Expected, and not fixable on this module. iOS does not expose Bluetooth Classic SPP to apps. Use an
    HM-10 BLE module or an ESP32 - see the tuning section.` }
],

next: `
<ul>
  <li><strong>When a room is not far enough</strong> - the <a href="project.html?p=lora-remote-sensor">LoRa
  remote sensor</a> covers kilometres instead of metres, with a very different set of trade-offs.</li>
  <li><strong>Board to board rather than phone to board</strong> - the
  <a href="project.html?p=nrf24-sensor-link">nRF24 link</a> is cheaper, faster and has real
  acknowledgements.</li>
  <li><strong>Put the command parser on something bigger.</strong> The same parser drives the
  <a href="project.html?p=rgb-mood-lamp">mood lamp</a> or a
  <a href="project.html?p=smart-plug-relay">mains relay</a> without changing shape.</li>
  <li><strong>Skip Bluetooth entirely.</strong> An ESP32 serving a web page gives you a control panel that
  works on every phone, tablet and laptop with no app and no pairing - which for many projects is simply the
  better answer.</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">Low voltage, three things worth knowing</span>
<ul>
  <li><strong>The divider is not optional.</strong> Feeding 5&nbsp;V into RXD damages the module over time
  rather than instantly, which makes it a confusing fault when it finally appears.</li>
  <li><strong>Sixteen LEDs is about the limit</strong> for the Nano's 5&nbsp;V pin at the brightness this
  sketch uses. If you extend the strip, give it its own supply and common the grounds - see the
  <a href="basics/power.html">power basics</a>.</li>
  <li><strong>Bluetooth 2.x pairing is weak security.</strong> Change the PIN from 1234, and do not put this
  on anything where an unwanted command would be expensive or dangerous. A lamp is a good fit; a lock, a
  heater or anything with a motor is not.</li>
  <li><strong>2.4 GHz is licence-free worldwide</strong> and these modules are certified low-power devices,
  so there is nothing to register - unlike some of the bands in the
  <a href="project.html?p=lora-remote-sensor">LoRa project</a>, where the rules have real teeth.</li>
</ul>
</div>`
});
