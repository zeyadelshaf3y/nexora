import type { Observable } from 'rxjs';
import { from, of } from 'rxjs';

import type { MentionItemsResult } from '../types/mention-types';

/** Normalizes sync / Promise / Observable item sources from MentionTriggerConfig.getItems. */
export function itemsResultToObservable<T>(
  result: MentionItemsResult<T>,
): Observable<readonly T[]> {
  if (Array.isArray(result)) return of(result);

  const candidate = result as Promise<readonly T[]> | Observable<readonly T[]>;

  if (typeof (candidate as Promise<unknown>).then === 'function') {
    return from(candidate as Promise<readonly T[]>);
  }

  return candidate as Observable<readonly T[]>;
}
