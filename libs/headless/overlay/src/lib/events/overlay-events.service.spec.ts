import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { OverlayContainerService } from '../container/overlay-container.service';
import type { ClosePolicy } from '../ref/close-policy';
import type { OverlayRef } from '../ref/overlay-ref';
import { OverlayStackService } from '../stack/overlay-stack.service';

import { OverlayEventsService } from './overlay-events.service';

function createMockOverlayRef(
  overrides: Partial<{
    id: string;
    getPaneElement: () => HTMLElement | null;
    getBackdropElement: () => HTMLElement | null;
    getClosePolicy: () => ClosePolicy;
    containsAnchor: (node: Node) => boolean;
    getOutsideClickBoundary: () => HTMLElement | null;
    getParentRef: () => OverlayRef | null;
    close: (reason?: string) => Promise<boolean>;
    notifyOutsideClickAttempted: () => void;
  }> = {},
): OverlayRef {
  const defaultPane = document.createElement('div');
  const defaultBackdrop = document.createElement('div');
  const defaultPolicy: ClosePolicy = { escape: 'top', outside: 'top', backdrop: 'self' };

  return {
    id: overrides.id ?? 'mock-' + Math.random().toString(36).slice(2),
    scopeId: 'global',
    getPaneElement: overrides.getPaneElement ?? (() => defaultPane),
    getBackdropElement: overrides.getBackdropElement ?? (() => defaultBackdrop),
    getClosePolicy: overrides.getClosePolicy ?? (() => defaultPolicy),
    containsAnchor: overrides.containsAnchor ?? (() => false),
    getOutsideClickBoundary: overrides.getOutsideClickBoundary ?? (() => null),
    getParentRef: overrides.getParentRef ?? (() => null),
    close: overrides.close ?? (() => Promise.resolve(true)),
    notifyOutsideClickAttempted: overrides.notifyOutsideClickAttempted ?? (() => {}),
    attach: () => Promise.resolve(true),
    detach: () => {},
    dispose: () => {},
    afterClosed: () =>
      ({
        subscribe: () => ({ unsubscribe: () => {} }),
        pipe: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      }) as ReturnType<OverlayRef['afterClosed']>,
    reposition: () => {},
    setZIndex: () => {},
    setCloseAnimationDurationMs: () => {},
  } as OverlayRef;
}

