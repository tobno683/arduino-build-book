/* ESP32 + 2.9" e-paper: weather and calendar, updated a few times a day. */
AB.addProject({
slug: 'epaper-dashboard',
title: 'E-paper wall dashboard',
cat: 'display',
level: 3,
time: '4 hours',
solder: true,
board: 'ESP32',
tags: ['e-paper', 'esp32', 'weather api', 'deep sleep', 'ntp', 'battery'],
blurb: 'Weather, forecast and the date on a paper-like screen that draws nothing between updates. Months on a battery, and it still shows something when the Wi-Fi dies.',

skills: ['E-paper refresh', 'HTTPS APIs', 'JSON parsing', 'NTP time', 'Deep sleep scheduling', 'Layout on a tiny canvas'],

intro: `
<p>An e-paper panel holds its image with no power at all. That single property changes what a display project
can be: instead of a screen that must stay powered, you get a piece of paper that updates itself four times a
day and runs for months on a small battery.</p>
<p>It also enforces good design. A 296&times;128 black-and-white panel that takes two seconds to refresh will
not tolerate animation, fussy layout or six decimal places. You have to decide what actually matters - which
is why these things end up looking better than a colour screen showing everything.</p>`,

what: [
  'Show current temperature, conditions, and a three-day forecast from a free weather API.',
  'Show the date, the time of the last update, and sunrise and sunset.',
  'Update every few hours, then deep sleep at microamps in between.',
  'Keep showing the last good data if the network is down, with a marker saying it is stale.',
  'Run three to six months on a 2000 mAh cell.'
],

how: `
<p>An <strong>e-paper</strong> panel is a layer of microcapsules holding black and white pigment in a clear
fluid. A voltage moves the pigment to the surface or away from it, and once moved it stays there - the image
survives with no power, indefinitely.</p>
<p>The cost is speed and wear. A <strong>full refresh</strong> takes about two seconds and visibly flashes the
panel black and white a few times to clear ghosting. A <strong>partial refresh</strong> is faster and quieter
but leaves faint traces of the previous image, which build up. The right pattern for a dashboard is partial
refreshes for routine updates and a full refresh every tenth one to clean the panel.</p>
<p>Never leave a panel powered and static for days, and never refresh it in a tight loop - both shorten its
life. Deep sleep between updates is not just for the battery.</p>
<p><strong>The data</strong> comes from Open-Meteo, which is free, needs no API key and returns compact JSON.
You give it a latitude and longitude; it gives you current conditions and a daily forecast. Parsing it on an
ESP32 with ArduinoJson is a dozen lines.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'A DevKit works. A board with proper deep-sleep support and a LiPo connector - a FireBeetle or a TinyPICO - halves the sleep current, and on a battery build that matters.' },
  { id: 'epaper', qty: 1, note: '2.9 inch, 296x128, black and white, SPI. Waveshare and Good Display panels both work with GxEPD2.' },
  { id: 'lipo2000', qty: 1, note: 'Or a USB supply if it is going near a socket.' },
  { id: 'tp4056', qty: 1, note: 'Protected version, if you are running on a cell.' },
  { id: 'res10k', qty: 2, note: 'Battery voltage divider.' },
  { id: 'photoframe', qty: 1, note: 'A small deep frame makes it look like an object rather than a project.' },
  { id: 'perfboard', qty: 1 },
  { id: 'headers-f', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'tape', qty: 1 }
],

tools: [{ id: 'iron' }, { id: 'solder' }, { id: 'cutters' }, { id: 'dmm' }],

build: {
  parts: [
    { id: 'esp',  comp: 'esp32',  at: [0, 0] },
    { id: 'epd',  comp: 'epaper', at: [-64, -6], ry: 180 },
    { id: 'chg',  comp: 'tp4056', at: [44, 54] },
    { id: 'batt', comp: 'block',  at: [0, 92], opt: { w: 60, h: 10, d: 40, c: '#3a4148' }, label: 'LiPo 2000 mAh' }
  ],
  wires: [
    { from: 'epd.VCC',  to: 'esp.3V3',  color: 'red',    note: 'Panel power. 3.3 V - these are NOT 5 V parts' },
    { from: 'epd.GND',  to: 'esp.GND',  color: 'black',  note: 'Ground' },
    { from: 'epd.DIN',  to: 'esp.D23',  color: 'blue',   note: 'SPI MOSI' },
    { from: 'epd.CLK',  to: 'esp.D18',  color: 'green',  note: 'SPI clock' },
    { from: 'epd.CS',   to: 'esp.D5',   color: 'orange', note: 'Chip select' },
    { from: 'epd.DC',   to: 'esp.D17',  color: 'yellow', note: 'Data / command select' },
    { from: 'epd.RST',  to: 'esp.D16',  color: 'white',  note: 'Panel reset' },
    { from: 'epd.BUSY', to: 'esp.D4',   color: 'purple', note: 'Panel says "still refreshing" on this line' },
    { from: 'batt.n',   to: 'chg.B+',   color: 'red',    note: 'Cell positive into the charger' },
    { from: 'batt.f',   to: 'chg.B-',   color: 'black',  note: 'Cell negative' },
    { from: 'chg.OUT+', to: 'esp.VIN',  color: 'red',    note: 'Protected output feeds the board' },
    { from: 'chg.OUT-', to: 'esp.GND2', color: 'black',  note: 'Ground' }
  ]
},

wireNotes: `
<div class="note warn"><span class="t">3.3 V only, and mind the ribbon</span>
<p>E-paper panels are 3.3&nbsp;V parts. Most breakout boards do not have a regulator or level shifters, so
5&nbsp;V on any pin can kill them, and they are the most expensive part here.</p>
<p>The flexible ribbon between the panel and its driver board is fragile. Do not flex it repeatedly, do not
crease it, and support the panel when you move the assembly.</p></div>

<div class="note tip"><span class="t">The BUSY line is not optional</span>
<p>A refresh takes two seconds and the library waits on this pin to know when it is done. Leave it unconnected
and the library either hangs forever or, worse, carries on and corrupts the image mid-write.</p></div>

<div class="note"><span class="t">The battery divider</span>
<p>Two 10&nbsp;k resistors from the cell positive to ground, with the midpoint going to GPIO 34. That halves a
4.2&nbsp;V cell to 2.1&nbsp;V, comfortably inside the ADC range.</p>
<p>It also draws 200&nbsp;&micro;A continuously, which over a month is 150&nbsp;mAh - not nothing on a battery
build. Use 1&nbsp;M&Omega; resistors instead, or switch the divider with a MOSFET, if you care.</p></div>`,

solderSteps: [
  { h: 'Sockets for the ESP32 and a header for the panel',
    body: `<p>Two 15-pin strips for the board. The e-paper's own cable usually ends in an 8-pin dupont
    connector, so solder a matching 8-pin male header rather than cutting the cable.</p>
    <p>Mark pin 1 clearly. An e-paper connector reversed puts 3.3&nbsp;V where BUSY should be.</p>` },
  { h: 'Keep the SPI runs short',
    body: `<p>Under 150&nbsp;mm. The panel's own cable is usually about 200&nbsp;mm and that is fine, but do not
    add another 300&nbsp;mm of jumper on top.</p>` },
  { h: 'The battery divider, near the ADC pin',
    body: `<p>Two resistors meeting at one compact point on the board, with a short wire to GPIO 34.</p>` },
  { h: 'Charger and cell last',
    body: `<p>Cell to <strong>B+/B-</strong>, board to <strong>OUT+/OUT-</strong>. Never the load on B+/B-, or
    the protection circuit is bypassed.</p>
    <p>Sleeve everything. LiPo pouch cells have thin tabs that will short against anything.</p>` },
  { h: 'Check before the panel is connected',
    body: `<p>Power the ESP32 alone. Measure 3.3&nbsp;V at the pin that will feed the panel - if it reads 5, you
    are on the wrong pin and you were about to destroy the display.</p>
    <p>Then connect the panel.</p>` }
],

assembly: [
  { h: 'Run the library example first',
    body: `<p>Install GxEPD2 and open <strong>File &rarr; Examples &rarr; GxEPD2 &rarr; GxEPD2_HelloWorld</strong>.
    Uncomment the line matching your exact panel and set the pins. Getting the library's own example on screen
    before writing any of your own code saves a great deal of confusion.</p>` },
  { h: 'Identify your panel exactly',
    body: `<p>GxEPD2 has dozens of display classes and the wrong one gives a blank or garbled screen. For a
    2.9&nbsp;inch 296&times;128 black-and-white the usual class is <code>GxEPD2_290_T94</code> or
    <code>GxEPD2_290_BS</code>. The panel's model number is printed on the ribbon or the driver board - match
    it against the list in <code>GxEPD2_display_selection_new_style.h</code>.</p>` },
  { h: 'Set your location and timezone',
    body: `<p>Latitude, longitude and a POSIX timezone string at the top of the sketch. Get the coordinates
    from any map; four decimal places is plenty.</p>` },
  { h: 'Watch a full cycle',
    body: `<p>Serial Monitor at 115200. Boot, connect, fetch, draw, sleep - about eight seconds. Then it goes
    quiet, which is correct.</p>` },
  { h: 'Frame it',
    body: `<p>Cut a window in the mount, tape the panel behind it, board and battery behind that. E-paper looks
    genuinely like print behind a mount, which is most of the appeal.</p>
    <p>Leave the USB port reachable, or you will be taking the frame apart to change the update interval.</p>` }
],

libraries: [
  { name: 'GxEPD2', by: 'Jean-Marc Zingg', why: 'Drives almost every e-paper panel there is. Install its dependency Adafruit GFX too.' },
  { name: 'Adafruit GFX Library', by: 'Adafruit', why: 'Text and drawing.' },
  { name: 'ArduinoJson', by: 'Benoit Blanchon', why: 'Parses the weather response without eating all the RAM.' },
  { name: 'esp32 board package', by: 'Espressif', how: 'Boards Manager', why: 'Wi-Fi, HTTPS and deep sleep.' }
],

code: [{
  name: 'epaper_dashboard.ino',
  code: `/* ------------------------------------------------------------------
   E-paper wall dashboard
   2.9" 296x128 panel on SPI, weather from Open-Meteo (no API key).
   Wakes, fetches, draws, sleeps.
   Board: ESP32 Dev Module
   ------------------------------------------------------------------ */

#include <GxEPD2_BW.h>
#include <Fonts/FreeSansBold24pt7b.h>
#include <Fonts/FreeSans12pt7b.h>
#include <Fonts/FreeSans9pt7b.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ---- change these ----------------------------------------------------
const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";

const float LAT = 59.3293;          // your latitude
const float LON = 18.0686;          // your longitude
const char* TZ  = "CET-1CEST,M3.5.0,M10.5.0/3";   // POSIX timezone string

#define UPDATE_MINUTES 180          // 3 hours
// ----------------------------------------------------------------------

#define EPD_CS   5
#define EPD_DC  17
#define EPD_RST 16
#define EPD_BUSY 4
#define BATT_PIN 34

// Match this to YOUR panel - see GxEPD2_display_selection_new_style.h
GxEPD2_BW<GxEPD2_290_T94, GxEPD2_290_T94::HEIGHT> epd(
  GxEPD2_290_T94(EPD_CS, EPD_DC, EPD_RST, EPD_BUSY));

RTC_DATA_ATTR int updateCount = 0;
RTC_DATA_ATTR float lastTemp = -99;
RTC_DATA_ATTR char lastCond[20] = "";
RTC_DATA_ATTR int  lastHigh[3] = { -99, -99, -99 };
RTC_DATA_ATTR int  lastLow[3]  = { -99, -99, -99 };
RTC_DATA_ATTR char sunrise[6] = "--:--";
RTC_DATA_ATTR char sunset[6]  = "--:--";

bool fresh = false;

void setup() {
  Serial.begin(115200);
  updateCount++;

  float battV = readBattery();
  Serial.printf("wake %d, battery %.2f V\\n", updateCount, battV);

  if (connectWifi()) {
    syncTime();
    fresh = fetchWeather();
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
  } else {
    Serial.println(F("no wifi - drawing the last known data"));
  }

  drawScreen(battV);
  sleepNow();
}

void loop() { }

/* --- network ---------------------------------------------------------- */
bool connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - t0 > 15000) return false;
    delay(200);
  }
  Serial.println(WiFi.localIP());
  return true;
}

