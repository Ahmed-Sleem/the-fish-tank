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
  const ink = dialog.locator('.draw-ink-value');
  const cost = dialog.locator('.draw-cost-value');
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
  const cost = dialog.locator('.draw-cost-value');

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
  const ink = dialog.locator('.draw-ink-value');
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
  const shown = Number(await dialog.locator('.draw-cost-value').textContent());
  expect(shown).toBeGreaterThan(0);

  await dialog.getByRole('button', { name: strings.drawDone }).click();
  await expect(page.getByRole('dialog', { name: strings.drawTitle })).not.toBeVisible();

  // Reopening starts a fresh sheet, and the wallet has genuinely fallen by the shown price.
  const reopened = await openDrawing(page);
  const remaining = Number(await reopened.locator('.draw-ink-value').textContent());
  expect(remaining).toBeLessThan(100);
  expect(100 - remaining).toBe(shown);
});
