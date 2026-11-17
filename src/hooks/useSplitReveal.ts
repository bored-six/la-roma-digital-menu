import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { RefObject } from 'react';
import { motion } from '../lib/motion';

gsap.registerPlugin(useGSAP, SplitText);

export interface SplitRevealOptions {
  /** Start the reveal. Until then the text stays hidden (CSS: [data-split]:not([data-ready])). */
  play: boolean;
  reduced: boolean;
  /** Seconds before the first letter moves. */
  delay?: number;
  /** Seconds between letters. DESIGN.md: 0.028. */
  stagger?: number;
}

/**
 * Title letter reveal (DESIGN.md): chars rise from y .6em, rotateX -70, opacity 0, origin 50% 100%, expo.out.
 * SplitText keeps the readable name on the element (aria-label) and hides the per-letter spans from screen readers.
 * Reduced motion: no split at all, the text is simply shown.
 */
export function useSplitReveal(ref: RefObject<HTMLElement>, { play, reduced, delay = 0, stagger = 0.028 }: SplitRevealOptions): void {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        el.dataset.ready = '';
        return;
      }
      if (!play) return;
      const m = motion(false);
      const split = SplitText.create(el, { type: 'words,chars', aria: 'auto', wordsClass: 'split-word', charsClass: 'split-char' });
      gsap.set(split.chars, { opacity: 0 });
      el.dataset.ready = '';
      gsap.fromTo(
        split.chars,
        { y: '0.6em', rotateX: -70, opacity: 0, transformOrigin: '50% 100%' },
        { y: 0, rotateX: 0, opacity: 1, duration: m.dur.m + 0.05, ease: m.ease.out, stagger, delay, clearProps: 'transform,opacity' },
      );
    },
    { scope: ref, dependencies: [play, reduced] },
  );
}
