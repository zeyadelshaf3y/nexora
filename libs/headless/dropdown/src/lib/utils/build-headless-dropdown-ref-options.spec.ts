import { describe, expect, it, vi } from 'vitest';

import { buildHeadlessDropdownRefOptions } from './build-headless-dropdown-ref-options';

function minimalInput(
  overrides: Partial<Parameters<typeof buildHeadlessDropdownRefOptions>[0]> = {},
): Parameters<typeof buildHeadlessDropdownRefOptions>[0] {
  return {
    overlay: {} as Parameters<typeof buildHeadlessDropdownRefOptions>[0]['overlay'],
    destroyRef: {} as Parameters<typeof buildHeadlessDropdownRefOptions>[0]['destroyRef'],
    getAnchor: () => document.createElement('div'),
    placement: () => 'bottom',
    offset: () => 4,
    matchTriggerWidth: () => true,
    scrollStrategy: () => 'noop',
    maintainInViewport: () => true,
    closeAnimationDurationMs: () => 0,
    maxHeight: () => '16rem',
    hasBackdrop: () => false,
    basePaneClass: 'nxr-test-pane',
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

describe('buildHeadlessDropdownRefOptions', () => {
  it('merges basePaneClass with user panelClass', () => {
    const opts = buildHeadlessDropdownRefOptions(
      minimalInput({
        basePaneClass: 'nxr-select-pane',
        panelClass: () => ['app'],
      }),
    );
    expect(opts.panelClass?.()).toEqual(['nxr-select-pane', 'app']);
  });

  it('sets getFocusRestoreTarget when provided', () => {
    const restore = () => document.createElement('input');
    const opts = buildHeadlessDropdownRefOptions(minimalInput({ getFocusRestoreTarget: restore }));
    expect(opts.getFocusRestoreTarget).toBe(restore);
  });

  it('omits getFocusRestoreTarget when not provided', () => {
    const opts = buildHeadlessDropdownRefOptions(minimalInput());
    expect(opts.getFocusRestoreTarget).toBeUndefined();
  });

  it('omits boundaries when not provided', () => {
    const opts = buildHeadlessDropdownRefOptions(minimalInput());
    expect(opts.boundaries).toBeUndefined();
  });

  it('forwards boundaries when provided', () => {
    const b = { top: 1, right: 2, bottom: 3, left: 4 };
    const opts = buildHeadlessDropdownRefOptions(minimalInput({ boundaries: () => b }));
    expect(opts.boundaries?.()).toEqual(b);
  });

  it('when virtual panel is on, panelStyle includes flex column and block size from maxHeight', () => {
    const opts = buildHeadlessDropdownRefOptions(
      minimalInput({
        useVirtualPanel: () => true,
        panelStyle: () => ({ border: '1px solid' }),
        maxHeight: () => '200px',
      }),
    );
    expect(opts.panelStyle?.()).toMatchObject({
      display: 'flex',
      'flex-direction': 'column',
      border: '1px solid',
      height: '200px',
    });
  });

  it('forwards configPreset and arrowSize when provided', () => {
    const arrow = { width: 10, height: 5 };
    const opts = buildHeadlessDropdownRefOptions(
      minimalInput({
        configPreset: 'menu',
        arrowSize: () => arrow,
      }),
    );
    expect(opts.configPreset).toBe('menu');
    expect(opts.arrowSize?.()).toEqual(arrow);
  });
});
