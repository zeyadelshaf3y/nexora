# `@nexora-ui/listbox-cdk/internal`

Secondary entry for **Nexora headless packages** (combobox/select) and authors of custom overlay-mounted virtual lists.

## Exports (by folder)

- **`lib/portal/`** — `createListboxOverlayPanelPortal`
- **`lib/virtual/builtin-virtual-panel-signals.ts`** — `createBuiltinVirtualPanelSignals`
- **`lib/virtual/compute-*.ts`** — initial scroll index for single/multi selection
- **`lib/virtual/virtual-panel-resolve.ts`** — label + track key defaults from listbox accessors
- **`lib/virtual/scroll-virtual-viewport.ts`** — `scrollVirtualViewportToIndex`, listbox-clipped visibility height, CDK sync scheduling
- **`lib/virtual/virtual-panel-first-paint.ts`** — `afterVirtualPanelFirstPaint` (overlay 0×0 mitigation)
- **`lib/virtual/find-index-by-same-item.ts`** — fallback when track-key map misses

Typical apps should use built-in virtual mode on combobox/select or `ListboxCdkVirtualPanelComponent` from the root entry. Import `internal` only for portal wiring, selection index math, or viewport helpers.
