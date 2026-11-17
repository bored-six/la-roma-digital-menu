// Contract: formatPrice(n): '₱150' (spec section 3). null -> '' with no placeholder.
// Open points decided in tests/CONTRACT.md: 0 -> '₱0', negative -> '-₱150', non-finite -> '',
// grouping is always en-US commas with ASCII digits, whatever the device locale.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatPrice } from './price';

const P = '₱'; // peso sign

describe('formatPrice', () => {
  it.each([
    [150, `${P}150`],
    [30, `${P}30`],
    [99, `${P}99`],
    [999, `${P}999`],
    [1000, `${P}1,000`],
    [1250, `${P}1,250`],
    [12500, `${P}12,500`],
    [100000, `${P}100,000`],
    [1000000, `${P}1,000,000`],
    [123456789, `${P}123,456,789`],
  ])('%s -> %s', (n, expected) => {
    expect(formatPrice(n)).toBe(expected);
  });

  it('null prices (the two Crispy Pata rows) give an empty string, not a placeholder', () => {
    expect(formatPrice(null)).toBe('');
  });

  it('0 is a real amount, not "no price"', () => {
    expect(formatPrice(0)).toBe(`${P}0`);
  });

  it('negative amounts put the sign before the peso sign', () => {
    expect(formatPrice(-150)).toBe(`-${P}150`);
    expect(formatPrice(-1250)).toBe(`-${P}1,250`);
  });

  it('non-finite numbers give an empty string instead of "₱NaN"', () => {
    expect(formatPrice(Number.NaN)).toBe('');
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe('');
    expect(formatPrice(Number.NEGATIVE_INFINITY)).toBe('');
  });

  it('has no whitespace anywhere, so the pill never breaks between sign and number', () => {
    for (const n of [150, 1250, 1000000, -5]) expect(formatPrice(n)).not.toMatch(/\s/);
  });
});

describe('formatPrice does not depend on the device locale', () => {
  const originalNumberFormat = Intl.NumberFormat;
  const originalToLocaleString = Number.prototype.toLocaleString;

  afterEach(() => {
    (Intl as { NumberFormat: unknown }).NumberFormat = originalNumberFormat;
    Number.prototype.toLocaleString = originalToLocaleString;
    vi.resetModules();
  });

  // Simulate a phone whose default locale is `locale`: any Intl / toLocaleString call that does not
  // name a locale explicitly picks it up. The module is re-imported under the patch so a formatter
  // created at module load time is covered too.
  async function formatOnDeviceWith(locale: string, n: number): Promise<string> {
    const Patched = new Proxy(originalNumberFormat, {
      construct: (target, args: unknown[]) =>
        new target((args[0] as string | undefined) ?? locale, args[1] as Intl.NumberFormatOptions | undefined),
      apply: (target, _this, args: unknown[]) =>
        target((args[0] as string | undefined) ?? locale, args[1] as Intl.NumberFormatOptions | undefined),
    });
    (Intl as { NumberFormat: unknown }).NumberFormat = Patched;
    Number.prototype.toLocaleString = function (this: number, l?: string | string[], o?: Intl.NumberFormatOptions) {
      return originalToLocaleString.call(this, l ?? locale, o);
    };
    vi.resetModules();
    const mod = await import('./price');
    return mod.formatPrice(n);
  }

  it.each(['de-DE', 'fr-FR', 'en-IN', 'ar-EG', 'bn-BD'])('device locale %s still gives en-US grouping and ASCII digits', async (locale) => {
    expect(await formatOnDeviceWith(locale, 1250)).toBe(`${P}1,250`);
    expect(await formatOnDeviceWith(locale, 1250000)).toBe(`${P}1,250,000`);
  });
});
