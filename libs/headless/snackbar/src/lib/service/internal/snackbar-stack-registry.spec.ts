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
});
