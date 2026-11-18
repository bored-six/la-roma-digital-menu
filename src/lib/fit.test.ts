import { describe, expect, it } from 'vitest';
import { fitFontSize } from './fit';

// Contract: given the size a text is set at (base), the width it has (available) and the width it needs on one line
// at that size (needed), return the largest size, never above base and never below min, whose line fits.
// Text width scales linearly with font size, so the answer is base * available / needed, rounded DOWN to half a pixel
// (rounding up could push the last letter outside the box). Anything unmeasurable (0, NaN, hidden element) leaves base alone.
describe('fitFontSize', () => {
  it('keeps the base size when the line already fits', () => {
    expect(fitFontSize({ base: 34, available: 295, needed: 240, min: 20 })).toBe(34);
  });

  it('keeps the base size on an exact fit', () => {
    expect(fitFontSize({ base: 34, available: 295, needed: 295, min: 20 })).toBe(34);
  });

  it('scales down in proportion when the line is too wide', () => {
    expect(fitFontSize({ base: 40, available: 150, needed: 300, min: 10 })).toBe(20);
  });

  it('rounds down to half a pixel, never up', () => {
    // 34 * 295 / 320 = 31.34375
    expect(fitFontSize({ base: 34, available: 295, needed: 320, min: 20 })).toBe(31);
    // 34 * 295 / 310 = 32.35...
    expect(fitFontSize({ base: 34, available: 295, needed: 310, min: 20 })).toBe(32);
    // 34 * 300 / 320 = 31.875 -> 31.5
    expect(fitFontSize({ base: 34, available: 300, needed: 320, min: 20 })).toBe(31.5);
  });

  it('never goes below min, even for a very long name', () => {
    expect(fitFontSize({ base: 34, available: 100, needed: 600, min: 22 })).toBe(22);
  });

  it('returns base when min is larger than base (a caller mistake must not enlarge the text)', () => {
    expect(fitFontSize({ base: 18, available: 100, needed: 600, min: 22 })).toBe(18);
  });

  it('leaves base alone when nothing can be measured', () => {
    expect(fitFontSize({ base: 34, available: 0, needed: 320, min: 20 })).toBe(34);
    expect(fitFontSize({ base: 34, available: 295, needed: 0, min: 20 })).toBe(34);
    expect(fitFontSize({ base: 34, available: Number.NaN, needed: 320, min: 20 })).toBe(34);
    expect(fitFontSize({ base: 34, available: 295, needed: Number.NaN, min: 20 })).toBe(34);
    expect(fitFontSize({ base: 34, available: -5, needed: 320, min: 20 })).toBe(34);
    expect(fitFontSize({ base: 34, available: 295, needed: Number.POSITIVE_INFINITY, min: 20 })).toBe(34);
  });
});