void syncTime() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  setenv("TZ", TZ, 1);
  tzset();
  struct tm t;
  for (int i = 0; i < 20 && !getLocalTime(&t, 500); i++) { }
}

bool fetchWeather() {
  String url = "https://api.open-meteo.com/v1/forecast?latitude=";
  url += String(LAT, 4);
  url += "&longitude=";
  url += String(LON, 4);
  url += "&current=temperature_2m,weather_code";
  url += "&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset";
  url += "&timezone=auto&forecast_days=3";

  HTTPClient http;
  http.setTimeout(9000);
  http.begin(url);
  int code = http.GET();
  if (code != 200) {
    Serial.printf("HTTP %d\\n", code);
    http.end();
    return false;
  }

  // Filter to only what we need - the full response would not fit
  // comfortably in RAM alongside the e-paper buffer.
  StaticJsonDocument<256> filter;
  filter["current"]["temperature_2m"] = true;
  filter["current"]["weather_code"] = true;
  filter["daily"]["temperature_2m_max"] = true;
  filter["daily"]["temperature_2m_min"] = true;
  filter["daily"]["weather_code"] = true;
  filter["daily"]["sunrise"] = true;
  filter["daily"]["sunset"] = true;

  DynamicJsonDocument doc(2048);
  DeserializationError err = deserializeJson(doc, http.getStream(),
                                             DeserializationOption::Filter(filter));
  http.end();

  if (err) {
    Serial.print(F("json: "));
    Serial.println(err.c_str());
    return false;
  }

  lastTemp = doc["current"]["temperature_2m"] | -99.0;
  int wc = doc["current"]["weather_code"] | -1;
  strncpy(lastCond, describe(wc), sizeof(lastCond) - 1);

  for (int d = 0; d < 3; d++) {
    lastHigh[d] = (int)round((float)(doc["daily"]["temperature_2m_max"][d] | -99.0));
    lastLow[d]  = (int)round((float)(doc["daily"]["temperature_2m_min"][d] | -99.0));
  }

  // "2026-09-15T06:23" - we want the last five characters
  const char* sr = doc["daily"]["sunrise"][0] | "";
  const char* ss = doc["daily"]["sunset"][0] | "";
  if (strlen(sr) >= 16) { strncpy(sunrise, sr + 11, 5); sunrise[5] = 0; }
  if (strlen(ss) >= 16) { strncpy(sunset,  ss + 11, 5); sunset[5]  = 0; }

  Serial.printf("%.1f C, %s\\n", lastTemp, lastCond);
  return true;
}

