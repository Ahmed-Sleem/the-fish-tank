# S02 — contracts and shared UI verification

## Bounded implementation

- `src/ai/schemas/traits.ts`: complete visual/personality/behavior/ecology/growth/mating Trait Card; strict schema-derived types. Separate AI entry fills nested missing defaults and clamps finite numbers; wrong types, unknown fields and nonfinite inputs reject. Coupled maximum speed and clutch bounds normalize before strict revalidation. Identity anchors remain intact.
- `src/core/schemas.ts`: v1 tank/fish/plant/form/item/event/job/reward/inventory contracts, UUIDs, bounded arrays/text, ancestry root contributions, corpse/death state, binary-key references and duplicate-reward protection. Job summaries/results are data, never executable code. Procedural plant expansion is counted before allocating expanded strings. Strict imports reject unsupported schema versions. No previous save format has shipped, so there is deliberately no fabricated legacy migration; future version bumps must supply migrations.
- `src/config/{domain,balance,ai}.config.ts`: canonical ranges/defaults/limits and specified economy starting points. No ink-price formula chosen while GAP-002 remains open. Validation limits are defensive format limits, not tuned carrying capacity; stages use safe-integer bounds, not a small gameplay-era cap.
- `src/core/{random,events}.ts`: explicit serializable RNG state, typed events and unsubscribe/clear isolation; renderer lifecycle uses the event bridge. RNG is not for secrets/IDs.
- `src/ui/shared/controls.{ts,css}`: native buttons, labelled control groups, modal dialog and text stats. Shared DOM/theme/strings reused. About-this-build dialog exposes real graphics status and format version. No dead gameplay controls or creature mocks.
- `scripts/architecture-rules.mjs`: pure, negative-fixture-tested source guards against repeated known registries/types, unseeded core randomness, DOM/render dependencies in core, duplicate button/dialog implementations, unsafe HTML and hardcoded CSS design values. These guards are structural heuristics, not a proof against every semantic duplication.

## Positive verification

`LD_LIBRARY_PATH=/tmp/al2023/lib:/tmp CHROMIUM_EXECUTABLE_PATH=/tmp/chromium npm run verify`

Final local result: **76 unit tests, 11 architecture fixtures, 4 Python regressions and 10 browser cases passed; npm audit reported zero findings.**

Includes original docs-hash preservation, formatting, strict lint/types, unit checks, architecture checks/negative fixtures, audit, production build and real Chromium production-subpath tests. Browser tests run desktop and reduced-motion mobile emulation, not physical-device profiling. Unit checks cover range boundaries, nested defaults, malformed/nonfinite data, round-trip save/runtime state, unsupported versions, identity/death/ancestry invariants, duplicate rewards/jobs, bounded plant expansion, RNG known-answer/resume and event ownership. Browser controls checks cover keyboard activation, modal labelling, focus, inert background navigation, Escape/Close focus restoration and viewport fit; startup/error/subpath tests continue to run.

## Controlled failures, restored before final verification

Each mutation was applied to real source, command observed exit 1, then exact good source restored:

1. Replace AI clamping with raw value: range and coupled-value tests fail.
2. Return raw saves instead of parsing: version/money/duplicate/orphan import tests fail.
3. Return constant RNG output: known-answer test fails.
4. Dispatch live event set instead of snapshot: mutation/unsubscribe sequence test fails.
5. Disable architecture rejection: negative-fixture tests fail.
6. Remove `showModal()`: real desktop browser dialog visibility test fails.

## Limits and next step

This completes foundational contracts/UI only, not persistence, simulation, provider access or playable gameplay. S03 next adds fixed-step scene/layers/particles/quality settings; S04 later adds measured interactive water. GAP-009 remains open for actual later identity/image pipelines; GAP-008 remains for storage/migrations. No public S02 deployment is claimed before PR merge and actual Pages acceptance.

## Hosted proof

[PR #6](https://github.com/Ahmed-Sleem/the-fish-tank/pull/6), implementation commit `cb5c0d2`: [GitHub Verify run 42739909257](https://github.com/Ahmed-Sleem/the-fish-tank/actions/runs/42739909257) passed (1m1s). This proves hosted PR verification, not a merged/public S02 release.
