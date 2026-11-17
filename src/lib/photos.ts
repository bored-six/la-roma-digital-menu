import type { Item, PhotoEntry } from '../types';
import { slug } from './slug';

export interface ResolvedPhoto {
  /** The KEY of the photos map that owns the image (not the item slug when it came through alsoFor). */
  slug: string;
  entry: PhotoEntry;
}

function own(photos: Record<string, PhotoEntry>, key: string): PhotoEntry | undefined {
  return Object.hasOwn(photos, key) ? photos[key] : undefined;
}

/**
 * Order (tests/CONTRACT.md): explicit item.photoSlug if it is an own key, then the item's own slug,
 * then the first entry in key order whose alsoFor lists the item's slug, else null.
 * Own-property lookups only, so a dish called "Constructor" never resolves to Object.prototype.
 */
export function resolvePhoto(item: Item, photos: Record<string, PhotoEntry>): ResolvedPhoto | null {
  if (item.photoSlug !== undefined) {
    const explicit = own(photos, item.photoSlug);
    if (explicit !== undefined) return { slug: item.photoSlug, entry: explicit };
  }

  const itemSlug = slug(item.name);
  if (itemSlug === '') return null;

  const direct = own(photos, itemSlug);
  if (direct !== undefined) return { slug: itemSlug, entry: direct };

  for (const [key, entry] of Object.entries(photos)) {
    if (entry.alsoFor.includes(itemSlug)) return { slug: key, entry };
  }
  return null;
}
