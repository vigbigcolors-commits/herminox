/* ============================================================
   herminox.com — Cost Per Use Calculator
   Real cost = (price + lifetime upkeep) / total uses.
   Two input modes: total uses, or uses/week × lifespan years.
   ============================================================ */
'use strict';

/* ---------- ENGINE ---------- */
function totalUsesFromFreq(perWeek, years){ return perWeek * 52 * years; }

function costPerUse(item){
  const total = item.price + (item.upkeep || 0);
  return item.uses > 0 ? total / item.uses : null;
}

function compare(items){
  const results = items.map((it, i) => {
    const cpu = costPerUse(it);
    return { i, ...it, cpu, valid: it.price > 0 && it.uses > 0 };
  });
  const valid = results.filter(r => r.valid);
  if(!valid.length) return { results, best:null, ranked:[] };

  const ranked = [...valid].sort((a,b) => a.cpu - b.cpu);
  const best = ranked[0], worst = ranked[ranked.length-1];
  results.forEach(r => {
    if(r.valid){
      r.isBest = r.i === best.i;
      r.barPct = worst.cpu > 0 ? (r.cpu / worst.cpu) * 100 : 0;
    }
  });
  const saveVsNext  = ranked.length > 1 ? (1 - best.cpu / ranked[1].cpu) * 100 : 0;
  const saveVsWorst = ranked.length > 1 ? (1 - best.cpu / worst.cpu) * 100 : 0;
  return { results, best:best.i, ranked, saveVsNext, saveVsWorst };
}

/* ---------- UI ---------- */
function $(s){ return document.getElementById(s); }
function $q(s,c=document){ return c.querySelector(s); }
function $$(s,c=document){ return [...c.querySelectorAll(s)]; }

let state = {
  mode: 'total', // 'total' | 'freq'
  variants: [
    { name:'', price:'', uses:'', perWeek:'', years:'', upkeep:'' },
    { name:'', price:'', uses:'', perWeek:'', years:'', upkeep:'' },
  ],
};

const MODE_ICONS = {
  total:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  freq:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
};

function fmtCPU(n){
  if(n < 0.01) return '$' + n.toFixed(4);
  if(n < 1)    return '$' + n.toFixed(3);
  if(n < 100)  return '$' + n.toFixed(2);
  return '$' + n.toFixed(0);
}
function money(n){ return '$' + n.toFixed(2); }

function effectiveUses(v){
  if(state.mode === 'total') return parseFloat(v.uses) || 0;
  const pw = parseFloat(v.perWeek) || 0;
  const yr = parseFloat(v.years) || 0;
  return totalUsesFromFreq(pw, yr);
}

function buildModeSwitch(){
  const wrap = $('mode-switch');
  wrap.innerHTML = `
    <button class="mode-btn${state.mode==='total'?' active':''}" data-mode="total">${MODE_ICONS.total}Total uses</button>
    <button class="mode-btn${state.mode==='freq'?' active':''}" data-mode="freq">${MODE_ICONS.freq}Per week × years</button>`;
  $$('.mode-btn', wrap).forEach(b => b.addEventListener('click', () => {
    if(b.dataset.mode === state.mode) return;
    state.mode = b.dataset.mode;
    buildModeSwitch(); renderVariants(); compute();
  }));
}

function usesField(v, i){
  if(state.mode === 'total'){
    return `<div class="v-field">
      <label>How many uses total?</label>
      <input class="v-uses" type="number" min="0" step="1" inputmode="numeric" value="${v.uses}" placeholder="e.g. 200">
    </div>`;
  }
  return `<div class="v-field">
      <label>Uses per week</label>
      <input class="v-perweek" type="number" min="0" step="0.5" inputmode="decimal" value="${v.perWeek}" placeholder="e.g. 3">
    </div>
    <div class="v-field">
      <label>Years you'll keep it</label>
      <input class="v-years" type="number" min="0" step="0.5" inputmode="decimal" value="${v.years}" placeholder="e.g. 5">
    </div>`;
}

function renderVariants(){
  const wrap = $('variants');
  wrap.innerHTML = state.variants.map((v, i) => `
    <div class="variant" data-i="${i}">
      <span class="variant-tag">Best value</span>
      <div class="variant-head">
        <span class="variant-letter">${String.fromCharCode(65+i)}</span>
        <span class="variant-name"><input class="v-name" type="text" value="${v.name.replace(/"/g,'&quot;')}" placeholder="Option ${String.fromCharCode(65+i)} (name it)"></span>
        <button class="v-remove" data-rm="${i}" ${state.variants.length<=2?'disabled':''} aria-label="Remove">×</button>
      </div>
      <div class="v-fields">
        <div class="v-field">
          <label>Price</label>
          <div class="v-iwrap"><span class="v-prefix">$</span>
          <input class="v-price has-prefix" type="number" min="0" step="0.01" inputmode="decimal" value="${v.price}" placeholder="0.00"></div>
        </div>
        ${usesField(v, i)}
        <div class="v-field" style="${state.mode==='freq'?'grid-column:1 / -1':''}">
          <label>Lifetime upkeep (optional)</label>
          <div class="v-iwrap"><span class="v-prefix">$</span>
          <input class="v-upkeep has-prefix" type="number" min="0" step="0.01" inputmode="decimal" value="${v.upkeep}" placeholder="batteries, refills…"></div>
        </div>
      </div>
      <div class="v-result">
        <span class="vr-label">Cost per use</span>
        <span><span class="vr-val" data-cpu="${i}">—</span><span class="vr-uses" data-uses="${i}"></span></span>
      </div>
    </div>`).join('');

  $$('.variant', wrap).forEach(row => {
    const i = +row.dataset.i;
    const bind = (sel, key) => { const el=$q(sel,row); if(el) el.addEventListener('input', e=>{ state.variants[i][key]=e.target.value; compute(); }); };
    bind('.v-name','name'); bind('.v-price','price'); bind('.v-upkeep','upkeep');
    bind('.v-uses','uses'); bind('.v-perweek','perWeek'); bind('.v-years','years');
    const rm = $q('.v-remove', row);
    if(rm) rm.addEventListener('click', ()=>{ if(state.variants.length>2){ state.variants.splice(i,1); renderVariants(); compute(); }});
  });

  $('add-variant').disabled = state.variants.length >= 4;
}

