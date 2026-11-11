# Contributing and project conventions

Read the [repository study](_working_docs/REPO_STUDY.md) for current state, then the [working rules](_working_docs/AGENT_RULES.md), [GUI production standard](_working_docs/GENERAL_GUI_AGENT_RULES.md), [chunking process](_working_docs/CHUNKING_MECHANISM.md), current audit/log/roadmap, [idea](GAME_IDEA.md), [technical specification](TECH_SPEC.md) and [implementation plan](IMPLEMENTATION_PLAN.md) before implementation. Original input documents are preserved; record amendments in DECISIONS.md.

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

The product name is **the fish tank**, not Tank. Use one quiet dark palette across every screen/control/dialog, and the owner's reference palette for the tank itself: teal/green plants, amber day rays, cyan night water (DEC-022 supersedes the earlier "no mint/green" line and DEC-019's permanent dark blue). **No borders or frames anywhere** — no HUD lines, no glass rim, no top light bar, no gravel band; separate with fill, space and soft gradients, and let `scripts/verify-architecture.mjs` reject a CSS border. All design values live in `theme.css`. The favicon is one **flat, solid circle** in the deep-water colour that must equal `--color-accent`: no gradient, highlight, texture or border. The product title appears on the loading screen only; the tank keeps an accessible heading that draws nothing. Every setting lives behind **one settings icon** whose dialog is the only control surface. Loader copy is **loading**, revealed one letter at a time then repeated; reduced motion shows it statically. Use the licensed Oimo Water adaptation for loader interaction, not CSS droplet/ring substitutes. Retain the 3000ms minimum plus real readiness gates and readable failure fallback.

**Heavy code reuse is the default working method.** Before new nontrivial work, search existing project primitives and suitable GitHub/reference implementations, collect pinned useful source with licenses, study it, adapt it, test it and update [the reuse ledger](docs/REUSE_LEDGER.md) with exactly what changed and where it is used. Do not claim study-only code as shipped. Preserve notices in both repository and distributed site. This direction is binding for all later phases, not just this restyle.

Open directly into the fullscreen-layout aquarium interface after loading; no landing page, hero, development journal or marketing footer. Keep unimplemented gameplay tools hidden, never fake them. Loading water is deliberately lightweight and grainy: preserve bounded low particle/pixel/frame budgets and reuse buffers.
