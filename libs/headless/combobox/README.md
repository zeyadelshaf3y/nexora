# @nexora-ui/combobox

Headless, accessible combobox for Angular. Input + dropdown with search; single or multi selection. Composes `@nexora-ui/listbox` and `@nexora-ui/overlay` (via `@nexora-ui/dropdown`). Zero opinionated styles — you own the list, filtering, and all markup/CSS.

**Public API:** Exports from `src/index.ts` are the supported surface ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)).

## Features

- **Single and multi-select** with distinct behavior: single shows selected label in input and separates “display” from “filter” (reopen shows full list); multi uses input for search only, selected values as chips/tags
- Two-way `[(value)]`; filter query via `(searchChange)` or `#combo.search()`
- User owns the options list and filtering (sync or async); no `options` on the component
- Full keyboard (Arrow keys, Enter, Space when open, Escape, typeahead) and ARIA combobox semantics; when the panel is **closed**, Space does **not** open it (so the key can insert a space in the input)
- CVA; `displayValue()`, `hasValue()`, `selectedValues()` (for chips/iteration), `open()`/`close()`/`toggle()`, `select()`/`unselect()`/`reset()`, `setSearchQuery()`/`clearSearchQuery()`, `disable()`/`enable()` (`disable()` closes the panel with `programmatic` if open), `focusInput()`
- Same overlay/panel options as Select (placement, scrollStrategy, hasBackdrop, panelClass, beforeOpen/beforeClose, etc.)
- Optional toggle, clear, and anchor directives; focus restores to input on close
- RTL supported via overlay and listbox

## Installation

```bash
npm install @nexora-ui/combobox @nexora-ui/listbox @nexora-ui/dropdown @nexora-ui/overlay @nexora-ui/core
```

## Quick start

```html
<nxr-combobox
  [(value)]="selected"
  (searchChange)="filterQuery.set($event)"
  [accessors]="accessors"
  placeholder="Search…"
  #combo="nxrCombobox"
>
  <input nxrComboboxInput placeholder="Search…" autocomplete="off" />
  <button type="button" nxrComboboxToggle aria-label="Open">▼</button>
  <ng-template nxrComboboxPanel>
    @for (opt of filteredOptions(); track getKey(opt)) {
    <div nxrComboboxOption [value]="opt">{{ getLabel(opt) }}</div>
    }
  </ng-template>
</nxr-combobox>
```

```ts
filterQuery = signal('');
filteredOptions = computed(() => filterByQuery(items(), filterQuery(), getLabel));
```

Use `filterQuery` (or `combo.search()`) to filter options. In single mode, the effective filter is empty when not typing, so reopening after selection shows the full list.

## Directives

| Directive                                                           | Purpose                                                                                                         |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `nxr-combobox`                                                      | Root component (value, search, CVA, overlay).                                                                   |
| `nxrComboboxInput`                                                  | Search input; syncs with combobox search (keydown, ARIA; use `(searchChange)` or `#combo.search()` for filter). |
| `nxrComboboxToggle`                                                 | Optional; toggles panel.                                                                                        |
| `nxrComboboxPanel`                                                  | On `<ng-template>`; panel content.                                                                              |
| `nxrComboboxOption`                                                 | Option; use `[value]="item"` or `[nxrComboboxOption]="item"`.                                                   |
| `nxrComboboxGroup`, `nxrComboboxGroupLabel`, `nxrComboboxSeparator` | Grouping (same as listbox/select).                                                                              |
| `nxrComboboxClear`                                                  | Clears value; optional `[clearSearch]="true"`.                                                                  |
| `nxrComboboxAnchor`                                                 | Optional; overlay anchors to this element instead of host.                                                      |

## API summary

- **Inputs:** `[(value)]`, `[multi]`, `[accessors]`, `[compareWith]`, `[placeholder]`, `[initialHighlight]`, `[disabled]`, `[required]`, optional **`virtualScroll` / `virtualItems` / `virtualItemSize` / `virtualTrackByKey` / `virtualEmptyMessage`**, plus overlay options (`placement`, `hasBackdrop`, `panelClass`, `scrollStrategy`, `beforeOpen`, `beforeClose`, `closeAnimationDurationMs`, etc.).
- **Outputs:** `valueChange`, `searchChange` (effective filter query for option filtering), `opened`, `closed(reason)`.
- **Controller** (`#combo="nxrCombobox"`): `open()`, `close()`, `toggle()`, `select()`/`unselect()`/`reset()`, `setSearchQuery()`/`clearSearchQuery()`, `disable()`/`enable()`, `focusInput()`, `isSelected()`, `displayValue()`, `hasValue()`, `selectedValues()` (array for chips/iteration), `isOpen`, `value`, `search` (effective filter query), etc.

