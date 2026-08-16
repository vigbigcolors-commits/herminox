# Herminox.com — free, private Amazon calculators

Static, **client-side** calculators for Amazon sellers and buyers. No backend, no
accounts — calculator inputs stay in the browser and are never uploaded. Aggregate
page-traffic analytics (Google Analytics + Cloudflare Web Analytics) may run; they
do not receive calculator field values. See `/privacy/`.

## Structure

```
index.html              Home (tools-first)
sellers/ buyers/        Product calculators + hubs
guides/                 Operator Docs (formula + table + example → CTA)
notes/                  Lab Notes (founder E-E-A-T)
methodology/            Fee sources + named limits
pseo/                   author, matrix, allowlist
sitemap.xml             Sitemap index → core + guides + notes
```

## PSEO / uniqueness

- **One clean URL = one unique page** (distinct formula, table, example).
- Prefill/query URLs: humans only — middleware `noindex` / tracking 301.
- Matrix candidates may exist offline; **allowlist** controls what enters sitemaps.
- Law: `.cursor/rules/herminox-pseo-law.mdc`

```bash
node scripts/audit-guide-uniqueness.mjs
node scripts/audit-calculators.mjs
node guides/_build.mjs
node notes/_build.mjs
node _write-sitemap.mjs
```

## Local preview

```bash
npx serve .
```

## Conventions

- Legal/guides share `/legal/style.css` + `/guides/style.css`.
- Vanilla JS — no frameworks required for the public site.
- Images: `.webp`, explicit width/height, `loading="lazy"` below the fold.
- Respect `prefers-reduced-motion`.

## Security

See `/.well-known/security.txt` and `/privacy/`. No Seller Central phishing, no scraping bots, no thin 10k PSEO.
