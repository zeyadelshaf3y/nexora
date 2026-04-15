import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

import angularTemplateParser from '@angular-eslint/template-parser';
import angularTemplate from '@angular-eslint/eslint-plugin-template/dist/index.js';

const TS_FILES = ['**/*.ts', '**/*.tsx'];
const HTML_FILES = ['**/*.html'];

function onlyFiles(configs, files) {
  return configs.map((c) => ({ ...c, files }));
}

export default [
  // Ignore
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.angular/**',
      '**/.nx/**',
      '**/.cache/**',
      '**/.verdaccio/**',
      'libs/package.json',
      '**/vitest.config.*.timestamp*',
    ],
  },

  // Nx base
  ...nx.configs['flat/base'],

  // JS recommended (only for JS-ish files)
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    ...js.configs.recommended,
  },

  // TS strict (ONLY TS files)
  ...onlyFiles(tseslint.configs.strict, TS_FILES),

  // Angular TS rules (ONLY TS files)
  ...onlyFiles(angular.configs.tsRecommended, TS_FILES),

  // Project TS rules (ONLY TS files)
  {
    files: TS_FILES,
    plugins: {
      '@nx': nx,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // Enforce Nx architecture boundaries across libs
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:demo',
              onlyDependOnLibsWithTags: ['scope:headless'],
            },
            {
              sourceTag: 'scope:headless',
              onlyDependOnLibsWithTags: ['scope:headless'],
            },
            {
              sourceTag: 'layer:core',
              onlyDependOnLibsWithTags: ['scope:headless', 'layer:core'],
            },
            {
              sourceTag: 'layer:interactions',
              onlyDependOnLibsWithTags: ['scope:headless', 'layer:core', 'layer:interactions'],
            },
            {
              sourceTag: 'layer:overlay',
              onlyDependOnLibsWithTags: [
                'scope:headless',
                'layer:core',
                'layer:interactions',
                'layer:overlay',
              ],
            },
            {
              sourceTag: 'layer:listbox',
              onlyDependOnLibsWithTags: [
                'scope:headless',
                'layer:core',
                'layer:interactions',
                'layer:listbox',
              ],
            },
            {
              sourceTag: 'layer:dropdown',
              onlyDependOnLibsWithTags: [
                'scope:headless',
                'layer:core',
                'layer:interactions',
                'layer:overlay',
                'layer:listbox',
                'layer:dropdown',
              ],
            },
            {
              sourceTag: 'layer:feature',
              onlyDependOnLibsWithTags: [
                'scope:headless',
                'layer:core',
                'layer:interactions',
                'layer:overlay',
                'layer:listbox',
                'layer:dropdown',
                'layer:feature',
              ],
            },
          ],
        },
      ],

      // Clean imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Imports hygiene
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',
      'import/order': [
        'warn',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],

      // TS strictness tweaks (practical)
      // Empty Angular classes (metadata-only directives/components, test shells) are valid.
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Angular selectors (adjust prefix if you want)
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'nexora', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'nexora', style: 'camelCase' },
      ],
    },
  },

  // Angular HTML template rules (ONLY HTML files)
  {
    files: HTML_FILES,
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/no-any': 'error',
    },
  },
];
