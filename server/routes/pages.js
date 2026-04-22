// Public deep-page routes:
//   /services, /services/:slug
//   /areas,    /areas/:slug
//   /blog,     /blog/:slug
//   /projects/:slug
//
// These pages are the SEO workhorses — each one is a long-form, keyword-targeted
// landing page that exists as its own URL, with its own canonical, JSON-LD, and
// internal cross-links to the other deep pages.

const path = require('path');
const fs = require('fs');
const express = require('express');
const db = require('../db');

const router = express.Router();

const BASE_URL = (process.env.BASE_URL || 'https://gravityconstructionsc.com').replace(/\/$/, '');

// ---------- Load static content (services + areas) ----------
const CONTENT_DIR = path.join(__dirname, '..', 'content');

function loadJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, name), 'utf8'));
  } catch (err) {
    console.warn(`[pages] failed to load ${name}:`, err.message);
    return [];
  }
}

let services = loadJson('services.json');
let areas = loadJson('areas.json');

// In dev, hot-reload content when files change on disk so we don't have to
// restart the server after every copy tweak.
if (process.env.NODE_ENV !== 'production') {
  try {
    fs.watch(CONTENT_DIR, (_ev, file) => {
      if (file === 'services.json') services = loadJson('services.json');
      if (file === 'areas.json') areas = loadJson('areas.json');
    });
  } catch (_err) { /* no-op on platforms where watch fails */ }
}

// ---------- Helpers ----------
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.indexOf('T') > -1 ? iso : iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function baseLocals() {
  return {
    services,
    areas,
    fmtDate,
    analytics: {
      ga4: process.env.GA4_MEASUREMENT_ID || null,
      gsc: process.env.GSC_VERIFICATION || null,
    },
  };
}

// ---------- SQL ----------
const postsListStmt = db.prepare(`
  SELECT id, title, slug, excerpt, hero_image, published_at
  FROM posts
  WHERE published = 1
  ORDER BY datetime(published_at) DESC, id DESC
`);
const postBySlugStmt = db.prepare(`
  SELECT id, title, slug, excerpt, body, hero_image, published_at, updated_at
  FROM posts
  WHERE published = 1 AND slug = ?
`);
const relatedPostsStmt = db.prepare(`
  SELECT id, title, slug, excerpt, hero_image, published_at
  FROM posts
  WHERE published = 1 AND slug != ?
  ORDER BY datetime(published_at) DESC, id DESC
  LIMIT 3
`);
const projectBySlugStmt = db.prepare(`
  SELECT id, title, slug, location, scope, summary, body, hero_image, created_at, updated_at
  FROM projects
  WHERE published = 1 AND slug = ?
`);
const projectGalleryStmt = db.prepare(`
  SELECT path AS url, alt AS caption
  FROM project_images
  WHERE project_id = ?
  ORDER BY sort_order ASC, id ASC
`);

// ---------- /services ----------
router.get('/services', (req, res) => {
  res.render('public/services-index', {
    ...baseLocals(),
    meta: {
      title: 'Construction Services in Santa Cruz | Gravity Construction',
      description: 'Kitchen & bath remodels, ADUs, whole-home renovations, additions, custom carpentry, and new construction across Santa Cruz County. Licensed CSLB #1075110.',
      canonical: `${BASE_URL}/services`,
      placename: 'Santa Cruz',
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/services` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: services.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${BASE_URL}/services/${s.slug}`,
          name: s.name,
        })),
      },
    ],
  });
});

// ---------- /services/:slug ----------
router.get('/services/:slug', (req, res, next) => {
  const service = services.find(s => s.slug === req.params.slug);
  if (!service) return next();
  res.render('public/service', {
    ...baseLocals(),
    service,
    meta: {
      title: service.metaTitle,
      description: service.metaDescription,
      canonical: `${BASE_URL}/services/${service.slug}`,
      placename: 'Santa Cruz',
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: service.name,
        name: service.name,
        provider: { '@id': `${BASE_URL}/#business` },
        areaServed: areas.map(a => a.name + ', CA'),
        description: service.metaDescription,
        url: `${BASE_URL}/services/${service.slug}`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/services` },
          { '@type': 'ListItem', position: 3, name: service.name, item: `${BASE_URL}/services/${service.slug}` },
        ],
      },
      ...(service.faq && service.faq.length ? [{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: service.faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }] : []),
    ],
  });
});

// ---------- /areas ----------
router.get('/areas', (req, res) => {
  res.render('public/areas-index', {
    ...baseLocals(),
    meta: {
      title: 'Service Areas | Santa Cruz County Contractor | Gravity Construction',
      description: 'Gravity Construction serves Santa Cruz, Capitola, Aptos, Soquel, Live Oak, Scotts Valley, Ben Lomond, and Felton. Licensed CSLB #1075110.',
      canonical: `${BASE_URL}/areas`,
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${BASE_URL}/areas` },
        ],
      },
    ],
  });
});

