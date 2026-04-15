# @nexora-ui/listbox

Design specification and API reference for the headless listbox primitive.

**Public API:** Exports from `src/index.ts` are the supported surface; we follow [PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md) for stability expectations.

---

## 1. Scope and responsibility

`nxrListbox` is the foundational **single-axis collection/navigation primitive** for Nexora UI. It provides:

- **Host semantics**: the directive owns host `role`, `id`, `tabindex`, `aria-orientation`, `aria-multiselectable`, and `aria-activedescendant` automatically. Consumers do not set these manually.
- **Host focusability**: the host element is focusable by default (`tabindex="0"`) so inline and panel usage work without extra setup.
- **Host keyboard handling**: the directive listens to `keydown` on its host internally. Consumers do not bind `(keydown)` for standard usage.
- **Single-select and multi-select** (controlled value, parent-driven).
- **Action mode** (activation-only, no value binding).
- **Keyboard navigation**: Arrows (vertical/horizontal, RTL-aware), Home/End, Enter, Space, typeahead.
- **Scroll-into-view** when the active option changes.
- **ARIA**: `listbox` or `menu` role, `option`/`menuitem` children, `aria-selected`, `aria-disabled`, stable ids, `aria-activedescendant`.
- **Grouping**: `nxrListboxGroup` and `nxrListboxSeparator` for structure and a11y.

### What listbox does NOT own

- Overlay / panel open-close logic (parent or a higher-level component like Select).
- Trigger semantics (`aria-expanded`, `aria-controls`, `aria-haspopup`).
- Filtering / search (parent responsibility).
- Styling (headless).
- Multi-axis navigation (grids, trees, nested/tiered menus, mega menus).

Listbox is the building block for Select, Combobox, Command palette, Autocomplete, and simple action panels. Higher-level components like tiered menus, context menus, mega menus, and tree views may reuse listbox concepts or internal patterns but require dedicated primitives.

### Listbox inside an overlay (library authors)

Select and combobox portal the option list using **`NxrListboxOverlayPanelHostComponent`**. Provide **`NXR_LISTBOX_OVERLAY_PANEL_CONTEXT`** with a **`NxrListboxOverlayPanelContext`** in the portal injector. These advanced overlay-host symbols are exported from **`@nexora-ui/listbox/internal`**. The host root has class **`nxr-listbox-overlay-panel-host`** (`NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS`) for app/demo styling. End applications normally use `<nxr-select>` / `<nxr-combobox>` instead of composing this host directly.

Set **`childOwnsScroll: true`** when the listbox host must not scroll and a descendant (for example a CDK `cdk-virtual-scroll-viewport`) is the scroll container—otherwise you can get **two scrollbars**. Give the viewport a **definite block size** (e.g. `viewportMaxHeight` on `nxr-listbox-cdk-virtual-panel`; `<nxr-combobox>` / `<nxr-select>` wire this from **`maxHeight`**). For **`fillAvailableHeight`**, the overlay pane needs a **resolved flex column** (built-in shell uses **`NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS`** from `@nexora-ui/listbox-cdk`). Combobox/select apply **`createListboxVirtualDropdownPanelStyle`** / **`mergeVirtualDropdownPaneStyle`** from `@nexora-ui/dropdown` so the pane gets a definite height under `maxHeight`.

---

## 2. Modes

### Selection mode (default)

Controlled value binding. The parent owns the value; the listbox emits `nxrListboxValueChange` on activation (Enter, Space, click). Single-select replaces the value; multi-select toggles.

### Action mode

No value binding. Only `nxrListboxOptionActivated` fires on activation. Useful for menu-like action lists and command palettes.

Set via `nxrListboxMode="action"`.

---

## 3. Item-based option API

The public API is item-based:

```html
<div [nxrListboxOption]="item">{{ item.label }}</div>
```

- No index-based public API.
- **Registered option directives** (`[nxrListboxOption]`) are the rendered, selectable DOM entries. The listbox derives its option set entirely from the registry — there is no separate logical collection input.
- **Navigation order** follows registry (DOM render) order.
- **Selection reconciliation** uses the registry + accessors + `compareWith`.
- If option values duplicate in the registry, the first matching entry is treated as selected.
- Use stable item identity (e.g. `track item.id` in `@for`) for dynamic lists.

---

