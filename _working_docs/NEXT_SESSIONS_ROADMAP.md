# Next-session roadmap

## Current state

S01–S03 are merged; S03 PR #8 hosted verification passed. S04 feature implementation is complete on `arena/4cbba201-the-fish-tank`, with full local verification (86 unit/22 browser/11 architecture/4 documentation tests), credited source adaptations and direct cursor/touch tank effects. See `docs/S04_VERIFICATION.md`. Existing CI/Pages workflows are unchanged.

## S04 acceptance still open

GAP-005: certify actual <1.5ms GPU ripple and 60fps laptop/mobile performance on physical hardware. Software Chromium submission timings do not certify GPU execution; measured 1000×700 software frame rate misses the target. Do not claim this gate passed or silently bypass it. Review/hosted checks/merge are separate from local verification.

## Next numbered implementation: S05 — drawing transactions and ink pricing

Resolve owner pricing decision GAP-002 before implementation. Reuse existing contracts/configuration/UI primitives and download/study suitable licensed drawing code before adapting it. No invented pricing. Do not skip S04 acceptance gates or implement later-session creatures/storage/economy prematurely.

## Standing gates

- Follow the requested reuse-first development style: search, download, study, adapt, use; preserve license, pin, edits and exact integration paths.
- README remains player-facing and changes with visible features. Never describe future gameplay as available.
- Maintain direct tank reveal, mysterious dark-blue identity, five-second minimum loader, initial pooled-water push, real readiness, reduced-motion and lifecycle handling.
- Every new check requires break/fail/restore proof; update ignored atomic checklist and remove only after verified push.
- S02 schema is a contract, not a storage/export interface; S11–S13 own persistence/recovery/migrations.
- GAP-009 identity/image pipelines and GAP-003 provider capability remain later-session gates.
