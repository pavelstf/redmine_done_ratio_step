# frozen_string_literal: true

module RedmineDoneRatioStep
  class Hooks < Redmine::Hook::ViewListener
    ISSUE_CONTROLLERS = %w[issues my versions gantts calendars].freeze

    # Inject plugin JS + global config
    def view_layouts_base_html_head(context = {})
      return '' unless ISSUE_CONTROLLERS.include?(context[:controller]&.controller_path)

      settings = plugin_settings
      return '' unless enabled?(settings)

      step = settings['step'].to_i
      step = 5 if step <= 0
      step = 25 if step > 25

      cfg = { enabled: true, step: step }

      javascript_include_tag('done_ratio_step', plugin: 'redmine_done_ratio_step') +
        javascript_tag("window.DoneRatioStepConfig = #{cfg.to_json};")
    end

    # Preserve non-standard stored values (e.g., 15%) in issue edit form
    def view_issues_form_details_bottom(context = {})
      issue = context[:issue]
      return '' unless issue && enabled?(plugin_settings)

      value = issue.done_ratio.to_i
      javascript_tag(<<~JS)
        (function () {
          var select = document.getElementById('issue_done_ratio');
          if (select) {
            select.setAttribute('data-done-ratio-current', '#{value}');
          }
          window.DoneRatioStepCurrentDoneRatio = #{value};
        })();
      JS
    end

    # Redmine's native menu omits the current value when it is outside its interval.
    def view_issues_context_menu_end(context = {})
      issues = context[:issues]
      return '' unless issues&.size == 1 && context.dig(:can, :edit) && enabled?(plugin_settings)

      value = issues.first.done_ratio
      return '' unless value.is_a?(Integer) && (0..100).cover?(value)

      view = context[:hook_caller]
      return '' unless view.respond_to?(:context_menu_link)

      selected = view.context_menu_link("#{value}%", '#', selected: true)
      view.content_tag(:template, view.content_tag(:li, selected), data: {done_ratio_step_current: true})
    end

    private

    def plugin_settings
      Setting.plugin_redmine_done_ratio_step || {}
    end

    def enabled?(settings)
      settings['enabled'].to_s == '1'
    end
  end
end
