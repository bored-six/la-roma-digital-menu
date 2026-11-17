// Contract: StageProps carries no category, so the stage finds it from the item id (`${categoryId}/${slug}`) in PAGES.
import { describe, expect, it } from 'vitest';
import { findItemContext } from './itemContext';
import { PAGES } from '../../data/menu';

describe('findItemContext', () => {
  it('finds the category, its icon stem and the page for a real item', () => {
    const c = findItemContext('all-day-breakfast/chicksilog');
    expect(c).not.toBeNull();
    expect(c?.category.title).toBe('All-Day Breakfast');
    expect(c?.category.icon).toBe('icon-breakfast');
    expect(c?.pageId).toBe('breakfast');
    expect(c?.item.name).toBe('Chicksilog');
  });

  it('resolves every one of the 111 menu items, and each hit is the same item', () => {
    let seen = 0;
    for (const page of PAGES) {
      if (page.kind !== 'category') continue;
      for (const category of page.categories) {
        for (const item of category.items) {
          const c = findItemContext(item.id);
          expect(c?.item).toBe(item);
          expect(c?.category).toBe(category);
          expect(c?.pageId).toBe(page.id);
          seen++;
        }
      }
    }
    expect(seen).toBe(111);
  });

  it('returns null for unknown ids, not a throw, and ignores Object.prototype names', () => {
    expect(findItemContext('nope/nothing')).toBeNull();
    expect(findItemContext('')).toBeNull();
    expect(findItemContext('constructor')).toBeNull();
    expect(findItemContext('__proto__')).toBeNull();
  });
});
