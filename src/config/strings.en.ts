/** English copy is centralized so the interface can be translated later.
 * Nothing here may present an unimplemented feature as usable.
 */
export const strings = {
  brand: 'the fish tank',
  loading: 'loading',
  aquarium: 'Aquarium',
  skip: 'Skip to aquarium',

  settings: 'Settings',
  openSettings: 'Open settings',
  close: 'Close',

  quality: 'Visual quality',
  qualityLow: 'Low',
  qualityMedium: 'Medium',
  qualityHigh: 'High',
  reducedMotion: 'Reduce motion',
  displaySection: 'Display',

  fullscreen: 'Fullscreen',
  exitFullscreen: 'Exit fullscreen',
  fullscreenUnavailable: 'Fullscreen is unavailable in this browser.',
  windowSection: 'Window',

  buildSection: 'This build',
  schemaLabel: 'Data format',
  dataFormat: 'Version',
  runtimeLabel: 'Graphics',
  rendererStarting: 'Starting graphics…',
  rendererReady: 'Ready',
  rendererDegraded: 'Water effects unavailable — the tank is shown without them',
  rendererFailed: 'Graphics unavailable in this browser',
  rendererLost: 'Graphics interrupted — reload to restart',
  localRevision: 'local',

  /** Honest about what is not available, in player language: no feature checklist, no roadmap. */
  capabilities: 'Fish, drawing and saved tanks arrive in later updates.',

  linksSection: 'More',
  credits: 'Open-source credits',
  source: 'Source code',
  plan: 'Build plan',
  privacy: 'Nothing leaves this browser.',
} as const;
