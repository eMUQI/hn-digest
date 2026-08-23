import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const template = readFileSync(new URL('../src/index.njk', import.meta.url), 'utf8');

test('latest digest homepage renders the ink screen mode control', () => {
  assert.match(template, /data-palma-toggle/);
  assert.match(template, />墨水屏模式</);
  assert.doesNotMatch(template, />Palma 2 模式</);
});

test('latest digest homepage exposes previous-issue tap navigation when available', () => {
  assert.match(template, /data-palma-nav="previous"/);
});
