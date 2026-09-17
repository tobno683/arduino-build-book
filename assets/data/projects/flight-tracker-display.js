/* Planes overhead: spherical geometry on a microcontroller, and a free API with a strict rate limit. */
AB.addProject({
slug: 'flight-tracker-display',
title: 'What is that plane overhead',
cat: 'display',
level: 2,
time: '4 hours',
solder: false,
board: 'ESP32',
tags: ['esp32', 'adsb', 'opensky', 'api', 'geometry', 'oled', 'aviation', 'json'],
blurb: 'Points at whatever aircraft is closest to directly above your house and tells you what it is, where it came from and how high it is. Answers a question you have had a hundred times and never looked up.',

skills: ['Great-circle distance', 'Bearing arithmetic', 'Bounding boxes', 'Rate-limited APIs', 'Trigonometry in practice', 'Choosing the right units'],

intro: `
<p>Nearly every aircraft in the sky broadcasts its position, altitude, heading and identity continuously and
unencrypted, several times a second. It is called ADS-B, and the whole point of it is that anyone can receive
it.</p>
<p>You can build your own receiver with a cheap software-defined radio, and many people do. This project takes
the easier route: OpenSky Network aggregates volunteers' receivers and publishes the lot as a free API. No
radio hardware, and you still get every aeroplane within a hundred kilometres.</p>
<p>What makes this worth building rather than just opening an app is the arithmetic. Turning a list of
latitudes and longitudes into "that one, over there, 11&nbsp;km up and heading for Dublin" is real spherical
geometry, and it is genuinely satisfying to get right.</p>`,

what: [
  'Fetch every aircraft in a box around your house, several times a minute.',
  'Work out which one is closest to directly overhead - which is not the same as closest to you.',
  'Show callsign, altitude, speed, heading and the country it took off from.',
  'Point at it: a compass bearing and an elevation angle, so you can actually look up and see it.',
  'Stay inside a free API’s rate limit without being asked twice.'
],

how: `
<p><strong>Closest is not overhead.</strong> An aircraft at 2&nbsp;km lateral distance and 11&nbsp;km altitude
is nearly overhead. One at 4&nbsp;km lateral and 300&nbsp;m altitude - on approach to a nearby airport - is
closer to you in a straight line, but you would have to look almost at the horizon to see it.</p>
<p>So the thing to minimise is <strong>lateral</strong> distance, and then report the elevation angle
separately: <code>atan2(altitude, lateral_distance)</code>. Ninety degrees is straight up. Anything below about
ten degrees is behind the houses and not worth telling you about.</p>

<p><strong>Great-circle distance, and when not to bother.</strong> The proper way to measure between two
lat/long points is the haversine formula, which accounts for the curvature of the Earth. At the ranges here -
under 100&nbsp;km - a flat approximation is accurate to a few metres and much cheaper, but haversine is only a
handful of trig calls and an ESP32 does not care. Use the real one.</p>
<p>The part everyone gets wrong is <strong>longitude degrees are not a fixed distance</strong>. One degree of
latitude is 111&nbsp;km everywhere. One degree of longitude is 111&nbsp;km at the equator and about 74 at
London's latitude, because the meridians converge. Any calculation that treats them the same is wrong by a
third in northern Europe, which is enough to pick the wrong aeroplane.</p>

<p><strong>Bearing.</strong> <code>atan2(sin(dLon)*cos(lat2), cos(lat1)*sin(lat2) - sin(lat1)*cos(lat2)*cos(dLon))</code>,
converted to degrees and normalised to 0-360. Then turn it into something a human can use: "NNE" is far more
useful standing in a garden than "31 degrees".</p>

<p><strong>The rate limit is the real constraint.</strong> OpenSky gives anonymous users a small number of
requests per day and authenticated users rather more. Poll every ten seconds and you will be locked out before
lunch.</p>
<p>Two things fix it. Ask for a <strong>bounding box</strong> rather than the whole world - a box roughly
1&nbsp;degree each way is a few dozen aircraft rather than twelve thousand, and the response drops from
megabytes to kilobytes. And poll every 30 seconds, interpolating positions in between from each aircraft's
known heading and speed. A plane at 250&nbsp;m/s moves predictably; dead reckoning between polls is accurate
enough to keep the display live.</p>

<p><strong>Units will catch you out.</strong> OpenSky returns altitude in metres and velocity in metres per
second. Aviation talks in feet and knots. Pick one and label it - the failure mode is a display that says
"38000" next to a number that is actually 11582, and nobody notices for a week.</p>`,

bom: [
  { id: 'esp32', qty: 1, note: 'Wi-Fi, and the floating-point trig runs fast enough to be irrelevant.' },
  { id: 'oled13b', qty: 1, note: '1.3 inch SH1106. Bigger than the 0.96, and the extra pixels matter when you are fitting a callsign and four numbers.' },
  { id: 'bb-400', qty: 1 },
  { id: 'button', qty: 1, note: 'Cycles between the closest aircraft, the highest, and a list.' },
  { id: 'psu5v3a', qty: 1, note: 'Or any phone charger. It sits on a windowsill and runs.' },
  { id: 'box-abs', qty: 1 },
  { id: 'jumpers', qty: 1, own: true },
  { id: 'usb-cable', qty: 1, own: true }
],

tools: [],

build: {
  parts: [
    { id: 'mcu', comp: 'esp32',  at: [0, 62] },
    { id: 'bb',  comp: 'bb400',  at: [0, 0] },
    { id: 'oled',comp: 'oled13b',at: [-16, -56] },
    { id: 'btn', comp: 'button', at: [46, -52] }
  ],
  wires: [
    { from: 'mcu.3V3',  to: 'bb.T+1',  color: 'red',    note: '3.3 V rail' },
    { from: 'mcu.GND',  to: 'bb.T-1',  color: 'black',  note: 'Ground rail' },
    { from: 'oled.VCC', to: 'bb.T+5',  color: 'red',    note: 'Display power' },
    { from: 'oled.GND', to: 'bb.T-5',  color: 'black',  note: 'Display ground' },
    { from: 'oled.SDA', to: 'mcu.D21', color: 'green',  note: 'I2C data' },
    { from: 'oled.SCL', to: 'mcu.D22', color: 'blue',   note: 'I2C clock' },
    { from: 'btn.1A',   to: 'mcu.D15', color: 'yellow', note: 'Mode button, using the internal pull-up' },
    { from: 'btn.2A',   to: 'bb.T-12', color: 'black',  note: 'Button to ground' }
  ]
},

wireIntro: `<p>Eight wires and no soldering. This is one of the simplest builds in the book - all the work is in
the sketch.</p>`,

wireNotes: `
<div class="note tip"><span class="t">SH1106 or SSD1306?</span>
<p>The 1.3&nbsp;inch modules are usually SH1106; the 0.96&nbsp;inch ones are usually SSD1306. They are
almost the same and the libraries support both, but pick the wrong one in your constructor and you get a
display shifted two pixels sideways with a stripe down the edge. That specific symptom means exactly this
mistake.</p></div>

<div class="note"><span class="t">Get your position right</span>
<p>Put your actual latitude and longitude in the sketch to four decimal places. Four decimals is about eleven
metres, which is far more than enough. Every bearing on the display is relative to this point, so a lazy guess
means everything is consistently a few degrees off.</p></div>`,

assembly: [
  { h: 'Display first',
    body: `<p>Run the library's example and confirm you get text. If you get a shifted image with a stripe, you
    have the wrong driver selected - swap SH1106 and SSD1306 in the constructor.</p>` },
  { h: 'Register for an API key before writing any fetch code',
    body: `<p>OpenSky works anonymously with a low limit, and better with a free account. Get the account
    first - discovering the limit by being rate-limited halfway through debugging wastes an evening.</p>` },
  { h: 'Test the request in a browser',
    body: `<p>Paste your bounding-box URL into a browser and look at the JSON. You will immediately see how
    many aircraft you get and how big the response is, which tells you whether your box is the right size.</p>
    <p>Aim for twenty to sixty aircraft. Hundreds means the box is too big and you are wasting RAM and
    quota.</p>` },
  { h: 'Check the geometry against something you can see',
    body: `<p>Stand outside, find an aeroplane, and see whether the display agrees about direction and
    elevation. This is the only real test of the trigonometry, and it is immediately obvious when a sign is
    wrong somewhere - the display will point at the exact opposite bearing.</p>` },
  { h: 'Then leave it on a windowsill',
    body: `<p>It becomes genuinely useful near a flight path. The moment it earns its keep is the first time
    somebody asks "what was that" and you already know.</p>` }
],

libraries: [
  { name: 'ArduinoJson', by: 'Benoit Blanchon', why: 'Version 7, with a filter - OpenSky returns a large array of arrays and you want four fields from each.' },
  { name: 'U8g2', by: 'oliver', why: 'Drives both SH1106 and SSD1306, and has fonts that are readable at a distance.' }
],

code: [{
  name: 'flight_tracker.ino',
  code: `/* ------------------------------------------------------------------
   What is that plane overhead - ESP32 + SH1106 OLED
   Data from the OpenSky Network REST API.
   ------------------------------------------------------------------ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <U8g2lib.h>
#include <math.h>

const char* WIFI_SSID = "your-network";
const char* WIFI_PASS = "your-password";

// Your position, to four decimals. Everything is measured from here.
const float MY_LAT = 51.5074;
const float MY_LON = -0.1278;

// Roughly +/- 0.7 degrees. Big enough to be interesting, small enough
// that the response stays a few kilobytes.
const float BOX = 0.7;

U8G2_SH1106_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);

struct Aircraft {
  char callsign[10];
  char country[24];
  float lat, lon;
  float altM;        // metres
  float velMS;       // metres per second
  float heading;     // degrees true
  float distKm;      // lateral, not slant
  float bearing;
  float elevation;
};

Aircraft best;
bool haveOne = false;
unsigned long lastPoll = 0;

void setup() {
  Serial.begin(115200);
  oled.begin();
  banner("Connecting");

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);

  poll();
}

void loop() {
  // 30 s. Anonymous OpenSky access is rate limited and polling faster
  // gets you locked out well before the day is over.
  if (millis() - lastPoll > 30000UL) { lastPoll = millis(); poll(); }

  if (haveOne) draw();
  else banner("Nothing up there");

  delay(1000);
}

// ---- fetch -----------------------------------------------------------
void poll() {
  if (WiFi.status() != WL_CONNECTED) { WiFi.reconnect(); return; }

  char url[220];
  snprintf(url, sizeof(url),
    "https://opensky-network.org/api/states/all?lamin=%.4f&lomin=%.4f&lamax=%.4f&lomax=%.4f",
    MY_LAT - BOX, MY_LON - BOX, MY_LAT + BOX, MY_LON + BOX);

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, url);
  http.setTimeout(10000);

  int status = http.GET();
  if (status != 200) { Serial.printf("HTTP %d\\n", status); http.end(); return; }

  /* OpenSky returns "states" as an array of arrays - index 1 is the
     callsign, 2 the origin country, 5 lon, 6 lat, 7 altitude, 9 velocity,
     10 heading. A filter keeps the whole thing from blowing the heap. */
  JsonDocument filter;
  filter["states"] = true;

  JsonDocument doc;
  DeserializationError err =
    deserializeJson(doc, http.getStream(), DeserializationOption::Filter(filter));
  http.end();
  if (err) { Serial.println(err.c_str()); return; }

  float bestDist = 1e9;
  haveOne = false;

  for (JsonArray s : doc["states"].as<JsonArray>()) {
    if (s[5].isNull() || s[6].isNull() || s[7].isNull()) continue;

    float lon = s[5], lat = s[6], alt = s[7];
    if (alt < 300) continue;                  // on the ground or nearly

    float d = haversineKm(MY_LAT, MY_LON, lat, lon);

    /* Lateral distance, not slant range. A low aircraft on approach can
       be closer in a straight line while being nowhere near overhead. */
    if (d < bestDist) {
      bestDist = d;
      haveOne = true;
      strlcpy(best.callsign, s[1] | "-------", sizeof(best.callsign));
      strlcpy(best.country,  s[2] | "", sizeof(best.country));
      best.lat = lat; best.lon = lon;
      best.altM = alt;
      best.velMS = s[9] | 0.0f;
      best.heading = s[10] | 0.0f;
      best.distKm = d;
      best.bearing = bearingTo(MY_LAT, MY_LON, lat, lon);
      best.elevation = degrees(atan2(alt, d * 1000.0f));
    }
  }
}

// ---- geometry --------------------------------------------------------
/* Haversine. Overkill at these ranges but cheap, and it removes the
   commonest bug: treating a degree of longitude as the same distance as
   a degree of latitude. It is 111 km for latitude everywhere, but only
   about 74 km for longitude at London. */
float haversineKm(float lat1, float lon1, float lat2, float lon2) {
  const float R = 6371.0;
  float dLat = radians(lat2 - lat1);
  float dLon = radians(lon2 - lon1);
  float a = sin(dLat / 2) * sin(dLat / 2) +
            cos(radians(lat1)) * cos(radians(lat2)) *
            sin(dLon / 2) * sin(dLon / 2);
  return R * 2 * atan2(sqrt(a), sqrt(1 - a));
}

float bearingTo(float lat1, float lon1, float lat2, float lon2) {
  float dLon = radians(lon2 - lon1);
  float y = sin(dLon) * cos(radians(lat2));
  float x = cos(radians(lat1)) * sin(radians(lat2)) -
            sin(radians(lat1)) * cos(radians(lat2)) * cos(dLon);
  float b = degrees(atan2(y, x));
  return fmod(b + 360.0, 360.0);
}

const char* compass(float deg) {
  static const char* pts[] = {"N","NNE","NE","ENE","E","ESE","SE","SSE",
                              "S","SSW","SW","WSW","W","WNW","NW","NNW"};
  return pts[(int)((deg + 11.25) / 22.5) % 16];
}

// ---- display ---------------------------------------------------------
void draw() {
  oled.clearBuffer();

  oled.setFont(u8g2_font_helvB12_tr);
  oled.drawStr(0, 13, best.callsign);

  oled.setFont(u8g2_font_6x10_tf);
  char line[36];

  // Feet, because that is what aviation uses and what anyone will
  // recognise. Labelled, so nobody has to guess.
  snprintf(line, sizeof(line), "%.0f ft  %.0f kt",
           best.altM * 3.28084f, best.velMS * 1.94384f);
  oled.drawStr(0, 28, line);

  snprintf(line, sizeof(line), "%.1f km  %s", best.distKm, compass(best.bearing));
  oled.drawStr(0, 40, line);

  snprintf(line, sizeof(line), "look up %.0f deg", best.elevation);
  oled.drawStr(0, 52, line);

  oled.setFont(u8g2_font_5x7_tf);
  oled.drawStr(0, 63, best.country);

  oled.sendBuffer();
}

void banner(const char* s) {
  oled.clearBuffer();
  oled.setFont(u8g2_font_6x10_tf);
  oled.drawStr(0, 32, s);
  oled.sendBuffer();
}`
}],

trouble: [
  { q: 'HTTP 429',
    a: `Rate limited. That is the API telling you to slow down - anonymous access allows only a modest number
    of calls per day. Poll every 30 seconds at minimum, and register for a free account, which raises the
    limit substantially.` },
  { q: 'Display is shifted sideways with a stripe down one edge',
    a: `SH1106 driver on an SSD1306 display or the other way round. Swap the constructor. This exact symptom
    means exactly this.` },
  { q: 'Bearings are consistently 180 degrees wrong',
    a: `The arguments to <code>bearingTo</code> are swapped, or a sign is inverted in the <code>y</code> term.
    Test it with a known pair - due north of you should give 0, due east 90.` },
  { q: 'Distances look wrong the further east or west the aircraft is',
    a: `Longitude is being treated as the same distance per degree as latitude. That is the bug haversine
    exists to prevent, so check you are actually calling it rather than a flat approximation.` },
  { q: 'The board reboots when it fetches',
    a: `Out of memory - your bounding box is too large. A 0.7 degree box is a few dozen aircraft; a 5 degree
    box over Europe is thousands and will not fit.` },
  { q: 'Callsigns have trailing spaces',
    a: `They are fixed-width in the ADS-B standard, padded with spaces. Trim them.` },
  { q: 'It picks an aircraft that is clearly not overhead',
    a: `You are minimising slant range rather than lateral distance. Check the elevation figure too - if it
    says 8 degrees, it is near the horizon and you want the next one.` },
  { q: 'Altitude is obviously nonsense',
    a: `Some aircraft report barometric altitude and some geometric, and a few report neither reliably. Index 7
    is barometric; index 13 is geometric. Fall back to the other when one is null.` }
],

next: `
<ul>
  <li><strong>Your own receiver</strong>. A $25 RTL-SDR dongle and a dump1090 instance on a Raspberry Pi gives
  you the raw feed with no rate limit and no internet at all. The geometry in this sketch works unchanged
  against it.</li>
  <li><strong>A servo that physically points</strong> at the aircraft - one for bearing, one for elevation. The
  numbers are already computed.</li>
  <li><strong>Alert on the unusual</strong>: anything below 3,000 feet that is not on a normal approach,
  anything squawking 7700, or a specific registration you are waiting for.</li>
  <li><strong>Put it on the <a href="project.html?p=analog-gauge-panel">gauge panel</a></strong> - altitude and
  range on two needles is a lovely way to watch a single aircraft pass over.</li>
</ul>`
});
