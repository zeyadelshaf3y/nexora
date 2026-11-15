/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { headlessVitestConfig } from '../../../tools/vite/headless-vitest-plugins.mts';

export default defineConfig(() => ({
  ...headlessVitestConfig(),
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/headless/menu',
  test: {
    name: 'menu',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/headless/menu',
      provider: 'v8' as const,
    },
  },
}));
