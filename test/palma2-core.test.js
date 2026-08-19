import test from 'node:test';
import assert from 'node:assert/strict';

async function loadCore() {
  try {
    return await import('../src/assets/palma2-core.js');
  } catch (error) {
    assert.fail(`Palma 2 interaction core is unavailable: ${error.message}`);
  }
}

test('left edge tap requests previous screen', async () => {
  const { classifyTap } = await loadCore();
  assert.equal(classifyTap({ startX: 40, endX: 43, startY: 300, endY: 303, width: 400 }), 'screen-up');
});

test('right edge tap requests next screen', async () => {
  const { classifyTap } = await loadCore();
  assert.equal(classifyTap({ startX: 360, endX: 356, startY: 300, endY: 302, width: 400 }), 'screen-down');
});

test('middle tap does not navigate', async () => {
  const { classifyTap } = await loadCore();
  assert.equal(classifyTap({ startX: 200, endX: 201, startY: 300, endY: 301, width: 400 }), null);
});

test('vertical swipe does not trigger page navigation', async () => {
  const { classifyTap } = await loadCore();
  assert.equal(classifyTap({ startX: 35, endX: 39, startY: 200, endY: 275, width: 400 }), null);
});

test('large horizontal movement does not count as a tap', async () => {
  const { classifyTap } = await loadCore();
  assert.equal(classifyTap({ startX: 30, endX: 110, startY: 200, endY: 204, width: 400 }), null);
});

test('interactive targets are excluded from tap navigation', async () => {
  const { shouldIgnoreTarget } = await loadCore();
  assert.equal(shouldIgnoreTarget({ closest: (selector) => selector.includes('a') ? {} : null }), true);
});

test('plain content can use tap navigation', async () => {
  const { shouldIgnoreTarget } = await loadCore();
  assert.equal(shouldIgnoreTarget({ closest: () => null }), false);
});

test('explicit Palma 2 query enables the mode', async () => {
  const { resolveMode } = await loadCore();
  assert.equal(resolveMode({ search: '?mode=palma2', stored: 'standard' }), true);
});

test('explicit standard query disables the mode', async () => {
  const { resolveMode } = await loadCore();
  assert.equal(resolveMode({ search: '?mode=standard', stored: 'palma2' }), false);
});

test('stored Palma 2 preference is restored without a query override', async () => {
  const { resolveMode } = await loadCore();
  assert.equal(resolveMode({ search: '', stored: 'palma2' }), true);
});
