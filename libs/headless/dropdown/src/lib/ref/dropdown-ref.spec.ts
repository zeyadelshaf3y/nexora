import type { CloseReason, OverlayRef, OverlayService, Portal } from '@nexora-ui/overlay';
import { Subject, type Observable } from 'rxjs';
import { vi } from 'vitest';

import { DropdownRef } from './dropdown-ref';

function createOverlayRef(params?: {
  attachImpl?: () => Promise<boolean>;
  closeImpl?: () => Promise<boolean>;
}): { ref: OverlayRef; emitClosed: (reason?: CloseReason) => void } {
  const afterClosed$ = new Subject<CloseReason | undefined>();
  const attach = vi.fn(params?.attachImpl ?? (async () => true));
  const close = vi.fn(params?.closeImpl ?? (async () => true));

  const ref: OverlayRef = {
    id: 'ovr',
    scopeId: 'global',
    attach: attach as OverlayRef['attach'],
    detach: vi.fn() as OverlayRef['detach'],
    dispose: vi.fn() as OverlayRef['dispose'],
    close: close as OverlayRef['close'],
    setCloseAnimationDurationMs: vi.fn() as OverlayRef['setCloseAnimationDurationMs'],
    afterClosed: ((): Observable<CloseReason | undefined> =>
      afterClosed$.asObservable()) as OverlayRef['afterClosed'],
    getPaneElement: vi.fn(() => null) as OverlayRef['getPaneElement'],
    getBackdropElement: vi.fn(() => null) as OverlayRef['getBackdropElement'],
    getClosePolicy: vi.fn(() => ({
      escape: 'top',
      outside: 'top',
      backdrop: 'none',
    })) as OverlayRef['getClosePolicy'],
    containsAnchor: vi.fn(() => false) as OverlayRef['containsAnchor'],
    getOutsideClickBoundary: vi.fn(() => null) as OverlayRef['getOutsideClickBoundary'],
    getParentRef: vi.fn(() => null) as OverlayRef['getParentRef'],
    notifyOutsideClickAttempted: vi.fn() as OverlayRef['notifyOutsideClickAttempted'],
    reposition: vi.fn() as OverlayRef['reposition'],
    setZIndex: vi.fn() as OverlayRef['setZIndex'],
  };

  return {
    ref,
    emitClosed: (reason?: CloseReason) => {
      afterClosed$.next(reason);
      afterClosed$.complete();
    },
  };
}

describe('DropdownRef', () => {
  it('returns false and cleans state when attach throws', async () => {
    const { ref: overlayRef } = createOverlayRef({
      attachImpl: async () => {
        throw new Error('attach failed');
      },
    });

    const overlay = { create: () => overlayRef } as OverlayService;

    const dropdown = DropdownRef.create({
      getAnchor: () => document.createElement('button'),
      overlay,
    });

    const opened = await dropdown.open({} as Portal);
    expect(opened).toBe(false);
    expect(overlayRef.dispose).toHaveBeenCalledTimes(1);
    expect(dropdown.isOpen()).toBe(false);
  });

  it('does not leak skipFocusRestore when close is called while already closed', async () => {
    const { ref: overlayRef, emitClosed } = createOverlayRef();
    const overlay = { create: () => overlayRef } as OverlayService;
    const restoreTarget = document.createElement('button');
    const focusSpy = vi.spyOn(restoreTarget, 'focus').mockImplementation(() => {});

    const dropdown = DropdownRef.create({
      getAnchor: () => document.createElement('button'),
      getFocusRestoreTarget: () => restoreTarget,
      overlay,
    });

    dropdown.close(undefined, { skipFocusRestore: true });

    const opened = await dropdown.open({} as Portal);
    expect(opened).toBe(true);
    dropdown.close();
    emitClosed('programmatic');

    expect(overlayRef.close).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('waits for in-flight close before attaching again', async () => {
    const { ref: overlayRef, emitClosed } = createOverlayRef();
    const overlay = { create: () => overlayRef } as OverlayService;

    const dropdown = DropdownRef.create({
      getAnchor: () => document.createElement('button'),
      overlay,
    });

    expect(await dropdown.open({} as Portal)).toBe(true);
    dropdown.close();
    const openPromise = dropdown.open({} as Portal);
    emitClosed(undefined);
    expect(await openPromise).toBe(true);
    expect(overlayRef.attach).toHaveBeenCalledTimes(2);
  });
});
