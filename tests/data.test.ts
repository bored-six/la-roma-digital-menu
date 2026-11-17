// Contract: .claude/steering/spec.md sections 3, 4, 7, plus tests/CONTRACT.md for the open points.
// Source of truth for item names/prices/order is tests/fixtures/pdf-items.json, an independent
// transcription of reference/menu-pages/page-02..14.png. Not derived from src/data/menu.ts.
import { describe, expect, it } from 'vitest';
import { PAGES } from '../src/data/menu';
import { slug } from '../src/lib/slug';
import fixtureJson from './fixtures/pdf-items.json';
import type { Badge, Category, Item, Page } from '../src/types';

interface FxVariant { label: string; price: number }
interface FxItem {
  name: string;
  price: number | null;
  description?: string;
  subgroup?: string;
  variants?: FxVariant[];
  badges?: Badge[];
}
interface FxCategory { id: string; items: FxItem[] }
interface FxPage { id: string; panelPhrases: string[]; categories: FxCategory[] }
const FX = (fixtureJson as unknown as { pages: FxPage[] }).pages;

// Spec section 4 table: page order, ids, indicator labels, category ids and item counts.
const SPEC: Array<{ id: string; kind: Page['kind']; label?: string; cats: Array<[string, number]> }> = [
  { id: 'cover', kind: 'cover', cats: [] },
  { id: 'breakfast', kind: 'category', label: 'Breakfast & Noodles', cats: [['all-day-breakfast', 3], ['noodles', 4]] },
  { id: 'unli-rice', kind: 'category', label: 'Unli Rice', cats: [['unli-rice', 17]] },
  { id: 'pizza', kind: 'category', label: 'Pizza & Starters', cats: [['pizza', 3], ['starters', 2]] },
  { id: 'favourites', kind: 'category', label: 'House Favourites', cats: [['house-favourites', 5]] },
  { id: 'rice-meals', kind: 'category', label: 'Rice Meals & Veg', cats: [['rice-meals', 7], ['vegetables', 4]] },
  { id: 'chicken-beef', kind: 'category', label: 'Chicken & Beef', cats: [['chicken', 5], ['beef', 7]] },
  { id: 'pork', kind: 'category', label: 'Pork', cats: [['pork', 8]] },
  { id: 'sea', kind: 'category', label: 'From the Sea', cats: [['from-the-sea', 10]] },
  { id: 'soup', kind: 'category', label: 'Soup', cats: [['soup', 6]] },
  { id: 'salad-rice', kind: 'category', label: 'Salad & Rice', cats: [['salad', 5], ['rice', 6]] },
  { id: 'cold-drinks', kind: 'category', label: 'Cold Drinks', cats: [['cold-drinks', 10]] },
  { id: 'hot-drinks', kind: 'category', label: 'Hot Drinks & Beer', cats: [['hot-drinks', 9]] },
  { id: 'grazie', kind: 'closing', cats: [] },
];

const categoriesOf = (p: Page): Category[] => (p.kind === 'category' ? p.categories : []);
const ALL_CATEGORIES: Category[] = PAGES.flatMap(categoriesOf);
const ALL_ITEMS: Item[] = ALL_CATEGORIES.flatMap((c) => c.items);
const byId = (id: string): Item | undefined => ALL_ITEMS.find((i) => i.id === id);
const categoryById = (id: string): Category | undefined => ALL_CATEGORIES.find((c) => c.id === id);
const MIDDOT = '·';

