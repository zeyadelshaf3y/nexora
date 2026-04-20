import type { CloseReason, OverlayRef } from '@nexora-ui/overlay';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { SnackbarRefImpl } from './snackbar-ref-impl';

function createOverlayRefMock(afterClosed$: Subject<CloseReason | undefined>): OverlayRef {
  return {
    id: 'test-overlay',
    scopeId: 'global',
    attach: vi.fn().mockResolvedValue(true),
    detach: vi.fn(),
    dispose: vi.fn(),
    close: vi.fn().mockResolvedValue(true),
    setCloseAnimationDurationMs: vi.fn(),
    afterClosed: () => afterClosed$.asObservable(),
    getPaneElement: vi.fn(() => null),
    getBackdropElement: vi.fn(() => null),
    getClosePolicy: vi.fn(
      () =>
        ({
          outside: 'none',
          escape: 'none',
          backdrop: 'none',
        }) as const,
    ),
    containsAnchor: vi.fn(() => false),
    getOutsideClickBoundary: vi.fn(() => null),
    getParentRef: vi.fn(() => null),
    notifyOutsideClickAttempted: vi.fn(),
    reposition: vi.fn(),
    setZIndex: vi.fn(),
  };
}

describe('SnackbarRefImpl', () => {
  it('emits close value only after overlay close completes', () => {
    const overlayClosed$ = new Subject<CloseReason | undefined>();
    const overlayRef = createOverlayRefMock(overlayClosed$);
    const ref = new SnackbarRefImpl<string>(overlayRef);
    const values: Array<string | undefined> = [];

    ref.afterClosed().subscribe((value) => values.push(value));
    ref.close('done');

    expect(values).toEqual([]);
    expect(overlayRef.close).toHaveBeenCalledTimes(1);

    overlayClosed$.next(undefined);
    overlayClosed$.complete();

    expect(values).toEqual(['done']);
  });

  it('emits undefined when overlay closes externally', () => {
    const overlayClosed$ = new Subject<CloseReason | undefined>();
    const ref = new SnackbarRefImpl<string>(createOverlayRefMock(overlayClosed$));
    const values: Array<string | undefined> = [];

    ref.afterClosed().subscribe((value) => values.push(value));

    overlayClosed$.next(undefined);
    overlayClosed$.complete();

    expect(values).toEqual([undefined]);
  });
});
