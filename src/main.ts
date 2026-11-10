/** Mount the first verifiable app shell; failed graphics leave readable status and links. */
import './ui/theme.css';
import './ui/shell.css';
import './ui/loading.css';
import './ui/shared/controls.css';
import { createLoadingScreen } from './ui/shared/loading';
import { strings } from './config/strings.en';
import { createShell } from './ui/shell';
import { createEvents } from './core/events';
import type { AppEvents } from './core/events';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing application root');
const controller = new AbortController();
const loading = createLoadingScreen(root);
const { canvasHost, setStatus } = createShell(root, __BUILD_REVISION__, controller.signal);

const events = createEvents<AppEvents>();
events.on('rendererStatus', ({ state }) => {
  const labels = {
    ready: strings.rendererReady,
    failed: strings.rendererFailed,
    lost: strings.rendererLost,
  };
  setStatus(labels[state]);
});
controller.signal.addEventListener(
  'abort',
  () => {
    events.clear();
  },
  { once: true },
);

async function mountRenderer() {
  try {
    const { startRenderer } = await import('./render/bootstrap');
    if (await startRenderer(canvasHost, controller.signal)) {
      events.emit('rendererStatus', { state: 'ready' });
      canvasHost.querySelector('canvas')?.addEventListener(
        'webglcontextlost',
        (event) => {
          event.preventDefault();
          events.emit('rendererStatus', { state: 'lost' });
        },
        { signal: controller.signal },
      );
    }
  } catch {
    if (!controller.signal.aborted) events.emit('rendererStatus', { state: 'failed' });
  }
}

void loading.finish(mountRenderer()); // Errors are surfaced in the accessible status, never detached silently.
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    controller.abort();
    loading.dispose();
  });
