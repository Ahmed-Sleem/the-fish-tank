# Game Idea: Human x AI Evolution Tank (working title)

> **Purpose of this file:** This is the master reference for the whole game. Part 1 is the original idea exactly as the creator wrote it (the source of truth). Part 2 is the organized, structured version. If anything in Part 2 ever conflicts with Part 1, Part 1 wins, and the conflict should be flagged to the creator.
>
> **For the AI agent reading this:** Do not skip anything. Every requirement below is intentional. Where something is unspecified, make a reasonable choice, write it down in `DECISIONS.md`, and keep going. Do not simplify the core philosophy (Section 2).

---

# PART 1: ORIGINAL IDEA (verbatim, base reference)

```
i have an idea of that game , i want you to help me to create the plan for it , so i can give to some ai agent to create and he knows exactly what to do , and do not miss anything , the game is simple , you have money , you draw a fish , using that money , every stroke every more length in drawing needs more money , you create your fish , the fish go to the tank , the game must be preetty , the whole screen is the tank , the fish depending on its shape (your drawing) gets personality and so on using ai , then it moves in the tank and so on , you have food , you can feed it , it gets bigger , also use the ai , to create teh different stages of it , like its shape must change by growing , you can buy food , or buy like weeds to grow in wanter and so on , all that thigns and game dynamics should be balanced , you get more money wehn each fish get to a new era or stage and each fish can grow for infinity or die with no food or bad thins like you do to the tank , when click on each fish you see all the history , all the shapes it takes and so on , you create anotehr fish , they can mate and so on , and create a new fish or more , also using ai

the idea of teh game here , i want to blend human with ai , and explore the evulotion concept , it starts with human drawing , then it evolute using ai by time , and also it mate and get offspring and so on , so teh tank in the end have alot of fish , results of that mixing between ai and human , i dont want the ai to convert the drawing to relistic fish or so , i dont want that , i want the ai to be completely free , and do whatever he wants , but i want it to get all the tank info each time so the creation adds to the tank beuty not crreat a conflict things or so , and i dont want when the fish graw teh ai to change its appearence 100% i want it to simulate the grouth of it , in mating i want teh ai to mix the features of male and female to get relistic off spring , each user should have a completly different tank in that way also the behavior of the fish how it is swiming the animation all that using ai , i want to have a structure standard then alot of paramaters that creates the behavior , is it slow of fast , do it jumps , what is the pattern of swiming , is it try to eat other fish or not and so on , all by ai , so the user explore it , i dont want the user to create everything i want him to explore , and i dont want him to just see without acting i want him to be able to act in the same time , also the weeds and things , they should also evolve by ai and so on , every a while , depending on the conditions of teh tank and so on

teh whole tank is interactive with cursor of the suer , he can move or pet fish or weeds or so on , everything moving in great way , like moving with water , like the weeds and so on , like when i drop food to the water adn so on , and the fish smell teh food and try to really find it , i want that part to be relistic and so on

each think have a card when click on it double click the card open the card should have the history and properties of it and so on for the user to know

this is my idea ,

now i just want to create a file with all that , including this prompt as teh base refrence then after it your organized things and so on , i want save the full idea in one md file , that is teh first step the main file with the idea
```

---

# PART 2: ORGANIZED SPECIFICATION

## 1. One-Line Pitch

A beautiful, full-screen, living fish tank where **you draw the first fish with your own hand, and AI takes over from there**: giving each fish a personality, growing it through stages, letting fish mate and produce offspring that blend their parents, and evolving the plants and the whole ecosystem, so every player ends up with a completely unique tank that is a record of human + AI co-creation.

## 2. Core Philosophy (non-negotiable)

