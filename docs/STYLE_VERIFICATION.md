# the fish tank — owner-directed identity and water correction

## Latest startup/GUI revision

Minimum loading duration is now **3000ms**, still gated by actual page/renderer readiness. Oimo budget is 1100 cells (formerly 4000), DPR≤1 (formerly 1.5), target 24Hz (formerly 30). Static integer-hash fragment grain adds no animated noise texture or extra render pass; GPU vertex storage is allocated on resize and reused. Duplicate unchanged resize notifications do not recreate fluid/buffers. After loading the full-window aquarium opens directly: floating identity/Fullscreen/About controls, bottom graphics status and a quiet empty-tank note. No hero, journal, footer, fake wallet or nonfunctional gameplay tools.

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
