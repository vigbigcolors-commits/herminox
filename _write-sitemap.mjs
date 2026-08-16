/**
 * Writes sitemap index + child sitemaps (core / guides / notes).
 * Only allowlisted guides & notes enter indexable sitemaps.
 * Run: node _write-sitemap.mjs
 */
import fs from 'fs';
import { GUIDES, VERTICALS } from './guides/_data.mjs';
import { NOTES } from './notes/_data.mjs';
import { GUIDE_ALLOWLIST, NOTE_ALLOWLIST } from './pseo/allowlist.mjs';

const LASTMOD = '2026-08-16';

function urlEntry(loc, freq, pri) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`;
}

function writeUrlset(file, entries) {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ];
  fs.writeFileSync(file, parts.join('\n'));
}

const core = [
  urlEntry('https://herminox.com/', 'weekly', '1.0'),
  urlEntry('https://herminox.com/sellers/', 'monthly', '0.8'),
  urlEntry('https://herminox.com/sellers/fba-calculator/', 'monthly', '0.9'),
  urlEntry('https://herminox.com/sellers/acos-breakeven/', 'monthly', '0.9'),
  urlEntry('https://herminox.com/sellers/inventory-breakeven/', 'monthly', '0.9'),
  urlEntry('https://herminox.com/buyers/', 'monthly', '0.8'),
  urlEntry('https://herminox.com/buyers/unit-price/', 'monthly', '0.9'),
  urlEntry('https://herminox.com/buyers/cost-per-use/', 'monthly', '0.9'),
  urlEntry('https://herminox.com/buyers/return-tracker/', 'monthly', '0.9'),
  urlEntry('https://herminox.com/guides/', 'weekly', '0.85'),
  ...Object.values(VERTICALS).map((v) =>
    urlEntry(`https://herminox.com/guides/${v.slug}/`, 'weekly', '0.8')
  ),
  urlEntry('https://herminox.com/notes/', 'weekly', '0.8'),
  urlEntry('https://herminox.com/methodology/', 'monthly', '0.7'),
  urlEntry('https://herminox.com/embed/', 'monthly', '0.7'),
  urlEntry('https://herminox.com/partners/', 'monthly', '0.7'),
  urlEntry('https://herminox.com/about/', 'monthly', '0.65'),
  urlEntry('https://herminox.com/our-goal/', 'monthly', '0.5'),
  urlEntry('https://herminox.com/disclaimer/', 'yearly', '0.4'),
  urlEntry('https://herminox.com/terms/', 'yearly', '0.3'),
  urlEntry('https://herminox.com/privacy/', 'yearly', '0.3'),
];

const guideEntries = GUIDE_ALLOWLIST.filter((slug) => GUIDES.some((g) => g.slug === slug)).map(
  (slug) => urlEntry(`https://herminox.com/guides/${slug}/`, 'monthly', '0.75')
);

const noteEntries = NOTE_ALLOWLIST.filter((slug) => NOTES.some((n) => n.slug === slug)).map(
  (slug) => urlEntry(`https://herminox.com/notes/${slug}/`, 'monthly', '0.7')
);

writeUrlset('sitemap-core.xml', core);
writeUrlset('sitemap-guides.xml', guideEntries);
writeUrlset('sitemap-notes.xml', noteEntries);

const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://herminox.com/sitemap-core.xml</loc>
    <lastmod>${LASTMOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://herminox.com/sitemap-guides.xml</loc>
    <lastmod>${LASTMOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://herminox.com/sitemap-notes.xml</loc>
    <lastmod>${LASTMOD}</lastmod>
  </sitemap>
</sitemapindex>
`;
fs.writeFileSync('sitemap.xml', index);

console.log({
  core: core.length,
  guides: guideEntries.length,
  notes: noteEntries.length,
  total: core.length + guideEntries.length + noteEntries.length,
});
