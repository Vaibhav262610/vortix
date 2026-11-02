const { test } = require('node:test');
const assert = require('node:assert/strict');
const { runVisibleWorkflow } = require('../lib/visible-workflow');

test('screen loop waits, acts on a visible target, and verifies the next screen', async () => {
  const actions = [];
  let pauses = 0;
  const result = await runVisibleWorkflow({
    initialFrame: 'searching', maxSteps: 4,
    decide: async frame => frame === 'searching' ? { type: 'wait', ms: 1500 }
      : frame === 'result' ? { type: 'act', action: 'select', value: { x: 500, y: 460 } }
      : { type: 'done', value: 'exact user DM' },
    observe: async () => 'result',
    act: async (action, value) => { actions.push([action, value]); return 'conversation'; },
    pause: async ms => { assert.equal(ms, 1500); pauses++; },
  });
  assert.equal(pauses, 1);
  assert.deepEqual(actions, [['select', { x: 500, y: 460 }]]);
  assert.equal(result.value, 'exact user DM');
});

test('screen loop stops on cancellation and step exhaustion', async () => {
  await assert.rejects(runVisibleWorkflow({ initialFrame: 'frame', maxSteps: 1,
    decide: async () => ({ type: 'wait', ms: 0 }), observe: async () => 'frame',
    act: async () => 'frame', pause: async () => {} }), /step limit/);
  await assert.rejects(runVisibleWorkflow({ initialFrame: 'frame',
    isCancelled: () => true, decide: async () => ({ type: 'done' }),
    observe: async () => 'frame', act: async () => 'frame' }), /cancelled/);
});
