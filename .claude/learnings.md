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
