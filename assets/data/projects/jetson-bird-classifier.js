/* Training a model on the board itself: the only project here where the Jetson is the trainer, not the runner. */
AB.addProject({
slug: 'jetson-bird-classifier',
title: 'Bird feeder species classifier',
cat: 'ai',
level: 3,
time: '6 hours, plus weeks of collecting',
solder: true,
board: 'Jetson Orin Nano',
tags: ['jetson', 'transfer learning', 'training', 'classification', 'open set', 'class imbalance', 'wildlife', 'resnet'],
blurb: 'A camera on a bird feeder that learns your birds, from photographs it took itself. The only project in this book where the board trains the model as well as running it.',

skills: ['Transfer learning', 'Training on device', 'Class imbalance', 'Open-set recognition', 'Confidence thresholds', 'Dataset curation'],

intro: `
<p>Every other machine learning project here runs a model somebody else trained, or sends data to a service to
be trained. This one trains on the board. A Jetson has a real GPU, and fine-tuning a ResNet-18 on a few
hundred photographs takes about ten minutes - which changes the workflow completely, because you can retrain
over lunch when you notice it keeps mistaking a dunnock for a sparrow.</p>
<p>The subject is deliberately homely: a camera watching a bird feeder, classifying what lands. But it
contains three problems that every real classification project has and that the tutorials skip.</p>
<p><strong>Class imbalance</strong> - you will have 800 photographs of pigeons and eleven of the one you
actually wanted. <strong>Open set</strong> - a model trained on eight birds will confidently classify a
squirrel as a chaffinch, because "squirrel" is not an option it has. And <strong>dataset curation</strong>,
which is most of the work and none of the glamour.</p>`,

what: [
  'Photograph whatever lands on the feeder, automatically, for as long as you like.',
  'Fine-tune a classifier on your own labelled photographs, on the board, in about ten minutes.',
  'Recognise the species that actually visit your garden, rather than a generic bird list.',
  'Refuse to guess when it is not sure, which is what makes it trustworthy rather than amusing.',
  'Handle the fact that 80% of your data is one common species.',
  'Log every visit with a timestamp, and produce a chart of who comes when.'
],

how: `
<p><strong>Transfer learning, and why ten minutes is enough.</strong> A ResNet-18 pre-trained on ImageNet
already knows about edges, textures, feathers and beaks - the first layers of any vision model learn
general-purpose features.</p>
<p>Fine-tuning replaces only the final classification layer and adjusts the rest gently. You are not teaching
it to see; you are teaching it which of your eight birds it is looking at. Three hundred images per class and
ten epochs is often enough, and on this board that is minutes rather than hours.</p>

<p><strong>Open set, which is the problem nobody mentions.</strong> A classifier trained on eight species
outputs a probability distribution over exactly those eight. Show it a squirrel and the probabilities still
sum to 1 - it will pick whichever bird the squirrel resembles most, often with high confidence.</p>
<p>Two defences, and you want both:</p>
<ul>
  <li><strong>A "nothing" class</strong>, trained on empty feeder shots, squirrels, cats, leaves blowing past
  and whatever else the camera catches. This is the single most effective thing and it costs only the effort
  of labelling images you already have.</li>
  <li><strong>A confidence threshold.</strong> Below about 0.75, record it as "unknown" and save the image
  for labelling rather than asserting a species.</li>
</ul>
<p>An "unknown" bucket that fills up is not a failure - it is your next training set, and it is exactly the
images the model finds hard.</p>

<p><strong>Class imbalance, which will be severe.</strong> A British garden feeder produces something like 60%
one or two common species, 30% a handful of regulars, and 10% everything else. Train naively on that and the
model learns that guessing "blue tit" is right most of the time - which is true and useless.</p>
<p>Three fixes, in order of how much they help:</p>
<ul>
  <li><strong>Cap each class</strong> at roughly the size of your third-largest. Throwing away 500 pigeon
  photos feels wasteful and improves the model.</li>
  <li><strong>Weight the loss</strong> inversely to class frequency, so a mistake on a rare species costs
  more.</li>
  <li><strong>Augment the rare classes harder</strong> - flips, crops, colour jitter - to get more variety from
  fewer originals.</li>
</ul>
<p>And judge the result on <strong>per-class accuracy</strong>, never on the overall figure. A model that is
92% accurate overall and 0% on the two rare species is worse than one at 80% that gets all eight.</p>

<p><strong>Capture is a motion problem, not an AI one.</strong> Running a classifier on every frame all day is
wasteful and produces thousands of empty-feeder images. Frame differencing - comparing each frame to a running
background - costs almost nothing and fires only when something lands.</p>
<p>A PIR is unreliable here: birds are small, feathers insulate, and a PIR pointed at a feeder mostly detects
sunlight moving. Frame differencing on the camera you already have works far better.</p>`,

bom: [
  { id: 'jetson-orin', qty: 1, note: 'The Super kit. Training is what the GPU is for here - this is the only project in the book where the board fine-tunes a model.' },
  { id: 'nvme', qty: 1, note: 'Strongly recommended. A dataset of tens of thousands of images plus training checkpoints fills a microSD and wears it out.' },
  { id: 'csi-cam', qty: 1, note: 'IMX219 on a ribbon, through the hardware ISP - better image at no CPU cost. A USB webcam works too and extends much further from the board, which matters if the feeder is not next to the Jetson.' },
  { id: 'ws2812-strip', qty: 1, as: 'WS2812B strip, 8 LEDs', note: 'Diffused white illumination for dawn and dusk, which is when birds feed. Warm white and dim - see the notes about not disturbing them.' },
  { id: 'uno', qty: 1, note: 'Drives the strip and reads the light sensor. Same split as the other Jetson projects.' },
  { id: 'usb-cable', qty: 1 },
  { id: 'ldr', qty: 1, note: 'Ambient light, so the illumination only comes on when it is genuinely needed.' },
  { id: 'res10k', qty: 1, note: 'LDR divider.' },
  { id: 'res220', qty: 1, note: 'WS2812 data line, at the strip.' },
  { id: 'cap1000', qty: 1, note: 'Across the strip power.' },
  { id: 'box-ip65', qty: 1, note: 'The camera end lives outdoors. Vents underneath, lens through a sealed hole rather than behind a window.' },
  { id: 'tripod', qty: 1, note: 'Or a post clamp. The camera must be fixed and about a metre from the feeder.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'jet',   comp: 'jetson',      at: [0, 56] },
    { id: 'cam',   comp: 'csicam',      at: [-54, -44] },
    { id: 'uno',   comp: 'uno',         at: [44, -46] },
    { id: 'bb',    comp: 'bb400',       at: [-10, -100] },
    { id: 'strip', comp: 'ws2812strip', at: [44, -140] },
    { id: 'ldr',   comp: 'ldr',         at: [-52, -102] }
  ],
  wires: [
    { from: 'cam.RIBBON', to: 'jet.CSI0',  color: 'white',  note: 'CSI ribbon, contacts facing the board. Power off before touching it' },
    { from: 'jet.USB',    to: 'uno.USB',   color: 'white',  note: 'USB to the Uno - the only link. The 40-pin header is 3.3 V and not 5 V tolerant' },
    { from: 'uno.5V',     to: 'bb.T+2',    color: 'red',    note: '5 V rail' },
    { from: 'uno.GND1',   to: 'bb.T-2',    color: 'black',  note: 'Ground rail' },
    { from: 'uno.D6',     to: 'strip.DIN', color: 'blue',   note: 'WS2812 data, through 220 ohm at the strip' },
    { from: 'strip.5V',   to: 'bb.T+8',    color: 'red',    note: 'Strip power. Eight LEDs at the low brightness this uses is well under an amp' },
    { from: 'strip.GND',  to: 'bb.T-8',    color: 'black',  note: 'Strip ground, common with the Uno' },
    { from: 'ldr.A',      to: 'bb.T+14',   color: 'red',    note: 'LDR to 5 V' },
    { from: 'ldr.B',      to: 'uno.A0',    color: 'green',  note: 'LDR divider midpoint, with 10 k to ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">The lighting must not disturb the birds</span>
<p>This is the one welfare consideration in the project and it is easy to get wrong.</p>
<ul>
  <li><strong>Warm white, heavily diffused, and dim.</strong> Bright white LEDs at close range will keep birds
  off the feeder entirely, which defeats the project.</li>
  <li><strong>Never strobe or flash.</strong> Steady light only.</li>
  <li><strong>Off at night.</strong> Lighting a feeder after dark disrupts roosting and can attract predators
  to a lit, visible bird. The LDR threshold should bring it on at dusk and dawn, not keep it on all
  night.</li>
  <li><strong>Infrared is the better answer</strong> if you want night coverage - 850&nbsp;nm LEDs and a
  camera with the IR filter removed. Birds see less of it, though not none.</li>
</ul>
<p>If the birds stop coming, the light is too bright. That is the feedback signal.</p></div>

<div class="note danger"><span class="t">CSI ribbon: power off, contacts towards the board</span>
<p>Same as the <a href="project.html?p=jetson-orin-vision">vision project</a>. The connector latch hinges, it
does not pull out, and it snaps if forced. A ribbon inserted with power on can short the CSI lanes, which is
not repairable.</p>
<p>Strain-relieve it where it leaves the connector - this one lives outdoors and will get knocked.</p></div>

<div class="note warn"><span class="t">Lens through a hole, not behind a window</span>
<p>A clear window in front of the lens causes reflections from the illumination and fogs on the inside on the
first cold morning.</p>
<p>Drill a hole the diameter of the lens barrel, let the lens sit just proud, and seal round it with silicone.
Angle the whole box down slightly so rain runs off rather than sitting on the glass.</p></div>

<div class="note warn"><span class="t">Fix the camera, and fix the framing</span>
<p>About a metre from the feeder, filling the frame with the perch and a little around it. Then do not move
it.</p>
<p>A model trained on images from one framing degrades when the framing changes - and you will be training on
months of images, so a camera that shifts in March invalidates the data from February.</p>
<p>Photograph the setup so you can restore it after maintenance.</p></div>`,

solderSteps: [
  { h: 'The usual WS2812 essentials',
    body: `<p>220&nbsp;&Omega; in the data line at the strip end, 1000&nbsp;uF across the strip's power, and a
    ground common with the Uno. Eight LEDs at the brightness this uses draws very little, so the Uno's 5&nbsp;V
    is adequate.</p>
    <p>Diffuse it properly - a strip of translucent acrylic or even baking paper. A bare LED strip produces
    hard shadows that make the images harder to classify, quite apart from the birds.</p>` },
  { h: 'LDR divider',
    body: `<p>LDR from 5&nbsp;V to A0, 10&nbsp;k from A0 to ground. Mount the LDR facing the same way as the
    camera and shielded from the illumination itself, or you build a feedback loop that oscillates at
    dusk.</p>` },
  { h: 'Box the camera end properly',
    body: `<p>Lens through a sealed hole, vents on the underside only, cable gland for the ribbon or USB lead,
    and a drip loop.</p>
    <p>The Jetson should be indoors or in a separate, larger enclosure - it is not a small board and it needs
    airflow.</p>` }
],

assembly: [
  { h: 'Start capturing before you write any model code',
    body: `<p>This is the right order and people get it backwards. Set the camera up, run the capture script,
    and leave it for <strong>a week at least</strong>.</p>
    <p>You cannot train without data and you cannot shortcut collecting it. A week of a busy feeder is a few
    thousand images; a fortnight is better.</p>
    <p>While it runs, watch the capture rate. Hundreds of images an hour with no birds means the motion
    threshold is too sensitive - usually it is catching moving shadows.</p>` },
  { h: 'Sort the images by hand, which is most of the work',
    body: `<p>One folder per species, plus a <code>nothing</code> folder. Copy images in. There is no way round
    this and it is a few hours for the first pass.</p>
    <p>Two pieces of advice that save real time: <strong>be ruthless</strong> - delete blurred, half-cropped
    and ambiguous images rather than guessing, because a mislabelled image is worse than no image. And
    <strong>put plenty into "nothing"</strong> - empty feeder, squirrels, cats, leaves, rain. That folder is
    what stops the model confidently identifying a squirrel as a greenfinch.</p>` },
  { h: 'Look at what you have collected, honestly',
    body: `<p>Count the images per class. You will find something like 800 of one species and 11 of another.</p>
    <p>Any class under about 50 images is not trainable - either keep collecting, or merge it into "nothing"
    for now and add it later. Trying to train on 11 examples produces a model that has memorised those 11.</p>` },
  { h: 'Train, and watch per-class accuracy',
    body: `<p>Ten epochs on a ResNet-18 takes about ten minutes on this board. Ultralytics or a short PyTorch
    script both work.</p>
    <p>Read the <strong>per-class</strong> figures and the confusion matrix, not the overall accuracy. 92%
    overall with 0% on two classes is a worse model than 80% that gets all of them.</p>
    <p>The confusion matrix also tells you which pairs it mixes up - usually two genuinely similar species, and
    usually the answer is more images of both.</p>` },
  { h: 'Test the open-set case deliberately',
    body: `<p>Show it something it has never seen - a photograph of a parrot, your hand, a squirrel if you have
    one.</p>
    <p>Without a "nothing" class and a threshold it will name a species with 90% confidence. With them it
    should say unknown. That difference is what makes the log trustworthy.</p>` },
  { h: 'Set the confidence threshold from the data',
    body: `<p>Run the model over your validation set and look at the confidence distribution for correct and
    incorrect predictions. Pick a threshold that keeps most of the correct ones and rejects most of the
    wrong.</p>
    <p>0.75 is a reasonable start. Higher means more "unknown" and fewer wrong species in the log, which for a
    wildlife record is the right direction to err.</p>` },
  { h: 'Deploy, and keep the unknowns',
    body: `<p>Run it live, logging every visit. Every image below the threshold goes into an
    <code>unknown/</code> folder.</p>
    <p>That folder is your next training set and it contains exactly the images the model finds hard. Retrain
    monthly and the thing genuinely improves - which is the payoff for the board being able to train.</p>` },
  { h: 'Chart it',
    body: `<p>Species against time of day, and against the month. The patterns are real and interesting: who
    comes at first light, who arrives only in cold weather, which species avoid each other.</p>
    <p>That chart is the actual product of the project, and it is a thing no bought camera will give you for
    your garden specifically.</p>` }
],

libraries: [
  { name: 'PyTorch / torchvision', by: 'Meta', how: 'NVIDIA Jetson wheel - not the pip default', why: 'Training and the pre-trained ResNet-18. Install NVIDIA\'s build, or you get a CPU-only PyTorch that works thirty times slower with no error.' },
  { name: 'Ultralytics', by: 'Ultralytics', how: 'pip3 install ultralytics', why: 'An easier training path - yolo classify train - if you would rather not write the loop. Note the AGPL licence.' },
  { name: 'OpenCV', by: 'OpenCV', how: 'Part of JetPack', why: 'Capture, frame differencing and cropping.' },
  { name: 'pyserial', by: 'pySerial', why: 'The link to the Uno for the lighting.' }
],

code: [
{
  h: 'Step 1: capture, for a week before anything else',
  intro: `<p>Frame differencing, not a PIR. Cheap, reliable on small warm objects, and it works on the camera
  you already have.</p>`,
  name: 'capture.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Motion-triggered capture for the feeder.

Frame differencing against a slowly-updating background. A PIR is
poor here - birds are small, feathers insulate well, and a PIR aimed
at a feeder mostly detects sunlight moving across it.
"""

import os
import time
import cv2
import numpy as np
import serial

OUT_DIR = "/var/lib/feeder/raw"
UNO_DEV = "/dev/ttyACM0"

# The crop the bird actually appears in. Frame it once and leave it -
# a model trained on one framing degrades when the framing changes.
CROP = (160, 80, 1120, 800)          # x0, y0, x1, y1

MIN_AREA = 1200                      # pixels of change to count as a visitor
COOLDOWN_S = 1.5                     # do not save 30 shots of one landing
BURST = 3                            # frames per visit - posture varies

"""How fast the background forgets. Slow enough that a bird sitting
still for ten seconds does not become part of the background; fast
enough to follow the sun moving across the morning."""
BG_ALPHA = 0.02


def csi_pipeline(w=1280, h=800, fps=15):
    return (f"nvarguscamerasrc sensor-id=0 ! "
            f"video/x-raw(memory:NVMM),width={w},height={h},"
            f"format=NV12,framerate={fps}/1 ! "
            f"nvvidconv ! video/x-raw,format=BGRx ! "
            f"videoconvert ! video/x-raw,format=BGR ! "
            f"appsink drop=true max-buffers=1")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    try:
        uno = serial.Serial(UNO_DEV, 115200, timeout=0.1)
        time.sleep(2)
    except serial.SerialException:
        uno = None
        print("no Uno - no illumination control")

    cap = cv2.VideoCapture(csi_pipeline(), cv2.CAP_GSTREAMER)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0, cv2.CAP_V4L2)      # fall back to USB
    if not cap.isOpened():
        raise SystemExit("no camera")

    x0, y0, x1, y1 = CROP
    bg = None
    last_save = 0
    saved = 0

    print("capturing - leave this running for at least a week")

    while True:
        ok, frame = cap.read()
        if not ok:
            time.sleep(0.05)
            continue

        crop = frame[y0:y1, x0:x1]
        grey = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        grey = cv2.GaussianBlur(grey, (21, 21), 0)

        if bg is None:
            bg = grey.astype(np.float32)
            continue

        diff = cv2.absdiff(grey, cv2.convertScaleAbs(bg))
        thresh = cv2.threshold(diff, 22, 255, cv2.THRESH_BINARY)[1]
        thresh = cv2.dilate(thresh, None, iterations=2)
        changed = int(np.count_nonzero(thresh))

        # Update the background ALWAYS, including during a visit. A
        # bird that sits for a minute then becomes background and its
        # departure triggers instead - which is fine, and much better
        # than a background that freezes and drifts away from reality.
        cv2.accumulateWeighted(grey, bg, BG_ALPHA)

        if changed > MIN_AREA and time.time() - last_save > COOLDOWN_S:
            last_save = time.time()
            stamp = time.strftime("%Y%m%d-%H%M%S")

            # A short burst - a bird's posture changes a lot in a
            # second and one frame is often the back of its head.
            for i in range(BURST):
                ok, f2 = cap.read()
                if ok:
                    cv2.imwrite(f"{OUT_DIR}/{stamp}-{i}.jpg",
                                f2[y0:y1, x0:x1],
                                [cv2.IMWRITE_JPEG_QUALITY, 92])
                    saved += 1
                time.sleep(0.25)

            print(f"  {stamp}  {changed} px changed  ({saved} saved)")

        # Illumination, from the Uno's light sensor. The Uno decides -
        # it has the LDR - and we just ask it to be ready.
        if uno and int(time.time()) % 30 == 0:
            uno.write(b"L\\n")

        time.sleep(0.05)


if __name__ == "__main__":
    main()`,
  after: `<p><strong>Updating the background during a visit</strong> is deliberate and slightly counter-intuitive.
  A bird that settles for a minute becomes part of the background, and then its <em>departure</em> triggers a
  capture. That is fine. The alternative - freezing the background while motion is detected - means a single
  long visit freezes it for a minute, during which the sun moves, and everything afterwards triggers.</p>
  <p><strong>Three frames per visit</strong> because a bird's posture changes enormously in a second, and a
  single frame is frequently the back of its head. It also triples your dataset for free.</p>`
},
{
  h: 'Step 2: train, on the board',
  intro: `<p>Ten minutes on this GPU. The class balancing and the per-class reporting are the parts that
  matter - the training loop itself is boilerplate.</p>`,
  name: 'train.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Fine-tune a ResNet-18 on your own labelled feeder photographs.

Expects:  dataset/<species>/*.jpg
          dataset/nothing/*.jpg      <- empty feeder, squirrels, leaves

The "nothing" class is not optional. Without it the model must assign
every image to a bird, and a squirrel becomes a confident chaffinch.
"""

import os
import random
from collections import Counter

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, transforms, models

DATA = "dataset"
EPOCHS = 10
BATCH = 32
LR = 3e-4

"""Cap each class at this many images. Throwing away 500 pigeon
photographs feels wasteful and makes the model better - otherwise it
learns that guessing the common species is right most of the time,
which is true and useless."""
MAX_PER_CLASS = 400

device = "cuda" if torch.cuda.is_available() else "cpu"
if device == "cpu":
    print("WARNING: no CUDA. You have a CPU-only PyTorch - install")
    print("NVIDIA's Jetson wheel or this will take hours, not minutes.")

# --- augmentation ------------------------------------------------------
# Applied to training images only. Flips and crops give the rare
# classes more variety from fewer originals. No vertical flip - birds
# are not upside down, and teaching the model they might be wastes
# capacity.
train_tf = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
    transforms.RandomRotation(12),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

val_tf = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

full = datasets.ImageFolder(DATA, transform=train_tf)
classes = full.classes
print(f"classes: {classes}")

counts = Counter(y for _, y in full.samples)
for i, c in enumerate(classes):
    flag = "  <-- too few to train" if counts[i] < 50 else ""
    print(f"  {c:20s} {counts[i]:5d}{flag}")

# --- cap the common classes -------------------------------------------
by_class = {}
for path, y in full.samples:
    by_class.setdefault(y, []).append((path, y))

capped = []
for y, items in by_class.items():
    random.shuffle(items)
    capped.extend(items[:MAX_PER_CLASS])
full.samples = capped
full.targets = [y for _, y in capped]
print(f"after capping: {len(capped)} images")

# --- split -------------------------------------------------------------
n_val = int(len(full) * 0.2)
train_set, val_set = torch.utils.data.random_split(
    full, [len(full) - n_val, n_val],
    generator=torch.Generator().manual_seed(42))
val_set.dataset.transform = val_tf      # no augmentation on validation

"""Sample rare classes more often. Capping alone is not enough when
one class has 400 and another has 60 - this makes each batch roughly
balanced without duplicating files on disk."""
train_counts = Counter(full.targets[i] for i in train_set.indices)
weights = [1.0 / train_counts[full.targets[i]] for i in train_set.indices]
sampler = WeightedRandomSampler(weights, len(weights), replacement=True)

train_loader = DataLoader(train_set, batch_size=BATCH, sampler=sampler,
                          num_workers=4, pin_memory=True)
val_loader = DataLoader(val_set, batch_size=BATCH, shuffle=False,
                        num_workers=4, pin_memory=True)

# --- the model ---------------------------------------------------------
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
model.fc = nn.Linear(model.fc.in_features, len(classes))
model = model.to(device)

# Loss weighted inversely to frequency as well, so a mistake on a rare
# species costs more than one on a pigeon.
cw = torch.tensor([len(capped) / (len(classes) * max(counts[i], 1))
                   for i in range(len(classes))], dtype=torch.float32)
criterion = nn.CrossEntropyLoss(weight=cw.to(device), label_smoothing=0.05)
optimiser = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(optimiser, EPOCHS)

for epoch in range(EPOCHS):
    model.train()
    for x, y in train_loader:
        x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
        optimiser.zero_grad()
        loss = criterion(model(x), y)
        loss.backward()
        optimiser.step()
    sched.step()

    # --- per-class accuracy, which is the number that matters --------
    model.eval()
    correct = Counter()
    total = Counter()
    with torch.no_grad():
        for x, y in val_loader:
            pred = model(x.to(device)).argmax(1).cpu()
            for t, p in zip(y, pred):
                total[int(t)] += 1
                if t == p:
                    correct[int(t)] += 1

    overall = sum(correct.values()) / max(sum(total.values()), 1)
    print(f"\\nepoch {epoch+1}/{EPOCHS}  overall {overall:.3f}")
    for i, c in enumerate(classes):
        if total[i]:
            print(f"   {c:20s} {correct[i]/total[i]:.3f}  ({total[i]})")

torch.save({"state": model.state_dict(), "classes": classes},
           "feeder_model.pt")
print("\\nsaved feeder_model.pt")
print("Judge this on the PER-CLASS figures. 92% overall with 0% on two")
print("species is a worse model than 80% that gets all of them.")`,
  after: `<p><strong>Judge it on per-class accuracy.</strong> This is the single most important habit in the
  project. With a feeder dataset that is 60% one species, a model that always guesses that species scores 60%
  overall and is completely useless — and the overall figure will not tell you.</p>
  <p><strong>Three separate defences against imbalance</strong> — capping, a weighted sampler, and a weighted
  loss — because one is usually not enough at the ratios a real feeder produces. Capping is the one that helps
  most and the one that feels most wasteful.</p>
  <p><strong>No vertical flip</strong> in the augmentation. Birds are not upside down, and teaching the model
  they might be spends capacity on a case that never occurs.</p>`
},
{
  h: 'Step 3: run it, and keep what it cannot name',
  intro: `<p>The threshold and the unknown folder are what make the log worth trusting.</p>`,
  name: 'classify.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Live classification, with an honest "I do not know".

Every image below the confidence threshold is saved for labelling.
That folder becomes the next training set and contains exactly the
images the model finds hard.
"""

import csv
import os
import shutil
import time

import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms, models
import torch.nn as nn

WATCH = "/var/lib/feeder/raw"
UNKNOWN = "/var/lib/feeder/unknown"
LOG = "/var/lib/feeder/visits.csv"

"""Below this we record "unknown" rather than asserting a species.
Set it from the confidence distribution on your validation set - see
the assembly notes. Erring high is right for a wildlife record."""
THRESHOLD = 0.75

device = "cuda" if torch.cuda.is_available() else "cpu"

ckpt = torch.load("feeder_model.pt", map_location=device)
classes = ckpt["classes"]
model = models.resnet18()
model.fc = nn.Linear(model.fc.in_features, len(classes))
model.load_state_dict(ckpt["state"])
model.eval().to(device)

tf = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

os.makedirs(UNKNOWN, exist_ok=True)
if not os.path.exists(LOG):
    with open(LOG, "w", newline="") as f:
        csv.writer(f).writerow(["time", "species", "confidence", "file"])


def classify(path):
    img = Image.open(path).convert("RGB")
    x = tf(img).unsqueeze(0).to(device)
    with torch.no_grad():
        probs = F.softmax(model(x), dim=1)[0].cpu()
    idx = int(probs.argmax())
    return classes[idx], float(probs[idx]), probs


seen = set()
print(f"watching {WATCH}, threshold {THRESHOLD}")

while True:
    for name in sorted(os.listdir(WATCH)):
        if name in seen or not name.endswith(".jpg"):
            continue
        seen.add(name)
        path = os.path.join(WATCH, name)

        species, conf, probs = classify(path)

        """The 'nothing' class doing its job - an empty feeder, a
        squirrel, a leaf. Not a visit, and not worth logging."""
        if species == "nothing" and conf >= THRESHOLD:
            continue

        if conf < THRESHOLD:
            # Honest uncertainty. This folder is the next training set.
            shutil.copy(path, os.path.join(UNKNOWN, name))
            runner = sorted(zip(probs.tolist(), classes), reverse=True)[:2]
            print(f"  {name}  unknown "
                  f"(best {runner[0][1]} {runner[0][0]:.2f}, "
                  f"then {runner[1][1]} {runner[1][0]:.2f})")
            species, conf = "unknown", conf

        with open(LOG, "a", newline="") as f:
            csv.writer(f).writerow([
                time.strftime("%Y-%m-%d %H:%M:%S"),
                species, f"{conf:.3f}", name])

        if species != "unknown":
            print(f"  {name}  {species}  {conf:.2f}")

    time.sleep(2)`,
  after: `<p><strong>An unknown bucket that fills up is the project working, not failing.</strong> It contains
  precisely the images the model finds hard, which makes it far more valuable per image than another five
  hundred easy pigeons. Label it and retrain monthly.</p>
  <p><strong>Printing the runner-up</strong> when something is rejected is the most useful diagnostic here.
  "Unknown - best chaffinch 0.52, then greenfinch 0.41" tells you immediately that those two need more
  training data, which a bare "unknown" would not.</p>`
}],

upload: `
<p>All Python on the Jetson, plus a small sketch on the Uno for the lighting.</p>
<div class="note danger"><span class="t">Install NVIDIA's PyTorch, not the pip default</span>
<p><code>pip install torch</code> on a Jetson gives you a CPU-only build that works perfectly and trains
thirty times slower, with no error anywhere. This is the most common Jetson mistake and this is the project
where it costs the most.</p>
<p>Check <code>torch.cuda.is_available()</code> before training anything. The script warns, and it is worth
checking yourself.</p></div>
<div class="note warn"><span class="t">Collect for a week before you write any model code</span>
<p>There is no shortcut. A classifier is mostly a dataset, and a dataset is mostly waiting.</p></div>`,

tune: [
  { h: 'More data on the classes it confuses, not more epochs',
    body: `<p>The confusion matrix tells you which pairs it mixes up - usually two genuinely similar species.
    Twenty more good images of each will do more than twenty more epochs, which mostly overfit.</p>
    <p>This is the same lesson as the <a href="project.html?p=tinyml-gesture-nano">gesture project</a>, at a
    larger scale: data is the bottleneck.</p>` },
  { h: 'A bigger backbone, if you have the images',
    body: `<p>ResNet-50 or an EfficientNet is more accurate and slower to train. It also needs more data - with
    300 images per class a ResNet-18 is usually the better choice, because the bigger model just memorises.</p>
    <p>Move up when you have a couple of thousand per class, not before.</p>` },
  { h: 'Detect first, then classify',
    body: `<p>Running YOLO to find the bird and cropping tightly before classification is noticeably better
    than classifying the whole frame - the model stops learning about the feeder and starts learning about the
    bird.</p>
    <p>It also handles two birds at once, which the current version cannot.</p>` },
  { h: 'Infrared for night and dawn',
    body: `<p>850&nbsp;nm LEDs and a camera with the IR-cut filter removed gives you coverage without visible
    light. Birds perceive less of it, though not none.</p>
    <p>Your model will need retraining - infrared images look completely different and a model trained on
    daylight will not transfer.</p>` },
  { h: 'Contribute the data',
    body: `<p>eBird, BirdTrack and iNaturalist all take records. A feeder camera producing timestamped,
    verified species records is genuinely useful to them - with the emphasis on verified, which is what the
    confidence threshold buys you.</p>
    <p>Submit only what you have checked. A confident model is not a verified record.</p>` },
  { h: 'The same workflow for anything',
    body: `<p>Nothing here is about birds. Sorting components on a bench, checking a 3D print, identifying
    plants, watching a beehive entrance - it is the same capture, label, fine-tune, threshold loop.</p>
    <p>Being able to train on the board is what makes that loop fast enough to actually iterate on.</p>` }
],

trouble: [
  { q: 'Training takes hours',
    a: `CPU-only PyTorch. <code>torch.cuda.is_available()</code> will be False. Install NVIDIA's Jetson wheel.` },
  { q: 'It confidently names a squirrel as a bird',
    a: `No "nothing" class, or the threshold is too low. The nothing class is the more effective of the two
    and costs only labelling effort on images you already have.` },
  { q: '95% accurate and useless',
    a: `Look at per-class accuracy. With a 60/40 imbalance, always guessing the common species scores well
    overall. Cap the common classes and check the confusion matrix.` },
  { q: 'Everything comes back as unknown',
    a: `Threshold too high for a model this uncertain, or too few training images. Check the validation
    confidence distribution - if correct predictions are mostly around 0.5, the model needs more data rather
    than a lower threshold.` },
  { q: 'Thousands of images and no birds in any of them',
    a: `Motion threshold too sensitive - usually shadows moving. Raise <code>MIN_AREA</code>, and check the
    crop does not include a swaying branch or a patch of sky.` },
  { q: 'It misses birds entirely',
    a: `Threshold too high, or the crop is wrong. Save a debug frame with the threshold mask overlaid and
    watch what actually triggers.` },
  { q: 'The birds stopped coming after I added lights',
    a: `Too bright. Warm white, heavily diffused, dim, and off at night. If they do not return within a week,
    switch to infrared.` },
  { q: 'Accuracy dropped after I moved the camera',
    a: `Expected - the model learned your framing as well as your birds. Either restore the exact setup from
    the photograph you took, or retrain on images from the new position.` },
  { q: 'Out of memory during training',
    a: `Reduce <code>BATCH</code> to 16, and run headless. Training uses more memory than inference and it is
    all shared with the CPU on this board.` }
],

next: `
<ul>
  <li><strong>The board basics</strong> - <a href="project.html?p=jetson-orin-vision">real-time vision</a>
  covers JetPack, CSI cameras and TensorRT.</li>
  <li><strong>Detect before classifying</strong> - YOLO to crop the bird, then this model on the crop, is a
  clear improvement and reuses both projects.</li>
  <li><strong>Training on a microcontroller instead</strong> - the
  <a href="project.html?p=tinyml-gesture-nano">TinyML gesture project</a> is the same collect-label-train loop
  at a thousandth of the scale, and it trains in the cloud because the board cannot.</li>
  <li><strong>Somewhere with no network</strong> - the
  <a href="project.html?p=lte-camera-uploader">LTE camera</a> pattern gets images back from a feeder in a
  field.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">The birds come first</span>
<ul>
  <li><strong>Dim, warm, diffused light, and off at night.</strong> Lighting a feeder after dark disrupts
  roosting and makes a visible bird more vulnerable to predators. If they stop coming, the light is the
  cause.</li>
  <li><strong>Never strobe or flash.</strong></li>
  <li><strong>Keep the hardware away from the feeder itself</strong> - no wires a bird can reach, nothing to
  perch on that is not meant for perching, and no gaps a small bird could get into.</li>
  <li><strong>Clean the feeder regularly.</strong> Concentrating birds at a feeder spreads disease, most
  notably trichomonosis in finches. That is true of any feeder and a camera means you will notice a sick bird -
  if you do, take the feeder down for a fortnight and clean it thoroughly.</li>
</ul>
</div>
<div class="note warn"><span class="t">Outdoors, and pointed at a garden</span>
<ul>
  <li><strong>Vents on the underside only</strong>, lens through a sealed hole, drip loops on every cable.</li>
  <li><strong>The Jetson should be indoors</strong> or in its own larger, ventilated enclosure. It is not a
  small board and it needs airflow.</li>
  <li><strong>Frame it on your own garden.</strong> A camera that also covers a neighbour's property or a
  public path is a different object and is regulated as one in most countries.</li>
  <li><strong>The model will be confidently wrong sometimes.</strong> If you submit records to eBird or
  iNaturalist, verify them yourself - a high softmax value is not an identification.</li>
</ul>
</div>`
});
