# GitHub Pages and development delivery

The owner requested live delivery before later game work. Deployment plumbing originally in S38 is deliberately brought forward to S01. This publishes an honest development shell, not a finished aquarium.

## One-time GitHub setup (repository owner)

The integration's `POST /repos/Ahmed-Sleem/the-fish-tank/pages` returned **403 Resource not accessible by integration**. `GET .../pages` returned 404 and repository metadata reported `has_pages: false` at initial inspection. An admin-looking repository permission does not imply the integration has the Pages API scope.

1. Update/reconnect the GitHub connection in Arena to authorize workflow creation/updates. Git rejected the first push containing `.github/workflows/ci.yml` with “without workflows permission”. The app source is published separately; workflow files remain in the local workspace, not on GitHub. After authorization, push those files on the same Arena branch. Do not send tokens in chat.
2. Open https://github.com/Ahmed-Sleem/the-fish-tank/settings/pages.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. If the `github-pages` environment limits deployment branches, open **Settings → Environments → github-pages** and permit `arena/f3e87408-the-fish-tank`. Keep required reviewer protection if desired; approve the deployment when prompted.
5. In **Actions**, open **Deploy Pages**, select this branch and use **Re-run all jobs** on its push-triggered run if it failed before setup was enabled. `workflow_dispatch` appears in the UI once the workflow is on the repository's default branch; do not depend on seeing that button before then.
6. Successful deployment reports its exact URL in the job's environment link. Expected project URL: https://ahmed-sleem.github.io/the-fish-tank/.

Do not create or upload API keys. There are no application secrets required for this build. Do not manually upload `src` or `node_modules`.

## Automatic updates

Once published (currently blocked by GAP-014), `.github/workflows/pages.yml` triggers on pushes to **only** `arena/f3e87408-the-fish-tank`. That is the single current publishing branch, chosen explicitly for this Arena session. Merging other work into `main` does not update this site unless the publishing branch/workflow is deliberately changed later. A new Arena branch needs an explicit publishing-trigger and environment-policy update.

The workflow calls the same CI job used by PR checks: exact Node, `npm ci`, install Chromium with system dependencies, `npm run verify`, then upload **only `dist/`**. The deploy job depends on that success and uses narrowly scoped `pages: write` and `id-token: write`. Third-party actions are pinned to immutable SHAs; workflow concurrency does not interrupt in-flight deployments. There are no AI calls, data collection, credentials or backend.

GitHub Pages does not hot-reload on every keystroke. A verified push triggers a build/deploy; refresh the public page after success. The page shows the source commit's first seven characters so you can identify its build. Arena's Vite preview hot-reloads local edits immediately.

## Local use

Use Node from `.nvmrc` (22.22.3) and npm 10.9.8:

```sh
npm ci
npx playwright install --with-deps chromium
npm run verify
npm run dev
```

Vite serves the project under `/the-fish-tank/` and binds `0.0.0.0`. Arena proxy hosts ending `.e2b.app` are allowed without opening the allowlist to arbitrary hosts. Root requests redirect to the configured base. Browser code uses no localhost APIs.

For production output: `npm run build`, then `npm run preview`. Tests serve that build at `http://127.0.0.1:4173/the-fish-tank/`; this localhost address is a test-runner address, not a browser-to-backend endpoint in production.

## Constrained browser-test environments

This sandbox cannot reach Playwright's browser CDN. The local smoke run used MIT-licensed `@sparticuz/chromium@153.0.0` fetched from npm **outside the repository**, extracting its Chromium/system-library archive into `/tmp`. It is not a product dependency or bundled artifact. Playwright's normal Chromium is installed on GitHub Actions; do not substitute mocks or skip browser checks.

If a suitable Chromium binary is supplied externally, `CHROMIUM_EXECUTABLE_PATH` lets Playwright use it. Its OS libraries must also be available. This is an explicit testing override, not an automatic download or a production dependency.

## Smoke and recovery

After a successful deployment: open the exact job URL, confirm build label/renderer-ready status, reload, view at mobile width, tab to the skip/source/plan links and inspect for asset 404s or unexpected network calls. Currently there is no fish/drawing/save workflow to test; those arrive later. Real-device performance and full gameplay remain S35–S39 requirements.

If CI fails, fix the cause and push again; no failed build is deployed. If Pages setup/protection fails, use the one-time settings above then rerun the deployment. To roll back a bad public build, rerun a previously successful Deploy Pages run for the desired verified commit. Do not reset or push another branch from this Arena session.

Public Pages browser access is also network-restricted inside this sandbox; a successful workflow alone must not be reported as a directly observed live browser smoke. Record that distinction in the implementation log and final handoff.
