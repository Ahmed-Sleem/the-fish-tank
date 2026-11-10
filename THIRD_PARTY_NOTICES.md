# Third-party notices

## S01 dependency adoption (2026-11-08)

Registry metadata and installed package manifests/licenses were inspected; exact direct versions are in package.json and the integrity-locked dependency tree in package-lock.json. `npm audit` reports zero vulnerabilities after the documented minimatch override. Compatibility is exercised by strict source checks, unit/browser tests and production build; this is not a guarantee about future feature behavior.

| Package           | Version | License    |
| ----------------- | ------- | ---------- |
| dexie             | 4.4.7   | Apache-2.0 |
| paper             | 0.17.0  | MIT        |
| pixi.js           | 8.22.0  | MIT        |
| simplex-noise     | 4.0.3   | MIT        |
| zod               | 4.6.7   | MIT        |
| @eslint/js        | 10.0.1  | MIT        |
| @playwright/test  | 1.65.0  | Apache-2.0 |
| @types/node       | 22.20.5 | MIT        |
| eslint            | 10.14.0 | MIT        |
| prettier          | 3.9.10  | MIT        |
| typescript        | 6.0.3   | Apache-2.0 |
| typescript-eslint | 8.72.2  | MIT        |
| vite              | 8.3.7   | MIT        |
| vitest            | 5.1.0   | MIT        |

Sources: each package's `repository` field in its installed npm manifest; authoritative license text ships with that package. PixiJS https://github.com/pixijs/pixijs; Paper.js https://github.com/paperjs/paper.js; Dexie https://github.com/dexie/Dexie.js; Zod https://github.com/colinhacks/zod; Vite/Vitest https://github.com/vitejs/vite and https://github.com/vitest-dev/vitest. Paper.js, Dexie, Zod and simplex-noise are pinned foundation dependencies; they are not yet wired as gameplay features. No source has been copied from any shader/aquarium/plant repository named in the spec. No borrowed art, fonts or audio are shipped.

The minimatch override pins 11.0.5 (ISC), a lint-time transitive dependency, to address GHSA-g3hv-75wg-m249; all checks were rerun after upgrading. Package license files and required notices remain in installed distributions. Before distributing additional adapted code/media, preserve the relevant copyright/license text next to those files and update this notice.

Official GitHub Actions Pages starter/Vite guidance was studied, not pasted wholesale; workflow actions are pinned with upstream version comments. Local-only `@sparticuz/chromium@153.0.0` (MIT wrapper; bundled Chromium has its own upstream notices) was installed outside this repository for real-browser verification because the normal CDN was blocked. It is neither a product dependency nor distributed by this site.

## Future code/asset adoption

Before each adoption, record source URL, immutable commit/release, exact functions/assets, license text, required attribution, adaptations and compatibility/security checks. The upstream projects listed in TECH_SPEC.md are research leads, not verified license claims. Reference-only studies must be labelled as such. Never ship temporary creature art as final creatures.

## Research snapshots (not app runtime)

`docs/design-references/paper-water.ts.txt` is unmodified source from paper-design/shaders commit `3f29ea8391addaea459b22caf5e1e8ccabfbd4ee`, Apache-2.0. Its license and NOTICE are adjacent. See the [reuse ledger](docs/design-references/README.md) for provenance, limitations and future adaptation gates. The splash loader itself is original project code; no external effect library was added.
