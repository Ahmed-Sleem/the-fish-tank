# GitHub Pages and development delivery

## Start here: the files to download and the folder to use

**[Open the GitHub Pages setup folder](github-pages-setup/README.md).** It contains:

- [ci.yml](github-pages-setup/ci.yml) → owner installs at **`.github/workflows/ci.yml`**
- [pages.yml](github-pages-setup/pages.yml) → owner installs at **`.github/workflows/pages.yml`**

No ZIP, local Git commands or API key is required. The setup README provides direct GitHub web-editor links with the correct destination filenames, plus an upload option. Install on **main**, then select **GitHub Actions** in [Settings → Pages](https://github.com/Ahmed-Sleem/the-fish-tank/settings/pages).

## What is and is not installed

The workflow files under `docs/github-pages-setup/` are **inert templates** for the owner to install manually. There are no active workflows in this checkout. Earlier untracked workflow files and the temporary archive did not persist into the new branch. They have been replaced by this durable, committed handoff, not another archive.

The integration previously received 403 for Pages activation and a rejected workflow push because it lacks `workflows` permission. Manual installation by the repository owner remains necessary unless the integration's authorization changes. No credential is included in these files. No successful deployment is claimed.

## Publishing policy

The new handoff uses **main** as the stable public publishing source, replacing the earlier draft's session-branch trigger. This removes the need to edit workflow triggers every time Arena starts a new branch. This change is for the owner to review/install; the agent does not activate it or push to main.

- Changes on an Arena branch: visible in Arena preview, not automatically public.
- Changes merged/pushed to main: verification/build then Pages deployment once workflows are installed.
- Manual release: **Actions → Deploy Pages → Run workflow → main**.
- If the `github-pages` environment restricts deployment branches, permit **main** and retain any reviewer protections you want.

Expected project URL after a successful deployment: https://ahmed-sleem.github.io/the-fish-tank/. Use the successful job's environment link to confirm the actual URL.

The Pages workflow calls the same verification job used by PR checks. It runs exact Node/npm install, real browser setup and `npm run verify` before uploading **only `dist/`**. Deploy has minimal `pages: write`/`id-token: write` permissions; pinned action SHAs and non-cancelling Pages concurrency are retained. No AI, uploads, application credentials or backend are involved.

## Local preview and verification

Use Node 22.22.3 (`.nvmrc`), npm 10.9.8 and Python 3:

```sh
npm ci
npx playwright install --with-deps chromium
npm run verify
npm run dev
```

Vite binds `0.0.0.0` and serves `/the-fish-tank/`; Arena `.e2b.app` hosts are allowed. `npm run build` then `npm run preview` serves the production build. Browser tests use the production project subpath, not a localhost API in the app.

The sandbox cannot normally reach Playwright's Chromium CDN. The prior S01 run used separately installed `@sparticuz/chromium@153.0.0` from npm, outside the repository, with its library archives extracted under `/tmp`. `CHROMIUM_EXECUTABLE_PATH` is an explicit local-test override; CI uses standard Playwright Chromium. Do not skip real-browser verification when reporting app changes.

## After installation and on failures

Open the successful deployment URL; check build ID and renderer-ready status, reload, inspect mobile layout and keyboard links, and check for asset 404s/unexpected requests. Current S01 is still only a scaffold; drawing/fish/saves do not exist yet.

If CI fails, inspect the failed step and fix it before deployment. If Pages setup/protection fails, follow the setup guide and rerun. To roll back, rerun a previously successful deployment for a verified main commit. GitHub Pages updates after a successful push/build/deploy and refresh, not on every local keystroke.

A successful Actions run is not a directly observed public browser smoke. Record actual hosting evidence separately from local tests and from an expected URL.
