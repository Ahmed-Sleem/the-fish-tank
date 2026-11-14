/** Borderless aquarium interface. The tank fills the window; a single settings icon is the
 * only chrome. Nothing unimplemented is shown, and no control appears that cannot work.
 */
import { createSettings } from './settings';
import { button, dialog, iconButton, icon, sectionTitle, stat, actionRow } from './shared/controls';
import { createDrawing } from './drawing';
import { createPurse } from '../draw/purse';
import { inkConfig } from '../config/ink.config';
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
    // The mood grade covers the composed tank, so sand, plants and water turn over together.
    element('div', 'water-grade'),
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

  // The purse starts full and lives as long as the page. Saving it arrives with the storage work;
  // until then it is honestly per-visit rather than pretending to persist.
  const purse = createPurse(inkConfig.startInk);

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

  // Drawing is its own dialog, not a section of settings: one action, one destination. It is
  // created lazily on first use so the tank never pays for a canvas it is not showing.
  let drawing: ReturnType<typeof createDrawing> | null = null;
  let drawDialog: ReturnType<typeof dialog> | null = null;
  const drawTrigger = iconButton(
    'brush',
    strings.drawOpen,
    () => {
      openDrawing();
    },
    signal,
  );
  function openDrawing() {
    if (!drawing) {
      drawing = createDrawing({
        purse,
        signal,
        tank: canvasHost,
        onDone: () => {
          // The strokes are priced and paid for, but nothing swims yet: closing on a drawing that
          // vanishes would be a lie about what just happened.
          drawDialog?.node.close();
        },
      });
      drawDialog = dialog(strings.drawTitle, strings.close, [drawing.panel], signal);
      root.append(drawDialog.node);
    }
    drawing.refresh();
    drawDialog?.open(drawTrigger);
  }
  const trigger = settings.button;
  trigger.addEventListener(
    'click',
    () => {
      details.open(trigger);
    },
    { signal },
  );

  // One tap to change the light. It shows the destination rather than the current state — a
  // moon means "go to night" — and its label says the same thing, so neither is a guess.
  const moodButton = iconButton(
    'moon',
    strings.moodToNight,
    () => {
      toggleMood();
    },
    signal,
  );
  const syncMoodButton = () => {
    const night = document.documentElement.dataset.mood === 'night';
    const next = night ? 'day' : 'night';
    moodButton.replaceChildren(icon(night ? 'sun' : 'moon'));
    moodButton.setAttribute('aria-label', night ? strings.moodToDay : strings.moodToNight);
    moodButton.title = night ? strings.moodToDay : strings.moodToNight;
    moodButton.dataset.next = next;
  };
  function toggleMood() {
    const night = document.documentElement.dataset.mood === 'night';
    settings.setMood(night ? 'day' : 'night');
    syncMoodButton();
  }
  syncMoodButton();
  const moodObserver = new MutationObserver(syncMoodButton);
  moodObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-mood'],
  });
  signal.addEventListener('abort', () => {
    moodObserver.disconnect();
  });

  const hud = element('header', 'hud');
  hud.append(moodButton, drawTrigger, trigger);

  root.replaceChildren(skip, heading, main, hud, details.node);
  return {
    canvasHost,
    settings,
    setStatus: (value: string) => {
      graphics.update(value);
    },
  };
}
