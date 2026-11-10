import { expect, it } from 'vitest';
import { createFixedLoop } from '../../src/core/loop';
import { createParticles } from '../../src/render/particles';
import { sceneConfig } from '../../src/config/scene.config';
import { OimoFluid } from '../../src/render/water/oimo-fluid';
it('loader starts as a pushed floor pool, not a suspended falling box', () => {
  const fluid = new OimoFluid(40, 26);
  let minX = Infinity,
    maxX = 0,
    minY = Infinity,
    maxY = 0;
  for (let p = 0; p < fluid.particles.length; p += 10) {
    const x = fluid.particles[p + 1] ?? 0,
      y = fluid.particles[p + 2] ?? 0;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    expect(fluid.particles[p + 3]).toBeGreaterThan(0);
    expect(fluid.particles[p + 3]).toBeLessThanOrEqual(0.22);
    expect(fluid.particles[p + 4]).toBeLessThan(0);
  }
  expect(minX).toBeLessThan(1.1);
  expect(maxX).toBeGreaterThan(fluid.width - 2);
  expect(minY).toBeGreaterThanOrEqual(fluid.height / 2);
  expect(maxY).toBeGreaterThan(fluid.height - 1.6);
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
