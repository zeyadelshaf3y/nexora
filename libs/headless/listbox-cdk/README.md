# @nexora-ui/listbox-cdk

CDK virtual-scroll list panel used by **combobox** and **select** in built-in virtual mode. Registers with `NxrListboxVirtualScrollRegistry` so keyboard navigation targets the full logical list while the DOM stays windowed.

## Package layout

| Area                          | Path                  | Role                                                                                          |
| ----------------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| **Public components**         | `src/lib/components/` | `ListboxCdkVirtualPanelComponent`, built-in shell / dropdown, template directives             |
| **Overlay flex tokens**       | `src/lib/layout/`     | Shared `nxr-listbox-cdk-overlay-flex-column` styles (pane + hosts need a definite flex chain) |
| **Portal**                    | `src/lib/portal/`     | `createListboxOverlayPanelPortal`                                                             |
| **Stateless virtual helpers** | `src/lib/virtual/`    | Selection index math, scroll alignment, LRU labels, first-paint scheduling                    |

**Root entry** (`@nexora-ui/listbox-cdk`): components + `NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS` for advanced styling.

**Internal entry** (`@nexora-ui/listbox-cdk/internal`): portal, signals factory, scroll/index utilities, `afterVirtualPanelFirstPaint`. See [internal/README.md](./internal/README.md).

Peers: `@nexora-ui/listbox`, `@angular/cdk`, `@nexora-ui/overlay` (portal).

## When you use this

- **Default:** `virtualScroll` + `virtualItems` on `<nxr-combobox>` / `<nxr-select>` — they host `nxr-builtin-virtual-dropdown-panel` and wire overlay + listbox. Row/header/footer templates: `nxrComboboxVirtual*` / `nxrSelectVirtual*`.
- **Custom panel:** embed `nxr-listbox-cdk-virtual-panel` only with `NxrListboxOverlayPanelHostComponent`’s injector (`NXR_LISTBOX_CONTROLLER`, `NxrListboxVirtualScrollRegistry`). Import the host/context symbols from `@nexora-ui/listbox/internal`, use **`childOwnsScroll: true`**, and:
  - **`viewportMaxHeight`** aligned with overlay `maxHeight`
  - **`fillAvailableHeight`** when the parent is a flex column under a capped pane
  - **`mergeVirtualDropdownPaneStyle`** + **`createListboxVirtualDropdownPanelStyle`** (from `@nexora-ui/dropdown`) on the pane so `max-height` alone does not collapse flex children to 0
  - Optional: reuse **`NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS`** on your hosts to match the built-in shell

## Component inputs

| Input                  | Purpose                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`                | Logical array (e.g. filtered options).                                                                                                              |
| `itemSize`             | Row height in px (default `40`). Must match rendered row CSS.                                                                                       |
| `initialSelectedIndex` | When ≥ 0, scrolls after layout and sets active option.                                                                                              |
| `viewportMaxHeight`    | Viewport `max-height` (default `200px`). With `fillAvailableHeight`, caps a flex-grown viewport.                                                    |
| `fillAvailableHeight`  | Host joins the overlay flex column; viewport fills remaining space in the shell.                                                                    |
| `labelFor`             | Stable `(item) => string` reference preferred so the label LRU is not cleared every CD cycle.                                                       |
| `trackByKey`           | Stable key per row; built-in combobox/select default to `accessors().value` when `virtualTrackByKey` is omitted. Duplicate keys → first index wins. |
| `emptyMessage`         | Empty state copy (`role="status"`, `aria-live="polite"`).                                                                                           |
| `optionTemplate`       | `TemplateRef` context `{ $implicit: item }`; `labelFor` still used where the listbox needs text.                                                    |

## Behavior notes

- **First paint:** `afterVirtualPanelFirstPaint` runs `checkViewportSize` after `afterNextRender` and again on the next frame when syncing initial selection — portaled viewports often measure 0×0 on the first tick.
- **ResizeObserver** on the viewport is coalesced to one `checkViewportSize` per animation frame (`createRafThrottled` from `@nexora-ui/core`).
- **`getCurrentIndex`** uses a map from `items` + `trackByKey` (O(1) per lookup).
- **Labels:** bounded LRU (512 entries); invalidates when `items` reference or `labelFor` identity changes.
- **“Nearest” scroll:** uses overlap with the listbox found from `viewport.parentElement.closest('[role="listbox"]')` so header/footer chrome does not fake “fully visible” rows.

## Installation

```bash
npm install @nexora-ui/listbox-cdk @nexora-ui/listbox @angular/cdk
```

## Tests

```bash
nx test listbox-cdk
```
