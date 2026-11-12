/**
 * Ink accounting: what a drawing costs, and the purse that pays for it.
 *
 * The evaluator is pure and has no notion of a screen, so the live estimate shown while drawing
 * and the final charge use the same arithmetic — a stroke cannot appear cheaper and then cost
 * more once the pen lifts. Cost is a function of length only (DEC-023).
 */
import { inkConfig } from '../config/ink.config';

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** A stroke is just the path it travelled; width and colour deliberately do not affect price. */
export interface Stroke {
  readonly points: readonly Point[];
}

/**
 * Shortest side of the drawing surface in pixels.
 *
 * Returns 0 for a degenerate surface, which callers must treat as "cannot draw yet" rather than
 * as a division target: `Number.isFinite` guards the normalizing step below.
 */
export function normalizer(width: number, height: number): number {
  if (!Number.isFinite(width) || !Number.isFinite(height)) return 0;
  return Math.min(Math.abs(width), Math.abs(height));
}

function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

/** Raw travel in pixels, ignoring points that are not finite so a glitch cannot inflate a bill. */
export function strokeLength(stroke: Stroke): number {
  let total = 0;
  for (let i = 1; i < stroke.points.length; i += 1) {
    const a = stroke.points[i - 1];
    const b = stroke.points[i];
    if (!a || !b) continue;
    if (!Number.isFinite(a.x) || !Number.isFinite(a.y)) continue;
    if (!Number.isFinite(b.x) || !Number.isFinite(b.y)) continue;
    total += distance(a, b);
  }
  return total;
}

/** Normalized length of every stroke, the single quantity the price depends on. */
export function effectiveLength(strokes: readonly Stroke[], width: number, height: number): number {
  const side = normalizer(width, height);
  if (side === 0) return 0;
  let total = 0;
  for (const stroke of strokes) total += strokeLength(stroke);
  return total / side;
}

function round(value: number): number {
  const factor = 10 ** inkConfig.decimals;
  return Math.round(value * factor) / factor;
}

/** Exact price in coins. Monotonic in length, and never negative. */
export function inkCost(strokes: readonly Stroke[], width: number, height: number): number {
  const length = effectiveLength(strokes, width, height);
  if (length <= 0) return 0;
  const overflow = Math.max(0, length - inkConfig.softCap);
  const cost =
    inkConfig.base +
    inkConfig.rateLength * length +
    inkConfig.rateOver * overflow ** inkConfig.overPenalty;
  return round(cost);
}

/** Whether a drawing is substantial enough to accept. Rejected work is never charged. */
export function isDrawable(strokes: readonly Stroke[], width: number, height: number): boolean {
  return effectiveLength(strokes, width, height) >= inkConfig.minimumLength;
}

/**
 * How much normalized length a budget can pay for.
 *
 * Prices are rounded to whole coins, so solving the closed form alone overshoots by a coin: a
 * budget of 25 yields a length priced at 31 after rounding. The closed form is therefore only the
 * starting guess, refined downward until the *rounded* price fits. The pen uses this to stop
 * adding ink at the moment the drawing becomes unaffordable, instead of letting a player finish
 * work they cannot pay for.
 */
export function affordableLength(budget: number, width: number, height: number): number {
  if (!Number.isFinite(budget) || budget <= 0) return 0;
  const side = normalizer(width, height);
  if (side === 0) return 0;
  const costOf = (length: number): number => {
    const overflow = Math.max(0, length - inkConfig.softCap);
    return round(
      inkConfig.base +
        inkConfig.rateLength * length +
        inkConfig.rateOver * overflow ** inkConfig.overPenalty,
    );
  };
  if (costOf(0) > budget) return 0;
  // Closed form: the overflow term only applies past the soft cap, so the two ranges differ.
  const linearLimit = (budget - inkConfig.base) / inkConfig.rateLength;
  let guess: number;
  if (linearLimit <= inkConfig.softCap) {
    guess = Math.max(0, linearLimit);
  } else {
    const spendable = Math.max(
      0,
      budget - inkConfig.base - inkConfig.rateLength * inkConfig.softCap,
    );
    guess = inkConfig.softCap + (spendable / inkConfig.rateOver) ** (1 / inkConfig.overPenalty);
  }
  // Refine on a thousandth-of-a-canvas grid rather than on raw doubles. An exact real-valued
  // supremum is useless here: the last representable step below it sums to *exactly* the rounding
  // boundary (4 + 1.5 * L lands on 5.5), so the price jumps a coin above the budget. Searching
  // integers means the value that is checked is literally the value that is returned.
  const micro = 1000;
  let low = 0;
  let high = Math.ceil(Math.max(guess * 2, 1) * micro);
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (costOf(mid / micro) <= budget) low = mid;
    else high = mid - 1;
  }
  return low / micro;
}

export type InkRefusal = 'too-small' | 'cannot-afford' | 'no-surface';

/** Why a drawing cannot be committed, or null when it can. */
export function refusalFor(
  strokes: readonly Stroke[],
  width: number,
  height: number,
  balance: number,
): InkRefusal | null {
  if (normalizer(width, height) === 0) return 'no-surface';
  if (!isDrawable(strokes, width, height)) return 'too-small';
  return inkCost(strokes, width, height) > balance ? 'cannot-afford' : null;
}
