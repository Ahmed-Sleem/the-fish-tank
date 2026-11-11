# Repository study — where the fish tank stands

Written 2026-11-11 after a complete read of the repository, the four owner-supplied rules
files, and a full verification run. Every claim below was checked against the working tree,
`git`, `gh`, the running app and the live public site — not against the documents alone.

Read this first when starting a session. It is the orientation map, not a substitute for
[the working rules](AGENT_RULES.md), the [GUI rules](GENERAL_GUI_AGENT_RULES.md), the
[chunking mechanism](CHUNKING_MECHANISM.md), the [audit](AUDIT_AND_TODO.md) or the
[implementation plan](../IMPLEMENTATION_PLAN.md).

---

## 1. What the product is

**the fish tank** — a browser aquarium built on one idea: *you draw the beginning, then
discover what it becomes.* The player hand-draws a creature with ink bought from a coin
wallet; the drawing is the permanent seed identity. AI then reads the drawing and produces a
Trait Card — personality, behaviour parameters, ecology, growth, mating style, story — and
the creature grows through stages, inherits traits, breeds, and evolves without losing its
hand-drawn identity. The whole tank reacts to the cursor like water.

- **Not** a game server. Static site on GitHub Pages, browser simulation + IndexedDB storage,
  optional direct-by-owner-key AI calls. No login, no owner AI bill, no proxy.
- **Identity is locked by the owner:** product name *the fish tank* (not "Tank"),
  mysterious dark-blue palette everywhere, flat solid blue circle favicon, the word
  `loading` revealed one letter at a time.
- **Reuse is the mandated working method:** search → download → study → adapt → credit.
  `docs/REUSE_LEDGER.md` is the canonical what/how/where list.

The full creative vision is [GAME_IDEA.md](../GAME_IDEA.md) (22-section acceptance
checklist in §17). The engineering truth is [TECH_SPEC.md](../TECH_SPEC.md) (24 sections).
[IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) decomposes it into 39 sessions across 12
phases. Where the two owner documents disagree, the original idea wins unless the owner
amends it in [DECISIONS.md](../DECISIONS.md).

## 2. Where we are, precisely

| Item | State (verified 2026-11-11) |
| --- | --- |
| Branch | `arena/0fb511c8-the-fish-tank`, clean, branched from `main` @ `ead47c8` |
| Public site | https://ahmed-sleem.github.io/the-fish-tank/ **live, serving build `ead47c8`** |
| Merged PRs | #1–#9, all merged; Verify and Deploy Pages runs all `success` |
| Sessions done | **S01–S04** (phase 1 — foundation) |
| Next session | **S05 — drawing transactions and ink pricing** (blocked, see §5) |
| Anything playable? | **No.** There are no fish, no drawing, no saving, no economy yet |
| Tests | 86 unit, 22 browser (desktop + mobile Chromium), 11 architecture, 4 documentation |
| Central command | `npm run verify` — green on this branch (observed, not assumed) |

### What a visitor actually sees today

1. A five-second `loading` splash: the word appears one letter at a time and repeats, while
   a real WebGL2 APIC fluid (adapted, credited Oimo Water) pools along the bottom and stirs
   under the cursor.
2. Then the full-window tank: dark-blue depth gradient, glass edges, floor and surface cues,
   restrained light shafts, animated caustics, drifting particles.
3. Hover disturbs the water; click/tap-drag makes stronger ripples. Controls never inject
   water; open dialogs suspend it.
4. HUD: wordmark, **Settings** (Low/Medium/High quality, reduce-motion), **Fullscreen**
   (hidden where the API is absent), **About this build** (data-format version, live
   graphics status, build id, licences, source and plan links).
5. Bottom line: honest graphics status (`PixiJS renderer ready`, `Graphics unavailable…`,
   `Graphics context interrupted…`) and one sentence saying creatures arrive in a future
   build.

Everything the user cannot do yet is **hidden**, not faked. That is deliberate and is
audited by `tests/architecture`.

### How it is built

