/* ==========================================================================
   categories.js - the shelves the projects sit on.
   `icon` is the inner markup of a 24x24 stroke SVG (stroke-width 1.6,
   currentColor, no fill) so the cards stay theme-aware without any images.
   ========================================================================== */
window.AB = window.AB || {};

AB.categories = [
  {
    slug: 'smart-home',
    sv: { name: 'Smarta hem och automation',
          blurb: 'Slå på och av riktiga saker: lampor, element, vattenkokare, lås, persienner. Kategorin där ett hobbyprojekt börjar göra nytta - och den där nätspänning gör att du måste vara försiktig.',
          learn: 'Reläer, nätsäkerhet, MQTT, Home Assistant, djupsömn, schemaläggning.' },
    name: 'Smart Home & Automation',
    blurb: 'Switch real things on and off: lamps, heaters, kettles, locks, blinds. The category where a hobby project starts earning its keep - and the one where mains voltage means you have to be careful.',
    learn: 'Relays, mains safety, MQTT, Home Assistant, deep sleep, scheduling.',
    icon: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>'
  },
  {
    slug: 'camera',
    sv: { name: 'Kameror och bildbehandling',
          blurb: 'Ett kort för 70 kronor med en lins på som strömmar video över wifi, känner igen ansikten, läser registreringsskyltar och sparar bilder på ett SD-kort. Bäst valuta för pengarna i hela hobbyn.',
          learn: 'ESP32-CAM, MJPEG-strömning, bildbuffertar, SD-lagring, rörelsedetektering, spänningsfall.' },
    name: 'Cameras & Vision',
    blurb: 'A $7 board with a lens on it that streams video over Wi-Fi, recognises faces, reads number plates and saves stills to an SD card. The best value in the whole hobby.',
    learn: 'ESP32-CAM, MJPEG streaming, frame buffers, SD storage, motion detection, brownouts.',
    icon: '<path d="M3 7.5h3.5L8 5.5h8L17.5 7.5H21v12H3z"/><circle cx="12" cy="13" r="3.6"/>'
  },
  {
    slug: 'rfid',
    sv: { name: 'RFID, NFC och passerkontroll',
          blurb: 'Kort, brickor och telefoner som öppnar saker. Billigt, tillförlitligt och omedelbart begripligt - och en bra påminnelse om att bekvämt och säkert inte är samma sak.',
          learn: 'RC522, PN532, SPI, NDEF, kortnummer kontra data på taggen.' },
    name: 'RFID, NFC & Access',
    blurb: 'Tap a card, open a thing. Door locks, attendance loggers, cabinet latches, tool cribs and the surprisingly deep question of what "secure" means when the tag costs 20 cents.',
    learn: 'SPI, MIFARE sectors, UID vs stored data, solenoid drive, EEPROM, relay isolation.',
    icon: '<rect x="2.5" y="5" width="13" height="14" rx="2"/><path d="M17.5 8.2a5.5 5.5 0 0 1 0 7.6M20 6a9 9 0 0 1 0 12"/><circle cx="9" cy="12" r="2.2"/>'
  },
  {
    slug: 'environment',
    sv: { name: 'Väder och miljö',
          blurb: 'Mät luften, marken, regnet och ljudet. Projekt som ger dig siffror om din egen plats i stället för en prognos för närmaste stad.',
          learn: 'I2C-sensorer, kalibrering, loggning, daggpunkt, A-vägning, avbrottsdrivna räknare.' },
    name: 'Weather & Environment',
    blurb: 'Measure the world and write it down. Temperature, humidity, pressure, particulates, CO2, soil moisture, rainfall - then chart a year of it and find out that your house is damper than you thought.',
    learn: 'I2C, sensor calibration, data logging, CSV, dashboards, long-term drift.',
    icon: '<path d="M12 3.5c-2.4 3.4-4.5 6.2-4.5 8.7a4.5 4.5 0 1 0 9 0c0-2.5-2.1-5.3-4.5-8.7z"/><path d="M9.8 12.8a2.4 2.4 0 0 0 2.4 2.4"/>'
  },
  {
    slug: 'robotics',
    sv: { name: 'Robotar och rörelse',
          blurb: 'Saker som rör sig av egen kraft. Motorer, drivsteg, återkoppling och den obekväma insikten att mekanik är svårare än elektronik.',
          learn: 'H-bryggor, PWM, servon, steg­motorer, givare, PID.' },
    name: 'Robots & Motion',
    blurb: 'Anything that moves under its own power: line followers, obstacle avoiders, robot arms, camera sliders, plant waterers, pan-tilt heads and the endless business of stopping motors browning out your board.',
    learn: 'PWM, H-bridges, servos, steppers, PID, separate motor supplies, kinematics.',
    icon: '<rect x="4.5" y="8" width="15" height="10" rx="2.5"/><path d="M12 8V4.5M9.5 4.5h5"/><circle cx="9" cy="13" r="1.4"/><circle cx="15" cy="13" r="1.4"/><path d="M2.5 12v3M21.5 12v3"/>'
  },
  {
    slug: 'drones',
    sv: { name: 'Drönare och radiostyrning',
          blurb: 'Borstlösa motorer, ESC:er och styrsystem. Den snabbaste och mest oförlåtande delen av hobbyn, och den där säkerhetsavsnitten är skrivna på allvar.',
          learn: 'Borstlös styrning, ESC-protokoll, SBUS och CRSF, PID, komplementärfilter, litiumsäkerhet.' },
    name: 'Drones & Radio Control',
    blurb: 'Brushless motors, electronic speed controllers and things that move fast enough to hurt. Thrust benches, rovers, gimbals, boats and - at the top - a flight controller you wrote yourself. The theme where the safety sections are not padding.',
    learn: 'BLDC motors and ESCs, PWM and DShot, SBUS and CRSF, PID stabilisation, LiPo handling, failsafes and the law.',
    icon: '<circle cx="12" cy="12" r="2.4"/><path d="M13.7 10.3 16.6 7.4M10.3 10.3 7.4 7.4M13.7 13.7l2.9 2.9M10.3 13.7l-2.9 2.9"/><circle cx="5.6" cy="5.6" r="2.3"/><circle cx="18.4" cy="5.6" r="2.3"/><circle cx="5.6" cy="18.4" r="2.3"/><circle cx="18.4" cy="18.4" r="2.3"/>'
  },
  {
    slug: 'display',
    sv: { name: 'Skärmar och klockor',
          blurb: 'Sätt siffror, ord och bilder på väggen. Från en OLED på ett par centimeter till mekaniska fallbladsskyltar och nixierör.',
          learn: 'SPI- och I2C-skärmar, NTP, tidszoner, multiplexering, gammakorrigering.' },
    name: 'Displays & Clocks',
    blurb: 'Screens that show something worth looking at. Word clocks, weather panels, retro segment displays, e-paper dashboards, tiny OLED status widgets and the classic Nixie-adjacent nonsense.',
    learn: 'I2C and SPI displays, fonts, bitmaps, RTCs, NTP time, partial refresh, framebuffers.',
    icon: '<rect x="2.5" y="4.5" width="19" height="13" rx="2"/><path d="M8 21h8M12 17.5V21"/><path d="M6.5 9h5M6.5 12.5h8"/>'
  },
  {
    slug: 'audio',
    sv: { name: 'Ljud och musik',
          blurb: 'Gör ljud, mät ljud, och skicka ljud över nätverket. Området där latens och buffring plötsligt betyder något.',
          learn: 'I2S, FFT, MP3-avkodning, MIDI, RMS och A-vägning.' },
    name: 'Sound & Music',
    blurb: 'Buzzers that play melodies, MP3 modules, theremins, drum machines, sound-reactive lighting and microphones that turn a room into a spectrum analyser.',
    learn: 'tone(), PWM audio, DFPlayer serial, I2S microphones, FFT, sampling rates.',
    icon: '<path d="M4 15V9h3.5L13 4.5v15L7.5 15z"/><path d="M16.5 9.2a4 4 0 0 1 0 5.6M19 6.7a7.5 7.5 0 0 1 0 10.6"/>'
  },
  {
    slug: 'light',
    sv: { name: 'Lysdioder och wearables',
          blurb: 'Adresserbara lysdioder, diffusorer och saker som lyser vackert. Lätt att börja med och förvånansvärt svårt att få att se bra ut.',
          learn: 'WS2812, strömbudget, gammakorrigering, färgtemperatur, litiumladdning.' },
    name: 'LEDs & Wearables',
    blurb: 'Addressable strips, matrices, infinity mirrors, bike lights, costume props and anything else where the answer to "how many LEDs" is "more". Also where you learn why power injection exists.',
    learn: 'WS2812B timing, FastLED, HSV colour, power budgeting, level shifting, LiPo safety.',
    icon: '<path d="M9 17.5h6M10 20.5h4"/><path d="M12 3.2a5.8 5.8 0 0 0-3.4 10.5c.5.4.9 1 .9 1.6v.2h5v-.2c0-.6.4-1.2.9-1.6A5.8 5.8 0 0 0 12 3.2z"/>'
  },
  {
    slug: 'games',
    sv: { name: 'Spel och leksaker',
          blurb: 'Små spel på små skärmar. Perfekta andra projekt: roliga, snabba att bygga och fulla av riktig programmering.',
          learn: 'Tillståndsmaskiner, millis(), avstudsning, slumptal, enkel fysik.' },
    name: 'Games & Toys',
    blurb: 'Handheld consoles on an OLED, reaction-time testers, Simon clones, dice, slot machines, laser tag and arcade cabinets small enough to sit on a shelf.',
    learn: 'Game loops, debouncing, state machines, sprites, random seeds, score storage.',
    icon: '<rect x="2.5" y="7" width="19" height="10" rx="4"/><path d="M7 10.5v3M5.5 12h3"/><circle cx="16" cy="11" r="1"/><circle cx="18.3" cy="13.2" r="1"/>'
  },
  {
    slug: 'radio',
    sv: { name: 'Radio och lång räckvidd',
          blurb: 'Kommunicera utan wifi och utan mobilnät. LoRa, nRF24 och 433 MHz - kilometer i stället för meter.',
          learn: 'LoRa, spridningsfaktorer, länkbudget, sändningscykler, antenner.' },
    name: 'Radio & Long Range',
    blurb: 'Getting data from here to there with no wire, no Wi-Fi and no monthly bill. Two dollars of 2.4 GHz across a house, LoRa across a valley, GPS from orbit, and an honest account of what "10 km range" means on a box.',
    learn: 'LoRa and spread spectrum, link budgets, antennas and SWR, GPS fixes and HDOP, duty cycle law, deep sleep.',
    icon: '<circle cx="12" cy="8.2" r="1.5"/><path d="M9.4 10.8a3.7 3.7 0 0 1 0-5.2M14.6 5.6a3.7 3.7 0 0 1 0 5.2"/><path d="M6.9 13.3a7.2 7.2 0 0 1 0-10.2M17.1 3.1a7.2 7.2 0 0 1 0 10.2"/><path d="M12 9.7V21M9.2 21h5.6"/>'
  },
  {
    slug: 'cellular',
    sv: { name: 'Mobilnät: LTE, NB-IoT och 5G',
          blurb: 'Saker som rapporterar hem från platser utan wifi. Fält, båtar, fordon och allt annat som ligger utanför räckhåll.',
          learn: 'AT-kommandon, APN, PSM och eDRX, NB-IoT kontra LTE-M, strömbudget.' },
    name: 'Cellular: LTE, NB-IoT & 5G',
    blurb: 'The radio that works everywhere, because someone else already built the towers. A sensor in a field that needs no base station of yours, an alarm that texts you from another country, and - at the top end - a 5G module moving more data than your home broadband.',
    learn: 'AT commands, LTE-M and NB-IoT, PSM and eDRX, IoT SIMs and data plans, antennas and MIMO, the 2G sunset.',
    icon: '<rect x="3" y="14" width="3.4" height="6.5" rx="0.8"/><rect x="8.2" y="10.5" width="3.4" height="10" rx="0.8"/><rect x="13.4" y="7" width="3.4" height="13.5" rx="0.8"/><rect x="18.6" y="3.5" width="3.4" height="17" rx="0.8"/>'
  },
  {
    slug: 'ai',
    sv: { name: 'AI och maskininlärning i kanten',
          blurb: 'Modeller som körs på själva kortet i stället för i molnet. Från TinyML på en mikrokontroller till en språkmodell på en Jetson.',
          learn: 'TinyML, kvantisering, transfer learning, objektdetektering, domänskifte.' },
    name: 'AI & Edge Machine Learning',
    blurb: 'Where a microcontroller stops being enough. Gesture recognition in 20 kB on a board you already own, then camera boards that run real models locally - no cloud, no subscription, nothing leaving the room.',
    learn: 'TinyML, quantisation, Edge Impulse, NPUs and TOPS, cameras on Linux, the MCU-plus-CPU split.',
    icon: '<rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/><circle cx="12" cy="12" r="2.2"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>'
  },
  {
    slug: 'kitchen',
    sv: { name: 'Kök och mat',
          blurb: 'Matlagning är processreglering med en deadline. Hålla vatten på 54,5 grader i två timmar, väga en espresso på tiondels gram, se en deg jäsa över natten.',
          learn: 'PID-reglering, termisk tröghet, livsmedelsgodkända givare, lastceller, nätspänning, kalibrering.' },
    name: 'Kitchen & Food',
    blurb: 'Cooking is process control with a deadline. Holding water at 54.5 degrees for two hours, weighing a shot of espresso to a tenth of a gram, watching a dough rise overnight - all of it is the same PID loops and load cells as the rest of this book, pointed at dinner.',
    learn: 'PID control, thermal lag, food-safe probes, load cells and drift, mains switching, calibration.',
    icon: '<path d="M6 3v7a3 3 0 0 0 6 0V3"/><path d="M9 10v11"/><path d="M17 3c-1.5 2-2 4-2 6s.5 3 2 3 2-1 2-3-.5-4-2-6z"/><path d="M17 12v9"/>'
  },
  {
    slug: 'printing',
    sv: { name: '3D-utskrift och kapslingar',
          blurb: 'Där elektronik möter en skrivare. Kapslingar som faktiskt passar, fästen, fixturer - och elektronik som gör utskrifterna bättre och säkrare.',
          learn: 'Toleranser, materialval mot temperatur, gängbussningar, ventilation, tätning, brandsäkerhet.' },
    name: '3D Printing & Enclosures',
    blurb: 'Where electronics meets a printer. Cases that actually fit the board, mounts, fixtures and jigs - and electronics that make the printing better and safer. Most projects on this site end up needing a printed part eventually.',
    learn: 'Tolerances, choosing material by temperature, heat-set inserts, airflow, sealing, printer fire safety.',
    icon: '<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M9 20v-5h6v5"/><path d="M12 4v3"/>'
  },
  {
    slug: 'power',
    sv: { name: 'Ström, energi och mätning',
          blurb: 'Mät vad saker drar, ladda saker säkert, och få reda på var elen tar vägen. Mindre glamoröst än resten och mer använt.',
          learn: 'Strömmätning, litiumladdning, solceller, effektbudget, mätning.' },
    name: 'Power, Energy & Measurement',
    blurb: 'Battery monitors, solar loggers, mains energy meters, bench supplies and the deep-sleep tricks that turn a three-day battery life into a nine-month one.',
    learn: 'INA219, ACS712, deep sleep, buck converters, LiPo charging, coulomb counting.',
    icon: '<path d="M3.5 8.5h13v7h-13z"/><path d="M16.5 11h2.2v2h-2.2"/><path d="M20.5 9.5v5"/><path d="M9.8 9.6 7.3 12.4h2.9l-.6 2.2 2.6-3h-2.9z" fill="currentColor" stroke="none"/>'
  }
];

