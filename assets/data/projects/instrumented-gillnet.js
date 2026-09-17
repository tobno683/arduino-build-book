/* A sensor problem disguised as a fishing problem: the signal is smaller than the noise. */
AB.addProject({
slug: 'instrumented-gillnet',
title: 'Fishing net that tells you where it caught something',
cat: 'cellular',
level: 5,
time: 'A winter of bench work, then a season of sea trials',
solder: true,
board: 'ESP32',
tags: ['gillnet', 'accelerometer', 'lis3dh', 'rs485', 'nb-iot', 'lte-m', 'marine', 'event detection', 'localisation', 'sea state'],
blurb: 'Accelerometers every eight metres along the headrope, a buoy with a cellular modem, and a message saying "something hit panel four, twenty minutes ago". The physics works. The sea is the problem.',

skills: ['Detecting a signal smaller than the noise', 'Adaptive thresholds', 'Sensor arrays over long distances', 'RS-485', 'Marine potting and corrosion', 'Low-power cellular telemetry'],

intro: `
<p>A gillnet is set and left. You come back in six or twelve hours and haul it, and until you do you have no
idea whether it is empty or full. Fish caught early are dead and spoiling by the time you arrive; a net that
caught nothing was a wasted trip.</p>
<p>So: instrument it. Accelerometers along the headrope, a surface buoy with a cellular modem, and a message
when something hits. That is the idea, and most of it genuinely works.</p>
<p><strong>Two parts of the obvious design do not, and it is worth knowing which before you spend any
money.</strong> Radio does not travel through water, so the sensors cannot talk wirelessly to the buoy - they
need a cable. And an accelerometer cannot tell you what species it caught, whatever anybody claims; it can tell
you roughly how big and how hard it fought.</p>
<p>What is left is still a good system, and the interesting engineering is that the thing you want to measure
is far smaller than the thing you cannot avoid measuring.</p>`,

what: [
  'Detect a strike anywhere along a 50 to 100 metre net.',
  'Say which panel it happened in, to about one sensor spacing.',
  'Report over NB-IoT or LTE-M from a buoy, with a GPS fix so you can find the net again.',
  'Estimate roughly how big the thing was, from how much energy the strike carried.',
  'Adapt its own threshold to the sea state, so it is not useless in a swell and deaf in a flat calm.',
  'Survive weeks in salt water without being opened.'
],

how: `
<p><strong>The signal-to-noise problem, which is the whole project.</strong> A 2&nbsp;kg fish hitting a net
delivers a brief impulse - maybe 10 to 20&nbsp;newtons over a tenth of a second. Meanwhile the net is being
heaved by waves with far more force than that, continuously.</p>
<p>You are not going to out-measure the sea. You separate them in <strong>frequency</strong>:</p>
<ul>
  <li><strong>Wave motion</strong> is 0.05-0.5&nbsp;Hz - swell periods of two to twenty seconds. Large,
  smooth, and relentless.</li>
  <li><strong>Current and gear noise</strong> sits low too, plus some flutter.</li>
  <li><strong>A strike</strong> is a transient with energy up to tens of hertz, because it is an impact into a
  tensioned line rather than a slow displacement.</li>
</ul>
<p>So: high-pass at about 3&nbsp;Hz and the swell disappears. What is left is small, and your detector works on
that. This is the same trick the published float-sensor patents use - discriminating a bite from wave motion by
rise time or by spectrum - and it is the only approach that survives contact with real water.</p>

<p><strong>The threshold has to move with the sea.</strong> A fixed trigger level is wrong twice: on a flat
calm it is far too high and misses everything, and in a force 5 it fires continuously.</p>
<p>Track the recent background - a running median of the high-passed energy over a few minutes - and set the
threshold as a multiple of that. Now the detector is measuring "unusual compared to the last five minutes",
which is the actual question, and it degrades honestly: in bad weather the threshold rises, sensitivity drops,
and it should tell you that rather than pretending.</p>

<p><strong>Localisation: two methods, and the easy one is good enough.</strong></p>
<p><strong>Amplitude ranking.</strong> The node nearest the strike sees the largest signal, because vibration
attenuates along a wet net quickly. Compare the peak energy at each node in the same 200&nbsp;ms window and the
biggest one wins. That gives you "between node 3 and node 4" - a panel, eight metres of net. For deciding
where to start hauling, that is plenty.</p>
<p><strong>Time of arrival.</strong> The ambitious version. A transverse wave on a tensioned rope travels at
<code>v = sqrt(T/mu)</code> - tension over linear density. A headrope at 500&nbsp;N with 0.05&nbsp;kg/m gives
about 100&nbsp;m/s, so a strike takes roughly 80&nbsp;milliseconds to reach a node eight metres away. That is
easily measurable, and the difference in arrival times across three nodes locates the strike to within a metre
or two.</p>
<p>The catch is that it needs the nodes' clocks aligned to about a millisecond, which over a shared bus means a
sync pulse from the master before each measurement window. It also needs the rope tension, which changes with
the tide. Build amplitude ranking first; treat TDOA as the upgrade.</p>

<p><strong>Radio does not work underwater, so the bus is a cable.</strong> Seawater absorbs 2.4&nbsp;GHz within
centimetres - a BLE node 30&nbsp;cm down is invisible. Acoustic modems work and cost more than this entire
project.</p>
<p>The net already has a rope running its full length, so run a cable beside it: <strong>RS-485</strong> on a
twisted pair, which is differential, noise-immune and good for a kilometre. Two more cores carry power, so the
nodes need no batteries at all and only the buoy does. That single decision removes most of the maintenance
from the design.</p>

<p><strong>What you can honestly say about the catch.</strong> Strike energy correlates with size, roughly.
Struggle duration and repeat strikes tell you something about how lively it is. That is about it.</p>
<p>Species identification from an accelerometer is not a thing. A big cod and a similarly-sized seal hitting the
net produce broadly similar traces, and the seal is the more important event. Anyone selling species ID from
vibration alone is selling you a model trained on their water, not yours.</p>

<p><strong>Power, honestly.</strong> The buoy is the only thing with a battery. A cellular modem transmitting is
a few hundred milliamps for a couple of seconds; the rest of the time everything sleeps. Report on an event, plus
a heartbeat every few hours, and a 2000&nbsp;mAh cell with a small solar panel runs indefinitely in summer and
needs help in a northern winter.</p>
<p>NB-IoT over LTE-M because coverage matters more than bandwidth here, and you are sending forty bytes.</p>`,

bom: [
  { id: 'lis3dh', qty: 6, note: 'One per node. The activity interrupt and the FIFO are why this rather than an MPU6050 - the node sleeps until the accelerometer wakes it.' },
  { id: 'nano', qty: 6, note: 'One per node. Cheap, and with the regulator and LED removed it sleeps at microamps. It only has to filter, detect and answer the bus.' },
  { id: 'rs485', qty: 7, note: 'One per node plus one at the buoy. The two at the physical ends of the cable need their termination jumpers on; the middle ones must not.' },
  { id: 'cable-4c', qty: 2, note: 'Power pair plus a twisted data pair, along the headrope. Tinned copper, and buy more than you think - you will re-terminate it.' },
  { id: 'potting', qty: 1, note: 'Each node is fully encapsulated. There is no lid, no seal and no way in.' },
  { id: 'esp32', qty: 1, note: 'The buoy. Bus master, detector arbitration, and it talks to the modem.' },
  { id: 'sim7080g', qty: 1, note: 'NB-IoT and LTE-M. Coverage matters and bandwidth does not - the whole message is a few dozen bytes.' },
  { id: 'iot-sim', qty: 1, note: 'An M2M data SIM. A phone SIM works and will be expensive and may be cut off for unusual usage.' },
  { id: 'lte-ant', qty: 1, note: 'The antenna must be above water and as high on the buoy as you can put it.' },
  { id: 'gps', qty: 1, note: 'So the message says where the net is. Nets drift, and nets get moved.' },
  { id: 'lipo2000', qty: 1, note: 'Buoy only. The nodes are powered down the cable.' },
  { id: 'solar6v', qty: 1, note: 'Keeps the buoy alive between trips. See the note about winter latitudes.' },
  { id: 'tp4056', qty: 1 },
  { id: 'box-ip65', qty: 1, note: 'The buoy electronics. It sits in spray permanently and gets submerged by waves.' },
  { id: 'res4k7', qty: 2, note: 'Bus bias resistors at the master end - see the wiring notes, an idle RS-485 line without them floats and produces phantom bytes.' },
  { id: 'perfboard', qty: 2 },
  { id: 'heatshrink', qty: 1, note: 'Adhesive-lined, the marine kind. Ordinary heatshrink wicks salt water along the conductor.' },
  { id: 'hookup', qty: 1, own: true },
  { id: 'dmm', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',  at: [0, 96] },
    { id: 'modem',comp: 'lte',    at: [68, 40] },
    { id: 'gps',  comp: 'gps',    at: [-66, 40] },
    { id: 'bb',   comp: 'bb400',  at: [0, 24] },
    { id: 'm485', comp: 'rs485',  at: [-4, -30] },
    { id: 'chg',  comp: 'tp4056', at: [64, -22] },
    { id: 'node', comp: 'nano',   at: [-58, -78] },
    { id: 'acc',  comp: 'lis3dh', at: [10, -84] },
    { id: 'n485', comp: 'rs485',  at: [62, -82] }
  ],
  wires: [
    { from: 'mcu.3V3',   to: 'bb.T+1',   color: 'red',    note: '3.3 V rail in the buoy' },
    { from: 'mcu.GND',   to: 'bb.T-1',   color: 'black',  note: 'Ground rail' },
    { from: 'chg.OUT+',  to: 'bb.T+28',  color: 'red',    note: 'Battery rail from the charger, feeding the buoy and the net cable' },
    { from: 'chg.OUT-',  to: 'bb.T-28',  color: 'black',  note: 'Battery negative' },
    { from: 'modem.VCC', to: 'bb.T+24',  color: 'red',    note: 'Modem power - straight from the cell, not through the regulator' },
    { from: 'modem.GND', to: 'bb.T-24',  color: 'black',  note: 'Modem ground' },
    { from: 'modem.TXD', to: 'mcu.RX2',  color: 'green',  note: 'Modem to ESP32 serial' },
    { from: 'modem.RXD', to: 'mcu.TX2',  color: 'blue',   note: 'ESP32 to modem serial' },
    { from: 'modem.PWR', to: 'mcu.D4',   color: 'white',  note: 'Power-key line, so the sketch can start and stop the modem' },
    { from: 'gps.VCC',   to: 'bb.T+5',   color: 'red',    note: 'GPS power' },
    { from: 'gps.GND',   to: 'bb.T-5',   color: 'black',  note: 'GPS ground' },
    { from: 'gps.TX',    to: 'mcu.D16',  color: 'green',  note: 'GPS NMEA out' },
    { from: 'gps.RX',    to: 'mcu.D17',  color: 'blue',   note: 'GPS in' },
    { from: 'm485.VCC',  to: 'bb.T+11',  color: 'red',    note: 'Master transceiver power' },
    { from: 'm485.GND',  to: 'bb.T-11',  color: 'black',  note: 'Master transceiver ground' },
    { from: 'm485.DI',   to: 'mcu.D25',  color: 'green',  note: 'Bus transmit' },
    { from: 'm485.RO',   to: 'mcu.D26',  color: 'blue',   note: 'Bus receive' },
    { from: 'm485.DE',   to: 'mcu.D27',  color: 'yellow', note: 'Driver enable - tied to RE, one pin controls both directions' },
    { from: 'm485.RE',   to: 'mcu.D27',  color: 'yellow', note: 'Receiver enable, same pin' },
    { from: 'm485.A',    to: 'n485.A',   color: 'brown',  note: 'Bus A down the headrope - one twisted pair, node to node' },
    { from: 'm485.B',    to: 'n485.B',   color: 'brown',  note: 'Bus B, the other half of the pair' },
    { from: 'n485.VCC',  to: 'node.5V',  color: 'red',    note: 'Node transceiver power, from the cable' },
    { from: 'n485.GND',  to: 'node.GND', color: 'black',  note: 'Node ground' },
    { from: 'n485.RO',   to: 'node.D2',  color: 'blue',   note: 'Node receives' },
    { from: 'n485.DI',   to: 'node.D3',  color: 'green',  note: 'Node transmits' },
    { from: 'n485.DE',   to: 'node.D4',  color: 'yellow', note: 'Node direction control' },
    { from: 'acc.VIN',   to: 'node.5V',  color: 'red',    note: 'Accelerometer power' },
    { from: 'acc.GND',   to: 'node.GND2',color: 'black',  note: 'Accelerometer ground' },
    { from: 'acc.SDA',   to: 'node.A4',  color: 'green',  note: 'I2C data - a few centimetres inside the potted node, never down the cable' },
    { from: 'acc.SCL',   to: 'node.A5',  color: 'blue',   note: 'I2C clock' },
    { from: 'acc.INT',   to: 'node.D2',  color: 'white',  note: 'Activity interrupt - this is what wakes the sleeping node' }
  ]
},

wireIntro: `<p>The buoy is on the left of the model and one node on the right; five more nodes are identical,
tapped onto the same four-core cable. The long run between them is the twisted pair and the power pair -
<strong>never I2C</strong>, which manages about half a metre.</p>`,

wireNotes: `
<div class="note danger"><span class="t">Radio does not go through water</span>
<p>This is the design constraint that kills the obvious version of this project. Seawater absorbs 2.4&nbsp;GHz
within a few centimetres, so a BLE or Wi-Fi node hanging 30&nbsp;cm below the surface simply cannot be heard.
LoRa at 868&nbsp;MHz is no better underwater.</p>
<p>The cable is not a compromise you make to save money. It is the only thing that works, and it brings the
bonus that the nodes need no batteries.</p></div>

<div class="note warn"><span class="t">Terminate at both ends and nowhere else</span>
<p>RS-485 needs 120&nbsp;ohm across the pair at each physical end of the cable - the buoy and the last node.
The modules have a jumper for it. Fit the middle ones with termination too and the signal is loaded down until
nothing reads reliably.</p>
<p>The idle bus also needs bias: a 4.7&nbsp;k pull-up on A and pull-down on B at the master. Without them an
idle line floats and the receivers see random bytes, which presents as phantom nodes reporting nonsense.</p></div>

<div class="note warn"><span class="t">Every node must release the bus</span>
<p>Only one device may drive an RS-485 pair at a time. A node that leaves DE high after answering jams the
whole net - every other node goes silent and it looks like a cable fault.</p>
<p>Drop DE immediately after the last byte has actually left the UART, not after you call <code>write()</code>.
That distinction costs people a day.</p></div>

<div class="note tip"><span class="t">Tinned copper, and adhesive heatshrink</span>
<p>Salt water wicks along stranded copper under the insulation, sometimes half a metre from a nick, and corrodes
it open from the inside. Tinned conductors resist it, and adhesive-lined heatshrink seals the ends properly.</p>
<p>A connection that measures fine on the bench and fails after three weeks at sea is almost always this.</p></div>`,

solderIntro: `<p>Build and prove the whole system on a bench - literally on a rope stretched across a room -
before anything goes near water. Sea trials cost a day each and you cannot debug from shore.</p>`,

solderSteps: [
  { h: 'One node, on a table, tapping the rope with a finger',
    body: `<p>Nano, LIS3DH, MAX485, potted in nothing yet. Stretch eight metres of rope across the room, tie
    the node to it, and tap it at various distances.</p>
    <p>You should see a clear transient. If you cannot detect a finger tap at two metres on a dry rope in a
    quiet room, you will not detect a fish at sea, and everything after this is wasted effort.</p>` },
  { h: 'Two nodes, and check the localisation logic',
    body: `<p>Same rope, nodes at each end. Tap near one and confirm the amplitude comparison picks the right
    one. Tap in the middle and confirm it is ambiguous, which it should be.</p>
    <p>This is also where you find out whether your bus arbitration works, because both nodes want to talk at
    once.</p>` },
  { h: 'Strip the Nanos for power',
    body: `<p>Remove the power LED and the onboard regulator from each node board. That takes a Nano from
    19&nbsp;mA to microamps asleep. The nodes are cable-powered so this matters less than usual - but the buoy
    is supplying all six down a long thin cable, and it adds up.</p>` },
  { h: 'Terminations and bias, written on the board',
    body: `<p>Termination jumper on the buoy transceiver and the last node only. Bias resistors at the buoy.
    Mark each node with its address and whether it is terminated, in permanent marker, before potting - you
    cannot check afterwards.</p>` },
  { h: 'Pot each node completely',
    body: `<p>Suspend the board in a small mould, cable already soldered and strain-relieved, and fill with
    epoxy so there is no air anywhere. Let it cure fully.</p>
    <p>Potting rather than a sealed box because a box has a seal, and a seal has one job it eventually fails
    at. A solid block has nothing to fail. The cost is that a faulty node is now scrap.</p>` },
  { h: 'Strain relief at every cable entry',
    body: `<p>The net gets hauled, and hauling pulls on everything. Each node needs the cable mechanically
    anchored to the potted block and to the rope, so the load path never runs through a solder joint.</p>
    <p>Whip the cable to the headrope every half metre. A loop of loose cable finds a way to snag.</p>` },
  { h: 'Buoy build, antenna as high as it goes',
    body: `<p>ESP32, modem, GPS, charger and solar in the IP65 box, with the antenna at the top of the buoy
    mast. A cellular antenna at water level is barely an antenna - it wants every centimetre of height you can
    give it.</p>
    <p>Vents facing down, glands from below, and the desiccant sachet that comes with something else.</p>` },
  { h: 'A full dry rehearsal, for a week',
    body: `<p>Leave the whole system running in a garden with the rope pegged out. You will find the flat
    battery, the modem that never reconnects after losing signal, and the node that stops answering at 3 am -
    all of which are much cheaper to find on land.</p>` }
],

libraries: [
  { name: 'Adafruit LIS3DH', by: 'Adafruit', why: 'Accelerometer, with FIFO and the activity-interrupt configuration this design depends on.' },
  { name: 'TinyGPSPlus', by: 'Mikal Hart', why: 'Parses NMEA from the GPS without eating the RAM a String-based parser would.' },
  { name: 'TinyGSM', by: 'Volodymyr Shymanskyy', why: 'Drives the SIM7080G. Handles the AT command tedium and the NB-IoT attach sequence.' },
  { name: 'Low-Power', by: 'Rocket Scream', why: 'Puts the node ATmega into proper sleep between interrupts.' }
],

code: [{
  name: 'net_node.ino',
  code: `/* ------------------------------------------------------------------
   Net node - Nano + LIS3DH + MAX485

   Sleeps until the accelerometer says something happened, measures the
   transient, and reports it when the master asks.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_LIS3DH.h>
#include <LowPower.h>

#define NODE_ADDR   3          // unique per node, set before potting
#define DE_PIN      4
#define INT_PIN     2

Adafruit_LIS3DH accel = Adafruit_LIS3DH();

/* High-pass corner. Swell is 0.05-0.5 Hz and is enormous; a strike has
   energy well above 3 Hz. Everything this project can detect lives in
   that gap. */
const float HP_ALPHA = 0.90f;   // ~3 Hz at 50 Hz sampling

float hpX = 0, lastX = 0;
float background = 2.0f;        // running estimate of ambient energy
volatile bool woken = false;

struct Event {
  uint32_t at;
  uint16_t peak;
  uint16_t duration;
  bool pending;
} ev = {0, 0, 0, false};

void setup() {
  Serial.begin(19200);
  pinMode(DE_PIN, OUTPUT);
  digitalWrite(DE_PIN, LOW);        // receive by default - never hog the bus
  pinMode(INT_PIN, INPUT_PULLUP);

  if (!accel.begin(0x18)) { while (1) delay(1000); }
  accel.setRange(LIS3DH_RANGE_4_G);
  accel.setDataRate(LIS3DH_DATARATE_50_HZ);

  /* The activity interrupt is why this chip and not an MPU6050: it can
     wake the Nano from real sleep instead of the Nano polling forever. */
  accel.setClick(0, 0);
  configureActivityInterrupt(12);

  attachInterrupt(digitalPinToInterrupt(INT_PIN), onMotion, FALLING);
}

void loop() {
  if (!woken && !ev.pending) {
    // Nothing happening. Sleep until the accelerometer or the bus wakes us.
    LowPower.powerDown(SLEEP_FOREVER, ADC_OFF, BOD_OFF);
  }
  woken = false;

  measureTransient();
  serveBus();
}

void onMotion() { woken = true; }

/* Sample hard for a short window and characterise what just happened.
   Peak amplitude goes to the master for the amplitude-ranking comparison;
   duration separates a single thump from a fish thrashing. */
void measureTransient() {
  uint16_t peak = 0;
  uint16_t aboveCount = 0;
  uint32_t t0 = millis();

  while (millis() - t0 < 400) {
    sensors_event_t a;
    accel.getEvent(&a);

    // One-pole high pass: subtract the slow-moving part, keep the rest.
    float x = a.acceleration.x;
    hpX = HP_ALPHA * (hpX + x - lastX);
    lastX = x;

    uint16_t mag = (uint16_t)(fabs(hpX) * 100);
    if (mag > peak) peak = mag;

    /* Adaptive threshold. A fixed level is wrong twice over: deaf on a
       flat calm, screaming in a swell. Compare against the recent
       background instead, so the question is "unusual for right now". */
    if (mag > background * 4) aboveCount++;

    // Slow background tracker - rises quickly, falls slowly.
    background = (mag > background)
               ? background * 0.995f + mag * 0.005f
               : background * 0.9995f + mag * 0.0005f;

    delay(15);
  }

  if (aboveCount >= 3) {
    ev.at = millis();
    ev.peak = peak;
    ev.duration = aboveCount * 15;
    ev.pending = true;
  }
}

/* The master polls each address in turn. Only one device may drive the
   pair at a time, so DE goes high only while we are actually sending. */
void serveBus() {
  if (!Serial.available()) return;

  char c = Serial.read();
  if (c != ('A' + NODE_ADDR)) return;     // not for us

  digitalWrite(DE_PIN, HIGH);
  delayMicroseconds(50);

  Serial.print(NODE_ADDR);
  Serial.print(',');
  Serial.print(ev.pending ? ev.peak : 0);
  Serial.print(',');
  Serial.print(ev.pending ? ev.duration : 0);
  Serial.print(',');
  Serial.println((uint16_t)background);

  /* Wait for the UART to actually finish. Dropping DE after write()
     returns cuts the last byte off and the master sees a corrupt reply -
     which looks exactly like a cable fault and is not. */
  Serial.flush();
  delayMicroseconds(50);
  digitalWrite(DE_PIN, LOW);

  ev.pending = false;
}

void configureActivityInterrupt(uint8_t threshold) {
  accel.writeRegister8(LIS3DH_REG_CTRL3, 0x40);   // AOI1 to INT1
  accel.writeRegister8(LIS3DH_REG_INT1THS, threshold);
  accel.writeRegister8(LIS3DH_REG_INT1DUR, 2);
  accel.writeRegister8(LIS3DH_REG_INT1CFG, 0x2A); // high on any axis
}`
}, {
  name: 'net_buoy.ino',
  code: `/* ------------------------------------------------------------------
   Buoy - ESP32 + SIM7080G + GPS + RS-485 master

   Polls the nodes, decides where the strike was, and sends a short
   message over NB-IoT.
   ------------------------------------------------------------------ */

#define TINY_GSM_MODEM_SIM7080
#include <TinyGsmClient.h>
#include <TinyGPSPlus.h>

#define DE_PIN     27
#define MODEM_PWR   4
#define N_NODES     6
#define SPACING_M   8.0f

HardwareSerial bus(1);
HardwareSerial modemSerial(2);
TinyGsm modem(modemSerial);
TinyGPSPlus gps;

struct Reading { uint16_t peak, duration, background; bool ok; };
Reading nodes[N_NODES];

unsigned long lastHeartbeat = 0;

void setup() {
  Serial.begin(115200);
  pinMode(DE_PIN, OUTPUT);
  digitalWrite(DE_PIN, LOW);

  bus.begin(19200, SERIAL_8N1, 26, 25);          // RO, DI
  modemSerial.begin(115200, SERIAL_8N1, 16, 17);

  pinMode(MODEM_PWR, OUTPUT);
  startModem();
}

void loop() {
  pollAllNodes();

  int hit = strongestNode();
  if (hit >= 0) {
    float position = hit * SPACING_M;
    reportStrike(hit, position);
  }

  // A silent system is ambiguous - it might be fine, it might be dead.
  if (millis() - lastHeartbeat > 6UL * 3600 * 1000) {
    lastHeartbeat = millis();
    reportHeartbeat();
  }

  delay(2000);
}

void pollAllNodes() {
  for (int i = 0; i < N_NODES; i++) {
    nodes[i].ok = false;

    digitalWrite(DE_PIN, HIGH);
    delayMicroseconds(50);
    bus.write('A' + i);
    bus.flush();
    delayMicroseconds(50);
    digitalWrite(DE_PIN, LOW);

    unsigned long t0 = millis();
    String line = "";
    while (millis() - t0 < 120) {
      if (bus.available()) {
        char c = bus.read();
        if (c == '\\n') break;
        line += c;
      }
    }

    int addr;
    if (sscanf(line.c_str(), "%d,%hu,%hu,%hu", &addr, &nodes[i].peak,
               &nodes[i].duration, &nodes[i].background) == 4 && addr == i) {
      nodes[i].ok = true;
    }
  }
}

/* Amplitude ranking. Vibration attenuates quickly along a wet net, so
   the nearest node sees the largest peak. This resolves to one panel -
   about eight metres - which is all you need to know where to start
   hauling. Time-of-arrival does better and needs synchronised clocks. */
int strongestNode() {
  int best = -1;
  uint16_t bestPeak = 0;

  for (int i = 0; i < N_NODES; i++) {
    if (!nodes[i].ok || nodes[i].peak == 0) continue;
    if (nodes[i].peak > bestPeak) { bestPeak = nodes[i].peak; best = i; }
  }
  if (best < 0) return -1;

  /* If two neighbours are within 20% of each other the strike was
     between them and we should say so rather than picking one. */
  return best;
}

void reportStrike(int node, float metres) {
  char msg[160];
  snprintf(msg, sizeof(msg),
    "STRIKE node=%d at=%.0fm size=%s fight=%dms sea=%d lat=%.5f lon=%.5f",
    node, metres,
    nodes[node].peak > 600 ? "large" : nodes[node].peak > 250 ? "medium" : "small",
    nodes[node].duration,
    nodes[node].background,
    gps.location.lat(), gps.location.lng());

  send(msg);
}

void reportHeartbeat() {
  int alive = 0;
  for (int i = 0; i < N_NODES; i++) if (nodes[i].ok) alive++;

  char msg[120];
  snprintf(msg, sizeof(msg), "ALIVE nodes=%d/%d sea=%d batt=%d lat=%.5f lon=%.5f",
           alive, N_NODES, nodes[0].background, batteryPercent(),
           gps.location.lat(), gps.location.lng());
  send(msg);
}

void send(const char* msg) {
  Serial.println(msg);
  // NB-IoT attach, send, detach. A few dozen bytes, a couple of seconds
  // of radio, and back to sleep - which is the whole power budget.
  if (!modem.isNetworkConnected()) modem.gprsConnect("your-apn", "", "");
  // ... publish over MQTT or a plain HTTP POST here ...
}

int batteryPercent() {
  int raw = analogRead(35);
  return map(constrain(raw, 1900, 2450), 1900, 2450, 0, 100);
}

void startModem() {
  digitalWrite(MODEM_PWR, LOW);  delay(100);
  digitalWrite(MODEM_PWR, HIGH); delay(1000);
  digitalWrite(MODEM_PWR, LOW);
  modem.restart();
  modem.setNetworkMode(38);      // LTE only
  modem.setPreferredMode(1);     // CAT-M, or 2 for NB-IoT
}`
}],

trouble: [
  { q: 'It fires constantly in any sea at all',
    a: `The high-pass corner is too low, so swell energy is leaking into the detector. Raise it towards
    5&nbsp;Hz and check the adaptive background is actually tracking - print it and watch it rise as the
    weather does.` },
  { q: 'It detects nothing, ever, including a deliberate tug',
    a: `Test on a dry rope indoors first. If a finger tap at two metres does not show, the problem is
    mechanical coupling - the node is not rigidly attached to the rope, or it is mounted on floating line that
    absorbs everything.` },
  { q: 'All nodes report the same peak',
    a: `They are seeing the buoy or the boat, not the net. Also check they are not all reporting the bus noise
    floor - a peak that never changes is usually a stuck reading rather than a real one.` },
  { q: 'One node stops answering and then all of them do',
    a: `A node has left DE high and is jamming the pair. That is the failure mode of a shared bus, and it is
    almost always a missing <code>Serial.flush()</code> before dropping DE.` },
  { q: 'Random garbage bytes when the net is idle',
    a: `No bias resistors. An undriven RS-485 pair floats and the receivers invent data. 4.7&nbsp;k pull-up on
    A and pull-down on B at the master.` },
  { q: 'Works on the bench, fails after three weeks at sea',
    a: `Water has wicked along a stranded conductor under the insulation and corroded it open. Tinned copper
    and adhesive-lined heatshrink at every termination. Check the cable where it flexes most, near the buoy.` },
  { q: 'Nodes drop out one at a time down the length of the net',
    a: `Volt drop on the power pair. Six nodes at the far end of 100&nbsp;m of thin cable may be below the
    regulator dropout. Measure at the last node under load, and raise the supply voltage rather than the
    current.` },
  { q: 'The modem attaches on land and never at sea',
    a: `Antenna height. A cellular antenna at wave level is shadowed by every swell. Get it to the top of the
    buoy mast, and expect to lose signal in troughs regardless - retry rather than assuming failure.` },
  { q: 'Lots of strikes, empty net',
    a: `Seals, dolphins, debris, and the net catching the bottom on a tide change all produce good transients.
    This is the honest limitation: you are detecting impacts, not fish. Duration helps - a seal working the net
    produces repeated long events, weed produces one and nothing more.` },
  { q: 'The battery is flat after two weeks in October',
    a: `Solar at northern latitudes in winter is close to useless. Either a much bigger panel, a much bigger
    battery, or accept swapping the cell each trip.` }
],

safety: `
<div class="note danger"><span class="t">The sea, first</span>
<p>Everything else on this page is secondary to this. Hauling gear is where fishing injuries happen, and adding
a cable, connectors and hard potted lumps to a net adds snag points to a rope already under tension.</p>
<ul>
  <li><strong>Nothing on the net may create an entanglement hazard.</strong> No loose loops of cable, no
  projecting hardware, nothing that can catch a hand or an oilskin during a haul.</li>
  <li><strong>The net must remain safe to cut away</strong> in an emergency. Do not add anything that makes
  that harder.</li>
  <li><strong>Never work on the gear while it is under tension</strong>, and keep the electronics out of the
  hauling path entirely.</li>
  <li><strong>A telemetry system is not a reason to set more gear than you can haul.</strong> If the message
  does not arrive, the net still has to be checked on schedule.</li>
</ul></div>

<div class="note warn"><span class="t">Lost gear keeps fishing</span>
<p>A lost gillnet goes on catching for years, and that is the single biggest environmental harm associated with
this kind of gear. Adding electronics makes a net more expensive to abandon and more likely to be recovered,
which is a genuine argument in favour of it - but only if the GPS position is logged and kept.</p>
<p>Store every heartbeat position. If the net goes missing, its last known location is the thing that lets
somebody retrieve it.</p></div>

<div class="note warn"><span class="t">Rules, which are local and not optional</span>
<p>Fishing gear is regulated everywhere and the rules differ by country, by water and often by season. Gillnets
in particular are restricted or banned in many places, and where they are allowed there are usually
requirements about marking, buoys, lights, maximum soak time and how the gear is identified.</p>
<p>Adding electronics does not change any of that, and a buoy carrying a transmitter may itself need to comply
with marking rules. Check with your local fisheries authority before setting anything, and if you are doing
this recreationally, check whether the gear is permitted for you at all.</p></div>

<div class="note"><span class="t">Lithium and salt water</span>
<p>The usual rules apply, plus one more: a lithium cell in a flooded enclosure with salt water is a fire and a
corrosive mess. Fuse the cell, keep it in the driest part of the buoy, and do not charge below
0&nbsp;degrees - which in a winter sea is most of the time.</p></div>`,

next: `
<ul>
  <li><strong>Time-of-arrival localisation.</strong> Sync the nodes with a pulse from the master and compare
  arrival times rather than amplitudes. A metre or two instead of eight, and it is a genuinely satisfying piece
  of physics - though you will need the rope tension, which changes with the tide.</li>
  <li><strong>Learn what your own water sounds like.</strong> Log raw traces for a season alongside what you
  actually hauled. That labelled dataset is the only honest route to saying anything about size or species, and
  it has to be your water and your gear - the <a href="project.html?p=ai-plant-doctor">domain shift</a> problem
  applies exactly.</li>
  <li><strong>A depth sensor on the footrope</strong>, so you know whether the net is fishing properly or has
  been rolled up by the tide. That failure is invisible to an accelerometer and ruins a set.</li>
  <li><strong>Report soak time</strong>, not just strikes. The most valuable output may simply be "the first
  fish has been in the net for four hours", because that is the number that decides quality.</li>
  <li><strong>Try it on something smaller first.</strong> A single sensor on a rod or a longline is the same
  detection problem with a tenth of the deployment cost, and everything you learn transfers.</li>
</ul>`
});
