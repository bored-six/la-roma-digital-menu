// Pure maths for the stage. No React, no DOM: everything here is unit-tested in stageLogic.test.ts.
import { slug } from '../../lib/slug';
import { resolvePhoto, type ResolvedPhoto } from '../../lib/photos';
import type { AnatomyRegion, Item, PhotoEntry } from '../../types';

/** A circle in photo space: centre as fractions of width / height, radius as a fraction of the image WIDTH. */
export interface PlateGeom {
  cx: number;
  cy: number;
  r: number;
}

/**
 * CSS numbers that crop that circle out of a photo into a square plate box, whatever the photo's aspect:
 *   frame { position:absolute; left:50%; top:50%; width: widthPct%; transform: translate(shiftXPct%, shiftYPct%) }
 * widthPct is a percentage of the PLATE box, the shifts are percentages of the frame's OWN size, so the image height
 * never has to be known (the browser derives it from the file). The circle then lands dead centre and fills the box,
 * which also hides the white rounded corners baked into the wide photos (tyulah-itum, bulalo, halo-halo).
 */
export interface CropFrame {
  widthPct: number;
  shiftXPct: number;
  shiftYPct: number;
}

export function cropFrame(g: PlateGeom): CropFrame {
  if (!Number.isFinite(g.r) || g.r <= 0) throw new RangeError(`cropFrame: radius must be > 0 (got ${String(g.r)})`);
  return { widthPct: 50 / g.r, shiftXPct: -g.cx * 100, shiftYPct: -g.cy * 100 };
}

/**
 * photos.json holds ONE plate per file: the primary dish. Dishes that share a file through `alsoFor` sit elsewhere in it.
 * Their circles were measured by the photo agent (src/data/photos.report.md, "Plates for alsoFor dishes") but are not in
 * the manifest, so they live here, keyed by the dish's own slug. TODO: fold into photos.json (PhotoEntry has no field for it).
 */
const ALSO_FOR_PLATES: Readonly<Record<string, PlateGeom>> = {
  'pork-sisig': { cx: 0.498, cy: 0.355, r: 0.31 },
  'sinigang-na-hipon': { cx: 0.498, cy: 0.655, r: 0.31 },
  'seafood-medley': { cx: 0.501, cy: 0.68, r: 0.3 },
  'binagoongan-fried-rice': { cx: 0.5, cy: 0.67, r: 0.32 },
  'crispy-pork-chop': { cx: 0.496, cy: 0.697, r: 0.335 },
  pinakbet: { cx: 0.5, cy: 0.67, r: 0.28 },
  'beef-kulma': { cx: 0.5, cy: 0.67, r: 0.28 },
  'blue-lemonade': { cx: 0.5, cy: 0.46, r: 0.25 },
  'buko-pandan': { cx: 0.5, cy: 0.737, r: 0.28 },
  'hot-choco': { cx: 0.499, cy: 0.678, r: 0.3 },
  'plain-scoop-rice': { cx: 0.501, cy: 0.57, r: 0.14 },
};

/** The circle to crop for this dish: its own plate, or its alsoFor override when it only shares another dish's file. */
export function plateGeomFor(item: Item, photo: ResolvedPhoto): PlateGeom {
  const own = slug(item.name);
  if (own !== photo.slug && photo.entry.alsoFor.includes(own) && Object.hasOwn(ALSO_FOR_PLATES, own)) {
    return ALSO_FOR_PLATES[own]!;
  }
  return photo.entry.plate;
}

export interface AnatomyTarget {
  slug: string;
  entry: PhotoEntry;
  regions: AnatomyRegion[];
}

/**
 * Anatomia is offered only when the photo resolves, the dish OWNS that photo (slug(name) === photo key, so a dish that only
 * shares another dish's file through alsoFor never shows foreign regions) and the photo has at least 2 regions.
 */
export function anatomyFor(
  item: Item,
  photos: Record<string, PhotoEntry>,
  anatomy: Record<string, AnatomyRegion[]>,
): AnatomyTarget | null {
  const photo = resolvePhoto(item, photos);
  if (photo === null || slug(item.name) !== photo.slug) return null;
  if (!Object.hasOwn(anatomy, photo.slug)) return null;
  const regions = anatomy[photo.slug];
  if (regions === undefined || regions.length < 2) return null;
  return { slug: photo.slug, entry: photo.entry, regions };
}

// ---------- tilt ----------

/** Degrees. Spec: plate tilts +-6; the design system ceiling is 8. */
export const TILT_MAX = 6;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Plate tilt toward the pointer, in degrees. Pointer right of centre = +rotateY, above centre = +rotateX
 * (positive rotateX lifts the plate's normal up, so the plate "looks at" the pointer). Clamped to +-max.
 */
export function tiltFromPointer(
  px: number,
  py: number,
  rect: { left: number; top: number; width: number; height: number },
  max: number = TILT_MAX,
): { x: number; y: number } {
  if (!(rect.width > 0) || !(rect.height > 0)) return { x: 0, y: 0 };
  const nx = clamp(((px - rect.left) / rect.width - 0.5) * 2, -1, 1);
  const ny = clamp(((py - rect.top) / rect.height - 0.5) * 2, -1, 1);
  return { x: -ny * max || 0, y: nx * max || 0 };
}

// ---------- option tile slots ----------

/** The stage is width:height = 350:440 (design-system/stage.css). Tiles are 64px (tokens --tile-size). */
export const STAGE_ASPECT = 350 / 440;
export const TILE_PX = 64;

export interface TileSlot {
  /** percent of the stage width / height, the tile CENTRE */
  x: number;
  y: number;
}

// Three rows down each side of the plate. Left/right columns hug the arch; rows are clear of the headline and the bottom card.
const UL: TileSlot = { x: 15, y: 38 };
const L: TileSlot = { x: 11, y: 55 };
const LL: TileSlot = { x: 15, y: 72 };
const UR: TileSlot = { x: 85, y: 38 };
const R: TileSlot = { x: 89, y: 55 };
const LR: TileSlot = { x: 85, y: 72 };

// Clockwise from the top-left so that neighbours in list order stay neighbours in space and a swap reads as a slow carousel.
const SLOTS: ReadonlyArray<readonly TileSlot[]> = [
  [],
  [R],
  [L, R],
  [UL, R, LL],
  [UL, UR, LR, LL],
  [UL, UR, R, LR, LL],
  [UL, UR, R, LR, LL, L],
];

/** Where `count` option tiles sit, in list order. Balanced left/right, clear of the plate, inside the stage. */
export function tileSlots(count: number): TileSlot[] {
  const n = Math.min(6, Math.max(0, Math.floor(Number.isFinite(count) ? count : 0)));
  return (SLOTS[n] ?? []).map((s) => ({ ...s }));
}
