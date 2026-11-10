import { sceneConfig } from '../config/scene.config';
import type { ScenePreferences } from '../config/scene.config';
import { createEvents } from '../core/events';
import { strings } from '../config/strings.en';
import { button, dialog, selectField, checkboxField } from './shared/controls';
import { element } from './shared/dom';
export function createSettings(signal: AbortSignal) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const events = createEvents<{ change: ScenePreferences }>();
  let quality: ScenePreferences['quality'] = sceneConfig.defaultQuality,
    userMotion = false;
  const get = (): ScenePreferences => ({ quality, reducedMotion: userMotion || media.matches });
  const notify = () => {
    events.emit('change', get());
  };
  const select = selectField(
    strings.quality,
    [
      { value: 'low', label: strings.qualityLow },
      { value: 'medium', label: strings.qualityMedium },
      { value: 'high', label: strings.qualityHigh },
    ],
    quality,
    (value) => {
      quality = value;
      notify();
    },
    signal,
  );
  const motion = checkboxField(
    strings.reducedMotion,
    (value) => {
      userMotion = value;
      notify();
    },
    signal,
  );
  const syncMotion = () => {
    motion.input.checked = get().reducedMotion;
    motion.input.disabled = media.matches;
    notify();
  };
  media.addEventListener('change', syncMotion, { signal });
  syncMotion();
  const panel = dialog(
    strings.settings,
    strings.close,
    [select.node, motion.node, element('p', '', strings.settingsHelp)],
    signal,
  );
  const open = button(
    strings.settings,
    () => {
      panel.open(open);
    },
    signal,
  );
  signal.addEventListener(
    'abort',
    () => {
      events.clear();
    },
    { once: true },
  );
  return {
    button: open,
    node: panel.node,
    get,
    subscribe: (callback: (value: ScenePreferences) => void) => events.on('change', callback),
  };
}
export type Settings = ReturnType<typeof createSettings>;
