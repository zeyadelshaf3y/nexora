# @nexora-ui/select

Headless, accessible select (dropdown) for Angular. Composes `@nexora-ui/listbox`, `@nexora-ui/dropdown`, and `@nexora-ui/overlay` for list semantics, panel lifecycle, and positioning. Zero opinionated styles — you own all the markup and CSS.

**Public API:** Exports from `src/index.ts` are the supported surface ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)).

## Features

- Single and multi-select modes
- Full keyboard navigation (Arrow keys, Enter, Space, Escape, Tab)
- ARIA: `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `role="listbox"`, `role="option"`
- ControlValueAccessor — works with `FormControl`, `FormGroup`, `ngModel`
- Signal-friendly two-way binding via `[(value)]`
- Custom trigger, option templates, panel headers/footers
- Grouped options with separators
- Disabled options and disabled select state
- Custom equality via `compareWith`
- Object or primitive option values
- `displayValue()`, `hasValue()`, and `selectedValues()` signals for trigger/chip display
- `[nxrSelectClear]` directive for a clear button (inside or next to the trigger)
- Lazy panel rendering via `<ng-template>`
- Panel auto-closes on single selection; stays open for multi
- Focus returns to trigger on close
- Dev-mode validation for missing required children

## Installation

```bash
npm install @nexora-ui/select @nexora-ui/dropdown @nexora-ui/listbox @nexora-ui/overlay @nexora-ui/core
```

## Quick Start

```html
<nxr-select
  [(value)]="selected"
  [accessors]="accessors"
  placeholder="Pick a fruit"
  #sel="nxrSelect"
>
  <button nxrSelectTrigger>{{ sel.displayValue() }}</button>
  <ng-template nxrSelectPanel>
    @for (fruit of fruits(); track fruit.id) {
    <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
    }
  </ng-template>
</nxr-select>
```

```typescript
interface Fruit { id: number; name: string; }

readonly fruits = signal<Fruit[]>([...]);
readonly selected = signal<Fruit | null>(null);
readonly accessors: SelectAccessors<Fruit> = {
  value: (f) => f.id,
  label: (f) => f.name,
};
```

## Panel content

The panel template renders **inside the listbox** (`role="listbox"`). That role may only contain options, groups, and separators — not focusable controls like a search field. **For type-to-filter dropdowns**, use **@nexora-ui/combobox** ([README](../combobox/README.md)): input as trigger, filter in the parent, list stays options-only. See also [DROPDOWNS.md](../../../docs/DROPDOWNS.md).

Static headers or non-interactive hints inside the panel are fine if they do not break listbox semantics; when in doubt, keep the panel to options only.

## Behavior we own vs you provide

**We own:** Open/close lifecycle, keyboard handling (Enter, Space, Arrows, Escape, Tab), ARIA attributes on the trigger and listbox, focus restore on close, CVA integration (touched on close, value sync). Optional inputs control placement, scroll strategy, disabled state, and panel dimensions.

**You provide:** The trigger element (with `nxrSelectTrigger`), the panel content (with `ng-template nxrSelectPanel`), and each option (with `nxrSelectOption`). You supply all styling and any custom header/footer inside the panel (non-interactive or compliant with listbox rules). You add `aria-label` or `aria-labelledby` on the trigger for screen readers.

## Programmatic API

Use a template reference or `viewChild` to call methods and signals:

```html
<nxr-select [(value)]="selected" #sel="nxrSelect">...</nxr-select>
<!-- Clear via directive (recommended): resets value, closes panel, focuses trigger -->
<span nxrSelectClear role="button" tabindex="0" aria-label="Clear">×</span>
```

For a clear control **inside** the trigger (like the chevron), use a non-button element with `nxrSelectClear` so the trigger’s click doesn’t fire when clearing:

```html
<button nxrSelectTrigger>
  <span class="select-trigger-label">{{ sel.displayValue() }}</span>
  @if (sel.hasValue()) {
  <span class="select-clear" nxrSelectClear role="button" tabindex="0" aria-label="Clear">×</span>
  }
  <app-icon name="chevron-down" />