AB.catIndex = AB.categories.reduce(function (m, c) { m[c.slug] = c; return m; }, {});

/* Difficulty is a 1-4 scale used for the chips and the filter. */
AB.levels = [
  { n: 1, name: 'Beginner', sv: { name: 'Nybörjare', hint: 'Ingen lödning. Kopplingsdäck och byglar. Första veckans grejer.' },     hint: 'No soldering needed. Breadboard and jumper wires. First-week stuff.' },
  { n: 2, name: 'Easy', sv: { name: 'Lätt', hint: 'Lite lödning av stiftlister, en handfull moduler, ett bibliotek eller två.' },         hint: 'Some soldering of headers, a handful of modules, a library or two.' },
  { n: 3, name: 'Intermediate', sv: { name: 'Medel', hint: 'Riktig lödning, strömplanering, flera bibliotek, en dags arbete.' }, hint: 'Real soldering, power planning, several libraries, a day of work.' },
  { n: 4, name: 'Advanced', sv: { name: 'Avancerad', hint: 'Nätspänning, litium, egna kort eller pilligt felsökande. Vet vad du gör.' },     hint: 'Mains voltage, LiPo, custom boards or fiddly debugging. Know what you are doing.' },
  /* Level 5 is not "level 4 but longer". It is the point where the
     electronics stop being the hard part and control theory, machining
     tolerance or weeks of tuning take over. */
  { n: 5, name: 'Expert', sv: { name: 'Expert', hint: 'Reglerteknik, mekanisk tolerans och veckor av itererande. Räkna med att det inte fungerar på länge.' },       hint: 'Control theory, machining tolerance and weeks of iteration. Expect it not to work for a long time.' }
];
