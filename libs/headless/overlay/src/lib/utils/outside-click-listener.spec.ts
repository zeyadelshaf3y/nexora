import { vi } from 'vitest';

import { createOutsideClickListener } from './outside-click-listener';

describe('createOutsideClickListener', () => {
  let anchor: HTMLElement;
  let pane: HTMLElement;
  let onOutsideClick: ReturnType<typeof vi.fn<() => void>>;
  let getPane: () => HTMLElement | null;

  beforeEach(() => {
    anchor = document.createElement('div');
    pane = document.createElement('div');
    document.body.appendChild(anchor);
    document.body.appendChild(pane);
    onOutsideClick = vi.fn<() => void>();
    getPane = () => pane;
  });

  afterEach(() => {
    document.body.removeChild(anchor);
    document.body.removeChild(pane);
  });

  it('calls onOutsideClick when clicking outside anchor and pane', () => {
    const remove = createOutsideClickListener(anchor, getPane, onOutsideClick);
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onOutsideClick).toHaveBeenCalled();
    remove();
    document.body.removeChild(outside);
  });

  it('does not call onOutsideClick when clicking anchor', () => {
    const remove = createOutsideClickListener(anchor, getPane, onOutsideClick);
    anchor.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onOutsideClick).not.toHaveBeenCalled();
    remove();
  });

  it('does not call onOutsideClick when clicking pane', () => {
    const remove = createOutsideClickListener(anchor, getPane, onOutsideClick);
    pane.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onOutsideClick).not.toHaveBeenCalled();
    remove();
  });

  it('respects considerInside and treats target as inside', () => {
    const outside = document.createElement('div');
    document.body.appendChild(outside);

    const remove = createOutsideClickListener(anchor, getPane, onOutsideClick, {
      considerInside: (el) => el === outside,
    });

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onOutsideClick).not.toHaveBeenCalled();
    remove();
    document.body.removeChild(outside);
  });

  it('calls onPointerDown with target element', () => {
    const onPointerDown = vi.fn();
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    const remove = createOutsideClickListener(anchor, getPane, onOutsideClick, {
      onPointerDown,
    });
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onPointerDown).toHaveBeenCalledWith(outside);
    remove();
    document.body.removeChild(outside);
  });

  it('remove stops listening', () => {
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    const remove = createOutsideClickListener(anchor, getPane, onOutsideClick);
    remove();
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onOutsideClick).not.toHaveBeenCalled();
    document.body.removeChild(outside);
  });
});
