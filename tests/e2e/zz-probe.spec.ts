import { expect, test } from '@playwright/test';
test('PROBE: what can this runner render', async ({ browser }) => {
  const page = await browser.newPage();
  const info = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    return JSON.stringify({
      webgl2: !!gl,
      float: gl ? !!gl.getExtension('EXT_color_buffer_float') : null,
      ua: navigator.userAgent.slice(0, 60),
    });
  });
  await page.close();
  expect(info).toBe('intentional-failure-to-report-capabilities');
});
