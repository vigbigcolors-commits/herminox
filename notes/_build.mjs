/**
 * Builds /notes/ hub + /notes/<slug>/ from _data.mjs
 * Run: node notes/_build.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NOTES } from './_data.mjs';
import { AUTHOR, personLd } from '../pseo/author.mjs';
import { NOTE_ALLOWLIST } from '../pseo/allowlist.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname);

const GTAG = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WGBRGT796F"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-WGBRGT796F');
</script>`;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function footer() {
  return `<footer class="foot">
  <div class="foot-col">
    <a href="/" class="logo">
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="6" stroke="currentColor" stroke-width="1.6"/><line x1="10" y1="23" x2="10" y2="11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="22" y1="23" x2="22" y2="8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="10" y1="16.5" x2="22" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="22" cy="8" r="2" fill="#E8991F"/></svg>
      <span class="logo-text">Hermi<span class="logo-accent">nox</span></span>
    </a>
    <p class="foot-tag">Free calculators — lab notes from an independent developer, not a content farm.</p>
  </div>
  <div class="foot-col">
    <p class="foot-h">For sellers</p>
    <a href="/sellers/fba-calculator/">FBA Profit Calculator</a>
    <a href="/sellers/acos-breakeven/">ACoS Breakeven</a>
    <a href="/sellers/inventory-breakeven/">Inventory Breakeven</a>
  </div>
  <div class="foot-col">
    <p class="foot-h">For buyers</p>
    <a href="/buyers/unit-price/">Unit Price Comparator</a>
    <a href="/buyers/cost-per-use/">Cost Per Use</a>
    <a href="/buyers/return-tracker/">Return Dashboard</a>
  </div>
  <div class="foot-col">
    <p class="foot-h">Learn</p>
    <a href="/guides/">Guides</a>
    <a href="/notes/">Lab Notes</a>
    <a href="/methodology/">Methodology</a>
    <a href="/about/">About Us</a>
    <a href="/disclaimer/">Disclaimer</a>
    <a href="/privacy/">Privacy Policy</a>
  </div>
</footer>
<div class="foot-copy">&copy; 2026 herminox.com — independent calculators &amp; lab notes.</div>
<p class="foot-disclaimer">Herminox is an independent tool and is not affiliated with, authorized, endorsed by, or in any way associated with Amazon.com, Inc. or its subsidiaries. Educational only. &middot; <a href="/disclaimer/">Full Disclaimer</a></p>`;
}

function renderNote(note) {
  const url = `https://herminox.com/notes/${note.slug}/`;
  const plainH1 = note.h1.replace(/<\/?em>/g, '');
  const author = personLd();
  const sectionsHtml = note.sections
    .map(
      (s) =>
        `<h2 id="${esc(s.h2.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}">${esc(s.h2)}</h2>\n${s.html}`
    )
    .join('\n');
  const others = NOTES.filter((n) => n.slug !== note.slug)
    .map((n) => `<li><a href="/notes/${n.slug}/">${esc(n.title)}</a></li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
${GTAG}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(note.title)} — Herminox Lab Notes</title>
<meta name="description" content="${esc(note.description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Herminox">
<meta property="og:title" content="${esc(note.title)}">
<meta property="og:description" content="${esc(note.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://herminox.com/assets/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=optional" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=optional"></noscript>
<link rel="stylesheet" href="/legal/style.css">
<link rel="stylesheet" href="/guides/style.css">
<link rel="stylesheet" href="/assets/nav-dropdown.css">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: plainH1,
  description: note.description,
  datePublished: note.datePublished,
  dateModified: note.dateModified,
  mainEntityOfPage: url,
  author,
  publisher: {
    '@type': 'Organization',
    name: 'Herminox',
    url: 'https://herminox.com/',
    logo: 'https://herminox.com/assets/logo.svg',
  },
})}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://herminox.com/' },
    { '@type': 'ListItem', position: 2, name: 'Lab Notes', item: 'https://herminox.com/notes/' },
    { '@type': 'ListItem', position: 3, name: plainH1, item: url },
  ],
})}
</script>
</head>
<body>
<div data-site-nav></div>
<p class="crumb"><a href="/">Home</a><span class="sep">/</span><a href="/notes/">Lab Notes</a><span class="sep">/</span><span class="here">${esc(note.slug)}</span></p>

<section class="legal-hero">
  <p class="eyebrow"><span class="dot" aria-hidden="true"></span>Lab Note · ${esc(AUTHOR.name)} · ${esc(note.readMin)} min</p>
  <h1>${note.h1}</h1>
  <p class="lead">${esc(note.lead)}</p>
  <div class="legal-meta">
    <span>${esc(note.dateModified)}</span>
    <span>Method &amp; limits</span>
    <span>Not a blog post</span>
  </div>
</section>

<main class="legal-wrap">
  <article class="legal-card legal-body">
    ${sectionsHtml}
    <div class="guide-cta">
      <p><strong>Next:</strong> put the method to work in a calculator.</p>
      <a class="guide-cta-btn" href="${note.cta.url}">${esc(note.cta.label)} →</a>
    </div>
    <div class="guide-cluster">
      <h2>More notes</h2>
      <ul>
        ${others}
        <li><a href="/methodology/">Methodology →</a></li>
        <li><a href="/guides/">Operator guides →</a></li>
      </ul>
    </div>
    <p style="margin-top:28px;font-size:13px;color:var(--ink2)">Educational only. <a href="/disclaimer/">Disclaimer</a> · <a href="/about/">About</a></p>
  </article>
</main>

${footer()}
<script src="/assets/site-nav.js"></script>
<script defer src="/assets/back-to-top.js"></script>
</body>
</html>`;
}

function renderHub() {
  const cards = NOTES.map(
    (n) => `<a class="guides-card" href="/notes/${n.slug}/">
      <div class="g-meta">${esc(AUTHOR.role)} <span class="dot">·</span> ${esc(n.readMin)} min</div>
      <h2>${esc(n.title)}</h2>
      <p>${esc(n.description)}</p>
      <span class="g-tool">→ Read note</span>
    </a>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
${GTAG}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lab Notes — Herminox</title>
<meta name="description" content="Lab Notes from the independent developer behind Herminox: why calculators are client-side, how FBA fees are modeled, inventory cash-back, and indexing discipline — not a keyword blog.">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="https://herminox.com/notes/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Herminox">
<meta property="og:title" content="Lab Notes — Herminox">
<meta property="og:description" content="Founder notes on method, limits, and product discipline.">
<meta property="og:url" content="https://herminox.com/notes/">
<meta property="og:image" content="https://herminox.com/assets/og-image.jpg">
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=optional" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=optional"></noscript>
<link rel="stylesheet" href="/legal/style.css">
<link rel="stylesheet" href="/guides/style.css">
<link rel="stylesheet" href="/assets/nav-dropdown.css">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Herminox Lab Notes',
  url: 'https://herminox.com/notes/',
  description: 'Lab notes on method, privacy, fee modeling, and indexing discipline — from the independent developer behind Herminox.',
  author: personLd(),
  isPartOf: { '@type': 'WebSite', name: 'Herminox', url: 'https://herminox.com/' },
})}
</script>
</head>
<body>
<div data-site-nav></div>
<p class="crumb"><a href="/">Home</a><span class="sep">/</span><span class="here">Lab Notes</span></p>

<section class="legal-hero">
  <p class="eyebrow"><span class="dot" aria-hidden="true"></span>Lab Notes · ${esc(AUTHOR.name)}</p>
  <h1>Field notes on <em>how</em> the tools are built — not articles for keywords.</h1>
  <p class="lead">Short notes from the independent developer behind Herminox: privacy, fee sources, inventory cash-back, and why we refuse thin PSEO. For long-tail math questions, use <a href="/guides/">Guides</a>. For the product, open a calculator.</p>
  <div class="legal-meta">
    <span>${NOTES.length} notes</span>
    <span>Method &amp; limits</span>
    <span>Updated August 2026</span>
  </div>
</section>

<main class="legal-wrap">
  <article class="legal-card legal-body">
    <div class="guides-grid">${cards}</div>
    <p style="margin-top:24px"><a href="/methodology/">Methodology →</a> · <a href="/about/">About →</a></p>
  </article>
</main>

${footer()}
<script src="/assets/site-nav.js"></script>
<script defer src="/assets/back-to-top.js"></script>
</body>
</html>`;
}

// Validate allowlist
for (const slug of NOTE_ALLOWLIST) {
  if (!NOTES.find((n) => n.slug === slug)) {
    console.error('NOTE_ALLOWLIST missing note:', slug);
    process.exit(1);
  }
}

fs.writeFileSync(path.join(ROOT, 'index.html'), renderHub(), 'utf8');
for (const n of NOTES) {
  const dir = path.join(ROOT, n.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderNote(n), 'utf8');
  console.log('OK', n.slug);
}
console.log(`Built notes hub + ${NOTES.length} notes`);
