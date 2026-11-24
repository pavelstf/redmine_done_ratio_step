# frozen_string_literal: true

require 'json'

module Redmine
  module Hook
    class ViewListener
      def javascript_include_tag(name, plugin:)
        "asset:#{plugin}/#{name}\n"
      end

      def javascript_tag(script)
        script
      end
    end
  end
end

module Setting
  class << self
    attr_accessor :plugin_redmine_done_ratio_step
  end
end

class ContextMenuView
  def context_menu_link(label, href, options = {})
    raise 'Expected a selected native menu item' unless href == '#' && options == {selected: true}

    "<a href=\"#\" class=\"icon disabled\" onclick=\"return false;\">#{label}</a>"
  end

  def content_tag(name, contents, data: {})
    marker = data.fetch(:done_ratio_step_current, false) ? ' data-done-ratio-step-current="true"' : ''
    "<#{name}#{marker}>#{contents}</#{name}>"
  end
end

require_relative '../../lib/redmine_done_ratio_step/hooks'

hooks = RedmineDoneRatioStep::Hooks.new
controller = Struct.new(:controller_path)
issue = Struct.new(:done_ratio).new(15)
Setting.plugin_redmine_done_ratio_step = {'enabled' => '1', 'step' => '25'}

%w[issues my versions gantts calendars].each do |name|
  html = hooks.view_layouts_base_html_head(controller: controller.new(name))
  raise "Missing asset on #{name}" unless html.include?('asset:redmine_done_ratio_step/done_ratio_step')
  raise "Wrong configuration on #{name}" unless html.include?('{"enabled":true,"step":25}')
end

%w[repositories settings welcome].each do |name|
  raise "Unrelated controller loaded the asset: #{name}" unless
    hooks.view_layouts_base_html_head(controller: controller.new(name)).empty?
end
raise 'Missing controller should skip the asset' unless hooks.view_layouts_base_html_head.empty?
raise 'Stored issue percentage missing' unless
  hooks.view_issues_form_details_bottom(issue: issue).include?('window.DoneRatioStepCurrentDoneRatio = 15;')

off_grid = Struct.new(:done_ratio).new(17)
menu_context = {issues: [off_grid], can: {edit: true}, hook_caller: ContextMenuView.new}
menu = hooks.view_issues_context_menu_end(menu_context)
raise 'Missing inert native selected entry' unless
  menu == '<template data-done-ratio-step-current="true"><li><a href="#" class="icon disabled" onclick="return false;">17%</a></li></template>'
raise 'Multi-issue menu received a saved percentage' unless
  hooks.view_issues_context_menu_end(menu_context.merge(issues: [off_grid, issue])).empty?
raise 'Read-only menu received a saved percentage' unless
  hooks.view_issues_context_menu_end(menu_context.merge(can: {edit: false})).empty?

Setting.plugin_redmine_done_ratio_step = {'enabled' => '0', 'step' => '25'}
raise 'Disabled plugin loaded the asset' unless
  hooks.view_layouts_base_html_head(controller: controller.new('issues')).empty?
raise 'Disabled plugin emitted an inline fallback' unless
  hooks.view_issues_form_details_bottom(issue: issue).empty?
raise 'Disabled plugin emitted a context-menu template' unless
  hooks.view_issues_context_menu_end(menu_context).empty?

puts 'PASS: asset scope, form fallback, single-issue native menu template, multiple issues, read-only and disabled hooks'
