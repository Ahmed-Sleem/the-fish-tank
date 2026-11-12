/** Pixi-native ping-pong half-float height field: no second renderer or readback per frame.
 * All colour/mood values are read from theme.css tokens, so the tank and the interface can
 * never drift apart and the day/night cycle is a token change, not a second shader.
 */
import {
  Filter,
  UniformGroup,
  GlProgram,
  RenderTexture,
  Sprite,
  Texture,
  defaultFilterVert,
  Rectangle,
} from 'pixi.js';
import type { Application, Container, WebGLRenderer } from 'pixi.js';
import { effectsConfig as cfg } from '../../config/effects.config';
import type { Quality, ScenePreferences } from '../../config/scene.config';
import { moodAt } from '../../config/scene.config';
import type { Impulse } from '../../sim/water/input';
import { waveFragment, tankFragment, refractFragment } from './shaders';

type Rgb = [number, number, number];

/** Tokens the tank shader reads. One list, so a missing token fails loudly instead of rendering black. */
const tankTokens = ['--water-top', '--water-deep', '--ray-colour', '--surface-colour'] as const;

export function createWaterEffects(
  app: Application,
  background: Container,
  particles: Container,
  host: HTMLElement,
) {
  const gl = (app.renderer as WebGLRenderer).gl;
  if (!gl.getExtension('EXT_color_buffer_float'))
    throw new Error('Floating-point water targets unavailable');
  let quality: Quality = 'medium';
  let size: number = cfg.presets.medium.grid,
    time = 0,
    disposed = false;
  const texture = () =>
    RenderTexture.create({ width: size, height: size, format: 'rgba16float', scaleMode: 'linear' });
  let read = texture(),
    write = texture();

  const readRgb = (name: string): Rgb => {
    const hex = getComputedStyle(host).getPropertyValue(name).trim().slice(1);
    const n = Number.parseInt(hex, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  type Palette = Record<(typeof tankTokens)[number], Rgb>;
  const palette = (): Palette => {
    const out = {} as Palette;
    for (const token of tankTokens) out[token] = readRgb(token);
    return out;
  };

  const make = (fragment: string, resources: Record<string, unknown>) =>
    new Filter({
      glProgram: GlProgram.from({
        vertex: defaultFilterVert
          .replace('out vec2 vTextureCoord;', 'out vec2 vTextureCoord; out vec2 vUv;')
          .replace(
            'vTextureCoord = filterTextureCoord();',
            'vTextureCoord = filterTextureCoord(); vUv = aPosition;',
          ),
        fragment,
      }),
      resources,
      padding: 0,
      antialias: false,
    });

  const waveUniforms = new UniformGroup({
    uTexel: { value: [1 / size, 1 / size], type: 'vec2<f32>' },
    uImpulse: { value: [0, 0, 0, cfg.radius], type: 'vec4<f32>' },
    uPhysics: {
      value: [cfg.damping, cfg.waveSpeed, cfg.maxHeight, cfg.maxVelocity],
      type: 'vec4<f32>',
    },
    uAspect: { value: 1, type: 'f32' },
  });
  const wave = make(waveFragment, { uState: read.source, waveUniforms });

  const initial = palette();
  type VisualUniforms = {
    uTexel: number[];
    uLook: number[];
    uStyle: number[];
    uTop: Rgb;
    uDeep: Rgb;
    uRay: Rgb;
    uSurface: Rgb;
  };
  const visualUniforms = new UniformGroup({
    uTexel: { value: [1 / size, 1 / size], type: 'vec2<f32>' },
    uLook: { value: [0, 1, 0.5, cfg.displacement], type: 'vec4<f32>' },
    uStyle: {
      value: [cfg.causticScale, cfg.causticSpeed, 0.42, 0],
      type: 'vec4<f32>',
    },
    uTop: { value: initial['--water-top'], type: 'vec3<f32>' },
    uDeep: { value: initial['--water-deep'], type: 'vec3<f32>' },
    uRay: { value: initial['--ray-colour'], type: 'vec3<f32>' },
    uSurface: { value: initial['--surface-colour'], type: 'vec3<f32>' },
  }) as UniformGroup & { uniforms: VisualUniforms };
  // The water is a light pass composited additively over the pixel-art scene.
  const visual = make(tankFragment, { uState: read.source, visualUniforms });
  visual.blendMode = 'add';

  const refractUniforms = new UniformGroup({
    uTexel: { value: [1 / size, 1 / size], type: 'vec2<f32>' },
    uStrength: { value: cfg.displacement * 40, type: 'f32' },
  });
  const refract = make(refractFragment, { uState: read.source, refractUniforms });

  const quad = new Sprite(Texture.WHITE);
  quad.label = 'water-height-step';
  quad.width = size;
  quad.height = size;
  quad.filters = [wave];
  quad.filterArea = new Rectangle(0, 0, size, size);
  const tank = new Sprite(Texture.WHITE);
  tank.alpha = 1;
  tank.filters = [visual];
  background.addChild(tank);
  particles.filters = [refract];

  const clear = () => {
    for (const target of [read, write])
      app.renderer.clear({ target, clear: true, clearColor: [0, 0, 0, 0] });
  };
  clear();

  let reducedMotion = false;
  let lastMood = '';
  /**
   * Wall-clock origin for the cycle.
   *
   * The old code accumulated only simulated seconds, which meant the cycle could not advance while
   * the tab was hidden, while the tank was paused behind a dialog, or while frames were being
   * dropped. Leaving the page open and never seeing night is exactly what that produces. The cycle
   * is scenery, not simulation: it follows real time, so it always arrives.
   */
  const cycleOrigin = Date.now() / 1000;

  /**
   * Apply a mood everywhere it matters.
   *
   * `:root[data-mood=...]` is what the stylesheets read, so writing it to the canvas host left the
   * CSS palette permanently unset. This also runs for the *first* mood: the old code only reacted
   * to a change, so the opening day state was never applied at all.
   */
  const publishMood = (mood: string) => {
    host.dataset.mood = mood;
    document.documentElement.dataset.mood = mood;
  };

  /** Re-read the live tokens and push them to the shader. Called on mood change and reconfigure. */
  const applyTokens = () => {
    const next = palette();
    for (const token of tankTokens) {
      const target =
        token === '--water-top'
          ? 'uTop'
          : token === '--water-deep'
            ? 'uDeep'
            : token === '--ray-colour'
              ? 'uRay'
              : 'uSurface';
      visualUniforms.uniforms[target] = next[token];
    }
  };

  return {
    step(impulse: Impulse | undefined, seconds: number) {
      if (disposed) return;
      time += seconds;
      if (!reducedMotion) {
        const { mood, daylight } = moodAt(Date.now() / 1000 - cycleOrigin);
        if (mood !== lastMood) {
          lastMood = mood;
          publishMood(mood);
          // The token swap above is a style recalculation; read it back only once it has landed,
          // otherwise the shader keeps the previous palette for a frame and the two can disagree.
          requestAnimationFrame(() => {
            if (!disposed) applyTokens();
          });
        }
        visualUniforms.uniforms.uStyle[3] = daylight;
      }
      waveUniforms.uniforms.uImpulse = [
        impulse?.x ?? 0,
        impulse?.y ?? 0,
        impulse?.strength ?? 0,
        cfg.radius,
      ];
      wave.resources.uState = read.source;
      app.renderer.render({ container: quad, target: write, clear: true });
      [read, write] = [write, read];
      visual.resources.uState = read.source;
      refract.resources.uState = read.source;
      visualUniforms.uniforms.uLook[0] = time;
    },
    configure(settings: ScenePreferences) {
      quality = settings.quality;
      reducedMotion = settings.reducedMotion;
      const preset = cfg.presets[quality];
      visual.resolution = preset.resolution;
      refract.resolution = preset.resolution;
      if (size !== preset.grid) {
        read.destroy(true);
        write.destroy(true);
        size = preset.grid;
        read = texture();
        write = texture();
        quad.width = size;
        quad.height = size;
        quad.filterArea = new Rectangle(0, 0, size, size);
        clear();
      }
      visual.resources.uState = read.source;
      refract.resources.uState = read.source;
      for (const uniforms of [waveUniforms, visualUniforms, refractUniforms])
        uniforms.uniforms.uTexel = [1 / size, 1 / size];
      visualUniforms.uniforms.uLook = [
        settings.reducedMotion ? 0 : time,
        preset.rays,
        preset.caustics,
        settings.reducedMotion ? 0 : cfg.displacement,
      ];
      refractUniforms.uniforms.uStrength = settings.reducedMotion ? 0 : cfg.displacement * 40;
      if (settings.reducedMotion) {
        clear();
        // Reduced motion holds the calm night palette rather than freezing mid-fade.
        publishMood('night');
        lastMood = '';
      } else {
        lastMood = '';
        applyTokens();
      }
      host.dataset.rippleGrid = String(size);
    },
    resize(width: number, height: number) {
      const preset = cfg.presets[quality];
      const ceiling = Math.min(preset.resolution, preset.maxWidth / width);
      visual.resolution = ceiling;
      refract.resolution = ceiling;
      tank.width = width;
      tank.height = height;
      tank.filterArea = new Rectangle(0, 0, width, height);
      particles.filterArea = new Rectangle(0, 0, width, height);
      waveUniforms.uniforms.uAspect = width / height;
    },
    reset() {
      clear();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      particles.filters = [];
      tank.filters = [];
      quad.destroy();
      read.destroy(true);
      write.destroy(true);
      wave.destroy();
      visual.destroy();
      refract.destroy();
    },
  };
}
