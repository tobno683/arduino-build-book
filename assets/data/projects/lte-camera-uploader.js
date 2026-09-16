/* ESP32-CAM + SIM7600: pictures from anywhere, and the arithmetic of sending them. */
AB.addProject({
slug: 'lte-camera-uploader',
title: 'LTE camera that posts pictures',
cat: 'cellular',
level: 3,
time: '6 hours',
solder: true,
board: 'ESP32-CAM',
tags: ['esp32-cam', 'sim7600', 'lte', 'http post', 'camera', 'remote', 'trail camera', 'telegram'],
blurb: 'A camera in a field that photographs whatever moves and posts the picture to your phone. No Wi-Fi, no SD card to collect, no walking out to check it.',

skills: ['HTTP POST over cellular', 'Image size budgeting', 'Camera framebuffers', 'Chunked uploads', 'Trigger discipline'],

intro: `
<p>The <a href="project.html?p=esp32cam-motion-trap">motion trap</a> writes to an SD card, which means walking
out to fetch it and finding out a week later that the lens fogged on day two. Bolting a cellular modem to it
removes that entirely: the picture arrives on your phone within a minute of being taken, and you learn about
the fogged lens immediately.</p>
<p>The interesting constraint is size. A 640x480 JPEG is around 30&nbsp;KB; 1600x1200 is 150-250&nbsp;KB. That
is a hundred to a thousand times more than any other cellular project in this book sends, and it puts you in a
different tariff bracket. The project spends real effort on <em>not</em> sending pictures - triggering
carefully, resizing appropriately, and applying a hard daily cap.</p>`,

what: [
  'Take a photo on a PIR trigger and post it over LTE within about 30 seconds.',
  'Deliver it straight to a phone through a Telegram bot, or to any HTTP endpoint you control.',
  'Resize and re-compress to a sensible size before spending data on it.',
  'Apply a daily cap and a cooldown, so a swaying branch cannot send four hundred photographs.',
  'Report battery and signal alongside each image, so you know when to go out and service it.',
  'Sleep between triggers, so a battery and a small panel keep it running.'
],

how: `
<p><strong>Size, and what it costs.</strong> The only number that matters:</p>
<table>
  <thead><tr><th>Resolution</th><th>JPEG size</th><th>100 photos</th></tr></thead>
  <tbody>
    <tr><td>QVGA 320x240</td><td>~8 KB</td><td>0.8 MB</td></tr>
    <tr><td>VGA 640x480</td><td>~30 KB</td><td>3 MB</td></tr>
    <tr><td>SVGA 800x600</td><td>~50 KB</td><td>5 MB</td></tr>
    <tr><td>UXGA 1600x1200</td><td>~200 KB</td><td>20 MB</td></tr>
  </tbody>
</table>
<p>VGA is the right default. It is enough to see what set the camera off - a deer, a person, a cat, nothing -
and at 30&nbsp;KB a hundred photos is 3&nbsp;MB, which fits comfortably in an IoT tariff. UXGA is enough to
read a number plate and costs seven times as much.</p>
<p>Decide what question the photograph has to answer, then pick the smallest size that answers it.</p>

<p><strong>Where the picture goes.</strong> Two good options:</p>
<ul>
  <li><strong>A Telegram bot.</strong> The image arrives as a notification on your phone with no server of
  your own and no app to write. One HTTPS POST to their API. This is the one to start with.</li>
  <li><strong>Your own endpoint.</strong> A few lines of PHP or Python on any host, saving files with
  timestamps. More work, and you own the data and the retention.</li>
</ul>
<p>Both are a multipart HTTP POST, and the SIM7600's built-in HTTP stack does it in five AT commands.</p>

<p><strong>Why the SIM7600 rather than something cheaper.</strong> An A7670 at Cat-1 would carry a VGA JPEG
perfectly well. The SIM7600 is here for two other reasons: its HTTP stack handles binary bodies cleanly, and
it has GNSS on the same module - so a trail camera knows where it is, which matters if it might be moved or
stolen.</p>
<p>If neither matters to you, the cheaper module does this job.</p>

<p><strong>The trigger discipline is the real engineering.</strong> A PIR pointed at anything that moves in
wind will fire all night. Three defences, and you want all of them: a cooldown after each send, a hard daily
cap, and - the effective one - a short confirmation delay so a single brief trigger is ignored and only
something still present a second later counts.</p>`,

bom: [
  { id: 'esp32cam', qty: 1, note: 'Get the bundle with the MB programmer shield - it saves the FTDI wiring entirely for about $2 more.' },
  { id: 'sim7600', qty: 1, note: 'Cat-4 with GNSS. An A7670 at half the price does the uploading fine if you do not need position.' },
  { id: 'iot-sim', qty: 1, note: 'Budget for images: 100 VGA photos is about 3 MB. A 500 MB tariff is thousands of pictures.' },
  { id: 'lte-ant', qty: 1, note: 'Main and diversity, both fitted.' },
  { id: 'pir', qty: 1, note: 'The trigger. Adjust its own sensitivity and delay pots before blaming the software.' },
  { id: 'cap1000', qty: 2, note: 'At the modem. The ESP32-CAM browns out easily and the modem is a hungry neighbour.' },
  { id: 'buck', qty: 1, note: 'To 5 V for the camera board and 3.8 V for the modem, or two converters. The camera is fussy about supply.' },
  { id: '18650', qty: 2, note: 'Parallel, for capacity. The modem is the load, not the camera.' },
  { id: 'tp4056', qty: 1, note: 'Protected version.' },
  { id: 'solar6v', qty: 1, note: 'Worth it. A trail camera you never visit is the point.' },
  { id: 'box-ip65', qty: 1, note: 'A clear window for the lens, or the lens through a drilled hole with a seal. Antennas outside.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'cam',  comp: 'esp32cam',     at: [-40, 40] },
    { id: 'bb',   comp: 'bb400',        at: [0, -14] },
    { id: 'lte',  comp: 'lte',          at: [46, 34] },
    { id: 'pir',  comp: 'pir',          at: [-48, -62] },
    { id: 'buck', comp: 'buck',         at: [10, -62] },
    { id: 'batt', comp: 'battery18650', at: [58, -66] }
  ],
  wires: [
    { from: 'batt.+',    to: 'buck.IN+', color: 'red',    note: 'Cells into the converter' },
    { from: 'batt.-',    to: 'buck.IN-', color: 'black',  note: 'Battery negative' },
    { from: 'buck.OUT+', to: 'bb.T+2',   color: 'red',    note: '5 V rail for the camera board' },
    { from: 'buck.OUT-', to: 'bb.T-2',   color: 'black',  note: 'Common ground - everything shares this' },
    { from: 'cam.5V',    to: 'bb.T+6',   color: 'red',    note: 'Camera board power. It browns out easily - keep this run short and thick' },
    { from: 'cam.GND',   to: 'bb.T-6',   color: 'black',  note: 'Camera ground' },
    { from: 'lte.VCC',   to: 'bb.T+10',  color: 'brown',  note: 'Modem power, capacitors at the module' },
    { from: 'lte.GND',   to: 'bb.T-10',  color: 'black',  note: 'Modem ground, starred at the capacitors' },
    { from: 'lte.TXD',   to: 'cam.U0R',  color: 'green',  note: 'Modem to the ESP32-CAM serial RX' },
    { from: 'lte.RXD',   to: 'cam.U0T',  color: 'orange', note: 'ESP32-CAM serial TX to the modem' },
    { from: 'lte.PWR',   to: 'cam.IO12', color: 'purple', note: 'PWRKEY. IO12 is a strapping pin - see the wiring notes before using it' },
    { from: 'pir.VCC',   to: 'bb.T+14',  color: 'red',    note: 'PIR power' },
    { from: 'pir.GND',   to: 'bb.T-14',  color: 'black',  note: 'PIR ground' },
    { from: 'pir.OUT',   to: 'cam.IO13', color: 'blue',   note: 'PIR trigger, and the deep sleep wake source' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">IO12 must be LOW at boot. Read this before wiring PWRKEY.</span>
<p>On the ESP32-CAM, <strong>GPIO12 is a strapping pin</strong> - it selects the flash voltage at reset. If it
is HIGH when the board boots, the board will not start.</p>
<p>Driving PWRKEY from IO12 is fine <em>as long as the sketch only ever pulses it after boot</em> and nothing
external pulls it high. Do not fit a pull-up resistor on this line, and if you have a spare pin, use that
instead - IO2 or IO14 are better choices if the SD card is not in use.</p>
<p>A board that will not boot after you added the modem is almost always this.</p></div>

<div class="note danger"><span class="t">The ESP32-CAM browns out at the slightest excuse</span>
<p>It is notorious. The camera draws a burst when it captures, the modem draws a burst when it transmits, and
together on a marginal supply the board resets with <code>Brownout detector was triggered</code> in the
log.</p>
<p>Fixes, all of them: a supply that genuinely delivers 2&nbsp;A, short thick wires to the board's 5&nbsp;V
pin, capacitors at both the camera board and the modem, and never powering the camera from the modem
breakout's regulator.</p>
<p>Do not disable the brownout detector to make the message go away. It is telling you the truth.</p></div>

<div class="note warn"><span class="t">Serial is shared with programming</span>
<p>The ESP32-CAM has one exposed UART and the modem is on it. That means you must <strong>disconnect the modem
to flash the board</strong>, every time.</p>
<p>A two-pin header with a removable jumper in the modem's TX line makes this a five-second job instead of an
irritation. Fit one - you will flash this board more often than you expect.</p></div>

<div class="note warn"><span class="t">Two supply rails, one ground</span>
<p>The camera board wants a solid 5&nbsp;V; the modem wants 3.4-4.2&nbsp;V unless its breakout regulates.
Either two converters, or one 5&nbsp;V rail with the modem on a breakout that has its own regulator - check
the silkscreen.</p>
<p>Whatever you do, one common ground, starred at the modem's capacitors.</p></div>`,

solderSteps: [
  { h: 'Capacitors at both boards',
    body: `<p>1000&nbsp;uF at the modem, and another across the ESP32-CAM's 5&nbsp;V and GND. Both boards
    burst, and each makes the other's life harder.</p>` },
  { h: 'A jumper in the modem TX line',
    body: `<p>Two-pin header in the modem's TX wire, with a removable jumper. Pull it to flash, replace it to
    run.</p>
    <p>Five minutes now saves you unplugging wires every time you change a line of code, which on this board
    is often.</p>` },
  { h: 'Short, thick supply wires to the camera board',
    body: `<p>22&nbsp;AWG, as short as the layout allows, directly to the 5&nbsp;V and GND pins. The
    ESP32-CAM's brownout problems are mostly wiring resistance.</p>` },
  { h: 'Mount the lens through the box properly',
    body: `<p>A hole exactly the diameter of the lens barrel, with the lens just proud of the outside surface,
    sealed with a bead of silicone. A clear window in front of the lens causes reflections and fogs on the
    inside.</p>
    <p>Angle the whole box down slightly so rain runs off the lens rather than sitting on it.</p>` },
  { h: 'Antennas outside, on bulkheads',
    body: `<p>Both LTE antennas, and the GPS patch if you are using it, outside the box or on bulkhead
    connectors. A sealed box full of radios needs its antennas out in the air.</p>` }
],

assembly: [
  { h: 'Get the camera working alone first',
    body: `<p>ESP32-CAM, the CameraWebServer example, over Wi-Fi on your bench. Confirm the sensor works,
    the focus is right and the image is not upside down.</p>
    <p>The lens screws in and out to focus, and most arrive badly set. Get it sharp at the distance the
    subject will be - not at the distance your bench happens to be.</p>` },
  { h: 'Get the modem attached alone',
    body: `<p>On a separate board or a USB-serial adapter, as in the
    <a href="project.html?p=lte-remote-monitor">LTE monitor project</a>. APN set, registered, PDP context
    active.</p>
    <p>Two subsystems each proven separately are far easier to join than two unknowns.</p>` },
  { h: 'Make a Telegram bot',
    body: `<p>Message <code>@BotFather</code> on Telegram, send <code>/newbot</code>, follow it. You get a
    token that looks like <code>123456789:AAH...</code>.</p>
    <p>Then message your new bot once, and visit
    <code>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> in a browser to find your chat id.</p>
    <p>Test the whole path from a laptop with curl before the device is involved - that way a failure later
    is definitely the device.</p>` },
  { h: 'Post one image by hand',
    body: `<p>The SIM7600 HTTP sequence: <code>AT+HTTPINIT</code>, <code>AT+HTTPPARA="URL",...</code>,
    <code>AT+HTTPDATA=&lt;len&gt;,&lt;timeout&gt;</code>, then the binary body, then
    <code>AT+HTTPACTION=1</code>.</p>
    <p>Getting one picture through by hand is the milestone. Everything after is scheduling.</p>` },
  { h: 'Set the PIR up physically before tuning software',
    body: `<p>The HC-SR501 has two pots - sensitivity and delay - and a jumper for retrigger mode. Set the
    delay to minimum and let the sketch handle timing.</p>
    <p>Then point it at the actual scene and watch how often it fires. Sunlit foliage, a hot roof cooling in
    the evening, and rain all trigger PIRs. Aim it at where things arrive, not at the whole view.</p>` },
  { h: 'Run it for a day on the bench, pointed at the real scene',
    body: `<p>Count the triggers. If it fires ninety times a day pointed at a hedge, the field deployment will
    too, and that is 2.7&nbsp;MB and a flat battery.</p>
    <p>Adjust the aim, the sensitivity and the confirmation delay until the trigger rate matches the number of
    things that actually happen.</p>` },
  { h: 'Install it, then check signal and take a test photo',
    body: `<p>From the final position, before you leave: <code>AT+CSQ</code>, and a manual trigger to confirm
    a photo arrives on your phone.</p>
    <p>Walking back out because the picture is of a branch is much more annoying than checking now.</p>` }
],

libraries: [
  { name: 'esp_camera', by: 'Espressif', how: 'Part of the ESP32 board package', why: 'The camera driver. Configure the pin map for the AI-Thinker board.' },
  { name: 'ESP32 board package', by: 'Espressif', how: 'Boards Manager: "esp32"', why: 'Board support and deep sleep.' },
  { name: 'No modem library', by: '-', why: 'The AT sequence for an HTTP POST is five commands. A wrapper hides the responses you need when a post fails.' }
],

code: [
{
  h: 'The camera uploader',
  intro: `<p>Wakes on the PIR, confirms the trigger, captures, posts, and sleeps. The trigger confirmation and
  the daily cap are what keep this affordable.</p>`,
  name: 'lte_camera.ino',
  code: `/* ------------------------------------------------------------------
   LTE camera uploader.

   PIR wake -> confirm -> capture -> HTTP POST -> deep sleep.

   Set BOT_TOKEN and CHAT_ID for Telegram, or point URL at your own
   endpoint.
   ------------------------------------------------------------------ */

#include "esp_camera.h"
#include "esp_sleep.h"

#define PIR_PIN     GPIO_NUM_13
#define MODEM_PWR   12          // strapping pin - only ever pulsed after boot

const char APN[]       = "iot.1nce.net";
const char BOT_TOKEN[] = "123456789:AAH-your-token-here";
const char CHAT_ID[]   = "987654321";

#define COOLDOWN_S        120     // no second photo within two minutes
#define MAX_PER_DAY        40     // hard cap, whatever happens
#define CONFIRM_MS        800     // trigger must still be present after this

/* AI-Thinker ESP32-CAM pin map. Different boards differ; using the
   wrong map gives a camera that inits and returns garbage frames. */
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

RTC_DATA_ATTR uint16_t photoCount = 0;
RTC_DATA_ATTR uint16_t sentToday = 0;
RTC_DATA_ATTR uint32_t dayStartS = 0;

void setup() {
  Serial.begin(115200);
  delay(100);

  pinMode(MODEM_PWR, OUTPUT);
  digitalWrite(MODEM_PWR, LOW);       // must stay low; IO12 is a strapping pin

  /* Confirm the trigger before spending anything. A PIR fires on a
     gust, a bird, a cloud shadow. Requiring the signal to still be
     present after 800 ms removes most of those and costs nothing. */
  pinMode(PIR_PIN, INPUT);
  delay(CONFIRM_MS);
  if (digitalRead(PIR_PIN) != HIGH) {
    Serial.println(F("trigger did not persist - back to sleep"));
    sleepNow();
  }

  uint32_t nowS = millis() / 1000;
  if (dayStartS == 0) dayStartS = nowS;
  if (nowS - dayStartS > 86400) { dayStartS = nowS; sentToday = 0; }

  if (sentToday >= MAX_PER_DAY) {
    Serial.println(F("daily cap reached"));
    sleepNow();
  }

  if (!startCamera()) sleepNow();

  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println(F("capture failed"));
    sleepNow();
  }

  photoCount++;
  Serial.print(F("captured ")); Serial.print(fb->len); Serial.println(F(" bytes"));

  if (modemUp() && modemAttach()) {
    if (postImage(fb->buf, fb->len)) sentToday++;
  }

  esp_camera_fb_return(fb);
  sleepNow();
}

void loop() { }

/* --- camera ------------------------------------------------------------- */
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
  c.pixel_format = PIXFORMAT_JPEG;

  /* VGA: ~30 KB, enough to see WHAT tripped the sensor. UXGA is ~200 KB
     and seven times the data bill for detail you usually do not need.
     Decide what question the photo must answer, then pick the smallest
     size that answers it. */
  c.frame_size = FRAMESIZE_VGA;
  c.jpeg_quality = 12;              // 10-63, lower is better and bigger
  c.fb_count = 1;

  esp_err_t err = esp_camera_init(&c);
  if (err != ESP_OK) {
    Serial.print(F("camera init failed 0x")); Serial.println(err, HEX);
    return false;
  }

  // Let auto-exposure settle, or the first frame is dark.
  for (int i = 0; i < 3; i++) {
    camera_fb_t *f = esp_camera_fb_get();
    if (f) esp_camera_fb_return(f);
    delay(100);
  }
  return true;
}

/* --- modem -------------------------------------------------------------- */
bool modemUp() {
  if (at("AT", "OK", 1000)) return true;

  // Pulse PWRKEY. IO12 is only ever driven here, after boot.
  digitalWrite(MODEM_PWR, HIGH);
  delay(1200);
  digitalWrite(MODEM_PWR, LOW);

  for (byte i = 0; i < 30; i++) {
    if (at("AT", "OK", 1000)) { at("ATE0", "OK", 1000); return true; }
    delay(500);
  }
  Serial.println(F("modem did not start"));
  return false;
}

bool modemAttach() {
  if (!at("AT+CPIN?", "READY", 5000)) return false;

  for (byte i = 0; i < 60; i++) {
    if (at("AT+CGREG?", ",1", 2000) || at("AT+CGREG?", ",5", 2000)) break;
    delay(1000);
    if (i == 59) return false;
  }

  char cmd[80];
  snprintf(cmd, sizeof(cmd), "AT+CGDCONT=1,\\"IP\\",\\"%s\\"", APN);
  at(cmd, "OK", 5000);
  return at("AT+CGACT=1,1", "OK", 30000);
}

/* --- the upload ---------------------------------------------------------
   A multipart/form-data POST. Telegram's sendPhoto wants the image in
   a part named "photo"; most simple endpoints accept the same shape. */
bool postImage(uint8_t *jpeg, size_t len) {
  const char *boundary = "----buildbook7f3a";

  char head[300];
  int headLen = snprintf(head, sizeof(head),
    "--%s\\r\\n"
    "Content-Disposition: form-data; name=\\"chat_id\\"\\r\\n\\r\\n%s\\r\\n"
    "--%s\\r\\n"
    "Content-Disposition: form-data; name=\\"caption\\"\\r\\n\\r\\n"
    "Photo %u, signal %d, battery %d mV\\r\\n"
    "--%s\\r\\n"
    "Content-Disposition: form-data; name=\\"photo\\"; filename=\\"c.jpg\\"\\r\\n"
    "Content-Type: image/jpeg\\r\\n\\r\\n",
    boundary, CHAT_ID, boundary, photoCount, signalStrength(), batteryMv(),
    boundary);

  char tail[64];
  int tailLen = snprintf(tail, sizeof(tail), "\\r\\n--%s--\\r\\n", boundary);

  size_t total = headLen + len + tailLen;

  char cmd[220];
  at("AT+HTTPINIT", "OK", 5000);

  snprintf(cmd, sizeof(cmd),
           "AT+HTTPPARA=\\"URL\\",\\"https://api.telegram.org/bot%s/sendPhoto\\"",
           BOT_TOKEN);
  at(cmd, "OK", 5000);

  snprintf(cmd, sizeof(cmd),
           "AT+HTTPPARA=\\"CONTENT\\",\\"multipart/form-data; boundary=%s\\"",
           boundary);
  at(cmd, "OK", 5000);

  // 120 s to push the body. A 30 KB image at the edge of a cell is
  // genuinely slow and a short timeout truncates it silently.
  snprintf(cmd, sizeof(cmd), "AT+HTTPDATA=%u,120000", (unsigned)total);
  if (!at(cmd, "DOWNLOAD", 10000)) {
    Serial.println(F("modem would not accept the body"));
    at("AT+HTTPTERM", "OK", 3000);
    return false;
  }

  // Write in chunks. Handing a serial port 30 KB in one call
  // overruns its buffer and loses the middle of the image.
  Serial.write((const uint8_t *)head, headLen);
  Serial.flush();
  for (size_t i = 0; i < len; i += 512) {
    size_t n = min((size_t)512, len - i);
    Serial.write(jpeg + i, n);
    Serial.flush();
    delay(5);
  }
  Serial.write((const uint8_t *)tail, tailLen);
  Serial.flush();

  if (!waitFor("OK", 20000)) { at("AT+HTTPTERM", "OK", 3000); return false; }

  bool ok = at("AT+HTTPACTION=1", "+HTTPACTION: 1,200", 120000);
  at("AT+HTTPTERM", "OK", 3000);

  Serial.println(ok ? F("posted") : F("post FAILED"));
  return ok;
}

int signalStrength() {
  Serial.println("AT+CSQ");
  String r = collect(1500);
  int i = r.indexOf("+CSQ:");
  return i < 0 ? 99 : r.substring(i + 6).toInt();
}

int batteryMv() {
  Serial.println("AT+CBC");          // the modem reports its own supply
  String r = collect(1500);
  int i = r.lastIndexOf(',');
  return i < 0 ? 0 : r.substring(i + 1).toInt();
}

void sleepNow() {
  Serial.println(F("sleeping until the next trigger"));
  Serial.flush();

  // Wake on the PIR going high, or after the cooldown - whichever
  // first. The timer wake is what re-arms after a busy period.
  esp_sleep_enable_ext0_wakeup(PIR_PIN, 1);
  esp_sleep_enable_timer_wakeup((uint64_t)COOLDOWN_S * 1000000ULL);
  esp_deep_sleep_start();
}

/* --- AT plumbing, on the one hardware UART this board exposes ------------ */
bool at(const char *cmd, const char *expect, unsigned long timeoutMs) {
  while (Serial.available()) Serial.read();
  Serial.println(cmd);
  return waitFor(expect, timeoutMs);
}

bool waitFor(const char *expect, unsigned long timeoutMs) {
  unsigned long deadline = millis() + timeoutMs;
  String got = "";
  while (millis() < deadline) {
    while (Serial.available()) {
      got += (char)Serial.read();
      if (got.indexOf(expect) >= 0) return true;
      if (got.indexOf("ERROR") >= 0) return false;
      if (got.length() > 300) got = got.substring(150);
    }
    delay(1);
  }
  return false;
}

String collect(unsigned long ms) {
  unsigned long deadline = millis() + ms;
  String out = "";
  while (millis() < deadline)
    while (Serial.available()) out += (char)Serial.read();
  return out;
}`,
  after: `<p><strong>Chunking the body in 512-byte pieces</strong> is not optional. Handing a serial port
  30&nbsp;KB in one <code>write()</code> overruns its transmit buffer and the middle of the image is silently
  lost - producing a JPEG that decodes to a grey band, which looks like a camera fault.</p>
  <p><strong>The trigger confirmation</strong> is the single most valuable eight hundred milliseconds in the
  project. A PIR fires on gusts, birds and cloud shadows; almost none of those are still there a second later.
  It typically cuts the trigger rate by two thirds at no cost in missed subjects.</p>
  <p>Note that the modem shares the board's only UART, so debug output and modem traffic are the same stream.
  That is awkward and it is what this board gives you - which is another argument for the jumper in the TX
  line.</p>`
}],

upload: `
<p>Board: <strong>AI Thinker ESP32-CAM</strong>. You must <strong>disconnect the modem's TX line</strong>
before flashing - they share the only serial port.</p>
<div class="note warn"><span class="t">IO12 must be low at boot</span>
<p>If the board will not start after you added the modem, check nothing is holding GPIO12 high. It selects the
flash voltage at reset and a high level stops the board booting entirely.</p></div>
<div class="note tip"><span class="t">Test the Telegram path from a laptop first</span>
<p><code>curl -F chat_id=&lt;ID&gt; -F photo=@test.jpg https://api.telegram.org/bot&lt;TOKEN&gt;/sendPhoto</code></p>
<p>If that does not put a picture on your phone, the token or the chat id is wrong and no amount of device
debugging will help.</p></div>`,

tune: [
  { h: 'Resolution against the question being asked',
    body: `<p>"Was there anything?" - QVGA at 8&nbsp;KB. "What animal was it?" - VGA at 30&nbsp;KB. "Which
    person was it?" or "what is that number plate?" - UXGA at 200&nbsp;KB and a tariff to match.</p>
    <p>Start at VGA. Move up only when you find yourself squinting at a real photo and unable to answer.</p>` },
  { h: 'Aim the PIR narrowly',
    body: `<p>The most effective change available. An HC-SR501 sees 110 degrees; masking it down with a tube
    of black card or tape so it only watches the gate, the path or the feeder cuts false triggers
    dramatically.</p>
    <p>Better aim beats every software filter.</p>` },
  { h: 'Send a burst instead of a frame',
    body: `<p>Three QVGA frames a second apart is 24&nbsp;KB - less than one VGA - and tells you the direction
    of travel and whether something was really there. For wildlife this is a much better use of the same
    data.</p>` },
  { h: 'Add position from the same module',
    body: `<p>The SIM7600 has GNSS. <code>AT+CGNSPWR=1</code> and <code>AT+CGNSINF</code> give you a fix, and
    including it in the caption means a stolen camera tells you where it went.</p>
    <p>Only take a fix occasionally - acquiring one costs 30-45&nbsp;mA for up to a minute.</p>` },
  { h: 'A daily heartbeat is worth one photo a day',
    body: `<p>A camera that has stopped looks identical to a camera with nothing happening in front of it.
    One scheduled photo a day, whether or not anything triggered, distinguishes them - and shows you the lens
    is still clear.</p>` },
  { h: 'Power, realistically',
    body: `<p>Deep sleep is a few hundred microamps with the modem off. Each photo cycle is maybe
    25&nbsp;mAh - camera warm-up, modem attach, upload.</p>
    <p>Twenty photos a day is 0.5&nbsp;Ah, so a 6800&nbsp;mAh pair of 18650s lasts about two weeks. A small
    solar panel changes it to indefinite, which for a camera you never visit is the whole point.</p>` }
],

trouble: [
  { q: '<code>Brownout detector was triggered</code>',
    a: `Supply. Thicker and shorter wires to the 5&nbsp;V pin, a supply that genuinely gives 2&nbsp;A, and
    capacitors at both boards. Do not disable the detector - it is reporting a real problem that will corrupt
    captures.` },
  { q: 'The board will not boot at all after adding the modem',
    a: `GPIO12 held high. It is a strapping pin that selects flash voltage at reset. Remove any pull-up, and
    make sure the sketch only drives it after boot.` },
  { q: 'Camera init fails',
    a: `Wrong pin map for your board variant, or the ribbon is not seated. Press the connector's latch open,
    reseat the flex, close it evenly. Then confirm you are using the AI-Thinker map.` },
  { q: 'Photos arrive grey or half-missing',
    a: `The body was truncated during the serial write. Send in chunks with a small delay, as the sketch does.
    A single large <code>write()</code> overruns the buffer and loses the middle.` },
  { q: '<code>+HTTPACTION: 1,715</code> or another non-200 code',
    a: `The server rejected it. 715 is a receive error; 4xx means your URL, token or body is wrong. Test the
    exact same POST from a laptop with curl to find out which side is at fault.` },
  { q: 'Upload times out on a weak signal',
    a: `30&nbsp;KB at the edge of a cell genuinely takes a while. Raise the <code>AT+HTTPDATA</code> timeout
    and the <code>HTTPACTION</code> wait, and consider dropping to QVGA at sites with poor coverage.` },
  { q: 'It fires all night',
    a: `PIR aim and sensitivity. Mask it down, turn the sensitivity pot down, and check what is actually in
    view - a sunlit wall cooling after dark is a classic false source. The confirmation delay and the daily
    cap are the backstop, not the fix.` },
  { q: 'Pictures are dark',
    a: `The first frames after wake are taken before auto-exposure settles. The sketch discards three; discard
    five if your scene is dim. The onboard flash LED is on GPIO4 and is bright, hot and will destroy your
    battery life - use it sparingly if at all.` },
  { q: 'Cannot flash the board',
    a: `The modem is holding the serial line. Disconnect its TX - which is what the jumper in the wiring notes
    is for.` }
],

next: `
<ul>
  <li><strong>The free version</strong> - the <a href="project.html?p=esp32cam-motion-trap">SD card motion
  trap</a> costs $10 and needs collecting.</li>
  <li><strong>Send only what matters</strong> - put a
  <a href="project.html?p=tinyml-gesture-nano">small model</a> or simple frame differencing in front of the
  upload, so a swaying branch never costs you data.</li>
  <li><strong>Much more bandwidth</strong> - the <a href="project.html?p=5g-edge-uplink">5G edge uplink</a>
  carries video rather than stills, for ten times the price.</li>
  <li><strong>Numbers instead of pictures</strong> - the
  <a href="project.html?p=nbiot-field-sensor">NB-IoT sensor</a> runs for years where this runs for
  weeks.</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">Power, lithium and weather</span>
<ul>
  <li><strong>Never power the modem without antennas.</strong></li>
  <li><strong>Protected charging board</strong> for the cells, load from OUT+/OUT-, and never charge a lithium
  cell below 0&nbsp;&deg;C. A trail camera in winter needs a temperature cut-off.</li>
  <li><strong>Keep the cells shaded</strong> and out of direct sun behind the panel.</li>
  <li><strong>Vents on the underside</strong> of the box only, or it will rain inside itself and fog the
  lens.</li>
</ul>
</div>
<div class="note danger"><span class="t">A camera outdoors is a camera of other people</span>
<ul>
  <li><strong>Photograph your own land.</strong> A camera covering a public footpath, a road or a neighbour's
  property is regulated in most countries - often requiring signage and a stated purpose, and sometimes
  prohibited outright.</li>
  <li><strong>Signage where people might be captured.</strong> In much of Europe this is a legal requirement
  rather than a courtesy.</li>
  <li><strong>Think about where the images go.</strong> Telegram is convenient and it means your photographs
  live on someone else's servers. Your own endpoint keeps them yours.</li>
  <li><strong>Check local rules on trail cameras.</strong> Several countries and US states regulate them
  specifically, particularly during hunting seasons and on public land.</li>
</ul>
</div>`
});
