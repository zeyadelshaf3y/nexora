/**
 * @nexora-ui/menu — headless menu primitive.
 *
 * Composes @nexora-ui/listbox (role=menu, action mode) and @nexora-ui/dropdown
 * for overlay lifecycle. Directive-based API with trigger, panel, items, groups.
 * No value binding; optionActivated emit then close.
 */

export { MenuComponent } from './lib/component/menu.component';
export {
  DEFAULT_MENU_DEFAULTS_CONFIG,
  MENU_DEFAULTS_CONFIG,
  provideMenuDefaults,
  type MenuDefaultsConfig,
} from './lib/component/menu-defaults.config';
export { MenuTriggerDirective } from './lib/directives/menu-trigger.directive';
export { MenuPanelDirective } from './lib/directives/menu-panel.directive';
export { MenuItemDirective } from './lib/directives/menu-item.directive';
export { MenuGroupDirective } from './lib/directives/menu-group.directive';
export { MenuGroupLabelDirective } from './lib/directives/menu-group-label.directive';
export { MenuSeparatorDirective } from './lib/directives/menu-separator.directive';
export { NXR_MENU, type MenuController } from './lib/tokens/menu-tokens';
export type { MenuOptionActivatedEvent } from './lib/types/menu-types';
export type { CloseReason } from '@nexora-ui/overlay';
