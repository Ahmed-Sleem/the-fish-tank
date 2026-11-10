/** Accumulator/interpolated draw pattern studied from MainLoop.js; bounded panic/drop policy. */
import { balanceConfig } from '../config/balance.config';
import { sceneConfig } from '../config/scene.config';
export function createFixedLoop(update: (seconds: number) => void) {
  const step = 1 / balanceConfig.simulationHz;
  let accumulator = 0;
  return {
    advance(seconds: number) {
      if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('Invalid frame delta');
      accumulator += Math.min(seconds, sceneConfig.maxFrameSeconds);
      let steps = 0;
      while (accumulator + Number.EPSILON >= step && steps < sceneConfig.maxSteps) {
        update(step);
        accumulator -= step;
        steps++;
      }
      if (steps === sceneConfig.maxSteps) accumulator %= step;
      accumulator = Math.max(0, accumulator);
      return accumulator / step;
    },
    reset() {
      accumulator = 0;
    },
  };
}
