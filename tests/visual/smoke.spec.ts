import { test, expect } from '@playwright/test';

test('homepage renders and screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
  await page.screenshot({ path: `test-results/home-${test.info().project.name}.png`, fullPage: true });
});
