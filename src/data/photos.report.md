# Dish photo report

29 of the 35 Gemini files are dishes (public/dishes, max 900 px, all under 150 KB, 3.1 MB total). 6 are not food.
Sizes are not all 1024 sq: 15 square, 11 tall 768x1376, 5 wide 1584x672, 4 odd art files.

## Conventions in photos.json
- plate.cx/cy are fractions of width/height. plate.r is a fraction of image WIDTH (radius px = r * width).
- Wide photos (bilao, bulalo, tyulah-itum, halo-halo): r is capped at 0.21 so the circle fits the image height. The real basket/bowl is a wider ellipse, so the crop trims its rim a little.
- 11 photos show 2-4 dishes. `plate` is the primary dish only. Other dishes sit in alsoFor, plates below.
- background: "board" = round wooden board on white, "table" = plate on a wooden tabletop.

## Not dishes (left in Downloads, not copied; prefix Gemini_Generated_Image_)
25cwe625cwe625cw (Colosseum on red), 2bkavg2bkavg2bka (Pantheon line art), 6k2a2n6k2a2n6k2a (Colosseum silhouette),
i66j52i66j52i66j (Colosseum + laurel roundel), r1pepir1pepir1pe (laurel wreath), s5evvvs5evvvs5ev (arch row). Brand art.

## Flags
- Pizza photos show ham (Hawaiian) and pepperoni; the menu says "Pizza: no pork". Client should confirm or reword.
- Matched by look, not caption: bam-e (egg + glass noodles), pancit-canton (strip photo), binagoongan-fried-rice (pink rice, diced mango and tomato; could be Java Rice), plain-scoop-rice (rice bowl in strip photo).
- bam-e.jpg has a flat lighter band across the top 12% (generation seam) and a second tapsilog plate (unused, tapsilog has its own).
- tyulah-itum, bulalo, halo-halo have baked-in white rounded-corner cutouts from the PDF panels. Do not show the full frame unmasked.
- pancit-canton.jpg also shows a tuna steak and a halo-halo (unused, both have better photos).
- crispy-pata-large has no photo of its own: it reuses the Regular one. Same name = same photo across sections (chicken-bbq, crispy-pork-chop, grilled-tuna-belly).

## Photos per category (have / listed)
Full: All-Day Breakfast 3/3, Pizza and Starters 5/5, House Favourites 5/5, From the Sea 5/5.
Partial: Noodles 2/4, Unli Rice 6/17, Rice Meals 2/7, Vegetables 1/4, Chicken 1/5, Beef 1/7, Pork 3/8, More from the Sea 1/5, Soup 1/6, Salad 1/5, Rice 2/6, Cold Drinks 2/3, Shakes 1/2, Hot drinks 2/4.
None: Water and Soda, Juice, Beer.

## Slugs that have a photo (41)
all-meat-overload, bam-e, bangsilog, barako-brewed-coffee, beef-kulma, binagoongan-fried-rice, blue-lemonade, buko-pandan, bulalo, calamares, cheese-stick, chicken-bbq, chicksilog, crispy-pata-large, crispy-pata-regular, crispy-pork-chop, fries, garlic-buttered-shrimp, grilled-pork-liempo, grilled-tuna-belly, grilled-tuna-panga, halo-halo, hawaiian, honey-lemon-chicken, hot-choco, iced-tea, kilawin, medium-bilao, pancit-canton, pepperoni, pinakbet, plain-scoop-rice, pork-sisig, salad-combo-c, seafood-medley, shrimp-in-coconut-sauce, sinigang-na-hipon, small-bilao, sweet-and-sour-fish-fillet, tapsilog, tyulah-itum.

## Plates for alsoFor dishes (cx, cy, r in the primary's file)
pork-sisig 0.498 0.355 0.31 (crispy-pata-regular) | sinigang-na-hipon 0.498 0.655 0.31 (sweet-and-sour-fish-fillet) | seafood-medley 0.501 0.68 0.30 (grilled-pork-liempo) | binagoongan-fried-rice 0.5 0.67 0.32 (salad-combo-c) | crispy-pork-chop 0.496 0.697 0.335 (grilled-tuna-panga) | pinakbet 0.5 0.67 0.28 (chicken-bbq) | beef-kulma 0.5 0.67 0.28 (honey-lemon-chicken) | blue-lemonade 0.5 0.46 0.25 and buko-pandan 0.5 0.737 0.28 (iced-tea) | hot-choco 0.499 0.678 0.30 (barako-brewed-coffee) | plain-scoop-rice 0.501 0.57 0.14 (pancit-canton)
