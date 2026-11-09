# The Fish Tank

A full-screen living aquarium where a player's drawing becomes the seed for AI-driven personality, gradual growth and inherited offspring—without turning handmade creatures into generic realistic fish.

**Current status: documentation and implementation plan only. No playable app or live deployment yet.**

## Start here

- [Original game idea](GAME_IDEA.md) — includes the owner's verbatim concept, the highest-priority creative reference.
- [Technical specification](TECH_SPEC.md) — locked stack, data, AI, economy and 12 build phases.
- [Detailed implementation plan](IMPLEMENTATION_PLAN.md) — 39 ordered, single-session work units with scope, dependencies, verification and exit gates.
- [Decisions and conflicts](DECISIONS.md) — interpretations, constraints and unresolved ink-pricing conflict.
- [Agent rules](_working_docs/AGENT_RULES.md) and [chunking mechanism](_working_docs/CHUNKING_MECHANISM.md).
- [Next session](_working_docs/NEXT_SESSIONS_ROADMAP.md), [audit](_working_docs/AUDIT_AND_TODO.md), [implementation log](_working_docs/IMPLEMENTATION_LOG.md), [changelog](_working_docs/CHANGELOG.md).
- [Third-party notices](THIRD_PARTY_NOTICES.md).

## Intended delivery

Static GitHub Pages app using TypeScript, Vite, PixiJS v8 and Paper.js. Rendering, simulation, saves and procedural fallback run in the browser. Optional AI uses the player's own key directly with browser-supported providers. No owner AI billing or required game backend. IndexedDB is device/browser-local; export/import supplies portable backups. Optional data collection stays off without explicit consent and a separately operated endpoint.

The four supplied reference documents are preserved unchanged. Clarifications are separate so original requirements are not lost. Implementation must be verified one session at a time; the plan is not evidence that features already work.

## Documentation validation

Requires Python 3 only:

```sh
python3 scripts/verify_docs.py
git diff --check
```

Application install/test/build commands will be established in S01. No npm setup or deployment instructions are claimed to work before implementation.