</button>
```

Use **`hasValue()`** to show/hide the clear control and **`selectedValues()`** to render chips in multi mode (same shape as combobox):

```html
@if (sel.hasValue()) { ... } @for (c of sel.selectedValues(); track c.code) {
<span class="chip">{{ c.name }}</span>
}
```

## API Reference

### `<nxr-select>` (SelectComponent)

Root compound component. Owns state, overlay lifecycle, keyboard logic, and CVA.

| Input                      | Type                                | Default      | Description                                                                 |
| -------------------------- | ----------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `value`                    | `T \| null \| readonly T[]`         | `null`       | Two-way bindable via `[(value)]`                                            |
| `multi`                    | `boolean`                           | `false`      | Enable multi-select mode                                                    |
| `accessors`                | `SelectAccessors<T>`                | `undefined`  | Value/label/disabled extractors                                             |
| `compareWith`              | `(a, b) => boolean`                 | identity     | Custom equality comparator                                                  |
| `placeholder`              | `string`                            | `''`         | Placeholder for `displayValue()`                                            |
| `initialHighlight`         | `SelectInitialHighlight`            | `'selected'` | Which option to highlight on open                                           |
| `disabled`                 | `boolean`                           | `false`      | Disable the entire select                                                   |
| `required`                 | `boolean`                           | `false`      | Sets `aria-required` on the trigger (validation is via forms)               |
| `placement`                | `Placement`                         | `'bottom'`   | Panel placement                                                             |
| `panelClass`               | `string \| string[]`                | `undefined`  | CSS class on the overlay pane                                               |
| `panelStyle`               | `Record<string, string>`            | `undefined`  | Inline styles on the overlay pane                                           |
| `backdropClass`            | `string \| string[]`                | `undefined`  | CSS class on the backdrop                                                   |
| `backdropStyle`            | `Record<string, string>`            | `undefined`  | Inline styles on the backdrop                                               |
| `hasBackdrop`              | `boolean`                           | `false`      | Show a backdrop behind the panel                                            |
| `beforeOpen`               | `() => boolean \| Promise<boolean>` | `undefined`  | Return false to prevent opening                                             |
| `beforeClose`              | `() => boolean \| Promise<boolean>` | `undefined`  | Return false to prevent closing                                             |
| `maxHeight`                | `string`                            | `'16rem'`    | Max panel height                                                            |
| `offset`                   | `number`                            | `4`          | Gap between trigger and panel                                               |
| `matchTriggerWidth`        | `boolean`                           | `true`       | Panel matches trigger width                                                 |
| `scrollStrategy`           | `SelectScrollStrategy`              | `'noop'`     | Scroll behavior while open (`'noop'`, `'reposition'`, `'block'`, `'close'`) |
| `maintainInViewport`       | `boolean`                           | `true`       | With reposition scroll strategy, keep the panel inside the viewport         |
| `boundaries`               | `ViewportBoundaries`                | `undefined`  | Viewport inset for overlay max size (from `@nexora-ui/overlay`)             |
| `closeAnimationDurationMs` | `number`                            | `150`        | Duration (ms) for close animation before detach                             |

#### Styling hooks

| Hook                 | Type                     | Applies to       | Notes                                                         |
| -------------------- | ------------------------ | ---------------- | ------------------------------------------------------------- |
| `panelClass`         | `string \| string[]`     | Overlay pane     | Preferred for reusable themes and animation states.           |
| `panelStyle`         | `Record<string, string>` | Overlay pane     | Inline one-off pane style overrides.                          |
| `backdropClass`      | `string \| string[]`     | Backdrop element | Used only when `hasBackdrop` is enabled.                      |
| `backdropStyle`      | `Record<string, string>` | Backdrop element | Inline one-off backdrop style overrides.                      |
| `maxHeight`          | `string`                 | Overlay pane     | Caps panel/virtual viewport height.                           |
| `matchTriggerWidth`  | `boolean`                | Overlay pane     | Keeps pane width aligned with trigger width.                  |
| `placement`          | `Placement`              | Positioning      | Preferred anchor placement (with fallback unless restricted). |
| `offset`             | `number`                 | Anchor gap       | Gap in px between trigger and panel.                          |
| `scrollStrategy`     | `SelectScrollStrategy`   | Open lifecycle   | `'noop'`, `'reposition'`, `'block'`, `'close'`.               |
| `maintainInViewport` | `boolean`                | Reposition logic | Keeps pane clamped while repositioning.                       |
| `boundaries`         | `ViewportBoundaries`     | Reposition logic | Insets used for viewport clamping and max-size calculations.  |

| Output   | Payload                    | Description                                                                                                                                          |
| -------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `opened` | `void`                     | Fires when the panel opens.                                                                                                                          |
| `closed` | `CloseReason \| undefined` | Fires when the panel closes. Payload: `'selection'` (user picked an option), `'escape'`, `'outside'`, `'backdrop'`, `'scroll'`, or `'programmatic'`. |

| Property         | Type                         | Description                                                                        |
| ---------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| `isOpen`         | `Signal<boolean>`            | Whether the panel is open                                                          |
| `isDisabled`     | `Signal<boolean>`            | `[disabled]`, form disabled, or `disable()`                                        |
| `displayValue`   | `Signal<string>`             | Computed label for the trigger                                                     |
| `hasValue`       | `Signal<boolean>`            | Whether there is a selection (single: value != null, multi: length > 0)            |
| `selectedValues` | `Signal<readonly unknown[]>` | Selection as array (multi: value; single: [value] or []). Use for chips/iteration. |
| `listboxId`      | `Signal<string \| null>`     | Internal listbox element ID                                                        |
| `activeOptionId` | `Signal<string \| null>`     | Active option element ID                                                           |

| Method                  | Description                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `open()`                | Open the panel. Returns `Promise<boolean>` (`true` if opened)                                                            |
| `close()`               | Close the panel                                                                                                          |
| `toggle()`              | Toggle open/close                                                                                                        |
| `reset()`               | Clear selection (single: null, multi: []), notify CVA, close panel if open                                               |
| `focusTrigger()`        | Focus the trigger element (e.g. after reset or when scrolling to the select)                                             |
| `disable()`             | Programmatic disable (without toggling `[disabled]`); closes the panel with `programmatic` if open; pair with `enable()` |
| `enable()`              | Clear programmatic disable from `disable()`                                                                              |
| `isSelected(item)`      | Whether the given option is currently selected (delegates to listbox)                                                    |
| `forwardKeydown(event)` | Forward a keydown event to the listbox (no-op when closed). For advanced patterns.                                       |

### `[nxrSelectTrigger]` (SelectTriggerDirective)

Place on a `<button>` (or focusable element) inside `<nxr-select>`. Sets ARIA attributes and delegates events.

### `[nxrSelectClear]` (SelectClearDirective)

Place on the element that clears the selection (e.g. "×" or "Clear"). On click (or Enter/Space when focused), clears value, notifies CVA, closes the panel if open, and moves focus to the trigger. Use a `<span role="button" tabindex="0">` inside the trigger to avoid nesting buttons; add `aria-label` for screen readers.

### `[nxrSelectPanel]` (SelectPanelDirective)

Place on an `<ng-template>` inside `<nxr-select>`. Content is rendered inside the overlay.

### `[nxrSelectOption]` (SelectOptionDirective)

Place on option elements inside the panel template.

| Input             | Type | Description     |
| ----------------- | ---- | --------------- |
| `nxrSelectOption` | `T`  | The option item |

### `[nxrSelectGroup]` (SelectGroupDirective)

Wraps a group of options. Sets `role="group"` and `aria-labelledby`.

**Preferred:** put `nxrSelectGroupLabel` on the group label element; the listbox layer wires `aria-labelledby` automatically.

```html
<div nxrSelectGroup>
  <span nxrSelectGroupLabel>Europe</span>
  ...
