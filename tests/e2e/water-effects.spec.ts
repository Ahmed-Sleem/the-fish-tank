import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { hasWebgl2 } from './support/capabilities';

// Freeze RAF, not application timeouts: compare equal simulation time with/without input.
async function controlled(page: Page) {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const queue = new Map<number, FrameRequestCallback>();
    let id = 0,
      now = 100;
    window.requestAnimationFrame = (callback) => {
      queue.set(++id, callback);
      return id;
    };
    window.cancelAnimationFrame = (key) => {
      queue.delete(key);
    };
    Object.assign(window, {
      advanceTankFrame: () => {
        now += 1000 / 30;
        const callbacks = [...queue.values()];
        queue.clear();
        callbacks.forEach((callback) => {
          callback(now);
        });
      },
    });
  });
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
}
async function sample(page: Page, input: boolean, type = 'pointerdown', frames = 4) {
  return page.evaluate(
    ({ input, type, frames }) => {
      const tick = () => {
        (window as unknown as { advanceTankFrame: () => void }).advanceTankFrame();
      };
      tick();
      const main = document.querySelector('main');
      const bounds = main?.getBoundingClientRect();
      if (!bounds) throw new Error('Missing tank');
      if (input)
        main?.dispatchEvent(
          new PointerEvent(type === 'cancel' ? 'pointerdown' : type, {
            clientX: bounds.width / 2,
            clientY: bounds.height / 2,
            pointerType: 'touch',
            bubbles: true,
          }),
        );
      if (type === 'cancel')
        main?.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
      for (let i = 0; i < frames; i++) tick();
      const canvas = document.querySelector('.canvas-host canvas') as HTMLCanvasElement;
      const copy = document.createElement('canvas');
      copy.width = 240;
      copy.height = 160;
      const ctx = copy.getContext('2d');
      if (!ctx) throw new Error('No capture');
      ctx.drawImage(canvas, 0, 0, 240, 160);
      return Array.from(ctx.getImageData(60, 40, 120, 80).data);
    },
    { input, type, frames },
  );
}
test('equal-time rendered water changes locally for scripted touch and hover impulses', async ({
  page,
  context,
  browser,
}) => {
  test.setTimeout(120000);
  // This compares actual rendered pixels from the water filters, so it can only be true where
  // the browser can create float render targets. Without a GPU the app degrades by design and
  // the honest fallback is covered by the shell and degraded-status specs instead.
  test.skip(!(await hasWebgl2(browser)), 'browser has no WebGL2 float targets');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await controlled(page);
  const baseline = await sample(page, false);
  const other = await context.newPage();
  other.on('pageerror', (e) => errors.push(e.message));
  await controlled(other);
  const pressed = await sample(other, true);
  const changed = pressed.filter((v, i) => Math.abs(v - (baseline[i] ?? 0)) > 2).length;
  expect(changed).toBeGreaterThan(40);
  expect(changed).toBeLessThan(baseline.length / 2);
  await expect(other.locator('.canvas-host')).toHaveAttribute('data-impulses', '1');
  const hover = await context.newPage();
  hover.on('pageerror', (e) => errors.push(e.message));
  await controlled(hover);
  const moved = await sample(hover, true, 'pointermove');
  expect(moved.some((v, i) => Math.abs(v - (baseline[i] ?? 0)) > 2)).toBe(true);
  await hover.reload();
  await expect(hover.locator('.loading-screen')).toHaveCount(0);
  expect(await sample(hover, true, 'cancel')).toEqual(baseline);
  await other.evaluate(() => {
    const main = document.querySelector('main');
    for (let i = 0; i < 180; i++) {
      main?.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: 400, clientY: 300, bubbles: true }),
      );
      (window as unknown as { advanceTankFrame: () => void }).advanceTankFrame();
    }
  });
  const stressed = await sample(other, false);
  const colors = stressed.filter((_, i) => i % 4 !== 3);
  const mean = colors.reduce((a, b) => a + b, 0) / colors.length;
  // Not black, and not blown out to white: the palette is bright but still a tank.
  expect(mean).toBeGreaterThan(5);
  expect(mean).toBeLessThan(175);
  expect(errors).toEqual([]);
  await other.close();
  await hover.close();
});
test('post-loader pointer controls respect dialogs, motion, cancellation and quality', async ({
  page,
  browser,
}) => {
  test.skip(!(await hasWebgl2(browser)), 'browser has no WebGL2 float targets');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  const host = page.locator('.canvas-host');
  await page.mouse.move(150, 220);
  await page.mouse.down();
  await page.mouse.move(260, 320, { steps: 5 });
  await page.mouse.up();
  await expect.poll(() => host.getAttribute('data-impulses')).not.toBeNull();
  await page.getByRole('button', { name: 'Open settings', exact: true }).click();
  const count = await host.getAttribute('data-impulses');
  await page.getByLabel('Visual quality', { exact: true }).selectOption('low');
  await expect(host).toHaveAttribute('data-ripple-grid', '48');
  await page.getByLabel('Visual quality', { exact: true }).selectOption('high');
  await expect(host).toHaveAttribute('data-ripple-grid', '128');
  await page.mouse.move(100, 260);
  await page.waitForTimeout(100);
  expect(await host.getAttribute('data-impulses')).toBe(count);
  await page.getByLabel('Reduce motion', { exact: true }).check();
  await page
    .getByRole('dialog', { name: 'Settings', exact: true })
    .getByRole('button', { name: 'Close', exact: true })
    .click();
  await page.mouse.move(200, 350);
  await page.mouse.click(200, 350);
  await page.waitForTimeout(150);
  expect(await host.getAttribute('data-impulses')).toBe(count);
  await expect(host).toHaveAttribute('data-running', 'false');
  await page.locator('main').dispatchEvent('pointercancel');
});

test('unsupported float targets leave truthful graphics status and usable controls', async ({
  page,
}) => {
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- prototype interception calls original with the live GL receiver
    const original = WebGL2RenderingContext.prototype.getExtension;
    Object.defineProperty(WebGL2RenderingContext.prototype, 'getExtension', {
      value: function (this: WebGL2RenderingContext, name: string): unknown {
        return name === 'EXT_color_buffer_float' ? null : Reflect.apply(original, this, [name]);
      },
    });
  });
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0);
  // Water effects fail, the pixel tank still renders: a readable scene, never a blank window.
  await expect(page.locator('.canvas-host')).toHaveAttribute('data-effects', 'unavailable');
  await expect(page.locator('.canvas-host canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Open settings', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Settings', exact: true });
  await expect(dialog).toBeVisible();
  // Never claims "Ready" while the water shaders are gone.
  await expect(dialog).toContainText('Water effects unavailable');
});
