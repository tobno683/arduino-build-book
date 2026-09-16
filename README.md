# The Arduino Build Book

Arduino build guides with the whole build written down: the exact parts and what they cost, an
interactive 3D model of the finished thing, a wiring table that matches it pin for pin, how to make each
solder joint in plain words, and the complete sketch with a copy button.

Static HTML, CSS and vanilla JavaScript. No frameworks, no dependencies, no tracking. One optional Node
script regenerates a summary index.

**72 projects across 14 themes. 211 parts priced. 5 reference pages.**

**Live: <https://tobno683.github.io/arduino-build-book/>**

## Run it

```bash
node tools/serve.js        # preview on http://localhost:5178
node tools/build-index.js  # regenerate the index + service worker list, and validate
node tools/check-pwa.js    # validate the manifest, icons and worker
node tools/make-icons.js   # re-render the PNG icon set (only if the artwork changes)
```

Or just open `index.html` — everything works from a `file://` URL too, apart from the
service worker, which browsers only allow over HTTPS or on localhost.

## Install it

It is a progressive web app. On the live site, your browser will offer to install it; on
desktop Chrome the button is in the header, on iOS it is Share → Add to Home Screen.

Once installed, press **Save offline** in the header and it downloads all forty guides —
about 1.1 MB — so the whole book works in a workshop with no signal. That is the point:
this is a reference you read next to a soldering iron, which is exactly where the wifi is
worst.

The shell is precached on install; individual guides are cached as you open them, or all
at once via that button. The cache version is a hash of the file contents, so it is
replaced exactly when something changes and not on every build.

## Pages

| Page | What's in it |
|---|---|
| `index.html` | Hub: the four starting guides, the fourteen themes, featured builds |
| `projects.html` | Every project, filterable by theme, level, budget and whether it needs soldering. `?cat=<slug>` opens one theme |
| `project.html?p=<slug>` | A full build guide, rendered from one data file |
| `basics/tools.html` | What to buy, in three piles, plus every part on the site priced and searchable |
| `basics/soldering.html` | The soldering course: the iron, the three-second joint, headers, wires, undoing it |
| `basics/electronics.html` | Ohm's law, LED resistors (with a calculator), pull-ups, pin limits, decoupling, flyback, buses |
| `basics/programming.html` | IDE setup, sketch structure, `millis()`, debouncing, memory, every error message |
| `basics/glossary.html` | Every term the site uses as if you already knew it |

## Coverage

| | Count |
|---|---|
| Projects | 40 |
| Needing no soldering at all | 12 |
| Level 1 (true beginner) | 7 |
| Under $20 to build | 16 |
| Boards used | Uno, Nano, ESP32, ESP32-CAM, D1 Mini |

Every theme has a beginner entry point except **cameras** and **RFID**, and that is honest rather than an
oversight: an ESP32-CAM and an RC522 both arrive with loose pin headers, so there is no version of those
projects that avoids an iron.

## How it is built

```
assets/
  css/style.css          design system, light + dark
  js/site.js             chrome, theme, syntax highlighting, copy buttons
  js/build3d.js          a small 3D renderer (~12 KB, no three.js)
  js/parts3d.js          component library: real dimensions, real pin maps
  js/project.js          renders one project from its data file
  data/parts.js          the shop - every price on the site comes from here
  data/categories.js     the fourteen themes
  data/glossary.js       glossary entries
  data/index.js          GENERATED summary, see below
  data/projects/*.js     one file per project
tools/
  build-index.js         regenerates data/index.js, and validates everything
  serve.js               40-line static server
```

### The 3D views

There is no three.js. `build3d.js` is a painter's-algorithm renderer written for this site — perspective
camera, orbit, flat shading, per-face depth sort. Every scene here is boxes, cylinders and wires that do not
intersect, which is exactly the case where that approach looks the same as a real renderer at 2 % of the size.

`parts3d.js` holds the component library. Each entry knows its outline in millimetres and where its pins are:
an Arduino Uno is 68.6 × 53.4 mm with the 0.16 inch offset between D7 and D8 in the right place, and a
breadboard's holes are on a real 2.54 mm grid with its four separate power rails.

**The wiring table and the 3D view are generated from the same `build.wires` array.** They cannot disagree,
because they are the same data.

### Adding or editing a project

Copy any file in `assets/data/projects/`. The filename must match the `slug`. Then:

```bash
node tools/build-index.js
```

That regenerates `assets/data/index.js` and **refuses to write it** if anything is wrong:

- a BOM line points at a part that does not exist
- a 3D wire endpoint does not resolve to a real pin on a real component
- an unknown category, a duplicate slug, a slug that does not match its filename
- a level outside 1–4, or a missing required field

It also warns about softer problems — a 3D part with no wires, a project marked as needing soldering with no
soldering steps, a non-standard wire colour.

### Project data shape

```js
AB.addProject({
  slug, title, cat, level (1-4), time, solder, board, blurb, tags, feature,
  skills: [...],
  intro, how,                        // HTML strings
  what: [...],                       // bullet list
  bom:   [{ id, qty, note, own, as }],
  tools: [{ id, why }],
  build: {                           // drives BOTH the 3D view and the wiring table
    parts: [{ id, comp, at:[x,z], ry, opt, label }],
    wires: [{ from:'uno.D2', to:'bb.e10', color:'yellow', note:'...' }]
  },
  wireIntro, wireNotes,
  solderIntro, solderSteps: [{ h, body }],
  assembly: [{ h, body }],
  libraries: [{ name, by, how, why }],
  code: [{ h, name, lang, intro, code, after }],
  upload, tune: [{ h, body }],
  trouble: [{ q, a }],
  next, safety
});
```

Only `slug`, `title`, `cat`, `level`, `time` and `blurb` are required. Everything else is optional and its
section is skipped if absent.

### Prices

Every price comes from `assets/data/parts.js`. Correct it once there and it changes on every project page,
in the totals, and in the shopping piles on the tools page. Figures are typical 2026 street prices in USD,
with a `lo`/`hi` range showing what you will actually see; EUR is derived from one rate in the same file.

None of the supplier links are affiliate links — they are plain search URLs.

**Regions.** Set *Shipping to* on any parts table and the supplier links change: picking **Sweden** puts
Electrokit and Kjell & Company first and swaps Amazon for Amazon.se and DigiKey/Mouser for RS Sverige.
Defined in `AB.regions` in `assets/data/parts.js`; the choice is auto-detected from your browser language
and then remembered. Adding another country is one entry in that object.

## Conventions

- **Wire colours mean the same thing everywhere.** Red is power, black is ground, everything else is signal.
  Defined in `AB.wireColors`.
- **Shared stock is counted separately.** A project's headline price is what that project adds to your shelf,
  not including jumper wires and resistor kits you buy once.
- **Safety sections are not boilerplate.** Mains, lithium and anything on a road gets a real one.

## Licence and scope

Non-commercial reference project. The sketches are meant to be copied, changed and used.

Mains wiring is dangerous — read the warnings on the projects that involve it, and if in doubt use a
plug-in smart socket instead of building one.
