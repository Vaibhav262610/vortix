async function runVisibleWorkflow({ initialFrame, decide, act, observe, isCancelled = () => false,
  onFrame = () => {}, pause = ms => new Promise(resolve => setTimeout(resolve, ms)), maxSteps = 10 }) {
  let frame = initialFrame;
  for (let step = 0; step < maxSteps; step++) {
    if (isCancelled()) throw new Error('Workflow cancelled.');
    const decision = await decide(frame, step);
    if (decision?.frame) {
      frame = decision.frame;
      onFrame(frame);
    }
    if (isCancelled()) throw new Error('Workflow cancelled.');
    if (decision?.type === 'done') return { frame, value: decision.value };
    if (decision?.type === 'stop') throw new Error(decision.reason || 'The screen did not match the requested task.');
    if (decision?.type === 'wait' && Number.isInteger(decision.ms) && decision.ms >= 0 && decision.ms <= 5000) {
      await pause(decision.ms);
      if (isCancelled()) throw new Error('Workflow cancelled.');
      frame = await observe();
    } else if (decision?.type === 'act' && typeof decision.action === 'string') {
      frame = await act(decision.action, decision.value);
    } else {
      throw new Error('The screen action planner returned an invalid step.');
    }
    onFrame(frame);
  }
  throw new Error('The screen-aware workflow reached its step limit.');
}

module.exports = { runVisibleWorkflow };
