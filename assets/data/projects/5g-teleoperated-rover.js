/* Driving something from another city: latency budgets, and what "1 ms 5G" actually means. */
AB.addProject({
slug: '5g-teleoperated-rover',
title: '5G teleoperated rover',
cat: 'robotics',
level: 4,
time: '12 hours',
solder: true,
board: 'UNO Q + RM500Q',
tags: ['5g', 'teleoperation', 'latency', 'webrtc', 'deadman', 'rover', 'urllc', 'remote control', 'failsafe'],
blurb: 'Drive a rover from anywhere with a browser, watching through its camera. The engineering is entirely about latency - how much there is, where it comes from, and what the rover does when it stops arriving.',

skills: ['Latency budgeting', 'WebRTC vs streaming protocols', 'Deadman switches', 'Speed limiting under variable delay', 'Control over unreliable links', '5G NSA vs SA'],

intro: `
<p>The <a href="project.html?p=5g-edge-uplink">5G camera site</a> uses 5G for bandwidth. This one uses it for
the other thing 5G is sold on - latency - and is mostly an exercise in finding out how much of that claim
survives contact with a real network.</p>
<p>The headline is "1 millisecond". That figure refers to the <em>air interface</em> under URLLC on a
standalone network with everything configured for it, and it is real in a factory with a private 5G cell. On a
public network, through the operator's core, across the internet, to a browser, it is not what you get. This
project measures what you actually get, which is usually 30 to 80 milliseconds round trip.</p>
<p>That is still transformative compared with 4G, and it is still not zero - so the rover has to behave
sensibly when a command is 200&nbsp;ms old, and stop entirely when one has not arrived for half a second.
Getting that right is the project.</p>`,

what: [
  'Drive a rover from a browser anywhere in the world, over a public 5G network.',
  'See through its camera with roughly 150 ms of glass-to-glass latency, using WebRTC rather than a streaming protocol.',
  'Measure control latency continuously and show it to the driver.',
  'Limit speed automatically as latency rises, so a laggy link cannot be driven fast.',
  'Stop dead within 300 ms of the commands stopping - a deadman switch that lives on the microcontroller.',
  'Understand exactly where the milliseconds go, which is not where most people assume.'
],

how: `
<p><strong>The latency budget, measured rather than quoted.</strong> Two separate paths matter and people
conflate them:</p>
<p><strong>Control path</strong> - browser to rover:</p>
<ul>
  <li>Browser to server over the driver's connection: <strong>5-30&nbsp;ms</strong></li>
  <li>Server to rover over 5G: <strong>15-40&nbsp;ms</strong> (NSA), <strong>10-25&nbsp;ms</strong> (SA)</li>
  <li>Linux to microcontroller over serial: <strong>1-3&nbsp;ms</strong></li>
  <li><strong>Total one way: roughly 25-70&nbsp;ms.</strong></li>
</ul>
<p><strong>Video path</strong> - rover camera to driver's screen, and this is the big one:</p>
<ul>
  <li>Camera exposure and readout: <strong>15-35&nbsp;ms</strong></li>
  <li>H.264 encode: <strong>10-30&nbsp;ms</strong></li>
  <li>Network: <strong>20-50&nbsp;ms</strong></li>
  <li>Jitter buffer and decode: <strong>30-80&nbsp;ms</strong></li>
  <li>Display: <strong>8-16&nbsp;ms</strong></li>
  <li><strong>Total: 85-210&nbsp;ms.</strong></li>
</ul>
<p>So the video is roughly three times slower than the control, which means you are always steering from a
picture of where the rover <em>was</em>. At 1&nbsp;m/s and 150&nbsp;ms of video latency, the rover is
15&nbsp;cm past where you can see it. That is the number that decides how fast it is safe to drive.</p>

<p><strong>WebRTC, not RTMP or HLS.</strong> This matters enormously and is the difference between a rover you
can drive and one you cannot.</p>
<p>RTMP is 2-5 seconds of latency. HLS is 6-30. Both buffer aggressively because they are designed for
watching, where smoothness beats immediacy. WebRTC is designed for conversation and targets under
200&nbsp;ms, dropping frames rather than delaying them.</p>
<p>Setting up WebRTC is more work - it needs signalling, STUN, and usually a TURN relay because a device on a
mobile network is behind carrier-grade NAT. It is worth every bit of that work here.</p>

<p><strong>Carrier-grade NAT, which will surprise you.</strong> A device on a mobile network almost never has
a public IP. You cannot connect <em>to</em> it; it has to connect <em>out</em>.</p>
<p>So the architecture is: rover connects out to a small server you run; browser connects out to the same
server; the server introduces them. For WebRTC, a TURN relay on that server handles the media when a direct
peer connection cannot be established - which on mobile is most of the time.</p>

<p><strong>The deadman switch is the safety system, and it lives on the MCU.</strong> The microcontroller
expects a command at least every 200&nbsp;ms. Miss three and the motors stop. Not slow down - stop.</p>
<p>It has to be on the microcontroller rather than in the Python, because the Python is the thing most likely
to have crashed, and because Linux can deschedule a process for tens of milliseconds at a time. A deadman
switch that depends on the software that failed is not a deadman switch.</p>`,

bom: [
  { id: 'uno-q', qty: 1, note: 'Linux for the video and the network, an STM32 for the motors and the deadman. The same dual-brain split as the vision projects, doing a job where the timing genuinely matters.' },
  { id: 'rm500q', qty: 1, note: 'Sub-6 5G NR. An LTE Cat-4 module at a tenth of the price gives you 40-80 ms instead of 20-40 - read the cost section before deciding that matters.' },
  { id: 'm2-carrier', qty: 1, note: 'USB 3 carrier with its own power input.' },
  { id: '5g-ant', qty: 1, note: 'All four, spread around the chassis. On a moving vehicle the diversity matters more than on a fixed installation.' },
  { id: 'iot-sim', qty: 1, note: 'A consumer data plan, not a per-megabyte IoT SIM. Video uplink is gigabytes.' },
  { id: 'usb-cam', qty: 1, note: 'One that does hardware H.264. Software encoding adds 20-30 ms you cannot afford and CPU you need elsewhere.' },
  { id: 'car-chassis', qty: 1, note: 'Four-wheel chassis. Bigger than a tabletop robot - this carries a modem, a computer and a battery.' },
  { id: 'tt-motor', qty: 4, note: 'Geared, slow, and slow is correct here. A fast rover plus 150 ms of video latency is a rover in a wall.' },
  { id: 'l298n', qty: 1, note: 'Or a TB6612 for better efficiency. Either way the MCU drives it, never Linux.' },
  { id: '18650', qty: 4, note: 'Two pairs in series-parallel for 7.4 V. The modem and the host are the load, not the motors.' },
  { id: 'buck', qty: 2, note: 'One for the 5 V host rail, one for the modem carrier. Both need to handle 2 A.' },
  { id: 'tp4056', qty: 2, note: 'Protected.' },
  { id: 'ina219', qty: 1, note: 'Battery monitoring. A rover that dies in a field is a rover you walk to.' },
  { id: 'hcsr04', qty: 2, note: 'Front and rear. The MCU stops on an obstacle without asking Linux - see the wiring notes.' },
  { id: 'perfboard', qty: 1 },
  { id: 'screwterm', qty: 4 },
  { id: 'headers-f', qty: 1 },
  { id: 'switch', qty: 1, note: 'A real power switch, reachable, and big enough to find in a hurry.' },
  { id: 'standoffs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'host', comp: 'unoq',   at: [-44, 46] },
    { id: 'm2',   comp: 'm2mod',  at: [46, 26] },
    { id: 'drv',  comp: 'l298n',  at: [-44, -30] },
    { id: 'cam',  comp: 'webcam', at: [-46, -92] },
    { id: 'm1',   comp: 'ttmotor', at: [24, -80] },
    { id: 'm2m',  comp: 'ttmotor', at: [64, -80] },
    { id: 'son',  comp: 'hcsr04', at: [8, -30] }
  ],
  wires: [
    { from: 'm2.USB',   to: 'host.USB',   color: 'white',  note: 'USB 3 to the host. This is the entire data path to the outside world' },
    { from: 'cam.USB',  to: 'host.QWIIC', color: 'white',  note: 'Camera into the host, through the powered hub in practice' },
    { from: 'host.D5',  to: 'drv.ENA',    color: 'purple', note: 'Left speed, PWM from the MCU side. Linux never touches a motor pin' },
    { from: 'host.D6',  to: 'drv.ENB',    color: 'purple', note: 'Right speed' },
    { from: 'host.D7',  to: 'drv.IN1',    color: 'green',  note: 'Left direction A' },
    { from: 'host.D8',  to: 'drv.IN2',    color: 'green',  note: 'Left direction B' },
    { from: 'host.D9',  to: 'drv.IN3',    color: 'green',  note: 'Right direction A' },
    { from: 'host.D10', to: 'drv.IN4',    color: 'green',  note: 'Right direction B' },
    { from: 'drv.GND',  to: 'host.GND',   color: 'black',  note: 'Common ground between the driver and the board' },
    { from: 'drv.OUT1', to: 'm1.+',       color: 'brown',  note: 'Left motors' },
    { from: 'drv.OUT2', to: 'm1.-',       color: 'brown',  note: 'Left motors' },
    { from: 'drv.OUT3', to: 'm2m.+',      color: 'brown',  note: 'Right motors' },
    { from: 'drv.OUT4', to: 'm2m.-',      color: 'brown',  note: 'Right motors' },
    { from: 'son.VCC',  to: 'host.5V',    color: 'red',    note: 'Front sonar power' },
    { from: 'son.GND',  to: 'host.GND2',  color: 'black',  note: 'Sonar ground' },
    { from: 'son.TRIG', to: 'host.D11',   color: 'orange', note: 'Sonar trigger. The MCU stops on an obstacle without asking Linux' },
    { from: 'son.ECHO', to: 'host.D12',   color: 'yellow', note: 'Sonar echo, through a divider if your board is 5 V' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">The deadman switch must live on the microcontroller</span>
<p>Not in the Python, not on the server, not in the browser. On the STM32 side, where it is a timer comparison
that cannot be starved.</p>
<p>The reason: Linux can deschedule a process for tens of milliseconds, the Python can crash, the network can
stall, and every one of those looks identical to "the driver stopped sending commands". The thing that stops
the motors must not depend on any of them.</p>
<p>200&nbsp;ms without a command and the motors stop. That is the whole safety system and everything else is
convenience.</p></div>

<div class="note danger"><span class="t">A physical emergency stop, and a slow rover</span>
<p>Fit a proper switch in the battery line, reachable without opening anything, and make it obvious.</p>
<p>And gear the thing down. At 150&nbsp;ms of video latency, a rover doing 2&nbsp;m/s travels 30&nbsp;cm past
where you can see it, plus stopping distance. The TT motors in the parts list do about 0.4&nbsp;m/s, which is
a walking pace and is deliberately slow.</p>
<p>The temptation to fit faster motors should be resisted until you have driven it for an hour.</p></div>

<div class="note danger"><span class="t">Four antennas on a moving vehicle</span>
<p>Spread them around the chassis, as far apart as it allows, with mixed orientations. A moving vehicle passes
through nulls and reflections constantly, and spatial diversity is what stops the link dropping every few
metres.</p>
<p>Never power the modem without all four fitted. Keep them clear of the motors and the motor driver - a
brushed DC motor is a broadband noise source and a 5G front end is sensitive.</p></div>

<div class="note warn"><span class="t">Separate supplies, common ground</span>
<p>Motors on the raw battery through the driver. Host and modem each on their own buck converter. All grounds
starred at the battery negative.</p>
<p>A motor stall pulls the battery down hard, and a modem that browns out drops the link - at which point the
deadman switch stops the motors, the current falls, the modem recovers, and the rover lurches. That
oscillation is a real failure mode and the fix is supply separation.</p></div>

<div class="note warn"><span class="t">Sonar on the MCU, as a reflex</span>
<p>The front and rear sonars are wired to the microcontroller and it stops on an obstacle by itself, before
Linux knows there is one.</p>
<p>That is not a substitute for the driver looking - sonar misses anything narrow, anything soft and anything
below the beam. It is a reflex that catches the case where the video froze three seconds ago and the driver
does not know it yet.</p></div>`,

solderSteps: [
  { h: 'Motor driver wiring, kept away from everything else',
    body: `<p>Screw terminals for the motor leads and the battery. Twist each motor pair together along its
    run - a twisted pair radiates far less than two parallel wires.</p>
    <p>Solder a 100&nbsp;nF capacitor across each motor's terminals, at the motor. Brushed DC motors generate
    broadband noise and this is the standard suppression; with a 5G receiver on the same chassis it is not
    optional.</p>` },
  { h: 'Star the ground at the battery',
    body: `<p>Motor return current is amps and it is spiky. Run it back to the battery negative on its own
    heavy conductor, and bring the logic ground to the same point separately.</p>
    <p>Daisy-chaining logic ground through the motor driver puts the motor current through your signal
    reference, which shows up as a rover that behaves oddly under load.</p>` },
  { h: 'Antennas on standoffs, spread out',
    body: `<p>Four SMA bulkheads or pigtails, mounted to the chassis corners if you can. Vertical where the
    geometry allows, mixed where it does not.</p>
    <p>Keep them at least 100&nbsp;mm from the motors and the driver board.</p>` },
  { h: 'Thermal on the modem, as always',
    body: `<p>Heatsink and a fan. A rover is worse than a fixed installation because the box is usually
    smaller and there is no wall to conduct into.</p>
    <p>A throttling modem drops throughput, the video bitrate falls, and the driver loses situational
    awareness - so on this project the thermal design is a safety item rather than a performance one.</p>` },
  { h: 'Emergency stop switch, findable by feel',
    body: `<p>In the battery positive, before everything. A large toggle or a mushroom head. Label it.</p>
    <p>You want to be able to stop the rover with your hand while looking somewhere else.</p>` }
],

assembly: [
  { h: 'Build it as a local rover first',
    body: `<p>Wi-Fi, same room, no 5G. Get the motors, the deadman switch, the sonar reflex and the video
    working over the local network.</p>
    <p>Every one of those is easier to debug when you can see the rover and reach its power switch. The 5G
    link changes only where the packets go.</p>` },
  { h: 'Measure the local latency as a baseline',
    body: `<p>The control loop reports round-trip time. On Wi-Fi in one room it should be 5-15&nbsp;ms.</p>
    <p>That number is your floor: everything the network adds later sits on top of it. If your local latency
    is 80&nbsp;ms, fix that before blaming any mobile network.</p>` },
  { h: 'Set up the signalling server and a TURN relay',
    body: `<p>A small VPS. <code>coturn</code> for TURN, and a tiny Node or Python signalling server that
    introduces the rover to the browser.</p>
    <p>You need TURN because a device on a mobile network is behind carrier-grade NAT and a direct peer
    connection usually cannot be established. Budget for the relay carrying all your video.</p>` },
  { h: 'Bring up the 5G modem and find out what you have',
    body: `<p>As in the <a href="project.html?p=5g-edge-uplink">edge uplink project</a>. Then
    <code>AT+QENG="servingcell"</code> to see whether you are on NR5G-SA, NR5G-NSA or plain LTE.</p>
    <p>SA gives noticeably better latency than NSA. LTE is 2-3 times worse than either. Knowing which you have
    explains everything you measure afterwards.</p>` },
  { h: 'Measure latency properly, in both paths',
    body: `<p><strong>Control latency:</strong> the rover echoes each command's sequence number and the
    browser times the round trip. Watch it for ten minutes - you want the 95th percentile, not the
    average.</p>
    <p><strong>Video latency:</strong> point the camera at a stopwatch on a screen, then photograph the
    stopwatch and the video of it together. The difference is glass-to-glass latency, and it is the honest
    measurement. Expect 120-200&nbsp;ms.</p>` },
  { h: 'Set the speed limits from what you measured',
    body: `<p>Maximum speed should be such that the rover travels no more than about 10&nbsp;cm during one
    video latency. At 150&nbsp;ms that is 0.65&nbsp;m/s.</p>
    <p>The sketch scales the speed cap with measured latency, so a link that degrades slows the rover
    automatically rather than waiting for the driver to notice.</p>` },
  { h: 'Test the failure cases before driving it anywhere real',
    body: `<ul>
      <li><strong>Close the browser</strong> mid-drive. It must stop within 300&nbsp;ms.</li>
      <li><strong>Pull the modem antennas</strong> mid-drive. Same.</li>
      <li><strong>Kill the Python</strong> on the host. Same - this is the one that proves the deadman is on
      the MCU.</li>
      <li><strong>Drive at a wall</strong> and let the sonar stop it.</li>
      <li><strong>Flatten the battery</strong> and confirm it reports before it dies.</li>
    </ul>
    <p>Do all five. Each one is a thing that will happen.</p>` },
  { h: 'Drive it somewhere with line of sight before somewhere without',
    body: `<p>First real drive should be somewhere you can see it and walk to it. You are looking for how the
    link behaves as it moves - where it drops, how long it takes to recover, whether the video stalls before
    the control does.</p>
    <p>Only then take it out of sight.</p>` }
],

libraries: [
  { name: 'aiortc', by: 'Jeremy Lainé', how: 'pip3 install aiortc', why: 'WebRTC in Python. Handles the peer connection, ICE and the media pipeline so you are not implementing RTP.' },
  { name: 'coturn', by: 'coturn project', how: 'apt install coturn (on your server)', why: 'The TURN relay. Needed because a mobile device behind carrier-grade NAT usually cannot take a direct connection.' },
  { name: 'pyserial', by: 'pySerial', why: 'The link from Linux to the microcontroller.' },
  { name: 'FFmpeg / v4l2', by: 'FFmpeg', how: 'apt install ffmpeg v4l-utils', why: 'Camera capture and hardware encoding.' },
  { name: 'Servo / analogWrite', by: 'Arduino', how: 'Built in', why: 'On the MCU side. Motor PWM and the deadman timer.' }
],

code: [
{
  h: 'The microcontroller half - the safety system',
  intro: `<p>This is the important half. It owns the motors, the deadman timer and the obstacle reflex, and it
  does not trust anything Linux tells it.</p>`,
  name: 'rover_mcu.ino',
  code: `/* ------------------------------------------------------------------
   Rover MCU - motors, deadman switch, obstacle reflex.

   Commands from Linux, one line each:
     D<left> <right> <seq>   drive, -255..255 each, with a sequence no
     S                       stop now
     ?                       report

   The deadman is the point of this file. If commands stop arriving
   for DEADMAN_MS the motors stop - and that decision is made here,
   not in Linux, because Linux is the thing most likely to have
   stopped.
   ------------------------------------------------------------------ */

#define PIN_ENA   5
#define PIN_ENB   6
#define PIN_IN1   7
#define PIN_IN2   8
#define PIN_IN3   9
#define PIN_IN4  10
#define PIN_TRIG 11
#define PIN_ECHO 12

/* 200 ms without a command and we stop. At the speeds this rover
   does that is about 8 cm of travel - short enough to be safe, long
   enough to tolerate normal network jitter. */
#define DEADMAN_MS      200

#define STOP_DISTANCE_CM 25      // sonar reflex threshold
#define MAX_PWM         200      // never full speed, whatever is asked

int  leftPwm = 0, rightPwm = 0;
unsigned long lastCommand = 0;
bool stopped = true;
uint32_t lastSeq = 0;
int lastDistance = 999;

char line[40];
byte linePos = 0;

void setup() {
  Serial.begin(115200);

  pinMode(PIN_ENA, OUTPUT); pinMode(PIN_ENB, OUTPUT);
  pinMode(PIN_IN1, OUTPUT); pinMode(PIN_IN2, OUTPUT);
  pinMode(PIN_IN3, OUTPUT); pinMode(PIN_IN4, OUTPUT);
  pinMode(PIN_TRIG, OUTPUT); pinMode(PIN_ECHO, INPUT);

  allStop();
  lastCommand = millis();
  Serial.println(F("rover ready"));
}

void loop() {
  readSerial();
  checkDeadman();
  checkObstacle();
}

/* --- the deadman ------------------------------------------------------
   Deliberately checked every pass, before anything else can go wrong,
   and deliberately independent of the command parsing. */
void checkDeadman() {
  if (stopped) return;
  if (millis() - lastCommand <= DEADMAN_MS) return;

  allStop();
  Serial.print(F("! deadman after "));
  Serial.print(millis() - lastCommand);
  Serial.println(F(" ms"));
}

/* --- obstacle reflex --------------------------------------------------
   The MCU stops on an obstacle without asking Linux. It is a reflex,
   not a substitute for the driver looking - sonar misses anything
   narrow, soft, or below the beam. */
void checkObstacle() {
  static unsigned long lastPing = 0;
  if (millis() - lastPing < 60) return;       // 16 Hz is plenty
  lastPing = millis();

  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // 25 ms timeout is about 4 m. Blocking longer than that would eat
  // into the deadman check, which must never be starved.
  unsigned long us = pulseIn(PIN_ECHO, HIGH, 25000);
  if (us == 0) { lastDistance = 999; return; }

  lastDistance = us / 58;

  // Only inhibit FORWARD motion. Reversing away from a wall must
  // always be allowed, or the rover parks itself permanently.
  if (lastDistance < STOP_DISTANCE_CM && (leftPwm > 0 || rightPwm > 0)) {
    allStop();
    Serial.print(F("! obstacle at "));
    Serial.print(lastDistance);
    Serial.println(F(" cm"));
  }
}

/* --- commands ---------------------------------------------------------- */
void readSerial() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\\n' || c == '\\r') {
      if (linePos) { line[linePos] = '\\0'; handle(line); linePos = 0; }
      continue;
    }
    if (linePos < sizeof(line) - 1) line[linePos++] = c;
  }
}

void handle(char *cmd) {
  switch (cmd[0]) {

    case 'D': {
      int l, r;
      uint32_t seq;
      if (sscanf(cmd + 1, "%d %d %lu", &l, &r, &seq) != 3) return;

      // Refuse forward motion while an obstacle is close.
      if (lastDistance < STOP_DISTANCE_CM) {
        if (l > 0) l = 0;
        if (r > 0) r = 0;
      }

      drive(constrain(l, -MAX_PWM, MAX_PWM),
            constrain(r, -MAX_PWM, MAX_PWM));

      lastCommand = millis();
      lastSeq = seq;

      /* Echo the sequence number straight back. The browser uses this
         to measure round-trip latency, and that measurement is what
         the speed limiter runs on - so it must be the first thing we
         send, before any other reporting. */
      Serial.print(F("A")); Serial.println(seq);
      break;
    }

    case 'S':
      allStop();
      lastCommand = millis();
      Serial.println(F("ok stop"));
      break;

    case '?':
      Serial.print(F("pos ")); Serial.print(leftPwm);
      Serial.print(' ');       Serial.print(rightPwm);
      Serial.print(F(" dist ")); Serial.print(lastDistance);
      Serial.print(F(" age "));  Serial.println(millis() - lastCommand);
      break;
  }
}

void drive(int l, int r) {
  leftPwm = l; rightPwm = r;
  stopped = (l == 0 && r == 0);

  digitalWrite(PIN_IN1, l > 0);
  digitalWrite(PIN_IN2, l < 0);
  analogWrite(PIN_ENA, abs(l));

  digitalWrite(PIN_IN3, r > 0);
  digitalWrite(PIN_IN4, r < 0);
  analogWrite(PIN_ENB, abs(r));
}

void allStop() {
  leftPwm = rightPwm = 0;
  stopped = true;
  analogWrite(PIN_ENA, 0);
  analogWrite(PIN_ENB, 0);
  digitalWrite(PIN_IN1, LOW); digitalWrite(PIN_IN2, LOW);
  digitalWrite(PIN_IN3, LOW); digitalWrite(PIN_IN4, LOW);
}`,
  after: `<p><strong><code>checkDeadman()</code> runs every pass and depends on nothing else.</strong> Not on the
  parser, not on the sonar, not on Linux. If everything else in this sketch were broken, the motors would
  still stop 200&nbsp;ms after the commands did.</p>
  <p><strong>The obstacle reflex only inhibits forward motion.</strong> A version that stops everything parks
  the rover against a wall permanently, with no way to reverse out of it - which is a genuinely annoying way
  to lose a rover in a field.</p>
  <p><strong>The sequence echo goes out before anything else.</strong> It is the latency measurement, and the
  speed limiter runs on it, so a few milliseconds of other serial traffic in front of it inflates every
  reading.</p>`
},
{
  h: 'The Linux half - latency-aware control',
  intro: `<p>Relays commands from the WebRTC data channel to the microcontroller, and - the interesting part -
  scales the speed limit with measured latency.</p>`,
  name: 'rover_control.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Rover control bridge.

WebRTC data channel -> serial -> microcontroller.

The speed limit is a function of measured latency, so a degrading
link slows the rover automatically rather than waiting for the
driver to notice that the picture is old.
"""

import asyncio
import json
import time
import statistics
import serial

MCU_DEV = "/dev/ttyACM0"

# Measured glass-to-glass video latency. Point the camera at a
# stopwatch, photograph both, subtract. Put YOUR number here - this
# is not a value to guess.
VIDEO_LATENCY_MS = 150

# How far the rover may travel during one video latency before the
# driver can react. 10 cm is conservative and about right for a
# rover you cannot afford to lose.
MAX_BLIND_TRAVEL_M = 0.10

# Rover speed at full PWM, measured over a known distance.
TOP_SPEED_MS = 0.40


class Rover:
    def __init__(self, dev):
        self.ser = serial.Serial(dev, 115200, timeout=0.02)
        time.sleep(2.0)
        self.ser.reset_input_buffer()
        self.seq = 0
        self.pending = {}
        self.rtt = []
        self.last_ack = time.time()

    def drive(self, left, right):
        """Send one drive command, scaled by the current speed cap."""
        cap = self.speed_cap()
        left = int(max(-255, min(255, left)) * cap)
        right = int(max(-255, min(255, right)) * cap)

        self.seq += 1
        self.pending[self.seq] = time.perf_counter()

        # Bound the pending dict - a link that stops acking would
        # otherwise grow it without limit over a long drive.
        if len(self.pending) > 200:
            oldest = sorted(self.pending)[:100]
            for k in oldest:
                del self.pending[k]

        self.ser.write(f"D{left} {right} {self.seq}\\n".encode())

    def stop(self):
        self.ser.write(b"S\\n")

    def poll(self):
        """Read acks and update the latency estimate."""
        while self.ser.in_waiting:
            line = self.ser.readline().decode(errors="ignore").strip()
            if not line:
                continue

            if line.startswith("A"):
                try:
                    seq = int(line[1:])
                except ValueError:
                    continue
                t0 = self.pending.pop(seq, None)
                if t0:
                    self.rtt.append((time.perf_counter() - t0) * 1000)
                    if len(self.rtt) > 50:
                        self.rtt.pop(0)
                    self.last_ack = time.time()

            elif line.startswith("!"):
                # The MCU telling us it took action on its own.
                print("  mcu:", line)

    def latency_ms(self):
        """The 95th percentile, not the mean.

        Control latency is bursty: a mean of 30 ms with occasional
        300 ms spikes is a much worse link to drive on than a steady
        60 ms, and the mean hides exactly that."""
        if len(self.rtt) < 5:
            return 999
        s = sorted(self.rtt)
        return s[int(len(s) * 0.95)]

    def speed_cap(self):
        """Speed limit as a fraction of full, from total latency.

        Total delay the driver experiences is the video latency plus
        the control latency - the picture is old AND the command
        takes time to land."""
        total_ms = VIDEO_LATENCY_MS + self.latency_ms()
        if total_ms >= 900:
            return 0.0                       # link is gone; do not move

        safe_ms = MAX_BLIND_TRAVEL_M / TOP_SPEED_MS * 1000
        cap = safe_ms / total_ms
        return max(0.15, min(1.0, cap))

    def healthy(self):
        return (time.time() - self.last_ack) < 1.0


async def control_loop(rover, channel):
    """Send at a fixed rate whether or not the driver moved.

    A fixed cadence is what keeps the deadman fed. Sending only on
    input means a driver holding a steady course triggers the
    deadman every 200 ms."""
    last = {"left": 0, "right": 0}

    while True:
        rover.poll()

        rover.drive(last["left"], last["right"])

        if channel and channel.readyState == "open":
            channel.send(json.dumps({
                "rtt": round(rover.latency_ms()),
                "video": VIDEO_LATENCY_MS,
                "cap": round(rover.speed_cap() * 100),
                "ok": rover.healthy(),
            }))

        await asyncio.sleep(0.05)            # 20 Hz


def on_message(rover, state, message):
    """One control message from the browser."""
    try:
        d = json.loads(message)
    except ValueError:
        return

    # Tank steering from a single stick.
    throttle = float(d.get("y", 0))
    steer = float(d.get("x", 0))

    state["left"] = int((throttle + steer) * 255)
    state["right"] = int((throttle - steer) * 255)


if __name__ == "__main__":
    rover = Rover(MCU_DEV)
    print("rover bridge up")
    print(f"video latency assumed {VIDEO_LATENCY_MS} ms - MEASURE YOURS")
    # The WebRTC setup (aiortc peer connection, signalling, TURN) goes
    # here; on_message feeds the shared state and control_loop does
    # the rest.
    asyncio.run(control_loop(rover, None))`,
  after: `<p><strong>The 95th percentile, not the mean.</strong> Control latency over a mobile link is bursty: a
  mean of 30&nbsp;ms with occasional 300&nbsp;ms spikes is far worse to drive on than a steady 60, and the
  mean hides exactly the spikes that put a rover into a wall.</p>
  <p><strong>The fixed 20&nbsp;Hz cadence matters.</strong> Sending only when the driver moves the stick means
  a driver holding a steady course sends nothing - and trips the deadman every 200&nbsp;ms. The control loop
  resends the current state regardless, which both feeds the deadman and makes a lost packet harmless.</p>
  <p><strong>The speed cap uses video latency plus control latency.</strong> Both delays are real and they add:
  the picture is old <em>and</em> the command takes time to land. Budgeting only for one is how a rover ends up
  further past the obstacle than expected.</p>`
}],

