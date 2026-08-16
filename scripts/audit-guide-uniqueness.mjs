/**
 * Fail on thin / near-duplicate guides.
 * Run: node scripts/audit-guide-uniqueness.mjs
 */
import { GUIDES, TOOLS } from '../guides/_data.mjs';
import { GUIDE_ALLOWLIST, PILOT_CAP } from '../pseo/allowlist.mjs';
import { MATRIX } from '../pseo/matrix.mjs';

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function firstWords(s, n = 24) {
  return norm(s).split(' ').slice(0, n).join(' ');
}

const errors = [];
const warnings = [];

if (GUIDE_ALLOWLIST.length > PILOT_CAP.guides) {
  errors.push(`Allowlist length ${GUIDE_ALLOWLIST.length} exceeds pilot cap ${PILOT_CAP.guides}`);
}

const bySlug = Object.fromEntries(GUIDES.map((g) => [g.slug, g]));
for (const slug of GUIDE_ALLOWLIST) {
  if (!bySlug[slug]) errors.push(`Allowlisted missing from GUIDES: ${slug}`);
}

const keySeen = new Map();
const formulaSeen = new Map();
const titleSeen = new Map();
const querySeen = new Map();
const exampleSeen = new Map();

for (const g of GUIDES) {
  if (!g.formula) errors.push(`${g.slug}: missing formula`);
  if (!g.table?.headers?.length || !g.table?.rows?.length) errors.push(`${g.slug}: missing table`);
  if (!g.example?.body) errors.push(`${g.slug}: missing example`);
  if (!TOOLS[g.primary]) errors.push(`${g.slug}: invalid primary tool ${g.primary}`);
  if (!g.uniquenessKey) errors.push(`${g.slug}: missing uniquenessKey`);

  if (g.indexable && !GUIDE_ALLOWLIST.includes(g.slug)) {
    errors.push(`${g.slug}: indexable=true but not on allowlist`);
  }
  if (GUIDE_ALLOWLIST.includes(g.slug) && g.indexable === false) {
    errors.push(`${g.slug}: on allowlist but indexable=false`);
  }

  const uk = norm(g.uniquenessKey);
  if (keySeen.has(uk)) errors.push(`Duplicate uniquenessKey: ${g.slug} ↔ ${keySeen.get(uk)}`);
  else keySeen.set(uk, g.slug);

  const f = norm(g.formula);
  if (formulaSeen.has(f)) errors.push(`Duplicate formula: ${g.slug} ↔ ${formulaSeen.get(f)}`);
  else formulaSeen.set(f, g.slug);

  const t = norm(g.title);
  if (titleSeen.has(t)) errors.push(`Duplicate title: ${g.slug} ↔ ${titleSeen.get(t)}`);
  else titleSeen.set(t, g.slug);

  const q = norm(g.query);
  if (querySeen.has(q)) warnings.push(`Same query focus: ${g.slug} ↔ ${querySeen.get(q)}`);
  else querySeen.set(q, g.slug);

  const ex = firstWords(g.example?.body);
  if (exampleSeen.has(ex)) errors.push(`Near-dup example body: ${g.slug} ↔ ${exampleSeen.get(ex)}`);
  else exampleSeen.set(ex, g.slug);
}

const matrixKeys = new Map();
for (const s of MATRIX) {
  const k = norm(s.uniquenessKey);
  if (matrixKeys.has(k) && s.status === 'indexable' && matrixKeys.get(k).status === 'indexable') {
    errors.push(`Matrix duplicate uniquenessKey (indexable): ${s.id} ↔ ${matrixKeys.get(k).id}`);
  }
  matrixKeys.set(k, s);
}

const indexableMatrix = MATRIX.filter((s) => s.status === 'indexable' && s.guideSlug);
for (const s of indexableMatrix) {
  if (!GUIDE_ALLOWLIST.includes(s.guideSlug)) {
    warnings.push(`Matrix indexable ${s.id} guide not allowlisted: ${s.guideSlug}`);
  }
}

console.log(`Guides: ${GUIDES.length} | Allowlist: ${GUIDE_ALLOWLIST.length} | Matrix slots: ${MATRIX.length}`);
if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach((w) => console.log('  ⚠', w));
}
if (errors.length) {
  console.error('FAIL:');
  errors.forEach((e) => console.error('  ✗', e));
  process.exit(1);
}
console.log('OK — uniqueness audit passed');
