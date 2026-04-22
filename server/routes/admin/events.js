const express = require('express');
const db = require('../../db');

const router = express.Router();

const listStmt   = db.prepare(`SELECT * FROM events ORDER BY starts_at ASC, id DESC`);
const getStmt    = db.prepare(`SELECT * FROM events WHERE id = ?`);
const insertStmt = db.prepare(`
  INSERT INTO events (title, location, starts_at, ends_at, url, description, active)
  VALUES (@title, @location, @starts_at, @ends_at, @url, @description, @active)
`);
const updateStmt = db.prepare(`
  UPDATE events SET
    title = @title, location = @location, starts_at = @starts_at, ends_at = @ends_at,
    url = @url, description = @description, active = @active
  WHERE id = @id
`);
const deleteStmt = db.prepare(`DELETE FROM events WHERE id = ?`);

function normalize(body) {
  return {
    title:       (body.title || '').trim(),
    location:    (body.location || '').trim() || null,
    starts_at:   body.starts_at || null,
    ends_at:     body.ends_at || null,
    url:         (body.url || '').trim() || null,
    description: body.description || null,
    active:      body.active === 'on' || body.active === '1' || body.active === true ? 1 : 0,
  };
}

router.get('/', (req, res) => {
  const rows = listStmt.all();
  res.render('events/list', { title: 'Events', rows });
});

router.get('/new', (req, res) => {
  res.render('events/form', { title: 'New event', row: null, action: '/admin/events' });
});

router.post('/', (req, res) => {
  const data = normalize(req.body);
  if (!data.title || !data.starts_at) {
    req.session.flash = { type: 'error', message: 'Title and start time are required.' };
    return res.redirect('/admin/events/new');
  }
  insertStmt.run(data);
  req.session.flash = { type: 'success', message: 'Event created.' };
  res.redirect('/admin/events');
});

router.get('/:id/edit', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Event not found.' } });
  res.render('events/form', { title: `Edit: ${row.title}`, row, action: `/admin/events/${row.id}` });
});

router.post('/:id', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Event not found.' } });
  const data = { ...normalize(req.body), id: row.id };
  if (!data.title || !data.starts_at) {
    req.session.flash = { type: 'error', message: 'Title and start time are required.' };
    return res.redirect(`/admin/events/${row.id}/edit`);
  }
  updateStmt.run(data);
  req.session.flash = { type: 'success', message: 'Event updated.' };
  res.redirect('/admin/events');
});

router.post('/:id/delete', (req, res) => {
  deleteStmt.run(req.params.id);
  req.session.flash = { type: 'success', message: 'Event deleted.' };
  res.redirect('/admin/events');
});

module.exports = router;
