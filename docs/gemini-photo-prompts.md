# Gemini prompts for the missing dish photos

35 dishes still have no photo (the menu has 111 items, 57 are covered). 8 bottled drinks are left out on purpose, see the end.
Where a dish has no photo the app shows the placeholder plate, so nothing breaks if you skip some.

## How to use it

Every dish below is ONE complete prompt: the style lock is already inside it. Copy a block, paste it, done.

1. Open a new Gemini chat and attach the reference photos from `public/dishes/`: `tapsilog.jpg` and `bangsilog.jpg`. For drinks attach `iced-tea.jpg` instead.
   Never attach `bulalo.jpg`, `halo-halo.jpg` or `tyulah-itum.jpg`: they have white rounded-corner cutouts baked in and Gemini will copy them.
2. Paste a dish block. You get a 1:1 square. Ask for the highest resolution if it comes out small.
3. Keep pasting the next blocks in the same chat. Start a fresh chat every 8 dishes or so and re-attach the references, because drift builds up in long chats.
4. If a result changes the plate, the table or the light, reply: "Match the attached reference photos exactly: same plate, same table, same light." Do not accept it and move on.

## After you generate

- Save each image as `public/dishes/<slug>.jpg` using the slug in the heading above each block.
- Resize to 900 px on the long side, JPEG quality around 80, under 150 KB each. Hand the folder to Claude and it will do the resizing, the sizes table and the `photos.json` entries (alt text, plate circle) for you.
- Overhead shots start from `plate = { cx 0.5, cy 0.5, r 0.40 }`. Claude tunes it per photo.

## Vegetables

### `stir-fry-veggies`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Crisp stir-fried vegetables (broccoli, carrot, cabbage, bell pepper, snow peas), bright colours, light sheen, in a shallow cream bowl.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

## Chicken

### `chicken-sisig`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Chopped chicken sisig with onion, green chili and a drizzle of mayo, a calamansi half.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `chicken-skin`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: A heap of crispy fried chicken skin crackles, golden brown, with a small cup of vinegar dip.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

## Beef

### `tenderloin-steak`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: One seared beef tenderloin steak, sliced, with a glossy brown gravy and a little buttered corn and carrot.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `beef-steak`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Filipino beef steak (bistek): thin beef slices braised in soy and calamansi, topped with caramelised onion rings.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `beef-sisig`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Chopped beef sisig with red onion and green chili, a calamansi half.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `lumpia-shanghai`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: A neat pile of 8 crispy lumpia shanghai (thin spring rolls), golden brown, a small cup of sweet chili dip.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `beef-liver-sisig`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Chopped beef liver sisig with onion and green chili, a calamansi half.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `beef-liver-steak`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Pan-seared beef liver in a soy-onion sauce with onion rings.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

## Pork

### `lechon-kawali`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Lechon kawali, chunky pieces of deep-fried pork belly with blistered golden skin, a small cup of liver-sauce dip.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `humba`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Humba, sweet braised pork belly in a dark glossy sauce with a few saba banana slices, in a cream bowl.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `pork-dinuguan`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Pork dinuguan, a dark glossy chocolate-brown pork stew with a long green chili on top, in a cream bowl, two small white puto on the side.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `pata-with-pork-and-beans`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Braised pork hock (pata) with pork and beans in a red-brown sauce, in a shallow cream bowl.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `chicharon-bulaklak`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Chicharon bulaklak, ruffled golden crispy fried pork "flowers", a small cup of vinegar dip with chili and onion.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

## From the Sea

### `fish-fillet-black-bean-sauce`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Crispy fish fillet strips in a glossy black bean sauce with spring onion and red chili slices.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `fish-fillet-tartar-sauce`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Golden breaded fish fillet with a spoon of white tartar sauce and a lemon wedge.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `crispy-shrimps`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Crispy golden battered shrimp with tails on, a small cup of sweet chili dip, a lemon wedge.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

## Soup

### `sinigang-na-baboy`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Sinigang na baboy, pork ribs in a sour tamarind broth with kangkong, radish, eggplant, string beans and tomato.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `corn-soup`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Creamy yellow corn soup with egg ribbons and chopped spring onion.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `clam-soup`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Clams in a clear ginger broth with spring onion, some shells open.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `lomi`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Lomi, a thick golden-brown egg-noodle soup with pork slices, a halved boiled egg, fish balls and spring onion.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

## Salad

