const express = require('express');
const path = require('path');

const db = require('../db');
const { verifyPassword, getUserByEmail, getUserById, requireAuth, redirectIfAuthed } = require('../auth');
const twofa = require('../twofa');

// Sub-routers for each content module
const specialsRouter     = require('./admin/specials');
const eventsRouter       = require('./admin/events');
const projectsRouter     = require('./admin/projects');
const testimonialsRouter = require('./admin/testimonials');
const postsRouter        = require('./admin/posts');
const instagramRouter    = require('./admin/instagram');

// Pending-2FA state stashed in the session survives for this many minutes.
// After that, the user has to re-enter email+password.
const PENDING_TTL_MS = 10 * 60 * 1000;

module.exports = (loginLimiter) => {
  const router = express.Router();

  // Expose admin.css (served from /admin/admin.css so relative to this subtree)
  router.use('/admin.css', express.static(path.join(__dirname, '..', 'public', 'admin.css')));

  // ---------- Step 1: email + password ----------
  router.get('/login', redirectIfAuthed, (req, res) => {
    res.render('login', {
      title: 'Sign in',
      flash: req.session.flash,
      email: '',
    });
    req.session.flash = null;
  });

  router.post('/login', loginLimiter, async (req, res, next) => {
    try {
      const { email = '', password = '' } = req.body;
      const user = getUserByEmail(email);
      const ok = user ? await verifyPassword(password, user.password_hash) : false;
      if (!ok) {
        req.session.flash = { type: 'error', message: 'Invalid email or password.' };
        return res.status(401).render('login', {
          title: 'Sign in',
          flash: req.session.flash,
          email,
        });
      }

      // Password correct. Now decide whether to require 2FA.
      //  - 2FA configured globally (Twilio envs present) AND user has a phone:
      //    pending step, send code, redirect to /admin/verify.
      //  - Either missing: log in directly (keeps dev + any pre-existing admin
      //    without a phone from getting locked out).
      const need2fa = twofa.isConfigured && user.phone;

      if (!need2fa) {
        return req.session.regenerate((err) => {
          if (err) return next(err);
          req.session.userId = user.id;
          const dest = req.session.returnTo || '/admin';
          delete req.session.returnTo;
          res.redirect(dest);
        });
      }

      // Send the code via Twilio Verify
      const sent = await twofa.sendCode(user.phone);
      if (!sent.ok) {
        req.session.flash = { type: 'error', message: sent.error || 'Could not send code.' };
        return res.status(502).render('login', {
          title: 'Sign in',
          flash: req.session.flash,
          email,
        });
      }

      // Stash pending state. Don't set userId yet — requireAuth must not let
      // them in until the code is verified. Regenerate so the pending state
      // can't ride on a pre-login cookie.
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.pending2fa = {
          userId: user.id,
          phoneHint: maskPhone(user.phone),
          expiresAt: Date.now() + PENDING_TTL_MS,
        };
        // Preserve the original destination if one was stored before regenerate
        // (note: regenerate wipes it; but pending2fa is the only cookie that
        // survives, so carry returnTo inside it).
        const returnTo = req.body.returnTo || null;
        if (returnTo) req.session.pending2fa.returnTo = returnTo;
        res.redirect('/admin/verify');
      });
    } catch (err) { next(err); }
  });

  // ---------- Step 2: OTP verification ----------
  router.get('/verify', (req, res) => {
    const pending = req.session.pending2fa;
    if (!pending || pending.expiresAt < Date.now()) {
      req.session.pending2fa = null;
      req.session.flash = { type: 'error', message: 'Please sign in again.' };
      return res.redirect('/admin/login');
    }
    res.render('verify', {
      title: 'Verify',
      phoneHint: pending.phoneHint,
      flash: req.session.flash,
    });
    req.session.flash = null;
  });

  router.post('/verify', loginLimiter, async (req, res, next) => {
    try {
      const pending = req.session.pending2fa;
      if (!pending || pending.expiresAt < Date.now()) {
        req.session.pending2fa = null;
        req.session.flash = { type: 'error', message: 'Your sign-in expired. Start over.' };
        return res.redirect('/admin/login');
      }

      const user = getUserById(pending.userId);
      if (!user) {
        req.session.pending2fa = null;
        return res.redirect('/admin/login');
      }

      // Need the raw phone from DB for the check (pending has only a mask)
      const row = db.prepare('SELECT phone FROM users WHERE id = ?').get(user.id);
      const check = await twofa.checkCode(row && row.phone, req.body.code);

      if (!check.ok) {
        req.session.flash = { type: 'error', message: check.error || 'Bad code.' };
        return res.status(401).render('verify', {
          title: 'Verify',
          phoneHint: pending.phoneHint,
          flash: req.session.flash,
        });
      }

      // Fully authenticate. Regenerate once more so the pending-state session
      // id can never be replayed.
      const returnTo = pending.returnTo || '/admin';
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = user.id;
        res.redirect(returnTo);
      });
    } catch (err) { next(err); }
  });

  // Allow resending the OTP (new Twilio Verification) — rate-limited like login.
  router.post('/verify/resend', loginLimiter, async (req, res, next) => {
    try {
      const pending = req.session.pending2fa;
      if (!pending || pending.expiresAt < Date.now()) {
        return res.redirect('/admin/login');
      }
      const row = db.prepare('SELECT phone FROM users WHERE id = ?').get(pending.userId);
      const sent = await twofa.sendCode(row && row.phone);
      req.session.flash = sent.ok
        ? { type: 'success', message: 'A new code is on its way.' }
        : { type: 'error',   message: sent.error || 'Could not resend code.' };
      res.redirect('/admin/verify');
    } catch (err) { next(err); }
  });

  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('gcsid');
      res.redirect('/admin/login');
    });
  });

  // ---------- Everything below requires auth ----------
  router.use(requireAuth);

  // Make user + currentPath available to every rendered view
  router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.currentPath = req.baseUrl + req.path.replace(/\/$/, '');
    res.locals.flash = req.session.flash || null;
    req.session.flash = null;
    next();
  });

  // ---------- Dashboard ----------
  router.get('/', (req, res) => {
    const counts = {
      specials:     db.prepare(`SELECT COUNT(*) AS n FROM specials WHERE active = 1`).get().n,
      events:       db.prepare(`SELECT COUNT(*) AS n FROM events WHERE active = 1 AND datetime(starts_at) >= datetime('now', '-1 day')`).get().n,
      projects:     db.prepare(`SELECT COUNT(*) AS n FROM projects WHERE featured = 1 AND published = 1`).get().n,
      testimonials: db.prepare(`SELECT COUNT(*) AS n FROM testimonials WHERE published = 1`).get().n,
      posts:        db.prepare(`SELECT COUNT(*) AS n FROM posts WHERE published = 1`).get().n,
      instagram:    db.prepare(`SELECT COUNT(*) AS n FROM instagram_posts WHERE published = 1`).get().n,
    };
    res.render('dashboard', { title: 'Dashboard', counts });
  });

  // ---------- Module routers ----------
  router.use('/specials',     specialsRouter);
  router.use('/events',       eventsRouter);
  router.use('/projects',     projectsRouter);
  router.use('/testimonials', testimonialsRouter);
  router.use('/posts',        postsRouter);
  router.use('/instagram',    instagramRouter);

  return router;
};

// Show only last 2 digits of the phone number so the user knows which device
// to check but the hint is safe to render in logs / on-screen.
function maskPhone(e164) {
  if (!e164) return '';
  const digits = e164.replace(/\D/g, '');
  if (digits.length < 4) return '•••';
  return '•••-•••-••' + digits.slice(-2);
}
