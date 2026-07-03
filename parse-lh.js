const fs = require('fs');
const html = fs.readFileSync('herminox.com_2026-07-03_11-02-05.report.html', 'utf8');
const start = html.indexOf('window.__LIGHTHOUSE_JSON__ = ') + 'window.__LIGHTHOUSE_JSON__ = '.length;
const end = html.indexOf(';</script>', start);
const j = JSON.parse(html.slice(start, end));
for (const cat of ['performance', 'accessibility']) {
  console.log('\n' + cat.toUpperCase(), Math.round(j.categories[cat].score * 100));
  for (const ref of j.categories[cat].auditRefs) {
    const a = j.audits[ref.id];
    if (!a || a.score === null || a.score === 1) continue;
    if (a.score < 1 || ref.weight > 0) {
      console.log(' ', ref.id, 'score:', a.score, a.displayValue || '', '-', a.title);
    }
  }
}
console.log('\nFAILING A11Y AUDITS:');
for (const [id, a] of Object.entries(j.audits)) {
  if (a.score === 0 && /contrast|heading|aria|target|label|name|link|list|table|document-title|html-has-lang/i.test(id)) {
    console.log(id, '-', a.title);
    if (a.details && a.details.items) a.details.items.slice(0, 3).forEach(i => console.log('  ', JSON.stringify(i).slice(0, 200)));
  }
}
