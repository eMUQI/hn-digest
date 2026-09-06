import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyTap, pageTurnDistance, resolveMode, shouldIgnoreTarget } from '../src/assets/palma2-core.js';

test('left edge tap requests previous screen', () => {
  assert.equal(classifyTap({ startX: 40, endX: 43, startY: 300, endY: 303, width: 400 }), 'screen-up');
});

test('right edge tap requests next screen', () => {
  assert.equal(classifyTap({ startX: 360, endX: 356, startY: 300, endY: 302, width: 400 }), 'screen-down');
});

test('middle tap does not navigate', () => {
  assert.equal(classifyTap({ startX: 200, endX: 201, startY: 300, endY: 301, width: 400 }), null);
});

test('vertical swipe does not trigger page navigation', () => {
  assert.equal(classifyTap({ startX: 35, endX: 39, startY: 200, endY: 275, width: 400 }), null);
});

test('large horizontal movement does not count as a tap', () => {
  assert.equal(classifyTap({ startX: 30, endX: 110, startY: 200, endY: 204, width: 400 }), null);
});

test('page turn uses 88 percent of viewport height', () => {
  assert.equal(pageTurnDistance(1000), 880);
});

test('interactive targets are excluded from tap navigation', () => {
  assert.equal(shouldIgnoreTarget({ closest: (selector) => selector.includes('a') ? {} : null }), true);
});

test('plain content can use tap navigation', () => {
  assert.equal(shouldIgnoreTarget({ closest: () => null }), false);
});

test('explicit Palma 2 query enables the mode', () => {
  assert.equal(resolveMode({ search: '?mode=palma2', stored: 'standard' }), true);
});

test('explicit standard query disables the mode', () => {
  assert.equal(resolveMode({ search: '?mode=standard', stored: 'palma2' }), false);
});

test('stored Palma 2 preference is restored without a query override', () => {
  assert.equal(resolveMode({ search: '', stored: 'palma2' }), true);
});