## 4. Accessors

When `T` is an object, provide `nxrListboxAccessors` so the listbox can extract value, label, and disabled:

```ts
readonly accessors: ListboxAccessors<Fruit> = {
  value: (f) => f.id,
  label: (f) => f.name,
  disabled: (f) => f.outOfSeason,
};
```

When `T` is a primitive (e.g. `string[]`), omit accessors; the item itself is used as both value and label.

---

## 5. Public API

### Inputs (on `nxrListbox` host)

| Input                        | Type                                        | Default       | Description                                         |
| ---------------------------- | ------------------------------------------- | ------------- | --------------------------------------------------- |
| `nxrListboxValue`            | `T \| null \| readonly T[]`                 | `null`        | Controlled value (single or multi).                 |
| `nxrListboxMulti`            | `boolean`                                   | `false`       | Multi-select mode (listbox role only).              |
| `nxrListboxAccessors`        | `ListboxAccessors<T>`                       | —             | Value/label/disabled extractors for object options. |
| `nxrListboxCompareWith`      | `(a, b) => boolean`                         | `===`         | Custom equality for selection reconciliation.       |
| `nxrListboxRole`             | `'listbox' \| 'menu'`                       | `'listbox'`   | ARIA role. `menu` for action-oriented lists.        |
| `nxrListboxOrientation`      | `'vertical' \| 'horizontal'`                | `'vertical'`  | Navigation axis and `aria-orientation`.             |
| `nxrListboxWrap`             | `boolean`                                   | `false`       | Wrap navigation at boundaries.                      |
| `nxrListboxInitialHighlight` | `'selected' \| 'first' \| 'last' \| 'none'` | `'none'`      | Which option is active on init.                     |
| `nxrListboxMode`             | `'selection' \| 'action'`                   | `'selection'` | Selection mode or action-only mode.                 |

### Outputs

| Output                      | Payload                     | Description                                                                                                |
| --------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `nxrListboxValueChange`     | `T \| null \| readonly T[]` | Emitted when value changes (selection mode).                                                               |
| `nxrListboxOptionActivated` | `{ option: T }`             | Emitted on every activation (Enter, Space, click). Fires in both modes.                                    |
| `nxrListboxBoundaryReached` | `'start' \| 'end'`          | Emitted when keyboard navigation hits the edge of the list with wrap disabled. Useful for infinite scroll. |

### Option directive (`[nxrListboxOption]`)

| Input              | Type           | Description                  |
| ------------------ | -------------- | ---------------------------- |
| `nxrListboxOption` | `T` (required) | The option item to register. |

The option directive handles:

- Registration with the parent listbox on init, unregistration on destroy.
- Host `role` (`option` or `menuitem`).
- Host `id` (stable, generated).
- Host `aria-selected` (listbox role, selection mode only).
- Host `aria-disabled`.
- Click activation (delegates to the listbox; disabled options are ignored).

Consumers do not need to add manual click handlers on options.

### Structural directives

| Directive              | Selector                 | Purpose                                                                                                             |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `nxrListboxGroup`      | `[nxrListboxGroup]`      | `role="group"` + `aria-labelledby`. Prefer child `nxrListboxGroupLabel`; optional input: label element id (legacy). |
| `nxrListboxGroupLabel` | `[nxrListboxGroupLabel]` | Provides stable id for group label; parent group wires `aria-labelledby` automatically.                             |
| `nxrListboxSeparator`  | `[nxrListboxSeparator]`  | `role="separator"`. Visual/a11y only; not navigable.                                                                |

### Host behavior owned by the directive

The directive sets the following on its host element automatically:

- `tabindex="0"` — host is focusable.
- `role` — `listbox` or `menu`.
- `id` — stable generated id.
- `aria-orientation` — from `nxrListboxOrientation`.
- `aria-multiselectable` — `true` when `nxrListboxMulti` and role is `listbox`.
- `aria-activedescendant` — id of the currently active option.
- `(keydown)` — keyboard handling.

Consumers should not manually add `tabindex`, `role`, `id`, `aria-orientation`, `aria-multiselectable`, `aria-activedescendant`, or `(keydown)` on the listbox host.

### Advanced helpers (via `exportAs: 'nxrListbox'`)

For advanced integration (Select, Combobox, Command wrappers), the directive can be captured as a template reference:

