/* ==========================================================================
   index.js - GENERATED FILE, do not edit by hand.
   Rebuild with:  node tools/build-index.js
   A summary of every project so the home page and the catalogue can render
   without loading 101 full build guides.
   ========================================================================== */
window.AB = window.AB || {};

AB.index = [
  {
    "slug": "tinyml-gesture-nano",
    "title": "Gesture recognition with TinyML",
    "cat": "ai",
    "level": 2,
    "time": "4 hours (plus training time)",
    "solder": false,
    "board": "Nano 33 BLE Sense",
    "blurb": "Wave the board and it knows which gesture you made. A real neural network, trained on your own data, running in 20 kB on a microcontroller with no internet connection.",
    "tags": [
      "tinyml",
      "edge impulse",
      "machine learning",
      "nano 33 ble",
      "bmi270",
      "accelerometer",
      "neural network",
      "no soldering"
    ],
    "feature": false,
    "cost": 69.78,
    "boards": [
      "nano33ble"
    ]
  },
  {
    "slug": "jetson-bird-classifier",
    "title": "Bird feeder species classifier",
    "cat": "ai",
    "level": 3,
    "time": "6 hours, plus weeks of collecting",
    "solder": true,
    "board": "Jetson Orin Nano",
    "blurb": "A camera on a bird feeder that learns your birds, from photographs it took itself. The only project in this book where the board trains the model as well as running it.",
    "tags": [
      "jetson",
      "transfer learning",
      "training",
      "classification",
      "open set",
      "class imbalance",
      "wildlife",
      "resnet"
    ],
    "feature": false,
    "cost": 353.24,
    "boards": [
      "jetson-orin",
      "uno"
    ]
  },
  {
    "slug": "tinyml-machine-listener",
    "title": "Machine listener: anomaly detection",
    "cat": "ai",
    "level": 3,
    "time": "5 hours (plus a day of recording)",
    "solder": true,
    "board": "Nano 33 BLE Sense",
    "blurb": "Stick it to a pump, a fan or a 3D printer. It learns what healthy sounds like, then tells you when that changes - without ever being shown a fault.",
    "tags": [
      "tinyml",
      "anomaly detection",
      "edge impulse",
      "predictive maintenance",
      "mfcc",
      "pdm microphone",
      "vibration",
      "nano 33 ble"
    ],
    "feature": false,
    "cost": 75.96,
    "boards": [
      "nano33ble"
    ]
  },
  {
    "slug": "tinyml-vibration-monitor",
    "title": "Motor fault detection from vibration",
    "cat": "ai",
    "level": 3,
    "time": "5 hours, plus a week of baselining",
    "solder": true,
    "board": "ESP32",
    "blurb": "Bolt an accelerometer to a motor and it learns what healthy sounds like. When a bearing starts to go, the frequency signature changes weeks before you could hear it - and the frequency it changes at tells you which part is failing.",
    "tags": [
      "vibration",
      "fft",
      "mpu6050",
      "predictive maintenance",
      "anomaly detection",
      "esp32",
      "mqtt",
      "bearings"
    ],
    "feature": false,
    "cost": 25.25,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "uno-q-object-detection",
    "title": "Object detection that follows you",
    "cat": "ai",
    "level": 3,
    "time": "6 hours",
    "solder": false,
    "board": "UNO Q",
    "blurb": "A camera that recognises what it is looking at and turns to follow it. Python and a real neural network on the Linux half of the board, precise servo timing on the microcontroller half.",
    "tags": [
      "uno q",
      "object detection",
      "computer vision",
      "opencv",
      "python",
      "dual brain",
      "linux",
      "pan tilt",
      "mobilenet",
      "ssd"
    ],
    "feature": true,
    "cost": 121.15,
    "boards": [
      "uno-q"
    ]
  },
  {
    "slug": "uno-q-voice-control",
    "title": "Offline voice control",
    "cat": "ai",
    "level": 3,
    "time": "5 hours",
    "solder": true,
    "board": "UNO Q",
    "blurb": "Say \"lights warm white\" and it happens. Real speech recognition running entirely on the board - no Alexa, no account, no microphone feed leaving your house.",
    "tags": [
      "uno q",
      "voice control",
      "speech recognition",
      "vosk",
      "offline",
      "python",
      "dual brain",
      "linux",
      "wake word",
      "privacy"
    ],
    "feature": false,
    "cost": 108.49,
    "boards": [
      "uno-q"
    ]
  },
  {
    "slug": "ai-plant-doctor",
    "title": "Plant disease classifier",
    "cat": "ai",
    "level": 3,
    "time": "7 hours, plus a season of photographs",
    "solder": true,
    "board": "Arduino UNO Q",
    "blurb": "Hold a leaf up to a camera and it tells you what is wrong with it. It also shows, more clearly than any other project here, why a model that scores 99% in testing can be useless in your greenhouse.",
    "tags": [
      "uno q",
      "classification",
      "plantvillage",
      "domain shift",
      "macro",
      "greenhouse",
      "transfer learning"
    ],
    "feature": false,
    "cost": 96.67,
    "boards": [
      "uno-q"
    ]
  },
  {
    "slug": "jetson-pose-coach",
    "title": "Pose estimation exercise coach",
    "cat": "ai",
    "level": 3,
    "time": "6 hours",
    "solder": true,
    "board": "Jetson Orin Nano",
    "blurb": "Counts your reps and tells you when your form has gone. Seventeen body keypoints at thirty frames a second - and the interesting part is the geometry you do with them, not the model that finds them.",
    "tags": [
      "jetson",
      "pose estimation",
      "keypoints",
      "yolo",
      "rep counting",
      "state machine",
      "joint angles"
    ],
    "feature": false,
    "cost": 361.35,
    "boards": [
      "jetson-orin",
      "uno"
    ]
  },
  {
    "slug": "tinyml-wake-word",
    "title": "Wake word on a coin-cell budget",
    "cat": "ai",
    "level": 3,
    "time": "6 hours, plus recording time",
    "solder": false,
    "board": "Nano 33 BLE Sense",
    "blurb": "Say one word and a board the size of a stick of gum wakes up. No network, no cloud, no Linux - a neural network running in 256 KB of RAM on a microcontroller that sips microamps between words.",
    "tags": [
      "tinyml",
      "wake word",
      "keyword spotting",
      "mfcc",
      "edge impulse",
      "nano 33",
      "low power",
      "quantisation"
    ],
    "feature": false,
    "cost": 59.64,
    "boards": [
      "nano33ble"
    ]
  },
  {
    "slug": "jetson-depth-nav",
    "title": "Depth-aware rover from one camera",
    "cat": "ai",
    "level": 4,
    "time": "10 hours",
    "solder": true,
    "board": "Jetson Orin Nano",
    "blurb": "A neural network that estimates depth from one ordinary camera, driving a rover round obstacles. It works startlingly well and it cannot tell you how far anything is in metres - which is the whole lesson.",
    "tags": [
      "jetson",
      "depth anything",
      "monocular depth",
      "transformer",
      "navigation",
      "scale",
      "sensor fusion",
      "rover"
    ],
    "feature": false,
    "cost": 383.7,
    "boards": [
      "jetson-orin",
      "uno"
    ]
  },
  {
    "slug": "ai-plate-gate",
    "title": "Number plate recognition gate opener",
    "cat": "ai",
    "level": 4,
    "time": "10 hours",
    "solder": true,
    "board": "Jetson Orin Nano",
    "blurb": "Your own car pulls up and the gate opens. Nobody else’s does. It works well, it is genuinely useful, and it is the one project here where the law has an opinion about what you build.",
    "tags": [
      "jetson",
      "anpr",
      "ocr",
      "privacy",
      "gdpr",
      "gate",
      "allowlist",
      "hashing",
      "motion gating"
    ],
    "feature": false,
    "cost": 348.43,
    "boards": [
      "jetson-orin",
      "uno"
    ]
  },
  {
    "slug": "jetson-local-llm",
    "title": "Offline assistant with a real language model",
    "cat": "ai",
    "level": 4,
    "time": "8 hours",
    "solder": false,
    "board": "Jetson Orin Nano",
    "blurb": "An 8-billion-parameter language model, speech recognition and speech synthesis, all running on a board beside your desk with the network cable pulled out. The constraint that shapes everything is eight gigabytes.",
    "tags": [
      "jetson",
      "llm",
      "llama",
      "ollama",
      "whisper",
      "piper",
      "quantisation",
      "offline",
      "unified memory"
    ],
    "feature": false,
    "cost": 345.05,
    "boards": [
      "jetson-orin",
      "uno"
    ]
  },
  {
    "slug": "jetson-orin-vision",
    "title": "Real-time vision with a Jetson Orin Nano",
    "cat": "ai",
    "level": 4,
    "time": "8 hours",
    "solder": true,
    "board": "Jetson + Uno",
    "blurb": "Thirty frames a second of real object detection, with identities tracked between frames. A GPU does the seeing, an Uno does the switching, and the price of admission is honestly discussed.",
    "tags": [
      "jetson",
      "orin nano",
      "yolo",
      "tensorrt",
      "gpu",
      "object tracking",
      "bytetrack",
      "people counter",
      "cuda",
      "linux"
    ],
    "feature": false,
    "cost": 360.59,
    "boards": [
      "jetson-orin",
      "uno"
    ]
  },
  {
    "slug": "ventuno-q-sorter",
    "title": "Vision sorting machine",
    "cat": "ai",
    "level": 4,
    "time": "12 hours over a weekend",
    "solder": true,
    "board": "Ventuno Q",
    "blurb": "A conveyor, a camera and two flaps. It looks at each object as it passes, decides what it is, and fires a diverter at exactly the right millisecond - which turns out to be the hard part.",
    "tags": [
      "ventuno q",
      "machine vision",
      "npu",
      "sorting",
      "conveyor",
      "industrial",
      "latency",
      "classification",
      "linux",
      "dual brain"
    ],
    "feature": false,
    "cost": 367.72,
    "boards": [
      "ventuno-q"
    ]
  },
  {
    "slug": "arduino-theremin",
    "title": "Ultrasonic theremin",
    "cat": "audio",
    "level": 1,
    "time": "45 minutes",
    "solder": false,
    "board": "Uno",
    "blurb": "Wave one hand for pitch, shade a sensor for volume. Includes a scale mode so it sounds like music rather than a car alarm.",
    "tags": [
      "hc-sr04",
      "tone",
      "ldr",
      "music",
      "no soldering",
      "first project",
      "scales"
    ],
    "feature": false,
    "cost": 14.79,
    "boards": [
      "uno"
    ]
  },
  {
    "slug": "mp3-doorbell",
    "title": "MP3 doorbell that plays anything",
    "cat": "audio",
    "level": 2,
    "time": "2 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "A doorbell that plays a random track from an SD card, goes quiet at night, and does not repeat itself for a fortnight.",
    "tags": [
      "dfplayer",
      "mp3",
      "sd card",
      "doorbell",
      "amplifier",
      "speaker"
    ],
    "feature": false,
    "cost": 25.97,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "midi-controller",
    "title": "USB MIDI control surface",
    "cat": "audio",
    "level": 2,
    "time": "5 hours",
    "solder": true,
    "board": "Pro Micro",
    "blurb": "Eight knobs and eight buttons that any music software recognises the moment you plug them in. No drivers, no configuration - and the real work is stopping cheap potentiometers from sending a stream of nonsense.",
    "tags": [
      "midi",
      "usb hid",
      "pro micro",
      "32u4",
      "potentiometer",
      "hysteresis",
      "debounce",
      "music"
    ],
    "feature": false,
    "cost": 11.91,
    "boards": [
      "pro-micro"
    ]
  },
  {
    "slug": "internet-radio",
    "title": "Internet radio with a real knob",
    "cat": "audio",
    "level": 3,
    "time": "6 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Thousands of stations, one satisfying knob, and no app. The interesting engineering is the buffer: audio has to arrive without gaps forever, on a chip with less RAM than a single second of uncompressed sound.",
    "tags": [
      "esp32",
      "i2s",
      "streaming",
      "mp3",
      "dac",
      "buffering",
      "freertos",
      "psram"
    ],
    "feature": false,
    "cost": 28.85,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "sound-reactive-led",
    "title": "Sound-reactive light strip",
    "cat": "audio",
    "level": 3,
    "time": "3 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "A strip that actually follows the music - a real spectrum analyser with automatic gain, not a VU meter that just flickers at the beat.",
    "tags": [
      "max9814",
      "ws2812b",
      "fft",
      "fastled",
      "spectrum",
      "vu meter",
      "music"
    ],
    "feature": true,
    "cost": 22.7,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "thermal-camera",
    "title": "Thermal camera",
    "cat": "camera",
    "level": 2,
    "time": "3 hours",
    "solder": false,
    "board": "ESP32",
    "blurb": "Sixty-four pixels, which sounds useless until you point it at a wall and see exactly where the heat is escaping. It measures temperature per pixel, which a megapixel camera never will.",
    "tags": [
      "thermal",
      "amg8833",
      "infrared",
      "interpolation",
      "heat loss",
      "no soldering",
      "tft"
    ],
    "feature": false,
    "cost": 45,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "timelapse-camera",
    "title": "Battery timelapse camera",
    "cat": "camera",
    "level": 3,
    "time": "2 hours",
    "solder": true,
    "board": "ESP32-CAM",
    "blurb": "Wakes on a timer, takes one frame, sleeps again. Weeks of a building site, a plant growing or the sky, assembled into a video afterwards.",
    "tags": [
      "esp32cam",
      "timelapse",
      "deep sleep",
      "sd card",
      "battery",
      "18650"
    ],
    "feature": false,
    "cost": 26.9,
    "boards": [
      "esp32cam"
    ]
  },
  {
    "slug": "esp32cam-motion-trap",
    "title": "Motion-triggered camera trap",
    "cat": "camera",
    "level": 3,
    "time": "3 hours",
    "solder": true,
    "board": "ESP32-CAM",
    "blurb": "Sleeps at 6 microamps until a PIR sensor sees something warm move, then wakes, takes a numbered photo to the SD card and goes back to sleep. Months on a battery.",
    "tags": [
      "esp32cam",
      "pir",
      "sd card",
      "deep sleep",
      "wildlife",
      "security"
    ],
    "feature": false,
    "cost": 21.5,
    "boards": [
      "esp32cam"
    ]
  },
  {
    "slug": "qr-scanner",
    "title": "QR code scanner and access control",
    "cat": "camera",
    "level": 3,
    "time": "4 hours",
    "solder": false,
    "board": "ESP32-CAM",
    "blurb": "Reads a QR code off a phone screen or a printed card and opens a door, logs a visitor, or looks up a part. All of it on the board, with no network and no cloud service.",
    "tags": [
      "esp32-cam",
      "qr code",
      "quirc",
      "access control",
      "offline",
      "reed-solomon",
      "grayscale"
    ],
    "feature": false,
    "cost": 28.94,
    "boards": [
      "esp32cam"
    ]
  },
  {
    "slug": "esp32cam-wifi-camera",
    "title": "Wi-Fi camera you can open in a browser",
    "cat": "camera",
    "level": 3,
    "time": "2 hours",
    "solder": true,
    "board": "ESP32-CAM",
    "blurb": "A $7 board that streams live video to any browser on your network, takes stills on demand, and needs about forty lines of real code.",
    "tags": [
      "esp32cam",
      "wifi",
      "mjpeg",
      "streaming",
      "ov2640",
      "ftdi"
    ],
    "feature": true,
    "cost": 24,
    "boards": [
      "esp32cam"
    ]
  },
  {
    "slug": "gsm-sms-alarm",
    "title": "SMS alarm that texts you",
    "cat": "cellular",
    "level": 2,
    "time": "4 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "A sensor somewhere with no Wi-Fi sends a text to your phone. Fifteen dollars, works from a shed or a field - and the clearest possible introduction to AT commands.",
    "tags": [
      "sim800l",
      "gsm",
      "2g",
      "sms",
      "at commands",
      "alarm",
      "pir",
      "no wifi"
    ],
    "feature": false,
    "cost": 34.1,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "lte-camera-uploader",
    "title": "LTE camera that posts pictures",
    "cat": "cellular",
    "level": 3,
    "time": "6 hours",
    "solder": true,
    "board": "ESP32-CAM",
    "blurb": "A camera in a field that photographs whatever moves and posts the picture to your phone. No Wi-Fi, no SD card to collect, no walking out to check it.",
    "tags": [
      "esp32-cam",
      "sim7600",
      "lte",
      "http post",
      "camera",
      "remote",
      "trail camera",
      "telegram"
    ],
    "feature": false,
    "cost": 99.35,
    "boards": [
      "esp32cam"
    ]
  },
  {
    "slug": "lte-remote-monitor",
    "title": "LTE remote monitor",
    "cat": "cellular",
    "level": 3,
    "time": "6 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "A sensor with no Wi-Fi and no base station of yours, posting to a dashboard you can open from anywhere. The tower is already built and paid for; you rent a few megabytes of it.",
    "tags": [
      "lte",
      "cat-1",
      "a7670",
      "mqtt",
      "iot sim",
      "telemetry",
      "at commands",
      "dashboard",
      "no wifi"
    ],
    "feature": true,
    "cost": 66.25,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "5g-edge-uplink",
    "title": "5G edge uplink for a camera site",
    "cat": "cellular",
    "level": 4,
    "time": "10 hours",
    "solder": false,
    "board": "UNO Q + RM500Q",
    "blurb": "A camera site with no fibre, no DSL and no Wi-Fi, pushing live video over 5G while a local model decides what is worth sending. Also a clear account of when 5G is ridiculous overkill, which is most of the time.",
    "tags": [
      "5g",
      "nr",
      "rm500q",
      "sub-6",
      "mimo",
      "qmi",
      "mbim",
      "edge",
      "uplink",
      "linux",
      "streaming"
    ],
    "feature": false,
    "cost": 469,
    "boards": [
      "uno-q"
    ]
  },
  {
    "slug": "nbiot-field-sensor",
    "title": "NB-IoT sensor that lasts years",
    "cat": "cellular",
    "level": 4,
    "time": "8 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "A cellular sensor on a battery for three years. The trick is not sleeping the Arduino - it is telling the mobile network to stop expecting you.",
    "tags": [
      "nb-iot",
      "lte-m",
      "sim7080g",
      "psm",
      "edrx",
      "deep sleep",
      "battery",
      "udp",
      "coap"
    ],
    "feature": false,
    "cost": 79.85,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "lte-remote-switch",
    "title": "Remote switch over LTE",
    "cat": "cellular",
    "level": 4,
    "time": "6 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Turn a heater on in a caravan before you arrive, or a pump off from another country. Control is much harder to get right than monitoring, and this guide is mostly about why.",
    "tags": [
      "lte",
      "a7670",
      "relay",
      "remote control",
      "mqtt",
      "mains",
      "watchdog",
      "failsafe"
    ],
    "feature": false,
    "cost": 61.19,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "kitchen-timer",
    "title": "Kitchen timer with a real knob",
    "cat": "display",
    "level": 1,
    "time": "1 hour",
    "solder": false,
    "board": "Nano",
    "blurb": "Turn the knob to set, press to start, press to pause. Four big digits you can read across a kitchen, and three presets for the things you always time.",
    "tags": [
      "tm1637",
      "rotary encoder",
      "timer",
      "interrupts",
      "no soldering",
      "first project",
      "kitchen"
    ],
    "feature": false,
    "cost": 11.3,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "analog-gauge-panel",
    "title": "Analogue gauge panel",
    "cat": "display",
    "level": 2,
    "time": "5 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Four moving-coil needles twitching away on a walnut panel, showing CPU load, the weather, unread email, whatever you like. Physical dials are readable from across a room in a way a screen never is.",
    "tags": [
      "analog meter",
      "pwm",
      "rc filter",
      "mqtt",
      "esp32",
      "dashboard",
      "retro"
    ],
    "feature": false,
    "cost": 41.55,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "desk-clock",
    "title": "Desk clock that dims itself",
    "cat": "display",
    "level": 2,
    "time": "2 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "Big red digits, accurate to a minute a year, that fade down at night instead of burning a hole in your bedroom ceiling.",
    "tags": [
      "ds3231",
      "tm1637",
      "rtc",
      "ldr",
      "alarm",
      "clock",
      "nano"
    ],
    "feature": false,
    "cost": 11.22,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "bus-departure-board",
    "title": "Live bus and train departure board",
    "cat": "display",
    "level": 2,
    "time": "4 hours",
    "solder": false,
    "board": "ESP32",
    "blurb": "The board from the bus stop, on your hallway wall, counting down to the departures you actually catch. It tells you whether to run, which is the only thing you wanted to know.",
    "tags": [
      "esp32",
      "transit",
      "api",
      "json",
      "wifi",
      "tft",
      "https",
      "ntp",
      "real time"
    ],
    "feature": false,
    "cost": 33.12,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "led-matrix-sign",
    "title": "Scrolling message sign",
    "cat": "display",
    "level": 2,
    "time": "2 hours",
    "solder": false,
    "board": "D1 Mini",
    "blurb": "Thirty-two by eight red pixels that scroll whatever you type into a web page on your phone. Chainable to any length.",
    "tags": [
      "max7219",
      "led matrix",
      "esp8266",
      "scrolling",
      "web server",
      "sign"
    ],
    "feature": false,
    "cost": 16.5,
    "boards": [
      "esp8266"
    ]
  },
  {
    "slug": "flight-tracker-display",
    "title": "What is that plane overhead",
    "cat": "display",
    "level": 2,
    "time": "4 hours",
    "solder": false,
    "board": "ESP32",
    "blurb": "Points at whatever aircraft is closest to directly above your house and tells you what it is, where it came from and how high it is. Answers a question you have had a hundred times and never looked up.",
    "tags": [
      "esp32",
      "adsb",
      "opensky",
      "api",
      "geometry",
      "oled",
      "aviation",
      "json"
    ],
    "feature": false,
    "cost": 20.55,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "epaper-dashboard",
    "title": "E-paper wall dashboard",
    "cat": "display",
    "level": 3,
    "time": "4 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Weather, forecast and the date on a paper-like screen that draws nothing between updates. Months on a battery, and it still shows something when the Wi-Fi dies.",
    "tags": [
      "e-paper",
      "esp32",
      "weather api",
      "deep sleep",
      "ntp",
      "battery"
    ],
    "feature": false,
    "cost": 43.59,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "split-flap-display",
    "title": "Split-flap message display",
    "cat": "display",
    "level": 3,
    "time": "12 hours, most of it mechanical",
    "solder": true,
    "board": "ESP32",
    "blurb": "Four mechanical character drums that clatter round to spell a word, exactly like an airport board in 1978. The electronics are simple. The mechanism is where the project actually lives.",
    "tags": [
      "split flap",
      "stepper",
      "28byj-48",
      "hall sensor",
      "homing",
      "mechanical",
      "esp32",
      "airport"
    ],
    "feature": false,
    "cost": 138.78,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "nixie-clock",
    "title": "Nixie tube clock",
    "cat": "display",
    "level": 4,
    "time": "10 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Four Soviet tubes from the 1970s glowing orange in a dark room. It is the most beautiful display you can build, and the only project here that will hurt you if you are careless.",
    "tags": [
      "nixie",
      "high voltage",
      "in-12",
      "k155id1",
      "rtc",
      "ntp",
      "multiplexing",
      "vintage"
    ],
    "feature": false,
    "cost": 83.17,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "word-clock",
    "title": "Word clock",
    "cat": "display",
    "level": 4,
    "time": "A weekend",
    "solder": true,
    "board": "Nano",
    "blurb": "IT IS TWENTY PAST THREE, spelled out in light on a grid of letters. The most-admired thing in this book, and the one where the woodwork matters more than the code.",
    "tags": [
      "ws2812b",
      "ds3231",
      "fastled",
      "word clock",
      "stencil",
      "light bleed"
    ],
    "feature": true,
    "cost": 63.84,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "brushless-thrust-bench",
    "title": "Brushless motor thrust bench",
    "cat": "drones",
    "level": 2,
    "time": "5 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "Bolt a motor to a stand and measure what it actually produces - grams of thrust, amps, watts, grams per watt. The right first brushless project, because nothing is trying to fly away from you.",
    "tags": [
      "brushless",
      "bldc",
      "esc",
      "thrust",
      "load cell",
      "hx711",
      "calibration",
      "lipo"
    ],
    "feature": false,
    "cost": 131.65,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "rc-receiver-decoder",
    "title": "Decode an RC receiver",
    "cat": "drones",
    "level": 2,
    "time": "4 hours",
    "solder": false,
    "board": "ESP32",
    "blurb": "Take sixteen channels off a proper RC transmitter into your own code. The bridge between hobby radio gear and everything you build - and the project where failsafe stops being a word.",
    "tags": [
      "rc",
      "sbus",
      "crsf",
      "ppm",
      "expresslrs",
      "receiver",
      "failsafe",
      "no soldering"
    ],
    "feature": false,
    "cost": 83.14,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "rc-rover-brushless",
    "title": "Brushless RC rover",
    "cat": "drones",
    "level": 3,
    "time": "8 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "A fast ground vehicle using the same motor, ESC and radio as a quadcopter - with telemetry on the handset and a failsafe that means \"stop\" rather than \"fall\". The sensible middle step.",
    "tags": [
      "rc car",
      "brushless",
      "esc",
      "crsf",
      "telemetry",
      "failsafe",
      "traction",
      "reverse"
    ],
    "feature": false,
    "cost": 194.4,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "rc-boat",
    "title": "RC boat with a bilge alarm",
    "cat": "drones",
    "level": 3,
    "time": "8 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "A boat has two problems no other vehicle has: water gets in, and when it stops it drifts away rather than staying put. Both are solvable and both need designing for.",
    "tags": [
      "rc boat",
      "brushed esc",
      "waterproofing",
      "bilge",
      "failsafe",
      "telemetry",
      "rudder",
      "flooding"
    ],
    "feature": false,
    "cost": 189.27,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "camera-gimbal",
    "title": "Two-axis camera gimbal",
    "cat": "drones",
    "level": 3,
    "time": "10 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "A brushless motor holding a camera perfectly level while you walk. The same PID loop as a flight controller, at walking pace, with nothing that can fall on anyone.",
    "tags": [
      "gimbal",
      "foc",
      "simplefoc",
      "bldc",
      "as5600",
      "pid",
      "stabilisation",
      "imu"
    ],
    "feature": false,
    "cost": 102.25,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "quadcopter-flight-controller",
    "title": "Write your own flight controller",
    "cat": "drones",
    "level": 4,
    "time": "20 hours, plus weeks of tuning",
    "solder": true,
    "board": "ESP32",
    "blurb": "Three PID loops, an IMU and four motors. The most demanding project in this book, and the one where the honest advice is to buy a Betaflight board - with a real explanation of why you might build it anyway.",
    "tags": [
      "quadcopter",
      "flight controller",
      "pid",
      "imu",
      "mpu6050",
      "complementary filter",
      "crsf",
      "betaflight",
      "arming"
    ],
    "feature": true,
    "cost": 323.24,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "desk-weather-station",
    "title": "Desk weather station",
    "cat": "environment",
    "level": 1,
    "time": "45 minutes",
    "solder": false,
    "board": "Uno",
    "blurb": "Temperature, humidity and dew point on a little OLED, with a running high and low. The classic first build, done properly.",
    "tags": [
      "dht22",
      "oled",
      "i2c",
      "temperature",
      "humidity",
      "first project",
      "no soldering"
    ],
    "feature": true,
    "cost": 18,
    "boards": [
      "uno"
    ]
  },
  {
    "slug": "co2-monitor",
    "title": "CO2 and ventilation monitor",
    "cat": "environment",
    "level": 2,
    "time": "2 hours",
    "solder": false,
    "board": "Nano",
    "blurb": "Real CO2 in parts per million, not a guess. Tells you when to open a window, and will change how you think about meeting rooms.",
    "tags": [
      "scd40",
      "co2",
      "ndir",
      "oled",
      "ventilation",
      "no soldering",
      "air quality"
    ],
    "feature": false,
    "cost": 34.85,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "greenhouse-frost-alarm",
    "title": "Greenhouse frost alarm",
    "cat": "environment",
    "level": 2,
    "time": "4 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Wakes you at 2 am when the greenhouse is heading for freezing - an hour before it gets there. Reporting frost is useless; by then it has already happened. This predicts it, and the physics for doing that is genuinely interesting.",
    "tags": [
      "frost",
      "greenhouse",
      "dew point",
      "radiative cooling",
      "prediction",
      "lora",
      "deep sleep",
      "ds18b20"
    ],
    "feature": false,
    "cost": 58.42,
    "boards": [
      "esp32",
      "nano"
    ]
  },
  {
    "slug": "fridge-freezer-logger",
    "title": "Fridge and freezer logger",
    "cat": "environment",
    "level": 3,
    "time": "3 hours",
    "solder": true,
    "board": "Uno",
    "blurb": "Three waterproof probes on one wire, a timestamped CSV on an SD card, and a buzzer when something warms up. Also proves your fridge door is not sealing.",
    "tags": [
      "ds18b20",
      "onewire",
      "sd card",
      "ds3231",
      "csv",
      "logging",
      "alarm"
    ],
    "feature": false,
    "cost": 33.32,
    "boards": [
      "uno"
    ]
  },
  {
    "slug": "air-quality-monitor",
    "title": "Indoor air quality monitor",
    "cat": "environment",
    "level": 3,
    "time": "3 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Real PM2.5 and PM10 numbers on a colour screen, with a plain-English verdict and a 24-hour chart. Cooking will surprise you.",
    "tags": [
      "pms5003",
      "bme280",
      "pm2.5",
      "tft",
      "esp32",
      "air quality",
      "mqtt"
    ],
    "feature": false,
    "cost": 41.95,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "noise-level-monitor",
    "title": "Noise level monitor",
    "cat": "environment",
    "level": 3,
    "time": "5 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Logs how loud it actually is, in dB(A), all day. Useful for a noise complaint, a workshop, or a nursery - and it is the clearest lesson in the book that a number with units can still be meaningless.",
    "tags": [
      "sound level",
      "dba",
      "a-weighting",
      "i2s",
      "inmp441",
      "rms",
      "calibration",
      "logging"
    ],
    "feature": false,
    "cost": 25,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "rain-wind-station",
    "title": "Rain gauge and wind station",
    "cat": "environment",
    "level": 3,
    "time": "7 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "A tipping bucket and a spinning cup, counting pulses in the rain for years at a time. The hardware is two reed switches. Everything difficult is about counting them correctly and surviving outdoors.",
    "tags": [
      "weather",
      "rain gauge",
      "anemometer",
      "reed switch",
      "interrupts",
      "debounce",
      "deep sleep",
      "outdoor"
    ],
    "feature": false,
    "cost": 87.65,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "electronic-dice",
    "title": "Electronic dice",
    "cat": "games",
    "level": 1,
    "time": "45 minutes",
    "solder": false,
    "board": "Uno",
    "blurb": "Seven LEDs laid out like a real die face, a tumble animation, and a statistics mode that shows whether your random numbers are actually fair.",
    "tags": [
      "leds",
      "button",
      "arrays",
      "random",
      "no soldering",
      "first project",
      "board games"
    ],
    "feature": false,
    "cost": 15.84,
    "boards": [
      "uno"
    ]
  },
  {
    "slug": "snake-oled",
    "title": "Snake on an OLED",
    "cat": "games",
    "level": 1,
    "time": "2 hours",
    "solder": false,
    "board": "Nano",
    "blurb": "The game everyone had on a Nokia, on eight dollars of parts. A perfect first game because the whole thing is one clean idea - and one subtle mistake that everybody makes first.",
    "tags": [
      "snake",
      "game loop",
      "oled",
      "ring buffer",
      "joystick",
      "eeprom",
      "no soldering"
    ],
    "feature": false,
    "cost": 13,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "reaction-timer",
    "title": "Two-player reaction timer",
    "cat": "games",
    "level": 1,
    "time": "1 hour",
    "solder": false,
    "board": "Uno",
    "blurb": "A random wait, then a light. Whoever hits their button first wins, and it shows the time in milliseconds. Brutally addictive.",
    "tags": [
      "game",
      "buttons",
      "tm1637",
      "millis",
      "debounce",
      "no soldering",
      "first project"
    ],
    "feature": false,
    "cost": 13.81,
    "boards": [
      "uno"
    ]
  },
  {
    "slug": "oled-pong",
    "title": "Pong on an OLED",
    "cat": "games",
    "level": 2,
    "time": "90 minutes",
    "solder": false,
    "board": "Nano",
    "blurb": "Two knobs, a 0.96 inch screen, and the 1972 original. Includes a computer opponent that is beatable on purpose.",
    "tags": [
      "oled",
      "game",
      "potentiometer",
      "physics",
      "ai",
      "no soldering"
    ],
    "feature": false,
    "cost": 10.45,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "simon-says",
    "title": "Simon says",
    "cat": "games",
    "level": 2,
    "time": "90 minutes",
    "solder": true,
    "board": "Nano",
    "blurb": "Four colours, four notes, a sequence that grows by one every round. Survives being dropped, and remembers the high score.",
    "tags": [
      "game",
      "leds",
      "buttons",
      "tone",
      "eeprom",
      "memory game"
    ],
    "feature": true,
    "cost": 8.73,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "tilt-maze",
    "title": "Tilt maze in your hands",
    "cat": "games",
    "level": 2,
    "time": "3 hours",
    "solder": false,
    "board": "Nano",
    "blurb": "Tilt the box and a ball rolls through a maze on the screen. Simple to build, and the moment it goes from \"moves when tilted\" to \"feels like a real ball\" is one line of physics.",
    "tags": [
      "game",
      "mpu6050",
      "physics",
      "collision",
      "oled",
      "accelerometer",
      "integration",
      "no soldering"
    ],
    "feature": false,
    "cost": 16.2,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "espresso-scale",
    "title": "Espresso scale with flow rate",
    "cat": "kitchen",
    "level": 2,
    "time": "5 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Weighs a shot to a tenth of a gram and shows how fast it is pouring. The engineering problem is that accuracy and speed pull in opposite directions, and espresso needs both.",
    "tags": [
      "load cell",
      "hx711",
      "coffee",
      "calibration",
      "drift",
      "filtering",
      "latency",
      "esp32"
    ],
    "feature": false,
    "cost": 32.15,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "fermentation-monitor",
    "title": "Sourdough and fermentation monitor",
    "cat": "kitchen",
    "level": 2,
    "time": "4 hours",
    "solder": false,
    "board": "ESP32",
    "blurb": "A laser rangefinder over a jar of starter, measuring the rise to the millimetre. It tells you when the dough is ready - which is a question about the shape of a curve, not about how many hours have passed.",
    "tags": [
      "sourdough",
      "fermentation",
      "vl53l0x",
      "time of flight",
      "esp32",
      "logging",
      "derivative",
      "q10"
    ],
    "feature": false,
    "cost": 29.5,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "sous-vide-controller",
    "title": "Sous vide controller",
    "cat": "kitchen",
    "level": 3,
    "time": "6 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Holds a pot of water at 54.5 degrees for three hours without drifting. It is the clearest demonstration of PID control you can build, and the only one whose output you can eat.",
    "tags": [
      "pid",
      "sous vide",
      "ssr",
      "mains",
      "ds18b20",
      "thermal lag",
      "autotune",
      "cooking"
    ],
    "feature": true,
    "cost": 35.57,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "bbq-thermometer",
    "title": "Wireless BBQ and roast thermometer",
    "cat": "kitchen",
    "level": 3,
    "time": "6 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "One probe in the meat, one in the air, and a radio link that reaches the far end of the garden. It also predicts when dinner will be ready, and explains why that prediction goes badly wrong for two hours in the middle.",
    "tags": [
      "thermocouple",
      "max31855",
      "lora",
      "bbq",
      "cold junction",
      "the stall",
      "prediction",
      "esp32"
    ],
    "feature": false,
    "cost": 88.95,
    "boards": [
      "esp32",
      "nano"
    ]
  },
  {
    "slug": "rgb-mood-lamp",
    "title": "RGB mood lamp",
    "cat": "light",
    "level": 1,
    "time": "45 minutes",
    "solder": false,
    "board": "Nano",
    "blurb": "One knob picks any colour in the spectrum, one button cycles through six moods. The gentlest possible introduction to addressable LEDs.",
    "tags": [
      "ws2812b",
      "fastled",
      "potentiometer",
      "hsv",
      "no soldering",
      "first project"
    ],
    "feature": false,
    "cost": 16.52,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "stair-lights",
    "title": "Stair lights that follow you up",
    "cat": "light",
    "level": 2,
    "time": "6 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Steps light one after another as you climb, and go out behind you. It works out which way you are going from two sensors, which is the only part of this with any real thinking in it.",
    "tags": [
      "stairs",
      "ws2812",
      "pir",
      "tof",
      "direction",
      "animation",
      "night light",
      "esp32"
    ],
    "feature": false,
    "cost": 49.39,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "sunrise-lamp",
    "title": "Sunrise alarm lamp",
    "cat": "light",
    "level": 2,
    "time": "4 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Brightens over thirty minutes from a dim red to full daylight, so you wake up before the alarm goes off. Getting the fade to look natural is a lesson in the difference between what a number says and what an eye sees.",
    "tags": [
      "wake light",
      "gamma correction",
      "pwm",
      "colour temperature",
      "circadian",
      "ntp",
      "ws2812",
      "esp32"
    ],
    "feature": false,
    "cost": 32.52,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "ambient-tv-backlight",
    "title": "Ambient light behind the TV",
    "cat": "light",
    "level": 3,
    "time": "3 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Addressable LEDs around the back of a screen, with a web page for colour and effects, and a proper power supply so it does not brown out at white.",
    "tags": [
      "ws2812b",
      "fastled",
      "esp32",
      "bias lighting",
      "power injection",
      "web server"
    ],
    "feature": true,
    "cost": 31.62,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "infinity-mirror",
    "title": "Infinity mirror",
    "cat": "light",
    "level": 3,
    "time": "4 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "A tunnel of light that is not there. Two sheets of glass, a ring of LEDs, and the most disproportionate effort-to-impressiveness ratio in this book.",
    "tags": [
      "ws2812b",
      "fastled",
      "mirror",
      "ring",
      "effects",
      "rotary encoder"
    ],
    "feature": false,
    "cost": 40.92,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "smart-bike-light",
    "title": "Bike light that knows you are braking",
    "cat": "light",
    "level": 4,
    "time": "5 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "A rear light that flares bright red when you slow down, flashes amber when you signal, and charges over USB. Brake lights, on a bicycle.",
    "tags": [
      "ws2812b",
      "mpu6050",
      "lipo",
      "tp4056",
      "accelerometer",
      "bike",
      "wearable"
    ],
    "feature": false,
    "cost": 34.96,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "battery-capacity-tester",
    "title": "Battery capacity tester",
    "cat": "power",
    "level": 2,
    "time": "90 minutes",
    "solder": false,
    "board": "Nano",
    "blurb": "Discharges a cell through a resistor, counts the milliamp-hours, and cuts off safely. Finds out which of your 18650s are actually 3000 mAh and which are 700.",
    "tags": [
      "ina219",
      "mosfet",
      "load resistor",
      "18650",
      "mah",
      "discharge curve",
      "no soldering"
    ],
    "feature": false,
    "cost": 18.69,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "usb-power-meter",
    "title": "USB power meter",
    "cat": "power",
    "level": 2,
    "time": "2 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "Volts, amps, watts and accumulated milliamp-hours on a little screen. The tool that answers \"why does my project keep resetting?\"",
    "tags": [
      "ina219",
      "oled",
      "current",
      "mah",
      "i2c",
      "measurement",
      "battery"
    ],
    "feature": true,
    "cost": 13.5,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "solar-battery-logger",
    "title": "Solar harvest logger",
    "cat": "power",
    "level": 4,
    "time": "4 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Two current sensors, one cell and an SD card: how much a small panel really harvests, how much your project really uses, and whether it can run forever.",
    "tags": [
      "solar",
      "ina219",
      "tp4056",
      "18650",
      "csv",
      "deep sleep",
      "energy budget"
    ],
    "feature": false,
    "cost": 37.33,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "mains-energy-monitor",
    "title": "Whole-house energy monitor",
    "cat": "power",
    "level": 4,
    "time": "4 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "A clamp that goes round one cable without touching it, and tells you what the house is drawing, in watts, live. No mains contact anywhere in the build.",
    "tags": [
      "sct-013",
      "current transformer",
      "rms",
      "energy",
      "mqtt",
      "esp32",
      "non-contact"
    ],
    "feature": false,
    "cost": 27.82,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "hc05-bluetooth-control",
    "title": "Bluetooth control from a phone",
    "cat": "radio",
    "level": 2,
    "time": "3 hours",
    "solder": false,
    "board": "Nano",
    "blurb": "Three dollars turns your USB cable into a wireless one. Type a command on your phone, the lamp changes colour, and the temperature comes back the other way.",
    "tags": [
      "hc-05",
      "bluetooth",
      "spp",
      "serial",
      "at commands",
      "phone control",
      "android",
      "no soldering",
      "ws2812"
    ],
    "feature": false,
    "cost": 18.73,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "gps-bike-computer",
    "title": "GPS bike computer",
    "cat": "radio",
    "level": 2,
    "time": "4 hours",
    "solder": false,
    "board": "Nano",
    "blurb": "Speed, distance, heading and a clock set from orbit, on a $20 build. Also the clearest way to understand what a GPS fix actually is and why it takes so long the first time.",
    "tags": [
      "gps",
      "neo-6m",
      "nmea",
      "tinygps",
      "speed",
      "hdop",
      "satellites",
      "no soldering",
      "cycling"
    ],
    "feature": false,
    "cost": 31.49,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "nrf24-sensor-link",
    "title": "Wireless sensor link on 2.4 GHz",
    "cat": "radio",
    "level": 2,
    "time": "3 hours",
    "solder": false,
    "board": "Nano x2",
    "blurb": "Three dollars of radio, a sensor in the garden and a display indoors. Also the project where you learn why almost everyone's first nRF24 does not work.",
    "tags": [
      "nrf24l01",
      "2.4ghz",
      "wireless",
      "spi",
      "sensor node",
      "acknowledgement",
      "no soldering",
      "bme280"
    ],
    "feature": false,
    "cost": 27.16,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "lora-remote-sensor",
    "title": "LoRa sensor across a valley",
    "cat": "radio",
    "level": 3,
    "time": "6 hours",
    "solder": true,
    "board": "ESP32 x2",
    "blurb": "A battery sensor two kilometres away, reporting through trees and buildings, with no Wi-Fi, no SIM card and no monthly bill. The trade is that it can only say a little, slowly.",
    "tags": [
      "lora",
      "sx1276",
      "868mhz",
      "long range",
      "spread spectrum",
      "deep sleep",
      "duty cycle",
      "solar",
      "rssi",
      "link budget"
    ],
    "feature": true,
    "cost": 65.81,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "lora-offgrid-messenger",
    "title": "Off-grid messenger",
    "cat": "radio",
    "level": 3,
    "time": "8 hours for the pair",
    "solder": true,
    "board": "ESP32 x2",
    "blurb": "Two pocket units that text each other across a valley with no phone signal, no network and no account. Preset messages, delivery confirmation, and an honest reckoning with how slow it has to be.",
    "tags": [
      "lora",
      "sx1276",
      "messaging",
      "off grid",
      "handheld",
      "acknowledgement",
      "oled",
      "lipo",
      "duty cycle"
    ],
    "feature": false,
    "cost": 65.9,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "gps-lora-tracker",
    "title": "GPS tracker over LoRa",
    "cat": "radio",
    "level": 4,
    "time": "10 hours",
    "solder": true,
    "board": "ESP32 + Nano",
    "blurb": "Where is the boat, the beehive, the trailer? Position reported over kilometres with no SIM and no subscription - and a clear statement of what this must never be used for.",
    "tags": [
      "gps",
      "lora",
      "tracker",
      "geofence",
      "deep sleep",
      "solar",
      "asset tracking",
      "neo-6m",
      "sx1276"
    ],
    "feature": false,
    "cost": 71.6,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "nfc-tag-automation",
    "title": "NFC tags that run your house",
    "cat": "rfid",
    "level": 2,
    "time": "4 hours",
    "solder": false,
    "board": "ESP32",
    "blurb": "A tag by the door that sets the house to \"out\", one by the bed for \"goodnight\", one on a jar that adds it to the shopping list. The tags carry the instruction themselves, so adding one needs no code change.",
    "tags": [
      "nfc",
      "ndef",
      "pn532",
      "mqtt",
      "home assistant",
      "ntag215",
      "automation",
      "esp32"
    ],
    "feature": false,
    "cost": 27.57,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "rfid-attendance-logger",
    "title": "RFID attendance logger",
    "cat": "rfid",
    "level": 3,
    "time": "3 hours",
    "solder": true,
    "board": "Uno",
    "blurb": "Tap in, tap out, and a CSV on an SD card knows who was where and for how long. For a workshop, a club, a classroom or a tool crib.",
    "tags": [
      "rc522",
      "sd card",
      "ds3231",
      "csv",
      "attendance",
      "names",
      "logging"
    ],
    "feature": false,
    "cost": 29.89,
    "boards": [
      "uno"
    ]
  },
  {
    "slug": "rfid-door-lock",
    "title": "RFID card lock",
    "cat": "rfid",
    "level": 3,
    "time": "4 hours",
    "solder": true,
    "board": "Uno",
    "blurb": "Tap a card, the bolt retracts. Cards are enrolled by holding a master card, stored in EEPROM, and survive a power cut.",
    "tags": [
      "rc522",
      "rfid",
      "solenoid",
      "relay",
      "eeprom",
      "access control",
      "mifare"
    ],
    "feature": true,
    "cost": 33.39,
    "boards": [
      "uno"
    ]
  },
  {
    "slug": "nfc-jukebox",
    "title": "Tap-a-card jukebox",
    "cat": "rfid",
    "level": 3,
    "time": "4 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "Put a card on the box and the album plays. Take it off and it stops. No screen, no app, no account - and a four-year-old can work it.",
    "tags": [
      "rc522",
      "dfplayer",
      "nfc",
      "music",
      "kids",
      "toniebox",
      "amplifier"
    ],
    "feature": false,
    "cost": 30.59,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "rfid-tool-board",
    "title": "Tool board that knows what is missing",
    "cat": "rfid",
    "level": 3,
    "time": "7 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "A shadow board with a reader behind every outline. It shows at a glance what is out and who has it, which is the difference between a workshop and a search party.",
    "tags": [
      "rfid",
      "rc522",
      "spi",
      "shadow board",
      "workshop",
      "presence",
      "multiple readers",
      "antenna"
    ],
    "feature": false,
    "cost": 30.87,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "parking-sensor",
    "title": "Garage parking sensor",
    "cat": "robotics",
    "level": 1,
    "time": "40 minutes",
    "solder": false,
    "board": "Uno",
    "blurb": "Green, amber, red and a beep that gets faster as you get closer. Stops you putting the bumper through the back wall, and it is your first useful build.",
    "tags": [
      "hc-sr04",
      "ultrasonic",
      "leds",
      "buzzer",
      "no soldering",
      "first project",
      "garage"
    ],
    "feature": false,
    "cost": 17.01,
    "boards": [
      "uno"
    ]
  },
  {
    "slug": "pan-tilt-camera",
    "title": "Pan-tilt camera head",
    "cat": "robotics",
    "level": 2,
    "time": "2 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "Two servos on a bracket, a thumbstick to aim them, and an automatic patrol mode. Put a camera on it and you have a $20 PTZ.",
    "tags": [
      "servo",
      "joystick",
      "pan tilt",
      "esp32cam",
      "smoothing",
      "sweep"
    ],
    "feature": false,
    "cost": 19.85,
    "boards": [
      "nano",
      "esp32cam"
    ]
  },
  {
    "slug": "pet-feeder",
    "title": "Automatic pet feeder",
    "cat": "robotics",
    "level": 3,
    "time": "8 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Dispenses a weighed portion twice a day, and tells you when it did not. The interesting design constraint is that the thing it feeds cannot tell you it went hungry, so every failure has to announce itself.",
    "tags": [
      "auger",
      "stepper",
      "load cell",
      "jam detection",
      "rtc",
      "fail safe",
      "portion control",
      "esp32"
    ],
    "feature": false,
    "cost": 30.52,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "line-following-robot",
    "title": "Line-following robot",
    "cat": "robotics",
    "level": 3,
    "time": "3 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "Follows a black line at speed, corners without falling off, and finds the line again when it loses it. The first project where control theory earns its keep.",
    "tags": [
      "tcrt5000",
      "line follower",
      "l298n",
      "pid",
      "proportional",
      "robot"
    ],
    "feature": false,
    "cost": 34.08,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "obstacle-avoiding-robot",
    "title": "Obstacle-avoiding robot",
    "cat": "robotics",
    "level": 3,
    "time": "4 hours",
    "solder": true,
    "board": "Uno",
    "blurb": "Drives forward, sweeps its head left and right when something is in the way, and turns towards whichever side has more room.",
    "tags": [
      "l298n",
      "tt motor",
      "hc-sr04",
      "servo",
      "robot",
      "chassis",
      "pwm"
    ],
    "feature": false,
    "cost": 39.9,
    "boards": [
      "uno"
    ]
  },
  {
    "slug": "robot-arm",
    "title": "Robot arm that remembers",
    "cat": "robotics",
    "level": 3,
    "time": "A weekend",
    "solder": true,
    "board": "Nano",
    "blurb": "Four servos, two thumbsticks, and a record button. Teach it a sequence by moving it by hand, then press play and watch it repeat it forever.",
    "tags": [
      "pca9685",
      "servo",
      "joystick",
      "eeprom",
      "playback",
      "i2c",
      "robot arm"
    ],
    "feature": false,
    "cost": 35.19,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "5g-teleoperated-rover",
    "title": "5G teleoperated rover",
    "cat": "robotics",
    "level": 4,
    "time": "12 hours",
    "solder": true,
    "board": "UNO Q + RM500Q",
    "blurb": "Drive a rover from anywhere with a browser, watching through its camera. The engineering is entirely about latency - how much there is, where it comes from, and what the rover does when it stops arriving.",
    "tags": [
      "5g",
      "teleoperation",
      "latency",
      "webrtc",
      "deadman",
      "rover",
      "urllc",
      "remote control",
      "failsafe"
    ],
    "feature": false,
    "cost": 480.45,
    "boards": [
      "uno-q"
    ]
  },
  {
    "slug": "reaction-wheel-cube",
    "title": "Cube that balances on its corner",
    "cat": "robotics",
    "level": 5,
    "time": "Weeks. Genuinely.",
    "solder": true,
    "board": "ESP32",
    "blurb": "A cube that stands on one corner, stays there, and can throw itself upright from lying flat by braking a spinning flywheel. It is the hardest thing in this book by a wide margin, and when it works it does not look like it should be possible.",
    "tags": [
      "reaction wheel",
      "cubli",
      "lqr",
      "foc",
      "simplefoc",
      "inverted pendulum",
      "state space",
      "angular momentum",
      "balance"
    ],
    "feature": true,
    "cost": 217.2,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "automatic-plant-waterer",
    "title": "Automatic plant waterer",
    "cat": "smart-home",
    "level": 2,
    "time": "2 hours",
    "solder": true,
    "board": "Nano",
    "blurb": "Reads the soil, runs a little pump for a few seconds when it gets dry, then waits. Will not flood your plant, because it is written not to.",
    "tags": [
      "soil moisture",
      "pump",
      "relay",
      "oled",
      "plants",
      "nano"
    ],
    "feature": false,
    "cost": 26.28,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "letterbox-notifier",
    "title": "Letterbox notifier",
    "cat": "smart-home",
    "level": 2,
    "time": "3 hours",
    "solder": true,
    "board": "ESP8266",
    "blurb": "Tells your phone when the post arrives. Genuinely useful if your letterbox is at the end of a drive, and the best small lesson in interrupt-driven deep sleep in this book.",
    "tags": [
      "deep sleep",
      "reed switch",
      "battery",
      "notification",
      "interrupt wake",
      "esp8266",
      "low power"
    ],
    "feature": false,
    "cost": 15.64,
    "boards": [
      "esp8266"
    ]
  },
  {
    "slug": "presence-detector",
    "title": "mmWave presence sensor",
    "cat": "smart-home",
    "level": 2,
    "time": "3 hours",
    "solder": false,
    "board": "ESP8266",
    "blurb": "The reason your lights go off while you are sitting reading. A PIR sees movement; this sees a person breathing, and it costs four dollars.",
    "tags": [
      "mmwave",
      "ld2410",
      "presence",
      "radar",
      "occupancy",
      "home assistant",
      "no soldering",
      "doppler"
    ],
    "feature": false,
    "cost": 12.07,
    "boards": [
      "esp8266"
    ]
  },
  {
    "slug": "motion-activated-lights",
    "title": "Motion-activated cupboard light",
    "cat": "smart-home",
    "level": 2,
    "time": "90 minutes",
    "solder": true,
    "board": "Nano",
    "blurb": "Walk up, the light fades on. Walk away, it fades off. Stays off in daylight. The most genuinely useful hour of soldering in this book.",
    "tags": [
      "pir",
      "mosfet",
      "led strip",
      "ldr",
      "nano",
      "fade",
      "under-cabinet"
    ],
    "feature": false,
    "cost": 21.71,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "fan-thermostat",
    "title": "Thermostat for a fan",
    "cat": "smart-home",
    "level": 2,
    "time": "1 hour",
    "solder": false,
    "board": "Nano",
    "blurb": "Reads the temperature and speeds a fan up as it climbs, instead of banging on and off. For a cupboard full of network gear, a 3D printer, or a greenhouse.",
    "tags": [
      "dht22",
      "mosfet",
      "fan",
      "pwm",
      "hysteresis",
      "no soldering",
      "thermostat"
    ],
    "feature": false,
    "cost": 22.67,
    "boards": [
      "nano"
    ]
  },
  {
    "slug": "door-window-sensor",
    "title": "Battery door and window sensor",
    "cat": "smart-home",
    "level": 3,
    "time": "2 hours",
    "solder": true,
    "board": "D1 Mini",
    "blurb": "A magnet, a reed switch and an ESP8266 that sleeps at microamps and only wakes when the door moves. Months on a pair of AA cells.",
    "tags": [
      "esp8266",
      "reed switch",
      "mqtt",
      "deep sleep",
      "battery",
      "home assistant"
    ],
    "feature": false,
    "cost": 10.14,
    "boards": [
      "esp8266"
    ]
  },
  {
    "slug": "smart-thermostat",
    "title": "Programmable thermostat",
    "cat": "smart-home",
    "level": 3,
    "time": "5 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Replaces a dial on a wall with something that knows what day it is. The interesting part is not the relay - it is stopping the boiler cycling on and off every ninety seconds.",
    "tags": [
      "thermostat",
      "heating",
      "hysteresis",
      "relay",
      "schedule",
      "mqtt",
      "home assistant",
      "ds18b20"
    ],
    "feature": false,
    "cost": 28.41,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "water-leak-alarm",
    "title": "Water leak alarm and cutoff",
    "cat": "smart-home",
    "level": 3,
    "time": "5 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Probes under the washing machine, the boiler and the sink. Water bridges the tracks, a valve shuts, and a notification arrives - before the ceiling comes down.",
    "tags": [
      "water leak",
      "solenoid valve",
      "alarm",
      "mqtt",
      "failsafe",
      "corrosion",
      "insurance"
    ],
    "feature": false,
    "cost": 42.62,
    "boards": [
      "esp32"
    ]
  },
  {
    "slug": "smart-plug-relay",
    "title": "Wi-Fi switch for a mains lamp",
    "cat": "smart-home",
    "level": 4,
    "time": "4 hours",
    "solder": true,
    "board": "ESP32",
    "blurb": "Switch a real lamp from your phone, from a wall button, or from Home Assistant. The project where the wiring genuinely matters.",
    "tags": [
      "esp32",
      "relay",
      "mains",
      "mqtt",
      "home assistant",
      "web server",
      "wifi"
    ],
    "feature": true,
    "cost": 17.57,
    "boards": [
      "esp32"
    ]
  }
];
