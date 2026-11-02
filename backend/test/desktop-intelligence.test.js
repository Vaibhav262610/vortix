const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseDesktopDecision, decideDesktopStep } = require('../lib/desktop-intelligence');

test('desktop decisions accept terminal input and reject unsafe shapes', () => {
  assert.deepEqual(parseDesktopDecision({ action: 'type', text: '/status', submit: true }), {
    action: 'type', text: '/status', submit: true, reason: 'Typing in the active window' });
  assert.throws(() => parseDesktopDecision({ action: 'type', text: 'x\nEnter', submit: true }), /invalid text/);
  assert.throws(() => parseDesktopDecision({ action: 'launch', app: 'powershell.exe -Command bad' }), /invalid app/);
  assert.throws(() => parseDesktopDecision({ action: 'click', x: 1200, y: 500 }), /invalid position/);
});

test('screen planner grounds the next terminal step in the latest frame', async () => {
  let request;
  const client = { post: async (_url, body) => {
    request = body;
    return { data: { choices: [{ message: { content: JSON.stringify({
      action: 'type', text: '/status', submit: true, reason: 'Codex prompt is ready.' }) } }] } };
  } };
  const result = await decideDesktopStep('Open PowerShell, start Codex, and enter /status',
    { frame: 'YWJj', title: 'Windows PowerShell', process: 'WindowsTerminal' },
    ['launch: PowerShell opened', 'type: Codex started'], 'test-key', client);
  assert.equal(result.action, 'type');
  assert.equal(result.text, '/status');
  assert.match(request.messages[1].content[0].text, /Codex started/);
  assert.match(request.messages[0].content, /latest screenshot visibly proves/);
});
