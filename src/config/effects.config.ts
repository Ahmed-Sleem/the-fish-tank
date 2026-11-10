/** S04 shared budgets: capped input and presentation work; simulation always 30Hz. */
export const effectsConfig = {
  damping: 0.985,
  waveSpeed: 0.45,
  maxHeight: 0.5,
  maxVelocity: 0.2,
  radius: 0.055,
  hoverStrength: 0.025,
  pressStrength: 0.12,
  flowSize: [48, 27],
  flowSpeed: 0.012,
  flowDecay: 0.9,
  flowImpulse: 0.04,
  causticIntensity: 0.13,
  causticScale: 5,
  causticSpeed: 0.4,
  displacement: 0.018,
  presets: {
    low: { grid: 48, resolution: 0.5, maxWidth: 240, caustics: 0.35, rays: 0.25 },
    medium: { grid: 80, resolution: 0.75, maxWidth: 360, caustics: 0.7, rays: 0.5 },
    high: { grid: 128, resolution: 1, maxWidth: 640, caustics: 1, rays: 0.7 },
  },
} as const;
