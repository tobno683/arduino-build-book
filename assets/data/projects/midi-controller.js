/* Native USB MIDI. The hard part is making a cheap potentiometer behave. */
AB.addProject({
slug: 'midi-controller',
title: 'USB MIDI control surface',
cat: 'audio',
level: 2,
time: '5 hours',
solder: true,
board: 'Pro Micro',
tags: ['midi', 'usb hid', 'pro micro', '32u4', 'potentiometer', 'hysteresis', 'debounce', 'music'],
blurb: 'Eight knobs and eight buttons that any music software recognises the moment you plug them in. No drivers, no configuration - and the real work is stopping cheap potentiometers from sending a stream of nonsense.',

skills: ['USB device classes', 'MIDI messages', 'ADC noise and hysteresis', 'Debouncing', 'Analogue multiplexing', 'Designing for feel'],

intro: `
<p>MIDI is a 1983 protocol that has outlived nearly everything it was designed alongside, because it is
extremely simple: three bytes saying which control moved and how far. Every piece of music software in
existence speaks it.</p>
<p>A board with native USB - a Pro Micro, or any 32U4 or SAMD board - can present itself as a MIDI device
directly. Plug it in and Ableton, Logic, Reaper or a hardware synth sees a controller. There is no driver to
install and nothing to configure, which still feels slightly magical.</p>
<p>The build is easy. What takes the time is making it feel good, and that turns out to be almost entirely
about handling noise from $0.30 potentiometers.</p>`,

what: [
  'Appear as a class-compliant USB MIDI device with no drivers at all.',
  'Send continuous controller messages from eight knobs, smoothly and without jitter.',
  'Send note or CC messages from eight buttons, cleanly debounced.',
  'Read sixteen analogue inputs from a board that only has a handful, using a multiplexer.',
  'Feel good to use, which is a design problem rather than a coding one.'
],

how: `
<p><strong>A MIDI message is three bytes.</strong> Status (what kind, and which of sixteen channels), then two
data bytes. A control change is <code>0xB0 | channel</code>, the controller number 0-127, and the value 0-127.
That is the entire protocol you need here.</p>
<p>Seven bits of resolution is the thing people complain about, and for a filter cutoff it is genuinely
audible as stepping. MIDI does define 14-bit CCs by pairing two controllers, and most software supports it.</p>

<p><strong>The jitter problem, which is the real project.</strong> A 10-bit ADC reading a cheap pot gives a
value that wanders by two or three counts even when nothing is touching it. Map that to 0-127 and the last
bit flickers, so the controller sends a continuous stream of messages for a knob nobody is moving.</p>
<p>That floods the MIDI bus, fills your DAW's automation lane with noise, and makes the whole thing feel
broken.</p>
<p>Three fixes, used together:</p>
<ul>
  <li><strong>Average</strong> several ADC readings. Cheap, removes most of it.</li>
  <li><strong>Hysteresis</strong> - only send when the value has moved by more than one step from the last
  value <em>sent</em>, not the last value read. This is the important one.</li>
  <li><strong>A short settle time</strong>: once a knob stops moving, stop sending. Not strictly necessary
  with hysteresis, but it makes the behaviour obvious in a MIDI monitor.</li>
</ul>

<p><strong>Multiplexing, because you run out of analogue pins.</strong> A Pro Micro has about nine usable
analogue inputs and you want sixteen. A 4051 or 4067 multiplexer is a rotary switch made of silicon: set three
or four address pins and one of eight or sixteen inputs is connected to a single output pin.</p>
<p>So sixteen pots need one analogue pin and four digital ones. Allow a few microseconds after changing the
address before reading, or you get the previous channel's value bleeding into this one - which presents as two
knobs that affect each other.</p>

<p><strong>Buttons want a different treatment from knobs.</strong> A momentary button should send note-on when
pressed and note-off when released, so a DAW can use it for anything. Latching behaviour - press for on, press
again for off - should be done in software rather than with a latching switch, because then you can change your
mind.</p>

<p><strong>Feel is a hardware decision.</strong> Detented encoders feel precise and are wrong for a filter
sweep. Smooth pots feel right for continuous parameters and cannot show their position when a preset loads.
Knob diameter changes how finely you can set something more than any code does. Decide what each control is
<em>for</em> before buying the parts.</p>`,

bom: [
  { id: 'pro-micro', qty: 1, note: 'ATmega32U4 with native USB, which is what makes driverless MIDI possible. A classic Uno or Nano cannot do this without reflashing its USB chip.' },
  { id: 'pot10k', qty: 8, note: 'Linear taper, not logarithmic - log pots are for audio volume and feel wrong for a MIDI parameter.' },
  { id: 'button', qty: 8, note: '12 mm tactile or arcade buttons. The bigger ones are much nicer to play.' },
  { id: 'cd4051', qty: 1, note: 'Eight-channel analogue multiplexer, so one analogue pin reads eight pots.' },
  { id: 'led5', qty: 8, note: 'One per button, to show latched state.' },
  { id: 'res220', qty: 8 },
  { id: 'perfboard', qty: 1, note: 'Or a piece of plywood with holes drilled in it, which is honestly a better enclosure for this.' },
  { id: 'headers-f', qty: 1 },
  { id: 'usb-cable', qty: 1, note: 'It must be a data cable. A charge-only cable gives you a controller that powers up and is invisible to the computer.' },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'nano',    at: [0, 68] },
    { id: 'bb',   comp: 'bb830',   at: [0, 2] },
    { id: 'p1',   comp: 'pot10k',  at: [-62, -56] },
    { id: 'p2',   comp: 'pot10k',  at: [-20, -56] },
    { id: 'p3',   comp: 'pot10k',  at: [22, -56] },
    { id: 'b1',   comp: 'button',  at: [-52, -90] },
    { id: 'b2',   comp: 'button',  at: [-14, -90] },
    { id: 'l1',   comp: 'led5',    at: [56, -60] }
  ],
  wires: [
    { from: 'mcu.5V',   to: 'bb.T+1',  color: 'red',    note: '5 V rail from USB' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'p1.1',     to: 'bb.T+5',  color: 'red',    note: 'Pot 1 top of track to 5 V' },
    { from: 'p1.3',     to: 'bb.T-5',  color: 'black',  note: 'Pot 1 bottom of track to ground' },
    { from: 'p1.W',     to: 'mcu.A0',  color: 'green',  note: 'Pot 1 wiper - the moving contact' },
    { from: 'p2.1',     to: 'bb.T+9',  color: 'red',    note: 'Pot 2 to 5 V' },
    { from: 'p2.3',     to: 'bb.T-9',  color: 'black',  note: 'Pot 2 to ground' },
    { from: 'p2.W',     to: 'mcu.A1',  color: 'blue',   note: 'Pot 2 wiper' },
    { from: 'p3.1',     to: 'bb.T+13', color: 'red',    note: 'Pot 3 to 5 V' },
    { from: 'p3.3',     to: 'bb.T-13', color: 'black',  note: 'Pot 3 to ground' },
    { from: 'p3.W',     to: 'mcu.A2',  color: 'yellow', note: 'Pot 3 wiper' },
    { from: 'b1.1A',    to: 'mcu.D2',  color: 'orange', note: 'Button 1, internal pull-up' },
    { from: 'b1.2A',    to: 'bb.T-18', color: 'black',  note: 'Button 1 to ground' },
    { from: 'b2.1A',    to: 'mcu.D3',  color: 'purple', note: 'Button 2' },
    { from: 'b2.2A',    to: 'bb.T-22', color: 'black',  note: 'Button 2 to ground' },
    { from: 'mcu.D4',   to: 'bb.e26',  color: 'white',  note: 'Status LED through 220 ohm' },
    { from: 'l1.A',     to: 'bb.a26',  color: 'white',  note: 'LED anode' },
    { from: 'l1.K',     to: 'bb.T-26', color: 'black',  note: 'LED cathode' }
  ]
},

