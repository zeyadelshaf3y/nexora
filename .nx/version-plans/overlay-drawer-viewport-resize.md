---
overlay: patch
---

Fix drawer and dialog viewport sizing after the layout viewport grows.

### @nexora-ui/overlay (patch)

- Fix: refresh viewport-capped `max-width` / `max-height` on reposition for unanchored overlays (drawer, dialog). Previously the open-time pixel cap could outlive a taller viewport (e.g. devtools console closed), so start/end drawers with default `height: 100vh` stayed short instead of filling the screen.
