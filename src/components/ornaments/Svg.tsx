// Inline the design-system SVGs verbatim (`?raw`) so they keep `currentColor` and the exact path data.
// Sizing is done in CSS: every file carries width/height attributes that a class overrides.
import emblemRaw from '../../../design-system/svg/emblem-colosseum.svg?raw';
import flourishRaw from '../../../design-system/svg/flourish-diamond.svg?raw';
import sprigRaw from '../../../design-system/svg/olive-sprig.svg?raw';

const iconFiles = import.meta.glob('../../../design-system/svg/icon-*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** `icon-pork` (menu data) and `pork` (CONTRACT.md wording) both resolve to icon-pork.svg. */
const icons = new Map<string, string>();
for (const [path, raw] of Object.entries(iconFiles)) {
  const stem = path.slice(path.lastIndexOf('/') + 1, -'.svg'.length);
  icons.set(stem, raw);
  icons.set(stem.replace(/^icon-/, ''), raw);
}

interface RawProps {
  svg: string;
  className?: string;
}
function Raw({ svg, className }: RawProps) {
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function CategoryIcon({ name, className = 'icon' }: { name: string; className?: string }) {
  const svg = icons.get(name);
  return svg ? <Raw svg={svg} className={className} /> : null;
}

export function Emblem({ className = 'emblem' }: { className?: string }) {
  return <Raw svg={emblemRaw} className={className} />;
}

export function Sprig({ className = 'sprig' }: { className?: string }) {
  return <Raw svg={sprigRaw} className={className} />;
}

export function Flourish({ className = 'flourish' }: { className?: string }) {
  return <Raw svg={flourishRaw} className={className} />;
}

/**
 * Arrow with a diamond nock, the one jewel of the design system. `dir` flips it for the prev button.
 * Drawn on the 24 grid: 1.5 stroke, round caps, one solid shape.
 */
export function Arrow({ dir = 'right', className = 'arrow' }: { dir?: 'left' | 'right' | 'up-right'; className?: string }) {
  const rotate = dir === 'left' ? 180 : dir === 'up-right' ? -45 : 0;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M8.5 12H19.5M15 7.5L19.5 12L15 16.5" />
      <path d="M4.2 10.2L6 12L4.2 13.8L2.4 12Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
