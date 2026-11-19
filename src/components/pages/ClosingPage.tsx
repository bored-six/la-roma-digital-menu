import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { memo, useRef } from 'react';
import { FACEBOOK_URL } from '../../data/site';
import { useInView } from '../../hooks/useInView';
import { usePagerContext } from '../../hooks/usePager';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSplitReveal } from '../../hooks/useSplitReveal';
import { motion } from '../../lib/motion';
import { Arrow, Emblem, Flourish, Sprig } from '../ornaments/Svg';

/** Grazie page: the laurel emblem draws itself, thank-you line, Facebook link, back to cover. No QR: we are already on the phone. */
export const ClosingPage = memo(function ClosingPage() {
  const reduced = useReducedMotion();
  const { goTo } = usePagerContext();
  const { ref: rootRef, inView } = useInView<HTMLDivElement>({ threshold: 0.4, rootMargin: '0px' });
  const emblemRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useSplitReveal(titleRef, { play: inView, reduced, delay: 0.5 });

  // Emblem: every stroke draws (dashoffset len -> 0) over --dur-l, then the jewel diamond pops. Strokes are hidden before first view.
  useGSAP(
    () => {
      const svg = emblemRef.current?.querySelector('svg');
      if (!svg || reduced) return;
      const m = motion(false);
      const strokes = Array.from(svg.querySelectorAll<SVGGeometryElement>('circle, path')).filter(
        (el) => el.getAttribute('fill') !== 'currentColor' && el.getTotalLength() > 0,
      );
      const jewel = svg.querySelector<SVGPathElement>('path[fill="currentColor"]');
      for (const el of strokes) {
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      }
      if (jewel) gsap.set(jewel, { scale: 0, transformOrigin: '50% 50%' });
      if (!inView) return;
      const tl = gsap.timeline();
      tl.to(strokes, { strokeDashoffset: 0, duration: m.dur.l + 0.4, ease: 'power2.inOut', stagger: 0.09 });
      if (jewel) tl.to(jewel, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, '-=0.3');
    },
    { scope: emblemRef, dependencies: [inView, reduced] },
  );

  return (
    <div ref={rootRef} className="page__inner closing">
      <Sprig className="sprig closing__sprig" />
      <div className="closing__body">
        <div ref={emblemRef} className="closing__emblem-wrap">
          <Emblem className="closing__emblem" />
        </div>
        <h2 ref={titleRef} className="closing__title" data-split data-page-heading tabIndex={-1}>
          Grazie!
        </h2>
        <p className="closing__thanks">Thank you for dining with us.</p>
        <Flourish className="flourish closing__flourish" />

        <div className="closing__card">
          <p className="closing__card-title">Follow us on Facebook</p>
          <p className="closing__card-note">Tap to open our page and follow</p>
          <a className="closing__fb" href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
            <span>La Roma on Facebook</span>
            <Arrow dir="up-right" className="closing__fb-arrow" />
          </a>
        </div>

        <p className="closing__sign">La Roma Restaurant · Est. 2017</p>
        <button type="button" className="closing__back" onClick={() => goTo(0, { focus: true })}>
          <Arrow dir="left" className="closing__back-arrow" />
          <span>Back to cover</span>
        </button>
      </div>
    </div>
  );
});
