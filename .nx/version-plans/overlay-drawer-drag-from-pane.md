---
overlay: minor
---

## Drawer `dragFrom: 'pane'` option

Add optional `dragFrom: 'pane'` to drawer `dragToClose` config so consumers can drag the whole drawer surface (skipping buttons, links, and inputs) in addition to the existing handle-based drag (`dragFrom: 'handle'`, default).

**Usage notes**

- Prefer `dragFrom: 'handle'` with `nxrDrawerDragHandle` for touch devices and scrollable drawer content.
- `dragFrom: 'pane'` suits pointer-driven, mostly non-scrollable drawers (e.g. desktop).
