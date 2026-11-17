// Pixel size of every dish photo, keyed by the `file` value in photos.json. Used for <img width height> so the browser knows the
// aspect ratio before the file arrives (no layout shift, spec section 6). Verified against the JPEG headers by photoSizes.test.ts.
const SIZES: Readonly<Record<string, { readonly w: number; readonly h: number }>> = {
  'dishes/all-meat-overload.jpg': { w: 900, h: 900 },
  'dishes/bam-e.jpg': { w: 502, h: 900 },
  'dishes/bangsilog.jpg': { w: 900, h: 900 },
  'dishes/barako-brewed-coffee.jpg': { w: 502, h: 900 },
  'dishes/bulalo.jpg': { w: 900, h: 382 },
  'dishes/calamares.jpg': { w: 900, h: 900 },
  'dishes/cheese-stick.jpg': { w: 900, h: 900 },
  'dishes/chicken-bbq.jpg': { w: 502, h: 900 },
  'dishes/chicksilog.jpg': { w: 900, h: 900 },
  'dishes/crispy-pata-regular.jpg': { w: 502, h: 900 },
  'dishes/fries.jpg': { w: 900, h: 900 },
  'dishes/garlic-buttered-shrimp.jpg': { w: 900, h: 900 },
  'dishes/grilled-pork-liempo.jpg': { w: 502, h: 900 },
  'dishes/grilled-tuna-belly.jpg': { w: 900, h: 900 },
  'dishes/grilled-tuna-panga.jpg': { w: 502, h: 900 },
  'dishes/halo-halo.jpg': { w: 900, h: 382 },
  'dishes/hawaiian.jpg': { w: 900, h: 900 },
  'dishes/honey-lemon-chicken.jpg': { w: 502, h: 900 },
  'dishes/iced-tea.jpg': { w: 502, h: 900 },
  'dishes/kilawin.jpg': { w: 900, h: 900 },
  'dishes/medium-bilao.jpg': { w: 900, h: 382 },
  'dishes/pancit-canton.jpg': { w: 502, h: 900 },
  'dishes/pepperoni.jpg': { w: 900, h: 900 },
  'dishes/salad-combo-c.jpg': { w: 502, h: 900 },
  'dishes/shrimp-in-coconut-sauce.jpg': { w: 900, h: 900 },
  'dishes/small-bilao.jpg': { w: 900, h: 382 },
  'dishes/sweet-and-sour-fish-fillet.jpg': { w: 502, h: 900 },
  'dishes/tapsilog.jpg': { w: 900, h: 900 },
  'dishes/tyulah-itum.jpg': { w: 900, h: 382 },
};

/** null for a file that is not in the table (never guesses). Own-property lookups only. */
export function photoSize(file: string): { w: number; h: number } | null {
  return Object.hasOwn(SIZES, file) ? (SIZES[file] ?? null) : null;
}
