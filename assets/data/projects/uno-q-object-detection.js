/* Arduino UNO Q: object detection on the Linux side driving a pan-tilt head from the MCU side. */
AB.addProject({
slug: 'uno-q-object-detection',
title: 'Object detection that follows you',
cat: 'ai',
level: 3,
time: '6 hours',
solder: false,
board: 'UNO Q',
feature: true,
tags: ['uno q', 'object detection', 'computer vision', 'opencv', 'python', 'dual brain', 'linux', 'pan tilt', 'mobilenet', 'ssd'],
blurb: 'A camera that recognises what it is looking at and turns to follow it. Python and a real neural network on the Linux half of the board, precise servo timing on the microcontroller half.',

skills: ['Linux on a board', 'Python + OpenCV', 'SSD object detection', 'Dual-processor architecture', 'Inter-processor messaging', 'Proportional control'],

intro: `
<p>This is the project where Arduino stops being a microcontroller, and it is worth slowing down for that
sentence.</p>
<p>Everything else in this book runs on a chip with kilobytes of RAM and no operating system. Your code is the
only code. It starts when the power comes on and it runs forever. That model is wonderfully simple and it has
a hard ceiling: it cannot run a convolutional neural network over a video stream, and no amount of clever
programming changes that.</p>
<p>The UNO Q is two computers on one board. There is a quad-core Qualcomm application processor running
Debian Linux - a real computer, with a filesystem, a package manager, Python and a network stack - and
alongside it an STM32 microcontroller doing exactly what an Arduino has always done. They share the board, the
power supply and a message channel, and each one does the half of the job it is good at.</p>
<p>The vision runs on Linux because it needs an operating system, a gigabyte of RAM and floating point. The
servos are driven from the MCU because Linux is not a real-time system and a servo driven from a process that
the kernel can deschedule for 40 milliseconds will twitch. Learning where that line falls is the real content
of this project.</p>
<p>It costs about $44 for the board, which is around nine times an Uno. That is a real jump and it buys a
genuinely different class of machine.</p>`,

what: [
  'Run a pre-trained object detection model on live video, entirely on the board, with nothing sent to any server.',
  'Recognise 80 common object classes - person, cat, cup, laptop, chair - at roughly 8-15 frames a second.',
  'Draw boxes on a video stream you can watch from a browser on your laptop.',
  'Pass the target position from the Linux side to the microcontroller side over a message channel.',
  'Drive a pan-tilt head from the MCU with smooth, jitter-free servo timing, tracking whatever it is locked onto.',
  'Fail gracefully: lose the target and the head parks rather than hunting.'
],

how: `
<p><strong>The two brains.</strong> On one side, a Qualcomm Dragonwing QRB2210 - four Cortex-A53 cores at
around 2&nbsp;GHz, with 2&nbsp;GB of RAM and 16&nbsp;GB of eMMC on the base model, running Debian. On the
other, an STM32U585: a Cortex-M33 microcontroller, the thing behind the classic UNO headers, running one
sketch with nothing else competing for it.</p>
<p>They are connected by an internal link, and the mental model that matters is this: <strong>the Linux side
decides things, the MCU side does things</strong>. Linux thinks slowly and unpredictably but can think about
hard problems. The MCU thinks about one trivial problem with perfect timing.</p>

<p><strong>Why the servo cannot live on the Linux side.</strong> A hobby servo wants a pulse between 1.0 and
2.0&nbsp;ms, repeated every 20&nbsp;ms, and it interprets the pulse <em>width</em> as the commanded angle. An
error of 0.05&nbsp;ms is about a degree of visible movement.</p>
<p>Linux is a general-purpose multitasking kernel. It will happily let a Python process wait 30&nbsp;ms
because something else needed the CPU, and your 1.5&nbsp;ms pulse becomes a 30&nbsp;ms one. The servo
lurches. There are ways around this on a Pi - hardware PWM, kernel modules, dedicated driver chips - and they
all amount to moving the timing off the CPU.</p>
<p>The UNO Q does not need a workaround, because the microcontroller is right there. The sketch's
<code>Servo</code> library uses a hardware timer and produces a pulse accurate to microseconds whatever Linux
is doing.</p>

<p><strong>What the detector actually is.</strong> An SSD MobileNet: a convolutional network that, in one
forward pass, outputs a list of boxes with a class and a confidence for each. "Single Shot Detector" is the
SSD - older approaches ran a classifier over hundreds of candidate crops, which is dramatically slower.
MobileNet is the feature extractor, designed from the start for phones, using depthwise-separable convolutions
that cost roughly a ninth of a standard convolution for nearly the same accuracy.</p>
<p>It is pre-trained on COCO - 80 everyday object classes, hundreds of thousands of labelled photos. You are
not training anything in this project. Using someone else's trained model is not cheating; it is what almost
all deployed computer vision does, and a model trained on 300,000 images by people with a GPU cluster will
beat anything you train on a laptop this week.</p>

<p><strong>The control loop.</strong> The detector gives you a box. The centre of that box has an offset from
the centre of the frame. That offset is an error, and the classic answer to an error is proportional control:
move by some fraction of it. Too small a fraction and the head lags behind a walking person; too large and it
overshoots, sees the target on the other side, overcorrects, and oscillates forever. The tuning section deals
with this properly, because getting it wrong is the default outcome.</p>`,

bom: [
  { id: 'uno-q', qty: 1, note: 'The 2 GB / 16 GB model is enough for this. The 4 GB model helps if you later want several models loaded at once.' },
  { id: 'usb-cam', qty: 1, note: 'Any UVC-class webcam. Check for "UVC" or "no driver needed" - a camera that needs a Windows driver will not work on Linux. A Logitech C270 or similar is the safe choice.' },
  { id: 'usbc-hub', qty: 1, note: 'The board has one USB-C port and you need power and a camera at once. Check your board for a separate USB-A host port first - if it has one, you can skip this.' },
  { id: 'psu5v3a', qty: 2, note: 'TWO of them. One for the board - do not run this from a laptop port, because a brownout on a Linux board means filesystem corruption rather than a reset - and a second one for the servos alone. See the wiring notes; this is not optional.' },
  { id: 'pantilt', qty: 1, note: 'The cheap two-servo bracket. It arrives as a bag of acrylic and screws.' },
  { id: 'sg90', qty: 2, note: 'Usually included with the bracket. Buy spares - the gears in these strip.' },
  { id: 'cap1000', qty: 1, note: 'Across the servo supply, right at the servos. Smooths the current spike when both move at once.' },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'tripod', qty: 1, note: 'Optional but it makes the thing usable. A pan-tilt head on a desk pointed at the ceiling is not a demo.' },
  { id: 'standoffs', qty: 1 }
],

tools: [{ id: 'dmm', own: true }, { id: 'cutters', own: true }, { id: 'strippers', own: true }],

build: {
  parts: [
    { id: 'q',    comp: 'unoq',   at: [0, 46] },
    { id: 'bb',   comp: 'bb400',  at: [0, -18] },
    { id: 'pan',  comp: 'servo',  at: [-40, -62] },
    { id: 'tilt', comp: 'servo',  at: [-4, -62] },
    { id: 'cam',  comp: 'webcam', at: [40, -60] }
  ],
  wires: [
    { from: 'q.GND1',   to: 'bb.T-2',   color: 'black',  note: 'Board ground onto the rail. This is the common reference for everything' },
    { from: 'bb.T-6',   to: 'pan.GND',  color: 'black',  note: 'Pan servo ground - shared with the board, NOT its power' },
    { from: 'bb.T-10',  to: 'tilt.GND', color: 'black',  note: 'Tilt servo ground' },
    { from: 'q.D9',     to: 'pan.SIG',  color: 'orange', note: 'Pan signal. D9 is a hardware timer pin on the MCU side' },
    { from: 'q.D10',    to: 'tilt.SIG', color: 'yellow', note: 'Tilt signal' },
    { from: 'bb.T+4',   to: 'pan.VCC',  color: 'red',    note: 'Servo 5 V from the SEPARATE supply, never from the board' },
    { from: 'bb.T+8',   to: 'tilt.VCC', color: 'red',    note: 'Servo 5 V, same separate supply' },
    { from: 'cam.USB',    to: 'q.USB',   color: 'white',  note: 'The webcam, on its USB lead into the board (via the hub if yours has only the one port)' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">The servos get their own power supply. This one is not negotiable.</span>
<p>Two SG90s stalling draw well over an amp between them, in spikes lasting milliseconds. On a classic Uno that
causes a reset, which is annoying. On a Linux board it causes an <strong>unclean shutdown in the middle of a
filesystem write</strong>, which corrupts the eMMC and can leave you reflashing the whole board.</p>
<p>Servo red wires go to a separate 5&nbsp;V supply. Servo brown/black wires go to that supply's ground
<em>and</em> to a GND pin on the UNO Q - the two supplies must share a ground reference or the signal pin has
nothing to measure its voltage against. Servo orange/yellow signal wires go to the board's pins.</p>
<p>Board 5&nbsp;V pin: unused. Leave it alone.</p></div>

<div class="note danger"><span class="t">Never pull the power on a running Linux board</span>
<p>This is the habit that has to change coming from an Uno. An Uno does not care - there is no filesystem to
corrupt. The UNO Q's Linux side has one, it caches writes in RAM, and yanking USB-C mid-write can leave it
unbootable.</p>
<p>Shut it down properly: <code>sudo shutdown -h now</code>, wait for the activity to stop, then remove
power.</p></div>

<div class="note warn"><span class="t">A 1000 uF capacitor across the servo rail, at the servos</span>
<p>Positive leg to the servo 5&nbsp;V, negative (the striped side) to ground, physically close to the servos
rather than back at the supply. It absorbs the inrush when both servos start at once. Electrolytics are
polarised and fitting one backwards makes it vent - check twice.</p></div>

<div class="note tip"><span class="t">D9 and D10 belong to the microcontroller</span>
<p>The classic UNO headers on this board are wired to the STM32, not to Linux. That is what makes the pinout
compatible and it is why the sketch half of this project looks exactly like an ordinary Arduino sketch. The
Python side never touches a GPIO pin - it sends a message and lets the MCU deal with the hardware.</p></div>`,

solderSteps: [
  { h: 'There is nothing to solder here',
    body: `<p>Servos come with connectors, the pan-tilt bracket is screws, the camera is USB and the board has
    its headers fitted. This is deliberate - there is enough new material in this project without adding
    soldering to it.</p>
    <p>If you want to make it permanent later, a small proto shield on the UNO headers with three screw
    terminals (servo 5&nbsp;V, ground, and the two signals) is the right amount of effort.</p>` },
  { h: 'Assemble the pan-tilt bracket carefully, once',
    body: `<p>The acrylic kits arrive as a bag of parts with no instructions and protective film on every
    piece. Peel the film first - it looks like scratched plastic otherwise and you will spend an hour
    regretting it.</p>
    <p><strong>Centre both servos before you screw the horns on.</strong> Run the centring sketch below to
    drive them to 90 degrees, then fit the horns so the bracket is pointing straight ahead and level. If you
    skip this, half the servo's travel is wasted on one side and the head cannot look where you need it
    to.</p>
    <p>Do not overtighten the acrylic. It cracks, and it cracks at the screw hole where you cannot glue
    it.</p>` }
],

assembly: [
  { h: 'Boot it and get a terminal',
    body: `<p>Power it from the 3&nbsp;A supply and give it a minute - a Linux boot is not instant, and the
    first boot is slower still. Connect over USB-C from your laptop, or over Wi-Fi once you have configured
    it.</p>
    <p>Arduino's App Lab is the supported route and handles the connection, the file transfer and the dual
    deployment for you. Everything below also works from a plain SSH session, and this guide describes it that
    way so you can see what is actually happening.</p>` },
  { h: 'Update, then install what you need',
    body: `<p>Standard Debian housekeeping first. Then OpenCV and a runtime for the model. This takes a while -
    it is a lot of packages - so start it and make a coffee.</p>
    <p>Everything in this project runs from the system Python. If you prefer a virtual environment, make one
    now rather than halfway through.</p>` },
  { h: 'Prove the camera works before anything else',
    body: `<p><code>ls /dev/video*</code> should list at least one device. USB webcams usually appear as
    <code>/dev/video0</code>, sometimes with a second node for metadata.</p>
    <p>Run the camera test script below. It saves a single JPEG. Copy it to your laptop and look at it. If it
    is black, upside down, or 320x240 when you expected 1080p, find that out now rather than after you have
    wired everything else.</p>` },
  { h: 'Download the model',
    body: `<p>Two files: the network itself and the list of class names. The script below fetches a
    quantised SSD MobileNet, which is about 4&nbsp;MB.</p>
    <p>Run the detection script on the saved JPEG first, with no camera and no servos involved. It should
    print a list of what it found. Get that working in isolation - it is the one part of this project with
    the most ways to go subtly wrong.</p>` },
  { h: 'Flash the sketch to the microcontroller side',
    body: `<p>The MCU half is an ordinary Arduino sketch and behaves like one. It waits for messages, moves
    servos, and parks the head if nothing has arrived for a second.</p>
    <p><strong>Test it on its own</strong> before you connect the Python side: send it a couple of position
    messages by hand and watch the head move. Two halves that have each been proven separately are far easier
    to join than two halves you are debugging together.</p>` },
  { h: 'Connect the two halves',
    body: `<p>Now run the full tracker. Point it at yourself, and it should find you within a second and start
    following.</p>
    <p>Open the MJPEG stream in a browser on your laptop - the script prints the URL - and you can watch the
    boxes it is drawing. That view is the single most useful debugging tool in the project: almost every
    "it is not tracking" problem turns out to be visible in the video.</p>` },
  { h: 'Tune the gain until it stops oscillating',
    body: `<p>It will almost certainly oscillate at first. Halve <code>KP</code> until it stops, then creep
    back up. The tuning section explains what you are actually doing.</p>` },
  { h: 'Mount it somewhere it can see',
    body: `<p>On a tripod at roughly eye height, with the camera pointing into open room. A pan-tilt head on a
    desk has about thirty degrees of useful view before it is looking at a monitor.</p>` },
  { h: 'Make it start on boot, once it works',
    body: `<p>A systemd unit turns this from a demo you run by hand into a thing that exists. The service file
    is in the tuning section. Do this last - a service that starts on boot and crashes is much more annoying
    to debug than a script you run in a terminal.</p>` }
],

libraries: [
  { name: 'OpenCV (python3-opencv)', by: 'OpenCV', how: 'apt install python3-opencv', why: 'Camera capture, image resizing, drawing boxes, and the DNN module that runs the model. Install the Debian package rather than pip - it is built against the right system libraries.' },
  { name: 'NumPy', by: 'NumPy', how: 'apt install python3-numpy', why: 'Everything OpenCV hands you is a NumPy array. Comes with the OpenCV package anyway.' },
  { name: 'Flask', by: 'Pallets', how: 'apt install python3-flask', why: 'Serves the annotated MJPEG stream to a browser. Optional, and worth having.' },
  { name: 'pyserial', by: 'pySerial', how: 'apt install python3-serial', why: 'Talks to the microcontroller half over the internal bridge.' },
  { name: 'Servo', by: 'Arduino', how: 'Built in', why: 'On the sketch side. Hardware-timed pulses, which is the entire reason the servos live on this half.' }
],

code: [
{
  h: 'Step 1: system setup',
  intro: `<p>Over SSH, or in App Lab's terminal. This is ordinary Debian and nothing here is
  Arduino-specific.</p>`,
  name: 'setup.sh',
  lang: 'Shell',
  code: `# Housekeeping first. On a fresh board this can take several minutes.
sudo apt update
sudo apt upgrade -y

# OpenCV from the distro. Its DNN module can run the detector, which
# saves installing a separate inference runtime for this project.
sudo apt install -y python3-opencv python3-numpy python3-flask python3-serial

# Somewhere to work
mkdir -p ~/tracker/models
cd ~/tracker

# The model: a quantised SSD MobileNet v2 trained on COCO, in the
# TensorFlow frozen-graph form OpenCV's DNN module reads directly.
cd models
wget -q --show-progress \\
  http://download.tensorflow.org/models/object_detection/ssd_mobilenet_v2_coco_2018_03_29.tar.gz
tar -xzf ssd_mobilenet_v2_coco_2018_03_29.tar.gz
mv ssd_mobilenet_v2_coco_2018_03_29/frozen_inference_graph.pb .

# OpenCV also needs a text description of the graph structure.
wget -q --show-progress -O ssd_mobilenet_v2_coco.pbtxt \\
  https://raw.githubusercontent.com/opencv/opencv_extra/master/testdata/dnn/ssd_mobilenet_v2_coco_2018_03_29.pbtxt

cd ~/tracker
ls -la models/

# Confirm the camera is there. A UVC webcam shows up as /dev/video0.
ls /dev/video*
v4l2-ctl --list-devices 2>/dev/null || sudo apt install -y v4l-utils

# And confirm the link to the microcontroller exists. The exact name
# depends on your image - look for the one that is not your webcam.
ls /dev/ttyACM* /dev/ttyAMA* 2>/dev/null`,
  after: `<p>If <code>ls /dev/video*</code> returns nothing, the camera is not being recognised as UVC. Run
  <code>dmesg | tail -30</code> straight after plugging it in - Linux narrates what it found, and that output
  tells you whether it is a driver problem or a power problem.</p>
  <p>A camera that appears and then disappears is nearly always power: a webcam on an unpowered hub alongside a
  hungry SoC browns out. This is what the powered hub in the parts list is for.</p>`
},
{
  h: 'Step 2: prove the camera, alone',
  intro: `<p>Smallest possible test. One frame, saved to disk, nothing else involved.</p>`,
  name: 'camera_test.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""Grab one frame and save it. The first thing to run on a new board."""

import cv2
import sys

cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
if not cap.isOpened():
    print("Could not open /dev/video0")
    sys.exit(1)

# Ask for a modest size. Requesting 1080p and then immediately
# downscaling to 300x300 for the model wastes USB bandwidth and CPU
# on every single frame, which on this board is real money.
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_FPS, 30)

# MJPEG rather than raw YUYV: the camera compresses, the USB bus
# carries a tenth as much, and the board decodes. Almost always a win.
cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))

# The first frame or two off a webcam are often garbage while it
# settles its exposure, so throw a few away.
for _ in range(5):
    cap.read()

ok, frame = cap.read()
cap.release()

if not ok:
    print("Camera opened but returned no frame.")
    sys.exit(1)

print("Got a frame:", frame.shape)        # (height, width, channels)
cv2.imwrite("test.jpg", frame)
print("Wrote test.jpg")`,
  after: `<p>Copy it off and look at it: <code>scp user@board:~/tracker/test.jpg .</code></p>
  <p>Check the exposure. A very dark image means the camera needs more light than the room has, and an object
  detector on a dark, noisy image performs far worse than you would guess from looking at it. Fix lighting
  problems here rather than blaming the model later.</p>`
},
{
  h: 'Step 3: detection on a still image',
  intro: `<p>Still no camera loop, no servos, no MCU. Just: does the model load and does it find things in
  <code>test.jpg</code>?</p>`,
  name: 'detect_still.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""Run the detector once on a saved image and print what it found."""

import cv2
import numpy as np

MODEL  = "models/frozen_inference_graph.pb"
CONFIG = "models/ssd_mobilenet_v2_coco.pbtxt"

# COCO class ids are not contiguous, which catches everyone out. The
# model emits the original ids, so index into a list with the gaps in.
COCO = [
    "", "person", "bicycle", "car", "motorcycle", "airplane", "bus",
    "train", "truck", "boat", "traffic light", "fire hydrant", "",
    "stop sign", "parking meter", "bench", "bird", "cat", "dog",
    "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe",
    "", "backpack", "umbrella", "", "", "handbag", "tie", "suitcase",
    "frisbee", "skis", "snowboard", "sports ball", "kite",
    "baseball bat", "baseball glove", "skateboard", "surfboard",
    "tennis racket", "bottle", "", "wine glass", "cup", "fork",
    "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange",
    "broccoli", "carrot", "hot dog", "pizza", "donut", "cake",
    "chair", "couch", "potted plant", "bed", "", "dining table", "",
    "", "toilet", "", "tv", "laptop", "mouse", "remote", "keyboard",
    "cell phone", "microwave", "oven", "toaster", "sink",
    "refrigerator", "", "book", "clock", "vase", "scissors",
    "teddy bear", "hair drier", "toothbrush",
]

net = cv2.dnn.readNetFromTensorflow(MODEL, CONFIG)
print("Model loaded.")

img = cv2.imread("test.jpg")
if img is None:
    raise SystemExit("No test.jpg - run camera_test.py first")

h, w = img.shape[:2]

# SSD MobileNet wants 300x300. swapRB because OpenCV loads BGR and
# the model was trained on RGB - forget this and accuracy quietly
# drops, with no error anywhere.
blob = cv2.dnn.blobFromImage(img, size=(300, 300), swapRB=True, crop=False)
net.setInput(blob)
out = net.forward()

# out has shape (1, 1, N, 7). Each detection is:
#   [_, class_id, confidence, x1, y1, x2, y2]  with coords 0..1
found = 0
for det in out[0, 0]:
    conf = float(det[2])
    if conf < 0.5:
        continue
    cls = int(det[1])
    name = COCO[cls] if cls < len(COCO) else f"id{cls}"

    x1, y1 = int(det[3] * w), int(det[4] * h)
    x2, y2 = int(det[5] * w), int(det[6] * h)

    print(f"  {name:15s} {conf:.2f}  box=({x1},{y1})-({x2},{y2})")
    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(img, f"{name} {conf:.2f}", (x1, max(y1 - 6, 12)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    found += 1

print(f"{found} detection(s) above 0.5")
cv2.imwrite("test_boxes.jpg", img)
print("Wrote test_boxes.jpg")`,
  after: `<p>Copy <code>test_boxes.jpg</code> off and look at it. Boxes in the right places means the model,
  the config file and the colour order are all correct, and the hardest part of the software is done.</p>
  <p><strong>If it finds nothing at all</strong>, the usual culprit is the <code>.pbtxt</code> not matching
  the <code>.pb</code>. They are a pair and mixing versions produces a net that loads without complaint and
  detects nothing. Re-download both.</p>
  <p><strong>If it finds things but the labels are nonsense</strong>, that is the COCO index gaps - the empty
  strings in the list above are load-bearing.</p>`
},
{
  h: 'Step 4: the microcontroller half',
  intro: `<p>An ordinary Arduino sketch. It listens for one-line commands, drives two servos with hardware
  timing, and parks if Linux goes quiet.</p>`,
  name: 'tracker_mcu.ino',
  code: `/* ------------------------------------------------------------------
   UNO Q - microcontroller half of the object tracker.

   Reads lines from the Linux side and drives the pan-tilt head.

   Protocol, one command per line:
     P<pan> <tilt>    absolute angles in degrees, e.g. "P90 75"
     C                centre both and stop
     ?                report current position

   The MCU owns the servos entirely. Linux only ever sends a target,
   which means a stalled or crashed Python process cannot produce a
   malformed pulse - the worst it can do is stop sending, and this
   sketch handles that by parking.
   ------------------------------------------------------------------ */

#include <Servo.h>

#define PIN_PAN    9
#define PIN_TILT  10

// Mechanical limits. The cheap brackets bind well before 0 and 180,
// and a servo held against a hard stop draws stall current until it
// cooks. These numbers are the single most important safety feature
// in the sketch - measure yours and set them honestly.
#define PAN_MIN    20
#define PAN_MAX   160
#define TILT_MIN   40
#define TILT_MAX  140

#define CENTRE_PAN   90
#define CENTRE_TILT  90

// If Linux says nothing for this long, assume it has died and park.
#define TIMEOUT_MS  1500UL

Servo pan, tilt;

int  panPos  = CENTRE_PAN;
int  tiltPos = CENTRE_TILT;
unsigned long lastCommand = 0;
bool parked = false;

char line[32];
byte linePos = 0;

void setup() {
  Serial.begin(115200);

  pan.attach(PIN_PAN);
  tilt.attach(PIN_TILT);
  pan.write(panPos);
  tilt.write(tiltPos);

  pinMode(LED_BUILTIN, OUTPUT);
  lastCommand = millis();

  Serial.println(F("MCU ready"));
}

void loop() {
  readSerial();

  /* Watchdog. Losing the Linux side mid-track would otherwise leave
     the head frozen mid-sweep, which looks identical to a hardware
     fault and wastes an hour of debugging. */
  if (!parked && millis() - lastCommand > TIMEOUT_MS) {
    parked = true;
    moveTo(CENTRE_PAN, CENTRE_TILT);
    Serial.println(F("! timeout - parked"));
  }

  digitalWrite(LED_BUILTIN, parked ? ((millis() / 500) % 2) : HIGH);
}

void readSerial() {
  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\\n' || c == '\\r') {
      if (linePos > 0) {
        line[linePos] = '\\0';
        handle(line);
        linePos = 0;
      }
      continue;
    }
    if (linePos < sizeof(line) - 1) line[linePos++] = c;
  }
}

void handle(char *cmd) {
  lastCommand = millis();
  parked = false;

  switch (cmd[0]) {

    case 'P': {
      // "P90 75" - parse two integers after the P
      int p, t;
      if (sscanf(cmd + 1, "%d %d", &p, &t) == 2) {
        moveTo(p, t);
        Serial.print(F("ok ")); Serial.print(panPos);
        Serial.print(' ');     Serial.println(tiltPos);
      } else {
        Serial.println(F("! bad P"));
      }
      break;
    }

    case 'C':
      moveTo(CENTRE_PAN, CENTRE_TILT);
      Serial.println(F("ok centred"));
      break;

    case '?':
      Serial.print(F("pos ")); Serial.print(panPos);
      Serial.print(' ');       Serial.println(tiltPos);
      break;

    default:
      Serial.println(F("! unknown"));
  }
}

void moveTo(int p, int t) {
  // Clamp here, not in Python. The MCU is the last line of defence
  // and it is the half that cannot be edited by accident over SSH.
  panPos  = constrain(p, PAN_MIN,  PAN_MAX);
  tiltPos = constrain(t, TILT_MIN, TILT_MAX);
  pan.write(panPos);
  tilt.write(tiltPos);
}`,
  after: `<p>Test this half on its own. Open a serial terminal at 115200 to the MCU and type
  <code>P120 70</code> then Enter - the head should move. <code>C</code> centres it. Leave it for two seconds
  and it parks itself and starts blinking.</p>
  <p>The clamping is worth dwelling on. Constraining the angle in Python as well is good practice, but the
  constraint that matters is the one on the microcontroller, because that is the code that physically cannot
  be bypassed by a bug on the other side. A servo pushed into a mechanical stop draws stall current
  indefinitely and the gearbox is plastic.</p>`
},
{
  h: 'Step 5: the tracker',
  intro: `<p>The Linux half. Captures frames, runs the detector, picks a target, converts the error into an
  angle, sends it to the MCU, and serves an annotated stream to your browser.</p>`,
  name: 'tracker.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
UNO Q object tracker - Linux half.

Detects a target class, converts its position into a pan/tilt command,
and sends that to the microcontroller. Serves an annotated MJPEG
stream on port 8080 so you can see what it sees.
"""

import time
import threading
import serial
import cv2
import numpy as np
from flask import Flask, Response

# ---- configuration ---------------------------------------------------
MODEL   = "models/frozen_inference_graph.pb"
CONFIG  = "models/ssd_mobilenet_v2_coco.pbtxt"
MCU_DEV = "/dev/ttyACM0"          # the link to the STM32 half
TARGET  = "person"                # what to follow
MIN_CONF = 0.55

# Proportional gain: what fraction of the observed error to correct
# per frame. This is the number you will spend most of your tuning
# time on. Start low - an oscillating head is the default failure.
KP_PAN  = 0.05
KP_TILT = 0.04

# Below this the target is close enough. Without a deadband the head
# hunts forever around the centre, because the error is never zero.
DEADBAND_PX = 25

FRAME_W, FRAME_H = 640, 480

COCO = [
    "", "person", "bicycle", "car", "motorcycle", "airplane", "bus",
    "train", "truck", "boat", "traffic light", "fire hydrant", "",
    "stop sign", "parking meter", "bench", "bird", "cat", "dog",
    "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe",
    "", "backpack", "umbrella", "", "", "handbag", "tie", "suitcase",
    "frisbee", "skis", "snowboard", "sports ball", "kite",
    "baseball bat", "baseball glove", "skateboard", "surfboard",
    "tennis racket", "bottle", "", "wine glass", "cup", "fork",
    "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange",
    "broccoli", "carrot", "hot dog", "pizza", "donut", "cake",
    "chair", "couch", "potted plant", "bed", "", "dining table", "",
    "", "toilet", "", "tv", "laptop", "mouse", "remote", "keyboard",
    "cell phone", "microwave", "oven", "toaster", "sink",
    "refrigerator", "", "book", "clock", "vase", "scissors",
    "teddy bear", "hair drier", "toothbrush",
]

# ---- shared state between the worker and the web server --------------
latest_jpeg = None
state_lock = threading.Lock()


class Head:
    """The microcontroller, wrapped so the tracker never blocks on it."""

    def __init__(self, dev):
        self.pan = 90.0
        self.tilt = 90.0
        try:
            self.ser = serial.Serial(dev, 115200, timeout=0.05)
            time.sleep(0.5)          # the MCU resets when the port opens
            self.ser.reset_input_buffer()
            print(f"MCU on {dev}")
        except serial.SerialException as e:
            print(f"No MCU ({e}) - running vision only")
            self.ser = None

    def send(self, pan, tilt):
        self.pan = max(20.0, min(160.0, pan))
        self.tilt = max(40.0, min(140.0, tilt))
        if self.ser:
            self.ser.write(f"P{int(self.pan)} {int(self.tilt)}\\n".encode())
            self.ser.reset_input_buffer()   # we do not care about the reply

    def centre(self):
        self.pan, self.tilt = 90.0, 90.0
        if self.ser:
            self.ser.write(b"C\\n")


def open_camera():
    cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_W)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_H)
    cap.set(cv2.CAP_PROP_FPS, 30)
    # A buffer of 1 means we always get the newest frame. The default
    # queues several, so the tracker ends up steering from a view that
    # is a third of a second old - which looks exactly like bad gain.
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    if not cap.isOpened():
        raise SystemExit("No camera")
    return cap


def tracker_loop():
    global latest_jpeg

    net = cv2.dnn.readNetFromTensorflow(MODEL, CONFIG)
    # All four A53 cores. Without this OpenCV often uses one.
    net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
    net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
    cv2.setNumThreads(4)

    cap = open_camera()
    head = Head(MCU_DEV)
    head.centre()

    cx_frame, cy_frame = FRAME_W // 2, FRAME_H // 2
    lost_since = None
    fps, last_t = 0.0, time.time()

    while True:
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.05)
            continue

        blob = cv2.dnn.blobFromImage(frame, size=(300, 300),
                                     swapRB=True, crop=False)
        net.setInput(blob)
        out = net.forward()

        # Pick the largest instance of the target class. Largest, not
        # most confident: with two people in frame, following the
        # nearest is far less twitchy than following whichever one the
        # model happens to be surer about this frame.
        best, best_area = None, 0
        for det in out[0, 0]:
            conf = float(det[2])
            if conf < MIN_CONF:
                continue
            cls = int(det[1])
            name = COCO[cls] if cls < len(COCO) else ""
            if name != TARGET:
                continue

            x1 = int(det[3] * FRAME_W); y1 = int(det[4] * FRAME_H)
            x2 = int(det[5] * FRAME_W); y2 = int(det[6] * FRAME_H)
            area = (x2 - x1) * (y2 - y1)
            if area > best_area:
                best, best_area = (x1, y1, x2, y2, conf), area

        if best:
            lost_since = None
            x1, y1, x2, y2, conf = best
            cx = (x1 + x2) // 2
            # Aim a third of the way down the box rather than the
            # middle: for a person that is roughly the face, and a
            # camera pointed at someone's chest looks wrong.
            cy = y1 + (y2 - y1) // 3

            err_x = cx - cx_frame
            err_y = cy - cy_frame

            # Camera turns right -> target moves left in frame, so the
            # pan correction is negative. If yours runs away instead
            # of tracking, flip this sign - that is the whole fix.
            if abs(err_x) > DEADBAND_PX:
                head.pan -= KP_PAN * err_x
            if abs(err_y) > DEADBAND_PX:
                head.tilt += KP_TILT * err_y

            head.send(head.pan, head.tilt)

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 230, 0), 2)
            cv2.circle(frame, (cx, cy), 5, (0, 230, 0), -1)
            cv2.putText(frame, f"{TARGET} {conf:.2f}", (x1, max(y1 - 8, 14)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 230, 0), 2)
        else:
            # Park after two seconds of nothing, rather than freezing
            # mid-sweep or starting a search pattern that makes the
            # video useless for debugging.
            if lost_since is None:
                lost_since = time.time()
            elif time.time() - lost_since > 2.0:
                head.centre()

        # crosshair and telemetry
        cv2.drawMarker(frame, (cx_frame, cy_frame), (90, 90, 255),
                       cv2.MARKER_CROSS, 22, 1)
        now = time.time()
        fps = 0.9 * fps + 0.1 * (1.0 / max(now - last_t, 1e-3))
        last_t = now
        cv2.putText(frame, f"{fps:4.1f} fps  pan {head.pan:3.0f} tilt {head.tilt:3.0f}",
                    (8, FRAME_H - 12), cv2.FONT_HERSHEY_SIMPLEX,
                    0.5, (255, 255, 255), 1)

        ok, jpg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        if ok:
            with state_lock:
                latest_jpeg = jpg.tobytes()


# ---- the viewer ------------------------------------------------------
app = Flask(__name__)


@app.route("/")
def index():
    return ('<body style="margin:0;background:#111">'
            '<img src="/stream" style="width:100%">'
            "</body>")


@app.route("/stream")
def stream():
    def gen():
        while True:
            with state_lock:
                frame = latest_jpeg
            if frame:
                yield (b"--f\\r\\nContent-Type: image/jpeg\\r\\n\\r\\n"
                       + frame + b"\\r\\n")
            time.sleep(0.04)
    return Response(gen(),
                    mimetype="multipart/x-mixed-replace; boundary=f")


if __name__ == "__main__":
    threading.Thread(target=tracker_loop, daemon=True).start()
    print("Stream on http://<board-ip>:8080/")
    app.run(host="0.0.0.0", port=8080, threaded=True)`,
  after: `<p>Run it with <code>python3 tracker.py</code> and open
  <code>http://&lt;board-ip&gt;:8080/</code> on your laptop.</p>
  <p>Three details in there are worth stealing for any vision project:</p>
  <ul>
    <li><strong><code>CAP_PROP_BUFFERSIZE = 1</code></strong>. Without it you steer from stale frames, and
    every symptom looks like a control problem rather than a latency one.</li>
    <li><strong>Largest box, not highest confidence.</strong> Confidence flickers frame to frame; size does
    not. This alone removes most of the jitter with two people in view.</li>
    <li><strong>The deadband.</strong> Without it the head never stops correcting, because the error is never
    exactly zero.</li>
  </ul>`
}],

upload: `
<p>Two halves, two deployments.</p>
<p><strong>The sketch</strong> goes to the microcontroller the way any Arduino sketch does - through App Lab,
or by selecting the UNO Q's MCU target in the IDE. It stays there across reboots, like any Arduino.</p>
<p><strong>The Python</strong> lives on the Linux filesystem and you run it like any other script. It does not
survive a reboot until you make it a service.</p>
<div class="note tip"><span class="t">Expect 8-15 fps, and that is fine</span>
<p>SSD MobileNet on four A53 cores lands somewhere in that range at 300x300. It is not a GPU. For following a
person it is comfortably enough - people do not move that fast - and the tuning section covers what to do if
you need more.</p>
<p>If you are seeing 2 fps, check <code>cv2.setNumThreads(4)</code> is actually taking effect and that
something else is not eating the CPU. <code>htop</code> tells you in three seconds.</p></div>
<div class="note warn"><span class="t">Shut down properly, every time</span>
<p><code>sudo shutdown -h now</code>. Then remove power. Getting into this habit now is much easier than
recovering a corrupted filesystem later.</p></div>`,

tune: [
  { h: 'Tuning KP without a control theory textbook',
    body: `<p>Set <code>KP_PAN</code> to something clearly too high - 0.3 - and watch. The head will swing past
    the target, see it on the other side, swing back, and oscillate. That is what too much gain looks like, and
    seeing it deliberately is worth more than reading about it.</p>
    <p>Now halve it repeatedly until the oscillation stops. Then raise it in 20% steps until it just starts
    again, and back off one step. You now have the highest gain that is stable, which is the fastest tracking
    you can get from proportional control alone.</p>
    <p>Tilt usually wants slightly less gain than pan, because the tilt axis carries the camera's weight and
    has more inertia.</p>` },
  { h: 'The deadband trades precision against stillness',
    body: `<p>25 pixels out of 640 is about 4% of the frame. Smaller and the head centres more precisely but
    fidgets constantly; larger and it sits still but keeps the target noticeably off-centre.</p>
    <p>For a camera that someone is watching, err towards larger. A head that never quite stops moving is
    unpleasant to look at even when it is accurate.</p>` },
  { h: 'Getting more frames per second',
    body: `<p>In order of how much they buy you:</p>
    <ul>
      <li><strong>Drop the capture resolution to 320x240.</strong> The model only sees 300x300 anyway, so this
      costs almost no accuracy and saves real USB and CPU time.</li>
      <li><strong>Run detection on every second frame</strong> and reuse the previous box in between. At
      15&nbsp;fps that is still 7 detections a second, and a person does not move far in 70&nbsp;ms.</li>
      <li><strong>Use SSD MobileNet v1 instead of v2</strong> - noticeably faster, slightly less accurate.</li>
      <li><strong>Crop to a region of interest</strong> once you have a lock, and only run the full frame when
      you lose it. This is how real trackers work and it is a large win.</li>
    </ul>` },
  { h: 'Follow something other than a person',
    body: `<p>Change <code>TARGET</code> to any COCO class - "cat", "dog", "cup", "sports ball", "cell phone".
    A ball is the most fun to test with and the hardest to track, because it actually moves fast enough to
    expose bad tuning.</p>
    <p>To follow several classes, make <code>TARGET</code> a set and test membership instead.</p>` },
  { h: 'Smooth the servo motion on the MCU side',
    body: `<p>Right now the sketch jumps straight to each commanded angle. For a more cinematic result, move
    towards the target a degree at a time in <code>loop()</code> rather than writing it immediately - the head
    then glides instead of stepping, and it does so with no extra load on Linux at all.</p>
    <p>This is a good illustration of the architecture: the smoothing belongs on the half with reliable
    timing.</p>` },
  { h: 'Make it start on boot',
    body: `<p>Write this to <code>/etc/systemd/system/tracker.service</code>, then
    <code>sudo systemctl enable --now tracker</code>:</p>
    <p><code>[Unit]<br>Description=Object tracker<br>After=network.target<br><br>[Service]<br>
    ExecStart=/usr/bin/python3 /home/arduino/tracker/tracker.py<br>
    WorkingDirectory=/home/arduino/tracker<br>Restart=always<br>RestartSec=5<br>User=arduino<br><br>
    [Install]<br>WantedBy=multi-user.target</code></p>
    <p><code>Restart=always</code> matters: a camera that browns out takes the script with it, and you want it
    back without a person involved. <code>journalctl -u tracker -f</code> shows you the logs.</p>` },
  { h: 'Train your own classes',
    body: `<p>COCO's 80 classes do not include your cat specifically, or a particular tool, or a parcel. When
    you need that, the workflow is the same as the TinyML projects - collect images, label boxes, train,
    export - just with a bigger model and real images. Edge Impulse does object detection too, and the model
    it exports drops into this same script.</p>` }
],

trouble: [
  { q: 'The head runs to one end and stays there',
    a: `The pan sign is wrong for your mechanical arrangement, so every correction makes the error bigger.
    Flip <code>-=</code> to <code>+=</code> on the <code>head.pan</code> line. This is the most common single
    problem in the project and it is a one-character fix.` },
  { q: 'It oscillates constantly',
    a: `Gain too high, or you are steering from stale frames. Halve <code>KP_PAN</code> first. If it still
    oscillates at very low gain, check <code>CAP_PROP_BUFFERSIZE</code> is being applied - a camera queuing
    five frames introduces about 150&nbsp;ms of delay, and delay in a feedback loop causes oscillation no
    amount of gain reduction fixes.` },
  { q: 'Servos buzz constantly even when still',
    a: `Normal for cheap SG90s - they hunt slightly around their commanded position. It gets much worse if the
    supply is weak. If it is loud, check the separate supply is actually being used, add the 1000&nbsp;uF
    capacitor, and consider calling <code>detach()</code> on the servos once the head has been still for a few
    seconds.` },
  { q: 'The board reboots when the servos move',
    a: `The servos are being powered from the board. Go back and read the first wiring note - this is the
    failure it exists to prevent, and repeated unclean reboots will eventually corrupt the filesystem.` },
  { q: '<code>Could not open /dev/video0</code> but the camera is plugged in',
    a: `Check <code>ls /dev/video*</code>. Some webcams claim several nodes and only one delivers video - try
    <code>VideoCapture(1)</code>. Check permissions: your user needs to be in the <code>video</code> group
    (<code>sudo usermod -aG video $USER</code>, then log out and back in). And check nothing else has the
    camera open.` },
  { q: 'The model loads but finds nothing, ever',
    a: `Mismatched <code>.pb</code> and <code>.pbtxt</code>. Re-download both from the links in the setup
    script. Second candidate: you dropped <code>swapRB=True</code>, which feeds the model BGR when it was
    trained on RGB - detections quietly collapse with no error.` },
  { q: 'Detections are correct but the labels are wrong',
    a: `The COCO list in the script has deliberate empty strings in it, because COCO's class ids have gaps. If
    you retyped the list and removed them, every label past the first gap is shifted.` },
  { q: 'Two or three frames per second',
    a: `Check <code>htop</code>. If one core is at 100% and three are idle, <code>cv2.setNumThreads(4)</code>
    is not taking effect. If all four are busy, you are simply at the board's limit - drop the capture
    resolution and run detection every other frame.` },
  { q: 'Nothing on /dev/ttyACM0 and the tracker says "running vision only"',
    a: `The device name for the internal bridge varies between images. <code>ls /dev/tty*</code> with the
    webcam unplugged, and look for what changes when the MCU is reset. App Lab abstracts this away, which is a
    good reason to use it once you have understood what it is hiding.` },
  { q: 'It tracks fine, then freezes after a while',
    a: `Check <code>dmesg</code> for USB resets - a webcam on a marginal supply drops off and OpenCV blocks
    forever waiting for a frame that is not coming. A powered hub fixes this. Adding a read timeout and
    reopening the camera makes it survive the next one.` }
],

next: `
<ul>
  <li><strong>Add voice.</strong> The same board, the same dual-brain split, with a microphone instead of a
  camera: <a href="project.html?p=uno-q-voice-control">offline voice control</a>.</li>
  <li><strong>Start smaller if this was a jump.</strong>
  <a href="project.html?p=tinyml-gesture-nano">Gesture recognition</a> teaches the machine learning half on a
  $55 board with no Linux involved.</li>
  <li><strong>Go faster.</strong> Ten frames a second is fine for a person and not for a ball. The
  <a href="project.html?p=jetson-orin-vision">Jetson Orin Nano</a> runs the same kind of model roughly twenty
  times faster, for five times the price.</li>
  <li><strong>Compare it with the cheap approach.</strong> The
  <a href="project.html?p=esp32cam-motion-trap">ESP32-CAM motion trap</a> costs $7 and detects
  <em>movement</em> rather than objects. Building both teaches you exactly what the extra money buys - and
  when it is not worth spending.</li>
  <li><strong>Record what it sees.</strong> Write a clip to disk whenever the target appears, with a
  timestamp. That turns a demo into something you would actually leave running.</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">Mostly ordinary, with three real points</span>
<ul>
  <li><strong>Never yank the power on the Linux side.</strong> Always <code>sudo shutdown -h now</code>. An
  interrupted write to the eMMC can leave the board unbootable, and that is a much worse afternoon than a
  corrupted sketch.</li>
  <li><strong>Separate supply for the servos.</strong> Covered above and worth repeating, because the failure
  mode here is filesystem damage rather than a harmless reset.</li>
  <li><strong>Fingers out of the pan-tilt head.</strong> Small servos are weak but the acrylic brackets have
  real pinch points, and this one moves without warning.</li>
  <li><strong>Think about where you point it.</strong> A camera that recognises people, running continuously,
  is a surveillance device - and other people's expectations about being recorded are not covered by your
  intentions. Everything in this project runs locally and nothing leaves the board, which is a genuinely
  meaningful privacy property. Keep it that way: the MJPEG stream is unauthenticated and anyone on your
  network can open it, so do not expose port 8080 to the internet.</li>
  <li><strong>Do not put it in a shared or public space</strong> without telling the people in that space.
  In many countries that is also a legal requirement rather than a courtesy.</li>
</ul>
</div>`
});
