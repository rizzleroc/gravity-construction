const express = require('express');
const db = require('../../db');

const router = express.Router();

const listStmt   = db.prepare(`SELECT * FROM instagram_posts ORDER BY sort_order ASC, id DESC`);
const getStmt    = db.prepare(`SELECT * FROM instagram_posts WHERE id = ?`);
const insertStmt = db.prepare(`
  INSERT INTO instagram_posts (url, caption, sort_order, published)
  VALUES (@url, @caption, @sort_order, @published)
`);
const updateStmt = db.prepare(`
  UPDATE instagram_posts SET
    url = @url, caption = @caption, sort_order = @sort_order, published = @published
  WHERE id = @id
`);
const deleteStmt = db.prepare(`DELETE FROM instagram_posts WHERE id = ?`);

// Accept either a bare post URL or a full pasted <blockquote> embed snippet.
// If they paste the blockquote, pull the permalink out of data-instgrm-permalink.
function extractUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  const m = s.match(/data-instgrm-permalink="([^"]+)"/);
  if (m) return m[1].split('?')[0];
  // Otherwise treat it as a URL; strip tracking params
  try {
    const u = new URL(s);
    if (!/instagram\.com$/.test(u.hostname.replace(/^www\./, ''))) return '';
    return `${u.origin}${u.pathname.replace(/\/$/, '')}/`;
  } catch {
    return '';
  }
}

function normalize(body) {
  return {
    url:        extractUrl(body.url),
    caption:    (body.caption || '').trim() || null,
    sort_order: Number.parseInt(body.sort_order, 10) || 0,
    published:  body.published === 'on' || body.published === '1' || body.published === true ? 1 : 0,
  };
}

router.get('/', (req, res) => {
  const rows = listStmt.all();
  res.render('instagram/list', { title: 'Instagram posts', rows });
});

router.get('/new', (req, res) => {
  res.render('instagram/form', { title: 'Add post', row: null, action: '/admin/instagram' });
});

router.post('/', (req, res) => {
  const data = normalize(req.body);
  if (!data.url) {
    req.session.flash = { type: 'error', message: 'Paste a valid Instagram post URL or embed snippet.' };
    return res.redirect('/admin/instagram/new');
  }
  insertStmt.run(data);
  req.session.flash = { type: 'success', message: 'Post added.' };
  res.redirect('/admin/instagram');
});

router.get('/:id/edit', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Post not found.' } });
  res.render('instagram/form', { title: 'Edit post', row, action: `/admin/instagram/${row.id}` });
});

router.post('/:id', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Post not found.' } });
  const data = { ...normalize(req.body), id: row.id };
  if (!data.url) {
    req.session.flash = { type: 'error', message: 'Paste a valid Instagram post URL or embed snippet.' };
    return res.redirect(`/admin/instagram/${row.id}/edit`);
  }
  updateStmt.run(data);
  req.session.flash = { type: 'success', message: 'Post updated.' };
  res.redirect('/admin/instagram');
});

router.post('/:id/delete', (req, res) => {
  deleteStmt.run(req.params.id);
  req.session.flash = { type: 'success', message: 'Post removed.' };
  res.redirect('/admin/instagram');
});

module.exports = router;
