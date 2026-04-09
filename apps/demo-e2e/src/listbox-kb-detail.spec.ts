import { expect, test, type Locator } from '@playwright/test';

/**
 * Same timing rationale as listbox-kb.spec: keyboard steps need short settles between events.
 */
/* eslint-disable playwright/no-wait-for-timeout */

test.describe('Listbox Keyboard – Detailed Bug Investigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/listbox', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#listbox')).toBeVisible();
  });

  test('Single-select: ArrowDown at last option should NOT wrap when wrap=false', async ({
    page,
  }) => {
    const section = page.locator('#listbox .sub-section').nth(0);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');

    await listbox.click();
    await page.waitForTimeout(100);

    // Go to end
    await page.keyboard.press('End');
    await page.waitForTimeout(50);
    const atEnd = await getActive(options);

    // Press ArrowDown at last — should stay on Elderberry (no wrap)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    const afterDown = await getActive(options);

    // Press ArrowUp at first — should stay on first (no wrap)
    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    const afterUp = await getActive(options);

    expect(atEnd).toEqual(['Elderberry']);
    expect(afterDown).toEqual(['Elderberry']);
    expect(afterUp).toEqual(['Apple']);
  });

  test('Single-select: aria-selected should only be true for the selected item', async ({
    page,
  }) => {
    const section = page.locator('#listbox .sub-section').nth(0);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');

    await listbox.click();
    await page.waitForTimeout(100);

    const initialState = await getAriaSelected(options);
    expect(initialState.filter((s) => s.selected === 'true')).toHaveLength(0);

    // Select Banana via keyboard
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    const afterSelect = await getAriaSelected(options);
    const selected = afterSelect.filter((s) => s.selected === 'true');
    expect(selected).toHaveLength(1);
    expect(selected[0]?.text).toBe('Banana');
  });

  test('Multi-select: cumulative selection with Space', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(1);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');
    const meta = section.locator('.listbox-meta-line');

    await listbox.click();
    await page.waitForTimeout(100);

    // Select Apple
    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);
    const afterApple = (await meta.textContent())?.trim();
    expect(afterApple).toContain('Apple');

    // Select Banana (should add, not replace)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);
    const afterBanana = (await meta.textContent())?.trim();
    expect(afterBanana).toContain('Apple');
    expect(afterBanana).toContain('Banana');

    const ariaState = await getAriaSelected(options);
    const selectedTexts = ariaState.filter((s) => s.selected === 'true').map((s) => s.text);
    expect(selectedTexts).toContain('Apple');
    expect(selectedTexts).toContain('Banana');
  });

  test('Multi-select: Enter vs Space behavior', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(1);
    const listbox = section.locator('[nxrListbox]');
    const meta = section.locator('.listbox-meta-line');

    await listbox.click();
    await page.waitForTimeout(100);

    await page.keyboard.press('Home');
    await page.waitForTimeout(50);

    // Enter on Apple
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    const afterEnter = (await meta.textContent())?.trim();
    expect(afterEnter).toContain('Apple');

    // ArrowDown + Space on Banana
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);
    const afterSpace = (await meta.textContent())?.trim();
    expect(afterSpace).toContain('Apple');
    expect(afterSpace).toContain('Banana');
  });

  test('Typeahead: type a letter to jump', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(0);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');

    await listbox.click();
    await page.waitForTimeout(100);

    // Type 'e' to jump to Elderberry
    await page.keyboard.press('e');
    await page.waitForTimeout(100);
    const afterE = await getActive(options);

    // Type 'b' to jump to Banana
    await page.waitForTimeout(600); // Wait for typeahead reset
    await page.keyboard.press('b');
    await page.waitForTimeout(100);
    const afterB = await getActive(options);

    // Type 'd' to jump to Date
    await page.waitForTimeout(600);
    await page.keyboard.press('d');
    await page.waitForTimeout(100);
    const afterD = await getActive(options);
    expect(afterE.join('')).toContain('Elderberry');
    expect(afterB.join('')).toContain('Banana');
    expect(afterD.join('')).toContain('Date');
  });

  test('Click on option to select and activate', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(0);
    const options = section.locator('.listbox-option');
    const meta = section.locator('.listbox-meta-line');

    // Click Banana
    await options.nth(1).click();
    await page.waitForTimeout(100);
    const afterClick = (await meta.textContent())?.trim();
    expect(afterClick).toContain('Banana');

    const activeAfterClick = await getActive(options);
    expect(activeAfterClick).toContain('Banana');

    // Click disabled Cherry — should NOT select
    await options.nth(2).click();
    await page.waitForTimeout(100);
    const afterCherry = (await meta.textContent())?.trim();
    expect(afterCherry).toContain('Banana');
  });

  test('Grouped listbox: navigation across groups', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(4);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');
    const meta = section.locator('.listbox-meta-line');

    await listbox.click();
    await page.waitForTimeout(100);

    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    expect(await getActive(options)).toContain('Apple');

    // Navigate through all options across groups
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }

    // Select current
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await expect(meta).not.toContainText('—');
  });
});

async function getActive(options: Locator): Promise<string[]> {
  return options.evaluateAll((els: HTMLElement[]) =>
    els.filter((el) => el.hasAttribute('data-active')).map((el) => el.textContent?.trim() ?? ''),
  );
}

async function getAriaSelected(
  options: Locator,
): Promise<{ text: string; selected: string | null }[]> {
  return options.evaluateAll((els: HTMLElement[]) =>
    els.map((el) => ({
      text: el.textContent?.trim() ?? '',
      selected: el.getAttribute('aria-selected'),
    })),
  );
}
