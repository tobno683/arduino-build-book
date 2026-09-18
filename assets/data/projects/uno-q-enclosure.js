/* The enclosure's real job: making it safe to unplug a Linux board. */
AB.addProject({
slug: 'uno-q-enclosure',
title: 'UNO Q enclosure with a safe-shutdown button',
cat: 'printing',
level: 2,
time: '6 hours, plus print time',
solder: true,
board: 'Arduino UNO Q',
printed: true,
tags: ['3d printing', 'enclosure', 'uno q', 'linux', 'safe shutdown', 'emmc', 'camera mount', 'media carrier', 'petg'],
blurb: 'A printed case and camera mount for the UNO Q, with one button that does something no case usually does: shuts the Linux side down cleanly and tells you when it is actually safe to pull the plug.',

skills: ['Designing to a published hole pattern', 'Print tolerances', 'Two computers on one board', 'Clean Linux shutdown', 'Status indication people actually read', 'Printed camera mounts'],

intro: `
<p>The UNO Q is two computers on one board: a Linux system running Python and OpenCV, and a microcontroller
driving the pins. It is an unusually good board for vision projects, and it has the problem every Linux board
has - <strong>pull the power without shutting down and you eventually corrupt its storage</strong>. The
<a href="basics/boards.html#uno-q">board guide</a> lists this as the first gotcha.</p>
<p>On a desk, you type <code>shutdown</code>. Inside a finished enclosure on a shelf, with no keyboard, people
just unplug it - and after enough of those, the eMMC fails to boot.</p>
<p>So this case has a job beyond holding the board. One button asks the Linux side to shut down properly, and a
light ring tells you what state it is in, ending in a clear "safe to unplug". It uses exactly the two-computer
split the UNO Q is built around.</p>`,

what: [
  'Hold the UNO Q and the Media Carrier, with every port and the camera connectors reachable.',
  'Mount a camera on an adjustable printed arm, since this board is so often used for vision.',
  'Shut the Linux side down cleanly from one button, without a keyboard or a network.',
  'Show booting, running, shutting down and safe-to-unplug as distinct, unmistakable states.',
  'Stay cool passively - this board does not need the fan a Jetson does.'
],

how: `
<p><strong>A published hole pattern, finally.</strong> Unlike the Jetson, the UNO Q uses the Uno form factor:
68.6&nbsp;x&nbsp;53.4&nbsp;mm, with 3.2&nbsp;mm holes that take M3 screws. The pattern is famously irregular -
it dates back to the Arduino NG - and it is exactly documented, with Adafruit's drawing the usual reference.</p>
<p>That makes this a good first enclosure. You can design from the drawing with some confidence. You should
still print a flat test plate and screw the board to it first, because a clone Uno can be a fraction of a
millimetre off, and so can your printer.</p>

<p><strong>Tolerances: holes shrink, pegs grow.</strong> An FDM printer squashes each layer slightly, so a
printed 3.2&nbsp;mm hole comes out nearer 3.0 and a printed 3.2&nbsp;mm peg nearer 3.4. Design holes 0.2-0.3&nbsp;mm
oversize, and check with the test plate rather than trusting the number.</p>
<p>Connector cut-outs need more. A USB-C socket is small; the plug that goes into it has a moulded body much
wider than the socket. Size the cut-out for the plug, not the socket, or you will find the case works only with
one particular cable.</p>

<p><strong>Why this board can be passively cooled.</strong> The UNO Q's Qualcomm processor draws a few watts,
not the Jetson's twenty-five. Vent slots top and bottom let convection do the work - cool air in underneath,
warm air out the top - with no fan to fail or whine.</p>
<p>PETG is still the better material, because a case sitting in afternoon sun on a windowsill will pass PLA's
softening point even when the board is off.</p>

<p><strong>The safe shutdown uses both halves of the board.</strong> The microcontroller side watches the
button and drives the light ring; it is always running and responds instantly. The Linux side does the actual
shutdown. They talk over the Bridge the UNO Q provides between them.</p>
<p><strong>The Bridge has one rule that shapes the whole design: Linux starts every conversation, and the MCU
can only answer.</strong> The MCU cannot call into Linux to say "please shut down". So the design inverts:</p>
<ol>
  <li>Linux calls the MCU once a second. That poll <em>is</em> the heartbeat - the MCU knows Linux is alive
  because the calls keep arriving.</li>
  <li>Button held for two seconds, so a knock does not trigger it. The MCU turns the ring amber and raises a
  flag.</li>
  <li>On its next poll, Linux gets the flag back as the reply and runs a proper shutdown, which flushes and
  unmounts the storage.</li>
  <li>The polls stop. After eight seconds of silence the MCU turns the ring a steady green: <strong>safe to
  unplug</strong>.</li>
</ol>
<p>Treat the one-way rule as a feature. The MCU can never be the thing that hangs a Linux process, and the
heartbeat costs nothing extra because the polling was needed anyway.</p>
<p>The last step is the one that matters. "Shutting down" is not the same as "shut down", and the light has to
say which. Unplugging during the amber phase is exactly as bad as never pressing the button.</p>

<p><strong>Status lights have to be unambiguous in a glance.</strong> A light that means different things
depending on whether it is blinking fast or slow will be misread. Use colour for state and keep the animations
distinct: slow pulse while booting, dim steady while running, amber while shutting down, bright green when safe.
Nobody needs the manual for that.</p>

<p><strong>A printed camera arm.</strong> Vision projects need the camera held still at a repeatable angle. A
two-joint printed arm with a friction hinge - a printed pin through a slightly undersized hole, tightened with
a nut - holds position far better than a gooseneck, and costs a few grams of filament.</p>`,

bom: [
  { id: 'uno-q', qty: 1, note: 'The board. Uno form factor, so the hole pattern is published.' },
  { id: 'uno-media', qty: 1, note: 'Gives the enclosure proper CSI camera connectors and audio jacks. Design the case around it from the start rather than adding it later.' },
  { id: 'petg', qty: 1, note: 'Not PLA - a case on a sunny windowsill passes PLA’s softening point even with the board switched off. The case and arm together are well under 200 g.' },
  { id: 'heatset', qty: 1, note: 'For the lid screws. It will be opened many times while you develop.' },
  { id: 'ws2812-ring', qty: 1, note: 'The status ring, behind a diffusing window in the lid. Colour tells you the state from across a room.' },
  { id: 'button', qty: 1, note: 'The shutdown button. A large one - it is the only control on the case.' },
  { id: 'res220', qty: 1, note: 'On the LED data line.' },
  { id: 'cap1000', qty: 1, note: 'Across the ring supply.' },
  { id: 'usb-cam', qty: 1, note: 'On the printed arm. Or a CSI camera into the Media Carrier, which is the better image.' },
  { id: 'psu5v3a', qty: 1, note: 'The UNO Q wants a real 5 V 3 A supply. A weak one is itself a cause of storage corruption, through brownouts mid-write.' },
  { id: 'calipers', qty: 1 },
  { id: 'standoffs', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'calipers' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'unoq',       at: [0, 50] },
    { id: 'bb',   comp: 'bb400',      at: [0, -14] },
    { id: 'ring', comp: 'ws2812ring', at: [-52, -60] },
    { id: 'btn',  comp: 'button',     at: [20, -58] },
    { id: 'cam',  comp: 'webcam',     at: [66, 50] }
  ],
  wires: [
    { from: 'mcu.5V',   to: 'bb.T+1',  color: 'red',    note: '5 V rail for the ring' },
    { from: 'mcu.GND1', to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'ring.5V',  to: 'bb.T+5',  color: 'red',    note: 'Ring power, with the 1000 uF across it' },
    { from: 'ring.GND', to: 'bb.T-5',  color: 'black',  note: 'Ring ground' },
    { from: 'ring.DI',  to: 'bb.e10',  color: 'green',  note: 'Data line through the 220 ohm resistor' },
    { from: 'bb.a10',   to: 'mcu.D6',  color: 'green',  note: 'Resistor to the microcontroller side' },
    { from: 'btn.1A',   to: 'mcu.D2',  color: 'yellow', note: 'Shutdown button, internal pull-up, on the always-running MCU side' },
    { from: 'btn.2A',   to: 'bb.T-16', color: 'black',  note: 'Button to ground' },
    { from: 'cam.USB',  to: 'mcu.USB', color: 'white',  note: 'Camera to the Linux side' }
  ]
},

wireIntro: `<p>Deliberately simple: a light ring and a button on the microcontroller side, a camera on the Linux
side. The design interest is entirely in how the two halves of the board cooperate.</p>`,

wireNotes: `
<div class="note tip"><span class="t">The button lives on the microcontroller side, on purpose</span>
<p>The MCU is running from the moment power arrives and never stops, so it can respond to the button even
while Linux is still booting or has hung. Wiring the button to the Linux side would mean a button that does
nothing when you most need it.</p></div>

<div class="note warn"><span class="t">3.3 V on the headers</span>
<p>The UNO Q's headers are 3.3&nbsp;V despite the Uno shape. The WS2812 ring is powered from 5&nbsp;V and its
data input is driven at 3.3&nbsp;V, which works for most rings at the edge of their specification. If yours
flickers, add a small level shifter on the data line.</p></div>

<div class="note"><span class="t">Size cut-outs for plugs, not sockets</span>
<p>Measure the widest cable you will actually use, at its moulded plug body, and add 0.5&nbsp;mm. A case that
only fits the cable that came in the box will be wrong within a month.</p></div>`,

solderIntro: `<p>Almost no soldering: the ring's three wires, its resistor and capacitor, and the button. The
effort is in the print, and in a test plate before the full case.</p>`,

solderSteps: [
  { h: 'Test plate first, even with a published pattern',
    body: `<p>A 3&nbsp;mm plate with the four Uno posts. Print it, screw the board on, confirm every post meets
    a hole. A printer that is a few percent out in one axis will show it here, cheaply.</p>` },
  { h: 'Model the Media Carrier in from the start',
    body: `<p>It sits on the board and adds height and connectors. Adding it to a case designed without it
    usually means a new case.</p>` },
  { h: 'Vent slots top and bottom for convection',
    body: `<p>Slots, not round holes - they pass more air for the same strength. Low on the base, high on the
    lid, so warm air has a path up and out.</p>` },
  { h: 'A diffusing window for the ring',
    body: `<p>Print the window section in a single thin layer of white or natural PETG, about 0.8&nbsp;mm. It
    diffuses the LEDs into an even glow rather than twelve bright dots, and it is part of the lid rather than a
    separate piece.</p>` },
  { h: 'The ring, with its resistor and capacitor at the ring',
    body: `<p>220&nbsp;ohm in the data line and 1000&nbsp;uF across the supply, both at the ring end.</p>` },
  { h: 'A friction joint for the camera arm',
    body: `<p>Print the pin 0.1&nbsp;mm undersize for its hole, and clamp it with an M3 bolt and nyloc nut. You
    tune the stiffness with the nut, and it holds position without drifting.</p>` }
],

libraries: [
  { name: 'Adafruit NeoPixel', by: 'Adafruit', why: 'The status ring, on the microcontroller side.' },
  { name: 'Arduino_RouterBridge', by: 'Arduino (UNO Q core)', why: 'The RPC link between the two halves. Linux calls, the MCU answers - the MCU cannot initiate, which is why this design polls.' }
],

code: [{
  name: 'safe_shutdown_mcu.ino',
  code: `/* ------------------------------------------------------------------
   UNO Q safe shutdown - MICROCONTROLLER side

   The Bridge is one-way in who starts a conversation: Linux calls, the
   MCU answers. The MCU can never call into Linux. So Linux polls us once
   a second - and that polling IS the heartbeat. When it stops, Linux has
   stopped.
   ------------------------------------------------------------------ */

#include "Arduino_RouterBridge.h"
#include <Adafruit_NeoPixel.h>

#define BUTTON   2
#define RING_PIN 6
#define N_LEDS   12

Adafruit_NeoPixel ring(N_LEDS, RING_PIN, NEO_GRB + NEO_KHZ800);

enum State { BOOTING, RUNNING, SHUTTING_DOWN, SAFE };
State state = BOOTING;

unsigned long pressedAt = 0;
unsigned long lastPoll = 0;
bool shutdownRequested = false;

void setup() {
  pinMode(BUTTON, INPUT_PULLUP);
  ring.begin();
  ring.setBrightness(60);

  Bridge.begin();

  /* provide_safe, not provide. provide() runs the callback immediately,
     at the moment the call arrives - and this callback changes \`state\`,
     which loop() is also reading. provide_safe() runs it inside loop()
     instead, so the two can never race. */
  Bridge.provide_safe("poll", onPoll);
}

/* Linux calls this every second. The return value is the only way the
   MCU can ever ask Linux for anything: 1 means "please shut down". */
int onPoll() {
  lastPoll = millis();
  if (state == BOOTING) state = RUNNING;
  return shutdownRequested ? 1 : 0;
}

void loop() {
  handleButton();

  /* The distinction this whole project exists for. "Shutting down" is not
     "shut down" - unplugging during the amber phase is exactly as bad as
     never pressing the button. Only a long silence from Linux, after it
     has been asked to stop, means the storage has been unmounted. */
  if (state == SHUTTING_DOWN && millis() - lastPoll > 8000) {
    state = SAFE;
  }

  // Linux stopped polling without being asked. Say so, but do NOT claim it
  // is safe - we have no idea whether it unmounted cleanly.
  if (state == RUNNING && millis() - lastPoll > 15000) state = BOOTING;

  render();
  delay(20);
}

void handleButton() {
  bool down = digitalRead(BUTTON) == LOW;
  if (down && pressedAt == 0) pressedAt = millis();
  if (!down) pressedAt = 0;

  // Two seconds, so a knock does not shut it down. We cannot tell Linux
  // directly; we raise a flag and Linux collects it on its next poll.
  if (down && state == RUNNING && millis() - pressedAt > 2000) {
    shutdownRequested = true;
    state = SHUTTING_DOWN;
    pressedAt = 0;
  }
}

/* One colour per state. A light whose meaning depends on blink speed gets
   misread; a colour does not. */
void render() {
  unsigned long t = millis();
  uint32_t c;

  switch (state) {
    case BOOTING: {                                     // slow blue pulse
      uint8_t v = (sin(t / 600.0) + 1) * 40;
      c = ring.Color(0, 0, v);
      break;
    }
    case RUNNING:                                        // dim steady white
      c = ring.Color(12, 12, 12);
      break;
    case SHUTTING_DOWN: {                               // amber, chasing
      ring.clear();
      ring.setPixelColor((t / 90) % N_LEDS, ring.Color(90, 40, 0));
      ring.show();
      return;
    }
    case SAFE:                                           // bright steady green
      c = ring.Color(0, 90, 0);
      break;
  }
  ring.fill(c);
  ring.show();
}`
}, {
  name: 'safe_shutdown_linux.py',
  code: `#!/usr/bin/env python3
"""UNO Q safe shutdown - LINUX side.

Linux starts every conversation over the Bridge; the MCU can only answer.
So this polls the MCU once a second. The poll doubles as the heartbeat,
and the MCU's reply is how it asks us to shut down.

Install as a systemd service so it starts at boot.
"""
import subprocess
import time

from arduino.app_utils import *


def shutdown():
    # A proper shutdown flushes buffers and unmounts the eMMC - which is
    # the entire point. Pulling the power skips both.
    subprocess.run(["sync"])
    subprocess.run(["systemctl", "poweroff"])


while True:
    try:
        if Bridge.call("poll") == 1:
            shutdown()
            break
    except Exception:
        # The MCU may be mid-reset. Do not let one failed call kill the
        # heartbeat - the MCU would then wrongly decide we had stopped.
        pass
    time.sleep(1)`
}],

trouble: [
  { q: 'The board does not line up with the printed posts',
    a: `Your printer is out in one axis, or the holes are printed undersize. The flat test plate shows which -
    fix the scaling or add clearance, then reprint the plate before the case.` },
  { q: 'The ring goes green while Linux is still shutting down',
    a: `The silence timeout is too short for your board. Shutdown can take longer than expected when a service
    is slow to stop - lengthen the eight seconds until green never appears before the board is genuinely off.
    Erring long is the safe direction.` },
  { q: 'The ring turns amber but it never shuts down',
    a: `Nothing on the Linux side is polling, so the flag is raised and never collected. The MCU cannot call
    Linux itself - that is the Bridge's one-way rule. Check the Linux service with <code>systemctl status</code>
    and make sure it is enabled to start at boot.` },
  { q: 'The ring drops from running back to blue at random',
    a: `A poll failed and the Linux script died on the exception, so the heartbeat stopped. The script catches
    exceptions around each call for exactly this reason - one bad call must not end the heartbeat.` },
  { q: 'The ring stays blue after booting',
    a: `No polls are arriving. Either the Linux service has not started, or the Bridge is not up. The MCU
    correctly refuses to say "running" until Linux has called it at least once.` },
  { q: 'Ring colours glitch occasionally',
    a: `The callback was registered with <code>provide()</code> rather than <code>provide_safe()</code>, so it
    runs mid-way through <code>loop()</code> and races with the rendering. <code>provide_safe()</code> runs it
    inside the loop instead.` },
  { q: 'The ring flickers or shows the wrong colours',
    a: `3.3&nbsp;V data into a 5&nbsp;V ring, at the edge of what it accepts. A small level shifter on the data
    line fixes it.` },
  { q: 'Some USB cables will not fit the case',
    a: `The cut-out was sized for the socket rather than for the moulded plug body. Widen it by a millimetre.` },
  { q: 'The case gets warm to the touch',
    a: `Normal for a Linux board under load, but check the vent slots are not blocked by where it sits. A case
    flat on a desk has its bottom vents sealed - print small feet.` }
],

safety: `
<div class="note"><span class="t">Printing safety</span>
<p>The general notes are in the <a href="basics/printing.html">3D printing guide</a>. The two that matter most:
never leave a printer running unattended, and do not use PLA for anything that will sit somewhere warm.</p></div>`,

next: `
<ul>
  <li><strong>Put the <a href="project.html?p=uno-q-object-detection">object detection</a> project in
  it</strong>, with the camera on the printed arm - this is the case that project was missing.</li>
  <li><strong>A small display in the lid</strong> showing IP address and status, which removes most reasons to
  ever plug in a keyboard.</li>
  <li><strong>The same shutdown button on any Linux board.</strong> A Raspberry Pi has exactly the same storage
  problem, and a small microcontroller watching a button solves it the same way.</li>
  <li><strong>Compare with the <a href="project.html?p=jetson-orin-case">Jetson case</a></strong>, which is
  the same design problem at ten times the heat and needs active cooling as a result.</li>
</ul>`
});
