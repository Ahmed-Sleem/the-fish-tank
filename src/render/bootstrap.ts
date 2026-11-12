/** S03 scene ownership and asynchronous cancellation. */
import 'pixi.js/browser';
import { AccessibilitySystem, Application, extensions } from 'pixi.js';
import { appConfig } from '../config/app.config';
import { mountScene } from './scene';
import type { Settings } from '../ui/settings';
import { startSession } from './session';

// This empty canvas is decorative. All meaningful content is accessible HTML.
// Do not let Pixi add an off-screen mobile activation button for an empty stage.
// Revisit the canvas accessibility policy when interactive entities arrive.
extensions.remove(AccessibilitySystem);

/**
 * Give initialization a hard ceiling.
 *
 * GPU drivers do occasionally never resolve renderer creation. Waiting patiently there is not
 * resilience, it is a stuck loading screen with no exit. A tank without water is the better
 * failure, and it is one the player can see and act on. The timer is cleared on success so it
 * cannot fire during a long session.
 */
async function raceStartup<T>(work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('Renderer startup timed out'));
        }, appConfig.loading.startupTimeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function startRenderer(
  host: HTMLElement,
  signal: AbortSignal,
  settings: Settings,
): Promise<boolean> {
  if (signal.aborted) return false;
  const app = new Application();
  let disposed = false;
  let scene: ReturnType<typeof mountScene> | undefined;
  let unsubscribe: (() => void) | undefined;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    unsubscribe?.();
    scene?.dispose();
    // Pixi declares renderer as initialized, but init() can reject before assigning it.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime async-init boundary
    if (app.renderer) app.destroy(true, { children: true });
    else app.stage.destroy({ children: true });
  };
  return startSession(
    {
      initialize: async () => {
        // Fail fast rather than hang: a driver that never completes initialization would
        // otherwise hold the loading screen up forever, leaving no way into the tank. main.ts
        // catches the rejection and reports the failure instead of keeping the splash.
        await raceStartup(
          app.init({
            ...appConfig.renderer,
            resolution: Math.min(window.devicePixelRatio, appConfig.renderer.maxResolution),
          }),
        );
        app.canvas.setAttribute('aria-hidden', 'true');
        host.append(app.canvas);
        scene = mountScene(app, host, settings.get());
        unsubscribe = settings.subscribe((value) => {
          scene?.configure(value);
        });
        app.canvas.addEventListener(
          'webglcontextlost',
          () => {
            scene?.dispose();
          },
          { signal },
        );
      },
      dispose,
    },
    signal,
  );
}