### Styling hooks

| Hook                       | Type                     | Applies to       | Notes                                                           |
| -------------------------- | ------------------------ | ---------------- | --------------------------------------------------------------- |
| `panelClass`               | `string \| string[]`     | Overlay pane     | Preferred for reusable themes and animations.                   |
| `panelStyle`               | `Record<string, string>` | Overlay pane     | Inline one-off style overrides.                                 |
| `backdropClass`            | `string \| string[]`     | Backdrop element | Used when `hasBackdrop` is enabled.                             |
| `backdropStyle`            | `Record<string, string>` | Backdrop element | Inline one-off backdrop style overrides.                        |
| `hasBackdrop`              | `boolean`                | Overlay behavior | Enables backdrop and outside-click/backdrop close path.         |
| `maxHeight`                | `string`                 | Overlay pane     | Caps panel size (also drives built-in virtual viewport height). |
| `matchTriggerWidth`        | `boolean`                | Overlay pane     | Keeps pane width aligned to trigger width when enabled.         |
| `offset`                   | `number`                 | Anchor gap       | Vertical/horizontal gap between trigger anchor and pane.        |
| `openPanelOnFocus`         | `boolean`                | Open behavior    | When `true` (default), focusing input opens panel.              |
| `scrollStrategy`           | `ComboboxScrollStrategy` | Open lifecycle   | `'noop'`, `'reposition'`, `'block'`, `'close'`.                 |
| `maintainInViewport`       | `boolean`                | Reposition logic | Keeps pane clamped while repositioning.                         |
| `boundaries`               | `ViewportBoundaries`     | Reposition logic | Insets used for viewport clamping and max-size calculations.    |
| `beforeOpen`               | `BeforeOpenCallback`     | Open lifecycle   | Return `false` to prevent open.                                 |
| `beforeClose`              | `BeforeCloseCallback`    | Close lifecycle  | Return `false` to prevent close.                                |
| `closeAnimationDurationMs` | `number`                 | Close lifecycle  | Delay detach to allow exit animation (default `150`).           |

## API reference

| Export                                | Kind      | Description                                                              |
| ------------------------------------- | --------- | ------------------------------------------------------------------------ |
| `ComboboxComponent`                   | component | Root combobox component and controller API (`nxrCombobox`).              |
| `ComboboxInputDirective`              | directive | Input synchronization and keyboard integration.                          |
| `ComboboxToggleDirective`             | directive | Optional toggle trigger for panel open/close.                            |
| `ComboboxPanelDirective`              | directive | Marks panel template (`<ng-template>`).                                  |
| `ComboboxOptionDirective`             | directive | Registers selectable option entries.                                     |
| `ComboboxClearDirective`              | directive | Clears current selection (and optionally search).                        |
| `ComboboxAnchorDirective`             | directive | Uses external anchor for overlay positioning.                            |
| `NXR_COMBOBOX`                        | token     | Injection token for accessing combobox controller from child directives. |
| `ComboboxController`                  | type      | Controller interface exposed by the root component.                      |
| `ComboboxAccessors` and related types | types     | Selection key/label extraction and compare contracts.                    |

For CVA/forms writes, value shape is normalized consistently:

- single mode: `null`/`undefined` -> `null`
- multi mode: `null`/`undefined` -> `[]`

Patterns and comparisons: [DROPDOWNS.md](../../../docs/DROPDOWNS.md), [COMBOBOX-VS-AUTOCOMPLETE.md](./COMBOBOX-VS-AUTOCOMPLETE.md). Roadmap: [HEADLESS-COMPONENTS-PLAN.md](../../../docs/HEADLESS-COMPONENTS-PLAN.md).

## Performance and large lists

Filter options in the consumer using the `search` query (or `searchChange`) so only matching items are rendered. For large lists (see `LARGE_LIST_ITEM_THRESHOLD` in constants), consider:

- **Filtering**: Only render options that pass the current filter; avoid rendering the full list when the user has typed.
- **Pagination / load-more**: Render a capped subset and load more on scroll or button click.

