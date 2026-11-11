# Developer setup

The current product is the S01–S04 foundation — toolchain, contracts, tank scene and interactive water — not a playable game. Player instructions are in the [README](../README.md). Update that guide with every user-visible change; see [contributing](../CONTRIBUTING.md).

## Requirements and commands

Use Node **22.22.3** (`.nvmrc`), npm **10.9.8** and Python 3. Exact dependency versions are pinned in package.json/package-lock.json.

```sh
npm ci
npx playwright install --with-deps chromium
npm run dev
```

Open the address Vite prints, including `/the-fish-tank/`. The server binds `0.0.0.0` and permits Arena `.e2b.app` preview hosts. `npm run build` then `npm run preview` serves production output.

Before committing/publishing:

```sh
npm run verify
```

This runs original-source hashes, documentation/installed-workflow checks and their Python regression tests, formatting, typed lint, strict app types, unit tests, architecture checks, dependency audit, build and real-browser smoke at the Pages subpath. Focused commands are listed in package.json. Do not skip tests to make deployment green.

## Browser test constraints

Normal CI installs Playwright Chromium with OS dependencies. This sandbox's network may block the browser CDN. Local verification can use a separately installed Chromium through `CHROMIUM_EXECUTABLE_PATH`; its OS libraries must be present. Earlier runs used `@sparticuz/chromium@153.0.0` downloaded from npm into /tmp with bundled library archives extracted there, not committed or shipped. No test result using that override is a real-device performance claim.

## References and evidence

- [Technical specification](../TECH_SPEC.md), [plan](../IMPLEMENTATION_PLAN.md), [decisions](../DECISIONS.md) and [third-party notices](../THIRD_PARTY_NOTICES.md).
- [Repository study](../_working_docs/REPO_STUDY.md) — start here for orientation: where the project stands, what is next and what is genuinely open.
- [S01 validation](S01_VERIFICATION.md), [S02](S02_VERIFICATION.md), [S03](S03_VERIFICATION.md), [S04](S04_VERIFICATION.md) validations, [audit](../_working_docs/AUDIT_AND_TODO.md), [implementation log](../_working_docs/IMPLEMENTATION_LOG.md), [next step](../_working_docs/NEXT_SESSIONS_ROADMAP.md).
- [Deployment operations](DEPLOYMENT.md) — workflows are now installed; no more template uploads are required.
