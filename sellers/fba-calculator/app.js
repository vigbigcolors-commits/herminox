/* =============================================================
   FBA Profit Calculator — engine + UI
   Данные: Amazon 2026 rate card (fulfillment) + 2026 referral table.
   Источники проверены fetch'ем. Referral заморожены 2025–2026.
   ============================================================= */
'use strict';

/* ---------- REFERRAL FEES 2026 (tiered где нужно) ---------- */
const REFERRAL = {
  home_kitchen:{ label:'Home & Kitchen',          flat:0.15, min:0.30 },
  beauty:      { label:'Beauty & Personal Care',  flat:0.15, min:0.30 },
  sports:      { label:'Sports & Outdoors',       flat:0.15, min:0.30 },
  toys:        { label:'Toys & Games',            flat:0.15, min:0.30 },
  pet:         { label:'Pet Supplies',            flat:0.15, min:0.30 },
  office:      { label:'Office Products',          flat:0.15, min:0.30 },
  music_inst:  { label:'Musical Instruments',      flat:0.15, min:0.30 },
  books:       { label:'Books',                    flat:0.15, min:0 },
  electronics: { label:'Consumer Electronics',     flat:0.08, min:0.30 },
  computers:   { label:'Computers',                flat:0.08, min:0.30 },
  automotive:  { label:'Automotive & Powersports', flat:0.12, min:0.30 },
  industrial:  { label:'Industrial & Scientific',  flat:0.12, min:0.30 },
  device_acc:  { label:'Amazon Device Accessories',flat:0.45, min:0.30 },
  apparel:     { label:'Clothing & Accessories',   tiers:[[15,0.05],[20,0.10],[Infinity,0.17]], min:0.30 },
  shoes:       { label:'Shoes, Handbags & Sunglasses', tiers:[[75,0.05],[150,0.10],[Infinity,0.15]], min:0.30 },
  jewelry:     { label:'Jewelry',                  tiers:[[250,0.20],[Infinity,0.05]], min:0.30 },
  watches:     { label:'Watches',                  tiers:[[1500,0.16],[Infinity,0.03]], min:2.00 },
  furniture:   { label:'Furniture',                tiers:[[200,0.15],[Infinity,0.10]], min:0.30 },
  baby:        { label:'Baby Products',            tiers:[[10,0.08],[Infinity,0.15]], min:0.30 },
  grocery:     { label:'Grocery & Gourmet',        tiers:[[15,0.08],[Infinity,0.15]], min:0 },
};

function referralFee(catKey, price){
  const c = REFERRAL[catKey];
  let fee;
  if(c.flat != null){
    fee = price * c.flat;
  } else {
    fee = 0; let lower = 0;
    for(const [upper,rate] of c.tiers){
      const portion = Math.min(price, upper) - lower;
      if(portion <= 0) break;
      fee += portion * rate;
      lower = upper;
    }
  }
  return Math.max(fee, c.min);
}

/* ---------- FBA FULFILLMENT 2026 (вес в унциях) ---------- */
function priceBand(p){ return p < 10 ? 0 : (p <= 50 ? 1 : 2); }

const SMALL_STD = [
  [2,[2.43,3.32,3.58]],[4,[2.49,3.42,3.68]],[6,[2.56,3.45,3.71]],[8,[2.66,3.54,3.80]],
  [10,[2.77,3.68,3.94]],[12,[2.82,3.78,4.04]],[14,[2.92,3.91,4.17]],[16,[2.95,3.96,4.22]],
];
const LARGE_STD = [
  [4,[2.91,3.73,3.99]],[8,[3.13,3.95,4.21]],[12,[3.38,4.20,4.46]],[16,[3.78,4.60,4.86]],
  [20,[4.22,5.04,5.30]],[24,[4.60,5.42,5.68]],[28,[4.75,5.57,5.83]],[32,[5.00,5.82,6.08]],
  [36,[5.10,5.92,6.18]],[40,[5.28,6.10,6.36]],[44,[5.44,6.26,6.52]],[48,[5.85,6.67,6.93]],
];
const LARGE_STD_BASE = [6.15,6.97,7.23]; // от 3lb (48oz), +$0.08 за каждые 4oz сверх
const OVERSIZE = {
  small_bulky:{ base:[6.78,7.55,7.55], perLb:0.38, after:1 },
  large_bulky:{ base:[8.58,9.35,9.35], perLb:0.38, after:1 },
};

