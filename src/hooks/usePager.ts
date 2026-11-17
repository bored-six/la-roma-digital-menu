import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { clampIndex, indexFromScroll, pageIndexFromHash } from '../lib/pager';
import type { Page, PageId } from '../types';

export interface GoToOptions {
  /** Default: smooth, or instant under reduced motion. */
  behavior?: 'smooth' | 'instant';
  /** Move focus to the new page heading once it is the active page (indicator / keys / jump notes, never swipe). */
  focus?: boolean;
  /** For the portal only: move even while the track is locked. */
  force?: boolean;
}

/** What a page component can ask of the pager. Provided by <Pager>. */
export interface PagerApi {
  /** The page the track has come to rest on. Drives the hash, focus, inert and which stages may load photos. */
  activeIndex: number;
  /** The page under the viewport right now, also mid-scroll. Drives the indicator only. */
  liveIndex: number;
  count: number;
  goTo(index: number, options?: GoToOptions): void;
  goToId(id: PageId, options?: GoToOptions): void;
  getPage(index: number): HTMLElement | null;
  /** Full-bleed veil the cover portal uses to hand over to page 1. */
  veilRef: RefObject<HTMLDivElement>;
  /** While true the track ignores touch and keys (the portal is playing). */
  setLocked(locked: boolean): void;
}

export const PagerContext = createContext<PagerApi | null>(null);

export function usePagerContext(): PagerApi {
  const api = useContext(PagerContext);
  if (!api) throw new Error('usePagerContext must be used inside <Pager>');
  return api;
}

const ACTIVE_THRESHOLD = 0.6;
/** No scroll event for this long = the track has settled (only used where `scrollend` does not exist). */
const SETTLE_MS = 120;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

/**
 * Pager state for a CSS scroll-snap track. The track scrolls natively (compositor thread, native momentum);
 * this hook only observes it: IntersectionObserver (threshold .6) names the LIVE page (indicator, follows the
 * scroll), `scrollend` (or a 120 ms quiet period where it is missing) names the SETTLED page. Only the settled page
 * is "active": a pip tap across ten pages must not wake the ten stages it flies past. One rAF-throttled passive
 * scroll listener writes --p (-1..1) on the pages near the viewport, the hash mirrors the settled page.
 */
