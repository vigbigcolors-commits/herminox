/* =====================================================================
   Smart Return & Capital Dashboard — Herminox.com
   100% client-side. No network, no tracking. Data lives in localStorage.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. RETAILER POLICY ENGINE
     Standard return windows (days) + holiday-extension flag for major
     US retailers. `holiday:true` means purchases in Nov–Dec are
     returnable until Jan 31 of the following year (Amazon/Walmart-style).
     Anything not listed falls back to DEFAULT (30 days, no extension).
  --------------------------------------------------------------- */
  var POLICIES = {
    amazon:      { name: 'Amazon',          days: 30,  holiday: true  },
    walmart:     { name: 'Walmart',         days: 90,  holiday: true  },
    target:      { name: 'Target',          days: 90,  holiday: true  },
    bestbuy:     { name: 'Best Buy',        days: 15,  holiday: true  },
    apple:       { name: 'Apple',           days: 14,  holiday: true  },
    costco:      { name: 'Costco',          days: 90,  holiday: false },
    homedepot:   { name: 'Home Depot',      days: 90,  holiday: true  },
    lowes:       { name: "Lowe's",          days: 90,  holiday: true  },
    macys:       { name: "Macy's",          days: 30,  holiday: true  },
    nordstrom:   { name: 'Nordstrom',       days: 365, holiday: false },
    nike:        { name: 'Nike',            days: 60,  holiday: true  },
    adidas:      { name: 'Adidas',          days: 30,  holiday: true  },
    sephora:     { name: 'Sephora',         days: 30,  holiday: true  },
    ulta:        { name: 'Ulta',            days: 60,  holiday: true  },
    ikea:        { name: 'IKEA',            days: 365, holiday: false },
    wayfair:     { name: 'Wayfair',         days: 30,  holiday: true  },
    zappos:      { name: 'Zappos',          days: 365, holiday: false },
    rei:         { name: 'REI',             days: 365, holiday: false },
    gap:         { name: 'Gap',             days: 30,  holiday: true  },
    oldnavy:     { name: 'Old Navy',        days: 30,  holiday: true  },
    kohls:       { name: "Kohl's",          days: 180, holiday: false },
    newegg:      { name: 'Newegg',          days: 30,  holiday: true  },
    bhphoto:     { name: 'B&H Photo',       days: 30,  holiday: true  },
    microcenter: { name: 'Micro Center',    days: 30,  holiday: true  },
    dell:        { name: 'Dell',            days: 30,  holiday: false },
    samsung:     { name: 'Samsung',         days: 15,  holiday: true  },
    gamestop:    { name: 'GameStop',        days: 30,  holiday: true  },
    petco:       { name: 'Petco',           days: 30,  holiday: true  },
    cvs:         { name: 'CVS',             days: 60,  holiday: false },
    walgreens:   { name: 'Walgreens',       days: 30,  holiday: false }
  };
  var DEFAULT_POLICY = { name: 'Other retailer', days: 30, holiday: false };
  // Aliases that map free text → policy key (for the Smart-Paste detector).
  var ALIASES = {
    'amazon': 'amazon', 'amzn': 'amazon',
    'walmart': 'walmart', 'wal-mart': 'walmart',
    'target': 'target', 'best buy': 'bestbuy', 'bestbuy': 'bestbuy',
    'apple': 'apple', 'costco': 'costco', 'home depot': 'homedepot',
    "lowe's": 'lowes', 'lowes': 'lowes', "macy's": 'macys', 'macys': 'macys',
    'nordstrom': 'nordstrom', 'nike': 'nike', 'adidas': 'adidas',
    'sephora': 'sephora', 'ulta': 'ulta', 'ikea': 'ikea', 'wayfair': 'wayfair',
    'zappos': 'zappos', 'rei': 'rei', 'gap': 'gap', 'old navy': 'oldnavy',
    "kohl's": 'kohls', 'kohls': 'kohls', 'newegg': 'newegg',
    'b&h': 'bhphoto', 'micro center': 'microcenter', 'dell': 'dell',
    'samsung': 'samsung', 'gamestop': 'gamestop', 'petco': 'petco',
    'cvs': 'cvs', 'walgreens': 'walgreens'
  };

  /* ---------------------------------------------------------------
     2. DATE / MONEY HELPERS  (all local-time, no TZ drift)
  --------------------------------------------------------------- */
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  function toISO(d) {
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function addYears(d, n) { var x = new Date(d.getTime()); x.setFullYear(x.getFullYear() + n); return x; }
  function startOfToday() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function daysBetween(a, b) { return Math.round((b - a) / 86400000); }

  var MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  function money(n) { return MONEY.format(isFinite(n) ? n : 0); }
  var DATEFMT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  function niceDate(d) { return DATEFMT.format(d); }

  /* ---------------------------------------------------------------
     3. CORE RULES — deadline (with Holiday Policy) + warranty
  --------------------------------------------------------------- */
  function policyFor(key) { return POLICIES[key] || DEFAULT_POLICY; }

  function returnDeadline(buyDate, policy) {
    var base = addDays(buyDate, policy.days);
    if (policy.holiday) {
      var mo = buyDate.getMonth(); // Nov = 10, Dec = 11
      if (mo === 10 || mo === 11) {
        var jan31 = new Date(buyDate.getFullYear() + 1, 0, 31);
        return base.getTime() > jan31.getTime() ? base : jan31; // whichever is later
      }
    }
    return base;
  }

  // Manufacturer warranty: 1 year standard; premium cards (Amex / Chase /
  // Visa Signature) typically double it via purchase protection (+1 year).
  function warrantyEnd(buyDate, hasPremiumCard) {
    return addYears(buyDate, hasPremiumCard ? 2 : 1);
  }

  /* ---------------------------------------------------------------
     4. SMART-PASTE PARSER
     Pulls store, item, price and date out of pasted receipt / order
     confirmation text. Pure regex heuristics with safe fallbacks.
  --------------------------------------------------------------- */
  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

  function detectStore(text) {
    var low = text.toLowerCase();
    var best = null, bestIdx = Infinity;
    for (var alias in ALIASES) {
      var i = low.indexOf(alias);
      if (i !== -1 && i < bestIdx) { bestIdx = i; best = ALIASES[alias]; }
    }
    return best; // policy key or null
  }

  function detectDate(text) {
    var t = text.replace(/ /g, ' ');
    // Prefer a date near an "order/purchase/placed/bought" keyword.
    var ctx = /(?:order(?:ed)?|placed|purchase[d]?|bought|date)[^\n]{0,40}?/i.exec(t);
    var scope = ctx ? t.slice(ctx.index, ctx.index + 80) : t;

    function fromMonthName(s) {
      var m = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/i.exec(s);
      if (m) return new Date(+m[3], MONTHS[m[1].toLowerCase().slice(0, 3)], +m[2]);
      return null;
    }
    function fromISO(s) { var m = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
    function fromSlash(s) {
      var m = /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/.exec(s);
      if (!m) return null;
      var y = +m[3]; if (y < 100) y += 2000;
      return new Date(y, +m[1] - 1, +m[2]); // US M/D/Y
    }
    var d = fromMonthName(scope) || fromISO(scope) || fromSlash(scope)
         || fromMonthName(t) || fromISO(t) || fromSlash(t);
    return (d && !isNaN(d.getTime())) ? d : null;
  }

  function detectPrice(text) {
    var prices = [];
    var re = /\$\s?([\d,]+\.\d{2})/g, m;
    while ((m = re.exec(text))) { var v = parseFloat(m[1].replace(/,/g, '')); if (isFinite(v)) prices.push(v); }
    if (!prices.length) return null;
    // "Order total" is usually the largest dollar figure on the receipt.
    return Math.max.apply(null, prices);
  }

  function detectItem(text, storeName) {
    var lines = text.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var junk = /(order|total|subtotal|tax|shipping|qty|quantity|tracking|delivered|arriving|thank|receipt|confirmation|payment|card|ending|invoice|http|@|\bUSD\b)/i;
    var best = '';
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (l.length < 4 || l.length > 90) continue;
      if (junk.test(l)) continue;
      if (/\$\s?[\d,]+\.\d{2}/.test(l)) continue;          // skip price lines
      if (/^\d[\d\-\/\s]+$/.test(l)) continue;             // skip pure dates/numbers
      if (storeName && l.toLowerCase() === storeName.toLowerCase()) continue;
      if (/[a-z]/i.test(l) && l.length > best.length) best = l; // longest text line wins
    }
    return best.slice(0, 90);
  }

  function smartParse(text) {
    var storeKey = detectStore(text);
    var policy = storeKey ? POLICIES[storeKey] : null;
    return {
      storeKey: storeKey,
      price: detectPrice(text),
      date: detectDate(text),
      item: detectItem(text, policy ? policy.name : '')
    };
  }

  /* ---------------------------------------------------------------
     5. STORAGE
  --------------------------------------------------------------- */
  var KEY = 'herminox_returns_v1';
  function load() {
    try { var a = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
  }
  var items = load();
  function uid() { return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---------------------------------------------------------------
     6. ICS FEED — one all-day deadline event per item, with TWO
     actionable alarms: 7 days out ("a week left") and 2 days out
     ("urgent — ship it"). RFC 5545 compliant.
  --------------------------------------------------------------- */
  function icsEscape(s) { return String(s).replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n'); }
  function icsDate(d) { return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); }
  function icsStamp() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, '0'); }
    return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + 'T' +
           p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()) + 'Z';
  }

  function buildEvent(it) {
    var buy = parseISO(it.buyDate); if (!buy) return '';
    var pol = policyFor(it.store);
    var dl = returnDeadline(buy, pol);
    var name = it.name || 'item';
    var L = [
      'BEGIN:VEVENT',
      'UID:' + it.id + '@herminox.com',
      'DTSTAMP:' + icsStamp(),
      'DTSTART;VALUE=DATE:' + icsDate(dl),
      'DTEND;VALUE=DATE:' + icsDate(addDays(dl, 1)),
      'SUMMARY:' + icsEscape('⏳ Return deadline — ' + name + ' (' + pol.name + ')'),
      'DESCRIPTION:' + icsEscape('Last day to return your ' + pol.name + ' purchase "' + name + '" (' + money(it.price || 0) + '). Tracked with Herminox Return Dashboard.'),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-P7D',
      'DESCRIPTION:' + icsEscape('1 week left to return ' + name + ' to ' + pol.name), 'END:VALARM',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-P2D',
      'DESCRIPTION:' + icsEscape('Urgent — 2 days to return ' + name + '. Ship it now.'), 'END:VALARM',
      'END:VEVENT'
    ];
    return L.join('\r\n');
  }

  function buildICS(list) {
    var head = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Herminox//Return Dashboard//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    var body = list.map(buildEvent).filter(Boolean);
    return head.concat(body, ['END:VCALENDAR']).join('\r\n');
  }

  function download(filename, text) {
    var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------------------------------------------------------------
     7. DOM REFERENCES
  --------------------------------------------------------------- */
  var $ = function (id) { return document.getElementById(id); };
  var pasteBox = $('rt-paste'), btnParse = $('rt-parse'), btnClearPaste = $('rt-clear-paste');
  var selStore = $('rt-store'), inName = $('rt-name'), inPrice = $('rt-price'),
      inDate = $('rt-date'), chkCard = $('rt-card'), btnSave = $('rt-save');
  var listEl = $('rt-list'), emptyEl = $('rt-empty'),
      capEl = $('rt-capital'), activeEl = $('rt-active'), nextEl = $('rt-next'),
      btnExport = $('rt-export'), parseMsg = $('rt-parsemsg');

  // Populate retailer dropdown from the policy engine.
  (function fillStores() {
    var keys = Object.keys(POLICIES).sort(function (a, b) { return POLICIES[a].name.localeCompare(POLICIES[b].name); });
    var frag = document.createDocumentFragment();
    keys.forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = POLICIES[k].name + '  ·  ' + POLICIES[k].days + 'd' + (POLICIES[k].holiday ? ' + holiday' : '');
      frag.appendChild(o);
    });
    var other = document.createElement('option');
    other.value = 'other'; other.textContent = 'Other retailer  ·  30d';
    frag.appendChild(other);
    selStore.appendChild(frag);
  })();
  // default the date field to today
  inDate.value = toISO(startOfToday());

  /* ---------------------------------------------------------------
     8. STATUS HELPERS
  --------------------------------------------------------------- */
  function statusOf(daysLeft) {
    if (daysLeft < 0) return { cls: 'rt-dead', label: 'Window closed' };
    if (daysLeft <= 2) return { cls: 'rt-urgent', label: daysLeft === 0 ? 'Last day!' : daysLeft + ' days left' };
    if (daysLeft <= 7) return { cls: 'rt-soon', label: daysLeft + ' days left' };
    return { cls: 'rt-ok', label: daysLeft + ' days left' };
  }

  function windowProgress(buy, dl, today, daysLeft) {
    if (!buy || !dl) return 0;
    var total = daysBetween(buy, dl);
    if (total <= 0) return 100;
    if (daysLeft != null && daysLeft < 0) return 100;
    var elapsed = daysBetween(buy, today);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  /* ---------------------------------------------------------------
     9. RENDER  (DOM built with textContent — paste data never goes
     through innerHTML, so the tool is XSS-safe by construction.)
  --------------------------------------------------------------- */
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function render() {
    listEl.textContent = '';
    var today = startOfToday();
    var lockedCapital = 0, activeCount = 0, soonest = null;

    // newest first
    var sorted = items.slice().sort(function (a, b) { return (b.savedAt || 0) - (a.savedAt || 0); });

    sorted.forEach(function (it) {
      var buy = parseISO(it.buyDate);
      var pol = policyFor(it.store);
      var dl = buy ? returnDeadline(buy, pol) : null;
      var left = dl ? daysBetween(today, dl) : null;
      var open = left != null && left >= 0;
      if (open) { lockedCapital += (+it.price || 0); activeCount++; if (!soonest || dl < soonest) soonest = dl; }

      var st = left == null ? { cls: 'rt-ok', label: '—' } : statusOf(left);
      var card = el('article', 'rt-item ' + (open ? '' : 'rt-item--closed'));

      // left: badge + name + meta
      var main = el('div', 'rt-item-main');
      var top = el('div', 'rt-item-top');
      top.appendChild(el('span', 'rt-badge ' + st.cls, st.label));
      top.appendChild(el('span', 'rt-store', pol.name));
      main.appendChild(top);
      main.appendChild(el('h3', 'rt-name', it.name || 'Untitled item'));
      var meta = el('div', 'rt-meta');
      meta.appendChild(el('span', null, 'Bought ' + (buy ? niceDate(buy) : '—')));
      meta.appendChild(el('span', 'rt-meta-strong', 'Return by ' + (dl ? niceDate(dl) : '—')));
      if (it.card) meta.appendChild(el('span', 'rt-warr', 'Warranty → ' + niceDate(warrantyEnd(buy, true)) + ' (2 yr, card)'));
      else meta.appendChild(el('span', 'rt-warr', 'Warranty → ' + (buy ? niceDate(warrantyEnd(buy, false)) : '—')));
      main.appendChild(meta);

      if (buy && dl) {
        var elapsed = windowProgress(buy, dl, today, left);
        var progWrap = el('div', 'rt-progress');
        var progBar = el('div', 'rt-progress-bar ' + st.cls);
        progBar.style.width = elapsed + '%';
        progBar.setAttribute('role', 'progressbar');
        progBar.setAttribute('aria-valuenow', String(Math.round(elapsed)));
        progBar.setAttribute('aria-valuemin', '0');
        progBar.setAttribute('aria-valuemax', '100');
        progBar.setAttribute('aria-label', 'Return window elapsed');
        progWrap.appendChild(progBar);
        main.appendChild(progWrap);
      }

      // right: price + actions
      var side = el('div', 'rt-item-side');
      side.appendChild(el('div', 'rt-price', money(+it.price || 0)));
      var acts = el('div', 'rt-actions');
      var ics = el('button', 'rt-mini', 'Add to calendar');
      ics.type = 'button';
      ics.addEventListener('click', function () { download('return-' + (it.name || 'item').replace(/[^\w]+/g, '-').slice(0, 24) + '.ics', buildICS([it])); });
      var del = el('button', 'rt-mini rt-mini--del', 'Delete');
      del.type = 'button';
      del.addEventListener('click', function () { items = items.filter(function (x) { return x.id !== it.id; }); save(items); render(); });
      acts.appendChild(ics); acts.appendChild(del);
      side.appendChild(acts);

      card.appendChild(main);
      card.appendChild(side);
      listEl.appendChild(card);
    });

    // dashboard summary
    animateMoney(capEl, lockedCapital);
    activeEl.textContent = activeCount;
    nextEl.textContent = soonest ? niceDate(soonest) : '—';
    emptyEl.style.display = items.length ? 'none' : 'block';
    btnExport.disabled = !items.length;
  }

  // Count-up animation for the Locked Capital figure.
  var lastCap = 0;
  function animateMoney(node, target) {
    if (typeof target !== 'number' || !isFinite(target)) target = 0;
    var from = lastCap, start = null, dur = 600;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      node.textContent = money(target); lastCap = target; return;
    }
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = money(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(tick); else lastCap = target;
    }
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------
     10. EVENTS
  --------------------------------------------------------------- */
  function flash(msg, ok) {
    parseMsg.textContent = msg;
    parseMsg.className = 'rt-parsemsg ' + (ok ? 'rt-parsemsg--ok' : 'rt-parsemsg--warn');
    parseMsg.style.opacity = '1';
    setTimeout(function () { parseMsg.style.opacity = '0'; }, 3200);
  }

  btnParse.addEventListener('click', function () {
    var text = (pasteBox.value || '').trim();
    if (!text) { flash('Paste your order confirmation or receipt first.', false); return; }
    var r = smartParse(text);
    var got = [];
    if (r.storeKey) { selStore.value = r.storeKey; got.push('store'); }
    if (r.item) { inName.value = r.item; got.push('item'); }
    if (r.price != null) { inPrice.value = r.price.toFixed(2); got.push('price'); }
    if (r.date) { inDate.value = toISO(r.date); got.push('date'); }
    if (got.length) flash('Detected ' + got.join(', ') + '. Review and Save.', true);
    else flash("Couldn't auto-detect fields — fill them in manually.", false);
  });

  btnClearPaste.addEventListener('click', function () { pasteBox.value = ''; pasteBox.focus(); });

  btnSave.addEventListener('click', function () {
    var price = parseFloat(inPrice.value);
    var rec = {
      id: uid(),
      store: selStore.value || 'other',
      name: (inName.value || '').trim().slice(0, 90),
      price: isFinite(price) ? price : 0,
      buyDate: inDate.value || toISO(startOfToday()),
      card: !!chkCard.checked,
      savedAt: Date.now()
    };
    if (!rec.name) { flash('Add an item name before saving.', false); inName.focus(); return; }
    if (!parseISO(rec.buyDate)) { flash('Enter a valid purchase date.', false); inDate.focus(); return; }
    items.push(rec); save(items); render();
    // reset entry fields (keep store for fast multi-entry)
    inName.value = ''; inPrice.value = ''; chkCard.checked = false; pasteBox.value = '';
    flash('Saved. Deadline and reminders are ready.', true);
  });

  btnExport.addEventListener('click', function () {
    if (!items.length) return;
    download('herminox-returns.ics', buildICS(items));
  });

  // allow Enter-to-save from the name/price fields
  [inName, inPrice].forEach(function (f) {
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter') btnSave.click(); });
  });

  render();

  /* ---------------------------------------------------------------
     11. SCROLL REVEAL — unhide .reveal blocks (same as site-wide)
  --------------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
     12. SCROLL PROGRESS BAR
  --------------------------------------------------------------- */
  var scrollBar = document.getElementById('scroll-progress');
  if (scrollBar) {
    function updateScrollBar() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max : 0;
      scrollBar.style.width = Math.min(1, Math.max(0, pct)) * 100 + '%';
    }
    window.addEventListener('scroll', updateScrollBar, { passive: true });
    updateScrollBar();
  }

  /* ---------------------------------------------------------------
     13. PLAYBOOK CHECKLIST PROGRESS
  --------------------------------------------------------------- */
  var checklist = document.getElementById('rt-checklist');
  var checklistProg = document.getElementById('rt-checklist-progress');
  if (checklist && checklistProg) {
    var checks = checklist.querySelectorAll('input[type=checkbox]');
    var total = checks.length;
    function updateChecklist() {
      var done = checklist.querySelectorAll('input:checked').length;
      if (done === 0) checklistProg.textContent = '0 of ' + total + ' complete — tick each box after your next purchase';
      else if (done === total) checklistProg.textContent = '✓ All ' + total + ' checks complete — your return system is locked in';
      else checklistProg.textContent = done + ' of ' + total + ' complete';
    }
    checks.forEach(function (c) { c.addEventListener('change', updateChecklist); });
    updateChecklist();
  }
})();
