/*!
 * Herminox ACoS Breakeven Widget — Vanilla JS embed (no React/Vue).
 * Security: Shadow DOM · no cookies · no parent scraping · allowlisted numbers only.
 *
 * Usage:
 * <div id="herminox-acos"></div>
 * <script async src="https://herminox.com/embed/acos.js"
 *   data-target="herminox-acos"
 *   data-utm-source="partner-site"
 *   data-utm-medium="embed"
 *   data-utm-campaign="acos-widget"></script>
 */
(function () {
  'use strict';
  if (window.__HERMINOX_ACOS_EMBED__) return;
  window.__HERMINOX_ACOS_EMBED__ = true;

  var ORIGIN = 'https://herminox.com';
  var TOOL = ORIGIN + '/sellers/acos-breakeven/';
  var script = document.currentScript;

  function num(el, min, max) {
    var n = parseFloat(el.value);
    if (!isFinite(n) || n < min || n > max) return 0;
    return n;
  }

  function money(n) {
    return (n < 0 ? '−$' : '$') + Math.abs(n).toFixed(2);
  }

  function utmParams() {
    var p = new URLSearchParams();
    p.set('utm_source', (script && script.getAttribute('data-utm-source')) || 'embed');
    p.set('utm_medium', (script && script.getAttribute('data-utm-medium')) || 'widget');
    p.set('utm_campaign', (script && script.getAttribute('data-utm-campaign')) || 'acos-embed');
    p.set('utm_content', 'acos-widget');
    return p;
  }

  function deepLink(v) {
    var p = utmParams();
    p.set('price', v.price);
    p.set('cogs', v.cogs);
    p.set('referral', v.referral);
    p.set('fba', v.fba);
    p.set('target', v.target);
    p.set('conv', v.conv);
    p.set('organic', v.organic);
    return TOOL + '?' + p.toString() + '#calc';
  }

  function mount(host) {
    var root = host.attachShadow({ mode: 'open' });
    var style = document.createElement('style');
    style.textContent = [
      ':host{all:initial;font-family:system-ui,-apple-system,sans-serif;color:#1B2138;display:block}',
      '*{box-sizing:border-box}',
      '.wrap{border:1px solid #C8BFA8;border-radius:12px;background:#F5F0E8;padding:16px;max-width:420px}',
      '.brand{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#5A6175;margin:0 0 10px;font-family:ui-monospace,monospace}',
      '.brand a{color:#A5640F;text-decoration:none;font-weight:600}',
      'label{display:block;font-size:12px;font-weight:600;margin:10px 0 4px}',
      'input{width:100%;padding:9px 10px;border:1px solid #C8BFA8;border-radius:8px;background:#fff;font-size:14px}',
      '.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.out{margin-top:14px;padding:12px;border-radius:8px;background:#1B2138;color:#F0EDE6}',
      '.out .big{font-size:22px;font-weight:700;margin:0}',
      '.out .sub{font-size:12px;opacity:.8;margin:4px 0 0}',
      '.out.loss{background:#5c2430}',
      '.cta{display:inline-block;margin-top:12px;padding:10px 14px;border-radius:8px;background:#2B3E86;color:#fff;text-decoration:none;font-size:13px;font-weight:600}',
      '.note{font-size:11px;color:#5A6175;margin:10px 0 0;line-height:1.4}'
    ].join('');

    var wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.innerHTML =
      '<p class="brand"><a href="' + ORIGIN + '/" target="_blank" rel="noopener noreferrer">Herminox</a> · ACoS breakeven</p>' +
      '<div class="row"><div><label for="hx-price">Sell price ($)</label><input id="hx-price" type="number" min="0" step="0.01" value="29.99"></div>' +
      '<div><label for="hx-cogs">Your cost ($)</label><input id="hx-cogs" type="number" min="0" step="0.01" value="8"></div></div>' +
      '<div class="row"><div><label for="hx-ref">Referral %</label><input id="hx-ref" type="number" min="0" max="50" step="0.5" value="15"></div>' +
      '<div><label for="hx-fba">FBA fee ($)</label><input id="hx-fba" type="number" min="0" step="0.01" value="5.39"></div></div>' +
      '<div class="row"><div><label for="hx-target">Target ACoS %</label><input id="hx-target" type="number" min="1" max="80" value="25"></div>' +
      '<div><label for="hx-conv">Conv. rate %</label><input id="hx-conv" type="number" min="0.1" max="100" step="0.5" value="10"></div></div>' +
      '<label for="hx-org">Organic share %</label><input id="hx-org" type="number" min="0" max="95" value="50">' +
      '<div class="out" id="hx-out"><p class="big" id="hx-be">—</p><p class="sub" id="hx-meta"></p></div>' +
      '<a class="cta" id="hx-cta" href="' + TOOL + '" target="_blank" rel="noopener noreferrer">Open full ACoS calculator →</a>' +
      '<p class="note">Breakeven ACoS = pre-ad margin. Browser-only. Confirm live fees in Seller Central.</p>';

    root.appendChild(style);
    root.appendChild(wrap);

    var els = {
      price: root.getElementById('hx-price'),
      cogs: root.getElementById('hx-cogs'),
      ref: root.getElementById('hx-ref'),
      fba: root.getElementById('hx-fba'),
      target: root.getElementById('hx-target'),
      conv: root.getElementById('hx-conv'),
      org: root.getElementById('hx-org'),
      out: root.getElementById('hx-out'),
      be: root.getElementById('hx-be'),
      meta: root.getElementById('hx-meta'),
      cta: root.getElementById('hx-cta'),
    };

    function recalc() {
      var price = num(els.price, 0, 1e5);
      var cogs = num(els.cogs, 0, 1e5);
      var referralPct = num(els.ref, 0, 50) || 15;
      var fbaFee = num(els.fba, 0, 1e5);
      var target = num(els.target, 1, 80) || 25;
      var conv = num(els.conv, 0.1, 100) || 10;
      var organic = num(els.org, 0, 95);

      if (price <= 0) {
        els.be.textContent = 'Enter a price';
        els.meta.textContent = '';
        els.out.className = 'out';
        return;
      }

      var referral = +(price * referralPct / 100).toFixed(2);
      var preAd = +(price - cogs - referral - fbaFee).toFixed(2);
      var be = price > 0 ? +(preAd / price * 100).toFixed(1) : 0;
      var adCost = +(price * target / 100).toFixed(2);
      var atTarget = +(preAd - adCost).toFixed(2);
      var maxCpc = +(price * (be / 100) * (conv / 100)).toFixed(2);
      var tacos = +((1 - organic / 100) * be).toFixed(1);

      els.be.textContent = be + '% breakeven ACoS';
      els.meta.textContent = 'At ' + target + '% keep ' + money(atTarget) + '/ad sale · max CPC ' + money(maxCpc) + ' · TACoS@BE ' + tacos + '%';
      els.out.className = 'out' + (preAd < 0 || atTarget < 0 ? ' loss' : '');

      els.cta.href = deepLink({
        price: price,
        cogs: cogs,
        referral: referralPct,
        fba: fbaFee,
        target: target,
        conv: conv,
        organic: organic,
      });
    }

    Object.keys(els).forEach(function (k) {
      var el = els[k];
      if (!el || el.tagName !== 'INPUT') return;
      el.addEventListener('input', recalc);
      el.addEventListener('change', recalc);
    });
    recalc();
  }

  function boot() {
    var id = (script && script.getAttribute('data-target')) || 'herminox-acos';
    var host = document.getElementById(id);
    if (!host) {
      host = document.createElement('div');
      host.id = id;
      if (script && script.parentNode) script.parentNode.insertBefore(host, script);
      else document.body.appendChild(host);
    }
    if (host.getAttribute('data-hx-mounted') === '1') return;
    host.setAttribute('data-hx-mounted', '1');
    mount(host);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
