/* ==========================================================================
   site.js - chrome, theme, formatting, code blocks.
   Loaded by every page. Depends on nothing.
   ========================================================================== */
window.AB = window.AB || {};

/* --- small helpers ------------------------------------------------------ */
/* Display name for a board part id. Board parts carry a short name
   because the full one is right for a bill of materials and too long
   for a dropdown - "Arduino Uno R3 (or a clone)" against "Arduino
   Uno". Falls back sensibly if either is missing. */
AB.boardName = function (id) {
  var p = AB.partIndex && AB.partIndex[id];
  return p ? (p.short || p.name) : id;
};

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

/* --- language ------------------------------------------------------------
   English is the source and the lookup key, so a string with no Swedish
   entry renders in English rather than as a missing key. Changing
   language reloads, because every page builds its content from JS at
   load time and re-rendering all of it in place would be far more code
   for the same result. */
AB.lang = {
  get: function () {
    try {
      var v = localStorage.getItem('ab-lang');
      if (v) return v;
    } catch (e) {}
    // No choice stored: follow the browser, the same way regions do.
    try { return /^sv/i.test(navigator.language || '') ? 'sv' : 'en'; } catch (e) {}
    return 'en';
  },
  set: function (v) {
    try { localStorage.setItem('ab-lang', v); } catch (e) {}
    location.reload();
  },
  init: function () {
    document.documentElement.setAttribute('lang', AB.lang.get());
  }
};

/* Walk static markup and translate anything carrying data-i18n. Lets
   hand-written HTML be translated in place rather than being moved into
   a data file. Use data-i18n-html where the string contains markup. */
AB.applyI18n = function (root) {
  if (AB.lang.get() === 'en') return;
  (root || document).querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n') || el.textContent.trim();
    el.textContent = AB.t(key);
  });
  (root || document).querySelectorAll('[data-i18n-html]').forEach(function (el) {
    el.innerHTML = AB.t(el.getAttribute('data-i18n-html'));
  });
  (root || document).querySelectorAll('[data-i18n-ph]').forEach(function (el) {
    el.setAttribute('placeholder', AB.t(el.getAttribute('data-i18n-ph')));
  });
};

/* Translate. Keyed on the English string - see assets/data/i18n.js. */
AB.t = function (s) {
  var d = AB.i18n && AB.i18n[AB.lang.get()];
  if (!d) return s;
  var hit = d[s];
  if (hit) return hit;
  // Allow a 'context|String' key, falling back to the plain string.
  var bar = s.indexOf('|');
  return bar > -1 ? (d[s] || s.slice(bar + 1)) : s;
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
    /* Dark unless the reader has chosen otherwise on this site. The OS
       preference is deliberately NOT consulted - this book is mostly read
       in a workshop at night, and a light-themed OS should not override
       that. The toggle stores a choice, and a stored choice always wins. */
    document.documentElement.setAttribute('data-theme', AB.theme.get() || 'dark');
  },
  toggle: function () {
    AB.theme.set(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }
};

/* --- page chrome -------------------------------------------------------- */
AB.NAV = [
  ['index.html', 'Home'],
  ['projects.html', 'All projects'],
  ['news.html', 'New boards'],
  ['basics/boards.html', 'Which board'],
  ['basics/drones.html', 'Drones'],
  ['basics/tools.html', 'Tools & buying'],
  ['basics/soldering.html', 'Soldering'],
  ['basics/electronics.html', 'Electronics'],
  ['basics/programming.html', 'Programming'],
  ['basics/glossary.html', 'Glossary']
];

