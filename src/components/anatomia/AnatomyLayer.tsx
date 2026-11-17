import type { CSSProperties } from 'react';
import { regionClipPath } from '../../lib/anatomy';
import type { AnatomyRegion } from '../../types';
import { PhotoFrame } from '../stage/Plate';
import type { PlateGeom } from '../stage/stageLogic';
import s from './anatomia.module.css';

/** Position and size of a region ellipse in PHOTO space (percent of the frame), centred on its middle. */
export function ellipseBox(r: AnatomyRegion): CSSProperties {
  return {
    left: `${r.cx * 100}%`,
    top: `${r.cy * 100}%`,
    width: `${r.rx * 200}%`,
    height: `${r.ry * 200}%`,
  };
}

interface AnatomyLayerProps {
  region: AnatomyRegion;
  file: string;
  geom: PlateGeom;
  active: boolean;
  layerRef(el: HTMLDivElement | null): void;
}

/**
 * One ingredient: the SAME photo, framed exactly like the plate on the disc below it, but clipped to the region ellipse
 * (lib/anatomy regionClipPath, percent of the photo). Because it is framed identically, at z = 0 it sits precisely on top of its
 * own pixels; lifting it in Z is what separates it. The gold ring is a sibling of the clipped <img>, so the clip never eats it.
 */
export function AnatomyLayer({ region, file, geom, active, layerRef }: AnatomyLayerProps) {
  return (
    <div ref={layerRef} className={s.layer} data-active={active || undefined}>
      <PhotoFrame file={file} alt="" geom={geom} eager imgStyle={{ clipPath: regionClipPath(region) }}>
        <span className={s.layerRing} style={ellipseBox(region)} />
      </PhotoFrame>
    </div>
  );
}
