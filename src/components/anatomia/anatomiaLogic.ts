// Pure maths for Anatomia: rotation limits, the 3D projection used to draw leader lines, label placement.
// No React, no DOM. Unit-tested in anatomiaLogic.test.ts.
import type { AnatomyRegion } from '../../types';
import type { PlateGeom } from '../stage/stageLogic';

// ---------- rotation (spec section 5) ----------
export const ROT_DEFAULT = -35;
export const ROT_MIN = -75;
export const ROT_MAX = 5;
export const ROT_PER_PX = 0.25;
export const ROT_KEY_STEP = 10;
/** Isometric tilt of the whole scene. */
export const TILT_X = 55;
/** `perspective()` distance in px. Mild: the stack should feel measured, not fish-eyed. */
export const PERSPECTIVE = 1100;

/** Clamp to -75..5. NaN falls back to the default so a bad pointer event can never poison the transform. */
export function clampRot(deg: number): number {
  if (Number.isNaN(deg)) return ROT_DEFAULT;
  return Math.min(ROT_MAX, Math.max(ROT_MIN, deg));
}

/** 1px of horizontal drag = 0.25deg; dragging right turns the scene clockwise. */
export function rotFromDrag(startDeg: number, dxPx: number): number {
  return clampRot(startDeg + dxPx * ROT_PER_PX);
}

/** Arrow keys: +-10deg. */
export function rotFromKey(currentDeg: number, dir: -1 | 1): number {
  return clampRot(currentDeg + dir * ROT_KEY_STEP);
}

// ---------- projection ----------
const RAD = Math.PI / 180;

/**
 * What the browser does to a point for `transform: perspective(d) rotateX(rx) rotateZ(rz)` (rotateZ is applied to the point first).
 * Coordinates are px from the disc centre: x right, y down, z toward the viewer. `persp` = Infinity means no perspective.
 */
export function project(
  p: { x: number; y: number; z: number },
  rxDeg: number,
  rzDeg: number,
  persp: number,
): { x: number; y: number; scale: number } {
  const cz = Math.cos(rzDeg * RAD);
  const sz = Math.sin(rzDeg * RAD);
  const x1 = p.x * cz - p.y * sz;
  const y1 = p.x * sz + p.y * cz;
  const cx = Math.cos(rxDeg * RAD);
  const sx = Math.sin(rxDeg * RAD);
  const y2 = y1 * cx - p.z * sx;
  const z2 = y1 * sx + p.z * cx;
  const scale = 1 / (1 - z2 / persp);
  return { x: x1 * scale || 0, y: y2 * scale || 0, scale };
}

/**
 * Where a region centre sits on the disc, px from the disc centre. The photo frame is `plateBoxPx / (2 r)` wide
 * (see cropFrame) and keeps the photo's aspect, so x uses the frame width and y the frame height.
 */
export function planOffset(
  region: { cx: number; cy: number },
  plate: PlateGeom,
  plateBoxPx: number,
  imgW: number,
  imgH: number,
): { x: number; y: number } {
  const frameW = plateBoxPx / (2 * plate.r);
  const frameH = (frameW * imgH) / imgW;
  return { x: (region.cx - plate.cx) * frameW, y: (region.cy - plate.cy) * frameH };
}

/**
 * Z gap between layers. Defaults: up to 40px (spec section 5), shrinking so the whole stack stays <= `budget` px, never under 20px.
 * Anatomia passes the height actually available in the view and a higher cap, so the parts separate as far as the screen allows.
 */
export function layerLift(layers: number, budget = 170, cap = 40): number {
  if (layers <= 0) return Math.min(cap, 40);
  return Math.max(20, Math.min(cap, budget / layers));
}

// ---------- labels ----------

/**
 * Which column each label goes in, from the screen x of its dot (px from the disc centre).
 * Left of centre = left column. If a column would hold more than `maxPerSide`, the dots nearest the centre line cross over.
 * A dead-centre dot goes to the lighter column (left on a tie).
 */
