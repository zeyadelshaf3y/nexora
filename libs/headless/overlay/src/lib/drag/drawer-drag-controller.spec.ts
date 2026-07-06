import { afterEach, describe, expect, it, vi } from 'vitest';

import { attachDrawerDragController, detachDrawerDragController } from './drawer-drag-controller';

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
      snap: { initialSize: '200px' },
    });

    pane.setAttribute('data-placement', 'drawer-bottom');
    controller.applyInitialSnapSize();

    expect(ref.updateSize).toHaveBeenCalledWith({ height: '200px' });

    pane.remove();
  });
});
