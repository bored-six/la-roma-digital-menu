import { useEffect, useRef } from 'react';
import { pageLabel } from '../../lib/pager';
import type { Page } from '../../types';

interface IndicatorProps {
  pages: readonly Page[];
  activeIndex: number;
  onGo(index: number): void;
}

const two = (n: number) => String(n).padStart(2, '0');

/** Fixed bottom bar: one arch pip per page, the page name, and "08 / 14". Hidden on the cover. */
export function Indicator({ pages, activeIndex, onGo }: IndicatorProps) {
  const navRef = useRef<HTMLElement>(null);
  const hidden = activeIndex === 0;
  const count = pages.length;
  const current = pages[activeIndex];
  const label = current ? pageLabel(current) : '';

  // Hidden means unreachable too (no Tab stop, no screen-reader noise).
  useEffect(() => {
    if (navRef.current) navRef.current.inert = hidden;
  }, [hidden]);

  return (
    <nav ref={navRef} className="indicator" aria-label="Menu pages" data-hidden={hidden || undefined}>
      <ol className="indicator__pips">
        {pages.map((page, i) => {
          const active = i === activeIndex;
          return (
            <li key={page.id}>
              <button
                type="button"
                className="indicator__pip"
                aria-label={`Go to ${pageLabel(page)}, page ${i + 1} of ${count}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onGo(i)}
              >
                <span className={active ? 'lr-pip is-active' : 'lr-pip'} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
      <div className="indicator__meta">
        <span key={label} className="indicator__label">
          {label}
        </span>
        <span className="indicator__count" aria-hidden="true">
          <b>{two(activeIndex + 1)}</b> / {two(count)}
        </span>
        <span className="sr-only" role="status">
          {`${label}, page ${activeIndex + 1} of ${count}`}
        </span>
      </div>
    </nav>
  );
}
