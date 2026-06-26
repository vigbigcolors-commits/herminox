/* ============================================================
   herminox.com — ACoS / TACoS Breakeven Calculator
   Breakeven ACoS = pre-ad margin %. Simple, but most sellers
   don't compute it. Also: profit at target ACoS, max CPC,
   TACoS when organic share is known.
   ============================================================ */
'use strict';

/* ---------- CORE MATH ---------- */
function calculate(inp){
  const { price, cogs, referralPct, fbaFee, targetAcos, convRate, organicPct } = inp;

  const referral = +(price * referralPct / 100).toFixed(2);
  const totalFees = +(referral + fbaFee).toFixed(2);
  const preAdProfit = +(price - cogs - totalFees).toFixed(2);
  const preAdMargin = price > 0 ? +(preAdProfit / price * 100).toFixed(1) : 0;

  // ★ Breakeven ACoS = pre-ad margin (as % of price)
  const breakeven = preAdMargin;

  // At target ACoS
  const adCostPerUnit = +(price * targetAcos / 100).toFixed(2);
  const profitAtTarget = +(preAdProfit - adCostPerUnit).toFixed(2);
  const marginAtTarget = price > 0 ? +(profitAtTarget / price * 100).toFixed(1) : 0;

  // Max CPC = price × (ACoS/100) × (convRate/100)
  const maxCPC = convRate > 0 ? +(price * (breakeven / 100) * (convRate / 100)).toFixed(2) : 0;
  const maxCPCatTarget = convRate > 0 ? +(price * (targetAcos / 100) * (convRate / 100)).toFixed(2) : 0;

  // TACoS: if organic share is X%, ad revenue = (1−X%) of total.
  // TACoS = ad spend / total revenue.
  // At breakeven ACoS on ad sales: ad spend = adRevenue × breakeven/100
  // TACoS = (adRevenue × breakeven/100) / totalRevenue
  //       = (1−organicPct/100) × breakeven
  const tacosAtBreakeven = +((1 - organicPct / 100) * breakeven).toFixed(1);
  const tacosAtTarget    = +((1 - organicPct / 100) * targetAcos).toFixed(1);

  // Zone of target ACoS
  let zone;
  if(targetAcos < breakeven * 0.6) zone = 'strong';
  else if(targetAcos < breakeven * 0.9) zone = 'ok';
  else if(targetAcos <= breakeven) zone = 'thin';
  else zone = 'loss';

  return {
    referral, totalFees, preAdProfit, preAdMargin,
    breakeven, adCostPerUnit, profitAtTarget, marginAtTarget,
    maxCPC, maxCPCatTarget, tacosAtBreakeven, tacosAtTarget, zone,
  };
}

/* ---------- UI ---------- */
function $(s){ return document.getElementById(s); }
function money(n){ return (n<0?'−$':'$')+Math.abs(n).toFixed(2); }

function readInputs(){
  return {
    price:       parseFloat($('price').value) || 0,
    cogs:        parseFloat($('cogs').value) || 0,
    referralPct: parseFloat($('referral').value) || 15,
    fbaFee:      parseFloat($('fba').value) || 0,
    targetAcos:  parseFloat($('target').value) || 30,
    convRate:    parseFloat($('conv').value) || 10,
    organicPct:  parseFloat($('organic').value) || 50,
  };
}

