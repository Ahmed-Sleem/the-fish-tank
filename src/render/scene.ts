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
import { resolveMood, sceneConfig } from '../config/scene.config';
import type { ScenePreferences } from '../config/scene.config';
import { createParticles } from './particles';
import { createFixedLoop } from '../core/loop';
import { createFlow } from '../sim/water/flow';
import { createWaterInput } from '../sim/water/input';
import { createWaterEffects } from './effects/water';
import { waterBodyFragment } from './effects/shaders';
import { createBackdropLayers, paletteFromTheme } from './pixel/backdrop';
import { poseIndex, swayFor } from './pixel/sway';
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
  // The art is painted in three layers instead of one flat canvas. Nothing here is animated yet;
  // splitting it is what makes motion possible at all, because a single baked image can only be
  // moved as a whole — and moving the sand is not animation, it is a sliding photograph.
  const art = createBackdropLayers({
    width: pixelConfig.width,
    height: pixelConfig.height,
    palette: paletteFromTheme(host),
    seed: pixelConfig.seed,
  });
  const artSprite = (source: HTMLCanvasElement, label: string) => {
    const texture = Texture.from(source);
    texture.source.scaleMode = 'nearest';
    const sprite = new Sprite(texture);
    sprite.label = label;
    // The art grid is authored bottom-centre so a layer can lean about its own root without the
    // sprite's box dragging the picture sideways.
    sprite.anchor.set(0.5, 1);
    background.addChild(sprite);
    return sprite;
  };
  const bed = artSprite(art.bed, 'pixel-bed');
  const far = artSprite(art.far, 'pixel-far');
  const artLayers = [bed, far];

  /**
   * One sprite per plant, positioned at its own root.
   *
   * Not one sprite for all the plants: a sprite can only be moved or rotated as a whole, and a
   * whole-layer rotation about any single pivot lifts every plant that is not standing on that
   * pivot off the sand. Each plant gets its own small canvas, anchored at the root it grows from,
   * so each one can bend about itself.
   *
   * The texture is `nearest`, so the pixels stay crisp; a plant that leans by less than half an
   * art pixel therefore does not move at all, which is the correct reading for a stiff plant.
   */
  const plantSprites = art.plants.map((plant) => {
    // One texture per plant. Its poses are frames along the strip, so walking them costs a
    // rectangle change rather than a texture swap.
    const texture = Texture.from(plant.strip);
    texture.source.scaleMode = 'nearest';
    const poseTextures = Array.from(
      { length: pixelConfig.plantPoses },
      (_, pose) =>
        new Texture({
          source: texture.source,
          frame: new Rectangle(pose * plant.frameW, 0, plant.frameW, plant.frameH),
        }),
    );
    // The resting pose is the middle one, so a plant starts neutral.
    const resting = Math.floor((pixelConfig.plantPoses - 1) / 2);
    const sprite = new Sprite(poseTextures[resting] ?? texture);
    sprite.label = `pixel-plant-${plant.kind}-${String(plant.index)}`;
    // Anchor at the root, so a pose change never shifts the plant: every frame is painted with
    // the root at the same point in its column.
    sprite.anchor.set(0.5, 1);
    background.addChild(sprite);
    return { sprite, plant, textures: poseTextures, pose: resting };
  });
  host.dataset.plants = String(plantSprites.length);
  host.dataset.artGrid = `${String(pixelConfig.width)}x${String(pixelConfig.height)}`;
  host.dataset.sway = 'on';

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
  /** Sets the attributes the stylesheets read. Repainting Pixi colours is a separate concern. */
  const setMoodAttributes = (mood: string) => {
    host.dataset.mood = mood;
    document.documentElement.dataset.mood = mood;
  };
  // Establish a light immediately. A tank that shows no mood until something moves is a tank
  // whose palette is the un-themed fallback, and under reduced motion nothing would ever set it.
  // Only the attribute is set here: the sprite pool and `settings` do not exist yet, and the
  // first loop pass tints anyway.
  setMoodAttributes(resolveMood(0, preferences.mood, preferences.reducedMotion).mood);
  const publishMood = (mood: string) => {
    setMoodAttributes(mood);
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
  /**
   * Repaint the scenery in the current mood's colours.
   *
   * The art is baked into canvases, so a CSS token change cannot reach it: sand drawn at noon
   * stays noon-coloured no matter what the stylesheet says. Repainting on mood change is what
   * makes the whole environment turn over instead of only the water on top of it.
   */
  let paintedMood = '';
  const repaintArt = () => {
    /*
     * Repainting redraws every layer at the reference grid. That is cheap enough to do on a mood
     * change and pointless to do twice, so a guard keyed on the palette's own mood makes it
     * impossible for a stray call to turn into a per-frame redraw.
     */
    const mood = host.dataset.mood ?? '';
    if (mood === paintedMood) return;
    paintedMood = mood;
    const palette = paletteFromTheme(host);
    createBackdropLayers({
      width: pixelConfig.width,
      height: pixelConfig.height,
      palette,
      seed: pixelConfig.seed,
      // Draw into the canvases the sprites already use, so only the pixels change.
      // Every pose canvas, flattened: the painter reuses them in the same order it created them.
      into: { bed: art.bed, far: art.far, plants: art.plants.map((plant) => plant.strip) },
    });
    for (const layer of artLayers) layer.texture.source.update();
    // Every pose shares one source per plant, so one update refreshes the whole strip.
    for (const { sprite } of plantSprites) sprite.texture.source.update();
  };
  const tint = () => {
    repaintArt();
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
  const farLayer = { anchors: art.farAnchors, gain: pixelConfig.swayGainFar };
  const plantsLayer = {
    anchors: art.plants.map((plant) => plant.anchor),
    gain: pixelConfig.swayGainPlants,
  };
  let swayTime = 0;
  let scaleX = 1;
  let scaleY = 1;
  const loop = createFixedLoop((seconds) => {
    // Without effects nothing else drives the cycle, so the scene owns it here. Real time, not
    // simulated time: the cycle must arrive even if frames are dropped or the tab was hidden.
    if (!effects) {
      const mood = resolveMood(
        Date.now() / 1000 - fallbackOrigin,
        settings.mood,
        settings.reducedMotion,
      ).mood;
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
    if (!settings.reducedMotion) {
      // Seconds here is the fixed step, so the tide is a function of simulated time and stays
      // identical under different frame rates — the same contract the particles keep.
      swayTime += seconds;
      const sample = (x: number, y: number) => flow.sample(x, y);

      /*
       * The far layer is scenery, not a plant: it drifts as a whole, and a sub-pixel slide there
       * is invisible at this scale, so a small x offset is enough. It never rotates — that is
       * what made the old motion look like a sliding photograph.
       */
      const farSway = swayFor(farLayer, swayTime, sample);
      /*
       * The far layer is one picture containing every moss clump, so it cannot bend per clump the
       * way the plants do. It drifts as a whole — and the drift is the *average* of what the
       * current is doing at each of its clumps, not the value at whichever one happens to be
       * first. Sampling a single arbitrary point made the whole background lurch when a stroke
       * landed near that point and nowhere else.
       */
      const farDrift =
        farSway.bends.length > 0
          ? farSway.bends.reduce((sum, bend) => sum + bend, 0) / farSway.bends.length
          : 0;
      far.x = far.width / 2 + farDrift * scaleX;

      /*
       * Each plant leans about its own root. The bend is baked into the plant's canvas as a
       * handful of poses and the sprite is nudged to the nearest one, because moving a sprite by
       * a fraction of an art pixel would land its pixels between grid cells and smear the art.
       */
      const plantSway = swayFor(plantsLayer, swayTime, sample);
      for (let i = 0; i < plantSprites.length; i += 1) {
        const entry = plantSprites[i];
        if (!entry) continue;
        const next = poseIndex(plantSway.bends[i] ?? 0);
        // Only touch the sprite when the pose actually changes: a texture swap per frame for
        // every plant would be pure waste, and the art would not look any different.
        if (next === entry.pose) continue;
        entry.pose = next;
        const texture = entry.textures[next];
        if (texture) entry.sprite.texture = texture;
      }
    }
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
    for (const layer of artLayers) {
      layer.width = width;
      layer.height = height;
      // Anchored bottom-centre, so the box spans the full viewport around the root line.
      layer.x = width / 2;
      layer.y = height;
    }
    /*
     * The whole art grid is stretched to the viewport, so a plant's placement has to be stretched
     * the same way or it will not stand on its own sand. Both axes are scaled independently:
     * the picture is not letterboxed, it fills the tank.
     */
    scaleX = width / pixelConfig.width;
    scaleY = height / pixelConfig.height;
    for (const { sprite, plant } of plantSprites) {
      /*
       * A sprite sized from its texture would be the width of the whole strip. The pose width is
       * what belongs on screen, scaled by the same factor as the picture so one art pixel stays
       * one art pixel everywhere.
       */
      sprite.width = plant.frameW * scaleX;
      sprite.height = plant.frameH * scaleY;
      sprite.x = plant.anchor.x * scaleX;
      // The anchor is at the strip's bottom edge, which is one pixel below the root.
      sprite.y = plant.anchor.y * scaleY + scaleY;
    }
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
      // Publish before anything else: with reduced motion there is no animation loop to notice a
      // changed preference, so choosing day would change nothing at all.
      publishMood(
        resolveMood(Date.now() / 1000 - fallbackOrigin, next.mood, next.reducedMotion).mood,
      );
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
      for (const layer of artLayers) {
        layer.texture.destroy(true);
        layer.destroy();
      }
      effects?.dispose();
      document.removeEventListener('visibilitychange', restart);
      window.removeEventListener('resize', resize);
    },
  };
}