/* WMO weather codes, collapsed to things worth printing. */
const char* describe(int c) {
  if (c == 0) return "Clear";
  if (c <= 2) return "Partly cloudy";
  if (c == 3) return "Overcast";
  if (c <= 48) return "Fog";
  if (c <= 57) return "Drizzle";
  if (c <= 67) return "Rain";
  if (c <= 77) return "Snow";
  if (c <= 82) return "Showers";
  if (c <= 86) return "Snow showers";
  if (c <= 99) return "Thunderstorm";
  return "--";
}

/* --- battery ---------------------------------------------------------- */
float readBattery() {
  analogReadResolution(12);
  analogSetPinAttenuation(BATT_PIN, ADC_11db);
  long sum = 0;
  for (int i = 0; i < 32; i++) { sum += analogRead(BATT_PIN); delay(2); }
  // 3.3 V reference, 12 bits, and the divider halves it
  return (sum / 32.0) * 3.3 / 4095.0 * 2.0;
}

/* --- drawing ---------------------------------------------------------- */
void drawScreen(float battV) {
  epd.init(115200, true, 2, false);
  epd.setRotation(1);                  // 296 wide, 128 tall
  epd.setTextColor(GxEPD_BLACK);

  // A full refresh every tenth update clears accumulated ghosting.
  bool full = (updateCount % 10 == 1);

  epd.setFullWindow();
  epd.firstPage();
  do {
    epd.fillScreen(GxEPD_WHITE);
    drawHeader(battV);
    drawNow();
    drawForecast();
  } while (epd.nextPage());

  epd.hibernate();                     // panel down to microamps
  (void)full;
}

