/**
 * @nexora-ui/dropdown — shared dropdown primitive for Select, Menu, Combobox.
 * Overlay lifecycle, trigger keyboard (when open), focus restore, resize observation.
 * Also provides display-value helpers (resolveDisplayLabel, computeDisplayValue) used by select and combobox.
 *
 * **Anchored panel options:** use {@link buildHeadlessDropdownRefOptions} / {@link HeadlessDropdownRefOptionsInput}
 * when constructing {@link DropdownRefOptions} for select, menu, and combobox.
 *
 * Tree-shakable: import only what you use (e.g. DropdownRef + OPEN_KEYS, or computeDisplayValue).
 */

export { DropdownRef } from './lib/ref';
export type { DropdownConfigPreset, DropdownRefOptions, DropdownOption } from './lib/ref';

export {
  OPEN_KEYS,
  SCROLL_STRATEGY_MAP,
  DEFAULT_OFFSET,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_CLOSE_ANIMATION_MS,
} from './lib/constants';
export type { DropdownScrollStrategy } from './lib/constants';

export { resolveDisplayLabel, computeDisplayValue } from './lib/utils/display-value';
export type { DisplayLabelAccessor } from './lib/utils/display-value';
export { handleClosedTriggerOpenKey } from './lib/utils/trigger-open-keys';
export { routeHeadlessDropdownTriggerKeydown } from './lib/utils/route-headless-dropdown-trigger-keydown';
export {
  getEmptySelectionValue,
  hasSelectionValue,
  normalizeSingleOrMultiValue,
  toSelectedValuesArray,
} from './lib/utils/selection-value';
export {
  canOpenDropdown,
  applyOpenedTransition,
  applyClosedTransition,
  shouldQueueSkipNextOpenOnFocus,
  shouldRefocusAfterSelectionClose,
} from './lib/utils/open-state';
export {
  mergeDropdownBackdropClasses,
  mergeDropdownPaneClasses,
} from './lib/utils/merge-dropdown-pane-classes';
export {
  createListboxVirtualDropdownPanelStyle,
  type ListboxVirtualDropdownPanelStyleSources,
} from './lib/utils/create-listbox-virtual-dropdown-panel-style';
export { mergeVirtualDropdownPaneStyle } from './lib/utils/merge-virtual-dropdown-pane-style';
export { resolveOpenPanelDirective } from './lib/utils/resolve-open-panel-directive';
export {
  buildHeadlessDropdownRefOptions,
  type HeadlessDropdownRefOptionsInput,
} from './lib/utils/build-headless-dropdown-ref-options';
export { teardownAnchoredDropdownHostState } from './lib/utils/teardown-anchored-dropdown-host';
