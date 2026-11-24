#!/usr/bin/env bash
clear
set -eo pipefail

action=${1:-}
case "$action" in
  install|rollback) ;;
  *) echo "Usage: bash $0 {install|rollback}" >&2; exit 2 ;;
esac

root=/home/gcrbgcaa/redmine
url=https://redmine.gcr.bg
plugin=redmine_done_ratio_step
version=1.0.7
zip="plugins/$plugin-$version-production-20261124.zip"
sha=1b10c111e283e1e6b884c30681752ed8f4f2842b8875c5f839726003216184d8
marker="plugins/$plugin-production-$version-last-backup.txt"
current="plugins/$plugin"
stamp="$(date +%Y%m%d-%H%M%S)-$$"

source /home/gcrbgcaa/rubyvenv/redmine612build/3.2/bin/activate
set -u
cd "$root"
test -f "$current/init.rb"
test ! -L "$current"
test -d tmp

work=$(mktemp -d "$root/.done-ratio-step-1.0.7.XXXXXXXX")
cleanup() {
  local status=$?
  rm -rf -- "$work"
  if [ "$status" -ne 0 ]; then
    echo "ERROR: $action stopped before successful Rails/HTTP verification." >&2
    if [ -s "$marker" ]; then
      echo "Saved rollback backup: $(cat "$marker")" >&2
    fi
  fi
}
trap cleanup EXIT
mkdir "$work/extracted"
candidate="$work/extracted/$plugin"

case "$action" in
  install)
    printf '%s  %s\n' "$sha" "$zip" | sha256sum -c -
    if grep -Fq "version '$version'" "$current/init.rb"; then
      echo "ERROR: $version is already installed. The previous rollback pointer was preserved." >&2
      exit 1
    fi
    unzip -q "$zip" -d "$work/extracted"
    grep -Fq "version '$version'" "$candidate/init.rb"
    backup="$root/plugins/$plugin-production-$version-backup-$stamp.tar.gz"
    ;;
  rollback)
    restore=$(cat "$marker")
    case "$restore" in
      "$root/plugins/$plugin-production-$version-backup-"*.tar.gz) ;;
      *) echo "ERROR: Unexpected rollback archive path" >&2; exit 1 ;;
    esac
    test -f "$restore"
    test ! -L "$restore"
    tar -xzf "$restore" -C "$work/extracted"
    echo "Restoring: $restore"
    backup="$root/plugins/$plugin-production-$version-before-rollback-$stamp.tar.gz"
    ;;
esac

test -f "$candidate/init.rb"
test -s "$candidate/assets/javascripts/done_ratio_step.js"
ruby -c "$candidate/init.rb"
ruby -c "$candidate/lib/$plugin/hooks.rb"
tar -czf "$backup" -C plugins "$plugin"
tar -tzf "$backup" > "$work/backup.list"
grep -Fxq "$plugin/init.rb" "$work/backup.list"
echo "Backup: $backup"
if [ "$action" = install ]; then
  printf '%s\n' "$backup" > "$work/last-backup"
  mv -f -- "$work/last-backup" "$marker"
fi

mv -- "$current" "$work/previous"
if ! mv -- "$candidate" "$current"; then
  mv -- "$work/previous" "$current"
  exit 1
fi

source_js="$current/assets/javascripts/done_ratio_step.js"
legacy="public/plugin_assets/$plugin/javascripts/done_ratio_step.js"
mkdir -p "$(dirname "$legacy")"
cp -- "$source_js" "$legacy"
for assetroot in "public/plugin_assets/$plugin" "public/assets/plugin_assets/$plugin"; do
  if [ -d "$assetroot" ]; then
    find "$assetroot" -type f \( -name 'done_ratio_step.js' -o -name 'done_ratio_step-*.js' \) -print0 > "$work/assets.list"
    while IFS= read -r -d '' asset; do
      cp -- "$source_js" "$asset"
      if [ -f "$asset.gz" ]; then gzip -c "$asset" > "$asset.gz"; fi
      if [ -f "$asset.br" ]; then rm -- "$asset.br"; fi
      cmp -- "$source_js" "$asset"
    done < "$work/assets.list"
  fi
done

cat > "$work/verify.rb" <<'RUBY'
init = Rails.root.join('plugins/redmine_done_ratio_step/init.rb')
expected = init.read[/^\s*version\s+['"]([^'"]+)['"]/, 1]
plugin = Redmine::Plugin.find(:redmine_done_ratio_step)
abort "Unexpected registry version: #{plugin.version}" unless expected && plugin.version.to_s == expected
puts "REGISTRY OK: #{plugin.id} #{plugin.version}"
path = ApplicationController.helpers.javascript_path('plugin_assets/redmine_done_ratio_step/done_ratio_step')
puts "ASSET_PATH=#{path}"
RUBY

RAILS_ENV=production bundle exec rails runner "$work/verify.rb" | tee "$work/verify.log"
grep -q '^REGISTRY OK: redmine_done_ratio_step ' "$work/verify.log"
asset_path=$(sed -n 's/^ASSET_PATH=//p' "$work/verify.log")
if [[ ! "$asset_path" =~ ^/(assets/)?plugin_assets/redmine_done_ratio_step/(javascripts/)?done_ratio_step(-[0-9a-fA-F]+)?\.js$ ]]; then
  echo "ERROR: Unexpected Rails asset URL: $asset_path" >&2
  exit 1
fi

# No migrations. Refresh the existing Passenger application after the file swap.
touch tmp/restart.txt
curl -fsSL --compressed --max-time 45 -H 'Cache-Control: no-cache' \
  "$url$asset_path?verify=$stamp" -o "$work/served.js"
expected_sha=$(sha256sum "$source_js" | cut -d ' ' -f 1)
served_sha=$(sha256sum "$work/served.js" | cut -d ' ' -f 1)
printf 'Asset: %s\nExpected SHA-256: %s\nServed SHA-256:   %s\n' "$asset_path" "$expected_sha" "$served_sha"
test "$served_sha" = "$expected_sha"
if [ -f log/production.log ]; then
  echo "Redmine log: $root/log/production.log"
fi
echo "SUCCESS: $action completed on production and HTTP serves the expected JavaScript"
