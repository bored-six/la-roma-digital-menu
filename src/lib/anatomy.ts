import type { AnatomyRegion } from '../types';

/** fraction -> percent string: rounded to <= 2 decimals, trailing zeros trimmed, no exponent. */
function percent(fraction: number): string {
  if (!Number.isFinite(fraction)) throw new RangeError(`regionClipPath: not a finite number (${String(fraction)})`);
  let s = (fraction * 100).toFixed(2);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
}

/** CSS clip-path for one region: 'ellipse(rx% ry% at cx% cy%)'. Throws on NaN/Infinity instead of emitting invalid CSS. */
export function regionClipPath(r: AnatomyRegion): string {
  return `ellipse(${percent(r.rx)}% ${percent(r.ry)}% at ${percent(r.cx)}% ${percent(r.cy)}%)`;
}
