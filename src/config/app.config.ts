/** Public application identity and renderer limits; not simulation balance. */
export const appConfig = {
  repository: 'https://github.com/Ahmed-Sleem/the-fish-tank',
  branch: 'arena/f3e87408-the-fish-tank',
  renderer: {
    maxResolution: 2,
    backgroundAlpha: 0,
    autoStart: false,
    preference: 'webgl',
    antialias: true,
  },
} as const;
