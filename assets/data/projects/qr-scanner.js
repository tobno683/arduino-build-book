/* ESP32-CAM decoding QR codes on-device: recognition without a network. */
AB.addProject({
slug: 'qr-scanner',
title: 'QR code scanner and access control',
cat: 'camera',
level: 3,
time: '4 hours',
solder: false,
board: 'ESP32-CAM',
tags: ['esp32-cam', 'qr code', 'quirc', 'access control', 'offline', 'reed-solomon', 'grayscale'],
blurb: 'Reads a QR code off a phone screen or a printed card and opens a door, logs a visitor, or looks up a part. All of it on the board, with no network and no cloud service.',

skills: ['Grayscale frame capture', 'QR decoding', 'Error correction', 'Lighting and contrast', 'Token design', 'Offline access lists'],

intro: `
<p>A $7 camera board that reads QR codes locally is a surprisingly capable building block. Access tokens on
phones, inventory labels, guest passes, configuration you can print - all without a network, a subscription,
or an app.</p>
<p>The decoding runs on the ESP32 itself using <strong>quirc</strong>, a small C library that does the whole
job: finding the code in the frame, correcting its perspective, and running the Reed-Solomon error correction.
It fits in about 12&nbsp;KB of code and runs in roughly 100&nbsp;ms per frame.</p>
<p>The interesting part turns out not to be the decoding - that mostly just works - but everything around it:
lighting, what you put <em>in</em> the code, and why a QR code is a terrible access credential if you design
it badly.</p>`,

what: [
  'Capture grayscale frames and decode QR codes entirely on the board.',
  'Read codes from a phone screen and from print, which behave quite differently.',
  'Match against a stored list of allowed tokens and drive a relay.',
  'Log every scan with a timestamp, including the ones it refused.',
  'Handle damaged or partially covered codes, because the error correction genuinely works.',
  'Understand why a static QR code is a weak credential, and what to do about it.'
],

how: `
<p><strong>Grayscale, not JPEG.</strong> The camera can output JPEG, and decoding one on an ESP32 costs time
and RAM you do not have to spare. quirc wants an 8-bit grayscale buffer, and the OV2640 will produce that
directly - <code>PIXFORMAT_GRAYSCALE</code>.</p>
<p>At QVGA (320x240) that is a 76&nbsp;KB buffer, which fits comfortably in PSRAM. Skip the JPEG path
entirely.</p>

<p><strong>What quirc does, in three steps.</strong> First it finds the three large square <em>finder
patterns</em> in the corners - a distinctive 1:1:3:1:1 ratio of black and white that almost nothing else
produces. From those three points it works out the code's position, size and rotation.</p>
<p>Then it corrects the perspective, sampling the grid of modules even if the code is photographed at an
angle. Finally it runs Reed-Solomon error correction over the extracted bits.</p>
<p><strong>That error correction is why QR codes work at all in practice.</strong> At the standard "M" level,
15% of the code can be destroyed and it still decodes - which is why a code with a logo printed over the
middle, or a scuffed label, still reads. Level H tolerates 30%.</p>

<p><strong>Lighting is the whole difficulty.</strong> Decoding is reliable; getting a readable frame is not:</p>
<ul>
  <li><strong>Phone screens are emissive</strong> and easy in dim light, and impossible in sunlight if the
  screen brightness is low. They also flicker - a phone at 60&nbsp;Hz PWM against a rolling shutter gives
  banded frames.</li>
  <li><strong>Print is reflective</strong> and needs light on it, and shows specular glare if the light is
  directly behind the camera.</li>
  <li><strong>Auto-exposure hunts</strong> when a bright screen enters a dark frame, and takes several frames
  to settle. Fixing the exposure helps enormously.</li>
</ul>
<p>The sketch fixes exposure and gain rather than letting them float, which trades adaptability for
consistency and is the right trade for a scanner.</p>

<p><strong>A QR code is a string, and that is all.</strong> Anyone who can see it can copy it. A printed pass
on a noticeboard is a key on a noticeboard.</p>
<p>The honest options: use it where copying does not matter (inventory, configuration, a visitor log); make
the tokens single-use by recording which have been seen; or make them time-limited by signing a timestamp -
which needs a clock and a shared secret, and is covered in the tuning section.</p>`,

bom: [
  { id: 'esp32cam', qty: 1, note: 'Get the bundle with the MB programmer shield. PSRAM is essential here - all the common AI-Thinker boards have it.' },
  { id: 'ftdi', qty: 1, own: true, note: 'Only if your board came without the programmer shield.' },
  { id: 'relay1', qty: 1, note: 'Drives whatever the scan controls. Opto-isolated.' },
  { id: 'buzzer', qty: 1, note: 'One beep for accepted, two for refused. A scanner with no feedback is unusable.' },
  { id: 'led5', qty: 2, note: 'Green and red. Visible from where the person holding the phone is standing.' },
  { id: 'res220', qty: 2 },
  { id: 'sdcard-8gb', qty: 1, note: 'The scan log and the token list. The ESP32-CAM has a card slot already.' },
  { id: 'ds3231', qty: 1, note: 'Timestamps on the log. Optional if there is Wi-Fi for NTP.' },
  { id: 'rtc-cell', qty: 1 },
  { id: 'psu5v3a', qty: 1, note: 'A real 2 A supply. The ESP32-CAM browns out on anything less.' },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'box-abs', qty: 1, note: 'With a lens hole and somewhere sensible to hold a phone in front of.' }
],

tools: [{ id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'cam',  comp: 'esp32cam', at: [0, 44] },
    { id: 'bb',   comp: 'bb400',    at: [0, -16] },
    { id: 'rly',  comp: 'relay1',   at: [44, -62] },
    { id: 'rtc',  comp: 'ds3231',   at: [-44, -60] },
    { id: 'buz',  comp: 'buzzer',   at: [0, -66] },
    { id: 'lg',   comp: 'led5',     at: [-16, -98], opt: { c: '#3fbf6a' } },
    { id: 'lr',   comp: 'led5',     at: [-4, -98],  opt: { c: '#e0483c' } }
  ],
  wires: [
    { from: 'cam.5V',   to: 'bb.T+2',  color: 'red',    note: '5 V rail. Short and thick - this board browns out easily' },
    { from: 'cam.GND',  to: 'bb.T-2',  color: 'black',  note: 'Ground rail' },
    { from: 'cam.3V3',  to: 'bb.T+6',  color: 'red',    note: '3.3 V for the RTC' },
    { from: 'rtc.VCC',  to: 'bb.T+6',  color: 'red',    note: 'RTC power' },
    { from: 'rtc.GND',  to: 'bb.T-6',  color: 'black',  note: 'RTC ground' },
    { from: 'rtc.SDA',  to: 'cam.IO15', color: 'blue',  note: 'I2C data. IO15 and IO14 are free when the SD card is in 1-bit mode' },
    { from: 'rtc.SCL',  to: 'cam.IO14', color: 'yellow', note: 'I2C clock' },
    { from: 'rly.VCC',  to: 'bb.T+10', color: 'red',    note: 'Relay coil, 5 V' },
    { from: 'rly.GND',  to: 'bb.T-10', color: 'black',  note: 'Relay ground' },
    { from: 'rly.IN',   to: 'cam.IO12', color: 'purple', note: 'Relay drive. IO12 is a STRAPPING PIN - see the wiring notes' },
    { from: 'buz.+',    to: 'cam.IO13', color: 'orange', note: 'Feedback buzzer' },
    { from: 'buz.-',    to: 'bb.T-14', color: 'black',  note: 'Buzzer ground' },
    { from: 'lg.A',     to: 'cam.IO2', color: 'green',  note: 'Accepted LED through 220 ohm' },
    { from: 'lg.K',     to: 'bb.T-18', color: 'black',  note: 'Cathode to ground' },
    { from: 'lr.A',     to: 'cam.IO4', color: 'red',    note: 'Refused LED. IO4 is also the onboard flash LED - see the notes' },
    { from: 'lr.K',     to: 'bb.T-20', color: 'black',  note: 'Cathode to ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">IO12 must be LOW at boot</span>
<p>GPIO12 selects the flash voltage at reset. Held high, the board does not start at all.</p>
<p>An active-LOW relay module pulls it up through its opto-isolator, which is enough to stop the board
booting. Either use an active-HIGH module, add a 10&nbsp;k pull-down to ground on IO12, or move the relay to
IO13 and the buzzer elsewhere.</p>
<p>A board that stops booting the moment you connect the relay is always this.</p></div>

<div class="note warn"><span class="t">IO4 is the onboard flash LED, and it is very bright</span>
<p>The white LED on the board is on GPIO4. Using that pin for anything else means the flash fires alongside
it - which for a "refused" indicator is actually quite effective, and for anything subtle is not.</p>
<p>It also draws a lot and gets hot. If you want it as illumination for reading printed codes, pulse it for a
few tens of milliseconds rather than leaving it on.</p></div>

<div class="note warn"><span class="t">Pins are scarce, and the SD card takes most of them</span>
<p>The ESP32-CAM has very few free GPIOs, and the SD card in 4-bit mode uses IO2, IO4, IO12, IO13, IO14 and
IO15.</p>
<p><strong>Mount the card in 1-bit mode</strong> (<code>SD_MMC.begin("/sdcard", true)</code>) and IO4, IO12
and IO13 come free. That is what makes this build possible at all, and it is one boolean.</p></div>

<div class="note warn"><span class="t">Brownouts</span>
<p>The usual ESP32-CAM complaint. A 2&nbsp;A supply, short thick wires to the 5&nbsp;V pin, and a
1000&nbsp;uF capacitor across the board's supply. The camera draws a burst on every capture and this project
captures continuously.</p></div>`,

solderSteps: [
  { h: 'Nothing here needs soldering',
    body: `<p>Breadboard build. The only care is the supply wiring - keep the 5&nbsp;V and ground runs to the
    board short and thick, because this board is notorious for browning out.</p>` },
  { h: 'If you box it, think about where a phone goes',
    body: `<p>People will hold a phone about 100-150&nbsp;mm from the lens. Give them somewhere obvious to
    aim - a printed target, a recess, a lip to rest the phone against.</p>
    <p>A scanner where nobody knows the right distance reads nothing and gets blamed on the software.</p>` }
],

assembly: [
  { h: 'Get the camera working alone',
    body: `<p>CameraWebServer example over Wi-Fi first. Confirm the sensor works and the focus is right.</p>
    <p><strong>The lens screws in and out</strong>, and they arrive focused for infinity. For QR codes at
    100-150&nbsp;mm you will need to turn it out most of a full turn. Do this with the web server running so
    you can see the result.</p>` },
  { h: 'Install quirc',
    body: `<p>It is not in the Library Manager. Download it from GitHub and add the <code>lib</code> folder as
    a ZIP library, or drop <code>quirc.c</code>, <code>decode.c</code>, <code>identify.c</code>,
    <code>version_db.c</code> and <code>quirc.h</code> into the sketch folder.</p>
    <p>The ESP32 Arduino core also bundles a copy in some versions - if <code>#include "quirc.h"</code>
    compiles without you adding anything, use that.</p>` },
  { h: 'Decode a code on the bench',
    body: `<p>Run the decoder sketch with serial output only - no relay, no list. Generate a QR code containing
    your name at any online generator, show it on a phone, and watch the text appear in the monitor.</p>
    <p>Get that working before anything else exists.</p>` },
  { h: 'Fix the exposure',
    body: `<p>Auto-exposure hunts when a bright screen enters a dark frame, and takes several frames to
    settle - which feels like a scanner that does not work.</p>
    <p>Fix the exposure and gain at values that suit your lighting. The sketch has the settings; find them by
    watching the decode rate as you change them.</p>` },
  { h: 'Test the limits deliberately',
    body: `<p>Worth doing because it tells you how to mount it:</p>
    <ul>
      <li><strong>Distance</strong> - how close and how far does it read?</li>
      <li><strong>Angle</strong> - it should manage 30-40 degrees off square.</li>
      <li><strong>Damage</strong> - cover a corner of a printed code with your thumb. At error correction
      level M it still reads with 15% obscured, which is genuinely impressive to see.</li>
      <li><strong>Light</strong> - try it in a dark room and in direct sun.</li>
    </ul>` },
  { h: 'Put the token list on the SD card',
    body: `<p>A plain text file, one token per line. Editable by pulling the card, which is much better than
    reflashing to add a person.</p>
    <p>Read it at boot into RAM - a few hundred tokens is nothing.</p>` },
  { h: 'Add the log and check it',
    body: `<p>Every scan appended with a timestamp and whether it was accepted. The refused ones are the
    interesting ones.</p>
    <p><code>flush()</code> after every line - a card pulled mid-write loses whatever is buffered.</p>` }
],

libraries: [
  { name: 'quirc', by: 'Daniel Beer', how: 'Add as ZIP library, or copy the C files into the sketch folder', why: 'The QR decoder. Small, dependency-free, and does the finder patterns, perspective correction and Reed-Solomon.' },
  { name: 'esp_camera', by: 'Espressif', how: 'Part of the ESP32 board package', why: 'The OV2640 driver.' },
  { name: 'SD_MMC', by: 'Espressif', how: 'Part of the board package', why: 'The card slot. Use 1-bit mode to free three GPIOs.' },
  { name: 'RTClib', by: 'Adafruit', why: 'Timestamps on the log.' }
],

code: [
{
  h: 'The scanner',
  intro: `<p>Grayscale capture, quirc decode, list match. The camera settings at the top are where the reliability
  lives.</p>`,
  name: 'qr_scanner.ino',
  code: `/* ------------------------------------------------------------------
   Offline QR code scanner.

   Grayscale frames -> quirc -> token list -> relay.

   Nothing leaves the board. The list lives on the SD card so you can
   add a person without reflashing.
   ------------------------------------------------------------------ */

#include "esp_camera.h"
#include "quirc.h"
#include "SD_MMC.h"
#include <Wire.h>
#include <RTClib.h>

#define RELAY_PIN   12
#define BUZZER_PIN  13
#define LED_OK       2
#define LED_NO       4

#define UNLOCK_MS      3000
#define REPEAT_LOCK_MS 4000     // ignore the same code held in view
#define MAX_TOKENS      200

// AI-Thinker pin map
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM  0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM   35
#define Y8_GPIO_NUM   34
#define Y7_GPIO_NUM   39
#define Y6_GPIO_NUM   36
#define Y5_GPIO_NUM   21
#define Y4_GPIO_NUM   19
#define Y3_GPIO_NUM   18
#define Y2_GPIO_NUM    5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

struct quirc *qr = NULL;
RTC_DS3231 rtc;

String tokens[MAX_TOKENS];
int tokenCount = 0;
String lastCode = "";
unsigned long lastCodeAt = 0;
uint32_t scans = 0, accepted = 0;

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);         // IO12 must be LOW at boot anyway
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_OK, OUTPUT);
  pinMode(LED_NO, OUTPUT);

  if (!startCamera()) { Serial.println(F("camera failed")); while (1) delay(1000); }

  /* 1-bit mode frees IO4, IO12 and IO13, which is what makes room for
     the relay, the buzzer and an LED on this pin-starved board. */
  if (!SD_MMC.begin("/sdcard", true)) {
    Serial.println(F("no SD card - running without list or log"));
  } else {
    loadTokens();
  }

  Wire.begin(15, 14);
  if (!rtc.begin()) Serial.println(F("no RTC - log will have no times"));

  qr = quirc_new();
  if (!qr || quirc_resize(qr, 320, 240) < 0) {
    Serial.println(F("quirc allocation failed - is PSRAM enabled?"));
    while (1) delay(1000);
  }

  Serial.print(F("ready, ")); Serial.print(tokenCount); Serial.println(F(" tokens"));
  beep(2, 60);
}