```
src/main.ts                 orchestration: loader + shell + dynamic renderer import
src/config/                 every value lives here, once
  app.config.ts             identity, loader minimum, renderer caps
  balance.config.ts         economy starting points (ink pricing deliberately absent)
  domain.config.ts          contract limits + the single behaviorRanges registry
  scene.config.ts           layer order, particle/quality presets
  water.config.ts           loader fluid budgets
  effects.config.ts         S04 ripple/caustic budgets
  ai.config.ts              provider/queue starting points (no adapter active)
  strings.en.ts             all English copy, translatable later
src/core/                   framework-free: events, fixed loop, seeded RNG, build label, schemas
src/ai/schemas/traits.ts    strict Trait Card + separate bounded AI normalization
src/sim/water/              curl-noise flow field, coalesced pointer input
src/render/                 Pixi v8 scene, particles, loader fluid, ripple/caustic filters
src/ui/                     shell HUD, settings, theme.css, shared DOM/control primitives
scripts/                    verify_docs.py, verify-architecture.mjs, architecture-rules.mjs
tests/{unit,e2e,architecture,docs}
docs/                       verification evidence, reuse ledger, design references
_working_docs/              rules, audit, log, changelog, roadmap, this study
```

Three boundaries are enforced automatically, not by intention
(`scripts/architecture-rules.mjs`, run by `npm run verify:architecture`):

- **Design values and breakpoints only in `theme.css`** — a hex colour or `12px` in any other
  CSS file fails the build.
- **No hand-rolled `<button>`/`<dialog>`** — shared primitives in `src/ui/shared/controls.ts`.
- **`src/core/` cannot touch the DOM or the renderer**; no `Math.random()`, no `fetch`, no
  `innerHTML`, no production mocks; domain types must be inferred from the Zod schemas; only
  `domain.config.ts` may define the rule registries.
- Plus: every dependency version must be exact (`save-exact` is policy).

The same idea governs non-code files: `verify_docs.py` pins SHA-256 hashes of the owner's
original documents so they cannot be silently edited, checks 39 session contracts, 12 phase
gates, 22 idea / 24 spec traceability rows, every local link, the installed workflow
contracts, and heuristically scans for credentials.

## 3. The road ahead — all 39 sessions

| Phase | Sessions | What it delivers |
| --- | --- | --- |
| 1 Foundation | **S01–S04 ✅** | Toolchain, schemas/config/UI library, fixed-step tank, interactive water |
| 2 Drawing + economy | S05–S07 | Ink pricing, Paper.js drawing mode, cutout pipeline → Stage 0 fish |
| 3 Fish engine | S08–S10 | Steering/spatial grid, mesh swimming, petting and cursor personality |
| 4 Storage | S11–S13 | Dexie saves, validated backup/import, safe away-time simulation |
| 5 Food + senses | S14–S16 | Shop/inventory, scent transport, needs/water/rescue |
| 6 Cards + history | S17–S18 | Trait Card shell, lineage and memorial views |
| 7 AI core | S19–S23 | Provider research, adapters, persistent queue, birth analysis, no-key fallback |
| 8 Growth | S24–S26 | Infinite stages, procedural morphs, image continuity |
| 9 Mating | S27–S29 | Inheritance, courtship/eggs, AI offspring jobs |
| 10 Plants | S30–S31 | L-system plants and plant ecology |
| 11 Sync | S32–S33 | Consent-gated opt-in upload and deletion |
| 12 Polish + release | S34–S39 | Balance harness, soak/performance, audio, a11y, Pages, live acceptance |

No phase starts before the previous phase's acceptance checkpoint is recorded as passed.
Each S-number is one session including preparation, tests, docs, verification and handoff.

## 4. What is genuinely open (and what only looked open)

The audit still carried claims that reality had already overtaken. Corrected here and in
[AUDIT_AND_TODO.md](AUDIT_AND_TODO.md):

