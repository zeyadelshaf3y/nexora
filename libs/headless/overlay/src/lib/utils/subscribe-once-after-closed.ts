import { take, type Observable, type Subscription } from 'rxjs';

/** First emission from `afterClosed()`, then completes (for `takeUntilDestroyed` or manual subscribe). */
export function afterClosedOnce<T>(ref: { afterClosed(): Observable<T> }): Observable<T> {
  return ref.afterClosed().pipe(take(1));
}

/**
 * Subscribes once to the first `afterClosed()` emission (typical overlay/snackbar teardown).
 * Returns the `Subscription` so callers can `unsubscribe()` before emit (e.g. directive destroy).
 */
export function subscribeOnceAfterClosed<T>(
  ref: { afterClosed(): Observable<T> },
  fn: (reason: T) => void,
): Subscription {
  return afterClosedOnce(ref).subscribe(fn);
}
