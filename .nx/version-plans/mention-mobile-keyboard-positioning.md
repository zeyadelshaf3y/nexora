---
core: patch
overlay: patch
mention: patch
---

Fix mention panel positioning on mobile when the soft keyboard is open.

### @nexora-ui/core (patch)

- **`getViewportRect`**: prefer the **visual viewport** (with `offsetLeft` / `offsetTop`) when available so overlays clamp/flip against the area actually on screen (mobile soft keyboard, pinch-zoom). Falls back to the CSS layout viewport when visual viewport is missing or reports a zero size.

### @nexora-ui/overlay (patch)

- **`intersectHostRectWithVisibleViewport`**: clip host rects against visual-viewport origins (non-zero `left`/`top`) instead of assuming a `(0, 0)` layout origin. Keeps host-contained max sizes and positioning correct when the keyboard pans the visual viewport.

### @nexora-ui/mention (patch)

- Virtual anchor exposes a **live** caret/trigger `getBoundingClientRect` so the panel stays tied to the `@` instead of drifting from a copied `position: fixed` box during keyboard open/pan.
- Track `visualViewport` scroll/resize (in addition to window scroll/resize) and remeasure the overlay while the panel is open.
- Improve zero-size caret probing on mobile WebKit so collapsed carets still resolve a usable anchor rect.
