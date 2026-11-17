// The whole menu, transcribed from reference/menu-pages/page-02..15.png (spec section 4).
// Names, descriptions and prices are verbatim from the PDF; names are Title Case (tests/CONTRACT.md).
// `icon` is the file stem under design-system/svg/ (e.g. 'icon-pork' -> design-system/svg/icon-pork.svg).
import { slug } from '../lib/slug';
import type { Badge, Category, Item, NoteLine, Page, Variant } from '../types';

interface ItemExtra {
  description?: string;
  subgroup?: string;
  badges?: Badge[];
  variants?: Variant[];
}

interface CategorySpec {
  id: string;
  title: string;
  icon: string;
  tagline?: string;
  notes?: NoteLine[];
}

/** Builds one row. The id is derived (`${categoryId}/${slug(name)}`) so it can never drift from the name. */
function row(categoryId: string, name: string, price: number | null, extra: ItemExtra = {}): Item {
  const item: Item = { id: `${categoryId}/${slug(name)}`, name, price, badges: [...(extra.badges ?? [])] };
  if (extra.description !== undefined) item.description = extra.description;
  if (extra.subgroup !== undefined) item.subgroup = extra.subgroup;
  if (extra.variants !== undefined) item.variants = extra.variants;
  return item;
}

/** Rows of one category: [name, price, extra?]. */
type Row = [name: string, price: number | null, extra?: ItemExtra];

function category(spec: CategorySpec, rows: Row[]): Category {
  const out: Category = {
    id: spec.id,
    title: spec.title,
    icon: spec.icon,
    notes: spec.notes ?? [],
    items: rows.map(([name, price, extra]) => row(spec.id, name, price, extra)),
  };
  if (spec.tagline !== undefined) out.tagline = spec.tagline;
  return out;
}

const MIDDOT = '·';
const UNLI: ItemExtra = { badges: ['Unli rice'] };
const unli = (description?: string): ItemExtra => (description === undefined ? UNLI : { ...UNLI, description });
const FAMILY = { description: 'Family size, 12 inch' };
const GLASS_PITCHER: Variant[] = [
  { label: 'Glass', price: 69 },
  { label: 'Pitcher', price: 130 },
];
const glassPitcher = (): ItemExtra => ({ subgroup: 'Cold Drinks', variants: GLASS_PITCHER.map((v) => ({ ...v })) });

