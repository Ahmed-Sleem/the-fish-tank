/** Lightweight, bounded splash: no graphics dependency while Pixi downloads. */
import { appConfig } from '../../config/app.config';
import { strings } from '../../config/strings.en';
import { element } from './dom';

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
  const pool = element('div', 'loading-pool');
  pool.setAttribute('aria-hidden', 'true');
  const drop = element('div', 'loading-drop');
  pool.append(drop);
  const caption = element('div', 'loading-caption');
  caption.append(element('span', 'wordmark', strings.brand), element('p', '', strings.loading));
  const hint = element('p', 'loading-hint', strings.loadingHint);
  hint.setAttribute('aria-hidden', 'true');
  caption.append(hint);
  overlay.append(pool, caption);
  document.body.append(overlay);
  root.inert = true;
  root.setAttribute('aria-busy', 'true');
  let lastRipple = -Infinity;
  const clearRipples = () => {
    pool.querySelectorAll('.loading-ripple').forEach((node) => {
      node.remove();
    });
  };
  motion.addEventListener('change', clearRipples, { signal });
  overlay.addEventListener(
    'pointermove',
    (event) => {
      if (motion.matches || event.timeStamp - lastRipple < appConfig.loading.rippleIntervalMs)
        return;
      lastRipple = event.timeStamp;
      if (pool.childElementCount > appConfig.loading.maxRipples) pool.children[1]?.remove();
      const ripple = element('span', 'loading-ripple');
      ripple.style.left = `${String(event.clientX)}px`;
      ripple.style.top = `${String(event.clientY)}px`;
      ripple.addEventListener(
        'animationend',
        () => {
          ripple.remove();
        },
        { once: true, signal },
      );
      pool.append(ripple);
    },
    { signal },
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
