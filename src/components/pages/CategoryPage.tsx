import { memo, useCallback, useMemo, useRef, useState } from 'react';
import photosJson from '../../data/photos.json';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { defaultSelectedId } from '../../lib/tiles';
import type { Page, PhotoEntry } from '../../types';
import { ItemList } from '../list/ItemList';
import { Stage } from '../stage/Stage';
import { Flourish } from '../ornaments/Svg';
import { NoteLine } from './NoteLine';
import { SectionTitle } from './SectionTitle';

const PHOTOS = photosJson as Record<string, PhotoEntry>;

interface CategoryPageProps {
  page: Extract<Page, { kind: 'category' }>;
  /** This page is the one on screen. */
  active: boolean;
}

/**
 * One menu page: the stage on top (one dish selected), then every category of the page as a PDF-style list.
 * `selectedId` lives here: the list rows and (later) the stage tiles both write it.
 */
export const CategoryPage = memo(function CategoryPage({ page, active }: CategoryPageProps) {
  const reduced = useReducedMotion();
  const items = useMemo(() => page.categories.flatMap((c) => c.items), [page]);
  const [selectedId, setSelectedId] = useState(() => defaultSelectedId(items, PHOTOS) ?? items[0]?.id ?? '');
  const stageRef = useRef<HTMLDivElement>(null);

  const onSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      // The page is its own scroller; bring the stage back into view so the swap is seen.
      const scroller = stageRef.current?.closest<HTMLElement>('.pager__page');
      scroller?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    },
    [reduced],
  );

  return (
    <div className="page__inner lr-frame">
      <h2 className="sr-only" tabIndex={-1} data-page-heading>
        {page.label}
      </h2>
      <div ref={stageRef} className="page__stage">
        <Stage items={items} selectedId={selectedId} onSelect={onSelect} active={active} />
      </div>
      {page.categories.map((category) => {
        const titleId = `${page.id}-${category.id}-title`;
        return (
          <section key={category.id} className="category" aria-labelledby={titleId}>
            <SectionTitle category={category} id={titleId} />
            {category.notes.map((note) => (
              <NoteLine key={note.text} note={note} />
            ))}
            <ItemList items={category.items} selectedId={selectedId} onSelect={onSelect} />
          </section>
        );
      })}
      <Flourish className="flourish page__foot" />
    </div>
  );
});
