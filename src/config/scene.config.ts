/** Scene budgets are presentation-only: changing quality never changes simulation state. */
export const sceneConfig = {
  seed: 8128,
  maxSteps: 5,
  maxFrameSeconds: 0.2,
  particles: 96,
  risePerSecond: 0.015,
  swayPerSecond: 0.006,
  surfaceHeight: 0.006,
  surfaceAlpha: 0.22,
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
} as const;
export type Quality = keyof typeof sceneConfig.presets;

export interface ScenePreferences {
  quality: Quality;
  reducedMotion: boolean;
}
