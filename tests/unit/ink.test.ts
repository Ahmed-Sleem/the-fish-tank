/**
 * Ink is charged by drawn length alone (DEC-023).
 *
 * The point of these tests is not that the numbers are pretty: it is that the two rules the owner
 * rejected cannot come back unnoticed. A thick pen must not cost more than a thin one, and
 * splitting one line into three strokes must not add a fee. If someone reintroduces a width
 * multiplier or a per-stroke charge, these fail immediately.
 */
import { describe, expect, it } from 'vitest';
import {
  affordableLength,
  effectiveLength,
  inkCost,
  isDrawable,
  normalizer,
  refusalFor,
  strokeLength,
  type Stroke,
} from '../../src/draw/ink';
import { createPurse } from '../../src/draw/purse';
import { inkConfig } from '../../src/config/ink.config';

const W = 800;
const H = 600;

/** A straight horizontal line of a given pixel length, starting at the origin. */
function line(length: number, points = 2): Stroke {
  const step = length / (points - 1);
  return { points: Array.from({ length: points }, (_, i) => ({ x: i * step, y: 0 })) };
}

describe('normalizer', () => {
  it('uses the shorter side so a phone and a monitor price the same scribble alike', () => {
    expect(normalizer(800, 600)).toBe(600);
    expect(normalizer(600, 800)).toBe(600);
  });
  it('refuses a degenerate surface instead of dividing by zero', () => {
    expect(normalizer(0, 600)).toBe(0);
    expect(normalizer(Number.NaN, 600)).toBe(0);
    expect(normalizer(-10, 600)).toBe(10);
  });
});

describe('strokeLength', () => {
  it('measures travel, not the number of points', () => {
    expect(strokeLength(line(300))).toBeCloseTo(300);
    expect(strokeLength(line(300, 31))).toBeCloseTo(300);
  });
  it('ignores a single point and non-finite glitches', () => {
    expect(strokeLength({ points: [{ x: 5, y: 5 }] })).toBe(0);
    expect(
      strokeLength({
        points: [
          { x: 0, y: 0 },
          { x: Number.NaN, y: 10 },
        ],
      }),
    ).toBe(0);
  });
});

describe('length-only pricing (DEC-023)', () => {
  it('costs the same however many strokes the same path is split into', () => {
    // Checked across several lengths on purpose: an earlier version of this test used a single
    // length where a reintroduced per-stroke fee happened to cancel out against rounding, so it
    // passed while the rejected rule was live. Every split must agree exactly.
    for (const total of [180, 240, 300, 420, 600]) {
      const one = inkCost([line(total)], W, H);
      const two = inkCost([line(total / 2), line(total / 2)], W, H);
      const four = inkCost(
        [line(total / 4), line(total / 4), line(total / 4), line(total / 4)],
        W,
        H,
      );
      expect(two, `two strokes of ${String(total)}px`).toBe(one);
      expect(four, `four strokes of ${String(total)}px`).toBe(one);
    }
  });

  it('charges nothing per stroke, even for many tiny ones', () => {
    // Twelve strokes are still just their combined length; a fee of any size shows up here.
    const many = Array.from({ length: 12 }, () => line(30));
    expect(inkCost(many, W, H)).toBe(inkCost([line(360)], W, H));
  });

  it('never charges for width, because the evaluator cannot see it', () => {
    // Width lives on the stroke data, not on the priced path; adding it changes nothing.
    const thin = { ...line(360), width: 1, color: '#111111' } as Stroke;
    const thick = { ...line(360), width: 12, color: '#ff0000' } as Stroke;
    expect(inkCost([thick], W, H)).toBe(inkCost([thin], W, H));
  });

  it('prices length linearly below the soft cap', () => {
    // 0.5 and 1.0 normalized lengths, both well under softCap = 8.
    const half = inkCost([line(H * 0.5)], W, H);
    const full = inkCost([line(H * 1)], W, H);
    expect(half).toBe(Math.round(inkConfig.base + inkConfig.rateLength * 0.5));
    expect(full).toBe(Math.round(inkConfig.base + inkConfig.rateLength * 1));
  });

  it('adds the overflow penalty only past the soft cap', () => {
    const atCap = inkCost([line(H * inkConfig.softCap)], W, H);
    const past = inkCost([line(H * (inkConfig.softCap + 1))], W, H);
    const linearGuess = Math.round(atCap + inkConfig.rateLength);
    expect(past).toBeGreaterThan(linearGuess);
  });

  it('charges nothing for an empty drawing', () => {
    expect(inkCost([], W, H)).toBe(0);
    expect(effectiveLength([{ points: [] }], W, H)).toBe(0);
  });

  it('is monotonic: more length never costs less', () => {
    let previous = 0;
    for (let i = 1; i <= 20; i += 1) {
      const cost = inkCost([line(i * 60)], W, H);
      expect(cost).toBeGreaterThanOrEqual(previous);
      previous = cost;
    }
  });
});

