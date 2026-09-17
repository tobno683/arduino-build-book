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
  arduino:   { name: 'Arduino Store', url: 'https://store-usa.arduino.cc/search?q=',           kind: 'Official, and the only source for brand-new boards' },

  /* --- Sweden -----------------------------------------------------------
     Search URLs verified against each site rather than guessed - several
     of the obvious-looking ones (electrokit.com/en/search, elfa.se) are
     404s or redirects. */
  electrokit: { name: 'Electrokit', url: 'https://www.electrokit.com/search.php?keyword=',    kind: 'Swedish hobby shop, stocks almost everything here' },
  kjell:      { name: 'Kjell & Co', url: 'https://www.kjell.com/se/sok?q=',                     kind: 'Swedish high street, collect the same day' },
  rsse:       { name: 'RS Sverige', url: 'https://se.rs-online.com/web/c/?searchTerm=',       kind: 'Swedish distributor, real datasheets' },
  amazonse:   { name: 'Amazon.se',  url: 'https://www.amazon.se/s?k=',                        kind: 'Fast, mixed quality' }
};

/* Where the reader is buying from.

   `shops` lists the local shops that are ELIGIBLE in this region. It does
   not offer them: a shop only appears on a part that names it in its own
   `local` map, because it was checked against that shop. This used to be an
   `extra` list that was bolted onto all 212 parts regardless, which put an
   Electrokit link on the Jetson and a Kjell link on every sensor breakout.

   `swap` replaces an international supplier with its local arm. Stored in
   localStorage, so it is chosen once and then forgotten about. */
AB.regions = {
  intl: {
    name: 'International',
    shops: [],
    swap: {}
  },
  se: {
    name: 'Sweden',
    shops: ['electrokit', 'kjell'],
    swap: { amazon: 'amazonse', digikey: 'rsse', mouser: 'rsse' },
    note: 'Electrokit in Malmö stocks about half the parts in this book. Their search was ' +
          'checked part by part, so a shop is offered only on a part it actually has, with a ' +
          'search term that finds the part rather than its accessories - searching their site ' +
          'for "Arduino Uno R3" returns four shields and a clone. Kjell is a high street ' +
          'chain: tools, solder and consumables, not sensor modules. Prices include ' +
          '25 % moms and run roughly two to three times the AliExpress figures below - ' +
          'you are paying for next-day delivery, a real returns policy and the part being ' +
          'what the listing says.'
  }
};

/* Exchange rate used for the secondary currency column. Edit in one place. */
AB.fx = { eur: 0.92, gbp: 0.79, sek: 10.4 };

