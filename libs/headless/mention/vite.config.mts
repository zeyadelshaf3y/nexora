/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { headlessVitestConfig } from '../../../tools/vite/headless-vitest-plugins.mts';

export default defineConfig(() => ({
  ...headlessVitestConfig(),
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/headless/mention',
  test: {
    name: 'mention',
    watch: false,
    globals: true,
    environment: 'jsdom',
    // Stabilize vitest-angular sourcemap plugin (avoid esbuild EPIPE under parallel runs).
    pool: 'forks',
    fileParallelism: false,
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/headless/mention',
      provider: 'v8' as const,
    },
  },
}));
