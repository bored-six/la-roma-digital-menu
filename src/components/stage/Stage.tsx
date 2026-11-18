import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { AnatomiaBoundary } from './AnatomiaBoundary';
import { getAnatomia, preloadAnatomia } from './anatomiaLoader';
import { OptionTiles, type OptionTilesHandle } from './OptionTiles';
import { Plate } from './Plate';
import { StageHeadline, type HeadlineHandle } from './StageHeadline';
import { findItemContext } from './itemContext';
import { ANATOMY_REGIONS, PHOTOS, photoUrl, preloadImage } from './stageData';
import { anatomyFor, tileSlots } from './stageLogic';
import { LayersMark } from './stageSvg';
import { useTilt } from './useTilt';
import s from './stage.module.css';

/** Longest we wait for the next photo before swapping anyway. */
const PRELOAD_CAP_MS = 600;

/**
 * The hero stage of a menu page: dark Roman-red arch, rim light, tilted ribbed floor, one round plate floating on it with a
 * contact shadow, the dish name big behind it, floating squircle tiles for the other dishes, a glass card and the price pill.
 * `selectedId` is owned by the parent. Tapping a tile calls `onSelect`; whenever `selectedId` changes (tile, list row,
 * anything) the plate spins out, the new one spins in, the name re-sets and the tiles reflow.
 */
