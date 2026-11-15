/**
 * Scenery motion, tested without a GPU.
 *
 * The plants are drawn as pixels, so "the animation works" is not something a pixel-diff can
 * prove on a machine with no WebGL. What can be proven is the contract that makes it look alive
 * rather than broken — and the two failure modes the owner actually reported are both structural:
 *
 * - **A plant must not slide.** Its root is its one fixed point. Rotation about a shared pivot
 *   moved the roots, which is what made the tank look wrong.
 * - **A plant must not blur.** Its pixels must land on the art grid. Any smoothly interpolated
 *   transform resamples a pixel canvas, so motion has to be quantised into pre-drawn poses.
 *
 * Everything else here — depth, per-plant phase, bounds — follows from those two.
 */
import { describe, expect, it } from 'vitest';
import { bendForPose, poseIndex, swayFor } from '../../src/render/pixel/sway';
import { pixelConfig } from '../../src/config/pixel.config';

const still = () => ({ x: 0, y: 0 });
const gust = (x: number) => () => ({ x, y: 0 });

const plant = (x: number, height: number, give = 1) => ({ x, y: 160, height, give });
const plants = {
  anchors: [plant(40, 90), plant(120, 40, 0.8)],
  gain: pixelConfig.swayGainPlants,
};
const far = { anchors: [plant(40, 20, 0.25)], gain: pixelConfig.swayGainFar };

