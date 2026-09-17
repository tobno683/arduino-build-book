/* Leaf disease classification, and a long honest look at why lab accuracy does not survive a greenhouse. */
AB.addProject({
slug: 'ai-plant-doctor',
title: 'Plant disease classifier',
cat: 'ai',
level: 3,
time: '7 hours, plus a season of photographs',
solder: true,
board: 'Arduino UNO Q',
tags: ['uno q', 'classification', 'plantvillage', 'domain shift', 'macro', 'greenhouse', 'transfer learning'],
blurb: 'Hold a leaf up to a camera and it tells you what is wrong with it. It also shows, more clearly than any other project here, why a model that scores 99% in testing can be useless in your greenhouse.',

skills: ['Transfer learning', 'Domain shift', 'Controlled lighting', 'Macro focus', 'Top-3 predictions', 'Knowing when a model is guessing'],

intro: `
<p>There is a famous public dataset called PlantVillage: about 54,000 photographs of leaves, 38 classes of
crop and disease, and models trained on it routinely report 99% accuracy. You can have one running on a UNO Q
in an afternoon.</p>
<p>Then you take it outside and it is wrong most of the time.</p>
<p>This project builds the classifier and then spends its real effort on why that happens, because the gap
between those two numbers is the single most important thing in applied machine learning and almost nothing
teaches it as vividly as a leaf.</p>`,

what: [
  'Classify a leaf held in front of the camera into a healthy or diseased class.',
  'Show the top three guesses with confidence, rather than one confident-looking answer.',
  'Refuse to answer when nothing looks like a leaf, or when the image is blurred.',
  'Control the lighting, which matters more than the model does.',
  'Collect your own photographs and fine-tune, which is what turns a demonstration into something useful.'
],

how: `
<p><strong>Domain shift, which is the whole lesson.</strong> Every PlantVillage image is a single detached leaf,
photographed flat, on a plain background, in even studio light. Your greenhouse has overlapping leaves, dappled
sun, shadows, soil, other plants, and leaves at angles.</p>
<p>The model has not learned "what leaf rust looks like". It has learned "what leaf rust looks like in this
specific photographic setup". Change the setup and the learned features stop applying. That is domain shift,
and it is why published accuracy figures are close to meaningless out of context.</p>
<p>Two responses, and you want both:</p>
<ul>
  <li><strong>Move your world towards the dataset.</strong> A fixed distance, a plain background, and your own
  controlled light. This is cheating, and it works extremely well.</li>
  <li><strong>Move the model towards your world.</strong> Fine-tune on a few hundred of your own photographs,
  taken exactly as the device will take them.</li>
</ul>

<p><strong>Lighting is the highest-value component in the build.</strong> A diffused white LED ring at a fixed
distance removes the single largest source of variation. Colour temperature matters: disease classification
depends heavily on hue, and a leaf under warm light looks yellower - which is exactly the symptom the model is
trained to detect. Use a neutral 5000&nbsp;K source, always on, so ambient light is swamped rather than
competing.</p>

<p><strong>Focus is not automatic and macro is hard.</strong> Most small camera modules focus at half a metre
and beyond. A leaf at 15&nbsp;cm will be soft, and the fine texture that distinguishes early blight from late
blight is exactly what softness destroys. Many modules have a lens you can unscrew a fraction of a turn to move
the focal plane closer - do that, on a test image, before training anything.</p>

<p><strong>Show three answers, not one.</strong> A single label invites belief. Three labels with confidences
tells the truth: when the model reports 34%, 31% and 29%, it does not know, and showing that is far more useful
than showing "Tomato Early Blight" in confident letters.</p>

<p><strong>And it needs a "not a leaf" class.</strong> Point it at a hand, a table, or an empty frame and a
38-class model will still return one of its 38 classes, sometimes with high confidence. The
<a href="project.html?p=jetson-bird-classifier">bird classifier</a> hits exactly the same problem. The answer
is the same: add a class of negatives, and threshold.</p>

<p><strong>What it is for.</strong> Triage, not diagnosis. It is good at "something is wrong with this plant,
and it looks fungal" and bad at distinguishing two closely related fungi. Treat it as a prompt to look
closer.</p>`,

bom: [
  { id: 'uno-q', qty: 1, note: 'Runs the classifier on its Linux side and the lighting on its microcontroller side. A good fit for exactly this shape of project.' },
  { id: 'usb-cam', qty: 1, note: 'A webcam you can unscrew the lens on. Check this before buying if you can - the fixed-focus sealed ones cannot be made to focus at 15 cm.' },
  { id: 'ws2812-ring', qty: 1, note: 'The lighting, and the most important part in the list. Diffused, neutral white, at a fixed distance.' },
  { id: 'diffuser', qty: 1, note: 'Over the ring. Bare LEDs produce specular highlights on a waxy leaf that hide the texture underneath.' },
  { id: 'res220', qty: 1, note: 'On the WS2812 data line.' },
  { id: 'cap1000', qty: 1, note: 'Across the ring power.' },
  { id: 'button', qty: 1, note: 'Capture trigger. A physical button is better than a screen tap when you have a leaf in the other hand.' },
  { id: 'oled13', qty: 1, note: 'Shows the top three guesses at the device, so you do not need a screen nearby.' },
  { id: 'psu5v3a', qty: 1 },
  { id: 'tripod', qty: 1, note: 'To hold the camera at a fixed distance. Fixed is the operative word - varying distance is varying scale, and that is more domain shift.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }],

build: {
  parts: [
    { id: 'mcu',  comp: 'unoq',       at: [0, 74] },
    { id: 'cam',  comp: 'webcam',     at: [64, 74] },
    { id: 'bb',   comp: 'bb400',      at: [0, 8] },
    { id: 'ring', comp: 'ws2812ring', at: [-52, -54] },
    { id: 'oled', comp: 'oled13',     at: [30, -54] },
    { id: 'btn',  comp: 'button',     at: [70, -20] }
  ],
  wires: [
    { from: 'mcu.5V',   to: 'bb.T+1',  color: 'red',    note: '5 V rail for the ring' },
    { from: 'mcu.GND1', to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'cam.USB',  to: 'mcu.USB', color: 'white',  note: 'Camera to the Linux side over USB' },
    { from: 'ring.5V',  to: 'bb.T+6',  color: 'red',    note: 'Ring power, with the 1000 uF across the rail here' },
    { from: 'ring.GND', to: 'bb.T-6',  color: 'black',  note: 'Ring ground' },
    { from: 'ring.DI',  to: 'bb.e12',  color: 'green',  note: 'Data line, through the 220 ohm resistor' },
    { from: 'bb.a12',   to: 'mcu.D6',  color: 'green',  note: 'Resistor to the microcontroller pin' },
    { from: 'oled.VCC', to: 'bb.T+18', color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-18', color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.SDA', color: 'blue',   note: 'I2C data' },
    { from: 'oled.SCL', to: 'mcu.SCL', color: 'yellow', note: 'I2C clock' },
    { from: 'btn.1A',   to: 'mcu.D7',  color: 'orange', note: 'Capture button, internal pull-up' },
    { from: 'btn.2A',   to: 'bb.T-24', color: 'black',  note: 'Button to ground' }
  ]
},

wireIntro: `<p>The camera goes to the Linux side over USB; the lighting, button and display hang off the
microcontroller side. That split is what the UNO Q is for.</p>`,

wireNotes: `
<div class="note tip"><span class="t">Fix the geometry and never change it</span>
<p>Camera distance, light distance and background all need to be constant. Every one of them that varies is
another axis your model has to be robust to, and it cannot be robust to axes it never saw in training.</p>
<p>Build the whole thing into one rigid jig. This sounds like a mechanical detail and it is the most
important decision in the project.</p></div>

<div class="note warn"><span class="t">Diffuse the light</span>
<p>A leaf is waxy. Bare LEDs give hard specular highlights - bright white patches that hide the exact texture
the classifier needs. A sheet of diffuser, or even baking parchment, over the ring makes a visible difference to
accuracy.</p></div>

<div class="note"><span class="t">Neutral white, not warm</span>
<p>Disease symptoms are largely colour. Warm light shifts everything yellow, which is what chlorosis looks
like, so a warm-lit healthy leaf can be classified as a deficient one. Use neutral white and set a fixed white
balance in the capture code.</p></div>`,

solderIntro: `<p>Light soldering: headers, the resistor and capacitor for the LED ring, and flying leads to the
button and display.</p>`,

solderSteps: [
  { h: 'The ring, with its resistor and capacitor',
    body: `<p>220&nbsp;ohm in series with the data line, physically at the ring end. 1000&nbsp;uF across the
    power right at the ring. Both protect the first LED, which is the one that fails on a WS2812 strip.</p>` },
  { h: 'Diffuser over the ring',
    body: `<p>Cut the diffuser slightly larger than the ring and stand it 5-10&nbsp;mm off the LEDs. Touching
    the LEDs does not diffuse much; a small air gap does.</p>` },
  { h: 'Build the jig',
    body: `<p>Camera looking straight down, ring around it, plain matte background below at a fixed distance,
    leaf goes on the background. Matte mid-grey is a better background than white - white clips and forces the
    exposure down, darkening the leaf.</p>` },
  { h: 'Focus the lens on a test target',
    body: `<p>Put something with fine detail at leaf distance, take a frame, look at it full size. Unscrew the
    lens a fraction, repeat. When the texture is crisp, secure the lens with a spot of glue - it will drift
    otherwise.</p>
    <p>Do this before collecting a single training photograph.</p>` }
],

libraries: [
  { name: 'TensorFlow Lite Runtime', by: 'Google', why: 'Runs the quantised classifier on the UNO Q’s Linux side. Install with pip.' },
  { name: 'OpenCV (python3-opencv)', by: 'apt', why: 'Camera capture, white balance and the blur check.' },
  { name: 'Adafruit NeoPixel', by: 'Adafruit', why: 'The lighting ring, on the microcontroller side.' }
],

code: [{
  name: 'plant_doctor.py',
  code: `#!/usr/bin/env python3
"""Leaf disease classifier for the Arduino UNO Q.

Captures a frame, checks it is worth classifying at all, then reports the
top three classes rather than one confident-looking answer.
"""
import cv2
import numpy as np
import tflite_runtime.interpreter as tflite

MODEL  = "plant_model_int8.tflite"
LABELS = [l.strip() for l in open("labels.txt")]

# Below this, say "not sure" instead of naming a disease. A 38-class model
# always returns one of its 38 classes, including for a photograph of your
# hand - see the write-up on open-set problems.
MIN_CONFIDENCE = 0.55
MIN_SHARPNESS  = 120.0

interpreter = tflite.Interpreter(model_path=MODEL, num_threads=2)
interpreter.allocate_tensors()
inp = interpreter.get_input_details()[0]
out = interpreter.get_output_details()[0]
SIZE = inp["shape"][1]


def open_camera():
    cam = cv2.VideoCapture(0)
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    # Fixed white balance and exposure. Auto white balance is the enemy
    # here: it will "correct" the yellowing that is the actual symptom.
    cam.set(cv2.CAP_PROP_AUTO_WB, 0)
    cam.set(cv2.CAP_PROP_AUTO_EXPOSURE, 0.25)
    cam.set(cv2.CAP_PROP_EXPOSURE, -6)
    return cam


def sharpness(bgr):
    """Variance of the Laplacian. Low means blurred, and a blurred leaf
    loses exactly the fine texture the classifier depends on."""
    grey = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(grey, cv2.CV_64F).var()


def looks_like_a_leaf(bgr):
    """Cheap green-fraction check. Not clever, but it catches the common
    case of classifying a hand or an empty background with confidence."""
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    green = cv2.inRange(hsv, (25, 40, 40), (95, 255, 255))
    return (green > 0).mean() > 0.15


def classify(bgr):
    img = cv2.resize(bgr, (SIZE, SIZE))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    if inp["dtype"] == np.int8:
        scale, zero = inp["quantization"]
        x = (img.astype(np.float32) / 255.0 / scale + zero).astype(np.int8)
    else:
        x = (img.astype(np.float32) / 255.0)

    interpreter.set_tensor(inp["index"], x[None, ...])
    interpreter.invoke()
    y = interpreter.get_tensor(out["index"])[0]

    if out["dtype"] == np.int8:
        scale, zero = out["quantization"]
        y = (y.astype(np.float32) - zero) * scale

    return y


def top_three(scores):
    order = np.argsort(scores)[::-1][:3]
    return [(LABELS[i], float(scores[i])) for i in order]


def main():
    cam = open_camera()
    print("Ready. Press Enter to capture, Ctrl-C to stop.")

    while True:
        input()
        # Throw away a few frames so exposure has settled on the leaf.
        for _ in range(5):
            ok, frame = cam.read()
        if not ok:
            print("camera read failed")
            continue

        # Centre crop to the jig area - the model never saw backgrounds.
        h, w = frame.shape[:2]
        s = min(h, w)
        frame = frame[(h - s) // 2:(h + s) // 2, (w - s) // 2:(w + s) // 2]

        sharp = sharpness(frame)
        if sharp < MIN_SHARPNESS:
            print(f"too blurred ({sharp:.0f}) - check focus and hold still")
            continue

        if not looks_like_a_leaf(frame):
            print("that does not look like a leaf")
            continue

        results = top_three(classify(frame))
        best, conf = results[0]

        if conf < MIN_CONFIDENCE:
            print(f"not sure - best guess {best} at {conf:.0%}")
        else:
            print(f"{best}  {conf:.0%}")

        # Always show the runners-up. When the top three are 34/31/29 the
        # model is guessing, and the reader deserves to see that.
        for label, score in results[1:]:
            print(f"    also: {label}  {score:.0%}")

        cv2.imwrite("last_capture.jpg", frame)


if __name__ == "__main__":
    main()`
}],

trouble: [
  { q: 'It scores 99% in testing and is wrong on real leaves',
    a: `Domain shift, exactly as described above. Your test set is from the same studio-lit dataset as your
    training set, so it measures nothing about your greenhouse. Photograph 200 leaves with your own rig, label
    them, and test on those.` },
  { q: 'Everything is classified as the same disease',
    a: `Usually a colour cast. Check auto white balance is off and the light is neutral. A consistent yellow
    cast pushes everything towards the deficiency classes.` },
  { q: 'Images look fine on screen but classify badly',
    a: `Look at them at full size, not thumbnail. Softness that is invisible at 200 pixels destroys the leaf
    texture the model uses. Unscrew the lens a fraction and re-check.` },
  { q: 'Confident answers for things that are not leaves',
    a: `The model has no "not a leaf" class, so it must return one of the ones it has. The green-fraction
    check in the sketch is a crude guard; a proper negatives class in training is the real fix.` },
  { q: 'Very slow inference',
    a: `Running a float model. Quantise to int8 - typically three to four times faster on this class of
    hardware for a fraction of a percent of accuracy.` },
  { q: 'Results change depending on time of day',
    a: `Ambient light is competing with your ring. Shield the jig, or brighten the ring so ambient is a small
    fraction of the total.` },
  { q: 'Camera opens but frames are black',
    a: `Auto exposure was disabled before the camera was ready. Set the properties, then read and discard
    several frames, as the sketch does.` }
],

next: `
<ul>
  <li><strong>Fine-tune on your own photographs.</strong> Two hundred images from your rig will beat 54,000
  studio images from someone else's. This is the single highest-value improvement and it is the whole point of
  the project.</li>
  <li><strong>Log every capture with its prediction</strong> and go back through them at the end of a season.
  You will find out what it is genuinely good at, which is rarely what you expected.</li>
  <li><strong>Segment the leaf first</strong> - mask out the background before classifying and accuracy on
  cluttered scenes improves a lot.</li>
  <li><strong>Watch one plant over time</strong> rather than classifying single leaves. A daily photograph from
  a fixed camera turns a hard classification problem into an easy change-detection one.</li>
  <li><strong>Pair it with the <a href="project.html?p=automatic-plant-waterer">plant waterer</a></strong> so
  the thing that spots a problem is the thing that can do something about it.</li>
</ul>`
});
