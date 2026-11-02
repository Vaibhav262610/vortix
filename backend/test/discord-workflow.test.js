const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mayBeDiscordMessage, extractDiscordMessage, verifyDiscordScreen, waitForDiscordSearch } = require('../lib/discord-workflow');

test('Discord requests preserve the explicit recipient and message', async () => {
  assert.equal(mayBeDiscordMessage('open Discord and text my friend claveb07 hello'), true);
  const calls = [];
  const client = { post: async (_url, body) => {
    calls.push(body);
    return { data: { choices: [{ message: { content: '{"recipient":"claveb07","message":"hello"}' } }] } };
  } };
  assert.deepEqual(await extractDiscordMessage('open Discord and text my friend claveb07 hello', 'test-key', client),
    { recipient: 'claveb07', message: 'hello' });
  assert.equal(calls[0].model, 'openai/gpt-oss-120b');
});

test('screen verification uses a vision model and treats ambiguous screens as failure', async () => {
  const client = { post: async (_url, body) => {
    assert.match(body.model, /^qwen\/qwen3/);
    assert.match(body.messages[1].content[1].image_url.url, /^data:image\/jpeg;base64,/);
    return { data: { choices: [{ message: { content: '{"ok":false,"reason":"Recipient not visible"}' } }] } };
  } };
  assert.deepEqual(await verifyDiscordScreen('open', 'claveb07', 'hello', 'aGVsbG8=', 'test-key', client),
    { ok: false, loading: false, reason: 'Recipient not visible' });
});

test('search waits for Discord to finish loading before it fails', async () => {
  const seen = [];
  const result = await waitForDiscordSearch('loading-frame', 'claven07', 'hello', 'key',
    async () => 'result-frame', {
      verify: async (_stage, _recipient, _message, frame) => {
        seen.push(frame);
        return frame === 'loading-frame'
          ? { ok: false, loading: false, reason: "Search results area says 'Searching All Users'" }
          : { ok: true, loading: false, reason: 'Exact username is visible' };
      },
      pause: async ms => { assert.equal(ms, 1500); },
    });
  assert.deepEqual(seen, ['loading-frame', 'result-frame']);
  assert.equal(result.check.ok, true);
  assert.equal(result.frame, 'result-frame');
});

test('search does not retry a completed search with the wrong recipient', async () => {
  let observations = 0;
  const result = await waitForDiscordSearch('frame', 'claven07', 'hello', 'key',
    async () => { observations++; return 'later'; }, {
      verify: async () => ({ ok: false, loading: false, reason: 'Only another username is visible' }),
      pause: async () => {},
    });
  assert.equal(observations, 0);
  assert.equal(result.check.ok, false);
});

test('recipient or message changed by AI is rejected', async () => {
  const wrongRecipient = { post: async () => ({ data: { choices: [{ message: { content:
    '{"recipient":"claven07","message":"hello"}' } }] } }) };
  await assert.rejects(extractDiscordMessage('message claveb07 hello on Discord', 'test-key', wrongRecipient),
    /username does not exactly match/);
  const wrongMessage = { post: async () => ({ data: { choices: [{ message: { content:
    '{"recipient":"claveb07","message":"hi"}' } }] } }) };
  await assert.rejects(extractDiscordMessage('message claveb07 hello on Discord', 'test-key', wrongMessage),
    /message does not exactly match/);
});
