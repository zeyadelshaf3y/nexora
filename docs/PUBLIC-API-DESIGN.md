# Public API Design

Principles for designing the **user-facing** API of Nexora headless libraries. The goal is a **simple, predictable** API: minimal concepts, options over many parameters, and clear lifecycle.

## Design principles

1. **Simple entry points**: One primary way to do the common thing (e.g. open a dialog, show a tooltip).
2. **Options objects**: Use a single options object for configuration instead of long parameter lists.
3. **Sensible defaults**: Power users can override; new users get good behavior without reading the whole API.
4. **Stable contracts**: Public types and method signatures are stable; avoid breaking changes in minor/patch. Document what is internal vs stable.

## Service APIs (Dialog, Drawer, Snackbar)

### Open signature

- **Single method**: `open(content, options?)`. Content is either a `TemplateRef` or a component `Type`. No separate “openTemplate” / “openComponent” unless there is a strong reason.
- **Options**: One object. All optional except when the service has a required concern (e.g. snackbar placement can default to `'bottom-end'`). Extend a shared base type (e.g. `ContentOpenOptionsBase`) for common fields: `viewContainerRef`, `injector`, `beforeOpen`, `beforeClose`, `parentRef`, `host`, `outsideClickBoundary`, `zIndex`, plus panel styling.
- **Return**: `Promise<OverlayRef | null>` (or `SnackbarRef` for snackbar). `null` when open was cancelled (e.g. `beforeOpen` returned false). Await the promise to get the ref; then use `ref.afterClosed()`, `ref.close()`, etc.

### Example (target style)

```ts
// User code
const ref = await this.dialogService.open(MyDialogComponent, {
  placement: 'center',
  inputs: { title: 'Confirm' },
  outputs: { confirmed: (v) => this.onConfirm(v) },
});
ref?.afterClosed().subscribe(() => this.cleanup());
```

- No “mode” or “type” in the call; the service implies the type (dialog vs drawer vs snackbar).
- Overlay-specific options (placement, scroll, focus, backdrop) live in the options object with clear names (e.g. `placement`, `hasBackdrop`).

### Ref interface

- **Minimal surface**: `close()`, `afterClosed(): Observable<T>`, and pane access if needed (e.g. `getPaneElement()`). Snackbar adds `close(value)` / `dismiss(value)` so `afterClosed()` emits that value.
- **No internal types in the ref**: The ref is an interface; implementation details (stack, attach/detach) are not exposed. Document whether a method is stable.

## Directive APIs (Popover, Tooltip)

### Inputs

- **One main input** for the primary concern: e.g. `[nxrPopover]="templateRef"`, `nxrTooltip="text"`. Required.
- **Configuration via named inputs**: `nxrPopoverPlacement`, `nxrPopoverTrigger`, `nxrTooltipOpenDelay`, etc. All optional with documented defaults.
- **Naming**: Prefix with the directive name (`nxrPopover*`, `nxrTooltip*`) so it’s clear which directive they belong to.

### Outputs

- **Lifecycle events**: e.g. `nxrPopoverOpened`, `nxrPopoverClosed` (with close reason). Keep the set small; avoid overlapping events.

### Public state (template / programmatic)

- **Signals**: Expose `isOpen` and `paneId` (or similar) as signals so the template can bind (e.g. `aria-expanded`, “Open”/“Close” label). Use a template reference: `#ref="nxrPopover"` then `ref.isOpen()`.

### Example (target style)

```html
<button
  #popover="nxrPopover"
  [nxrPopover]="panelTpl"
  nxrPopoverPlacement="bottom-start"
  nxrPopoverTrigger="click"
  (nxrPopoverClosed)="onClose($event)"
>
  {{ popover.isOpen() ? 'Close' : 'Open' }}
</button>
```

- One directive, one clear trigger, options as inputs. No need to inject a “PopoverService” for the common case.

## Listbox, virtual scroll, and `@nexora-ui/listbox-cdk`

