import { test, expect, type Page } from '@playwright/test';

/**
 * WebKit can drop rapid ArrowDown events before the virtual list updates; spacing matches
 * listbox-kb.spec.ts.
 */
/* eslint-disable playwright/no-wait-for-timeout */

async function pressArrowDownForVirtualList(page: Page, steps: number): Promise<void> {
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
  }
}

test.describe('Select', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/select', { waitUntil: 'domcontentloaded' });
  });

  test('Basic single: select then clear via nxrSelectClear', async ({ page }) => {
    const section = page
      .locator('section')
      .filter({ has: page.locator('h2:has-text("Basic Single Select")') });
    const trigger = section.locator('button.select-trigger');
    const meta = section.locator('.select-meta');
    const clearBtn = section.locator('.select-clear[aria-label="Clear"]');

    await expect(meta).toContainText('—');
    await expect(clearBtn).toBeHidden();

    await trigger.click();
    const germany = page.getByRole('option', { name: 'Germany' });
    await expect(germany).toBeVisible();
    await germany.click();
    await expect(meta).toContainText('Germany');
    await expect(clearBtn).toBeVisible();

    await clearBtn.click();
    await expect(meta).toContainText('—');
    await expect(clearBtn).toBeHidden();
  });

  test('Multi: select two then clear via nxrSelectClear', async ({ page }) => {
    const section = page
      .locator('section')
      .filter({ has: page.locator('h2:has-text("Multi Select")') });
    const trigger = section.locator('button.select-trigger');
    const meta = section.locator('.select-meta');
    const chips = section.locator('.select-chip');
    const clearBtn = section.locator('.select-clear[aria-label="Clear all"]');

    await expect(meta).toContainText('0 selected');
    await expect(clearBtn).toBeHidden();

    await trigger.click();
    const us = page.getByRole('option', { name: 'United States' });
    const canada = page.getByRole('option', { name: 'Canada' });
    await expect(us).toBeVisible();
    await us.click();
    await expect(canada).toBeVisible();
    await canada.click();

    await expect(chips).toHaveCount(2);
    await expect(meta).toContainText('2 selected');
    await expect(clearBtn).toBeVisible();

    await clearBtn.click();
    await expect(chips).toHaveCount(0);
    await expect(meta).toContainText('0 selected');
    await expect(clearBtn).toBeHidden();
  });

  test('open panel uses shared listbox overlay host class', async ({ page }) => {
    const section = page
      .locator('section')
      .filter({ has: page.locator('h2:has-text("Basic Single Select")') });
    const trigger = section.locator('button.select-trigger');
    const host = page.locator('.nxr-listbox-overlay-panel-host');

    await trigger.click();
    await expect(host.first()).toBeVisible();
  });

  test('disable() closes open panel', async ({ page }) => {
    const section = page
      .locator('section')
      .filter({ has: page.locator('h2:has-text("Basic Single Select")') });
    const trigger = section.locator('button.select-trigger');
    const listbox = page.getByRole('listbox');

    await trigger.click();
    await expect(listbox).toBeVisible();
    await section.getByRole('button', { name: 'Disable API', exact: true }).click();
    await expect(listbox).toBeHidden();

    await section.getByRole('button', { name: 'Enable API', exact: true }).click();
    await trigger.click();
    await expect(listbox).toBeVisible();
  });

  test('Large list (virtual scroll): CDK viewport has height and options render', async ({
    page,
  }) => {
    const section = page.locator('section').filter({
      has: page.getByRole('heading', { level: 2, name: /Large List — Single/ }),
    });
    const trigger = section.locator('button.select-trigger');

    await section.scrollIntoViewIfNeeded();
    await trigger.click();
    const viewport = page.locator('cdk-virtual-scroll-viewport').first();
    await expect(viewport).toBeVisible({ timeout: 10000 });
    const box = await viewport.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThan(48);
    await expect(page.getByRole('option', { name: /Country 1/ }).first()).toBeVisible();
  });

  test('Large list (virtual scroll): ArrowDown scrolls a distant option into view', async ({
    page,
  }) => {
    const section = page.locator('section').filter({
      has: page.getByRole('heading', { level: 2, name: /Large List — Single/ }),
    });
    const trigger = section.locator('button.select-trigger');

    await section.scrollIntoViewIfNeeded();
    await trigger.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible({ timeout: 10000 });
    /* WebKit does not always move focus into the overlay listbox; keys must go to listbox. */
    await listbox.focus();

    await pressArrowDownForVirtualList(page, 25);

    await expect(page.getByRole('option', { name: /Country 26/ }).first()).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('Combobox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/combobox', { waitUntil: 'domcontentloaded' });
  });

  test('Multi: select then clear via nxrComboboxClear', async ({ page }) => {
    const section = page
      .locator('section')
      .filter({ has: page.locator('h2:has-text("Multi Select")') });
    const toggle = section.getByRole('button', { name: 'Open list' });
    const meta = section.locator('.combobox-meta');
    const clearBtn = section.locator('.combobox-clear[aria-label="Clear all"]');

    await expect(meta).toContainText('No selection');
    await expect(clearBtn).toBeHidden();

    await toggle.click();
    const us = page.getByRole('option', { name: 'United States' });
    const canada = page.getByRole('option', { name: 'Canada' });
    await expect(us).toBeVisible();
    await us.click();
    await expect(canada).toBeVisible();
    await canada.click();

    const chipsInControl = section.locator('.combobox-control-multi .combobox-chip');
    await expect(chipsInControl).toHaveCount(2);
    await expect(clearBtn).toBeVisible();

    await clearBtn.click();
    await expect(chipsInControl).toHaveCount(0);
    await expect(meta).toContainText('No selection');
    await expect(clearBtn).toBeHidden();
  });

  test('open panel uses shared listbox overlay host class', async ({ page }) => {
    const section = page
      .locator('section')
      .filter({ has: page.locator('h2:has-text("Multi Select")') });
    const toggle = section.getByRole('button', { name: 'Open list' });
    const host = page.locator('.nxr-listbox-overlay-panel-host');

    await toggle.click();
    await expect(host.first()).toBeVisible();
  });

  test('disable() closes open panel', async ({ page }) => {
    const section = page
      .locator('section')
      .filter({ has: page.locator('h2:has-text("Basic Single")') });
    const toggle = section.getByRole('button', { name: 'Open list' });
    const listbox = page.getByRole('listbox');

    await toggle.click();
    await expect(listbox).toBeVisible();
    await section.getByRole('button', { name: 'Disable API', exact: true }).click();
    await expect(listbox).toBeHidden();

    await section.getByRole('button', { name: 'Enable API', exact: true }).click();
    await toggle.click();
    await expect(listbox).toBeVisible();
  });

  test('Large list (virtual scroll): panel shows options and CDK viewport', async ({ page }) => {
    const section = page.locator('section').filter({
      has: page.getByRole('heading', { level: 2, name: /Large List — Single/ }),
    });
    const toggle = section.getByRole('button', { name: 'Open list' });

    await section.scrollIntoViewIfNeeded();
    await toggle.click();
    /* Overlay content is portaled outside the section — query from the page. */
    const viewport = page.locator('cdk-virtual-scroll-viewport').first();
    await expect(viewport).toBeVisible({ timeout: 10000 });
    const box = await viewport.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThan(48);
    /* Option name includes main + sub lines (country + continent). */
    await expect(page.getByRole('option', { name: /Country 1/ }).first()).toBeVisible();
  });

  test('Large list (virtual scroll): ArrowDown scrolls a distant option into view', async ({
    page,
  }) => {
    const section = page.locator('section').filter({
      has: page.getByRole('heading', { level: 2, name: /Large List — Single/ }),
    });
    const toggle = section.getByRole('button', { name: 'Open list' });

    await section.scrollIntoViewIfNeeded();
    await toggle.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible({ timeout: 10000 });
    await listbox.focus();

    await pressArrowDownForVirtualList(page, 25);

    await expect(page.getByRole('option', { name: /Country 26/ }).first()).toBeVisible({
      timeout: 10000,
    });
  });
});
