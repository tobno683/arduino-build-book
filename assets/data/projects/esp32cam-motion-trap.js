/* ESP32-CAM + PIR motion trap that saves stills to SD and sleeps between. */
AB.addProject({
slug: 'esp32cam-motion-trap',
title: 'Motion-triggered camera trap',
cat: 'camera',
level: 3,
time: '3 hours',
solder: true,
board: 'ESP32-CAM',
tags: ['esp32cam', 'pir', 'sd card', 'deep sleep', 'wildlife', 'security'],
blurb: 'Sleeps at 6 microamps until a PIR sensor sees something warm move, then wakes, takes a numbered photo to the SD card and goes back to sleep. Months on a battery.',

skills: ['Deep sleep and wake sources', 'SD card file systems', 'PIR tuning', 'Power budgeting', 'RTC memory'],

intro: `
<p>A live stream is useless if nobody is watching it. A camera trap is the opposite: it does nothing at all
until something happens, which is why it can run for months on a battery pack while a streaming camera needs
mains power.</p>
<p>The trick is that the ESP32 can be switched almost entirely off - everything but a tiny always-on domain -
and be woken by a single pin going high. Asleep it draws around 6&nbsp;&micro;A. Awake for the two seconds it
takes to photograph something, about 200&nbsp;mA. If it triggers fifty times a day, the average is well under
a milliamp, and a 10,000&nbsp;mAh power bank lasts most of a year.</p>`,

what: [
  'Sleep until the PIR sensor detects movement, drawing microamps in between.',
  'Wake, take a photo, and save it to the SD card with a sequential number that survives reboots.',
  'Write a <code>log.txt</code> line for every trigger, so you can see when things happened.',
  'Flash the onboard lamp for night shots, optionally.',
  'Go straight back to sleep, all within about two seconds of the trigger.'
],

how: `
<p><strong>Deep sleep</strong> on an ESP32 powers down the CPU, the radio and most of the RAM. What stays
alive is the RTC domain: a low-power oscillator, a few kilobytes of RTC memory, and the ability to watch
certain pins. Waking from deep sleep is not a resume - the chip restarts from the top of
<code>setup()</code> with all normal variables reset. Anything that must survive is declared
<code>RTC_DATA_ATTR</code>, which places it in that surviving RTC memory. That is how the photo counter keeps
counting.</p>
<p><strong>The PIR</strong> contains a pyroelectric sensor behind a faceted plastic lens. Each facet focuses a
different slice of the scene onto the element, so a warm body crossing the field sweeps from facet to facet
and the element sees a rapid change. It detects <em>movement of heat</em>, not heat - a person standing
perfectly still disappears from it after a few seconds, and a warm radiator is invisible.</p>
<p><strong>GPIO 13</strong> is the wake pin here because it is one of the ESP32's RTC-capable pins and it is
free on this board. Not every pin can wake the chip; the RTC GPIOs on the ESP32-CAM headers are 12, 13, 14, 15,
2 and 4, and several of those are shared with the SD card.</p>`,

bom: [
  { id: 'esp32cam', qty: 1 },
  { id: 'pir', qty: 1, note: 'HC-SR501. Has two orange trimmer pots and a jumper - all three get set below.' },
  { id: 'sdcard-8gb', qty: 1, note: 'Format it FAT32. Cards over 32 GB need to be forced to FAT32, and cards over 64 GB often just will not mount.' },
  { id: 'ftdi', qty: 1, own: true, note: 'For programming, unless you have the MB shield.' },
  { id: 'psu5v3a', qty: 1, own: true, note: 'For the bench. In the field, a USB power bank.' },
  { id: 'cap1000', qty: 1, own: true },
  { id: 'box-ip65', qty: 1, note: 'If it is going outdoors. Drill one hole for the lens and one for the PIR dome, and seal both with clear silicone.' },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'cam', comp: 'esp32cam', at: [0, 0] },
    { id: 'pir', comp: 'pir',      at: [0, -58], ry: 180 }
  ],
  wires: [
    { from: 'pir.VCC', to: 'cam.5V',   color: 'red',   note: 'The HC-SR501 has its own regulator and wants 5 V' },
    { from: 'pir.GND', to: 'cam.GND',  color: 'black', note: 'Ground' },
    { from: 'pir.OUT', to: 'cam.IO13', color: 'blue',  note: 'Goes HIGH on motion. This is the wake-up line' }
  ]
},

