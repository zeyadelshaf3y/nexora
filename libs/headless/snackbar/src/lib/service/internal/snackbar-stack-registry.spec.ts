import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import type { SnackbarPlacement } from '../../position/snackbar-placement';

import type { SnackbarInternalRef } from './snackbar-open-helpers';
import { SnackbarStackRegistry } from './snackbar-stack-registry';

function mockRef(paneHeight: number): SnackbarInternalRef {
  const pane = { offsetHeight: paneHeight } as HTMLElement;
  return {
    close: vi.fn(),
    reposition: vi.fn(),
    afterClosed: () => of(undefined),
    getPaneElement: () => pane,
  };
}

describe('SnackbarStackRegistry', () => {
  const placement: SnackbarPlacement = 'bottom-end';

  it('computes cumulative stack offset using pane heights and gap', () => {
    const reg = new SnackbarStackRegistry();
    const a = mockRef(10);
    const b = mockRef(20);
    reg.registerRef(placement, a);
    reg.registerRef(placement, b);

    expect(reg.getStackOffsetForRef(placement, a, { stackGap: 4 })).toBe(0);
    expect(reg.getStackOffsetForRef(placement, b, { stackGap: 4 })).toBe(14);
  });

  it('returns 0 offset when current ref is null', () => {
    const reg = new SnackbarStackRegistry();
    expect(reg.getStackOffsetForRef(placement, null, {})).toBe(0);
  });

  it('hides oldest refs when max visible is exceeded (FIFO hidden queue)', () => {
    const reg = new SnackbarStackRegistry();
    reg.setPlacementMaxVisible(placement, 2);
    const a = mockRef(10);
    const b = mockRef(10);
    const c = mockRef(10);

    reg.registerRef(placement, a);
    reg.registerRef(placement, b);
    reg.registerRef(placement, c);

    expect(reg.isRefHidden(a)).toBe(true);
    expect(reg.isRefHidden(b)).toBe(false);
    expect(reg.isRefHidden(c)).toBe(false);
  });

  it('reveals oldest hidden ref when a visible ref is removed', () => {
    const reg = new SnackbarStackRegistry();
    reg.setPlacementMaxVisible(placement, 2);
    const a = mockRef(10);
    const b = mockRef(10);
    const c = mockRef(10);

    reg.registerRef(placement, a);
    reg.registerRef(placement, b);
    reg.registerRef(placement, c);
    reg.unregisterRef(placement, b);

    expect(reg.isRefHidden(a)).toBe(false);
    expect(reg.isRefHidden(c)).toBe(false);
  });

  it('computes offsets using visible refs only', () => {
    const reg = new SnackbarStackRegistry();
    reg.setPlacementMaxVisible(placement, 2);
    const a = mockRef(10);
    const b = mockRef(20);
    const c = mockRef(30);

    reg.registerRef(placement, a);
    reg.registerRef(placement, b);
    reg.registerRef(placement, c);

    expect(reg.isRefHidden(a)).toBe(true);
    expect(reg.getStackOffsetForRef(placement, b, { stackGap: 4 })).toBe(0);
    expect(reg.getStackOffsetForRef(placement, c, { stackGap: 4 })).toBe(24);
  });

  it('handles maxVisible edge values (0 and negative)', () => {
    const reg = new SnackbarStackRegistry();
    const a = mockRef(10);
    const b = mockRef(10);

    reg.setPlacementMaxVisible(placement, 0);
    reg.registerRef(placement, a);
    reg.registerRef(placement, b);
    expect(reg.isRefHidden(a)).toBe(true);
    expect(reg.isRefHidden(b)).toBe(true);

    reg.setPlacementMaxVisible(placement, -3);
    const c = mockRef(10);
    reg.registerRef(placement, c);
    expect(reg.isRefHidden(c)).toBe(true);
  });
});
