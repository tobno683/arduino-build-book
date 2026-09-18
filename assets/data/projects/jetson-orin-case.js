/* A case is a thermal design problem with a lid on it. */
AB.addProject({
slug: 'jetson-orin-case',
title: 'Printed case for the Jetson Orin Nano, with its own cooling',
cat: 'printing',
level: 3,
time: 'A weekend, plus print time',
solder: true,
board: 'Nano + Jetson Orin Nano',
printed: true,
tags: ['3d printing', 'enclosure', 'jetson', 'thermal', 'pwm fan', '25 khz', 'petg', 'heat-set inserts', 'airflow'],
blurb: 'A case for a 25-watt board that does not cook it. The printing is the easy half; the real design is an airflow path, a material that survives the heat, and a fan controller that keeps working when the Jetson itself has crashed.',
feature: true,

skills: ['Designing around a real board', 'Choosing filament by temperature', 'Airflow paths', 'Heat-set inserts', '25 kHz PWM fan control', 'Detecting a failed fan'],

intro: `
<p>The Jetson Orin Nano developer kit ships as a bare board with a heatsink and fan on top. Put it in a box and
two things happen: its own fan starts recirculating air it has already heated, and the box traps that heat
around everything else on the carrier.</p>
<p>So a case for this board is not a cosmetic object. It is a thermal system, and designing one well is a
genuinely useful piece of engineering - the same skills apply to every enclosure you will ever print around
something that gets warm.</p>
<p>This one adds a second, independent fan controller on a Nano. The Jetson manages its own heatsink fan; the
Nano manages the <em>case</em>, from the case air temperature, and it keeps working if the Jetson's operating
system hangs, crashes or is halfway through shutting down.</p>`,

what: [
  'House the Jetson Orin Nano developer kit with every port reachable and nothing pressing on the board.',
  'Move air through the case on a deliberate path rather than letting it recirculate.',
  'Hold its shape under load - which rules out the filament most people reach for first.',
  'Run a case exhaust fan from case air temperature, independently of the Jetson.',
  'Notice when that fan has died, which is the failure that actually cooks boards.',
  'Open and close hundreds of times without stripping a thread.'
],

how: `
<p><strong>Measure your board. Do not trust this page for the holes.</strong> The developer kit is about
100&nbsp;x&nbsp;79&nbsp;x&nbsp;21&nbsp;mm including its heatsink and feet. NVIDIA's public carrier specification
gives the board outline but <em>not</em> the mounting hole positions - which their own developer forum
confirms. So any case file that claims exact hole coordinates for this board either measured one board or
guessed.</p>
<p>Measure yours with calipers: hole centres, hole diameter, and the height of the tallest component on each
side. Then print a flat test plate with just the holes and posts, and screw the board to it before designing
anything else. It takes forty minutes and it is the difference between a case that fits and one you print
three times.</p>

<p><strong>Material is a temperature decision.</strong> This is the part people get wrong, because PLA prints
easily and looks fine on day one.</p>
<ul>
  <li><strong>PLA</strong> softens around 55&nbsp;&deg;C. The air near a Jetson heatsink under sustained load
  can pass that, and the case slowly sags, especially wherever a screw is pulling on it. Not suitable.</li>
  <li><strong>PETG</strong> holds to about 80&nbsp;&deg;C, is tough rather than brittle, and prints almost as
  easily. <strong>This is the right choice.</strong></li>
  <li><strong>ASA</strong> goes to about 95&nbsp;&deg;C and is UV-stable, for a case that lives somewhere hot
  or outside. Needs an enclosed printer.</li>
</ul>

<p><strong>Airflow is a path, not a number of holes.</strong> Hot air rises, so the case should take air in
low at one end and exhaust it high at the other - across the board, past the heatsink, and out. Scatter vents
everywhere and the fan draws air through whichever hole is nearest, short-circuiting the path entirely.</p>
<p>Two rules that do most of the work:</p>
<ul>
  <li><strong>Inlet area at least as large as the fan.</strong> A 60&nbsp;mm fan starved by a few small holes
  moves a fraction of its rated air and gets loud doing it.</li>
  <li><strong>Exhaust nowhere near intake.</strong> Otherwise the case breathes its own exhaust.</li>
</ul>

<p><strong>Why a second controller, and why a Nano.</strong> The Jetson drives its own heatsink fan from its
own temperature sensors, and does it well. But it cannot know the case air is 20 degrees warmer than the room,
and if the OS hangs, nothing is controlling anything. A Nano reading a probe in the case air has one job, no
operating system, and keeps running regardless.</p>

<p><strong>4-pin PC fans want 25&nbsp;kHz PWM.</strong> The Intel fan specification sets it there. An Arduino's
<code>analogWrite()</code> runs at 490 or 980&nbsp;Hz, well inside the audible range - so the fan whines, and
some fans misread a slow PWM signal entirely and sit at full speed.</p>
<p>Reconfiguring Timer1 for 25&nbsp;kHz is about six lines and fixes both. This is the single most useful thing
this project teaches that applies elsewhere.</p>

<p><strong>The tach wire is the safety system.</strong> The fourth wire pulses twice per revolution. Count the
pulses and you know the actual speed - and more importantly, you know when the fan has stopped while you asked
it to spin. A dead fan in a sealed case is exactly how boards die, silently, on a shelf.</p>`,

bom: [
  { id: 'petg', qty: 1, note: 'Not PLA - it softens around 55 C and a Jetson under load gets the air near it past that. A case uses under 200 g.' },
  { id: 'heatset', qty: 1, note: 'For the lid and the board posts. A screw into bare plastic strips after about ten openings.' },
  { id: 'fan60-pwm', qty: 1, note: '5 V, four-pin. The fourth wire is the tachometer, and that is the reason to buy this kind rather than a two-wire fan.' },
  { id: 'nano', qty: 1, note: 'The case controller. No operating system, one job, and it keeps working when the Jetson does not.' },
  { id: 'ds18b20', qty: 1, note: 'Case air temperature, mounted in the airflow - see the notes on where.' },
  { id: 'res4k7', qty: 1, note: 'OneWire pull-up.' },
  { id: 'res10k', qty: 1, note: 'Pull-up for the tach line, which is open-collector.' },
  { id: 'oled13', qty: 1, note: 'Case temperature, fan speed, and a clear warning if the fan stops.' },
  { id: 'jetson-orin', qty: 1, own: true, note: 'The board this case is for. Listed so the project appears under the Jetson filter.' },
  { id: 'calipers', qty: 1, note: 'Measuring your own board is not optional here - the public spec omits the hole positions.' },
  { id: 'standoffs', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'calipers' }],

build: {
  parts: [
    { id: 'jet',  comp: 'jetson', at: [-10, 70] },
    { id: 'mcu',  comp: 'nano',   at: [60, -10] },
    { id: 'bb',   comp: 'bb400',  at: [0, -30] },
    { id: 'fan',  comp: 'fanpwm', at: [-66, -40] },
    { id: 'temp', comp: 'ds18b20',at: [4, -72] },
    { id: 'oled', comp: 'oled13', at: [62, -66] }
  ],
  wires: [
    { from: 'jet.5V',    to: 'bb.T+1',   color: 'red',    note: '5 V from the Jetson header to power the controller - or use a separate supply, see the notes' },
    { from: 'jet.GND',   to: 'bb.T-1',   color: 'black',  note: 'Common ground' },
    { from: 'mcu.5V',    to: 'bb.T+4',   color: 'red',    note: 'Nano power' },
    { from: 'mcu.GND',   to: 'bb.T-4',   color: 'black',  note: 'Nano ground' },
    { from: 'fan.+',     to: 'bb.T+8',   color: 'red',    note: 'Fan supply - 5 V, straight from the rail' },
    { from: 'fan.GND',   to: 'bb.T-8',   color: 'black',  note: 'Fan ground' },
    { from: 'fan.PWM',   to: 'mcu.D9',   color: 'green',  note: 'Speed control - D9 is on Timer1, which is what makes 25 kHz possible' },
    { from: 'fan.TACH',  to: 'mcu.D2',   color: 'yellow', note: 'Tachometer, with a 10 k pull-up - D2 because it is an interrupt pin' },
    { from: 'temp.VCC',  to: 'bb.T+14',  color: 'red',    note: 'Probe power' },
    { from: 'temp.GND',  to: 'bb.T-14',  color: 'black',  note: 'Probe ground' },
    { from: 'temp.DATA', to: 'mcu.D4',   color: 'white',  note: 'OneWire, with the 4.7 k pull-up to 5 V' },
    { from: 'oled.VCC',  to: 'bb.T+20',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND',  to: 'bb.T-20',  color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA',  to: 'mcu.A4',   color: 'green',  note: 'I2C data' },
    { from: 'oled.SCL',  to: 'mcu.A5',   color: 'blue',   note: 'I2C clock' }
  ]
},

wireIntro: `<p>A small controller: a fan with four wires, a temperature probe and a display. The interesting
connections are the two fan signal wires - one needs a specific timer, the other needs a pull-up and an
interrupt.</p>`,

wireNotes: `
<div class="note warn"><span class="t">D9, specifically</span>
<p>The 25&nbsp;kHz trick reprograms Timer1, and on a Nano Timer1 drives D9 and D10 only. Put the PWM wire on any
other pin and you get the default 490&nbsp;Hz - a whining fan, or one that ignores you.</p>
<p>Reprogramming Timer1 also breaks the Servo library, which uses it. Not a problem here, worth knowing
elsewhere.</p></div>

<div class="note tip"><span class="t">The tach line is open-collector</span>
<p>It can only pull low. Without a 10&nbsp;k pull-up to 5&nbsp;V it floats and reads as noise, which looks
like a fan spinning at random speeds - or, worse, like a healthy fan when it has actually stopped.</p></div>

<div class="note"><span class="t">Where the temperature probe goes</span>
<p>In the air stream <em>before</em> it reaches the exhaust fan, clear of the heatsink. Touching the heatsink
it reads the heatsink; near the intake it reads the room. You want the air the board is sitting in.</p></div>

<div class="note warn"><span class="t">Powering from the Jetson header</span>
<p>The 40-pin header's 5&nbsp;V can supply a fan and a Nano, and it is the tidiest option. It also means the
controller goes off when the Jetson does - which is fine for cooling, since there is then nothing to cool.</p>
<p>The header's logic is 3.3&nbsp;V and not 5&nbsp;V tolerant. The only connections to the Jetson here are
power and ground. Do not wire any Nano signal to a Jetson GPIO pin without a level shifter.</p></div>`,

solderIntro: `<p>The electronics is a small perfboard. Most of the effort is in the printed parts, and in
installing the heat-set inserts properly - which is closer to soldering than it sounds.</p>`,

solderSteps: [
  { h: 'Print a test plate before designing the case',
    body: `<p>A flat plate, 3&nbsp;mm thick, with nothing but the four board posts at the positions you
    measured. Print it, screw the board on, and check every post lines up.</p>
    <p>Forty minutes of printing now saves the three full case prints you would otherwise do. This is the most
    valuable habit in all of enclosure design.</p>` },
  { h: 'Design with clearances, not exact sizes',
    body: `<p>Printed holes come out small and printed pegs come out large. Add 0.2-0.3&nbsp;mm to every hole
    and cut-out, and 0.5&nbsp;mm around connectors that a cable plugs into - a USB-C plug has an overmoulded
    body wider than the socket.</p>
    <p>Leave at least 3&nbsp;mm between the case wall and any component, and more above the heatsink fan so it
    can breathe.</p>` },
  { h: 'Heat-set inserts: hot, straight, slow',
    body: `<p>Model the hole about 0.2&nbsp;mm smaller than the insert's outer diameter. Set your iron to about
    220&nbsp;&deg;C for PETG, rest the insert on the hole, and let the iron's own weight push it in - do not
    force it.</p>
    <p>Keep it vertical. An insert pressed in at an angle holds, but the screw will never go in straight. A
    dedicated insert tip for the iron makes this far easier and costs a few dollars.</p>` },
  { h: 'Print orientation for strength',
    body: `<p>Printed parts are weakest between layers. Orient so that screw posts are not loaded across their
    layer lines, and so that clips flex along the layers rather than peeling them apart.</p>
    <p>For a case, printing the base upright usually does this naturally. The lid is the one to think about.</p>` },
  { h: 'The controller board',
    body: `<p>Nano, the two pull-up resistors, headers for the fan and probe. Keep it small enough to mount on
    the case wall near the exhaust fan so the wiring is short.</p>` },
  { h: 'Fan and probe placement',
    body: `<p>Exhaust fan high on the rear wall, blowing out. Intake low on the front. Probe in the air path,
    clear of the heatsink.</p>
    <p>Then check the direction of the fan by holding a strip of paper at the vent. It is surprisingly easy to
    fit a fan blowing the wrong way, and the case still gets warm either way, so nothing else will tell you.</p>` }
],

libraries: [
  { name: 'DallasTemperature', by: 'Miles Burton', why: 'The case air probe.' },
  { name: 'OneWire', by: 'Paul Stoffregen', why: 'The bus beneath it.' },
  { name: 'U8g2', by: 'oliver', why: 'The status display.' }
],

code: [{
  name: 'case_cooling.ino',
  code: `/* ------------------------------------------------------------------
   Jetson case cooling - Nano, 4-pin PWM fan, DS18B20

   Independent of the Jetson: if its OS hangs, this keeps running.
   ------------------------------------------------------------------ */

#include <OneWire.h>
#include <DallasTemperature.h>
#include <U8g2lib.h>

#define FAN_PWM   9       // Timer1 - required for 25 kHz
#define FAN_TACH  2       // interrupt pin
#define ONE_WIRE  4

OneWire oneWire(ONE_WIRE);
DallasTemperature probe(&oneWire);
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);

// Case air, not heatsink. Quiet below the low figure, flat out above
// the high one, and a straight line between.
const float T_QUIET = 35.0;
const float T_FULL  = 50.0;
const float T_ALARM = 60.0;

volatile unsigned int tachPulses = 0;
unsigned long lastRpmCalc = 0;
unsigned int rpm = 0;
uint8_t duty = 0;              // 0-100 %

void setup() {
  Serial.begin(115200);
  pinMode(FAN_PWM, OUTPUT);
  pinMode(FAN_TACH, INPUT);    // external 10 k pull-up - the tach is open collector
  attachInterrupt(digitalPinToInterrupt(FAN_TACH), onTach, FALLING);

  setup25kHz();
  setFan(100);                  // start at full speed - fail safe on boot

  probe.begin();
  probe.setWaitForConversion(false);
  oled.begin();
}

void loop() {
  static unsigned long lastRead = 0;
  if (millis() - lastRead >= 1000) {
    lastRead = millis();

    float t = probe.getTempCByIndex(0);
    probe.requestTemperatures();      // start the next one; read it next second

    /* If the probe is missing, do not trust anything - run flat out.
       A cooling controller should fail towards more cooling, never less. */
    if (t == DEVICE_DISCONNECTED_C || t < -20) {
      setFan(100);
    } else {
      float frac = (t - T_QUIET) / (T_FULL - T_QUIET);
      int d = (int)(constrain(frac, 0.0f, 1.0f) * 100);
      // Below about 25 % many fans stall rather than spin slowly.
      setFan(d == 0 ? 0 : max(d, 25));
    }
    calcRpm();
    draw(t);
  }
}

/* ---- 25 kHz PWM on Timer1 --------------------------------------------
   The Intel 4-pin fan spec puts PWM at 25 kHz. analogWrite() gives 490
   Hz - audible, so the fan whines, and some fans misread it and sit at
   full speed. Phase-correct PWM with ICR1 as TOP: 16 MHz / (2 * 320) =
   25 kHz exactly. This replaces analogWrite on D9 and D10, and it breaks
   the Servo library, which also wants Timer1.
--------------------------------------------------------------------- */
void setup25kHz() {
  TCCR1A = 0;
  TCCR1B = 0;
  TCNT1  = 0;
  TCCR1A = _BV(COM1A1) | _BV(WGM11);          // non-inverting on OC1A (D9)
  TCCR1B = _BV(WGM13) | _BV(CS10);            // phase correct, TOP=ICR1, no prescale
  ICR1   = 320;
}

void setFan(uint8_t pct) {
  duty = pct;
  OCR1A = (uint16_t)((uint32_t)pct * ICR1 / 100);
}

// ---- tachometer --------------------------------------------------------
void onTach() { tachPulses++; }

/* Two pulses per revolution on nearly every PC fan. The important case
   is not the speed - it is the fan reporting zero when we asked it to
   spin, because that is the failure that cooks a board on a shelf. */
void calcRpm() {
  unsigned long now = millis();
  unsigned long dt = now - lastRpmCalc;
  if (dt < 1000) return;

  noInterrupts();
  unsigned int p = tachPulses;
  tachPulses = 0;
  interrupts();

  rpm = (unsigned long)p * 60000UL / dt / 2;
  lastRpmCalc = now;
}

bool fanDead() {
  // Asked for real speed, getting nothing back.
  return duty >= 30 && rpm < 200;
}

void draw(float t) {
  char line[24];
  oled.clearBuffer();

  oled.setFont(u8g2_font_helvB18_tr);
  snprintf(line, sizeof(line), "%.1fC", t);
  oled.drawStr(0, 24, line);

  oled.setFont(u8g2_font_6x10_tf);
  snprintf(line, sizeof(line), "fan %d%%  %u rpm", duty, rpm);
  oled.drawStr(0, 42, line);

  if (fanDead()) {
    oled.drawStr(0, 60, "FAN STOPPED - CHECK IT");
  } else if (t >= T_ALARM) {
    oled.drawStr(0, 60, "TOO HOT - check airflow");
  } else {
    oled.drawStr(0, 60, "ok");
  }
  oled.sendBuffer();
}`
}],

trouble: [
  { q: 'The case has started to sag or warp after a few weeks',
    a: `It is PLA. The glass transition is around 55&nbsp;&deg;C, the air near the Jetson passes that under load,
    and PLA creeps slowly wherever a screw is pulling on it. Reprint in PETG or ASA.` },
  { q: 'The fan whines at low speed',
    a: `PWM at 490&nbsp;Hz rather than 25&nbsp;kHz. Check the fan is on D9 and that <code>setup25kHz()</code> is
    actually running before <code>setFan()</code>.` },
  { q: 'The fan runs at full speed whatever the sketch asks',
    a: `Either the PWM wire is on a pin that is not driven by Timer1, or the fan is a 3-pin model with no PWM
    input at all. Check the connector - a 3-pin fan has no fourth wire to control.` },
  { q: 'The display says the fan has stopped when it is plainly spinning',
    a: `No pull-up on the tach line, so it floats. 10&nbsp;k from the tach wire to 5&nbsp;V.` },
  { q: 'The case is still hot even with the fan flat out',
    a: `Airflow short-circuit. The fan is pulling air through the nearest vent rather than across the board, or
    the exhaust is recirculating into the intake. Block vents until air has to take the path you designed.` },
  { q: 'The board does not line up with the posts',
    a: `The hole positions came from a drawing or a downloaded model rather than your board. Measure yours with
    calipers and print the flat test plate first.` },
  { q: 'Heat-set inserts went in crooked',
    a: `Pushed rather than allowed to sink under the iron's own weight, or the iron was too cool. Remove with
    the iron, and re-seat. A dedicated insert tip makes this much easier to get right.` },
  { q: 'The case lid cracks around the screw holes',
    a: `Screws straight into plastic, or layers loaded across their weakest direction. Use inserts, and
    reorient the lid so the posts are not splitting along layer lines.` }
],

safety: `
<div class="note warn"><span class="t">Enclosing a hot board is a thermal decision</span>
<p>A case that restricts airflow can push the Jetson into thermal throttling at best, and under sustained load
with a failed fan, well past what the board is designed for. The fan-stopped warning exists because that is
the realistic failure.</p>
<p>After building, run a long heavy workload and watch both temperatures - the Jetson's own
(<code>tegrastats</code> reports them) and the case air. If the Jetson throttles inside the case and not on the
bench, the case is not doing its job yet.</p></div>

<div class="note"><span class="t">Printing safety</span>
<p>The general printing notes apply - see the <a href="basics/printing.html">3D printing guide</a>. In
particular, do not leave a printer running unattended, and ventilate when printing ASA, which releases
styrene.</p></div>`,

next: `
<ul>
  <li><strong>Let the Jetson tell the case how busy it is.</strong> A serial line from the Jetson to the Nano
  (through a level shifter) lets the case fan ramp up <em>before</em> the heat arrives, from GPU load rather
  than temperature.</li>
  <li><strong>A dust filter</strong> on the intake, printed as a clip-on frame holding filter foam. A case that
  runs for months fills with dust.</li>
  <li><strong>Mount it</strong> - a VESA 75 plate on the back, and the case lives on the rear of a monitor.</li>
  <li><strong>Put the <a href="project.html?p=jetson-orin-vision">vision project</a> in it</strong>, with a
  printed camera mount on the front and the CSI ribbon routed internally.</li>
  <li><strong>The same thinking for other boards</strong>: the
  <a href="project.html?p=uno-q-enclosure">UNO Q enclosure</a> applies it to a board that runs cooler and has a
  camera to mount.</li>
</ul>`
});
