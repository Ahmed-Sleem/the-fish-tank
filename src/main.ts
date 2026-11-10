/** Mount the first verifiable app shell; failed graphics leave readable status and links. */
import './ui/theme.css';
import './ui/shell.css';
import './ui/loading.css';
import { createLoadingScreen } from './ui/shared/loading';
import { strings } from './config/strings.en';
import { createShell } from './ui/shell';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing application root');
const controller = new AbortController();
const loading = createLoadingScreen(root);
const { canvasHost, status } = createShell(root, __BUILD_REVISION__);

async function mountRenderer() {
  try {
    const { startRenderer } = await import('./render/bootstrap');
    if (await startRenderer(canvasHost, controller.signal)) {
      status.textContent = strings.rendererReady;
      canvasHost.querySelector('canvas')?.addEventListener(
        'webglcontextlost',
        (event) => {
          event.preventDefault();
          status.textContent = strings.rendererLost;
        },
        { signal: controller.signal },
      );
    }
  } catch {
    if (!controller.signal.aborted) status.textContent = strings.rendererFailed;
  }
}

void loading.finish(mountRenderer()); // Errors are surfaced in the accessible status, never detached silently.
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    controller.abort();
    loading.dispose();
  });
