# Next-session roadmap

## Current state

S01 and its favicon/interactive splash addition are merged. S02 contracts/configuration/shared UI are implemented on `arena/b46a5b8f-the-fish-tank`; see [verification](../docs/S02_VERIFICATION.md) and latest implementation log for final PR/check outcomes. S03–S39 have not started. Active canonical workflows remain unchanged.

## Next: S03 — Fixed-step tank scene and quality controls

1. Read rules, original idea/spec, plan, audit/log/changelog and actual Git state; write a bounded checklist.
2. Reuse S02 canonical schemas, RNG, typed events, balance/domain configuration, shared controls, tokens and strings. Do not fork them.
3. Build Pixi layer hierarchy, resize/DPR lifecycle, 30Hz accumulator/interpolation, gradient/surface, pooled particles and real quality settings. Bound background catch-up.
4. Revisit [source/reuse ledger](../docs/design-references/README.md), inspect compatible implementations, preserve licenses and measure actual workloads. Seer-like calm depth/bubbles are inspiration, not permission to import Three alongside Pixi.
5. Verify seeded state at different render rates, resize/context/disposal, reduced motion, quality settings and recorded frame costs before completion.
6. S04 then adds water currents, ripples and credited Paper-compatible caustics/rays. Do not implement S04 ahead of S03 acceptance.

## Standing gates

- README is the player guide: update with every visible change, never describe future gameplay as available.
- S02 data format exists as a contract, not an implemented storage/export interface. S11–S13 own persistence/recovery/migrations.
- GAP-002 owner pricing clarification before S05. GAP-009 identity/image pipelines, GAP-003 provider capability and GAP-005 device budgets remain open for their later sessions.
- Pages workflow run 42738724731 for merged PR5 reports success; S02 deployment requires its own reviewed merge and observed release. Never merge without authorization.
- After S02 verification/push and PR handoff, tell the owner to click **Continue** to begin S03 on the next session branch.

## Binding owner correction before S03

Product name: **the fish tank**. Mysterious dark-blue theme throughout; single flat-circle favicon. The loader is now adapted MIT Oimo APIC water with sequential **loading** text, not the rejected CSS droplet/rings. Read CONTRIBUTING.md, DEC-019 and docs/REUSE_LEDGER.md before further work. **Heavy source reuse** is mandatory: search/download/study/adapt/verify and record exact changes/locations. Owner authorized merge of PR6 after this correction and verification; do not ask again for that merge.

## Latest owner direction

No landing page: startup now opens the aquarium GUI directly. Loading minimum is **3 seconds** (plus real readiness), with lightweight grainy Oimo water. Preserve 1100-cell/DPR≤1/24Hz budgets, static grain and buffer/lifecycle reuse until measurements justify changes. Extend this direct GUI in S03; do not revive hero/journal pages or add fake wallet/tool actions. See DEC-020 and latest verification log. Owner authorized merging the startup/GUI PR once checks pass.
