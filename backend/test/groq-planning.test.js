const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectGroqKey, generateGroqPlan } = require('../lib/groq-planning');

test('Render key takes precedence over a browser key', () => {
  assert.equal(selectGroqKey('  server-key  ', 'browser-key'), 'server-key');
  assert.equal(selectGroqKey('', '  browser-key '), 'browser-key');
});

test('Groq request uses a supported model, exact bearer header, and structured output', async () => {
  let request;
  const client = {
    post: async (url, body, options) => {
      request = { url, body, options };
      return { data: { choices: [{ message: { content: '{"steps":[{"command":"dir"}]}' } }] } };
    },
  };

  const plan = await generateGroqPlan('List files', 'test-key', client);
  assert.deepEqual(plan, { steps: [{ command: 'dir' }] });
  assert.equal(request.url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(request.body.model, 'openai/gpt-oss-120b');
  assert.equal(request.body.response_format.json_schema.strict, true);
  assert.equal(request.options.headers.Authorization, 'Bearer test-key');
});

test('Groq errors remain actionable', async () => {
  const client = {
    post: async () => {
      const error = new Error('Request failed');
      error.response = { status: 429, data: { error: { message: 'Rate limit reached' } } };
      throw error;
    },
  };
  await assert.rejects(generateGroqPlan('Test', 'key', client), /rate limit reached/i);
});

test('empty plans are rejected before reaching the dashboard', async () => {
  const client = { post: async () => ({ data: { choices: [{ message: { content: '{"steps":[]}' } }] } }) };
  await assert.rejects(generateGroqPlan('Test', 'key', client), /invalid command plan/i);
});
