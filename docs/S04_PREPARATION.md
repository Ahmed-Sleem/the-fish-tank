# S04 preparation — reuse-first interactive tank

S03 merged through PR #8, merge commit `ae23c60907a55c74b6ffb12298ec9ee5a7c129f8`; hosted verify run 42917055765 passed. This change prepares S04, not an implementation or performance claim.

## Owner direction

Reuse existing implementations rather than build unrelated replacements. Immediately after loading, show the tank in front of the player, with cursor interactions in the aquarium itself. Preserve the mysterious dark-blue identity, hand-drawn creature vision and no landing page. Do not substitute another project's finished fish/reef game for the planned drawing game.

## Downloaded and studied

### jeantimex/threejs-water

User demo: https://jeantimex.github.io/threejs-water/ . Full repository archive downloaded locally at immutable commit `f35a700a16fe386beac997806ed4471018c93ef7`. Selected unmodified source and license retained under `docs/design-references/threejs-water/`, hash registered. MIT explicitly credits original Evan Wallace (2011) and modified Yong Su (2026); preserve both, despite GitHub's NOASSERTION metadata.

Studied `Water.ts` ping-pong height/velocity buffers, `WaveSimulation.frag` four-neighbor Laplacian, damping and stability scaling, `WaterRipple.frag` aspect-correct raised-cosine impulse, `InteractionController.ts` coalesced pointer movement and touch ownership, and caustic shader. The shader's actual G channel is velocity; a class overview comment calls it previous height, so port the executable math, not that contradictory comment.

Primary S04 adaptation candidate: bounded ping-pong ripple simulation + cosine input kernel. Port to existing Pixi8 render textures/filter pipeline, not a second Three renderer. Retune timestep coefficients to canonical 30Hz and validate stability. Raycast pool/3D obstacle code is not directly transferable to the current screen-space tank. Refraction/caustics need Pixi UV/uniform/premultiplied-alpha adaptation; upstream Three ShaderMaterial code is not drop-in. Do not import skybox, duck or tile assets without separate provenance review.

### @screenjoy/fishtank 0.1.0

Downloaded npm tarball without installing/executing it. Integrity: `sha512-WJAs18eeCf+6Ba/uE1IvZNitFCkRZGHeZ+9FPJEgowpF/AmHvTE5zJOLpvNs75FKGdz1lusL4vzDNLb5OJgaDA==`; registry shasum `21d60816a74d5c016e48ae3cc979d5137eb0460f`. MIT, Copyright 2026 Steven Partridge. Package declares `three ^0.185.1` and `@screenjoy/runtime 0.1.0`. Selected original source/license/package metadata retained under `docs/design-references/screenjoy/`.

Studied `reef-environment.ts` caustic function, depth gradient, merged static geometry and animated uniform; `fish-tank.ts` pointer normalization/raycast, pooled bubble motion and unique resource disposal. Adapt the credited caustic function/depth layering as the compatible inexpensive fallback to the water demo's heavier optical pipeline. Reuse pool/lifecycle techniques within S03, not a parallel custom-element app. No runtime dependency installed; full dependency audit required if that decision changes. GLB fish and reef geometry are not adopted: later drawing/creature sessions own fish and environment assets.

### Fish Tank Plus

Studied accessible public page text at https://play.fishtankplus.com/ and its product page through page retrieval. Public UI exposes an immersive front-glass view, water brightness/caustic/light-shaft controls, bubbles/particles, graphics presets and fullscreen. Useful direction: tank-first presentation with restrained controls and layered depth. These are observations of public content, not verification of its running 3D engine.

Direct sandbox HTTPS access failed (`SSL_ERROR_SYSCALL`); page retrieval exposes text, not a runnable scene or downloadable JS source. GitHub repository search for `fishtankplus` returned no results. No reusable source/license established. Do not imply free-to-play means open-source, copy bundled assets, or bypass access controls. Track source access as an open reuse lead; owner may supply a licensed repository/archive or permission. No camera tracking, account, rewards, feeding or phone sensor feature adopted.

## S04 implementation plan (next numbered session)

1. Integrate the pinned water demo's impulse/height-field math into `src/sim/water` and Pixi effect passes. Reuse existing loop, seed, quality config, ordered layers, CSS theme, typed lifecycle and shared settings.
2. Tank-first reveal: resolve the scene/effect readiness before removing loader; no landing/entry screen. Give the empty tank clear water depth/surface cues without shipping placeholder creatures. Keep source-specific credit on adapted code and release licenses.
3. Post-loader pointer hover creates subtle local flow; click/drag and touch create visible bounded ripples. Normalize coordinates against canvas bounds; coalesce move events, cap impulse queue/strength, ignore HUD/dialog input and reset on pointer cancellation. No camera permission or pointer lock.
4. Shared curl flow from existing simplex-noise dependency advects particles consistently. Adapt Screenjoy caustic/depth function to Pixi if heavy optics do not fit budget; all effect budgets come from shared quality config. Reduced motion disables continuous distortion and pointer-driven animation; controls remain usable.
5. Cover pointer/touch/scripted impulses, repeated-input finite stability, resize/DPR, visibility, abort/context teardown and Low/High differences. Every added check gets break/fail/restore evidence. Capture a browser visual proof after loader, not only dataset assertions.
6. Benchmark effect CPU/GPU/frame costs against S04's 1.5ms effect target and 60fps empty-tank target. Record hardware/method; software Chromium alone cannot certify real-device budgets (GAP-005). Document fallback decisions rather than silently omitting displacement/flow.

No S04 runtime code changed in this preparation. No additional package or fetched script executed. Next work must validate actual cursor response, rendered tank appearance and compatibility before calling S04 complete.
