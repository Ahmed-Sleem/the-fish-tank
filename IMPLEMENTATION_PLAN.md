# Implementation Plan — Human × AI Evolution Tank

Prepared 2026-11-08. **Status: planning complete; application implementation not started.**

## 1. Authority, scope and hosting

Read [GAME_IDEA.md](GAME_IDEA.md), [TECH_SPEC.md](TECH_SPEC.md), [agent rules](_working_docs/AGENT_RULES.md), [chunking mechanism](_working_docs/CHUNKING_MECHANISM.md) and [DECISIONS.md](DECISIONS.md). The owner's original idea wins over organized interpretations. Locked technical decisions remain locked. This plan decomposes TECH_SPEC §22, not a replacement specification. Original attachments are preserved unchanged; conflicts are recorded, not silently rewritten.

The production app is static and GitHub Pages compatible: browser simulation/rendering, local IndexedDB, direct BYOK provider requests only where browser support is proven. No game backend, login, owner AI key or proxy. Optional collection requires a separately operated endpoint and stays disabled by default. Saves are browser/origin-specific; changing hosting origin does not migrate them automatically. Export before moving origins. Offline catch-up is not background execution. This plan does not add a service worker, multiplayer, payments or cloud accounts.

## 2. One-step / one-session execution contract

Each S-number below is **one planned implementation session**, scoped to one cohesive subsystem and verification. Do not attempt an entire phase in one session. A session includes preparation, implementation, tests, documentation, verification and handoff—not just coding.

Actual session capacity varies. Before starting, compare scope with available tools/context and the actual repository. If it cannot fit, split the not-yet-started step into named child sessions in this plan with complete deliverables and gates; do not rush, silently omit scope, or mark partial work complete. This is a sizing safeguard, not permission to dilute requirements. Fix newly discovered blockers before advancing. Every step starts NOT STARTED; only evidence can change that.

**Dependencies:** S01 has none. Each subsequent step depends on the preceding step and all earlier phase gates. Within a phase, complete listed steps in sequence. No later phase starts until all acceptance criteria from TECH_SPEC §22 for the preceding phase are recorded as passed. Code architecture contracts may be defined early, but features stay hidden until functional. Later dependent fields/screens must have real empty states, not fake content.

**Start every session:**
1. Read working rules, chunking rules, audit, implementation log, changelog, roadmap, this step and the cited original sections.
2. Run `git status`, `git branch -a`, `git log -5 --oneline`; use only the Arena session branch. Resolve unexpected changes without overwriting user work.
3. Create an atomic checklist in `_working_docs/thinking/` with deletion condition. Confirm requirements, relevant libraries and external inputs before editing.
4. Recheck current primary documentation/license before adopting external code. Record date, upstream commit, exact paths, license and adapted behavior in THIRD_PARTY_NOTICES.md. No blind copying from spec claims.

**End every session (mandatory for every step):**
1. Exercise real UI-to-domain-to-storage behavior; verify configuration and English strings use shared registries. Define each business rule once.
2. For each new/changed test or automatic check, introduce a controlled defect, observe the expected failure, restore and rerun. Record command, failure and restored outcome. Do not check off based only on compilation.
3. Run `npm run verify` once the app toolchain exists, focused tests, build, architecture checks and secret scan. Before S01, `python3 scripts/verify_docs.py` is the docs-only verification entrypoint. Live AI tests need explicit user authorization/key and are never substituted with fixtures while claiming live success.
4. Inspect `git diff --check` and full diff; compare original request/step/checklist line by line. Document any blocked requirements under an audit ID; no unfinished feature claims.
5. Update audit, implementation log, changelog and next-session pointer with commands, observed results, files, limitations and exact next action. Commit/push only the session branch after verification; verify remote SHA. Clean temporary checklist after successful verification/push.

**Handoff record required:** session ID/status; source sections reread; files changed; implemented behavior; test fail/pass evidence; manual URL/click path/expected vs observed; performance device if relevant; unresolved audit IDs; local/remote SHA and deployment state; next session ID. A completed step may still be internal—not a public release.

## 3. Ordered session index

