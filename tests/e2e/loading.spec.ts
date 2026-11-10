import { expect, test } from '@playwright/test';

test('splash reacts to pointer, respects motion and releases the page', async ({ page }) => {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/bootstrap-.*\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const splash = page.locator('.loading-screen');
  await expect(splash).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('inert', '');
  await page.mouse.move(200, 200);
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) await expect(page.locator('.loading-ripple')).toHaveCount(0);
  else await expect(page.locator('.loading-ripple').first()).toBeVisible();
  await page.waitForTimeout(1600);
  await expect(splash).toBeVisible();
  release();
  await expect(splash).toHaveCount(0);
  await expect(page.locator('#app')).not.toHaveAttribute('inert');
  const icon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(icon).toContain('/the-fish-tank/');
  expect((await page.request.get(icon ?? '')).status()).toBe(200);
});
