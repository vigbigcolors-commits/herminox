# Herminox.com — free, private Amazon calculators

Static, **client-side** calculators for Amazon sellers and buyers. No backend, no
accounts, no tracking — every number is computed in the browser and nothing is
ever uploaded.

## Structure

```
index.html              Home page (hero, featured carousel, tool showcase, FAQ)
style.css               Single shared stylesheet (design tokens in :root)
404.html                Branded not-found page
robots.txt / sitemap.xml  Crawl + indexing
_headers                Security & cache headers (Netlify / Cloudflare Pages)
.well-known/security.txt  Responsible-disclosure contact

sellers/
  fba-calculator/        FBA profit, fees, margin, ROI
  acos-breakeven/        Breakeven ACoS for PPC
  inventory-breakeven/   Inventory breakeven
buyers/
  unit-price/            True price per unit
  cost-per-use/          Cost per use
assets/                  Images (.webp), icons, carousel slides
```

## Local preview

Any static server works, e.g.:

```bash
npx serve .
# or
python -m http.server 8000
```

## Conventions

- One shared `style.css`; colors/spacing live as CSS custom properties in `:root`.
- Vanilla JS only — no frameworks, no build step required.
- Images: `.webp`, always with explicit `width`/`height` and `loading="lazy"`
  (except above-the-fold hero/first slide) to avoid layout shift.
- Respect `prefers-reduced-motion` for all animations.

## Security

See [`_headers`](./_headers) for the deployed CSP and related policies. The site
loads only its own assets plus Google Fonts; no third-party scripts.
