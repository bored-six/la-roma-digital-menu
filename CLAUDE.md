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
Not decided yet. Leaning: static site, no backend (menu lives in a typed data file). Decide after the open questions are answered, and record the choice here.

## Status
Bootstrap done. Menu not yet transcribed into data. No code written.

## Where things live
- `reference/` original PDF and page renders (read-only, do not edit)
- `.claude/steering/brand.md` design source of truth extracted from the PDF
- `.claude/learnings.md` project learnings, date-stamped
