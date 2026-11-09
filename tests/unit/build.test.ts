/** Commit labels reject arbitrary content and identify exactly the deployed source. */
import { describe, expect, it } from 'vitest';
import { buildLabel } from '../../src/core/build';

describe('public build label', () => {
  it('normalizes a commit to seven lowercase hex characters', () => {
    expect(buildLabel('ABCDEF1234567890')).toBe('abcdef1');
  });
  it.each(['', 'abc', 'not-a-revision', '<script>', 'abcdefg', 'a'.repeat(41)])(
    'rejects invalid revision %s',
    (revision) => {
      expect(buildLabel(revision)).toBe('local');
    },
  );
});
