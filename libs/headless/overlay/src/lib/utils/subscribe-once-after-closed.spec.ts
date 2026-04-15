import { firstValueFrom, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { afterClosedOnce, subscribeOnceAfterClosed } from './subscribe-once-after-closed';

describe('afterClosedOnce', () => {
  it('emits first afterClosed value then completes', async () => {
    const closed$ = new Subject<number>();
    const ref = { afterClosed: () => closed$.asObservable() };

    const p = firstValueFrom(afterClosedOnce(ref));
    closed$.next(7);
    await expect(p).resolves.toBe(7);
  });
});

describe('subscribeOnceAfterClosed', () => {
  it('runs fn once on first afterClosed emission', () => {
    const closed$ = new Subject<void>();
    const ref = { afterClosed: () => closed$.asObservable() };
    const fn = vi.fn();

    const sub = subscribeOnceAfterClosed(ref, fn);
    expect(typeof sub.unsubscribe).toBe('function');
    expect(fn).not.toHaveBeenCalled();

    closed$.next();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(undefined);

    closed$.next();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not run fn after unsubscribe before emit', () => {
    const closed$ = new Subject<string>();
    const ref = { afterClosed: () => closed$.asObservable() };
    const fn = vi.fn();

    const sub = subscribeOnceAfterClosed(ref, fn);
    sub.unsubscribe();

    closed$.next('reason');
    expect(fn).not.toHaveBeenCalled();
  });

  it('passes close reason to fn', () => {
    const closed$ = new Subject<{ code: number }>();
    const ref = { afterClosed: () => closed$.asObservable() };
    const fn = vi.fn();

    subscribeOnceAfterClosed(ref, fn);
    closed$.next({ code: 42 });
    expect(fn).toHaveBeenCalledWith({ code: 42 });
  });
});
