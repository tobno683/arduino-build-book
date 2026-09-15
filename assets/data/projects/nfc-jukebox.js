/* Tap a card, play an album. RC522 + DFPlayer + amplifier. */
AB.addProject({
slug: 'nfc-jukebox',
title: 'Tap-a-card jukebox',
cat: 'rfid',
level: 3,
time: '4 hours',
solder: true,
board: 'Nano',
tags: ['rc522', 'dfplayer', 'nfc', 'music', 'kids', 'toniebox', 'amplifier'],
blurb: 'Put a card on the box and the album plays. Take it off and it stops. No screen, no app, no account - and a four-year-old can work it.',

skills: ['RFID UIDs', 'Serial modules', 'Card presence detection', 'Audio amplification', 'Folder-based playback'],

intro: `
<p>The commercial version of this costs around a hundred euros and ties you to one company's catalogue. The
home-made version costs about twenty-five and plays whatever is on the SD card.</p>
<p>The design decision that makes it work is <strong>presence, not events</strong>. A card lying on the reader
means "keep playing this"; removing it means "stop". That is completely different from tapping a card to start
something, and it is why small children understand it instantly - the card is the album, and where the card is
tells you what is playing.</p>`,

what: [
  'Play a folder of tracks when a card is placed on the reader, and keep playing while it stays.',
  'Pause when the card is lifted, and resume from where it stopped when the same card comes back.',
  'Start a different card\'s folder immediately if you swap cards.',
  'Have a physical volume knob, because a jukebox with no volume knob is not a jukebox.',
  'Work entirely offline, forever.'
],

how: `
<p>The <strong>RC522</strong> reports the UID of whatever card is in its field. The library's usual pattern is
<code>PICC_IsNewCardPresent()</code>, which fires once per card - fine for a door lock, wrong here. For
presence you have to poll repeatedly and deal with the fact that a stationary card does <em>not</em> reliably
answer every poll: it answers, gets halted, and has to be woken again.</p>
<p>The fix is a small state machine with hysteresis. Poll every 150&nbsp;ms; if the card answers, reset a
counter; if it fails to answer several times in a row, only then call it gone. Three consecutive misses is the
sweet spot - fewer and the music stutters when the card shifts slightly, more and lifting the card feels
laggy.</p>
<p>The <strong>DFPlayer</strong> organises audio in numbered folders: <code>/01/001.mp3</code>,
<code>/01/002.mp3</code> and so on. One folder per card, and <code>playFolder(n, 1)</code> starts it. That maps
a card onto an album with no lookup table beyond "this UID is folder 3".</p>`,

bom: [
  { id: 'nano', qty: 1 },
  { id: 'rc522', qty: 1, note: '3.3 V only. It also comes with a card and a fob to get you started.' },
  { id: 'rfid-tags', qty: 10, note: 'One per album. Print or draw the cover on a sticker and put it on the card - that is the whole interface.' },
  { id: 'dfplayer', qty: 1 },
  { id: 'sdcard-8gb', qty: 1 },
  { id: 'pam8403', qty: 1, note: 'Optional but transformative - the DFPlayer alone is quiet for a room.' },
  { id: 'speaker8', qty: 2, note: 'Two for stereo, or one and ignore the second channel.' },
  { id: 'pot10k', qty: 1, note: 'Volume. Read as an analog input, not wired into the audio path.' },
  { id: 'res1k', qty: 1, note: 'In the DFPlayer RX line.' },
  { id: 'led5', qty: 1, note: 'Glows while something is playing.' },
  { id: 'res220', qty: 1 },
  { id: 'psu5v3a', qty: 1 },
  { id: 'cap1000', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'box-abs', qty: 1, note: 'Or a wooden box. This is a thing that sits in a living room - it is worth making it nice.' },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'strippers' }, { id: 'cutters' }, { id: 'dmm' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',     at: [0, 0] },
    { id: 'rfid', comp: 'rc522',    at: [-56, -46], ry: 180 },
    { id: 'df',   comp: 'dfplayer', at: [50, -32], ry: 90 },
    { id: 'amp',  comp: 'pam8403',  at: [50, -84], ry: 180 },
    { id: 'spk',  comp: 'speaker',  at: [-10, -102], opt: { r: 20 } },
    { id: 'pot',  comp: 'pot10k',   at: [40, 40] },
    { id: 'led',  comp: 'led5',     at: [-36, 42], opt: { c: '#e0a030' } }
  ],
  wires: [
    { from: 'rfid.3V3',  to: 'nano.3V3',  color: 'red',    note: '3.3 V ONLY' },
    { from: 'rfid.GND',  to: 'nano.GND',  color: 'black',  note: 'Ground' },
    { from: 'rfid.RST',  to: 'nano.D9',   color: 'white',  note: 'Reader reset' },
    { from: 'rfid.SDA',  to: 'nano.D8',   color: 'orange', note: 'Reader chip select' },
    { from: 'rfid.MOSI', to: 'nano.D11',  color: 'blue',   note: 'SPI out' },
    { from: 'rfid.MISO', to: 'nano.D12',  color: 'green',  note: 'SPI in' },
    { from: 'rfid.SCK',  to: 'nano.D13',  color: 'yellow', note: 'SPI clock' },
    { from: 'df.VCC',    to: 'nano.5V',   color: 'red',    note: 'Player power' },
    { from: 'df.GND',    to: 'nano.GND2', color: 'black',  note: 'Player ground' },
    { from: 'df.RX',     to: 'nano.D5',   color: 'purple', note: 'Nano TX to player RX, through a 1 k resistor' },
    { from: 'df.TX',     to: 'nano.D6',   color: 'grey',   note: 'Player TX to Nano RX' },
    { from: 'df.DACL',   to: 'amp.L-IN',  color: 'brown',  note: 'Line level out to the amplifier' },
    { from: 'df.GND',    to: 'amp.GND',   color: 'black',  note: 'Shared audio ground' },
    { from: 'amp.VCC',   to: 'nano.5V',   color: 'red',    note: 'Amplifier power' },
    { from: 'amp.L+',    to: 'spk.+',     color: 'brown',  note: 'Speaker' },
    { from: 'amp.L-',    to: 'spk.-',     color: 'brown',  note: 'Speaker. Bridged output - neither side is ground' },
    { from: 'pot.1',     to: 'nano.GND2', color: 'black',  note: 'Volume pot, outer leg to ground' },
    { from: 'pot.W',     to: 'nano.A0',   color: 'yellow', note: 'Volume pot wiper - read as an analog value' },
    { from: 'pot.3',     to: 'nano.5V',   color: 'red',    note: 'Volume pot, other outer leg to 5 V' },
    { from: 'led.A',     to: 'nano.D4',   color: 'orange', note: 'Playing indicator via 220 ohm' },
    { from: 'led.K',     to: 'nano.GND2', color: 'black',  note: 'LED cathode' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">RC522 on 3.3 V</span>
<p>No regulator on the module, no protection. Five volts kills it - usually not instantly, which makes the
fault confusing when it turns up a week later.</p></div>

<div class="note warn"><span class="t">The volume pot is an input, not a volume control</span>
<p>It does not sit in the audio path. The Nano reads it with <code>analogRead()</code> and calls the
DFPlayer's own <code>volume()</code> command. That keeps the analog audio away from your wiring entirely,
which is why this build is quiet when a pot wired into the signal path would hiss.</p></div>

<div class="note warn"><span class="t">Use DAC_L / DAC_R into the amplifier, not SPK1 / SPK2</span>
<p>SPK1 and SPK2 are the DFPlayer's own small amplifier output and must go straight to a speaker. DAC_L and
DAC_R are line level and are what feeds an external amplifier. Connecting SPK1 to an amplifier input will
sound awful and may damage both.</p>
<p>Same warning on the PAM8403 output: <strong>L+ and L- are both driven</strong>. Never ground either.</p></div>

<div class="note tip"><span class="t">Where to put the reader</span>
<p>Directly under the top surface of the box, with no more than 3&nbsp;mm of wood or plastic above it, and no
metal anywhere near. Draw a circle on the lid so people know where to put the card.</p></div>`,

solderSteps: [
  { h: 'RC522 headers, carefully',
    body: `<p>Eight pins, pointing down. Breadboard as a jig. Big ground plane, so keep the iron at
    350&nbsp;&deg;C and move fast. Tug-test every pin - poor joints here are the commonest cause of a reader
    that half works.</p>` },
  { h: 'The 1 k in the DFPlayer RX line',
    body: `<p>Solder it inline between the Nano's D5 pad and the player's RX socket pin, rather than using a
    patch wire. DFRobot specify it, and without it you get a distinct buzz in the audio whenever the serial
    line is active.</p>` },
  { h: 'Audio wiring away from digital wiring',
    body: `<p>Run the DAC_L wire and its ground as a twisted pair, and keep them away from the SPI lines. Audio
    picks up digital switching very happily, and the symptom is a faint chirping under the music that tracks
    whatever the processor is doing.</p>` },
  { h: 'Amplifier and speakers',
    body: `<p>PAM8403 input from DAC_L, output to the speaker. Tin the speaker tabs and the wires first, then one
    second each to join, and heat-shrink over both.</p>
    <p>If you are fitting two speakers, do the right channel identically from DAC_R.</p>` },
  { h: 'Volume pot on flying leads',
    body: `<p>Three wires to a panel-mounted pot. Fit a real knob - this is the control people will touch most.</p>` },
  { h: 'Reservoir capacitor and the check',
    body: `<p>1000&nbsp;&micro;F across the 5&nbsp;V rail. Then: 5&nbsp;V to GND no beep, 3.3&nbsp;V to
    5&nbsp;V no beep, and neither speaker terminal continuous with ground.</p>` },
  { h: 'Build the box last',
    body: `<p>Get the whole thing working on the bench, with cards, before you cut any wood. Speaker holes,
    a circle on the lid for the card, a hole for the knob, and a slot or a shelf for the cards to live in when
    they are not playing.</p>` }
],

assembly: [
  { h: 'Organise the SD card by folder',
    body: `<p>Folders named <code>01</code> through <code>99</code>, and inside each, files named
    <code>001.mp3</code>, <code>002.mp3</code> and so on. Three digits, leading zeros, no spaces.</p>
    <p>Copy each folder across one at a time. The DFPlayer indexes by write order, and copying a whole
    selection at once produces an order you did not choose.</p>` },
  { h: 'Read your cards and build the table',
    body: `<p>Upload the UID dumper from the <a href="project.html?p=rfid-door-lock">card lock project</a>, tap
    each card, and copy each UID into the <code>albums[]</code> array next to its folder number.</p>` },
  { h: 'Decorate the cards',
    body: `<p>This is the bit that turns it from an electronics project into a thing people use. Print the album
    art at card size, stick it on, laminate if it is going near a child.</p>` },
  { h: 'Test presence detection specifically',
    body: `<p>Put a card down and leave it for five minutes. The music must not stutter or restart. Then lift it
    and confirm it stops within about half a second. This is the behaviour the whole build is judged on.</p>` },
  { h: 'Set the volume ceiling',
    body: `<p>If children will use it, cap the maximum in code - <code>MAX_VOLUME</code> at 22 rather than 30.
    A jukebox that can be turned up to painful is a jukebox that will be.</p>` }
],

libraries: [
  { name: 'MFRC522', by: 'GithubCommunity', why: 'The reader.' },
  { name: 'DFRobotDFPlayerMini', by: 'DFRobot', why: 'The player.' },
  { name: 'SoftwareSerial', by: 'Arduino', how: 'Built in', why: 'A second serial port, so the USB one stays free.' }
],

code: [{
  name: 'nfc_jukebox.ino',
  code: `/* ------------------------------------------------------------------
   Tap-a-card jukebox
   RC522 on SPI (CS D8, RST D9), DFPlayer on D5/D6, volume pot on A0.

   Card present  -> play that card's folder
   Card removed  -> pause
   Same card back -> resume where it left off
   Different card -> start the new folder
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <MFRC522.h>
#include <SoftwareSerial.h>
#include <DFRobotDFPlayerMini.h>

// ---- pins ------------------------------------------------------------
#define RFID_CS     8
#define RFID_RST    9
#define DF_TX_PIN   5     // Nano transmits -> player RX (via 1k)
#define DF_RX_PIN   6     // Nano receives  <- player TX
#define VOLUME_PIN A0
#define LED_PIN     4

// ---- behaviour -------------------------------------------------------
#define UID_LEN        4
#define POLL_MS      150
#define MISSES_TO_STOP 3      // consecutive failed polls before "gone"
#define MAX_VOLUME    26      // 0-30
// ----------------------------------------------------------------------

MFRC522 reader(RFID_CS, RFID_RST);
SoftwareSerial dfSerial(DF_RX_PIN, DF_TX_PIN);
DFRobotDFPlayerMini player;

// ---- your cards ------------------------------------------------------
struct Album {
  byte uid[UID_LEN];
  byte folder;
  const char* name;
};

const Album albums[] = {
  { { 0xDE, 0xAD, 0xBE, 0xEF }, 1, "Bedtime stories" },
  { { 0x12, 0x34, 0x56, 0x78 }, 2, "Dinosaur songs"  },
  { { 0xAB, 0xCD, 0xEF, 0x01 }, 3, "Christmas"       }
};
const byte ALBUM_COUNT = sizeof(albums) / sizeof(albums[0]);

int  currentAlbum = -1;
bool playing = false;
byte misses = 0;
byte lastVolume = 255;
unsigned long lastPoll = 0;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);

  SPI.begin();
  reader.PCD_Init();
  delay(50);
  Serial.print(F("RC522 version 0x"));
  Serial.println(reader.PCD_ReadRegister(MFRC522::VersionReg), HEX);

  dfSerial.begin(9600);
  Serial.println(F("waking the player..."));
  if (!player.begin(dfSerial)) {
    Serial.println(F("No DFPlayer. Check the card, the 1k resistor and TX/RX."));
    while (1) { blink(200); }
  }
  player.setTimeOut(600);
  player.EQ(DFPLAYER_EQ_NORMAL);
  applyVolume(true);

  Serial.println(F("ready - put a card on the reader"));
}

void loop() {
  applyVolume(false);
  digitalWrite(LED_PIN, playing ? HIGH : LOW);

  if (millis() - lastPoll < POLL_MS) return;
  lastPoll = millis();

  int seen = pollForCard();

  if (seen >= 0) {
    misses = 0;
    if (seen != currentAlbum) startAlbum(seen);
    else if (!playing)        resume();
  } else {
    if (++misses >= MISSES_TO_STOP && playing) pause();
  }

  // drain the player's own status messages
  if (player.available()) player.readType();
}

/* --- presence polling -------------------------------------------------
   A card that is simply lying there does not answer every poll: it has
   to be woken. WUPA (PICC_WakeupA) does that, where the usual
   PICC_IsNewCardPresent only ever fires once per card.
   ---------------------------------------------------------------------- */
int pollForCard() {
  byte atqa[2];
  byte size = sizeof(atqa);

  MFRC522::StatusCode s = reader.PICC_WakeupA(atqa, &size);
  if (s != MFRC522::STATUS_OK && s != MFRC522::STATUS_COLLISION) return -1;

  if (!reader.PICC_ReadCardSerial()) return -1;

  byte uid[UID_LEN];
  for (byte i = 0; i < UID_LEN; i++) uid[i] = reader.uid.uidByte[i];

  reader.PICC_HaltA();
  reader.PCD_StopCrypto1();

  for (byte a = 0; a < ALBUM_COUNT; a++) {
    bool same = true;
    for (byte i = 0; i < UID_LEN; i++) {
      if (albums[a].uid[i] != uid[i]) { same = false; break; }
    }
    if (same) return a;
  }

  // a card we do not know: report it once so it can be added
  static unsigned long lastUnknown = 0;
  if (millis() - lastUnknown > 3000) {
    lastUnknown = millis();
    Serial.print(F("unknown card: { "));
    for (byte i = 0; i < UID_LEN; i++) {
      Serial.print(F("0x"));
      if (uid[i] < 0x10) Serial.print('0');
      Serial.print(uid[i], HEX);
      if (i < UID_LEN - 1) Serial.print(F(", "));
    }
    Serial.println(F(" }"));
  }
  return -1;
}

/* --- playback --------------------------------------------------------- */
void startAlbum(int a) {
  currentAlbum = a;
  playing = true;
  Serial.print(F("playing: "));
  Serial.println(albums[a].name);
  player.playFolder(albums[a].folder, 1);
}

void pause() {
  playing = false;
  Serial.println(F("card lifted - pausing"));
  player.pause();
}

void resume() {
  playing = true;
  Serial.println(F("card back - resuming"));
  player.start();
}

/* --- volume ----------------------------------------------------------- */
void applyVolume(bool force) {
  byte v = map(analogRead(VOLUME_PIN), 0, 1023, 0, MAX_VOLUME);
  if (!force && v == lastVolume) return;
  // a small deadband, or pot noise sends a command every loop
  if (!force && abs((int)v - (int)lastVolume) < 1) return;
  lastVolume = v;
  player.volume(v);
}

void blink(int ms) {
  digitalWrite(LED_PIN, HIGH); delay(ms);
  digitalWrite(LED_PIN, LOW);  delay(ms);
}`,
  after: `<p><code>PICC_WakeupA()</code> is the key call and it is not the one most tutorials use.
  <code>PICC_IsNewCardPresent()</code> sends REQA, which only idle cards answer - and a card that has already
  been read is halted, not idle. WUPA wakes halted cards too, which is exactly what continuous presence
  detection needs.</p>`
}],

upload: `
<p>Nano, correct port. The Serial Monitor at 9600 should show the RC522 version (0x92 is healthy) and then
the player waking. Put a card down and watch for <code>playing:</code>.</p>
<div class="note tip"><span class="t">Add cards without editing code first</span>
<p>Any card the sketch does not know prints its UID to the Serial Monitor, formatted ready to paste into the
<code>albums[]</code> array. Tap all your blanks first, then write the table in one go.</p></div>`,

tune: [
  { h: 'Presence sensitivity',
    body: `<p><code>MISSES_TO_STOP</code> at 3 with a 150&nbsp;ms poll means it gives up after about half a
    second. Raise it if the music stutters when a card shifts slightly; lower it if lifting the card feels
    laggy.</p>` },
  { h: 'Read range through the lid',
    body: `<p>Thin, non-metallic, and close. Above about 3&nbsp;mm of material the range becomes marginal.
    <code>reader.PCD_SetAntennaGain(MFRC522::RxGain_max);</code> in <code>setup()</code> buys about a
    centimetre.</p>` },
  { h: 'Volume ceiling and curve',
    body: `<p><code>MAX_VOLUME</code> caps it. The DFPlayer's volume is roughly linear in steps, not in
    loudness, so the bottom half of the knob does less than you would expect - square the mapping if you want a
    more natural feel.</p>` },
  { h: 'Resume versus restart',
    body: `<p>As written, lifting and replacing the same card resumes. If you would rather it restarted the
    album - which small children often prefer - call <code>playFolder()</code> in <code>resume()</code> instead
    of <code>start()</code>.</p>` },
  { h: 'What happens at the end of an album',
    body: `<p>By default it stops. <code>player.enableLoopAll()</code> loops the folder, which is usually the
    right behaviour for a jukebox where the card is still sitting there.</p>` }
],

trouble: [
  { q: 'Music stutters or restarts while the card sits still',
    a: `The presence polling is not using WUPA, or <code>MISSES_TO_STOP</code> is too low. Check
    <code>pollForCard()</code> calls <code>PICC_WakeupA</code>, not <code>PICC_IsNewCardPresent</code>.` },
  { q: 'Card is detected once and then never again',
    a: `The card was halted and is not being woken. Same fix.` },
  { q: '<code>No DFPlayer</code>',
    a: `TX/RX not crossed, no SD card, card not FAT32, or the 1&nbsp;k resistor missing.` },
  { q: 'Plays the wrong folder',
    a: `Folder numbering. Folders must be named exactly <code>01</code>, <code>02</code> and so on - two
    digits, and <code>1</code> is not the same as <code>01</code> to the DFPlayer.` },
  { q: 'Buzzing or hiss under the music',
    a: `The 1&nbsp;k resistor, or audio wiring running alongside the SPI lines. Route DAC_L and its ground as a
    twisted pair, away from everything digital.` },
  { q: 'RC522 version reads 0x00',
    a: `Reflow the header joints, check 3.3&nbsp;V, and confirm CS is on D8.` },
  { q: 'Volume jumps around on its own',
    a: `Pot noise sending a new command every loop. Widen the deadband in <code>applyVolume()</code>, or add a
    100&nbsp;nF capacitor from the wiper to ground.` },
  { q: 'Amplifier gets hot',
    a: `Speaker impedance too low, or an output shorted to ground. The PAM8403 wants 4-8&nbsp;ohms and neither
    output terminal may touch ground.` }
],

next: `
<ul>
  <li><strong>Next and previous buttons</strong>, so a track can be skipped without lifting the card. Two
  buttons and two library calls.</li>
  <li><strong>A sleep timer</strong>: hold a button to fade out over twenty minutes. Genuinely the most-used
  feature on the commercial equivalents.</li>
  <li><strong>Write the folder onto the card itself</strong> in a MIFARE sector rather than keeping a table in
  code - then new cards need no reprogramming at all.</li>
  <li><strong>Battery power</strong> with an 18650 and a TP4056, and it becomes portable. See the
  <a href="project.html?p=timelapse-camera">timelapse camera</a> for the power chain.</li>
</ul>`
});
