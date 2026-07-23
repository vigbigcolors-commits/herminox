/* ============================================================
   herminox.com — Inventory Breakeven Calculator
   How many units must sell to recover a purchase order,
   how long it takes, capital tied up, full sell-through ROI.
   ============================================================ */
'use strict';

function calc(inp){
  const { sellPrice, unitCost, amazonFees, orderQty, sellPerWeek } = inp;

  const profitPerUnit  = +(sellPrice - unitCost - amazonFees).toFixed(2);
  const revenuePerUnit = +(sellPrice - amazonFees).toFixed(2);   // cash back per sale
  const capitalTiedUp  = +(unitCost * orderQty).toFixed(2);      // sunk into the PO

  // Units to recover the capital you spent on the PO
  const unitsToRecover = revenuePerUnit > 0 ? Math.ceil(capitalTiedUp / revenuePerUnit) : null;

  const totalProfit = +(profitPerUnit * orderQty).toFixed(2);
  const grossRevenue = +(revenuePerUnit * orderQty).toFixed(2);
  const roi = capitalTiedUp > 0 ? +(totalProfit / capitalTiedUp * 100).toFixed(1) : 0;
  const margin = sellPrice > 0 ? +(profitPerUnit / sellPrice * 100).toFixed(1) : 0;

  const pctToBreakeven = (orderQty > 0 && unitsToRecover != null)
    ? +(unitsToRecover / orderQty * 100).toFixed(1) : null;

  const weeksToRecover = (sellPerWeek > 0 && unitsToRecover != null)
    ? +(unitsToRecover / sellPerWeek).toFixed(1) : null;
  const weeksToSellOut = sellPerWeek > 0 ? +(orderQty / sellPerWeek).toFixed(1) : null;

  // can the order even break even?
  const recoverable = unitsToRecover != null && unitsToRecover <= orderQty;

  return { profitPerUnit, revenuePerUnit, capitalTiedUp, unitsToRecover,
           totalProfit, grossRevenue, roi, margin, pctToBreakeven,
           weeksToRecover, weeksToSellOut, recoverable };
}

