# the fish tank — owner-directed identity and water correction

## Latest startup/GUI revision

Minimum loading duration is now **5000ms**, still gated by actual page/renderer readiness. Oimo budget is 1100 cells (formerly 4000), DPR≤1 (formerly 1.5), target 24Hz (formerly 30). Static integer-hash fragment grain adds no animated noise texture or extra render pass; GPU vertex storage is allocated on resize and reused. Duplicate unchanged resize notifications do not recreate fluid/buffers. After loading the full-window aquarium opens directly: floating identity/Fullscreen/About controls, bottom graphics status and a quiet empty-tank note. No hero, journal, footer, fake wallet or nonfunctional gameplay tools.

Observed profile: 2146 particles at 41×26 cells, 25 two-substep samples in headless Chromium on a 2-vCPU sandbox, median 4.3ms / p95 10.6ms including warmup. Earlier 8094-particle profile below is historical, not a paired same-device speed guarantee. Layout/grain screenshots inspected; physical-device profiling remains a later gate.

The original correction evidence below describes the prior version; the latest README/config/plan supersedes its 1500ms and quality-budget values.

## Acceptance and implementation

- Flat favicon: exactly one solid-blue circle, no gradients/filter/highlight; title/wordmark/README use **the fish tank**. Current palette is dark navy/blue across page, loader, dialog and controls.
- Loader word reveals prefixes `l`, `lo`, `loa`, …, `loading`, holds briefly then repeats. Screen readers receive a stable loading status rather than every character. Reduced motion shows the full word and static water; preference changes take effect immediately.
- Licensed Oimo source downloaded/pinned, studied and actually adapted: APIC particle/grid solver, pressure, aeration, boundary conditions and point-sprite water shader. Complete provenance/edit/path list: [reuse ledger](REUSE_LEDGER.md). MIT licenses ship in `public/licenses/`, not only developer docs.
- 1500ms minimum and page/renderer readiness gates preserved. Temporary water GL context, buffers/programs/shaders, resize observer, pointer/media listeners, animation frames and letter interval are disposed when startup finishes or hot reload aborts. No new provider/network requests. A water context/shader failure leaves readable loading; main renderer failure leaves accessible page status.

## Evidence

Full `npm run verify`: 78 unit tests, 11 architecture fixtures, 4 Python docs regressions, 12 desktop/mobile Chromium cases; audit 0. Tests cover finite/bounded/deterministic fluid under repeated capped impulses, real hover effect on particle state, rendered water canvas, sequential letter prefixes, actual flat SVG bytes, name/title, loader resize, readiness, reduced-motion switching and disabled-graphics fallback. Existing UI focus/navigation/status tests still pass.

Deliberate mutations observed failing (exit 1) and restored: disable hover impulses; disable simulation advancement; remove water mount; replace letter sequence with full word; add gradient definition to favicon. Each specific lettering and favicon mutation was also run separately so an earlier failure could not mask it.

A real 1440×900 rendered loader screenshot was inspected locally (temporary/ignored, not shipped). Numerical solver profile in headless Chromium on this 2-vCPU sandbox: 8094 particles, two substeps, 25 samples including warmup; median 16.1ms, p95 44.8ms. This is a measured bounded loader workload, **not** a 60fps or physical-mobile certification. DPR capped 1.5, simulation target 30Hz, no hidden-tab catch-up and no simulation in reduced motion. Original Oimo uses higher particle budgets and optional WASM; this port deliberately limits startup resources. It is an adaptation, not a pixel-identical/full upstream demo.

## Next sessions

Permanent identity/reuse requirements are in CONTRIBUTING.md, DEC-019 and IMPLEMENTATION_PLAN.md. Heavy source search/collection/study/adaptation is the default for every phase. S03 remains next; a cosmetic loader does not implement fixed-step aquarium gameplay or S04 water physics.

S04: floor-pooled loader now receives a bounded initial sideways push, no warmup/drop. After loading, native Pixi height-field refraction and credited caustic/depth effects show the tank directly; cursor/touch disturbances apply in the tank, not on HUD controls. See `docs/S04_VERIFICATION.md` for current evidence and hardware-performance limitations.

## Reference redesign (DEC-022)

The owner supplied day/night reference images and ruled on the look. Current state:

- **Borders: none.** A computed-style sweep of every element outside the dialog finds no visible border; `scripts/verify-architecture.mjs` now rejects CSS borders and one-pixel rules, and the shell test asserts the sweep stays empty. The old renderer drew a hard 1px `surface` rule across the tank; that was the frame the owner rejected and it is gone, replaced by stacked translucent glow bands plus a DOM waterline bloom and an edge vignette.
- **Palette: the reference.** Teal/green plants (`--art-{plant,stem,moss}-scale` ramps), warm limestone sand lit at the crown and darkening with depth, amber day rays (`--day-ray`), cyan night water (`--night-ray`, `--night-surface`). The interface keeps one quiet dark scheme reading the same tokens.
- **Day/night: live.** `moodAt` is the only definition of 45s day / 15s fade / 45s night / 15s fade, shared by the renderer and the `data-mood` attribute; reduced motion freezes the night mood. Unit tests pin the phase boundaries, the endpoints, cycle closure and a monotonic fade.
- **Title and controls.** The product name is on the splash only; the tank keeps an `sr-only` level-1 heading whose box is ≤1px. One settings icon opens the only dialog; quality, reduce motion, fullscreen, graphics state and links all live inside it. No "renderer ready" line, no empty-tank note, no build hash, no feature checklist.
- **Water compositing.** The art is drawn opaque by the backdrop sprite. A translucent `water-body` filter darkens by depth, then an **additive** light pass adds caustics, god rays, a sun shaft, the surface band and the ripple glow. Sampling the scene texture inside a Pixi v8 filter was tried three ways and never worked (uniform type rejection, then black binding); this architecture is the one that works and should not be reverted.
- **Honest degradation.** If the water shaders fail, the host is marked `degraded`, the pixel tank still renders, and the dialog says the water effects are unavailable rather than "Ready".
- **Loader.** The fluid now starts as a settled lattice at a flat half-full waterline instead of a pushed floor pool that never flattened, and drifts with a slow convection term. Sprites are quantised into square pixel cells so the splash shares the tank's pixel language.

Evidence for this revision: 93 unit tests, 18 architecture fixtures, 4 Python docs regressions, 24 desktop/mobile Chromium cases, `tsc` clean, `verify:architecture` and `verify:docs` passing. Deliberate mutations observed failing and restored: revert the loader to the pushed floor pool; change `daySeconds` to 44; rename `--water-glow` in one mood block; add a CSS border. Screenshots of the day tank, night tank, dialog and splash were inspected locally (temporary, not shipped).