wireIntro: `<p>Three wires. The interesting part of this build is not the wiring - it is the three settings
on the PIR module itself, and those are covered under calibration.</p>`,

wireNotes: `
<div class="note warn"><span class="t">GPIO 13 is shared with the SD card in 4-bit mode</span>
<p>The sketch mounts the card in <strong>1-bit mode</strong> (<code>SD_MMC.begin("/sdcard", true)</code>)
precisely so that GPIO 13 and GPIO 12 are left free. If you copy SD code from elsewhere that omits that
<code>true</code>, the card will grab pin 13 and the PIR will stop working - or worse, work intermittently.</p></div>

<div class="note tip"><span class="t">The PIR output is 3.3 V logic, which is what we want</span>
<p>Despite running from 5&nbsp;V, the HC-SR501's output pin swings to about 3.3&nbsp;V, so it is safe on an
ESP32 input. This is one of the few 5&nbsp;V-powered modules you can connect directly without a level shifter.
Check with a multimeter if you are unsure: trigger it and measure OUT to GND.</p></div>`,

solderSteps: [
  { h: 'Headers on the camera board, if needed',
    body: `<p>Same as the streaming build: pins down, breadboard as a jig, tack the ends first, check it is
    square, then fill in.</p>` },
  { h: 'Reservoir capacitor across 5 V and GND',
    body: `<p>1000&nbsp;&micro;F, stripe (negative) to GND. This matters more here than on the streaming
    build, because the current goes from microamps to 200&nbsp;mA in an instant every time it wakes, and a
    power bank's output cannot follow that step without help.</p>
    <p>Tin both pads, tin both trimmed legs, hold and touch. One second per joint.</p>` },
  { h: 'Make a three-wire loom for the PIR',
    body: `<p>Cut three lengths of stranded wire to the distance you actually need - red, black and blue,
    200&nbsp;mm is usually plenty. Strip 4&nbsp;mm, twist, tin each end.</p>
    <p>The PIR's own header is three male pins. Either use a 3-pin female dupont housing, or desolder the
    header and solder your wires straight into the holes for a connection that cannot rattle loose in a box
    outdoors.</p>` },
  { h: 'Sleeve everything',
    body: `<p>Heat-shrink over each joint - slid on before soldering, as always. In an outdoor box, a bare
    joint plus condensation equals a corroded open circuit in one winter.</p>` },
  { h: 'Continuity check before power',
    body: `<p>Beep from the PIR's VCC wire to the camera's 5&nbsp;V pin. Beep from GND to GND. <strong>No
    beep</strong> between 5&nbsp;V and GND. Then power up.</p>` }
],

assembly: [
  { h: 'Format the SD card FAT32',
    body: `<p>Windows will refuse to offer FAT32 for cards over 32&nbsp;GB; use the official SD Card Formatter
    tool, or just buy a 16 or 32&nbsp;GB card, which is more than enough for tens of thousands of VGA stills.</p>
    <p>Insert it with the board unpowered. The slot is friction only - it does not click.</p>` },
  { h: 'Upload with the IO0 jumper, as before',
    body: `<p>Board: AI Thinker ESP32-CAM. Partition: Huge APP. Jumper IO0 to GND, press RST, upload, remove
    jumper, press RST.</p>` },
  { h: 'Bench-test before you seal anything',
    body: `<p>Serial Monitor at 115200. Wave your hand. You should see the wake reason, the file name, and then
    "sleeping". Pull the card, put it in a computer, look at the photo.</p>
    <p>Do this <em>before</em> the box, the silicone and the tree. Every single time you skip this step you
    will end up unscrewing something in the rain.</p>` },
  { h: 'Set the PIR up properly',
    body: `<p>See the calibration section - it is the difference between fifty useful photos and four thousand
    pictures of a swaying branch.</p>` },
  { h: 'Mount it',
    body: `<p>Camera and PIR must look the same way, and the PIR's dome must not be behind glass or plastic -
    ordinary plastic and glass block the long-wave infrared it works on. Drill a hole and let the dome poke
    through, sealed round the rim with clear silicone.</p>
    <p>Mount it 1.5-2&nbsp;m up, tilted slightly down, and <em>not</em> facing the sun at any time of day.
    Sun moving across the field of view triggers PIRs constantly.</p>` }
],

