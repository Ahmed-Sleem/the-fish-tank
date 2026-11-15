import { expect, test } from '@playwright/test';
import { waitForTank } from './support/ready';
import { strings } from '../../src/config/strings.en';
test('scene quality, motion, resize and context-loss lifecycle', async ({ page }) => {
  // A long chain of settings changes, each reconfiguring a real WebGL context. Every step waits on
  // the tank, so the work is bounded; 30s is simply the wrong ceiling for a software renderer.
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto('./');
  await waitForTank(page);
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
  /*
   * `emulateMedia` fires its `change` event asynchronously, so for a moment after this call the
   * control is legitimately still disabled and still checked. Poll until the page has actually
   * caught up before asserting, rather than racing a single sample against an event.
   */
  await expect
    .poll(async () => page.getByLabel(strings.reducedMotion, { exact: true }).isEnabled(), {
      timeout: 15000,
    })
    .toBe(true);
  await expect
    .poll(async () => page.getByLabel(strings.reducedMotion, { exact: true }).isChecked(), {
      timeout: 15000,
    })
    .toBe(false);
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

test.describe('the day/night cycle', () => {
  // Serial, because this test watches real time for over a minute. Run beside the pixel and
  // pointer specs it competes for CPU, and a starved page misses its first paint — which then
  // looks like an unrelated spec's failure. The tank's own specs must not be slowed down to
  // prove the clock works.
  test.describe.configure({ mode: 'serial' });

  test('reaches night on its own, without interaction', async ({ page }) => {
    // The owner's report: leave the tab open and night never comes. The cycle used to advance on
    // *simulated* seconds, which stop while the tab is hidden, while the tank pauses behind a
    // dialog, and whenever frames are dropped. It now follows real time.
    //
    // This asserts the transition rather than a starting phase: a slow runner can free the loader
    // well into the first fade, so demanding "day" first would fail for the machine, not the code.
    test.setTimeout(240000);
    await page.goto('./');
    await waitForTank(page);
    // Reduced motion deliberately freezes the tank at night with no cycle at all, so the
    // transition is only meaningful where motion is allowed.
    test.skip(
      await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
      'reduced motion holds the tank at night instead of cycling',
    );
    const root = page.locator('html');
    await expect(root).toHaveAttribute('data-mood', /day|dusk|night|dawn/);
    // Within one full cycle plus a fade the mood must become night, whatever it started as.
    await expect(root).toHaveAttribute('data-mood', 'night', { timeout: 180000 });
  });
});

test('the scenery is planted one root at a time, not one sliding picture', async ({ page }) => {
  /*
   * The owner's report was that the plants "move badly". The cause was structural: all the plants
   * were one sprite, rotated about a shared pivot, which slid every plant that was not standing on
   * that pivot and resampled its pixels. This asserts the structure that replaced it, because that
   * structure is what the motion depends on and it is invisible in a screenshot of a blank tank.
   */
  test.setTimeout(60000);
  await page.goto('./');
  await waitForTank(page);
  const host = page.locator('.canvas-host');
  await expect(host).toHaveAttribute('data-sway', 'on');

  const plants = await page.evaluate(() =>
    Number(document.querySelector<HTMLElement>('.canvas-host')?.dataset.plants ?? 0),
  );
  // One sprite per plant, not one for the bed.
  expect(plants).toBeGreaterThan(8);

  /*
   * Motion is the opposite way round on the two projects — the mobile profile asks for reduced
   * motion, so its tank is still from the first frame — so the test asserts the *contract* in
   * whichever direction applies rather than assuming a starting state.
   */
  const stillness = await page.evaluate(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  await page.emulateMedia({ reducedMotion: stillness ? 'no-preference' : 'reduce' });
  // Moving, or stopped dead: a frozen tank is the accessibility promise, and a moving one is the
  // feature. Either way the attribute must follow the preference.
  await expect(host).toHaveAttribute('data-running', stillness ? 'true' : 'false');
});
