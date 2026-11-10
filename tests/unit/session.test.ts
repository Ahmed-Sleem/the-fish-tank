/** Async renderer ownership must not leak through cancellation, failure or hot reload. */
import { describe, expect, it, vi } from 'vitest';
import { startSession } from '../../src/render/session';

function pendingSession() {
  let resolve: () => void = () => {
    throw new Error('Initialization not started');
  };
  const initialize = vi.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  const dispose = vi.fn();
  return {
    session: { initialize, dispose },
    complete: () => {
      resolve();
    },
  };
}

describe('renderer lifecycle', () => {
  it('does not initialize after cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    const session = { initialize: vi.fn().mockResolvedValue(undefined), dispose: vi.fn() };
    expect(await startSession(session, controller.signal)).toBe(false);
    expect(session.initialize).not.toHaveBeenCalled();
  });
  it('disposes if cancelled during asynchronous initialization', async () => {
    const controller = new AbortController();
    const { session, complete } = pendingSession();
    const result = startSession(session, controller.signal);
    controller.abort();
    complete();
    expect(await result).toBe(false);
    expect(session.dispose).toHaveBeenCalledExactlyOnceWith();
  });
  it('disposes once when a ready session is cancelled', async () => {
    const controller = new AbortController();
    const { session, complete } = pendingSession();
    const result = startSession(session, controller.signal);
    complete();
    expect(await result).toBe(true);
    controller.abort();
    controller.abort();
    expect(session.dispose).toHaveBeenCalledOnce();
  });
  it('cleans up failed initialization and propagates the original error', async () => {
    const failure = new Error('No WebGL');
    const session = { initialize: vi.fn().mockRejectedValue(failure), dispose: vi.fn() };
    await expect(startSession(session, new AbortController().signal)).rejects.toBe(failure);
    expect(session.dispose).toHaveBeenCalledOnce();
  });
});