export function Stage({ items, selectedId, onSelect, active, near }: StageProps) {
  const reduced = useReducedMotion();

  // Photos: not a single <img> is rendered until this stage has been near the current page once (spec section 6), then they stay.
  // `near` is current page +-1; a parent that does not pass it gets the stricter "only when active".
  const isNear = near ?? active;
  const everNear = useRef(isNear);
  if (isNear) everNear.current = true;
  const photosOn = everNear.current;

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
  /** A tile tap parks "focus this tile once dish `id` has landed" here. Only that swap may use it; every other path drops it. */
  const focusSlot = useRef<{ id: string; slot: number } | null>(null);
  const everSwapped = useRef(false);

  const anatomiaBtnRef = useRef<HTMLButtonElement>(null);
  const swapInFlight = useRef(false);
  const [anatomiaOpen, setAnatomiaOpen] = useState(false);
  /** The Anatomia chunk (or the sheet) failed once. Chrome keeps a failed module fetch for the page's life, so from here on the button reloads. */
  const [anatomiaFailed, setAnatomiaFailed] = useState(false);
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
  const Anatomia = getAnatomia();

  useTilt(stageRef, tiltRef, active && !reduced);

  // Warm the Anatomia chunk while the browser is idle, so the first tap opens instantly.
  const eligible = anatomy !== null;
  useEffect(() => {
    if (!active || !eligible) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(preloadAnatomia);
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(preloadAnatomia, 1200);
    return () => window.clearTimeout(id);
  }, [active, eligible]);

  // ---------- the swap ----------
  useEffect(() => {
    // The tile tap that parked a focus request is only the swap to ITS dish. Anything else running here cancelled it: a different
    // dish took over (list row), the dish already on the plate was picked, the page was left, nothing is wanted. Drop the request,
    // or a later list-row swap would steal focus to a tile. (Unmount needs nothing: the ref dies with the component.)
    const parked = focusSlot.current;
    if (parked !== null && (parked.id !== wantedId || wantedId === displayedRef.current || !active)) focusSlot.current = null;
    if (wantedId === null) return;
    const swapEl = swapRef.current;
    if (wantedId === displayedRef.current) {
      // Nothing to swap to. But a swap may have been cancelled half-way (tap tile B, then at once the dish already shown):
      // the plate and the text are still faded out, so bring them back.
      if (swapInFlight.current) {
        swapInFlight.current = false;
        if (swapEl !== null) {
          gsap.killTweensOf(swapEl);
          gsap.set(swapEl, { clearProps: 'transform,opacity' });
        }
        headlineRef.current?.restore();
      }
      return;
    }
    const nextId = wantedId;

    // Off screen (or not mounted yet): no one would see a transition, just set it. If a swap was cut short by leaving the page
    // (tap, then swipe away inside the out-tween) the plate is still spun out and transparent: put it back, or it is invisible on return.
    if (!active || swapEl === null) {
      swapInFlight.current = false;
      if (swapEl !== null) {
        gsap.killTweensOf(swapEl);
        gsap.set(swapEl, { clearProps: 'transform,opacity' });
      }
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
      swapInFlight.current = false;
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
      const parkedFocus = focusSlot.current;
      focusSlot.current = null;
      if (parkedFocus !== null && parkedFocus.id === nextId) tilesRef.current?.focusSlot(parkedFocus.slot);
      const label = next ? `Showing ${next.name}${next.price === null ? '' : `, ${formatPrice(next.price)}`}` : '';
      setAnnounce(label);
    };

    swapInFlight.current = true;
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
      // Superseded, page left, or unmounted: drop this swap's late callbacks and stop its tweens. The next run either starts a
      // fresh out-tween from wherever the plate is (a second tap) or, if the page was left, puts the plate back (branch above).
      swapToken.current++;
      // Only the OUT half: once committed, the in-tween belongs to nobody's cleanup and runs to its own clearProps.
      if (swapInFlight.current) gsap.killTweensOf(swapEl);
    };
  }, [wantedId, active, reduced]);

  // Safety net: a stage that is on screen with no swap in flight must never have a spun-out plate (covers any path that left the
  // tween half-way, e.g. the settled page changing while a swap was mid-flight).
  useEffect(() => {
    const el = swapRef.current;
    if (active && el !== null && !swapInFlight.current && wantedId === displayedRef.current) {
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: 'transform,opacity' });
    }
  }, [active, wantedId]);

  // Anatomia belongs to one dish on one visible page.
  useEffect(() => {
    setAnatomiaOpen(false);
  }, [shown?.id, active]);

  const onPick = useCallback(
    (id: string, slotIndex: number) => {
      focusSlot.current = { id, slot: slotIndex };
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
            aria-haspopup={anatomiaFailed ? undefined : 'dialog'}
            aria-expanded={anatomiaFailed ? undefined : anatomiaOpen}
            ref={anatomiaBtnRef}
            onPointerEnter={preloadAnatomia}
            onFocus={preloadAnatomia}
            onClick={() => {
              // Chrome remembers a failed module fetch for the rest of the page's life, so after the first failure the only honest
              // retry is a reload (usePager mirrors the page into the hash, so the reload lands on the same page).
              if (anatomiaFailed) {
                window.location.reload();
                return;
              }
              setAnatomiaOpen(true);
            }}
          >
            <LayersMark className={s.btnMark} />
            <span>{anatomiaFailed ? 'Reload' : 'Anatomia'}</span>
          </button>
        )}

        <StageHeadline ref={headlineRef} item={shown} eyebrow={eyebrow} play={active} reduced={reduced} />

        <div className="lr-stage__shadow" aria-hidden="true" />
        <div ref={tiltRef} className={s.plateTilt}>
          <div className={s.bob}>
            <div ref={swapRef} className={s.swap}>
              <Plate item={shown} photo={photo} icon={icon} eager={isNear} show={photosOn} />
            </div>
          </div>
        </div>

        <OptionTiles ref={tilesRef} tiles={tiles} slots={slots} show={photosOn} stagger={!everSwapped.current} onPick={onPick} />

        <div className={s.grain} aria-hidden="true" />
        <p className={s.sr} aria-live="polite" aria-atomic="true">
          {announce}
        </p>
      </section>

      {anatomiaOpen && anatomy !== null && (
        <AnatomiaBoundary
          onFail={() => {
            // chunk fetch failed or the sheet threw: close it, the app stays alive, and the button turns into Reload
            setAnatomiaOpen(false);
            setAnatomiaFailed(true);
            setAnnounce('Anatomia could not load. Press Reload to try again.');
          }}
        >
          <Suspense fallback={null}>
            <Anatomia
              item={shown}
              photo={anatomy.entry}
              regions={anatomy.regions}
              returnFocusRef={anatomiaBtnRef}
              onClose={() => setAnatomiaOpen(false)}
            />
          </Suspense>
        </AnatomiaBoundary>
      )}
    </div>
  );
}

export default Stage;
