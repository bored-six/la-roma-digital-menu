// The design-system SVGs, inlined verbatim (?raw) so they keep currentColor and their exact path data.
// Sizing happens in CSS (the files carry width/height attributes that a class overrides).
import laurelRaw from '../../../design-system/svg/laurel-ring.svg?raw';

const iconFiles = import.meta.glob('../../../design-system/svg/icon-*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const icons = new Map<string, string>();
for (const [path, raw] of Object.entries(iconFiles)) {
  icons.set(path.slice(path.lastIndexOf('/') + 1, -'.svg'.length), raw);
}

interface RawProps {
  svg: string;
  className?: string;
}
function Raw({ svg, className }: RawProps) {
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** `name` is the stem used in menu data, e.g. 'icon-breakfast'. Renders nothing for an unknown stem. */
export function StageIcon({ name, className }: { name: string; className?: string }) {
  const svg = icons.get(name);
  return svg === undefined ? null : <Raw svg={svg} className={className} />;
}

export function Laurel({ className }: { className?: string }) {
  return <Raw svg={laurelRaw} className={className} />;
}

/**
 * The Anatomia mark: three stacked rhombi, the top one solid (the one jewel). Drawn on the 24 grid,
 * 1.5 stroke, round caps. Custom, not from an icon pack.
 */
export function LayersMark({ className }: { className?: string }) {
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
    >
      <path d="M12 3.2L19.6 7L12 10.8L4.4 7Z" fill="currentColor" />
      <path d="M4.4 11.6L12 15.4L19.6 11.6" />
      <path d="M4.4 16.2L12 20L19.6 16.2" />
    </svg>
  );
}
