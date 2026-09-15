/* ==========================================================================
   site.js - chrome, theme, formatting, code blocks.
   Loaded by every page. Depends on nothing.
   ========================================================================== */
window.AB = window.AB || {};

/* --- small helpers ------------------------------------------------------ */
AB.esc = function (s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
AB.qs = function (k) {
  var m = new RegExp('[?&]' + k + '=([^&]*)').exec(location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
};
AB.usd = function (n) {
  return '$' + (n < 10 ? n.toFixed(2) : n.toFixed(n % 1 ? 2 : 0));
};
AB.eur = function (n) {
  var v = n * (AB.fx ? AB.fx.eur : 0.92);
  return '€' + (v < 10 ? v.toFixed(2) : v.toFixed(v % 1 ? 2 : 0));
};
AB.plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); };

/* Relative path back to the site root, so the shared header works from
   /index.html and from /basics/soldering.html alike. */
AB.root = function () {
  return /\/basics\//.test(location.pathname) ? '../' : '';
};

/* --- theme -------------------------------------------------------------- */
AB.theme = {
  get: function () {
    try { return localStorage.getItem('ab-theme'); } catch (e) { return null; }
  },
  set: function (v) {
    try { localStorage.setItem('ab-theme', v); } catch (e) {}
    document.documentElement.setAttribute('data-theme', v);
  },
  init: function () {
    var t = AB.theme.get();
    if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  },
  toggle: function () {
    AB.theme.set(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }
};

/* --- page chrome -------------------------------------------------------- */
AB.NAV = [
  ['index.html', 'Home'],
  ['projects.html', 'All projects'],
  ['basics/tools.html', 'Tools & buying'],
  ['basics/soldering.html', 'Soldering'],
  ['basics/electronics.html', 'Electronics'],
  ['basics/programming.html', 'Programming'],
  ['basics/glossary.html', 'Glossary']
];

AB.chrome = function (current) {
  var r = AB.root();
  var head = document.createElement('header');
  head.className = 'site-head';
  head.innerHTML =
    '<div class="bar">' +
      '<a class="brand" href="' + r + 'index.html">' +
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">' +
          '<rect x="2.5" y="7" width="19" height="10" rx="4"/>' +
          '<path d="M6 12h3.6M7.8 10.2v3.6"/><path d="M14.4 12h3.6"/>' +
        '</svg>' +
        '<span>The Arduino Build Book</span>' +
      '</a>' +
      '<nav class="nav" id="ab-nav">' +
        AB.NAV.map(function (n) {
          var on = current && n[0].indexOf(current) > -1;
          return '<a href="' + r + n[0] + '"' + (on ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
        }).join('') +
      '</nav>' +
      '<button class="icon-btn nav-toggle" id="ab-burger" aria-label="Menu" aria-expanded="false">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '</button>' +
      '<button class="icon-btn pwa-only" id="ab-offline" hidden ' +
        'aria-label="Save the whole book for offline use" title="Save offline">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 3v11m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>' +
      '</button>' +
      '<button class="icon-btn pwa-only" id="ab-install" hidden ' +
        'aria-label="Install the Build Book as an app" title="Install app">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>' +
      '</button>' +
      '<button class="icon-btn" id="ab-theme" aria-label="Switch light or dark">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
        '<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/></svg>' +
      '</button>' +
    '</div>';
  document.body.insertBefore(head, document.body.firstChild);
  AB.pwa.init();

  document.getElementById('ab-theme').addEventListener('click', AB.theme.toggle);
  var burger = document.getElementById('ab-burger');
  burger.addEventListener('click', function () {
    var nav = document.getElementById('ab-nav');
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  var foot = document.createElement('footer');
  foot.className = 'site-foot';
  foot.innerHTML =
    '<div class="wrap">' +
      '<div class="cols">' +
        '<div><h4>Start here</h4><ul>' +
          '<li><a href="' + r + 'basics/tools.html">What to buy first</a></li>' +
          '<li><a href="' + r + 'basics/soldering.html">How to solder</a></li>' +
          '<li><a href="' + r + 'basics/electronics.html">Electronics in one page</a></li>' +
          '<li><a href="' + r + 'basics/programming.html">Your first sketch</a></li>' +
        '</ul></div>' +
        '<div><h4>Browse</h4><ul>' +
          (AB.categories || []).slice(0, 5).map(function (c) {
            return '<li><a href="' + r + 'projects.html?cat=' + c.slug + '">' + AB.esc(c.name) + '</a></li>';
          }).join('') +
        '</ul></div>' +
        '<div><h4>Browse</h4><ul>' +
          (AB.categories || []).slice(5).map(function (c) {
            return '<li><a href="' + r + 'projects.html?cat=' + c.slug + '">' + AB.esc(c.name) + '</a></li>';
          }).join('') +
        '</ul></div>' +
        '<div><h4>About</h4><ul>' +
          '<li><a href="' + r + 'basics/glossary.html">Glossary</a></li>' +
          '<li><a href="' + r + 'projects.html">Every project</a></li>' +
        '</ul></div>' +
      '</div>' +
      '<p style="margin:0">Prices are typical 2026 street prices in USD and are there to help you plan, not to quote you. ' +
      'Every project here is built from parts you can buy from several suppliers; none of the links are affiliate links. ' +
      'Mains wiring is dangerous - read the warnings and, if in doubt, use a plug-in smart socket instead.</p>' +
    '</div>';
  document.body.appendChild(foot);
};

/* --- code blocks -------------------------------------------------------- */
var KEYWORDS = ('void|int|long|short|float|double|char|bool|boolean|byte|word|uint8_t|uint16_t|uint32_t|' +
  'int8_t|int16_t|int32_t|size_t|unsigned|signed|const|constexpr|static|volatile|extern|struct|class|enum|' +
  'union|typedef|template|typename|namespace|using|public|private|protected|virtual|override|new|delete|' +
  'if|else|for|while|do|switch|case|default|break|continue|return|goto|sizeof|true|false|null|nullptr|NULL|' +
  'this|operator|inline|auto|register|friend|try|catch|throw|String|PROGMEM').split('|');

var CONSTS = ('HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|LED_BUILTIN|A0|A1|A2|A3|A4|A5|A6|A7|DEC|HEX|BIN|OCT|' +
  'CHANGE|RISING|FALLING|MSBFIRST|LSBFIRST').split('|');

AB.highlight = function (src) {
  var re = /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(^[ \t]*#[^\n]*)|(\b\d[\w.]*\b)|(\b[A-Za-z_]\w*\b)/gm;
  return src.replace(re, function (m, c1, c2, s1, s2, pp, num, word, off, str) {
    if (c1 || c2) return '<span class="tok-c">' + AB.esc(m) + '</span>';
    if (s1 || s2) return '<span class="tok-s">' + AB.esc(m) + '</span>';
    if (pp) return '<span class="tok-p">' + AB.esc(m) + '</span>';
    if (num) return '<span class="tok-n">' + AB.esc(m) + '</span>';
    if (word) {
      if (KEYWORDS.indexOf(m) > -1) return '<span class="tok-k">' + m + '</span>';
      if (CONSTS.indexOf(m) > -1) return '<span class="tok-n">' + m + '</span>';
      if (/^[A-Z][A-Z0-9_]{2,}$/.test(m)) return '<span class="tok-n">' + m + '</span>';
      var after = str.slice(off + m.length).match(/^\s*\(/);
      if (after) return '<span class="tok-f">' + m + '</span>';
    }
    return AB.esc(m);
  });
};

AB.codeBlock = function (o) {
  var id = 'c' + Math.random().toString(36).slice(2, 9);
  return '<div class="code">' +
      '<div class="code-head">' +
        '<span class="name">' + AB.esc(o.name || 'sketch.ino') + '</span>' +
        '<span class="lang">' + AB.esc(o.lang || 'Arduino C++') + '</span>' +
        '<button class="copy-btn" data-copy="' + id + '">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg> Copy' +
        '</button>' +
      '</div>' +
      '<pre><code id="' + id + '">' + AB.highlight(o.code) + '</code></pre>' +
    '</div>';
};

AB.bindCopy = function (root) {
  (root || document).querySelectorAll('.copy-btn').forEach(function (b) {
    if (b._bound) return;
    b._bound = true;
    b.addEventListener('click', function () {
      var el = document.getElementById(b.dataset.copy);
      var text = el ? el.textContent : '';
      function done() {
        var old = b.innerHTML;
        b.classList.add('done');
        b.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 12.5 9.5 18 20 6.5"/></svg> Copied';
        setTimeout(function () { b.classList.remove('done'); b.innerHTML = old; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });
};

/* --- project card ------------------------------------------------------- */
AB.projectCard = function (p, r) {
  r = r || AB.root();
  var cat = AB.catIndex[p.cat] || { name: p.cat };
  var lvl = AB.levels[p.level - 1] || AB.levels[0];
  return '<a class="card proj-card" href="' + r + 'project.html?p=' + p.slug + '">' +
    '<div class="top">' +
      '<span class="chip cat">' + AB.esc(cat.name.split(' ')[0].replace(/[,&]/, '')) + '</span>' +
      '<span class="chip d' + p.level + '">' + lvl.name + '</span>' +
    '</div>' +
    '<h3>' + AB.esc(p.title) + '</h3>' +
    '<p class="blurb">' + AB.esc(p.blurb) + '</p>' +
    '<div class="proj-meta">' +
      '<span><b>' + AB.usd(AB.projectCost(p)) + '</b> to build</span>' +
      '<span>' + AB.esc(p.time) + '</span>' +
      '<span>' + (p.solder ? 'Soldering' : 'No soldering') + '</span>' +
    '</div>' +
  '</a>';
};

/* Total cost of a project, from the shared parts catalogue.
   Full project files carry a `bom`; the generated catalogue index carries a
   pre-computed `cost` instead, so cards can render without loading every
   build guide. Both paths land on the same number. */
AB.projectCost = function (p) {
  if (!p.bom && typeof p.cost === 'number') return p.cost;
  var t = 0;
  (p.bom || []).forEach(function (line) {
    var part = AB.partIndex[line.id];
    if (!part) return;
    if (line.own) return;                      // "you probably already own this"
    t += part.price * (line.qty || 1);
  });
  return t;
};

/* --- progressive web app -------------------------------------------------
   Registration, the install prompt, the "save everything offline" control
   and the update notice. All of it degrades to nothing on a browser that
   does not support service workers, or on a file:// URL where they are
   not allowed at all.
   ------------------------------------------------------------------------ */
AB.pwa = {
  deferredPrompt: null,

  init: function () {
    AB.pwa._wireInstall();
    AB.pwa._wireOffline();
    AB.pwa.register();
  },

  register: function () {
    if (!('serviceWorker' in navigator)) return;
    // Service workers need a secure context. localhost counts; file:// does not.
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' &&
        location.hostname !== '127.0.0.1') return;

    navigator.serviceWorker.register(AB.root() + 'sw.js', { scope: AB.root() })
      .then(function (reg) {
        // A worker sitting in "waiting" means a newer version is ready but
        // an old page is still open. Offer the reload rather than forcing it.
        if (reg.waiting) AB.pwa._offerUpdate(reg.waiting);

        reg.addEventListener('updatefound', function () {
          var sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', function () {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              AB.pwa._offerUpdate(sw);
            }
          });
        });
      })
      .catch(function (err) { console.warn('service worker failed:', err); });

    navigator.serviceWorker.addEventListener('message', function (e) {
      var m = e.data || {};
      if (m.type === 'CACHE_PROGRESS') AB.pwa._progress(m.done, m.total);
      if (m.type === 'CACHE_COMPLETE') AB.pwa._complete(m.total);
      if (m.type === 'CACHE_STATUS')   AB.pwa._status(m.have, m.total);
    });

    // The controller changing means we activated a new worker - reload once
    // so the page and its assets come from the same version.
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
  },

  /* --- install ---------------------------------------------------------- */
  _wireInstall: function () {
    var btn = document.getElementById('ab-install');
    if (!btn) return;

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      AB.pwa.deferredPrompt = e;
      btn.hidden = false;
    });

    btn.addEventListener('click', function () {
      var p = AB.pwa.deferredPrompt;
      if (!p) return;
      p.prompt();
      p.userChoice.then(function (choice) {
        if (choice.outcome === 'accepted') btn.hidden = true;
        AB.pwa.deferredPrompt = null;
      });
    });

    window.addEventListener('appinstalled', function () {
      btn.hidden = true;
      AB.pwa.toast('Installed. It works offline once you press Save offline.');
    });
  },

  /* --- save everything offline ------------------------------------------ */
  _wireOffline: function () {
    var btn = document.getElementById('ab-offline');
    if (!btn || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(function (reg) {
      btn.hidden = false;
      if (reg.active) reg.active.postMessage({ type: 'CACHE_STATUS' });
    });

    btn.addEventListener('click', function () {
      if (btn.dataset.state === 'busy') return;
      navigator.serviceWorker.ready.then(function (reg) {
        if (!reg.active) return;
        btn.dataset.state = 'busy';
        btn.classList.add('busy');
        AB.pwa.toast('Saving all 40 guides for offline use…', 0);
        reg.active.postMessage({ type: 'CACHE_ALL_GUIDES' });
      });
    });
  },

  _progress: function (done, total) {
    AB.pwa.toast('Saving offline — ' + done + ' of ' + total, 0);
  },

  _complete: function (total) {
    var btn = document.getElementById('ab-offline');
    if (btn) {
      btn.dataset.state = 'done';
      btn.classList.remove('busy');
      btn.classList.add('done');
      btn.title = 'All ' + total + ' guides saved offline';
    }
    AB.pwa.toast('All ' + total + ' guides saved. The whole book now works offline.');
  },

  _status: function (have, total) {
    var btn = document.getElementById('ab-offline');
    if (!btn) return;
    if (have >= total) {
      btn.dataset.state = 'done';
      btn.classList.add('done');
      btn.title = 'All ' + total + ' guides saved offline';
    } else {
      btn.title = 'Save offline (' + have + ' of ' + total + ' guides saved)';
    }
  },

  /* --- update notice ----------------------------------------------------- */
  _offerUpdate: function (worker) {
    AB.pwa.toast('A new version is ready.', 0, {
      label: 'Reload',
      action: function () { worker.postMessage({ type: 'SKIP_WAITING' }); }
    });
  },

  /* --- a small toast ----------------------------------------------------- */
  toast: function (text, ms, action) {
    var el = document.getElementById('ab-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ab-toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.innerHTML = '<span></span>';
    el.querySelector('span').textContent = text;

    if (action) {
      var b = document.createElement('button');
      b.textContent = action.label;
      b.addEventListener('click', function () { action.action(); });
      el.appendChild(b);
    }
    el.classList.add('on');

    clearTimeout(AB.pwa._toastTimer);
    if (ms !== 0) {
      AB.pwa._toastTimer = setTimeout(function () { el.classList.remove('on'); }, ms || 4200);
    }
  }
};

/* --- contents list for the hand-written reference pages ------------------
   Numbers the sections, builds the sidebar from their headings and
   highlights whichever one you are reading. Saves keeping two lists in
   sync by hand on every page.
   ------------------------------------------------------------------------ */
AB.autoToc = function () {
  var body = document.querySelector('.pbody');
  var toc = document.querySelector('.toc ol');
  if (!body || !toc) return;

  var items = [], links = {};
  body.querySelectorAll(':scope > section').forEach(function (s, i) {
    var h = s.querySelector('h2');
    if (!h || !s.id) return;
    var n = String(i + 1).padStart(2, '0');
    if (!h.querySelector('.num')) h.insertAdjacentHTML('afterbegin', '<span class="num">' + n + '</span>');
    items.push('<li><a href="#' + s.id + '">' + h.textContent.replace(n, '').trim() + '</a></li>');
  });
  toc.innerHTML = items.join('');
  toc.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });

  if (!('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var a = links[e.target.id];
      if (!a || !e.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
      a.classList.add('active');
    });
  }, { rootMargin: '-80px 0px -70% 0px' });
  body.querySelectorAll(':scope > section').forEach(function (s) { if (s.id) obs.observe(s); });
};

/* --- boot --------------------------------------------------------------- */
AB.theme.init();
