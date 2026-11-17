# La Roma Digital Menu

Showcase-only digital menu for La Roma Restaurant (Est. 2017, Filipino favourites, pizza, unli rice).
Source material: `reference/La_Roma_Menu_Messenger.pdf` (15 pages) and its page renders in `reference/menu-pages/`.

## Goal
- Mobile-first, attention-grabbing, animated menu that shows off the food and the digital craft.
- Keep the PDF's identity (cream parchment, Roman red, gold hairline frame, Colosseum motif) and push it further than print can.

## Hard constraints
- **No ordering, no cart, no checkout, no payments.** Display only.
- No emojis. No stock icon packs, no default fonts. Custom SVG icons and deliberately chosen type.
- Smooth animation is a core requirement. Respect `prefers-reduced-motion`.
- Mobile first (phone portrait is the primary screen), desktop must still look intentional.

## Stack
Vite + React 18 + TypeScript (strict), GSAP (core, Draggable, SplitText, @gsap/react), Vitest. No backend: the menu is `src/data/menu.ts`, bundled. Pager is CSS scroll-snap + IntersectionObserver. Fonts via fontsource: Cinzel (titles), Bricolage Grotesque (item names), Familjen Grotesk italic (descriptions), Reddit Mono (prices). Static hosting.
Commands: `npm run dev` (port 5173, or see `.claude/launch.json`), `npm test`, `npm run typecheck`, `npm run build`.

## Status
Built: 14 pages (cover, 12 category pages, Grazie), hero stage with option tiles, Anatomia exploded view, 29 dish photos, 328 tests. First review round (2026-11-18) rejected on error boundary, a swap race, and image loading; fixes in progress.
Open: real Facebook URL (`src/data/site.ts` placeholder); photos for about 70 items; Safari/iOS untested; Unli Rice page keeps only the first PDF tagline.

## Where things live
- `reference/` original PDF and page renders (read-only, do not edit)
- `.claude/steering/brand.md` design source of truth extracted from the PDF
- `.claude/learnings.md` project learnings, date-stamped
