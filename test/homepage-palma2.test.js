import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const template = readFileSync(new URL('../src/index.njk', import.meta.url), 'utf8');
const digestTemplate = readFileSync(new URL('../src/_includes/layouts/digest.njk', import.meta.url), 'utf8');
const inkScreenCss = readFileSync(new URL('../src/assets/palma2.css', import.meta.url), 'utf8');

test('latest digest homepage renders the ink screen mode control', () => {
  assert.match(template, /data-palma-toggle/);
  assert.match(template, />墨水屏模式</);
  assert.doesNotMatch(template, />Palma 2 模式</);
});

test('fixed digest pages render the ink screen mode control without legacy copy', () => {
  assert.match(digestTemplate, /data-palma-toggle/);
  assert.match(digestTemplate, />墨水屏模式</);
  assert.doesNotMatch(digestTemplate, />Palma 2 模式</);
});

test('ink screen mode applies grayscale directly to the navbar brand image', () => {
  assert.match(inkScreenCss, /data-display-mode="palma2"\] \.brand-mark\s*\{[^}]*filter:\s*grayscale\(1\)/s);
  assert.doesNotMatch(inkScreenCss, /data-display-mode="palma2"\] \.brand-mark img/);
});

test('latest digest homepage exposes previous-issue tap navigation when available', () => {
  assert.match(template, /data-palma-nav="previous"/);
});
