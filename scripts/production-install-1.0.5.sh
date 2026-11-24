#!/usr/bin/env bash
clear
set -eo pipefail
source /home/gcrbgcaa/rubyvenv/redmine612build/3.2/bin/activate
set -u
cd /home/gcrbgcaa/redmine
plugin=redmine_done_ratio_step
zip=plugins/redmine_done_ratio_step-1.0.5-production-20261124.zip
printf '%s  %s\n' cf2aaaa53b92a5e01b85450adc9ee67bb1ac4800d4b9e15ff04ce2027198da16 "$zip" | sha256sum -c -
test -f "plugins/$plugin/init.rb"
test ! -L "plugins/$plugin"
work=$(mktemp -d /tmp/done-ratio-step-install.XXXXXXXX)
unzip -q "$zip" -d "$work"
grep -Fq "version '1.0.5'" "$work/$plugin/init.rb"
ruby -c "$work/$plugin/init.rb"
ruby -c "$work/$plugin/lib/$plugin/hooks.rb"
backup="/home/gcrbgcaa/redmine/plugins/$plugin-production-backup-$(date +%Y%m%d-%H%M%S)-$$.tar.gz"
tar -czf "$backup" -C plugins "$plugin"
printf '%s\n' "$backup" > "plugins/$plugin-production-last-backup.txt"
echo "Backup: $backup"
mv "plugins/$plugin" "$work/previous"
cp -a "$work/$plugin" "plugins/$plugin"

# Refresh ordinary assets and any existing fingerprinted copies used by manifests.
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
cmp "plugins/$plugin/assets/javascripts/done_ratio_step.js" "public/plugin_assets/$plugin/javascripts/done_ratio_step.js"
cat > "$work/verify.rb" <<'RUBY'
plugin = Redmine::Plugin.find(:redmine_done_ratio_step)
abort "Unexpected plugin version: #{plugin.version}" unless plugin.version.to_s == '1.0.5'
puts "REGISTRY OK: #{plugin.id} #{plugin.version}"
RUBY
RAILS_ENV=production bundle exec rails runner "$work/verify.rb"
# No database migrations or new gem dependencies exist in this plugin.
touch tmp/restart.txt
if [ -f log/production.log ]; then tail -n 60 log/production.log; fi
ls -lt plugins/redmine_done_ratio_step-production-backup-*.tar.gz | head -n 5
rm -rf -- "$work"
echo 'SUCCESS: redmine_done_ratio_step 1.0.5 installed on production; browser validation pending'
