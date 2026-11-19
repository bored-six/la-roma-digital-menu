import { memo, type CSSProperties } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Item } from '../../types';
import { PricePill } from './PricePill';

interface ItemRowProps {
  item: Item;
  selected: boolean;
  onSelect(id: string): void;
  /** Badge text to leave off (compared ignoring case): it only repeats the section title. */
  hideBadge?: string;
}

/**
 * PDF row: name, dotted leader that draws on first view, price pill that stamps, then badges + italic description
 * on the line below (a badge beside the name squeezes long names: 17 "Unli rice" pills on one page).
 * The whole row is one <button aria-pressed>: tap selects the dish on the stage.
 * A null price (the two Crispy Pata rows) renders no leader and no price element at all.
 */
export const ItemRow = memo(function ItemRow({ item, selected, onSelect, hideBadge }: ItemRowProps) {
  const reduced = useReducedMotion();
  const { ref, inView, order } = useInView<HTMLLIElement>();
  const variants = item.variants ?? [];
  const priced = item.price !== null || variants.length > 0;
  const badges = hideBadge === undefined ? item.badges : item.badges.filter((b) => b.toLowerCase() !== hideBadge.toLowerCase());

  return (
    <li
      ref={ref}
      className="row"
      data-motion={reduced ? 'off' : 'on'}
      data-in={reduced || inView ? '' : undefined}
      style={{ '--d': `${order * 60}ms` } as CSSProperties}
    >
      <button type="button" className="row__btn" aria-pressed={selected} onClick={() => onSelect(item.id)}>
        <span className="row__line">
          <span className="row__name">{item.name}</span>
          {priced ? <span className="lr-leader" aria-hidden="true" /> : null}
          {variants.length > 0 ? (
            <span className="row__prices">
              {variants.map((v) => (
                <PricePill key={v.label} value={v.price} label={v.label} />
              ))}
            </span>
          ) : item.price !== null ? (
            <PricePill value={item.price} />
          ) : null}
        </span>
        {badges.length > 0 || item.description ? (
          <span className="row__desc">
            {badges.map((badge) => (
              <span key={badge} className="badge">
                {badge}
              </span>
            ))}
            {item.description}
          </span>
        ) : null}
      </button>
    </li>
  );
});
