import { test, expect } from '@playwright/test';

/**
 * Mention page: directive creates contenteditable inside nxr-mention-editor-host.
 *
 * Trace / debugging: run with `--trace=on` and open the zip with `npx playwright show-trace <path>`.
 */
test.describe('Mention page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mention');
    await expect(page.locator('#mention h1.page-title')).toContainText('Mention');
  });

  test('first basic editor is visible with non-zero box and accepts typing', async ({ page }) => {
    const basicSection = page.locator('section.sub-section').filter({
      has: page.getByRole('heading', { name: 'Basic @ users' }),
    });
    const editor = basicSection.getByRole('textbox', { name: 'Mention users' });
    await expect(editor).toBeVisible();

    const box = await editor.boundingBox();
    expect(box).toBeTruthy();
    expect(Number(box?.height)).toBeGreaterThan(8);
    expect(Number(box?.width)).toBeGreaterThan(50);

    await editor.click();
    await expect(editor).toBeFocused();

    await editor.pressSequentially('hello e2e');
    // Heading "Basic @ users" is a sibling of .mention-demo-wrapper, not inside it — scope by section.
    await expect(basicSection.getByText(/Text:\s*hello e2e/)).toBeVisible({ timeout: 5000 });
  });

  test('directive host establishes non-zero layout box (regression: invisible tap target)', async ({
    page,
  }) => {
    const basicSection = page.locator('section.sub-section').filter({
      has: page.getByRole('heading', { name: 'Basic @ users' }),
    });
    const host = basicSection.locator('.demo-mention-input');
    await expect(host).toBeVisible();
    const box = await host.boundingBox();
    expect(box).toBeTruthy();
    expect(Number(box?.height)).toBeGreaterThan(4);
    expect(Number(box?.width)).toBeGreaterThan(50);
    await expect(basicSection.getByRole('textbox', { name: 'Mention users' })).toBeVisible();
  });

  test('@ opens panel and Enter selects first user', async ({ page }) => {
    const basicSection = page.locator('section.sub-section').filter({
      has: page.getByRole('heading', { name: 'Basic @ users' }),
    });
    const editor = basicSection.getByRole('textbox', { name: 'Mention users' });
    await editor.click();
    await editor.pressSequentially('@');
    const panel = page.locator('.mention-panel').first();
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel.locator('.mention-option').first()).toBeVisible();
    await editor.press('Enter');
    await expect(panel).toBeHidden({ timeout: 5000 });
    await expect(basicSection.getByText(/^Text:/)).toContainText('@');
  });

  test('chip hover popover switches between mentions without leaving editor', async ({ page }) => {
    const section = page.locator('section.sub-section').filter({
      has: page.getByRole('heading', { name: 'Chip hover (Slack-like)' }),
    });
    const editor = section.getByRole('textbox', { name: 'Chip hover mention' });

    await editor.click();
    await editor.pressSequentially('@a');
    await expect(page.locator('.mention-panel').first()).toBeVisible({ timeout: 5000 });
    await editor.press('Enter');

    await editor.pressSequentially(' @b');
    await expect(page.locator('.mention-panel').first()).toBeVisible({ timeout: 5000 });
    await editor.press('Enter');

    const chips = section.locator('.demo-chip');
    await expect(chips).toHaveCount(2);

    const hoverCard = page.locator('.chip-hover-card');
    await chips.nth(0).hover();
    await expect(hoverCard).toBeVisible({ timeout: 5000 });
    const firstCardText = await hoverCard.innerText();

    // Move directly to the second chip (no leave/re-enter of contenteditable container).
    await chips.nth(1).hover();
    await expect(hoverCard).toBeVisible({ timeout: 5000 });
    await expect(hoverCard).not.toHaveText(firstCardText);
  });
});
