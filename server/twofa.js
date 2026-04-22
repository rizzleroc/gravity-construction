// Two-factor authentication via Twilio Verify.
//
// The Twilio Verify service handles OTP generation, SMS delivery, rate limiting,
// and code validation server-side — we never store the code ourselves. That's
// safer than rolling our own.
//
// Expected env vars (loaded from .env.local at project root — see server.js):
//   TWILIO_ACCOUNT_SID            — account SID (starts with AC…)
//   TWILIO_AUTH_TOKEN             — account auth token
//   TWILIO_MESSAGING_SERVICE_SID  — *Verify* Service SID (starts with VA…).
//                                   Despite the name, this is how the user
//                                   labelled it — we read it as the Verify SID.
//   TWILIO_VERIFY_SID             — optional explicit alias for the above
//
// If any are missing, the module exports `isConfigured: false` and every
// operation is a no-op. That lets dev/staging boot without Twilio set up.

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN || '';
// The user labelled their Verify service as MESSAGING_SERVICE_SID, but the VA…
// prefix indicates Twilio Verify. Accept either env var name.
const VERIFY_SID  = process.env.TWILIO_VERIFY_SID
                 || process.env.TWILIO_MESSAGING_SERVICE_SID
                 || '';

const isConfigured = Boolean(ACCOUNT_SID && AUTH_TOKEN && VERIFY_SID);

let client = null;
if (isConfigured) {
  try {
    const twilio = require('twilio');
    client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  } catch (err) {
    console.error('[twofa] failed to init twilio client:', err.message);
  }
}

/**
 * Send a 6-digit SMS code to the given E.164 phone number.
 * Returns { ok: true } on success, { ok: false, error } on failure.
 * Twilio handles the code generation + storage.
 */
async function sendCode(phoneE164) {
  if (!isConfigured || !client) {
    return { ok: false, error: 'Twilio 2FA not configured on this server.' };
  }
  if (!phoneE164 || !/^\+[1-9]\d{7,14}$/.test(phoneE164)) {
    return { ok: false, error: 'Invalid phone number (expected E.164 format, e.g. +18312344669).' };
  }
  try {
    const verification = await client.verify.v2
      .services(VERIFY_SID)
      .verifications
      .create({ to: phoneE164, channel: 'sms' });
    return { ok: true, status: verification.status };
  } catch (err) {
    console.error('[twofa] sendCode failed:', err.code || err.status, err.message);
    return { ok: false, error: 'Could not send verification code. Try again in a moment.' };
  }
}

/**
 * Check a 6-digit code the user typed.
 * Returns { ok: true } if Twilio reports status === 'approved'.
 */
async function checkCode(phoneE164, code) {
  if (!isConfigured || !client) {
    return { ok: false, error: 'Twilio 2FA not configured on this server.' };
  }
  if (!code || !/^\d{4,10}$/.test(String(code).trim())) {
    return { ok: false, error: 'Enter the code Twilio texted you.' };
  }
  try {
    const check = await client.verify.v2
      .services(VERIFY_SID)
      .verificationChecks
      .create({ to: phoneE164, code: String(code).trim() });
    if (check.status === 'approved') return { ok: true };
    return { ok: false, error: 'Incorrect or expired code.' };
  } catch (err) {
    // Twilio returns 404 when the Verification has already been consumed or
    // expired — treat that as a generic "bad code" to the user.
    if (err.status === 404) {
      return { ok: false, error: 'Code expired. Request a new one.' };
    }
    console.error('[twofa] checkCode failed:', err.code || err.status, err.message);
    return { ok: false, error: 'Could not verify the code. Try again.' };
  }
}

module.exports = {
  isConfigured,
  sendCode,
  checkCode,
};
