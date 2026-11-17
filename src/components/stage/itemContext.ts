// StageProps carries no category, but an item id is `${categoryId}/${slug(name)}`, so the category (title, icon) comes from PAGES.
import { PAGES } from '../../data/menu';
import type { Category, Item, PageId } from '../../types';

export interface ItemContext {
  item: Item;
  category: Category;
  pageId: PageId;
}

let index: Map<string, ItemContext> | null = null;

function build(): Map<string, ItemContext> {
  const map = new Map<string, ItemContext>();
  for (const page of PAGES) {
    if (page.kind !== 'category') continue;
    for (const category of page.categories) {
      for (const item of category.items) {
        if (!map.has(item.id)) map.set(item.id, { item, category, pageId: page.id });
      }
    }
  }
  return map;
}

/** Where this item lives in the menu. null for an id that is not in PAGES. Built once, Map lookups only. */
export function findItemContext(itemId: string): ItemContext | null {
  index ??= build();
  return index.get(itemId) ?? null;
}
