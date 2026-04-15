import { mergeVirtualDropdownPaneStyle } from './merge-virtual-dropdown-pane-style';

describe('mergeVirtualDropdownPaneStyle', () => {
  it('returns user style unchanged when disabled', () => {
    const user = { color: 'red' };
    expect(mergeVirtualDropdownPaneStyle(false, user)).toBe(user);
    expect(mergeVirtualDropdownPaneStyle(false, undefined)).toBeUndefined();
  });

  it('returns flex base when enabled and no user style', () => {
    expect(mergeVirtualDropdownPaneStyle(true, undefined)).toEqual({
      display: 'flex',
      'flex-direction': 'column',
      'min-height': '0',
    });
  });

  it('adds height/max-height/overflow when enabled with paneBlockSize', () => {
    expect(mergeVirtualDropdownPaneStyle(true, undefined, '16rem')).toEqual({
      display: 'flex',
      'flex-direction': 'column',
      'min-height': '0',
      height: '16rem',
      'max-height': '16rem',
      overflow: 'hidden',
    });
  });

  it('shallow-merges user on top when enabled', () => {
    expect(
      mergeVirtualDropdownPaneStyle(true, {
        display: 'grid',
        color: 'blue',
      }),
    ).toEqual({
      display: 'grid',
      'flex-direction': 'column',
      'min-height': '0',
      color: 'blue',
    });
  });
});
