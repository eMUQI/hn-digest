import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const base = readFileSync(new URL('../src/_includes/layouts/base.njk', import.meta.url), 'utf8');

const socialImageUrl = base.match(/{% set socialImage = "([^"]+)" %}/)?.[1];
const declaredWidth = Number(base.match(/property="og:image:width" content="(\d+)"/)?.[1]);
const declaredHeight = Number(base.match(/property="og:image:height" content="(\d+)"/)?.[1]);

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Walks the PNG chunk stream the way an image decoder does, so a truncated or
// otherwise malformed file fails here instead of silently shipping as a social
// preview that no crawler can render.
function parsePng(buf) {
  assert.deepEqual([...buf.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 'PNG signature');

  const chunks = [];
  let offset = 8;
  let header = null;
  let idat = [];
  let sawEnd = false;

  while (offset + 12 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    assert.ok(
      offset + 12 + length <= buf.length,
      `chunk ${type} at ${offset} declares ${length} bytes but only ${buf.length - offset - 12} remain (truncated file)`
    );

    const data = buf.subarray(offset + 8, offset + 8 + length);
    const stored = buf.readUInt32BE(offset + 8 + length);
    assert.equal(crc32(buf.subarray(offset + 4, offset + 8 + length)), stored, `CRC of chunk ${type} at ${offset}`);

    if (type === 'IHDR') header = { width: data.readUInt32BE(0), height: data.readUInt32BE(4) };
    if (type === 'IDAT') idat.push(data);
    if (type === 'IEND') { sawEnd = true; offset += 12 + length; break; }

    chunks.push(type);
    offset += 12 + length;
  }

  assert.ok(sawEnd, 'PNG ends with an IEND chunk');
  assert.equal(offset, buf.length, 'no trailing bytes after IEND');
  assert.ok(header, 'PNG has an IHDR chunk');
  assert.ok(idat.length > 0, 'PNG has image data');

  return { ...header, idat: Buffer.concat(idat) };
}

test('base layout points at an asset that exists in src/assets', () => {
  assert.ok(socialImageUrl, 'base.njk defines socialImage');
  assert.ok(
    socialImageUrl.startsWith('https://emuqi.github.io/hn-digest/assets/'),
    `socialImage should live under the published assets directory, got ${socialImageUrl}`
  );
  assert.doesNotThrow(() => readFileSync(socialImageFile()));
});

function socialImageFile() {
  const name = socialImageUrl.split('/').pop();
  return new URL(`../src/assets/${name}`, import.meta.url);
}

test('the social preview image is a valid, decodable PNG', () => {
  const buf = readFileSync(socialImageFile());
  const png = parsePng(buf);
  assert.doesNotThrow(() => inflateSync(png.idat), 'IDAT stream inflates');
});

test('the social preview image matches its declared og:image dimensions', () => {
  const png = parsePng(readFileSync(socialImageFile()));
  assert.equal(png.width, declaredWidth);
  assert.equal(png.height, declaredHeight);
});

test('the social preview image uses the 1.91:1 landscape ratio crawlers expect', () => {
  const png = parsePng(readFileSync(socialImageFile()));
  assert.ok(png.width >= 1200 && png.height >= 630, `card should be at least 1200x630, got ${png.width}x${png.height}`);
  const ratio = png.width / png.height;
  assert.ok(Math.abs(ratio - 1.91) < 0.05, `aspect ratio should be about 1.91:1, got ${ratio.toFixed(2)}`);
});
