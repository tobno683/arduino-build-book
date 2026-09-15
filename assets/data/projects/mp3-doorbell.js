/* DFPlayer Mini doorbell with random tracks and a quiet-hours mode. */
AB.addProject({
slug: 'mp3-doorbell',
title: 'MP3 doorbell that plays anything',
cat: 'audio',
level: 2,
time: '2 hours',
solder: true,
board: 'Nano',
tags: ['dfplayer', 'mp3', 'sd card', 'doorbell', 'amplifier', 'speaker'],
blurb: 'A doorbell that plays a random track from an SD card, goes quiet at night, and does not repeat itself for a fortnight.',

skills: ['Serial modules', 'SD file naming', 'Audio amplification', 'Debouncing', 'Quiet hours logic'],

intro: `
<p>The DFPlayer Mini is a complete MP3 player the size of a postage stamp: a decoder, an SD card slot and a
small amplifier, controlled over a plain serial link, for about two dollars. It is the answer to every "I want
this to make a real sound" problem in this hobby.</p>
<p>As a doorbell it has one feature that no commercial one has: a folder of tracks and a rule that it never
plays the same one twice in a row. Thirty seconds of setup, and the doorbell becomes a small recurring joke
that never quite wears out.</p>`,

what: [
  'Play a random track from the SD card when the button is pressed.',
  'Never repeat the previous track, and cycle through all of them before repeating any.',
  'Ignore presses while it is already playing, so a child cannot machine-gun it.',
  'Drop to a low volume or stay silent entirely during set quiet hours.',
  'Drive a real speaker loudly enough to hear from another room.'
],

how: `
<p>The <strong>DFPlayer Mini</strong> holds an SD card of MP3 or WAV files and answers commands on a 9600 baud
serial link: play track <em>n</em>, set volume, stop, next. It has a small 3&nbsp;W amplifier built in that
drives one speaker directly from its SPK1 and SPK2 pins, and a line-level output (DAC_L/DAC_R) for feeding a
bigger amplifier.</p>
<p>The <strong>file naming is strict and is where everyone gets stuck.</strong> The module indexes files by the
order they were <em>written to the card</em>, not by name. So a card where you dragged files across in a random
order plays them in that random order, and track 1 is whichever you happened to copy first. The fix is to use a
<code>/mp3/</code> folder with names like <code>0001.mp3</code>, and to copy them one at a time in order.</p>
<p><strong>The 1&nbsp;k&Omega; resistor</strong> in the RX line is in the official documentation and is
routinely skipped. The DFPlayer's RX pin is 3.3&nbsp;V logic; a 5&nbsp;V Nano driving it directly produces
audible noise in the output and can eventually damage it. One resistor.</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'dfplayer', qty: 1, note: 'DFPlayer Mini. There are several clones with slightly different chips - most work; a few ignore the folder commands.' },
  { id: 'sdcard-8gb', qty: 1, note: 'Small is fine. Must be FAT32. 32 GB is the practical maximum.' },
  { id: 'speaker8', qty: 1, note: '8 ohm, 0.5 to 3 W. Bigger cone means more volume for the same power.' },
  { id: 'button', qty: 1, note: 'Or reuse the existing doorbell push, which is just a switch.' },
  { id: 'res1k', qty: 1, note: 'In the RX line. Do not skip it.' },
  { id: 'ds3231', qty: 1, note: 'Only if you want quiet hours. Skip it and the sketch uses a simple timer instead.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'cap1000', qty: 1, note: 'Across the DFPlayer supply. It draws a big gulp when a track starts.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2 },
  { id: 'box-abs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',     at: [0, 0] },
    { id: 'df',   comp: 'dfplayer', at: [-52, -34], ry: 90 },
    { id: 'spk',  comp: 'speaker',  at: [-56, -104], opt: { r: 22 } },
    { id: 'rtc',  comp: 'ds3231',   at: [36, -44], ry: 180 },
    { id: 'btn',  comp: 'button',   at: [40, 40] }
  ],
  wires: [
    { from: 'df.VCC',  to: 'nano.5V',   color: 'red',    note: 'DFPlayer power. 5 V, even though its logic is 3.3 V' },
    { from: 'df.GND',  to: 'nano.GND',  color: 'black',  note: 'Ground' },
    { from: 'df.RX',   to: 'nano.D10',  color: 'blue',   note: 'Nano TX to player RX, THROUGH A 1 K RESISTOR' },
    { from: 'df.TX',   to: 'nano.D11',  color: 'green',  note: 'Player TX to Nano RX. No resistor needed this way' },
    { from: 'df.SPK1', to: 'spk.+',     color: 'brown',  note: 'Speaker. These pins are a bridged amplifier output' },
    { from: 'df.SPK2', to: 'spk.-',     color: 'brown',  note: 'Speaker. Neither side is ground - do not connect either to GND' },
    { from: 'rtc.VCC', to: 'nano.5V',   color: 'red',    note: 'Clock power, for quiet hours' },
    { from: 'rtc.GND', to: 'nano.GND2', color: 'black',  note: 'Clock ground' },
    { from: 'rtc.SDA', to: 'nano.A4',   color: 'yellow', note: 'I2C data' },
    { from: 'rtc.SCL', to: 'nano.A5',   color: 'orange', note: 'I2C clock' },
    { from: 'btn.1A',  to: 'nano.D2',   color: 'purple', note: 'Doorbell push, internal pull-up' },
    { from: 'btn.2A',  to: 'nano.GND2', color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">SPK1 and SPK2 are both driven - neither is ground</span>
<p>The DFPlayer's amplifier is a <em>bridge-tied load</em> design: it drives both speaker terminals, in
opposite directions. Connecting SPK2 to ground short-circuits half the amplifier and will destroy it.</p>
<p>The speaker goes across SPK1 and SPK2 and touches nothing else.</p></div>

<div class="note warn"><span class="t">The 1 k resistor in the RX line</span>
<p>Between the Nano's TX pin and the player's RX pin. DFRobot's own documentation specifies it. Without it you
get a distinct hiss or buzz in the audio whenever the serial line is active, and over time you are driving a
3.3&nbsp;V input from a 5&nbsp;V pin.</p></div>

<div class="note tip"><span class="t">SoftwareSerial, not pins 0 and 1</span>
<p>The Nano's hardware serial is wired to the USB port. Use it for the DFPlayer and you cannot upload sketches
or use the Serial Monitor without unplugging the module every time. D10 and D11 with SoftwareSerial at 9600
baud is entirely reliable.</p></div>`,

solderSteps: [
  { h: 'Sockets for the Nano and the DFPlayer',
    body: `<p>Two 15-pin strips and two 8-pin strips. The DFPlayer's pins are 2.54&nbsp;mm and its two rows are
    0.6 inch apart, the same as a DIP chip - so a 16-pin DIP socket also works nicely if you have one.</p>
    <p>Tack the corners of each strip, check square from the side, then complete.</p>` },
  { h: 'The 1 k resistor, in line',
    body: `<p>Rather than a patch wire from D10 to the DFPlayer's RX socket, put the resistor there: one leg
    into the hole connected to D10, the other leg bent across to the RX socket pin, and solder both. Trim.</p>
    <p>Doing it this way means you cannot forget it later.</p>` },
  { h: 'Screw terminals for the speaker and the button',
    body: `<p>Two 2-pin blocks. The speaker especially - you will want to try different speakers, and unscrewing
    is easier than desoldering.</p>
    <p>Fill the speaker terminal pads properly; this carries the most current on the board.</p>` },
  { h: 'Reservoir capacitor across the DFPlayer supply',
    body: `<p>1000&nbsp;&micro;F, stripe (negative) to ground, physically close to the module's VCC and GND
    pins. A track starting is a genuine current step and this is what stops the Nano browning out on the first
    note.</p>` },
  { h: 'Speaker leads',
    body: `<p>Speaker terminals are usually solder tabs. Tin both the tab and the wire, then one second to join.
    Heat-shrink over each - a speaker gets moved around and bare tabs short against the enclosure.</p>` },
  { h: 'Check before power',
    body: `<p>5&nbsp;V to GND: no beep. SPK1 to GND: no beep. SPK2 to GND: <strong>no beep</strong> - if either
    speaker line is connected to ground, find it now.</p>` }
],

assembly: [
  { h: 'Prepare the SD card properly - this is the step that matters',
    body: `<p>Format FAT32. Make a folder called <code>mp3</code> in the root. Name your files
    <code>0001.mp3</code>, <code>0002.mp3</code> and so on - four digits, leading zeros.</p>
    <p>Then copy them across <strong>one at a time, in order</strong>. On Windows, copying a whole selection at
    once writes them in an arbitrary order and the player's index will not match the names.</p>
    <p>If in doubt, copy them one by one and test.</p>` },
  { h: 'Get the tracks right',
    body: `<p>MP3 at 128&nbsp;kbps or lower, mono, is plenty for a doorbell speaker and loads faster. Trim
    silence from the start of each file - a half-second gap feels like a fault when you press a doorbell.</p>
    <p>Keep them under about 15 seconds. A doorbell that plays a whole song is funny once.</p>` },
  { h: 'Test with the serial monitor open',
    body: `<p>At boot the sketch asks the module how many files it can see and prints the number. If that says
    0, or the module never answers, stop and fix the card before anything else.</p>` },
  { h: 'Set the clock for quiet hours',
    body: `<p>Run the clock setter from the <a href="project.html?p=desk-clock">desk clock project</a> once,
    then flash this sketch. If you skip the DS3231 entirely, set <code>USE_RTC</code> to false.</p>` },
  { h: 'Wire it into an existing doorbell push',
    body: `<p>A wired doorbell push is just a switch, usually on a low-voltage bell transformer. Disconnect it
    from the transformer entirely and run your two wires to it instead. Do <strong>not</strong> connect the
    Arduino to the bell transformer - even at 8 or 12&nbsp;V AC it is not what a Nano input wants.</p>` }
],

libraries: [
  { name: 'DFRobotDFPlayerMini', by: 'DFRobot', why: 'Wraps the serial protocol. Search "DFPlayer" in the Library Manager.' },
  { name: 'SoftwareSerial', by: 'Arduino', how: 'Built in', why: 'A second serial port on ordinary pins.' },
  { name: 'RTClib', by: 'Adafruit', why: 'The DS3231, for quiet hours. Optional.' }
],

code: [{
  name: 'mp3_doorbell.ino',
  code: `/* ------------------------------------------------------------------
   MP3 doorbell
   DFPlayer Mini on D10/D11 (SoftwareSerial), button on D2,
   optional DS3231 on I2C for quiet hours.
   ------------------------------------------------------------------ */

#include <SoftwareSerial.h>
#include <DFRobotDFPlayerMini.h>
#include <Wire.h>
#include <RTClib.h>

// ---- pins ------------------------------------------------------------
#define DF_RX_PIN 11    // Nano receives here  <- player TX
#define DF_TX_PIN 10    // Nano transmits here -> player RX (via 1k)
#define BUTTON    2

// ---- behaviour -------------------------------------------------------
#define USE_RTC        true
const byte VOLUME_DAY   = 24;    // 0-30
const byte VOLUME_NIGHT = 8;     // 0 = silent
const byte QUIET_FROM   = 22;    // 22:00
const byte QUIET_UNTIL  = 7;     // 07:00
const unsigned long LOCKOUT_MS = 6000;   // ignore presses for this long after one
// ----------------------------------------------------------------------

SoftwareSerial dfSerial(DF_RX_PIN, DF_TX_PIN);
DFRobotDFPlayerMini player;
RTC_DS3231 rtc;

int  trackCount = 0;
int  lastTrack = -1;
byte playedFlags[16];             // bitmap: up to 128 tracks
int  playedThisCycle = 0;
unsigned long lastPress = 0;
bool haveRtc = false;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON, INPUT_PULLUP);

  dfSerial.begin(9600);
  Serial.println(F("starting the player (takes a second)..."));

  if (!player.begin(dfSerial)) {
    Serial.println(F("No DFPlayer. Check: card inserted? FAT32? TX/RX crossed? 1k resistor?"));
    while (1) { delay(500); }
  }

  player.setTimeOut(600);
  player.volume(VOLUME_DAY);
  player.EQ(DFPLAYER_EQ_NORMAL);

  delay(300);
  trackCount = player.readFileCounts();
  Serial.print(F("tracks on the card: "));
  Serial.println(trackCount);
  if (trackCount <= 0) {
    Serial.println(F("Nothing found. Check the /mp3 folder and the 0001.mp3 naming."));
  }

  if (USE_RTC) {
    haveRtc = rtc.begin();
    if (!haveRtc) Serial.println(F("no RTC - quiet hours disabled"));
  }

  randomSeed(analogRead(A0) * 17 + analogRead(A1));
  clearCycle();
}

void loop() {
  if (digitalRead(BUTTON) == LOW && millis() - lastPress > LOCKOUT_MS) {
    delay(30);                                  // debounce
    if (digitalRead(BUTTON) != LOW) return;
    lastPress = millis();
    ring();
  }

  // drain the player's status messages so its buffer does not fill
  if (player.available()) player.readType();
}

/* ---------------------------------------------------------------------- */
void ring() {
  byte vol = currentVolume();
  Serial.print(F("ding - volume "));
  Serial.println(vol);

  if (vol == 0) {
    Serial.println(F("quiet hours: staying silent"));
    return;
  }

  player.volume(vol);
  int t = pickTrack();
  Serial.print(F("track "));
  Serial.println(t);
  player.play(t);
}

byte currentVolume() {
  if (!haveRtc) return VOLUME_DAY;
  byte h = rtc.now().hour();
  bool quiet = (QUIET_FROM > QUIET_UNTIL)
    ? (h >= QUIET_FROM || h < QUIET_UNTIL)     // spans midnight
    : (h >= QUIET_FROM && h < QUIET_UNTIL);
  return quiet ? VOLUME_NIGHT : VOLUME_DAY;
}

/* --- pick a track we have not played this cycle ------------------------ */
int pickTrack() {
  if (trackCount <= 1) return 1;

  if (playedThisCycle >= trackCount) clearCycle();

  for (int attempt = 0; attempt < 60; attempt++) {
    int t = random(1, trackCount + 1);
    if (t == lastTrack) continue;               // never twice in a row
    if (wasPlayed(t)) continue;
    markPlayed(t);
    lastTrack = t;
    playedThisCycle++;
    return t;
  }

  // fall back to the first unplayed track
  for (int t = 1; t <= trackCount; t++) {
    if (!wasPlayed(t)) { markPlayed(t); lastTrack = t; playedThisCycle++; return t; }
  }
  clearCycle();
  return 1;
}

bool wasPlayed(int t) { return playedFlags[(t - 1) / 8] & (1 << ((t - 1) % 8)); }
void markPlayed(int t) { playedFlags[(t - 1) / 8] |= (1 << ((t - 1) % 8)); }
void clearCycle() {
  for (byte i = 0; i < sizeof(playedFlags); i++) playedFlags[i] = 0;
  playedThisCycle = 0;
  Serial.println(F("all tracks played - reshuffling"));
}`,
  after: `<p>The played-tracks bitmap is sixteen bytes and tracks up to 128 files. It gives you a proper shuffle
  rather than a random pick: every track plays once before any repeats, which is what people actually mean by
  "random" and what a naive <code>random()</code> conspicuously fails to deliver.</p>`
}],

upload: `
<p>Nano, correct port. Watch the Serial Monitor at 9600 during boot - it prints the track count, which is the
single most useful diagnostic here.</p>
<div class="note warn"><span class="t">The player takes a second to wake</span>
<p><code>player.begin()</code> can take up to a second while the module mounts the card. If it reports failure
immediately, the module is not talking at all - that is a wiring fault, not a card fault.</p></div>`,

tune: [
  { h: 'Volume and the amplifier',
    body: `<p>The DFPlayer's own amplifier does about 3&nbsp;W into 8&nbsp;ohms, which is loud enough for a
    hallway and not for a garden. Volume above about 26 starts to distort on a small speaker.</p>
    <p>For more, take the DAC_L and DAC_R pins to a PAM8403 board and drive bigger speakers. Note those are
    line-level and unamplified - do not connect a speaker to them directly.</p>` },
  { h: 'Equaliser',
    body: `<p><code>player.EQ(DFPLAYER_EQ_BASS)</code> and friends. On a small cone speaker
    <code>DFPLAYER_EQ_POP</code> is usually clearest - a doorbell needs intelligibility, not bass.</p>` },
  { h: 'Getting the track order right',
    body: `<p>If track 3 plays when you ask for 1, the card's file order does not match the names. Reformat,
    then copy files one at a time in numerical order. Some people use a small utility to rewrite the FAT in
    order; copying one at a time is simpler and always works.</p>` },
  { h: 'Lockout time',
    body: `<p><code>LOCKOUT_MS</code> should be a bit longer than your longest track. Too short and a second
    press cuts the first off; too long and a genuine second visitor gets ignored.</p>` },
  { h: 'Quiet hours that span midnight',
    body: `<p>The <code>QUIET_FROM &gt; QUIET_UNTIL</code> branch handles 22:00 to 07:00 correctly. Set
    <code>VOLUME_NIGHT</code> to 0 for complete silence, or 6-8 for something that a person awake will hear and
    a sleeping one will not.</p>` }
],

trouble: [
  { q: '<code>No DFPlayer</code> at boot',
    a: `In order: TX and RX not crossed (Nano D10 goes to player RX), no SD card, card not FAT32, 1&nbsp;k
    resistor missing so the line is being pulled wrongly, or the module has no 5&nbsp;V. Measure the voltage at
    the module's own VCC pin.` },
  { q: 'Reports 0 tracks',
    a: `The files are not where the module expects. Use a folder called <code>mp3</code> in the root with
    <code>0001.mp3</code> naming. Some clones want the files in the root instead - try both.` },
  { q: 'Plays the wrong track',
    a: `File order on the card, not the code. Reformat and copy one at a time.` },
  { q: 'Loud hiss or buzz during playback',
    a: `The missing 1&nbsp;k resistor in the RX line, or a shared ground carrying the speaker current past the
    module. Run a separate ground wire from the DFPlayer straight to the supply negative.` },
  { q: 'Crackles and cuts out at high volume',
    a: `Supply sagging. Add the 1000&nbsp;&micro;F capacitor, use thicker supply wires, and make sure you are
    on a real 2&nbsp;A supply rather than a laptop USB port.` },
  { q: 'Works on USB, dies on the wall supply',
    a: `Ground loop or an undersized supply. Also check you have not connected SPK2 to ground.` },
  { q: 'Amplifier gets hot',
    a: `Speaker impedance too low - it wants 8&nbsp;ohms, and a 4&nbsp;ohm speaker doubles the current. Or
    SPK2 is grounded.` },
  { q: 'Nothing happens when the button is pressed',
    a: `Check the button reads LOW when pressed with a multimeter. Then check <code>LOCKOUT_MS</code> has
    expired - the first press after boot works immediately, so if <em>that</em> one fails it is wiring.` }
],

next: `
<ul>
  <li><strong>Different sounds for different days.</strong> The RTC is already there - a track folder per
  weekday is four lines.</li>
  <li><strong>Announce who is at the door</strong> by pairing it with the
  <a href="project.html?p=rfid-door-lock">RFID reader</a>: a family member's fob plays their own theme tune.</li>
  <li><strong>Send a notification</strong> too: swap the Nano for an ESP8266 and publish to MQTT when the bell
  rings, so your phone buzzes when you are in the garden.</li>
  <li><strong>Use it as a talking clock, an alarm, or a Halloween prop.</strong> The DFPlayer is the part, not
  the doorbell.</li>
</ul>`
});
