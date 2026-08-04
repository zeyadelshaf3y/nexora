import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  bindMentionVirtualAnchorRect,
  createMentionVirtualAnchorElement,
  normalizeMentionAnchorRect,
  removeMentionVirtualAnchorElement,
} from './mention-virtual-anchor';

describe('mention-virtual-anchor', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('normalizeMentionAnchorRect keeps origin and enforces min 1px size', () => {
    const out = normalizeMentionAnchorRect(new DOMRect(10, 20, 0, 18));
    expect(out.x).toBe(10);
    expect(out.y).toBe(20);
    expect(out.width).toBe(1);
    expect(out.height).toBe(18);
  });

  it('live getBoundingClientRect reports the getter rect (not the styled fixed box)', () => {
    const live = new DOMRect(120, 340, 0, 22);
    const el = createMentionVirtualAnchorElement(new DOMRect(0, 0, 1, 1), 'ltr', () => live);

    // Styled box intentionally differs from the live caret rect.
    el.style.left = '0px';
    el.style.top = '0px';

    const reported = el.getBoundingClientRect();
    expect(reported.left).toBe(120);
    expect(reported.top).toBe(340);
    expect(reported.width).toBe(1);
    expect(reported.height).toBe(22);

    removeMentionVirtualAnchorElement(el);
  });

  it('falls back to the native box when the live getter returns null', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    Object.assign(el.style, {
      position: 'fixed',
      left: '40px',
      top: '60px',
      width: '2px',
      height: '16px',
    });

    bindMentionVirtualAnchorRect(el, () => null);
    const native = HTMLElement.prototype.getBoundingClientRect.call(el);
    const reported = el.getBoundingClientRect();

    expect(reported.left).toBe(native.left);
    expect(reported.top).toBe(native.top);
  });

  it('createMentionVirtualAnchorElement appends an aria-hidden fixed node', () => {
    const el = createMentionVirtualAnchorElement(new DOMRect(1, 2, 3, 4), 'rtl');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.dir).toBe('rtl');
    expect(el.style.position).toBe('fixed');
    expect(document.body.contains(el)).toBe(true);
    removeMentionVirtualAnchorElement(el);
    expect(document.body.contains(el)).toBe(false);
  });

  it('live getter is re-read on each getBoundingClientRect call', () => {
    const getRect = vi
      .fn<() => DOMRect | null>()
      .mockReturnValueOnce(new DOMRect(1, 2, 0, 10))
      .mockReturnValueOnce(new DOMRect(5, 9, 0, 10));

    const el = createMentionVirtualAnchorElement(null, undefined, getRect);
    expect(el.getBoundingClientRect().left).toBe(1);
    expect(el.getBoundingClientRect().left).toBe(5);
    expect(getRect).toHaveBeenCalledTimes(2);
    removeMentionVirtualAnchorElement(el);
  });
});
