---
listbox: patch
listbox-cdk: patch
select: minor
combobox: minor
mention: minor
---

Add opt-in hover pointer highlight for select and combobox, and mention suggestion rows.

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
