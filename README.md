# The Fish Tank

A full-screen living aquarium where a player's drawing becomes the seed for AI-driven personality, gradual growth and inherited offspring—without turning handmade creatures into generic realistic fish.

**Current build: S01 foundation.** A real Vite/TypeScript/PixiJS app scaffold and responsive development page. Drawing, living fish, AI, saves and other game systems are **not implemented yet**. Phase 1 continues in S02–S04.

## GitHub Pages: download and install the two files

**[Open `docs/github-pages-setup/`](docs/github-pages-setup/README.md)** for the plain `ci.yml` and `pages.yml` files and step-by-step instructions. **No ZIP needed.**

Download them, then install them on GitHub's **main** branch at these exact paths:

```text
.github/workflows/ci.yml
.github/workflows/pages.yml
```

The guide has direct **Create file** links that create the missing folders for you. Do not upload the files into the repository root. The copies under `docs/` are inert; they must be installed by the owner because the integration cannot currently write active workflows.

Then choose **GitHub Actions** in [Pages settings](https://github.com/Ahmed-Sleem/the-fish-tank/settings/pages) and run **Deploy Pages** on main. Expected URL after success: https://ahmed-sleem.github.io/the-fish-tank/. This is not a claim of a live deployment.

## See development changes

Use Arena's preview while an app server is running (`npm run dev`, `/the-fish-tank/`) for immediate local edits. The new manual-install templates publish **main** after merges and successful verification, not a temporary Arena branch. See [deployment details](docs/DEPLOYMENT.md).

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
