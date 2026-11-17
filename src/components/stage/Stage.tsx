import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import '../../../design-system/tokens.css';
import '../../../design-system/stage.css';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { formatPrice } from '../../lib/price';
import { motion } from '../../lib/motion';
import { resolvePhoto } from '../../lib/photos';
import { defaultSelectedId, pickTiles } from '../../lib/tiles';
import type { StageProps } from '../../types';
import { OptionTiles, type OptionTilesHandle } from './OptionTiles';
import { Plate } from './Plate';
import { StageHeadline, type HeadlineHandle } from './StageHeadline';
import { findItemContext } from './itemContext';
import { ANATOMY_REGIONS, PHOTOS, photoUrl, preloadImage } from './stageData';
import { anatomyFor, tileSlots } from './stageLogic';
import { LayersMark } from './stageSvg';
import { useTilt } from './useTilt';
import s from './stage.module.css';

// Anatomia (and GSAP Draggable with it) is a separate chunk: it is only needed once someone opens it.
const loadAnatomia = () => import('../anatomia/Anatomia');
const Anatomia = lazy(loadAnatomia);

/** Longest we wait for the next photo before swapping anyway. */
const PRELOAD_CAP_MS = 600;

/**
 * The hero stage of a menu page: dark Roman-red arch, rim light, tilted ribbed floor, one round plate floating on it with a
 * contact shadow, the dish name big behind it, floating squircle tiles for the other dishes, a glass card and the price pill.
 * `selectedId` is owned by the parent. Tapping a tile calls `onSelect`; whenever `selectedId` changes (tile, list row,
 * anything) the plate spins out, the new one spins in, the name re-sets and the tiles reflow.
 */
