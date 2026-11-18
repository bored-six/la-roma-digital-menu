export interface FitInput {
  /** Font size the text is normally set at, in px. */
  base: number;
  /** Width of the box the line has to fit in, in px. */
  available: number;
  /** Width the text needs on one line at `base`, in px. */
  needed: number;
  /** Smallest size worth using, in px. */
  min: number;
}

/**
 * The largest font size, at most `base` and at least `min`, at which a line that needs `needed` px at `base`
 * fits in `available` px. Text width is linear in font size. Rounded down to half a pixel so rounding can never push
 * the last letter out of the box. Anything that cannot be measured (hidden element, 0, NaN, Infinity) keeps `base`.
 */
export function fitFontSize({ base, available, needed, min }: FitInput): number {
  const measurable = Number.isFinite(available) && Number.isFinite(needed) && available > 0 && needed > 0;
  if (!measurable || needed <= available) return base;
  const scaled = Math.floor(((base * available) / needed) * 2) / 2;
  return Math.min(base, Math.max(min, scaled));
}
