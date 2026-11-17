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
