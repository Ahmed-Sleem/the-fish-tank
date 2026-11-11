/** Lightweight, bounded splash: no graphics dependency while Pixi downloads.
 * The product title lives here and nowhere else, so the tank opens uninterrupted.
 */
import { appConfig } from '../../config/app.config';
import { strings } from '../../config/strings.en';
import { element } from './dom';
import { mountOimoWater } from '../../render/water/oimo-view';
import { waterConfig } from '../../config/water.config';

/** Both conditions must finish; no arbitrary maximum hides unfinished initialization. */
export async function waitForStartup(ready: Promise<unknown>, minimumMs: number): Promise<void> {
  await Promise.all([ready, new Promise((resolve) => setTimeout(resolve, minimumMs))]);
}

export function createLoadingScreen(root: HTMLElement) {
  const controller = new AbortController();
  const { signal } = controller;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const overlay = element('div', 'loading-screen');
  overlay.setAttribute('aria-label', strings.loading);
  const content = element('div', 'loading-content');
  const title = element('p', 'loading-title', strings.brand);
  const word = element('span', 'loading-word', strings.loading.slice(0, 1));
  word.setAttribute('aria-hidden', 'true');
  const accessible = element('span', 'sr-only', strings.loading);
  accessible.setAttribute('role', 'status');
  content.append(title, word, accessible);
  overlay.append(content);
  document.body.append(overlay);
  mountOimoWater(overlay, signal);
  root.inert = true;
  root.setAttribute('aria-busy', 'true');
  let letter = 1;
  let interval: number | undefined;
  const updateMotion = () => {
    clearInterval(interval);
    letter = 1;
    word.textContent = motion.matches ? strings.loading : strings.loading.slice(0, 1);
    if (!motion.matches)
      interval = window.setInterval(() => {
        letter = (letter % (strings.loading.length + waterConfig.endHold)) + 1;
        word.textContent = strings.loading.slice(0, Math.min(letter, strings.loading.length));
      }, waterConfig.letterMs);
  };
  motion.addEventListener('change', updateMotion, { signal });
  updateMotion();
  signal.addEventListener(
    'abort',
    () => {
      clearInterval(interval);
    },
    { once: true },
  );
  const pageReady =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          window.addEventListener(
            'load',
            () => {
              resolve();
            },
            { once: true, signal },
          );
        });
  const dispose = () => {
    controller.abort();
    overlay.remove();
    root.inert = false;
    root.removeAttribute('aria-busy');
  };
  return {
    dispose,
    async finish(ready: Promise<unknown>) {
      try {
        await waitForStartup(Promise.all([ready, pageReady]), appConfig.loading.minimumMs);
      } finally {
        dispose();
      }
    },
  };
}
