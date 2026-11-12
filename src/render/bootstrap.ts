/** S03 scene ownership and asynchronous cancellation. */
import 'pixi.js/browser';
import { AccessibilitySystem, Application, extensions } from 'pixi.js';
import { appConfig } from '../config/app.config';
import { mountScene } from './scene';
import type { Settings } from '../ui/settings';
import { startSession } from './session';
import { withStartupCeiling } from './startup';

// This empty canvas is decorative. All meaningful content is accessible HTML.
// Do not let Pixi add an off-screen mobile activation button for an empty stage.
// Revisit the canvas accessibility policy when interactive entities arrive.
extensions.remove(AccessibilitySystem);

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
        await withStartupCeiling(
          app.init({
            ...appConfig.renderer,
            resolution: Math.min(window.devicePixelRatio, appConfig.renderer.maxResolution),
          }),
          appConfig.loading.startupTimeoutMs,
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
