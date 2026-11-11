/** The art grid and its layout, all on the reference's low-resolution pixel canvas.
 * Changing the tank's scenery happens here, not in drawing code.
 */
export const pixelConfig = {
  /** Reference grid: 344×192, drawn with nearest-neighbour sampling. */
  width: 344,
  height: 192,
  seed: 20261111,
  /** Where the sand line sits, as a fraction of the grid height. */
  groundBase: 0.85,
  pebbles: 70,
  /** [xFraction, yFraction, radiusX, radiusY, seed] */
  rocks: [
    [0.23, 0.79, 17, 20, 1],
    [0.8, 0.845, 14, 10, 4],
    [0.83, 0.83, 16, 14, 7],
    [0.73, 0.885, 10, 6, 9],
  ],
  /** [xFraction, yFraction, radiusX, radiusY, seed] */
  clumps: [
    [0.1, 0.635, 26, 24, 1],
    [0.19, 0.655, 20, 18, 2],
    [0.055, 0.71, 18, 16, 3],
    [0.16, 0.815, 40, 20, 4],
    [0.105, 0.8, 26, 14, 5],
    [0.29, 0.815, 26, 15, 6],
    [0.45, 0.825, 28, 15, 7],
    [0.7, 0.815, 42, 21, 8],
    [0.645, 0.83, 26, 12, 9],
    [0.565, 0.835, 18, 10, 10],
    [0.83, 0.845, 22, 12, 11],
  ],
  /** [xFraction, frondCount, spreadRadians, length, width] */
  fans: [
    [0.14, 7, 2.0, 42, 7],
    [0.08, 4, 1.2, 28, 6],
    [0.35, 8, 2.5, 23, 7],
    [0.89, 7, 1.9, 52, 9],
    [0.95, 4, 1.0, 34, 7],
    [0.47, 4, 1.4, 18, 6],
  ],
  /** [xFraction, height, phase] */
  stems: [
    [0.27, 44, 0],
    [0.32, 50, 2],
    [0.22, 34, 4],
    [0.75, 60, 0],
    [0.79, 78, 1.7],
    [0.83, 88, 3.4],
    [0.87, 94, 5.1],
    [0.92, 80, 6.8],
    [0.95, 86, 8.5],
    [0.72, 48, 10.2],
    [0.97, 60, 11.9],
  ],
} as const;
