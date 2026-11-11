/** Scene preferences only. The settings *dialog* lives in the shell, which owns the single
 * settings icon; this module must not create a second panel or a second button.
 */
import { sceneConfig } from '../config/scene.config';
import type { ScenePreferences } from '../config/scene.config';
import { createEvents } from '../core/events';
import { strings } from '../config/strings.en';
import { iconButton, selectField, checkboxField } from './shared/controls';
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

  const panel = element('div', 'ui-panel');
  panel.append(select.node, motion.node);

  const open = iconButton(
    'settings',
    strings.openSettings,
    () => {
      // The shell binds the real action; keeping this a real primitive avoids a dead control.
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
    panel,
    get,
    subscribe: (callback: (value: ScenePreferences) => void) => events.on('change', callback),
  };
}
export type Settings = ReturnType<typeof createSettings>;
