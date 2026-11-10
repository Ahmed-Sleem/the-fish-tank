# S04 — shared currents and interactive water

## Delivered scope

- Loader minimum is **5000ms**, still gated by actual page/renderer readiness. Oimo starts as the existing floor pool, with a bounded lateral/upward velocity impulse (maximum 0.22 grid units). No suspended drop, warmup or second solver. System reduced motion renders it statically.
- The loader hands off directly to the full-window front-glass tank: depth gradient, glass edges, floor/surface cues, restrained shafts and animated caustics. No landing page, placeholder fish or new economy/drawing feature.
- Shared seeded 48×27 curl-noise field uses installed MIT simplex-noise; pointer velocity injects capped local current which decays. Particles sample it; future entities can reuse the same API.
- **Actual GPU ping-pong height/velocity field** in two RGBA16F Pixi render textures; clamped four-neighbor stencil, damped velocity, aspect-correct raised-cosine input. The height gradient refracts tank shading and the particle layer through native Pixi8 filters. This is not a CSS ripple or circle animation.
- Hover disturbs water; click/drag/touch makes stronger impulses. A single coalesced pending impulse bounds event flooding. Coordinates are canvas-relative, nonfinite/out-of-bounds input is rejected; pointer leave/cancel clears it. Controls/open dialogs do not inject water. Tank touch panning is suppressed while pinch zoom remains available.
- Low/Medium/High use 48/80/128 wave grids and 240/360/640px maximum effect widths, filter resolution ceilings .5/.75/1, and increasing caustic/ray strength. Existing particle/DPR budgets remain. Simulation stays on the canonical bounded 30Hz loop.
- Reduced motion freezes effects and clears ripples; visibility resets time debt/input/current/height state. Resize adjusts shader aspect and render areas. Abort/context loss removes input/resize/visibility listeners, RAF, filter resources and textures. The tank performs its first draw before readiness; behind the inert loader it does not run a second animated water scene.
- Lack of floating-point framebuffer support follows the existing truthful graphics-failure path (HTML controls and CSS backdrop remain), rather than announcing a broken renderer as ready.

## Borrowed code and compatible alternatives

`docs/S04_PREPARATION.md` records downloaded source, provenance and the original comparison. Runtime wave/impulse shaders adapt MIT jeantimex/threejs-water `f35a700a16fe386beac997806ed4471018c93ef7`, originally Evan Wallace, modified Yong Su. Screenjoy @screenjoy/fishtank 0.1.0 supplies the credited procedural caustic function. Complete distribution licenses are under `public/licenses/`; selected originals are hash registered.

Changes: Three renderer/material/raycast code removed, Pixi8 Filter/RenderTexture/UniformGroup lifecycle used; timestep coefficients retuned to 30Hz, explicit bounds/quality and event coalescing added. Screenjoy lighting adapted to dark-blue palette and uniform-driven intensity/scale/speed. Rays are an inexpensive compatible procedural alternative, not an imported volumetric renderer. No Three runtime, GLB fish, reef models, skyboxes, networking or new package installed.

TECH_SPEC reference audit: ScottieFox/caustic-volume `d87351bff19831aa9d11c0679605fad6797b133f` photon-volume shader uses scene/object/sun tracing; too coupled/heavy for this front-view Pixi layer. HowdyKeith/swek-webgl2-water `8b025bb29c714e1e58bfa4743420a8b48dee6899` uses float ping-pong RG height/velocity and also explicitly gates float framebuffers. AsimRauf/liquid-ripple `c5f3ba09765a8f659cf427509360fc88b65b28f5` uses a fixed analytic ripple uniform array; not chosen over the requested actual height field. Their source was downloaded/studied in the research workspace, not shipped. jamisonhill/aquarium `2a6e16ce5df82b858183c02624d2ac5e605faec5` LICENSES.md enumerates dependencies but does not establish a project-code license; no project code copied. Fish Tank Plus remains public-interface inspiration only, not a licensed source claim.

## Verification design and observed regressions

- Unit tests cover latest-only bounded input, invalid input rejection, clear, hover/press strength, seeded finite pooled curl field, injected velocity decay and repeated large impulses. Existing loader/state tests now guard the five-second minimum and bounded startup push.
- Browser test freezes RAF and compares **equal-time rendered pixels**, with and without scripted touch/hover. Localized pixel changes prove real rendered ripples, not just event counters. It then runs 180 repeated GPU impulses and checks that rendered output remains bounded/nonblank, without page errors. Desktop and emulated-mobile exercise the same check.
- Real browser pointer down/move/up, settings/dialog rejection, quality grids, reduced motion and cancellation are covered alongside S03 resize/DPR/visibility/context tests. Mobile emulation is not a physical device claim.
- Controlled regressions: minimum back to 3000ms; startup push zero; input strength zero; flow injection clamp zero each produced targeted Vitest exit 1. Returning before pointer ingestion produced both new desktop browser test failures (exit 1). Disabling the float-capability guard also failed the new unsupported-target browser check (exit 1). Exact files restored afterwards. Logs during work: `/tmp/s04-negative-*`.
- During integration, equal-time pixel comparison caught a real filter-coordinate bug: Pixi's pooled input UV was mistaken for normalized field UV. Added a normalized vertex varying; same test then observed localized changes. Screenshot inspected: visible concentric ripple on the tank, dark glass/depth/caustic background and working HTML HUD.

## Performance and remaining hardware gate

Linux sandbox, 2 vCPU, software SwiftShader Chromium, 1000×700/DPR1; 60 RAF samples per preset after warmup. CPU submission wave median/p95: low .1/.3ms, medium 0/.2ms, high 0/.2ms (timer quantization applies). Scene submission p95 .6/.3/.3ms. These are **CPU submission**, not GPU execution timings. Observed software RAF median/p95: low 167.1/318ms; medium 176.1/335.8ms; high 199.7/367ms. This software environment does not meet 60fps and must not be presented as a successful GPU budget result. Bounded effect widths reduce raster workload but do not certify a real device.

The <1.5ms GPU ripple and 60fps mid-mobile/laptop targets remain **unverified hardware acceptance GAP-005**; they require real hardware profiling. Feature implementation is complete, but this performance gate is explicitly open. No claim of complete real-device validation or later-session gameplay is made.

## Final local result

`npm run verify` passed in full: **86 unit tests, 22 desktop/mobile browser tests, 11 architecture tests, 4 documentation tests**, format/lint/typecheck/build, immutable source/snapshot hashes and dependency audit (zero vulnerabilities). Distribution licenses compared byte-for-byte with retained originals. Final equal-time rendered comparison observed 27,047 color-channel changes over threshold and a localized visible ripple; screenshot inspected. No production debug/profiling hooks remain. Hosted PR checks and physical GPU acceptance are separate gates.
