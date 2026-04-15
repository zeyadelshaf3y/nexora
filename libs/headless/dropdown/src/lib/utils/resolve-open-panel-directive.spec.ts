import { resolveOpenPanelDirective } from './resolve-open-panel-directive';

describe('resolveOpenPanelDirective', () => {
  it('prefers built-in virtual panel when virtual mode is on', () => {
    const virtual = { id: 'v' };
    const content = { id: 'c' };
    expect(resolveOpenPanelDirective(true, virtual, content)).toBe(virtual);
  });

  it('uses content-projected panel when virtual mode is off', () => {
    const virtual = { id: 'v' };
    const content = { id: 'c' };
    expect(resolveOpenPanelDirective(false, virtual, content)).toBe(content);
  });

  it('returns undefined when the chosen branch has no panel', () => {
    expect(resolveOpenPanelDirective(true, undefined, { id: 'c' })).toBeUndefined();
    expect(resolveOpenPanelDirective(false, { id: 'v' }, undefined)).toBeUndefined();
  });
});
