// Contract for the Anatomia chunk loader (the seam is createAnatomiaLoader(importer)):
//   load()    -> the module. A rejected import rejects the caller of load().
//   preload() -> fire and forget, never rejects (a flaky connection while warming is not an error).
//   a failed load is forgotten (pending cleared), so a later load() imports again and can succeed.
//   a successful load is cached: later load() calls do not import again, and calls made while it is in flight share one import.
//   reset()   -> forget the current load. A failure of an OLDER import must never clear a NEWER load that replaced it.
import { describe, expect, it, vi } from 'vitest';
import { createAnatomiaLoader } from './anatomiaLoader';

const MOD = { default: () => null };

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Let every pending microtask and the unhandledRejection check run. */
const flush = () => new Promise<void>((r) => setTimeout(r, 0));

describe('load()', () => {
  it('surfaces a rejected import as a rejection to the caller', async () => {
    const boom = new Error('chunk 404');
    const loader = createAnatomiaLoader(() => Promise.reject(boom));
    await expect(loader.load()).rejects.toBe(boom);
  });

  it('resolves with the module the importer returns', async () => {
    const loader = createAnatomiaLoader(() => Promise.resolve(MOD));
    await expect(loader.load()).resolves.toBe(MOD);
  });

  it('caches a successful load: a second call does not import again', async () => {
    const importer = vi.fn(() => Promise.resolve(MOD));
    const loader = createAnatomiaLoader(importer);
    const a = await loader.load();
    const b = await loader.load();
    expect(a).toBe(b);
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it('shares one import between calls made while it is in flight', async () => {
    const d = deferred<typeof MOD>();
    const importer = vi.fn(() => d.promise);
    const loader = createAnatomiaLoader(importer);
    const p1 = loader.load();
    const p2 = loader.load();
    d.resolve(MOD);
    await expect(Promise.all([p1, p2])).resolves.toEqual([MOD, MOD]);
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it('allows a retry after a failure, and the retry can succeed', async () => {
    const importer = vi
      .fn<() => Promise<typeof MOD>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(MOD);
    const loader = createAnatomiaLoader(importer);
    await expect(loader.load()).rejects.toThrow('offline');
    await expect(loader.load()).resolves.toBe(MOD);
    expect(importer).toHaveBeenCalledTimes(2);
    // and the success is now cached
    await loader.load();
    expect(importer).toHaveBeenCalledTimes(2);
  });

  it('keeps failing honestly while the importer keeps failing (each press tries again)', async () => {
    const importer = vi.fn(() => Promise.reject(new Error('still offline')));
    const loader = createAnatomiaLoader(importer);
    await expect(loader.load()).rejects.toThrow('still offline');
    await expect(loader.load()).rejects.toThrow('still offline');
    expect(importer).toHaveBeenCalledTimes(2);
  });
});

describe('preload()', () => {
  it('never rejects: a failed import is swallowed (no unhandled rejection)', async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    try {
      const loader = createAnatomiaLoader(() => Promise.reject(new Error('flaky')));
      expect(loader.preload()).toBeUndefined();
      await flush();
      await flush();
      expect(unhandled).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });

  it('a failed preload does not poison the real load: it retries and can succeed', async () => {
    const importer = vi
      .fn<() => Promise<typeof MOD>>()
      .mockRejectedValueOnce(new Error('flaky'))
      .mockResolvedValueOnce(MOD);
    const loader = createAnatomiaLoader(importer);
    loader.preload();
    await flush();
    await expect(loader.load()).resolves.toBe(MOD);
    expect(importer).toHaveBeenCalledTimes(2);
  });

  it('a successful preload is what load() then returns (one import)', async () => {
    const importer = vi.fn(() => Promise.resolve(MOD));
    const loader = createAnatomiaLoader(importer);
    loader.preload();
    await expect(loader.load()).resolves.toBe(MOD);
    expect(importer).toHaveBeenCalledTimes(1);
  });
});

describe('reset() and the retry race', () => {
  it('reset() forgets a cached load so the next load imports again', async () => {
    const importer = vi.fn(() => Promise.resolve(MOD));
    const loader = createAnatomiaLoader(importer);
    await loader.load();
    loader.reset();
    await loader.load();
    expect(importer).toHaveBeenCalledTimes(2);
  });

  it('an old load failing late does not clobber a newer load (no duplicate import)', async () => {
    const first = deferred<typeof MOD>();
    const second = deferred<typeof MOD>();
    const importer = vi
      .fn<() => Promise<typeof MOD>>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockRejectedValue(new Error('a third import must not happen'));
    const loader = createAnatomiaLoader(importer);

    const load1 = loader.load(); // import 1 starts (slow)
    const load1Outcome = load1.catch((e: unknown) => e);
    loader.reset(); // e.g. the boundary reset after an error elsewhere
    const load2 = loader.load(); // import 2 starts, replaces import 1
    expect(importer).toHaveBeenCalledTimes(2);

    first.reject(new Error('late failure of import 1')); // import 1 fails AFTER import 2 started
    expect(await load1Outcome).toEqual(new Error('late failure of import 1'));

    // import 2 must still be the remembered load: asking again shares it and does not import a third time
    const load3 = loader.load();
    expect(importer).toHaveBeenCalledTimes(2);
    second.resolve(MOD);
    await expect(Promise.all([load2, load3])).resolves.toEqual([MOD, MOD]);
    expect(importer).toHaveBeenCalledTimes(2);
  });

  it('a failure of the current load still clears it (identity check must not block the normal retry)', async () => {
    const importer = vi
      .fn<() => Promise<typeof MOD>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(MOD);
    const loader = createAnatomiaLoader(importer);
    loader.reset();
    await expect(loader.load()).rejects.toThrow('offline');
    await expect(loader.load()).resolves.toBe(MOD);
    expect(importer).toHaveBeenCalledTimes(2);
  });
});
