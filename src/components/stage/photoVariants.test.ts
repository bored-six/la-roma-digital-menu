// Contract: every dish photo in photos.json ("dishes/<slug>.jpg", the 900 px master) has two WebP variants on disk, and the app
// requests only those:
//   heroFile(file)  = "dishes/<slug>.webp"    same pixel size as the master (Anatomia and the crop maths read the master's size),
//                                             the plate and the exploded view
//   thumbFile(file) = "dishes/t/<slug>.webp"  at most 320 px wide, same aspect ratio, the small option tiles (they are 47 px
//                                             discs on a phone; shipping them the 130 KB master was most of a page's weight)
// Byte budgets are the guard against someone dropping an unoptimised file in later.
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import photosJson from '../../data/photos.json';
import { photoSize } from './photoSizes';
import { heroFile, thumbFile } from './stageData';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const FILES = Object.values(photosJson as Record<string, { file: string }>).map((e) => e.file);

const HERO_MAX_BYTES = 100 * 1024;
const THUMB_MAX_BYTES = 20 * 1024;
const THUMB_MAX_WIDTH = 320;

/** width/height from a WebP header (lossy VP8, lossless VP8L or extended VP8X). Independent of the code under test. */
function webpSize(path: string): { w: number; h: number } {
  const b = readFileSync(path);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') throw new Error(`not a WebP: ${path}`);
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (kind === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (kind === 'VP8X') return { w: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
  throw new Error(`unknown WebP chunk ${kind} in ${path}`);
}

describe('heroFile / thumbFile', () => {
  it('swap the .jpg master for the WebP variant', () => {
    expect(heroFile('dishes/bam-e.jpg')).toBe('dishes/bam-e.webp');
    expect(thumbFile('dishes/bam-e.jpg')).toBe('dishes/t/bam-e.webp');
  });

  it('only touch the extension, not a ".jpg" inside the name', () => {
    expect(heroFile('dishes/a.jpg.b.jpg')).toBe('dishes/a.jpg.b.webp');
    expect(thumbFile('dishes/a.jpg.b.jpg')).toBe('dishes/t/a.jpg.b.webp');
  });

  it('every photo in photos.json is a dishes/<name>.jpg, so the derived names are right', () => {
    expect(FILES.length).toBeGreaterThan(20);
    expect(FILES.filter((f) => !/^dishes\/[^/]+\.jpg$/.test(f))).toEqual([]);
  });
});

describe('the variants on disk', () => {
  it('exist for every photo', () => {
    const missing: string[] = [];
    for (const f of FILES) {
      for (const v of [heroFile(f), thumbFile(f)]) {
        try {
          statSync(`${ROOT}public/${v}`);
        } catch {
          missing.push(v);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('hero: same pixel size as the master, under the byte budget', () => {
    const bad: string[] = [];
    for (const f of FILES) {
      const master = photoSize(f);
      const got = webpSize(`${ROOT}public/${heroFile(f)}`);
      const bytes = statSync(`${ROOT}public/${heroFile(f)}`).size;
      if (master === null || got.w !== master.w || got.h !== master.h) bad.push(`${f}: hero ${got.w}x${got.h} vs master ${JSON.stringify(master)}`);
      if (bytes > HERO_MAX_BYTES) bad.push(`${f}: hero is ${Math.round(bytes / 1024)} KB, budget ${HERO_MAX_BYTES / 1024} KB`);
    }
    expect(bad).toEqual([]);
  });

  it('thumb: at most 320 px wide, same aspect ratio as the master, under the byte budget', () => {
    const bad: string[] = [];
    for (const f of FILES) {
      const master = photoSize(f);
      const got = webpSize(`${ROOT}public/${thumbFile(f)}`);
      const bytes = statSync(`${ROOT}public/${thumbFile(f)}`).size;
      if (got.w > THUMB_MAX_WIDTH) bad.push(`${f}: thumb is ${got.w} px wide, max ${THUMB_MAX_WIDTH}`);
      // one pixel of rounding on the short side is fine
      if (master === null || Math.abs(got.h - (got.w * master.h) / master.w) > 1) bad.push(`${f}: thumb ${got.w}x${got.h} has a different aspect from master ${JSON.stringify(master)}`);
      if (bytes > THUMB_MAX_BYTES) bad.push(`${f}: thumb is ${Math.round(bytes / 1024)} KB, budget ${THUMB_MAX_BYTES / 1024} KB`);
    }
    expect(bad).toEqual([]);
  });
});
