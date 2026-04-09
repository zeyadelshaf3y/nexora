# Project Overview

High-level description of what Nexora is, what we’re building, and which tools we use. Use this for context when starting a task or onboarding.

## What is Nexora?

**Nexora** is a set of **headless UI primitives** for Angular. “Headless” means:

- **No built-in styles**: We provide behavior, accessibility, and DOM structure (and data attributes). You supply all CSS.
- **Composable**: You use directives and services to open overlays, attach content, and handle close. You own the markup and styling.
- **Tree-shakable**: Import only the packages and symbols you use so bundle size stays minimal.

We are **not** building a full component library with themes and default visuals. We are building the **logic and accessibility** for overlays (dialog, drawer, popover, tooltip, snackbar), shared dropdowns, listbox, select, combobox, menu, mention, and further primitives on the [roadmap](HEADLESS-COMPONENTS-PLAN.md).

## What we’re building

### Current scope

| Area               | Description                                                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overlay system** | Single engine for stacking, positioning, scroll/focus strategies, close (Escape, outside click, backdrop). Used by dialog, drawer, popover, tooltip, snackbar. |
| **Dialog**         | Modal overlays in 9 positions (e.g. center, top-end). Service API: `DialogService.open(componentOrTemplate, options)`.                                         |
| **Drawer**         | Side/edge panels in 4 positions (top, bottom, start, end). RTL-aware. `DrawerService.open(componentOrTemplate, options)`.                                      |
| **Popover**        | Anchored panel with click, focus, or hover trigger. Directive: `[nxrPopover]="templateRef"`. 12 placements, optional arrow.                                    |
| **Tooltip**        | Short text/content on hover/focus. Directive: `nxrTooltip="text"`. Optional arrow, delay, viewport clamping.                                                   |
| **Snackbar**       | Toasts at viewport edges. Service: `SnackbarService.open(componentOrTemplate, options)`. Stacking, optional auto-close, replace-by-group.                      |
| **Interactions**   | Focus trap directive for modals.                                                                                                                               |
| **Dropdown**       | Shared open/close and trigger behavior for select, menu, combobox.                                                                                             |
| **Listbox**        | Keyboard, selection, listbox/menu roles; used by select, menu, combobox.                                                                                       |
| **Select**         | Single/multi value dropdown with CVA.                                                                                                                          |
| **Combobox**       | Input-driven search and selection with CVA.                                                                                                                    |
| **Menu**           | Action menus (`role="menu"`); activation callbacks, no field value.                                                                                            |
| **Mention**        | Contenteditable mention trigger and caret-anchored suggestions.                                                                                                |
| **Core**           | DOM, env, id, events, animation, layout, debug utilities. No UI; used by all headless libs.                                                                    |

### Roadmap ([HEADLESS-COMPONENTS-PLAN.md](HEADLESS-COMPONENTS-PLAN.md))

Autocomplete, command palette, mega/tiered/context menus, menu bar, date/time/color pickers, confirm popup, tree select, cascade select, and optional programmatic popover APIs.

## Tech stack and tools

| Category            | Tool / version                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| **Framework**       | Angular (v21 in use). Standalone components/directives, signals, modern control flow.          |
| **Monorepo**        | Nx. Apps and libs are Nx projects. Use `nx run <project>:<target>` for build, test, lint, e2e. |
| **Package manager** | npm (`package-lock.json`; CI uses `npm ci`).                                                   |
| **Linting**         | ESLint (angular-eslint). Run via `nx run-many -t lint`.                                        |
| **Formatting**      | Prettier. Config in `.prettierrc`.                                                             |
| **Styles**          | Stylelint for CSS/SCSS.                                                                        |
| **Testing**         | Vitest (per lib, with Angular test setup where configured). Playwright for E2E (`demo-e2e`).   |
| **E2E**             | `nx run demo-e2e:e2e`. Run `npx playwright install` once for browsers.                         |

## Repository layout

```
nexora/
├── apps/
│   ├── demo/           # Demo Angular app (headless primitives + pages)
│   └── demo-e2e/       # Playwright E2E tests
├── libs/headless/
│   ├── core/           # @nexora-ui/core
│   ├── overlay/        # @nexora-ui/overlay — dialogs, drawers, overlay engine
│   ├── popover/        # @nexora-ui/popover
│   ├── tooltip/        # @nexora-ui/tooltip
│   ├── snackbar/       # @nexora-ui/snackbar
│   ├── interactions/   # @nexora-ui/interactions — focus trap
│   ├── dropdown/       # @nexora-ui/dropdown — shared dropdown primitive
│   ├── listbox/        # @nexora-ui/listbox
│   ├── select/         # @nexora-ui/select
│   ├── combobox/       # @nexora-ui/combobox
│   ├── menu/           # @nexora-ui/menu
│   └── mention/        # @nexora-ui/mention
├── docs/               # Architecture, behavior, API design, roadmap
└── ...                 # Nx config, ESLint, Prettier, Husky, commitlint
```

## How to run things

- **Demo app**: `npm run serve` or `npx nx run demo:serve`.
- **Unit tests**: `npx nx run-many -t test -p core,overlay,popover,tooltip,snackbar,interactions,dropdown,listbox,listbox-cdk,select,combobox,menu,mention` (or per project: `nx test overlay`).
- **Lint**: `npx nx run-many -t lint` or per project.
- **E2E**: `npx playwright install` once, then `npx nx run demo-e2e:e2e`.
- **Build**: `npx nx run-many -t build` for all libs/apps.

## Docs index

- **[HEADLESS.md](HEADLESS.md)** — How headless libs fit together, conventions, RTL, accessibility, public API stability.
- **[HEADLESS-COMPONENTS-PLAN.md](HEADLESS-COMPONENTS-PLAN.md)** — Roadmap: implemented vs planned components.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Architecture guidelines (dependencies, structure, reuse).
- **[CLEAN-CODE.md](CLEAN-CODE.md)** — Naming, formatting, types, tests.
- **[ANGULAR-GUIDELINES.md](ANGULAR-GUIDELINES.md)** — Signals, effects, zoneless, standalone, a11y.
- **[PROJECT-OVERVIEW.md](PROJECT-OVERVIEW.md)** — This file.
- **[PUBLIC-API-DESIGN.md](PUBLIC-API-DESIGN.md)** — How to design simple, stable public APIs.
- **[HEADLESS-BEHAVIOR.md](HEADLESS-BEHAVIOR.md)** — Required behavior for dialog, drawer, popover, tooltip, snackbar.
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** — Focus, ARIA, keyboard, reduced motion, RTL.
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Common issues and fixes.
- **[TESTING.md](TESTING.md)** — Unit (Vitest) and E2E (Playwright).
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Local setup and commands.
- **[API-CONTRACTS.md](API-CONTRACTS.md)** — Stable vs internal APIs.
- **[MIGRATION.md](MIGRATION.md)** — Upgrade and breaking-change notes.
- **[PERFORMANCE.md](PERFORMANCE.md)** — Performance guidance.
- **[SECURITY.md](SECURITY.md)** — Security model and boundaries.
