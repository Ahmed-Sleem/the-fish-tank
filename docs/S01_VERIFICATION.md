# S01 verification report

Date: 2026-11-08 (session date). Scope: toolchain, empty PixiJS app shell, early Pages plumbing. S01 CI publication is BLOCKED by GAP-014. Phase 1 as a whole is **not accepted**; S02–S04 remain.

## Commands and observed outcomes

- Registry checks: queried exact package versions, engines and TypeScript/ESLint/Vite peer ranges. Selected TypeScript 6.0.3 rather than registry-latest 7.0.2 because typescript-eslint declares `<6.1.0` support. Node 22.22.3 satisfies all selected engines.
- `npm audit` initially found a moderate minimatch glob denial-of-service in lint-only transitive dependencies (GHSA-g3hv-75wg-m249). Exact override `minimatch: 11.0.5` removes the vulnerable versions. All lint/type/unit/build/browser checks pass with it. Final audit: **0 vulnerabilities**. Review/remove the override once upstream ranges move to fixed releases.
- `npm run verify`: PASS for documentation/source hashes, Prettier, typed ESLint, strict source typechecking, **11 unit cases**, source architecture checks, dependency audit, production build and **6 Playwright cases** (3 scenarios × desktop/mobile).
- `npm ci` from the final lockfile: PASS (152 packages, 0 audit findings); full verification rerun afterward: PASS.
- `git diff --check` and `node --check scripts/verify-architecture.mjs`: PASS.
- Normal Playwright CDN installation failed due sandbox outbound restrictions. Local real-browser tests used separately installed Chromium 153.0.8010.0 from `@sparticuz/chromium@153.0.0`, with software WebGL. No browser archive was added to Git. CI uses standard Playwright Chromium.

## Tests proved red before green

Controlled mutations were applied one at a time and always restored:

| Guard                    | Deliberate defect                       | Observed failure                        |
| ------------------------ | --------------------------------------- | --------------------------------------- |
| Valid commit label       | Return uppercase                        | Normalization case fails                |
| Invalid commit labels    | Return unsafe fallback text             | All 6 invalid-revision cases fail       |
| Pre-cancelled startup    | Ignore initial abort                    | Test detects unexpected initialize call |
| Cancel during async init | Ignore second abort check               | Pending-cancel test fails               |
| Ready-session disposal   | Remove abort listener                   | Dispose-once test fails                 |
| Failed-init cleanup      | Remove error disposal                   | Failed-start cleanup test fails         |
| Typecheck                | Assign string to number                 | TS2322                                  |
| Lint                     | Add production console.log              | no-console error                        |
| Format                   | Remove import spacing                   | Prettier rejects file                   |
| Production boundaries    | Inject mock marker                      | Architecture check rejects it           |
| Network boundary         | Inject fetch marker                     | S01 unapproved-network check fails      |
| Theme tokens             | Hardcode color in shell CSS             | Centralized-value check fails           |
| Dependency pins          | Change Vite pin to caret range          | Exact-version check fails               |
| Build                    | Invalid export syntax                   | Vite reports Unexpected token           |
| Browser ready            | Never report completed startup          | Normal desktop/mobile smoke fails       |
| Browser fallback         | Suppress unavailable-graphics status    | Failure desktop/mobile smoke fails      |
| Context-loss status      | Keep reporting ready after context loss | Context-loss desktop/mobile smoke fails |

Final green runs use restored production sources. Mutation logs and extracted browsers are scratch files, not durable dependencies. Initial test-script expectation said “Expected”; Vite's actual diagnostic was “Unexpected token”; corrected that harness expectation without changing the build failure.

## Root-cause fixes found by checks

- Pixi v8.22.0's `AbstractBitmapFont` external declaration conflicts with exact optional property checking. `skipLibCheck` is explicitly limited to third-party declaration checking; source remains strict with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, unused checks and typed lint. GAP-012 tracks upstream declaration checking, rather than claiming it passed.
- Pixi's browser environment lazily imports its accessibility extension and creates a mobile off-screen activation button even on an empty stage. E2E found it. Load the browser environment before removing that extension for this **decorative** canvas. Meaningful content is HTML with headings, status and keyboard navigation. Entity-canvas accessibility must be revisited with S10/S37. We did not weaken the no-unfinished-buttons assertion.
- AbortSignal changes during `await` were incorrectly treated as fixed by a lint narrowing rule. Re-read cancellation through a helper; unit tests prove cancellation both before and during init.

## Browser/visual scope

Production subpath load + reload, actual Pixi WebGL initialization, one canvas, no horizontal overflow, real source link, no fake game controls, zero external requests, no page errors, skip-link keyboard focus, graphics-unavailable fallback and context-loss status. Desktop 1440×1000 and mobile 390×844 screenshots visually reviewed; mobile test also requests reduced motion (the shell has no animation). No real phone or 60-fish performance claim.

## Hosting boundary

Pages setup API: 403 (integration scope). Owner must select GitHub Actions in repository Pages settings and allow this branch if necessary. Expected URL is not evidence of a deployed site. Actions and actual live status are recorded separately in the implementation log after pushing.

Workflow push attempt was rejected for missing `workflows` permission; no GitHub Actions run was created. Local app checks passed, but the remote CI/deployment gate did not run. Workflows remain saved in the workspace for upload after connection authorization.
