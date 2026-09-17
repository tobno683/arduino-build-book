/* Nixie clock: 170 V on a hobby bench. The safety section is not decoration. */
AB.addProject({
slug: 'nixie-clock',
title: 'Nixie tube clock',
cat: 'display',
level: 4,
time: '10 hours',
solder: true,
board: 'ESP32',
tags: ['nixie', 'high voltage', 'in-12', 'k155id1', 'rtc', 'ntp', 'multiplexing', 'vintage'],
blurb: 'Four Soviet tubes from the 1970s glowing orange in a dark room. It is the most beautiful display you can build, and the only project here that will hurt you if you are careless.',

skills: ['High-voltage safety', 'Driving loads your logic cannot touch', 'BCD decoding', 'Multiplexing', 'Cathode poisoning and how to avoid it', 'NTP time keeping'],

intro: `
<p>A nixie tube is a glass envelope full of neon with ten wire digits stacked inside it. Put about 170&nbsp;V
across the anode and one cathode and that digit glows. There is no modern production - every tube you can buy
was made before about 1985, mostly in the Soviet Union, and when they are gone they are gone.</p>
<p>Nothing else looks like them. They are not LEDs pretending; the glow is a real gas discharge wrapping around
a shaped wire, and photographs consistently fail to do it justice.</p>
<p><strong>This is the only project in this book that runs at a voltage that can kill.</strong> 170&nbsp;V DC
is not mains, and the supply here is current-limited, but it is far past the point where your skin stops
protecting you and it is quite capable of stopping a heart under the wrong conditions. Read the safety section
before you order anything, not after.</p>`,

what: [
  'Show hours and minutes on four IN-12 tubes, in the warm orange nothing else makes.',
  'Keep time over NTP, so it never needs setting and handles daylight saving itself.',
  'Multiplex four tubes from one driver chip, because a driver per tube is expensive and unnecessary.',
  'Run an anti-poisoning cycle every hour, which is what stops the tubes dying young.',
  'Dim or blank overnight - both to be liveable in a bedroom and to double the tubes’ life.'
],

how: `
<p><strong>Why 170 volts.</strong> A neon discharge does not start gradually. Below the striking voltage -
around 170&nbsp;V for an IN-12 - nothing happens at all. Above it, the gas ionises and conducts, and the
voltage across the tube drops to a maintaining level near 140&nbsp;V. Left unchecked it would then draw as
much current as the supply could give and destroy itself, so <strong>every anode needs a series resistor</strong>,
typically 10-22&nbsp;k. That resistor is not optional and is not a detail.</p>

<p><strong>The K155ID1 exists for exactly this.</strong> Ordinary logic cannot switch 170&nbsp;V. The K155ID1 -
a Soviet part, also sold as the 74141 - takes four logic-level BCD inputs and pulls one of ten outputs down to
ground while withstanding the full anode voltage on the other nine. It is the only common chip that does this,
it is also long out of production, and it is the single part to buy spares of.</p>
<p>Feed it a BCD value above 9 and it lights nothing, which is exactly how you blank a tube.</p>

<p><strong>Multiplexing.</strong> Four tubes would need four driver chips. Instead, wire all four tubes'
cathodes together in parallel - all the 3s to one line, all the 7s to another - and switch which tube's
<em>anode</em> is live, one at a time, quickly. Each tube is only lit a quarter of the time, but at 200&nbsp;Hz
your eye sees four steady digits.</p>
<p>The anode switching is the awkward bit, because it happens on the 170&nbsp;V side. High-voltage PNP
transistors (MPSA92 or similar) do it, driven from logic through a level-shifting NPN. Get the timing wrong and
you get <strong>ghosting</strong> - a faint wrong digit on a neighbouring tube - because the previous digit is
still conducting when the next anode comes up. The fix is a short blanking gap between digits.</p>

<p><strong>Cathode poisoning is real and it is the thing that kills tubes.</strong> A cathode that is rarely
lit accumulates sputtered material from its neighbours, and eventually will not glow evenly - you get a patchy
digit with dark blotches. A clock is the worst case: on a 24-hour display the leading digit is a 1 or 2 almost
always, and 7, 8 and 9 in that position may light for minutes a year.</p>
<p>The cure is a <strong>slot machine cycle</strong>: once an hour, run every tube through all ten digits at
speed for a few seconds. It looks good, and it is the difference between tubes that last decades and tubes
that go patchy in a year.</p>

<p><strong>Where the time comes from.</strong> NTP over Wi-Fi, with a DS3231 as backup so a router outage does
not leave the clock blank. The DS3231 is temperature-compensated and drifts about a minute a year, which is
better than most tubes deserve.</p>`,

bom: [
  { id: 'nixie-in12', qty: 4, note: 'Buy five or six. Test every one before soldering anything - a dud looks identical to a good one until it is powered.' },
  { id: 'nixie-hv', qty: 1, note: 'An NCH6100HV or similar 170 V module. Do NOT improvise this from a flyback circuit as a first high-voltage project.' },
  { id: 'k155id1', qty: 1, note: 'Or a 74141, which is the same part. Buy two - it is the only irreplaceable chip here.' },
  { id: 'esp32', qty: 1, note: 'Wi-Fi for NTP. Its 3.3 V logic drives the K155ID1 inputs fine.' },
  { id: 'ds3231', qty: 1, note: 'Backup timekeeping. It keeps running on its own coin cell when everything else is off.' },
  { id: 'transistor', qty: 8, note: 'Four MPSA92 high-voltage PNP for the anodes, four ordinary NPN to drive them from logic. The generic pack covers the NPN side; the MPSA92 must be bought specifically - an ordinary transistor will fail short at 170 V.' },
  { id: 'res10k', qty: 4, note: 'Anode series resistors, one per tube. Not optional - without one the tube destroys itself the moment it strikes.' },
  { id: 'res1k', qty: 8, note: 'Base resistors for the transistor pairs.' },
  { id: 'res220', qty: 4, note: 'Pull-ups on the high side.' },
  { id: 'psu12v2a', qty: 1, note: 'The HV module takes 12 V in. A separate 5 V feed for the logic comes off a small buck converter.' },
  { id: 'buck', qty: 1, note: '12 V down to 5 V for the ESP32 and the driver logic.' },
  { id: 'perfboard', qty: 1, note: 'Get the thicker FR4 kind. Track spacing matters at 170 V - see the safety notes.' },
  { id: 'headers-f', qty: 1, note: 'Sockets for the tubes, so a failed tube can be swapped without desoldering eleven pins.' },
  { id: 'box-abs', qty: 1, note: 'It must have a lid, and the lid must be on whenever it is powered.' },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping', own: true }, { id: 'glasses', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',   at: [-58, 74] },
    { id: 'hv',   comp: 'nixiehv', at: [62, 76] },
    { id: 'bb',   comp: 'bb830',   at: [0, 14] },
    { id: 't1',   comp: 'nixie',   at: [-63, -58] },
    { id: 't2',   comp: 'nixie',   at: [-21, -58] },
    { id: 't3',   comp: 'nixie',   at: [21, -58] },
    { id: 't4',   comp: 'nixie',   at: [63, -58] },
    { id: 'rtc',  comp: 'ds3231',  at: [-70, 22] }
  ],
  wires: [
    { from: 'hv.VIN',  to: 'bb.T+1',  color: 'red',    note: '12 V into the HV module' },
    { from: 'hv.GND',  to: 'bb.T-1',  color: 'black',  note: 'Common ground' },
    { from: 'hv.HV+',  to: 'bb.T+28', color: 'brown',  note: '170 V out - brown, because on this board brown means do not touch' },
    { from: 'hv.HV-',  to: 'bb.T-28', color: 'black',  note: 'HV return, common with logic ground' },
    { from: 't1.AN',   to: 'bb.a28',  color: 'brown',  note: 'Tube 1 anode, through its 10 k series resistor and the anode switch' },
    { from: 't2.AN',   to: 'bb.a24',  color: 'brown',  note: 'Tube 2 anode, same arrangement' },
    { from: 't3.AN',   to: 'bb.a20',  color: 'brown',  note: 'Tube 3 anode' },
    { from: 't4.AN',   to: 'bb.a16',  color: 'brown',  note: 'Tube 4 anode' },
    { from: 't1.K0',   to: 'bb.e2',   color: 'grey',   note: 'Cathode 0 - all four tubes share this line' },
    { from: 't2.K0',   to: 'bb.e2',   color: 'grey',   note: 'Tube 2 cathode 0, same net' },
    { from: 't1.K1',   to: 'bb.e4',   color: 'grey',   note: 'Cathode 1, shared' },
    { from: 't1.K2',   to: 'bb.e6',   color: 'grey',   note: 'Cathode 2, shared' },
    { from: 'mcu.D13', to: 'bb.e10',  color: 'green',  note: 'BCD bit A to the K155ID1' },
    { from: 'mcu.D12', to: 'bb.e12',  color: 'blue',   note: 'BCD bit B' },
    { from: 'mcu.D14', to: 'bb.e14',  color: 'yellow', note: 'BCD bit C' },
    { from: 'mcu.D27', to: 'bb.b10',  color: 'orange', note: 'BCD bit D' },
    { from: 'mcu.D26', to: 'bb.b14',  color: 'white',  note: 'Anode 1 select, through the NPN/PNP pair' },
    { from: 'mcu.D25', to: 'bb.b16',  color: 'white',  note: 'Anode 2 select' },
    { from: 'mcu.D33', to: 'bb.b18',  color: 'white',  note: 'Anode 3 select' },
    { from: 'mcu.D32', to: 'bb.b20',  color: 'white',  note: 'Anode 4 select' },
    { from: 'rtc.VCC', to: 'bb.T+6',  color: 'red',    note: 'RTC power, 5 V side' },
    { from: 'rtc.GND', to: 'bb.T-6',  color: 'black',  note: 'RTC ground' },
    { from: 'rtc.SDA', to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'rtc.SCL', to: 'mcu.D22', color: 'blue',   note: 'I2C clock' }
  ]
},

