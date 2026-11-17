import { useMemo } from 'react';
import type { Item } from '../../types';
import { ItemRow } from './ItemRow';

interface ItemListProps {
  items: readonly Item[];
  selectedId: string;
  onSelect(id: string): void;
}

interface Group {
  subgroup: string | undefined;
  items: Item[];
  /** Column names when the group is priced per Glass / Pitcher. */
  columns: string[];
}

/** Consecutive items sharing a `subgroup` (drinks) become one group with a small-caps header. */
function group(items: readonly Item[]): Group[] {
  const groups: Group[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.subgroup === item.subgroup) {
      last.items.push(item);
    } else {
      groups.push({ subgroup: item.subgroup, items: [item], columns: [] });
    }
  }
  for (const g of groups) {
    const withVariants = g.items.find((i) => i.variants && i.variants.length > 0);
    g.columns = withVariants?.variants?.map((v) => v.label) ?? [];
  }
  return groups;
}

export function ItemList({ items, selectedId, onSelect }: ItemListProps) {
  const groups = useMemo(() => group(items), [items]);

  return (
    <>
      {groups.map((g, gi) => (
        <div key={`${g.subgroup ?? 'all'}-${gi}`} className="group">
          {g.subgroup ? (
            <div className="group__head">
              <h4 className="group__title">{g.subgroup}</h4>
              <span className="group__rule" aria-hidden="true" />
              {g.columns.length > 0 ? (
                <span className="group__cols" aria-hidden="true">
                  {g.columns.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </span>
              ) : null}
            </div>
          ) : null}
          <ul className="rows">
            {g.items.map((item) => (
              <ItemRow key={item.id} item={item} selected={item.id === selectedId} onSelect={onSelect} />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
