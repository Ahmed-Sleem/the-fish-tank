import { expect, type Page } from '@playwright/test';

/**
 * Wait for the splash to clear.
 *
 * The timeout is generous on purpose. The loader guarantees a five-second minimum, and on a
 * shared CI runner the first paint of a WebGL page can take several more seconds while a sibling
 * spec is using the other core. A ten-second ceiling turned that honest slowness into a wall of
 * failures that looked like the product was broken. Waiting longer costs nothing when the page is
 * healthy and only delays a genuine failure.
 */
export async function waitForTank(page: Page): Promise<void> {
  await expect(page.locator('.loading-screen')).toHaveCount(0, { timeout: 45000 });
}
