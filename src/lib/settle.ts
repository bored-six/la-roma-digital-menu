/** What whenSettled needs from the browser. Each subscribe returns its own release function. */
export interface SettleEnv {
  isLoaded(): boolean;
  onLoad(cb: () => void): () => void;
  onFirstInput(cb: () => void): () => void;
  onIdle(cb: () => void): () => void;
  after(ms: number, cb: () => void): () => void;
}

/** A hung resource must not hold the next pages' photos back for ever. */
export const SETTLE_CAP_MS = 5000;

/**
 * Calls `done` once, when the first screen is finished and the browser is free: the page has loaded and then goes idle,
 * or the user touches something (they are about to move), or `capMs` passes. Never synchronously. Returns cancel().
 */
export function whenSettled(done: () => void, env: SettleEnv, capMs: number = SETTLE_CAP_MS): () => void {
  let finished = false;
  const releases: Array<() => void> = [];

  const release = () => {
    for (const r of releases.splice(0)) r();
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    release();
    done();
  };
  const armIdle = () => {
    if (!finished) releases.push(env.onIdle(finish));
  };

  releases.push(env.onFirstInput(finish));
  releases.push(env.after(capMs, finish));
  if (env.isLoaded()) armIdle();
  else releases.push(env.onLoad(armIdle));

  return () => {
    finished = true;
    release();
  };
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/** The real thing: `load` event, a listener for the first pointer, key, wheel or touch, requestIdleCallback with a timer fallback. */
export function browserSettleEnv(win: IdleWindow = window as IdleWindow, doc: Document = document): SettleEnv {
  const listen = (target: EventTarget, types: string[], cb: () => void) => {
    const opts = { passive: true, capture: true } as const;
    for (const t of types) target.addEventListener(t, cb, opts);
    return () => {
      for (const t of types) target.removeEventListener(t, cb, opts);
    };
  };
  return {
    isLoaded: () => doc.readyState === 'complete',
    onLoad: (cb) => listen(win, ['load'], cb),
    onFirstInput: (cb) => listen(win, ['pointerdown', 'keydown', 'wheel', 'touchstart'], cb),
    onIdle: (cb) => {
      if (typeof win.requestIdleCallback === 'function') {
        const id = win.requestIdleCallback(cb, { timeout: 1500 });
        return () => win.cancelIdleCallback?.(id);
      }
      const id = win.setTimeout(cb, 600);
      return () => win.clearTimeout(id);
    },
    after: (ms, cb) => {
      const id = win.setTimeout(cb, ms);
      return () => win.clearTimeout(id);
    },
  };
}
