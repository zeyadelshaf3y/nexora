import type { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';

import { afterClosedOnce } from './subscribe-once-after-closed';

/** `afterClosedOnce(ref)` unsubscribed when `destroyRef` is destroyed (directive/component teardown). */
export function afterClosedOnceUntilDestroyed<T>(
  ref: { afterClosed(): Observable<T> },
  destroyRef: DestroyRef,
): Observable<T> {
  return afterClosedOnce(ref).pipe(takeUntilDestroyed(destroyRef));
}
