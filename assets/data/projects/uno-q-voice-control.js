/* Arduino UNO Q: fully offline speech recognition on Linux, switching driven from the MCU. */
AB.addProject({
slug: 'uno-q-voice-control',
title: 'Offline voice control',
cat: 'ai',
level: 3,
time: '5 hours',
solder: true,
board: 'UNO Q',
tags: ['uno q', 'voice control', 'speech recognition', 'vosk', 'offline', 'python', 'dual brain', 'linux', 'wake word', 'privacy'],
blurb: 'Say "lights warm white" and it happens. Real speech recognition running entirely on the board - no Alexa, no account, no microphone feed leaving your house.',

skills: ['Offline speech recognition', 'Restricted grammars', 'Wake words', 'ALSA and USB audio', 'Dual-processor messaging', 'MOSFET switching'],

intro: `
<p>Every commercial smart speaker works the same way: the device listens locally for one word, and everything
after that word is uploaded to a data centre, transcribed there, and acted on. The clever part happens on
someone else's computer, and the price of admission is a permanently open microphone in your house attached to
a company's servers.</p>
<p>That architecture exists because speech recognition used to be genuinely too expensive to do locally. It is
not any more. The quad-core processor on the UNO Q will transcribe a spoken command in about a quarter of a
second, using a model that fits in 50&nbsp;MB, and it will do it with the network cable unplugged.</p>
<p>The trade-off is real and worth stating plainly: this will not understand arbitrary English. It understands
<em>your</em> list of commands, very well. That turns out to be exactly what a light switch needs, and the
technique that makes it work - restricting the grammar - is the most useful thing in this project.</p>`,

what: [
  'Transcribe speech locally, with no network connection of any kind.',
  'Listen for a wake phrase, then accept one command from a fixed list.',
  'Recognise around twenty commands with accuracy that a general-purpose transcriber cannot touch.',
  'Dim a 12 V LED strip, set a WS2812 strip to named colours, and drive a servo, all from the microcontroller side.',
  'Show what it heard on an OLED, including when it heard something it did not understand.',
  'Time out and go back to sleep if you say the wake word and then nothing.'
],

how: `
<p><strong>Vosk, and why it fits.</strong> Vosk is an offline speech recognition toolkit built on Kaldi. Its
small English model is about 50&nbsp;MB - roughly 1% of the size of the models behind a cloud assistant - and
it runs comfortably on four ARM cores in real time. It is genuinely offline: once the model is on disk, the
board never needs a network again.</p>

<p><strong>Restricted grammars, which are the actual trick.</strong> Ask Vosk's small model to transcribe
arbitrary speech and it will be mediocre - maybe 75% word accuracy in a quiet room, worse with an accent or a
fan running. That is not good enough to switch a light.</p>
<p>But Vosk lets you hand the recogniser a <em>list of the only phrases that exist</em>. Do that and the
problem changes completely: instead of choosing between every word in English, it is choosing between twenty
options. "Lights warm white" and "lights bright white" are easy to separate when those are two of twenty
candidates and nearly impossible when they compete with every phrase in the language.</p>
<p>Accuracy on a restricted grammar routinely goes above 95%, and it does so on the same 50&nbsp;MB model.
This is why a device that does one job can be dramatically better at that job than a general assistant.</p>

<p><strong>The wake phrase.</strong> Transcribing continuously and acting on anything that sounds like a
command is a bad idea - a television will eventually say something close enough. So the recogniser runs in two
modes: asleep, with a grammar containing exactly one phrase, and awake, with the full command grammar and a
ten-second timeout.</p>
<p>Pick a wake phrase of three or more syllables that does not occur in ordinary speech. "Hey workshop" is
good. "Computer" is terrible - you will say it by accident every day.</p>

<p><strong>The split, again.</strong> As with the object detector, Linux decides and the MCU does. Speech
recognition is a floating-point workload that needs an operating system and hundreds of megabytes. Driving a
WS2812 strip needs pulses timed to 150 nanoseconds, which Linux cannot do reliably at all and which the STM32
does without trying.</p>
<p>WS2812s are the sharpest illustration of the divide in this book. Their protocol has no clock line - a bit
is encoded purely as how long the line stays high, and being 300&nbsp;ns late corrupts the colour. On a Linux
board driving them directly you need DMA tricks or a dedicated chip. Here, the MCU just runs FastLED.</p>`,

bom: [
  { id: 'uno-q', qty: 1 },
  { id: 'usb-mic', qty: 1, note: 'This is the component that decides whether the project works. A conference-style boundary mic at $14 beats a $3 pinhole one by more than any amount of software tuning will.' },
  { id: 'usbc-hub', qty: 1, note: 'Power and the microphone at the same time. Skip it if your board has a separate USB-A host port.' },
  { id: 'psu5v3a', qty: 1, note: 'For the board. Its own supply, not a laptop port.' },
  { id: 'ws2812-strip', qty: 1, note: 'The colour-changing output. One metre is plenty; cut it to length at the marked pads.' },
  { id: 'ledstrip12v', qty: 1, note: 'Plain single-colour 12 V strip for the dimmable white light. Much brighter per watt than addressables.' },
  { id: 'mosfet', qty: 1, note: 'IRLZ44N. Logic level - it must switch fully on from a 3.3 V gate, and a plain IRF540 will not.' },
  { id: 'res10k', qty: 1, note: 'Gate pull-down. Without it the strip flickers while the MCU boots.' },
  { id: 'res220', qty: 1, note: 'In series with the WS2812 data line, right at the strip.' },
  { id: 'psu12v2a', qty: 1, note: 'For the 12 V strip. Separate from everything else.' },
  { id: 'cap1000', qty: 1, note: 'Across the WS2812 strip power, at the strip end. Absorbs the surge when 60 LEDs go white at once.' },
  { id: 'oled13', qty: 1, note: 'Shows what it heard. Far more useful than it sounds - most voice problems are invisible without it.' },
  { id: 'sg90', qty: 1, note: 'Optional. A servo makes "open" and "close" commands do something physical.' },
  { id: 'perfboard', qty: 1 },
  { id: 'screwterm', qty: 3 },
  { id: 'headers-f', qty: 1 },
  { id: 'bb-400', qty: 1, own: true, note: 'Prototype on this first.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'box-abs', qty: 1 }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'strippers' }, { id: 'dmm' }, { id: 'helping' }],

build: {
  parts: [
    { id: 'q',    comp: 'unoq',         at: [0, 52] },
    { id: 'bb',   comp: 'bb400',        at: [0, -12] },
    { id: 'oled', comp: 'oled13',       at: [-46, -60], ry: 180 },
    { id: 'strip',comp: 'ws2812strip',  at: [0, -84] },
    { id: 'fet',  comp: 'mosfet',       at: [34, -44] },
    { id: 'srv',  comp: 'servo',        at: [46, -66] }
  ],
  wires: [
    { from: 'q.5V',     to: 'bb.T+2',    color: 'red',    note: '5 V rail for the OLED only - the strips have their own supplies' },
    { from: 'q.GND1',   to: 'bb.T-2',    color: 'black',  note: 'Ground rail. Everything in this build shares it' },
    { from: 'oled.VCC', to: 'bb.T+6',    color: 'red',    note: 'OLED power' },
    { from: 'oled.GND', to: 'bb.T-6',    color: 'black',  note: 'OLED ground' },
    { from: 'oled.SDA', to: 'q.SDA',     color: 'blue',   note: 'I2C data - A4 on the UNO headers' },
    { from: 'oled.SCL', to: 'q.SCL',     color: 'yellow', note: 'I2C clock - A5' },
    { from: 'q.D6',     to: 'strip.DIN', color: 'green',  note: 'WS2812 data, through a 220 ohm resistor at the strip end' },
    { from: 'strip.GND',to: 'bb.T-12',   color: 'black',  note: 'Strip ground - MUST be common with the board or the data line has no reference' },
    { from: 'strip.5V', to: 'bb.T+12',   color: 'red',    note: 'Strip 5 V, fed from the board supply for one short strip. See the notes before you go longer' },
    { from: 'q.D5',     to: 'fet.G',     color: 'purple', note: 'MOSFET gate, PWM for the white strip. 10k pull-down to ground alongside it' },
    { from: 'fet.S',    to: 'bb.T-18',   color: 'black',  note: 'MOSFET source to the common ground. This is what ties the 12 V return to the board' },
    { from: 'fet.D',    to: 'bb.T-22',   color: 'brown',  note: 'MOSFET drain to the 12 V strip negative. The strip positive goes straight to the 12 V supply' },
    { from: 'q.D9',     to: 'srv.SIG',   color: 'orange', note: 'Servo signal, hardware-timed on the MCU side' },
    { from: 'srv.GND',  to: 'bb.T-26',   color: 'black',  note: 'Servo ground' },
    { from: 'srv.VCC',  to: 'bb.T+26',   color: 'red',    note: 'Servo 5 V. One small servo can share the board supply; two cannot' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Never pull the power on a running Linux board</span>
<p>Same as every project on this board and worth repeating: <code>sudo shutdown -h now</code>, wait, then
remove power. An interrupted eMMC write can leave the board unbootable, and a voice assistant is the kind of
thing you will be tempted to just switch off at the wall.</p>
<p>Add a physical power switch on the 12&nbsp;V supply instead, so you can kill the lights without killing the
computer.</p></div>

<div class="note danger"><span class="t">The MOSFET switches the low side, and that determines where ground goes</span>
<p>The 12&nbsp;V strip's positive wire goes directly to the 12&nbsp;V supply's positive. Its negative goes to
the MOSFET <strong>drain</strong>. The MOSFET <strong>source</strong> goes to ground - and that ground must be
common with both the 12&nbsp;V supply's negative and the UNO Q's GND.</p>
<p>Miss that last connection and the gate has no reference, the MOSFET does something halfway, and it gets
hot. A transistor that is neither on nor off is dissipating the most power it ever will.</p>
<p><strong>10&nbsp;k&Omega; from gate to source</strong>, not optional. While the MCU boots, that pin is an
input and floats - the pull-down holds the strip off until the sketch takes over.</p></div>

<div class="note warn"><span class="t">Logic-level MOSFET, and only a logic-level one</span>
<p>The UNO headers on this board run at 3.3&nbsp;V logic, not 5&nbsp;V. An IRLZ44N is specified to be fully on
with a few volts on the gate and is fine. A standard IRF540 needs closer to 10&nbsp;V and will sit
half-conducting, dropping voltage across itself, running hot and dimming the strip. It will look like it works
for about ten minutes.</p></div>

<div class="note warn"><span class="t">WS2812 power: 60 LEDs at full white is 3.6 A</span>
<p>Each WS2812 draws up to 60&nbsp;mA with all three channels at maximum. A one-metre 60-LED strip at full
white therefore wants 3.6&nbsp;A - more than the board's supply has to spare.</p>
<p>Two honest options. Cap the brightness in the sketch (<code>FastLED.setBrightness(60)</code> keeps it under
about 1&nbsp;A and still looks bright indoors), or give the strip its own 5&nbsp;V supply with grounds
commoned. The sketch below caps brightness, because the alternative is a project that browns out only when
someone says "white".</p>
<p>The 1000&nbsp;uF capacitor across the strip's power at the strip end, and the 220&nbsp;&Omega; resistor in
the data line at the strip end, are both standard WS2812 practice. Neither is decoration.</p></div>

<div class="note tip"><span class="t">The microphone is not wired to anything</span>
<p>It is a USB device and it belongs to the Linux side. None of it touches the UNO headers. That separation is
the architecture working as intended: audio goes into Linux, decisions come out as short text messages, and
the MCU never knows a microphone exists.</p></div>`,

solderSteps: [
  { h: 'Breadboard the whole thing first',
    body: `<p>Get the MOSFET dimming, the WS2812 strip and the OLED all working from the sketch before any of
    it is permanent. Voice recognition has enough moving parts without a suspect solder joint underneath.</p>` },
  { h: 'Female headers for the UNO Q',
    body: `<p>Do not solder the board down. Cut female header to match the UNO footprint - 10, 8, 8 and 6 pins -
    and tack the corners with the board seated to hold the spacing, then pull it out and finish the rest.</p>
    <p>The classic UNO header spacing has that famous 0.16 inch offset in the digital row. Use the board itself
    as the jig and it takes care of itself; measure it and you will get it wrong.</p>` },
  { h: 'The MOSFET, with its pull-down right at the gate',
    body: `<p>IRLZ44N in a TO-220 package: looking at the front with the legs down, the pins are gate, drain,
    source, left to right. The metal tab is connected to the drain - if you bolt it to anything conductive,
    remember that.</p>
    <p>Solder the 10&nbsp;k&Omega; between gate and source <em>at the MOSFET itself</em>, not back near the
    board. A long unprotected gate wire picks up enough noise to make the strip shimmer.</p>
    <p>No heatsink needed here. A logic-level MOSFET fully switched on has a few tens of milliohms of
    resistance, and a 2&nbsp;A strip through that dissipates well under a watt.</p>` },
  { h: 'Screw terminals for everything that leaves the board',
    body: `<p>Three two-pin blocks: 12&nbsp;V in, 12&nbsp;V strip out, and the WS2812 tail. These carry the
    only real current in the build, so fill the pads properly.</p>
    <p><strong>Do not tin the stranded wire</strong> going into a screw terminal. Solder cold-flows under the
    clamp and works loose over months. Ferrules if you have them, bare twisted wire if you do not.</p>` },
  { h: 'The 220 ohm data resistor goes at the strip, not at the board',
    body: `<p>Its job is to damp reflections on the data line and protect the first LED's input. Both of those
    only work if it is physically close to the strip. Solder it into the strip's flying lead rather than onto
    the perfboard.</p>` },
  { h: 'Ground first, and make it generous',
    body: `<p>This build has three power domains - board 5&nbsp;V, strip 5&nbsp;V and 12&nbsp;V - and they all
    need a common ground. Run one solid black rail down the perfboard edge and stitch every ground to it: the
    board GND, the MOSFET source, the 12&nbsp;V supply negative, the strip ground, the servo ground.</p>
    <p>Use 22&nbsp;AWG solid for this rail rather than the thin stuff. It is carrying the return for
    everything.</p>` },
  { h: 'Buzz it out before any supply goes near it',
    body: `<p>With the multimeter and nothing powered: every ground point to the board's GND socket (beep).
    12&nbsp;V in to ground (<strong>no beep</strong>). 5&nbsp;V to ground (<strong>no beep</strong>). Gate to
    source should read about 10&nbsp;k&Omega;, which confirms the pull-down.</p>
    <p>Then power the 12&nbsp;V with nothing else connected and check the strip stays off. If it glows dimly,
    the pull-down is missing or the MOSFET is in backwards.</p>` }
],

assembly: [
  { h: 'Boot the board and check the microphone exists',
    body: `<p>Plug the microphone into the hub and run <code>arecord -l</code>. It should list a card. Note the
    card and device numbers - you need them in a moment, and guessing them is the single most common way to
    spend an hour on a project that is working fine.</p>` },
  { h: 'Record five seconds of yourself and listen to it',
    body: `<p>Do this before installing anything. The recording tells you more than any amount of log
    output: is it clipping, is there a hum, is the fan louder than you are, is the level so low that the
    waveform is a flat line?</p>
    <p>Copy the WAV to your laptop and actually listen to it. A speech recogniser fed bad audio fails in ways
    that look like software bugs.</p>` },
  { h: 'Install Vosk and fetch the model',
    body: `<p>The small English model is about 50&nbsp;MB. There is a larger 1.8&nbsp;GB model which is more
    accurate at general transcription and makes almost no difference once you are using a restricted grammar -
    start with the small one and do not bother upgrading unless you have a reason.</p>` },
  { h: 'Test recognition with no hardware attached',
    body: `<p>Run the transcription test script. Speak your commands at it and watch what comes back.</p>
    <p>Run it <strong>twice</strong>: once with the free grammar and once with the restricted one. The
    difference is the point of the project, and seeing it yourself is worth more than the explanation
    above.</p>` },
  { h: 'Flash the sketch and test the outputs by hand',
    body: `<p>The MCU half takes the same kind of one-line commands as the object tracker. Send them from a
    serial terminal - <code>W128</code> for the white strip, <code>Cff8800</code> for the colour strip - and
    confirm every output works before any voice is involved.</p>` },
  { h: 'Choose your wake phrase, and choose it well',
    body: `<p>Three or more syllables, not a word you use in conversation, and not a word that rhymes with one.
    "Hey workshop", "okay bench", "hello studio" all work.</p>
    <p>Then say it thirty times in a row at the running system and count the misses. If it misses more than
    two or three, pick a different phrase rather than fighting it - some phrases simply sit better in the
    model's acoustic space and no tuning changes that.</p>` },
  { h: 'Write your command list',
    body: `<p>The grammar in the script is a starting point. Keep the phrases <strong>acoustically
    distinct</strong>: "lights on" and "lights off" differ by one short consonant and will be confused, which
    is why the list uses "lights on" and "lights out".</p>
    <p>That is the design rule for the whole project. Not "what do I want to say" but "what can be told apart
    from everything else on this list".</p>` },
  { h: 'Run the whole thing, and watch the OLED',
    body: `<p>Say the wake phrase; the OLED shows it is listening. Say a command; it shows what it heard.</p>
    <p>When it mishears, the OLED tells you exactly what it thought you said, which almost always points
    straight at two phrases that are too similar.</p>` },
  { h: 'Make it a service, then put it in the box',
    body: `<p>Same systemd pattern as the object detector. Once it survives a reboot, box it up - and leave
    the microphone outside the box.</p>` }
],

libraries: [
  { name: 'Vosk', by: 'Alpha Cephei', how: 'pip3 install vosk', why: 'Offline speech recognition. Apache 2.0, runs on ARM, and the restricted-grammar support is what makes this project viable.' },
  { name: 'sounddevice', by: 'Matthias Geier', how: 'pip3 install sounddevice', why: 'Pulls audio from ALSA into Python without wrestling with PyAudio build errors.' },
  { name: 'pyserial', by: 'pySerial', how: 'apt install python3-serial', why: 'The link to the microcontroller half.' },
  { name: 'FastLED', by: 'Daniel Garcia', why: 'On the sketch side. Bit-bangs the WS2812 protocol with interrupt-safe timing.' },
  { name: 'Servo', by: 'Arduino', how: 'Built in', why: 'Hardware-timed pulses for the optional servo.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'The status OLED.' }
],

code: [
{
  h: 'Step 1: find and test the microphone',
  intro: `<p>All of this is standard Linux audio. None of it is Arduino-specific, and it is where most of the
  problems in this project live.</p>`,
  name: 'audio_setup.sh',
  lang: 'Shell',
  code: `# What capture devices exist? Note the card and device numbers.
arecord -l

# Typical output:
#   card 1: Device [USB Audio Device], device 0: USB Audio [USB Audio]
# ...which means the ALSA name is hw:1,0

# Record five seconds. Speak normally, at the distance you actually
# plan to use it from - not with your mouth against the mic.
arecord -D hw:1,0 -f S16_LE -r 16000 -c 1 -d 5 test.wav

# Listen to it. Copy it to your laptop if the board has no speaker:
#   scp user@board:~/voice/test.wav .

# Check the levels properly rather than by ear. This prints peak
# amplitude as a percentage - you want 30-70%. Under 10% is too
# quiet for good recognition; 100% is clipping, which is worse.
sox test.wav -n stat 2>&1 | grep -i "maximum amplitude"
# (sudo apt install -y sox  if you do not have it)

# Too quiet? Raise the capture gain. Find the control, then set it.
amixer -c 1 scontrols
amixer -c 1 sset Mic 80%

# Make it stick across reboots
sudo alsactl store

# Vosk needs 16 kHz mono, which is what we recorded above. If your
# mic only does 44.1 or 48 kHz, that is fine - the Python script
# resamples. But check what it actually supports:
arecord -D hw:1,0 --dump-hw-params 2>&1 | head -20`,
  after: `<p><strong>Listen to the recording.</strong> It is the step everyone skips and the one that saves the
  most time.</p>
  <p>A constant hum usually means the microphone is picking up the board's own switching supply - move it
  further away, or onto a different USB port. A recording where your voice is barely visible against the room
  noise will never transcribe well, however good the model is.</p>`
},
{
  h: 'Step 2: Vosk, and the grammar demonstration',
  intro: `<p>Install, fetch the model, then run the same audio through the recogniser twice - once
  unrestricted, once with a grammar. Run this before you build anything.</p>`,
  name: 'setup_vosk.sh',
  lang: 'Shell',
  code: `sudo apt update
sudo apt install -y python3-pip python3-numpy libportaudio2 unzip wget
pip3 install --break-system-packages vosk sounddevice

mkdir -p ~/voice && cd ~/voice

# The small English model: ~50 MB. Good enough, and the one to start
# with. The 1.8 GB model buys very little once a grammar is in play.
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip -q vosk-model-small-en-us-0.15.zip
mv vosk-model-small-en-us-0.15 model
rm vosk-model-small-en-us-0.15.zip

ls model/
# am/ conf/ graph/ ivector/ README

# Confirm the link to the microcontroller half exists
ls /dev/ttyACM* 2>/dev/null`,
  after: `<p>Other languages are available from the same page - Swedish, German, French, Spanish and many more,
  all in the same small size. The grammar trick works identically in any of them.</p>`
},
{
  h: 'Step 3: prove the grammar trick to yourself',
  intro: `<p>This is a throwaway script whose only job is to show you the difference between free
  transcription and a restricted grammar. Run it, say your commands, and read both columns.</p>`,
  name: 'grammar_demo.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Transcribe the same audio two ways and print both.

Left  = unrestricted: choosing from all of English.
Right = restricted:   choosing from our twenty phrases.

The difference is the entire reason this project works.
"""

import json
import queue
import sounddevice as sd
from vosk import Model, KaldiRecognizer

SAMPLE_RATE = 16000

COMMANDS = [
    "hey workshop",
    "lights on", "lights out",
    "lights warm white", "lights bright white",
    "lights red", "lights green", "lights blue", "lights purple",
    "brighter", "dimmer", "half brightness",
    "open", "close",
    "rainbow", "stop",
    "never mind",
    "[unk]",           # lets Vosk say "that was not on the list"
]

model = Model("model")

# Unrestricted: the recogniser considers the whole language.
free = KaldiRecognizer(model, SAMPLE_RATE)

# Restricted: the recogniser considers ONLY these phrases. This is
# one extra argument and it is worth more than any other single
# change you can make to this project.
grammar = KaldiRecognizer(model, SAMPLE_RATE, json.dumps(COMMANDS))

q = queue.Queue()


def callback(indata, frames, time_info, status):
    if status:
        print(status, flush=True)
    q.put(bytes(indata))


print("Speak a command. Ctrl-C to stop.\\n")
print(f"{'FREE (all English)':38s} | RESTRICTED (20 phrases)")
print("-" * 70)

with sd.RawInputStream(samplerate=SAMPLE_RATE, blocksize=8000,
                       dtype="int16", channels=1, callback=callback):
    while True:
        data = q.get()

        done_free = free.AcceptWaveform(data)
        done_gram = grammar.AcceptWaveform(data)

        if done_gram:
            f = json.loads(free.Result()).get("text", "")
            g = json.loads(grammar.Result()).get("text", "")
            if f or g:
                print(f"{f:38s} | {g}")`,
  after: `<p>Say "lights warm white" a few times. The free column will produce things like "light swarm white" or
  "lights warm wide". The restricted column will say "lights warm white" nearly every time.</p>
  <p><code>"[unk]"</code> in the list is doing real work. Without it the recogniser must map every sound to
  one of your phrases, so a cough becomes "lights out". With it, there is an escape hatch for "none of
  these".</p>`
},
{
  h: 'Step 4: the microcontroller half',
  intro: `<p>Plain Arduino. It owns the WS2812 timing, the MOSFET PWM and the servo, and it never knows that
  speech exists.</p>`,
  name: 'voice_mcu.ino',
  code: `/* ------------------------------------------------------------------
   UNO Q - microcontroller half of the voice controller.

   Commands, one per line, from the Linux side:
     W<0-255>       white strip brightness (MOSFET PWM)
     C<rrggbb>      colour strip, hex, e.g. Cff8800
     B<0-255>       colour strip brightness
     R              rainbow animation on
     S              stop animation, hold current colour
     P<angle>       servo angle
     A              acknowledge blink (heard the wake word)

   Everything with tight timing lives here. Linux only sends text.
   ------------------------------------------------------------------ */

#include <FastLED.h>
#include <Servo.h>

#define PIN_STRIP   6
#define PIN_WHITE   5      // MOSFET gate
#define PIN_SERVO   9
#define NUM_LEDS   60

// 60 WS2812s at full white is 3.6 A. This cap holds it near 1 A,
// which the board supply can actually deliver. Raise it only if you
// have given the strip its own supply.
#define MAX_BRIGHTNESS 60

CRGB leds[NUM_LEDS];
Servo door;

byte  stripBright = MAX_BRIGHTNESS;
CRGB  stripColour = CRGB::Black;
bool  rainbow = false;
byte  hue = 0;

char line[40];
byte linePos = 0;

void setup() {
  Serial.begin(115200);

  FastLED.addLeds<WS2812B, PIN_STRIP, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(stripBright);
  FastLED.clear(true);

  pinMode(PIN_WHITE, OUTPUT);
  analogWrite(PIN_WHITE, 0);

  door.attach(PIN_SERVO);
  door.write(90);

  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println(F("MCU ready"));
}

void loop() {
  readSerial();

  if (rainbow) {
    // A cheap moving rainbow. FastLED handles the 800 kHz bit timing
    // with interrupts off for the duration of show() - which is
    // exactly the kind of thing Linux cannot be trusted with.
    fill_rainbow(leds, NUM_LEDS, hue++, 4);
    FastLED.show();
    delay(20);
  }
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

    case 'W': {                       // white strip via MOSFET
      int v = constrain(atoi(cmd + 1), 0, 255);
      analogWrite(PIN_WHITE, v);
      Serial.print(F("ok white ")); Serial.println(v);
      break;
    }

    case 'C': {                       // colour, as six hex digits
      long rgb = strtol(cmd + 1, NULL, 16);
      stripColour = CRGB((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF);
      rainbow = false;
      fill_solid(leds, NUM_LEDS, stripColour);
      FastLED.show();
      Serial.print(F("ok colour ")); Serial.println(cmd + 1);
      break;
    }

    case 'B': {
      stripBright = constrain(atoi(cmd + 1), 0, MAX_BRIGHTNESS);
      FastLED.setBrightness(stripBright);
      FastLED.show();
      Serial.print(F("ok bright ")); Serial.println(stripBright);
      break;
    }

    case 'R':
      rainbow = true;
      Serial.println(F("ok rainbow"));
      break;

    case 'S':
      rainbow = false;
      fill_solid(leds, NUM_LEDS, stripColour);
      FastLED.show();
      Serial.println(F("ok stop"));
      break;

    case 'P': {
      int a = constrain(atoi(cmd + 1), 10, 170);
      door.write(a);
      Serial.print(F("ok servo ")); Serial.println(a);
      break;
    }

    case 'A':                          // "I heard the wake word"
      for (byte i = 0; i < 2; i++) {
        digitalWrite(LED_BUILTIN, HIGH); delay(60);
        digitalWrite(LED_BUILTIN, LOW);  delay(60);
      }
      Serial.println(F("ok ack"));
      break;

    default:
      Serial.println(F("! unknown"));
  }
}`,
  after: `<p>Test every command from a serial terminal at 115200 before any voice is involved:
  <code>W255</code>, <code>W0</code>, <code>Cff0000</code>, <code>R</code>, <code>S</code>,
  <code>P30</code>.</p>
  <p><code>MAX_BRIGHTNESS</code> is a hardware limit expressed in software, and clamping <code>B</code> against
  it means a bug on the Linux side cannot brown out the board. That is the same principle as the servo angle
  limits in the object tracker: the constraint that matters lives on the half that cannot be edited by
  accident.</p>`
},
{
  h: 'Step 5: the voice assistant',
  intro: `<p>The Linux half. Wake word, grammar, command dispatch, and a status line for the OLED.</p>`,
  name: 'voice.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Offline voice control for the UNO Q.

Asleep : recogniser loaded with one phrase - the wake word.
Awake  : recogniser loaded with the full command grammar, ten
         second timeout, then back to sleep.

Nothing here touches the network. Unplug it and it still works.
"""

import json
import queue
import time
import serial
import sounddevice as sd
from vosk import Model, KaldiRecognizer

SAMPLE_RATE = 16000
MCU_DEV = "/dev/ttyACM0"
WAKE = "hey workshop"
AWAKE_SECONDS = 10

# Acoustically distinct phrases. "lights on"/"lights out" rather than
# "lights on"/"lights off" - one short consonant is not enough of a
# difference and the recogniser will mix them up forever.
COMMANDS = {
    "lights on":           [("W", 255)],
    "lights out":          [("W", 0), ("C", "000000")],
    "lights warm white":   [("W", 180)],
    "lights bright white": [("W", 255)],
    "half brightness":     [("W", 110)],
    "brighter":            [("W", "+40")],
    "dimmer":              [("W", "-40")],
    "lights red":          [("C", "ff0000")],
    "lights green":        [("C", "00ff00")],
    "lights blue":         [("C", "0040ff")],
    "lights purple":       [("C", "8800ff")],
    "rainbow":             [("R", None)],
    "stop":                [("S", None)],
    "open":                [("P", 160)],
    "close":               [("P", 20)],
    "never mind":          [],
}

GRAMMAR = list(COMMANDS.keys()) + ["[unk]"]
WAKE_GRAMMAR = json.dumps([WAKE, "[unk]"])

white_level = 0


class MCU:
    def __init__(self, dev):
        try:
            self.ser = serial.Serial(dev, 115200, timeout=0.2)
            time.sleep(0.5)
            self.ser.reset_input_buffer()
            print(f"MCU on {dev}")
        except serial.SerialException as e:
            print(f"No MCU ({e}) - commands will print only")
            self.ser = None

    def send(self, text):
        print(f"  -> {text}")
        if self.ser:
            self.ser.write((text + "\\n").encode())


def run_actions(mcu, actions):
    global white_level
    for code, arg in actions:
        if code == "W":
            if isinstance(arg, str) and arg[0] in "+-":
                white_level = max(0, min(255, white_level + int(arg)))
            else:
                white_level = int(arg)
            mcu.send(f"W{white_level}")
        elif code == "C":
            mcu.send(f"C{arg}")
        elif code == "P":
            mcu.send(f"P{arg}")
        elif code in ("R", "S"):
            mcu.send(code)


def main():
    model = Model("model")
    mcu = MCU(MCU_DEV)

    # Two recognisers, not one reconfigured. Building a KaldiRecognizer
    # takes a moment, and doing it on every wake would add a pause
    # exactly where the system needs to feel instant.
    sleeper = KaldiRecognizer(model, SAMPLE_RATE, WAKE_GRAMMAR)
    lister = KaldiRecognizer(model, SAMPLE_RATE, json.dumps(GRAMMAR))

    q = queue.Queue()

    def callback(indata, frames, time_info, status):
        if status:
            print(status, flush=True)
        q.put(bytes(indata))

    awake_until = 0
    print(f'Listening. Say "{WAKE}".')

    with sd.RawInputStream(samplerate=SAMPLE_RATE, blocksize=4000,
                           dtype="int16", channels=1, callback=callback):
        while True:
            data = q.get()
            awake = time.time() < awake_until

            rec = lister if awake else sleeper
            if not rec.AcceptWaveform(data):
                continue

            text = json.loads(rec.Result()).get("text", "").strip()
            if not text:
                continue

            if not awake:
                if WAKE in text:
                    print(f'\\n[{text}] - listening')
                    mcu.send("A")
                    awake_until = time.time() + AWAKE_SECONDS
                    # Drop whatever is already queued, or the wake
                    # phrase's own tail gets re-read as a command.
                    with q.mutex:
                        q.queue.clear()
                    lister.Reset()
                continue

            # awake
            if text in COMMANDS:
                print(f'[{text}]')
                run_actions(mcu, COMMANDS[text])
                awake_until = 0             # one command per wake
                print(f'Listening. Say "{WAKE}".')
            else:
                print(f'[{text}] - not a command')


if __name__ == "__main__":
    main()`,
  after: `<p>Two details worth stealing:</p>
  <ul>
    <li><strong>Clearing the audio queue on wake.</strong> Without it, the trailing audio of the wake phrase
    itself gets fed to the command recogniser, which frequently hears a phantom command immediately.</li>
    <li><strong>One command per wake.</strong> Going straight back to sleep after acting is both more
    predictable and far less likely to fire on something the room says next.</li>
  </ul>
  <p>To push the status to the OLED, add a fourth command to the sketch - say <code>M&lt;text&gt;</code> - and
  call <code>mcu.send("M" + text)</code> wherever this script prints. Seeing what it misheard is the fastest
  route to a better command list.</p>`
}],

upload: `
<p>Two deployments, as before: the sketch to the microcontroller, the Python to the Linux filesystem.</p>
<p>Start the Python by hand while you are tuning - <code>python3 voice.py</code> - so you can read what it
heard. Make it a systemd service only once the command list has settled.</p>
<div class="note tip"><span class="t">Expect about 300 ms from end of speech to action</span>
<p>Vosk finishes a phrase quickly once you stop talking. Most of the perceived delay is the recogniser waiting
to be sure you have finished, not the recognition itself. If it feels sluggish, reduce
<code>blocksize</code> to 2000 - you get more frequent partial results at slightly more CPU.</p></div>
<div class="note warn"><span class="t">If sounddevice cannot find the microphone</span>
<p><code>python3 -c "import sounddevice; print(sounddevice.query_devices())"</code> lists what it can see. If
the right device is not the default, pass <code>device=N</code> to <code>RawInputStream</code> using the
index from that list.</p></div>`,

tune: [
  { h: 'Design the command list for the recogniser, not for yourself',
    body: `<p>This is the highest-value tuning in the project and it costs nothing.</p>
    <p>Phrases should differ by <strong>more than one short consonant</strong>. "On" and "off" are nearly
    identical acoustically at a distance; "on" and "out" are not. Longer phrases are easier, not harder - more
    sound means more evidence, so "lights bright white" beats "bright".</p>
    <p>Say your list out loud and listen for pairs that could be confused. Fix those pairs before you touch
    anything else.</p>` },
  { h: 'Microphone placement beats every software setting',
    body: `<p>Off a hard reflective surface, away from the board's own supply and any fan, and pointed at where
    people actually stand. A metre closer is worth more than any parameter in this project.</p>
    <p>If recognition is good up close and poor across the room, the answer is the microphone or the room, not
    the model.</p>` },
  { h: 'Use "[unk]" and then use it',
    body: `<p>Keeping <code>"[unk]"</code> in the grammar lets Vosk decline to guess. The script currently
    prints "not a command" when that happens. Better: flash the OLED amber, so a person can see the difference
    between "did not hear you" and "heard you and ignored it".</p>` },
  { h: 'Add a confidence gate',
    body: `<p>Vosk can return per-word confidence if you call
    <code>SetWords(True)</code> on the recogniser. The result then includes a <code>conf</code> for each word,
    and you can refuse anything whose average falls below about 0.8.</p>
    <p>Worth adding for the servo commands. A mistaken "lights blue" is nothing; a mistaken "open" moves
    something.</p>` },
  { h: 'Another language, same architecture',
    body: `<p>Swap the model directory for a Swedish, German or Spanish one from the Vosk model page and
    rewrite <code>COMMANDS</code> in that language. Nothing else changes.</p>
    <p>The small models are all roughly 50&nbsp;MB and the grammar trick works identically - which makes this a
    far better route to a non-English voice assistant than any commercial one.</p>` },
  { h: 'Go multi-turn, carefully',
    body: `<p>Staying awake for several commands is easy to implement and worse to live with - the false
    trigger rate rises sharply because the window is open for longer. If you do it, shorten the timeout to
    about four seconds after each accepted command and always accept "never mind" as an explicit exit.</p>` },
  { h: 'A physical mute that actually mutes',
    body: `<p>A hardware switch in the microphone's USB line, or simply unplugging it, is the only mute anyone
    should trust. Software mute on a listening device is a promise rather than a mechanism - and the whole
    argument for building this instead of buying one is that it does not require you to take anyone's word for
    anything.</p>` }
],

trouble: [
  { q: 'It recognises nothing at all',
    a: `Go back to <code>arecord</code> and listen to a recording. In order of likelihood: the microphone is
    on the wrong card, the capture level is near zero, or sounddevice has picked a different default device
    than ALSA. All three are audio problems and none of them are Vosk's fault.` },
  { q: 'Free transcription works but the grammar version returns nothing',
    a: `Malformed grammar JSON. It must be a JSON array of strings - <code>json.dumps(["lights on", ...])</code>
    - and every phrase must be lowercase with no punctuation. A capital letter or a comma inside a phrase makes
    it unmatchable.` },
  { q: 'It triggers on the wake word when nobody said it',
    a: `Your wake phrase is too close to ordinary speech, or too short. Longer and stranger is better. Check
    what it thought it heard - if the television set it off, that is the phrase, not the threshold.` },
  { q: 'It fires a command immediately after the wake word',
    a: `The tail of the wake phrase is being read as a command. The script clears the audio queue and calls
    <code>Reset()</code> on wake for exactly this reason - if you removed either, put it back.` },
  { q: 'Two commands are constantly confused',
    a: `They are too similar acoustically. Do not fight this with parameters - rename one. This is the whole
    reason the list uses "lights out" rather than "lights off".` },
  { q: 'The white strip flickers at low brightness',
    a: `PWM frequency against the MOSFET's switching, or a missing gate pull-down. Check the 10&nbsp;kohm is
    present and physically at the MOSFET. If it persists, the gate wire is too long and picking up noise -
    shorten it.` },
  { q: 'The WS2812 strip shows wrong colours or the first LED misbehaves',
    a: `Classic WS2812 signal integrity: missing 220&nbsp;ohm resistor at the strip end, missing common ground,
    or too long a data run. Check the ground between the strip and the board first - it is the most common and
    the least obvious.` },
  { q: 'The board resets when the strip goes white',
    a: `Current. 60 LEDs at full white is 3.6&nbsp;A. Lower <code>MAX_BRIGHTNESS</code>, shorten the strip, or
    give it its own 5&nbsp;V supply with grounds commoned. On this board a reset risks the filesystem, so fix
    it rather than living with it.` },
  { q: 'The MOSFET gets hot',
    a: `It is not switching fully on - almost certainly a non-logic-level part. An IRLZ44N carrying 2&nbsp;A
    should be barely warm. An IRF540 on a 3.3&nbsp;V gate will be hot, and that is the fault.` },
  { q: 'Recognition is fine at a metre and useless at three',
    a: `Physics, not software. Sound pressure falls with distance while the room noise does not, so the
    signal-to-noise ratio collapses. A better microphone or a closer one is the only real fix; the small model
    is not the limiting factor.` }
],

next: `
<ul>
  <li><strong>Add eyes.</strong> The <a href="project.html?p=uno-q-object-detection">object detector</a> is
  the same board and the same split, with a camera instead of a microphone - and the two run together on one
  board quite happily.</li>
  <li><strong>Switch real appliances.</strong> This project deliberately stays at 12&nbsp;V. When you want a
  lamp, do it through the <a href="project.html?p=smart-plug-relay">mains relay project</a> and read its
  safety section properly first.</li>
  <li><strong>Try the same idea on a microcontroller alone.</strong> A handful of spoken keywords will run on
  a Nano 33 with Edge Impulse - vastly more limited than Vosk, and it teaches you exactly where the ceiling
  is. Start with <a href="project.html?p=tinyml-gesture-nano">the gesture project</a>.</li>
  <li><strong>Announce things back.</strong> Piper is an offline text-to-speech engine that runs on the same
  board, so the assistant can answer without a cloud service either.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Read before you power it</span>
<ul>
  <li><strong>Always shut the Linux side down properly.</strong> <code>sudo shutdown -h now</code>. Pulling
  power mid-write can corrupt the eMMC and leave the board unbootable. Put a switch on the 12&nbsp;V supply
  so you can kill the lights without killing the computer.</li>
  <li><strong>This project stays at 12 volts on purpose.</strong> A voice-controlled mains switch is a
  reasonable thing to want and a bad thing to improvise. If you go there, use the
  <a href="project.html?p=smart-plug-relay">mains relay project</a>, which is written for it, and never put
  mains wiring on perfboard.</li>
  <li><strong>Check the 12 V supply's rating against the strip.</strong> A metre of plain 12&nbsp;V strip is
  around 10&nbsp;W, so a 2&nbsp;A supply is comfortable. Five metres is not, and an overloaded supply is a
  fire risk rather than a performance problem.</li>
  <li><strong>The MOSFET's metal tab is the drain.</strong> It is at 12&nbsp;V when the strip is off. Do not
  bolt it to anything conductive, and do not let it touch the board.</li>
  <li><strong>Do not put the servo anywhere it can trap a finger</strong>, and do not use it for anything that
  matters - "open" firing on a misheard word is a certainty over a long enough period.</li>
</ul>
</div>
<div class="note tip"><span class="t">The privacy point, stated plainly</span>
<p>This device does not have a network dependency. You can delete its Wi-Fi configuration and it will keep
working, which is a claim no commercial smart speaker can make. That is a real and unusual property and it is
most of the reason to build one.</p>
<p>It is still a microphone in a room, though, and other people in that room have not agreed to anything.
Tell guests it is there, and put the microphone somewhere visible rather than hidden - a listening device you
can see is a very different object from one you cannot.</p></div>`
});
