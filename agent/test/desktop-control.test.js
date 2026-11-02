const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sendKeysText } = require('../desktop-control');

test('desktop text escapes SendKeys control characters', () => {
  assert.equal(sendKeysText('hi + (you)'), 'hi {+} {(}you{)}');
  assert.throws(() => sendKeysText('line one\nline two'), /Multiline/);
});
