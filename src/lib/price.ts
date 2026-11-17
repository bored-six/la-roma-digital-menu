const PESO = '₱';

/** Groups the integer digits with commas by hand: never reads the device locale. */
function group(digits: string): string {
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ',';
    out += digits[i];
  }
  return out;
}

/**
 * '₱150', '₱1,250'. null (the two Crispy Pata rows) and non-finite numbers give ''.
 * Always en-US commas and ASCII digits, no spaces, sign before the peso sign.
 */
export function formatPrice(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return '';
  const negative = n < 0;
  const fixed = Math.abs(n).toFixed(Number.isInteger(n) ? 0 : 2);
  const [whole = '0', fraction] = fixed.split('.');
  const trimmed = fraction === undefined ? '' : fraction.replace(/0+$/, '');
  const body = group(whole) + (trimmed === '' ? '' : `.${trimmed}`);
  return `${negative ? '-' : ''}${PESO}${body}`;
}
