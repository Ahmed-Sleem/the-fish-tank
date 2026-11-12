/**
 * The startup ceiling, tested as the behaviour it is.
 *
 * This exists because the first attempt to prove it used a browser test that replaced
 * `createProgram` with a Promise — which is not a hung driver, it is an invalid return value that
 * breaks things downstream, and it made the whole suite flaky on a GPU runner. A ceiling is a
 * plain promise race; it deserves a plain test.
 */
import { describe, expect, it, vi } from 'vitest';
import { withStartupCeiling } from '../../src/render/startup';

describe('withStartupCeiling', () => {
  it('passes a successful result straight through', async () => {
    await expect(withStartupCeiling(Promise.resolve('ready'), 50)).resolves.toBe('ready');
  });

  it('rejects with a timeout when the work never settles', async () => {
    vi.useFakeTimers();
    try {
      const never = new Promise<string>(() => undefined);
      const pending = withStartupCeiling(never, 1000);
      const assertion = expect(pending).rejects.toThrow(/timed out after 1000ms/);
      await vi.advanceTimersByTimeAsync(1000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('reports the timeout once, so a caller can show its own message', async () => {
    vi.useFakeTimers();
    try {
      const onTimeout = vi.fn();
      const pending = withStartupCeiling(new Promise(() => undefined), 500, onTimeout);
      const assertion = expect(pending).rejects.toThrow();
      await vi.advanceTimersByTimeAsync(500);
      await assertion;
      expect(onTimeout).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears its timer after success, so nothing fires later in the session', async () => {
    vi.useFakeTimers();
    try {
      const onTimeout = vi.fn();
      await withStartupCeiling(Promise.resolve(1), 100, onTimeout);
      await vi.advanceTimersByTimeAsync(5000);
      expect(onTimeout).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('propagates a genuine initialization error instead of masking it as a timeout', async () => {
    await expect(withStartupCeiling(Promise.reject(new Error('no context')), 1000)).rejects.toThrow(
      'no context',
    );
  });
});
