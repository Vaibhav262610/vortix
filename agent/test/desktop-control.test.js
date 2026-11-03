const { test } = require('node:test');
const assert = require('node:assert/strict');
const { discordAction, desktopAction, desktopErrorMessage } = require('../desktop-control');

test('desktop action validates text before sending input', async () => {
  await assert.rejects(discordAction('draft', 'line one\nline two'), /Multiline/);
  await assert.rejects(discordAction('find', 'bad username'), /Invalid recipient/);
  await assert.rejects(discordAction('open'), /Invalid recipient/);
  await assert.rejects(discordAction('select', { x: -1, y: 500 }), /Invalid Discord click location/);
  await assert.rejects(discordAction('select', { x: 500, y: 1001 }), /Invalid Discord click location/);
});

test('generic screen actions reject malformed input before touching the desktop', async () => {
  await assert.rejects(desktopAction('launch', 'powershell.exe -Command test'), /program name/);
  await assert.rejects(desktopAction('type', { text: 'hello\nworld', submit: true }), /Invalid desktop text/);
  await assert.rejects(desktopAction('click', { x: 1500, y: 500 }), /Invalid desktop position/);
  await assert.rejects(desktopAction('key', 'alt+f4'), /Invalid desktop key/);
  await assert.rejects(desktopAction('control', { name: 'Save\nnow', id: '', kind: 'ControlType.Button' }), /Invalid named desktop control/);
  await assert.rejects(desktopAction('control', { name: 'Save', id: '', kind: 'ControlType.Window' }), /Invalid named desktop control/);
});

test('PowerShell CLIXML errors are reduced to a useful message', () => {
  assert.equal(desktopErrorMessage('#< CLIXML<Obj S="progress"/><S S="Error">VORTIX_DESKTOP_ERROR:Discord did not open a visible window._x000D__x000A_</S>', {}),
    'Discord did not open a visible window.');
  assert.equal(desktopErrorMessage('#< CLIXML<Obj S="progress"/>', {}),
    'Desktop automation failed. Check that the app is visible and try again.');
});
