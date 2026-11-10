# GitHub Pages workflows — installed

The owner has installed both files at the correct paths:

- [Verification workflow](../../.github/workflows/ci.yml)
- [Pages workflow](../../.github/workflows/pages.yml)

These installed files are the **single source of truth**. The old copies here were moved, not lost; no ZIP, duplicate template or further upload is needed. To download a backup, open the links above on GitHub and choose **Download raw file**.

Pages is configured to use **GitHub Actions**. The first run failed during project verification because our docs checker still required the old copies in this folder. The checker and stale links are being corrected; tests must still pass before deployment. See [deployment operations](../DEPLOYMENT.md) for diagnosis, release and rerun instructions.
