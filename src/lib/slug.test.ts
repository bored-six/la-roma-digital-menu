// Contract: slug(name) = kebab of the printed name (spec section 3). Open points decided in tests/CONTRACT.md:
// lowercase ASCII, every run of non-[a-z0-9] becomes one "-", ends trimmed, accents stripped.
import { describe, expect, it } from 'vitest';
import { slug } from './slug';

describe('slug', () => {
  it.each([
    ['Chicksilog', 'chicksilog'],
    ['Bam-E', 'bam-e'],
    ['Halo-Halo', 'halo-halo'],
    ['Crispy Pata, Regular', 'crispy-pata-regular'],
    ['Fish Fillet, Black Bean Sauce', 'fish-fillet-black-bean-sauce'],
    ['Pork BBQ (3 sticks)', 'pork-bbq-3-sticks'],
    ['Coke, Sprite, Royal, Mountain Dew', 'coke-sprite-royal-mountain-dew'],
    ['Coke 1.5 L', 'coke-1-5-l'],
    ['Pata with Pork and Beans', 'pata-with-pork-and-beans'],
    ['Salad Combo A', 'salad-combo-a'],
    ['Pizza & Starters', 'pizza-starters'],
  ])('%s -> %s', (name, expected) => {
    expect(slug(name)).toBe(expected);
  });

  it('matches the photo keys used in src/data/photos.json for tricky printed names', () => {
    expect(slug('Shrimp in Coconut Sauce')).toBe('shrimp-in-coconut-sauce');
    expect(slug('Sweet and Sour Fish Fillet')).toBe('sweet-and-sour-fish-fillet');
    expect(slug('Barako Brewed Coffee')).toBe('barako-brewed-coffee');
    expect(slug('Binagoongan Fried Rice')).toBe('binagoongan-fried-rice');
  });

  it('is case-insensitive', () => {
    expect(slug('ALL MEAT OVERLOAD')).toBe('all-meat-overload');
    expect(slug('all Meat overLOAD')).toBe('all-meat-overload');
  });

  it('collapses runs of spaces, tabs, newlines and punctuation into a single hyphen', () => {
    expect(slug('a    b')).toBe('a-b');
    expect(slug('a \t\n b')).toBe('a-b');
    expect(slug('a - - b')).toBe('a-b');
    expect(slug('a,,, (b)')).toBe('a-b');
  });

  it('never starts or ends with a hyphen', () => {
    expect(slug('  Padded  ')).toBe('padded');
    expect(slug('(Hot) Choco!')).toBe('hot-choco');
    expect(slug('--x--')).toBe('x');
  });

  it('strips accents, composed or decomposed', () => {
    expect(slug('Café')).toBe('cafe');
    expect(slug('Café')).toBe('cafe');
    expect(slug('Jalapeño Poppers')).toBe('jalapeno-poppers');
  });

  it('drops the peso sign and other symbols', () => {
    expect(slug('₱150 Special')).toBe('150-special');
  });

  it('returns an empty string when nothing slug-worthy is left', () => {
    expect(slug('')).toBe('');
    expect(slug('   ')).toBe('');
    expect(slug('---')).toBe('');
    expect(slug('(!)')).toBe('');
  });

  it('output is always [a-z0-9] groups joined by single hyphens, and idempotent', () => {
    const samples = [
      'Chicksilog', 'Crispy Pata, Regular', 'Pork BBQ (3 sticks)', 'Coke 1.5 L', '  --Odd__Name?!  ',
      'Café À la carte', 'ALL CAPS', '', '123', 'a-b-c',
    ];
    for (const s of samples) {
      const out = slug(s);
      expect(out === '' || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(out), `slug(${JSON.stringify(s)}) = ${JSON.stringify(out)}`).toBe(true);
      expect(slug(out)).toBe(out);
    }
  });

  it('is deterministic: the same input twice gives the same output (no global regex lastIndex leak)', () => {
    const a = slug('Pork BBQ (3 sticks)');
    const b = slug('Pork BBQ (3 sticks)');
    const c = slug('Crispy Pata, Regular');
    const d = slug('Crispy Pata, Regular');
    expect([a, b, c, d]).toEqual(['pork-bbq-3-sticks', 'pork-bbq-3-sticks', 'crispy-pata-regular', 'crispy-pata-regular']);
  });
});