libraries: [
  { name: 'esp32 board package', by: 'Espressif', how: 'Boards Manager', why: 'Provides esp_camera.h, SD_MMC.h, FS.h and the deep-sleep API. No other library needed.' }
],

code: [{
  name: 'esp32cam_motion_trap.ino',
  intro: `<p>The photo counter lives in RTC memory so it keeps incrementing across every sleep cycle, and it is
  also written to the log so you can tell whether you lost any.</p>`,
  code: `/* ------------------------------------------------------------------
   ESP32-CAM motion trap

   Sleeps at a few microamps. A HIGH on GPIO 13 (from a PIR) wakes it,
   it takes one photo to the SD card, appends a log line, and sleeps.

   Board: AI Thinker ESP32-CAM   Partition: Huge APP
   ------------------------------------------------------------------ */

#include "esp_camera.h"
#include "FS.h"
#include "SD_MMC.h"
#include "driver/rtc_io.h"

#define PIR_PIN        GPIO_NUM_13
#define FLASH_LED_PIN  4
#define USE_FLASH      false      // true for night shots - it is very bright
#define SETTLE_MS      400        // let the sensor auto-expose before grabbing

// Survives deep sleep because it lives in the RTC power domain.
RTC_DATA_ATTR unsigned long photoNumber = 0;
RTC_DATA_ATTR unsigned long wakeCount   = 0;

// AI-Thinker pin map
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
  delay(50);

  wakeCount++;
  esp_sleep_wakeup_cause_t why = esp_sleep_get_wakeup_cause();
  Serial.printf("\\nwake #%lu, reason %d\\n", wakeCount, (int)why);

  if (!startCamera()) { sleepNow(); }

  // 1-bit mode leaves GPIO 12 and 13 free. The "true" is load-bearing.
  if (!SD_MMC.begin("/sdcard", true)) {
    Serial.println("SD card would not mount");
    sleepNow();
  }
  if (SD_MMC.cardType() == CARD_NONE) {
    Serial.println("No card in the slot");
    sleepNow();
  }

  if (USE_FLASH) {
    pinMode(FLASH_LED_PIN, OUTPUT);
    digitalWrite(FLASH_LED_PIN, HIGH);
  }

  // The first frame after power-up is usually badly exposed: the sensor's
  // automatic gain has not settled. Throw two away, keep the third.
  for (int i = 0; i < 2; i++) {
    camera_fb_t* junk = esp_camera_fb_get();
    if (junk) esp_camera_fb_return(junk);
    delay(SETTLE_MS / 2);
  }

  camera_fb_t* fb = esp_camera_fb_get();
  if (USE_FLASH) digitalWrite(FLASH_LED_PIN, LOW);

  if (!fb) {
    Serial.println("Frame grab failed");
    sleepNow();
  }

  photoNumber++;
  char path[32];
  snprintf(path, sizeof(path), "/img_%05lu.jpg", photoNumber);

  File f = SD_MMC.open(path, FILE_WRITE);
  if (f) {
    f.write(fb->buf, fb->len);
    f.close();
    Serial.printf("saved %s  (%u bytes)\\n", path, fb->len);
    appendLog(path, fb->len);
  } else {
    Serial.println("Could not open the file for writing");
    photoNumber--;                 // do not burn a number on a failure
  }

  esp_camera_fb_return(fb);
  SD_MMC.end();
  sleepNow();
}

void loop() { }                    // never runs: setup() always sleeps

/* -------------------------------------------------------------------- */
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
  c.fb_location  = CAMERA_FB_IN_PSRAM;
  c.grab_mode    = CAMERA_GRAB_LATEST;

  if (psramFound()) {
    c.frame_size   = FRAMESIZE_SVGA;   // 800x600 - a good size for stills
    c.jpeg_quality = 10;
    c.fb_count     = 2;
  } else {
    c.frame_size   = FRAMESIZE_VGA;
    c.jpeg_quality = 12;
    c.fb_count     = 1;
  }

  esp_err_t err = esp_camera_init(&c);
  if (err != ESP_OK) {
    Serial.printf("camera init failed 0x%x\\n", err);
    return false;
  }
  return true;
}

void appendLog(const char* path, size_t bytes) {
  File log = SD_MMC.open("/log.txt", FILE_APPEND);
  if (!log) return;
  // No RTC on this board, so log uptime since the last full power-up
  // plus the wake number. Add a DS3231 if you want real timestamps.
  log.printf("%lu,%s,%u,%lu\\n", wakeCount, path, (unsigned)bytes, millis());
  log.close();
}

void sleepNow() {
  Serial.println("sleeping");
  Serial.flush();

  // Wake when GPIO 13 goes HIGH.
  rtc_gpio_pulldown_en(PIR_PIN);     // definite LOW when the PIR is idle
  rtc_gpio_pullup_dis(PIR_PIN);
  esp_sleep_enable_ext0_wakeup(PIR_PIN, 1);

  // Hold the lamp off through sleep so it cannot glow.
  rtc_gpio_isolate(GPIO_NUM_4);

  esp_deep_sleep_start();
}`,
  after: `<p>Two details worth understanding:</p>
  <ul>
    <li><strong>The throwaway frames.</strong> The first image after the sensor powers up is nearly always
    over- or under-exposed. Grabbing and discarding two, then keeping the third, costs 400&nbsp;ms of battery
    and is the difference between usable photos and a folder of white rectangles.</li>
    <li><strong><code>rtc_gpio_isolate(GPIO_NUM_4)</code>.</strong> Without it, the flash LED pin floats
    during sleep and the lamp glows faintly - which looks like nothing and quietly triples your sleep current.</li>
  </ul>`
}],

