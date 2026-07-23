/*!
 * Herminox FBA Profit Widget — Vanilla JS embed (no React/Vue).
 * Security: Shadow DOM CSS isolation · no cookies · no parent-DOM scraping ·
 * numeric allowlist only · opens herminox.com with UTM + prefill.
 *
 * Usage:
 * <div id="herminox-fba"></div>
 * <script async src="https://herminox.com/embed/fba.js"
 *   data-target="herminox-fba"
 *   data-utm-source="partner-site"
 *   data-utm-medium="embed"
 *   data-utm-campaign="fba-widget"></script>
 */
(function () {
  'use strict';
  if (window.__HERMINOX_FBA_EMBED__) return;
  window.__HERMINOX_FBA_EMBED__ = true;

  var ORIGIN = 'https://herminox.com';
  var TOOL = ORIGIN + '/sellers/fba-calculator/';
  var script = document.currentScript;

  var REFERRAL = {
    home_kitchen: { label: 'Home & Kitchen', flat: 0.15, min: 0.3 },
    beauty: { label: 'Beauty & Personal Care', flat: 0.15, min: 0.3 },
    sports: { label: 'Sports & Outdoors', flat: 0.15, min: 0.3 },
    toys: { label: 'Toys & Games', flat: 0.15, min: 0.3 },
    pet: { label: 'Pet Supplies', flat: 0.15, min: 0.3 },
    electronics: { label: 'Consumer Electronics', flat: 0.08, min: 0.3 },
    apparel: { label: 'Clothing & Accessories', tiers: [[15, 0.05], [20, 0.1], [Infinity, 0.17]], min: 0.3 },
    grocery: { label: 'Grocery & Gourmet', tiers: [[15, 0.08], [Infinity, 0.15]], min: 0 },
  };

  function referralFee(catKey, price) {
    var c = REFERRAL[catKey] || REFERRAL.home_kitchen;
    var fee;
    if (c.flat != null) fee = price * c.flat;
    else {
      fee = 0;
      var lower = 0;
      for (var i = 0; i < c.tiers.length; i++) {
        var upper = c.tiers[i][0], rate = c.tiers[i][1];
        var portion = Math.min(price, upper) - lower;
        if (portion <= 0) break;
        fee += portion * rate;
        lower = upper;
      }
    }
    return Math.max(fee, c.min);
  }

  function priceBand(p) { return p < 10 ? 0 : p <= 50 ? 1 : 2; }

  var SMALL = [[2,[2.43,3.32,3.58]],[4,[2.49,3.42,3.68]],[8,[2.66,3.54,3.80]],[12,[2.82,3.78,4.04]],[16,[2.95,3.96,4.22]]];
  var LARGE = [[4,[2.91,3.73,3.99]],[8,[3.13,3.95,4.21]],[16,[3.78,4.60,4.86]],[24,[4.60,5.42,5.68]],[32,[5.00,5.82,6.08]],[48,[5.85,6.67,6.93]]];

  function fbaFee(weightOz, price) {
    var band = priceBand(price);
    var table = weightOz <= 16 ? SMALL : LARGE;
    for (var i = 0; i < table.length; i++) {
      if (weightOz <= table[i][0]) return table[i][1][band];
    }
    return 6.97;
  }

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
    p.set('utm_campaign', (script && script.getAttribute('data-utm-campaign')) || 'fba-embed');
    p.set('utm_content', 'fba-widget');
    return p;
  }

  function buildDeepLink(vals) {
    var p = utmParams();
    p.set('price', vals.price);
    p.set('cogs', vals.cogs);
    p.set('weight', vals.weightLb);
    p.set('unit', 'lb');
    p.set('category', vals.category);
    p.set('fuel', vals.fuel ? '1' : '0');
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
      'input,select{width:100%;padding:9px 10px;border:1px solid #C8BFA8;border-radius:8px;background:#fff;font-size:14px}',
      '.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.fuel{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:13px}',
      '.fuel input{width:auto}',
      '.out{margin-top:14px;padding:12px;border-radius:8px;background:#1B2138;color:#F0EDE6}',
      '.out .big{font-size:22px;font-weight:700;margin:0}',
      '.out .sub{font-size:12px;opacity:.8;margin:4px 0 0}',
      '.out.loss{background:#5c2430}',
      '.cta{display:inline-block;margin-top:12px;padding:10px 14px;border-radius:8px;background:#C97B1A;color:#fff;text-decoration:none;font-size:13px;font-weight:600}',
      '.note{font-size:11px;color:#5A6175;margin:10px 0 0;line-height:1.4}'
    ].join('');

    var wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.innerHTML =
      '<p class="brand"><a href="' + ORIGIN + '/" target="_blank" rel="noopener noreferrer">Herminox</a> · FBA profit</p>' +
      '<div class="row"><div><label for="hx-price">Sell price ($)</label><input id="hx-price" type="number" min="0" step="0.01" value="35"></div>' +
      '<div><label for="hx-cogs">Your cost ($)</label><input id="hx-cogs" type="number" min="0" step="0.01" value="10"></div></div>' +
      '<label for="hx-cat">Category</label><select id="hx-cat"></select>' +
      '<div class="row"><div><label for="hx-w">Weight (lb)</label><input id="hx-w" type="number" min="0" step="0.01" value="1"></div>' +
      '<div><label class="fuel" style="margin-top:28px"><input id="hx-fuel" type="checkbox" checked> Fuel 3.5%</label></div></div>' +
      '<div class="out" id="hx-out"><p class="big" id="hx-profit">—</p><p class="sub" id="hx-meta"></p></div>' +
      '<a class="cta" id="hx-cta" href="' + TOOL + '" target="_blank" rel="noopener noreferrer">Open full FBA calculator →</a>' +
      '<p class="note">Runs in your browser. No signup. Estimate only — confirm fees in Seller Central.</p>';

    root.appendChild(style);
    root.appendChild(wrap);

    var cat = root.getElementById('hx-cat');
    Object.keys(REFERRAL).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k;
      o.textContent = REFERRAL[k].label;
      cat.appendChild(o);
    });
    cat.value = 'home_kitchen';

    var priceEl = root.getElementById('hx-price');
    var cogsEl = root.getElementById('hx-cogs');
    var wEl = root.getElementById('hx-w');
    var fuelEl = root.getElementById('hx-fuel');
    var out = root.getElementById('hx-out');
    var profitEl = root.getElementById('hx-profit');
    var metaEl = root.getElementById('hx-meta');
    var cta = root.getElementById('hx-cta');

    function recalc() {
      var price = num(priceEl, 0, 1e5);
      var cogs = num(cogsEl, 0, 1e5);
      var weightLb = num(wEl, 0, 1e5);
      var weightOz = weightLb * 16;
      var category = REFERRAL[cat.value] ? cat.value : 'home_kitchen';
      var fuelOn = !!fuelEl.checked;

      if (price <= 0) {
        profitEl.textContent = 'Enter a price';
        metaEl.textContent = '';
        out.className = 'out';
        return;
      }

      var referral = +referralFee(category, price).toFixed(2);
      var fbaBase = +fbaFee(weightOz, price).toFixed(2);
      var fuel = fuelOn ? +(fbaBase * 0.035).toFixed(2) : 0;
      var fees = +(referral + fbaBase + fuel).toFixed(2);
      var profit = +(price - cogs - fees).toFixed(2);
      var margin = +(profit / price * 100).toFixed(1);

      profitEl.textContent = money(profit) + ' · ' + margin + '%';
      metaEl.textContent = 'Fees ' + money(fees) + ' (referral ' + money(referral) + ' + FBA ' + money(fbaBase + fuel) + ')';
      out.className = 'out' + (profit < 0 ? ' loss' : '');

      cta.href = buildDeepLink({
        price: price,
        cogs: cogs,
        weightLb: weightLb || 1,
        category: category,
        fuel: fuelOn,
      });
    }

    [priceEl, cogsEl, wEl, cat, fuelEl].forEach(function (el) {
      el.addEventListener('input', recalc);
      el.addEventListener('change', recalc);
    });
    recalc();
  }

  function boot() {
    var id = (script && script.getAttribute('data-target')) || 'herminox-fba';
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
