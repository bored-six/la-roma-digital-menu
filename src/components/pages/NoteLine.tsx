import { usePagerContext } from '../../hooks/usePager';
import type { NoteLine as NoteLineData } from '../../types';
import { Arrow } from '../ornaments/Svg';

/** A note under the section rule, text verbatim from the data. With `jumpTo` it becomes a button that turns to that page. */
export function NoteLine({ note }: { note: NoteLineData }) {
  const { goToId } = usePagerContext();

  if (note.jumpTo === undefined) {
    return <p className="note">{note.text}</p>;
  }
  const target = note.jumpTo;
  return (
    <button type="button" className="note note--jump" onClick={() => goToId(target, { focus: true })}>
      <span>{note.text}</span>
      <Arrow dir="right" className="note__arrow" />
    </button>
  );
}