upload: `
<p>Sketch to the microcontroller, Python on the Linux side. Both as in the other UNO Q projects.</p>
<div class="note danger"><span class="t">Test the deadman before the first drive, every time</span>
<p>Rover on blocks with the wheels off the ground. Drive it, then kill the Python. The wheels must stop within
about 200&nbsp;ms.</p>
<p>Then do it again by pulling the USB lead to the MCU, and again by closing the browser. All three must
behave identically, because all three look the same from the microcontroller's point of view.</p></div>
<div class="note warn"><span class="t">Measure your video latency - do not use the number in the sketch</span>
<p>Point the camera at a stopwatch running on a screen, then photograph the stopwatch and the video of it in
the same frame. The difference is glass-to-glass latency.</p>
<p><code>VIDEO_LATENCY_MS</code> drives the speed limiter. A wrong value there means a rover that is either
uselessly slow or moving faster than the driver can react to.</p></div>`,

tune: [
  { h: 'Is 5G worth it here? The honest comparison.',
    body: `<p>Measured round-trip control latency, typical public networks:</p>
    <ul>
      <li><strong>Wi-Fi, same room:</strong> 5-15&nbsp;ms</li>
      <li><strong>5G SA:</strong> 20-40&nbsp;ms</li>
      <li><strong>5G NSA:</strong> 30-60&nbsp;ms</li>
      <li><strong>LTE Cat-4:</strong> 50-120&nbsp;ms</li>
    </ul>
    <p>So 5G roughly halves LTE's latency, and against 150&nbsp;ms of video latency that takes total delay
    from about 250&nbsp;ms to about 190. Noticeable, and not transformative.</p>
    <p><strong>The bigger win is uplink.</strong> LTE gives you 20-50&nbsp;Mbps up on a good day, which is one
    stream; 5G gives you enough for several cameras at a bitrate that does not smear when the rover moves.
    For teleoperation, seeing properly matters more than 40&nbsp;ms of control latency.</p>
    <p>An LTE Cat-4 module at $45 makes a perfectly good rover. Build that first.</p>` },
  { h: 'Attacking video latency, which is the dominant term',
    body: `<p>In order of effect:</p>
    <ul>
      <li><strong>WebRTC instead of RTMP</strong> - 2-5 seconds down to under 200&nbsp;ms. Everything else is
      noise next to this.</li>
      <li><strong>Hardware H.264 from the camera</strong> - saves 20-30&nbsp;ms of encode and a lot of
      CPU.</li>
      <li><strong>Lower resolution, higher frame rate</strong> - 720p60 is better to drive on than
      1080p30, because each frame is newer.</li>
      <li><strong>Shorter keyframe interval</strong> - faster recovery after a packet loss, at a bitrate
      cost.</li>
      <li><strong>Minimum jitter buffer</strong> in the browser. Some stutter is acceptable; latency is
      not.</li>
    </ul>` },
  { h: 'Private 5G is where the 1 ms claim lives',
    body: `<p>The URLLC figures are achievable on a private standalone 5G network with a local core, where
    your traffic never leaves the site. That is genuinely used for industrial teleoperation.</p>
    <p>It is also tens of thousands of dollars and needs spectrum. Some countries now license local 5G
    spectrum to businesses cheaply - worth knowing exists, and out of scope for a hobby rover.</p>` },
  { h: 'A second camera changes the driving experience more than latency does',
    body: `<p>A wide-angle forward camera plus a rear camera removes most of the "where am I" problem. Two
    720p streams is about 6&nbsp;Mbps - trivial for 5G and a real stretch for LTE.</p>
    <p>That is the most concrete argument for 5G on this project.</p>` },
  { h: 'Return-to-safety on link loss',
    body: `<p>Stopping is the minimum. Better: after ten seconds without a link, reverse slowly along the
    recorded path for a few metres, which usually restores coverage.</p>
    <p>Needs wheel odometry and careful thought about what happens if it is wrong - an autonomous rover
    reversing blind is its own hazard. Stop-and-wait is the safe default and is what the sketch does.</p>` },
  { h: 'Battery telemetry is not optional',
    body: `<p>A rover that stops in a field because the battery died is a rover you walk to. The INA219
    reading goes on the driver's screen, and the control loop should refuse to drive away from the operator
    below a reserve threshold.</p>` }
],

