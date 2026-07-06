---
overlay: patch
---

Fix anchored overlay text wrapping at viewport edges.

### @nexora-ui/overlay (patch)

- Fix: set `width: max-content` on anchored overlay panes when no explicit width is configured. Fixed-position panes with `width: auto` shrink to the space right of `left`, which caused tooltips and similar anchored panels near viewport edges to wrap text even when room was available on the other side.