wireIntro: `<p>Three pots and two buttons are drawn; the rest are identical. Every pot is the same three
connections and every button is the same two.</p>`,

wireNotes: `
<div class="note tip"><span class="t">Pot wiring, and which way round</span>
<p>Outer legs to 5&nbsp;V and ground, centre leg - the wiper - to the analogue input. If a knob reads 127 when
turned fully anticlockwise, swap the two outer legs. Nothing is damaged by having them the other way round.</p></div>

<div class="note warn"><span class="t">Use a data USB cable</span>
<p>Many cheap USB cables carry power only. Plugged into one, the controller lights up and the computer never
sees it, which looks exactly like a firmware problem and is not. Test with a cable you know syncs a phone.</p></div>

<div class="note"><span class="t">Analogue wires away from anything switching</span>
<p>ADC inputs are high impedance and pick up noise from nearby digital lines. Keep pot wiring short and away
from the LED drive wires, and a 100&nbsp;nF capacitor from each wiper to ground is a cheap improvement.</p></div>`,

solderIntro: `<p>The soldering is repetitive rather than difficult: eight pots, eight buttons and eight LEDs.
The panel layout is where the project is won or lost.</p>`,

solderSteps: [
  { h: 'Lay out the panel on paper first',
    body: `<p>Knob spacing needs to suit your hands - about 40&nbsp;mm centres for normal knobs, more if they
    are large. Sketch it, put your hand on the sketch, and adjust before drilling anything.</p>
    <p>Two knobs too close together is a thing you cannot fix afterwards.</p>` },
  { h: 'Common rails to all eight pots',
    body: `<p>Run one 5&nbsp;V wire and one ground wire along the row of pots and solder short stubs to each.
    Eight separate pairs back to the board is a rat's nest for no benefit.</p>` },
  { h: 'Wipers as a neat loom',
    body: `<p>Eight wiper wires to the multiplexer, ideally the same length, bundled and kept away from the LED
    wiring. These are the noise-sensitive ones.</p>` },
  { h: 'Buttons and LEDs together',
    body: `<p>Each button has its LED beside it. Wire them as a unit so a fault is localised to one control
    rather than spread across two looms.</p>` },
  { h: 'Test with a MIDI monitor before assembly',
    body: `<p>MIDI Monitor on a Mac, MIDI-OX on Windows. Turn each knob and watch the messages. This is where
    you will see jitter if your hysteresis is not working, and it is far easier to fix now than after
    everything is screwed into a panel.</p>` }
],

