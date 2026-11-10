# S03 — fixed-step tank scene and quality controls

Implemented on `arena/30d2a455-the-fish-tank`. Loader starts as a zero-velocity lower-half pool, without warmup; minimum three seconds/readiness and Oimo pointer input remain.

## Implementation

- Ten ordered Pixi containers reserve the tank hierarchy; CSS provides the existing dark-blue gradient. A subtle surface and seeded 96-object particle pool now render in Pixi. No fish or gameplay claimed.
- 30Hz fixed accumulator, interpolated positions, at most five updates/frame, 200ms frame clamp and visibility reset. Quality affects presentation, not simulation time.
- Settings: Low 16 / Medium 48 / High 96 visible particles, DPR ceilings 1 / 1.5 / 2. Preferences last this visit only. System reduced motion always wins; user can also pause motion.
- ResizeObserver/window resize, visibility, abort and WebGL context-loss teardown. No new runtime dependency. MainLoop.js MIT pattern adapted; source/license pinned in reuse ledger.

## Proof

Unit coverage: bottom-loaded zero-velocity initial state; render cadence equivalence at 30/60/144Hz; exact 30 ticks/second; bounded catch-up/reset/alpha/invalid delta; 10,000 updates preserve finite pooled object identities. Browser coverage on desktop/mobile Chromium: quality/resolution, system/user motion, resize/DPR, visibility and context loss without page errors.

Controlled regressions, restored before verification: upper-start loader, 60Hz simulation, unbounded catch-up each failed targeted Vitest (exit 1); ignoring quality configuration failed focused browser test (exit 1). Logs retained during work under `/tmp/s03-negative-*`.

Software Chromium / Linux sandbox, 1280×800, DPR1, 120 RAF samples per preset: low median 21.3ms/p95 24.7ms; medium 22.2/24.7ms; high 23.3/26.7ms. These include browser/software rendering and are not GPU or real-device budget certification. GAP-005 remains open. Screenshot inspected: direct dark-blue aquarium, subtle surface/particles, HUD preserved. No S04 ripple/current work included.

Full local `npm run verify` passed: 84 unit, 16 browser, 11 architecture and 4 documentation tests; format/lint/typecheck/build, immutable-source/hash checks and dependency audit (zero vulnerabilities). Hosted CI/deployment not yet claimed.
