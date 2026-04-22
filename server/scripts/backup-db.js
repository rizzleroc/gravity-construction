// WAL-safe SQLite backup using better-sqlite3's online backup API.
// Tar-ing a WAL-mode .db file mid-write can produce a corrupt snapshot —
// this uses SQLite's own backup machinery, which is safe while the server
// is running.
//
// Usage:  node scripts/backup-db.js [destination-dir]
// Default dest:  /var/backups/gravity  (falls back to ./backups if not writable)
//
// Drop this into cron.daily or hook into a system-level scheduler:
//   0 3 * * *  gravity  cd /opt/gravity/server && /usr/bin/node scripts/backup-db.js >> /var/log/gravity-backup.log 2>&1

const fs = require('fs');
const path = require('path');
const db = require('../db');

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function resolveDest() {
  const arg = process.argv[2];
  if (arg) return arg;
  const preferred = '/var/backups/gravity';
  try {
    fs.mkdirSync(preferred, { recursive: true });
    fs.accessSync(preferred, fs.constants.W_OK);
    return preferred;
  } catch (_err) {
    const fallback = path.join(__dirname, '..', 'backups');
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

async function main() {
  const dest = resolveDest();
  const file = path.join(dest, `gravity-${timestamp()}.db`);
  console.log(`[backup] target: ${file}`);

  await db.backup(file); // better-sqlite3 online-backup API

  // Retention: keep the last 30 backups, delete older ones
  const backups = fs.readdirSync(dest)
    .filter(n => /^gravity-\d{8}-\d{4}\.db$/.test(n))
    .map(n => ({ name: n, mtime: fs.statSync(path.join(dest, n)).mtime.getTime() }))
    .sort((a, b) => b.mtime - a.mtime);

  const stale = backups.slice(30);
  for (const b of stale) {
    fs.unlinkSync(path.join(dest, b.name));
    console.log(`[backup] removed old: ${b.name}`);
  }

  console.log(`[backup] done. ${backups.length - stale.length} backups retained.`);
}

main().catch(err => {
  console.error('[backup] FAILED:', err);
  process.exit(1);
});
