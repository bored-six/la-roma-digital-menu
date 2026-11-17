// Typed handles on the two data files the stage reads. Kept in one place so the cast lives once.
import photosJson from '../../data/photos.json';
import { ANATOMY } from '../../data/anatomy';
import type { AnatomyRegion, PhotoEntry } from '../../types';

export const PHOTOS = photosJson as Record<string, PhotoEntry>;
export const ANATOMY_REGIONS: Record<string, AnatomyRegion[]> = ANATOMY;

/** public/ files are served from BASE_URL, so the site also works from a sub-path host. */
export const photoUrl = (file: string): string => `${import.meta.env.BASE_URL}${file}`;

const loaded = new Map<string, Promise<void>>();

/** Resolves once the image is decoded (or failed: a broken photo must never freeze a swap). Cached per url. */
export function preloadImage(url: string): Promise<void> {
  const hit = loaded.get(url);
  if (hit !== undefined) return hit;
  const p = new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (typeof img.decode === 'function') img.decode().then(() => resolve(), () => resolve());
      else resolve();
    };
    img.onerror = () => resolve();
    img.src = url;
  });
  loaded.set(url, p);
  return p;
}

/** Natural size of a photo, cached. Needed by Anatomia to place regions on the disc plane. */
const sizes = new Map<string, { w: number; h: number }>();
export function cachedSize(url: string): { w: number; h: number } | null {
  return sizes.get(url) ?? null;
}
export function loadSize(url: string): Promise<{ w: number; h: number }> {
  const hit = sizes.get(url);
  if (hit !== undefined) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = { w: img.naturalWidth, h: img.naturalHeight };
      sizes.set(url, size);
      resolve(size);
    };
    img.onerror = () => reject(new Error(`photo failed to load: ${url}`));
    img.src = url;
  });
}
