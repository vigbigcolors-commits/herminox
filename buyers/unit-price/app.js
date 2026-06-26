/* ============================================================
   herminox.com — True Unit Price Comparator
   Engine: normalize any unit within a family to a base unit,
   compute price per display unit, rank, show savings.
   ============================================================ */
'use strict';

/* ---------- UNIT MODEL ---------- */
const UNITS = {
  weight: { label:'Weight',  display:'oz',
    units:{ oz:28.3495, lb:453.592, g:1, kg:1000 } },   // factor -> grams
  volume: { label:'Volume',  display:'fl oz',
    units:{ 'fl oz':29.5735, ml:1, l:1000, gal:3785.41 } }, // -> ml
  count:  { label:'Count',   display:'unit',
    units:{ unit:1, ct:1, pack:1, sheet:1 } },           // -> unit
};

function familyUnits(family){ return Object.keys(UNITS[family].units); }
function toBase(size, family, unit){ return size * UNITS[family].units[unit]; }

/* ---------- CORE COMPARE ---------- */
function compare(items, family){
  const disp = UNITS[family].display;
  const dispFactor = UNITS[family].units[disp];

  const results = items.map((it, idx) => {
    const baseQty = toBase(it.size, family, it.unit);
    const valid = baseQty > 0 && it.price > 0;
    const pricePerDisplay = valid ? (it.price / baseQty) * dispFactor : null;
    return { idx, ...it, pricePerDisplay, valid, dispUnit:disp };
  });

  const valid = results.filter(r => r.valid);
  if(valid.length === 0) return { results, disp, best:null, ranked:[] };

  const ranked = [...valid].sort((a,b) => a.pricePerDisplay - b.pricePerDisplay);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  results.forEach(r => {
    if(r.valid){
      r.isBest = r.idx === best.idx;
      // bar width relative to worst (worst = 100%)
      r.barPct = worst.pricePerDisplay > 0 ? (r.pricePerDisplay / worst.pricePerDisplay) * 100 : 0;
    }
  });

  // savings of best vs 2nd cheapest
  const savingsVsNext = ranked.length > 1
    ? (1 - best.pricePerDisplay / ranked[1].pricePerDisplay) * 100 : 0;
  // savings of best vs worst
  const savingsVsWorst = ranked.length > 1
    ? (1 - best.pricePerDisplay / worst.pricePerDisplay) * 100 : 0;

  return { results, disp, best:best.idx, ranked, savingsVsNext, savingsVsWorst, worstPrice:worst.pricePerDisplay };
}

/* ============================================================
   UI
   ============================================================ */
function $(s, ctx=document){ return ctx.querySelector(s); }
function $$(s, ctx=document){ return [...ctx.querySelectorAll(s)]; }

let state = {
  family: 'weight',
  variants: [
    { price:'', size:'', unit:'oz' },
    { price:'', size:'', unit:'oz' },
  ],
};

const FAMILY_ICONS = {
  weight:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 3a2 2 0 100 4 2 2 0 000-4zM7 7h10l3 11H4L7 7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  volume:'<svg viewBox="0 0 24 24" fill="none"><path d="M7 2h10l-1 7a4 4 0 01-8 0L7 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 13v7M9 21h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  count:'<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/></svg>',
};

function money(n){ return '$' + n.toFixed(2); }
function fmtUnitPrice(n){
  // small numbers need more precision
  if(n < 0.1) return '$' + n.toFixed(3);
  if(n < 1)   return '$' + n.toFixed(2);
  return '$' + n.toFixed(2);
}

function buildFamilySwitch(){
  const wrap = $('#family-switch');
  wrap.innerHTML = Object.entries(UNITS).map(([fam, def]) =>
    `<button class="family-btn${fam===state.family?' active':''}" data-family="${fam}">
      ${FAMILY_ICONS[fam]}${def.label}
    </button>`).join('');
  $$('.family-btn', wrap).forEach(btn => {
    btn.addEventListener('click', () => {
      if(btn.dataset.family === state.family) return;
      state.family = btn.dataset.family;
      // reset units to first valid in family
      const firstUnit = familyUnits(state.family)[0];
      state.variants.forEach(v => v.unit = firstUnit);
      buildFamilySwitch();
      renderVariants();
      compute();
    });
  });
}

