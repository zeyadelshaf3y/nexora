import { test, expect } from '@playwright/test';

test.describe('Overlay flows', () => {
  test('dialog opens and closes via button', async ({ page }) => {
    await page.goto('/dialog');
    await page.getByRole('button', { name: 'Open Template Dialog' }).first().click();
    const dialog = page
      .locator('.demo-dialog-pane, [role="dialog"]')
      .filter({ hasText: 'Template Dialog' })
      .first();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).first().click();
    await expect(dialog).toBeHidden();
  });

  test('dialog closes on Escape', async ({ page }) => {
    await page.goto('/dialog');
    await page.getByRole('button', { name: 'Open Template Dialog' }).first().click();
    const dialog = page.locator('[role="dialog"]').filter({ hasText: 'Template Dialog' }).first();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('drawer opens and closes', async ({ page }) => {
    await page.goto('/drawer');
    await page.getByRole('button', { name: 'end' }).first().click();
    const drawer = page.locator('[data-placement^="drawer-"]').first();
    await expect(drawer).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).first().click();
    await expect(drawer).toBeHidden();
  });

  test('popover opens on click and closes on outside', async ({ page }) => {
    await page.goto('/popover');
    await page.getByRole('button', { name: 'Click' }).first().click();
    const popover = page.locator('.demo-popover-pane').first();
    await expect(popover).toBeVisible();
    await page.locator('.page-section-title').first().click();
    await expect(popover).toBeHidden();
  });

  test('snackbar appears and can be dismissed', async ({ page }) => {
    await page.goto('/snackbar');
    await page.getByRole('button', { name: 'bottom-end' }).first().click();
    const snackbar = page.locator('[data-placement^="snackbar-"]').first();
    await expect(snackbar).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).first().click();
    await expect(snackbar).toBeHidden();
  });

  test('nested: dialog contains tooltip and popover', async ({ page }) => {
    await page.goto('/dialog');
    await page.getByRole('button', { name: 'Open Template Dialog' }).first().click();
    const dialog = page.locator('[role="dialog"]').filter({ hasText: 'Template Dialog' }).first();
    await expect(dialog).toBeVisible();

    await page.getByText('Hover for tooltip').hover();
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    await page.getByRole('button', { name: 'Nested popover' }).first().click();
    const popover = page.locator('.demo-popover-pane');
    await expect(popover).toBeVisible();

    await page.getByRole('button', { name: 'Done' }).first().click();
    await expect(dialog).toBeHidden();
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/overview');
    await expect(page.locator('.app-header__title')).toContainText('Overview');

    await page.locator('.sidebar-nav__item', { hasText: 'Dialog' }).click();
    await expect(page.locator('.app-header__title')).toContainText('Dialog');

    await page.locator('.sidebar-nav__item', { hasText: 'Listbox' }).click();
    await expect(page.locator('.app-header__title')).toContainText('Listbox');
  });

  test('dark mode toggle persists', async ({ page }) => {
    await page.goto('/overview');
    await page.locator('.app-header__btn').last().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('sidebar collapse toggle', async ({ page }) => {
    await page.goto('/overview');
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toHaveClass(/sidebar--collapsed/);
    await page.locator('.sidebar-toggle').click();
    await expect(sidebar).toHaveClass(/sidebar--collapsed/);
  });
});
