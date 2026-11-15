/**
 * The tank's light, as a graded state rather than a single brightness dial.
 *
 * The cycle used to hand the renderer one number — `daylight`, going from 1 to 0 in a straight
 * line — and every part of the scene multiplied itself by it. That is why the result read as naive:
 * a straight ramp between bright and dark is not how light behaves. In a real room at dusk the
 * highlights go *first* (the sun leaves the surface long before the room goes black), the shadows
 * warm rather than simply dim, and the eye keeps finding colour in the dark long after the
 * exposure would suggest it cannot.
 *
 * So the clock is turned into a `Lighting` state with several independent channels, each on its
 * own curve. The curves are smoothsteps between named keyframes, which has two properties that
 * matter here:
 *
 * - **No linear stretch.** A smoothstep has zero slope at both ends, so light does not creep at a
 *   constant rate the way a ramp does; it lingers near the extremes and moves through the middle.
 *   That is what gives dusk and dawn a *moment* instead of a linear wash.
 * - **No clipping.** Every channel stays inside its own floor and ceiling, so nothing is ever
 *   blown to pure white or crushed to pure black. The extremes of this scene are a bright day and
 *   a deep night, not an over-exposed photo and a void.
 *
 * The state is deliberately plain numbers, so it can be asserted in a unit test without a GPU.
 */

/** Smooth 0..1 ramp between two edges, flat at both ends. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * A channel that runs from `from` to `to` as the light runs from `start` to `end`.
 *
 * The edges let each channel leave at its own moment: that is the whole point, and it is why the
 * scene does not fade as one flat sheet.
 */
function channel(daylight: number, from: number, to: number, start: number, end: number): number {
  return from + (to - from) * smoothstep(start, end, daylight);
}

/**
 * A channel described by three keyframes: night, dusk, and noon.
 *
 * Some qualities are not monotonic in the light. Warmth is the clearest case — noon is bright but
 * comparatively cool, dusk is dimmer but far warmer, and night is cool again. A single ramp cannot
 * express that shape at all, which is exactly why the old fade had no sunset in it.
 */
function arc(daylight: number, night: number, dusk: number, noon: number): number {
  const MID = 0.5;
  return daylight <= MID
    ? channel(daylight, night, dusk, 0, MID)
    : channel(daylight, dusk, noon, MID, 1);
}

/**
 * The light in the tank at a given point in the cycle.
 *
 * `daylight` is kept because it is the clock's own value and some callers genuinely want the bare
 * ramp, but nothing should be *lit* by it alone.
 */
export interface Lighting {
  /** 0 at full night, 1 at full day. A straight ramp; prefer the named channels below. */
  daylight: number;
  /** How much light reaches the water from above. Falls away first, as the sun leaves. */
  key: number;
  /** How much of the scene survives in shadow. Rises as the key falls: the eye adapting. */
  ambient: number;
  /** Warmth of the light, 0 cool → 1 warm. Dusk is the warmest moment, not noon. */
  warmth: number;
  /** Strength of the caustic web on the sand and plants. */
  caustics: number;
  /** Strength of the god rays through the column. */
  rays: number;
  /** How much the bright surface band reads. The last thing to go at dusk. */
  surface: number;
  /** Depth of the grade laid over the pixel art. The frame gets heavier as night comes. */
  grade: number;
  /** Tightness of the vignette. Night presses in at the edges. */
  vignette: number;
  /**
   * Where the light sits across the tank, 0 right → 1 left.
   *
   * The shaft is not nailed to the centre. It drifts through the cycle, so day and night are lit
   * from different places — which is most of what stops two states from reading as one picture at
   * two exposures.
   */
  azimuth: number;
}

/**
 * Ceilings and floors for every channel.
 *
 * These are artistic decisions in one place, and they are the reason nothing blows out or crushes:
 * the brightest the key is ever allowed to be is 1, and the darkest the ambient is ever allowed to
 * be is above a quarter — not 0. A little light always remains, which keeps the night legible as
 * *night* rather than as an empty screen.
 */
export const lightingLimits = {
  keyDay: 1,
  keyNight: 0.06,
  ambientDay: 0.32,
  ambientNight: 0.88,
  causticsDay: 1,
  causticsNight: 0.12,
  raysDay: 1,
  raysNight: 0.06,
  surfaceDay: 1,
  surfaceNight: 0.2,
  /** Even noon keeps a thin wash, for depth. */
  gradeDay: 0.32,
  gradeNight: 0.8,
  vignetteDay: 0.3,
  vignetteNight: 0.74,
  /** Noon is warm, but dusk is the warmest thing in the cycle. */
  warmthNight: 0.1,
  warmthDusk: 0.86,
  warmthNoon: 0.46,
} as const;

/**
 * Turn `daylight` into the graded state.
 *
 * Read the curves as a description of a real evening:
 *
 * - **Key** falls briskly between 0·88 and 0·2. The sun is gone before the sky is.
 * - **Ambient** does the opposite and lags behind it, so the tank goes dim without going dark.
 *   This is the channel that prevents crushed shadows.
 * - **Warmth** is an arc through dusk, warm at noon, warmest at the fade, cool at night.
 * - **Caustics and rays** are gone well before night: they are sunlight, and sunlight is the first
 *   thing to leave. Night keeps only the faintest caustic, borrowed from the room.
 * - **Surface** lingers longest. The top of the water mirrors the sky even after the sun has set,
 *   which is the small hook that keeps a night tank from being flat.
 * - **Grade and vignette** rise together as the key falls, so the picture darkens by *weight* as
 *   well as by light. Two channels for the same idea read far richer than one.
 */
export function lightingAt(daylight: number): Lighting {
  const d = Math.min(1, Math.max(0, daylight));
  const limit = lightingLimits;

  const key = channel(d, limit.keyNight, limit.keyDay, 0.2, 0.88);
  const ambient = channel(d, limit.ambientNight, limit.ambientDay, 0.0, 0.7);
  const warmth = arc(d, limit.warmthNight, limit.warmthDusk, limit.warmthNoon);

  const caustics = channel(d, limit.causticsNight, limit.causticsDay, 0.34, 0.98);
  const rays = channel(d, limit.raysNight, limit.raysDay, 0.26, 0.94);
  // The surface band goes last and least, so there is always a lit edge at the top of the water.
  const surface = channel(d, limit.surfaceNight, limit.surfaceDay, 0.0, 0.5);

  const grade = channel(d, limit.gradeNight, limit.gradeDay, 0.1, 0.86);
  const vignette = channel(d, limit.vignetteNight, limit.vignetteDay, 0.04, 0.78);

  // The shaft crosses the tank as the day turns, rather than sitting on the centre line.
  const azimuth = channel(d, 0.7, 0.3, 0.0, 1.0);

  return { daylight: d, key, ambient, warmth, caustics, rays, surface, grade, vignette, azimuth };
}
