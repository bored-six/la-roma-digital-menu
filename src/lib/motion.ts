/** Motion tokens from spec section 5, in SECONDS (GSAP unit). `dur` is for transform/layout tweens, `fade` for opacity-only tweens. */
export type Steps = { xs: number; s: number; m: number; l: number };
export interface Motion {
  reduced: boolean;
  dur: Steps;
  fade: Steps;
  ease: { out: string; io: string; stamp: string };
  parallax: boolean;
  tilt: boolean;
  splitText: boolean;
}

const TOKENS: Readonly<Steps> = { xs: 0.15, s: 0.3, m: 0.55, l: 0.9 };
const REDUCED_FADE_MAX = 0.2;

/** A fresh object on every call, so a caller mutating its copy cannot poison the next one. */
export function motion(reduced: boolean): Motion {
  return {
    reduced,
    dur: reduced ? { xs: 0, s: 0, m: 0, l: 0 } : { ...TOKENS },
    fade: reduced
      ? {
          xs: Math.min(TOKENS.xs, REDUCED_FADE_MAX),
          s: Math.min(TOKENS.s, REDUCED_FADE_MAX),
          m: Math.min(TOKENS.m, REDUCED_FADE_MAX),
          l: Math.min(TOKENS.l, REDUCED_FADE_MAX),
        }
      : { ...TOKENS },
    ease: { out: 'expo.out', io: 'power3.inOut', stamp: 'back.out(2.2)' },
    parallax: !reduced,
    tilt: !reduced,
    splitText: !reduced,
  };
}