1. **Human seed, AI evolution.** The human provides the origin (the drawing). The AI provides everything that happens afterwards.
2. **The AI is free.** It must NOT convert drawings into "realistic fish". It may reinterpret, exaggerate, add and invent. Weird, abstract and surreal results are welcome.
3. **Free, but not chaotic.** On every generation the AI receives the full state of the tank so what it creates adds to the tank's beauty and does not clash with it (palette, density, balance, style, ecology).
4. **Growth is simulated, not replaced.** When a fish grows, its appearance must evolve continuously from its previous form (same identity, gradually larger/more complex). The AI must NOT redraw it from scratch at a new stage.
5. **Mating blends the parents.** Offspring combine features of both parents in a believable (relatable, inherited-looking) way.
6. **Every tank is unique.** Different drawings, different AI decisions, different histories lead to completely different tanks.
7. **Explore, don't author.** The player does not design everything. They discover what their fish become. But they must never be a passive viewer: they can act at any moment (feed, pet, move things, buy, add, harm, rescue).
8. **Everything is alive and tactile.** The whole screen is the tank. Water, weeds, food, fish and the cursor all physically interact in a satisfying way.
9. **Everything has a card with its history.** Fish, plants and other objects can be inspected to see properties and the full story of how they came to be.
10. **Pretty above all.** Visual and motion polish is a top priority, not an afterthought.

## 3. Core Game Loop

```
Earn/hold money
   -> Draw a fish (ink costs money)
   -> AI analyzes drawing, assigns personality + behavior params + species traits
   -> Fish is released into the tank
   -> Player feeds / interacts / buys plants & items
   -> Fish grows through stages (AI simulates growth continuously)
   -> Reaching a new stage pays out money
   -> Player draws more fish / buys more things
   -> Fish meet and mate -> AI blends parents -> offspring appear
   -> Tank evolves (fish, plants, conditions) -> unique ecosystem emerges
   (Fish can live forever if cared for, or die: starvation, bad tank conditions, player actions, predators)
```

## 4. Economy and Money

### 4.1 Currency
- Single main currency (name TBD, e.g. "coins"). Starting amount given so the first fish can be drawn.

### 4.2 Money sinks (things that cost money)
- **Ink while drawing:** cost scales with stroke length. Every additional length of line costs more. The player sees a live ink/cost meter and remaining balance while drawing. Cannot draw beyond their money. Lifting the pen is free; only drawn length costs. Optional: slightly rising cost curve for very long drawings (more detail = disproportionately more expensive) to encourage deliberate shapes.
- **Food** (multiple types, different nutrition/size/sink speed/effects).
- **Plants / weeds / decorations** (seeds or starter plants that then evolve).
- **Tank tools** (e.g. water treatment, cleaners, heater/light/oxygen items, medicine).
- Optional: mating "encouragement" items.

### 4.3 Money sources
- **Stage advancement:** each fish reaching a new stage/era pays a reward. Rewards scale up with stage number but with diminishing/controlled growth so the economy stays balanced.
- Milestones (first offspring, first generation 2/3/..., tank beauty/biodiversity thresholds), optional.
- Optional: small passive income for a healthy, balanced tank.

### 4.4 Balance requirements
- A new player must always be able to recover from a bad situation (soft-lock prevention): e.g. if money is near zero and no fish are alive, provide a minimum "free scribble" allowance or a tiny recovery grant.
- Prices, rewards, growth speed, hunger rate, and plant effects must be tunable from **one central config file** (`balance.config`).
- Ship with a simulation/test harness that fast-forwards time to check for: runaway money, impossible progress, instant starvation, infinite loops.

## 5. Drawing System

- Full-screen or large canvas "drawing mode" with a smooth, pleasant pen feel (pressure-independent, smoothed strokes).
- Live display of: money, ink cost so far, remaining.
- Tools: pen, color picker (colors may be free or cost small ink; decide in DECISIONS.md), undo (refunds), clear (refunds), done button.
- Drawing is captured both as **vector strokes** (points, colors, widths) and a **raster snapshot**. Both are stored in the fish's history.
- Validation: minimum drawing size/complexity so tiny dots are rejected or handled gracefully (AI still gets something to work with; do not crash on odd input).
- After "done": a short, pretty "birth" animation as the drawing detaches and enters the tank.
- The drawing is the **seed identity**: its silhouette, colors, proportions, line quality and style all feed into the AI's reading of the fish.

## 6. The Tank (World)