/* ---------- UI ---------- */
function $(id){ return document.getElementById(id); }
function money(n){ return (n<0?'−$':'$') + Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function moneyShort(n){ return (n<0?'−$':'$') + Math.abs(n).toLocaleString('en-US',{maximumFractionDigits:0}); }

function readInputs(){
  return {
    sellPrice:   parseFloat($('price').value) || 0,
    unitCost:    parseFloat($('cost').value) || 0,
    amazonFees:  parseFloat($('fees').value) || 0,
    orderQty:    parseFloat($('qty').value) || 0,
    sellPerWeek: parseFloat($('velocity').value) || 0,
  };
}

function fmtWeeks(w){
  if(w == null) return '—';
  if(w < 1) return Math.round(w*7) + ' days';
  if(w < 8) return w.toFixed(1) + ' wks';
  return Math.round(w/4.345) + ' mo';
}

function render(){
  const inp = readInputs();

  if(inp.sellPrice <= 0 || inp.orderQty <= 0){
    $('be-num').textContent = '—';
    $('be-num').className = 'be-num';
    $('verdict').textContent = 'Enter sell price, cost and order quantity to see your breakeven.';
    $('verdict').className = 'verdict';
    $('prog-recover').style.width = '0%';
    ['r-capital','r-profit-unit','r-total-profit','r-roi','r-recover-time','r-sellout-time'].forEach(id=>$(id).textContent='—');
    $('prog-recover-label').textContent = '';
    $('prog-profit-label').textContent = '';
    return;
  }

  const r = calc(inp);

  // Hero number
  if(r.unitsToRecover == null){
    $('be-num').textContent = '∞';
    $('be-num').className = 'be-num neg';
  } else {
    $('be-num').textContent = r.unitsToRecover.toLocaleString();
    $('be-num').className = 'be-num' + (r.recoverable && r.profitPerUnit >= 0 ? '' : ' neg');
  }
  $('be-sub').innerHTML = `units sold to recover your <b>${moneyShort(r.capitalTiedUp)}</b> order`;

  // Progress bar — recover portion vs profit portion of the order
  const recoverPct = r.unitsToRecover != null ? Math.min(100, r.unitsToRecover / inp.orderQty * 100) : 100;
  const profitPct = Math.max(0, 100 - recoverPct);
  $('prog-recover').style.width = recoverPct + '%';
  $('prog-profit').style.width = profitPct + '%';
  $('prog-recover-label').textContent = r.unitsToRecover != null ? r.unitsToRecover + ' to recover' : '';
  $('prog-profit-label').textContent = (r.unitsToRecover != null && r.recoverable)
    ? (inp.orderQty - r.unitsToRecover) + ' in profit' : '';
  $('prog-head-r').textContent = inp.orderQty.toLocaleString() + ' units ordered';

  // Details
  $('r-capital').textContent = money(r.capitalTiedUp);
  $('r-profit-unit').textContent = money(r.profitPerUnit);
  $('r-profit-unit').className = 'det-v ' + (r.profitPerUnit >= 0 ? 'green' : 'red');
  $('r-total-profit').textContent = money(r.totalProfit);
  $('r-total-profit').className = 'det-v ' + (r.totalProfit >= 0 ? 'green' : 'red');
  $('r-roi').textContent = (inp.unitCost > 0 ? r.roi + '%' : '—');
  $('r-roi').className = 'det-v ' + (r.roi >= 0 ? 'amber' : 'red');
  $('r-recover-time').textContent = fmtWeeks(r.weeksToRecover);
  $('r-sellout-time').textContent = fmtWeeks(r.weeksToSellOut);

  // Verdict
  let v, cls;
  if(r.unitsToRecover == null){
    v = `Fees are ≥ sell price — you get <b>no cash back</b> per sale. Capital cannot be recovered at this price. Raise price or cut fees before ordering.`;
    cls = 'v-bad';
  } else if(r.profitPerUnit < 0){
    v = `This product loses ${money(Math.abs(r.profitPerUnit))} per unit. Selling the whole order still returns less cash than the PO cost — fix price, cost or fees before ordering.`;
    cls = 'v-bad';
  } else if(!r.recoverable){
    v = `You'd need to sell <b>${r.unitsToRecover}</b> units to recover capital, but the order is only ${inp.orderQty}. This order can't fully recover its cost.`;
    cls = 'v-bad';
  } else if(r.pctToBreakeven > 70){
    v = `You must sell <b>${r.pctToBreakeven}%</b> of the order just to get your money back. Thin cushion — only ${(100-r.pctToBreakeven).toFixed(0)}% of units are actual profit.`;
    cls = 'v-warn';
  } else if(r.pctToBreakeven > 45){
    v = `Sell <b>${r.unitsToRecover}</b> units (${r.pctToBreakeven}% of the order) to recover ${moneyShort(r.capitalTiedUp)}. The rest is profit. Reasonable for most products.`;
    cls = 'v-ok';
  } else {
    v = `Strong. You recover your capital after just <b>${r.pctToBreakeven}%</b> of the order sells — the remaining ${(100-r.pctToBreakeven).toFixed(0)}% is ${money(r.totalProfit)} of profit at full sell-through.`;
    cls = 'v-good';
  }
  if(r.weeksToRecover != null) v += ` Roughly ${fmtWeeks(r.weeksToRecover)} at your pace.`;
  $('verdict').innerHTML = v;
  $('verdict').className = 'verdict ' + cls;
}

function init(){
  ['price','cost','fees','qty','velocity'].forEach(id => $(id).addEventListener('input', render));
  // Demo
  $('price').value = 30;
  $('cost').value = 8;
  $('fees').value = 9;
  $('qty').value = 200;
  $('velocity').value = 25;
  render();
}

document.addEventListener('DOMContentLoaded', init);

/* reveal */
document.addEventListener('DOMContentLoaded', function(){
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in')}); return; }
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e)});
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

/* checklist progress counter */
(function(){
  var cl = document.getElementById('inv-checklist');
  var prog = document.getElementById('inv-checklist-progress');
  if(!cl || !prog) return;
  var total = cl.querySelectorAll('input[type=checkbox]').length;
  function updateProgress(){
    var done = cl.querySelectorAll('input[type=checkbox]:checked').length;
    if(done === total){
      prog.textContent = done + ' of ' + total + ' complete — purchase order approved ✓';
      prog.classList.add('is-done');
    } else {
      prog.textContent = done + ' of ' + total + ' complete — tick each box as you vet your purchase order';
      prog.classList.remove('is-done');
    }
  }
  cl.addEventListener('change', updateProgress);
  updateProgress();
})();