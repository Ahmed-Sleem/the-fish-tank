# Project decisions and interpretations

Date: 2026-11-08. These notes clarify planning; the supplied idea/spec remain unchanged.

| ID      | Question                           | Choice / rationale                                                                                                                                                                                                                                                                                                  | State                           |
| ------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| DEC-001 | Hosting and architecture           | Plan for static GitHub Pages hosting, browser-only simulation/storage and direct player-key AI requests. No game server or owner-funded AI. Optional collector remains external and disabled.                                                                                                                       | Planning baseline; not deployed |
| DEC-002 | Session granularity                | Decompose the 12 ordered phases into 39 cohesive sessions, including verification/handoff. Split a future step before starting if actual scope exceeds a session; never trade correctness for the schedule.                                                                                                         | Adopted                         |
| DEC-003 | Production MockProvider conflict   | TECH_SPEC §12.10 mentions mock demo mode; working rules prohibit production mocks. Use genuine drawing-derived procedural fallback in production; MockProvider exists only under tests/harness.                                                                                                                     | Adopted                         |
| DEC-004 | “Birth is free” wording            | Birth needs no AI image; text/vision pricing still depends on the selected provider/model/account. Only no-key procedural play is guaranteed to make no paid AI requests. State this accurately in onboarding.                                                                                                      | Adopted                         |
| DEC-005 | Key persistence                    | Session-only default plus explicit opt-in to remember in IndexedDB. Never localStorage, export, sync or logs. Explain browser storage is not a vault. This adds a safer option without removing specified local persistence.                                                                                        | Adopted                         |
| DEC-006 | Unspecified packaging/UI framework | Plan npm (permitted by spec), HTML/CSS overlay with shared TypeScript UI primitives; no extra framework required. Exact versions, supported Node and dependency audits are chosen in S01, not invented now.                                                                                                         | Planned                         |
| DEC-007 | Branding/audio/plants              | Working title Tank; soft handmade creatures in luminous water, English i18n-ready, low-volume optional audio; procedural L-system plants required, image plants optional and deferred. No v1 accounts.                                                                                                              | Spec defaults retained          |
| DEC-008 | Deletion authentication            | A public installId alone cannot authorize destructive collector requests. S32 specifies a separate local deletion credential, never included in exports/sync payloads. Collector implementation/legal review remains owner responsibility.                                                                          | Planned security refinement     |
| DEC-009 | Import semantics                   | “Merge as new tank” imports an independent selectable local tank, not a silent merge of entity/reward IDs into the active tank. S12 documents identity handling and validates lineage.                                                                                                                              | Planned interpretation          |
| DEC-010 | Ink conflicts                      | Original idea says only drawn length costs and lifting pen is free; organized idea agrees, but TECH_SPEC §8 adds per-stroke overhead and width weighting. Preserve both sources; obtain owner resolution before finalizing S05 pricing, with original idea prevailing unless owner explicitly approves the formula. | OPEN: GAP-002                   |
| DEC-011 | Spec cross-reference mistakes      | Growth/offspring/plant job section numbers in earlier spec prose are stale. Use named headings: Birth §12.5, Growth §12.6, Offspring §12.7, Plant §12.8; image pipeline §12.4, keys §12.2. Do not alter original attachment.                                                                                        | Adopted navigation correction   |
| DEC-012 | Evidence vs estimates              | Targets and repository/license claims in the spec are requirements/research leads, not verified facts. Provider browser support, dependency versions, performance and Pages live behavior need evidence in their owning sessions.                                                                                   | Adopted                         |

## Research policy

No nontrivial implementation technology is newly substituted in this planning pass. Primary-document and live-browser verification is scheduled before dependent implementation, especially S01, S04, S19 and S30. Published official guidance to consult at those steps:

- Vite static deployment: https://vite.dev/guide/static-deploy.html#github-pages
- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- IndexedDB lifecycle/storage guidance: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

These URLs are research entry points, not a claim they or provider APIs were live-tested here. The planning environment only permits a limited set of network hosts; official sites outside that set must be checked in an environment that can access them. If a locked requirement proves impossible, stop that dependent step and inform the owner rather than changing architecture silently.

## Hosting research observed in this planning session

On 2026-11-08, retrieved `vitejs/vite` official source `docs/guide/static-deploy.md` through GitHub API. Latest path commit returned: `8a4c19cfc035f2dd203f2fa6d00ab9256a5e77c9`.