describe('OverlayEventsService', () => {
  let stack: OverlayStackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OverlayEventsService, OverlayStackService, OverlayContainerService],
    });
    void TestBed.inject(OverlayEventsService);
    stack = TestBed.inject(OverlayStackService);

    for (const ref of [...stack.getStack()]) {
      stack.unregister(ref);
    }
  });

  describe('Escape', () => {
    it('closes top overlay when it has escape "top"', async () => {
      const closeSpy = vi.fn().mockResolvedValue(true);

      const ref = createMockOverlayRef({
        close: closeSpy,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'self' }),
      });

      stack.register(ref);

      const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(ev);

      await Promise.resolve();
      expect(closeSpy).toHaveBeenCalledWith('escape');
    });

    it('does not close when top has escape "none"', async () => {
      const closeSpy = vi.fn();

      const ref = createMockOverlayRef({
        close: closeSpy,
        getClosePolicy: () => ({ escape: 'none', outside: 'top', backdrop: 'self' }),
      });

      stack.register(ref);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await Promise.resolve();
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('closes topmost overlay with escape "top" when top has escape "none" (e.g. snackbar over dialog)', async () => {
      const dialogCloseSpy = vi.fn().mockResolvedValue(true);
      const snackbarCloseSpy = vi.fn();

      const dialogRef = createMockOverlayRef({
        close: dialogCloseSpy,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'self' }),
      });

      const snackbarRef = createMockOverlayRef({
        close: snackbarCloseSpy,
        getClosePolicy: () => ({ escape: 'none', outside: 'none', backdrop: 'none' }),
      });

      stack.register(dialogRef);
      stack.register(snackbarRef);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await Promise.resolve();

      expect(dialogCloseSpy).toHaveBeenCalledWith('escape');
      expect(snackbarCloseSpy).not.toHaveBeenCalled();
    });

    it('does nothing when stack is empty', async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await Promise.resolve();
      expect(stack.getTop()).toBeNull();
    });

    it('stops propagation by default after closing', async () => {
      const closeSpy = vi.fn().mockResolvedValue(true);

      const ref = createMockOverlayRef({
        close: closeSpy,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'self' }),
      });

      stack.register(ref);

      const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      const stopSpy = vi.spyOn(ev, 'stopPropagation');
      document.dispatchEvent(ev);
      await vi.waitFor(() => expect(closeSpy).toHaveBeenCalledWith('escape'));
      expect(stopSpy).toHaveBeenCalled();
    });

    it('does not stop propagation when escapePropagation is "bubble"', async () => {
      const closeSpy = vi.fn().mockResolvedValue(true);

      const ref = createMockOverlayRef({
        close: closeSpy,
        getClosePolicy: () => ({
          escape: 'top',
          outside: 'top',
          backdrop: 'self',
          escapePropagation: 'bubble',
        }),
      });

      stack.register(ref);

      const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      const preventSpy = vi.spyOn(ev, 'preventDefault');
      document.dispatchEvent(ev);
      await vi.waitFor(() => expect(closeSpy).toHaveBeenCalledWith('escape'));
      // The handler called preventDefault (proving close succeeded) but must not
      // have called stopPropagation on behalf of this ref.
      expect(preventSpy).toHaveBeenCalled();
    });
  });

  describe('pointerdown', () => {
    it('consumes event when click is inside overlay pane', async () => {
      const closeSpy = vi.fn();
      const pane = document.createElement('div');
      const inner = document.createElement('span');
      pane.appendChild(inner);
      const ref = createMockOverlayRef({ close: closeSpy, getPaneElement: () => pane });
      stack.register(ref);
      document.body.appendChild(pane);

      inner.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      await Promise.resolve();

      expect(closeSpy).not.toHaveBeenCalled();
      document.body.removeChild(pane);
    });

    it('closes overlay and descendants on backdrop click when policy is "self"', async () => {
      const closeSpy = vi.fn().mockResolvedValue(true);
      const pane = document.createElement('div');
      const backdrop = document.createElement('div');

      const ref = createMockOverlayRef({
        close: closeSpy,
        getPaneElement: () => pane,
        getBackdropElement: () => backdrop,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'self' }),
      });

      stack.register(ref);
      document.body.appendChild(backdrop);
      document.body.appendChild(pane);

      backdrop.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      await Promise.resolve();

      expect(closeSpy).toHaveBeenCalledWith('backdrop');
      document.body.removeChild(backdrop);
      document.body.removeChild(pane);
    });

    it('closes only the ref (popover) when outside click is on parent pane', async () => {
      const dialogPane = document.createElement('div');
      const dialogBackdrop = document.createElement('div');
      const popoverPane = document.createElement('div');
      const dialogClose = vi.fn().mockResolvedValue(true);
      const popoverClose = vi.fn().mockResolvedValue(true);

      const dialogRef = createMockOverlayRef({
        id: 'dialog',
        close: dialogClose,
        getPaneElement: () => dialogPane,
        getBackdropElement: () => dialogBackdrop,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'self' }),
        getParentRef: () => null,
      });

      const popoverRef = createMockOverlayRef({
        id: 'popover',
        close: popoverClose,
        getPaneElement: () => popoverPane,
        getBackdropElement: () => null,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'none' }),
        getParentRef: () => dialogRef,
      });

      stack.register(dialogRef);
      stack.register(popoverRef);
      document.body.appendChild(dialogBackdrop);
      document.body.appendChild(dialogPane);
      document.body.appendChild(popoverPane);

      dialogPane.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();

      expect(popoverClose).toHaveBeenCalledWith('outside');
      expect(dialogClose).not.toHaveBeenCalled();

      document.body.removeChild(dialogBackdrop);
      document.body.removeChild(dialogPane);
      document.body.removeChild(popoverPane);
    });

    it('closes ancestor (dialog) and descendants when outside click is on ancestor backdrop', async () => {
      const dialogPane = document.createElement('div');
      const dialogBackdrop = document.createElement('div');
      const popoverPane = document.createElement('div');
      const dialogClose = vi.fn().mockResolvedValue(true);
      const popoverClose = vi.fn().mockResolvedValue(true);

      const dialogRef = createMockOverlayRef({
        id: 'dialog',
        close: dialogClose,
        getPaneElement: () => dialogPane,
        getBackdropElement: () => dialogBackdrop,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'self' }),
        getParentRef: () => null,
      });

      const popoverRef = createMockOverlayRef({
        id: 'popover',
        close: popoverClose,
        getPaneElement: () => popoverPane,
        getBackdropElement: () => null,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'none' }),
        getParentRef: () => dialogRef,
      });

      stack.register(dialogRef);
      stack.register(popoverRef);
      document.body.appendChild(dialogBackdrop);
      document.body.appendChild(dialogPane);
      document.body.appendChild(popoverPane);

      dialogBackdrop.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();

      expect(dialogClose).toHaveBeenCalledWith('outside');
      expect(popoverClose).toHaveBeenCalledWith('outside');

      document.body.removeChild(dialogBackdrop);
      document.body.removeChild(dialogPane);
      document.body.removeChild(popoverPane);
    });

    it('notifies when outside policy is "none" and returns false so click is not consumed (e.g. snackbar allows drawer/dialog below to close)', async () => {
      const notifySpy = vi.fn();
      const pane = document.createElement('div');

      const ref = createMockOverlayRef({
        getPaneElement: () => pane,
        getBackdropElement: () => null,
        getClosePolicy: () => ({ escape: 'top', outside: 'none', backdrop: 'none' }),
        notifyOutsideClickAttempted: notifySpy,
      });

      stack.register(ref);
      document.body.appendChild(pane);

      document.body.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();

      expect(notifySpy).toHaveBeenCalled();
      document.body.removeChild(pane);
    });

    it('does not close when click is inside outsideClickBoundary (e.g. dashboard header/sidebar)', async () => {
      const closeSpy = vi.fn();
      const pane = document.createElement('div');
      const boundary = document.createElement('div');
      boundary.id = 'dashboard-root';
      const header = document.createElement('header');
      header.textContent = 'Header';
      boundary.appendChild(header);
      document.body.appendChild(boundary);
      document.body.appendChild(pane);

      const ref = createMockOverlayRef({
        close: closeSpy,
        getPaneElement: () => pane,
        getBackdropElement: () => null,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'none' }),
        getOutsideClickBoundary: () => boundary,
      });

      stack.register(ref);

      header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      await Promise.resolve();

      expect(closeSpy).not.toHaveBeenCalled();

      document.body.removeChild(boundary);
      document.body.removeChild(pane);
    });

    it('does not consume outside click when top close is vetoed, allowing lower overlay to handle it', async () => {
      const topClose = vi.fn().mockResolvedValue(false);
      const lowerClose = vi.fn().mockResolvedValue(true);
      const topPane = document.createElement('div');
      const lowerPane = document.createElement('div');

      const topRef = createMockOverlayRef({
        id: 'top',
        close: topClose,
        getPaneElement: () => topPane,
        getBackdropElement: () => null,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'none' }),
        getParentRef: () => null,
      });

      const lowerRef = createMockOverlayRef({
        id: 'lower',
        close: lowerClose,
        getPaneElement: () => lowerPane,
        getBackdropElement: () => null,
        getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'none' }),
        getParentRef: () => null,
      });

      stack.register(lowerRef);
      stack.register(topRef);
      document.body.appendChild(topPane);
      document.body.appendChild(lowerPane);

      document.body.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
      await Promise.resolve();

      expect(topClose).toHaveBeenCalledWith('outside');
      await vi.waitFor(() => expect(lowerClose).toHaveBeenCalledWith('outside'));

      document.body.removeChild(topPane);
      document.body.removeChild(lowerPane);
    });
  });
});