</div>
```

**Legacy-supported API:** manual id wiring remains supported for backward compatibility.

```html
<div [nxrSelectGroup]="someId">
  <span [id]="someId">Europe</span>
  ...
</div>
```

Prefer the semantic label directive for new code.

| Input            | Type     | Description                                                                               |
| ---------------- | -------- | ----------------------------------------------------------------------------------------- |
| `nxrSelectGroup` | `string` | Optional. Label element ID for the group (legacy; omit when using `nxrSelectGroupLabel`). |

### `[nxrSelectGroupLabel]` (SelectGroupLabelDirective)

Place on the group label element inside `nxrSelectGroup`. Provides a stable id and lets the group set `aria-labelledby` automatically. No inputs.

### `[nxrSelectSeparator]` (SelectSeparatorDirective)

Visual separator between groups. Sets `role="separator"`.

## Forms Integration

### Two-way signal binding

```html
<nxr-select [(value)]="selected">...</nxr-select>
```

### One-way with explicit handler

```html
<nxr-select [value]="selected()" (valueChange)="onChanged($event)">...</nxr-select>
```

### FormControl

```html
<nxr-select [formControl]="myControl">...</nxr-select>
```

### FormGroup

```html
<form [formGroup]="form">
  <nxr-select formControlName="country">...</nxr-select>
