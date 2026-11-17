---
name: gcr-redmine-plugin-runbooks
description: Generate manual deployment, update, rollback, and validation runbooks for Redmine plugins in GCR staging and production. Use when Codex must prepare copy-paste terminal instructions for a user to execute, adapting commands to the current plugin, version, zip file, target environment, migrations, assets, and rollback needs without running remote deployment actions itself.
---

# GCR Redmine Plugin Runbooks

Use this skill to prepare manual runbooks for Redmine plugin work in GCR environments. Do not deploy directly. Generate instructions and command blocks for the user to paste into their terminal.

## Core Rules

- Never execute staging or production deployment commands yourself.
- Always generate a complete copy-pasteable shell block for the user.
- Every shell block must start with `clear`.
- Use the exact GCR environment parameters in `references/environments.md`.
- Adapt every runbook to the current plugin and target action.
- For production, always include backup, install/update, migrations, asset copy if needed, Passenger restart, version verification, log/error checks, and rollback instructions.
- Do not assume the plugin folder is a Git repository.
- Do not assume the plugin has no migrations or no assets. Discover first.
- Do not assume production Ruby env is `/home/gcrbgcaa/rubyvenv/redmine/3.2`; production uses a special env name.

## Required Discovery

Before producing a runbook, identify:

- target environment: `staging` or `production`;
- action: first install, update, rollback, validation, or GitHub-based install;
- plugin folder name;
- plugin id from `Redmine::Plugin.register`;
- plugin version from `init.rb`;
- zip filename to upload;
- whether the plugin has `db/migrate`;
- whether the plugin has `assets/stylesheets`, `assets/javascripts`, or `assets/images`;
- whether special README install notes exist.

Use `references/discovery.md` for commands and interpretation.

## Output Format

When preparing install/update instructions, output:

1. `Target`
2. `ZIP File`
3. `Upload To`
4. `Expected Version`
5. `Commands To Paste`
6. `Rollback Commands`
7. `Manual Validation Checklist`

The command blocks must use concrete values, not placeholders, except for rollback backup filenames that are only known after the user runs the install block. When a value is unknown, ask one concise question before generating the runbook.

## References

- Read `references/environments.md` for fixed GCR staging and production paths, URLs, virtualenvs, upload directory, backup directory, restart method, and log locations.
- Read `references/discovery.md` before adapting a runbook to a plugin.
- Read `references/runbook-templates.md` when generating install, update, rollback, or validation command blocks.
- Read `references/troubleshooting.md` when logs, Passenger errors, Bundler issues, migrations, assets, or Redmine plugin loading problems are involved.
