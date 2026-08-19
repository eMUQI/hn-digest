import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyTap, pageTurnDistance } from '../src/assets/palma2-core.js';

test('left edge tap requests previous screen', () => {
  assert.equal(classifyTap({ startX: 40, endX: 43, startY: 300, endY: 303, width: 400 }), 'screen-up');
});

test('right edge tap requests next screen', () => {
  assert.equal(classifyTap({ startX: 360, endX: 356, startY: 300, endY: 302, width: 400 }), 'screen-down');
});

test('page turn uses 88 percent of viewport height', () => {
  assert.equal(pageTurnDistance(1000), 880);
});
