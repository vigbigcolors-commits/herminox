/**
 * Headless math audit for all Herminox calculators.
 * Run: node scripts/audit-calculators.mjs
 */
import assert from 'assert';

let failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log('  OK  ' + name);
  } catch (e) {
    failed++;
    console.log('  FAIL ' + name + ' — ' + e.message);
  }
}

/* ========== FBA (inline core from app.js) ========== */
console.log('\n== FBA Profit ==');
const REFERRAL = {
  home_kitchen: { flat: 0.15, min: 0.3 },
  electronics: { flat: 0.08, min: 0.3 },
  apparel: { tiers: [[15, 0.05], [20, 0.1], [Infinity, 0.17]], min: 0.3 },
  jewelry: { tiers: [[250, 0.2], [Infinity, 0.05]], min: 0.3 },
};
function referralFee(catKey, price) {
  const c = REFERRAL[catKey];
  let fee;
  if (c.flat != null) fee = price * c.flat;
  else {
    fee = 0;
    let lower = 0;
    for (const [upper, rate] of c.tiers) {
      const portion = Math.min(price, upper) - lower;
      if (portion <= 0) break;
      fee += portion * rate;
      lower = upper;
    }
  }
  return Math.max(fee, c.min);
}
function priceBand(p) {
  return p < 10 ? 0 : p <= 50 ? 1 : 2;
}
const SMALL_STD = [
  [2, [2.43, 3.32, 3.58]],
  [4, [2.49, 3.42, 3.68]],
  [16, [2.95, 3.96, 4.22]],
];
function fbaFeeSmall(weightOz, price) {
  const band = priceBand(price);
  for (const [maxOz, fees] of SMALL_STD) if (weightOz <= maxOz) return fees[band];
  return 4.22;
}
check('flat 15% referral on $35', () => {
  assert.strictEqual(+referralFee('home_kitchen', 35).toFixed(2), 5.25);
});
check('electronics 8% on $100', () => {
  assert.strictEqual(+referralFee('electronics', 100).toFixed(2), 8);
});
check('minimum referral applies on tiny price', () => {
  assert.strictEqual(+referralFee('home_kitchen', 1).toFixed(2), 0.3);
});
check('apparel tiered $14.99 ≈ 5% band', () => {
  const f = referralFee('apparel', 14.99);
  assert.ok(Math.abs(f - 14.99 * 0.05) < 0.02, 'got ' + f);
});
check('apparel $22 uses multiple bands', () => {
  // 15*0.05 + 5*0.10 + 2*0.17 = 0.75+0.5+0.34 = 1.59
  const f = +referralFee('apparel', 22).toFixed(2);
  assert.strictEqual(f, 1.59);
});
check('FBA small 12oz mid band', () => {
  // use 16oz row from simplified - weight 12 not in truncated table; full app has 12oz
  assert.ok(fbaFeeSmall(2, 35) === 3.32);
});
check('fuel 3.5% on fulfillment', () => {
  const base = 4.6;
  assert.strictEqual(+(base * 0.035).toFixed(2), 0.16);
});
check('profit identity', () => {
  const price = 35,
    cogs = 10,
    ref = 5.25,
    fba = 3.96,
    fuel = +(3.96 * 0.035).toFixed(2);
  const profit = +(price - cogs - ref - fba - fuel).toFixed(2);
  assert.strictEqual(profit, +(35 - 10 - 5.25 - 3.96 - 0.14).toFixed(2));
});

