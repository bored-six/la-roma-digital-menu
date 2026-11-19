import { useMemo, type ReactNode } from 'react';
import { useNeighboursReady } from '../../hooks/useNeighboursReady';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { PagerContext, usePager, type PagerApi } from '../../hooks/usePager';
import { isNearPage, pageLabel } from '../../lib/pager';
import type { Page } from '../../types';
import { Arrow } from '../ornaments/Svg';
import { Indicator } from './Indicator';

export interface PageState {
  index: number;
  /** The settled current page (not a page the track is merely flying past). */
  active: boolean;
  /** Settled page, plus either neighbour once the first screen has loaded and gone idle: the only ones allowed to fetch photos. */
  near: boolean;
}

interface PagerProps {
  pages: readonly Page[];
  renderPage(page: Page, state: PageState): ReactNode;
}

interface PageSlotProps {
  page: Page;
  index: number;
  count: number;
  children: ReactNode;
}

/** One snap stop. It is its own vertical scroller, so a long page (Unli Rice) never fights the horizontal swipe. */
function PageSlot({ page, index, count, children }: PageSlotProps) {
  return (
    <section
      id={`page-${page.id}`}
      className="pager__page"
      data-index={index}
      data-page={page.id}
      aria-roledescription="page"
      aria-label={`${pageLabel(page)}, page ${index + 1} of ${count}`}
    >
      {children}
    </section>
  );
}

export function Pager({ pages, renderPage }: PagerProps) {
  const reduced = useReducedMotion();
  const neighboursReady = useNeighboursReady();
  const { trackRef, veilRef, activeIndex, liveIndex, count, goTo, goToId, getPage, setLocked } = usePager(pages, reduced);

  const api = useMemo<PagerApi>(
    () => ({ activeIndex, liveIndex, count, goTo, goToId, getPage, veilRef, setLocked }),
    [activeIndex, liveIndex, count, goTo, goToId, getPage, veilRef, setLocked],
  );

  return (
    <PagerContext.Provider value={api}>
      <div className="shell">
        {/* Desktop only: the printed frame continues around the phone column. */}
        <div className="shell__frame lr-frame" aria-hidden="true" />
        <div className="pager">
          <main ref={trackRef} className="pager__track" aria-label="La Roma menu">
            {pages.map((page, index) => (
              <PageSlot key={page.id} page={page} index={index} count={count}>
                {renderPage(page, {
                  index,
                  active: index === activeIndex,
                  near: isNearPage(index, activeIndex, neighboursReady),
                })}
              </PageSlot>
            ))}
          </main>
          {/* The printed frame stays put and the pages slide inside it (it also fades rows out under its top edge). */}
          <div className="pager__frame lr-frame" aria-hidden="true" />
          <div ref={veilRef} className="pager__veil" aria-hidden="true" />
          <Indicator pages={pages} activeIndex={liveIndex} onGo={(i) => goTo(i, { focus: true })} />
        </div>
        <button
          type="button"
          className="shell__arrow shell__arrow--prev"
          aria-label="Previous page"
          aria-disabled={liveIndex === 0}
          onClick={() => goTo(liveIndex - 1, { focus: true })}
        >
          <Arrow dir="left" />
        </button>
        <button
          type="button"
          className="shell__arrow shell__arrow--next"
          aria-label="Next page"
          aria-disabled={liveIndex === count - 1}
          onClick={() => goTo(liveIndex + 1, { focus: true })}
        >
          <Arrow dir="right" />
        </button>
      </div>
    </PagerContext.Provider>
  );
}
