import type { MutableRefObject } from 'react';
import type { AnatomyRegion } from '../../types';
import s from './anatomia.module.css';

/** The live SVG / DOM nodes of one callout. Anatomia writes their geometry every frame (no React re-render while dragging). */
export interface LeaderHandle {
  stem: SVGLineElement | null;
  foot: SVGCircleElement | null;
  leader: SVGPolylineElement | null;
  dot: SVGRectElement | null;
  label: HTMLButtonElement | null;
}

export interface LabelLayout {
  /** view size in px */
  w: number;
  /** column the label sits in, decided once when the stack opens so labels never jump while you drag */
  sides: Array<'left' | 'right'>;
  /** y of each label's number row, px from the view top */
  ys: number[];
  /** label column width in px */
  colW: number;
}

/** Gap between the view edge and the label column, and between column and the start of its leader shelf. */
export const LABEL_EDGE = 8;
export const LABEL_SHELF = 8;

const pad = (n: number) => String(n).padStart(2, '0');

/** Words can wrap, hyphenated compounds ("Sunny-side-up") cannot: they stay in one piece. */
export function Wrap({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className={s.nowrap}>{w}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  );
}

interface AnatomyLabelsProps {
  regions: readonly AnatomyRegion[];
  layout: LabelLayout | null;
  active: number | null;
  handles: MutableRefObject<LeaderHandle[]>;
  onToggle(index: number): void;
}

/**
 * The callouts: a leader line from each lifted layer to a numbered label ("01 Garlic fried rice"), plus the labels themselves
 * as real buttons (tap = lift that layer). The SVG sits over the view in screen space; its coordinates are computed
 * from the same 3D maths the browser applies, so the lines stay glued to the layers while the stack turns.
 */
export function AnatomyLabels({ regions, layout, active, handles, onToggle }: AnatomyLabelsProps) {
  const slot = (i: number): LeaderHandle => (handles.current[i] ??= { stem: null, foot: null, leader: null, dot: null, label: null });
  return (
    <>
      <svg className={s.leaders} aria-hidden="true">
        {regions.map((r, i) => (
          <g key={r.label} className={s.callout} data-active={active === i || undefined} data-dim={(active !== null && active !== i) || undefined}>
            <line ref={(el) => void (slot(i).stem = el)} className={s.stem} />
            <circle ref={(el) => void (slot(i).foot = el)} className={s.foot} r="2.6" />
            <polyline ref={(el) => void (slot(i).leader = el)} className={s.leader} pathLength={1} fill="none" />
            <rect ref={(el) => void (slot(i).dot = el)} className={s.dot} width="7" height="7" x="-3.5" y="-3.5" />
          </g>
        ))}
      </svg>
      {regions.map((r, i) => {
        const side = layout?.sides[i] ?? 'right';
        return (
          <button
            key={r.label}
            ref={(el) => void (slot(i).label = el)}
            type="button"
            className={s.label}
            data-side={side}
            data-dim={(active !== null && active !== i) || undefined}
            aria-pressed={active === i}
            style={
              layout === null
                ? { opacity: 0 }
                : { top: (layout.ys[i] ?? 0) - 8, width: layout.colW, [side]: LABEL_EDGE }
            }
            onClick={() => onToggle(i)}
          >
            <span className={s.num}>{pad(i + 1)}</span>
            <span className={s.name}>
              <Wrap text={r.label} />
            </span>
          </button>
        );
      })}
    </>
  );
}