| Session | Phase | Deliverable | Depends on | Status |
|---|---|---|---|---|
| S01 | 1 | Toolchain and verification foundation | None | NOT STARTED |
| S02 | 1 | Schemas, configuration and shared UI library | S01 | NOT STARTED |
| S03 | 1 | Fixed-step tank scene and quality controls | S02 | NOT STARTED |
| S04 | 1 | Shared currents and interactive water | S03 | NOT STARTED |
| S05 | 2 | Drawing transactions and ink pricing | S04 | NOT STARTED |
| S06 | 2 | Paper.js drawing interface | S05 | NOT STARTED |
| S07 | 2 | Cutout pipeline and Stage 0 birth | S06 | NOT STARTED |
| S08 | 3 | Steering, spatial grid and fish decisions | S07 | NOT STARTED |
| S09 | 3 | Mesh swimming and social motion | S08 | NOT STARTED |
| S10 | 3 | Petting, dragging and cursor personality | S09 | NOT STARTED |
| S11 | 4 | Dexie saves, migrations and lifecycle | S10 | NOT STARTED |
| S12 | 4 | Validated portable backup and import | S11 | NOT STARTED |
| S13 | 4 | Safe away-time simulation | S12 | NOT STARTED |
| S14 | 5 | Shop, inventory and food physics | S13 | NOT STARTED |
| S15 | 5 | Scent transport and feeding | S14 | NOT STARTED |
| S16 | 5 | Needs, water, consequences and rescue | S15 | NOT STARTED |
| S17 | 6 | Selection, preview and full-card shell | S16 | NOT STARTED |
| S18 | 6 | Histories, lineage and memorial views | S17 | NOT STARTED |
| S19 | 7 | Provider capability and privacy research | S18 | NOT STARTED |
| S20 | 7 | Gemini adapter and key settings | S19 | NOT STARTED |
| S21 | 7 | Additional direct-browser adapters | S20 | NOT STARTED |
| S22 | 7 | Persistent queue, limits and safe results | S21 | NOT STARTED |
| S23 | 7 | Birth analysis and genuine no-key play | S22 | NOT STARTED |
| S24 | 8 | Infinite stages and idempotent rewards | S23 | NOT STARTED |
| S25 | 8 | Procedural growth forms and morph history | S24 | NOT STARTED |
| S26 | 8 | Image generation and continuity pipeline | S25 | NOT STARTED |
| S27 | 9 | Inheritance, compatibility and ancestry | S26 | NOT STARTED |
| S28 | 9 | Courtship, eggs and procedural offspring | S27 | NOT STARTED |
| S29 | 9 | AI offspring jobs and family integration | S28 | NOT STARTED |
| S30 | 10 | L-system plants and placement | S29 | NOT STARTED |
| S31 | 10 | Plant ecology and text evolution | S30 | NOT STARTED |
| S32 | 11 | Consent, upload contracts and disabled default | S31 | NOT STARTED |
| S33 | 11 | Durable sync queue and deletion flow | S32 | NOT STARTED |
| S34 | 12 | Headless balance harness and economy tuning | S33 | NOT STARTED |
| S35 | 12 | Performance, memory and soak budgets | S34 | NOT STARTED |
| S36 | 12 | Audio and final visual finish | S35 | NOT STARTED |
| S37 | 12 | Onboarding, accessibility and mobile acceptance | S36 | NOT STARTED |
| S38 | 12 | GitHub Pages delivery configuration | S37 | NOT STARTED |
| S39 | 12 | Release audit and live acceptance | S38 | NOT STARTED |

## 4. Detailed session work orders

All paths below are intended implementation targets, **not claims that files already exist**. Each step inherits the start/end contract above. Test fixtures live only in test paths. All thresholds and tunable values come from central configuration.

### S01 — Toolchain and verification foundation

- **Phase:** 1. **Dependency:** approved plan and clean repository. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §4, §21; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Pin supported Node/npm and exact TypeScript/Vite/PixiJS v8/Paper.js/Dexie/Zod/test/lint versions after registry and compatibility review; create strict TS app shell and lockfile; establish npm run verify and CI without deployment.
- **Deliverables / likely paths:** `src/core/, package.json, lockfile, tsconfig, eslint/prettier, .github/workflows/ci.yml`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Clean install, typecheck, lint, unit smoke and production build; deliberately introduce a type/lint/test failure and show each gate rejects it.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S02 — Schemas, configuration and shared UI library

- **Phase:** 1. **Dependency:** S01 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §5–6, §15, §18; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Define Zod-derived save/entity/trait schemas, seeded RNG, events and configuration registries; include missing humanAncestry, inventory, job and corpse fields; centralize balance, theme and English strings; build reusable button/dialog/toolbar/stat primitives and architectural checks.
- **Deliverables / likely paths:** `src/core/, src/config/, src/ui/shared/, src/ai/schemas/`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Reject malformed/nonfinite values; clamp legitimate AI numbers and enforce cross-field constraints; test shared primitives/focus; architecture checks reject hardcoded tokens, duplicate rules and production mocks.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S03 — Fixed-step tank scene and quality controls

- **Phase:** 1. **Dependency:** S02 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §3, §16, §19; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Build Pixi layer hierarchy, resize/DPR lifecycle and 30 Hz accumulator with render interpolation; add gradient, surface, particle pool, settings and Low/Medium/High presets; cap catch-up work after background tabs.
- **Deliverables / likely paths:** `src/core/loop, src/render/, src/ui/settings`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Identical seeded sim state under different render rates; resize/orientation/context cleanup tests; empty-tank frame profile and reduced-motion baseline; no dead HUD controls.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S04 — Shared currents and interactive water

- **Phase:** 1. **Dependency:** S03 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §14.1, §16.2, §20; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Audit relevant aquarium/ripple/caustic sources and licenses before reuse; adapt shared curl-noise flow sampling and pointer impulses; implement bounded ping-pong ripple displacement plus credited caustics/rays or documented compatible alternatives.
- **Deliverables / likely paths:** `src/sim/water, src/render/effects, THIRD_PARTY_NOTICES.md`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Pointer, touch and scripted impulses visibly ripple; finite stable field after repeated impulses; compare Low/High; measure ripple cost against 1.5 ms target and empty-tank 60 fps on recorded hardware.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S05 — Drawing transactions and ink pricing

