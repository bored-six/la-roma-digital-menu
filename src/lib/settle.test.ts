// Contract for whenSettled(done, env, capMs): "the first screen is done, the browser is free, neighbour photos may start".
//   done() runs exactly once, at the FIRST of:
//     - the page has loaded AND the browser then reports idle (loaded-but-busy does not count),
//     - the user's first input (they are about to move: do not make them wait),
//     - capMs after the call (a hung resource must never hold the photos back forever).
//   It never runs synchronously, even when the page is already loaded.
//   The returned cancel() stops everything: done never runs, every listener and timer it armed is released.
import { describe, expect, it, vi } from 'vitest';
import { isNearPage } from './pager';
import { whenSettled, type SettleEnv } from './settle';

interface Fake extends SettleEnv {
  loaded: boolean;
  fireLoad(): void;
  fireInput(): void;
  fireIdle(): void;
  fireCap(): void;
  armed: string[];
  released: string[];
}

function fakeEnv(loaded = false): Fake {
  let loadCb: (() => void) | null = null;
  let inputCb: (() => void) | null = null;
  let idleCb: (() => void) | null = null;
  let capCb: (() => void) | null = null;
  const armed: string[] = [];
  const released: string[] = [];
  const env: Fake = {
    loaded,
    armed,
    released,
    isLoaded: () => env.loaded,
    onLoad: (cb) => {
      armed.push('load');
      loadCb = cb;
      return () => {
        loadCb = null;
        released.push('load');
      };
    },
    onFirstInput: (cb) => {
      armed.push('input');
      inputCb = cb;
      return () => {
        inputCb = null;
        released.push('input');
      };
    },
    onIdle: (cb) => {
      armed.push('idle');
      idleCb = cb;
      return () => {
        idleCb = null;
        released.push('idle');
      };
    },
    after: (_ms, cb) => {
      armed.push('cap');
      capCb = cb;
      return () => {
        capCb = null;
        released.push('cap');
      };
    },
    fireLoad: () => {
      env.loaded = true;
      loadCb?.();
    },
    fireInput: () => inputCb?.(),
    fireIdle: () => idleCb?.(),
    fireCap: () => capCb?.(),
  };
  return env;
}

describe('whenSettled', () => {
  it('does not run before the page has loaded', () => {
    const done = vi.fn();
    const env = fakeEnv(false);
    whenSettled(done, env);
    expect(done).not.toHaveBeenCalled();
    env.fireIdle(); // idle before load means nothing
    expect(done).not.toHaveBeenCalled();
  });

  it('runs once the page has loaded and the browser then goes idle', () => {
    const done = vi.fn();
    const env = fakeEnv(false);
    whenSettled(done, env);
    env.fireLoad();
    expect(done).not.toHaveBeenCalled(); // loaded but still busy
    env.fireIdle();
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('an already loaded page still waits for idle, and never runs synchronously', () => {
    const done = vi.fn();
    const env = fakeEnv(true);
    whenSettled(done, env);
    expect(done).not.toHaveBeenCalled();
    env.fireIdle();
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('runs at the first user input, before load', () => {
    const done = vi.fn();
    const env = fakeEnv(false);
    whenSettled(done, env);
    env.fireInput();
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('runs when the cap elapses even if the page never loads', () => {
    const done = vi.fn();
    const env = fakeEnv(false);
    whenSettled(done, env);
    env.fireCap();
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('passes capMs to the timer', () => {
    const env = fakeEnv(false);
    const after = vi.spyOn(env, 'after');
    whenSettled(() => {}, env, 1234);
    expect(after).toHaveBeenCalledWith(1234, expect.any(Function));
  });

  it('runs exactly once whichever signals arrive afterwards', () => {
    const done = vi.fn();
    const env = fakeEnv(false);
    whenSettled(done, env);
    env.fireInput();
    env.fireLoad();
    env.fireIdle();
    env.fireCap();
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('releases every listener and timer once it has run', () => {
    const env = fakeEnv(false);
    whenSettled(() => {}, env);
    env.fireInput();
    expect(env.armed.length).toBeGreaterThan(0);
    expect([...env.released].sort()).toEqual([...env.armed].sort()); // everything it armed was released
  });

  it('cancel() before any signal means done never runs and everything is released', () => {
    const done = vi.fn();
    const env = fakeEnv(false);
    const cancel = whenSettled(done, env);
    cancel();
    env.fireInput();
    env.fireLoad();
    env.fireIdle();
    env.fireCap();
    expect(done).not.toHaveBeenCalled();
    expect(env.armed.length).toBeGreaterThan(0);
    expect([...env.released].sort()).toEqual([...env.armed].sort()); // everything it armed was released
  });

  it('cancel() after it has run is harmless', () => {
    const done = vi.fn();
    const env = fakeEnv(false);
    const cancel = whenSettled(done, env);
    env.fireInput();
    expect(() => cancel()).not.toThrow();
    expect(done).toHaveBeenCalledTimes(1);
  });
});

// Contract: which pages may fetch photos. Settled: the current page and both neighbours. Not yet settled: the current page only,
// so the cover's first load is not shared with photos of a page nobody has opened.
describe('isNearPage', () => {
  it('settled: current page and both neighbours, not two away', () => {
    expect(isNearPage(4, 5, true)).toBe(true);
    expect(isNearPage(5, 5, true)).toBe(true);
    expect(isNearPage(6, 5, true)).toBe(true);
    expect(isNearPage(3, 5, true)).toBe(false);
    expect(isNearPage(7, 5, true)).toBe(false);
  });

  it('not settled: only the current page', () => {
    expect(isNearPage(5, 5, false)).toBe(true);
    expect(isNearPage(4, 5, false)).toBe(false);
    expect(isNearPage(6, 5, false)).toBe(false);
  });

  it('on the cover before settle, page 1 holds its photos', () => {
    expect(isNearPage(1, 0, false)).toBe(false);
    expect(isNearPage(1, 0, true)).toBe(true);
  });

  it('opening on a deep-linked page is never held back, settled or not', () => {
    expect(isNearPage(7, 7, false)).toBe(true);
  });
});
