/**
 * @nexora-ui/combobox — headless combobox primitive.
 *
 * Composes @nexora-ui/listbox and @nexora-ui/overlay (via dropdown) to provide
 * an accessible combobox with input, search, single/multi selection, and CVA.
 * Zero opinionated styles; user owns list, filtering, and UI.
 */

export { ComboboxComponent } from './lib/component/combobox.component';
export { ComboboxInputDirective } from './lib/directives/combobox-input.directive';
export { ComboboxToggleDirective } from './lib/directives/combobox-toggle.directive';
export { ComboboxPanelDirective } from './lib/directives/combobox-panel.directive';
export { ComboboxOptionDirective } from './lib/directives/combobox-option.directive';
export { ComboboxGroupDirective } from './lib/directives/combobox-group.directive';
export { ComboboxGroupLabelDirective } from './lib/directives/combobox-group-label.directive';
export { ComboboxSeparatorDirective } from './lib/directives/combobox-separator.directive';
export { ComboboxClearDirective } from './lib/directives/combobox-clear.directive';
export { ComboboxAnchorDirective } from './lib/directives/combobox-anchor.directive';
export {
  ComboboxVirtualFooterTemplateDirective,
  ComboboxVirtualHeaderTemplateDirective,
  ComboboxVirtualOptionTemplateDirective,
} from './lib/directives/combobox-virtual-panel-templates.directive';
export { NXR_COMBOBOX, type ComboboxController } from './lib/tokens/combobox-tokens';
export type {
  ComboboxAccessors,
  ComboboxInitialHighlight,
  ComboboxScrollStrategy,
} from './lib/types/combobox-types';
