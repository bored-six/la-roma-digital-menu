# Spec: La Roma "Anatomia" menu (v1, 2026-11-18)
Authoritative inputs: concept.md, brand.md, reference/menu-pages/*.png. Design tokens/SVGs: `design-system/` (other agent). Photos: `src/data/photos.json` + `public/dishes/*.jpg` (other agent). Do not edit either.

## 1. Stack
| Choice | Why |
|---|---|
| Vite + React 18 + TS `strict`, `noUncheckedIndexedAccess` | Static build for any host, fast HMR. Component model fits three parallel lanes. |
| GSAP core + `@gsap/react` (`useGSAP`) + **Draggable** + **SplitText** | Timelines for stage swap, portal, Anatomia. Draggable = Anatomia rotate only; SplitText = letter reveals (keeps aria-label). |
| No ScrollTrigger, no Observer | Row/title reveals use IntersectionObserver; page change is native scroll. Saves ~25 KB. |
| Vitest (+ jsdom only where needed) | Same config as Vite, runs the pure `src/lib` tests in ms. |
| No backend | Menu is `src/data/menu.ts`, typed, bundled. Static hosting from the QR code. |
**Pager = CSS scroll-snap (`x mandatory`) + IntersectionObserver.** Swipe momentum runs on the compositor thread, so 60fps on mid phones even while JS is busy, and vertical scroll inside a page never fights a JS drag handler. Parallax: one passive `scroll` listener, rAF-throttled, writes `--p` (−1..1) on each page; layers use `transform: translateX(calc(var(--p) * 24px))`. GSAP drag rejected: main-thread, re-implements momentum, conflicts with in-page vertical scroll.

## 2. File tree and lanes (no file has two owners)
Lane 1 lands **step 0 first** (scaffold + `src/types.ts`, frozen after merge; changes go through Lane 1). Then all three lanes run in parallel.
```
L1 package.json tsconfig.json vite.config.ts (vitest config inside)
L1 src/types.ts                     all shared types incl. component props (StageProps, AnatomiaProps)
L1 src/data/menu.ts                 PAGES: Page[] (whole menu, section 4)
L1 src/data/anatomy.ts              ANATOMY: Record<PhotoSlug, AnatomyRegion[]>
L1 src/data/site.ts                 FACEBOOK_URL = 'https://facebook.com/PLACEHOLDER' // REPLACE
L1 src/lib/slug.ts price.ts photos.ts pager.ts tiles.ts motion.ts anatomy.ts
L1 src/lib/*.test.ts  tests/data.test.ts
L2 index.html src/main.tsx src/App.tsx src/styles/app.css (imports design-system/tokens.css, stage.css stays L3)
L2 src/hooks/usePager.ts useReducedMotion.ts useInView.ts
L2 src/components/pager/{Pager,Indicator}.tsx
L2 src/components/pages/{CoverPage,ClosingPage,CategoryPage,SectionTitle,NoteLine}.tsx
L2 src/components/list/{ItemList,ItemRow,PricePill}.tsx
L3 src/components/stage/{Stage,Plate,PlaceholderPlate,OptionTiles,StageHeadline}.tsx stage.module.css
L3 src/components/anatomia/{Anatomia,AnatomyLayer,AnatomyLabels}.tsx anatomia.module.css
```
Seam: `CategoryPage` (L2) renders `<Stage {...StageProps}/>` (L3). L2 uses a stub `<div>` until L3 lands.

## 3. Data contract (`src/types.ts`)
```ts
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
export interface StageProps { items: Item[]; selectedId: string; onSelect(id: string): void; active: boolean }
export interface AnatomiaProps { item: Item; photo: PhotoEntry; regions: AnatomyRegion[]; onClose(): void }
```
**Pushback:** anatomy regions are keyed by photo slug in `anatomy.ts`, not stored on `Item`. Regions are pixel facts about one image; Chicksilog appears once but a shared photo (`alsoFor`) must not duplicate coordinates. Anatomia shows iff photo resolves AND `ANATOMY[slug]?.length >= 2`.
Pure functions (L1): `slug(name)`, `formatPrice(n): '₱150'` (null -> `''`, no placeholder), `resolvePhoto(item, photos): {slug, entry} | null` (own slug, then `alsoFor`), `clampIndex`, `indexFromScroll(scrollLeft, width, n)`, `pageIndexFromHash(hash, pages)`, `pickTiles(items, selectedId, photos, max=6)` (others with photo first, then placeholders, total ≤ max), `motion(reduced)`, `regionClipPath(r): 'ellipse(rx% ry% at cx% cy%)'`.

## 4. Page grouping (14 pages, 111 items)
| # | id | label | Categories (items) | Total |
|---|---|---|---|---|
| 0 | cover | La Roma | - | 0 |
| 1 | breakfast | Breakfast & Noodles | All-Day Breakfast 3, Noodles 4 | 7 |
| 2 | unli-rice | Unli Rice | Unli Rice 17 (PDF p3 9 + p4 8), note 'Unlimited rice · Free drinks and soup' | 17 |
| 3 | pizza | Pizza & Starters | Pizza 3 (note verbatim), Starters 2 | 5 |
| 4 | favourites | House Favourites | House Favourites 5 (badges For sharing x2, Soup x2, Dessert) | 5 |
| 5 | rice-meals | Rice Meals & Veg | Rice Meals 7, Vegetables 4 | 11 |
| 6 | chicken-beef | Chicken & Beef | Chicken 5, Beef 7 | 12 |
| 7 | pork | Pork | Pork 8 (two Crispy Pata rows, price null) | 8 |
| 8 | sea | From the Sea | From the Sea 10 (PDF p10 5 + p11 5) | 10 |
| 9 | soup | Soup | Soup 6, note 'More soups: Tyulah Itum and Bulalo' jumpTo 'favourites' | 6 |
| 10 | salad-rice | Salad & Rice | Salad 5, Rice 6 | 11 |
| 11 | cold-drinks | Cold Drinks | Drinks 10: Water and Soda 3, Juice 2, Cold Drinks 3 (Glass 69 / Pitcher 130), Shakes 2 | 10 |
| 12 | hot-drinks | Hot Drinks & Beer | Drinks 9: Hot 4, Beer 5 | 9 |
| 13 | grazie | Grazie | - | 0 |
"More soups ... on page 6" is rewritten because app pages differ from the PDF; it becomes a jump link. Pizza items keep 'Family size, 12 inch' as their description. Taglines: copy from each PDF side panel. **Anatomia candidates:** Chicksilog, Bangsilog, Tapsilog, Small Bilao, Medium Bilao, Salad Solo, Salad Combo A-D, Halo-Halo (only where a photo exists).

## 5. Interactions (proposed motion tokens; rename to design-system names when DESIGN.md lands)
Tokens: `--dur-xs .15s` `--dur-s .3s` `--dur-m .55s` `--dur-l .9s`; `--ease-out` = `expo.out`, `--ease-io` = `power3.inOut`, `--ease-stamp` = `back.out(2.2)`. Reduced motion (`motion(true)`): transforms 0s, opacity fades only, max .2s, no parallax, no tilt, no SplitText.
| Piece | Behaviour | Motion | Reduced |
|---|---|---|---|
| Pager | `<main>` horizontal snap; each page 100vw, own `overflow-y:auto`. Active = IO threshold .6. URL hash `#unli-rice` via replaceState; load honours hash. **No wrap**: clamp 0..13 | native momentum; parallax `--p` x 24px on stage, 8px on title | `scroll-behavior:auto`, no `--p` |
| Indicator | fixed bottom, 14 arch pips (`<button aria-label="Go to Pork, page 8 of 14" aria-current>`), active pip 2.2x width, red; label + `08 / 14` (2-digit, 1-based, cover counts). Hidden on cover. ←/→ ±1, Home/End | pip width `--dur-s --ease-out`; label crossfade `--dur-xs` | instant |
| Cover portal | arch SVG + emblem; "Open menu" pill button; arch scales 1→6 from its centre while page 1 fades in, then pager scrolls to index 1 | `--dur-l --ease-io`, emblem fade first `--dur-s` | fade 200ms |
| Category page | title SplitText chars rise 12px stagger .02; gold rule draws (stroke-dashoffset) then diamond pops; rows: leader draws + price pill stamps (scale .6→1) on first view only | `--dur-m --ease-out`, pill `--ease-stamp` | all static |
| Stage | arch-shaped dark-red stage, rim glow, tilted ribbed floor; plate tilts ±6deg from pointer/`deviceorientation` (only after a user gesture, iOS permission). Selected default = first item with photo, else first item | tilt lerp .1 per rAF | no tilt |
| Option tiles | `pickTiles(..., 6)` squircles around plate; states: rest, hover/focus (lift 4px, gold ring), pressed (scale .96), selected (hidden). Tap = swap: old plate rotate −90 + scale .7 + fade, new from +90; headline name/price re-set (SplitText) | swap `--dur-m --ease-out`, tiles reflow `--dur-s` | crossfade `--dur-xs` |
| List → stage | row is a `<button>`; tap selects and scrolls page so stage is in view; `aria-pressed` on selected row | page scroll smooth | `auto` |
| Anatomia | pill button on stage when eligible. Opens `<dialog>`-style overlay over stage: plate rotates to iso (rotateX 55, rotateZ −35), each region (clip-path of same photo) lifts translateZ 40px x index, leader lines draw, labels `01 Garlic fried rice`. Drag (Draggable type x, 1px=.25deg) rotates rotateZ, clamped −75..5; ←/→ ±10deg. Tap label: that layer +16px + gold outline, others opacity .35. Close: X, Esc, backdrop tap; layers collapse in reverse; focus back to Anatomia button | open stagger .06, `--dur-l --ease-out`; close `--dur-m --ease-io` | flat 2D: labelled list with region rings on the photo, no lift/rotate |
| Closing | Grazie emblem, "Thank you for dining with us.", Facebook pill link to `FACEBOOK_URL` (`target=_blank rel=noopener`), "La Roma Restaurant · Est. 2017", "Back to cover" button. No QR (we are already on the phone) | emblem laurel draws `--dur-l` | static |
Desktop ≥ 768px: pager in a centered column `min(430px, 100vw)`, `aspect` free, parchment frame continues around it. Arrows also on-screen as prev/next buttons.

## 6. Performance and accessibility budget
- JS ≤ 160 KB gzipped (React ~45, GSAP+Draggable+SplitText ~45, app ≤ 70). CI: `vite build` size check script fails > 250 KB.
- Fonts: fontsource, ≤ 3 files, `woff2`, preload the title face only, `font-display: swap`.
- Images: `<img width height decoding="async">`; active page ±1 eager, rest `loading="lazy"`; tiles use the same file at 96px CSS (browser downscales; photo agent decides widths). Never load all 35 at start.
- LCP < 2.0 s on throttled "Fast 4G / mid phone"; cover LCP is text + inline SVG, no photo. CLS < .05. INP < 200 ms.
- Focus: visible 2px gold ring (`:focus-visible`) on parchment, cream ring on the stage. Anatomia traps focus, Esc closes, restores focus. Page change moves focus to the new page `<h2>` only when triggered by indicator/keys (not swipe).
- Contrast: text on stage cream on `#5a1a10`-ish ≥ 7:1; price pills white on Roman red ≥ 4.5:1; italic descriptions ≥ 4.5:1 on parchment. Headings: one `<h1>` (cover), `<h2>` per page, `<h3>` per category.

## 7. Tests (write first, red first; Lane 1 owns)
| File | Asserts |
|---|---|
| tests/data.test.ts | page order/ids and per-category counts exactly match section 4 table; total 111; 14 pages; ids unique |
| tests/data.test.ts | every price integer > 0 or null; null set === {pork/crispy-pata-regular, pork/crispy-pata-large}; variants imply price === min; 3 Glass/Pitcher items = 69/130; all unli-rice items have badge; spot prices: Tenderloin Steak 450, Plain Scoop Rice 30, Medium Bilao 950, Tuna Sisig 99 (unli) and 250 (sea) |
| tests/data.test.ts | Pizza note string exactly `Pizza: no pork · family size, 12 inch`; Soup note `jumpTo` resolves to a real page |
| tests/photos.test.ts | every `photos.json` `file` exists under `public/`; every key and `alsoFor` slug matches some item slug; every `ANATOMY` key exists in photos.json |
| src/lib/anatomy.test.ts | every region: cx,cy in [0,1], rx,ry in (0,.5], ellipse inside unit box; labels unique per dish; `regionClipPath` output format |
| src/lib/pager.test.ts | clamp(-1)=0, clamp(14)=13; indexFromScroll rounds at half-width, clamps, width 0 -> 0; hash `#pork`=7, unknown/empty=0; no wrap at ends |
| src/lib/price.test.ts | `₱150`, `₱1,250` grouping, null -> '' |
| src/lib/tiles.test.ts | excludes selected; photo items first; ≤ max; no duplicates; category of 1 item -> [] |
| src/lib/motion.test.ts | `motion(true)` all transform durations 0, fades ≤ .2; `motion(false)` matches tokens |
**Not tested:** CSS rules existing, colours, fonts, that SVGs render, animation smoothness, layout. Those are checked by eye in section 8.

## 8. Build order and acceptance
1. L1 step 0: scaffold + `types.ts` (merge, commit). 2. In parallel: L1 tests red -> data + lib green; L2 shell/pager/list on stub stage; L3 stage/tiles/Anatomia against a fixture `Item[]` and real photos.json. 3. L2 swaps stub for `<Stage>`. 4. regression-verifier (`vitest run`, `tsc --noEmit`, `vite build`), then reviewer.
Reviewer checklist at 390x844 (Chrome devtools, iPhone 12 Pro), plus one pass with reduced motion on:
- [ ] Cover portal opens into Breakfast; indicator appears and reads `02 / 14`.
- [ ] Swipe through all 14 pages: snaps per page, no jank, vertical scroll inside long pages (Unli Rice) works.
- [ ] Pip tap jumps; ←/→/Home/End work on desktop; reload on `#pork` opens Pork.
- [ ] Crispy Pata rows show no price and no placeholder; Cold Drinks show Glass/Pitcher columns.
- [ ] Tile tap and list-row tap both swap the plate; dishes without photo show the laurel placeholder.
- [ ] Anatomia on Chicksilog: explodes, drags, label highlights, Esc closes, focus returns.
- [ ] Soup note jumps to House Favourites; Facebook link uses the placeholder constant.
- [ ] Reduced motion: only fades, no tilt, Anatomia is the flat list. Keyboard-only run reaches everything.
- [ ] `vite build` JS gzipped < 250 KB; Lighthouse mobile LCP < 2.0 s.
