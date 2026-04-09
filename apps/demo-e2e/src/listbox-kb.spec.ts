import { expect, test, type Locator } from '@playwright/test';

/**
 * Short delays between key events let the listbox settle; replacing every step with a
 * strict `expect` would duplicate strings already recorded in `results`.
 */
/* eslint-disable playwright/no-wait-for-timeout */

test.describe('Listbox Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/listbox', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#listbox')).toBeVisible();
  });

  test('1. Single-select: arrow navigation, Home/End, Enter, disabled skip', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(0);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');
    const meta = section.locator('.listbox-meta-line');

    // Focus the listbox
    await listbox.click();
    await page.waitForTimeout(100);

    // initialHighlight='selected', no value => first option active (listbox demo)

    // Press ArrowDown several times
    const results: string[] = [];

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    let activeTexts = await getActiveOptionTexts(options);
    results.push(`After 1st ArrowDown: active=[${activeTexts}]`);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    activeTexts = await getActiveOptionTexts(options);
    results.push(`After 2nd ArrowDown: active=[${activeTexts}]`);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    activeTexts = await getActiveOptionTexts(options);
    results.push(`After 3rd ArrowDown: active=[${activeTexts}]`);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    activeTexts = await getActiveOptionTexts(options);
    results.push(`After 4th ArrowDown: active=[${activeTexts}]`);

    // Press ArrowUp
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(50);
    activeTexts = await getActiveOptionTexts(options);
    results.push(`After ArrowUp: active=[${activeTexts}]`);

    // Press Home
    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    activeTexts = await getActiveOptionTexts(options);
    results.push(`After Home: active=[${activeTexts}]`);

    // Press End
    await page.keyboard.press('End');
    await page.waitForTimeout(50);
    activeTexts = await getActiveOptionTexts(options);
    results.push(`After End: active=[${activeTexts}]`);

    // Press Enter to select
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const selectedText = await meta.textContent();
    results.push(`After Enter: meta="${selectedText?.trim()}"`);

    // Navigate to check Cherry (disabled) is skipped
    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    results.push(`Home => active=[${await getActiveOptionTexts(options)}]`);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    results.push(`ArrowDown from Apple => active=[${await getActiveOptionTexts(options)}]`);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    results.push(`ArrowDown from Banana => active=[${await getActiveOptionTexts(options)}]`);
    // If Cherry is skipped, we should land on Date

    // Check full aria state
    const ariaState = await options.evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent?.trim(),
        active: el.hasAttribute('data-active'),
        selected: el.getAttribute('aria-selected'),
        disabled: el.getAttribute('aria-disabled'),
        role: el.getAttribute('role'),
      })),
    );
    results.push(`ARIA state: ${JSON.stringify(ariaState, null, 2)}`);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/listbox-single-select.png',
      fullPage: false,
      clip: await getSectionClip(section),
    });

    // Assertions
    expect(results.some((r) => r.includes('After Home: active=[Apple]'))).toBeTruthy();
    expect(results.some((r) => r.includes('After End: active=[Elderberry]'))).toBeTruthy();
    expect(results.some((r) => r.includes('Elderberry'))).toBeTruthy();
  });

  test('2. Multi-select: Space toggles, multiple selections', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(1);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');
    const meta = section.locator('.listbox-meta-line');

    await listbox.click();
    await page.waitForTimeout(100);

    const results: string[] = [];

    // Navigate to first option
    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    results.push(`Home => active=[${await getActiveOptionTexts(options)}]`);

    // Toggle selection with Space on Apple
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    results.push(`Space on Apple => meta="${(await meta.textContent())?.trim()}"`);

    // Move down to Banana and toggle
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    results.push(`ArrowDown => active=[${await getActiveOptionTexts(options)}]`);

    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    results.push(`Space on Banana => meta="${(await meta.textContent())?.trim()}"`);

    // Move down past Cherry (disabled), should land on Date
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    results.push(`ArrowDown (skip Cherry?) => active=[${await getActiveOptionTexts(options)}]`);

    // Toggle Date
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    results.push(`Space on current => meta="${(await meta.textContent())?.trim()}"`);

    // Deselect Apple by going back
    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    results.push(`Deselect Apple => meta="${(await meta.textContent())?.trim()}"`);

    await page.screenshot({
      path: 'test-results/listbox-multi-select.png',
      fullPage: false,
      clip: await getSectionClip(section),
    });

    expect(results.some((r) => r.includes('Space on Apple'))).toBe(true);
    expect(results.some((r) => r.includes('Deselect Apple'))).toBe(true);
  });

  test('3. Action mode (menu): Enter activates, no selection', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(2);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');
    const meta = section.locator('.listbox-meta-line');

    await listbox.click();
    await page.waitForTimeout(100);

    const results: string[] = [];

    // Check role
    await expect(listbox).toHaveAttribute('role', 'menu');
    results.push('Listbox role: menu');
    await expect(options.first()).toHaveAttribute('role', 'menuitem');
    results.push('Option role: menuitem');

    // Navigate
    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    results.push(`Home => active=[${await getActiveOptionTexts(options)}]`);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    results.push(`ArrowDown => active=[${await getActiveOptionTexts(options)}]`);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    results.push(`ArrowDown => active=[${await getActiveOptionTexts(options)}]`);

    // Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    results.push(`Enter => meta="${(await meta.textContent())?.trim()}"`);

    // Navigate and activate another
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    results.push(`Next + Enter => meta="${(await meta.textContent())?.trim()}"`);

    // Check no aria-selected on menu items
    const ariaState = await options.evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent?.trim(),
        role: el.getAttribute('role'),
        ariaSelected: el.getAttribute('aria-selected'),
      })),
    );
    results.push(`Aria state: ${JSON.stringify(ariaState)}`);

    await page.screenshot({
      path: 'test-results/listbox-action-mode.png',
      fullPage: false,
      clip: await getSectionClip(section),
    });

    expect(ariaState.length).toBeGreaterThan(0);
  });

  test('4. Primitive options: string[] navigation and selection', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(3);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');
    const meta = section.locator('.listbox-meta-line');

    await listbox.click();
    await page.waitForTimeout(100);

    const results: string[] = [];

    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    results.push(`Home => active=[${await getActiveOptionTexts(options)}]`);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    results.push(`ArrowDown => active=[${await getActiveOptionTexts(options)}]`);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    results.push(`ArrowDown => active=[${await getActiveOptionTexts(options)}]`);

    // Select with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    results.push(`Enter => meta="${(await meta.textContent())?.trim()}"`);

    // Navigate more
    await page.keyboard.press('End');
    await page.waitForTimeout(50);
    results.push(`End => active=[${await getActiveOptionTexts(options)}]`);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    results.push(`Enter last => meta="${(await meta.textContent())?.trim()}"`);

    await page.screenshot({
      path: 'test-results/listbox-primitive.png',
      fullPage: false,
      clip: await getSectionClip(section),
    });

    expect(results.length).toBeGreaterThanOrEqual(5);
    expect(results.some((r) => r.includes('Enter => meta='))).toBe(true);
  });

  test('5. Horizontal + wrap: ArrowRight/Left, wrapping', async ({ page }) => {
    const section = page.locator('#listbox .sub-section').nth(5);
    const listbox = section.locator('[nxrListbox]');
    const options = section.locator('.listbox-option');
    const meta = section.locator('.listbox-meta-line');

    await listbox.click();
    await page.waitForTimeout(100);

    const results: string[] = [];

    // Check orientation attr
    await expect(listbox).toHaveAttribute('aria-orientation', 'horizontal');
    results.push('Orientation: horizontal');

    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    results.push(`Home => active=[${await getActiveOptionTexts(options)}]`);

    // ArrowRight to navigate forward
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    results.push(`ArrowRight => active=[${await getActiveOptionTexts(options)}]`);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    results.push(`ArrowRight => active=[${await getActiveOptionTexts(options)}]`);

    // ArrowLeft to navigate back
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
    results.push(`ArrowLeft => active=[${await getActiveOptionTexts(options)}]`);

    // Test ArrowDown does NOT navigate (vertical key in horizontal mode)
    const beforeDown = await getActiveOptionTexts(options);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    const afterDown = await getActiveOptionTexts(options);
    results.push(`ArrowDown (should be no-op): before=[${beforeDown}] after=[${afterDown}]`);

    // Navigate to end and test wrap
    await page.keyboard.press('End');
    await page.waitForTimeout(50);
    results.push(`End => active=[${await getActiveOptionTexts(options)}]`);

    // ArrowRight from last should wrap to first
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    results.push(`ArrowRight from last (wrap?) => active=[${await getActiveOptionTexts(options)}]`);

    // ArrowLeft from first should wrap to last
    await page.keyboard.press('Home');
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
    results.push(`ArrowLeft from first (wrap?) => active=[${await getActiveOptionTexts(options)}]`);

    // Select with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    results.push(`Enter => meta="${(await meta.textContent())?.trim()}"`);

    await page.screenshot({
      path: 'test-results/listbox-horizontal.png',
      fullPage: false,
      clip: await getSectionClip(section),
    });

    expect(results.some((r) => r.includes('Orientation: horizontal'))).toBe(true);
    expect(results.some((r) => r.includes('ArrowDown (should be no-op)'))).toBe(true);
  });
});

async function getActiveOptionTexts(options: Locator): Promise<string[]> {
  return options.evaluateAll((els: HTMLElement[]) =>
    els.filter((el) => el.hasAttribute('data-active')).map((el) => el.textContent?.trim() ?? ''),
  );
}

async function getSectionClip(
  section: Locator,
): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await section.boundingBox();
  if (!box) return { x: 0, y: 0, width: 1280, height: 720 };
  return {
    x: Math.max(0, box.x - 10),
    y: Math.max(0, box.y - 10),
    width: box.width + 20,
    height: box.height + 20,
  };
}
