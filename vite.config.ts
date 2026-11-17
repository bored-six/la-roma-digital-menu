import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base: the build works from any folder (QR code -> static host, GitHub Pages sub-path, a plain folder).
  // Everything the page loads is resolved against the page URL; the hash deep links (#pork) do not change it.
  base: './',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    passWithNoTests: true,
    environment: 'node',
  },
});
