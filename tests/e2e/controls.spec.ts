import { expect, test } from '@playwright/test';
import { strings } from '../../src/config/strings.en';
test('shared controls expose genuine build information and restore keyboard focus', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  const open = page.getByRole('button', { name: strings.buildDetails });
  await open.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: strings.buildDetails });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(strings.capabilities);
  await expect(dialog).toContainText(strings.rendererReady);
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
