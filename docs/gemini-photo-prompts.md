# Gemini prompts for the missing dish photos

51 dishes still have no photo (the menu has 111 items, 41 are covered). 8 bottled drinks are left out on purpose, see the end.
Where a dish has no photo the app shows the placeholder plate, so nothing breaks if you skip some.

## How to run it (this is the style lock)

1. Open a new Gemini chat. Attach these reference photos from `public/dishes/`: `tapsilog.jpg`, `bangsilog.jpg` and, for drinks only, `iced-tea.jpg`.
   Do not use `bulalo.jpg`, `halo-halo.jpg` or `tyulah-itum.jpg` as references: they have white rounded-corner cutouts baked in and Gemini will copy them.
2. Paste the lock below as your first message.
3. Then paste one dish line at a time. Ask for a 1:1 square at the highest resolution.
4. Start a fresh chat every 8 dishes or so and re-attach the references and the lock. Drift builds up in long chats.
5. If a result changes the plate, the table or the light, reply: "Match the attached reference photos exactly: same plate, same table, same light." Do not accept it and move on.

### Style lock (paste first)

```
The attached photos are from one restaurant menu. Generate every new image in EXACTLY this photographic style, with the same lighting, plate, table and colour grade. Do not restyle anything.

Camera: straight top-down (90 degrees overhead), square 1:1, the dish centred.
Plate: round matte off-white ceramic plate with a thin terracotta-red line along the rim, centred, filling about 80 percent of the image width. Soups use a matching cream bowl with the same red rim line.
Surface: pale natural maple wood tabletop with fine matte grain, filling the whole frame around the plate.
Light: soft diffuse daylight from a window at the upper left, very soft short shadows, high-key, bright and airy, gentle warm white balance, natural saturation, low contrast.
Food: freshly cooked and appetising, a realistic home-style Filipino restaurant portion, natural imperfections, no over-glossing, no CGI look.
Props: nothing, except optionally a folded cream linen napkin in one corner. No cutlery unless the dish needs it.
Never include: text, logos, brand labels, watermarks, people, hands, extra dishes, steam, smoke, dark or moody backgrounds, neon colours, illustration or 3D render looks.

Reply "ready" and wait for the first dish.
```

### Drinks exception (paste before the drink lines instead of the camera and plate rules)

```
For drinks only: the camera is about 35 degrees above the table instead of overhead. A tall glass (or a cream ceramic cup for hot drinks) stands centred on a round cream saucer with the same thin terracotta-red rim line. Same maple table, same window light, same colour grade. Frame it as a square 1:1 with the saucer filling about 60 percent of the width.
```

## After you generate

- Save each image as `public/dishes/<slug>.jpg` using the slug at the start of each line.
- Resize to 900 px on the long side, JPEG quality around 80, under 150 KB each. Hand the folder to Claude and it will do the resizing, the sizes table and the `photos.json` entries (alt text, plate circle) for you.
- Overhead shots use `plate = { cx 0.5, cy 0.5, r 0.40 }` as the starting point. Claude tunes it per photo.

## Dish lines (send one at a time, after the lock)

Format: `slug` then the dish part.

### Noodles
```
sotanghon: Stir-fried sotanghon (glass noodles) with shredded chicken, julienned carrot, cabbage and spring onion, lightly glossy, a calamansi half on the side.
bihon: Stir-fried bihon (thin rice noodles) with shredded chicken, carrot, cabbage and a calamansi wedge, golden and slightly glossy.
```

### Unli Rice (each with a small mound of steamed white rice on the side)
```
pork-bbq-3-sticks: Three Filipino pork BBQ skewers with a sticky red-brown glaze and charred edges, a small cup of vinegar dip, a small mound of steamed white rice.
tuna-sisig: Chopped grilled tuna sisig with red onion, green chili and a drizzle of mayo, a calamansi half, a small mound of steamed white rice.
tinolang-isda: Tinolang isda, fish pieces in a clear ginger broth with green papaya and green leaves, in a cream bowl, a small mound of steamed white rice beside it.
fried-tuna-buntot: Fried tuna tail (buntot), a golden crisp bone-in piece, a calamansi half and a small cup of vinegar dip, a small mound of steamed white rice.
crispy-pork-liempo: Sliced crispy pork liempo (belly) with bubbly golden crackling skin, a small cup of vinegar dip, a small mound of steamed white rice.
grilled-pork-chop: One bone-in grilled pork chop with light char marks, sliced tomato and red onion, a small mound of steamed white rice.
pork-hungarian: Grilled Hungarian-style pork sausage, thick, red-brown, sliced on the diagonal, a small cup of ketchup and mustard dip, a small mound of steamed white rice.
battered-chicken: Golden crunchy battered fried chicken pieces, a small cup of dip, a small mound of steamed white rice.
buffalo-chicken: Chicken wings tossed in orange buffalo sauce with celery sticks, a small mound of steamed white rice.
grilled-pompano: One whole grilled pompano (a silvery diamond-shaped fish), lightly charred, a lemon wedge, a small mound of steamed white rice.
fried-pompano: One whole fried pompano, golden and crisp, a lemon wedge, a small mound of steamed white rice.
```