wireIntro: `<p>The model shows the logic side and the tube connections. The anode switching transistors and
series resistors sit between the HV rail and each tube - the detail that matters most is that
<strong>every anode has its own 10&nbsp;k resistor</strong>.</p>
<p>Brown wires carry 170&nbsp;V. On this build that colour means one thing only: do not touch it, ever, without
having measured the rail first.</p>`,

wireNotes: `
<div class="note danger"><span class="t">Two grounds, one net, no exceptions</span>
<p>The HV return and the logic ground must be the same net. If they are not, the only path from 170&nbsp;V back
to its supply is through whatever else is connected - your USB cable, your laptop, you.</p>
<p>Tie them at one point and verify continuity with a meter before the first power-up.</p></div>

<div class="note danger"><span class="t">Track spacing at 170 V</span>
<p>0.1&nbsp;inch perfboard spacing is fine for 170&nbsp;V on clean, dry board. It is not fine with flux
residue, dust or a fingerprint bridging two pads - those tracks will arc and carbonise, and a carbonised track
conducts permanently.</p>
<p>Clean the board with isopropyl alcohol after soldering the HV side, and keep the HV section physically
separated from the logic.</p></div>

<div class="note warn"><span class="t">The anode resistor is the tube's only current limit</span>
<p>Once a nixie strikes, its resistance collapses. 10-22&nbsp;k in series is what stops it drawing enough
current to sputter its cathodes away in minutes. Fit it before you ever apply HV, and fit one per tube - a
single shared resistor does not work when multiplexing.</p></div>

<div class="note tip"><span class="t">Socket the tubes</span>
<p>Eleven pins each, and the tubes are irreplaceable. Female header strips cut to length make a serviceable
socket and mean a failed tube is a thirty-second swap rather than an hour of desoldering with heat near
sixty-year-old glass.</p></div>`,

