# Runbook Templates

Generate concrete shell blocks by filling in values discovered from the current plugin and selected environment. Every block must start with `clear`.

## Install Or Update From Uploaded Zip

Use this for both first install and repeated install/update. It backs up the existing plugin if present and handles first install if absent.

```bash
clear
set -euo pipefail

TARGET_ENV="<staging-or-production>"
PLUGIN_NAME="<plugin-folder-name>"
PLUGIN_ID="<plugin-id>"
ZIP_FILE="<zip-file-name>"
EXPECTED_VERSION="<version>"

REDMINE_ROOT="<redmine-root>"
VENV_PATH="<venv-path>"
UPLOAD_DIR="/home/gcrbgcaa/uploads"
BACKUP_DIR="/home/gcrbgcaa/plugin-backups"
STAMP="$(date +%Y%m%d-%H%M%S)"

echo "== Activating Ruby virtualenv =="
source "$VENV_PATH/bin/activate"

echo "== Checking uploaded zip =="
test -f "$UPLOAD_DIR/$ZIP_FILE"

echo "== Current installed version, if any =="
if [ -f "$REDMINE_ROOT/plugins/$PLUGIN_NAME/init.rb" ]; then
  grep -n "version" "$REDMINE_ROOT/plugins/$PLUGIN_NAME/init.rb" || true
else
  echo "Plugin is not currently installed."
fi

echo "== Creating backup if plugin exists =="
mkdir -p "$BACKUP_DIR"
if [ -d "$REDMINE_ROOT/plugins/$PLUGIN_NAME" ]; then
  tar -czf "$BACKUP_DIR/${PLUGIN_NAME}-${TARGET_ENV}-backup-${STAMP}.tar.gz" -C "$REDMINE_ROOT/plugins" "$PLUGIN_NAME"
  echo "Backup: $BACKUP_DIR/${PLUGIN_NAME}-${TARGET_ENV}-backup-${STAMP}.tar.gz"
fi

echo "== Extracting zip to temporary directory =="
TMP_DIR="/tmp/${PLUGIN_NAME}-${STAMP}"
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
unzip -q "$UPLOAD_DIR/$ZIP_FILE" -d "$TMP_DIR"

echo "== Installing plugin =="
rm -rf "$REDMINE_ROOT/plugins/$PLUGIN_NAME"

if [ -d "$TMP_DIR/$PLUGIN_NAME" ]; then
  cp -a "$TMP_DIR/$PLUGIN_NAME" "$REDMINE_ROOT/plugins/$PLUGIN_NAME"
else
  echo "ERROR: Expected folder '$PLUGIN_NAME' inside zip."
  echo "Contents of zip extraction:"
  find "$TMP_DIR" -maxdepth 3 -type d
  exit 1
fi

echo "== Running plugin migrations =="
cd "$REDMINE_ROOT"
bundle exec rake redmine:plugins:migrate RAILS_ENV=production

echo "== Copying plugin assets if present =="
if [ -d "plugins/$PLUGIN_NAME/assets/stylesheets" ]; then
  mkdir -p "public/plugin_assets/$PLUGIN_NAME/stylesheets"
  cp -a plugins/$PLUGIN_NAME/assets/stylesheets/. "public/plugin_assets/$PLUGIN_NAME/stylesheets/"
fi

if [ -d "plugins/$PLUGIN_NAME/assets/javascripts" ]; then
  mkdir -p "public/plugin_assets/$PLUGIN_NAME/javascripts"
  cp -a plugins/$PLUGIN_NAME/assets/javascripts/. "public/plugin_assets/$PLUGIN_NAME/javascripts/"
fi

if [ -d "plugins/$PLUGIN_NAME/assets/images" ]; then
  mkdir -p "public/plugin_assets/$PLUGIN_NAME/images"
  cp -a plugins/$PLUGIN_NAME/assets/images/. "public/plugin_assets/$PLUGIN_NAME/images/"
fi

echo "== Restarting Redmine via Passenger =="
touch tmp/restart.txt

echo "== Verifying installed plugin version =="
RAILS_ENV=production bundle exec rails runner "puts Redmine::Plugin.find(:$PLUGIN_ID).version"

echo "== Expected version =="
echo "$EXPECTED_VERSION"

echo "== Recent error check =="
grep -n -E "Completed 500|FATAL|ERROR|Exception|NoMethodError|NameError|ActionView|LoadError|SyntaxError" log/production.log | tail -n 80 || true

echo "== Done =="
```

## Rollback From Backup

Generate this as a separate block after install/update instructions. Use the backup file printed by the install/update block.

```bash
clear
set -euo pipefail

TARGET_ENV="<staging-or-production>"
PLUGIN_NAME="<plugin-folder-name>"
PLUGIN_ID="<plugin-id>"
BACKUP_FILE="/home/gcrbgcaa/plugin-backups/<backup-file-name>.tar.gz"

REDMINE_ROOT="<redmine-root>"
VENV_PATH="<venv-path>"

echo "== Activating Ruby virtualenv =="
source "$VENV_PATH/bin/activate"

echo "== Checking backup file =="
test -f "$BACKUP_FILE"

echo "== Restoring plugin from backup =="
cd "$REDMINE_ROOT"
rm -rf "plugins/$PLUGIN_NAME"
tar -xzf "$BACKUP_FILE" -C plugins

echo "== Running plugin migrations after rollback =="
bundle exec rake redmine:plugins:migrate RAILS_ENV=production

echo "== Restarting Redmine via Passenger =="
touch tmp/restart.txt

echo "== Verifying restored plugin version =="
RAILS_ENV=production bundle exec rails runner "puts Redmine::Plugin.find(:$PLUGIN_ID).version"

echo "== Recent error check =="
grep -n -E "Completed 500|FATAL|ERROR|Exception|NoMethodError|NameError|ActionView|LoadError|SyntaxError" log/production.log | tail -n 80 || true

echo "== Rollback done =="
```

## Validation Only

Use when the user already deployed and wants checks.

```bash
clear
set -euo pipefail

PLUGIN_NAME="<plugin-folder-name>"
PLUGIN_ID="<plugin-id>"
EXPECTED_VERSION="<version>"

REDMINE_ROOT="<redmine-root>"
VENV_PATH="<venv-path>"

source "$VENV_PATH/bin/activate"
cd "$REDMINE_ROOT"

echo "== Plugin init.rb version =="
grep -n "version" "plugins/$PLUGIN_NAME/init.rb"

echo "== Redmine registered plugin version =="
RAILS_ENV=production bundle exec rails runner "puts Redmine::Plugin.find(:$PLUGIN_ID).version"

echo "== Expected version =="
echo "$EXPECTED_VERSION"

echo "== Recent request log =="
tail -n 80 log/production.log

echo "== Recent error check =="
grep -n -E "Completed 500|FATAL|ERROR|Exception|NoMethodError|NameError|ActionView|LoadError|SyntaxError" log/production.log | tail -n 80 || true
```

## Output Notes

Before each command block, state:

```text
Upload this zip file:
<zip-file-name>

Upload it to:
/home/gcrbgcaa/uploads/<zip-file-name>

Target:
<staging-or-production>

Expected version:
<version>
```