### Rice Meals
```
hungarian-sausage: Sliced grilled Hungarian sausage with garlic fried rice, a sunny-side-up egg and two tomato slices.
```

### Vegetables
```
chopsuey: Chopsuey, stir-fried mixed vegetables (broccoli, cauliflower, carrot, baby corn, snow peas) in a light glossy sauce, served in a shallow cream bowl.
seafood-veggies: Stir-fried mixed vegetables with shrimp, squid rings and fish balls in a light glossy sauce, in a shallow cream bowl.
stir-fry-veggies: Crisp stir-fried vegetables (broccoli, carrot, cabbage, bell pepper, snow peas), bright colours, light sheen, in a shallow cream bowl.
```

### Chicken
```
chicken-sisig: Chopped chicken sisig with onion, green chili and a drizzle of mayo, a calamansi half.
chicken-skin: A heap of crispy fried chicken skin crackles, golden brown, with a small cup of vinegar dip.
```

### Beef
```
tenderloin-steak: One seared beef tenderloin steak, sliced, with a glossy brown gravy and a little buttered corn and carrot.
beef-steak: Filipino beef steak (bistek): thin beef slices braised in soy and calamansi, topped with caramelised onion rings.
beef-sisig: Chopped beef sisig with red onion and green chili, a calamansi half.
lumpia-shanghai: A neat pile of 8 crispy lumpia shanghai (thin spring rolls), golden brown, a small cup of sweet chili dip.
beef-liver-sisig: Chopped beef liver sisig with onion and green chili, a calamansi half.
beef-liver-steak: Pan-seared beef liver in a soy-onion sauce with onion rings.
```

### Pork
```
lechon-kawali: Lechon kawali, chunky pieces of deep-fried pork belly with blistered golden skin, a small cup of liver-sauce dip.
humba: Humba, sweet braised pork belly in a dark glossy sauce with a few saba banana slices, in a cream bowl.
pork-dinuguan: Pork dinuguan, a dark glossy chocolate-brown pork stew with a long green chili on top, in a cream bowl, two small white puto on the side.
pata-with-pork-and-beans: Braised pork hock (pata) with pork and beans in a red-brown sauce, in a shallow cream bowl.
chicharon-bulaklak: Chicharon bulaklak, ruffled golden crispy fried pork "flowers", a small cup of vinegar dip with chili and onion.
```

### From the Sea
```
fish-fillet-black-bean-sauce: Crispy fish fillet strips in a glossy black bean sauce with spring onion and red chili slices.
fish-fillet-tartar-sauce: Golden breaded fish fillet with a spoon of white tartar sauce and a lemon wedge.
crispy-shrimps: Crispy golden battered shrimp with tails on, a small cup of sweet chili dip, a lemon wedge.
```

### Soup (cream bowl, overhead, bowl centred)
```
sinigang-na-baboy: Sinigang na baboy, pork ribs in a sour tamarind broth with kangkong, radish, eggplant, string beans and tomato.
corn-soup: Creamy yellow corn soup with egg ribbons and chopped spring onion.
clam-soup: Clams in a clear ginger broth with spring onion, some shells open.
lomi: Lomi, a thick golden-brown egg-noodle soup with pork slices, a halved boiled egg, fish balls and spring onion.
```

### Salad
```
salad-solo: Fresh lettuce, carrot, cucumber, tomato and red onion in a small cream bowl, a small cup of salad dressing beside it.
salad-combo-a: One plate with French fries, two chicken BBQ skewers and a fresh salad (lettuce, tomato, cucumber).
salad-combo-b: One plate with French fries, buttered chicken pieces and a fresh salad (lettuce, tomato, cucumber).
salad-combo-d: One plate with French fries, a golden breaded fish fillet and a fresh salad (lettuce, tomato, cucumber).
```

### Rice
```
plain-platter-rice: A generous mound of steamed white rice on a larger round cream platter.
java-rice: Java rice, seasoned yellow fried rice with fine carrot and green pea bits, mounded on the plate.
garlic-rice: Garlic fried rice topped with golden toasted garlic bits, mounded on the plate.
shanghai-fried-rice: Shanghai fried rice with small pork pieces, shrimp, egg, carrot and green peas.
```

### Drinks (use the drinks exception above)
```
four-season-juice: Tall glass of mixed-fruit juice, warm orange-yellow, with ice and an orange slice on the rim.
pineapple-juice: Tall glass of pale golden pineapple juice with ice and a small pineapple wedge on the rim.
cucumber-lemonade: Tall glass of pale green cucumber lemonade with ice, cucumber slices and a lemon wheel.
strawberry: Tall glass of a thick pink strawberry shake, a whole strawberry on the rim, no straw.
green-tea: Hot green tea in a cream ceramic cup on a saucer, clear pale green-gold colour.
lemon-tea: Hot lemon tea in a cream ceramic cup on a saucer, amber colour, a lemon slice floating in it.
```

## Left out on purpose (8)

`bottled-water`, `coke-sprite-royal-mountain-dew`, `coke-1-5-l`, `san-mig-apple`, `san-mig-light`, `pale-pilsen`, `red-horse`, `cali`.
Gemini invents fake or wrong brand labels on bottles, and these are real brands. The placeholder plate covers them.