void loop() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) { delay(50); return; }

  /* quirc works on its own buffer, so copy the frame in. At 320x240
     grayscale that is 76 KB and it lives in PSRAM. */
  int w, h;
  uint8_t *image = quirc_begin(qr, &w, &h);
  memcpy(image, fb->buf, w * h);
  quirc_end(qr);

  esp_camera_fb_return(fb);

  int count = quirc_count(qr);
  for (int i = 0; i < count; i++) {
    struct quirc_code code;
    struct quirc_data data;

    quirc_extract(qr, i, &code);

    /* This is where the Reed-Solomon correction happens. A code with
       15% of its area destroyed still decodes at level M - which is
       why a scuffed label or a thumb over one corner still works. */
    if (quirc_decode(&code, &data) != QUIRC_SUCCESS) continue;

    String text = String((const char *)data.payload);
    handleCode(text);
  }

  delay(40);
}

void handleCode(String &text) {
  // The same code held in front of the camera decodes every frame.
  if (text == lastCode && millis() - lastCodeAt < REPEAT_LOCK_MS) return;
  lastCode = text;
  lastCodeAt = millis();
  scans++;

  bool ok = isAllowed(text);
  Serial.print(ok ? F("ACCEPT  ") : F("refuse  "));
  Serial.println(text);

  logScan(text, ok);

  if (ok) {
    accepted++;
    digitalWrite(LED_OK, HIGH);
    beep(1, 120);
    digitalWrite(RELAY_PIN, HIGH);
    delay(UNLOCK_MS);
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(LED_OK, LOW);
  } else {
    digitalWrite(LED_NO, HIGH);
    beep(2, 120);
    delay(600);
    digitalWrite(LED_NO, LOW);
  }
}

