import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const theme = readFileSync('src/ui/theme.css', 'utf8');

/** Every token a module reads at runtime must exist here, or the tank renders black. */
const REQUIRED = [
  // Tank shader uniforms.
  '--water-top',
  '--water-deep',
  '--ray-colour',
  '--surface-colour',
  // Waterline bloom and depth shading.
  '--water-glow',
  // Pixel-art ramps, read as comma lists by the backdrop.
  '--art-plant-scale',
  '--art-stem-scale',
  '--art-moss-scale',
  '--art-pebble-scale',
  '--art-sand-light',
  '--art-sand-mid',
  '--art-sand-dark',
  '--art-sand-shadow',
  '--art-rock-dark',
  '--art-rock-mid',
  '--art-rock-light',
  // Layout and surface tokens the shell and surface layers consume.
  '--surface-bar-height',
  '--surface-line-height',
  '--surface-line-blur',
  '--water-vignette-fallback',
  // Brand colour shared with the favicon.
  '--color-accent',
];

test('every token the renderer and shell read is defined in theme.css', () => {
  const defined = new Set(
    [...theme.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((match) => match[1] as string),
  );
  const missing = REQUIRED.filter((token) => !defined.has(token));
  expect(missing).toEqual([]);
});

test('mood-dependent tokens are defined in the base block and in every mood block', () => {
  // A token that survives in one mood but not another renders black for half the cycle,
  // which is exactly the failure mode this redesign must not reintroduce.
  const moodTokens = [
    '--water-top',
    '--water-deep',
    '--ray-colour',
    '--surface-colour',
    '--water-glow',
  ];
  /*
   * A rule may list several selectors, which is how the fade states (dusk, dawn) share a palette
   * with the settled mood they belong to. Each selector is counted separately, so a token that is
   * declared for day and for day's fade registers twice — as it should.
   */
  const rules = [...theme.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((match) => ({
    selectors: (match[1] ?? '').split(',').filter((part) => part.includes(':root')),
    body: match[2] ?? '',
  }));
  const blocks = rules.flatMap((rule) =>
    rule.selectors.map((selector) => ({ selector, body: rule.body })),
  );
  expect(blocks.length).toBeGreaterThan(3);
  for (const token of moodTokens) {
    const declared = blocks.filter((block) =>
      new RegExp(`^\\s*${token}\\s*:`, 'm').test(block.body),
    );
    const inDay = declared.some((block) => block.selector.includes("'day'"));
    const inNight = declared.some((block) => block.selector.includes("'night'"));
    // Both settled moods must paint it, or the tank renders that token unset for half the cycle.
    expect(inDay && inNight, token).toBe(true);
    /*
     * Base block plus the day block plus the night block. The reduced-motion block deliberately
     * declares no colours: `resolveMood` freezes the cycle at night, so the night palette arrives
     * through `data-mood` like any other night. Repeating it in CSS would override a player who
     * asks for day while their system asks for stillness.
     */
    expect(declared.length, token).toBeGreaterThanOrEqual(3);
  }
});

test('tokens removed in the redesign stay removed', () => {
  // These were replaced by the water-glow/scale ramps; a stale reference is a black screen.
  for (const dead of ['--water-body', '--water-foam', '--art-plant-dark', '--art-moss-dark']) {
    expect(theme.includes(`${dead}:`)).toBe(false);
  }
});

test('the day and night palettes are the reference palette, not the old mint scheme', () => {
  // Owner decision: adopt the reference's teal/green plants, amber rays, cyan night.
  expect(theme).toMatch(/--day-ray:\s*#[0-9a-f]{6}/i);
  expect(theme).toMatch(/--night-ray:\s*#[0-9a-f]{6}/i);
  const dayRay = /--day-ray:\s*#([0-9a-f]{6})/i.exec(theme)?.[1] ?? '';
  const red = Number.parseInt(dayRay.slice(0, 2), 16);
  const green = Number.parseInt(dayRay.slice(2, 4), 16);
  const blue = Number.parseInt(dayRay.slice(4, 6), 16);
  // A warm ray is red-dominant; a cyan/mint one is not.
  expect(red).toBeGreaterThan(green);
  expect(red).toBeGreaterThan(blue);
  // And no mint accent survives anywhere in the palette.
  expect(theme.toLowerCase()).not.toContain('#39ffb0');
});

test('no borders are declared in the theme either', () => {
  expect(theme).not.toMatch(/border:\s*[^0;}]/);
});
