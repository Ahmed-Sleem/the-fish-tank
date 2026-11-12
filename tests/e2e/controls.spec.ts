import { expect, test } from '@playwright/test';
import { waitForTank } from './support/ready';
import { strings } from '../../src/config/strings.en';
test('the single settings icon opens one dialog that holds every control and restores focus', async ({
  page,
}) => {
  await page.goto('./');
  await waitForTank(page);
  // The dialog is the only place settings live; while it is shut its controls are hidden.
  await expect(page.getByLabel(strings.quality, { exact: true })).not.toBeVisible();
  const open = page.getByRole('button', { name: strings.openSettings });
  await open.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: strings.settings });
  await expect(dialog).toBeVisible();
  // The graphics line must tell the truth about whichever path the browser is on: a full water
  // scene reports Ready, a browser without float render targets reports the real degradation.
  const degraded = await page
    .locator('.canvas-host')
    .getAttribute('data-effects')
    .then((value) => value === 'unavailable');
  await expect(dialog).toContainText(degraded ? strings.rendererDegraded : strings.rendererReady);
  await expect(dialog.getByLabel(strings.quality, { exact: true })).toBeVisible();
  await expect(dialog.getByLabel(strings.reducedMotion, { exact: true })).toBeVisible();
  // Honest about what is not available, but no developer dashboard copy or build hash.
  await expect(dialog).toContainText(strings.capabilities);
  await expect(dialog).not.toContainText('BUILD');
  await expect(dialog).not.toContainText('Foundation preview');
  const close = dialog.getByRole('button', { name: strings.close, exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  // Native dialogs may let Tab visit browser chrome, but never background controls.
  await expect(open).not.toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(open).toBeFocused();
  await open.click();
  await close.click();
  await expect(open).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('fullscreen control works or stays hidden when browser API is unavailable', async ({
  page,
}) => {
  await page.goto('./');
  await waitForTank(page);
  const enabled = await page.evaluate(() => document.fullscreenEnabled);
  await page.getByRole('button', { name: strings.openSettings }).click();
  const dialog = page.getByRole('dialog', { name: strings.settings });
  const control = dialog.getByRole('button', { name: strings.fullscreen, exact: true });
  if (!enabled) {
    await expect(control).toHaveCount(0);
    return;
  }
  await control.click();
  const exit = dialog.getByRole('button', { name: strings.exitFullscreen, exact: true });
  await expect(exit).toBeVisible();
  await exit.click();
  await expect(control).toBeVisible();
});
