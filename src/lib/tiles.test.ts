// Contract: pickTiles(items, selectedId, photos, max = 6) (spec section 3): other items with a photo first,
// then placeholders, total <= max, selected excluded, no duplicates.
// Return shape decided in tests/CONTRACT.md: Array<{ item: Item; photo: { slug, entry } | null }>, photo = resolvePhoto result.
import { describe, expect, it } from 'vitest';
import { pickTiles } from './tiles';
import type { Item, PhotoEntry } from '../types';

const entry = (alsoFor: string[] = []): PhotoEntry => ({
  file: 'dishes/x.jpg',
  alt: 'alt',
  alsoFor,
  background: 'table',
  plate: { cx: 0.5, cy: 0.5, r: 0.3 },
});
// Local kebab on purpose: this file must not depend on slug.ts being right.
const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const item = (name: string, extra: Partial<Item> = {}): Item => ({
  id: `cat/${kebab(name)}`,
  name,
  price: 100,
  badges: [],
  ...extra,
});
const ids = (tiles: Array<{ item: Item }>) => tiles.map((t) => t.item.id);

// Eight dishes, photo ones are p1..p4, photo-less are n1..n4, interleaved on purpose.
const p1 = item('P1'); const n1 = item('N1'); const n2 = item('N2'); const p2 = item('P2');
const p3 = item('P3'); const n3 = item('N3'); const p4 = item('P4'); const n4 = item('N4');
const MIXED = [p1, n1, n2, p2, p3, n3, p4, n4];
const PHOTOS = { p1: entry(), p2: entry(), p3: entry(), p4: entry() };

describe('pickTiles', () => {
  it('excludes the selected item', () => {
    const out = pickTiles(MIXED, p1.id, PHOTOS, 10);
    expect(ids(out)).not.toContain(p1.id);
    expect(out).toHaveLength(7);
  });

  it('puts items with a photo first and placeholders after, keeping list order inside each group', () => {
    expect(ids(pickTiles(MIXED, p1.id, PHOTOS))).toEqual([p2.id, p3.id, p4.id, n1.id, n2.id, n3.id]);
  });

  it('photo-less items never push out photo items when max cuts the list', () => {
    const list = [p1, n1, n2, p2, p3];
    expect(ids(pickTiles(list, p1.id, PHOTOS, 2))).toEqual([p2.id, p3.id]);
  });

  it('total is at most max, and max defaults to 6', () => {
    const many = Array.from({ length: 12 }, (_, i) => item(`Dish ${i}`));
    const photos = Object.fromEntries(many.map((d) => [kebab(d.name), entry()]));
    expect(pickTiles(many, many[0]!.id, photos)).toHaveLength(6);
    expect(pickTiles(many, many[0]!.id, photos, 3)).toHaveLength(3);
    expect(pickTiles(many, many[0]!.id, photos, 1)).toHaveLength(1);
    expect(pickTiles(many, many[0]!.id, photos, 50)).toHaveLength(11);
  });

  it('exactly fills max with placeholders when photo items run out', () => {
    const list = [p1, p2, n1, n2, n3, n4];
    expect(ids(pickTiles(list, p1.id, PHOTOS, 3))).toEqual([p2.id, n1.id, n2.id]);
  });

  it('max 0 or negative gives no tiles (a negative max must not slice from the end)', () => {
    expect(pickTiles(MIXED, p1.id, PHOTOS, 0)).toEqual([]);
    expect(pickTiles(MIXED, p1.id, PHOTOS, -1)).toEqual([]);
    expect(pickTiles(MIXED, p1.id, PHOTOS, -100)).toEqual([]);
  });

  it('a category of one item (the selected one) gives []', () => {
    expect(pickTiles([p1], p1.id, PHOTOS)).toEqual([]);
  });

  it('an empty items list gives []', () => {
    expect(pickTiles([], 'anything', PHOTOS)).toEqual([]);
    expect(pickTiles([], '', {})).toEqual([]);
  });

  it('a selectedId that is not in the list excludes nothing', () => {
    const out = pickTiles([p1, p2, n1], 'cat/not-there', PHOTOS);
    expect(ids(out)).toEqual([p1.id, p2.id, n1.id]);
    expect(ids(pickTiles([p1, p2, n1], '', PHOTOS))).toEqual([p1.id, p2.id, n1.id]);
  });

  it('all photo-less: placeholders only, in list order, each with photo null', () => {
    const list = [n1, n2, n3, n4];
    const out = pickTiles(list, n2.id, {});
    expect(ids(out)).toEqual([n1.id, n3.id, n4.id]);
    for (const t of out) expect(t.photo).toBeNull();
  });

  it('photo-less items carry photo null, photo items carry { slug, entry } with the entry from the map', () => {
    const out = pickTiles([p1, p2, n1], p1.id, PHOTOS);
    expect(out[0]?.item.id).toBe(p2.id);
    expect(out[0]?.photo?.slug).toBe('p2');
    expect(out[0]?.photo?.entry).toBe(PHOTOS.p2);
    expect(out[1]?.item.id).toBe(n1.id);
    expect(out[1]?.photo).toBeNull();
  });

  it('an item that only has a photo through alsoFor counts as a photo item and reports the owning key', () => {
    const hot = item('Hot Choco');
    const photos = { 'barako-brewed-coffee': entry(['hot-choco']) };
    const out = pickTiles([n1, hot, n2], n2.id, photos);
    expect(ids(out)).toEqual([hot.id, n1.id]);
    expect(out[0]?.photo?.slug).toBe('barako-brewed-coffee');
  });

  it('an item with an explicit photoSlug override counts as a photo item', () => {
    const odd = item('Family Bilao', { photoSlug: 'small-bilao' });
    const out = pickTiles([n1, odd], 'x', { 'small-bilao': entry() });
    expect(ids(out)).toEqual([odd.id, n1.id]);
    expect(out[0]?.photo?.slug).toBe('small-bilao');
  });

  it('never returns the same item twice, even if the input repeats an id', () => {
    const dupP2 = { ...p2 };
    const out = pickTiles([p1, p2, dupP2, n1, n1], p1.id, PHOTOS);
    expect(ids(out)).toEqual([p2.id, n1.id]);
  });

  it('excludes every copy of the selected id', () => {
    const dup = { ...p1 };
    expect(ids(pickTiles([p1, p2, dup], p1.id, PHOTOS))).toEqual([p2.id]);
  });

  it('does not reorder or modify the input list (frozen input must not throw)', () => {
    const frozen = Object.freeze([...MIXED]);
    expect(() => pickTiles(frozen as Item[], p1.id, PHOTOS)).not.toThrow();
    expect(frozen.map((i) => i.id)).toEqual(MIXED.map((i) => i.id));
  });
});
