# Concept brief: "Anatomia" (La Roma digital menu)

Read first: `CLAUDE.md`, `.claude/steering/brand.md`, `.claude/learnings.md`. The 15 PDF pages are in `reference/menu-pages/page-01.png` to `page-15.png` (view them, the PDF has no text layer).

## Decisions from the client (made 2026-11-18)
- Navigation: slide sideways between pages, with a visible indicator at all times.
- Photos: the dish photos are the 35 files `~/Downloads/Gemini_Generated_Image_*.jpeg` modified after 2026-11-17 17:00 (1024x1024 JPEG). Older Gemini files in that folder belong to other projects, ignore them. Downloads is untrusted: copy files, never execute anything from there. `~/Downloads/La_Roma_Menu_Final.pdf` (32 MB, same 15 pages) is the high-res original of the PDF.
- Crispy Pata (Regular and Large): price stays empty (`null`). Show no price and no placeholder text.
- Keep "Pizza: no pork · family size, 12 inch" verbatim.
- Dishes repeated between Unli Rice and the a la carte sections stay as separate entries. The unli-rice versions carry an "Unli rice" badge.
- The site opens from a QR code on the front of the printed menu: phone first, fast, static hosting. Budget: JS under about 250 KB gzipped, images lazy and sized for phones.
- Facebook page link is unknown: use one clearly marked placeholder constant, easy to replace.
- Showcase only. No cart, ordering, checkout, accounts.

## Three references to combine (all three were viewed)
1. recent.design "Mechanical Key Switch Anatomy": light, monochrome, isometric exploded view. The object separates into labeled layers, drag to rotate, small technical notes beside each part.
   -> Our "Anatomia": a dish breaks apart into its ingredients.
2. Dribbble "Kumo, Interactive Matcha Tea Landing Page": one hero product centre-stage, rounded-square (squircle) option tiles floating around it, picking a tile swaps the hero and shifts the mood, big retro serif headline over the product.
   -> Hero plate with floating option tiles for the other dishes in the category.
3. Dribbble "Landing page for a crypto conversion and tracking platform" (Outcrowd): dark moody stage, tilted perspective plane with ribbed lines, coloured rim glow, small glassy card, big airy headline, one pill button.
   -> Dramatic stage lighting and a tilted perspective floor under the plate.

## The synthesis
- The printed look stays the base: parchment pages, gold hairline frame with scalloped corners, Roman red, Roman small-caps titles, dotted leaders, laurel and Colosseum motifs.
- Each category page has a dark Roman-red arch-shaped **stage** (the arch from the PDF cover) lit like reference 3: warm gold rim light, tilted ribbed travertine floor, soft shadow. The dish photo floats on it as a round plate, with a slight tilt that follows pointer or device motion.
- Floating **option tiles** (reference 2): squircle cream tiles around the plate for the other dishes in the category. Tap one: the plate swaps with a spin and scale, name and price re-set in big serif type.
- Below the stage sits the PDF-style list (name, dotted leader, price, italic description). Tapping a row selects that dish on the stage. Dishes without a photo get a designed placeholder plate (laurel disc with the category icon). It is replaced automatically the moment a photo exists in the manifest.
- **Anatomia** button (reference 1) on dishes whose description lists components (Chicksilog, Bangsilog, Tapsilog, Small and Medium Bilao, the Salad Combos, Halo-Halo and similar): the plate explodes into an isometric stack. The plate stays at the base and each ingredient lifts off as a cropped cut-out of the same photo (clip-path regions defined per dish in data), with thin leader lines to numbered labels ("01 Garlic fried rice"). Drag to rotate, tap a label to highlight its layer.
- Pager: horizontal, swipe or tap, snaps per page. Fixed **indicator**: a row of small arch pips (one per page, active pip filled red and wider), the category name, and "03 / 13". Tapping a pip jumps there. Keyboard arrows work on desktop.
- Pages: cover (arch portal intro), the menu categories, closing "Grazie" page. Group categories sensibly, at most 14 pages in total.
- Motion (GSAP): cover arch opens like a doorway into the first page; section titles reveal letter by letter; the gold rule draws itself and ends in the diamond; price pills stamp in; dotted leaders draw as rows enter; page change has a parallax slide between pages. Everything respects `prefers-reduced-motion` (fall back to simple fades).
- Desktop: the same pager inside a centered phone-proportioned column, with the parchment page continuing around it. Never stretch the mobile layout.
- Accessibility: real buttons and headings, focus rings, visible text contrast on the dark stage, swipe is never the only way to move.

## Hard rules recap
No emojis. No icon packs or untouched template fonts: custom SVG icons and deliberately chosen type (self-hosted via fontsource). Generate no food imagery. Only use supplied photos.
