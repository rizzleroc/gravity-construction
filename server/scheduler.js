// In-process scheduler for the "auto-publish" post release flow.
//
// Runs once at boot + every hour after. Finds any post with published=0 and
// published_at <= now(), flips published=1. That's it.
//
// Why in-process instead of a system cron:
//   - One less deployment concern (no crontab, no systemd timer to keep in sync)
//   - Logs go to the same journal as the rest of the app
//   - Survives PM2 restarts because it's part of the app
//
// SQLite handles concurrent access via WAL, so running this alongside the web
// request path is safe. Scale caveat: don't run multiple Node instances — the
// scheduler would publish the same row in each. Since SQLite forces single-box
// anyway, not a concern for Gravity.

const db = require('./db');

const HOUR = 60 * 60 * 1000;

// Prepared once, reused
const releaseStmt = db.prepare(`
  UPDATE posts
     SET published = 1
   WHERE published = 0
     AND published_at IS NOT NULL
     AND datetime(published_at) <= datetime('now')
`);

function runOnce() {
  try {
    const info = releaseStmt.run();
    if (info.changes > 0) {
      console.log(`[scheduler] auto-published ${info.changes} scheduled post(s)`);
    }
    return info.changes;
  } catch (err) {
    console.error('[scheduler] run failed:', err.message);
    return 0;
  }
}

function start() {
  // Run immediately on boot, then hourly.
  runOnce();
  const handle = setInterval(runOnce, HOUR);
  // Don't keep the event loop alive just for this timer — if the server is
  // shutting down, let it.
  if (handle.unref) handle.unref();
  return handle;
}

module.exports = { start, runOnce };
