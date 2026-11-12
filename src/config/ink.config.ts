/**
 * Ink prices a drawing by its length alone (DEC-023).
 *
 * Pen width and colour are free, and lifting the pen between strokes costs nothing extra, so a
 * drawing is worth exactly the distance it was drawn. Length is normalized by the shorter side
 * of the canvas, which makes the same scribble cost the same on a phone and on a monitor.
 */
import { balanceConfig } from './balance.config';

export const inkConfig = {
  /** Charged once for any accepted drawing, however small. */
  base: 4,
  /** Coins per normalized canvas side of drawn length. */
  rateLength: 1.5,
  /** Past this much normalized length the overdraft term starts to bite. */
  softCap: 8,
  /** Exponent on the overflow term: generous drawings get expensive quickly, not linearly. */
  overPenalty: 1.5,
  rateOver: 1.0,
  /** Below this the drawing is refused with a nudge rather than charged. */
  minimumLength: 0.6,
  /** Everything is rounded to whole coins, and never away from what the player can pay. */
  decimals: 0,
  startInk: balanceConfig.startMoney,
} as const;

/**
 * Pen widths in pixels at a 1000px reference side, and the colours offered.
 *
 * Widths are free by design (DEC-023), so they exist for expression only and never appear in a
 * price. Colours are plain hex so the drawing can later be snapshotted onto white exactly as it
 * was drawn, which is what the cutout step expects.
 */
export const penOptions = {
  referenceSide: 1000,
  widths: [2.5, 5, 9] as const,
  defaultWidth: 5,
  colours: ['#14384d', '#1f6f6b', '#e0a33c', '#c8563f', '#6d5a8c', '#ffffff'] as const,
  defaultColour: '#14384d',
} as const;
