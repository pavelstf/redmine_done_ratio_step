#!/usr/bin/env bash
clear
set -eo pipefail
source /home/gcrbgcaa/rubyvenv/redmine612build/3.2/bin/activate
set -u
cd /home/gcrbgcaa/redmine
plugin=redmine_done_ratio_step
backup=$(cat "plugins/$plugin-production-last-backup.txt")
case "$backup" in
  /home/gcrbgcaa/redmine/plugins/redmine_done_ratio_step-production-backup-*.tar.gz) ;;
  *) echo 'ERROR: Unexpected backup path'; exit 1 ;;
esac
test -f "$backup"
test -d "plugins/$plugin"
test ! -L "plugins/$plugin"
work=$(mktemp -d /tmp/done-ratio-step-rollback.XXXXXXXX)
tar -xzf "$backup" -C "$work"
test -f "$work/$plugin/init.rb"
ruby -c "$work/$plugin/init.rb"
rescue="/home/gcrbgcaa/redmine/plugins/$plugin-production-before-rollback-$(date +%Y%m%d-%H%M%S)-$$.tar.gz"
tar -czf "$rescue" -C plugins "$plugin"
echo "Restoring: $backup"
echo "Current code preserved: $rescue"
mv "plugins/$plugin" "$work/replaced"
cp -a "$work/$plugin" "plugins/$plugin"
mkdir -p "public/plugin_assets/$plugin/javascripts"
cp -a "plugins/$plugin/assets/javascripts/." "public/plugin_assets/$plugin/javascripts/"
for assetroot in "public/plugin_assets/$plugin" "public/assets/plugin_assets/$plugin"; do
  if [ -d "$assetroot" ]; then
    find "$assetroot" -type f \( -name 'done_ratio_step.js' -o -name 'done_ratio_step-*.js' \) -print0 > "$work/assets.list"
    while IFS= read -r -d '' asset; do
      cp "plugins/$plugin/assets/javascripts/done_ratio_step.js" "$asset"
      if [ -f "$asset.gz" ]; then gzip -c "$asset" > "$asset.gz"; fi
      if [ -f "$asset.br" ]; then rm -- "$asset.br"; fi
    done < "$work/assets.list"
  fi
done
cat > "$work/verify.rb" <<'RUBY'
restored = File.read(File.join(Rails.root, 'plugins/redmine_done_ratio_step/init.rb'))[/version\s+['"]([^'"]+)/, 1]
plugin = Redmine::Plugin.find(:redmine_done_ratio_step)
abort 'Restored version mismatch' unless plugin.version.to_s == restored
puts "REGISTRY OK: #{plugin.id} #{plugin.version}"
RUBY
RAILS_ENV=production bundle exec rails runner "$work/verify.rb"
touch tmp/restart.txt
if [ -f log/production.log ]; then tail -n 60 log/production.log; fi
ls -lt plugins/redmine_done_ratio_step-production-backup-*.tar.gz | head -n 5
rm -rf -- "$work"
echo 'SUCCESS: redmine_done_ratio_step rollback restored on production; browser validation pending'
