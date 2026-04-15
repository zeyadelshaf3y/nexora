# @nexora-ui/menu

Headless, accessible menu for Angular. Composes `@nexora-ui/listbox` (role=menu, action mode) and `@nexora-ui/dropdown` for overlay lifecycle. Directive-based API with trigger, panel, items, and groups. No value binding — on item activation the component emits `optionActivated` and closes. Zero opinionated styles; you own all markup and CSS.

**Public API:** Exports from `src/index.ts` are the supported surface ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)).

## Features

- Action-based: emit which item was chosen, then close (no form value or CVA)
- Full keyboard navigation (Enter, Space, Arrow keys, Escape, Tab)
- ARIA: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`, `role="menu"`, `role="menuitem"`
- Groups and separators (`nxrMenuGroup`, `nxrMenuGroupLabel`, `nxrMenuSeparator`)
- Default placement bottom-start with full 12-position fallbacks (via DropdownRef `configPreset: 'menu'`)
- Panel width does not match trigger by default (`matchTriggerWidth: false`)
- Focus returns to trigger on close

## Installation

```bash
npm install @nexora-ui/menu @nexora-ui/listbox @nexora-ui/overlay @nexora-ui/dropdown @nexora-ui/core
```

## Quick start

```html
<nxr-menu (optionActivated)="onAction($event)" #m="nxrMenu">
  <button nxrMenuTrigger aria-label="Actions">Actions</button>
  <ng-template nxrMenuPanel>
    <button [nxrMenuItem]="item1">Item 1</button>
    <button [nxrMenuItem]="item2">Item 2</button>
    <div nxrMenuGroup>
      <span nxrMenuGroupLabel>Section A</span>
      <button [nxrMenuItem]="itemA">A</button>
    </div>
    <div nxrMenuSeparator></div>
    <div nxrMenuGroup>
      <span nxrMenuGroupLabel>Section B</span>
      <button [nxrMenuItem]="itemB">B</button>
    </div>
  </ng-template>
</nxr-menu>
```

## API reference

### `<nxr-menu>` (MenuComponent)

| Input                      | Type                                           | Default          | Description                                                              |
| -------------------------- | ---------------------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| `disabled`                 | `boolean`                                      | `false`          | Disable the menu (trigger does not open).                                |
| `placement`                | `Placement`                                    | `'bottom-start'` | Preferred panel placement.                                               |
| `panelClass`               | `string \| string[]`                           | `undefined`      | CSS class(es) on the overlay pane.                                       |
| `panelStyle`               | `Record<string, string>`                       | `undefined`      | Inline styles on the pane.                                               |
| `backdropClass`            | `string \| string[]`                           | `undefined`      | CSS class(es) on the backdrop.                                           |
| `backdropStyle`            | `Record<string, string>`                       | `undefined`      | Inline styles on the backdrop.                                           |
| `beforeOpen`               | `() => boolean \| Promise<boolean>`            | `undefined`      | Return false to prevent opening.                                         |
| `beforeClose`              | `() => boolean \| Promise<boolean>`            | `undefined`      | Return false to prevent closing.                                         |
| `hasBackdrop`              | `boolean`                                      | `false`          | Show a backdrop behind the panel.                                        |
| `maxHeight`                | `string`                                       | `'16rem'`        | Max panel height.                                                        |
| `boundaries`               | `ViewportBoundaries`                           | `undefined`      | Viewport inset (px) for overlay max dimensions; same as select/combobox. |
| `offset`                   | `number`                                       | `4`              | Gap between trigger and panel (px).                                      |
| `matchTriggerWidth`        | `boolean`                                      | `false`          | When true, panel width matches trigger.                                  |
| `scrollStrategy`           | `'noop' \| 'reposition' \| 'block' \| 'close'` | `'noop'`         | Scroll behavior while open.                                              |
| `closeAnimationDurationMs` | `number`                                       | `150`            | Close animation duration before detach.                                  |
| `displayArrow`             | `boolean`                                      | `true`           | When true, show an arrow pointing at the trigger (like popover).         |
| `arrowSize`                | `{ width: number; height: number }`            | `undefined`      | Arrow dimensions in px. Default 12×6 when displayArrow is true.          |

| Output            | Payload                    | Description                                                              |
| ----------------- | -------------------------- | ------------------------------------------------------------------------ |
| `optionActivated` | `{ option: T }`            | Fired when the user activates an item (Enter/click); panel closes after. |
| `opened`          | (none)                     | Fired when the panel opens.                                              |
| `closed`          | `CloseReason \| undefined` | Fired when the panel closes.                                             |

Close reason semantics:

- Item activation closes with `selection`.
- Programmatic API close (`close()`) emits `programmatic` by default.
- Escape/outside/backdrop/scroll emit their matching close reasons.

| Property / method        | Description                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isOpen()`               | Whether the panel is open.                                                                                                                                |
| `isDisabled()`           | Effective disabled state (`[disabled]` or `disable()`).                                                                                                   |
| `listboxId()`            | Listbox element ID when open; null when closed.                                                                                                           |
| `activeOptionId()`       | Active (highlighted) option ID when open.                                                                                                                 |
| `open()`                 | Open the panel. Returns `Promise<boolean>`.                                                                                                               |
| `close()`                | Close the panel.                                                                                                                                          |
| `toggle()`               | Toggle open/close.                                                                                                                                        |
| `focusTrigger()`         | Focus the trigger element.                                                                                                                                |
| `disable()` / `enable()` | Programmatic disable (in addition to `[disabled]`); aligned with select/combobox. If open, `disable()` closes the panel with reason `programmatic` first. |

### `[nxrMenuTrigger]`

Place on the trigger element (e.g. `<button>`). Sets ARIA and delegates click/keydown.

### `[nxrMenuPanel]`

Place on an `<ng-template>`. Content is rendered inside the overlay.

### `[nxrMenuItem]`

Place on each menu item. Input: the option value (e.g. `[nxrMenuItem]="item"`). Activates on Enter/click; emits `optionActivated` and closes.

### `[nxrMenuGroup]`

Wraps a group of items. Sets `role="group"` and `aria-labelledby`. Prefer `nxrMenuGroupLabel` on the label element; optional input `[nxrMenuGroup]="id"` for legacy manual id.

### `[nxrMenuGroupLabel]`

Place on the group label inside `nxrMenuGroup`. No inputs.

### `[nxrMenuSeparator]`

Visual/a11y separator between groups. Sets `role="separator"`.

## Implementation notes

Focused modules under `src/lib/internal/` complement `MenuComponent`: **`buildMenuDropdownRefOptions`** (pane class + **`buildHeadlessDropdownRefOptions`**), **`handleMenuDropdownOpened`/`Closed`**, **`createMenuPanelPortal`**, **`assertMenuContentStructure`**, **`focusMenuPanelAutofocusTarget`**, and **`MENU_PANE_CLASS`** / **`MENU_DEFAULT_ARROW`** in **`constants/`**. They are not re-exported from the package root. Trigger **`keydown`** uses **`routeHeadlessDropdownTriggerKeydown`** from **`@nexora-ui/dropdown`** (same **`OPEN_KEYS`** path as select).

## Accessibility

- Trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`. Add `aria-label` or `aria-labelledby` for screen readers.
- Panel: `role="menu"`; items `role="menuitem"`. Keyboard: Enter/Space/Arrows open and navigate; Enter/Space activate; Escape/Tab close. Focus restores to the trigger on close.

## Running tests

```bash
nx test menu
```