function unitOptions(selected){
  return familyUnits(state.family).map(u =>
    `<option value="${u}"${u===selected?' selected':''}>${u}</option>`).join('');
}

function renderVariants(){
  const wrap = $('#variants');
  wrap.innerHTML = state.variants.map((v, i) => `
    <div class="variant" data-i="${i}">
      <span class="variant-tag">Best value</span>
      <span class="variant-idx">${String.fromCharCode(65+i)}</span>
      <div class="v-field">
        <label>Price</label>
        <div class="v-input-wrap">
          <span class="v-prefix">$</span>
          <input class="has-prefix v-price" type="number" min="0" step="0.01" inputmode="decimal" value="${v.price}" placeholder="0.00">
        </div>
      </div>
      <div class="v-field">
        <label>Size / amount</label>
        <input class="v-size" type="number" min="0" step="0.01" inputmode="decimal" value="${v.size}" placeholder="0">
      </div>
      <div class="v-field">
        <label>Unit</label>
        <select class="v-unit">${unitOptions(v.unit)}</select>
      </div>
      <div class="v-unitprice">
        <div class="upv" data-up="${i}">—</div>
        <div class="upl">per ${UNITS[state.family].display}</div>
      </div>
      <button class="v-remove" data-rm="${i}" ${state.variants.length<=2?'disabled':''} aria-label="Remove">×</button>
    </div>`).join('');

  // bind inputs
  $$('.variant', wrap).forEach(row => {
    const i = +row.dataset.i;
    $('.v-price', row).addEventListener('input', e => { state.variants[i].price = e.target.value; compute(); });
    $('.v-size', row).addEventListener('input', e => { state.variants[i].size = e.target.value; compute(); });
    $('.v-unit', row).addEventListener('change', e => { state.variants[i].unit = e.target.value; compute(); });
    const rm = $('.v-remove', row);
    if(rm) rm.addEventListener('click', () => {
      if(state.variants.length > 2){ state.variants.splice(i,1); renderVariants(); compute(); }
    });
  });

  $('#add-variant').disabled = state.variants.length >= 4;
}

function compute(){
  const items = state.variants.map(v => ({
    price: parseFloat(v.price) || 0,
    size: parseFloat(v.size) || 0,
    unit: v.unit,
  }));
  const r = compare(items, state.family);

  // per-variant unit price + best highlight
  state.variants.forEach((v, i) => {
    const res = r.results[i];
    const upEl = document.querySelector(`[data-up="${i}"]`);
    const rowEl = document.querySelector(`.variant[data-i="${i}"]`);
    if(res && res.valid){
      upEl.textContent = fmtUnitPrice(res.pricePerDisplay);
      rowEl.classList.toggle('is-best', res.isBest);
    } else {
      upEl.textContent = '—';
      rowEl.classList.remove('is-best');
    }
  });

  renderVerdict(r);
}

function updateKPI(r){
  const bestEl = document.getElementById('up-best');
  const bestUnitEl = document.getElementById('up-best-unit');
  const savingsEl = document.getElementById('up-savings');
  const winnerEl = document.getElementById('up-winner');
  const winnerSubEl = document.getElementById('up-winner-sub');
  if(!bestEl) return;

  const disp = UNITS[state.family].display;
  if(bestUnitEl) bestUnitEl.textContent = 'per ' + disp;

  if(r.best === null || r.ranked.length < 1){
    bestEl.textContent = '—';
    if(savingsEl) savingsEl.textContent = '—';
    if(winnerEl) winnerEl.textContent = '—';
    if(winnerSubEl) winnerSubEl.textContent = 'Enter options to compare';
    return;
  }

  const best = r.results[r.best];
  const letter = String.fromCharCode(65 + r.best);
  bestEl.textContent = fmtUnitPrice(best.pricePerDisplay);
  if(winnerEl) winnerEl.textContent = 'Option ' + letter;
  if(winnerSubEl){
    winnerSubEl.textContent = r.ranked.length === 1
      ? 'Add another option to compare'
      : fmtUnitPrice(best.pricePerDisplay) + '/' + disp + ' · best value';
  }
  if(savingsEl){
    if(r.ranked.length < 2) savingsEl.textContent = '—';
    else if(r.savingsVsNext < 0.5) savingsEl.textContent = '~0%';
    else savingsEl.textContent = r.savingsVsNext.toFixed(1) + '%';
  }
}

