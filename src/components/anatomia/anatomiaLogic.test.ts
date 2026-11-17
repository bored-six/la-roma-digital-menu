// Contract for the pure maths behind Anatomia (written before anatomiaLogic.ts exists).
//  rotation:  1px of drag = 0.25deg, clamp -75..5, arrow keys +-10deg, default -35.
//  project:   the same maths the browser applies for `perspective(d) rotateX(rx) rotateZ(rz)` on a point
//             (x right, y down, z toward the viewer, all px from the disc centre). Leader lines are drawn from it.
//  planOffset: where a region centre sits on the disc plane, px from the disc centre.
//  layerLift: z gap per layer so the stack never gets taller than ~170px.
//  assignSides / spreadLabels: label columns (left or right of the disc) and their vertical positions.
import { describe, expect, it } from 'vitest';
import {
  ROT_DEFAULT,
  ROT_MAX,
  ROT_MIN,
  assignSides,
  clampRot,
  layerLift,
  planOffset,
  project,
  rotFromDrag,
  rotFromKey,
  spreadLabels,
} from './anatomiaLogic';

describe('rotation', () => {
  it('starts at -35 inside the -75..5 range', () => {
    expect(ROT_DEFAULT).toBe(-35);
    expect(ROT_MIN).toBe(-75);
    expect(ROT_MAX).toBe(5);
  });

  it('turns 0.25deg per pixel of drag, rightwards = clockwise', () => {
    expect(rotFromDrag(-35, 100)).toBeCloseTo(-10, 9);
    expect(rotFromDrag(-35, -40)).toBeCloseTo(-45, 9);
    expect(rotFromDrag(-35, 0)).toBe(-35);
  });

  it('clamps at both ends and never returns NaN', () => {
    expect(rotFromDrag(-35, 100000)).toBe(5);
    expect(rotFromDrag(-35, -100000)).toBe(-75);
    expect(clampRot(NaN)).toBe(ROT_DEFAULT);
    expect(clampRot(Infinity)).toBe(5);
    expect(clampRot(-Infinity)).toBe(-75);
  });

  it('steps 10deg per arrow key and stops at the clamp', () => {
    expect(rotFromKey(-35, 1)).toBe(-25);
    expect(rotFromKey(-35, -1)).toBe(-45);
    expect(rotFromKey(0, 1)).toBe(5);
    expect(rotFromKey(-70, -1)).toBe(-75);
  });
});

describe('project', () => {
  const FLAT = Infinity; // no perspective: pure rotation

  it('is the identity with no rotation and no lift', () => {
    const p = project({ x: 30, y: -12, z: 0 }, 0, 0, 900);
    expect(p.x).toBeCloseTo(30, 9);
    expect(p.y).toBeCloseTo(-12, 9);
  });

  it('turns a point on the disc by rotateZ (clockwise on screen, y down)', () => {
    const p = project({ x: 10, y: 0, z: 0 }, 0, 90, FLAT);
    expect(p.x).toBeCloseTo(0, 9);
    expect(p.y).toBeCloseTo(10, 9);
  });

  it('squashes the disc vertically by cos(rotateX): a point 100px below centre lands 100*cos(55) down', () => {
    const p = project({ x: 0, y: 100, z: 0 }, 55, 0, FLAT);
    expect(p.y).toBeCloseTo(100 * Math.cos((55 * Math.PI) / 180), 9);
    expect(p.x).toBeCloseTo(0, 9);
  });

  it('lifts a layer UP the screen by z*sin(rotateX)', () => {
    const p = project({ x: 0, y: 0, z: 100 }, 55, -35, FLAT);
    expect(p.y).toBeCloseTo(-100 * Math.sin((55 * Math.PI) / 180), 9);
    expect(p.x).toBeCloseTo(0, 9);
  });

  it('keeps the disc centre fixed under any rotation (the pivot)', () => {
    for (const rz of [-75, -35, 5]) {
      const p = project({ x: 0, y: 0, z: 0 }, 55, rz, 900);
      expect(p.x).toBeCloseTo(0, 9);
      expect(p.y).toBeCloseTo(0, 9);
      expect(p.scale).toBeCloseTo(1, 9);
    }
  });

  it('perspective makes a lifted (nearer) point larger, and its offset from the centre bigger', () => {
    const flat = project({ x: 50, y: 0, z: 0 }, 0, 0, 900);
    const near = project({ x: 50, y: 0, z: 90 }, 0, 0, 900);
    expect(near.scale).toBeGreaterThan(flat.scale);
    expect(near.x).toBeCloseTo(50 / (1 - 90 / 900), 9);
  });

  it('composes rotateX after rotateZ, not the other way round (true isometric, not a spun ellipse)', () => {
    // A point on the disc x axis. Spin 90deg first: it lies on the y axis, then the tilt squashes it.
    const p = project({ x: 100, y: 0, z: 0 }, 60, 90, FLAT);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(100 * Math.cos((60 * Math.PI) / 180), 6);
  });
});