```html
<div nxrListbox ... #listbox="nxrListbox"></div>
```

This exposes:

| Method / Signal        | Return           | Description                                                                                                                                                                                                                                                                                |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `listboxId()`          | `string`         | The host element id (for `aria-controls`).                                                                                                                                                                                                                                                 |
| `activeOptionId()`     | `string \| null` | Id of the active option (for external `aria-activedescendant`). Resolves the registered row even when the active value is not the same object reference as the option in the DOM, using the same rules as `isActive` (`nxrListboxCompareWith` or `nxrListboxAccessors.value`, then `===`). |
| `activeOption()`       | `T \| null`      | The currently active item.                                                                                                                                                                                                                                                                 |
| `optionId(item)`       | `string \| null` | Stable DOM id of the matching registered option (same equivalence rules as `activeOptionId()`).                                                                                                                                                                                            |
| `isSelected(item)`     | `boolean`        | Whether the item is selected.                                                                                                                                                                                                                                                              |
| `isActive(item)`       | `boolean`        | Whether the item is the active option (uses the same identity rules as selection: `compareWith` / `accessors.value` when applicable, not only `===`).                                                                                                                                      |
| `selectOption(item)`   | `void`           | Programmatically select/toggle an option.                                                                                                                                                                                                                                                  |
| `handleKeydown(event)` | `void`           | Keyboard handler; exposed for advanced coordination only.                                                                                                                                                                                                                                  |

**These helpers are not required for normal inline usage.** They exist so wrapper components can coordinate trigger ARIA, external `aria-activedescendant`, or programmatic selection.

`NxrListboxController` methods used by `nxrListboxOption` — `getOptionId`, `isDisabled`, `unregisterOption`, `refreshOption`, and `setDisabled` — resolve the registered option the same way when the item argument is value-equal but not reference-equal to the registered instance.

---

## 6. Internal architecture

```
listbox.directive.ts          ← host bindings, inputs/outputs, keyboard listener, coordination
  ├─ ListboxState             ← reactive state: active option, navigation, selection, activation
  ├─ OptionRegistry           ← registered options (item + element + id); enabled navigation uses DOM-ordered enabled entries
  ├─ Typeahead                ← key buffer, label matching, cycling, timeout
  └─ normalize-options.ts     ← pure helpers to derive value/label/disabled from items

listbox-option.directive.ts   ← registers with controller, ARIA state, click delegation
listbox-group.directive.ts    ← role="group", aria-labelledby (discovers nxrListboxGroupLabel or uses input)
listbox-group-label.directive.ts ← stable id for group label
listbox-separator.directive.ts ← role="separator"

types.ts                      ← NxrListboxController interface, InjectionToken, public types
```

The listbox directive:

- Captures `keydown` events on the host via a host listener. No manual binding required.
- Sets `tabindex="0"` on the host. No manual attribute required.
- Provides itself as `NXR_LISTBOX_CONTROLLER` so option directives can inject the parent.
- Delegates navigation, selection, and activation to `ListboxState`.
- Uses `OptionRegistry` for element lookup and **DOM-order traversal of enabled options** (internal slot order is an implementation detail).
- Uses `Typeahead` for type-ahead character matching.

---

## 7. Listbox vs menu semantics

|                        | `listbox` (default)  | `menu`            |
| ---------------------- | -------------------- | ----------------- |
| Container role         | `role="listbox"`     | `role="menu"`     |
| Option role            | `role="option"`      | `role="menuitem"` |
| `aria-selected`        | Yes (selection mode) | No                |
| `aria-multiselectable` | When multi           | No                |
| Typical mode           | Selection            | Action            |

`nxrListboxRole="menu"` adapts ARIA output for simple, flat action lists. It is **not** a full menu system. Tiered menus, nested menus, mega menus, and context menu trees require dedicated primitives.

If `nxrListboxMulti` is `true` with `nxrListboxRole="menu"`, a development warning is logged. Multi-select is only meaningful with the `listbox` role.

---

## 8. Keyboard and typeahead

All keyboard handling is internal to the directive. The host listens automatically.

### Navigation keys

