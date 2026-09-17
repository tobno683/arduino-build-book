/* ==========================================================================
   boards.js - what each board is actually for.

   Keyed by the part id in parts.js, so the name and the price come from
   the shop and are never duplicated here. build-index.js checks that
   every part in the Board category has an entry and that every entry
   points at a real board - add a board to the shop without writing it up
   and the build complains.

   `tier` groups them on the page:
     classic  - 8-bit AVR, 5 V, the Arduino most people mean
     wireless - 32-bit with a radio on board
     special  - does one thing the others cannot
     linux    - runs an operating system, not a sketch

   Specs are the figures that change a decision. Clock speed rarely does;
   RAM, logic voltage and whether it has a radio almost always do.
   ========================================================================== */
window.AB = window.AB || {};

AB.boardGuide = {
  updated: '2026-09-17',

  /* The honest short answer, before 3,000 words of detail. */
  firstBoard: 'nano',
  firstBoardWhy: 'Same chip as the Uno, a third of the price, and it pushes straight into a breadboard so ' +
                 'your first project needs no soldering. Buy two - the second one is how you find out ' +
                 'whether a problem is your wiring or your board.'
};

AB.boards = [

/* --- 8-bit classics ---------------------------------------------------- */
{
  id: 'nano',
  tier: 'classic',
  chip: 'ATmega328P',
  tagline: 'The default first board, and still the right answer for most small projects.',
  specs: {
    clock: '16 MHz, 8-bit',
    ram: '2 KB SRAM',
    flash: '32 KB (0.5 KB used by the bootloader)',
    io: '14 digital, 8 analog inputs',
    logic: '5 V, and tolerant of everything in this book',
    usb: 'Micro-USB or USB-C via a CH340 or FTDI chip',
    wireless: 'None',
    power: '~19 mA running, ~5 uA in deep sleep with the regulator bypassed'
  },
  goodAt: [
    'Anything that reads a few sensors and drives a few outputs.',
    'Breadboard work - it straddles the centre channel and every pin is reachable.',
    'Being cheap enough to leave permanently inside a finished project.',
    'Running on batteries for months, once you strip the power LED and regulator.'
  ],
  badAt: [
    'Anything needing a network - there is no radio and adding one costs more than a board that has one.',
    'Holding data. 2 KB of RAM is perhaps 60 sensor readings, or one small string array.',
    'Floating point maths, which is emulated in software and roughly 50 times slower than integer.',
    'Driving more than about 200 mA total across all pins.'
  ],
  pick: 'Your first board, and every project afterwards that does not need Wi-Fi.',
  avoid: 'The moment you type the word "internet". Buy an ESP32 instead - it is cheaper.',
  gotchas: [
    'Clones ship with headers loose in the bag. Soldering them on is the ideal first soldering job.',
    'Most clones use a CH340 USB chip and need its driver on Windows and older macOS. The board looks dead until you install it.',
    'Old bootloader clones need "ATmega328P (Old Bootloader)" selected or uploads fail with a sync error.',
    'A0-A5 double as digital pins. A6 and A7 are analog only and cannot be used with digitalWrite.'
  ],
  note: 'The ATmega328P is from 2008 and is still the right answer more often than people expect, because ' +
        'most projects are not limited by the processor. If your project reads a sensor once a second and ' +
        'blinks something, a faster board changes nothing except the price.'
},

{
  id: 'uno',
  tier: 'classic',
  chip: 'ATmega328P',
  tagline: 'The same board as the Nano in a bigger, sturdier, more expensive package.',
  specs: {
    clock: '16 MHz, 8-bit',
    ram: '2 KB SRAM',
    flash: '32 KB',
    io: '14 digital, 6 analog inputs',
    logic: '5 V',
    usb: 'USB-B on the official board, micro or C on clones',
    wireless: 'None',
    power: '~45 mA - more than the Nano because of the extra regulator and LEDs'
  },
  goodAt: [
    'Taking shields, which is the only real reason to choose it over a Nano.',
    'Surviving a classroom. The through-hole sockets take thousands of insertions.',
    'Being the board every tutorial on the internet assumes you have.',
    'Supplying a reasonably clean 5 V and 3.3 V to a breadboard.'
  ],
  badAt: [
    'Fitting anywhere. It is large, and the shield headers make it taller than you expect.',
    'Value. The official board is around $28 for the same chip as a $4 Nano.',
    'Everything the Nano is bad at, identically - same chip, same 2 KB.'
  ],
  pick: 'When you want to use a shield, or when you are following a tutorial to the letter and want to remove one variable.',
  avoid: 'For anything going inside an enclosure. Use a Nano and save the space and the money.',
  gotchas: [
    'The headers are famously not on a 0.1 inch grid - there is a 0.05 inch offset between two of them. This is a 2005 mistake that can never be fixed, and it is why a shield fits an Uno and nothing else.',
    'A0-A5 are the same physical pins as the analog inputs; using them as digital outputs works but leaves you no analog.',
    'The official R4 boards use a completely different chip (Renesas RA4M1). Most things work; some timer and interrupt libraries do not.'
  ],
  note: 'Buy a clone. The official board funds the Arduino project and if you want to support that, it is a ' +
        'reasonable thing to do once - but functionally, a $5 clone is identical.'
},

{
  id: 'nano-every',
  tier: 'classic',
  chip: 'ATmega4809',
  tagline: 'A Nano with three times the RAM, at the cost of some library compatibility.',
  specs: {
    clock: '20 MHz, 8-bit',
    ram: '6 KB SRAM',
    flash: '48 KB',
    io: '14 digital, 8 analog inputs',
    logic: '5 V',
    usb: 'Micro-USB, native via a SAMD11 bridge',
    wireless: 'None',
    power: '~25 mA running'
  },
  goodAt: [
    'The specific case where a classic Nano sketch runs out of RAM and everything else about it was fine.',
    'Being pin-compatible with a Nano, so it drops into an existing build.',
    'Slightly more accurate timing - the newer peripherals are better designed.'
  ],
  badAt: [
    'Library compatibility. Anything that writes AVR registers directly - which is a lot of older timing, PWM and servo code - will not compile.',
    'Value against an ESP32, which costs less and is enormously more capable.'
  ],
  pick: 'When a proven ATmega328P project needs more RAM and you do not want to rewrite it for a different architecture.',
  avoid: 'As a first board, or for a new project. The compatibility friction is not worth it when an ESP32 costs less.',
  gotchas: [
    'The register names and peripheral layout are entirely different from the 328P despite both being "AVR". Direct port manipulation does not carry over.',
    'It is 5 V but the chip core is more sensitive than a 328P. It is less forgiving of abuse.'
  ],
  note: 'A board that solves one narrow problem well. If you do not have that exact problem, it is not for you.'
},

{
  id: 'mega',
  tier: 'classic',
  chip: 'ATmega2560',
  tagline: 'Buy this only when you have literally run out of pins.',
  specs: {
    clock: '16 MHz, 8-bit',
    ram: '8 KB SRAM',
    flash: '256 KB',
    io: '54 digital, 16 analog inputs, 4 hardware serial ports',
    logic: '5 V',
    usb: 'USB-B',
    wireless: 'None',
    power: '~50 mA'
  },
  goodAt: [
    'Projects with a lot of separate wires - big LED matrices, 3D printers, anything with many switches.',
    'Four hardware serial ports, which matters when you have a GPS, a radio and a debug console at once.',
    'Larger sketches. 256 KB of flash is a lot of code for an 8-bit board.'
  ],
  badAt: [
    'Being small, cheap, or fast. It is the same 16 MHz as everything else here.',
    'Being the right answer. Nine times in ten, a port expander or a shift register on a Nano is better.'
  ],
  pick: 'When you have counted your pins, added a PCF8574, and still need more.',
  avoid: 'As a general upgrade. It is not faster, and the extra flash rarely matters.',
  gotchas: [
    'Only some pins support interrupts and PWM, and they are not where you would guess. Check the pinout rather than assuming.',
    'The extra RAM tempts you to be careless with strings, and 8 KB still goes quickly.',
    'Clone quality varies more than on smaller boards - there is more to get wrong.'
  ],
  note: 'A 3D printer controller is the honest use case, and that is mostly why they are still made.'
},

/* --- wireless ---------------------------------------------------------- */
{
  id: 'esp32',
  tier: 'wireless',
  chip: 'ESP32-WROOM-32',
  tagline: 'The default modern answer. Cheaper than a Nano and vastly more capable.',
  specs: {
    clock: '240 MHz, dual-core 32-bit',
    ram: '520 KB SRAM (roughly 300 KB usable once Wi-Fi is running)',
    flash: '4 MB typical',
    io: 'About 34 GPIO, of which roughly 20 are freely usable',
    logic: '3.3 V, and NOT 5 V tolerant',
    usb: 'Micro-USB or USB-C via CH340 or CP2102',
    wireless: 'Wi-Fi 2.4 GHz and Bluetooth Classic + BLE',
    power: '~80 mA idle, up to 250 mA transmitting, 10 uA in deep sleep'
  },
  goodAt: [
    'Anything involving a network. Wi-Fi, MQTT, a web server, an API - all of it is built in.',
    'Real processing. Two cores at 240 MHz with hardware floating point, so FFTs and filters are trivial.',
    'Deep sleep. Tens of microamps, waking on a timer or a pin, which makes battery sensors practical.',
    'Being cheap. Around $5 for all of the above is the best value in the hobby.'
  ],
  badAt: [
    'Being 5 V tolerant. Anything driven from an Uno needs a level shifter.',
    'Analog inputs. The ADC is noisy and non-linear near the rails - usable, but not for precision.',
    'Predictable pin behaviour. Several pins are strapping pins that affect boot, and others are unusable when Wi-Fi is on.',
    'Running from a small power supply. Transmit bursts of 250 mA brown out weak 3.3 V regulators.'
  ],
  pick: 'Almost anything that connects to something. It is the board this site reaches for most.',
  avoid: 'When you need 5 V logic, a clean ADC, or absolute pin-timing determinism.',
  gotchas: [
    'GPIO 6-11 are wired to the flash chip and will crash the board if you use them.',
    'GPIO 0, 2, 12 and 15 are strapping pins - pulling them the wrong way at boot stops it starting.',
    'GPIO 34-39 are input only: no output driver and no internal pull-up.',
    'ADC2 pins stop working the moment Wi-Fi is enabled. Use ADC1 (GPIO 32-39) for anything analog.',
    'Many boards need BOOT held down while uploading. A 10 uF capacitor from EN to ground fixes it permanently.'
  ],
  note: 'If you are choosing one board to learn properly, this is the one. The pin gotchas look daunting ' +
        'written down and take about a week to become automatic.'
},

{
  id: 'esp8266',
  tier: 'wireless',
  chip: 'ESP8266 (Wemos D1 Mini)',
  tagline: 'The cheapest way to put something on Wi-Fi, and still perfectly good at it.',
  specs: {
    clock: '80 MHz (160 optional), single-core 32-bit',
    ram: '~80 KB usable',
    flash: '4 MB',
    io: '11 GPIO, one analog input',
    logic: '3.3 V, not 5 V tolerant',
    usb: 'Micro-USB via CH340',
    wireless: 'Wi-Fi 2.4 GHz only - no Bluetooth',
    power: '~70 mA, 20 uA in deep sleep'
  },
  goodAt: [
    'Small Wi-Fi jobs - a sensor that posts a reading, a relay you can toggle from a phone.',
    'Being tiny and about $3.',
    'Deep sleep sensors, if you wire the RST-to-D0 link so it can wake itself.'
  ],
  badAt: [
    'Anything needing more than one analog input, because there is exactly one.',
    'Bluetooth, which it does not have at all.',
    'Anything needing many pins - eleven, and several have boot-time constraints.'
  ],
  pick: 'When the job is one sensor and Wi-Fi, and you want the smallest cheapest thing that does it.',
  avoid: 'For anything new and ambitious. An ESP32 is a couple of dollars more and removes every limit here.',
  gotchas: [
    'The single ADC reads 0-1 V on the bare chip. The D1 Mini adds a divider so it reads 0-3.2 V - other boards do not, and the same code gives different readings.',
    'GPIO 15 must be low at boot and GPIO 0 high, so those two pins cannot drive arbitrary loads.',
    'The pin labels D1, D2, D3 do NOT match the GPIO numbers. D1 is GPIO 5. Use the D constants and do not guess.',
    'Deep sleep needs D0 wired to RST or it never wakes.'
  ],
  note: 'Superseded rather than obsolete. There are millions of these in service doing exactly what they ' +
        'were bought for, and a $3 board that has worked for six years owes you nothing.'
},

{
  id: 'esp32cam',
  tier: 'wireless',
  chip: 'ESP32-S with OV2640 camera',
  tagline: 'A $7 board with a lens on it. Extraordinary value, genuinely annoying to use.',
  specs: {
    clock: '240 MHz, dual-core',
    ram: '520 KB plus 4 MB PSRAM (the PSRAM is what makes the camera possible)',
    flash: '4 MB',
    io: 'About 9 usable GPIO - the camera takes most of them',
    logic: '3.3 V',
    usb: 'None. You need a separate USB-to-serial adapter to program it.',
    wireless: 'Wi-Fi and Bluetooth',
    power: '~180 mA streaming, peaks over 300 mA'
  },
  goodAt: [
    'Streaming video over Wi-Fi for the price of a sandwich.',
    'Motion-triggered stills to an SD card, which is on the board already.',
    'Being small enough to hide in a birdbox or a doorbell.'
  ],
  badAt: [
    'Being programmed. No USB, so you need an FTDI adapter and to short IO0 to ground for every upload.',
    'Power. It browns out on anything marginal, and a brownout mid-boot looks exactly like a dead board.',
    'Having pins left over. The camera uses most of them and the SD card uses more.',
    'Image quality. The OV2640 is a 2012 phone sensor and it looks like it.'
  ],
  pick: 'Any project where the point is the camera and the price.',
  avoid: 'As a general ESP32 with a camera attached. It is a camera module that happens to be programmable.',
  gotchas: [
    'IO0 must be grounded to enter upload mode, and ungrounded to run. This is the single most common frustration with this board.',
    'It needs a genuine 5 V at 500 mA. Powering it from a USB-serial adapter’s 3.3 V pin is the usual cause of "brownout detector was triggered".',
    'The AI-Thinker board and the several clones have different pin maps. Selecting the wrong one gives a camera init failure.',
    'The on-board LED is extremely bright and is on the same pin as an SD card data line.'
  ],
  note: 'Buy the version with the separate programmer base board if you can find it. It turns the worst ' +
        'thing about this board into a non-issue for about two dollars.'
},

{
  id: 'pico',
  tier: 'wireless',
  chip: 'RP2350 (Raspberry Pi Pico 2 W)',
  tagline: 'The best-documented board here, and the only one with programmable I/O hardware.',
  specs: {
    clock: '150 MHz, dual-core Cortex-M33',
    ram: '520 KB SRAM',
    flash: '4 MB',
    io: '26 GPIO, 3 analog inputs',
    logic: '3.3 V, not 5 V tolerant',
    usb: 'Micro-USB, native - it can be a USB device',
    wireless: 'Wi-Fi and Bluetooth on the W version',
    power: '~35 mA, and a genuinely good deep sleep'
  },
  goodAt: [
    'PIO - eight little state machines that generate or read precise signals independently of the CPU. Nothing else at this price has anything like it.',
    'Documentation. The Raspberry Pi datasheets are the best in this entire list by a wide margin.',
    'MicroPython, which is a genuinely pleasant way to work and unusually well supported here.',
    'Analog. The ADC is noticeably better behaved than the ESP32’s.'
  ],
  badAt: [
    'Arduino library coverage. It is good and improving, but an ESP32 has had more years of people fixing things.',
    'Being the obvious choice. It overlaps heavily with the ESP32 and usually loses on ecosystem.'
  ],
  pick: 'Anything needing exact timing - driving addressable LEDs, decoding an unusual protocol, bit-banging something fast. PIO makes hard things easy.',
  avoid: 'When you want the largest possible pile of example code, which the ESP32 still wins.',
  gotchas: [
    'To flash it the first time you hold BOOTSEL while plugging in, and it appears as a USB drive. This is unlike everything else here and catches people.',
    'The ADC reference is the noisy 3.3 V rail by default; there is a dedicated pin for a cleaner one.',
    'GPIO 23, 24, 25 and 29 are used internally on the W version for the wireless chip.',
    'The Pico 2 is RP2350; older guides describe the RP2040 Pico and some details differ.'
  ],
  note: 'If you find the ESP32’s pin restrictions irritating, this is the board that fixes them. PIO is ' +
        'the reason to learn it and it is worth an evening on its own.'
},

/* --- special purpose --------------------------------------------------- */
{
  id: 'pro-micro',
  tier: 'special',
  chip: 'ATmega32U4',
  tagline: 'Native USB, so it can pretend to be a keyboard, a mouse or a MIDI device.',
  specs: {
    clock: '16 MHz (5 V) or 8 MHz (3.3 V version)',
    ram: '2.5 KB SRAM',
    flash: '32 KB, 4 KB used by the bootloader',
    io: '18 usable pins, 9 analog inputs',
    logic: '5 V or 3.3 V depending on the version - check before buying',
    usb: 'Micro-USB, native to the chip',
    wireless: 'None',
    power: '~20 mA'
  },
  goodAt: [
    'Being a USB device. Keyboards, macro pads, MIDI controllers, game controllers - all driverless.',
    'Fitting inside things. It is tiny.',
    'Custom keyboards, which is most of what these are actually used for.'
  ],
  badAt: [
    'Recovering from a bad sketch. Because USB is done in software, a sketch that hangs can make the board unprogrammable until you catch its bootloader window.',
    'Anything needing pins or RAM. 2.5 KB and 18 pins.'
  ],
  pick: 'Anything that plugs into a computer and pretends to be an input device.',
  avoid: 'General projects. A Nano is cheaper unless you specifically need USB device mode.',
  gotchas: [
    'If a sketch crashes, the board can become undetectable. Recover by double-tapping RESET to force an eight-second bootloader window and uploading during it.',
    'The micro-USB connector is notorious for tearing off the pads. Put a blob of epoxy over it before you use it.',
    'The 3.3 V version runs at 8 MHz. Upload a 16 MHz sketch to it and timing is silently wrong.',
    'A keyboard sketch that types constantly is very hard to stop, because it is typing into whatever you are using to fix it.'
  ],
  note: 'The RP2040 and ESP32-S3 also do native USB now, but the 32U4 has a decade of keyboard firmware ' +
        'behind it - QMK in particular - and that ecosystem is the real reason to pick one.'
},

{
  id: 'nano33ble',
  tier: 'special',
  chip: 'nRF52840 (Nano 33 BLE Sense Rev2)',
  tagline: 'A sensor laboratory on a Nano footprint, built for machine learning on a microcontroller.',
  specs: {
    clock: '64 MHz Cortex-M4F with hardware floating point and DSP instructions',
    ram: '256 KB SRAM',
    flash: '1 MB',
    io: '14 digital, 8 analog',
    logic: '3.3 V, and NOT 5 V tolerant despite the Nano shape',
    usb: 'Micro-USB, native',
    wireless: 'Bluetooth LE only - no Wi-Fi',
    power: '~15 mA active, microamps asleep'
  },
  goodAt: [
    'TinyML. The M4F with DSP instructions runs quantised neural networks at a useful speed.',
    'Having everything on board already: microphone, 9-axis IMU, temperature, humidity, pressure, proximity, gesture and colour.',
    'Bluetooth LE, properly - the nRF52840 is the reference chip for it.',
    'Battery sensors that need real processing before transmitting.'
  ],
  badAt: [
    'Price. It is over ten times a plain Nano.',
    'Wi-Fi, which it does not have.',
    'Surviving 5 V. The Nano footprint invites you to drop it into an Uno-based project and destroy it.'
  ],
  pick: 'Anything with the words "machine learning" in it that does not need a Linux board.',
  avoid: 'When you just need a Nano. You are paying for sensors and an M4F you will not use.',
  gotchas: [
    'The pin headers are a Nano footprint but the logic is 3.3 V and NOT tolerant. This is the expensive mistake.',
    'The Rev2 changed the IMU from an LSM9DS1 to a BMI270 plus BMM150. Older examples do not compile against the new libraries.',
    'The microphone is PDM, not analog. It needs the PDM library rather than analogRead.',
    'Uploading needs the mbed board package, which is a large download the first time.'
  ],
  note: 'This is the board the TinyML projects here use, and the on-board sensors are most of the reason. ' +
        'Nothing else lets you collect a dataset with no external hardware at all.'
},

/* --- Linux boards ------------------------------------------------------ */
{
  id: 'uno-q',
  tier: 'linux',
  chip: 'Qualcomm Dragonwing QRB2210 + STM32U585',
  tagline: 'Linux and a microcontroller on one board, in an Uno shape. Two computers, one PCB.',
  specs: {
    clock: 'Quad-core Cortex-A53 at 2 GHz, plus a 160 MHz Cortex-M33',
    ram: '2 GB or 4 GB LPDDR4',
    flash: '16 GB or 32 GB eMMC',
    io: 'Uno-compatible headers, driven by the microcontroller side',
    logic: '3.3 V on the headers',
    usb: 'USB-C, plus host ports',
    wireless: 'Wi-Fi and Bluetooth',
    power: '5 V at 3 A - it needs a real supply'
  },
  goodAt: [
    'Running Python, OpenCV and a neural network while a real microcontroller handles the pins.',
    'The split that matters: Linux is not real-time and pin timing is, so having both is genuinely useful.',
    'Camera and audio work that an ESP32 cannot approach.',
    'Being an approachable first Linux board, because the Arduino half is familiar.'
  ],
  badAt: [
    'Booting instantly. It is an operating system - expect twenty seconds, and shut it down properly.',
    'Low power. There is no meaningful sleep mode.',
    'Cost, relative to a microcontroller, if you do not need the Linux half.'
  ],
  pick: 'Vision, audio or anything needing Python libraries, where you also need to drive real pins.',
  avoid: 'Battery projects, and anything a $5 ESP32 already does.',
  gotchas: [
    'Pulling the power without shutting down will eventually corrupt the eMMC, exactly like any computer.',
    'The Linux side and the microcontroller side are separate programs that talk over a bridge - you are writing two pieces of software.',
    'A camera wants the UNO Media Carrier for a proper CSI connector; a USB webcam is the workaround.'
  ],
  note: 'The most interesting board Arduino has made in years, precisely because it does not pretend Linux ' +
        'can do real-time GPIO.'
},

{
  id: 'ventuno-q',
  tier: 'linux',
  chip: 'Qualcomm Dragonwing IQ8 + STM32H5',
  tagline: 'The UNO Q scaled up for robotics and vision, at six times the price.',
  specs: {
    clock: 'Octa-core Arm, plus an STM32H5 microcontroller',
    ram: '16 GB LPDDR',
    flash: 'Up to 64 GB expandable',
    io: 'Headers plus high-speed connectors for cameras and displays',
    logic: '3.3 V',
    usb: 'USB-C',
    wireless: 'Wi-Fi and Bluetooth',
    power: 'Needs a 65 W USB-C supply'
  },
  goodAt: [
    'Running several vision models at once, which 16 GB makes comfortable.',
    'Robotics, where you want perception and motor control on one board.',
    'Being an Arduino-ecosystem alternative to a Jetson.'
  ],
  badAt: [
    'Being available. It has been preorder rather than in stock for much of the year.',
    'Price. At $299 it is more than most people’s entire component collection.',
    'Having a large body of community examples yet, because it is new.'
  ],
  pick: 'Serious edge AI where you want Arduino tooling rather than NVIDIA’s.',
  avoid: 'As a first anything. Build on a UNO Q and move across when you have outgrown it.',
  gotchas: [
    'Check the price and stock before designing a project around it - see the news page.',
    'The software stack is young. Expect to solve problems nobody has written up yet.'
  ],
  note: 'The sorter project here recommends building it on a UNO Q first, and that advice holds for ' +
        'anything you are thinking of doing with one.'
},

{
  id: 'jetson-orin',
  tier: 'linux',
  chip: 'NVIDIA Jetson Orin Nano Super',
  tagline: 'A real CUDA GPU in a small box. The only board here that runs a language model.',
  specs: {
    clock: '6-core Cortex-A78AE, 1024-core Ampere GPU with tensor cores',
    ram: '8 GB LPDDR5, shared between CPU and GPU',
    flash: 'microSD, or NVMe which you want',
    io: '40-pin header, 3.3 V, driven by Linux',
    logic: '3.3 V, and NOT 5 V tolerant',
    usb: 'USB-C and several host ports',
    wireless: 'None as standard - most kits need an M.2 Wi-Fi card adding',
    power: '7 W to 25 W, and it needs cooling'
  },
  goodAt: [
    'Real-time object detection, segmentation and tracking at 30 frames a second.',
    'Running an 8-billion-parameter language model locally, which nothing else on this list can do.',
    'Training small models on the board itself - the bird classifier project does exactly that.',
    'Anything CUDA. The whole PyTorch and TensorRT ecosystem works.'
  ],
  badAt: [
    'GPIO. The 40-pin header is slow, 3.3 V only, and driven through Linux with no timing guarantees.',
    'Power and heat. 25 W with a fan is not a battery project.',
    'Price. The kit is around $249 and you will want an NVMe drive as well.',
    'Memory. 8 GB shared between CPU and GPU is the constraint that shapes every project.'
  ],
  pick: 'When a model genuinely will not run anywhere else. Vision at speed, or an LLM.',
  avoid: 'For anything a UNO Q handles. And never use its header for real-time pin work - pair it with a microcontroller, which is what every Jetson project here does.',
  gotchas: [
    'Boot from microSD works and is slow and wears out. Use NVMe.',
    'The header is 3.3 V and not tolerant. A 5 V sensor wired directly will damage a $249 board.',
    '"Super" is a power mode you have to enable - the board does not ship in its fastest configuration.',
    'JetPack versions are tightly coupled to CUDA and library versions. Mixing them is the commonest source of a broken environment.'
  ],
  note: 'Worth it only if the workload needs it. Five of the projects here use one, and every single one ' +
        'pairs it with an Uno for the pins - that split is not an accident.'
}

];
