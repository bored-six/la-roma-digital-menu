import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { motion } from '../../lib/motion';
import type { AnatomiaProps } from '../../types';
import { PhotoFrame } from '../stage/Plate';
import { cachedSize, loadSize, photoUrl } from '../stage/stageData';
import { AnatomyLabels, LABEL_EDGE, LABEL_SHELF, Wrap, type LabelLayout, type LeaderHandle } from './AnatomyLabels';
import { AnatomyLayer, ellipseBox } from './AnatomyLayer';
import {
  PERSPECTIVE,
  ROT_DEFAULT,
  ROT_MAX,
  ROT_MIN,
  TILT_X,
  assignSides,
  layerLift,
  planOffset,
  project,
  rectAspect,
  rectFrame,
  regionsBounds,
  rotFromDrag,
  rotFromKey,
  spreadLabels,
} from './anatomiaLogic';
import s from './anatomia.module.css';

gsap.registerPlugin(Draggable);

// ---------- mutable scene state: GSAP tweens these plain numbers, apply() writes them to the DOM ----------
interface LayerState {
  /** lift above the disc, px */
  z: number;
  /** extra lift while a label is picked, px */
  boost: number;
  /** layer opacity */
  dim: number;
  /** leader line drawn, 0..1 */
  draw: number;
  /** label shown, 0..1 */
  label: number;
}
interface SceneState {
  rx: number;
  rz: number;
  layers: LayerState[];
}
interface ViewGeom {
  w: number;
  h: number;
  cx: number;
  cy: number;
  P: number;
  /** plan offset of every region centre from the disc centre, px */
  offsets: Array<{ x: number; y: number }>;
  /** z of each layer at rest. Number 01 is the TOP of the stack, so numbers read downward like the labels do. */
  zFull: number[];
  layout: LabelLayout;
}

const pad = (n: number) => String(n).padStart(2, '0');
const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
const PICK_LIFT = 16;
const DIM = 0.35;

/**
 * The dish taken apart. The plate stays at the base; every ingredient is a clip-path cut-out of the same photo that lifts off in Z
 * (isometric: rotateX 55, rotateZ -35), with a leader line to a numbered label. Drag (GSAP Draggable, 1px = .25deg, -75..5) or the
 * arrow keys (+-10deg) turn it; tapping a label lifts that layer and dims the rest. X, Esc or a tap on the backdrop collapses it in
 * reverse. Focus is trapped inside while open and returned to the opener after. With reduced motion there is no 3D: a flat photo with
 * numbered rings and the same labels as a list.
 */
