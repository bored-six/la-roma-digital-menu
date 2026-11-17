// Contract: resolvePhoto(item, photos): { slug, entry } | null (spec section 3).
// Order decided in tests/CONTRACT.md: explicit item.photoSlug (if it names a real entry), then the item's own
// slug, then the first entry (in key order) whose alsoFor lists the item's slug. `slug` is the photos KEY.
import { describe, expect, it } from 'vitest';
import { resolvePhoto } from './photos';
import type { Item, PhotoEntry } from '../types';

const entry = (alsoFor: string[] = [], file = 'dishes/x.jpg'): PhotoEntry => ({
  file,
  alt: 'alt text',
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

describe('resolvePhoto', () => {
  it('finds the photo by the item own slug and returns the very same entry object', () => {
    const photos = { chicksilog: entry() };
    const r = resolvePhoto(item('Chicksilog'), photos);
    expect(r?.slug).toBe('chicksilog');
    expect(r?.entry).toBe(photos.chicksilog);
  });

  it('slugs printed names with punctuation before looking them up', () => {
    const photos = { 'crispy-pata-regular': entry(), 'pork-bbq-3-sticks': entry(), 'bam-e': entry() };
    expect(resolvePhoto(item('Crispy Pata, Regular'), photos)?.slug).toBe('crispy-pata-regular');
    expect(resolvePhoto(item('Pork BBQ (3 sticks)'), photos)?.slug).toBe('pork-bbq-3-sticks');
    expect(resolvePhoto(item('Bam-E'), photos)?.slug).toBe('bam-e');
  });

  it('falls back to alsoFor and reports the KEY of the entry that owns the photo, not the item slug', () => {
    const photos = { 'barako-brewed-coffee': entry(['hot-choco']) };
    const r = resolvePhoto(item('Hot Choco'), photos);
    expect(r?.slug).toBe('barako-brewed-coffee');
    expect(r?.entry).toBe(photos['barako-brewed-coffee']);
  });

  it('own slug beats alsoFor when both would match', () => {
    const photos = { 'iced-tea': entry(['blue-lemonade']), 'blue-lemonade': entry() };
    expect(resolvePhoto(item('Blue Lemonade'), photos)?.slug).toBe('blue-lemonade');
  });

  it('with several alsoFor matches the first entry in key order wins', () => {
    const photos = { a: entry(['shared']), b: entry(['shared']) };
    expect(resolvePhoto(item('Shared'), photos)?.slug).toBe('a');
  });

  it('an explicit photoSlug override beats the own slug', () => {
    const photos = { chicksilog: entry(), bangsilog: entry() };
    const r = resolvePhoto(item('Chicksilog', { photoSlug: 'bangsilog' }), photos);
    expect(r?.slug).toBe('bangsilog');
    expect(r?.entry).toBe(photos.bangsilog);
  });

  it('an override works even when the item name matches nothing', () => {
    const photos = { 'small-bilao': entry() };
    expect(resolvePhoto(item('Family Bilao', { photoSlug: 'small-bilao' }), photos)?.slug).toBe('small-bilao');
  });

  it('an override that names a missing entry falls back to normal resolution, then null', () => {
    const photos = { chicksilog: entry() };
    expect(resolvePhoto(item('Chicksilog', { photoSlug: 'does-not-exist' }), photos)?.slug).toBe('chicksilog');
    expect(resolvePhoto(item('Tapsilog', { photoSlug: 'does-not-exist' }), photos)).toBeNull();
  });

  it('returns null when nothing matches, including an empty photo map', () => {
    expect(resolvePhoto(item('Bihon'), { chicksilog: entry() })).toBeNull();
    expect(resolvePhoto(item('Bihon'), {})).toBeNull();
  });

  it('matches whole slugs only, never prefixes or substrings', () => {
    const photos = { 'iced-tea': entry(), 'grilled-tuna-belly': entry() };
    expect(resolvePhoto(item('Iced'), photos)).toBeNull();
    expect(resolvePhoto(item('Tea'), photos)).toBeNull();
    expect(resolvePhoto(item('Grilled Tuna'), photos)).toBeNull();
  });

  it('an item whose name slugs to nothing gets no photo', () => {
    expect(resolvePhoto(item(''), { '': entry() })).toBeNull();
    expect(resolvePhoto(item('(!)'), { '': entry() })).toBeNull();
  });

  it('an item named "Constructor" does not resolve to the inherited Object constructor', () => {
    const photos = { chicksilog: entry(['bangsilog']) };
    expect(resolvePhoto(item('Constructor'), photos)).toBeNull();
    expect(resolvePhoto(item('Constructor'), {})).toBeNull();
  });

  it('an override naming an Object.prototype member does not resolve to inherited junk', () => {
    const photos = { chicksilog: entry() };
    for (const bad of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf']) {
      expect(resolvePhoto(item('Anything', { photoSlug: bad }), photos), bad).toBeNull();
      expect(resolvePhoto(item('Anything', { photoSlug: bad }), {}), `${bad} on empty map`).toBeNull();
    }
  });
});
