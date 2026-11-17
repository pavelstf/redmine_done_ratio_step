# Troubleshooting

## `bundle: command not found`

The Ruby virtualenv is not active. The runbook must include:

```bash
source "$VENV_PATH/bin/activate"
```

Use the exact environment path from `environments.md`.

## Production Virtualenv Name

Production uses:

```bash
/home/gcrbgcaa/rubyvenv/redmine612build/3.2
```

Do not use `/home/gcrbgcaa/rubyvenv/redmine/3.2` unless the user confirms a server change.

## Passenger 500 Page

A browser Passenger 500 page is not enough to identify root cause. Ask the user for:

```bash
cd "$REDMINE_ROOT"
tail -n 250 log/production.log
grep -n -E "Completed 500|FATAL|ERROR|Exception|NoMethodError|NameError|ActionView|LoadError|SyntaxError" log/production.log | tail -n 120
```

If Rails logs show no 500, the error may be Passenger/web-server level or a different vhost/URL.

## Do Not Blame The Current Plugin Automatically

Always inspect the exception namespace and stack trace. A known unrelated staging pattern is:

```text
NameError (uninitialized constant EasyGanttPro::IssuesControllerPatch::InstanceMethods::RequestStore)
```

This points to `EasyGanttPro`, not necessarily the plugin being deployed.

## Assets

Some Redmine plugin assets are available through plugin asset paths, but GCR runbooks should still include guarded copy blocks for:

```text
assets/stylesheets
assets/javascripts
assets/images
```

The guarded blocks are safe when directories do not exist.

## Migrations

Even UI-only plugins can safely run:

```bash
bundle exec rake redmine:plugins:migrate RAILS_ENV=production
```

Mention when discovery finds no `db/migrate`, but keep the command in generated runbooks unless the user asks for a minimal no-migration flow.

## Zip Structure

The zip must contain the top-level plugin folder:

```text
<plugin_name>/
  init.rb
  ...
```

If the zip extracts directly to files without the plugin folder, the install block must fail instead of copying an ambiguous structure.
