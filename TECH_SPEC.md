# TECH_SPEC.md: Technical Specification (Human x AI Evolution Tank)

> **Companion to `GAME_IDEA.md`.** That file says WHAT the game is and why. This file says HOW to build it. Read `GAME_IDEA.md` Part 1 (the owner's verbatim idea) first; it overrides everything if there is a conflict.
>
> **Instructions to the implementing AI agent**
> 1. Do not make decisions that are already made here. Section 1 lists locked decisions. Do not substitute other technologies, patterns, or scope.
> 2. If something is unspecified, choose the simplest option that fits the philosophy in `GAME_IDEA.md` Section 2, write it into `DECISIONS.md` (date, question, choice, reason), and continue. Do not stop to ask unless a locked decision is impossible to implement.
> 3. Borrow code wherever Section 20 says so. Before copying anything, open the repository, read its LICENSE, verify the claims made here (this file was written from a secondary research summary and may contain errors), and record attribution in `THIRD_PARTY_NOTICES.md`.
> 4. Build in the order of Section 22. Each phase must meet its acceptance criteria before starting the next.
> 5. Never put AI calls in the per-frame loop. Never block gameplay on an AI call.
> 6. Do not add features that are not in this file or in `GAME_IDEA.md`.

---

## 1. Locked Decisions (made by the owner)

| # | Topic | Decision |
|---|-------|----------|
| D1 | AI access | **Player brings their own API key.** Pluggable providers (Gemini default, plus OpenAI, Anthropic, OpenRouter). Player picks the model(s). Game calls the provider **directly from the browser**. No game server in the AI path. |
| D2 | Fish visuals | **AI-generated images + a "Trait Card" (structured text data) per fish + a free fallback mode** that works without an image-capable key. |
| D3 | Storage | **Everything stored locally in the browser** (IndexedDB). Export/import. **Opt-in** background data sync to a collection server (for future model training) with explicit, versioned consent. |
| D4 | Tech stack | **TypeScript + Vite + PixiJS v8 + Paper.js**, custom simulation in TypeScript. Web only (desktop + mobile browsers). |
| D5 | Away time | **Slow, capped catch-up. Fish cannot die while the player is away.** |
| D6 | Cost to owner | Free to play. The owner pays for no AI calls. |

### 1.1 Defaults chosen by the planner (owner may override; log changes in DECISIONS.md)

| # | Topic | Default |
|---|-------|---------|
| P1 | Accounts/login | **None in v1.** Anonymous local install with a random `installId`. |
| P2 | Plants | Rendered as **procedural L-system vector plants** whose parameters are evolved by the text AI (works free). Optional AI image forms are a later phase (Section 22, Phase 10). |
| P3 | First fish image | The player's own drawing is the Stage 0 image. **No AI image is generated at birth** (text-only analysis call, so birth is free). |
| P4 | Orientation | All creature images are **side view facing right**. If an image comes back facing left, code flips it. |
| P5 | Language/UI | English, i18n-ready (all strings in one dictionary file). |
| P6 | Sound | Ambient audio + SFX in a later phase, toggleable, default volume low. |
| P7 | Colors while drawing | Free to choose. Only stroke length, width and count cost money. |

---

## 2. Glossary

- **Trait Card:** a structured JSON record (the "genome" in earlier discussion) describing a creature in data: its personality, behavior numbers, visual description (words, colors, features), growth tendencies, mating preferences. It is NOT the image. It exists so the AI stays consistent across many calls (images alone are forgotten), so behavior is driven by numbers, and so mating can mix parents sensibly. It works on free text models.
- **Form:** one visual snapshot of a creature at a stage (image + metadata). A creature's history is its list of Forms.
- **Stage / Era:** a named growth level (Section 9).
- **Growth Points (GP):** progress toward the next stage.
- **Tank Context:** compact summary of the whole tank given to every AI call (Section 7).
- **Image mode / Fallback mode:** with / without an image-capable AI key.

---

## 3. Architecture Overview

```
+-------------------------------------------------------------+
|                         BROWSER APP                         |
|                                                             |
|  UI layer (HTML/CSS overlay): cards, shop, drawing HUD,     |
|  settings, onboarding, consent                              |
|                         |                                   |
|  Game core  <--events-->  Renderer (PixiJS v8)              |
|   - Simulation (fixed 30 Hz tick)  - layers, shaders, mesh  |
|   - Behavior engine, water, scent  - interaction (cursor)   |
|   - Ecology, economy, growth                                |
|                         |                                   |
|  AI Orchestrator  ---->  Provider adapters (Gemini/OpenAI/  |
|   - job queue, rate limits           Anthropic/OpenRouter)  |
|   - prompts, schema validation       -> direct HTTPS calls  |
|   - image pipeline (cutout/validate)                        |
|                         |                                   |
|  Storage (IndexedDB via Dexie)   Sync module (opt-in)       |
+-------------------------------------------------------------+
                                      |
                         (later, optional, owner-run)
                       Collector endpoint (Section 17)
```

Rules:
- **Simulation is separate from rendering.** Simulation runs at a fixed timestep (30 Hz) with an accumulator; rendering interpolates at display rate. (Pattern borrowed from SimFish, see Section 20.)
- **The game core never talks to AI providers directly.** Only through the AI Orchestrator, which exposes typed jobs and returns validated results or a fallback.
- **The game must be fully playable with zero AI** (fallback mode, Section 12). AI enriches; it is not required to run.

---

## 4. Project Setup

- Language: TypeScript (strict mode). Bundler: Vite. Package manager: pnpm (or npm).
- Core libs: `pixi.js` (v8), `paper` (Paper.js), `dexie` (IndexedDB), `zod` (schema validation), `simplex-noise`, `comlink` (optional, if moving sim to a Web Worker), `pixi-filters` (ready-made effects; verify availability and compatibility with PixiJS v8 before use).
- Test: Vitest (unit + simulation harness), Playwright (smoke/e2e).
- Lint/format: ESLint + Prettier. CI: build + tests.
- Pin exact dependency versions after checking the latest stable releases at project start. Record in DECISIONS.md.

Suggested folder structure:
```
/src
  /core          # game loop, time, events, config
  /sim           # behavior, water, scent, ecology, growth, mating
  /render        # pixi scenes, layers, shaders, mesh deformation
  /draw          # drawing canvas (paper.js), ink cost
  /ai            # orchestrator, providers, prompts, schemas, image pipeline
  /store         # dexie schema, save/load, export/import, migrations
  /sync          # consent, queue, uploader
  /ui            # cards, shop, hud, onboarding, settings
  /config        # balance.config.ts, ai.config.ts, strings.en.ts
  /fallback      # procedural growth/mating for no-image mode
  /test
/docs  DECISIONS.md  THIRD_PARTY_NOTICES.md
```

All numbers that affect balance live in `/config/balance.config.ts` (Section 15). No magic numbers elsewhere.

---

## 5. Data Models

Define these with Zod schemas, derive TypeScript types from them, and use the same schemas to validate AI output and imported saves.

```ts
type ID = string; // uuid

interface TankSave {
  schemaVersion: number;
  installId: ID;
  tankSeed: number;           // unique per tank
  createdAt: number;
  lastActiveAt: number;
  money: number;
  clock: { simTime: number };  // seconds of simulated life
  fish: Fish[];
  plants: Plant[];
  items: Item[];               // food in water, decorations, etc.
  ledger: RewardRecord[];      // idempotent rewards (Section 15.4)
  tankStats: TankStats;
  events: GameEvent[];         // capped, oldest summarized
}

interface Fish {
  id: ID; name: string;
  createdAt: number; origin: 'drawn' | 'offspring';
  parentIds: [ID, ID] | null; generation: number; childIds: ID[];
  sex: 'a' | 'b' | 'both';     // see Section 11.1
  traitCard: TraitCard;
  forms: Form[];               // full visual history; last = current
  stage: number; growthPoints: number; ageSeconds: number;
  needs: { hunger: number; energy: number; health: number; stress: number; happiness: number };
  state: 'alive' | 'dead';
  deathInfo?: { at: number; cause: string };
  pos: Vec2; vel: Vec2; heading: number;   // runtime, saved for continuity
  favorite: boolean;
  log: GameEvent[];            // this fish's life story
}

interface Form {
  id: ID; stage: number; createdAt: number;
  source: 'human-drawing' | 'ai-image' | 'fallback-procedural';
  imageBlobKey: string;        // key in IndexedDB blob store (WebP, transparent bg, max side 512)
  originalPromptSummary?: string; // short text of what was asked
  aiNotes?: string;            // what the AI says changed
  paletteHex: string[];        // 5 dominant colors
  aspect: number;              // width/height
  strokes?: StrokeData[];      // only for the human drawing form
}

interface TraitCard {          // Section 6 has full field list
  version: 1;
  visual: VisualTraits; personality: Personality; behavior: BehaviorParams;
  ecology: EcologyParams; growth: GrowthProfile; mating: MatingTraits;
  story: string;
}

interface Plant {
  id: ID; name: string; createdAt: number; parentIds?: ID[];
  traitCard: PlantTraitCard;   // L-system params + ecology
  forms: PlantForm[];          // history of parameter sets (+ optional image forms later)
  anchor: Vec2;                // position on substrate
  size: number; health: number; log: GameEvent[];
}
```

Binary images are stored separately as Blobs in IndexedDB, referenced by key (never base64 inside the main JSON).

---

## 6. Trait Card Specification

The AI fills this JSON. Code validates with Zod, **clamps every number into its range**, and fills defaults for anything missing. Never trust raw AI output.

### 6.1 Personality (human-readable, maps to numbers)
```
personality: {
  summary: string (<= 280 chars),
  traits: { boldness, curiosity, sociability, aggression, laziness, greed, playfulness, affection } // each 0..1
}
```
Rule: the numbers in `traits` are used by the behavior engine (Section 10). The summary is flavor text for the card. The AI must keep the summary consistent with the numbers.

### 6.2 Behavior parameters (all ranges are enforced)

| Group | Parameter | Range | Meaning |
|-------|-----------|-------|---------|
| Movement | `baseSpeed` | 0.2 to 3.0 (body-lengths/s) | cruising speed |
| | `maxSpeed` | baseSpeed to 6.0 | burst speed |
| | `acceleration` | 0.5 to 8 | |
| | `turnRate` | 0.5 to 8 (rad/s) | agility |
| | `swimPattern` | enum: `glide, zigzag, sine, dart, circle, hover, drift, erratic, figure8, patrol` | main pattern |
| | `patternAmplitude` | 0 to 1 | |
| | `patternFrequency` | 0.05 to 3 Hz | |
| | `patternRandomness` | 0 to 1 | |
| | `depthPreference` | 0 (surface) to 1 (bottom) | |
| | `depthTolerance` | 0.05 to 0.6 | how far it strays |
| | `restFrequency` | 0 to 1 | how often it pauses |
| | `jumpChance` | 0 to 1 (per minute scale in config) | breaching/leaping near surface |
| | `dashChance` | 0 to 1 | sudden bursts |
| | `wallAffinity` | -1 to 1 | avoids (-) or hugs (+) edges |
| Animation | `tailBeatRate` | 0.3 to 4 Hz | |
| | `bodyWaveAmplitude` | 0 to 1 | how much the body bends (Section 10.4) |
| | `bodyWaveLength` | 0.5 to 2.5 | wave length relative to body |
| | `wobble` | 0 to 1 | |
| Social | `schooling` | 0 to 1 | |
| | `territoriality` | 0 to 1 | |
| | `aggression` | 0 to 1 | |
| | `predator` | boolean | hunts other fish |
| | `preySizeRatio` | 0.1 to 0.8 | will attack fish this fraction of own size or smaller |
| | `huntStyle` | enum: `ambush, chase, stalk` | |
| | `fearOfCursor` | 0 to 1 | |
| | `curiosityAboutCursor` | 0 to 1 | |
| | `petTolerance` | 0 to 1 | likes being petted |
| Needs | `metabolism` | 0.5 to 2.0 | scales hunger decay |
| | `appetite` | 0.5 to 2.0 | |
| | `smellSensitivity` | 0 to 1 | scent detection range |
| | `visionRange` | 0.5 to 6 (body-lengths) | |
| | `sleepCycle` | 0 to 1 | rests more at "night" |
| | `stressTolerance` | 0 to 1 | |
| | `waterTolerance` | 0 to 1 | resilience to poor water |

### 6.3 Visual traits (words, used as the memory for image prompts and mating)
```
visual: {
  bodyShape: string, silhouetteNotes: string,
  dominantColors: string[] (names + hex, max 5),
  patterns: string[], fins: string[], eyes: string, texture: string,
  distinctiveFeatures: string[] (max 5)  // the identity anchors that must survive growth
  artStyleNotes: string                   // how the original drawing looks (line quality, medium)
  facing: 'right' | 'left'                // detected orientation of the source image
}
```
`distinctiveFeatures` + `artStyleNotes` are what keep growth and mating consistent.

### 6.4 Growth profile
```
growth: {
  growthRate: 0.5..2.0,          // GP multiplier
  maxScaleMultiplier: 1..6,      // visual size growth vs. stage 0
  morphTendency: string[],       // e.g. "fins lengthen", "colors deepen"
  lifespanKind: 'unlimited' | 'long' | 'medium',  // 'unlimited' by default
  stageNamingStyle: string       // flavor for era names
}
```

### 6.5 Ecology and mating
```
ecology: { diet: ('pellet'|'algae'|'plant'|'smallfish'|'any')[], dietPreference: string,
           preferredZones: ('open'|'plants'|'rocks'|'corners')[], size: number /*stage-0 body length in px*/ }
mating: { matureAtStage: 1..3, drive: 0..1, selectivity: 0..1,
          preferredTraits: string[], courtshipStyle: enum('circle','dance','chase','display','nuzzle'),
          clutchSize: {min:1, max:4}, cooldownMinutes: 10..120 }
```

---

## 7. Tank Context (given to every AI call)

A compact JSON, rebuilt before each call, **max about 1500 tokens**. Never send raw history.

```
tankContext: {
  palette: { dominant: hex[5], accent: hex[3] },        // computed from all current sprites + background
  styleSummary: string,                                  // maintained text: overall look of the tank
  population: { fish: n, plants: n, bySpeciesCluster: [{label, count, avgSize}] },
  silhouettes: [{label, aspect, size, colors:[hex x2]}], // max 12 most distinct existing creatures
  space: { crowdingIndex: 0..1, emptyRegions: [{zone:'top|mid|bottom|left|right', size}] },
  water: { quality: 0..1, oxygen: 0..1, temperature: n, light: 0..1, algae: 0..1 },
  ecology: { predators: n, foodAvailability: 0..1, plantCoverage: 0..1 },
  recentEvents: string[] (max 8),
  generation: { maxGen: n, births: n, deaths: n }
}
```
`clusterLabel` for similar creatures: computed locally by comparing palette + aspect (no AI).

**Rule included in every prompt:** "Add to the beauty and balance of this tank. Avoid duplicating an existing creature. Choose colors and shapes that complement, contrast, or harmonize with the tank palette. Stay free and creative. Do not make anything realistic unless the source already is."

---

## 8. Drawing System

- Library: **Paper.js** on a dedicated full-screen canvas overlay.
- Input: pointer events (mouse, touch, pen). Smooth strokes with `path.simplify()` and `path.smooth()` on stroke end; show live (unsimplified) stroke while drawing.
- Background of the drawing canvas: pure white `#FFFFFF` (so the final image already has a clean cutout background, see Section 12.2).
- A hint overlay says: "Draw your fish facing right." (Soft rule. Orientation is detected anyway.)
- Tools: pen, 3 widths, color picker, undo, clear, done.
- Canvas must show: wallet, current ink cost, remaining money. The pen stops adding ink when remaining money is 0.

### 8.1 Cost formula (normalized so screen size does not matter)
```
L = totalStrokeLength / min(canvasWidth, canvasHeight)    // a full-width line = 1.0
widthMultiplier: thin 1.0, medium 1.5, thick 2.2           // applied per stroke to its length
Leff = sum(strokeLength_i * widthMultiplier_i) / min(canvasW, canvasH)
cost = base + rateLength * Leff + rateStroke * strokeCount
if Leff > softCap: cost += rateOver * (Leff - softCap)^1.5   // gently penalizes huge drawings
```
Defaults (in balance.config): `base=4, rateLength=1.5, rateStroke=0.5, softCap=8, rateOver=1.0`. A typical fish (Leff about 6 to 10) costs roughly 15 to 25 coins.
- Undo/clear refund the exact ink spent on removed strokes.
- Minimum drawing: Leff >= 0.6, else "Draw a little more" (button disabled). The player is never charged for rejected drawings.
- Cost is computed after simplification so jittery hands are not punished.

### 8.2 Output of the drawing step
- `StrokeData[]` (vector: points, color, width).
- PNG snapshot on white background (2048px max side), then processed through the **same cutout pipeline** as AI images (Section 12.2) to produce the transparent Stage 0 sprite.
- Then the **Birth analysis job** (Section 12.5) runs. While it runs, the fish appears as a "forming" shimmer in the tank using the drawing; it starts swimming with **default procedural parameters** immediately and gets its real Trait Card when the job returns.

---

## 9. Growth and Stages

### 9.1 Stages and thresholds (defaults in balance.config)

| Stage | Name | GP to reach | Reward (coins) | Scale vs. stage 0 |
|------|------|-------------|----------------|-------------------|
| 0 | Hatchling (the drawing) | 0 | none | 1.00 |
| 1 | Juvenile | 60 | 15 | 1.25 |
| 2 | Young | 180 | 20 | 1.55 |
| 3 | Adult | 420 | 28 | 1.9 |
| 4 | Elder | 900 | 38 | 2.3 |
| n >= 5 | AI-named "Era n" | `900 * 2.0^(n-4)` | `round(38 * 1.2^(n-4))` capped at 150 | continues, asymptotically toward `maxScaleMultiplier` |

Growth never stops: stage 5+ is unlimited. Large fish become slower and hungrier (config curves) to keep the tank playable.

### 9.2 Continuous growth between stages
- Current visual scale interpolates smoothly between the stage scales as GP rises (so growth is visible all the time).
- At stage transition:
  1. Play the growth moment (sparkle/cocoon animation, 2 to 3 s). Money reward is granted via the idempotent ledger.
  2. Queue the **Growth image job** (Section 12.3). The fish keeps swimming with its old form meanwhile.
  3. When the new image is ready and validated, **cross-fade + gentle morph** from the old form to the new form over about 4 s (Section 12.4), then store the new Form in history.
- If the job fails after retries, **fallback growth** is applied (Section 13) so the stage still advances. The fish is never stuck.

### 9.3 Death
Causes: starvation (hunger 0 for longer than `starveGraceSeconds`), poor water, disease (stress + poor water), predation, harmful player actions, optional old age if `lifespanKind != unlimited`. Dead fish keep a memorial card (full history). Corpse floats/sinks, decays, and reduces water quality unless removed.

---

## 10. Behavior Engine (deterministic simulation)

Fish decisions use a **finite state machine + steering forces**, parameterized by the Trait Card. No AI calls during simulation.

### 10.1 States
`wander, seekFood, eat, flee, hunt, court, mate, rest, investigateCursor, schoolWith, hide`
Transitions are driven by needs (hunger, energy, stress), senses (scent, vision), personality traits, and events. Priority: flee > eat/seekFood (if hungry) > hunt (if predator and hungry) > court/mate > investigate > school > wander > rest.

### 10.2 Steering
Use classic steering behaviors: seek, flee, arrive, wander (noise-based), separation, alignment, cohesion (schooling), obstacle/wall avoidance. Fixed 30 Hz. Use a **spatial hash grid** for neighbor queries.
- **Swim pattern** (`swimPattern`) is a modifier layered onto the wander/transit motion: e.g. `sine` adds a sinusoidal lateral offset (amplitude/frequency), `zigzag` alternates heading changes, `dart` alternates hover and bursts, `circle`/`figure8` follow parametric loops around a drifting anchor, `patrol` follows waypoints, `hover` holds position with micro-motions.
- **Jumps:** if `jumpChance` roll succeeds near the surface, launch with ballistic arc, splash particles, ripple at the surface.
- Speeds are expressed in **body-lengths per second** so big and small fish look right.

### 10.3 Cursor interaction behaviors
- `fearOfCursor` high: flee when the cursor moves fast nearby. `curiosityAboutCursor` high: approach slow-moving cursor and nibble.
- Petting: a slow cursor passing over a fish repeatedly counts as petting. Reaction depends on `petTolerance` and `affection`: enjoy (happiness up, follows cursor), tolerate, or flee (stress up).

### 10.4 Swimming animation (mesh deformation)
- Each fish sprite is rendered with a **PixiJS MeshPlane** (subdivided grid, e.g. 12x4). Per frame, vertex Y offsets follow a traveling wave along the body's long axis (x, since images face right):
  `y_offset(x_norm, t) = A * envelope(x_norm) * sin(2*pi*(x_norm/wavelength - freq*t))`
  with `envelope` increasing toward the tail (0 at head, 1 at tail) and `A`, `wavelength`, `freq` from `bodyWaveAmplitude`, `bodyWaveLength`, `tailBeatRate`, scaled by current speed.
- Add banking (slight rotation on turns), squash/stretch on bursts, and flip (mirror X) when heading left (animate the turn with a quick X-scale squeeze rather than an instant flip).
- **Borrow:** the traveling-wave swimming and shared-current coupling from `jamisonhill/aquarium` (Section 20); adapt it from its procedural fish bodies to a textured MeshPlane.

### 10.5 Needs
```
hunger decays: hungerDecay = baseDecay * metabolism * sizeFactor(stage)   // 100 -> 0
health: decreases if hunger < 15 or water quality low or stress high; recovers otherwise
stress: rises with crowding, poor water, harmful actions, predators near; falls with rest, plants/shelter
happiness: composite for UI
```

---

## 11. Mating and Offspring

### 11.1 Reproduction model
Each fish has `sex: 'a' | 'b'` assigned randomly (50/50) at birth for drawn fish (the AI may override to 'both' for hermaphroditic creatures). Two fish can mate if: sexes are compatible (a+b, or either is 'both'), both stage >= `matureAtStage`, health > 60, hunger > 40, cooldown elapsed, and mutual attraction passes (`drive`, `selectivity`, and trait compatibility against each other's `preferredTraits`). Compatibility score is computed locally.

### 11.2 Courtship
Use the `courtshipStyle` of the more selective partner. Visible animation sequence (approach, display, circling), 6 to 12 s, with particles. Then the offspring job is queued; an egg/bubble cluster appears and hatches when the job completes (or when fallback offspring are produced).

### 11.3 Offspring job (AI, Section 12.6)
Offspring count = random within the lower of the parents' `clutchSize`, modified by tank health; capped by carrying capacity (Section 14). Offspring start at stage 0 with an image. They are **not** "hatchlings of the drawing": their stage 0 form is the AI offspring image.

### 11.4 Inheritance rules (applied to the Trait Card in code BEFORE the AI sees it)
Locally compute a **pre-mixed Trait Card suggestion**:
- Numeric behavior params: per-parameter random pick of parent A, parent B, or weighted blend (weights random 0.3 to 0.7), then add Gaussian mutation (sigma = `mutationRate`, default 0.06 of range), clamped.
- Visual traits: choose 1 to 2 `distinctiveFeatures` from each parent, mix palettes, choose fins/patterns from either.
- Give this pre-mix to the AI as the **required starting point**; the AI may refine it and add 1 novel mutation and a name/story, but must keep inherited features recognizable.
(Technique reference: crossover + mutation in `NeuralAquarium`, Section 20.)

### 11.5 Lineage
Store `parentIds`, `generation = max(parentGen)+1`, `childIds`. Preserve for each fish a `humanAncestry` list: ids of the human-drawn root fish and an estimated contribution percentage (halves each generation, recomputed through the tree). Show it on the card.

---

## 12. AI Orchestrator and Image Pipeline

### 12.1 Provider adapters
Common interface:
```ts
interface AIProvider {
  id: 'gemini'|'openai'|'anthropic'|'openrouter';
  listModels(key): Promise<ModelInfo[]>;               // used to populate pickers; flag image-capable ones
  generateJSON<T>(req: {model, system, user, images?: Blob[], schema: ZodSchema<T>, maxTokens}): Promise<T>;
  generateImage?(req: {model, prompt, referenceImages: Blob[], aspect: '1:1'}): Promise<Blob>;
}
```
- Two independent model slots in Settings: **Text/Vision model** (required for Trait Cards) and **Image model** (optional; enables image mode).
- Default provider: Gemini (text: a current Flash-class model, image: a current image-capable model). **Do not hardcode model IDs from this file**; call `listModels` at setup and pre-select by name pattern (e.g. contains "flash" for text, contains "image" for image), with the user able to change. Keep defaults in `ai.config.ts`.
- All calls go directly from the browser. For each provider the agent must verify browser/CORS support from the provider's current docs and implement required headers (for example Anthropic requires a specific "direct browser access" header for browser calls). If a provider cannot be called from a browser, drop it from the list and note it in DECISIONS.md. OpenRouter is the catch-all for other models.
- Structured output: use the provider's native JSON/schema mode when available, otherwise instruct "return only JSON", then parse with Zod. On parse failure: one automatic **repair retry** (send the error back), then fallback.

### 12.2 Keys and onboarding
- First launch: short onboarding explaining the game works with a free Gemini key. Steps: open Google AI Studio, create an API key, paste it. Link text only; no tracking.
- Key stored in IndexedDB (not localStorage), never included in exports, never sent to any server of ours, never included in sync uploads. A "Remove key" button wipes it.
- Disclose clearly: "Free-tier requests to Google may be used by Google to improve its products." (Providers' terms differ; show a one-line notice per provider.)
- **Image mode check:** after the player picks an image model, a "Test image generation" button makes one tiny call. If it returns a quota/billing error, show a friendly message: image evolution needs a billing-enabled key; the game continues in Fallback mode. Never crash.
- Show per-session counters (calls made, errors). Optional estimated cost display (approximate, user-visible, never billed by us).

### 12.3 Job queue
- One global queue with priorities: `birth > growth > offspring > plant > flavor-text`.
- Concurrency 1 for images, 2 for text. Token-bucket rate limiter configurable per provider (default conservative: 8 requests/min).
- Retries: exponential backoff with jitter on 429/5xx (max 3). On 429 free-tier daily exhaustion: pause queue, show a soft "AI is resting" indicator, continue in fallback mode, resume automatically later.
- Jobs are persisted (IndexedDB) so a reload does not lose them; each job has inputs summary, status, result.
- Idle limiter: a **daily AI budget** setting (calls/day, default 40) so a player does not drain their key unknowingly.

### 12.4 Image pipeline (all creature images)
**Generation constraints (always included in the image prompt):**
- Single subject, centered, **side view facing right**, complete (nothing cropped).
- **Pure flat white background (#FFFFFF), no shadow, no gradient, no ground, no water, no text, no border, no frame, no extra objects.**
- Square canvas, subject occupying about 70 to 80% of the canvas with white margin on all sides.
- Same art style, medium, line quality and palette family as the reference images.

**Post-processing (all code, deterministic):**
1. Decode to canvas. 2. **Background removal:** flood fill from all four borders marking near-white pixels (tolerance about 12/255 per channel), then soft-edge the mask (1 to 2 px feather), then **defringe** (pull edge color from interior to remove white halos). White pixels enclosed inside the creature are kept. 3. Validate mask: subject area between 8% and 85% of canvas, does not touch borders, one dominant connected component (drop tiny specks). 4. Crop to bounding box + 4 px padding. 5. Downscale so max side <= 512 px (and optionally generate 128 px thumbnail for the cards). 6. Encode WebP with alpha. 7. Compute 5-color palette (k-means or median cut) and aspect ratio.

**Validation of the creature image (reject and retry up to 2 times, then fallback):**
- Background check failed (not mostly white) or mask invalid.
- Orientation: if the Trait Card says facing right but a quick check (cheap vision call or local heuristic using the Trait Card's head description) says left, **flip horizontally in code** instead of retrying.
- **Continuity (growth only):** palette distance to previous form below a threshold (CIE Lab distance of matching dominant colors), aspect ratio change within +/-35% per stage. Optionally a vision judge call to the text model: "Same individual, grown up? score 0 to 1" with a minimum 0.6. Judge is optional and on by default only when the budget allows.
- **Uniqueness (offspring/new):** perceptual similarity (simple downscaled-image hash + palette) against existing fish must not be near-identical.

### 12.5 Birth job (text + vision only, FREE tier compatible)
**Input:** the drawing image (white background PNG), stroke summary (count, length), the Tank Context, the Trait Card schema, rules.
**Output:** a full Trait Card + name + story + `facing`.
**System prompt (template):**
```
You are the creative evolutionary engine of a living aquarium game. A human drew this creature.
Your job: give it life. Do NOT make it realistic or convert it into a real fish. Interpret what
it really looks like, however strange. Be free and imaginative. It is its own species.
Describe it faithfully in `visual` (shape, colors, features, how the lines look) because this
description will be used later to keep the creature consistent as it grows.
Choose personality and behavior numbers that visibly fit its shape and drawing energy (e.g. spiky
and scribbled = erratic/darty; round and calm = slow/gliding), but surprise the player sometimes.
The tank context is below. Make this creature fit the tank harmoniously (do not copy an existing
creature) without losing its individuality.
Return ONLY JSON matching the schema. Respect every numeric range.
```

### 12.6 Growth job
**Image mode:** one image call.
- Inputs: previous Form image (reference), original drawing image (identity anchor), Trait Card (visual + growth), Tank Context, stage number, simulated age text.
- **Prompt template:**
```
This is [name], a creature in a living aquarium. Reference image 1 is how it looks now (stage N-1).
Reference image 2 is its original hand-drawing (identity anchor).
Show the SAME individual after it has grown into stage N (about [age] older). Simulate natural growth:
keep the same art style, line quality, colors and distinctive features ([list]). Allow only gradual,
plausible changes: slightly larger/different proportions, richer or deeper colors, longer fins,
new small markings, signs of age or maturity. Do NOT redraw it in a different style, do NOT make
it realistic, do NOT change its species identity. Growth tendencies: [morphTendency].
The tank palette is [palette]; subtle harmony is welcome but identity comes first.
Output rules: [the generation constraints in 12.4].
```
- Then run the pipeline; on success, additionally ask the text model (cheap) for the updated `visual` description, `aiNotes` (what changed), and the new era name for stage >= 5. Merge into the Trait Card (visual fields only; never overwrite behavior numbers except through a small, clamped drift allowed by `growth`).
**Fallback mode:** Section 13.

### 12.7 Offspring job
**Image mode:** one image call per offspring (up to clutch size, sequential).
- Inputs: both parents' current Form images, the pre-mixed Trait Card (Section 11.4), Tank Context, sibling summaries (to avoid clones).
- Prompt: "These two creatures mated. Create their offspring as a juvenile of the same life stage as stage 0, in the same art style family. It must clearly inherit recognizable features from BOTH parents (list the chosen inherited features), with natural variation and one small novel feature. Same output rules. Do not make it realistic."
- Text call afterward (or combined, if provider supports text+image in one call): finalize Trait Card, name, story.
**Fallback:** Section 13.

### 12.8 Plant evolution job (text only)
Input: PlantTraitCard (L-system params, ecology), Tank Context (light, nutrients/waste, crowding, grazing), history. Output: new parameter set (small deltas + optional new feature like flowers/pods), an `aiNotes` string. Triggered every N minutes of sim time per plant (default 30), or when conditions change significantly (light/nutrient shift). Max change per evolution capped by config (growth simulation, not replacement).

### 12.9 Flavor text jobs
Names, card blurbs, event narration. Low priority; batch several into one call; skip when budget is low (use local templates).

### 12.10 Safety and robustness
- Strip or neutralize any text from AI output that is shown in the UI (escape HTML). Reject names/stories that violate a simple profanity/slur filter; regenerate or fall back to local names.
- Never execute AI output as code. AI returns data only.
- Cache and store every job result with a compact record (inputs summary, outputs) in the fish log and local job table. This is also what the optional sync uploads (Section 17).
- Use a deterministic mock provider (`MockProvider`) with fixture images/JSON for tests and for a "demo mode" without any key.

---

## 13. Free Fallback Mode (no image-capable key, or AI unavailable)

The game must feel good here, not like a broken mode. If there is a text key but no image key: Trait Cards still come from AI. If there is no key at all: use local procedural Trait Cards (derived from simple drawing analysis: aspect ratio, spikiness, color count, symmetry, length) and local name generator.

**Fallback growth (stage advance):** programmatic transformation of the previous Form image:
- Non-uniform scale (body lengthens/deepens by trait-based factors), slight hue/saturation shift toward the Trait Card's `dominantColors`, procedural overlays (soft markings, scale-like texture dots, fin outline accents) drawn from the Trait Card's `patterns` using simple vector shapes composited via an offscreen canvas, subtle age tone shifts at Elder stages.
- Result stored as a Form with `source: 'fallback-procedural'`.
**Fallback offspring:** take the more attractive parent's image as base; recolor partially using the other parent's palette (palette-swap by region/segment); scale proportions by blended traits; add a small procedural mutation marking. Trait Card pre-mix (Section 11.4) is used directly.
**Upgrade path:** when an image key becomes available, new stage advances use image mode; old forms remain in history.

---

## 14. Ecology and Tank Health

### 14.1 Water simulation (cheap)
- **Flow field:** 2D curl-noise vector field (low-res, e.g. 48x27), animated slowly. Cursor movement injects velocity into it with decay. Fish, plants, food and particles sample it. (Borrow the shared-current idea from `jamisonhill/aquarium`.)
- **Scent field:** grid (e.g. 64x36) of floats per food type. Each tick: add scent at food items, **advect** with the flow field, **diffuse** (simple neighbor averaging, coefficient in config), **decay**. Fish sample the local gradient (central differences over their smell radius) and steer along it when hungry and `smellSensitivity` is high enough for the local concentration. Vision overrides at close range (<= `visionRange`).
- Add small randomness so fish sometimes lose the trail and re-search (casting behavior: zigzag across the gradient).

### 14.2 Water quality model
```
waste += fishWaste (by size) + uneatenFoodRot + corpseDecay
waste -= plantAbsorption(plantHealth*size) + cleaningActions
algae grows with light * waste; algae is a weak food source and hurts oxygen/visibility when excessive
oxygen = base + plants*photosynthesis - fishRespiration - rot
quality = f(waste, oxygen, algae) in 0..1
```
Visuals: water tint and clarity reflect quality; particles/cloudiness when poor. Warnings appear before danger (e.g. HUD gently pulses, fish cards show "uncomfortable").

### 14.3 Carrying capacity and population control
`capacity = f(tankArea, plantCoverage, waterQuality, foodAvailability)`. Birth probability and offspring survival scale down as population nears capacity. Mating cooldowns per `mating.cooldownMinutes`. No hard cap, but extreme crowding causes stress, aggression, and deaths (self-balancing).

### 14.4 Player actions (consequences)
Helpful: feed, clean (removes waste/algae), medicine, shelter items, oxygen item. Harmful: overfeeding, tapping glass hard (stress), shaking, polluting, removing plants, dragging fish roughly. Each has config-defined effects. Everything stays reversible within reason; failure comes with warnings.

### 14.5 Food items
Types in v1: `pellet` (sinks medium, high nutrition), `flake` (floats then slowly sinks, low nutrition, spreads scent fast), `algae wafer` (sinks fast, herbivores). Physics: gravity vs. buoyancy, drag, flow-field drift, bounce at bottom, can be pushed by fish/cursor. Decays to waste if uneaten after `rotSeconds`.

---

## 15. Economy and Balance

### 15.1 Currency
Single currency, "coins" (name changeable in strings). Starting money: **100**.

### 15.2 Initial values (STARTING POINTS; tune with the simulation harness, Section 21)
```
startMoney: 100
drawCost: see Section 8.1
food:   pellet pack of 5 = 10 coins (2 each); flake pack of 8 = 8; algae wafer pack of 4 = 12
        pellet restores 20 hunger (~5 min for a baseline fish); gives 12 GP only if hunger < 80 (anti-spam)
plants: basic plant 20-25 coins; special seeds 35-60
tools:  water cleaner 15; medicine 20; oxygen item 30 (one-time)
stage rewards: Section 9.1 table
passive income: +0.4 coin/min per healthy fish (health>70, hunger>30), capped at +6 coin/min total
recovery grant: if money < drawCostMin AND no fish alive: grant a one-time-per-24h "small scribble" allowance enough for the cheapest valid drawing
rewards via ledger: each (fishId, stage) rewarded exactly once
```
### 15.3 Balance rules
- First fish affordable immediately. An attentive player earns more than they spend feeding.
- Breeding must not be an infinite money source: offspring give **no stage-0 reward**; stage rewards apply but total offspring per tank is limited by carrying capacity and cooldowns.
- Plants have functional value (shelter, oxygen, waste absorption, some food) so they are not just decoration.
- Natural food (algae, plants) reduces but never removes the need to buy food.
- Death should follow long neglect with clear warnings and a recovery opportunity.

### 15.4 Reward ledger
Append-only `RewardRecord {fishId, stage, amount, at}`. Rewards are paid only if no record exists for that key. Restoring saves, reloading, or stage re-evaluation can never re-pay.

---

## 16. Rendering and Visual Design

### 16.1 Layers (back to front)
1. Background gradient (depth, color-graded by time of day and quality)
2. Light rays/god rays (borrow, Section 20)
3. Far decorations / backdrop silhouettes (parallax slight)
4. Mid plants and rocks
5. Fish (MeshPlane sprites), eggs, corpses
6. Food, bubbles, particles (plankton, dust, bubbles, crumbs)
7. Foreground plants (parallax, slightly blurred)
8. Caustics + surface light overlay
9. Surface (ripples, waves line at top)
10. Glass/vignette overlay + light UI

### 16.2 Effects (borrow, do not write from scratch)
- **Caustics:** adapt the caustic technique from `ScottieFox/caustic-volume` into a PixiJS Filter (GLSL fragment shader) animated by time. Task for the agent: open the repo, find the caustic fragment shader, copy the core function, port to PixiJS v8 Filter format (uniform handling, `vTextureCoord`), expose intensity/scale/speed uniforms, blend additively over the fish/plant layers at low opacity.
- **Surface ripples & cursor water:** adapt the ripple approach from `HowdyKeith/swek-webgl2-water` (height-field simulation) and/or `AsimRauf/liquid-ripple` (lightweight pointer ripples). Task: implement a ping-pong render-texture height-field ripple simulation, feed it with cursor/food-drop/jump splash impulses, and apply it as a displacement filter over the tank (subtle refraction). Choose the lighter implementation; keep the budget at under 1.5 ms/frame on mid mobile.
- **God rays, bloom, depth tint:** use `pixi-filters` where available (verify v8 compatibility); else port equivalents.
- **Parallax / depth blur:** simple per-layer offset based on a slow camera drift or cursor position.
- Placeholder art while building (never in the final): Kenney Fish Pack and OpenGameArt aquatic props (CC0) can serve as temporary backgrounds/rocks/decor. Final fish are always player drawings or AI images.

### 16.3 Feel requirements
Easing on all UI; squash/stretch on fish bursts; secondary motion on fins/tails (lagged follow); bubbles from eating and jumping; soft sounds (later phase). Target **60 fps** on mid-range laptops and reasonable phones, with Quality settings (Low/Med/High) that toggle caustics resolution, ripple sim size, particle counts, and MSAA/filters.

---

## 17. Persistence, Export, and Opt-in Data Sync

### 17.1 IndexedDB (Dexie) tables
`meta` (installId, schemaVersion, settings, consent), `tank` (single TankSave JSON without blobs), `blobs` (key -> Blob for images/thumbnails), `jobs` (AI job history), `ledger`, `syncQueue`. Autosave every 15 s and on `visibilitychange`/`pagehide`. Use transactions. Handle `QuotaExceededError`: warn, offer export, compress/prune thumbnails of old forms (never delete the original drawing or current forms).
- Request persistent storage (`navigator.storage.persist()`).
- Schema migrations via Dexie versions. Never break old saves.

### 17.2 Export/Import
Export button produces a single `.json` + blobs archive (zip via `fflate`). API keys excluded. Import validates with Zod; offer "merge as new tank" or "replace".

### 17.3 Away-time catch-up (D5)
On load: `elapsed = now - lastActiveAt`. Simulate offline time in coarse steps with these rules:
- Cap at **8 hours** of credited time (config). Time runs at **10%** speed (config) for needs/growth.
- **No fish dies while away.** Health and hunger are floored (hunger min 5, health min 30). Fish may be "very hungry" on return with a gentle message.
- No offline mating births (courtship can complete but births happen on return). Plants may grow/evolve at the offline rate. No AI calls offline; queue them for return.
- Passive income accrues at the offline rate, capped.

### 17.4 Opt-in data sync (for future training)
**Consent screen (first run, after onboarding, and viewable in Settings):**
- Plain language: what is collected, why (to study and eventually train models on human-AI creature evolution), that it is optional, how to turn off, how to request deletion.
- Two buttons of equal prominence: "Yes, share anonymously" / "No thanks". Game fully works either way. Default is **off until the player confirms**.
- Versioned: store `{consentVersion, choice, at}`. If the policy changes materially, ask again.
**What may be uploaded (if consent = yes):** anonymized records: creature drawings (stroke data + images), AI-generated images, Trait Cards, form histories, lineage, Tank Context snapshots, job inputs/outputs summaries, aggregate gameplay events. Keyed by random `installId`.
**Never upload:** API keys, any provider credentials, IP-linked identifiers (server must not log IPs with data), personal info, free-text the player typed outside of creature names.
**Mechanics:** a background sync module batches records from `syncQueue` (max N KB per batch) and POSTs to a configurable `SYNC_ENDPOINT` (empty by default; if empty, sync is disabled and the consent screen says so or is hidden). Retries with backoff; offline-safe; uses `navigator.sendBeacon`/`fetch keepalive` on close. Respect "Pause sync" and "Delete my uploaded data" (sends a delete request for the installId).
**Server (owner builds later, not part of v1):** minimal ingest endpoint (suggested: serverless function + object storage). Write the API contract in `docs/SYNC_API.md` and include a mock server in `/test` for e2e tests.
**Legal notes for the owner (not engineering):** have the consent text and privacy policy reviewed for the jurisdictions you serve; check each AI provider's terms regarding outputs and data from free tiers before using the collected data for model training.

---

## 18. UI Specification

- **Tank is the hero.** UI is minimal, translucent, floating. A slim HUD: coins (top-left), tools (bottom: Draw, Food, Plants, Tools), AI status dot (top-right), settings.
- **Click** a fish/plant/object: select + small preview card (name, stage, hunger/health bars, mood). **Double-click** (or double-tap): open the **full card**.
- **Full fish card:** portrait (current form), name (editable), stage/age/size, bars (hunger, health, stress, happiness), personality text and trait chart, behavior params in friendly wording, **original drawing**, **timeline gallery of all forms** (with dates and AI notes), life log, **family tree** (parents, siblings, children, human ancestry %), actions (Feed, Favorite, Rename, Release). Dead fish: memorial view.
- **Plant/object cards:** same structure (origin, forms timeline, effects on the tank).
- Dragging a fish picks it up with a physical feel (dangling tail, ripples). Dropping back resumes swimming (with brief stress depending on personality).
- Draw mode: Section 8. Shop: simple floating panel with icons and prices.
- Accessibility: keyboard focus for UI, reduced-motion setting (lower effects), colorblind-safe bars, scalable UI.

---

## 19. Performance and Quality Budgets

- 60 fps target with 60 fish + 40 plants + 300 particles on a mid-range laptop; 30+ fps on mid phones with Quality=Low.
- Sim tick <= 4 ms at 60 fish. Move sim to a Web Worker only if profiling demands it.
- Textures: fish sprites max 512 px, packed into atlases when possible; free GPU textures of dead/hidden items; lazy-load history images in cards.
- Avoid per-frame allocations; use object pools for particles/food.
- Memory: warn if > 1.5 GB estimated; prune thumbnails first.

---

## 20. Code to Borrow (agent: verify licenses and details first)

> This list came from a secondary research summary. For each item: open the repo, confirm it exists and the license permits reuse, read the code, then adapt. Record everything in `THIRD_PARTY_NOTICES.md`. Do not paste whole repositories; copy only the specific functions/shaders named, and adapt them to this project's architecture.

| Repo / source | License (verify) | What to take | How to adapt |
|---|---|---|---|
| `jamisonhill/aquarium` | MIT | Traveling-wave swimming, shared water-current field coupling fish/plants/particles, schooling forces, species cards, efficiency approaches for many fish | Replace its procedural fish bodies with textured MeshPlane sprites from our images; reuse the wave math and the flow-field sampling; keep our own data model |
| `mhsenkow/SimFish` | MIT code (palettes CC0) | Architecture ideas: separating sim from render, genome/needs/aging structures, plants responding to nutrients, waste/leftover food entering the ecosystem, egg/hatch flow | It is Godot/GDScript: do NOT copy code verbatim; port the logic and structure to TypeScript in `/sim` |
| `Chrisbengt-joh/NeuralAquarium` | MIT | Crossover + mutation of inherited parameters, energy/aging/reproduction loop | Use for the parameter-level crossover in Section 11.4; ignore its neural networks |
| `ctkrug/murmur` | verify | Flocking (separation/alignment/cohesion), spatial grid for neighbor queries, mouse attraction/repulsion | Use as the base for schooling + spatial hash in `/sim`; adapt to our fish params |
| `rexcheng1997/aquarium-simulation` | verify | PixiJS pointer interaction and fish/flock integration patterns | Reference for hooking pointer events to Pixi containers |
| `msiric/procedural-plants` | MIT | L-system plant generator with adjustable branch/leaf parameters | Take the L-system expansion + turtle drawing; expose params as the PlantTraitCard; add sway (vertex displacement from the flow field, anchored at base) |
| `ScottieFox/caustic-volume` | MIT | Caustic lighting shader | Section 16.2 |
| `HowdyKeith/swek-webgl2-water` | MIT | Height-field water ripple simulation | Section 16.2 |
| `AsimRauf/liquid-ripple` | MIT | Lightweight pointer ripples | Section 16.2 (lighter alternative) |
| Paper.js (paperjs.org) | MIT | Drawing, path smoothing/simplification, length | Section 8; use its docs as the primary reference |
| PixiJS `MeshPlane` (v8 docs) | MIT | Mesh deformation for swimming/growth morph | Section 10.4 |
| `pixi-filters` | MIT | Bloom, godray, displacement and other ready filters | Section 16.2 if compatible with v8 |
| Kenney Fish Pack / OpenGameArt aquatic sets | CC0 | Temporary placeholder art only | Remove before release; never ship as final creature art |
| Reference games (study, do not copy): Drawquarium, NeuraQuarium, DrawAFish.live, The Sapling, Species, Swimbots/Gene Pool, Framsticks | n/a | UX and design ideas only | Note in DECISIONS.md what was learned |

**Positioning note (from research, verify):** Drawquarium emphasizes player-made art with no AI. This game's difference is "human seed, AI co-author of everything that follows." Keep that distinction clear in all UI copy.

---

## 21. Testing and Balance Tooling

1. **Unit tests:** ink cost formula, cutout pipeline (fixtures), Zod clamping of AI outputs, inheritance mixing, ledger idempotency, catch-up rules (no deaths), scent diffusion/advection stability.
2. **Simulation harness (CLI, headless):** fast-forwards the sim with a `MockProvider`. Runs 4 player archetypes (daily-casual, frequent feeder, heavy breeder, unattended) for simulated days. Reports: money curve, survival rate, time to milestones, population curve, water quality. **Fail the build** if: money runs away (> X) or hits a dead end, all fish starve within a normal session, population explodes beyond capacity, or any NaN appears.
3. **AI contract tests:** recorded fixtures for each provider adapter, plus a live smoke test script (manual, needs a key).
4. **Visual regression:** Playwright screenshots of key scenes (low motion).
5. **Soak test:** 30 minutes simulated at 60 fish without leaks (heap stable).

---

## 22. Build Phases and Acceptance Criteria

| Phase | Deliver | Accept when |
|---|---|---|
| 1. Foundation | Vite+TS+Pixi app, full-screen tank, layers, flow field, cursor ripples, quality settings | 60 fps empty tank, ripples react to cursor, borrowed shaders credited |
| 2. Drawing + economy | Paper.js drawing mode, ink cost, wallet, cutout of the drawing, Stage 0 sprite | Cost matches formula, undo refunds, drawing enters tank with birth animation |
| 3. Fish engine | MeshPlane swimming, behavior FSM + steering driven by default params, schooling, cursor reactions | Fish look alive (bend, bank, turn), params visibly change behavior |
| 4. Storage | Dexie persistence, autosave, export/import, catch-up (D5) | Reload restores everything; catch-up never kills fish |
| 5. Food & senses | Food physics, scent field, gradient seeking, hunger, eating, death, water quality, shop | Fish find food by scent (not teleport), neglect leads to warned decline |
| 6. Cards & history | Preview + full card, timeline, log, family tree UI | Double-click opens full card with all sections |
| 7. AI core | Provider adapters, key onboarding, queue, schemas, birth job, fallback trait cards | Real Trait Cards from AI; no key = playable fallback; failures never crash |
| 8. Growth | Stages, rewards ledger, growth jobs (image mode), validation, morph transitions, fallback growth | Stage-ups pay once, identity preserved, failures fall back |
| 9. Mating | Courtship, pre-mix, offspring jobs, lineage, capacity control | Offspring visibly inherit from both parents; tank does not explode |
| 10. Plants | L-system plants, sway, ecology effects, plant evolution job; optional AI image forms | Plants evolve with conditions and influence water/shelter |
| 11. Sync | Consent UI, sync queue, mock server, delete-my-data | Nothing uploads without consent; keys never included |
| 12. Balance & polish | Harness tuning, sound, onboarding polish, performance pass, mobile touch, accessibility | Section 19 budgets met; harness passes |

---

## 23. Agent Rules Recap (do not violate)

- AI is **free and creative**; never force realism; never convert the player's drawing into a "proper fish".
- Growth = **gradual evolution of the same individual**, never a redraw in a new style.
- Mating = **mix of both parents**, recognizable.
- Every AI call gets the **Tank Context**.
- AI never blocks play; **fallback always exists**.
- Keys stay local; no consent = no uploads.
- Everything tunable lives in config.
- Log decisions; credit borrowed code; verify licenses.

---

## 24. Open Items for the Owner (agent proceeds with the stated default)

1. Game title/branding (default: working title "Tank").
2. Visual style mood board (default: soft hand-drawn charm inside a polished luminous underwater scene).
3. Login/cloud sync later (default: none in v1).
4. Collector server hosting and legal review of consent text (owner, before enabling sync in production).
5. Final audio direction (default: placeholder ambient + SFX from CC0 sources).

*End of TECH_SPEC.md*
