---
listbox: patch
---

fix(listbox): default overlay panel pointerHighlight when missing from legacy select/combobox builds

When `NxrListboxOverlayPanelHostComponent` forwards `panelContext.pointerHighlight()` to
`[nxrListboxPointerHighlight]`, older select/combobox builds that omit the signal on the overlay
panel context crash on open (`pointerHighlight is not a function`).

- Make `pointerHighlight` optional on `NxrListboxOverlayPanelContext`.
- Resolve binding via `listboxPointerHighlight` computed; default to `'off'` when absent.
