/* Seventeen keypoints per person, thirty times a second: geometry, not just detection. */
AB.addProject({
slug: 'jetson-pose-coach',
title: 'Pose estimation exercise coach',
cat: 'ai',
level: 3,
time: '6 hours',
solder: true,
board: 'Jetson Orin Nano',
tags: ['jetson', 'pose estimation', 'keypoints', 'yolo', 'rep counting', 'state machine', 'joint angles'],
blurb: 'Counts your reps and tells you when your form has gone. Seventeen body keypoints at thirty frames a second - and the interesting part is the geometry you do with them, not the model that finds them.',

skills: ['Keypoint models', 'Joint angle geometry', 'Hysteresis state machines', 'Temporal smoothing', 'Confidence gating', 'Real-time feedback'],

intro: `
<p>Object detection tells you <em>that</em> there is a person. Pose estimation tells you where their elbows
are - seventeen labelled points per person, thirty times a second, on this board.</p>
<p>That turns out to be a much more useful output, because once you have coordinates you can do geometry.
The angle at the elbow is three points and one <code>atan2</code>. A repetition is that angle crossing two
thresholds in order. Bad form is a different angle being outside a range while the first one moves.</p>
<p>The model is the easy part - one line with Ultralytics. The project is everything after it: smoothing
noisy keypoints, deciding when a joint is visible enough to trust, and writing a state machine that counts a
rep once rather than forty times as the angle wobbles across a threshold.</p>`,

what: [
  'Track seventeen body keypoints in real time, at 25-40 fps.',
  'Compute joint angles from three points, which is all a rep counter needs.',
  'Count repetitions with a state machine that does not double-count at the turnaround.',
  'Check one form rule per exercise and say so out loud when it is broken.',
  'Ignore keypoints the model is not confident about, rather than acting on a guess.',
  'Show the count big enough to read from the floor.'
],

how: `
<p><strong>What a keypoint model gives you.</strong> YOLO-pose outputs, for each person, 17 points in the
COCO convention - nose, eyes, ears, shoulders, elbows, wrists, hips, knees, ankles - each with an x, a y and
a confidence.</p>
<p>The confidence matters enormously and people ignore it. A keypoint the model cannot see - an elbow behind
your body, an ankle out of frame - still gets coordinates, and they are invented. Acting on a 0.2-confidence
wrist is how a rep counter produces nonsense.</p>

<p><strong>Joint angles from three points.</strong> The angle at B, between BA and BC:</p>
<p><code>angle = atan2(Cy-By, Cx-Bx) - atan2(Ay-By, Ax-Bx)</code>, normalised to 0-180.</p>
<p>That is the entire mathematics of this project. A bicep curl is the angle at the elbow (shoulder, elbow,
wrist). A squat is the angle at the knee (hip, knee, ankle). A push-up is again the elbow. Every exercise is
three keypoints and a range.</p>

<p><strong>Rep counting needs hysteresis, not a threshold.</strong> The obvious version - count when the angle
goes below 90 - counts forty reps as a noisy angle crosses 90 back and forth at the bottom of the movement.</p>
<p>The fix is a two-state machine with two <em>different</em> thresholds: go from UP to DOWN below 70 degrees,
and from DOWN to UP above 150. The gap between them is the hysteresis, and nothing in between changes
anything. Count on the DOWN-to-UP transition only, so a rep is counted once, at the top.</p>
<p>This is exactly the pattern from the <a href="project.html?p=smart-thermostat">thermostat</a>, applied to
an elbow instead of a boiler.</p>

<p><strong>Smoothing, and why not too much.</strong> Raw keypoints jitter by several pixels frame to frame. An
exponential moving average over the <em>angle</em> rather than the coordinates - <code>a = 0.6*a +
0.4*new</code> - removes most of it for about three frames of lag.</p>
<p>Smooth harder and the turnaround gets delayed enough that fast reps are missed. This is a real trade and
0.6 is a reasonable place to start.</p>

<p><strong>Form checking is a second angle, not a cleverer model.</strong> For a squat: count on the knee
angle, and separately check the hip-shoulder line stays within some degrees of vertical. If it does not, the
person is leaning forward and the rep is poor.</p>
<p>One rule per exercise, checked only during the active part of the movement, and announced at most once per
rep - otherwise it becomes a machine shouting continuously, which everyone switches off.</p>`,

bom: [
  { id: 'jetson-orin', qty: 1, note: 'The Super kit. Pose runs comfortably; this project has headroom the LLM one does not.' },
  { id: 'nvme', qty: 1, note: 'Or the microSD. Less critical here than for the LLM project - the model is about 12 MB.' },
  { id: 'usb-cam', qty: 1, note: 'A wide-angle one. A standard 60-degree webcam needs you three metres back to see a whole body.' },
  { id: 'usb-speaker', qty: 1, note: 'Spoken feedback. Reading a screen while doing a squat is not realistic.' },
  { id: 'max7219', qty: 2, note: 'Two chained eight-digit modules: reps on one, set and form warnings on the other. Readable from the floor.' },
  { id: 'uno', qty: 1, note: 'Drives the displays. Same split as the other Jetson projects - the header is 3.3 V and SPI timing belongs on an MCU.' },
  { id: 'usb-cable', qty: 1 },
  { id: 'button', qty: 2, note: 'Start a set, and change exercise. Reachable from where you are exercising.' },
  { id: 'buzzer', qty: 1, note: 'A tick per rep. More useful than speech for keeping rhythm.' },
  { id: 'tripod', qty: 1, note: 'The camera must not move. A rep counter whose camera shifts mid-set counts nonsense.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'bb-400', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'jet',  comp: 'jetson',   at: [0, 54] },
    { id: 'cam',  comp: 'webcam',   at: [-50, -50] },
    { id: 'uno',  comp: 'uno',      at: [40, -52] },
    { id: 'd1',   comp: 'max7219',  at: [40, -108] },
    { id: 'buz',  comp: 'buzzer',   at: [-46, -104] },
    { id: 'b1',   comp: 'button',   at: [-20, -104] },
    { id: 'b2',   comp: 'button',   at: [-4, -104] }
  ],
  wires: [
    { from: 'cam.USB',  to: 'jet.USB',   color: 'white',  note: 'Camera into the Jetson' },
    { from: 'jet.CSI0', to: 'uno.USB',   color: 'white',  note: 'USB from the Jetson to the Uno - the only link between them' },
    { from: 'uno.5V',   to: 'd1.VCC',    color: 'red',    note: 'Display power. Two chained modules is about 300 mA at this brightness' },
    { from: 'uno.GND1', to: 'd1.GND',    color: 'black',  note: 'Display ground' },
    { from: 'uno.D11',  to: 'd1.DIN',    color: 'blue',   note: 'SPI data to the MAX7219 chain' },
    { from: 'uno.D10',  to: 'd1.CS',     color: 'orange', note: 'Chip select' },
    { from: 'uno.D13',  to: 'd1.CLK',    color: 'yellow', note: 'SPI clock' },
    { from: 'buz.+',    to: 'uno.D8',    color: 'purple', note: 'One tick per rep - better than speech for rhythm' },
    { from: 'buz.-',    to: 'uno.GND2',  color: 'black',  note: 'Buzzer ground' },
    { from: 'b1.1A',    to: 'uno.D2',    color: 'green',  note: 'Start / stop a set' },
    { from: 'b1.2A',    to: 'uno.GND3',  color: 'black',  note: 'Button to ground' },
    { from: 'b2.1A',    to: 'uno.D3',    color: 'green',  note: 'Change exercise' },
    { from: 'b2.2A',    to: 'uno.GND3',  color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">The camera must not move, and it must see your whole body</span>
<p>A rep counter works in image coordinates. If the camera shifts mid-set, every angle changes and the counts
become nonsense.</p>
<p>Tripod, and check the frame before each session. You need the whole body in view for squats - a standard
60-degree webcam means standing about three metres back, which is further than most rooms allow. A wide-angle
camera is the fix and is worth buying for this.</p>
<p>Side-on is the right angle for squats and curls; face-on works for push-ups and presses.</p></div>

<div class="note warn"><span class="t">The 40-pin header is 3.3 V - the Uno talks over USB only</span>
<p>Same rule as every Jetson project here. The MAX7219 chain is on the Uno because SPI timing and a
continuously refreshed display belong on a microcontroller, and because the Jetson's header would be damaged
by a 5&nbsp;V connection.</p></div>

<div class="note tip"><span class="t">Two chained MAX7219s share three wires</span>
<p>DIN of the second module goes to DOUT of the first; CS and CLK are common. <code>LedControl</code> takes
the device count as its fourth argument and addresses them 0 and 1.</p>
<p>Set the brightness low - these are bright, and you will be looking at them from two metres in a lit
room.</p></div>`,

solderSteps: [
  { h: 'Chain the two display modules',
    body: `<p>Most MAX7219 modules have input and output headers at opposite ends and come with a short
    connector. DOUT of the first to DIN of the second; VCC, GND, CS and CLK common.</p>
    <p>Test the chain with the library's example before building anything else - a chain wired backwards
    shows digits on the wrong module and is confusing to diagnose later.</p>` },
  { h: 'Buttons on long leads',
    body: `<p>You will be on the floor and the electronics will not be. 1.5&nbsp;m of stranded wire to each
    button, with a decent mechanical switch rather than a tiny tactile one - you will be pressing it with a
    sweaty hand.</p>
    <p>Anchor the cable so a foot catching it pulls on the anchor.</p>` },
  { h: 'Mount the display where you can see it',
    body: `<p>At roughly eye height for standing exercises, lower for floor work. The whole point of a
    seven-segment display over a screen is that it is readable at a glance while moving.</p>` }
],

assembly: [
  { h: 'Set the board up as in the vision project',
    body: `<p>JetPack, power mode, <code>jtop</code>, and confirm <code>torch.cuda.is_available()</code>. The
    <a href="project.html?p=jetson-orin-vision">vision project</a> covers all of it in detail.</p>` },
  { h: 'Run pose estimation and just watch it',
    body: `<p><code>pip3 install ultralytics</code>, then run the viewer script. Stand in front of the camera
    and watch the skeleton.</p>
    <p>Spend five minutes moving around. Watch what happens when a limb goes behind your body, when you turn
    side-on, when you leave the frame. The keypoints do not disappear - they get invented, with low
    confidence. That observation is what the confidence gate exists for.</p>` },
  { h: 'Export to TensorRT and measure',
    body: `<p><code>yolo export model=yolo11n-pose.pt format=engine half=True device=0</code>.</p>
    <p>Expect 25-40&nbsp;fps at 640x640 after export, against maybe 12-18 before. Write both down - it is the
    same lesson as the detection project and worth confirming rather than assuming.</p>` },
  { h: 'Print one joint angle and move the joint',
    body: `<p>Before any counting. Print the elbow angle and watch it as you bend your arm. Straight should be
    near 180, fully bent near 30-40.</p>
    <p>Watch the noise with the arm held still - a few degrees of jitter is normal and is what the smoothing
    handles.</p>` },
  { h: 'Tune the two thresholds for your own range of motion',
    body: `<p>The defaults are a starting point. Do five slow reps watching the printed angle, note the value
    at the top and at the bottom, and set the thresholds inside those by fifteen degrees or so.</p>
    <p>Too close together and one rep counts twice at the turnaround; too far apart and a shallow rep does not
    count at all. The gap between them is the whole mechanism.</p>` },
  { h: 'Do ten reps and check it counted ten',
    body: `<p>The actual test. Then do ten fast ones, and ten deliberately sloppy ones.</p>
    <p>Fast reps missed means the smoothing is too heavy. Sloppy reps counted means the thresholds are too
    generous, which is a judgement call rather than a bug.</p>` },
  { h: 'Add the form rule last',
    body: `<p>One rule per exercise. Check it only during the active phase, and announce at most once per
    rep.</p>
    <p>A machine that comments on every frame is one nobody uses twice.</p>` }
],

libraries: [
  { name: 'Ultralytics YOLO', by: 'Ultralytics', how: 'pip3 install ultralytics', why: 'YOLO11-pose plus TensorRT export. Note the AGPL licence if you ever distribute something built on it.' },
  { name: 'OpenCV', by: 'OpenCV', how: 'Part of JetPack', why: 'Capture and drawing the skeleton overlay.' },
  { name: 'Piper', by: 'Rhasspy', how: 'pip3 install piper-tts', why: 'Spoken feedback. Reading a screen mid-squat is not realistic.' },
  { name: 'pyserial', by: 'pySerial', why: 'The link to the Uno.' },
  { name: 'LedControl', by: 'Eberhard Fahle', why: 'On the Uno. Drives the chained MAX7219 modules.' }
],

code: [
{
  h: 'The coach',
  intro: `<p>The geometry and the state machine are the project. The model is three lines.</p>`,
  name: 'pose_coach.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Pose-based rep counter and form checker.

The model finds 17 keypoints. Everything interesting happens after
that: angles, smoothing, a hysteresis state machine, and one form
rule per exercise.
"""

import math
import subprocess
import time

import cv2
import serial
from ultralytics import YOLO

MODEL = "yolo11n-pose.engine"        # TensorRT export
UNO_DEV = "/dev/ttyACM0"
PIPER_VOICE = "/home/jetson/piper/en_GB-alba-medium.onnx"

# COCO keypoint indices
NOSE = 0
L_SHOULDER, R_SHOULDER = 5, 6
L_ELBOW, R_ELBOW = 7, 8
L_WRIST, R_WRIST = 9, 10
L_HIP, R_HIP = 11, 12
L_KNEE, R_KNEE = 13, 14
L_ANKLE, R_ANKLE = 15, 16

"""A keypoint the model cannot see still gets coordinates, and they are
invented. Below this confidence we simply do not have the joint, and
acting on it is how a rep counter produces nonsense."""
MIN_KP_CONF = 0.5

"""Angle smoothing. 0.6 removes most of the several-pixel jitter for
about three frames of lag. Smooth harder and the turnaround is delayed
enough to miss fast reps - this is a real trade."""
SMOOTH = 0.6


class Exercise:
    """down_below and up_above are DIFFERENT thresholds. The gap between
    them is hysteresis, and it is what stops one rep counting forty
    times as a noisy angle wobbles across a single threshold."""

    def __init__(self, name, joints, down_below, up_above,
                 form_check=None, form_msg=""):
        self.name = name
        self.joints = joints            # (a, b, c) - angle is at b
        self.down_below = down_below
        self.up_above = up_above
        self.form_check = form_check
        self.form_msg = form_msg


def torso_upright(kp):
    """Squat form: the hip-shoulder line should stay near vertical.
    Leaning forward is the commonest fault and the easiest to measure."""
    sh = midpoint(kp, L_SHOULDER, R_SHOULDER)
    hip = midpoint(kp, L_HIP, R_HIP)
    if sh is None or hip is None:
        return True                      # cannot see it: do not complain
    dx, dy = sh[0] - hip[0], sh[1] - hip[1]
    lean = abs(math.degrees(math.atan2(dx, -dy)))
    return lean < 35


def elbows_in(kp):
    """Push-up form: elbows should not flare wider than the shoulders."""
    le, re_ = kp_at(kp, L_ELBOW), kp_at(kp, R_ELBOW)
    ls, rs = kp_at(kp, L_SHOULDER), kp_at(kp, R_SHOULDER)
    if None in (le, re_, ls, rs):
        return True
    return abs(le[0] - re_[0]) < abs(ls[0] - rs[0]) * 1.6


EXERCISES = [
    Exercise("squat", (R_HIP, R_KNEE, R_ANKLE), 100, 160,
             torso_upright, "keep your chest up"),
    Exercise("curl", (R_SHOULDER, R_ELBOW, R_WRIST), 60, 150),
    Exercise("pushup", (R_SHOULDER, R_ELBOW, R_WRIST), 95, 155,
             elbows_in, "tuck your elbows in"),
]


def kp_at(kp, i):
    """A keypoint, or None if the model is not confident about it."""
    x, y, c = kp[i]
    return (float(x), float(y)) if c >= MIN_KP_CONF else None


def midpoint(kp, i, j):
    a, b = kp_at(kp, i), kp_at(kp, j)
    if a is None or b is None:
        return None
    return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)


def angle_at(kp, ia, ib, ic):
    """The angle at B between BA and BC, in degrees, 0-180.

    This one function is the entire mathematics of the project."""
    a, b, c = kp_at(kp, ia), kp_at(kp, ib), kp_at(kp, ic)
    if None in (a, b, c):
        return None
    ang = math.degrees(
        math.atan2(c[1] - b[1], c[0] - b[0]) -
        math.atan2(a[1] - b[1], a[0] - b[0]))
    ang = abs(ang)
    return 360 - ang if ang > 180 else ang


class Counter:
    def __init__(self, ex):
        self.ex = ex
        self.state = "up"
        self.reps = 0
        self.angle = None
        self.form_warned = False

    def update(self, kp):
        raw = angle_at(kp, *self.ex.joints)
        if raw is None:
            return None, None            # joint not visible: do nothing

        self.angle = raw if self.angle is None \\
            else SMOOTH * self.angle + (1 - SMOOTH) * raw

        event = None

        if self.state == "up" and self.angle < self.ex.down_below:
            self.state = "down"
            self.form_warned = False

        elif self.state == "down" and self.angle > self.ex.up_above:
            # Count on the DOWN->UP transition only, so a rep is
            # counted once, at the top, however the angle wobbles.
            self.state = "up"
            self.reps += 1
            event = "rep"

        # Check form only during the active phase, and warn once per
        # rep - a machine that comments continuously gets switched off.
        if (self.state == "down" and self.ex.form_check
                and not self.form_warned and not self.ex.form_check(kp)):
            self.form_warned = True
            event = "form"

        return self.angle, event


class Display:
    def __init__(self, dev):
        try:
            self.ser = serial.Serial(dev, 115200, timeout=0.2)
            time.sleep(2.0)
        except serial.SerialException:
            self.ser = None
            print("no Uno - console only")

    def send(self, msg):
        if self.ser:
            self.ser.write((msg + "\\n").encode())


def say(text):
    """Fire and forget - never block the frame loop on speech."""
    subprocess.Popen(
        f'echo "{text}" | piper -m {PIPER_VOICE} --output_raw '
        f'| aplay -r 22050 -f S16_LE -t raw -q -',
        shell=True, stderr=subprocess.DEVNULL)


def main():
    model = YOLO(MODEL)
    disp = Display(UNO_DEV)

    cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)     # always the newest frame

    ex_idx = 0
    counter = Counter(EXERCISES[ex_idx])
    disp.send(f"E{counter.ex.name}")
    say(f"{counter.ex.name}. Ready.")

    fps, last_t = 0.0, time.time()

    while True:
        ok, frame = cap.read()
        if not ok:
            continue

        # Buttons from the Uno
        if disp.ser and disp.ser.in_waiting:
            cmd = disp.ser.readline().decode(errors="ignore").strip()
            if cmd == "NEXT":
                ex_idx = (ex_idx + 1) % len(EXERCISES)
                counter = Counter(EXERCISES[ex_idx])
                disp.send(f"E{counter.ex.name}")
                say(counter.ex.name)
            elif cmd == "RESET":
                counter.reps = 0
                say("set reset")

        results = model(frame, verbose=False, device=0, conf=0.5)
        r = results[0]

        angle, event = None, None
        if r.keypoints is not None and len(r.keypoints.data):
            # The largest person - nearest the camera, and the one
            # exercising. Confidence flickers frame to frame; size
            # does not.
            boxes = r.boxes.xyxy.cpu().numpy()
            areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
            who = int(areas.argmax())

            kp = r.keypoints.data[who].cpu().numpy()
            angle, event = counter.update(kp)

            if event == "rep":
                disp.send(f"R{counter.reps}")
                disp.send("B")                      # tick
                print(f"  rep {counter.reps}")
                if counter.reps % 10 == 0:
                    say(str(counter.reps))
            elif event == "form":
                disp.send("F")
                say(counter.ex.form_msg)
                print(f"  form: {counter.ex.form_msg}")

        # overlay
        annotated = r.plot()
        now = time.time()
        fps = 0.9 * fps + 0.1 / max(now - last_t, 1e-3)
        last_t = now

        cv2.putText(annotated, f"{counter.ex.name}  reps {counter.reps}",
                    (12, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.1, (0, 230, 0), 2)
        if angle is not None:
            cv2.putText(annotated, f"{angle:5.0f} deg  [{counter.state}]",
                        (12, 78), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                        (255, 255, 255), 2)
        else:
            cv2.putText(annotated, "joint not visible", (12, 78),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (60, 60, 255), 2)
        cv2.putText(annotated, f"{fps:4.1f} fps",
                    (12, annotated.shape[0] - 16),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

        cv2.imshow("coach", annotated)
        if cv2.waitKey(1) == 27:
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()`,
  after: `<p><strong>Two different thresholds is the whole rep counter.</strong> A single threshold at 90 degrees
  counts dozens of reps as a noisy angle crosses it repeatedly at the bottom of the movement. Going down
  below 100 and up above 160, counting only on the up transition, counts once - and it is the same hysteresis
  pattern as the thermostat's boiler.</p>
  <p><strong>The confidence gate is not optional.</strong> <code>kp_at()</code> returns <code>None</code>
  rather than coordinates for a joint the model cannot see, and every function above it handles
  <code>None</code> by doing nothing. Without that, an occluded ankle produces an invented position, an
  invented angle, and invented reps.</p>
  <p><strong>Largest person, not most confident.</strong> Confidence flickers frame to frame and with two
  people in view the counter would jump between them; bounding-box area is stable and picks whoever is
  nearest the camera.</p>`
}],

upload: `
<p>Python on the Jetson, sketch on the Uno. Run the Python with a display attached the first time - the
skeleton overlay is how you learn what the model is doing.</p>
<div class="note tip"><span class="t">Watch the overlay before writing any rules</span>
<p>Five minutes of moving around in front of it, watching which keypoints go grey and when, teaches you more
about where this will fail than any amount of tuning afterwards.</p></div>
<div class="note warn"><span class="t">Export to TensorRT before judging the speed</span>
<p>Roughly 12-18&nbsp;fps in PyTorch, 25-40 after export. The engine file is tied to this board and this
JetPack version - keep the <code>.pt</code> and re-export after any upgrade.</p></div>`,

tune: [
  { h: 'Set the thresholds from your own range of motion',
    body: `<p>Print the angle, do five slow reps, and note the top and bottom values. Then set
    <code>down_below</code> about fifteen degrees above your bottom and <code>up_above</code> about fifteen
    below your top.</p>
    <p>If one rep counts twice, widen the gap. If a genuine rep does not count, narrow it.</p>` },
  { h: 'Smoothing against fast reps',
    body: `<p>0.6 is a good default. Raise it to 0.8 for a smoother angle and expect to miss quick reps;
    lower it to 0.4 for responsiveness and expect occasional double counts.</p>
    <p>If you need both, count on the smoothed angle but use the raw one for the form check - the form rule
    cares about a sustained state, not a transition.</p>` },
  { h: 'Left and right, and which side faces the camera',
    body: `<p>The sketch uses the right-side joints. If you set up facing the other way, the right elbow is
    occluded by your body and its confidence collapses.</p>
    <p>Better: compute both sides and use whichever has higher keypoint confidence. Ten lines, and it removes
    a whole class of "it stopped counting" confusion.</p>` },
  { h: 'Tempo, which is more useful than count',
    body: `<p>You already have the timestamps of every transition. Time under tension, concentric versus
    eccentric duration, and rest between sets are all a subtraction away - and they are what coaching actually
    cares about.</p>
    <p>A rep that took 0.6 seconds down and 0.4 up is a different rep from one that took three and three.</p>` },
  { h: 'Log it',
    body: `<p>Append every set to a CSV: exercise, reps, timestamps, and how many form warnings. Over a few
    months that is genuinely useful data and it costs ten lines.</p>` },
  { h: 'More people',
    body: `<p>The model already detects everyone in frame. Give each detection a tracker ID - as in the
    <a href="project.html?p=jetson-orin-vision">vision counter</a> - and you can count several people at once,
    which turns this into something for a gym rather than a bedroom.</p>` },
  { h: 'Where this genuinely cannot help',
    body: `<p>A single camera sees a 2D projection. Rotation toward or away from the camera changes measured
    angles without any change in the actual joint, and depth is guessed.</p>
    <p>So it is good at counting and at gross form faults, and it cannot assess anything subtle. Do not treat
    it as a physiotherapist - and be careful about building confidence in advice that is measuring a
    projection.</p>` }
],

trouble: [
  { q: 'Reps count in twos and threes',
    a: `The two thresholds are too close together, or the smoothing is too light. Widen the gap first - that
    is what hysteresis is for.` },
  { q: 'Genuine reps are not counted',
    a: `Your range of motion does not cross both thresholds. Print the angle and watch the actual values, then
    set the thresholds inside them.` },
  { q: 'It says "joint not visible" constantly',
    a: `Occlusion or framing. Check the whole body is in frame and that the side you are measuring faces the
    camera. Lowering <code>MIN_KP_CONF</code> makes the message go away and makes the counts worse - it is not
    the fix.` },
  { q: 'Twelve frames a second',
    a: `Still on the PyTorch model. Export to TensorRT. Then check <code>jtop</code> - if the GPU is idle you
    are on the CPU entirely.` },
  { q: 'It counts the wrong person',
    a: `Largest-box selection picks whoever is nearest the camera. If someone walks between you and it, they
    win. Add tracking, or crop the frame to the area you exercise in.` },
  { q: 'Angles jump when I turn slightly',
    a: `Inherent to a single camera - you are measuring a 2D projection of a 3D joint. Set up square to the
    camera and stay there, and treat the absolute numbers as approximate.` },
  { q: 'The form warning fires constantly',
    a: `It is checking outside the active phase, or the <code>form_warned</code> flag is not being reset per
    rep. Both are in the state machine - check it only in the down state and reset on entering it.` },
  { q: 'Speech stutters the video',
    a: `Piper is being run synchronously. <code>subprocess.Popen</code> without <code>wait()</code> - never
    block the frame loop on audio.` }
],

next: `
<ul>
  <li><strong>The board basics</strong> - <a href="project.html?p=jetson-orin-vision">real-time vision</a>
  covers JetPack, TensorRT and measuring the GPU properly.</li>
  <li><strong>Have it talk back properly</strong> - the
  <a href="project.html?p=jetson-local-llm">local LLM assistant</a> could turn a set of numbers into actual
  coaching, though not at the same time as this - 8&nbsp;GB does not stretch to both.</li>
  <li><strong>The same geometry elsewhere</strong> - hand keypoints for gesture control, or pose on a camera
  watching a workshop for safety.</li>
  <li><strong>Start much smaller</strong> - <a href="project.html?p=tinyml-gesture-nano">gesture recognition
  on a Nano 33</a> is the $70 version of "recognise what a body is doing".</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">It is a camera pointed at you exercising</span>
<ul>
  <li><strong>Nothing leaves the board</strong> in this project, which is a meaningful property for a camera
  in a bedroom. If you add recording or streaming, you have built something different.</li>
  <li><strong>Tell anyone else in the house</strong> that it is there, and unplug it when it is not in
  use.</li>
  <li><strong>Do not stream it anywhere unauthenticated.</strong> The vision project's warning about an open
  MJPEG port applies here with more force.</li>
</ul>
</div>
<div class="note danger"><span class="t">It is not a coach and it is not a physiotherapist</span>
<ul>
  <li><strong>A single camera measures a 2D projection.</strong> It is good at counting and at gross faults,
  and it cannot see anything subtle. Do not let a green light convince you a movement is safe.</li>
  <li><strong>Do not use it to rehabilitate an injury</strong> or to push through pain. If something hurts,
  the machine has no idea.</li>
  <li><strong>Get real coaching for real technique</strong>, particularly for loaded movements. This counts
  reps; it does not know your body.</li>
  <li><strong>Clear the space</strong> around you before starting - you will be watching a display rather
  than the floor.</li>
</ul>
</div>`
});
