# GitHub Pages delivery

## Current setup and failure diagnosis

Both workflows are installed, and GitHub's Pages API reports `build_type: workflow` with URL https://ahmed-sleem.github.io/the-fish-tank/.

Canonical sources:

- [ci.yml](../.github/workflows/ci.yml)
- [pages.yml](../.github/workflows/pages.yml)

The latest inspected main runs were [Verify 42734845206](https://github.com/Ahmed-Sleem/the-fish-tank/actions/runs/42734845206) and [Deploy Pages 42734845133](https://github.com/Ahmed-Sleem/the-fish-tank/actions/runs/42734845133). Job metadata shows checkout, Node setup, npm ci and Chromium installation succeeded. `npm run verify` failed, so artifact upload and deployment were skipped. Complete log downloads are blocked by this sandbox's network allowlist; job metadata and check annotations are accessible.

Reproducing the docs verifier at that exact checkout immediately failed: it required `docs/github-pages-setup/{ci,pages}.yml`, which the owner had moved to `.github/workflows/`. Broken links to the moved files failed too. This was **our checker/handoff lifecycle bug**, not a bad Pages setting. The repair validates the installed files and links directly to them. It does not disable verification or reintroduce duplicates.

## Publish the repair and later updates

1. Open a PR from the current Arena branch to main and wait for **Verify / verify** to pass.
2. Review and merge the verified PR. This agent does not merge without authorization.
3. The main update automatically runs **Deploy Pages**. Its build calls CI, then uploads only the verified `dist/` artifact; deploy depends on that success.
4. Wait for build and deployment to succeed. If environment review is required, approve under your chosen protection policy. Deployment restrictions should allow main.
5. Open the environment URL and smoke test. A configured URL or a green PR check alone is **not** a successful public deployment.

Do not rerun the old failing commit to test this fix—it still has the old checker. After the repair is on main, manual reruns use **Actions → Deploy Pages → Run workflow → main** if needed.

No more workflow uploads or credentials are needed for the code/checker repair. Previous integration workflow-write restrictions may still apply to future edits of the YAML itself; these installed files are unchanged by this repair.

## Operations and acceptance

Main is the public release source. Unmerged Arena branches use the local preview. A successful merge/push/build/deploy plus refresh updates the public page, not each local edit. Workflow action SHAs are pinned; deploy uses scoped pages/id-token permissions and non-cancelling concurrency. The runtime contains no backend, keys or AI requests at this stage.

After a successful deployment, open the exact job environment URL; confirm build ID/renderer status, reload, check mobile layout and keyboard links, and inspect for asset 404s/unexpected requests. Current gameplay is still only an S01 shell—no fish/drawing/save flow can be tested yet. Record actual live smoke separately from local tests and Actions success.

If verification fails, fix the reported issue before deployment. If setup/protection fails, inspect Pages source and environment settings. For rollback, rerun a previously successful verified main deployment. Keep the [player README](../README.md) current when the public release status or available controls change. Local setup and test instructions are in [developer setup](DEVELOPMENT.md).