</form>
```

### Touched semantics

The control is marked as **touched** when the panel closes (regardless of whether a selection was made).

## Value Typing

**Single select** — `T | null`

```typescript
readonly selected = signal<Fruit | null>(null);
```

**Multi select** — `readonly T[]`

```typescript
readonly selected = signal<readonly Fruit[]>([]);
```

For CVA/forms writes, value shape is normalized consistently:

- single mode: `null`/`undefined` -> `null`
- multi mode: `null`/`undefined` -> `[]`

## Running Tests

```bash
nx test select
```

## Running the Demo

```bash
nx serve demo
```

Navigate to `/select` in the browser.

## Accessibility

The select provides full ARIA semantics automatically:

- `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, and when `[required]="true"`, `aria-required` are set on the trigger via `SelectTriggerDirective`.
- `role="listbox"` and `role="option"` are managed by the listbox layer.
- Keyboard navigation: Enter, Space, and Arrow keys open the panel; Arrow keys navigate options; Enter/Space select; Escape and Tab close.
- Focus returns to the trigger after the panel closes.

**You must add `aria-label` or `aria-labelledby` to your trigger element** so screen readers announce the select's purpose:

```html
<button nxrSelectTrigger aria-label="Select a country">...</button>
```

## Implementation notes

**Listbox contract:** The select panel is rendered with an internal listbox. We rely on the listbox’s public API: `handleKeydown`, `listboxId()`, `activeOptionId()`, `isSelected`, and `scrollActiveIntoView`. If `@nexora-ui/listbox` changes that contract, this component may need updates.

**Display value:** `SelectComponent` uses `computeDisplayValue` / `resolveDisplayLabel` from `@nexora-ui/dropdown` internally. If you build a custom trigger and need the same string formatting, import those helpers from `@nexora-ui/dropdown` (not from this package).

## Performance — Large Lists

Each `[nxrSelectOption]` creates a directive instance and registers with the listbox. For lists with **100+ items**, rendering all options at once can impact open speed and memory.

Recommended approaches:

- **Fewer options in the DOM**: Bind options from parent state so only the current slice renders (pagination, virtual scroll, etc.). Do not add a search input inside the panel — that breaks listbox semantics; use **combobox** for type-to-filter.
- **Pagination / load-more**: Render a capped subset and load more on scroll or button click.
- **Virtual scrolling**: Set **`[virtualScroll]="true"`** and **`[virtualItems]`** on `<nxr-select>` to use the built-in **`@nexora-ui/listbox-cdk`** virtual block (same **`nxr-builtin-virtual-dropdown-panel`** + template directives as combobox). List height follows **`[maxHeight]`** (default `16rem`) into the CDK viewport. Built-in wiring uses **`createListboxVirtualDropdownPanelStyle`** and listbox-cdk overlay flex tokens so the virtual viewport gets a real block size under the pane **`maxHeight`**. Optional **`ng-template`** slots (import **`SelectVirtualOptionTemplateDirective`**, **`SelectVirtualHeaderTemplateDirective`**, **`SelectVirtualFooterTemplateDirective`**): **`nxrSelectVirtualOption`**, **`nxrSelectVirtualHeader`**, **`nxrSelectVirtualFooter`** — same semantics as combobox’s **`nxrComboboxVirtual*`** (implementation is one multi-selector directive per slot in listbox-cdk). **`virtualItemSize`** must match row block height when using a custom option template. Optional **`virtualTrackByKey`** overrides the row key; when omitted, the select uses **`accessors().value`** when accessors are set. If **`compareWith`** is not equivalent to comparing **`accessors.value`**, set **`virtualTrackByKey`** explicitly. **`virtualEmptyMessage`** customizes the empty list string (default `No results`). **Multi-select:** initial open scrolls to the first list row matching any selected value. **`#sel="nxrSelect"`** exposes **`virtualScroll()`** and **`virtualEmptyMessage()`** on the controller. Alternatively, integrate CDK inside **`nxrSelectPanel`** yourself; see [@nexora-ui/listbox-cdk README](../listbox-cdk/README.md).
