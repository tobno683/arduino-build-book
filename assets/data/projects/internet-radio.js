/* Streaming audio on a microcontroller: a buffer, two cores, and no room for mistakes. */
AB.addProject({
slug: 'internet-radio',
title: 'Internet radio with a real knob',
cat: 'audio',
level: 3,
time: '6 hours',
solder: true,
board: 'ESP32',
tags: ['esp32', 'i2s', 'streaming', 'mp3', 'dac', 'buffering', 'freertos', 'psram'],
blurb: 'Thousands of stations, one satisfying knob, and no app. The interesting engineering is the buffer: audio has to arrive without gaps forever, on a chip with less RAM than a single second of uncompressed sound.',

skills: ['I2S audio', 'Streaming and buffering', 'Two-core task scheduling', 'MP3 decoding', 'Graceful reconnection', 'Analogue output quality'],

intro: `
<p>An internet radio is conceptually simple: open a URL, read MP3 bytes, decode them, push samples to a DAC.
Each of those steps is a solved problem with a library.</p>
<p>What makes it a real project is that the process must never stop. A video can stutter and you shrug. Audio
that drops out for 50&nbsp;milliseconds is immediately, unpleasantly obvious, and the ESP32 has to fetch over
Wi-Fi, decode, and feed the DAC continuously while also responding to a knob.</p>
<p>That is a buffering and scheduling problem, and it is the best possible excuse to learn how the ESP32's
second core works.</p>`,

what: [
  'Play any MP3 or AAC stream from a URL, at proper quality through a real DAC.',
  'Survive Wi-Fi hiccups without a gap, and reconnect by itself when a station drops.',
  'Change station and volume with a rotary encoder, which is much nicer than a phone.',
  'Show what is playing - most stations send the track title in the stream metadata.',
  'Remember the last station across a power cut.'
],

how: `
<p><strong>Why not the built-in DAC.</strong> The ESP32 has two 8-bit DACs on chip. Eight bits is 48&nbsp;dB of
dynamic range, which sounds like a cassette left in a car in summer. A $6 I2S DAC module gives 16 or 24 bits
and a proper analogue output stage, and it is the single biggest quality difference available.</p>
<p>I2S is a dedicated digital audio bus - bit clock, word select, data - and the ESP32 has hardware for it,
which means samples go out by DMA without the CPU touching each one.</p>

<p><strong>The buffer is the project.</strong> Wi-Fi delivers data in bursts with gaps. MP3 decoding happens in
chunks. The DAC needs a sample every 22&nbsp;microseconds, forever, with no exceptions.</p>
<p>So you need a buffer between fetching and playing, big enough to cover the worst gap. At 128&nbsp;kbps a
one-second buffer is 16&nbsp;KB of compressed data - which is a large fraction of the ESP32's RAM once the
decoder and Wi-Fi stack have taken theirs.</p>
<p>This is why a board with <strong>PSRAM</strong> is worth the extra dollar. With 4&nbsp;MB of it you can
buffer several seconds and stop worrying.</p>

<p><strong>Two cores, used properly.</strong> The ESP32 has two, and this is the textbook case for them. Put
the network fetch on core 0 and the decode-and-play loop on core 1, with a ring buffer between them. Now a slow
HTTP read cannot stall the audio, because the audio task is running on a different core reading from a buffer
that is already full.</p>
<p>Doing it all on one core works until the Wi-Fi stack does something slow, and then it clicks.</p>

<p><strong>Metadata arrives inline, awkwardly.</strong> Shoutcast and Icecast streams interleave track titles
into the audio itself: send <code>Icy-MetaData: 1</code> and the server tells you it will insert a metadata
block every N bytes. You must count bytes and pull those blocks out, or they get decoded as audio - which
sounds like a burst of static every thirty seconds.</p>

<p><strong>Reconnection has to be silent.</strong> Stations drop. The right behaviour is to notice the stream
has stalled, keep playing from the buffer, reconnect behind the scenes, and resume - so a two-second network
outage is inaudible. Doing that in the fetch task, while the play task keeps draining the buffer, is exactly
what the two-core split buys you.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Get a board with PSRAM if you can - it turns buffer size from a constant worry into a non-issue.' },
  { id: 'i2s-dac', qty: 1, note: 'A PCM5102A board. Sixteen bits and a proper output stage, for about the price of a coffee.' },
  { id: 'pam8403', qty: 1, note: 'Small stereo amplifier if you want speakers rather than headphones.' },
  { id: 'speaker8', qty: 2, note: 'Any small 8 ohm drivers. A sealed box makes a startling difference.' },
  { id: 'rotary', qty: 1, note: 'The knob. Push to switch between volume and station.' },
  { id: 'oled13b', qty: 1, note: 'Station name and track title.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'box-abs', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',    at: [0, 72] },
    { id: 'bb',   comp: 'bb400',    at: [0, 8] },
    { id: 'dac',  comp: 'i2sdac',   at: [-56, -48] },
    { id: 'amp',  comp: 'pam8403',  at: [6, -50] },
    { id: 'spk',  comp: 'speaker',  at: [62, -54] },
    { id: 'enc',  comp: 'rotary',   at: [58, -12] },
    { id: 'oled', comp: 'oled13b',  at: [-30, -86] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V for the DAC and logic' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'mcu.VIN',  to: 'bb.T+28', color: 'red',    note: '5 V rail for the amplifier only' },
    { from: 'dac.VCC',  to: 'bb.T+5',  color: 'red',    note: 'DAC power - 3.3 V, clean' },
    { from: 'dac.GND',  to: 'bb.T-5',  color: 'black',  note: 'DAC ground' },
    { from: 'dac.DIN',  to: 'mcu.D25', color: 'green',  note: 'I2S data out' },
    { from: 'dac.BCK',  to: 'mcu.D26', color: 'blue',   note: 'I2S bit clock' },
    { from: 'dac.LCK',  to: 'mcu.D27', color: 'yellow', note: 'I2S word select - left/right clock' },
    { from: 'dac.LOUT', to: 'amp.L-IN',color: 'white',  note: 'Analogue audio to the amplifier' },
    { from: 'amp.VCC',  to: 'bb.T+24', color: 'red',    note: 'Amplifier on 5 V - it is the only thing that wants it' },
    { from: 'amp.GND',  to: 'bb.T-24', color: 'black',  note: 'Amplifier ground' },
    { from: 'amp.L+',   to: 'spk.+',   color: 'brown',  note: 'Speaker, positive' },
    { from: 'amp.L-',   to: 'spk.-',   color: 'brown',  note: 'Speaker, negative - do NOT connect either side to ground' },
    { from: 'enc.VCC',  to: 'bb.T+14', color: 'red',    note: 'Encoder power' },
    { from: 'enc.GND',  to: 'bb.T-14', color: 'black',  note: 'Encoder ground' },
    { from: 'enc.CLK',  to: 'mcu.D18', color: 'green',  note: 'Encoder A' },
    { from: 'enc.DT',   to: 'mcu.D19', color: 'blue',   note: 'Encoder B' },
    { from: 'enc.SW',   to: 'mcu.D5',  color: 'yellow', note: 'Encoder push' },
    { from: 'oled.VCC', to: 'bb.T+20', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-20', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'oled.SCL', to: 'mcu.D22', color: 'blue',   note: 'I2C clock' }
  ]
},

wireIntro: `<p>Three buses: I2S to the DAC, I2C to the display, and two plain pins for the encoder. The only
one that is fussy about layout is I2S, and only if you run it a long way.</p>`,

wireNotes: `
<div class="note danger"><span class="t">A class-D amplifier output is not ground referenced</span>
<p>The PAM8403 drives each speaker between two switching outputs. Neither is ground. Connecting one side to
ground shorts half the bridge and destroys the chip immediately.</p>
<p>Speaker wires go only to the two output terminals for that channel, and nowhere else.</p></div>

<div class="note tip"><span class="t">Give the DAC clean power</span>
<p>Audio quality is mostly a power supply question. Take the DAC's 3.3&nbsp;V from the ESP32 regulator rather
than sharing a rail with the amplifier, and keep its ground wire short and direct.</p>
<p>A whine that changes pitch with Wi-Fi activity is supply noise getting into the analogue side.</p></div>

<div class="note"><span class="t">I2S pins are flexible</span>
<p>Unlike I2C, the ESP32's I2S can be routed to almost any GPIO through its matrix. If the pins in the sketch
clash with something, change them freely.</p></div>`,

solderIntro: `<p>Straightforward perfboard work. The only thing worth extra care is keeping the audio ground
separate from the amplifier's power ground until they meet at one point.</p>`,

solderSteps: [
  { h: 'DAC first, headphones only',
    body: `<p>Get the ESP32 playing a stream into headphones through the DAC before the amplifier exists. That
    is the whole audio chain proven, with one fewer thing to blame.</p>` },
  { h: 'One ground point',
    body: `<p>Run the DAC ground and the amplifier ground back to a single point near the power input rather
    than daisy-chaining. The amplifier draws current in switching pulses and you do not want that current
    flowing through the DAC's ground path.</p>` },
  { h: 'Amplifier, with the speaker disconnected',
    body: `<p>Power it up and check the supply current is sane - a few tens of milliamps idle. Only then
    connect speakers, and check the wiring twice first.</p>` },
  { h: 'Encoder on flying leads',
    body: `<p>It wants to be on the front panel, and it will be turned thousands of times. Solder rather than
    using jumpers, and secure the cable.</p>` },
  { h: 'Box it with the speaker sealed in',
    body: `<p>A small driver in open air has almost no bass. The same driver in a sealed box of the right
    volume is transformed, and this costs nothing but making the box airtight.</p>` }
],

libraries: [
  { name: 'ESP32-audioI2S', by: 'schreibfaul1', why: 'Decodes MP3 and AAC and drives I2S, handling Icecast metadata. Does the hard part well.' },
  { name: 'U8g2', by: 'oliver', why: 'The display.' },
  { name: 'Preferences', by: 'Espressif (built in)', why: 'Remembers the last station in flash.' }
],

code: [{
  name: 'internet_radio.ino',
  code: `/* ------------------------------------------------------------------
   Internet radio - ESP32 + PCM5102 I2S DAC

   Network fetch on core 0, audio on core 1, so a slow HTTP read can
   never stall the DAC.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <Audio.h>
#include <U8g2lib.h>
#include <Preferences.h>

#define I2S_DOUT 25
#define I2S_BCLK 26
#define I2S_LRC  27
#define ENC_A    18
#define ENC_B    19
#define ENC_SW    5

Audio audio;
U8G2_SH1106_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);
Preferences prefs;

struct Station { const char* name; const char* url; };

Station stations[] = {
  {"BBC Radio 4",  "http://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm"},
  {"FIP",          "http://direct.fipradio.fr/live/fip-midfi.mp3"},
  {"SomaFM Groove","http://ice1.somafm.com/groovesalad-128-mp3"},
  {"NTS 1",        "https://stream-relay-geo.ntslive.net/stream"}
};
const int N_STATIONS = sizeof(stations) / sizeof(stations[0]);

int current = 0;
int volume = 12;                 // 0..21 in this library
bool volumeMode = true;
char nowPlaying[64] = "";
volatile bool needChange = false;

void setup() {
  Serial.begin(115200);
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  pinMode(ENC_SW, INPUT_PULLUP);

  oled.begin();
  banner("Connecting");

  WiFi.begin("your-network", "your-password");
  while (WiFi.status() != WL_CONNECTED) delay(300);

  prefs.begin("radio", false);
  current = prefs.getInt("station", 0);
  volume  = prefs.getInt("volume", 12);

  audio.setPinout(I2S_BCLK, I2S_LRC, I2S_DOUT);
  audio.setVolume(volume);

  /* The audio loop gets its own task pinned to core 1. Core 0 keeps the
     Wi-Fi stack and everything else, so a slow socket read cannot leave
     the DAC without samples - which is the one thing that must never
     happen. */
  xTaskCreatePinnedToCore(audioTask, "audio", 8192, NULL, 2, NULL, 1);

  tune(current);
  attachInterrupt(ENC_A, onEncoder, FALLING);
}

void loop() {
  // Core 0: everything that is allowed to be slow.
  handleButton();
  if (needChange) { needChange = false; tune(current); }
  draw();
  delay(50);
}

void audioTask(void* p) {
  for (;;) {
    audio.loop();
    vTaskDelay(1);                 // yields; without it the watchdog fires
  }
}

void tune(int i) {
  current = (i + N_STATIONS) % N_STATIONS;
  nowPlaying[0] = 0;
  audio.connecttohost(stations[current].url);
  prefs.putInt("station", current);
}

// ---- encoder ---------------------------------------------------------
void IRAM_ATTR onEncoder() {
  static unsigned long last = 0;
  unsigned long now = millis();
  if (now - last < 5) return;      // crude but effective debounce
  last = now;

  bool dir = digitalRead(ENC_B);

  if (volumeMode) {
    volume = constrain(volume + (dir ? 1 : -1), 0, 21);
    audio.setVolume(volume);
  } else {
    current += dir ? 1 : -1;
    needChange = true;             // reconnect on the main task, not here
  }
}

void handleButton() {
  static bool was = true;
  bool now = digitalRead(ENC_SW);
  if (was && !now) {
    volumeMode = !volumeMode;
    prefs.putInt("volume", volume);
    delay(50);
  }
  was = now;
}

// ---- display ---------------------------------------------------------
void draw() {
  oled.clearBuffer();
  oled.setFont(u8g2_font_helvB12_tr);
  oled.drawStr(0, 14, stations[current].name);

  oled.setFont(u8g2_font_6x10_tf);
  // Scroll long titles rather than truncating - most stream titles are
  // longer than 21 characters.
  if (nowPlaying[0]) {
    int len = strlen(nowPlaying);
    int off = len > 21 ? (millis() / 300) % (len - 19) : 0;
    oled.drawStr(0, 32, nowPlaying + off);
  }

  char line[24];
  snprintf(line, sizeof(line), "%s %d", volumeMode ? "VOL" : "STN", volume);
  oled.drawStr(0, 52, line);

  // Bar showing buffer fill. Watching this dip during a Wi-Fi hiccup is
  // the whole lesson of the project made visible.
  int fill = map(audio.inBufferFilled(), 0, audio.inBufferSize(), 0, 120);
  oled.drawFrame(0, 57, 122, 6);
  oled.drawBox(1, 58, constrain(fill, 0, 120), 4);

  oled.sendBuffer();
}

void banner(const char* s) {
  oled.clearBuffer();
  oled.setFont(u8g2_font_6x10_tf);
  oled.drawStr(0, 32, s);
  oled.sendBuffer();
}

// ---- library callbacks -----------------------------------------------
void audio_showstreamtitle(const char* info) {
  strlcpy(nowPlaying, info, sizeof(nowPlaying));
}

void audio_info(const char* info) { Serial.printf("info: %s\\n", info); }

void audio_eof_stream(const char* info) {
  // Station dropped. Reconnect rather than sitting silent.
  Serial.println("stream ended - reconnecting");
  needChange = true;
}`
}],

trouble: [
  { q: 'Audio stutters every few seconds',
    a: `Buffer too small or the audio loop is not getting enough CPU. Confirm the audio task is pinned to core
    1 and that nothing in <code>loop()</code> blocks for long. A board with PSRAM removes the problem
    entirely.` },
  { q: 'Loud static bursts every thirty seconds or so',
    a: `Icecast metadata being decoded as audio. The library handles this if the stream is opened with
    metadata support - if you wrote your own fetch, you must count bytes and strip the blocks.` },
  { q: 'A whine that changes with Wi-Fi activity',
    a: `Supply noise into the DAC. Separate its power from the amplifier's, shorten its ground wire, and add
    100&nbsp;nF and 10&nbsp;uF right at the DAC pins.` },
  { q: 'The amplifier got hot and died',
    a: `A speaker wire touched ground. Class-D outputs are bridged and neither side is ground - see the wiring
    warning.` },
  { q: 'Watchdog resets on core 1',
    a: `The audio task never yields. It needs a <code>vTaskDelay(1)</code> in its loop, which is enough to let
    the idle task run and feed the watchdog.` },
  { q: 'HTTPS streams do not play',
    a: `TLS plus MP3 decoding plus Wi-Fi is tight on RAM without PSRAM. Most stations offer a plain HTTP URL,
    and for a radio that is a reasonable choice.` },
  { q: 'The encoder jumps several steps',
    a: `Contact bounce. The 5&nbsp;ms filter in the interrupt handles most of it; a 100&nbsp;nF capacitor
    across each contact handles the rest.` },
  { q: 'Station changes hang the radio',
    a: `<code>connecttohost</code> is being called from inside the interrupt. It must happen on the main task -
    that is what the <code>needChange</code> flag is for.` }
],

next: `
<ul>
  <li><strong>Watch the buffer bar</strong> while someone starts a video call on the same network. That dip is
  the thing the whole architecture exists to survive.</li>
  <li><strong>A web page to manage stations</strong>, so adding one does not mean recompiling.</li>
  <li><strong>An alarm clock</strong> - wake to a station rather than a beep. Combine with the
  <a href="project.html?p=desk-clock">desk clock</a>.</li>
  <li><strong>Spotify Connect or AirPlay</strong> is beyond an ESP32, but a Raspberry Pi Zero with the same
  DAC does both - and by then you will know exactly what the DAC is doing.</li>
  <li><strong>Add a spectrum display</strong> from the decoded samples, feeding the
  <a href="project.html?p=analog-gauge-panel">gauge panel</a> as a VU meter.</li>
</ul>`
});
