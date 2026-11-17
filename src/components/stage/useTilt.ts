import { useEffect, type RefObject } from 'react';
import { TILT_MAX, tiltFromPointer } from './stageLogic';

type OrientationEventCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

/** Remembered for the session: once the user has said yes (or no) to motion access we never ask twice. */
let orientation: 'unknown' | 'granted' | 'denied' = 'unknown';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const LERP = 0.1;
const SETTLED = 0.004;

/**
 * Plate tilt. Writes ONLY --tilt-x / --tilt-y (degrees) and --tn-x / --tn-y (-1..1, for the highlight) on `target`.
 *  - mouse / pen: follows the pointer over the stage, eased 10% per frame, back to flat when it leaves.
 *  - phone: deviceorientation, but only after a user gesture (first click in the stage), and on iOS only after the
 *    permission prompt is granted. The phone's resting angle at that moment is the "flat" position.
 * Nothing runs unless `enabled` (stage on screen and motion allowed). Cleans up every listener and the rAF loop.
 */
export function useTilt(stageRef: RefObject<HTMLElement | null>, target: RefObject<HTMLElement | null>, enabled: boolean): void {
  useEffect(() => {
    const stage = stageRef.current;
    const el = target.current;
    if (stage === null || el === null) return;

    const write = (x: number, y: number) => {
      el.style.setProperty('--tilt-x', `${x.toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${y.toFixed(2)}deg`);
      el.style.setProperty('--tn-x', (x / TILT_MAX).toFixed(3));
      el.style.setProperty('--tn-y', (y / TILT_MAX).toFixed(3));
    };
    if (!enabled) {
      write(0, 0);
      return;
    }

    const cur = { x: 0, y: 0 };
    const goal = { x: 0, y: 0 };
    let raf = 0;
    const frame = () => {
      raf = 0;
      cur.x += (goal.x - cur.x) * LERP;
      cur.y += (goal.y - cur.y) * LERP;
      const done = Math.abs(goal.x - cur.x) < SETTLED && Math.abs(goal.y - cur.y) < SETTLED;
      if (done) {
        cur.x = goal.x;
        cur.y = goal.y;
      }
      write(cur.x, cur.y);
      if (!done) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (raf === 0) raf = requestAnimationFrame(frame);
    };

    // ---- pointer (mouse / pen only: a finger dragging over the stage is a page scroll, not a tilt) ----
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const t = tiltFromPointer(e.clientX, e.clientY, stage.getBoundingClientRect());
      goal.x = t.x;
      goal.y = t.y;
      kick();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      goal.x = 0;
      goal.y = 0;
      kick();
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);

    // ---- device orientation ----
    let baseBeta: number | null = null;
    let listening = false;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      baseBeta ??= e.beta;
      goal.y = clamp(e.gamma * 0.3, -TILT_MAX, TILT_MAX);
      goal.x = clamp(-(e.beta - baseBeta) * 0.3, -TILT_MAX, TILT_MAX);
      kick();
    };
    const listen = () => {
      if (listening) return;
      listening = true;
      window.addEventListener('deviceorientation', onOrient);
    };
    const onFirstGesture = () => {
      if (orientation === 'denied' || typeof DeviceOrientationEvent === 'undefined') return;
      const ctor = DeviceOrientationEvent as OrientationEventCtor;
      if (typeof ctor.requestPermission === 'function') {
        // iOS 13+: must be called from inside a user gesture. A click is one.
        ctor
          .requestPermission()
          .then((state) => {
            orientation = state === 'granted' ? 'granted' : 'denied';
            if (orientation === 'granted') listen();
          })
          .catch(() => {
            orientation = 'denied';
          });
      } else {
        orientation = 'granted';
        listen();
      }
    };
    if (orientation === 'granted') listen();
    else if (orientation === 'unknown') stage.addEventListener('click', onFirstGesture, { once: true, capture: true });

    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stage.removeEventListener('click', onFirstGesture, { capture: true });
      if (listening) window.removeEventListener('deviceorientation', onOrient);
      if (raf !== 0) cancelAnimationFrame(raf);
      write(0, 0);
    };
  }, [enabled, stageRef, target]);
}