Source: https://github.com/vitejs/vite/blob/8a4c19cfc035f2dd203f2fa6d00ab9256a5e77c9/docs/guide/static-deploy.md

Observed guidance confirms project Pages hosting needs `base: '/<REPO>/'`, Pages source set to GitHub Actions, and a workflow that builds before deployment. Therefore S38 explicitly uses `/the-fish-tank/`, tests built subpath assets and checks Pages settings. This verifies the hosting planning pattern only—not this repository's future deployment or provider compatibility.

## DEC-013 — Early Pages delivery (2026-11-08, owner requested)

Bring Pages deployment plumbing from S38 into S01, preserving gameplay-phase order. Publish verified pushes from `arena/f3e87408-the-fish-tank` to the single repository Pages site; do not automatically publish unrelated branches. The site is explicitly an incremental development build. Owner authorization is from the latest chat request; no further approval is needed for those branch deploys. GitHub API activation returned 403, so owner setup is required. S38/S39 still validate the finished release. No main-branch switch or merge is authorized or performed.

## DEC-014 — Compatible toolchain and scoped declaration limitation (2026-11-08)

Node 22.22.3/npm 10.9.8; exact versions in package.json/lockfile. Registry-latest TypeScript 7 is outside typed ESLint's declared `<6.1.0` compatibility, so use latest supported TS6.0.3. Pin Vite8.3.7/Vitest5.1.0/Pixi8.22.0/Paper0.17.0/Dexie4.4.7/Zod4.6.7/simplex-noise4.0.3. Optional filters/workers wait for their actual feature audit.

Pixi's external bitmap-font declaration fails exact-optional checking; `skipLibCheck: true` skips external declaration internals, not strict app code. GAP-012 records this limitation. A lint-only transitive minimatch vulnerability is patched through exact override 11.0.5; full audit and tests pass. Do not hide it with an audit suppression.

## DEC-015 — Honest early shell (2026-11-08)

Publish a responsive, static, underwater-styled development shell and actual empty Pixi renderer status, commit identifier and working source/plan links. No canned fish or fake wallet/AI buttons. Its temporary overlay is not the final gameplay layout. Design tokens and strings are shared from the start; the complete UI library and entity schemas remain S02. No art or simulation code has been copied from upstream projects yet.

## DEC-016 — Durable manual-install Pages handoff (2026-11-08)

The owner could not find the prior temporary ZIP or destination folder and asked for downloadable plain files in the repo, with unnecessary archives cleaned up. Store canonical inert handoff files in `docs/github-pages-setup/`, with explicit destination `.github/workflows/ci.yml` and `.github/workflows/pages.yml` on main. Do not activate or write workflow paths through the integration. No archive is needed; none exists in the fresh checkout.

Use stable main in these owner-installable templates rather than a stale Arena-session branch. Both app PRs have been merged into the checkout's main ancestry. This prepares a conventional merge-to-publish path for owner review/installation; it does not activate deployment or authorize this agent to switch/push/merge main. Retain build-before-deploy, pinned actions and least-privilege permissions. Earlier session-branch publishing notes describe the superseded draft, not a deployed service.

## DEC-017 — Installed workflows are canonical; README is for players (2026-11-08)

Owner completed manual installation by moving both YAML files into `.github/workflows/` and enabling Pages Actions. Retire all requirements for duplicate handoff copies. Validate and link only to installed files. The old setup folder README remains a small compatibility pointer so prior links do not strand users. No YAML edits, permission workarounds or verification bypass needed.

Per the owner's explicit request, README.md is the end-user guide: current build/open URL, usable controls, limitations, browser support and data/cost. Update it in the same change as user-visible behavior and check against the real app. Record a reason if an internal-only change needs no player-doc edit. Developer commands move to docs/DEVELOPMENT.md, deployment operations stay in docs/DEPLOYMENT.md, standing policy is in CONTRIBUTING.md. Original uploaded rules remain unchanged to preserve source integrity.

## DEC-018 — S02 contract and UI choices

Use strict v1 saves and separate normalized AI trait input. There is no historical persisted format to migrate yet; reject unsupported versions rather than silently guess. `humanAncestry` follows spec §11.5: a list of root UUIDs and percentage contributions summing to 100, not a scalar ancestry score. Root-drawn fish own 100% of their contribution. Family-tree recomputation remains S26. Persist RNG state separately from initial tankSeed; explicit uint32 LCG is noncryptographic and never overrides global randomness. Complete persisted job metadata includes input summary, state, retry time and result/error, without raw secrets or prompts. Plant grammar parameters include expansion-budget preflight; rendering/evolution arrives later. Native dialog and a labelled control group avoid inventing custom focus traps or a misleading ARIA toolbar. No new runtime dependencies. The data schema and shared controls are libraries; the build-information dialog demonstrates real integration without exposing unfinished gameplay.