/* Авто-определение тира по весу (упрощённо: по shipping weight).
   В UI можно выбрать вручную; auto — дефолт. */
function autoTier(weightOz){
  if(weightOz <= 16) return 'small_std';      // small standard ≤ 1 lb
  if(weightOz <= 320) return 'large_std';     // large standard ≤ 20 lb
  return 'small_bulky';                        // дальше — bulky (оценочно)
}

function fbaFee(tier, weightOz, price){
  const band = priceBand(price);
  if(tier === 'small_std'){
    for(const [maxOz,fees] of SMALL_STD) if(weightOz <= maxOz) return fees[band];
    return fbaFee('large_std', weightOz, price); // переполнение → следующий тир
  }
  if(tier === 'large_std'){
    for(const [maxOz,fees] of LARGE_STD) if(weightOz <= maxOz) return fees[band];
    if(weightOz <= 320){
      const extra4oz = Math.ceil((weightOz - 48) / 4);
      return +(LARGE_STD_BASE[band] + extra4oz * 0.08).toFixed(2);
    }
    return fbaFee('small_bulky', weightOz, price);
  }
  const o = OVERSIZE[tier] || OVERSIZE.small_bulky;
  const lb = weightOz / 16;
  const extra = Math.max(0, lb - o.after);
  return +(o.base[band] + extra * o.perLb).toFixed(2);
}

const FUEL_SURCHARGE = 0.035; // 3.5%, активен с 17 апреля 2026

/* ---------- ОСНОВНОЙ РАСЧЁТ ---------- */
function calculate(input){
  const { price, cogs, category, weightOz, tierMode, surcharge } = input;
  const tier = tierMode === 'auto' ? autoTier(weightOz) : tierMode;

  const referral = +referralFee(category, price).toFixed(2);
  let fbaBase = fbaFee(tier, weightOz, price);
  const fuel = surcharge ? +(fbaBase * FUEL_SURCHARGE).toFixed(2) : 0;
  const fbaTotal = +(fbaBase + fuel).toFixed(2);

  const totalFees = +(referral + fbaTotal).toFixed(2);
  const profit = +(price - cogs - totalFees).toFixed(2);
  const margin = price > 0 ? +(profit / price * 100).toFixed(1) : 0;
  const roi = cogs > 0 ? +(profit / cogs * 100).toFixed(1) : 0;

  return {
    tier, referral, fbaBase:+fbaBase.toFixed(2), fuel, fbaTotal,
    totalFees, profit, margin, roi,
    band: priceBand(price),
  };
}

/* ============================================================
   UI
   ============================================================ */
const TIER_LABELS = {
  small_std:'Small Standard', large_std:'Large Standard',
  small_bulky:'Small Bulky', large_bulky:'Large Bulky',
};
const BAND_LABELS = ['under $10','$10–$50','over $50'];

function $(id){ return document.getElementById(id); }
function money(n){ return (n<0?'−$':'$') + Math.abs(n).toFixed(2); }

function buildCategoryOptions(){
  const sel = $('category');
  Object.entries(REFERRAL).forEach(([k,v])=>{
    const o = document.createElement('option');
    o.value = k; o.textContent = v.label;
    sel.appendChild(o);
  });
  sel.value = 'home_kitchen';
}

function weightToOz(value, unit){
  value = parseFloat(value) || 0;
  if(unit === 'lb') return value * 16;
  if(unit === 'g')  return value / 28.3495;
  if(unit === 'kg') return value * 35.274;
  return value; // oz
}

function readInputs(){
  const price = parseFloat($('price').value) || 0;
  const cogs  = parseFloat($('cogs').value) || 0;
  const weightOz = weightToOz($('weight').value, $('weightUnit').value);
  return {
    price, cogs, weightOz,
    category: $('category').value,
    tierMode: $('tier').value,
    surcharge: $('surcharge').checked,
  };
}

