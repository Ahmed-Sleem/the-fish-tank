/** No mocked service can turn this shell into a claim of playable gameplay. */
import { expect, test } from '@playwright/test';
import { strings } from '../../src/config/strings.en';

test('the project subpath renders, reloads and never calls external services', async ({ page }) => {
  const failures: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (error) => {
    failures.push(error.message);
  });
  page.on('request', (request) => {
    if (!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
      external.push(request.url());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${String(response.status())} ${response.url()}`);
  });
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(strings.brand);
  await expect(page.getByRole('status')).toHaveText(strings.rendererReady);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByRole('main', { name: strings.aquarium })).toBeVisible();
  await expect(page.locator('.intro, .hero-title, .chapter, .footer')).toHaveCount(0);
  await expect(page.getByRole('button', { name: strings.buildDetails })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.reload();
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText(strings.rendererReady);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: strings.skip })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#aquarium')).toBeFocused();
  expect(external).toEqual([]);
  expect(failures).toEqual([]);
});

test('graphics failure leaves accessible status and working navigation', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => {
    failures.push(error.message);
  });
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText(strings.rendererFailed);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: strings.buildDetails }).click();
  await expect(page.getByRole('link', { name: strings.plan })).toHaveAttribute(
    'href',
    /IMPLEMENTATION_PLAN\.md$/,
  );
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  expect(failures).toEqual([]);
});

test('lost graphics context is not falsely reported as ready', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText(strings.rendererReady);
  await page.locator('canvas').dispatchEvent('webglcontextlost');
  await expect(page.getByRole('status')).toHaveText(strings.rendererLost);
});
