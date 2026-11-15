/**
 * The day/night control, from the player's side.
 *
 * The owner asked for an icon that changes day and night, so this asserts the two things that
 * would make it feel broken: the light must actually change, and the choice must stay changed
 * rather than sliding back into the cycle a moment later.
 */
import { expect, test } from '@playwright/test';
import { strings } from '../../src/config/strings.en';
import { waitForTank } from './support/ready';
import { gotoFreshTank } from './support/boot';

test.beforeEach(async ({ page }) => {
  await gotoFreshTank(page);
  await waitForTank(page);
});

const mood = (page: import('@playwright/test').Page) =>
  page.locator('html').getAttribute('data-mood');

test('the icon flips the tank to night and back, and the palette follows', async ({ page }) => {
  // The tank starts in whichever light it resolves to — day when the cycle runs, night when
  // reduced motion holds it still — so the test presses whatever the control offers and asserts
  // that the light actually turns over. Assuming a starting phase would test the machine.
  const read = async () => {
    const mood = await page.locator('html').getAttribute('data-mood');
    const top = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--water-top').trim(),
    );
    return { mood, top };
  };

  const first = await read();
  expect(first.mood).not.toBeNull();
  const flip = page.getByRole('button', {
    name: new RegExp(`${strings.moodToNight}|${strings.moodToDay}`),
  });
  await expect(flip).toBeVisible();
  await flip.click();

  const second = await read();
  expect(second.mood).not.toBe(first.mood);
  // The palette must move with it, or the button changes a label and nothing else.
  expect(second.top).not.toBe(first.top);

  // And pressing again returns to the light it started in.
  const back = page.getByRole('button', {
    name: new RegExp(`${strings.moodToNight}|${strings.moodToDay}`),
  });
  await back.click();
  expect((await read()).mood).toBe(first.mood);
});

test('a pinned light holds instead of drifting back into the cycle', async ({ page }) => {
  /*
   * The cycle reads `Date.now()`, so a pin can be tested by moving the clock forward instead of
   * sitting still for a minute. This test used to sleep for 60 real seconds — a fifth of the whole
   * suite's wall clock, spent waiting — to prove something the clock can say immediately.
   *
   * Ten minutes of clock is more than one full cycle: anything short of a true pin would have
   * turned day over several times by then.
   */
  test.setTimeout(60000);
  const nightButton = page.getByRole('button', {
    name: new RegExp(`${strings.moodToNight}|${strings.moodToDay}`),
  });
  if ((await page.locator('html').getAttribute('data-mood')) !== 'night') await nightButton.click();
  await expect(page.locator('html')).toHaveAttribute('data-mood', 'night');

  await page.clock.install();
  // Six jumps of ten minutes each: a full cycle is 100 seconds, so this is ~36 cycles' worth.
  for (let i = 0; i < 6; i++) {
    await page.clock.fastForward('10:00');
    expect(await mood(page)).toBe('night');
  }
});

test('night is a different place, not a dimmer tank', async ({ page }) => {
  /*
   * The owner's requirement: day and night must swap the whole environment. Assert the parts a
   * stylesheet can change — the full-scene grade's paint, its blend mode, the water, and the
   * scenery's own palette — all move together, week by week rather than one at a time.
   */
  const grade = page.locator('.water-grade');
  await expect(grade).toHaveCount(1);

  const readEnvironment = () =>
    page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const gradeNode = document.querySelector('.water-grade');
      const gradeStyle = gradeNode ? getComputedStyle(gradeNode) : null;
      return {
        mood: document.documentElement.dataset.mood ?? '',
        grade: gradeStyle?.backgroundImage ?? '',
        water: style.getPropertyValue('--water-top').trim(),
        sand: style.getPropertyValue('--art-sand-mid').trim(),
        plant: style.getPropertyValue('--art-plant-scale').trim(),
      };
    });

  const before = await readEnvironment();
  const button = page.getByRole('button', { name: /Switch to (day|night)/ });
  await button.click();
  await expect
    .poll(async () => (await readEnvironment()).mood, { timeout: 15000 })
    .not.toBe(before.mood);
  const after = await readEnvironment();

  // The whole environment turns over: the full-scene grade, the water, and the scenery's own
  // colours. The grade deliberately has no blend mode — a full-screen compositing layer above the
  // tank turned out to be a real cost on a software renderer — so it changes paint, not blending.
  expect(after.grade).not.toBe(before.grade);
  expect(after.water).not.toBe(before.water);
  expect(after.sand).not.toBe(before.sand);
  expect(after.plant).not.toBe(before.plant);
  // And the grade is a real wash over the scene, not an invisible layer.
  const opacity = await grade.evaluate((node) => getComputedStyle(node).opacity);
  // A wash you can see, but not a fog: the tank has to stay legible under it. The band is wide on
  // purpose — the exact value is a design choice, "present and not opaque" is the requirement.
  expect(Number(opacity)).toBeGreaterThanOrEqual(0.4);
  expect(Number(opacity)).toBeLessThan(0.85);
});