## DEC-019 — Owner-corrected identity, water and reuse direction

Owner rejected the initial gradient circle/CSS droplet/rings. Product name is **the fish tank**; permanent theme is mysterious dark blue throughout. _(Superseded in part by DEC-022: the tank palette is now the owner's teal/green/amber reference palette, while the interface keeps one dark, quiet scheme from the same tokens.)_ Favicon is a single flat solid circle. Loader reveals `l → lo → loa → … → loading`, loops, respects reduced motion, and retains 1500ms + startup/page readiness. Owner specifically requested Oimo Water source reuse and heavy source reuse as the continuing development method. Downloaded/pinned MIT saharan/works source; adapted actual APIC solver and water shader into bounded TS/WebGL2 modules, not a CSS approximation or iframe. A transient loader context is explicitly allowed for this requested effect and is disposed at readiness; the main game remains Pixi. No WASM/demo-menu/accelerometer dependencies. Canonical reuse ledger and contributor policy preserve the direction for all later phases. Owner authorized merging PR6 after verification of this correction.

## DEC-020 — Lightweight grainy loading and direct aquarium UI

Owner requested lightweight optimized grainy water, a 3-second minimum loader and no landing page after startup. Keep actual Oimo APIC reuse but reduce cells from 4000 to 1100, maximum DPR from 1.5 to 1 and target cadence from 30 to 24Hz; retain two stable physics substeps. Add inexpensive static integer-hash fragment grain, reuse GPU storage and skip redundant resize initialization. Startup opens the full-window aquarium GUI directly. No new playable feature is implied: hide unavailable Draw/Food/Plants/Tools and wallet rather than expose nonfunctional controls. Working Fullscreen/About controls and accessible status remain. Owner authorized automatic PR merge after verification (explicit merge command, not bypassing checks). S03 remains next for actual scene/simulation/quality settings.

## DEC-021 — S04 reuse-first water and extended moving loader

Owner requested a longer loader and an initial water push, then complete S04 implementation rather than another preparation pass. Increase minimum to five seconds, retain floor-pooled Oimo water and readiness, add capped initial lateral/upward momentum (static when reduced motion). Reuse pinned MIT jeantimex/threejs-water wave/impulse math and Screenjoy caustic function in existing Pixi8 filters/render textures, not another Three renderer or third-party finished aquarium. Add shared simplex curl current, coalesced tank pointer/touch input, dark front-glass cues and quality/motion/lifecycle budgets. Fish Tank Plus lacks established licensed source: reference only, no copied assets. Full local test suite passes; hardware GPU/frame budget GAP-005 remains explicitly open, since sandbox software timings cannot certify it. Do not treat feature implementation as proof of hardware acceptance or silently advance to S05; owner pricing GAP-002 is also unresolved. No new auto-merge permission inferred.

## DEC-022 — Reference redesign: borderless tank, splash title, one settings icon (2026-11-11)

Owner supplied two generated reference images (day and night) and asked for the shell and loading screen to be redesigned to match them. Owner answers were explicit and are binding:

- **Borders `all`.** Every frame goes: no HUD lines, no glass rim, no top light bar, no gravel band. The tank is full-bleed water. Anything that reads as a line or frame is a defect, so the surface is now a soft stacked glow band and edge shading is a vignette, never a rule.
- **Palette `adopt_reference`.** Teal/green plants, amber day rays, purple day water, cyan night water. This supersedes DEC-019's "permanent dark blue" theme and CONTRIBUTING's "no mint/green" line for the tank's own palette; the interface keeps one dark, quiet scheme drawn from the same tokens.
- **Day/night `now`.** 45s day, 15s fade, 45s night, 15s fade, frozen at night under reduced motion. The cycle is one function, `moodAt`, used by both the renderer and the theme attribute so water and CSS cannot disagree.
- **Title on the splash only.** "the fish tank" is the loading screen's identity; the tank keeps an accessible level-1 heading that occupies no visible area. The "PixiJS renderer ready" line and the empty-tank note are gone.
- **One settings icon.** Every control lives in that dialog: quality, reduce motion, fullscreen, links, graphics state. No second panel, no floating toolbar.
- **Inter Bold, one scheme.** Self-hosted `@fontsource/inter` (OFL-1.1) for every surface; no CDN, since the preview frame has no network.
- **Centralisation.** Design values live only in `theme.css`; `scripts/verify-architecture.mjs` now also rejects CSS borders and one-pixel rules, so the "no frames" ruling is enforced rather than remembered.

Renderer consequence: binding the scene texture into a Pixi v8 filter never worked (uniform typecasting rejects samplers, and a `Filter` resource binds black). The art is drawn opaque by the backdrop sprite; a translucent water-body filter sits over it; the water shader is an additive light pass with caustics, rays, a sun shaft and the ripple glow. A shader failure marks the host degraded and still shows the pixel tank, and the dialog then says the water effects are unavailable instead of claiming everything is ready.

## DEC-023 — Ink is charged by drawn length only (2026-11-11)

GAP-002 is answered by the owner: **ink cost is drawn length only.** This is the original intent and it takes precedence over the TECH_SPEC §8.1 draft, which is amended accordingly:

- **No width multiplier.** The three pen widths are free. A thick stroke costs exactly what the same path would cost thin.
- **No per-stroke fee.** Resting a stroke, lifting the pen and starting another adds nothing on its own. Colour is free as well.
- **Length is normalized** by `min(canvasWidth, canvasHeight)`, so drawing is priced the same on a phone and on a wide monitor.
- **The soft cap stays**, because it exists to stop one enormous drawing from being cheap, not to price widths.

Consequences to honour in S05: live estimate and final commit must use the _same_ evaluator so the number cannot jump when a stroke is simplified; undo and clear refund the exact ink of the removed strokes, which is now simply their length; an exhausted wallet stops the pen rather than silently discarding work. The spec's `widthMultiplier` and `rateStroke` fields are removed rather than left dormant, so no later pass can quietly reintroduce the rejected rule.

## DEC-024 — Background life is a required feature, not polish (2026-11-11)

The owner asked during the S06 discussion for the tank's **background to animate** in its own right, and asked that this not be forgotten. It is recorded here as a product requirement so it cannot be dropped between sessions.

Today the tank's art — bed, plants, far rocks — is painted **once** into a single `344x192` texture and never moves again. Only the water above it animates (caustics, god ray, surface band, particles, day/night), so the scene reads as a photograph behind moving water rather than a living tank.

Required, in the owner's terms:

- **Plants sway from their roots**, driven by the same current the particles already sample, so a cursor or fish stirring the water visibly bends them. They must stay anchored in the sand, never detach or slide.
- **Bubbles** rise in thin streams and break at the surface.
- **The far background moves at a different rate** than the foreground, for depth.

Implementation consequence: the static art has to be split into layers — plants separated from bed and far scenery — instead of one baked texture, so each layer can be transformed independently at pixel scale. This is an architectural change to `src/render/pixel/`, not a decoration pass, and it must hold its frame budget at Quality Low, where the existing budget already ships.

Order: after the drawing path produces a real fish (S07), so the animated background has something to react to, and before S08's steering work, which assumes a living scene.

## DEC-025 — Where the loader's water belongs in the tank (2026-11-11)

The owner likes the pool on the loading screen and wants it in the tank, but does not know where. That indecision is answered here rather than being carried forward.

The loader water is **not** a different effect to be dropped somewhere new. It is the *same* physics the tank's water already uses: the tank runs a curl-current flow field plus pointer impulses (`src/sim/water/flow.ts`, `input.ts`) and a GPU ripple field, and the loader runs the Oimo APIC solver that DEC-019 adapted for exactly this purpose. The loader shows it as a bed of point sprites because during loading there is **no tank yet** — it has to be the whole picture. In the tank there is a picture, so the same motion has to appear as *displacement in it*, not as grains in front of it.

So the answer to "where": **inside the tank's existing lighting and refraction, driven by one shared flow.** Three places, in order of value:

1. **The surface band and the water body** move with the same flow the particles already sample, so a cursor stir bends the waterline and the light along with the plants.
2. **A calm pool of grains, at the bottom of the tank**, where the loader's dotted look is actually appropriate: sand, silt and plankton near the floor. Not a curtain over the fish.
3. **The far background parallax**, which is DEC-024 and needs the static art split into layers first.

A second canvas repeating the loader shader over the tank is explicitly rejected: it doubles the water simulation, contradicts the single-source rule that already governs `moodAt`, and would show two fluids that disagree whenever the pointer moves. The loader and the tank must sample one field.
