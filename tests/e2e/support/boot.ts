/**
 * Skips the part of the splash nobody is testing.
 *
 * Every spec here boots the tank, and the splash is held for five seconds by a `setTimeout` that
 * exists so the loading animation is not a flash. That guarantee is worth testing — `loading.spec`
 * does test it — but paying it in twenty-three specs costs about four minutes of pure waiting per
 * run, which is most of the CI job's headroom.
 *
 * So: install a fake clock *before* navigation, then fast-forward past the minimum. The tank still
 * has to genuinely finish starting (renderer ready, first paint), which is why this is a clock
 * skip and not a stub — if startup broke, `waitForTank` would still fail.
 */
import type { Page } from '@playwright/test';
import { appConfig } from '../../../src/config/app.config';

/**
 * Boot the tank with the splash minimum already elapsed.
 *
 * Call instead of `page.goto('./')`. `url` is whatever the spec would have passed to `goto`.
 */
export async function gotoFreshTank(page: Page, url = './'): Promise<void> {
  // Installing a clock on an already-loaded page is too late: the app's timers are real by then.
  await page.clock.install();
  await page.goto(url);
  /*
   * Only just past the minimum: the budget is "a splash, not a flash", so the skip lands one
   * second beyond it rather than jumping hours and hiding startup work that depends on a timer.
   */
  await page.clock.fastForward(appConfig.loading.minimumMs + 1000);
}
