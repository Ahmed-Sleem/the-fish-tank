import { expect, test } from '@playwright/test';
test('PROBE channel: does an e2e failure reach the annotations', async ({ page }) => {
  await page.goto('./');
  expect('CHANNEL-OK').toBe('CHANNEL-FAILED');
});
