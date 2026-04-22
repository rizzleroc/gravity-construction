// Server-side injection of dynamic sections into the static index.html.
// This makes the content indexable by search engines and visible in no-JS mode,
// while the client-side hydration in script.js keeps things live for interactivity.
//
// It reads index.html once (cached in dev, re-read on each request in prod-lite)
// and replaces hidden placeholder containers with HTML built from the DB.

const fs = require('fs');
const path = require('path');
const db = require('./db');

const INDEX_PATH = path.join(__dirname, '..', 'index.html');
const IS_PROD = process.env.NODE_ENV === 'production';

let cachedHtml = null;
let cachedAt = 0;
const CACHE_MS = IS_PROD ? 60 * 1000 : 0; // re-read in dev every request

function readIndex() {
  const now = Date.now();
  if (cachedHtml && now - cachedAt < CACHE_MS) return cachedHtml;
  cachedHtml = fs.readFileSync(INDEX_PATH, 'utf8');
  cachedAt = now;
  return cachedHtml;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.indexOf('T') > -1 ? iso : iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso.indexOf('T') > -1 ? iso : iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ---------- SQL ----------
const specialsStmt = db.prepare(`
  SELECT id, title, body, cta_label, cta_href
  FROM specials
  WHERE active = 1
    AND (starts_at IS NULL OR datetime(starts_at) <= datetime('now'))
    AND (ends_at   IS NULL OR datetime(ends_at)   >= datetime('now'))
  ORDER BY sort_order ASC, id DESC
`);
const projectsStmt = db.prepare(`
  SELECT id, title, slug, location, scope, summary, hero_image
  FROM projects
  WHERE published = 1 AND featured = 1
  ORDER BY sort_order ASC, id DESC
  LIMIT 6
`);
const testimonialsStmt = db.prepare(`
  SELECT id, quote, author, location, rating
  FROM testimonials
  WHERE published = 1
  ORDER BY sort_order ASC, id DESC
`);
const eventsStmt = db.prepare(`
  SELECT id, title, location, starts_at, url, description
  FROM events
  WHERE active = 1
    AND (datetime(starts_at) >= datetime('now')
         OR (ends_at IS NOT NULL AND datetime(ends_at) >= datetime('now')))
  ORDER BY datetime(starts_at) ASC
  LIMIT 12
`);
const postsStmt = db.prepare(`
  SELECT id, title, slug, excerpt, hero_image, published_at
  FROM posts
  WHERE published = 1
  ORDER BY datetime(published_at) DESC, id DESC
  LIMIT 3
`);

// ---------- Renderers ----------
function renderSpecialsInner(rows) {
  if (!rows.length) return '';
  const s = rows[0];
  const cta = s.cta_label && s.cta_href
    ? ` <a class="specials-cta" href="${esc(s.cta_href)}">${esc(s.cta_label)} →</a>`
    : '';
  return `<div class="specials-inner">` +
    `<strong>${esc(s.title)}</strong>` +
    (s.body ? ` <span class="specials-body">${esc(s.body).replace(/\n+/g, ' ')}</span>` : '') +
    cta +
    `<button type="button" class="specials-close" aria-label="Dismiss">×</button>` +
  `</div>`;
}
function renderProjectsInner(rows) {
  return rows.map(p => {
    const img = p.hero_image
      ? `<div class="pcard-img" role="img" aria-label="${esc(p.title)} — ${esc(p.scope || 'project')}" style="background-image:url(${esc(p.hero_image)})"></div>`
      : `<div class="pcard-img pcard-img-blank"></div>`;
    const tagline = [p.scope, p.location].filter(Boolean).join(' · ');
    return `<article class="pcard">` +
      img +
      `<div class="pcard-body">` +
        (tagline ? `<p class="pcard-tag">${esc(tagline)}</p>` : '') +
        `<h3>${esc(p.title)}</h3>` +
        (p.summary ? `<p class="pcard-summary">${esc(p.summary)}</p>` : '') +
      `</div>` +
    `</article>`;
  }).join('');
}
function renderTestimonialsInner(rows) {
  return rows.map(t => {
    const stars = t.rating
      ? `<span class="t-stars" aria-label="${t.rating} out of 5">` +
        '★'.repeat(t.rating) +
        `<span class="t-stars-empty">${'★'.repeat(5 - t.rating)}</span></span>`
      : '';
    const byline = t.author + (t.location ? ' · ' + t.location : '');
    return `<figure class="tcard">` +
      stars +
      `<blockquote>"${esc(t.quote)}"</blockquote>` +
      `<figcaption>— ${esc(byline)}</figcaption>` +
    `</figure>`;
  }).join('');
}
function renderEventsInner(rows) {
  return rows.map(ev => {
    const when = fmtDateTime(ev.starts_at);
    const title = ev.url
      ? `<a href="${esc(ev.url)}" target="_blank" rel="noopener">${esc(ev.title)}</a>`
      : esc(ev.title);
    return `<li class="event-item">` +
      `<span class="event-when">${esc(when)}</span>` +
      `<div class="event-body">` +
        `<h3>${title}</h3>` +
        (ev.location ? `<p class="event-loc">${esc(ev.location)}</p>` : '') +
        (ev.description ? `<p class="event-desc">${esc(ev.description)}</p>` : '') +
      `</div>` +
    `</li>`;
  }).join('');
}
function renderPostsInner(rows) {
  return rows.map(p => {
    const img = p.hero_image
      ? `<div class="post-img" role="img" aria-label="${esc(p.title)}" style="background-image:url(${esc(p.hero_image)})"></div>`
      : '';
    // Whole card is an anchor — the hero image, date, title, and excerpt all
    // take you to the post page. This is the highest-click-rate pattern for
    // blog grids and it makes the "clickable where?" question obvious.
    const href = `/blog/${esc(p.slug)}`;
    return `<a class="post-card" href="${href}" aria-label="Read: ${esc(p.title)}">` +
      img +
      `<div class="post-body">` +
        `<p class="post-date">${esc(fmtDate(p.published_at))}</p>` +
        `<h3>${esc(p.title)}</h3>` +
        (p.excerpt ? `<p class="post-excerpt">${esc(p.excerpt)}</p>` : '') +
        `<span class="post-more" aria-hidden="true">Read →</span>` +
      `</div>` +
    `</a>`;
  }).join('');
}

// Swap a hidden container's attributes/inner for a populated version.
// Works against the specific markup produced by index.html.
function injectSection(html, openTagRegex, contentId, innerHtml) {
  if (!innerHtml) return html; // leave hidden
  // Remove the `hidden` attribute on the outer section wrapper
  html = html.replace(openTagRegex, m => m.replace(' hidden', ''));
  // Fill the inner container
  const innerRe = new RegExp(`(<[^>]*id=["']${contentId}["'][^>]*>)([\\s\\S]*?)(<\\/[^>]+>)`);
  return html.replace(innerRe, (_full, open, _inner, close) => open + innerHtml + close);
}

// Build the analytics + Search Console verification head snippet from env.
// Returns '' if nothing is configured so dev/staging pages stay clean.
function buildAnalyticsSnippet() {
  const ga = process.env.GA4_MEASUREMENT_ID;
  const gsc = process.env.GSC_VERIFICATION;
  let out = '';
  if (gsc) {
    out += `<meta name="google-site-verification" content="${esc(gsc)}" />`;
  }
  if (ga) {
    out +=
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(ga)}"></script>` +
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}` +
      `gtag('js',new Date());gtag('config','${esc(ga)}',{anonymize_ip:true});</script>`;
  }
  return out;
}

function prerender() {
  let html = readIndex();

  // Inject analytics + GSC verification (env-gated) into <head>
  const analytics = buildAnalyticsSnippet();
  if (analytics) {
    html = html.replace('</head>', analytics + '\n</head>');
  }

  // Specials (aside at top)
  const specials = specialsStmt.all();
  if (specials.length) {
    html = html.replace(
      /<aside class="specials-bar" id="specials-bar" hidden><\/aside>/,
      `<aside class="specials-bar" id="specials-bar">${renderSpecialsInner(specials)}</aside>`
    );
  }

  // Projects
  const projects = projectsStmt.all();
  html = injectSection(
    html,
    /<section class="section section-alt" id="projects" hidden>/,
    'projects-grid',
    renderProjectsInner(projects)
  );

  // Testimonials
  const testimonials = testimonialsStmt.all();
  html = injectSection(
    html,
    /<section class="section" id="testimonials" hidden>/,
    'testimonials-grid',
    renderTestimonialsInner(testimonials)
  );

  // Events (+ reveal nav link when events exist)
  const events = eventsStmt.all();
  if (events.length) {
    html = injectSection(
      html,
      /<section class="section section-alt" id="events" hidden>/,
      'events-list',
      renderEventsInner(events)
    );
    html = html.replace(
      /<li id="nav-events" hidden><a href="#events">Events<\/a><\/li>/,
      '<li id="nav-events"><a href="#events">Events</a></li>'
    );
  }

  // Blog
  const posts = postsStmt.all();
  html = injectSection(
    html,
    /<section class="section" id="blog" hidden>/,
    'posts-grid',
    renderPostsInner(posts)
  );

  return html;
}

module.exports = { prerender };