solderIntro: `<p>Build and test this in two completely separate stages: the entire logic side first, working, with
no high-voltage module connected at all. Only when the multiplexing is provably correct do you introduce
170&nbsp;V.</p>`,

solderSteps: [
  { h: 'Logic side only, HV module not even on the bench',
    body: `<p>ESP32, buck converter, K155ID1, RTC, and the four anode-drive transistor pairs. Power it from
    5&nbsp;V and verify with a meter that the BCD lines change as the sketch counts, and that each anode drive
    line goes high in turn.</p>
    <p>You can do all of this safely. Do all of it before going further.</p>` },
  { h: 'Test every tube individually, on the bench, before fitting',
    body: `<p>With the HV module powered and a 10&nbsp;k resistor in series with the anode, touch one cathode to
    ground with an insulated probe. That digit should light cleanly and evenly.</p>
    <p>Do this one-handed, with the other hand in your pocket. That habit is what keeps current from crossing
    your chest, and it is worth building now on 170&nbsp;V rather than later on something worse.</p>` },
  { h: 'Cathode bus wiring',
    body: `<p>Ten wires, each joining the same-numbered cathode on all four tubes, then running to the K155ID1
    output. This is the most tedious soldering in the book - forty joints that all look alike.</p>
    <p>Label them as you go. A miswired cathode shows up as a digit that is consistently wrong, and finding
    which of forty wires it is afterwards is miserable.</p>` },
  { h: 'Anodes, with their resistors, one at a time',
    body: `<p>Each tube's anode goes through its own 10&nbsp;k resistor to the collector of its MPSA92. Solder
    one, test it, then do the next. Four identical circuits built blind is four faults to find at once.</p>` },
  { h: 'Clean the board',
    body: `<p>Isopropyl alcohol and a brush over the whole HV section, then let it dry completely. Flux residue
    is slightly conductive and at 170&nbsp;V across 2&nbsp;mm that is enough to start tracking.</p>` },
  { h: 'Into the case before it lives on a shelf',
    body: `<p>The lid goes on whenever it is powered. This is a thing that will sit on furniture with people
    around it, and exposed 170&nbsp;V on an open board is not something to leave in a room.</p>` }
],