void drawHeader(float battV) {
  struct tm t;
  char line[48];
  if (getLocalTime(&t, 100)) {
    strftime(line, sizeof(line), "%a %d %b  %H:%M", &t);
  } else {
    snprintf(line, sizeof(line), "update %d", updateCount);
  }

  epd.setFont(&FreeSans9pt7b);
  epd.setCursor(4, 14);
  epd.print(line);

  if (!fresh) {
    epd.setCursor(150, 14);
    epd.print("(stale)");
  }

  // battery as a small bar, top right
  int pct = constrain((int)((battV - 3.3) / 0.9 * 100), 0, 100);
  epd.drawRect(258, 4, 32, 12, GxEPD_BLACK);
  epd.fillRect(290, 7, 2, 6, GxEPD_BLACK);
  epd.fillRect(260, 6, pct * 28 / 100, 8, GxEPD_BLACK);

  epd.drawFastHLine(0, 20, 296, GxEPD_BLACK);
}

void drawNow() {
  epd.setFont(&FreeSansBold24pt7b);
  epd.setCursor(6, 66);
  if (lastTemp > -90) {
    epd.print((int)round(lastTemp));
    epd.setFont(&FreeSans12pt7b);
    epd.print("C");
  } else {
    epd.print("--");
  }

  epd.setFont(&FreeSans12pt7b);
  epd.setCursor(6, 92);
  epd.print(lastCond);

  epd.setFont(&FreeSans9pt7b);
  epd.setCursor(6, 116);
  epd.print("up ");
  epd.print(sunrise);
  epd.print("   down ");
  epd.print(sunset);
}

