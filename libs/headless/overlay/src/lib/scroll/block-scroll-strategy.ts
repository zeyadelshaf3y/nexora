import { getGlobal } from '@nexora-ui/core';

import type { ScrollStrategy } from './scroll-strategy';

// ---------------------------------------------------------------------------
// Centralized scroll lock manager. Uses a Set of active consumers so the
// lock/unlock is order-independent — no matter which overlay attaches or
// detaches first, scroll is only restored when ALL consumers have detached.
// ---------------------------------------------------------------------------

interface SavedBodyStyles {
  readonly overflow: string;
  readonly paddingRight: string;
}

const activeConsumers = new Set<BlockScrollStrategy>();
let saved: SavedBodyStyles | null = null;

function getWindowElements() {
  const win = getGlobal();
  const body = win?.document.body;
  const root = win?.document.documentElement;

  return { win, body, root };
}

/** Scrollbar width for padding compensation (uses layout viewport on `<html>`). */
function getScrollbarWidth(win: Window, root: HTMLElement | undefined): number {
  if (!root) return 0;
  return win.innerWidth - root.clientWidth;
}

function lockScroll(consumer: BlockScrollStrategy): void {
  activeConsumers.add(consumer);
  if (activeConsumers.size > 1) return;

  const { win, body, root } = getWindowElements();

  if (!body || !win) return;

  saved = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };

  const scrollbarWidth = getScrollbarWidth(win, root);

  if (scrollbarWidth > 0) {
    const currentPadding = parseFloat(win.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }

  // Only lock `body`. Avoid `overflow: hidden` on `<html>` — it breaks `position: sticky`
  // on page chrome (headers, sidebars) behind the modal.
  body.style.overflow = 'hidden';
}

function unlockScroll(consumer: BlockScrollStrategy): void {
  activeConsumers.delete(consumer);
  if (activeConsumers.size > 0) return;

  const { body } = getWindowElements();

  if (body && saved) {
    body.style.overflow = saved.overflow;
    body.style.paddingRight = saved.paddingRight;
  }

  saved = null;
}

/**
 * Scroll strategy that blocks body scroll while the overlay is open.
 *
 * Compensates for the removed scrollbar by adding equivalent `padding-right`
 * to `document.body`, preventing the layout shift that occurs when
 * `overflow: hidden` removes the scrollbar. Only `body` is locked — not
 * `document.documentElement` — so `position: sticky` page chrome keeps working.
 *
 * Uses a centralized Set of active consumers so nested overlays share a
 * single lock. Scroll is only restored when every overlay using this strategy
 * has detached — regardless of close order.
 */
export class BlockScrollStrategy implements ScrollStrategy {
  private locked = false;

  attach(): void {
    if (this.locked) return;
    this.locked = true;
    lockScroll(this);
  }

  detach(): void {
    if (!this.locked) return;
    this.locked = false;
    unlockScroll(this);
  }
}
