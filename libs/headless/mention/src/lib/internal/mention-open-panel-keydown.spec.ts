import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import type { MentionSession } from '../types/mention-types';

import { handleMentionOpenPanelKeydown } from './mention-open-panel-keydown';

function mockSession(
  overrides: { selectOnEnter?: boolean; selectOnTab?: boolean } = {},
): MentionSession<string> {
  return {
    id: 1,
    match: {} as MentionSession<string>['match'],
    triggerConfig: {
      trigger: '@',
      getItems: () => [],
      displayWith: (s) => s,
      selectOnEnter: overrides.selectOnEnter ?? true,
      selectOnTab: overrides.selectOnTab ?? false,
    },
    caretRect: null,
    status: 'open',
  } as MentionSession<string>;
}

describe('handleMentionOpenPanelKeydown', () => {
  it('moves active index on arrows', () => {
    const active = signal(0);
    const ev = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    handleMentionOpenPanelKeydown(ev, {
      session: mockSession(),
      items: ['a', 'b'],
      activeIndex: active(),
      setActiveIndex: (i) => active.set(i),
      select: vi.fn(),
      close: vi.fn(),
    });
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(active()).toBe(1);
  });

  it('closes on Escape', () => {
    const close = vi.fn();
    const ev = { key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    handleMentionOpenPanelKeydown(ev, {
      session: mockSession(),
      items: ['a'],
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      select: vi.fn(),
      close,
    });
    expect(close).toHaveBeenCalled();
  });
});
