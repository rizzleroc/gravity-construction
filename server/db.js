const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'gravity.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- Schema ----------
// Using IF NOT EXISTS so this file is safe to require on every boot.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'admin',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS specials (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    body        TEXT,                        -- short HTML description
    cta_label   TEXT,                        -- e.g. "Claim this offer"
    cta_href    TEXT,                        -- e.g. "#contact" or "tel:+1..."
    starts_at   TEXT,                        -- ISO date; null = no start bound
    ends_at     TEXT,                        -- ISO date; null = no end bound
    active      INTEGER NOT NULL DEFAULT 1,  -- 0/1 manual kill switch
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    location    TEXT,                        -- e.g. "Downtown Santa Cruz"
    starts_at   TEXT NOT NULL,               -- ISO datetime
    ends_at     TEXT,
    url         TEXT,                        -- external link (optional)
    description TEXT,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT NOT NULL,
    slug         TEXT NOT NULL UNIQUE,
    location     TEXT,                       -- "Capitola", "Aptos", etc.
    scope        TEXT,                       -- short tag: "Kitchen remodel"
    summary      TEXT,                       -- 1-2 sentence teaser
    body         TEXT,                       -- sanitized HTML
    hero_image   TEXT,                       -- /uploads/xxx.jpg
    testimonial  TEXT,                       -- optional client quote
    client_name  TEXT,
    featured     INTEGER NOT NULL DEFAULT 0,
    published    INTEGER NOT NULL DEFAULT 1,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS project_images (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path       TEXT NOT NULL,
    alt        TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    quote       TEXT NOT NULL,
    author      TEXT NOT NULL,
    location    TEXT,
    rating      INTEGER,                     -- 1-5 or null
    project_id  INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    published   INTEGER NOT NULL DEFAULT 1,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT NOT NULL,
    slug         TEXT NOT NULL UNIQUE,
    excerpt      TEXT,
    body         TEXT,                       -- sanitized HTML
    hero_image   TEXT,
    author_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    published    INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS instagram_posts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    url         TEXT NOT NULL,
    caption     TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    published   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
  CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured, published);
  CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, published_at);
`);

// ---------- Touch triggers ----------
const makeUpdatedAtTrigger = (table) => `
  CREATE TRIGGER IF NOT EXISTS trg_${table}_updated_at
  AFTER UPDATE ON ${table}
  FOR EACH ROW
  BEGIN
    UPDATE ${table} SET updated_at = datetime('now') WHERE id = OLD.id;
  END;
`;
['specials', 'events', 'projects', 'posts'].forEach(t => db.exec(makeUpdatedAtTrigger(t)));

// ---------- Lightweight migrations ----------
// SQLite has no "ADD COLUMN IF NOT EXISTS", so we introspect and guard manually.
// Each migration is idempotent.
function columnExists(table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some(c => c.name === column);
}

// users.phone — E.164 phone number for Twilio Verify 2FA.
// Nullable so existing admins aren't locked out; 2FA is skipped when empty.
if (!columnExists('users', 'phone')) {
  db.exec(`ALTER TABLE users ADD COLUMN phone TEXT`);
  console.log('[db] migration: added users.phone');
}

module.exports = db;
