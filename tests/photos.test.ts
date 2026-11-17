// Contract: spec section 7 (photos.test.ts row) and section 3 (PhotoEntry, anatomy keyed by photo slug).
// Reads the real src/data/photos.json and public/ on disk. Node environment only.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ANATOMY } from '../src/data/anatomy';
import { PAGES } from '../src/data/menu';
import { slug } from '../src/lib/slug';
import type { PhotoEntry } from '../src/types';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PHOTOS = JSON.parse(readFileSync(`${ROOT}src/data/photos.json`, 'utf8')) as Record<string, PhotoEntry>;
const ENTRIES = Object.entries(PHOTOS);

const ITEMS = PAGES.flatMap((p) => (p.kind === 'category' ? p.categories.flatMap((c) => c.items) : []));
const ITEM_SLUGS = new Set(ITEMS.map((i) => slug(i.name)));

describe('photos.json against public/ and the menu', () => {
  it('has at least one photo entry', () => {
    expect(ENTRIES.length).toBeGreaterThan(0);
  });

  it('every file exists under public/ and is a non-empty JPEG when it says .jpg', () => {
    const problems: string[] = [];
    for (const [key, e] of ENTRIES) {
      if (typeof e.file !== 'string' || e.file === '' || e.file.startsWith('/') || e.file.includes('..')) {
        problems.push(`${key}: bad path "${String(e.file)}"`);
        continue;
      }
      const path = `${ROOT}public/${e.file}`;
      if (!existsSync(path)) {
        problems.push(`${key}: missing public/${e.file}`);
        continue;
      }
      if (statSync(path).size === 0) problems.push(`${key}: empty file ${e.file}`);
      if (e.file.endsWith('.jpg')) {
        const head = readFileSync(path).subarray(0, 3);
        if (!(head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff)) problems.push(`${key}: ${e.file} is not a JPEG`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('no two entries point at the same file', () => {
    const files = ENTRIES.map(([, e]) => e.file);
    expect(new Set(files).size).toBe(files.length);
  });

  it('every key is the slug of some item name', () => {
    const orphans = Object.keys(PHOTOS).filter((k) => !ITEM_SLUGS.has(k));
    expect(orphans).toEqual([]);
  });

  it('every alsoFor slug is the slug of some item name', () => {
    const orphans = ENTRIES.flatMap(([key, e]) => e.alsoFor.filter((s) => !ITEM_SLUGS.has(s)).map((s) => `${key} -> ${s}`));
    expect(orphans).toEqual([]);
  });

  it('alsoFor is unambiguous: never a key itself, never its own entry, listed under one entry only', () => {
    const keys = new Set(Object.keys(PHOTOS));
    const owner = new Map<string, string>();
    const problems: string[] = [];
    for (const [key, e] of ENTRIES) {
      for (const s of e.alsoFor) {
        if (s === key) problems.push(`${key} lists itself`);
        if (keys.has(s)) problems.push(`${s} has its own photo but is also listed under ${key}`);
        const prev = owner.get(s);
        if (prev !== undefined && prev !== key) problems.push(`${s} is listed under both ${prev} and ${key}`);
        owner.set(s, key);
      }
    }
    expect(problems).toEqual([]);
  });

  it('every explicit item.photoSlug override names a real photo entry', () => {
    const bad = ITEMS.filter((i) => i.photoSlug !== undefined && !Object.hasOwn(PHOTOS, i.photoSlug)).map((i) => i.id);
    expect(bad).toEqual([]);
  });

  it('every entry has alt text, a background, an alsoFor array and a plate circle inside the image', () => {
    const problems: string[] = [];
    for (const [key, e] of ENTRIES) {
      if (typeof e.alt !== 'string' || e.alt.trim() === '') problems.push(`${key}: empty alt`);
      if (typeof e.background !== 'string' || e.background.trim() === '') problems.push(`${key}: empty background`);
      if (!Array.isArray(e.alsoFor)) problems.push(`${key}: alsoFor is not an array`);
      const p = e.plate;
      const ok =
        p !== undefined &&
        [p.cx, p.cy, p.r].every((n) => typeof n === 'number' && Number.isFinite(n)) &&
        p.cx >= 0 && p.cx <= 1 && p.cy >= 0 && p.cy <= 1 && p.r > 0 && p.r <= 1;
      if (!ok) problems.push(`${key}: bad plate ${JSON.stringify(p)}`);
    }
    expect(problems).toEqual([]);
  });
});

describe('ANATOMY against photos.json', () => {
  it('every ANATOMY key exists in photos.json', () => {
    const orphans = Object.keys(ANATOMY).filter((k) => !Object.hasOwn(PHOTOS, k));
    expect(orphans).toEqual([]);
  });
});
