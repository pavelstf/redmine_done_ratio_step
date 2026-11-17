#!/usr/bin/env bash
set -euo pipefail

APP_USER_HOME="/home/gcrbgcaa"
STAGING_ROOT="$APP_USER_HOME/redminestaging"
PROD_ROOT="$APP_USER_HOME/redmine"
PLUGIN_NAME="redmine_done_ratio_step"

SRC="$STAGING_ROOT/plugins/$PLUGIN_NAME"
DST="$PROD_ROOT/plugins/$PLUGIN_NAME"
BACKUP_DIR="$APP_USER_HOME/plugin-backups"
STAMP="$(date +%Y%m%d-%H%M%S)"

echo "== Deploying $PLUGIN_NAME from staging to production =="

if [ ! -d "$SRC" ]; then
  echo "ERROR: Source plugin not found: $SRC"
  exit 1
fi

if [ ! -d "$PROD_ROOT" ]; then
  echo "ERROR: Production Redmine root not found: $PROD_ROOT"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "== Source version =="
grep -n "version" "$SRC/init.rb" || true

echo "== Backing up current production plugin =="
if [ -d "$DST" ]; then
  tar -czf "$BACKUP_DIR/${PLUGIN_NAME}-prod-backup-${STAMP}.tar.gz" -C "$PROD_ROOT/plugins" "$PLUGIN_NAME"
  echo "Backup created: $BACKUP_DIR/${PLUGIN_NAME}-prod-backup-${STAMP}.tar.gz"
else
  echo "No existing production plugin found; skipping backup."
fi

echo "== Replacing production plugin =="
rm -rf "$DST"
cp -a "$SRC" "$DST"

echo "== Verifying copied version =="
grep -n "version" "$DST/init.rb" || true

echo "== Restarting production Redmine via Passenger =="
touch "$PROD_ROOT/tmp/restart.txt"

echo "== Done =="
echo "Check production:"
echo "  https://www.gcr.bg"
echo
echo "Check logs:"
echo "  cd $PROD_ROOT && tail -n 120 log/production.log"
echo
echo "Rollback command if needed:"
echo "  cd $PROD_ROOT && rm -rf plugins/$PLUGIN_NAME && tar -xzf $BACKUP_DIR/${PLUGIN_NAME}-prod-backup-${STAMP}.tar.gz -C plugins && touch tmp/restart.txt"