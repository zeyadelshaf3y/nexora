/**
 * `@nexora-ui/listbox-cdk/internal` — portal factory, virtual index math, viewport scroll, first-paint scheduling.
 * See `internal/README.md`.
 */

export {
  createBuiltinVirtualPanelSignals,
  type BuiltinVirtualPanelSignalsContext,
} from './lib/virtual/builtin-virtual-panel-signals';
export { createListboxOverlayPanelPortal } from './lib/portal/listbox-overlay-panel-portal';
export {
  computeBuiltinVirtualSelectedIndex,
  type BuiltinVirtualSelectedIndexParams,
} from './lib/virtual/compute-builtin-virtual-selected-index';
export {
  computeVirtualSelectedIndex,
  type ComputeVirtualSelectedIndexParams,
  type VirtualSelectionAccessors,
} from './lib/virtual/compute-virtual-selected-index';
export {
  resolveVirtualLabelFor,
  resolveVirtualTrackKeyFn,
} from './lib/virtual/virtual-panel-resolve';
export { findIndexBySameItem } from './lib/virtual/find-index-by-same-item';
export {
  getViewportVisibleHeightClippedByListbox,
  scheduleVirtualViewportSync,
  scrollVirtualViewportToIndex,
  type VirtualViewportLike,
} from './lib/virtual/scroll-virtual-viewport';
export {
  afterVirtualPanelFirstPaint,
  type VirtualPanelFirstPaintOptions,
} from './lib/virtual/virtual-panel-first-paint';
