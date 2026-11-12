/**
 * A ceiling for renderer initialization.
 *
 * GPU drivers do occasionally never resolve renderer creation, and Playwright's own runner can
 * stall on it. Waiting patiently there is not resilience: it is a loading screen with no exit.
 * The tank without water is a visible, actionable failure; a splash that never leaves is not.
 *
 * Kept separate from Pixi so the behaviour can be tested for real, without a GPU and without
 * pretending a Promise-returning `createProgram` is the same thing as a wedged driver.
 */
export async function withStartupCeiling<T>(
  work: Promise<T>,
  timeoutMs: number,
  onTimeout: () => void = () => undefined,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          onTimeout();
          reject(new Error(`Renderer startup timed out after ${String(timeoutMs)}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    // Clearing on every path keeps a rejected promise from holding the timer, and stops a stale
    // timer from firing mid-session after a successful start.
    clearTimeout(timer);
  }
}
