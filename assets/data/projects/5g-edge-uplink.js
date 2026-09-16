/* RM500Q-GL 5G NR: a gigabit uplink from a field, and an honest look at when that is worth it. */
AB.addProject({
slug: '5g-edge-uplink',
title: '5G edge uplink for a camera site',
cat: 'cellular',
level: 4,
time: '10 hours',
solder: false,
board: 'UNO Q + RM500Q',
tags: ['5g', 'nr', 'rm500q', 'sub-6', 'mimo', 'qmi', 'mbim', 'edge', 'uplink', 'linux', 'streaming'],
blurb: 'A camera site with no fibre, no DSL and no Wi-Fi, pushing live video over 5G while a local model decides what is worth sending. Also a clear account of when 5G is ridiculous overkill, which is most of the time.',

skills: ['5G NR sub-6', 'NSA and SA modes', '4x4 MIMO', 'QMI and MBIM on Linux', 'Thermal design', 'Uplink-limited system design'],

intro: `
<p>Everything else in this theme sends kilobytes. This sends gigabytes, and the honest question to answer
first is whether you should.</p>
<p><strong>When 5G is silly:</strong> a temperature sensor, an alarm, a meter reading, anything a
<a href="project.html?p=nbiot-field-sensor">$25 NB-IoT module</a> handles for a tenth of the cost and a
thousandth of the power. If your payload fits in a text message, this project is the wrong answer to your
problem.</p>
<p><strong>When it earns its place:</strong> when the thing you need to move is <em>video</em>, from somewhere
with no fixed line. A construction site, a remote installation, an event, a vehicle, a temporary camera on a
bridge. LTE gives you maybe 20-50&nbsp;Mbps of uplink on a good day; 5G sub-6 with four antennas will do
100-200 and sometimes considerably more. That is the difference between one compressed stream and several good
ones, and there is no other way to get it without laying cable.</p>
<p>This build pairs a 5G modem with the <a href="project.html?p=uno-q-object-detection">UNO Q</a> so the site
can be clever about what it sends: the model runs locally, decides what matters, and the 5G link carries only
that - plus a live stream on demand when someone actually wants to look.</p>
<p>It is the most expensive project in this book by a clear margin. The section at the end adds it up
honestly.</p>`,

what: [
  'Attach to a 5G NR network and measure what you actually get, rather than what the coverage map claims.',
  'Bring the modem up on Linux properly, with QMI or MBIM rather than the slow fallback everyone ends up on by accident.',
  'Run local object detection so the uplink carries events and clips, not a permanent raw stream.',
  'Serve live video on demand, at a bitrate chosen from the measured uplink.',
  'Fail down to LTE gracefully when 5G is not available, which is often.',
  'Keep the modem cool enough to sustain throughput, which is a real engineering problem rather than a footnote.'
],

how: `
<p><strong>NSA and SA, which decides what "5G" means on your network.</strong></p>
<p><strong>Non-standalone</strong> is how nearly all 5G was first deployed: the control plane runs over an
existing LTE cell and the 5G carrier is bolted on for extra data capacity. You need LTE coverage to have 5G at
all, and latency is essentially LTE's.</p>
<p><strong>Standalone</strong> is a 5G core with no LTE anchor. Lower latency, proper network slicing, and
deployment is still patchy in most countries.</p>
<p>The module does both. <code>AT+QNWPREFCFG="mode_pref"</code> selects, and <code>AT+QENG="servingcell"</code>
tells you what you actually got. Expect NSA in most places, and expect "5G" on the status bar to sometimes
mean an LTE anchor with a thin NR carrier attached.</p>

<p><strong>Sub-6, not mmWave.</strong> The RM500Q is sub-6&nbsp;GHz - bands up to about 6&nbsp;GHz, which is
what almost all deployed 5G is. mmWave (24&nbsp;GHz and up) is the version with the astonishing headline
speeds and it barely exists outside a few US cities, needs line of sight to the cell, and is stopped by a
hand. Sub-6 is the one that works, and it is what this project uses.</p>

<p><strong>4x4 MIMO, and why all four antennas matter.</strong> 5G's throughput comes substantially from
spatial multiplexing: four antennas at each end, four independent data streams through the same spectrum, the
receiver separating them by their different propagation paths.</p>
<p>Fit two antennas instead of four and you do not get 75% of the speed - you get roughly half, because you
have halved the number of streams. Fit one and you get a quarter. <strong>All four, spaced as far apart as the
enclosure allows</strong>, ideally with some orientation diversity. This is the single biggest performance
decision in the build and it costs $25.</p>

<p><strong>Getting data through it on Linux.</strong> The modem enumerates as several USB interfaces and there
are four ways to use it, which is why so many people end up on the slowest one by accident:</p>
<ul>
  <li><strong>RNDIS / ECM</strong> - appears as a plain network card. Zero configuration, works instantly, and
  caps out somewhere around 300-400&nbsp;Mbps because everything goes through the host's network stack as
  ethernet frames. This is the one you get by default.</li>
  <li><strong>MBIM</strong> - the standardised modem interface. ModemManager drives it, it is reliable, and it
  is fast enough for most purposes.</li>
  <li><strong>QMI</strong> - Qualcomm's own protocol, with <code>qmi_wwan</code> and
  <code>libqmi</code>. Fastest, and with <code>raw_ip</code> mode plus the pass-through data path it will
  saturate the modem.</li>
  <li><strong>PCIe</strong> - the fastest of all and needs a host with an M.2 PCIe slot, which the USB carrier
  board is not.</li>
</ul>
<p>Start on RNDIS to prove the SIM and the coverage. Move to QMI when you find your throughput plateau is the
interface rather than the network.</p>

<p><strong>Heat is a design constraint, not a footnote.</strong> The module dissipates 3-5&nbsp;W sustained
and more in bursts. Left bare it will reach its thermal limit within minutes of a sustained upload and reduce
its own transmit power and modulation to survive - so throughput quietly halves and nothing reports an
error.</p>
<p>It needs a heatsink in contact with the module's shield and airflow over it. A "5G is slow after ten
minutes" complaint is a thermal problem every single time.</p>

<p><strong>Uplink is the scarce resource.</strong> Mobile networks are built for downlink - people watch far
more than they send - so the uplink allocation is a fraction of the downlink. A link that reports 800&nbsp;Mbps
down might give you 60 up, and it is the uplink that a camera site lives on.</p>
<p>Measure the uplink specifically. The download figure is the one every speed test shouts about and the one
that matters least here.</p>`,

bom: [
  { id: 'rm500q', qty: 1, note: 'Quectel RM500Q-GL, M.2 Key-B, global bands. The SIM8200 is an alternative with similar performance and worse Linux documentation.' },
  { id: 'm2-carrier', qty: 1, note: 'USB 3 carrier with a SIM slot and four antenna connectors. It must have its own power input - USB 3 alone cannot feed this module at full tilt.' },
  { id: '5g-ant', qty: 1, note: 'All four. Fitting two roughly halves your throughput. This is the highest-value $25 in the project.' },
  { id: 'uno-q', qty: 1, note: 'The Linux host. A Jetson Orin Nano works too and is much faster at vision - see the object detection projects for the trade.' },
  { id: 'usb-cam', qty: 1, note: 'UVC webcam. Get one that does hardware H.264 if you can - it moves the encoding off the CPU, which matters when the CPU is also running a model.' },
  { id: 'usbc-hub', qty: 1, note: 'Powered. The host needs a camera and the modem at once, and both are hungry.' },
  { id: 'iot-sim', qty: 1, note: 'NOT a per-megabyte IoT SIM. This project moves gigabytes - you need a consumer or business data plan with a real allowance. Read the cost section before you start.' },
  { id: 'psu5v3a', qty: 2, note: 'One for the host, one for the carrier board. The modem peaks well above what a shared supply will give.' },
  { id: 'fan40', qty: 1, note: 'Over the modem. Not optional - see the thermal notes.' },
  { id: 'standoffs', qty: 1, note: 'Both boards off any conductive surface, with airflow underneath.' },
  { id: 'box-ip65', qty: 1, note: 'If it lives outdoors. Antennas OUTSIDE on bulkheads - a metal box around a 5G modem is a Faraday cage.' },
  { id: 'usb-cable', qty: 2, own: true }
],

tools: [{ id: 'dmm', own: true }, { id: 'cutters', own: true }],

build: {
  parts: [
    { id: 'host', comp: 'unoq',   at: [-42, 40] },
    { id: 'm2',   comp: 'm2mod',  at: [44, 20] },
    { id: 'cam',  comp: 'webcam', at: [-46, -54] },
    { id: 'fan',  comp: 'fan',    at: [44, -48] }
  ],
  wires: [
    { from: 'm2.USB',  to: 'host.USB',   color: 'white',  note: 'USB 3 from the carrier to the host. This is the data path - USB 2 caps you at 480 Mbps and the modem exceeds it' },
    { from: 'cam.USB', to: 'host.QWIIC', color: 'white',  note: 'Camera into the host, via the powered hub in practice' },
    { from: 'fan.+',   to: 'host.5V',    color: 'red',    note: 'Fan over the modem heatsink. Run it continuously - see the thermal notes' },
    { from: 'fan.-',   to: 'host.GND1',  color: 'black',  note: 'Fan ground' }
  ]
},

wireNotes: `
<div class="note danger"><span class="t">Never power the modem without all four antennas</span>
<p>Same rule as every transmitter, and more emphatic here because there are four to forget. The module will
transmit on all of them and reflected power degrades the amplifiers.</p>
<p>Fit all four before the carrier board is ever powered. They are u.FL connectors - fragile, and they push on
rather than screwing. Seat them squarely with a fingernail and never pull on the cable.</p></div>

<div class="note danger"><span class="t">The carrier needs its own power. USB 3 is not enough.</span>
<p>USB 3 supplies 900&nbsp;mA at 5&nbsp;V - 4.5&nbsp;W - and the RM500Q can pull more than that on its own in
a transmit burst, before the carrier board's own regulators take their share.</p>
<p>Symptoms of trying: the modem enumerates, attaches, works for a few seconds of real traffic and then drops
off the USB bus entirely. It looks like a driver problem and it is a power problem.</p>
<p>Use a carrier with a separate power input and feed it from its own supply.</p></div>

<div class="note danger"><span class="t">Heat: it will silently halve its own throughput</span>
<p>3-5&nbsp;W in a package the size of a stick of gum. Without a heatsink it reaches its thermal limit within
minutes of sustained upload, and then quietly backs off its modulation and power to survive.</p>
<p>No error is reported. Throughput simply drops and stays down. "It was fast at first" is always this.</p>
<p>A heatsink in contact with the module's metal shield - a thermal pad, not paste, because the shield is not
flat - and a fan moving air over it. The fan in the parts list is not decoration.</p></div>

<div class="note warn"><span class="t">Antenna placement is most of your throughput</span>
<ul>
  <li><strong>All four, as far apart as the box allows.</strong> MIMO works by the streams arriving along
  different paths; antennas bundled together see the same path and the gain collapses.</li>
  <li><strong>Mix the orientations.</strong> Two vertical, two at 45 degrees, is a reasonable default -
  polarisation diversity adds to the spatial kind.</li>
  <li><strong>Outside any metal.</strong> A metal enclosure ends the project. Bulkhead connectors through a
  plastic lid, or antennas mounted externally.</li>
  <li><strong>Away from the camera cable and the host board.</strong> A USB 3 cable is a notorious broadband
  noise source, and the 2.4&nbsp;GHz harmonics sit right where some 5G bands do.</li>
</ul></div>

<div class="note warn"><span class="t">There is no version of this that talks to an Arduino</span>
<p>The module has no UART data path worth using, needs USB 3 and a real driver stack, and expects a Linux
host. The AT command interface is still there over a serial device - and it is only for configuration and
diagnostics, not for moving data.</p>
<p>If you want cellular on a microcontroller, that is the
<a href="project.html?p=lte-remote-monitor">Cat-1 project</a>. This one is a small computer with a modem.</p></div>`,

solderSteps: [
  { h: 'Nothing to solder, and one thing to be careful with',
    body: `<p>The module screws into the M.2 slot, the antennas push on, the carrier takes a barrel jack. No
    soldering.</p>
    <p>The care is with the <strong>u.FL connectors</strong>. They are rated for a handful of mating cycles
    and they break. Push straight down with a fingernail until you feel a click - never at an angle, never
    with pliers, and never pull the cable to remove one.</p>
    <p>Fit all four before anything is powered.</p>` },
  { h: 'Thermal pad, then heatsink, then fan',
    body: `<p>The module's shield is not flat, so use a compressible thermal pad rather than paste - 1&nbsp;mm
    is usually right. Heatsink on top, held by the module's mounting screw or a clip, not by the pad's
    adhesive alone.</p>
    <p>Then the fan, blowing across the fins rather than at them. Continuous, not thermostatic - by the time a
    thermostat notices, the modem has already throttled.</p>` },
  { h: 'Mount both boards on standoffs with air underneath',
    body: `<p>The carrier's underside has exposed pads and the host board runs warm too. Nylon standoffs, and
    leave a gap for air rather than mounting flat to a panel.</p>` }
],

assembly: [
  { h: 'Get a data plan that suits this, before anything else',
    body: `<p>This is the step that decides whether the project is sensible. A per-megabyte IoT SIM is
    completely wrong here - a single hour of 5&nbsp;Mbps video is 2.2&nbsp;GB, which on a 1NCE-style tariff
    would cost more than the modem.</p>
    <p>You need a consumer or business data plan with a large or unlimited allowance. Check the small print
    for tethering restrictions and for a fair-use cap that throttles after some threshold.</p>` },
  { h: 'Bring the modem up on a laptop first',
    body: `<p>Before involving the host board. Plug the carrier into any Linux machine, and check
    <code>lsusb</code> and <code>dmesg</code>. The module takes 15-30 seconds to boot before it enumerates -
    it is a computer in its own right.</p>
    <p>Getting it working on a machine with a screen and a keyboard is far easier than debugging it headless.</p>` },
  { h: 'Talk to it with AT commands',
    body: `<p>It exposes several serial devices; usually <code>/dev/ttyUSB2</code> is the AT port.
    <code>minicom -D /dev/ttyUSB2</code> or <code>screen</code>.</p>
    <p>Work through <code>ATI</code>, <code>AT+CPIN?</code>, <code>AT+CSQ</code>,
    <code>AT+QNWPREFCFG="mode_pref"</code>, and <code>AT+QENG="servingcell"</code> - the last one is the most
    informative command in the project and tells you exactly what you are attached to.</p>` },
  { h: 'Get an IP address the easy way first',
    body: `<p>RNDIS gives you a network interface with no configuration. Set the APN, activate, and you should
    have an address. Run a speed test.</p>
    <p>This proves SIM, coverage, antennas and plan all at once. Do not move to QMI until this works - it is
    the same problem with more moving parts.</p>` },
  { h: 'Measure the uplink specifically, and at the real location',
    body: `<p><code>iperf3</code> against a server you control, or <code>speedtest-cli</code>. Run it several
    times over an hour - mobile throughput varies enormously with cell load, and a single measurement at
    3&nbsp;am tells you nothing about 6&nbsp;pm.</p>
    <p><strong>The uplink number is the one that matters.</strong> Design the video bitrate for the
    <em>worst</em> uplink you measured, not the best, with 40% headroom.</p>` },
  { h: 'Check what you are actually attached to',
    body: `<p><code>AT+QENG="servingcell"</code>. You are looking for whether it says NR5G-NSA, NR5G-SA or
    just LTE, and for the RSRP and SINR.</p>
    <p>It is completely normal to find the phone says 5G and the modem is on LTE, or that NR is attached with
    a narrow carrier. Knowing which you have explains the throughput you are seeing.</p>` },
  { h: 'Move to QMI if RNDIS is the bottleneck',
    body: `<p>If you plateau around 300-400&nbsp;Mbps regardless of signal, the interface is the limit.
    <code>qmi_wwan</code> with <code>raw_ip</code> mode, driven by <code>qmicli</code> or ModemManager.</p>
    <p>Worth doing for a camera site pushing multiple streams; not worth it if you are comfortably inside what
    RNDIS gives.</p>` },
  { h: 'Add the camera and the local model',
    body: `<p>The <a href="project.html?p=uno-q-object-detection">object detection project</a> is the
    foundation. Here the model's job changes: not to point a servo but to decide what deserves uplink.</p>
    <p>Record continuously to local storage; upload clips around detections; stream live only when asked.
    That turns a 24/7 gigabit problem into a few gigabytes a day.</p>` },
  { h: 'Watch the temperature under sustained load',
    body: `<p><code>AT+QTEMP</code> reports the module's internal sensors. Run a ten-minute upload and watch
    it climb.</p>
    <p>If throughput falls as temperature rises, that is thermal throttling and no software change will fix
    it. More heatsink, more air.</p>` },
  { h: 'Fail down to LTE deliberately',
    body: `<p>5G coverage is not continuous and a site that only works on NR will have outages. Configure the
    modem to accept LTE, and have the streaming bitrate adapt to the measured throughput rather than being
    fixed.</p>
    <p>A camera that drops to 2&nbsp;Mbps and keeps working beats one that stalls waiting for 5G to come
    back.</p>` }
],

libraries: [
  { name: 'libqmi / qmicli', by: 'freedesktop', how: 'apt install libqmi-utils', why: 'Drives the modem over QMI - the fastest of the USB data paths.' },
  { name: 'ModemManager', by: 'freedesktop', how: 'apt install modemmanager', why: 'Handles MBIM and QMI, reconnection and APN handling, so you do not write a state machine.' },
  { name: 'iperf3', by: 'ESnet', how: 'apt install iperf3', why: 'Honest throughput measurement, separately for up and down. Speed-test websites measure their own servers as much as your link.' },
  { name: 'FFmpeg', by: 'FFmpeg', how: 'apt install ffmpeg', why: 'Encoding and streaming. Use the hardware encoder if the host has one.' },
  { name: 'OpenCV', by: 'OpenCV', how: 'apt install python3-opencv', why: 'The local detection, as in the object detection project.' }
],

code: [
{
  h: 'Step 1: bring the modem up',
  intro: `<p>On any Linux machine first. The module takes half a minute to boot before it appears, which
  catches people into thinking it is dead.</p>`,
  name: 'modem_setup.sh',
  lang: 'Shell',
  code: `# Plug it in and WAIT. The modem boots its own firmware first -
# 15 to 30 seconds before anything enumerates.
sleep 30
lsusb | grep -i quectel
# Bus 002 Device 005: ID 2c7c:0800 Quectel Wireless Solutions RM500Q-GL

# What did the kernel make of it? Several interfaces appear at once.
dmesg | tail -40
ls /dev/ttyUSB*        # usually 0-3; ttyUSB2 is the AT port
ls /sys/class/net/      # wwan0 or usb0 appears here

sudo apt update
sudo apt install -y minicom libqmi-utils modemmanager iperf3

# --- talk to it -------------------------------------------------------
# minicom -D /dev/ttyUSB2 -b 115200
#
#   ATI                             module and firmware
#   AT+CPIN?                        -> READY
#   AT+CSQ                          quick signal check
#   AT+QNWPREFCFG="mode_pref"       which technologies are enabled
#   AT+QNWPREFCFG="mode_pref",AUTO  let it choose NR/LTE
#   AT+QENG="servingcell"           THE useful one - see below
#   AT+QTEMP                        internal temperatures
#
# AT+QENG="servingcell" returns something like:
#   +QENG:"servingcell","NOCONN","NR5G-SA","TDD",234,10,...,-85,-11,20
# The strings tell you NR5G-SA, NR5G-NSA or LTE, and the numbers near
# the end are RSRP, RSRQ and SINR. This single command answers
# "am I actually on 5G and how good is it".

# --- simplest data path: RNDIS ---------------------------------------
# Set the APN (context 1), then activate.
echo -e 'AT+CGDCONT=1,"IPV4V6","your.apn"\\r' > /dev/ttyUSB2
echo -e 'AT+QNETDEVCTL=1,1,1\\r' > /dev/ttyUSB2

sudo dhclient -v usb0        # or wwan0, whichever appeared
ip addr show usb0
ping -c 4 -I usb0 1.1.1.1

# --- measure, and care about the UPLINK ------------------------------
# Against your own server if you have one - public iperf servers are
# busy and measure themselves as much as you.
iperf3 -c your.server.example -t 30           # download
iperf3 -c your.server.example -t 30 -R        # upload  <-- this one

# Run it several times across a day. Mobile throughput varies with
# cell load far more than with anything you control.`,
  after: `<p><code>AT+QENG="servingcell"</code> is the command to learn. It distinguishes the three cases that
  all look like "5G" from the outside: <strong>NR5G-SA</strong> (a real 5G core), <strong>NR5G-NSA</strong>
  (an LTE anchor with an NR carrier), and plain <strong>LTE</strong> (no 5G at all, whatever the coverage map
  said).</p>
  <p>The SINR at the end is the best single predictor of throughput. Above 20&nbsp;dB is excellent; below 5
  and you will get a fraction of the headline rate no matter what else you do.</p>`
},
{
  h: 'Step 2: QMI, when RNDIS is the ceiling',
  intro: `<p>Only bother with this once you have measured a plateau that is clearly the interface rather than
  the network - typically a hard stop around 300-400&nbsp;Mbps regardless of signal.</p>`,
  name: 'qmi_connect.sh',
  lang: 'Shell',
  code: `# Switch the modem's USB composition to one that exposes QMI.
# 38 is a common QMI-capable mode on Quectel modules; check yours with
# AT+QCFG="usbnet" first, and note the modem REBOOTS after this.
echo -e 'AT+QCFG="usbnet",0\\r' > /dev/ttyUSB2
sleep 20

# raw_ip: the interface carries bare IP rather than ethernet frames.
# This is the setting that removes the RNDIS ceiling, and the
# interface must be DOWN to change it.
sudo ip link set wwan0 down
echo 'Y' | sudo tee /sys/class/net/wwan0/qmi/raw_ip
sudo ip link set wwan0 up

# Check the modem is happy before connecting
sudo qmicli -d /dev/cdc-wdm0 --dms-get-operating-mode
sudo qmicli -d /dev/cdc-wdm0 --nas-get-signal-info

# Start the data session
sudo qmicli -d /dev/cdc-wdm0 \\
  --wds-start-network="apn='your.apn',ip-type=4" \\
  --client-no-release-cid

# The modem hands out the address by DHCP on this interface
sudo udhcpc -i wwan0
# or: sudo dhclient -v wwan0

ip addr show wwan0
iperf3 -c your.server.example -t 30 -R

# --- keeping it up ----------------------------------------------------
# ModemManager does reconnection, APN handling and roaming properly,
# and is what you want for anything unattended:
sudo systemctl enable --now ModemManager
mmcli -L
mmcli -m 0
sudo mmcli -m 0 --simple-connect="apn=your.apn,ip-type=ipv4"`,
  after: `<p><code>raw_ip</code> is the setting that matters. In its default mode the interface pretends to be
  ethernet, so every packet gets a fabricated ethernet header added and stripped - which at gigabit rates is
  real CPU work on a small host. <code>raw_ip</code> carries bare IP and removes it.</p>
  <p>Note the modem reboots when you change its USB composition, and it can come back with different device
  node numbers. Do this before you rely on any path names.</p>`
},
{
  h: 'Step 3: send only what matters',
  intro: `<p>The strategy that makes a 5G camera site affordable. Record everything locally; upload clips
  around detections; stream live only on request, at a bitrate chosen from the measured uplink.</p>`,
  name: 'edge_uplink.py',
  lang: 'Python',
  code: `#!/usr/bin/env python3
"""
Edge uplink manager.

Continuous local recording, event clips pushed over 5G, live stream
on demand. The point is that a 24/7 upload is neither necessary nor
affordable, and a local model can tell the difference.
"""

import os
import time
import shutil
import subprocess
import threading
from collections import deque

CAMERA        = "/dev/video0"
LOCAL_DIR     = "/var/lib/edge/clips"
UPLINK_IFACE  = "wwan0"

# Measure YOUR uplink with iperf3 and put the WORST figure here, not
# the best. Mobile throughput at 6pm is not throughput at 3am.
MEASURED_UPLINK_MBPS = 40

# Never plan to use more than 60% of the uplink. The remainder absorbs
# cell load, weather, and the retransmissions that a congested link
# generates - and a stream that stalls is worse than a lower-quality
# one that does not.
STREAM_BITRATE_KBPS = int(MEASURED_UPLINK_MBPS * 1000 * 0.6)

CLIP_SECONDS  = 20
DAILY_BUDGET_GB = 5.0


class Budget:
    """A hard daily cap. A bug that uploads in a loop on a metered
    plan is a genuine financial risk, so the limit lives in code."""

    def __init__(self, gb):
        self.limit = gb * 1024 ** 3
        self.used = 0
        self.day = time.strftime("%Y-%m-%d")

    def allow(self, nbytes):
        today = time.strftime("%Y-%m-%d")
        if today != self.day:
            self.day, self.used = today, 0
        if self.used + nbytes > self.limit:
            return False
        self.used += nbytes
        return True

    def remaining_gb(self):
        return (self.limit - self.used) / 1024 ** 3


budget = Budget(DAILY_BUDGET_GB)


def uplink_mbps():
    """Rough live estimate from interface counters - enough to notice
    the link degrading, not a substitute for iperf3."""
    path = f"/sys/class/net/{UPLINK_IFACE}/statistics/tx_bytes"
    try:
        with open(path) as f:
            a = int(f.read())
        time.sleep(1.0)
        with open(path) as f:
            b = int(f.read())
        return (b - a) * 8 / 1e6
    except OSError:
        return 0.0


def record_continuous():
    """Segment continuously to local disk. Local storage is cheap and
    the uplink is not, so everything is kept here and only a fraction
    is ever sent."""
    os.makedirs(LOCAL_DIR, exist_ok=True)
    subprocess.Popen([
        "ffmpeg", "-nostdin", "-loglevel", "error",
        "-f", "v4l2", "-input_format", "h264",
        "-video_size", "1920x1080", "-framerate", "30",
        "-i", CAMERA,
        "-c", "copy",                      # already H.264 from the camera
        "-f", "segment", "-segment_time", str(CLIP_SECONDS),
        "-reset_timestamps", "1",
        "-strftime", "1",
        os.path.join(LOCAL_DIR, "%Y%m%d-%H%M%S.mp4"),
    ])


def prune_local(keep_gb=20):
    """Keep the disk from filling. Oldest first."""
    files = sorted(
        (os.path.join(LOCAL_DIR, f) for f in os.listdir(LOCAL_DIR)),
        key=os.path.getmtime)
    total = sum(os.path.getsize(f) for f in files)
    while total > keep_gb * 1024 ** 3 and files:
        f = files.pop(0)
        total -= os.path.getsize(f)
        os.remove(f)


def upload_clip(path, dest):
    """Push one clip. Checks the budget first, and re-encodes smaller
    if the link is currently poor."""
    size = os.path.getsize(path)

    if not budget.allow(size):
        print(f"  budget exhausted ({budget.remaining_gb():.1f} GB left) - "
              f"keeping {os.path.basename(path)} locally only")
        return False

    now = uplink_mbps()
    print(f"  uploading {os.path.basename(path)} "
          f"({size/1e6:.1f} MB, link ~{now:.0f} Mbps)")

    r = subprocess.run(["rsync", "-q", "--partial", "--timeout=120", path, dest])
    return r.returncode == 0


def live_stream(rtmp_url):
    """On-demand live stream, bitrate from the measured uplink.

    -maxrate and -bufsize matter more than -b:v: a variable bitrate
    encoder will happily burst past the uplink on a busy scene, and
    the resulting stall looks like a network fault."""
    br = f"{STREAM_BITRATE_KBPS}k"
    return subprocess.Popen([
        "ffmpeg", "-nostdin", "-loglevel", "error",
        "-f", "v4l2", "-input_format", "mjpeg",
        "-video_size", "1280x720", "-framerate", "25",
        "-i", CAMERA,
        "-c:v", "libx264", "-preset", "veryfast", "-tune", "zerolatency",
        "-b:v", br, "-maxrate", br, "-bufsize", f"{STREAM_BITRATE_KBPS*2}k",
        "-g", "50",                        # keyframe every 2 s
        "-f", "flv", rtmp_url,
    ])


if __name__ == "__main__":
    print(f"uplink measured at {MEASURED_UPLINK_MBPS} Mbps")
    print(f"stream bitrate set to {STREAM_BITRATE_KBPS} kbps (60%)")
    print(f"daily budget {DAILY_BUDGET_GB} GB")

    record_continuous()

    while True:
        prune_local()
        print(f"link now ~{uplink_mbps():.0f} Mbps, "
              f"budget left {budget.remaining_gb():.1f} GB")
        time.sleep(60)`,
  after: `<p><strong>Local recording plus selective upload</strong> is the whole economic argument. Continuous
  1080p at 5&nbsp;Mbps is 54&nbsp;GB a day; twenty-second clips around fifty detections is about
  600&nbsp;MB. The 5G link is then there for the live stream you actually ask for, when you ask for it.</p>
  <p><strong>The 60% headroom</strong> is not conservatism. Mobile uplink varies with cell load through the
  day, and an encoder configured for the best figure you measured will stall every evening. Design for the
  worst reading.</p>
  <p><strong>The hard daily budget in code</strong> exists because a bug in an upload loop on a consumer plan
  is a real bill. Put the limit somewhere it cannot be forgotten.</p>`
}],

upload: `
<p>No sketch here - this is a Linux host and a modem. Everything runs from the shell.</p>
<div class="note warn"><span class="t">Wait 30 seconds after plugging it in</span>
<p>The module boots its own firmware before it enumerates. <code>lsusb</code> immediately after plugging in
shows nothing and people conclude the module is dead. Wait, then look.</p></div>
<div class="note tip"><span class="t">Prove it on a laptop before the host board</span>
<p>Getting a 5G modem attached is much easier on a machine with a screen, a keyboard and a full desktop Linux.
Do that first, learn what good looks like, then move the working configuration to the host.</p></div>
<div class="note danger"><span class="t">Shut the host down properly</span>
<p><code>sudo shutdown -h now</code>, as with every Linux board in this book. Pulling power mid-write can
corrupt the filesystem - and this one is also writing video continuously, which widens the window.</p></div>`,

tune: [
  { h: 'Is this worth it? The arithmetic.',
    body: `<p>Modem $280, carrier $40, antennas $25, host $44, camera $25, supplies and cooling $20 - about
    <strong>$435</strong>, plus a data plan that has to be consumer-grade rather than IoT-grade.</p>
    <p><strong>Cheaper alternatives, in order:</strong> a Cat-4 LTE modem at $45 gives 20-50&nbsp;Mbps up,
    which carries one good 1080p stream and costs a tenth as much. A Cat-1 module at $20 carries stills and
    telemetry. An NB-IoT module at $25 carries numbers and runs for years on a battery.</p>
    <p><strong>5G is the right answer when:</strong> you need several simultaneous streams, or 4K, or genuinely
    low latency for remote control, or you are replacing a fixed line that would cost thousands to install.
    Otherwise it is an expensive way to send the same data.</p>
    <p>Work out your required uplink in megabits before you buy anything. It is usually smaller than it
    feels.</p>` },
  { h: 'Antenna work beats everything else',
    body: `<p>Four antennas, spread as widely as the enclosure allows, with mixed orientations. Then get them
    high and away from metal.</p>
    <p>Doubling from two to four antennas roughly doubles throughput on a good cell. No configuration change
    comes close to that.</p>
    <p>If the site is fixed and the cell is in a known direction, directional panel antennas will add another
    5-10&nbsp;dB - and at the edge of coverage that is the difference between NR and falling back to LTE.</p>` },
  { h: 'Lock to bands, or to NR, once you know the site',
    body: `<p><code>AT+QNWPREFCFG="nr5g_band"</code> and <code>"lte_band"</code> restrict the scan. On a fixed
    installation this speeds up attach and stops the modem wandering onto a weaker band.</p>
    <p>Do not do this on anything mobile, and keep LTE enabled as a fallback unless you are certain of
    continuous NR coverage - which almost nobody is.</p>` },
  { h: 'Thermal, properly',
    body: `<p><code>AT+QTEMP</code> in a loop while running <code>iperf3</code> for ten minutes. If
    throughput falls as temperature climbs, you are throttling.</p>
    <p>A bigger heatsink, more airflow, and thermal contact with the enclosure if it is metal. In an outdoor
    box in summer this is the dominant engineering problem, not the radio.</p>` },
  { h: 'Hardware encoding, if the host has it',
    body: `<p>Encoding 1080p30 H.264 in software costs a large fraction of a small host's CPU - which it also
    needs for the detection model.</p>
    <p>A camera that outputs H.264 directly lets you copy the stream rather than transcode it, which is close
    to free. Failing that, use the host's hardware encoder if it has one.</p>` },
  { h: 'Adaptive bitrate is the difference between working and not',
    body: `<p>A fixed bitrate stream on a mobile link will stall. Measure throughput continuously and step
    the encoder down when it drops.</p>
    <p>A 2&nbsp;Mbps stream that never stalls is far more useful than an 8&nbsp;Mbps one that freezes every
    evening rush hour.</p>` },
  { h: 'Add the model, and let it decide',
    body: `<p>The <a href="project.html?p=uno-q-object-detection">object detector</a> dropped in here changes
    the economics completely: upload on detection rather than continuously, and a site that would need
    54&nbsp;GB a day needs under one.</p>
    <p>That is the real argument for edge compute, and it is more compelling than the latency argument people
    usually reach for.</p>` }
],

trouble: [
  { q: 'The module does not appear in <code>lsusb</code>',
    a: `Wait 30 seconds - it boots its own firmware first. Then check the carrier has its own power connected,
    that the module is fully seated and screwed down, and that you are using a USB 3 port and cable. Check
    <code>dmesg</code> for enumeration errors.` },
  { q: 'It enumerates, then disappears under load',
    a: `Power. USB 3 alone cannot feed this module. Use the carrier's separate power input with its own
    supply. This failure looks exactly like a driver problem and is not.` },
  { q: 'It attaches to LTE and never to 5G',
    a: `Check <code>AT+QENG="servingcell"</code> for what is actually available. Then: is your plan
    5G-enabled, is there NR coverage at that spot, are all four antennas fitted, and is
    <code>AT+QNWPREFCFG="mode_pref"</code> allowing NR? In many places 5G simply is not there yet.` },
  { q: 'Throughput plateaus around 300-400 Mbps',
    a: `That is the RNDIS/ECM ceiling, not the network. Move to QMI with <code>raw_ip</code> enabled. If you
    are already on QMI, check you are on a USB 3 port - USB 2 caps at 480&nbsp;Mbps theoretical and rather
    less in practice.` },
  { q: 'Fast for ten minutes, then half the speed',
    a: `Thermal throttling, every time. <code>AT+QTEMP</code> while it runs. Heatsink and a fan. Nothing in
    software will fix it and no error will be reported.` },
  { q: 'Upload is a small fraction of download',
    a: `Expected. Mobile networks allocate far more spectrum to downlink. A link giving 800&nbsp;Mbps down
    might give 60 up, and for a camera site the uplink is the only number that matters. Measure it
    specifically with <code>iperf3 -R</code>.` },
  { q: 'Speeds vary wildly through the day',
    a: `Cell load. You are sharing the tower. Measure at the busiest hour and design for that, not for the
    3&nbsp;am figure. This is why the stream bitrate uses 60% of the worst measurement.` },
  { q: 'It works with the lid off and not with it on',
    a: `The enclosure. A metal box is a Faraday cage; even a plastic one with internal antennas costs you
    several dB. Bulkhead connectors and external antennas.` },
  { q: 'Data allowance gone in two days',
    a: `Continuous upload. 1080p at 5&nbsp;Mbps is 54&nbsp;GB a day. Record locally, upload events, stream on
    demand - and keep the hard daily cap in the code.` },
  { q: 'The carrier board gets hot and the modem resets',
    a: `The carrier's own regulators are working hard. Check its power input is adequate and that it has
    airflow too, not just the module.` }
],

next: `
<ul>
  <li><strong>Add the intelligence that makes it affordable</strong> - the
  <a href="project.html?p=uno-q-object-detection">UNO Q object detector</a> is the model that decides what is
  worth uploading.</li>
  <li><strong>A great deal more local compute</strong> - the
  <a href="project.html?p=jetson-orin-vision">Jetson Orin Nano</a> as the host runs YOLO at 30&nbsp;fps, so
  the uplink carries only genuinely interesting events.</li>
  <li><strong>Try the cheap version first</strong> - the
  <a href="project.html?p=lte-camera-uploader">LTE camera uploader</a> costs a tenth as much and may well be
  enough. Building it first is the honest way to find out whether you need this.</li>
  <li><strong>For sensors rather than video</strong> - the
  <a href="project.html?p=nbiot-field-sensor">NB-IoT sensor</a> is the opposite end of the same theme, and
  the right tool for almost everything that is not a camera.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">Hardware</span>
<ul>
  <li><strong>Never power the modem without all four antennas.</strong> Reflected power degrades the
  amplifiers.</li>
  <li><strong>Give the carrier its own supply.</strong> Undervolting a modem that pulls several watts causes
  drops that look like software faults.</li>
  <li><strong>It gets genuinely hot.</strong> The heatsink and fan are structural, not optional, and a
  throttling modem reports nothing.</li>
  <li><strong>u.FL connectors are fragile.</strong> Push straight, never pull the cable, and expect only a
  handful of mating cycles.</li>
  <li><strong>Shut the Linux host down properly</strong> - it is writing video continuously, so the window for
  filesystem damage is wide.</li>
</ul>
</div>
<div class="note danger"><span class="t">RF exposure, which is worth taking seriously here</span>
<p>This is the highest-power transmitter in this book - four chains, up to 23&nbsp;dBm each, transmitting
continuously during an upload rather than in brief bursts.</p>
<ul>
  <li><strong>Keep at least 20 cm between the antennas and people</strong> while it is transmitting. That is
  the standard separation distance used for fixed installations and it is not hard to arrange.</li>
  <li><strong>Do not mount antennas where someone will sit or stand close to them all day.</strong></li>
  <li><strong>Do not hold the antennas while uploading.</strong> It is also bad for throughput.</li>
</ul>
</div>
<div class="note warn"><span class="t">Money and law</span>
<ul>
  <li><strong>This moves gigabytes.</strong> An IoT SIM will produce a shocking bill. Check the tariff, check
  tethering rules, and keep the daily cap in the code.</li>
  <li><strong>A camera site is a surveillance installation</strong> whatever you call it - signage,
  a stated purpose, and the rules of wherever it is. The same points as the
  <a href="project.html?p=jetson-orin-vision">vision counter</a> apply, and apply more strongly to something
  that keeps video.</li>
  <li><strong>Do not expose the stream without authentication.</strong> An open RTMP endpoint is a camera
  anyone can watch.</li>
</ul>
</div>`
});
