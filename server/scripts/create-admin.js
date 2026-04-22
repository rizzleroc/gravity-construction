#!/usr/bin/env node
// Usage: node scripts/create-admin.js <email> <name> <password>
// Example: node scripts/create-admin.js damien@gravityconstruction.com "Damien Hollinga" MyS3curePass!

const { createUser, getUserByEmail } = require('../auth');

const [, , email, name, password] = process.argv;

if (!email || !name || !password) {
  console.error('Usage: node scripts/create-admin.js <email> <name> <password>');
  process.exit(1);
}
if (password.length < 10) {
  console.error('Password must be at least 10 characters.');
  process.exit(1);
}
if (getUserByEmail(email)) {
  console.error(`User ${email} already exists.`);
  process.exit(1);
}

createUser({ email, name, password, role: 'admin' })
  .then(user => {
    console.log(`Created admin: ${user.email} (id=${user.id})`);
  })
  .catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
  });
