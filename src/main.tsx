// Two Italian families. Bodoni Moda carries titles, names and prices (its opsz axis thickens the hairlines at small sizes);
// EB Garamond Italic carries every description. Fontsource splits each family into unicode-range subsets, so a subset
// is only fetched when a character needs it. The peso sign is in neither Bodoni subset: see "La Roma Peso" in app.css.
import '@fontsource-variable/bodoni-moda/opsz.css';
import '@fontsource-variable/eb-garamond/wght-italic.css';
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
