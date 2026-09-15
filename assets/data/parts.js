/* ==========================================================================
   parts.js - the shop.
   Every bill of materials on this site is built from this one list, so a
   price correction here fixes it on every project page at once.

   price  = the figure used in every "price breakdown" table (USD)
   lo/hi  = the honest street range you will actually see in 2026
   buy    = which supplier links to offer, in order of preference
   q      = the search string those links use
   ========================================================================== */
window.AB = window.AB || {};

AB.suppliers = {
  /* --- international ---------------------------------------------------- */
  adafruit:  { name: 'Adafruit',   url: 'https://www.adafruit.com/?q=',                       kind: 'Western, documented, fair' },
  sparkfun:  { name: 'SparkFun',   url: 'https://www.sparkfun.com/search/results?term=',      kind: 'Western, documented, fair' },
  pimoroni:  { name: 'Pimoroni',   url: 'https://shop.pimoroni.com/search?q=',                kind: 'UK/EU shipping' },
  digikey:   { name: 'DigiKey',    url: 'https://www.digikey.com/en/products/result?keywords=', kind: 'Real datasheets, real parts' },
  mouser:    { name: 'Mouser',     url: 'https://www.mouser.com/c/?q=',                       kind: 'Real datasheets, real parts' },
  amazon:    { name: 'Amazon',     url: 'https://www.amazon.com/s?k=',                        kind: 'Fast, mixed quality' },
  ali:       { name: 'AliExpress', url: 'https://www.aliexpress.com/wholesale?SearchText=',   kind: 'Cheapest, 2-5 week wait' },

  /* --- Sweden -----------------------------------------------------------
     Search URLs verified against each site rather than guessed - several
     of the obvious-looking ones (electrokit.com/en/search, elfa.se) are
     404s or redirects. */
  electrokit: { name: 'Electrokit', url: 'https://www.electrokit.com/search.php?keyword=',    kind: 'Swedish hobby shop, stocks almost everything here' },
  kjell:      { name: 'Kjell & Co', url: 'https://www.kjell.com/se/sok?query=',               kind: 'Swedish high street, collect the same day' },
  rsse:       { name: 'RS Sverige', url: 'https://se.rs-online.com/web/c/?searchTerm=',       kind: 'Swedish distributor, real datasheets' },
  amazonse:   { name: 'Amazon.se',  url: 'https://www.amazon.se/s?k=',                        kind: 'Fast, mixed quality' }
};

/* Where the reader is buying from. `extra` suppliers are offered on every
   part in addition to its own list; `swap` replaces an international
   supplier with its local arm. Stored in localStorage, so it is chosen
   once and then forgotten about. */
AB.regions = {
  intl: {
    name: 'International',
    extra: [],
    swap: {}
  },
  se: {
    name: 'Sweden',
    extra: ['electrokit', 'kjell'],
    swap: { amazon: 'amazonse', digikey: 'rsse', mouser: 'rsse' },
    note: 'Electrokit in Malmö carries almost every part in this book. Prices include ' +
          '25 % moms and run roughly two to three times the AliExpress figures below - ' +
          'you are paying for next-day delivery, a real returns policy and the part being ' +
          'what the listing says.'
  }
};

/* Exchange rate used for the secondary currency column. Edit in one place. */
AB.fx = { eur: 0.92, gbp: 0.79, sek: 10.4 };