libraries: [
  { name: 'RTClib', by: 'Adafruit', why: 'DS3231 timekeeping.' },
  { name: 'WiFi / time.h', by: 'Espressif (built in)', why: 'NTP and the timezone handling. No install needed.' }
],

code: [{
  name: 'nixie_clock.ino',
  code: `/* ------------------------------------------------------------------
   Four-tube nixie clock - ESP32 + K155ID1, multiplexed

   BCD digit on D13/D12/D14/D27, anode select on D26/D25/D33/D32.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <Wire.h>
#include <RTClib.h>
#include <time.h>

const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";
const char* TZ_STRING = "GMT0BST,M3.5.0/1,M10.5.0";

const int BCD[4]   = {13, 12, 14, 27};      // A B C D
const int ANODE[4] = {26, 25, 33, 32};      // tube 1..4

RTC_DS3231 rtc;
int digits[4] = {0, 0, 0, 0};
unsigned long lastAntiPoison = 0;

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 4; i++) { pinMode(BCD[i], OUTPUT);   digitalWrite(BCD[i], LOW); }
  for (int i = 0; i < 4; i++) { pinMode(ANODE[i], OUTPUT); digitalWrite(ANODE[i], LOW); }

  Wire.begin();
  if (!rtc.begin()) Serial.println("No DS3231 - running on NTP alone");

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) delay(300);

  if (WiFi.status() == WL_CONNECTED) {
    configTzTime(TZ_STRING, "pool.ntp.org");
    struct tm t;
    if (getLocalTime(&t, 8000)) {
      rtc.adjust(DateTime(t.tm_year + 1900, t.tm_mon + 1, t.tm_mday,
                          t.tm_hour, t.tm_min, t.tm_sec));
      Serial.println("RTC set from NTP");
    }
  }
  // No network? The DS3231 has been keeping time on its coin cell anyway.
}

void loop() {
  DateTime now = rtc.now();
  int hh = now.hour(), mm = now.minute();

  digits[0] = hh / 10;
  digits[1] = hh % 10;
  digits[2] = mm / 10;
  digits[3] = mm % 10;

  // Leading zero blanked: feed the K155ID1 a value above 9 and it lights
  // nothing at all, which is exactly the behaviour we want.
  if (digits[0] == 0) digits[0] = 15;

  int hour = now.hour();
  if (hour >= 1 && hour < 6) {
    blankAll();                              // dark bedroom, longer tube life
  } else {
    multiplex();
  }

  // Once an hour, run every cathode. This is what stops the rarely-lit
  // digits going patchy - see the write-up on cathode poisoning.
  if (millis() - lastAntiPoison > 3600000UL) {
    lastAntiPoison = millis();
    antiPoison();
  }
}

/* One pass over the four tubes. Each is lit for 2 ms, so the whole frame
   takes 8 ms - about 125 Hz, well above the flicker threshold. */
void multiplex() {
  for (int i = 0; i < 4; i++) {
    setBCD(15);                 // blank while switching
    digitalWrite(ANODE[i], HIGH);
    setBCD(digits[i]);
    delayMicroseconds(2000);

    /* Blank the cathode BEFORE dropping the anode, and leave a short gap.
       The gas takes a moment to stop conducting; switch straight to the
       next tube and the old digit ghosts faintly onto it. */
    setBCD(15);
    delayMicroseconds(150);
    digitalWrite(ANODE[i], LOW);
  }
}

void blankAll() {
  setBCD(15);
  for (int i = 0; i < 4; i++) digitalWrite(ANODE[i], LOW);
  delay(50);
}

void setBCD(int v) {
  for (int b = 0; b < 4; b++) digitalWrite(BCD[b], (v >> b) & 1);
}

/* Slot-machine cycle: every tube through every digit, several times.
   Takes a few seconds, looks deliberate, and keeps the 7s and 9s alive. */
void antiPoison() {
  for (int pass = 0; pass < 6; pass++) {
    for (int d = 0; d < 10; d++) {
      for (int i = 0; i < 4; i++) digits[i] = d;
      unsigned long t0 = millis();
      while (millis() - t0 < 60) multiplex();
    }
  }
}`
}],

