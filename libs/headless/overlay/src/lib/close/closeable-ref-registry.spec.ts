import { vi } from 'vitest';

import {
  closestCloseableRef,
  registerCloseableRef,
  unregisterCloseableRef,
} from './closeable-ref-registry';

const PANE_REF_KEY = Symbol.for('@nexora-ui/overlay#closeable-pane-ref');

describe('closeable-ref-registry', () => {
  afterEach(() => {
    document.querySelectorAll('[data-nxr-overlay="pane"]').forEach((pane) => {
      unregisterCloseableRef(pane as HTMLElement);
    });
  });

  it('registers, resolves, and unregisters a closeable ref for a pane', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-nxr-overlay', 'pane');
    const button = document.createElement('button');
    pane.appendChild(button);
    document.body.appendChild(pane);

    const close = vi.fn();
    registerCloseableRef(pane, { close });

    expect(closestCloseableRef(button)).toEqual({ close });

    unregisterCloseableRef(pane);
    expect(closestCloseableRef(button)).toBeNull();

    pane.remove();
  });

  it('stores the pane ref map on globalThis under a shared Symbol.for key', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-nxr-overlay', 'pane');
    const close = vi.fn();

    registerCloseableRef(pane, { close });

    const globalMap = Reflect.get(globalThis, PANE_REF_KEY) as
      | WeakMap<HTMLElement, { close(value?: unknown): unknown }>
      | undefined;
    expect(globalMap?.get(pane)).toEqual({ close });

    unregisterCloseableRef(pane);
  });

  it('returns null when the element is not inside an overlay pane', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);

    expect(closestCloseableRef(button)).toBeNull();

    button.remove();
  });
});
