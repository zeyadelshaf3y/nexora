import { describe, expect, it, vi } from 'vitest';

import { COMBOBOX_BACKDROP_CLASS, COMBOBOX_PANE_CLASS } from '../constants/combobox-constants';

import { buildComboboxDropdownRefOptions } from './combobox-dropdown-ref-options';

function minimalInput(
  overrides: Partial<Parameters<typeof buildComboboxDropdownRefOptions>[0]> = {},
): Parameters<typeof buildComboboxDropdownRefOptions>[0] {
  return {
    overlay: {} as Parameters<typeof buildComboboxDropdownRefOptions>[0]['overlay'],
    destroyRef: {} as Parameters<typeof buildComboboxDropdownRefOptions>[0]['destroyRef'],
    getAnchor: () => document.createElement('div'),
    getFocusRestoreTarget: () => null,
    placement: () => 'bottom',
    offset: () => 4,
    matchTriggerWidth: () => true,
    scrollStrategy: () => 'noop',
    maintainInViewport: () => true,
    closeAnimationDurationMs: () => 0,
    maxHeight: () => '16rem',
    hasBackdrop: () => false,
    panelClass: () => undefined,
    backdropClass: () => undefined,
    panelStyle: () => undefined,
    backdropStyle: () => undefined,
    beforeOpen: () => undefined,
    beforeClose: () => undefined,
    useVirtualPanel: () => false,
    onOpened: vi.fn(),
    onClosed: vi.fn(),
    ...overrides,
  };
}

describe('buildComboboxDropdownRefOptions', () => {
  it('merges combobox pane base class with user panelClass', () => {
    const opts = buildComboboxDropdownRefOptions(
      minimalInput({ panelClass: () => ['app-combo-panel'] }),
    );
    expect(opts.panelClass?.()).toEqual([COMBOBOX_PANE_CLASS, 'app-combo-panel']);
  });

  it('merges combobox backdrop base class with user backdropClass', () => {
    const opts = buildComboboxDropdownRefOptions(
      minimalInput({ backdropClass: () => ['app-combo-backdrop'] }),
    );
    expect(opts.backdropClass?.()).toEqual([COMBOBOX_BACKDROP_CLASS, 'app-combo-backdrop']);
  });

  it('when virtual panel is on, panelStyle includes flex column base from merge helper', () => {
    const opts = buildComboboxDropdownRefOptions(
      minimalInput({
        useVirtualPanel: () => true,
        panelStyle: () => ({ border: '1px solid red' }),
        maxHeight: () => '200px',
      }),
    );
    const style = opts.panelStyle?.();
    expect(style).toMatchObject({
      display: 'flex',
      'flex-direction': 'column',
      border: '1px solid red',
      height: '200px',
      'max-height': '200px',
      overflow: 'hidden',
    });
  });
});