### Built-in CDK virtual mode

When **`[virtualScroll]="true"`** and **`[virtualItems]`** is set (required), the combobox uses **`@nexora-ui/listbox-cdk`** internally: a fixed-size CDK viewport, listbox virtual-scroll handler for keyboard nav, initial scroll-to-selection after open, and no custom **`nxrComboboxPanel`** template for the list body (a redundant panel template is ignored in dev mode). The list viewport height comes from **`[maxHeight]`** (default `16rem`) into the panel’s **`viewportMaxHeight`**—override `maxHeight` if you need a taller or shorter list. **`createListboxVirtualDropdownPanelStyle`** (from `@nexora-ui/dropdown`) plus listbox-cdk’s overlay flex layout keep the pane and hosts sized so **`fillAvailableHeight`** does not collapse to zero.

| Input                 | Purpose                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `virtualScroll`       | Enable built-in virtual list.                                                                                                                                                                                                                                                                                                                  |
| `virtualItems`        | Full logical array (e.g. filtered by `search()` / `searchChange`).                                                                                                                                                                                                                                                                             |
| `virtualItemSize`     | Row height in px (default `40`).                                                                                                                                                                                                                                                                                                               |
| `virtualTrackByKey`   | Optional stable key per row; when omitted, **combobox** defaults to `accessors().value` if `accessors` is set (aligned with listbox default identity), otherwise object identity. If **`compareWith`** is not equivalent to comparing **`accessors.value`**, set **`virtualTrackByKey`** explicitly so virtual index lookup matches selection. |
| `virtualEmptyMessage` | Shown when `virtualItems` is an empty array (default `No results`).                                                                                                                                                                                                                                                                            |

**Multi-select + virtual:** Initial open scrolls to the **first** `virtualItems` row that matches **any** selected value (list order). For highly custom multi UX (e.g. scroll to last selected), use a custom **`nxrComboboxPanel`**.

**Filtering:** Derive `virtualItems` from the same effective query as the combobox (e.g. `#combo.search()` in the template) so reopening after selection does not leave a stale filtered list. See the demo “Large list” example.

**Custom row + chrome (optional):** Next to the trigger, add `ng-template` slots (import **`ComboboxVirtualOptionTemplateDirective`** and related exports from this package — they re-export shared directives from **`@nexora-ui/listbox-cdk`**, which also powers **`nxrSelectVirtual*`** on select):

- **`ng-template nxrComboboxVirtualOption let-item`** — row body; implicit context is the option value. **`virtualItemSize`** must match the row’s total block height (padding included).
- **`ng-template nxrComboboxVirtualHeader`** — content above the CDK viewport (not listbox options).
- **`ng-template nxrComboboxVirtualFooter`** — content below the viewport.

When **`nxrComboboxVirtualOption`** is omitted, rows use **`accessors.label`** (via internal `labelFor`) as today. Layout uses **`nxr-builtin-virtual-dropdown-panel`** from **`@nexora-ui/listbox-cdk`** (shell + CDK viewport). Portal wiring and virtual index helpers used by this component live in **`@nexora-ui/listbox-cdk/internal`**.

**Controller (`#combo="nxrCombobox"`):** `virtualScroll()` and `virtualEmptyMessage()` are exposed for conditional UI; see [PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md).

**Custom virtual UI:** You can still put CDK virtual scroll inside **`nxrComboboxPanel`** yourself when not using `virtualScroll` + `virtualItems`; see [@nexora-ui/listbox-cdk README](../listbox-cdk/README.md) and the listbox virtual-scroll section in [@nexora-ui/listbox README](../listbox/README.md).

The combobox does not impose a list size limit; you own filtering and data.

## Implementation notes (contributors)

Focused modules under `src/lib/internal/` complement `combobox.component.ts`: **`buildComboboxDropdownRefOptions`** (thin wrapper around `@nexora-ui/dropdown` **`buildHeadlessDropdownRefOptions`** + combobox pane class), **`buildComboboxOverlayPanelContext`**, **`multiSelectionRemovingEquivalentItems`**, **`tryComboboxMultiBackspaceRemoveLast`**, plus focus/display/close/search-state helpers. They are not re-exported from the package root. **`disable()`** closes the panel with reason `programmatic` when open, then applies programmatic disable (same as select/menu).

## Running unit tests

Run `nx test combobox` to execute the unit tests.