| Key        | Vertical | Horizontal           |
| ---------- | -------- | -------------------- |
| ArrowDown  | Next     | —                    |
| ArrowUp    | Previous | —                    |
| ArrowRight | —        | Next (RTL: Previous) |
| ArrowLeft  | —        | Previous (RTL: Next) |
| Home       | First    | First                |
| End        | Last     | Last                 |

### Activation keys

| Key   | Behavior                                              |
| ----- | ----------------------------------------------------- |
| Enter | Activate the active option.                           |
| Space | Activate the active option (toggles in multi-select). |

### Typeahead

Single-character keys accumulate in a buffer (400 ms timeout). The next option whose normalized label starts with the buffer string is activated. Search cycles from the option after the current active.

Navigation keys reset the typeahead buffer.

---

## 9. Option lifecycle

1. `[nxrListboxOption]="item"` directive initializes → calls `registerOption(item, element)` on the parent controller.
2. Registry assigns a stable id and appends the entry.
3. On destroy → calls `unregisterOption(item)`. Registry removes the entry.
4. When options change or the registry changes, the listbox reconciles the active option (re-applies initial highlight if the active option is no longer valid).

---

## 10. Selection reconciliation

Selection is controlled. The parent owns `nxrListboxValue`.

- **Single**: value is `T | null`. On activation, the listbox emits the new value.
- **Multi**: value is `readonly T[]`. On activation, the listbox toggles the item in the array and emits the new array.

Comparison uses `nxrListboxCompareWith` (default: `===`) applied to accessor-extracted values. This supports both primitive and object identity models.

---

## 11. `aria-activedescendant` and focus

### Self-contained usage (inline listbox)

When the listbox host itself is the focused element, the directive manages `aria-activedescendant` on the host automatically. No additional wiring needed.

### External-focus usage (Select, Combobox triggers)

When focus remains on an external trigger or input (e.g. a Select button or Combobox input), the consumer uses the exported template ref to wire ARIA on the trigger:

```html
<input
  role="combobox"
  [attr.aria-activedescendant]="listbox.activeOptionId()"
  [attr.aria-controls]="listbox.listboxId()"
/>

<div nxrListbox ... #listbox="nxrListbox">...</div>
```

The listbox still manages its own internal state and `aria-activedescendant` on the host. The consumer reads `activeOptionId()` and `listboxId()` to sync the trigger.

Neither focus model is forced on all consumers. The directive supports both.

---

## 12. Initial highlight

Controlled by `nxrListboxInitialHighlight`:

| Strategy           | Behavior                                                                            |
| ------------------ | ----------------------------------------------------------------------------------- |
| `'none'` (default) | No option is active until the user navigates or you set highlight programmatically. |
| `'selected'`       | Active = selected option if registered; else first enabled.                         |
| `'first'`          | First enabled option.                                                               |
| `'last'`           | Last enabled option.                                                                |

---

## 13. Scroll-into-view

When the active option changes, the directive scrolls the option element into view (`{ block: 'nearest', inline: 'nearest' }`). Scroll calls are throttled via `requestAnimationFrame` to prevent layout thrashing during rapid keyboard navigation. Guarded for environments where `scrollIntoView` is unavailable.

---

## 14. Grouping

Groups are presentational/a11y only. They do not affect navigation order.

**Preferred API** — use `nxrListboxGroupLabel` so the group gets automatic `aria-labelledby`:

```html
<div nxrListboxGroup>
  <span nxrListboxGroupLabel>Fruits</span>
  <div [nxrListboxOption]="apple">Apple</div>
  <div [nxrListboxOption]="banana">Banana</div>
</div>
```

**Legacy API** — manual id wiring is still supported but not preferred for new code:

```html
<div [nxrListboxGroup]="labelId">
  <span [id]="labelId">Fruits</span>
  <div [nxrListboxOption]="apple">Apple</div>
  <div [nxrListboxOption]="banana">Banana</div>
</div>
```

Prefer the semantic label directive for new code; manual id wiring remains supported for backward compatibility.

Options inside groups register in the parent listbox's registry like any other option. Navigation follows registry order across all groups.

`nxrListboxSeparator` renders `role="separator"` for visual/a11y grouping. It is not selectable or navigable.

---

## 15. RTL

Horizontal listboxes are RTL-aware. In `dir="rtl"`:

- ArrowLeft → next (visually right-to-left).
- ArrowRight → previous.

The directive reads `dir` from the host or its ancestors (falling back to the document root).

