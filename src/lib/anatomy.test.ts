// Contract: spec section 3 (AnatomyRegion, regionClipPath) and section 7 (anatomy.test.ts row).
// Regions are image-space fractions 0..1. regionClipPath(r) = 'ellipse(rx% ry% at cx% cy%)'.
// Number format decided in tests/CONTRACT.md: percent = fraction * 100 rounded to at most 2 decimals,
// no trailing zeros, no exponent; non-finite input throws.
import { describe, expect, it } from 'vitest';
import { ANATOMY } from '../data/anatomy';
import { regionClipPath } from './anatomy';
import type { AnatomyRegion } from '../types';

const EPS = 1e-9;
const NUM = String.raw`-?\d+(?:\.\d{1,2})?`;
const FORMAT = new RegExp(`^ellipse\\((${NUM})% (${NUM})% at (${NUM})% (${NUM})%\\)$`);
const dishes = Object.entries(ANATOMY);

describe('ANATOMY data', () => {
  it('is not empty and includes Chicksilog (the acceptance dish)', () => {
    expect(dishes.length).toBeGreaterThan(0);
    expect(ANATOMY.chicksilog?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it('every dish has at least 2 regions, otherwise Anatomia never shows and the entry is dead', () => {
    for (const [dish, regions] of dishes) expect(regions.length, dish).toBeGreaterThanOrEqual(2);
  });

  it('every region is finite, centre in [0,1], radii in (0, .5]', () => {
    for (const [dish, regions] of dishes) {
      for (const r of regions) {
        const where = `${dish} / ${r.label}`;
        for (const n of [r.cx, r.cy, r.rx, r.ry]) expect(Number.isFinite(n), where).toBe(true);
        expect(r.cx, `${where} cx`).toBeGreaterThanOrEqual(0);
        expect(r.cx, `${where} cx`).toBeLessThanOrEqual(1);
        expect(r.cy, `${where} cy`).toBeGreaterThanOrEqual(0);
        expect(r.cy, `${where} cy`).toBeLessThanOrEqual(1);
        expect(r.rx, `${where} rx`).toBeGreaterThan(0);
        expect(r.rx, `${where} rx`).toBeLessThanOrEqual(0.5);
        expect(r.ry, `${where} ry`).toBeGreaterThan(0);
        expect(r.ry, `${where} ry`).toBeLessThanOrEqual(0.5);
      }
    }
  });

  it('every ellipse sits entirely inside the unit box', () => {
    for (const [dish, regions] of dishes) {
      for (const r of regions) {
        const where = `${dish} / ${r.label}`;
        expect(r.cx - r.rx, `${where} left edge`).toBeGreaterThanOrEqual(-EPS);
        expect(r.cx + r.rx, `${where} right edge`).toBeLessThanOrEqual(1 + EPS);
        expect(r.cy - r.ry, `${where} top edge`).toBeGreaterThanOrEqual(-EPS);
        expect(r.cy + r.ry, `${where} bottom edge`).toBeLessThanOrEqual(1 + EPS);
      }
    }
  });

  it('labels are non-empty and unique within a dish (case-insensitive); detail is non-empty when present', () => {
    for (const [dish, regions] of dishes) {
      const labels = regions.map((r) => r.label.trim().toLowerCase());
      for (const r of regions) expect(r.label.trim(), `${dish} label`).not.toBe('');
      expect(new Set(labels).size, `${dish} labels ${JSON.stringify(labels)}`).toBe(labels.length);
      for (const r of regions) if (r.detail !== undefined) expect(r.detail.trim(), `${dish} / ${r.label} detail`).not.toBe('');
    }
  });

  it('no two regions of a dish share the exact same ellipse (copy-paste slip)', () => {
    for (const [dish, regions] of dishes) {
      const keys = regions.map((r) => `${r.cx}|${r.cy}|${r.rx}|${r.ry}`);
      expect(new Set(keys).size, dish).toBe(keys.length);
    }
  });

  it('regionClipPath of every real region has the documented format', () => {
    for (const [dish, regions] of dishes) {
      for (const r of regions) expect(regionClipPath(r), `${dish} / ${r.label}`).toMatch(FORMAT);
    }
  });
});

describe('regionClipPath', () => {
  const R = (cx: number, cy: number, rx: number, ry: number): AnatomyRegion => ({ label: 'x', cx, cy, rx, ry });

  it('writes ellipse(rx% ry% at cx% cy%) with radii first, then the centre', () => {
    expect(regionClipPath(R(0.5, 0.5, 0.25, 0.2))).toBe('ellipse(25% 20% at 50% 50%)');
    expect(regionClipPath(R(0.1, 0.9, 0.3, 0.05))).toBe('ellipse(30% 5% at 10% 90%)');
  });

  it('x and y are not swapped (asymmetric values)', () => {
    const out = regionClipPath(R(0.2, 0.7, 0.4, 0.1));
    expect(out).toBe('ellipse(40% 10% at 20% 70%)');
  });

  it('floating point noise never leaks into the string (0.29*100 = 28.999999999999996)', () => {
    expect(regionClipPath(R(0.29, 0.07, 0.1, 0.3))).toBe('ellipse(10% 30% at 29% 7%)');
    expect(regionClipPath(R(0.57, 0.58, 0.14, 0.35))).toBe('ellipse(14% 35% at 57% 58%)');
  });

  it('keeps up to 2 decimals and trims trailing zeros', () => {
    expect(regionClipPath(R(0.125, 0.5, 0.0789, 0.1))).toBe('ellipse(7.89% 10% at 12.5% 50%)');
    expect(regionClipPath(R(0.12341, 0.45, 0.33333, 0.2))).toBe('ellipse(33.33% 20% at 12.34% 45%)');
  });

  it('handles the edges 0 and 1 without exponent notation or a trailing dot', () => {
    expect(regionClipPath(R(0, 1, 0.5, 0.5))).toBe('ellipse(50% 50% at 0% 100%)');
    expect(regionClipPath(R(0.5, 0.5, 1e-7, 0.25))).toBe('ellipse(0% 25% at 50% 50%)');
  });

  it('ignores label and detail', () => {
    const a = regionClipPath({ label: 'Garlic rice', detail: 'with toasted garlic', cx: 0.3, cy: 0.4, rx: 0.1, ry: 0.1 });
    const b = regionClipPath({ label: 'Other', cx: 0.3, cy: 0.4, rx: 0.1, ry: 0.1 });
    expect(a).toBe(b);
  });

  it('throws on NaN or Infinity instead of emitting invalid CSS that would silently show the whole photo', () => {
    expect(() => regionClipPath(R(Number.NaN, 0.5, 0.1, 0.1))).toThrow();
    expect(() => regionClipPath(R(0.5, Number.POSITIVE_INFINITY, 0.1, 0.1))).toThrow();
    expect(() => regionClipPath(R(0.5, 0.5, Number.NaN, 0.1))).toThrow();
    expect(() => regionClipPath(R(0.5, 0.5, 0.1, Number.NEGATIVE_INFINITY))).toThrow();
  });
});
