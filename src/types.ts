export type PageId = string; export type PhotoSlug = string;            // slug = kebab of printed name
export type Badge = 'Unli rice' | 'For sharing' | 'Soup' | 'Dessert';
export interface Variant { label: 'Glass' | 'Pitcher'; price: number }
export interface Item {
  id: string;            // `${categoryId}/${slug(name)}`, globally unique
  name: string;          // verbatim from PDF
  description?: string;  // verbatim italic line
  price: number | null;  // whole pesos. null ONLY for pork/crispy-pata-regular and pork/crispy-pata-large
  variants?: Variant[];  // if present: price === min(variants.price)
  badges: Badge[];       // every item in category 'unli-rice' has 'Unli rice'
  subgroup?: string;     // drinks: 'Water and Soda' | 'Juice' | 'Cold Drinks' | 'Shakes' | 'Hot' | 'Beer'
  photoSlug?: PhotoSlug; // explicit override; else resolved by lib/photos
}
export interface NoteLine { text: string; jumpTo?: PageId }   // verbatim, e.g. 'Pizza: no pork · family size, 12 inch'
export interface Category { id: string; title: string; icon: string /* design-system/svg/<icon>.svg */; tagline?: string; notes: NoteLine[]; items: Item[] }
export type Page =
  | { kind: 'cover'; id: 'cover' }
  | { kind: 'category'; id: PageId; label: string /* indicator text */; categories: Category[] }
  | { kind: 'closing'; id: 'grazie' };
export interface AnatomyRegion { label: string; detail?: string; cx: number; cy: number; rx: number; ry: number } // 0..1 image coords
export interface PhotoEntry { file: string; alt: string; alsoFor: string[]; background: string; plate: { cx: number; cy: number; r: number } }
/** `active`: the settled current page. `near`: current page +-1 (the only stages allowed to load photos). */
export interface StageProps { items: Item[]; selectedId: string; onSelect(id: string): void; active: boolean; near?: boolean }
export interface AnatomiaProps { item: Item; photo: PhotoEntry; regions: AnatomyRegion[]; onClose(): void }
