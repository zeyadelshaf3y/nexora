import { test, expect } from '@playwright/test';

import { settleUi, UI_SETTLE_MED_FRAMES } from './test-helpers';

test.describe('Menu demo', () => {
  test('basic menu opens and closes on Escape', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'File actions' }).click();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    const menu = page.locator('[role="menu"]').first();
    await expect(menu).toBeVisible();
    await expect(menu.locator('[role="menuitem"]').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await expect(menu).toBeHidden();
  });

  test('programmatic disable blocks open; enable restores', async ({ page }) => {
    await page.goto('/menu');
    const trigger = page.getByRole('button', { name: 'Programmatic control' });
    await page.getByRole('button', { name: 'Disable', exact: true }).click();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await expect(trigger).toHaveAttribute('aria-disabled', 'true');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await expect(page.locator('[role="menu"]:visible')).toHaveCount(0);

    await page.getByRole('button', { name: 'Enable', exact: true }).click();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await expect(trigger).not.toHaveAttribute('aria-disabled', 'true');

    await trigger.click();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await expect(page.locator('[role="menu"]').first()).toBeVisible();
  });

  test('boundaries demo menu opens', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Boundaries demo' }).click();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await expect(page.locator('.demo-menu-pane').first()).toBeVisible();
    await expect(page.locator('[role="menuitem"]').first()).toBeVisible();
  });

  test('disable() closes an open programmatic menu', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await expect(page.locator('[role="menu"]').first()).toBeVisible();

    await page.getByRole('button', { name: 'Disable', exact: true }).click();
    await settleUi(page, UI_SETTLE_MED_FRAMES);
    await expect(page.locator('[role="menu"]:visible')).toHaveCount(0);
  });

  test.describe('Scroll strategies (in scrollable demo)', () => {
    test('menu with noop: panel opens in view', async ({ page }) => {
      await page.goto('/menu');
      await page.getByRole('button', { name: 'noop' }).first().click();
      const panel = page.locator('.demo-menu-pane').first();
      await expect(panel).toBeVisible();
      await expect(panel.locator('[role="menuitem"]').first()).toBeVisible();
    });

    test('noop then reposition panels open visible', async ({ page }) => {
      await page.goto('/menu');
      await page.getByRole('button', { name: 'noop' }).first().click();
      await expect(page.locator('.demo-menu-pane').first()).toBeVisible();
      await page.keyboard.press('Escape');

      await page.getByRole('button', { name: 'reposition' }).first().click();
      await expect(page.locator('.demo-menu-pane').first()).toBeVisible();
    });
  });
});
