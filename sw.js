/* ==========================================================================
   sw.js - the service worker.

   This site is a reference you read in a workshop or a garage, which is
   exactly where the signal is worst. So:

     - the shell (pages, CSS, JS, the parts catalogue) is precached on
       install, so the site opens instantly and works with no network
     - individual build guides are cached as you visit them
     - "Save all for offline" in the header fetches the remaining guides
       in one go, for a trip to a shed with no wifi

   The file list and the cache version are generated - see
   assets/data/precache.js, written by tools/build-index.js.
   ========================================================================== */

importScripts('./assets/data/precache.js');

const VERSION   = self.AB_PRECACHE.version;
const CORE      = self.AB_PRECACHE.core;
const GUIDES    = self.AB_PRECACHE.guides;
const CACHE     = 'buildbook-' + VERSION;
const FONTS     = 'buildbook-fonts';

/* --- install: precache the shell --------------------------------------- */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll fails the whole install if any single request fails, which
    // makes one typo silently break offline support. Add them
    // individually and report what did not make it.
    const results = await Promise.allSettled(
      CORE.map(url => cache.add(new Request(url, { cache: 'reload' })))
    );
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? CORE[i] : null))
      .filter(Boolean);
    if (failed.length) console.warn('[sw] could not precache:', failed);

    // Deliberately NOT calling skipWaiting() here. Taking over while a page
    // is already open means that page can end up running old cached HTML
    // against new JS for a moment - which is exactly the mixed-version
    // flash it looks like. Instead the new worker waits, the page offers
    // "a new version is ready / Reload", and SKIP_WAITING arrives from
    // there. On a first install there is no controller to wait behind, so
    // activation is immediate anyway.
  })());
});

/* --- activate: bin the old caches --------------------------------------- */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(n => n.startsWith('buildbook-') && n !== CACHE && n !== FONTS)
        .map(n => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

/* --- fetch --------------------------------------------------------------
   Navigations are network-first so a deployed update is picked up promptly,
   falling back to the cache and then to the offline page. Everything else
   is cache-first, because none of it changes without the version changing.
   ------------------------------------------------------------------------ */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Google Fonts: cache-first in their own bucket, and never let a failure
  // matter - every font stack on the site has a real system fallback.
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(req, FONTS));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(navigationStrategy(req));
    return;
  }

  event.respondWith(cacheFirst(req, CACHE));
});

async function navigationStrategy(req) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const offline = await cache.match('./offline.html');
    return offline || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const fresh = await fetch(req);
    if (fresh && (fresh.ok || fresh.type === 'opaque')) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    return new Response('', { status: 504 });
  }
}

/* --- messages from the page --------------------------------------------- */
self.addEventListener('message', event => {
  const msg = event.data || {};

  if (msg.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (msg.type === 'CACHE_ALL_GUIDES') {
    event.waitUntil(cacheAllGuides(event.source));
  }

  if (msg.type === 'CACHE_STATUS') {
    event.waitUntil(reportStatus(event.source));
  }
});

async function cacheAllGuides(client) {
  const cache = await caches.open(CACHE);
  let done = 0;

  for (const url of GUIDES) {
    try {
      const existing = await cache.match(url);
      if (!existing) await cache.add(new Request(url, { cache: 'reload' }));
    } catch (e) {
      console.warn('[sw] guide failed:', url, e);
    }
    done++;
    if (client) {
      client.postMessage({ type: 'CACHE_PROGRESS', done: done, total: GUIDES.length });
    }
  }

  if (client) client.postMessage({ type: 'CACHE_COMPLETE', total: GUIDES.length });
}

async function reportStatus(client) {
  const cache = await caches.open(CACHE);
  let have = 0;
  for (const url of GUIDES) {
    if (await cache.match(url)) have++;
  }
  if (client) {
    client.postMessage({ type: 'CACHE_STATUS', have: have, total: GUIDES.length, version: VERSION });
  }
}
