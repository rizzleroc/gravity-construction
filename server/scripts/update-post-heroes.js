// One-time: attach the blog hero SVGs created in /images/blog/ to the seeded posts.
// Idempotent — only updates the hero_image column; safe to run multiple times.

require('dotenv').config();
const db = require('../db');

const mapping = [
  ['how-much-does-kitchen-remodel-cost-santa-cruz-2026', '/images/blog/kitchen-cost.svg'],
  ['adu-santa-cruz-county-2026-rules-cost-timeline',    '/images/blog/adu-rules.svg'],
  ['santa-cruz-permit-timeline-what-to-expect',         '/images/blog/permit-timeline.svg'],
  ['coastal-moisture-what-it-does-to-santa-cruz-homes', '/images/blog/coastal-moisture.svg'],
  ['choosing-right-contractor-santa-cruz-8-questions',  '/images/blog/contractor-questions.svg'],
  ['whole-home-remodel-vs-moving-santa-cruz-math',      '/images/blog/remodel-vs-move.svg'],
];

const stmt = db.prepare('UPDATE posts SET hero_image = ? WHERE slug = ?');
let updated = 0;
for (const [slug, hero] of mapping) {
  const info = stmt.run(hero, slug);
  if (info.changes === 1) {
    updated++;
    console.log('  + updated:', slug, '->', hero);
  } else {
    console.log('  = skipped (no row):', slug);
  }
}
console.log(`\nDone. Updated ${updated} posts.`);