describe('planOffset', () => {
  const geom = { cx: 0.5, cy: 0.5, r: 0.25 };
  // Plate box 200px, image 900x450 (aspect 0.5): frame is 200 / (2*0.25) = 400px wide, 200px tall.

  it('is zero for a region sitting on the plate centre', () => {
    const o = planOffset({ cx: 0.5, cy: 0.5 }, geom, 200, 900, 450);
    expect(o.x).toBeCloseTo(0, 9);
    expect(o.y).toBeCloseTo(0, 9);
  });

  it('scales image fractions by the frame size (width for x, height for y)', () => {
    const o = planOffset({ cx: 0.6, cy: 0.7 }, geom, 200, 900, 450);
    expect(o.x).toBeCloseTo(0.1 * 400, 9);
    expect(o.y).toBeCloseTo(0.2 * 200, 9);
  });

  it('works for a plate that is not in the middle of the photo', () => {
    const o = planOffset({ cx: 0.2, cy: 0.3 }, { cx: 0.3, cy: 0.3, r: 0.25 }, 200, 900, 450);
    expect(o.x).toBeCloseTo(-0.1 * 400, 9);
    expect(o.y).toBeCloseTo(0, 9);
  });
});

describe('layerLift', () => {
  it.each([2, 3, 4, 5, 6, 8])('keeps the whole stack <= 170px for %i layers and each gap in 20..40px', (n) => {
    const lift = layerLift(n);
    expect(lift).toBeGreaterThanOrEqual(20);
    expect(lift).toBeLessThanOrEqual(40);
    expect(lift * n).toBeLessThanOrEqual(170 + 1e-9);
  });

  it('uses the full 40px gap for small stacks', () => {
    expect(layerLift(3)).toBe(40);
  });
});

describe('assignSides', () => {
  it('puts left-of-centre dots left and right-of-centre dots right', () => {
    expect(assignSides([-50, 40, -10, 70], 4)).toEqual(['left', 'right', 'left', 'right']);
  });

  it('caps a column: the dots nearest the centre cross over', () => {
    const xs = [10, 20, 30, 40, 50, 60];
    const sides = assignSides(xs, 4);
    expect(sides.filter((s) => s === 'right')).toHaveLength(4);
    expect(sides.filter((s) => s === 'left')).toHaveLength(2);
    // the two smallest x (nearest the centre line) are the ones that moved left
    expect(sides[0]).toBe('left');
    expect(sides[1]).toBe('left');
  });

  it('puts a dead-centre dot on whichever side is lighter', () => {
    expect(assignSides([0, 30], 4)).toEqual(['left', 'right']);
  });

  it('handles empty input', () => {
    expect(assignSides([], 3)).toEqual([]);
  });
});

describe('spreadLabels', () => {
  const opts = { top: 0, bottom: 400, gap: 50 };

  it('leaves labels where they are when they already have room', () => {
    expect(spreadLabels([20, 120, 300], opts)).toEqual([20, 120, 300]);
  });

  it('pushes a cluster apart by at least the gap, keeping order', () => {
    const out = spreadLabels([100, 105, 110], opts);
    expect(out[1]! - out[0]!).toBeGreaterThanOrEqual(50);
    expect(out[2]! - out[1]!).toBeGreaterThanOrEqual(50);
    expect(out[0]!).toBeLessThan(out[1]!);
  });

  it('keeps the input order of the labels, not sorted order', () => {
    const out = spreadLabels([300, 20, 160], opts);
    expect(out[1]!).toBeLessThan(out[2]!);
    expect(out[2]!).toBeLessThan(out[0]!);
  });

  it('stays inside top..bottom even when the cluster sits at an edge', () => {
    const out = spreadLabels([395, 398, 400], opts);
    for (const y of out) {
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(400);
    }
    expect(out[1]! - out[0]!).toBeGreaterThanOrEqual(50);
    expect(out[2]! - out[1]!).toBeGreaterThanOrEqual(50);
  });

  it('spreads evenly when the gap cannot fit', () => {
    const out = spreadLabels([10, 11, 12, 13, 14], { top: 0, bottom: 100, gap: 50 });
    expect(out[0]).toBeCloseTo(0, 9);
    expect(out[4]).toBeCloseTo(100, 9);
    expect(out[2]! - out[1]!).toBeCloseTo(25, 9);
  });

  it('handles 0 and 1 label', () => {
    expect(spreadLabels([], opts)).toEqual([]);
    expect(spreadLabels([-30], opts)).toEqual([0]);
  });
});
