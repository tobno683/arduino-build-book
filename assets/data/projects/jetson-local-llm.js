/* A real language model on a board on your desk: 8 GB unified memory, and what it costs. */
AB.addProject({
slug: 'jetson-local-llm',
title: 'Offline assistant with a real language model',
cat: 'ai',
level: 4,
time: '8 hours',
solder: false,
board: 'Jetson Orin Nano',
tags: ['jetson', 'llm', 'llama', 'ollama', 'whisper', 'piper', 'quantisation', 'offline', 'unified memory'],
blurb: 'An 8-billion-parameter language model, speech recognition and speech synthesis, all running on a board beside your desk with the network cable pulled out. The constraint that shapes everything is eight gigabytes.',

skills: ['LLM quantisation', 'Unified memory budgeting', 'Whisper speech recognition', 'Local text-to-speech', 'Tokens per second', 'Context windows'],

intro: `
<p>The <a href="project.html?p=uno-q-voice-control">UNO Q voice project</a> recognises twenty phrases from a
fixed list. That is the right answer for a light switch and it is not a conversation.</p>
<p>This runs an actual language model - Llama 3.1 8B, quantised to four bits - alongside Whisper for speech
recognition and Piper for speech synthesis, on one board, with nothing leaving the room. You can ask it
questions, have it summarise something, or write you a shopping list, and the network cable can be on the
floor.</p>
<p>It is slower than a cloud assistant and it is genuinely useful. More to the point, it makes the economics
of local AI concrete: you will spend this project fighting eight gigabytes of memory, and you will come away
understanding quantisation, context windows and why "8B" and "8&nbsp;GB" are not the same number.</p>`,

what: [
  'Run an 8-billion-parameter model locally at roughly 18-20 tokens a second.',
  'Transcribe speech with Whisper, on the GPU, faster than real time.',
  'Speak the answers back with Piper, which is fast enough to start before the sentence is finished.',
  'Fit all three in 8 GB of memory shared between the CPU and GPU, which is the whole engineering problem.',
  'Measure tokens per second and memory use honestly, rather than trusting a benchmark.',
  'Understand what a smaller model costs you, and when it is the right trade.'
],

how: `
<p><strong>Unified memory is the constraint, and it is unusual.</strong> A desktop with a graphics card has
two separate pools - system RAM and VRAM. The Jetson has one 8&nbsp;GB pool shared by the CPU and GPU.</p>
<p>That is an advantage for inference, because there is no copying across PCIe. It is also a hard ceiling:
the operating system, your Python, Whisper, Piper and the language model all come out of the same eight
gigabytes. A 5&nbsp;GB model leaves about 2.5&nbsp;GB for everything else, and the desktop environment alone
can eat a gigabyte.</p>
<p><strong>Run it headless.</strong> Disabling the graphical desktop frees roughly 800&nbsp;MB, which is the
difference between a model fitting and not.</p>

<p><strong>Quantisation, and why "8B" is not "8 GB".</strong> A model's parameter count is not its size - the
size depends on how many bits each weight is stored in:</p>
<table>
  <thead><tr><th>Precision</th><th>Bits/weight</th><th>Llama 3.1 8B</th><th>Quality</th></tr></thead>
  <tbody>
    <tr><td>FP16</td><td>16</td><td>~16 GB</td><td>reference - does not fit</td></tr>
    <tr><td>Q8_0</td><td>8</td><td>~8.5 GB</td><td>indistinguishable - still does not fit</td></tr>
    <tr><td>Q5_K_M</td><td>~5.5</td><td>~5.7 GB</td><td>very close, tight</td></tr>
    <tr><td><strong>Q4_K_M</strong></td><td>~4.5</td><td><strong>~4.9 GB</strong></td><td>the sweet spot</td></tr>
    <tr><td>Q3_K_M</td><td>~3.5</td><td>~4.0 GB</td><td>noticeably worse</td></tr>
    <tr><td>Q2_K</td><td>~2.6</td><td>~3.2 GB</td><td>often incoherent</td></tr>
  </tbody>
</table>
<p>Q4_K_M is where almost everyone lands. Below it the losses become obvious - the model starts making
arithmetic errors and losing the thread - and above it you run out of room for anything else.</p>
<p>The interesting finding, consistently: <strong>a larger model quantised harder usually beats a smaller
model at full precision</strong> for the same memory. An 8B at Q4 is better than a 3B at Q8.</p>

<p><strong>The context window is memory too, and people forget it.</strong> The KV cache - the model's memory
of the conversation so far - grows with context length and is separate from the weights. For Llama 3.1 8B
that is roughly 130&nbsp;MB per 1,000 tokens.</p>
<p>So a 4,096-token context costs about 500&nbsp;MB on top of the 4.9&nbsp;GB of weights, and asking for the
model's full 128,000-token context would want 16&nbsp;GB of cache alone. Set the context to what you actually
need - 2,048 is plenty for a voice assistant and saves a gigabyte.</p>

<p><strong>Three models, one budget.</strong> Whisper base is about 150&nbsp;MB, Piper about 60. Both are
tiny next to the language model, and both want GPU time. Running them concurrently is fine; running them
while the LLM is generating causes contention, so the pipeline is deliberately sequential - listen, then
think, then speak.</p>`,

bom: [
  { id: 'jetson-orin', qty: 1, note: 'The Super kit. The 8 GB is the whole story here - the 4 GB Orin Nano cannot run an 8B model at any quantisation worth having.' },
  { id: 'nvme', qty: 1, note: 'Not optional for this one. Models are gigabytes, and the read speed matters every time one loads. A microSD makes the whole thing feel broken.' },
  { id: 'usb-mic', qty: 1, note: 'A boundary mic, not a pinhole. Whisper is good and it cannot recover a recording that never had the words in it.' },
  { id: 'usb-speaker', qty: 1, note: 'USB audio, no amplifier to build. The Jetson is a Linux box and this just works.' },
  { id: 'button', qty: 1, note: 'Push to talk. Far more reliable than a wake word and one fewer model in memory - see the tuning notes.' },
  { id: 'ws2812-ring', qty: 1, note: 'Listening / thinking / speaking, at a glance. On a device with 3-8 seconds of thinking time, knowing it heard you matters.' },
  { id: 'uno', qty: 1, note: 'Drives the ring and reads the button. The Jetson has a 40-pin header and no reliable WS2812 timing - same split as the other Jetson project.' },
  { id: 'usb-cable', qty: 1, note: 'USB-B for the Uno.' },
  { id: 'fan40', qty: 1, own: true, note: 'The kit has one. Sustained LLM inference is the hottest this board gets.' },
  { id: 'psu5v3a', qty: 1, own: true, note: 'The kit includes its 19 V supply - this is only if you power the Uno separately.' },
  { id: 'standoffs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'bb-400', qty: 1 }
],

tools: [{ id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'jet',  comp: 'jetson',     at: [0, 56] },
    { id: 'uno',  comp: 'uno',        at: [-46, -52] },
    { id: 'bb',   comp: 'bb400',      at: [40, -46] },
    { id: 'ring', comp: 'ws2812ring', at: [40, -106] },
    { id: 'btn',  comp: 'button',     at: [-46, -110] }
  ],
  wires: [
    { from: 'jet.USB',  to: 'uno.USB',   color: 'white',  note: 'USB from the Jetson to the Uno. The only connection between the two - the header is 3.3 V and not 5 V tolerant' },
    { from: 'uno.5V',   to: 'bb.T+2',    color: 'red',    note: '5 V rail for the ring' },
    { from: 'uno.GND1', to: 'bb.T-2',    color: 'black',  note: 'Ground rail' },
    { from: 'uno.D6',   to: 'ring.DI',   color: 'blue',   note: 'WS2812 data, through 220 ohm at the ring' },
    { from: 'ring.5V',  to: 'bb.T+8',    color: 'red',    note: 'Ring power. 16 LEDs at the brightness this uses is under 300 mA' },
    { from: 'ring.GND', to: 'bb.T-8',    color: 'black',  note: 'Ring ground - common with the Uno or the data line has no reference' },
    { from: 'btn.1A',   to: 'uno.D2',    color: 'green',  note: 'Push to talk, internal pull-up' },
    { from: 'btn.2A',   to: 'bb.T-14',   color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Run it headless, or the model will not fit</span>
<p>The graphical desktop uses roughly 800&nbsp;MB of the 8&nbsp;GB, and that memory is shared with the GPU.
On this project it is the difference between a model loading and the kernel killing your process.</p>
<p><code>sudo systemctl set-default multi-user.target</code> and reboot. Then work over SSH, which is how you
would run it anyway.</p>
<p>You can go back with <code>graphical.target</code> when you want a desktop for something else.</p></div>

<div class="note danger"><span class="t">The 40-pin header is 3.3 V and not 5 V tolerant</span>
<p>Same rule as the <a href="project.html?p=jetson-orin-vision">vision project</a>: nothing but USB passes
between the Jetson and the Uno. Connecting a 5&nbsp;V Uno pin to the Jetson's header damages the SoC, which
is not a socketed part.</p>
<p>The Uno exists because a WS2812 needs pulses timed to 150&nbsp;nanoseconds and Linux cannot produce them
reliably. It is the same split as everywhere else in this book.</p></div>

<div class="note warn"><span class="t">Swap is a trap here, not a safety net</span>
<p>Adding swap lets a model load that would otherwise fail. It then runs at perhaps one token every few
seconds, because the weights are being read from an SSD on every forward pass.</p>
<p>A model that fits is fast; a model that swaps is unusable. If you need swap to load it, use a smaller
model or a harder quantisation instead.</p>
<p>Some swap is still worth having - 4&nbsp;GB on the NVMe stops a transient allocation killing the process -
but it is a margin, not headroom.</p></div>

<div class="note warn"><span class="t">Heat, and the 25 W power mode</span>
<p>Sustained generation is the hardest this board works. Check <code>sudo nvpmodel -q</code> is in the MAXN
Super mode and that <code>jtop</code> does not show thermal throttling - throttling shows up as tokens per
second quietly falling over the first few minutes.</p>
<p>Airflow over the heatsink, and do not enclose it without thinking about it.</p></div>`,

solderSteps: [
  { h: 'Nothing here needs soldering',
    body: `<p>USB microphone, USB speaker, the Uno on a breadboard with a ring and a button. All of it plugs
    together.</p>
    <p>The only care is the WS2812 essentials: a 220&nbsp;&Omega; resistor in the data line at the ring, and a
    common ground with the Uno.</p>` },
  { h: 'Install the NVMe before flashing, if you can',
    body: `<p>The M.2 slot takes the drive, and flashing straight to NVMe with NVIDIA's SDK Manager gives you
    a much better machine than migrating later.</p>
    <p>This project is gigabytes of models. A microSD works and makes every model load take a minute.</p>` }
],

assembly: [
  { h: 'Go headless first',
    body: `<p><code>sudo systemctl set-default multi-user.target</code>, reboot, and check
    <code>free -h</code>. You should have around 7&nbsp;GB available rather than 6.2.</p>
    <p>That 800&nbsp;MB is the difference between a model fitting and an out-of-memory kill, and it is the
    single most valuable thing you can do before installing anything.</p>` },
  { h: 'Set the power mode and confirm the GPU',
    body: `<p><code>sudo nvpmodel -m 0</code> and <code>sudo jetson_clocks</code>. Then <code>jtop</code> in
    another terminal, left open for the rest of the project.</p>
    <p>If GPU utilisation stays near zero while a model generates, it is running on the CPU and you will see
    two tokens a second instead of twenty.</p>` },
  { h: 'Install Ollama and pull a model',
    body: `<p>Ollama has an ARM64 build and works on JetPack 6. <code>ollama pull llama3.1:8b</code> gets you
    the Q4_K_M quantisation by default - about 4.9&nbsp;GB.</p>
    <p>Then <code>ollama run llama3.1:8b</code> and ask it something. The first token takes a few seconds
    while the model loads; after that it should be conversational.</p>` },
  { h: 'Measure tokens per second, on your board',
    body: `<p><code>ollama run llama3.1:8b --verbose</code> prints the rate after each response.</p>
    <p>Expect roughly <strong>18-20 tokens/second</strong> generation on an Orin Nano Super with an 8B at Q4,
    and considerably faster prompt processing. If you are seeing 3, check <code>jtop</code> - you are on the
    CPU.</p>
    <p>Write the number down. It is what every later decision trades against.</p>` },
  { h: 'Try a smaller model and hear the difference',
    body: `<p><code>ollama pull phi3:mini</code> is about 2.2&nbsp;GB and roughly twice as fast. Ask both the
    same half-dozen questions.</p>
    <p>For simple commands the small one is fine and noticeably snappier. For anything needing reasoning or
    general knowledge, the 8B is clearly better. Knowing where that line falls for <em>your</em> use is worth
    twenty minutes.</p>` },
  { h: 'Add Whisper and check it is on the GPU',
    body: `<p><code>faster-whisper</code> with the <code>base</code> model, or <code>whisper.cpp</code> built
    with CUDA. Both run several times faster than real time on this board.</p>
    <p>Transcribe a ten-second clip and time it. Under two seconds means the GPU is doing it; twenty seconds
    means it is not.</p>` },
  { h: 'Add Piper for the voice',
    body: `<p>Piper is small, fast and runs on the CPU, which is convenient - it does not compete with the
    model for GPU time. Pick a voice from its samples page; the medium-quality ones are a good balance.</p>
    <p>Test it on its own: <code>echo "hello" | piper --model en_GB-alba-medium.onnx --output_file t.wav</code>
    then <code>aplay t.wav</code>.</p>` },
  { h: 'Wire the three together and watch the memory',
    body: `<p>Run the assistant script with <code>jtop</code> visible. Watch memory as each stage loads.</p>
    <p>You are looking for headroom - if you are at 7.8 of 8&nbsp;GB with everything loaded, one long
    conversation will kill it. Reduce the context window before you reduce the model.</p>` },
  { h: 'Then pull the network cable',
    body: `<p>The point of the project. Unplug the ethernet, turn off Wi-Fi, and have a conversation with
    it.</p>
    <p>Nothing you say reaches anyone. That is a genuinely different object from a smart speaker, and it is
    worth a minute of appreciating.</p>` }
],

libraries: [
  { name: 'Ollama', by: 'Ollama', how: 'curl -fsSL https://ollama.com/install.sh | sh', why: 'Model management and a local HTTP API. Uses llama.cpp underneath with CUDA, and saves you building anything.' },
  { name: 'faster-whisper', by: 'SYSTRAN', how: 'pip3 install faster-whisper', why: 'CTranslate2 Whisper - several times faster than the reference implementation and runs on the GPU.' },
  { name: 'Piper', by: 'Rhasspy', how: 'pip3 install piper-tts', why: 'Fast neural text-to-speech that runs on the CPU, so it does not compete with the model for GPU time.' },
  { name: 'sounddevice', by: 'Matthias Geier', how: 'pip3 install sounddevice', why: 'Recording from the USB microphone.' },
  { name: 'pyserial', by: 'pySerial', why: 'The link to the Uno for the status ring.' },
  { name: 'jetson-stats', by: 'Raffaello Bonghi', how: 'sudo pip3 install jetson-stats', why: 'jtop. On this project you will watch memory constantly.' }
],

code: [
{
  h: 'Step 1: set the board up and measure it',
  intro: `<p>Do the headless step first. Then measure, because every later decision trades against the number
  you get.</p>`,
  name: 'jetson_llm_setup.sh',
  lang: 'Shell',
  code: `# --- free the memory the desktop is using -----------------------------
# ~800 MB, and on 8 GB shared with the GPU that is the difference
# between a model loading and being killed.
sudo systemctl set-default multi-user.target
sudo reboot
# ...then reconnect over SSH

free -h            # expect ~7.0 Gi available, not 6.2

# --- maximum performance ----------------------------------------------
sudo nvpmodel -m 0        # MAXN Super
sudo jetson_clocks
sudo nvpmodel -q          # confirm

sudo pip3 install -U jetson-stats
# open jtop in a second terminal and leave it there

# --- a little swap, as a MARGIN and not as headroom -------------------
# It stops a transient allocation killing a process. It is NOT a way to
# run a model that does not fit - a swapping model runs at about one
# token every few seconds.
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# --- Ollama -----------------------------------------------------------
curl -fsSL https://ollama.com/install.sh | sh

# Q4_K_M by default: ~4.9 GB of weights for an 8B model.
ollama pull llama3.1:8b

# A smaller one to compare against - about 2.2 GB, roughly twice as fast
ollama pull phi3:mini

# --- MEASURE. Do not trust anyone else's benchmark. -------------------
ollama run llama3.1:8b --verbose
# Ask it something, then read the summary it prints:
#   eval rate: ~18-20 tokens/s   <- generation, the number that matters
#   prompt eval rate: much higher
#
# Seeing 2-4 tokens/s? Check jtop. If GPU is idle you are on the CPU.

# --- speech in and out -------------------------------------------------
sudo apt update
sudo apt install -y python3-pip portaudio19-dev libsndfile1 alsa-utils
pip3 install faster-whisper piper-tts sounddevice pyserial

# Check the audio devices exist and note their numbers
arecord -l
aplay -l

# Record five seconds and listen to it. Whisper is good and it cannot
# recover words that were never in the recording.
arecord -D plughw:1,0 -f S16_LE -r 16000 -c 1 -d 5 test.wav
aplay test.wav

# A Piper voice
mkdir -p ~/piper && cd ~/piper
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alba/medium/en_GB-alba-medium.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alba/medium/en_GB-alba-medium.onnx.json
echo "Testing the voice." | piper -m en_GB-alba-medium.onnx -f t.wav && aplay t.wav`,
  after: `<p><strong>The <code>--verbose</code> eval rate is the number to write down.</strong> Everything else
  in this project trades against it: a bigger model is slower, a longer context is slower, and a second
  concurrent model steals from it.</p>
  <p><strong>If you see 2-4 tokens a second</strong>, you are running on the CPU. That is the single most
  common Jetson mistake and <code>jtop</code> answers it in three seconds - GPU utilisation should be pinned
  during generation.</p>`
},
{
  h: 'Step 2: the assistant',
  intro: `<p>Push to talk, transcribe, think, speak. Sequential on purpose - the three models contending for
  the GPU at once is slower than doing them in turn.</p>`,
  name: 'assistant.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Fully local voice assistant.

Whisper (GPU) -> Llama 3.1 8B via Ollama (GPU) -> Piper (CPU) -> speaker

Nothing leaves the board. Unplug the network and it still works.
"""

import io
import json
import queue
import subprocess
import time
import wave

import numpy as np
import requests
import serial
import sounddevice as sd
from faster_whisper import WhisperModel

SAMPLE_RATE = 16000
MODEL = "llama3.1:8b"
PIPER_VOICE = "/home/jetson/piper/en_GB-alba-medium.onnx"
UNO_DEV = "/dev/ttyACM0"

"""Context window. This is MEMORY, not just a setting - the KV cache
is roughly 130 MB per 1000 tokens for an 8B model, and it is on top
of the 4.9 GB of weights. 2048 is plenty for a spoken conversation
and saves about a gigabyte over 8192."""
CONTEXT_TOKENS = 2048

SYSTEM = (
    "You are a helpful assistant on a small computer in someone's home. "
    "Answer in at most three short sentences - your reply is going to be "
    "read aloud, so keep it brief and use plain words. Never use lists, "
    "markdown or emoji."
)

history = []


class Status:
    """The LED ring, driven by an Uno because Linux cannot time WS2812s."""

    def __init__(self, dev):
        try:
            self.ser = serial.Serial(dev, 115200, timeout=0.2)
            time.sleep(2.0)
        except serial.SerialException:
            self.ser = None
            print("no Uno - running without the ring")

    def set(self, state):
        print(f"[{state}]")
        if self.ser:
            self.ser.write((state[0].upper() + "\\n").encode())


def record_while_held(status):
    """Record until the Uno says the button was released.

    Push-to-talk rather than a wake word: no fourth model in memory,
    no false triggers, and the user knows exactly when it is listening."""
    status.set("listening")
    frames = []
    q = queue.Queue()

    def cb(indata, n, t, s):
        q.put(indata.copy())

    with sd.InputStream(samplerate=SAMPLE_RATE, channels=1,
                        dtype="int16", callback=cb):
        while True:
            frames.append(q.get())
            if status.ser and status.ser.in_waiting:
                line = status.ser.readline().decode(errors="ignore").strip()
                if line == "UP":
                    break
            if len(frames) * 512 / SAMPLE_RATE > 30:
                break                       # hard cap at 30 seconds

    return np.concatenate(frames).flatten()


def transcribe(whisper, audio):
    t0 = time.time()
    segments, info = whisper.transcribe(
        audio.astype(np.float32) / 32768.0,
        beam_size=1,                        # greedy: faster, fine for commands
        language="en",
        vad_filter=True,                    # drops silence before the model sees it
    )
    text = " ".join(s.text for s in segments).strip()
    print(f"  heard in {time.time()-t0:.1f}s: {text!r}")
    return text


def think(prompt):
    """Stream from Ollama and yield complete sentences.

    Streaming matters: the first sentence can be spoken while the rest
    is still generating, which takes the perceived wait from 8 seconds
    to about 2."""
    global history
    history.append({"role": "user", "content": prompt})

    messages = [{"role": "system", "content": SYSTEM}] + history[-8:]

    r = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": MODEL,
            "messages": messages,
            "stream": True,
            "options": {"num_ctx": CONTEXT_TOKENS, "temperature": 0.7},
        },
        stream=True,
        timeout=120,
    )

    buf, full = "", ""
    for line in r.iter_lines():
        if not line:
            continue
        chunk = json.loads(line)
        piece = chunk.get("message", {}).get("content", "")
        buf += piece
        full += piece

        # Emit on sentence boundaries so speech can start early.
        while True:
            cut = -1
            for mark in ".!?":
                i = buf.find(mark)
                if i >= 0 and (cut < 0 or i < cut):
                    cut = i
            if cut < 0:
                break
            sentence, buf = buf[:cut + 1].strip(), buf[cut + 1:]
            if sentence:
                yield sentence

    if buf.strip():
        yield buf.strip()

    history.append({"role": "assistant", "content": full})


def speak(text):
    """Piper to stdout, straight into aplay. No temporary file, so the
    sound starts as soon as the first samples exist."""
    piper = subprocess.Popen(
        ["piper", "-m", PIPER_VOICE, "--output_raw"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL)
    play = subprocess.Popen(
        ["aplay", "-r", "22050", "-f", "S16_LE", "-t", "raw", "-q", "-"],
        stdin=piper.stdout, stderr=subprocess.DEVNULL)

    piper.stdin.write(text.encode())
    piper.stdin.close()
    play.wait()


def main():
    status = Status(UNO_DEV)
    status.set("thinking")

    print("loading whisper...")
    # int8_float16 on the GPU: about 150 MB and several times real time.
    whisper = WhisperModel("base", device="cuda", compute_type="int8_float16")

    # Warm the language model so the first question is not slow. Ollama
    # unloads after five minutes idle by default - see the tuning notes.
    print("warming the model...")
    requests.post("http://localhost:11434/api/chat",
                  json={"model": MODEL, "messages":
                        [{"role": "user", "content": "hi"}],
                        "stream": False,
                        "options": {"num_ctx": CONTEXT_TOKENS}},
                  timeout=300)

    status.set("ready")
    print("\\nhold the button and speak\\n")

    while True:
        if status.ser and status.ser.in_waiting:
            if status.ser.readline().decode(errors="ignore").strip() != "DOWN":
                continue
        else:
            input("press enter to talk (no Uno)... ")

        audio = record_while_held(status)

        status.set("thinking")
        text = transcribe(whisper, audio)
        if len(text) < 3:
            status.set("ready")
            continue

        t0 = time.time()
        first = True
        for sentence in think(text):
            if first:
                print(f"  first sentence after {time.time()-t0:.1f}s")
                status.set("speaking")
                first = False
            print("  >", sentence)
            speak(sentence)

        status.set("ready")


if __name__ == "__main__":
    main()`,
  after: `<p><strong>Streaming sentence by sentence is what makes it feel usable.</strong> Generating a
  three-sentence answer takes about eight seconds at 20 tokens a second. Waiting for all of it and then
  speaking feels broken; speaking the first sentence while the rest generates drops the perceived wait to
  about two seconds, and the speech takes longer than the generation anyway.</p>
  <p><strong>Push-to-talk rather than a wake word</strong> is a deliberate memory decision. A wake-word model
  is a fourth thing in the 8&nbsp;GB, it runs continuously, and it produces false triggers. A button costs
  nothing and the user always knows whether it is listening.</p>
  <p><strong><code>num_ctx</code> is a memory setting.</strong> Leaving it at the model's default asks for a
  KV cache far larger than the weights, and on this board that is an out-of-memory kill rather than a slow
  response.</p>`
},
{
  h: 'The Uno side',
  intro: `<p>Button and ring. Twenty lines, and it exists because Linux cannot produce a 150-nanosecond
  pulse reliably.</p>`,
  name: 'status_ring.ino',
  code: `/* ------------------------------------------------------------------
   Status ring and push-to-talk button.

   To the Jetson :  DOWN / UP  when the button changes
   From the Jetson:  L listening  T thinking  S speaking  R ready
   ------------------------------------------------------------------ */

#include <FastLED.h>

#define RING_PIN   6
#define BUTTON_PIN 2
#define NUM_LEDS  16

CRGB leds[NUM_LEDS];
char state = 'R';
bool wasDown = false;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  FastLED.addLeds<WS2812B, RING_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(40);
  FastLED.clear(true);
}

void loop() {
  // --- button, debounced ---------------------------------------------
  static unsigned long lastChange = 0;
  bool down = !digitalRead(BUTTON_PIN);
  if (down != wasDown && millis() - lastChange > 40) {
    lastChange = millis();
    wasDown = down;
    Serial.println(down ? F("DOWN") : F("UP"));
  }

  // --- state from the Jetson -----------------------------------------
  while (Serial.available()) {
    char c = Serial.read();
    if (c == 'L' || c == 'T' || c == 'S' || c == 'R') state = c;
  }

  animate();
}

void animate() {
  static uint8_t phase = 0;
  phase++;

  switch (state) {

    case 'L':   // listening - a steady blue ring
      fill_solid(leds, NUM_LEDS, CRGB(0, 40, 120));
      break;

    case 'T': { // thinking - a chase, because 3-8 seconds of silence
                // needs to look like activity rather than a crash
      fill_solid(leds, NUM_LEDS, CRGB::Black);
      for (int i = 0; i < 4; i++) {
        leds[(phase / 2 + i * 4) % NUM_LEDS] = CRGB(120, 60, 0);
      }
      break;
    }

    case 'S':   // speaking - a gentle breathe
      fill_solid(leds, NUM_LEDS,
                 CRGB(0, 100, 40).nscale8(120 + sin8(phase * 3) / 3));
      break;

    default:    // ready - one dim dot, so the device does not glow at
                // you all evening
      fill_solid(leds, NUM_LEDS, CRGB::Black);
      leds[0] = CRGB(8, 8, 8);
  }

  FastLED.show();
  delay(20);
}`,
  after: `<p>The thinking animation earns its place. Three to eight seconds of silence between the question and
  the first word is a long time, and without any indication people assume it has crashed and press the button
  again - which cancels the answer they were waiting for.</p>`
}],

upload: `
<p>Python on the Jetson, sketch to the Uno. You can flash the Uno from the Jetson itself, since it is a Linux
machine with USB ports.</p>
<div class="note danger"><span class="t">Go headless before installing anything</span>
<p><code>sudo systemctl set-default multi-user.target</code>. The 800&nbsp;MB the desktop uses is shared with
the GPU and is the difference between a model loading and an out-of-memory kill.</p></div>
<div class="note warn"><span class="t">Keep jtop open the whole time</span>
<p>You will refer to it constantly: memory when a model loads, GPU utilisation when something is slow, and
temperature when throughput drops after ten minutes.</p></div>`,

tune: [
  { h: 'Choosing a model, honestly',
    body: `<p><strong>Llama 3.1 8B Q4_K_M</strong> (~4.9&nbsp;GB, ~18-20 tok/s) is the best general answer on
    8&nbsp;GB. Good reasoning, good general knowledge, comfortable headroom.</p>
    <p><strong>Phi-3 mini</strong> (~2.2&nbsp;GB, ~40 tok/s) is roughly twice as fast and clearly weaker at
    anything requiring reasoning. For a command-and-control assistant it is arguably the better choice.</p>
    <p><strong>Qwen2.5 7B</strong> is a strong alternative to Llama at a similar size, and noticeably better
    at non-English.</p>
    <p>The consistent finding: a larger model quantised harder beats a smaller model at higher precision for
    the same memory. Prefer 8B-at-Q4 over 3B-at-Q8.</p>` },
  { h: 'Stop Ollama unloading the model',
    body: `<p>By default Ollama frees the model after five minutes idle, so the first question after a gap
    takes 10-20 seconds while 4.9&nbsp;GB loads from disk.</p>
    <p><code>OLLAMA_KEEP_ALIVE=-1</code> in its systemd unit keeps it resident permanently. That is the
    right setting for a dedicated assistant, and it means 5&nbsp;GB is permanently spoken for.</p>` },
  { h: 'Where the perceived latency actually goes',
    body: `<p>Measure each stage. Typically: recording (as long as you speak), Whisper 0.5-1.5&nbsp;s,
    time-to-first-token 0.5-2&nbsp;s, then generation at your measured rate.</p>
    <p>Sentence streaming already hides most of the generation. After that, the biggest remaining win is a
    smaller Whisper model - <code>tiny</code> instead of <code>base</code> roughly halves transcription time
    and is noticeably worse on accents.</p>` },
  { h: 'Give it your own documents',
    body: `<p>Retrieval-augmented generation: embed a folder of your own notes, find the relevant chunks for
    each question, and put them in the prompt. An assistant that can answer from your own manuals and notes is
    far more useful than one relying on what the model memorised.</p>
    <p><code>nomic-embed-text</code> through Ollama plus a small vector store is a weekend. Watch the memory -
    the embedding model is another 300&nbsp;MB resident.</p>` },
  { h: 'Let it control things',
    body: `<p>Ask the model to emit a JSON command when a request maps to an action, and execute it. The
    <a href="project.html?p=lte-remote-switch">remote switch</a> and
    <a href="project.html?p=smart-thermostat">thermostat</a> both take simple commands.</p>
    <p>Validate strictly and whitelist hard. A language model is a text generator and will sometimes emit a
    plausible command you never defined - treat its output as untrusted input, because that is exactly what it
    is.</p>` },
  { h: 'A wake word, if you must',
    body: `<p>openWakeWord is small and runs on the CPU. It costs a few hundred megabytes resident and a
    steady CPU load, and it produces false triggers.</p>
    <p>The button is better for a desk device. A wake word is worth it for something across a room, and then
    accept that it will occasionally answer the television.</p>` },
  { h: 'Add eyes',
    body: `<p>A vision-language model - LLaVA or Qwen2-VL - lets you point a camera at something and ask about
    it. They are big: a 7B VLM at Q4 is around 5&nbsp;GB and leaves very little room, so you would swap it in
    place of the text model rather than running both.</p>
    <p>That trade is the clearest illustration of the 8&nbsp;GB constraint in the whole project.</p>` }
],

trouble: [
  { q: 'The process is killed while loading the model',
    a: `Out of memory. Go headless if you have not, check <code>free -h</code>, lower
    <code>num_ctx</code>, and use a smaller quantisation. Do not add swap to make it fit - it will load and
    then run at about a token every few seconds.` },
  { q: 'Two to four tokens a second',
    a: `Running on the CPU. Check <code>jtop</code> - GPU utilisation should be pinned during generation.
    Reinstall Ollama, and make sure you have not installed a CPU-only build of anything.` },
  { q: 'The first question after a pause takes twenty seconds',
    a: `Ollama unloaded the model after five minutes idle. Set <code>OLLAMA_KEEP_ALIVE=-1</code> in its
    service environment.` },
  { q: 'Throughput falls after ten minutes',
    a: `Thermal throttling. <code>jtop</code> shows the temperatures and the throttle flag. Sustained
    generation is the hardest this board works - improve airflow.` },
  { q: 'Whisper is slow',
    a: `It is on the CPU. <code>device="cuda"</code> and <code>compute_type="int8_float16"</code>. Also check
    you installed <code>faster-whisper</code> rather than the reference <code>openai-whisper</code>, which is
    several times slower.` },
  { q: 'Transcription is wrong or empty',
    a: `Listen to the recording. Whisper is good and cannot recover words that were never captured. Check the
    microphone level with <code>arecord</code>, and turn <code>vad_filter</code> on so silence is not fed to
    the model.` },
  { q: 'It answers in bullet points and reads them aloud',
    a: `The system prompt is being ignored, which smaller models do more. Strengthen it, and strip markdown
    from the text before it reaches Piper - a spoken asterisk is jarring.` },
  { q: 'No sound out',
    a: `<code>aplay -l</code> to find the device, then set it as default in <code>~/.asoundrc</code> or pass
    <code>-D plughw:N,0</code>. USB audio devices move between boots if you plug things in different
    orders.` },
  { q: 'It forgets what we were talking about',
    a: `The history is trimmed to the last eight messages, and <code>num_ctx</code> caps it further. Raise
    both if you have memory to spare - and remember the KV cache is about 130&nbsp;MB per 1000 tokens.` }
],

next: `
<ul>
  <li><strong>The same board, watching instead of listening</strong> -
  <a href="project.html?p=jetson-orin-vision">real-time vision</a> covers JetPack, TensorRT and the GPU in
  more depth.</li>
  <li><strong>The cheap version of this idea</strong> -
  <a href="project.html?p=uno-q-voice-control">UNO Q voice control</a> recognises twenty phrases for a fifth
  of the price. Building it first shows you exactly what an LLM adds and what it costs.</li>
  <li><strong>Give it something to do</strong> - the
  <a href="project.html?p=smart-thermostat">thermostat</a> and
  <a href="project.html?p=lte-remote-switch">remote switch</a> both take simple commands, and an assistant
  that can actually act is a different object from one that only talks.</li>
  <li><strong>Give it eyes</strong> - <a href="project.html?p=jetson-pose-coach">pose estimation</a> and a
  vision-language model both run on this board, one at a time.</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">Hardware</span>
<ul>
  <li><strong>Use the supplied 19 V brick.</strong> Sustained inference is the most power this board draws and
  undervoltage causes reboots under load.</li>
  <li><strong>It gets hot.</strong> Airflow over the heatsink, and do not enclose it without planning for
  it.</li>
  <li><strong>Shut down properly</strong> - <code>sudo shutdown -h now</code>. An NVMe interrupted mid-write
  is as recoverable-in-theory and annoying-in-practice as any other filesystem.</li>
  <li><strong>The 40-pin header is 3.3 V and not 5 V tolerant.</strong> Nothing but USB between the Jetson and
  the Uno.</li>
</ul>
</div>
<div class="note danger"><span class="t">A microphone in a room, and a model that will confidently be wrong</span>
<ul>
  <li><strong>The privacy property here is real and worth protecting.</strong> Nothing leaves the board -
  you can unplug the network and it still works. If you later add a cloud fallback, you have built a
  different object and should say so to anyone in the room.</li>
  <li><strong>Tell people the microphone is there.</strong> Push-to-talk makes that much easier than a wake
  word, because it is only listening when someone is holding a button.</li>
  <li><strong>The model will state wrong things with complete confidence.</strong> A quantised 8B knows less
  than you think and hallucinates more than a large hosted model. Do not use it for medical, legal, financial
  or safety information, and do not put its output anywhere it will be mistaken for fact.</li>
  <li><strong>If you let it control things, whitelist hard.</strong> Treat generated commands as untrusted
  input - because a text generator emitting a plausible command you never defined is a normal Tuesday, not an
  edge case.</li>
</ul>
</div>`
});
