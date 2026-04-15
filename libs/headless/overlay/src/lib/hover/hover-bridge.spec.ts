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
  });
});
