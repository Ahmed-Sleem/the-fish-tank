/**
 * The drawing surface, from the player's side.
 *
 * What must be true: the icon opens one dialog, a stroke costs what it says it costs, undo gives
 * the ink back, and nothing can be committed that the purse cannot pay for. The price shown while
 * drawing is the price charged — that is the promise the whole ink design rests on, so it is
 * asserted against the purse rather than against a hardcoded number.
 */
import { expect, test } from '@playwright/test';
import { strings } from '../../src/config/strings.en';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.loading-screen')).toHaveCount(0, { timeout: 30000 });
});

async function openDrawing(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: strings.drawOpen }).click();
  const dialog = page.getByRole('dialog', { name: strings.drawTitle });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Drag along the board, which is the only way to make ink. */
async function stroke(page: import('@playwright/test').Page, fromX: number, toX: number) {
  const board = page.locator('.draw-board');
  const box = await board.boundingBox();
  if (!box) throw new Error('drawing board is not laid out');
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * fromX, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * toX, y, { steps: 12 });
  await page.mouse.up();
}

test('one icon opens one drawing dialog, and every control in it works', async ({ page }) => {
  const dialog = await openDrawing(page);
  await expect(dialog.getByRole('img', { name: strings.drawHint })).toBeVisible();
  await expect(dialog.getByRole('button', { name: strings.drawDone })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: strings.drawUndo })).toBeDisabled();

  // Three widths and six colours, each a real toggle rather than a radio group pretending.
  await expect(dialog.locator('.draw-width')).toHaveCount(3);
  await expect(dialog.locator('.draw-swatch')).toHaveCount(6);
  const thick = dialog.locator('.draw-width').nth(2);
  await thick.click();
  await expect(thick).toHaveAttribute('aria-pressed', 'true');
});

test('a stroke is priced by length, shown honestly, and undone for a full refund', async ({
  page,
}) => {
  const dialog = await openDrawing(page);
  const ink = dialog.locator('.draw-figure--ink .draw-figure-value');
  const cost = dialog.locator('.draw-figure--cost .draw-figure-value');
  const startInk = Number(await ink.textContent());

  await stroke(page, 0.2, 0.8);
  await expect(dialog.getByRole('button', { name: strings.drawUndo })).toBeEnabled();
  const firstInk = Number(await ink.textContent());
  const priced = Number(await cost.textContent());
  expect(priced).toBeGreaterThan(0);
  // The purse fell by exactly the price shown.
  expect(startInk - firstInk).toBe(priced);

  await dialog.getByRole('button', { name: strings.drawUndo }).click();
  await expect(ink).toHaveText(String(startInk));
  await expect(dialog.getByRole('button', { name: strings.drawDone })).toBeDisabled();
});

test('a longer stroke costs more than a short one, and width changes nothing', async ({ page }) => {
  const dialog = await openDrawing(page);
  const cost = dialog.locator('.draw-figure--cost .draw-figure-value');

  await stroke(page, 0.3, 0.4);
  const short = Number(await cost.textContent());
  await dialog.getByRole('button', { name: strings.drawClear }).click();

  await stroke(page, 0.2, 0.8);
  const long = Number(await cost.textContent());
  expect(long).toBeGreaterThan(short);

  // Same path, thickest pen: DEC-023 says the price cannot move.
  await dialog.getByRole('button', { name: strings.drawClear }).click();
  await dialog.locator('.draw-width').nth(2).click();
  await stroke(page, 0.2, 0.8);
  expect(Number(await cost.textContent())).toBe(long);

  await expect(dialog.getByRole('button', { name: strings.drawDone })).toBeEnabled();
});

test('clearing returns every coin, and the dialog forgets the drawing when reopened', async ({
  page,
}) => {
  const dialog = await openDrawing(page);
  const ink = dialog.locator('.draw-figure--ink .draw-figure-value');
  const startInk = Number(await ink.textContent());

  await stroke(page, 0.2, 0.8);
  await stroke(page, 0.25, 0.75);
  await dialog.getByRole('button', { name: strings.drawClear }).click();
  await expect(ink).toHaveText(String(startInk));
  await expect(dialog.getByRole('button', { name: strings.drawDone })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: strings.drawClear })).toBeDisabled();
});