- The **entire screen is the tank**. No heavy UI frames; UI floats lightly over the water.
- Layers: background (depth/gradient/light rays/caustics), far decorations, plants/weeds, fish, particles (bubbles, food, dust/plankton), foreground, surface (waves, light), glass-feel overlay.
- Ambient life: gentle bubbles, light shafts, drifting particles, subtle day/night cycle (optional but desirable), soft ambient sound design.
- **Tank state** (tracked continuously and fed to AI):
  - Water quality (cleanliness/waste level), oxygen, temperature, light level, algae amount
  - Fish count, plant count, population density, per-species/trait diversity
  - Food available in water, food scarcity over time
  - Dominant color palette and style summary of what is in the tank
  - Empty regions / crowding map (where there is space)
  - Recent events (births, deaths, feedings, player actions)
  - Time, generation counts
- Tank conditions affect everyone: bad water -> sickness/death risk; good balance -> growth bonuses.

## 7. Fish

### 7.1 Data model (each fish stores)
- Unique ID, name (AI-generated, player can rename), creation time, creator (player drawing vs offspring)
- Parents (if any), generation number, children list
- **Original drawing** (vectors + image)
- **Current visual** (see 7.3) and **full visual history** (every stage/shape it has had, with timestamps)
- **Personality** (AI-generated text + structured traits)
- **Behavior parameter set** (see 7.4)
- Stats: age, stage, size, hunger, health, happiness/stress, energy, growth progress, lifespan state (can be effectively infinite)
- Event log / life story (born, first meal, grew to stage N, mated with X, offspring Y, got sick, was petted, etc.)

### 7.2 AI at birth (drawing -> fish identity)
The AI receives: the drawing (image + stroke data), full tank state, and the standard schema. It returns (structured JSON, validated):
- Personality description + trait scores
- Behavior parameters (7.4)
- Visual/body-language parameters (fins, tail, wobble, eye behavior, etc.) in the standard rig
- Growth profile (how it tends to develop; see 7.3)
- Name, short "story" blurb
- Compatibility info for mating (traits, preferences)

Rules for the AI:
- Free interpretation. NO forced realism. The drawing's shape, color and feel should visibly influence the result but the AI may invent surprising traits.
- Must be consistent with tank info so the fish fits the tank (e.g. complementary colors, space, ecological role) while staying interesting.

### 7.3 Growth and Stages ("eras")
- Fish grow when fed well over time. Growth is a **continuous process with named stage thresholds** (e.g. Fry -> Juvenile -> Adult -> Elder -> and beyond, with AI-named later "eras"). Stages are open-ended: a fish can keep growing forever.
- At each stage threshold: the player gets money, a growth moment plays (animation), and the AI generates the **next form**.
- **Growth must simulate development, not replace the fish.** Implementation requirements:
  - The AI receives the previous form (image + parameters + history) and is told to evolve it gradually: keep identity (core silhouette, colors, signature features), allow plausible changes (bigger, more detail, new fins/patterns/markings, color deepening, scars, aging).
  - Include a **max-change constraint** (e.g. AI output is compared/blended against previous form so no more than a set % of the visual can change per stage).
  - Between stage thresholds, fish scale and morph **smoothly** (interpolation between previous and next form) so growth is visible gradually, not just a pop.
  - Every form is saved to the history.
- Infinite growth requires scaling safeguards (screen/tank limits, camera or size caps with behavioral consequences, e.g. very large fish become slower, hungrier, dominant).
- Death causes: starvation, poor water, disease, predation, harmful player actions, (optional) old age if enabled by the AI's growth profile. Death is shown gracefully; the fish card keeps its history as a memorial. Optionally dead fish decay and affect water quality.

### 7.4 Behavior System (standard structure + AI-driven parameters)
A **fixed standard behavior engine** exists. The AI does not write code; it fills in **parameters** that drive the engine. Each fish has a parameter set such as:

**Movement**
- Base speed, max speed, acceleration, turn rate/agility
- Swim pattern type (straight glides, zigzag, sine wave, darting, circling, hovering, drifting, erratic, figure-eight, etc.) plus pattern parameters (amplitude, frequency, randomness)
- Preferred depth zone (top/mid/bottom), preferred areas (near plants, open water, corners)
- Rest behavior (how often it pauses, where)
- Special moves: jumps/breaching, burst dashes, spins, flips, wall-bouncing, glass-nudging
- Body animation: tail/fin flap rate, body undulation amount, wobble, how the drawn body deforms while swimming (mesh/bend animation driven by params)

