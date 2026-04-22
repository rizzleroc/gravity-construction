#!/usr/bin/env node
// Manually trigger the post-publishing pass. Useful for testing or when you
// want to preview scheduled posts immediately without waiting for a date.
//
// Usage:
//   node scripts/publish-scheduled.js             # publish any posts whose date has arrived
//   node scripts/publish-scheduled.js --force     # publish ALL scheduled posts immediately
//                                                   (flips published=1 regardless of published_at)
//   node scripts/publish-scheduled.js --list      # just show what WOULD publish, no changes

require('dotenv').config();
const db = require('../db');

const arg = process.argv[2] || '';

if (arg === '--list') {
  const rows = db.prepare(`
    SELECT id, slug, title, published, published_at
    FROM posts
    WHERE published = 0 AND published_at IS NOT NULL
    ORDER BY datetime(published_at) ASC
  `).all();
  if (!rows.length) {
    console.log('No scheduled posts waiting to publish.');
    process.exit(0);
  }
  console.log(`${rows.length} scheduled post(s):`);
  for (const r of rows) {
    const due = new Date(r.published_at + 'Z');
    const now = Date.now();
    const overdue = due.getTime() <= now;
    console.log(`  ${overdue ? 'DUE' : '   '}  ${r.published_at}  ${r.slug}`);
  }
  process.exit(0);
}

if (arg === '--force') {
  const info = db.prepare(`
    UPDATE posts SET published = 1
    WHERE published = 0
  `).run();
  console.log(`Force-published ${info.changes} post(s).`);
  process.exit(0);
}

// Default: respect published_at dates.
const info = db.prepare(`
  UPDATE posts SET published = 1
  WHERE published = 0
    AND published_at IS NOT NULL
    AND datetime(published_at) <= datetime('now')
`).run();
console.log(`Published ${info.changes} post(s) whose release date has arrived.`);
