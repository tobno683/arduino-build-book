#!/usr/bin/env node
/* ==========================================================================
   tools/build-index.js

   Regenerates assets/data/index.js - the small summary file the home page
   and the project list read, so that browsing the catalogue does not mean
   downloading thirty full build guides.

   Run it after adding or editing any project:   node tools/build-index.js

   It also validates as it goes and refuses to write a broken index:
     - every BOM line points at a part that exists
     - every 3D wire endpoint resolves to a real pin on a real component
     - every category slug exists
     - slugs are unique and match their filename
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const PROJ_DIR = path.join(ROOT, 'assets', 'data', 'projects');

function sandbox() {
  const s = {};
  s.window = s;
  s.globalThis = s;
  s.console = { warn: () => {}, error: () => {}, log: () => {} };
  s.document = { createElement: () => ({ style: {} }) };
  s.matchMedia = () => ({ matches: false });
  s.localStorage = { getItem: () => null, setItem: () => {} };
  s.navigator = {};
  s.location = { search: '', pathname: '/' };
  vm.createContext(s);
  return s;
}

function run(ctx, rel) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { filename: rel });
}

const ctx = sandbox();
run(ctx, 'assets/data/parts.js');
run(ctx, 'assets/data/categories.js');
run(ctx, 'assets/data/news.js');
run(ctx, 'assets/data/boards.js');
run(ctx, 'assets/data/drones.js');
run(ctx, 'assets/js/build3d.js');
run(ctx, 'assets/js/parts3d.js');

const AB = ctx.AB;
AB.projects = [];
AB.addProject = p => AB.projects.push(p);

const files = fs.existsSync(PROJ_DIR)
  ? fs.readdirSync(PROJ_DIR).filter(f => f.endsWith('.js')).sort()
  : [];

const errors = [];
const warnings = [];

for (const f of files) {
  const before = AB.projects.length;
  try {
    run(ctx, 'assets/data/projects/' + f);
  } catch (e) {
    errors.push(`${f}: threw while loading - ${e.message}`);
    continue;
  }
  if (AB.projects.length !== before + 1) {
    errors.push(`${f}: expected exactly one AB.addProject() call, got ${AB.projects.length - before}`);
    continue;
  }
  const p = AB.projects[AB.projects.length - 1];
  if (p.slug + '.js' !== f) errors.push(`${f}: slug "${p.slug}" does not match the filename`);
}

const seen = new Set();
for (const p of AB.projects) {
  const where = p.slug + '.js';
  if (seen.has(p.slug)) errors.push(`${where}: duplicate slug`);
  seen.add(p.slug);

  for (const k of ['title', 'cat', 'level', 'time', 'blurb']) {
    if (p[k] === undefined) errors.push(`${where}: missing "${k}"`);
  }
  if (!AB.catIndex[p.cat]) errors.push(`${where}: unknown category "${p.cat}"`);
  if (![1, 2, 3, 4, 5].includes(p.level)) errors.push(`${where}: level must be 1-5`);

  (p.bom || []).forEach(line => {
    if (!AB.partIndex[line.id]) errors.push(`${where}: BOM references unknown part "${line.id}"`);
  });
  (p.tools || []).forEach(t => {
    const id = typeof t === 'string' ? t : t.id;
    if (!AB.partIndex[id]) errors.push(`${where}: tools references unknown part "${id}"`);
  });

  // 3D scene: resolve every component and every wire endpoint for real
  if (p.build) {
    const inst = {};
    (p.build.parts || []).forEach(it => {
      if (!AB.comp[it.comp]) { errors.push(`${where}: 3D uses unknown component "${it.comp}"`); return; }
      /* Actually draw it. Checking pin names only catches half the
         problem - a component with a broken build() passes every name
         check and then throws in the browser. */
      try {
        const faces = AB.comp[it.comp].build(it.opt || {});
        if (!Array.isArray(faces)) {
          errors.push(`${where}: component "${it.comp}" build() did not return faces`);
        }
      } catch (e) {
        errors.push(`${where}: component "${it.comp}" failed to build - ${e.message}`);
      }
      if (inst[it.id]) errors.push(`${where}: 3D part id "${it.id}" used twice`);
      inst[it.id] = AB.comp[it.comp];
      if (!Array.isArray(it.at) || it.at.length !== 2) errors.push(`${where}: 3D part "${it.id}" needs at:[x,z]`);
    });
    (p.build.wires || []).forEach(w => {
      ['from', 'to'].forEach(side => {
        const ref = w[side];
        if (!ref || ref.indexOf('.') < 0) { errors.push(`${where}: wire ${side} "${ref}" is not "part.PIN"`); return; }
        const id = ref.slice(0, ref.indexOf('.')), pin = ref.slice(ref.indexOf('.') + 1);
        const def = inst[id];
        if (!def) { errors.push(`${where}: wire ${side} "${ref}" - no 3D part called "${id}"`); return; }
        const p3 = (def.pins && def.pins[pin]) || (def.pin && def.pin(pin));
        if (!p3) errors.push(`${where}: wire ${side} "${ref}" - "${def.name}" has no pin "${pin}"`);
      });
      if (w.color && !AB.wireColors[w.color] && w.color[0] !== '#') {
        warnings.push(`${where}: wire colour "${w.color}" is not one of the standard names`);
      }
    });
    // every non-base component should be wired to something
    const touched = new Set();
    (p.build.wires || []).forEach(w => {
      touched.add(w.from.split('.')[0]);
      touched.add(w.to.split('.')[0]);
    });
    (p.build.parts || []).forEach(it => {
      if (!touched.has(it.id) && !it.decor) warnings.push(`${where}: 3D part "${it.id}" has no wires`);
    });
  }

  if (!p.code || !p.code.length) warnings.push(`${where}: no code blocks`);
  /* The board filter is built from this, so a project with no board
     part in its BOM would be invisible to it. */
  if (!(p.bom || []).some(l => AB.partIndex[l.id] && AB.partIndex[l.id].cat === 'Board')) {
    warnings.push(`${where}: no part in the "Board" category - it will not appear under any board filter`);
  }
  if (p.solder && !(p.solderSteps || []).length) warnings.push(`${where}: marked as needing soldering but has no soldering steps`);
}

