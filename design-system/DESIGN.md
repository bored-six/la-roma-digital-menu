# La Roma design system

**Style in one sentence:** an engraved Roman ledger. Monoline drawings cut like inscriptions into travertine, with arches and circles as the structure and one solid diamond as the jewel. Parchment pages by day, an oxblood arch stage by night.

Files: `tokens.css` (all values), `stage.css` (stage and ornament recipes), `svg/` (all marks), `preview.html` (open it directly in a browser), `tools/gen-svg.py` (rebuilds the computed SVGs: laurel, sprig, frame, squircle, drumstick, talong).

## Drawing rules (icons)
1. viewBox `0 0 24 24`. Live area is 2 to 22. Stroke `1.5`, `currentColor`, `fill="none"`, round caps and joins. No other weight inside an icon.
2. **At most one solid shape** per icon, and it marks the dish's jewel: yolk, pepperoni, tomato, cherry, the beef diamond, an ice-cube diamond. Never decorative.
3. Dots are zero-length round-capped strokes (`M x y h0`), so they scale with the stroke. Use them for grains, eyes, nostrils, crumbs.
4. Vessels share one bowl (`M3.5 12.5h17 M4.5 12.5a7.5 7 0 0 0 15 0 M9.5 21h5`). The thing *above* the rim tells them apart: mound = rice, steam = soup, chopsticks = noodles, leaves = salad.
5. Curves come from circles and lens leaves (two quadratics), never freehand zigzags. Corner radius on boxes is 1 to 3.5.
6. Max about 6 strokes. The smallest shipped size is 20px (list headings). Check every new icon at 20px in red on parchment.
7. Closest pair at 20px: **rice vs soup** (same bowl). Keep soup's steam wisps at least 5 units tall and the rice mound closed. Next closest: soup vs hot drinks (the handle and saucer separate them).

## Ornament rules
- Weights: 1.5 for structure, 1 to 1.25 for detail and leaves, 0.75 for secondary hairlines. Ornaments only, never in icons.
- `emblem-colosseum.svg` (64 grid): show at 48px or larger. Below that, use the plain laurel ring.
- `laurel-ring.svg` + a category icon at 34% size and stroke-width 1.25 = the **placeholder plate** (`.lr-plate--placeholder`).
- `rule-diamond.svg`: the line has `pathLength="1"`, so it draws with dashoffset 1 to 0. The CSS version is `.lr-rule` with `--rule: 0..1`.
- `frame-scalloped.svg` is a 9-slice source (slice 32). In CSS use `.lr-frame` (border-image, gold baked in). Concave corners R15 outside and R21 inside, with a diamond in each corner cut-out.
- Pips: idle is a round arch (8x12). Active widens to a flattened Roman arch (22x12, filled red). Wrap each pip in a button with a hit area of at least 24x24.

## Type
Two Italian families, nothing else.

| Role | Family (fontsource) | Setting |
|---|---|---|
| Cover wordmark, section titles, stage dish name, eyebrows, buttons, labels | `@fontsource-variable/bodoni-moda` (import `/opsz.css`: wght 400-900 + opsz 6-96) | Title 700 at 32px, -0.005em, mixed case. Stage name 600 at 34px, shrunk to fit one line (`fitTitle`). Eyebrow 600 at 11px, +0.28em, caps |
| Item names | Bodoni Moda | 700 at 19px, optical size follows the font size (`font-optical-sizing: auto`, never set `opsz` by hand) |
| Prices, counters | Bodoni Moda | 700 at 18px, `lining-nums tabular-nums`. The peso sign comes from "La Roma Peso" |
| Descriptions, taglines, hints | `@fontsource-variable/eb-garamond` (import `/wght-italic.css`) | italic 400 at 16/21. Always italic: the upright face is not loaded |

