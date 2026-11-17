import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * One shared IntersectionObserver per (threshold, rootMargin) pair: a Cold Drinks page alone has 19 rows,
 * the whole menu 111, and one observer is cheaper than 111.
 * `order` is the position inside the batch the browser delivered together, so rows that enter on the same
 * frame can be staggered while rows scrolled into view later start at 0.
 */
type Callback = (entry: IntersectionObserverEntry, order: number) => void;
interface Shared {
  io: IntersectionObserver;
  callbacks: Map<Element, Callback>;
}
const shared = new Map<string, Shared>();

function getShared(threshold: number, rootMargin: string): Shared {
  const key = `${threshold}|${rootMargin}`;
  let entry = shared.get(key);
  if (!entry) {
    const callbacks = new Map<Element, Callback>();
    const io = new IntersectionObserver(
      (batch) => {
        let order = 0;
        for (const e of batch) {
          const cb = callbacks.get(e.target);
          if (cb && e.isIntersecting) cb(e, order++);
        }
      },
      { threshold, rootMargin },
    );
    entry = { io, callbacks };
    shared.set(key, entry);
  }
  return entry;
}

export interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
}

export interface InViewResult<T extends Element> {
  ref: RefObject<T>;
  inView: boolean;
  /** Position inside the batch of elements that entered on the same frame. */
  order: number;
}

/** Flips to true the first time the element is on screen and stays there: reveals play on first view only. */
export function useInView<T extends Element = HTMLElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -6% 0px',
}: InViewOptions = {}): InViewResult<T> {
  const ref = useRef<T>(null);
  const [state, setState] = useState({ inView: false, order: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setState({ inView: true, order: 0 });
      return;
    }
    const s = getShared(threshold, rootMargin);
    s.callbacks.set(el, (_entry, order) => {
      setState({ inView: true, order });
      s.io.unobserve(el);
      s.callbacks.delete(el);
    });
    s.io.observe(el);
    return () => {
      s.io.unobserve(el);
      s.callbacks.delete(el);
    };
  }, [threshold, rootMargin]);

  return { ref, inView: state.inView, order: state.order };
}
