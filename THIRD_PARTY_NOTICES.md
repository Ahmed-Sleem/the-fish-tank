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

Sources: each package's `repository` field in its installed npm manifest; authoritative license text ships with that package. PixiJS https://github.com/pixijs/pixijs; Paper.js https://github.com/paperjs/paper.js; Dexie https://github.com/dexie/Dexie.js; Zod https://github.com/colinhacks/zod; Vite/Vitest https://github.com/vitejs/vite and https://github.com/vitest-dev/vitest. Paper.js, Dexie, Zod and simplex-noise are pinned foundation dependencies; they are not yet wired as gameplay features. Subsequent source adaptations are recorded below and in the reuse ledger. No borrowed art, fonts or audio are shipped.

The minimatch override pins 11.0.5 (ISC), a lint-time transitive dependency, to address GHSA-g3hv-75wg-m249; all checks were rerun after upgrading. Package license files and required notices remain in installed distributions. Before distributing additional adapted code/media, preserve the relevant copyright/license text next to those files and update this notice.

Official GitHub Actions Pages starter/Vite guidance was studied, not pasted wholesale; workflow actions are pinned with upstream version comments. Local-only `@sparticuz/chromium@153.0.0` (MIT wrapper; bundled Chromium has its own upstream notices) was installed outside this repository for real-browser verification because the normal CDN was blocked. It is neither a product dependency nor distributed by this site.

## Future code/asset adoption

Before each adoption, record source URL, immutable commit/release, exact functions/assets, license text, required attribution, adaptations and compatibility/security checks. The upstream projects listed in TECH_SPEC.md are research leads, not verified license claims. Reference-only studies must be labelled as such. Never ship temporary creature art as final creatures.

## Research snapshots (not app runtime)

`docs/design-references/paper-water.ts.txt` is unmodified source from paper-design/shaders commit `3f29ea8391addaea459b22caf5e1e8ccabfbd4ee`, Apache-2.0. Its license and NOTICE are adjacent. See the [reuse ledger](docs/design-references/README.md) for provenance, limitations and future adaptation gates. The initial CSS splash was original project code; it has now been replaced by the Oimo adaptation described below.

## mitt adaptation — S02

`src/core/events.ts` adapts the Map/subscription/snapshot-dispatch pattern from developit/mitt, `src/index.ts`, commit `6b41670516ed8e8b738612f60491995470aa63b3`. MIT, Copyright (c) 2021 Jason Miller. Full license: `docs/design-references/mitt-LICENSE.txt`; exact research snapshot: `mitt-index.ts.txt`. Modified to use sets, typed lifecycle events, returned idempotent unsubscribe closures and explicit cleanup; wildcard API omitted. This code is included in the application. No additional npm dependency was installed.

## Oimo Water — shipped loader adaptation

Copyright (c) 2023 saharan, MIT. Source: https://github.com/saharan/works at `f34a4951a95ba178bfc9964d08dc898795ea4736`, `water/src/Main.hx` and `WaterShader.hx`. Pinned source/license snapshots are in `docs/design-references/oimo/`. Runtime port: `src/render/water/oimo-fluid.ts` and `oimo-view.ts`. Modified to TypeScript/GLSL ES 3 with compact APIC stencil loops, bounded particle count, seeded jitter, hover/touch input, dark-blue theme uniforms, reduced-motion, resize and disposal. No WASM/accelerometer/Pot/Muun/hgsl dependencies, upstream menu or telemetry shipped. This is an adapted solver and shader, not the untouched full demo.

Complete distribution license texts are included under `public/licenses/{oimo,mitt}.txt` and copied by Vite into the released site. The [reuse ledger](docs/REUSE_LEDGER.md) records all direct dependencies, adaptations, modifications and paths.

## MainLoop.js — S03 loop pattern adaptation

Copyright (c) 2016 Isaac Sukin. MIT. `src/core/loop.ts` adapts accumulator/catch-up/interpolation patterns from IceCreamYou/MainLoop.js commit `3ddadf0ab902da96af7077be40206ac27ba1b1d3`. Full upstream license: `public/licenses/mainloop.txt`; pinned source/license: `docs/design-references/mainloop{.js,-LICENSE}.txt`. Changed to a bounded 30Hz TypeScript simulation helper; no upstream scheduler/global API or runtime package shipped.

## S04 research-only snapshots

`docs/design-references/threejs-water/`: MIT, original Copyright (c) 2011 Evan Wallace; modified Copyright (c) 2026 Yong Su. `docs/design-references/screenjoy/`: MIT, Copyright 2026 Steven Partridge, npm @screenjoy/fishtank 0.1.0. Complete original licenses are included alongside snapshots. These are preparation references, not app runtime code or adopted fish/reef assets. Adaptation/distribution attribution must be added when integrated. Fish Tank Plus is a visual/product reference only; no source license established.
