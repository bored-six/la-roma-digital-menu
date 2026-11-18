# Gemini prompts for the missing dish photos

2 dishes still have no photo (the menu has 111 items, 90 are covered). 8 bottled drinks are left out on purpose, see the end.
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

## Beef

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

## Left out on purpose (8)

`bottled-water`, `coke-sprite-royal-mountain-dew`, `coke-1-5-l`, `san-mig-apple`, `san-mig-light`, `pale-pilsen`, `red-horse`, `cali`.
Gemini invents fake or wrong brand labels on bottles, and these are real brands. The placeholder plate covers them.