function compute(){
  const items = state.variants.map(v => ({
    name: v.name,
    price: parseFloat(v.price) || 0,
    upkeep: parseFloat(v.upkeep) || 0,
    uses: effectiveUses(v),
  }));
  const r = compare(items);

  state.variants.forEach((v,i) => {
    const res = r.results[i];
    const cpuEl = document.querySelector(`[data-cpu="${i}"]`);
    const usesEl = document.querySelector(`[data-uses="${i}"]`);
    const rowEl = document.querySelector(`.variant[data-i="${i}"]`);
    if(res && res.valid){
      cpuEl.textContent = fmtCPU(res.cpu);
      usesEl.textContent = '· ' + res.uses.toLocaleString() + ' uses';
      rowEl.classList.toggle('is-best', res.isBest);
    } else {
      cpuEl.textContent = '—'; usesEl.textContent = '';
      rowEl.classList.remove('is-best');
    }
  });

  renderVerdict(r);
}

function renderVerdict(r){
  const box = $('verdict');
  if(r.best === null){
    box.className = 'verdict-box empty';
    box.innerHTML = '<p>Enter price and uses for at least one option to see the real cost per use.</p>';
    return;
  }
  box.className = 'verdict-box';
  const best = r.results[r.best];
  const name = best.name && best.name.trim() ? best.name.trim() : 'Option ' + String.fromCharCode(65 + r.best);

  let title, sub;
  if(r.ranked.length === 1){
    title = `${name} costs <b>${fmtCPU(best.cpu)}</b> per use`;
    sub = 'Add a second option to see which one is actually cheaper over its life.';
  } else if(r.saveVsWorst < 0.5){
    title = `It's a tie`;
    sub = `Both work out to about the same per use. Buy whichever you prefer.`;
  } else {
    title = `<b>${name}</b> is cheaper per use`;
    sub = `At <strong>${fmtCPU(best.cpu)}</strong> per use, it beats the next option by ${r.saveVsNext.toFixed(0)}%`
        + (r.ranked.length > 2 ? `, and the priciest by ${r.saveVsWorst.toFixed(0)}%.` : '.')
        + ` Cheaper upfront doesn't always mean cheaper to own.`;
  }

  const bars = r.results.map((res,i) => {
    if(!res.valid) return '';
    const nm = res.name && res.name.trim() ? res.name.trim() : 'Option ' + String.fromCharCode(65+i);
    return `<div class="bar-row${res.isBest?' is-best':''}">
      <span class="bar-name">${nm.length>14?nm.slice(0,13)+'…':nm}</span>
      <div class="bar-track"><div class="bar-fill${res.isBest?' best':''}" style="width:${Math.max(6,res.barPct)}%"></div></div>
      <span class="bar-val">${fmtCPU(res.cpu)}</span>
    </div>`;
  }).join('');

  box.innerHTML = `
    <div class="verdict-head"><span class="verdict-stamp">Verdict</span></div>
    <p class="verdict-title">${title}</p>
    <p class="verdict-sub">${sub}</p>
    <div class="bars">${bars}</div>`;
}

function init(){
  buildModeSwitch();
  renderVariants();
  $('add-variant').addEventListener('click', ()=>{
    if(state.variants.length<4){ state.variants.push({name:'',price:'',uses:'',perWeek:'',years:'',upkeep:''}); renderVariants(); compute(); }
  });

  // Demo — quality lasts longer so cost-per-use clearly wins (not a tie)
  state.mode = 'freq';
  state.variants[0] = { name:'Quality boots', price:'220', uses:'', perWeek:'3', years:'5', upkeep:'40' };
  state.variants[1] = { name:'Cheap boots', price:'60', uses:'', perWeek:'3', years:'1', upkeep:'' };
  buildModeSwitch();
  renderVariants();
  compute();
}

document.addEventListener('DOMContentLoaded', init);

/* reveal */
document.addEventListener('DOMContentLoaded', function(){
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in')}); return; }
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e)});
});

/* scroll progress */
document.addEventListener('DOMContentLoaded', function(){
  var bar = document.getElementById('scroll-progress');
  if(!bar) return;
  function updateBar(){
    var doc = document.documentElement;
    var pct = (doc.scrollTop || document.body.scrollTop) / (doc.scrollHeight - doc.clientHeight);
    bar.style.width = Math.min(1, Math.max(0, pct)) * 100 + '%';
  }
  window.addEventListener('scroll', updateBar, {passive:true});
  updateBar();
});

/* checklist progress */
document.addEventListener('DOMContentLoaded', function(){
  var grid = document.getElementById('cpu-checklist');
  var prog = document.getElementById('cpu-checklist-progress');
  if(!grid || !prog) return;
  var checks = grid.querySelectorAll('input[type=checkbox]');
  var total = checks.length;
  function update(){
    var done = grid.querySelectorAll('input:checked').length;
    if(done === 0) prog.textContent = '0 of ' + total + ' complete — tick each box as you evaluate your purchase';
    else if(done === total) prog.textContent = '✓ All ' + total + ' checks complete — ready to make your decision';
    else prog.textContent = done + ' of ' + total + ' complete';
  }
  checks.forEach(function(c){ c.addEventListener('change', update); });
  update();
});
