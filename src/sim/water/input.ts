/** One coalesced impulse per tick, never an event-sized queue. */
import { effectsConfig as cfg } from '../../config/effects.config';
export interface Impulse {
  x: number;
  y: number;
  strength: number;
  dx: number;
  dy: number;
}
export function createWaterInput() {
  let pending: Impulse | undefined;
  return {
    push(x: number, y: number, pressed: boolean, dx = 0, dy = 0) {
      if (![x, y, dx, dy].every(Number.isFinite) || x < 0 || x > 1 || y < 0 || y > 1) return;
      pending = {
        x,
        y,
        strength: pressed ? cfg.pressStrength : cfg.hoverStrength,
        dx: Math.max(-1, Math.min(1, dx)),
        dy: Math.max(-1, Math.min(1, dy)),
      };
    },
    take() {
      const value = pending;
      pending = undefined;
      return value;
    },
    clear() {
      pending = undefined;
    },
  };
}