function renderVerdict(r){
  updateKPI(r);
  const box = $('#verdict');
  if(r.best === null || r.ranked.length < 1){
    box.className = 'verdict-box empty';
    box.innerHTML = '<p>Enter price and size for at least one option to see the winner.</p>';
    return;
  }
  box.className = 'verdict-box';

  const best = r.results[r.best];
  const bestLetter = String.fromCharCode(65 + r.best);

  let headline, sub;
  if(r.ranked.length === 1){
    headline = `Option <b>${bestLetter}</b> — ${fmtUnitPrice(best.pricePerDisplay)} per ${r.disp}`;
    sub = 'Add a second option to compare and find the better deal.';
  } else if(r.savingsVsWorst < 0.5){
    headline = `It's basically a tie`;
    sub = `All options land within half a percent per ${r.disp}. Buy whichever you prefer — the price gap is noise.`;
  } else {
    headline = `Option <b>${bestLetter}</b> is the better deal`;
    sub = `At <strong>${fmtUnitPrice(best.pricePerDisplay)}/${r.disp}</strong>, it's ${r.savingsVsNext.toFixed(1)}% cheaper than the next option`
        + (r.ranked.length > 2 ? `, and ${r.savingsVsWorst.toFixed(1)}% cheaper than the priciest.` : '.');
  }

  // bars
  const barsHtml = r.results.map((res, i) => {
    if(!res.valid) return '';
    const letter = String.fromCharCode(65 + i);
    return `<div class="bar-row${res.isBest?' is-best':''}">
      <span class="bar-name">Option ${letter}</span>
      <div class="bar-track"><div class="bar-fill${res.isBest?' best':''}" style="width:${Math.max(6,res.barPct)}%"></div></div>
      <span class="bar-val">${fmtUnitPrice(res.pricePerDisplay)}</span>
    </div>`;
  }).join('');

  box.innerHTML = `
    <div class="verdict-head">
      <span class="verdict-stamp">Verdict</span>
    </div>
    <p class="verdict-title">${headline}</p>
    <p class="verdict-sub">${sub}</p>
    <div class="bars">${barsHtml}</div>`;
}

function init(){
  buildFamilySwitch();
  renderVariants();

  $('#add-variant').addEventListener('click', () => {
    if(state.variants.length < 4){
      state.variants.push({ price:'', size:'', unit: familyUnits(state.family)[0] });
      renderVariants();
      compute();
    }
  });

  // demo prefill — classic "is the big pack cheaper?"
  state.variants[0] = { price:'4.49', size:'12', unit:'oz' };
  state.variants[1] = { price:'6.99', size:'20', unit:'oz' };
  renderVariants();
  compute();
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:.12, rootMargin:'0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
});

/* scroll progress */
document.addEventListener('DOMContentLoaded', function(){
  const bar = document.getElementById('scroll-progress');
  if(!bar) return;
  function updateBar(){
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max : 0;
    bar.style.width = Math.min(1, Math.max(0, pct)) * 100 + '%';
  }
  window.addEventListener('scroll', updateBar, {passive:true});
  updateBar();
});

/* checklist progress */
document.addEventListener('DOMContentLoaded', function(){
  const grid = document.getElementById('up-checklist');
  const prog = document.getElementById('up-checklist-progress');
  if(!grid || !prog) return;
  const checks = grid.querySelectorAll('input[type=checkbox]');
  const total = checks.length;
  function update(){
    const done = grid.querySelectorAll('input:checked').length;
    if(done === 0) prog.textContent = '0 of ' + total + ' complete — tick each box on your next shopping trip';
    else if(done === total) prog.textContent = '✓ All ' + total + ' checks complete — your unit-price habit is locked in';
    else prog.textContent = done + ' of ' + total + ' complete';
  }
  checks.forEach(c => c.addEventListener('change', update));
  update();
});