bool isAllowed(String &text) {
  for (int i = 0; i < tokenCount; i++) {
    if (tokens[i] == text) return true;
  }
  return false;
}

/* --- the list, from a file you can edit by pulling the card ----------- */
void loadTokens() {
  File f = SD_MMC.open("/tokens.txt");
  if (!f) { Serial.println(F("no /tokens.txt")); return; }

  while (f.available() && tokenCount < MAX_TOKENS) {
    String line = f.readStringUntil('\\n');
    line.trim();
    if (line.length() && line[0] != '#') tokens[tokenCount++] = line;
  }
  f.close();
}

void logScan(String &text, bool ok) {
  File f = SD_MMC.open("/scans.csv", FILE_APPEND);
  if (!f) return;

  DateTime now = rtc.now();
  char stamp[24];
  snprintf(stamp, sizeof(stamp), "%04d-%02d-%02d %02d:%02d:%02d",
           now.year(), now.month(), now.day(),
           now.hour(), now.minute(), now.second());

  f.print(stamp); f.print(',');
  f.print(ok ? "accept" : "refuse"); f.print(',');
  f.println(text);

  // A card pulled mid-write loses whatever is buffered, and the
  // refused scans are exactly the ones you want to keep.
  f.flush();
  f.close();
}

void beep(int times, int ms) {
  for (int i = 0; i < times; i++) {
    tone(BUZZER_PIN, 2400, ms);
    delay(ms + 60);
  }
}

