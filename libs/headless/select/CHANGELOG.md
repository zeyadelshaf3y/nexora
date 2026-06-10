## 0.3.1 (2026-06-10)

### 🧱 Updated Dependencies

- Updated listbox-cdk to 0.1.9
- Updated listbox to 0.3.4

## 0.3.0 (2026-06-10)

### 🚀 Features

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

### 🧱 Updated Dependencies

- Updated listbox-cdk to 0.1.8
- Updated listbox to 0.3.3

### ❤️ Thank You

- Zeyad Alshafey

## 0.2.5 (2026-06-09)

### 🧱 Updated Dependencies

- Updated listbox-cdk to 0.1.7
- Updated listbox to 0.3.2

## 0.2.4 (2026-06-09)

### 🧱 Updated Dependencies

- Updated listbox-cdk to 0.1.6
- Updated listbox to 0.3.1

## 0.1.1 (2026-05-01)

### 🧱 Updated Dependencies

- Updated overlay to 0.1.1
- Updated listbox-cdk to 0.1.1
- Updated dropdown to 0.1.1
