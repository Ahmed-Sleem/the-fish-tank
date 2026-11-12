import { test } from '@playwright/test';
test('page state on this runner', async ({ page }) => {
  test.setTimeout(150000);
  const logs: string[] = [];
  page.on('console', (m) => logs.push(m.type() + ':' + m.text().slice(0, 90)));
  page.on('pageerror', (e) => logs.push('ERR:' + e.message.slice(0, 120)));
  await page.goto('./');
  await page.waitForTimeout(22000);
  const s = await page.evaluate(() => ({
    splash: document.querySelectorAll('.loading-screen').length,
    effects: document.querySelector('.canvas-host')?.getAttribute('data-effects') ?? null,
    running: document.querySelector('.canvas-host')?.getAttribute('data-running') ?? null,
    mood: document.documentElement.dataset.mood ?? null,
    gl2: (() => {
      const c = document.createElement('canvas');
      const g = c.getContext('webgl2');
      return g ? Boolean(g.getExtension('EXT_color_buffer_float')) : 'none';
    })(),
    canvases: document.querySelectorAll('canvas').length,
  }));
  throw new Error('STATE ' + JSON.stringify(s) + ' LOGS ' + logs.slice(0, 6).join(' | '));
});