**Social**
- Sociability (schools, solitary, curious about others)
- Aggression, territoriality
- **Predation:** whether it hunts other fish, prey size ratio, hunt style, how aggressive
- Fear/flee response, fear of cursor, curiosity towards cursor
- Mating drive, mate preferences

**Needs and senses**
- Hunger rate, appetite, diet preferences, smell range/sensitivity, vision range
- Energy use, sleep/rest cycle
- Stress thresholds, tolerance to water conditions

**Personality -> behavior mapping**
- Personality traits (e.g. bold/shy, lazy/hyper, greedy/picky, friendly/grumpy) are expressed as numbers that modify the parameters above, so personality is visible in motion, not only in text.

All parameters have defined ranges, defaults and validation. AI outputs are clamped/validated against the schema before use.

### 7.5 Food-seeking (must feel realistic)
- Food dropped in water has physics (sinks at type-dependent speeds, drifts with currents, can be disturbed by fish and cursor).
- **Smell model:** food emits a scent field that spreads and decays through the water over time (diffusion, influenced by currents). Fish with sufficient smell sensitivity detect it, and **follow the gradient** toward the source rather than teleporting to it. Fish can lose the trail, wander, get distracted, compete, steal, or ignore food if not hungry.
- Vision handles close range, smell handles long range.
- Eating has a visible animation, particle crumbs, and result (hunger down, growth progress up).
- Overfeeding has consequences (uneaten food rots, water quality drops, algae grows).

## 8. Mating and Offspring

- Two fish can mate if: both mature enough, healthy, mating drive present, compatibility acceptable (traits/preferences), and conditions OK. Provide visible courtship behavior (approach, dance, circling) driven by behavior params.
- "Male/female": store sex or reproductive role as a trait (or AI-defined reproductive system; decide in DECISIONS.md; must still allow two parents to mix).
- **AI offspring generation:** the AI receives both parents (images, params, personalities, histories), the tank state, and generates 1 or more offspring (count influenced by parents/tank conditions).
  - Offspring must **visibly inherit mixed features** from both parents (body shape pieces, colors, patterns, fin types, behaviors) in a believable way, plus controlled mutation for novelty.
  - Behavior parameters are also blended + mutated.
  - Offspring start at the first life stage and use the same growth system.
- Record lineage: generation number, parents, siblings, full family tree viewable from the card.
- Cooldowns, population caps and carrying-capacity logic to prevent explosion (soft caps tied to tank conditions: crowded/dirty tank = lower birth rates or survival).
- Over time the tank holds many fish that are genuinely the blended result of human drawings and AI evolution.

## 9. Plants / Weeds and Other Things

- Player buys seeds/starter plants/decor and places them.
- **Plants also evolve via AI:** periodically (and depending on tank conditions like light, nutrients, water quality, fish activity) the AI generates growth and variation: new shapes, colors, sizes, branching, flowers, spread, seeds.
- Same philosophy as fish: AI is free, gets the tank info, adds beauty without clashing, and growth simulates development (not full replacement).
- Plants interact: provide oxygen, absorb waste, give shelter to fish, food for some fish, can overgrow if neglected (algae/weeds), can die in poor conditions.
- Plants sway with water currents, react to fish passing by and to the cursor.
- Optional other living/non-living things (snails, algae, decorations, rocks, shells) using the same card + AI system.

## 10. Interactivity (whole tank responds to the cursor/touch)

- Cursor affects water: moving it creates ripples/currents that push plants, food and particles, and make fish react.
- **Petting:** gentle touch makes fish react by personality (enjoy, flee, ignore, nibble).
- **Drag/move:** player can pick up and move fish, plants, and objects (with physical feel, release in water, appropriate reactions; moving a fish may stress it).
- **Feeding:** click/drop food from the top; food sinks, scent spreads, fish respond.
- **Harmful actions** exist (tapping glass hard, shaking the tank, overfeeding, pollution, removing plants, etc.) with real consequences (stress, sickness, death), so player actions matter.
- **Helpful actions:** clean water, medicine, shelter, extra oxygen, etc.
- The player can always act while the AI works; **AI calls never block play** (see Section 12).
- Touch and mouse both supported.

