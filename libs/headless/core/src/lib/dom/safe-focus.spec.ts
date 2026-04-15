import { safeFocus } from './safe-focus';

describe('safeFocus', () => {
  it('focuses the given element', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    safeFocus(btn);
    expect(document.activeElement).toBe(btn);
    document.body.removeChild(btn);
  });

  it('does not throw for null', () => {
    expect(() => safeFocus(null)).not.toThrow();
  });

  it('does not throw for undefined', () => {
    expect(() => safeFocus(undefined)).not.toThrow();
  });

  it('does not throw for an element without a focus method', () => {
    const el = {} as HTMLElement;
    expect(() => safeFocus(el)).not.toThrow();
  });
});
