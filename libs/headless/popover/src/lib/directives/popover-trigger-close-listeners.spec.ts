import { vi } from 'vitest';

import {
  attachPopoverFocusPaneListener,
  attachPopoverOutsideClickListener,
} from './popover-trigger-close-listeners';

describe('attachPopoverOutsideClickListener', () => {
  let anchor: HTMLElement;
  let pane: HTMLElement;
  let close: ReturnType<typeof vi.fn<() => void>>;
  let focusClose: {
    onPointerDown: ReturnType<typeof vi.fn>;
    clearPointerDown: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    anchor = document.createElement('button');
    pane = document.createElement('div');
    document.body.appendChild(anchor);
    document.body.appendChild(pane);
    close = vi.fn<() => void>();
    focusClose = {
      onPointerDown: vi.fn(),
      clearPointerDown: vi.fn(),
    };
  });

  afterEach(() => {
    document.body.removeChild(anchor);
    document.body.removeChild(pane);
  });

  it('returns null when openedBy is click', () => {
    expect(
      attachPopoverOutsideClickListener({
        openedBy: 'click',
        anchor,
        getPane: () => pane,
        close,
        focusClose: focusClose as never,
      }),
    ).toBeNull();
  });

  it('calls close on pointerdown outside', () => {
    const remove = attachPopoverOutsideClickListener({
      openedBy: 'hover',
      anchor,
      getPane: () => pane,
      close,
      focusClose: focusClose as never,
    });
    expect(remove).not.toBeNull();

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(close).toHaveBeenCalledTimes(1);

    outside.remove();
    remove?.();
  });

  it('calls close and clearPointerDown when document becomes hidden', () => {
    const remove = attachPopoverOutsideClickListener({
      openedBy: 'focus',
      anchor,
      getPane: () => pane,
      close,
      focusClose: focusClose as never,
    });

    const doc = anchor.ownerDocument;
    const prev = Object.getOwnPropertyDescriptor(doc, 'hidden');
    try {
      Object.defineProperty(doc, 'hidden', { configurable: true, value: true });
      doc.dispatchEvent(new Event('visibilitychange'));
      expect(focusClose.clearPointerDown).toHaveBeenCalledTimes(1);
      expect(close).toHaveBeenCalledTimes(1);
    } finally {
      if (prev) Object.defineProperty(doc, 'hidden', prev);
    }

    remove?.();
  });

  it('composite remove unsubscribes both listeners', () => {
    const remove = attachPopoverOutsideClickListener({
      openedBy: 'hover',
      anchor,
      getPane: () => pane,
      close,
      focusClose: focusClose as never,
    });
    close.mockClear();
    remove?.();

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(close).not.toHaveBeenCalled();
    outside.remove();

    const doc = anchor.ownerDocument;
    const prev = Object.getOwnPropertyDescriptor(doc, 'hidden');
    try {
      Object.defineProperty(doc, 'hidden', { configurable: true, value: true });
      doc.dispatchEvent(new Event('visibilitychange'));
      expect(close).not.toHaveBeenCalled();
    } finally {
      if (prev) Object.defineProperty(doc, 'hidden', prev);
    }
  });
});

describe('attachPopoverFocusPaneListener', () => {
  it('returns null when pane is null', () => {
    expect(
      attachPopoverFocusPaneListener({
        isFocusTrigger: true,
        pane: null,
        onFocusOut: () => {},
      }),
    ).toBeNull();
  });
});