---

## 16. Dependencies

- `@angular/core`
- `@nexora-ui/core` (id generation, DOM utilities, debug helpers)

No overlay, trigger, or styling dependencies. Filtering and search are consumer responsibility.

---

## 17. Examples

### A. Inline listbox (minimal usage)

The golden example. No `tabindex`, no `(keydown)`, no template ref, no manual role.

```html
<div
  nxrListbox
  [nxrListboxValue]="value()"
  (nxrListboxValueChange)="value.set($event)"
  [nxrListboxAccessors]="accessors"
  [nxrListboxCompareWith]="compareWith"
  nxrListboxInitialHighlight="selected"
>
  @for (item of options(); track item.id) {
  <div [nxrListboxOption]="item">{{ item.label }}</div>
  }
</div>
```

### B. Primitive options

No accessors needed for `string[]`.

```html
<div nxrListbox [nxrListboxValue]="selectedTag()" (nxrListboxValueChange)="selectedTag.set($event)">
  @for (tag of tags(); track tag) {
  <div [nxrListboxOption]="tag">{{ tag }}</div>
  }
</div>
```

### C. Multi-select

```html
<div
  nxrListbox
  [nxrListboxValue]="selectedFruits()"
  (nxrListboxValueChange)="selectedFruits.set($event)"
  [nxrListboxMulti]="true"
  [nxrListboxAccessors]="accessors"
  [nxrListboxCompareWith]="compareById"
>
  @for (item of fruits(); track item.id) {
  <div [nxrListboxOption]="item">{{ item.name }}</div>
  }
</div>
```

### D. Action mode / menu-like

```html
<div
  nxrListbox
  nxrListboxMode="action"
  nxrListboxRole="menu"
  [nxrListboxAccessors]="actionAccessors"
  (nxrListboxOptionActivated)="runAction($event.option)"
>
  @for (action of actions(); track action.id) {
  <div [nxrListboxOption]="action">{{ action.label }}</div>
  }
</div>
```

### E. Grouped with separator

```html
<div
  nxrListbox
  [nxrListboxValue]="value()"
  (nxrListboxValueChange)="value.set($event)"
  [nxrListboxAccessors]="accessors"
  [nxrListboxCompareWith]="compareById"
>
  @for (group of groups(); track group.id) {
  <div nxrListboxGroup>
    <span nxrListboxGroupLabel>{{ group.label }}</span>
    @for (item of group.options; track item.id) {
    <div [nxrListboxOption]="item">{{ item.name }}</div>
    }
  </div>
  @if (!$last) {
  <div nxrListboxSeparator></div>
  } }
</div>
```

### F. Horizontal with wrap

```html
<div
  nxrListbox
  [nxrListboxValue]="selectedTag()"
  (nxrListboxValueChange)="selectedTag.set($event)"
  nxrListboxOrientation="horizontal"
  [nxrListboxWrap]="true"
>
  @for (tag of tags(); track tag) {
  <div [nxrListboxOption]="tag">{{ tag }}</div>
  }
</div>
```

### G. Select / dropdown panel (advanced wrapper)

The trigger needs `listboxId()` and `activeOptionId()` for ARIA, so `#listbox="nxrListbox"` is used.

```html
<button
  type="button"
  [attr.aria-expanded]="isOpen()"
  [attr.aria-controls]="isOpen() ? listbox.listboxId() : null"
  aria-haspopup="listbox"
  [attr.aria-activedescendant]="isOpen() ? listbox.activeOptionId() : null"
  (click)="toggle()"
  (keydown.arrowDown)="open()"
>
  {{ selectedLabel() || 'Select...' }}
</button>

@if (isOpen()) {
<div
  nxrListbox
  [nxrListboxValue]="value()"
  (nxrListboxValueChange)="onSelect($event)"
  [nxrListboxAccessors]="accessors"
  [nxrListboxCompareWith]="compareWith"
  nxrListboxInitialHighlight="selected"
  #listbox="nxrListbox"
>
  @for (item of options(); track item.id) {
  <div [nxrListboxOption]="item">{{ item.label }}</div>
  }
</div>
}
```

### H. Combobox (advanced wrapper)

Focus stays on the input. The consumer reads `activeOptionId()` and `listboxId()`.

