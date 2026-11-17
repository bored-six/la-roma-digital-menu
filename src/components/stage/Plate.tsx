import type { CSSProperties, ReactNode } from 'react';
import { slug } from '../../lib/slug';
import type { ResolvedPhoto } from '../../lib/photos';
import type { Item } from '../../types';
import { PlaceholderPlate } from './PlaceholderPlate';
import { cropFrame, plateGeomFor, type PlateGeom } from './stageLogic';
import { photoUrl } from './stageData';
import s from './stage.module.css';

interface PhotoFrameProps {
  file: string;
  alt: string;
  geom: PlateGeom;
  eager?: boolean;
  className?: string;
  /** Style for the <img> itself (Anatomia clips it to one region with clip-path). */
  imgStyle?: CSSProperties;
  /** Rendered in PHOTO space (percent of the frame = fractions of the image), e.g. region rings. */
  children?: ReactNode;
}

/**
 * The photo, sized and shifted so that the `geom` circle fills its parent box (parent must be position:relative; overflow:hidden).
 * Pure CSS: width is a percentage of the parent, the shift is a percentage of the frame itself, so no image size is needed.
 * Because only the circle is shown, the white rounded corners baked into tyulah-itum, bulalo and halo-halo never appear.
 */
export function PhotoFrame({ file, alt, geom, eager = false, className, imgStyle, children }: PhotoFrameProps) {
  const f = cropFrame(geom);
  return (
    <div
      className={className ? `${s.frame} ${className}` : s.frame}
      style={{ width: `${f.widthPct}%`, transform: `translate(${f.shiftXPct}%, ${f.shiftYPct}%)` }}
    >
      <img
        src={photoUrl(file)}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        style={imgStyle}
      />
      {children}
    </div>
  );
}

interface PlateProps {
  item: Item;
  photo: ResolvedPhoto | null;
  /** Category icon stem for the placeholder. */
  icon: string;
  /** Load the photo now (this is the stage on screen). Off-screen stages stay lazy. */
  eager: boolean;
}

/** The round plate: photo cropped to its circle, or the laurel placeholder. Fills its parent box. */
export function Plate({ item, photo, icon, eager }: PlateProps) {
  if (photo === null) return <PlaceholderPlate icon={icon} />;
  // The manifest alt describes the primary dish. A dish that only shares the file gets its own name instead.
  const owns = slug(item.name) === photo.slug;
  return (
    <div className={s.disc}>
      <PhotoFrame
        file={photo.entry.file}
        alt={owns ? photo.entry.alt : item.name}
        geom={plateGeomFor(item, photo)}
        eager={eager}
      />
      <span className={s.sheen} aria-hidden="true" />
    </div>
  );
}
