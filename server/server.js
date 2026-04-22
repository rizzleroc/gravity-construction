// Load environment variables. We look in three places, in this order:
//   1. server/.env          — committed-shape `.env` for this subproject
//   2. server/.env.local    — local overrides (gitignored)
//   3. ../.env.local        — project-root secrets (where Twilio creds live)
// Later files DON'T override earlier ones (dotenv's default behavior), so the
// most-specific file wins by being loaded first.
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const db = require('./db');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const weatherRoutes = require('./routes/weather');
const seoRoutes = require('./routes/seo');
const pagesRoutes = require('./routes/pages');
const { prerender } = require('./prerender');
const scheduler = require('./scheduler');

const app = express();
const PORT = Number(process.env.PORT || 5435);
const IS_PROD = process.env.NODE_ENV === 'production';

// ---------- Core middleware ----------
app.set('trust proxy', 1); // behind Nginx on the VPS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: false, // we render some inline styles in the admin — loosen later
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-change-me',
  name: 'gcsid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
  },
}));

// Serve uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), {
  maxAge: '7d',
  fallthrough: true,
}));

// SEO routes — sitemap.xml, robots.txt (must come before static so they override any file)
app.use('/', seoRoutes);

// Deep public pages — /services, /areas, /blog, /projects/:slug.
// Mounted BEFORE the static middleware so these routes aren't shadowed by
// any static file with a similar path.
app.use('/', pagesRoutes);

// Server-side prerender the homepage so the dynamic sections
// (projects, testimonials, events, blog, specials) are in the initial HTML.
// This is the single biggest SEO win — search engines see the content without
// needing to execute JS, and no-JS visitors still see a fully populated page.
app.get(['/', '/index.html'], (req, res, next) => {
  try {
    const html = prerender();
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', IS_PROD ? 'public, max-age=60' : 'no-store');
    res.send(html);
  } catch (err) {
    console.error('[prerender]', err);
    next(); // fall through to static index.html if prerender fails
  }
});

// Serve the static frontend (index.html, styles.css, etc.) from the parent folder
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: IS_PROD ? '1h' : 0,
  index: 'index.html',
}));

// ---------- Rate limits ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts. Try again in 15 minutes.',
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------- Routes ----------
app.use('/api/weather', apiLimiter, weatherRoutes);
app.use('/api', apiLimiter, apiRoutes);
app.use('/admin', adminRoutes(loginLimiter));

// Health check
app.get('/healthz', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ---------- Error handling ----------
app.use((err, req, res, next) => {
  console.error('[error]', err);
  if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/admin/api')) {
    return res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
  res.status(err.status || 500).render('error', { error: err, title: 'Error' });
});

app.listen(PORT, () => {
  const userCount = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
  console.log(`Gravity CMS listening on http://localhost:${PORT}  (users: ${userCount})`);
  if (userCount === 0) {
    console.log('No admin users yet. Create one with:');
    console.log('  npm run create-admin -- <email> "<name>" <password>');
  }
  // Start the hourly "release scheduled posts" loop. Runs once immediately,
  // then every hour. No external cron required.
  scheduler.start();
});
