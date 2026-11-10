/** Explicit-state Numerical Recipes LCG. Deterministic, not cryptographic. Never replace Math.random globally. */
export function createRandom(seed: number) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new RangeError('Expected uint32 seed');
  let state = seed;
  return {
    next() {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 0x100000000;
    },
    snapshot() {
      return state;
    },
  };
}
