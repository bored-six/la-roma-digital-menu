import { Laurel, StageIcon } from './stageSvg';
import s from './stage.module.css';

interface PlaceholderPlateProps {
  /** Category icon stem, e.g. 'icon-noodles'. */
  icon: string;
  /** 'plate' = the big disc on the stage (laurel ring + icon). 'tile' = the small squircle thumbnail (icon only, the laurel is too fine at 46px). */
  variant?: 'plate' | 'tile';
}

/**
 * The designed stand-in for a dish with no photo: parchment disc, gold laurel ring, the category icon in Roman red.
 * It disappears by itself the moment photos.json gets an entry for the dish (resolvePhoto starts returning one).
 */
export function PlaceholderPlate({ icon, variant = 'plate' }: PlaceholderPlateProps) {
  if (variant === 'tile') {
    return (
      <span className={s.thumbPlaceholder} aria-hidden="true">
        <StageIcon name={icon} className={s.thumbIcon} />
      </span>
    );
  }
  return (
    <div className={`${s.disc} ${s.discPlaceholder}`} aria-hidden="true">
      <Laurel className={s.laurel} />
      <StageIcon name={icon} className={s.plateIcon} />
    </div>
  );
}
