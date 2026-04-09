import { describe, expect, it, vi } from 'vitest';

import { SELECT_PANE_CLASS } from '../constants/select-constants';

import { buildSelectDropdownRefOptions } from './select-dropdown-ref-options';

function minimalInput(
  overrides: Partial<Parameters<typeof buildSelectDropdownRefOptions>[0]> = {},
): Parameters<typeof buildSelectDropdownRefOptions>[0] {
  return {
    overlay: {} as Parameters<typeof buildSelectDropdownRefOptions>[0]['overlay'],
    destroyRef: {} as Parameters<typeof buildSelectDropdownRefOptions>[0]['destroyRef'],
    getAnchor: () => document.createElement('div'),
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

describe('buildSelectDropdownRefOptions', () => {
  it('merges select pane base class with user panelClass', () => {
    const opts = buildSelectDropdownRefOptions(
      minimalInput({ panelClass: () => ['app-select-panel'] }),
    );
    expect(opts.panelClass?.()).toEqual([SELECT_PANE_CLASS, 'app-select-panel']);
  });

  it('when virtual panel is on, panelStyle includes flex column base from merge helper', () => {
    const opts = buildSelectDropdownRefOptions(
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
