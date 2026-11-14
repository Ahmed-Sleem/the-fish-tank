/** Static pixel-art backdrop: sand bed, rocks, moss and plant silhouettes.
 *
 * The owner's reference draws the world on a fixed low-resolution grid and lets the water
 * shader do every non-pixel effect. That separation is the look, so it is reproduced here:
 * this module owns the *art* grid only, and never touches WebGL.
 *
 * Presentation only. These are scenery silhouettes, not the S30 L-system plant system and not
 * creatures — nothing here simulates ecology or gameplay.
 */
import { pixelConfig } from '../../config/pixel.config';

export interface PixelPalette {
  sandLight: string;
  sandMid: string;
  sandDark: string;
  sandShadow: string;
  rockDark: string;
  rockMid: string;
  rockLight: string;
  moss: readonly string[];
  plant: readonly string[];
  plantStem: readonly string[];
  pebbles: readonly string[];
}

const GY = (p: PixelPalette) => [p.rockDark, p.rockDark, p.rockMid, p.rockLight, p.rockLight];

/** Deterministic hash: the same seed and grid always produce the same tank. */
function hash(x: number, y: number, seed = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

export interface BackdropOptions {
  width: number;
  height: number;
  palette: PixelPalette;
  seed?: number;
  /**
   * Paint into these canvases instead of creating new ones.
   *
   * The sprites are built from these canvases once, so repainting in place is what lets the
   * scenery change colour with the day without rebuilding the scene graph.
   */
  into?: { bed: HTMLCanvasElement; far: HTMLCanvasElement; plants: HTMLCanvasElement };
}

/**
 * A place a plant grows from, in art-grid pixels.
 *
 * The anchor matters more than it looks: a frond that sways about its middle visibly detaches
 * from the sand. Everything that moves is rooted here, and the bend is applied as a rotation about
 * this point with the strength growing toward the tip.
 */
export interface PlantAnchor {
  readonly x: number;
  readonly y: number;
  /** Tip height above the root in grid pixels; height drives how far the tip travels. */
  readonly height: number;
  /** Stiffness 0..1: a tall frond moves more than a squat clump. */
  readonly give: number;
}

export interface BackdropLayers {
  /** Sand, pebbles and the buried mass: never moves. */
  readonly bed: HTMLCanvasElement;
  /** Rocks and moss: drifts a fraction of a pixel with the current. */
  readonly far: HTMLCanvasElement;
  /** Fronds and stems: the part that actually sways. */
  readonly plants: HTMLCanvasElement;
  readonly anchors: { readonly far: PlantAnchor[]; readonly plants: PlantAnchor[] };
}

/** Where a set of authored props meets the sand, for the sway pass to rotate about. */
function anchorsFor(
  props: readonly (readonly number[])[],
  width: number,
  height: number,
  floor: (x: number) => number,
  give: number,
): PlantAnchor[] {
  return props.map((prop) => {
    const x = Math.round(width * (prop[0] ?? 0));
    // The authored `y` is the crown; the root is the sand line, and that is what must not move.
    const heightPx = Math.max(6, Math.min(height, floor(x) - height * (prop[1] ?? 0.8)));
    return { x, y: Math.round(floor(x)), height: Math.round(heightPx), give };
  });
}

export function createBackdropLayers({
  width,
  height,
  palette,
  into,
}: BackdropOptions): BackdropLayers {
  const seed = pixelConfig.seed;
  /** Per-call noise, offset by the configured seed so the tank is reproducible but not plain. */
  const noise = (x: number, y: number, salt = 0) => hash(x, y, salt + seed);
  type Surface = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D };
  const surface = (existing?: HTMLCanvasElement): Surface => {
    const canvas = existing ?? document.createElement('canvas');
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D context unavailable for the pixel backdrop');
    // A repaint starts from nothing: the previous mood's pixels must not show through.
    context.clearRect(0, 0, width, height);
    return { canvas, ctx: context };
  };
  // Created up front rather than looked up by name, so a layer can never be "not made yet".
  const bed = surface(into?.bed);
  const far = surface(into?.far);
  const foliage = surface(into?.plants);
  const anchors: { far: PlantAnchor[]; plants: PlantAnchor[] } = { far: [], plants: [] };
  // `ctx` is the active painting surface: the art helpers below all write through it.
  let ctx = bed.ctx;
  const put = (x: number, y: number, colour: string, w = 1, h = 1) => {
    ctx.fillStyle = colour;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };

  const groundY = (x: number) =>
    height * (pixelConfig.groundBase + Math.sin(x / 38) * 0.016 + Math.sin(x / 11) * 0.004);
  /** The sand line: the root every anchored prop is measured from. */
  const floor = (x: number) => groundY(x);

  // --- Sand bed -------------------------------------------------------------
  // Lit crown, a soft lit slope, then the buried mass darkens with depth. The reference's bed
  // glows along its top edge and falls away into shadow, so brightness is driven by depth
  // rather than by a flat random speckle.
  for (let x = 0; x < width; x++) {
    const top = Math.floor(groundY(x));
    const bedDepth = height - top;
    for (let y = top; y < height; y++) {
      const depth = (y - top) / Math.max(1, bedDepth);
      const roll = hash(x, y, 3);
      // Ordered dither between adjacent stops so the falloff is a gradient, not contour bands.
      const shade = Math.min(0.999, Math.max(0, depth * 1.15 + (roll - 0.5) * 0.22));
      const stops = [palette.sandLight, palette.sandMid, palette.sandDark, palette.sandShadow];
      const raw = shade * stops.length;
      const last = stops.length - 1;
      const index = Math.min(last, Math.floor(raw));
      const frac = raw - index;
      const colour =
        (hash(x >> 1, y, 7) < frac ? stops[Math.min(last, index + 1)] : stops[index]) ??
        palette.sandShadow;
      put(x, y, colour);
    }
  }

  // --- Rocks ---------------------------------------------------------------
  const rock = (cx: number, cy: number, rx: number, ry: number, s: number) => {
    const shades = GY(palette);
    for (let y = cy - ry - 3; y <= cy + 4; y++)
      for (let x = cx - rx - 3; x <= cx + rx + 3; x++) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        const r = Math.hypot(nx, ny) + (hash(x >> 1, y >> 1, s) - 0.5) * 0.35;
        if (r >= 1 || ny >= 0.35) continue;
        const v = 0.5 - nx * 0.25 - ny * 0.35 + (hash(x, y, s + 1) - 0.5) * 0.5;
        const index = Math.max(0, Math.min(shades.length - 1, Math.floor(v * shades.length)));
        let colour = shades[index] ?? palette.rockMid;
        if (ny < -0.35 && hash(x, y, s + 2) > 0.55)
          colour = palette.moss[Math.floor(hash(x, y, 5) * 3) + 1] ?? palette.moss[1] ?? colour;
        if (r > 0.88) colour = palette.rockDark;
        put(x, y, colour);
      }
  };

  // --- Moss clumps ---------------------------------------------------------
  /** A bush, not a floating slab: the mass grows from the bed up to `cy - ry`.
   * A superellipse gives a broad, flat-rooted silhouette; per-pixel noise frays the edge so it
   * reads as foliage instead of a clipped rectangle.
   */
  const clump = (cx: number, cy: number, rx: number, ry: number, s: number) => {
    const bottom = Math.min(height - 1, groundY(cx) + 3);
    const top = Math.min(cy - ry, bottom - 3);
    const mid = (top + bottom) / 2;
    const half = Math.max(2, (bottom - top) / 2);
    for (let y = Math.floor(top) - 5; y <= Math.ceil(bottom); y++)
      for (let x = Math.floor(cx - rx - 6); x <= Math.ceil(cx + rx + 6); x++) {
        const nx = (x - cx) / rx;
        const ny = (y - mid) / half;
        const e =
          1 -
          Math.pow(Math.abs(nx), 2.4) -
          Math.pow(Math.abs(ny), 3.2) +
          (hash(x, y, s) - 0.5) * 0.42;
        if (e > 0) {
          const v = 0.55 - ny * 0.42 + (hash(x >> 1, y, s + 2) - 0.5) * 0.6;
          const index = Math.max(
            0,
            Math.min(palette.moss.length - 1, Math.floor(v * palette.moss.length)),
          );
          put(x, y, palette.moss[index] ?? palette.moss[0] ?? palette.rockMid);
        } else if (e > -0.12 && hash(x, y, s + 4) > 0.55 && ny < 0.3) {
          // Loose leaf tips catching light just outside the mass.
          put(x, y, palette.moss[3 + (hash(x, y, 9) > 0.5 ? 1 : 0)] ?? palette.moss[1] ?? '');
        }
      }
  };

  // --- Plant fronds and stems ---------------------------------------------
  const frond = (
    bx: number,
    by: number,
    angle: number,
    length: number,
    widthAt: number,
    bend: number,
    sway: number,
  ) => {
    const pal = palette.plant;
    let px = bx;
    let py = by;
    for (let u = 0; u < length; u += 0.7) {
      const f = u / length;
      const a = angle + bend * f * f + sway * f;
      px += Math.cos(a) * 0.7;
      py += Math.sin(a) * 0.7;
      const w = widthAt * Math.pow(Math.sin(Math.PI * Math.pow(f, 0.75)), 0.7);
      for (let v = -w; v <= w; v += 0.7) {
        let colour = Math.abs(v) < 0.55 ? (pal[0] ?? '') : v > 0 ? (pal[2] ?? '') : (pal[1] ?? '');
        if (Math.abs(v) > w - 0.8) colour = pal[3] ?? colour;
        put(px - Math.sin(a) * v, py + Math.cos(a) * v, colour);
      }
    }
  };

  const fan = (
    bx: number,
    by: number,
    count: number,
    spread: number,
    length: number,
    widthAt: number,
    phase: number,
    bendSpan: number,
  ) => {
    for (let i = 0; i < count; i++) {
      const f = count > 1 ? i / (count - 1) : 0.5;
      // `phase` is the fan's own seed: neighbouring fans differ in height and lean.
      const scaled = length * (0.7 + noise(i, bx, phase) * 0.4);
      const sway = phase * 0.12; // radians: a small, stable lean per fan
      frond(
        bx,
        by,
        -Math.PI / 2 + (f - 0.5) * spread + sway,
        scaled,
        widthAt,
        (f - 0.5) * bendSpan,
        0,
      );
    }
  };

  const stem = (x: number, y: number, heightPx: number, phase: number) => {
    const pal = palette.plantStem;
    for (let k = 0; k < heightPx; k++) {
      const f = k / heightPx;
      const px = x + Math.sin(phase + k * 0.05) * f * f * heightPx * 0.1;
      const py = y - k;
      put(px, py, pal[0] ?? '');
      if (k % 4 === 2) {
        const leafLength = (1 - f * 0.55) * 9 + ((k & 4) !== 0 ? 1 : 0);
        for (let j = 1; j < leafLength; j++) {
          const colour = j > leafLength * 0.6 ? (pal[2] ?? '') : (pal[1] ?? '');
          put(px + j, py - j * 0.45, colour);
          put(px - j, py - j * 0.45, colour);
        }
      }
    }
  };

  // --- Pebbles (bed layer: they belong to the sand, not to the foliage) ----
  for (let i = 0; i < pixelConfig.pebbles; i++) {
    const x = Math.floor(8 + hash(i, 1) * (width - 16));
    const y = Math.floor(floor(x) + 3 + hash(i, 2) * 16);
    const w = 2 + Math.floor(hash(i, 3) * 2);
    const colour =
      palette.pebbles[Math.floor(hash(i, 4) * palette.pebbles.length)] ?? palette.pebbles[0];
    if (colour) put(x, y, colour, w, 2);
    put(x, y + 1, palette.sandShadow, w, 1);
  }

  // --- Far layer: rocks and low moss, which move only a hair --------------
  ctx = far.ctx;
  for (const [cx, cy, rx, ry, s] of pixelConfig.rocks)
    rock(Math.round(width * cx), Math.round(height * cy), rx, ry, s);
  for (const [cx, cy, rx, ry, s] of pixelConfig.clumps)
    clump(Math.round(width * cx), Math.round(height * cy), rx, ry, s);
  anchors.far = anchorsFor(pixelConfig.clumps, width, height, floor, 0.25);

  // --- Plant layer: fronds and stems, which carry the real motion --------
  ctx = foliage.ctx;
  for (const [x, count, spread, length, widthAt] of pixelConfig.fans) {
    const bx = Math.round(width * x);
    fan(bx, Math.round(floor(bx)) - 1, count, spread, length, widthAt, x * 10, spread * 0.35);
  }
  for (const [x, heightPx, phase] of pixelConfig.stems) {
    const bx = Math.round(width * x);
    stem(bx, Math.round(floor(bx)) - 1, heightPx, phase);
  }
  anchors.plants = [
    ...anchorsFor(pixelConfig.fans, width, height, floor, 1),
    ...anchorsFor(pixelConfig.stems, width, height, floor, 0.8),
  ];

  return { bed: bed.canvas, far: far.canvas, plants: foliage.canvas, anchors };
}

/** Reads the art palette from the live theme tokens, so there is one source of colour. */
export function paletteFromTheme(host: HTMLElement): PixelPalette {
  const read = (token: string) => {
    const value = getComputedStyle(host).getPropertyValue(token).trim();
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Missing theme token ${token}`);
    return value;
  };
  // Ramps are comma-separated token lists; each stop is validated so a typo fails loudly.
  const ramp = (token: string) => {
    const parts = getComputedStyle(host)
      .getPropertyValue(token)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (!parts.length || parts.some((part) => !/^#[0-9a-f]{6}$/i.test(part)))
      throw new Error(`Missing theme token ${token}`);
    return parts;
  };
  return {
    sandLight: read('--art-sand-light'),
    sandMid: read('--art-sand-mid'),
    sandDark: read('--art-sand-dark'),
    sandShadow: read('--art-sand-shadow'),
    rockDark: read('--art-rock-dark'),
    rockMid: read('--art-rock-mid'),
    rockLight: read('--art-rock-light'),
    moss: ramp('--art-moss-scale'),
    plant: ramp('--art-plant-scale'),
    plantStem: ramp('--art-stem-scale'),
    pebbles: ramp('--art-pebble-scale'),
  };
}
