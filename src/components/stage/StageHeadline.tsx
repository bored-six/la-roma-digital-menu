import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { motion } from '../../lib/motion';
import { formatPrice } from '../../lib/price';
import type { Item } from '../../types';
import s from './stage.module.css';

gsap.registerPlugin(SplitText);

export interface HeadlineHandle {
  /** Fade the current text out. Returns the tween so the caller can wait for it. */
  out(): gsap.core.Tween | null;
  /** Undo `out()` for the SAME dish (a swap that was cancelled by tapping the dish that is already shown). */
  restore(): void;
}

interface StageHeadlineProps {
  item: Item;
  /** Small gold line above the name, e.g. the category. */
  eyebrow: string;
  /** The stage is on screen: reveal now. Before that the text stays hidden so the reveal is seen. */
  play: boolean;
  reduced: boolean;
}

function lengthClass(name: string): 'd' | 'm' | 'l' | 'xl' {
  if (name.length <= 13) return 'd';
  if (name.length <= 20) return 'm';
  if (name.length <= 27) return 'l';
  return 'xl';
}

/**
 * Everything the stage says about the selected dish: eyebrow, the big serif name (SplitText letter reveal),
 * the glass card (description, badges, Glass/Pitcher prices) and the price pill. The pill is simply absent when price is null.
 * The name element is keyed by item id, so React never reconciles text that SplitText has already cut into spans.
 */
export const StageHeadline = forwardRef<HeadlineHandle, StageHeadlineProps>(function StageHeadline(
  { item, eyebrow, play, reduced },
  ref,
) {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const shownId = useRef<string | null>(null);

  const all = () => [eyebrowRef.current, titleRef.current, cardRef.current, priceRef.current].filter((el): el is HTMLElement => el !== null);

  useImperativeHandle(
    ref,
    () => ({
      out() {
        const els = all();
        if (els.length === 0) return null;
        const m = motion(reduced);
        return gsap.to(els, { opacity: 0, y: reduced ? 0 : -6, duration: reduced ? m.fade.xs : m.dur.s, ease: 'power3.in', overwrite: true });
      },
      restore() {
        const els = all();
        if (els.length === 0) return;
        gsap.killTweensOf(els);
        gsap.set(els, { opacity: 1, y: 0 });
      },
    }),
    [reduced],
  );

  useLayoutEffect(() => {
    const title = titleRef.current;
    if (title === null) return;

    // Not on screen yet and never shown: hold everything back so the first reveal is actually seen.
    if (!play && shownId.current === null) {
      gsap.set(all(), { opacity: 0 });
      return;
    }
    // Already revealed this dish (the stage only left the screen and came back): leave it as it is.
    if (shownId.current === item.id) return;
    shownId.current = item.id;

    const m = motion(reduced);
    const tl = gsap.timeline();
    let split: SplitText | null = null;
    const eyebrowEl = eyebrowRef.current;
    const cardEl = cardRef.current;
    const priceEl = priceRef.current;
    const containers = [eyebrowEl, title, cardEl, priceEl].filter((el): el is HTMLElement => el !== null);

    if (!m.splitText) {
      tl.fromTo(containers, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: m.fade.s, ease: 'none' }, 0);
    } else {
      split = SplitText.create(title, { type: 'words,chars', wordsClass: s.titleWord, charsClass: s.titleChar });
      tl.set(containers, { opacity: 1 }, 0);
      if (eyebrowEl) tl.fromTo(eyebrowEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: m.dur.s, ease: m.ease.out }, 0);
      tl.fromTo(
        split.chars,
        { opacity: 0, y: '0.6em', rotateX: -70, transformPerspective: 600 },
        { opacity: 1, y: 0, rotateX: 0, duration: m.dur.m, ease: m.ease.out, stagger: 0.022 },
        0.04,
      );
      if (cardEl) tl.fromTo(cardEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: m.dur.m, ease: m.ease.out }, 0.16);
      if (priceEl) {
        tl.fromTo(
          priceEl,
          { opacity: 0, scale: 1.6, rotation: -6 },
          { opacity: 1, scale: 1, rotation: 0, duration: m.dur.m, ease: m.ease.stamp },
          0.24,
        );
      }
    }

    return () => {
      // Finish instead of freezing: a half-faded name must never be left on screen.
      tl.progress(1).kill();
      split?.revert();
    };
  }, [item.id, play, reduced]);

  // The eyebrow already says the category / drinks subgroup, so the card's kicker is only for badges that add something
  // (Unli Rice items would otherwise say "Unli rice" twice).
  const kicker = item.badges.filter((b) => b.toLowerCase() !== eyebrow.toLowerCase()).join(' · ');
  const variantLine = item.variants?.map((v) => `${v.label} ${formatPrice(v.price)}`).join(' · ') ?? '';
  const hasCard = kicker !== '' || variantLine !== '' || (item.description ?? '') !== '';
  const price = formatPrice(item.price);

  return (
    <>
      <p ref={eyebrowRef} className="lr-stage__eyebrow">
        {eyebrow}
      </p>
      <p key={item.id} ref={titleRef} className={`lr-stage__title ${s.title}`} data-len={lengthClass(item.name)}>
        {item.name}
      </p>
      {hasCard && (
        <div ref={cardRef} className={`lr-glass lr-stage__card ${s.card}`}>
          {kicker !== '' && <span className="lr-glass__kicker">{kicker}</span>}
          {variantLine !== '' && <span className={s.cardVariants}>{variantLine}</span>}
          {item.description !== undefined && item.description !== '' && <span className="lr-glass__text">{item.description}</span>}
        </div>
      )}
      {price !== '' && (
        <span ref={priceRef} className={`lr-pill lr-stage__price ${s.price}`}>
          <span className="lr-pill__cur">{price.slice(0, 1)}</span>
          {price.slice(1)}
        </span>
      )}
    </>
  );
});
