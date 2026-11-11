import { expect, it, test } from 'vitest';
import { createFixedLoop } from '../../src/core/loop';
import { createParticles } from '../../src/render/particles';
import { moodAt, sceneConfig } from '../../src/config/scene.config';
import { OimoFluid } from '../../src/render/water/oimo-fluid';
it('loader starts as a settled water column, not a pushing pool that never flattens', () => {
  const fluid = new OimoFluid(52, 33);
  // Every column starts filled from the floor to the waterline, at rest.
  const tops = new Map<number, number>();
  let minX = Infinity,
    maxX = 0;
  for (let p = 0; p < fluid.particles.length; p += 10) {
    const x = fluid.particles[p + 1] ?? 0,
      y = fluid.particles[p + 2] ?? 0;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    tops.set(Math.floor(x), Math.min(tops.get(Math.floor(x)) ?? Infinity, y));
    expect(fluid.particles[p + 3]).toBe(0);
    expect(fluid.particles[p + 4]).toBe(0);
  }
  expect(minX).toBeLessThan(1.1);
  expect(maxX).toBeGreaterThan(fluid.width - 2);
  // A flat surface: every column meets the waterline within a couple of cells, and it is a
  // half-full tank rather than a suspended block.
  const surface = [...tops.values()];
  const spread = Math.max(...surface) - Math.min(...surface);
  expect(spread).toBeLessThan(2);
  expect(Math.min(...surface)).toBeGreaterThan(fluid.height * 0.45);
  expect(Math.min(...surface)).toBeLessThan(fluid.height * 0.55);
  // It stays near equilibrium: a second of idle steps must not collapse it into a lump.
  const idle = { x: 0, y: 0, dx: 0, dy: 0, active: false };
  for (let i = 0; i < 48; i++) fluid.step(idle);
  const after = new Map<number, number>();
  for (let p = 0; p < fluid.particles.length; p += 10) {
    const x = Math.floor(fluid.particles[p + 1] ?? 0),
      y = fluid.particles[p + 2] ?? 0;
    after.set(x, Math.min(after.get(x) ?? Infinity, y));
  }
  const settled = [...after.values()];
  expect(Math.max(...settled) - Math.min(...settled)).toBeLessThan(4);
});
it('seeded fixed-step particles are identical at 30, 60 and 144 render fps', () => {
  const run = (fps: number) => {
    const pool = createParticles(),
      loop = createFixedLoop((seconds) => {
        pool.update(seconds);
      });
    for (let i = 0; i < fps * 10; i++) loop.advance(1 / fps);
    return pool.pool;
  };
  expect(run(30)).toEqual(run(60));
  expect(run(60)).toEqual(run(144));
});
it('bounds stall work, resets background debt and interpolates a partial step', () => {
  let steps = 0;
  const loop = createFixedLoop(() => {
    steps++;
  });
  expect(loop.advance(1 / 60)).toBeCloseTo(0.5);
  expect(steps).toBe(0);
  loop.advance(120);
  expect(steps).toBe(sceneConfig.maxSteps);
  loop.reset();
  expect(loop.advance(0)).toBe(0);
  expect(() => loop.advance(NaN)).toThrow();
  expect(() => loop.advance(-1)).toThrow();
});
it('pooled particles stay finite and bounded without allocations during updates', () => {
  const scene = createParticles(),
    pool = scene.pool,
    first = pool[0];
  for (let i = 0; i < 10000; i++) scene.update(1 / 30);
  expect(scene.pool).toBe(pool);
  expect(scene.pool[0]).toBe(first);
  for (const p of pool) {
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeLessThanOrEqual(1);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(1);
  }
});
it('advances exactly 30 simulation ticks per second regardless of render cadence', () => {
  let count = 0,
    time = 0;
  const loop = createFixedLoop((seconds) => {
    count++;
    time += seconds;
  });
  for (let i = 0; i < 144; i++) loop.advance(1 / 144);
  expect(count).toBe(30);
  expect(time).toBeCloseTo(1);
});

test('day/night cycle is exactly 45s day, 15s fade, 45s night, 15s fade', () => {
  const { daySeconds, fadeSeconds, nightSeconds } = sceneConfig.cycle;
  expect([daySeconds, fadeSeconds, nightSeconds]).toEqual([45, 15, 45]);
  expect(moodAt(0)).toEqual({ mood: 'day', daylight: 1 });
  expect(moodAt(44.999).mood).toBe('day');
  // The fades are monotonic and land on the right endpoints.
  expect(moodAt(45).mood).toBe('dusk');
  expect(moodAt(45).daylight).toBe(1);
  expect(moodAt(45 + fadeSeconds / 2).daylight).toBeCloseTo(0.5, 5);
  expect(moodAt(60).mood).toBe('night');
  expect(moodAt(60).daylight).toBe(0);
  expect(moodAt(60 + 44.999).mood).toBe('night');
  expect(moodAt(105).mood).toBe('dawn');
  expect(moodAt(105).daylight).toBe(0);
  expect(moodAt(119.999).daylight).toBeGreaterThan(0.99);
  // The cycle closes: one full period returns to the start.
  expect(moodAt(120)).toEqual(moodAt(0));
  expect(moodAt(120 + 30)).toEqual(moodAt(30));
  // Never a value outside the daylight range, at any time.
  for (let t = 0; t < 240; t += 0.37) {
    const { daylight } = moodAt(t);
    expect(daylight).toBeGreaterThanOrEqual(0);
    expect(daylight).toBeLessThanOrEqual(1);
  }
});

test('daylight rises through dawn and falls through dusk, never jumping', () => {
  let previous = moodAt(44).daylight;
  for (let t = 44; t <= 61; t += 0.25) {
    const { daylight } = moodAt(t);
    expect(previous - daylight).toBeGreaterThanOrEqual(-0.02);
    previous = daylight;
  }
  previous = moodAt(104).daylight;
  for (let t = 104; t <= 121; t += 0.25) {
    const { daylight } = moodAt(t);
    expect(daylight - previous).toBeGreaterThanOrEqual(-0.02);
    previous = daylight;
  }
});
