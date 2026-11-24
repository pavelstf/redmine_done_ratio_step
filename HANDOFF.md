# Development handoff

Updated 2026-11-24 (Europe/Sofia).

## Current state

- Single plugin, `redmine_done_ratio_step`, version 1.0.5; no editions or variants.
- UI-only Ruby hooks, ERB settings, vanilla JavaScript, EN/BG locales.
- Default step 5; settings offer 1, 2, 5, 10, 20 and 25.
- No plugin migrations, extra gems, standalone server or build pipeline.
- Release source: tag `v1.0.5`. The nine files in the approved ZIP are the source of truth for the installable payload.
- Context-menu matching now requires a direct numeric `issue[done_ratio]` or `done_ratio` query parameter. Previously a substring inside `back_url` could select and corrupt the Status submenu on filtered lists.
- Added 9 dependency-free Node regression tests. All pass with the fix; 5 fail against the previous HEAD, reproducing the corruption.
- The user confirmed 1.0.5 on staging and production. With the Tracker filter applied on production, Status showed statuses and % Done showed percentages. The production ZIP in `release_packages/` is a byte-for-byte copy of the staging artifact. The extra submenu guard in the working tree was developed separately and is absent from both ZIP files. Keep the approved 1.0.5 bytes intact.
- The production install reported a `/dev/fd` error while refreshing public assets, leaving the old fingerprinted JavaScript in use. After a targeted refresh, the HTTP response matched the JavaScript in the approved ZIP by SHA-256. The local install and rollback scripts now read the asset list from a regular file.

## Repository layout

- `init.rb`, `app/`, `assets/`, `config/`, `lib/`: installable plugin source.
- `docs/TESTING.md`: local checks and pending host validation.
- `docs/archive/`: historical handoff, general engineering prompt, deployment script and runbook skill snapshot. Preserve for reference; not authoritative current deployment instructions.
- `release_packages/`: production-approved 1.0.5 ZIP, historical 1.0.4 ZIP and package provenance.

The Git root is this directory. In the surrounding local workspace it is the child directory `redmine_done_ratio_step`. Use relative paths so future relocations require no configuration changes. The surrounding wrapper is not a Git repository.

## Validation and remaining work

Git integrity, Ruby syntax, JavaScript syntax and locale YAML parsing passed after relocation. The user confirmed the 1.0.5 context-menu fix on staging and production.

The QA handoff covers the original filtered-list regression and related scenarios. See `docs/QA-1.0.5.md` for the test plan.

The old production script replaces the destination plugin and restarts Passenger. Do not run it without a separately approved deployment and verification of current environment facts. Its rollback example assumes a backup exists.

The original installable files retain the exact contents of the approved ZIP, including the packaging-era README and changelog wording. This handoff records the later approval.
