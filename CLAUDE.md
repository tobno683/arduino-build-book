# The Build Book — working notes

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
assets/data/news.js      the news shelf - new and upcoming boards
assets/data/boards.js    what each board is for - one entry per Board part
assets/data/index.js     GENERATED. Never hand-edit.
```

### Two things are generated from one source

**The wiring table and the 3D view both come from `build.wires`.** They cannot disagree because they are the
same array. If you change wiring, you change it once.

**The board filter is derived from the BOM.** `build-index.js` puts a `boards: [...]` array on every
index entry, built from the BOM lines whose part is in the `Board` category, in BOM order - so `boards[0]`
is the primary board. The free-text `board` field is for display only and is deliberately not parsed; it
says things like `"Jetson + Uno"` and `"ESP32 x2"`. A project with no `Board` part in its BOM gets a
warning, because it would be invisible to the filter.

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

Required: `slug, title, cat, level (1-5), time, blurb`. Everything else is optional and its section is
skipped if absent. Full shape is documented in README.md.

House conventions:

- **`build-index.js` actually draws every 3D component** a project uses, calling `build(it.opt || {})` the
  way the renderer does. Checking pin names alone missed a component whose `build` was written to the wrong
  contract - it passed every name check and then threw in the browser.
- **Wire colours mean the same thing everywhere** — red power, black ground, brown load/high-current,
  everything else signal. Defined in `AB.wireColors` / `AB.wireLegend`.
- **`own: true` on a BOM line** means shared stock you buy once (jumper wires, resistor kits). It is excluded
  from the project's headline price.
- **Do not reuse a part id with an `as:` relabel** to stand in for a different part. Add the real part. This
  was a bug — three projects used the `18650` id labelled as AA holders, which corrupted analysis and was
  dishonest in the BOM.
- **Level 5 is not "level 4 but longer".** It is the point where the electronics stop being the hard part
  and control theory, machining tolerance or weeks of iteration take over. One project has it. If a second
  ever does, it has to clear the same bar.
- **`feature: true` — exactly one per theme.** The home page shuffles and shows six, so all fourteen get airtime.
- **Board parts carry a `short:` name.** The full name is right for a BOM and too long for a dropdown -
  `Arduino Uno R3 (or a clone)` against `Arduino Uno`. `AB.boardName(id)` in site.js is the one accessor;
  it falls back to the full name.
- **Every board part needs a write-up in `boards.js`**, and every write-up needs a real Board part -
  `build-index.js` refuses both ways round, so adding a board to the shop cannot silently leave a hole in
  `basics/boards.html`. Each entry needs all eight `specs` keys, at least one `goodAt` and at least one
  `badAt`; a board with no downsides listed is an advertisement, not a guide. Prices and names are never
  repeated there - they come from `parts.js` - and project counts come from `AB.index`, so neither can drift.
- **News entries earn their place with `why`.** Every item in `news.js` must say what it changes for
  *this book*, and "nothing" is an acceptable and common answer. `status` is one of `shipping`, `preorder`,
  `announced`, `rumour` - never blur them. `AB.newsChecked` is when a human last looked; `build-index.js`
  warns past 45 days and the page shows a stale banner past the same threshold. News `src` links are real
  article URLs, the one deliberate exception to the rule below, because there the link is the claim.
- **Supplier links are search URLs, never product URLs.** That is what makes it honest to offer a shop
  for every part: the link means "look for it here", not "this is in stock here". It also means links
  never rot.
- **A local shop link must be checked against that shop first.** Local shops are opt-in per part via
  `local: { se: { electrokit: 'search term' } }`; a region's `shops` list only says which are *eligible*.
  This replaced an `extra` list that was prepended to all 212 parts regardless, so every part offered
  Electrokit and Kjell whether or not they had ever stocked it. Two things to know before adding one:
  the international `q` usually finds the wrong thing (Electrokit's own search for `Arduino Uno R3`
  returns four shields and a clone, so each link carries its own term, often Swedish - `kopplingsdäck`,
  `motstånd`, `lödstation`), and a search that returns *something* is not a match - `2004` finds a
  TDA2004 audio amp, `30A` finds a blade fuse. Read the results, not the count. `build-index.js`
  rejects a shop that is not eligible in its region and warns about one that ends up on no parts.
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
