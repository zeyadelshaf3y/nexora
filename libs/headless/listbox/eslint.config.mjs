import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'nxr',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'nxr',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/internal/nxr-listbox-overlay-panel-host.component.ts'],
    rules: {
      // Internal entry must import the primary package so ng-packagr does not bundle a second
      // NXR_LISTBOX_CONTROLLER InjectionToken into @nexora-ui/listbox/internal.
      '@nx/enforce-module-boundaries': 'off',
    },
  },
];
