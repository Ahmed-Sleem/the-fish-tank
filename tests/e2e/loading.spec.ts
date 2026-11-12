import { expect, test } from '@playwright/test';
import { hasWebgl2 } from './support/capabilities';

test('Oimo water, sequential loading letters, flat icon and correct identity', async ({
  page,
  browser,
}) => {
  const water = await hasWebgl2(browser);
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/bootstrap-.*\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const splash = page.locator('.loading-screen');
  await expect(splash).toBeVisible();
  // The product title lives on the splash and nowhere else.
  await expect(splash.locator('.loading-title')).toHaveText('the fish tank');
  await expect(splash.locator('.loading-title')).toHaveCSS('text-transform', 'uppercase');
  await expect(page.locator('#app')).toHaveAttribute('inert', '');
  await expect(page.locator('.loading-drop, .loading-ripple')).toHaveCount(0);
  // The fluid canvas only exists where the browser can render it; without WebGL2 the splash
  // must still carry its title and the word, which every other assertion here keeps proving.
  await expect(page.locator('.loading-water')).toHaveCount(water ? 1 : 0);
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) await expect(page.locator('.loading-word')).toHaveText('loading');
  else {
    // Observe two cycles; adjacent frames must be prefixes, never whole-word fading.
    const values = await page.evaluate(async () => {
      const seen: string[] = [];
      for (let i = 0; i < 32; i++) {
        seen.push(document.querySelector('.loading-word')?.textContent ?? '');
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      return seen;
    });
    for (const value of values) expect('loading'.startsWith(value) && value.length > 0).toBe(true);
    expect(values).toContain('l');
    expect(values).toContain('lo');
    expect(values).toContain('loa');
    expect(values).toContain('loading');
    await page.mouse.move(200, 200);
    await page.mouse.move(400, 350, { steps: 12 });
  }
  await page.setViewportSize({ width: 420, height: 820 });
  if (water) {
    // The fluid canvas must follow the viewport at the loader's capped device-pixel ratio.
    await expect
      .poll(async () =>
        page.locator('.loading-water').evaluate((canvas) => (canvas as HTMLCanvasElement).width),
      )
      .toBe(await page.evaluate(() => Math.floor(420 * Math.min(devicePixelRatio, 1))));
  } else {
    await expect(splash.locator('.loading-title')).toBeVisible();
  }
  await page.waitForTimeout(1600);
  await expect(splash).toBeVisible();
  release();
  await expect(splash).toHaveCount(0);
  await expect(page.locator('#app')).not.toHaveAttribute('inert');
  await expect(page.locator('.wordmark')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('the fish tank');
  const titleBox = await page.getByRole('heading', { level: 1 }).boundingBox();
  expect(titleBox?.width ?? 0).toBeLessThanOrEqual(1);
  expect(titleBox?.height ?? 0).toBeLessThanOrEqual(1);
  await expect(page).toHaveTitle(/^the fish tank —/);
  const icon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(icon).toContain('/the-fish-tank/');
  const response = await page.request.get(icon ?? '');
  expect(response.status()).toBe(200);
  const svg = await response.text();
  expect(svg).toContain('<circle');
  expect(svg).not.toMatch(/gradient|filter|url\(/i);
});

test('loading remains readable when water graphics fail and respects motion changes', async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/bootstrap-.*\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.loading-word')).toHaveText('loading');
  await expect(page.locator('.loading-water')).toHaveCount(0);
  release();
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  await expect(page.locator('#app')).not.toHaveAttribute('inert');
});

test('a driver that never finishes initializing still lets the player into the tank', async ({
  page,
}) => {
  // The failure this guards against is not hypothetical: a GPU driver can leave renderer creation
  // pending forever, and the loader used to await it with no ceiling, so the splash stayed up with
  // no way out. The tank without water is a far better outcome than a screen that never leaves.
  test.setTimeout(120000);
  await page.addInitScript(() => {
    // Copied out of the descriptor: the method must be called with a canvas as `this`.
    const getContext = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'getContext')
      ?.value as (this: HTMLCanvasElement, type: string, ...rest: unknown[]) => unknown;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      const context = getContext.call(this, type, ...rest) as WebGL2RenderingContext | null;
      if (context && type === 'webgl2') {
        // A call that never returns, exactly as a wedged driver behaves.
        Object.defineProperty(context, 'createProgram', {
          value: () => new Promise(() => undefined),
        });
      }
      return context;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('./');
  // The ceiling is 15s; allow generous slack for a slow runner plus the 5s minimum.
  await expect(page.locator('.loading-screen')).toHaveCount(0, { timeout: 60000 });
  await expect(page.locator('#app')).not.toHaveAttribute('inert');
  // It must be honest about what happened, not claim the graphics are ready.
  await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
});