| Gap | Old record said | Reality checked 2026-11-11 |
| --- | --- | --- |
| GAP-007 first deployment | OPEN, deploy skipped | **CLOSED.** Deploy Pages runs for #5–#9 all `success`; the live URL serves build `ead47c8` = local HEAD |
| S03/S04 status in the plan index | S03 "IMPLEMENTED LOCALLY", S02 "NOT STARTED" | Both merged (#8, #9); hosted checks green |
| Session records | "hosted verification and merge/deployment pending" | Merged and deployed for S01–S04 |
| Public player docs | README said updates appear after a verified merge | True, but it did not say the site was already live for S04 — now it does |
| `docs/DEVELOPMENT.md` | "the current product is the S01 foundation shell" | Now describes S01–S04 accurately |

Still genuinely open, in priority order:

1. **GAP-002 — ink pricing conflict (blocks S05, and S05 is next).** The owner's original
   idea and the organized idea both say *only drawn length costs money; lifting the pen is
   free*. TECH_SPEC §8.1 adds a per-stroke overhead (`rateStroke`) and width multipliers
   (`thin 1.0 / medium 1.5 / thick 2.2`). Per DEC-010 the original idea prevails **unless the
   owner explicitly approves the formula**. This cannot be guessed at: S05 implements the
   approved formula, the refunds and the wallet rules. **Owner decision required.**
2. **GAP-005 — real-hardware performance.** The <1.5 ms GPU ripple and 60 fps laptop/mobile
   targets have only ever been measured on software SwiftShader in this sandbox (which
   honestly did *not* meet 60 fps). Phase 1's checkpoint includes a 60 fps recorded-target
   gate, so phase 1 cannot be called accepted without a real device report.
3. **GAP-003 / GAP-009 / GAP-006 / GAP-008 / GAP-010** — provider capability, identity/image
   safety, the disabled collection endpoint, storage recovery and economy tuning. All are
   future-session gates, not defects in what shipped.
4. **GAP-012 — dependency declaration skip.** Pixi 8.22's bitmap-font declaration conflicts
   with exact optional checking, so `skipLibCheck` is used. Recheck at every upgrade.
5. **GAP-004 — licence audit per reuse.** Each adoption needs its pinned revision, licence,
   hashes and integration path recorded. Standing rule, not a one-time task.

## 5. The rules files, and where they now live

The owner attached four files. Two were already in the repository, byte for byte; one was
missing; one was a link list.

| Attached file | In the repo before this study? | Now |
| --- | --- | --- |
| `AGENT_RULES_SANITIZED_ACTIVE (1).md` | **Yes** — `_working_docs/AGENT_RULES.md`, identical (sha256 `6ddd622a…`) | Unchanged, hash-pinned |
| `chunking mechanism.md` | **Yes** — `_working_docs/CHUNKING_MECHANISM.md`, identical (sha256 `f76e629d…`) | Unchanged, hash-pinned |
| `GENERAL_GUI_AGENT_RULES.md` | **No** — absent from the repository | Added verbatim, hash-pinned, added to prettier ignore and required docs |
| `web-design-resources.txt` | Its five sites were already researched in `docs/design-references/README.md`, but the file itself was not kept | Added verbatim as `docs/design-references/owner-web-design-resources.txt` |

### How the three rule sets fit together

- **[AGENT_RULES.md](AGENT_RULES.md)** governs *process*: the production-ready standard,
  mandatory checklists in `_working_docs/thinking/`, "a check that cannot fail is not a
  check", one definition per value/component/rule, audit → fix → prove → log, session
  start/end protocols, security, git and communication rules.
- **[CHUNKING_MECHANISM.md](CHUNKING_MECHANISM.md)** governs *execution order*: read the
  rules → plan → chunk → per-chunk re-read, do, recheck, cross-check → whole-work review →
  readiness. Its point is that chunking exists to give each part enough care, not to move
  faster.
- **[GENERAL_GUI_AGENT_RULES.md](GENERAL_GUI_AGENT_RULES.md)** governs *interface quality*:
  the completion gate in §20, the one-change test, mandatory light/dark themes, AA contrast,
  keyboard/pointer/touch parity, reduced motion, responsive matrix (320×568 … 1920×1080,
  200% zoom, both themes), complete states for every control, no fake or dead controls,
  no duplicated components, and the "never offer what will be refused" rule.
- **[owner-web-design-resources.txt](../docs/design-references/owner-web-design-resources.txt)**
  is taste, not specification: Paper shaders, Seer, Codrops, Three.js Lab, GSAP demos. The
  existing research already records the licence verdict for each — Paper's repository code is
  Apache-2.0, Seer's site is MIT, Codrops is MIT, Three.js Lab's advertised repo 404s, GSAP is
  not MIT — so "get code from them" is allowed only where the licence and the study actually
  support it.

### Consequences that now apply to every later session

- The GUI rules demand **both light and dark themes** where the platform supports them. The
  product is deliberately dark-blue only. That is a documented departure (owner identity
  decision, DEC-019), and it must stay documented rather than quietly ignored. When Settings
  grows, a deliberate answer for "why no light theme" belongs in `DECISIONS.md`.
- The GUI rules demand a **responsive matrix**, not one breakpoint. Current CSS uses logical,
  fluid layout and one `clamp()`; there are no page-level breakpoints at all yet. That is
  acceptable for a full-window canvas, but it is not yet *proven* at 320 px, 200% zoom or
  landscape — there is no automated matrix test. Recorded as a gap.
- The GUI rules demand **enforcement by tooling**. Today the architecture checker enforces
  colour/spacing centralisation, shared controls and dependency exactness, but not the
  responsive matrix, contrast, or "every visible control works". Those remain manual.
- `GENERAL_GUI_AGENT_RULES.md` §20 is a completion gate, so no session may claim GUI work
  "complete" without answering its checklist.

## 6. Standards actually violated today (found by reading, not guessed)

1. **Favicon colour duplicated the brand token.** `--water-body` and `--water-foam` are read
   at runtime via `getComputedStyle` from the canvas hosts, so a `var()` grep reports zero uses
   and that is *not* a violation. But `--color-accent: #396aab` had a second definition: the
   literal fill in `public/favicon.svg`, which cannot read `theme.css`, with nothing keeping
   the two equal. **Closed:** `scripts/architecture-rules.mjs` now parses both files
   (`faviconAccentError`, wired into `verify-architecture`), so a drifted brand colour fails
   `npm run verify`. Proven by changing the fill to `#396aac` (exit 1) and restoring (exit 0).
   Lesson worth keeping: a comment saying "the favicon matches the token" is not a check.
2. **Stale status text in the documents** — corrected in this study (see §4). This is exactly
   what rule §12 ("documentation must match reality") exists to prevent.
3. **S03/S04 verification documents were not in the required-documents list**, so deleting
   them would not have failed verification. Fixed: `verify_docs.py` now requires them.
4. **README understated the release.** The public site was already serving S04 while the
   README still described publication as pending — README is required to change with every
   user-visible update. Corrected.
5. **No accessibility/contrast/responsive automated check.** The GUI rules make these
   mandatory and require tooling enforcement. Recorded as GAP-021, not silently accepted.
6. **No light theme, and no recorded reason.** The GUI standard requires deliberately designed
   light *and* dark themes. The product is dark-blue only by owner identity decision, which is
   legitimate — but the departure was never written into `DECISIONS.md`, so a future session
   could "fix" it or a reviewer could call it an oversight. Recorded as GAP-022.

## 7. How to work in this repository

```bash
nvm use                       # Node 22.22.3 / npm 10.9.8 (engine-strict)
npm ci
npm run dev                   # http://localhost:5173/the-fish-tank/
npm run verify                # every gate; must be green before any push
```

Sandbox note: the Playwright browser CDN is blocked here. Install Chromium from npm instead
of the CDN:

```bash
npm i --prefix /tmp/cp @sparticuz/chromium@153.0.0
# decompress bin/{al2023,swiftshader,fonts}.tar.br with brotli, extract to /tmp/chromium-libs
LD_LIBRARY_PATH=/tmp/chromium-libs/lib:/tmp/chromium-libs \
CHROMIUM_EXECUTABLE_PATH=/tmp/chromium npx playwright test
```

This is the same override the earlier sessions documented; results from it are
software-renderer observations, never a physical-device performance claim.

Session discipline, in the order the rules require it:

1. Read the working rules, GUI rules, chunking mechanism, audit, log, changelog, roadmap,
   this study, and the work order for the session.
2. `git status`, `git branch -a`, `git log -5 --oneline`; work only on the Arena session
   branch.
3. Write the atomic checklist in `_working_docs/thinking/` with a `DELETE AFTER:` line.
4. Recheck every external source and its licence before reuse; record revision, paths,
   licence, edits and integration location.
5. Implement; tick a checklist line only when a command proved it.
6. For every new check: break it, watch it fail for the right reason, restore it.
7. Run `npm run verify`, inspect the diff, scan for secrets.
8. Update audit, implementation log, changelog, roadmap — and README if a player can see it.
9. Compare the checklist to the request line by line; record anything unfinished as a
   tracked gap; delete the checklist only after the verified push.

## 8. The immediate next move

**Owner decision on GAP-002 is required before S05 can start.** Two questions decide it:

1. Does ink cost scale with **drawn length only** (the original idea, and what DEC-010
   defaults to), or with **length × tool width + a per-stroke charge** (TECH_SPEC §8.1)?
2. Are **colours free** or do they cost ink? (GAME_IDEA §18 open question 7.)

Everything else in S05 is already specified: one centralized formula, one evaluator shared by
the live estimate and the final simplified strokes, reservation/commit/cancel wallet rules,
free undo/clear with exact refunds, a minimum-complexity rejection that never charges, and
boundary/property tests proving the wallet can never go negative.

Once answered, S05 proceeds on this branch with no other blockers. Phase 1's 60 fps
recorded-target gate (GAP-005) still needs a real device report before phase 1 can be called
accepted, and that can run in parallel with S05's data work.