- **Phase:** 2. **Dependency:** S04 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §8.1, §15; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Resolve GAP-002 with the owner before pricing work; implement wallet reservation/commit/cancel rules and the approved normalized ink formula; use one evaluator for live estimate and final simplified strokes; choose rounding precision and overspend prevention; free color selection, undo/clear refunds and minimum complexity.
- **Deliverables / likely paths:** `src/draw/cost, src/core/economy, src/config/balance.config.ts`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Boundary/property tests for widths, sizes, count, soft cap, jitter, exact refunds, exhausted wallet, rejected/cancelled drawing and resize; wallet never negative.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S06 — Paper.js drawing interface

- **Phase:** 2. **Dependency:** S05 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §8, §18; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Wire pointer capture, smooth/simplify stroke end, three widths, color, undo, clear, cancel and Done to shared controls; normalize coordinates; prevent scroll only within drawing surface; charge only committed valid drawings.
- **Deliverables / likely paths:** `src/draw/, src/ui/drawing`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Mouse/touch/pen e2e: interrupted pointer, multi-touch, undo, cancel and insufficient funds; keyboard controls labelled; no charge on rejected or cancelled work.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S07 — Cutout pipeline and Stage 0 birth

- **Phase:** 2. **Dependency:** S06 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §8.2, §12.4; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Implement border-connected near-white removal, feather/defringe, component validation, padding, WebP alpha <=512 and thumbnail/palette extraction; retain original white PNG <=2048 and vectors; commit drawing, blob and new fish atomically in runtime state; animate birth with honest procedural defaults.
- **Deliverables / likely paths:** `src/ai/image-pipeline/, src/draw/export, src/render/birth`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Fixtures preserve enclosed whites, reject empty/touching/invalid masks, remove specks and halos; e2e drawing enters tank and cost commits once; worker/canvas failures leave wallet intact.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S08 — Steering, spatial grid and fish decisions

- **Phase:** 3. **Dependency:** S07 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §6.2, §10.1–2; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Build deterministic FSM, spatial hash, wall/obstacle avoidance, seek/flee/arrive/wander and all swim pattern modifiers; add trait-to-parameter mapping and reserved transitions for food/hunt/court until those real systems arrive.
- **Deliverables / likely paths:** `src/sim/fish/, src/sim/spatial-grid`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Seeded replay, neighbor-query correctness, bounded speeds/turning and stable positions; change each motion parameter in fixtures and observe corresponding output; unfinished actions are not exposed.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S09 — Mesh swimming and social motion

- **Phase:** 3. **Dependency:** S08 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §10.2, §10.4, §20; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Audit and adapt swimming/schooling math; use textured MeshPlane, tail-weighted traveling wave for right-facing images, banking, burst stretch and squeezed turns; add schooling and ballistic jumps with ripple/splash coupling.
- **Deliverables / likely paths:** `src/render/fish/, src/sim/schooling, THIRD_PARTY_NOTICES.md`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Head/tail envelope orientation assertions, left/right turns, jump reentry, separation/alignment/cohesion tests; low-motion visual snapshots and animated manual review show bending rather than sliding.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S10 — Petting, dragging and cursor personality

- **Phase:** 3. **Dependency:** S09 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §10.3, §18; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Add hit testing, gesture arbitration, slow-touch petting, fast-cursor fear/curiosity, fish dragging and water release with personality-based stress; distinguish click/double-click/drag without duplicated actions.
- **Deliverables / likely paths:** `src/core/input, src/sim/interactions, src/render/interaction`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Mouse and touch tests cover pet/flee/ignore, drag cancel and release, nearby food impulse and no accidental feeding/double selection; benchmark 60 fish and record phase 3 acceptance.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S11 — Dexie saves, migrations and lifecycle

- **Phase:** 4. **Dependency:** S10 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §5, §17.1; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Create versioned tables and transactional saves for state/blobs/settings/ledger/jobs; store stable installId/seed and positions; autosave 15 seconds plus lifecycle best effort; dirty revision handling, multi-tab ownership and recovery; request persistent storage and handle quota failure.
- **Deliverables / likely paths:** `src/store/, src/ui/storage-status`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Reload round-trip including strokes/forms; migration fixtures; interrupted writes leave prior valid save; lifecycle tests, second-tab conflict, quota warning/export path; do not promise pagehide always finishes.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S12 — Validated portable backup and import

- **Phase:** 4. **Dependency:** S11 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §17.2; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Add fflate JSON+blob archive export excluding credentials; validate size/count/path/schema/blob references and lineage before import; support replace or import as a separate selectable local tank with fresh identity where needed; rollback on failure.
- **Deliverables / likely paths:** `src/store/archive, src/ui/backup`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Round-trip full histories and ledger; adversarial zip paths/bombs/missing blobs/future schema rejected; credentials never exported; failed import cannot overwrite current save; explain browser-local backups.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S13 — Safe away-time simulation

