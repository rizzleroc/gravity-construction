const express = require('express');
const db = require('../../db');

const router = express.Router();

const listStmt   = db.prepare(`SELECT * FROM specials ORDER BY sort_order ASC, id DESC`);
const getStmt    = db.prepare(`SELECT * FROM specials WHERE id = ?`);
const insertStmt = db.prepare(`
  INSERT INTO specials (title, body, cta_label, cta_href, starts_at, ends_at, active, sort_order)
  VALUES (@title, @body, @cta_label, @cta_href, @starts_at, @ends_at, @active, @sort_order)
`);
const updateStmt = db.prepare(`
  UPDATE specials SET
    title = @title, body = @body, cta_label = @cta_label, cta_href = @cta_href,
    starts_at = @starts_at, ends_at = @ends_at, active = @active, sort_order = @sort_order
  WHERE id = @id
`);
const deleteStmt = db.prepare(`DELETE FROM specials WHERE id = ?`);

function normalize(body) {
  return {
    title:      (body.title || '').trim(),
    body:       body.body || '',
    cta_label:  (body.cta_label || '').trim() || null,
    cta_href:   (body.cta_href || '').trim() || null,
    starts_at:  body.starts_at || null,
    ends_at:    body.ends_at || null,
    active:     body.active === 'on' || body.active === '1' || body.active === true ? 1 : 0,
    sort_order: Number.parseInt(body.sort_order, 10) || 0,
  };
}

router.get('/', (req, res) => {
  const rows = listStmt.all();
  res.render('specials/list', { title: 'Specials', rows });
});

router.get('/new', (req, res) => {
  res.render('specials/form', { title: 'New special', row: null, action: '/admin/specials' });
});

router.post('/', (req, res) => {
  const data = normalize(req.body);
  if (!data.title) {
    req.session.flash = { type: 'error', message: 'Title is required.' };
    return res.redirect('/admin/specials/new');
  }
  insertStmt.run(data);
  req.session.flash = { type: 'success', message: 'Special created.' };
  res.redirect('/admin/specials');
});

router.get('/:id/edit', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Special not found.' } });
  res.render('specials/form', { title: `Edit: ${row.title}`, row, action: `/admin/specials/${row.id}` });
});

router.post('/:id', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Special not found.' } });
  const data = { ...normalize(req.body), id: row.id };
  if (!data.title) {
    req.session.flash = { type: 'error', message: 'Title is required.' };
    return res.redirect(`/admin/specials/${row.id}/edit`);
  }
  updateStmt.run(data);
  req.session.flash = { type: 'success', message: 'Special updated.' };
  res.redirect('/admin/specials');
});

router.post('/:id/delete', (req, res) => {
  deleteStmt.run(req.params.id);
  req.session.flash = { type: 'success', message: 'Special deleted.' };
  res.redirect('/admin/specials');
});

module.exports = router;