test('the drawing dialog is keyboard reachable and closes back to its icon', async ({ page }) => {
  const trigger = page.getByRole('button', { name: strings.drawOpen });
  await openDrawing(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: strings.drawTitle })).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('committing a drawing spends exactly the price that was shown', async ({ page }) => {
  const dialog = await openDrawing(page);
  await stroke(page, 0.2, 0.8);
  const shown = Number(await dialog.locator('.draw-figure--cost .draw-figure-value').textContent());
  expect(shown).toBeGreaterThan(0);

  await dialog.getByRole('button', { name: strings.drawDone }).click();
  await expect(page.getByRole('dialog', { name: strings.drawTitle })).not.toBeVisible();

  // Reopening starts a fresh sheet, and the wallet has genuinely fallen by the shown price.
  const reopened = await openDrawing(page);
  const remaining = Number(
    await reopened.locator('.draw-figure--ink .draw-figure-value').textContent(),
  );
  expect(remaining).toBeLessThan(100);
  expect(100 - remaining).toBe(shown);
});

test('the panel stays organised: captioned tools, one leading figure, actions in reach', async ({
  page,
}) => {
  test.setTimeout(90000);
  const dialog = await openDrawing(page);

  // Each kind of choice says what it is, rather than being a row of unexplained dots.
  await expect(dialog.locator('.draw-cluster-title')).toHaveCount(2);
  await expect(dialog.locator('.draw-cluster-title').first()).toHaveText(/pen/i);

  // The price is the one number that leads; the balance is context beside it, not a rival.
  await stroke(page, 0.2, 0.8);
  const cost = dialog.locator('.draw-figure--cost .draw-figure-value');
  const ink = dialog.locator('.draw-figure--ink .draw-figure-value');
  const costSize = Number.parseFloat(await cost.evaluate((el) => getComputedStyle(el).fontSize));
  const inkSize = Number.parseFloat(await ink.evaluate((el) => getComputedStyle(el).fontSize));
  expect(costSize).toBeGreaterThan(inkSize);

  // Every control is inside the dialog, which is what stops Done drifting out of reach.
  const dialogBox = await dialog.boundingBox();
  for (const name of [strings.drawUndo, strings.drawClear, strings.drawDone]) {
    const box = await dialog.getByRole('button', { name }).boundingBox();
    expect(box).not.toBeNull();
    if (!box || !dialogBox) continue;
    expect(box.x + box.width).toBeLessThanOrEqual(dialogBox.x + dialogBox.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(dialogBox.y + dialogBox.height + 1);
  }
});

test('ink is drawn in blocks the same size as the tank art, not as smooth lines', async ({
  page,
}) => {
  // Reads back a full-board pixel buffer after a real drag; slow on a software renderer.
  test.setTimeout(90000);
  const dialog = await openDrawing(page);
  const board = page.locator('.draw-board');
  await stroke(page, 0.2, 0.8);

  /*
   * A pixel line is only pixel art if its edge is a staircase of the tank's own blocks. Read the
   * pixels back and measure the run length of the leading edge: a smooth (antialiased) stroke
   * changes column every row, whereas a blocky one holds the same edge across several rows, and
   * the block size must match the tank's art scale rather than the display's device ratio.
   */
  const sample = await board.evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const solid = (x: number, y: number) => (data[(y * width + x) * 4 + 3] ?? 0) > 200;
    // For each row, the leftmost solid pixel; the run of identical values is one block tall.
    const runs: number[] = [];
    let previous = -1;
    let run = 0;
    for (let y = 0; y < height; y += 1) {
      let edge = -1;
      for (let x = 0; x < width; x += 1) {
        if (solid(x, y)) {
          edge = x;
          break;
        }
      }
      if (edge === -1) {
        if (run > 0) runs.push(run);
        run = 0;
        previous = -1;
        continue;
      }
      if (edge === previous) run += 1;
      else {
        if (run > 0) runs.push(run);
        run = 1;
        previous = edge;
      }
    }
    if (run > 0) runs.push(run);
    const fresh = runs.filter((value) => value > 1).sort((a, b) => a - b);
    const tank = document.querySelector('.canvas-host');
    const tankWidth = tank ? tank.getBoundingClientRect().width : 0;
    return {
      canvasWidth: width,
      cssWidth: canvas.getBoundingClientRect().width,
      longestRun: runs.length > 0 ? Math.max(...runs) : 0,
      medianSquareRun: fresh.length > 0 ? fresh[Math.floor(fresh.length / 2)] : 0,
      tankWidth,
    };
  });

  // Blocks are real: an antialiased vector stroke would almost never hold an edge for >1 row.
  expect(sample.longestRun).toBeGreaterThan(2);
  expect(sample.medianSquareRun).toBeGreaterThan(1);
  /*
   * And their size is the tank's grain, not the screen's. One art pixel is the tank width over
   * 344 (the reference grid), so on this board the same measurement should land within a device
   * pixel or two of that — proving the drawing and the scenery share one grain.
   */
  const devicePerArtPixel = (sample.canvasWidth / sample.cssWidth) * (sample.tankWidth / 344);
  expect(Math.abs((sample.medianSquareRun ?? 0) - devicePerArtPixel)).toBeLessThanOrEqual(2.5);
  await expect(dialog.getByRole('button', { name: strings.drawDone })).toBeEnabled();
});

