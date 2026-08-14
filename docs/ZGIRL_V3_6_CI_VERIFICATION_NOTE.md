# Z-Girl v3.6 CI Verification Note

This commit freezes the current v3.6 tenant-governance release candidate for independent GitHub Actions build verification.

The pull request is temporarily targeted to `main` only because the repository release workflows are configured to run for pull requests whose base is `main`. After the exact-head build gates complete, the pull request must be restored to the verified v3.5 branch.

No production merge is authorized by this verification commit.

Vercel Preview remains intentionally suppressed while the stacked release chain is held.
