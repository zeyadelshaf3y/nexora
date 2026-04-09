import type { DestroyRef } from '@angular/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { afterClosedOnceUntilDestroyed } from './after-closed-once-until-destroyed';

function createDestroyRefTrigger(): { destroyRef: DestroyRef; runDestroy: () => void } {
  const callbacks: (() => void)[] = [];
  const destroyRef = {
    onDestroy(fn: () => void): void {
      callbacks.push(fn);
    },
  } as DestroyRef;

  return {
    destroyRef,
    runDestroy: () => {
      for (const cb of callbacks) cb();
    },
  };
}

describe('afterClosedOnceUntilDestroyed', () => {
  it('does not emit after destroyRef teardown before afterClosed', () => {
    const closed$ = new Subject<string>();
    const ref = { afterClosed: () => closed$.asObservable() };
    const { destroyRef, runDestroy } = createDestroyRefTrigger();
    const fn = vi.fn();

    afterClosedOnceUntilDestroyed(ref, destroyRef).subscribe(fn);
    runDestroy();
    closed$.next('late');
    expect(fn).not.toHaveBeenCalled();
  });

  it('emits first close; destroy afterwards is harmless', () => {
    const closed$ = new Subject<string>();
    const ref = { afterClosed: () => closed$.asObservable() };
    const { destroyRef, runDestroy } = createDestroyRefTrigger();
    const fn = vi.fn();

    afterClosedOnceUntilDestroyed(ref, destroyRef).subscribe(fn);
    closed$.next('ok');
    expect(fn).toHaveBeenCalledWith('ok');
    runDestroy();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
