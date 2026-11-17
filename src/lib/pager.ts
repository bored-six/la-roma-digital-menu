import type { Page } from '../types';

/** Integer in [0, count-1]. NaN, a NaN/non-finite count or count <= 1 give 0. Never wraps. */
export function clampIndex(index: number, count: number): number {
  if (!Number.isFinite(count) || count <= 1) return 0;
  if (Number.isNaN(index)) return 0;
  const max = Math.floor(count) - 1;
  return Math.min(max, Math.max(0, Math.floor(index)));
}

/** Page under a horizontal scroll position. Exactly half a page rounds up. width <= 0 or NaN gives 0. */
export function indexFromScroll(scrollLeft: number, width: number, count: number): number {
  if (!(width > 0)) return 0;
  return clampIndex(Math.round(scrollLeft / width), count);
}

/**
 * Index of the page whose id equals the hash, else 0.
 * Strips one leading '#', trailing '/', percent-decodes (malformed gives 0), lowercases.
 */
export function pageIndexFromHash(hash: string, pages: readonly Page[]): number {
  let key = hash.startsWith('#') ? hash.slice(1) : hash;
  key = key.replace(/\/+$/, '');
  try {
    key = decodeURIComponent(key);
  } catch {
    return 0;
  }
  key = key.toLowerCase();
  if (key === '') return 0;
  const index = pages.findIndex((p) => p.id === key);
  return index === -1 ? 0 : index;
}

/** Indicator text for any page. Cover and closing carry no label in the data, so they are named here. */
export function pageLabel(page: Page): string {
  if (page.kind === 'cover') return 'La Roma';
  if (page.kind === 'closing') return 'Grazie';
  return page.label;
}
