import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { memo, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { usePagerContext } from '../../hooks/usePager';
import { useSplitReveal } from '../../hooks/useSplitReveal';
import { motion } from '../../lib/motion';
import { Arrow, Emblem } from '../ornaments/Svg';

/** public/ files hang off the Vite base, like the dish photos do (stageData.photoUrl). */
const base = import.meta.env.BASE_URL;

interface CoverPageProps {
  /** The cover is on screen. The rising intro plays only if the page opens on the cover; the title reveals the first time it is seen. */
  active: boolean;
}

/**
 * Cover: emblem, LA ROMA, the red arch with the engraved Colosseum, "Open menu".
 * The arch is the portal: it scales up from its own centre until it floods the screen, then the pager lands on
 * page 1 behind a red veil that melts away while page 1 settles in (DESIGN.md "Cover arch portal").
 */
export const CoverPage = memo(function CoverPage({ active }: CoverPageProps) {
  const reduced = useReducedMotion();
  const { goTo, getPage, veilRef, setLocked } = usePagerContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const busy = useRef(false);
  const startedActive = useRef(active);
  const [seen, setSeen] = useState(active);
  useEffect(() => {
    if (active) setSeen(true);
  }, [active]);

  useSplitReveal(titleRef, { play: seen, reduced, delay: 0.1, stagger: 0.05 });

  // Intro: everything but the title rises 16px and fades in, 0.6s expo.out. Skipped when the page opens elsewhere (deep link).
  const { contextSafe } = useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced || !startedActive.current) return;
      const m = motion(false);
      gsap.from(root.querySelectorAll('[data-rise]'), {
        y: 16,
        opacity: 0,
        duration: m.dur.m + 0.05,
        ease: m.ease.out,
        stagger: 0.07,
        delay: 0.05,
        clearProps: 'transform,opacity',
      });
      // The arch image is the cover's LCP element: it settles (scale only) but never starts transparent.
      gsap.from(archRef.current, { scale: 0.94, duration: m.dur.l, ease: m.ease.out, clearProps: 'transform' });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  const openMenu = contextSafe(() => {
    const root = rootRef.current;
    const arch = archRef.current;
    const img = imgRef.current;
    const veil = veilRef.current;
    if (!root || !arch || !img || !veil || busy.current) return;
    busy.current = true;
    setLocked(true);

    const out = Array.from(root.querySelectorAll<HTMLElement>('[data-rise]'));
    const page1 = getPage(1)?.firstElementChild as HTMLElement | null;
    const land = () => {
      goTo(1, { behavior: 'instant', force: true, focus: true });
    };
    const finish = () => {
      gsap.set([...out, arch, img], { clearProps: 'transform,opacity' });
      if (page1) gsap.set(page1, { clearProps: 'transform,opacity' });
      gsap.set(veil, { clearProps: 'opacity' });
      setLocked(false);
      busy.current = false;
    };

    if (reduced) {
      // Reduced motion: a plain crossfade, no scaling.
      const m = motion(true);
      const tl = gsap
        .timeline({ onComplete: finish })
        .to(root, { opacity: 0, duration: m.fade.xs })
        .add(() => {
          land();
          if (page1) gsap.set(page1, { opacity: 0 });
        })
        .set(root, { opacity: 1 });
      if (page1) tl.to(page1, { opacity: 1, duration: m.fade.m });
      return;
    }

    const m = motion(false);
    const tl = gsap
      .timeline({ onComplete: finish })
      // text out first
      .to(out, { y: -24, opacity: 0, duration: m.dur.s + 0.05, ease: 'power3.in', stagger: 0.03 }, 0)
      // the arch opens: 1 -> 7.5 from low centre, the engraving pushes in and dissolves into plain red
      .to(arch, { scale: 7.5, transformOrigin: '50% 70%', duration: 1.4, ease: 'power4.inOut' }, 0)
      .to(img, { scale: 1.35, duration: 1.4, ease: 'power4.inOut' }, 0)
      .to(img, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 0.5)
      // the arch now fills the screen: swap to page 1 behind a veil of the same red, then melt the veil away
      .set(veil, { opacity: 1 }, 0.85)
      .add(() => {
        land();
        if (page1) gsap.set(page1, { opacity: 0, scale: 1.06 });
      }, 0.85)
      .to(veil, { opacity: 0, duration: 0.7, ease: 'power1.out' }, 0.95);
    if (page1) tl.to(page1, { opacity: 1, scale: 1, duration: 0.85, ease: m.ease.out }, 0.95);
  });

  return (
    <div ref={rootRef} className="page__inner lr-frame cover">
      <div className="cover__emblem-wrap" data-rise>
        <Emblem className="cover__emblem" />
      </div>
      <h1 ref={titleRef} className="cover__title" data-split data-page-heading tabIndex={-1}>
        La Roma
      </h1>
      <p className="cover__sub" data-rise>
        Restaurant
      </p>
      <p className="cover__est" data-rise>
        <i />
        <s />
        <span>Est. 2017</span>
        <s />
        <i />
      </p>

      <div className="cover__arch-wrap">
        <div ref={archRef} className="cover__arch">
          <img
            ref={imgRef}
            src={`${base}brand/cover-arch-900.jpg`}
            srcSet={`${base}brand/cover-arch-600.jpg 600w, ${base}brand/cover-arch-900.jpg 900w`}
            sizes="(min-width: 430px) 320px, 80vw"
            width={900}
            height={759}
            alt="Engraving of the Colosseum in Rome"
            decoding="async"
          />
        </div>
      </div>

      <p className="cover__what" data-rise>
        Filipino favourites · Pizza · Unli Rice
      </p>
      <button type="button" className="cover__open" data-rise onClick={openMenu}>
        <span>Open menu</span>
        <Arrow dir="right" className="cover__open-arrow" />
      </button>
    </div>
  );
});