- **Phase:** 4. **Dependency:** S12 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §1 D5, §17.3; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Implement capped 8h credited absence at 10% speed with coarse bounded steps; all death paths suppressed, hunger>=5 and health>=30 for living fish; no offline births/AI; capped income, plant hook and return summary; handle clock rollback.
- **Deliverables / likely paths:** `src/sim/catch-up, src/store/load`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Long absence, existing dead fish, predation/disease/water/starvation boundaries and repeated reload tests; no duplicate income/jobs or births; compare online/offline invariants and phase 4 acceptance.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S14 — Shop, inventory and food physics

- **Phase:** 5. **Dependency:** S13 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §14.5, §15.2, §18; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Build real purchase/inventory transactions for pellets/flakes/wafers; drop from surface with buoyancy, sinking, current drag, bottom response and rot timer; use pooled entities and actionable tool mode selection.
- **Deliverables / likely paths:** `src/ui/shop, src/sim/food, src/core/inventory`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Purchase insufficient funds/double click/reload cases; each food type physics and rot-to-waste tests; pointer/touch drop path; no negative stock or fake shop buttons.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S15 — Scent transport and feeding

- **Phase:** 5. **Dependency:** S14 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §7.5 idea, §14.1, §10.1; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Add per-food scent grids with advection/diffusion/decay and bounded numeric steps; hungry fish follow local gradients with casting and close vision; compete for food atomically; animate eating/crumbs and anti-spam GP credit.
- **Deliverables / likely paths:** `src/sim/scent, src/sim/feeding, src/render/eating`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Gradient response to actual emitted scent, mass/decay and stability fixtures; smell-disabled and visibility-occluded controls; one pellet consumed once; hunger>=80 earns no pellet GP; no teleportation.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S16 — Needs, water, consequences and rescue

- **Phase:** 5. **Dependency:** S15 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §9.3, §10.5, §14.2–4, §15; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Implement hunger/energy/health/stress, waste/algae/oxygen/quality, corpse decay, disease and predation states; warnings precede decline; wire cleaning, medicine, oxygen and shelter purchases/placement, glass tap/shake/pollution with costs and consequences; passive income and recovery allowance.
- **Deliverables / likely paths:** `src/sim/ecology, src/sim/needs, src/ui/tools`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Long-neglect warning/death/memorial tests; deterministic hunt/eat/flee priorities; cleaning and recovery rescue paths; 24h recovery edge cases and reload resistance within client-side trust limits; preliminary economy harness.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S17 — Selection, preview and full-card shell

- **Phase:** 6. **Dependency:** S16 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §18, idea §11; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Create shared entity-card adapters and responsive preview/full dialog; single click preview, double click/tap full, keyboard alternative; fish portrait/stats/personality/behavior summaries with rename/feed/favorite/release confirmation.
- **Deliverables / likely paths:** `src/ui/cards/, src/core/selection`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Click arbitration, focus trap/restore, Escape, touch and responsive tests; actions mutate/save real state; entity removal during open card handled; no injected HTML through names.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S18 — Histories, lineage and memorial views

- **Phase:** 6. **Dependency:** S17 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §5, §11.5, §18; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Render original vectors/image, lazy forms timeline with dates/notes, capped event logs, family tree parents/siblings/children and human ancestry; reusable plant/object adapters; dead fish memorial and graceful missing-ancestor view.
- **Deliverables / likely paths:** `src/ui/cards/history, src/ui/cards/family-tree`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Fixture gallery for drawn/offspring/dead entities and incomplete ancestry; dates/order, lineage cycles and lazy texture cleanup tests; full card contains every specified section; later plant sessions wire actual plant records.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S19 — Provider capability and privacy research

- **Phase:** 7. **Dependency:** S18 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §1 D1/D6, §12.1–2; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Verify current Gemini/OpenAI/Anthropic/OpenRouter model listing, vision, schema, image reference and direct-browser CORS requirements using authoritative docs; audit SDK/license if needed; write capability matrix and browser smoke protocol; unsupported paths hidden, never proxied.
- **Deliverables / likely paths:** `docs/AI_PROVIDERS.md, docs/PRIVACY.md, DECISIONS.md`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Record source URLs/dates and actual browser evidence separately from documentation claims; missing credentials or blocked network produces explicit unverified status, not claimed support; no user secrets in repository.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S20 — Gemini adapter and key settings

- **Phase:** 7. **Dependency:** S19 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §12.1–2; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Implement common typed provider interface and Gemini text/vision/model listing; two model slots selected from discovered capabilities, key removal and optional remember-in-IndexedDB with session-only default; onboarding skip/free fallback and provider terms notices.
- **Deliverables / likely paths:** `src/ai/providers/gemini, src/ui/ai-settings, src/store/credentials`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Fixture contract tests for headers/payload/schema/errors; browser network assertion sends key only to chosen provider; no keys in logs/export/sync; model loading failure and removed key return honest fallback.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S21 — Additional direct-browser adapters

