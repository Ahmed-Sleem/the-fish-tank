# The Fish Tank

A full-screen living aquarium where a player's drawing becomes the seed for AI-driven personality, gradual growth and inherited offspring—without turning handmade creatures into generic realistic fish.

**Current build: S01 foundation.** A real Vite/TypeScript/PixiJS app scaffold and responsive development page. Drawing, living fish, AI, saves and other game systems are **not implemented yet**. Phase 1 continues in S02–S04.

## See the current build

- **Arena preview:** open the running “Tank — Phase 1 preview”; Vite serves `/the-fish-tank/` and hot-reloads local edits.
- **GitHub Pages:** expected address https://ahmed-sleem.github.io/the-fish-tank/. Activation and workflow upload are blocked by integration permissions—this address is not a claim of successful deployment. See [one-time setup and actual delivery process](docs/DEPLOYMENT.md).
- **Publishing branch:** `arena/f3e87408-the-fish-tank`. Once the workflow publication blocker is resolved, verified pushes will run Deploy Pages; refresh after success. The public build displays its source commit. No main-branch merge is needed for this configured publishing branch.

**Publishing blocker:** GitHub rejected workflow files because the Arena connection lacks `workflows` permission. App source can be pushed, but `.github/workflows/ci.yml` and `pages.yml` remain saved locally until authorization is updated. No remote CI run or live deployment is claimed.

## Run and verify

Node **22.22.3**, npm **10.9.8**, Python 3:

```sh
npm ci
npx playwright install --with-deps chromium
npm run dev
```

Open the address Vite prints, including `/the-fish-tank/`. Before publishing:

```sh
npm run verify
```

Runs documentation/source hashes, formatting, typed lint, strict source typechecking, unit tests, architecture checks, dependency audit, production build and real-browser smoke at the Pages subpath. The [S01 verification report](docs/S01_VERIFICATION.md) distinguishes measured results, mutation checks and sandbox restrictions. `npm run build` and `npm run preview` serve a production build locally.

## Project references

- [Original game idea](GAME_IDEA.md) — includes the owner's verbatim concept, highest-priority creative reference.
- [Technical specification](TECH_SPEC.md) — locked stack, models, AI, economy and 12 phases.
- [Detailed implementation plan](IMPLEMENTATION_PLAN.md) — 39 ordered single-session steps with dependencies, tests and exit gates.
- [Decisions/conflicts](DECISIONS.md), [third-party notices](THIRD_PARTY_NOTICES.md).
- [Agent rules](_working_docs/AGENT_RULES.md) and [chunking mechanism](_working_docs/CHUNKING_MECHANISM.md).
- [Next session](_working_docs/NEXT_SESSIONS_ROADMAP.md), [audit](_working_docs/AUDIT_AND_TODO.md), [implementation log](_working_docs/IMPLEMENTATION_LOG.md), [changelog](_working_docs/CHANGELOG.md).

All four supplied reference documents remain unchanged; amendments are separate.

## Client-side boundary

The static app is GitHub Pages compatible. Rendering, simulation, local IndexedDB and procedural fallback will run in the browser. Optional AI uses the player's key directly with browser-supported providers. No owner AI billing or required game backend. Saves will be device/browser-local with export/import; optional collection stays off without consent and an external endpoint. The current shell makes no external service requests or uploads and does not ask for a key.