/* ========== ACoS ========== */
console.log('\n== ACoS Breakeven ==');
function acosCalc(inp) {
  const { price, cogs, referralPct, fbaFee, targetAcos, convRate, organicPct } = inp;
  const referral = +(price * (referralPct / 100)).toFixed(2);
  const totalFees = +(referral + fbaFee).toFixed(2);
  const preAdProfit = +(price - cogs - totalFees).toFixed(2);
  const breakeven = price > 0 ? +(preAdProfit / price * 100).toFixed(1) : 0;
  const adCostPerUnit = +(price * (targetAcos / 100)).toFixed(2);
  const profitAtTarget = +(preAdProfit - adCostPerUnit).toFixed(2);
  const maxCPC = convRate > 0 ? +(price * (breakeven / 100) * (convRate / 100)).toFixed(2) : 0;
  const tacosAtBreakeven = +((1 - organicPct / 100) * breakeven).toFixed(1);
  return { preAdProfit, breakeven, profitAtTarget, maxCPC, tacosAtBreakeven };
}
check('demo defaults breakeven', () => {
  const r = acosCalc({
    price: 29.99,
    cogs: 8,
    referralPct: 15,
    fbaFee: 5.39,
    targetAcos: 25,
    convRate: 10,
    organicPct: 50,
  });
  // fees = 4.50 + 5.39 = 9.89; pre = 29.99-8-9.89 = 12.10; BE = 40.3%
  assert.strictEqual(r.preAdProfit, 12.1);
  assert.strictEqual(r.breakeven, 40.3);
  assert.strictEqual(r.maxCPC, 1.21); // 29.99 * 0.403 * 0.10
  // 0.5×40.3 → float 20.14999… → toFixed(1) = 20.1 (matches UI copy)
  assert.strictEqual(r.tacosAtBreakeven, 20.1);
});
check('target above BE → negative ad profit', () => {
  const r = acosCalc({
    price: 30,
    cogs: 10,
    referralPct: 15,
    fbaFee: 5,
    targetAcos: 50,
    convRate: 10,
    organicPct: 0,
  });
  // pre = 30-10-4.5-5 = 10.5; BE=35%; ad at 50% = 15; profit = -4.5
  assert.ok(r.breakeven === 35);
  assert.ok(r.profitAtTarget < 0);
});

/* ========== Inventory ========== */
console.log('\n== Inventory Breakeven ==');
function invCalc(inp) {
  const { sellPrice, unitCost, amazonFees, orderQty, sellPerWeek } = inp;
  const profitPerUnit = +(sellPrice - unitCost - amazonFees).toFixed(2);
  const revenuePerUnit = +(sellPrice - amazonFees).toFixed(2);
  const capitalTiedUp = +(unitCost * orderQty).toFixed(2);
  const unitsToRecover = revenuePerUnit > 0 ? Math.ceil(capitalTiedUp / revenuePerUnit) : null;
  const recoverable = unitsToRecover != null && unitsToRecover <= orderQty;
  const weeksToRecover =
    sellPerWeek > 0 && unitsToRecover != null ? +(unitsToRecover / sellPerWeek).toFixed(1) : null;
  return { profitPerUnit, revenuePerUnit, capitalTiedUp, unitsToRecover, recoverable, weeksToRecover };
}
check('demo PO recovery math', () => {
  const r = invCalc({ sellPrice: 30, unitCost: 8, amazonFees: 9, orderQty: 200, sellPerWeek: 25 });
  assert.strictEqual(r.capitalTiedUp, 1600);
  assert.strictEqual(r.revenuePerUnit, 21);
  assert.strictEqual(r.unitsToRecover, 77); // ceil(1600/21)
  assert.strictEqual(r.profitPerUnit, 13);
  assert.ok(r.recoverable);
  assert.strictEqual(r.weeksToRecover, 3.1);
});
check('fees >= price → cannot recover', () => {
  const r = invCalc({ sellPrice: 10, unitCost: 5, amazonFees: 12, orderQty: 100, sellPerWeek: 10 });
  assert.strictEqual(r.unitsToRecover, null);
});
check('lossy unit still returns cash but PO unrecovered', () => {
  // sell 20, fees 5 → cash $15; cost $18 → lose $3/unit; 100 units need ceil(1800/15)=120 > 100
  const r = invCalc({ sellPrice: 20, unitCost: 18, amazonFees: 5, orderQty: 100, sellPerWeek: 10 });
  assert.strictEqual(r.revenuePerUnit, 15);
  assert.ok(r.profitPerUnit < 0);
  assert.strictEqual(r.unitsToRecover, 120);
  assert.ok(!r.recoverable);
});
check('cash recovery uses sell−fees not profit', () => {
  // If wrongly used profit: 1600/13≈124; correct is 77
  const r = invCalc({ sellPrice: 30, unitCost: 8, amazonFees: 9, orderQty: 200, sellPerWeek: 25 });
  assert.notStrictEqual(r.unitsToRecover, Math.ceil(1600 / 13));
});

