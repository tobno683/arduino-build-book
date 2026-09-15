/* MAX7219 4-in-1 matrix scrolling sign, text set over Wi-Fi. */
AB.addProject({
slug: 'led-matrix-sign',
title: 'Scrolling message sign',
cat: 'display',
level: 2,
time: '2 hours',
solder: false,
board: 'D1 Mini',
tags: ['max7219', 'led matrix', 'esp8266', 'scrolling', 'web server', 'sign'],
blurb: 'Thirty-two by eight red pixels that scroll whatever you type into a web page on your phone. Chainable to any length.',

skills: ['SPI daisy-chaining', 'Fonts and bitmaps', 'Frame timing', 'Simple web forms', 'Flash storage'],

intro: `
<p>A four-module MAX7219 matrix is 256 individually addressable LEDs for about $3.50, chained on three wires,
and it is the most immediately satisfying display you can buy. This build puts a small web page on it so anyone
on your Wi-Fi can change the message from a phone - which is what turns it from a demo into a thing on a
shelf.</p>
<p>It needs no soldering at all if your modules come with their connectors fitted, which they almost always do.</p>`,

what: [
  'Scroll a message across four chained 8x8 matrices, smoothly, at an adjustable speed.',
  'Let anyone on your network set the text from a web page, with no app.',
  'Remember the message and settings through a power cut.',
  'Switch between scrolling, static and a centred clock.',
  'Adjust brightness from the same page, from barely visible to eye-watering.'
],

how: `
<p>The <strong>MAX7219</strong> is an LED driver that multiplexes an 8&times;8 matrix: it lights one row at a
time, 800 times a second, fast enough that your eye sees a solid image. It holds the frame in its own registers,
so the microcontroller only sends changes - and it has a hardware brightness control, so dimming does not
flicker.</p>
<p>The <strong>chaining</strong> is the elegant part. Each module has a DIN on one side and a DOUT on the
other. Data clocked into the first module eventually spills out of DOUT into the second. So four modules need
exactly the same three wires as one, and the library treats them as a 32&times;8 canvas.</p>
<p><strong>Scrolling</strong> is just redrawing the whole canvas one pixel further along, every few
milliseconds. The library keeps a font of 8-pixel-tall characters and handles the bookkeeping; what you control
is the delay between shifts, which is the scroll speed.</p>`,

bom: [
  { id: 'esp8266', qty: 1, note: 'D1 Mini. An Uno works if you drop the web page and hard-code the text.' },
  { id: 'max7219', qty: 1, note: 'The "4 in 1" module - four matrices on one PCB, already chained. Buy two and chain them for 64x8.' },
  { id: 'psu5v3a', qty: 1, note: 'Four matrices at full brightness is about 600 mA. A phone charger is fine; a laptop USB port is marginal.' },
  { id: 'jumpers', qty: 1, own: true, note: 'Five female-to-female.' },
  { id: 'cap1000', qty: 1, own: true, note: 'Across the matrix 5 V and GND. Optional, but it stops the flicker when a lot of LEDs switch on at once.' },
  { id: 'box-abs', qty: 1, note: 'Or a strip of wood and some standoffs - the module is a nice-looking object as it is.' }
],

tools: [
  { id: 'dmm', why: 'Optional. Handy for confirming the modules really are getting 5 V at the far end of the chain.' }
],

build: {
  parts: [
    { id: 'esp', comp: 'esp8266', at: [0, 44] },
    { id: 'mtx', comp: 'max7219', at: [0, -32], ry: 180 }
  ],
  wires: [
    { from: 'mtx.VCC', to: 'esp.5V',  color: 'red',    note: '5 V. The matrix runs from 5 V even though the ESP8266 is a 3.3 V part' },
    { from: 'mtx.GND', to: 'esp.GND', color: 'black',  note: 'Ground' },
    { from: 'mtx.DIN', to: 'esp.D7',  color: 'blue',   note: 'Data in. D7 is the ESP8266 hardware MOSI' },
    { from: 'mtx.CLK', to: 'esp.D5',  color: 'green',  note: 'Clock. D5 is the hardware SCK' },
    { from: 'mtx.CS',  to: 'esp.D8',  color: 'yellow', note: 'Chip select, sometimes labelled LOAD or LD on the module' }
  ]
},

wireIntro: `<p>Five wires and no soldering. Connect to the <strong>DIN</strong> end of the module - the one
whose arrow points away from the connector. Getting the ends the wrong way round gives you a blank display and
no other clue.</p>`,

wireNotes: `
<div class="note tip"><span class="t">3.3 V logic into a 5 V driver works</span>
<p>The MAX7219 reads anything above 3.5&nbsp;V as a logic high when it is powered from 5&nbsp;V, so the
ESP8266's 3.3&nbsp;V signals are marginal on paper and reliable in practice. Thousands of these are built this
way. If yours is flaky, a 74HCT125 buffer or a level shifter fixes it properly.</p></div>

<div class="note warn"><span class="t">Power matters more than you expect</span>
<p>256 LEDs at full brightness is around 600&nbsp;mA, and it switches on and off as the text scrolls. Feed the
matrix's 5&nbsp;V from the supply directly rather than through the D1 Mini's pin header, and put a
1000&nbsp;&micro;F capacitor across it. Symptoms of not doing this: flickering, the ESP resetting, or
characters appearing corrupted at high brightness only.</p></div>

<div class="note"><span class="t">Chaining more modules</span>
<p>DOUT of one board to DIN of the next, plus 5&nbsp;V and ground. Change <code>MAX_DEVICES</code> in the
sketch to the total number of 8&times;8 blocks - so two 4-in-1 boards is 8, not 2. Beyond about eight modules,
inject 5&nbsp;V at both ends of the chain.</p></div>`,

assembly: [
  { h: 'Plug it together and run the built-in example first',
    body: `<p>Install the MD_Parola and MD_MAX72XX libraries, then open
    <strong>File &rarr; Examples &rarr; MD_Parola &rarr; Parola_HelloWorld</strong> and set the hardware type.
    Getting the library's own example working first separates "wiring wrong" from "my code wrong".</p>` },
  { h: 'Find your hardware type - this is the step everyone skips',
    body: `<p>There are four wiring variants of these modules and the library cannot detect which you have. If
    your text is mirrored, upside down, or split into blocks in the wrong order, you have the wrong constant.
    Try each of these in turn:</p>
    <ul>
      <li><code>MD_MAX72XX::FC16_HW</code> - the most common 4-in-1 board</li>
      <li><code>MD_MAX72XX::PAROLA_HW</code></li>
      <li><code>MD_MAX72XX::GENERIC_HW</code></li>
      <li><code>MD_MAX72XX::ICSTATION_HW</code></li>
    </ul>
    <p>The library ships an example called <code>MD_MAX72xx_HW_Mapper</code> that walks you through it
    properly.</p>` },
  { h: 'Upload the sign sketch and find its address',
    body: `<p>Serial Monitor at 115200. It prints an IP and also scrolls it across the display at boot, which
    is more useful than it sounds when the sign is sitting on a shelf and your laptop is elsewhere.</p>` },
  { h: 'Set a message from your phone',
    body: `<p>Open the IP in any browser. Type, press Set, and the sign changes immediately.</p>` },
  { h: 'Mount it',
    body: `<p>The bare module looks good on a small wooden stand. If you box it, put a sheet of dark red acrylic
    in front - it lifts the contrast dramatically and hides the unlit LEDs.</p>` }
],

libraries: [
  { name: 'MD_Parola', by: 'MajicDesigns', why: 'Scrolling, animations and text effects on a matrix.' },
  { name: 'MD_MAX72XX', by: 'MajicDesigns', why: 'The driver underneath. Installed as a dependency.' },
  { name: 'esp8266 board package', by: 'ESP8266 Community', how: 'Boards Manager', why: 'Wi-Fi and the web server.' }
],

code: [{
  name: 'matrix_sign.ino',
  code: `/* ------------------------------------------------------------------
   Scrolling message sign
   MAX7219 4-in-1 on SPI, text set from a web page.
   Board: LOLIN(WEMOS) D1 R2 & mini
   ------------------------------------------------------------------ */

#include <MD_Parola.h>
#include <MD_MAX72xx.h>
#include <SPI.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>

// ---- change these ----------------------------------------------------
const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";

// If the text is mirrored or scrambled, this is the line to change.
#define HARDWARE_TYPE MD_MAX72XX::FC16_HW
#define MAX_DEVICES   4          // count 8x8 blocks, not boards
// ----------------------------------------------------------------------

#define CS_PIN  D8               // DIN -> D7, CLK -> D5 are fixed by SPI

MD_Parola sign = MD_Parola(HARDWARE_TYPE, CS_PIN, MAX_DEVICES);
ESP8266WebServer web(80);

char message[128] = "hello";
uint8_t brightness = 4;          // 0-15
uint8_t speed = 40;              // ms between frames; lower is faster
bool scrolling = true;

void setup() {
  Serial.begin(115200);
  EEPROM.begin(160);
  loadSettings();

  sign.begin();
  sign.setIntensity(brightness);
  sign.displayClear();
  sign.setTextAlignment(PA_CENTER);
  sign.print("wifi");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) delay(200);

  String ip = (WiFi.status() == WL_CONNECTED)
    ? WiFi.localIP().toString() : String("no wifi");
  Serial.println(ip);

  // Scroll the address once so you can find it without a computer.
  sign.displayText(ip.c_str(), PA_CENTER, 40, 1200, PA_SCROLL_LEFT, PA_SCROLL_LEFT);
  while (!sign.displayAnimate()) { delay(1); }

  web.on("/", handleRoot);
  web.on("/set", handleSet);
  web.begin();

  startMessage();
}

void loop() {
  web.handleClient();
  if (sign.displayAnimate()) sign.displayReset();   // loop the scroll
}

/* --- the sign --------------------------------------------------------- */
void startMessage() {
  sign.setIntensity(brightness);
  if (scrolling) {
    sign.displayText(message, PA_LEFT, speed, 0, PA_SCROLL_LEFT, PA_SCROLL_LEFT);
  } else {
    sign.displayText(message, PA_CENTER, speed, 0, PA_PRINT, PA_NO_EFFECT);
  }
  sign.displayReset();
}

/* --- settings that survive a power cut -------------------------------- */
void loadSettings() {
  if (EEPROM.read(0) != 0x7E) return;            // never saved
  brightness = EEPROM.read(1);
  speed      = EEPROM.read(2);
  scrolling  = EEPROM.read(3);
  for (int i = 0; i < 127; i++) message[i] = EEPROM.read(8 + i);
  message[127] = 0;
  if (brightness > 15) brightness = 4;
  if (speed < 5 || speed > 200) speed = 40;
}

void saveSettings() {
  EEPROM.write(0, 0x7E);
  EEPROM.write(1, brightness);
  EEPROM.write(2, speed);
  EEPROM.write(3, scrolling ? 1 : 0);
  for (int i = 0; i < 127; i++) EEPROM.write(8 + i, message[i]);
  EEPROM.commit();
}

/* --- the web page ----------------------------------------------------- */
void handleRoot() {
  String h = F(
    "<!doctype html><html><head><meta name=viewport content='width=device-width,initial-scale=1'>"
    "<title>Sign</title><style>"
    "body{font:16px system-ui;margin:0;padding:22px;background:#15171a;color:#eee}"
    "form{max-width:420px;margin:0 auto}label{display:block;margin:14px 0 4px;font-size:13px;opacity:.7}"
    "input,select{width:100%;padding:11px;border-radius:9px;border:1px solid #333;background:#202429;color:#eee;font-size:16px}"
    "button{margin-top:18px;width:100%;padding:14px;border:0;border-radius:9px;background:#b4662b;color:#fff;font-size:17px}"
    "</style></head><body><form action='/set'>"
    "<h2>Message sign</h2>");

  h += F("<label>Text</label><input name='m' maxlength='120' value='");
  h += message;
  h += F("'>");

  h += F("<label>Brightness (0-15)</label><input name='b' type='number' min='0' max='15' value='");
  h += brightness;
  h += F("'>");

  h += F("<label>Speed (5 fast - 200 slow)</label><input name='s' type='number' min='5' max='200' value='");
  h += speed;
  h += F("'>");

  h += F("<label>Mode</label><select name='k'><option value='1'");
  if (scrolling) h += F(" selected");
  h += F(">Scroll</option><option value='0'");
  if (!scrolling) h += F(" selected");
  h += F(">Static</option></select>");

  h += F("<button type='submit'>Set</button></form></body></html>");
  web.send(200, "text/html", h);
}

void handleSet() {
  if (web.hasArg("m")) {
    web.arg("m").toCharArray(message, sizeof(message));
  }
  if (web.hasArg("b")) brightness = constrain(web.arg("b").toInt(), 0, 15);
  if (web.hasArg("s")) speed      = constrain(web.arg("s").toInt(), 5, 200);
  if (web.hasArg("k")) scrolling  = web.arg("k").toInt() == 1;

  saveSettings();
  startMessage();

  web.sendHeader("Location", "/");
  web.send(303);
}`,
  after: `<p><code>displayAnimate()</code> returns true when an animation has finished, which is why the whole
  of <code>loop()</code> is two lines: call it constantly, and reset when it says it is done. The library keeps
  the frame timing internally, so adding the web server costs the scroll nothing.</p>`
}],

upload: `
<p>Board: LOLIN(WEMOS) D1 R2 &amp; mini. Upload, then watch the display - it scrolls its own IP address once
at boot, which saves you going to find the Serial Monitor.</p>
<div class="note tip"><span class="t">If nothing lights at all</span>
<p>Before suspecting the code, run the library's <code>MD_MAX72xx_Test</code> example. It walks every LED. If
that is blank too, the fault is wiring or the DIN/DOUT end.</p></div>`,

tune: [
  { h: 'Get the hardware type right',
    body: `<p>Four variants, one constant. Mirrored text means the wrong one. There is no way to detect it in
    software - just try all four; it takes two minutes.</p>` },
  { h: 'Speed that reads well',
    body: `<p>Around 40&nbsp;ms per frame is comfortable reading speed for an adult. 25 is brisk, 80 is
    soporific. Test it from the distance you will actually read it - a sign that scrolls nicely at arm's length
    is too fast across a room.</p>` },
  { h: 'Brightness',
    body: `<p>Level 0 is perfectly readable indoors and draws a fraction of the current. Levels above about 8
    are for daylight and make the power supply the limiting factor. If characters corrupt at high brightness
    only, that is a power problem, not a code problem.</p>` },
  { h: 'Special characters and accents',
    body: `<p>The default font is ASCII only, so accented letters come out as gaps. MD_MAX72XX supports custom
    fonts - its <code>MD_MAX72xx_Font_Builder</code> example generates one - which is how you get an
    <em>&auml;</em> or a <em>&oslash;</em>.</p>` },
  { h: 'Add a clock mode',
    body: `<p>The ESP8266 can fetch NTP time in about four lines. Then switch between the message and the time
    every ten seconds and you have a sign that is useful even when nobody has set a message.</p>` }
],

trouble: [
  { q: 'Nothing lights up at all',
    a: `Connected to the DOUT end instead of DIN. The module has an arrow; data flows in the direction it
    points. Swap ends before anything else.` },
  { q: 'Only the first block lights up',
    a: `<code>MAX_DEVICES</code> is set to 1. Count 8&times;8 blocks: a "4 in 1" board is 4.` },
  { q: 'Text is mirrored or the blocks are out of order',
    a: `Wrong <code>HARDWARE_TYPE</code>. Try the other three.` },
  { q: 'Flickers, especially with a lot of lit pixels',
    a: `Power. Feed 5&nbsp;V to the matrix directly from the supply, not through the microcontroller, and add a
    1000&nbsp;&micro;F capacitor.` },
  { q: 'Random pixels light or the display glitches',
    a: `3.3&nbsp;V logic marginal at the MAX7219, or long wires. Shorten the leads to under 150&nbsp;mm and try
    again; if it persists, add a level shifter on DIN, CLK and CS.` },
  { q: 'Web page loads but the text never changes',
    a: `The message is being set but <code>startMessage()</code> is not being reached - check the Serial
    Monitor for an exception. Also make sure the form field names match the <code>hasArg</code> strings.` },
  { q: 'Message is lost on reboot',
    a: `<code>EEPROM.commit()</code> is missing, or <code>EEPROM.begin()</code> was called with too small a
    size. The ESP8266 EEPROM is emulated in flash and needs both.` }
],

next: `
<ul>
  <li><strong>Chain more.</strong> Two boards is 64&times;8 and enough for a whole short sentence at once.</li>
  <li><strong>Show something useful</strong>: next bus, current temperature from the
  <a href="project.html?p=desk-weather-station">weather station</a>, or an unread count from a webhook.</li>
  <li><strong>Make it a clock</strong> with NTP, with the message as a secondary screen.</li>
  <li><strong>Drive it from MQTT</strong> so Home Assistant can push notifications to it - a physical
  notification surface is a surprisingly good use of a spare display.</li>
</ul>`
});
