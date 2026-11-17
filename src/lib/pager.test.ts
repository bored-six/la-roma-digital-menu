// Contract: spec sections 3 and 5/7. Pager clamps 0..n-1, never wraps; hash opens a page; scroll position maps to an index.
// Open points decided in tests/CONTRACT.md:
//   clampIndex(index, count) -> integer in [0, count-1]; bad count or NaN -> 0
//   indexFromScroll(scrollLeft, width, count) -> Math.round(scrollLeft / width) clamped (exactly half a page rounds up)
//   pageIndexFromHash(hash, pages) -> index of the page whose id equals the hash, else 0
import { describe, expect, it } from 'vitest';
import { clampIndex, indexFromScroll, pageIndexFromHash } from './pager';
import type { Page } from '../types';

const IDS = [
  'cover', 'breakfast', 'unli-rice', 'pizza', 'favourites', 'rice-meals', 'chicken-beef',
  'pork', 'sea', 'soup', 'salad-rice', 'cold-drinks', 'hot-drinks', 'grazie',
];
const PAGES: Page[] = IDS.map((id): Page => {
  if (id === 'cover') return { kind: 'cover', id: 'cover' };
  if (id === 'grazie') return { kind: 'closing', id: 'grazie' };
  return { kind: 'category', id, label: id, categories: [] };
});

// -0 and 0 are the same page; do not fail a test on the sign of zero.
const z = (n: number): number => (n === 0 ? 0 : n);

describe('clampIndex', () => {
  it('clamps to 0 at the start and count-1 at the end (spec: clamp(-1)=0, clamp(14)=13)', () => {
    expect(z(clampIndex(-1, 14))).toBe(0);
    expect(clampIndex(14, 14)).toBe(13);
    expect(z(clampIndex(-99, 14))).toBe(0);
    expect(clampIndex(99, 14)).toBe(13);
  });

  it('leaves in-range indexes alone', () => {
    for (let i = 0; i < 14; i++) expect(clampIndex(i, 14)).toBe(i);
  });

  it('does not wrap: next from the last page stays last, previous from the first stays first', () => {
    expect(clampIndex(13 + 1, 14)).toBe(13);
    expect(z(clampIndex(0 - 1, 14))).toBe(0);
  });

  it('NaN and infinities map to a valid index', () => {
    expect(z(clampIndex(Number.NaN, 14))).toBe(0);
    expect(clampIndex(Number.POSITIVE_INFINITY, 14)).toBe(13);
    expect(z(clampIndex(Number.NEGATIVE_INFINITY, 14))).toBe(0);
  });

  it('a count of 0, 1, negative or NaN always gives 0 (empty page list never yields -1)', () => {
    for (const count of [0, 1, -3, Number.NaN]) {
      for (const i of [-5, 0, 3, 99]) expect(z(clampIndex(i, count)), `clampIndex(${i}, ${count})`).toBe(0);
    }
  });

  it('always returns an integer, even for fractional input', () => {
    for (const i of [0.5, 2.4, 2.6, 12.9, 13.4, -0.4]) {
      const r = clampIndex(i, 14);
      expect(Number.isInteger(r), `clampIndex(${i}) = ${r}`).toBe(true);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(13);
    }
    expect(clampIndex(2.4, 14)).toBe(2);
  });
});

