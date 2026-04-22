// Seed four EXAMPLE project skeletons into the DB.
//
// These are inserted with published=0 and featured=0 so they do NOT appear on
// the public site. They exist in /admin so Damien has a structural template to
// work from when adding real projects — edit the title/body/photos and flip
// Published=on to go live.
//
// Idempotent: INSERT OR IGNORE on the unique slug.
// Run:  node scripts/seed-example-projects.js

require('dotenv').config();
const db = require('../db');

const projects = [
  {
    slug: 'example-capitola-kitchen-remodel',
    title: 'EXAMPLE: Capitola Kitchen Remodel',
    location: 'Capitola',
    scope: 'Kitchen remodel',
    summary: 'EXAMPLE — replace with a 1–2 sentence teaser describing the transformation. e.g. "Full kitchen remodel in a 1960s Capitola cottage — opened the galley wall, replaced the panel, and installed quartz counters with custom walnut island."',
    body: `<p><strong>Replace this with the project story.</strong> Use 3–6 short paragraphs. Good structure:</p>
<h2>The house</h2>
<p>Describe the home — era, size, character. e.g. "A 1,400 sq ft Capitola Jewel Box cottage that hadn't been touched since 1978."</p>
<h2>What the client wanted</h2>
<p>Describe the problem and the goal. e.g. "They wanted to cook together without bumping elbows, and to open sightlines to the dining room."</p>
<h2>What we did</h2>
<ul>
  <li>Removed the load-bearing wall between kitchen and dining (beam + posts engineered)</li>
  <li>Panel upgrade from 100A to 200A</li>
  <li>Semi-custom painted cabinets with walnut island</li>
  <li>Calacatta-pattern quartz counters</li>
  <li>Induction range, counter-depth fridge, drawer microwave</li>
</ul>
<h2>The result</h2>
<p>Describe the finished space in a sentence or two. Attach a client quote if you have permission to use it.</p>`,
    hero_image: null,
    featured: 0,
    published: 0,
    sort_order: 1,
  },
  {
    slug: 'example-aptos-detached-adu',
    title: 'EXAMPLE: Aptos Detached ADU',
    location: 'Aptos',
    scope: 'ADU',
    summary: 'EXAMPLE — e.g. "1,150 sq ft detached ADU in Rio del Mar — two bedrooms, one bath, vaulted ceilings, and a permitted rental use."',
    body: `<p><strong>Replace this with the project story.</strong></p>
<h2>The property</h2>
<p>Describe the lot — size, slope, setbacks, any challenges.</p>
<h2>The build</h2>
<ul>
  <li>1,150 sq ft detached ADU, 2BR/1BA</li>
  <li>Ministerial review through Santa Cruz County (60-day)</li>
  <li>Matching exterior to the main house (cedar siding, standing-seam metal roof)</li>
  <li>Mini-split HVAC + ERV for fresh-air ventilation</li>
  <li>Heat-pump water heater</li>
</ul>
<h2>Timeline</h2>
<p>Permit-to-move-in was ___ months. Construction phase was ___ weeks.</p>`,
    hero_image: null,
    featured: 0,
    published: 0,
    sort_order: 2,
  },
  {
    slug: 'example-santa-cruz-whole-home-remodel',
    title: 'EXAMPLE: Santa Cruz Whole-Home Remodel',
    location: 'Santa Cruz',
    scope: 'Whole-home remodel',
    summary: 'EXAMPLE — e.g. "Down-to-the-studs remodel of a 1,900 sq ft Westside Craftsman — new electrical, plumbing, HVAC, kitchen, two baths, refinished original hardwood."',
    body: `<p><strong>Replace this with the project story.</strong></p>
<h2>Scope</h2>
<p>Summarize everything done. Whole-home remodels typically include:</p>
<ul>
  <li>Full electrical rewire + panel upgrade</li>
  <li>Full plumbing re-pipe (PEX where accessible)</li>
  <li>Insulation upgrade to current Title 24</li>
  <li>New HVAC (heat pump + mini-splits, usually)</li>
  <li>Kitchen remodel</li>
  <li>All baths remodeled</li>
  <li>Refinished floors + new paint throughout</li>
  <li>New or upgraded windows</li>
</ul>
<h2>Living arrangements</h2>
<p>Did the client stay in the house or relocate? How did that affect schedule?</p>
<h2>Outcome</h2>
<p>1–2 sentences on the finished home and client satisfaction.</p>`,
    hero_image: null,
    featured: 0,
    published: 0,
    sort_order: 3,
  },
  {
    slug: 'example-soquel-primary-bath-remodel',
    title: 'EXAMPLE: Soquel Primary Bath Remodel',
    location: 'Soquel',
    scope: 'Bath remodel',
    summary: 'EXAMPLE — e.g. "Primary bath remodel in a 1990s Soquel home — walk-in shower, freestanding tub, heated floors, and proper ventilation."',
    body: `<p><strong>Replace this with the project story.</strong></p>
<h2>The space</h2>
<p>Describe the original bath — layout problems, dated finishes, moisture issues.</p>
<h2>The remodel</h2>
<ul>
  <li>Removed the built-in drop-in tub + 32×32 shower</li>
  <li>Installed a 60-inch freestanding soaking tub</li>
  <li>Curbless walk-in shower with linear drain</li>
  <li>Proper Kerdi waterproofing throughout the wet zone</li>
  <li>Heated floors (electric radiant mat)</li>
  <li>Dual-sink floating vanity, quartz top</li>
  <li>Panasonic WhisperGreen fan on humidistat</li>
</ul>
<h2>What we learned opening the wall</h2>
<p>Describe any surprises — the story behind the project is often what makes it memorable.</p>`,
    hero_image: null,
    featured: 0,
    published: 0,
    sort_order: 4,
  },
];

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO projects (title, slug, location, scope, summary, body, hero_image, featured, published, sort_order)
  VALUES (@title, @slug, @location, @scope, @summary, @body, @hero_image, @featured, @published, @sort_order)
`);

let inserted = 0;
let skipped = 0;
for (const p of projects) {
  const info = insertStmt.run(p);
  if (info.changes === 1) {
    inserted++;
    console.log('  + inserted:', p.slug);
  } else {
    skipped++;
    console.log('  = skipped (already exists):', p.slug);
  }
}
console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
console.log('These are drafts (published=0). View them in /admin → Projects.');
console.log('Replace placeholder text, upload hero photos, flip Published on.');
