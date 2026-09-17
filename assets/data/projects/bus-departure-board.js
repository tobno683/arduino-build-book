/* Live departure board: the project where the hard part is somebody else's API. */
AB.addProject({
slug: 'bus-departure-board',
title: 'Live bus and train departure board',
cat: 'display',
level: 2,
time: '4 hours',
solder: false,
board: 'ESP32',
tags: ['esp32', 'transit', 'api', 'json', 'wifi', 'tft', 'https', 'ntp', 'real time'],
blurb: 'The board from the bus stop, on your hallway wall, counting down to the departures you actually catch. It tells you whether to run, which is the only thing you wanted to know.',
skills: ['HTTPS requests', 'Parsing JSON on a microcontroller', 'Working with someone else’s API', 'Time zones and NTP', 'Graceful failure', 'Screen layout in code'],

intro: `
<p>Every transit authority in the world publishes departure times. Most of them publish them as an API you can
use for free, and a $5 board can put the next four departures on a screen by your front door.</p>
<p>This is the first project in the book where the difficulty is not electrical. The wiring is six jumper
wires. The hard parts are that the API is somebody else's, it will change without telling you, it will go down
on the morning you are late, and the JSON it returns is bigger than the RAM you have to parse it with.</p>
<p>Those are the skills worth having. A project that only works when the network is perfect is not finished.</p>`,

what: [
  'Show the next four departures from one stop, with line number, destination and minutes remaining.',
  'Count down in real time between API calls rather than sitting still for a minute.',
  'Mark a departure as cancelled or delayed when the feed says so, because that is exactly when you need to know.',
  'Keep showing the last good data when the network drops, with a visible marker that it is stale.',
  'Dim overnight, and stop polling entirely between 1 am and 5 am so you are not hammering a free API for nobody.'
],

how: `
<p><strong>Finding your API.</strong> Nearly every operator has one. In the UK it is TransportAPI or the Bus
Open Data Service; in Sweden, Trafiklab; in the Netherlands, OVapi; in much of the US, a GTFS-Realtime feed
from the agency. Most want a free key. What you are looking for is a "departures for stop X" endpoint that
returns JSON.</p>
<p>The one thing to check before you commit: does it give you <strong>expected</strong> times, or only
scheduled ones? A board showing the timetable rather than reality is a clock with extra steps.</p>

<p><strong>Why the JSON will not fit.</strong> An ESP32 has around 300&nbsp;KB of usable heap. A departures
response for a busy interchange can be 100&nbsp;KB of JSON, and parsing it into a document tree needs roughly
1.5 times its own size again. You can run out.</p>
<p>The fix is a <strong>filter</strong>. ArduinoJson lets you hand it a skeleton document describing only the
fields you want, and it discards everything else as it streams past. The 100&nbsp;KB response becomes a 2&nbsp;KB
document holding four departures. This is the single most important technique in the sketch.</p>

<p><strong>Parse the stream, not a string.</strong> The naive version calls <code>http.getString()</code>, which
allocates the entire response in RAM before parsing begins - so you are holding the full 100&nbsp;KB <em>and</em>
the parsed document. Passing the stream straight to <code>deserializeJson</code> means it is consumed a few
bytes at a time and never exists whole.</p>

<p><strong>Countdown locally, poll rarely.</strong> Asking the API every ten seconds is rude and unnecessary.
Poll once a minute, store the absolute departure timestamps, and recompute "minutes from now" every second from
the board's own clock. The display updates continuously; the network does not.</p>
<p>That is why NTP matters here. The countdown is the difference between two clocks - the API's and yours - and
if yours is thirty seconds out, every number on the wall is thirty seconds wrong.</p>

<p><strong>Time zones will bite you.</strong> APIs usually return UTC or ISO-8601 with an offset. Your stop is
in local time, and half the year that differs by an hour. Set the ESP32's TZ string (<code>GMT0BST,M3.5.0/1,M10.5.0</code>
for the UK) and let the C library handle the changeover, rather than adding 3600 yourself and forgetting in
October.</p>

<p><strong>Certificates, briefly.</strong> The endpoint will be HTTPS. Full certificate validation means storing
a root CA and updating it when it expires - which on a wall clock you will not do. The pragmatic middle ground
is <code>setInsecure()</code>, which encrypts the traffic but does not verify who you are talking to. For
public departure data with no credentials at stake that is a reasonable trade, and it is stated here rather than
hidden.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Wi-Fi and enough RAM for the JSON. An Uno cannot do this project at all - no network, and 2 KB of RAM.' },
  { id: 'tft28', qty: 1, note: '2.8 inch 320x240. Big enough for four departures in a font you can read from down the hall.' },
  { id: 'bb-830', qty: 1 },
  { id: 'psu5v3a', qty: 1, note: 'It runs continuously. A phone charger is fine; the point is not to power it from a laptop you take to work.' },
  { id: 'photoframe', qty: 1, note: 'Or any deep frame. The screen wants to sit flush behind an aperture cut to 57 x 43 mm.' },
  { id: 'ldr', qty: 1, note: 'Ambient light, for the overnight dimming.' },
  { id: 'res10k', qty: 1, note: 'LDR divider.' },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [],

build: {
  parts: [
    { id: 'mcu',  comp: 'esp32', at: [0, 78] },
    { id: 'tft',  comp: 'tft28', at: [0, -34] },
    { id: 'bb',   comp: 'bb830', at: [0, 16] },
    { id: 'ldr',  comp: 'ldr',   at: [-64, 20] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail - this screen is a 3.3 V part, do not feed it 5 V' },
    { from: 'mcu.GND', to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'tft.VCC',  to: 'bb.T+4',  color: 'red',    note: 'Screen power' },
    { from: 'tft.GND',  to: 'bb.T-4',  color: 'black',  note: 'Screen ground' },
    { from: 'tft.CS',   to: 'mcu.D5',  color: 'green',  note: 'SPI chip select' },
    { from: 'tft.RESET',to: 'mcu.D4',  color: 'white',  note: 'Reset' },
    { from: 'tft.DC',   to: 'mcu.D2',  color: 'yellow', note: 'Data / command select' },
    { from: 'tft.SDI', to: 'mcu.D23', color: 'blue',   note: 'SPI data out' },
    { from: 'tft.SCK',  to: 'mcu.D18', color: 'orange', note: 'SPI clock' },
    { from: 'tft.LED',  to: 'mcu.D15', color: 'purple', note: 'Backlight on a PWM pin, so it can dim' },
    { from: 'ldr.A',    to: 'bb.T+20', color: 'red',    note: 'LDR to 3.3 V' },
    { from: 'ldr.B',    to: 'mcu.D34', color: 'green',  note: 'LDR junction to an ADC pin' },
    { from: 'bb.e20',   to: 'bb.T-20', color: 'black',  note: '10 k from the junction to ground - the other half of the divider' }
  ]
},

wireIntro: `<p>No soldering if your screen came with headers fitted. Six wires for SPI, two for power, three
for the light sensor.</p>`,

wireNotes: `
<div class="note warn"><span class="t">3.3 V, not 5 V</span>
<p>The ILI9341 board and its logic are 3.3&nbsp;V. Some modules have a regulator and a level shifter, many do
not, and the ones that do not die quietly on 5&nbsp;V. The ESP32 is a 3.3&nbsp;V board throughout, so as long
as you take power from <code>3V3</code> and never from <code>VIN</code>, you cannot get this wrong.</p></div>

<div class="note tip"><span class="t">D34 is input-only, and that is fine</span>
<p>GPIO 34-39 on an ESP32 have no output driver and no internal pull-up. For an analogue light reading that is
exactly what you want, and it keeps a more useful pin free.</p></div>

<div class="note"><span class="t">Why the backlight gets its own pin</span>
<p>Tying LED straight to 3.3&nbsp;V works and runs at full brightness forever. On a hallway wall at 2 am that
is unpleasant. One PWM pin costs nothing and buys you a screen that fades down at night.</p></div>`,

assembly: [
  { h: 'Screen first, before any network code',
    body: `<p>Wire the display, run the library's graphics test, and confirm you get colour and the right
    orientation. Everything after this assumes the screen works, and debugging a blank screen while also
    debugging an API is twice the work for no reason.</p>` },
  { h: 'Wi-Fi, then NTP, then look at the clock',
    body: `<p>Connect and print the time to serial. If the time is wrong, the countdown will be wrong by exactly
    the same amount, and you will blame the API. Get this right while it is still a two-line program.</p>` },
  { h: 'Fetch once, print the raw JSON',
    body: `<p>Before parsing anything, dump the first 500 characters of the response to serial. You will
    immediately see whether you got data, an authentication error, or an HTML error page - which is the usual
    surprise, and which no JSON parser will give you a useful message about.</p>` },
  { h: 'Build the filter from the real response',
    body: `<p>Paste the response into the ArduinoJson Assistant, tick the four or five fields you actually want,
    and it writes the filter and the sizing for you. Do this with <em>your</em> API's response, not the example
    in this sketch - every operator names its fields differently.</p>` },
  { h: 'Then the layout',
    body: `<p>Four rows, line number left, destination middle, minutes right-aligned. Right-aligning the minutes
    matters more than it sounds: a column of numbers that jumps about as it goes from 9 to 10 is hard to read at
    a glance, which is the only way this display is ever read.</p>` },
  { h: 'Hang it, then live with it for a week',
    body: `<p>The refinements that matter only appear in use. You will find you want a different stop in the
    morning than the evening, or that you only care about two of the five lines. Both are a few lines of
    code once you know.</p>` }
],

libraries: [
  { name: 'ArduinoJson', by: 'Benoit Blanchon', why: 'Version 7. The filtering and streaming this project depends on. The author’s Assistant web tool writes your filter for you.' },
  { name: 'TFT_eSPI', by: 'Bodmer', why: 'Fast ILI9341 driver. You configure it by editing User_Setup.h in the library folder - which is unusual and catches everyone once.' }
],

code: [{
  name: 'departure_board.ino',
  code: `/* ------------------------------------------------------------------
   Live departure board - ESP32 + ILI9341

   Replace the API section with your operator's. The structure is the
   same everywhere: fetch JSON, filter it down, keep absolute departure
   times, count down locally.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <TFT_eSPI.h>
#include <time.h>

// ---- your details ----------------------------------------------------
const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";
const char* API_URL   = "https://api.example.com/departures/STOPID?key=YOURKEY";

// Your zone, with the daylight-saving rule. This one is UK.
// Central Europe: "CET-1CEST,M3.5.0,M10.5.0/3"
// US Eastern:     "EST5EDT,M3.2.0,M11.1.0"
const char* TZ_STRING = "GMT0BST,M3.5.0/1,M10.5.0";

#define BACKLIGHT_PIN 15
#define LDR_PIN       34
#define MAX_ROWS      4

TFT_eSPI tft = TFT_eSPI();

struct Departure {
  char line[8];
  char dest[24];
  time_t when;        // absolute, so the countdown is local arithmetic
  bool cancelled;
};

Departure rows[MAX_ROWS];
int rowCount = 0;
time_t lastGoodFetch = 0;
unsigned long lastPoll = 0;

// ---- setup -----------------------------------------------------------
void setup() {
  Serial.begin(115200);
  pinMode(BACKLIGHT_PIN, OUTPUT);
  analogWrite(BACKLIGHT_PIN, 255);

  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  banner("Connecting...");

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(400); Serial.print('.'); }
  Serial.println("\\nWiFi up");

  // NTP first. The whole display is the difference between two clocks.
  configTzTime(TZ_STRING, "pool.ntp.org", "time.nist.gov");
  struct tm t;
  if (!getLocalTime(&t, 10000)) banner("No time from NTP");

  fetchDepartures();
}

// ---- main loop -------------------------------------------------------
void loop() {
  int hour = localHour();
  bool quiet = (hour >= 1 && hour < 5);       // nobody is catching a bus

  // Poll once a minute, never during the quiet hours.
  if (!quiet && millis() - lastPoll > 60000UL) {
    lastPoll = millis();
    fetchDepartures();
  }

  analogWrite(BACKLIGHT_PIN, quiet ? 8 : brightnessFromLDR());
  drawBoard();
  delay(1000);                                 // the countdown ticks locally
}

// ---- fetch -----------------------------------------------------------
void fetchDepartures() {
  if (WiFi.status() != WL_CONNECTED) { WiFi.reconnect(); return; }

  WiFiClientSecure client;
  // Encrypts, but does not verify the server. See the write-up: fine for
  // public data with no credentials, not fine for anything with a login.
  client.setInsecure();

  HTTPClient http;
  http.begin(client, API_URL);
  http.setTimeout(8000);

  int status = http.GET();
  if (status != 200) {
    Serial.printf("HTTP %d\\n", status);
    http.end();
    return;                                    // keep the last good data
  }

  /* The filter is what makes this fit in RAM. Only the fields named here
     survive; the rest is discarded as the response streams past. Build
     yours from your own API's response - field names differ everywhere. */
  JsonDocument filter;
  JsonObject item = filter["departures"].add<JsonObject>();
  item["line"]           = true;
  item["direction"]      = true;
  item["expected_utc"]   = true;
  item["is_cancelled"]   = true;

  JsonDocument doc;
  // Streamed, not getString() - the full response is never in RAM at once.
  DeserializationError err =
    deserializeJson(doc, http.getStream(), DeserializationOption::Filter(filter));
  http.end();

  if (err) { Serial.printf("JSON: %s\\n", err.c_str()); return; }

  rowCount = 0;
  for (JsonObject d : doc["departures"].as<JsonArray>()) {
    if (rowCount >= MAX_ROWS) break;
    strlcpy(rows[rowCount].line, d["line"] | "?", sizeof(rows[0].line));
    strlcpy(rows[rowCount].dest, d["direction"] | "", sizeof(rows[0].dest));
    rows[rowCount].when      = parseIso8601(d["expected_utc"] | "");
    rows[rowCount].cancelled = d["is_cancelled"] | false;
    if (rows[rowCount].when > 0) rowCount++;
  }
  lastGoodFetch = time(nullptr);
}

// ---- draw ------------------------------------------------------------
void drawBoard() {
  time_t now = time(nullptr);
  bool stale = (now - lastGoodFetch) > 180;    // three minutes with no data

  tft.fillScreen(TFT_BLACK);
  tft.setTextDatum(TL_DATUM);

  for (int i = 0; i < rowCount; i++) {
    int y = 12 + i * 52;
    long mins = (rows[i].when - now) / 60;
    if (mins < 0) continue;                    // it has gone

    uint16_t colour = rows[i].cancelled ? TFT_RED
                    : (mins <= 2 ? TFT_ORANGE : TFT_YELLOW);

    tft.setTextColor(colour, TFT_BLACK);
    tft.drawString(rows[i].line, 8, y, 4);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.drawString(rows[i].dest, 62, y + 6, 2);

    // Right-aligned, so the column does not jump between 9 and 10.
    tft.setTextDatum(TR_DATUM);
    tft.setTextColor(colour, TFT_BLACK);
    if (rows[i].cancelled)  tft.drawString("CANC", 312, y, 4);
    else if (mins == 0)     tft.drawString("due", 312, y, 4);
    else                    tft.drawString(String(mins) + "'", 312, y, 4);
    tft.setTextDatum(TL_DATUM);
  }

  if (rowCount == 0) banner("No departures");

  // Say so when the data is old, rather than showing a confident wrong number.
  if (stale) {
    tft.setTextColor(TFT_DARKGREY, TFT_BLACK);
    tft.drawString("stale - no signal", 8, 224, 2);
  }
}

void banner(const char* msg) {
  tft.setTextColor(TFT_DARKGREY, TFT_BLACK);
  tft.drawString(msg, 8, 100, 4);
}

// ---- helpers ---------------------------------------------------------
int brightnessFromLDR() {
  int raw = analogRead(LDR_PIN);               // 0-4095
  int b = map(raw, 200, 3000, 20, 255);
  return constrain(b, 20, 255);
}

int localHour() {
  struct tm t;
  if (!getLocalTime(&t, 100)) return 12;
  return t.tm_hour;
}

/* "2026-09-17T08:14:00Z" -> time_t. timegm() treats the struct as UTC,
   which is what the API gives us; the countdown then works regardless of
   what our local zone happens to be. */
time_t parseIso8601(const char* s) {
  if (!s || strlen(s) < 19) return 0;
  struct tm t = {};
  if (sscanf(s, "%4d-%2d-%2dT%2d:%2d:%2d",
             &t.tm_year, &t.tm_mon, &t.tm_mday,
             &t.tm_hour, &t.tm_min, &t.tm_sec) != 6) return 0;
  t.tm_year -= 1900;
  t.tm_mon  -= 1;
  return timegm(&t);
}`
}],

trouble: [
  { q: 'Screen is white, or stays black',
    a: `TFT_eSPI is configured by editing <code>User_Setup.h</code> inside the library folder, not from your
    sketch. If the driver or the pin numbers in there do not match your wiring, you get a blank or white screen
    with no error. This catches everybody exactly once.` },
  { q: 'The board reboots every time it fetches',
    a: `Out of memory. Either the filter is not being applied, or you are calling <code>getString()</code>
    somewhere. Print <code>ESP.getFreeHeap()</code> before and after the fetch - if it drops by tens of
    kilobytes, the response is being buffered whole.` },
  { q: 'JSON error: IncompleteInput',
    a: `The response was cut off - usually a timeout that is too short for a slow API. Raise
    <code>setTimeout</code>. It can also mean the server closed the connection because your key is wrong, in
    which case you are parsing an error page.` },
  { q: 'Everything is exactly one hour out, half the year',
    a: `The TZ string is missing its daylight-saving rule, or you added an offset by hand. Use the full POSIX TZ
    string and let the library switch over for you.` },
  { q: 'Times are counting down from the wrong moment',
    a: `NTP has not synced, so the board's clock is wrong. Print <code>time(nullptr)</code> - if it is a small
    number, you are in 1970 and no countdown will make sense.` },
  { q: 'HTTP 403 or 401',
    a: `Key wrong, expired, or not passed the way that API wants it. Some want it in a header rather than the
    URL. Test the exact URL in a browser first.` },
  { q: 'It works for a day then stops',
    a: `Free API tiers have daily quotas. Polling every minute is 1,440 calls a day - enough to exhaust a
    1,000-call limit by teatime. Poll every two minutes, and skip the quiet hours as the sketch does.` },
  { q: 'Text flickers badly every second',
    a: `Redrawing the whole screen. Draw only the minutes column each second and the rest only when the data
    changes, or write with a background colour so each string erases its own footprint.` }
],

next: `
<ul>
  <li><strong>Two stops, one screen</strong> - split the display and show the bus one way and the train the
  other. Most people's commute has two legs.</li>
  <li><strong>A walking-time offset</strong>: if it is six minutes to the stop, colour anything under seven
  minutes red. That is the actual question - not "when is the bus" but "do I need to leave now".</li>
  <li><strong>E-paper instead</strong>, using the <a href="project.html?p=epaper-dashboard">wall dashboard</a>
  build. You lose the per-second countdown but it runs for months on a battery.</li>
  <li><strong>Add the weather</strong> from a second API, so the board also answers whether to take a coat.</li>
  <li><strong>Split-flap it</strong>. The <a href="project.html?p=split-flap-display">mechanical version</a>
  shows the same data and makes the right noise doing it.</li>
</ul>`
});