/* --- camera, configured for decoding rather than for looking at ------- */
bool startCamera() {
  camera_config_t c;
  c.ledc_channel = LEDC_CHANNEL_0;
  c.ledc_timer   = LEDC_TIMER_0;
  c.pin_d0 = Y2_GPIO_NUM;  c.pin_d1 = Y3_GPIO_NUM;
  c.pin_d2 = Y4_GPIO_NUM;  c.pin_d3 = Y5_GPIO_NUM;
  c.pin_d4 = Y6_GPIO_NUM;  c.pin_d5 = Y7_GPIO_NUM;
  c.pin_d6 = Y8_GPIO_NUM;  c.pin_d7 = Y9_GPIO_NUM;
  c.pin_xclk = XCLK_GPIO_NUM;   c.pin_pclk = PCLK_GPIO_NUM;
  c.pin_vsync = VSYNC_GPIO_NUM; c.pin_href = HREF_GPIO_NUM;
  c.pin_sccb_sda = SIOD_GPIO_NUM; c.pin_sccb_scl = SIOC_GPIO_NUM;
  c.pin_pwdn = PWDN_GPIO_NUM;   c.pin_reset = RESET_GPIO_NUM;
  c.xclk_freq_hz = 20000000;

  /* GRAYSCALE, not JPEG. quirc wants 8-bit grayscale and decoding a
     JPEG first would cost time and RAM for no benefit. */
  c.pixel_format = PIXFORMAT_GRAYSCALE;
  c.frame_size = FRAMESIZE_QVGA;        // 320x240 - plenty for QR
  c.fb_count = 1;

  if (esp_camera_init(&c) != ESP_OK) return false;

  sensor_t *s = esp_camera_sensor_get();

  /* Fixed exposure and gain. Auto-exposure hunts for several frames
     when a bright phone screen enters a dark view, and that delay is
     indistinguishable from "the scanner does not work". Consistency
     beats adaptability for a scanner. */
  s->set_gain_ctrl(s, 0);
  s->set_agc_gain(s, 4);
  s->set_exposure_ctrl(s, 0);
  s->set_aec_value(s, 300);

  // Contrast up, saturation irrelevant in grayscale. A QR code is a
  // binary image and pushing the contrast helps the threshold step.
  s->set_contrast(s, 2);
  s->set_brightness(s, 0);
  s->set_whitebal(s, 0);

  return true;
}`,
  after: `<p><strong>The fixed exposure is the single biggest reliability change.</strong> With auto-exposure on,
  a phone screen appearing in a dim frame sends the sensor hunting for several frames, and during those frames
  nothing decodes. To the person holding the phone, that is a scanner that ignores them.</p>
  <p>Find your values by running the decoder with serial output and adjusting <code>set_aec_value</code> until
  the decode is instant in the lighting you actually have.</p>
  <p><strong>The repeat lockout</strong> is needed because a code held in front of the camera decodes in every
  frame - twenty-five times a second. Without it, one scan is twenty-five log entries and twenty-five relay
  pulses.</p>`
}],

upload: `
<p>Board: <strong>AI Thinker ESP32-CAM</strong>, and <strong>PSRAM must be enabled</strong> in Tools - quirc's
buffer will not fit without it.</p>
<div class="note warn"><span class="t">Disconnect the relay from IO12 before flashing</span>
<p>IO12 is a strapping pin. Anything holding it high stops the board booting, including the upload.</p></div>
<div class="note tip"><span class="t">Focus the lens for 100-150 mm, not infinity</span>
<p>They arrive focused for distance. Run the CameraWebServer example, watch the stream, and turn the lens out
until a QR code at arm's length is sharp. Usually most of a full turn.</p>
<p>Some lenses have a dab of glue on the thread - work it loose gently rather than forcing it.</p></div>`,

tune: [
  { h: 'Signed, time-limited tokens',
    body: `<p>A static QR code is a password anyone can photograph. The fix is to put a <em>signature</em> in
    the code rather than a secret: <code>user|expiry|HMAC(user|expiry, secret)</code>.</p>
    <p>The scanner recomputes the HMAC with its own copy of the secret and checks the expiry against the RTC.
    A photographed code stops working when it expires, and nobody can forge a new one without the secret.</p>
    <p>This is how real ticketing works and it is about thirty lines with mbedtls.</p>` },
  { h: 'Single-use tokens',
    body: `<p>Simpler than signing and effective for guest passes: record every accepted token in a file and
    refuse any that has been seen before.</p>
    <p>Generate a batch of random tokens, print them, and each works exactly once.</p>` },
  { h: 'Illumination for printed codes',
    body: `<p>Phone screens are emissive and need no help. Print needs light, and the onboard flash LED on
    GPIO4 is far too harsh at close range - it produces a bright specular spot that blinds the middle of the
    code.</p>
    <p>Two small LEDs at 45 degrees from either side is the standard scanner geometry, and it removes glare
    rather than creating it.</p>` },
  { h: 'Decode rate and frame size',
    body: `<p>QVGA at about 12&nbsp;fps is plenty. VGA gives more range at roughly a quarter the frame rate
    and four times the memory.</p>
    <p>If you need to read a small code from further away, VGA is the answer; otherwise it costs
    responsiveness for nothing.</p>` },
  { h: 'Other symbologies',
    body: `<p>quirc does QR only. For Code-128 or EAN barcodes - which is what is on most products - you want
    ZBar, which is much heavier and does not fit comfortably on an ESP32.</p>
    <p>For inventory of your own things, printing QR codes is easier than reading someone else's
    barcodes.</p>` },
  { h: 'Wi-Fi as an addition, not a dependency',
    body: `<p>Push each scan to MQTT for a live log, but keep the token list local. A door that stops working
    when the network does is worse than one that was never connected.</p>` }
],

trouble: [
  { q: 'quirc allocation fails',
    a: `PSRAM is not enabled. Tools &rarr; PSRAM &rarr; Enabled. A 320x240 grayscale buffer plus quirc's
    working memory does not fit in internal RAM.` },
  { q: 'Nothing ever decodes',
    a: `Focus first - they ship focused for infinity and a QR code at 150&nbsp;mm is a blur. Run the web
    server example and adjust the lens until it is sharp at the distance you will use.` },
  { q: 'It decodes on the bench and not at the door',
    a: `Lighting. Fix the exposure for the actual location rather than the bench, and check for glare from a
    light behind the camera.` },
  { q: 'Takes several seconds to read a phone',
    a: `Auto-exposure hunting. Turn it off and set a fixed value - this is the most common cause of a scanner
    that feels broken.` },
  { q: 'One scan triggers the relay repeatedly',
    a: `The code is still in view and decoding every frame. That is what <code>REPEAT_LOCK_MS</code> is for -
    raise it if a person holds the phone there.` },
  { q: 'The board will not boot with the relay connected',
    a: `IO12 held high by the relay module. Add a pull-down, use an active-HIGH module, or move the relay.` },
  { q: 'Brownout messages in the log',
    a: `Supply. 2&nbsp;A, short thick wires, and a capacitor across the board.` },
  { q: 'The SD card will not mount',
    a: `Use 1-bit mode - <code>SD_MMC.begin("/sdcard", true)</code>. 4-bit mode also takes the GPIOs this
    project needs. Format the card FAT32.` }
],

next: `
<ul>
  <li><strong>A physical credential instead</strong> - the
  <a href="project.html?p=rfid-door-lock">RFID lock</a> is harder to photograph and easier to lose. Both are
  convenience locks, and both guides say so.</li>
  <li><strong>Log who went where</strong> - the
  <a href="project.html?p=rfid-attendance-logger">attendance logger</a> shares most of this design.</li>
  <li><strong>Recognise objects rather than codes</strong> - the
  <a href="project.html?p=uno-q-object-detection">object detector</a> needs no label on the thing at all, and
  costs six times as much.</li>
  <li><strong>Inventory that scans itself</strong> - QR labels on boxes, this on a bench, and a spreadsheet
  that fills itself in is a genuinely useful afternoon.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">A QR code is not a secure credential</span>