describe('drawability', () => {
  it('refuses a scribble shorter than the minimum', () => {
    expect(isDrawable([line(H * 0.1)], W, H)).toBe(false);
    expect(refusalFor([line(H * 0.1)], W, H, 100)).toBe('too-small');
  });
  it('accepts a real drawing and charges it', () => {
    expect(isDrawable([line(H * 2)], W, H)).toBe(true);
    expect(refusalFor([line(H * 2)], W, H, 100)).toBeNull();
  });
  it('refuses work the player cannot pay for, rather than overdrawing', () => {
    expect(refusalFor([line(H * 9)], W, H, 1)).toBe('cannot-afford');
  });
  it('treats a zero-sized surface as not ready', () => {
    expect(refusalFor([line(100)], 0, 0, 100)).toBe('no-surface');
  });
});

describe('affordableLength', () => {
  it('lands on a length whose cost fits the budget', () => {
    for (const budget of [5, 10, 25, 60, 200]) {
      const length = affordableLength(budget, W, H);
      const cost = inkCost([line(length * H)], W, H);
      expect(cost).toBeLessThanOrEqual(budget);
      // And it is not needlessly stingy: half a pixel further would overrun.
      expect(inkCost([line((length + 0.5) * H)], W, H)).toBeGreaterThan(budget - 2);
    }
  });
  it('allows nothing without a surface or a budget', () => {
    expect(affordableLength(50, 0, 0)).toBe(0);
    expect(affordableLength(0, W, H)).toBe(0);
    expect(affordableLength(-5, W, H)).toBe(0);
  });
});

describe('purse', () => {
  it('starts from the configured wallet and never goes negative', () => {
    const purse = createPurse(inkConfig.startInk);
    expect(purse.available()).toBe(inkConfig.startInk);
    expect(purse.reserve(inkConfig.startInk + 1)).toBe(false);
    expect(purse.available()).toBe(inkConfig.startInk);
  });

  it('holds a reservation so the same coins cannot be spent twice', () => {
    const purse = createPurse(20);
    expect(purse.reserve(15)).toBe(true);
    expect(purse.available()).toBe(5);
    expect(purse.reserve(10)).toBe(false);
    expect(purse.state()).toEqual({ balance: 20, reserved: 15 });
  });

  it('commits a reservation exactly once', () => {
    const purse = createPurse(20);
    purse.reserve(15);
    expect(purse.commit(15)).toBe(true);
    expect(purse.state()).toEqual({ balance: 5, reserved: 0 });
    expect(purse.commit(15)).toBe(false);
    expect(purse.state()).toEqual({ balance: 5, reserved: 0 });
  });

  it('returns every coin when a drawing is cancelled', () => {
    const purse = createPurse(20);
    purse.reserve(15);
    purse.release(15);
    expect(purse.state()).toEqual({ balance: 20, reserved: 0 });
    expect(purse.available()).toBe(20);
  });

  it('refunds exactly what undo removes and nothing more', () => {
    const purse = createPurse(20);
    purse.reserve(9);
    purse.commit(9);
    purse.refund(6);
    expect(purse.state().balance).toBe(17);
    purse.refund(-5);
    purse.refund(Number.NaN);
    expect(purse.state().balance).toBe(17);
  });

  it('earns without touching reservations', () => {
    const purse = createPurse(10);
    purse.reserve(4);
    purse.earn(5);
    expect(purse.state()).toEqual({ balance: 15, reserved: 4 });
    expect(purse.available()).toBe(11);
  });
});
