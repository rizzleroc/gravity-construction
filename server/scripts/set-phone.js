#!/usr/bin/env node
// Set (or clear) the E.164 phone number on an admin user. Used to enable 2FA.
//
// Usage:
//   node scripts/set-phone.js <email> <+1XXXXXXXXXX>     # set
//   node scripts/set-phone.js <email> clear              # unset (disables 2FA)
//
// Examples:
//   node scripts/set-phone.js damien@gravityconstructionsc.com +18312344669
//   node scripts/set-phone.js damien@gravityconstructionsc.com clear
//
// 2FA is only enforced when BOTH of these are true:
//   - Twilio env vars (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_MESSAGING_SERVICE_SID)
//     are set at boot time
//   - The user has a non-null `phone` column

require('dotenv').config();
const db = require('../db');

const [, , email, phoneArg] = process.argv;

if (!email || !phoneArg) {
  console.error('Usage:');
  console.error('  node scripts/set-phone.js <email> <+1XXXXXXXXXX>');
  console.error('  node scripts/set-phone.js <email> clear');
  process.exit(1);
}

const row = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email.toLowerCase().trim());
if (!row) {
  console.error(`No user with email ${email}`);
  process.exit(1);
}

let newPhone;
if (phoneArg === 'clear' || phoneArg === 'null' || phoneArg === 'off') {
  newPhone = null;
} else {
  if (!/^\+[1-9]\d{7,14}$/.test(phoneArg)) {
    console.error('Phone must be E.164 format, e.g. +18312344669 (no spaces, no dashes).');
    process.exit(1);
  }
  newPhone = phoneArg;
}

db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(newPhone, row.id);
if (newPhone) {
  console.log(`Set phone for ${row.email} to ${newPhone}. 2FA is now ON (if Twilio env vars are set).`);
} else {
  console.log(`Cleared phone for ${row.email}. 2FA is now OFF for this user.`);
}