export function Stage({ items, selectedId, onSelect, active }: StageProps) {
  const reduced = useReducedMotion();

  // What the parent wants shown, falling back to the page default if it points at nothing we know.
  const wantedId = useMemo(
    () => (items.some((i) => i.id === selectedId) ? selectedId : (defaultSelectedId(items, PHOTOS) ?? null)),
    [items, selectedId],
  );

  // What is on the plate right now. Differs from wantedId only while a swap is in flight.
  const [displayedId, setDisplayedId] = useState<string | null>(wantedId);
  const displayedRef = useRef(displayedId);
  displayedRef.current = displayedId;
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const stageRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const swapRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HeadlineHandle>(null);
  const tilesRef = useRef<OptionTilesHandle>(null);
  const swapToken = useRef(0);
  const focusSlot = useRef<number | null>(null);
  const everSwapped = useRef(false);

  const [anatomiaOpen, setAnatomiaOpen] = useState(false);
  const [announce, setAnnounce] = useState('');

  const shown = items.find((i) => i.id === displayedId) ?? items.find((i) => i.id === wantedId) ?? items[0];
  const photo = shown ? resolvePhoto(shown, PHOTOS) : null;
  const ctx = shown ? findItemContext(shown.id) : null;
  const icon = ctx?.category.icon ?? '';
  const tiles = useMemo(
    () => (shown ? pickTiles(items, shown.id, PHOTOS, 6) : []),
    [items, shown],
  );
  const slots = useMemo(() => tileSlots(tiles.length), [tiles.length]);
  const anatomy = shown ? anatomyFor(shown, PHOTOS, ANATOMY_REGIONS) : null;
  const eyebrow = shown?.subgroup ?? ctx?.category.title ?? '';

  useTilt(stageRef, tiltRef, active && !reduced);

  // Warm the Anatomia chunk while the browser is idle, so the first tap opens instantly.
  const eligible = anatomy !== null;
  useEffect(() => {
    if (!active || !eligible) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => void loadAnatomia());
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => void loadAnatomia(), 1200);
    return () => window.clearTimeout(id);
  }, [active, eligible]);

  // ---------- the swap ----------
  useEffect(() => {
    if (wantedId === null || wantedId === displayedRef.current) return;
    const nextId = wantedId;
    const swapEl = swapRef.current;

    // Off screen (or not mounted yet): no one would see a transition, just set it.
    if (!active || swapEl === null) {
      setDisplayedId(nextId);
      return;
    }

    const m = motion(reduced);
    const token = ++swapToken.current;
    const next = itemsRef.current.find((i) => i.id === nextId);
    const nextPhoto = next ? resolvePhoto(next, PHOTOS) : null;
    const ready = nextPhoto
      ? Promise.race([preloadImage(photoUrl(nextPhoto.entry.file)), new Promise<void>((r) => window.setTimeout(r, PRELOAD_CAP_MS))])
      : Promise.resolve();

    const commit = () => {
      if (swapToken.current !== token) return; // a newer tap took over
      everSwapped.current = true; // before the render, so tiles arriving now pop in without the first-mount stagger
      flushSync(() => setDisplayedId(nextId));
      const el = swapRef.current;
      if (el !== null) {
        if (m.reduced) {
          gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: m.fade.xs, ease: 'none', clearProps: 'opacity' });
        } else {
          gsap.fromTo(
            el,
            { rotation: 90, scale: 0.7, opacity: 0 },
            { rotation: 0, scale: 1, opacity: 1, duration: m.dur.m, ease: m.ease.out, clearProps: 'transform,opacity' },
          );
        }
      }
      if (focusSlot.current !== null) {
        tilesRef.current?.focusSlot(focusSlot.current);
        focusSlot.current = null;
      }
      const label = next ? `Showing ${next.name}${next.price === null ? '' : `, ${formatPrice(next.price)}`}` : '';
      setAnnounce(label);
    };

    headlineRef.current?.out();
    gsap.killTweensOf(swapEl);
    gsap.to(swapEl, {
      ...(m.reduced ? {} : { rotation: -90, scale: 0.7 }),
      opacity: 0,
      duration: m.reduced ? m.fade.xs : m.dur.s,
      ease: m.reduced ? 'none' : 'power3.in',
      onComplete: () => void ready.then(commit),
    });

    return () => {
      // Superseded or unmounted: drop this swap's late callbacks. The next effect run starts a fresh out-tween.
      swapToken.current++;
    };
  }, [wantedId, active, reduced]);

  // Anatomia belongs to one dish on one visible page.
  useEffect(() => {
    setAnatomiaOpen(false);
  }, [shown?.id, active]);

  const onPick = useCallback(
    (id: string, slotIndex: number) => {
      focusSlot.current = slotIndex;
      onSelect(id);
    },
    [onSelect],
  );

  if (!shown) return null;

  return (
    <div className={`lr-stage-wrap ${s.wrap}`} data-active={active || undefined}>
      <section
        ref={stageRef}
        className={`lr-stage ${s.stage}`}
        aria-label="Dish showcase"
        data-anatomia={anatomy !== null ? '' : undefined}
      >
        <div className="lr-stage__floor" />
        <div className={s.beam} aria-hidden="true" />
        <div className={s.halo} aria-hidden="true" />
        <div className={s.pool} aria-hidden="true" />
        <div className={s.floorRing} aria-hidden="true" />

        {anatomy !== null && (
          <button
            type="button"
            className={`lr-stage-btn ${s.anatomiaBtn}`}
            aria-haspopup="dialog"
            aria-expanded={anatomiaOpen}
            onPointerEnter={() => void loadAnatomia()}
            onFocus={() => void loadAnatomia()}
            onClick={() => setAnatomiaOpen(true)}
          >
            <LayersMark className={s.btnMark} />
            <span>Anatomia</span>
          </button>
        )}

        <StageHeadline ref={headlineRef} item={shown} eyebrow={eyebrow} play={active} reduced={reduced} />

        <div className="lr-stage__shadow" aria-hidden="true" />
        <div ref={tiltRef} className={s.plateTilt}>
          <div className={s.bob}>
            <div ref={swapRef} className={s.swap}>
              <Plate item={shown} photo={photo} icon={icon} eager={active} />
            </div>
          </div>
        </div>

        <OptionTiles ref={tilesRef} tiles={tiles} slots={slots} eager={active} stagger={!everSwapped.current} onPick={onPick} />

        <div className={s.grain} aria-hidden="true" />
        <p className={s.sr} aria-live="polite" aria-atomic="true">
          {announce}
        </p>
      </section>

      {anatomiaOpen && anatomy !== null && (
        <Suspense fallback={null}>
          <Anatomia
            item={shown}
            photo={anatomy.entry}
            regions={anatomy.regions}
            onClose={() => setAnatomiaOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default Stage;
