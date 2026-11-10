/** Curl of simplex-noise (MIT, Jonas Wagner), shared by particles and future entities. */
import { createNoise3D } from 'simplex-noise';
import { createRandom } from '../../core/random';
import { sceneConfig } from '../../config/scene.config';
import { effectsConfig as cfg } from '../../config/effects.config';
export function createFlow() {
  const random = createRandom(sceneConfig.seed);
  const noise = createNoise3D(() => random.next());
  const [width, height] = cfg.flowSize;
  const x = new Float32Array(width * height),
    y = new Float32Array(x.length);
  const impulseX = new Float32Array(x.length),
    impulseY = new Float32Array(x.length);
  let time = 0;
  const index = (u: number, v: number) =>
    Math.max(0, Math.min(height - 1, Math.floor(v * height))) * width +
    Math.max(0, Math.min(width - 1, Math.floor(u * width)));
  return {
    x,
    y,
    inject(u: number, v: number, dx: number, dy: number) {
      if (![u, v, dx, dy].every(Number.isFinite)) return;
      const i = index(u, v);
      impulseX[i] = Math.max(-cfg.flowImpulse, Math.min(cfg.flowImpulse, (impulseX[i] ?? 0) + dx));
      impulseY[i] = Math.max(-cfg.flowImpulse, Math.min(cfg.flowImpulse, (impulseY[i] ?? 0) + dy));
    },
    update(seconds: number) {
      time += seconds * 0.08;
      for (let j = 0; j < height; j++)
        for (let i = 0; i < width; i++) {
          const k = j * width + i,
            u = (i / width) * 3,
            v = (j / height) * 3,
            e = 0.01;
          impulseX[k] = (impulseX[k] ?? 0) * cfg.flowDecay;
          impulseY[k] = (impulseY[k] ?? 0) * cfg.flowDecay;
          x[k] =
            ((noise(u, v + e, time) - noise(u, v - e, time)) / (2 * e)) * cfg.flowSpeed +
            (impulseX[k] ?? 0);
          y[k] =
            (-(noise(u + e, v, time) - noise(u - e, v, time)) / (2 * e)) * cfg.flowSpeed +
            (impulseY[k] ?? 0);
        }
    },
    sample(u: number, v: number) {
      const k = index(u, v);
      return { x: x[k] ?? 0, y: y[k] ?? 0 };
    },
    clear() {
      x.fill(0);
      y.fill(0);
      impulseX.fill(0);
      impulseY.fill(0);
    },
  };
}
