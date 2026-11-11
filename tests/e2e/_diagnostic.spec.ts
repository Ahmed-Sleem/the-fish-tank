import { test } from '@playwright/test';
test('DIAGNOSTIC: report browser capabilities on this runner', async ({ browser }) => {
  const page = await browser.newPage();
  const info = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    return {
      webgl2: !!gl,
      float: gl ? !!gl.getExtension('EXT_color_buffer_float') : null,
      renderer: gl
        ? gl.getParameter(
            gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER,
          )
        : null,
      ua: navigator.userAgent,
    };
  });
  console.log('DIAGNOSTIC ' + JSON.stringify(info));
  await page.close();
});
