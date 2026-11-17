// Anatomia regions, keyed by PHOTO slug (the key in photos.json), not by item.
// Each region is an axis-aligned ellipse in image fractions (0..1 of the photo's width/height), centred on one
// real component of the dish. They were placed on public/dishes/<slug>.jpg and checked by drawing them over the
// photo, so they hug the food, not the plate. The UI crops the photo with them (lib/anatomy regionClipPath).
// Components follow the printed description where there is one; garnish that is clearly on the plate is added.
import type { AnatomyRegion, PhotoSlug } from '../types';

export const ANATOMY: Record<PhotoSlug, AnatomyRegion[]> = {
  // 900 x 900
  chicksilog: [
    { label: 'Garlic fried rice', detail: 'With crisp garlic bits', cx: 0.453, cy: 0.389, rx: 0.213, ry: 0.153 },
    { label: 'Fried chicken', detail: 'Two crispy drumsticks', cx: 0.393, cy: 0.624, rx: 0.139, ry: 0.144 },
    { label: 'Sunny-side-up egg', cx: 0.594, cy: 0.601, rx: 0.114, ry: 0.13 },
    { label: 'Tomato slices', cx: 0.717, cy: 0.478, rx: 0.083, ry: 0.144 },
  ],

  // 900 x 900. A second pair of tomato slices sits below the egg; only the upper pair is covered.
  bangsilog: [
    { label: 'Garlic fried rice', detail: 'With crisp garlic bits', cx: 0.422, cy: 0.572, rx: 0.178, ry: 0.183 },
    { label: 'Fried bangus', detail: 'Crispy milkfish', cx: 0.609, cy: 0.35, rx: 0.109, ry: 0.133 },
    { label: 'Sunny-side-up egg', cx: 0.709, cy: 0.568, rx: 0.119, ry: 0.121 },
    { label: 'Tomato slices', cx: 0.788, cy: 0.411, rx: 0.078, ry: 0.1 },
    { label: 'Vinegar dip', detail: 'Vinegar with chili and peppercorns', cx: 0.406, cy: 0.308, rx: 0.098, ry: 0.094 },
  ],

  // 900 x 900. The tomatoes run diagonally, so the ellipse is a little generous at the far corners.
  tapsilog: [
    { label: 'Garlic fried rice', detail: 'With crisp garlic bits', cx: 0.414, cy: 0.396, rx: 0.15, ry: 0.142 },
    { label: 'Beef tapa', detail: 'Tender beef tapa', cx: 0.404, cy: 0.642, rx: 0.173, ry: 0.14 },
    { label: 'Sunny-side-up egg', cx: 0.627, cy: 0.572, rx: 0.138, ry: 0.144 },
    { label: 'Tomato slices', cx: 0.68, cy: 0.364, rx: 0.15, ry: 0.138 },
  ],

  // 900 x 382
  'small-bilao': [
    { label: 'Rice', cx: 0.723, cy: 0.361, rx: 0.101, ry: 0.149 },
    { label: 'Battered chicken', cx: 0.557, cy: 0.262, rx: 0.082, ry: 0.131 },
    { label: 'Lumpia shanghai', detail: 'Crispy spring rolls', cx: 0.594, cy: 0.432, rx: 0.081, ry: 0.118 },
    { label: 'Boneless bangus', detail: 'Fried milkfish', cx: 0.694, cy: 0.62, rx: 0.156, ry: 0.144 },
    { label: 'Tortang talong', detail: 'Eggplant omelette', cx: 0.479, cy: 0.586, rx: 0.088, ry: 0.131 },
    { label: 'Fried talong', detail: 'Fried eggplant slices', cx: 0.453, cy: 0.395, rx: 0.069, ry: 0.094 },
  ],

  // 900 x 382
  'medium-bilao': [
    { label: 'Rice', cx: 0.276, cy: 0.44, rx: 0.102, ry: 0.168 },
    { label: 'Battered chicken', cx: 0.423, cy: 0.257, rx: 0.097, ry: 0.141 },
    { label: 'Chicken BBQ', detail: 'Grilled on skewers', cx: 0.586, cy: 0.348, rx: 0.117, ry: 0.17 },
    { label: 'Calamares', detail: 'Fried squid rings', cx: 0.438, cy: 0.503, rx: 0.079, ry: 0.131 },
    { label: 'Lumpia shanghai', detail: 'Crispy spring rolls', cx: 0.34, cy: 0.675, rx: 0.107, ry: 0.147 },
    { label: 'Boneless bangus', detail: 'Fried milkfish', cx: 0.561, cy: 0.61, rx: 0.119, ry: 0.17 },
  ],

  // 502 x 900. Top plate only. The rice plate below is Binagoongan Fried Rice (alsoFor) and has no regions.
  'salad-combo-c': [
    { label: 'Chicken katsu', detail: 'Breaded fried cutlet', cx: 0.412, cy: 0.358, rx: 0.185, ry: 0.082 },
    { label: 'French fries', cx: 0.408, cy: 0.236, rx: 0.116, ry: 0.051 },
    { label: 'Salad', detail: 'Lettuce, tomato, cucumber, onion', cx: 0.631, cy: 0.288, rx: 0.169, ry: 0.099 },
  ],

  // 900 x 382
  'halo-halo': [
    { label: 'Ube ice cream', cx: 0.644, cy: 0.178, rx: 0.044, ry: 0.099 },
    { label: 'Leche flan', detail: 'Caramel custard', cx: 0.573, cy: 0.225, rx: 0.048, ry: 0.094 },
    { label: 'Shaved ice', cx: 0.611, cy: 0.411, rx: 0.087, ry: 0.131 },
    { label: 'Sweet toppings', detail: 'Sweet beans and jellies', cx: 0.609, cy: 0.649, rx: 0.069, ry: 0.144 },
  ],
};
