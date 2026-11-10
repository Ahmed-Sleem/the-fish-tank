/** Direct aquarium interface. Future gameplay controls stay hidden until implemented. */
import { button, dialog, stat, toolbar } from './shared/controls';
import { domainConfig } from '../config/domain.config';
import { appConfig } from '../config/app.config';
import { strings } from '../config/strings.en';
import { buildLabel } from '../core/build';
import { element, link } from './shared/dom';

export function createShell(root: HTMLElement, revision: string, signal: AbortSignal) {
  const skip = link(strings.skip, '#aquarium', 'skip-link');
  const main = element('main', 'aquarium');
  main.id = 'aquarium';
  main.tabIndex = -1;
  main.setAttribute('aria-label', strings.aquarium);
  const water = element('div', 'water');
  water.setAttribute('aria-hidden', 'true');
  const canvasHost = element('div', 'canvas-host');
  water.append(canvasHost, element('div', 'water-light'), element('div', 'water-grain'));
  const empty = element('p', 'aquarium-empty', strings.emptyTank);
  main.append(water, empty);

  const status = element('p', 'renderer-status', strings.rendererStarting);
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const graphics = stat(strings.runtimeLabel, strings.rendererStarting);
  const details = dialog(
    strings.buildDetails,
    strings.close,
    [
      element('p', '', strings.capabilities),
      stat(strings.schemaLabel, `${strings.dataFormat} ${String(domainConfig.schemaVersion)}`).node,
      graphics.node,
      element('p', 'build-id', `${strings.revisionPrefix} ${buildLabel(revision)}`),
      element('p', '', strings.privacy),
      link(
        strings.credits,
        `${appConfig.repository}/blob/${appConfig.branch}/docs/REUSE_LEDGER.md`,
      ),
      link(strings.source, appConfig.repository),
      link(strings.plan, `${appConfig.repository}/blob/${appConfig.branch}/IMPLEMENTATION_PLAN.md`),
    ],
    signal,
  );
  const about = button(
    strings.buildDetails,
    () => {
      details.open(about);
    },
    signal,
  );
  const fullscreen = button(
    strings.fullscreen,
    () => {
      const change = document.fullscreenElement
        ? document.exitFullscreen()
        : root.requestFullscreen();
      void change.catch(() => {
        status.textContent = strings.fullscreenUnavailable;
      });
    },
    signal,
  );
  document.addEventListener(
    'fullscreenchange',
    () => {
      fullscreen.textContent = document.fullscreenElement
        ? strings.exitFullscreen
        : strings.fullscreen;
    },
    { signal },
  );
  // Some mobile browsers have no fullscreen API. Keep unavailable controls out of the HUD.
  const controls = document.fullscreenEnabled ? [fullscreen, about] : [about];
  const header = element('header', 'game-hud');
  header.append(
    element('h1', 'wordmark', strings.brand),
    toolbar(strings.interfaceTools, controls),
  );
  const runtime = element('section', 'tank-status');
  runtime.id = 'build-status';
  runtime.setAttribute('aria-label', strings.liveLabel);
  runtime.append(status);
  root.replaceChildren(skip, main, header, runtime, details.node);
  return {
    canvasHost,
    status,
    setStatus: (value: string) => {
      status.textContent = value;
      graphics.update(value);
    },
  };
}
