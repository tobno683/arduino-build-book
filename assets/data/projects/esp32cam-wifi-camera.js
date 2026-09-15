/* ESP32-CAM streaming camera on your own network. */
AB.addProject({
slug: 'esp32cam-wifi-camera',
title: 'Wi-Fi camera you can open in a browser',
cat: 'camera',
level: 3,
time: '2 hours',
solder: true,
board: 'ESP32-CAM',
feature: true,
tags: ['esp32cam', 'wifi', 'mjpeg', 'streaming', 'ov2640', 'ftdi'],
blurb: 'A $7 board that streams live video to any browser on your network, takes stills on demand, and needs about forty lines of real code.',

skills: ['ESP32 toolchain', 'MJPEG over HTTP', 'Frame buffers and PSRAM', 'Serial bootloading', 'Power brownouts'],

intro: `
<p>The ESP32-CAM is the best value in this entire hobby. Seven dollars buys a 240&nbsp;MHz dual-core processor,
Wi-Fi, 4&nbsp;MB of PSRAM, a micro SD slot and a 2&nbsp;megapixel camera. It streams video that any browser on
your network can open with no app, no cloud account and no subscription.</p>
<p>It is also the most frustrating board in the hobby for the first hour, for two reasons that have nothing to
do with the camera: it has no USB socket, so you need an adapter and a jumper to program it, and it browns out
if you look at it wrongly. Both are dealt with below, in detail, because that is where everybody gets stuck.</p>`,

what: [
  'Stream live MJPEG video at up to 25 frames a second to any browser, phone or tablet on your network.',
  'Serve a single still JPEG at <code>/still</code>, which is the URL to point Home Assistant or a script at.',
  'Let you change resolution and quality from the page while it is running.',
  'Print its IP address to the Serial Monitor at boot so you know where to find it.',
  'Run from a phone charger indefinitely.'
],

how: `
<p>The OV2640 sensor does not send pixels to the ESP32 one at a time - it would never keep up. Instead the
ESP32 has a dedicated parallel camera interface: eight data lines plus pixel clock, horizontal and vertical
sync, driven by DMA straight into memory. Your code never touches that. You call
<code>esp_camera_fb_get()</code> and get a pointer to a completed frame.</p>
<p>The frame arrives already JPEG-compressed, because the OV2640 has a JPEG encoder built into it. That is the
whole trick that makes this board work: compressing VGA video in software on a microcontroller would be
hopeless, but the sensor hands you a 30&nbsp;KB JPEG and the ESP32 only has to put it on a socket.</p>
<p><strong>MJPEG</strong> is then embarrassingly simple. You send an HTTP response with content type
<code>multipart/x-mixed-replace</code>, and then just keep sending JPEG after JPEG separated by a boundary
marker. The browser replaces the image each time. There is no codec, no negotiation and no protocol beyond
"here is another picture". It is inefficient over the internet and perfect on a LAN.</p>
<p><strong>PSRAM</strong> matters more than it sounds. The ESP32's own 520&nbsp;KB of RAM cannot hold two VGA
frames plus a Wi-Fi stack. The 4&nbsp;MB of external PSRAM on this board can, which is what lets you
double-buffer and get a smooth stream instead of a stutter.</p>`,

bom: [
  { id: 'esp32cam', qty: 1, note: 'Buy the bundle that includes the MB programmer shield if you can - it is about $2 more and removes the entire wiring step below.' },
  { id: 'ftdi', qty: 1, note: 'Only needed if you did NOT get the MB shield. Must have a 3.3 V / 5 V jumper.' },
  { id: 'jumpers', qty: 1, own: true, note: 'Five female-to-female.' },
  { id: 'psu5v3a', qty: 1, note: 'A real 5 V supply. This board browns out on weak USB ports, and that is the number one cause of "it does not work".' },
  { id: 'cap1000', qty: 1, own: true, note: 'Optional but recommended: across the 5 V and GND pins, right at the board.' },
  { id: 'sdcard-8gb', qty: 1, own: true, note: 'Not needed for streaming. Needed if you go on to the motion trap project.' },
  { id: 'tripod', qty: 1, note: 'Any gooseneck phone mount. Aiming a camera that is lying on a desk is misery.' }
],

tools: [
  { id: 'iron', why: 'For the capacitor and for headers, if your board came without them.' },
  { id: 'solder' },
  { id: 'dmm', why: 'To confirm you really have 5 V at the board while it is streaming, not 4.4 V.' }
],

build: {
  parts: [
    { id: 'cam',  comp: 'esp32cam', at: [0, 0] },
    { id: 'prog', comp: 'ftdi',     at: [0, 58], ry: 180 }
  ],
  wires: [
    { from: 'prog.VCC', to: 'cam.5V',    color: 'red',    note: '5 V with the adapter jumper set to 5 V' },
    { from: 'prog.GND', to: 'cam.GND',   color: 'black',  note: 'Ground. Shared reference for the serial lines' },
    { from: 'prog.TX',  to: 'cam.U0R',   color: 'green',  note: 'Adapter transmits, board receives. TX goes to RX' },
    { from: 'prog.RX',  to: 'cam.U0T',   color: 'blue',   note: 'Board transmits, adapter receives' },
    { from: 'cam.IO0',  to: 'cam.GND2',  color: 'yellow', note: 'THE FLASH JUMPER. Only fitted while uploading, then removed' }
  ]
},

wireIntro: `<p>Skip this entire section if you bought the MB programmer shield: you slide the board into it,
plug in a USB-C cable and you are done. What follows is the five-wire version for a plain board and a
USB-to-serial adapter.</p>`,

wireNotes: `
<div class="note warn"><span class="t">TX to RX, RX to TX</span>
<p>Serial is the one bus where the lines cross. The adapter's transmit pin goes to the board's receive pin.
If you wire TX to TX and RX to RX, nothing is damaged and nothing works, and the error will be
<code>Failed to connect to ESP32</code> - the same error as five other faults, which is why this trips people
repeatedly.</p></div>

<div class="note warn"><span class="t">Set the adapter to 5 V, not 3.3 V</span>
<p>Powering the board from the adapter's 3.3&nbsp;V pin is the second classic mistake. The ESP32-CAM has its
own regulator and wants 5&nbsp;V in; more importantly, an adapter's 3.3&nbsp;V rail typically supplies about
50&nbsp;mA and the camera wants 300&nbsp;mA in bursts. It will appear to boot and then reset endlessly.</p></div>

<div class="note tip"><span class="t">The IO0 jumper is a mode switch, not a connection</span>
<p>The ESP32 checks the state of GPIO 0 at the instant it comes out of reset. Held low, it starts the ROM
bootloader and waits for a sketch. Left alone, it runs your program. So: fit the jumper, press reset, upload,
<strong>remove the jumper</strong>, press reset again. Forgetting to remove it means your sketch never runs
and you assume the upload failed.</p></div>`,

solderIntro: `<p>Many ESP32-CAM boards arrive with the headers already fitted. If yours did, the only
soldering here is the capacitor - which is optional, and which solves more problems than any other five-cent
part in this book.</p>`,

solderSteps: [
  { h: 'Fit the pin headers, if your board came bare',
    body: `<p>Two 8-pin strips, pins pointing <em>down</em> from the component side so the board can sit on a
    breadboard. Use the breadboard-as-jig trick: push both strips into a breadboard, drop the board on top,
    and everything is held square for free.</p>
    <p>Tack one pin at each end of each strip first, check from the side that the board is flat and level, then
    do the remaining twelve. Three seconds a joint at 340&nbsp;&deg;C.</p>` },
  { h: 'Solder the reservoir capacitor across 5 V and GND',
    body: `<p>Take a 1000&nbsp;&micro;F 16&nbsp;V electrolytic. It is <strong>polarised</strong>: the leg on the
    side with the stripe and the minus signs is negative, and it is also the shorter leg. Getting this backwards
    makes it vent - loudly, and it smells terrible for a week.</p>
    <p>Trim the legs to about 8&nbsp;mm. Tin both. Then tin the 5&nbsp;V and GND pads on the underside of the
    board, hold the capacitor in place with tweezers, and touch the iron to each joint for a second - the two
    tinned surfaces merge immediately.</p>
    <p>Positive leg to the 5&nbsp;V pin, negative leg to GND. Check it twice before power.</p>` },
  { h: 'Check for bridges on the underside',
    body: `<p>The pads down there are close together. Hold the board at a low angle to the light and look along
    the row - a bridge is obvious from the side and invisible from above. Multimeter on continuity between
    5&nbsp;V and GND: it must not beep.</p>` },
  { h: 'Optional: solder the power leads directly',
    body: `<p>Once it works, replace the jumper wires with a soldered 5&nbsp;V and GND pair going to a USB
    cable with the end cut off (red and black inside; the green and white data wires are unused). A camera
    that runs for months should not be relying on friction-fit dupont connectors.</p>
    <p>Sleeve each joint in heat-shrink. Slide the tubing on <em>before</em> you solder.</p>` }
],

assembly: [
  { h: 'Install the ESP32 board package',
    body: `<p><strong>File &rarr; Preferences</strong>, and into "Additional Board Manager URLs" paste:</p>
    <p><code>https://espressif.github.io/arduino-esp32/package_esp32_index.json</code></p>
    <p>Then <strong>Tools &rarr; Board &rarr; Boards Manager</strong>, search <em>esp32</em>, install the
    Espressif package. It is a few hundred megabytes and takes a while.</p>` },
  { h: 'Select the right board and settings',
    body: `<ul>
      <li><strong>Board:</strong> AI Thinker ESP32-CAM</li>
      <li><strong>Partition Scheme:</strong> Huge APP (3MB No OTA/1MB SPIFFS) - the default is too small and
      you will get a "sketch too big" error</li>
      <li><strong>Upload speed:</strong> 115200. Faster settings fail on long jumper wires.</li>
    </ul>` },
  { h: 'The upload dance',
    body: `<ol>
      <li>Fit the IO0-to-GND jumper.</li>
      <li>Press the small RST button on the back of the board.</li>
      <li>Press Upload in the IDE.</li>
      <li>Watch for <code>Connecting........</code> then dots turning into a percentage.</li>
      <li>When it says <em>Hard resetting</em>, <strong>remove the IO0 jumper</strong> and press RST again.</li>
    </ol>
    <p>If it hangs on <code>Connecting....._____</code>, press and hold RST, start the upload, and release RST
    when the dots begin. Some boards need that timing.</p>` },
  { h: 'Find its address',
    body: `<p>Open the Serial Monitor at <strong>115200</strong> baud and press RST. It prints the Wi-Fi
    connection progress and then a line like <code>Camera ready: http://192.168.1.42</code>. Open that in any
    browser on the same network.</p>` },
  { h: 'Aim it and give it real power',
    body: `<p>Unplug the serial adapter entirely and run the board from the 5&nbsp;V supply. Mount it on the
    gooseneck. The camera's focus is a screw thread on the lens barrel - you can turn it by hand for close-up
    work, but go gently, because the ribbon cable to the sensor is fragile and unforgiving.</p>` }
],

libraries: [
  { name: 'esp32 board package', by: 'Espressif', how: 'Boards Manager', why: 'Includes esp_camera.h and WiFi.h. No separate library is needed - everything in the sketch is in this package.' }
],

code: [
{
  h: 'The whole camera server',
  intro: `<p>Change the two lines at the top and upload. This is deliberately not the 900-line
  <code>CameraWebServer</code> example - it is the smallest thing that streams properly, so you can actually
  read it and change it.</p>`,
  name: 'esp32cam_stream.ino',
  code: `/* ------------------------------------------------------------------
   ESP32-CAM MJPEG server
     /          a page with the live stream and some controls
     /stream    raw multipart MJPEG - point VLC or Home Assistant here
     /still     one JPEG
     /size?v=8  change resolution on the fly (see FRAMESIZE below)

   Board: AI Thinker ESP32-CAM
   Partition scheme: Huge APP
   ------------------------------------------------------------------ */

#include "esp_camera.h"
#include <WiFi.h>

// ---- change these two ------------------------------------------------
const char* WIFI_SSID = "your-network-name";
const char* WIFI_PASS = "your-password";
// ----------------------------------------------------------------------

// AI-Thinker ESP32-CAM pin map. Do not change unless your board differs.
#define PWDN_GPIO_NUM  32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM   0
#define SIOD_GPIO_NUM  26
#define SIOC_GPIO_NUM  27
#define Y9_GPIO_NUM    35
#define Y8_GPIO_NUM    34
#define Y7_GPIO_NUM    39
#define Y6_GPIO_NUM    36
#define Y5_GPIO_NUM    21
#define Y4_GPIO_NUM    19
#define Y3_GPIO_NUM    18
#define Y2_GPIO_NUM     5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM  23
#define PCLK_GPIO_NUM  22

#define FLASH_LED_PIN   4      // the very bright white LED on the front

WiFiServer server(80);

const char* BOUNDARY = "frameboundary";

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(false);
  Serial.println();

  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // With PSRAM we can afford a bigger frame and two buffers, which is
  // what makes the stream smooth instead of jerky.
  if (psramFound()) {
    config.frame_size   = FRAMESIZE_VGA;    // 640x480
    config.jpeg_quality = 12;               // 10 = better, 63 = worse
    config.fb_count     = 2;
    config.grab_mode    = CAMERA_GRAB_LATEST;
  } else {
    config.frame_size   = FRAMESIZE_QVGA;   // 320x240
    config.jpeg_quality = 15;
    config.fb_count     = 1;
  }
  config.fb_location = CAMERA_FB_IN_PSRAM;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\\n", err);
    Serial.println("Almost always power. Try a better 5V supply.");
    delay(3000);
    ESP.restart();
  }

  // A little sensor tuning. The OV2640 defaults are quite flat.
  sensor_t* s = esp_camera_sensor_get();
  s->set_brightness(s, 0);        // -2 to 2
  s->set_contrast(s, 1);          // -2 to 2
  s->set_saturation(s, 0);        // -2 to 2
  s->set_vflip(s, 0);             // 1 if your image is upside down
  s->set_hmirror(s, 0);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  WiFi.setSleep(false);           // sleep makes the stream stutter

  Serial.print("Connecting");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(400);
    Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("No Wi-Fi. Check the name and password, and that it is 2.4 GHz.");
    delay(3000);
    ESP.restart();
  }

  server.begin();
  Serial.print("Camera ready: http://");
  Serial.println(WiFi.localIP());
}

void loop() {
  WiFiClient client = server.available();
  if (!client) { delay(1); return; }

  // Read the request line, then throw away the headers.
  String req = client.readStringUntil('\\r');
  while (client.available()) {
    String line = client.readStringUntil('\\n');
    if (line.length() <= 1) break;
  }

  if (req.indexOf("GET /stream") >= 0)      sendStream(client);
  else if (req.indexOf("GET /still") >= 0)  sendStill(client);
  else if (req.indexOf("GET /size") >= 0)   { setSize(req); sendIndex(client); }
  else if (req.indexOf("GET /flash") >= 0)  { toggleFlash(); sendIndex(client); }
  else                                      sendIndex(client);

  client.stop();
}

/* --- one JPEG -------------------------------------------------------- */
void sendStill(WiFiClient& client) {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) { client.println("HTTP/1.1 500 Internal Server Error"); return; }

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: image/jpeg");
  client.printf("Content-Length: %u\\r\\n", fb->len);
  client.println("Cache-Control: no-store");
  client.println();
  client.write(fb->buf, fb->len);

  esp_camera_fb_return(fb);       // ALWAYS give the buffer back
}

/* --- endless JPEGs, which a browser renders as video ------------------ */
void sendStream(WiFiClient& client) {
  client.println("HTTP/1.1 200 OK");
  client.printf("Content-Type: multipart/x-mixed-replace; boundary=%s\\r\\n", BOUNDARY);
  client.println("Cache-Control: no-store");
  client.println();

  while (client.connected()) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) break;

    client.printf("--%s\\r\\n", BOUNDARY);
    client.println("Content-Type: image/jpeg");
    client.printf("Content-Length: %u\\r\\n\\r\\n", fb->len);
    client.write(fb->buf, fb->len);
    client.print("\\r\\n");

    esp_camera_fb_return(fb);
    // no delay here: the camera's own frame rate paces us
  }
}

/* --- resolution, from /size?v=N --------------------------------------- */
void setSize(const String& req) {
  int i = req.indexOf("v=");
  if (i < 0) return;
  int v = req.substring(i + 2).toInt();
  sensor_t* s = esp_camera_sensor_get();
  s->set_framesize(s, (framesize_t)v);
  Serial.printf("framesize -> %d\\n", v);
}

void toggleFlash() {
  digitalWrite(FLASH_LED_PIN, !digitalRead(FLASH_LED_PIN));
}

/* --- the page you actually look at ------------------------------------ */
void sendIndex(WiFiClient& client) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println();
  client.println(F(
    "<!doctype html><html><head><meta name=viewport content='width=device-width,initial-scale=1'>"
    "<title>ESP32-CAM</title><style>"
    "body{margin:0;background:#111;color:#eee;font:15px system-ui;text-align:center}"
    "img{max-width:100%;display:block;margin:0 auto}"
    "a{display:inline-block;margin:8px 4px;padding:8px 14px;background:#333;color:#eee;"
    "text-decoration:none;border-radius:8px}</style></head><body>"
    "<img src='/stream'>"
    "<div><a href='/size?v=5'>QVGA</a><a href='/size?v=8'>VGA</a>"
    "<a href='/size?v=10'>SXGA</a><a href='/flash'>Lamp</a><a href='/still'>Snapshot</a></div>"
    "</body></html>"));
}`,
  after: `<p>Frame size numbers for the <code>/size</code> links: 5 = QVGA 320&times;240, 8 = VGA 640&times;480,
  9 = SVGA 800&times;600, 10 = XGA 1024&times;768, 13 = UXGA 1600&times;1200. Bigger looks better and drops the
  frame rate; UXGA on a busy network is a slideshow.</p>
  <div class="note tip"><span class="t">esp_camera_fb_return() is not optional</span>
  <p>Every <code>esp_camera_fb_get()</code> must be matched by a <code>return</code>. Miss one and the driver
  runs out of buffers within seconds and the stream freezes with no error. If your stream dies after a few
  frames, this is the first thing to check.</p></div>`
}],

upload: `
<p>Covered step by step in <a href="#build">Putting it together</a> above - the IO0 jumper and the reset
timing are the whole story. Once it is running:</p>
<ul>
  <li><strong>In a browser:</strong> <code>http://&lt;its-ip&gt;/</code></li>
  <li><strong>In VLC:</strong> Media &rarr; Open Network Stream &rarr; <code>http://&lt;its-ip&gt;/stream</code></li>
  <li><strong>In Home Assistant:</strong> add a generic camera with the still image URL
  <code>http://&lt;its-ip&gt;/still</code> and the stream URL <code>http://&lt;its-ip&gt;/stream</code></li>
</ul>
<div class="note"><span class="t">Give it a fixed address</span>
<p>Set a DHCP reservation in your router for the board's MAC address. Otherwise its IP changes on a reboot and
every bookmark and integration breaks.</p></div>`,

tune: [
  { h: 'Fix the exposure if it hunts',
    body: `<p>Pointing at a window makes the auto-exposure oscillate. In <code>setup()</code>:
    <code>s-&gt;set_gain_ctrl(s, 0); s-&gt;set_exposure_ctrl(s, 0); s-&gt;set_aec_value(s, 300);</code>
    Then tune the 300 by eye - larger is brighter.</p>` },
  { h: 'Rotate the picture',
    body: `<p><code>s-&gt;set_vflip(s, 1)</code> if it is upside down, <code>set_hmirror</code> if it is
    mirrored. Mounting a camera the "wrong" way up and fixing it in software is standard practice.</p>` },
  { h: 'Trade quality for frame rate',
    body: `<p><code>jpeg_quality</code> is backwards: 10 is high quality and big, 30 is low and small. At VGA,
    quality 12 gives roughly 25&nbsp;fps on a good network, quality 20 gives more frames and visible blocking.</p>` },
  { h: 'Turn the lamp off in code',
    body: `<p>GPIO 4 is that blinding white LED. It is also shared with the SD card's data line, so if you add
    an SD card later, expect the lamp to flicker whenever the card is written. Not a fault.</p>` }
],

trouble: [
  { q: '<code>Brownout detector was triggered</code> in the Serial Monitor',
    a: `The supply sagged. In order: use a proper 5&nbsp;V 2&nbsp;A supply rather than a laptop USB port,
    shorten the power wires, add the 1000&nbsp;&micro;F capacitor. There is a well-known code hack that disables
    the brownout detector - it silences the message without fixing the sag, and you get corrupt frames
    instead of a clear error. Fix the power.` },
  { q: '<code>Camera init failed with error 0x105</code>',
    a: `<code>ESP_ERR_NOT_FOUND</code> - the sensor did not answer. Either the ribbon cable is not seated
    (flip the black retaining bar up, push the ribbon fully home, press the bar down), or, again, power.` },
  { q: '<code>A fatal error occurred: Failed to connect to ESP32</code>',
    a: `The IO0 jumper is not fitted, TX and RX are not crossed, the adapter is on 3.3&nbsp;V, or the board did
    not get reset after the jumper went on. Try holding RST down, starting the upload, and releasing when the
    dots appear.` },
  { q: 'Uploads fine, then nothing happens',
    a: `You left the IO0 jumper in. Remove it and press RST.` },
  { q: '<code>Sketch too big</code>',
    a: `Tools &rarr; Partition Scheme &rarr; Huge APP (3MB No OTA).` },
  { q: 'Stream runs for a few seconds then freezes',
    a: `A frame buffer was not returned - check every <code>esp_camera_fb_get()</code> has a matching
    <code>esp_camera_fb_return()</code> on every code path, including the error paths. Or Wi-Fi power save is
    on; <code>WiFi.setSleep(false)</code> fixes that.` },
  { q: 'Connects to Wi-Fi at home, not at a friend\'s house',
    a: `The ESP32 is 2.4&nbsp;GHz only. A combined 2.4/5&nbsp;GHz network with one name usually works; a
    5&nbsp;GHz-only network never will. Also, captive-portal guest networks will not work at all.` },
  { q: 'Picture is dark and grainy indoors',
    a: `The OV2640 is a small cheap sensor and genuinely poor in low light. Raise
    <code>set_aec_value</code>, accept the motion blur, or add light. The onboard lamp is harsh but effective
    at close range.` },
  { q: 'Board gets hot',
    a: `Warm is normal - the regulator drops 5&nbsp;V to 3.3&nbsp;V linearly and streaming draws about
    300&nbsp;mA. Too hot to touch for more than a second is not; check you have not shorted anything and that
    you are feeding 5&nbsp;V, not 12&nbsp;V.` }
],

next: `
<ul>
  <li><strong>Record motion to the SD card</strong> - that is the <a href="project.html?p=esp32cam-motion-trap">motion
  trap</a> project.</li>
  <li><strong>Add a pan-tilt head</strong>: two SG90 servos and two more URLs, and you can aim it from the
  browser. Servos and the camera must not share a supply.</li>
  <li><strong>Put it behind a reverse proxy</strong> with a password before you expose it to the internet.
  This sketch has no authentication whatsoever and should never be port-forwarded as it stands.</li>
  <li><strong>Make it battery powered</strong> with deep sleep between stills - a long way from a live stream,
  but it turns the same $7 board into a trail camera that lasts months.</li>
</ul>`,

safety: `
<p>A camera is a privacy device, not just a gadget. Two things worth being deliberate about:</p>
<ul>
  <li><strong>Do not port-forward this.</strong> There is no password on it. A stream you can reach from the
  internet is a stream anybody can reach, and search engines specifically index open camera streams. Use a VPN
  back to your own network, or a reverse proxy with authentication.</li>
  <li><strong>Where you point it matters legally.</strong> In most of Europe, filming a public pavement or a
  neighbour's garden brings you under data protection law even for a home camera. Point it at your own
  property, and tell people who live there that it exists.</li>
</ul>`
});