- **Phase:** 7. **Dependency:** S20 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §12.1; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Implement only browser-verified OpenAI, Anthropic and OpenRouter capabilities using shared request/error normalization; required browser headers; explicit capability-driven pickers, abort/timeout and input size limits; current model discovery, no stale hardcoded IDs.
- **Deliverables / likely paths:** `src/ai/providers/, docs/AI_PROVIDERS.md`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Per-provider recorded fixtures and unsupported-capability tests; manually authorized live smoke when key available; blocked provider hidden with documented reason; do not mark live verification passed using mocks.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S22 — Persistent queue, limits and safe results

- **Phase:** 7. **Dependency:** S21 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §7, §12.3, §12.10; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Build priority queue with text=2/image=1 concurrency, token buckets, daily budget 40, backoff/jitter/repair retries, daily exhaustion pause, cancellation/reload recovery and idempotent result application; cache equivalent validated jobs with explicit versioned context keys, batch low-priority names/stories/event narration and skip to local templates when budget is low; bound Tank Context around 1500 tokens; escape/filter output and separate prompt data.
- **Deliverables / likely paths:** `src/ai/orchestrator, src/ai/prompts, src/ai/context, src/store/jobs`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Fake-clock tests for priorities/429/5xx/timeouts/reload/budget; every request includes current bounded Tank Context; prompt-injection fixtures cannot execute code/HTML; stale result cannot resurrect removed fish.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S23 — Birth analysis and genuine no-key play

- **Phase:** 7. **Dependency:** S22 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §12.5, §13; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Analyze drawings locally for deterministic procedural Trait Cards/names; wire birth text+vision job with faithful visual memory, immediate procedural swimming and validated replacement; display provenance and counters; mocks remain test-only.
- **Deliverables / likely paths:** `src/fallback/traits, src/ai/jobs/birth, src/ui/ai-status`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** No-network e2e from fresh tank through drawing/feed/save/reload; AI fixture updates motion without losing identity; malformed/offensive output and exhausted budget fall back; deployment bundle excludes MockProvider.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S24 — Infinite stages and idempotent rewards

- **Phase:** 8. **Dependency:** S23 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §9, §15.4; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Implement GP thresholds and stage scale curves, named later eras, bounded large-size behavior costs, atomic ledger and continuous scale interpolation; reject overflow and stale repeated transitions; only stage>=1 pays.
- **Deliverables / likely paths:** `src/sim/growth, src/core/rewards, src/store/ledger`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Threshold jumps, reload/import/repeated ticks and race tests pay once per fish/stage; high-stage numerical stability and size asymptote; no stage-0 offspring payout; UI shows stage and progress.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S25 — Procedural growth forms and morph history

- **Phase:** 8. **Dependency:** S24 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §9.2, §13; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Implement trait-guided nonuniform growth, subtle palette shifts/markings and identity-preserving procedural forms; crossfade/gentle mesh morph over ~4 seconds; queue processing while swimming, store every form with provenance and notes.
- **Deliverables / likely paths:** `src/fallback/growth, src/render/morph, src/store/forms`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Seeded image fixtures constrain silhouette/palette/aspect changes; low-motion transition alternative; reload mid-transition safely finalizes once; history retains original/current forms; failures do not stall stage progression.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S26 — Image generation and continuity pipeline

- **Phase:** 8. **Dependency:** S25 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §12.4, §12.6; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Add capability-supported image requests with references, billing/quota test UI and transparent notice of costs; reuse cutout pipeline; validate palette Lab distance, silhouette/feature continuity with a configured maximum visual-change limit, aspect +/-35%, optional budgeted identity judge and orientation; growth job follows old/original forms plus context; text visual-only updates.
- **Deliverables / likely paths:** `src/ai/jobs/growth, src/ai/providers/image, src/ai/image-validation`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Recorded accepted/rejected images, left-facing flip, nonwhite/cropped input, identity drift, retries then procedural fallback; real image smoke only with authorized key; no behavior overwrite or stage blockage.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S27 — Inheritance, compatibility and ancestry

- **Phase:** 9. **Dependency:** S26 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §11.1, §11.4–5; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Implement sex/reproductive-role compatibility, attraction, maturity/needs/cooldown checks, seeded crossover/blend/Gaussian mutation and feature inheritance; compute ancestry contributions from unique roots safely through pedigree DAG.
- **Deliverables / likely paths:** `src/sim/inheritance, src/sim/mating, src/core/lineage`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Property tests for numeric ranges and one feature from each parent; asymmetric parent preferences, both roles, shared ancestors, sibling relationships and cycle rejection; no invalid mate pair.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S28 — Courtship, eggs and procedural offspring

- **Phase:** 9. **Dependency:** S27 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §11.2–3, §13, §14.3; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Wire visible courtship styles and cancellable pair reservation, eggs and hatching; carry-capacity model and reserved pending births prevent oversubscription; fallback offspring combine both parents visibly; commit children/parent links atomically and persist pending clutches.
- **Deliverables / likely paths:** `src/sim/courtship, src/fallback/offspring, src/render/eggs`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Concurrent clutches, reload, death/release parent, unhealthy water and cooldown tests; no duplicate children, no offline hatch; visual fixtures demonstrate both-parent palette/features rather than clones.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S29 — AI offspring jobs and family integration

