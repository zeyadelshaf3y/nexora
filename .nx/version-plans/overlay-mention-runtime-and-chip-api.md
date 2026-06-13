---
overlay: minor
mention: minor
---

Add overlay runtime control APIs and mention custom chip templates.

### @nexora-ui/overlay (minor)

- Provide the `OVERLAY_REF` injection token to component content, so portaled dialog/drawer content can control its own overlay without a manual `injector` factory.
- Add `OverlayRef` runtime control: `updateSize` (reset-to-`auto`, `panelStyle` preservation, host-scoped max support), `addPanelClass` / `removePanelClass`, and `addCloseGuard`.
- Add `OverlayRef` lifecycle accessors `isOpen()`, `afterOpened()` (replayed, so it is observable from the ref returned by `open()`), and `beforeClosed()`.
- Fix: keep the pane `transform-origin` anchored to the configured `transformOriginElement` on every reposition, so dialogs grow from the trigger instead of their center.
- Fix: anchor the pane close-registry on `globalThis` so `@nexora-ui/overlay` and `@nexora-ui/overlay/internal` share one map.

> **Interface expansion:** `OverlayRef` gained `isOpen`, `afterOpened`, `beforeClosed`, `updateSize`, `addPanelClass`, `removePanelClass`, and `addCloseGuard`. Code that **implements** `OverlayRef` directly must add these members. Code that only **consumes** `OverlayRef` is unaffected.

### @nexora-ui/mention (minor)

- Add `MentionChipDirective` (`nxrMentionChip`) for custom chip templates, plus the supporting public types: `MentionChipContext`, `MentionEntityTarget`, `MentionEntityPredicate`, `MentionUpsertOptions`, `MentionReplaceOptions`, `MentionFocusOptions`, `MentionUpdateDocumentOptions`, `MentionAttributesUpdate`, and `MentionDocumentUpdater`.
- Re-render existing chips when the registered chip templates (or their trigger) change.
- Target the correct chip for `updateMentionAttributes` when multiple mentions share an id (matcher-by-index).
