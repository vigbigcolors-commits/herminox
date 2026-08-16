/**
 * Builds /guides/index.html, /guides/<vertical>/, /guides/<slug>/ from _data.mjs
 * Run: node guides/_build.mjs
 *
 * STRICT UNIQUENESS RULE:
 * - Every guide slug is one indexable URL with unique substance (formula, table, example).
 * - No near-duplicate templates. Prefill/query variants are never guide pages.
 * - Sitemap lists only allowlisted clean trailing-slash URLs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GUIDES, TOOLS, VERTICALS, toolById, verticalForTool } from './_data.mjs';
import { personLd } from '../pseo/author.mjs';

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
    <p class="foot-tag">Free calculators for Amazon sellers and buyers — plus operator guides &amp; lab notes.</p>
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
    <a href="/partners/">Partners</a>
    <a href="/embed/">Embed widgets</a>
    <a href="mailto:hello@herminox.com">hello@herminox.com</a>
    <a href="/about/">About Us</a>
    <a href="/disclaimer/">Disclaimer</a>
    <a href="/privacy/">Privacy Policy</a>
  </div>
</footer>
<div class="foot-copy">&copy; 2026 herminox.com — independent calculators, guides &amp; notes.</div>
<p class="foot-disclaimer">Herminox is an independent tool and is not affiliated with, authorized, endorsed by, or in any way associated with Amazon.com, Inc. or its subsidiaries. Amazon, FBA, ACoS, TACoS and all related marks are trademarks of Amazon.com, Inc. or its affiliates. All calculations are based on publicly available fee schedules and are provided for informational purposes only. &middot; <a href="/disclaimer/">Full Disclaimer</a></p>`;
}

function siblingsFor(guide) {
  return GUIDES.filter((g) => g.slug !== guide.slug && g.primary === guide.primary).slice(0, 4);
}

function renderTable(table) {
  if (!table) return '';
  const head = table.headers.map((h) => `<th>${esc(h)}</th>`).join('');
  const body = table.rows
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<table class="guide-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function neighborLinks(vertical) {
  return (vertical.neighbors || [])
    .map((pathSlug) => {
      const v = Object.values(VERTICALS).find((x) => x.slug === pathSlug);
      if (!v) return '';
      return `<li><a href="/guides/${v.slug}/">${esc(v.name)}</a></li>`;
    })
    .filter(Boolean)
    .join('\n');
}

function renderGuide(guide) {
  const primary = toolById(guide.primary);
  const vertical = verticalForTool(guide.primary);
  const related = guide.related.map(toolById);
  const sibs = siblingsFor(guide);
  const url = `https://herminox.com/guides/${guide.slug}/`;
  const plainH1 = guide.h1.replace(/<\/?em>/g, '');
  const author = personLd();

  const faqLd = guide.faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  }));

  const sectionsHtml = guide.sections
    .map((s) => `<h2 id="${esc(s.h2.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}">${esc(s.h2)}</h2>\n${s.html}`)
    .join('\n');

  const checklist = (guide.checklist || [])
    .map((c) => `<li>${esc(c)}</li>`)
    .join('');

  const faqHtml = guide.faqs
    .map(
      (f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`
    )
    .join('\n');

  const relatedHtml = related
    .map(
      (t) =>
        `<a href="${t.url}"><strong>${esc(t.name)}</strong><span>${esc(t.short)} — secondary check after the primary tool.</span></a>`
    )
    .join('\n');

  const sibHtml = sibs
    .map((g) => `<li><a href="/guides/${g.slug}/">${esc(g.title.split(' — ')[0].split(' | ')[0])}</a></li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
${GTAG}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(guide.title)}</title>
<meta name="description" content="${esc(guide.description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Herminox">
<meta property="og:title" content="${esc(guide.title)}">
<meta property="og:description" content="${esc(guide.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://herminox.com/assets/og-image.jpg">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(guide.title)}">
<meta name="twitter:description" content="${esc(guide.description)}">
<meta name="twitter:image" content="https://herminox.com/assets/og-image.jpg">
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
  description: guide.description,
  datePublished: '2026-07-13',
  dateModified: '2026-08-16',
  mainEntityOfPage: url,
  author,
  publisher: {
    '@type': 'Organization',
    name: 'Herminox',
    url: 'https://herminox.com/',
    logo: 'https://herminox.com/assets/logo.svg',
  },
  about: { '@type': 'Thing', name: guide.query },
  isPartOf: { '@type': 'WebSite', name: 'Herminox', url: 'https://herminox.com/' },
})}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://herminox.com/' },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://herminox.com/guides/' },
    { '@type': 'ListItem', position: 3, name: vertical.name, item: `https://herminox.com/guides/${vertical.slug}/` },
    { '@type': 'ListItem', position: 4, name: plainH1, item: url },
  ],
})}
</script>
<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqLd })}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: plainH1,
  description: guide.description,
  step: (guide.checklist || []).map((c, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    text: c,
  })),
})}
</script>
</head>
<body>
<div data-site-nav></div>
<p class="crumb"><a href="/">Home</a><span class="sep">/</span><a href="/guides/">Guides</a><span class="sep">/</span><a href="/guides/${vertical.slug}/">${esc(vertical.name)}</a><span class="sep">/</span><span class="here">${esc(guide.slug)}</span></p>

<section class="legal-hero">
  <p class="eyebrow"><span class="dot" aria-hidden="true"></span>${esc(guide.audience === 'sellers' ? 'Seller guide' : 'Buyer guide')} · ${esc(guide.readMin)} min</p>
  <h1>${guide.h1}</h1>
  <p class="lead">${esc(guide.lead)}</p>
  <div class="legal-meta">
    <span>Primary tool: ${esc(primary.name)}</span>
    <span>Updated August 2026</span>
    <span>Query focus: ${esc(guide.query)}</span>
  </div>
</section>

<main class="legal-wrap">
  <article class="legal-card legal-body">
    <div class="guide-cta">
      <p><strong>Run this in the ${esc(primary.name)}</strong> — free, no signup. Calculator inputs stay in your browser.</p>
      <a class="guide-cta-btn" href="${primary.url}">Open ${esc(primary.short)} →</a>
    </div>

    <p class="formula">${esc(guide.formula)}</p>
    ${renderTable(guide.table)}

    <h2>Worked example</h2>
    <p><strong>${esc(guide.example.title)}.</strong> ${esc(guide.example.body)}</p>

    ${sectionsHtml}

    <h2>Checklist</h2>
    <ul>${checklist}</ul>

    <div class="guide-cta">
      <p><strong>Primary next step:</strong> ${esc(primary.name)}. Then sanity-check with the related tools below.</p>
      <a class="guide-cta-btn" href="${primary.url}">Open calculator →</a>
    </div>

    <h2>Related calculators</h2>
    <div class="guide-related">
      <a href="${primary.url}"><strong>${esc(primary.name)}</strong><span>Primary — the numbers this guide is built around.</span></a>
      ${relatedHtml}
    </div>

    <h2>FAQ</h2>
    ${faqHtml}

    <div class="guide-cluster">
      <h2>More in this cluster</h2>
      <ul>
        <li><a href="/guides/${vertical.slug}/">${esc(vertical.name)} hub →</a></li>
        ${sibHtml}
        <li><a href="/guides/">All Herminox guides →</a></li>
        <li><a href="/notes/">Lab Notes (method &amp; limits) →</a></li>
      </ul>
    </div>

    <p style="margin-top:28px;font-size:13px;color:var(--ink2)">Educational only — not tax, legal, or investment advice. Confirm live Amazon fees and return policies for your account and order. <a href="/methodology/">Methodology</a> · <a href="/disclaimer/">Disclaimer</a> · <a href="/privacy/">Privacy</a></p>
  </article>
</main>

${footer()}
<script src="/assets/site-nav.js"></script>
<script defer src="/assets/back-to-top.js"></script>
</body>
</html>`;
}

function renderVertical(vertical) {
  const tool = TOOLS[vertical.id];
  const guides = GUIDES.filter((g) => g.primary === vertical.id);
  const url = `https://herminox.com/guides/${vertical.slug}/`;
  const plainH1 = vertical.h1.replace(/<\/?em>/g, '');
  const cards = guides
    .map(
      (g) => `<a class="guides-card" href="/guides/${g.slug}/">
      <div class="g-meta">${esc(g.audience)} <span class="dot">·</span> ${esc(g.readMin)} min</div>
      <h2>${esc(g.title.split(' — ')[0])}</h2>
      <p>${esc(g.description)}</p>
      <span class="g-tool">→ ${esc(tool.name)}</span>
    </a>`
    )
    .join('\n');
  const neigh = neighborLinks(vertical);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
${GTAG}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(vertical.title)}</title>
<meta name="description" content="${esc(vertical.description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Herminox">
<meta property="og:title" content="${esc(vertical.title)}">
<meta property="og:description" content="${esc(vertical.description)}">
<meta property="og:url" content="${url}">
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
  name: vertical.name,
  url,
  description: vertical.description,
  isPartOf: { '@type': 'WebSite', name: 'Herminox', url: 'https://herminox.com/' },
})}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://herminox.com/' },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://herminox.com/guides/' },
    { '@type': 'ListItem', position: 3, name: plainH1, item: url },
  ],
})}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: vertical.name,
  numberOfItems: guides.length,
  itemListElement: guides.map((g, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://herminox.com/guides/${g.slug}/`,
    name: g.title,
  })),
})}
</script>
</head>
<body>
<div data-site-nav></div>
<p class="crumb"><a href="/">Home</a><span class="sep">/</span><a href="/guides/">Guides</a><span class="sep">/</span><span class="here">${esc(vertical.slug)}</span></p>

<section class="legal-hero">
  <p class="eyebrow"><span class="dot" aria-hidden="true"></span>Pillar · ${esc(guides.length)} guides</p>
  <h1>${vertical.h1}</h1>
  <p class="lead">${esc(vertical.lead)}</p>
  <div class="legal-meta">
    <span>Primary tool: ${esc(tool.name)}</span>
    <span>One job per page</span>
    <span>Updated August 2026</span>
  </div>
</section>

<main class="legal-wrap">
  <article class="legal-card legal-body">
    <div class="guide-cta">
      <p><strong>Start with the calculator</strong> — then read the guide that matches your decision.</p>
      <a class="guide-cta-btn" href="${tool.url}">Open ${esc(tool.name)} →</a>
    </div>
    <div class="guides-grid">${cards}</div>
    <div class="guide-cluster">
      <h2>Related pillars</h2>
      <ul>
        ${neigh}
        <li><a href="/guides/">All guides →</a></li>
        <li><a href="/notes/">Lab Notes →</a></li>
      </ul>
    </div>
  </article>
</main>

${footer()}
<script src="/assets/site-nav.js"></script>
<script defer src="/assets/back-to-top.js"></script>
</body>
</html>`;
}

function renderHub() {
  const byTool = {};
  for (const g of GUIDES) {
    (byTool[g.primary] ||= []).push(g);
  }
  const order = ['fba', 'acos', 'inv', 'unit', 'cpu', 'ret'];
  const pillarCards = order
    .map((id) => {
      const v = VERTICALS[id];
      const t = TOOLS[id];
      const n = (byTool[id] || []).length;
      return `<a class="guides-card" href="/guides/${v.slug}/">
      <div class="g-meta">Pillar <span class="dot">·</span> ${n} guides</div>
      <h2>${esc(v.name)}</h2>
      <p>${esc(v.lead)}</p>
      <span class="g-tool">→ ${esc(t.name)}</span>
    </a>`;
    })
    .join('\n');

  const weight = order
    .map((id) => {
      const t = TOOLS[id];
      const n = (byTool[id] || []).length;
      return `<div><strong>${n}</strong><span>${esc(t.name)} — primary links (weighted by search demand)</span></div>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
${GTAG}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Amazon Seller &amp; Buyer Guides — Herminox</title>
<meta name="description" content="${GUIDES.length} practical Herminox guides for Amazon FBA fees, ACoS, inventory payback, unit price, cost per use, and returns — each linked to a free calculator.">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="https://herminox.com/guides/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Herminox">
<meta property="og:title" content="Amazon Seller &amp; Buyer Guides — Herminox">
<meta property="og:description" content="Operator guides tied to free Herminox calculators — FBA, ACoS, inventory, unit price, cost per use, returns.">
<meta property="og:url" content="https://herminox.com/guides/">
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
  name: 'Herminox Guides',
  url: 'https://herminox.com/guides/',
  description: 'Practical Amazon seller and buyer guides linked to free Herminox calculators.',
  isPartOf: { '@type': 'WebSite', name: 'Herminox', url: 'https://herminox.com/' },
})}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Herminox guide pillars',
  numberOfItems: order.length,
  itemListElement: order.map((id, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://herminox.com/guides/${VERTICALS[id].slug}/`,
    name: VERTICALS[id].name,
  })),
})}
</script>
</head>
<body>
<div data-site-nav></div>
<p class="crumb"><a href="/">Home</a><span class="sep">/</span><span class="here">Guides</span></p>

<section class="legal-hero">
  <p class="eyebrow"><span class="dot" aria-hidden="true"></span>Learn · then calculate</p>
  <h1>Guides that end in a <em>calculator</em> — not a dead-end blog.</h1>
  <p class="lead">${GUIDES.length} operator guides for Amazon sellers and buyers. Each page owns one long-tail question, teaches the math, then sends you to the matching free Herminox tool. Start from a pillar below — not a keyword farm.</p>
  <div class="legal-meta">
    <span>${GUIDES.length} guides</span>
    <span>6 pillars</span>
    <span>6 calculators</span>
    <span>Updated August 2026</span>
  </div>
</section>

<main class="legal-wrap">
  <article class="legal-card legal-body">
    <h2>Pillars → tools</h2>
    <p>Traffic pages climb to a pillar and into one primary calculator. Linking is weighted by demand — FBA and ACoS get more primary links. Method and limits live in <a href="/notes/">Lab Notes</a> and <a href="/methodology/">Methodology</a>.</p>
    <div class="guides-weight">${weight}</div>
    <div class="guides-grid">${pillarCards}</div>
  </article>
</main>

${footer()}
<script src="/assets/site-nav.js"></script>
<script defer src="/assets/back-to-top.js"></script>
</body>
</html>`;
}

// Build
fs.writeFileSync(path.join(ROOT, 'index.html'), renderHub(), 'utf8');
for (const v of Object.values(VERTICALS)) {
  const dir = path.join(ROOT, v.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderVertical(v), 'utf8');
  console.log('OK vertical', v.slug);
}
for (const g of GUIDES) {
  const dir = path.join(ROOT, g.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderGuide(g), 'utf8');
  console.log('OK', g.slug, '→', g.primary);
}
console.log(`Built hub + ${Object.keys(VERTICALS).length} pillars + ${GUIDES.length} guides`);
