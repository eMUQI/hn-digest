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
  assert.match(base, /property="og:image:type" content="image\/png"/);
  assert.match(base, /property="og:image:alt"/);
});

test('base layout declares the real dimensions of the preview image', () => {
  assert.match(base, /property="og:image:width" content="1200"/);
  assert.match(base, /property="og:image:height" content="630"/);
});

test('article pages carry a published time', () => {
  assert.match(base, /property="article:published_time"/);
});

test('base layout exposes Twitter Card metadata', () => {
  assert.match(base, /name="twitter:card" content="summary_large_image"/);
  assert.match(base, /name="twitter:title"/);
  assert.match(base, /name="twitter:description"/);
  assert.match(base, /name="twitter:image"/);
  assert.match(base, /name="twitter:image:alt"/);
});

test('social metadata uses absolute public URLs and the landscape card', () => {
  assert.match(base, /https:\/\/emuqi\.github\.io\/hn-digest\//);
  assert.match(base, /\/assets\/og-image\.png/);
});
