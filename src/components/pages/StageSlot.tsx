import type { StageProps } from '../../types';

/**
 * The single seam for lane 3. Placeholder: a dark arch-shaped box (the stage.css recipe) with the selected dish's name.
 * The integration step swaps this for `<Stage {...props} />` and nothing else in the shell changes.
 */
export function StageSlot({ items, selectedId, active }: StageProps) {
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  return (
    <div className="lr-stage-wrap" data-active={active || undefined}>
      <section className="lr-stage" aria-label="Selected dish">
        <div className="lr-stage__floor" />
        <p className="lr-stage__eyebrow">La Roma</p>
        <p className="lr-stage__title">{selected?.name}</p>
      </section>
    </div>
  );
}
