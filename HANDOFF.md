# Development handoff

Updated 2026-11-24 (Europe/Sofia).

## Current state

- Single plugin, `redmine_done_ratio_step`. Version 1.0.7 was confirmed on staging and production on 2026-11-24. With step 5%, the saved 17% appears once, marked and disabled between 15% and 20%. The production Status menu also works with the Tracker filter.
- UI-only Ruby hooks, ERB settings, vanilla JavaScript, EN/BG locales.
- Default step 5; settings offer 1, 2, 5, 10, 20 and 25.
- No plugin migrations, extra gems, standalone server or build pipeline.
- The approved production payload corresponds to tag `v1.0.7`. Version 1.0.6 was a QA/staging candidate.
- Context-menu matching now requires a direct numeric `issue[done_ratio]` or `done_ratio` query parameter. Previously a substring inside `back_url` could select and corrupt the Status submenu on filtered lists.
- Added 9 dependency-free Node regression tests. All pass with the fix; 5 fail against the previous HEAD, reproducing the corruption.
- The user confirmed the 1.0.5 filtered-list fix on staging and production. With the Tracker filter applied on production, Status showed statuses and % Done showed percentages. The production ZIP in `release_packages/` is a byte-for-byte copy of the staging artifact.
- Independent QA improved from 26/30 browser fixture tests for 1.0.5 to 40/40 for 1.0.6 (30 existing and 10 new). All seven findings are closed in the retested ZIP, and 21/21 Ruby hook cases passed. The 1.0.6 QA and staging archives preserve the independently tested bytes.
- The production install reported a `/dev/fd` error while refreshing public assets, leaving the old fingerprinted JavaScript in use. After a targeted refresh, the HTTP response matched the JavaScript in the approved ZIP by SHA-256. The local install and rollback scripts now read the asset list from a regular file.

## Repository layout

- `init.rb`, `app/`, `assets/`, `config/`, `lib/`: installable plugin source.
- `docs/TESTING.md`: local checks and pending host validation.
- `docs/archive/`: historical handoff, general engineering prompt, deployment script and runbook skill snapshot. Preserve for reference; not authoritative current deployment instructions.
- `release_packages/`: production-approved ZIPs and package provenance.

The Git root is this directory. In the surrounding local workspace it is the child directory `redmine_done_ratio_step`. Use relative paths so future relocations require no configuration changes. The surrounding wrapper is not a Git repository.

## Validation and remaining work

Git integrity, Ruby syntax, JavaScript syntax and locale YAML parsing passed after relocation. The user confirmed the 1.0.5 context-menu fix on staging and production.

The 1.0.6 QA handoff covers DR-01 through DR-07 and the filtered-list regression. Version 1.0.7 supplies an off-grid stored value from the single-issue response. The production ZIP is a byte-for-byte copy of the confirmed 1.0.7 staging ZIP and is tracked in `release_packages/`. See `docs/PRODUCTION-1.0.7.md` and `docs/TESTING.md` for validation evidence.

The old production script replaces the destination plugin and restarts Passenger. Do not run it without a separately approved deployment and verification of current environment facts. Its rollback example assumes a backup exists.

The nine files in the installable ZIP match the tagged source byte for byte. The README and changelog retain the wording from packaging. This handoff records the later production approval.
