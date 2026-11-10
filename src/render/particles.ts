/** Fixed-size seeded pool; normalized coordinates survive resize and presentation quality changes. */
import { createRandom } from '../core/random';
import { sceneConfig } from '../config/scene.config';
export function createParticles() {
  const random = createRandom(sceneConfig.seed);
  const pool = Array.from({ length: sceneConfig.particles }, () => {
    const x = random.next(),
      y = random.next();
    return {
      x,
      y,
      previousX: x,
      previousY: y,
      speed: 0.5 + random.next(),
      phase: random.next() * Math.PI * 2,
    };
  });
  let time = 0;
  return {
    pool,
    update(seconds: number) {
      time += seconds;
      for (const p of pool) {
        p.previousX = p.x;
        p.previousY = p.y;
        p.y -= seconds * sceneConfig.risePerSecond * p.speed;
        p.x += Math.sin(time + p.phase) * seconds * sceneConfig.swayPerSecond;
        if (p.y < 0) {
          p.y += 1;
          p.previousY = p.y;
        }
        if (p.x < 0 || p.x > 1) {
          p.x = (p.x + 1) % 1;
          p.previousX = p.x;
        }
      }
    },
  };
}