// ---------- /areas/:slug ----------
router.get('/areas/:slug', (req, res, next) => {
  const area = areas.find(a => a.slug === req.params.slug);
  if (!area) return next();
  res.render('public/area', {
    ...baseLocals(),
    area,
    meta: {
      title: area.metaTitle,
      description: area.metaDescription,
      canonical: `${BASE_URL}/areas/${area.slug}`,
      placename: area.name,
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: `${area.name}, CA`,
        containedInPlace: { '@type': 'AdministrativeArea', name: 'Santa Cruz County, CA' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${BASE_URL}/areas` },
          { '@type': 'ListItem', position: 3, name: area.name, item: `${BASE_URL}/areas/${area.slug}` },
        ],
      },
      ...(area.faq && area.faq.length ? [{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: area.faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }] : []),
    ],
  });
});

// ---------- /blog ----------
router.get('/blog', (req, res) => {
  const posts = postsListStmt.all();
  res.render('public/blog-index', {
    ...baseLocals(),
    posts,
    meta: {
      title: 'Gravity Construction Blog | Santa Cruz Remodel & Build Notes',
      description: 'Honest advice on remodeling, ADUs, and new construction in Santa Cruz County — written by licensed contractors working in your neighborhood.',
      canonical: `${BASE_URL}/blog`,
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Gravity Construction Blog',
        url: `${BASE_URL}/blog`,
        publisher: { '@id': `${BASE_URL}/#business` },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
        ],
      },
    ],
  });
});

// ---------- /blog/:slug ----------
router.get('/blog/:slug', (req, res, next) => {
  const post = postBySlugStmt.get(req.params.slug);
  if (!post) return next();
  const related = relatedPostsStmt.all(post.slug);
  res.render('public/post', {
    ...baseLocals(),
    post,
    related,
    meta: {
      title: `${post.title} | Gravity Construction`,
      description: post.excerpt || 'A post from the Gravity Construction blog.',
      canonical: `${BASE_URL}/blog/${post.slug}`,
      ogType: 'article',
      ogImage: post.hero_image
        ? (post.hero_image.startsWith('http') ? post.hero_image : BASE_URL + post.hero_image)
        : undefined,
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || undefined,
        image: post.hero_image
          ? (post.hero_image.startsWith('http') ? post.hero_image : BASE_URL + post.hero_image)
          : undefined,
        datePublished: post.published_at || undefined,
        dateModified: post.updated_at || post.published_at || undefined,
        author: { '@type': 'Organization', name: 'Gravity Construction' },
        publisher: { '@id': `${BASE_URL}/#business` },
        mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: `${BASE_URL}/blog/${post.slug}` },
        ],
      },
    ],
  });
});

// ---------- /projects/:slug ----------
router.get('/projects/:slug', (req, res, next) => {
  const project = projectBySlugStmt.get(req.params.slug);
  if (!project) return next();
  const gallery = projectGalleryStmt.all(project.id);
  res.render('public/project', {
    ...baseLocals(),
    project,
    gallery,
    meta: {
      title: `${project.title} | ${project.location || 'Santa Cruz'} | Gravity Construction`,
      description: project.summary || `${project.title} — a completed Gravity Construction project in ${project.location || 'Santa Cruz County'}.`,
      canonical: `${BASE_URL}/projects/${project.slug}`,
      ogType: 'article',
      ogImage: project.hero_image
        ? (project.hero_image.startsWith('http') ? project.hero_image : BASE_URL + project.hero_image)
        : undefined,
      placename: project.location || 'Santa Cruz',
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description: project.summary || undefined,
        image: project.hero_image
          ? (project.hero_image.startsWith('http') ? project.hero_image : BASE_URL + project.hero_image)
          : undefined,
        creator: { '@id': `${BASE_URL}/#business` },
        contentLocation: project.location || undefined,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Projects', item: `${BASE_URL}/#projects` },
          { '@type': 'ListItem', position: 3, name: project.title, item: `${BASE_URL}/projects/${project.slug}` },
        ],
      },
    ],
  });
});

// Expose the loaded content so sitemap/seo can read slugs without re-reading disk
router.services = () => services;
router.areas = () => areas;

module.exports = router;
