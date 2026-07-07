import { describe, expect, it, vi } from 'vitest';

import { createDragDismissCore } from './drag-dismiss-core';
import type { DragDismissStrategy } from './drag-dismiss-vector';

function createStrategy(): DragDismissStrategy {
  return {
    resolveDismissVector: () => ({ axis: 'x', dismissSign: 1 }),
    getPaneSizeAlongAxis: () => 200,
    getOffScreenOffset: () => 200,
  };
}

function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
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
      buttons: type === 'pointerup' ? 0 : 1,
    }),
  );
}

describe('createDragDismissCore', () => {
  it('applies axis-locked transform during drag', () => {
    const pane = document.createElement('div');
    const handle = document.createElement('button');
    document.body.append(pane, handle);

    const core = createDragDismissCore({
      pane,
      strategy: createStrategy(),
      config: { threshold: 0.25, minVelocity: 0.4, dragFrom: 'handle' },
      callbacks: {
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        onDismiss: vi.fn().mockResolvedValue(undefined),
        onSnapBack: vi.fn().mockResolvedValue(undefined),
      },
    });

    core.registerHandle(handle);

    dispatchPointer(handle, 'pointerdown', 0);
    dispatchPointer(document, 'pointermove', 40);
    expect(pane.style.transform).toBe('translateX(40px)');

    dispatchPointer(document, 'pointerup', 40);

    document.body.removeChild(pane);
    document.body.removeChild(handle);
    core.destroy();
  });

  it('calls onDismiss when threshold is exceeded', async () => {
    const pane = document.createElement('div');
    const handle = document.createElement('button');
    document.body.append(pane, handle);

    const onDismiss = vi.fn().mockResolvedValue(undefined);
    const onSnapBack = vi.fn().mockResolvedValue(undefined);

    const core = createDragDismissCore({
      pane,
      strategy: createStrategy(),
      config: { threshold: 0.25, minVelocity: 999, dragFrom: 'handle' },
      callbacks: {
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        onDismiss,
        onSnapBack,
      },
    });

    core.registerHandle(handle);

    dispatchPointer(handle, 'pointerdown', 0);
    dispatchPointer(document, 'pointermove', 60);
    dispatchPointer(document, 'pointerup', 60);

    await vi.waitFor(() => expect(onDismiss).toHaveBeenCalled());

    document.body.removeChild(pane);
    document.body.removeChild(handle);
    core.destroy();
  });

  it('calls onSnapBack when below threshold', async () => {
    const pane = document.createElement('div');
    const handle = document.createElement('button');
    document.body.append(pane, handle);

    const onDismiss = vi.fn().mockResolvedValue(undefined);
    const onSnapBack = vi.fn().mockResolvedValue(undefined);

    const core = createDragDismissCore({
      pane,
      strategy: createStrategy(),
      config: { threshold: 0.5, minVelocity: 999, dragFrom: 'handle' },
      callbacks: {
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        onDismiss,
        onSnapBack,
      },
    });

    core.registerHandle(handle);

    dispatchPointer(handle, 'pointerdown', 0);
    dispatchPointer(document, 'pointermove', 20);
    dispatchPointer(document, 'pointerup', 20);

    await vi.waitFor(() => expect(onSnapBack).toHaveBeenCalled());
    expect(onDismiss).not.toHaveBeenCalled();

    document.body.removeChild(pane);
    document.body.removeChild(handle);
    core.destroy();
  });
});
