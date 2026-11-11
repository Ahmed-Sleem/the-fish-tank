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

  // Drawing: the words the player reads while making a fish. Plain and few, in the same voice
  // as the rest of the interface; nothing here describes internals.
  drawOpen: 'Draw a fish',
  drawTitle: 'Draw your fish',
  drawHint: 'Draw your fish facing right.',
  drawDone: 'Done',
  drawUndo: 'Undo',
  drawClear: 'Clear',
  drawCancel: 'Cancel',
  drawToolPen: 'Pen',
  drawToolColour: 'Colour',
  drawInkLabel: 'Ink',
  drawCostLabel: 'This drawing',
  drawTooSmall: 'Draw a little more',
  drawTooBig: 'Not enough ink for that',
  drawLeft: 'ink left',
  drawNoSurface: 'The drawing surface is not ready yet.',

  linksSection: 'More',
  credits: 'Open-source credits',
  source: 'Source code',
  plan: 'Build plan',
  privacy: 'Nothing leaves this browser.',
} as const;