/* ==========================================================================
   Local shop links are opt-in per part and have to be checked against the
   shop before they go in. A link to a shop that does not stock the thing is
   worse than no link, because the reader spends the click to find out.
   ========================================================================== */
const localShopCount = {};
AB.parts.forEach(p => {
  const where = `parts.js: "${p.id}"`;
  Object.keys(p.local || {}).forEach(regionId => {
    const region = AB.regions[regionId];
    if (!region) {
      errors.push(`${where}: local shops listed for unknown region "${regionId}"`);
      return;
    }
    const allowed = region.shops || [];
    const shops = p.local[regionId];
    if (!shops || typeof shops !== 'object') {
      errors.push(`${where}: local.${regionId} must be an object of shopId -> search term`);
      return;
    }
    Object.keys(shops).forEach(shopId => {
      if (!AB.suppliers[shopId]) {
        errors.push(`${where}: local.${regionId} names unknown shop "${shopId}"`);
      } else if (!allowed.includes(shopId)) {
        errors.push(`${where}: "${shopId}" is not one of the ${regionId} shops (${allowed.join(', ') || 'none'})`);
      }
      const term = shops[shopId];
      if (term !== true && (typeof term !== 'string' || !term.trim())) {
        errors.push(`${where}: local.${regionId}.${shopId} must be true or a non-empty search term`);
      }
      const key = regionId + '/' + shopId;
      localShopCount[key] = (localShopCount[key] || 0) + 1;
    });
  });
});

/* A region whose shops stock nothing is a dead option in the picker. */
Object.keys(AB.regions).forEach(regionId => {
  (AB.regions[regionId].shops || []).forEach(shopId => {
    if (!AB.suppliers[shopId]) {
      errors.push(`parts.js: region "${regionId}" lists unknown shop "${shopId}"`);
    } else if (!localShopCount[regionId + '/' + shopId]) {
      warnings.push(`parts.js: no part is marked as stocked at "${shopId}" - it will never appear`);
    }
  });
});

/* ==========================================================================
   The drone guide. It is reference rather than a project, so the checks
   are lighter - but a class with no downside listed is an advertisement,
   and a pitfall with no fix is just a complaint.
   ========================================================================== */