<ul>
  <li><strong>Anyone who can see it can copy it.</strong> A photograph of a printed pass works exactly as well
  as the pass. A code on a noticeboard is a key on a noticeboard.</li>
  <li><strong>Use signed, expiring tokens</strong> if this controls anything that matters - the tuning section
  covers it, and it turns a copyable string into a credential with a lifetime.</li>
  <li><strong>Do not put this on a front door</strong> as the only lock, for the same reasons the
  <a href="project.html?p=rfid-door-lock">RFID lock</a> says not to. Workshop cabinet, shed, internal door,
  visitor log - yes.</li>
  <li><strong>Keep a physical override.</strong> A key, a bolt, another way in.</li>
</ul>
</div>
<div class="note warn"><span class="t">It is a camera and a log</span>
<ul>
  <li><strong>The scan log records who went where and when.</strong> That is personal data in most
  jurisdictions if the tokens identify people. Tell them, keep it no longer than you need, and keep the card
  somewhere sensible.</li>
  <li><strong>It is also a camera pointed at a doorway.</strong> This sketch keeps no images, which is a
  meaningful privacy property - if you add image saving, you have built something different and the rules that
  apply change.</li>
  <li><strong>The flash LED is bright</strong> and at close range unpleasant. Do not point it at faces.</li>
</ul>
</div>`
});
