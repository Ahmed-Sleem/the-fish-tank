/**
 * Sway for the pixel scenery.
 *
 * The art is drawn once into layered canvases; this is what makes it move afterwards. Each layer
 * is rotated about a different point, which is what gives the tank depth: the far moss barely
 * shifts, while a tall frond leans a couple of pixels at its tip and not at all at its root.
 *
 * Two rules make it read as water rather than as wobbling stickers:
 * - rotation happens about the *root*, so nothing detaches from the sand;
 * - the motion is driven by the same flow field the particles sample, so stirring the water bends
 *   the plants, and a still tank is nearly still.
 */
import { pixelConfig } from '../../config/pixel.config';

export interface SwayLayer {
  /** Anchor positions in art-grid pixels: the points that must not move. */
  readonly anchors: readonly { readonly x: number; readonly y: number; readonly give: number }[];
  /** How much this layer responds overall: the far layer is deliberately sluggish. */
  readonly gain: number;
}

export interface SwayState {
  /** Rotation in radians, applied to the whole layer about its mid-line. */
  readonly angle: number;
  /** Horizontal offset in art-grid pixels, a fraction of one pixel. */
  readonly offsetX: number;
}

/**
 * Where a layer should be, given the current flow and the time.
 *
 * `flowAt` is sampled once per layer at a few stems and averaged, which is cheaper than per-pixel
 * displacement and produces the gentle *whole plant leans* motion the reference shows. The sine
 * term is the tide's own drift, so the tank never looks frozen when the pointer is idle.
 */
export function swayFor(
  layer: SwayLayer,
  seconds: number,
  flowAt: (x: number, y: number) => { x: number; y: number },
): SwayState {
  if (layer.anchors.length === 0) return { angle: 0, offsetX: 0 };
  let flowX = 0;
  for (const anchor of layer.anchors) {
    // Sample in the normalized 0..1 space the flow field uses.
    const sample = flowAt(anchor.x / pixelConfig.width, anchor.y / pixelConfig.height);
    flowX += sample.x;
  }
  flowX /= layer.anchors.length;

  // A slow tide plus the current's own push. The heights differ per anchor, so the lean is
  // weighted by how tall the plant is: a 90px stem travels further than a 20px clump.
  const tide = Math.sin(seconds * pixelConfig.swaySpeed) * pixelConfig.swayIdle;
  // A fast stroke can put an arbitrarily large value in the flow field, and multiplying that by
  // a plant's give would throw it clear of the sand. The push is clamped before it is applied:
  // plants bend in a current, they are not flags in a gale.
  const push =
    Math.max(-pixelConfig.swayMaxPush, Math.min(pixelConfig.swayMaxPush, flowX)) *
    pixelConfig.swayFlow;
  const lean = (tide + push) * layer.gain;

  return {
    // Rotation is tiny: at this grid scale, a few hundredths of a radian is already a visible
    // bend at the tip, and more than that looks like wind.
    angle: lean * 0.12,
    // A sub-pixel slide keeps the layered parallax reading without smearing the pixel art.
    offsetX: lean * 0.9,
  };
}

/** Applies a sway state to a display object, keeping its placement stable across frames. */
export interface SwayTarget {
  rotation: number;
  x: number;
}

export function applySway(target: SwayTarget, state: SwayState, baseX: number): void {
  target.rotation = state.angle;
  target.x = baseX + state.offsetX;
}
