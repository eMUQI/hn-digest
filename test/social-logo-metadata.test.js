import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const base = readFileSync(new URL('../src/_includes/layouts/base.njk', import.meta.url), 'utf8');
const logoPng = new URL('../src/assets/brand-mark.png', import.meta.url);

test('social preview uses the site logo PNG', () => {
  assert.match(base, /https:\/\/emuqi\.github\.io\/hn-digest\/assets\/brand-mark\.png/);
  assert.match(base, /name="twitter:card" content="summary"/);
  assert.ok(existsSync(logoPng));
});
