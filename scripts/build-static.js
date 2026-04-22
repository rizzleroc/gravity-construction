#!/usr/bin/env node
// Static-site builder for the GitHub Pages preview.
//
// Renders every dynamic route (services, areas, blog, projects) into plain HTML
// files, pre-renders index.html with live DB content baked in, copies static
// assets (css/js/images/uploads) into dist/, and rewrites every absolute /foo
// URL so it works under the /gravity-construction/ Pages subpath.
//
// Run from the project root:
//   node scripts/build-static.js
//
// Output: ./dist/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SERVER = path.join(ROOT, 'server');
// Resolve ejs from the server/node_modules (the only place it's installed).
const ejs = require(path.join(SERVER, 'node_modules', 'ejs'));
const DIST = path.join(ROOT, 'dist');
const BASE_PATH = '/gravity-construction';
const BASE_URL = 'https://rizzleroc.github.io' + BASE_PATH;

// ---------- tiny helpers ----------
function rm(p) { try { fs.rmSync(p, { recursive: true, force: true }); } catch {} }
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function write(rel, contents) {
  const full = path.join(DIST, rel);
  mkdirp(path.dirname(full));
  fs.writeFileSync(full, contents);
  console.log('  →', rel);
}
function copyDir(src, destRel) {
  if (!fs.existsSync(src)) return;
  const dest = path.join(DIST, destRel);
  fs.cpSync(src, dest, { recursive: true });
  console.log('  →', destRel + '/  (copied)');
}
function copyFile(srcRel) {
  const src = path.join(ROOT, srcRel);
  if (!fs.existsSync(src)) return;
  const dest = path.join(DIST, srcRel);
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log('  →', srcRel);
}
function loadJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.indexOf('T') > -1 ? iso : iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ---------- Absolute-URL rewriter ----------
// Pages is served from https://rizzleroc.github.io/gravity-construction/,
// so every `href="/x"` / `src="/x"` / `action="/x"` has to become
// `/gravity-construction/x`. External URLs (//cdn..., https://...) and
// scheme URIs (tel:, mailto:, #anchor) are left alone.
function rewritePaths(html) {
  // attribute values that start with a single / but not //
  return html
    .replace(/(\s(?:href|src|action|data-src|poster)=)"(\/(?!\/)[^"]*)"/g,
      (_m, attr, url) => `${attr}"${BASE_PATH}${url === '/' ? '/' : url}"`)
    .replace(/(\s(?:href|src|action|data-src|poster)=)'(\/(?!\/)[^']*)'/g,
      (_m, attr, url) => `${attr}'${BASE_PATH}${url === '/' ? '/' : url}'`)
    // url(/foo) inside inline styles
    .replace(/url\((['"]?)(\/(?!\/)[^)'"]*)\1\)/g,
      (_m, q, url) => `url(${q}${BASE_PATH}${url}${q})`);
}

// Lightweight escape for the homepage renderer
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function fmtDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso.indexOf('T') > -1 ? iso : iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------- Load data ----------
console.log('\n[1/6] Loading content…');
const services = loadJson(path.join(SERVER, 'content', 'services.json'));
const areas = loadJson(path.join(SERVER, 'content', 'areas.json'));

// Try to load DB. If it's missing, publish with empty post/project sets.
let posts = [], projects = [], testimonials = [], events = [], specials = [], igPosts = [];
try {
  const db = require(path.join(SERVER, 'db.js'));
  posts = db.prepare(`SELECT id, title, slug, excerpt, body, hero_image,
    published_at, updated_at FROM posts WHERE published=1
    ORDER BY datetime(published_at) DESC, id DESC`).all();
  projects = db.prepare(`SELECT id, title, slug, location, scope, summary, body,
    hero_image, featured, sort_order, created_at, updated_at FROM projects
    WHERE published=1 ORDER BY sort_order ASC, id DESC`).all();
  testimonials = db.prepare(`SELECT id, quote, author, location, rating FROM
    testimonials WHERE published=1 ORDER BY sort_order ASC, id DESC`).all();
  events = db.prepare(`SELECT id, title, location, starts_at, url, description
    FROM events WHERE active=1 AND (datetime(starts_at) >= datetime('now')
    OR (ends_at IS NOT NULL AND datetime(ends_at) >= datetime('now')))
    ORDER BY datetime(starts_at) ASC LIMIT 12`).all();
  specials = db.prepare(`SELECT id, title, body, cta_label, cta_href FROM
    specials WHERE active=1
    AND (starts_at IS NULL OR datetime(starts_at) <= datetime('now'))
    AND (ends_at IS NULL OR datetime(ends_at) >= datetime('now'))
    ORDER BY sort_order ASC, id DESC`).all();
  // Column name varies across schemas — match what admin/instagram.js writes.
  try {
    igPosts = db.prepare(`SELECT id, url, caption, sort_order FROM instagram_posts
      ORDER BY sort_order ASC, id DESC`).all();
  } catch {
    try {
      igPosts = db.prepare(`SELECT id, permalink AS url, caption, sort_order FROM instagram_posts
        ORDER BY sort_order ASC, id DESC`).all();
    } catch (err) {
      console.log('  (instagram_posts lookup failed:', err.message, ')');
    }
  }
  console.log(`  loaded: ${posts.length} posts, ${projects.length} projects, ${testimonials.length} testimonials, ${events.length} events, ${specials.length} specials, ${igPosts.length} instagram`);
} catch (err) {
  console.log('  (DB not available — building with empty blog/project sets)');
  console.log('  ', err.message);
}

// ---------- Weather snapshot (live fetch from weather.gov at build time) ----------
async function fetchWeatherSnapshot() {
  const LAT = 36.9741, LON = -122.0308;
  const UA = 'GravityConstructionSC/1.0 (build-static.js)';
  try {
    const points = await fetch(`https://api.weather.gov/points/${LAT},${LON}`, {
      headers: { 'User-Agent': UA, 'Accept': 'application/geo+json' },
    });
    if (!points.ok) throw new Error('points ' + points.status);
    const pJson = await points.json();
    const forecastUrl = pJson.properties && pJson.properties.forecast;
    if (!forecastUrl) throw new Error('no forecast url');
    const fc = await fetch(forecastUrl, {
      headers: { 'User-Agent': UA, 'Accept': 'application/geo+json' },
    });
    if (!fc.ok) throw new Error('forecast ' + fc.status);
    const fcJson = await fc.json();
    const periods = (fcJson.properties && fcJson.properties.periods) || [];
    const current = periods[0];
    if (!current) throw new Error('no periods');
    return {
      location: 'Santa Cruz, CA',
      fetchedAt: new Date().toISOString(),
      current: {
        name: current.name, temperature: current.temperature,
        unit: current.temperatureUnit, shortForecast: current.shortForecast,
        icon: current.icon, windSpeed: current.windSpeed,
        windDirection: current.windDirection, isDaytime: current.isDaytime,
      },
      upcoming: periods.slice(1, 5).map(p => ({
        name: p.name, temperature: p.temperature, unit: p.temperatureUnit,
        shortForecast: p.shortForecast, icon: p.icon,
      })),
    };
  } catch (err) {
    console.log('  weather fetch failed, using fallback:', err.message);
    // Fallback so the chip still shows something reasonable on the preview.
    return {
      location: 'Santa Cruz, CA',
      fetchedAt: new Date().toISOString(),
      current: {
        name: 'Today', temperature: 64, unit: 'F',
        shortForecast: 'Partly Cloudy', windSpeed: '10 mph',
        windDirection: 'NW', isDaytime: true,
      },
      upcoming: [],
    };
  }
}

// ---------- Clean dist/ ----------
console.log('\n[2/6] Cleaning dist/…');
rm(DIST);
mkdirp(DIST);

// ---------- Copy static assets ----------
console.log('\n[3/6] Copying static assets…');
['index.html', 'styles.css', 'logo.svg', 'gravity.png',
  'robots.txt', 'Santa_Cruz_Surfing_Museum_-_panoramio_(1).jpg'].forEach(copyFile);
copyDir(path.join(ROOT, 'images'), 'images');
copyDir(path.join(ROOT, 'demo'), 'demo');
// Project hero images — best-effort (not in repo on a fresh clone).
const uploadsSrc = path.join(SERVER, 'public', 'uploads');
if (fs.existsSync(uploadsSrc)) copyDir(uploadsSrc, 'uploads');

// --- Patch script.js so its /api/* fetches resolve under the Pages subpath. ---
// Only the endpoints we actually ship static snapshots for are rewritten to
// real .json files; the rest are left to 404 silently (safeFetch swallows the
// error and the server-side prerender keeps the prerendered content in place).
{
  let js = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
  js = js
    .replace(/'\/api\/weather'/g, `'${BASE_PATH}/api/weather.json'`)
    .replace(/'\/api\/instagram'/g, `'${BASE_PATH}/api/instagram.json'`)
    // Leave other /api/* requests alone — they'll 404 and safeFetch returns null,
    // which the renderers treat as a no-op (prerendered content stays visible).
    ;
  write('script.js', js);
}

// ---------- Render EJS helper ----------
function renderEjs(templateRel, locals) {
  const tplPath = path.join(SERVER, 'views', templateRel + '.ejs');
  return ejs.renderFile(tplPath, locals, {
    async: false,
    views: [path.join(SERVER, 'views')],
    // partials using <%- include('partials/header') %> resolve relative to the
    // template file, which is what we want.
  });
}

function baseLocals() {
  return {
    services, areas, fmtDate,
    analytics: { ga4: null, gsc: null },
  };
}

// EJS renderFile is async-callback by default; wrap in sync-like via Promise.
async function renderToFile(outRel, templateRel, locals) {
  const html = await renderEjs(templateRel, locals);
  write(outRel, rewritePaths(html));
}

// ---------- Build deep pages ----------
async function buildDeepPages() {
  console.log('\n[4/6] Rendering deep pages (services, areas, blog, projects)…');

  // /services
  await renderToFile('services/index.html', 'public/services-index', {
    ...baseLocals(),
    meta: {
      title: 'Construction Services in Santa Cruz | Gravity Construction',
      description: 'Kitchen & bath remodels, ADUs, whole-home renovations, commercial tenant improvements, restaurant build-outs, and new construction across Santa Cruz County. Licensed CSLB #1075110.',
      canonical: `${BASE_URL}/services`,
      placename: 'Santa Cruz',
    },
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/services` },
      ],
    }],
  });

  // /services/:slug
  for (const service of services) {
    await renderToFile(`services/${service.slug}/index.html`, 'public/service', {
      ...baseLocals(), service,
      meta: {
        title: service.metaTitle,
        description: service.metaDescription,
        canonical: `${BASE_URL}/services/${service.slug}`,
        placename: 'Santa Cruz',
      },
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'Service',
          serviceType: service.name, name: service.name,
          areaServed: areas.map(a => a.name + ', CA'),
          description: service.metaDescription,
          url: `${BASE_URL}/services/${service.slug}` },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/services` },
            { '@type': 'ListItem', position: 3, name: service.name, item: `${BASE_URL}/services/${service.slug}` },
          ] },
        ...(service.faq && service.faq.length ? [{
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: service.faq.map(f => ({ '@type': 'Question', name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }] : []),
      ],
    });
  }

  // /areas
  await renderToFile('areas/index.html', 'public/areas-index', {
    ...baseLocals(),
    meta: {
      title: 'Service Areas | Santa Cruz County Contractor | Gravity Construction',
      description: 'Gravity Construction serves Santa Cruz, Capitola, Aptos, Soquel, Live Oak, Scotts Valley, Ben Lomond, and Felton. Licensed CSLB #1075110.',
      canonical: `${BASE_URL}/areas`,
    },
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${BASE_URL}/areas` },
      ],
    }],
  });

  // /areas/:slug
  for (const area of areas) {
    await renderToFile(`areas/${area.slug}/index.html`, 'public/area', {
      ...baseLocals(), area,
      meta: {
        title: area.metaTitle,
        description: area.metaDescription,
        canonical: `${BASE_URL}/areas/${area.slug}`,
        placename: area.name,
      },
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'Place',
          name: `${area.name}, CA`,
          containedInPlace: { '@type': 'AdministrativeArea', name: 'Santa Cruz County, CA' } },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${BASE_URL}/areas` },
            { '@type': 'ListItem', position: 3, name: area.name, item: `${BASE_URL}/areas/${area.slug}` },
          ] },
        ...(area.faq && area.faq.length ? [{
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: area.faq.map(f => ({ '@type': 'Question', name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }] : []),
      ],
    });
  }

  // /blog
  await renderToFile('blog/index.html', 'public/blog-index', {
    ...baseLocals(), posts,
    meta: {
      title: 'Gravity Construction Blog | Santa Cruz Remodel & Build Notes',
      description: 'Honest advice on remodeling, ADUs, and new construction in Santa Cruz County — written by licensed contractors working in your neighborhood.',
      canonical: `${BASE_URL}/blog`,
    },
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'Blog',
        name: 'Gravity Construction Blog', url: `${BASE_URL}/blog` },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
        ] },
    ],
  });

  // /blog/:slug
  for (const post of posts) {
    const related = posts.filter(p => p.slug !== post.slug).slice(0, 3);
    await renderToFile(`blog/${post.slug}/index.html`, 'public/post', {
      ...baseLocals(), post, related,
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
        { '@context': 'https://schema.org', '@type': 'BlogPosting',
          headline: post.title, description: post.excerpt || undefined,
          image: post.hero_image
            ? (post.hero_image.startsWith('http') ? post.hero_image : BASE_URL + post.hero_image)
            : undefined,
          datePublished: post.published_at || undefined,
          dateModified: post.updated_at || post.published_at || undefined,
          mainEntityOfPage: `${BASE_URL}/blog/${post.slug}` },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: `${BASE_URL}/blog/${post.slug}` },
          ] },
      ],
    });
  }

  // /projects/:slug  (no gallery table read in static build — DB lookups were
  // attempted earlier; skip if no projects or no gallery support.)
  for (const project of projects) {
    await renderToFile(`projects/${project.slug}/index.html`, 'public/project', {
      ...baseLocals(), project, gallery: [],
      meta: {
        title: `${project.title} | ${project.location || 'Santa Cruz'} | Gravity Construction`,
        description: project.summary || `${project.title} — a completed Gravity Construction project in ${project.location || 'Santa Cruz County'}.`,
        canonical: `${BASE_URL}/projects/${project.slug}`,
        ogType: 'article',
        placename: project.location || 'Santa Cruz',
      },
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'CreativeWork',
          name: project.title, description: project.summary || undefined,
          contentLocation: project.location || undefined },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Projects', item: `${BASE_URL}/#projects` },
            { '@type': 'ListItem', position: 3, name: project.title, item: `${BASE_URL}/projects/${project.slug}` },
          ] },
      ],
    });
  }
}

