import { composeHandlers } from './compose-handlers';

describe('composeHandlers', () => {
  it('calls all handlers in order', () => {
    const order: number[] = [];

    const composed = composeHandlers(
      () => order.push(1),
      () => order.push(2),
      () => order.push(3),
    );

    composed();
    expect(order).toEqual([1, 2, 3]);
  });

  it('skips undefined and null handlers', () => {
    const spy = vi.fn();
    const composed = composeHandlers(undefined, spy, null, spy);

    composed();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('returns the last non-undefined result', () => {
    const composed = composeHandlers(
      () => 'a',
      () => 'b',
    );

    expect(composed()).toBe('b');
  });

  it('passes arguments through to all handlers', () => {
    const spyA = vi.fn();
    const spyB = vi.fn();
    const composed = composeHandlers(spyA, spyB);

    composed('arg1', 'arg2');
    expect(spyA).toHaveBeenCalledWith('arg1', 'arg2');
    expect(spyB).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('returns a callable function even with no handlers', () => {
    const composed = composeHandlers();
    expect(() => composed()).not.toThrow();
  });

  it('returns the sole handler reference when only one is provided', () => {
    const only = () => 42;
    expect(composeHandlers(undefined, only, null)).toBe(only);
  });
});
