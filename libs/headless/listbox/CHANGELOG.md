## 0.3.4 (2026-06-10)

### 🩹 Fixes

- fix(listbox): default overlay panel pointerHighlight when missing from legacy select/combobox builds ([f237fca](https://github.com/zeyadelshaf3y/nexora/commit/f237fca))

  When `NxrListboxOverlayPanelHostComponent` forwards `panelContext.pointerHighlight()` to
  `[nxrListboxPointerHighlight]`, older select/combobox builds that omit the signal on the overlay
  panel context crash on open (`pointerHighlight is not a function`).
  - Make `pointerHighlight` optional on `NxrListboxOverlayPanelContext`.
  - Resolve binding via `listboxPointerHighlight` computed; default to `'off'` when absent.

### ❤️ Thank You

- Zeyad Alshafey

## 0.3.3 (2026-06-10)

### 🩹 Fixes

- Add opt-in hover pointer highlight for select and combobox, and mention suggestion rows. ([e1df7b9](https://github.com/zeyadelshaf3y/nexora/commit/e1df7b9))

  ### @nexora-ui/listbox (patch)
  - Extend `NxrListboxOverlayPanelContext` with `pointerHighlight` and forward it to `[nxrListboxPointerHighlight]` in the overlay panel host.

  ### @nexora-ui/listbox-cdk (patch)
  - Align overlay panel portal test fixture with the updated listbox panel context shape.

  ### @nexora-ui/select (minor)
  - Add `[pointerHighlight]="'hover' | 'off'"` input (default `'off'`).
  - Export `SelectPointerHighlight` type.

  ### @nexora-ui/combobox (minor)
  - Add `[pointerHighlight]="'hover' | 'off'"` input (default `'off'`).
  - Export `ComboboxPointerHighlight` type.

  ### @nexora-ui/mention (minor)
  - Add `[nxrMentionPointerHighlight]="'hover' | 'off'"` (default `'hover'`).
  - Add `MentionOptionDirective` (`[nxrMentionOption]="$index"`) for hover and mousedown highlight.
  - Fix portaled panel DI: `createMentionPanelOutletInjector` + `[ngTemplateOutletInjector]` on the panel host so option directives resolve `NXR_MENTION_CONTROLLER`.
  - Move panel tokens to `mention-panel-tokens.ts`.

  ### Consumer notes
  - Select/combobox: set `[pointerHighlight]="'hover'"` for menu-like hover (default preserves prior mousedown-only behavior).
  - Mention: add `[nxrMentionOption]="$index"` on each suggestion row when using hover highlight.

### ❤️ Thank You

- Zeyad Alshafey

## 0.3.2 (2026-06-09)

### 🩹 Fixes

- fix(listbox): publish deduplicated NXR_LISTBOX_CONTROLLER in internal bundle ([351ecc3](https://github.com/zeyadelshaf3y/nexora/commit/351ecc3))

  Republish after the internal entry import fix so select/combobox options receive
  NXR_LISTBOX_CONTROLLER and render with role="option".

### ❤️ Thank You

- Cursor @cursoragent
- Zeyad Alshafey

## 0.3.1 (2026-06-09)

### 🩹 Fixes

- fix(listbox): import primary entry in overlay host to dedupe NXR_LISTBOX_CONTROLLER

  The internal secondary bundle duplicated `NXR_LISTBOX_CONTROLLER`, so option directives from the primary entry could not inject the controller provided by the overlay panel. Options rendered without `role="option"` and did not register with the listbox.

### ❤️ Thank You

- Cursor
- Zeyad Alshafey
