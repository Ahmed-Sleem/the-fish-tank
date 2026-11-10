import { expect, test } from '@playwright/test';

test('Oimo water, sequential loading letters, flat icon and correct identity', async ({ page }) => {
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
  await expect(page.locator('.loading-drop, .loading-ripple')).toHaveCount(0);
  await expect(page.locator('.loading-water')).toHaveCount(1);
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) await expect(page.locator('.loading-word')).toHaveText('loading');
  else {
    // Observe two cycles; adjacent frames must be prefixes, never whole-word fading.
    const values = await page.evaluate(async () => {
      const seen: string[] = [];
      for (let i = 0; i < 32; i++) {
        seen.push(document.querySelector('.loading-word')?.textContent ?? '');
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      return seen;
    });
    for (const value of values) expect('loading'.startsWith(value) && value.length > 0).toBe(true);
    expect(values).toContain('l');
    expect(values).toContain('lo');
    expect(values).toContain('loa');
    expect(values).toContain('loading');
    await page.mouse.move(200, 200);
    await page.mouse.move(400, 350, { steps: 12 });
  }
  await page.setViewportSize({ width: 420, height: 820 });
  await expect
    .poll(async () =>
      page.locator('.loading-water').evaluate((canvas) => (canvas as HTMLCanvasElement).width),
    )
    .toBe(await page.evaluate(() => Math.floor(420 * Math.min(devicePixelRatio, 1.5))));
  await page.waitForTimeout(1600);
  await expect(splash).toBeVisible();
  release();
  await expect(splash).toHaveCount(0);
  await expect(page.locator('#app')).not.toHaveAttribute('inert');
  await expect(page.locator('.wordmark')).toHaveText('the fish tank');
  await expect(page).toHaveTitle(/^the fish tank —/);
  const icon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(icon).toContain('/the-fish-tank/');
  const response = await page.request.get(icon ?? '');
  expect(response.status()).toBe(200);
  const svg = await response.text();
  expect(svg).toContain('<circle');
  expect(svg).not.toMatch(/gradient|filter|url\(/i);
});

test('loading remains readable when water graphics fail and respects motion changes', async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/bootstrap-.*\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.loading-word')).toHaveText('loading');
  await expect(page.locator('.loading-water')).toHaveCount(0);
  release();
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.locator('#app')).not.toHaveAttribute('inert');
});
