# Dropdowns: Select & Combobox

When to use each, shared patterns, and how to wire clear buttons and chips.

## When to use which

| Use case                                                            | Component    | Notes                                                                                                                                               |
| ------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pick from a list; trigger opens an **options-only** panel (listbox) | **Select**   | Panel must not contain a search/filter input (invalid listbox children). Shrink options via **parent** state; for type-to-filter, use **Combobox**. |
| Type to search + pick one or more                                   | **Combobox** | Input is the trigger; `searchChange` (or `search()`) drives filtering in the parent; panel list stays options-only.                                 |

Both support single/multi, `[(value)]`, CVA, grouped options, and the same overlay options (placement, scroll strategy, etc.). See [select README](../libs/headless/select/README.md) and [combobox README](../libs/headless/combobox/README.md).

## Close reason semantics

- **Select:** option click in single mode closes with `selection`; Escape/outside/backdrop/scroll map to their matching reasons; `close()` emits `programmatic` by default.
- **Combobox:** single selection closes with `selection`; multi selection stays open; Escape/outside/backdrop/scroll map to matching reasons; `close()` emits `programmatic` by default.
- **Menu:** activating a menu item closes with `selection`; Escape/outside/backdrop/scroll map to matching reasons; `close()` emits `programmatic` by default.

This keeps `closed` payloads consistent across trigger-driven dropdown primitives.

## Shared controller API (template ref)

Use `#ref="nxrSelect"` or `#ref="nxrCombobox"` to read state and call methods:

| Signal / method                   | Select | Combobox | Purpose                                                                                                          |
| --------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `displayValue()`                  | ✓      | ✓        | Label(s) for the trigger / input placeholder when empty.                                                         |
| `hasValue()`                      | ✓      | ✓        | Whether there is a selection (single: value != null, multi: length > 0).                                         |
| `selectedValues()`                | ✓      | ✓        | Selection as `readonly unknown[]`. Multi: value as array; single: `[value]` or `[]`. Use for chips or iteration. |
| `isOpen`                          | ✓      | ✓        | Panel open state.                                                                                                |
| `reset()`                         | ✓      | ✓        | Clear selection, notify CVA, close panel.                                                                        |
| `focusTrigger()` / `focusInput()` | ✓      | ✓        | Move focus after clear or when scrolling to the control.                                                         |

Binding: keep `[(value)]` (or `[value]` + `(valueChange)`) on the component for form sync; use **`selectedValues()`** and **`hasValue()`** in the template for **display** (chips, conditional clear icon, counts).

## Clear button pattern

- **Select:** `[nxrSelectClear]` on the clear element. Clears value, closes panel if open, focuses trigger. Use a `<span role="button" tabindex="0">` inside the trigger (so you don’t nest buttons) and only show when `hasValue()`.
- **Combobox:** `[nxrComboboxClear]`; optional `[clearSearch]="true"`. Clears value (and optionally search), focuses next sibling (e.g. toggle).

Both directives handle click and (for select) Enter/Space when the clear is focused.

## Chips / multi display

Use the controller’s **`selectedValues()`** so the component is the single source of truth:

```html
@for (c of sel.selectedValues(); track c.code) {
<span class="chip">{{ c.name }}</span>
}
```

Same for combobox: `@for (c of combo.selectedValues(); track c.code)`.

## Large lists (built-in virtual mode)

Both components support **`virtualScroll`** + **`virtualItems`** using **`@nexora-ui/listbox-cdk`** (CDK viewport + listbox virtual-scroll handler). The dropdown overlay must combine **`createListboxVirtualDropdownPanelStyle`** / **`mergeVirtualDropdownPaneStyle`** (`@nexora-ui/dropdown`) with listbox-cdk’s flex-column host layout so the viewport is not **0px** tall when the pane only has **`max-height`**. See [listbox-cdk README](../libs/headless/listbox-cdk/README.md) and the “Performance” sections in the select and combobox READMEs.

## Docs and demos

- **Select:** [libs/headless/select/README.md](../libs/headless/select/README.md) — API, `nxrSelectClear`, `hasValue` / `selectedValues`, forms.
- **Combobox:** [libs/headless/combobox/README.md](../libs/headless/combobox/README.md) — API, `nxrComboboxClear`, `selectedValues`, filtering.
- **Demo app:** Run `nx serve demo` and open `/select` and `/combobox`. Select shows listbox-safe patterns (including narrowing options from outside the panel); combobox shows type-to-filter.
