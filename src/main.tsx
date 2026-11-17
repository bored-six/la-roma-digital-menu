// Fontsource ships each family as unicode-range subsets, so the browser only fetches a subset when a character needs it.
// The peso sign (U+20B1) lives in the latin-ext subset of Reddit Mono: import the full CSS, never only `latin`.
import '@fontsource-variable/cinzel';
import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource-variable/familjen-grotesk/wght-italic.css';
import '@fontsource-variable/reddit-mono';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/app.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
