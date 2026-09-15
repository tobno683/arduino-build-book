/* Battery timelapse camera: ESP32-CAM, timer wake, SD card. */
AB.addProject({
slug: 'timelapse-camera',
title: 'Battery timelapse camera',
cat: 'camera',
level: 3,
time: '2 hours',
solder: true,
board: 'ESP32-CAM',
tags: ['esp32cam', 'timelapse', 'deep sleep', 'sd card', 'battery', '18650'],
blurb: 'Wakes on a timer, takes one frame, sleeps again. Weeks of a building site, a plant growing or the sky, assembled into a video afterwards.',

skills: ['Timer deep sleep', 'RTC memory', 'SD card writing', 'LiPo power', 'ffmpeg assembly'],

intro: `
<p>Identical hardware to the <a href="project.html?p=esp32cam-motion-trap">motion trap</a>, one different wake
source, and a completely different result. Instead of waiting for something to happen, this takes a photograph
every N minutes and writes it to the card. Two weeks later you run one command and get a video of a season
changing.</p>
<p>It is also the cheapest possible introduction to power budgeting, because the arithmetic is unusually
clean: you know exactly how often it wakes and roughly what each wake costs, so you can predict the battery
life on paper and then check it.</p>`,

what: [
  'Wake every N minutes, take one photo to the SD card, and sleep again - typically 3 seconds awake out of every 300.',
  'Number files sequentially so they sort correctly for assembly into video.',
  'Keep counting across sleeps, and pick up from where it left off after a battery change.',
  'Run about three weeks on a single 18650 cell at a five-minute interval.'
],

how: `
<p>The ESP32's RTC timer runs during deep sleep off a low-power oscillator, and
<code>esp_sleep_enable_timer_wakeup()</code> tells it how long to wait. The chip restarts from
<code>setup()</code> when the time is up, exactly as with a motion wake.</p>
<p>That oscillator is cheap and drifts - expect a few percent, so a "5 minute" interval might really be 4:50 or
5:10, and it varies with temperature. For a timelapse this does not matter at all, because you are going to
play the frames back at a constant rate anyway. If you need accurate wall-clock intervals, add a DS3231 and
wake from its alarm pin instead.</p>
<p><strong>The power arithmetic:</strong> awake for about 3&nbsp;seconds at 180&nbsp;mA is 0.15&nbsp;mAh per
photo. Asleep it is roughly 3&nbsp;mA on this board, or 0.25&nbsp;mAh per 5&nbsp;minutes. So each cycle costs
about 0.4&nbsp;mAh, twelve cycles an hour, about 115&nbsp;mAh a day. A 2500&nbsp;mAh 18650 gives you three
weeks - and the sleep current, not the photos, is what is eating it.</p>`,

bom: [
  { id: 'esp32cam', qty: 1 },
  { id: 'sdcard-8gb', qty: 1, note: 'A 32 GB card holds roughly 200,000 SVGA frames. You will run out of battery long before card space.' },
  { id: '18650', qty: 1, note: 'Cell plus holder. A protected cell, or a holder with a protection board.' },
  { id: 'tp4056', qty: 1, note: 'The version WITH protection - two extra chips by the USB socket. Charges the cell and stops it being over-discharged.' },
  { id: 'buck', qty: 1, note: 'Boost or buck-boost to get a steady 5 V from a cell that runs 4.2 V down to 3.2 V. An MT3608 boost module also works.' },
  { id: 'switch', qty: 1 },
  { id: 'ftdi', qty: 1, own: true },
  { id: 'cap1000', qty: 1, own: true },
  { id: 'box-ip65', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'cam',  comp: 'esp32cam',     at: [0, -20] },
    { id: 'reg',  comp: 'buck',         at: [-6, 44], ry: 180 },
    { id: 'chg',  comp: 'tp4056',       at: [52, 44] },
    { id: 'batt', comp: 'battery18650', at: [0, 92] }
  ],
  wires: [
    { from: 'batt.+',  to: 'chg.B+',   color: 'red',   note: 'Cell positive into the charger board' },
    { from: 'batt.-',  to: 'chg.B-',   color: 'black', note: 'Cell negative' },
    { from: 'chg.OUT+', to: 'reg.IN+', color: 'red',   note: 'Protected output feeds the regulator' },
    { from: 'chg.OUT-', to: 'reg.IN-', color: 'black', note: 'Ground' },
    { from: 'reg.OUT+', to: 'cam.5V',  color: 'red',   note: 'Regulated 5 V to the camera board' },
    { from: 'reg.OUT-', to: 'cam.GND', color: 'black', note: 'Ground' }
  ]
},

wireIntro: `<p>The camera end is exactly the streaming build. What is new is the power chain, and it is worth
getting in the right order: <strong>cell &rarr; protection/charger &rarr; regulator &rarr; board</strong>.
Never straight from the cell to the board.</p>`,

wireNotes: `
<div class="note danger"><span class="t">B+/B- and OUT+/OUT- are not interchangeable</span>
<p>On a TP4056 module, <strong>B+/B-</strong> go to the cell and <strong>OUT+/OUT-</strong> go to your circuit.
Wiring the load to B+/B- bypasses the protection circuit entirely, which is the whole reason you bought the
protected version. The cell then has nothing stopping it being discharged to 2&nbsp;V, which permanently
damages it and can make it dangerous to recharge.</p></div>

<div class="note warn"><span class="t">Get a regulator that copes with a falling cell</span>
<p>An 18650 runs from 4.2&nbsp;V full to about 3.0&nbsp;V empty. A plain buck (step-down) module cannot make
5&nbsp;V from 3.5&nbsp;V. You want either a <strong>boost</strong> converter (MT3608) or a
<strong>buck-boost</strong>. Set it to 5.0&nbsp;V with a multimeter on the output <em>before</em> you connect
the camera - these modules ship set to anything, and some ship at 12&nbsp;V.</p></div>`,

solderSteps: [
  { h: 'Set the regulator output first, with nothing attached',
    body: `<p>Power the module from the cell, put the multimeter on its OUT+ and OUT-, and turn the little brass
    screw on the blue trimmer until it reads 5.0&nbsp;V. It is a multi-turn pot - it may take fifteen turns
    before anything moves, so keep going rather than assuming it is broken.</p>
    <p>Then disconnect everything again.</p>` },
  { h: 'Solder the cell holder to the charger board',
    body: `<p>Holder red wire to <strong>B+</strong>, black to <strong>B-</strong>. Tin the pads, tin the wire
    ends, hold and touch for a second each.</p>
    <p>These pads are large and will suck heat out of a small iron. If the solder is not flowing within three
    seconds, turn the iron up 20&nbsp;&deg;C rather than holding it there longer.</p>` },
  { h: 'Charger OUT to regulator IN, through the switch',
    body: `<p>Put the slide switch in the positive line: OUT+ to one switch pin, the other switch pin to the
    regulator IN+. OUT- straight to IN-.</p>
    <p>Sleeve the switch joints in heat-shrink. A shorted switch here means a shorted cell.</p>` },
  { h: 'Regulator OUT to the camera, plus the capacitor',
    body: `<p>Short, thick-ish wire - 22&nbsp;AWG. Solder the 1000&nbsp;&micro;F capacitor across the camera's
    5&nbsp;V and GND pins at the same time, stripe to ground.</p>` },
  { h: 'The pre-flight check',
    body: `<p>Switch off. Multimeter on continuity: 5&nbsp;V to GND at the camera end must <strong>not</strong>
    beep. Switch on, multimeter on volts: you want 5.0&nbsp;V &plusmn;0.1 at the camera pins.</p>
    <p>Only then plug the cell in properly and power the board.</p>` }
],

assembly: [
  { h: 'Upload before you build the power chain',
    body: `<p>Programme the board over USB serial first, confirm it takes photos, and only then move it onto
    battery power. Debugging code and power at the same time is how evenings disappear.</p>` },
  { h: 'Choose the interval',
    body: `<p><code>MINUTES_BETWEEN</code> at the top of the sketch. Rules of thumb: a plant growing needs
    15-30&nbsp;minutes, a building site 5&nbsp;minutes, clouds 10&nbsp;seconds, a sunset 5&nbsp;seconds.</p>
    <p>At 25&nbsp;fps playback, one hour of real time at a 5-minute interval becomes half a second of video. Be
    generous with how long you leave it running.</p>` },
  { h: 'Fix the camera so it genuinely cannot move',
    body: `<p>This is the entire difference between a timelapse and a shaky mess. Screw the enclosure to
    something solid. Do not use a gooseneck mount, do not rest it on a windowsill, and do not put it where a
    door slams.</p>` },
  { h: 'Lock the exposure if the light will change',
    body: `<p>Auto-exposure makes every frame a slightly different brightness, and at 25&nbsp;fps that flickers
    horribly. See the calibration section.</p>` },
  { h: 'Seal it and leave it',
    body: `<p>Lens against a drilled hole, sealed with clear silicone. A sachet of silica gel inside the box
    stops the lens fogging on cold mornings.</p>` }
],

libraries: [
  { name: 'esp32 board package', by: 'Espressif', how: 'Boards Manager', why: 'esp_camera, SD_MMC and the sleep API.' }
],

code: [{
  name: 'esp32cam_timelapse.ino',
  code: `/* ------------------------------------------------------------------
   ESP32-CAM timelapse
   Wakes on a timer, saves one JPEG, sleeps again.
   Board: AI Thinker ESP32-CAM   Partition: Huge APP
   ------------------------------------------------------------------ */

#include "esp_camera.h"
#include "FS.h"
#include "SD_MMC.h"
#include "driver/rtc_io.h"

// ---- settings --------------------------------------------------------
#define MINUTES_BETWEEN  5
#define LOCK_EXPOSURE    false    // true once you have found a good value
#define FIXED_AEC        400      // 0-1200, bigger = brighter
#define FRAME            FRAMESIZE_SVGA   // 800x600
// ----------------------------------------------------------------------

RTC_DATA_ATTR unsigned long frameNumber = 0;

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

void setup() {
  Serial.begin(115200);
  delay(40);

  if (!startCamera()) sleepNow();

  if (!SD_MMC.begin("/sdcard", true) || SD_MMC.cardType() == CARD_NONE) {
    Serial.println("no SD card");
    sleepNow();
  }

  // On the very first boot, find the highest existing frame number so a
  // battery change does not overwrite everything taken so far.
  if (frameNumber == 0) frameNumber = highestExisting();

  // let the auto-exposure settle
  for (int i = 0; i < 2; i++) {
    camera_fb_t* junk = esp_camera_fb_get();
    if (junk) esp_camera_fb_return(junk);
    delay(200);
  }

  camera_fb_t* fb = esp_camera_fb_get();
  if (fb) {
    frameNumber++;
    char path[32];
    snprintf(path, sizeof(path), "/tl_%06lu.jpg", frameNumber);
    File f = SD_MMC.open(path, FILE_WRITE);
    if (f) {
      f.write(fb->buf, fb->len);
      f.close();
      Serial.printf("%s  %u bytes\\n", path, fb->len);
    } else {
      frameNumber--;
      Serial.println("write failed");
    }
    esp_camera_fb_return(fb);
  }

  SD_MMC.end();
  sleepNow();
}

void loop() { }

/* Scan the card once at power-up so numbering continues. */
unsigned long highestExisting() {
  unsigned long best = 0;
  File dir = SD_MMC.open("/");
  if (!dir) return 0;
  for (File e = dir.openNextFile(); e; e = dir.openNextFile()) {
    const char* n = e.name();
    const char* p = strstr(n, "tl_");
    if (p) {
      unsigned long v = strtoul(p + 3, NULL, 10);
      if (v > best) best = v;
    }
    e.close();
  }
  dir.close();
  Serial.printf("resuming after frame %lu\\n", best);
  return best;
}

bool startCamera() {
  camera_config_t c;
  c.ledc_channel = LEDC_CHANNEL_0;  c.ledc_timer = LEDC_TIMER_0;
  c.pin_d0 = Y2_GPIO_NUM;  c.pin_d1 = Y3_GPIO_NUM;
  c.pin_d2 = Y4_GPIO_NUM;  c.pin_d3 = Y5_GPIO_NUM;
  c.pin_d4 = Y6_GPIO_NUM;  c.pin_d5 = Y7_GPIO_NUM;
  c.pin_d6 = Y8_GPIO_NUM;  c.pin_d7 = Y9_GPIO_NUM;
  c.pin_xclk = XCLK_GPIO_NUM;    c.pin_pclk = PCLK_GPIO_NUM;
  c.pin_vsync = VSYNC_GPIO_NUM;  c.pin_href = HREF_GPIO_NUM;
  c.pin_sccb_sda = SIOD_GPIO_NUM; c.pin_sccb_scl = SIOC_GPIO_NUM;
  c.pin_pwdn = PWDN_GPIO_NUM;    c.pin_reset = RESET_GPIO_NUM;
  c.xclk_freq_hz = 20000000;
  c.pixel_format = PIXFORMAT_JPEG;
  c.fb_location  = CAMERA_FB_IN_PSRAM;
  c.grab_mode    = CAMERA_GRAB_LATEST;
  c.frame_size   = FRAME;
  c.jpeg_quality = psramFound() ? 10 : 14;
  c.fb_count     = psramFound() ? 2 : 1;

  if (esp_camera_init(&c) != ESP_OK) return false;

  if (LOCK_EXPOSURE) {
    sensor_t* s = esp_camera_sensor_get();
    s->set_gain_ctrl(s, 0);        // auto gain off
    s->set_exposure_ctrl(s, 0);    // auto exposure off
    s->set_aec_value(s, FIXED_AEC);
    s->set_whitebal(s, 0);         // auto white balance off - stops colour flicker
  }
  return true;
}

void sleepNow() {
  Serial.flush();
  rtc_gpio_isolate(GPIO_NUM_4);                       // keep the lamp dark
  esp_sleep_enable_timer_wakeup((uint64_t)MINUTES_BETWEEN * 60ULL * 1000000ULL);
  esp_deep_sleep_start();
}`,
  after: `<p>Note the <code>60ULL * 1000000ULL</code>. The timer takes microseconds, and five minutes is
  300,000,000 - far past what a 32-bit <code>int</code> holds. Writing it without the <code>ULL</code> suffixes
  silently overflows and you get a camera that wakes every few seconds and flattens the battery overnight.</p>`
}],

upload: `<p>Standard ESP32-CAM upload. Then let it run three cycles on the bench with the Serial Monitor open
and confirm the filenames increment and the gap between them is what you asked for.</p>`,

tune: [
  { h: 'Lock the exposure to stop flicker',
    body: `<p>Run first with <code>LOCK_EXPOSURE false</code>, look at the resulting frames, and pick a time of
    day that represents the light you mostly care about. Then set <code>LOCK_EXPOSURE true</code> and tune
    <code>FIXED_AEC</code> until a test shot at that time looks right. 200 is bright daylight, 600 is an
    overcast day, 1000 is dim indoors.</p>
    <p>Turning off auto white balance matters just as much: a scene that drifts between warm and cool between
    frames looks worse than one that is slightly the wrong colour throughout.</p>` },
  { h: 'Work out how long to leave it',
    body: `<p><em>Video seconds = frames &divide; 25.</em> At a 5-minute interval you get 288 frames a day,
    which is 11.5 seconds of video per day. A week gives you 80 seconds. Most people massively underestimate
    this and stop after two days.</p>` },
  { h: 'Assemble the video',
    body: `<p>Copy the folder off the card and, with <a href="https://ffmpeg.org" target="_blank"
    rel="noopener">ffmpeg</a> installed, run this in that folder:</p>
    <p><code>ffmpeg -framerate 25 -pattern_type glob -i "tl_*.jpg" -c:v libx264 -pix_fmt yuv420p -crf 20 out.mp4</code></p>
    <p>On Windows, glob patterns are not supported - use
    <code>ffmpeg -framerate 25 -i tl_%06d.jpg -c:v libx264 -pix_fmt yuv420p out.mp4</code> instead, which is
    why the filenames are zero-padded to six digits.</p>` },
  { h: 'Smooth out the remaining flicker',
    body: `<p>Even with locked exposure, passing clouds cause brightness steps. ffmpeg has a deflicker filter:
    add <code>-vf deflicker=mode=pm:size=10</code> to the command above. It is not magic but it helps a lot.</p>` }
],

trouble: [
  { q: 'Wakes far more often than the interval',
    a: `Integer overflow in the sleep time. Check the <code>ULL</code> suffixes are present exactly as
    printed.` },
  { q: 'Battery dies in two days',
    a: `Something is not sleeping. Measure the current with a USB meter or a multimeter in series during a
    sleep window. Common culprits: the lamp pin floating (fixed by <code>rtc_gpio_isolate</code>), a power bank
    keeping its own circuitry awake, or a regulator with a high quiescent draw - some cheap boost modules
    burn 10&nbsp;mA doing nothing.` },
  { q: 'Frame numbers restart and overwrite old photos',
    a: `<code>highestExisting()</code> did not find the files - usually because the card would not mount on
    that boot. It is defensive code, not a guarantee; for a long unattended run, back the card up periodically.` },
  { q: 'Video looks jerky rather than smooth',
    a: `Not enough frames. A timelapse needs a consistent interval and a lot of images; missing frames are much
    more visible than a slightly wrong interval.` },
  { q: 'All the frames are dark after a week outdoors',
    a: `Condensation on the inside of the lens hole, or a spider. Both are extremely common. Silica gel and a
    small hood over the lens fix most of it.` }
],

next: `
<ul>
  <li><strong>Add a DS3231</strong> and wake from its alarm for an exact interval, plus real timestamps in the
  filename.</li>
  <li><strong>Only shoot in daylight</strong>: read an LDR on an analog pin before committing to the photo, and
  go straight back to sleep if it is dark. Doubles the battery life of an outdoor run.</li>
  <li><strong>Solar</strong>: a 5&nbsp;W panel and a charge controller into the TP4056 makes it indefinite.
  See the <a href="project.html?p=solar-battery-logger">solar logger</a> for the charging side.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">A lithium cell, outdoors, unattended for weeks</span>
<p>This build combines the three things that make lithium worth respecting: a cell, weather, and nobody
watching it.</p>
<ul>
  <li><strong>Load on OUT+/OUT-, cell on B+/B-.</strong> Never the other way round. Wiring the load to the
  battery terminals bypasses the protection board, and an unattended cell taken below about 2.5&nbsp;V is
  damaged and can be hazardous to recharge.</li>
  <li><strong>Never charge below 0&nbsp;&deg;C.</strong> Charging a cold lithium cell plates metallic lithium
  inside it, which can short internally later. If this is going to run through a winter, either add a
  temperature check that inhibits charging or accept that it should come indoors.</li>
  <li><strong>Check polarity twice</strong> before fitting the cell. A cell reversed into a TP4056 fails
  immediately and sometimes dramatically.</li>
  <li><strong>Use a protected cell as well as a protected board.</strong> It costs a dollar more and it is the
  belt to the board's braces.</li>
  <li><strong>Not salvaged laptop cells</strong> for anything left outdoors unattended. You do not know their
  history and you will not be there when they fail.</li>
  <li><strong>Seal it properly.</strong> Water into a lithium circuit is a fire risk, not just a dead project.
  Glands pointing down, silicone round the lens hole, silica gel inside.</li>
  <li><strong>Inspect after any impact</strong> - a fall from a tree counts. A dented or puffed cell is
  finished.</li>
</ul>
</div>`
});