AB.parts = [

/* --- boards ------------------------------------------------------------- */
{ id:'uno', local:{se:{electrokit:'Arduino UNO'}}, short:'Arduino Uno',        name:'Arduino Uno R3 (or a clone)',      cat:'Board',  price:9.00,  lo:4,   hi:28,  unit:'each', q:'Arduino Uno R3',            buy:['ali','amazon','adafruit'],
  note:'The official board is ~$28; a CH340 clone is ~$5 and behaves identically once you install the CH340 driver. Start with a clone, buy official if you want to support the project.' },
{ id:'nano', local:{se:{electrokit:'Arduino Nano ATmega328P'}}, short:'Arduino Nano',       name:'Arduino Nano (ATmega328P)',        cat:'Board',  price:4.00,  lo:2.5, hi:24,  unit:'each', q:'Arduino Nano ATmega328P',   buy:['ali','amazon','adafruit'],
  note:'Same chip as the Uno in a breadboard-friendly package. Clones usually ship with the pin headers loose in the bag - you solder them yourself. That is the perfect first soldering job.' },
{ id:'nano-every', short:'Arduino Nano Every', name:'Arduino Nano Every',               cat:'Board',  price:13.00, lo:11,  hi:18,  unit:'each', q:'Arduino Nano Every',        buy:['adafruit','digikey','amazon'] },
{ id:'mega', local:{se:{electrokit:'Arduino Mega'}}, short:'Arduino Mega 2560',       name:'Arduino Mega 2560 R3',             cat:'Board',  price:15.00, lo:11,  hi:48,  unit:'each', q:'Arduino Mega 2560',         buy:['ali','amazon','adafruit'],
  note:'Buy this only when you run out of pins or RAM. 54 digital pins, 16 analog, 8 KB SRAM.' },
{ id:'esp32', local:{se:{electrokit:'ESP32'}}, short:'ESP32 DevKit',      name:'ESP32 DevKit V1 (30-pin)',         cat:'Board',  price:5.00,  lo:3,   hi:12,  unit:'each', q:'ESP32 DevKit V1 30 pin',    buy:['ali','amazon','adafruit'],
  note:'Wi-Fi and Bluetooth built in, 240 MHz, programmed from the same Arduino IDE. For anything that talks to a network this is the sensible default.' },
{ id:'esp32cam', short:'ESP32-CAM',   name:'ESP32-CAM with OV2640 camera',     cat:'Board',  price:7.00,  lo:5,   hi:14,  unit:'each', q:'ESP32-CAM OV2640',          buy:['ali','amazon'],
  note:'Get the version that comes bundled with the MB programmer shield - it saves you the FTDI wiring dance entirely and costs about $2 more.' },
{ id:'esp8266', local:{se:{electrokit:'ESP8266'}}, short:'ESP8266 / D1 Mini',    name:'Wemos D1 Mini (ESP8266)',          cat:'Board',  price:3.00,  lo:2,   hi:8,   unit:'each', q:'Wemos D1 Mini ESP8266',     buy:['ali','amazon'] },
{ id:'pico', local:{se:{electrokit:'Raspberry Pi Pico 2 W'}}, short:'Raspberry Pi Pico 2 W',       name:'Raspberry Pi Pico 2 W',            cat:'Board',  price:7.00,  lo:6,   hi:10,  unit:'each', q:'Raspberry Pi Pico 2 W',     buy:['adafruit','pimoroni','sparkfun'] },
{ id:'pro-micro', local:{se:{electrokit:'Pro Micro'}}, short:'Pro Micro (32U4)',  name:'Pro Micro (ATmega32U4, 5V/16MHz)', cat:'Board',  price:5.00,  lo:3,   hi:22,  unit:'each', q:'Pro Micro ATmega32U4 5V',   buy:['ali','sparkfun','amazon'],
  note:'The 32U4 can pretend to be a USB keyboard or mouse. That is the whole reason to pick it over a Nano.' },

{ id:'uno-q', local:{se:{electrokit:'Arduino UNO Q'}}, short:'Arduino UNO Q',      name:'Arduino UNO Q (2 GB / 16 GB)',      cat:'Board',  price:44.00, lo:44,  hi:79,  unit:'each', q:'Arduino UNO Q',  buy:['arduino','amazon'],
  note:'Two brains on an UNO footprint: a quad-core Qualcomm Dragonwing QRB2210 running Debian, plus an STM32U585 for the real-time pins. $44 for 2 GB/16 GB, $59 for 4 GB/32 GB. Keeps the classic UNO headers, so your shields still fit.' },
{ id:'ventuno-q', short:'Arduino Ventuno Q',  name:'Arduino Ventuno Q',                 cat:'Board',  price:299.00,lo:299, hi:399, unit:'each', q:'Arduino Ventuno Q', buy:['arduino'],
  note:'The big one: Dragonwing IQ8 octa-core, Adreno GPU, 40 TOPS NPU, 16 GB LPDDR5, 64 GB eMMC, M.2 NVMe, 2.5 GbE, three MIPI camera connectors. 160x100 mm, so not an UNO any more - but it keeps UNO and Raspberry Pi headers.' },
{ id:'jetson-orin', local:{se:{electrokit:'Jetson Orin'}}, short:'NVIDIA Jetson Orin Nano',name:'NVIDIA Jetson Orin Nano Super kit', cat:'Board',  price:249.00,lo:229, hi:349, unit:'each', q:'Jetson Orin Nano Super Developer Kit', buy:['sparkfun','amazon','arduino'],
  note:'67 sparse TOPS, 1024 CUDA cores, 8 GB LPDDR5, six Cortex-A78AE cores. "Super" is a JetPack software mode, not new silicon - an older Orin Nano gets it from an update. Includes the carrier board and a power supply.' },
{ id:'nano33ble', short:'Nano 33 BLE Sense',  name:'Arduino Nano 33 BLE Sense Rev2',    cat:'Board',  price:55.00, lo:45,  hi:75,  unit:'each', q:'Arduino Nano 33 BLE Sense Rev2', buy:['arduino','amazon'],
  note:'The TinyML board: IMU, microphone, temperature, humidity and pressure already on it, and enough flash for a small model. Expensive for what it is, and the only Arduino where you can do the whole ML loop with nothing else plugged in.' },
{ id:'csi-cam', local:{se:{electrokit:'IMX219'}},    name:'MIPI CSI camera module (IMX219)',   cat:'Sensor', price:25.00, lo:9,   hi:45,  unit:'each', q:'IMX219 CSI camera module 8MP', buy:['ali','amazon','sparkfun'],
  note:'The Raspberry Pi Camera v2 sensor. Works on the Jetson and on the UNO Q / Ventuno Q MIPI connectors. Check the ribbon: Jetson boards want the 22-pin fine-pitch cable, not the 15-pin one.' },
{ id:'usb-cam',    name:'USB webcam, 1080p',                 cat:'Sensor', price:25.00, lo:10,  hi:80,  unit:'each', q:'1080p USB webcam UVC', buy:['amazon','ali'],
  note:'Any UVC-class webcam works on Linux with no driver at all, which makes it the least frustrating way to get pixels into a first vision project.' },
{ id:'nvme',       name:'M.2 NVMe SSD, 500 GB',              cat:'Module', price:45.00, lo:30,  hi:90,  unit:'each', q:'M.2 2280 NVMe SSD 500GB', buy:['amazon','ali'],
  note:'Worth it on a Jetson or Ventuno Q. Model files, datasets and JetPack itself are large, and running the OS from eMMC or an SD card is the main reason these boards feel slow.' },

/* --- prototyping -------------------------------------------------------- */
{ id:'bb-830', local:{se:{electrokit:'kopplingsdäck',kjell:'kopplingsdäck'}},     name:'Solderless breadboard, 830 points',cat:'Proto',  price:3.00,  lo:1.5, hi:7,   unit:'each', q:'830 point solderless breadboard', buy:['ali','amazon','adafruit'] },
{ id:'bb-400', local:{se:{electrokit:'kopplingsdäck 400'}},     name:'Solderless breadboard, 400 points',cat:'Proto',  price:2.00,  lo:1,   hi:5,   unit:'each', q:'400 point breadboard',      buy:['ali','amazon','adafruit'] },
{ id:'jumpers', local:{se:{electrokit:'kopplingstråd byglar',kjell:'kopplingstråd'}},    name:'Jumper wire set (M-M, M-F, F-F)',  cat:'Proto',  price:5.00,  lo:3,   hi:12,  unit:'120 pcs', q:'jumper wires male female dupont', buy:['ali','amazon','adafruit'],
  note:'Buy 120 of them once and never think about it again. The 20 cm length is the useful one.' },
{ id:'perfboard',  name:'Perfboard / stripboard, 5x7 cm',   cat:'Proto',  price:0.60,  lo:0.3, hi:2,   unit:'each', q:'perfboard 5x7cm prototype pcb', buy:['ali','amazon'] },
{ id:'headers',    name:'Male pin header strip, 2.54 mm',   cat:'Proto',  price:0.15,  lo:0.1, hi:0.6, unit:'40-pin strip', q:'2.54mm male pin header 40 pin', buy:['ali','amazon','adafruit'] },
{ id:'headers-f',  name:'Female header strip, 2.54 mm',     cat:'Proto',  price:0.35,  lo:0.2, hi:1,   unit:'40-pin strip', q:'2.54mm female pin header', buy:['ali','amazon','adafruit'] },
{ id:'screwterm',  name:'Screw terminal block, 2-pin 5 mm', cat:'Proto',  price:0.25,  lo:0.1, hi:0.8, unit:'each', q:'5mm 2 pin screw terminal block', buy:['ali','amazon'] },
{ id:'dupont-kit', name:'Dupont crimp connector kit + tool',cat:'Proto',  price:22.00, lo:15,  hi:40,  unit:'kit',  q:'dupont crimp tool kit SN-28B', buy:['amazon','ali'],
  note:'Not needed to start. Once you build a third project you will want to make your own exact-length cables, and this is what does it.' },

/* --- sensors ------------------------------------------------------------ */
{ id:'dht22', local:{se:{electrokit:'DHT22'}},      name:'DHT22 / AM2302 temp + humidity',   cat:'Sensor', price:3.50,  lo:2,   hi:10,  unit:'each', q:'DHT22 AM2302',              buy:['ali','amazon','adafruit'],
  note:'Get the version on a small breakout board - it has the 10k pull-up resistor already fitted.' },
{ id:'dht11', local:{se:{electrokit:'DHT11'}},      name:'DHT11 temp + humidity (cheaper)',  cat:'Sensor', price:1.20,  lo:0.6, hi:4,   unit:'each', q:'DHT11 module',              buy:['ali','amazon'],
  note:'Half the price, half the accuracy, and it cannot read below 0 C. Fine for a first test, not for real data.' },
{ id:'bme280', local:{se:{electrokit:'BME280'}},     name:'BME280 pressure/temp/humidity',    cat:'Sensor', price:4.00,  lo:2.5, hi:16,  unit:'each', q:'BME280 breakout I2C',       buy:['ali','adafruit','amazon'],
  note:'Watch out: cheap listings often ship a BMP280 (no humidity) in a BME280 photo. If the price is under $2 assume it is a BMP280.' },
{ id:'ds18b20', local:{se:{electrokit:'DS18B20'}},    name:'DS18B20 waterproof temp probe',    cat:'Sensor', price:2.50,  lo:1.2, hi:8,   unit:'each', q:'DS18B20 waterproof probe',  buy:['ali','amazon','adafruit'] },
{ id:'hcsr04', local:{se:{electrokit:'SR04'}},     name:'HC-SR04 ultrasonic distance',      cat:'Sensor', price:1.50,  lo:0.8, hi:5,   unit:'each', q:'HC-SR04 ultrasonic sensor', buy:['ali','amazon','sparkfun'] },
{ id:'pir', local:{se:{electrokit:'SR501'}},        name:'HC-SR501 PIR motion sensor',       cat:'Sensor', price:1.50,  lo:0.8, hi:6,   unit:'each', q:'HC-SR501 PIR motion sensor',buy:['ali','amazon','adafruit'] },
{ id:'ldr',        name:'LDR photoresistor (GL5528)',       cat:'Sensor', price:0.10,  lo:0.05,hi:0.5, unit:'each', q:'GL5528 photoresistor LDR',  buy:['ali','amazon'] },
{ id:'soil', local:{se:{electrokit:'jordfuktighetssensor'}},       name:'Capacitive soil moisture sensor',  cat:'Sensor', price:2.00,  lo:1,   hi:6,   unit:'each', q:'capacitive soil moisture sensor v2', buy:['ali','amazon'],
  note:'Capacitive, never resistive. The resistive ones corrode into uselessness within a month of being in wet soil.' },
{ id:'mq2', local:{se:{electrokit:'MQ2'}},        name:'MQ-2 gas / smoke sensor',          cat:'Sensor', price:1.80,  lo:1,   hi:6,   unit:'each', q:'MQ-2 gas sensor module',    buy:['ali','amazon'] },
{ id:'mq135', local:{se:{electrokit:'MQ-135'}},      name:'MQ-135 air quality sensor',        cat:'Sensor', price:2.00,  lo:1,   hi:6,   unit:'each', q:'MQ-135 air quality sensor', buy:['ali','amazon'] },
{ id:'pms5003',    name:'PMS5003 particulate matter sensor',cat:'Sensor', price:18.00, lo:12,  hi:45,  unit:'each', q:'PMS5003 particulate sensor',buy:['ali','adafruit','amazon'] },
{ id:'mpu6050', local:{se:{electrokit:'MPU6050'}},    name:'MPU-6050 accelerometer + gyro',    cat:'Sensor', price:1.80,  lo:1,   hi:12,  unit:'each', q:'MPU6050 module',            buy:['ali','amazon','adafruit'] },
{ id:'hall', local:{se:{electrokit:'A3144'}},       name:'A3144 hall effect switch',         cat:'Sensor', price:0.15,  lo:0.05,hi:0.6, unit:'each', q:'A3144 hall effect sensor',  buy:['ali','amazon'] },
{ id:'reed', local:{se:{electrokit:'tungelement'}},       name:'Reed switch + magnet pair',        cat:'Sensor', price:0.60,  lo:0.3, hi:3,   unit:'each', q:'reed switch door sensor magnet', buy:['ali','amazon'] },
{ id:'flame',      name:'IR flame sensor module',           cat:'Sensor', price:0.80,  lo:0.4, hi:3,   unit:'each', q:'IR flame sensor module',    buy:['ali','amazon'] },
{ id:'water',      name:'Water leak / rain detection board',cat:'Sensor', price:0.70,  lo:0.3, hi:3,   unit:'each', q:'water level leak sensor module', buy:['ali','amazon'] },
{ id:'acs712', local:{se:{electrokit:'ACS712'}},     name:'ACS712 current sensor, 20 A',      cat:'Sensor', price:2.00,  lo:1,   hi:8,   unit:'each', q:'ACS712 20A current sensor', buy:['ali','amazon'] },
{ id:'ina219', local:{se:{electrokit:'INA219'}},     name:'INA219 current + power monitor',   cat:'Sensor', price:2.50,  lo:1.5, hi:11,  unit:'each', q:'INA219 current sensor I2C',buy:['ali','adafruit','amazon'] },
{ id:'loadcell', local:{se:{electrokit:'HX711'}},   name:'Load cell 5 kg + HX711 amplifier', cat:'Sensor', price:4.50,  lo:3,   hi:14,  unit:'set',  q:'5kg load cell HX711',       buy:['ali','amazon','sparkfun'] },
{ id:'fingerprint',name:'R307 / AS608 fingerprint reader',  cat:'Sensor', price:11.00, lo:8,   hi:50,  unit:'each', q:'R307 fingerprint sensor',   buy:['ali','amazon','adafruit'] },
{ id:'irrecv',     name:'VS1838B IR receiver + remote',     cat:'Sensor', price:1.00,  lo:0.5, hi:4,   unit:'set',  q:'VS1838B IR receiver remote kit', buy:['ali','amazon'] },
{ id:'rotary',     name:'KY-040 rotary encoder',            cat:'Sensor', price:0.80,  lo:0.4, hi:4,   unit:'each', q:'KY-040 rotary encoder module', buy:['ali','amazon','adafruit'] },
{ id:'joystick',   name:'Analog thumb joystick module',     cat:'Sensor', price:1.20,  lo:0.6, hi:5,   unit:'each', q:'arduino analog joystick module', buy:['ali','amazon','sparkfun'] },
{ id:'tcs34725',   name:'TCS34725 RGB colour sensor',       cat:'Sensor', price:4.00,  lo:2.5, hi:9,   unit:'each', q:'TCS34725 color sensor',     buy:['ali','adafruit','amazon'] },
{ id:'vl53l0x', local:{se:{electrokit:'VL53L0X'}},    name:'VL53L0X laser time-of-flight range',cat:'Sensor',price:3.00,  lo:2,   hi:15,  unit:'each', q:'VL53L0X time of flight sensor', buy:['ali','adafruit','amazon'] },

/* --- rfid / id ---------------------------------------------------------- */
{ id:'rc522', local:{se:{electrokit:'RC522'}},      name:'RC522 RFID reader + card + fob',   cat:'RFID',   price:2.00,  lo:1,   hi:7,   unit:'kit',  q:'RC522 RFID module kit',     buy:['ali','amazon'],
  note:'13.56 MHz MIFARE. The kit includes one white card and one blue keyfob. Note the module is 3.3 V only - never feed it 5 V.' },
{ id:'pn532', local:{se:{electrokit:'PN532'}},      name:'PN532 NFC reader (does phones too)',cat:'RFID',  price:7.00,  lo:5,   hi:40,  unit:'each', q:'PN532 NFC module',          buy:['ali','adafruit','amazon'] },
{ id:'rfid-tags', local:{se:{electrokit:'rfid tagg'}},  name:'MIFARE Classic 1K cards, blank',   cat:'RFID',   price:0.25,  lo:0.1, hi:1,   unit:'each', q:'MIFARE Classic 1K blank card', buy:['ali','amazon'] },
{ id:'rfid-125',   name:'RDM6300 125 kHz reader + tags',    cat:'RFID',   price:3.00,  lo:2,   hi:9,   unit:'kit',  q:'RDM6300 125khz RFID reader',buy:['ali','amazon'] },

/* --- displays ----------------------------------------------------------- */
{ id:'oled13', local:{se:{electrokit:'SSD1306'}},     name:'SSD1306 OLED 128x64, 0.96 in I2C',  cat:'Display',price:2.50, lo:1.5, hi:14,  unit:'each', q:'0.96 inch OLED SSD1306 I2C',buy:['ali','amazon','adafruit'] },
{ id:'oled13b',    name:'SH1106 OLED 128x64, 1.3 in I2C',    cat:'Display',price:3.50, lo:2,   hi:12,  unit:'each', q:'1.3 inch OLED SH1106 I2C',  buy:['ali','amazon'],
  note:'Physically bigger than the 0.96 in, and it uses the SH1106 driver, not SSD1306. Wrong driver in your code shows a 2-pixel horizontal offset.' },
{ id:'lcd1602', local:{se:{electrokit:'1602 LCD'}},    name:'16x2 LCD with I2C backpack',        cat:'Display',price:2.50, lo:1.5, hi:9,   unit:'each', q:'1602 LCD I2C module',       buy:['ali','amazon'],
  note:'Always buy the version with the I2C backpack soldered on. The bare 16-pin one eats six Arduino pins for nothing.' },
{ id:'lcd2004',    name:'20x4 LCD with I2C backpack',        cat:'Display',price:4.50, lo:3,   hi:14,  unit:'each', q:'2004 LCD I2C module',       buy:['ali','amazon'] },
{ id:'tft18',      name:'ST7735 TFT colour LCD, 1.8 in',     cat:'Display',price:4.00, lo:2.5, hi:16,  unit:'each', q:'1.8 inch ST7735 TFT SPI',   buy:['ali','amazon','adafruit'] },
{ id:'tft28', local:{se:{electrokit:'ILI9341'}},      name:'ILI9341 TFT touch LCD, 2.8 in',     cat:'Display',price:9.00, lo:6,   hi:30,  unit:'each', q:'2.8 inch ILI9341 TFT touch SPI', buy:['ali','amazon','adafruit'] },
{ id:'tm1637', local:{se:{electrokit:'TM1637'}},     name:'TM1637 4-digit 7-segment display',  cat:'Display',price:1.20, lo:0.6, hi:6,   unit:'each', q:'TM1637 4 digit display',    buy:['ali','amazon'] },
{ id:'max7219', local:{se:{electrokit:'MAX7219'}},    name:'MAX7219 8x8 LED matrix, 4-in-1',    cat:'Display',price:3.50, lo:2,   hi:12,  unit:'each', q:'MAX7219 4 in 1 dot matrix', buy:['ali','amazon'] },
{ id:'epaper', local:{se:{electrokit:'2.9 inch'}},     name:'2.9 in e-paper display module',     cat:'Display',price:16.00,lo:11,  hi:40,  unit:'each', q:'2.9 inch e-paper module SPI', buy:['ali','pimoroni','adafruit'] },

/* --- light -------------------------------------------------------------- */
{ id:'led5', local:{se:{electrokit:'lysdiod 5mm',kjell:'lysdiod'}},       name:'5 mm LED assortment',               cat:'Light',  price:0.05, lo:0.02,hi:0.2, unit:'each', q:'5mm LED assortment kit',    buy:['ali','amazon'] },
{ id:'rgbled',     name:'5 mm RGB LED, common cathode',      cat:'Light',  price:0.15, lo:0.06,hi:0.6, unit:'each', q:'5mm RGB LED common cathode',buy:['ali','amazon'] },
{ id:'ws2812-strip', local:{se:{electrokit:'WS2812B'}},name:'WS2812B addressable strip, 1 m 60 LED',cat:'Light',price:7.00,lo:4, hi:22,  unit:'metre',q:'WS2812B 60 LED per meter',  buy:['ali','amazon','adafruit'],
  note:'Sold as IP30 (bare), IP65 (sleeved) or IP67 (filled). Outdoors needs IP67. Also check 5 V vs 12 V - the 5 V one is what these projects use.' },
{ id:'ws2812-ring', local:{se:{electrokit:'WS2812B'}},name:'WS2812B ring, 16 LED',              cat:'Light',  price:3.00, lo:1.5, hi:12,  unit:'each', q:'WS2812B 16 LED ring',       buy:['ali','amazon','adafruit'] },
{ id:'ws2812-mat', name:'WS2812B matrix, 8x8 flexible',      cat:'Light',  price:7.00, lo:4,   hi:25,  unit:'each', q:'WS2812B 8x8 matrix flexible',buy:['ali','amazon'] },
{ id:'ledstrip12v', name:'Plain 12 V LED strip, 1 m',            cat:'Light',  price:4.00, lo:2,   hi:12,  unit:'metre',q:'12V LED strip 5050 warm white 1m', buy:['ali','amazon'],
  note:'Single colour, not addressable. Check the amps per metre on the listing - 60 LED/m is about 0.5 A per metre.' },
{ id:'led-ir',     name:'IR LED 940 nm',                     cat:'Light',  price:0.10, lo:0.04,hi:0.4, unit:'each', q:'940nm IR LED 5mm',          buy:['ali','amazon'] },

/* --- motion ------------------------------------------------------------- */
{ id:'bldc2207',   name:'2207 brushless motor, 1800-2400 kV',  cat:'Motion', price:13.00, lo:8,  hi:28, unit:'each', q:'2207 brushless motor 2400kv', buy:['ali','amazon'],
  note:'kV is RPM per volt with no load. A 2400 kV motor on a 4S pack spins to roughly 35,000 RPM unloaded - which is why the propeller safety notes in these projects are not padding.' },
{ id:'foc-driver',  name:'3-phase BLDC driver (DRV8313 / SimpleFOC Mini)', cat:'Motion', price:12.00, lo:7, hi:30, unit:'each', q:'SimpleFOC mini DRV8313 BLDC driver', buy:['ali','amazon'],
  note:'Not an ESC. An ESC decides its own commutation from back-EMF and needs the motor spinning; this gives you direct control of all three phases, which is what holding a motor still at a chosen angle requires.' },
{ id:'as5600', local:{se:{electrokit:'AS5600'}},      name:'AS5600 magnetic angle encoder',      cat:'Sensor', price:3.00, lo:1.5, hi:9, unit:'each', q:'AS5600 magnetic encoder module', buy:['ali','amazon'],
  note:'Reads absolute shaft angle to 12 bits from a diametrically-magnetised magnet on the shaft end. Contactless, so nothing wears.' },
{ id:'bldc-gimbal', name:'Gimbal brushless motor (GM2804 class)', cat:'Motion', price:14.00, lo:9,  hi:30, unit:'each', q:'GM2804 gimbal brushless motor', buy:['ali','amazon'],
  note:'Low kV, many poles, and a hollow shaft for the wires. It is built to hold position smoothly at near-zero speed, which a prop motor is not - do not substitute one.' },
{ id:'esc30',       name:'30 A brushless ESC (BLHeli_S)',      cat:'Motion', price:10.00, lo:6, hi:25, unit:'each', q:'30A BLHeli_S ESC brushless', buy:['ali','amazon'],
  note:'Size it well above the stall current, not the cruise current. An ESC running at its limit gets hot and desyncs, and a desync on a flying machine is a crash.' },
{ id:'esc-4in1',    name:'4-in-1 ESC, 45 A, 30x30 mm',         cat:'Motion', price:35.00, lo:22, hi:80, unit:'each', q:'4in1 ESC 45A 30x30 BLHeli_32', buy:['ali','amazon'],
  note:'Four ESCs on one board with one battery connection. Tidier and lighter than four separate ones, and if one channel fails you replace the whole board.' },
{ id:'motor540',    name:'540-size brushed motor',             cat:'Motion', price:9.00, lo:5, hi:22, unit:'each', q:'540 brushed motor RC boat car', buy:['ali','amazon'],
  note:'The standard RC size. Tolerates damp far better than brushless, gives reverse and braking from a cheap ESC, and has no timing to get wrong. Slower, and much simpler.' },
{ id:'esc-brushed', name:'Brushed ESC for RC car or boat',     cat:'Motion', price:7.00,  lo:4,  hi:16, unit:'each', q:'320A brushed ESC RC car boat', buy:['ali','amazon'],
  note:'The "320 A" printed on these has no basis - treat it as maybe 30 A continuous. Cheap, simple, and the right choice for a small boat or a first RC car.' },
{ id:'props5',      name:'5 inch propellers, set of 4',        cat:'Motion', price:4.00,  lo:2,  hi:12, unit:'set',  q:'5045 propeller set quadcopter', buy:['ali','amazon'],
  note:'Buy plenty of spares - they are consumable, and a chipped blade is an unbalanced blade. Never run a damaged propeller.' },
{ id:'quad-frame',  name:'5 inch quadcopter frame, carbon',    cat:'Misc',   price:28.00, lo:16, hi:70, unit:'each', q:'5 inch quadcopter frame carbon fiber', buy:['ali','amazon'],
  note:'Carbon fibre is electrically conductive and its dust is a respiratory irritant. Cut and drill it wet, wearing a mask, and check no board can short against a frame edge.' },
{ id:'lipo4s',      name:'4S 1500 mAh LiPo pack, XT60',        cat:'Power',  price:26.00, lo:16, hi:50, unit:'each', q:'4S 1500mAh 100C lipo XT60', buy:['ali','amazon'],
  note:'14.8 V nominal, and it will deliver over 100 A into a short without noticing. This is the most dangerous single component in this book - read the safety sections before buying one.' },
{ id:'lipo3s',      name:'3S 2200 mAh LiPo pack, XT60',        cat:'Power',  price:18.00, lo:11, hi:36, unit:'each', q:'3S 2200mAh lipo XT60', buy:['ali','amazon'] },
{ id:'lipo-charger',name:'Balance charger, 50 W or more',      cat:'Tool',   price:35.00, lo:22, hi:120,unit:'each', q:'lipo balance charger B6 50W', buy:['ali','amazon'],
  note:'Balance charging is not optional on a multi-cell pack. A charger that ignores the balance lead will overcharge one cell while the total pack voltage looks perfectly correct.' },
{ id:'lipo-bag',    name:'LiPo charging and storage bag',      cat:'Tool',   price:8.00,  lo:4,  hi:20, unit:'each', q:'lipo safe charging bag fireproof', buy:['ali','amazon'],
  note:'It does not prevent a fire. It contains one for long enough to get the pack outside, which is the whole job.' },
{ id:'rc-txrx',     name:'RC transmitter + receiver set',      cat:'Module', price:60.00, lo:35, hi:250,unit:'set',  q:'RC transmitter receiver ELRS 2.4GHz', buy:['ali','amazon'],
  note:'ExpressLRS is the sensible current choice - cheap, long range, open source, tiny receivers. Transmitter and receiver firmware versions must match or they will not bind.' },
{ id:'rx-elrs',     name:'ExpressLRS receiver, 2.4 GHz',       cat:'Module', price:12.00, lo:7,  hi:30, unit:'each', q:'ExpressLRS 2.4GHz receiver CRSF', buy:['ali','amazon'] },
{ id:'xt60', local:{se:{electrokit:'XT60'}},        name:'XT60 connector pairs',               cat:'Power',  price:4.00,  lo:2,  hi:10, unit:'pair', q:'XT60 connector male female pair', buy:['ali','amazon'],
  note:'The standard RC power connector. Solder them properly - a high-resistance joint carrying 40 A is a heat source inside your aircraft.' },
{ id:'power-module',name:'RC power module, voltage + current', cat:'Power',  price:9.00,  lo:5,  hi:25, unit:'each', q:'RC power module voltage current sensor 60A', buy:['ali','amazon'] },
{ id:'thrust-frame',name:'Thrust test stand frame + hardware', cat:'Misc',   price:12.00, lo:6,  hi:40, unit:'each', q:'brushless motor thrust test stand', buy:['ali','amazon'],
  note:'Or build it from plywood and threaded rod. The only real requirement is that it is heavier and stronger than you think it needs to be.' },
{ id:'sg90', local:{se:{electrokit:'SG90'}},       name:'SG90 micro servo, 9 g',             cat:'Motion', price:1.50, lo:1,   hi:6,   unit:'each', q:'SG90 micro servo',          buy:['ali','amazon','adafruit'] },
{ id:'mg996r', local:{se:{electrokit:'MG996R'}},     name:'MG996R metal-gear servo',           cat:'Motion', price:4.00, lo:2.5, hi:13,  unit:'each', q:'MG996R servo',              buy:['ali','amazon'] },
{ id:'28byj',      name:'28BYJ-48 stepper + ULN2003 driver', cat:'Motion', price:2.00, lo:1.2, hi:7,   unit:'set',  q:'28BYJ-48 stepper ULN2003',  buy:['ali','amazon'] },
{ id:'nema17',     name:'NEMA 17 stepper motor',             cat:'Motion', price:10.00,lo:7,   hi:22,  unit:'each', q:'NEMA 17 stepper motor',     buy:['ali','amazon'] },
{ id:'a4988', local:{se:{electrokit:'A4988'}},      name:'A4988 stepper driver + heatsink',   cat:'Motion', price:1.50, lo:0.8, hi:6,   unit:'each', q:'A4988 stepper driver',      buy:['ali','amazon'] },
{ id:'l298n', local:{se:{electrokit:'L298N'}},      name:'L298N dual motor driver board',     cat:'Motion', price:2.50, lo:1.5, hi:9,   unit:'each', q:'L298N motor driver module', buy:['ali','amazon'] },
{ id:'tb6612', local:{se:{electrokit:'TB6612FNG'}},     name:'TB6612FNG motor driver (efficient)',cat:'Motion', price:2.50, lo:1.5, hi:10,  unit:'each', q:'TB6612FNG motor driver',    buy:['ali','sparkfun','adafruit'],
  note:'Drops about 0.5 V instead of the L298N 2 V. On battery projects that difference is the whole ball game.' },
{ id:'tt-motor',   name:'TT gear motor + wheel',             cat:'Motion', price:2.00, lo:1.2, hi:7,   unit:'each', q:'TT gear motor wheel arduino',buy:['ali','amazon','adafruit'] },
{ id:'car-chassis', local:{se:{electrokit:'2WD robot'}},name:'2WD robot car chassis kit',         cat:'Motion', price:9.00, lo:6,   hi:25,  unit:'kit',  q:'2WD robot car chassis kit', buy:['ali','amazon'] },
{ id:'pump', local:{se:{electrokit:'vattenpump'}},       name:'5 V submersible water pump',        cat:'Motion', price:2.00, lo:1.2, hi:8,   unit:'each', q:'5V submersible mini water pump', buy:['ali','amazon'] },
{ id:'sol-lock', local:{se:{electrokit:'12V solenoid'}},   name:'12 V solenoid door lock',           cat:'Motion', price:8.00, lo:5,   hi:22,  unit:'each', q:'12V solenoid electric door lock', buy:['ali','amazon','adafruit'] },
{ id:'scd40', local:{se:{electrokit:'SCD40'}},       name:'SCD40 true CO2 sensor (NDIR)',      cat:'Sensor', price:22.00,lo:16,  hi:60,  unit:'each', q:'SCD40 CO2 sensor module I2C', buy:['ali','adafruit','amazon'],
  note:'True NDIR CO2, not a VOC sensor guessing at it. Anything under $10 claiming CO2 is an MQ-135 estimating from other gases - useful for trends, not for ppm.' },
{ id:'powerres', local:{se:{electrokit:'motstånd 10w'}},    name:'10 ohm 10 W wirewound resistor',    cat:'Passive',price:1.00, lo:0.5, hi:3,   unit:'each', q:'10 ohm 10W wirewound resistor', buy:['ali','amazon'],
  note:'The dummy load for battery testing. It gets genuinely hot - mount it in free air, on its own, away from everything else.' },
{ id:'wc-face',     name:'Word clock face (laser cut or printed)',cat:'Misc',price:14.00,lo:0,   hi:45,  unit:'each', q:'word clock face acrylic stencil', buy:['amazon','ali'],
  note:'Buy one cut to your language, or print the letters on acetate and back it with black card. The grid dividers between letters matter more than the face does.' },
{ id:'diffuser',    name:'Diffuser sheet / white acrylic',    cat:'Misc',   price:6.00, lo:3,   hi:18,  unit:'sheet',q:'led diffuser sheet white acrylic 3mm', buy:['amazon','ali'] },
{ id:'fan40',            name:'40 mm 5 V fan',                     cat:'Motion', price:2.00, lo:1,   hi:7,   unit:'each', q:'40mm 5V fan',               buy:['ali','amazon'] },

/* --- control / power ---------------------------------------------------- */
{ id:'relay1', local:{se:{electrokit:'relämodul'}},     name:'1-channel relay module, opto-isolated',cat:'Power',price:1.50,lo:0.8, hi:6,   unit:'each', q:'1 channel relay module 5V opto', buy:['ali','amazon','adafruit'] },
{ id:'relay4',     name:'4-channel relay module',            cat:'Power',  price:3.50, lo:2,   hi:12,  unit:'each', q:'4 channel relay module 5V', buy:['ali','amazon'] },
{ id:'mosfet', local:{se:{electrokit:'IRLZ44N'}},     name:'IRLZ44N logic-level MOSFET',        cat:'Power',  price:0.60, lo:0.3, hi:2.5, unit:'each', q:'IRLZ44N MOSFET',            buy:['ali','digikey','amazon'],
  note:'Logic-level is the important word. A plain IRF540 will not turn on properly from a 5 V pin, and will get hot while half-failing.' },
{ id:'transistor', name:'2N2222 / BC547 NPN transistors',    cat:'Power',  price:0.05, lo:0.02,hi:0.2, unit:'each', q:'2N2222 NPN transistor pack',buy:['ali','amazon','digikey'] },
{ id:'boost',      name:'MT3608 boost converter',             cat:'Power',  price:1.00, lo:0.5, hi:4,   unit:'each', q:'MT3608 boost converter module', buy:['ali','amazon'],
  note:'Steps voltage UP, which a buck converter cannot do. A 3.7 V LiPo driving 5 V WS2812s needs this, not an LM2596.' },
{ id:'buck', local:{se:{electrokit:'LM2596'}},       name:'MP1584 / LM2596 buck converter',    cat:'Power',  price:1.00, lo:0.5, hi:4,   unit:'each', q:'LM2596 buck converter module', buy:['ali','amazon'] },
{ id:'ams1117',    name:'AMS1117 3.3 V regulator board',     cat:'Power',  price:0.50, lo:0.2, hi:2,   unit:'each', q:'AMS1117 3.3V module',       buy:['ali','amazon'] },
{ id:'tp4056', local:{se:{electrokit:'TP4056'}},     name:'TP4056 LiPo charger with protection',cat:'Power', price:0.60, lo:0.3, hi:2.5, unit:'each', q:'TP4056 charger module protection', buy:['ali','amazon'],
  note:'Only buy the variant with the protection IC (two extra chips next to the USB port). The unprotected one will happily over-discharge your cell into the bin.' },
{ id:'lipo2000', local:{se:{electrokit:'2000mAh lipo'}},   name:'2000 mAh LiPo cell, JST-PH',        cat:'Power',  price:8.00, lo:5,   hi:18,  unit:'each', q:'2000mAh lipo battery JST PH', buy:['adafruit','amazon','ali'] },
{ id:'18650', local:{se:{electrokit:'batterihållare 18650',kjell:'18650 batterihållare'}},      name:'18650 cell + holder',               cat:'Power',  price:5.00, lo:3,   hi:12,  unit:'set',  q:'18650 battery holder',      buy:['amazon','ali'] },
{ id:'solar6v',     name:'Solar panel, 6 V 1-2 W',            cat:'Power',  price:8.00, lo:4,   hi:20,  unit:'each', q:'6V 2W solar panel epoxy', buy:['ali','amazon','adafruit'],
  note:'6 V, not 5 V - a TP4056 needs headroom above the cell voltage. Epoxy-potted panels survive outdoors; bare cells do not.' },
{ id:'batt-aa2', local:{se:{electrokit:'batterihållare aa'}},    name:'2x AA battery holder + cells',      cat:'Power',  price:2.50, lo:1,   hi:6,   unit:'set',  q:'2 AA battery holder switch', buy:['ali','amazon'],
  note:'Two alkaline cells give 3.0 V fresh and about 2.4 V flat - which is exactly the range an ESP8266 will run on directly.' },
{ id:'batt-aa6', local:{se:{electrokit:'batterihållare aa'}},    name:'6x AA battery holder + cells',      cat:'Power',  price:5.00, lo:2.5, hi:10,  unit:'set',  q:'6 AA battery holder 9V', buy:['ali','amazon'],
  note:'Six cells give 9 V. Use rechargeable NiMH for anything with motors - alkalines sag badly under a 1 A load.' },
{ id:'psu5v3a',    name:'5 V 3 A USB power supply',          cat:'Power',  price:7.00, lo:5,   hi:16,  unit:'each', q:'5V 3A USB power supply',    buy:['amazon','adafruit','ali'] },
{ id:'psu12v2a', local:{se:{electrokit:'nätaggregat 12v'}},   name:'12 V 2 A barrel-jack supply',       cat:'Power',  price:7.00, lo:5,   hi:16,  unit:'each', q:'12V 2A power supply 5.5mm',buy:['amazon','ali'] },
{ id:'batt9v',     name:'9 V battery + barrel-jack clip',    cat:'Power',  price:2.50, lo:1.5, hi:6,   unit:'set',  q:'9V battery clip barrel jack', buy:['ali','amazon'],
  note:'Fine for a blinking LED, hopeless for motors or Wi-Fi. A 9 V PP3 holds roughly 500 mAh and sags badly under load.' },
{ id:'usb-cable', local:{se:{electrokit:'usb kabel',kjell:'usb kabel'}},  name:'USB cable for your board',          cat:'Power',  price:2.00, lo:1,   hi:8,   unit:'each', q:'USB A to B cable arduino',  buy:['amazon','ali'],
  note:'Uno uses USB-B (printer cable). Nano clones use mini-B or USB-C. ESP32 boards use micro-B or USB-C. Check before you order.' },

/* --- passives ----------------------------------------------------------- */
{ id:'res-kit', local:{se:{electrokit:'motståndssats',kjell:'motstånd'}},    name:'Resistor kit, 1/4 W, 600 pcs',      cat:'Passive',price:6.00, lo:4,   hi:14,  unit:'kit',  q:'600 pcs resistor kit 1/4W', buy:['ali','amazon'],
  note:'One purchase covers every project on this site. Buy it on day one.' },
{ id:'res220', local:{se:{electrokit:'motstånd 220'}},     name:'220 ohm resistor',                  cat:'Passive',price:0.02, lo:0.01,hi:0.1, unit:'each', q:'220 ohm resistor 1/4W',     buy:['ali','amazon'] },
{ id:'res1k', local:{se:{electrokit:'motstånd 1k'}},      name:'1 k resistor',                      cat:'Passive',price:0.02, lo:0.01,hi:0.1, unit:'each', q:'1k ohm resistor 1/4W',      buy:['ali','amazon'] },
{ id:'res4k7', local:{se:{electrokit:'motstånd 4k7'}},     name:'4.7 k ohm resistor, 1/4 W',          cat:'Passive',price:0.02, lo:0.01,hi:0.1, unit:'each', q:'4.7k ohm resistor 1/4W',    buy:['ali','amazon','digikey'],
  note:'The 1-Wire pull-up value. A 10 k works on a short lead and does not on a long one, which makes it a confusing fault.' },
{ id:'res10k', local:{se:{electrokit:'motstånd 10k'}},     name:'10 k resistor',                     cat:'Passive',price:0.02, lo:0.01,hi:0.1, unit:'each', q:'10k ohm resistor 1/4W',     buy:['ali','amazon'] },
{ id:'cap-kit',    name:'Capacitor assortment kit',          cat:'Passive',price:7.00, lo:5,   hi:16,  unit:'kit',  q:'electrolytic ceramic capacitor kit', buy:['ali','amazon'] },
{ id:'cap10',      name:'10 uF 16 V electrolytic cap',       cat:'Passive',price:0.08, lo:0.03,hi:0.4, unit:'each', q:'10uF 16V electrolytic capacitor', buy:['ali','amazon','digikey'],
  note:'Soldered across the VCC and GND pins of an nRF24 module, this is the difference between a radio that works and one that does not. Anything from 4.7 to 100 uF does the job.' },
{ id:'cap1000', local:{se:{electrokit:'kondensator 1000uf'}},    name:'1000 uF 16 V electrolytic cap',     cat:'Passive',price:0.15, lo:0.05,hi:0.6, unit:'each', q:'1000uF 16V capacitor',      buy:['ali','amazon','digikey'] },
{ id:'cap100n',    name:'100 nF ceramic capacitor',          cat:'Passive',price:0.03, lo:0.01,hi:0.15,unit:'each', q:'100nF ceramic capacitor 0.1uF', buy:['ali','amazon'] },
{ id:'diode', local:{se:{electrokit:'diod 1n4007'}},      name:'1N4007 rectifier diode',            cat:'Passive',price:0.03, lo:0.01,hi:0.15,unit:'each', q:'1N4007 diode pack',         buy:['ali','amazon'] },
{ id:'pot10k', local:{se:{electrokit:'potentiometer 10k'}},     name:'10 k potentiometer',                cat:'Passive',price:0.30, lo:0.1, hi:1.5, unit:'each', q:'10k potentiometer knob',    buy:['ali','amazon'] },
{ id:'button', local:{se:{electrokit:'tryckknapp'}},     name:'6 mm tactile push button',          cat:'Passive',price:0.05, lo:0.02,hi:0.3, unit:'each', q:'6x6mm tactile push button', buy:['ali','amazon'] },
{ id:'switch',     name:'SPDT slide / toggle switch',        cat:'Passive',price:0.30, lo:0.1, hi:1.5, unit:'each', q:'SPDT slide switch',         buy:['ali','amazon'] },
{ id:'buzzer',     name:'Passive piezo buzzer',              cat:'Passive',price:0.30, lo:0.1, hi:1.5, unit:'each', q:'passive piezo buzzer arduino', buy:['ali','amazon'],
  note:'Passive, not active. Active buzzers play one fixed tone and ignore your melody code.' },
{ id:'speaker8', local:{se:{electrokit:'högtalare'}},   name:'8 ohm 0.5 W speaker',               cat:'Passive',price:0.80, lo:0.4, hi:3,   unit:'each', q:'8 ohm 0.5W small speaker',  buy:['ali','amazon'] },

/* --- storage / time / radio --------------------------------------------- */
{ id:'ds3231', local:{se:{electrokit:'DS3231'}},     name:'DS3231 real-time clock + battery',  cat:'Module', price:1.50, lo:0.8, hi:8,   unit:'each', q:'DS3231 RTC module',         buy:['ali','amazon','adafruit'],
  note:'DS3231, not DS1307. The 3231 is temperature-compensated and drifts about a minute a year; the 1307 drifts that much in a fortnight.' },
{ id:'sdcard',     name:'Micro SD card breakout module',     cat:'Module', price:1.00, lo:0.5, hi:8,   unit:'each', q:'micro sd card module arduino', buy:['ali','amazon','adafruit'] },
{ id:'usb-speaker', name:'USB powered speaker',               cat:'Module', price:15.00, lo:8, hi:40, unit:'each', q:'USB powered speaker desktop', buy:['amazon','ali'],
  note:'A Linux board sees this as a standard USB audio device with no driver and no amplifier to build. For a talking project it saves an evening over a PAM8403 and a bare driver.' },
{ id:'usb-mic', local:{se:{electrokit:'mikrofon usb'}},    name:'USB microphone, omnidirectional',   cat:'Sensor', price:14.00, lo:8,  hi:35,  unit:'each', q:'USB omnidirectional microphone',  buy:['amazon','ali'],
  note:'A Linux board sees this as a standard USB audio device with no driver. A conference-style boundary mic picks up a room far better than the pinhole in a webcam, and for voice work that difference is most of the accuracy.' },
{ id:'usbc-hub', local:{se:{electrokit:'usb hubb'}},   name:'USB-C hub with USB-A + power passthrough', cat:'Module', price:16.00, lo:10, hi:30, unit:'each', q:'USB-C hub power delivery USB-A', buy:['amazon','ali'],
  note:'A single-board computer with one USB-C port needs this the moment you want a webcam and power at the same time. Get one with power delivery passthrough, not a bare splitter.' },
{ id:'sd-64gb', local:{se:{kjell:'microsd'}},    name:'Micro SD card, 64 GB A2/U3',        cat:'Module', price:12.00, lo:8,  hi:22,  unit:'each', q:'64GB A2 U3 micro sd card',  buy:['amazon','ali'],
  note:'A single-board Linux machine boots from this and then runs its whole root filesystem on it. A slow card makes a fast board feel broken, and cheap cards die from the write load. Buy an A2/U3 rated one from a shop you trust.' },
{ id:'sdcard-8gb', name:'Micro SD card, 8-32 GB',            cat:'Module', price:6.00, lo:4,   hi:12,  unit:'each', q:'32GB micro sd card',        buy:['amazon','ali'] },
{ id:'nrf24',      name:'nRF24L01+ 2.4 GHz radio pair',      cat:'Module', price:3.00, lo:1.5, hi:9,   unit:'pair', q:'nRF24L01 module pair',      buy:['ali','amazon'],
  note:'Solder a 10 uF cap across its VCC and GND or it will reset at random. This is not optional; it is the single most common nRF24 complaint.' },
{ id:'ant-868', local:{se:{electrokit:'antenn 868'}},    name:'868/915 MHz antenna + IPEX-SMA pigtail', cat:'Module', price:5.00, lo:2, hi:14, unit:'each', q:'868MHz SMA antenna IPEX pigtail', buy:['ali','amazon'],
  note:'Buy the band your region uses - a 433 MHz whip on an 868 MHz module wastes most of your power heating the transmitter. Range claims in this book assume a real antenna, not the little spring.' },
{ id:'ant-wire', local:{se:{electrokit:'kopplingstråd'}},   name:'Wire whip antenna (solid core, cut to length)', cat:'Passive', price:0.05, lo:0, hi:1, unit:'each', q:'22AWG solid core hookup wire', buy:['ali','amazon'],
  note:'86 mm for 868 MHz, 78 mm for 915, 164 mm for 433 - a quarter wavelength. Free, and far better than transmitting with no antenna at all, which destroys the module.' },
{ id:'sim800l',    name:'SIM800L 2G GSM/GPRS module',         cat:'Module', price:5.00,  lo:3,  hi:10,  unit:'each', q:'SIM800L GSM module',          buy:['ali','amazon'],
  note:'2G only, and 2G is being switched off - already gone in Australia, Japan, Switzerland, Singapore and most of the US. Cheap and fine for learning AT commands; do not design anything long-lived around it. Wants 3.4-4.4 V and pulls 2 A spikes.' },
{ id:'sim7080g',   name:'SIM7080G LTE-M / NB-IoT module',     cat:'Module', price:25.00, lo:18, hi:40,  unit:'each', q:'SIM7080G LTE-M NB-IoT module', buy:['ali','amazon','digikey'],
  note:'The right chip for a battery sensor on a mobile network. Cat-M1 and NB-IoT, global bands, and PSM sleep down to a few microamps. Slow by design - tens of kbps - which is the whole point.' },
{ id:'a7670',      name:'A7670E LTE Cat-1 module',            cat:'Module', price:20.00, lo:14, hi:32,  unit:'each', q:'A7670E LTE Cat-1 module',     buy:['ali','amazon'],
  note:'The cheap LTE workhorse: ~10 Mbps down, voice and SMS, no 2G fallback needed. Buy the regional variant - A7670E for Europe, A7670SA for South America, A7670G global.' },
{ id:'sim7600', local:{se:{electrokit:'SIM7600'}},    name:'SIM7600 LTE Cat-4 module + GNSS',    cat:'Module', price:45.00, lo:32, hi:80,  unit:'each', q:'SIM7600 LTE Cat-4 module',    buy:['ali','amazon','digikey'],
  note:'Real broadband - 150 Mbps down - plus GPS on the same board, which saves you a second module. Draws 500 mA-2 A and needs a proper supply and heatsinking.' },
{ id:'rm500q',     name:'Quectel RM500Q-GL 5G NR module (M.2)', cat:'Module', price:280.00, lo:200, hi:420, unit:'each', q:'Quectel RM500Q-GL 5G module', buy:['ali','amazon'],
  note:'5G NR sub-6 GHz, M.2 Key-B. Needs a Linux host with USB 3 - there is no version of this that talks to an ATmega. Four antennas, and it gets genuinely hot.' },
{ id:'m2-carrier', name:'M.2 Key-B to USB 3 carrier board',   cat:'Module', price:40.00, lo:25, hi:70,  unit:'each', q:'M.2 Key B 5G module USB 3 adapter', buy:['ali','amazon'],
  note:'Carries the 5G module, breaks out the SIM slot and the four antenna connectors, and needs its own power input - USB 3 alone cannot feed a 5G modem at full tilt.' },
{ id:'lte-ant',    name:'LTE antenna pair, SMA (main + diversity)', cat:'Module', price:8.00, lo:4, hi:20, unit:'pair', q:'LTE SMA antenna 4G main diversity', buy:['ali','amazon'],
  note:'Fit BOTH. The diversity antenna is not optional decoration - LTE receive diversity is worth several dB, which at the edge of a cell is the difference between a connection and none.' },
{ id:'5g-ant',     name:'5G MIMO antenna set, 4x SMA',        cat:'Module', price:25.00, lo:15, hi:60,  unit:'set',  q:'5G MIMO antenna set 4 SMA sub-6', buy:['ali','amazon'],
  note:'All four, spaced as far apart as the enclosure allows. 4x4 MIMO is where 5G gets its throughput; two antennas gets you a fraction of the speed and it is not a small fraction.' },
{ id:'iot-sim',    name:'IoT / M2M data SIM',                 cat:'Module', price:10.00, lo:3,  hi:60,  unit:'each', q:'IoT M2M data SIM card',       buy:['amazon'],
  note:'A consumer SIM works and will be cancelled when the operator notices it in a device. An IoT SIM (Hologram, Soracom, Twilio, 1NCE) is priced per megabyte, roams across operators, and expects exactly this use. 1NCE sells 500 MB for ten years for about $11.' },
{ id:'ld2410', local:{se:{electrokit:'LD2410C'}},     name:'LD2410C 24 GHz mmWave presence sensor', cat:'Sensor', price:4.00, lo:2.5, hi:9, unit:'each', q:'LD2410C mmWave presence sensor', buy:['ali','amazon'],
  note:'Detects a STATIONARY person, which a PIR cannot - it sees the movement of breathing. The reason lights stop going off while you sit still.' },
{ id:'amg8833',    name:'AMG8833 8x8 thermal camera',        cat:'Sensor', price:22.00, lo:16, hi:40, unit:'each', q:'AMG8833 thermal camera 8x8', buy:['adafruit','ali','amazon'],
  note:'Sixty-four pixels, which sounds useless and is not - it reads real temperatures per pixel, which a visible camera cannot do at any resolution.' },
{ id:'ltr390', local:{se:{electrokit:'LTR390'}},     name:'LTR390 UV + ambient light sensor',  cat:'Sensor', price:4.50, lo:3,  hi:10, unit:'each', q:'LTR390 UV sensor I2C',       buy:['adafruit','ali','amazon'] },
{ id:'raingauge',  name:'Tipping-bucket rain gauge',         cat:'Sensor', price:14.00, lo:9, hi:35, unit:'each', q:'tipping bucket rain gauge reed switch', buy:['ali','amazon'],
  note:'A see-saw bucket and a reed switch. Each tip is a fixed volume - usually 0.2794 mm of rain - so the Arduino just counts pulses.' },
{ id:'anemometer', name:'Anemometer + wind vane set',        cat:'Sensor', price:28.00, lo:18, hi:70, unit:'set',  q:'anemometer wind vane reed switch set', buy:['ali','amazon'],
  note:'The cups close a reed switch once per revolution; the vane is a ring of eight reed switches and resistors giving a different resistance per direction.' },
{ id:'valve12v', local:{se:{electrokit:'12V solenoid'}},   name:'12 V solenoid water valve, 1/2 in', cat:'Motion', price:9.00, lo:6,  hi:22, unit:'each', q:'12V solenoid water valve 1/2 inch', buy:['ali','amazon'],
  note:'Normally-closed types shut when power is lost, which is what you want on a leak cutoff. Check whether yours is direct-acting - servo-assisted valves need a minimum water pressure to close.' },
{ id:'seg7-large', name:'Large 7-segment display, 1.8 in',   cat:'Display',price:2.50, lo:1.2, hi:7, unit:'each', q:'1.8 inch 7 segment display common cathode', buy:['ali','amazon'],
  note:'Readable across a room. Needs multiplexing or a driver - a single digit lit continuously is more current than a pin will give.' },
{ id:'mcp4725', local:{se:{electrokit:'MCP4725'}},    name:'MCP4725 12-bit I2C DAC',            cat:'Module', price:2.50, lo:1.5, hi:8, unit:'each', q:'MCP4725 DAC module I2C',     buy:['adafruit','ali','amazon'],
  note:'A real analogue output, not PWM. The difference matters when you are setting a control voltage rather than dimming something.' },
{ id:'lm358', local:{se:{electrokit:'LM358'}},      name:'LM358 dual op-amp (DIP-8)',         cat:'Passive',price:0.20, lo:0.1, hi:1, unit:'each', q:'LM358 dual op amp DIP8',     buy:['ali','amazon','digikey'] },
{ id:'gt2-belt',   name:'GT2 belt + pulleys + idlers',       cat:'Motion', price:9.00, lo:5,  hi:20, unit:'set',  q:'GT2 belt pulley idler set 6mm', buy:['ali','amazon'] },
{ id:'lin-rail',   name:'Linear rail + carriage, 400 mm',    cat:'Motion', price:22.00, lo:14, hi:45, unit:'each', q:'MGN12 linear rail 400mm carriage', buy:['ali','amazon'] },
{ id:'laser-mod',  name:'650 nm laser diode module, 5 mW',   cat:'Light',  price:1.20, lo:0.6, hi:4, unit:'each', q:'650nm laser module 5mW class 2', buy:['ali','amazon'],
  note:'Class 2 only - under 1 mW output, or 5 mW modules run well below their rating. Never buy the 100 mW "burning" modules for anything pointed at a person.' },
{ id:'photodiode', local:{se:{electrokit:'BPW34'}}, name:'Photodiode / phototransistor',      cat:'Sensor', price:0.20, lo:0.1, hi:1, unit:'each', q:'BPW34 photodiode',           buy:['ali','amazon','digikey'] },
{ id:'water-sens', name:'Water leak detection probe',        cat:'Sensor', price:1.50, lo:0.6, hi:5, unit:'each', q:'water leak sensor probe module', buy:['ali','amazon'],
  note:'Two exposed tracks that conduct when wet. Drive it from a pin and only power it while measuring, or the tracks corrode away in months.' },
{ id:'float-sw',   name:'Float switch, side or vertical',    cat:'Sensor', price:2.00, lo:1,  hi:6, unit:'each', q:'float switch water level sensor', buy:['ali','amazon'] },
{ id:'rotary-enc', name:'Rotary encoder with push button',   cat:'Module', price:0.80, lo:0.4, hi:3, unit:'each', q:'KY-040 rotary encoder module', buy:['ali','amazon'] },
{ id:'lora', local:{se:{electrokit:'SX1276'}},       name:'SX1276 LoRa module, 868/915 MHz',   cat:'Module', price:7.00, lo:5,   hi:20,  unit:'each', q:'SX1276 LoRa module 868MHz', buy:['ali','adafruit','amazon'] },
{ id:'hc05',       name:'HC-05 Bluetooth serial module',     cat:'Module', price:3.00, lo:2,   hi:10,  unit:'each', q:'HC-05 bluetooth module',    buy:['ali','amazon'] },
{ id:'rtc-cell', local:{se:{electrokit:'CR2032',kjell:'CR2032'}},   name:'CR2032 coin cell',                  cat:'Module', price:0.50, lo:0.2, hi:2,   unit:'each', q:'CR2032 battery',            buy:['amazon','ali'] },
{ id:'gps',        name:'NEO-6M GPS module + antenna',       cat:'Module', price:7.00, lo:5,   hi:20,  unit:'each', q:'NEO-6M GPS module antenna', buy:['ali','amazon'] },
{ id:'pcf8574', local:{se:{electrokit:'PCF8574'}},    name:'PCF8574 I2C port expander',         cat:'Module', price:0.80, lo:0.4, hi:4,   unit:'each', q:'PCF8574 I2C expander module', buy:['ali','amazon','adafruit'] },
{ id:'pca9685', local:{se:{electrokit:'PCA9685'}},    name:'PCA9685 16-channel servo driver',   cat:'Module', price:3.00, lo:2,   hi:16,  unit:'each', q:'PCA9685 16 channel servo driver', buy:['ali','amazon','adafruit'] },
{ id:'mic-max9814', local:{se:{electrokit:'MAX9814'}},name:'MAX9814 electret mic with AGC',     cat:'Module', price:3.00, lo:2,   hi:9,   unit:'each', q:'MAX9814 microphone module', buy:['ali','adafruit','amazon'] },
{ id:'mic-inmp441', local:{se:{electrokit:'INMP441'}},name:'INMP441 I2S digital microphone',    cat:'Module', price:3.00, lo:2,   hi:9,   unit:'each', q:'INMP441 I2S microphone',    buy:['ali','amazon'] },
{ id:'dfplayer',   name:'DFPlayer Mini MP3 module',          cat:'Module', price:2.00, lo:1.2, hi:8,   unit:'each', q:'DFPlayer Mini MP3 module',  buy:['ali','amazon'] },
{ id:'keypad4x4',  name:'4x4 membrane matrix keypad',        cat:'Module', price:1.20, lo:0.6, hi:5,   unit:'each', q:'4x4 membrane keypad arduino', buy:['ali','amazon','adafruit'] },
{ id:'esp01',      name:'ESP-01S Wi-Fi module + adapter',    cat:'Module', price:2.50, lo:1.5, hi:8,   unit:'set',  q:'ESP-01S wifi module adapter', buy:['ali','amazon'] },

{ id:'ftdi', local:{se:{electrokit:'CP2102'}},       name:'USB-to-serial adapter (CP2102/FTDI)',cat:'Module',price:2.00,lo:1.2, hi:16,  unit:'each', q:'CP2102 USB to TTL serial adapter', buy:['ali','amazon','adafruit'],
  note:'Get one with a 3.3 V / 5 V selector jumper. It is how you talk to bare ESP modules and rescue boards with a broken bootloader.' },
{ id:'linesensor', local:{se:{electrokit:'TCRT5000'}}, name:'3-channel IR line-follow sensor',   cat:'Sensor', price:2.00, lo:1,   hi:7,   unit:'each', q:'TCRT5000 3 channel line tracking sensor', buy:['ali','amazon'] },
{ id:'sct013',     name:'SCT-013-030 clamp current sensor',  cat:'Sensor', price:9.00, lo:6,   hi:22,  unit:'each', q:'SCT-013-030 current transformer clamp', buy:['ali','amazon'],
  note:'Clamps around ONE live conductor without touching it, so nothing you build ever contacts mains. Get the -030 version, which outputs 1 V and needs no burden resistor.' },
{ id:'pam8403', local:{se:{electrokit:'PAM8403'}},    name:'PAM8403 3 W stereo amplifier',      cat:'Module', price:1.00, lo:0.5, hi:4,   unit:'each', q:'PAM8403 amplifier module', buy:['ali','amazon'] },
{ id:'mirror-kit', name:'One-way mirror film + acrylic sheet',cat:'Misc',  price:12.00,lo:7,   hi:30,  unit:'set',  q:'one way mirror film acrylic sheet', buy:['amazon','ali'] },
{ id:'photoframe', name:'Deep box picture frame, 20 cm',     cat:'Misc',   price:9.00, lo:5,   hi:22,  unit:'each', q:'deep shadow box picture frame 20cm', buy:['amazon'] },
{ id:'pantilt',    name:'Pan-tilt bracket for 2 servos',     cat:'Misc',   price:3.00, lo:1.5, hi:9,   unit:'each', q:'pan tilt bracket SG90', buy:['ali','amazon'] },
{ id:'usb-meter', local:{se:{electrokit:'usb mätare'}},  name:'USB voltage/current meter',         cat:'Tool',   price:9.00, lo:5,   hi:30,  unit:'each', q:'USB voltage current tester meter', buy:['amazon','ali'],
  note:'The fastest way to find out whether a brownout is really a brownout.' },

/* --- tools -------------------------------------------------------------- */
{ id:'iron', local:{se:{electrokit:'lödstation',kjell:'lödstation'}},       name:'Temperature-controlled soldering iron',cat:'Tool',price:45.00,lo:25,  hi:140, unit:'each', q:'temperature controlled soldering station', buy:['amazon','ali','adafruit'],
  note:'The single best money you will spend. A fixed-temperature $8 iron is the reason most beginners think they are bad at soldering. Pinecil, TS101, Hakko FX-888D or a Yihua 937D all work.' },
{ id:'solder', local:{se:{electrokit:'lödtenn',kjell:'lödtenn'}},     name:'Solder, 0.8 mm rosin-core 60/40',   cat:'Tool',   price:12.00,lo:8,   hi:30,  unit:'100 g', q:'0.8mm rosin core solder 60/40', buy:['amazon','ali','adafruit'],
  note:'Leaded 60/40 melts lower and flows better, which matters enormously when you are learning. Lead-free is the grown-up choice - either way, wash your hands and ventilate.' },
{ id:'sponge', local:{se:{electrokit:'lödspetsrengörare'}},     name:'Brass tip cleaner',                 cat:'Tool',   price:6.00, lo:3,   hi:14,  unit:'each', q:'brass wire soldering tip cleaner', buy:['amazon','ali'] },
{ id:'flux', local:{se:{electrokit:'flussmedel'}},       name:'Rosin flux pen or paste',           cat:'Tool',   price:8.00, lo:4,   hi:18,  unit:'each', q:'rosin flux pen electronics',buy:['amazon','ali','adafruit'] },
{ id:'wick', local:{se:{electrokit:'lödfläta',kjell:'lödfläta'}},       name:'Desoldering braid, 2 mm',           cat:'Tool',   price:5.00, lo:3,   hi:12,  unit:'each', q:'desoldering wick braid 2mm',buy:['amazon','ali'] },
{ id:'sucker', local:{se:{kjell:'lödsug'}},     name:'Solder sucker (desoldering pump)',  cat:'Tool',   price:8.00, lo:4,   hi:20,  unit:'each', q:'solder sucker desoldering pump', buy:['amazon','ali'] },
{ id:'cutters', local:{se:{electrokit:'avbitare',kjell:'avbitartång'}},    name:'Flush cutters',                     cat:'Tool',   price:9.00, lo:5,   hi:25,  unit:'each', q:'flush cutters electronics',buy:['amazon','adafruit','ali'] },
{ id:'strippers', local:{se:{kjell:'avisoleringstång'}},  name:'Wire strippers',                    cat:'Tool',   price:12.00,lo:7,   hi:30,  unit:'each', q:'wire strippers 30-20 awg', buy:['amazon','adafruit','ali'] },
{ id:'dmm', local:{se:{electrokit:'digital multimeter',kjell:'multimeter'}},        name:'Digital multimeter with continuity',cat:'Tool',   price:25.00,lo:12,  hi:120, unit:'each', q:'digital multimeter continuity', buy:['amazon','ali'],
  note:'The continuity beeper is the feature you will use most. Everything else is a bonus.' },
{ id:'helping', local:{se:{electrokit:'hjälpande hand'}},    name:'Helping hands / PCB vice',          cat:'Tool',   price:14.00,lo:7,   hi:45,  unit:'each', q:'helping hands soldering pcb holder', buy:['amazon','ali','adafruit'] },
{ id:'heatshrink', local:{se:{electrokit:'krympslang',kjell:'krympslang'}}, name:'Heat-shrink tubing assortment',     cat:'Tool',   price:8.00, lo:4,   hi:18,  unit:'kit',  q:'heat shrink tubing assortment kit', buy:['amazon','ali'] },
{ id:'hookup', local:{se:{electrokit:'kopplingstråd'}},     name:'Solid-core hookup wire, 22 AWG',    cat:'Tool',   price:12.00,lo:7,   hi:26,  unit:'6 colours', q:'22 awg solid core hookup wire kit', buy:['amazon','adafruit','ali'] },
{ id:'fan-fume', local:{se:{electrokit:'lödrök fläkt'}},   name:'Fume extractor fan',                cat:'Tool',   price:15.00,lo:8,   hi:60,  unit:'each', q:'solder fume extractor',     buy:['amazon','ali'] },
{ id:'glasses', local:{se:{electrokit:'skyddsglasögon',kjell:'skyddsglasögon'}},    name:'Safety glasses',                    cat:'Tool',   price:6.00, lo:3,   hi:16,  unit:'each', q:'safety glasses clear',      buy:['amazon','ali'],
  note:'Clipped component legs travel fast and eyes do not grow back. Wear them while you cut.' },

/* --- enclosure / misc --------------------------------------------------- */
{ id:'box-abs', local:{se:{electrokit:'kapsling'}},    name:'ABS project box, 100x68x50 mm',     cat:'Misc',   price:3.00, lo:1.5, hi:9,   unit:'each', q:'ABS project enclosure box 100x68', buy:['ali','amazon'] },
{ id:'box-ip65',   name:'IP65 weatherproof enclosure',       cat:'Misc',   price:7.00, lo:4,   hi:20,  unit:'each', q:'IP65 waterproof junction box', buy:['ali','amazon'] },
{ id:'standoffs', local:{se:{electrokit:'distans m3'}},  name:'M3 nylon standoff + screw kit',     cat:'Misc',   price:6.00, lo:3,   hi:14,  unit:'kit',  q:'M3 nylon standoff screw kit',buy:['ali','amazon'] },
{ id:'tape',       name:'Double-sided foam tape',            cat:'Misc',   price:4.00, lo:2,   hi:9,   unit:'roll', q:'double sided foam mounting tape', buy:['amazon','ali'] },
{ id:'zip', local:{se:{electrokit:'buntband',kjell:'buntband'}},        name:'Cable ties, assorted',              cat:'Misc',   price:4.00, lo:2,   hi:9,   unit:'pack', q:'cable ties assorted',       buy:['amazon','ali'] },
{ id:'tripod',     name:'Mini tripod / gooseneck mount',     cat:'Misc',   price:8.00, lo:4,   hi:20,  unit:'each', q:'mini tripod flexible',      buy:['amazon','ali'] },
{ id:'tubing', local:{se:{electrokit:'silikonslang'}},     name:'6 mm silicone tubing, 2 m',         cat:'Misc',   price:3.00, lo:1.5, hi:8,   unit:'each', q:'6mm silicone tubing',       buy:['ali','amazon'] },
{ id:'magnet', local:{se:{electrokit:'neodym magnet'}},     name:'Neodymium magnets, 6 mm',           cat:'Misc',   price:5.00, lo:3,   hi:12,  unit:'pack', q:'6mm neodymium magnets',     buy:['amazon','ali'] }
];

AB.partIndex = AB.parts.reduce(function (m, p) { m[p.id] = p; return m; }, {});