```html
<input
  role="combobox"
  aria-autocomplete="list"
  [attr.aria-expanded]="isOpen()"
  [attr.aria-controls]="isOpen() ? listbox.listboxId() : null"
  [attr.aria-activedescendant]="isOpen() ? listbox.activeOptionId() : null"
  (input)="onInput($event)"
  (keydown.arrowDown)="open()"
/>

@if (isOpen()) {
<div
  nxrListbox
  [nxrListboxValue]="value()"
  (nxrListboxValueChange)="onSelect($event)"
  [nxrListboxAccessors]="accessors"
  nxrListboxInitialHighlight="first"
  #listbox="nxrListbox"
>
  @for (item of filteredOptions(); track item.id) {
  <div [nxrListboxOption]="item">{{ item.label }}</div>
  }
</div>
}
```

---

## 18. Exports

```ts
// @nexora-ui/listbox public API
export { ListboxDirective } from './lib/directives/listbox.directive';
export { ListboxOptionDirective } from './lib/directives/listbox-option.directive';
export { ListboxGroupDirective } from './lib/directives/listbox-group.directive';
export { ListboxSeparatorDirective } from './lib/directives/listbox-separator.directive';

export type {
  ListboxRole,
  ListboxOrientation,
  ListboxInitialHighlight,
  ListboxBoundary,
  ListboxAccessors,
  ListboxOptionActivatedEvent,
} from './lib/types';
```

Internal types (`NxrListboxController`, `NXR_LISTBOX_CONTROLLER`, `NormalizedOption`) and implementation classes (`ListboxState`, `OptionRegistry`, `Typeahead`) are not part of the public API.

Advanced overlay host symbols are intentionally separate:

```ts
// @nexora-ui/listbox/internal
export {
  NXR_LISTBOX_OVERLAY_PANEL_CONTEXT,
  NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS,
  NxrListboxVirtualScrollRegistry,
  NxrListboxOverlayPanelHostComponent,
  type NxrListboxOverlayPanelContext,
  type ListboxDirective,
} from '@nexora-ui/listbox/internal';
```

### Overlay attach (select / combobox / custom hosts)

**`scheduleListboxScrollActiveOnNextMicrotask(listbox)`** is exported for hosts that portal a listbox: it queues **`scrollActiveIntoView()`** on the next microtask so CDK/virtual layout can settle before scrolling. **`bindListboxReadyWithActiveScroll(setListboxRef)`** builds a full **`onListboxReady`** callback (set ref + schedule scroll). **`ListboxScrollActiveCapable`** is the minimal typing surface. Nexora **select** and **combobox** use **`bindListboxReadyWithActiveScroll`** via their internal listbox overlay portal helpers.

### Source layout (`src/lib/utils/`, contributors)

Pure helpers (unit-tested where non-trivial): **`virtual-scroll-nav-index`** (virtual arrow/Home/End index math and alignment), **`event-target-text-input`** (defer keys when focus is in a text field), **`listbox-scroll-into-view`** (native `scrollIntoView` options), **`listbox-schedule-initial-scroll`** (overlay open).

### Boundary events (infinite scroll)

When `nxrListboxWrap` is `false` (the default), keyboard navigation emits `nxrListboxBoundaryReached` with `'start'` or `'end'` when the user arrows past the first or last option. Consumers can use this to trigger data fetching for infinite scroll without impacting simple listbox usage.

```html
<div
  nxrListbox
  [nxrListboxValue]="value()"
  (nxrListboxValueChange)="value.set($event)"
  (nxrListboxBoundaryReached)="loadMore($event)"
  [nxrListboxAccessors]="accessors"
>
  @for (item of items(); track item.id) {
  <div [nxrListboxOption]="item">{{ item.label }}</div>
  }
</div>
```

### Virtual scroll (CDK)

For large lists with `*cdkVirtualFor`, only a window of options is in the DOM. The listbox can use an optional **virtual scroll handler** so arrow-key and Home/End navigation work over the full logical list:

1. **Panel host** provides `NxrListboxVirtualScrollRegistry` and passes the same instance into the panel content injector (e.g. `optionInjector`).
2. **Panel content** (e.g. a component that wraps `CdkVirtualScrollViewport` and `*cdkVirtualFor`) implements `NxrListboxVirtualScrollHandler` and registers itself with the registry in `ngOnInit` / `ngAfterViewInit`, and unregisters in `ngOnDestroy`.
3. When a handler is present, the listbox uses it for **all** arrow and Home/End navigation (index-based); it no longer relies on the option registry for those keys. The registry is still used for ARIA and selection.

