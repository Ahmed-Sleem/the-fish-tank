/** English copy is centralized so the overlay can be translated later. */
export const strings = {
  settings: 'Settings',
  quality: 'Visual quality',
  qualityLow: 'Low',
  qualityMedium: 'Medium',
  qualityHigh: 'High',
  reducedMotion: 'Reduce motion',
  settingsHelp:
    'Quality changes particle density, ripple detail and lighting resolution, not simulation speed. Your system reduced-motion preference is always respected. Settings apply for this visit.',
  credits: 'Open-source credits',
  buildDetails: 'About this build',
  close: 'Close',
  buildTools: 'Build information',
  schemaLabel: 'Data format',
  dataFormat: 'Version',
  runtimeLabel: 'Graphics',
  capabilities:
    'This is a foundation preview. Drawing, fish and saved tanks are not available yet. No AI calls or uploads are made.',
  loading: 'loading',
  brand: 'the fish tank',
  aquarium: 'Aquarium',
  emptyTank:
    'Move your cursor through the water, or tap and drag to make ripples. Your creatures will arrive in a future build.',
  interfaceTools: 'Aquarium controls',
  fullscreen: 'Fullscreen',
  exitFullscreen: 'Exit fullscreen',
  fullscreenUnavailable:
    'Fullscreen is unavailable in this browser. The aquarium still fills the window.',
  liveLabel: 'AQUARIUM STATUS',
  rendererStarting: 'Starting the renderer…',
  rendererReady: 'PixiJS renderer ready',
  rendererFailed:
    'Graphics unavailable in this browser. Try a WebGL-enabled browser to see the canvas.',
  rendererLost: 'Graphics context interrupted. Reload this page to restart the renderer.',
  source: 'Explore the source',
  plan: 'Read the build plan',
  privacy: 'No AI calls. No uploads. Just the beginning.',
  revisionPrefix: 'BUILD',
  localRevision: 'local',
  skip: 'Skip to aquarium',
} as const;
