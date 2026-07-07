import { afterEach, describe, expect, it, vi } from 'vitest';

import { attachDrawerDragController, detachDrawerDragController } from './drawer-drag-controller';

function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove',
  clientX: number,
  clientY = 0,
  pointerId = 1,
): void {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      pointerId,
      button: 0,
      buttons: type === 'pointermove' ? 1 : 1,
    }),
  );
}

describe('DrawerDragController snap initialization', () => {
  afterEach(() => {
    document.querySelectorAll('[data-nxr-overlay="pane"]').forEach((pane) => {
      detachDrawerDragController(pane as HTMLElement);
    });
  });

  it('uses snap handler when placement is set before controller attach', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-placement', 'drawer-bottom');
    document.body.appendChild(pane);

    const ref = { updateSize: vi.fn(), close: vi.fn(), reposition: vi.fn() };

    const controller = attachDrawerDragController(ref as never, pane, null, {
      threshold: 0.25,
      minVelocity: 0.4,
      dragFrom: 'pane',
      snap: { initialSize: '200px', expandedSize: '400px' },
    });

    controller.applyInitialSnapSize();

    expect(ref.updateSize).toHaveBeenCalledWith({ height: '200px' });

    pane.remove();
  });

  it('defers snap init until placement exists when attach order was wrong', () => {
    const pane = document.createElement('div');
    document.body.appendChild(pane);

    const ref = { updateSize: vi.fn(), close: vi.fn(), reposition: vi.fn() };

    const controller = attachDrawerDragController(ref as never, pane, null, {
      threshold: 0.25,
      minVelocity: 0.4,
      dragFrom: 'pane',
      snap: { initialSize: '200px' },
    });

    pane.setAttribute('data-placement', 'drawer-bottom');
    controller.applyInitialSnapSize();

    expect(ref.updateSize).toHaveBeenCalledWith({ height: '200px' });

    pane.remove();
  });
});

describe('DrawerDragController dragFrom pane', () => {
  afterEach(() => {
    document.querySelectorAll('[data-nxr-overlay="pane"]').forEach((pane) => {
      detachDrawerDragController(pane as HTMLElement);
    });
  });

  it('registers pane as drag target and applies transform from non-interactive content', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-placement', 'drawer-end');
    Object.defineProperty(pane, 'offsetWidth', { value: 400, configurable: true });
    const text = document.createElement('p');
    text.textContent = 'Drag me';
    pane.appendChild(text);
    document.body.appendChild(pane);

    const ref = { updateSize: vi.fn(), close: vi.fn(), reposition: vi.fn() };

    attachDrawerDragController(ref as never, pane, null, {
      threshold: 0.25,
      minVelocity: 0.4,
      dragFrom: 'pane',
    });

    dispatchPointer(text, 'pointerdown', 0);
    dispatchPointer(document, 'pointermove', 30);

    expect(pane.style.transform).toBe('translateX(30px)');

    pane.remove();
  });

  it('does not start pane drag from interactive descendants', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-placement', 'drawer-end');
    Object.defineProperty(pane, 'offsetWidth', { value: 400, configurable: true });
    const button = document.createElement('button');
    button.textContent = 'Action';
    pane.appendChild(button);
    document.body.appendChild(pane);

    const ref = { updateSize: vi.fn(), close: vi.fn(), reposition: vi.fn() };

    attachDrawerDragController(ref as never, pane, null, {
      threshold: 0.25,
      minVelocity: 0.4,
      dragFrom: 'pane',
    });

    dispatchPointer(button, 'pointerdown', 0);
    dispatchPointer(document, 'pointermove', 30);

    expect(pane.style.transform).toBe('');

    pane.remove();
  });
});