libraries: [
  { name: 'MIDIUSB', by: 'Arduino', why: 'Native USB MIDI for 32U4 and SAMD boards. This is what makes it driverless.' },
  { name: 'ResponsiveAnalogRead', by: 'Damien Clarke', why: 'Optional but excellent - adaptive filtering that is responsive when you move a knob and very still when you do not.' }
],

code: [{
  name: 'midi_controller.ino',
  code: `/* ------------------------------------------------------------------
   USB MIDI control surface - Pro Micro (ATmega32U4)

   8 pots through a 4051 multiplexer, 8 buttons, 8 LEDs.
   ------------------------------------------------------------------ */

#include <MIDIUSB.h>

#define MUX_S0   5
#define MUX_S1   6
#define MUX_S2   7
#define MUX_SIG  A0

#define N_POTS    8
#define N_BUTTONS 8
#define MIDI_CH   0        // channel 1, zero-indexed in the protocol

const int BUTTON_PIN[N_BUTTONS] = {2, 3, 4, 8, 9, 10, 16, 14};
const int LED_PIN[N_BUTTONS]    = {15, A1, A2, A3, 18, 19, 20, 21};

// Controller numbers. 1 is mod wheel, 7 is volume, 74 is filter cutoff -
// the rest are undefined and free for anything.
const byte POT_CC[N_POTS]    = {1, 7, 10, 71, 74, 75, 76, 77};
const byte BUTTON_NOTE[N_BUTTONS] = {36, 37, 38, 39, 40, 41, 42, 43};

int  lastSent[N_POTS];
bool latched[N_BUTTONS];
bool lastButton[N_BUTTONS];
unsigned long lastChange[N_BUTTONS];

void setup() {
  pinMode(MUX_S0, OUTPUT);
  pinMode(MUX_S1, OUTPUT);
  pinMode(MUX_S2, OUTPUT);

  for (int i = 0; i < N_BUTTONS; i++) {
    pinMode(BUTTON_PIN[i], INPUT_PULLUP);
    pinMode(LED_PIN[i], OUTPUT);
    lastButton[i] = true;
  }
  for (int i = 0; i < N_POTS; i++) lastSent[i] = -1;
}

void loop() {
  readPots();
  readButtons();
  MidiUSB.flush();       // nothing is sent until this is called
}

// ---- pots ------------------------------------------------------------
void readPots() {
  for (int i = 0; i < N_POTS; i++) {
    int raw = readMux(i);
    int value = map(raw, 0, 1023, 0, 127);

    /* Hysteresis against the last value SENT, not the last value read.
       A cheap pot wanders by two or three ADC counts while nobody is
       touching it, and without this the controller streams messages for
       a knob that is not moving - which floods the bus and fills a DAW's
       automation lane with noise. */
    if (abs(value - lastSent[i]) > 1 || (value != lastSent[i] && (value == 0 || value == 127))) {
      lastSent[i] = value;
      sendCC(POT_CC[i], value);
    }
  }
}

int readMux(int channel) {
  digitalWrite(MUX_S0, channel & 1);
  digitalWrite(MUX_S1, (channel >> 1) & 1);
  digitalWrite(MUX_S2, (channel >> 2) & 1);

  /* The mux needs a moment to settle, and the ADC's sample-and-hold
     capacitor needs time to charge through the pot's resistance. Read
     immediately and you get the previous channel bleeding into this one,
     which shows up as two knobs that affect each other. */
  delayMicroseconds(50);
  analogRead(MUX_SIG);          // discard: lets the S/H settle
  delayMicroseconds(10);

  // Average four. Cheap, and removes most of the remaining wander.
  long sum = 0;
  for (int i = 0; i < 4; i++) sum += analogRead(MUX_SIG);
  return sum / 4;
}

// ---- buttons ---------------------------------------------------------
void readButtons() {
  for (int i = 0; i < N_BUTTONS; i++) {
    bool now = digitalRead(BUTTON_PIN[i]);

    if (now != lastButton[i] && millis() - lastChange[i] > 25) {
      lastChange[i] = millis();
      lastButton[i] = now;

      if (!now) {                       // pressed (pull-up, so LOW)
        latched[i] = !latched[i];
        digitalWrite(LED_PIN[i], latched[i]);
        sendNoteOn(BUTTON_NOTE[i], 127);
      } else {
        sendNoteOff(BUTTON_NOTE[i]);
      }
    }
  }
}

// ---- MIDI ------------------------------------------------------------
void sendCC(byte control, byte value) {
  midiEventPacket_t e = {0x0B, (byte)(0xB0 | MIDI_CH), control, value};
  MidiUSB.sendMIDI(e);
}

void sendNoteOn(byte note, byte velocity) {
  midiEventPacket_t e = {0x09, (byte)(0x90 | MIDI_CH), note, velocity};
  MidiUSB.sendMIDI(e);
}

void sendNoteOff(byte note) {
  midiEventPacket_t e = {0x08, (byte)(0x80 | MIDI_CH), note, 0};
  MidiUSB.sendMIDI(e);
}`
}],

