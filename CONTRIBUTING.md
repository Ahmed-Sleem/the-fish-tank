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

## Permanent identity and reuse-first direction

The product name is **the fish tank**, not Tank. Use a mysterious **dark-blue** palette across every screen/control/dialog; no mint/green styling. The favicon is one **flat, solid blue circle**: no gradient, highlight, texture or border. Loader copy is **loading**, revealed one letter at a time then repeated; reduced motion shows it statically. Use the licensed Oimo Water adaptation for loader interaction, not CSS droplet/ring substitutes. Retain the 1500ms minimum plus real readiness gates and readable failure fallback.

**Heavy code reuse is the default working method.** Before new nontrivial work, search existing project primitives and suitable GitHub/reference implementations, collect pinned useful source with licenses, study it, adapt it, test it and update [the reuse ledger](docs/REUSE_LEDGER.md) with exactly what changed and where it is used. Do not claim study-only code as shipped. Preserve notices in both repository and distributed site. This direction is binding for all later phases, not just this restyle.