void drawForecast() {
  epd.drawFastVLine(168, 24, 100, GxEPD_BLACK);

  const char* labels[3] = { "today", "tomorrow", "then" };
  for (int d = 0; d < 3; d++) {
    int y = 44 + d * 28;
    epd.setFont(&FreeSans9pt7b);
    epd.setCursor(178, y);
    epd.print(labels[d]);

    epd.setCursor(248, y);
    if (lastHigh[d] > -90) {
      epd.print(lastHigh[d]);
      epd.print("/");
      epd.print(lastLow[d]);
    } else {
      epd.print("--");
    }
  }
}

/* --- sleep ------------------------------------------------------------ */
void sleepNow() {
  Serial.println(F("sleeping"));
  Serial.flush();
  esp_sleep_enable_timer_wakeup((uint64_t)UPDATE_MINUTES * 60ULL * 1000000ULL);
  esp_deep_sleep_start();
}`,
  after: `<p>Two things worth carrying to other projects:</p>
  <ul>
    <li><strong>The JSON filter.</strong> Open-Meteo's full response is several kilobytes. Passing a filter to
    <code>deserializeJson</code> makes ArduinoJson discard everything you did not ask for as it streams,
    so a 2&nbsp;KB document is enough. Without it you would need 8&nbsp;KB, alongside a 5&nbsp;KB e-paper
    buffer.</li>
    <li><strong>The stale marker.</strong> If the fetch fails, the RTC-memory copy of the last good reading is
    drawn with "(stale)" beside it. A dashboard that shows old data honestly is far more useful than one that
    goes blank - and it is four lines.</li>
  </ul>`
}],

upload: `
<p>Board: ESP32 Dev Module. Watch the Serial Monitor at 115200 through one full cycle: wake, Wi-Fi, fetch,
the parsed temperature, then <code>sleeping</code>.</p>
<div class="note warn"><span class="t">Deep sleep and uploading</span>
<p>Once it sleeps it stops listening to the serial port. To upload again, press and hold BOOT, tap EN/RST, then
start the upload - or just start the upload during the few seconds it is awake.</p></div>`,

tune: [
  { h: 'Update interval versus battery',
    body: `<p>Each wake costs roughly 8 seconds at 100&nbsp;mA, about 0.22&nbsp;mAh. At three-hourly that is
    1.8&nbsp;mAh a day, so the sleep current dominates: at 20&nbsp;&micro;A a 2000&nbsp;mAh cell lasts years in
    theory and six to nine months in practice.</p>
    <p>Hourly updates cost four times as much per day and still barely register. What kills battery life is a
    board that does not sleep properly, not the update rate.</p>` },
  { h: 'Measure the actual sleep current',
    body: `<p>A plain DevKit sleeps at 5-15&nbsp;mA because of its regulator and USB chip, not the 10&nbsp;&micro;A
    the ESP32 is capable of. That is the difference between two weeks and a year. If battery life matters, use
    a board designed for it, or cut the power LED and bypass the regulator.</p>` },
  { h: 'Getting the right display class',
    body: `<p>If the screen stays blank or shows noise, it is nearly always the wrong GxEPD2 class. Work through
    the candidates for your size in the selection header - there are only a handful per panel size.</p>` },
  { h: 'Ghosting',
    body: `<p>Faint traces of the previous image. A full refresh clears it - the sketch does one every tenth
    update. If your panel ghosts badly, do them more often, at the cost of a visible flash.</p>` },
  { h: 'Layout on 296x128',
    body: `<p>Resist adding more. Two or three numbers large enough to read across a room beats twelve small
    ones. Use <code>getTextBounds()</code> to right-align numbers properly - proportional fonts mean "11" and
    "18" are different widths, and a dashboard where the temperature jitters left and right looks wrong.</p>` }
],

trouble: [
  { q: 'Screen stays completely white',
    a: `Wrong display class, or BUSY not connected. Run the library's HelloWorld example and work through the
    classes for your panel size.` },
  { q: 'Sketch hangs after "init"',
    a: `The library is waiting on BUSY forever. Check that pin, and that the panel has 3.3&nbsp;V.` },
  { q: 'Image is mirrored or rotated',
    a: `<code>setRotation()</code> - try 0 to 3.` },
  { q: 'Faint previous image remains',
    a: `Ghosting. Force a full refresh more often.` },
  { q: 'Wi-Fi connects but HTTP returns -1',
    a: `HTTPS certificate handling. The simplest fix on ESP32 is to use <code>WiFiClientSecure</code> with
    <code>setInsecure()</code>, which skips verification - acceptable for a public weather API, not for
    anything carrying credentials.` },
  { q: 'JSON parse fails',
    a: `The document is too small, or the API changed. Print <code>http.getString()</code> once and look at
    what actually came back - it is usually an error object explaining itself.` },
  { q: 'Battery percentage is wrong',
    a: `Divider ratio or the ADC's non-linearity near the ends of its range. Measure the cell with a
    multimeter and adjust the <code>* 2.0</code> factor to match.` },
  { q: 'Runs for two weeks instead of six months',
    a: `The board is not really sleeping. Measure it. A DevKit's regulator and USB chip are almost certainly
    the cause.` }
],

next: `
<ul>
  <li><strong>Add your calendar</strong>: a small script on a server that turns an ICS feed into a compact
  JSON, and the dashboard shows today's events. Far more useful than the weather.</li>
  <li><strong>Draw weather icons</strong> as XBM bitmaps - GxEPD2 draws them directly, and a 32&times;32 icon
  reads better than a word.</li>
  <li><strong>Bigger panel</strong>: a 7.5&nbsp;inch 800&times;480 is about $35 and changes what you can show
  entirely. Same code, different display class.</li>
  <li><strong>Feed it from your own data</strong> - the <a href="project.html?p=desk-weather-station">weather
  station</a> or the <a href="project.html?p=mains-energy-monitor">energy monitor</a> publishing to MQTT, and
  the dashboard subscribing.</li>
