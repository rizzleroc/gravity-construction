const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');

const db = require('../../db');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const id = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${id}${ext || ''}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per file
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif|avif)$/i.test(file.mimetype)) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

const listStmt   = db.prepare(`SELECT * FROM projects ORDER BY sort_order ASC, id DESC`);
const getStmt    = db.prepare(`SELECT * FROM projects WHERE id = ?`);
const bySlugStmt = db.prepare(`SELECT id FROM projects WHERE slug = ? AND id != ?`);
const insertStmt = db.prepare(`
  INSERT INTO projects (title, slug, location, scope, summary, body, hero_image,
                        testimonial, client_name, featured, published, sort_order)
  VALUES (@title, @slug, @location, @scope, @summary, @body, @hero_image,
          @testimonial, @client_name, @featured, @published, @sort_order)
`);
const updateStmt = db.prepare(`
  UPDATE projects SET
    title = @title, slug = @slug, location = @location, scope = @scope,
    summary = @summary, body = @body, hero_image = @hero_image,
    testimonial = @testimonial, client_name = @client_name,
    featured = @featured, published = @published, sort_order = @sort_order
  WHERE id = @id
`);
const deleteStmt = db.prepare(`DELETE FROM projects WHERE id = ?`);
const imgsForStmt     = db.prepare(`SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC`);
const imgInsertStmt   = db.prepare(`INSERT INTO project_images (project_id, path, alt, sort_order) VALUES (?, ?, ?, ?)`);
const imgDeleteStmt   = db.prepare(`DELETE FROM project_images WHERE id = ? AND project_id = ?`);
const imgGetStmt      = db.prepare(`SELECT * FROM project_images WHERE id = ? AND project_id = ?`);

const SANITIZE_OPTS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h2', 'h3', 'figure', 'figcaption']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'title', 'loading'],
    a: ['href', 'title', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
};

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function uniqueSlug(base, currentId = 0) {
  let slug = base || `project-${Date.now()}`;
  let n = 1;
  while (bySlugStmt.get(slug, currentId)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function normalize(body, currentId = 0, heroPath = null) {
  const baseSlug = slugify(body.slug || body.title);
  return {
    title:       (body.title || '').trim(),
    slug:        uniqueSlug(baseSlug, currentId),
    location:    (body.location || '').trim() || null,
    scope:       (body.scope || '').trim() || null,
    summary:     (body.summary || '').trim() || null,
    body:        sanitizeHtml(body.body || '', SANITIZE_OPTS),
    hero_image:  heroPath,
    testimonial: (body.testimonial || '').trim() || null,
    client_name: (body.client_name || '').trim() || null,
    featured:    body.featured === 'on' || body.featured === '1' || body.featured === true ? 1 : 0,
    published:   body.published === 'on' || body.published === '1' || body.published === true ? 1 : 0,
    sort_order:  Number.parseInt(body.sort_order, 10) || 0,
  };
}

function safeUnlink(relPath) {
  if (!relPath) return;
  const abs = path.join(UPLOAD_DIR, path.basename(relPath));
  fs.unlink(abs, () => {});
}

router.get('/', (req, res) => {
  const rows = listStmt.all();
  res.render('projects/list', { title: 'Projects', rows });
});

router.get('/new', (req, res) => {
  res.render('projects/form', {
    title: 'New project',
    row: null,
    action: '/admin/projects',
    images: [],
  });
});

router.post('/', upload.single('hero_image_file'), (req, res) => {
  const heroPath = req.file ? `/uploads/${req.file.filename}` : null;
  const data = normalize(req.body, 0, heroPath);
  if (!data.title) {
    if (heroPath) safeUnlink(heroPath);
    req.session.flash = { type: 'error', message: 'Title is required.' };
    return res.redirect('/admin/projects/new');
  }
  const info = insertStmt.run(data);
  req.session.flash = { type: 'success', message: 'Project created.' };
  res.redirect(`/admin/projects/${info.lastInsertRowid}/edit`);
});

router.get('/:id/edit', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Project not found.' } });
  const images = imgsForStmt.all(row.id);
  res.render('projects/form', {
    title: `Edit: ${row.title}`,
    row,
    action: `/admin/projects/${row.id}`,
    images,
  });
});

router.post('/:id', upload.single('hero_image_file'), (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Project not found.' } });

  let heroPath = row.hero_image;
  if (req.file) {
    if (heroPath) safeUnlink(heroPath);
    heroPath = `/uploads/${req.file.filename}`;
  } else if (req.body.remove_hero === '1' && heroPath) {
    safeUnlink(heroPath);
    heroPath = null;
  }

  const data = { ...normalize(req.body, row.id, heroPath), id: row.id };
  if (!data.title) {
    req.session.flash = { type: 'error', message: 'Title is required.' };
    return res.redirect(`/admin/projects/${row.id}/edit`);
  }
  updateStmt.run(data);
  req.session.flash = { type: 'success', message: 'Project updated.' };
  res.redirect(`/admin/projects/${row.id}/edit`);
});

router.post('/:id/delete', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (row) {
    if (row.hero_image) safeUnlink(row.hero_image);
    const imgs = imgsForStmt.all(row.id);
    imgs.forEach(i => safeUnlink(i.path));
    deleteStmt.run(row.id);
  }
  req.session.flash = { type: 'success', message: 'Project deleted.' };
  res.redirect('/admin/projects');
});

// ---------- Gallery sub-routes ----------
router.post('/:id/images', upload.array('images', 10), (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) {
    (req.files || []).forEach(f => safeUnlink(`/uploads/${f.filename}`));
    return res.status(404).render('error', { title: 'Not found', error: { message: 'Project not found.' } });
  }
  const files = req.files || [];
  const alts = Array.isArray(req.body.alt) ? req.body.alt : (req.body.alt ? [req.body.alt] : []);
  files.forEach((f, idx) => {
    imgInsertStmt.run(row.id, `/uploads/${f.filename}`, alts[idx] || null, idx);
  });
  req.session.flash = { type: 'success', message: `${files.length} image(s) uploaded.` };
  res.redirect(`/admin/projects/${row.id}/edit`);
});

router.post('/:id/images/:imgId/delete', (req, res) => {
  const img = imgGetStmt.get(req.params.imgId, req.params.id);
  if (img) {
    safeUnlink(img.path);
    imgDeleteStmt.run(img.id, req.params.id);
  }
  req.session.flash = { type: 'success', message: 'Image removed.' };
  res.redirect(`/admin/projects/${req.params.id}/edit`);
});

module.exports = router;
