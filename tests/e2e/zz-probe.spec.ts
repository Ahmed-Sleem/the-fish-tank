import { writeFileSync } from 'node:fs';
import { test } from '@playwright/test';
test('PROBE: write runner capabilities to disk', async ({ browser }) => {
  const page = await browser.newPage();
  const info = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    return JSON.stringify({
      webgl2: !!gl,
      float: gl ? !!gl.getExtension('EXT_color_buffer_float') : null,
      ua: navigator.userAgent.slice(0, 80),
      dpr: devicePixelRatio,
    });
  });
  await page.close();
  writeFileSync('probe-result.json', info);
});