## 11. Cards and History

- **Single click** on any fish/plant/object: small hover/preview card (name, stage, key stats, status).
- **Double click:** opens the full card.
- **Full card contents (fish):**
  - Name, portrait, current stage, age, size, status (hunger, health, mood)
  - Personality text + trait chart
  - All behavior parameters presented in friendly form
  - Original human drawing
  - **Timeline of every form** (visual gallery of all stages with dates)
  - Life story/event log
  - Family tree: parents, siblings, children, generation
  - Actions: rename, feed, favorite, release/remove (with confirmation)
- **Plants/objects cards:** same structure (origin, growth history, properties, effects on tank).
- Cards must be pretty, readable, and match the game's visual style.

## 12. AI Architecture

### 12.1 Where AI is used
1. Reading a drawing -> fish identity (personality, behavior params, visuals, name, growth profile)
2. Growth -> next form at each stage (gradual evolution)
3. Mating -> offspring generation
4. Plants and other things -> evolution over time
5. Behavior parameter generation (all of it)
6. Names, stories, card text, event narration
7. (Optional) Tank-level "events" or gentle environmental changes decided by AI based on tank state

### 12.2 Rules for every AI call
- **Always include full tank context** (palette, density, water conditions, existing species/traits, empty space, recent events) in the input.
- **Structured output only** (JSON schema), validated and clamped; on failure, retry then fall back to a safe procedural default so the game never breaks.
- Provide previous form + history for growth calls with an explicit "evolve gradually, keep identity" instruction and a measured change limit.
- Provide both parents for mating calls with an explicit "blend, inherit recognizable features from each" instruction.
- Do not ask AI for realistic fish. Prompts must explicitly encourage freedom and creativity inside the schema/aesthetic constraints.
- AI never writes executable code that the game runs; it only returns data (parameters, shape/visual descriptions, SVG/vector or image data in a defined safe format).
- **Cost and latency control:** async queue, batching, caching, rate limits, and per-user budgets. The tank must keep running with a "forming/cocoon/egg" animation while the AI works.
- Determinism and storage: every AI result is stored (inputs summary + outputs) so history is reproducible and cards can show it.
- Safety: content filtering on any AI/user text shown in-game.

### 12.3 Visual generation approach
Decision needed and documented (see Open Questions): the AI's visual output may be produced as (a) vector/SVG-style shape data rendered by the game engine, (b) AI image generation processed into sprites, or (c) a hybrid where the human drawing remains the base layer and AI adds/modifies parts. Whatever is chosen must support: smooth growth interpolation, mesh/bend animation while swimming, offspring blending, and a stored history of all forms.

## 13. Visual and Audio Direction

- **Pretty, calm, hypnotic, premium.** Soft lighting, depth, caustics, light rays, gentle color grading, glass/water refraction feel, subtle depth-of-field/parallax.
- Hand-drawn fish keep their handmade charm inside the polished environment (a deliberate contrast of human line and AI evolution).
- Fluid animation everywhere: easing, secondary motion, squash/stretch on fish, trailing fins, swaying weeds, drifting particles, ripples at the surface.
- UI is minimal, translucent, and never fills the screen; the tank is always the hero.
- Ambient audio: water ambience, soft bubbles, gentle music (optional, toggleable), satisfying sounds for drawing, feeding, growth, birth.
- Performance target: smooth 60 fps on typical modern devices with dozens of fish and many plants; graceful degradation (quality settings).

## 14. Persistence and Accounts

- Each user has their own persistent tank (save/load automatically; offline progress simulation or gentle catch-up when they return, rules to be defined so fish do not all starve instantly while the player is away; e.g. slowed time while offline).
- Everything saved: tank state, all entities, histories, drawings, AI results, economy.
- Export/share ideas (later): screenshot, timelapse of the tank, family tree share, tank "gallery".

## 15. Suggested Tech Direction (open to agent's judgment, justify in DECISIONS.md)

