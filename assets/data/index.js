/* ==========================================================================
   index.js - GENERATED FILE, do not edit by hand.
   Rebuild with:  node tools/build-index.js
   A summary of every project so the home page and the catalogue can render
   without loading 40 full build guides.
   ========================================================================== */
window.AB = window.AB || {};

AB.index = [
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
    "cost": 14.79
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
    "cost": 25.97
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
    "cost": 22.7
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
    "cost": 26.9
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
    "cost": 21.5
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
    "cost": 24
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
    "cost": 11.3
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
    "cost": 11.22
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
    "cost": 16.5
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
    "cost": 43.59
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
    "cost": 63.84
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
    "cost": 18
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
    "cost": 34.85
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
    "cost": 33.32
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
    "cost": 41.95
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
    "cost": 15.84
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
    "cost": 13.81
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
    "cost": 10.45
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
    "cost": 8.73
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
    "cost": 16.52
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
    "cost": 31.62
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
    "cost": 40.92
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
    "cost": 34.96
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
    "cost": 18.69
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
    "cost": 13.5
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
    "cost": 37.33
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
    "cost": 27.77
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
    "cost": 29.89
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
    "cost": 33.39
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
    "cost": 30.59
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
    "cost": 17.01
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
    "cost": 19.85
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
    "cost": 34.08
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
    "feature": true,
    "cost": 39.9
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
    "cost": 35.19
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
    "cost": 26.28
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
    "cost": 21.71
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
    "cost": 22.67
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
    "cost": 10.14
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
    "cost": 17.57
  }
];
