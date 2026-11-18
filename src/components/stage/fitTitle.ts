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
  // The width of the text itself. scrollWidth would be wrong: it is never smaller than the box, so a short name
  // would always look "too wide" for the slack and be shrunk below the token size.
  const range = document.createRange();
  range.selectNodeContents(el);
  const needed = range.getBoundingClientRect().width;
  const size = fitFontSize({ base, available: el.clientWidth * SLACK, needed, min: MIN_PX });
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
  // Watch the parent, not the title: a refit changes the title's height, which would re-notify a title observer.
  observer?.observe(el.parentElement ?? el);
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
  fonts?.addEventListener('loadingdone', refit);
  return () => {
    observer?.disconnect();
    fonts?.removeEventListener('loadingdone', refit);
  };
}
