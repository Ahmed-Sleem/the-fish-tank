/** Pixi v8 native scene graph, pooled graphics and explicit application-owned RAF lifecycle. */
import { Container, Graphics } from 'pixi.js';
import type { Application } from 'pixi.js';
import { sceneConfig } from '../config/scene.config';
import type { ScenePreferences } from '../config/scene.config';
import { createParticles } from './particles';
import { createFixedLoop } from '../core/loop';
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
    pool.update(seconds);
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
    const alpha = previous === 0 ? 1 : loop.advance((now - previous) / 1000);
    previous = now;
    draw(alpha);
    frame = requestAnimationFrame(animate);
  };
  const restart = () => {
    cancelAnimationFrame(frame);
    previous = 0;
    loop.reset();
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
  resize();
  restart();
  return {
    configure(next: ScenePreferences) {
      settings = next;
      resize();
      restart();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      host.dataset.running = 'false';
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', restart);
      window.removeEventListener('resize', resize);
    },
  };
}
