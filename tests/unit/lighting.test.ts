import { describe, expect, it } from 'vitest';
import { lightingAt, lightingLimits } from '../../src/config/lighting';
import { moodAt, sceneConfig } from '../../src/config/scene.config';

/**
 * The light must be *graded*, not a dimmer switch.
 *
 * These tests exist because the previous pass was rejected for being "very bright, very dark": a
 * single `daylight` number multiplied every channel, so the scene went from one exposure to
 * another in a straight line and everything moved together. Each assertion below is one property
 * that a straight ramp cannot have.
 */
describe('lightingAt', () => {
  const samples = Array.from({ length: 101 }, (_, i) => lightingAt(i / 100));

  it('never blows out or crushes: every channel stays inside its own limits', () => {
    for (const light of samples) {
      // The key may reach full, but only just: it is the brightest thing allowed.
      expect(light.key).toBeLessThanOrEqual(lightingLimits.keyDay);
      // Ambient never reaches zero. This is the crushed-shadow guard, and the whole reason the
      // night is legible instead of a void.
      expect(light.ambient).toBeGreaterThan(0);
      expect(light.ambient).toBeLessThanOrEqual(lightingLimits.ambientNight);
      expect(light.grade).toBeLessThanOrEqual(lightingLimits.gradeNight);
      expect(light.vignette).toBeLessThanOrEqual(lightingLimits.vignetteNight);
    }
  });

  it('turns the key down while turning the fill up, rather than fading as one sheet', () => {
    const day = lightingAt(1);
    const night = lightingAt(0);
    // These two must move in opposite directions. A shared ramp would move them together.
    expect(night.key).toBeLessThan(day.key);
    expect(night.ambient).toBeGreaterThan(day.ambient);
  });

  it('reaches its warmest at dusk, not at either end of the cycle', () => {
    const night = lightingAt(0).warmth;
    const dusk = lightingAt(0.5).warmth;
    const noon = lightingAt(1).warmth;
    expect(dusk).toBeGreaterThan(noon);
    expect(dusk).toBeGreaterThan(night);
    // Noon is warm but restrained; the sunset is the warm moment.
    expect(noon).toBeGreaterThan(night);
  });

  it('takes the sunlight away before it takes the sky', () => {
    // Caustics and rays are sunlight: gone well before night. The surface band is the sky
    // reflecting, so it must outlive both.
    const threeQuartersDusk = lightingAt(0.3);
    expect(threeQuartersDusk.caustics).toBeLessThan(0.2);
    expect(threeQuartersDusk.rays).toBeLessThan(0.2);
    expect(threeQuartersDusk.surface).toBeGreaterThan(threeQuartersDusk.caustics);
    expect(threeQuartersDusk.surface).toBeGreaterThan(threeQuartersDusk.rays);
  });

  it('is monotonic per channel, so a fade never stutters back and forth', () => {
    // Ordered from night to day; each of these must only ever increase.
    const ascending = ['daylight', 'key', 'caustics', 'rays', 'surface'] as const;
    const descending = ['ambient', 'grade', 'vignette'] as const;
    // `samples` is built from daylight 0 upward, so it already runs night → day.
    const ordered = samples;
    for (const name of ascending) {
      for (let i = 1; i < ordered.length; i++) {
        expect(ordered[i]?.[name] ?? 0).toBeGreaterThanOrEqual(ordered[i - 1]?.[name] ?? 0);
      }
    }
    for (const name of descending) {
      for (let i = 1; i < ordered.length; i++) {
        expect(ordered[i]?.[name] ?? 0).toBeLessThanOrEqual(ordered[i - 1]?.[name] ?? 0);
      }
    }
  });

  it('moves the light across the tank, so day and night are lit from different places', () => {
    const day = lightingAt(1).azimuth;
    const night = lightingAt(0).azimuth;
    expect(Math.abs(day - night)).toBeGreaterThan(0.3);
    // And it stays inside the frame at every point.
    for (const light of samples) {
      expect(light.azimuth).toBeGreaterThanOrEqual(0);
      expect(light.azimuth).toBeLessThanOrEqual(1);
    }
  });

  it('is continuous, so no channel jumps at a moment the eye could catch', () => {
    for (let i = 1; i < samples.length; i++) {
      const previous = samples[i - 1];
      const current = samples[i];
      if (!previous || !current) continue;
      // A step of 1/100 in daylight may not move any channel by more than a fifth of its range.
      for (const name of [
        'key',
        'ambient',
        'warmth',
        'caustics',
        'rays',
        'surface',
        'grade',
        'azimuth',
      ] as const) {
        expect(Math.abs(current[name] - previous[name])).toBeLessThan(0.2);
      }
    }
  });
});

describe('the cycle and its light', () => {
  it('always reports a full day at the start and a full night at its darkest', () => {
    const total =
      sceneConfig.cycle.daySeconds +
      sceneConfig.cycle.fadeSeconds * 2 +
      sceneConfig.cycle.nightSeconds;
    expect(lightingAt(moodAt(0).daylight).key).toBeGreaterThan(0.9);
    const nightStart = sceneConfig.cycle.daySeconds + sceneConfig.cycle.fadeSeconds;
    expect(lightingAt(moodAt(nightStart).daylight).key).toBeLessThan(0.1);
    expect(moodAt(total).mood).toBe(moodAt(0).mood);
  });

  it('keeps every channel inside 0..1 for the whole cycle, at every moment', () => {
    const total =
      sceneConfig.cycle.daySeconds +
      sceneConfig.cycle.fadeSeconds * 2 +
      sceneConfig.cycle.nightSeconds;
    for (let second = 0; second < total; second++) {
      const light = lightingAt(moodAt(second).daylight);
      for (const value of Object.values(light)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});
