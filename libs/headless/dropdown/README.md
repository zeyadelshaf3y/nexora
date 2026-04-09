# @nexora-ui/dropdown

Shared dropdown primitive for trigger + anchored panel behavior. Used by **Select**, **Menu**, and **Combobox** to avoid duplicating overlay lifecycle, trigger keyboard handling, focus restore, and resize observation.

**Public API:** Exports from `src/index.ts` are the supported surface ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)).

## What it provides

- **DropdownRef** — Create with `DropdownRef.create(options)`. Methods:
  - `open(portal)` — Build config, create overlay, attach portal, subscribe to afterClosed, run onOpened, start resize observer when `matchTriggerWidth` is true.
  - `close(reason?)` — Close the overlay.
  - `isOpen()` — Whether the panel is open.
  - `handleTriggerKeydown(event, forwardToPanel?)` — When open: Tab → close and skip focus restore; Escape → close; else call `forwardToPanel(event)`. When closed, does nothing (caller handles OPEN_KEYS and opening).
  - `destroy()` — Dispose overlay and teardown. Call when the consumer component is destroyed.
  - `getOverlayRef()` — Current overlay ref when open (e.g. for focusing panel content).
- **Constants** — `OPEN_KEYS`, `SCROLL_STRATEGY_MAP`, `DEFAULT_OFFSET`, `DEFAULT_MAX_HEIGHT`, `DEFAULT_CLOSE_ANIMATION_MS`.
- **Types** — `DropdownRefOptions`, `DropdownOption`, `DropdownConfigPreset`, `DropdownScrollStrategy`.
- **Shared state utilities**:
  - `canOpenDropdown`, `applyOpenedTransition`, `applyClosedTransition` — common open/close transition primitives for select/menu/combobox-style controllers.
  - `shouldQueueSkipNextOpenOnFocus`, `shouldRefocusAfterSelectionClose` — shared close policy predicates used by trigger-input controllers.
  - `getEmptySelectionValue`, `normalizeSingleOrMultiValue`, `hasSelectionValue`, `toSelectedValuesArray` — shared value normalization and selection-shape helpers for single/multi components.

**Config preset** — `configPreset?: 'dropdown' | 'menu'` in options. When `'menu'`, the ref uses overlay’s `createMenuAnchoredConfig` (placement default bottom-start, full 12-position fallbacks). When `'dropdown'` or omitted, it uses `createDropdownAnchoredConfig` (placement default bottom, vertical fallbacks only). Select omits the option and gets dropdown behavior; Menu passes `configPreset: 'menu'`.

## API reference

