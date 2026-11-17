import { ClosingPage } from './components/pages/ClosingPage';
import { CategoryPage } from './components/pages/CategoryPage';
import { CoverPage } from './components/pages/CoverPage';
import { Pager, type PageState } from './components/pager/Pager';
import { PAGES } from './data/menu';
import type { Page } from './types';

function renderPage(page: Page, state: PageState) {
  switch (page.kind) {
    case 'cover':
      return <CoverPage active={state.active} />;
    case 'category':
      return <CategoryPage page={page} active={state.active} />;
    case 'closing':
      return <ClosingPage />;
  }
}

export default function App() {
  return <Pager pages={PAGES} renderPage={renderPage} />;
}
