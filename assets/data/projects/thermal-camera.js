/* AMG8833: 64 pixels that measure temperature, which no visible camera can. */
AB.addProject({
slug: 'thermal-camera',
title: 'Thermal camera',
cat: 'camera',
level: 2,
time: '3 hours',
solder: false,
board: 'ESP32',
tags: ['thermal', 'amg8833', 'infrared', 'interpolation', 'heat loss', 'no soldering', 'tft'],
blurb: 'Sixty-four pixels, which sounds useless until you point it at a wall and see exactly where the heat is escaping. It measures temperature per pixel, which a megapixel camera never will.',

skills: ['Thermopile arrays', 'Bicubic interpolation', 'False-colour mapping', 'Emissivity', 'Auto-ranging displays'],

intro: `
<p>An 8x8 thermal sensor produces an image with fewer pixels than a chess board. It also tells you that the
top-left corner of the window frame is 4&nbsp;&deg;C colder than the wall beside it, which is a thing no
amount of visible-light resolution can do.</p>
<p>That is the trade with thermal imaging: resolution is the expensive part - a 160x120 core is still several
hundred dollars - and for finding draughts, an overheating connector, underfloor heating pipes or a blocked
radiator, 64 measured temperatures beats a million estimated colours.</p>
<p>Interpolating those 64 values up to a smooth 32x32 image makes it genuinely readable, and that
interpolation is the interesting piece of code in the project.</p>`,

what: [
  'Show a live false-colour thermal image, interpolated from 8x8 up to something readable.',
  'Report the hottest and coldest pixel in the frame, in degrees, with a crosshair on each.',
  'Auto-range the colour scale, so a 2 degree spread across a wall is as visible as a 40 degree one on a kettle.',
  'Lock the range, so you can compare two walls rather than two auto-scaled images.',
  'Find draughts, heat loss, overloaded connections and blocked radiators.',
  'Understand emissivity, which is why a shiny surface reads wrong.'
],

how: `
<p><strong>What the sensor actually is.</strong> An 8x8 grid of thermopiles - tiny thermocouple stacks that
generate a voltage from absorbed infrared. Each one has a lens element focusing a small cone of the scene onto
it, so each "pixel" is an average temperature over roughly 7.5 degrees of field.</p>
<p>The AMG8833 reads -20 to +80&nbsp;&deg;C with about &plusmn;2.5&nbsp;&deg;C absolute accuracy and much
better relative accuracy - which is the useful property. It is poor at telling you a wall is exactly
18.4&nbsp;&deg;C and good at telling you this bit is three degrees colder than that bit.</p>

<p><strong>Interpolation is what makes it usable.</strong> Eight by eight displayed as 64 squares is
unreadable. The same data interpolated to 32x32 with bicubic weighting looks like a thermal image.</p>
<p>It is important to be clear that this invents nothing - the information content is identical, and the
interpolation is presentation. A hot spot smaller than one sensor pixel will be smeared across several output
pixels and its peak temperature will read low. That is a real limitation and the reason the min/max readout
uses the <em>raw</em> values rather than the interpolated ones.</p>

<p><strong>Auto-ranging, and why you need to be able to turn it off.</strong> Map the coldest pixel to blue
and the hottest to red and any scene looks dramatic - including a perfectly uniform wall where the spread is
0.3&nbsp;&deg;C of noise.</p>
<p>So the display shows the actual range in degrees alongside the image, and a button locks it. Locked, you
can pan across a room and compare - which is what you want when hunting a draught.</p>

<p><strong>Emissivity, which trips everyone up once.</strong> A thermopile measures emitted infrared and
converts it to temperature assuming the surface radiates like a matt black body. Most building materials,
paint, skin and wood are close enough (emissivity 0.9-0.95).</p>
<p><strong>Shiny metal is not.</strong> Polished aluminium has an emissivity around 0.05 - it emits almost
nothing and reflects the room instead. Point this at a radiator's chrome valve and it will read cold, and
point it at a shiny kettle and you will see yourself. A strip of matt tape on the surface solves it and is
what thermographers actually do.</p>`,

bom: [
  { id: 'amg8833', qty: 1, note: 'The 8x8 Panasonic Grid-EYE on a breakout. The MLX90640 is 32x24 for about three times the price and is a genuinely better sensor if you want to spend it.' },
  { id: 'esp32', qty: 1, note: 'Enough RAM for the interpolation buffer, which an Uno does not have.' },
  { id: 'tft18', qty: 1, note: '1.8 inch 160x128 SPI. Big enough to read, cheap, and fast over SPI.' },
  { id: 'button', qty: 2, note: 'Lock the range, and change the colour map.' },
  { id: 'lipo2000', qty: 1, note: 'Makes it a handheld, which is the point - you want to walk around with it.' },
  { id: 'tp4056', qty: 1, note: 'Protected version.' },
  { id: 'switch', qty: 1 },
  { id: 'bb-400', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'box-abs', qty: 1, note: 'With a hole for the sensor. Nothing in front of it - most plastics are opaque to the far infrared this reads.' }
],

tools: [{ id: 'dmm', own: true }],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32',   at: [0, 50] },
    { id: 'bb',   comp: 'bb400',   at: [0, -10] },
    { id: 'therm', comp: 'amg8833', at: [-42, -64] },
    { id: 'tft',  comp: 'tft18',   at: [36, -62] },
    { id: 'b1',   comp: 'button',  at: [-20, -98] },
    { id: 'b2',   comp: 'button',  at: [4, -98] }
  ],
  wires: [
    { from: 'mcu.3V3',   to: 'bb.T+2',  color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',   to: 'bb.T-2',  color: 'black',  note: 'Ground rail' },
    { from: 'therm.VIN', to: 'bb.T+6',  color: 'red',    note: 'Sensor power' },
    { from: 'therm.GND', to: 'bb.T-6',  color: 'black',  note: 'Sensor ground' },
    { from: 'therm.SDA', to: 'mcu.D21', color: 'blue',   note: 'I2C data, address 0x69' },
    { from: 'therm.SCL', to: 'mcu.D22', color: 'yellow', note: 'I2C clock' },
    { from: 'tft.VCC',   to: 'bb.T+10', color: 'red',    note: 'Display power' },
    { from: 'tft.GND',   to: 'bb.T-10', color: 'black',  note: 'Display ground' },
    { from: 'tft.SCK',   to: 'mcu.D18', color: 'yellow', note: 'SPI clock' },
    { from: 'tft.SDA',   to: 'mcu.D23', color: 'blue',   note: 'SPI data' },
    { from: 'tft.CS',    to: 'mcu.D5',  color: 'orange', note: 'Display chip select' },
    { from: 'tft.DC',    to: 'mcu.D17', color: 'green',  note: 'Data/command' },
    { from: 'tft.RESET', to: 'mcu.D16', color: 'white',  note: 'Display reset' },
    { from: 'b1.1A',     to: 'mcu.D32', color: 'purple', note: 'Lock/unlock the temperature range' },
    { from: 'b1.2A',     to: 'bb.T-16', color: 'black',  note: 'Button to ground' },
    { from: 'b2.1A',     to: 'mcu.D33', color: 'purple', note: 'Cycle the colour map' },
    { from: 'b2.2A',     to: 'bb.T-18', color: 'black',  note: 'Button to ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">Nothing in front of the sensor. Not even clear plastic.</span>
<p>This reads far infrared, around 10&nbsp;micrometres. Ordinary glass and almost every plastic are
<strong>opaque</strong> at that wavelength - a clear window over the sensor is a solid wall to it.</p>
<p>That is also why you cannot see through a window with a thermal camera: you see the temperature of the
glass. Cut a hole and let the sensor look out of it.</p>
<p>If you must cover it, the only common material that passes far infrared is a thin sheet of polyethylene -
a piece of freezer bag, which is what cheap PIR windows are made of.</p></div>

<div class="note warn"><span class="t">I2C address is 0x69, and it clashes with some IMUs</span>
<p>The AMG8833 defaults to 0x69. An MPU-6050 with its AD0 pin high is also 0x69. If you add one later, tie the
MPU's AD0 low for 0x68.</p>
<p>Run <code>i2cdetect</code> or an I2C scanner sketch first - it takes a minute and saves a confusing
afternoon.</p></div>

<div class="note tip"><span class="t">Let it warm up for a minute</span>
<p>The sensor compensates using its own die temperature, and that reading settles over about 60 seconds after
power-up. Readings taken in the first minute drift by a degree or two.</p>
<p>Not a fault. The sketch shows a countdown so you do not chase it.</p></div>`,

solderSteps: [
  { h: 'Nothing here needs soldering',
    body: `<p>Both modules come with headers fitted or loose strips. On a breadboard this is a plug-together
    build, and it works well enough as a bench instrument that you may not bother making it permanent.</p>` },
  { h: 'If you box it as a handheld',
    body: `<p>Cut a hole for the sensor rather than a window - see the wiring notes. The sensor wants to sit
    flush with or just proud of the front face, with a clear field of view.</p>
    <p>Keep it away from the ESP32 and the regulator: both are warm, and a sensor that can see its own board
    has a permanent hot spot in the corner of every image.</p>` }
],

assembly: [
  { h: 'Scan the I2C bus first',
    body: `<p>An I2C scanner sketch. You should see 0x69 for the sensor. If you see nothing, check the wiring
    and that the module is on 3.3&nbsp;V.</p>` },
  { h: 'Print the raw 8x8 grid before touching the display',
    body: `<p>The reader sketch prints 64 temperatures as a grid in the serial monitor. Hold your hand in
    front of it and watch the numbers rise.</p>
    <p>This is worth doing because it shows you exactly how much - and how little - data there is. Everything
    the finished device shows is those 64 numbers.</p>` },
  { h: 'Check it against something known',
    body: `<p>A cup of boiling water is 95-100&nbsp;&deg;C at the surface. Your forehead is about 36. A room
    wall is close to air temperature.</p>
    <p>Absolute accuracy is &plusmn;2.5&nbsp;&deg;C, so do not expect better. What should be very consistent
    is the <em>difference</em> between pixels.</p>` },
  { h: 'Add the display and the interpolation',
    body: `<p>Run the full sketch. Point it at a radiator, a window, a person.</p>
    <p>The moment it becomes obviously useful is usually a window frame or a loft hatch - cold air leaks show
    up as unmistakable blue fingers.</p>` },
  { h: 'Learn the two modes',
    body: `<p>Auto-range makes every scene look dramatic. Lock the range and walk around: now a genuinely
    uniform wall stays uniform and a cold spot is obvious.</p>
    <p>For heat-loss hunting, lock it at something like 15-22&nbsp;&deg;C and walk the perimeter of a
    room.</p>` },
  { h: 'Try it on the things it is actually good at',
    body: `<ul>
      <li><strong>Draughts</strong> around windows, doors, loft hatches and skirting.</li>
      <li><strong>Missing insulation</strong> - an external wall on a cold day shows the studs.</li>
      <li><strong>Blocked radiators</strong> - a cold bottom third means sludge, a cold top means air.</li>
      <li><strong>Underfloor heating</strong> - the pipe runs show through the floor.</li>
      <li><strong>Electrical connections</strong> - a warm terminal in a consumer unit is a loose one. Look
      from a safe distance with the cover on.</li>
    </ul>` }
],

libraries: [
  { name: 'Adafruit AMG88xx', by: 'Adafruit', why: 'Reads the 64-pixel array and the device temperature.' },
  { name: 'Adafruit ST7735', by: 'Adafruit', why: 'The TFT, plus Adafruit GFX.' }
],

code: [
{
  h: 'The thermal camera',
  intro: `<p>The interpolation is the piece worth reading - it is what turns 64 squares into something you can
  interpret.</p>`,
  name: 'thermal_camera.ino',
  code: `/* ------------------------------------------------------------------
   8x8 thermal camera with interpolation.

   Button 1 : lock / unlock the temperature range
   Button 2 : cycle the colour map
   ------------------------------------------------------------------ */

#include <Wire.h>
#include <Adafruit_AMG88xx.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <SPI.h>

#define TFT_CS   5
#define TFT_DC  17
#define TFT_RST 16
#define BTN_LOCK 32
#define BTN_MAP  33

#define SRC 8          // sensor is 8x8
#define OUT 32         // interpolated to 32x32
#define CELL 4         // screen pixels per output pixel

Adafruit_AMG88xx amg;
Adafruit_ST7735 tft(TFT_CS, TFT_DC, TFT_RST);

float pixels[SRC * SRC];
float grid[OUT][OUT];

bool locked = false;
float lockMin = 16, lockMax = 26;
uint8_t colourMap = 0;
unsigned long bootAt = 0;

void setup() {
  Serial.begin(115200);
  pinMode(BTN_LOCK, INPUT_PULLUP);
  pinMode(BTN_MAP, INPUT_PULLUP);

  tft.initR(INITR_BLACKTAB);
  tft.setRotation(1);
  tft.fillScreen(ST77XX_BLACK);
  tft.setTextColor(ST77XX_WHITE);

  if (!amg.begin()) {
    tft.setCursor(4, 40);
    tft.println("No AMG8833 at 0x69");
    while (1) delay(100);
  }

  bootAt = millis();
  delay(100);
}

void loop() {
  pollButtons();
  amg.readPixels(pixels);

  /* The min and max come from the RAW pixels, not the interpolated
     grid. Interpolation smooths peaks, so a hot spot smaller than one
     sensor pixel reads several degrees low in the smoothed image. The
     number you quote should be the one the sensor measured. */
  float lo = 999, hi = -999;
  int loIdx = 0, hiIdx = 0;
  for (int i = 0; i < SRC * SRC; i++) {
    if (pixels[i] < lo) { lo = pixels[i]; loIdx = i; }
    if (pixels[i] > hi) { hi = pixels[i]; hiIdx = i; }
  }

  float rangeLo = locked ? lockMin : lo;
  float rangeHi = locked ? lockMax : hi;

  // A flat scene has a range of noise. Without a floor on the span,
  // a uniform wall renders as a dramatic full-scale pattern of nothing.
  if (rangeHi - rangeLo < 1.5) {
    float mid = (rangeHi + rangeLo) / 2;
    rangeLo = mid - 0.75;
    rangeHi = mid + 0.75;
  }

  interpolate();
  drawImage(rangeLo, rangeHi);
  drawMarkers(loIdx, hiIdx);
  drawReadout(lo, hi, rangeLo, rangeHi);

  delay(100);                    // the sensor runs at 10 Hz anyway
}

/* --- bicubic-ish interpolation -----------------------------------------
   Two passes of smooth (cosine) interpolation - along rows, then down
   columns. It invents no information; it makes the information that
   is there legible. */
void interpolate() {
  static float rows[SRC][OUT];
  float scale = (float)(SRC - 1) / (OUT - 1);

  for (int y = 0; y < SRC; y++) {
    for (int x = 0; x < OUT; x++) {
      float sx = x * scale;
      int x0 = (int)sx;
      int x1 = min(x0 + 1, SRC - 1);
      float t = sx - x0;
      float w = smooth(t);
      rows[y][x] = pixels[y * SRC + x0] * (1 - w) + pixels[y * SRC + x1] * w;
    }
  }

  for (int x = 0; x < OUT; x++) {
    for (int y = 0; y < OUT; y++) {
      float sy = y * scale;
      int y0 = (int)sy;
      int y1 = min(y0 + 1, SRC - 1);
      float t = sy - y0;
      float w = smooth(t);
      grid[y][x] = rows[y0][x] * (1 - w) + rows[y1][x] * w;
    }
  }
}

/* Cosine easing rather than linear. Linear interpolation leaves
   visible creases at every source pixel boundary; this does not. */
float smooth(float t) {
  return (1.0 - cos(t * PI)) * 0.5;
}

/* --- drawing ------------------------------------------------------------ */
void drawImage(float lo, float hi) {
  float span = hi - lo;
  for (int y = 0; y < OUT; y++) {
    for (int x = 0; x < OUT; x++) {
      float t = constrain((grid[y][x] - lo) / span, 0.0, 1.0);
      tft.fillRect(x * CELL, y * CELL, CELL, CELL, colourFor(t));
    }
  }
}

uint16_t colourFor(float t) {
  uint8_t r, g, b;

  if (colourMap == 0) {
    // Ironbow: black-purple-red-orange-yellow-white. The traditional
    // thermal palette, and the easiest to read for heat hunting.
    r = constrain(t * 3.0 * 255, 0, 255);
    g = constrain((t - 0.35) * 2.2 * 255, 0, 255);
    b = t < 0.3 ? constrain(t * 3.4 * 255, 0, 255)
                : constrain((t - 0.75) * 4.0 * 255, 0, 255);
  } else if (colourMap == 1) {
    // Blue to red through white. Best for spotting which side of a
    // midpoint something is on.
    r = constrain(t * 2.0 * 255, 0, 255);
    b = constrain((1 - t) * 2.0 * 255, 0, 255);
    g = constrain((1 - fabs(t - 0.5) * 2) * 255, 0, 255);
  } else {
    // Greyscale. Unfashionable and the most honest - false colour
    // makes small differences look like large ones.
    r = g = b = constrain(t * 255, 0, 255);
  }

  return tft.color565(r, g, b);
}

void drawMarkers(int loIdx, int hiIdx) {
  // Map a raw sensor pixel back to screen coordinates.
  int hx = (hiIdx % SRC) * OUT / SRC * CELL + CELL * 2;
  int hy = (hiIdx / SRC) * OUT / SRC * CELL + CELL * 2;
  int lx = (loIdx % SRC) * OUT / SRC * CELL + CELL * 2;
  int ly = (loIdx / SRC) * OUT / SRC * CELL + CELL * 2;

  tft.drawCircle(hx, hy, 4, ST77XX_WHITE);
  tft.drawFastHLine(hx - 6, hy, 13, ST77XX_WHITE);
  tft.drawFastVLine(hx, hy - 6, 13, ST77XX_WHITE);

  tft.drawCircle(lx, ly, 3, ST77XX_CYAN);
}

void drawReadout(float lo, float hi, float rLo, float rHi) {
  int x = OUT * CELL + 4;
  tft.fillRect(x, 0, 160 - x, 128, ST77XX_BLACK);

  tft.setTextSize(1);
  tft.setCursor(x, 4);
  tft.setTextColor(ST77XX_WHITE);
  tft.print("max");
  tft.setCursor(x, 14);
  tft.print(hi, 1);

  tft.setCursor(x, 32);
  tft.setTextColor(ST77XX_CYAN);
  tft.print("min");
  tft.setCursor(x, 42);
  tft.print(lo, 1);

  tft.setTextColor(ST77XX_WHITE);
  tft.setCursor(x, 62);
  tft.print("span");
  tft.setCursor(x, 72);
  tft.print(hi - lo, 1);

  tft.setCursor(x, 92);
  tft.print(locked ? "LOCK" : "auto");
  tft.setCursor(x, 102);
  tft.print(rLo, 0); tft.print("-"); tft.print(rHi, 0);

  // The sensor's own die temperature settles over about a minute.
  if (millis() - bootAt < 60000) {
    tft.setCursor(x, 116);
    tft.setTextColor(ST77XX_YELLOW);
    tft.print("warm ");
    tft.print((60000 - (millis() - bootAt)) / 1000);
    tft.setTextColor(ST77XX_WHITE);
  }
}

void pollButtons() {
  static unsigned long last = 0;
  if (millis() - last < 250) return;

  if (!digitalRead(BTN_LOCK)) {
    last = millis();
    if (!locked) {
      // Lock around what is currently on screen, rounded outward, so
      // the view does not jump when you press it.
      float lo = 999, hi = -999;
      for (int i = 0; i < SRC * SRC; i++) {
        if (pixels[i] < lo) lo = pixels[i];
        if (pixels[i] > hi) hi = pixels[i];
      }
      lockMin = floor(lo);
      lockMax = ceil(hi);
    }
    locked = !locked;
  }

  if (!digitalRead(BTN_MAP)) {
    last = millis();
    colourMap = (colourMap + 1) % 3;
  }
}`,
  after: `<p><strong>Cosine easing rather than linear interpolation</strong> is a one-line difference with a
  large visual effect. Linear interpolation leaves a visible crease at every source-pixel boundary - the image
  looks like a folded map. The cosine curve has zero gradient at each end, so the joins disappear.</p>
  <p><strong>The min/max come from the raw pixels</strong>, deliberately. Interpolation smooths peaks, so a
  hot spot smaller than one sensor pixel reads several degrees low in the smoothed grid. Quoting a temperature
  from interpolated data would be quoting a number the sensor never measured.</p>
  <p>The greyscale palette is worth having. False colour makes a 0.5&nbsp;&deg;C difference look like a fire,
  and when you are deciding whether something is genuinely a problem, grey is more honest.</p>`
}],

upload: `
<p>Board: <strong>ESP32 Dev Module</strong>. Serial Monitor at <strong>115200</strong>.</p>
<div class="note tip"><span class="t">Give it a minute before believing anything</span>
<p>The sensor compensates using its own die temperature and that settles over about 60 seconds. The countdown
on screen is there so you do not chase a drift that is going to stop on its own.</p></div>
<div class="note warn"><span class="t">If nothing is found on I2C</span>
<p>The address is 0x69. Run an I2C scanner. If you also have an MPU-6050 on the bus with AD0 high, they
collide - tie AD0 low.</p></div>`,

tune: [
  { h: 'Emissivity, and the tape trick',
    body: `<p>Shiny metal reads badly - polished aluminium has an emissivity around 0.05, so it emits almost
    nothing and reflects the room instead. Point this at a chrome valve and it reads cold.</p>
    <p>The fix thermographers use: a strip of matt electrical tape on the surface, left to reach the same
    temperature, then measure the tape. Its emissivity is about 0.95 and predictable.</p>` },
  { h: 'Interpolating further',
    body: `<p>32x32 is a good balance on a 160x128 screen. 64x64 looks smoother and takes four times the
    computation and adds no information at all.</p>
    <p>Beyond about 4x upsampling you are drawing a nicer picture of the same 64 numbers, and it starts to
    mislead about how much detail you actually have.</p>` },
  { h: 'Overlay it on a visible camera',
    body: `<p>The obvious next step and genuinely hard: the two sensors have different fields of view and are
    physically offset, so the alignment changes with distance. Commercial cameras do this and it is why they
    have a focus-distance setting.</p>
    <p>An approximate blend at one fixed distance is achievable and useful for reports.</p>` },
  { h: 'Hold and compare',
    body: `<p>Add a button that freezes a frame and shows it beside the live one. For heat-loss surveys,
    comparing this wall to that wall is far more useful than either alone.</p>` },
  { h: 'Log a room over a night',
    body: `<p>Write the 64 values to an SD card every minute overnight and you can see a room cool, find where
    it cools fastest, and watch the heating come on. That is real data about a building that no single
    snapshot gives you.</p>` },
  { h: 'The upgrade, if you want one',
    body: `<p>An MLX90640 is 32x24 - twelve times the pixels - for about $60. Everything in this sketch
    applies with the resolution constants changed, and the difference in usefulness is substantial.</p>
    <p>Build this one first. If you find yourself wanting more resolution, you will know exactly why.</p>` }
],

trouble: [
  { q: 'Nothing found on the I2C bus',
    a: `Address is 0x69. Run a scanner. Check the module is on 3.3&nbsp;V and that SDA and SCL are not
    swapped.` },
  { q: 'Readings drift for the first minute',
    a: `Expected. The die-temperature compensation settles. The countdown on screen is there for this.` },
  { q: 'Shiny things read cold',
    a: `Emissivity. Polished metal reflects rather than emits. Put matt tape on the surface and measure the
    tape.` },
  { q: 'I cannot see through a window',
    a: `Nor can any thermal camera. Glass is opaque at 10&nbsp;micrometres - you are seeing the temperature of
    the glass itself. This is also why nothing may cover the sensor.` },
  { q: 'A uniform wall shows a dramatic pattern',
    a: `Auto-ranging across noise. The minimum span floor handles most of it; lock the range to something real
    and the wall goes flat.` },
  { q: 'There is a permanent warm patch in one corner',
    a: `The sensor can see its own board, or the ESP32, or a regulator. Move it away or shield it - a piece of
    card is enough.` },
  { q: 'Absolute temperatures are a couple of degrees out',
    a: `Within specification - &plusmn;2.5&nbsp;&deg;C. The relative accuracy between pixels is much better,
    and that is what the instrument is for.` },
  { q: 'The image is mirrored',
    a: `Depends which way round the sensor is mounted. Flip the index in the drawing loop rather than turning
    the sensor - it is one character.` }
],

next: `
<ul>
  <li><strong>Find what the heat is costing</strong> - the
  <a href="project.html?p=mains-energy-monitor">energy monitor</a> turns a cold wall into a number.</li>
  <li><strong>Watch a room over time</strong> - the
  <a href="project.html?p=desk-weather-station">weather station</a> logs the conditions this camera shows you
  the shape of.</li>
  <li><strong>Fix what you find</strong> - a draught at a loft hatch, a radiator that needs bleeding, a wall
  that needs insulating. This project is most useful as a survey tool for other work.</li>
  <li><strong>A camera that recognises things</strong> - the
  <a href="project.html?p=uno-q-object-detection">object detector</a> is the visible-light counterpart, and
  the contrast between measuring and recognising is instructive.</li>
</ul>`,

safety: `
<div class="note warn"><span class="t">Where you point it matters more than the device</span>
<ul>
  <li><strong>Electrical inspection: look, do not open.</strong> A thermal camera is excellent for finding a
  warm connection in a consumer unit - <strong>through the closed cover</strong>. Opening a live panel to look
  at it is electrician's work with electrician's equipment.</li>
  <li><strong>It is not a medical thermometer.</strong> Skin temperature is not body temperature, the
  accuracy is &plusmn;2.5&nbsp;&deg;C, and forehead readings vary with the room. Do not screen anyone for
  fever with this.</li>
  <li><strong>Do not point it into other people's windows.</strong> A thermal camera reveals occupancy and
  activity through curtains, and in several countries pointing one at a neighbour's property is exactly as
  regulated as a camera would be.</li>
  <li><strong>LiPo rules as usual</strong> if you make it a handheld - protected charger, and no charging
  below 0&nbsp;&deg;C.</li>
</ul>
</div>`
});
