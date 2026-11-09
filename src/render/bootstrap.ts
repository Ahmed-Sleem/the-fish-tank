/** S01 only starts an empty Pixi canvas; layers and fixed-step simulation belong to S03. */
import 'pixi.js/browser';
import { AccessibilitySystem, Application, extensions } from 'pixi.js';
import { appConfig } from '../config/app.config';
import { startSession } from './session';

// This empty canvas is decorative. All meaningful content is accessible HTML.
// Do not let Pixi add an off-screen mobile activation button for an empty stage.
// Revisit the canvas accessibility policy when interactive entities arrive.
extensions.remove(AccessibilitySystem);

export async function startRenderer(host: HTMLElement, signal: AbortSignal): Promise<boolean> {
  if (signal.aborted) return false;
  const app = new Application();
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    // Pixi declares renderer as initialized, but init() can reject before assigning it.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime async-init boundary
    if (app.renderer) app.destroy(true, { children: true });
    else app.stage.destroy({ children: true });
  };
  return startSession(
    {
      initialize: async () => {
        await app.init({
          ...appConfig.renderer,
          resolution: Math.min(window.devicePixelRatio, appConfig.renderer.maxResolution),
          resizeTo: host,
        });
        app.canvas.setAttribute('aria-hidden', 'true');
        host.append(app.canvas);
        app.render();
      },
      dispose,
    },
    signal,
  );
}