- **Phase:** 9. **Dependency:** S28 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §12.7, §11.5; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Queue sequential per-child image generation from both parents and required premix, sibling summaries and context; uniqueness hash/palette rejection, one small novelty and validated finalized traits; fallback per failed child; wire full lineage and event histories.
- **Deliverables / likely paths:** `src/ai/jobs/offspring, src/ui/cards/family-tree`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Sibling clone rejection, malformed traits, parent removed during job and exhausted quota; each child registered once; full family tree and ancestry in UI; sustained breeding sim does not explode population.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S30 — L-system plants and placement

- **Phase:** 10. **Dependency:** S29 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §1 P2, §20, idea §9; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Audit procedural-plants license/code; define bounded PlantTraitCard and L-system expansion/turtle renderer with safe recursion/segment budget; real seed shop, anchor placement/move/remove and current-driven anchored sway reacting to nearby fish and pointer disturbances; plant cards use shared library.
- **Deliverables / likely paths:** `src/sim/plants, src/render/plants, src/ui/plant-shop`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Seeded bounded expansion and base-fixed sway; pointer/touch placement/reload; price and plant history correctness; no production placeholder art or copied unlicensed code.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S31 — Plant ecology and text evolution

- **Phase:** 10. **Dependency:** S30 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §12.8, §14.2–3; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Connect plant absorption/photosynthesis/shelter/grazing/health/overgrowth and death to ecology; trigger bounded evolution every 30 sim minutes or major condition shift via queue/context; procedural evolution without key; history/forms/cards and offline hooks.
- **Deliverables / likely paths:** `src/sim/plant-ecology, src/ai/jobs/plants, src/fallback/plants`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Light/waste/crowding/grazing scenarios visibly change growth and water; clamp deltas/expansion budget; no offline AI calls; existing cards show effects and timeline; validate optional image-plant deferral explicitly.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S32 — Consent, upload contracts and disabled default

- **Phase:** 11. **Dependency:** S31 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §17.4; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Write SYNC_API contract, threat model and retention/deletion expectations; versioned equal-prominence consent, endpoint-empty disabled UI, anonymized allowlist serializers excluding keys and unrelated free text; no server deployed.
- **Deliverables / likely paths:** `docs/SYNC_API.md, src/sync/consent, src/sync/serialize`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** No endpoint/no consent/revoked/outdated consent -> zero upload requests; serialized adversarial key fields excluded; consent changes persist; explain installId is pseudonymous, not guaranteed anonymity.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S33 — Durable sync queue and deletion flow

- **Phase:** 11. **Dependency:** S32 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §17.4, §22 phase 11; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Implement opt-in batching, byte limits/backoff, offline restart, pause/revoke behavior and best-effort close flush without new requests after revocation; authenticated deletion contract using local deletion credential not installId alone; test-only mock collector, unavailable deletion clearly pending.
- **Deliverables / likely paths:** `src/sync/queue, src/ui/privacy, src/test/sync-server`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** E2e consent on/off/revoke during flight, duplicate batches, network failure and deletion authorization; credentials excluded from sync/export; absent production endpoint remains disabled; owner legal/server gate documented.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S34 — Headless balance harness and economy tuning

- **Phase:** 12. **Dependency:** S33 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §15, §21; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Run daily-casual/frequent-feeder/heavy-breeder/unattended seeded archetypes over simulated days with test-only fixtures; define numeric runaway/dead-end/capacity criteria in config; report survival/money/population/water/milestones; tune only central config.
- **Deliverables / likely paths:** `src/test/harness, docs/BALANCE_REPORT.md, src/config/balance.config.ts`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** CI fails on injected runaway money, NaN, rapid starvation and excessive births; parameter sweep documents reproducible seeds and thresholds; attentive feeding profitable, recoverable loss, no reward farming.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S35 — Performance, memory and soak budgets

- **Phase:** 12. **Dependency:** S34 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §19, §21; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Profile 60 fish+40 plants+300 particles at recorded laptop/phone targets; 30-minute simulated soak; optimize pools, spatial queries, atlas/loading/disposal and quality budgets; worker only if profiling warrants; warn on estimated memory >1.5 GB.
- **Deliverables / likely paths:** `src/render/, src/sim/, docs/PERFORMANCE_REPORT.md`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Record hardware/browser, median/p95 tick/frame/heap/texture counts; sim<=4ms, 60fps laptop and >=30fps Low phone targets; soak has no sustained leak; unavailable real devices are release blockers or explicit owner waiver, not fake passes.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S36 — Audio and final visual finish

- **Phase:** 12. **Dependency:** S35 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §13 idea, §16, §24; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** License-audit CC0 ambient/SFX; implement audio unlock, low default volume/mute and persistent settings; integrate drawing/feed/growth/birth sounds; finish luminous tank/lightwater, card transitions and motion without obscuring player art.
- **Deliverables / likely paths:** `src/core/audio, src/render/, src/ui/, THIRD_PARTY_NOTICES.md`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Autoplay denial/mute/background-tab tests; source/license inventory and final-art audit; screenshot regressions Low/High; manual animation and audio checks across desktop/mobile.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S37 — Onboarding, accessibility and mobile acceptance

