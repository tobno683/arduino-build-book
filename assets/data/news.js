/* ==========================================================================
   NEW BOARDS AND CHIPS - the news shelf.

   Newest first. Every entry has to answer "so what, for this book?" in its
   `why` - that is the whole point of the page. A feed of press releases is
   available everywhere; a feed that says which of these 76 projects it
   changes is not.

   `status` is the honesty field, and it is deliberately four values:
     shipping  - you can put money down today and it arrives
     preorder  - money now, board later, date quoted by the vendor
     announced - real specs, real date, you cannot buy it
     rumour    - buzz, leak or trade-show glass case. Treat as fiction.

   `AB.newsChecked` is when a human last went and looked. news.html shows
   it, and warns once it is old, because a stale news page that looks fresh
   is worse than no news page at all.

   Source links are real article URLs, not search URLs. That is the one
   place this site breaks its own "search URLs only" rule, and it has to:
   here the link IS the claim. It also means they will eventually rot.
   ========================================================================== */
window.AB = window.AB || {};

AB.newsChecked = '2026-09-16';

AB.news = [

  { id: 'alif-balletto-b1',
    date: '2026-09-15', status: 'shipping',
    vendor: 'Alif Semiconductor', title: 'Balletto B1 and Ensemble E1C StartKits',
    blurb: 'Cortex-M55 microcontroller kits with an Ethos-U55 neural accelerator on the die, built for camera and microphone work.',
    specs: ['160 MHz Cortex-M55 with an Ethos-U55 NPU', '2 MB SRAM', 'Camera and microphone support on the kit',
            'Balletto B1 adds BLE 5.3 and 802.15.4'],
    why: 'The TinyML projects here run on a Nano 33 BLE Sense, which does inference on a 64 MHz Cortex-M4 with no accelerator at all - that constraint is the reason the gesture model has to be kept so small. An Ethos-U55 is a real NPU on a microcontroller power budget, and it lands in the gap between the Nano 33 and the Jetson that has been empty for years. The one to watch if you want camera-based TinyML running on batteries.',
    cat: 'ai', projects: ['tinyml-gesture-nano', 'tinyml-machine-listener'],
    src: [{ t: 'CNX Software', u: 'https://www.cnx-software.com/news/development-board/' }] },

  { id: 'm5stack-lora-1262',
    date: '2026-09-13', status: 'shipping',
    vendor: 'M5Stack', title: 'Module13.2 LoRa-1262',
    blurb: 'An SX1262 LoRa module packaged as a stackable M5Stack module rather than a bare breakout.',
    specs: ['SX1262, 868-923 MHz', 'Up to +22 dBm transmit', '-147 dBm receive sensitivity'],
    why: 'Same silicon as the module in the Radio and Long Range projects, in a different package. Nothing new technically - but -147 dBm is the number you put into a link budget, and because the chip is identical the spreading-factor and duty-cycle arithmetic in those projects carries over without a single change.',
    cat: 'radio',
    src: [{ t: 'CNX Software', u: 'https://www.cnx-software.com/news/development-board/' }] },

  { id: 'waveshare-esp32-c5-pico',
    date: '2026-09-09', status: 'shipping',
    vendor: 'Waveshare', title: 'ESP32-C5 Pico',
    blurb: 'The first dual-band ESP32 in a Raspberry Pi Pico footprint. 5 GHz Wi-Fi on an ESP32 at last.',
    specs: ['ESP32-C5', 'Dual-band 2.4 and 5 GHz Wi-Fi 6', 'Bluetooth LE and 802.15.4', 'Pico form factor'],
    why: 'Twenty projects here run on an ESP32 and every one of them is stuck on 2.4 GHz, which is the most crowded band in any house - it is why the camera projects stutter when somebody starts a video call. The C5 is the first ESP32 that does 5 GHz. For anything that streams, this is the biggest practical upgrade on this page, and the Pico footprint means it drops straight into a breadboard.',
    part: 'esp32', cat: 'camera',
    src: [{ t: 'CNX Software', u: 'https://www.cnx-software.com/news/development-board/' }] },

  { id: 'xiao-plus',
    date: '2026-09-07', status: 'shipping',
    vendor: 'Seeed Studio', title: 'XIAO SAMD21 Plus and XIAO RP2040 Plus',
    blurb: 'The thumbnail-sized XIAO boards, with more of the GPIO brought out and lithium charging built in.',
    specs: ['More GPIO exposed than the original XIAO', 'Integrated Li-ion battery management'],
    why: 'Charging on the board matters more than it sounds. The wearable and LED projects here need a TP4056 module, a cell holder and the wiring between them, and that wiring is where the commonest mistake in the book happens. A board with charging on it removes three BOM lines and the mistake. Not a reason to rebuild anything, but the right starting point for a new battery project.',
    cat: 'light',
    src: [{ t: 'CNX Software', u: 'https://www.cnx-software.com/news/development-board/' }] },

  { id: 'uno-media-carrier',
    date: '2026-09-01', approx: true, status: 'shipping', price: '$19.25',
    vendor: 'Arduino', title: 'UNO Media Carrier',
    blurb: 'A carrier board that gives the UNO Q and VENTUNO Q two proper CSI camera connectors, a DSI display port and real audio jacks.',
    specs: ['Two 22-pin MIPI CSI connectors, 4 lanes each', 'MIPI DSI display interface',
            'Three 3.5 mm jacks: microphone in, headphone out, line out',
            'JMEDIA and JMISC connectors stay passthrough, so the other pins remain free'],
    why: 'This is the accessory the UNO Q projects here have been working around. The object detection build uses a USB webcam because getting a CSI camera onto a UNO Q otherwise meant adapters, and the voice control build fights the audio path throughout. Two CSI connectors and audio in and out for $19.25, with the rest of the pins still usable, fixes both. The cheapest thing on this page and the one most likely to change a project you are actually building.',
    part: 'uno-q', projects: ['uno-q-object-detection', 'uno-q-voice-control'],
    src: [{ t: 'Arduino Store', u: 'https://store-usa.arduino.cc/products/uno-media-carrier' }] },

  { id: 'jetson-orin-nano-2',
    date: '2026-08-25', status: 'announced', avail: 'First half of 2027',
    vendor: 'NVIDIA', title: 'Jetson Orin Nano 2',
    blurb: 'Twice the inference of the Orin Nano Super in the same physical package, and 40% less power at matched performance.',
    specs: ['78 TOPS of AI compute', '8 GB memory', '8-core Arm CPU',
            'Twice the inference performance of the Orin Nano Super',
            '40% less power at matched performance in 15 W mode', 'Same form factor'],
    why: 'Directly relevant to the five Jetson projects here, and the honest advice is do not wait. It is not expected until the first half of 2027, no price has been announced, and the unchanged form factor means a carrier and camera bought now should still work when it lands. Note what did not change: 8 GB. The offline language model project is memory-bound rather than compute-bound, so twice the inference will not let you run a bigger model - it will just reach the same answer sooner.',
    part: 'jetson-orin', cat: 'ai', projects: ['jetson-local-llm', 'jetson-orin-vision'],
    src: [{ t: 'NVIDIA Newsroom', u: 'https://nvidianews.nvidia.com/news/nvidia-announces-jetson-orin-nano-2-robotics-computer-to-redefine-entry-level-edge-ai' }] },

  { id: 'comu-ch32v203',
    date: '2026-08-10', status: 'shipping', price: '$6',
    vendor: 'Third party', title: 'Comu, a RISC-V board that fits inside a USB port',
    blurb: 'A $6 32-bit RISC-V development board small enough to disappear into a USB socket.',
    specs: ['CH32V203 RISC-V', 'Fits inside a USB port', 'About $6'],
    why: 'Nothing in this book runs on it unmodified - it is not an Arduino-framework target the way the boards here are, so treat it as a separate hobby rather than a drop-in. But at six dollars it is the cheapest possible way to find out whether you get on with RISC-V, and the CH32V line has quietly become the default answer for throwaway jobs where even a Nano clone feels extravagant.',
    src: [{ t: 'CNX Software', u: 'https://www.cnx-software.com/2026/08/10/comu-6-tiny-ch32v203-risc-v-development-board-that-fits-inside-a-usb-port/' }] },

  { id: 'jetson-t3000-t2000',
    date: '2026-07-15', status: 'announced', avail: 'Q1 2027',
    vendor: 'NVIDIA', title: 'Jetson T3000 and T2000',
    blurb: 'Blackwell-generation Jetson modules for robotics. Far above anything in this book, and listed here for scale.',
    specs: ['T3000: 1536-core Blackwell GPU, 8-core Neoverse Arm CPU, 32 GB LPDDR5X at 273 GB/s, 25 GbE, up to 865 FP4 TFLOPS',
            'T2000: 1024-core Blackwell GPU, 16 GB LPDDR5 at 137 GB/s, 10 GbE, up to 400 TFLOPS'],
    why: 'Out of reach, and worth knowing about anyway. The interesting number is not the TFLOPS, it is the T2000 at 16 GB - the offline language model project spends its entire design budget fitting inside 8 GB, and doubling the memory changes which models are possible far more than doubling the compute does. Q1 2027, no consumer price, and developer kits in this class have historically been four figures.',
    cat: 'ai', projects: ['jetson-local-llm'],
    src: [{ t: 'CNX Software', u: 'https://www.cnx-software.com/2026/07/16/nvidia-jetson-t2000-and-t3000-modules-for-edge-ai-and-robotics-applications/' },
          { t: 'Connect Tech', u: 'https://connecttech.com/2026-07-jetson-t3000-announcement/' }] },

  { id: 'moddo-pinch',
    date: '2026-07-14', status: 'preorder', price: '$15.90', avail: 'Shipping from September 2026',
    vendor: 'Moddo', title: 'Pinch, a very small Arduino-compatible board',
    blurb: 'Claims the smallest 32-bit Arduino-compatible board. Sold as a kit you solder yourself.',
    specs: ['32-bit, Arduino-compatible', 'Sold as a PCB kit', '$15.90 preorder'],
    why: 'It arrives as a bag of parts, which is either the appeal or the problem depending on your mood - the soldering guide here covers everything it needs, including the fine-pitch work. More fun than important, but small enough to change what is physically buildable in the wearable projects.',
    cat: 'light',
    src: [{ t: 'CNX Software', u: 'https://www.cnx-software.com/2026/07/14/meet-moddo-pinch-the-world-smallest-arduino-compatible-board-2026-edition/' }] },

  { id: 'esp32-s31',
    date: '2026-04-08', status: 'announced', avail: 'No ship date announced',
    vendor: 'Espressif', title: 'ESP32-S31',
    blurb: 'Dual-core RISC-V with Wi-Fi 6 and gigabit Ethernet on the chip itself.',
    specs: ['Dual-core RISC-V', 'Wi-Fi 6', 'Gigabit Ethernet on-chip'],
    why: 'The Ethernet is the headline. Every networked project in this book is Wi-Fi, and that is not a preference - wired Ethernet on an ESP32 has always meant bolting on a LAN8720 module and getting its clock pin exactly right, which is enough friction that no project here does it. On-chip removes the module and the clock pin both. If you have ever wanted the smart home projects on a cable instead of a radio, this is the part to wait for.',
    part: 'esp32', cat: 'smart-home',
    src: [{ t: 'Hackaday', u: 'https://hackaday.com/2026/04/08/espressifs-new-esp32-s31-dual-core-risc-v-with-wifi-6-and-gbit-ethernet/' }] },

  { id: 'uno-q-accessories',
    date: '2026-03-27', status: 'shipping',
    vendor: 'Arduino', title: 'Seven accessories for the UNO Q',
    blurb: 'Announced at Arduino Days: seven new products and compatible boards built around the UNO Q.',
    why: 'Worth checking before you design a UNO Q project around a breadboard and a handful of jumpers. The board is new enough that its accessory catalogue is still filling in, so something that needed hand-wiring when a project here was written may be a click-on module by the time you build it. The UNO Media Carrier further up this page is the clearest example.',
    part: 'uno-q',
    src: [{ t: 'Arduino Blog', u: 'https://blog.arduino.cc/2026/03/27/we-just-announced-seven-new-products-ready-to-expand-your-arduino-uno-q-board/' }] },

  { id: 'ventuno-q',
    date: '2026-03-10', status: 'preorder', price: '$299', avail: 'Roughly four weeks from order, as quoted by the vendor',
    vendor: 'Arduino', title: 'VENTUNO Q',
    blurb: 'Arduino edge AI board pairing a Qualcomm Dragonwing IQ8 with an STM32H5. The big brother to the UNO Q.',
    specs: ['Qualcomm Dragonwing IQ8 plus an STM32H5 microcontroller', '16 GB RAM',
            'Up to 64 GB expandable storage', '$299 introductory price'],
    why: 'The board behind the sorter project here. Two things to know before ordering: $299 is described as an introductory price, and it has been preorder rather than in stock for most of the year, with roughly four-week delivery quoted. That is exactly why the sorter project tells you to build it on a UNO Q first and move it across once the hardware turns up.',
    part: 'ventuno-q', cat: 'ai', projects: ['ventuno-q-sorter'],
    src: [{ t: 'Hackaday', u: 'https://hackaday.com/2026/03/10/arduinos-new-ai-centric-board-is-the-ventuno-q/' },
          { t: 'Arduino Store', u: 'https://store-usa.arduino.cc/products/ventuno-q' }] },

  { id: 'esp32-e22-h21',
    date: '2026-01-07', status: 'announced', avail: 'No ship date announced - shown at CES as silicon, not boards',
    vendor: 'Espressif', title: 'ESP32-E22 and ESP32-H21',
    blurb: 'Shown at CES: a Wi-Fi 6E co-processor, and an ultra-low-power BLE and Thread microcontroller.',
    specs: ['E22: dual-core RISC-V to 500 MHz, 1 MB on-chip memory, tri-band 2.4/5/6 GHz Wi-Fi 6E, 160 MHz channels, 2x2 MIMO, Bluetooth 6.0, PCIe/USB/SDIO',
            'H21: single-core RISC-V at 96 MHz, 320 KB RAM, Bluetooth LE plus 802.15.4, on-chip DC-DC, 19 GPIO'],
    why: 'The E22 is a connectivity co-processor rather than something you write a sketch for - it gives a host device Wi-Fi 6E, so it reaches you only through whatever product ends up using it. The H21 is the one to watch here. BLE plus 802.15.4 at 96 MHz with an on-chip DC-DC converter is aimed precisely at sensors that have to run for a year on a coin cell, which is what every environment project in this book wants and none of them quite achieve.',
    cat: 'environment',
    src: [{ t: 'Espressif', u: 'https://www.espressif.com/en/news/ESP32_E22_Announcement' },
          { t: 'CNX Software', u: 'https://www.cnx-software.com/2026/01/07/espressif-systems-showcases-esp32-e22-wi-fi-6e-soc-and-esp32-h21-ble-mcu-for-battery-powered-devices/' }] }

];
