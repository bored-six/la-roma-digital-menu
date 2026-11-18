import { lazy, type ComponentType, type RefObject } from 'react';
import type { AnatomiaProps } from '../../types';

type AnatomiaModule = { default: ComponentType<AnatomiaProps & { returnFocusRef?: RefObject<HTMLElement | null> }> };

/** Anatomia (and GSAP Draggable with it) is its own chunk: it is only fetched once someone is likely to open it. */
const importAnatomia = (): Promise<AnatomiaModule> => import('../anatomia/Anatomia');

export interface Loader<M> {
  /** The module. Cached once it has loaded; a failure is forgotten so the next call imports again. */
  load(): Promise<M>;
  /** Warm the chunk. Never rejects. */
  preload(): void;
  /** Forget whatever is remembered (cached module or in-flight import). */
  reset(): void;
}

/** The seam: tests hand in a fake importer, production hands in the real dynamic import. */
export function createAnatomiaLoader<M = AnatomiaModule>(importer: () => Promise<M>): Loader<M> {
  let pending: Promise<M> | null = null;
  function load(): Promise<M> {
    if (pending === null) {
      const attempt: Promise<M> = importer().catch((err: unknown) => {
        // A failed fetch must not be remembered: the next press tries again. But only if this attempt is still THE remembered
        // one: after a reset() a newer load may already be in flight, and a late failure of the old one must not wipe it.
        if (pending === attempt) pending = null;
        throw err;
      });
      pending = attempt;
    }
    return pending;
  }
  return {
    load,
    preload: () => {
      load().catch(() => undefined);
    },
    reset: () => {
      pending = null;
    },
  };
}

const loader = createAnatomiaLoader(importAnatomia);

let Lazy = lazy(loader.load);

/** The lazy component. After `resetAnatomia()` this is a fresh one, so a rejected chunk is not stuck for the rest of the session. */
export function getAnatomia(): typeof Lazy {
  return Lazy;
}

/** Warm the chunk. Never rejects: a flaky connection here is not an error, the real load happens on the press. */
export function preloadAnatomia(): void {
  loader.preload();
}

/** Forget a failed load (React.lazy caches the rejection forever) so the next press starts clean. */
export function resetAnatomia(): void {
  loader.reset();
  Lazy = lazy(loader.load);
}
