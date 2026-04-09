import { signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MentionLoadingSchedule } from './mention-loading-schedule';

describe('MentionLoadingSchedule', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('begin without debounce sets loading immediately', () => {
    const loading = signal(false);
    const s = new MentionLoadingSchedule(loading, 0, 0);
    s.begin();
    expect(loading()).toBe(true);
  });

  it('reset clears loading', () => {
    const loading = signal(true);
    const s = new MentionLoadingSchedule(loading, 0, 0);
    s.reset();
    expect(loading()).toBe(false);
  });
});
