# Project handoff — Done Ratio Step (Percent Complete)

> Historical snapshot retained for provenance. File locations and pending migration instructions below describe the earlier wrapper layout. Read the repository-root `HANDOFF.md` for current organization and status.

Prepared 2026-11-17 (Europe/Sofia) for relocation to another Windows directory and continuation in a new Codex conversation.

## Evidence and authorization

- Verified facts below come from local source, documentation, archive inventory, and read-only Git inspection during this conversation.
- No earlier development conversation was available. Historical intent is inferred only where explicitly labeled; historical deployment, user acceptance, and successful runtime testing are not established by these files.
- The user requested this document only: no application/configuration changes, implementation, commits, pushes, resets, or branch changes. Those restrictions were respected. Stop after delivery and wait for confirmation.
- No existing HANDOFF.md or AGENTS.md was found in this project, or AGENTS.md in its checked ancestors (`C:\Codex Projects`, `C:\`). The root `.agents` directory was empty. `master-prompt.md` contains general engineering guidance; it is not evidence of an installed runtime or verified version support.
- The installed `redmine-plugin-engineering-practices` skill was consulted for documentation/handoff practices. It is external to this project and may need to be available in the next Codex session.

## 1. Project overview

The plugin changes Redmine's `% Done` / `Percent Complete` UI choices from default 10-point increments to a configurable step, defaulting to 5. It is UI-only: Redmine retains its own integer `done_ratio` storage and server-side permissions/validation.

Architecture and technologies:

- Ruby Redmine plugin registration and view hooks, Rails ERB settings partial, vanilla browser JavaScript, optional jQuery event integration, and English/Bulgarian YAML translations.
- `init.rb` registers plugin ID `redmine_done_ratio_step`, version `1.0.4`, minimum Redmine `4.2.0`, settings defaults enabled=`1`, step=`5`.
- `lib/redmine_done_ratio_step/hooks.rb` injects the JavaScript asset and JSON configuration through the page-head hook. The issue form hook supplies the stored issue percentage on the select element and through a legacy global fallback.
- `assets/javascripts/done_ratio_step.js` rebuilds issue/bulk dropdown choices and genuine nested context-menu percentage lists. It listens for DOMContentLoaded, turbo:load, jQuery AJAX completion/context-menu events, or a limited MutationObserver fallback.
- No plugin models, controllers, routes, database migrations, gem dependencies, package manager manifest, compilation pipeline, or standalone server were found.

Directory map (relative to this document):

| Path | Role |
| --- | --- |
| `redmine_done_ratio_step/` | Actual Git repository and installable plugin source |
| `redmine_done_ratio_step/.git/` | Complete nested Git metadata; preserve during copying |
| `redmine_done_ratio_step/app/views/settings/` | Admin configuration UI |
| `redmine_done_ratio_step/assets/javascripts/` | Browser behavior |
| `redmine_done_ratio_step/lib/` | Redmine view hooks |
| `redmine_done_ratio_step/config/locales/` | EN/BG translations |
| `redmine_done_ratio_step/README.md`, `CHANGELOG.md`, `LICENSE.txt` | Usage, historical release notes, license |
| `redmine_done_ratio_step-1.0.4.zip` | Existing installable archive outside Git |
| `deploy_done_ratio_step_to_prod.sh` | Existing Linux staging-to-production copy script outside Git |
| `master-prompt.md` | General Redmine engineering context outside Git |
| `.skill_build/gcr-redmine-plugin-runbooks/` | Local runbook skill/support files; auxiliary material, not plugin runtime |
| `.git/`, `.agents/` at wrapper root | Empty directories at inspection; wrapper is not a Git repository |
| `HANDOFF.md` | This document, outside the nested Git repository |

## 2. Current implementation status

Verified in source, not runtime-tested in this conversation:

- Enabled/disabled setting and selectable steps `1, 2, 5, 10, 20, 25`.
- Hook normalizes nonpositive step to 5 and caps step at 25; browser repeats normalization.
- New/edit issue and bulk-edit select detection; blank bulk choice retained.
- Preservation/preselection of stored percentages outside the configured increment grid.
- Nested issues-list context-menu reconstruction using an existing link as a template, preserving its other attributes.
- Version 1.0.4 guard skips root-level context-menu lists to avoid breaking layout when all issues are selected.
- EN/BG settings labels and help text.

Historical release notes describe 1.0.1 stored-value preservation, 1.0.2 context-menu support, 1.0.3 select-scoped fallback and canonical folder naming, and 1.0.4 layout protection. The available Git history contains one release commit, rather than separate commits for those fixes.

No partially implemented feature or approved feature backlog was identified. Pending work is migration verification and obtaining runtime validation evidence. Do not infer new implementation authorization from the review observations below.

## 3. Important decisions

- **UI-only extension:** documented in README and implemented through view hooks plus JS. No core view override, model patch, or storage change is present. Rationale inferred from architecture: keep installation/rollback small and preserve core Redmine behavior. No historical discussion explicitly rejecting alternatives is available.
- **Canonical directory and plugin ID:** deployment must use `plugins/redmine_done_ratio_step`, not a version-suffixed folder; README explicitly warns about this.
- **Stored-value preservation:** a non-grid current value must remain selectable to prevent a browser default causing accidental percentage changes. README records the original 0% regression.
- **Conservative context-menu modification:** only nested submenu lists are rebuilt; root lists are deliberately skipped to avoid layout corruption. Consequently some selection states may retain native percentage choices.
- **No plugin-specific database/gem installation:** source has no migrations or extra gem requirements. The enclosing Redmine installation supplies Rails, database access, and asset serving.
- **Line endings:** `.gitattributes` specifies LF for Ruby, ERB, JavaScript, YAML, Markdown, text, and shell files; local Git has `core.autocrlf=false`.
- No additional user-approved architectural decisions or rejected alternatives can be recovered from the visible conversation.

## 4. Current working state

Snapshot taken before creating this document:

| Item | Verified value |
| --- | --- |
| Wrapper directory | `C:\Codex Projects\Redmine Development\Done Ratio Step (Percent Complete) Plugin` |
| Actual repository | `C:\Codex Projects\Redmine Development\Done Ratio Step (Percent Complete) Plugin\redmine_done_ratio_step` |
| Active branch | `main`, tracking `origin/main` |
| HEAD | `d45604735d7741ab0c2932c5a3ba8753bfcfffe3` |
| Commit | `Release version 1.0.4`, 2026-05-24 14:08:53 +03:00 |
| Tag at HEAD | `v1.0.4` |
| Origin | `https://github.com/pavelstf/redmine_done_ratio_step.git` |
| Local comparison to cached origin/main | 0 ahead, 0 behind; no fetch performed, current remote state unknown |
| Working tree/index | Clean; no modified, staged, or untracked files in nested repository |
| Worktrees | One: nested repository path above, on main; no additional worktrees |

The only intended new file from this task is wrapper-root `HANDOFF.md`. It will not appear in nested `git status`. Wrapper artifacts (ZIP, deployment script, prompt, skill material, handoff) are not covered by the nested repository's Git status or a clone of that repository.

## 5. Environment and dependencies

- Development host: Windows/PowerShell. Ruby was found at `C:\Ruby34-x64\bin\ruby.exe`, Node at `C:\Program Files\nodejs\node.exe`, and a WindowsApps Bash launcher was found. Presence does not establish supported versions or a configured Linux runtime.
- README claims Redmine 4.2+ and says designed for 5.x. `master-prompt.md` mentions Redmine 5/6, Ruby 2.7/3, Rails 6/7, MariaDB/MySQL, and Passenger as broad context. None is a tested compatibility matrix. Actual deployment versions are unknown.
- No `.env`, virtual environment, local DB, Ruby version file, Gemfile/lockfile, JS dependency directory, or automated test suite was found in the project inventory.
- Plugin-specific environment variables: none referenced. `RAILS_ENV` is a host Redmine variable that may be needed for host commands; no value is required for local static checks. Script names `APP_USER_HOME`, `STAGING_ROOT`, `PROD_ROOT`, `PLUGIN_NAME`, `SRC`, `DST`, `BACKUP_DIR`, and `STAMP` are shell-local configuration variables, not credentials.

Static checks from the **nested repository**, after moving:

```powershell
ruby -c init.rb
ruby -c lib/redmine_done_ratio_step/hooks.rb
node --check assets/javascripts/done_ratio_step.js
git diff --check
```

These check syntax/whitespace only. There is no standalone build, startup, or test runner in this plugin. Do not invent `npm install`, `bundle install`, or a plugin migration requirement.

Installation into a separate, working Redmine test installation:

1. Copy the plugin source to `<RedmineRoot>/plugins/redmine_done_ratio_step` with `init.rb` directly inside that directory; avoid an extra nested plugin folder.
2. Follow that Redmine host's existing asset-serving procedure and restart its app server. README's Linux Passenger restart command is `touch tmp/restart.txt` from the Redmine root. This does not start Redmine on Windows.
3. Open Administration → Plugins → Done Ratio Step (Percent Complete) → Configure.
4. Use the manual checks in section 10. Host database and runtime configuration belong to the separate Redmine installation.

## 6. Known issues, limitations, and risks

- No automated tests or runtime validation evidence is present. Redmine 6 compatibility and behavior with installed themes/other plugins remain unverified.
- Context-menu selectors depend on Redmine HTML/URL structure. Version 1.0.4 intentionally leaves root-level percentage links unchanged; verify the all-selected case explicitly.
- Review observation, not a reproduced bug: backend/browser normalization accepts step values such as 3, although the settings UI only offers divisors of 100. Generated values stop at the largest multiple <=100; a tampered non-divisor step can omit 100 unless preserved as a current form value.
- Review observation, not a reproduced bug: context-menu reconstruction copies all non-href attributes from one template, potentially including state-specific attributes/classes. Check disabled/current-value behavior on the actual Redmine version.
- Review observation: without jQuery, the observer attaches only if `#context-menu` exists at DOMContentLoaded. Later insertion of the container may escape that fallback.
- Settings checkbox output has no explicit hidden off value; verify disable/save behavior against the host Redmine settings controller before asserting a bug.
- Legacy global stored-value fallback remains; select-scoped data is preferred. Test AJAX form refreshes and bulk-edit isolation.
- README Git-clone URL still contains `YOUR_GITHUB_USERNAME`; use the verified origin above.
- Existing production script replaces the destination plugin directory and restarts production. It lacks package SHA verification, a DB backup, or validation beyond a version grep. Its rollback example assumes a backup exists, although first install skips backup. Do not execute it as part of a local move; review against current environment facts before any separately authorized deployment.
- PowerShell commands emitted an `InitializeDefaultDrives` provider warning, while explicit workspace reads/Git commands succeeded. Cause was not investigated; this is not established as a project defect.

## 7. Recent work in this conversation

- Inspected source, README/changelog, plugin/Git configuration, wrapper prompt/deployment script, hidden directory layout, Git status/history/tags/worktrees, and ZIP entry names/hash.
- Distinguished wrapper directory from actual Git root and confirmed a clean nested release checkout.
- Created this migration handoff. No source/configuration changes, deployments, implementation, branch changes, commits, pushes, or remote fetches were performed.
- No syntax, browser, integration, or full Redmine tests were run during preparation. Source inspection establishes implementation presence, not successful execution.

## 8. Prioritized next steps

1. Wait for the user's confirmation before migration or further work.
2. Copy the entire wrapper, including hidden files, to the chosen destination; keep the source intact until verification passes. No destination has been supplied.
3. Open the copied wrapper in a new Codex conversation and ask it to read this file plus `master-prompt.md`, README, changelog, and any newly applicable ancestor AGENTS.md.
4. Verify nested Git HEAD/branch/status/worktree registration and archive hash, then run static checks.
5. Identify an existing Redmine test host and its actual versions/configuration; perform the manual behavior checks before making compatibility or production-readiness claims.
6. Only if separately requested, triage the review observations, improve tests/docs, or prepare a deployment. No feature/release/deployment task is currently approved.

## 9. Migration considerations

- Copy the wrapper, not just a fresh clone: the root handoff, ZIP, deployment script, prompt, and skill material would otherwise be lost. Include nested `.git` to retain history, refs, and local configuration.
- The wrapper's empty `.git` is not a usable repository. Run Git inside `redmine_done_ratio_step` or with `git -C`.
- Nested `.git` is a real directory, not a linked-worktree pointer. Local config has no `core.worktree` absolute path, and no additional linked worktrees were registered. Git should discover the moved checkout normally; verify rather than editing Git metadata preemptively.
- No reparse points/symlinks were found recursively. No local database/virtual environment was found to migrate.
- Local machine tools, external Codex skills, SSH keys/agents, Git credential helpers, host Redmine installation, and database are not bundled by this checkout. Do not copy secret values into this document or the repository.
- Fixed remote paths in the production script: `/home/gcrbgcaa`, `/home/gcrbgcaa/redminestaging`, `/home/gcrbgcaa/redmine`, `/home/gcrbgcaa/plugin-backups`; it prints `https://www.gcr.bg`. These are historical script contents, not newly verified environment facts. A Windows relocation does not imply changing remote paths.
- Auxiliary `.skill_build` content is not needed for plugin execution and was inventoried, not validated as current deployment guidance.
- Paths include spaces and parentheses: use PowerShell `-LiteralPath` or quote arguments. Preserve LF source conventions and check for new ancestor instructions in the destination.
- The new Codex conversation should not be assumed to inherit prior chat, approvals, working-directory registration, or external skills. This document supplies the available project context; no live application process was started by this task.

## 10. Verification checklist

From the copied wrapper root (read-only verification):

```powershell
Get-Item -LiteralPath .\HANDOFF.md
git -C .\redmine_done_ratio_step status --short --branch
git -C .\redmine_done_ratio_step rev-parse HEAD
git -C .\redmine_done_ratio_step tag --points-at HEAD
git -C .\redmine_done_ratio_step worktree list --porcelain
git -C .\redmine_done_ratio_step fsck --full
(Get-FileHash -LiteralPath .\redmine_done_ratio_step-1.0.4.zip -Algorithm SHA256).Hash
```

Expected: clean `main`, HEAD `d45604735d7741ab0c2932c5a3ba8753bfcfffe3`, tag `v1.0.4`, worktree path resolving to the destination. ZIP size is **8,422 bytes**; SHA-256 is **4062431F56F82E2266CB4F59574528FBA6B4DFD4A218365C3743C89CED928071**. ZIP entries use canonical top-level folder `redmine_done_ratio_step/`; exact source/archive byte equivalence was not checked.

- [ ] All wrapper files and nested hidden Git metadata copied; source retained.
- [ ] Git checks above match expected identity and show no unexpected changes.
- [ ] ZIP hash/size match; important file inventory matches source.
- [ ] Ruby/Node syntax and whitespace checks in section 5 pass.
- [ ] Test host recognizes version 1.0.4 and serves plugin JS without browser/server errors.
- [ ] Default 5-point choices work on new/edit issue forms; saving a chosen value succeeds.
- [ ] Stored off-grid percentage remains selected and unchanged when saving unrelated fields.
- [ ] Bulk edit retains its blank/no-change option and does not inherit an unrelated issue's stored percentage.
- [ ] Each offered step works, including 0% and 100%; enabled/disabled setting survives save/reload.
- [ ] Context menu works for one, multiple, and all selected issues without layout corruption; permissions and disabled/current selections behave correctly.
- [ ] AJAX updates and EN/BG settings render correctly on the target host.
- [ ] New Codex session has read this handoff; any subsequent work has appropriate user authorization.

**Readiness:** ready to copy as a local source/documentation workspace, subject to user confirmation. This is not a claim of runtime, compatibility, or deployment validation. No migration has been performed.
