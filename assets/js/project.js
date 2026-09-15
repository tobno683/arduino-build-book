/* ==========================================================================
   project.js - turns one entry in AB.projects into a full build guide.

   The important idea: the wiring table and the 3D view are generated from
   the SAME `build.wires` array. There is no way for the picture and the
   table to disagree, because they are the same data.
   ========================================================================== */
window.AB = window.AB || {};
AB.projects = AB.projects || [];
AB.addProject = function (p) { AB.projects.push(p); };

(function () {

  /* --- section helpers -------------------------------------------------- */
  var secs = [];
  function section(id, title, html) {
    if (!html) return '';
    secs.push({ id: id, title: title });
    return '<section id="' + id + '"><h2><span class="num">' + String(secs.length).padStart(2, '0') +
           '</span>' + AB.esc(title) + '</h2>' + html + '</section>';
  }
  function steps(list) {
    if (!list || !list.length) return '';
    return '<ol class="steps">' + list.map(function (s) {
      return '<li>' + (s.h ? '<h4>' + AB.esc(s.h) + '</h4>' : '') + s.body + '</li>';
    }).join('') + '</ol>';
  }
  function note(kind, title, body) {
    return '<div class="note ' + kind + '"><span class="t">' + AB.esc(title) + '</span>' + body + '</div>';
  }

  /* --- bill of materials ------------------------------------------------ */
  function bom(p) {
    var rows = '', total = 0, owned = 0;
    (p.bom || []).forEach(function (line) {
      var part = AB.partIndex[line.id];
      if (!part) { console.warn('BOM: unknown part "' + line.id + '" in ' + p.slug); return; }
      var qty = line.qty || 1, sum = part.price * qty;
      if (line.own) owned += sum; else total += sum;
      var links = AB.buyLinks(part, line.q || part.q);
      rows += '<tr>' +
        '<td><strong>' + AB.esc(line.as || part.name) + '</strong>' +
          (line.note ? '<br><small class="muted">' + line.note + '</small>' : '') +
          (part.note && !line.note ? '<br><small class="muted">' + AB.esc(part.note) + '</small>' : '') +
        '</td>' +
        '<td class="num">' + qty + '</td>' +
        '<td class="num">' + AB.usd(part.price) + '</td>' +
        '<td class="num">' + (line.own ? '<span class="muted">' + AB.usd(sum) + '</span>' : AB.usd(sum)) + '</td>' +
        '<td><small>' + links + '</small></td>' +
      '</tr>';
    });

    var foot = '<tr><td colspan="3"><strong>What this build costs you</strong></td>' +
      '<td class="num"><strong>' + AB.usd(total) + '</strong><br><small class="muted">' + AB.eur(total) + '</small></td><td></td></tr>';
    if (owned) {
      foot += '<tr><td colspan="3">Shared stock you buy once and reuse forever ' +
        '<small class="muted">(counted separately)</small></td>' +
        '<td class="num">' + AB.usd(owned) + '</td><td></td></tr>';
    }

    var region = AB.regions[AB.region.get()] || AB.regions.intl;

    return '<div class="bom-head">' + AB.regionPicker('Shipping to') + '</div>' +
      '<div class="table-scroll"><table>' +
      '<thead><tr><th>Part</th><th class="num">Qty</th><th class="num">Unit</th><th class="num">Line</th><th>Where</th></tr></thead>' +
      '<tbody>' + rows + '</tbody><tfoot>' + foot + '</tfoot></table></div>' +
      (p.bomNote || '') +
      (region.note ? note('tip', 'Buying in ' + region.name, '<p>' + region.note + '</p>') : '') +
      note('tip', 'Reading this table',
        '<p>Unit prices are typical 2026 street prices in USD. The cheap end is AliExpress and a three-week ' +
        'wait; a documented Western or local shop costs two to four times more and comes with support, a ' +
        'returns policy and parts that are what the listing says they are. For your first build, paying that ' +
        'premium on the <em>sensor</em> and saving on the board is usually the right trade.</p>');
  }

  /* --- tools ------------------------------------------------------------ */
  function tools(p) {
    if (!p.tools || !p.tools.length) return '';
    var rows = p.tools.map(function (t) {
      var id = typeof t === 'string' ? t : t.id;
      var part = AB.partIndex[id];
      if (!part) return '';
      return '<tr><td><strong>' + AB.esc(part.name) + '</strong>' +
        (typeof t === 'object' && t.why ? '<br><small class="muted">' + t.why + '</small>' : '') +
        '</td><td class="num">' + AB.usd(part.price) + '</td></tr>';
    }).join('');
    return '<h3>Tools this build needs</h3>' +
      '<p class="muted">Tools are not part of the price above - you buy them once and they outlive every project.</p>' +
      '<div class="table-scroll"><table><thead><tr><th>Tool</th><th class="num">Typical</th></tr></thead><tbody>' +
      rows + '</tbody></table></div>';
  }

  /* --- wiring table, generated from the 3D scene ------------------------ */
  function wiring(p) {
    var b = p.build;
    if (!b || !b.wires || !b.wires.length) return '';
    var names = {};
    (b.parts || []).forEach(function (it) {
      var def = AB.comp[it.comp];
      names[it.id] = it.label || (def ? def.name : it.comp);
    });
    function side(ref) {
      var d = ref.indexOf('.');
      var id = d < 0 ? ref : ref.slice(0, d), pin = d < 0 ? '' : ref.slice(d + 1);
      return '<td>' + AB.esc(names[id] || id) + '</td><td><span class="pin">' + AB.esc(pin) + '</span></td>';
    }
    var rows = b.wires.map(function (w) {
      var col = AB.wireColors[w.color] || w.color || '#3a7bd5';
      return '<tr>' + side(w.from) + side(w.to) +
        '<td><i class="swatch" style="background:' + col + '"></i>' + AB.esc(w.color || 'any') + '</td>' +
        '<td><small>' + (w.note || '') + '</small></td></tr>';
    }).join('');
    return '<div class="table-scroll"><table>' +
      '<thead><tr><th>From</th><th>Pin</th><th>To</th><th>Pin</th><th>Wire</th><th>What it carries</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  /* --- libraries -------------------------------------------------------- */
  function libs(p) {
    if (!p.libraries || !p.libraries.length) return '';
    var rows = p.libraries.map(function (l) {
      return '<tr><td><strong>' + AB.esc(l.name) + '</strong>' + (l.by ? '<br><small class="muted">by ' + AB.esc(l.by) + '</small>' : '') +
        '</td><td>' + AB.esc(l.how || 'Library Manager') + '</td><td><small>' + (l.why || '') + '</small></td></tr>';
    }).join('');
    return '<h3>Libraries to install first</h3>' +
      '<p>In the Arduino IDE: <strong>Sketch &rarr; Include Library &rarr; Manage Libraries</strong>, ' +
      'then search the name and press Install. If a dialog offers to install dependencies too, say yes.</p>' +
      '<div class="table-scroll"><table><thead><tr><th>Library</th><th>Install via</th><th>What it does for you</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  /* --- code ------------------------------------------------------------- */
  function code(p) {
    if (!p.code || !p.code.length) return '';
    return p.code.map(function (c) {
      return (c.h ? '<h3>' + AB.esc(c.h) + '</h3>' : '') + (c.intro || '') +
             AB.codeBlock({ name: c.name, lang: c.lang, code: c.code }) +
             (c.after || '');
    }).join('');
  }

  /* --- troubleshooting -------------------------------------------------- */
  function trouble(p) {
    if (!p.trouble || !p.trouble.length) return '';
    var rows = p.trouble.map(function (t) {
      return '<tr><td><strong>' + AB.esc(t.q) + '</strong></td><td>' + t.a + '</td></tr>';
    }).join('');
    return '<div class="table-scroll"><table><thead><tr><th style="width:34%">What you see</th><th>What it is, and the fix</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  /* --- the page --------------------------------------------------------- */
  AB.renderProject = function () {
    var slug = AB.qs('p');
    var p = AB.projects.filter(function (x) { return x.slug === slug; })[0];
    var host = document.getElementById('proj');
    if (!p) {
      host.innerHTML = '<div class="wrap"><div class="empty"><h2>Project not found</h2>' +
        '<p>Try the <a href="projects.html">full project list</a>.</p></div></div>';
      return;
    }
    secs = [];
    document.title = p.title + ' — The Arduino Build Book';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', p.blurb);

    var cat = AB.catIndex[p.cat] || { name: p.cat, slug: p.cat };
    var lvl = AB.levels[p.level - 1] || AB.levels[0];
    var cost = AB.projectCost(p);

    var head =
      '<div class="proj-head"><div class="wrap">' +
        '<div class="crumbs"><a href="index.html">Home</a> / <a href="projects.html">Projects</a> / ' +
        '<a href="projects.html?cat=' + cat.slug + '">' + AB.esc(cat.name) + '</a></div>' +
        '<h1>' + AB.esc(p.title) + '</h1>' +
        '<p class="lede">' + AB.esc(p.blurb) + '</p>' +
        '<div class="spec-row">' +
          '<div class="spec"><span class="k">Cost</span><span class="v">' + AB.usd(cost) + '</span></div>' +
          '<div class="spec"><span class="k">Level</span><span class="v">' + lvl.name + '</span></div>' +
          '<div class="spec"><span class="k">Time</span><span class="v">' + AB.esc(p.time) + '</span></div>' +
          '<div class="spec"><span class="k">Soldering</span><span class="v">' + (p.solder ? 'Yes' : 'None') + '</span></div>' +
          '<div class="spec"><span class="k">Board</span><span class="v">' + AB.esc(p.board || 'Uno') + '</span></div>' +
        '</div>' +
        (p.skills ? '<div class="pill-list">' + p.skills.map(function (s) {
          return '<span class="chip">' + AB.esc(s) + '</span>';
        }).join('') + '</div>' : '') +
      '</div></div>';

    var body = '';

    body += section('what', 'What you are building',
      (p.intro || '') +
      (p.what ? '<h3>When it is finished it will</h3><ul>' + p.what.map(function (w) {
        return '<li>' + w + '</li>';
      }).join('') + '</ul>' : '') +
      (p.how ? '<h3>How it works</h3>' + p.how : ''));

    body += section('buy', 'What to buy, and what it costs', bom(p) + tools(p));

    body += section('wire', 'Wiring it up',
      '<p>Drag the model below to turn it over. The table underneath is the same wiring, ' +
      'written out - if you prefer words to pictures, work from the table and use the model to check yourself.</p>' +
      '<div id="viewer3d"></div>' +
      (p.wireIntro || '') +
      wiring(p) +
      (p.wireNotes || ''));

    if (p.solderSteps && p.solderSteps.length) {
      body += section('solder', 'Soldering, joint by joint',
        (p.solderIntro || '') +
        note('tip', 'First time with an iron?',
          '<p>Read <a href="basics/soldering.html">the soldering course</a> first. It covers the grip, ' +
          'the temperature, the three-second rule and what a good joint looks like. Then come back here.</p>') +
        steps(p.solderSteps));
    }

    if (p.assembly && p.assembly.length) {
      body += section('build', 'Putting it together', (p.assemblyIntro || '') + steps(p.assembly));
    }

    body += section('code', 'The code', libs(p) + code(p));

    if (p.upload) body += section('upload', 'Uploading and first run', p.upload);
    if (p.tune && p.tune.length) body += section('tune', 'Calibration and tuning', steps(p.tune));
    if (p.trouble && p.trouble.length) body += section('trouble', 'When it does not work', trouble(p));
    if (p.next) body += section('next', 'Where to take it next', p.next);
    if (p.safety) body += section('safety', 'Safety', p.safety);

    var toc = '<aside class="toc"><div class="t">On this page</div><ol>' +
      secs.map(function (s) { return '<li><a href="#' + s.id + '">' + AB.esc(s.title) + '</a></li>'; }).join('') +
      '</ol></aside>';

    var related = AB.projects.filter(function (x) {
      return x.slug !== p.slug && (x.cat === p.cat || (p.related || []).indexOf(x.slug) > -1);
    }).slice(0, 3);

    host.innerHTML = head +
      '<div class="wrap"><div class="proj-layout"><div class="pbody">' + body +
      (related.length ?
        '<section id="related"><h2><span class="num">' + String(secs.length + 1).padStart(2, '0') +
        '</span>Build this next</h2><div class="grid grid-3">' +
        related.map(function (r) { return AB.projectCard(r, ''); }).join('') + '</div></section>' : '') +
      '</div>' + toc + '</div></div>';

    AB.bindCopy(host);
    AB.bindRegionPicker(host);
    if (p.build) AB.mountViewer(document.getElementById('viewer3d'), p.build);

    /* Changing where you are shipping to rewrites every supplier link, so
       re-render - but keep the reader where they were on the page. */
    if (!AB._regionBound) {
      AB._regionBound = true;
      document.addEventListener('ab-region-change', function () {
        var y = window.scrollY;
        AB.renderProject();
        window.scrollTo({ top: y, behavior: 'instant' });
      });
    }

    /* scroll-spy for the contents list */
    var links = {}, obs;
    host.querySelectorAll('.toc a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
      obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var a = links[e.target.id];
          if (!a) return;
          if (e.isIntersecting) {
            Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
            a.classList.add('active');
          }
        });
      }, { rootMargin: '-80px 0px -70% 0px' });
      host.querySelectorAll('.pbody > section').forEach(function (s) { obs.observe(s); });
    }
  };
}());
