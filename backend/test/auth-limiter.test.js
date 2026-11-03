const { test } = require('node:test');
const assert = require('node:assert/strict');
const { clientAddress } = require('../lib/auth-limiter');

test('auth limits ignore spoofed X-Forwarded-For and use Render edge address only on Render', () => {
  const originalRender = process.env.RENDER;
  const originalType = process.env.RENDER_SERVICE_TYPE;
  const req = { headers: { 'x-forwarded-for': '203.0.113.10', 'cf-connecting-ip': '198.51.100.20' },
    socket: { remoteAddress: '127.0.0.1' } };
  try {
    delete process.env.RENDER;
    assert.equal(clientAddress(req), clientAddress({ ...req, headers: {}, socket: req.socket }));
    process.env.RENDER = 'true';
    process.env.RENDER_SERVICE_TYPE = 'web';
    assert.notEqual(clientAddress(req), clientAddress({ ...req, headers: { 'cf-connecting-ip': '198.51.100.21' } }));
    assert.equal(clientAddress(req), clientAddress({ ...req, headers: { 'cf-connecting-ip': '198.51.100.20', 'x-forwarded-for': '1.2.3.4' } }));
  } finally {
    if (originalRender === undefined) delete process.env.RENDER; else process.env.RENDER = originalRender;
    if (originalType === undefined) delete process.env.RENDER_SERVICE_TYPE; else process.env.RENDER_SERVICE_TYPE = originalType;
  }
});
