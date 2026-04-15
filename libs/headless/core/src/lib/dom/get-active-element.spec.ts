import { getActiveElement } from './get-active-element';

describe('getActiveElement', () => {
  it('returns the currently focused element', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    btn.focus();
    expect(getActiveElement()).toBe(btn);
    document.body.removeChild(btn);
  });

  it('returns body or null when nothing specific is focused', () => {
    const result = getActiveElement();
    expect(result === document.body || result === null).toBe(true);
  });
});
