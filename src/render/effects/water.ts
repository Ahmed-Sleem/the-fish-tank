/** Pixi-native ping-pong half-float height field: no second renderer or readback per frame. */
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
import type { Impulse } from '../../sim/water/input';
import { waveFragment, tankFragment, refractFragment } from './shaders';
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
  const color = (name: string) => {
    const hex = getComputedStyle(host).getPropertyValue(name).trim().slice(1);
    const n = Number.parseInt(hex, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
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
  const visualUniforms = new UniformGroup({
    uTexel: { value: [1 / size, 1 / size], type: 'vec2<f32>' },
    uLook: { value: [0, 1, 0.5, cfg.displacement], type: 'vec4<f32>' },
    uStyle: {
      value: [cfg.causticIntensity, cfg.causticScale, cfg.causticSpeed, 0],
      type: 'vec4<f32>',
    },
    uDeep: { value: color('--water-body'), type: 'vec3<f32>' },
    uFoam: { value: color('--water-foam'), type: 'vec3<f32>' },
  });
  const visual = make(tankFragment, { uState: read.source, visualUniforms });
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
  tank.filters = [visual];
  background.addChild(tank);
  particles.filters = [refract];

  const clear = () => {
    for (const target of [read, write])
      app.renderer.clear({ target, clear: true, clearColor: [0, 0, 0, 0] });
  };
  clear();
  return {
    step(impulse: Impulse | undefined, seconds: number) {
      if (disposed) return;
      time += seconds;
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
        preset.caustics,
        preset.rays,
        settings.reducedMotion ? 0 : cfg.displacement,
      ];
      refractUniforms.uniforms.uStrength = settings.reducedMotion ? 0 : cfg.displacement * 40;
      if (settings.reducedMotion) clear();
      host.dataset.rippleGrid = String(size);
    },
    resize(width: number, height: number) {
      const preset = cfg.presets[quality];
      visual.resolution = Math.min(preset.resolution, preset.maxWidth / width);
      refract.resolution = Math.min(preset.resolution, preset.maxWidth / width);
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
