import { expect, it } from 'vitest';
import { createWaterInput } from '../../src/sim/water/input';
import { createFlow } from '../../src/sim/water/flow';
import { effectsConfig } from '../../src/config/effects.config';
it('coalesces arbitrarily many inputs to one bounded latest impulse and rejects invalid coordinates', () => {
  const input = createWaterInput();
  for (let i = 0; i < 10000; i++) input.push(0.5, 0.4, true, 100, -100);
  expect(input.take()).toEqual({
    x: 0.5,
    y: 0.4,
    strength: effectsConfig.pressStrength,
    dx: 1,
    dy: -1,
  });
  expect(input.take()).toBeUndefined();
  for (const x of [NaN, Infinity, -1, 2]) input.push(x, 0.5, true);
  expect(input.take()).toBeUndefined();
  input.push(0.1, 0.2, false);
  expect(input.take()?.strength).toBe(effectsConfig.hoverStrength);
  input.push(0.1, 0.2, true);
  input.clear();
  expect(input.take()).toBeUndefined();
});
it('curl flow is seeded, finite, pooled and shared; injected velocity decays', () => {
  const a = createFlow(),
    b = createFlow();
  const x = a.x,
    y = a.y;
  a.update(1 / 30);
  b.update(1 / 30);
  expect(a.x).toEqual(b.x);
  expect(a.y).toEqual(b.y);
  expect(a.x.some((v) => Math.abs(v) > 0.001)).toBe(true);
  a.inject(0.5, 0.5, 100, -100);
  a.update(1 / 30);
  b.update(1 / 30);
  expect(a.sample(0.5, 0.5).x - b.sample(0.5, 0.5).x).toBeCloseTo(
    effectsConfig.flowImpulse * effectsConfig.flowDecay,
  );
  for (let i = 0; i < 150; i++) {
    a.update(1 / 30);
    b.update(1 / 30);
  }
  expect(a.sample(0.5, 0.5).x).toBeCloseTo(b.sample(0.5, 0.5).x, 5);
  for (let i = 0; i < 1000; i++) {
    a.inject(0.2, 0.7, 1e30, -1e30);
    a.update(1 / 30);
  }
  expect(a.x).toBe(x);
  expect(a.y).toBe(y);
  expect([...x, ...y].every(Number.isFinite)).toBe(true);
  a.clear();
  expect(x.every((v) => v === 0) && y.every((v) => v === 0)).toBe(true);
});
