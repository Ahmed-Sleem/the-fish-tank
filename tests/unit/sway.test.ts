/**
 * Scenery motion, tested without a GPU.
 *
 * The plants are drawn as pixels, so "the animation works" is not something a pixel-diff can
 * prove on a machine with no WebGL. What can be proven is the contract that makes it look alive
 * rather than broken: layers move by different amounts, nothing moves at all under reduced
 * motion, tall plants lean further than squat ones, and the motion is bounded so a strong current
 * can never fling a plant off the sand.
 */
import { describe, expect, it } from 'vitest';
import { swayFor } from '../../src/render/pixel/sway';
import { pixelConfig } from '../../src/config/pixel.config';

const still = () => ({ x: 0, y: 0 });
const gust = (x: number) => () => ({ x, y: 0 });

const plants = {
  anchors: [
    { x: 40, y: 160, give: 1 },
    { x: 120, y: 162, give: 0.8 },
  ],
  gain: pixelConfig.swayGainPlants,
};
const far = { anchors: [{ x: 40, y: 160, give: 0.25 }], gain: pixelConfig.swayGainFar };

describe('swayFor', () => {
  it('stays within a hair of still when the water is still', () => {
    const state = swayFor(plants, 0, still);
    expect(Math.abs(state.angle)).toBeLessThan(0.02);
    expect(Math.abs(state.offsetX)).toBeLessThan(0.2);
  });

  it('actually moves over time, or the tank would look frozen', () => {
    const a = swayFor(plants, 0.4, still);
    const b = swayFor(plants, 3.2, still);
    expect(Math.abs(a.angle - b.angle)).toBeGreaterThan(0.001);
  });

  it('moves the near layer more than the far one, which is what makes depth read', () => {
    const near = swayFor(plants, 1.1, gust(2));
    const distant = swayFor(far, 1.1, gust(2));
    expect(Math.abs(near.angle)).toBeGreaterThan(Math.abs(distant.angle));
    expect(Math.abs(near.offsetX)).toBeGreaterThan(Math.abs(distant.offsetX));
  });

  it('responds to the current, so stirring the water bends the plants', () => {
    const calm = swayFor(plants, 2, still);
    const stirred = swayFor(plants, 2, gust(6));
    expect(Math.abs(stirred.angle)).toBeGreaterThan(Math.abs(calm.angle));
  });

  it('is bounded: even a violent current cannot tear a plant off its root', () => {
    // A plant may lean, never spin. Half a radian would already look like a bug at this scale.
    for (const current of [0, 5, 50, 5000, -5000]) {
      const state = swayFor(plants, 7, gust(current));
      expect(Math.abs(state.angle)).toBeLessThan(0.5);
      expect(Math.abs(state.offsetX)).toBeLessThan(3);
    }
  });

  it('produces nothing at all for a layer with no props', () => {
    expect(swayFor({ anchors: [], gain: 1 }, 5, gust(9))).toEqual({ angle: 0, offsetX: 0 });
  });

  it('is deterministic for the same time and current', () => {
    expect(swayFor(plants, 12.5, gust(1.3))).toEqual(swayFor(plants, 12.5, gust(1.3)));
  });
});