### Listbox primitive (`@nexora-ui/listbox`)

- **Stable**: `ListboxDirective`, `NxrListboxController`, `NXR_LISTBOX_VIRTUAL_SCROLL_HANDLER`, `NxrListboxVirtualScrollRegistry`, `NxrListboxVirtualScrollHandler`, `ListboxScrollAlignment`, **`scheduleListboxScrollActiveOnNextMicrotask`**, **`bindListboxReadyWithActiveScroll`**, and **`ListboxScrollActiveCapable`** (overlay `onListboxReady` scroll wiring), option/group directives, and types exported from the package index.
- **Virtual handler contract**: When a `NxrListboxVirtualScrollHandler` is registered, arrow keys and Home/End use **logical indices** (`getCurrentIndex`, `getCount`, `getItemAtIndex`, `scrollToIndex`). Optional **`resolveIndexForActive(active, sameItem)`** lets the listbox resolve an index when `getCurrentIndex` misses (e.g. value-equal active with a different object reference than the row in `virtualItems`). Custom CDK (or other) panels **should** implement it if they support `compareWith` / accessor identity beyond `trackByKey`.

### CDK virtual panel package (`@nexora-ui/listbox-cdk`)

- **Stable root exports** (`@nexora-ui/listbox-cdk`, see [listbox-cdk README](../libs/headless/listbox-cdk/README.md)): `ListboxCdkVirtualPanelComponent`; `BuiltinVirtualDropdownPanelComponent`; template directives (combobox/select re-export `nxrComboboxVirtual*` / `nxrSelectVirtual*`); **`NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS`** for custom panels that must match the built-in overlay flex chain.
- **Internal entry** (`@nexora-ui/listbox-cdk/internal`): portal factory, virtual selection computeds, viewport scroll helpers, **`afterVirtualPanelFirstPaint`**, and related types — for Nexora headless packages or custom controls; not required for typical app code.
- **Built-in wiring**: Combobox and select enable this via `virtualScroll` + `virtualItems`; they pass `trackByKey` (defaulting from `accessors().value` when unset) and forward empty-state copy via `virtualEmptyMessage` → panel `emptyMessage`.

### Combobox / select controllers

- **Display strings:** `computeDisplayValue` and `resolveDisplayLabel` are exported from **`@nexora-ui/dropdown`** (used by combobox and select internally). Do not expect them on `@nexora-ui/select`; import from dropdown for custom triggers.
- **Trigger keyboard:** **`routeHeadlessDropdownTriggerKeydown`** (`@nexora-ui/dropdown`) routes closed (`OPEN_KEYS`) vs open (`DropdownRef.handleTriggerKeydown`) for **select** and **menu** triggers; combobox uses input-specific keys.
- **Template ref controllers** (`ComboboxController`, `SelectController`) expose **`virtualScroll`** and **`virtualEmptyMessage`** as signals so consumers can branch UI (e.g. hints) without reaching into undocumented fields.
- **Select overlay parity**: `SelectComponent` supports **`boundaries`** (viewport inset) and **`disable()` / `enable()`** (programmatic disable) like combobox’s overlay/focus story, so both controls can share positioning and loading-state patterns. **`disable()`** closes an open panel with **`programmatic`** first, then applies programmatic disable (same for combobox and menu).

### Menu (`@nexora-ui/menu`)

- **`MenuController`** (template ref `#m="nxrMenu"`): `open` / `close` / `toggle`, `focusTrigger`, **`disable()` / `enable()`** (programmatic disable; **`disable()`** closes first if open), `isOpen`, `isDisabled`, `listboxId`, `activeOptionId`, `handleTriggerKeydown`. Component inputs include **`boundaries`**, **`displayArrow` / `arrowSize`**, and overlay knobs aligned with other anchored controls. See the [menu README](../libs/headless/menu/README.md).

### Dropdown pane styling (`@nexora-ui/dropdown`)