- Web-first (runs in browser, works on desktop and mobile), canvas/WebGL renderer (e.g. PixiJS/Three.js/Babylon or similar) for performance and shaders (water, caustics, glow).
- Physics/simulation: custom lightweight 2D fluid-ish flow field for currents + steering-behavior engine for fish; scent as a grid-based diffusion field.
- Backend for AI calls, storage, accounts, rate limiting; calls to an LLM (and optionally an image model) with structured outputs.
- Central config for balance; automated tests for economy and simulation.

## 16. Build Phases (suggested order)

1. **Foundation:** tank rendering, water, ambient effects, camera/screen layout, cursor-water interaction.
2. **Drawing:** drawing mode, ink cost, money system, capture vector + image.
3. **Fish engine:** behavior engine with parameter sets, procedural/default params first, mesh bend swimming of the drawn fish.
4. **AI birth:** drawing -> personality + params + tank-aware output, with validation and fallbacks.
5. **Food and senses:** food physics, scent diffusion, gradient-following, eating, hunger, health, death.
6. **Growth:** stages, rewards, gradual AI evolution, smooth morphing, history storage.
7. **Cards and history:** single-click preview, double-click full card, timelines, event logs.
8. **Plants:** buying, placement, sway physics, AI evolution, ecological effects.
9. **Mating:** courtship, AI blending offspring, lineage, population balancing.
10. **Tank health and player actions:** water quality, harmful/helpful actions, consequences.
11. **Balance pass:** economy tuning with simulation harness.
12. **Polish:** sound, visual finish, performance, onboarding, persistence, offline catch-up.

## 17. Acceptance Checklist (nothing missed)

- [ ] Full-screen tank is the main (and nearly only) screen
- [ ] Money exists; drawing costs money proportional to stroke length; cannot overspend
- [ ] Player draws a fish; it enters the tank with a birth animation
- [ ] AI assigns personality and behavior parameters from the drawing, using full tank info
- [ ] AI does NOT force realistic fish; results can be free/strange but harmonious with the tank
- [ ] Standard behavior engine driven by AI parameters (speed, jumps, swim pattern, predation, sociability, etc.)
- [ ] Fish animate while swimming (body bend/fins), not static sprites sliding around
- [ ] Food can be bought and dropped; sinks and drifts with water; scent spreads; fish follow it realistically
- [ ] Fish get hungry, eat, grow, and can starve or die of bad conditions and player actions
- [ ] Growth passes through stages; AI generates each next form as a gradual evolution (not a redraw); smooth in-between morphing
- [ ] Reaching a new stage gives money; economy balanced and tunable
- [ ] Fish can grow indefinitely with sensible safeguards
- [ ] Fish can mate; AI blends both parents' features into believable offspring; lineage tracked
- [ ] Population and tank-health balance mechanics prevent explosion/collapse
- [ ] Plants/weeds can be bought, sway with water, and evolve via AI based on tank conditions
- [ ] Whole tank reacts to cursor: ripples, petting, dragging fish/plants, pushing food
- [ ] Player can act at all times; AI processing never blocks gameplay
- [ ] Click = preview card; double-click = full card with history, all forms, properties, family tree
- [ ] Every user gets a persistent, unique tank
- [ ] Beautiful visuals, fluid motion, ambient audio, 60 fps target
- [ ] Central balance config + simulation/test harness
- [ ] AI outputs validated, with retries and procedural fallbacks; cost/latency controlled

## 18. Open Questions (to decide next, record answers in DECISIONS.md)

1. Platform priority: web only, or mobile app too?
2. Visual generation method: vector/SVG shapes, AI-generated sprites, or hybrid (human drawing as base + AI layers)?
3. Which AI model(s) and budget per user? Free vs paid, ads, or in-app currency purchases?
4. Is there a "sex/gender" system, or an AI-defined reproduction system?
5. Offline behavior: how does time pass when the player is away?
6. Multiplayer/social features (visiting other tanks, gifting fish) now or later?
7. Are colors free to use while drawing, or part of the ink cost?
8. Should death be permanent, or is there any revive/memorial mechanic?
9. Art style target and reference images/mood board.
10. Game title and branding.

---

*End of master idea file. Next step: use this file as the base to produce the detailed technical spec (data schemas, AI prompt templates, behavior engine design, economy tables) for the implementing agent.*
