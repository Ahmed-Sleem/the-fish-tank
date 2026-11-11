# Changelog

## 2026-11-08 session 1 — Documentation and detailed planning

- Preserved original idea, technical specification, agent rules and chunking rules unchanged.
- Added 39-session implementation plan, all 12 phase gates, requirements traceability, browser-only/GitHub Pages constraints, decisions and tracked risks.
- Added durable audit/log/roadmap and a documentation verifier; refreshed README.
- Validation: source comparison, structural/link checks, controlled negative checks and credential-pattern scan; see implementation log for observed outputs.
- Push status: documentation commit prepared for the fixed Arena branch; final chat reports remote verification after push. No app deployed.
- Next: owner review, then S01 toolchain only. Resolve ink pricing conflict before S05.

## 2026-11-08 session 2 — S01 and early Pages delivery

- Built strict TS/Vite/PixiJS application shell with real graphics status, mobile layout, safe DOM primitives and centralized copy/theme.
- Added exact dependencies/lockfile, typed lint, format, unit and browser tests, architecture checks and full verification CI.
- Added verified-artifact Pages workflow for the current Arena branch as explicitly requested; wrote activation/rollback guide and adjusted plan ordering exception.
- Validation: 11 unit and 6 browser cases pass; 17 controlled mutation categories fail as intended then restore; npm audit 0 findings. Full evidence in docs/S01_VERIFICATION.md.
- Known limits: Pages activation rejected by integration scope (owner settings required); third-party Pixi declaration checking tracked separately. No gameplay or Phase 1 completion claimed.
- Publication: first push rejected for missing workflows permission; app source published separately, local workflow files retained pending authorization (GAP-014). No Actions run claimed. No default-branch merge performed.
- Next: S02 only, after checking live publishing status.

## 2026-11-08 session 3 — Plain workflow downloads and clear upload paths

- Added docs/github-pages-setup with two plain workflow files and step-by-step download/web-editor/upload instructions; no ZIP required.
- Documented exact destination paths `.github/workflows/ci.yml` and `.github/workflows/pages.yml` on main; stable main publishing supersedes the old temporary branch trigger.
- Corrected stale handoff/deployment instructions and linked the setup folder prominently from README. Earlier temporary archive absent; no replacement archive generated.
- Validation: YAML parse/contract assertions, 15 controlled negative documentation checks, full npm verify (11 unit + 6 browser cases), source hashes and heuristic secret scan passed.
- Publication: current Arena branch only, inert docs templates only; Pages enablement/active workflow installation remains owner action, not a completed deployment.
- Next: owner install templates and enable Pages; then observe real CI/deployment before closing S01 publication gates.

## 2026-11-08 session 4 — Repair verification after owner workflow installation

- Owner installed workflows and enabled Pages; diagnosed failed verification as stale required paths/links to moved doc copies, not a Pages configuration mistake.
- Validate installed workflows directly without duplicate files; add 4 Python regression cases and controlled-failure proof to central verification. Keep workflow YAML unchanged.
- Rewrite README as the player guide and move dev setup to docs; add standing requirement to refresh it with every user-visible change.
- Local full verification passes: 4 Python + 11 TypeScript unit + 6 real-browser cases, build, hashes, architecture, audit and formatting.
- Hosted verification run 42735606550 passed on PR #4. Release remains pending main merge and successful Pages deployment; no gameplay advance or live-site success claimed.
- Next: observe repaired CI/release, then S02.

## Circular favicon and interactive startup splash

Added original lightweight CSS water drop and bounded pointer ripples; waits for both 1500ms and page/renderer initialization. Reduced motion is static; startup failures expose existing fallback. Pixi downloads dynamically. Collected pinned Apache-2.0 Paper water reference with LICENSE/NOTICE and documented five-site research and sequential reuse gates. Updated player README. S02–S39 remain future bounded sessions; no new gameplay or public deployment claimed.

Verification: full `npm run verify` passed (4 Python docs regressions, 13 unit tests, 8 desktop/mobile Chromium cases, audit 0). Removing minimum-delay and readiness gates separately made the respective unit tests fail (exit 1), then restored green. Browser checks cover delayed renderer download, pointer/reduced-motion behavior, Pages favicon path, graphics failure and keyboard release. Removed obsolete docs/github-pages-setup/README.md and updated verifier required paths; active workflow YAML untouched. No physical-device performance or public deployment claim.

## S02 — Shared contracts, configuration and accessible UI