export const PAGES: Page[] = [
  { kind: 'cover', id: 'cover' },

  // PDF p2
  {
    kind: 'category',
    id: 'breakfast',
    label: 'Breakfast & Noodles',
    categories: [
      category({ id: 'all-day-breakfast', title: 'All-Day Breakfast', icon: 'icon-breakfast' }, [
        ['Chicksilog', 150, { description: 'Garlic fried rice, crispy fried chicken and a sunny-side-up egg' }],
        ['Bangsilog', 150, { description: 'Garlic fried rice, crispy fried bangus (milkfish) and a sunny-side-up egg' }],
        ['Tapsilog', 150, { description: 'Garlic fried rice, tender beef tapa and a sunny-side-up egg' }],
      ]),
      category({ id: 'noodles', title: 'Noodles', icon: 'icon-noodles' }, [
        ['Sotanghon', 220, { description: 'Glass noodles' }],
        ['Pancit Canton', 220],
        ['Bihon', 220, { description: 'Thin rice noodles' }],
        ['Bam-E', 220, { description: 'Egg noodles and glass noodles together' }],
      ]),
    ],
  },

  // PDF p3 (first 9) and p4 (last 8)
  {
    kind: 'category',
    id: 'unli-rice',
    label: 'Unli Rice',
    categories: [
      category(
        {
          id: 'unli-rice',
          title: 'Unli Rice',
          icon: 'icon-unli-rice',
          tagline: 'Rice without limits',
          notes: [{ text: `Unlimited rice ${MIDDOT} Free drinks and soup` }],
        },
        [
          ['Chicken BBQ', 99, unli()],
          ['Pork BBQ (3 sticks)', 99, unli()],
          ['Tuna Sisig', 99, unli()],
          ['Tinolang Isda', 99, unli('Fish in a clear ginger broth')],
          ['Seafood Medley', 148, unli()],
          ['Fried Tuna Buntot', 148, unli('Fried tuna tail')],
          ['Grilled Pork Liempo', 148, unli('Grilled pork belly')],
          ['Crispy Pork Liempo', 148, unli('Crispy pork belly')],
          ['Grilled Pork Chop', 148, unli()],
          ['Crispy Pork Chop', 148, unli()],
          ['Pork Hungarian', 148, unli('Hungarian-style pork sausage')],
          ['Battered Chicken', 148, unli()],
          ['Buffalo Chicken', 148, unli()],
          ['Grilled Tuna Panga', 198, unli('Grilled tuna jaw')],
          ['Grilled Tuna Belly', 198, unli()],
          ['Grilled Pompano', 220, unli()],
          ['Fried Pompano', 220, unli()],
        ],
      ),
    ],
  },

  // PDF p5
  {
    kind: 'category',
    id: 'pizza',
    label: 'Pizza & Starters',
    categories: [
      category(
        {
          id: 'pizza',
          title: 'Pizza',
          icon: 'icon-pizza',
          notes: [{ text: `Pizza: no pork ${MIDDOT} family size, 12 inch` }],
        },
        [
          ['Hawaiian', 299, FAMILY],
          ['Pepperoni', 299, FAMILY],
          ['All Meat Overload', 310, FAMILY],
        ],
      ),
      category({ id: 'starters', title: 'Starters', icon: 'icon-starters' }, [
        ['Fries', 100],
        ['Cheese Stick', 120],
      ]),
    ],
  },

  // PDF p6
  {
    kind: 'category',
    id: 'favourites',
    label: 'House Favourites',
    categories: [
      category({ id: 'house-favourites', title: 'House Favourites', icon: 'icon-house-favourites', tagline: 'Made for sharing' }, [
        [
          'Small Bilao',
          550,
          {
            description: 'Rice, battered chicken, lumpia shanghai, boneless bangus, tortang talong, fried talong',
            badges: ['For sharing'],
          },
        ],
        [
          'Medium Bilao',
          950,
          {
            description: 'Rice, battered chicken, chicken BBQ, calamares, lumpia shanghai, boneless bangus',
            badges: ['For sharing'],
          },
        ],
        ['Tyulah Itum', 300, { description: 'Tausug black beef soup with burnt coconut', badges: ['Soup'] }],
        ['Bulalo', 300, { description: 'Beef shank and bone-marrow soup', badges: ['Soup'] }],
        ['Halo-Halo', 100, { description: 'Shaved ice with sweet toppings and milk', badges: ['Dessert'] }],
      ]),
    ],
  },

  // PDF p7
  {
    kind: 'category',
    id: 'rice-meals',
    label: 'Rice Meals & Veg',
    categories: [
      category({ id: 'rice-meals', title: 'Rice Meals', icon: 'icon-rice-meals', tagline: 'Simple and hearty' }, [
        ['Chicken BBQ', 99],
        ['Buffalo Chicken', 148],
        ['Battered Chicken', 148],
        ['Hungarian Sausage', 148],
        ['Crispy Pork Liempo', 148, { description: 'Crispy pork belly' }],
        ['Grilled Pork Chop', 148],
        ['Crispy Pork Chop', 148],
      ]),
      category({ id: 'vegetables', title: 'Vegetables', icon: 'icon-vegetables' }, [
        ['Chopsuey', 240, { description: 'Stir-fried mixed vegetables' }],
        ['Pinakbet', 240, { description: 'Mixed vegetables with shrimp paste' }],
        ['Seafood Veggies', 240],
        ['Stir Fry Veggies', 240],
      ]),
    ],
  },

  // PDF p8
  {
    kind: 'category',
    id: 'chicken-beef',
    label: 'Chicken & Beef',
    categories: [
      category({ id: 'chicken', title: 'Chicken', icon: 'icon-chicken', tagline: 'Fresh from the kitchen' }, [
        ['Battered Chicken', 240],
        ['Honey Lemon Chicken', 260],
        ['Buffalo Chicken', 260],
        ['Chicken Sisig', 260],
        ['Chicken Skin', 220, { description: 'Crispy chicken skin' }],
      ]),
      category({ id: 'beef', title: 'Beef', icon: 'icon-beef' }, [
        ['Tenderloin Steak', 450],
        ['Beef Steak', 280],
        ['Beef Kulma', 280, { description: 'Tausug-style spiced beef stew' }],
        ['Beef Sisig', 260],
        ['Lumpia Shanghai', 250, { description: 'Crispy spring rolls' }],
        ['Beef Liver Sisig', 240],
        ['Beef Liver Steak', 240],
      ]),
    ],
  },

  // PDF p9
  {
    kind: 'category',
    id: 'pork',
    label: 'Pork',
    categories: [
      category({ id: 'pork', title: 'Pork', icon: 'icon-pork', tagline: 'Crispy and sizzling' }, [
        ['Lechon Kawali', 280, { description: 'Crispy fried pork belly' }],
        ['Humba', 280, { description: 'Sweet braised pork' }],
        ['Pork Dinuguan', 250, { description: 'Pork stew in a savoury pork-blood sauce' }],
        ['Pata with Pork and Beans', 250],
        ['Pork Sisig', 240],
        ['Chicharon Bulaklak', 220, { description: 'Crispy fried pork mesentery' }],
        // The PDF leaves both Crispy Pata prices blank ("₱ ____"): price is null, the UI shows nothing.
        ['Crispy Pata, Regular', null, { description: 'Deep-fried pork knuckle' }],
        ['Crispy Pata, Large', null],
      ]),
    ],
  },

  // PDF p10 (first 5) and p11 "More from the Sea" (last 5)
  {
    kind: 'category',
    id: 'sea',
    label: 'From the Sea',
    categories: [
      category({ id: 'from-the-sea', title: 'From the Sea', icon: 'icon-seafood', tagline: 'More from the sea' }, [
        ['Grilled Tuna Belly', 340],
        ['Garlic Buttered Shrimp', 300],
        ['Shrimp in Coconut Sauce', 300],
        ['Kilawin', 250, { description: 'Fresh fish cured in vinegar' }],
        ['Calamares', 230, { description: 'Fried squid rings' }],
        ['Fish Fillet, Black Bean Sauce', 250],
        ['Sweet and Sour Fish Fillet', 250],
        ['Fish Fillet, Tartar Sauce', 250],
        ['Tuna Sisig', 250],
        ['Crispy Shrimps', 230],
      ]),
    ],
  },

  // PDF p11
  {
    kind: 'category',
    id: 'soup',
    label: 'Soup',
    categories: [
      category(
        {
          id: 'soup',
          title: 'Soup',
          icon: 'icon-soup',
          // PDF: "More soups: Tyulah Itum and Bulalo on page 6". App pages differ from the PDF, so it is a jump link.
          notes: [{ text: 'More soups: Tyulah Itum and Bulalo', jumpTo: 'favourites' }],
        },
        [
          ['Sinigang na Baboy', 250, { description: 'Sour soup with pork' }],
          ['Tinolang Isda', 240, { description: 'Fish in a clear ginger broth' }],
          ['Sinigang na Hipon', 220, { description: 'Sour soup with shrimp' }],
          ['Corn Soup', 220],
          ['Clam Soup', 220],
          ['Lomi', 210, { description: 'Thick egg-noodle soup' }],
        ],
      ),
    ],
  },

  // PDF p12
  {
    kind: 'category',
    id: 'salad-rice',
    label: 'Salad & Rice',
    categories: [
      category({ id: 'salad', title: 'Salad', icon: 'icon-salad', tagline: 'Fresh and simple' }, [
        ['Salad Solo', 120, { description: 'Lettuce, carrots, cucumber, tomato, onion, salad dressing' }],
        ['Salad Combo A', 220, { description: 'French fries, chicken BBQ, salad' }],
        ['Salad Combo B', 220, { description: 'French fries, buttered chicken, salad' }],
        ['Salad Combo C', 220, { description: 'French fries, chicken katsu, salad' }],
        ['Salad Combo D', 220, { description: 'French fries, fish fillet, salad' }],
      ]),
      category({ id: 'rice', title: 'Rice', icon: 'icon-rice' }, [
        ['Plain Scoop Rice', 30],
        ['Plain Platter Rice', 130],
        ['Java Rice', 180, { description: 'Seasoned yellow fried rice' }],
        ['Garlic Rice', 180],
        ['Binagoongan Fried Rice', 190, { description: 'Fried rice with shrimp paste' }],
        ['Shanghai Fried Rice', 200],
      ]),
    ],
  },

  // PDF p13
  {
    kind: 'category',
    id: 'cold-drinks',
    label: 'Cold Drinks',
    categories: [
      category({ id: 'cold-drinks', title: 'Drinks', icon: 'icon-cold-drinks', tagline: 'Ice cold and fresh' }, [
        ['Bottled Water', 30, { subgroup: 'Water and Soda' }],
        ['Coke, Sprite, Royal, Mountain Dew', 40, { subgroup: 'Water and Soda' }],
        ['Coke 1.5 L', 140, { subgroup: 'Water and Soda' }],
        ['Four Season Juice', 75, { subgroup: 'Juice', description: 'Mixed fruit juice' }],
        ['Pineapple Juice', 75, { subgroup: 'Juice' }],
        // Glass 69 / Pitcher 130: the headline price is the cheaper one.
        ['Iced Tea', 69, glassPitcher()],
        ['Blue Lemonade', 69, glassPitcher()],
        ['Cucumber Lemonade', 69, glassPitcher()],
        ['Strawberry', 80, { subgroup: 'Shakes' }],
        ['Buko Pandan', 80, { subgroup: 'Shakes', description: 'Young coconut and pandan' }],
      ]),
    ],
  },

  // PDF p14
  {
    kind: 'category',
    id: 'hot-drinks',
    label: 'Hot Drinks & Beer',
    categories: [
      category({ id: 'hot-drinks', title: 'Drinks', icon: 'icon-hot-drinks', tagline: 'Salute! To good company' }, [
        ['Barako Brewed Coffee', 60, { subgroup: 'Hot', description: 'Strong local brewed coffee' }],
        ['Green Tea', 60, { subgroup: 'Hot' }],
        ['Lemon Tea', 60, { subgroup: 'Hot' }],
        ['Hot Choco', 60, { subgroup: 'Hot' }],
        ['San Mig Apple', 75, { subgroup: 'Beer' }],
        ['San Mig Light', 75, { subgroup: 'Beer' }],
        ['Pale Pilsen', 75, { subgroup: 'Beer' }],
        ['Red Horse', 75, { subgroup: 'Beer' }],
        ['Cali', 75, { subgroup: 'Beer' }],
      ]),
    ],
  },

  // PDF p15
  { kind: 'closing', id: 'grazie' },
];
