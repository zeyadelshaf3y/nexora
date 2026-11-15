import type { PluginOption } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nexoraResolveAlias } from './nexora-aliases.mts';

/** Shared Vitest/Vite config for headless libs that resolve `@nexora-ui/*` via workspace paths. */
export function headlessVitestConfig() {
  return {
    plugins: [angular()] as PluginOption[],
    resolve: {
      alias: nexoraResolveAlias,
    },
  } as const;
}