export function Anatomia({ item, photo, regions, onClose }: AnatomiaProps) {
  const reduced = useReducedMotion();
  const m = useMemo(() => motion(reduced), [reduced]);
  const titleId = useId();
  const url = photoUrl(photo.file);
  const n = regions.length;

  const [size, setSize] = useState(() => cachedSize(url));
  const [geom, setGeom] = useState<ViewGeom | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [rotNow, setRotNow] = useState(ROT_DEFAULT);

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const layerEls = useRef<Array<HTMLDivElement | null>>([]);
  const handles = useRef<LeaderHandle[]>([]);
  const geomRef = useRef<ViewGeom | null>(null);
  const scene = useRef<SceneState>({ rx: 0, rz: 0, layers: [] });
  const openTl = useRef<gsap.core.Timeline | null>(null);
  const rotTween = useRef<gsap.core.Tween | null>(null);
  const targetRot = useRef(ROT_DEFAULT);
  const activeRef = useRef<number | null>(null);
  const closing = useRef(false);
  const opened = useRef(false);

  // The scene state must have one entry per region before anything reads it.
  if (scene.current.layers.length !== n) {
    scene.current = { rx: 0, rz: 0, layers: regions.map(() => ({ z: 0, boost: 0, dim: 1, draw: 0, label: 0 })) };
  }

  // ---------- natural size of the photo (to place regions on the disc plane) ----------
  useEffect(() => {
    if (size !== null) return;
    let live = true;
    loadSize(url).then(
      (v) => live && setSize(v),
      () => live && setSize({ w: 900, h: 900 }),
    );
    return () => {
      live = false;
    };
  }, [url, size]);

  // ---------- write the scene state to the DOM: transforms, leader lines, labels. No React involved. ----------
  const apply = useCallback(() => {
    const g = geomRef.current;
    const tilt = tiltRef.current;
    const spin = spinRef.current;
    if (g === null || tilt === null || spin === null) return;
    const sc = scene.current;
    tilt.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${sc.rx}deg)`;
    spin.style.transform = `rotateZ(${sc.rz}deg)`;
    for (let i = 0; i < sc.layers.length; i++) {
      const L = sc.layers[i]!;
      const off = g.offsets[i];
      if (off === undefined) continue;
      const z = L.z + L.boost;
      const layerEl = layerEls.current[i];
      if (layerEl) {
        layerEl.style.transform = `translateZ(${z}px)`;
        layerEl.style.opacity = String(L.dim);
      }
      const h = handles.current[i];
      if (!h) continue;
      const top = project({ x: off.x, y: off.y, z }, sc.rx, sc.rz, PERSPECTIVE);
      const foot = project({ x: off.x, y: off.y, z: 0 }, sc.rx, sc.rz, PERSPECTIVE);
      const dx = g.cx + top.x;
      const dy = g.cy + top.y;
      const fx = g.cx + foot.x;
      const fy = g.cy + foot.y;
      const side = g.layout.sides[i] ?? 'right';
      const yl = g.layout.ys[i] ?? dy;
      const anchor = side === 'left' ? LABEL_EDGE + g.layout.colW + LABEL_SHELF : g.w - LABEL_EDGE - g.layout.colW - LABEL_SHELF;
      const elbow = anchor + (side === 'left' ? 16 : -16);
      const shown = Math.min(1, L.draw * 4);
      h.stem?.setAttribute('x1', fx.toFixed(1));
      h.stem?.setAttribute('y1', fy.toFixed(1));
      h.stem?.setAttribute('x2', dx.toFixed(1));
      h.stem?.setAttribute('y2', dy.toFixed(1));
      if (h.stem) h.stem.style.opacity = String(shown);
      if (h.foot) {
        h.foot.setAttribute('cx', fx.toFixed(1));
        h.foot.setAttribute('cy', fy.toFixed(1));
        h.foot.style.opacity = String(shown);
      }
      h.dot?.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(45)`);
      if (h.dot) h.dot.style.opacity = String(shown);
      if (h.leader) {
        h.leader.setAttribute('points', `${dx.toFixed(1)},${dy.toFixed(1)} ${elbow.toFixed(1)},${yl.toFixed(1)} ${anchor.toFixed(1)},${yl.toFixed(1)}`);
        h.leader.style.strokeDashoffset = String(1 - L.draw);
      }
      if (h.label) {
        h.label.style.opacity = String(L.label);
        h.label.style.transform = `translateX(${((side === 'left' ? -1 : 1) * (1 - L.label) * 8).toFixed(2)}px)`;
      }
    }
  }, []);

  // ---------- measure the view, place the disc, decide the label columns ----------
  const measure = useCallback(() => {
    const v = viewRef.current;
    if (v === null || size === null) return;
    const w = v.clientWidth;
    const h = v.clientHeight;
    if (w === 0 || h === 0) return;
    const P = Math.round(Math.min(200, Math.max(150, w * 0.5)));
    const cx = w / 2;
    const cy = h * 0.66;
    const offsets = regions.map((r) => planOffset(r, photo.plate, P, size.w, size.h));
    // How high the stack may rise: from the disc up to just under the top of the view, allowing for the lift being foreshortened
    // by sin(55deg) and enlarged a little by the perspective.
    const room = (cy - 64) / (Math.sin((TILT_X * Math.PI) / 180) * 1.1);
    const lift = layerLift(n, room, 56);
    const zFull = regions.map((_, i) => (n - i) * lift);
    // Where each dot lands once the stack is fully open at the default angle: that fixes the column and the height of its label.
    const rest = offsets.map((o, i) => project({ x: o.x, y: o.y, z: zFull[i] ?? 0 }, TILT_X, ROT_DEFAULT, PERSPECTIVE));
    const sides = assignSides(rest.map((p) => p.x), 4);
    const ys = new Array<number>(n).fill(0);
    for (const side of ['left', 'right'] as const) {
      const idx = sides.flatMap((sd, i) => (sd === side ? [i] : []));
      const spread = spreadLabels(idx.map((i) => cy + rest[i]!.y), { top: 22, bottom: h - 24, gap: 54 });
      idx.forEach((i, k) => {
        ys[i] = spread[k]!;
      });
    }
    // A little wider than the free space beside the disc: labels may overlap the dim base by a few px, which beats cramped wrapping.
    const colW = Math.max(84, Math.floor((w - P) / 2) - LABEL_EDGE - LABEL_SHELF + 14);
    const next: ViewGeom = { w, h, cx, cy, P, offsets, zFull, layout: { w, sides, ys, colW } };
    geomRef.current = next;
    setGeom(next);
  }, [size, regions, photo.plate, n]);

  useLayoutEffect(() => {
    if (reduced) return;
    const v = viewRef.current;
    if (v === null || size === null) return;
    measure();
    const ro = new ResizeObserver(() => {
      measure();
      // already open (the phone was turned): seat the layers at the new height straight away
      const g = geomRef.current;
      if (g !== null && opened.current && !closing.current && !openTl.current?.isActive()) {
        scene.current.layers.forEach((L, i) => {
          L.z = g.zFull[i] ?? L.z;
        });
      }
      apply();
    });
    ro.observe(v);
    return () => ro.disconnect();
  }, [measure, apply, size, reduced]);

  // keep the DOM in step with a fresh geometry (resize) without waiting for a tween
  useLayoutEffect(() => {
    apply();
  }, [geom, apply]);

  // ---------- open ----------
  const ready = reduced ? size !== null : geom !== null;
  useLayoutEffect(() => {
    if (!ready || opened.current) return;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (backdrop === null || panel === null) return;
    opened.current = true;

    const tl = gsap.timeline();
    openTl.current = tl;
    if (reduced) {
      tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: m.fade.s, ease: 'none' }, 0);
      return;
    }
    const sc = scene.current;
    const zFull = geomRef.current?.zFull ?? [];
    tl.eventCallback('onUpdate', apply);
    tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: m.dur.s, ease: 'none' }, 0);
    tl.fromTo(panel, { opacity: 0, y: 28, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: m.dur.m, ease: m.ease.out }, 0);
    // the plate lies down into the isometric pose ...
    tl.to(sc, { rx: TILT_X, rz: ROT_DEFAULT, duration: 0.8, ease: m.ease.io }, 0.18);
    // ... then the layers lift off one after another, bottom of the stack first, each followed by its leader and label
    const bottomFirst = zFull.map((_, i) => i).sort((a, b) => zFull[a]! - zFull[b]!);
    bottomFirst.forEach((i, k) => {
      const at = 0.78 + k * 0.06;
      const L = sc.layers[i]!;
      tl.to(L, { z: zFull[i]!, duration: m.dur.l, ease: m.ease.out }, at);
      tl.to(L, { draw: 1, duration: 0.4, ease: 'power2.out' }, at + 0.32);
      tl.to(L, { label: 1, duration: 0.35, ease: m.ease.out }, at + 0.38);
    });
  }, [ready, reduced, m, apply]);

  // ---------- close: the layers drop back in reverse, the plate lies flat, the sheet leaves ----------
  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    openTl.current?.kill();
    rotTween.current?.kill();
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (backdrop === null || panel === null) {
      onClose();
      return;
    }
    if (reduced || geomRef.current === null) {
      gsap.to(backdrop, { opacity: 0, duration: m.fade.s, ease: 'none', onComplete: onClose });
      return;
    }
    const sc = scene.current;
    const zFull = geomRef.current?.zFull ?? [];
    const tl = gsap.timeline({ onUpdate: apply, onComplete: onClose });
    const topFirst = zFull.map((_, i) => i).sort((a, b) => zFull[b]! - zFull[a]!);
    tl.to(sc.layers, { label: 0, draw: 0, boost: 0, dim: 1, duration: 0.22, ease: 'power2.in' }, 0);
    topFirst.forEach((i, k) => tl.to(sc.layers[i]!, { z: 0, duration: 0.4, ease: 'power3.in' }, 0.08 + k * 0.045));
    tl.to(sc, { rx: 0, rz: 0, duration: 0.45, ease: m.ease.io }, 0.2);
    tl.to(panel, { opacity: 0, y: 24, scale: 0.98, duration: 0.3, ease: 'power2.in' }, 0.5);
    tl.to(backdrop, { opacity: 0, duration: 0.28, ease: 'none' }, 0.52);
  }, [apply, m, onClose, reduced]);

  // ---------- rotate ----------
  const rotateTo = useCallback(
    (deg: number) => {
      openTl.current?.progress(1);
      rotTween.current?.kill();
      targetRot.current = deg;
      setRotNow(Math.round(deg));
      rotTween.current = gsap.to(scene.current, { rz: deg, duration: 0.35, ease: 'power3.out', onUpdate: apply });
    },
    [apply],
  );

  // GSAP Draggable on x, through a detached proxy: the proxy carries the pointer maths, the scene reads dx from it.
  useEffect(() => {
    const view = viewRef.current;
    if (view === null || reduced || geom === null) return;
    let startRot = ROT_DEFAULT;
    const [drag] = Draggable.create(document.createElement('div'), {
      type: 'x',
      trigger: view,
      dragClickables: false,
      minimumMovement: 3,
      onPress() {
        openTl.current?.progress(1);
        rotTween.current?.kill();
        startRot = scene.current.rz;
      },
      onDrag() {
        const rz = rotFromDrag(startRot, this.x - this.startX);
        scene.current.rz = rz;
        targetRot.current = rz;
        apply();
      },
      onRelease() {
        setRotNow(Math.round(scene.current.rz));
      },
    });
    return () => {
      drag?.kill();
    };
  }, [geom === null, reduced, apply]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- pick a label ----------
  const toggle = useCallback(
    (i: number) => {
      const next = activeRef.current === i ? null : i;
      activeRef.current = next;
      setActive(next);
      if (reduced || geomRef.current === null) return;
      openTl.current?.progress(1);
      gsap.to(scene.current.layers, {
        boost: (k: number) => (k === next ? PICK_LIFT : 0),
        dim: (k: number) => (next === null || k === next ? 1 : DIM),
        duration: m.dur.s,
        ease: m.ease.out,
        overwrite: 'auto',
        onUpdate: apply,
      });
    },
    [apply, m, reduced],
  );

  // ---------- keyboard: Esc, arrows, Tab trap. Captured on window so the pager's own arrow keys never fire behind the sheet. ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const own = ['Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (panel === null) return;
        const list = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (list.length === 0) {
          e.preventDefault();
          return;
        }
        const first = list[0]!;
        const last = list[list.length - 1]!;
        const at = document.activeElement;
        if (!panel.contains(at)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && at === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && at === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (!own.includes(e.key)) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.key === 'Escape') requestClose();
      else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !reduced && geomRef.current !== null) {
        rotateTo(rotFromKey(targetRot.current, e.key === 'ArrowRight' ? 1 : -1));
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [requestClose, rotateTo, reduced]);

  // ---------- focus in, focus back ----------
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      openTl.current?.kill();
      rotTween.current?.kill();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  // ---------- render ----------
  const note =
    active === null
      ? { kicker: reduced ? 'Tap a part' : 'Drag to turn', text: reduced ? 'Each ring on the photo is one part of the dish.' : 'Tap a label to lift that part. The arrow keys turn it too.' }
      : { kicker: `${pad(active + 1)}  ${regions[active]!.label}`, text: regions[active]!.detail ?? `Part ${active + 1} of ${n} in the ${item.name}.` };

  const bounds = useMemo(() => regionsBounds(regions, 0.07), [regions]);
  const flat = rectFrame(bounds);

  return createPortal(
    <div ref={backdropRef} className={s.backdrop} style={{ opacity: 0 }} onPointerDown={(e) => e.target === e.currentTarget && requestClose()}>
      <div className={s.sheet}>
        <div ref={panelRef} className={s.panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button ref={closeRef} type="button" className={s.close} aria-label="Close Anatomia" onClick={requestClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <header className={s.head}>
            <p className={s.eyebrow}>Anatomia</p>
            <h2 id={titleId} className={s.title}>
              {item.name}
            </h2>
          </header>

          {reduced ? (
            <div className={s.flat}>
              {size !== null && (
                <div className={s.flatPhoto} style={{ aspectRatio: String(rectAspect(bounds, size.w, size.h)) }}>
                  <div className={s.flatFrame} style={{ width: `${flat.widthPct}%`, transform: `translate(${flat.shiftXPct}%, ${flat.shiftYPct}%)` }}>
                    <img src={url} alt="" decoding="async" draggable={false} />
                    {regions.map((r, i) => (
                      <span key={r.label} className={s.flatRing} style={ellipseBox(r)} data-active={active === i || undefined} data-dim={(active !== null && active !== i) || undefined}>
                        <span className={s.flatBadge}>{pad(i + 1)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <ol className={s.flatList}>
                {regions.map((r, i) => (
                  <li key={r.label}>
                    <button type="button" className={s.flatItem} aria-pressed={active === i} onClick={() => toggle(i)}>
                      <span className={s.num}>{pad(i + 1)}</span>
                      <span className={s.name}>
                        <Wrap text={r.label} />
                      </span>
                      {r.detail !== undefined && <span className={s.flatDetail}>{r.detail}</span>}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <>
              <div ref={viewRef} className={s.view}>
                {geom !== null && size !== null && (
                  <>
                    <div
                      className={s.scene}
                      role="slider"
                      tabIndex={0}
                      aria-label="Turn the exploded view"
                      aria-valuemin={ROT_MIN}
                      aria-valuemax={ROT_MAX}
                      aria-valuenow={rotNow}
                      aria-valuetext={`${Math.round(rotNow)} degrees`}
                      style={{ left: geom.cx - geom.P / 2, top: geom.cy - geom.P / 2, width: geom.P, height: geom.P }}
                    >
                      <div ref={tiltRef} className={s.tilt}>
                        <div ref={spinRef} className={s.spin}>
                          <div className={s.base}>
                            <PhotoFrame file={photo.file} alt="" geom={photo.plate} eager>
                              <span className={s.veil} />
                              {regions.map((r) => (
                                <span key={r.label} className={s.baseRing} style={ellipseBox(r)} />
                              ))}
                            </PhotoFrame>
                          </div>
                          <span className={s.ground} />
                          {regions.map((r, i) => (
                            <AnatomyLayer
                              key={r.label}
                              region={r}
                              file={photo.file}
                              geom={photo.plate}
                              active={active === i}
                              layerRef={(el) => {
                                layerEls.current[i] = el;
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <AnatomyLabels regions={regions} layout={geom.layout} active={active} handles={handles} onToggle={toggle} />
                  </>
                )}
              </div>
              <div className={s.note} aria-live="polite">
                <span className={s.noteKicker}>{note.kicker}</span>
                <span className={s.noteText}>{note.text}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default Anatomia;
