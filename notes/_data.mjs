/** Lab Notes — independent developer voice, method, limits. Not a blog farm. */
export const NOTES = [
  {
    slug: 'why-client-side-math',
    title: 'Why Herminox runs the math in your browser',
    description:
      'Why Herminox calculators are client-side: privacy as trust, no account wall, and what that choice forces us to leave out.',
    h1: 'Client-side math is a <em>trust</em> decision — not a tech flex',
    lead: 'We could have built a login wall and a database of your margins. We did not. Every calculator here is arithmetic your browser runs locally — because the number you need should not require handing over a spreadsheet of costs.',
    datePublished: '2026-08-16',
    dateModified: '2026-08-16',
    readMin: 6,
    sections: [
      {
        h2: 'What “private” means here',
        html: '<p>Five of six tools never send your inputs anywhere. The Return Dashboard keeps entries in your device’s local storage only. We run aggregate page analytics (GA4 / Cloudflare) on traffic — not on the numbers you type into fee fields. That split is intentional: we need to know if pages load; we do not need your COGS.</p>',
      },
      {
        h2: 'What we give up',
        html: '<p>No cloud sync across devices. No “saved scenarios” account. No API that scrapes your Seller Central. If a feature requires storing your commercial numbers on our servers, it does not ship. That keeps the product free and the trust surface small.</p>',
      },
      {
        h2: 'How this shows up in the UI',
        html: '<p>Open a calculator, type, get a result. No signup modal. Prefill links exist for partners and coaches — those query URLs are for humans and stay <code>noindex</code> so Google does not invent duplicate pages out of tracking parameters.</p>',
      },
    ],
    cta: { label: 'Open the FBA Profit Calculator', url: '/sellers/fba-calculator/' },
  },
  {
    slug: 'how-we-model-fba-fees',
    title: 'How we model Amazon FBA fees — sources and limits',
    description:
      'How Herminox models US Amazon referral and FBA fulfillment fees from published schedules — and what we deliberately omit until we can model it honestly.',
    h1: 'Fee logic from <em>published schedules</em> — with the gaps named',
    lead: 'Herminox is an arithmetic engine, not a scraper. Referral and fulfillment rates are coded from Amazon’s published US documentation. When we cannot model a fee cleanly, we say so instead of inventing a comforting row.',
    datePublished: '2026-08-16',
    dateModified: '2026-08-16',
    readMin: 7,
    sections: [
      {
        h2: 'What is in the model',
        html: '<p>Referral (flat and the seven tiered categories), FBA fulfillment by size/weight band under the 2026 US rate card, and the 3.5% fuel and logistics surcharge on fulfillment (on by default). Tiered categories apply each band to its price slice — a flat “15%” guess is not good enough.</p>',
      },
      {
        h2: 'What is not in the model yet',
        html: '<p>Monthly and long-term storage, inbound placement fees, return processing, and apparel sub-tier variations are named as out of scope until they are complete. Incomplete fee rows would make the output less reliable, not more. For go/no-go sourcing, referral + fulfillment + fuel usually decide viability.</p>',
      },
      {
        h2: 'How you should use the number',
        html: '<p>Treat the calculator as a pre-commitment stress test. Confirm final fees in your own Seller Central preview before you buy inventory. Schedules change — we update when Amazon publishes; you still own the live check.</p>',
      },
    ],
    cta: { label: 'Run FBA fees yourself', url: '/sellers/fba-calculator/' },
  },
  {
    slug: 'inventory-recovery-is-cash-not-profit',
    title: 'Inventory recovery is cash back — not “profit”',
    description:
      'Why Herminox inventory breakeven uses sell price minus fees (cash recovered per unit), not net profit — and how that changes units-to-payback.',
    h1: 'Breakeven inventory: <em>cash recovered</em>, not profit mythology',
    lead: 'Operators often ask “how many units until I am profitable?” The Inventory Breakeven tool answers a tighter question first: how many units until the purchase order’s cash is back. That is sell − fees per unit into a fixed PO cost — not contribution after every dream expense.',
    datePublished: '2026-08-16',
    dateModified: '2026-08-16',
    readMin: 5,
    sections: [
      {
        h2: 'Why we chose cash-back',
        html: '<p>Profit includes choices about ads, returns, and overhead that belong in other tools. Mixing them into “units to breakeven” hides which lever is broken. Cash per unit after Amazon fees answers: when does this inventory stop being frozen money?</p>',
      },
      {
        h2: 'What to run next',
        html: '<p>After payback units look sane, stress margin in the FBA calculator and set an ad ceiling with ACoS breakeven. Sequence matters: cash recovery → margin → ads — not one blended fantasy percentage.</p>',
      },
      {
        h2: 'Audit trail',
        html: '<p>We keep a local calculator audit script so wording and math stay aligned when fees change. If the UI ever said “profit” where it meant cash-back, that was a bug — the recovery definition is deliberate.</p>',
      },
    ],
    cta: { label: 'Open Inventory Breakeven', url: '/sellers/inventory-breakeven/' },
  },
  {
    slug: 'indexing-discipline-quality-over-volume',
    title: 'Indexing discipline: quality over volume',
    description:
      'How Herminox decides what enters Google: unique logic per URL, allowlist, pillar linking, and why we refuse thin PSEO page farms.',
    h1: 'Better <em>zero</em> pages than a hundred weak ones',
    lead: 'Long-tail demand is real. Spun guides are not. We keep a demand matrix offline, an allowlist for what may enter the sitemap, and a uniqueness audit that fails duplicate formulas and near-identical examples.',
    datePublished: '2026-08-16',
    dateModified: '2026-08-16',
    readMin: 6,
    sections: [
      {
        h2: 'The rule',
        html: '<p>One clean URL = one unique job: distinct formula, table, and worked example, plus one primary CTA into a calculator. Different title with the same math is thin — it does not ship. Prefill and tracking query strings never become indexable “pages.”</p>',
      },
      {
        h2: 'Architecture',
        html: '<p>Pillars (<code>/guides/{vertical}/</code>) collect traffic pages upward into tools. Lab Notes carry method and limits. Homepage stays product-first. We do not open a blog farm to chase keywords.</p>',
      },
      {
        h2: 'Pilot before scale',
        html: '<p>Sitemap discovery is primary. We index a controlled layer, watch Search Console, then promote matrix candidates only when the logic is unique. If a page is weak, we strengthen or delete — we do not multiply it.</p>',
      },
    ],
    cta: { label: 'Browse operator guides', url: '/guides/' },
  },
];
