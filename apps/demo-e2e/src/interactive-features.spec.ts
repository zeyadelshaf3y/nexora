import path from 'path';

import { expect, test, type Page } from '@playwright/test';

import {
  settleUi,
  UI_SETTLE_LONG_FRAMES,
  UI_SETTLE_MED_FRAMES,
  waitAppChromeVisible,
} from './test-helpers';

/**
 * Full-app screenshot tour: wait for visible UI / overlays instead of fixed sleeps where possible.
 */
/* eslint-disable playwright/no-conditional-in-test -- demo markup branches (popover close, overview actions, avatar menu) */

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'interactive');

async function readyAfterNav(page: Page): Promise<void> {
  await waitAppChromeVisible(page);
  await settleUi(page, UI_SETTLE_LONG_FRAMES);
}

test.describe('Interactive Features - Full walkthrough', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('1. Tooltip page - hover to show tooltips', async ({ page }) => {
    await page.getByRole('link', { name: 'Tooltip' }).click();
    await page.waitForURL('**/tooltip');
    await readyAfterNav(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-tooltip-page.png'),
      fullPage: true,
    });

    const saveBtn = page.locator('button', { hasText: 'Save' }).first();
    await saveBtn.hover();
    const tooltip = page.locator('[role="tooltip"]').first();
    await expect(tooltip).toBeVisible();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-tooltip-hover-save.png'),
      fullPage: false,
    });

    await page.mouse.move(0, 0);
    await expect(tooltip).toBeHidden({ timeout: 10_000 });

    await page.locator('button', { hasText: 'Delete' }).first().hover();
    await expect(page.locator('[role="tooltip"]').first()).toBeVisible();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-tooltip-hover-delete.png'),
      fullPage: false,
    });
  });

  test('2. Popover page - click to open popover', async ({ page }) => {
    await page.getByRole('link', { name: 'Popover' }).click();
    await page.waitForURL('**/popover');
    await readyAfterNav(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-popover-page.png'),
      fullPage: true,
    });

    const clickBtn = page
      .locator('section')
      .filter({ hasText: 'Trigger Types' })
      .locator('button', { hasText: 'Click' })
      .first();
    await clickBtn.click();
    const popover = page.locator('.demo-popover-pane').first();
    await expect(popover).toBeVisible();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-popover-open.png'),
      fullPage: false,
    });

    const closeBtn = popover.locator('button', { hasText: 'Close' });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.locator('h2', { hasText: 'All 12 Placements' }).click();
    }
    await expect(popover).toBeHidden();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '06-popover-closed.png'),
      fullPage: false,
    });
  });

  test('3. Dialog page - open template dialog with scale animation', async ({ page }) => {
    await page.getByRole('link', { name: 'Dialog' }).click();
    await page.waitForURL('**/dialog');
    await readyAfterNav(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '07-dialog-page.png'),
      fullPage: true,
    });

    await page.locator('button', { hasText: 'Open template dialog' }).click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    await settleUi(page, UI_SETTLE_LONG_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '08-dialog-open.png'),
      fullPage: false,
    });

    const doneBtn = dialog.locator('button', { hasText: 'Done' }).first();
    await doneBtn.click();
    await expect(dialog).toBeHidden();
    await settleUi(page, UI_SETTLE_LONG_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '09-dialog-closed.png'),
      fullPage: false,
    });
  });

  test('4. Snackbar page - fire a snackbar at a placement', async ({ page }) => {
    await page.getByRole('link', { name: 'Snackbar' }).click();
    await page.waitForURL('**/snackbar');
    await readyAfterNav(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '10-snackbar-page.png'),
      fullPage: true,
    });

    await page.locator('button', { hasText: 'bottom-end' }).first().click();
    const snackbar = page.locator('[data-placement^="snackbar-"]').first();
    await expect(snackbar).toBeVisible();
    await settleUi(page, UI_SETTLE_LONG_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '11-snackbar-visible.png'),
      fullPage: false,
    });

    const dismissBtn = snackbar.locator('button', { hasText: 'Dismiss' }).first();
    await dismissBtn.click();
    await expect(snackbar).toBeHidden();
    await settleUi(page, UI_SETTLE_LONG_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '12-snackbar-dismissed.png'),
      fullPage: false,
    });
  });

  test('5. Listbox page - click options to test selection', async ({ page }) => {
    await page.getByRole('link', { name: 'Listbox' }).click();
    await page.waitForURL('**/listbox');
    await readyAfterNav(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '13-listbox-page.png'),
      fullPage: true,
    });

    const singleSection = page.locator('section').filter({ hasText: 'Single Select' });
    const appleOption = singleSection.locator('[role="option"]', { hasText: 'Apple' });
    await appleOption.click();
    await expect(singleSection.locator('.listbox-page-meta')).toContainText('Apple');
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '14-listbox-apple-selected.png'),
      fullPage: false,
    });

    const bananaOption = singleSection.locator('[role="option"]', { hasText: 'Banana' });
    await bananaOption.click();
    await expect(singleSection.locator('.listbox-page-meta')).toContainText('Banana');
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '15-listbox-banana-selected.png'),
      fullPage: false,
    });

    const selectedText = await singleSection.locator('.listbox-page-meta').textContent();

    const multiSection = page.locator('section').filter({ hasText: 'Multi Select' });
    const multiApple = multiSection.locator('[role="option"]', { hasText: 'Apple' });
    const multiDate = multiSection.locator('[role="option"]', { hasText: 'Date' });
    await multiApple.click();
    await multiDate.click();
    await expect(multiSection.locator('.listbox-page-meta')).toContainText('Date');
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '16-listbox-multi-select.png'),
      fullPage: false,
    });

    expect(selectedText).toContain('Banana');
  });

  test('6. Overview page - click a card action button', async ({ page }) => {
    await page.getByRole('link', { name: 'Overview' }).click();
    await page.waitForURL('**/overview');
    await readyAfterNav(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '17-overview-page.png'),
      fullPage: true,
    });

    const actionsCard = page.locator('.overview-card').filter({ hasText: 'Popover + Listbox' });
    const quickActionsBtn = actionsCard.locator('button', { hasText: 'Quick Actions' });
    await quickActionsBtn.click();
    const popover = page.locator('.demo-popover-pane').first();
    await expect(popover).toBeVisible();
    await settleUi(page, UI_SETTLE_LONG_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '18-overview-quick-actions.png'),
      fullPage: false,
    });

    const createOption = popover.locator('.overview-action-item', { hasText: 'Create' });
    if (await createOption.isVisible()) {
      await createOption.click();
      await settleUi(page, UI_SETTLE_MED_FRAMES);
    }
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '19-overview-action-activated.png'),
      fullPage: false,
    });
  });

  test('7. Dark mode - toggle and open dialog in dark mode', async ({ page }) => {
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '20-light-mode-initial.png'),
      fullPage: false,
    });

    const themeToggle = page.locator('.app-header__btn').nth(1);
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await settleUi(page, UI_SETTLE_LONG_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '21-dark-mode-toggled.png'),
      fullPage: false,
    });

    await page.getByRole('link', { name: 'Dialog' }).click();
    await page.waitForURL('**/dialog');
    await readyAfterNav(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '22-dark-dialog-page.png'),
      fullPage: true,
    });

    await page.locator('button', { hasText: 'Open template dialog' }).click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    await settleUi(page, UI_SETTLE_LONG_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '23-dark-dialog-open.png'),
      fullPage: false,
    });

    await dialog.locator('button', { hasText: 'Done' }).first().click();
    await expect(dialog).toBeHidden();

    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await settleUi(page, UI_SETTLE_MED_FRAMES);
  });

  test('8. User avatar popover + listbox menu', async ({ page }) => {
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '24-before-avatar-click.png'),
      fullPage: false,
    });

    const avatarBtn = page.locator('.sidebar-user__trigger');
    await avatarBtn.click();
    const popover = page.locator('.demo-popover-pane').first();
    await expect(popover).toBeVisible();
    await settleUi(page, UI_SETTLE_LONG_FRAMES);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '25-avatar-popover-open.png'),
      fullPage: false,
    });

    const menuItems = popover.locator('.user-menu-item');
    const menuCount = await menuItems.count();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '26-avatar-menu-items.png'),
      fullPage: false,
    });

    if (menuCount > 0) {
      await menuItems.first().click();
      await settleUi(page, UI_SETTLE_MED_FRAMES);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '27-avatar-menu-action.png'),
        fullPage: false,
      });
    }

    expect(menuCount).toBeGreaterThan(0);
  });

  test('Bonus: console errors check', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    const routes = [
      '/overview',
      '/tooltip',
      '/popover',
      '/dialog',
      '/snackbar',
      '/listbox',
      '/select',
      '/combobox',
    ];
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await waitAppChromeVisible(page);
    }

    await page.goto('/dialog', { waitUntil: 'domcontentloaded' });
    await waitAppChromeVisible(page);
    await page.locator('button', { hasText: 'Open template dialog' }).click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await dialog.locator('button', { hasText: 'Done' }).first().click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    expect(errors).toEqual([]);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '28-final-state.png'),
      fullPage: false,
    });
  });
});
