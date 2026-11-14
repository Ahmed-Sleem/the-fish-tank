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
    userMotion = false,
    mood: ScenePreferences['mood'] = 'auto';
  const get = (): ScenePreferences => ({
    quality,
    reducedMotion: userMotion || media.matches,
    mood,
  });
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

  // Pinning the light is the one preference a player reaches for constantly, so it is offered
  // both here and as a single tap in the tank itself.
  const moodSelect = selectField(
    strings.moodLabel,
    [
      { value: 'auto', label: strings.moodAuto },
      { value: 'day', label: strings.moodDay },
      { value: 'night', label: strings.moodNight },
    ],
    mood,
    (value) => {
      mood = value;
      notify();
    },
    signal,
  );
  const setMood = (next: ScenePreferences['mood']) => {
    mood = next;
    moodSelect.input.value = next;
    notify();
  };

  const panel = element('div', 'ui-panel');
  panel.append(select.node, motion.node, moodSelect.node);

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
    setMood,
    subscribe: (callback: (value: ScenePreferences) => void) => events.on('change', callback),
  };
}
export type Settings = ReturnType<typeof createSettings>;
