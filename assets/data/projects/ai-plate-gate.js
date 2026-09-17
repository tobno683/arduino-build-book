/* Number plate recognition on your own gate. The legal section is as real as the wiring. */
AB.addProject({
slug: 'ai-plate-gate',
title: 'Number plate recognition gate opener',
cat: 'ai',
level: 4,
time: '10 hours',
solder: true,
board: 'Jetson Orin Nano',
tags: ['jetson', 'anpr', 'ocr', 'privacy', 'gdpr', 'gate', 'allowlist', 'hashing', 'motion gating'],
blurb: 'Your own car pulls up and the gate opens. Nobody else’s does. It works well, it is genuinely useful, and it is the one project here where the law has an opinion about what you build.',

skills: ['Plate detection vs plate reading', 'OCR on short strings', 'Allowlists and hashing', 'Data minimisation', 'Motion gating', 'Failing safe'],

intro: `
<p>Automatic number plate recognition is two problems stacked. First find the rectangle in the frame that is a
plate - a detection problem, and an easy one, because plates are high-contrast and a standard shape. Then read
the characters in it - an OCR problem, and a harder one, because it is seven characters at an angle in whatever
light there is.</p>
<p>A Jetson does both comfortably in real time. The build is a camera, a relay and a gate motor you almost
certainly already have.</p>
<p>What makes this different from every other project in this book is that it processes other people's
information. A camera pointed at a driveway sees the neighbours, the postman, and everyone who turns round in
your entrance. In the UK and the EU that engages data protection law even for a private house, and the section
at the end of this page is not boilerplate - it changes what you should actually build.</p>`,

what: [
  'Detect a number plate anywhere in the frame, at an angle, in daylight or headlights.',
  'Read it accurately enough to match against a short list of your own vehicles.',
  'Open the gate for a match and do nothing at all for anything else.',
  'Store no photographs and no readable plates - only salted hashes of the ones you allow.',
  'Run the camera only when something is actually there, which saves power and collects far less.'
],

how: `
<p><strong>Detect, then read.</strong> Running OCR on a whole frame is slow and inaccurate. Run a small
detector first to find the plate rectangle, crop it, upscale it, and read only that. The crop is maybe 200 x 50
pixels, which OCR handles far better than a 1080p frame with a plate somewhere in it.</p>

<p><strong>Getting the crop right matters more than the OCR model.</strong> A plate photographed at an angle is
a trapezium. A perspective transform - four corners to a rectangle - straightens it, and that one step improves
character accuracy dramatically. So does upscaling the crop to a fixed height before reading, because OCR models
have a resolution they were trained at and want the characters to be about that size.</p>

<p><strong>OCR errors are systematic, not random.</strong> 0 and O, 1 and I, 8 and B, 5 and S, 2 and Z. Which
pairs are confusable depends on the plate font, and most countries use a font chosen to be distinguishable,
which helps.</p>
<p>Two things exploit this. Know your country's plate format - a UK plate is two letters, two digits, three
letters, so a digit read in a letter position is certainly wrong and can be corrected. And compare with
<strong>edit distance</strong> rather than exact equality: allow one character of difference against your
allowlist and the false reject rate drops enormously.</p>
<p>Allowing two is too many. That starts matching plates that are genuinely different.</p>

<p><strong>Require agreement across frames.</strong> A single frame can misread. At 15 frames a second, a car
approaching a gate gives you thirty or forty looks at the same plate. Require the same string three times before
acting. Nearly all single-frame errors vanish and it costs a fifth of a second.</p>

<p><strong>Fail closed, and keep the manual control.</strong> If the model is unsure, the gate stays shut. A
gate that opens when confused is worse than no gate. Keep whatever manual button or remote you already have,
wired in parallel and independent of the Jetson, so a software crash does not trap anyone.</p>

<p><strong>Store hashes, not plates.</strong> The device never needs to know what the plates are - only whether
one it just saw is on the list. Store <code>sha256(salt + plate)</code>. Then the device holding data about your
neighbours' vehicles is holding numbers that cannot be reversed into registrations.</p>
<p>This costs you nothing. It means a stolen device, or a curious guest, reveals nothing. Doing it this way
round is the difference between a considered build and a surveillance device on a post.</p>`,

bom: [
  { id: 'jetson-orin', qty: 1, note: 'Detection plus OCR at 15 fps needs the GPU. This is one of the few projects here where the Jetson is genuinely the right answer rather than an indulgence.' },
  { id: 'nvme', qty: 1, note: 'Models and the OS. Not for images - the whole design is to not keep any.' },
  { id: 'usb-cam', qty: 1, note: 'A USB camera can be 5 m from the board on an active extension, which matters when the board lives in the house and the camera is on the gate post.' },
  { id: 'uno', qty: 1, note: 'Drives the relay and the presence sensor. The Jetson header is 3.3 V and this keeps gate switching on a board that cannot be crashed by a Python exception.' },
  { id: 'relay1', qty: 1, note: 'Across the existing gate controller’s manual open terminals - see the safety section. You are not switching the motor itself.' },
  { id: 'hcsr04', qty: 1, note: 'Presence detection, so the camera only runs when a vehicle is actually there.' },
  { id: 'led-ir', qty: 4, note: 'Infrared illumination for night. Plates are retroreflective, which is exactly why this works so well after dark.' },
  { id: 'res220', qty: 4 },
  { id: 'box-ip65', qty: 1, note: 'The camera end is outdoors permanently.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'usb-cable', qty: 1 },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'hookup', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'jet',  comp: 'jetson',  at: [0, 62] },
    { id: 'cam',  comp: 'webcam',  at: [-66, -4] },
    { id: 'uno',  comp: 'uno',     at: [52, -34] },
    { id: 'bb',   comp: 'bb400',   at: [-18, -52] },
    { id: 'rly',  comp: 'relay1',  at: [54, -86] },
    { id: 'son',  comp: 'hcsr04',  at: [-62, -78] }
  ],
  wires: [
    { from: 'cam.USB',  to: 'jet.USB',  color: 'white',  note: 'Camera to the Jetson over USB' },
    { from: 'jet.USB',  to: 'uno.USB',  color: 'white',  note: 'Serial link to the Uno - the only connection between them' },
    { from: 'uno.5V',   to: 'bb.T+1',   color: 'red',    note: '5 V rail' },
    { from: 'uno.GND1', to: 'bb.T-1',   color: 'black',  note: 'Ground rail' },
    { from: 'son.VCC',  to: 'bb.T+5',   color: 'red',    note: 'Sonar power' },
    { from: 'son.GND',  to: 'bb.T-5',   color: 'black',  note: 'Sonar ground' },
    { from: 'son.TRIG', to: 'uno.D8',   color: 'green',  note: 'Sonar trigger' },
    { from: 'son.ECHO', to: 'uno.D9',   color: 'blue',   note: 'Sonar echo' },
    { from: 'rly.VCC',  to: 'bb.T+12',  color: 'red',    note: 'Relay module power' },
    { from: 'rly.GND',  to: 'bb.T-12',  color: 'black',  note: 'Relay ground' },
    { from: 'rly.IN',   to: 'uno.D7',   color: 'brown',  note: 'Relay trigger - brown because this one moves a heavy gate' },
    { from: 'uno.D5',   to: 'bb.e20',   color: 'purple', note: 'IR illuminators, through their resistors' },
    { from: 'bb.a20',   to: 'bb.T-20',  color: 'black',  note: 'IR LED return to ground' }
  ]
},

wireIntro: `<p>The Jetson only ever talks to the Uno over USB serial. The gate relay is on the Uno, deliberately,
so that a Python traceback cannot leave a gate half open.</p>`,

wireNotes: `
<div class="note danger"><span class="t">Do not switch the gate motor</span>
<p>Gate motors are mains or high-current low voltage, and they have a controller with limit switches, obstacle
detection and a safety edge. That controller exists to stop the gate closing on a child.</p>
<p>Your relay goes across the <strong>manual open input</strong> on that controller - the same terminals the
existing push button or key switch uses. You are pressing the button, not driving the motor. Anything else
bypasses the safety system.</p></div>

<div class="note warn"><span class="t">The gate controller is a mains appliance</span>
<p>If it is mains powered, isolate at the breaker before opening it, and if you are not comfortable identifying
the manual-open terminals, have an installer connect the two wires. It is a ten-minute job for someone who does
it every day.</p></div>

<div class="note tip"><span class="t">IR works because plates are retroreflective</span>
<p>Number plates are designed to bounce light straight back at its source, which is why they glare in
headlights. An IR illuminator beside the camera gets an extremely clean plate image at night - often better
than daylight, because the rest of the scene stays dark and the plate is the only bright thing.</p>
<p>Infrared is invisible, so it does not annoy neighbours. It is also why the camera must not have an IR-cut
filter, or it will see nothing at all.</p></div>`,

solderIntro: `<p>Straightforward: headers on perfboard, the IR LED array with its resistors, and weatherproof
terminations at the camera end.</p>`,

solderSteps: [
  { h: 'IR array around the lens',
    body: `<p>Four IR LEDs with 220&nbsp;ohm resistors, arranged around the camera rather than off to one side.
    Retroreflection returns light towards where it came from, so the closer the illuminators are to the lens
    axis, the brighter the plate looks.</p>` },
  { h: 'Weatherproof the camera end properly',
    body: `<p>Gland at the cable entry, vents on the underside, and lens through a hole rather than behind a
    window - a window fogs and reflects your own IR straight back into the lens.</p>` },
  { h: 'Sonar on the same face as the camera',
    body: `<p>Pointing along the driveway. It only needs to answer "is something within four metres", which it
    does reliably, and it is the thing that keeps the camera switched off the rest of the time.</p>` },
  { h: 'Relay wiring last, with the gate controller isolated',
    body: `<p>Two wires from the relay's normally-open contacts to the controller's manual-open terminals. Test
    by triggering the relay by hand before any software is involved.</p>` }
],

libraries: [
  { name: 'OpenCV', by: 'apt / JetPack', why: 'Capture, perspective correction and the crop. Already present on JetPack.' },
  { name: 'PaddleOCR or EasyOCR', by: 'pip', why: 'Character recognition on the cropped plate. Both run on the GPU; PaddleOCR is faster, EasyOCR is easier to install.' },
  { name: 'ultralytics', by: 'pip', why: 'A small YOLO model fine-tuned for plate detection, or use the OpenCV contour approach for a lighter start.' }
],

code: [{
  name: 'plate_gate.py',
  code: `#!/usr/bin/env python3
"""Number plate gate opener.

Design notes that matter more than the code:
  - No image is ever written to disk.
  - No readable plate is ever written to disk. The allowlist is salted
    hashes, so this device cannot tell you what cars it has seen.
  - The Jetson asks the Uno to open the gate. It cannot drive the gate.
"""
import hashlib
import re
import time
from collections import deque

import cv2
import numpy as np
import serial

SALT = "change-this-to-something-random"

# sha256(SALT + plate). Generate with hash_plate() and paste the results.
# The plates themselves are never stored anywhere on the device.
ALLOWED = {
    "9f2b1c...replace...",
    "4a77de...replace...",
}

PLATE_RE = re.compile(r"^[A-Z]{2}[0-9]{2}[A-Z]{3}$")   # UK format
AGREE_FRAMES = 3
MAX_EDIT_DISTANCE = 1

uno = serial.Serial("/dev/ttyACM0", 115200, timeout=1)


def hash_plate(plate: str) -> str:
    return hashlib.sha256((SALT + plate.upper()).encode()).hexdigest()


def tidy(raw: str) -> str:
    """OCR confusions are systematic, and the plate format tells us which
    positions must be letters and which must be digits. A '0' read in a
    letter position is certainly an 'O'."""
    s = re.sub(r"[^A-Z0-9]", "", raw.upper())
    if len(s) != 7:
        return s

    to_letter = {"0": "O", "1": "I", "5": "S", "8": "B", "2": "Z"}
    to_digit  = {"O": "0", "I": "1", "S": "5", "B": "8", "Z": "2"}

    out = []
    for i, ch in enumerate(s):
        letter_position = i in (0, 1, 4, 5, 6)
        if letter_position:
            out.append(to_letter.get(ch, ch))
        else:
            out.append(to_digit.get(ch, ch))
    return "".join(out)


def edit_distance(a: str, b: str) -> int:
    if len(a) != len(b):
        return 99
    return sum(1 for x, y in zip(a, b) if x != y)


def is_allowed(plate: str) -> bool:
    if hash_plate(plate) in ALLOWED:
        return True
    # One character of tolerance, checked by generating the neighbours and
    # hashing those. Two would start matching genuinely different plates.
    if MAX_EDIT_DISTANCE >= 1:
        for i in range(len(plate)):
            for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789":
                if c == plate[i]:
                    continue
                if hash_plate(plate[:i] + c + plate[i + 1:]) in ALLOWED:
                    return True
    return False


def straighten(frame, box):
    """Four corners to a rectangle. A plate at an angle is a trapezium,
    and this one step improves OCR accuracy more than any model change."""
    dst_w, dst_h = 320, 80
    dst = np.float32([[0, 0], [dst_w, 0], [dst_w, dst_h], [0, dst_h]])
    M = cv2.getPerspectiveTransform(np.float32(box), dst)
    return cv2.warpPerspective(frame, M, (dst_w, dst_h))


def vehicle_present() -> bool:
    """Ask the Uno whether the sonar sees anything. The camera stays off
    the rest of the time - less power, and far less collected."""
    uno.write(b"D\\n")
    line = uno.readline().decode(errors="ignore").strip()
    try:
        return 0 < int(line) < 400
    except ValueError:
        return False


def open_gate():
    uno.write(b"OPEN\\n")
    print("gate: open")


def main():
    from ultralytics import YOLO
    import easyocr

    detector = YOLO("plate_yolo.pt")
    reader = easyocr.Reader(["en"], gpu=True)

    recent = deque(maxlen=AGREE_FRAMES)
    cam = None
    last_open = 0.0

    while True:
        if not vehicle_present():
            if cam is not None:
                cam.release()
                cam = None
                recent.clear()
            time.sleep(0.5)
            continue

        if cam is None:
            cam = cv2.VideoCapture(0)
            cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
            cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

        ok, frame = cam.read()
        if not ok:
            continue

        results = detector(frame, verbose=False)[0]
        for b in results.boxes:
            x1, y1, x2, y2 = map(int, b.xyxy[0])
            crop = frame[y1:y2, x1:x2]
            if crop.size == 0:
                continue

            crop = cv2.resize(crop, (320, 80))
            text = "".join(t[1] for t in reader.readtext(crop))
            plate = tidy(text)

            if not PLATE_RE.match(plate):
                continue

            recent.append(plate)

            # Same reading three frames running. At 15 fps that is a fifth
            # of a second, and it removes nearly every single-frame error.
            if len(recent) == AGREE_FRAMES and len(set(recent)) == 1:
                if is_allowed(plate) and time.time() - last_open > 20:
                    open_gate()
                    last_open = time.time()
                    recent.clear()
                else:
                    # Not on the list. Nothing is logged, nothing is kept.
                    recent.clear()


if __name__ == "__main__":
    main()`
}],

trouble: [
  { q: 'Plates are read correctly in daylight and never at night',
    a: `Your camera has an IR-cut filter, so it cannot see the illuminators. You need a camera without one, or
    with a switchable one. Check by pointing a TV remote at it and watching for a white dot.` },
  { q: 'Characters are consistently confused',
    a: `Perspective correction is not being applied, or the crop is not being upscaled to the size the OCR model
    expects. Both matter more than swapping OCR models.` },
  { q: 'It reads the plate but never matches',
    a: `Salt mismatch between where you generated the hashes and the running device, or whitespace in the
    allowlist. Print the hash of a known plate on the device and compare by eye.` },
  { q: 'The gate opens for a neighbour',
    a: `Edit distance too permissive, or agreement frames too few. Tighten to exact matching and require four
    frames. A gate that occasionally does not open is a much better failure than one that opens for strangers.` },
  { q: 'Very slow, a few frames a second',
    a: `OCR is running on the whole frame rather than the crop, or without GPU. Check EasyOCR was constructed
    with <code>gpu=True</code> and that the detector is actually narrowing the region.` },
  { q: 'The camera never starts',
    a: `The sonar gate is not triggering. Test it independently - print the distance continuously and walk in
    front of it. Sonar also reads zero rather than a large number on timeout, which can look like "very close".` },
  { q: 'The gate reopens immediately after closing',
    a: `The car is still in the sonar beam and the plate is still readable. The 20-second lockout in the sketch
    handles this; lengthen it if your gate is slow.` },
  { q: 'Wet weather ruins recognition',
    a: `Rain on the lens, or spray on the plate. Angle the camera slightly downward and add a small hood. There
    is no software fix for a dirty plate, and there should not be.` }
],

safety: `
<div class="note danger"><span class="t">The gate itself</span>
<p>A powered gate can cause serious injury. Your relay goes across the existing controller's manual-open input,
never across the motor, so the controller's obstacle detection and safety edge remain in charge. If your gate
does not have those, fix that before automating it further.</p>
<p>Keep the existing manual control working and independent. A Python crash must never be able to trap someone
in or out, and there must always be a way to stop the gate that does not involve a computer.</p></div>

<div class="note warn"><span class="t">This project processes other people's personal data</span>
<p>A number plate identifies a vehicle and, in practice, a person. In the UK and the EU, video of a public road
or a shared access - and any record of plates - is personal data, and a domestic camera that captures beyond
your own boundary is generally outside the "purely personal or household activity" exemption. Similar rules
apply in many other places.</p>
<p>That does not mean you cannot build this. It means build it the way this project does:</p>
<ul>
  <li><strong>Point it at your own property.</strong> Frame the driveway and the gate, not the street or a
  neighbour's windows. Physically restricting the view is worth more than any software promise.</li>
  <li><strong>Keep nothing.</strong> No images written, no plate strings written, no log of vehicles seen. The
  sketch above deliberately has no logging at all, and adding it is the change that would turn this from a lock
  into a surveillance system.</li>
  <li><strong>Hash the allowlist.</strong> The device does not need to know what the plates are, only whether
  one matches. Then the device holds nothing readable even if it is stolen.</li>
  <li><strong>Run the camera only when something is there.</strong> The sonar gate is a privacy feature before
  it is a power-saving one.</li>
  <li><strong>Tell people.</strong> A sign at the entrance is required in many jurisdictions and is simple
  courtesy everywhere.</li>
</ul>
<p>If you want a log, log the fact that the gate opened and the time, not who. That answers every question you
will actually have and creates no record of anyone else's movements.</p>
<p>Do not point this at a public road, and do not use it to record vehicles that are not yours. Beyond the
legal position, a camera reading strangers' plates and keeping the results is the kind of thing that is easy to
build and hard to justify.</p></div>`,

next: `
<ul>
  <li><strong>A second camera on the exit side</strong>, so the gate opens on the way out without a sensor loop
  in the driveway.</li>
  <li><strong>Time windows</strong>: the cleaner's van opens it on Tuesday mornings and never at midnight. A
  small change that removes most of the risk of a compromised allowlist.</li>
  <li><strong>A physical confirm</strong> - the gate opens on a plate match only if a button in the car is also
  pressed. Two factors, and no software alone can open it.</li>
  <li><strong>Try it without the plate reading entirely</strong>: a
  <a href="project.html?p=rfid-door-lock">tag on the windscreen</a> is cheaper, more reliable, works in fog,
  and collects nothing about anybody. For most driveways that is the better engineering answer, and it is worth
  building both to see why.</li>
</ul>`
});
