const { test } = require('node:test');
const assert = require('node:assert/strict');
const { decodeRecording, transcribeRecording } = require('../lib/voice');

const audio = Buffer.alloc(1500, 7).toString('base64');

test('voice recording rejects unsupported or oversized input', () => {
  assert.throws(() => decodeRecording('text/plain', audio), /unsupported/);
  assert.throws(() => decodeRecording('audio/webm', 'not base64!'), /unsupported/);
  assert.throws(() => decodeRecording('audio/webm', Buffer.alloc(6_000_001).toString('base64')), /unsupported|too large/);
});

test('voice transcription sends authenticated audio and returns a bounded transcript', async () => {
  const result = await transcribeRecording({ mime: 'audio/webm;codecs=opus', audio }, 'test-key',
    async (url, options) => {
      assert.match(url, /\/audio\/transcriptions$/);
      assert.equal(options.headers.Authorization, 'Bearer test-key');
      assert.equal(options.body.get('model'), 'whisper-large-v3-turbo');
      assert.equal(options.body.get('file').size, 1500);
      return { ok: true, json: async () => ({ text: '  open Discord  ' }) };
    });
  assert.equal(result, 'open Discord');
});

test('voice transcription reports the Groq retry time', async () => {
  await assert.rejects(transcribeRecording({ mime: 'audio/webm', audio }, 'test-key',
    async () => ({ ok: false, status: 429, headers: { get: () => '18' } })),
  /about 18 seconds/);
});
