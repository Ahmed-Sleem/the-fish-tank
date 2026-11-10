/** Oimo's APIC parameters retained unless marked as a loader-specific budget. */
export const waterConfig = {
  cells: 1100,
  maxWidth: 60,
  maxHeight: 44, // bounded loader budget, not upstream's 262144 cells
  spacing: 0.5,
  density: 4,
  gravity: 0.0075,
  substeps: 2,
  aerationThreshold: 0.7,
  aerationCoefficient: 20,
  aerationBlur: 0.01,
  aerationDamping: 0.992,
  pressure: 5,
  pointerRadius: 5,
  maxPointerVelocity: 2,
  maxResolution: 1,
  frameMs: 1000 / 24,
  grain: 0.45, // static fragment dither: no texture allocation or animation pass
  letterMs: 170,
  endHold: 3,
  seed: 2026,
} as const;
