// Dev-only lab for the stage. Not part of the app build (vite builds index.html only).
//   /stage-lab.html?page=breakfast            any category page id from PAGES
//   &select=all-day-breakfast/tapsilog        start with this dish selected
//   &tap=2                                    after load, tap the 3rd tile (like a user would)
//   &anatomia=1                               after load, open Anatomia if the dish offers it
//   &rot=-20                                  with anatomia: rotate the exploded view to this angle
//   &active=0                                 mount the stage as off-screen (lazy images, no tilt)
import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PAGES } from './data/menu';
import { defaultSelectedId } from './lib/tiles';
import { PHOTOS } from './components/stage/stageData';
import { Stage } from './components/stage/Stage';

const params = new URLSearchParams(window.location.search);
const categoryPages = PAGES.filter((p): p is Extract<typeof p, { kind: 'category' }> => p.kind === 'category');
const page = categoryPages.find((p) => p.id === params.get('page')) ?? categoryPages[0]!;
const items = page.categories.flatMap((c) => c.items);

function Lab() {
  const [selectedId, setSelectedId] = useState(() => {
    const want = params.get('select');
    return items.find((i) => i.id === want)?.id ?? defaultSelectedId(items, PHOTOS) ?? items[0]!.id;
  });
  const onSelect = useCallback((id: string) => setSelectedId(id), []);

  useEffect(() => {
    const tap = params.get('tap');
    const wantAnatomia = params.get('anatomia') === '1';
    const t = window.setTimeout(() => {
      if (tap !== null) {
        const tiles = document.querySelectorAll<HTMLButtonElement>('button[class*="tile"]');
        tiles[Number(tap)]?.click();
      }
    }, 900);
    const t2 = window.setTimeout(() => {
      if (wantAnatomia) document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')?.click();
    }, tap !== null ? 2600 : 1200);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <>
      <nav className="lab-bar" aria-label="Lab pages">
        {categoryPages.map((p) => (
          <a key={p.id} href={`?page=${p.id}`} aria-current={p.id === page.id ? 'page' : undefined}>
            {p.id}
          </a>
        ))}
      </nav>
      <Stage items={items} selectedId={selectedId} onSelect={onSelect} active={params.get('active') !== '0'} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
);
