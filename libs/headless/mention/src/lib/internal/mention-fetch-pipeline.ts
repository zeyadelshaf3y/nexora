import type { Subject, Subscription } from 'rxjs';
import { catchError, defer, map, of, switchMap, takeUntil } from 'rxjs';

import type { MentionSession } from '../types/mention-types';
import { itemsResultToObservable } from '../utils/mention-rx';

export type MentionFetchRequest<T> = {
  sessionId: number;
  query: string;
  session: MentionSession<T>;
};

export type MentionFetchResult<T> = {
  sessionId: number;
  query: string;
  session: MentionSession<T>;
  items: readonly T[];
};

/**
 * Rx pipeline: debounced `getItems` with abort on close; errors become empty lists + optional error signal.
 */
export function subscribeMentionItemsFetch<T>(params: {
  readonly fetchRequest$: Subject<MentionFetchRequest<T>>;
  readonly fetchAbort$: Subject<void>;
  readonly getSessionId: () => number;
  readonly onError: (err: unknown) => void;
  readonly onResult: (result: MentionFetchResult<T>) => void;
}): Subscription {
  const { fetchRequest$, fetchAbort$, getSessionId, onError, onResult } = params;

  return fetchRequest$
    .pipe(
      switchMap(({ sessionId, query, session }) =>
        defer(() => itemsResultToObservable(session.triggerConfig.getItems(query, session))).pipe(
          catchError((err: unknown) => {
            if (sessionId === getSessionId()) onError(err);

            return of([] as T[]);
          }),
          map((items) => ({
            sessionId,
            query,
            session,
            items,
          })),
          takeUntil(fetchAbort$),
        ),
      ),
    )
    .subscribe(onResult);
}
