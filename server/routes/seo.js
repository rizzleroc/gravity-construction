const path = require('path');
const fs = require('fs');
const express = require('express');
const db = require('../db');

const router = express.Router();

const BASE_URL = (process.env.BASE_URL || 'https://gravityconstructionsc.com').replace(/\/$/, '');
const CONTENT_DIR = path.join(__dirname, '..', 'content');

function loadJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, name), 'utf8'));
  } catch (_err) { return []; }
}

const publishedProjectsStmt = db.prepare(`
  SELECT slug, COALESCE(updated_at, created_at) AS lastmod
  FROM projects
  WHERE published = 1
  ORDER BY datetime(COALESCE(updated_at, created_at)) DESC
`);
const publishedPostsStmt = db.prepare(`
  SELECT slug, COALESCE(updated_at, published_at, created_at) AS lastmod
  FROM posts
  WHERE published = 1
  ORDER BY datetime(COALESCE(updated_at, published_at, created_at)) DESC
`);

function toIso(date) {
  if (!date) return new Date().toISOString();
  const d = new Date(date.indexOf('T') > -1 ? date : date.replace(' ', 'T') + 'Z');
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function xmlEscape(s) {
  return String(s).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));
}

router.get('/sitemap.xml', (req, res) => {
  const urls = [];
  const now = new Date().toISOString();

  // Homepage
  urls.push({ loc: BASE_URL + '/',          lastmod: now, changefreq: 'weekly',  priority: '1.0' });

  // Top-level index pages
  urls.push({ loc: BASE_URL + '/services', lastmod: now, changefreq: 'monthly', priority: '0.9' });
  urls.push({ loc: BASE_URL + '/areas',    lastmod: now, changefreq: 'monthly', priority: '0.9' });
  urls.push({ loc: BASE_URL + '/blog',     lastmod: now, changefreq: 'weekly',  priority: '0.8' });

  // Individual service pages
  const services = loadJson('services.json');
  services.forEach(s => {
    urls.push({
      loc: `${BASE_URL}/services/${s.slug}`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.9',
    });
  });

  // Individual service-area pages
  const areas = loadJson('areas.json');
  areas.forEach(a => {
    urls.push({
      loc: `${BASE_URL}/areas/${a.slug}`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.85',
    });
  });

  try {
    publishedProjectsStmt.all().forEach(row => {
      urls.push({
        loc: `${BASE_URL}/projects/${row.slug}`,
        lastmod: toIso(row.lastmod),
        changefreq: 'monthly',
        priority: '0.8',
      });
    });
    publishedPostsStmt.all().forEach(row => {
      urls.push({
        loc: `${BASE_URL}/blog/${row.slug}`,
        lastmod: toIso(row.lastmod),
        changefreq: 'monthly',
        priority: '0.7',
      });
    });
  } catch (err) {
    console.warn('[sitemap]', err.message);
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u =>
      '  <url>\n' +
      `    <loc>${xmlEscape(u.loc)}</loc>\n` +
      `    <lastmod>${u.lastmod}</lastmod>\n` +
      `    <changefreq>${u.changefreq}</changefreq>\n` +
      `    <priority>${u.priority}</priority>\n` +
      '  </url>'
    ).join('\n') +
    '\n</urlset>\n';

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(body);
});

router.get('/robots.txt', (req, res) => {
  const body =
    'User-agent: *\n' +
    'Allow: /\n' +
    'Disallow: /admin/\n' +
    'Disallow: /api/\n' +
    '\n' +
    `Sitemap: ${BASE_URL}/sitemap.xml\n`;
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(body);
});

module.exports = router;
