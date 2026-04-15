/**
 * @nexora-ui/select — headless select primitive.
 *
 * Composes `@nexora-ui/listbox` and `@nexora-ui/overlay` to provide
 * a fully accessible dropdown select with keyboard navigation,
 * single/multi selection, form bindings, and zero opinionated styles.
 */

export { SelectComponent } from './lib/component/select.component';
export {
  DEFAULT_SELECT_DEFAULTS_CONFIG,
  SELECT_DEFAULTS_CONFIG,
  provideSelectDefaults,
  type SelectDefaultsConfig,
} from './lib/component/select-defaults.config';
export { SelectTriggerDirective } from './lib/directives/select-trigger.directive';
export { SelectClearDirective } from './lib/directives/select-clear.directive';
export { SelectPanelDirective } from './lib/directives/select-panel.directive';
export { SelectOptionDirective } from './lib/directives/select-option.directive';
export { SelectGroupDirective } from './lib/directives/select-group.directive';
export { SelectGroupLabelDirective } from './lib/directives/select-group-label.directive';
export { SelectSeparatorDirective } from './lib/directives/select-separator.directive';
export {
  SelectVirtualFooterTemplateDirective,
  SelectVirtualHeaderTemplateDirective,
  SelectVirtualOptionTemplateDirective,
} from './lib/directives/select-virtual-panel-templates.directive';
export { NXR_SELECT, type SelectController } from './lib/tokens/select-tokens';
export {
  type SelectAccessors,
  type SelectInitialHighlight,
  type SelectScrollStrategy,
} from './lib/types/select-types';
