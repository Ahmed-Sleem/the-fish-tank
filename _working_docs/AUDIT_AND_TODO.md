# Audit and todo

Updated 2026-11-08. S01 app scaffold implemented; gameplay is not implemented. The plan tracks future feature work; this audit tracks specific gaps/risks, not falsely completed features.

| ID      | State                              | Gap / root cause                                                                                                                      | Owner / planned action                                                                                    | Closure evidence required                                                                                              |
| ------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| GAP-001 | CLOSED                             | Repository had no committed requirements or execution roadmap.                                                                        | Planning session: preserve attachments and create detailed session plan.                                  | Source equality, plan completeness, link/secret checks and committed docs; see implementation log.                     |
| GAP-002 | OPEN — blocks S05 pricing          | Original length-only ink intent conflicts with spec stroke-count/width costs.                                                         | Owner clarification before S05. Original idea takes precedence unless explicitly amended.                 | Owner answer recorded in decisions and matching pricing tests.                                                         |
| GAP-003 | OPEN — S19–S21                     | Browser/CORS/model/image provider capabilities are unverified.                                                                        | Verify authoritative docs and real browser calls; hide unsupported adapters without proxy.                | Dated capability matrix and authorized live smoke results, or explicit exclusion reason.                               |
| GAP-004 | OPEN — S01/S04/S09/S30/S36         | Upstream existence/licenses/compatibility and audio rights unverified.                                                                | Audit before each reuse; write precise notices.                                                           | Source commit/path/license and compatibility checks.                                                                   |
| GAP-005 | OPEN — S35/S39                     | Device/performance/memory budgets have no measurements.                                                                               | Profile required workloads and soak; record missing-device blockers.                                      | Actual device reports and passed budget gates.                                                                         |
| GAP-006 | OPEN — S32/S33, owner              | Production collection endpoint, deletion service and legal approval do not exist.                                                     | Keep endpoint empty and uploads disabled; test contract only; owner supplies service later.               | Consent/legal approval and real endpoint security/deletion smoke before enabling; not required for local-only release. |
| GAP-007 | OPEN — first successful deployment | Pages is now enabled and workflows installed; deploy is skipped because verification fails on moved docs-copy requirements (GAP-016). | Merge verified checker repair to main, observe Deploy Pages, then smoke test. No further upload required. | Successful Actions deployment and real live acceptance evidence.                                                       |
| GAP-008 | OPEN — S11–S13                     | Storage eviction, lifecycle loss and malformed import recovery not implemented.                                                       | Transactions, backup, quota UI, migrations and bounded archives.                                          | Failure-injection/round-trip/reload/catch-up tests.                                                                    |
| GAP-009 | OPEN — S02/S22/S26                 | Identity continuity, Trait Card completeness and image safety are not implemented.                                                    | Complete schemas (including omitted ancestry/runtime fields); conservative validators and safe fallback.  | Adversarial schemas/images and continuity tests.                                                                       |
| GAP-010 | OPEN — S34                         | Economy/carrying capacity and recovery grant thresholds are starting assumptions.                                                     | Run seeded archetypes and tune centrally, including anti-spam rewards.                                    | Reproducible harness reports and failure demonstrations.                                                               |

GAP-003/004/005/007–010 are future implementation/release gates, not failures of a completed game. Live AI tests require player-controlled credentials/authorization; no keys are requested in chat or stored in Git.

## Added during S01

| ID      | State                                  | Gap / root cause                                                                                                    | Closure evidence / next action                                                                                                                                |
| ------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GAP-011 | LOCALLY FIXED; publication blocked     | No runnable strict app/toolchain or automated checks.                                                               | S01 source/config/lockfile plus local workflows, 11 unit and 6 browser cases, controlled failures and npm verify green; see docs/S01_VERIFICATION.md and log. |
| GAP-012 | OPEN — upstream declaration limitation | Pixi8.22 bitmap-font declaration incompatible with exact optional checks; external declarations skipped explicitly. | Strict source type/lint pass. Recheck upstream at upgrades, remove skipLibCheck only when full declaration check passes; no claim it currently does.          |

No functionality assigned to later sessions is reported as shipped. The Pages permission blocker is external to local build correctness, not a reason to suppress CI verification. npm audit's minimatch vulnerability was fixed with exact 11.0.5 override (0 remaining findings); upstream override removal needs revalidation on dependency upgrades.

| ID      | State                    | Gap / root cause                                                                                          | Closure evidence / next action                                                                                                                                             |
| ------- | ------------------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GAP-014 | CLOSED — owner installed | Integration could not upload active workflows. Owner installed both at canonical .github/workflows paths. | Checkout and actual Actions job steps prove installed workflows run; verification failure is now separately GAP-016. Integration permission itself is not claimed changed. |