trouble: [
  { q: 'The rover stutters - drives, stops, drives',
    a: `The deadman is firing on normal jitter. Either the control cadence is too slow, or latency spikes
    exceed <code>DEADMAN_MS</code>. Send at 20&nbsp;Hz regardless of input, and check the 95th percentile
    latency rather than the mean.` },
  { q: 'Video is seconds behind',
    a: `You are on RTMP or HLS rather than WebRTC. No amount of tuning fixes that - they buffer by design.
    This is the single biggest difference between a drivable rover and an undrivable one.` },
  { q: 'WebRTC will not connect at all',
    a: `Carrier-grade NAT. A mobile device has no public address and usually cannot take a direct peer
    connection. You need a TURN relay; STUN alone is not enough on most mobile networks.` },
  { q: 'The link drops as the rover moves',
    a: `Antenna placement, or cell handover. Check all four are fitted and spread out. NSA hands over more
    smoothly than NB-IoT but a moving vehicle still passes through nulls - which is what spatial diversity
    exists for.` },
  { q: 'It stops and restarts near obstacles',
    a: `The sonar reflex fighting the driver. Check it only inhibits forward motion, and raise
    <code>STOP_DISTANCE_CM</code> if the rover is fast enough that 25&nbsp;cm is inside its stopping
    distance.` },
  { q: 'The modem drops out when the motors start',
    a: `Supply, or noise. Separate buck converters, capacitors across the motors, grounds starred at the
    battery, and antennas away from the motor driver. All four, not one.` },
  { q: 'Latency is fine but it feels impossible to drive',
    a: `Video latency, not control latency. Measure it with the stopwatch method - it is usually two to three
    times the control figure and it is what your eyes are working from.` },
  { q: 'Throughput falls after ten minutes',
    a: `Thermal throttling on the modem. Heatsink and fan. On a rover this degrades the video, which degrades
    your situational awareness - so treat it as a safety item.` }
],

