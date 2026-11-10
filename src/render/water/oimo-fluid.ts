/**
 * APIC water adapted from saharan/works water/src/Main.hx, MIT (c) 2023 saharan.
 * Revision f34a4951a95ba178bfc9964d08dc898795ea4736. Full license in
 * docs/design-references/oimo/LICENSE.txt. Quadratic B-spline transfer,
 * pressure, affine velocity, mirror boundaries and aeration retained.
 * Changes: compact TS loops, seeded jitter, loader budgets and capped hover input.
 */
import { waterConfig as cfg } from '../../config/water.config';
import { createRandom } from '../../core/random';
const P = { air: 0, x: 1, y: 2, vx: 3, vy: 4, a: 5, b: 6, c: 7, d: 8, density: 9, size: 10 };
const C = { mass: 0, air: 1, vx: 2, vy: 3, dx: 4, dy: 5, size: 6 };
const read = (data: Float64Array, index: number) => data[index] ?? 0;
const add = (data: Float64Array, index: number, value: number) => {
  data[index] = read(data, index) + value;
};
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export interface WaterPointer {
  x: number;
  y: number;
  dx: number;
  dy: number;
  active: boolean;
}
export class OimoFluid {
  readonly width: number;
  readonly height: number;
  readonly particles: Float64Array;
  readonly grid: Float64Array;
  readonly count: number;
  private random = createRandom(cfg.seed);
  constructor(width: number, height: number) {
    if (!Number.isFinite(width) || !Number.isFinite(height))
      throw new RangeError('Invalid water bounds');
    this.width = Math.min(cfg.maxWidth, Math.max(8, Math.floor(width)));
    this.height = Math.min(cfg.maxHeight, Math.max(8, Math.floor(height)));
    const positions: number[] = [];
    // Start at rest against the floor, not as a suspended box that drops on entry.
    // Half-tank volume, full usable width; same density and zero initial momentum.
    for (let y = this.height * 0.5; y < this.height - 1.001; y += cfg.spacing) {
      for (let x = 1.001; x < this.width - 1.001; x += cfg.spacing) {
        positions.push(0, x, y, 0, 0, 0, 0, 0, 0, cfg.density);
      }
    }
    this.particles = new Float64Array(positions);
    this.count = positions.length / P.size;
    this.grid = new Float64Array(this.width * this.height * C.size);
  }
  private stencil(p: number, visit: (cell: number, weight: number, x: number, y: number) => void) {
    const px = read(this.particles, p + P.x),
      py = read(this.particles, p + P.y);
    const gx = Math.floor(px),
      gy = Math.floor(py),
      dx = gx + 0.5 - px,
      dy = gy + 0.5 - py;
    const wx = [(dx + 0.5) ** 2 * 0.5, 0.75 - dx * dx, (dx - 0.5) ** 2 * 0.5];
    const wy = [(dy + 0.5) ** 2 * 0.5, 0.75 - dy * dy, (dy - 0.5) ** 2 * 0.5];
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 3; x++) {
        visit(
          ((gy - 1 + y) * this.width + gx - 1 + x) * C.size,
          (wx[x] ?? 0) * (wy[y] ?? 0),
          dx + x - 1,
          dy + y - 1,
        );
      }
  }
  private boundaries(pressure: boolean) {
    const mirror = (a: number, b: number, flipX: boolean, flipY: boolean) => {
      a *= C.size;
      b *= C.size;
      for (const [field, flip] of pressure
        ? ([
            [C.dx, flipX],
            [C.dy, flipY],
          ] as const)
        : ([
            [C.mass, false],
            [C.vx, false],
            [C.vy, false],
          ] as const)) {
        const value = read(this.grid, a + field) + read(this.grid, b + field) * (flip ? -1 : 1);
        this.grid[a + field] = value;
        this.grid[b + field] = value * (flip ? -1 : 1);
      }
    };
    for (let y = 0; y < this.height; y++) {
      const i = y * this.width;
      mirror(i, i + 1, true, false);
      mirror(i + this.width - 1, i + this.width - 2, true, false);
    }
    for (let x = 0; x < this.width; x++) {
      mirror(x, x + this.width, false, true);
      mirror(x + (this.height - 1) * this.width, x + (this.height - 2) * this.width, false, true);
    }
  }
  step(pointer: WaterPointer) {
    const data = this.particles,
      grid = this.grid;
    grid.fill(0);
    // Particle-to-grid affine mass/momentum transfer.
    for (let p = 0; p < data.length; p += P.size)
      this.stencil(p, (c, w, x, y) => {
        add(grid, c + C.mass, w);
        add(grid, c + C.air, w * read(data, p + P.air));
        add(
          grid,
          c + C.vx,
          w * (read(data, p + P.vx) + read(data, p + P.a) * x + read(data, p + P.b) * y),
        );
        add(
          grid,
          c + C.vy,
          w * (read(data, p + P.vy) + read(data, p + P.c) * x + read(data, p + P.d) * y),
        );
      });
    for (let c = 0; c < grid.length; c += C.size) {
      const m = read(grid, c + C.mass);
      if (m > 0) grid[c + C.air] = read(grid, c + C.air) / m;
    }
    this.boundaries(false);
    // Density estimation, aeration diffusion and pressure gradient.
    for (let p = 0; p < data.length; p += P.size) {
      let density = 0,
        air = 0;
      this.stencil(p, (c, w) => {
        density += w * read(grid, c + C.mass);
        air += w * read(grid, c + C.air);
      });
      data[p + P.density] = density;
      data[p + P.air] =
        cfg.aerationDamping *
        (read(data, p + P.air) + (air - read(data, p + P.air)) * cfg.aerationBlur);
      const coefficient =
        (4 * -Math.max(0, (density / cfg.density - 1) * cfg.pressure)) / Math.max(density, 1e-6);
      this.stencil(p, (c, w, x, y) => {
        add(grid, c + C.dx, -w * coefficient * x);
        add(grid, c + C.dy, -w * coefficient * y);
      });
    }
    this.boundaries(true);
    // Grid momentum-to-velocity; cursor drags water on hover (upstream requires press).
    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++) {
        const c = (y * this.width + x) * C.size,
          mass = read(grid, c + C.mass);
        if (mass <= 0) continue;
        let vx = (read(grid, c + C.vx) + read(grid, c + C.dx)) / mass;
        let vy = (read(grid, c + C.vy) + read(grid, c + C.dy)) / mass + cfg.gravity;
        const distance = Math.hypot(pointer.x - x - 0.5, pointer.y - y - 0.5);
        if (pointer.active && distance < cfg.pointerRadius) {
          const weight =
            distance < cfg.pointerRadius * 0.5 ? 1 : 2 - (distance / cfg.pointerRadius) * 2;
          vx +=
            weight *
            (clamp(pointer.dx / cfg.substeps, -cfg.maxPointerVelocity, cfg.maxPointerVelocity) -
              vx);
          vy +=
            weight *
            (clamp(pointer.dy / cfg.substeps, -cfg.maxPointerVelocity, cfg.maxPointerVelocity) -
              vy);
        }
        grid[c + C.vx] = vx;
        grid[c + C.vy] = vy;
      }
    // Reflect boundary velocities.
    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++) {
        const c = (y * this.width + x) * C.size;
        if (x === 0) grid[c + C.vx] = Math.abs(read(grid, c + C.size + C.vx));
        if (x === this.width - 1) grid[c + C.vx] = -Math.abs(read(grid, c - C.size + C.vx));
        if (y === 0) grid[c + C.vy] = Math.abs(read(grid, c + this.width * C.size + C.vy));
        if (y === this.height - 1)
          grid[c + C.vy] = -Math.abs(read(grid, c - this.width * C.size + C.vy));
      }
    // Grid-to-particle transfer and affine velocity gradient reconstruction.
    for (let p = 0; p < data.length; p += P.size) {
      let vx = 0,
        vy = 0,
        a = 0,
        b = 0,
        c = 0,
        d = 0;
      this.stencil(p, (cell, weight, x, y) => {
        const wx = weight * read(grid, cell + C.vx),
          wy = weight * read(grid, cell + C.vy);
        vx += wx;
        vy += wy;
        a += wx * x;
        b += wx * y;
        c += wy * x;
        d += wy * y;
      });
      const px = read(data, p + P.x),
        py = read(data, p + P.y);
      const nx = clamp(px + vx, 1.001, this.width - 1.001),
        ny = clamp(py + vy, 1.001, this.height - 1.001);
      vx = nx - px;
      vy = ny - py;
      const acceleration = Math.hypot(vx - read(data, p + P.vx), vy - read(data, p + P.vy));
      const ratio = read(data, p + P.density) / cfg.density;
      if (ratio < cfg.aerationThreshold)
        data[p + P.air] = Math.min(
          1,
          read(data, p + P.air) +
            acceleration * (1 - ratio / cfg.aerationThreshold) * cfg.aerationCoefficient,
        );
      data[p + P.x] = nx + (this.random.next() - 0.5) * 2e-4;
      data[p + P.y] = ny + (this.random.next() - 0.5) * 2e-4;
      data[p + P.vx] = vx;
      data[p + P.vy] = vy;
      data[p + P.a] = 4 * a;
      data[p + P.b] = 4 * b;
      data[p + P.c] = 4 * c;
      data[p + P.d] = 4 * d;
    }
  }
  writeVertices(output: Float32Array, scale: number) {
    for (let i = 0; i < this.count; i++) {
      const p = i * P.size,
        v = i * 4;
      output[v] = read(this.particles, p + P.x) / this.width;
      output[v + 1] = read(this.particles, p + P.y) / this.height;
      output[v + 2] =
        scale *
        cfg.spacing *
        0.85 *
        Math.min(read(this.particles, p + P.density) / cfg.density + 0.5, 1.5) *
        2;
      output[v + 3] = clamp(read(this.particles, p + P.air), 0, 1);
    }
  }
}
