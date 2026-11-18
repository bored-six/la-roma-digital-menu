import { fitFontSize } from '../../lib/fit';

/** Below this the name wraps to two lines at this size instead of shrinking further. */
const MIN_PX = 21;
/** Keep 3% of the box free: the SplitText letter reveal cuts the name into inline-blocks, which loses kerning and adds a px or two. */
const SLACK = 0.97;

/**
 * Set the stage name as large as the stage allows on ONE line (the headline sits behind the plate, so a second line
 * lands on the photo and the option tiles). Measures the name on a single nowrap line, then asks `fitFontSize`.
 * Runs again when the box changes width and when a web font finishes loading, because both change how wide the text is.
 */
export function fitTitle(el: HTMLElement): void {
  el.style.fontSize = '';
  el.style.whiteSpace = 'nowrap';
  const base = Number.parseFloat(getComputedStyle(el).fontSize);
  const size = fitFontSize({ base, available: el.clientWidth * SLACK, needed: el.scrollWidth, min: MIN_PX });
  el.style.whiteSpace = '';
  if (size < base) el.style.fontSize = `${size}px`;
}

/** fitTitle now, and again on every width change of the box and every font that finishes loading. Returns the cleanup. */
export function keepTitleFitted(el: HTMLElement): () => void {
  fitTitle(el);
  let width = el.clientWidth;
  const refit = () => fitTitle(el);
  const observer =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          if (el.clientWidth === width) return;
          width = el.clientWidth;
          refit();
        });
  observer?.observe(el);
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
  fonts?.addEventListener('loadingdone', refit);
  return () => {
    observer?.disconnect();
    fonts?.removeEventListener('loadingdone', refit);
  };
}
