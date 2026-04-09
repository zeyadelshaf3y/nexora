import { createRafThrottled, rafThrottle } from './raf-throttle';

describe('rafThrottle', () => {
  it('schedules callback on next animation frame', () => {
    const spy = vi.fn();
    const cancel = rafThrottle(spy);

    expect(spy).not.toHaveBeenCalled();
    expect(typeof cancel).toBe('function');
    cancel();
  });

  it('cancel prevents the callback from running', async () => {
    const spy = vi.fn();
    const cancel = rafThrottle(spy);
    cancel();

    await new Promise((r) => requestAnimationFrame(r));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('createRafThrottled', () => {
  it('returns an object with run and cancel', () => {
    const { run, cancel } = createRafThrottled(() => {});
    expect(typeof run).toBe('function');
    expect(typeof cancel).toBe('function');
    cancel();
  });

  it('coalesces multiple run() calls into one callback per frame', async () => {
    const spy = vi.fn();
    const { run, cancel } = createRafThrottled(spy);

    run();
    run();
    run();

    await new Promise((r) => requestAnimationFrame(r));
    expect(spy).toHaveBeenCalledTimes(1);
    cancel();
  });

  it('cancel prevents pending callback', async () => {
    const spy = vi.fn();
    const { run, cancel } = createRafThrottled(spy);

    run();
    cancel();

    await new Promise((r) => requestAnimationFrame(r));
    expect(spy).not.toHaveBeenCalled();
  });

  it('allows re-scheduling after frame fires', async () => {
    const spy = vi.fn();
    const { run, cancel } = createRafThrottled(spy);

    run();
    await new Promise((r) => requestAnimationFrame(r));
    expect(spy).toHaveBeenCalledTimes(1);

    run();
    await new Promise((r) => requestAnimationFrame(r));
    expect(spy).toHaveBeenCalledTimes(2);
    cancel();
  });
});
