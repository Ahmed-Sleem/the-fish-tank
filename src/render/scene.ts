/** Pixi v8 native scene graph, pooled graphics and explicit application-owned RAF lifecycle. */
import { Container, Graphics } from 'pixi.js';
import type { Application } from 'pixi.js';
import { sceneConfig } from '../config/scene.config';
import type { ScenePreferences } from '../config/scene.config';
import { createParticles } from './particles';
import { createFixedLoop } from '../core/loop';
import { createFlow } from '../sim/water/flow';
import { createWaterInput } from '../sim/water/input';
import { createWaterEffects } from './effects/water';
export function mountScene(app: Application, host: HTMLElement, preferences: ScenePreferences) {
  const palette = getComputedStyle(host);
  const color = (name: string) =>
    Number.parseInt(palette.getPropertyValue(name).trim().slice(1), 16);
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
  const effects = createWaterEffects(app, background, particleLayer, host);
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
      .circle(0, 0, i % 3 === 0 ? 1.6 : 0.8)
      .fill({ color: color('--water-foam'), alpha: 0.12 + p.speed * 0.12 });
    layers.get('particles')?.addChild(dot);
    return dot;
  });
  const loop = createFixedLoop((seconds) => {
    const impulse = input.take();
    if (impulse) {
      flow.inject(impulse.x, impulse.y, impulse.dx, impulse.dy);
      host.dataset.impulses = String(++impulses);
    }
    flow.update(seconds);
    pool.update(seconds, (x, y) => flow.sample(x, y));
    effects.step(impulse, seconds);
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
    effects.resize(width, height);
    surface
      .clear()
      .rect(0, height * sceneConfig.surfaceHeight, width, 1)
      .fill({ color: color('--water-foam'), alpha: sceneConfig.surfaceAlpha });
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
    effects.reset();
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
  effects.configure(settings);
  resize();
  restart();
  return {
    configure(next: ScenePreferences) {
      settings = next;
      effects.configure(settings);
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
      effects.dispose();
      document.removeEventListener('visibilitychange', restart);
      window.removeEventListener('resize', resize);
    },
  };
}
