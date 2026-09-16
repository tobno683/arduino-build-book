/* SX1276 point-to-point: kilometres of range, bytes per minute, and the duty cycle law. */
AB.addProject({
slug: 'lora-remote-sensor',
title: 'LoRa sensor across a valley',
cat: 'radio',
level: 3,
time: '6 hours',
solder: true,
board: 'ESP32 x2',
feature: true,
tags: ['lora', 'sx1276', '868mhz', 'long range', 'spread spectrum', 'deep sleep', 'duty cycle', 'solar', 'rssi', 'link budget'],
blurb: 'A battery sensor two kilometres away, reporting through trees and buildings, with no Wi-Fi, no SIM card and no monthly bill. The trade is that it can only say a little, slowly.',

skills: ['LoRa and spread spectrum', 'Spreading factors', 'Link budgets', 'RSSI and SNR', 'Duty cycle law', 'Deep sleep', 'Antennas'],

intro: `
<p>Every wireless technology trades range against data rate, and most of them are tuned for the wrong end of
that trade for a sensor. Wi-Fi will move 50 megabits and reaches the end of the garden. Bluetooth reaches
across a room. The nRF24 does rather better and still cannot leave the property.</p>
<p>LoRa goes the other way, hard. It will move something like <em>fifty bytes a minute</em>, and it will do it
from two kilometres away, through a wood, from inside a box, on a battery that lasts a year. For a sensor that
needs to report a temperature every ten minutes, that is an almost perfect match - and for anything resembling
a video stream it is completely useless.</p>
<p>This project builds one node and one base station, gets real range figures rather than the ones on the
packaging, and takes seriously the thing most hobby LoRa guides skip entirely: in Europe and much of the
world, <strong>how often you are legally allowed to transmit is capped</strong>, and at the longest-range
settings that cap is about one message every two and a half minutes. It is not a guideline.</p>`,

what: [
  'Send temperature, humidity, pressure and battery voltage from a remote node to a base station.',
  'Reach a kilometre or more through obstructions, with a quarter-wave wire antenna you cut yourself.',
  'Read the signal strength and signal-to-noise ratio of every packet, and use them to site the node properly.',
  'Sleep between transmissions at microamps, so a LiPo and a small solar panel run it indefinitely.',
  'Stay inside the legal duty cycle, with the airtime calculated rather than guessed.',
  'Know what your actual range is, by walking it with a field tester that reports live signal quality.'
],

how: `
<p><strong>Chirp spread spectrum, which is the whole trick.</strong> Conventional radio encodes bits as
changes in amplitude, frequency or phase at a fixed frequency. LoRa instead sends <em>chirps</em> - signals
that sweep smoothly across the whole bandwidth - and encodes data in where each chirp starts.</p>
<p>The receiver knows the chirp's shape exactly, so it can correlate the incoming signal against that known
shape. Correlation pulls a signal out of noise the way hearing your own name across a loud room does: the
pattern is recognisable even when the energy is not. That is why LoRa can decode signals <strong>below the
noise floor</strong> - typically 20&nbsp;dB below - which no simple modulation can do.</p>

<p><strong>Spreading factor: the one dial that matters.</strong> SF7 to SF12. Each step up doubles the time
spent on each symbol, which roughly doubles the airtime and buys about 2.5&nbsp;dB of sensitivity.</p>
<table>
  <thead><tr><th>SF</th><th>Sensitivity (125 kHz)</th><th>Data rate</th><th>20-byte airtime</th></tr></thead>
  <tbody>
    <tr><td>SF7</td><td>-123 dBm</td><td>5.5 kbps</td><td>~60 ms</td></tr>
    <tr><td>SF9</td><td>-129 dBm</td><td>1.8 kbps</td><td>~210 ms</td></tr>
    <tr><td>SF10</td><td>-132 dBm</td><td>1.0 kbps</td><td>~370 ms</td></tr>
    <tr><td>SF12</td><td>-136 dBm</td><td>250 bps</td><td>~1,500 ms</td></tr>
  </tbody>
</table>
<p>SF12 reaches roughly four times as far as SF7 and takes twenty-five times as long to say the same thing.
Look at that last column again - <strong>a second and a half to send twenty bytes</strong>. That number drives
everything else in the project.</p>

<p><strong>The link budget, done properly.</strong> Transmit power plus antenna gains, minus path loss, has to
land above receiver sensitivity:</p>
<ul>
  <li>Transmit power: <strong>+14 dBm</strong> (25&nbsp;mW - the legal maximum in the EU 868 band).</li>
  <li>Receiver sensitivity at SF12: <strong>-136 dBm</strong>.</li>
  <li>Budget: <strong>150 dB</strong>.</li>
</ul>
<p>Free-space path loss at 868&nbsp;MHz is 32.4 + 20log(f in MHz) + 20log(d in km), which at 10&nbsp;km comes
to about 111&nbsp;dB. So in clear line of sight, 150&nbsp;dB of budget covers 10&nbsp;km with 39&nbsp;dB to
spare.</p>
<p>Reality removes that margin quickly. A brick wall is 10-15&nbsp;dB. A modern building with foil-backed
insulation can be 30. Wet trees are a few dB per metre of foliage. The ground itself gets in the way beyond
the radio horizon, which at two metres above flat ground is only about 5&nbsp;km. <strong>Height beats power,
every time</strong> - moving an antenna up two metres routinely does more than anything you can change in
software.</p>

<p><strong>The duty cycle, which is law rather than etiquette.</strong> In the EU, the 868.0-868.6&nbsp;MHz
sub-band allows a <strong>1% duty cycle</strong>. If a transmission takes 1.5 seconds, you must then stay off
that band for 148.5 seconds. That is one message roughly every two and a half minutes, absolute maximum, at
SF12.</p>
<p>This is not enforced by the module. Nothing stops you transmitting continuously except the regulations and
the fact that you would be sitting on a shared band that other people also depend on. The sketch below
calculates its own airtime and refuses to transmit early.</p>
<p>In the US the rules differ: 902-928&nbsp;MHz has no duty cycle limit, but there is a 400&nbsp;ms maximum
dwell time per channel, which SF12 at 125&nbsp;kHz exceeds. American readers should use SF10 or lower at
125&nbsp;kHz, or move to 500&nbsp;kHz bandwidth. The region section covers this.</p>

<p><strong>LoRa is not LoRaWAN.</strong> Worth being clear about, because the names get used
interchangeably. LoRa is the radio modulation. LoRaWAN is a whole network layer built on top - gateways,
network servers, join procedures, The Things Network. This project is plain point-to-point LoRa: two radios
that talk to each other and to nothing else. It is simpler, it needs no infrastructure, and it is the right
choice when you own both ends.</p>`,

bom: [
  { id: 'esp32', qty: 2, note: 'Deliberately not a Nano. The SX1276 is 3.3 V and NOT 5 V tolerant on any pin, so a 5 V Arduino needs level shifting on four lines. An ESP32 is 3.3 V natively, has real deep sleep, and costs less.' },
  { id: 'lora', qty: 2, note: 'SX1276 breakout. Buy the band your country uses - 868 MHz in Europe, 915 MHz in North America and Australia, 433 MHz in some of Asia. The chips differ, not just the setting.' },
  { id: 'ant-868', qty: 2, note: 'A proper antenna with a pigtail. This is the highest-value $5 in the project - more than doubling your range over the bare module.' },
  { id: 'ant-wire', qty: 2, own: true, note: 'The free alternative: 86 mm of solid-core wire soldered to the antenna pad for 868 MHz, 78 mm for 915, 164 mm for 433. Surprisingly good, and infinitely better than nothing.' },
  { id: 'bme280', qty: 1, note: 'On the remote node. Temperature, humidity and pressure over I2C at about 3 uA in sleep.' },
  { id: 'oled13', qty: 1, note: 'On the base. Shows readings plus RSSI and SNR, which is what you actually stare at while siting the node.' },
  { id: 'lipo2000', qty: 1, note: 'The node. 2000 mAh is roughly a year at ten-minute reporting once deep sleep is working.' },
  { id: 'tp4056', qty: 1, note: 'Charging and, importantly, protection. Get the version with the DW01 protection chip, not the bare charger.' },
  { id: 'solar6v', qty: 1, note: 'Optional and transformative. A 1 W panel keeps the node running indefinitely in anything but a northern winter.' },
  { id: 'box-ip65', qty: 1, note: 'The node lives outdoors. Vents on the underside only, and see the notes about where the antenna goes.' },
  { id: 'perfboard', qty: 2 },
  { id: 'headers-f', qty: 1, note: 'Socket both the ESP32 and the radio. You will reflash this.' },
  { id: 'cap10', qty: 2, note: 'Across each radio module’s 3.3 V and ground. Less critical than on an nRF24 but still worth doing.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'bb-400', qty: 2, own: true, note: 'Prototype first.' }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'node',   comp: 'esp32',  at: [-76, 46] },
    { id: 'nbb',    comp: 'bb400',  at: [-76, -16] },
    { id: 'nlora',  comp: 'lora',   at: [-116, -60], ry: 180 },
    { id: 'bme',    comp: 'bme280', at: [-42, -60] },
    { id: 'chg',    comp: 'tp4056', at: [-76, -96] },
    { id: 'base',   comp: 'esp32',  at: [76, 46] },
    { id: 'bbb',    comp: 'bb400',  at: [76, -16] },
    { id: 'blora',  comp: 'lora',   at: [36, -60], ry: 180 },
    { id: 'oled',   comp: 'oled13', at: [108, -60], ry: 180 }
  ],
  wires: [
    { from: 'node.3V3',   to: 'nbb.T+2',   color: 'red',    note: 'NODE: 3.3 V rail. Everything on this board is 3.3 V - there is no 5 V anywhere' },
    { from: 'node.GND',   to: 'nbb.T-2',   color: 'black',  note: 'NODE: ground rail' },
    { from: 'nlora.VCC',  to: 'nbb.T+6',   color: 'red',    note: 'NODE: radio power, 3.3 V. Five volts destroys an SX1276' },
    { from: 'nlora.GND',  to: 'nbb.T-6',   color: 'black',  note: 'NODE: radio ground' },
    { from: 'nlora.NSS',  to: 'node.D5',   color: 'orange', note: 'NODE: SPI chip select' },
    { from: 'nlora.SCK',  to: 'node.D18',  color: 'yellow', note: 'NODE: SPI clock (VSPI default)' },
    { from: 'nlora.MISO', to: 'node.D19',  color: 'purple', note: 'NODE: SPI data in' },
    { from: 'nlora.MOSI', to: 'node.D23',  color: 'blue',   note: 'NODE: SPI data out' },
    { from: 'nlora.RST',  to: 'node.D27',  color: 'white',  note: 'NODE: radio reset' },
    { from: 'nlora.DIO0', to: 'node.D26',  color: 'green',  note: 'NODE: transmit-done / receive-done interrupt' },
    { from: 'bme.VIN',    to: 'nbb.T+12',  color: 'red',    note: 'NODE: sensor power' },
    { from: 'bme.GND',    to: 'nbb.T-12',  color: 'black',  note: 'NODE: sensor ground' },
    { from: 'bme.SDA',    to: 'node.D21',  color: 'blue',   note: 'NODE: I2C data' },
    { from: 'bme.SCL',    to: 'node.D22',  color: 'yellow', note: 'NODE: I2C clock' },
    { from: 'chg.OUT+',   to: 'node.VIN',  color: 'red',    note: 'NODE: battery through the protection board to VIN - never straight to 3V3' },
    { from: 'chg.OUT-',   to: 'nbb.T-18',  color: 'black',  note: 'NODE: battery negative, via the protection board' },

    { from: 'base.3V3',   to: 'bbb.T+2',   color: 'red',    note: 'BASE: 3.3 V rail' },
    { from: 'base.GND',   to: 'bbb.T-2',   color: 'black',  note: 'BASE: ground rail' },
    { from: 'blora.VCC',  to: 'bbb.T+6',   color: 'red',    note: 'BASE: radio power, 3.3 V' },
    { from: 'blora.GND',  to: 'bbb.T-6',   color: 'black',  note: 'BASE: radio ground' },
    { from: 'blora.NSS',  to: 'base.D5',   color: 'orange', note: 'BASE: SPI chip select' },
    { from: 'blora.SCK',  to: 'base.D18',  color: 'yellow', note: 'BASE: SPI clock' },
    { from: 'blora.MISO', to: 'base.D19',  color: 'purple', note: 'BASE: SPI data in' },
    { from: 'blora.MOSI', to: 'base.D23',  color: 'blue',   note: 'BASE: SPI data out' },
    { from: 'blora.RST',  to: 'base.D27',  color: 'white',  note: 'BASE: radio reset' },
    { from: 'blora.DIO0', to: 'base.D26',  color: 'green',  note: 'BASE: receive-done interrupt' },
    { from: 'oled.VCC',   to: 'bbb.T+12',  color: 'red',    note: 'BASE: display power' },
    { from: 'oled.GND',   to: 'bbb.T-12',  color: 'black',  note: 'BASE: display ground' },
    { from: 'oled.SDA',   to: 'base.D21',  color: 'blue',   note: 'BASE: I2C data' },
    { from: 'oled.SCL',   to: 'base.D22',  color: 'yellow', note: 'BASE: I2C clock' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Never power up a LoRa module without an antenna</span>
<p>This is the one that destroys hardware. A transmitter with nothing on its antenna pad has nowhere to send
its energy, so it reflects back into the power amplifier. A few transmissions like that and the PA is
degraded; a few more and it is dead.</p>
<p>Solder a wire whip on before the module is ever powered, even if the proper antenna has not arrived.
86&nbsp;mm of solid core for 868&nbsp;MHz, 78&nbsp;mm for 915, 164&nbsp;mm for 433 - a quarter wavelength.
It costs nothing and it works well.</p>
<p>The receiver does not care. It is transmitting into an open circuit that does the damage.</p></div>

<div class="note danger"><span class="t">3.3 V, and unlike the nRF24 the signal pins are not tolerant either</span>
<p>The SX1276 is a 3.3&nbsp;V part throughout. VCC, and every SPI line, and RST, and DIO0. A 5&nbsp;V Arduino
driving these directly will damage it.</p>
<p>That is exactly why this project uses an ESP32 on both ends rather than the Nano you might expect. If you
insist on a 5&nbsp;V board you need level shifting on NSS, SCK, MOSI and RST - four lines, since MISO and DIO0
are the module driving the Arduino and are fine.</p></div>

<div class="note warn"><span class="t">Battery goes to VIN, never to 3V3</span>
<p>A LiPo is 3.0-4.2&nbsp;V. Feeding that straight to the ESP32's 3V3 pin bypasses the regulator and puts
4.2&nbsp;V on a 3.3&nbsp;V rail, which is out of spec for the radio too.</p>
<p>Into <strong>VIN</strong>, through the DevKit's own regulator. You lose some efficiency to the regulator's
dropout, and you gain not destroying anything. The tuning section covers doing better than this.</p></div>

<div class="note warn"><span class="t">Where the antenna goes matters more than anything else you will do</span>
<ul>
  <li><strong>Outside the box, or at least not against metal.</strong> A metal enclosure is a Faraday cage and
  will cost you almost all of your range. If the box is plastic, an internal wire whip is acceptable; if it is
  metal, the antenna has to be outside on a bulkhead connector.</li>
  <li><strong>Vertical.</strong> Both ends. Two vertical antennas are aligned; one vertical and one horizontal
  loses you 20&nbsp;dB for free, which is most of the difference between SF7 and SF12.</li>
  <li><strong>Clear of the PCB and the battery.</strong> A whip lying along a LiPo pouch is detuned badly.</li>
  <li><strong>High.</strong> Two metres of height is worth more than any setting in the sketch.</li>
</ul></div>

<div class="note tip"><span class="t">Both nodes must agree on five things</span>
<p>Frequency, spreading factor, bandwidth, coding rate and sync word. Get any one of them different and the
link is perfectly silent - the radios are working and simply cannot hear each other.</p>
<p>The sketches put all five in a shared block of defines at the top for exactly this reason. Change them
together or not at all.</p></div>`,

solderSteps: [
  { h: 'The antenna, first, before anything is powered',
    body: `<p>Cut solid-core wire to a quarter wavelength: <strong>86&nbsp;mm for 868&nbsp;MHz</strong>,
    78&nbsp;mm for 915, 164&nbsp;mm for 433. Measure from where it leaves the pad, and cut it a millimetre
    long rather than short - you can trim.</p>
    <p>The SX1276 breakouts have a small pad marked ANT or a footprint for an IPEX connector. Tin the pad,
    tin the wire end, and join them with as little solder as will do the job. Keep the wire straight and
    vertical.</p>
    <p>Do this on both modules before either is powered up. Not after. Not "just for a quick test".</p>` },
  { h: 'Decoupling capacitors across each module',
    body: `<p>10&nbsp;uF across the module's 3.3&nbsp;V and GND pins, positive leg to 3.3&nbsp;V. Less
    critical than on an nRF24 because the transmit current is steadier, but the SX1276 still pulls about
    120&nbsp;mA at +20&nbsp;dBm and an ESP32 DevKit's regulator has other things to do.</p>` },
  { h: 'Female headers for both boards',
    body: `<p>Socket the ESP32 and the radio module on the perfboard. You will be reflashing this and taking
    it up hills, and a soldered-down module is one you cannot swap when you damage it.</p>
    <p>Use the boards themselves as jigs. Tack the corner pins, check everything sits flat, finish the
    rest.</p>` },
  { h: 'Keep the SPI runs short',
    body: `<p>Six signal lines between the ESP32 and the radio. SPI here runs at a few megahertz, which is
    forgiving, but keep them under about 80&nbsp;mm and do not run them alongside the antenna wire.</p>
    <p>Solid core, flat against the board, ground rail first.</p>` },
  { h: 'The charging circuit, in the right order',
    body: `<p>LiPo into the TP4056's <strong>B+</strong> and <strong>B-</strong>. Load off
    <strong>OUT+</strong> and <strong>OUT-</strong>, never off B+/B- directly - the protection chip sits
    between them and taking the load from the wrong pair bypasses it entirely.</p>
    <p>Solar panel to the TP4056's input. A 6&nbsp;V panel is within its input range; anything higher needs a
    regulator in front.</p>
    <p>Check the polarity of the LiPo connector with a meter before it goes on. JST-PH leads are not
    consistently wired between suppliers, and reversing a lithium cell is the genuinely dangerous mistake in
    this project.</p>` },
  { h: 'Buzz it out, then power up in stages',
    body: `<p>Nothing connected: 3.3&nbsp;V to GND no beep, every ground to the ESP32's GND beep.</p>
    <p>Then USB power with the radio removed from its socket, confirm the board boots. Then power down, seat
    the radio, and only then run a sketch that transmits. The antenna is already on, because you did that
    first.</p>` },
  { h: 'Weatherproofing, on the underside',
    body: `<p>Vents on the <em>bottom</em> face only. A sealed box collects condensation from its own daily
    temperature cycle and rains inside itself; a box with a couple of small holes underneath breathes and
    stays dry.</p>
    <p>Cable glands for anything entering, and a drip loop in every cable so water runs off below the
    entry point rather than into it.</p>` }
],

assembly: [
  { h: 'Check your region before you order anything',
    body: `<p>868&nbsp;MHz for Europe, 915 for North America and Australia, 433 in parts of Asia. The modules
    are physically different - an 868&nbsp;MHz SX1276 cannot simply be told to use 915 with any useful
    performance, because the matching network is tuned.</p>
    <p>Buy both modules in the same band, obviously, and buy the antennas to match.</p>` },
  { h: 'Get one radio talking before you build two',
    body: `<p>Wire one ESP32 and one radio on a breadboard. Upload the register check and confirm the module
    responds. <code>LoRa.begin()</code> returning false means SPI wiring, and it is worth resolving on a
    breadboard rather than on perfboard.</p>` },
  { h: 'Run the ping test at arm’s length',
    body: `<p>Two nodes, the ping sketches, a metre apart. You should see RSSI around -30 to -50&nbsp;dBm and
    SNR around +9&nbsp;dB. Those are "practically touching" numbers and they confirm the whole chain.</p>
    <p>Do this at SF7 first - it is fast and you get immediate feedback. Move to SF12 once it works.</p>` },
  { h: 'Walk the link and record real numbers',
    body: `<p>This is the most interesting hour in the project. Leave the base at home transmitting, carry
    the node with a phone or a power bank, and note RSSI and SNR at each point.</p>
    <p>What to look for:</p>
    <ul>
      <li><strong>RSSI above -100&nbsp;dBm</strong>: comfortable.</li>
      <li><strong>-100 to -120&nbsp;dBm</strong>: working, with margin shrinking.</li>
      <li><strong>Below -120&nbsp;dBm</strong>: living on borrowed time; rain will break it.</li>
      <li><strong>Negative SNR</strong>: you are decoding below the noise floor. This is normal and impressive
      and means you are near the limit.</li>
    </ul>
    <p>Do not site a node at its maximum range. Weather, foliage in summer and a neighbour's new shed all
    take a few dB, and you want 10-15&nbsp;dB of margin.</p>` },
  { h: 'Pick the spreading factor from what you measured',
    body: `<p>Use the lowest SF that gives comfortable margin, not the highest available. SF7 at
    -95&nbsp;dBm is a far better link than SF12 at -130: it is twenty-five times less airtime, twenty-five
    times less battery, and leaves the band free for everyone else.</p>
    <p>Only go to SF12 when you have measured that you need it.</p>` },
  { h: 'Add the sensor and the battery',
    body: `<p>BME280 on I2C, LiPo through the TP4056. Confirm the battery voltage reading is sensible before
    you close the box - it is the only thing that tells you the node is dying rather than dead.</p>` },
  { h: 'Enable deep sleep and measure the current',
    body: `<p>Put the multimeter in series with the battery. Awake and transmitting should be 100-150&nbsp;mA
    for a second or two; asleep should be well under a milliamp.</p>
    <p>If sleep current is 10-20&nbsp;mA, that is the DevKit's onboard regulator and USB-serial chip, not your
    sketch. The tuning section explains what to do about it.</p>` },
  { h: 'Install it, and leave real margin',
    body: `<p>As high as you can manage, antenna vertical, box vented underneath. Check it the next morning
    and again after the first heavy rain - wet foliage is the single biggest seasonal change in a 868&nbsp;MHz
    link.</p>` }
],

libraries: [
  { name: 'LoRa', by: 'Sandeep Mistry', how: 'Library Manager: "LoRa"', why: 'The standard SX127x library. Plain point-to-point, no LoRaWAN stack, and it exposes RSSI and SNR per packet.' },
  { name: 'SPI', by: 'Arduino', how: 'Built in', why: 'The bus.' },
  { name: 'Adafruit BME280', by: 'Adafruit', why: 'The sensor on the node.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The display on the base.' },
  { name: 'ESP32 board package', by: 'Espressif', how: 'Boards Manager: "esp32"', why: 'Needed for both boards, and it is where the deep sleep functions live.' }
],

code: [
{
  h: 'Step 1: shared settings, and the airtime calculator',
  intro: `<p>Paste this block into <em>both</em> sketches. The five radio settings must match exactly, and the
  airtime function is what keeps the node legal.</p>`,
  name: 'lora_config.h',
  code: `/* ------------------------------------------------------------------
   Shared LoRa configuration. IDENTICAL on both ends.

   Get any one of these wrong on one side and the link is completely
   silent - which looks exactly like broken hardware.
   ------------------------------------------------------------------ */

// --- pins (ESP32 VSPI) ------------------------------------------------
#define LORA_SS     5
#define LORA_RST   27
#define LORA_DIO0  26
// SCK 18, MISO 19, MOSI 23 are the VSPI defaults and need no setup.

// --- band -------------------------------------------------------------
// 868E6 Europe | 915E6 North America, Australia | 433E6 parts of Asia
#define LORA_FREQ       868E6

// --- modulation -------------------------------------------------------
// SF7 fastest/shortest range, SF12 slowest/longest. START AT 7.
#define LORA_SF          9
#define LORA_BW     125E3
#define LORA_CR          5        // 4/5. Higher = more error correction
#define LORA_POWER      14        // dBm. 14 is the EU legal maximum

// A sync word separates your network from other people's. 0x34 is
// RESERVED for LoRaWAN - never use it for point-to-point, or gateways
// in range will try to decode your traffic.
#define LORA_SYNC     0xF3

// --- duty cycle -------------------------------------------------------
// EU 868.0-868.6 MHz: 1% duty cycle. Airtime x 100 = required silence.
#define DUTY_CYCLE_PCT   1

/* ------------------------------------------------------------------
   Airtime, from the Semtech formula. Worth having in the sketch
   rather than in a spreadsheet, because it is what decides how often
   you are allowed to speak.
   ------------------------------------------------------------------ */
float loraAirtimeMs(uint8_t payloadBytes) {
  float bw = LORA_BW;
  uint8_t sf = LORA_SF;
  uint8_t cr = LORA_CR - 4;          // 1..4
  bool lowDataRateOpt = (sf >= 11);  // mandatory at SF11/12 on 125 kHz

  float tSym = pow(2, sf) / bw * 1000.0;        // ms per symbol
  float tPreamble = (8 + 4.25) * tSym;          // 8 preamble symbols

  float num = 8.0 * payloadBytes - 4.0 * sf + 28 + 16;
  float den = 4.0 * (sf - (lowDataRateOpt ? 2 : 0));
  float nPayload = 8 + max(ceil(num / den) * (cr + 4), 0.0f);

  return tPreamble + nPayload * tSym;
}

/* How long we must stay silent after a transmission of this length. */
unsigned long requiredSilenceMs(uint8_t payloadBytes) {
  return (unsigned long)(loraAirtimeMs(payloadBytes) *
                         (100.0 / DUTY_CYCLE_PCT - 1.0));
}`,
  after: `<p>Run <code>loraAirtimeMs(20)</code> at a few spreading factors and the trade becomes concrete: about
  60&nbsp;ms at SF7, 210 at SF9, 1,500 at SF12. Multiply by 99 and those become 6 seconds, 21 seconds and
  <strong>two and a half minutes</strong> of mandatory silence.</p>
  <p><strong>On <code>LORA_SYNC</code>:</strong> 0x34 is reserved for LoRaWAN. Using it means any LoRaWAN
  gateway within earshot - and in a city there probably is one - will spend effort trying to decode your
  greenhouse temperature. 0xF3 or any other value keeps you out of their way and them out of yours.</p>`
},
{
  h: 'Step 2: is the radio there, and what is its airtime?',
  intro: `<p>Run this on each board before building anything. It proves SPI and prints the airtime table for
  your settings.</p>`,
  name: 'lora_check.ino',
  code: `#include <SPI.h>
#include <LoRa.h>
#include "lora_config.h"

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\\nLoRa check"));

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(LORA_FREQ)) {
    Serial.println(F("LoRa.begin() FAILED"));
    Serial.println(F("  - SS/RST/DIO0 on the pins above?"));
    Serial.println(F("  - SCK 18, MISO 19, MOSI 23?"));
    Serial.println(F("  - VCC on 3.3 V, NOT 5 V?"));
    Serial.println(F("  - is the module the right band for LORA_FREQ?"));
    while (1) delay(1000);
  }

  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BW);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setTxPower(LORA_POWER);
  LoRa.setSyncWord(LORA_SYNC);

  Serial.println(F("LoRa.begin() ok\\n"));
  Serial.print(F("freq  : ")); Serial.print(LORA_FREQ / 1E6); Serial.println(F(" MHz"));
  Serial.print(F("SF    : ")); Serial.println(LORA_SF);
  Serial.print(F("BW    : ")); Serial.print(LORA_BW / 1E3); Serial.println(F(" kHz"));
  Serial.print(F("CR    : 4/")); Serial.println(LORA_CR);
  Serial.print(F("power : ")); Serial.print(LORA_POWER); Serial.println(F(" dBm"));

  /* The number that governs the whole design. Print it every time so
     you cannot accidentally ship a node that transmits illegally. */
  Serial.println(F("\\nairtime and required silence, 20-byte payload:"));
  for (uint8_t sf = 7; sf <= 12; sf++) {
    LoRa.setSpreadingFactor(sf);
    float ms = airtimeFor(sf, 20);
    Serial.print(F("  SF")); Serial.print(sf);
    Serial.print(F("  airtime ")); Serial.print(ms, 0); Serial.print(F(" ms"));
    Serial.print(F("   min gap ")); Serial.print(ms * 99 / 1000.0, 1);
    Serial.println(F(" s"));
  }
  LoRa.setSpreadingFactor(LORA_SF);

  // Ambient noise floor. Useful: if this reads better than -100 dBm
  // you have an interferer nearby and your range will suffer.
  Serial.print(F("\\nambient RSSI: "));
  Serial.print(LoRa.rssi());
  Serial.println(F(" dBm  (quiet is around -110 to -125)"));
}

float airtimeFor(uint8_t sf, uint8_t payloadBytes) {
  float bw = LORA_BW;
  uint8_t cr = LORA_CR - 4;
  bool ldro = (sf >= 11);
  float tSym = pow(2, sf) / bw * 1000.0;
  float tPre = (8 + 4.25) * tSym;
  float num = 8.0 * payloadBytes - 4.0 * sf + 28 + 16;
  float den = 4.0 * (sf - (ldro ? 2 : 0));
  float nPay = 8 + max(ceil(num / den) * (cr + 4), 0.0f);
  return tPre + nPay * tSym;
}

void loop() {}`,
  after: `<p>The ambient RSSI reading at the end is a genuinely useful diagnostic and almost nobody checks it.
  A quiet 868&nbsp;MHz band reads around -110 to -125&nbsp;dBm. If yours reads -85, something nearby is
  transmitting - a weather station, a smart meter, a neighbour's doorbell - and every decibel of that noise
  comes straight off your usable range.</p>`
},
{
  h: 'Step 3: the sensor node',
  intro: `<p>Wakes, reads, transmits, and goes back to sleep for ten minutes. The whole awake period is about
  two seconds.</p>`,
  name: 'lora_node.ino',
  code: `/* ------------------------------------------------------------------
   Remote sensor node.

   Wake -> read sensor -> transmit -> deep sleep.
   Awake for about 2 s, asleep for 10 minutes.

   SLEEP_MINUTES must keep us inside the duty cycle. At SF9 the
   airtime is ~210 ms, which needs 21 s of silence - ten minutes is
   comfortably legal. At SF12 the minimum is 2.5 minutes, so do not
   drop the interval below that without recalculating.
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include "lora_config.h"

#define NODE_ID          1
#define SLEEP_MINUTES   10
#define VBAT_PIN        35        // through a 2:1 divider from the battery
#define uS_PER_MIN  60000000ULL

Adafruit_BME280 bme;

/* RTC memory survives deep sleep - normal variables do not. The
   sequence number is how the base detects losses, so it has to
   persist across the sleep that happens between every packet. */
RTC_DATA_ATTR uint16_t bootCount = 0;

struct Packet {
  uint8_t  nodeId;
  uint16_t seq;
  int16_t  tempC100;
  uint16_t humidity100;
  uint16_t pressure10;
  uint16_t vbatMv;
} __attribute__((packed));

void setup() {
  Serial.begin(115200);
  delay(100);

  bootCount++;
  Serial.print(F("\\nwake #")); Serial.println(bootCount);

  // --- sensor --------------------------------------------------------
  Wire.begin(21, 22);
  if (!bme.begin(0x76) && !bme.begin(0x77)) {
    Serial.println(F("no BME280 - sleeping anyway"));
    sleepNow();
  }

  // Forced mode: take one reading on demand and return to sleep,
  // rather than the default of measuring continuously. On a battery
  // node that difference is the whole sensor budget.
  bme.setSampling(Adafruit_BME280::MODE_FORCED,
                  Adafruit_BME280::SAMPLING_X1,
                  Adafruit_BME280::SAMPLING_X1,
                  Adafruit_BME280::SAMPLING_X1,
                  Adafruit_BME280::FILTER_OFF);
  bme.takeForcedMeasurement();

  Packet pkt;
  pkt.nodeId      = NODE_ID;
  pkt.seq         = bootCount;
  pkt.tempC100    = (int16_t)(bme.readTemperature() * 100.0);
  pkt.humidity100 = (uint16_t)(bme.readHumidity() * 100.0);
  pkt.pressure10  = (uint16_t)(bme.readPressure() / 10.0);
  pkt.vbatMv      = readBatteryMv();

  Serial.print(pkt.tempC100 / 100.0, 2);   Serial.print(F(" C  "));
  Serial.print(pkt.humidity100 / 100.0, 1); Serial.print(F(" %  "));
  Serial.print(pkt.pressure10 / 10.0, 1);  Serial.print(F(" hPa  "));
  Serial.print(pkt.vbatMv);                Serial.println(F(" mV"));

  // --- radio ---------------------------------------------------------
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQ)) {
    Serial.println(F("radio failed - sleeping"));
    sleepNow();
  }
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BW);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setTxPower(LORA_POWER);
  LoRa.setSyncWord(LORA_SYNC);

  unsigned long t0 = millis();
  LoRa.beginPacket();
  LoRa.write((uint8_t *)&pkt, sizeof(pkt));
  LoRa.endPacket();                       // blocks until sent
  unsigned long airtime = millis() - t0;

  Serial.print(F("sent ")); Serial.print(sizeof(pkt));
  Serial.print(F(" bytes in ")); Serial.print(airtime); Serial.println(F(" ms"));

  /* A low battery is the one thing worth breaking the schedule for -
     a node that dies silently is worse than one that warns first. */
  if (pkt.vbatMv < 3400) Serial.println(F("*** battery low ***"));

  LoRa.sleep();                           // radio to ~1 uA
  sleepNow();
}

void loop() { }                           // never reached

void sleepNow() {
  Serial.print(F("sleeping "));
  Serial.print(SLEEP_MINUTES);
  Serial.println(F(" min"));
  Serial.flush();

  esp_sleep_enable_timer_wakeup(SLEEP_MINUTES * uS_PER_MIN);
  esp_deep_sleep_start();
  // Execution ends here. On wake, setup() runs again from the top.
}

/* The ESP32 ADC is not linear near the rails and varies between
   chips. This is good to a few percent, which is all a battery
   gauge needs - do not read anything into the last digit. */
uint16_t readBatteryMv() {
  analogSetPinAttenuation(VBAT_PIN, ADC_11db);   // full 0-3.3 V range
  uint32_t sum = 0;
  for (int i = 0; i < 16; i++) { sum += analogRead(VBAT_PIN); delay(2); }
  float counts = sum / 16.0;
  float volts = counts / 4095.0 * 3.3 * 2.0;     // x2 for the divider
  return (uint16_t)(volts * 1000);
}`,
  after: `<p><code>RTC_DATA_ATTR</code> is the ESP32-specific detail that makes this work. Deep sleep powers
  down the main RAM, so ordinary globals are reinitialised on every wake and <code>setup()</code> runs from
  the top each time - the sketch has no <code>loop()</code> at all. Variables marked
  <code>RTC_DATA_ATTR</code> live in the small always-on RTC memory and survive, which is how the sequence
  number keeps counting.</p>
  <p><strong>Forced mode on the BME280</strong> is worth copying. By default the sensor measures continuously
  at around 3&nbsp;mA - which on a node that is awake for two seconds every ten minutes would still be a
  significant share of the budget, for readings nobody reads.</p>`
},
{
  h: 'Step 4: the base station',
  intro: `<p>Listens continuously, displays, and reports the signal quality that tells you whether the link
  is healthy or merely working.</p>`,
  name: 'lora_base.ino',
  code: `/* ------------------------------------------------------------------
   Base station - receives, displays, reports link quality.

   RSSI and SNR are the whole point of this display. A link at
   -80 dBm and one at -125 dBm both show the same temperature, and
   only one of them will survive a wet week.
   ------------------------------------------------------------------ */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "lora_config.h"

#define STALE_MS  1800000UL       // 3 missed reports at 10 min

Adafruit_SSD1306 oled(128, 64, &Wire, -1);

struct Packet {
  uint8_t  nodeId;
  uint16_t seq;
  int16_t  tempC100;
  uint16_t humidity100;
  uint16_t pressure10;
  uint16_t vbatMv;
} __attribute__((packed));

Packet pkt;
int lastRssi = 0;
float lastSnr = 0;
unsigned long lastRx = 0, received = 0;
uint16_t lastSeq = 0, missed = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oled.setTextColor(SSD1306_WHITE);
  }

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQ)) {
    Serial.println(F("radio failed"));
    while (1) delay(1000);
  }
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BW);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setSyncWord(LORA_SYNC);
  LoRa.receive();

  Serial.println(F("listening"));
  draw();
}

void loop() {
  int size = LoRa.parsePacket();
  if (size == sizeof(Packet)) {
    LoRa.readBytes((uint8_t *)&pkt, sizeof(pkt));

    // Read these IMMEDIATELY - they describe the packet just received
    // and are overwritten by the next one.
    lastRssi = LoRa.packetRssi();
    lastSnr  = LoRa.packetSnr();

    lastRx = millis();
    received++;
    if (lastSeq && pkt.seq > lastSeq + 1) missed += pkt.seq - lastSeq - 1;
    lastSeq = pkt.seq;

    Serial.print(F("#"));    Serial.print(pkt.seq);
    Serial.print(F("  "));   Serial.print(pkt.tempC100 / 100.0, 2);
    Serial.print(F(" C  ")); Serial.print(pkt.humidity100 / 100.0, 1);
    Serial.print(F(" %  ")); Serial.print(pkt.pressure10 / 10.0, 1);
    Serial.print(F(" hPa  bat ")); Serial.print(pkt.vbatMv);
    Serial.print(F(" mV  RSSI ")); Serial.print(lastRssi);
    Serial.print(F(" dBm  SNR ")); Serial.print(lastSnr, 1);
    Serial.print(F(" dB  missed ")); Serial.println(missed);

    draw();
  } else if (size > 0) {
    // Right sync word, wrong length: another node, or corruption.
    Serial.print(F("odd packet, ")); Serial.print(size); Serial.println(F(" bytes"));
    LoRa.receive();
  }

  static unsigned long lastDraw = 0;
  if (millis() - lastDraw > 1000) { lastDraw = millis(); draw(); }
}

void draw() {
  oled.clearDisplay();

  if (!lastRx) {
    oled.setTextSize(1);
    oled.setCursor(0, 28);
    oled.println(F("waiting for node..."));
    oled.display();
    return;
  }

  unsigned long ageS = (millis() - lastRx) / 1000;
  bool stale = (millis() - lastRx) > STALE_MS;

  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(pkt.tempC100 / 100.0, 1);
  oled.print((char)247); oled.println('C');

  oled.setTextSize(1);
  oled.setCursor(0, 20);
  oled.print(pkt.humidity100 / 100.0, 0); oled.print(F("% "));
  oled.print(pkt.pressure10 / 10.0, 0);   oled.print(F("hPa "));
  oled.print(pkt.vbatMv / 1000.0, 2);     oled.println(F("V"));

  // Signal quality, with a verdict rather than just a number.
  oled.setCursor(0, 32);
  oled.print(F("RSSI ")); oled.print(lastRssi);
  oled.print(F(" SNR "));  oled.println(lastSnr, 1);

  oled.setCursor(0, 42);
  oled.print(F("link: "));
  if      (lastRssi > -100) oled.println(F("strong"));
  else if (lastRssi > -115) oled.println(F("good"));
  else if (lastRssi > -125) oled.println(F("marginal"));
  else                      oled.println(F("on the edge"));

  // A bar for RSSI, -40 (full) to -130 (empty).
  int pct = constrain(map(lastRssi, -130, -40, 0, 100), 0, 100);
  oled.drawRect(0, 52, 128, 6, SSD1306_WHITE);
  oled.fillRect(0, 52, pct * 128 / 100, 6, SSD1306_WHITE);

  oled.setCursor(0, 60);
  if (stale) {
    oled.fillRect(0, 58, 128, 8, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
    oled.print(F(" NO REPORT ")); oled.print(ageS / 60); oled.print(F(" min"));
    oled.setTextColor(SSD1306_WHITE);
  } else {
    oled.print(ageS); oled.print(F("s ago  lost ")); oled.print(missed);
  }

  oled.display();
}`,
  after: `<p>Reading <code>packetRssi()</code> and <code>packetSnr()</code> immediately after
  <code>readBytes()</code> matters - they refer to the packet just received and the next one overwrites them.
  Reading them later gives you the noise floor, which looks like a plausible number and is wrong.</p>
  <p><strong>SNR is the more informative of the two.</strong> RSSI tells you how much signal arrived; SNR
  tells you how far above the noise it was. A positive SNR means a comfortable link. A negative SNR - and LoRa
  routinely works down to about -20&nbsp;dB - means you are decoding a signal weaker than the noise around it,
  which is exactly the situation where a little more noise, a wet tree or a passing van will break it.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong> under the esp32 package. Serial Monitor at
<strong>115200</strong>.</p>
<div class="note danger"><span class="t">Antenna on before the first upload</span>
<p>The node sketch transmits within a couple of seconds of booting. If the antenna is not already soldered on,
that first transmission is into an open circuit. Solder it first.</p></div>
<div class="note warn"><span class="t">The node sleeps, so it is hard to reprogram</span>
<p>Once deep sleep is working, the board is awake for about two seconds every ten minutes, and the IDE has to
catch it in that window. Hold the BOOT button while starting the upload and press EN (reset) - it will enter
the bootloader and stay there.</p>
<p>While developing, set <code>SLEEP_MINUTES</code> to 1 so there are more chances.</p></div>
<div class="note tip"><span class="t">Start at SF7 and work up</span>
<p><code>LORA_SF</code> is set to 9 as a reasonable default. For your first bench test set it to 7: the
packets are twenty-five times shorter, so problems surface faster and you spend no time waiting for
transmissions.</p></div>`,

tune: [
  { h: 'Pick the spreading factor from measurements, not ambition',
    body: `<p>The instinct is to set SF12 and feel safe. It is the wrong default.</p>
    <p>SF12 costs 25x the airtime and 25x the transmit energy of SF7, and the duty cycle then limits you to
    one message every 2.5 minutes. Walk the link, read the RSSI, and use the lowest SF with 10-15&nbsp;dB of
    margin. Most real installations are fine at SF8 or SF9.</p>` },
  { h: 'Getting the sleep current down',
    body: `<p>The sketch sleeps the ESP32 properly, but an ESP32 <em>DevKit</em> still draws 10-20&nbsp;mA
    because of its onboard AMS1117 regulator, CP2102 USB chip and power LED. That dwarfs everything else.</p>
    <p>In order of effort: cut the power LED trace (2-3&nbsp;mA, thirty seconds with a scalpel). Remove the
    AMS1117 and feed 3.3&nbsp;V directly from a low-quiescent regulator like an HT7333 (most of the rest).
    Or build the final node on a bare ESP32-WROOM module rather than a DevKit, which gets you to about
    10&nbsp;uA.</p>
    <p>At 10&nbsp;uA sleeping and two seconds of activity every ten minutes, a 2000&nbsp;mAh cell lasts well
    over a year. At 15&nbsp;mA it lasts five days. The DevKit is the entire difference.</p>` },
  { h: 'Antenna height, which beats everything',
    body: `<p>The radio horizon for two antennas at height h is roughly 4.12 x (sqrt(h1) + sqrt(h2))
    kilometres. Two metres each gives about 11&nbsp;km of horizon; at ground level it is under 5.</p>
    <p>Getting an antenna up to roof height routinely adds more than every software change combined, and it is
    free. Do this before you buy a better antenna.</p>` },
  { h: 'Acknowledgements, if you need them',
    body: `<p>Plain LoRa is fire-and-forget: the node does not know whether anything heard it. Adding an
    acknowledgement means the base transmits too, which costs it duty cycle as well, and means the node must
    stay awake to listen - typically 100&nbsp;mA for a few hundred milliseconds.</p>
    <p>For a sensor reporting every ten minutes, losing the occasional reading is usually fine and the
    sequence number tells you it happened. Add acknowledgements when a missed message actually matters.</p>` },
  { h: 'Region settings, properly',
    body: `<p><strong>EU (868 MHz):</strong> 14&nbsp;dBm maximum, 1% duty cycle in the 868.0-868.6 sub-band.
    The sketch's limits are correct as written.</p>
    <p><strong>US (915 MHz):</strong> no duty cycle limit, but FCC rules cap dwell time at 400&nbsp;ms per
    channel for this kind of operation - and SF12 at 125&nbsp;kHz exceeds that with a 20-byte payload. Use
    SF10 or below at 125&nbsp;kHz, or SF12 at 500&nbsp;kHz. Transmit power can go to 20&nbsp;dBm, which
    requires <code>LoRa.setTxPower(20, PA_OUTPUT_PA_BOOST_PIN)</code> and a module wired for PA_BOOST.</p>
    <p>Check your own national regulator. These are summaries, they change, and the fines are real.</p>` },
  { h: 'Several nodes on one base',
    body: `<p>The <code>nodeId</code> byte is already in the packet. Give each node its own and the base can
    keep separate state per node with no protocol change.</p>
    <p>Collisions are the thing to think about: two nodes transmitting simultaneously will usually lose both
    packets. With ten-minute intervals and sub-second airtimes, collisions are rare and the sequence numbers
    reveal them. Add a small random offset to each node's sleep time so two nodes that happen to align do not
    stay aligned.</p>` },
  { h: 'Solar, and sizing it honestly',
    body: `<p>A node averaging 200&nbsp;uA needs about 5&nbsp;mAh a day. A 1&nbsp;W 6&nbsp;V panel makes that
    in a few minutes of decent light, so the panel is enormously oversized - which is correct, because you are
    sizing for December in overcast conditions at a bad angle, not for June.</p>
    <p>Face it south (north in the southern hemisphere), tilt it steeply so rain washes it and winter sun hits
    it squarely, and keep the LiPo out of direct sun. Lithium cells must not be charged below 0&nbsp;&deg;C -
    if the node will freeze, the charger needs a temperature cut-off or you will damage the cell every
    winter.</p>` }
],

trouble: [
  { q: '<code>LoRa.begin()</code> returns false',
    a: `SPI or power. Check SS, RST and DIO0 against your sketch, check SCK/MISO/MOSI are on 18/19/23, and
    check VCC is 3.3&nbsp;V. Also check the module is the band you are asking for - calling
    <code>begin(868E6)</code> on a 433&nbsp;MHz module fails.` },
  { q: 'Both ends run fine and nothing is ever received',
    a: `One of the five shared settings differs. Frequency, spreading factor, bandwidth, coding rate, sync
    word - all five must match exactly. Print them at boot on both ends and compare line by line. This is the
    single most common LoRa problem and it looks exactly like broken hardware.` },
  { q: 'Range is a fraction of what was promised',
    a: `In order of likelihood: no antenna or a badly cut one, the antenna is inside a metal box, the two
    antennas are not both vertical, you are at SF7 when you need SF9, or the node is at ground level. Check
    the ambient RSSI at the base too - a nearby interferer eats your margin directly.` },
  { q: 'The module worked and now transmits weakly',
    a: `Almost certainly it was powered without an antenna at some point and the PA is damaged. It is not
    repairable. This is why the antenna goes on first.` },
  { q: 'Packets arrive but the values are nonsense',
    a: `The <code>Packet</code> struct differs between the two sketches, or the base is accepting packets of
    the wrong length. The base checks <code>size == sizeof(Packet)</code> for this reason - if you removed
    that check, put it back.` },
  { q: 'The node transmits once and never again',
    a: `Deep sleep is not being entered, or the board is browning out during transmission. Watch the serial
    output: if you never see "sleeping", something before that is blocking. If the board resets during
    transmit, the supply cannot deliver the 120&nbsp;mA burst - check the capacitor and the battery
    connection.` },
  { q: 'Battery lasts days instead of months',
    a: `Measure the sleep current directly with the meter in series. If it is over a milliamp, it is the
    DevKit's regulator and USB chip, not your code. See the tuning section - this is expected behaviour from a
    DevKit board and needs hardware changes, not software ones.` },
  { q: 'It works in winter and fails in summer',
    a: `Foliage. Leaves are mostly water and water absorbs 868&nbsp;MHz well - a link through a tree line can
    lose 10-20&nbsp;dB between February and July. This is why you site for 10-15&nbsp;dB of margin rather than
    at the edge.` },
  { q: 'RSSI looks fine but packets are still lost',
    a: `Look at SNR instead. A strong RSSI with a poor SNR means an interferer is raising the noise floor -
    something else is transmitting on your frequency. Change frequency slightly (867.5&nbsp;MHz is also in the
    EU band) and see if it improves.` },
  { q: 'A LoRaWAN gateway owner says I am polluting their network',
    a: `You are using sync word 0x34, which is reserved for LoRaWAN. Change it to anything else - the sketches
    use 0xF3. This is a real courtesy issue in cities and the fix is one line.` }
],

next: `
<ul>
  <li><strong>Add position to it.</strong> The <a href="project.html?p=gps-lora-tracker">GPS tracker</a> sends
  coordinates over this same link, and deals with the extra power and legal questions that come with it.</li>
  <li><strong>Send messages, not measurements.</strong> The
  <a href="project.html?p=lora-offgrid-messenger">off-grid messenger</a> puts two of these in your pockets
  with a screen on each.</li>
  <li><strong>Try the cheap short-range option first</strong> if you only need to cross a garden - the
  <a href="project.html?p=nrf24-sensor-link">nRF24 link</a> is a fifth of the price and has real
  acknowledgements.</li>
  <li><strong>Join The Things Network.</strong> Adding a LoRaWAN stack (MCCI LMIC, or an ESP32 LoRaWAN
  library) lets the node report through public gateways to the internet, with no base station of your own.
  More complexity, no receiver to maintain.</li>
  <li><strong>Put the base on the network.</strong> The base is already an ESP32 - a few lines of Wi-Fi turn
  it into an MQTT publisher and the readings land in Home Assistant.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Radio rules are law, not convention</span>
<ul>
  <li><strong>Never transmit without an antenna.</strong> It destroys the module, and it is the single most
  common way people kill an SX1276.</li>
  <li><strong>Respect the duty cycle.</strong> In the EU, 1% in the 868.0-868.6&nbsp;MHz sub-band. Nothing in
  the hardware enforces it. These bands are shared with alarm systems, medical telemetry and meter reading,
  and a node transmitting continuously at SF12 genuinely degrades them for everyone in range.</li>
  <li><strong>Use the band your country allocates.</strong> Transmitting on 915&nbsp;MHz in Europe or
  868&nbsp;MHz in the US is unlicensed operation on spectrum allocated to someone else - in many countries to
  mobile networks or emergency services. Check your national regulator; this book's summaries are not legal
  advice.</li>
  <li><strong>Stay within the power limit.</strong> 14&nbsp;dBm in the EU 868 band. The module will do 20 and
  the setting is one line away.</li>
</ul>
</div>
<div class="note danger"><span class="t">Lithium cells outdoors</span>
<ul>
  <li><strong>Use a protected charger board.</strong> The TP4056 with the DW01 protection chip, not the bare
  charger version. Over-discharge permanently damages a LiPo and over-charge is a fire risk.</li>
  <li><strong>Never charge a lithium cell below 0 &deg;C.</strong> It plates metallic lithium inside the cell,
  permanently reduces capacity and can cause an internal short later. An outdoor solar node in a cold climate
  needs a temperature cut-off - this is the most commonly ignored rule in hobby solar projects, and it is the
  one with the worst consequences.</li>
  <li><strong>Check the JST polarity with a meter</strong> before connecting a cell. Suppliers are not
  consistent, and reversing a lithium cell can vent it.</li>
  <li><strong>Keep the cell out of direct sun.</strong> Behind the panel, not beside it. Heat ages LiPos fast
  and a black box in July gets genuinely hot.</li>
</ul>
</div>`
});
