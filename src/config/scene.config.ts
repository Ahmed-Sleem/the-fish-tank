/** Scene budgets are presentation-only: changing quality never changes simulation state. */
export const sceneConfig = {
  seed: 8128,
  maxSteps: 5,
  maxFrameSeconds: 0.2,
  particles: 96,
  risePerSecond: 0.015,
  swayPerSecond: 0.006,
  /** Light band at the water surface, as a fraction of the viewport height. */
  surfaceHeight: 0.14,
  surfaceAlpha: 0.16,
  /** Soft, stacked falloff: a band, not a rule. */
  surfaceBand: 0.018,
  surfaceLayers: 4,
  /** Particle dot radii in the normalized 344×192 reference grid, not screen pixels. */
  particleSizeLarge: 3.2,
  particleSizeSmall: 1.6,
  presets: {
    low: { resolution: 1, particles: 16 },
    medium: { resolution: 1.5, particles: 48 },
    high: { resolution: 2, particles: 96 },
  },
  defaultQuality: 'medium',
  layers: [
    'background',
    'light',
    'backdrop',
    'plants',
    'creatures',
    'particles',
    'foreground',
    'caustics',
    'surface',
    'glass',
  ],
  /** Day/night cycle from the owner's reference: 45s day, 15s fade, 45s night, 15s fade. */
  cycle: {
    daySeconds: 45,
    fadeSeconds: 15,
    nightSeconds: 45,
  },
} as const;
export type Quality = keyof typeof sceneConfig.presets;

export interface ScenePreferences {
  quality: Quality;
  reducedMotion: boolean;
}

export type Mood = 'day' | 'dusk' | 'night' | 'dawn';

/** Single definition of the cycle maths: the renderer and the theme attribute both use it,
 * so the water and the CSS tokens can never disagree about what time it is.
 */
export function moodAt(elapsedSeconds: number): { mood: Mood; daylight: number } {
  const { daySeconds, fadeSeconds, nightSeconds } = sceneConfig.cycle;
  const total = daySeconds + fadeSeconds + nightSeconds + fadeSeconds;
  const t = ((elapsedSeconds % total) + total) % total;
  if (t < daySeconds) return { mood: 'day', daylight: 1 };
  if (t < daySeconds + fadeSeconds)
    return { mood: 'dusk', daylight: 1 - (t - daySeconds) / fadeSeconds };
  if (t < daySeconds + fadeSeconds + nightSeconds) return { mood: 'night', daylight: 0 };
  return { mood: 'dawn', daylight: (t - daySeconds - fadeSeconds - nightSeconds) / fadeSeconds };
}
