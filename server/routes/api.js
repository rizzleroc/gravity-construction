const express = require('express');
const db = require('../db');

const router = express.Router();

// ---------- Specials ----------
// Active + within date window (null bounds = unbounded)
const specialsStmt = db.prepare(`
  SELECT id, title, body, cta_label, cta_href, starts_at, ends_at, sort_order
  FROM specials
  WHERE active = 1
    AND (starts_at IS NULL OR datetime(starts_at) <= datetime('now'))
    AND (ends_at   IS NULL OR datetime(ends_at)   >= datetime('now'))
  ORDER BY sort_order ASC, id DESC
`);

router.get('/specials', (req, res) => {
  res.json(specialsStmt.all());
});

// ---------- Events ----------
// Active + upcoming (includes in-progress events whose end is in future, otherwise starts in future)
const eventsStmt = db.prepare(`
  SELECT id, title, location, starts_at, ends_at, url, description
  FROM events
  WHERE active = 1
    AND (
      datetime(starts_at) >= datetime('now')
      OR (ends_at IS NOT NULL AND datetime(ends_at) >= datetime('now'))
    )
  ORDER BY datetime(starts_at) ASC
  LIMIT 12
`);

router.get('/events', (req, res) => {
  res.json(eventsStmt.all());
});

// ---------- Projects ----------
const projectsListStmt = db.prepare(`
  SELECT id, title, slug, location, scope, summary, hero_image, featured, sort_order
  FROM projects
  WHERE published = 1
  ORDER BY featured DESC, sort_order ASC, id DESC
`);
const featuredProjectsStmt = db.prepare(`
  SELECT id, title, slug, location, scope, summary, hero_image, sort_order
  FROM projects
  WHERE published = 1 AND featured = 1
  ORDER BY sort_order ASC, id DESC
  LIMIT 6
`);
const projectBySlugStmt = db.prepare(`
  SELECT * FROM projects WHERE slug = ? AND published = 1
`);
const projectImagesStmt = db.prepare(`
  SELECT path, alt FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC
`);

router.get('/projects', (req, res) => {
  const onlyFeatured = req.query.featured === '1' || req.query.featured === 'true';
  res.json((onlyFeatured ? featuredProjectsStmt : projectsListStmt).all());
});

router.get('/projects/:slug', (req, res) => {
  const row = projectBySlugStmt.get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const images = projectImagesStmt.all(row.id);
  res.json({ ...row, images });
});

// ---------- Testimonials ----------
const testimonialsStmt = db.prepare(`
  SELECT t.id, t.quote, t.author, t.location, t.rating, t.project_id,
         p.slug AS project_slug, p.title AS project_title
  FROM testimonials t
  LEFT JOIN projects p ON p.id = t.project_id AND p.published = 1
  WHERE t.published = 1
  ORDER BY t.sort_order ASC, t.id DESC
`);

router.get('/testimonials', (req, res) => {
  res.json(testimonialsStmt.all());
});

// ---------- Posts ----------
const postsListStmt = db.prepare(`
  SELECT p.id, p.title, p.slug, p.excerpt, p.hero_image, p.published_at,
         u.name AS author_name
  FROM posts p
  LEFT JOIN users u ON u.id = p.author_id
  WHERE p.published = 1
  ORDER BY datetime(p.published_at) DESC, p.id DESC
  LIMIT 24
`);
const postBySlugStmt = db.prepare(`
  SELECT p.*, u.name AS author_name
  FROM posts p
  LEFT JOIN users u ON u.id = p.author_id
  WHERE p.slug = ? AND p.published = 1
`);

router.get('/posts', (req, res) => {
  res.json(postsListStmt.all());
});

router.get('/posts/:slug', (req, res) => {
  const row = postBySlugStmt.get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// ---------- Instagram embeds ----------
const instagramStmt = db.prepare(`
  SELECT id, url, caption
  FROM instagram_posts
  WHERE published = 1
  ORDER BY sort_order ASC, id DESC
`);

router.get('/instagram', (req, res) => {
  res.json(instagramStmt.all());
});

module.exports = router;
