/* ==========================================================================
   categories.js - the shelves the projects sit on.
   `icon` is the inner markup of a 24x24 stroke SVG (stroke-width 1.6,
   currentColor, no fill) so the cards stay theme-aware without any images.
   ========================================================================== */
window.AB = window.AB || {};

AB.categories = [
  {
    slug: 'smart-home',
    name: 'Smart Home & Automation',
    blurb: 'Switch real things on and off: lamps, heaters, kettles, locks, blinds. The category where a hobby project starts earning its keep - and the one where mains voltage means you have to be careful.',
    learn: 'Relays, mains safety, MQTT, Home Assistant, deep sleep, scheduling.',
    icon: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>'
  },
  {
    slug: 'camera',
    name: 'Cameras & Vision',
    blurb: 'A $7 board with a lens on it that streams video over Wi-Fi, recognises faces, reads number plates and saves stills to an SD card. The best value in the whole hobby.',
    learn: 'ESP32-CAM, MJPEG streaming, frame buffers, SD storage, motion detection, brownouts.',
    icon: '<path d="M3 7.5h3.5L8 5.5h8L17.5 7.5H21v12H3z"/><circle cx="12" cy="13" r="3.6"/>'
  },
  {
    slug: 'rfid',
    name: 'RFID, NFC & Access',
    blurb: 'Tap a card, open a thing. Door locks, attendance loggers, cabinet latches, tool cribs and the surprisingly deep question of what "secure" means when the tag costs 20 cents.',
    learn: 'SPI, MIFARE sectors, UID vs stored data, solenoid drive, EEPROM, relay isolation.',
    icon: '<rect x="2.5" y="5" width="13" height="14" rx="2"/><path d="M17.5 8.2a5.5 5.5 0 0 1 0 7.6M20 6a9 9 0 0 1 0 12"/><circle cx="9" cy="12" r="2.2"/>'
  },
  {
    slug: 'environment',
    name: 'Weather & Environment',
    blurb: 'Measure the world and write it down. Temperature, humidity, pressure, particulates, CO2, soil moisture, rainfall - then chart a year of it and find out that your house is damper than you thought.',
    learn: 'I2C, sensor calibration, data logging, CSV, dashboards, long-term drift.',
    icon: '<path d="M12 3.5c-2.4 3.4-4.5 6.2-4.5 8.7a4.5 4.5 0 1 0 9 0c0-2.5-2.1-5.3-4.5-8.7z"/><path d="M9.8 12.8a2.4 2.4 0 0 0 2.4 2.4"/>'
  },
  {
    slug: 'robotics',
    name: 'Robots & Motion',
    blurb: 'Anything that moves under its own power: line followers, obstacle avoiders, robot arms, camera sliders, plant waterers, pan-tilt heads and the endless business of stopping motors browning out your board.',
    learn: 'PWM, H-bridges, servos, steppers, PID, separate motor supplies, kinematics.',
    icon: '<rect x="4.5" y="8" width="15" height="10" rx="2.5"/><path d="M12 8V4.5M9.5 4.5h5"/><circle cx="9" cy="13" r="1.4"/><circle cx="15" cy="13" r="1.4"/><path d="M2.5 12v3M21.5 12v3"/>'
  },
  {
    slug: 'display',
    name: 'Displays & Clocks',
    blurb: 'Screens that show something worth looking at. Word clocks, weather panels, retro segment displays, e-paper dashboards, tiny OLED status widgets and the classic Nixie-adjacent nonsense.',
    learn: 'I2C and SPI displays, fonts, bitmaps, RTCs, NTP time, partial refresh, framebuffers.',
    icon: '<rect x="2.5" y="4.5" width="19" height="13" rx="2"/><path d="M8 21h8M12 17.5V21"/><path d="M6.5 9h5M6.5 12.5h8"/>'
  },
  {
    slug: 'audio',
    name: 'Sound & Music',
    blurb: 'Buzzers that play melodies, MP3 modules, theremins, drum machines, sound-reactive lighting and microphones that turn a room into a spectrum analyser.',
    learn: 'tone(), PWM audio, DFPlayer serial, I2S microphones, FFT, sampling rates.',
    icon: '<path d="M4 15V9h3.5L13 4.5v15L7.5 15z"/><path d="M16.5 9.2a4 4 0 0 1 0 5.6M19 6.7a7.5 7.5 0 0 1 0 10.6"/>'
  },
  {
    slug: 'light',
    name: 'LEDs & Wearables',
    blurb: 'Addressable strips, matrices, infinity mirrors, bike lights, costume props and anything else where the answer to "how many LEDs" is "more". Also where you learn why power injection exists.',
    learn: 'WS2812B timing, FastLED, HSV colour, power budgeting, level shifting, LiPo safety.',
    icon: '<path d="M9 17.5h6M10 20.5h4"/><path d="M12 3.2a5.8 5.8 0 0 0-3.4 10.5c.5.4.9 1 .9 1.6v.2h5v-.2c0-.6.4-1.2.9-1.6A5.8 5.8 0 0 0 12 3.2z"/>'
  },
  {
    slug: 'games',
    name: 'Games & Toys',
    blurb: 'Handheld consoles on an OLED, reaction-time testers, Simon clones, dice, slot machines, laser tag and arcade cabinets small enough to sit on a shelf.',
    learn: 'Game loops, debouncing, state machines, sprites, random seeds, score storage.',
    icon: '<rect x="2.5" y="7" width="19" height="10" rx="4"/><path d="M7 10.5v3M5.5 12h3"/><circle cx="16" cy="11" r="1"/><circle cx="18.3" cy="13.2" r="1"/>'
  },
  {
    slug: 'power',
    name: 'Power, Energy & Measurement',
    blurb: 'Battery monitors, solar loggers, mains energy meters, bench supplies and the deep-sleep tricks that turn a three-day battery life into a nine-month one.',
    learn: 'INA219, ACS712, deep sleep, buck converters, LiPo charging, coulomb counting.',
    icon: '<path d="M3.5 8.5h13v7h-13z"/><path d="M16.5 11h2.2v2h-2.2"/><path d="M20.5 9.5v5"/><path d="M9.8 9.6 7.3 12.4h2.9l-.6 2.2 2.6-3h-2.9z" fill="currentColor" stroke="none"/>'
  }
];

AB.catIndex = AB.categories.reduce(function (m, c) { m[c.slug] = c; return m; }, {});

/* Difficulty is a 1-4 scale used for the chips and the filter. */
AB.levels = [
  { n: 1, name: 'Beginner',     hint: 'No soldering needed. Breadboard and jumper wires. First-week stuff.' },
  { n: 2, name: 'Easy',         hint: 'Some soldering of headers, a handful of modules, a library or two.' },
  { n: 3, name: 'Intermediate', hint: 'Real soldering, power planning, several libraries, a day of work.' },
  { n: 4, name: 'Advanced',     hint: 'Mains voltage, LiPo, custom boards or fiddly debugging. Know what you are doing.' }
];
