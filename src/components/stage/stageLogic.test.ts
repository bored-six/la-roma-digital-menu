// Contract for the pure maths behind the stage (written before stageLogic.ts exists).
//  cropFrame(geom)         CSS numbers that crop a circle (cx, cy, r of the IMAGE WIDTH) out of a photo into a plate box.
//  plateGeomFor(item, p)   the circle to crop for this dish: its own plate, or the alsoFor override when it only shares a file.
//  anatomyFor(...)         Anatomia is offered only for a dish that OWNS its photo and has >= 2 regions.
//  tiltFromPointer(...)    plate tilt in degrees, clamped to +-6, plate turns toward the pointer.
//  tileSlots(n)            where option tiles sit (percent of the stage box). No overlaps, nothing outside the stage.
import { describe, expect, it } from 'vitest';
import {
  STAGE_ASPECT,
  TILE_PX,
  TILT_MAX,
  anatomyFor,
  cropFrame,
  plateGeomFor,
  tileSlots,
  tiltFromPointer,
} from './stageLogic';
import type { AnatomyRegion, Item, PhotoEntry } from '../../types';

const entry = (plate = { cx: 0.5, cy: 0.5, r: 0.3 }, alsoFor: string[] = []): PhotoEntry => ({
  file: 'dishes/x.jpg',
  alt: 'alt',
  alsoFor,
  background: 'table',
  plate,
});
const item = (name: string, extra: Partial<Item> = {}): Item => ({
  id: `cat/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name,
  price: 100,
  badges: [],
  ...extra,
});
const region = (label: string): AnatomyRegion => ({ label, cx: 0.5, cy: 0.5, rx: 0.1, ry: 0.1 });

describe('cropFrame', () => {
  // Simulate the browser: plate box P px, photo W x H px. The frame is positioned at left:50% top:50% with
  // width widthPct% of the plate and translate(shiftX%, shiftY%) of its OWN size. Where does the circle land?
  function landing(g: { cx: number; cy: number; r: number }, W: number, H: number, P: number) {
    const f = cropFrame(g);
    const frameW = (P * f.widthPct) / 100;
    const frameH = (frameW * H) / W;
    const left = P / 2 + (frameW * f.shiftXPct) / 100;
    const top = P / 2 + (frameH * f.shiftYPct) / 100;
    return { x: left + g.cx * frameW, y: top + g.cy * frameH, radius: g.r * frameW };
  }

  it.each([
    ['square', 900, 900, { cx: 0.5, cy: 0.5, r: 0.343 }],
    ['tall', 502, 900, { cx: 0.5, cy: 0.324, r: 0.285 }],
    ['wide', 900, 382, { cx: 0.655, cy: 0.5, r: 0.21 }],
    ['off-centre', 900, 900, { cx: 0.539, cy: 0.505, r: 0.385 }],
  ])('puts the %s photo circle exactly in the middle of the plate and fills it', (_n, W, H, g) => {
    const P = 236;
    const at = landing(g, W, H, P);
    expect(at.x).toBeCloseTo(P / 2, 6);
    expect(at.y).toBeCloseTo(P / 2, 6);
    expect(at.radius).toBeCloseTo(P / 2, 6);
  });

  it('is independent of the plate size', () => {
    const g = { cx: 0.4, cy: 0.6, r: 0.25 };
    expect(cropFrame(g)).toEqual(cropFrame({ ...g }));
    for (const P of [46, 96, 236]) {
      const at = landing(g, 900, 900, P);
      expect(at.radius).toBeCloseTo(P / 2, 6);
    }
  });

  it.each([0, -0.1, NaN, Infinity])('refuses a radius of %s', (r) => {
    expect(() => cropFrame({ cx: 0.5, cy: 0.5, r })).toThrow(RangeError);
  });
});

describe('plateGeomFor', () => {
  const own = { cx: 0.5, cy: 0.645, r: 0.34 };
  const e = entry(own, ['pork-sisig', 'crispy-pata-large']);

  it('uses the photo plate for the dish that owns the photo', () => {
    expect(plateGeomFor(item('Crispy Pata, Regular'), { slug: 'crispy-pata-regular', entry: e })).toEqual(own);
  });

  it('uses the alsoFor plate for a dish that only shares the file (the sisig plate is the TOP one)', () => {
    const g = plateGeomFor(item('Pork Sisig'), { slug: 'crispy-pata-regular', entry: e });
    expect(g).not.toEqual(own);
    expect(g.cy).toBeLessThan(own.cy);
  });

  it('falls back to the photo plate for a shared dish with no known override', () => {
    expect(plateGeomFor(item('Crispy Pata, Large'), { slug: 'crispy-pata-regular', entry: e })).toEqual(own);
  });
});

describe('anatomyFor', () => {
  const photos = {
    chicksilog: entry(),
    'hot-choco-owner': entry(undefined, ['hot-choco']),
    'one-region': entry(),
  };
  const anatomy = {
    chicksilog: [region('Rice'), region('Egg')],
    'hot-choco-owner': [region('A'), region('B')],
    'one-region': [region('Only')],
  };

  it('offers Anatomia for the dish that owns the photo and has >= 2 regions', () => {
    const out = anatomyFor(item('Chicksilog'), photos, anatomy);
    expect(out?.slug).toBe('chicksilog');
    expect(out?.regions).toHaveLength(2);
    expect(out?.entry).toBe(photos.chicksilog);
  });

  it('never offers a dish that merely shares another dish photo (alsoFor)', () => {
    expect(anatomyFor(item('Hot Choco'), photos, anatomy)).toBeNull();
  });

  it('is off when there is only one region, or none', () => {
    expect(anatomyFor(item('One Region'), photos, anatomy)).toBeNull();
    expect(anatomyFor(item('Chicksilog'), photos, {})).toBeNull();
  });

  it('is off when no photo resolves', () => {
    expect(anatomyFor(item('Kare-Kare'), photos, anatomy)).toBeNull();
  });

  it('does not read Object.prototype names as regions', () => {
    expect(anatomyFor(item('Constructor'), { constructor: entry() }, {})).toBeNull();
  });
});

describe('tiltFromPointer', () => {
  const rect = { left: 100, top: 200, width: 400, height: 500 };

  it('is flat in the middle', () => {
    const t = tiltFromPointer(300, 450, rect);
    expect(t.x).toBeCloseTo(0, 9);
    expect(t.y).toBeCloseTo(0, 9);
  });

  it('turns the plate toward the pointer: right = +rotateY, above = +rotateX', () => {
    expect(tiltFromPointer(500, 450, rect).y).toBeCloseTo(TILT_MAX, 9);
    expect(tiltFromPointer(100, 450, rect).y).toBeCloseTo(-TILT_MAX, 9);
    expect(tiltFromPointer(300, 200, rect).x).toBeCloseTo(TILT_MAX, 9);
    expect(tiltFromPointer(300, 700, rect).x).toBeCloseTo(-TILT_MAX, 9);
  });

  it('clamps outside the box and survives a zero-size box', () => {
    expect(tiltFromPointer(9999, -9999, rect)).toEqual({ x: TILT_MAX, y: TILT_MAX });
    expect(tiltFromPointer(5, 5, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('keeps the plate under the 8 degree ceiling from the design system', () => {
    expect(TILT_MAX).toBeLessThanOrEqual(8);
  });
});

describe('tileSlots', () => {
  const W = 350;
  const H = W / STAGE_ASPECT;
  const px = (s: { x: number; y: number }) => ({ x: (s.x / 100) * W, y: (s.y / 100) * H });

  it.each([0, 1, 2, 3, 4, 5, 6])('gives exactly %i slots', (n) => {
    expect(tileSlots(n)).toHaveLength(n);
  });

  it('clamps to 6 and never goes negative', () => {
    expect(tileSlots(9)).toHaveLength(6);
    expect(tileSlots(-2)).toEqual([]);
  });

  it.each([1, 2, 3, 4, 5, 6])('keeps every tile fully inside the stage and apart from each other (n=%i)', (n) => {
    const slots = tileSlots(n).map(px);
    const half = TILE_PX / 2;
    for (const s of slots) {
      expect(s.x - half).toBeGreaterThanOrEqual(0);
      expect(s.x + half).toBeLessThanOrEqual(W);
      expect(s.y - half).toBeGreaterThanOrEqual(0);
      expect(s.y + half).toBeLessThanOrEqual(H);
    }
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i]!;
        const b = slots[j]!;
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(TILE_PX + 6);
      }
    }
  });

  it('keeps tiles off the plate (plate = 56% of the width, centred at 50% / 59%)', () => {
    const plateR = 0.28 * W;
    const c = { x: W / 2, y: 0.593 * H };
    for (const s of tileSlots(6).map(px)) {
      expect(Math.hypot(s.x - c.x, s.y - c.y)).toBeGreaterThan(plateR + TILE_PX * 0.3);
    }
  });

  it('is balanced: left and right counts differ by at most one', () => {
    for (let n = 1; n <= 6; n++) {
      const left = tileSlots(n).filter((s) => s.x < 50).length;
      expect(Math.abs(left - (n - left))).toBeLessThanOrEqual(1);
    }
  });
});
