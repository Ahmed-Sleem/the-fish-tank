/** Queue/model-selection starting points only. No adapter or provider request is enabled in S02. */
export const aiConfig = {
  providers: ['gemini', 'openai', 'anthropic', 'openrouter'],
  defaultProvider: 'gemini',
  preferredModelNames: { text: 'flash', image: 'image' },
  concurrency: { image: 1, text: 2 },
  requestsPerMinute: 8,
  callsPerDay: 40,
  maxRetries: 3,
  repairRetries: 1,
  priorities: { birth: 0, growth: 1, offspring: 2, plant: 3, 'flavor-text': 4 },
} as const;