const droneIds = new Set();
(AB.droneClasses || []).forEach((c, i) => {
  const where = `drones.js: class "${c.id || '#' + i}"`;
  ['id', 'name', 'prop', 'cells', 'motor', 'auw', 'flight', 'cost', 'avoid', 'note'].forEach(k => {
    if (!c[k]) errors.push(`${where}: missing "${k}"`);
  });
  if (droneIds.has(c.id)) errors.push(`${where}: duplicate id`);
  droneIds.add(c.id);
  if (!(c.useFor || []).length) errors.push(`${where}: no "useFor" entries`);
});

(AB.droneFrames || []).forEach((f, i) => {
  const where = `drones.js: frame "${f.id || '#' + i}"`;
  ['id', 'name', 'shape', 'goodFor', 'badFor', 'note'].forEach(k => {
    if (!f[k]) errors.push(`${where}: missing "${k}"`);
  });
});

(AB.dronePitfalls || []).forEach((p, i) => {
  const where = `drones.js: pitfall #${i}`;
  ['h', 'symptom', 'cause', 'fix'].forEach(k => {
    if (!p[k]) errors.push(`${where}: missing "${k}" - a pitfall without a fix is just a complaint`);
  });
});

if (!AB.droneGuide || !droneIds.has(AB.droneGuide.firstBuild)) {
  errors.push('drones.js: AB.droneGuide.firstBuild must name a class defined above');
}
/* The page lists the drone projects straight from the index, so the
   theme has to exist or the last section renders empty. */
if (!AB.catIndex['drones']) {
  errors.push('drones.js: the "drones" category is gone - basics/drones.html links to it');
}

/* ==========================================================================
   The board guide. Every part in the Board category must be written up,
   and every write-up must point at a real part - otherwise adding a board
   to the shop silently leaves a hole in basics/boards.html, or the page
   describes something nobody can buy.
   ========================================================================== */
const BOARD_TIERS = ['classic', 'wireless', 'special', 'linux'];
const SPEC_KEYS = ['clock', 'ram', 'flash', 'io', 'logic', 'usb', 'wireless', 'power'];

const writtenUp = new Set();
(AB.boards || []).forEach((b, i) => {
  const where = `boards.js: "${b.id || '#' + i}"`;

  ['id', 'tier', 'chip', 'tagline', 'pick', 'avoid'].forEach(k => {
    if (!b[k]) errors.push(`${where}: missing "${k}"`);
  });
  if (writtenUp.has(b.id)) errors.push(`${where}: duplicate entry`);
  writtenUp.add(b.id);

  const part = AB.partIndex[b.id];
  if (!part) {
    errors.push(`${where}: no part with this id`);
  } else if (part.cat !== 'Board') {
    errors.push(`${where}: "${b.id}" is a ${part.cat}, not a Board`);
  }

  if (!BOARD_TIERS.includes(b.tier)) {
    errors.push(`${where}: tier "${b.tier}" is not one of ${BOARD_TIERS.join(', ')}`);
  }

  SPEC_KEYS.forEach(k => {
    if (!b.specs || !b.specs[k]) errors.push(`${where}: specs.${k} is missing`);
  });

  /* The whole point of the page is the honest half. A board with no
     downsides listed is a advertisement, not a guide. */
  if (!(b.goodAt || []).length) errors.push(`${where}: no "goodAt" entries`);
  if (!(b.badAt || []).length)  errors.push(`${where}: no "badAt" entries`);
  if (!(b.gotchas || []).length) {
    warnings.push(`${where}: no gotchas - every board has at least one`);
  }
});

AB.parts.filter(p => p.cat === 'Board').forEach(p => {
  if (!writtenUp.has(p.id)) {
    errors.push(`boards.js: board part "${p.id}" has no write-up - it would be missing from basics/boards.html`);
  }
});

if (!AB.boardGuide || !AB.partIndex[AB.boardGuide.firstBoard]) {
  errors.push('boards.js: AB.boardGuide.firstBoard must name a real part');
}

/* ==========================================================================
   The news shelf. Same deal as projects: anything that would render a dead
   link or a wrong badge is an error, not a warning. Staleness is a warning,
   because the page stays correct - it just stops being news.
   ========================================================================== */
