import { createListboxVirtualDropdownPanelStyle } from './create-listbox-virtual-dropdown-panel-style';
import { mergeVirtualDropdownPaneStyle } from './merge-virtual-dropdown-pane-style';

describe('createListboxVirtualDropdownPanelStyle', () => {
  it('returns a getter that delegates to mergeVirtualDropdownPaneStyle', () => {
    const get = createListboxVirtualDropdownPanelStyle({
      useVirtualPanel: () => true,
      panelStyle: () => ({ color: 'blue' }),
      maxHeight: () => '12rem',
    });
    expect(get()).toEqual(mergeVirtualDropdownPaneStyle(true, { color: 'blue' }, '12rem'));
  });
});
