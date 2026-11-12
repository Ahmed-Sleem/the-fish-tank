# S05 — Drawing transactions and ink pricing

**Status:** implemented and locally verified. Real-hardware profiling remains open as GAP-005; nothing here claims a frame budget measured on a GPU.

## What the owner decided

GAP-002 blocked this session for two days and is now closed. The owner chose **length only** (DEC-023): a drawing costs exactly the distance it was drawn. Pen width, colour and the number of separate strokes do not affect the price. The `widthMultiplier` and `rateStroke` terms in TECH_SPEC §8.1 are rejected and are **not** present in the code, not even dormant behind a flag — a later pass cannot reintroduce them by switching something on.

## Implemented

| Path                                      | Purpose                                                                                                                                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/config/ink.config.ts`                | `base 4`, `rateLength 1.5`, `softCap 8`, `overPenalty 1.5`, `rateOver 1`, `minimumLength 0.6`, whole-coin rounding. Pen widths and the six colours live here too, as presentation only. |
| `src/draw/ink.ts`                         | Pure evaluator: `strokeLength`, `effectiveLength`, `inkCost`, `isDrawable`, `affordableLength`, `refusalFor`. No DOM, no screen.                                                        |
| `src/draw/purse.ts`                       | Balance plus reservations: `reserve`, `commit`, `release`, `refund`, `earn`. Never negative.                                                                                            |
| `src/ui/drawing.ts`                       | The surface: pointer capture, a live stroke traced through the same function that prices it, undo/clear, and a Done button that refuses rather than discards.                           |
| `src/ui/drawing.css` + `theme.css` tokens | White paper, one toolbar, one footer. Every value is a token; the architecture gate rejects anything else.                                                                              |

Integration: the shell now has two icons — **draw a fish** and **settings** — each opening exactly one dialog. `shell.spec.ts` asserts the count of header controls so a third one cannot appear unnoticed.

## Verification

- **Unit, 116 passing** (23 new in `tests/unit/ink.test.ts`). The pricing tests assert the rejected rules are absent: the same path split across one, two, four or twelve strokes costs the same, and a thick stroke costs what a thin one does.
- **Browser, 32 passing, 4 capability skips.** Six new tests in `tests/e2e/drawing.spec.ts` drive real pointer drags and assert that the price shown is the price charged, that undo returns the exact ink, that a longer stroke costs more, and that width changes nothing.
- **Controlled failure, recorded.** Deliberately reintroducing a `0.5 × strokeCount` fee fails four unit tests. The first version of that guard did _not_ catch it — it compared a single length where the fee cancelled out against rounding — so the test was strengthened before being trusted. This is exactly the class of false confidence the mutation check exists to find.
- **Architecture gate** rejected two raw values (`min(58vh, 30rem)`, `1em`) in `drawing.css` and the theme test rejected `--draw-border: none`; both were fixed rather than exempted.
- Format, lint, typecheck, build, `audit --audit-level=high`, docs and 39 session contracts all pass.

## Two bugs found by testing, not by shipping

1. `affordableLength` solved the closed form and ignored rounding, so a 25-coin budget produced a drawing priced at 31.
2. Refining on raw doubles still overshot: the last representable step below the boundary summed to exactly `5.5`, which rounds up a whole coin over budget. The search now runs on a thousandths grid, so the value checked is the value returned.

## The night defect (found by the owner, not by a test)

The owner left the tab open and never saw the dark tank. Three independent faults, each enough on its own:

1. The mood was written to `.canvas-host`, but the stylesheets read `:root[data-mood]`, so the CSS palette never switched.
2. The palette was applied only when the mood _changed_, so the opening state was never applied at all.
3. The cycle advanced on accumulated **simulated** seconds, which stop while the tab is hidden, while the tank pauses behind a dialog, and whenever frames are dropped. It now follows real time.

A browser without float render targets was also stuck in permanent daylight, because only the shader drove the cycle; the degraded path now runs it too. The regression test asserts the observered transition to night, and skips under reduced motion, which deliberately holds the tank at night with no cycle.

## Where the loader's water belongs (DEC-025)

The owner likes the loader's pool and wants it in the tank. The loader water is not a separate effect: it is the same physics the tank already runs, shown as point sprites only because during loading there is no tank to show. In the tank the same motion belongs inside the existing lighting, refraction and surface band, driven by the one flow the particles already sample. A second canvas repeating the loader shader is rejected — two fluids would disagree the moment the pointer moved.

## Deliberately not done

- **Nothing swims yet.** `onDone` spends the ink and closes the dialog; the strokes are handed to a callback that currently has no renderer to receive them. Cutout, birth and steering are S07–S09.
- **The drawing is not saved.** The purse lives for the page only. S13 owns storage; claiming otherwise in the interface would be a lie, so the dialog shows real numbers and no promise of persistence.
- **No Paper.js.** Strokes are captured with plain pointer events on a canvas. TECH_SPEC §8 specifies Paper.js for `simplify()`/`smooth()`; that belongs with the cutout work in S07, where the simplified path finally has a consumer. Adding a second stroke representation now would create two sources of truth for what a stroke is.
- **Coins are not earned.** `startInk` is 100 and nothing pays in yet; passive income and feeding are later sessions.