export function assignSides(xs: readonly number[], maxPerSide: number): Array<'left' | 'right'> {
  const sides: Array<'left' | 'right' | null> = xs.map((x) => (x < 0 ? 'left' : x > 0 ? 'right' : null));
  const count = (s: 'left' | 'right') => sides.filter((v) => v === s).length;

  xs.forEach((_, i) => {
    if (sides[i] === null) sides[i] = count('left') <= count('right') ? 'left' : 'right';
  });

  for (const heavy of ['left', 'right'] as const) {
    const light = heavy === 'left' ? 'right' : 'left';
    while (count(heavy) > maxPerSide && count(light) < xs.length) {
      let pick = -1;
      for (let i = 0; i < xs.length; i++) {
        if (sides[i] !== heavy) continue;
        if (pick === -1 || Math.abs(xs[i]!) < Math.abs(xs[pick]!)) pick = i;
      }
      if (pick === -1) break;
      sides[pick] = light;
    }
  }
  return sides as Array<'left' | 'right'>;
}

/**
 * Vertical positions for a column of labels, from the ideal y of each (the y of its dot).
 * Keeps the visual order of the ideals, spaces neighbours at least `gap` apart, stays inside top..bottom.
 * If they cannot all fit at `gap`, they are spread evenly across the range. Returns y in the INPUT order.
 */
export function spreadLabels(ideal: readonly number[], opts: { top: number; bottom: number; gap: number }): number[] {
  const n = ideal.length;
  if (n === 0) return [];
  const { top, bottom, gap } = opts;
  const order = ideal.map((_, i) => i).sort((a, b) => ideal[a]! - ideal[b]! || a - b);

  if (n > 1 && (n - 1) * gap > bottom - top) {
    const step = (bottom - top) / (n - 1);
    const out = new Array<number>(n).fill(0);
    order.forEach((idx, rank) => {
      out[idx] = top + rank * step;
    });
    return out;
  }

  const ys = order.map((i) => Math.min(bottom, Math.max(top, ideal[i]!)));
  for (let k = 1; k < n; k++) ys[k] = Math.max(ys[k]!, ys[k - 1]! + gap);
  for (let k = n - 1; k >= 0; k--) {
    const limit = k === n - 1 ? bottom : ys[k + 1]! - gap;
    ys[k] = Math.min(ys[k]!, limit);
  }
  const out = new Array<number>(n).fill(0);
  order.forEach((idx, rank) => {
    out[idx] = ys[rank]!;
  });
  return out;
}

// ---------- flat view crop (reduced motion) ----------

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** The box around every region ellipse plus `margin` (fractions of the photo), kept inside the photo. */
export function regionsBounds(regions: readonly Pick<AnatomyRegion, 'cx' | 'cy' | 'rx' | 'ry'>[], margin: number): Box {
  let x0 = 1;
  let y0 = 1;
  let x1 = 0;
  let y1 = 0;
  for (const r of regions) {
    x0 = Math.min(x0, r.cx - r.rx);
    x1 = Math.max(x1, r.cx + r.rx);
    y0 = Math.min(y0, r.cy - r.ry);
    y1 = Math.max(y1, r.cy + r.ry);
  }
  return {
    x0: Math.max(0, x0 - margin),
    y0: Math.max(0, y0 - margin),
    x1: Math.min(1, x1 + margin),
    y1: Math.min(1, y1 + margin),
  };
}

/** CSS numbers that show only `box` of a photo in a container: frame at left:0; top:0; width widthPct%; translate(shiftX%, shiftY%). */
export function rectFrame(box: Box): { widthPct: number; shiftXPct: number; shiftYPct: number } {
  return { widthPct: 100 / (box.x1 - box.x0), shiftXPct: -box.x0 * 100, shiftYPct: -box.y0 * 100 };
}

/** width / height of the box in pixels, for the container's aspect-ratio. */
export function rectAspect(box: Box, imgW: number, imgH: number): number {
  return ((box.x1 - box.x0) * imgW) / ((box.y1 - box.y0) * imgH);
}
