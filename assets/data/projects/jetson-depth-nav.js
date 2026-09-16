/* Depth from a single camera: what a transformer can guess, and the one thing it cannot. */
AB.addProject({
slug: 'jetson-depth-nav',
title: 'Depth-aware rover from one camera',
cat: 'ai',
level: 4,
time: '10 hours',
solder: true,
board: 'Jetson Orin Nano',
tags: ['jetson', 'depth anything', 'monocular depth', 'transformer', 'navigation', 'scale', 'sensor fusion', 'rover'],
blurb: 'A neural network that estimates depth from one ordinary camera, driving a rover round obstacles. It works startlingly well and it cannot tell you how far anything is in metres - which is the whole lesson.',

skills: ['Monocular depth estimation', 'Relative vs metric depth', 'Scale recovery', 'Transformer inference', 'Sensor fusion', 'Reactive navigation'],

intro: `
<p>Point one ordinary camera at a room and a modern depth model will hand you back a picture where every
pixel is labelled near or far - through a doorway, round a chair leg, under a table. No stereo pair, no
projector, no time-of-flight. It is genuinely uncanny the first time you see it.</p>
<p>Then you try to use it for navigation and hit the thing nobody mentions in the demos: <strong>monocular
depth is relative, not metric</strong>. The model will tell you the chair is nearer than the wall. It will not
tell you the chair is 1.4&nbsp;metres away, because from a single image it cannot - a doll's house and a real
house produce identical pictures.</p>
<p>This project builds the rover, and spends most of its effort on recovering scale: one ultrasonic sensor,
costing $1.50, turns a beautiful relative depth map into a usable metric one. That combination - a large
model for structure, a cheap sensor for scale - is a genuinely important pattern and it is the reason to build
this.</p>`,

what: [
  'Estimate a dense depth map from a single camera at 15-25 fps.',
  'Recover metric scale from one ultrasonic reading, so "near" becomes "1.2 metres".',
  'Build an occupancy strip from the depth map and steer round obstacles.',
  'See what depth catches that sonar misses - a table edge, a step, a chair leg.',
  'Fail safe when the model and the sonar disagree, rather than trusting either.',
  'Understand exactly where monocular depth breaks, because it does.'
],

how: `
<p><strong>What the model is doing.</strong> Depth Anything V2 is a vision transformer trained on an enormous
set of images with known depth. It has learned the cues humans use - perspective, texture gradient, occlusion,
familiar object sizes, the way the floor recedes - and applies them to one frame.</p>
<p>The output is an <em>inverse relative depth</em> map: a number per pixel where larger means nearer, on an
arbitrary scale that changes from frame to frame. It is not metres and it is not even consistent between
consecutive frames.</p>

<p><strong>Why it cannot be metric, and this is not a limitation of the model.</strong> A photograph of a
doll's house and a photograph of a real house can be pixel-identical. There is no information in a single
image that distinguishes them. Any model that claimed metres would be guessing from typical object sizes, and
would be badly wrong in a room full of unusual ones.</p>
<p>So: the model gives you <strong>structure</strong>, and you must get <strong>scale</strong> from somewhere
else.</p>

<p><strong>Scale recovery with one cheap sensor.</strong> An HC-SR04 pointed straight ahead measures one real
distance in metres. Sample the depth map in the small patch the sonar is looking at, and you have both numbers
for the same piece of the world.</p>
<p>The relationship between inverse relative depth and true distance is close to
<code>metres &asymp; k / relative</code>. One paired reading solves for <code>k</code>, and then the whole
depth map is in metres.</p>
<p>Re-solve continuously and smooth it, because the model's arbitrary scale drifts between frames. That
continuous re-anchoring is what makes the whole thing work.</p>

<p><strong>Where depth beats sonar, and where it does not.</strong></p>
<ul>
  <li><strong>Depth sees a whole scene</strong> - a chair leg, a table edge at head height, a doorway - where
  sonar sees one cone straight ahead and misses anything narrow.</li>
  <li><strong>Depth sees a drop</strong>. The floor suddenly reading very far is a step down or a staircase,
  which a forward-facing sonar cannot detect at all and which is the failure that destroys robots.</li>
  <li><strong>Sonar is metric and honest.</strong> It measures time of flight. It does not hallucinate.</li>
  <li><strong>Depth fails on glass, mirrors and blank walls.</strong> A mirror is estimated as the room behind
  it. A featureless white wall has no cues and the estimate becomes noise.</li>
  <li><strong>Sonar fails on soft, angled and narrow things</strong> - a curtain absorbs the pulse, a wall at
  40 degrees reflects it away.</li>
</ul>
<p>They fail differently, which is exactly why the rover carries both and stops when they disagree badly.</p>

<p><strong>The occupancy strip.</strong> You do not need a map to avoid obstacles. Take the lower-middle band
of the depth image - where the floor and anything standing on it appear - divide it into nine vertical
columns, and take the nearest distance in each.</p>
<p>That gives nine numbers: how far you can go in nine directions. Steer toward the widest gap, slow down as
the nearest column closes, stop below a threshold. It is reactive rather than planned, and it is enough for a
rover in a room.</p>`,

bom: [
  { id: 'jetson-orin', qty: 1, note: 'The Super kit. A depth transformer is heavier than YOLO - this project uses most of the board.' },
  { id: 'nvme', qty: 1, note: 'Worth it. The model is several hundred megabytes and the TensorRT build cache is larger.' },
  { id: 'usb-cam', qty: 1, note: 'Or the CSI camera. Wide-angle is better - you want to see the floor close in front of the rover.' },
  { id: 'hcsr04', qty: 1, note: 'THE SCALE REFERENCE. A dollar fifty that turns relative depth into metres. Read the notes - this is the point of the project.' },
  { id: 'uno', qty: 1, note: 'Sonar timing and motor PWM. Both need microseconds and Linux has none.' },
  { id: 'usb-cable', qty: 1 },
  { id: 'car-chassis', qty: 1, note: 'Four-wheel, big enough to carry a Jetson and a battery. This is not a tabletop robot.' },
  { id: 'tt-motor', qty: 4, note: 'Geared and slow. The camera is looking about a metre ahead and the model takes 40-60 ms.' },
  { id: 'l298n', qty: 1, note: 'Or a TB6612 for better efficiency. The Uno drives it, never Linux.' },
  { id: '18650', qty: 4, note: 'Two series pairs in parallel for 7.4 V. The Jetson is the load, not the motors.' },
  { id: 'buck', qty: 1, note: 'To 5 V for the Uno and the sonar. The Jetson wants its own supply - see the notes.' },
  { id: 'tp4056', qty: 2, note: 'Protected.' },
  { id: 'ina219', qty: 1, note: 'Battery monitoring. A rover that dies across the room is a rover you crawl under furniture for.' },
  { id: 'switch', qty: 1, note: 'A real power switch, reachable.' },
  { id: 'perfboard', qty: 1 },
  { id: 'screwterm', qty: 3 },
  { id: 'headers-f', qty: 1 },
  { id: 'standoffs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'jet',  comp: 'jetson',  at: [0, 58] },
    { id: 'cam',  comp: 'webcam',  at: [-52, -44] },
    { id: 'uno',  comp: 'uno',     at: [42, -46] },
    { id: 'son',  comp: 'hcsr04',  at: [-46, -100] },
    { id: 'drv',  comp: 'l298n',   at: [42, -102] },
    { id: 'm1',   comp: 'ttmotor', at: [6, -150] },
    { id: 'ina',  comp: 'ina219',  at: [-8, -102] }
  ],
  wires: [
    { from: 'cam.USB',  to: 'jet.USB',   color: 'white',  note: 'Camera into the Jetson' },
    { from: 'jet.CSI0', to: 'uno.USB',   color: 'white',  note: 'USB to the Uno. The only link - the 40-pin header is 3.3 V and not 5 V tolerant' },
    { from: 'son.VCC',  to: 'uno.5V',    color: 'red',    note: 'Sonar power. The scale reference for the whole depth map' },
    { from: 'son.GND',  to: 'uno.GND1',  color: 'black',  note: 'Sonar ground' },
    { from: 'son.TRIG', to: 'uno.D11',   color: 'orange', note: 'Sonar trigger. Timed on the Uno - pulseIn needs microseconds' },
    { from: 'son.ECHO', to: 'uno.D12',   color: 'yellow', note: 'Sonar echo, through a divider from 5 V if needed' },
    { from: 'uno.D5',   to: 'drv.ENA',   color: 'purple', note: 'Left speed PWM' },
    { from: 'uno.D6',   to: 'drv.ENB',   color: 'purple', note: 'Right speed PWM' },
    { from: 'uno.D7',   to: 'drv.IN1',   color: 'green',  note: 'Left direction A' },
    { from: 'uno.D8',   to: 'drv.IN2',   color: 'green',  note: 'Left direction B' },
    { from: 'uno.D9',   to: 'drv.IN3',   color: 'green',  note: 'Right direction A' },
    { from: 'uno.D10',  to: 'drv.IN4',   color: 'green',  note: 'Right direction B' },
    { from: 'drv.GND',  to: 'uno.GND2',  color: 'black',  note: 'Driver ground, common with the Uno' },
    { from: 'drv.OUT1', to: 'm1.+',      color: 'brown',  note: 'Left motors' },
    { from: 'drv.OUT2', to: 'm1.-',      color: 'brown',  note: 'Left motors' },
    { from: 'ina.VCC',  to: 'uno.3V3',   color: 'red',    note: 'Battery monitor power' },
    { from: 'ina.GND',  to: 'uno.GND3',  color: 'black',  note: 'Battery monitor ground' },
    { from: 'ina.SDA',  to: 'uno.A4',    color: 'blue',   note: 'I2C data' },
    { from: 'ina.SCL',  to: 'uno.A5',    color: 'yellow', note: 'I2C clock' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">The sonar is not a backup sensor - it is the scale reference</span>
<p>This is the point of the whole project and it is easy to mount it as an afterthought.</p>
<p>It must be <strong>pointed at the same place the camera's centre is looking</strong>, as close to the lens
as the chassis allows, and rigidly. The software samples the depth map in the patch the sonar is measuring and
uses the pair to solve for scale - so if the two are looking at different things, every distance the rover
computes is wrong.</p>
<p>Mount both on the same bracket. Measure the offset between them and keep it small.</p></div>

<div class="note danger"><span class="t">The Jetson needs its own supply, separate from the motors</span>
<p>A motor stall pulls the battery down hard. A Jetson that browns out mid-frame corrupts its filesystem -
this is not a reset like an Arduino.</p>
<p>Either two packs, or one pack with a converter sized generously and the motors taken from the raw battery
before it. All grounds starred at the battery negative.</p>
<p>The Jetson pulls 10-25&nbsp;W on its own, which is most of the rover's energy budget - the motors are the
smaller load here, which surprises people.</p></div>

<div class="note danger"><span class="t">40-pin header is 3.3 V. USB only between the boards.</span>
<p>Same rule as every Jetson project here. Sonar timing and motor PWM are on the Uno because
<code>pulseIn()</code> needs microsecond accuracy and Linux cannot provide it - a sonar reading taken on a
descheduled process reports a wall where there is none.</p></div>

<div class="note warn"><span class="t">Camera height and angle decide what the rover can see</span>
<p>Mount it 150-250&nbsp;mm up, angled down about 15-20 degrees. You need the floor visible from roughly
300&nbsp;mm in front of the rover out to two or three metres.</p>
<p>Too high and level, and the rover cannot see the chair leg it is about to hit. Too low, and the floor fills
the frame and there is no useful structure.</p>
<p>Fix it rigidly. A camera that tilts as the rover accelerates produces depth that swings with it.</p></div>`,

solderSteps: [
  { h: 'Camera and sonar on one bracket',
    body: `<p>The most important mechanical detail in the build. Both on a single rigid plate, sonar just
    below the lens, both looking the same way.</p>
    <p>Measure the vertical offset and write it on the chassis. If they end up more than about 60&nbsp;mm
    apart, the patch the software samples needs shifting to compensate.</p>` },
  { h: 'Motor wiring and suppression',
    body: `<p>Screw terminals, twisted pairs along each run, and a 100&nbsp;nF capacitor across each motor's
    terminals at the motor. Brushed motors are broadband noise sources and the sonar is listening for a very
    small echo.</p>` },
  { h: 'Star the ground at the battery',
    body: `<p>Motor return current is amps and spiky. Bring it back to the battery negative on its own heavy
    conductor and take the logic ground separately to the same point.</p>
    <p>A sonar sharing a ground path with motor current gives readings that change when the rover
    accelerates.</p>` },
  { h: 'Jetson on standoffs with airflow',
    body: `<p>Off the chassis plate, fan clear, and nothing where the heatsink exhausts. A depth transformer
    run continuously is a sustained load and a rover has no more airflow than a shelf does.</p>` }
],

assembly: [
  { h: 'Run the depth model on a still image first',
    body: `<p>Before any rover. Install Depth Anything V2 Small, run it on a photograph of a room, and save the
    depth map as an image.</p>
    <p>Look at it. This is the moment the project is interesting - a doorway, a chair, the recession of the
    floor, all from one photograph. Then look at a photograph containing a mirror or a window and see it get
    it completely wrong.</p>` },
  { h: 'Export to TensorRT and measure',
    body: `<p>Through ONNX. Expect roughly 15-25&nbsp;fps at 518x518 after export, against 5-8 before.</p>
    <p>A transformer is heavier than YOLO and this is the slowest model in any Jetson project here. Budget for
    40-60&nbsp;ms per frame in the control loop.</p>` },
  { h: 'Prove the scale recovery on the bench, with a tape measure',
    body: `<p>The most important step. Camera and sonar on the bench, a box in front of them.</p>
    <p>Put the box at 0.5&nbsp;m, 1&nbsp;m, 1.5&nbsp;m and 2&nbsp;m in turn. At each distance, record the
    sonar reading and the raw relative depth value in the sample patch.</p>
    <p>Plot metres against 1/relative. It should be close to a straight line through the origin, and its
    gradient is your <code>k</code>. If it is not linear, the sample patch and the sonar are not looking at the
    same thing.</p>` },
  { h: 'Check the metric depth against the tape',
    body: `<p>Now run the full pipeline and have it print estimated metres for a few objects. Measure them
    with a tape.</p>
    <p>Expect within 10-15% for things at similar distance to the scale anchor, and worse further away. That
    is the honest accuracy and it is enough to avoid furniture.</p>` },
  { h: 'Watch the occupancy strip before connecting the motors',
    body: `<p>Rover on a box, wheels off the ground, driving nothing. Display the nine column distances and
    carry it round the room by hand.</p>
    <p>Point it at a doorway and watch the middle columns open up. Point it at a chair leg and watch one column
    close. That visualisation is how you tune the thresholds without chasing the rover.</p>` },
  { h: 'Find where it fails, deliberately',
    body: `<p>Worth an hour, because these are the cases that will crash it:</p>
    <ul>
      <li><strong>A mirror</strong> - estimated as the room behind it. The rover will drive into it.</li>
      <li><strong>A glass door</strong> - same, and sonar often misses it too.</li>
      <li><strong>A blank white wall</strong> - no cues, noisy estimate.</li>
      <li><strong>A dark room</strong> - the camera is the input and it needs light.</li>
      <li><strong>A step down</strong> - the floor reads very far. Check the sketch treats that as an
      obstacle, because it is the one that breaks robots.</li>
    </ul>` },
  { h: 'Connect the motors and drive slowly',
    body: `<p>Slow. At 0.4&nbsp;m/s with a 60&nbsp;ms model and a control loop, the rover moves a few
    centimetres between decisions - fine. At 2&nbsp;m/s it does not.</p>
    <p>Somewhere open, nothing fragile, and a hand near the switch.</p>` },
  { h: 'Tune the disagreement threshold',
    body: `<p>When the sonar says 0.4&nbsp;m and the depth map says 2&nbsp;m in the same direction, something
    is wrong - glass, a mirror, or a broken scale anchor.</p>
    <p>The rover stops rather than choosing. Set the threshold from what you saw on the bench, and expect it to
    fire near glass, which is correct.</p>` }
],

libraries: [
  { name: 'Depth Anything V2', by: 'TikTok / HKU', how: 'git clone + pip install -r requirements.txt', why: 'The monocular depth model. The Small variant is the one that runs usefully fast here.' },
  { name: 'ONNX Runtime / TensorRT', by: 'Microsoft / NVIDIA', how: 'Part of JetPack', why: 'Exporting the transformer to an engine. This is a 3-4x speedup and not optional for real time.' },
  { name: 'OpenCV', by: 'OpenCV', how: 'Part of JetPack', why: 'Capture, resizing and the depth visualisation.' },
  { name: 'pyserial', by: 'pySerial', why: 'Sonar readings in, motor commands out.' },
  { name: 'NewPing', by: 'Tim Eckel', why: 'On the Uno. More reliable than raw pulseIn, with a proper timeout.' }
],

code: [
{
  h: 'The scale-anchored navigator',
  intro: `<p>The depth model is four lines. Everything else is turning a relative map into metres and then
  into a steering decision.</p>`,
  name: 'depth_nav.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Depth-aware reactive navigation from one camera.

The model gives STRUCTURE (relative depth). The sonar gives SCALE
(one real distance in metres). Together they give a metric depth map,
which neither can produce alone.
"""

import time
import numpy as np
import cv2
import serial
import onnxruntime as ort

ENGINE = "depth_anything_v2_vits.onnx"
UNO_DEV = "/dev/ttyACM0"
INPUT_SIZE = 518

# --- the occupancy strip ----------------------------------------------
COLUMNS = 9
# The band of the image where the floor and anything standing on it
# appear. Fractions of image height - tune for your camera angle.
BAND_TOP, BAND_BOTTOM = 0.55, 0.92

STOP_M = 0.45
SLOW_M = 1.00
CRUISE_PWM = 120
MAX_PWM = 170

"""If the sonar and the scaled depth map disagree by more than this in
the direction the sonar is looking, something is wrong - glass, a
mirror, or a broken scale anchor. Stop rather than choose."""
DISAGREE_M = 0.6

"""The patch of the depth map the sonar is measuring. Centre column,
slightly below the horizon. Must correspond to where the sonar
actually points - see the wiring notes."""
ANCHOR_BOX = (0.45, 0.55, 0.50, 0.62)      # x0, x1, y0, y1 as fractions


class Uno:
    def __init__(self, dev):
        self.ser = serial.Serial(dev, 115200, timeout=0.05)
        time.sleep(2.0)
        self.ser.reset_input_buffer()
        self.sonar_m = None
        self.volts = 0.0

    def poll(self):
        while self.ser.in_waiting:
            line = self.ser.readline().decode(errors="ignore").strip()
            if line.startswith("S"):
                try:
                    cm, mv = line[1:].split()
                    cm = int(cm)
                    # 0 means the sonar timed out - nothing in range,
                    # or a soft or angled surface that absorbed the
                    # pulse. NOT "zero distance".
                    self.sonar_m = None if cm <= 0 else cm / 100.0
                    self.volts = int(mv) / 1000.0
                except ValueError:
                    pass

    def drive(self, left, right):
        self.ser.write(f"D{int(left)} {int(right)}\\n".encode())

    def stop(self):
        self.ser.write(b"S\\n")


class Depth:
    def __init__(self, path):
        self.sess = ort.InferenceSession(
            path, providers=["TensorrtExecutionProvider",
                             "CUDAExecutionProvider"])
        self.name = self.sess.get_inputs()[0].name

        """The model's arbitrary scale drifts frame to frame, so k is
        smoothed heavily rather than taken from a single pair."""
        self.k = None

    def infer(self, frame):
        img = cv2.resize(frame, (INPUT_SIZE, INPUT_SIZE))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        img = (img - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
        img = img.transpose(2, 0, 1)[None].astype(np.float32)

        # Inverse relative depth: LARGER means NEARER, on a scale that
        # means nothing on its own and changes between frames.
        return self.sess.run(None, {self.name: img})[0][0]

    def anchor(self, rel, sonar_m):
        """Solve for scale using one real measurement.

        metres ~= k / relative. One paired reading gives k, and then
        the whole map is in metres. Re-solved continuously because the
        model's scale drifts."""
        if sonar_m is None or not (0.25 < sonar_m < 3.0):
            return                       # out of the sonar's useful range

        h, w = rel.shape
        x0, x1, y0, y1 = ANCHOR_BOX
        patch = rel[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]
        if patch.size == 0:
            return

        # Median, not mean - one bright pixel should not move the scale.
        r = float(np.median(patch))
        if r < 1e-3:
            return

        k_now = sonar_m * r
        self.k = k_now if self.k is None else 0.9 * self.k + 0.1 * k_now

    def to_metres(self, rel):
        if self.k is None:
            return None
        # Clamp: very small relative values are "far away" and dividing
        # by them produces enormous nonsense numbers.
        return self.k / np.maximum(rel, 1e-3)


def occupancy(metres):
    """Nine numbers: how far you can go in nine directions.

    No map, no SLAM. Reactive, and enough for a rover in a room."""
    h, w = metres.shape
    band = metres[int(BAND_TOP * h):int(BAND_BOTTOM * h), :]
    cols = np.array_split(band, COLUMNS, axis=1)

    out = []
    for c in cols:
        # 5th percentile rather than the minimum: a single noisy pixel
        # should not stop the rover, but a real obstacle occupies many.
        out.append(float(np.percentile(c, 5)))
    return out


def steer(strip):
    """Toward the widest gap, slowing as the nearest column closes."""
    nearest = min(strip)

    if nearest < STOP_M:
        return 0, 0, "blocked"

    # Weight the centre: going straight is preferable to swerving for
    # a slightly better gap off to one side.
    weights = [0.55, 0.7, 0.85, 0.95, 1.0, 0.95, 0.85, 0.7, 0.55]
    scored = [d * wgt for d, wgt in zip(strip, weights)]
    best = int(np.argmax(scored))

    speed = CRUISE_PWM
    if nearest < SLOW_M:
        speed = int(CRUISE_PWM * (nearest - STOP_M) / (SLOW_M - STOP_M))
        speed = max(60, speed)

    turn = (best - (COLUMNS - 1) / 2) / ((COLUMNS - 1) / 2)   # -1 .. +1
    left = speed + turn * speed * 0.8
    right = speed - turn * speed * 0.8

    return (int(np.clip(left, -MAX_PWM, MAX_PWM)),
            int(np.clip(right, -MAX_PWM, MAX_PWM)),
            f"gap col {best}")


def main():
    depth = Depth(ENGINE)
    uno = Uno(UNO_DEV)

    cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    print("waiting for a scale anchor from the sonar...")
    fps, last_t = 0.0, time.time()

    while True:
        uno.poll()
        ok, frame = cap.read()
        if not ok:
            continue

        rel = depth.infer(frame)
        depth.anchor(rel, uno.sonar_m)
        metres = depth.to_metres(rel)

        if metres is None:
            # No scale yet. Do not move - a relative map cannot tell
            # you whether the wall is at 30 cm or 3 m.
            uno.stop()
            cv2.imshow("depth", colourise(rel, None))
            if cv2.waitKey(1) == 27:
                break
            continue

        strip = occupancy(metres)

        # Cross-check against the sonar in the direction it is looking.
        centre = strip[COLUMNS // 2]
        if uno.sonar_m is not None and abs(centre - uno.sonar_m) > DISAGREE_M:
            uno.stop()
            note = f"DISAGREE depth {centre:.2f} sonar {uno.sonar_m:.2f}"
            left = right = 0
        else:
            left, right, note = steer(strip)
            uno.drive(left, right)

        if uno.volts and uno.volts < 6.6:
            uno.stop()
            note = "battery low - stopped"

        now = time.time()
        fps = 0.9 * fps + 0.1 / max(now - last_t, 1e-3)
        last_t = now

        vis = colourise(rel, strip)
        cv2.putText(vis, f"{note}  k={depth.k:.2f}  {fps:4.1f}fps",
                    (10, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                    (255, 255, 255), 2)
        cv2.imshow("depth", vis)
        if cv2.waitKey(1) == 27:
            break

    uno.stop()
    cap.release()
    cv2.destroyAllWindows()


def colourise(rel, strip):
    d = (rel - rel.min()) / max(rel.max() - rel.min(), 1e-6)
    vis = cv2.applyColorMap((d * 255).astype(np.uint8), cv2.COLORMAP_INFERNO)
    vis = cv2.resize(vis, (640, 480))

    h, w = vis.shape[:2]
    cv2.rectangle(vis, (int(0.45 * w), int(0.50 * h)),
                  (int(0.55 * w), int(0.62 * h)), (255, 255, 255), 2)

    if strip:
        for i, d_m in enumerate(strip):
            x = int(i * w / COLUMNS)
            bw = int(w / COLUMNS) - 2
            bar = int(min(d_m, 3.0) / 3.0 * 60)
            cv2.rectangle(vis, (x, h - 10 - bar), (x + bw, h - 10),
                          (0, 255, 0) if d_m > SLOW_M else
                          (0, 200, 255) if d_m > STOP_M else (0, 0, 255), -1)
    return vis


if __name__ == "__main__":
    main()`,
  after: `<p><strong>The rover refuses to move until it has a scale anchor.</strong> That is the correct
  behaviour and worth stating: a relative depth map genuinely cannot distinguish a wall at 30&nbsp;cm from one
  at 3&nbsp;m, so driving on one is driving blind with a beautiful picture.</p>
  <p><strong>The disagreement check is the safety system.</strong> Glass and mirrors are where monocular depth
  fails most confidently - a mirror is estimated as the room behind it, at full confidence. The sonar sees
  glass sometimes and a mirror always. When they differ by more than about half a metre, the honest answer is
  to stop rather than to pick one.</p>
  <p><strong>Fifth percentile rather than minimum</strong> in the occupancy strip: a single noisy pixel should
  not stop the rover, and a real obstacle occupies many pixels. Using the minimum makes the rover twitchy in
  exactly the way people then blame on the model.</p>`
},
{
  h: 'The Uno side',
  intro: `<p>Sonar timing and motor PWM, plus a deadman. Short, and it owns everything that needs
  microseconds.</p>`,
  name: 'depth_rover_mcu.ino',
  code: `/* ------------------------------------------------------------------
   Rover MCU: sonar, motors, deadman.

   To Linux  :  S<cm> <mv>    sonar distance and battery, 10 Hz
   From Linux:  D<l> <r>      drive
                S             stop

   The sonar lives here because pulseIn() needs microsecond accuracy
   and Linux can deschedule a process for tens of milliseconds - a
   reading taken during one of those reports a wall that is not there.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_INA219.h>

#define TRIG  11
#define ECHO  12
#define ENA    5
#define ENB    6
#define IN1    7
#define IN2    8
#define IN3    9
#define IN4   10

#define DEADMAN_MS  400
#define MAX_PWM     200

Adafruit_INA219 ina;
unsigned long lastCommand = 0;
bool stopped = true;
char line[32];
byte pos = 0;

void setup() {
  Serial.begin(115200);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT);  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);  pinMode(IN4, OUTPUT);
  allStop();

  Wire.begin();
  ina.begin();
  ina.setCalibration_32V_2A();

  lastCommand = millis();
  Serial.println(F("rover ready"));
}

void loop() {
  readSerial();

  // Deadman, checked every pass and depending on nothing else. If the
  // Jetson crashes, the Python hangs, or the USB is unplugged, the
  // motors stop - and all three look the same from here.
  if (!stopped && millis() - lastCommand > DEADMAN_MS) {
    allStop();
    Serial.println(F("! deadman"));
  }

  static unsigned long lastPing = 0;
  if (millis() - lastPing > 100) {
    lastPing = millis();
    sendSonar();
  }
}

void sendSonar() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  // 25 ms is about 4 m. A timeout means nothing in range, or a soft
  // or angled surface that absorbed the pulse - it does NOT mean
  // zero distance, and reporting 0 for it would drive the rover into
  // whatever the sonar could not see.
  unsigned long us = pulseIn(ECHO, HIGH, 25000);
  int cm = (us == 0) ? 0 : (int)(us / 58);

  int mv = (int)(ina.getBusVoltage_V() * 1000);

  Serial.print('S'); Serial.print(cm);
  Serial.print(' ');  Serial.println(mv);
}

void readSerial() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\\n' || c == '\\r') {
      if (pos) { line[pos] = '\\0'; handle(line); pos = 0; }
      continue;
    }
    if (pos < sizeof(line) - 1) line[pos++] = c;
  }
}

void handle(char *cmd) {
  lastCommand = millis();

  if (cmd[0] == 'D') {
    int l, r;
    if (sscanf(cmd + 1, "%d %d", &l, &r) == 2) {
      drive(constrain(l, -MAX_PWM, MAX_PWM),
            constrain(r, -MAX_PWM, MAX_PWM));
    }
  } else if (cmd[0] == 'S') {
    allStop();
  }
}

void drive(int l, int r) {
  stopped = (l == 0 && r == 0);
  digitalWrite(IN1, l > 0); digitalWrite(IN2, l < 0);
  analogWrite(ENA, abs(l));
  digitalWrite(IN3, r > 0); digitalWrite(IN4, r < 0);
  analogWrite(ENB, abs(r));
}

void allStop() {
  stopped = true;
  analogWrite(ENA, 0); analogWrite(ENB, 0);
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}`,
  after: `<p><strong>A sonar timeout is not zero distance</strong> and conflating the two is how a rover drives
  into a curtain. The Uno reports 0 for "no echo" and the Python treats it as <code>None</code> - unknown -
  rather than as an obstacle at the bumper or as clear road ahead.</p>
  <p>The deadman is the same pattern as the
  <a href="project.html?p=5g-teleoperated-rover">teleoperated rover</a>, for the same reason: it must live
  where it cannot be starved by the thing most likely to fail.</p>`
}],

upload: `
<p>Python on the Jetson, sketch on the Uno.</p>
<div class="note danger"><span class="t">Wheels off the ground until the scale anchor is proven</span>
<p>A rover driving on an unanchored depth map is driving blind. Do the tape-measure calibration on the bench
first, and keep the chassis on a box until the printed metres match reality.</p></div>
<div class="note warn"><span class="t">Export to TensorRT before judging it</span>
<p>5-8&nbsp;fps in plain ONNX Runtime, 15-25 after a TensorRT export. A transformer is heavier than YOLO and
the difference is the whole feasibility of the project.</p></div>`,

tune: [
  { h: 'Getting the scale anchor right is the project',
    body: `<p>If distances are consistently wrong by a constant factor, the sample patch and the sonar are not
    looking at the same thing. Move the patch, or move the sonar.</p>
    <p>If they are right at one distance and wrong at another, the relationship is not being modelled
    correctly - re-do the tape-measure plot and check it is a straight line through the origin.</p>
    <p>If they wander, increase the smoothing on <code>k</code>. The model's scale genuinely drifts and a
    single-frame anchor is too noisy.</p>` },
  { h: 'A second sonar makes it much more robust',
    body: `<p>One anchor is a single point of failure - if it is pointed at a curtain, the whole map is
    mis-scaled. Two sonars at different angles give you two anchors and let you reject a bad one.</p>
    <p>It also covers more of the width for the disagreement check, which is where mirrors get caught.</p>` },
  { h: 'Detecting a drop, which is the failure that matters',
    body: `<p>A step down appears as the floor suddenly reading very far in the lower part of the frame. A
    forward-facing sonar sees nothing at all.</p>
    <p>Check the bottom band explicitly: if its distance jumps well beyond the expected floor distance for that
    part of the image, treat it as blocked. This is the case that destroys robots and depth handles it well.</p>` },
  { h: 'A real depth camera, if you want metres for free',
    body: `<p>An Intel RealSense D435 gives metric depth directly, at 30&nbsp;fps, with no model and no scale
    problem. It costs about $200 and fails on the same glass and mirrors.</p>
    <p>Worth knowing the option exists. Building this first means you understand what it is doing and why the
    monocular version needs a sonar.</p>` },
  { h: 'Speed against loop rate',
    body: `<p>At 20&nbsp;fps the rover makes a decision every 50&nbsp;ms. At 0.4&nbsp;m/s that is 2&nbsp;cm of
    travel per decision, which is comfortable. At 2&nbsp;m/s it is 10&nbsp;cm and the stopping distance
    dominates.</p>
    <p>Scale the speed cap with the measured frame rate, so a thermally throttled Jetson slows the rover rather
    than driving it blind.</p>` },
  { h: 'From reactive to mapped',
    body: `<p>This rover has no memory - it reacts to what it sees. That is enough for a room and fails in a
    maze, because it will oscillate in a dead end.</p>
    <p>Visual SLAM is the next step and a large one. Isaac ROS on this board does it; it is a project of its
    own rather than an evening's addition.</p>` }
],

trouble: [
  { q: 'The rover will not move at all',
    a: `It has no scale anchor. Check the sonar is reporting a plausible distance between 0.25 and 3&nbsp;m,
    and that the anchor patch is where the sonar points. The overlay draws the patch as a white box - put the
    box on an object and check the sonar agrees.` },
  { q: 'Distances are wrong by a constant factor',
    a: `The sample patch and the sonar are looking at different things. Move one of them. Do the tape-measure
    calibration again and check the plot is linear.` },
  { q: 'It drives into a mirror',
    a: `Expected, and the reason for the disagreement check. A mirror is estimated as the room behind it at
    full confidence. Lower <code>DISAGREE_M</code>, and add a second sonar so more of the width is
    cross-checked.` },
  { q: 'It stops constantly in an open room',
    a: `The occupancy strip is picking up noise. Check you are using the 5th percentile rather than the
    minimum, and that the band is not including the ceiling or the rover's own chassis.` },
  { q: 'Five frames a second',
    a: `Still on plain ONNX Runtime. Export to TensorRT. Then check <code>jtop</code> - if the GPU is idle the
    execution provider fell back to CPU, which it does silently.` },
  { q: 'Depth is noisy on a plain white wall',
    a: `No cues for the model to work from. Inherent to monocular depth. The sonar handles a flat wall well,
    which is another argument for the cross-check.` },
  { q: 'Sonar readings jump when the motors run',
    a: `Electrical noise, or a shared ground path carrying motor current. Capacitors across the motors, twisted
    pairs, and star the ground at the battery.` },
  { q: 'The Jetson reboots on rough ground',
    a: `Brownout from the motor current. Separate supplies, and check the converter is rated well above the
    Jetson's 25&nbsp;W peak. This risks the filesystem, so fix it rather than living with it.` },
  { q: 'It drove off a step',
    a: `Drop detection is not enabled or the bottom band is not being checked. This is the failure worth
    engineering for - a forward sonar cannot see it and depth can.` }
],

next: `
<ul>
  <li><strong>The board basics</strong> - <a href="project.html?p=jetson-orin-vision">real-time vision</a>
  covers JetPack, TensorRT and the dual-brain split in detail.</li>
  <li><strong>Recognise as well as avoid</strong> - running detection alongside depth lets the rover know
  <em>what</em> it is avoiding, and follow one of them.</li>
  <li><strong>Drive it yourself instead</strong> - the
  <a href="project.html?p=5g-teleoperated-rover">5G teleoperated rover</a> puts a person in the loop, and its
  latency budget is the counterpart to this project's scale problem.</li>
  <li><strong>The cheap version</strong> - the
  <a href="project.html?p=obstacle-avoiding-robot">obstacle avoider</a> does this with sonar alone for $25,
  and comparing the two is the clearest way to see what depth adds.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">A robot that decides where to go, from a model that can be confidently wrong</span>
<ul>
  <li><strong>Monocular depth fails on glass and mirrors, at full confidence.</strong> That is not a bug you
  can tune out. The sonar cross-check exists for it and it is why the rover stops on disagreement rather than
  picking a sensor.</li>
  <li><strong>Test the drop case before letting it near stairs.</strong> A step down is invisible to a forward
  sonar and is the failure that ends robots. Verify the depth-based detection works, with the wheels off the
  ground, at the top of your actual stairs.</li>
  <li><strong>Keep it slow</strong> and keep a hand near the switch for the first sessions.</li>
  <li><strong>Deadman on the microcontroller</strong>, tested three ways - kill the Python, unplug the USB,
  crash the Jetson.</li>
  <li><strong>Nothing fragile, no pets, no bare feet</strong> in the test area. A chassis carrying a Jetson and
  four cells has real mass.</li>
</ul>
</div>
<div class="note danger"><span class="t">Power and lithium</span>
<ul>
  <li><strong>The Jetson needs its own supply.</strong> A brownout mid-write corrupts the filesystem - this is
  not an Arduino that simply resets.</li>
  <li><strong>Protected cells, balanced charging, no charging below 0 &deg;C.</strong></li>
  <li><strong>Fuse the pack.</strong> A rover that has just hit something, with a shorted lithium pack aboard,
  is the worst outcome available here.</li>
  <li><strong>Shut the Jetson down properly</strong> rather than flipping the switch.</li>
</ul>
</div>`
});
