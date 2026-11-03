const crypto = require('node:crypto');

// Render's Cloudflare edge overwrites CF-Connecting-IP. X-Forwarded-For can
// contain a client-supplied leftmost address, so it must not key auth limits.
function clientAddress(req) {
  const renderAddress = process.env.RENDER === 'true' && process.env.RENDER_SERVICE_TYPE === 'web'
    ? req.headers['cf-connecting-ip'] : '';
  const address = typeof renderAddress === 'string' && renderAddress.length < 80 &&
    /^[0-9a-f:.]+$/i.test(renderAddress) ? renderAddress : req.socket.remoteAddress || 'unknown';
  return crypto.createHash('sha256').update(address).digest('hex');
}

function createAuthLimiter(store) {
  return {
    async blocked(keys) {
      for (const key of keys) if (await store.authAttemptStatus(key)) return true;
      return false;
    },
    async failure(entries) {
      for (const [key, limit] of entries) await store.recordAuthFailure(key, limit);
    },
    async success(key) { await store.clearAuthAttempt(key); },
  };
}

module.exports = { clientAddress, createAuthLimiter };
