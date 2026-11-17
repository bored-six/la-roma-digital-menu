import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSplitReveal } from '../../hooks/useSplitReveal';
import type { Category } from '../../types';
import { CategoryIcon } from '../ornaments/Svg';

interface SectionTitleProps {
  category: Category;
  /** Dom id of the h3, so the section can be labelled by it. */
  id: string;
}

/**
 * Icon + Cinzel title (letters rise in), tagline, then the gold rule that draws itself and ends in the diamond.
 * Plays once, the first time it is on screen.
 */
export function SectionTitle({ category, id }: SectionTitleProps) {
  const reduced = useReducedMotion();
  const { ref: wrapRef, inView } = useInView<HTMLElement>({ threshold: 0.5, rootMargin: '0px' });
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  useSplitReveal(titleRef, { play: inView, reduced });

  // Rule: starts +0.25s after the letters begin, 0.9s power2.inOut. --rule drives both the line and the diamond (stage.css .lr-rule).
  useGSAP(
    () => {
      const rule = ruleRef.current;
      if (!rule) return;
      if (reduced) {
        gsap.set(rule, { '--rule': 1 });
        return;
      }
      if (!inView) {
        gsap.set(rule, { '--rule': 0 });
        return;
      }
      gsap.fromTo(rule, { '--rule': 0 }, { '--rule': 1, duration: 0.9, ease: 'power2.inOut', delay: 0.25 });
    },
    { scope: wrapRef, dependencies: [inView, reduced] },
  );

  return (
    <header ref={wrapRef} className="section-title">
      <CategoryIcon name={category.icon} className="section-title__icon" />
      <h3 ref={titleRef} id={id} className="section-title__text" data-split>
        {category.title}
      </h3>
      {category.tagline ? <p className="section-title__tagline">{category.tagline}</p> : null}
      <div ref={ruleRef} className="lr-rule section-title__rule" aria-hidden="true" />
    </header>
  );
}