- **`mergeVirtualDropdownPaneStyle`**, **`createListboxVirtualDropdownPanelStyle`**, and **`ListboxVirtualDropdownPanelStyleSources`**: used by combobox/select for built-in virtual mode so the overlay pane gets a definite flex height (not only `max-height`).
- **`buildHeadlessDropdownRefOptions`** / **`HeadlessDropdownRefOptionsInput`**: shared `DropdownRefOptions` factory for **select**, **combobox**, and **menu** (pane merge, virtual `panelStyle` when enabled, optional `boundaries` / `configPreset` / `arrowSize`, lifecycle callbacks). Documented in the [dropdown README](../libs/headless/dropdown/README.md).

## Options over many parameters

- **Bad**: `open(content, placement, hasBackdrop, scrollStrategy, focusStrategy, ...)`.
- **Good**: `open(content, { placement, hasBackdrop, scrollStrategy, focusStrategy, ... })`.
- **Extend shared types**: Dialog and drawer share `ContentOpenOptionsBase` and overlay panel options (placement-specific part in each). Reduces duplication and keeps behavior consistent.

## Defaults

- **Document defaults** in the type or README (e.g. placement, delays, close policy). Defaults should be safe and accessible (e.g. focus restore, Escape closes).
- **Constants**: Use named constants for default values (e.g. `DEFAULT_CLOSE_ANIMATION_MS`) so they can be reused and tested. Export only if part of the public contract.

## What is “public” vs “internal”

- **Stable (public)**: Services (`DialogService`, `DrawerService`, `SnackbarService`), ref interfaces (`OverlayRef`, `SnackbarRef`), directive selectors and inputs/outputs, option types (`DialogOpenOptions`, etc.), and helpers we document for app use (e.g. `getContainingOverlayRef`). Avoid breaking these in minor/patch.
- **Internal**: Strategy/ref implementation details and hooks published from **`@nexora-ui/overlay/internal`** (component I/O wiring, close-registry registration, `handleCloseClick`, etc.). Apps should use services, **`getContainingOverlayRef`**, and close directives; registry helpers are for headless package code. Document “internal” or “for use by overlay directives” in READMEs.
- **`@nexora-ui/overlay`** (root): **`afterClosedOnce`**, **`subscribeOnceAfterClosed`** (one-shot `afterClosed()` helpers; RxJS only).
- **`@nexora-ui/overlay/internal`**: `applyComponentInputs`, `subscribeComponentOutputs`, `unsubscribeComponentOutputSubscriptions`, **`afterClosedOnceUntilDestroyed`**, the **closeable ref registry** (also re-exports **`afterClosedOnce`** / **`subscribeOnceAfterClosed`** for packages that already use **`/internal`**) (`registerCloseableRef`, `unregisterCloseableRef`, `closestCloseableRef`, `handleCloseClick`, `CloseableRef`), and **`BaseCloseOverlayDirective`** (for sibling packages that add a close directive). For Nexora headless packages only; apps should use services and **`CloseDialogDirective`** / **`CloseDrawerDirective`**. **`isComponent`** and **`getContainingOverlayRef`** stay on the **root** `@nexora-ui/overlay` entry.

## Constants

- **Close reasons**: Use `CLOSE_REASON_PROGRAMMATIC`, `CLOSE_REASON_SCROLL`, etc. from `@nexora-ui/overlay` instead of string literals when closing or asserting in tests.
- **Overlay attributes**: Bridge and pane-id constants (`DATA_ATTR_POPOVER_BRIDGE`, `PANE_ID_PREFIX_TOOLTIP`, etc.) live in overlay and are used by popover/tooltip directives so selectors and behavior stay in sync.

## Summary

- **Services**: `open(content, options?)` returning `Promise<Ref | null>`. Options object with sensible defaults. Ref with minimal, stable methods.
- **Directives**: One main input + prefixed optional inputs; few outputs; expose `isOpen`/`paneId` (or equivalent) as signals for templates.
- **Options over many parameters**; **no redundant entry points**; **clear split between stable public API and internal implementation**.
