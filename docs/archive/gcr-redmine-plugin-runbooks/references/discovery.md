# Plugin Discovery

Run discovery locally in the plugin project before preparing a GCR runbook.

## Identify Plugin Folder

Prefer the current workspace folder if it contains `init.rb`. Otherwise search:

```powershell
rg --files | rg '(^|/)init\.rb$'
```

The deploy folder must match the canonical Redmine plugin folder, usually the project directory name and the plugin id.

## Identify Plugin Id And Version

Read `init.rb` and extract:

```ruby
Redmine::Plugin.register :plugin_id
version 'x.y.z'
```

Use:

```powershell
Select-String -Path init.rb -Pattern 'Redmine::Plugin.register|version '
```

Set:

```bash
PLUGIN_NAME="<folder-name>"
PLUGIN_ID="<plugin-id-without-leading-colon>"
EXPECTED_VERSION="<version-from-init-rb>"
```

If `PLUGIN_NAME` and `PLUGIN_ID` differ, preserve both. File paths use `PLUGIN_NAME`; `rails runner` verification uses `PLUGIN_ID`.

## Detect Migrations

Check:

```powershell
Test-Path db/migrate
Get-ChildItem -Recurse db/migrate -ErrorAction SilentlyContinue
```

Even if no migrations exist, the standard runbook may still run:

```bash
bundle exec rake redmine:plugins:migrate RAILS_ENV=production
```

This is acceptable as a sanity step. Mention when the plugin has no migrations.

## Detect Assets

Check for:

```text
assets/stylesheets
assets/javascripts
assets/images
```

If present, include public asset copy commands in the runbook:

```bash
public/plugin_assets/$PLUGIN_NAME/stylesheets
public/plugin_assets/$PLUGIN_NAME/javascripts
public/plugin_assets/$PLUGIN_NAME/images
```

If no asset type exists, omit that copy block or keep guarded `if [ -d ... ]` blocks.

## Zip Naming

Use:

```text
<plugin_name>-<version>-<target_env>-<YYYYMMDD>.zip
```

Examples:

```text
redmine_done_ratio_step-1.0.4-production-20260624.zip
redmine_project_time_budget_risk_monitor-0.1.44-staging-20260624.zip
```

If the user already has a zip filename, use it exactly.

## GitHub And Server Folder Notes

Do not assume server plugin folders are Git clones. Before suggesting `git pull`, require the user to confirm or run:

```bash
cd "$REDMINE_ROOT/plugins/$PLUGIN_NAME"
git status
```

For the default zip workflow, do not require Git on the server.
