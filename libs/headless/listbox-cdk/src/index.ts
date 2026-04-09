/**
 * @nexora-ui/listbox-cdk — CDK virtual scrolling for Nexora listbox.
 *
 * **Public:** components under `lib/components/`, overlay flex tokens under `lib/layout/`.
 * **Internal:** `lib/virtual/`, `lib/portal/` via `@nexora-ui/listbox-cdk/internal`.
 */

export { ListboxCdkVirtualPanelComponent } from './lib/components/listbox-cdk-virtual-panel.component';
/** Referenced from combobox/select `imports` arrays; must stay on the root entry for static analysis. */
export { BuiltinVirtualDropdownPanelComponent } from './lib/components/builtin-virtual-dropdown-panel.component';
export {
  BuiltinVirtualPanelFooterTemplateDirective,
  BuiltinVirtualPanelHeaderTemplateDirective,
  BuiltinVirtualPanelOptionTemplateDirective,
} from './lib/components/builtin-virtual-panel-template.directives';

/** CSS hook for custom virtual panels that must participate in the same overlay flex chain as the built-in shell. */
export { NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS } from './lib/layout/overlay-flex-layout';