- **Phase:** 12. **Dependency:** S36 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §18, §21; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Finish playable no-key first-run guidance, cost/privacy explanation and backup reminders; keyboard entity navigation, accessible cards, reduced motion, readable scalable HUD/colorblind bars; touch double-tap/drag ergonomics and browser compatibility fixes.
- **Deliverables / likely paths:** `src/ui/onboarding, src/ui/, docs/ACCESSIBILITY.md`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Full mouse/touch/keyboard journey from draw to feed/grow/breed/export/import; automated accessibility plus manual screen-reader/focus/reduced-motion checks; recorded browser/device matrix, no console/unhandled network errors.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S38 — GitHub Pages delivery configuration

- **Phase:** 12. **Dependency:** S37 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §4, §17, owner hosting direction; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Configure Vite project base /the-fish-tank/, base-aware assets, static-safe navigation and build artifact; add GitHub Actions Pages workflow with minimal permissions, concurrency and verification prerequisite; choose explicit approved production trigger rather than deploying session pushes automatically.
- **Deliverables / likely paths:** `vite.config.ts, .github/workflows/pages.yml, docs/DEPLOYMENT.md`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Serve built app under project subpath, reload/open every supported screen without 404/assets errors; no localhost calls or embedded keys; inspect dist for mocks/credentials; owner approval/Pages settings required before live deployment.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

### S39 — Release audit and live acceptance

- **Phase:** 12. **Dependency:** S38 complete. **Status:** NOT STARTED.
- **Read first:** TECH_SPEC §17–24, idea §17; relevant GAME_IDEA philosophy/feature sections and current audit.
- **Bounded work:** Reconcile every acceptance item and audit gap; validate fresh/old saves, local-only mode and provider smoke evidence; after owner approval deploy verified artifact, inspect Actions, test actual Pages URL and rollback procedure; publish known limits and handoff.
- **Deliverables / likely paths:** `docs/RELEASE_CHECKLIST.md, _working_docs/, README.md`. Update existing shared primitives and contracts rather than copying them.
- **Verification / negative cases:** Full verify plus contracts/e2e/visual/harness/soak evidence; live subpath draw/save/reload/feed/export and mobile smoke; no unapproved uploads, owner AI billing or incomplete controls; release blocked by unmet required gates.
- **Exit gate:** all bounded work is integrated and reachable where appropriate; the above checks pass with recorded controlled-failure evidence; no silently dropped requirement; save/schema changes include migration coverage. Complete the common session handoff before proceeding.
- **Do not include:** work assigned to later sessions, extra product features, production mock responses, or claims of live/device validation without evidence.

## 5. Phase acceptance checkpoints

| Spec phase | Sessions | Gate (in addition to individual exits) |
|---|---|---|
| 1 Foundation | S01–S04 | Empty tank targets 60 fps on recorded target; responsive water and quality settings; borrowed effects credited. |
| 2 Drawing/economy | S05–S07 | Exact normalized price, true undo/refund, no overspend, preserved vectors and transparent Stage 0 birth. |
| 3 Fish engine | S08–S10 | Parameter changes visibly affect motion; body bends/banks/turns; school/cursor interactions functional. |
| 4 Storage | S11–S13 | Reload/export/import preserve complete state; transactional recovery; every away-time death path suppressed. |
| 5 Food/senses | S14–S16 | Food found through scent/close vision; hunger/rot/ecology consequential; warned decline and rescue. |
| 6 Cards/history | S17–S18 | Single/double input and keyboard alternatives; all history/property/family sections, empty states honest. |
| 7 AI core | S19–S23 | Actual supported adapters plus clear live evidence status; persisted queue; playable genuine no-key fallback. |
| 8 Growth | S24–S26 | Infinite bounded stages, one reward per stage, recognizable identity, continuous transitions and failure fallback. |
| 9 Mating | S27–S29 | Both-parent inheritance, courtship/eggs, consistent lineage, pending capacity reservations and bounded population. |
| 10 Plants | S30–S31 | Bounded L-system plants, water sway, working ecology and tank-conditioned gradual evolution. |
| 11 Sync | S32–S33 | Explicit consent gates every upload; zero credentials uploaded; deletion tested; empty endpoint disables feature. |
| 12 Polish/release | S34–S39 | Balance, soak, visual/audio/accessibility/device budgets and actual Pages acceptance all evidenced. |

No phase is currently accepted. These are future gates, not a statement that the current repository is playable.

## 6. Requirements traceability

### GAME_IDEA §17 acceptance checklist (original order)

