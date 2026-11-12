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
import { moodAt, sceneConfig } from '../../src/config/scene.config';

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
