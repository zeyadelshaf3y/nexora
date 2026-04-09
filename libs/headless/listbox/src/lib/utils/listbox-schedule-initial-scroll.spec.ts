import { describe, expect, it } from 'vitest';

import {
  bindListboxReadyWithActiveScroll,
  scheduleListboxScrollActiveOnNextMicrotask,
} from './listbox-schedule-initial-scroll';

describe('scheduleListboxScrollActiveOnNextMicrotask', () => {
  it('invokes scrollActiveIntoView after the current microtask', async () => {
    const calls: string[] = [];
    scheduleListboxScrollActiveOnNextMicrotask({
      scrollActiveIntoView: () => {
        calls.push('scroll');
      },
    });
    expect(calls).toEqual([]);
    await Promise.resolve();
    expect(calls).toEqual(['scroll']);
  });
});

describe('bindListboxReadyWithActiveScroll', () => {
  it('sets ref then schedules scroll on the next microtask', async () => {
    const refs: unknown[] = [];
    const scrolls: unknown[] = [];
    const listbox = {
      scrollActiveIntoView: () => scrolls.push('scroll'),
    };
    const onReady = bindListboxReadyWithActiveScroll((lb) => refs.push(lb));
    onReady(listbox);
    expect(refs).toEqual([listbox]);
    expect(scrolls).toEqual([]);
    await Promise.resolve();
    expect(scrolls).toEqual(['scroll']);
  });
});
