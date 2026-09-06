import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = readFileSync(new URL('../src/_includes/layouts/base.njk', import.meta.url), 'utf8');

test('base layout exposes canonical and Open Graph metadata', () => {
  assert.match(base, /rel="canonical"/);
  assert.match(base, /property="og:title"/);
  assert.match(base, /property="og:description"/);
  assert.match(base, /property="og:url"/);
  assert.match(base, /property="og:type"/);
  assert.match(base, /property="og:site_name"/);
  assert.match(base, /property="og:locale"/);
  assert.match(base, /property="og:image"/);
});

test('base layout exposes Twitter Card metadata', () => {
  assert.match(base, /name="twitter:card" content="summary"/);
  assert.match(base, /name="twitter:title"/);
  assert.match(base, /name="twitter:description"/);
  assert.match(base, /name="twitter:image"/);
});

test('social metadata uses absolute public URLs and the site logo PNG', () => {
  assert.match(base, /https:\/\/emuqi\.github\.io\/hn-digest\//);
  assert.match(base, /\/assets\/brand-mark\.png/);
});
