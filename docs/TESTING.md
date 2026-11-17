# Verification

Run from the repository root:

```powershell
ruby -c init.rb
ruby -c lib/redmine_done_ratio_step/hooks.rb
node --check assets/javascripts/done_ratio_step.js
ruby -rpsych -e 'Dir["config/locales/*.yml"].each { |f| Psych.parse_file(f); puts "YAML OK: #{f}" }'
git diff --check
```

These are syntax and whitespace checks. There is no automated suite or standalone application in this repository. Do not install dependencies or run migrations solely for this plugin.

On 2026-11-17 the Ruby and YAML checks passed with Ruby 3.4.8, and JavaScript syntax passed with Node 24.18.0. Git integrity passed. Ruby required execution outside the Codex sandbox. These tool versions are not a Redmine compatibility matrix.

## Pending Redmine validation

Record the host's Redmine, Ruby, Rails, theme and relevant plugin versions before testing. Install source under `plugins/redmine_done_ratio_step` using the host's existing asset and restart procedure.

- Verify plugin 1.0.4 is recognized and its JavaScript asset loads without errors.
- Check new/edit forms, each supported step, 0 and 100, and saving a chosen percentage.
- Preserve off-grid stored percentages when saving unrelated fields.
- Retain the blank/no-change bulk-edit option and isolate it from issue-form fallback state.
- Save/reload enabled and disabled settings.
- Check context menus for one, multiple and all selected issues, including current/disabled choices and permissions. Root-level lists are deliberately left unchanged.
- Check AJAX refreshes and EN/BG settings.

## Review observations awaiting reproduction

- A manually supplied non-divisor step such as 3 can omit 100.
- Context-menu reconstruction copies template state attributes/classes.
- Without jQuery, a context-menu container inserted after DOMContentLoaded may escape observation.
- The settings checkbox has no explicit hidden off value; verify actual controller behavior.
- Verify the legacy global stored-value fallback during AJAX and bulk-edit flows.

No staging or production validation has been claimed.