function render(){
  const inp = readInputs();
  $('target-val').textContent = inp.targetAcos + '%';
  $('organic-val').textContent = inp.organicPct + '%';

  if(inp.price <= 0){
    $('be-num').textContent = '—';
    $('verdict').textContent = 'Enter a selling price to see your breakeven ACoS.';
    $('verdict').className = 'verdict';
    return;
  }

  const r = calculate(inp);

  // Big number
  $('be-num').textContent = r.breakeven + '%';
  $('be-num').className = 'be-num ' + (r.preAdProfit < 0 ? 'neg' : '');

  // Pre-ad
  $('r-preadprofit').textContent = money(r.preAdProfit);
  $('r-preadmargin').textContent = r.preAdMargin + '%';
  $('r-totalfees').textContent = money(r.totalFees);

  // At target
  $('r-profit-target').textContent = money(r.profitAtTarget);
  $('r-margin-target').textContent = r.marginAtTarget + '%';
  $('r-adcost').textContent = money(r.adCostPerUnit);

  // CPC
  $('r-maxcpc').textContent = money(r.maxCPC);
  $('r-maxcpc-target').textContent = money(r.maxCPCatTarget);

  // TACoS
  $('r-tacos-be').textContent = r.tacosAtBreakeven + '%';
  $('r-tacos-target').textContent = r.tacosAtTarget + '%';

  // Gauge
  const gauge = $('gauge-fill');
  const marker = $('gauge-marker');
  const bePct = Math.min(r.breakeven, 100);
  const tgtPct = Math.min(inp.targetAcos, 100);
  // gauge: 0..100% ACoS. Green up to breakeven, red after.
  gauge.style.width = Math.max(0, bePct) + '%';
  marker.style.left = Math.min(tgtPct, 98) + '%';
  marker.setAttribute('data-label', inp.targetAcos + '%');

  // Verdict
  let v;
  if(r.preAdProfit < 0){
    v = 'This product loses money before ads. Advertising will only deepen the loss.';
  } else if(r.zone === 'loss'){
    v = `At ${inp.targetAcos}% ACoS you lose ${money(Math.abs(r.profitAtTarget))} per ad-driven sale. Either cut ACoS below ${r.breakeven}% or raise your price.`;
  } else if(r.zone === 'thin'){
    v = `At ${inp.targetAcos}% ACoS you're close to breakeven — only ${money(r.profitAtTarget)} per ad sale. One bad week wipes it out.`;
  } else if(r.zone === 'ok'){
    v = `At ${inp.targetAcos}% ACoS you keep ${money(r.profitAtTarget)} per ad sale. Workable, but keep an eye on it.`;
  } else {
    v = `At ${inp.targetAcos}% ACoS you keep ${money(r.profitAtTarget)} per ad sale. Healthy room between your target and breakeven (${r.breakeven}%).`;
  }
  $('verdict').textContent = v;
  $('verdict').className = 'verdict v-' + r.zone;
}

function init(){
  ['price','cogs','referral','fba','conv'].forEach(id =>
    $(id).addEventListener('input', render));
  ['target','organic'].forEach(id => {
    $(id).addEventListener('input', render);
  });

  // Demo
  $('price').value = 29.99;
  $('cogs').value = 8;
  $('referral').value = 15;
  $('fba').value = 5.39;
  $('target').value = 25;
  $('conv').value = 10;
  $('organic').value = 50;
  render();
}

document.addEventListener('DOMContentLoaded', init);

/* scroll reveal */
document.addEventListener('DOMContentLoaded', function(){
  var els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in')}); return; }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{ threshold:.12, rootMargin:'0px 0px -8% 0px' });
  els.forEach(function(e){ io.observe(e); });
});

/* scroll progress bar */
(function(){
  var bar = document.getElementById('scroll-progress');
  if(!bar) return;
  function updateBar(){
    var scrolled = window.scrollY || window.pageYOffset;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    if(total <= 0){ bar.style.width = '0%'; return; }
    bar.style.width = Math.min(100, scrolled / total * 100) + '%';
  }
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
})();

/* stat counter animation — count up when entering viewport */
(function(){
  var stats = document.querySelectorAll('.stats .stat');
  if(!stats.length || !('IntersectionObserver' in window)) return;
  var fired = false;
  var io = new IntersectionObserver(function(entries){
    if(fired) return;
    if(entries.some(function(e){ return e.isIntersecting; })){
      fired = true;
      io.disconnect();
      stats.forEach(function(s){ s.classList.add('in'); });
    }
  },{ threshold:.3 });
  stats.forEach(function(s){ io.observe(s); });
})();

/* checklist progress counter */
document.addEventListener('DOMContentLoaded', function(){
  var cl = document.getElementById('acos-checklist');
  var prog = document.getElementById('acos-checklist-progress');
  if(!cl || !prog) return;
  var total = cl.querySelectorAll('input[type=checkbox]').length;
  function updateProgress(){
    var done = cl.querySelectorAll('input[type=checkbox]:checked').length;
    if(done === total){
      prog.textContent = done + ' of ' + total + ' complete — you\'re ready to run profitable PPC ✓';
      prog.classList.add('is-done');
    } else {
      prog.textContent = done + ' of ' + total + ' complete — tick each box as you audit your PPC setup';
      prog.classList.remove('is-done');
    }
  }
  cl.addEventListener('change', updateProgress);
  updateProgress();
});
