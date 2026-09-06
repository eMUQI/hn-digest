import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const style = await readFile(new URL('../src/assets/style.css', import.meta.url), 'utf8');
const digest = await readFile(new URL('../src/assets/digest.css', import.meta.url), 'utf8');

test('tablet breakpoint expands the single-column reading area and scales digest typography', () => {
  assert.match(style, /@media \(min-width: 641px\) and \(max-width: 1023px\)/);
  assert.match(style, /\.shell\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(style, /\.digest h1,\s*\.page h1\s*\{[^}]*font-size:\s*32px/s);
  assert.match(style, /\.prose \.digest-list > \.digest-item\s*\{[^}]*font-size:\s*16px/s);
  assert.match(digest, /@media \(min-width: 641px\) and \(max-width: 1023px\)/);
  assert.match(digest, /\.prose \.digest-item-title\s*\{[^}]*font-size:\s*19px/s);
});

test('category navigation uses restrained outlined links', () => {
  assert.match(digest, /\.digest-category-nav a\s*\{[^}]*border:\s*1px solid var\(--line\)/s);
  assert.match(digest, /\.digest-category-nav a\s*\{[^}]*padding:\s*4px 9px/s);
});
