# Development handoff

Updated 2026-11-24 (Europe/Sofia).

## Current state

- Single plugin, `redmine_done_ratio_step`. Version 1.0.7 was confirmed on staging and production on 2026-11-24. With step 5%, the saved 17% appears once, marked and disabled between 15% and 20%. The production Status menu also works with the Tracker filter.
- UI-only Ruby hooks, ERB settings, vanilla JavaScript, EN/BG locales.
- Default step 5; settings offer 1, 2, 5, 10, 20 and 25.
- No plugin migrations, extra gems, standalone server or build pipeline.
- The approved production payload was published to `origin/main` at commit `eb1e5f6f5be1c8f6faefa45c4f5ee27ea6572b7d` with tag `v1.0.7`. Version 1.0.6 was a QA/staging candidate.
- Context-menu matching now requires a direct numeric `issue[done_ratio]` or `done_ratio` query parameter. Previously a substring inside `back_url` could select and corrupt the Status submenu on filtered lists.
- The 1.0.7 release passed all 21 dependency-free JavaScript regression tests and the Ruby hook checks. The production HTTP response for the JavaScript matched the packaged file by SHA-256.
- The user confirmed the 1.0.5 filtered-list fix on staging and production. With the Tracker filter applied on production, Status showed statuses and % Done showed percentages. The production ZIP in `release_packages/` is a byte-for-byte copy of the staging artifact.
- Independent QA improved from 26/30 browser fixture tests for 1.0.5 to 40/40 for 1.0.6 (30 existing and 10 new). All seven findings are closed in the retested ZIP, and 21/21 Ruby hook cases passed. The 1.0.6 QA and staging archives preserve the independently tested bytes.
- During the 1.0.5 production install, a `/dev/fd` error left the old fingerprinted JavaScript in use. The current install and rollback scripts read the asset list from a regular file and the 1.0.7 script verifies the JavaScript over HTTP.

## Repository layout

- `init.rb`, `app/`, `assets/`, `config/`, `lib/`: installable plugin source.
- `docs/TESTING.md`: local checks and pending host validation.
- `docs/archive/`: historical handoff, general engineering prompt, deployment script and runbook skill snapshot. Preserve for reference; not authoritative current deployment instructions.
- `release_packages/`: production-approved ZIPs and package provenance.

The Git root is this directory. In the surrounding local workspace it is the child directory `redmine_done_ratio_step`. Use relative paths so future relocations require no configuration changes. The surrounding wrapper is not a Git repository.

## Packages and QA records

| Item | Location |
| --- | --- |
| 1.0.7 production ZIP in the repository | [release_packages/redmine_done_ratio_step-1.0.7-production-20261124.zip](release_packages/redmine_done_ratio_step-1.0.7-production-20261124.zip) |
| 1.0.7 production delivery | [Production-v1.0.7](../Production-v1.0.7/) contains the ZIP, SHA-256 file, runbook and install/rollback script. |
| 1.0.7 staging delivery | [Staging-v1.0.7](../Staging-v1.0.7/) contains the identical ZIP under its staging name, SHA-256 file, runbook and script. |
| 1.0.6 staging and QA deliveries | [Staging-v1.0.6](../Staging-v1.0.6/) and [QA-v1.0.6](../QA-v1.0.6/), including the [1.0.6 QA report](../QA-v1.0.6/QA_Report_redmine_done_ratio_step_1.0.6.pdf). |
| 1.0.5 QA delivery | [QA-v1.0.5](../QA-v1.0.5/), including the [1.0.5 QA report](../QA-v1.0.5/QA_Report_redmine_done_ratio_step_1.0.5.pdf). |
| Archived 1.0.5 staging packager | [package_staging.py](../QA-v1.0.5/scripts/package_staging.py) and its [original instructions](../QA-v1.0.5/STAGING-1.0.5.md), copied byte for byte from the stash. These are historical references. The script expects the 1.0.5 source tree. |

The links above to sibling folders refer to the local workspace. The repository also retains the [1.0.5 production ZIP](release_packages/redmine_done_ratio_step-1.0.5-production-20261124.zip) and [package provenance](release_packages/README.md).

The confirmed 1.0.7 staging and production ZIPs contain the same nine files, total 9,977 bytes per ZIP. SHA-256: `1b10c111e283e1e6b884c30681752ed8f4f2842b8875c5f839726003216184d8`.

## Local cleanup

- The temporary worktree `.release-v1.0.5` and branch `local/context-menu-guard` were removed after verifying that both matched `main` at `v1.0.7`. The primary worktree is the only one remaining.
- `stash@{0}` was dropped after verifying the archived packager and instructions against the stash bytes. The stash list is empty.
- Package, checksum and QA PDF files were preserved. This handoff update is local.

## Validation and remaining work

Git integrity, Ruby syntax, JavaScript syntax and locale YAML parsing passed after relocation. The user confirmed the 1.0.5 context-menu fix on staging and production.

The 1.0.6 QA handoff covers DR-01 through DR-07 and the filtered-list regression. Version 1.0.7 supplies an off-grid stored value from the single-issue response. The production ZIP is a byte-for-byte copy of the confirmed 1.0.7 staging ZIP and is tracked in `release_packages/`. See `docs/PRODUCTION-1.0.7.md` and `docs/TESTING.md` for validation evidence.

The old production script replaces the destination plugin and restarts Passenger. Do not run it without a separately approved deployment and verification of current environment facts. Its rollback example assumes a backup exists.

The nine files in the installable ZIP match the tagged source byte for byte. The README and changelog retain the wording from packaging. This handoff records the later production approval.
