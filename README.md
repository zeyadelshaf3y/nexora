# Nexora

Headless UI primitives for Angular. Unstyled, accessible building blocks you style and compose yourself. Tree-shakable: import only what you use.

## Packages

| Package                                                             | Description                                                                                                                               |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [**@nexora-ui/headless**](libs/headless/headless/README.md)         | Meta package that installs all published `@nexora-ui/*` headless libraries for users who want the full set.                               |
| [**@nexora-ui/overlay**](libs/headless/overlay/README.md)           | Overlay system: dialogs (9 positions), drawers (4 positions), anchored strategy for popovers. Scroll/focus strategies, optional arrow.    |
| [**@nexora-ui/popover**](libs/headless/popover/README.md)           | Popover: open a panel anchored to a trigger. Trigger: click, focus, or hover. 12 placements, optional arrow.                              |
| [**@nexora-ui/tooltip**](libs/headless/tooltip/README.md)           | Tooltip: short content on hover/focus; optional arrow and delays.                                                                         |
| [**@nexora-ui/snackbar**](libs/headless/snackbar/README.md)         | Snackbar: open at viewport edges, stack by placement. Template or component content, optional auto-close, replace-by-group via `groupId`. |
| [**@nexora-ui/dropdown**](libs/headless/dropdown/README.md)         | Shared dropdown lifecycle: open/close, trigger keyboard, focus restore. Used by select, menu, combobox.                                   |
| [**@nexora-ui/listbox**](libs/headless/listbox/README.md)           | Listbox primitive: keyboard, selection, listbox/menu role. Shared by select, menu, combobox.                                              |
| [**@nexora-ui/select**](libs/headless/select/README.md)             | Select: headless dropdown single/multi with listbox, value binding, CVA.                                                                  |
| [**@nexora-ui/combobox**](libs/headless/combobox/README.md)         | Combobox: input + dropdown, search, single/multi, CVA.                                                                                    |
| [**@nexora-ui/menu**](libs/headless/menu/README.md)                 | Menu: actions with `role="menu"`, no value binding.                                                                                       |
| [**@nexora-ui/mention**](libs/headless/mention/README.md)           | Mention: trigger in contenteditable, caret-anchored panel, insertion.                                                                     |
| [**@nexora-ui/core**](libs/headless/core/README.md)                 | Utilities: DOM, environment, ids, events, animation, layout, debug (SSR-safe where relevant).                                             |
| [**@nexora-ui/interactions**](libs/headless/interactions/README.md) | Focus trap and related helpers for modal surfaces.                                                                                        |

**Roadmap (overlay-based):** Autocomplete, command palette, mega/tiered/context menus, menu bar, date/time/color pickers, confirm popup, tree select, cascade select, and related primitives. See [HEADLESS-COMPONENTS-PLAN.md](docs/HEADLESS-COMPONENTS-PLAN.md).

Install either one package (e.g. `npm i @nexora-ui/mention`) or all headless primitives at once (`npm i @nexora-ui/headless`).

## Quick start

1. **Overlay view container** (required for overlay, snackbar, etc.): put `nxrOverlayViewContainer` on a parent (e.g. app root) so you don’t pass `viewContainerRef` every time.

   ```html
   <div nxrOverlayViewContainer>
     <!-- your app -->
   </div>
   ```

2. **Dialog / drawer**: inject `DialogService` or `DrawerService`, call `open(templateOrComponent, options)`. See [overlay README](libs/headless/overlay/README.md).

3. **Popover**: `[nxrPopover]="templateRef"` on the trigger. See [popover README](libs/headless/popover/README.md).

4. **Snackbar**: inject `SnackbarService`, call `open(templateOrComponent, { placement, duration, groupId?, ... })`. See [snackbar README](libs/headless/snackbar/README.md).

## Run demo

```sh
npm run serve
# or: npx nx run demo:serve
```

## Build / test

```sh
npx nx run-many -t build
npx nx run-many -t test
```

## Docs

- **[Headless libraries overview](docs/HEADLESS.md)** — How the headless libs fit together, conventions, RTL, accessibility, and public API stability.
- **[Documentation index](docs/HEADLESS.md#documentation-index)** — Architecture, clean code, Angular guidelines, public API design, required behavior, glossary, testing, development.

## Nx

This workspace is powered by [Nx](https://nx.dev). Use `npx nx <target> <project>` (e.g. `npx nx build overlay`) and see the [Nx docs](https://nx.dev) for more.
