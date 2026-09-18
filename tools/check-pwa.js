#!/usr/bin/env node
/* ==========================================================================
   tools/check-pwa.js

   Static validation of the progressive web app parts. Registration itself
   can only really be exercised in a browser over HTTPS (or localhost), so
   this checks everything that can be checked without one:

     - the manifest parses and has the fields an installable app needs
     - every icon exists, is a real PNG, and is the size it claims
     - sw.js and the generated precache list are syntactically valid
     - every precached URL resolves to a file that exists
     - sw.js actually runs: it is evaluated against a stubbed worker global
       so a typo in an event name or a missing import shows up here
     - every page links the manifest and sets a theme colour
     - nothing uses an absolute /path, which would break on GitHub Pages

   Run:  node tools/check-pwa.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const fail = [];
const warn = [];
const ok = [];

function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

/* --- 1. the manifest ---------------------------------------------------- */
let manifest = null;
try {
  manifest = JSON.parse(read('manifest.webmanifest'));
  ok.push('manifest.webmanifest parses as JSON');
} catch (e) {
  fail.push('manifest.webmanifest does not parse: ' + e.message);
}

if (manifest) {
  for (const key of ['name', 'short_name', 'start_url', 'scope', 'display', 'icons']) {
    if (manifest[key] === undefined) fail.push(`manifest is missing "${key}"`);
  }
  if (manifest.display !== 'standalone' && manifest.display !== 'fullscreen' &&
      manifest.display !== 'minimal-ui') {
    fail.push(`manifest display "${manifest.display}" is not an installable value`);
  }
  if (!/^#[0-9a-f]{6}$/i.test(manifest.theme_color || '')) {
    warn.push('manifest theme_color is not a 6-digit hex colour');
  }

  // Relative paths matter: GitHub Pages serves project sites from /RepoName/.
  const paths = [manifest.start_url, manifest.scope]
    .concat((manifest.icons || []).map(i => i.src))
    .concat((manifest.shortcuts || []).map(s => s.url));
  paths.filter(Boolean).forEach(p => {
    if (p.startsWith('/')) fail.push(`manifest path "${p}" is absolute - breaks on a project subpath`);
  });
  if (!paths.some(p => p && p.startsWith('/'))) ok.push('all manifest paths are relative');

  // An installable PWA needs a 192 and a 512, and Android wants a maskable.
  const sizes = (manifest.icons || []).map(i => i.sizes);
  if (!sizes.includes('192x192')) fail.push('manifest has no 192x192 icon');
  if (!sizes.includes('512x512')) fail.push('manifest has no 512x512 icon');
  if (!(manifest.icons || []).some(i => (i.purpose || '').includes('maskable'))) {
    warn.push('no maskable icon - Android will letterbox the icon');
  }

  /* --- 2. the icons really are what they claim -------------------------- */
  (manifest.icons || []).forEach(icon => {
    if (!exists(icon.src)) { fail.push(`icon missing on disk: ${icon.src}`); return; }
    if (icon.type !== 'image/png') return;

    const b = fs.readFileSync(path.join(ROOT, icon.src));
    const sig = b.slice(0, 8).toString('hex');
    if (sig !== '89504e470d0a1a0a') { fail.push(`${icon.src} is not a valid PNG`); return; }
    const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
    const [dw, dh] = icon.sizes.split('x').map(Number);
    if (w !== dw || h !== dh) {
      fail.push(`${icon.src} is ${w}x${h} but the manifest says ${icon.sizes}`);
    } else {
      ok.push(`${icon.src} is a valid ${w}x${h} PNG`);
    }
  });
}

/* --- 3. the precache list ----------------------------------------------- */
let precache = null;
try {
  const ctx = { self: {} };
  vm.createContext(ctx);
  vm.runInContext(read('assets/data/precache.js'), ctx, { filename: 'precache.js' });
  precache = ctx.self.AB_PRECACHE;
  if (!precache) throw new Error('did not set self.AB_PRECACHE');
  ok.push(`precache list: ${precache.core.length} core + ${precache.guides.length} guides, version ${precache.version}`);
} catch (e) {
  fail.push('precache.js: ' + e.message);
}