trouble: [
  { q: 'A tube shows a faint second digit as well as the right one',
    a: `Ghosting. Increase the blanking gap in <code>multiplex()</code> - the gas is still conducting when the
    next anode goes live. 150&nbsp;us is a starting point; some tubes want 300.` },
  { q: 'Nothing lights at all',
    a: `Measure the HV rail first, with one hand behind your back. If it is not near 170&nbsp;V the module is
    not running or is not getting 12&nbsp;V. If it is, the problem is on the anode-switch side.` },
  { q: 'One digit never lights on any tube',
    a: `That cathode line is broken or the K155ID1 output is dead. Since all four tubes share the line, a fault
    affecting every tube equally is upstream of them - which narrows it usefully.` },
  { q: 'One tube is dim compared to the others',
    a: `Its anode resistor is a higher value than the others, or that tube is simply old. Nixies dim with age
    and a set of mixed-vintage tubes never quite matches.` },
  { q: 'Digits have dark patches',
    a: `Cathode poisoning, already underway. Run the anti-poison cycle much more often - every fifteen minutes
    for a few days - and it will often recover most of the way.` },
  { q: 'The board smells hot, or a track has gone brown',
    a: `Stop. Unplug. That is HV tracking across the board surface, and a carbonised track stays conductive.
    Cut the track out, clean thoroughly, and increase the spacing there.` },
  { q: 'The ESP32 resets when the tubes light',
    a: `The HV module is drawing current in pulses and sagging the 12&nbsp;V rail. Add bulk capacitance at the
    buck converter input, and make sure the logic is not fed from the HV module’s own auxiliary output.` },
  { q: 'Clock is an hour out half the year',
    a: `The TZ string has no daylight-saving rule, or you are writing UTC to the RTC and reading it back as
    local. Set the RTC from <code>getLocalTime()</code> as the sketch does.` }
],

safety: `
<div class="note danger"><span class="t">170 volts. Read this before you order parts.</span>
<p>This is the only project in this book that runs at a genuinely dangerous voltage. 170&nbsp;V DC is well
above the roughly 50&nbsp;V at which skin stops being much protection, and a current-limited supply is not the
same as a safe one.</p>
<ul>
  <li><strong>One hand only.</strong> Keep the other in your pocket or behind your back whenever the HV side is
  live. Current across the chest is what stops hearts; current down one arm usually is not.</li>
  <li><strong>Discharge before touching.</strong> The HV module has capacitors that stay charged after power
  off. Measure the rail with a meter and wait until it reads under 10&nbsp;V. Do not assume; measure.</li>
  <li><strong>Never work on it powered.</strong> Not to "just move that wire". Unplug, discharge, then work.</li>
  <li><strong>No jewellery, no watch, dry hands, and not on a metal bench.</strong></li>
  <li><strong>Insulate everything on the HV side</strong> - heatshrink over joints, no bare wire, and the lid on
  whenever it is powered.</li>
  <li><strong>Do not build this as your first soldering project.</strong> Do the
  <a href="project.html?p=desk-clock">desk clock</a> first. There is no shame in that order and every reason
  for it.</li>
</ul>
<p>The tubes themselves are glass, sixty years old, and under partial vacuum. They break into sharp fragments
if dropped or over-tightened in a socket. Safety glasses while fitting them is not overcautious.</p>
<p>Do not build the high-voltage supply yourself for a first attempt. The bought modules are cheap, tested and
enclosed, and a hand-wound flyback that you cannot yet probe safely is a bad place to learn.</p></div>`,

next: `
<ul>
  <li><strong>Six tubes</strong> to add seconds. The multiplex loop barely changes; the anode drivers double.</li>
  <li><strong>Neon separator bulbs</strong> between hours and minutes, blinking once a second. Period-correct
  and they run off the same rail.</li>
  <li><strong>Crossfade between digits</strong> by PWM-ing the anode during a change, so the old digit fades as
  the new one rises. It is the single most-admired refinement on any nixie clock.</li>
  <li><strong>An IN-14 or IN-18 set</strong> if you find them affordable, which mostly you will not - IN-18s are
  the big ones and have become genuinely collectable.</li>
  <li><strong>Show something other than time</strong>: the
  <a href="project.html?p=bus-departure-board">departure countdown</a> on four nixies is an extremely good
  hallway object.</li>
</ul>`
});
