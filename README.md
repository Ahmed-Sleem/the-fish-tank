# the fish tank — a world from a little ink

the fish tank is a browser aquarium being built around a simple idea: **you draw the beginning, then discover what it becomes.** In the planned game, your handmade creatures will develop personalities, grow, and pass features on to their offspring without losing their hand-drawn identity.

## Open the fish tank

**[Open the browser build](https://ahmed-sleem.github.io/the-fish-tank/)** — no installation or account required.

**Release status:** public updates appear after a verified pull request is merged and deployment succeeds. The current version is an early foundation preview, **not a playable aquarium**. Unmerged changes are available in the development preview, not necessarily on the public site.

## What you can do now

- Open straight into the full-window aquarium interface on desktop or mobile—there is no landing page. Look for the flat blue-circle tab icon.
- During startup, **loading** appears one letter at a time and repeats. Move your cursor through the lightweight, grainy blue particle water to stir it; the fluid is adapted from [Oimo Water](https://oimo.io/works/water/). It stays for at least 3 seconds and until the page and graphics startup have settled; slower connections take longer. Touch movement also creates ripples where supported.
- Open **About this build** in the top-right controls to see the data-format version, graphics status and current limitations. Press **Escape** or **Close** to dismiss it; keyboard focus returns to the opener.
- See graphics status along the bottom; the build identifier, source links and plan are inside **About this build**.
- Use **Fullscreen** where your browser supports it; click **Exit fullscreen** or press **Escape** to leave it.
- Use a keyboard: press **Tab** for the “Skip to aquarium” link and the other page links.

There is nothing to buy, feed or draw in this version yet. You do not need an AI key.

## Not available yet

Drawing creatures, swimming fish, feeding, growth, offspring, plants, creature history cards and saved tanks are planned but **not implemented**. They will be added in verified steps; instructions will appear here when you can actually use them.

## Browser help

Use a current browser with JavaScript and WebGL enabled. The page supports mouse, touch and keyboard navigation. The splash respects your system’s reduced-motion setting: the complete word **loading** and the water stay still; cursor stirring is disabled.

- **“PixiJS renderer ready”** means the empty graphics canvas started successfully. It does not mean fish gameplay is available.
- **No animated loading water?** The effect needs WebGL 2. If unavailable, the loading word stays readable against the dark-blue background. Graphics failure does not block the page text and links.
- **Loading never finishes?** Check your connection and reload. No artificial timeout pretends a stalled download is complete.
- **“Graphics unavailable…”**: enable hardware acceleration/WebGL or try another up-to-date browser. The page text and links remain usable without the graphics canvas.
- **“Graphics context interrupted…”**: reload the page to restart the renderer.
- **Older build after an update?** Refresh once publication finishes; compare the build identifier shown on the page. Updates appear after a successful release, not on every development edit.

## Your data and cost

This version has **no AI calls, no data uploads, no saved game and no login**. It does not request API keys or charge for play. Future optional AI features will use your own provider key and may incur that provider's costs; they are not active now.

## Follow development

- [Game idea](GAME_IDEA.md) — the full creative vision.
- [Implementation plan](IMPLEMENTATION_PLAN.md) — the ordered build stages.
- [Changelog](_working_docs/CHANGELOG.md) — what changed and what is still missing.

Want to run the project yourself or contribute? See [developer setup](docs/DEVELOPMENT.md), [contributing](CONTRIBUTING.md) and [deployment notes](docs/DEPLOYMENT.md). Those details are separate from the player guide above.

## Open-source credits

See the [reuse ledger](docs/REUSE_LEDGER.md) for upstream sources, licenses, modifications and exact integration locations. The in-app **About this build** dialog links to the same list.
