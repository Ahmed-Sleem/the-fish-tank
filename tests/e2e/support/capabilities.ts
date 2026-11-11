import type { Browser } from '@playwright/test';

/**
 * Whether this browser can actually render the water.
 *
 * The tank and the splash need a WebGL2 context with float render targets. Headless CI runners
 * without a GPU — and Chromium builds without a software GL backend — genuinely cannot create
 * one. In that case the app deliberately falls back: the splash shows its title and the word
 * without the fluid, the tank shows the pixel art without caustics, and the dialog says so.
 *
 * Specs that assert the water itself must therefore ask first instead of failing, or a missing
 * GPU is reported as a code defect. Nothing is skipped on a browser that can render.
 */
export async function hasWebgl2(browser: Browser): Promise<boolean> {
  const probe = await browser.newPage();
  try {
    return await probe.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return false;
      // The shaders need float colour targets; without them the app takes the degraded path.
      return gl.getExtension('EXT_color_buffer_float') !== null;
    });
  } finally {
    await probe.close();
  }
}
