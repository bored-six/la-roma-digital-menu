import { forwardRef, useImperativeHandle, useRef, type CSSProperties } from 'react';
import type { Tile } from '../../lib/tiles';
import { PlaceholderPlate } from './PlaceholderPlate';
import { PhotoFrame } from './Plate';
import { findItemContext } from './itemContext';
import { plateGeomFor, type TileSlot } from './stageLogic';
import s from './stage.module.css';

export interface OptionTilesHandle {
  /** Put keyboard focus on the tile in this slot (the tapped tile unmounts on a swap, focus must not fall to <body>). */
  focusSlot(index: number): void;
}

interface OptionTilesProps {
  tiles: readonly Tile[];
  slots: readonly TileSlot[];
  /** Stage on screen: thumbnails load now. */
  eager: boolean;
  /** Stagger the entrance (first mount only; later arrivals pop in with no delay). */
  stagger: boolean;
  onPick(id: string, slotIndex: number): void;
}

/**
 * Squircle tiles floating around the plate, one per other dish of the page (pickTiles, max 6).
 * States: rest (floats), hover / keyboard focus (lifts 4px, gold ring, name chip), pressed (scale .96).
 * The selected dish is not a tile: it is the plate.
 */
export const OptionTiles = forwardRef<OptionTilesHandle, OptionTilesProps>(function OptionTiles(
  { tiles, slots, eager, stagger, onPick },
  ref,
) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  useImperativeHandle(ref, () => ({ focusSlot: (i) => buttons.current[i]?.focus({ preventScroll: true }) }), []);

  return (
    <>
      {tiles.map((tile, i) => {
        const slot = slots[i];
        if (slot === undefined) return null;
        const { item, photo } = tile;
        const style = {
          '--x': `${slot.x}%`,
          '--y': `${slot.y}%`,
          '--float-delay': `${-(i * 0.83 + 0.4).toFixed(2)}s`,
          '--enter-delay': stagger ? `${120 + i * 70}ms` : '0ms',
        } as CSSProperties;
        return (
          <button
            key={item.id}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            className={`lr-tile ${s.tile}`}
            style={style}
            data-side={slot.x < 50 ? 'l' : 'r'}
            aria-label={`Show ${item.name}`}
            onClick={() => onPick(item.id, i)}
          >
            <span className={`${s.ring} lr-squircle`} aria-hidden="true" />
            <span className={`lr-tile__face lr-squircle ${s.face}`}>
              {photo === null ? (
                <PlaceholderPlate icon={findItemContext(item.id)?.category.icon ?? ''} variant="tile" />
              ) : (
                <span className={s.thumb}>
                  <PhotoFrame file={photo.entry.file} alt="" geom={plateGeomFor(item, photo)} eager={eager} />
                </span>
              )}
            </span>
            <span className={s.tip} aria-hidden="true">
              {item.name}
            </span>
          </button>
        );
      })}
    </>
  );
});
