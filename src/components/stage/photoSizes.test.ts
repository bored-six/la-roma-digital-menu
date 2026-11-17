// Contract: <img width height> must be the file's REAL pixel size (spec section 6: no layout shift), so a table keyed by the
// `file` value in photos.json must exist for every photo and agree with the JPEG header on disk.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import photosJson from '../../data/photos.json';
import { photoSize } from './photoSizes';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** width/height from the first SOFn marker of a JPEG. Independent of the table under test. */
function jpegSize(path: string): { w: number; h: number } {
  const b = readFileSync(path);
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) throw new Error(`bad marker at ${i} in ${path}`);
    const marker = b[i + 1]!;
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error(`no SOF in ${path}`);
}

const FILES = Object.values(photosJson as Record<string, { file: string }>).map((e) => e.file);

describe('photoSize', () => {
  it('knows every photo in photos.json', () => {
    expect(FILES.length).toBeGreaterThan(20);
    expect(FILES.filter((f) => photoSize(f) === null)).toEqual([]);
  });

  it('matches the pixel size of the file on disk, for every photo', () => {
    const wrong: string[] = [];
    for (const f of FILES) {
      const real = jpegSize(`${ROOT}public/${f}`);
      const got = photoSize(f);
      if (got === null || got.w !== real.w || got.h !== real.h) wrong.push(`${f}: table ${JSON.stringify(got)} vs file ${JSON.stringify(real)}`);
    }
    expect(wrong).toEqual([]);
  });

  it('returns null for an unknown file instead of guessing, and ignores Object.prototype names', () => {
    expect(photoSize('dishes/nope.jpg')).toBeNull();
    expect(photoSize('constructor')).toBeNull();
    expect(photoSize('__proto__')).toBeNull();
  });
});