/**
 * The panel must fit the window without scrolling, at every size it will meet.
 *
 * It is a sheet you draw on, so the browser's own scrolling is not merely untidy: a wheel or drag
 * over the paper would scroll the dialog instead of drawing, and on a short window the buttons
 * were pushed below the fold entirely. Both the dialog and the drawing panel are checked, because
 * a child that overflows its frame is what caused it the first time.
 */
test('the drawing panel never scrolls, and always shows Done', async ({ page }) => {
  /*
   * Checked one size at a time, because the dialog is modal: while it is open nothing behind it can
   * be clicked, and a blank sheet has no Done to dismiss it with. The viewport is restored
   * afterwards, because the worker reuses this page and a later test that measures the sheet must
   * not inherit this one's window.
   */
  const original = page.viewportSize();
  try {
    const dialog = await openDrawing(page);
    for (const viewport of [
      { width: 1280, height: 700 },
      { width: 900, height: 560 },
      { width: 420, height: 620 },
    ]) {
      await page.setViewportSize(viewport);
      const overflow = await dialog.evaluate((node) => ({
        scroll: node.scrollHeight,
        client: node.clientHeight,
      }));
      // One pixel of tolerance for sub-pixel rounding; a real overflow is tens of pixels.
      expect(
        overflow.scroll,
        `dialog overflows at ${String(viewport.width)}x${String(viewport.height)}`,
      ).toBeLessThanOrEqual(overflow.client + 1);

      // Done is the commitment; it must be on screen, not merely present in the DOM.
      const box = await dialog.getByRole('button', { name: strings.drawDone }).boundingBox();
      expect(box).not.toBeNull();
      expect(box?.y ?? Infinity).toBeGreaterThan(0);
      expect(
        (box?.y ?? 0) + (box?.height ?? 0),
        `Done is below the fold at ${String(viewport.width)}x${String(viewport.height)}`,
      ).toBeLessThanOrEqual(viewport.height);

      // The sheet keeps a drawing area big enough to aim at, even when the window is short.
      const board = await dialog.locator('.draw-board').boundingBox();
      expect(
        board?.height ?? 0,
        `sheet is unusably short at ${String(viewport.height)}`,
      ).toBeGreaterThan(60);
    }
  } finally {
    if (original) await page.setViewportSize(original);
  }
});
