/**
 * @nexora-ui/listbox — headless listbox primitive for Select, Combobox, Command, menus.
 * Item-based options, selection and action modes, keyboard and ARIA.
 */

export { ListboxDirective } from './lib/directives/listbox.directive';
export { ListboxOptionDirective } from './lib/directives/listbox-option.directive';
export { ListboxGroupDirective } from './lib/directives/listbox-group.directive';
export { ListboxGroupLabelDirective } from './lib/directives/listbox-group-label.directive';
export { ListboxSeparatorDirective } from './lib/directives/listbox-separator.directive';
export { NxrListboxVirtualScrollRegistry } from './lib/internal/virtual-scroll-registry';

export {
  NXR_LISTBOX_CONTROLLER,
  NXR_LISTBOX_VIRTUAL_SCROLL_HANDLER,
  type NxrListboxController,
  type NxrListboxVirtualScrollHandler,
  type ListboxRole,
  type ListboxOrientation,
  type ListboxInitialHighlight,
  type ListboxBoundary,
  type ListboxScrollAlignment,
  type ListboxAccessors,
  type ListboxOptionActivatedEvent,
} from './lib/types';
export {
  bindListboxReadyWithActiveScroll,
  scheduleListboxScrollActiveOnNextMicrotask,
  type ListboxScrollActiveCapable,
} from './lib/utils/listbox-schedule-initial-scroll';
export { createListboxPanelOutletInjector } from './lib/utils/create-listbox-panel-outlet-injector';
