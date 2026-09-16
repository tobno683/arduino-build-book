/* Jetson Orin Nano Super running YOLO with tracking, an Uno as the I/O layer. */
AB.addProject({
slug: 'jetson-orin-vision',
title: 'Real-time vision with a Jetson Orin Nano',
cat: 'ai',
level: 4,
time: '8 hours',
solder: true,
board: 'Jetson + Uno',
tags: ['jetson', 'orin nano', 'yolo', 'tensorrt', 'gpu', 'object tracking', 'bytetrack', 'people counter', 'cuda', 'linux'],
blurb: 'Thirty frames a second of real object detection, with identities tracked between frames. A GPU does the seeing, an Uno does the switching, and the price of admission is honestly discussed.',

skills: ['CUDA and GPU inference', 'YOLO', 'TensorRT optimisation', 'Multi-object tracking', 'MIPI CSI cameras', 'Serial as a hardware abstraction'],

intro: `
<p>The UNO Q runs an object detector at about ten frames a second on four CPU cores. That is enough to follow
a person walking across a room and not enough to count them reliably, because a detector that loses sight of
someone for three frames cannot tell whether the person who reappeared is the same one.</p>
<p>The Jetson Orin Nano Super has a 1024-core GPU with tensor cores on it. The same class of model runs at
thirty to sixty frames a second, which changes what is possible rather than just how smooth it looks. At that
rate you can <em>track</em> - keep an identity attached to each object between frames - and once you can track,
you can count, measure dwell time, detect direction, and notice that something has been left behind.</p>
<p>Being honest about the price: the kit is $249, and with a camera, storage and an Arduino this project is
close to $340. That is a lot. It is also roughly a tenth of what this capability cost five years ago, and it
runs on 15 watts on a shelf in your house with no subscription attached.</p>
<p>This is the top of the range in this book and the point where it stops being an Arduino project in the
usual sense. The Uno is still here, and its role is worth paying attention to: it is doing the one thing the
$249 computer is bad at.</p>`,

what: [
  'Run YOLO on live camera video at 30+ fps, entirely on the board.',
  'Track objects between frames so each one keeps a stable identity.',
  'Count people or vehicles crossing a line, in each direction, without double-counting.',
  'Convert the model to TensorRT and measure the speedup rather than taking it on faith.',
  'Drive a seven-segment count display and status LEDs from an Uno over USB.',
  'Serve an annotated stream so you can see what it is doing from a laptop.'
],

how: `
<p><strong>What is actually in the box.</strong> Six Arm Cortex-A78AE CPU cores, an Ampere GPU with 1024 CUDA
cores and 32 tensor cores, and 8&nbsp;GB of LPDDR5 shared between them at around 100&nbsp;GB/s. NVIDIA quotes
67 TOPS of INT8 throughput for the Super configuration.</p>
<p>TOPS - trillions of operations per second - is a marketing number and deserves the scepticism you would
give any peak figure, but the ratio it implies is real. The reason a GPU is so much faster at this is not
mysterious: a convolution is the same small arithmetic operation applied to millions of pixel neighbourhoods
independently, which is precisely the shape of problem a thousand small cores solve well and six large ones do
not.</p>

<p><strong>Unified memory, which matters more than it sounds.</strong> The CPU and GPU share one physical
memory. On a desktop with a discrete graphics card, every frame has to be copied across PCIe to the GPU and
the result copied back, and at 60&nbsp;fps that transfer is a real cost. Here there is no copy - the GPU reads
the frame where the camera decoder left it. It is a large part of why a 15&nbsp;W board keeps up with cards
that draw ten times as much for this particular job.</p>

<p><strong>YOLO, and why it is different from SSD.</strong> "You Only Look Once" divides the image into a grid
and predicts boxes directly from a single pass over the whole frame. Modern versions add feature pyramids so
one network handles small and large objects at once. It is both more accurate and faster than the SSD
MobileNet in the UNO Q project, and it is far too heavy for a CPU-only board - which is the whole
comparison.</p>

<p><strong>TensorRT.</strong> A trained model is a graph of operations, and the obvious way to run it is one
operation at a time. TensorRT takes that graph and rebuilds it for the specific GPU in front of it: fusing
convolution, bias and activation into one kernel, picking algorithms benchmarked on this exact chip, and
converting the weights to FP16 or INT8. The result is the same model, two to four times faster, and the
conversion is a single command.</p>
<p>The first conversion takes several minutes because it genuinely benchmarks alternatives on your hardware.
That is not a progress bar being slow; it is the work.</p>

<p><strong>Detection is not tracking.</strong> A detector answers "what is in this frame". It has no memory -
run it on two consecutive frames and you get two unrelated lists of boxes.</p>
<p>A tracker adds the identity. ByteTrack, used here, predicts where each existing track should have moved to,
matches new detections against those predictions by overlap, and - the clever part - does a second matching
pass using the <em>low-confidence</em> detections that the detector nearly discarded. A partially occluded
person produces a weak detection, and keeping the track alive through that occlusion is most of what separates
a counter that works from one that counts everyone three times.</p>

<p><strong>Why there is still an Arduino.</strong> The Jetson has a 40-pin header and a Python library for it,
and you can absolutely blink an LED with it. But it runs a full Ubuntu desktop-class kernel, and anything
needing microsecond timing - a WS2812 strip, a servo, a stepper - is as unreliable there as on any other
Linux machine.</p>
<p>So the Uno hangs off a USB port and owns every pin that matters. This is the same split as the UNO Q
projects, with the two halves in separate packages instead of on one board. Seeing it both ways makes the
principle stick.</p>`,

bom: [
  { id: 'jetson-orin', qty: 1, note: 'The Orin Nano Super Developer Kit. It includes the 19 V supply - check yours does, because the bare module does not.' },
  { id: 'csi-cam', qty: 1, note: 'IMX219 on a 22-pin ribbon. Buy the version with the narrow 22-pin connector, not the 15-pin Raspberry Pi one - or buy the adapter cable at the same time.' },
  { id: 'nvme', qty: 1, note: 'Strongly recommended. Models, CUDA libraries and TensorRT caches are tens of gigabytes, and an NVMe root filesystem transforms how the board feels.' },
  { id: 'sd-64gb', qty: 1, note: 'The alternative if you skip the NVMe. Workable, slow, and the card will eventually die from the write load.' },
  { id: 'uno', qty: 1, note: 'The I/O layer. A $9 board doing the one job the $249 board is bad at.' },
  { id: 'usb-cable', qty: 1, note: 'USB-B for the Uno. This is the entire link between the two computers.' },
  { id: 'max7219', qty: 1, note: 'Eight-digit seven-segment module for the live count. Readable across a room, which an OLED is not.' },
  { id: 'led5', qty: 2, note: 'Green for in, red for out.' },
  { id: 'res220', qty: 2 },
  { id: 'fan40', qty: 1, own: true, note: 'The dev kit has a fan already. Listed because if you build it into a box you will need to think about airflow.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'standoffs', qty: 1, note: 'The carrier board must not sit on anything conductive.' },
  { id: 'tripod', qty: 1, note: 'The camera needs a fixed, stable view. A counting line means nothing if the camera moves.' }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'jet',  comp: 'jetson',  at: [0, 58] },
    { id: 'cam',  comp: 'csicam',  at: [-64, -22] },
    { id: 'uno',  comp: 'uno',     at: [18, -34] },
    { id: 'disp', comp: 'max7219', at: [12, -96] },
    { id: 'lg',   comp: 'led5',    at: [-30, -78], opt: { c: '#3fbf6a' } },
    { id: 'lr',   comp: 'led5',    at: [-20, -78], opt: { c: '#e0483c' } }
  ],
  wires: [
    { from: 'cam.RIBBON', to: 'jet.CSI0',  color: 'white',  note: 'CSI ribbon into camera connector 0. Contacts face the board - see the notes' },
    { from: 'jet.USB',    to: 'uno.USB',   color: 'white',  note: 'USB lead. This is the ENTIRE link between the two computers - no GPIO crosses between them' },
    { from: 'uno.5V',     to: 'disp.VCC',  color: 'red',    note: 'Display power from the Uno' },
    { from: 'uno.GND1',   to: 'disp.GND',  color: 'black',  note: 'Display ground' },
    { from: 'uno.D11',    to: 'disp.DIN',  color: 'blue',   note: 'SPI data to the MAX7219' },
    { from: 'uno.D10',    to: 'disp.CS',   color: 'orange', note: 'Chip select' },
    { from: 'uno.D13',    to: 'disp.CLK',  color: 'yellow', note: 'SPI clock' },
    { from: 'lg.A',       to: 'uno.D5',    color: 'green',  note: 'Green LED through 220 ohm - someone crossed inward' },
    { from: 'lg.K',       to: 'uno.GND2',  color: 'black',  note: 'Cathode to ground' },
    { from: 'lr.A',       to: 'uno.D6',    color: 'red',    note: 'Red LED through 220 ohm - someone crossed outward' },
    { from: 'lr.K',       to: 'uno.GND2',  color: 'black',  note: 'Cathode to ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Nothing electrical crosses between the two computers except USB</span>
<p>That is the design, and it is worth stating because the temptation to "just grab 5&nbsp;V from the Jetson's
header" is strong. Do not. The Uno gets its power from the USB lead that already carries the data, the Jetson
keeps its own supply, and there is exactly one connection between them.</p>
<p>The Jetson's 40-pin header is <strong>3.3 V logic and not 5 V tolerant</strong>. Connecting an Uno's
5&nbsp;V output pin to it will damage the SoC, and the SoC is not a socketed part.</p></div>

<div class="note danger"><span class="t">The CSI ribbon: one orientation, and it is fragile</span>
<p>Power off completely before touching it. Lift the connector's plastic latch gently - it hinges, it does not
pull out, and it snaps if you force it.</p>
<p>The ribbon's <strong>metal contacts face the board</strong> (towards the PCB, away from the latch) on the
Jetson's connectors. Insert it square, all the way in, and close the latch evenly with a fingernail on each
end.</p>
<p>A ribbon in backwards usually just gives you "no camera detected". A ribbon inserted with power on can
short the CSI lanes, and that is not a repairable fault.</p></div>

<div class="note warn"><span class="t">Use the supplied 19 V power brick</span>
<p>The kit ships with one. Under load with the GPU busy, the board pulls 25&nbsp;W in bursts, and an
underpowered supply causes exactly the symptom you least want to debug: it works fine until the model starts,
then reboots.</p>
<p>If you are on USB-C power delivery instead, it must genuinely negotiate enough power - many chargers claim
more than they deliver.</p></div>

<div class="note warn"><span class="t">Shut it down properly, and give it air</span>
<p><code>sudo shutdown -h now</code>, every time. An NVMe root filesystem interrupted mid-write is just as
recoverable-in-theory and annoying-in-practice as any other.</p>
<p>The dev kit's heatsink and fan are sized for open air. In a box, the GPU will thermally throttle - quietly,
with no error, showing up only as frames per second slowly dropping. <code>tegrastats</code> shows you the
temperatures and whether it is throttling.</p></div>

<div class="note tip"><span class="t">The Uno half is ordinary in every way</span>
<p>MAX7219 on hardware SPI, two LEDs on digital pins. If you have built anything else in this book, you have
built this part. That is the point: the expensive computer sends text, and a $9 board that you already
understand turns text into pins.</p></div>`,

solderSteps: [
  { h: 'Almost nothing here needs soldering',
    body: `<p>The MAX7219 module comes assembled with a header. The Jetson has none. The only soldering is the
    two LEDs and their resistors, and even those can live on a breadboard while you get the software
    working.</p>
    <p>Do the software first. This project has a long software phase and a short hardware one, and doing them
    in that order means you are never debugging both at once.</p>` },
  { h: 'A small perfboard for the Uno side',
    body: `<p>Female headers so the Uno is removable, a three-pin socket for the display's SPI lead, and the
    two LEDs with resistors folded into their anode legs.</p>
    <p>Green left, red right, and label them. The MAX7219 module has its own connector, so the display just
    plugs in.</p>` },
  { h: 'Mount the Jetson on standoffs',
    body: `<p>The carrier board has mounting holes and it must not sit on anything conductive - the underside
    has exposed pads. Nylon M3 standoffs, four of them, and leave clearance under the board for air.</p>
    <p>Do not block the fan intake. It draws from above and exhausts sideways.</p>` },
  { h: 'Strain-relieve the camera ribbon',
    body: `<p>The CSI ribbon is the most fragile part of this build and it is the one you will knock. Tape it
    down where it leaves the connector so that a tug on the camera end pulls on the tape rather than on the
    connector latch.</p>
    <p>A broken CSI connector on the carrier board is effectively unrepairable at home.</p>` }
],

assembly: [
  { h: 'Flash JetPack and expect it to take an evening',
    body: `<p>Download the JetPack 6 SD card image from NVIDIA's site, write it with Balena Etcher or
    <code>dd</code>, boot with a monitor, keyboard and mouse attached, and go through the Ubuntu setup.</p>
    <p>Do the first boot with a display connected even if you plan to run it headless. Getting SSH and Wi-Fi
    configured is much easier with a screen than without one.</p>
    <p>If you bought the NVMe, install it before first boot and use NVIDIA's SDK Manager from an x86 Linux
    machine to flash directly to it. Migrating later is possible and tedious.</p>` },
  { h: 'Set the power mode deliberately',
    body: `<p><code>sudo nvpmodel -q</code> shows the current mode. The Super kit's high-performance mode
    (MAXN) is what the headline numbers are quoted at, and it is not always the default.</p>
    <p>Then <code>sudo jetson_clocks</code> pins the clocks to maximum rather than letting them scale. Do this
    before benchmarking or you will measure the governor rather than the hardware.</p>` },
  { h: 'Install jetson-stats and leave it running',
    body: `<p><code>sudo pip3 install jetson-stats</code>, then <code>jtop</code>. It shows GPU load,
    temperatures, power draw, clock speeds and whether you are throttling, all in one screen.</p>
    <p>Keep it open in a second terminal for the whole project. Almost every performance question in this
    build is answered by looking at it - in particular "is the GPU actually being used, or am I running on the
    CPU by accident".</p>` },
  { h: 'Prove the camera before anything else',
    body: `<p>CSI cameras on a Jetson go through the hardware ISP, which means GStreamer rather than a plain
    <code>/dev/video0</code> open. The test command in the code section shows a live window.</p>
    <p>If nothing appears, check <code>ls /dev/video*</code> and <code>dmesg | grep -i imx219</code>. The
    kernel says whether it found the sensor, and that one line separates "wrong ribbon orientation" from
    "wrong software".</p>` },
  { h: 'Install Ultralytics and run YOLO once',
    body: `<p><code>pip3 install ultralytics</code>. The first run downloads the model weights.</p>
    <p>Run it on a single image first. It will use PyTorch on the GPU, and it will be respectably fast
    already - this is your unoptimised baseline and you want the number.</p>` },
  { h: 'Export to TensorRT and measure the difference',
    body: `<p>One command, several minutes of real benchmarking, and a <code>.engine</code> file.</p>
    <p>Run the benchmark script before and after. Write both numbers down. This is the most instructive five
    minutes in the project, and it is also the step where people assume the speedup happened without
    checking.</p>
    <p><strong>The engine file is tied to this board and this version of TensorRT.</strong> It will not move
    to another Jetson, and a JetPack upgrade invalidates it. That is the trade for the speed.</p>` },
  { h: 'Flash the Uno and test the display on its own',
    body: `<p>An ordinary Uno sketch over ordinary USB. Send it <code>I</code> and <code>O</code> from a serial
    terminal and watch the count change.</p>
    <p>Prove this half completely before connecting the two.</p>` },
  { h: 'Place the camera and draw the counting line',
    body: `<p>The camera must be fixed. A counting line is defined in pixel coordinates, so a camera that moves
    invalidates it silently.</p>
    <p>Overhead or high and angled down works far better than eye level, because people occlude each other
    much less from above. Run the counter with the line drawn and watch the stream while someone walks
    through, before you trust any number it produces.</p>` },
  { h: 'Tune the line and the direction logic',
    body: `<p>Place the line where people cross it cleanly and perpendicular to their direction of travel. A
    line across a doorway is easy; a line across an open-plan room where people loiter on it is not - they
    will be counted repeatedly as they drift back and forth.</p>
    <p>The script requires a track to be seen on both sides of the line, which handles loitering properly.</p>` },
  { h: 'Make it a service and leave it running',
    body: `<p>Same systemd pattern as the other Linux projects. Then check on it after a week - thermal
    throttling, a full disk from logs, and a camera that has dropped off a USB bus are all week-long problems
    rather than hour-long ones.</p>` }
],

libraries: [
  { name: 'Ultralytics YOLO', by: 'Ultralytics', how: 'pip3 install ultralytics', why: 'YOLO models, TensorRT export and ByteTrack tracking in one package. Note the AGPL licence if you ever plan to distribute something built on it.' },
  { name: 'TensorRT', by: 'NVIDIA', how: 'Part of JetPack', why: 'Rebuilds the model for this specific GPU. The single biggest speed win available, and it is one command.' },
  { name: 'OpenCV', by: 'OpenCV', how: 'Part of JetPack', why: 'Camera capture through GStreamer, drawing, and JPEG encoding for the stream.' },
  { name: 'jetson-stats', by: 'Raffaello Bonghi', how: 'sudo pip3 install jetson-stats', why: 'jtop. Tells you whether the GPU is busy and whether you are throttling.' },
  { name: 'pyserial', by: 'pySerial', how: 'pip3 install pyserial', why: 'The link to the Uno.' },
  { name: 'LedControl', by: 'Eberhard Fahle', why: 'On the Arduino side. Drives the MAX7219 seven-segment module.' }
],

code: [
{
  h: 'Step 1: set the board up properly',
  intro: `<p>Run this after the first boot. The power mode and clock settings matter more than anything else
  here - a Jetson in its low-power mode benchmarks like a different product.</p>`,
  name: 'jetson_setup.sh',
  lang: 'Shell',
  code: `# What mode is it in? MAXN is the one the headline numbers assume.
sudo nvpmodel -q

# Set maximum performance, then pin the clocks so the governor does
# not scale them down mid-benchmark.
sudo nvpmodel -m 0
sudo jetson_clocks

# The monitoring tool. Keep jtop open in another terminal all day.
sudo apt update
sudo apt install -y python3-pip
sudo pip3 install -U jetson-stats
# (log out and back in, then run:  jtop )

# Confirm CUDA is present and visible
nvcc --version
python3 -c "import torch; print('CUDA:', torch.cuda.is_available())"

# YOLO, TensorRT export support, and the serial link
pip3 install -U ultralytics pyserial

# Is the CSI camera detected? The kernel tells you directly.
dmesg | grep -i imx219
ls /dev/video*

# Live preview, through the hardware ISP. CSI cameras do NOT open as
# a plain /dev/video0 in OpenCV - they go through GStreamer, and this
# is the single most common stumbling block on a Jetson.
gst-launch-1.0 nvarguscamerasrc sensor-id=0 ! \\
  'video/x-raw(memory:NVMM),width=1280,height=720,framerate=30/1' ! \\
  nvvidconv ! nvegltransform ! nveglglessink -e

# Disk space - TensorRT engines and CUDA libraries are not small
df -h /`,
  after: `<p>If <code>torch.cuda.is_available()</code> prints <code>False</code>, you have a pip-installed CPU
  build of PyTorch shadowing the one JetPack provides. This is the most common setup mistake on a Jetson.
  Uninstall it and use NVIDIA's Jetson-specific wheel - a CPU PyTorch will run everything in this project
  perfectly, about thirty times slower, with no error message anywhere.</p>`
},
{
  h: 'Step 2: the camera, through GStreamer',
  intro: `<p>A CSI camera needs a GStreamer pipeline. Get this working on its own before adding a model to
  it.</p>`,
  name: 'camera_test.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""CSI camera capture on a Jetson. Saves one frame, reports the rate."""

import cv2
import time


def csi_pipeline(sensor_id=0, w=1280, h=720, fps=30, flip=0):
    """
    nvarguscamerasrc is NVIDIA's CSI source - it runs the sensor
    through the hardware ISP (debayer, auto-exposure, white balance).
    nvvidconv then moves the frame out of NVMM memory into something
    OpenCV can read.

    A USB webcam would just be VideoCapture(0). CSI is more setup and
    gives you a better image with no CPU cost.
    """
    return (
        f"nvarguscamerasrc sensor-id={sensor_id} ! "
        f"video/x-raw(memory:NVMM), width={w}, height={h}, "
        f"format=NV12, framerate={fps}/1 ! "
        f"nvvidconv flip-method={flip} ! "
        f"video/x-raw, format=BGRx ! "
        f"videoconvert ! video/x-raw, format=BGR ! "
        f"appsink drop=true max-buffers=1"
    )


cap = cv2.VideoCapture(csi_pipeline(), cv2.CAP_GSTREAMER)
if not cap.isOpened():
    raise SystemExit(
        "Camera did not open.\\n"
        "  - check  dmesg | grep imx219\\n"
        "  - check the ribbon orientation (contacts towards the board)\\n"
        "  - check OpenCV has GStreamer: "
        "python3 -c \\"import cv2; print(cv2.getBuildInformation())\\" | grep -i gstreamer"
    )

for _ in range(10):            # let auto-exposure settle
    cap.read()

t0, n = time.time(), 0
for _ in range(60):
    ok, frame = cap.read()
    if ok:
        n += 1
dt = time.time() - t0

print(f"{n} frames in {dt:.2f}s = {n/dt:.1f} fps")
print("frame shape:", frame.shape)
cv2.imwrite("test.jpg", frame)
print("wrote test.jpg")
cap.release()`,
  after: `<p><code>drop=true max-buffers=1</code> in the pipeline is the Jetson equivalent of
  <code>CAP_PROP_BUFFERSIZE</code> on a webcam: always hand us the newest frame rather than queueing old ones.
  Without it your tracker runs on video that is a few hundred milliseconds stale.</p>
  <p><code>flip-method</code> takes 0-7. If your image is upside down, that is the parameter - fixing it here
  costs nothing, while rotating in software costs a copy every frame.</p>`
},
{
  h: 'Step 3: benchmark, before and after TensorRT',
  intro: `<p>Run this, export to TensorRT, then run it again. Write both numbers down - this is the whole
  argument for the hardware.</p>`,
  name: 'benchmark.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Measure YOLO inference speed, PyTorch vs TensorRT.

Run it, then export the engine, then run it again:

    python3 benchmark.py
    yolo export model=yolo11n.pt format=engine half=True device=0
    python3 benchmark.py yolo11n.engine
"""

import sys
import time
import numpy as np
from ultralytics import YOLO

model_path = sys.argv[1] if len(sys.argv) > 1 else "yolo11n.pt"
model = YOLO(model_path)

# A fixed synthetic frame, so we are timing the model and not the
# camera, the disk or the JPEG decoder.
frame = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)

# The first few runs include CUDA context setup and kernel autotuning
# and are wildly unrepresentative. Never include them in a benchmark.
print("warming up...")
for _ in range(10):
    model.predict(frame, verbose=False, device=0)

N = 100
print(f"timing {N} inferences...")
t0 = time.perf_counter()
for _ in range(N):
    model.predict(frame, verbose=False, device=0)
dt = time.perf_counter() - t0

print(f"\\n  model   : {model_path}")
print(f"  total   : {dt:.2f} s")
print(f"  per inf : {dt/N*1000:.1f} ms")
print(f"  fps     : {N/dt:.1f}")`,
  after: `<p>Typical results on an Orin Nano Super at 640x640 with <code>yolo11n</code>: the PyTorch model lands
  somewhere around 25-35&nbsp;fps, the TensorRT FP16 engine around 60-90. Your numbers will differ with
  JetPack version and power mode - what matters is the ratio, and that you measured it rather than assumed
  it.</p>
  <p>For comparison, the same class of task on the UNO Q's four CPU cores is roughly 10&nbsp;fps with a
  smaller and less accurate model. That gap is what $249 buys, and it is worth knowing exactly how big it is
  before deciding you need it.</p>
  <p><strong>Keep <code>jtop</code> open while this runs.</strong> If GPU utilisation is near zero, you are
  running on the CPU and the benchmark is meaningless.</p>`
},
{
  h: 'Step 4: the Arduino half',
  intro: `<p>An entirely ordinary Uno sketch. It receives counts and displays them.</p>`,
  name: 'counter_display.ino',
  code: `/* ------------------------------------------------------------------
   Counter display - the I/O half of the Jetson vision counter.

   Commands from the Jetson, one per line:
     I        someone crossed inward
     O        someone crossed outward
     N<in> <out>   set both counts absolutely, e.g. "N12 9"
     Z        zero both counts
     B<0-15>  display brightness

   This is a $9 board doing the job the $249 board is bad at:
   deterministic, always-on, boots in a millisecond, and will still
   be showing the right number if Linux is busy or updating.
   ------------------------------------------------------------------ */

#include <LedControl.h>

// LedControl(DIN, CLK, CS, number of chained MAX7219s)
LedControl disp = LedControl(11, 13, 10, 1);

#define LED_IN    5
#define LED_OUT   6
#define FLASH_MS  250

long countIn = 0, countOut = 0;

unsigned long inLit = 0, outLit = 0;
char line[24];
byte linePos = 0;

void setup() {
  Serial.begin(115200);

  disp.shutdown(0, false);       // wake the display
  disp.setIntensity(0, 8);
  disp.clearDisplay(0);

  pinMode(LED_IN, OUTPUT);
  pinMode(LED_OUT, OUTPUT);

  show();
  Serial.println(F("counter ready"));
}

void loop() {
  readSerial();

  // Non-blocking LED flashes. delay() here would mean dropping
  // serial bytes during a busy moment, which is exactly when the
  // counts matter most.
  if (inLit  && millis() - inLit  > FLASH_MS) { digitalWrite(LED_IN, LOW);  inLit = 0; }
  if (outLit && millis() - outLit > FLASH_MS) { digitalWrite(LED_OUT, LOW); outLit = 0; }
}

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

    case 'I':
      countIn++;
      digitalWrite(LED_IN, HIGH);
      inLit = millis();
      show();
      break;

    case 'O':
      countOut++;
      digitalWrite(LED_OUT, HIGH);
      outLit = millis();
      show();
      break;

    case 'N': {
      long a, b;
      if (sscanf(cmd + 1, "%ld %ld", &a, &b) == 2) {
        countIn = a; countOut = b;
        show();
      }
      break;
    }

    case 'Z':
      countIn = countOut = 0;
      show();
      break;

    case 'B':
      disp.setIntensity(0, constrain(atoi(cmd + 1), 0, 15));
      break;
  }

  Serial.print(F("ok "));
  Serial.print(countIn);
  Serial.print(' ');
  Serial.println(countOut);
}

/* Left four digits: in.  Right four: out. */
void show() {
  writeNumber(countIn,  4, 4);
  writeNumber(countOut, 0, 4);
}

void writeNumber(long v, byte startDigit, byte width) {
  bool neg = v < 0;
  if (neg) v = -v;

  for (byte i = 0; i < width; i++) {
    byte d = startDigit + i;
    if (v == 0 && i > 0) {
      // Blank leading zeros rather than printing 0012 - it reads as
      // a number rather than as an odometer.
      if (neg) { disp.setChar(0, d, '-', false); neg = false; }
      else disp.setChar(0, d, ' ', false);
    } else {
      disp.setDigit(0, d, v % 10, false);
      v /= 10;
    }
  }
}`,
  after: `<p>Test it from a serial terminal at 115200: <code>I</code>, <code>I</code>, <code>O</code>,
  <code>Z</code>. The display should track along.</p>
  <p>The Uno keeps the authoritative count, and the <code>N</code> command lets the Jetson resynchronise after
  a restart. That ordering matters: if the Python script crashes and restarts, the display should not reset to
  zero.</p>`
},
{
  h: 'Step 5: the counter',
  intro: `<p>YOLO with tracking, a counting line, and the serial link. This is the whole system.</p>`,
  name: 'counter.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
People counter - Jetson Orin Nano.

YOLO detects, ByteTrack keeps identities between frames, and a line
crossing is counted once per track, in whichever direction it went.

Serves an annotated MJPEG stream on :8080 so you can see the line.
"""

import time
import threading
import json
import serial
import cv2
import numpy as np
from flask import Flask, Response
from ultralytics import YOLO

# ---- configuration ---------------------------------------------------
MODEL     = "yolo11n.engine"      # the TensorRT engine, not the .pt
UNO_DEV   = "/dev/ttyACM0"
TARGET_ID = 0                     # COCO class 0 = person
MIN_CONF  = 0.45

W, H = 1280, 720

# The counting line, in pixels. Horizontal across the middle here.
# Crossing downward counts as "in".
LINE_Y = H // 2
LINE_X0, LINE_X1 = 100, W - 100

STATE_FILE = "counts.json"

latest_jpeg = None
lock = threading.Lock()


def csi_pipeline(sensor_id=0, fps=30, flip=0):
    return (
        f"nvarguscamerasrc sensor-id={sensor_id} ! "
        f"video/x-raw(memory:NVMM), width={W}, height={H}, "
        f"format=NV12, framerate={fps}/1 ! "
        f"nvvidconv flip-method={flip} ! video/x-raw, format=BGRx ! "
        f"videoconvert ! video/x-raw, format=BGR ! "
        f"appsink drop=true max-buffers=1"
    )


class Uno:
    def __init__(self, dev):
        try:
            self.ser = serial.Serial(dev, 115200, timeout=0.2)
            time.sleep(2.0)       # the Uno resets when the port opens
            self.ser.reset_input_buffer()
            print(f"Uno on {dev}")
        except serial.SerialException as e:
            print(f"No Uno ({e}) - counting to the console only")
            self.ser = None

    def send(self, text):
        if self.ser:
            try:
                self.ser.write((text + "\\n").encode())
            except serial.SerialException:
                self.ser = None       # unplugged; keep counting anyway


def load_counts():
    try:
        with open(STATE_FILE) as f:
            d = json.load(f)
            return int(d.get("in", 0)), int(d.get("out", 0))
    except (OSError, ValueError):
        return 0, 0


def save_counts(cin, cout):
    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w") as f:
        json.dump({"in": cin, "out": cout, "t": time.time()}, f)
    # Atomic replace, so a power cut cannot leave a half-written file
    # that fails to parse on the next boot.
    import os
    os.replace(tmp, STATE_FILE)


def counter_loop():
    global latest_jpeg

    model = YOLO(MODEL)
    uno = Uno(UNO_DEV)

    count_in, count_out = load_counts()
    uno.send(f"N{count_in} {count_out}")

    # For each track id: which side of the line it was last seen on.
    side = {}
    counted = set()
    last_seen = {}

    cap = cv2.VideoCapture(csi_pipeline(), cv2.CAP_GSTREAMER)
    if not cap.isOpened():
        raise SystemExit("Camera did not open")

    fps, last_t = 0.0, time.time()
    frame_no = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.02)
            continue
        frame_no += 1

        # persist=True is what makes this tracking rather than
        # detection - it carries track state between calls.
        results = model.track(
            frame, persist=True, verbose=False, device=0,
            classes=[TARGET_ID], conf=MIN_CONF, tracker="bytetrack.yaml",
        )

        r = results[0]
        if r.boxes is not None and r.boxes.id is not None:
            boxes = r.boxes.xyxy.cpu().numpy()
            ids = r.boxes.id.cpu().numpy().astype(int)

            for box, tid in zip(boxes, ids):
                x1, y1, x2, y2 = box.astype(int)
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                last_seen[tid] = frame_no

                # Ignore anything outside the line's horizontal extent
                if not (LINE_X0 <= cx <= LINE_X1):
                    continue

                now_side = 1 if cy > LINE_Y else -1
                was_side = side.get(tid)
                side[tid] = now_side

                # A crossing needs the SAME track seen on both sides.
                # Counting on "is past the line" instead would count
                # someone standing on it once per frame.
                if was_side is not None and was_side != now_side \\
                        and tid not in counted:
                    counted.add(tid)
                    if now_side == 1:
                        count_in += 1
                        uno.send("I")
                        print(f"  IN  track {tid}  -> {count_in}")
                    else:
                        count_out += 1
                        uno.send("O")
                        print(f"  OUT track {tid}  -> {count_out}")
                    save_counts(count_in, count_out)

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 230, 0), 2)
                cv2.putText(frame, f"#{tid}", (x1, max(y1 - 8, 14)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 230, 0), 2)
                cv2.circle(frame, (cx, cy), 4, (0, 230, 0), -1)

        # Forget tracks that have been gone a while, so the id sets do
        # not grow without bound over days of running.
        if frame_no % 300 == 0:
            stale = [t for t, f in last_seen.items() if frame_no - f > 300]
            for t in stale:
                last_seen.pop(t, None)
                side.pop(t, None)
                counted.discard(t)

        cv2.line(frame, (LINE_X0, LINE_Y), (LINE_X1, LINE_Y), (60, 60, 255), 2)
        now = time.time()
        fps = 0.9 * fps + 0.1 * (1.0 / max(now - last_t, 1e-3))
        last_t = now
        cv2.putText(frame, f"in {count_in}   out {count_out}   {fps:4.1f} fps",
                    (12, H - 18), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                    (255, 255, 255), 2)

        ok, jpg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        if ok:
            with lock:
                latest_jpeg = jpg.tobytes()


app = Flask(__name__)


@app.route("/")
def index():
    return ('<body style="margin:0;background:#111">'
            '<img src="/stream" style="width:100%"></body>')


@app.route("/stream")
def stream():
    def gen():
        while True:
            with lock:
                f = latest_jpeg
            if f:
                yield b"--f\\r\\nContent-Type: image/jpeg\\r\\n\\r\\n" + f + b"\\r\\n"
            time.sleep(0.04)
    return Response(gen(),
                    mimetype="multipart/x-mixed-replace; boundary=f")


if __name__ == "__main__":
    threading.Thread(target=counter_loop, daemon=True).start()
    print("Stream on http://<jetson-ip>:8080/")
    app.run(host="0.0.0.0", port=8080, threaded=True)`,
  after: `<p>Three things in there are the difference between a counter that works and one that produces
  plausible nonsense:</p>
  <ul>
    <li><strong>A crossing requires the same track id on both sides.</strong> The naive version - count when
    the centre is past the line - counts someone standing on the line once per frame, forever.</li>
    <li><strong>The <code>counted</code> set.</strong> Without it, someone who steps back and forth over the
    threshold is counted every time.</li>
    <li><strong>Pruning stale tracks.</strong> Left running for a week, those dictionaries grow until the
    process is killed. It is the sort of bug that only shows up after you have stopped watching.</li>
  </ul>
  <p>The counts are saved atomically to disk and pushed back to the Uno on startup, so a crash or a reboot
  does not lose the day's total.</p>`
}],

upload: `
<p>The Python runs on the Jetson, the sketch goes to the Uno through the ordinary Arduino IDE - and you can
upload to the Uno from the Jetson itself, since it is a Linux machine with USB ports.</p>
<div class="note warn"><span class="t">The TensorRT engine belongs to this board</span>
<p>A <code>.engine</code> file is compiled for one GPU architecture and one TensorRT version. Copy it to
another Jetson and it will refuse to load; upgrade JetPack and it will refuse to load. Keep the
<code>.pt</code> file and re-export when either changes. Budget ten minutes for that after any system
upgrade.</p></div>
<div class="note tip"><span class="t">Check the GPU is actually being used</span>
<p>Run <code>jtop</code> alongside. GPU utilisation should sit high while the counter runs. If it is near
zero and the CPU is pinned, you are running the PyTorch model on the CPU - check
<code>torch.cuda.is_available()</code> and that you passed the <code>.engine</code>.</p></div>`,

tune: [
  { h: 'Pick the model size honestly',
    body: `<p><code>yolo11n</code> (nano) is the fastest and least accurate; <code>s</code>, <code>m</code> and
    <code>l</code> climb from there. On an Orin Nano, <code>n</code> and <code>s</code> both run comfortably
    above 30&nbsp;fps in TensorRT; <code>m</code> is usable; <code>l</code> is not, for live video.</p>
    <p>For counting people in a doorway, <code>n</code> is plenty - they are large in frame and unambiguous.
    Reach for a bigger model only when you can point at detections it is actually missing.</p>` },
  { h: 'INT8 if you need more, with a caveat',
    body: `<p>Exporting with <code>int8=True</code> roughly doubles throughput again over FP16. It needs a
    calibration dataset - a few hundred representative images - and it costs a little accuracy.</p>
    <p>Worth it for multi-camera setups. Not worth the bother for one camera that is already at 60&nbsp;fps,
    where the camera is the limit rather than the model.</p>` },
  { h: 'Where to put the camera',
    body: `<p>Overhead beats eye level by a wide margin. People occlude each other constantly from the side
    and barely at all from above, and occlusion is what breaks tracking.</p>
    <p>If overhead is impossible, mount high and angle down about 45 degrees, and put the counting line where
    the floor is - not across the middle of the image where it cuts people in half.</p>` },
  { h: 'Tracker tuning for a busy scene',
    body: `<p>Copy <code>bytetrack.yaml</code> from the ultralytics package and edit it.
    <code>track_buffer</code> is how many frames a lost track survives before being forgotten - raise it for
    scenes with pillars or doorways people pass behind. <code>match_thresh</code> controls how eagerly new
    detections attach to existing tracks.</p>
    <p>Raising <code>track_buffer</code> too far causes the opposite problem: a track lingers and gets attached
    to a different person who walks through the same spot.</p>` },
  { h: 'Count something other than people',
    body: `<p>Change <code>TARGET_ID</code>. COCO class 2 is car, 3 motorcycle, 5 bus, 7 truck, 16 dog. Pass a
    list to <code>classes=</code> to count several at once and keep separate totals per class.</p>
    <p>Vehicles on a road are a good fit, because they move perpendicular to a natural line and do not
    loiter.</p>` },
  { h: 'Two cameras',
    body: `<p>The carrier has two CSI connectors. Two <code>nvarguscamerasrc</code> pipelines with
    <code>sensor-id=0</code> and <code>1</code>, batched into one inference call, costs far less than twice
    the time - batching is where a GPU is most efficient.</p>
    <p>This is the thing the UNO Q genuinely cannot do at all, rather than doing slowly.</p>` },
  { h: 'Watch the temperature before you box it',
    body: `<p><code>tegrastats</code> or <code>jtop</code>. Sustained GPU load in a sealed box will throttle,
    and throttling looks exactly like "the software got slower" - no warning, no log entry, just a frame rate
    that drifts down over twenty minutes.</p>
    <p>If you enclose it, put a fan on the box, not just on the board.</p>` },
  { h: 'Run a language model on it, since you can',
    body: `<p>The 8&nbsp;GB of unified memory will hold a quantised small language model, or a vision-language
    model that answers questions about what the camera sees. <code>ollama</code> runs on JetPack 6 and is the
    easiest way in.</p>
    <p>It is much slower than the detector - a few tokens a second - but it runs locally, and pairing "what
    can you see right now" with a camera is a genuinely different kind of project.</p>` }
],

trouble: [
  { q: 'torch.cuda.is_available() is False',
    a: `A CPU build of PyTorch from pip is shadowing JetPack's CUDA build. <code>pip3 uninstall torch
    torchvision</code> and install NVIDIA's Jetson wheel for your JetPack version. Everything works either
    way, which is what makes this so easy to miss - it is just thirty times slower.` },
  { q: 'The camera will not open and dmesg shows no imx219',
    a: `Power off, then check the ribbon: contacts towards the board, fully inserted, latch closed evenly at
    both ends. If the kernel cannot see the sensor, no software change will help. Some third-party IMX219
    boards also need a device tree overlay selected - check the seller's notes.` },
  { q: '<code>cv2.VideoCapture</code> returns nothing but gst-launch works',
    a: `OpenCV was built without GStreamer. Check with <code>python3 -c "import cv2;
    print(cv2.getBuildInformation())" | grep -i gstreamer</code>. A pip-installed
    <code>opencv-python</code> usually lacks it - use the one JetPack ships instead.` },
  { q: 'The TensorRT export fails or runs out of memory',
    a: `Close everything else first, including any browser on the desktop. Export is memory-hungry. If it
    still fails, add swap: 4&nbsp;GB on the NVMe is enough and the export only needs it once.` },
  { q: 'Frame rate is far below the benchmark',
    a: `The benchmark timed the model alone. The real pipeline also captures, tracks, draws and JPEG-encodes,
    all on the CPU. Check <code>jtop</code>: if the GPU is idle and CPUs are pinned, the bottleneck is the
    Python around the model, not the model. Dropping the JPEG quality and the stream frame rate usually
    recovers most of it.` },
  { q: 'The count climbs when nobody moves',
    a: `A track is flickering across the line, or the line is somewhere people stand. Watch the stream and
    look at the track ids - if one id keeps appearing and vanishing, raise <code>track_buffer</code>. If
    people stand on the line, move it.` },
  { q: 'The same person is counted several times',
    a: `Their track id is changing mid-crossing, so each new id counts as a new person. That is an occlusion
    or a detection-confidence problem: lower <code>MIN_CONF</code> a little so ByteTrack's second matching
    pass has weak detections to work with, and raise <code>track_buffer</code>.` },
  { q: 'It reboots when the model starts',
    a: `Power. The GPU spinning up is the largest current step the board ever makes. Use the supplied 19&nbsp;V
    brick. If you are on USB-C PD, try the barrel jack instead - this is nearly always a supply that cannot
    deliver what it claims.` },
  { q: 'Performance degrades over twenty minutes',
    a: `Thermal throttling. <code>jtop</code> shows the temperatures and the throttle flag. Improve airflow;
    do not try to fix it in software.` },
  { q: 'No such file /dev/ttyACM0',
    a: `The Uno may enumerate as <code>/dev/ttyUSB0</code> with a CH340 clone. <code>ls /dev/tty*</code> with
    it unplugged and again plugged in. Your user also needs to be in the <code>dialout</code> group:
    <code>sudo usermod -aG dialout $USER</code>, then log out and back in.` }
],

next: `
<ul>
  <li><strong>Do the same thing for a fifth of the price</strong> and see what you give up -
  <a href="project.html?p=uno-q-object-detection">the UNO Q object detector</a>. Building both is the most
  honest way to find out which one you actually needed.</li>
  <li><strong>Add a language model.</strong> 8&nbsp;GB of unified memory will hold a quantised VLM, so the
  camera can answer questions rather than emit boxes. Slow, local, and a genuinely different project.</li>
  <li><strong>Train on your own classes.</strong> YOLO fine-tuning on a few hundred labelled images is very
  achievable, and this board is fast enough to train on as well as run on - which no other board in this book
  is.</li>
  <li><strong>Log it properly.</strong> Counts into a database with timestamps, and a chart. The Jetson can
  run that alongside the detector without noticing.</li>
  <li><strong>Start much smaller if this was a leap.</strong>
  <a href="project.html?p=tinyml-gesture-nano">Gesture recognition</a> teaches the same ideas for $55 and no
  Linux at all.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Hardware</span>
<ul>
  <li><strong>The CSI connector is fragile and the ribbon has one orientation.</strong> Always power off
  first. A broken connector on the carrier board cannot realistically be repaired at home.</li>
  <li><strong>The 40-pin header is 3.3 V and not 5 V tolerant.</strong> Connecting an Uno pin to it will
  damage the SoC. In this build nothing but USB passes between the two boards, and that is deliberate.</li>
  <li><strong>Use the supplied power brick.</strong> Undervoltage causes reboots under GPU load, and reboots
  under load risk the filesystem.</li>
  <li><strong>Always shut down properly.</strong> <code>sudo shutdown -h now</code>.</li>
  <li><strong>The heatsink gets genuinely hot.</strong> It is designed to. Do not enclose it without thinking
  about airflow, and do not put it on carpet.</li>
</ul>
</div>
<div class="note danger"><span class="t">This one counts people, so think about it properly</span>
<ul>
  <li><strong>A camera that detects and tracks people is a surveillance system</strong>, whatever you call it.
  The technology is the same whether it is counting customers or watching a household.</li>
  <li><strong>Tell people it is there.</strong> In much of Europe, and in many other jurisdictions, recording
  in a space others use is regulated - signage and a stated purpose are often legal requirements rather than
  courtesies. Look up what applies where you are before it goes on a wall.</li>
  <li><strong>Count, do not record.</strong> This project deliberately stores integers, not video. A counter
  that writes a number to a file is a fundamentally different object from one that keeps footage, and the
  difference is worth preserving on purpose.</li>
  <li><strong>The stream is unauthenticated.</strong> Anyone on your network can open port 8080. Do not
  forward it through a router, and turn it off once the system is tuned.</li>
  <li><strong>Do not point it at a public space</strong> and do not use it to identify individuals. Detection
  is not recognition, and keeping that line is a choice you make in what you build.</li>
</ul>
</div>`
});