Added complete strict v1 save/entity/trait schemas and bounded AI normalization; ancestry roots, inventory, corpse and persisted job metadata included. Added seeded RNG/state, lifecycle events, canonical balance/range configuration and negative-tested architecture guards. Shared native controls power the new About-this-build dialog with current graphics status, format version and limitations. Updated player guide and source/license ledger. S03 remains next; drawing, fish, saving and provider calls are not available yet.

## Owner-directed style correction — the fish tank

Renamed product UI/metadata to the fish tank; replaced mint/green palette with mysterious dark blue and the gradient favicon with a single solid blue circle. Replaced original droplet/DOM rings with actual MIT Oimo Water solver/shader adaptation, bounded for startup and interactive on hover/touch. Loading reveals successive letters and loops; reduced motion is static. Added canonical reuse ledger and shipped license files; permanent reuse-first/design policy now applies to all later phases. No gameplay phase beyond S02 is claimed.

## Lightweight grainy startup and direct aquarium GUI

Raised minimum loading duration to 3 seconds while retaining readiness gates. Reduced Oimo simulation/pixel/frame budgets, added static fragment grain and reused GPU storage. Removed landing-page hero/journal/footer and unused layout tokens; open directly into a full-window aquarium with floating working Fullscreen/About controls, graphics status and honest empty-tank message. Drawing/fish/economy remain future gameplay.

## S03 — pooled loader and fixed-step scene

Implemented seeded pooled particles, ordered layers/surface, bounded 30Hz loop and quality/reduced-motion controls. Loader begins pooled at the bottom with no warmup. See `docs/S03_VERIFICATION.md` for tests, controlled regressions, source reuse and software-browser measurements. Real-device GAP-005 remains open; no creatures/storage/economy or S04 currents implemented. Full local verify passed: 84 unit/16 browser/11 architecture/4 documentation tests, build/lint/typecheck/hash checks and audit zero. Publishing S03 for review; hosted verification and merge/deployment pending.

## S04 water implementation and loader adjustment

Implemented native Pixi half-float ping-pong ripples and refraction, seeded shared curl current, owner-source credited caustics/depth/rays, coalesced cursor/touch impulses and cleanup/quality/motion handling. Loader minimum now five seconds, bottom pool receives a bounded initial push. No Three dependency or placeholder fish. See `docs/S04_VERIFICATION.md` for exact scope, regression proof and honest software-renderer timings. Hardware <1.5ms GPU/60fps targets remain open GAP-005 (software RAF does NOT meet them); S05 pricing still blocked GAP-002. Full local verify passed: 86 unit, 22 browser, 11 architecture, 4 documentation tests; format/lint/typecheck/build/hash checks and audit zero. Publishing on arena/4cbba201-the-fish-tank for review; no auto-merge authorization assumed.

## 2026-11-11 session 5 — Full repository study and rules reconciliation

- Studied the whole repository and the four owner attachments; wrote `_working_docs/REPO_STUDY.md` as the durable orientation document (product, architecture, session map, genuinely open gates, next move).
- Reconciled the attachments: `GENERAL_GUI_AGENT_RULES.md` was missing from the repository and is now stored verbatim with a pinned hash; the owner's five design references are preserved verbatim and linked to the existing licence verdicts.
- Corrected status claims that reality had overtaken: GAP-007 (first deployment) closed against observed Actions runs and the live site; S02–S04 statuses, the phase-gate note, developer setup, roadmap, audit and player README updated.
- Added GAP-021 (no automated accessibility/contrast/responsive-matrix checks) and GAP-022 (single-theme departure not yet documented).
- Validation: `npm run verify` green — 86 unit, 22 browser, 11 architecture, 4 documentation tests, format, lint, strict types, audit zero, build; controlled failures observed for the new pinned hashes and required documents, then restored.
- Next: owner decision on GAP-002 ink pricing, then S05. GAP-005 60 fps recorded-target remains open.

## 2026-11-11 session 5 (continued) — brand colour centralised and guarded

- `--color-accent` had a second definition as the literal fill in `public/favicon.svg`; nothing kept them equal. Added `faviconAccentError` and wired it into `npm run verify:architecture`, with four fixtures.
- Controlled proof: favicon fill changed to `#396aac` failed verification (exit 1) naming both colours; restored file passed (exit 0).
- Note: an initial fixture asserted the _matching_ colour as a drift case and correctly failed, which is how the fixture was caught.
