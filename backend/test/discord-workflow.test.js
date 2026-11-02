const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mayBeDiscordMessage, extractDiscordMessage, verifyDiscordScreen, waitForDiscordSearch, searchCanOpen } = require('../lib/discord-workflow');

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

test('individual user result is accepted beside a similarly named group', async () => {
  const client = { post: async (_url, body) => {
    assert.match(body.messages[1].content[0].text, /optionally prefixed with @/);
    assert.match(body.messages[1].content[0].text, /Ignore separate group conversations/);
    return { data: { choices: [{ message: { content: JSON.stringify({ ok: true, loading: false,
      reason: 'The Claven user result is highlighted; Claven 2 Members is a group.' }) } }] } };
  } };
  const result = await verifyDiscordScreen('find', 'claven07', 'hello', 'aGVsbG8=', 'key', client);
  assert.equal(result.ok, true);
});

test('opened conversation must show the exact account username before drafting', async () => {
  const client = { post: async (_url, body) => {
    assert.match(body.messages[1].content[0].text, /INDIVIDUAL Discord direct-message conversation/);
    assert.match(body.messages[1].content[0].text, /account username claven07/);
    return { data: { choices: [{ message: { content: JSON.stringify({ ok: false,
      loading: false, reason: 'Only display name Claven is visible' }) } }] } };
  } };
  const result = await verifyDiscordScreen('open', 'claven07', 'hello', 'aGVsbG8=', 'key', client);
  assert.equal(result.ok, false);
});

test('a conservative search check can proceed to the exact opened-DM identity check', () => {
  assert.equal(searchCanOpen({ ok: false, loading: false,
    reason: 'Two Claven results, one person and one 2 Members group' }), true);
  assert.equal(searchCanOpen({ ok: false, loading: true, reason: 'Searching All Users' }), false);
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
