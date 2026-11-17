// Contract: spec section 5 motion tokens and reduced-motion rules.
//   --dur-xs .15s  --dur-s .3s  --dur-m .55s  --dur-l .9s
//   --ease-out expo.out   --ease-io power3.inOut   --ease-stamp back.out(2.2)
//   reduced: transforms 0s, opacity fades only, max .2s, no parallax, no tilt, no SplitText
// Shape decided in tests/CONTRACT.md:
//   motion(reduced) -> { reduced, dur: {xs,s,m,l}, fade: {xs,s,m,l}, ease: {out,io,stamp}, parallax, tilt, splitText }
//   all durations in SECONDS (GSAP unit). `dur` is for transform/layout tweens, `fade` for opacity-only tweens.
import { describe, expect, it } from 'vitest';
import { motion } from './motion';

const KEYS = ['xs', 's', 'm', 'l'] as const;
const TOKENS = { xs: 0.15, s: 0.3, m: 0.55, l: 0.9 };

describe('motion(false) matches the spec tokens', () => {
  const m = motion(false);

  it('is not flagged reduced', () => {
    expect(m.reduced).toBe(false);
  });

  it('transform durations are .15 / .3 / .55 / .9 seconds', () => {
    expect(m.dur).toEqual(TOKENS);
  });

  it('fade durations equal the transform durations when motion is allowed', () => {
    expect(m.fade).toEqual(TOKENS);
  });

  it('uses the spec GSAP ease strings', () => {
    expect(m.ease).toEqual({ out: 'expo.out', io: 'power3.inOut', stamp: 'back.out(2.2)' });
  });

  it('parallax, tilt and SplitText are on', () => {
    expect(m.parallax).toBe(true);
    expect(m.tilt).toBe(true);
    expect(m.splitText).toBe(true);
  });
});

describe('motion(true) is the reduced-motion set', () => {
  const m = motion(true);

  it('is flagged reduced', () => {
    expect(m.reduced).toBe(true);
  });

  it('every transform duration is exactly 0', () => {
    for (const k of KEYS) expect(m.dur[k], `dur.${k}`).toBe(0);
  });

  it('every fade is a finite number of at most .2s', () => {
    for (const k of KEYS) {
      expect(Number.isFinite(m.fade[k]), `fade.${k} finite`).toBe(true);
      expect(m.fade[k], `fade.${k}`).toBeLessThanOrEqual(0.2);
      expect(m.fade[k], `fade.${k}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('a fade is never slower than the matching full-motion duration', () => {
    const full = motion(false);
    for (const k of KEYS) expect(m.fade[k], `fade.${k}`).toBeLessThanOrEqual(full.dur[k]);
  });

  it('parallax, tilt and SplitText are off', () => {
    expect(m.parallax).toBe(false);
    expect(m.tilt).toBe(false);
    expect(m.splitText).toBe(false);
  });

  it('still exposes every ease as a string, so callers never read undefined', () => {
    expect(typeof m.ease.out).toBe('string');
    expect(typeof m.ease.io).toBe('string');
    expect(typeof m.ease.stamp).toBe('string');
  });
});

describe('motion() hygiene', () => {
  it('has the same keys in both modes', () => {
    const a = motion(false);
    const b = motion(true);
    expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
    expect(Object.keys(b.dur).sort()).toEqual(Object.keys(a.dur).sort());
    expect(Object.keys(b.fade).sort()).toEqual(Object.keys(a.fade).sort());
    expect(Object.keys(b.ease).sort()).toEqual(Object.keys(a.ease).sort());
  });

  it('a caller mutating a result does not poison later calls (no shared mutable state)', () => {
    for (const reduced of [false, true]) {
      const first = motion(reduced);
      const snapshot = JSON.stringify(motion(reduced));
      try {
        (first.dur as Record<string, number>).m = 99;
        (first.fade as Record<string, number>).s = 99;
        (first.ease as Record<string, string>).out = 'none';
        (first as { tilt: boolean }).tilt = !first.tilt;
      } catch {
        // a frozen result throws in strict mode; that is also fine
      }
      expect(JSON.stringify(motion(reduced)), `reduced=${reduced}`).toBe(snapshot);
    }
  });

  it('flipping the preference flips the result both ways (no stale cache)', () => {
    expect(motion(true).dur.l).toBe(0);
    expect(motion(false).dur.l).toBe(0.9);
    expect(motion(true).dur.l).toBe(0);
  });
});
