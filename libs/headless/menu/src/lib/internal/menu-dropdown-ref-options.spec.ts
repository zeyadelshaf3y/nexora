import { describe, expect, it, vi } from 'vitest';

import { MENU_BACKDROP_CLASS, MENU_PANE_CLASS } from '../constants/menu-constants';

import { buildMenuDropdownRefOptions } from './menu-dropdown-ref-options';

function minimalInput(
  overrides: Partial<Parameters<typeof buildMenuDropdownRefOptions>[0]> = {},
): Parameters<typeof buildMenuDropdownRefOptions>[0] {
  return {
    overlay: {} as Parameters<typeof buildMenuDropdownRefOptions>[0]['overlay'],
    destroyRef: {} as Parameters<typeof buildMenuDropdownRefOptions>[0]['destroyRef'],
    getAnchor: () => document.createElement('div'),
    configPreset: 'menu',
    placement: () => 'bottom-start',
    offset: () => 4,
    matchTriggerWidth: () => false,
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

describe('buildMenuDropdownRefOptions', () => {
  it('merges menu pane base class with user panelClass', () => {
    const opts = buildMenuDropdownRefOptions(
      minimalInput({ panelClass: () => ['app-menu-panel'] }),
    );
    expect(opts.panelClass?.()).toEqual([MENU_PANE_CLASS, 'app-menu-panel']);
  });

  it('merges menu backdrop base class with user backdropClass', () => {
    const opts = buildMenuDropdownRefOptions(
      minimalInput({ backdropClass: () => ['app-menu-backdrop'] }),
    );
    expect(opts.backdropClass?.()).toEqual([MENU_BACKDROP_CLASS, 'app-menu-backdrop']);
  });
});
