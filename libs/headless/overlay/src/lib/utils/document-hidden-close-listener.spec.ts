import { vi } from 'vitest';

import { createDocumentHiddenCloseListener } from './document-hidden-close-listener';

describe('createDocumentHiddenCloseListener', () => {
  it('calls onHidden when document becomes hidden', () => {
    const onHidden = vi.fn<() => void>();
    const remove = createDocumentHiddenCloseListener(document, onHidden);
    const prev = Object.getOwnPropertyDescriptor(document, 'hidden');

    try {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(onHidden).toHaveBeenCalledTimes(1);
    } finally {
      if (prev) Object.defineProperty(document, 'hidden', prev);
    }

    remove();
  });

  it('does not call onHidden when document stays visible', () => {
    const onHidden = vi.fn<() => void>();
    const remove = createDocumentHiddenCloseListener(document, onHidden);
    const prev = Object.getOwnPropertyDescriptor(document, 'hidden');

    try {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(onHidden).not.toHaveBeenCalled();
    } finally {
      if (prev) Object.defineProperty(document, 'hidden', prev);
    }

    remove();
  });

  it('remove stops further callbacks', () => {
    const onHidden = vi.fn<() => void>();
    const remove = createDocumentHiddenCloseListener(document, onHidden);
    remove();

    const prev = Object.getOwnPropertyDescriptor(document, 'hidden');
    try {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(onHidden).not.toHaveBeenCalled();
    } finally {
      if (prev) Object.defineProperty(document, 'hidden', prev);
    }
  });
});
