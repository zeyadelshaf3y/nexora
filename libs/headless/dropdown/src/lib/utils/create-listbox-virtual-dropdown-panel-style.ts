import { mergeVirtualDropdownPaneStyle } from './merge-virtual-dropdown-pane-style';

export type ListboxVirtualDropdownPanelStyleSources = {
  useVirtualPanel: () => boolean;
  panelStyle: () => Record<string, string> | undefined;
  maxHeight: () => string;
};

/** Stable `panelStyle` getter for combobox/select built-in virtual mode. */
export function createListboxVirtualDropdownPanelStyle(
  sources: ListboxVirtualDropdownPanelStyleSources,
): () => Record<string, string> | undefined {
  return () =>
    mergeVirtualDropdownPaneStyle(
      sources.useVirtualPanel(),
      sources.panelStyle(),
      sources.maxHeight(),
    );
}
