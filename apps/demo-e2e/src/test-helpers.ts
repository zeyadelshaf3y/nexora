import type { Page } from '@playwright/test';

/**
 * Coalesce microtasks + paint after keyboard/DOM updates (replaces fixed `waitForTimeout` sleeps).
 * Each frame is ~16ms at 60Hz; tune counts if CI flakes.
 */
export async function settleUi(page: Page, frameCount: number): Promise<void> {
  await page.evaluate(async (n) => {
    for (let i = 0; i < n; i++) {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    }
    // Let Angular microtask/CD queues drain after rAF (keyboard handlers often schedule here).
    await new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));
  }, frameCount);
}

/** After single key / small step (~legacy 50ms sleeps) */
export const UI_SETTLE_SHORT_FRAMES = 12;

/** After Enter/Space / click focus (~100ms) */
export const UI_SETTLE_MED_FRAMES = 18;

/** Heavier selection updates (~150ms) */
export const UI_SETTLE_LONG_FRAMES = 26;

/**
 * Must exceed listbox {@link TYPEAHEAD_BUFFER_MS} in `libs/headless/listbox/src/lib/state/typeahead.ts` (400).
 */
export const TYPEAHEAD_BUFFER_RESET_MS = 450;

export async function waitTypeaheadBufferReset(page: Page): Promise<void> {
  await page.evaluate(
    (ms) => new Promise<void>((r) => setTimeout(r, ms)),
    TYPEAHEAD_BUFFER_RESET_MS,
  );
}

export async function waitAppChromeVisible(page: Page): Promise<void> {
  await page.locator('.app-header').waitFor({ state: 'visible' });
}
