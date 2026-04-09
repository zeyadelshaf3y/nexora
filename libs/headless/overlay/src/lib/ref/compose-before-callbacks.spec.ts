import { CLOSE_REASON_ESCAPE, type CloseReason } from './close-reason';
import {
  composeBeforeCloseCallbacks,
  composeBeforeOpenCallbacks,
} from './compose-before-callbacks';

describe('composeBeforeOpenCallbacks', () => {
  it('returns undefined when both are undefined', () => {
    expect(composeBeforeOpenCallbacks(undefined, undefined)).toBeUndefined();
  });

  it('runs only second when first is undefined', async () => {
    let secondCalls = 0;

    const second = (): undefined => {
      secondCalls += 1;

      return undefined;
    };

    const composed = composeBeforeOpenCallbacks(undefined, second);
    if (composed == null) throw new Error('expected composed');
    expect(await composed()).toBe(undefined);
    expect(secondCalls).toBe(1);
  });

  it('runs first then second when both return undefined', async () => {
    const order: string[] = [];

    const first = (): undefined => {
      order.push('first');

      return undefined;
    };

    const second = (): undefined => {
      order.push('second');

      return undefined;
    };

    const composed = composeBeforeOpenCallbacks(first, second);
    if (composed == null) throw new Error('expected composed');
    await composed();
    expect(order).toEqual(['first', 'second']);
  });

  it('does not run second when first returns false', async () => {
    let secondCalls = 0;

    const second = (): undefined => {
      secondCalls += 1;

      return undefined;
    };

    const composed = composeBeforeOpenCallbacks(() => false, second);
    if (composed == null) throw new Error('expected composed');
    expect(await composed()).toBe(false);
    expect(secondCalls).toBe(0);
  });

  it('resolves false from second', async () => {
    const composed = composeBeforeOpenCallbacks(
      () => undefined,
      () => false,
    );

    if (composed == null) throw new Error('expected composed');
    expect(await composed()).toBe(false);
  });
});

describe('composeBeforeCloseCallbacks', () => {
  it('returns undefined when both are undefined', () => {
    expect(composeBeforeCloseCallbacks(undefined, undefined)).toBeUndefined();
  });

  it('passes reason to both in order', async () => {
    const reasons: CloseReason[] = [];

    const first = (r: CloseReason): undefined => {
      reasons.push(r);

      return undefined;
    };

    const second = (r: CloseReason): undefined => {
      reasons.push(r);

      return undefined;
    };

    const composed = composeBeforeCloseCallbacks(first, second);
    if (composed == null) throw new Error('expected composed');
    await composed(CLOSE_REASON_ESCAPE);
    expect(reasons).toEqual([CLOSE_REASON_ESCAPE, CLOSE_REASON_ESCAPE]);
  });

  it('does not run second when first returns false', async () => {
    let secondCalls = 0;

    const second = (): undefined => {
      secondCalls += 1;

      return undefined;
    };

    const composed = composeBeforeCloseCallbacks(() => false, second);
    if (composed == null) throw new Error('expected composed');
    expect(await composed(CLOSE_REASON_ESCAPE)).toBe(false);
    expect(secondCalls).toBe(0);
  });
});
