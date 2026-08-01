---
listbox: patch
---

Fix hover pointer highlight so select/combobox keep the last hovered option for keyboard navigation.

### @nexora-ui/listbox (patch)

- **`pointerHighlight="hover"` + `role="listbox"`** (select/combobox): hovering an option sets it active; leaving the list or moving over non-option chrome **keeps** that option active so Arrow keys continue from it. (`role="menu"` still clears on leave — Radix-style.)
- **Reconcile**: do not re-seed `initialHighlight` after an intentional clear while options remain (empty → non-empty still seeds). Prevents snap-back to the first/selected option.
- **Effects**: wrap option register/refresh and accessors disabled-sync in `untracked` so reading `activeOption` during reconcile does not re-run those effects on every highlight change.

### Consumer notes

- Select/combobox: set `[pointerHighlight]="'hover'"` for this behavior (default remains `'off'` / mousedown-only).
- Menu behavior is unchanged.
