/* Fading a lamp so an eye believes it. Perception is logarithmic and PWM is not. */
AB.addProject({
slug: 'sunrise-lamp',
title: 'Sunrise alarm lamp',
cat: 'light',
level: 2,
time: '4 hours',
solder: true,
board: 'ESP32',
tags: ['wake light', 'gamma correction', 'pwm', 'colour temperature', 'circadian', 'ntp', 'ws2812', 'esp32'],
blurb: 'Brightens over thirty minutes from a dim red to full daylight, so you wake up before the alarm goes off. Getting the fade to look natural is a lesson in the difference between what a number says and what an eye sees.',

skills: ['Gamma correction', 'Colour temperature', 'Perceptual vs linear scales', 'Scheduling with NTP', 'Low-light PWM resolution', 'Designing for a dark room'],

intro: `
<p>A wake light brightens gradually before your alarm, which is a much gentler way to wake up than a noise at
full volume. Commercial ones cost $80 to $200.</p>
<p>The build is a strip of addressable LEDs and an ESP32, and it takes an evening. The reason it is worth
writing up is that the obvious implementation - fade the brightness value from 0 to 255 over thirty minutes -
looks wrong, and understanding why is genuinely useful for anything involving light.</p>`,

what: [
  'Fade from nothing to full brightness over a configurable period, smoothly.',
  'Shift colour temperature as it goes, from deep amber to daylight white.',
  'Look linear to the eye, which means not being linear in the numbers.',
  'Keep time over NTP, including handling clock changes and weekends.',
  'Not be visible at all for the first few minutes, which is harder than it sounds.'
],

how: `
<p><strong>Your eye is logarithmic and PWM is linear.</strong> Perceived brightness roughly follows the cube
root of actual light output. So going from PWM 0 to 128 looks like most of the journey, and 128 to 255 looks
like a small final step.</p>
<p>A linear fade therefore appears to shoot up fast and then crawl. The fix is <strong>gamma correction</strong>:
raise the desired perceptual level to a power of about 2.2 before writing it out. Then equal steps in your
fade look like equal steps of brightness.</p>
<p>This one change is the difference between a fade that looks cheap and one that looks like dawn.</p>

<p><strong>The bottom end is where resolution runs out.</strong> Eight-bit PWM gives 256 levels. After gamma
correction, the lowest few perceptual steps all map to PWM values of 0 or 1 - so the first several minutes of
your thirty-minute fade are either off or visibly stepping.</p>
<p>Two answers. Use more bits: the ESP32's LEDC peripheral does 12 or 16, and WS2812s can be dithered in
software. Or accept it and start the fade at the lowest visible level rather than at zero, which is what the
sketch does.</p>
<p>In a dark bedroom at 5 am, the lowest visible level is much lower than you expect.</p>

<p><strong>Colour temperature matters as much as brightness.</strong> Real dawn starts deep red-orange and
moves to blue-white. Physiologically this matters: blue light suppresses melatonin, which is exactly what you
want at the end of the fade and exactly what you do not want at the start.</p>
<p>So run two ramps. Brightness from nothing to full over thirty minutes, and colour from around 1800&nbsp;K
to 5000&nbsp;K over the same period, with the colour ramp lagging slightly - the first ten minutes stay amber
while the light comes up.</p>

<p><strong>Approximating a black body with RGB.</strong> Proper colour temperature needs a curve, but a
reasonable approximation over 1500&nbsp;K to 6500&nbsp;K is three simple functions of temperature. It is not
colorimetrically exact and it does not need to be - it needs to look like a sunrise in a bedroom.</p>

<p><strong>Waking the sleeper is not the only requirement.</strong> The lamp also has to not wake the other
person in the room, not glow visibly when it is off, and not flash at full brightness when the power comes back
after a cut. That last one is worth designing in - store the state, and come back up dark.</p>`,

bom: [
  { id: 'ws2812-strip', qty: 1, note: 'A metre of 60/m. Addressable means one data pin, and per-LED colour makes the temperature ramp possible.' },
  { id: 'esp32', qty: 1, note: 'Wi-Fi for NTP, so the alarm time is always right including clock changes.' },
  { id: 'diffuser', qty: 1, note: 'Essential. Bare LEDs are a row of dots; behind a diffuser it is a glow. This matters more than any code.' },
  { id: 'res220', qty: 1, note: 'On the data line, at the strip.' },
  { id: 'cap1000', qty: 1, note: 'Across the strip power, at the strip.' },
  { id: 'psu5v3a', qty: 1, note: 'A metre of WS2812 at full white is nearly 3 A. Do not power it from USB.' },
  { id: 'button', qty: 2, note: 'Snooze and a manual on/off - you want to use it as a lamp too.' },
  { id: 'rotary', qty: 1, note: 'Setting the alarm time. Much nicer than a phone app you will not build.' },
  { id: 'oled13', qty: 1, note: 'Time and alarm. Dim it at night or it becomes its own light source.' },
  { id: 'box-abs', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',      at: [0, 68] },
    { id: 'bb',   comp: 'bb400',      at: [0, 4] },
    { id: 'strip',comp: 'ws2812strip',at: [0, -56] },
    { id: 'enc',  comp: 'rotary',     at: [-58, -28] },
    { id: 'oled', comp: 'oled13',     at: [52, -30] },
    { id: 'b1',   comp: 'button',     at: [-62, -84] }
  ],
  wires: [
    { from: 'mcu.VIN',   to: 'bb.T+1',  color: 'red',    note: '5 V from the external supply, onto the rail' },
    { from: 'mcu.GND',   to: 'bb.T-1',  color: 'black',  note: 'Ground rail - supply and board must share it' },
    { from: 'strip.5V',  to: 'bb.T+5',  color: 'red',    note: 'Strip power, with the 1000 uF right here' },
    { from: 'strip.GND', to: 'bb.T-5',  color: 'black',  note: 'Strip ground' },
    { from: 'strip.DIN', to: 'bb.e10',  color: 'green',  note: 'Data through the 220 ohm resistor' },
    { from: 'bb.a10',    to: 'mcu.D25', color: 'green',  note: 'Resistor to the ESP32 pin' },
    { from: 'enc.VCC',   to: 'bb.T+14', color: 'red',    note: 'Encoder power' },
    { from: 'enc.GND',   to: 'bb.T-14', color: 'black',  note: 'Encoder ground' },
    { from: 'enc.CLK',   to: 'mcu.D18', color: 'blue',   note: 'Encoder A' },
    { from: 'enc.DT',    to: 'mcu.D19', color: 'yellow', note: 'Encoder B' },
    { from: 'enc.SW',    to: 'mcu.D5',  color: 'white',  note: 'Encoder push - sets the alarm' },
    { from: 'oled.VCC',  to: 'bb.T+20', color: 'red',    note: 'Display power' },
    { from: 'oled.GND',  to: 'bb.T-20', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA',  to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'oled.SCL',  to: 'mcu.D22', color: 'blue',   note: 'I2C clock' },
    { from: 'b1.1A',     to: 'mcu.D15', color: 'orange', note: 'Snooze button, internal pull-up' },
    { from: 'b1.2A',     to: 'bb.T-26', color: 'black',  note: 'Button to ground' }
  ]
},

wireIntro: `<p>One data line to the strip, an encoder, a display and a button. The only thing to get right is
that the strip's power comes from the supply and not through the ESP32.</p>`,

wireNotes: `
<div class="note warn"><span class="t">A metre of white WS2812 is nearly 3 amps</span>
<p>Sixty LEDs at 60&nbsp;mA each at full white. That is far beyond USB and far beyond the ESP32's 5&nbsp;V pin,
which is fed through the USB connector.</p>
<p>The supply feeds the strip directly. The ESP32 shares ground with it and takes its own power from the same
rail, not the other way round.</p></div>

<div class="note tip"><span class="t">The resistor and capacitor are not optional</span>
<p>330&nbsp;ohm in series with the data line protects the first LED's input from ringing on a long wire, and
1000&nbsp;uF across the power absorbs the inrush when sixty LEDs switch on together.</p>
<p>Without them, the usual symptom is the first LED behaving oddly or dying, months later.</p></div>

<div class="note"><span class="t">Diffusion is the whole aesthetic</span>
<p>A bare strip is a row of bright dots and looks like a piece of equipment. Behind 3&nbsp;mm opal acrylic at a
20&nbsp;mm standoff it is a soft glow and looks like a lamp. This is the cheapest and largest improvement
available.</p></div>`,

solderIntro: `<p>Light soldering: the strip's three connections, the encoder and button on flying leads, and
headers for everything else.</p>`,

solderSteps: [
  { h: 'Strip connections, with the resistor and capacitor at the strip end',
    body: `<p>Both components belong physically at the strip, not at the board. Solder to the pads marked with
    the arrow pointing away - WS2812 strips are directional and soldering to the output end gives you nothing
    at all.</p>` },
  { h: 'Thick wire for the strip power',
    body: `<p>Three amps through thin hookup wire drops enough voltage that the far end of the strip is
    noticeably dimmer and slightly pink. Use 20&nbsp;AWG or thicker for the power pair, and if the strip is
    long, feed it from both ends.</p>` },
  { h: 'Encoder and buttons where a half-asleep hand can find them',
    body: `<p>This gets used in the dark by someone who has just woken up. Big, distinct, and in a place you can
    reach without looking - the snooze button especially.</p>` },
  { h: 'Build the diffuser with a standoff',
    body: `<p>20&nbsp;mm between the LEDs and the diffuser. Touching it barely diffuses at all; a gap lets the
    cones overlap and the dots disappear.</p>` },
  { h: 'Check it in the dark before finishing',
    body: `<p>Everything about this project is judged at 5 am in a dark room. Test it there: the display will
    almost certainly be too bright, and the lowest fade step will probably be higher than it needs to be.</p>` }
],

libraries: [
  { name: 'Adafruit NeoPixel', by: 'Adafruit', why: 'The strip.' },
  { name: 'U8g2', by: 'oliver', why: 'The display.' },
  { name: 'Preferences', by: 'Espressif (built in)', why: 'Remembers the alarm time across power cuts.' }
],

code: [{
  name: 'sunrise_lamp.ino',
  code: `/* ------------------------------------------------------------------
   Sunrise alarm lamp - ESP32 + WS2812

   Two ramps over 30 minutes: brightness, and colour temperature.
   Both gamma corrected, because the eye is not linear.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <time.h>
#include <Adafruit_NeoPixel.h>
#include <U8g2lib.h>
#include <Preferences.h>

#define LED_PIN    25
#define N_LEDS     60
#define SNOOZE_PIN 15

const char* TZ_STRING = "GMT0BST,M3.5.0/1,M10.5.0";
const int FADE_MINUTES = 30;

Adafruit_NeoPixel strip(N_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);
Preferences prefs;

int alarmHour = 7, alarmMinute = 0;
bool fading = false;

void setup() {
  Serial.begin(115200);
  pinMode(SNOOZE_PIN, INPUT_PULLUP);

  strip.begin();
  strip.show();                      // all off - never come back up bright
  oled.begin();

  prefs.begin("lamp", false);
  alarmHour   = prefs.getInt("h", 7);
  alarmMinute = prefs.getInt("m", 0);

  WiFi.begin("your-network", "your-password");
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) delay(300);
  configTzTime(TZ_STRING, "pool.ntp.org");
}

void loop() {
  struct tm now;
  if (!getLocalTime(&now, 100)) { delay(500); return; }

  int minsNow   = now.tm_hour * 60 + now.tm_min;
  int minsAlarm = alarmHour * 60 + alarmMinute;
  int into = minsNow - (minsAlarm - FADE_MINUTES);

  if (into >= 0 && into <= FADE_MINUTES) {
    fading = true;
    float t = (float)into / FADE_MINUTES;        // 0..1 through the fade
    renderSunrise(t);
  } else if (fading) {
    fading = false;
    strip.clear();
    strip.show();
  }

  if (digitalRead(SNOOZE_PIN) == LOW && fading) {
    strip.clear(); strip.show();
    fading = false;
    delay(400);
  }

  draw(now);
  delay(1000);
}

void renderSunrise(float t) {
  /* Brightness ramps the whole way. Colour LAGS deliberately - the first
     third stays amber while the light comes up, which is both what real
     dawn does and what avoids blue light at the start. */
  float bright = t;
  float warmth = constrain((t - 0.33f) / 0.67f, 0.0f, 1.0f);

  float kelvin = 1800 + warmth * (5000 - 1800);
  uint8_t r, g, b;
  kelvinToRGB(kelvin, r, g, b);

  /* Start at the lowest visible level rather than zero. After gamma
     correction the bottom few perceptual steps all land on PWM 0 or 1,
     so a fade that starts at zero is simply off for several minutes. */
  float level = 0.004f + bright * (1.0f - 0.004f);

  uint8_t scaled = gamma8(level);
  for (int i = 0; i < N_LEDS; i++) {
    strip.setPixelColor(i,
      (uint16_t)r * scaled / 255,
      (uint16_t)g * scaled / 255,
      (uint16_t)b * scaled / 255);
  }
  strip.show();
}

/* Perceived brightness follows roughly the cube root of light output, so
   a linear PWM ramp appears to shoot up and then crawl. Raising to 2.2
   before writing makes equal steps LOOK equal, which is the single change
   that makes this look like dawn rather than a dimmer. */
uint8_t gamma8(float level) {
  level = constrain(level, 0.0f, 1.0f);
  return (uint8_t)roundf(powf(level, 2.2f) * 255.0f);
}

/* Black-body approximation, good enough between 1500 K and 6500 K. Not
   colorimetrically exact, and it does not need to be - it needs to look
   like a sunrise in a bedroom. */
void kelvinToRGB(float k, uint8_t &r, uint8_t &g, uint8_t &b) {
  float t = k / 100.0f;
  float fr, fg, fb;

  if (t <= 66) {
    fr = 255;
    fg = 99.47f * logf(t) - 161.12f;
  } else {
    fr = 329.7f * powf(t - 60, -0.1332f);
    fg = 288.12f * powf(t - 60, -0.0755f);
  }
  if (t >= 66)      fb = 255;
  else if (t <= 19) fb = 0;
  else              fb = 138.52f * logf(t - 10) - 305.04f;

  r = (uint8_t)constrain(fr, 0.0f, 255.0f);
  g = (uint8_t)constrain(fg, 0.0f, 255.0f);
  b = (uint8_t)constrain(fb, 0.0f, 255.0f);
}

void draw(struct tm &now) {
  char line[24];
  oled.clearBuffer();

  oled.setFont(u8g2_font_helvB18_tr);
  snprintf(line, sizeof(line), "%02d:%02d", now.tm_hour, now.tm_min);
  oled.drawStr(0, 24, line);

  oled.setFont(u8g2_font_6x10_tf);
  snprintf(line, sizeof(line), "alarm %02d:%02d", alarmHour, alarmMinute);
  oled.drawStr(0, 44, line);
  if (fading) oled.drawStr(0, 58, "sunrise");

  // Between 10 pm and 7 am the display is its own light source, so dim it
  // hard. This is a bedroom.
  oled.setContrast((now.tm_hour >= 22 || now.tm_hour < 7) ? 1 : 160);
  oled.sendBuffer();
}`
}],

trouble: [
  { q: 'The fade shoots up quickly then barely changes',
    a: `No gamma correction. A linear PWM ramp does exactly this, because perception is roughly a cube-root
    function of output.` },
  { q: 'Nothing visible for the first ten minutes, then it jumps on',
    a: `Bottom-end resolution. After gamma the lowest levels all round to PWM 0. Start the ramp at the lowest
    visible level - that is what the 0.004 floor in the sketch is for.` },
  { q: 'Visible stepping at low brightness',
    a: `Eight bits is not enough at the bottom. Use the ESP32's LEDC at 12 bits for a plain strip, or add
    temporal dithering for WS2812s.` },
  { q: 'The far end of the strip is dimmer and pinkish',
    a: `Voltage drop along the strip. Thicker power wire, and feed both ends.` },
  { q: 'The first LED misbehaves or has died',
    a: `Missing series resistor on the data line. It protects that LED’s input from reflections on a long
    wire.` },
  { q: 'It comes on at full brightness after a power cut',
    a: `<code>strip.show()</code> must be called with everything cleared in <code>setup()</code>, before
    anything else. WS2812s hold their last state through a brief power interruption.` },
  { q: 'The alarm fires an hour out twice a year',
    a: `Missing daylight-saving rule in the TZ string. Use the full POSIX form rather than a fixed offset.` },
  { q: 'It wakes the wrong person',
    a: `A real design problem with no software fix. Point the diffuser at one side of the bed, or use a
    narrower strip further from the other pillow.` }
],

next: `
<ul>
  <li><strong>A sunset ramp too</strong>, running the same code backwards and ending deep amber. Considerably
  better for falling asleep than a ceiling light.</li>
  <li><strong>Follow the actual sunrise</strong> for your latitude rather than a fixed time - the calculation
  is a page of trigonometry and it drifts through the year the way real daylight does.</li>
  <li><strong>Add the <a href="project.html?p=internet-radio">radio</a></strong> so it fades sound up as well
  as light, starting a few minutes later.</li>
  <li><strong>Skip weekends</strong>, and skip days when a calendar API says you are off. The calendar fetch is
  the same technique as the <a href="project.html?p=bus-departure-board">departure board</a>.</li>
</ul>`
});
