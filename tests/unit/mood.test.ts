/**
 * The day/night cycle, tested where it can actually be tested.
 *
 * The owner reported that night never arrived after leaving the tab open. The cause was not the
 * cycle maths — that was always right — but what time was fed to it: accumulated *simulated*
 * seconds, which stop while the tab is hidden, while the tank pauses behind a dialog, and
 * whenever frames are dropped. These tests pin both the maths and the contract that the cycle
 * follows real time, because a broken clock is invisible until someone waits long enough.
 */
import { describe, expect, it } from 'vitest';
import { isFadingToNight, moodAt, resolveMood, sceneConfig } from '../../src/config/scene.config';

const { daySeconds, fadeSeconds, nightSeconds } = sceneConfig.cycle;
const total = daySeconds + fadeSeconds + nightSeconds + fadeSeconds;

describe('moodAt', () => {
  it('opens on day', () => {
    expect(moodAt(0)).toEqual({ mood: 'day', daylight: 1 });
  });

  it('reaches every phase, including night, within one cycle', () => {
    // The owner's complaint in one assertion: at some point the tank must be night.
    const moods = new Set(Array.from({ length: total }, (_, second) => moodAt(second).mood));
    expect([...moods].sort()).toEqual(['dawn', 'day', 'dusk', 'night']);
  });

  it('is night for the whole night span', () => {
    const start = daySeconds + fadeSeconds;
    expect(moodAt(start).mood).toBe('night');
    expect(moodAt(start + nightSeconds - 1).mood).toBe('night');
    expect(moodAt(start).daylight).toBe(0);
  });

  it('fades smoothly and never jumps', () => {
    // Daylight must be continuous: a step would read as the scene flickering.
    let previous = moodAt(0).daylight;
    for (let t = 1; t < total * 2; t += 0.5) {
      const current = moodAt(t).daylight;
      expect(Math.abs(current - previous)).toBeLessThan(0.06);
      previous = current;
    }
  });

  it('wraps forever, so a long-open tab keeps cycling', () => {
    // 24 hours of real time: the mood must still be a real phase, not stuck.
    expect(moodAt(total * 1042).mood).toBe(moodAt(0).mood);
    expect(moodAt(total + 5).mood).toBe(moodAt(5).mood);
  });

  it('handles negative and non-finite input without producing nonsense', () => {
    expect(moodAt(-1).mood).toBe('dawn');
    expect(Number.isFinite(moodAt(Number.MAX_SAFE_INTEGER).daylight)).toBe(true);
  });
});

describe('resolveMood: the player can choose the light', () => {
  it('follows the cycle when nothing is pinned', () => {
    // Ten seconds in is squarely day; thirty seconds later it is not.
    expect(resolveMood(10, 'auto', false)).toEqual(moodAt(10));
    expect(resolveMood(75, 'auto', false)).toEqual(moodAt(75));
  });

  it('pins day at full daylight even in the middle of the night', () => {
    const night = daySeconds + fadeSeconds + 5;
    expect(moodAt(night).mood).toBe('night');
    expect(resolveMood(night, 'day', false)).toEqual({ mood: 'day', daylight: 1 });
  });

  it('pins night even in the middle of the day', () => {
    expect(resolveMood(5, 'night', false)).toEqual({ mood: 'night', daylight: 0 });
  });

  it('keeps a pin indefinitely, because the player asked for a look not a moment', () => {
    // Ten full cycles later the choice must still hold.
    const far = total * 10 + 7;
    expect(resolveMood(far, 'day', false).mood).toBe('day');
    expect(resolveMood(far, 'night', false).mood).toBe('night');
  });

  it('still freezes at night under reduced motion when nothing is pinned', () => {
    expect(resolveMood(10, 'auto', true)).toEqual({ mood: 'night', daylight: 0 });
  });

  it('lets an explicit pin override reduced motion, since the player asked for day', () => {
    expect(resolveMood(10, 'day', true)).toEqual({ mood: 'day', daylight: 1 });
  });
});

it('a fade borrows the side it is travelling toward', () => {
  /*
   * Dusk and dawn are transitions with no block of their own. Without this mapping the stylesheet
   * has no palette during a fade and the tank would flash through an unpainted state twice a
   * cycle — the most visible moment to get wrong, since it is exactly when the light changes.
   */
  expect(isFadingToNight('dusk')).toBe(true);
  expect(isFadingToNight('dawn')).toBe(false);
  // Settled moods are not fades at all.
  expect(isFadingToNight('day')).toBe(false);
  expect(isFadingToNight('night')).toBe(false);
});
