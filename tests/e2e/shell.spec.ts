/** No mocked service can turn this shell into a claim of playable gameplay. */
import { expect, test } from '@playwright/test';
import { waitForTank } from './support/ready';
import { strings } from '../../src/config/strings.en';

test('the project subpath renders, reloads and never calls external services', async ({ page }) => {
  // This spec loads and then reloads the full WebGL page, so it does twice the work of its
  // neighbours. The default 30s ceiling is not enough for that on a shared runner, and the
  // failure it produces (ERR_ABORTED mid-reload) reads like a broken page rather than a slow one.
  test.setTimeout(120000);
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
  await waitForTank(page);
  // The title belongs to the splash, not the tank: the page keeps only an accessible heading.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(strings.brand);
  // The title is announced, not drawn: it must not occupy visible area in the tank.
  const titleBox = await page.getByRole('heading', { level: 1 }).boundingBox();
  expect(titleBox?.width ?? 0).toBeLessThanOrEqual(1);
  expect(titleBox?.height ?? 0).toBeLessThanOrEqual(1);
  // No status readout, no empty-tank note and no frames in the tank itself.
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByRole('main', { name: strings.aquarium })).toBeVisible();
  await expect(page.locator('.intro, .hero-title, .chapter, .footer')).toHaveCount(0);
  // Two controls, one destination each: draw a fish, and settings. The owner's "one settings
  // icon" ruling is about settings not being scattered, so this asserts that no third control
  // has appeared and that each icon opens exactly one dialog.
  await expect(page.locator('.hud button')).toHaveCount(2);
  await expect(page.getByRole('button', { name: strings.openSettings })).toBeVisible();
  await expect(page.getByRole('button', { name: strings.drawOpen })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.reload();
  await waitForTank(page);
  await expect(page.locator('canvas')).toHaveCount(1);
  await waitForTank(page);
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
  await waitForTank(page);
  await page.getByRole('button', { name: strings.openSettings }).click();
  const dialog = page.getByRole('dialog', { name: strings.settings });
  await expect(dialog).toContainText(strings.rendererFailed);
  await expect(dialog.getByRole('link', { name: strings.plan })).toHaveAttribute(
    'href',
    /IMPLEMENTATION_PLAN\.md$/,
  );
  await waitForTank(page);
  expect(failures).toEqual([]);
});

test('lost graphics context is reported in the settings dialog, not as a silent tank', async ({
  page,
}) => {
  await page.goto('./');
  await waitForTank(page);
  await page.locator('canvas').dispatchEvent('webglcontextlost');
  await page.getByRole('button', { name: strings.openSettings }).click();
  await expect(page.getByRole('dialog', { name: strings.settings })).toContainText(
    strings.rendererLost,
  );
});

test('the tank is borderless: no frames, rules or chrome, only water and two icons', async ({
  page,
}) => {
  await page.goto('./');
  await waitForTank(page);
  const offenders = await page.evaluate(() => {
    const bad: string[] = [];
    for (const node of document.querySelectorAll<HTMLElement>('#app *')) {
      if (node.closest('dialog')) continue;
      if (node.classList.contains('sr-only')) continue;
      const style = getComputedStyle(node);
      // A visible border, outline or a 1-2px solid strip is a frame.
      for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
        const width = Number.parseFloat(style[`border${side}Width`]);
        if (width > 0 && style[`border${side}Style`] !== 'none') {
          bad.push(`${node.className || node.tagName}:border-${side.toLowerCase()}`);
        }
      }
    }
    return bad;
  });
  expect(offenders).toEqual([]);
  // Nothing is pinned to the edges: no HUD bar, no gravel band, no glass rim.
  await expect(page.locator('.hud-bar, .status-bar, .glass, .rim, .frame')).toHaveCount(0);
  await expect(page.locator('.water-surface')).toHaveCount(1);
  await expect(page.locator('.water-vignette')).toHaveCount(1);
});
