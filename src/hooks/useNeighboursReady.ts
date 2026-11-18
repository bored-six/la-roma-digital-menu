import { useEffect, useState } from 'react';
import { browserSettleEnv, whenSettled } from '../lib/settle';

/**
 * False while the cover is still loading and animating, true once the page has loaded and the browser is idle (or the user has
 * touched something). The pager lets the pages next to the current one fetch photos only after that.
 */
export function useNeighboursReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => whenSettled(() => setReady(true), browserSettleEnv()), []);
  return ready;
}