function render(){
  const inp = readInputs();
  if(inp.price <= 0){
    $('verdict').textContent = 'Enter a selling price to see your real margin.';
    $('verdict').classList.remove('is-loss');
    $('r-profit').textContent = '$0.00';
    $('r-roi').textContent = '—';
    $('r-margin').textContent = '0%';
    $('margin-fill').style.width = '0%';
    ['r-referral','r-fba','r-cogs','r-fees'].forEach(id => $(id).textContent = '$0.00');
    $('r-fuel').textContent = '—';
    $('r-tier-detail').textContent = 'awaiting input';
    return;
  }
  const r = calculate(inp);

  $('r-referral').textContent = money(r.referral);
  $('r-fba').textContent = money(r.fbaTotal);
  $('r-fuel').textContent = r.fuel ? '+' + money(r.fuel) : '—';
  $('r-cogs').textContent = money(inp.cogs);
  $('r-fees').textContent = money(r.totalFees);
  $('r-profit').textContent = money(r.profit);
  $('r-margin').textContent = r.margin + '%';
  $('r-roi').textContent = (inp.cogs > 0 ? r.roi + '%' : '—');

  $('r-tier-detail').textContent =
    `${TIER_LABELS[r.tier]} · price band ${BAND_LABELS[r.band]}`;

  // Profit metric color
  const profitEl = $('m-profit');
  profitEl.classList.toggle('is-loss', r.profit < 0);
  profitEl.classList.toggle('is-win', r.profit >= 0);

  // Margin bar
  const fill = $('margin-fill');
  fill.style.width = Math.max(0, Math.min(100, r.margin)) + '%';
  fill.className = 'margin-fill ' +
    (r.margin < 0 ? 'is-loss' : r.margin < 15 ? 'is-thin' : r.margin < 30 ? 'is-ok' : 'is-strong');

  // Verdict
  let v;
  if(r.profit < 0) v = 'Loss. Every unit costs you money at this price.';
  else if(r.margin < 10) v = 'Razor-thin. One return or PPC click eats the profit.';
  else if(r.margin < 20) v = 'Workable, but watch ad spend and returns closely.';
  else if(r.margin < 35) v = 'Healthy margin. This product has room to breathe.';
  else v = 'Strong margin. Worth pushing volume on this one.';
  $('verdict').textContent = v;
  $('verdict').classList.toggle('is-loss', r.profit < 0);

  // live pulse
  const pulse = $('pulse');
  pulse.classList.remove('beat');
  void pulse.offsetWidth;
  pulse.classList.add('beat');
}

function init(){
  buildCategoryOptions();
  ['price','cogs','weight'].forEach(id => $(id).addEventListener('input', render));
  ['weightUnit','category','tier'].forEach(id => $(id).addEventListener('change', render));
  $('surcharge').addEventListener('change', render);

  // Demo prefill
  $('price').value = 35;
  $('cogs').value = 10;
  $('weight').value = 1;
  $('weightUnit').value = 'lb';
  render();
}

document.addEventListener('DOMContentLoaded', init);

/* ---------- scroll reveal ---------- */
document.addEventListener('DOMContentLoaded', function(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold:.12, rootMargin:'0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
});

/* ---------- vetting checklist (localStorage) ---------- */
document.addEventListener('DOMContentLoaded', function(){
  const grid = document.getElementById('vetting-checklist');
  const progress = document.getElementById('checklist-progress');
  if(!grid || !progress) return;

  const KEY = 'herminox_fba_vetting_checks';
  const boxes = grid.querySelectorAll('input[type=checkbox]');
  const total = boxes.length;

  function load(){
    try{ return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch(e){ return {}; }
  }
  function save(state){
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }
    catch(e){ /* private mode */ }
  }

  const state = load();
  boxes.forEach(function(box){
    const id = box.dataset.check;
    if(state[id]) box.checked = true;
    box.addEventListener('change', function(){
      state[id] = box.checked;
      save(state);
      updateProgress();
    });
  });

  function updateProgress(){
    const done = grid.querySelectorAll('input:checked').length;
    progress.textContent = done === total
      ? total + ' of ' + total + ' complete — ready to source or walk away'
      : done + ' of ' + total + ' complete — tick each box as you vet your SKU';
    progress.classList.toggle('is-done', done === total);
  }
  updateProgress();
});
