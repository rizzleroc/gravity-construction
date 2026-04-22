const express = require('express');
const db = require('../../db');

const router = express.Router();

const listStmt = db.prepare(`
  SELECT t.*, p.title AS project_title
  FROM testimonials t
  LEFT JOIN projects p ON p.id = t.project_id
  ORDER BY t.sort_order ASC, t.id DESC
`);
const getStmt = db.prepare(`SELECT * FROM testimonials WHERE id = ?`);
const projectsStmt = db.prepare(`SELECT id, title FROM projects ORDER BY title`);
const insertStmt = db.prepare(`
  INSERT INTO testimonials (quote, author, location, rating, project_id, published, sort_order)
  VALUES (@quote, @author, @location, @rating, @project_id, @published, @sort_order)
`);
const updateStmt = db.prepare(`
  UPDATE testimonials SET
    quote = @quote, author = @author, location = @location, rating = @rating,
    project_id = @project_id, published = @published, sort_order = @sort_order
  WHERE id = @id
`);
const deleteStmt = db.prepare(`DELETE FROM testimonials WHERE id = ?`);

function normalize(body) {
  const rating = Number.parseInt(body.rating, 10);
  const projectId = Number.parseInt(body.project_id, 10);
  return {
    quote:      (body.quote || '').trim(),
    author:     (body.author || '').trim(),
    location:   (body.location || '').trim() || null,
    rating:     Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null,
    project_id: Number.isFinite(projectId) && projectId > 0 ? projectId : null,
    published:  body.published === 'on' || body.published === '1' || body.published === true ? 1 : 0,
    sort_order: Number.parseInt(body.sort_order, 10) || 0,
  };
}

router.get('/', (req, res) => {
  const rows = listStmt.all();
  res.render('testimonials/list', { title: 'Testimonials', rows });
});

router.get('/new', (req, res) => {
  res.render('testimonials/form', {
    title: 'New testimonial',
    row: null,
    action: '/admin/testimonials',
    projects: projectsStmt.all(),
  });
});

router.post('/', (req, res) => {
  const data = normalize(req.body);
  if (!data.quote || !data.author) {
    req.session.flash = { type: 'error', message: 'Quote and author are required.' };
    return res.redirect('/admin/testimonials/new');
  }
  insertStmt.run(data);
  req.session.flash = { type: 'success', message: 'Testimonial added.' };
  res.redirect('/admin/testimonials');
});

router.get('/:id/edit', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Testimonial not found.' } });
  res.render('testimonials/form', {
    title: `Edit: ${row.author}`,
    row,
    action: `/admin/testimonials/${row.id}`,
    projects: projectsStmt.all(),
  });
});

router.post('/:id', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Testimonial not found.' } });
  const data = { ...normalize(req.body), id: row.id };
  if (!data.quote || !data.author) {
    req.session.flash = { type: 'error', message: 'Quote and author are required.' };
    return res.redirect(`/admin/testimonials/${row.id}/edit`);
  }
  updateStmt.run(data);
  req.session.flash = { type: 'success', message: 'Testimonial updated.' };
  res.redirect('/admin/testimonials');
});

router.post('/:id/delete', (req, res) => {
  deleteStmt.run(req.params.id);
  req.session.flash = { type: 'success', message: 'Testimonial deleted.' };
  res.redirect('/admin/testimonials');
});

module.exports = router;
