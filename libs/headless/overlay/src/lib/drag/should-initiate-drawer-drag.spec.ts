import { describe, expect, it } from 'vitest';

import { shouldInitiateDrawerDrag } from './should-initiate-drawer-drag';

function pointerDownOn(): PointerEvent {
  return new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 });
}

describe('shouldInitiateDrawerDrag', () => {
  it('allows drag from non-interactive content', () => {
    const pane = document.createElement('div');
    const text = document.createElement('p');
    pane.appendChild(text);
    document.body.appendChild(pane);

    const event = pointerDownOn();
    Object.defineProperty(event, 'target', { value: text });

    expect(shouldInitiateDrawerDrag(event)).toBe(true);

    pane.remove();
  });

  it('blocks drag when pointerdown starts on a button', () => {
    const pane = document.createElement('div');
    const button = document.createElement('button');
    button.textContent = 'Close';
    pane.appendChild(button);
    document.body.appendChild(pane);

    const event = pointerDownOn();
    Object.defineProperty(event, 'target', { value: button });

    expect(shouldInitiateDrawerDrag(event)).toBe(false);

    pane.remove();
  });

  it('blocks drag when pointerdown starts on a link', () => {
    const pane = document.createElement('div');
    const link = document.createElement('a');
    link.href = '#settings';
    link.textContent = 'Settings';
    pane.appendChild(link);
    document.body.appendChild(pane);

    const event = pointerDownOn();
    Object.defineProperty(event, 'target', { value: link });

    expect(shouldInitiateDrawerDrag(event)).toBe(false);

    pane.remove();
  });

  it('allows drag when pointerdown starts on an explicit drag handle', () => {
    const pane = document.createElement('div');
    const handle = document.createElement('div');
    handle.className = 'nxr-drawer-drag-handle';
    const button = document.createElement('button');
    handle.appendChild(button);
    pane.appendChild(handle);
    document.body.appendChild(pane);

    const event = pointerDownOn();
    Object.defineProperty(event, 'target', { value: button });

    expect(shouldInitiateDrawerDrag(event)).toBe(true);

    pane.remove();
  });
});
