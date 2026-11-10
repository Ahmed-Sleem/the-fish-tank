# Project decisions and interpretations

Date: 2026-11-08. These notes clarify planning; the supplied idea/spec remain unchanged.

| ID      | Question                           | Choice / rationale                                                                                                                                                                                                                                                                                                  | State                           |
| ------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| DEC-001 | Hosting and architecture           | Plan for static GitHub Pages hosting, browser-only simulation/storage and direct player-key AI requests. No game server or owner-funded AI. Optional collector remains external and disabled.                                                                                                                       | Planning baseline; not deployed |
| DEC-002 | Session granularity                | Decompose the 12 ordered phases into 39 cohesive sessions, including verification/handoff. Split a future step before starting if actual scope exceeds a session; never trade correctness for the schedule.                                                                                                         | Adopted                         |
| DEC-003 | Production MockProvider conflict   | TECH_SPEC §12.10 mentions mock demo mode; working rules prohibit production mocks. Use genuine drawing-derived procedural fallback in production; MockProvider exists only under tests/harness.                                                                                                                     | Adopted                         |
| DEC-004 | “Birth is free” wording            | Birth needs no AI image; text/vision pricing still depends on the selected provider/model/account. Only no-key procedural play is guaranteed to make no paid AI requests. State this accurately in onboarding.                                                                                                      | Adopted                         |
| DEC-005 | Key persistence                    | Session-only default plus explicit opt-in to remember in IndexedDB. Never localStorage, export, sync or logs. Explain browser storage is not a vault. This adds a safer option without removing specified local persistence.                                                                                        | Adopted                         |
| DEC-006 | Unspecified packaging/UI framework | Plan npm (permitted by spec), HTML/CSS overlay with shared TypeScript UI primitives; no extra framework required. Exact versions, supported Node and dependency audits are chosen in S01, not invented now.                                                                                                         | Planned                         |
| DEC-007 | Branding/audio/plants              | Working title Tank; soft handmade creatures in luminous water, English i18n-ready, low-volume optional audio; procedural L-system plants required, image plants optional and deferred. No v1 accounts.                                                                                                              | Spec defaults retained          |
| DEC-008 | Deletion authentication            | A public installId alone cannot authorize destructive collector requests. S32 specifies a separate local deletion credential, never included in exports/sync payloads. Collector implementation/legal review remains owner responsibility.                                                                          | Planned security refinement     |
| DEC-009 | Import semantics                   | “Merge as new tank” imports an independent selectable local tank, not a silent merge of entity/reward IDs into the active tank. S12 documents identity handling and validates lineage.                                                                                                                              | Planned interpretation          |
| DEC-010 | Ink conflicts                      | Original idea says only drawn length costs and lifting pen is free; organized idea agrees, but TECH_SPEC §8 adds per-stroke overhead and width weighting. Preserve both sources; obtain owner resolution before finalizing S05 pricing, with original idea prevailing unless owner explicitly approves the formula. | OPEN: GAP-002                   |
| DEC-011 | Spec cross-reference mistakes      | Growth/offspring/plant job section numbers in earlier spec prose are stale. Use named headings: Birth §12.5, Growth §12.6, Offspring §12.7, Plant §12.8; image pipeline §12.4, keys §12.2. Do not alter original attachment.                                                                                        | Adopted navigation correction   |
| DEC-012 | Evidence vs estimates              | Targets and repository/license claims in the spec are requirements/research leads, not verified facts. Provider browser support, dependency versions, performance and Pages live behavior need evidence in their owning sessions.                                                                                   | Adopted                         |

## Research policy

No nontrivial implementation technology is newly substituted in this planning pass. Primary-document and live-browser verification is scheduled before dependent implementation, especially S01, S04, S19 and S30. Published official guidance to consult at those steps:

- Vite static deployment: https://vite.dev/guide/static-deploy.html#github-pages
- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- IndexedDB lifecycle/storage guidance: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

These URLs are research entry points, not a claim they or provider APIs were live-tested here. The planning environment only permits a limited set of network hosts; official sites outside that set must be checked in an environment that can access them. If a locked requirement proves impossible, stop that dependent step and inform the owner rather than changing architecture silently.

## Hosting research observed in this planning session

On 2026-11-08, retrieved `vitejs/vite` official source `docs/guide/static-deploy.md` through GitHub API. Latest path commit returned: `8a4c19cfc035f2dd203f2fa6d00ab9256a5e77c9`.

Source: https://github.com/vitejs/vite/blob/8a4c19cfc035f2dd203f2fa6d00ab9256a5e77c9/docs/guide/static-deploy.md

Observed guidance confirms project Pages hosting needs `base: '/<REPO>/'`, Pages source set to GitHub Actions, and a workflow that builds before deployment. Therefore S38 explicitly uses `/the-fish-tank/`, tests built subpath assets and checks Pages settings. This verifies the hosting planning pattern only—not this repository's future deployment or provider compatibility.

## DEC-013 — Early Pages delivery (2026-11-08, owner requested)

Bring Pages deployment plumbing from S38 into S01, preserving gameplay-phase order. Publish verified pushes from `arena/f3e87408-the-fish-tank` to the single repository Pages site; do not automatically publish unrelated branches. The site is explicitly an incremental development build. Owner authorization is from the latest chat request; no further approval is needed for those branch deploys. GitHub API activation returned 403, so owner setup is required. S38/S39 still validate the finished release. No main-branch switch or merge is authorized or performed.

## DEC-014 — Compatible toolchain and scoped declaration limitation (2026-11-08)

Node 22.22.3/npm 10.9.8; exact versions in package.json/lockfile. Registry-latest TypeScript 7 is outside typed ESLint's declared `<6.1.0` compatibility, so use latest supported TS6.0.3. Pin Vite8.3.7/Vitest5.1.0/Pixi8.22.0/Paper0.17.0/Dexie4.4.7/Zod4.6.7/simplex-noise4.0.3. Optional filters/workers wait for their actual feature audit.

Pixi's external bitmap-font declaration fails exact-optional checking; `skipLibCheck: true` skips external declaration internals, not strict app code. GAP-012 records this limitation. A lint-only transitive minimatch vulnerability is patched through exact override 11.0.5; full audit and tests pass. Do not hide it with an audit suppression.

## DEC-015 — Honest early shell (2026-11-08)

Publish a responsive, static, underwater-styled development shell and actual empty Pixi renderer status, commit identifier and working source/plan links. No canned fish or fake wallet/AI buttons. Its temporary overlay is not the final gameplay layout. Design tokens and strings are shared from the start; the complete UI library and entity schemas remain S02. No art or simulation code has been copied from upstream projects yet.
