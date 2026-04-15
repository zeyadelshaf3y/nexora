import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { itemsResultToObservable } from './mention-rx';

describe('itemsResultToObservable', () => {
  type Row = { id: string };

  it('wraps a sync readonly array', async () => {
    const rows: readonly Row[] = [{ id: 'a' }];
    const out = await firstValueFrom(itemsResultToObservable<Row>(rows));

    expect(out).toEqual(rows);
  });

  it('unwraps Promise<readonly T[]>', async () => {
    const out = await firstValueFrom(itemsResultToObservable<Row>(Promise.resolve([{ id: 'p' }])));

    expect(out).toEqual([{ id: 'p' }]);
  });

  it('passes through Observable<readonly T[]>', async () => {
    const out = await firstValueFrom(itemsResultToObservable<Row>(of([{ id: 'o' }])));

    expect(out).toEqual([{ id: 'o' }]);
  });
});
