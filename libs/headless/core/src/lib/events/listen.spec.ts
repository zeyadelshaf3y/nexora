import { listen } from './listen';

describe('listen', () => {
  it('attaches an event listener and returns a cleanup function', () => {
    const el = document.createElement('div');
    const spy = vi.fn();
    const cleanup = listen(el, 'click', spy);

    el.dispatchEvent(new Event('click'));
    expect(spy).toHaveBeenCalledTimes(1);

    cleanup();

    el.dispatchEvent(new Event('click'));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns a no-op cleanup for null target', () => {
    const cleanup = listen(null, 'click', () => {});
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('returns a no-op cleanup for undefined target', () => {
    const cleanup = listen(undefined, 'click', () => {});
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('supports capture option', () => {
    const parent = document.createElement('div');
    const child = document.createElement('button');
    parent.appendChild(child);
    document.body.appendChild(parent);

    const order: string[] = [];
    listen(parent, 'click', () => order.push('capture'), true);
    listen(parent, 'click', () => order.push('bubble'));
    child.dispatchEvent(new Event('click', { bubbles: true }));

    expect(order).toEqual(['capture', 'bubble']);
    document.body.removeChild(parent);
  });
});