// ---------- Home page prerender ----------
// Mirrors server/prerender.js but reads from the in-memory arrays loaded above
// and writes into ./dist/index.html (with path rewriting applied).
function prerenderHome() {
  console.log('\n[5/6] Pre-rendering index.html with DB content…');
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  // --- Specials ---
  if (specials.length) {
    const s = specials[0];
    const cta = s.cta_label && s.cta_href
      ? ` <a class="specials-cta" href="${esc(s.cta_href)}">${esc(s.cta_label)} →</a>` : '';
    const inner = `<div class="specials-inner">` +
      `<strong>${esc(s.title)}</strong>` +
      (s.body ? ` <span class="specials-body">${esc(s.body).replace(/\n+/g, ' ')}</span>` : '') +
      cta +
      `<button type="button" class="specials-close" aria-label="Dismiss">×</button>` +
      `</div>`;
    html = html.replace(
      /<aside class="specials-bar" id="specials-bar" hidden><\/aside>/,
      `<aside class="specials-bar" id="specials-bar">${inner}</aside>`
    );
  }

  // --- Projects --- (deliberately not injected: keep section hidden, remove nav link)
  // The section in index.html stays `hidden` because we don't populate it.
  // We also strip the #projects nav link so visitors don't click into emptiness.
  html = html.replace(/<li>\s*<a href="#projects">Projects<\/a>\s*<\/li>\s*/, '');

  // --- Testimonials ---
  if (testimonials.length) {
    const inner = testimonials.map(t => {
      const stars = t.rating
        ? `<span class="t-stars" aria-label="${t.rating} out of 5">` +
          '★'.repeat(t.rating) +
          `<span class="t-stars-empty">${'★'.repeat(5 - t.rating)}</span></span>` : '';
      const byline = t.author + (t.location ? ' · ' + t.location : '');
      return `<figure class="tcard">` + stars +
        `<blockquote>"${esc(t.quote)}"</blockquote>` +
        `<figcaption>— ${esc(byline)}</figcaption></figure>`;
    }).join('');
    html = html.replace(/<section class="section" id="testimonials" hidden>/, '<section class="section" id="testimonials">');
    html = html.replace(/(<[^>]*id=["']testimonials-grid["'][^>]*>)([\s\S]*?)(<\/[^>]+>)/,
      (_, open, _inner, close) => open + inner + close);
  }

  // --- Blog posts ---
  if (posts.length) {
    const top = posts.slice(0, 3);
    const inner = top.map(p => {
      const img = p.hero_image
        ? `<div class="post-img" role="img" aria-label="${esc(p.title)}" style="background-image:url(${esc(p.hero_image)})"></div>` : '';
      const href = `/blog/${esc(p.slug)}`;
      return `<a class="post-card" href="${href}" aria-label="Read: ${esc(p.title)}">` + img +
        `<div class="post-body">` +
          `<p class="post-date">${esc(fmtDateShort(p.published_at))}</p>` +
          `<h3>${esc(p.title)}</h3>` +
          (p.excerpt ? `<p class="post-excerpt">${esc(p.excerpt)}</p>` : '') +
          `<span class="post-more" aria-hidden="true">Read →</span>` +
        `</div></a>`;
    }).join('');
    html = html.replace(/<section class="section" id="blog" hidden>/, '<section class="section" id="blog">');
    html = html.replace(/(<[^>]*id=["']posts-grid["'][^>]*>)([\s\S]*?)(<\/[^>]+>)/,
      (_, open, _inner, close) => open + inner + close);
  }

  // Preview banner so viewers know this is static
  html = html.replace('<body>',
    `<body>\n<div style="background:#f5a524;color:#1a1206;padding:.5rem 1rem;text-align:center;font-weight:600;font-size:.9rem">
  Static preview · dynamic admin, weather, and API features are disabled · <a href="https://github.com/rizzleroc/gravity-construction" style="color:#1a1206;text-decoration:underline">source</a>
</div>`);

  write('index.html', rewritePaths(html));
}

// ---------- API snapshots (weather + instagram) ----------
async function buildApiSnapshots() {
  console.log('\n[5b/6] Writing API snapshots (weather, instagram)…');
  const weather = await fetchWeatherSnapshot();
  write('api/weather.json', JSON.stringify(weather, null, 2));

  // Instagram: script.js expects rows with a `url` field (IG permalink).
  const igOut = igPosts.map(p => ({
    id: p.id,
    url: p.url,
    caption: p.caption || '',
  }));
  write('api/instagram.json', JSON.stringify(igOut, null, 2));
}

// ---------- 404 page ----------
function build404() {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<title>404 — Gravity Construction</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="/styles.css"/>
</head><body style="background:#0d1418;color:#f2f4f2;font-family:Inter,system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;text-align:center;padding:2rem">
<div>
<h1 style="font-family:'Barlow Condensed',sans-serif;font-size:4rem;margin:0">404</h1>
<p>That page isn't here. <a href="/" style="color:#f5a524">Back to home →</a></p>
</div></body></html>`;
  write('404.html', rewritePaths(html));
}

// ---------- .nojekyll (so folders starting with _ are served) ----------
function writeNoJekyll() { write('.nojekyll', ''); }

// ---------- Main ----------
(async () => {
  await buildDeepPages();
  prerenderHome();
  await buildApiSnapshots();
  console.log('\n[6/6] Writing 404 + .nojekyll…');
  build404();
  writeNoJekyll();

  console.log(`\n✓ Built to ${DIST}`);
  console.log(`  Services: ${services.length}  ·  Areas: ${areas.length}  ·  Posts: ${posts.length}  ·  Projects: ${projects.length}`);
})().catch(err => {
  console.error('\n✗ Build failed:', err);
  process.exit(1);
});