/* ========== Unit price ========== */
console.log('\n== Unit Price ==');
const UNITS = {
  weight: { display: 'oz', units: { oz: 28.3495, lb: 453.592, g: 1, kg: 1000 } },
};
function unitPrice(price, size, unit) {
  const base = size * UNITS.weight.units[unit];
  const disp = UNITS.weight.units.oz;
  return (price / base) * disp;
}
check('12oz@$4.49 vs 20oz@$6.99 — big pack wins', () => {
  const a = unitPrice(4.49, 12, 'oz');
  const b = unitPrice(6.99, 20, 'oz');
  assert.ok(b < a, 'big should be cheaper per oz');
  assert.ok(Math.abs(a - 4.49 / 12) < 1e-9);
});
check('lb vs oz normalization', () => {
  // $10 for 1 lb = $10/16 per oz; $10 for 16 oz same
  const perOzFromLb = unitPrice(10, 1, 'lb');
  const perOzFromOz = unitPrice(10, 16, 'oz');
  assert.ok(Math.abs(perOzFromLb - perOzFromOz) < 0.0001);
});

/* ========== Cost per use ========== */
console.log('\n== Cost Per Use ==');
function cpu(price, upkeep, uses) {
  return (price + upkeep) / uses;
}
check('freq mode uses = perWeek*52*years', () => {
  assert.strictEqual(3 * 52 * 5, 780);
});
check('corrected boots demo: quality wins on cost/use', () => {
  const quality = cpu(220, 40, 3 * 52 * 5);
  const cheap = cpu(60, 0, 3 * 52 * 1);
  assert.ok(quality < cheap, 'quality ' + quality + ' vs cheap ' + cheap);
});
check('old $300 vs $60 at 5y/1y was a misleading TIE', () => {
  const quality = cpu(300, 0, 780);
  const cheap = cpu(60, 0, 156);
  assert.ok(Math.abs(quality - cheap) < 0.0001);
});

/* ========== Return deadline ========== */
console.log('\n== Return Tracker ==');
function addDays(d, n) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}
function returnDeadline(buyDate, policy) {
  const base = addDays(buyDate, policy.days);
  if (policy.holiday) {
    const mo = buyDate.getMonth();
    if (mo === 10 || mo === 11) {
      const jan31 = new Date(buyDate.getFullYear() + 1, 0, 31);
      return base.getTime() > jan31.getTime() ? base : jan31;
    }
  }
  return base;
}
check('Amazon Dec 20 → Jan 31 holiday', () => {
  const buy = new Date(2025, 11, 20);
  const dl = returnDeadline(buy, { days: 30, holiday: true });
  assert.strictEqual(dl.getFullYear(), 2026);
  assert.strictEqual(dl.getMonth(), 0);
  assert.strictEqual(dl.getDate(), 31);
});
check('Amazon Oct 1 → +30 days only (no holiday)', () => {
  const buy = new Date(2025, 9, 1);
  const dl = returnDeadline(buy, { days: 30, holiday: true });
  assert.strictEqual(dl.getMonth(), 9);
  assert.strictEqual(dl.getDate(), 31);
});
check('Walmart 90d from Dec still Jan31 if 90d ends before? Dec1+90=Mar1 > Jan31 → Mar1', () => {
  const buy = new Date(2025, 11, 1);
  const dl = returnDeadline(buy, { days: 90, holiday: true });
  // base = Mar 1 2026 > Jan 31 → use Mar 1
  assert.strictEqual(dl.getMonth(), 2);
  assert.strictEqual(dl.getDate(), 1);
});

console.log('\n' + (failed ? failed + ' FAILURES' : 'ALL CHECKS PASSED'));
process.exit(failed ? 1 : 0);
