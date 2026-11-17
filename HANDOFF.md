# Development handoff

Updated 2026-11-17 (Europe/Sofia).

## Current state

- Single plugin, `redmine_done_ratio_step`, version 1.0.4; no editions or variants.
- UI-only Ruby hooks, ERB settings, vanilla JavaScript, EN/BG locales.
- Default step 5; settings offer 1, 2, 5, 10, 20 and 25.
- No plugin migrations, extra gems, standalone server or build pipeline.
- Source baseline: release commit `d45604735d7741ab0c2932c5a3ba8753bfcfffe3`, tag `v1.0.4`.
- Repository organization changes do not change runtime behavior or plugin version.

## Repository layout

- `init.rb`, `app/`, `assets/`, `config/`, `lib/`: installable plugin source.
- `docs/TESTING.md`: local checks and pending host validation.
- `docs/archive/`: historical handoff, general engineering prompt, deployment script and runbook skill snapshot. Preserve for reference; not authoritative current deployment instructions.
- `release_packages/`: preserved historical ZIP and its provenance. No new release package has been generated.

The Git root is this directory. In the surrounding local workspace it is the child directory `redmine_done_ratio_step`. Use relative paths so future relocations require no configuration changes. The surrounding wrapper is not a Git repository.

## Validation and remaining work

Git integrity, Ruby syntax, JavaScript syntax and locale YAML parsing passed after relocation. No broken operational paths were identified. No staging or production approval evidence is available. No runtime compatibility claim follows from syntax checks.

Next priority: identify a Redmine test host and its exact versions, then run the checklist in `docs/TESTING.md`. Review suspected edge cases only after reproducing them. There is no approved feature backlog.

The old production script replaces the destination plugin and restarts Passenger. Do not run it without a separately approved deployment and verification of current environment facts. Its rollback example assumes a backup exists.

Development, deployment and release approval are separate: publishing this repository cleanup does not approve a runtime release or production deployment.