trouble: [
  { q: 'The computer does not see any MIDI device',
    a: `Charge-only USB cable, or a board without native USB. A Pro Micro, Leonardo or any SAMD board works; a
    classic Uno or Nano does not, because its USB is a separate chip speaking serial.` },
  { q: 'A stream of messages from knobs nobody is touching',
    a: `Hysteresis not working, or compared against the last value read rather than the last value sent. That
    distinction is the entire fix.` },
  { q: 'Two knobs affect each other',
    a: `Multiplexer crosstalk - reading too soon after switching channels. Increase the settle delay and keep
    the discarded first read.` },
  { q: 'One knob only reaches 120 or never quite reaches 0',
    a: `Normal for cheap pots - the track does not quite reach the ends. Constrain and rescale slightly, or
    map from the actual observed range rather than 0-1023.` },
  { q: 'Buttons trigger twice',
    a: `Debounce too short. 25&nbsp;ms suits most tactile switches; big arcade buttons sometimes need 50.` },
  { q: 'Values jump when an LED turns on',
    a: `LED current through a shared ground is shifting the analogue reference. Give the LEDs their own ground
    return to the board rather than sharing the pots' ground wire.` },
  { q: 'Messages arrive but nothing responds in the DAW',
    a: `The DAW needs to be told to listen, and usually to be put into a MIDI-learn mode. Most controllers
    require assigning each CC once.` },
  { q: 'Stepping is audible on a filter sweep',
    a: `Seven bits is 128 steps and that is genuinely audible on some parameters. Use 14-bit CCs - send an MSB
    and an LSB pair - if your software supports them.` }
],

next: `
<ul>
  <li><strong>14-bit CCs</strong> for the controls where stepping is audible. Two messages instead of one, and
  the resolution goes from 128 steps to 16,384.</li>
  <li><strong>Motorised faders</strong> if you want the controller to follow the software rather than only
  leading it. Considerably harder and extremely satisfying.</li>
  <li><strong>Add the <a href="project.html?p=arduino-theremin">theremin</a>’s ultrasonic sensor</strong>
  as an expression control. It is a genuinely playable way to send CC data.</li>
  <li><strong>MIDI over DIN as well</strong>, with an optocoupler and a 5-pin socket, so it drives hardware
  synths that predate USB.</li>
  <li><strong>Make the panel out of something nice.</strong> This is a thing you touch, and plywood or aluminium
  changes the experience more than any firmware change will.</li>
</ul>`
});