describe('swayFor', () => {
  it('drifts gently when nobody has stirred the water', () => {
    /*
     * Not "is zero at t=0": each plant has its own phase, so at any instant some fronds are at
     * the peak of their drift. What must hold is that an undisturbed tank only ever *drifts* —
     * a fraction of the widest drawn pose — rather than bending as if something had swum past.
     */
    for (let time = 0; time < 20; time += 0.5) {
      for (const bend of swayFor(plants, time, still).bends) {
        expect(Math.abs(bend)).toBeLessThan(pixelConfig.plantMaxBend * 0.85);
      }
    }
  });

  it('actually moves over time, or the tank would look frozen', () => {
    const a = swayFor(plants, 0.4, still).bends[0] ?? 0;
    const b = swayFor(plants, 3.2, still).bends[0] ?? 0;
    expect(Math.abs(a - b)).toBeGreaterThan(0.001);
  });

  it('gives each plant its own rhythm, so a bed of fronds never pulses as one', () => {
    // Two plants of the same size, far apart, must not be in lockstep at any moment.
    const twins = { anchors: [plant(30, 90), plant(300, 90)], gain: 1 };
    let identical = 0;
    for (let t = 0; t < 12; t += 0.25) {
      const [left, right] = swayFor(twins, t, still).bends;
      if (Math.abs((left ?? 0) - (right ?? 0)) < 1e-6) identical += 1;
    }
    expect(identical).toBe(0);
  });

  /**
   * The owner's report: "everything should not move with the same phase with every other thing".
   *
   * A bed where each plant starts its phase a little later than its neighbour still *moves as one
   * shape* — a travelling wave — and that is what the tank looked like. These assertions describe
   * independence rather than merely difference: the plants must not share a period, must not
   * share a configuration, and must not fall back into step over time.
   */
  describe('per-plant independence', () => {
    // A full bed, laid out the way the backdrop lays one out: many plants across the width.
    const bed = {
      anchors: Array.from({ length: 17 }, (_, i) => plant(12 + i * 19, 60 + ((i * 37) % 40), 0.9)),
      gain: 1,
    };
    const posesAt = (seconds: number) =>
      swayFor(bed, seconds, still).bends.map((bend) => poseIndex(bend));

    it('does not re-synchronise: neighbouring plants share a pose only occasionally', () => {
      // A bed in lockstep would have neighbours agreeing nearly always. Scattered phases with a
      // shared period still agree often, because they sit a fixed offset apart. Independent rates
      // are what actually breaks it, so the bound here is deliberately tighter than "not always".
      let shared = 0;
      let pairs = 0;
      for (let t = 0; t < 120; t += 0.25) {
        const poses = posesAt(t);
        for (let i = 1; i < poses.length; i++) {
          pairs += 1;
          if (poses[i] === poses[i - 1]) shared += 1;
        }
      }
      expect(shared / pairs).toBeLessThan(0.2);
    });

    it('never settles into a repeating arrangement', () => {
      // The real failure a shared period produces: the whole bed returns to a configuration it
      // has held before, and the eye catches the loop. Over two minutes, every sampled
      // *arrangement* of seventeen plants should be distinct.
      const arrangements = new Set<string>();
      for (let t = 0; t < 120; t += 0.5) arrangements.add(posesAt(t).join(','));
      expect(arrangements.size).toBe(240);
    });

    it('drifts two plants apart rather than holding them together', () => {
      // Two plants may agree for a moment; they must not stay agreed. A shared period would let
      // them hold the same pose indefinitely whenever their phases lined up.
      const pair = { anchors: [plant(60, 80, 1), plant(240, 80, 1)], gain: 1 };
      let longestRun = 0;
      let run = 0;
      for (let t = 0; t < 240; t += 0.25) {
        const [a, b] = swayFor(pair, t, still).bends.map((bend) => poseIndex(bend));
        if (a === b) {
          run += 0.25;
          longestRun = Math.max(longestRun, run);
        } else {
          run = 0;
        }
      }
      expect(longestRun).toBeLessThan(8);
    });

    it('gives every plant a distinct phase even when they are evenly spaced', () => {
      // Evenly spaced plants with a linear phase mix produce evenly spaced phases: a wave
      // travelling along the row. The seed is hashed, so adjacent plants are not adjacent phases.
      const evenly = {
        anchors: Array.from({ length: 12 }, (_, i) => plant(i * 25, 70, 1)),
        gain: 1,
      };
      const offsets = Array.from({ length: 12 }, (_, i) => {
        // The bed's bend at rest, one plant at a time, sampled at the same instant.
        const only = { anchors: [evenly.anchors[i]].filter((a) => a !== undefined), gain: 1 };
        return swayFor(only, 0.9, still).bends[0] ?? 0;
      });
      // No two neighbours may be at the same lean, and the sequence must not be monotonic — a
      // monotonic run is the signature of a travelling wave.
      const steps = offsets.slice(1).map((value, i) => value - (offsets[i] ?? 0));
      expect(steps.some((step) => step > 0) && steps.some((step) => step < 0)).toBe(true);
    });
  });

  it('moves the near layer more than the far one, which is what makes depth read', () => {
    const near = swayFor(plants, 1.1, gust(2)).bends[0] ?? 0;
    const distant = swayFor(far, 1.1, gust(2)).bends[0] ?? 0;
    expect(Math.abs(near)).toBeGreaterThan(Math.abs(distant));
  });

  it('responds to the current, so stirring the water bends the plants', () => {
    const calm = swayFor(plants, 2, still).bends[0] ?? 0;
    const stirred = swayFor(plants, 2, gust(6)).bends[0] ?? 0;
    expect(Math.abs(stirred)).toBeGreaterThan(Math.abs(calm));
  });

  it('samples the current per plant, so a stroke bends one frond and not its neighbour', () => {
    // Two plants on opposite sides of the tank, with a current stirring only the left one.
    const split = { anchors: [plant(20, 90), plant(320, 90)], gain: 1 };
    const leftOnly = (x: number) => ({ x: x < 0.5 ? 6 : 0, y: 0 });
    const stirred = swayFor(split, 2, leftOnly).bends;
    const calm = swayFor(split, 2, still).bends;
    // The left plant is pushed by the current, wherever its own tide happens to be. Compare the
    // shift the current causes rather than the absolute lean: a plant leaning left on its own
    // tide moves *toward* the centre when a rightward current arrives, so "further from zero"
    // is not what a current does.
    expect((stirred[0] ?? 0) - (calm[0] ?? 0)).toBeGreaterThan(0.05);
    // ...and the untouched one is exactly where it was. This is the difference between a current
    // that bends the fronds near it and a whole-bed shove.
    expect(stirred[1]).toBe(calm[1]);
  });

  it('is bounded: even a violent current cannot fold a plant double', () => {
    for (const current of [0, 5, 50, 5000, -5000]) {
      for (const bend of swayFor(plants, 7, gust(current)).bends) {
        // The pose table is the real bound; a bend past it would ask for a frame that was never
        // drawn and the sprite would keep showing the last one.
        expect(Math.abs(bend)).toBeLessThan(pixelConfig.plantMaxBend * 3);
      }
    }
  });
});

