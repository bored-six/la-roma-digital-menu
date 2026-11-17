import { lazy, type ComponentType, type RefObject } from 'react';
import type { AnatomiaProps } from '../../types';

type AnatomiaModule = { default: ComponentType<AnatomiaProps & { returnFocusRef?: RefObject<HTMLElement | null> }> };

/** Anatomia (and GSAP Draggable with it) is its own chunk: it is only fetched once someone is likely to open it. */
const importAnatomia = (): Promise<AnatomiaModule> => import('../anatomia/Anatomia');

let pending: Promise<AnatomiaModule> | null = null;
function load(): Promise<AnatomiaModule> {
  pending ??= importAnatomia().catch((err: unknown) => {
    pending = null; // a failed fetch must not be remembered: the next press tries again
    throw err;
  });
  return pending;
}

let Lazy = lazy(load);

/** The lazy component. After `resetAnatomia()` this is a fresh one, so a rejected chunk is not stuck for the rest of the session. */
export function getAnatomia(): typeof Lazy {
  return Lazy;
}

/** Warm the chunk. Never rejects: a flaky connection here is not an error, the real load happens on the press. */
export function preloadAnatomia(): void {
  load().catch(() => undefined);
}

/** Forget a failed load (React.lazy caches the rejection forever) so the next press starts clean. */
export function resetAnatomia(): void {
  pending = null;
  Lazy = lazy(load);
}