AB.chrome = function (current) {
  var r = AB.root();
  // With two languages the picker is a toggle; this is the one it goes to.
  var here = AB.lang.get();
  var other = AB.languages.filter(function (l) { return l.code !== here; })[0] || AB.languages[0];
  var head = document.createElement('header');
  head.className = 'site-head';
  head.innerHTML =
    '<div class="bar">' +
      '<a class="brand" href="' + r + 'index.html">' +
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">' +
          '<rect x="2.5" y="7" width="19" height="10" rx="4"/>' +
          '<path d="M6 12h3.6M7.8 10.2v3.6"/><path d="M14.4 12h3.6"/>' +
        '</svg>' +
        '<span>The Build Book</span>' +
      '</a>' +
      '<nav class="nav" id="ab-nav">' +
        AB.NAV.map(function (n) {
          var on = current && n[0].indexOf(current) > -1;
          return '<a href="' + r + n[0] + '"' + (on ? ' aria-current="page"' : '') + '>' +
                 AB.esc(AB.t(n[1])) + '</a>';
        }).join('') +
      '</nav>' +
      '<button class="icon-btn nav-toggle" id="ab-burger" aria-label="' + AB.esc(AB.t('Menu')) + '" aria-expanded="false">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '</button>' +
      '<button class="icon-btn pwa-only" id="ab-offline" hidden ' +
        'aria-label="' + AB.esc(AB.t('Save the whole book for offline use')) +
        '" title="' + AB.esc(AB.t('Save offline')) + '">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 3v11m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>' +
      '</button>' +
      '<button class="icon-btn pwa-only" id="ab-install" hidden ' +
        'aria-label="' + AB.esc(AB.t('Install the Build Book as an app')) +
        '" title="' + AB.esc(AB.t('Install app')) + '">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>' +
      '</button>' +
      '<button class="icon-btn lang-btn" id="ab-lang" aria-label="' + AB.esc(AB.t('Language')) +
        '" title="' + AB.esc(other.code === 'sv' ? AB.t('Switch to Svenska') : AB.t('Switch to English')) + '">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">' +
        '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/>' +
        '<path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></svg>' +
        '<span>' + AB.esc(other.short) + '</span>' +
      '</button>' +
      '<button class="icon-btn" id="ab-theme" aria-label="' + AB.esc(AB.t('Switch light or dark')) + '">' +
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
        '<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/></svg>' +
      '</button>' +
    '</div>';
  document.body.insertBefore(head, document.body.firstChild);
  AB.lang.init();
  AB.applyI18n();
  AB.pwa.init();

  document.getElementById('ab-theme').addEventListener('click', AB.theme.toggle);
  document.getElementById('ab-lang').addEventListener('click', function () {
    AB.lang.set(other.code);
  });
  var burger = document.getElementById('ab-burger');
  var nav = document.getElementById('ab-nav');

  function setNav(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  burger.addEventListener('click', function (e) {
    e.stopPropagation();           // or the document handler closes it again
    setNav(!nav.classList.contains('open'));
  });

  /* An open menu covers the page, so anything outside it should dismiss it
     rather than needing a second trip to the burger. Tapping a link inside
     closes it too: same-page anchors would otherwise leave it hanging open
     over the thing you just navigated to. */
  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(e.target) && !e.target.closest('a')) return;
    setNav(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setNav(false);
      burger.focus();
    }
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

/* --- code blocks --------------------------------------------------------
   A small multi-language highlighter. The Linux-side boards in the AI
   projects are programmed in Python and set up from a shell, so C++ alone
   is not enough - Python highlighted with C++ rules looks broken in a way
   that undermines trust in the code.
   ------------------------------------------------------------------------ */
var LANGS = {
  cpp: {
    label: 'Arduino C++',
    line: '//',
    keywords: ('void|int|long|short|float|double|char|bool|boolean|byte|word|uint8_t|uint16_t|uint32_t|' +
      'int8_t|int16_t|int32_t|size_t|unsigned|signed|const|constexpr|static|volatile|extern|struct|class|enum|' +
      'union|typedef|template|typename|namespace|using|public|private|protected|virtual|override|new|delete|' +
      'if|else|for|while|do|switch|case|default|break|continue|return|goto|sizeof|true|false|null|nullptr|NULL|' +
      'this|operator|inline|auto|register|friend|try|catch|throw|String|PROGMEM').split('|'),
    consts: ('HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|LED_BUILTIN|A0|A1|A2|A3|A4|A5|A6|A7|DEC|HEX|BIN|OCT|' +
      'CHANGE|RISING|FALLING|MSBFIRST|LSBFIRST').split('|')
  },
  python: {
    label: 'Python',
    line: '#',
    keywords: ('def|class|return|yield|lambda|import|from|as|if|elif|else|for|while|break|continue|pass|' +
      'in|is|not|and|or|try|except|finally|raise|with|global|nonlocal|assert|del|async|await|self|cls|' +
      'True|False|None|print|len|range|open|enumerate|zip|int|float|str|bool|list|dict|set|tuple').split('|'),
    consts: ('True|False|None|__name__|__main__').split('|')
  },
  bash: {
    label: 'Shell',
    line: '#',
    keywords: ('sudo|apt|apt-get|pip|pip3|install|cd|ls|mkdir|rm|cp|mv|echo|export|source|chmod|chown|' +
      'systemctl|docker|git|curl|wget|python|python3|nano|sh|bash|if|then|fi|for|do|done|while').split('|'),
    consts: []
  }
};

/* Work out the language from an explicit label or the file extension. */
AB.langOf = function (o) {
  var hint = ((o.lang || '') + ' ' + (o.name || '')).toLowerCase();
  if (/\.py\b|python/.test(hint)) return 'python';
  if (/\.sh\b|shell|bash|terminal|command/.test(hint)) return 'bash';
  return 'cpp';
};

/* Built from regex literals rather than concatenated strings: escaping
   \s and \w through a JS string literal means doubling every backslash,
   which is exactly the sort of thing that silently produces a regex
   matching the wrong thing. */
var RX = {
  pyBlock:   /("""[\s\S]*?"""|'''[\s\S]*?''')/,
  cBlock:    /(\/\*[\s\S]*?\*\/)/,
  hashLine:  /(#[^\n]*)/,
  slashLine: /(\/\/[^\n]*)/,
  dq:        /("(?:\\.|[^"\\])*")/,
  sq:        /('(?:\\.|[^'\\])*')/,
  decorator: /(@[A-Za-z_]\w*)/,
  preproc:   /(^[ \t]*#[^\n]*)/,
  num:       /(\b\d[\w.]*\b)/,
  word:      /(\b[A-Za-z_]\w*\b)/
};

AB.highlight = function (src, langName) {
  var L = LANGS[langName] || LANGS.cpp;
  var isPy = langName === 'python';

  // Order matters: comments and strings must win over everything else.
  var re = new RegExp([
    (isPy ? RX.pyBlock : RX.cBlock).source,
    (L.line === '#' ? RX.hashLine : RX.slashLine).source,
    RX.dq.source,
    RX.sq.source,
    (isPy ? RX.decorator : RX.preproc).source,
    RX.num.source,
    RX.word.source
  ].join('|'), 'gm');

  return src.replace(re, function (m, block, line, dq, sq, special, num, word, off, str) {
    if (block || line) return '<span class="tok-c">' + AB.esc(m) + '</span>';
    if (dq || sq) return '<span class="tok-s">' + AB.esc(m) + '</span>';
    if (special) return '<span class="tok-p">' + AB.esc(m) + '</span>';
    if (num) return '<span class="tok-n">' + AB.esc(m) + '</span>';
    if (word) {
      if (L.keywords.indexOf(m) > -1) return '<span class="tok-k">' + m + '</span>';
      if (L.consts.indexOf(m) > -1) return '<span class="tok-n">' + m + '</span>';
      if (/^[A-Z][A-Z0-9_]{2,}$/.test(m)) return '<span class="tok-n">' + m + '</span>';
      if (/^\s*\(/.test(str.slice(off + m.length))) return '<span class="tok-f">' + m + '</span>';
    }
    return AB.esc(m);
  });
};

AB.codeBlock = function (o) {
  var id = 'c' + Math.random().toString(36).slice(2, 9);
  return '<div class="code">' +
      '<div class="code-head">' +
        '<span class="name">' + AB.esc(o.name || 'sketch.ino') + '</span>' +
        '<span class="lang">' + AB.esc(o.lang || LANGS[AB.langOf(o)].label) + '</span>' +
        '<button class="copy-btn" data-copy="' + id + '">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg> Copy' +
        '</button>' +
      '</div>' +
      '<pre><code id="' + id + '">' + AB.highlight(o.code, AB.langOf(o)) + '</code></pre>' +
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

/* --- where to buy --------------------------------------------------------
   One implementation, used by the BOM table on every project page and by
   the catalogue on the tools page, so the two cannot drift apart.

   Every link is a plain search URL, which is why offering a shop for a part
   is honest: it means "look for it here", not "this is in stock here".
   ------------------------------------------------------------------------ */
AB.region = {
  get: function () {
    var r;
    try { r = localStorage.getItem('ab-region'); } catch (e) {}
    if (r && AB.regions[r]) return r;
    // A Swedish browser almost certainly wants the Swedish shops.
    var lang = (navigator.language || '').toLowerCase();
    if (lang.indexOf('sv') === 0) return 'se';
    return 'intl';
  },
  set: function (r) {
    if (!AB.regions[r]) return;
    try { localStorage.setItem('ab-region', r); } catch (e) {}
    document.dispatchEvent(new CustomEvent('ab-region-change', { detail: r }));
  }
};

/* The supplier ids to offer for one part, in the current region.

   Local shops are opt-in per part via `local: { se: { electrokit: 'query' } }`,
   never blanket-added to the region. They used to be: every part carried an
   Electrokit and a Kjell link whether or not those shops had ever stocked
   the thing, so clicking through for a Jetson landed you in an empty search.
   A shop link now means "this shop has this, and here is the search that
   finds it", which is the only version of the link worth having. */
AB.localShops = function (part) {
  var byRegion = part.local || {};
  return byRegion[AB.region.get()] || {};
};

AB.suppliersFor = function (part) {
  var region = AB.regions[AB.region.get()] || AB.regions.intl;
  var swap = region.swap || {};
  var out = [];

  (part.buy || []).forEach(function (id) {
    var mapped = swap[id] || id;
    if (AB.suppliers[mapped] && out.indexOf(mapped) < 0) out.push(mapped);
  });

  // Verified local shops go first - they are the ones a reader here can
  // actually get by Tuesday. Prepend as a block so the declared order
  // survives; unshifting one at a time would reverse them.
  var local = Object.keys(AB.localShops(part)).filter(function (id) {
    return AB.suppliers[id] && out.indexOf(id) < 0;
  });

  return local.concat(out);
};

AB.buyLinks = function (part, query) {
  // A local shop carries its own search string, because the term that finds
  // the part internationally often finds only accessories in a Swedish shop.
  var local = AB.localShops(part);
  return AB.suppliersFor(part).map(function (id) {
    var s = AB.suppliers[id];
    var term = typeof local[id] === 'string' ? local[id] : (query || part.q);
    return '<a href="' + s.url + encodeURIComponent(term) + '" target="_blank" rel="noopener noreferrer">' +
           AB.esc(s.name) + '</a>';
  }).join(' &middot; ');
};

/* A small "shipping to" control. Pass a container id; it re-renders
   whatever depends on it by firing ab-region-change. */
AB.regionPicker = function (label) {
  var cur = AB.region.get();
  var opts = Object.keys(AB.regions).map(function (r) {
    return '<option value="' + r + '"' + (r === cur ? ' selected' : '') + '>' +
           AB.esc(AB.regions[r].name) + '</option>';
  }).join('');
  return '<div class="field region-picker">' +
    '<label for="ab-region-sel">' + AB.esc(label || 'Shipping to') + '</label>' +
    '<select id="ab-region-sel">' + opts + '</select></div>';
};

AB.bindRegionPicker = function (root) {
  var sel = (root || document).querySelector('#ab-region-sel');
  if (!sel || sel._bound) return;
  sel._bound = true;
  sel.addEventListener('change', function () { AB.region.set(sel.value); });
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

    // AB.root() is '' at the top level and '../' under /basics/. An empty
    // scope would resolve to the current *document* (index.html), so the
    // worker would control only that one page - hence the './' fallback.
    var root = AB.root() || './';

    navigator.serviceWorker.register(root + 'sw.js', { scope: root })
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
/* Merge every `sv` block over its object, once, before anything renders.
   Doing it here rather than at each call site means all the existing
   `cat.name` and `lvl.name` reads keep working untouched - they simply
   find Swedish in them. */
AB.loc = function (o) {
  if (!o || !o.sv || AB.lang.get() !== 'sv') return o;
  var out = {};
  Object.keys(o).forEach(function (k) { out[k] = o[k]; });
  Object.keys(o.sv).forEach(function (k) { out[k] = o.sv[k]; });
  return out;
};

(function localiseData() {
  if (AB.lang.get() !== 'sv') return;

  if (AB.categories) {
    AB.categories = AB.categories.map(AB.loc);
    // catIndex points at the old objects, so it has to be rebuilt.
    AB.catIndex = AB.categories.reduce(function (m, c) { m[c.slug] = c; return m; }, {});
  }
  if (AB.levels) AB.levels = AB.levels.map(AB.loc);
  if (AB.boards) AB.boards = AB.boards.map(AB.loc);
}());

AB.theme.init();
