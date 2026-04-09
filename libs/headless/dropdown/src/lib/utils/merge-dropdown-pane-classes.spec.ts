import { mergeDropdownPaneClasses } from './merge-dropdown-pane-classes';

describe('mergeDropdownPaneClasses', () => {
  it('returns only base when user class is undefined', () => {
    expect(mergeDropdownPaneClasses('nxr-base', undefined)).toEqual(['nxr-base']);
  });

  it('returns only base when user class is empty string', () => {
    expect(mergeDropdownPaneClasses('nxr-base', '')).toEqual(['nxr-base']);
  });

  it('appends a string user class', () => {
    expect(mergeDropdownPaneClasses('nxr-base', 'user')).toEqual(['nxr-base', 'user']);
  });

  it('appends array user classes', () => {
    expect(mergeDropdownPaneClasses('nxr-base', ['a', 'b'])).toEqual(['nxr-base', 'a', 'b']);
  });
});
