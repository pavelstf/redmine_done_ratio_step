# Staging candidate 1.0.5 — 2026-11-24

State: staging-approved by the user after rechecking 1.0.5. The initial check showed percentage options in the Status submenu. The user suspects caching, but the served asset from that initial check was not captured. Retain this package and its checksum as the record of the tested candidate.

- ZIP: `staging_packages/redmine_done_ratio_step-1.0.5-staging-20261124.zip`
- Bytes: 8202
- SHA-256: `cf2aaaa53b92a5e01b85450adc9ee67bb1ac4800d4b9e15ff04ce2027198da16`
- 9 entries; one root `redmine_done_ratio_step/`; every entry byte-compared with its source.
- Excludes `.git`, local skills, tests, scripts, release packages and archived documentation.
- Ruby syntax, JavaScript syntax and 9 Node regression tests pass. Host/browser validation remains pending.
- No migrations, extra gems or dependent plugins.

Upload the ZIP and `scripts/staging-install-1.0.5.sh`, `scripts/staging-rollback-1.0.5.sh` to `/home/gcrbgcaa/redminestaging/plugins/`.

Install/update (requires an existing non-symlink plugin directory; preserves code backup and settings):

```bash
clear
bash /home/gcrbgcaa/redminestaging/plugins/staging-install-1.0.5.sh
```

Rollback to the backup recorded by the last install; also preserves the replaced code:

```bash
clear
bash /home/gcrbgcaa/redminestaging/plugins/staging-rollback-1.0.5.sh
```

Scripts verify the package, back up code, refresh ordinary and existing fingerprinted JavaScript assets, validate the Rails registry and restart Passenger. No database changes are needed. They use `RAILS_ENV=production` for the staging Rails instance, as configured on GCR. Backup files stay in staging `plugins/`. The last-backup marker refers to the most recent successful backup operation, including repeated installs.

Hard-refresh the browser (Ctrl+F5). In staging, repeat the reported Tracker filter with `% Done` as a visible column, then test a `% Done` filter, clear/reapply filters, single/multiple/all selection, and reopen the menu. Status must retain status labels/actions and `% Done` must contain percentage actions. Confirm the chosen action updates the intended field and preserves the filtered return list. Also check ordinary issue forms and bulk edit. See `TESTING.md`.

Local reproducibility/check commands (from this repository root):

```powershell
clear
node --test test/javascript/context_menu_test.cjs
node --check assets/javascripts/done_ratio_step.js
& "$env:LOCALAPPDATA/Python/bin/python.exe" scripts/package_staging.py
Get-FileHash staging_packages/redmine_done_ratio_step-1.0.5-staging-20261124.zip -Algorithm SHA256
git diff --check
```

Do not change package files after staging approval; production promotion should reuse approved bytes.