upload: `
<p>Same procedure as any ESP32-CAM: IO0 to GND, RST, upload, remove the jumper, RST.</p>
<p>Watch the Serial Monitor at 115200 through one full cycle. You want to see, in order:
<code>wake #1, reason 0</code> (a normal power-on), <code>saved /img_00001.jpg</code>, <code>sleeping</code>.
Then wave your hand and watch <code>wake #2, reason 2</code> - reason 2 is <code>ESP_SLEEP_WAKEUP_EXT0</code>,
which means the PIR did it.</p>
<div class="note tip"><span class="t">The serial connection dies during deep sleep</span>
<p>The USB adapter stays connected, but the board stops talking. Your terminal may need reopening after each
wake. This is normal and not a fault.</p></div>`,

tune: [
  { h: 'Set the PIR jumper to repeat-trigger (H)',
    body: `<p>The little jumper next to the pins has two positions. <strong>H</strong> (repeatable) keeps the
    output high as long as movement continues, and re-triggers. <strong>L</strong> (single) goes high once and
    then ignores everything for the delay period.</p>
    <p>For a camera trap you want <strong>H</strong>, so that a subject moving through the frame keeps the line
    high rather than dropping it and re-triggering a second exposure of empty grass.</p>` },
  { h: 'Turn the delay pot fully anticlockwise',
    body: `<p>One pot sets how long OUT stays high after a trigger: about 3&nbsp;seconds at minimum,
    5&nbsp;minutes at maximum. You want the minimum. The board must see the line go <em>low</em> again before
    it can be woken by the next rising edge, so a long delay means missing everything that happens in the
    following five minutes.</p>` },
  { h: 'Start the sensitivity pot in the middle, then walk the scene',
    body: `<p>The other pot sets range, roughly 3 to 7&nbsp;metres. Set it mid-way, then walk across the field
    of view at the distance you care about and watch the Serial Monitor. Turn it up until you are detected
    reliably, then back off a fraction.</p>
    <p>Too sensitive outdoors means every warm gust and every moving leaf. If you get hundreds of empty photos,
    the answer is almost always this pot, not the code.</p>` },
  { h: 'Allow for the PIR warm-up',
    body: `<p>An HC-SR501 takes 30 to 60 seconds after power-on to stabilise, and it fires spuriously during
    that time. Expect two or three junk photos every time you power the whole thing up. That is the sensor, not
    your build.</p>` },
  { h: 'Measure the sleep current before you trust the battery estimate',
    body: `<p>A USB power meter in line with the power bank will show it. You are looking for something in the
    single-digit milliamps at worst - the camera module's own regulator and the PIR together dominate the
    ESP32's 6&nbsp;&micro;A, so realistically expect 2-4&nbsp;mA total, not microamps.</p>
    <p>That is still roughly 100 days from a 10,000&nbsp;mAh bank. If you measure 60&nbsp;mA, something is not
    sleeping - usually the lamp pin.</p>` }
],