AB.parts = [

/* --- boards ------------------------------------------------------------- */
{ id:'uno',        name:'Arduino Uno R3 (or a clone)',      cat:'Board',  price:9.00,  lo:4,   hi:28,  unit:'each', q:'Arduino Uno R3',            buy:['ali','amazon','adafruit'],
  note:'The official board is ~$28; a CH340 clone is ~$5 and behaves identically once you install the CH340 driver. Start with a clone, buy official if you want to support the project.' },
{ id:'nano',       name:'Arduino Nano (ATmega328P)',        cat:'Board',  price:4.00,  lo:2.5, hi:24,  unit:'each', q:'Arduino Nano ATmega328P',   buy:['ali','amazon','adafruit'],
  note:'Same chip as the Uno in a breadboard-friendly package. Clones usually ship with the pin headers loose in the bag - you solder them yourself. That is the perfect first soldering job.' },
{ id:'nano-every', name:'Arduino Nano Every',               cat:'Board',  price:13.00, lo:11,  hi:18,  unit:'each', q:'Arduino Nano Every',        buy:['adafruit','digikey','amazon'] },
{ id:'mega',       name:'Arduino Mega 2560 R3',             cat:'Board',  price:15.00, lo:11,  hi:48,  unit:'each', q:'Arduino Mega 2560',         buy:['ali','amazon','adafruit'],
  note:'Buy this only when you run out of pins or RAM. 54 digital pins, 16 analog, 8 KB SRAM.' },
{ id:'esp32',      name:'ESP32 DevKit V1 (30-pin)',         cat:'Board',  price:5.00,  lo:3,   hi:12,  unit:'each', q:'ESP32 DevKit V1 30 pin',    buy:['ali','amazon','adafruit'],
  note:'Wi-Fi and Bluetooth built in, 240 MHz, programmed from the same Arduino IDE. For anything that talks to a network this is the sensible default.' },
{ id:'esp32cam',   name:'ESP32-CAM with OV2640 camera',     cat:'Board',  price:7.00,  lo:5,   hi:14,  unit:'each', q:'ESP32-CAM OV2640',          buy:['ali','amazon'],
  note:'Get the version that comes bundled with the MB programmer shield - it saves you the FTDI wiring dance entirely and costs about $2 more.' },
{ id:'esp8266',    name:'Wemos D1 Mini (ESP8266)',          cat:'Board',  price:3.00,  lo:2,   hi:8,   unit:'each', q:'Wemos D1 Mini ESP8266',     buy:['ali','amazon'] },
{ id:'pico',       name:'Raspberry Pi Pico 2 W',            cat:'Board',  price:7.00,  lo:6,   hi:10,  unit:'each', q:'Raspberry Pi Pico 2 W',     buy:['adafruit','pimoroni','sparkfun'] },
{ id:'pro-micro',  name:'Pro Micro (ATmega32U4, 5V/16MHz)', cat:'Board',  price:5.00,  lo:3,   hi:22,  unit:'each', q:'Pro Micro ATmega32U4 5V',   buy:['ali','sparkfun','amazon'],
  note:'The 32U4 can pretend to be a USB keyboard or mouse. That is the whole reason to pick it over a Nano.' },

/* --- prototyping -------------------------------------------------------- */
{ id:'bb-830',     name:'Solderless breadboard, 830 points',cat:'Proto',  price:3.00,  lo:1.5, hi:7,   unit:'each', q:'830 point solderless breadboard', buy:['ali','amazon','adafruit'] },
{ id:'bb-400',     name:'Solderless breadboard, 400 points',cat:'Proto',  price:2.00,  lo:1,   hi:5,   unit:'each', q:'400 point breadboard',      buy:['ali','amazon','adafruit'] },
{ id:'jumpers',    name:'Jumper wire set (M-M, M-F, F-F)',  cat:'Proto',  price:5.00,  lo:3,   hi:12,  unit:'120 pcs', q:'jumper wires male female dupont', buy:['ali','amazon','adafruit'],
  note:'Buy 120 of them once and never think about it again. The 20 cm length is the useful one.' },
{ id:'perfboard',  name:'Perfboard / stripboard, 5x7 cm',   cat:'Proto',  price:0.60,  lo:0.3, hi:2,   unit:'each', q:'perfboard 5x7cm prototype pcb', buy:['ali','amazon'] },
{ id:'headers',    name:'Male pin header strip, 2.54 mm',   cat:'Proto',  price:0.15,  lo:0.1, hi:0.6, unit:'40-pin strip', q:'2.54mm male pin header 40 pin', buy:['ali','amazon','adafruit'] },
{ id:'headers-f',  name:'Female header strip, 2.54 mm',     cat:'Proto',  price:0.35,  lo:0.2, hi:1,   unit:'40-pin strip', q:'2.54mm female pin header', buy:['ali','amazon','adafruit'] },
{ id:'screwterm',  name:'Screw terminal block, 2-pin 5 mm', cat:'Proto',  price:0.25,  lo:0.1, hi:0.8, unit:'each', q:'5mm 2 pin screw terminal block', buy:['ali','amazon'] },
{ id:'dupont-kit', name:'Dupont crimp connector kit + tool',cat:'Proto',  price:22.00, lo:15,  hi:40,  unit:'kit',  q:'dupont crimp tool kit SN-28B', buy:['amazon','ali'],
  note:'Not needed to start. Once you build a third project you will want to make your own exact-length cables, and this is what does it.' },

/* --- sensors ------------------------------------------------------------ */
{ id:'dht22',      name:'DHT22 / AM2302 temp + humidity',   cat:'Sensor', price:3.50,  lo:2,   hi:10,  unit:'each', q:'DHT22 AM2302',              buy:['ali','amazon','adafruit'],
  note:'Get the version on a small breakout board - it has the 10k pull-up resistor already fitted.' },
{ id:'dht11',      name:'DHT11 temp + humidity (cheaper)',  cat:'Sensor', price:1.20,  lo:0.6, hi:4,   unit:'each', q:'DHT11 module',              buy:['ali','amazon'],
  note:'Half the price, half the accuracy, and it cannot read below 0 C. Fine for a first test, not for real data.' },
{ id:'bme280',     name:'BME280 pressure/temp/humidity',    cat:'Sensor', price:4.00,  lo:2.5, hi:16,  unit:'each', q:'BME280 breakout I2C',       buy:['ali','adafruit','amazon'],
  note:'Watch out: cheap listings often ship a BMP280 (no humidity) in a BME280 photo. If the price is under $2 assume it is a BMP280.' },
{ id:'ds18b20',    name:'DS18B20 waterproof temp probe',    cat:'Sensor', price:2.50,  lo:1.2, hi:8,   unit:'each', q:'DS18B20 waterproof probe',  buy:['ali','amazon','adafruit'] },
{ id:'hcsr04',     name:'HC-SR04 ultrasonic distance',      cat:'Sensor', price:1.50,  lo:0.8, hi:5,   unit:'each', q:'HC-SR04 ultrasonic sensor', buy:['ali','amazon','sparkfun'] },
{ id:'pir',        name:'HC-SR501 PIR motion sensor',       cat:'Sensor', price:1.50,  lo:0.8, hi:6,   unit:'each', q:'HC-SR501 PIR motion sensor',buy:['ali','amazon','adafruit'] },
{ id:'ldr',        name:'LDR photoresistor (GL5528)',       cat:'Sensor', price:0.10,  lo:0.05,hi:0.5, unit:'each', q:'GL5528 photoresistor LDR',  buy:['ali','amazon'] },
{ id:'soil',       name:'Capacitive soil moisture sensor',  cat:'Sensor', price:2.00,  lo:1,   hi:6,   unit:'each', q:'capacitive soil moisture sensor v2', buy:['ali','amazon'],
  note:'Capacitive, never resistive. The resistive ones corrode into uselessness within a month of being in wet soil.' },
{ id:'mq2',        name:'MQ-2 gas / smoke sensor',          cat:'Sensor', price:1.80,  lo:1,   hi:6,   unit:'each', q:'MQ-2 gas sensor module',    buy:['ali','amazon'] },
{ id:'mq135',      name:'MQ-135 air quality sensor',        cat:'Sensor', price:2.00,  lo:1,   hi:6,   unit:'each', q:'MQ-135 air quality sensor', buy:['ali','amazon'] },
{ id:'pms5003',    name:'PMS5003 particulate matter sensor',cat:'Sensor', price:18.00, lo:12,  hi:45,  unit:'each', q:'PMS5003 particulate sensor',buy:['ali','adafruit','amazon'] },
{ id:'mpu6050',    name:'MPU-6050 accelerometer + gyro',    cat:'Sensor', price:1.80,  lo:1,   hi:12,  unit:'each', q:'MPU6050 module',            buy:['ali','amazon','adafruit'] },
{ id:'hall',       name:'A3144 hall effect switch',         cat:'Sensor', price:0.15,  lo:0.05,hi:0.6, unit:'each', q:'A3144 hall effect sensor',  buy:['ali','amazon'] },
{ id:'reed',       name:'Reed switch + magnet pair',        cat:'Sensor', price:0.60,  lo:0.3, hi:3,   unit:'each', q:'reed switch door sensor magnet', buy:['ali','amazon'] },
{ id:'flame',      name:'IR flame sensor module',           cat:'Sensor', price:0.80,  lo:0.4, hi:3,   unit:'each', q:'IR flame sensor module',    buy:['ali','amazon'] },
{ id:'water',      name:'Water leak / rain detection board',cat:'Sensor', price:0.70,  lo:0.3, hi:3,   unit:'each', q:'water level leak sensor module', buy:['ali','amazon'] },
{ id:'acs712',     name:'ACS712 current sensor, 20 A',      cat:'Sensor', price:2.00,  lo:1,   hi:8,   unit:'each', q:'ACS712 20A current sensor', buy:['ali','amazon'] },
{ id:'ina219',     name:'INA219 current + power monitor',   cat:'Sensor', price:2.50,  lo:1.5, hi:11,  unit:'each', q:'INA219 current sensor I2C',buy:['ali','adafruit','amazon'] },
{ id:'loadcell',   name:'Load cell 5 kg + HX711 amplifier', cat:'Sensor', price:4.50,  lo:3,   hi:14,  unit:'set',  q:'5kg load cell HX711',       buy:['ali','amazon','sparkfun'] },
{ id:'fingerprint',name:'R307 / AS608 fingerprint reader',  cat:'Sensor', price:11.00, lo:8,   hi:50,  unit:'each', q:'R307 fingerprint sensor',   buy:['ali','amazon','adafruit'] },
{ id:'irrecv',     name:'VS1838B IR receiver + remote',     cat:'Sensor', price:1.00,  lo:0.5, hi:4,   unit:'set',  q:'VS1838B IR receiver remote kit', buy:['ali','amazon'] },
{ id:'rotary',     name:'KY-040 rotary encoder',            cat:'Sensor', price:0.80,  lo:0.4, hi:4,   unit:'each', q:'KY-040 rotary encoder module', buy:['ali','amazon','adafruit'] },
{ id:'joystick',   name:'Analog thumb joystick module',     cat:'Sensor', price:1.20,  lo:0.6, hi:5,   unit:'each', q:'arduino analog joystick module', buy:['ali','amazon','sparkfun'] },
{ id:'tcs34725',   name:'TCS34725 RGB colour sensor',       cat:'Sensor', price:4.00,  lo:2.5, hi:9,   unit:'each', q:'TCS34725 color sensor',     buy:['ali','adafruit','amazon'] },
{ id:'vl53l0x',    name:'VL53L0X laser time-of-flight range',cat:'Sensor',price:3.00,  lo:2,   hi:15,  unit:'each', q:'VL53L0X time of flight sensor', buy:['ali','adafruit','amazon'] },

/* --- rfid / id ---------------------------------------------------------- */
{ id:'rc522',      name:'RC522 RFID reader + card + fob',   cat:'RFID',   price:2.00,  lo:1,   hi:7,   unit:'kit',  q:'RC522 RFID module kit',     buy:['ali','amazon'],
  note:'13.56 MHz MIFARE. The kit includes one white card and one blue keyfob. Note the module is 3.3 V only - never feed it 5 V.' },
{ id:'pn532',      name:'PN532 NFC reader (does phones too)',cat:'RFID',  price:7.00,  lo:5,   hi:40,  unit:'each', q:'PN532 NFC module',          buy:['ali','adafruit','amazon'] },
{ id:'rfid-tags',  name:'MIFARE Classic 1K cards, blank',   cat:'RFID',   price:0.25,  lo:0.1, hi:1,   unit:'each', q:'MIFARE Classic 1K blank card', buy:['ali','amazon'] },
{ id:'rfid-125',   name:'RDM6300 125 kHz reader + tags',    cat:'RFID',   price:3.00,  lo:2,   hi:9,   unit:'kit',  q:'RDM6300 125khz RFID reader',buy:['ali','amazon'] },

/* --- displays ----------------------------------------------------------- */
{ id:'oled13',     name:'SSD1306 OLED 128x64, 0.96 in I2C',  cat:'Display',price:2.50, lo:1.5, hi:14,  unit:'each', q:'0.96 inch OLED SSD1306 I2C',buy:['ali','amazon','adafruit'] },
{ id:'oled13b',    name:'SH1106 OLED 128x64, 1.3 in I2C',    cat:'Display',price:3.50, lo:2,   hi:12,  unit:'each', q:'1.3 inch OLED SH1106 I2C',  buy:['ali','amazon'],
  note:'Physically bigger than the 0.96 in, and it uses the SH1106 driver, not SSD1306. Wrong driver in your code shows a 2-pixel horizontal offset.' },
{ id:'lcd1602',    name:'16x2 LCD with I2C backpack',        cat:'Display',price:2.50, lo:1.5, hi:9,   unit:'each', q:'1602 LCD I2C module',       buy:['ali','amazon'],
  note:'Always buy the version with the I2C backpack soldered on. The bare 16-pin one eats six Arduino pins for nothing.' },
{ id:'lcd2004',    name:'20x4 LCD with I2C backpack',        cat:'Display',price:4.50, lo:3,   hi:14,  unit:'each', q:'2004 LCD I2C module',       buy:['ali','amazon'] },
{ id:'tft18',      name:'ST7735 TFT colour LCD, 1.8 in',     cat:'Display',price:4.00, lo:2.5, hi:16,  unit:'each', q:'1.8 inch ST7735 TFT SPI',   buy:['ali','amazon','adafruit'] },
{ id:'tft28',      name:'ILI9341 TFT touch LCD, 2.8 in',     cat:'Display',price:9.00, lo:6,   hi:30,  unit:'each', q:'2.8 inch ILI9341 TFT touch SPI', buy:['ali','amazon','adafruit'] },
{ id:'tm1637',     name:'TM1637 4-digit 7-segment display',  cat:'Display',price:1.20, lo:0.6, hi:6,   unit:'each', q:'TM1637 4 digit display',    buy:['ali','amazon'] },
{ id:'max7219',    name:'MAX7219 8x8 LED matrix, 4-in-1',    cat:'Display',price:3.50, lo:2,   hi:12,  unit:'each', q:'MAX7219 4 in 1 dot matrix', buy:['ali','amazon'] },
{ id:'epaper',     name:'2.9 in e-paper display module',     cat:'Display',price:16.00,lo:11,  hi:40,  unit:'each', q:'2.9 inch e-paper module SPI', buy:['ali','pimoroni','adafruit'] },

/* --- light -------------------------------------------------------------- */
{ id:'led5',       name:'5 mm LED assortment',               cat:'Light',  price:0.05, lo:0.02,hi:0.2, unit:'each', q:'5mm LED assortment kit',    buy:['ali','amazon'] },
{ id:'rgbled',     name:'5 mm RGB LED, common cathode',      cat:'Light',  price:0.15, lo:0.06,hi:0.6, unit:'each', q:'5mm RGB LED common cathode',buy:['ali','amazon'] },
{ id:'ws2812-strip',name:'WS2812B addressable strip, 1 m 60 LED',cat:'Light',price:7.00,lo:4, hi:22,  unit:'metre',q:'WS2812B 60 LED per meter',  buy:['ali','amazon','adafruit'],
  note:'Sold as IP30 (bare), IP65 (sleeved) or IP67 (filled). Outdoors needs IP67. Also check 5 V vs 12 V - the 5 V one is what these projects use.' },
{ id:'ws2812-ring',name:'WS2812B ring, 16 LED',              cat:'Light',  price:3.00, lo:1.5, hi:12,  unit:'each', q:'WS2812B 16 LED ring',       buy:['ali','amazon','adafruit'] },
{ id:'ws2812-mat', name:'WS2812B matrix, 8x8 flexible',      cat:'Light',  price:7.00, lo:4,   hi:25,  unit:'each', q:'WS2812B 8x8 matrix flexible',buy:['ali','amazon'] },
{ id:'ledstrip12v', name:'Plain 12 V LED strip, 1 m',            cat:'Light',  price:4.00, lo:2,   hi:12,  unit:'metre',q:'12V LED strip 5050 warm white 1m', buy:['ali','amazon'],
  note:'Single colour, not addressable. Check the amps per metre on the listing - 60 LED/m is about 0.5 A per metre.' },
{ id:'led-ir',     name:'IR LED 940 nm',                     cat:'Light',  price:0.10, lo:0.04,hi:0.4, unit:'each', q:'940nm IR LED 5mm',          buy:['ali','amazon'] },

/* --- motion ------------------------------------------------------------- */
{ id:'sg90',       name:'SG90 micro servo, 9 g',             cat:'Motion', price:1.50, lo:1,   hi:6,   unit:'each', q:'SG90 micro servo',          buy:['ali','amazon','adafruit'] },
{ id:'mg996r',     name:'MG996R metal-gear servo',           cat:'Motion', price:4.00, lo:2.5, hi:13,  unit:'each', q:'MG996R servo',              buy:['ali','amazon'] },
{ id:'28byj',      name:'28BYJ-48 stepper + ULN2003 driver', cat:'Motion', price:2.00, lo:1.2, hi:7,   unit:'set',  q:'28BYJ-48 stepper ULN2003',  buy:['ali','amazon'] },
{ id:'nema17',     name:'NEMA 17 stepper motor',             cat:'Motion', price:10.00,lo:7,   hi:22,  unit:'each', q:'NEMA 17 stepper motor',     buy:['ali','amazon'] },
{ id:'a4988',      name:'A4988 stepper driver + heatsink',   cat:'Motion', price:1.50, lo:0.8, hi:6,   unit:'each', q:'A4988 stepper driver',      buy:['ali','amazon'] },
{ id:'l298n',      name:'L298N dual motor driver board',     cat:'Motion', price:2.50, lo:1.5, hi:9,   unit:'each', q:'L298N motor driver module', buy:['ali','amazon'] },
{ id:'tb6612',     name:'TB6612FNG motor driver (efficient)',cat:'Motion', price:2.50, lo:1.5, hi:10,  unit:'each', q:'TB6612FNG motor driver',    buy:['ali','sparkfun','adafruit'],
  note:'Drops about 0.5 V instead of the L298N 2 V. On battery projects that difference is the whole ball game.' },
{ id:'tt-motor',   name:'TT gear motor + wheel',             cat:'Motion', price:2.00, lo:1.2, hi:7,   unit:'each', q:'TT gear motor wheel arduino',buy:['ali','amazon','adafruit'] },
{ id:'car-chassis',name:'2WD robot car chassis kit',         cat:'Motion', price:9.00, lo:6,   hi:25,  unit:'kit',  q:'2WD robot car chassis kit', buy:['ali','amazon'] },
{ id:'pump',       name:'5 V submersible water pump',        cat:'Motion', price:2.00, lo:1.2, hi:8,   unit:'each', q:'5V submersible mini water pump', buy:['ali','amazon'] },
{ id:'sol-lock',   name:'12 V solenoid door lock',           cat:'Motion', price:8.00, lo:5,   hi:22,  unit:'each', q:'12V solenoid electric door lock', buy:['ali','amazon','adafruit'] },
{ id:'scd40',       name:'SCD40 true CO2 sensor (NDIR)',      cat:'Sensor', price:22.00,lo:16,  hi:60,  unit:'each', q:'SCD40 CO2 sensor module I2C', buy:['ali','adafruit','amazon'],
  note:'True NDIR CO2, not a VOC sensor guessing at it. Anything under $10 claiming CO2 is an MQ-135 estimating from other gases - useful for trends, not for ppm.' },
{ id:'powerres',    name:'10 ohm 10 W wirewound resistor',    cat:'Passive',price:1.00, lo:0.5, hi:3,   unit:'each', q:'10 ohm 10W wirewound resistor', buy:['ali','amazon'],
  note:'The dummy load for battery testing. It gets genuinely hot - mount it in free air, on its own, away from everything else.' },
{ id:'wc-face',     name:'Word clock face (laser cut or printed)',cat:'Misc',price:14.00,lo:0,   hi:45,  unit:'each', q:'word clock face acrylic stencil', buy:['amazon','ali'],
  note:'Buy one cut to your language, or print the letters on acetate and back it with black card. The grid dividers between letters matter more than the face does.' },
{ id:'diffuser',    name:'Diffuser sheet / white acrylic',    cat:'Misc',   price:6.00, lo:3,   hi:18,  unit:'sheet',q:'led diffuser sheet white acrylic 3mm', buy:['amazon','ali'] },
{ id:'fan40',            name:'40 mm 5 V fan',                     cat:'Motion', price:2.00, lo:1,   hi:7,   unit:'each', q:'40mm 5V fan',               buy:['ali','amazon'] },

/* --- control / power ---------------------------------------------------- */
{ id:'relay1',     name:'1-channel relay module, opto-isolated',cat:'Power',price:1.50,lo:0.8, hi:6,   unit:'each', q:'1 channel relay module 5V opto', buy:['ali','amazon','adafruit'] },
{ id:'relay4',     name:'4-channel relay module',            cat:'Power',  price:3.50, lo:2,   hi:12,  unit:'each', q:'4 channel relay module 5V', buy:['ali','amazon'] },
{ id:'mosfet',     name:'IRLZ44N logic-level MOSFET',        cat:'Power',  price:0.60, lo:0.3, hi:2.5, unit:'each', q:'IRLZ44N MOSFET',            buy:['ali','digikey','amazon'],
  note:'Logic-level is the important word. A plain IRF540 will not turn on properly from a 5 V pin, and will get hot while half-failing.' },
{ id:'transistor', name:'2N2222 / BC547 NPN transistors',    cat:'Power',  price:0.05, lo:0.02,hi:0.2, unit:'each', q:'2N2222 NPN transistor pack',buy:['ali','amazon','digikey'] },
{ id:'buck',       name:'MP1584 / LM2596 buck converter',    cat:'Power',  price:1.00, lo:0.5, hi:4,   unit:'each', q:'LM2596 buck converter module', buy:['ali','amazon'] },
{ id:'ams1117',    name:'AMS1117 3.3 V regulator board',     cat:'Power',  price:0.50, lo:0.2, hi:2,   unit:'each', q:'AMS1117 3.3V module',       buy:['ali','amazon'] },
{ id:'tp4056',     name:'TP4056 LiPo charger with protection',cat:'Power', price:0.60, lo:0.3, hi:2.5, unit:'each', q:'TP4056 charger module protection', buy:['ali','amazon'],
  note:'Only buy the variant with the protection IC (two extra chips next to the USB port). The unprotected one will happily over-discharge your cell into the bin.' },
{ id:'lipo2000',   name:'2000 mAh LiPo cell, JST-PH',        cat:'Power',  price:8.00, lo:5,   hi:18,  unit:'each', q:'2000mAh lipo battery JST PH', buy:['adafruit','amazon','ali'] },
{ id:'18650',      name:'18650 cell + holder',               cat:'Power',  price:5.00, lo:3,   hi:12,  unit:'set',  q:'18650 battery holder',      buy:['amazon','ali'] },
{ id:'solar6v',     name:'Solar panel, 6 V 1-2 W',            cat:'Power',  price:8.00, lo:4,   hi:20,  unit:'each', q:'6V 2W solar panel epoxy', buy:['ali','amazon','adafruit'],
  note:'6 V, not 5 V - a TP4056 needs headroom above the cell voltage. Epoxy-potted panels survive outdoors; bare cells do not.' },
{ id:'batt-aa2',    name:'2x AA battery holder + cells',      cat:'Power',  price:2.50, lo:1,   hi:6,   unit:'set',  q:'2 AA battery holder switch', buy:['ali','amazon'],
  note:'Two alkaline cells give 3.0 V fresh and about 2.4 V flat - which is exactly the range an ESP8266 will run on directly.' },
{ id:'batt-aa6',    name:'6x AA battery holder + cells',      cat:'Power',  price:5.00, lo:2.5, hi:10,  unit:'set',  q:'6 AA battery holder 9V', buy:['ali','amazon'],
  note:'Six cells give 9 V. Use rechargeable NiMH for anything with motors - alkalines sag badly under a 1 A load.' },
{ id:'psu5v3a',    name:'5 V 3 A USB power supply',          cat:'Power',  price:7.00, lo:5,   hi:16,  unit:'each', q:'5V 3A USB power supply',    buy:['amazon','adafruit','ali'] },
{ id:'psu12v2a',   name:'12 V 2 A barrel-jack supply',       cat:'Power',  price:7.00, lo:5,   hi:16,  unit:'each', q:'12V 2A power supply 5.5mm',buy:['amazon','ali'] },
{ id:'batt9v',     name:'9 V battery + barrel-jack clip',    cat:'Power',  price:2.50, lo:1.5, hi:6,   unit:'set',  q:'9V battery clip barrel jack', buy:['ali','amazon'],
  note:'Fine for a blinking LED, hopeless for motors or Wi-Fi. A 9 V PP3 holds roughly 500 mAh and sags badly under load.' },
{ id:'usb-cable',  name:'USB cable for your board',          cat:'Power',  price:2.00, lo:1,   hi:8,   unit:'each', q:'USB A to B cable arduino',  buy:['amazon','ali'],
  note:'Uno uses USB-B (printer cable). Nano clones use mini-B or USB-C. ESP32 boards use micro-B or USB-C. Check before you order.' },

/* --- passives ----------------------------------------------------------- */
{ id:'res-kit',    name:'Resistor kit, 1/4 W, 600 pcs',      cat:'Passive',price:6.00, lo:4,   hi:14,  unit:'kit',  q:'600 pcs resistor kit 1/4W', buy:['ali','amazon'],
  note:'One purchase covers every project on this site. Buy it on day one.' },
{ id:'res220',     name:'220 ohm resistor',                  cat:'Passive',price:0.02, lo:0.01,hi:0.1, unit:'each', q:'220 ohm resistor 1/4W',     buy:['ali','amazon'] },
{ id:'res1k',      name:'1 k resistor',                      cat:'Passive',price:0.02, lo:0.01,hi:0.1, unit:'each', q:'1k ohm resistor 1/4W',      buy:['ali','amazon'] },
{ id:'res10k',     name:'10 k resistor',                     cat:'Passive',price:0.02, lo:0.01,hi:0.1, unit:'each', q:'10k ohm resistor 1/4W',     buy:['ali','amazon'] },
{ id:'cap-kit',    name:'Capacitor assortment kit',          cat:'Passive',price:7.00, lo:5,   hi:16,  unit:'kit',  q:'electrolytic ceramic capacitor kit', buy:['ali','amazon'] },
{ id:'cap1000',    name:'1000 uF 16 V electrolytic cap',     cat:'Passive',price:0.15, lo:0.05,hi:0.6, unit:'each', q:'1000uF 16V capacitor',      buy:['ali','amazon','digikey'] },
{ id:'cap100n',    name:'100 nF ceramic capacitor',          cat:'Passive',price:0.03, lo:0.01,hi:0.15,unit:'each', q:'100nF ceramic capacitor 0.1uF', buy:['ali','amazon'] },
{ id:'diode',      name:'1N4007 rectifier diode',            cat:'Passive',price:0.03, lo:0.01,hi:0.15,unit:'each', q:'1N4007 diode pack',         buy:['ali','amazon'] },
{ id:'pot10k',     name:'10 k potentiometer',                cat:'Passive',price:0.30, lo:0.1, hi:1.5, unit:'each', q:'10k potentiometer knob',    buy:['ali','amazon'] },
{ id:'button',     name:'6 mm tactile push button',          cat:'Passive',price:0.05, lo:0.02,hi:0.3, unit:'each', q:'6x6mm tactile push button', buy:['ali','amazon'] },
{ id:'switch',     name:'SPDT slide / toggle switch',        cat:'Passive',price:0.30, lo:0.1, hi:1.5, unit:'each', q:'SPDT slide switch',         buy:['ali','amazon'] },
{ id:'buzzer',     name:'Passive piezo buzzer',              cat:'Passive',price:0.30, lo:0.1, hi:1.5, unit:'each', q:'passive piezo buzzer arduino', buy:['ali','amazon'],
  note:'Passive, not active. Active buzzers play one fixed tone and ignore your melody code.' },
{ id:'speaker8',   name:'8 ohm 0.5 W speaker',               cat:'Passive',price:0.80, lo:0.4, hi:3,   unit:'each', q:'8 ohm 0.5W small speaker',  buy:['ali','amazon'] },

/* --- storage / time / radio --------------------------------------------- */
{ id:'ds3231',     name:'DS3231 real-time clock + battery',  cat:'Module', price:1.50, lo:0.8, hi:8,   unit:'each', q:'DS3231 RTC module',         buy:['ali','amazon','adafruit'],
  note:'DS3231, not DS1307. The 3231 is temperature-compensated and drifts about a minute a year; the 1307 drifts that much in a fortnight.' },
{ id:'sdcard',     name:'Micro SD card breakout module',     cat:'Module', price:1.00, lo:0.5, hi:8,   unit:'each', q:'micro sd card module arduino', buy:['ali','amazon','adafruit'] },
{ id:'sdcard-8gb', name:'Micro SD card, 8-32 GB',            cat:'Module', price:6.00, lo:4,   hi:12,  unit:'each', q:'32GB micro sd card',        buy:['amazon','ali'] },
{ id:'nrf24',      name:'nRF24L01+ 2.4 GHz radio pair',      cat:'Module', price:3.00, lo:1.5, hi:9,   unit:'pair', q:'nRF24L01 module pair',      buy:['ali','amazon'],
  note:'Solder a 10 uF cap across its VCC and GND or it will reset at random. This is not optional; it is the single most common nRF24 complaint.' },
{ id:'lora',       name:'SX1276 LoRa module, 868/915 MHz',   cat:'Module', price:7.00, lo:5,   hi:20,  unit:'each', q:'SX1276 LoRa module 868MHz', buy:['ali','adafruit','amazon'] },
{ id:'hc05',       name:'HC-05 Bluetooth serial module',     cat:'Module', price:3.00, lo:2,   hi:10,  unit:'each', q:'HC-05 bluetooth module',    buy:['ali','amazon'] },
{ id:'rtc-cell',   name:'CR2032 coin cell',                  cat:'Module', price:0.50, lo:0.2, hi:2,   unit:'each', q:'CR2032 battery',            buy:['amazon','ali'] },
{ id:'gps',        name:'NEO-6M GPS module + antenna',       cat:'Module', price:7.00, lo:5,   hi:20,  unit:'each', q:'NEO-6M GPS module antenna', buy:['ali','amazon'] },
{ id:'pcf8574',    name:'PCF8574 I2C port expander',         cat:'Module', price:0.80, lo:0.4, hi:4,   unit:'each', q:'PCF8574 I2C expander module', buy:['ali','amazon','adafruit'] },
{ id:'pca9685',    name:'PCA9685 16-channel servo driver',   cat:'Module', price:3.00, lo:2,   hi:16,  unit:'each', q:'PCA9685 16 channel servo driver', buy:['ali','amazon','adafruit'] },
{ id:'mic-max9814',name:'MAX9814 electret mic with AGC',     cat:'Module', price:3.00, lo:2,   hi:9,   unit:'each', q:'MAX9814 microphone module', buy:['ali','adafruit','amazon'] },
{ id:'mic-inmp441',name:'INMP441 I2S digital microphone',    cat:'Module', price:3.00, lo:2,   hi:9,   unit:'each', q:'INMP441 I2S microphone',    buy:['ali','amazon'] },
{ id:'dfplayer',   name:'DFPlayer Mini MP3 module',          cat:'Module', price:2.00, lo:1.2, hi:8,   unit:'each', q:'DFPlayer Mini MP3 module',  buy:['ali','amazon'] },
{ id:'keypad4x4',  name:'4x4 membrane matrix keypad',        cat:'Module', price:1.20, lo:0.6, hi:5,   unit:'each', q:'4x4 membrane keypad arduino', buy:['ali','amazon','adafruit'] },
{ id:'esp01',      name:'ESP-01S Wi-Fi module + adapter',    cat:'Module', price:2.50, lo:1.5, hi:8,   unit:'set',  q:'ESP-01S wifi module adapter', buy:['ali','amazon'] },

{ id:'ftdi',       name:'USB-to-serial adapter (CP2102/FTDI)',cat:'Module',price:2.00,lo:1.2, hi:16,  unit:'each', q:'CP2102 USB to TTL serial adapter', buy:['ali','amazon','adafruit'],
  note:'Get one with a 3.3 V / 5 V selector jumper. It is how you talk to bare ESP modules and rescue boards with a broken bootloader.' },
{ id:'linesensor', name:'3-channel IR line-follow sensor',   cat:'Sensor', price:2.00, lo:1,   hi:7,   unit:'each', q:'TCRT5000 3 channel line tracking sensor', buy:['ali','amazon'] },
{ id:'sct013',     name:'SCT-013-030 clamp current sensor',  cat:'Sensor', price:9.00, lo:6,   hi:22,  unit:'each', q:'SCT-013-030 current transformer clamp', buy:['ali','amazon'],
  note:'Clamps around ONE live conductor without touching it, so nothing you build ever contacts mains. Get the -030 version, which outputs 1 V and needs no burden resistor.' },
{ id:'pam8403',    name:'PAM8403 3 W stereo amplifier',      cat:'Module', price:1.00, lo:0.5, hi:4,   unit:'each', q:'PAM8403 amplifier module', buy:['ali','amazon'] },
{ id:'mirror-kit', name:'One-way mirror film + acrylic sheet',cat:'Misc',  price:12.00,lo:7,   hi:30,  unit:'set',  q:'one way mirror film acrylic sheet', buy:['amazon','ali'] },
{ id:'photoframe', name:'Deep box picture frame, 20 cm',     cat:'Misc',   price:9.00, lo:5,   hi:22,  unit:'each', q:'deep shadow box picture frame 20cm', buy:['amazon'] },
{ id:'pantilt',    name:'Pan-tilt bracket for 2 servos',     cat:'Misc',   price:3.00, lo:1.5, hi:9,   unit:'each', q:'pan tilt bracket SG90', buy:['ali','amazon'] },
{ id:'usb-meter',  name:'USB voltage/current meter',         cat:'Tool',   price:9.00, lo:5,   hi:30,  unit:'each', q:'USB voltage current tester meter', buy:['amazon','ali'],
  note:'The fastest way to find out whether a brownout is really a brownout.' },

/* --- tools -------------------------------------------------------------- */
{ id:'iron',       name:'Temperature-controlled soldering iron',cat:'Tool',price:45.00,lo:25,  hi:140, unit:'each', q:'temperature controlled soldering station', buy:['amazon','ali','adafruit'],
  note:'The single best money you will spend. A fixed-temperature $8 iron is the reason most beginners think they are bad at soldering. Pinecil, TS101, Hakko FX-888D or a Yihua 937D all work.' },
{ id:'solder',     name:'Solder, 0.8 mm rosin-core 60/40',   cat:'Tool',   price:12.00,lo:8,   hi:30,  unit:'100 g', q:'0.8mm rosin core solder 60/40', buy:['amazon','ali','adafruit'],
  note:'Leaded 60/40 melts lower and flows better, which matters enormously when you are learning. Lead-free is the grown-up choice - either way, wash your hands and ventilate.' },
{ id:'sponge',     name:'Brass tip cleaner',                 cat:'Tool',   price:6.00, lo:3,   hi:14,  unit:'each', q:'brass wire soldering tip cleaner', buy:['amazon','ali'] },
{ id:'flux',       name:'Rosin flux pen or paste',           cat:'Tool',   price:8.00, lo:4,   hi:18,  unit:'each', q:'rosin flux pen electronics',buy:['amazon','ali','adafruit'] },
{ id:'wick',       name:'Desoldering braid, 2 mm',           cat:'Tool',   price:5.00, lo:3,   hi:12,  unit:'each', q:'desoldering wick braid 2mm',buy:['amazon','ali'] },
{ id:'sucker',     name:'Solder sucker (desoldering pump)',  cat:'Tool',   price:8.00, lo:4,   hi:20,  unit:'each', q:'solder sucker desoldering pump', buy:['amazon','ali'] },
{ id:'cutters',    name:'Flush cutters',                     cat:'Tool',   price:9.00, lo:5,   hi:25,  unit:'each', q:'flush cutters electronics',buy:['amazon','adafruit','ali'] },
{ id:'strippers',  name:'Wire strippers',                    cat:'Tool',   price:12.00,lo:7,   hi:30,  unit:'each', q:'wire strippers 30-20 awg', buy:['amazon','adafruit','ali'] },
{ id:'dmm',        name:'Digital multimeter with continuity',cat:'Tool',   price:25.00,lo:12,  hi:120, unit:'each', q:'digital multimeter continuity', buy:['amazon','ali'],
  note:'The continuity beeper is the feature you will use most. Everything else is a bonus.' },
{ id:'helping',    name:'Helping hands / PCB vice',          cat:'Tool',   price:14.00,lo:7,   hi:45,  unit:'each', q:'helping hands soldering pcb holder', buy:['amazon','ali','adafruit'] },
{ id:'heatshrink', name:'Heat-shrink tubing assortment',     cat:'Tool',   price:8.00, lo:4,   hi:18,  unit:'kit',  q:'heat shrink tubing assortment kit', buy:['amazon','ali'] },
{ id:'hookup',     name:'Solid-core hookup wire, 22 AWG',    cat:'Tool',   price:12.00,lo:7,   hi:26,  unit:'6 colours', q:'22 awg solid core hookup wire kit', buy:['amazon','adafruit','ali'] },
{ id:'fan-fume',   name:'Fume extractor fan',                cat:'Tool',   price:15.00,lo:8,   hi:60,  unit:'each', q:'solder fume extractor',     buy:['amazon','ali'] },
{ id:'glasses',    name:'Safety glasses',                    cat:'Tool',   price:6.00, lo:3,   hi:16,  unit:'each', q:'safety glasses clear',      buy:['amazon','ali'],
  note:'Clipped component legs travel fast and eyes do not grow back. Wear them while you cut.' },

/* --- enclosure / misc --------------------------------------------------- */
{ id:'box-abs',    name:'ABS project box, 100x68x50 mm',     cat:'Misc',   price:3.00, lo:1.5, hi:9,   unit:'each', q:'ABS project enclosure box 100x68', buy:['ali','amazon'] },
{ id:'box-ip65',   name:'IP65 weatherproof enclosure',       cat:'Misc',   price:7.00, lo:4,   hi:20,  unit:'each', q:'IP65 waterproof junction box', buy:['ali','amazon'] },
{ id:'standoffs',  name:'M3 nylon standoff + screw kit',     cat:'Misc',   price:6.00, lo:3,   hi:14,  unit:'kit',  q:'M3 nylon standoff screw kit',buy:['ali','amazon'] },
{ id:'tape',       name:'Double-sided foam tape',            cat:'Misc',   price:4.00, lo:2,   hi:9,   unit:'roll', q:'double sided foam mounting tape', buy:['amazon','ali'] },
{ id:'zip',        name:'Cable ties, assorted',              cat:'Misc',   price:4.00, lo:2,   hi:9,   unit:'pack', q:'cable ties assorted',       buy:['amazon','ali'] },
{ id:'tripod',     name:'Mini tripod / gooseneck mount',     cat:'Misc',   price:8.00, lo:4,   hi:20,  unit:'each', q:'mini tripod flexible',      buy:['amazon','ali'] },
{ id:'tubing',     name:'6 mm silicone tubing, 2 m',         cat:'Misc',   price:3.00, lo:1.5, hi:8,   unit:'each', q:'6mm silicone tubing',       buy:['ali','amazon'] },
{ id:'magnet',     name:'Neodymium magnets, 6 mm',           cat:'Misc',   price:5.00, lo:3,   hi:12,  unit:'pack', q:'6mm neodymium magnets',     buy:['amazon','ali'] }
];

AB.partIndex = AB.parts.reduce(function (m, p) { m[p.id] = p; return m; }, {});
