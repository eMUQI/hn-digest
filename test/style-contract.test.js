import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const style = await readFile(new URL('../src/assets/style.css', import.meta.url), 'utf8');

// Every generated issue opens with an H1 that repeats the page title the layout
// already renders. Losing this rule puts a duplicate heading on all 19+ issues.
test('the duplicated H1 from generated Markdown stays hidden', () => {
  assert.match(style, /\.prose > h1:first-child\s*\{[^}]*display:\s*none/s);
});
