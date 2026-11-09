/** Own async renderer startup and cancellation without coupling simulation to Pixi. */
export interface RendererSession {
  initialize: () => Promise<void>;
  dispose: () => void;
}

export async function startSession(
  session: RendererSession,
  signal: AbortSignal,
): Promise<boolean> {
  // Re-read through a function: AbortSignal can change while initialize is awaited.
  const cancelled = () => signal.aborted;
  if (cancelled()) return false;
  let initialized = false;
  try {
    await session.initialize();
    initialized = true;
    if (cancelled()) {
      session.dispose();
      return false;
    }
    signal.addEventListener('abort', session.dispose, { once: true });
    return true;
  } catch (error) {
    if (!initialized) session.dispose();
    throw error;
  }
}
