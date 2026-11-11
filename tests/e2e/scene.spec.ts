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

test('the cycle reaches night on its own, without interaction', async ({ page }) => {
  // The owner's report: leave the tab open and night never comes. The cycle used to advance on
  // *simulated* seconds, which stop while the tab is hidden, while the tank pauses behind a
  // dialog, and whenever frames are dropped. It now follows real time.
  //
  // This asserts the transition rather than a starting phase: a slow runner can free the loader
  // well into the first fade, so demanding "day" first would fail for the machine, not the code.
  test.setTimeout(150000);
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0, { timeout: 30000 });
  // Reduced motion deliberately freezes the tank at night with no cycle at all, so the transition
  // is only meaningful where motion is allowed. Asserting it here would test the wrong contract.
  test.skip(
    await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    'reduced motion holds the tank at night instead of cycling',
  );
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-mood', /day|dusk|night|dawn/);
  const first = await root.getAttribute('data-mood');
  // Within one full cycle plus a fade the mood must become night, whatever it started as.
  await expect(root).toHaveAttribute('data-mood', 'night', { timeout: 100000 });
  expect(first).not.toBeNull();
});
