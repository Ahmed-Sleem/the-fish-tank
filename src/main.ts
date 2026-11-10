/** Mount the first verifiable app shell; failed graphics leave readable status and links. */
import './ui/theme.css';
import './ui/shell.css';
import { strings } from './config/strings.en';
import { startRenderer } from './render/bootstrap';
import { createShell } from './ui/shell';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing application root');
const controller = new AbortController();
const { canvasHost, status } = createShell(root, __BUILD_REVISION__);

async function mountRenderer() {
  try {
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

void mountRenderer(); // Errors are surfaced in the accessible status, never detached silently.
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    controller.abort();
  });