## Manual-install handoff follow-up

| ID      | State  | Gap / root cause                                                                                                                                   | Evidence / next action                                                                                                                                                                                                    |
| ------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GAP-015 | CLOSED | Temporary ZIP and untracked workflows were not available in the new checkout; instructions did not show a durable download or clear upload folder. | Commit plain files and setup README under docs/github-pages-setup; root README/deployment guide link to them; exact .github/workflows destinations and main policy documented. Verification in latest implementation log. |

Owner installation is now complete (GAP-014); `.github/workflows/` is canonical. GAP-007 remains for first successful deployment. Prior references to inert copies/untracked files are historical, not current setup instructions.

## Resume after owner installation

| ID      | State                          | Gap / root cause                                                                                                                                            | Evidence / next action                                                                                                                                                                                             |
| ------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GAP-016 | CLOSED — repaired PR CI passed | Docs verifier and setup links required duplicate workflow files after owner moved them into active paths. Verification exited 1 and deployment was skipped. | Validate installed sources, remove stale instructions, add 4 isolated regression tests; reproduce failing base and passing repair. GitHub Verify run 42735606550 passed on PR #4; main deployment remains GAP-007. |
| GAP-017 | CLOSED                         | Root README was developer-oriented and not a current player guide.                                                                                          | Rewrite with current usable behavior, limits, browser help and privacy/cost; developer material moved to docs/DEVELOPMENT.md; mandatory update/review policy in CONTRIBUTING.md.                                   |

## Startup follow-up

GAP-018 — OPEN: complete S02 schemas/config/shared UI next, then S03 and S04 in order; design-reference ledger records required source/license/performance review. Startup addition does not close these gameplay gates.

## S02 outcome

GAP-018 — S02 portion complete: strict schemas (including root-percentage ancestry, jobs, corpse and inventory), separate AI normalization, configuration registries, resumable RNG, lifecycle events, shared controls and architecture regression fixtures. S03/S04 remain future work, now next in order. See docs/S02_VERIFICATION.md. GAP-009 still covers later identity continuity/image safety; GAP-008 still covers real storage/migration recovery. GAP-002 pricing clarification still blocks S05, not S03.

The earlier S01 publication-blocked rows are historical: PR #5 is merged in the current base and Pages run 42738724731 reports SUCCESS. Public S02 acceptance is not claimed before its own merge/deploy.

## Owner style correction

GAP-019 — implemented: initial splash/gradient-circle/mint branding rejected. Replaced with flat blue-circle favicon, the fish tank name, dark-blue global theme, incremental loading word and actual pinned MIT Oimo APIC fluid/shader adaptation. Source/edit/path/license ledger is docs/REUSE_LEDGER.md; distribution includes full adaptation licenses. Test limitations: headless/SwiftShader observations, not physical-device certification. S03 remains next. Owner authorized merging PR6 after verified correction.

## Direct aquarium startup correction

GAP-020 — implemented: loader minimum 3000ms, low-budget grainy Oimo water and direct full-window aquarium GUI, no landing page or fake gameplay controls. S03 fixed-step tank layers/particles/quality work remains next, with physical-device profiling still GAP-005. Owner explicitly authorized merging this correction after checks pass.

## S03 — pooled loader and fixed-step scene

Implemented seeded pooled particles, ordered layers/surface, bounded 30Hz loop and quality/reduced-motion controls. Loader begins pooled at the bottom with no warmup. See `docs/S03_VERIFICATION.md` for tests, controlled regressions, source reuse and software-browser measurements. Real-device GAP-005 remains open; no creatures/storage/economy or S04 currents implemented. Full local verify passed: 84 unit/16 browser/11 architecture/4 documentation tests, build/lint/typecheck/hash checks and audit zero. Publishing S03 for review; hosted verification and merge/deployment pending.

## S04 reuse-first preparation

S03 PR #8 merged (`ae23c60907a55c74b6ffb12298ec9ee5a7c129f8`), hosted verify passed. Downloaded and studied owner-provided MIT water demo and Screenjoy sources; pinned snapshots/licenses/hash records retained. Fish Tank Plus public UI studied; licensed source/access remains open. See `docs/S04_PREPARATION.md`. Next implementation: direct tank reveal and aquarium cursor/touch flow/ripples with existing Pixi/30Hz/quality/motion infrastructure, adapting downloaded code rather than replacing the app. S04 runtime not yet implemented. README unchanged: research-only preparation introduces no player-visible feature.