### `salad-solo`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Fresh lettuce, carrot, cucumber, tomato and red onion in a small cream bowl, a small cup of salad dressing beside it.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `salad-combo-a`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: One plate with French fries, two chicken BBQ skewers and a fresh salad (lettuce, tomato, cucumber).

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `salad-combo-b`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: One plate with French fries, buttered chicken pieces and a fresh salad (lettuce, tomato, cucumber).

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `salad-combo-d`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: One plate with French fries, a golden breaded fish fillet and a fresh salad (lettuce, tomato, cucumber).

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

## Rice

### `plain-platter-rice`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: A generous mound of steamed white rice on a larger round cream platter.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `java-rice`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Java rice, seasoned yellow fried rice with fine carrot and green pea bits, mounded on the plate.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `garlic-rice`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Garlic fried rice topped with golden toasted garlic bits, mounded on the plate.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `shanghai-fried-rice`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same plate, same table, same light, same colour grade. Do not restyle anything.

Dish: Shanghai fried rice with small pork pieces, shrimp, egg, carrot and green peas.

Camera: straight top-down (90 degrees overhead), the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups and stews use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

## Drinks

### `four-season-juice`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same saucer, same table, same light, same colour grade. Do not restyle anything.

Drink: Tall glass of mixed-fruit juice, warm orange-yellow, with ice and an orange slice on the rim.

Camera: about 35 degrees above the table (not overhead), the drink centred.
Vessel: a tall clear glass (or a cream ceramic cup for hot drinks) standing centred on a round cream saucer with a thin terracotta-red line along the rim. The saucer fills about 60 percent of the image width.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Drink: freshly poured, natural colours, light condensation on cold glasses, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `pineapple-juice`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same saucer, same table, same light, same colour grade. Do not restyle anything.

Drink: Tall glass of pale golden pineapple juice with ice and a small pineapple wedge on the rim.

Camera: about 35 degrees above the table (not overhead), the drink centred.
Vessel: a tall clear glass (or a cream ceramic cup for hot drinks) standing centred on a round cream saucer with a thin terracotta-red line along the rim. The saucer fills about 60 percent of the image width.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Drink: freshly poured, natural colours, light condensation on cold glasses, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `cucumber-lemonade`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same saucer, same table, same light, same colour grade. Do not restyle anything.

Drink: Tall glass of pale green cucumber lemonade with ice, cucumber slices and a lemon wheel.

Camera: about 35 degrees above the table (not overhead), the drink centred.
Vessel: a tall clear glass (or a cream ceramic cup for hot drinks) standing centred on a round cream saucer with a thin terracotta-red line along the rim. The saucer fills about 60 percent of the image width.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Drink: freshly poured, natural colours, light condensation on cold glasses, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `strawberry`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same saucer, same table, same light, same colour grade. Do not restyle anything.

Drink: Tall glass of a thick pink strawberry shake, a whole strawberry on the rim, no straw.

Camera: about 35 degrees above the table (not overhead), the drink centred.
Vessel: a tall clear glass (or a cream ceramic cup for hot drinks) standing centred on a round cream saucer with a thin terracotta-red line along the rim. The saucer fills about 60 percent of the image width.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Drink: freshly poured, natural colours, light condensation on cold glasses, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `green-tea`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same saucer, same table, same light, same colour grade. Do not restyle anything.

Drink: Hot green tea in a cream ceramic cup on a saucer, clear pale green-gold colour.

Camera: about 35 degrees above the table (not overhead), the drink centred.
Vessel: a tall clear glass (or a cream ceramic cup for hot drinks) standing centred on a round cream saucer with a thin terracotta-red line along the rim. The saucer fills about 60 percent of the image width.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Drink: freshly poured, natural colours, light condensation on cold glasses, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

### `lemon-tea`
```
Generate ONE square 1:1 photo for a restaurant menu, in EXACTLY the same photographic style as the attached reference photos: same saucer, same table, same light, same colour grade. Do not restyle anything.

Drink: Hot lemon tea in a cream ceramic cup on a saucer, amber colour, a lemon slice floating in it.

Camera: about 35 degrees above the table (not overhead), the drink centred.
Vessel: a tall clear glass (or a cream ceramic cup for hot drinks) standing centred on a round cream saucer with a thin terracotta-red line along the rim. The saucer fills about 60 percent of the image width.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Drink: freshly poured, natural colours, light condensation on cold glasses, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.
```

## Left out on purpose (8)

`bottled-water`, `coke-sprite-royal-mountain-dew`, `coke-1-5-l`, `san-mig-apple`, `san-mig-light`, `pale-pilsen`, `red-horse`, `cali`.
Gemini invents fake or wrong brand labels on bottles, and these are real brands. The placeholder plate covers them.
