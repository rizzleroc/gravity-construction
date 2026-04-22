const bcrypt = require('bcrypt');
const db = require('./db');

const BCRYPT_ROUNDS = 12;

function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
}

function getUserById(id) {
  return db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id);
}

function createUser({ email, name, password, role = 'admin' }) {
  return hashPassword(password).then(hash => {
    const stmt = db.prepare(`
      INSERT INTO users (email, name, password_hash, role)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(email.toLowerCase().trim(), name, hash, role);
    return getUserById(info.lastInsertRowid);
  });
}

// Express middleware — gate /admin routes
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    req.user = getUserById(req.session.userId);
    if (req.user) return next();
  }
  // Preserve where they were trying to go so we can redirect after login
  if (req.method === 'GET') req.session.returnTo = req.originalUrl;
  res.redirect('/admin/login');
}

// Redirect already-logged-in users away from login page
function redirectIfAuthed(req, res, next) {
  if (req.session && req.session.userId && getUserById(req.session.userId)) {
    return res.redirect('/admin');
  }
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  getUserByEmail,
  getUserById,
  createUser,
  requireAuth,
  redirectIfAuthed,
};
