import { afterEach, describe, expect, it, vi } from 'vitest';

import { MentionChipInteractionDispatcher } from './mention-chip-interaction-dispatcher';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('MentionChipInteractionDispatcher', () => {
  it('leaves immediately on mouseout to non-chip content inside the editor', () => {
    const root = document.createElement('div');
    const plain = document.createElement('span');
    plain.textContent = 'x';
    const chip = document.createElement('span');
    chip.setAttribute('data-mention-id', 'a');
    root.appendChild(plain);
    root.appendChild(chip);
    document.body.appendChild(root);

    const onLeave = vi.fn();

    const dispatcher = new MentionChipInteractionDispatcher({
      root,
      mentionIdAttr: 'data-mention-id',
      mentionLabelAttr: 'data-mention-label',
      getLeaveDelayMs: () => 999,
      onEnter: vi.fn(),
      onLeave,
      onChipClick: vi.fn(),
    });

    dispatcher.attach();

    chip.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    chip.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: plain }));

    expect(onLeave).toHaveBeenCalledTimes(1);

    dispatcher.dispose();
    root.remove();
  });

  it('schedules delayed leave on mouseout to outside element', () => {
    vi.useFakeTimers();
    const root = document.createElement('div');
    const chip = document.createElement('span');
    chip.setAttribute('data-mention-id', 'a');
    root.appendChild(chip);
    const outside = document.createElement('div');
    document.body.appendChild(root);
    document.body.appendChild(outside);

    const onLeave = vi.fn();

    const dispatcher = new MentionChipInteractionDispatcher({
      root,
      mentionIdAttr: 'data-mention-id',
      mentionLabelAttr: 'data-mention-label',
      getLeaveDelayMs: () => 100,
      onEnter: vi.fn(),
      onLeave,
      onChipClick: vi.fn(),
    });

    dispatcher.attach();

    chip.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(onLeave).not.toHaveBeenCalled();
    chip.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: outside }));
    vi.advanceTimersByTime(99);
    expect(onLeave).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onLeave).toHaveBeenCalledTimes(1);

    dispatcher.dispose();
    root.remove();
    outside.remove();
  });
});