Why: Bodoni is the Italian typeface (Giambattista Bodoni, Parma): sharp, high contrast, and with its optical-size axis the hairlines thicken by themselves at 11px, so eyebrows and labels stay legible on a phone. The italic is the Venetian letter (Aldus Manutius cut the first italic in Venice in 1501), and EB Garamond Italic is its closest living descendant. The old set (Cinzel, Bricolage Grotesque, Familjen Grotesk, Reddit Mono) read as a tech product, not a trattoria.
**Peso sign U+20B1:** Bodoni Moda, Libre Bodoni and Marcellus have none; Cormorant Garamond and EB Garamond do (in latin-ext). The full EB Garamond latin-ext file is 114 KB, so `src/assets/fonts/la-roma-peso.woff2` holds only that one glyph (1 KB, weight axis kept), declared in `app.css` as "La Roma Peso" with `unicode-range: U+20B1` and listed FIRST in every stack that can print a price (Bodoni's own latin-ext file claims U+20B1 without containing it, so listed after Bodoni it costs a 25 KB fetch). Rebuild it with:
`python3 -m fontTools.subset node_modules/@fontsource-variable/eb-garamond/files/eb-garamond-latin-ext-wght-normal.woff2 --unicodes=U+20B1 --flavor=woff2 --layout-features= --no-hinting --desubroutinize --output-file=src/assets/fonts/la-roma-peso.woff2`
Compared before choosing (same menu text, phone width): Bodoni Moda + EB Garamond (chosen), Cormorant Garamond alone (too small an x-height for 14-16px reading), Cinzel + EB Garamond (Roman, but the same capitals as every Italian-restaurant template).

## Colour and contrast
- Parchment pages: ink 16.5:1, ink-soft 9.4:1, ink-mute 5.8:1, red text 6.95:1, gold-text 6.49:1.
- `--lr-gold` (#92754F) is 3.97:1, so use it **for lines and diamonds only**. For small gold text use `--lr-gold-text`.
- On the stage, all text must reach **4.5:1**. Parchment on stage-200 10.5:1, rim-gold on stage-300 8.5:1 and on stage-100 5.1:1, on-stage-mute on stage-300 9.5:1, parchment on the red pill 6.95:1.
- The glass card is never see-through enough to fail: `--glass-tint` (0.72 near-black under the blur) keeps on-stage-mute text above 5:1 even over a white plate. Do not lower it.
- Text never sits on the travertine floor without the glass card.

## Stage recipe (stage.css)
Arch panel (`.lr-stage`, top corners `50% / 50cqi*0.62` = the cover's flattened arch) > floor (`__floor`, 42deg, ribs 24px) > eyebrow + title (behind the plate) > contact shadow > plate (`.lr-plate`, JS writes only `--tilt-x/-y`, clamp to 8deg) > tiles (`.lr-tile` + `.lr-squircle`, place with `--x/--y`) > glass card > price pill. The wrapper `.lr-stage-wrap` must be the container (cqi units). The squircle is a superellipse (n=5) mask, with `corner-shape: squircle` where the browser supports it.

## Motion language (GSAP; tokens in tokens.css)
Character: things are *placed*, not bounced. Fast attack, long settle (`expo.out`). Overshoot only on the stamp.
| Moment | Duration / ease | Stagger | Transforms |
|---|---|---|---|
| Cover arch portal | 1.4s `power4.inOut` | intro chars 0.05 | Intro: emblem, title, rule from y 16, fade, 0.6s expo.out. Open: text out y -24, fade, 0.35s power3.in. Arch `scale 1 -> 7.5`, origin `50% 70%`. The engraving inside scales 1 -> 1.35 and fades in the last 40%. Page 1 from 0.55s: scale 1.06 -> 1, fade, 0.85s expo.out |
| Page slide | 0.7s `power3.inOut` (tap, keys). Swipe release 0.55s `expo.out` with velocity | none | Track `xPercent -100*i`. Parallax: plate extra xPercent +-24 and rotate +-10 -> 0, title 1.15x, list 0.9x |
| Title letter reveal | 0.6s `expo.out` | 0.028 per char | SplitText chars from `y: 0.6em, rotateX: -70, opacity: 0`, origin `50% 100%` |
| Gold rule draw | 0.9s `power2.inOut`, starts at +0.25s | none | Line `scaleX 0 -> 1` from the left (or dashoffset 1 -> 0). Diamond `scale 0 -> 1, rotate -90 -> 0`, 0.35s `back.out(3)`, at the line end -0.1s |
| Price stamp | 0.42s `back.out(2.2)` | 0.06 per row | from `scale 1.6, rotate -6, opacity 0` |
| Leader draw | 0.5s `power1.out`, row start +0.1s | 0.06 per row | `clipPath inset(0 100% 0 0) -> inset(0 0% 0 0)`. Rows from y 12, 0.45s expo.out |
| Tile swap | out 0.3s `power3.in`, in 0.7s `expo.out` | name chars 0.02 | Press: tile scale 0.92 (0.12s). Plate out: rotate -90, scale 0.7, fade. New plate: rotate 90 -> 0, scale 0.7 -> 1. Name re-sets as a 0.45s title reveal, the price stamps, other tiles move 0.6s power3.inOut |
| Anatomia explode + rotate | tilt 0.8s `power3.inOut`; layers 0.7s `expo.out` | 0.08 per layer | Plate group `rotateX 58, rotateZ -38, scale 0.86`. Layer i `translateZ (i+1)*28px`. Leaders draw 0.4s power2.out after each layer, labels from x 8. Drag: rotateZ 0.35deg per px, clamp -75..15, release 0.9s power3.out, snap to 15deg. Tap a label: other layers to opacity 0.35, the picked one +10px Z. Collapse: reverse, 0.5s power3.in, stagger 0.05 from the top |
Idle: tiles float 3.6s `sine.inOut` (y -3 to 4, rotate +-1.5deg), each with its own negative delay.
**Reduced motion:** no 3D, no parallax, no float, no char split. Everything becomes a 0.24s opacity fade. The portal becomes a 0.3s crossfade. Anatomia shows the numbered layer list flat. Rules and leaders appear already drawn.

Plain values: durations 120 / 220 / 420 / 700 / 900 / 1400 ms. Easings in CSS: roman `cubic-bezier(.22,1,.36,1)`, portal `(.76,0,.24,1)`, slide `(.65,0,.35,1)`, stamp `(.34,1.56,.64,1)`, draw `(.45,0,.55,1)`, exit `(.55,0,1,.45)`.

## A builder must not change
1. The four brand colours and the stage ramp. Add new tokens instead of editing these.
2. The font trio and the italic companion, the latin-ext subset, and the rule that prices are mono only.
3. The arch geometry (`--arch-rise: 0.62`), the 1.5 icon stroke, the one-solid-shape rule, and the 20px minimum icon size.
4. Glass tint opacity, the on-stage text colours, and focus rings (`--sh-focus`, `--sh-focus-stage`).
5. Motion durations and easings. Tune through tokens, never inline numbers. Reduced motion must keep working.
6. SVG path data. To change a computed mark, edit `tools/gen-svg.py` and regenerate. Never hand-edit the output.
7. No emoji, no icon-pack glyph, no system-ui font as a visible fallback in screenshots.