trouble: [
  { q: 'Wakes constantly, hundreds of photos of nothing',
    a: `Sensitivity too high, sun or headlights crossing the view, or the PIR looking at a heat source that
    moves - a vent, laundry on a line, a tree. Turn the sensitivity pot down and re-aim. Also confirm the
    delay pot is at minimum and the jumper is on H.` },
  { q: 'Never wakes at all',
    a: `Measure the PIR's OUT pin with a multimeter while you wave at it - it should jump to about
    3.3&nbsp;V. If it does, the fault is the wake configuration; check the wire really is on IO13 and that the
    SD card mounted in 1-bit mode. If OUT never rises, give the sensor a minute to warm up, then suspect the
    module.` },
  { q: 'Photos are all white, or all black',
    a: `The exposure had not settled. Increase <code>SETTLE_MS</code> and throw away three frames instead of
    two. At night with <code>USE_FLASH</code> off, black is simply correct - the OV2640 cannot see in the dark.` },
  { q: '<code>SD card would not mount</code>',
    a: `Card is not FAT32, is bigger than 32&nbsp;GB, is not pushed fully in, or is a card the ESP32 dislikes -
    they are genuinely picky. Try another card before you suspect anything else. Also confirm you passed
    <code>true</code> to <code>SD_MMC.begin()</code>.` },
  { q: 'Works on the bench, dead in the box',
    a: `Almost always the power bank. Many banks switch themselves off when the load drops below about
    50&nbsp;mA - which is exactly what deep sleep does. Look for a bank advertised as supporting
    "low current devices" or "trickle charging", or run from a battery and a proper regulator instead.` },
  { q: 'Photo numbering restarts at 1',
    a: `The board fully lost power, which clears RTC memory. Expected. If you need numbering that truly
    survives, write the counter to a file on the card and read it back at boot.` },
  { q: 'Photos have a pink or purple cast',
    a: `The IR-cut filter has been removed or damaged, or you bought a "night vision" variant that has none.
    Fine for wildlife, ugly by day.` }
],

next: `
<ul>
  <li><strong>Add a DS3231 clock</strong> so the log has real dates and the filenames carry timestamps. Two
  wires on I2C, and it keeps time through deep sleep on its own coin cell.</li>
  <li><strong>Send the photo somewhere.</strong> Wake, connect to Wi-Fi, POST the JPEG to a Telegram bot, then
  sleep. Costs about 4 seconds and 150&nbsp;mA per trigger, so the battery life drops hard - worth it for a
  doorway, not for a field.</li>
  <li><strong>Add infrared illumination.</strong> An 850&nbsp;nm IR LED array plus a camera with the IR-cut
  filter removed gives you night shots without visible light scaring anything off.</li>
  <li><strong>Timelapse instead of motion</strong> - the same hardware with a timer wake source is the
  <a href="project.html?p=timelapse-camera">timelapse project</a>.</li>
</ul>`,

safety: `<p>Point it at your own property. A camera aimed at a shared path or a neighbour's land brings you
under data-protection rules in most of Europe and much of the US, even as a hobby project, and "it is just an
ESP32" is not a defence.</p>`
});
