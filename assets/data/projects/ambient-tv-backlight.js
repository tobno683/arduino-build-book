/* WS2812B bias lighting behind a screen, driven by an ESP32. */
AB.addProject({
slug: 'ambient-tv-backlight',
title: 'Ambient light behind the TV',
cat: 'light',
level: 3,
time: '3 hours',
solder: true,
board: 'ESP32',
feature: true,
tags: ['ws2812b', 'fastled', 'esp32', 'bias lighting', 'power injection', 'web server'],
blurb: 'Addressable LEDs around the back of a screen, with a web page for colour and effects, and a proper power supply so it does not brown out at white.',

skills: ['WS2812B timing', 'FastLED', 'Power budgeting and injection', 'Level shifting', 'HSV colour', 'Web control'],

intro: `
<p>Bias lighting - a soft glow on the wall behind a screen - genuinely reduces eye strain and makes the picture
look better, because your eye judges black against the surround rather than in isolation. It is also the
project that teaches power properly, because a strip of WS2812Bs is the first thing most people build that
draws more current than their power supply can give.</p>
<p>This build does the arithmetic honestly, injects power at both ends, and includes a current limit in
software so a mistake dims the strip rather than melting the connector.</p>`,

what: [
  'Light a strip of 60 to 120 WS2812B LEDs with an adjustable colour and brightness.',
  'Offer a handful of effects - solid, slow colour cycle, warm candle flicker, and a gentle sunrise.',
  'Serve a page on your network to change all of it from a phone.',
  'Hold a hard current limit so it physically cannot exceed your supply.',
  'Remember its settings through a power cut.'
],

how: `
<p>Each <strong>WS2812B</strong> is an RGB LED with a small controller in the same package. Data goes in one
pin, the LED keeps the first 24 bits for itself, and passes everything after that out to the next one. So a
whole strip needs one data pin - and the protocol is a stream of pulses where a long pulse is a 1 and a short
one a 0, with tolerances of a few hundred nanoseconds. That is why it needs a library with hand-tuned timing
rather than <code>digitalWrite()</code>.</p>
<p><strong>The power is the real content of this project.</strong> One LED at full white is three LEDs lit at
20&nbsp;mA each, so 60&nbsp;mA. Sixty of them is 3.6&nbsp;A; a hundred and twenty is 7.2&nbsp;A. Nobody ever
runs a whole strip at full white, but the supply has to survive it if the code ever asks.</p>
<p>FastLED has <code>setMaxPowerInVoltsAndMilliamps()</code>, which scales the whole frame down before it is
sent so that the calculated draw never exceeds your figure. It is not a fuse - it is arithmetic - but it turns
"the strip browned out and went white and flickery" into "the strip is slightly dimmer than I asked".</p>
<p><strong>Power injection</strong> is the other half. The copper traces on a strip are thin, so by the far end
the voltage has dropped and whites turn pink. Running a second pair of wires from the supply to the far end
fixes it, and is standard practice above about a metre.</p>`,

bom: [
  { id: 'esp32', qty: 1 },
  { id: 'ws2812-strip', qty: 2, as: 'WS2812B strip, 60 LED/m - 2 m', note: 'IP30 (bare) is right for behind a TV. 60 LED/m is the sensible density; 144/m is four times the current for little visual gain here.' },
  { id: 'psu5v3a', qty: 1, note: 'For 120 LEDs at a 30 % duty this is comfortable. Read the power section before you buy - if you want full white, you need a 10 A supply.' },
  { id: 'res220', qty: 1, note: 'In series with the data line, right at the first LED.' },
  { id: 'cap1000', qty: 1, note: 'Across the strip supply at the injection point. FastLED insists on this and it is right.' },
  { id: 'screwterm', qty: 2 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true, note: '18 AWG for the power runs - not the thin stuff. This carries amps.' },
  { id: 'tape', qty: 1 },
  { id: 'heatshrink', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'cutters' }, { id: 'dmm' }, { id: 'usb-meter' }],

build: {
  parts: [
    { id: 'esp',  comp: 'esp32',       at: [0, 0] },
    { id: 'strip', comp: 'ws2812strip', at: [0, -70], opt: { n: 12 } },
    { id: 'psu',  comp: 'block',       at: [0, 66], opt: { w: 70, h: 26, d: 44, c: '#2b2f34' }, label: '5 V 3 A supply' }
  ],
  wires: [
    { from: 'psu.n',    to: 'strip.5V',  color: 'red',    note: '5 V from the supply straight to the strip, in thick wire' },
    { from: 'psu.l',    to: 'strip.GND', color: 'black',  note: 'Supply negative to the strip ground' },
    { from: 'psu.r',    to: 'esp.VIN',   color: 'red',    note: 'Same 5 V feeds the ESP32 VIN pin' },
    { from: 'psu.f',    to: 'esp.GND',   color: 'black',  note: 'COMMON GROUND - required for the data signal to mean anything' },
    { from: 'esp.D5',   to: 'strip.DIN', color: 'green',  note: 'Data, through a 220 ohm resistor at the strip end' }
  ]
},

wireIntro: `<p>Only five connections, but two of them carry several amps and one of them is a signal with
nanosecond timing. Both deserve care.</p>`,

wireNotes: `
<div class="note danger"><span class="t">Work out your current before you buy the supply</span>
<p><strong>LEDs &times; 60&nbsp;mA = worst-case amps.</strong> 60 LEDs = 3.6&nbsp;A. 120 LEDs = 7.2&nbsp;A.</p>
<p>In practice bias lighting runs at 20-40&nbsp;% brightness in a warm colour, which is more like 1&nbsp;A for
120 LEDs. The software limit in the sketch is what makes it safe to use a 3&nbsp;A supply for a strip that
could theoretically want 7 - without it, asking for full white browns the supply out, the first LEDs go white
and the rest flicker randomly, and the supply gets hot.</p></div>

<div class="note warn"><span class="t">Inject power at both ends</span>
<p>Above about a metre, run a second pair of 18&nbsp;AWG wires from the supply to the <em>far</em> end of the
strip - red to +5&nbsp;V, black to GND. The data line is not injected; only power.</p>
<p>Symptom of not doing it: the far end is noticeably dimmer and whites look pink or orange there. That is
voltage drop along the thin copper in the strip.</p></div>

<div class="note warn"><span class="t">The 220 ohm data resistor and the capacitor</span>
<p>The resistor goes in series with the data line as close to the first LED as you can get it - it damps the
ringing on a fast edge that can otherwise corrupt the first pixel or damage its input.</p>
<p>The 1000&nbsp;&micro;F capacitor goes across 5&nbsp;V and GND at the injection point, stripe to ground. It
absorbs the inrush when a lot of LEDs turn on at once.</p></div>

<div class="note tip"><span class="t">3.3 V data into a 5 V strip</span>
<p>Strictly, a WS2812B wants 0.7&times;VCC = 3.5&nbsp;V for a logic high, and an ESP32 gives 3.3. In practice it
almost always works, especially with a short lead. If your first pixel misbehaves or colours are wrong, a
74HCT125 buffer (about 40 cents) fixes it properly. Powering the strip from 4.5&nbsp;V instead of 5&nbsp;V is
the cheap alternative and also works.</p></div>`,

solderSteps: [
  { h: 'Plan where the wires enter the strip',
    body: `<p>Look at the arrows printed on the strip: data flows in the direction they point. The end with the
    arrows pointing <em>away</em> is the input end, and that is where DIN, 5&nbsp;V and GND go.</p>
    <p>Getting this wrong means a strip that lights not at all, with no other symptom.</p>` },
  { h: 'Cut only on the marked lines',
    body: `<p>The strip has copper pads with a line through the middle every LED. Cut exactly on that line so
    each half keeps a full pad. Cut anywhere else and you have half a pad to solder to, which is genuinely
    difficult.</p>` },
  { h: 'Solder the strip pads fast',
    body: `<p>The adhesive backing and the silicone sleeve both melt. Tin the pad (one second), tin the wire,
    then hold them together and touch for one second. Do not hover.</p>
    <p>If the pad lifts, you were too slow, not too hot. Turn the iron up to 360&nbsp;&deg;C and move
    faster.</p>` },
  { h: 'Strain-relieve every strip joint',
    body: `<p>Put a blob of hot glue over the three joints, or a piece of heat-shrink over the whole strip end.
    These pads tear off the flexible PCB if the wire is ever pulled, and that failure is permanent.</p>` },
  { h: 'The distribution board',
    body: `<p>A small perfboard with two screw terminals - one for the supply in, one for the strip out - plus a
    socket for the ESP32, the 1000&nbsp;&micro;F capacitor and the 220&nbsp;&Omega; in the data line.</p>
    <p>Use thick solid core, or better, run a bare 18&nbsp;AWG wire along the board and solder to it at each
    point. Perfboard traces are not rated for 3&nbsp;A.</p>` },
  { h: 'The injection pair',
    body: `<p>18&nbsp;AWG red and black from the same screw terminal to the far end of the strip. Solder to the
    far end's + and GND pads. Do not connect anything to DOUT.</p>` },
  { h: 'Check before power',
    body: `<p>5&nbsp;V to GND at the strip end: <strong>no beep</strong>. Continuity from the supply terminal to
    both ends of the strip: beep. Data line to 5&nbsp;V should read 220&nbsp;ohm.</p>
    <p>Then power up with the sketch set to a dim red, and only wind it up once you are sure.</p>` }
],

assembly: [
  { h: 'Measure the back of the screen first',
    body: `<p>Perimeter minus the stand. A 55-inch TV is roughly 3.3&nbsp;m round, which at 60&nbsp;LED/m is
    200 LEDs and about 12&nbsp;A worst case - which is why most people light only the top and sides, or use
    30&nbsp;LED/m.</p>
    <p>For a monitor, a single 1&nbsp;m run across the top is often all you want.</p>` },
  { h: 'Stick the strip 3-5 cm in from the edge',
    body: `<p>Facing the wall, not the room. You want reflected light, not a visible line of LEDs. Clean the
    plastic with alcohol first - the adhesive on cheap strips does not hold on dusty plastic.</p>` },
  { h: 'Leave the corners loose',
    body: `<p>Do not bend the strip tightly round a corner - it cracks the copper. Either cut and solder a short
    jumper round each corner, or leave a gentle loop.</p>` },
  { h: 'Run the sketch dim first',
    body: `<p>Set brightness to 40 and a warm white. Check the far end is the same colour as the near end. If it
    is pinker, your injection is not working.</p>` },
  { h: 'Measure the actual current',
    body: `<p>A USB power meter in line, or a multimeter on the 10&nbsp;A range in series with the supply
    positive. Set it to full white at full brightness briefly and see what it really draws. That number, not
    the arithmetic, tells you whether your supply is right.</p>` }
],

libraries: [
  { name: 'FastLED', by: 'Daniel Garcia / Mark Kriegsman', why: 'Bit-bangs the WS2812B protocol, does HSV colour properly, and includes the power limiter.' },
  { name: 'esp32 board package', by: 'Espressif', how: 'Boards Manager', why: 'Wi-Fi, the web server and Preferences.' }
],

code: [{
  name: 'tv_backlight.ino',
  code: `/* ------------------------------------------------------------------
   Ambient backlight
   WS2812B on GPIO 5, controlled from a web page.
   Board: ESP32 Dev Module
   ------------------------------------------------------------------ */

#include <FastLED.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>

// ---- change these ----------------------------------------------------
const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";

#define LED_PIN     5
#define NUM_LEDS  120
#define MAX_MILLIAMPS 2500     // BE HONEST. Your supply's rating, minus 20%.
// ----------------------------------------------------------------------

CRGB leds[NUM_LEDS];
WebServer web(80);
Preferences prefs;

uint8_t mode = 0;              // 0 solid, 1 cycle, 2 candle, 3 sunrise
uint8_t hue = 30;              // 0-255. 30 is a warm amber
uint8_t sat = 200;
uint8_t brightness = 70;       // 0-255
unsigned long sunriseStart = 0;

void setup() {
  Serial.begin(115200);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setCorrection(TypicalLEDStrip);

  // The safety net: FastLED scales every frame so the computed draw
  // never exceeds this. Without it, full white browns out the supply.
  FastLED.setMaxPowerInVoltsAndMilliamps(5, MAX_MILLIAMPS);

  prefs.begin("light", false);
  mode       = prefs.getUChar("mode", 0);
  hue        = prefs.getUChar("hue", 30);
  sat        = prefs.getUChar("sat", 200);
  brightness = prefs.getUChar("bri", 70);

  FastLED.setBrightness(brightness);
  fill_solid(leds, NUM_LEDS, CHSV(hue, sat, 255));
  FastLED.show();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) delay(250);
  Serial.println(WiFi.localIP());

  web.on("/", handleRoot);
  web.on("/set", handleSet);
  web.begin();
}

void loop() {
  web.handleClient();
  render();
  FastLED.show();
  FastLED.delay(12);            // ~80 fps, and it services the LED timing
}

/* --- the effects ------------------------------------------------------ */
void render() {
  switch (mode) {

    case 0:                                   // solid
      fill_solid(leds, NUM_LEDS, CHSV(hue, sat, 255));
      break;

    case 1: {                                 // slow colour cycle
      uint8_t h = hue + (millis() / 120);
      for (int i = 0; i < NUM_LEDS; i++) {
        leds[i] = CHSV(h + i / 3, sat, 255);  // a gentle gradient along the strip
      }
      break;
    }

    case 2: {                                 // candle flicker
      for (int i = 0; i < NUM_LEDS; i++) {
        // inoise8 gives smooth noise rather than the jittery mess
        // that random() produces - this is what makes it look like fire
        uint8_t n = inoise8(i * 40, millis() / 6);
        uint8_t v = 140 + scale8(n, 115);
        leds[i] = CHSV(22 + (n >> 5), 220, v);
      }
      break;
    }

    case 3: {                                 // 15-minute sunrise
      unsigned long elapsed = millis() - sunriseStart;
      const unsigned long TOTAL = 15UL * 60UL * 1000UL;
      uint8_t p = (elapsed >= TOTAL) ? 255 : (uint8_t)(elapsed * 255UL / TOTAL);
      uint8_t h = map(p, 0, 255, 0, 40);      // deep red -> warm white
      uint8_t s = map(p, 0, 255, 255, 120);
      fill_solid(leds, NUM_LEDS, CHSV(h, s, 255));
      FastLED.setBrightness(map(p, 0, 255, 2, brightness));
      if (p == 255) { mode = 0; FastLED.setBrightness(brightness); }
      break;
    }
  }
}

/* --- the web page ----------------------------------------------------- */
void handleRoot() {
  String h = F(
    "<!doctype html><html><head><meta name=viewport content='width=device-width,initial-scale=1'>"
    "<title>Backlight</title><style>"
    "body{font:16px system-ui;margin:0;padding:22px;background:#15171a;color:#eee}"
    "form{max-width:420px;margin:0 auto}label{display:block;margin:16px 0 6px;font-size:13px;opacity:.7}"
    "input[type=range]{width:100%}select,button{width:100%;padding:12px;border-radius:9px;font-size:16px}"
    "select{background:#202429;color:#eee;border:1px solid #333}"
    "button{margin-top:20px;border:0;background:#b4662b;color:#fff}"
    "</style></head><body><form action='/set'><h2>Backlight</h2>");

  h += F("<label>Mode</label><select name='m'>");
  const char* names[] = { "Solid", "Colour cycle", "Candle", "Sunrise (15 min)" };
  for (int i = 0; i < 4; i++) {
    h += "<option value='"; h += i; h += "'";
    if (mode == i) h += F(" selected");
    h += ">"; h += names[i]; h += F("</option>");
  }
  h += F("</select>");

  h += F("<label>Colour</label><input type='range' name='h' min='0' max='255' value='"); h += hue; h += F("'>");
  h += F("<label>Saturation</label><input type='range' name='s' min='0' max='255' value='"); h += sat; h += F("'>");
  h += F("<label>Brightness</label><input type='range' name='b' min='1' max='255' value='"); h += brightness; h += F("'>");
  h += F("<button type='submit'>Apply</button></form></body></html>");

  web.send(200, "text/html", h);
}

void handleSet() {
  if (web.hasArg("m")) mode = constrain(web.arg("m").toInt(), 0, 3);
  if (web.hasArg("h")) hue = constrain(web.arg("h").toInt(), 0, 255);
  if (web.hasArg("s")) sat = constrain(web.arg("s").toInt(), 0, 255);
  if (web.hasArg("b")) {
    brightness = constrain(web.arg("b").toInt(), 1, 255);
    FastLED.setBrightness(brightness);
  }
  if (mode == 3) sunriseStart = millis();

  prefs.putUChar("mode", mode);
  prefs.putUChar("hue", hue);
  prefs.putUChar("sat", sat);
  prefs.putUChar("bri", brightness);

  web.sendHeader("Location", "/");
  web.send(303);
}`,
  after: `<p>Two things worth stealing for other projects:</p>
  <ul>
    <li><strong><code>CHSV</code> rather than <code>CRGB</code>.</strong> Hue-saturation-value is how people
    think about colour: changing one number sweeps through the rainbow, which in RGB would take three
    coordinated changes.</li>
    <li><strong><code>inoise8()</code> for the candle.</strong> Perlin noise is smooth and correlated over time,
    so it looks like a flame. <code>random8()</code> is uncorrelated and looks like a fault.</li>
  </ul>`
}],

upload: `
<p>Board: ESP32 Dev Module. Upload with the LED supply <em>off</em> and the ESP32 on USB - it is easier to
debug without amps in the circuit.</p>
<p>Then connect the strip, power up the supply, and open the IP in a browser.</p>
<div class="note warn"><span class="t">Do not power the strip from USB</span>
<p>A USB port gives 500&nbsp;mA, which is eight LEDs at full white. It will look like it works for a moment and
then the colours will go wrong. Use the real supply from the start.</p></div>`,

tune: [
  { h: 'Set MAX_MILLIAMPS honestly',
    body: `<p>Take your supply's rating and use 80&nbsp;% of it. A 3&nbsp;A supply gets <code>2500</code>. This
    is the single most important number in the sketch: too high and you brown out, too low and the strip is
    dimmer than it needs to be.</p>` },
  { h: 'Get the colour order right',
    body: `<p><code>GRB</code> is correct for almost all WS2812B. If red and green are swapped, change it to
    <code>RGB</code>. Some clones are <code>BGR</code>. The symptom is unmistakable - ask for red and get
    green.</p>` },
  { h: 'Find a warm white that does not look green',
    body: `<p>Hue 30, saturation 180-210 gives a pleasant candle-ish warm white. <code>CRGB::White</code> on a
    cheap strip usually looks slightly green, which is what <code>setCorrection(TypicalLEDStrip)</code> is
    compensating for.</p>` },
  { h: 'Choose a brightness that actually helps',
    body: `<p>Bias lighting works best at roughly 10&nbsp;% of the screen's own brightness. In a dark room,
    FastLED brightness 40-80 is about right; 255 is a disco.</p>` },
  { h: 'If the far end is pink',
    body: `<p>Voltage drop. Measure with a multimeter at both ends of the strip while it is lit - if the far end
    reads below about 4.3&nbsp;V, your injection wires are too thin or not connected. 18&nbsp;AWG minimum.</p>` }
],

trouble: [
  { q: 'Nothing lights at all',
    a: `Wrong end of the strip - data goes in the direction the arrows point. Then check the common ground
    between the ESP32 and the supply; without it the data signal has no reference and nothing works.` },
  { q: 'Only the first LED lights, in white',
    a: `Classic sign of a data signal that is not being understood. Check the 220&nbsp;&Omega; is in series and
    not to ground, shorten the data lead, and consider a level shifter.` },
  { q: 'Colours are wrong',
    a: `Colour order. Try <code>RGB</code> or <code>BGR</code> in the <code>addLeds</code> line.` },
  { q: 'Random flickering, especially when bright',
    a: `Power. Measure the voltage at the strip while it is lit - if it sags below 4.5&nbsp;V you need a bigger
    supply, thicker wires, or injection at both ends.` },
  { q: 'The last few LEDs flicker but the rest are fine',
    a: `Voltage drop along the strip. Inject at the far end.` },
  { q: 'Everything works, then a section goes dead',
    a: `One LED has failed, and every LED after it in the chain stops too because the data passes through each
    one. Cut out the dead LED and bridge the three pads across the gap.` },
  { q: 'ESP32 resets when the strip is bright',
    a: `It is sharing a sagging supply. Give the ESP32 its own regulator or feed it from USB while you debug.` },
  { q: 'Strip gets warm',
    a: `Normal at high brightness. Hot enough to be uncomfortable means you are running close to the limit -
    lower <code>MAX_MILLIAMPS</code>, and never run a strip coiled up on its reel at full brightness.` }
],

next: `
<ul>
  <li><strong>Make it follow the screen</strong>: a Hyperion or Prismatik setup on a computer reads the screen
  edges and sends colours over serial or Wi-Fi. This strip is already the hardware for it.</li>
  <li><strong>Put it on Home Assistant</strong> with MQTT or by flashing WLED, which turns the same hardware
  into a fully-featured light with about a hundred effects and no code at all.</li>
  <li><strong>Use the sunrise mode as an alarm</strong> with an RTC, and wake up to fifteen minutes of dawn
  instead of a buzzer.</li>
  <li><strong>Build the <a href="project.html?p=infinity-mirror">infinity mirror</a></strong> - same LEDs, very
  different object.</li>
</ul>`
});
