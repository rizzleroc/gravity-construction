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
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif|avif)$/i.test(file.mimetype)) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

const listStmt   = db.prepare(`
  SELECT p.*, u.name AS author_name
  FROM posts p
  LEFT JOIN users u ON u.id = p.author_id
  ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.id DESC
`);
const getStmt    = db.prepare(`SELECT * FROM posts WHERE id = ?`);
const bySlugStmt = db.prepare(`SELECT id FROM posts WHERE slug = ? AND id != ?`);
const insertStmt = db.prepare(`
  INSERT INTO posts (title, slug, excerpt, body, hero_image, author_id, published, published_at)
  VALUES (@title, @slug, @excerpt, @body, @hero_image, @author_id, @published, @published_at)
`);
const updateStmt = db.prepare(`
  UPDATE posts SET
    title = @title, slug = @slug, excerpt = @excerpt, body = @body,
    hero_image = @hero_image, published = @published, published_at = @published_at
  WHERE id = @id
`);
const deleteStmt = db.prepare(`DELETE FROM posts WHERE id = ?`);

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
  let slug = base || `post-${Date.now()}`;
  let n = 1;
  while (bySlugStmt.get(slug, currentId)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}
function safeUnlink(relPath) {
  if (!relPath) return;
  const abs = path.join(UPLOAD_DIR, path.basename(relPath));
  fs.unlink(abs, () => {});
}

function normalize(body, currentId, heroPath, authorId, currentPublishedAt) {
  const baseSlug = slugify(body.slug || body.title);
  const nowIso = new Date().toISOString();
  const published = body.published === 'on' || body.published === '1' || body.published === true ? 1 : 0;
  // Set published_at the first time a post is published; preserve it thereafter.
  let publishedAt = currentPublishedAt || null;
  if (published && !publishedAt) publishedAt = nowIso;
  if (!published) publishedAt = null;

  return {
    title:        (body.title || '').trim(),
    slug:         uniqueSlug(baseSlug, currentId || 0),
    excerpt:      (body.excerpt || '').trim() || null,
    body:         sanitizeHtml(body.body || '', SANITIZE_OPTS),
    hero_image:   heroPath,
    author_id:    authorId || null,
    published,
    published_at: publishedAt,
  };
}

router.get('/', (req, res) => {
  const rows = listStmt.all();
  res.render('posts/list', { title: 'Blog', rows });
});

router.get('/new', (req, res) => {
  res.render('posts/form', { title: 'New post', row: null, action: '/admin/posts' });
});

router.post('/', upload.single('hero_image_file'), (req, res) => {
  const heroPath = req.file ? `/uploads/${req.file.filename}` : null;
  const data = normalize(req.body, 0, heroPath, req.user && req.user.id, null);
  if (!data.title) {
    if (heroPath) safeUnlink(heroPath);
    req.session.flash = { type: 'error', message: 'Title is required.' };
    return res.redirect('/admin/posts/new');
  }
  const info = insertStmt.run(data);
  req.session.flash = { type: 'success', message: 'Post created.' };
  res.redirect(`/admin/posts/${info.lastInsertRowid}/edit`);
});

router.get('/:id/edit', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Post not found.' } });
  res.render('posts/form', { title: `Edit: ${row.title}`, row, action: `/admin/posts/${row.id}` });
});

router.post('/:id', upload.single('hero_image_file'), (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).render('error', { title: 'Not found', error: { message: 'Post not found.' } });

  let heroPath = row.hero_image;
  if (req.file) {
    if (heroPath) safeUnlink(heroPath);
    heroPath = `/uploads/${req.file.filename}`;
  } else if (req.body.remove_hero === '1' && heroPath) {
    safeUnlink(heroPath);
    heroPath = null;
  }

  const data = {
    ...normalize(req.body, row.id, heroPath, row.author_id, row.published_at),
    id: row.id,
  };
  if (!data.title) {
    req.session.flash = { type: 'error', message: 'Title is required.' };
    return res.redirect(`/admin/posts/${row.id}/edit`);
  }
  updateStmt.run(data);
  req.session.flash = { type: 'success', message: 'Post updated.' };
  res.redirect(`/admin/posts/${row.id}/edit`);
});

router.post('/:id/delete', (req, res) => {
  const row = getStmt.get(req.params.id);
  if (row) {
    if (row.hero_image) safeUnlink(row.hero_image);
    deleteStmt.run(row.id);
  }
  req.session.flash = { type: 'success', message: 'Post deleted.' };
  res.redirect('/admin/posts');
});

module.exports = router;