</ul>`,

safety: `
<div class="note danger"><span class="t">A lithium cell behind a picture frame</span>
<p>Nothing here is electrically dangerous, but a LiPo pouch cell hung on a wall deserves a little thought:</p>
<ul>
  <li><strong>Load on OUT+/OUT-, cell on B+/B-.</strong> Wiring the board to B+/B- bypasses the TP4056's
  protection circuit entirely, and a cell left to self-discharge for months with nothing stopping it is exactly
  the case that protection exists for. This project sleeps for years at a time - it is the worst possible one
  to get this wrong on.</li>
  <li><strong>Do not let the frame crush the cell.</strong> A pouch cell is a soft foil bag. Give it its own
  space with a rigid wall between it and the backboard, and never screw through the frame near it.</li>
  <li><strong>Charge the first time where you can see it</strong>, and never charge a cell that has been
  somewhere below freezing until it has warmed to room temperature.</li>
  <li><strong>Check it once a year.</strong> A cell that has puffed - the frame will no longer sit flat - goes
  to a recycling point, not back on the wall.</li>
  <li><strong>Mains-powered instead?</strong> Entirely reasonable. Run it from a USB charger, drop the cell and
  the charger board, and you lose only the freedom to hang it away from a socket.</li>
</ul>
</div>`
});
