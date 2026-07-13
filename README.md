# Herminox.com — free, private Amazon calculators

Static, **client-side** calculators for Amazon sellers and buyers. No backend, no
accounts — calculator inputs stay in the browser and are never uploaded. Aggregate
page-traffic analytics (Google Analytics + Cloudflare Web Analytics) may run; they
do not receive calculator field values. See `/privacy/`.

## Structure

```
index.html              Home page (hero, featured carousel, tool showcase, FAQ)
style.css               Single shared stylesheet (design tokens in :root)
404.html                Branded not-found page
robots.txt / sitemap.xml  Crawl + indexing
_headers                Security & cache headers (Netlify / Cloudflare Pages)
_redirects              Favicon + GSC verification rewrite
.well-known/security.txt  Responsible-disclosure contact

sellers/
  fba-calculator/        FBA profit, fees, margin, ROI
  acos-breakeven/        Breakeven ACoS for PPC
  inventory-breakeven/   Inventory breakeven
buyers/
  unit-price/            True price per unit
  cost-per-use/          Cost per use
  return-tracker/        Return deadlines & locked capital
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

See [`_headers`](./_headers) for the deployed CSP and related policies. Allowed
third-party origins: Google Fonts, Google Analytics (`gtag.js`), and Cloudflare
Web Analytics (`static.cloudflareinsights.com`). Calculator inputs are not sent
to those services.
