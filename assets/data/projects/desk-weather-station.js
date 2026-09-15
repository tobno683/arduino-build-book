/* Desk weather station - DHT22 + SSD1306 OLED on an Uno. */
AB.addProject({
slug: 'desk-weather-station',
title: 'Desk weather station',
cat: 'environment',
level: 1,
time: '45 minutes',
solder: false,
board: 'Uno',
feature: true,
tags: ['dht22', 'oled', 'i2c', 'temperature', 'humidity', 'first project', 'no soldering'],
blurb: 'Temperature, humidity and dew point on a little OLED, with a running high and low. The classic first build, done properly.',

skills: ['I2C', 'One-wire sensors', 'Breadboard power rails', 'millis() timing', 'Libraries'],

intro: `
<p>This is the project almost everybody builds first, and almost every version of it online stops at
"prints the temperature to the Serial Monitor". That is not a thing you can put on a desk. This one has a
screen, it tracks the highest and lowest reading since you plugged it in, it works out the dew point, and it
tells you in one word whether the room is actually comfortable.</p>
<p>It is also the cheapest possible way to learn the three things every later project depends on: how to share
one 5&nbsp;V pin between several modules, how to talk to a chip over I2C, and how to do something every two
seconds without using <code>delay()</code> and freezing everything else.</p>`,

what: [
  'Show temperature in &deg;C (one line change for &deg;F), humidity as a percentage and a little bar, and the dew point.',
  'Remember the highest and lowest temperature since it was switched on, and show both.',
  'Say <em>Dry</em>, <em>Comfortable</em>, <em>Humid</em> or <em>Muggy</em> based on where the dew point sits.',
  'Update twice a second on screen while only bothering the sensor every two seconds, which is all it can manage.',
  'Run off a USB phone charger forever, with no computer attached.'
],

how: `
<p>Three chips, two completely different ways of talking.</p>
<p><strong>The DHT22</strong> measures temperature and humidity and reports them over a single wire using a
protocol it invented for itself. You pull the line low for a moment to ask, and it answers with a train of
pulses whose <em>widths</em> encode 40 bits: 16 for humidity, 16 for temperature, 8 for a checksum. Decoding
that by hand is miserable, so the DHT library does it for you. What you need to know is that the exchange
takes about 25&nbsp;milliseconds, during which the Arduino can do nothing else, and that the sensor refuses to
be asked more often than once every two seconds.</p>
<p><strong>The OLED</strong> is 128&times;64 individual organic LEDs with an SSD1306 controller in front of
them, and it speaks I2C - two wires, <code>SDA</code> for data and <code>SCL</code> for a clock, shared by
every I2C device on the bus. Each device has an address; this screen is almost always
<code>0x3C</code>. You do not draw to the glass directly: you draw into a 1&nbsp;KB buffer in the Arduino's
RAM and then call <code>display()</code> to shove the whole buffer across. On an Uno with 2&nbsp;KB of RAM
total, that buffer is half your memory, which is the real reason this project uses an OLED and not something
bigger.</p>
<p><strong>The breadboard</strong> is doing one job here: turning the Uno's single 5&nbsp;V pin into as many
5&nbsp;V pins as you need. The two long strips down each edge - the power rails - are each one continuous
piece of metal, so a wire into any hole in the red strip comes out of every other hole in that strip.</p>`,

bom: [
  { id: 'uno', qty: 1, note: 'Any Uno, official or clone. A Nano works too - the pin names are identical.' },
  { id: 'dht22', qty: 1, note: 'The 3-pin breakout version, not the bare 4-pin sensor. The breakout has the pull-up resistor already on it.' },
  { id: 'oled13', qty: 1, note: 'The 0.96 inch, 4-pin, I2C one. Not the 7-pin SPI version - that needs different wiring and a different sketch.' },
  { id: 'bb-830', qty: 1 },
  { id: 'jumpers', qty: 1, own: true, note: 'You need 11 male-to-male and male-to-female jumpers. Buy the 120-piece box once.' },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [
  { id: 'dmm', why: 'Not required, but the continuity beeper settles arguments about whether a jumper is actually making contact.' }
],

bomNote: `<p>Total for the parts that are specific to this build: about <strong>$15</strong>. If you buy a
"37-in-1 sensor kit" instead, you get a DHT11 rather than a DHT22 - worse in every way that matters here -
so buy the sensor separately.</p>`,

build: {
  parts: [
    { id: 'uno',  comp: 'uno',    at: [0, 72] },
    { id: 'bb',   comp: 'bb830',  at: [0, 0] },
    { id: 'dht',  comp: 'dht22',  at: [-46, -52], ry: 180 },
    { id: 'oled', comp: 'oled13', at: [26, -54], ry: 180 }
  ],
  wires: [
    { from: 'uno.5V',   to: 'bb.B+1',  color: 'red',    note: '5 V from the board onto the lower red rail' },
    { from: 'uno.GND1', to: 'bb.B-1',  color: 'black',  note: 'Ground onto the lower blue rail' },
    { from: 'bb.B+10',  to: 'bb.T+10', color: 'red',    note: 'Bridge: the two red rails are NOT joined inside the board' },
    { from: 'bb.B-10',  to: 'bb.T-10', color: 'black',  note: 'Bridge for the two blue rails, same reason' },
    { from: 'dht.VCC',  to: 'bb.T+3',  color: 'red',    note: 'Sensor power' },
    { from: 'dht.GND',  to: 'bb.T-3',  color: 'black',  note: 'Sensor ground' },
    { from: 'dht.DATA', to: 'uno.D2',  color: 'yellow', note: 'The single-wire data line the DHT protocol runs on' },
    { from: 'oled.VCC', to: 'bb.T+8',  color: 'red',    note: 'Screen power' },
    { from: 'oled.GND', to: 'bb.T-8',  color: 'black',  note: 'Screen ground' },
    { from: 'oled.SDA', to: 'uno.A4',  color: 'blue',   note: 'I2C data. On an Uno, SDA and A4 are the same pin' },
    { from: 'oled.SCL', to: 'uno.A5',  color: 'green',  note: 'I2C clock. On an Uno, SCL and A5 are the same pin' }
  ]
},

wireIntro: `<p>Eleven wires. Do them in the order below - power first, then ground, then signals - and check
each one off as you go. Getting into that habit now will save you an evening later.</p>`,

wireNotes: `
<div class="note warn"><span class="t">The two bridges are not optional</span>
<p>A full-size breadboard has <em>four</em> power rails, not two: the pair along the top edge and the pair
along the bottom edge are separate strips of metal with no connection between them. Beginners wire 5&nbsp;V to
the bottom rail, plug the sensor into the top rail, and then spend an hour wondering why nothing powers up.
The two bridge wires in rows 10 join them.</p>
<p>Some cheap breadboards also break each rail in the middle, at the gap in the printed line. If your rails
have a visible break halfway along, you need a bridge across that too - or just keep everything to one half.</p></div>

<div class="note"><span class="t">Check the OLED pin order before you wire it</span>
<p>Most 0.96&nbsp;inch I2C OLEDs are labelled <code>GND VCC SCL SDA</code> in that order, which is what the
model above shows. A significant minority are <code>VCC GND SCL SDA</code>. The silkscreen on your board is
the authority, not this page. Getting VCC and GND the wrong way round usually just means the screen stays
dark, but it can kill the module, so read the print.</p></div>

<div class="note tip"><span class="t">Why A4 and A5</span>
<p>On an Uno, the I2C hardware is physically wired to pins A4 and A5. You cannot move it. There are also pins
marked SDA and SCL up by AREF on a Rev3 board - those are the <em>same two pins</em>, brought out twice for
shield makers. Use either pair; do not use both.</p></div>`,

solderIntro: `<p>This build needs no soldering at all - that is the point of a breadboard. The steps below
are for when you have had it running for a week and want it to stop falling apart every time you move the
desk.</p>`,

solderSteps: [
  { h: 'Optional: move it onto perfboard',
    body: `<p>Buy a 5&times;7&nbsp;cm perfboard and a strip of female headers. Cut two 4-pin lengths of female
    header (score between the pins with a knife and snap). Those become sockets for the sensor and the screen,
    so both stay removable.</p>
    <p>Push the header legs through the board from the top. Flip the board over onto the bench - the weight of
    the header holds it in place while you work.</p>` },
  { h: 'Tack one pin at each end first',
    body: `<p>Heat the pad and the pin together for two seconds with the iron at 340&nbsp;&deg;C, feed in about
    2&nbsp;mm of solder, count one second, pull the solder away, then the iron. Do the same at the far end of
    the strip.</p>
    <p>Now turn it over and look: if the plastic is not flat against the board, reheat one of the two joints
    and press the header down with a fingernail. It is much easier to fix now than after all eight pins are
    done.</p>` },
  { h: 'Fill in the rest',
    body: `<p>Do the remaining pins the same way. A finished joint should look like a tiny shiny volcano
    climbing about a third of the way up the pin - not a ball sitting on top, which means the pad was cold.</p>` },
  { h: 'Run the power rails in solid wire',
    body: `<p>Strip 22&nbsp;AWG solid core, bend it flat along the board, and solder it into the holes that need
    5&nbsp;V and ground. Solid core stays where you bend it, which is exactly why it is worth having on the
    shelf. Keep red for 5&nbsp;V and black for ground even here, where nobody is watching.</p>` },
  { h: 'Buzz it out before you power it',
    body: `<p>Multimeter on continuity. Touch one probe to the 5&nbsp;V pad and the other to every pin that
    should be 5&nbsp;V - beep each time. Then the killer test: probe 5&nbsp;V and ground. <strong>Silence.</strong>
    If that beeps, you have a bridge somewhere; find it before you plug in USB.</p>` }
],

assembly: [
  { h: 'Put the breadboard and the Uno side by side',
    body: `<p>Most breadboards have a sticky pad on the back. Stick the board and the Uno down onto a scrap of
    wood or a bit of stiff card, about 15&nbsp;mm apart, with the breadboard's power rails on the side facing
    the Uno. A build that cannot slide around is a build that stays wired up.</p>` },
  { h: 'Wire the power rails, and only the power rails',
    body: `<p>Uno <span class="pin">5V</span> to a red rail hole. Uno <span class="pin">GND</span> to a blue
    rail hole. Then the two bridge wires that join the top rails to the bottom ones. Four wires. Stop.</p>
    <p>Plug in the USB. The Uno's green <span class="pin">ON</span> LED should light and nothing should get warm.
    Unplug again. You have just proved your power distribution works before anything expensive is attached
    to it - do this on every project you ever build.</p>` },
  { h: 'Add the DHT22',
    body: `<p>With USB unplugged, run the sensor's <span class="pin">VCC</span> to a red rail hole,
    <span class="pin">GND</span> to a blue one, and <span class="pin">DATA</span> to Uno pin
    <span class="pin">D2</span>.</p>
    <p>The grille must face into open air. Do not tuck it under the breadboard, do not point it at your laptop
    fan, and do not breathe on it while reading - you will watch the humidity shoot to 99%, which is entertaining
    once and then annoying.</p>` },
  { h: 'Add the OLED',
    body: `<p><span class="pin">VCC</span> and <span class="pin">GND</span> to the rails,
    <span class="pin">SDA</span> to <span class="pin">A4</span>, <span class="pin">SCL</span> to
    <span class="pin">A5</span>. These modules run happily from 5&nbsp;V even though the panel itself is a
    3.3&nbsp;V part; the regulator is on the little board.</p>` },
  { h: 'Look at it before you power it',
    body: `<p>Trace each of the eleven wires with a finger, against the table above, and say the pin names out
    loud. Then check nothing is in the wrong hole by one row - the single most common wiring fault there is.
    Now plug in the USB.</p>` }
],

libraries: [
  { name: 'DHT sensor library', by: 'Adafruit', why: 'Decodes the DHT22 pulse train into two floats.' },
  { name: 'Adafruit Unified Sensor', by: 'Adafruit', why: 'A dependency of the one above. The IDE will offer to install it for you - say yes.' },
  { name: 'Adafruit SSD1306', by: 'Adafruit', why: 'Talks to the screen controller and keeps the frame buffer.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Draws text, lines and rectangles into that buffer. Also pulled in as a dependency.' }
],

code: [
{
  h: 'First, prove the screen is alive',
  intro: `<p>Before the real sketch, run this. It walks every I2C address and prints what answers. If your
  screen is wired correctly you will see <code>0x3C</code> (or, less often, <code>0x3D</code>). If you see
  nothing at all, the fault is in the wiring, not the code, and the main sketch would only have told you
  "SSD1306 allocation failed" without saying why.</p>`,
  name: 'i2c_scanner.ino',
  code: `// Finds every I2C device on the bus and prints its address.
// Tools > Serial Monitor, set to 9600 baud.

#include <Wire.h>

void setup() {
  Serial.begin(9600);
  while (!Serial) { ; }          // only matters on native-USB boards
  Wire.begin();
  Serial.println(F("Scanning I2C bus..."));

  byte found = 0;
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    byte error = Wire.endTransmission();

    if (error == 0) {
      Serial.print(F("  device at 0x"));
      if (address < 16) Serial.print('0');
      Serial.println(address, HEX);
      found++;
    }
  }

  if (found == 0) {
    Serial.println(F("Nothing answered. Check SDA on A4, SCL on A5, and power."));
  } else {
    Serial.print(F("Done. "));
    Serial.print(found);
    Serial.println(F(" device(s)."));
  }
}

void loop() { }`,
  after: `<p>Whatever address it prints is what goes in the main sketch, on the line marked
  <code>OLED_ADDR</code>.</p>`
},
{
  h: 'The weather station itself',
  intro: `<p>Copy the whole thing. The only lines you might want to change are the four in the settings block
  at the top.</p>`,
  name: 'desk_weather_station.ino',
  code: `/* ------------------------------------------------------------------
   Desk weather station
   DHT22 on D2, SSD1306 128x64 OLED on the I2C bus (A4/A5 on an Uno).

   Shows temperature, humidity with a bar, dew point, a comfort verdict,
   and the highest/lowest temperature seen since power-on.
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// ---- settings you might want to change --------------------------------
#define DHT_PIN      2        // the sensor's DATA wire
#define DHT_TYPE     DHT22    // change to DHT11 if that is what you bought
#define OLED_ADDR    0x3C     // whatever the I2C scanner printed
#define USE_FAHRENHEIT false  // true for degrees F
// -----------------------------------------------------------------------

#define SCREEN_W 128
#define SCREEN_H 64
#define OLED_RESET -1         // these modules have no reset pin

Adafruit_SSD1306 display(SCREEN_W, SCREEN_H, &Wire, OLED_RESET);
DHT dht(DHT_PIN, DHT_TYPE);

// The DHT22 will not be read more often than every 2 seconds.
const unsigned long READ_EVERY = 2000UL;
unsigned long lastRead = 0;

float tempC   = NAN;
float humid   = NAN;
float tMinC   =  999.0;
float tMaxC   = -999.0;
bool  haveData = false;

void setup() {
  Serial.begin(9600);
  dht.begin();

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("No screen at that address - run the I2C scanner."));
    for (;;) { }              // nothing else useful to do
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(16, 26);
  display.println(F("warming up..."));
  display.display();

  lastRead = millis() - READ_EVERY;   // take the first reading straight away
}

void loop() {
  // --- read the sensor, but only when it is allowed --------------------
  if (millis() - lastRead >= READ_EVERY) {
    lastRead = millis();

    float h = dht.readHumidity();
    float t = dht.readTemperature();   // always celsius from the library

    if (isnan(h) || isnan(t)) {
      Serial.println(F("DHT read failed"));
    } else {
      humid = h;
      tempC = t;
      haveData = true;
      if (t < tMinC) tMinC = t;
      if (t > tMaxC) tMaxC = t;

      Serial.print(t); Serial.print(F(" C  "));
      Serial.print(h); Serial.println(F(" %"));
    }
  }

  drawScreen();
  delay(120);                 // ~8 redraws a second is plenty
}

/* Magnus formula. Below this temperature, water condenses out of the air -
   which is what actually makes a room feel clammy, far more than humidity. */
float dewPointC(float t, float rh) {
  const float a = 17.62, b = 243.12;
  float gamma = (a * t) / (b + t) + log(rh / 100.0);
  return (b * gamma) / (a - gamma);
}

const __FlashStringHelper* verdict(float dp) {
  if (dp < 10) return F("DRY");
  if (dp < 16) return F("COMFORTABLE");
  if (dp < 19) return F("HUMID");
  return F("MUGGY");
}

float toDisplay(float c) {
  return USE_FAHRENHEIT ? (c * 9.0 / 5.0 + 32.0) : c;
}

void drawScreen() {
  display.clearDisplay();

  if (!haveData) {
    display.setTextSize(1);
    display.setCursor(16, 26);
    display.print(F("warming up..."));
    display.display();
    return;
  }

  // --- big temperature across the top ---------------------------------
  display.setTextSize(3);
  display.setCursor(0, 0);
  display.print(toDisplay(tempC), 1);
  display.setTextSize(1);
  display.print(USE_FAHRENHEIT ? F("F") : F("C"));

  // --- min / max stacked on the right ---------------------------------
  display.setTextSize(1);
  display.setCursor(86, 2);
  display.print(F("hi "));
  display.print(toDisplay(tMaxC), 1);
  display.setCursor(86, 12);
  display.print(F("lo "));
  display.print(toDisplay(tMinC), 1);

  // --- humidity number and bar ----------------------------------------
  display.setCursor(0, 28);
  display.print(F("RH "));
  display.print(humid, 0);
  display.print(F("%"));

  display.drawRect(38, 27, 90, 9, SSD1306_WHITE);
  int fill = (int)(humid * 0.86);        // 0-100 % -> 0-86 px
  display.fillRect(40, 29, fill, 5, SSD1306_WHITE);

  // --- dew point and the verdict --------------------------------------
  float dp = dewPointC(tempC, humid);
  display.setCursor(0, 42);
  display.print(F("dew "));
  display.print(toDisplay(dp), 1);
  display.print(USE_FAHRENHEIT ? F("F") : F("C"));

  display.setCursor(0, 54);
  display.print(verdict(dp));

  display.display();
}`,
  after: `<p>A few things in there are worth knowing about, because they come back in every later project:</p>
  <ul>
    <li><code>millis() - lastRead >= READ_EVERY</code> is the standard Arduino way to do something on a
    schedule without stopping. <code>delay(2000)</code> would work here and then bite you the moment you add a
    button, because the board would be asleep for two seconds out of every two.</li>
    <li><code>F("text")</code> keeps string literals in flash instead of copying them into RAM at startup.
    On a board with 2&nbsp;KB of RAM and a 1&nbsp;KB screen buffer, that is the difference between working and
    mysteriously crashing.</li>
    <li><code>isnan()</code> catches failed reads. The DHT22 drops a reading now and then; the fix is to keep
    the last good one, not to panic.</li>
  </ul>`
}],

upload: `
<ol>
  <li>Plug the Uno in. <strong>Tools &rarr; Board</strong> &rarr; Arduino Uno.</li>
  <li><strong>Tools &rarr; Port</strong> &rarr; pick the one that appears and disappears when you unplug the
  board. On Windows it is a <code>COM</code> number; on a Mac, <code>/dev/cu.usbmodem&hellip;</code>.</li>
  <li>Press the arrow to upload. The two LEDs by the USB jack should flicker for a second or two.</li>
  <li>The screen shows <em>warming up&hellip;</em>, then real numbers within about two seconds.</li>
</ol>
<div class="note warn"><span class="t">If the upload fails on a clone</span>
<p>Clones use a CH340 USB chip instead of the official ATmega16U2 and need its driver installed before the
port appears at all. If <strong>Tools &rarr; Port</strong> is empty or greyed out, that is almost always why.
Search "CH340 driver" for your operating system, install, replug.</p></div>`,

tune: [
  { h: 'Let it settle for ten minutes',
    body: `<p>A DHT22 straight out of the bag reads high on humidity for the first few minutes while it
    equalises with the room. Do not judge its accuracy in the first ten minutes.</p>` },
  { h: 'Check it against something you trust',
    body: `<p>Put it next to any other thermometer for half an hour. A DHT22 is specified at
    &plusmn;0.5&nbsp;&deg;C and &plusmn;2-5&nbsp;% RH, so a degree of disagreement is normal and not a fault.</p>
    <p>If it reads consistently high by the same amount, the usual culprit is self-heating: the sensor is too
    close to the Uno's regulator, or resting on the USB cable. Move it 5&nbsp;cm away on longer wires and the
    error usually vanishes.</p>` },
  { h: 'Add an offset only if you must',
    body: `<p>If you are certain it is off by a fixed amount, put <code>tempC = t - 0.4;</code> in place of
    <code>tempC = t;</code>. Write down why you did it in a comment, or in six months you will find the line
    and have no idea.</p>` },
  { h: 'Make it readable across the room',
    body: `<p><code>display.setTextSize(3)</code> is the big number. Size 4 is as large as 128&times;64 will
    take for a two-digit number with a decimal - if you go that way, drop the min/max line to make room.</p>` }
],

trouble: [
  { q: 'Screen completely black, sketch seems to run',
    a: `Ninety per cent of the time this is the I2C address. Run the scanner sketch. If it prints
    <code>0x3D</code>, change <code>OLED_ADDR</code>. If it prints nothing, SDA and SCL are swapped, or the
    screen has no power - measure 5&nbsp;V between its VCC and GND pins.` },
  { q: '"SSD1306 allocation failed" in the Serial Monitor',
    a: `The library could not get its 1&nbsp;KB buffer, or the screen did not answer. On an Uno it is almost
    always the second one - same fix as above. If you have added a lot of your own variables, it really can be
    RAM; the IDE prints how much is left after each compile.` },
  { q: 'Temperature reads but humidity is always 0, or both are nan',
    a: `You have a DHT11 and the sketch says DHT22, or the other way round. Change <code>DHT_TYPE</code>. If
    that is right, check the DATA wire is on D2 and not D3, and that the sensor has 5&nbsp;V.` },
  { q: 'Readings freeze after a few minutes',
    a: `Usually a marginal jumper wire on the DATA line. Wiggle each wire with the thing running and watch
    the screen; the one that makes it flicker is the one to reseat. Cheap dupont wires do fail - a loose crimp
    inside the plastic shell is invisible from outside.` },
  { q: 'Humidity pinned at 99.9 %',
    a: `Condensation on the sensor, or you breathed on it. Leave it in a dry room for an hour. If it stays
    there for a day, the sensor is dead - they do not like being stored in a damp shed.` },
  { q: 'Everything works on USB but not on a phone charger',
    a: `Some chargers need the data pins shorted to identify themselves and will not supply current to a
    "dumb" device. Try a different charger, or a USB power bank that is known to work with small loads.` },
  { q: 'Screen shows a scrambled band of pixels',
    a: `You have an SH1106 panel (usually the 1.3&nbsp;inch one), not an SSD1306. It has 132 columns internally,
    so an SSD1306 driver draws everything two pixels off. Install the <code>Adafruit_SH110X</code> library and
    swap <code>Adafruit_SSD1306</code> for <code>Adafruit_SH1106G</code>.` }
],

next: `
<ul>
  <li><strong>Log it.</strong> Add a micro SD module and write one CSV line a minute. A week of data will show
  you your heating schedule, when you cook, and exactly when somebody opens a window.</li>
  <li><strong>Put it on the network.</strong> Swap the Uno for an ESP32 (the sketch changes by about four lines)
  and push readings to Home Assistant or a chart.</li>
  <li><strong>Add pressure.</strong> A BME280 is another two wires on the same I2C bus and gives you barometric
  pressure, which is what actually lets you forecast the next six hours.</li>
  <li><strong>Make it do something.</strong> Add a relay and a small fan or dehumidifier and switch it when the
  dew point goes over 16&nbsp;&deg;C. That is a real appliance.</li>
</ul>`
});
