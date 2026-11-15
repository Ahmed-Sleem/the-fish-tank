/**
 * Sway for the pixel scenery.
 *
 * The plants are drawn as pixels on a 344x192 grid, and they have to move without being smeared
 * or rotated. That rules out the obvious approach, which is what the tank used to do: rotating a
 * whole layer about a shared pivot. Two things are wrong with it, and both are visible at once.
 *
 * - A rotated sprite's pixels land between grid cells, so every plant is resampled and the art
 *   blurs. At this scale that is the difference between pixel art and a photograph of pixel art.
 * - A rotation moves anything that is not standing on the pivot. The plants are spread across the
 *   whole width, so a layer rotated about its centre *lifts* the far-left and far-right plants off
 *   the sand and slides them sideways. The root is supposed to be the one point that never moves.
 *
 * So motion is per plant, about its own root, and quantised into poses:
 *
 *   tangent(f) = bend * f^2        f = 0 at the root, 1 at the tip
 *
 * `f^2` is the whole trick — zero at the base, largest at the tip, so the stem pivots at the sand
 * instead of sliding across it. `bend` is a small angle in radians, and the renderer has a handful
 * of pre-drawn plants at fixed bends; this module's job is to decide which pose each plant shows.
 *
 * Quantising to poses is not a shortcut, it is the technique: it keeps every pixel on the grid,
 * and it is how hand-drawn pixel animation has always worked. The alternative — a smoothly
 * interpolated transform — cannot produce a crisp pixel of motion at this scale.
 */
import { pixelConfig } from '../../config/pixel.config';

/** A plant, in art-grid pixels: where it is rooted, how tall it is, how flexible it is. */
export interface PlantAnchor {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  /** Stiffness 0..1: a tall frond moves more than a squat clump. */
  readonly give: number;
}

export interface SwayLayer {
  /** Where this layer's plants are rooted. Rocks have none: they do not sway. */
  readonly anchors: readonly PlantAnchor[];
  /** How much this layer responds overall: the far layer is deliberately sluggish. */
  readonly gain: number;
}

export interface SwayState {
  /**
   * Bend of each plant, in radians of tangent at the tip, in the same order as `anchors`.
   * Positive leans right. Zero is the resting pose.
   */
  readonly bends: readonly number[];
}

/**
 * A cheap deterministic hash of one number, into 0..1.
 *
 * Deterministic on purpose: the same plant must get the same phase every frame and every session,
 * or the tank would twitch as plants were re-laid out. The specific constants are nothing more
 * than the usual sine-fract trick, chosen to scatter neighbours rather than advance smoothly.
 */
function hash(value: number): number {
  const s = Math.sin(value * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * How far each plant is leaning this frame.
 *
 * A slow tide gives every plant a baseline drift with its **own phase**, so neighbouring fronds
 * are never in lockstep — that synchronisation is the difference between water and a wind
 * machine. The current is added on top, sampled **per plant**, so stirring the tank bends the
 * fronds near the pointer and leaves the rest alone.
 */
export function swayFor(
  layer: SwayLayer,
  seconds: number,
  flowAt: (x: number, y: number) => { x: number; y: number },
): SwayState {
  if (layer.anchors.length === 0) return { bends: [] };
  const { swaySpeed, swayTide, swayFlow, swayMaxPush, swayRateSpread } = pixelConfig;

  const bends = layer.anchors.map((anchor, index) => {
    // Sample the current at this plant, in the normalized space the flow field uses.
    const flow = flowAt(anchor.x / pixelConfig.width, anchor.y / pixelConfig.height);
    const push = Math.max(-swayMaxPush, Math.min(swayMaxPush, flow.x)) * swayFlow;

    /*
     * Each plant gets *three* independent things, and all three are needed for the motion to read
     * as a living bed rather than as an animation played on every sprite at once.
     *
     * Phase is seeded from the plant's own position, not from its index, so a plant keeps its
     * rhythm even if the list is reordered — but the seed is hashed rather than a plain linear
     * mix, because `x * 0.37 + y * 0.11` gives evenly spaced phases to evenly spaced plants,
     * which is itself a visible pattern: a wave travelling along the row.
     */
    const seed = hash(anchor.x * 0.731 + anchor.y * 1.317 + index * 2.113);
    const phase = seed * Math.PI * 2;

    /*
     * The two harmonics take *unrelated* phases. Previously the slow one used `phase * 0.6`,
     * which locks the pair into a fixed relationship: every plant traced the same closed loop and
     * merely started at a different point on it, so the whole bed still moved as one shape. Two
     * independent phases mean each plant wanders, and pairs that happen to line up drift apart.
     */
    const slowPhase = hash(seed * 7.919 + 0.37) * Math.PI * 2;

    /*
     * And each plant runs at its own rate, within a few per cent of the others. This is what stops
     * the bed re-synchronising: with one shared rate, even perfectly scattered phases fall back
     * into step whenever the two harmonics complete a common cycle. A little variance in period
     * means they never do, which is exactly how a real bed of plants behaves.
     */
    const rate = 1 + (seed - 0.5) * swayRateSpread;

    // The tide never stops; a slower second harmonic keeps it from reading as a pure sine.
    const tide = Math.sin(seconds * swaySpeed * rate + phase) * swayTide;
    const slow = Math.sin(seconds * swaySpeed * 0.37 * rate + slowPhase) * swayTide * 0.45;

    /*
     * Everything above is a *fraction* of the maximum bend, so the result stays inside the pose
     * table by construction: a still tank drifts a little, a strong current approaches the widest
     * drawn pose, and nothing can ask for a frame that does not exist.
     */
    return (tide + slow + push) * layer.gain * anchor.give * pixelConfig.plantMaxBend;
  });

  return { bends };
}

/**
 * Which pre-drawn pose a plant should show for a given bend.
 *
 * Poses run from the strongest lean left to the strongest lean right, with the resting pose in the
 * middle. The result is clamped, so no amount of current can ask for a pose that was never drawn.
 */
export function poseIndex(bend: number, poses: number = pixelConfig.plantPoses): number {
  if (poses <= 1) return 0;
  const half = (poses - 1) / 2;
  const normalised = bend / pixelConfig.plantMaxBend;
  return Math.max(0, Math.min(poses - 1, Math.round(half + normalised * half)));
}

/** The bend, in radians, that a given pose draws. The inverse of `poseIndex`, for the painter. */
export function bendForPose(pose: number, poses: number = pixelConfig.plantPoses): number {
  if (poses <= 1) return 0;
  const half = (poses - 1) / 2;
  return ((pose - half) / half) * pixelConfig.plantMaxBend;
}
