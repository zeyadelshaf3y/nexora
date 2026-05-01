import { vi } from 'vitest';

import { HoverBridge, isInsideOverlayPaneOrBridge, shouldSkipHoverClose } from './hover-bridge';

describe('hover-bridge', () => {
  describe('shouldSkipHoverClose', () => {
    it('returns true when element at point is inside scope', () => {
      const trigger = document.createElement('button');
      const pane = document.createElement('div');
      document.body.appendChild(trigger);
      document.body.appendChild(pane);
      const ev = new MouseEvent('mouseleave', { clientX: 10, clientY: 10, bubbles: true });
      const doc = trigger.ownerDocument;
      const orig = (doc as Document & { elementFromPoint?(x: number, y: number): Element | null })
        .elementFromPoint;
      Object.defineProperty(doc, 'elementFromPoint', {
        value: () => pane,
        configurable: true,
        writable: true,
      });
      expect(shouldSkipHoverClose(ev, { scope: [trigger, pane] })).toBe(true);
      if (orig) (doc as Document & { elementFromPoint: typeof orig }).elementFromPoint = orig;
      else Reflect.deleteProperty(doc, 'elementFromPoint');
      document.body.removeChild(trigger);
      document.body.removeChild(pane);
    });

    it('returns false when element at point is outside scope and treatAnyOverlayPaneAsInside is false', () => {
      const trigger = document.createElement('button');
      const pane = document.createElement('div');
      document.body.appendChild(trigger);
      document.body.appendChild(pane);
      const ev = new MouseEvent('mouseleave', { clientX: 0, clientY: 0, bubbles: true });
      const doc = trigger.ownerDocument;
      const orig = (doc as Document & { elementFromPoint?(x: number, y: number): Element | null })
        .elementFromPoint;
      Object.defineProperty(doc, 'elementFromPoint', {
        value: () => document.body,
        configurable: true,
        writable: true,
      });
      expect(shouldSkipHoverClose(ev, { scope: [trigger, pane] })).toBe(false);
      if (orig) (doc as Document & { elementFromPoint: typeof orig }).elementFromPoint = orig;
      else Reflect.deleteProperty(doc, 'elementFromPoint');
      document.body.removeChild(trigger);
      document.body.removeChild(pane);
    });

    it('returns true when a transparent top layer covers the pane but the stack still includes the pane', () => {
      const trigger = document.createElement('button');
      const pane = document.createElement('div');
      const veil = document.createElement('div');
      veil.style.position = 'fixed';
      veil.style.pointerEvents = 'auto';
      document.body.appendChild(trigger);
      document.body.appendChild(pane);
      document.body.appendChild(veil);
      const ev = new MouseEvent('mouseleave', { clientX: 5, clientY: 5, bubbles: true });
      const doc = trigger.ownerDocument;
      const origEfp = (
        doc as Document & { elementFromPoint?(x: number, y: number): Element | null }
      ).elementFromPoint;
      const origEfps = (doc as Document & { elementsFromPoint?(x: number, y: number): Element[] })
        .elementsFromPoint;
      Object.defineProperty(doc, 'elementsFromPoint', {
        value: () => [veil, pane],
        configurable: true,
        writable: true,
      });
      Object.defineProperty(doc, 'elementFromPoint', {
        value: () => veil,
        configurable: true,
        writable: true,
      });
      expect(shouldSkipHoverClose(ev, { scope: [trigger, pane] })).toBe(true);
      if (origEfp)
        (doc as Document & { elementFromPoint: typeof origEfp }).elementFromPoint = origEfp;
      else Reflect.deleteProperty(doc, 'elementFromPoint');
      if (origEfps)
        (doc as Document & { elementsFromPoint: typeof origEfps }).elementsFromPoint = origEfps;
      else Reflect.deleteProperty(doc, 'elementsFromPoint');
      document.body.removeChild(trigger);
      document.body.removeChild(pane);
      document.body.removeChild(veil);
    });
  });

  describe('isInsideOverlayPaneOrBridge', () => {
    it('returns true when node is inside an element with pane or bridge selector', () => {
      const div = document.createElement('div');
      div.setAttribute('data-nxr-overlay', 'pane');
      const span = document.createElement('span');
      div.appendChild(span);
      document.body.appendChild(div);
      expect(isInsideOverlayPaneOrBridge(span)).toBe(true);
      expect(isInsideOverlayPaneOrBridge(div)).toBe(true);
      document.body.removeChild(div);
    });

    it('returns false when node is not inside pane or bridge', () => {
      const span = document.createElement('span');
      document.body.appendChild(span);
      expect(isInsideOverlayPaneOrBridge(span)).toBe(false);
      document.body.removeChild(span);
    });
  });

  describe('HoverBridge', () => {
    it('scheduleClose and cancelClose work without attach', async () => {
      const onClose = vi.fn();
      const anchor = document.createElement('button');
      const pane = document.createElement('div');
      pane.setAttribute('data-nxr-overlay', 'pane');

      const bridge = new HoverBridge({
        anchor,
        pane,
        getCloseDelay: () => 30,
        onClose,
      });

      bridge.scheduleClose();
      expect(onClose).not.toHaveBeenCalled();
      bridge.cancelClose();
      bridge.scheduleClose();
      await new Promise((r) => setTimeout(r, 50));
      expect(onClose).toHaveBeenCalled();
    });

    it('detach is safe when not attached', () => {
      const anchor = document.createElement('button');
      const pane = document.createElement('div');

      const bridge = new HoverBridge({
        anchor,
        pane,
        getCloseDelay: () => 100,
        onClose: () => {},
      });

      expect(() => bridge.detach()).not.toThrow();
    });

    it('cancels a scheduled close when the pointer enters the pane even if no gap bridge is drawn', async () => {
      const onClose = vi.fn();
      const parent = document.createElement('div');
      document.body.appendChild(parent);

      const anchor = document.createElement('button');
      anchor.style.position = 'fixed';
      anchor.style.left = '120px';
      anchor.style.top = '120px';
      anchor.style.width = '48px';
      anchor.style.height = '28px';
      parent.appendChild(anchor);

      const pane = document.createElement('div');
      pane.setAttribute('data-nxr-overlay', 'pane');
      pane.style.position = 'fixed';
      pane.style.left = '120px';
      pane.style.top = '120px';
      pane.style.width = '48px';
      pane.style.height = '28px';
      parent.appendChild(pane);

      const bridge = new HoverBridge({
        anchor,
        pane,
        getCloseDelay: () => 60,
        onClose,
        bridgeAttr: 'data-nxr-tooltip-bridge',
      });

      bridge.attach();
      bridge.scheduleClose();
      pane.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      await new Promise((r) => setTimeout(r, 90));
      expect(onClose).not.toHaveBeenCalled();

      bridge.detach();
      document.body.removeChild(parent);
    });

    it('pointerCloseGuard aborts scheduled close when hit-test is still inside the pane', () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      const parent = document.createElement('div');
      document.body.appendChild(parent);

      const anchor = document.createElement('button');
      parent.appendChild(anchor);

      const pane = document.createElement('div');
      pane.setAttribute('data-nxr-overlay', 'pane');
      const inner = document.createElement('span');
      pane.appendChild(inner);
      parent.appendChild(pane);

      const bridge = new HoverBridge({
        anchor,
        pane,
        getCloseDelay: () => 10,
        onClose,
        pointerCloseGuard: true,
      });
      bridge.attach();

      const doc = anchor.ownerDocument;
      const origEfp = (
        doc as Document & { elementFromPoint?(x: number, y: number): Element | null }
      ).elementFromPoint;
      const origEfps = (doc as Document & { elementsFromPoint?(x: number, y: number): Element[] })
        .elementsFromPoint;
      Object.defineProperty(doc, 'elementsFromPoint', {
        value: () => [],
        configurable: true,
        writable: true,
      });
      Object.defineProperty(doc, 'elementFromPoint', {
        value: () => inner,
        configurable: true,
        writable: true,
      });

      bridge.scheduleClose(0, { clientX: 2, clientY: 3 });
      vi.runAllTimers();
      expect(onClose).not.toHaveBeenCalled();

      if (origEfp)
        (doc as Document & { elementFromPoint: typeof origEfp }).elementFromPoint = origEfp;
      else Reflect.deleteProperty(doc, 'elementFromPoint');
      if (origEfps)
        (doc as Document & { elementsFromPoint: typeof origEfps }).elementsFromPoint = origEfps;
      else Reflect.deleteProperty(doc, 'elementsFromPoint');

      bridge.detach();
      document.body.removeChild(parent);
      vi.useRealTimers();
    });
  });
});