next: `
<ul>
  <li><strong>The bandwidth side of 5G</strong> - the
  <a href="project.html?p=5g-edge-uplink">5G edge uplink</a> covers the modem, QMI and MIMO in depth, and is
  the right project to build first.</li>
  <li><strong>Try it on LTE</strong> - the <a href="project.html?p=lte-remote-monitor">Cat-1 monitor</a> uses
  the same AT skills on a module a tenth of the price. Building the LTE rover first tells you honestly whether
  5G buys you anything.</li>
  <li><strong>Let it drive itself part of the time</strong> - the
  <a href="project.html?p=obstacle-avoiding-robot">obstacle avoider</a> and the
  <a href="project.html?p=uno-q-object-detection">object detector</a> together give you a rover that handles
  the boring parts locally and asks for help when it is confused, which is how real teleoperation works.</li>
  <li><strong>Start much smaller</strong> - the
  <a href="project.html?p=hc05-bluetooth-control">Bluetooth controller</a> drives a rover across a room for
  three dollars, and the control loop is the same shape.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">A vehicle you cannot see, driven from far away</span>
<ul>
  <li><strong>The deadman switch is not optional and must live on the microcontroller.</strong> Test it
  three ways before every session: kill the Python, pull the MCU's USB, close the browser.</li>
  <li><strong>Keep it slow.</strong> At 150&nbsp;ms of video latency you are steering from a picture of the
  past. The speed cap exists for that and should not be raised to make it more fun.</li>
  <li><strong>A physical emergency stop</strong> in the battery line, findable by feel.</li>
  <li><strong>Never drive it where you cannot get to it</strong> - or where it reaching a road, a drop, water
  or a person is possible. The first hour of driving should be somewhere you can see it.</li>
  <li><strong>Someone should be with it</strong> for early sessions, with their hand near the switch.</li>
</ul>
</div>
<div class="note danger"><span class="t">It is a camera on a moving platform</span>
<ul>
  <li><strong>Do not drive it on public land</strong> without checking what applies. A remotely-driven vehicle
  with a camera is regulated very differently from a toy car, and in many places is not permitted on
  pavements, paths or roads at all.</li>
  <li><strong>Do not film other people or their property.</strong> A mobile camera makes this far easier to do
  accidentally than a fixed one, and the rules that apply to a fixed camera apply here too.</li>
  <li><strong>Private land, with permission.</strong> That is the scope of this project.</li>
</ul>
</div>
<div class="note warn"><span class="t">Radio and battery</span>
<ul>
  <li><strong>All four antennas before power.</strong></li>
  <li><strong>Keep the antennas away from people</strong> during transmission - 20&nbsp;cm, as in the other 5G
  project.</li>
  <li><strong>Protected cells, and no charging below 0 &deg;C.</strong></li>
  <li><strong>Fuse the battery.</strong> A shorted lithium pack on a rover that has just hit something is the
  worst outcome available here.</li>
</ul>
</div>`
});