| # | Requirement | Owning sessions |
|---|---|---|
| 1 | Full-screen tank | S03–S04, S36 |
| 2 | Money and length-based drawing cost, no overspend | S05–S06, S34 |
| 3 | Drawing enters tank with birth | S07 |
| 4 | Tank-aware AI personality/behavior | S19–S23 |
| 5 | Creative non-realistic identity | S23, S25–S26, S29 |
| 6 | Standard parameter-driven behavior | S02, S08–S10, S16 |
| 7 | Deforming swimming animation | S09 |
| 8 | Food, physics, scent, realistic seeking | S14–S15 |
| 9 | Needs, growth, warned harm/death | S16, S24–S26 |
| 10 | Gradual AI growth and morphing | S25–S26 |
| 11 | Stage rewards and balance | S24, S34 |
| 12 | Indefinite growth safeguards | S24 |
| 13 | Mating, both-parent offspring and lineage | S27–S29 |
| 14 | Population/ecology balance | S16, S28, S31, S34 |
| 15 | Purchased swaying evolving plants | S30–S31 |
| 16 | Cursor water/pet/drag interactions | S04, S10, S14, S30 |
| 17 | AI never blocks player | S22–S23, S26, S29 |
| 18 | Preview/full cards and complete histories | S17–S18, S29–S31 |
| 19 | Unique persistent tanks | S02, S11–S13, S23 |
| 20 | Premium visuals/audio and performance | S03–S04, S09, S35–S37 |
| 21 | Central config and harness | S02, S34 |
| 22 | Validation, retry, fallback, budgets | S02, S22–S23, S26, S29, S31 |

### TECH_SPEC section ownership

| Section | Coverage |
|---|---|
| 1 Locked decisions/defaults | S01–S02, S11–S13, S19–S23, S30, S32, S36–S39 |
| 2 Glossary | Shared naming across S02 onward; no separate feature |
| 3 Architecture | S01–S04, S08, S22 |
| 4 Setup | S01, S38 |
| 5 Models | S02, S11–S12, S18, S27, S30 |
| 6 Trait Card | S02, S08, S23, S27, S31 |
| 7 Tank Context | S22 and every AI job in S23, S26, S29, S31 |
| 8 Drawing | S05–S07 |
| 9 Stages/death | S16, S24–S26 |
| 10 Behavior | S08–S10, S15–S16, S28 |
| 11 Mating | S27–S29 |
| 12 AI/image pipeline | S07, S19–S23, S26, S29, S31 |
| 13 Free fallback | S23, S25, S28, S31 |
| 14 Ecology | S04, S14–S16, S28, S30–S31 |
| 15 Economy | S05, S14, S16, S24, S34 |
| 16 Rendering | S03–S04, S07, S09, S25, S30, S35–S36 |
| 17 Persistence/sync | S11–S13, S20, S32–S33 |
| 18 UI | S02–S03, S06, S10, S14, S17–S18, S20, S30, S37 |
| 19 Performance | S03–S04, S09–S10, S35 |
| 20 Borrowed code | Just-in-time audit at S01, S04, S08–S09, S19, S30, S36 |
| 21 Tests/harness | Every session, plus S34–S35, S37–S39 |
| 22 Build order | Phase table above, no phase skipping |
| 23 Invariants | Every exit gate; full reconciliation S39 |
| 24 Owner items | Defaults in DECISIONS; legal/server gate S32–S33; audio S36 |

## 7. Test strategy and evidence storage

- Unit/contract suites: pure cost, schema coercion/clamping, RNG, grid, steering, scent stability, inheritance, capacity, ledger, catch-up and archive validation. Recorded provider fixtures are data, never a live-service claim.
- Integration: domain transactions + Dexie, reload/cancel/retry, multi-tab, pending birth/growth persistence and graceful quota/corruption recovery.
- Browser e2e: fresh no-key game, drawing, feeding, growth, breeding, history, export/import and consent request interception. Run served production builds at the Pages subpath, not only the Vite root.
- Visual/manual: deterministic low-motion snapshots plus real animated review; unusual white/abstract drawings must remain recognizable. Audio and human aesthetic judgment cannot be proved by screenshot alone.
- Performance: named hardware/browser and workload, frame/tick distributions, bounded particle/texture counts and heap trend. Commit compact reports; keep large videos, traces, generated datasets and keys out of Git.
- Security: archive bounds/path traversal, data-only AI output, prompt separation, HTML escaping, credential allowlists, outbound host assertions, no production fixtures, consent revocation and deletion authorization. A public client cannot prevent a player editing their own money/save; do not add a backend to pretend otherwise.
- Verify command evolves in S01: docs validation + lint + formatting + typecheck + unit/integration/contracts + build + architecture/secret checks + reproducible smoke/harness checks as they become available. Longer/device/live suites have explicit release commands and blocking evidence requirements.

## 8. Risks, blockers and owner boundaries

See [audit](_working_docs/AUDIT_AND_TODO.md) for tracked issues and [decisions](DECISIONS.md) for interpretations. Primary risks: browser provider access, image billing, image identity validation, GPU/mobile budgets, storage eviction and lifecycle timing. Research those before their dependent implementation; do not silently route via a server.

Optional AI plant images, tank events, social sharing/timelapse, milestone extras, revive/old-age policy beyond specified traits, and accounts are not required v1 additions. Procedural plants and unlimited default lifespan remain the chosen defaults. Any scope change needs an explicit recorded decision. No production collector is part of this build. No GitHub Pages deployment is claimed by publishing these documents.

## 9. Immediate next action

Review/approve this plan, then execute **S01 only**. The full product requires the subsequent sessions; this documentation session does not authorize pretending all steps are complete. The current branch is `arena/d27a08e6-the-fish-tank`; never switch/create another branch in this Arena session.
