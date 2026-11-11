import { expect, test } from '@playwright/test';
import { strings } from '../../src/config/strings.en';
test('scene quality, motion, resize and context-loss lifecycle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  const host = page.locator('.canvas-host');
  await expect(host).toHaveAttribute('data-quality', 'medium');
  await page.getByRole('button', { name: strings.openSettings }).click();
  await page.getByLabel(strings.quality, { exact: true }).selectOption('low');
  await expect(host).toHaveAttribute('data-particles', '16');
  await expect(host).toHaveAttribute('data-resolution', '1');
  await page.getByLabel(strings.quality, { exact: true }).selectOption('high');
  await expect(host).toHaveAttribute('data-particles', '96');
  await expect(host).toHaveAttribute(
    'data-resolution',
    String(await page.evaluate(() => Math.min(devicePixelRatio, 2))),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByLabel(strings.reducedMotion, { exact: true })).toBeChecked();
  await expect(page.getByLabel(strings.reducedMotion, { exact: true })).toBeDisabled();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.getByLabel(strings.reducedMotion, { exact: true })).toBeEnabled();
  await expect(page.getByLabel(strings.reducedMotion, { exact: true })).not.toBeChecked();
  await page.getByLabel(strings.reducedMotion, { exact: true }).check();
  await expect(host).toHaveAttribute('data-running', 'false');
  await page.getByLabel(strings.reducedMotion, { exact: true }).uncheck();
  await expect(host).toHaveAttribute('data-running', 'true');
  await page
    .getByRole('dialog', { name: strings.settings })
    .getByRole('button', { name: strings.close, exact: true })
    .click();
  await page.setViewportSize({ width: 600, height: 400 });
  await expect
    .poll(async () => page.locator('canvas').evaluate((node) => (node as HTMLCanvasElement).width))
    .toBe(await page.evaluate(() => Math.floor(600 * Math.min(devicePixelRatio, 2))));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(host).toHaveAttribute('data-running', 'false');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(host).toHaveAttribute('data-running', 'true');
  await page.evaluate(() => {
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 });
    window.dispatchEvent(new Event('resize'));
  });
  await expect(host).toHaveAttribute('data-resolution', '2');
  await page.locator('canvas').dispatchEvent('webglcontextlost');
  await expect(host).toHaveAttribute('data-running', 'false');
  // The loss is surfaced inside the one dialog, never as a HUD readout over the tank.
  await page.getByRole('button', { name: strings.openSettings }).click();
  await expect(page.getByRole('dialog', { name: strings.settings })).toContainText(
    strings.rendererLost,
  );
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
});
