# Next-session roadmap

## Current state

**S01 implemented locally; CI publication blocked (GAP-014):** strict Vite/TypeScript app scaffold, actual empty PixiJS renderer, responsive honest development overlay, exact dependency lockfile and centralized verification with locally prepared CI. No drawing, fish simulation, saves, shop, AI or uploads yet. S02–S39 are NOT STARTED; Phase 1 is not yet fully accepted.

Owner explicitly requested Pages first, so deployment plumbing was brought forward from S38. Publishing branch: `arena/f3e87408-the-fish-tank`. The initial Pages enablement API returned 403; owner activation/settings may still block the public page. See [deployment guide](../docs/DEPLOYMENT.md), GAP-007 and the latest implementation log for actual workflow results. Never claim an expected URL is live without evidence.

## Next action

1. Update/reconnect Arena GitHub authorization to allow workflow writes (GAP-014). The two `.github/workflows` files are saved locally, not uploaded; publish them after authorization. Do not recreate/discard the app work.
2. Complete owner Pages setup if still blocked and rerun Deploy Pages; this must precede claiming public live delivery.
3. After S01 publication is completed, execute **S02 — Schemas, configuration and shared UI library**, only that bounded step.
4. Read rules/chunking/idea/spec/decisions/audit/log/changelog and inspect Git first.
5. Reuse existing `src/ui/shared/dom.ts`, theme/string registries, app startup/cancellation and verification commands. Extend them rather than fork.
6. Define complete entity/save/Trait Card schemas, seed/events/config and accessible reusable primitives. Later sessions S03/S04 add fixed-step water rendering and currents/ripples.
7. Run `npm run verify`, including a real browser, and demonstrate new checks fail before green. Review [S01 report](../docs/S01_VERIFICATION.md) and third-party declarations limitation GAP-012.

## Continuing gates

- Owner pricing decision for GAP-002 before S05.
- Audit sources/licenses before adopting shaders/plants; provider access before adapter work.
- No-key fallback must ultimately be genuinely playable; the current shell is clearly not that final fallback.
- Preserve all four original attachment hashes. Keep deployment trigger aligned to the active Arena branch on future sessions, with explicit owner authorization if publishing source changes.

The detailed ordered task list lives only in IMPLEMENTATION_PLAN.md.
