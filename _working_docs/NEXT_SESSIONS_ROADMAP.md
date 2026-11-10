# Next-session roadmap

## Current state

**S01 implemented locally; CI publication blocked (GAP-014):** strict Vite/TypeScript app scaffold, actual empty PixiJS renderer, responsive honest development overlay, exact dependency lockfile and centralized verification with locally prepared CI. No drawing, fish simulation, saves, shop, AI or uploads yet. S02–S39 are NOT STARTED; Phase 1 is not yet fully accepted.

Owner explicitly requested Pages first, so deployment plumbing was brought forward from S38. Current manual-install templates publish stable `main`; they are not active until the owner installs them. Current work branch: `arena/9da1a61d-the-fish-tank`. The initial Pages enablement API returned 403; owner activation/settings may still block the public page. See [deployment guide](../docs/DEPLOYMENT.md), GAP-007 and the latest implementation log for actual workflow results. Never claim an expected URL is live without evidence.

## Next action

1. Follow [the downloadable Pages handoff](../docs/github-pages-setup/README.md): the owner installs `ci.yml` then `pages.yml` at `.github/workflows/` on main. The earlier untracked files did not survive the branch change; committed inert copies now live in `docs/github-pages-setup/`. No ZIP needed. GAP-014 remains until active workflow installation and a successful CI run.
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
- Preserve all four original attachment hashes. Manual-install templates use main for public delivery; Arena previews show unmerged local changes. Do not switch/push to main from this session.

The detailed ordered task list lives only in IMPLEMENTATION_PLAN.md.
