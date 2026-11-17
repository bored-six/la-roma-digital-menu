# Learnings

## 2026-11-18 - Environment quirk
The PDF has no text layer (every page is an image), and this Mac has no `pdftoppm`/`pdftotext`. `swift` is also broken here (Command Line Tools module redefinition error), so Swift scripts will not compile.
What works: `osascript -l JavaScript script.js <pdf> <outdir>` using PDFKit through the ObjC bridge to render pages to PNG. Then read the PNGs.

## 2026-11-18 - Menu content issues to confirm with the client
- Crispy Pata (Regular and Large) have blank prices on page 9.
- Page 5 says "Pizza: no pork" but Hawaiian and All Meat Overload look like they contain ham/pepperoni.
- Same dish appears at different prices in different sections (Unli Rice vs. a la carte): Tinolang Isda 99 vs 240, Tuna Sisig 99 vs 250, Grilled Tuna Belly 198 vs 340. Probably intentional (unli rice deal vs. full dish), but the UI must make that obvious.
- Rice Meals (page 7) repeats several Unli Rice items at the same prices.
- About 110 menu items, but only about 37 distinct photos. Roughly 70 items have no photo of their own (noodles, most soups, most drinks, many mains).
- The photos in the PDF look composited/AI-generated, are baked into the page layout (circle crops, plates on a table), and the PDF is only 3.2 MB for 15 pages, so they are probably too small for full-screen phone use. Clean cutouts cannot be pulled from them.

## 2026-11-18 - Shell (lane 2) patterns
- Fontsource CSS is unicode-range split. The peso sign (U+20B1) is in the `latin-ext` face of Reddit Mono, which the browser only fetches when a price is on screen. Verified with CDP `CSS.getPlatformFontsForNode`: the peso renders in Reddit Mono, Cinzel never gets it. Vite rewrites a `<link rel=preload href="/node_modules/@fontsource-variable/.../cinzel-latin-wght-normal.woff2">` in index.html to the hashed asset, so the title-face preload needs no plugin.
- Pager pages are `inert` unless active: a Tab stop on an off-screen page makes the browser scroll the track sideways. Indicator/arrows/jump notes call `goTo(i, {focus:true})` and the active-page effect moves focus to `[data-page-heading]`; swipes never move focus.
- Cover portal: the cover is a track page, so the "arch floods the screen" tween ends in a hand-off behind `.pager__veil` (same red as the arch) and an instant `scrollTo` to page 1. The veil, not the pager, hides the cut.
- A badge beside an item name squeezes long names on 390px (17 "Unli rice" pills on one page). Badges sit on the description line instead.
- Headless Brave drives well over CDP with Node 24's global `WebSocket` (no puppeteer needed): `Input.synthesizeScrollGesture` for real swipes, `Emulation.setEmulatedMedia` for reduced motion, `Network.emulateNetworkConditions` + `Emulation.setCPUThrottlingRate` for an LCP check.

## 2026-11-18 - Stage and Anatomia (lane 3) patterns
- Circle crop needs no image size: frame `left:50%; top:50%; width:(50/r)%` of the plate box, `translate(-cx*100%, -cy*100%)` of its own size (`cropFrame`). The same frame, clipped with `clip-path: ellipse()` on the `<img>` only, is an Anatomia layer that sits exactly on its own pixels at z=0.
- photos.json holds ONE plate per file. `alsoFor` dishes (sisig, pinakbet, hot choco...) have their circles in `photos.report.md` only; they live in `stageLogic.ts` (`ALSO_FOR_PLATES`) until the manifest gets a field for them.
- True isometric is `rotateX(55) rotateZ(-35)` (Z applied to the point first). GSAP's own transform order is the reverse, so Anatomia writes the transform strings itself. All motion tweens plain numbers in a state object; one `apply()` writes DOM transforms and the SVG leader lines from the analytic `project()` (no getBoundingClientRect while dragging).
- Never put `touch-action` on the stage: the pager swipes with native scroll-snap and a swipe that starts on the stage must still scroll. Draggable on a detached proxy div with `trigger: view`, dx = `this.x - this.startX`.
- React 18 warns on camelCase `fetchPriority` on `<img>` (needs lowercase, which the types reject): skip it, `loading="eager"` is enough.
- Brave CDP from Node needs `--remote-allow-origins=*`, otherwise the WebSocket never opens and node exits 13 silently. To test lane 3 inside the real shell without editing lane 2's files: a throwaway vite config with an inline plugin that rewrites the `StageSlot` import in `CategoryPage.tsx`.
