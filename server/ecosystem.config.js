// PM2 ecosystem config — alternative to systemd.
// Usage:
//   sudo -u gravity -H bash
//   cd /opt/gravity/server
//   pm2 start ecosystem.config.js --env production
//   pm2 save
//   pm2 startup          # then paste the command it prints (needs sudo)
//
// See DEPLOY.md section 2 for the systemd version (preferred on Ubuntu VPS).
module.exports = {
  apps: [
    {
      name: 'gravity',
      script: './server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',           // SQLite is single-writer — do not cluster
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // PM2 reads .env automatically via dotenv inside server.js, but these
      // defaults are here in case the env file is missing.
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true,
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',
      watch: false,
    },
  ],
};