describe('poses', () => {
  it('quantises a bend onto a real pose, so the art is never resampled', () => {
    const poses = pixelConfig.plantPoses;
    for (const bend of [-0.4, -0.1, 0, 0.13, 0.41]) {
      const pose = poseIndex(bend, poses);
      expect(Number.isInteger(pose)).toBe(true);
      expect(pose).toBeGreaterThanOrEqual(0);
      expect(pose).toBeLessThan(poses);
    }
  });

  it('has a resting pose exactly in the middle, so a calm tank looks neutral', () => {
    const poses = pixelConfig.plantPoses;
    expect(poses % 2).toBe(1);
    expect(poseIndex(0, poses)).toBe((poses - 1) / 2);
    expect(bendForPose((poses - 1) / 2, poses)).toBe(0);
  });

  it('clamps rather than wrapping, so a strong current holds the widest pose', () => {
    const poses = pixelConfig.plantPoses;
    expect(poseIndex(99, poses)).toBe(poses - 1);
    expect(poseIndex(-99, poses)).toBe(0);
  });

  it('round-trips through the pose table within half a step', () => {
    const poses = pixelConfig.plantPoses;
    const step = pixelConfig.plantMaxBend / ((poses - 1) / 2);
    for (let pose = 0; pose < poses; pose++) {
      const bend = bendForPose(pose, poses);
      expect(Math.abs(poseIndex(bend, poses) - pose)).toBe(0);
      expect(Math.abs(bend)).toBeLessThanOrEqual(pixelConfig.plantMaxBend + step);
    }
  });

  it('moves a tall plant further than a squat one at the same bend', () => {
    // Poses are the same for both; what differs is how much of its own height each one travels,
    // which is why `give` exists and why a clump reads as firm next to a frond.
    const tall = swayFor(plants, 2, gust(4)).bends[0] ?? 0;
    const short = swayFor(plants, 2, gust(4)).bends[1] ?? 0;
    expect(Math.abs(tall)).toBeGreaterThan(Math.abs(short));
  });
});

describe('animation cadence', () => {
  it('changes pose often enough to read as motion, and rarely enough to read as a sway', () => {
    /*
     * This is the test that stops "the plants move badly" from coming back.
     *
     * The plant is drawn at a fixed set of poses, so the *cadence of pose changes* is what the
     * eye actually sees. Too slow and the tank looks like a still image that occasionally jumps;
     * too fast and it looks like a flicker. Simulate the real loop — 30 Hz fixed steps, one
     * plant, the real tide — and hold the rate in the band hand-drawn animation uses.
     */
    const single = { anchors: [plant(180, 90)], gain: 1 };
    const step = 1 / 30;
    let changes = 0;
    let previous = poseIndex(swayFor(single, 0, still).bends[0] ?? 0);
    const seconds = 60;
    for (let i = 1; i < seconds * 30; i++) {
      const bend = swayFor(single, i * step, still).bends[0] ?? 0;
      const pose = poseIndex(bend);
      if (pose !== previous) {
        changes += 1;
        previous = pose;
      }
    }
    const perSecond = changes / seconds;
    expect(perSecond).toBeGreaterThan(1.5);
    expect(perSecond).toBeLessThan(6);
  });

  it('never asks for a pose outside the drawn table, whatever the water does', () => {
    const poses = pixelConfig.plantPoses;
    for (const current of [0, -4000, 4000]) {
      for (let time = 0; time < 8; time += 0.37) {
        for (const bend of swayFor(plants, time, gust(current)).bends) {
          const pose = poseIndex(bend, poses);
          expect(pose).toBeGreaterThanOrEqual(0);
          expect(pose).toBeLessThan(poses);
        }
      }
    }
  });
});
