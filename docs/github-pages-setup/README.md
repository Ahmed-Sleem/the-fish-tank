# Download these two files — no ZIP needed

These are plain, ready-to-copy workflow files. **This folder is only a handoff; GitHub does not execute files under `docs/`.** No token, secret or paid service is needed.

## 1. Download

Open each file below on GitHub and click **Download raw file** (the down-arrow icon near **Raw**). If necessary, click **Raw** and save the page as the exact filename shown, not `.txt` or `.html`.

- [ci.yml](ci.yml)
- [pages.yml](pages.yml)

## 2. Put them in the correct folder on GitHub

Select the repository's **`main` branch** before adding files. These are the **exact destination paths**, relative to the root of the repository:

```text
.github/
└── workflows/
    ├── ci.yml
    └── pages.yml
```

**Do not upload them into the root or back into `docs/github-pages-setup/`.** GitHub only runs workflows installed in `.github/workflows/`.

### Simplest option if that folder does not exist (GitHub web editor)

No local tools or ZIP extraction needed:

1. Open [Create `.github/workflows/ci.yml` on main](https://github.com/Ahmed-Sleem/the-fish-tank/new/main?filename=.github%2Fworkflows%2Fci.yml).
2. Copy the complete contents of the downloaded `ci.yml` (or its **Raw** view) into the editor. GitHub creates the folders from the filename. Click **Commit changes**. If offered, commit to `main`; if your repository requires a pull request, create and merge it first.
3. Open [Create `.github/workflows/pages.yml` on main](https://github.com/Ahmed-Sleem/the-fish-tank/new/main?filename=.github%2Fworkflows%2Fpages.yml).
4. Paste the complete `pages.yml` contents and commit the same way. Install **ci.yml first** because pages.yml calls it.

If either file already exists, edit that file rather than creating a duplicate. Review any existing custom workflow before replacing it.

### Upload option if `.github/workflows/` already exists

1. On GitHub, browse into `.github/workflows/` on **main**.
2. Choose **Add file → Upload files**.
3. Drag in the two downloaded `.yml` files. Confirm the destination shown is `.github/workflows/`, then **Commit changes** (or merge the resulting PR).

The **owner** performs this manual installation. The integration cannot currently write active workflows; storing these inert handoff copies does not change that permission.

## 3. Enable Pages

1. Open [Settings → Pages](https://github.com/Ahmed-Sleem/the-fish-tank/settings/pages).
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. If deployment protection restricts branches under **Settings → Environments → github-pages**, allow **main**. Approve a deployment if required by your chosen protection rules.
4. Open [Actions](https://github.com/Ahmed-Sleem/the-fish-tank/actions), select **Deploy Pages** and **Run workflow → main → Run workflow**. If Pages was enabled before installing the second file, that installation push can also start the deployment automatically.
5. Wait for both the verification/build job and deployment to turn green. On failure, open the failed step's log; do not assume the site is deployed.

Expected URL **after successful deployment**:

https://ahmed-sleem.github.io/the-fish-tank/

The deployment's environment link is authoritative. This setup guide is not evidence that the site is already live.

## How later updates work

These templates publish **main**, not a temporary Arena branch. Future work appears publicly after it is merged/pushed to main and verification/deployment succeeds. Use Arena's preview for immediate unmerged edits. This avoids changing workflows every time Arena starts a new session branch. No edits to branch names in these files are needed for this setup.

CI runs `npm ci`, installs a real Chromium browser and runs the repository's `npm run verify`. Only the verified `dist/` artifact is deployed; source files, credentials and `node_modules` are not uploaded to Pages.

## Cleanup

There is no ZIP in this handoff. The previously offered archive and untracked workflow files did not carry into the new checkout. The documentation copies remain here as a durable, downloadable recovery source; no duplicate active workflow files have been installed by this agent.
