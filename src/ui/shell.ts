/** Borderless aquarium interface. The tank fills the window; a single settings icon is the
 * only chrome. Nothing unimplemented is shown, and no control appears that cannot work.
 */
import { createSettings } from './settings';
import { button, dialog, sectionTitle, stat, actionRow } from './shared/controls';
import { domainConfig } from '../config/domain.config';
import { appConfig } from '../config/app.config';
import { strings } from '../config/strings.en';
import { element, link } from './shared/dom';

export function createShell(root: HTMLElement, signal: AbortSignal) {
  const skip = link(strings.skip, '#aquarium', 'skip-link');
  const main = element('main', 'aquarium');
  main.id = 'aquarium';
  main.tabIndex = -1;
  main.setAttribute('aria-label', strings.aquarium);
  const water = element('div', 'water');
  water.setAttribute('aria-hidden', 'true');
  const canvasHost = element('div', 'canvas-host');
  water.append(
    canvasHost,
    element('div', 'water-light'),
    element('div', 'water-surface'),
    element('div', 'water-grain'),
    element('div', 'water-vignette'),
  );
  main.append(water);

  // The page keeps a heading for assistive technology; the visible title lives on the loading
  // screen only, so the tank itself stays uninterrupted.
  const heading = element('h1', 'sr-only', strings.brand);

  const graphics = stat(strings.runtimeLabel, strings.rendererStarting);
  const settings = createSettings(signal);

  const windowRow = element('div', 'ui-row-stack');
  if (document.fullscreenEnabled) {
    const fullscreen = button(
      strings.fullscreen,
      () => {
        const change = document.fullscreenElement
          ? document.exitFullscreen()
          : root.requestFullscreen();
        void change.catch(() => {
          fullscreen.textContent = strings.fullscreenUnavailable;
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
    windowRow.append(actionRow(strings.fullscreen, fullscreen));
  }

  const links = element('div', 'ui-links');
  links.append(
    link(
      strings.credits,
      `${appConfig.repository}/blob/${appConfig.branch}/docs/REUSE_LEDGER.md`,
      'ui-link',
    ),
    link(strings.source, appConfig.repository, 'ui-link'),
    link(
      strings.plan,
      `${appConfig.repository}/blob/${appConfig.branch}/IMPLEMENTATION_PLAN.md`,
      'ui-link',
    ),
  );

  const details = dialog(
    strings.settings,
    strings.close,
    [
      // No build hash and no feature checklist in the interface: the owner asked for the tank
      // and one dialog, not a developer dashboard.
      graphics.node,
      element('p', 'ui-note', strings.capabilities),
      stat(strings.schemaLabel, `${strings.dataFormat} ${String(domainConfig.schemaVersion)}`).node,
      sectionTitle(strings.linksSection),
      links,
      windowRow,
      element('p', 'ui-note', strings.privacy),
      settings.panel,
    ],
    signal,
  );

  const trigger = settings.button;
  trigger.addEventListener(
    'click',
    () => {
      details.open(trigger);
    },
    { signal },
  );

  const hud = element('header', 'hud');
  hud.append(trigger);

  root.replaceChildren(skip, heading, main, hud, details.node);
  return {
    canvasHost,
    settings,
    setStatus: (value: string) => {
      graphics.update(value);
    },
  };
}
