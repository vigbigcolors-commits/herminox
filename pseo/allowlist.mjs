/**
 * Indexable allowlist — only these guide/note slugs enter sitemaps.
 * Cap keeps the GSC pilot controlled. Promote from matrix candidates only
 * after uniqueness audit + real substance.
 */
export const PILOT_CAP = {
  guides: 50,
  notes: 20,
  /** Soft daily promote ceiling after green pilot (not automated). */
  dailyPromote: 5,
};

/** Live guide slugs currently allowed in sitemap-guides.xml */
export const GUIDE_ALLOWLIST = [
  'amazon-fba-fees-2026',
  'amazon-referral-fee-by-category',
  'fba-fuel-surcharge-explained',
  'amazon-fba-profit-margin-benchmarks',
  'tiered-referral-fees-apparel-jewelry',
  'amazon-acos-breakeven-formula',
  'acos-vs-tacos-explained',
  'amazon-max-cpc-from-margin',
  'launch-vs-profit-acos-strategy',
  'inventory-breakeven-units-amazon',
  'amazon-inventory-payback-period',
  'fba-capital-tied-up-explained',
  'amazon-unit-price-comparison-guide',
  'shrinkflation-unit-price-math',
  'multipack-vs-single-unit-price',
  'cost-per-use-vs-sticker-price',
  'when-expensive-beats-cheap',
  'amazon-holiday-return-deadline',
  'locked-capital-in-unreturned-items',
  'amazon-return-window-mistakes',
  'fba-landed-cost-vs-factory-price',
  'amazon-fba-packaged-weight-vs-product-weight',
  'set-tacos-from-breakeven-acos',
  'amazon-moq-vs-inventory-breakeven',
  'amazon-final-sale-vs-return-window',
];

/** Live note slugs allowed in sitemap-notes.xml */
export const NOTE_ALLOWLIST = [
  'why-client-side-math',
  'how-we-model-fba-fees',
  'inventory-recovery-is-cash-not-profit',
  'indexing-discipline-quality-over-volume',
];

export function isGuideAllowlisted(slug) {
  return GUIDE_ALLOWLIST.includes(slug);
}

export function isNoteAllowlisted(slug) {
  return NOTE_ALLOWLIST.includes(slug);
}