if (precache) {
  const all = precache.core.concat(precache.guides);
  all.forEach(u => {
    if (u.startsWith('/')) fail.push(`precache path "${u}" is absolute - breaks on a project subpath`);
    if (u === './') return;                       // the directory index
    if (!exists(u.replace(/^\.\//, ''))) fail.push(`precache lists a missing file: ${u}`);
  });
  if (!all.some(u => u.startsWith('/'))) ok.push('all precache paths are relative');

  // Everything a first visit needs must be in core, not left to runtime.
  ['./index.html', './offline.html', './assets/css/style.css', './assets/js/site.js',
   './assets/data/index.js'].forEach(u => {
    if (!precache.core.includes(u)) fail.push(`core precache is missing ${u}`);
  });

  // Every project guide should be listed, or "save offline" lies.
  const guideCount = fs.readdirSync(path.join(ROOT, 'assets/data/projects'))
    .filter(f => f.endsWith('.js')).length;
  if (precache.guides.length !== guideCount) {
    fail.push(`precache lists ${precache.guides.length} guides but there are ${guideCount} project files - rerun build-index.js`);
  } else {
    ok.push(`all ${guideCount} guides are in the offline list`);
  }
}

/* --- 4. sw.js actually evaluates ---------------------------------------- */
try {
  const listeners = {};
  const stub = {
    addEventListener: (name, fn) => { listeners[name] = fn; },
    skipWaiting: () => {},
    clients: { claim: () => {} },
    location: { origin: 'https://example.com' },
    importScripts: (rel) => {
      const p = rel.replace(/^\.\//, '');
      if (!exists(p)) throw new Error('importScripts target missing: ' + rel);
      vm.runInContext(read(p), ctx, { filename: p });
    }
  };
  const ctx = {
    self: stub,
    caches: { open: async () => ({}), keys: async () => [], match: async () => null, delete: async () => {} },
    fetch: async () => ({}),
    Request: function () {}, Response: function () {}, URL: URL,
    console: { warn: () => {}, log: () => {} },
    Promise: Promise
  };
  ctx.importScripts = stub.importScripts;
  vm.createContext(ctx);
  vm.runInContext(read('sw.js'), ctx, { filename: 'sw.js' });

  ['install', 'activate', 'fetch', 'message'].forEach(ev => {
    if (typeof listeners[ev] !== 'function') fail.push(`sw.js registers no "${ev}" handler`);
  });

  // Taking over during install makes an already-open page run old cached
  // HTML against new JS until it reloads. The update toast exists so the
  // reader triggers that swap instead.
  const sw = read('sw.js');
  const installBody = sw.slice(sw.indexOf("addEventListener('install'"), sw.indexOf("addEventListener('activate'"));
  if (/^\s*[^/\n]*\bskipWaiting\s*\(/m.test(installBody)) {
    fail.push('sw.js calls skipWaiting() during install - that causes a mixed-version page until it reloads');
  } else {
    ok.push('install does not skipWaiting, so updates go through the reload prompt');
  }
  if (!sw.includes("'SKIP_WAITING'")) {
    fail.push('sw.js has no SKIP_WAITING message handler, so the update prompt cannot apply an update');
  }
  if (Object.keys(listeners).length) {
    ok.push('sw.js evaluates and registers: ' + Object.keys(listeners).join(', '));
  }
} catch (e) {
  fail.push('sw.js failed to evaluate: ' + e.message);
}

/* --- 5. every page is wired up ------------------------------------------ */
/* Discovered, not listed. The root list used to be hardcoded, so news.html
   - added later - was never checked at all. offline.html is the service
   worker's fallback page and deliberately does not link the manifest. */
const NO_MANIFEST = ['offline.html'];
const pages = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.html') && !NO_MANIFEST.includes(f))
  .concat(fs.readdirSync(path.join(ROOT, 'basics')).filter(f => f.endsWith('.html')).map(f => 'basics/' + f));

pages.forEach(p => {
  const s = read(p);
  const deep = p.includes('/');
  const want = deep ? '../manifest.webmanifest' : 'manifest.webmanifest';

  if (!s.includes(`rel="manifest" href="${want}"`)) {
    fail.push(`${p}: manifest link missing or wrong depth (expected ${want})`);
  }
  if (!s.includes('name="theme-color"')) fail.push(`${p}: no theme-color meta`);
  if (!s.includes('rel="apple-touch-icon"')) warn.push(`${p}: no apple-touch-icon`);
  if (!s.includes('assets/js/site.js') && !s.includes('../assets/js/site.js')) {
    fail.push(`${p}: does not load site.js, so it will not register the worker`);
  }
});
if (!fail.length) ok.push(`all ${pages.length} pages link the manifest at the right depth`);

/* --- 6. registration path logic ----------------------------------------- */
const site = read('assets/js/site.js');
if (!site.includes("root + 'sw.js'")) {
  fail.push('site.js does not register the worker relative to the site root');
} else {
  ok.push('service worker is registered relative to the root, so /basics/ pages resolve correctly');
}
if (site.includes("register('/sw.js'")) fail.push('site.js registers an absolute /sw.js - breaks on a project subpath');

/* AB.root() is '' at the top level. Passing that as the scope resolves to
   the current document rather than the directory, so the worker would only
   ever control index.html. There has to be a './' fallback. */
if (!/AB\.root\(\)\s*\|\|\s*'\.\/'/.test(site)) {
  fail.push("site.js must fall back to './' for scope - an empty scope only covers the one page");
} else {
  ok.push("scope falls back to './', so the worker covers the whole site");
}

/* --- report ------------------------------------------------------------- */
console.log('');
ok.forEach(m => console.log('  ✓ ' + m));
if (warn.length) {
  console.log('');
  warn.forEach(m => console.log('  ! ' + m));
}
if (fail.length) {
  console.log('');
  fail.forEach(m => console.log('  ✗ ' + m));
  console.log(`\n${fail.length} problem(s).\n`);
  process.exit(1);
}
console.log(`\nPWA checks passed${warn.length ? ` (${warn.length} warning(s))` : ''}.\n`);