| Export                                    | Kind     | Description                                                                                                                                                                                                                             |
| ----------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DropdownRef`                             | class    | Overlay lifecycle wrapper for dropdown-like components.                                                                                                                                                                                 |
| `DropdownRefOptions`                      | type     | Option contract for `DropdownRef.create`.                                                                                                                                                                                               |
| `DropdownOption`                          | type     | Value-or-getter type used by options.                                                                                                                                                                                                   |
| `DropdownConfigPreset`                    | type     | `'dropdown' \| 'menu'` preset selector.                                                                                                                                                                                                 |
| `DropdownScrollStrategy`                  | type     | Supported strategy keys for dropdown overlays.                                                                                                                                                                                          |
| `OPEN_KEYS`                               | const    | Keys that should open a closed dropdown trigger.                                                                                                                                                                                        |
| `SCROLL_STRATEGY_MAP`                     | const    | Strategy key -> overlay scroll strategy factory map.                                                                                                                                                                                    |
| `DEFAULT_OFFSET`                          | const    | Default trigger/panel gap in px.                                                                                                                                                                                                        |
| `DEFAULT_MAX_HEIGHT`                      | const    | Default panel max height.                                                                                                                                                                                                               |
| `DEFAULT_CLOSE_ANIMATION_MS`              | const    | Default close animation duration.                                                                                                                                                                                                       |
| `handleClosedTriggerOpenKey`              | function | Shared keydown helper for open-on-key behavior while closed.                                                                                                                                                                            |
| `routeHeadlessDropdownTriggerKeydown`     | function | Routes trigger `keydown` when closed (`OPEN_KEYS` + open) vs open (`DropdownRef.handleTriggerKeydown` + listbox forwarder). Used by **select** and **menu**.                                                                            |
| `resolveDisplayLabel`                     | function | Resolves display label with accessors and fallback behavior.                                                                                                                                                                            |
| `computeDisplayValue`                     | function | Computes trigger display text/value from selected option(s).                                                                                                                                                                            |
| `DisplayLabelAccessor`                    | type     | Label accessor signature used by display helpers.                                                                                                                                                                                       |
| `canOpenDropdown`                         | function | Shared open-guard utility for root components.                                                                                                                                                                                          |
| `applyOpenedTransition`                   | function | Shared opened-state transition utility.                                                                                                                                                                                                 |
| `applyClosedTransition`                   | function | Shared closed-state transition utility.                                                                                                                                                                                                 |
| `shouldQueueSkipNextOpenOnFocus`          | function | Shared policy helper for focus-driven reopen behavior.                                                                                                                                                                                  |
| `shouldRefocusAfterSelectionClose`        | function | Shared focus-restore predicate after selection close.                                                                                                                                                                                   |
| `getEmptySelectionValue`                  | function | Normalizes empty value by selection mode.                                                                                                                                                                                               |
| `normalizeSingleOrMultiValue`             | function | Normalizes incoming single/multi model values.                                                                                                                                                                                          |
| `hasSelectionValue`                       | function | Whether a single/multi model value is non-empty.                                                                                                                                                                                        |
| `toSelectedValuesArray`                   | function | Model value as `readonly T[]` for chips / iteration.                                                                                                                                                                                    |
| `mergeDropdownPaneClasses`                | function | `[basePaneClass, ...userClasses]` for overlay `panelClass` (used by select/menu/combobox).                                                                                                                                              |
| `mergeVirtualDropdownPaneStyle`           | function | Flex-column `panelStyle` when the list scrolls inside a child (e.g. CDK virtual viewport). Pass `paneBlockSize` equal to overlay `maxHeight` so the pane has a definite height.                                                         |
| `createListboxVirtualDropdownPanelStyle`  | function | Factory for combobox/select `panelStyle`: calls `mergeVirtualDropdownPaneStyle` with `useVirtualPanel`, `panelStyle`, and `maxHeight` getters.                                                                                          |
| `ListboxVirtualDropdownPanelStyleSources` | type     | Option object for `createListboxVirtualDropdownPanelStyle`.                                                                                                                                                                             |
| `buildHeadlessDropdownRefOptions`         | function | Builds `DropdownRefOptions` for select/combobox/menu: merges `basePaneClass` with user `panelClass`, virtual pane style when `useVirtualPanel` is true, optional `getFocusRestoreTarget`, optional `configPreset` / `arrowSize` (menu). |
| `HeadlessDropdownRefOptionsInput`         | type     | Inputs for `buildHeadlessDropdownRefOptions`. **`boundaries`** is optional (omit for overlay defaults).                                                                                                                                 |
| `teardownAnchoredDropdownHostState`       | function | Shared destroy sequence for hosts that mirror `DropdownRef` with a listbox ref and open signal (select, combobox, menu).                                                                                                                |

**Virtual list overlays:** Select and combobox use `buildHeadlessDropdownRefOptions` (which uses `createListboxVirtualDropdownPanelStyle`) when built-in virtual mode is on, together with `@nexora-ui/listbox-cdk` layout tokens on inner hosts. Custom virtual panels should apply the same pattern or the viewport can measure **0px** under a `max-height`-only pane—see [listbox-cdk README](../listbox-cdk/README.md).

## Direct use vs higher-level components

- Use `@nexora-ui/select`, `@nexora-ui/menu`, or `@nexora-ui/combobox` for full end-user behavior.
- Use `@nexora-ui/dropdown` directly when building a custom trigger + anchored panel control that still needs shared overlay lifecycle and keyboard-close policy.
- Prefer direct usage for internal primitives and custom composite widgets where the higher-level components are too opinionated.

## Tree-shaking

The package is built with `sideEffects: false`. Import only what you use (e.g. `DropdownRef` and `OPEN_KEYS`); bundlers can drop unused exports.

## Dependencies

- `@nexora-ui/core` — safeFocus, observeResize, createRafThrottled.
- `@nexora-ui/overlay` — OverlayService, createDropdownAnchoredConfig, createMenuAnchoredConfig, Portal, CloseReason, getContainingOverlayRef.

## Usage

Consumers (e.g. Select, Menu) inject `OverlayService`, create a `DropdownRef` with options (getAnchor, overlay, optional `configPreset`, placement, offset, matchTriggerWidth, scrollStrategy, beforeOpen, beforeClose, onOpened, onClosed, panel styling), and:

- On open: build the panel portal (e.g. ComponentPortal), call `dropdownRef.open(portal)`.
- On close: `dropdownRef.close(reason)`.
- On trigger keydown: when closed and key in OPEN_KEYS, call open(portal); when open, call `dropdownRef.handleTriggerKeydown(ev, (e) => listbox.handleKeydown(e))`.
- On destroy: `dropdownRef.destroy()`.

Resolution and config building live in **`dropdown-ref-overlay-config.ts`** (`resolveDropdownOverlayOptions`, `buildDropdownOverlayConfig`), which call overlay’s `createDropdownAnchoredConfig` / `createMenuAnchoredConfig` by `configPreset`. Option types are in **`dropdown-ref-options.ts`**.

Typed example:

```ts
const ref = DropdownRef.create({
  overlay,
  getAnchor: () => triggerEl,
  configPreset: 'dropdown',
  placement: () => 'bottom-start',
  offset: 8,
  matchTriggerWidth: true,
  onClosed: (_reason) => {
    /* e.g. analytics */
  },
});
```

## See also

- [DROPDOWNS.md](../../../docs/DROPDOWNS.md) — select vs combobox patterns.
- [HEADLESS.md](../../../docs/HEADLESS.md) — how headless packages fit together.
