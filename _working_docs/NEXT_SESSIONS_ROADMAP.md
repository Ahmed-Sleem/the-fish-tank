# Next-session roadmap

## Current state

S01 app scaffold exists; all gameplay sessions S02–S39 remain not started. Owner installed **both workflows** and enabled Pages with GitHub Actions. Do not ask for another upload or PAT. `.github/workflows/{ci,pages}.yml` are canonical, not documentation copies.

Initial main CI failed at `npm run verify` because our docs checker still required the moved handoff files. GAP-016 repairs that checker/links and adds regression coverage. Current branch is `arena/e967afb3-the-fish-tank`; no workflow YAML modifications are needed. Consult the latest implementation log for actual PR/run outcomes, not older permission-blocked handoffs.

## Next actions

1. Complete PR verification for the repair, then have the owner review/merge to main. No unauthorized main merge or switch.
2. Observe **Deploy Pages** on the new main commit; check the build/artifact/deploy jobs and public URL before calling it live. Old failed commits still contain the old bug.
3. After first successful delivery, execute **S02 — schemas, configuration and shared UI library**, only that bounded step. S03/S04 later add fixed-step water/current/ripple behavior.
4. Read rules/idea/spec/audit/log/changelog/plan and [contributor policy](../CONTRIBUTING.md); inspect Git reality and write the session checklist.
5. Reuse existing safe DOM/theme/strings/startup/verification components. No fake UI or unsupported provider claims.

## Standing player-documentation requirement

**Update README.md with every user-visible change in the same work.** It is for the person using/playing Tank: how to open the current build, what actually works, controls, troubleshooting, privacy/cost and limitations. Never present future gameplay as shipped. Technical install/deployment instructions belong under docs. If internal-only changes need no README edit, record that reason explicitly. Review README against actual behavior before handoff/release.

## Continuing gates

- GAP-007 first successful Pages release and GAP-016 remote repaired-build validation remain to be observed.
- Owner ink-pricing clarification for GAP-002 before S05.
- Licenses/provider browser support/performance and no-key playable fallback remain future feature gates.
- No further gameplay phase acceptance is implied by publishing the S01 shell.
