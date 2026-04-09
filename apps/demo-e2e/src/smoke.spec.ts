import { test, expect } from '@playwright/test';

test('has title in header', async ({ page }) => {
  await page.goto('/overview');
  await expect(page.locator('.app-header__title')).toContainText('Overview');
});

test('snackbar opens and can be dismissed', async ({ page }) => {
  await page.goto('/snackbar');
  await page.getByRole('button', { name: 'bottom-end' }).first().click();
  const snackbar = page.locator('[data-placement^="snackbar-"]').first();
  await expect(snackbar).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).first().click();
  await expect(snackbar).toBeHidden();
});

test('popover opens on click', async ({ page }) => {
  await page.goto('/popover');
  await page.getByRole('button', { name: 'Click' }).first().click();
  const popover = page.locator('.demo-popover-pane').first();
  await expect(popover).toBeVisible();
});

test('tooltip shows on hover', async ({ page }) => {
  await page.goto('/tooltip');
  await page.getByRole('button', { name: 'Save' }).hover();
  const tooltip = page.locator('[role="tooltip"]').first();
  await expect(tooltip).toBeVisible({ timeout: 2000 });
  await expect(tooltip).toContainText('Save your changes');
});
