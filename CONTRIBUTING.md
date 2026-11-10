# Contributing and project conventions

Read the [working rules](_working_docs/AGENT_RULES.md), [chunking process](_working_docs/CHUNKING_MECHANISM.md), current audit/log/roadmap, [idea](GAME_IDEA.md), [technical specification](TECH_SPEC.md) and [implementation plan](IMPLEMENTATION_PLAN.md) before implementation. Original input documents are preserved; record amendments in DECISIONS.md.

## README is the player's guide — keep it current

**For every user-visible update, update README.md in the same change.** Explain how to open the current build, what the user can actually do, how to use new controls, browser requirements, data/cost behavior and any relevant limitations. Remove instructions that no longer match the app. If an internal change genuinely needs no player-guide change, record why in the implementation log or PR review.

Do not turn the README into an agent diary, deployment checklist or list of technical promises. Keep developer commands in docs/DEVELOPMENT.md, deployment details in docs/DEPLOYMENT.md and audit evidence in _working_docs/. Never describe planned features as playable. Before reporting a release, compare README's controls/capabilities with the real app and update its release status from observed deployment evidence.

## Verification and sources of truth

- Run `npm run verify` and the focused tests for the change; record controlled failure/restoration for new checks. See [setup](docs/DEVELOPMENT.md) for browser requirements.
- `.github/workflows/ci.yml` and `.github/workflows/pages.yml` are the canonical installed workflows. Documentation links to them; do not require duplicate template files under docs.
- Keep gameplay rules, UI primitives, tokens and strings centralized. Validate external input and never execute AI output.
- Commit no credentials, exports with private data, generated browser archives, node_modules or dist artifacts. No application secrets are required for the current preview.
- Work only on the active Arena session branch. Open a PR for main; deployment is gated on verification and occurs after main updates. Do not merge without authorization.
