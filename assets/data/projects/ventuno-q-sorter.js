/* Arduino Ventuno Q: a vision sorting machine, with the latency budget as the real lesson. */
AB.addProject({
slug: 'ventuno-q-sorter',
title: 'Vision sorting machine',
cat: 'ai',
level: 4,
time: '12 hours over a weekend',
printed: true,
solder: true,
board: 'Ventuno Q',
tags: ['ventuno q', 'machine vision', 'npu', 'sorting', 'conveyor', 'industrial', 'latency', 'classification', 'linux', 'dual brain'],
blurb: 'A conveyor, a camera and two flaps. It looks at each object as it passes, decides what it is, and fires a diverter at exactly the right millisecond - which turns out to be the hard part.',

skills: ['Image classification', 'NPU inference', 'Latency budgeting', 'Machine vision lighting', 'Trigger-based capture', 'Conveyor timing'],

intro: `
<p>Every other project in this theme answers a question. This one has to answer it <em>by a deadline</em>, and
that changes everything about how it is built.</p>
<p>An object travels down a belt at 100&nbsp;mm a second. It passes a sensor, it passes a camera, and 1.4
seconds later it reaches a flap that must already be in the right position. Between those two moments the
system has to capture a frame, classify it, decide, send a command, and move a servo. Miss the window and the
object goes in the wrong bin - not wrongly classified, just late, which from the outside looks identical.</p>
<p>The Ventuno Q is Arduino's larger industrial-oriented board: the same dual-brain idea as the UNO Q, on a
160 by 100&nbsp;mm carrier with a considerably more capable Qualcomm Dragonwing processor, a neural
accelerator, proper Ethernet, M.2 storage, and both the classic Arduino headers and a 40-pin one.</p>
<p>At around $299 it is the most expensive board in this book by some way, and this project is written to
justify that or not. The honest summary is at the end of the tuning section. What the board genuinely brings
here is an NPU that classifies in a handful of milliseconds and a microcontroller on the same PCB that can act
on the answer with microsecond timing - and a sorter is the application where both halves of that sentence
matter at once.</p>`,

what: [
  'Run a conveyor belt with an object detector at a fixed point along it.',
  'Trigger a camera capture from the microcontroller the instant an object breaks the beam.',
  'Classify the object on the Linux side using a neural accelerator, in single-digit milliseconds.',
  'Fire one of two diverter flaps at a computed time so the object lands in one of three bins.',
  'Measure the real end-to-end latency and use it to set the flap timing, rather than guessing.',
  'Keep a running tally per class, and fail safe - unknown objects go straight through.'
],

how: `
<p><strong>The latency budget, which is the actual subject of this project.</strong> Write it down before you
build anything:</p>
<ul>
  <li>Beam break detected by the MCU: under 1&nbsp;ms.</li>
  <li>MCU tells Linux to capture: 1-2&nbsp;ms.</li>
  <li>Camera exposure and frame delivery: <strong>20-60&nbsp;ms</strong>, and this is the big one.</li>
  <li>Preprocess and classify on the NPU: 5-15&nbsp;ms.</li>
  <li>Decision sent back to the MCU: 1-2&nbsp;ms.</li>
  <li>Servo physically moves 60 degrees: <strong>150-250&nbsp;ms</strong>, and this is the other big one.</li>
</ul>
<p>Call it 250&nbsp;ms worst case. At 100&nbsp;mm/s the object has moved 25&nbsp;mm in that time, so the flap
must sit at least 25&nbsp;mm - in practice 100&nbsp;mm, for margin - downstream of the camera. That single
calculation determines the machine's physical layout, and it is why the belt is built after the software has
been measured rather than before.</p>
<p>Notice which terms dominate. The neural network is not the slow part. The camera and the servo are, and
they are both mechanical. That is the most useful thing this project teaches, and it is the opposite of what
everyone expects.</p>

<p><strong>Trigger, not stream.</strong> Most vision projects run the camera continuously and classify every
frame. A sorter should not. If you capture continuously you do not know <em>where</em> the object was when
each frame was taken, and the flap timing becomes guesswork.</p>
<p>Instead the MCU watches a distance sensor across the belt. When an object breaks the beam, the MCU
timestamps it and asks for one frame. Now the system knows exactly where the object was at a known moment, and
everything downstream is arithmetic rather than estimation.</p>
<p>It also means the camera is idle most of the time, which is why the machine can be built around a single
camera rather than a fast one.</p>

<p><strong>Classification, not detection.</strong> Because the trigger tells you where the object is, you do
not need a detector to find it - you crop a fixed region of the frame where the object must be and ask "what is
this?". A classifier over a small crop is far faster and far more accurate than a detector over a whole frame,
and it is what industrial vision actually does.</p>

<p><strong>Lighting is a component, not a detail.</strong> This is the thing hobby vision projects get wrong
most often. A classifier trained under one lighting condition and run under another fails badly, and room
lighting changes all day.</p>
<p>So the machine brings its own light: a white LED strip fixed relative to the camera, bright enough to
dominate ambient light, in an enclosure that keeps daylight out. Do that and the images are identical in
February and July, which is worth more than any amount of model tuning.</p>
<p>One specific trap: <strong>run the light at full DC, never PWM</strong>. A PWM-dimmed light beats against a
rolling shutter and produces horizontal banding that changes from frame to frame. If you need it dimmer, use a
resistor or fewer LEDs.</p>

<p><strong>The split, one more time.</strong> The MCU owns the beam sensor, the belt motor, the two servos and
the timing. Linux owns the camera and the model. The entire conversation between them is a few bytes per
object, and the MCU is authoritative about time.</p>`,

bom: [
  { id: 'ventuno-q', qty: 1, note: 'The board this project exists to exercise. Read the summary in the tuning section before buying - a UNO Q will run a slower version of this for a fifth of the price.' },
  { id: 'usb-cam', qty: 1, note: 'A UVC webcam with manual exposure control. Manual exposure matters more than resolution here - auto-exposure is a source of frame-to-frame variation you do not want.' },
  { id: 'psu5v3a', qty: 1, note: 'For the board. Its own supply.' },
  { id: 'vl53l0x', qty: 1, note: 'The trigger, looking across the belt. A laser time-of-flight sensor is far more reliable than an IR beam pair on a dusty belt.' },
  { id: 'sg90', qty: 2, note: 'The two diverter flaps. Cheap and fast; MG996Rs are stronger and slower, which is the wrong trade here.' },
  { id: 'tt-motor', qty: 1, note: 'Drives the belt. Geared down, slow and torquey, which is exactly right.' },
  { id: 'l298n', qty: 1, note: 'Motor driver. Also gives you a speed input, which you need because belt speed is a tuning parameter.' },
  { id: 'ledstrip12v', qty: 1, note: 'The machine vision light. Plain white, cut to about 200 mm, fixed relative to the camera.' },
  { id: 'mosfet', qty: 1, note: 'Switches the light. On or off only - read the note about PWM and rolling shutter before you reach for analogWrite.' },
  { id: 'res10k', qty: 1, note: 'Gate pull-down for the MOSFET.' },
  { id: 'psu12v2a', qty: 1, note: 'Motor, servos and light. Separate from the board supply - this is the same rule as every other project on a Linux board.' },
  { id: 'buck', qty: 1, note: '12 V down to 5 V for the servos, so they are not on the board supply. Set it with a meter before you connect anything.' },
  { id: 'cap1000', qty: 1, note: 'Across the servo supply at the servos.' },
  { id: 'oled13', qty: 1, note: 'Running tally per class and the measured latency. Genuinely useful on a machine that is running unattended.' },
  { id: 'perfboard', qty: 1 },
  { id: 'screwterm', qty: 4 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'standoffs', qty: 1 },
  { id: 'box-abs', qty: 1, note: 'For the electronics. The belt frame itself is wood, aluminium extrusion or 3D printed - whatever you have.' }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }, { id: 'heatshrink' }],

build: {
  parts: [
    { id: 'v',    comp: 'ventunoq', at: [0, 74] },
    { id: 'bb',   comp: 'bb400',    at: [0, -6] },
    { id: 'tof',  comp: 'vl53l0x',  at: [-62, -48] },
    { id: 'oled', comp: 'oled13',   at: [-20, -52], ry: 180 },
    { id: 'drv',  comp: 'l298n',    at: [48, -52] },
    { id: 'belt', comp: 'ttmotor',  at: [52, -104] },
    { id: 'f1',   comp: 'servo',    at: [-52, -100] },
    { id: 'f2',   comp: 'servo',    at: [-14, -100] },
    { id: 'fet',  comp: 'mosfet',   at: [16, -50] },
    { id: 'cam',  comp: 'webcam',   at: [-86, -6] }
  ],
  wires: [
    { from: 'v.GND',      to: 'bb.T-2',   color: 'black',  note: 'Board ground onto the rail. Every supply in this machine references it' },
    { from: 'v.3V3',      to: 'bb.T+2',   color: 'red',    note: '3.3 V for the sensor and the OLED' },
    { from: 'tof.VIN',    to: 'bb.T+6',   color: 'red',    note: 'Trigger sensor power' },
    { from: 'tof.GND',    to: 'bb.T-6',   color: 'black',  note: 'Trigger sensor ground' },
    { from: 'tof.SDA',    to: 'v.A4_SDA', color: 'blue',   note: 'I2C data on the Arduino-side header, shared with the OLED' },
    { from: 'tof.SCL',    to: 'v.A5_SCL', color: 'yellow', note: 'I2C clock' },
    { from: 'oled.VCC',   to: 'bb.T+10',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND',   to: 'bb.T-10',  color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA',   to: 'v.A4_SDA', color: 'blue',   note: 'Same I2C bus, different address' },
    { from: 'oled.SCL',   to: 'v.A5_SCL', color: 'yellow', note: 'Same I2C clock' },
    { from: 'v.D9',       to: 'f1.SIG',   color: 'orange', note: 'Flap 1 signal, hardware-timed by the MCU' },
    { from: 'v.D10',      to: 'f2.SIG',   color: 'orange', note: 'Flap 2 signal' },
    { from: 'f1.GND',     to: 'bb.T-16',  color: 'black',  note: 'Flap 1 ground - shared reference, not shared power' },
    { from: 'f2.GND',     to: 'bb.T-18',  color: 'black',  note: 'Flap 2 ground' },
    { from: 'f1.VCC',     to: 'bb.T+16',  color: 'red',    note: '5 V from the buck converter, NOT from the board' },
    { from: 'f2.VCC',     to: 'bb.T+18',  color: 'red',    note: '5 V from the buck converter' },
    { from: 'v.D5',       to: 'drv.ENA',  color: 'purple', note: 'Belt speed, PWM into the driver enable' },
    { from: 'v.D7',       to: 'drv.IN1',  color: 'green',  note: 'Belt direction A' },
    { from: 'v.D8',       to: 'drv.IN2',  color: 'green',  note: 'Belt direction B' },
    { from: 'drv.GND',    to: 'bb.T-22',  color: 'black',  note: 'Driver ground to the common rail' },
    { from: 'drv.OUT1',   to: 'belt.+',   color: 'brown',  note: 'Belt motor, one terminal' },
    { from: 'drv.OUT2',   to: 'belt.-',   color: 'brown',  note: 'Belt motor, other terminal' },
    { from: 'v.D6',       to: 'fet.G',    color: 'purple', note: 'Machine vision light. ON or OFF only - never PWM, see the notes' },
    { from: 'fet.S',      to: 'bb.T-26',  color: 'black',  note: 'MOSFET source to the common ground' },
    { from: 'fet.D',      to: 'bb.T-30',  color: 'brown',  note: 'MOSFET drain to the LED strip negative; strip positive goes to 12 V' },
    { from: 'cam.USB',    to: 'v.USB',    color: 'white',  note: 'The webcam on its USB lead - it belongs to the Linux side and touches no pin' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Three supplies, one ground, and the board is not one of the loads</span>
<p>12&nbsp;V feeds the belt motor and the light. A buck converter takes that 12&nbsp;V down to 5&nbsp;V for the
servos. The board has its own 5&nbsp;V supply and powers nothing else.</p>
<p>All three grounds must be joined - the 12&nbsp;V negative, the buck's output negative, and the board's GND.
Without that common reference every signal line is meaningless and the machine will behave randomly rather
than failing cleanly.</p>
<p><strong>Set the buck converter's output with a meter before you connect a servo to it.</strong> They ship
at arbitrary voltages. A servo fed 12&nbsp;V dies instantly and takes its horn with it.</p></div>

<div class="note danger"><span class="t">Never pull power on the Linux side</span>
<p>Same as every board in this theme. <code>sudo shutdown -h now</code>, then power off. Put a switch on the
12&nbsp;V so you can stop the machinery without touching the computer - which you will want during
tuning.</p></div>

<div class="note danger"><span class="t">Do not PWM the machine vision light</span>
<p>A PWM-dimmed LED strip beats against the camera's rolling shutter and produces moving horizontal bands. The
model sees a different image every frame for no reason you can see by eye, and accuracy collapses in a way
that looks like a software bug.</p>
<p>Drive the MOSFET gate fully high or fully low. If it is too bright, use fewer LEDs or a series resistor.
This costs you nothing and removes an entire category of problem.</p></div>

<div class="note warn"><span class="t">Logic-level MOSFET, and the gate pull-down</span>
<p>IRLZ44N. The Arduino-side header on this board is 3.3&nbsp;V logic and a standard IRF540 will not switch
fully on from it - it will sit warm and half-conducting. The 10&nbsp;k&Omega; from gate to source keeps the
light off while the MCU boots.</p></div>

<div class="note warn"><span class="t">Two I2C devices, two addresses</span>
<p>The VL53L0X is at 0x29 and the SSD1306 OLED at 0x3C, so they share a bus happily. Run
<code>i2cdetect</code> early - if only one address appears, you have a wiring fault rather than a software
one.</p>
<p>Both are 3.3&nbsp;V parts on a 3.3&nbsp;V bus, so there is no level shifting to think about here.</p></div>

<div class="note tip"><span class="t">Build the electronics on the bench, then the belt</span>
<p>The flap position depends on the measured latency, and you cannot measure the latency until the electronics
run. Get the whole system working flat on a bench with objects slid past the sensor by hand, read the latency
off the OLED, and only then cut wood.</p></div>`,

solderSteps: [
  { h: 'Prototype completely before soldering anything',
    body: `<p>This is the largest build in the book and the one where committing early hurts most. Breadboard
    the sensor, the OLED, the servos and the motor driver, and get an object classified end to end with
    everything loose on the bench.</p>` },
  { h: 'Female headers for the board',
    body: `<p>Socket the Arduino-side header on the perfboard so the Ventuno Q lifts out. Use the board itself
    as the alignment jig - tack the corner pins with it seated, remove it, then finish.</p>
    <p>You only need the Arduino-side headers for this project. The 40-pin header is unused here.</p>` },
  { h: 'The MOSFET, with its pull-down at the gate',
    body: `<p>TO-220, pins gate-drain-source left to right with the legs down and the label facing you. The
    10&nbsp;k&Omega; goes between gate and source physically at the MOSFET.</p>
    <p>The metal tab is the drain and sits at 12&nbsp;V when the light is off. Keep it clear of everything.</p>` },
  { h: 'Screw terminals for every wire that leaves the board',
    body: `<p>Four two-pin blocks: 12&nbsp;V in, motor out, light out, and 5&nbsp;V servo rail in. Everything
    that goes to a moving part gets a terminal, because everything that goes to a moving part will eventually
    need to come off.</p>
    <p>Do not tin stranded wire going into a screw terminal - it cold-flows under the clamp and works
    loose.</p>` },
  { h: 'Extend the servo and sensor leads properly',
    body: `<p>The flaps and the trigger sensor end up 300-600&nbsp;mm from the electronics. Splice with
    soldered joints and heatshrink over each conductor individually, then a larger piece over the bundle.</p>
    <p>Twist the sensor's I2C pair along its run. It is a slow bus and forgiving, but a motor driver switching
    a metre away is a genuinely noisy neighbour.</p>` },
  { h: 'A generous common ground rail',
    body: `<p>Three power domains meet on this board. Run one heavy black rail and stitch every ground to it:
    board GND, the 12&nbsp;V negative, the buck's output negative, the motor driver ground, the MOSFET source,
    both servo grounds.</p>
    <p>22&nbsp;AWG solid, flat against the board, and check it with a meter at the end.</p>` },
  { h: 'Buzz it out, then power the domains one at a time',
    body: `<p>Nothing powered: every ground to the board's GND (beep); 12&nbsp;V to ground (no beep);
    5&nbsp;V rail to ground (no beep); gate to source about 10&nbsp;k&Omega;.</p>
    <p>Then power the 12&nbsp;V alone with the board out of its socket, and measure the buck's output before
    anything is plugged into it. Then the board. Then plug the servos in.</p>` }
],

assembly: [
  { h: 'Get the board running and the camera seen',
    body: `<p>Boot it, update, install OpenCV and the runtime. Confirm the camera appears as a video device and
    that you can save a frame - exactly as in the UNO Q project, which is worth building first if you have
    not.</p>` },
  { h: 'Lock the camera exposure',
    body: `<p>This step is easy to skip and expensive to skip. Auto-exposure means every frame is normalised
    differently, so the model sees a moving target.</p>
    <p><code>v4l2-ctl</code> turns auto-exposure off and sets a fixed value. Set it once with your machine
    vision light on, write the numbers down, and apply them at startup forever after.</p>` },
  { h: 'Build the light and the shroud before the model',
    body: `<p>Fix the LED strip relative to the camera - both on the same bracket, so they cannot move
    independently. Then build a shroud: a cardboard box with a slot for the belt is completely adequate and
    is what makes the whole thing repeatable.</p>
    <p>Aim the light so it does not reflect straight back into the lens off a shiny object. Lighting at
    45 degrees from two sides is the classic answer; one strip along the top edge works for matte
    objects.</p>` },
  { h: 'Collect training images through the finished optics',
    body: `<p>Now, and not before. Every image must be captured through the real camera, under the real light,
    in the real shroud, at the real position.</p>
    <p>Photograph each class 50-100 times: different orientations, different positions within the crop, and
    different individual objects if you have them. Sorting three classes of recycling, or coloured blocks, or
    resistor values, are all good first targets.</p>
    <p>Add an <strong>"unknown"</strong> class with everything else you can find. Without it the classifier
    must force every object into one of your categories.</p>` },
  { h: 'Train a classifier, not a detector',
    body: `<p>Edge Impulse's image classification block, or any transfer-learning setup on MobileNet, on your
    fixed crop. This is a much easier problem than the detection projects because the object is always in the
    same place at the same scale - which is the whole reason for the trigger.</p>
    <p>Expect well above 95% on a clean three-class problem. If you are below 90%, the answer is almost always
    lighting or crop alignment rather than the model.</p>` },
  { h: 'Measure the real latency, on your hardware',
    body: `<p>Run the latency test script. It times capture, preprocessing and inference separately, a hundred
    times each, and prints the worst case as well as the average.</p>
    <p><strong>Use the worst case, not the average.</strong> A sorter that works 95 times out of 100 is a
    sorter that jams. Write the number on the machine.</p>` },
  { h: 'Now compute the layout and build the belt',
    body: `<p>Flap distance = belt speed x worst-case latency, plus at least 50&nbsp;mm of margin, plus the
    length of the longest object.</p>
    <p>At 100&nbsp;mm/s with a 250&nbsp;ms worst case: 25&nbsp;mm plus margin, so put the first flap
    100&nbsp;mm past the camera and the second 100&nbsp;mm past that. Measure the actual belt speed rather
    than trusting the motor - mark the belt, time ten passes, divide.</p>` },
  { h: 'Build the flaps so they fail open',
    body: `<p>Each flap has two positions: out of the way, and across the belt. The resting position, and the
    position the sketch commands on startup and on timeout, must be <strong>out of the way</strong>.</p>
    <p>Then an unclassified object, a crashed script or a reboot all result in the object going straight
    through into the overflow bin rather than into a jam.</p>` },
  { h: 'Tune the flap fire delay object by object',
    body: `<p>The MCU knows when the beam broke and how fast the belt runs, so it can compute when the object
    reaches each flap. Start from the calculation, then adjust by watching: if objects clip the trailing edge
    of the flap, fire earlier; if they slip past, fire later.</p>
    <p>Do this with the belt running and one class at a time.</p>` },
  { h: 'Run a hundred objects and count the errors honestly',
    body: `<p>Sort a hundred known objects and tally where they actually landed. Separate the failures into
    "wrong class" and "right class, wrong bin" - the first is a model problem and the second is a timing
    problem, and they need completely different fixes.</p>
    <p>Almost everyone assumes the first and finds the second.</p>` }
],

libraries: [
  { name: 'OpenCV', by: 'OpenCV', how: 'apt install python3-opencv', why: 'Capture, crop, resize, and the JPEG encoding for the monitoring stream.' },
  { name: 'Your trained classifier', by: 'generated', why: 'From Edge Impulse or any transfer-learning export. A classifier over a fixed crop, not a detector.' },
  { name: 'pyserial', by: 'pySerial', how: 'apt install python3-serial', why: 'The link to the microcontroller half. Every timing-critical byte goes through here.' },
  { name: 'VL53L0X', by: 'Pololu or Adafruit', why: 'On the sketch side. The trigger sensor. Pololu\'s library has a continuous mode with a shorter timing budget, which is what you want.' },
  { name: 'Servo', by: 'Arduino', how: 'Built in', why: 'The flaps. Hardware-timed, which is the entire reason they are on this half.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The tally display.' }
],

code: [
{
  h: 'Step 1: lock the camera down',
  intro: `<p>Before any model exists. A camera with auto-exposure and auto-white-balance running is a camera
  that returns a different image of the same object depending on what passed by a second ago.</p>`,
  name: 'camera_lock.sh',
  lang: 'Shell',
  code: `sudo apt update
sudo apt install -y python3-opencv python3-numpy python3-serial v4l-utils i2c-tools

# What can this camera actually control? Not all expose everything.
v4l2-ctl -d /dev/video0 --list-ctrls

# Turn OFF everything automatic. These names vary slightly between
# kernels - use whatever --list-ctrls showed.
v4l2-ctl -d /dev/video0 --set-ctrl=auto_exposure=1            # 1 = manual
v4l2-ctl -d /dev/video0 --set-ctrl=exposure_time_absolute=250
v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_automatic=0
v4l2-ctl -d /dev/video0 --set-ctrl=white_balance_temperature=4600
v4l2-ctl -d /dev/video0 --set-ctrl=gain=32
v4l2-ctl -d /dev/video0 --set-ctrl=focus_automatic_continuous=0

# Confirm they stuck - some drivers silently ignore settings
v4l2-ctl -d /dev/video0 --get-ctrl=auto_exposure,exposure_time_absolute

# Find the exposure value that looks right WITH the machine vision
# light on and the shroud closed, then write it down and use that
# same value for training and for running. They must match.

# Both I2C devices present? 0x29 is the VL53L0X, 0x3C the OLED.
sudo i2cdetect -y 1`,
  after: `<p>These settings do not survive a reboot. Put the <code>v4l2-ctl</code> lines in a small script and
  call it from your systemd unit before the Python starts.</p>
  <p><strong>The exposure used for training must be the exposure used for running.</strong> If you retune the
  light or the exposure later, you have changed what the camera sees and the model needs retraining. Write the
  values on the machine.</p>`
},
{
  h: 'Step 2: measure the latency before you build anything physical',
  intro: `<p>The layout of the whole machine comes out of this number. Run it on the real board with the real
  camera and the real model.</p>`,
  name: 'latency_test.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Measure the real capture-to-decision latency.

The flap position is derived from the WORST case, not the average.
A sorter that is right 95% of the time is a sorter that jams.
"""

import time
import statistics
import cv2
import numpy as np

CROP = (160, 120, 480, 440)      # x1, y1, x2, y2 - where the object is
MODEL_SIZE = (96, 96)

cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
# Always the newest frame. Without this you measure queue depth.
cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

if not cap.isOpened():
    raise SystemExit("No camera")

for _ in range(10):
    cap.read()

cap_ms, pre_ms, inf_ms = [], [], []

print("timing 100 cycles...")
for _ in range(100):
    t0 = time.perf_counter()
    ok, frame = cap.read()
    t1 = time.perf_counter()
    if not ok:
        continue

    x1, y1, x2, y2 = CROP
    crop = frame[y1:y2, x1:x2]
    small = cv2.resize(crop, MODEL_SIZE)
    rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
    t2 = time.perf_counter()

    # Substitute your real classifier call here. Timing a stand-in
    # is useless - the whole point is the number on YOUR model.
    _ = classify(rgb)
    t3 = time.perf_counter()

    cap_ms.append((t1 - t0) * 1000)
    pre_ms.append((t2 - t1) * 1000)
    inf_ms.append((t3 - t2) * 1000)

cap.release()


def report(name, xs):
    xs = sorted(xs)
    print(f"  {name:12s} avg {statistics.mean(xs):6.1f} ms   "
          f"p95 {xs[int(len(xs)*0.95)]:6.1f} ms   max {xs[-1]:6.1f} ms")


print()
report("capture", cap_ms)
report("preprocess", pre_ms)
report("inference", inf_ms)

worst = max(c + p + i for c, p, i in zip(cap_ms, pre_ms, inf_ms))
print(f"\\n  worst total       : {worst:.1f} ms")
print(f"  + servo travel    : 200.0 ms")
print(f"  = BUDGET          : {worst + 200:.1f} ms")

for speed in (60, 100, 150, 200):
    mm = (worst + 200) / 1000.0 * speed
    print(f"    belt {speed:3d} mm/s -> object travels {mm:5.1f} mm; "
          f"flap at least {mm + 50:5.1f} mm downstream")`,
  after: `<p>The capture number is usually the surprise. A webcam at 30&nbsp;fps hands you a frame every
  33&nbsp;ms whatever you do, so a blocking <code>read()</code> averages about 16&nbsp;ms and peaks near 33 -
  and that is before the model has done anything.</p>
  <p>Inference on the NPU should land in single digits. If it is in the hundreds, you are running on the CPU.
  That difference is precisely what this board is for, so check it rather than assuming it.</p>`
},
{
  h: 'Step 3: the microcontroller half',
  intro: `<p>The MCU owns the belt, the trigger and the flaps, and it is authoritative about time. Linux is
  asked a question and answers it; it is never asked to be punctual.</p>`,
  name: 'sorter_mcu.ino',
  code: `/* ------------------------------------------------------------------
   Ventuno Q - microcontroller half of the vision sorter.

   Owns: trigger sensor, belt motor, both flaps, and all timing.

   To Linux:    T<id>          object detected, please classify
   From Linux:  R<id> <class>  result: 0 = bin A, 1 = bin B, 2 = through

   The MCU timestamps the beam break, so the flap fire time is
   computed from a known moment rather than from when a message
   happened to arrive. That is the whole design.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <VL53L0X.h>
#include <Servo.h>

// ---- pins ------------------------------------------------------------
#define PIN_FLAP_A   9
#define PIN_FLAP_B  10
#define PIN_BELT_EN  5
#define PIN_BELT_1   7
#define PIN_BELT_2   8
#define PIN_LIGHT    6

// ---- geometry, in mm -------------------------------------------------
// Measure these on the real machine. Do not trust the drawing.
#define MM_SENSOR_TO_FLAP_A  100.0
#define MM_SENSOR_TO_FLAP_B  200.0
#define BELT_MM_PER_S        100.0

// ---- flap angles -----------------------------------------------------
// PARK must be out of the way. Everything unknown, every timeout and
// every reboot leaves the flaps here, so objects pass through rather
// than jamming.
#define FLAP_A_PARK   20
#define FLAP_A_DIVERT 80
#define FLAP_B_PARK   20
#define FLAP_B_DIVERT 80
#define FLAP_HOLD_MS  600

#define TRIGGER_MM      120      // closer than this = an object
#define REARM_MS        400      // one object cannot trigger twice
#define CLASSIFY_TIMEOUT 500     // Linux is late: let it through

VL53L0X sensor;
Servo flapA, flapB;

unsigned long objId = 0;
unsigned long triggerAt = 0;
unsigned long lastTrigger = 0;
bool awaitingResult = false;

// A pending diversion: which flap, and when to fire it.
byte pendingFlap = 0;            // 0 none, 1 A, 2 B
unsigned long fireAt = 0, releaseAt = 0;

char line[32];
byte linePos = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();

  pinMode(PIN_BELT_EN, OUTPUT);
  pinMode(PIN_BELT_1, OUTPUT);
  pinMode(PIN_BELT_2, OUTPUT);
  pinMode(PIN_LIGHT, OUTPUT);

  // Full on, never analogWrite. PWM beats against the rolling
  // shutter and bands every frame the camera takes.
  digitalWrite(PIN_LIGHT, HIGH);

  flapA.attach(PIN_FLAP_A); flapA.write(FLAP_A_PARK);
  flapB.attach(PIN_FLAP_B); flapB.write(FLAP_B_PARK);

  sensor.setTimeout(200);
  if (!sensor.init()) {
    Serial.println(F("! VL53L0X not found"));
    while (1) delay(500);
  }
  // A short timing budget trades a little accuracy for a much faster
  // reading. For a beam break across a belt that is exactly the
  // trade we want.
  sensor.setMeasurementTimingBudget(20000);
  sensor.startContinuous();

  beltRun(180);
  Serial.println(F("sorter ready"));
}

void loop() {
  readSerial();
  checkTrigger();
  serviceFlaps();
}

/* --- the trigger ------------------------------------------------------ */
void checkTrigger() {
  if (awaitingResult) return;
  if (millis() - lastTrigger < REARM_MS) return;

  int mm = sensor.readRangeContinuousMillimeters();
  if (sensor.timeoutOccurred()) return;
  if (mm >= TRIGGER_MM) return;

  // Timestamp FIRST, before anything slow happens.
  triggerAt = millis();
  lastTrigger = triggerAt;
  objId++;
  awaitingResult = true;

  Serial.print(F("T"));
  Serial.println(objId);
}

/* --- the answer ------------------------------------------------------- */
void readSerial() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\\n' || c == '\\r') {
      if (linePos) { line[linePos] = '\\0'; handle(line); linePos = 0; }
      continue;
    }
    if (linePos < sizeof(line) - 1) line[linePos++] = c;
  }

  // Linux did not answer in time. Let the object through rather than
  // guessing - a wrong bin is worse than the overflow bin.
  if (awaitingResult && millis() - triggerAt > CLASSIFY_TIMEOUT) {
    awaitingResult = false;
    Serial.println(F("! classify timeout"));
  }
}

void handle(char *cmd) {
  if (cmd[0] != 'R') return;

  unsigned long id;
  int cls;
  if (sscanf(cmd + 1, "%lu %d", &id, &cls) != 2) return;
  if (id != objId) return;                  // a stale answer; ignore

  awaitingResult = false;

  if (cls == 0)      schedule(1, MM_SENSOR_TO_FLAP_A);
  else if (cls == 1) schedule(2, MM_SENSOR_TO_FLAP_B);
  // cls == 2 (or anything else): do nothing, it goes through
}

/* Compute the fire time from the BEAM BREAK, not from now. The
   message may have taken 40 ms or 300 ms to arrive; the object does
   not care, and neither should the timing. */
void schedule(byte flap, float mm) {
  unsigned long travel = (unsigned long)(mm / BELT_MM_PER_S * 1000.0);
  pendingFlap = flap;
  fireAt = triggerAt + travel;
  releaseAt = fireAt + FLAP_HOLD_MS;

  // Already too late - the object has passed. Let it through.
  if ((long)(millis() - fireAt) > 0) {
    pendingFlap = 0;
    Serial.println(F("! too late, passed through"));
  }
}

void serviceFlaps() {
  if (!pendingFlap) return;

  if ((long)(millis() - fireAt) >= 0 && (long)(millis() - releaseAt) < 0) {
    if (pendingFlap == 1) flapA.write(FLAP_A_DIVERT);
    else                  flapB.write(FLAP_B_DIVERT);
  }

  if ((long)(millis() - releaseAt) >= 0) {
    flapA.write(FLAP_A_PARK);
    flapB.write(FLAP_B_PARK);
    pendingFlap = 0;
  }
}

/* --- the belt --------------------------------------------------------- */
void beltRun(byte speed) {
  digitalWrite(PIN_BELT_1, HIGH);
  digitalWrite(PIN_BELT_2, LOW);
  analogWrite(PIN_BELT_EN, speed);
}

void beltStop() {
  analogWrite(PIN_BELT_EN, 0);
  digitalWrite(PIN_BELT_1, LOW);
  digitalWrite(PIN_BELT_2, LOW);
}`,
  after: `<p>The single most important line in this sketch is <code>fireAt = triggerAt + travel;</code>.</p>
  <p>The naive version - fire the flap <code>travel</code> milliseconds after the classification
  <em>arrives</em> - inherits every millisecond of jitter from Linux, the camera and the serial link. Firing
  relative to the beam break makes the machine's accuracy depend on the MCU's clock, which is excellent, rather
  than on Linux's scheduler, which is not.</p>
  <p>Every timing comparison uses <code>(long)(millis() - x)</code> rather than <code>millis() &gt; x</code>,
  so it still behaves correctly when <code>millis()</code> rolls over after 49 days. On a machine meant to run
  unattended that is not pedantry.</p>`
},
{
  h: 'Step 4: the classifier service',
  intro: `<p>The Linux half. It waits to be asked, answers as fast as it can, and is never responsible for
  timing.</p>`,
  name: 'sorter.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Vision sorter - Linux half.

Waits for a trigger from the microcontroller, grabs a frame, crops to
the fixed inspection window, classifies, and sends back a bin number.

It is never responsible for WHEN anything happens - only for what the
object is, as fast as it can manage.
"""

import time
import collections
import serial
import cv2
import numpy as np

MCU_DEV = "/dev/ttyACM0"
CROP = (160, 120, 480, 440)
MODEL_SIZE = (96, 96)
MIN_CONF = 0.70

# Your model's labels, in its own order, mapped to bins.
# Anything not confidently one of the first two goes through.
LABELS = ["metal", "plastic", "unknown"]
BIN_FOR = {"metal": 0, "plastic": 1, "unknown": 2}

SAVE_MISSES = True          # keep images we were not sure about


def open_camera():
    cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    if not cap.isOpened():
        raise SystemExit("No camera")
    for _ in range(10):
        cap.read()
    return cap


def classify(rgb):
    """
    Replace with your model's inference call. It must return
    (label_index, confidence).

    Whatever runtime you use, make sure it is actually on the NPU -
    check the latency against latency_test.py. A model quietly
    running on the CPU here costs you the entire reason for the
    board, and nothing will warn you.
    """
    raise NotImplementedError("wire up your classifier")


def main():
    cap = open_camera()
    mcu = serial.Serial(MCU_DEV, 115200, timeout=0.05)
    time.sleep(1.0)
    mcu.reset_input_buffer()
    print("waiting for triggers")

    tally = collections.Counter()
    latencies = collections.deque(maxlen=50)

    while True:
        raw = mcu.readline().decode(errors="ignore").strip()
        if not raw:
            continue

        if not raw.startswith("T"):
            if raw.startswith("!"):
                print("  mcu:", raw)
            continue

        t0 = time.perf_counter()
        try:
            obj_id = int(raw[1:])
        except ValueError:
            continue

        ok, frame = cap.read()
        if not ok:
            mcu.write(f"R{obj_id} 2\\n".encode())
            continue

        x1, y1, x2, y2 = CROP
        crop = frame[y1:y2, x1:x2]
        small = cv2.resize(crop, MODEL_SIZE)
        rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

        idx, conf = classify(rgb)
        label = LABELS[idx] if idx < len(LABELS) else "unknown"

        # Low confidence goes through to the overflow bin. Guessing
        # here fills the wrong bin, which is much harder to notice
        # than an overflow bin filling up.
        if conf < MIN_CONF:
            label = "unknown"

        bin_no = BIN_FOR.get(label, 2)

        # Answer FIRST, then do the bookkeeping. Every millisecond
        # spent before this write is a millisecond of the budget.
        mcu.write(f"R{obj_id} {bin_no}\\n".encode())

        dt = (time.perf_counter() - t0) * 1000
        latencies.append(dt)
        tally[label] += 1

        print(f"  #{obj_id:<5d} {label:10s} {conf:.2f} -> bin {bin_no}"
              f"   {dt:5.1f} ms   (p95 {sorted(latencies)[int(len(latencies)*0.95)]:.0f})")

        if SAVE_MISSES and conf < MIN_CONF:
            cv2.imwrite(f"misses/{int(time.time())}_{obj_id}.jpg", crop)

        if sum(tally.values()) % 25 == 0:
            print("   tally:", dict(tally))


if __name__ == "__main__":
    import os
    os.makedirs("misses", exist_ok=True)
    main()`,
  after: `<p>Two habits worth carrying into any real-time system:</p>
  <ul>
    <li><strong>Answer before you log.</strong> The serial write happens before the printing, the tally and the
    image saving. Those take a few milliseconds and the object is moving.</li>
    <li><strong>Save what you were unsure about.</strong> The <code>misses/</code> folder becomes your next
    training set, and it is made of exactly the images the model finds hard. That is worth far more than
    another hundred easy ones.</li>
  </ul>
  <p>The <code>classify()</code> stub is deliberate. Which runtime you use depends on how you trained - an
  Edge Impulse export, a TFLite file with an NPU delegate, or the vendor SDK. The important thing is to verify
  with <code>latency_test.py</code> that it is actually running on the accelerator.</p>`
}],

upload: `
<p>Sketch to the microcontroller, Python on the Linux filesystem, as with every board in this theme.</p>
<div class="note warn"><span class="t">Verify the model is on the NPU, not the CPU</span>
<p>This is the check that decides whether the board was worth buying. A classifier that takes 8&nbsp;ms is on
the accelerator; one that takes 150&nbsp;ms is on the CPU and will still work, slowly, with no error and no
warning anywhere.</p>
<p>Run <code>latency_test.py</code> with your real model and read the number before you build the belt around
it.</p></div>
<div class="note tip"><span class="t">Start the belt slowly</span>
<p>Set <code>BELT_MM_PER_S</code> and the motor PWM low for the first runs - 60&nbsp;mm/s gives you time to see
what is happening and to catch things by hand. Speed it up only once a hundred objects have gone through
correctly.</p></div>`,

tune: [
  { h: 'Measure the belt speed, do not calculate it',
    body: `<p>Put a mark on the belt, time ten full passes with a stopwatch, and divide. Motor speed under load
    is not the speed on the datasheet, and it changes with the weight on the belt and the battery voltage.</p>
    <p>Re-measure after any change to the motor PWM. <code>BELT_MM_PER_S</code> being 15% wrong puts every
    object 15&nbsp;mm off, which at these sizes is the difference between a bin and a jam.</p>` },
  { h: 'Lighting is the highest-value thing you can improve',
    body: `<p>If classification accuracy is disappointing, look at the images before you look at the model.
    Are there specular highlights blowing out the detail on shiny objects? Is there a shadow from the shroud
    edge? Is daylight leaking in?</p>
    <p>Diffusing the light - a sheet of baking paper over the strip - fixes more vision problems than any
    hyperparameter. So does lighting from two sides at 45 degrees.</p>` },
  { h: 'Separate the two failure modes before fixing either',
    body: `<p>"Wrong class" and "right class, wrong bin" look identical in the output bins and need opposite
    fixes.</p>
    <p>Diagnose it by watching the console: it prints what the model decided. If the label was right and the
    object still landed wrong, it is timing - belt speed, flap distance or servo travel. If the label was
    wrong, it is the model or the lighting. Do not tune timing to compensate for a model problem.</p>` },
  { h: 'Faster flaps',
    body: `<p>Servo travel is one of the two biggest terms in the budget. Reducing the swing from 60 degrees to
    35 cuts the travel time proportionally, and a flap only has to deflect the object, not sweep the belt.</p>
    <p>A faster servo - a digital metal-gear micro at around 0.06&nbsp;s/60&deg; - roughly halves it again for
    about $8. That is the cheapest latency you can buy in this machine.</p>` },
  { h: 'Add a second inspection angle',
    body: `<p>A mirror at 45 degrees beside the belt puts a side view of the object into the same frame, so one
    capture sees top and side. For classes that differ in profile rather than in top-down appearance this is
    dramatically better than a second camera, and it costs a pound.</p>` },
  { h: 'Retrain from the misses folder',
    body: `<p>After a few hundred objects, <code>misses/</code> contains exactly the images that confused the
    model. Label them, add them to the training set, retrain.</p>
    <p>Two rounds of this typically does more than any amount of architecture fiddling, for the same reason as
    in the TinyML projects: the data is the bottleneck, not the model.</p>` },
  { h: 'Is this board worth it? An honest answer.',
    body: `<p>Everything in this project runs on a UNO Q, at about a fifth of the price, with two changes: the
    classification takes maybe 40&nbsp;ms instead of 8, and the belt has to run slower or the flaps sit further
    downstream. For a hobby sorter on a bench, that is a completely acceptable trade and the UNO Q is the
    better buy.</p>
    <p>The Ventuno Q earns its price when the machine has to keep up with something you do not control - a
    production rate, a chute someone is emptying, several cameras at once - or when it needs Ethernet,
    industrial I/O and M.2 storage in one unit that will sit in a cabinet for five years. That is what it is
    built for, and it is a different requirement from "I want to build a sorter".</p>
    <p>Build this on a UNO Q first. If you hit its ceiling, you will know exactly which term in the latency
    budget you are fighting, and then the upgrade is an informed decision rather than an aspirational
    one.</p>` }
],

trouble: [
  { q: 'Objects are consistently landing one bin late',
    a: `Timing, and it is the easiest fault to fix. Either <code>BELT_MM_PER_S</code> is too high or your
    measured flap distances are too short. Re-measure both physically. The console log tells you the model was
    right, which is how you know it is this rather than the classifier.` },
  { q: 'Every object triggers two or three times',
    a: `<code>REARM_MS</code> is too short for the object length and belt speed, or the object is transparent
    or dark and the VL53L0X is reading through and past it. Raise the rearm time to comfortably exceed the time
    for the longest object to clear the beam.` },
  { q: 'The trigger fires with nothing on the belt',
    a: `The sensor is seeing the belt itself, or the far wall, at a distance close to <code>TRIGGER_MM</code>.
    Print the raw readings with an empty belt and set the threshold well below the resting value - halfway is
    not enough if the belt sags.` },
  { q: 'Classification is much worse than it was in training',
    a: `Almost always lighting or crop alignment. Save a frame from the running machine and compare it side by
    side with a training image. If they look different to you, they look completely different to the model.
    Check the exposure settings actually applied - some drivers silently ignore v4l2-ctl.` },
  { q: 'Inference takes over 100 ms',
    a: `You are on the CPU. This is the single most important thing to check on this board, because everything
    works either way. Confirm the NPU delegate or the vendor runtime is being used, and compare against
    latency_test.py.` },
  { q: 'The flaps buzz and get hot',
    a: `They are being held against a mechanical stop. Reduce the DIVERT angle until the flap just deflects the
    object without straining. Also check the servos are on the buck converter rather than the board.` },
  { q: 'The board reboots when the motor starts',
    a: `The motor is on the board's supply, or the grounds are joined in a way that puts motor current through
    a thin wire. Motor on 12 V through the driver, servos on the buck, board on its own supply, and one common
    ground rail that is heavy enough.` },
  { q: 'Horizontal bands move through the camera image',
    a: `The light is being PWMed, beating against the rolling shutter. <code>digitalWrite(PIN_LIGHT,
    HIGH)</code>, never <code>analogWrite</code>. If mains lighting is leaking into the shroud, that causes it
    too at 100 or 120 Hz - close the shroud properly.` },
  { q: '<code>! classify timeout</code> in the log',
    a: `Linux did not answer within <code>CLASSIFY_TIMEOUT</code>. The object went through to the overflow bin,
    which is the correct behaviour. If it happens often, something on the Linux side is stalling - check
    whether an update or a log rotation is running, and whether the camera is dropping off the USB bus.` },
  { q: 'It works perfectly for an hour and then jams',
    a: `Look for something that accumulates: objects piling up in a bin and backing onto the belt, the belt
    creeping sideways off its rollers, or debris on the sensor window. Machines fail mechanically far more
    often than they fail computationally, and this one will teach you that.` }
],

next: `
<ul>
  <li><strong>Build it on a UNO Q first</strong> - <a href="project.html?p=uno-q-object-detection">the object
  detector</a> covers the same dual-brain architecture for a fifth of the price, and the latency lesson here
  applies unchanged.</li>
  <li><strong>Add weight.</strong> An <a href="project.html?p=battery-capacity-tester">HX711 load cell</a>
  under the inspection point gives you a second, completely independent signal. Vision plus weight separates
  classes that neither can separate alone, and it is a genuinely industrial trick.</li>
  <li><strong>Log every object.</strong> Class, confidence, timestamp and latency into a CSV, then chart it. A
  day of that data tells you more about the machine than a day of watching it.</li>
  <li><strong>Listen to it as well.</strong> The <a href="project.html?p=tinyml-machine-listener">machine
  listener</a> on the belt motor will notice a bearing going long before the sorter starts missing.</li>
  <li><strong>Take the timing lesson elsewhere.</strong> Latency budgeting applies to any machine that has to
  act on what it sees - a camera trap, a robot arm, a coffee roaster. It is the most transferable thing in
  this theme.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">This is a machine with moving parts. Treat it like one.</span>
<ul>
  <li><strong>Fit a physical emergency stop</strong> in the 12&nbsp;V line - a proper latching mushroom switch,
  not a command you type. It must cut the motor and the servos without going anywhere near the computer.</li>
  <li><strong>Guard the belt's pinch points.</strong> Where the belt meets a roller it will pull in hair,
  sleeves, cable ties and fingers. A TT motor is weak, but "weak" and "harmless" are not the same word, and
  the flaps move without warning.</li>
  <li><strong>Never reach into a running machine.</strong> Stop the belt first, every time, including when you
  are just clearing one jammed object. This is the habit that matters and it is the one people skip when they
  are twenty jams in.</li>
  <li><strong>The flaps must park out of the way.</strong> Park position on startup, on timeout, and on any
  unknown classification. A machine that jams on failure is far worse than one that passes objects through.</li>
  <li><strong>Set the buck converter's output before connecting servos.</strong> Measure it. They ship at
  arbitrary voltages and a servo on 12&nbsp;V is destroyed instantly.</li>
  <li><strong>Always shut the Linux side down properly.</strong> <code>sudo shutdown -h now</code>. Put the
  power switch on the 12&nbsp;V so you can stop the machinery without pulling the computer's power.</li>
  <li><strong>Do not sort anything hazardous.</strong> Broken glass, sharps, batteries and anything wet are all
  bad ideas on an open bench machine with no guarding. Blocks, bottle caps, coins and clean recycling are
  what this is for.</li>
</ul>
</div>`
});
