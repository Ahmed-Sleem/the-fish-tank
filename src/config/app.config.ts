/** Public application identity and renderer limits; not simulation balance. */
export const appConfig = {
  repository: 'https://github.com/Ahmed-Sleem/the-fish-tank',
  branch: 'main',
  loading: {
    minimumMs: 5000,
    /**
     * How long the renderer may take before the app gives up and shows the tank without it.
     *
     * Without a ceiling, a driver that never completes initialization — a real possibility on
     * some GPU/driver combinations, and what a headless runner can hit — leaves the loading
     * screen up forever with no way out. A tank without water is a much better failure than a
     * splash that never leaves.
     */
    startupTimeoutMs: 15000,
  },
  renderer: {
    maxResolution: 2,
    backgroundAlpha: 0,
    autoStart: false,
    preference: 'webgl',
    antialias: true,
  },
} as const;
