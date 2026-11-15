/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { headlessVitestConfig } from '../../../tools/vite/headless-vitest-plugins.mts';

export default defineConfig(() => ({
  ...headlessVitestConfig(),
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/headless/dropdown',
  test: {
    name: 'dropdown',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/headless/dropdown',
      provider: 'v8' as const,
    },
  },
}));
