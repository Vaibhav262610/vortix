const { test } = require('node:test');
const assert = require('node:assert/strict');
const { discordAction, desktopErrorMessage } = require('../desktop-control');

test('desktop action validates text before sending input', async () => {
  await assert.rejects(discordAction('draft', 'line one\nline two'), /Multiline/);
  await assert.rejects(discordAction('find', 'bad username'), /Invalid recipient/);
  await assert.rejects(discordAction('open'), /Invalid recipient/);
  await assert.rejects(discordAction('select', { x: -1, y: 500 }), /Invalid Discord click location/);
  await assert.rejects(discordAction('select', { x: 500, y: 1001 }), /Invalid Discord click location/);
});

test('PowerShell CLIXML errors are reduced to a useful message', () => {
  assert.equal(desktopErrorMessage('#< CLIXML<Obj S="progress"/><S S="Error">VORTIX_DESKTOP_ERROR:Discord did not open a visible window._x000D__x000A_</S>', {}),
    'Discord did not open a visible window.');
  assert.equal(desktopErrorMessage('#< CLIXML<Obj S="progress"/>', {}),
    'Desktop automation failed. Open Discord on this computer and try again.');
});
