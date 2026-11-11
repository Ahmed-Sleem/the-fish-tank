# the fish tank — a world from a little ink

the fish tank is a browser aquarium being built around a simple idea: **you draw the beginning, then discover what it becomes.** In the planned game, your handmade creatures will develop personalities, grow, and pass features on to their offspring without losing their hand-drawn identity.

## Open the fish tank

**[Open the browser build](https://ahmed-sleem.github.io/the-fish-tank/)** — no installation or account required.

**Release status:** the public site is live and serves the current merged build. The current version is an early foundation preview, **not a playable aquarium** — water, light and controls only. Public updates appear after a verified pull request is merged and deployment succeeds; unmerged changes are available in the development preview, not necessarily on the public site.

## What you can do now

- Open straight into a full-window, **borderless** aquarium on desktop or mobile — there is no landing page and no frame around the water. Look for the flat teal-circle tab icon.
- During startup the splash shows the product name, **the fish tank**, which appears on this screen only. Under it, **loading** is revealed one letter at a time and repeats. The water already sits as a settled, flat waterline when the splash opens, and drifts with a slow current; move your cursor through the grainy pixel water to stir it. The fluid is adapted from [Oimo Water](https://oimo.io/works/water/). The splash stays for at least 5 seconds and until the page and graphics startup have settled; slower connections take longer. Touch movement also stirs the water where supported.
- After loading, the tank opens directly in front of you: teal water, a lit sand bed, rooted green plants, a warm shaft of light and drifting particles — with **no border, HUD bar or frame** of any kind. It moves through a full day and night: 45 seconds of warm daytime, a 15-second fade, 45 seconds of cool night, then a 15-second fade back. Hover to disturb the current; click or tap and drag through the water for stronger ripples. Effects respect reduced motion, which holds the calm night mood still.
- One **settings icon** sits in the top-right corner and holds everything: Low/Medium/High visual quality, reduced motion, fullscreen, graphics status and the source links. Settings apply for this visit; your system’s reduced-motion preference is always respected.
- Open the settings icon to see the data-format version, graphics status and links; nothing is drawn over the tank itself. Press **Escape** or **Close** to dismiss it; keyboard focus returns to the icon.
- Use **Fullscreen** inside the settings dialog where your browser supports it; click **Exit fullscreen** or press **Escape** to leave it.
- Use a keyboard: press **Tab** for the “Skip to aquarium” link and the settings icon.

There is nothing to buy, feed or draw in this version yet. You do not need an AI key.

## Not available yet

Drawing creatures, swimming fish, feeding, growth, offspring, plants, creature history cards and saved tanks are planned but **not implemented**. They will be added in verified steps; instructions will appear here when you can actually use them.

## Browser help

Use a current browser with JavaScript and WebGL enabled. The page supports mouse, touch and keyboard navigation. The splash respects your system’s reduced-motion setting: the complete word **loading** and the water stay still; cursor stirring is disabled.

- **“Ready”** in the settings dialog means the graphics canvas started successfully. It does not mean fish gameplay is available.
- **No animated loading water?** The effect needs WebGL 2. If unavailable, the loading word stays readable against the dark background. Graphics failure does not block the page text and links.
- **Loading never finishes?** Check your connection and reload. No artificial timeout pretends a stalled download is complete.
- **“Water effects unavailable”**: the pixel tank is shown without caustics and rays; the water shader needs floating-point render targets. Enable hardware acceleration/WebGL or try another up-to-date browser.
- **“Graphics unavailable…”**: enable hardware acceleration/WebGL or try another up-to-date browser. The page text and links remain usable without the graphics canvas.
- **“Graphics context interrupted…”**: reload the page to restart the renderer.
- **Older build after an update?** Refresh once publication finishes. Updates appear after a successful release, not on every development edit.

## Your data and cost

This version has **no AI calls, no data uploads, no saved game and no login**. It does not request API keys or charge for play. Future optional AI features will use your own provider key and may incur that provider's costs; they are not active now.

## Follow development

- [Game idea](GAME_IDEA.md) — the full creative vision.
- [Implementation plan](IMPLEMENTATION_PLAN.md) — the ordered build stages.
- [Changelog](_working_docs/CHANGELOG.md) — what changed and what is still missing.

Want to run the project yourself or contribute? See [developer setup](docs/DEVELOPMENT.md), [contributing](CONTRIBUTING.md) and [deployment notes](docs/DEPLOYMENT.md). Those details are separate from the player guide above.

## Open-source credits

See the [reuse ledger](docs/REUSE_LEDGER.md) for upstream sources, licenses, modifications and exact integration locations. The in-app **About this build** dialog links to the same list.
