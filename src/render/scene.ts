/** Pixi v8 native scene graph, pooled graphics and explicit application-owned RAF lifecycle. */
import {
  Container,
  Graphics,
  Sprite,
  Texture,
  UniformGroup,
  Filter,
  GlProgram,
  defaultFilterVert,
  Rectangle,
} from 'pixi.js';
import type { Application } from 'pixi.js';
import { moodAt, sceneConfig } from '../config/scene.config';
import type { ScenePreferences } from '../config/scene.config';
import { createParticles } from './particles';
import { createFixedLoop } from '../core/loop';
import { createFlow } from '../sim/water/flow';
import { createWaterInput } from '../sim/water/input';
import { createWaterEffects } from './effects/water';
import { waterBodyFragment } from './effects/shaders';
import { createBackdropCanvas, paletteFromTheme } from './pixel/backdrop';
import { pixelConfig } from '../config/pixel.config';
export function mountScene(app: Application, host: HTMLElement, preferences: ScenePreferences) {
  // Mood colours are read through the computed style so the day/night cycle needs no redraw
  // path of its own: the token changes, the next frame picks it up.
  const color = (name: string) => {
    const hex = getComputedStyle(host).getPropertyValue(name).trim().replace('#', '');
    const value = Number.parseInt(hex, 16);
    if (!Number.isFinite(value)) throw new Error(`Missing theme token ${name}`);
    return value;
  };
  const layers = new Map(
    sceneConfig.layers.map((name) => {
      const layer = new Container();
      layer.label = name;
      app.stage.addChild(layer);
      return [name, layer] as const;
    }),
  );
  const background = layers.get('background'),
    particleLayer = layers.get('particles');
  if (!background || !particleLayer) throw new Error('Missing tank layers');
  // Pixel-art scenery sits under the water filter, so the shader's refraction and caustics fall
  // across the sand and plants exactly as in the owner's reference.
  const backdropSource = createBackdropCanvas({
    width: pixelConfig.width,
    height: pixelConfig.height,
    palette: paletteFromTheme(host),
    seed: pixelConfig.seed,
  });
  const backdropTexture = Texture.from(backdropSource);
  backdropTexture.source.scaleMode = 'nearest';
  const backdrop = new Sprite(backdropTexture);
  backdrop.label = 'pixel-backdrop';
  background.addChild(backdrop);
  host.dataset.artGrid = `${String(pixelConfig.width)}x${String(pixelConfig.height)}`;

  // A translucent water body sits between the art and the light pass: it is what makes the
  // scene read as *under water* instead of a picture behind glass. Colour comes from tokens.
  const bodyUniforms = new UniformGroup({
    uTop: { value: [0, 0, 0], type: 'vec3<f32>' },
    uDeep: { value: [0, 0, 0], type: 'vec3<f32>' },
    uStrength: { value: 0.3, type: 'f32' },
  });
  const body = new Sprite(Texture.WHITE);
  body.label = 'water-body';
  body.filters = [
    new Filter({
      glProgram: GlProgram.from({ vertex: defaultFilterVert, fragment: waterBodyFragment }),
      resources: { bodyUniforms },
    }),
  ];
  background.addChild(body);

  // A shader problem must never blank the tank: the art layer is already drawn, so failing here
  // leaves a readable static aquarium instead of a black window.
  let effects: ReturnType<typeof createWaterEffects> | undefined;
  try {
    effects = createWaterEffects(app, background, particleLayer, host);
  } catch {
    host.dataset.effects = 'unavailable';
    particleLayer.filters = [];
  }

  /**
   * Publish the mood even without water effects.
   *
   * The shader is what normally reaches dusk in its own uniforms, but a browser without float
   * render targets still has a CSS palette — the surface band, the vignette and the interface all
   * read these tokens. Letting the degraded path sit in permanent daylight would mean the owner's
   * night never arrives on exactly the machines that need the cheap version.
   */
  const publishMood = (mood: string) => {
    host.dataset.mood = mood;
    document.documentElement.dataset.mood = mood;
    tint();
  };
  const fallbackOrigin = Date.now() / 1000;
  const flow = createFlow(),
    input = createWaterInput();
  let impulses = 0;
  const inputTarget = host.closest('main') ?? host;
  let last: { x: number; y: number } | undefined;
  const pointer = (event: Event) => {
    if (
      !(event instanceof PointerEvent) ||
      settings.reducedMotion ||
      document.hidden ||
      disposed ||
      document.querySelector('dialog[open]')
    )
      return;
    if (event.target instanceof Element && event.target.closest('button,a,select,input,dialog'))
      return;
    const rect = host.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width,
      y = (event.clientY - rect.top) / rect.height;
    input.push(
      x,
      y,
      event.type === 'pointerdown' || event.buttons > 0,
      last ? x - last.x : 0,
      last ? y - last.y : 0,
    );
    last = { x, y };
  };
  const cancel = () => {
    last = undefined;
    input.clear();
  };
  inputTarget.addEventListener('pointermove', pointer);
  inputTarget.addEventListener('pointerdown', pointer);
  inputTarget.addEventListener('pointerleave', cancel);
  inputTarget.addEventListener('pointercancel', cancel);
  const surface = new Graphics();
  layers.get('surface')?.addChild(surface);
  const pool = createParticles();
  const sprites = pool.pool.map((p, i) => {
    const dot = new Graphics()
      .circle(0, 0, i % 3 === 0 ? sceneConfig.particleSizeLarge : sceneConfig.particleSizeSmall)
      .fill({ color: color('--surface-colour'), alpha: 0.12 + p.speed * 0.12 });
    layers.get('particles')?.addChild(dot);
    return dot;
  });
  let lastMood = '';
  /** One place repaints mood-dependent Pixi colours; called only when the mood token changes. */
  const tint = () => {
    const surface = color('--surface-colour');
    const deep = color('--water-deep');
    sprites.forEach((dot, i) => {
      const p = pool.pool[i];
      if (!p) return;
      dot.tint = surface;
      dot.alpha = 0.12 + p.speed * 0.12;
    });
    host.dataset.paletteDeep = deep.toString(16).padStart(6, '0');
    const rgb = (token: string) => {
      const hex = color(token);
      return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
    };
    bodyUniforms.uniforms.uTop = rgb('--water-top');
    bodyUniforms.uniforms.uDeep = rgb('--water-deep');
  };
  const loop = createFixedLoop((seconds) => {
    // Without effects nothing else drives the cycle, so the scene owns it here. Real time, not
    // simulated time: the cycle must arrive even if frames are dropped or the tab was hidden.
    if (!effects) {
      const mood = moodAt(Date.now() / 1000 - fallbackOrigin).mood;
      if (mood !== lastMood) {
        lastMood = mood;
        publishMood(mood);
      }
    }
    const impulse = input.take();
    if (impulse) {
      flow.inject(impulse.x, impulse.y, impulse.dx, impulse.dy);
      host.dataset.impulses = String(++impulses);
    }
    flow.update(seconds);
    pool.update(seconds, (x, y) => flow.sample(x, y));
    effects?.step(impulse, seconds);
  });
  let settings = preferences,
    frame = 0,
    previous = 0,
    disposed = false;
  const draw = (alpha: number) => {
    const { width, height } = app.screen;
    sprites.forEach((dot, i) => {
      const p = pool.pool[i];
      if (!p) return;
      dot.visible = i < sceneConfig.presets[settings.quality].particles;
      dot.position.set(
        (p.previousX + (p.x - p.previousX) * alpha) * width,
        (p.previousY + (p.y - p.previousY) * alpha) * height,
      );
    });
    app.render();
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (disposed || width <= 0 || height <= 0) return;
    app.renderer.resolution = Math.min(
      devicePixelRatio || 1,
      sceneConfig.presets[settings.quality].resolution,
    );
    app.renderer.resize(width, height);
    backdrop.width = width;
    backdrop.height = height;
    body.width = width;
    body.height = height;
    body.filterArea = new Rectangle(0, 0, width, height);
    effects?.resize(width, height);
    // Soft waterline: stacked translucent bands, never a 1px rule (the owner banned frames).
    surface.clear();
    const line = height * sceneConfig.surfaceHeight;
    const band = Math.max(2, height * sceneConfig.surfaceBand);
    for (let i = 0; i < sceneConfig.surfaceLayers; i++) {
      const spread = 1 + i * 1.7;
      surface.rect(0, line + (i - 0.5) * band * 0.45, width, band * spread).fill({
        color: color(i === 0 ? '--water-glow' : '--surface-colour'),
        alpha: sceneConfig.surfaceAlpha / (i + 1.6),
      });
    }
    host.dataset.quality = settings.quality;
    host.dataset.particles = String(sceneConfig.presets[settings.quality].particles);
    host.dataset.resolution = String(app.renderer.resolution);
    draw(1);
  };
  const animate = (now: number) => {
    if (disposed) return;
    // Do not run two GPU water scenes during startup. First static tank draw is ready;
    // the loader owns animation until it releases the inert application.
    if (host.closest('[inert]')) {
      previous = 0;
      frame = requestAnimationFrame(animate);
      return;
    }
    // A modal dialog covers the tank completely, so simulating water behind it burns the GPU
    // for pixels nobody can see — on a weak machine that starves the dialog the player is
    // actually looking at. Hold the tank still until the dialog closes.
    if (document.querySelector('dialog[open]')) {
      previous = 0;
      frame = requestAnimationFrame(animate);
      return;
    }
    const alpha = previous === 0 ? 1 : loop.advance((now - previous) / 1000);
    previous = now;
    draw(alpha);
    frame = requestAnimationFrame(animate);
  };
  const restart = () => {
    cancelAnimationFrame(frame);
    previous = 0;
    loop.reset();
    cancel();
    flow.clear();
    effects?.reset();
    host.dataset.motion = settings.reducedMotion ? 'reduced' : 'full';
    host.dataset.running = String(!disposed && !document.hidden && !settings.reducedMotion);
    if (!disposed && !document.hidden && !settings.reducedMotion)
      frame = requestAnimationFrame(animate);
    else if (!disposed) draw(1);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  document.addEventListener('visibilitychange', restart);
  // Also catches DPR changes on monitor moves without a layout resize.
  window.addEventListener('resize', resize);
  effects?.configure(settings);
  resize();
  restart();
  return {
    configure(next: ScenePreferences) {
      settings = next;
      effects?.configure(settings);
      resize();
      restart();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      host.dataset.running = 'false';
      cancelAnimationFrame(frame);
      observer.disconnect();
      inputTarget.removeEventListener('pointermove', pointer);
      inputTarget.removeEventListener('pointerdown', pointer);
      inputTarget.removeEventListener('pointerleave', cancel);
      inputTarget.removeEventListener('pointercancel', cancel);
      body.destroy();
      backdrop.destroy();
      backdropTexture.destroy(true);
      effects?.dispose();
      document.removeEventListener('visibilitychange', restart);
      window.removeEventListener('resize', resize);
    },
  };
}
