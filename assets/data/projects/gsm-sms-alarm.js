/* SIM800L: AT commands, a 2 A transmit burst, and an honest word about the 2G sunset. */
AB.addProject({
slug: 'gsm-sms-alarm',
title: 'SMS alarm that texts you',
cat: 'cellular',
level: 2,
time: '4 hours',
solder: true,
board: 'Nano',
tags: ['sim800l', 'gsm', '2g', 'sms', 'at commands', 'alarm', 'pir', 'no wifi'],
blurb: 'A sensor somewhere with no Wi-Fi sends a text to your phone. Fifteen dollars, works from a shed or a field - and the clearest possible introduction to AT commands.',

skills: ['AT commands', 'Cellular power bursts', 'SIM cards and PIN handling', 'SMS encoding', 'Network registration', 'Serial protocol design'],

intro: `
<p>Every cellular module ever made is controlled the same way: you open a serial port and type commands that
start with <code>AT</code>. The convention is from Hayes modems in 1981 and it has outlived almost everything
else in computing. Learn it on a $5 module and you can drive a $280 5G modem, because the interface barely
changed.</p>
<p>This project is that lesson, wrapped around something useful: a sensor that texts you. No Wi-Fi, no hub,
no account, no app - just a message on your phone when the shed door opens or the water level rises.</p>
<p><strong>The honest caveat, up front:</strong> the SIM800L is 2G only, and 2G is being switched off.
Australia, Japan, Singapore, Switzerland, Taiwan and most US carriers have already done it; much of Europe is
scheduled through the late 2020s. Check your country before you build this to keep. It remains the cheapest
and clearest way to learn AT commands, and the
<a href="project.html?p=lte-remote-monitor">LTE project</a> is the one to build if you want it to still work
in five years.</p>`,

what: [
  'Send an SMS from an Arduino when a sensor triggers, to any phone number.',
  'Accept commands back by SMS - ask it for a status report, arm it, disarm it.',
  'Survive the module’s 2 A transmit bursts, which is the thing everyone gets wrong first.',
  'Report signal strength and network registration, so a failure to send is diagnosable.',
  'Rate-limit itself, so a stuck sensor cannot send four hundred texts overnight.',
  'Read AT command responses properly rather than guessing with delays.'
],

how: `
<p><strong>AT commands.</strong> The module is a serial device that speaks lines of text. You send
<code>AT</code>, it answers <code>OK</code>. You send <code>AT+CSQ</code>, it answers with the signal
strength. Every cellular modem in this book works this way.</p>
<p>The convention: commands are uppercase, terminated with carriage return. Responses come back as one or more
lines, ending in <code>OK</code> or <code>ERROR</code>. Some commands also emit unsolicited lines later -
<code>+CMTI</code> when a text arrives, for instance - which is why the sketch reads continuously rather than
only after sending something.</p>

<p><strong>The power problem, which is the real content of this project.</strong></p>
<p>A GSM module transmits in bursts. GSM is time-division: your phone gets one slot in eight, so it transmits
for about 577&nbsp;microseconds and then stays quiet for 4&nbsp;ms. During that burst it can pull
<strong>2 amps</strong>.</p>
<p>Average current is modest - maybe 100&nbsp;mA - so a naive measurement suggests a small supply is fine. It
is not. The burst is what matters, and the symptoms of an inadequate supply are maddening: the module
registers on the network and then resets, or works indoors near a tower and fails at the edge of a cell where
it has to transmit harder, or works on a bench supply and fails on a battery.</p>
<p>Two things fix it, and you need both:</p>
<ul>
  <li><strong>A big capacitor right at the module</strong> - 1000&nbsp;uF or more, across VCC and GND, on the
  module's own pins. It supplies the burst locally.</li>
  <li><strong>A supply that can actually deliver 2 A</strong> at the module's voltage.</li>
</ul>
<p><strong>And the voltage is the trap.</strong> The SIM800L wants <strong>3.4 to 4.4&nbsp;V</strong>. Not
5&nbsp;V, which destroys it, and not 3.3&nbsp;V, which is below its minimum and causes exactly the same
mysterious resets. An Arduino has neither rail. A buck converter set to 4.0&nbsp;V, or a single lithium cell,
is the correct answer.</p>

<p><strong>Level shifting on RX.</strong> The module's logic is 2.8&nbsp;V. Its TX output reads reliably as
HIGH on a 5&nbsp;V Arduino, so that direction is fine. Its RX input must not see 5&nbsp;V - a divider, or
better, a 3.3&nbsp;V Arduino.</p>

<p><strong>SIM cards.</strong> A consumer pay-as-you-go SIM works. An IoT SIM is better: priced per megabyte
rather than per month, designed to sit in a device for years, and it will not be cancelled when the operator
notices it is not in a phone. Either way, <strong>disable the PIN first</strong> by putting it in a phone and
turning PIN lock off - handling PIN entry in the sketch is possible and is an unnecessary way to lock
yourself out of a SIM.</p>`,

bom: [
  { id: 'nano', qty: 1, note: 'Or any Arduino. A 3.3 V board saves you the RX divider.' },
  { id: 'sim800l', qty: 1, note: 'Check your country’s 2G switch-off date before building this to keep. See the intro.' },
  { id: 'iot-sim', qty: 1, note: 'Disable the PIN before it goes in the module. A consumer SIM works too.' },
  { id: 'buck', qty: 1, note: 'Set to 4.0 V with a meter BEFORE connecting the module. This is the step people skip.' },
  { id: 'cap1000', qty: 2, note: 'Both across the module’s VCC and GND, physically at the module. Not optional, and not on the breadboard.' },
  { id: 'psu5v3a', qty: 1, note: 'Must genuinely deliver 3 A. A phone charger rated 1 A will cause resets that look like software faults.' },
  { id: 'res10k', qty: 3, note: 'RX divider from a 5 V Arduino: one in series, two in series to ground.' },
  { id: 'pir', qty: 1, note: 'The trigger. Swap for a reed switch, a water sensor or a float switch - the sketch does not care.' },
  { id: 'reed', qty: 1, note: 'Door or window trigger, if that is the job.' },
  { id: 'led5', qty: 2, note: 'Armed and network-status indicators.' },
  { id: 'res220', qty: 2 },
  { id: 'button', qty: 1, note: 'Arm and disarm without a text.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'screwterm', qty: 2 },
  { id: 'box-abs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'bb-400', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', note: 'Needed to set the buck converter. Do not guess this voltage.' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'nano', comp: 'nano',    at: [0, 50] },
    { id: 'bb',   comp: 'bb400',   at: [0, -8] },
    { id: 'gsm',  comp: 'sim800l', at: [-48, -58], ry: 180 },
    { id: 'buck', comp: 'buck',    at: [40, -56] },
    { id: 'pir',  comp: 'pir',     at: [-4, -60] },
    { id: 'led1', comp: 'led5',    at: [26, -92], opt: { c: '#3fbf6a' } },
    { id: 'led2', comp: 'led5',    at: [36, -92], opt: { c: '#e8a33a' } },
    { id: 'btn',  comp: 'button',  at: [-30, -92] }
  ],
  wires: [
    { from: 'nano.5V',   to: 'bb.T+2',    color: 'red',    note: '5 V rail for the Arduino side and the PIR' },
    { from: 'nano.GND',  to: 'bb.T-2',    color: 'black',  note: 'Ground rail. The module and the Arduino MUST share this' },
    { from: 'buck.IN+',  to: 'bb.T+6',    color: 'red',    note: 'Buck input from the 5 V supply' },
    { from: 'buck.IN-',  to: 'bb.T-6',    color: 'black',  note: 'Buck input ground' },
    { from: 'buck.OUT+', to: 'gsm.VCC',   color: 'brown',  note: '4.0 V to the module - SET AND MEASURE THIS FIRST. 5 V destroys it' },
    { from: 'buck.OUT-', to: 'gsm.GND',   color: 'black',  note: 'Module ground, back to the common rail' },
    { from: 'gsm.TXD',   to: 'nano.D8',   color: 'green',  note: 'Module talks, Arduino listens. 2.8 V out reads fine as HIGH on 5 V' },
    { from: 'gsm.RXD',   to: 'bb.T+14',   color: 'orange', note: 'Module RX from the DIVIDER midpoint, never straight from D7' },
    { from: 'nano.D7',   to: 'bb.T+18',   color: 'orange', note: 'Arduino TX into the top of the divider' },
    { from: 'bb.T-18',   to: 'bb.T-14',   color: 'black',  note: 'Divider lower leg to ground' },
    { from: 'gsm.RST',   to: 'nano.D9',   color: 'white',  note: 'Hardware reset - lets the sketch recover a wedged module' },
    { from: 'pir.VCC',   to: 'bb.T+22',   color: 'red',    note: 'PIR power, 5 V' },
    { from: 'pir.GND',   to: 'bb.T-22',   color: 'black',  note: 'PIR ground' },
    { from: 'pir.OUT',   to: 'nano.D2',   color: 'purple', note: 'PIR trigger. D2 is an interrupt pin' },
    { from: 'led1.A',    to: 'nano.D5',   color: 'green',  note: 'Armed indicator through 220 ohm' },
    { from: 'led1.K',    to: 'bb.T-26',   color: 'black',  note: 'Cathode to ground' },
    { from: 'led2.A',    to: 'nano.D6',   color: 'orange', note: 'Network indicator through 220 ohm' },
    { from: 'led2.K',    to: 'bb.T-28',   color: 'black',  note: 'Cathode to ground' },
    { from: 'btn.1A',    to: 'nano.D3',   color: 'blue',   note: 'Arm/disarm button, internal pull-up' },
    { from: 'btn.2A',    to: 'bb.T-30',   color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">3.4 to 4.4 V. Not 5, not 3.3. Set it with a meter first.</span>
<p>The SIM800L has no regulator on board. Five volts kills it. Three point three volts is below its minimum
and produces resets that look exactly like a software bug.</p>
<p>Set the buck converter to <strong>4.0&nbsp;V with the meter on its output and nothing else
connected</strong>. These modules arrive set to whatever the factory left them at, and turning the pot with
the module attached is how people destroy one in the first ten minutes.</p></div>

<div class="note danger"><span class="t">1000 uF at the module, and a supply that means it</span>
<p>GSM transmits in 577&nbsp;microsecond bursts that draw up to 2&nbsp;A. Average current is only about
100&nbsp;mA, which is why a supply that seems fine is not.</p>
<p>Two 1000&nbsp;uF capacitors soldered across the module's own VCC and GND pins - at the module, not on the
breadboard a few centimetres away, because a few centimetres of breadboard has enough inductance to matter at
these edges.</p>
<p>And a 3&nbsp;A supply. A 1&nbsp;A phone charger will let the module register and then reset it the moment
it actually transmits, which is a genuinely confusing fault because everything looks healthy until the
instant it matters.</p></div>

<div class="note warn"><span class="t">Common ground, and a divider on RX</span>
<p>The module and the Arduino must share a ground or the serial lines have no reference. With a separate buck
converter it is easy to forget.</p>
<p>The module's logic is 2.8&nbsp;V. Its RX must not see 5&nbsp;V - 10&nbsp;k in series with 20&nbsp;k to
ground gives about 3.3&nbsp;V, which is comfortably within its input range. Its TX at 2.8&nbsp;V reads as HIGH
on a 5&nbsp;V Arduino, with less margin than is comfortable but reliably in practice.</p></div>

<div class="note warn"><span class="t">Antenna on before power</span>
<p>Same rule as every transmitter in this book. The module ships with a small helical antenna or a wire - fit
it before the first power-up. Transmitting into nothing degrades the power amplifier.</p>
<p>The supplied stubby antennas are poor. A proper GSM antenna on the u.FL connector is a few dollars and
makes a real difference at the edge of coverage.</p></div>

<div class="note tip"><span class="t">Read the status LED</span>
<p>The module's onboard LED tells you the state before any code does:</p>
<ul>
  <li><strong>Blinking every second</strong>: powered, not registered on a network yet.</li>
  <li><strong>Blinking every 2 seconds</strong>: GPRS data connection is up.</li>
  <li><strong>Blinking every 3 seconds</strong>: registered on the network. This is what you want.</li>
  <li><strong>Off</strong>: no power, or the module has browned out.</li>
</ul></div>`,

solderSteps: [
  { h: 'The capacitors, first and directly on the module',
    body: `<p>Two 1000&nbsp;uF electrolytics, positive legs to VCC, striped negative legs to GND, on the
    module's own pads. Bend them flat so they do not snap off.</p>
    <p>This is the single most important joint in the project. If the module resets when it transmits and the
    capacitors are on the breadboard rather than the module, move them.</p>` },
  { h: 'Set the buck converter before it touches anything',
    body: `<p>Power the buck from the 5&nbsp;V supply with <strong>nothing on its output</strong>. Meter on
    the output terminals. Turn the trimmer - usually twenty-odd turns, so it moves slowly - until it reads
    4.0&nbsp;V.</p>
    <p>Then power it down, connect the module, power up and measure again under load. It will sag a little;
    anything above 3.6&nbsp;V while transmitting is fine.</p>` },
  { h: 'Screw terminals for the supply and the sensor',
    body: `<p>The 5&nbsp;V in and the sensor lead both leave the board, so both get terminals. The module's
    supply run carries 2&nbsp;A bursts - use 22&nbsp;AWG or thicker and keep it short.</p>` },
  { h: 'Female headers for the module and the Arduino',
    body: `<p>Socket both. You will be swapping SIMs, and a module that has been fed 5&nbsp;V once needs
    replacing.</p>` },
  { h: 'Fat ground, and star it at the capacitors',
    body: `<p>The 2&nbsp;A burst returns through ground. Run a heavy ground from the module's capacitors back
    to the supply, and bring the Arduino's ground to the same point rather than daisy-chaining through the
    module.</p>
    <p>Sharing a thin ground with a GSM burst is how you get an Arduino that resets in sympathy.</p>` },
  { h: 'Check it cold, then bring it up in stages',
    body: `<p>Nothing powered: module VCC to GND should read a few hundred ohms falling as the capacitors
    charge, then open. Not a short.</p>
    <p>Then the buck alone, measured. Then the Arduino. Then the module last.</p>` }
],

assembly: [
  { h: 'Check 2G is still on in your country',
    body: `<p>Before anything else. Search for "2G switch off" and your country. If it is gone, this module
    will power up, blink, and never register - and you will spend an evening debugging a network that does not
    exist.</p>
    <p>Where 2G has gone, build the <a href="project.html?p=lte-remote-monitor">LTE version</a> instead. The
    sketch is nearly identical; the module and the price differ.</p>` },
  { h: 'Disable the SIM PIN in a phone',
    body: `<p>Put the SIM in any phone, go to security settings, turn the PIN lock off. Then move it to the
    module.</p>
    <p>Handling PIN entry over AT commands is possible and adds a class of failure - three wrong attempts
    locks the SIM and needs the PUK. Not worth it.</p>
    <p>While the SIM is in the phone, confirm it actually has credit and can send a text.</p>` },
  { h: 'Talk to the module by hand before writing any logic',
    body: `<p>Upload the AT passthrough sketch and type commands yourself. This is the most valuable half hour
    in the project.</p>
    <p>Work through: <code>AT</code> &rarr; <code>OK</code>. <code>AT+CSQ</code> for signal.
    <code>AT+CREG?</code> for registration. <code>AT+COPS?</code> to see which network it found. Then send
    yourself a text by hand.</p>
    <p>Everything the sketch does later, you will have done manually first - which means when it fails you
    know what the answer should have looked like.</p>` },
  { h: 'Watch the signal and the registration',
    body: `<p><code>AT+CSQ</code> returns <code>+CSQ: 18,0</code> - the first number is what matters:</p>
    <ul>
      <li><strong>0-9</strong>: marginal. Texts may fail.</li>
      <li><strong>10-14</strong>: usable.</li>
      <li><strong>15-19</strong>: good.</li>
      <li><strong>20-31</strong>: excellent.</li>
      <li><strong>99</strong>: no signal at all.</li>
    </ul>
    <p>If you are at 5 indoors, move the antenna to a window before blaming anything else.</p>` },
  { h: 'Send your first text by hand',
    body: `<p><code>AT+CMGF=1</code> sets text mode rather than PDU mode. Then
    <code>AT+CMGS="+441234567890"</code>, enter, type the message, and send <strong>Ctrl-Z</strong> (character
    26) to finish.</p>
    <p>Most serial monitors cannot send Ctrl-Z. The passthrough sketch below maps the <code>~</code> key to it
    for exactly this reason.</p>` },
  { h: 'Add the sensor and run the alarm sketch',
    body: `<p>PIR on D2, button on D3. Arm it, walk in front of the sensor, wait for the text.</p>
    <p>The first send takes a few seconds - registration, then the message. Watch the serial output; every AT
    exchange is echoed.</p>` },
  { h: 'Test the rate limit deliberately',
    body: `<p>Arm it and wave at the sensor twenty times. You should get one text and then silence until the
    cooldown expires.</p>
    <p>This matters more than it sounds. A PIR pointed at a curtain near a radiator triggers all night, and
    without a limit that is several hundred texts and, on a metered SIM, a real bill.</p>` },
  { h: 'Test the incoming command path',
    body: `<p>Text <code>STATUS</code> to the module. It should reply with signal strength, armed state and
    uptime. Text <code>ARM</code> and <code>DISARM</code> and check they work.</p>
    <p>Being able to ask a remote device how it is doing turns out to be the most-used feature once it is
    installed.</p>` },
  { h: 'Install it, antenna high and dry',
    body: `<p>The antenna wants to be as high as possible and away from metal. In a shed, that means near the
    top of a wall rather than at bench height.</p>
    <p>Check <code>AT+CSQ</code> from the final location before you close the box.</p>` }
],

libraries: [
  { name: 'SoftwareSerial', by: 'Arduino', how: 'Built in', why: 'A second serial port for the module, leaving USB free for debugging. Adequate at 9600; not at higher rates.' },
  { name: 'No GSM library', by: '-', why: 'Deliberate. The AT command set is the skill worth having, and the popular wrapper libraries hide exactly the responses you need to see when something fails. The sketch talks to the module directly in about 60 lines.' }
],

code: [
{
  h: 'Step 1: talk to it yourself',
  intro: `<p>Type AT commands by hand. Do this before writing anything else - half an hour here saves a day
  later.</p>`,
  name: 'at_passthrough.ino',
  code: `/* ------------------------------------------------------------------
   AT command passthrough.

   Type commands in the Serial Monitor, see the module's replies.
   Set the monitor to "Both NL & CR".

   Send Ctrl-Z (needed to finish an SMS) by typing ~ instead - most
   serial monitors cannot send it directly.

   Worth trying, in order:
     AT              -> OK                 is it alive?
     ATI             -> module identity
     AT+CSQ          -> +CSQ: 18,0         signal, first number 0-31
     AT+CREG?        -> +CREG: 0,1         1 = registered, 5 = roaming
     AT+COPS?        -> which network
     AT+CMGF=1       -> text mode, not PDU
     AT+CMGS="+44..."  then type, then ~
   ------------------------------------------------------------------ */

#include <SoftwareSerial.h>

SoftwareSerial sim(8, 7);        // RX from module TX, TX to module RX

void setup() {
  Serial.begin(115200);
  sim.begin(9600);               // SIM800L default

  Serial.println(F("AT passthrough. Type ~ for Ctrl-Z."));
  Serial.println(F("Wait for the module LED to blink every 3 s."));
  Serial.println();
}

void loop() {
  while (sim.available()) Serial.write(sim.read());

  while (Serial.available()) {
    char c = Serial.read();
    if (c == '~') sim.write(26);      // Ctrl-Z, ends an SMS
    else          sim.write(c);
  }
}`,
  after: `<p><strong>No response to <code>AT</code> at all?</strong> In order: the module is not powered
  (check the LED), the supply voltage is wrong (measure it), TX and RX are swapped, or the baud rate is not
  9600 - some modules autobaud and need a few <code>AT</code>s to lock on.</p>
  <p><strong><code>AT+CREG?</code> returns <code>0,2</code> forever?</strong> It is searching and not finding.
  Check the antenna, check the SIM is seated, check the SIM has credit, and check 2G still exists where you
  are.</p>`
},
{
  h: 'Step 2: the alarm',
  intro: `<p>Sends a text on trigger, accepts commands back, and rate-limits itself. The AT handling is the
  part worth reading - it waits for real responses rather than sprinkling delays.</p>`,
  name: 'sms_alarm.ino',
  code: `/* ------------------------------------------------------------------
   SMS alarm.

   Trigger      -> sends one text, then ignores further triggers for
                   COOLDOWN_MS
   Text STATUS  -> replies with signal, armed state and uptime
   Text ARM     -> arms
   Text DISARM  -> disarms
   Button       -> toggles armed locally
   ------------------------------------------------------------------ */

#include <SoftwareSerial.h>

#define SIM_RX_PIN   8         // from module TXD
#define SIM_TX_PIN   7         // to module RXD, via divider
#define SIM_RST_PIN  9
#define PIR_PIN      2
#define BUTTON_PIN   3
#define LED_ARMED    5
#define LED_NET      6

const char PHONE[] = "+441234567890";      // <-- yours, with country code

#define COOLDOWN_MS    600000UL   // 10 min between alarm texts
#define MAX_PER_DAY         20    // hard cap, whatever happens

SoftwareSerial sim(SIM_RX_PIN, SIM_TX_PIN);

bool armed = true;
unsigned long lastAlarm = 0;
uint8_t sentToday = 0;
unsigned long dayStart = 0;
char buf[160];

void setup() {
  Serial.begin(115200);
  sim.begin(9600);

  pinMode(PIR_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_ARMED, OUTPUT);
  pinMode(LED_NET, OUTPUT);
  pinMode(SIM_RST_PIN, OUTPUT);
  digitalWrite(SIM_RST_PIN, HIGH);

  Serial.println(F("booting - the module needs ~10 s"));
  delay(10000);                       // let it find the network

  if (!modemInit()) {
    Serial.println(F("modem init failed - resetting"));
    modemReset();
    delay(10000);
    modemInit();
  }

  dayStart = millis();
  digitalWrite(LED_ARMED, armed);
  Serial.println(F("ready"));
  sendSms("Alarm online and armed.");
}

void loop() {
  pollIncoming();
  pollButton();
  pollSensor();

  // Roll the daily counter
  if (millis() - dayStart > 86400000UL) { dayStart = millis(); sentToday = 0; }

  // Network LED from a periodic signal check
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 30000) {
    lastCheck = millis();
    int csq = signalStrength();
    digitalWrite(LED_NET, csq > 5 && csq != 99);
  }
}

/* --- the sensor ------------------------------------------------------- */
void pollSensor() {
  if (!armed) return;
  if (digitalRead(PIR_PIN) != HIGH) return;

  /* Two independent limits. The cooldown stops a burst; the daily cap
     stops a sensor that has genuinely broken - a PIR pointed at a
     curtain over a radiator will trigger all night, and on a metered
     SIM that is a real bill rather than an annoyance. */
  if (millis() - lastAlarm < COOLDOWN_MS) return;
  if (sentToday >= MAX_PER_DAY) {
    Serial.println(F("daily cap reached - not sending"));
    return;
  }

  lastAlarm = millis();
  snprintf(buf, sizeof(buf), "ALARM: motion detected. Signal %d.",
           signalStrength());
  sendSms(buf);
}

void pollButton() {
  static unsigned long lastPress = 0;
  if (digitalRead(BUTTON_PIN) || millis() - lastPress < 300) return;
  lastPress = millis();

  armed = !armed;
  digitalWrite(LED_ARMED, armed);
  Serial.println(armed ? F("armed") : F("disarmed"));
}

/* --- incoming texts ----------------------------------------------------
   The module announces a new message with an unsolicited +CMTI line,
   which can arrive at any moment - including in the middle of another
   command's response. Hence reading continuously. */
void pollIncoming() {
  static char line[64];
  static byte pos = 0;

  while (sim.available()) {
    char c = sim.read();
    Serial.write(c);                  // echo everything, for debugging

    if (c == '\\n' || c == '\\r') {
      if (pos) { line[pos] = '\\0'; handleLine(line); pos = 0; }
      continue;
    }
    if (pos < sizeof(line) - 1) line[pos++] = c;
  }
}

void handleLine(char *line) {
  // "+CMTI: \\"SM\\",3"  -> a new message is in slot 3
  if (!strncmp(line, "+CMTI:", 6)) {
    char *comma = strrchr(line, ',');
    if (comma) readMessage(atoi(comma + 1));
  }
}

void readMessage(int slot) {
  Serial.print(F("reading slot ")); Serial.println(slot);

  sim.print(F("AT+CMGR="));
  sim.println(slot);

  // Collect the body, then act on it. The reply is several lines:
  // +CMGR: header, then the text, then OK.
  String body = collect(3000);
  body.toUpperCase();

  if      (body.indexOf("STATUS") >= 0) doStatus();
  else if (body.indexOf("DISARM") >= 0) { armed = false; digitalWrite(LED_ARMED, LOW);  sendSms("Disarmed."); }
  else if (body.indexOf("ARM")    >= 0) { armed = true;  digitalWrite(LED_ARMED, HIGH); sendSms("Armed."); }

  // Delete it, or the SIM's 20-odd slots fill and new texts are
  // silently rejected by the network.
  sim.print(F("AT+CMGD="));
  sim.println(slot);
  waitFor("OK", 3000);
}

void doStatus() {
  snprintf(buf, sizeof(buf),
           "Status: %s. Signal %d/31. Up %lu min. Texts today %d.",
           armed ? "ARMED" : "disarmed",
           signalStrength(),
           millis() / 60000UL,
           sentToday);
  sendSms(buf);
}

/* --- modem -------------------------------------------------------------
   Every one of these waits for the module's actual response rather
   than delay()ing and hoping. A module that is slow because it is
   searching for a network will then still work. */
bool modemInit() {
  if (!atCommand("AT", "OK", 2000))          return false;
  atCommand("ATE0", "OK", 2000);             // stop echoing our commands
  if (!atCommand("AT+CMGF=1", "OK", 2000))   return false;   // text mode
  atCommand("AT+CNMI=2,1,0,0,0", "OK", 2000);                // notify on SMS
  atCommand("AT+CSCS=\\"GSM\\"", "OK", 2000);                  // character set

  // Wait for registration: 1 = home network, 5 = roaming.
  for (byte i = 0; i < 30; i++) {
    sim.println(F("AT+CREG?"));
    String r = collect(2000);
    if (r.indexOf(",1") > 0 || r.indexOf(",5") > 0) {
      Serial.println(F("registered"));
      return true;
    }
    delay(2000);
  }
  Serial.println(F("never registered"));
  return false;
}

void modemReset() {
  digitalWrite(SIM_RST_PIN, LOW);
  delay(200);
  digitalWrite(SIM_RST_PIN, HIGH);
}

bool sendSms(const char *text) {
  Serial.print(F("SMS: ")); Serial.println(text);

  sim.print(F("AT+CMGS=\\""));
  sim.print(PHONE);
  sim.println(F("\\""));

  // The module answers with "> " when it is ready for the body.
  if (!waitFor(">", 5000)) {
    Serial.println(F("  no prompt - aborting"));
    sim.write(27);                    // ESC, cancels the pending command
    return false;
  }

  sim.print(text);
  sim.write(26);                      // Ctrl-Z ends the message

  // Sending genuinely can take 10 s on a weak signal.
  bool ok = waitFor("+CMGS", 20000);
  Serial.println(ok ? F("  sent") : F("  FAILED"));
  if (ok) sentToday++;
  return ok;
}

int signalStrength() {
  sim.println(F("AT+CSQ"));
  String r = collect(2000);
  int i = r.indexOf("+CSQ:");
  if (i < 0) return 99;
  return r.substring(i + 6).toInt();
}

bool atCommand(const char *cmd, const char *expect, unsigned long timeoutMs) {
  sim.println(cmd);
  return waitFor(expect, timeoutMs);
}

bool waitFor(const char *expect, unsigned long timeoutMs) {
  unsigned long deadline = millis() + timeoutMs;
  String got = "";

  while (millis() < deadline) {
    while (sim.available()) {
      char c = sim.read();
      Serial.write(c);
      got += c;
      if (got.indexOf(expect) >= 0) return true;
      if (got.indexOf("ERROR") >= 0) return false;
      if (got.length() > 200) got = got.substring(100);   // bound it
    }
  }
  return false;
}

String collect(unsigned long ms) {
  unsigned long deadline = millis() + ms;
  String out = "";
  while (millis() < deadline) {
    while (sim.available()) { char c = sim.read(); Serial.write(c); out += c; }
  }
  return out;
}`,
  after: `<p>Three habits in there are worth taking to any AT-driven modem, including the 5G one:</p>
  <ul>
    <li><strong>Wait for responses, do not <code>delay()</code>.</strong> A module searching for a network
    answers slowly. Code built on fixed delays works on a strong signal and fails exactly where you need it.</li>
    <li><strong><code>ATE0</code> early.</strong> Echo off stops the module repeating your commands back, which
    otherwise makes every response-matching function match its own question.</li>
    <li><strong>Delete messages after reading.</strong> A SIM holds around twenty. Once full, the network
    silently stops delivering, and the device goes deaf with nothing in the logs.</li>
  </ul>
  <p>The <code>ESC</code> (character 27) when no <code>&gt;</code> prompt arrives matters too: without it the
  module sits waiting for message text forever and every later command is swallowed as part of the SMS.</p>`
}],

upload: `
<p>Ordinary Nano. Serial Monitor at <strong>115200</strong>, line ending <strong>Both NL &amp; CR</strong> for
the passthrough sketch.</p>
<div class="note warn"><span class="t">Give it ten seconds before expecting anything</span>
<p>The module powers up, searches for a network and registers. Nothing works before that and the sketch waits
for it deliberately. Watch the onboard LED: three-second blinking means registered.</p></div>
<div class="note tip"><span class="t">Put your own number in first</span>
<p><code>PHONE[]</code> at the top, in full international format with the country code and no spaces:
<code>+441234567890</code>. National format works on some networks and not others, and the difference is a
text that silently never arrives.</p></div>`,

tune: [
  { h: 'A better antenna is the cheapest upgrade',
    body: `<p>The stubby helical antenna these ship with is poor. A proper GSM antenna on the u.FL connector
    costs a few dollars and typically adds 4-6 points to <code>AT+CSQ</code>, which at the edge of coverage is
    the difference between sending and not.</p>
    <p>Height and distance from metal matter as much as the antenna itself.</p>` },
  { h: 'Batch several triggers into one message',
    body: `<p>Rather than one text per event, collect events for a minute and send a summary: "3 triggers
    between 02:14 and 02:16". Fewer texts, less cost, and more useful to read.</p>` },
  { h: 'Use GPRS data instead of SMS',
    body: `<p>The module can open a TCP connection - <code>AT+CIPSTART</code> and friends - and post to a
    server or an MQTT broker. Data is much cheaper per byte than SMS on most tariffs, and it lets you send
    real telemetry rather than sentences.</p>
    <p>The trade is that a text arrives on your phone with no infrastructure at all, and a data post needs
    something at the other end that is up.</p>` },
  { h: 'Making it run from a battery',
    body: `<p>A single 18650 is ideal here - 3.0 to 4.2&nbsp;V is exactly the module's input range, so the
    buck converter comes out entirely and the efficiency loss with it.</p>
    <p>Then sleep the Arduino between checks and use <code>AT+CSCLK=1</code> to let the module sleep too,
    waking on the DTR line. Idle drops from about 20&nbsp;mA to under 1&nbsp;mA - though an alarm has to stay
    awake for its sensor, so the win is smaller here than on a periodic reporter.</p>` },
  { h: 'Accept commands only from known numbers',
    body: `<p>The sketch acts on any text it receives. Parse the sender from the <code>+CMGR</code> header and
    compare it against a whitelist.</p>
    <p>Worth doing even for a shed alarm: the module's number is discoverable, and "DISARM" from a stranger
    should not work.</p>` },
  { h: 'Know when the credit runs out',
    body: `<p>A pay-as-you-go SIM that runs dry fails silently - the device keeps working and the texts simply
    stop. <code>AT+CUSD</code> can query a balance code on most networks, and checking it weekly and texting
    yourself when it drops is worth the twenty lines.</p>` }
],

trouble: [
  { q: 'The module resets whenever it tries to send',
    a: `Power. The 2&nbsp;A burst is collapsing the supply. Capacitors directly on the module's pins, not the
    breadboard; a supply that genuinely delivers 3&nbsp;A; and thick, short wires to the module. This is the
    single most common SIM800L problem.` },
  { q: 'The LED blinks every second and never changes',
    a: `Powered but not registered. Check the antenna is fitted, the SIM is seated the right way round and has
    credit, and that 2G still exists where you are. <code>AT+CSQ</code> returning 99 means no signal at all.` },
  { q: 'No response to <code>AT</code>',
    a: `Check the supply voltage is 3.4-4.4&nbsp;V - 3.3 is too low and produces exactly this. Then check TX
    and RX are not swapped, and that the grounds are common. Some modules autobaud and need three or four
    <code>AT</code>s before they lock on.` },
  { q: 'It registers but texts never arrive',
    a: `Check the number format - full international with a country code, no spaces. Then check
    <code>AT+CMGF=1</code> succeeded. Then send one by hand with the passthrough sketch and watch for
    <code>+CMGS</code> in the reply; if you get <code>ERROR</code>, the network refused it, usually for
    credit.` },
  { q: 'Everything works for a few hours then stops receiving',
    a: `The SIM's message store is full. It holds about twenty and the network stops delivering once it is.
    The sketch deletes each message after reading it - if you removed that, put it back, and clear the store
    once with <code>AT+CMGDA="DEL ALL"</code>.` },
  { q: 'Garbage characters on the serial port',
    a: `Baud mismatch, or the module browning out mid-byte. Try <code>AT+IPR=9600</code> to fix its rate.
    If the garbage appears specifically during transmission, it is the power problem again.` },
  { q: 'The Arduino resets when the module transmits',
    a: `They are sharing a thin ground, and the 2&nbsp;A return current is dragging the Arduino's ground
    reference around. Star the ground at the module's capacitors and run a separate heavy conductor.` },
  { q: 'It worked yesterday and today it will not register',
    a: `Check whether your carrier switched 2G off. It is happening steadily and there is rarely a warning at
    the device end - the module simply searches forever.` },
  { q: 'I destroyed a module',
    a: `Almost certainly 5&nbsp;V on VCC. There is no protection and no recovery. Set the buck converter with
    a meter, with nothing connected, before the replacement goes in.` }
],

next: `
<ul>
  <li><strong>The version that will still work in 2035</strong> - the
  <a href="project.html?p=lte-remote-monitor">LTE remote monitor</a> uses the same AT skills on a modern
  network, with real data instead of texts.</li>
  <li><strong>Battery-powered, years at a time</strong> - the
  <a href="project.html?p=nbiot-field-sensor">NB-IoT field sensor</a> sleeps at microamps between reports,
  which SMS over 2G cannot do.</li>
  <li><strong>No network at all</strong> - the <a href="project.html?p=lora-remote-sensor">LoRa sensor</a>
  needs no operator, no SIM and no subscription, at the cost of needing your own base station.</li>
  <li><strong>Add a camera.</strong> A picture attached to an alarm is far more useful than a sentence -
  see the <a href="project.html?p=esp32cam-motion-trap">motion trap</a>, and the
  <a href="project.html?p=lte-camera-uploader">LTE camera</a> for sending it anywhere.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Two ways to destroy hardware, both avoidable</span>
<ul>
  <li><strong>5 V on VCC kills the module instantly.</strong> It wants 3.4-4.4&nbsp;V and has no regulator.
  Set the buck converter with a meter, unloaded, before connecting anything.</li>
  <li><strong>Never power it without an antenna.</strong> Reflected power degrades the amplifier.</li>
  <li><strong>The capacitors are polarised.</strong> A 1000&nbsp;uF electrolytic fitted backwards heats up
  and vents.</li>
</ul>
</div>
<div class="note warn"><span class="t">It is a transmitter, and a device with a phone number</span>
<ul>
  <li><strong>Do not put it near a pacemaker or medical equipment.</strong> A GSM burst is a strong nearby
  field, which is why phones used to be banned in hospitals. Keep a transmitting module a reasonable distance
  from people.</li>
  <li><strong>Anyone who learns its number can text it.</strong> Add a sender whitelist before this controls
  anything that matters.</li>
  <li><strong>A metered SIM can run up a real bill.</strong> The cooldown and the daily cap exist for that
  reason - do not remove them because they are inconvenient during testing.</li>
  <li><strong>This is not a monitored alarm system.</strong> It is a device that sends a text if it has
  signal, credit, power and a working network. Do not rely on it for anything where failing silently would
  matter.</li>
</ul>
</div>`
});