describe('indexFromScroll', () => {
  const W = 390;

  it('rounds at half a page width', () => {
    expect(indexFromScroll(0, W, 14)).toBe(0);
    expect(indexFromScroll(W * 0.49, W, 14)).toBe(0);
    expect(indexFromScroll(W * 0.51, W, 14)).toBe(1);
    expect(indexFromScroll(W, W, 14)).toBe(1);
    expect(indexFromScroll(W * 1.49, W, 14)).toBe(1);
    expect(indexFromScroll(W * 1.51, W, 14)).toBe(2);
  });

  it('exactly half a page rounds up', () => {
    expect(indexFromScroll(W * 0.5, W, 14)).toBe(1);
    expect(indexFromScroll(W * 1.5, W, 14)).toBe(2);
  });

  it('lands on the last page at the last snap point and clamps beyond it', () => {
    expect(indexFromScroll(W * 13, W, 14)).toBe(13);
    expect(indexFromScroll(W * 13 + 200, W, 14)).toBe(13);
    expect(indexFromScroll(1e9, W, 14)).toBe(13);
    expect(indexFromScroll(Number.POSITIVE_INFINITY, W, 14)).toBe(13);
  });

  it('negative scrollLeft (iOS rubber-band) clamps to 0', () => {
    expect(z(indexFromScroll(-1, W, 14))).toBe(0);
    expect(z(indexFromScroll(-W, W, 14))).toBe(0);
    expect(z(indexFromScroll(-1e9, W, 14))).toBe(0);
    expect(z(indexFromScroll(Number.NEGATIVE_INFINITY, W, 14))).toBe(0);
  });

  it('fractional scrollLeft and fractional widths (device pixel ratio) still snap to the right page', () => {
    expect(indexFromScroll(389.7, W, 14)).toBe(1);
    expect(indexFromScroll(0.4, W, 14)).toBe(0);
    expect(indexFromScroll(390.5 * 3 - 0.0001, 390.5, 14)).toBe(3);
    expect(indexFromScroll(390.5 * 3, 390.5, 14)).toBe(3);
  });

  it('width 0, negative or NaN gives 0 instead of NaN/Infinity', () => {
    for (const width of [0, -390, Number.NaN]) {
      expect(z(indexFromScroll(500, width, 14)), `width ${width}`).toBe(0);
    }
  });

  it('NaN scrollLeft gives 0', () => {
    expect(z(indexFromScroll(Number.NaN, W, 14))).toBe(0);
  });

  it('a count of 0 or 1 always gives 0', () => {
    expect(z(indexFromScroll(9999, W, 0))).toBe(0);
    expect(z(indexFromScroll(9999, W, 1))).toBe(0);
  });

  it('never returns a non-integer or an out-of-range index for any mix of nasty inputs', () => {
    const scrolls = [-1e9, -1, -0.5, 0, 0.5, 1, 194.99, 195, 389.9, 390, 5070, 5071, 1e9, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    const widths = [-5, 0, 1, 0.5, 390, 390.5, Number.NaN, Number.POSITIVE_INFINITY];
    const counts = [0, 1, 2, 14, Number.NaN];
    for (const s of scrolls) {
      for (const w of widths) {
        for (const n of counts) {
          const r = indexFromScroll(s, w, n);
          const max = Number.isFinite(n) && n > 1 ? n - 1 : 0;
          const label = `indexFromScroll(${s}, ${w}, ${n}) = ${r}`;
          expect(Number.isInteger(r), label).toBe(true);
          expect(r, label).toBeGreaterThanOrEqual(0);
          expect(r, label).toBeLessThanOrEqual(max);
        }
      }
    }
  });

  it('is monotonic: scrolling further right never lowers the index', () => {
    let prev = -1;
    for (let s = -50; s <= W * 14; s += 7) {
      const r = z(indexFromScroll(s, W, 14));
      expect(r).toBeGreaterThanOrEqual(prev);
      prev = r;
    }
  });
});

describe('pageIndexFromHash', () => {
  it('maps #pork to 7 (spec) and other ids to their position', () => {
    expect(pageIndexFromHash('#pork', PAGES)).toBe(7);
    expect(pageIndexFromHash('#cover', PAGES)).toBe(0);
    expect(pageIndexFromHash('#breakfast', PAGES)).toBe(1);
    expect(pageIndexFromHash('#unli-rice', PAGES)).toBe(2);
    expect(pageIndexFromHash('#cold-drinks', PAGES)).toBe(11);
    expect(pageIndexFromHash('#grazie', PAGES)).toBe(13);
  });

  it('unknown, empty and bare "#" all open the cover (index 0)', () => {
    for (const h of ['', '#', '#nope', '#por', '#pork-extra', '#pork x', '#7']) {
      expect(pageIndexFromHash(h, PAGES), JSON.stringify(h)).toBe(0);
    }
  });

  it('accepts the hash without its leading "#"', () => {
    expect(pageIndexFromHash('pork', PAGES)).toBe(7);
  });

  it('is case-insensitive', () => {
    expect(pageIndexFromHash('#PORK', PAGES)).toBe(7);
    expect(pageIndexFromHash('#Pork', PAGES)).toBe(7);
    expect(pageIndexFromHash('#Unli-Rice', PAGES)).toBe(2);
  });

  it('ignores trailing slashes', () => {
    expect(pageIndexFromHash('#pork/', PAGES)).toBe(7);
    expect(pageIndexFromHash('#pork//', PAGES)).toBe(7);
    expect(pageIndexFromHash('#PORK/', PAGES)).toBe(7);
  });

  it('decodes percent-encoding, and never throws on malformed encoding', () => {
    expect(pageIndexFromHash('#%70ork', PAGES)).toBe(7);
    expect(() => pageIndexFromHash('#%E0%A4%A', PAGES)).not.toThrow();
    expect(pageIndexFromHash('#%E0%A4%A', PAGES)).toBe(0);
    expect(pageIndexFromHash('#%', PAGES)).toBe(0);
  });

  it('does not treat Object.prototype names as pages (no plain-object lookup)', () => {
    for (const h of ['#constructor', '#__proto__', '#toString', '#hasOwnProperty', '#valueOf']) {
      expect(pageIndexFromHash(h, PAGES), h).toBe(0);
    }
  });

  it('works on any page list, not only the 14 menu pages', () => {
    const tiny: Page[] = [{ kind: 'cover', id: 'cover' }, { kind: 'closing', id: 'grazie' }];
    expect(pageIndexFromHash('#grazie', tiny)).toBe(1);
    expect(pageIndexFromHash('#pork', tiny)).toBe(0);
  });

  it('an empty page list gives 0, never -1', () => {
    expect(pageIndexFromHash('#pork', [])).toBe(0);
    expect(pageIndexFromHash('', [])).toBe(0);
  });
});
