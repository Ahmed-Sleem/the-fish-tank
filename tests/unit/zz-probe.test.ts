import { expect, it } from 'vitest';
it('PROBE', () => {
  // Fails with a readable message in the "npm run test" output, which appears in annotations
  // only if vitest writes to stderr in a recognized format. Kept intentionally trivial.
  expect(process.env.CI).toBe('never');
});
