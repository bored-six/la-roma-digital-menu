import { formatPrice } from '../../lib/price';

interface PricePillProps {
  value: number;
  /** Drinks with a Glass / Pitcher price: the column name, read by screen readers, shown in the group header. */
  label?: string;
}

const PESO = '₱';

/**
 * Reddit Mono price. The peso sign is U+20B1, which only the latin-ext subset of Reddit Mono carries
 * (Cinzel has none), so a price is never set in the display face. It stamps in on first view (CSS in app.css).
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
