import fs from 'fs';
import { GUIDES } from './guides/_data.mjs';

const staticUrls = [
  ['https://herminox.com/', 'weekly', '1.0'],
  ['https://herminox.com/sellers/', 'monthly', '0.8'],
  ['https://herminox.com/sellers/fba-calculator/', 'monthly', '0.9'],
  ['https://herminox.com/sellers/acos-breakeven/', 'monthly', '0.9'],
  ['https://herminox.com/sellers/inventory-breakeven/', 'monthly', '0.9'],
  ['https://herminox.com/buyers/', 'monthly', '0.8'],
  ['https://herminox.com/buyers/unit-price/', 'monthly', '0.9'],
  ['https://herminox.com/buyers/cost-per-use/', 'monthly', '0.9'],
  ['https://herminox.com/buyers/return-tracker/', 'monthly', '0.9'],
  ['https://herminox.com/guides/', 'weekly', '0.85'],
  ['https://herminox.com/embed/', 'monthly', '0.7'],
];

const tail = [
  ['https://herminox.com/about/', 'monthly', '0.6'],
  ['https://herminox.com/our-goal/', 'monthly', '0.5'],
  ['https://herminox.com/disclaimer/', 'yearly', '0.4'],
  ['https://herminox.com/terms/', 'yearly', '0.3'],
  ['https://herminox.com/privacy/', 'yearly', '0.3'],
];

function entry(loc, freq, pri) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>2026-07-13</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`;
}

const parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const [loc, freq, pri] of staticUrls) parts.push(entry(loc, freq, pri));
for (const g of GUIDES) parts.push(entry(`https://herminox.com/guides/${g.slug}/`, 'monthly', '0.75'));
for (const [loc, freq, pri] of tail) parts.push(entry(loc, freq, pri));
parts.push('</urlset>', '');
fs.writeFileSync('sitemap.xml', parts.join('\n'));
console.log('urls', staticUrls.length + GUIDES.length + tail.length);
