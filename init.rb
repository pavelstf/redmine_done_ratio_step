# frozen_string_literal: true

require_relative 'lib/redmine_done_ratio_step/hooks'

Redmine::Plugin.register :redmine_done_ratio_step do
  name 'Done Ratio Step (Percent Complete)'
  author 'PAvcho'
  description 'UI-only plugin: changes the % Done (done_ratio) dropdown step to 5% (configurable).'
  version '1.0.4'
  url ''
  author_url ''

  requires_redmine version_or_higher: '4.2.0'

  settings default: {
    'enabled' => '1',
    'step' => '5'
  }, partial: 'settings/done_ratio_step_settings'
end