export function usePager(pages: readonly Page[], reduced: boolean) {
  const count = pages.length;
  const trackRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const [initialIndex] = useState(() => pageIndexFromHash(window.location.hash, pages));
  const [liveIndex, setLiveIndex] = useState(initialIndex);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeRef = useRef(initialIndex); // follows the live page: where a key press or a goTo starts from
  const pendingFocus = useRef<number | null>(null);
  const reducedRef = useRef(reduced);
  const lockedRef = useRef(false);
  reducedRef.current = reduced;

  const getPage = useCallback((index: number): HTMLElement | null => {
    const el = trackRef.current?.children.item(index);
    return el instanceof HTMLElement ? el : null;
  }, []);

  const focusHeading = useCallback(
    (index: number) => {
      const heading = getPage(index)?.querySelector<HTMLElement>('[data-page-heading]');
      heading?.focus({ preventScroll: true });
    },
    [getPage],
  );

  const goTo = useCallback(
    (index: number, options: GoToOptions = {}) => {
      const track = trackRef.current;
      if (!track || (lockedRef.current && !options.force)) return;
      const i = clampIndex(index, count);
      const left = i * track.clientWidth;
      if (options.focus) pendingFocus.current = i;
      if (i === activeRef.current && Math.abs(track.scrollLeft - left) < 2) {
        if (options.focus) {
          pendingFocus.current = null;
          focusHeading(i);
        }
        return;
      }
      const behavior = options.behavior ?? (reducedRef.current ? 'instant' : 'smooth');
      track.scrollTo({ left, behavior });
    },
    [count, focusHeading],
  );

  const goToId = useCallback(
    (id: PageId, options?: GoToOptions) => {
      const i = pages.findIndex((p) => p.id === id);
      if (i !== -1) goTo(i, options);
    },
    [pages, goTo],
  );

  const setLocked = useCallback((locked: boolean) => {
    lockedRef.current = locked;
    trackRef.current?.toggleAttribute('data-locked', locked);
  }, []);

  // Deep link: put the track on the hash page before the first paint, so the cover never flashes.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = activeRef.current * track.clientWidth;
  }, []);

  // Active page = the one at least 60% visible.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        let next = -1;
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= ACTIVE_THRESHOLD && e.target instanceof HTMLElement) {
            next = Number(e.target.dataset.index);
          }
        }
        if (next >= 0) setLiveIndex(next);
      },
      { root: track, threshold: [ACTIVE_THRESHOLD] },
    );
    Array.from(track.children).forEach((child) => io.observe(child));
    return () => io.disconnect();
  }, [count]);

  useEffect(() => {
    activeRef.current = liveIndex;
  }, [liveIndex]);

  // Settled page: scrollend where the browser has it, otherwise 120 ms without a scroll event.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const settle = () => {
      const i = indexFromScroll(track.scrollLeft, track.clientWidth, count);
      setLiveIndex(i);
      setActiveIndex(i);
    };
    if ('onscrollend' in window) {
      track.addEventListener('scrollend', settle);
      return () => track.removeEventListener('scrollend', settle);
    }
    let timer = 0;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE_MS);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      track.removeEventListener('scroll', onScroll);
    };
  }, [count]);

  // Hash mirrors the settled page (replaceState: no history spam), focus follows indicator/key navigation,
  // and only the settled page is reachable by Tab / screen readers (the others are inert).
  useEffect(() => {
    const page = pages[activeIndex];
    if (page) {
      const url = page.kind === 'cover' ? window.location.pathname + window.location.search : `#${page.id}`;
      try {
        window.history.replaceState(null, '', url);
      } catch {
        /* Safari throws if replaceState is called too often; the hash is a nicety, not state. */
      }
    }
    const track = trackRef.current;
    if (track) {
      Array.from(track.children).forEach((child, i) => {
        (child as HTMLElement).inert = i !== activeIndex;
      });
    }
    if (pendingFocus.current === activeIndex) {
      pendingFocus.current = null;
      focusHeading(activeIndex);
    }
  }, [activeIndex, pages, focusHeading]);

  // Parallax: --p = (page index - scroll position in pages), clamped -1..1, on the pages near the viewport.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const width = track.clientWidth;
      if (!width) return;
      const pos = track.scrollLeft / width;
      const lo = Math.max(0, Math.floor(pos) - 1);
      const hi = Math.min(count - 1, Math.ceil(pos) + 1);
      for (let i = lo; i <= hi; i++) {
        const el = track.children.item(i);
        if (el instanceof HTMLElement) el.style.setProperty('--p', Math.max(-1, Math.min(1, i - pos)).toFixed(3));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      Array.from(track.children).forEach((child) => (child as HTMLElement).style.removeProperty('--p'));
    };
  }, [count, reduced]);

  // Keep the active page under the viewport when the column width changes (rotate, desktop resize).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let lastWidth = track.clientWidth;
    const ro = new ResizeObserver(() => {
      const width = track.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      track.scrollTo({ left: activeRef.current * width, behavior: 'instant' });
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  // Arrows, Home, End. No wrap: goTo clamps.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (isTypingTarget(e.target) || document.querySelector('dialog[open], [aria-modal="true"]')) return;
      let target: number;
      switch (e.key) {
        case 'ArrowRight':
          target = activeRef.current + 1;
          break;
        case 'ArrowLeft':
          target = activeRef.current - 1;
          break;
        case 'Home':
          target = 0;
          break;
        case 'End':
          target = count - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      goTo(target, { focus: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, goTo]);

  // A hash edited by hand (or an in-page #link) moves the track.
  useEffect(() => {
    const onHash = () => {
      const i = pageIndexFromHash(window.location.hash, pages);
      if (i !== activeRef.current) goTo(i, { behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [pages, goTo]);

  return { trackRef, veilRef, activeIndex, liveIndex, count, goTo, goToId, getPage, setLocked };
}
