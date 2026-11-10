import { expect, it } from 'vitest';
import { OimoFluid } from '../../src/render/water/oimo-fluid';
const idle = { x: 0, y: 0, dx: 0, dy: 0, active: false };
it('Oimo APIC water remains finite, inside boundaries and deterministic under repeated impulses', () => {
  const a = new OimoFluid(24, 20),
    b = new OimoFluid(24, 20);
  const original = a.particles.slice();
  for (let t = 0; t < 120; t++) {
    const pointer = { x: 12 + Math.sin(t) * 3, y: 12, dx: Math.cos(t) * 20, dy: 10, active: true };
    a.step(pointer);
    b.step(pointer);
  }
  expect(a.particles).toEqual(b.particles);
  expect(a.particles).not.toEqual(original);
  for (let i = 0; i < a.particles.length; i++) expect(Number.isFinite(a.particles[i])).toBe(true);
  for (let i = 0; i < a.count; i++) {
    expect(a.particles[i * 10 + 1]).toBeGreaterThan(1);
    expect(a.particles[i * 10 + 1]).toBeLessThan(a.width - 1);
    expect(a.particles[i * 10 + 2]).toBeGreaterThan(1);
    expect(a.particles[i * 10 + 2]).toBeLessThan(a.height - 1);
  }
});
it('hover moves actual water rather than drawing decorative DOM circles', () => {
  const a = new OimoFluid(24, 20),
    b = new OimoFluid(24, 20);
  a.step({ x: 12, y: 10, dx: 3, dy: 2, active: true });
  b.step(idle);
  expect(a.particles).not.toEqual(b.particles);
  const vertices = new Float32Array(a.count * 4);
  a.writeVertices(vertices, 8);
  expect(vertices.every(Number.isFinite)).toBe(true);
  expect(vertices[2]).toBeGreaterThan(0);
});

it('keeps loader CPU and pixel budgets substantially below the original adaptation', async () => {
  const { waterConfig } = await import('../../src/config/water.config');
  expect(waterConfig.cells).toBeLessThanOrEqual(1100);
  expect(waterConfig.maxResolution).toBeLessThanOrEqual(1);
  expect(waterConfig.frameMs).toBeGreaterThanOrEqual(1000 / 24);
  expect(waterConfig.grain).toBeGreaterThan(0);
  expect(waterConfig.grain).toBeLessThanOrEqual(1);
});
