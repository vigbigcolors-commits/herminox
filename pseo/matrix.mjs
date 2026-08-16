/**
 * PSEO demand matrix — tool × decision × metric.
 * Large candidate DB is fine offline; only allowlist/indexable enter the index.
 * uniquenessKey must be distinct logic (formula/metric), not a rewritten title.
 */
export const TOOLS = ['fba', 'acos', 'inv', 'unit', 'cpu', 'ret'];
export const DECISIONS = ['source', 'price', 'bid', 'restock', 'buy', 'return'];
export const METRICS = [
  'margin',
  'referral',
  'fuel',
  'be_acos',
  'units_be',
  'payback',
  'per_unit',
  'per_use',
  'window',
  'locked_capital',
  'landed_cost',
  'packaged_weight',
  'tacos',
  'moq',
  'final_sale',
];

/**
 * @typedef {'candidate' | 'draft' | 'indexable' | 'parked'} SlotStatus
 * @typedef {{
 *   id: string,
 *   tool: string,
 *   decision: string,
 *   metric: string,
 *   uniquenessKey: string,
 *   status: SlotStatus,
 *   guideSlug?: string,
 *   note?: string,
 * }} MatrixSlot
 */

/** @type {MatrixSlot[]} */
export const MATRIX = [
  // ——— indexable (mapped to live guides) ———
  { id: 'fba-source-margin', tool: 'fba', decision: 'source', metric: 'margin', uniquenessKey: 'net=sell-cost-referral-fba-fuel', status: 'indexable', guideSlug: 'amazon-fba-fees-2026' },
  { id: 'fba-source-referral', tool: 'fba', decision: 'source', metric: 'referral', uniquenessKey: 'referral=max(min,category_schedule)', status: 'indexable', guideSlug: 'amazon-referral-fee-by-category' },
  { id: 'fba-source-fuel', tool: 'fba', decision: 'source', metric: 'fuel', uniquenessKey: 'fuel=fulfillment*0.035', status: 'indexable', guideSlug: 'fba-fuel-surcharge-explained' },
  { id: 'fba-price-margin', tool: 'fba', decision: 'price', metric: 'margin', uniquenessKey: 'margin_bands_pre_ad', status: 'indexable', guideSlug: 'amazon-fba-profit-margin-benchmarks' },
  { id: 'fba-source-referral-tier', tool: 'fba', decision: 'source', metric: 'referral', uniquenessKey: 'tiered_bands_apparel_jewelry', status: 'indexable', guideSlug: 'tiered-referral-fees-apparel-jewelry' },
  { id: 'fba-source-landed', tool: 'fba', decision: 'source', metric: 'landed_cost', uniquenessKey: 'landed=factory+freight+duties+prep', status: 'indexable', guideSlug: 'fba-landed-cost-vs-factory-price' },
  { id: 'fba-source-weight', tool: 'fba', decision: 'source', metric: 'packaged_weight', uniquenessKey: 'fba_fee_uses_packaged_not_product_wt', status: 'indexable', guideSlug: 'amazon-fba-packaged-weight-vs-product-weight' },

  { id: 'acos-bid-be', tool: 'acos', decision: 'bid', metric: 'be_acos', uniquenessKey: 'be_acos=pre_ad_margin/sell', status: 'indexable', guideSlug: 'amazon-acos-breakeven-formula' },
  { id: 'acos-bid-tacos', tool: 'acos', decision: 'bid', metric: 'tacos', uniquenessKey: 'acos_vs_tacos_scope', status: 'indexable', guideSlug: 'acos-vs-tacos-explained' },
  { id: 'acos-bid-cpc', tool: 'acos', decision: 'bid', metric: 'be_acos', uniquenessKey: 'max_cpc=be_acos*cvr*aov', status: 'indexable', guideSlug: 'amazon-max-cpc-from-margin' },
  { id: 'acos-bid-launch', tool: 'acos', decision: 'bid', metric: 'be_acos', uniquenessKey: 'launch_vs_profit_acos_phases', status: 'indexable', guideSlug: 'launch-vs-profit-acos-strategy' },
  { id: 'acos-bid-tacos-from-be', tool: 'acos', decision: 'bid', metric: 'tacos', uniquenessKey: 'set_tacos_ceiling_from_be_acos', status: 'indexable', guideSlug: 'set-tacos-from-breakeven-acos' },

  { id: 'inv-restock-units', tool: 'inv', decision: 'restock', metric: 'units_be', uniquenessKey: 'units_be=po_cost/cash_per_unit', status: 'indexable', guideSlug: 'inventory-breakeven-units-amazon' },
  { id: 'inv-restock-payback', tool: 'inv', decision: 'restock', metric: 'payback', uniquenessKey: 'payback_days=units_be/velocity', status: 'indexable', guideSlug: 'amazon-inventory-payback-period' },
  { id: 'inv-source-capital', tool: 'inv', decision: 'source', metric: 'payback', uniquenessKey: 'capital_tied=units*landed', status: 'indexable', guideSlug: 'fba-capital-tied-up-explained' },
  { id: 'inv-restock-moq', tool: 'inv', decision: 'restock', metric: 'moq', uniquenessKey: 'moq_vs_units_to_breakeven', status: 'indexable', guideSlug: 'amazon-moq-vs-inventory-breakeven' },

  { id: 'unit-buy-per', tool: 'unit', decision: 'buy', metric: 'per_unit', uniquenessKey: 'price_per_unit=price/qty', status: 'indexable', guideSlug: 'amazon-unit-price-comparison-guide' },
  { id: 'unit-buy-shrink', tool: 'unit', decision: 'buy', metric: 'per_unit', uniquenessKey: 'shrinkflation_same_price_less_qty', status: 'indexable', guideSlug: 'shrinkflation-unit-price-math' },
  { id: 'unit-buy-multi', tool: 'unit', decision: 'buy', metric: 'per_unit', uniquenessKey: 'multipack_vs_single_per_unit', status: 'indexable', guideSlug: 'multipack-vs-single-unit-price' },

  { id: 'cpu-buy-per', tool: 'cpu', decision: 'buy', metric: 'per_use', uniquenessKey: 'cpu=(price+upkeep)/uses', status: 'indexable', guideSlug: 'cost-per-use-vs-sticker-price' },
  { id: 'cpu-buy-durability', tool: 'cpu', decision: 'buy', metric: 'per_use', uniquenessKey: 'expensive_beats_cheap_via_uses', status: 'indexable', guideSlug: 'when-expensive-beats-cheap' },

  { id: 'ret-return-window', tool: 'ret', decision: 'return', metric: 'window', uniquenessKey: 'holiday_window_to_jan31', status: 'indexable', guideSlug: 'amazon-holiday-return-deadline' },
  { id: 'ret-return-locked', tool: 'ret', decision: 'return', metric: 'locked_capital', uniquenessKey: 'locked_capital=sum_returnable', status: 'indexable', guideSlug: 'locked-capital-in-unreturned-items' },
  { id: 'ret-return-mistakes', tool: 'ret', decision: 'return', metric: 'window', uniquenessKey: 'return_window_start_date_mistakes', status: 'indexable', guideSlug: 'amazon-return-window-mistakes' },
  { id: 'ret-return-final', tool: 'ret', decision: 'return', metric: 'final_sale', uniquenessKey: 'final_sale_vs_open_window', status: 'indexable', guideSlug: 'amazon-final-sale-vs-return-window' },

  // ——— candidates (offline; do not index until unique logic + allowlist) ———
  { id: 'fba-source-storage', tool: 'fba', decision: 'source', metric: 'margin', uniquenessKey: 'monthly_storage_fee_per_cuft', status: 'candidate', note: 'Only if we model storage in calculator first' },
  { id: 'fba-source-inbound', tool: 'fba', decision: 'source', metric: 'landed_cost', uniquenessKey: 'inbound_placement_fee_layers', status: 'candidate', note: 'Park until placement fees in product' },
  { id: 'fba-price-break', tool: 'fba', decision: 'price', metric: 'margin', uniquenessKey: 'price_elasticity_vs_fee_tier_jump', status: 'candidate' },
  { id: 'acos-bid-keyword', tool: 'acos', decision: 'bid', metric: 'be_acos', uniquenessKey: 'exact_vs_broad_be_acos_same_margin', status: 'candidate' },
  { id: 'acos-restock-tacos', tool: 'acos', decision: 'restock', metric: 'tacos', uniquenessKey: 'restock_only_if_tacos_under_ceiling', status: 'candidate' },
  { id: 'inv-source-velocity', tool: 'inv', decision: 'source', metric: 'payback', uniquenessKey: 'velocity_scenarios_pessimistic_base', status: 'candidate' },
  { id: 'inv-restock-aged', tool: 'inv', decision: 'restock', metric: 'payback', uniquenessKey: 'aged_inventory_surcharge_vs_payback', status: 'candidate' },
  { id: 'unit-buy-subscribe', tool: 'unit', decision: 'buy', metric: 'per_unit', uniquenessKey: 'sns_discount_vs_unit_price', status: 'candidate' },
  { id: 'cpu-buy-repair', tool: 'cpu', decision: 'buy', metric: 'per_use', uniquenessKey: 'repair_cost_extends_use_count', status: 'candidate' },
  { id: 'ret-buy-policy', tool: 'ret', decision: 'buy', metric: 'window', uniquenessKey: 'retailer_policy_matrix_pre_purchase', status: 'candidate' },
  { id: 'ret-return-partial', tool: 'ret', decision: 'return', metric: 'locked_capital', uniquenessKey: 'partial_refund_vs_full_window', status: 'candidate' },
];

export function slotsByStatus(status) {
  return MATRIX.filter((s) => s.status === status);
}

export function uniquenessKeys() {
  return MATRIX.map((s) => s.uniquenessKey);
}
