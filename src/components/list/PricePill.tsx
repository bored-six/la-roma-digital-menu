import { formatPrice } from '../../lib/price';

interface PricePillProps {
  value: number;
  /** Drinks with a Glass / Pitcher price: the column name, read by screen readers, shown in the group header. */
  label?: string;
}

const PESO = '₱';

/**
 * Bodoni Moda price. The peso sign is U+20B1, which Bodoni Moda does not carry: the font stack falls through to
 * "La Roma Peso" (one EB Garamond glyph, see app.css). It stamps in on first view (CSS in app.css).
 * Rows with no price do not render this component at all.
 */
export function PricePill({ value, label }: PricePillProps) {
  const text = formatPrice(value);
  const hasCurrency = text.startsWith(PESO);
  return (
    <span className="pill">
      {label ? <span className="sr-only">{label} </span> : null}
      {hasCurrency ? <span className="pill__cur">{PESO}</span> : null}
      <span className="pill__num">{hasCurrency ? text.slice(PESO.length) : text}</span>
    </span>
  );
}
