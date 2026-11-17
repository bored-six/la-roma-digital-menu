import type { Item, PhotoEntry } from '../types';
import { resolvePhoto, type ResolvedPhoto } from './photos';

export interface Tile {
  item: Item;
  /** null means the tile shows the laurel placeholder. */
  photo: ResolvedPhoto | null;
}

/**
 * Tiles around the plate: every other item except the selected one, items with a photo first,
 * then photo-less ones, each group in list order, no repeated ids, at most `max`.
 * Never mutates `items`.
 */
export function pickTiles(
  items: readonly Item[],
  selectedId: string,
  photos: Record<string, PhotoEntry>,
  max = 6,
): Tile[] {
  const limit = Math.floor(max);
  if (!(limit > 0)) return [];

  const seen = new Set<string>();
  const withPhoto: Tile[] = [];
  const withoutPhoto: Tile[] = [];
  for (const item of items) {
    if (item.id === selectedId || seen.has(item.id)) continue;
    seen.add(item.id);
    const photo = resolvePhoto(item, photos);
    (photo === null ? withoutPhoto : withPhoto).push({ item, photo });
  }
  return withPhoto.concat(withoutPhoto).slice(0, limit);
}

/** First item with a resolvable photo, else the first item, else null. */
export function defaultSelectedId(items: readonly Item[], photos: Record<string, PhotoEntry>): string | null {
  const withPhoto = items.find((item) => resolvePhoto(item, photos) !== null);
  return (withPhoto ?? items[0])?.id ?? null;
}
