# La Roma Digital Menu

Showcase-only digital menu for La Roma Restaurant (Est. 2017, Filipino favourites, pizza, unli rice).
Source material: `reference/La_Roma_Menu_Messenger.pdf` (15 pages) and its page renders in `reference/menu-pages/`.

## Goal
- Mobile-first, attention-grabbing, animated menu that shows off the food and the digital craft.
- Keep the PDF's identity (cream parchment, Roman red, gold hairline frame, Colosseum motif) and push it further than print can.

## Hard constraints
- **No ordering, no cart, no checkout, no payments.** Display only.
- No emojis. No stock icon packs, no default fonts. Custom SVG icons and deliberately chosen type (Italian: Bodoni and Garamond, see `design-system/DESIGN.md`).
- Smooth animation is a core requirement. Respect `prefers-reduced-motion`.
- Mobile first (phone portrait is the primary screen), desktop must still look intentional.

## Stack
Vite + React 18 + TypeScript (strict), GSAP (core, Draggable, SplitText, @gsap/react), Vitest. No backend: the menu is `src/data/menu.ts`, bundled. Pager is CSS scroll-snap + IntersectionObserver. Fonts via fontsource: Bodoni Moda (titles, item names, prices, labels) and EB Garamond Italic (descriptions); the peso sign is a 1 KB subset of EB Garamond, `src/assets/fonts/la-roma-peso.woff2`. Static hosting.
Commands: `npm run dev` (port 5173, or see `.claude/launch.json`), `npm test`, `npm run typecheck`, `npm run build`.

## Status
Typography reset 2026-11-19 (Bodoni Moda + EB Garamond Italic, stage name fitted to one line, row leaders aligned to the last line). Built: 14 pages (cover, 12 category pages, Grazie), hero stage with option tiles, Anatomia exploded view, 80 dish photos (49 Gemini ones added 2026-11-19, plus Pale Pilsen and Red Horse as cut-outs of CC-licensed Commons photos on a synthetic maple background, credits in `docs/photo-credits.md`; drinks are framed with a larger circle that holds glass, garnish and saucer; not run locally after adding them, CI runs the tests on push), 343 tests. First review round (2026-11-18) rejected on error boundary, a swap race, and image loading; all fixed and the second review round approved. Hosting works from any static folder (relative base), not from file://.
Live: https://bored-six.github.io/la-roma-digital-menu/ (public repo bored-six/la-roma-digital-menu). `.github/workflows/deploy.yml` runs tests, builds and publishes to GitHub Pages on every push to main. `reference/` is gitignored (kept local only, not in the public repo). Commits use the GitHub noreply email (repo-local git config).
Photo prompts (one paste-ready prompt per dish, style lock inside) for the 2 dishes still missing a photo (beef steak, plain platter rice): `docs/gemini-photo-prompts.md`.
Open: real Facebook URL (`src/data/site.ts` placeholder); photos for those 2 dishes and 6 branded drinks (San Mig Light and Apple, Cali, Coke/Sprite/Royal/Dew, Coke 1.5 L, bottled water; on the placeholder for now); Safari/iOS untested; Unli Rice page keeps only the first PDF tagline.

## Where things live
- `reference/` original PDF and page renders (read-only, do not edit)
- `.claude/steering/brand.md` design source of truth extracted from the PDF
- `.claude/learnings.md` project learnings, date-stamped
