import type { CSSProperties, ReactNode } from 'react';
import { slug } from '../../lib/slug';
import type { ResolvedPhoto } from '../../lib/photos';
import type { Item } from '../../types';
import { PlaceholderPlate } from './PlaceholderPlate';
import { cropFrame, plateGeomFor, type PlateGeom } from './stageLogic';
import { photoUrl, thumbUrl } from './stageData';
import { photoSize } from './photoSizes';
import s from './stage.module.css';

interface PhotoFrameProps {
  file: string;
  alt: string;
  geom: PlateGeom;
  /** loading="eager" (a stage that is on screen or next to it) instead of "lazy". */
  eager?: boolean;
  /**
   * Render the <img> at all. False = no element, so no request: Chrome's lazy-load distance counts pages that are scrolled off
   * horizontally, so `loading=lazy` alone would still fetch far pages. Once shown, keep it true.
   */
  show?: boolean;
  /** "thumb": the 320 px file, for the small option tiles. Default "hero": the full size file. */
  variant?: 'hero' | 'thumb';
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
export function PhotoFrame({ file, alt, geom, eager = false, show = true, variant = 'hero', className, imgStyle, children }: PhotoFrameProps) {
  const f = cropFrame(geom);
  const size = photoSize(file);
  return (
    <div
      className={className ? `${s.frame} ${className}` : s.frame}
      style={{ width: `${f.widthPct}%`, transform: `translate(${f.shiftXPct}%, ${f.shiftYPct}%)` }}
    >
      {show && (
        <img
          src={variant === 'thumb' ? thumbUrl(file) : photoUrl(file)}
          alt={alt}
          // the master's pixel size (the thumb has the same aspect ratio): the browser reserves the right ratio before the bytes arrive
          {...(size !== null ? { width: size.w, height: size.h } : {})}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          style={imgStyle}
        />
      )}
      {children}
    </div>
  );
}

interface PlateProps {
  item: Item;
  photo: ResolvedPhoto | null;
  /** Category icon stem for the placeholder. */
  icon: string;
  /** Eager load (this stage is the current page or next to it). */
  eager: boolean;
  /** Render the photo element at all: false until the stage has been near the current page once. */
  show: boolean;
}

/** The round plate: photo cropped to its circle, or the laurel placeholder. Fills its parent box. */
export function Plate({ item, photo, icon, eager, show }: PlateProps) {
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
        show={show}
      />
      <span className={s.sheen} aria-hidden="true" />
    </div>
  );
}