describe('menu structure (spec section 4)', () => {
  it('has 14 pages in the exact spec order with the spec ids', () => {
    expect(PAGES.map((p) => p.id)).toEqual(SPEC.map((s) => s.id));
    expect(PAGES).toHaveLength(14);
  });

  it('page ids are unique', () => {
    const ids = PAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cover is first, closing is last, everything between is a category page', () => {
    expect(PAGES[0]).toEqual({ kind: 'cover', id: 'cover' });
    expect(PAGES[PAGES.length - 1]).toEqual({ kind: 'closing', id: 'grazie' });
    expect(PAGES.map((p) => p.kind)).toEqual(SPEC.map((s) => s.kind));
  });

  it('category pages carry the indicator label from the spec table', () => {
    const labels = PAGES.map((p) => (p.kind === 'category' ? p.label : undefined));
    expect(labels).toEqual(SPEC.map((s) => s.label));
  });

  it.each(SPEC.filter((s) => s.kind === 'category'))('page $id has exactly the spec categories with the spec item counts', (spec) => {
    const page = PAGES.find((p) => p.id === spec.id);
    expect(page?.kind).toBe('category');
    const actual = page ? categoriesOf(page).map((c) => [c.id, c.items.length]) : [];
    expect(actual).toEqual(spec.cats);
  });

  it('has 111 items in total', () => {
    expect(ALL_ITEMS).toHaveLength(111);
  });

  it('category ids are unique and kebab-case', () => {
    const ids = ALL_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('every item id is globally unique and equals `${categoryId}/${slug(name)}`', () => {
    const ids = ALL_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of ALL_CATEGORIES) {
      for (const i of c.items) {
        expect(slug(i.name), `slug of "${i.name}"`).not.toBe('');
        expect(i.id).toBe(`${c.id}/${slug(i.name)}`);
      }
    }
  });

  it('every category has a non-empty title, a bare icon name (no path, no extension) and a notes array', () => {
    for (const c of ALL_CATEGORIES) {
      expect(c.title.trim(), `title of ${c.id}`).not.toBe('');
      expect(c.icon, `icon of ${c.id}`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(Array.isArray(c.notes), `notes of ${c.id}`).toBe(true);
    }
  });

  it('names and descriptions have no stray whitespace', () => {
    const clean = (s: string) => s === s.trim().replace(/\s+/g, ' ');
    for (const i of ALL_ITEMS) {
      expect(clean(i.name), `name "${i.name}"`).toBe(true);
      if (i.description !== undefined) expect(clean(i.description), `description of ${i.id}`).toBe(true);
    }
  });
});

describe('items match the PDF transcription (tests/fixtures/pdf-items.json)', () => {
  it('fixture itself covers the same pages as the app, minus cover/closing', () => {
    expect(FX.map((p) => p.id)).toEqual(SPEC.filter((s) => s.kind === 'category').map((s) => s.id));
  });

  const pageOf = (id: string): Category[] => {
    const page = PAGES.find((p) => p.id === id);
    return page ? categoriesOf(page) : [];
  };

  it.each(FX.map((p) => [p.id, p] as const))('page %s: category ids, names verbatim, prices, order', (id, fx) => {
    const actual = pageOf(id).map((c) => ({
      id: c.id,
      items: c.items.map((i) => ({ name: i.name, price: i.price })),
    }));
    const expected = fx.categories.map((c) => ({
      id: c.id,
      items: c.items.map((i) => ({ name: i.name, price: i.price })),
    }));
    expect(actual).toEqual(expected);
  });

  it.each(FX.map((p) => [p.id, p] as const))('page %s: italic descriptions verbatim (absent when the PDF has none)', (id, fx) => {
    const actual = pageOf(id).map((c) => c.items.map((i) => i.description));
    const expected = fx.categories.map((c) => c.items.map((i) => i.description));
    expect(actual).toEqual(expected);
  });

  it.each(FX.map((p) => [p.id, p] as const))('page %s: subgroup, variants and badges', (id, fx) => {
    const actual = pageOf(id).map((c) =>
      c.items.map((i) => ({ subgroup: i.subgroup, variants: i.variants, badges: i.badges })),
    );
    const expected = fx.categories.map((c) =>
      c.items.map((i) => ({ subgroup: i.subgroup, variants: i.variants, badges: i.badges ?? [] })),
    );
    expect(actual).toEqual(expected);
  });
});

describe('price rules (spec section 3)', () => {
  it('every price is a whole number > 0, or null', () => {
    for (const i of ALL_ITEMS) {
      if (i.price === null) continue;
      expect(Number.isInteger(i.price), `${i.id} price ${String(i.price)}`).toBe(true);
      expect(i.price, `${i.id} price`).toBeGreaterThan(0);
    }
  });

  it('null price is ONLY pork/crispy-pata-regular and pork/crispy-pata-large', () => {
    const nulls = ALL_ITEMS.filter((i) => i.price === null).map((i) => i.id).sort();
    expect(nulls).toEqual(['pork/crispy-pata-large', 'pork/crispy-pata-regular']);
  });

  it('items with variants: price equals the cheapest variant, variants are whole pesos', () => {
    for (const i of ALL_ITEMS) {
      if (i.variants === undefined) continue;
      expect(i.variants.length, `${i.id} variants`).toBeGreaterThan(0);
      for (const v of i.variants) {
        expect(Number.isInteger(v.price) && v.price > 0, `${i.id} ${v.label}`).toBe(true);
      }
      expect(i.price, `${i.id} price`).toBe(Math.min(...i.variants.map((v) => v.price)));
    }
  });

  it('exactly the 3 Cold Drinks have variants, Glass 69 then Pitcher 130', () => {
    const withVariants = ALL_ITEMS.filter((i) => i.variants !== undefined);
    expect(withVariants.map((i) => i.id).sort()).toEqual([
      'cold-drinks/blue-lemonade',
      'cold-drinks/cucumber-lemonade',
      'cold-drinks/iced-tea',
    ]);
    for (const i of withVariants) {
      expect(i.variants).toEqual([
        { label: 'Glass', price: 69 },
        { label: 'Pitcher', price: 130 },
      ]);
      expect(i.price).toBe(69);
    }
  });

  it('items in different sections keep their own price (Unli Rice deal vs full dish)', () => {
    expect(byId('unli-rice/tuna-sisig')?.price).toBe(99);
    expect(byId('from-the-sea/tuna-sisig')?.price).toBe(250);
    expect(byId('unli-rice/tinolang-isda')?.price).toBe(99);
    expect(byId('soup/tinolang-isda')?.price).toBe(240);
    expect(byId('unli-rice/grilled-tuna-belly')?.price).toBe(198);
    expect(byId('from-the-sea/grilled-tuna-belly')?.price).toBe(340);
  });
});

describe('badges and subgroups', () => {
  const ALLOWED: Badge[] = ['Unli rice', 'For sharing', 'Soup', 'Dessert'];

  it('every item has a badges array with only allowed values and no repeats', () => {
    for (const i of ALL_ITEMS) {
      expect(Array.isArray(i.badges), `${i.id} badges`).toBe(true);
      for (const b of i.badges) expect(ALLOWED, `${i.id}`).toContain(b);
      expect(new Set(i.badges).size, `${i.id} repeats`).toBe(i.badges.length);
    }
  });

  it('every item in unli-rice has the Unli rice badge, and no item outside unli-rice has it', () => {
    const unli = categoryById('unli-rice');
    expect(unli).toBeDefined();
    for (const i of unli?.items ?? []) expect(i.badges, i.id).toContain('Unli rice');
    for (const c of ALL_CATEGORIES) {
      if (c.id === 'unli-rice') continue;
      for (const i of c.items) expect(i.badges, i.id).not.toContain('Unli rice');
    }
  });

  it('House Favourites badges: For sharing x2, Soup x2, Dessert x1', () => {
    const count = (b: Badge) => (categoryById('house-favourites')?.items ?? []).filter((i) => i.badges.includes(b)).length;
    expect(count('For sharing')).toBe(2);
    expect(count('Soup')).toBe(2);
    expect(count('Dessert')).toBe(1);
  });

  it('drink subgroup counts: Water and Soda 3, Juice 2, Cold Drinks 3, Shakes 2, Hot 4, Beer 5; no subgroup anywhere else', () => {
    const counts: Record<string, number> = {};
    for (const c of ALL_CATEGORIES) {
      for (const i of c.items) {
        if (i.subgroup === undefined) continue;
        expect(['cold-drinks', 'hot-drinks'], `${i.id} has a subgroup outside drinks`).toContain(c.id);
        counts[i.subgroup] = (counts[i.subgroup] ?? 0) + 1;
      }
    }
    expect(counts).toEqual({ 'Water and Soda': 3, Juice: 2, 'Cold Drinks': 3, Shakes: 2, Hot: 4, Beer: 5 });
  });
});

describe('notes and taglines', () => {
  it('Pizza note is exactly "Pizza: no pork · family size, 12 inch" and every pizza has "Family size, 12 inch"', () => {
    expect(categoryById('pizza')?.notes).toEqual([{ text: `Pizza: no pork ${MIDDOT} family size, 12 inch` }]);
    for (const i of categoryById('pizza')?.items ?? []) expect(i.description, i.id).toBe('Family size, 12 inch');
  });

  it('Unli Rice banner note is "Unlimited rice · Free drinks and soup"', () => {
    expect(categoryById('unli-rice')?.notes).toEqual([{ text: `Unlimited rice ${MIDDOT} Free drinks and soup` }]);
  });

  it('Soup note links to favourites, and that page really holds Tyulah Itum and Bulalo', () => {
    const notes = categoryById('soup')?.notes ?? [];
    expect(notes).toEqual([{ text: 'More soups: Tyulah Itum and Bulalo', jumpTo: 'favourites' }]);
    const target = PAGES.find((p) => p.id === notes[0]?.jumpTo);
    expect(target, 'jumpTo resolves to a real page').toBeDefined();
    expect(target?.kind).toBe('category');
    const names = target ? categoriesOf(target).flatMap((c) => c.items.map((i) => i.name)) : [];
    expect(names).toContain('Tyulah Itum');
    expect(names).toContain('Bulalo');
  });

  it('every jumpTo anywhere points at a real category page', () => {
    const categoryPageIds = PAGES.filter((p) => p.kind === 'category').map((p) => p.id);
    for (const c of ALL_CATEGORIES) {
      for (const n of c.notes) {
        if (n.jumpTo !== undefined) expect(categoryPageIds, `${c.id} note "${n.text}"`).toContain(n.jumpTo);
      }
    }
  });

  it('no other category carries a note (the PDF prints none)', () => {
    for (const c of ALL_CATEGORIES) {
      if (['pizza', 'unli-rice', 'soup'].includes(c.id)) continue;
      expect(c.notes, c.id).toEqual([]);
    }
  });

  it('taglines are copied from the PDF side panels (case-insensitive) and no page invents one', () => {
    for (const fx of FX) {
      const page = PAGES.find((p) => p.id === fx.id);
      const cats = page ? categoriesOf(page) : [];
      const allowed = fx.panelPhrases.map((s) => s.toLowerCase());
      const taglines = cats.map((c) => c.tagline).filter((t): t is string => t !== undefined);
      for (const t of taglines) expect(allowed, `tagline "${t}" on page ${fx.id}`).toContain(t.trim().toLowerCase());
      if (allowed.length > 0) expect(taglines.length, `page ${fx.id} should carry its panel tagline`).toBeGreaterThan(0);
    }
  });
});

describe('spot checks across all pages (id, price)', () => {
  const SPOT: Array<[string, number | null]> = [
    // breakfast
    ['all-day-breakfast/chicksilog', 150],
    ['all-day-breakfast/tapsilog', 150],
    ['noodles/bam-e', 220],
    // unli rice, PDF p3 and p4
    ['unli-rice/chicken-bbq', 99],
    ['unli-rice/pork-bbq-3-sticks', 99],
    ['unli-rice/tuna-sisig', 99],
    ['unli-rice/seafood-medley', 148],
    ['unli-rice/crispy-pork-chop', 148],
    ['unli-rice/grilled-tuna-panga', 198],
    ['unli-rice/fried-pompano', 220],
    // pizza and starters
    ['pizza/hawaiian', 299],
    ['pizza/all-meat-overload', 310],
    ['starters/fries', 100],
    ['starters/cheese-stick', 120],
    // favourites
    ['house-favourites/small-bilao', 550],
    ['house-favourites/medium-bilao', 950],
    ['house-favourites/halo-halo', 100],
    // rice meals and veg
    ['rice-meals/chicken-bbq', 99],
    ['vegetables/pinakbet', 240],
    // chicken and beef
    ['chicken/chicken-skin', 220],
    ['beef/tenderloin-steak', 450],
    ['beef/lumpia-shanghai', 250],
    // pork
    ['pork/lechon-kawali', 280],
    ['pork/pata-with-pork-and-beans', 250],
    ['pork/crispy-pata-regular', null],
    ['pork/crispy-pata-large', null],
    // sea, PDF p10 and p11
    ['from-the-sea/grilled-tuna-belly', 340],
    ['from-the-sea/fish-fillet-black-bean-sauce', 250],
    ['from-the-sea/tuna-sisig', 250],
    ['from-the-sea/crispy-shrimps', 230],
    // soup
    ['soup/sinigang-na-baboy', 250],
    ['soup/lomi', 210],
    // salad and rice
    ['salad/salad-solo', 120],
    ['rice/plain-scoop-rice', 30],
    ['rice/shanghai-fried-rice', 200],
    // drinks
    ['cold-drinks/bottled-water', 30],
    ['cold-drinks/coke-sprite-royal-mountain-dew', 40],
    ['cold-drinks/coke-1-5-l', 140],
    ['cold-drinks/iced-tea', 69],
    ['cold-drinks/buko-pandan', 80],
    ['hot-drinks/barako-brewed-coffee', 60],
    ['hot-drinks/pale-pilsen', 75],
    ['hot-drinks/cali', 75],
  ];

  it('covers at least 25 items', () => {
    expect(SPOT.length).toBeGreaterThanOrEqual(25);
  });

  it.each(SPOT)('%s costs %s', (id, price) => {
    const item = byId(id);
    expect(item, `item ${id} exists`).toBeDefined();
    expect(item?.price).toBe(price);
  });
});