const NEWS_STATUS = ['shipping', 'preorder', 'announced', 'rumour'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date().toISOString().slice(0, 10);

if (!DATE_RE.test(AB.newsChecked || '')) {
  errors.push('news.js: AB.newsChecked must be a YYYY-MM-DD date');
} else {
  const days = Math.round((Date.parse(today) - Date.parse(AB.newsChecked)) / 86400000);
  if (days > 45) warnings.push(`news.js: last checked ${days} days ago - news.html will show its stale banner`);
}

const newsIds = new Set();
let prevNewsDate = '9999-99-99';
(AB.news || []).forEach((n, i) => {
  const where = `news.js: "${n.id || '#' + i}"`;
  ['id', 'date', 'status', 'vendor', 'title', 'blurb', 'why'].forEach(k => {
    if (!n[k]) errors.push(`${where}: missing "${k}"`);
  });
  if (newsIds.has(n.id)) errors.push(`${where}: duplicate id`);
  newsIds.add(n.id);

  if (!NEWS_STATUS.includes(n.status)) {
    errors.push(`${where}: status "${n.status}" is not one of ${NEWS_STATUS.join(', ')}`);
  }
  if (!DATE_RE.test(n.date || '')) {
    errors.push(`${where}: date must be YYYY-MM-DD`);
  } else {
    if (n.date > today) errors.push(`${where}: dated in the future (${n.date})`);
    if (n.date > prevNewsDate) errors.push(`${where}: out of order - the list must be newest first`);
    prevNewsDate = n.date;
  }
  /* Something you cannot buy, with no date on it, is the exact vagueness
     this page exists to cut through. */
  if (n.status !== 'shipping' && !n.avail) {
    warnings.push(`${where}: status is "${n.status}" but no "avail" - readers cannot tell when`);
  }
  if (n.part && !AB.partIndex[n.part]) errors.push(`${where}: unknown part "${n.part}"`);
  if (n.cat && !AB.catIndex[n.cat]) errors.push(`${where}: unknown category "${n.cat}"`);
  (n.projects || []).forEach(slug => {
    if (!seen.has(slug)) errors.push(`${where}: links to unknown project "${slug}"`);
  });
  if (!(n.src || []).length) {
    warnings.push(`${where}: no source link - an unsourced claim on a news page is a rumour`);
  }
  (n.src || []).forEach(s => {
    if (!s.t || !s.u) errors.push(`${where}: every src needs both "t" and "u"`);
    else if (!/^https?:\/\//.test(s.u)) errors.push(`${where}: src "${s.t}" is not an http(s) URL`);
  });
});

if (errors.length) {
  console.error('\nRefusing to write the index - fix these first:\n');
  errors.forEach(e => console.error('  x ' + e));
  console.error('');
  process.exit(1);
}

/* Which boards a project uses, in BOM order - so boards[0] is the
   primary one, because BOMs list the main board first. Derived from
   the BOM rather than from the free-text `board` field, which says
   things like "Jetson + Uno" and "ESP32 x2" and cannot be parsed. */
const boardsOf = p => {
  const seen = [];
  (p.bom || []).forEach(l => {
    const part = AB.partIndex[l.id];
    if (part && part.cat === 'Board' && !seen.includes(l.id)) seen.push(l.id);
  });
  return seen;
};

const cost = p => (p.bom || []).reduce((t, l) => {
  const part = AB.partIndex[l.id];
  return t + (part && !l.own ? part.price * (l.qty || 1) : 0);
}, 0);

const index = AB.projects.map(p => ({
  slug: p.slug,
  title: p.title,
  cat: p.cat,
  level: p.level,
  time: p.time,
  solder: !!p.solder,
  board: p.board || 'Uno',
  blurb: p.blurb,
  tags: p.tags || [],
  feature: !!p.feature,
  cost: Math.round(cost(p) * 100) / 100,
  boards: boardsOf(p)
})).sort((a, b) => a.cat.localeCompare(b.cat) || a.level - b.level || a.title.localeCompare(b.title));

const out =
`/* ==========================================================================
   index.js - GENERATED FILE, do not edit by hand.
   Rebuild with:  node tools/build-index.js
   A summary of every project so the home page and the catalogue can render
   without loading ${index.length} full build guides.
   ========================================================================== */
window.AB = window.AB || {};

AB.index = ${JSON.stringify(index, null, 2)};
`;

fs.writeFileSync(path.join(ROOT, 'assets', 'data', 'index.js'), out.replace(/\n/g, '\r\n'));

console.log(`Wrote assets/data/index.js - ${index.length} projects across ${new Set(index.map(p => p.cat)).size} themes.`);

writePrecache(AB.projects);
const byCat = {};
index.forEach(p => { byCat[p.cat] = (byCat[p.cat] || 0) + 1; });
Object.keys(byCat).sort().forEach(c => console.log(`   ${c.padEnd(14)} ${byCat[c]}`));
if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach(w => console.log('  ! ' + w));
}

/* ==========================================================================
   The service worker's file list, generated so that adding a project makes
   it available offline without anyone remembering to update a list.

   Paths are relative (./x), because GitHub Pages serves this from a
   subdirectory and absolute /paths would break there.

   `core` is precached on install - the shell, small and fast.
   `guides` are cached as they are visited, or all at once via the
   "Save offline" button.
   ========================================================================== */
function writePrecache(projects) {
  const crypto = require('crypto');

  const core = [
    './',
    './index.html',
    './projects.html',
    './project.html',
    './offline.html',
    './manifest.webmanifest',
    './basics/boards.html',
    './basics/drones.html',
    './basics/tools.html',
    './basics/soldering.html',
    './basics/electronics.html',
    './basics/programming.html',
    './basics/glossary.html',
    './news.html',
    './assets/css/style.css',
    './assets/js/site.js',
    './assets/js/project.js',
    './assets/js/build3d.js',
    './assets/js/parts3d.js',
    './assets/data/parts.js',
    './assets/data/categories.js',
    './assets/data/glossary.js',
    './assets/data/news.js',
    './assets/data/boards.js',
    './assets/data/drones.js',
    './assets/data/index.js',
    './assets/favicon.svg',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/icons/icon-maskable-192.png',
    './assets/icons/icon-maskable-512.png',
    './assets/icons/apple-touch-icon.png'
  ];

  const guides = projects.map(p => `./assets/data/projects/${p.slug}.js`);

  // Anything listed but missing from disk would silently break the install,
  // so check before writing.
  const missing = core
    .filter(u => u !== './')
    .concat(guides)
    .filter(u => !fs.existsSync(path.join(ROOT, u.replace(/^\.\//, ''))));

  if (missing.length) {
    console.error('\nRefusing to write the precache list - these files do not exist:');
    missing.forEach(m => console.error('  x ' + m));
    process.exit(1);
  }

  // Version from the content itself, so the cache busts exactly when
  // something actually changed and not on every build.
  const hash = crypto.createHash('sha1');
  core.concat(guides)
    .filter(u => u !== './')
    .sort()
    .forEach(u => {
      hash.update(u);
      hash.update(fs.readFileSync(path.join(ROOT, u.replace(/^\.\//, ''))));
    });
  const version = hash.digest('hex').slice(0, 12);

  const body =
`/* ==========================================================================
   precache.js - GENERATED FILE, do not edit by hand.
   Rebuild with:  node tools/build-index.js

   Loaded by sw.js via importScripts(). The version is a hash of every
   listed file, so the cache is replaced exactly when the content changes.
   ========================================================================== */
self.AB_PRECACHE = {
  version: ${JSON.stringify(version)},
  core: ${JSON.stringify(core, null, 2).replace(/\n/g, '\n  ')},
  guides: ${JSON.stringify(guides, null, 2).replace(/\n/g, '\n  ')}
};
`;

  fs.writeFileSync(path.join(ROOT, 'assets', 'data', 'precache.js'), body.replace(/\n/g, '\r\n'));
  const kb = core.concat(guides)
    .filter(u => u !== './')
    .reduce((t, u) => t + fs.statSync(path.join(ROOT, u.replace(/^\.\//, ''))).size, 0) / 1024;
  console.log(`News shelf - ${(AB.news || []).length} items, last checked ${AB.newsChecked}.`);
  console.log(`Wrote assets/data/precache.js - ${core.length} core + ${guides.length} guides, ${kb.toFixed(0)} KB, version ${version}.`);
}
