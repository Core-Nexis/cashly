// Verifies a Cashly webhook delivery. Node.js 18+, no dependencies.
// Usage inside any HTTP handler: verifyCashlySignature(rawBody, req.headers['cashly-signature'], secret)

const crypto = require('node:crypto');

const TOLERANCE_SECONDS = 300;

/**
 * Returns true when the Cashly-Signature header matches the raw request body.
 * rawBody must be the exact bytes received, before any JSON parsing.
 */
function verifyCashlySignature(rawBody, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.trim().split('=')));
  const timestamp = Number(parts.t);
  if (!timestamp || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > TOLERANCE_SECONDS) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(parts.v1, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { verifyCashlySignature };
