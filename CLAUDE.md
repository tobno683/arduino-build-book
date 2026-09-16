# The Arduino Build Book — working notes

Static site. No build step for the site itself, no dependencies, no framework. Works from `file://`.
One optional Node script regenerates a summary index and validates everything.

```bash
node tools/serve.js        # preview on http://localhost:5178
node tools/build-index.js  # regenerate assets/data/index.js + validate. RUN AFTER EVERY DATA EDIT.
```

## The one rule that matters

**`tools/build-index.js` must pass before you consider a change done.** It refuses to write the index if a
BOM references a missing part, a 3D wire endpoint does not resolve to a real pin on a real component, a slug
is duplicated or does not match its filename, a category is unknown, or a required field is missing.

It has caught real bugs, including a missing comma I introduced while appending a section to a project file.
If it refuses, fix the data — do not work around it.

## Architecture

```
assets/js/build3d.js     ~12 KB software 3D renderer. No three.js.
assets/js/parts3d.js     component library: real mm dimensions, real pin maps
assets/js/project.js     renders one project from its data file
assets/js/site.js        chrome, theme, syntax highlighting, copy buttons
assets/data/parts.js     THE SHOP — every price on the site comes from here
assets/data/projects/*.js  one file per project, one AB.addProject() call each
assets/data/index.js     GENERATED. Never hand-edit.
```

### Two things are generated from one source

**The wiring table and the 3D view both come from `build.wires`.** They cannot disagree because they are the
same array. If you change wiring, you change it once.

**Every price comes from `assets/data/parts.js`.** Project BOMs reference part ids. Correcting a price there
updates every project page, every total, and the shopping piles on `basics/tools.html`.

### The 3D renderer

Painter's algorithm — faces sorted back-to-front by centroid depth, flat shaded. This works because every
scene is boxes, cylinders and wires that do not intersect.

Two non-obvious things already fixed, worth not re-breaking:

- **The bench is excluded from the depth sort and drawn first.** It is one very large quad, so its centroid
  is often nearer the camera than a small component sitting far out on it — and sorting normally paints the
  bench *over* that component. Faces carry a `ground` flag for this.
- **Wires carry per-vertex explode offsets (`exv`)** so that "Explode" keeps wires attached to the parts they
  run between, rather than leaving them floating.

Largest scene (word clock, 121 LEDs) is ~1,700 faces at ~2 ms/frame. There is plenty of headroom.

## Adding a project

Copy any file in `assets/data/projects/`. **Filename must match the `slug`.** Then run `build-index.js`.

Required: `slug, title, cat, level (1-4), time, blurb`. Everything else is optional and its section is
skipped if absent. Full shape is documented in README.md.

House conventions:

- **Wire colours mean the same thing everywhere** — red power, black ground, brown load/high-current,
  everything else signal. Defined in `AB.wireColors` / `AB.wireLegend`.
- **`own: true` on a BOM line** means shared stock you buy once (jumper wires, resistor kits). It is excluded
  from the project's headline price.
- **Do not reuse a part id with an `as:` relabel** to stand in for a different part. Add the real part. This
  was a bug — three projects used the `18650` id labelled as AA holders, which corrupted analysis and was
  dishonest in the BOM.
- **`feature: true` — exactly one per theme.** The home page shuffles and shows six, so all twelve get airtime.
- **Supplier links are search URLs, never product URLs.** That is what makes it honest to offer a shop
  for every part: the link means "look for it here", not "this is in stock here". It also means links
  never rot.
- **Regions live in `AB.regions`** (`assets/data/parts.js`). A region can `swap` an international supplier
  for its local arm (amazon → amazon.se) and add `extra` local shops to every part. `AB.buyLinks()` in
  site.js is the single implementation, used by both the project BOM and the tools catalogue. Default is
  auto-detected from `navigator.language` and then remembered in localStorage.
- **Verify a new supplier's search URL in a browser before adding it.** Several obvious-looking ones are
  wrong: `electrokit.com/en/search?query=` 404s (the real one is `search.php?keyword=`), `elfa.se`
  redirects to RS, and `lawicel-shop.se/search` 404s.
- **Safety sections are not boilerplate.** Anything with mains, lithium cells, or that goes on a road gets a
  real one. Check consistency: if one lithium project warns about charging below 0 °C, they all should.

## Editing project files from a script

These files are large and full of backticks and `${`-free template literals. When appending or editing
sections programmatically, use Python with explicit assertions rather than sed — and **remember the comma**
between object properties. Then run `build-index.js`, which will catch it if you forget.

## Content voice

Plain, specific, and honest about trade-offs. Name the actual failure mode rather than saying "be careful".
Prices are typical 2026 street prices with an honest lo/hi range. No affiliate links — supplier links are
plain search URLs.

Where a project genuinely cannot be beginner-friendly, say so rather than pretending. Cameras and RFID have
no no-soldering entry point because the ESP32-CAM and RC522 both ship with loose headers; that is written
into the README rather than papered over.