The listbox passes a **scroll alignment** (`ListboxScrollAlignment`: `'start'` | `'end'` | `'nearest'`) into `scrollToIndex(index, alignment)` so the highlighted option moves naturally: **arrows** use `'nearest'` (scroll only if the target leaves the viewport), **Home** / **End** use `'start'` / `'end'`; no DOM `scrollIntoView` when a handler is present.

Handlers may implement optional **`resolveIndexForActive(active, sameItem)`** so when `getCurrentIndex` misses (e.g. active is value-equal but not reference-equal to a row), the listbox can still resolve the logical index for arrows and `scrollActiveIntoView`, using the same rules as `nxrListboxCompareWith` / accessors. The built-in CDK virtual panel implements this.

Export: `NXR_LISTBOX_VIRTUAL_SCROLL_HANDLER`, `NxrListboxVirtualScrollRegistry`, `NxrListboxVirtualScrollHandler`, `ListboxScrollAlignment`.

**Built-in path:** Combobox and select can enable **`virtualScroll`** + **`virtualItems`** (and related inputs) so the library hosts **`nxr-listbox-cdk-virtual-panel`** for you — see [@nexora-ui/listbox-cdk README](../listbox-cdk/README.md) and [@nexora-ui/combobox README](../combobox/README.md) / [@nexora-ui/select README](../select/README.md). The demo “Large list” sections exercise this.

---

## 19. Scope and deferrals

### In scope

- Single-select and multi-select (controlled).
- Action mode.
- `listbox` and `menu` roles.
- Vertical and horizontal orientation, RTL.
- Typeahead.
- Groups and separators.
- Automatic host focusability, keyboard handling, and ARIA.
- `exportAs` for advanced wrapper integration.
- Virtual scroll support via optional handler and registry (index-based nav when handler is present).

### Deferred / not in scope

- Configurable host tabindex (current behavior always sets `0`).
- `disabled` input on the listbox host (disable entire list).
- `required` input.
- Roving tabindex focus model (alternative to `aria-activedescendant`).

### Positioning as a 1D primitive

Listbox is the foundational single-axis collection/navigation primitive. It is reused directly by Select, Combobox, Autocomplete, and Command. Higher-level patterns — tiered menus, nested menus, mega menus, context menu systems, and tree views with expand/collapse — may reuse listbox concepts, helpers, or internal patterns, but those require dedicated wrappers or separate primitives. Listbox does not attempt to solve multi-level or multi-axis navigation.

---

## 20. Summary

| Concern                                  | Owner                                            |
| ---------------------------------------- | ------------------------------------------------ |
| Host focusability                        | Directive (automatic `tabindex="0"`)             |
| Host keyboard handling                   | Directive (automatic `keydown` listener)         |
| Host role, id, ARIA attributes           | Directive                                        |
| `aria-activedescendant` (host-focused)   | Directive (automatic)                            |
| `aria-activedescendant` (external focus) | Consumer reads `activeOptionId()` via `exportAs` |
| Option role, id, selected, disabled      | Option directive (automatic)                     |
| Click activation                         | Option directive (automatic)                     |
| Value binding                            | Consumer (controlled via inputs/outputs)         |
| Overlay / panel logic                    | Consumer or higher-level component               |
| Trigger ARIA (`aria-expanded`, etc.)     | Consumer or higher-level component               |
| Filtering / search                       | Consumer                                         |
| Styling                                  | Consumer (headless)                              |

**Minimal inline usage** requires only `nxrListbox`, `nxrListboxValue`, `nxrListboxValueChange`, and `[nxrListboxOption]`. No `tabindex`, no `(keydown)`, no template ref, no manual ARIA. The listbox derives its option set from the rendered `[nxrListboxOption]` directives — no separate options-array input is needed.

**Advanced wrapper usage** (Select, Combobox, Command) additionally uses `#listbox="nxrListbox"` to access `listboxId()`, `activeOptionId()`, `isSelected()`, and `isActive()` for trigger ARIA coordination.

---

## Running unit tests

```bash
nx test listbox
```
