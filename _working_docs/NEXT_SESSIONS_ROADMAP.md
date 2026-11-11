# Next-session roadmap

## Current state

S01–S04 are merged and deployed: PRs #1–#9 all merged, Verify and Deploy Pages runs green, and
the public site serves the merged build (`ead47c8`). Local full verification passes on
`arena/0fb511c8-the-fish-tank`: 86 unit / 22 browser / 11 architecture / 4 documentation tests,
format, lint, strict types, audit zero, build. Phase 1 is **not yet accepted** because its
checkpoint requires a recorded-target 60 fps result and only software-renderer timings exist.
Start every session with `_working_docs/REPO_STUDY.md`.

## Blocking the next step

GAP-002 must be answered by the owner before S05 implementation: does ink cost follow drawn
length only (original idea, DEC-010 default), or length × width plus a per-stroke charge
(TECH_SPEC §8.1)? And are colours free (GAME_IDEA §18 question 7)? No pricing will be invented.

## Next numbered implementation: S05 — drawing transactions and ink pricing

After GAP-002 is resolved: one centralized formula and one evaluator shared by the live
estimate and the final simplified strokes; wallet reservation/commit/cancel with no overspend;
free undo/clear with exact refunds; minimum-complexity rejection that never charges;
boundary/property tests proving the wallet cannot go negative. Reuse existing contracts,
configuration and UI primitives; download and study suitable licensed drawing code before
adapting it. Do not implement later-session creatures/storage/economy prematurely.

## Standing gates

- GAP-005: certify the <1.5 ms GPU ripple and 60 fps laptop/mobile targets on physical
  hardware with a recorded device report. Software Chromium timings do not certify GPU
  execution. Do not claim this gate passed or silently bypass it.
- GAP-021: automated accessibility/contrast/responsive-matrix checking is required by the GUI
  production standard but not yet implemented; manual checks are not a substitute.
- Follow the reuse-first style: search, download, study, adapt, use; preserve licence, pin,
  edits and exact integration paths.
- README stays player-facing and changes with every visible feature; never describe future
  gameplay as available.
- Maintain direct tank reveal, mysterious dark-blue identity, five-second minimum loader,
  initial pooled-water push, real readiness, reduced-motion and lifecycle handling.
- Every new check requires break/fail/restore proof; tick the ignored atomic checklist only
  when a command proved it, and delete it only after a verified push.
- S02 schemas are a contract, not a storage/export interface; S11–S13 own
  persistence/recovery/migrations.
- GAP-009 identity/image pipelines and GAP-003 provider capability remain later-session gates.
