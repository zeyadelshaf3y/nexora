/**
 * Re-exports built-in virtual panel template directives under combobox-specific names.
 * Implementation lives in `@nexora-ui/listbox-cdk` (shared with `nxr-select`).
 */

export {
  BuiltinVirtualPanelFooterTemplateDirective as ComboboxVirtualFooterTemplateDirective,
  BuiltinVirtualPanelHeaderTemplateDirective as ComboboxVirtualHeaderTemplateDirective,
  BuiltinVirtualPanelOptionTemplateDirective as ComboboxVirtualOptionTemplateDirective,
} from '@nexora-ui/listbox-cdk';
